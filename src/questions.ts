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
};

export type Section = {
  title: string;
  questions: Question[];
};

const YES_NO = ['Sí', 'No'];

export const SECTIONS: Section[] = [
  {
    title: 'Ficha de caracterización',
    questions: [
      { id: 'P0.1', text: '¿Tiene 18 años o más?', options: YES_NO },
      {
        id: 'P0.2',
        text: '¿Acepta participar voluntariamente en el estudio y entregar una muestra biológica para análisis genómico?',
        options: YES_NO,
      },
      {
        id: 'P0.3',
        text: '¿Se considera actualmente una persona sana o sin una enfermedad grave activa?',
        options: YES_NO,
      },
      { id: 'P0.4', text: '¿Ha sido diagnosticado/a alguna vez con cáncer?', options: YES_NO },
      { id: 'P0.5', text: '¿Ha recibido un trasplante de órgano o médula ósea?', options: YES_NO },
      { id: 'P0.6', text: '¿Ha recibido transfusión de sangre en los últimos 6 meses?', options: YES_NO },
      {
        id: 'P0.7',
        text: '¿Tiene parentesco de primer grado con otra persona ya incorporada al estudio?',
        options: YES_NO,
      },
    ],
  },
  {
    title: 'Motivación',
    questions: [
      { id: 'motivacion', text: '¿Por qué te quieres hacer tu genoma?', maxWords: 100 },
    ],
  },
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
    if (q.maxWords && countWords(value) > q.maxWords) return `${q.id} supera ${q.maxWords} palabras`;
  }
  return null;
}
