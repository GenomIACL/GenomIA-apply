import { useEffect, useRef } from 'react';
import Navbar from './Navbar';
import { ABOUT_ID, scrollToSection } from './Scrolltosection.ts';
import PartnersMarquee from '../partners/PartnersMarquee';
import './HeroSection.css';

const VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4';

export default function HeroSection() {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const [a, b] = [videoARef.current, videoBRef.current];
    if (!a || !b) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      a.removeAttribute('autoplay');
      a.pause();
      b.pause();

      try {
        a.currentTime = 0;
      } catch {
        // The media may not be seekable yet.
      }

      return;
    }

    const fade = 900;
    let current = a;
    let next = b;
    let swapping = false;
    let timer: number | undefined;

    const play = (video: HTMLVideoElement) => {
      const result = video.play();
      if (result) void result.catch(() => undefined);
    };

    const tick = () => {
      if (
        swapping ||
        !current.duration ||
        current.duration - current.currentTime > fade / 1000
      ) {
        return;
      }

      swapping = true;
      const outgoing = current;
      next.currentTime = 0;
      play(next);
      next.classList.add('is-active');
      outgoing.classList.remove('is-active');
      current = next;
      next = outgoing;

      timer = window.setTimeout(() => {
        outgoing.pause();

        try {
          outgoing.currentTime = 0;
        } catch {
          // Ignore unavailable seek.
        }

        swapping = false;
      }, fade + 100);
    };

    play(a);
    a.addEventListener('timeupdate', tick);
    b.addEventListener('timeupdate', tick);

    return () => {
      a.removeEventListener('timeupdate', tick);
      b.removeEventListener('timeupdate', tick);

      if (timer !== undefined) window.clearTimeout(timer);

      a.pause();
      b.pause();
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.documentElement;
    root.classList.add('anim');
    let bootTimer: number | undefined;
    let safetyTimer: number | undefined;
    let started = false;
    let cleaned = false;

    const clean = () => {
      if (cleaned) return;
      cleaned = true;

      if (safetyTimer !== undefined) window.clearTimeout(safetyTimer);

      document.removeEventListener('animationend', onEnd, true);
      root.classList.remove('anim', 'go');
    };

    const onEnd = (event: AnimationEvent) => {
      if (
        event.animationName === 'pillIn' &&
        event.target instanceof Element &&
        event.target.classList.contains('btn-ghost')
      ) {
        clean();
      }
    };

    const start = () => {
      if (started || cleaned) return;
      started = true;

      if (bootTimer !== undefined) window.clearTimeout(bootTimer);

      document.addEventListener('animationend', onEnd, true);
      safetyTimer = window.setTimeout(clean, 2600);
      root.classList.add('go');
    };

    const boot = () => {
      bootTimer = window.setTimeout(start, 900);

      if (document.fonts?.ready) {
        void document.fonts.ready.then(start, start);
      } else {
        start();
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
      boot();
    }

    return () => {
      if (bootTimer !== undefined) window.clearTimeout(bootTimer);

      document.removeEventListener('DOMContentLoaded', boot);
      clean();
    };
  }, []);

  return (
    <main className="hero">
      <div
        className="bg"
        role="img"
        aria-label="Planeta Tierra azul girando lentamente sobre un fondo estrellado"
      >
        <video
          ref={videoARef}
          className="bg-video is-active"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
        >
          <source src={VIDEO} type="video/mp4" />
        </video>
        <video
          ref={videoBRef}
          className="bg-video"
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
        >
          <source src={VIDEO} type="video/mp4" />
        </video>
      </div>
  
      <Navbar />
  
      <div className="hero-inner">
        <h1>
          <span className="ln">
            <span className="ln-i">Lee la historia que</span>
          </span>
          <span className="ln">
            <span className="ln-i">está escrita en ti</span>
          </span>
        </h1>
        <p className="sub">
          Sumérgete en tu información genética y descubre los secretos de tu biología<br />
          en una sola plataforma.
        </p>
        <div className="ctas">
          <a
            className="btn btn-lg btn-ghost btn-discover"
            href={`#${ABOUT_ID}`}
            onClick={(event) => scrollToSection(event, ABOUT_ID)}
          >
            Descubre
            <svg
              className="arw-down"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 4v15M6 13.5l6 6 6-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
      <PartnersMarquee />
    </main>
  );
}