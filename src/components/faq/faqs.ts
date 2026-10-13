// Fuente: FAQ.md (22 preguntas). Editar aquí para cambiar el FAQ del sitio.
export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "¿Tiene costo participar?",
    a: "No para las personas seleccionadas. El proyecto cubre la toma de muestra, la secuenciación y el reporte. No cubre consultas médicas habituales ni otros exámenes fuera del estudio.",
  },
  {
    q: "¿Qué muestra necesito dar y cómo me preparo?",
    a: "Una muestra de sangre venosa (~2 tubos pequeños) en centros disponibles de O'Higgins y Metropolitana, tomada por personal calificado. Incluye un panel básico (hemograma, perfil lipídico, glucosa) sin costo: te avisaremos el ayuno (usualmente 8–12 h). Importante: el examen de sangre no excluye, solo complementa tu información.",
  },
  {
    q: "¿Duele o tiene riesgos?",
    a: "Como cualquier toma de sangre: molestia breve en la punción y, excepcionalmente, moretón, inflamación de la vena o infección leve. El otro riesgo a considerar es emocional: el genoma puede revelar predisposiciones, información de ancestría o parentesco que no esperabas.",
  },
  {
    q: "¿El reporte es un diagnóstico médico?",
    a: "No. Es informativo y educativo. No reemplaza una consulta médica, no prescribe fármacos ni confirma enfermedades. Te recomendamos revisarlo con un profesional de salud si tienes dudas o antecedentes familiares.",
  },
  {
    q: "¿Qué incluye el reporte GenomIA? ¿Puedo elegir?",
    a: "Tú eliges los módulos en el consentimiento extendido presencial, con mínimo obligatorio de 1 módulo. Opciones: 1) ancestría y diversidad chilena, 2) rasgos y bienestar, 3) salud y predisposiciones, 4) farmacogenómica. Puedes pedir solo ancestría si quieres. Cada hallazgo indica qué se sabe, qué no, y cuándo consultar.",
  },
  {
    q: "¿Cómo funciona el asistente con IA?",
    a: "Es un chat en español entrenado sobre tu reporte y fuentes validadas. Funciona con procesamiento local en infraestructura de la Universidad de O'Higgins (UOH): tus datos individuales no se venden ni se usan para entrenar modelos comerciales. Puedes preguntar “¿qué significa esto?” y te responde sin jerga.",
  },
  {
    q: "¿Qué pasa con mis datos y mi privacidad?",
    a: "Tu información se guarda codificada (con código de participante, sin tu nombre directo) en servidores de la Universidad de O'Higgins (UOH), bajo Ley 19.628 y 20.120 en Chile. Solo acceden investigadores autorizados y comité de ética, en forma anónima o agregada. Nunca publicamos datos identificables.",
  },
  {
    q: "¿Puedo retirarme del estudio?",
    a: "Sí, en cualquier momento, sin dar explicaciones y sin perjuicio. Al retirarte eliminamos el vínculo entre tu identidad y tus muestras/datos. Los datos ya anonimizados y agregados no pueden deshacerse, pero nadie podrá ligarlos a ti.",
  },
  {
    q: "¿Quiénes pueden postular?",
    a: "Personas sanas —sin enfermedad genética diagnosticada—, no emparentadas entre sí, de 18+, residentes en O'Higgins o Metropolitana, con correo válido y disponibilidad presencial para toma de muestra y firma de consentimiento extendido. Costo cero. Solo una postulación por persona. De los 2000 inscritos llamaremos a 250 por ranking interno de participación (no publicamos los criterios para evitar sesgar respuestas).",
  },
  {
    q: "¿Por qué piden personas no emparentadas? ¿Puedo postular con un familiar?",
    a: "Buscamos personas no emparentadas para representar mejor la diversidad genética de la población y evitar duplicar la misma información familiar en el análisis. Pueden postular familiares, pero solo uno por familia podrá quedar seleccionado en esta etapa. Si detectamos parentesco cercano en el control de calidad, conservamos al primero del ranking y liberamos el otro cupo a lista de espera.",
  },
  {
    q: "¿Cuánto demora todo el proceso?",
    a: "Postulación: ~10 min. Contacto si eres preseleccionado: 2–4 semanas. Toma de muestra: 30 min. Reporte: la secuenciación y análisis toman varias semanas; te avisamos por correo cuando esté listo y podrás acceder con tu código + correo.",
  },
  {
    q: "¿Qué pasa si encuentran algo relevante para mi salud?",
    a: "Si está dentro de los módulos que elegiste y es clínicamente relevante (ej. gen BRCA), te contactará un consejero genético de nuestra red de partners médicos. Buscamos que sea gratuita para quienes la necesiten, máximo 1 sesión por participante. El seguimiento posterior va por tu red de salud. Si elegiste no saber de salud, respetamos tu decisión.",
  },
  {
    q: "¿Puedo compartir mi reporte con mi familia o mi médico?",
    a: "Sí, es tu reporte. Puedes descargarlo en PDF o mostrar el acceso interactivo. Ten en cuenta que tu ADN comparte información con familiares biológicos: conversalo con ellos si aparecen datos sensibles de parentesco o riesgo hereditario.",
  },
  {
    q: "¿Cuánto dura el proyecto?",
    a: "24 meses en total. Reclutamiento hasta llegar a 2000 inscritos (ya vamos en 100+), luego consentimiento y tomas de muestra. Meses 6–13: secuenciación y plataforma. Mes 14: primer reporte para 250 seleccionados a 30X. Meses 14–24: mejoras con feedback.",
  },
  {
    q: "¿Por qué el primer reporte sale recién en el mes 14?",
    a: "Porque secuenciar 250 genomas a 30X, validarlos, interpretarlos con contexto chileno y construir el asistente IA toma tiempo. Preferimos una v1 sólida en el mes 14 y luego pulirla contigo hasta el mes 24.",
  },
  {
    q: "¿Qué significa ser uno de los 250 seleccionados?",
    a: "Ser parte del grupo 30X que recibe el reporte en el mes 14 por módulos, lo usa y nos ayuda a mejorarlo. Tu experiencia define la versión final al mes 24.",
  },
  {
    q: "¿Qué feedback me van a pedir y cuánto tiempo toma?",
    a: "Encuestas cortas (5–10 min) después de ver cada versión del reporte, más 1–2 sesiones opcionales de prueba de usabilidad (30–40 min, online). Preguntamos: ¿qué entendiste?, ¿qué te preocupó?, ¿qué le cambiarías? Sin respuestas correctas o incorrectas. Puedes saltar rondas si no tienes tiempo.",
  },
  {
    q: "¿Mi reporte se va a actualizar?",
    a: "Sí. Entre el mes 14 y el 24 lanzamos versiones mejoradas según lo que reporten los seleccionados. Te avisamos por correo qué cambió.",
  },
  {
    q: "¿Qué pasa después del mes 24? ¿Pierdo mi acceso?",
    a: "No. Tu acceso de lectura se mantiene después del cierre. Lo que termina en el mes 24 es la fase activa de desarrollo y encuestas. A partir de ahí el reporte queda en modo estable: podrás consultarlo, pero sin nuevas actualizaciones garantizadas salvo hitos científicos mayores.",
  },
  {
    q: "¿Qué pasa si no quedo entre los seleccionados?",
    a: "De los 2000 inscritos llamaremos primero a 250 a toma de muestra. Si no te toca al inicio, quedas en lista de espera semi-automática por ranking por 2 meses: si algún seleccionado no asiste a donar o no participa satisfactoriamente, reasignamos en orden sin re-postular. Si a futuro se consigue financiamiento para ampliar cupos, seguiremos llamando en ese mismo orden.",
  },
  {
    q: "¿Hasta cuándo puedo postular?",
    a: "Hasta llegar a 2000 inscritos. Ya tenemos 100+. Al cerrar, no se aceptan más postulaciones para esta etapa. Si quedas fuera del corte, te avisamos de futuras ampliaciones.",
  },
  {
    q: "¿Podrían abrirse más cupos a futuro?",
    a: "Solo si se consigue financiamiento adicional, hoy no seguro. La idea en estudio sería sumar cupos a baja cobertura 1-3X con imputación (lectura liviana completada por estadística, muy buena para ancestría y más limitada para salud rara). Si ocurre, se llamará por el mismo ranking de lista de espera, sin re-postular.",
  },
];

/** Minúsculas y sin tildes, para que «postulacion» encuentre «postulación». */
export const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** Cada palabra de la búsqueda debe aparecer en la pregunta o la respuesta. */
export function matches(faq: Faq, query: string) {
  const haystack = normalize(`${faq.q} ${faq.a}`);
  return normalize(query).split(/\s+/).filter(Boolean).every((word) => haystack.includes(word));
}
