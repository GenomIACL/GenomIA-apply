export type Question = {
  id: string;
  text: string;
  /** Present = pick one; absent = free text. */
  options?: string[];
  maxWords?: number;
  requiredAcceptance?: boolean;
  phone?: boolean;
  select?: boolean;
  conditionalQuestion?: { id: string; text: string; when: string };
  conditional?: { parentId: string; value: string };
};

export type Section = {
  pretitle: string;
  title: string;
  questions: Question[];
};

const YES_NO = ['Sí', 'No'];

const CHILE_REGIONS = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana de Santiago',
  "Libertador General Bernardo O'Higgins",
  'Maule',
  'Ñuble',
  'Biobío',
  'La Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén del General Carlos Ibáñez del Campo',
  'Magallanes y de la Antártica Chilena',
];

export const SECTIONS: Section[] = [
  { pretitle: 'Antes de empezar', title: 'Lo que debes saber para participar', questions: [] },
  {
    title: 'Tus Datos',
    pretitle: 'Cómo contactarte',
    questions: [
      { id: 'contacto_telefono', text: 'Teléfono de Contacto', phone: true },
      {
        id: 'contacto_region',
        text: 'Región',
        options: CHILE_REGIONS,
        select: true,
      },
    ],
  },
  {
    title: 'Cuéntanos sobre ti',
    pretitle: 'Detrás de cada genoma hay una persona',
    questions: [
      { id: 'elegibilidad_mayor_18', text: '¿Tienes 18 años o más?', options: YES_NO },
      {
        id: 'elegibilidad_diagnostico',
        text: '¿Te han diagnosticado alguna enfermedad crónica o de relevancia genética?',
        options: YES_NO,
        conditionalQuestion: {
          id: 'elegibilidad_enfermedad',
          text: '¿Qué enfermedad te han diagnosticado?',
          when: 'Sí',
        },
      },
      {
        id: 'elegibilidad_tratamiento',
        text: '¿Estás actualmente en tratamiento médico por esa condición?',
        options: YES_NO,
        conditional: { parentId: 'elegibilidad_diagnostico', value: 'Sí' },
      },
    ],
  },
  { pretitle: 'Tus datos y su uso', title: 'Qué haremos con tu información', questions: [] },
  {
    title: 'Qué autorizas dentro de GenomIA',
    pretitle: 'Tu participación',
    questions: [
      { id: 'estudio_muestra_sangre', text: '¿Autoriza que se le tome una muestra de sangre venosa periférica?', options: YES_NO },
      { id: 'estudio_genoma_completo', text: '¿Autoriza el análisis de su genoma completo dentro del proyecto GenomIA?', options: YES_NO },
      { id: 'estudio_analisis_cientificos', text: '¿Autoriza que sus datos genómicos codificados se usen en análisis científicos sobre variación genética, ancestría, farmacogenómica y salud de la población chilena?', options: YES_NO },
    ],
  },
  {
    pretitle: 'Comunicación y Experiencia',
    title: 'Cómo te mantenemos al tanto',
    questions: [
      { id: 'estudio_retroalimentacion', text: '¿Acepta entregar retroalimentación (valoraciones, reacciones, comentarios o encuestas breves) sobre contenidos de la plataforma como ancestría, farmacogenómica, rasgos y riesgos genéticos?', options: YES_NO },
      { id: 'estudio_contacto_informacion', text: '¿Autoriza que lo/la contactemos en el futuro para aclarar información, entregar resultados generales del estudio o invitarle a estudios relacionados?', options: YES_NO },
      { id: 'estudio_recibir_informacion', text: '¿Desea recibir información general del proyecto, como reportes educativos o resultados agregados de la cohorte?', options: YES_NO },
    ],
  },
  {
    pretitle: 'Lo que viene después',
    title: 'Exámenes y seguimiento de tu participación',
    questions: [
      { id: 'estudio_consentimiento_dinamico', text: '¿Autoriza que lo/la contactemos en el futuro para acceder al consentimiento informado dinámico?', options: YES_NO },
      { id: 'estudio_panel_examenes', text: '¿Autoriza la realización del panel de exámenes de sangre como parte de su participación en GenomIA?', options: YES_NO },
      { id: 'estudio_integrar_resultados', text: '¿Autoriza que los resultados de sus exámenes se integren y analicen junto con su información genómica y los antecedentes que haya autorizado, para los objetivos científicos y tecnológicos de GenomIA?', options: YES_NO },
    ],
  },
  { pretitle: 'Un último paso', title: 'Tu decisión de inscribirte', questions: [{ id: 'acepta_inscripcion', text: 'He leído y acepto los términos y condiciones completos de esta inscripción a GenomIA, y acepto inscribirme. Entiendo que firmaré el consentimiento informado oficial en persona y que, en caso de diferencia, rige el consentimiento informado oficial.', requiredAcceptance: true }] },
  { pretitle: 'Para finalizar', title: '¿Qué te motiva a conocer tu genoma?', questions: [{ id: 'motivacion_genoma', text: 'En hasta 100 palabras, ¿por qué quiere conocer su genoma?', maxWords: 100 }] },
];

export const QUESTIONS = SECTIONS.flatMap((section) =>
  section.questions.flatMap((question) =>
    question.conditionalQuestion
      ? [
          question,
          {
            id: question.conditionalQuestion.id,
            text: question.conditionalQuestion.text,
            conditional: { parentId: question.id, value: question.conditionalQuestion.when },
          },
        ]
      : [question],
  ),
);

export const MAX_TEXT_LENGTH = 2000;

export const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

/** Returns an error message, or null when every answer is present and allowed. */
export function validateAnswers(answers: Record<string, unknown>): string | null {
  for (const q of QUESTIONS) {
    if (q.conditional && answers[q.conditional.parentId] !== q.conditional.value) {
      const hiddenAnswer = answers[q.id];
      if (typeof hiddenAnswer === 'string' && hiddenAnswer.trim()) {
        return `${q.id} no corresponde a la respuesta`;
      }
      continue;
    }
    const value = answers[q.id];
    if (typeof value !== 'string' || !value.trim()) return `Falta responder ${q.id}`;
    if (value.length > MAX_TEXT_LENGTH) return `${q.id} es demasiado larga`;
    if (q.phone && !/^\+569\d{8}$/.test(value)) return `${q.id} debe tener formato +569XXXXXXXX`;
    if (q.options && !q.options.includes(value)) return `${q.id} tiene una opción inválida`;
    if (q.requiredAcceptance && value !== 'true') return `${q.id} es obligatorio`;
    if (q.maxWords && countWords(value) > q.maxWords) return `${q.id} supera ${q.maxWords} palabras`;
  }
  return null;
}


