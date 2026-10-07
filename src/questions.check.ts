// Run: npm run check
import assert from 'node:assert/strict';
import { QUESTIONS, validateAnswers } from './questions.ts';

const valid = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q.options ? q.options[0] : 'Quiero conocer mi ancestría.']),
);

assert.equal(validateAnswers(valid), null);
assert.match(validateAnswers({ ...valid, 'P0.1': undefined })!, /Falta/);
assert.match(validateAnswers({ ...valid, 'P0.1': 'Quizás' })!, /inválida/);
assert.match(validateAnswers({ ...valid, motivacion: 'palabra '.repeat(101) })!, /100 palabras/);
assert.match(validateAnswers({ ...valid, motivacion: 'x'.repeat(2001) })!, /larga/);
assert.equal(validateAnswers({ ...valid, sub: 'forged' }), null); // extra keys are ignored by the function
console.log('questions: ok');
