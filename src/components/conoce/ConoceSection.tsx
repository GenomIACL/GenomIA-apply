import { useRef } from 'react';
import type { ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { CONOCE_ID } from '../hero/Scrolltosection.ts';
import './ConoceSection.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Step = { when: string; title: string; text: string; icon: ReactNode };

// Recorrido del participante, alineado al cronograma de 24 meses. Íconos: Lucide.
const STEPS: Step[] = [
  {
    when: 'Meses 1–6',
    title: 'Realiza tu postulación',
    text: 'Completa el formulario en ~10 minutos. Recibimos postulaciones hasta llegar a 2000 inscritos.',
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6M22 11h-6" />
      </>
    ),
  },
  {
    when: '2–4 semanas',
    title: 'Recibe el correo de selección',
    text: 'Si quedas entre los 250 seleccionados, te escribimos para agendar tu visita.',
    icon: (
      <>
        <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        <path d="m16 19 2 2 4-4" />
      </>
    ),
  },
  {
    when: '30 minutos',
    title: 'Ve al laboratorio a muestrearte',
    text: "Firmas el consentimiento y te tomamos una muestra de sangre en O'Higgins o la RM.",
    icon: (
      <>
        <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2" />
        <path d="M8.5 2h7M14.5 16h-5" />
      </>
    ),
  },
  {
    when: 'Meses 6–13',
    title: 'Secuenciamos tu genoma',
    text: 'Leemos tu genoma completo a 30X y construimos la plataforma con IA en español.',
    icon: (
      <>
        <path d="M2 15c6.667-6 13.333 0 20-6" />
        <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
        <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
        <path d="m17 6-2.891-2.891M7 18l2.891 2.891M16.5 10.5l1 1M6.5 12.5l1 1M10 16l1.5 1.5M14 8l-1.5-1.5" />
      </>
    ),
  },
  {
    when: 'Mes 14',
    title: 'Revisa tu primer reporte',
    text: 'Accedes a la v1 por módulos con tu código y correo.',
    icon: (
      <>
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <path d="m9 10 2 2 4-4M12 17v4M8 21h8" />
      </>
    ),
  },
  {
    when: 'Meses 14–24',
    title: 'Mejóralo con nosotros',
    text: 'Encuestas cortas y nuevas versiones del reporte. Tu acceso sigue después del mes 24.',
    icon: (
      <>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
      </>
    ),
  },
];

// Arcos alternados entre pasos, como la curva de la referencia.
const ARC_UP = 'M0 30 C 90 -6, 210 -6, 300 30';
const ARC_DOWN = 'M0 30 C 90 66, 210 66, 300 30';

export default function ConoceSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(sectionRef);
      const mm = gsap.matchMedia();

      // El scroll dibuja cada tramo y enciende el paso siguiente. Sin JS o con reduced motion, todo queda encendido.
      mm.add(
        {
          wide: '(min-width: 861px) and (prefers-reduced-motion: no-preference)',
          narrow: '(max-width: 860px) and (prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const { wide } = context.conditions as { wide: boolean };
          const steps = q('.conoce__step');
          const links = q('.conoce__link-fill');
          const hidden = wide ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 100% 0%)';

          gsap.set(steps.slice(1), { '--lit': 0 });
          gsap.set(links, { clipPath: hidden });

          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: q('.conoce__steps')[0],
              start: 'top 70%',
              end: 'bottom 55%',
              scrub: 0.6,
            },
          });
          steps.slice(1).forEach((step, i) => {
            tl.to(links[i], { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }).to(step, { '--lit': 1, duration: 0.4 });
          });
        },
      );

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id={CONOCE_ID} className="conoce" aria-labelledby="conoce-title">
      <header className="conoce__head">
        <span className="conoce__pill">Conoce</span>
        <h2 id="conoce-title" className="conoce__title">
          ¿Cómo funciona GenomIA?
        </h2>
        <p className="conoce__lede">
          Un proyecto de 24 meses, desde tu postulación hasta un reporte que mejora contigo. Este es tu
          recorrido:
        </p>
      </header>

      <ol className="conoce__steps">
        {STEPS.map((step, i) => (
          <li key={step.title} className="conoce__step">
            <div className="conoce__dot">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {step.icon}
              </svg>
              <span className="conoce__num" aria-hidden="true">
                {i + 1}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span className={`conoce__link${i % 3 === 2 ? ' conoce__link--wrap' : ''}`} aria-hidden="true">
                <svg viewBox="0 0 300 60" preserveAspectRatio="none">
                  <path d={i % 2 ? ARC_DOWN : ARC_UP} />
                </svg>
                <span className="conoce__link-fill">
                  <svg viewBox="0 0 300 60" preserveAspectRatio="none">
                    <path d={i % 2 ? ARC_DOWN : ARC_UP} />
                  </svg>
                </span>
              </span>
            )}
            <span className="conoce__when">{step.when}</span>
            <h3 className="conoce__step-title">{step.title}</h3>
            <p className="conoce__text">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
