import { Fragment, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import Arrow from '../ui/Arrow';
import { APPLY_HASH } from '../apply/ApplyDialog';
import { CHILE_PATH, CHILE_VIEWBOX } from './chile';
import './WhatIsGenomiaSection.css';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrambleTextPlugin, SplitText);

const PLAIN = 'Te lo explicamos simple.';
const VERSIONS = ['v1.0', 'v1.1', 'v2.0'];

export default function WhatIsGenomiaSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(sectionRef);
      const once = (trigger: Element, start = 'top 80%') => ({ trigger, start, once: true });
      const mm = gsap.matchMedia();

      // Each block plays its own moment once, as it scrolls in. Reduced motion keeps the final markup.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const title = q('.wig__title')[0];
        gsap.from(SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'wig-line' }).lines, {
          yPercent: 105,
          duration: 1.1,
          stagger: 0.12,
          ease: 'expo.out',
          scrollTrigger: once(title, 'top 85%'),
        });

        // Lenguaje simple: the sentence resolves out of bases, in the reading face.
        const plain = q('.wig__plain')[0];
        gsap
          .timeline({ scrollTrigger: once(plain) })
          .set(plain, { textContent: 'ATGCGTACGTTAGCATGCGTAGC' })
          .to(plain, {
            scrambleText: { text: PLAIN, chars: 'ACGT', revealDelay: 0.5, speed: 0.4 },
            duration: 2.2,
            ease: 'none',
          });

        // Contexto chileno: the outline draws north to south, then the land settles in.
        const outline = q('.wig__chile-path')[0] as unknown as SVGPathElement;
        const length = outline.getTotalLength();
        gsap
          .timeline({ scrollTrigger: once(outline, 'top 75%') })
          .fromTo(
            outline,
            { strokeDasharray: length, strokeDashoffset: length },
            { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut' },
          )
          .from(outline, { fillOpacity: 0, duration: 1 }, '-=0.6')
          .set(outline, { clearProps: 'strokeDasharray,strokeDashoffset' });

        // Evidencia: the rail fills release by release and the version rolls over like a counter.
        const version = q('.wig__version')[0];
        const status = q('.wig__status')[0];
        const steps = q('.wig__step--done');
        const fills = q('.wig__link--done .wig__link-fill');
        version.textContent = VERSIONS[0];
        status.textContent = 'Actualizando…';
        gsap.set(fills, { scaleX: 0 });
        gsap.set(steps.slice(1), { '--lit': 0 });

        const evidence = gsap.timeline({ scrollTrigger: once(version, 'top 85%') });
        VERSIONS.slice(1).forEach((next, i) => {
          const at = 0.3 + i * 0.9;
          evidence
            .to(fills[i], { scaleX: 1, duration: 0.55, ease: 'power2.inOut' }, at)
            .to(steps[i + 1], { '--lit': 1, duration: 0.25 }, at + 0.5)
            .to(version, { yPercent: -110, duration: 0.2, ease: 'power2.in' }, at + 0.4)
            .call(() => void (version.textContent = next), [], at + 0.6)
            .fromTo(
              version,
              { yPercent: 110 },
              { yPercent: 0, duration: 0.5, ease: 'expo.out', immediateRender: false },
              at + 0.6,
            );
        });
        evidence.call(() => void (status.textContent = 'Actualizado'));

        return () => {
          version.textContent = VERSIONS[VERSIONS.length - 1];
          status.textContent = 'Actualizado';
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="wig" aria-labelledby="what-is-genomia-title">
      <div className="wig__bento">
        <header className="wig__intro">
          <h2 id="what-is-genomia-title" className="wig__title">
            Tu genoma, <em>en palabras.</em>
          </h2>
          <p className="wig__lede">
            Tres mil millones de letras. GenomIA secuencia tu genoma completo y lo convierte en un
            reporte personal, en español.
          </p>
        </header>

        <article className="wig__tile wig__tile--chile">
          <svg className="wig__chile" viewBox={CHILE_VIEWBOX} aria-hidden="true">
            <path className="wig__chile-path" d={CHILE_PATH} />
          </svg>
          <div className="wig__copy">
            <h3 className="wig__tile-title">Contexto chileno</h3>
            <p className="wig__tile-text">Un reporte pensado para la realidad de Chile.</p>
          </div>
        </article>

        <article className="wig__tile wig__tile--simple">
          <p className="wig__plain" aria-hidden="true">
            {PLAIN}
          </p>
          <div className="wig__copy">
            <h3 className="wig__tile-title">Lenguaje simple</h3>
            <p className="wig__tile-text">
              Cada hallazgo explicado sin jerga, con el contexto para entenderlo.
            </p>
          </div>
        </article>

        <article className="wig__tile wig__tile--evidence">
          <div className="wig__release" aria-hidden="true">
            <div className="wig__release-head">
              <span className="wig__version-window">
                <span className="wig__version">{VERSIONS[VERSIONS.length - 1]}</span>
              </span>
              <span className="wig__status">Actualizado</span>
            </div>
            <ol className="wig__steps">
              {[...VERSIONS, 'Próxima'].map((label, i) => {
                const done = i < VERSIONS.length;
                return (
                  <Fragment key={label}>
                    {i > 0 && (
                      <li className={`wig__link${done ? ' wig__link--done' : ''}`}>
                        <span className="wig__link-fill" />
                      </li>
                    )}
                    <li className={`wig__step${done ? ' wig__step--done' : ''}`}>
                      <span className="wig__step-label">{label}</span>
                    </li>
                  </Fragment>
                );
              })}
            </ol>
          </div>
          <div className="wig__copy">
            <h3 className="wig__tile-title">Evidencia que se actualiza</h3>
            <p className="wig__tile-text">Cuando cambia el conocimiento científico, tu reporte también.</p>
          </div>
        </article>

        <div className="wig__tile wig__tile--cta">
          <p>Postula para ser un posible candidato a recibir tu reporte de GenomIA absolutamente gratis.</p>
          <a className="btn btn-lg wig__cta-button" href={APPLY_HASH}>
            Postula <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
