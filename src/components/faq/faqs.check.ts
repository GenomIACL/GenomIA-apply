// Run: npm run check
import assert from 'node:assert/strict';
import { FAQS, matches } from './faqs.ts';

assert.equal(FAQS.length, 22);
const costo = FAQS[0];
assert(matches(costo, ''));
assert(matches(costo, 'COSTO'));
assert(matches(costo, 'secuenciacion reporte'));
assert(!matches(costo, 'costo zzz'));
assert.equal(FAQS.filter((faq) => matches(faq, 'mes 14')).length > 0, true);

console.log('faqs.check ok');
