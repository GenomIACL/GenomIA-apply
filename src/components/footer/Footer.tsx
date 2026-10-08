import brandLogo from '../../assets/genomia.png';
import fondef from '../../assets/logos/fondef.png';
import mincienciaAnid from '../../assets/logos/minciencia-anid.png';
import uoh from '../../assets/logos/uoh.png';
import './Footer.css';

const SUPPORTERS = [
  {
    href: 'https://www.conicyt.cl/fondef/sobre-fondef/que-es-fondef/',
    src: fondef,
    alt: 'FONDEF, Fondo de Fomento al Desarrollo Científico y Tecnológico',
  },
  {
    href: 'https://anid.cl/',
    src: mincienciaAnid,
    alt: 'ANID, Agencia Nacional de Investigación y Desarrollo',
  },
  { href: 'https://www.uoh.cl/', src: uoh, alt: "Universidad de O'Higgins" },
];

export default function Footer() {
  return (
    <footer className="site-footer" aria-label="Información del proyecto y apoyos">
      <div className="site-footer__content">
        <div className="site-footer__about">
          <a className="site-footer__brand" href="/" aria-label="GenomIA, ir al inicio">
            <img src={brandLogo} alt="" />
            GenomIA
          </a>
          <p>
            GenomIA es una plataforma web que entrega a cada persona un reporte genómico comprensible e interactivo, asistido por inteligencia artificial y contextualizado con datos de la población chilena.
          </p>
        </div>
        <div className="site-footer__support" aria-label="Instituciones que apoyan el proyecto">
          <h2>Con el apoyo de</h2>
          <ul>
            {SUPPORTERS.map(({ href, src, alt }) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noopener noreferrer">
                  <img src={src} alt={alt} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="site-footer__bottom">
        <p>© {new Date().getFullYear()} GenomIA. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}