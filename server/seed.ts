import { db } from "./db";
import { surveyQuestions } from "@shared/schema";

async function seed() {
  console.log("Iniciando seed de datos...");

  // Preguntas para Perfil Cognitivo
  const cognitiveQuestions = [
    {
      questionText: "¿Prefieres procesar información paso a paso de manera secuencial?",
      questionType: "cognitive_scale" as const,
      category: "Perfil Cognitivo",
      dimension: "Sequential-Global",
      order: 1,
    },
    {
      questionText: "¿Aprendes mejor cuando te involucras activamente en actividades prácticas?",
      questionType: "cognitive_scale" as const,
      category: "Perfil Cognitivo",
      dimension: "Active-Reflective",
      order: 2,
    },
    {
      questionText: "¿Prefieres la información concreta basada en hechos y datos?",
      questionType: "cognitive_scale" as const,
      category: "Perfil Cognitivo",
      dimension: "Sensorial-Intuitive",
      order: 3,
    },
  ];

  // Preguntas tipo Likert sobre el curso
  const likertQuestions = [
    {
      questionText: "El material del curso es claro y fácil de entender",
      questionType: "likert" as const,
      category: "Evaluación del Curso",
      order: 4,
    },
    {
      questionText: "Las actividades prácticas refuerzan el aprendizaje",
      questionType: "likert" as const,
      category: "Evaluación del Curso",
      order: 5,
    },
    {
      questionText: "El profesor explica los conceptos de manera efectiva",
      questionType: "likert" as const,
      category: "Evaluación del Curso",
      order: 6,
    },
    {
      questionText: "Me siento motivado para aprender en este curso",
      questionType: "likert" as const,
      category: "Motivación",
      order: 7,
    },
    {
      questionText: "El tiempo asignado para las tareas es adecuado",
      questionType: "likert" as const,
      category: "Carga de Trabajo",
      order: 8,
    },
  ];

  // Preguntas de opción múltiple
  const multipleChoiceQuestions = [
    {
      questionText: "¿Cuál es tu estilo de estudio preferido?",
      questionType: "multiple_choice" as const,
      category: "Hábitos de Estudio",
      options: ["Solo", "En grupo pequeño", "En grupo grande", "Con tutor individual"],
      order: 9,
    },
    {
      questionText: "¿Qué recurso de aprendizaje encuentras más útil?",
      questionType: "multiple_choice" as const,
      category: "Recursos de Aprendizaje",
      options: ["Videos", "Lecturas", "Ejercicios prácticos", "Discusiones"],
      order: 10,
    },
  ];

  // Pregunta de texto
  const textQuestions = [
    {
      questionText: "¿Qué aspectos del curso te gustaría que se mejoraran?",
      questionType: "text" as const,
      category: "Retroalimentación",
      order: 11,
    },
    {
      questionText: "Describe una experiencia de aprendizaje positiva en este curso",
      questionType: "text" as const,
      category: "Experiencias",
      order: 12,
    },
  ];

  const allQuestions = [
    ...cognitiveQuestions,
    ...likertQuestions,
    ...multipleChoiceQuestions,
    ...textQuestions,
  ];

  try {
    // Check if questions already exist
    const existing = await db.select().from(surveyQuestions).limit(1);
    
    if (existing.length > 0) {
      console.log("Las preguntas de encuesta ya existen. Omitiendo seed.");
      return;
    }

    // Insert questions
    await db.insert(surveyQuestions).values(allQuestions);
    
    console.log(`✓ ${allQuestions.length} preguntas de encuesta creadas exitosamente`);
  } catch (error) {
    console.error("Error al crear preguntas:", error);
    throw error;
  }

  console.log("Seed completado!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error en seed:", error);
  process.exit(1);
});
