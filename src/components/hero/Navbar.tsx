import { useEffect, useRef, useState } from 'react';
import Arrow from '../ui/Arrow';
import brandLogo from '../../assets/genomia.png';
import { APPLY_HASH } from '../apply/ApplyDialog';
import { ABOUT_ID, TEAM_ID, scrollToSection } from './Scrolltosection.ts';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        !menuRef.current?.contains(target) &&
        !burgerRef.current?.contains(target)
      ) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        burgerRef.current?.focus();
      }
    };

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;

    const observer = new IntersectionObserver(([entry]) => {
      logo.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
    });

    observer.observe(logo);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header className="nav">
        <div className="nav-side nav-side-left">
          <div className="nav-actions">
            <a
              className="nav-link"
              href={`#${ABOUT_ID}`}
              onClick={(event) => scrollToSection(event, ABOUT_ID)}
            >
              ¿Qué es GenomIA?
            </a>
          </div>
        </div>

        <a className="nav-brand" href="/" aria-label="GenomIA, ir al inicio">
          <img ref={logoRef} className="logo" src={brandLogo} alt="" />
        </a>

        <div className="nav-side nav-side-right">
          <div className="nav-actions nav-actions-right">
            <a
              className="nav-link"
              href={`#${TEAM_ID}`}
              onClick={(event) => scrollToSection(event, TEAM_ID)}
            >
              Quiénes somos
            </a>
            <a className="btn btn-nav-start" href={APPLY_HASH}>
              Postula
            </a>
          </div>
          <button
            ref={burgerRef}
            className="burger"
            type="button"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </header>

      <nav
        ref={menuRef}
        className={`menu${menuOpen ? ' open' : ''}`}
        id="menu"
        aria-label="Navegación móvil"
        aria-hidden={!menuOpen}
      >
        <a
          className="m-link"
          href={`#${ABOUT_ID}`}
          onClick={(event) => {
            setMenuOpen(false);
            scrollToSection(event, ABOUT_ID);
          }}
        >
          ¿Qué es GenomIA?
        </a>
        <a
          className="m-link"
          href={`#${TEAM_ID}`}
          onClick={(event) => {
            setMenuOpen(false);
            scrollToSection(event, TEAM_ID);
          }}
        >
          Quiénes somos
        </a>
        <a
          className="m-start"
          href={APPLY_HASH}
          onClick={() => setMenuOpen(false)}
        >
          Postula <Arrow />
        </a>
      </nav>
    </>
  );
}