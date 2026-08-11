const SUBJECTS: Record<string, string> = {
  MATHEMATICS: "Matemáticas",
  NATURAL_SCIENCE: "Ciencias Naturales",
  KNOWLEDGE_OF_THE_NATURAL_SOCIAL_AND_CULTURAL_ENVIRONMENT: "Conocimiento del Medio",
  SPANISH_LANGUAGE_AND_LITERATURE: "Lengua Castellana y Literatura",
  FOREIGN_LANGUAGE_ENGLISH: "Lengua Extranjera: Inglés",
  ART_EDUCATION: "Educación Artística",
  PHYSICAL_EDUCATION: "Educación Física",
  CIVIC_AND_ETHICAL_VALUES: "Educación en Valores Cívicos y Éticos",
  GEOGRAPHY_AND_HISTORY: "Geografía e Historia",
  PHYSICS_AND_CHEMISTRY: "Física y Química",
  BIOLOGY_AND_GEOLOGY: "Biología y Geología",
};

const CONTENT_LABELS: Record<string, string> = {
  duration_days: "Duración en días",
  materials: "Materiales",
  daily_prompts: "Preguntas para cada día",
  teacher_review_required: "Revisión del profesor",
};

export function subjectLabel(subject: string): string {
  return SUBJECTS[subject] ?? humanLabel(subject);
}

export function contentLabel(key: string): string {
  return CONTENT_LABELS[key] ?? humanLabel(key);
}

function humanLabel(value: string): string {
  const words = value.replaceAll("_", " ").toLocaleLowerCase("es");
  return words.charAt(0).toLocaleUpperCase("es") + words.slice(1);
}
