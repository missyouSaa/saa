#!/usr/bin/env python3
import sqlite3
import os

# Crear base de datos SQLite con datos de ejemplo
db_path = 'dev.db'

# Eliminar base de datos existente si existe
if os.path.exists(db_path):
    os.remove(db_path)

# Conectar a la base de datos
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Crear tabla de preguntas
cursor.execute('''
CREATE TABLE survey_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL,
    category TEXT,
    dimension TEXT,
    options TEXT,
    order_num INTEGER
)
''')

# Insertar preguntas de ejemplo
questions = [
    ("¿Prefieres procesar información paso a paso de manera secuencial?", "cognitive_scale", "Perfil Cognitivo", "Sequential-Global", None, 1),
    ("¿Aprendes mejor cuando te involucras activamente en actividades prácticas?", "cognitive_scale", "Perfil Cognitivo", "Active-Reflective", None, 2),
    ("¿Prefieres la información concreta basada en hechos y datos?", "cognitive_scale", "Perfil Cognitivo", "Sensorial-Intuitive", None, 3),
    ("¿Te sientes cómodo con la información visual como diagramas y gráficos?", "cognitive_scale", "Perfil Cognitivo", "Visual-Verbal", None, 4),
    ("El material del curso es claro y fácil de entender", "likert", "Evaluación del Curso", None, None, 5),
    ("Las actividades prácticas refuerzan el aprendizaje", "likert", "Evaluación del Curso", None, None, 6),
    ("El ritmo del curso es adecuado", "likert", "Evaluación del Curso", None, None, 7),
    ("¿Cuál es tu estilo de aprendizaje principal?", "multiple_choice", "Perfil de Aprendizaje", None, "Visual|Auditivo|Kinestésico", 8),
    ("¿Qué tan satisfecho estás con el curso?", "multiple_choice", "Evaluación del Curso", None, "Muy satisfecho|Satisfecho|Neutral|Insatisfecho|Muy insatisfecho", 9),
    ("¿Qué mejorarías en el curso?", "text", "Feedback Abierto", None, None, 10)
]

cursor.executemany('INSERT INTO survey_questions (question_text, question_type, category, dimension, options, order_num) VALUES (?, ?, ?, ?, ?, ?)', questions)

# Crear tabla de usuarios
cursor.execute('''
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')

# Crear tabla de respuestas
cursor.execute('''
CREATE TABLE survey_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    question_id INTEGER,
    response_value TEXT,
    response_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (question_id) REFERENCES survey_questions (id)
)
''')

# Confirmar cambios
conn.commit()
conn.close()

print(f"✅ Base de datos SQLite creada exitosamente en {db_path}")
print("📊 Tablas creadas:")
print("- survey_questions (preguntas del cuestionario)")
print("- users (usuarios)")
print("- survey_responses (respuestas)")
print("📋 Datos de ejemplo insertados")