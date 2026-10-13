import { useState } from 'react';
import mascot from '../../assets/faq/mascota-faq.webp';
import { FAQ_ID } from '../hero/Scrolltosection.ts';
import { CATEGORIES, FAQS, matches } from './faqs.ts';
import type { Category } from './faqs.ts';
import './FaqSection.css';

export default function FaqSection() {
  const [query, setQuery] = useState('');
  // Todas las categorías arrancan cerradas; se abren al hacer clic o con "Expandir todas".
  const [open, setOpen] = useState<Set<Category>>(() => new Set());

  const searching = query.trim() !== '';
  const results = FAQS.filter((faq) => matches(faq, query));
  const groups = CATEGORIES.map((category) => ({
    category,
    items: results.filter((faq) => faq.category === category),
  })).filter((group) => group.items.length > 0);

  const toggleCategory = (category: Category) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });

  return (
    <section id={FAQ_ID} className="faq" aria-labelledby="faq-title">
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

          {groups.length > 0 ? (
            <div className="faq__groups">
              {groups.map(({ category, items }) => {
                // Buscar abre todas las categorías con resultados, para que no haya que buscar la pregunta a mano.
                const isOpen = searching || open.has(category);
                const panelId = `faq-group-${CATEGORIES.indexOf(category)}`;
                return (
                  <section key={category} className="faq__group">
                    <h3 className="faq__group-head">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => toggleCategory(category)}
                      >
                        <span>{category}</span>
                        <small>{items.length}</small>
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </h3>
                    {isOpen && (
                      <ul id={panelId} className="faq__list">
                        {items.map((faq) => (
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
                    )}
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="faq__empty">
              <p>No encontramos preguntas sobre “{query.trim()}”.</p>
              <p>Prueba con otras palabras, como “sangre”, “datos” o “reporte”.</p>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
