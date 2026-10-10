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

const DRAFT_VERSION = 5;

function readDraft(sub: string): { answers: Answers; section: number; version: number } | null {
  try {
    const draft = JSON.parse(localStorage.getItem(draftKey(sub)) ?? 'null');
    if (draft?.version === DRAFT_VERSION) return draft;
    if (![2, 3, 4].includes(draft?.version)) return null;

    const answers: Answers = { ...draft.answers };
    delete answers.elegibilidad_sin_diagnostico;
    delete answers.elegibilidad_sin_tratamiento;
    delete answers.elegibilidad_enfermedad;

    const section = draft.version === 3
      ? Math.min(draft.section + 1, SECTIONS.length - 1)
      : draft.version === 2 ? 0 : draft.section;
    return { ...draft, answers, section, version: DRAFT_VERSION };
  } catch {
    return null;
  }
}

function writeDraft(sub: string, draft: { answers: Answers; section: number; version: number } | null) {
  try {
    if (draft) localStorage.setItem(draftKey(sub), JSON.stringify(draft));
    else localStorage.removeItem(draftKey(sub));
  } catch {
    // Private mode or blocked storage: the form still works, just without a draft.
  }
}


function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '');
  const local = digits.startsWith('56') ? digits.slice(2) : digits;
  return local.slice(0, 9);
}


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
  const [result, setResult] = useState({ already: false });

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
    if (user && typeof step === 'number') writeDraft(user.sub, { version: DRAFT_VERSION, answers, section: step });
  }, [user, answers, step]);

  useEffect(() => {
    if (typeof step !== 'number') return;
    bodyRef.current?.scrollTo({ top: 0 });
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (notice) bodyRef.current?.scrollTo({ top: 0 });
  }, [notice]);

  async function signIn(token: string) {
    const signedIn = readToken(token);
    setCredential(token);
    setUser(signedIn);
    setNotice('');
    setStep('checking');

    const { status, data } = await api({ credential: token });
    if (status === 200 && data.applied) {
      setResult({ already: true });
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
      setResult({ already: status === 409 });
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
          <h2 id="apply-title" className="apply__title">
            Postula a GenomIA
          </h2>
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

        {section && typeof step === 'number' && (
          <div className="apply__progress" role="group" aria-label="Progreso de la inscripción">
            {Array.from({ length: SECTIONS.length }, (_, index) => (
              <span
                key={index}
                className={`apply__dot${index < step ? ' is-complete' : ''}${index === step ? ' is-current' : ''}`}
                aria-hidden="true"
              />
            ))}
            <span className="apply__sr-only" aria-live="polite">
              {`${section.title}, paso ${step + 1} de ${SECTIONS.length}`}
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
              <p>GenomIA es un proyecto de la Universidad de O'Higgins, dirigido por el Dr. Alex Di Genova (académico del Instituto de Ciencias de la Ingeniería) y financiado por ANID (concurso IDeA I+D 2026). Busca desarrollar un reporte genómico con un asistente de inteligencia artificial en español, para lo cual reunirá muestras de ADN de 250 personas sanas de Chile.</p>
              <p>En este formulario te preguntaremos si tienes 18 años o más, si te han diagnosticado alguna enfermedad crónica o de relevancia genética y si actualmente estás en tratamiento médico por esa condición.</p>
              <p>Este formulario es una inscripción inicial y toma alrededor de 5 minutos. Si es seleccionado, más adelante podrá leer y firmar en persona el consentimiento informado oficial, que explica el estudio completo. <strong>Su participación es voluntaria.</strong></p>

              <div className="apply__cta">
                <p className="apply__lead">Para comenzar, ingrese con su cuenta de Google. La identidad se verificará para registrar su inscripción.</p>
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
                  ? 'Solo se acepta una postulación por persona.'
                  : 'Gracias por inscribirse. Nos pondremos en contacto con usted vía correo.'}
              </p>
              <button type="button" className="apply__primary" onClick={close}>
                Cerrar
              </button>
            </div>
          )}

          {section && (
            <form className="apply__form" onSubmit={onSectionSubmit}>
              {section.pretitle ? (
                <div className="apply__step-heading">
                  <span className="apply__pretitle">{section.pretitle}</span>
                  <h3 ref={headingRef} className="apply__section-title" tabIndex={-1}>
                    {section.title}
                  </h3>
                </div>
              ) : (
                <h3 ref={headingRef} className="apply__sr-only" tabIndex={-1}>
                  {section.title}
                </h3>
              )}

              {step === 0 && <div className="apply__copy">
                <details><summary>Qué se le solicitará y costos</summary>
                  <p><strong>Qué se le solicitará.</strong> Una muestra de sangre venosa de 4 mL, tomada por personal calificado en un centro de salud sugerido por el proyecto. Si lo autoriza, también un panel de exámenes de sangre sin costo para usted, que incluye hemograma, perfil lipídico, glucosa en ayunas y otros indicadores de riñón, hígado y metabolismo. En ese caso se le informará antes la cantidad de sangre necesaria y las indicaciones de preparación, incluido el ayuno.</p>
                  <p><strong>Costos.</strong> El proyecto cubre todo lo que forma parte del estudio. Consultas, exámenes u otros servicios de salud habituales no los cubre.</p>
                </details>
                <details><summary>Qué recibe y riesgos</summary>
                  <p><strong>Qué recibe.</strong> Un reporte genómico comprensible, interactivo y contextualizado, al que accederá con un código del participante y su correo electrónico. Es poco probable, pero posible, que la información sea útil para su salud o la de su familia. El reporte es educativo e informativo y no constituye un diagnóstico médico. Su participación no le da derechos de propiedad intelectual, participación comercial ni beneficios económicos.</p>
                  <p><strong>Riesgos.</strong> La toma de sangre puede causar molestia en el sitio de la punción y, excepcionalmente, inflamación de la vena, hematomas o infección; en ese caso debe acudir de inmediato a la unidad donde se tomó la muestra. Además, el análisis de su genoma puede revelar riesgos futuros para su salud o la de su familia, e información sensible sobre ascendencia, parentesco, predisposición hereditaria o respuesta a medicamentos.</p>
                </details>
                <details><summary>Confidencialidad y sus derechos</summary>
                  <p><strong>Confidencialidad.</strong> Su información es estrictamente confidencial y se guarda codificada en la Universidad de O'Higgins, conforme a la Ley 21.719. Solo acceden los investigadores, el coordinador del estudio y el comité de ética, de forma anónima o agregada. La inteligencia artificial funciona con procesamiento local y sus datos individuales no se usan para entrenar el modelo.</p>
                  <p><strong>Sus derechos.</strong> Puede retirarse en cualquier momento sin perjuicio. Al retirarse se elimina el vínculo entre su identidad y sus muestras y datos, pero los datos genómicos y las muestras se conservan sin posibilidad de identificarlo y seguirán usándose en este proyecto o en futuros. Tiene derecho a conocer los resultados, agregados e individuales. Todo esto se detalla en el consentimiento oficial.</p>
                </details>
              </div>}
              {step === 3 && <div className="apply__copy"><p>Su información genómica podrá usarse para estudiar variación genética (diferencias naturales del ADN entre personas), ancestría genética (estimación estadística de similitud con poblaciones de referencia; no define identidad cultural ni pertenencia étnica), farmacogenómica (cómo ciertas variantes se relacionan con la respuesta a medicamentos) y salud poblacional (análisis agrupado de la población chilena).</p></div>}
              {section.questions.map((q) =>
                q.conditional && answers[q.conditional.parentId] !== q.conditional.value ? null : q.requiredAcceptance ? (
                  <label key={q.id} className="apply__accept"><input type="checkbox" required checked={answers[q.id] === 'true'} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.checked ? 'true' : 'false' }))} /> <span>{q.text}</span></label>
                ) : q.phone ? (
                  <label key={q.id} className="apply__question apply__question--text">
                    <span className="apply__legend">{q.text}</span>
                    <span className="apply__phone">
                      <span className="apply__phone-prefix" aria-hidden="true">+56</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        required
                        pattern="9[0-9]{8}"
                        maxLength={9}
                        value={answers[q.id]?.startsWith('+56') ? answers[q.id].slice(3) : answers[q.id] ?? ''}
                        onChange={(e) => {
                          const local = normalizePhone(e.target.value);
                          setAnswers((a) => ({ ...a, [q.id]: local ? `+56${local}` : '' }));
                        }}
                        aria-describedby={`${q.id}-help`}
                      />
                    </span>
                    <small id={`${q.id}-help`} className="apply__field-help">
                      Ingresa los 9 dígitos del teléfono móvil, comenzando por 9.
                    </small>
                  </label>
                ) : q.select && q.options ? (
                  <label key={q.id} className="apply__question apply__question--select">
                    <span className="apply__legend">{q.text}</span>
                    <select
                      required
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                    >
                      <option value="" disabled>Selecciona tu región…</option>
                      {q.options.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                ) : q.options ? (
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
                            onChange={() => setAnswers((current) => {
                              const next = { ...current, [q.id]: option };
                              if (q.conditionalQuestion && option !== q.conditionalQuestion.when) {
                                delete next[q.conditionalQuestion.id];
                              }
                              for (const dependent of section.questions) {
                                if (dependent.conditional?.parentId === q.id && option !== dependent.conditional.value) {
                                  delete next[dependent.id];
                                }
                              }
                              return next;
                            })}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                    {q.conditionalQuestion && answers[q.id] === q.conditionalQuestion.when && (
                      <label className="apply__question apply__question--text">
                        <span className="apply__legend">{q.conditionalQuestion.text}</span>
                        <textarea
                          rows={3}
                          required
                          maxLength={2000}
                          value={answers[q.conditionalQuestion.id] ?? ''}
                          placeholder="Escriba aquí su respuesta…"
                          onChange={(event) => setAnswers((current) => ({
                            ...current,
                            [q.conditionalQuestion!.id]: event.target.value,
                          }))}
                        />
                      </label>
                    )}
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
                      maxLength={q.maxWords ? 10000 : 2000}
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
                  {step === SECTIONS.length - 1 ? (sending ? 'Enviando…' : 'Enviar inscripción') : 'Continuar'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </dialog>
  );
}