// Run: npm run check
import assert from 'node:assert/strict';
import { QUESTIONS, SECTIONS, validateAnswers } from './questions.ts';

const valid = Object.fromEntries(
  QUESTIONS.map((q) => [
    q.id,
    q.phone ? '+56912345678' : q.requiredAcceptance ? 'true' : q.id === 'elegibilidad_enfermedad' ? 'Asma' : q.options ? q.options[0] : q.maxWords ? 'Respuesta inicial.' : '',
  ]),
);

assert.equal(SECTIONS[0].title, 'Lo que debes saber para participar');
assert.equal(SECTIONS[0].questions.length, 0);
assert.equal(SECTIONS[1].title, 'Tus Datos');
assert.deepEqual(SECTIONS[1].questions.map((q) => q.id), ['contacto_telefono', 'contacto_region']);
assert(
  QUESTIONS.some(
    (q) => q.id === 'elegibilidad_enfermedad'
      && q.conditional?.parentId === 'elegibilidad_diagnostico'
      && q.conditional.value === 'Sí',
  ),
);
assert(
  QUESTIONS.some(
    (q) => q.id === 'elegibilidad_tratamiento'
      && q.conditional?.parentId === 'elegibilidad_diagnostico'
      && q.conditional.value === 'Sí',
  ),
);
assert.equal(validateAnswers(valid), null);
assert.match(validateAnswers({ ...valid, elegibilidad_mayor_18: undefined })!, /Falta/);
assert.match(validateAnswers({ ...valid, elegibilidad_mayor_18: 'Quizás' })!, /inválida/);
assert.match(validateAnswers({ ...valid, acepta_inscripcion: 'x'.repeat(2001) })!, /larga/);
assert.match(validateAnswers({ ...valid, contacto_telefono: '+56812345678' })!, /formato/);
assert.match(validateAnswers({ ...valid, contacto_telefono: '+5691234567' })!, /formato/);
assert.match(validateAnswers({ ...valid, contacto_region: 'Región inválida' })!, /inválida/);
assert.equal(validateAnswers({ ...valid, sub: 'forged' }), null); // extra keys are ignored by the function
assert.equal(validateAnswers({ ...valid, elegibilidad_mayor_18: 'No' }), null); // negative eligibility is retained
assert.match(validateAnswers({ ...valid, acepta_inscripcion: 'false' })!, /obligatorio/);
assert.match(
  validateAnswers({ ...valid, elegibilidad_diagnostico: 'Sí', elegibilidad_enfermedad: '' })!,
  /Falta responder elegibilidad_enfermedad/,
);
assert.match(
  validateAnswers({
    ...valid,
    elegibilidad_diagnostico: 'Sí',
    elegibilidad_enfermedad: 'Asma',
    elegibilidad_tratamiento: undefined,
  })!,
  /Falta responder elegibilidad_tratamiento/,
);
assert.equal(
  validateAnswers({
    ...valid,
    elegibilidad_diagnostico: 'Sí',
    elegibilidad_enfermedad: 'Asma',
    elegibilidad_tratamiento: 'No',
  }),
  null,
);
assert.equal(
  validateAnswers({
    ...valid,
    elegibilidad_diagnostico: 'No',
    elegibilidad_enfermedad: '',
    elegibilidad_tratamiento: '',
  }),
  null,
);
assert.match(
  validateAnswers({
    ...valid,
    elegibilidad_diagnostico: 'Sí',
    elegibilidad_enfermedad: 'x'.repeat(2001),
  })!,
  /elegibilidad_enfermedad es demasiado larga/,
);
assert.match(
  validateAnswers({
    ...valid,
    elegibilidad_diagnostico: 'No',
    elegibilidad_enfermedad: 'Asma',
    elegibilidad_tratamiento: '',
  })!,
  /no corresponde a la respuesta/,
);
assert.equal(QUESTIONS.filter((q) => q.id.startsWith('estudio_')).length, 9);
assert.equal(validateAnswers({ ...valid, motivacion_genoma: 'Quiero conocer más sobre mi salud.' }), null);
assert.match(validateAnswers({ ...valid, motivacion_genoma: undefined })!, /Falta/);
assert.equal(validateAnswers({ ...valid, motivacion_genoma: Array(100).fill('palabra').join(' ') }), null);
assert.match(validateAnswers({ ...valid, motivacion_genoma: Array(101).fill('palabra').join(' ') })!, /supera 100/);
console.log('questions: ok');
