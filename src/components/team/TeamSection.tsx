import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Alex from '../../assets/team/Alex.jpg';
import Andres from '../../assets/team/Andres.png';
import Carol from '../../assets/team/Carol.png';
import Gabriel from '../../assets/team/Gabriel.webp';
import Susan from '../../assets/team/Susan.jpg';
import Isidora from '../../assets/team/Isidora.png';
import Fabian from '../../assets/team/Fabian.jpeg';
import './TeamSection.css';

type Qualification = { degree: string; institution: string };
type TeamMember = {
  name: string;
  role: string;
  qualification: Qualification;
  area: string;
  photo?: string;
  photoPosition?: string;
};

const TEAM: TeamMember[] = [
  {
    name: 'Alex Di Genova',
    role: 'Investigador - director',
    qualification: { degree: 'Académico', institution: "Universidad de O'Higgins" },
    area: 'Biología computacional',
    photo: Alex,
  },
  {
    name: 'Andrés Zúñiga',
    role: 'Investigador principal',
    qualification: { degree: 'Académico', institution: "Universidad de O'Higgins" },
    area: 'Matemática y estadística',
    photo: Andres,
  },
  {
    name: 'Carol Moraga',
    role: 'Investigadora - codirectora',
    qualification: { degree: 'Académica', institution: "Universidad de O'Higgins" },
    area: 'Biología computacional',
    photo: Carol,
  },
  {
    name: 'Gabriel Cabas',
    role: 'Ingeniero en genómica e IA',
    qualification: { degree: 'Ingeniero', institution: "Universidad de O'Higgins" },
    area: 'Genómica e IA',
    photo: Gabriel,
  },
  {
    name: 'Susan Calfunao',
    role: 'Secuenciación y biobanco',
    qualification: { degree: 'SeqUOH', institution: "Universidad de O'Higgins" },
    area: 'Secuenciación y biobanco',
    photo: Susan,
  },
  {
    name: 'Fabián Ayala',
    role: 'Ingeniero web',
    qualification: { degree: 'Ingeniero', institution: "Universidad de O'Higgins" },
    area: 'Diseño & UI',
    photo: Fabian,
  },
  {
    name: 'Isidora Salgado',
    role: 'Ingeniera web',
    qualification: { degree: 'Ingeniera', institution: "Universidad de O'Higgins" },
    area: 'Diseño & UI',
    photo: Isidora,
    photoPosition: '70% 18%',
  },
];

const LOOP_START = TEAM.length;
const LOOP_MEMBERS = [...TEAM, ...TEAM, ...TEAM];
const center = (index: number) =>
  LOOP_START + (index % TEAM.length + TEAM.length) % TEAM.length;

const INTERVAL_MS = 6000;
const WHEEL_THRESHOLD = 48;
const SWIPE_THRESHOLD = 42;

export default function TeamSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(LOOP_START);
  const [expanded, setExpanded] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [reduceMotion, setReduceMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const wheelAccumulatorRef = useRef(0);
  const wheelLockedRef = useRef(false);
  const wheelUnlockTimerRef = useRef<number | undefined>();
  const pointerStartRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);
  const active = position % TEAM.length;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: .15,
    });
    observer.observe(section);

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => setReduceMotion(motion.matches);
    const onVisibilityChange = () => setPageVisible(!document.hidden);
    motion.addEventListener('change', onMotionChange);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      observer.disconnect();
      motion.removeEventListener('change', onMotionChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  useLayoutEffect(() => {
    if (!resetting) return;

    // Compute the centered frame with transitions disabled before restoring movement.
    trackRef.current?.getBoundingClientRect();
    const timer = window.setTimeout(() => setResetting(false), 32);
    return () => window.clearTimeout(timer);
  }, [resetting]);

  const autoPlaying = inView && pageVisible && !reduceMotion && !hovering && !expanded;

  useEffect(() => {
    if (!autoPlaying) return;
    const timer = window.setTimeout(() => {
      setPosition((current) => current + 1);
    }, INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [active, autoPlaying]);
  useEffect(() => () => {
    if (wheelUnlockTimerRef.current !== undefined) {
      window.clearTimeout(wheelUnlockTimerRef.current);
    }
  }, []);

  const changePosition = (direction: number) => {
    setExpanded(false);
    setPosition((current) => {
      const next = current + direction;
      return reduceMotion || next < 0 || next >= LOOP_MEMBERS.length ? center(next) : next;
    });
  };


  return (
    <section ref={sectionRef} id="quienes-somos" className="team" aria-labelledby="team-title">
      <div className="team__head">
        <h2 id="team-title" className="team__title">
          Las personas <span className='team__title__down'>detrás de GenomIA</span>
        </h2>
        <p className="team__intro">
          Un equipo de investigación chileno que une genómica, ciencia de datos y salud para que tu
          genoma se entienda en palabras.
        </p>
      </div>

      <p id="team-instructions" className="team__sr">
        Usa las flechas, la rueda o un deslizamiento horizontal para cambiar de persona. Presiona Enter para mostrar u ocultar sus estudios.
      </p>
      <div
        id="team-stage"
        className="team__stage"
        style={{ '--position': position } as CSSProperties}
        role="region"
        aria-roledescription="carrusel"
        aria-label="Integrantes del equipo"
        aria-describedby="team-instructions"
        tabIndex={0}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocus={() => setHovering(true)}
        onBlur={() => setHovering(false)}
        onWheel={(event) => {
          if (event.ctrlKey) return;
          const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
          if (!delta) return;
          event.preventDefault();
          if (wheelLockedRef.current) return;

          wheelAccumulatorRef.current += delta;
          if (Math.abs(wheelAccumulatorRef.current) < WHEEL_THRESHOLD) return;

          const direction = wheelAccumulatorRef.current > 0 ? 1 : -1;
          wheelAccumulatorRef.current = 0;
          wheelLockedRef.current = true;
          changePosition(direction);
          wheelUnlockTimerRef.current = window.setTimeout(() => {
            wheelLockedRef.current = false;
          }, 650);
        }}
        onPointerDown={(event) => {
          if (event.pointerType !== 'touch') return;
          pointerStartRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={(event) => {
          const start = pointerStartRef.current;
          if (!start || start.pointerId !== event.pointerId) return;
          pointerStartRef.current = null;

          const deltaX = event.clientX - start.x;
          const deltaY = event.clientY - start.y;
          if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) <= Math.abs(deltaY)) return;

          suppressClickRef.current = true;
          changePosition(deltaX < 0 ? 1 : -1);
        }}
        onPointerCancel={() => {
          pointerStartRef.current = null;
        }}
        onClickCapture={(event) => {
          if (!suppressClickRef.current) return;
          event.preventDefault();
          event.stopPropagation();
          suppressClickRef.current = false;
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            changePosition(event.key === 'ArrowLeft' ? -1 : 1);
          } else if (
            event.target === event.currentTarget
            && (event.key === 'Enter' || event.key === ' ')
            && TEAM[active].qualification
          ) {
            event.preventDefault();
            setExpanded((open) => !open);
          }
        }}
      >
        <div
          ref={trackRef}
          className="team__track"
          data-resetting={resetting}
          onTransitionEnd={(event) => {
            if (event.target !== event.currentTarget || event.propertyName !== 'transform') return;
            if (position < LOOP_START || position >= LOOP_START + TEAM.length) {
              setResetting(true);
              setPosition(center(position));
            }
          }}
        >
          {LOOP_MEMBERS.map((member, slot) => {
            const i = slot % TEAM.length;
            const isActive = slot === position;
            const isDuplicate = slot < LOOP_START || slot >= LOOP_START + TEAM.length;
            const isExpanded = isActive && expanded;
            return (
              <article
                key={`${member.name}-${slot}`}
                className="team__card"
                data-active={isActive}
                aria-hidden={isDuplicate}
                data-expanded={isExpanded}
                style={{ '--d': Math.abs(slot - position) } as CSSProperties}
                role="group"
                aria-roledescription="diapositiva"
                aria-label={`${i + 1} de ${TEAM.length}`}
              >
                <div className="team__portrait">
                  {member.photo ? (
                    <img
                      className="team__photo"
                      src={member.photo}
                      alt=""
                      loading="lazy"
                      style={{ objectPosition: member.photoPosition ?? 'center 18%' }}
                    />
                  ) : (
                    <div
                      className="team__photo team__photo--missing"
                      role="img"
                      aria-label={`Fotografía de ${member.name} pendiente`}
                    />
                  )}
                  <div className="team__caption">
                    <h3 className="team__name">{member.name}</h3>
                    <p className="team__role">{member.role}</p>
                    <div
                      id={`team-studies-${slot}`}
                      className="team__details"
                      aria-hidden={!isExpanded}
                    >
                      <div className="team__details-inner">
                        <ul className="team__credentials">
                          <li>
                            <span className="team__degree">{member.qualification.degree}</span>
                            <span className="team__institution">{member.qualification.institution}</span>
                          </li>
                          <li className="team__area-item">
                            <span className="team__area">{member.area}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="team__trigger"
                  tabIndex={isActive && !isDuplicate ? 0 : -1}
                  aria-label={isActive
                    ? isExpanded ? `Ocultar estudios de ${member.name}` : `Ver estudios de ${member.name}`
                    : `Ver estudios de ${member.name}`}
                  aria-expanded={isActive ? isExpanded : undefined}
                  aria-controls={isActive ? `team-studies-${slot}` : undefined}
                  onClick={() => {
                    if (isActive) {
                      setExpanded((open) => !open);
                    } else {
                      setExpanded(true);
                      setPosition(reduceMotion ? center(slot) : slot);
                    }
                  }}
                />
              </article>
            );
          })}
        </div>
      </div>
      <span className="team__sr" aria-live={autoPlaying ? 'off' : 'polite'}>
        {`Integrante ${active + 1} de ${TEAM.length}: ${TEAM[active].name}`}
      </span>
    </section>
  );
}