// Run: npm run check
import assert from 'node:assert/strict';
import { QUESTIONS, validateAnswers } from './questions.ts';

const valid = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q.requiredAcceptance ? 'true' : q.options ? q.options[0] : q.maxWords ? 'Respuesta inicial.' : '']),
);

assert.equal(validateAnswers(valid), null);
assert.match(validateAnswers({ ...valid, elegibilidad_mayor_18: undefined })!, /Falta/);
assert.match(validateAnswers({ ...valid, elegibilidad_mayor_18: 'Quizás' })!, /inválida/);
assert.match(validateAnswers({ ...valid, acepta_inscripcion: 'x'.repeat(2001) })!, /larga/);
assert.equal(validateAnswers({ ...valid, sub: 'forged' }), null); // extra keys are ignored by the function
assert.equal(validateAnswers({ ...valid, elegibilidad_mayor_18: 'No' }), null); // negative eligibility is retained
assert.match(validateAnswers({ ...valid, acepta_inscripcion: 'false' })!, /obligatorio/);
assert.equal(QUESTIONS.filter((q) => q.id.startsWith('estudio_')).length, 9);
assert.equal(validateAnswers({ ...valid, motivacion_genoma: 'Quiero conocer más sobre mi salud.' }), null);
assert.match(validateAnswers({ ...valid, motivacion_genoma: undefined })!, /Falta/);
assert.equal(validateAnswers({ ...valid, motivacion_genoma: Array(100).fill('palabra').join(' ') }), null);
assert.match(validateAnswers({ ...valid, motivacion_genoma: Array(101).fill('palabra').join(' ') })!, /supera 100/);
console.log('questions: ok');
