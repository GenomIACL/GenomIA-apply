import { useEffect, useRef, useState, type FormEvent } from 'react';
import { SECTIONS, countWords } from '../../questions';
import './ApplyDialog.css';

/** Any `<a href="#postula">` opens this dialog. */
export const APPLY_HASH = '#postula';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const ENDPOINT = '/.netlify/functions/postular';

type User = { sub: string; email: string; name?: string };
type Answers = Record<string, string>;
type Step = 'login' | 'checking' | 'done' | number;

let gisScript: Promise<void> | undefined;
const loadGis = () =>
  (gisScript ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gisScript = undefined;
      reject(new Error('gsi'));
    };
    document.head.append(script);
  }));

/** Display only: the server verifies the token before trusting any of this. */
function readToken(credential: string): User {
  const base64 = credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

async function api(body: object): Promise<{ status: number; data: Record<string, unknown> }> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { status: res.status, data: await res.json().catch(() => ({})) };
  } catch {
    return { status: 0, data: {} };
  }
}

const draftKey = (sub: string) => `genomia-draft:${sub}`;

function readDraft(sub: string): { answers: Answers; section: number } | null {
  try {
    return JSON.parse(localStorage.getItem(draftKey(sub)) ?? 'null');
  } catch {
    return null;
  }
}

function writeDraft(sub: string, draft: { answers: Answers; section: number } | null) {
  try {
    if (draft) localStorage.setItem(draftKey(sub), JSON.stringify(draft));
    else localStorage.removeItem(draftKey(sub));
  } catch {
    // Private mode or blocked storage: the form still works, just without a draft.
  }
}

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function ApplyDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('login');
  const [credential, setCredential] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [notice, setNotice] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState({ date: '', already: false });

  // Open on #postula, so every "Postula" link is a plain anchor.
  useEffect(() => {
    const sync = () => {
      const dialog = dialogRef.current;
      if (window.location.hash !== APPLY_HASH || !dialog || dialog.open) return;
      dialog.showModal();
      setOpen(true);
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  useEffect(() => {
    if (!open || step !== 'login') return;
    if (!CLIENT_ID) {
      setNotice('Falta configurar VITE_GOOGLE_CLIENT_ID.');
      return;
    }

    let cancelled = false;
    loadGis().then(
      () => {
        const gis = window.google?.accounts.id;
        if (cancelled || !gis || !googleButtonRef.current) return;
        gis.initialize({ client_id: CLIENT_ID, callback: ({ credential }) => void signIn(credential) });
        gis.renderButton(googleButtonRef.current, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          locale: 'es',
          // Never wider than the card, so it stays centered on narrow phones.
          width: Math.max(200, Math.min(280, googleButtonRef.current.clientWidth || 280)),
        });
      },
      () => !cancelled && setNotice('No pudimos cargar Google. Revisa tu conexión e inténtalo de nuevo.'),
    );
    return () => {
      cancelled = true;
    };
  }, [open, step]);

  useEffect(() => {
    if (user && typeof step === 'number') writeDraft(user.sub, { answers, section: step });
  }, [user, answers, step]);

  useEffect(() => {
    if (typeof step !== 'number') return;
    bodyRef.current?.scrollTo({ top: 0 });
    headingRef.current?.focus();
  }, [step]);

  async function signIn(token: string) {
    const signedIn = readToken(token);
    setCredential(token);
    setUser(signedIn);
    setNotice('');
    setStep('checking');

    const { status, data } = await api({ credential: token });
    if (status === 200 && data.applied) {
      setResult({ date: String(data.date ?? ''), already: true });
      setStep('done');
    } else if (status === 200) {
      const draft = readDraft(signedIn.sub);
      setAnswers(draft?.answers ?? {});
      setStep(Math.min(draft?.section ?? 0, SECTIONS.length - 1));
    } else {
      setNotice(
        status === 401
          ? 'Google no validó tu sesión. Inténtalo de nuevo.'
          : 'No pudimos conectarnos. Inténtalo de nuevo en unos minutos.',
      );
      setStep('login');
    }
  }

  function switchAccount() {
    window.google?.accounts.id.disableAutoSelect();
    setUser(null);
    setCredential('');
    setNotice('');
    setStep('login');
  }

  async function onSectionSubmit(event: FormEvent) {
    event.preventDefault();
    if (typeof step !== 'number' || !user) return;
    if (step < SECTIONS.length - 1) {
      setStep(step + 1);
      return;
    }

    setSending(true);
    setNotice('');
    const { status, data } = await api({ credential, answers });
    setSending(false);

    if (status === 201 || status === 409) {
      writeDraft(user.sub, null);
      setResult({ date: String(data.date ?? ''), already: status === 409 });
      setStep('done');
    } else if (status === 401) {
      // ID tokens last an hour; the draft keeps the answers across re-login.
      setNotice('Tu sesión expiró. Vuelve a ingresar con Google: tus respuestas quedaron guardadas.');
      setStep('login');
    } else {
      setNotice(String(data.error ?? 'No pudimos enviar tu postulación. Inténtalo de nuevo.'));
    }
  }

  const close = () => dialogRef.current?.close();
  const section = typeof step === 'number' ? SECTIONS[step] : null;

  return (
    <dialog
      ref={dialogRef}
      className="apply"
      aria-labelledby="apply-title"
      onClose={() => {
        setOpen(false);
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }}
      onClick={(event) => event.target === dialogRef.current && close()}
    >
      <div className="apply__panel">
        <header className="apply__header">
          <div>
            <h2 id="apply-title" className="apply__title">
              Postula a GenomIA
            </h2>
          </div>
          <button className="apply__close" type="button" aria-label="Cerrar postulación" onClick={close}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {user && step !== 'login' && (
          <p className="apply__account">
            Postulando como <strong>{user.email}</strong>
            <button type="button" className="apply__link" onClick={switchAccount}>
              Cambiar cuenta
            </button>
          </p>
        )}

        {section && (
          <div className="apply__progress">
            <span>
              Sección {(step as number) + 1} de {SECTIONS.length}
            </span>
            <span>{section.title}</span>
            <span
              className="apply__bar"
              role="progressbar"
              aria-label="Progreso de la postulación"
              aria-valuemin={1}
              aria-valuemax={SECTIONS.length}
              aria-valuenow={(step as number) + 1}
            >
              <span style={{ transform: `scaleX(${((step as number) + 1) / SECTIONS.length})` }} />
            </span>
          </div>
        )}

        <div ref={bodyRef} className="apply__body">
          {notice && (
            <p className="apply__notice" role="alert">
              {notice}
            </p>
          )}

          {step === 'login' && (
            <div className="apply__login">
              <p>
                GenomIA es una plataforma web que entrega a cada persona un reporte genómico comprensible e
                interactivo, asistido por inteligencia artificial y contextualizado con datos de la población
                chilena.
              </p>

              <p className="apply__lead">
                Para postular, ingresa con tu cuenta de Google. La usamos solo para identificarte y asegurar una
                postulación por persona.
              </p>

              <div className="apply__cta">
                <div ref={googleButtonRef} className="apply__google" />
              </div>
            </div>
          )}

          {step === 'checking' && (
            <p className="apply__status" role="status">
              Revisando tu postulación…
            </p>
          )}

          {step === 'done' && (
            <div className="apply__done" role="status">
              <h3 className="apply__done-title">
                {result.already ? 'Ya recibimos tu postulación' : '¡Postulación enviada!'}
              </h3>
              <p>
                {result.already
                  ? `Postulaste${result.date ? ` el ${formatDate(result.date)}` : ''}. Solo se acepta una postulación por persona.`
                  : 'Gracias por postular a GenomIA. Te escribiremos a tu correo si quedas seleccionado/a.'}
              </p>
              <button type="button" className="apply__primary" onClick={close}>
                Cerrar
              </button>
            </div>
          )}

          {section && (
            <form className="apply__form" onSubmit={onSectionSubmit}>
              <h3 ref={headingRef} className="apply__section-title" tabIndex={-1}>
                {section.title}
              </h3>

              {section.questions.map((q) =>
                q.options ? (
                  <fieldset key={q.id} className="apply__question">
                    <legend>{q.text}</legend>
                    <div className="apply__options">
                      {q.options.map((option) => (
                        <label key={option} className="apply__option">
                          <input
                            type="radio"
                            name={q.id}
                            value={option}
                            required
                            checked={answers[q.id] === option}
                            onChange={() => setAnswers((a) => ({ ...a, [q.id]: option }))}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ) : (
                  <label key={q.id} className="apply__question apply__question--text">
                    <span className="apply__legend">
                      {q.text}
                      {q.maxWords && <small> (máximo {q.maxWords} palabras)</small>}
                    </span>
                    <textarea
                      rows={5}
                      required
                      maxLength={2000}
                      value={answers[q.id] ?? ''}
                      placeholder="Escribe aquí tu respuesta…"
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                      ref={(el) =>
                        el?.setCustomValidity(
                          q.maxWords && countWords(el.value) > q.maxWords
                            ? `Usa como máximo ${q.maxWords} palabras.`
                            : '',
                        )
                      }
                    />
                    {q.maxWords && (
                      <small className="apply__count" aria-live="polite">
                        {countWords(answers[q.id] ?? '')} / {q.maxWords} palabras
                      </small>
                    )}
                  </label>
                ),
              )}

              <div className="apply__actions">
                {(step as number) > 0 && (
                  <button type="button" className="apply__secondary" onClick={() => setStep((step as number) - 1)}>
                    Anterior
                  </button>
                )}
                <button type="submit" className="apply__primary" disabled={sending}>
                  {step === SECTIONS.length - 1 ? (sending ? 'Enviando…' : 'Postular') : 'Continuar'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </dialog>
  );
}