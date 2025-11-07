-- Inicializar base de datos SQLite con datos de ejemplo

-- Crear tabla de preguntas
CREATE TABLE IF NOT EXISTS survey_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  category TEXT,
  dimension TEXT,
  options TEXT,
  order_num INTEGER
);

-- Insertar preguntas de ejemplo
INSERT INTO survey_questions (question_text, question_type, category, dimension, options, order_num) VALUES
("¿Prefieres procesar información paso a paso de manera secuencial?", "cognitive_scale", "Perfil Cognitivo", "Sequential-Global", NULL, 1),
("¿Aprendes mejor cuando te involucras activamente en actividades prácticas?", "cognitive_scale", "Perfil Cognitivo", "Active-Reflective", NULL, 2),
("¿Prefieres la información concreta basada en hechos y datos?", "cognitive_scale", "Perfil Cognitivo", "Sensorial-Intuitive", NULL, 3),
("¿Te sientes cómodo con la información visual como diagramas y gráficos?", "cognitive_scale", "Perfil Cognitivo", "Visual-Verbal", NULL, 4),
("El material del curso es claro y fácil de entender", "likert", "Evaluación del Curso", NULL, NULL, 5),
("Las actividades prácticas refuerzan el aprendizaje", "likert", "Evaluación del Curso", NULL, NULL, 6),
("El ritmo del curso es adecuado", "likert", "Evaluación del Curso", NULL, NULL, 7),
("¿Cuál es tu estilo de aprendizaje principal?", "multiple_choice", "Perfil de Aprendizaje", NULL, "Visual|Auditivo|Kinestésico", 8),
("¿Qué tan satisfecho estás con el curso?", "multiple_choice", "Evaluación del Curso", NULL, "Muy satisfecho|Satisfecho|Neutral|Insatisfecho|Muy insatisfecho", 9),
("¿Qué mejorarías en el curso?", "text", "Feedback Abierto", NULL, NULL, 10);

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'student',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de respuestas
CREATE TABLE IF NOT EXISTS survey_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  question_id INTEGER,
  response_value TEXT,
  response_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (question_id) REFERENCES survey_questions (id)
);