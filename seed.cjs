// Script temporal para ejecutar seed sin tsx
const { execSync } = require('child_process');
const path = require('path');

const nodePath = '"C:\\Program Files\\nodejs\\node.exe"';
const seedPath = path.join(__dirname, 'server', 'seed.ts');

console.log('🚀 Inicializando base de datos SQLite...');

// Crear un archivo temporal compilado
try {
  // Por ahora, creemos la base de datos manualmente
  const sqlite3 = require('better-sqlite3');
  const db = new sqlite3('dev.db');
  
  // Crear tabla de preguntas de ejemplo
  db.exec(`
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
  
  // Insertar algunas preguntas de ejemplo
  const stmt = db.prepare(`
    INSERT INTO survey_questions (question_text, question_type, category, dimension, options, order_num)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const questions = [
    ["¿Prefieres procesar información paso a paso de manera secuencial?", "cognitive_scale", "Perfil Cognitivo", "Sequential-Global", null, 1],
    ["¿Aprendes mejor cuando te involucras activamente en actividades prácticas?", "cognitive_scale", "Perfil Cognitivo", "Active-Reflective", null, 2],
    ["¿Prefieres la información concreta basada en hechos y datos?", "cognitive_scale", "Perfil Cognitivo", "Sensorial-Intuitive", null, 3],
    ["El material del curso es claro y fácil de entender", "likert", "Evaluación del Curso", null, null, 4],
    ["Las actividades prácticas refuerzan el aprendizaje", "likert", "Evaluación del Curso", null, null, 5],
  ];
  
  questions.forEach(q => stmt.run(...q));
  
  console.log('✅ Base de datos SQLite inicializada con preguntas de ejemplo');
  console.log('📊 Tabla survey_questions creada con éxito');
  
  db.close();
  
} catch (error) {
  console.error('❌ Error al inicializar base de datos:', error);
  process.exit(1);
}

console.log('✅ Seed completado exitosamente!');