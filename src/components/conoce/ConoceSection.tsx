import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import genomin from '../../assets/conoce/genomin-conoce.webp';
import { CONOCE_ID } from '../hero/Scrolltosection.ts';
import './ConoceSection.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Los plazos viven en el encabezado de cada fase, no en los pasos.
type Step = { title: string; text: string };
type Phase = { name: string; barLabel: string; range: string; months: number; steps: Step[] };

// Recorrido del participante, alineado al cronograma de 24 meses y agrupado en tres fases.
const PHASES: Phase[] = [
  {
    name: 'Postúlate',
    barLabel: 'Postúlate',
    range: 'Del mes 1 al 6',
    months: 6,
    steps: [
      {
        title: 'Realiza tu postulación',
        text: 'Completa el formulario en ~10 minutos. Recibimos postulaciones hasta llegar a 2000 inscritos.',
      },
      {
        title: 'Recibe el correo de selección',
        text: 'Si quedas entre los 250 seleccionados, te escribimos para agendar tu visita.',
      },
    ],
  },
  {
    name: 'Muestra y secuenciación',
    barLabel: 'Muestra',
    range: 'Del mes 6 al 13',
    months: 7,
    steps: [
      {
        title: 'Ve al laboratorio a muestrearte',
        text: "Firmas el consentimiento y te tomamos una muestra de sangre en O'Higgins o la RM.",
      },
      {
        title: 'Secuenciamos tu genoma',
        text: 'Leemos tu genoma completo a 30X y construimos la plataforma con IA en español.',
      },
    ],
  },
  {
    name: 'Tu reporte',
    barLabel: 'Reporte',
    range: 'Del mes 14 al 24',
    months: 11,
    steps: [
      {
        title: 'Revisa tu primer reporte',
        text: 'Accedes a la v1 por módulos con tu código y correo.',
      },
      {
        title: 'Mejóralo con nosotros',
        text: 'Encuestas cortas y nuevas versiones del reporte. Tu acceso sigue después del mes 24.',
      },
    ],
  },
];

export default function ConoceSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(sectionRef);
      const mm = gsap.matchMedia();

      // El recorrido avanza con el scroll: la barra de 24 meses se llena por fase, el riel se llena y cada
      // paso se enciende al cruzar la línea de lectura. Con reduced motion todo queda visible desde el inicio.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const track = q('.conoce__track')[0];
        track.classList.add('conoce__track--live');

        gsap.fromTo(
          q('.conoce__bar-fill'),
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.1,
            ease: 'expo.out',
            stagger: 0.15,
            scrollTrigger: { trigger: q('.conoce__bar')[0], start: 'top 85%', once: true },
          },
        );

        gsap.fromTo(
          q('.conoce__rail-fill'),
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: track, start: 'top 60%', end: 'bottom 60%', scrub: 0.4 },
          },
        );

        q('.conoce__step').forEach((step) =>
          ScrollTrigger.create({
            trigger: step,
            start: 'top 60%',
            end: 'max',
            toggleClass: { targets: step, className: 'is-lit' },
          }),
        );

        return () => track.classList.remove('conoce__track--live');
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id={CONOCE_ID} className="conoce" aria-labelledby="conoce-title">
      <div className="conoce__main">
        <header className="conoce__head">
          <h2 id="conoce-title" className="conoce__title">
            ¿Cómo funciona GenomIA?
          </h2>
          <p className="conoce__lede">
            Un proyecto de 24 meses, desde tu postulación hasta un reporte que mejora contigo. Este es
            tu recorrido:
          </p>
        </header>

        <div
          className="conoce__bar"
          role="img"
          aria-label="Proyecto de 24 meses: postúlate del mes 1 al 6, muestra y secuenciación del mes 6 al 13, tu reporte del mes 14 al 24."
        >
          {PHASES.map((phase) => (
            <div key={phase.name} className="conoce__bar-seg" style={{ flexGrow: phase.months }}>
              <span className="conoce__bar-fill" />
              <span className="conoce__bar-label">{phase.barLabel}</span>
            </div>
          ))}
        </div>

        <div className="conoce__track">
          <span className="conoce__rail" aria-hidden="true">
            <span className="conoce__rail-fill" />
          </span>
          <ol className="conoce__phases">
            {PHASES.map((phase) => (
              <li key={phase.name} className="conoce__phase">
                <h3 className="conoce__phase-head">
                  <span className="conoce__phase-name">{phase.name}</span>
                  <span className="conoce__phase-range">{phase.range}</span>
                </h3>
                <ol className="conoce__steps">
                  {phase.steps.map((step) => (
                    <li key={step.title} className="conoce__step">
                      <h4 className="conoce__step-title">{step.title}</h4>
                      <p className="conoce__text">{step.text}</p>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <figure className="conoce__figure">
        <img
          src={genomin}
          alt="Genomin, la mascota de GenomIA, mirando su teléfono."
          width={1000}
          height={806}
          loading="lazy"
          decoding="async"
        />
      </figure>
    </section>
  );
}
