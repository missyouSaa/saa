const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function createTestUsers() {
  const dbPath = path.join(__dirname, 'server', 'dev.db');
  const db = new sqlite3.Database(dbPath);

  try {
    console.log('🔄 Creando usuarios de prueba...');

    // Crear estudiante de prueba
    const studentPassword = await hashPassword('student123');
    const studentUser = {
      id: crypto.randomUUID(),
      username: 'estudiante_prueba',
      email: 'estudiante@ejemplo.com',
      password: studentPassword,
      firstName: 'Juan',
      lastName: 'Pérez',
      role: 'student',
      createdAt: new Date().toISOString()
    };

    // Insertar usuario estudiante
    db.run(`
      INSERT OR REPLACE INTO users (id, username, email, password, firstName, lastName, role, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      studentUser.id,
      studentUser.username,
      studentUser.email,
      studentUser.password,
      studentUser.firstName,
      studentUser.lastName,
      studentUser.role,
      studentUser.createdAt
    ]);

    // Crear perfil de estudiante
    db.run(`
      INSERT OR REPLACE INTO students (id, userId, studentId, career, semester, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      crypto.randomUUID(),
      studentUser.id,
      '2024001',
      'Ingeniería en Sistemas Computacionales',
      3,
      new Date().toISOString()
    ]);

    // Crear maestro de prueba
    const teacherPassword = await hashPassword('teacher123');
    const teacherUser = {
      id: crypto.randomUUID(),
      username: 'maestro_prueba',
      email: 'maestro@ejemplo.com',
      password: teacherPassword,
      firstName: 'María',
      lastName: 'González',
      role: 'teacher',
      createdAt: new Date().toISOString()
    };

    // Insertar usuario maestro
    db.run(`
      INSERT OR REPLACE INTO users (id, username, email, password, firstName, lastName, role, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      teacherUser.id,
      teacherUser.username,
      teacherUser.email,
      teacherUser.password,
      teacherUser.firstName,
      teacherUser.lastName,
      teacherUser.role,
      teacherUser.createdAt
    ]);

    console.log('✅ Usuarios de prueba creados exitosamente!');
    console.log('');
    console.log('👨‍🎓 ESTUDIANTE:');
    console.log('   Usuario: estudiante_prueba');
    console.log('   Contraseña: student123');
    console.log('');
    console.log('👩‍🏫 MAESTRO:');
    console.log('   Usuario: maestro_prueba');
    console.log('   Contraseña: teacher123');
    console.log('');
    console.log('🌐 Puedes probarlos en: http://localhost:3001');

  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  } finally {
    db.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createTestUsers().catch(console.error);
}

module.exports = { createTestUsers };