import { useState } from 'react';
import mascot from '../../assets/faq/mascota-faq.webp';
import { FAQ_ID } from '../hero/Scrolltosection.ts';
import { FAQS, matches } from './faqs.ts';
import './FaqSection.css';

const INITIAL = 6;

export default function FaqSection() {
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const searching = query.trim() !== '';
  const results = FAQS.filter((faq) => matches(faq, query));
  const visible = searching || showAll ? results : results.slice(0, INITIAL);

  return (
    <section id={FAQ_ID} className="faq" aria-labelledby="faq-title">
      <header className="faq__bar">
        <span className="faq__badge" aria-hidden="true">?</span>
        <span className="faq__kicker">Preguntas y respuestas</span>
      </header>

      <div className="faq__grid">
        <div className="faq__aside">
          <h2 id="faq-title" className="faq__title">
            Faq
          </h2>
          <div className="faq__mascot">
            <img src={mascot} alt="" width={383} height={720} loading="lazy" />
          </div>
        </div>

        <div className="faq__main">
          <label className="faq__search">
            <span className="faq__sr">Buscar en las preguntas frecuentes</span>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Busca: costo, muestra, datos, reporte…"
              autoComplete="off"
            />
          </label>

          <p className="faq__sr" aria-live="polite">
            {searching ? `${results.length} resultados` : ''}
          </p>

          {visible.length > 0 ? (
            <ul className="faq__list">
              {visible.map((faq) => (
                <li key={faq.q}>
                  <details className="faq__item">
                    <summary>
                      <span>{faq.q}</span>
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </summary>
                    <p>{faq.a}</p>
                  </details>
                </li>
              ))}
            </ul>
          ) : (
            <div className="faq__empty">
              <p>No encontramos preguntas sobre “{query.trim()}”.</p>
              <p>Prueba con otras palabras, como “sangre”, “datos” o “reporte”.</p>
            </div>
          )}

          {!searching && !showAll && results.length > INITIAL && (
            <button className="faq__more" type="button" onClick={() => setShowAll(true)}>
              Ver más ({results.length - INITIAL})
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
