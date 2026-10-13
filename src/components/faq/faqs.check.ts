// Run: npm run check
import assert from 'node:assert/strict';
import { CATEGORIES, FAQS, matches } from './faqs.ts';

assert.equal(FAQS.length, 22);
const costo = FAQS[0];
assert(matches(costo, ''));
assert(matches(costo, 'COSTO'));
assert(matches(costo, 'secuenciacion reporte'));
assert(!matches(costo, 'costo zzz'));
assert.equal(FAQS.filter((faq) => matches(faq, 'mes 14')).length > 0, true);

assert(FAQS.every((faq) => (CATEGORIES as readonly string[]).includes(faq.category)));
assert.equal(FAQS.reduce((total, faq) => total + (faq.category === 'Participación' ? 1 : 0), 0), 7);

console.log('faqs.check ok');
