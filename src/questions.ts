/**
 * Single source of truth for the application form. The dialog renders it and
 * the Netlify Function validates against it and turns each `id` into a sheet
 * column, so adding a question here is all it takes (the column appears on the
 * next submission). Never reuse or rename an `id`: it is the column header.
 */
export type Question = {
  id: string;
  text: string;
  /** Present = pick one; absent = free text. */
  options?: string[];
  maxWords?: number;
  requiredAcceptance?: boolean;
};

export type Section = {
  title: string;
  questions: Question[];
};

const YES_NO = ['Sí', 'No'];

export const SECTIONS: Section[] = [
  { title: 'Lo esencial antes de inscribirse', questions: [] },
  {
    title: 'Sobre ti',
    questions: [
      { id: 'elegibilidad_mayor_18', text: 'Tengo más de 18 años.', options: YES_NO },
      { id: 'elegibilidad_sin_diagnostico', text: 'No tengo un diagnóstico de enfermedad.', options: YES_NO },
      { id: 'elegibilidad_sin_tratamiento', text: 'No estoy ni he estado en tratamiento por una condición diagnosticada.', options: YES_NO },
    ],
  },
  { title: 'Aclaración previa a las preguntas', questions: [] },
  {
    title: 'Preguntas sobre el estudio',
    questions: [
      { id: 'estudio_muestra_sangre', text: '¿Autoriza que se le tome una muestra de sangre venosa periférica?', options: YES_NO },
      { id: 'estudio_genoma_completo', text: '¿Autoriza el análisis de su genoma completo dentro del proyecto GenomIA?', options: YES_NO },
      { id: 'estudio_analisis_cientificos', text: '¿Autoriza que sus datos genómicos codificados se usen en análisis científicos sobre variación genética, ancestría, farmacogenómica y salud de la población chilena?', options: YES_NO },
    ],
  },
  { title: 'Experiencia y contacto', questions: [
    { id: 'estudio_retroalimentacion', text: '¿Acepta entregar retroalimentación (valoraciones, reacciones, comentarios o encuestas breves) sobre contenidos de la plataforma como ancestría, farmacogenómica, rasgos y riesgos genéticos?', options: YES_NO },
    { id: 'estudio_contacto_informacion', text: '¿Autoriza que lo/la contactemos en el futuro para aclarar información, entregar resultados generales del estudio o invitarle a estudios relacionados?', options: YES_NO },
    { id: 'estudio_recibir_informacion', text: '¿Desea recibir información general del proyecto, como reportes educativos o resultados agregados de la cohorte?', options: YES_NO },
  ] },
  { title: 'Seguimiento y exámenes', questions: [
    { id: 'estudio_consentimiento_dinamico', text: '¿Autoriza que lo/la contactemos en el futuro para acceder al consentimiento informado dinámico?', options: YES_NO },
    { id: 'estudio_panel_examenes', text: '¿Autoriza la realización del panel de exámenes de sangre como parte de su participación en GenomIA?', options: YES_NO },
    { id: 'estudio_integrar_resultados', text: '¿Autoriza que los resultados de sus exámenes se integren y analicen junto con su información genómica y los antecedentes que haya autorizado, para los objetivos científicos y tecnológicos de GenomIA?', options: YES_NO },
  ] },
  { title: 'Cierre y aceptación', questions: [{ id: 'acepta_inscripcion', text: 'He leído y acepto los términos y condiciones completos de esta inscripción a GenomIA, y acepto inscribirme. Entiendo que firmaré el consentimiento informado oficial en persona y que, en caso de diferencia, rige el consentimiento informado oficial.', requiredAcceptance: true }] },
  { title: 'Para finalizar', questions: [{ id: 'motivacion_genoma', text: 'En hasta 100 palabras, ¿por qué quiere hacerse el genoma?', maxWords: 100 }] },
];

export const QUESTIONS = SECTIONS.flatMap((section) => section.questions);

export const MAX_TEXT_LENGTH = 2000;

export const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

/** Returns an error message, or null when every answer is present and allowed. */
export function validateAnswers(answers: Record<string, unknown>): string | null {
  for (const q of QUESTIONS) {
    const value = answers[q.id];
    if (typeof value !== 'string' || !value.trim()) return `Falta responder ${q.id}`;
    if (value.length > MAX_TEXT_LENGTH) return `${q.id} es demasiado larga`;
    if (q.options && !q.options.includes(value)) return `${q.id} tiene una opción inválida`;
    if (q.requiredAcceptance && value !== 'true') return `${q.id} es obligatorio`;
    if (q.maxWords && countWords(value) > q.maxWords) return `${q.id} supera ${q.maxWords} palabras`;
  }
  return null;
}
