import { JWT, OAuth2Client } from 'google-auth-library';
import { QUESTIONS, validateAnswers } from '../../src/questions.ts';

/*
 * POST { credential }           → { applied: false } | { applied: true, date }
 * POST { credential, answers }  → 201 | 409 (already applied) | 400 | 401
 *
 * `credential` is the Google ID token from the browser; it is verified here, so
 * the applicant's identity (the `sub` column) can't be forged. The sheet is the
 * only store: row 1 holds the column ids, every other row is one application.
 */

const env = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
};

const FIXED_COLUMNS = ['fecha', 'sub', 'email', 'nombre'];
const SHEETS = 'https://sheets.googleapis.com/v4/spreadsheets';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

async function verify(credential: unknown) {
  if (typeof credential !== 'string') return null;
  try {
    const ticket = await new OAuth2Client().verifyIdToken({
      idToken: credential,
      audience: env('VITE_GOOGLE_CLIENT_ID'),
    });
    const payload = ticket.getPayload();
    return payload?.email && payload.email_verified ? payload : null;
  } catch {
    return null;
  }
}

function sheets() {
  const client = new JWT({
    email: env('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
    // Netlify stores the PEM on one line with literal "\n".
    key: env('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const base = `${SHEETS}/${env('SHEET_ID')}/values`;

  return {
    // ponytail: reads the whole first tab per request; fine for thousands of rows.
    read: async () =>
      (await client.request<{ values?: string[][] }>({ url: `${base}/A:ZZ` })).data.values ?? [],
    writeHeader: (header: string[]) =>
      client.request({
        url: `${base}/A1?valueInputOption=RAW`,
        method: 'PUT',
        data: { values: [header] },
      }),
    append: (row: string[]) =>
      client.request({
        // RAW keeps answers like "=HYPERLINK(...)" as plain text, never formulas.
        url: `${base}/A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
        method: 'POST',
        data: { values: [row] },
      }),
  };
}

export default async (req: Request) => {
  if (req.method !== 'POST') return json(405, { error: 'Método no permitido' });

  let body: { credential?: unknown; answers?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'JSON inválido' });
  }

  const user = await verify(body.credential);
  if (!user) return json(401, { error: 'Sesión de Google inválida o expirada' });

  const sheet = sheets();
  const [header = [], ...rows] = await sheet.read();
  const existing = rows.find((row) => row[header.indexOf('sub')] === user.sub);

  if (existing) {
    const date = existing[header.indexOf('fecha')] ?? '';
    return body.answers === undefined
      ? json(200, { applied: true, date })
      : json(409, { error: 'Ya postulaste', date });
  }
  if (body.answers === undefined) return json(200, { applied: false });

  if (typeof body.answers !== 'object' || body.answers === null) {
    return json(400, { error: 'Respuestas inválidas' });
  }
  const answers = body.answers as Record<string, unknown>;
  const invalid = validateAnswers(answers);
  if (invalid) return json(400, { error: invalid });

  // New questions become new columns at the end; existing columns never move.
  const missing = [...FIXED_COLUMNS, ...QUESTIONS.map((q) => q.id)].filter(
    (column) => !header.includes(column),
  );
  const columns = [...header, ...missing];
  if (missing.length) await sheet.writeHeader(columns);

  const record: Record<string, string> = {
    fecha: new Date().toISOString(),
    sub: user.sub,
    email: user.email!,
    nombre: user.name ?? '',
  };
  // Only known ids: extra keys like "sub" must not overwrite the verified columns.
  for (const q of QUESTIONS) record[q.id] = answers[q.id] as string;
  // ponytail: check-then-append isn't atomic; two simultaneous submits by the
  // same person could both land. Acceptable at this volume; dedupe in the sheet.
  await sheet.append(columns.map((column) => record[column] ?? ''));

  return json(201, { applied: true, date: record.fecha });
};
