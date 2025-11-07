#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
console.log('🚀 Creando base de datos SQLite en:', dbPath);

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Crear tabla de preguntas
  db.run(`
    CREATE TABLE IF NOT EXISTS survey_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL,
      category TEXT,
      dimension TEXT,
      options TEXT,
      order_num INTEGER
    )
  `);
  
  console.log('✅ Tabla survey_questions creada');
  
  // Insertar preguntas de ejemplo
  const stmt = db.prepare(`
    INSERT INTO survey_questions (question_text, question_type, category, dimension, options, order_num)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const questions = [
    ["¿Prefieres procesar información paso a paso de manera secuencial?", "cognitive_scale", "Perfil Cognitivo", "Sequential-Global", null, 1],
    ["¿Aprendes mejor cuando te involucras activamente en actividades prácticas?", "cognitive_scale", "Perfil Cognitivo", "Active-Reflective", null, 2],
    ["¿Prefieres la información concreta basada en hechos y datos?", "cognitive_scale", "Perfil Cognitivo", "Sensorial-Intuitive", null, 3],
    ["¿Te sientes cómodo con la información visual como diagramas y gráficos?", "cognitive_scale", "Perfil Cognitivo", "Visual-Verbal", null, 4],
    ["El material del curso es claro y fácil de entender", "likert", "Evaluación del Curso", null, null, 5],
    ["Las actividades prácticas refuerzan el aprendizaje", "likert", "Evaluación del Curso", null, null, 6],
    ["El ritmo del curso es adecuado", "likert", "Evaluación del Curso", null, null, 7],
    ["¿Cuál es tu estilo de aprendizaje principal?", "multiple_choice", "Perfil de Aprendizaje", null, "Visual|Auditivo|Kinestésico", 8],
    ["¿Qué tan satisfecho estás con el curso?", "multiple_choice", "Evaluación del Curso", null, "Muy satisfecho|Satisfecho|Neutral|Insatisfecho|Muy insatisfecho", 9],
    ["¿Qué mejorarías en el curso?", "text", "Feedback Abierto", null, null, 10]
  ];
  
  questions.forEach(q => stmt.run(...q));
  stmt.finalize();
  
  console.log('✅ Preguntas insertadas');
  
  // Crear tabla de usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('✅ Tabla users creada');
  
  // Crear tabla de respuestas
  db.run(`
    CREATE TABLE IF NOT EXISTS survey_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      question_id INTEGER,
      response_value TEXT,
      response_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (question_id) REFERENCES survey_questions (id)
    )
  `);
  
  console.log('✅ Tabla survey_responses creada');
});

db.close((err) => {
  if (err) {
    console.error('❌ Error al cerrar la base de datos:', err);
    process.exit(1);
  } else {
    console.log('✅ Base de datos SQLite creada exitosamente!');
    console.log('📊 Archivo:', dbPath);
    console.log('📋 Tablas creadas: survey_questions, users, survey_responses');
  }
});