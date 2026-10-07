import type { CSSProperties } from 'react';
import Marquee from '../ui/Marquee';
import fondef from '../../assets/logos/fondef.png';
import mincienciaAnid from '../../assets/logos/minciencia-anid.png';
import uoh from '../../assets/logos/uoh.png';
import './PartnersMarquee.css';

// Heights are optical, not equal: the UOH mark is much denser than the block logos.
const LOGOS = [
  {
    href: 'https://anid.cl/',
    src: mincienciaAnid,
    alt: 'Ministerio de Ciencia, Tecnología, Conocimiento e Innovación y ANID, Gobierno de Chile',
    height: 66,
  },
  {
    href: 'https://www.conicyt.cl/fondef/sobre-fondef/que-es-fondef/',
    src: fondef,
    alt: 'FONDEF, Fondo de Fomento al Desarrollo Científico y Tecnológico',
    height: 58,
  },
  { href: 'https://www.uoh.cl/', src: uoh, alt: "Universidad de O'Higgins", height: 40 },
];

export default function PartnersMarquee() {
  return (
    <div className="partners">
      <p className="partners__label">Con el apoyo de</p>
      <div className="partners__list">
        <Marquee className="partners__marquee" pauseOnHover={false}>
          {LOGOS.map(({ href, src, alt, height }) => (
            <a
              key={href}
              className="partners__link"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="partners__logo"
                src={src}
                alt={alt}
                style={{ '--logo-h': `${height}px` } as CSSProperties}
                draggable={false}
              />
            </a>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
