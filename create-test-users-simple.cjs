// Script para crear usuarios de prueba usando el servidor
async function createTestUsers() {
  try {
    console.log('🔄 Creando usuarios de prueba...');

    // Crear estudiante de prueba
    const studentData = {
      username: 'estudiante_prueba',
      email: 'estudiante@ejemplo.com',
      password: 'student123',
      firstName: 'Juan',
      lastName: 'Pérez',
      role: 'student',
      studentId: '2024001',
      career: 'Ingeniería en Sistemas Computacionales',
      semester: 3
    };

    const studentResponse = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData)
    });

    if (studentResponse.ok) {
      console.log('✅ Estudiante creado exitosamente');
    } else {
      const error = await studentResponse.json();
      console.log('⚠️  Estudiante ya existe o error:', error.message);
    }

    // Crear maestro de prueba
    const teacherData = {
      username: 'maestro_prueba',
      email: 'maestro@ejemplo.com',
      password: 'teacher123',
      firstName: 'María',
      lastName: 'González',
      role: 'teacher'
    };

    const teacherResponse = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teacherData)
    });

    if (teacherResponse.ok) {
      console.log('✅ Maestro creado exitosamente');
    } else {
      const error = await teacherResponse.json();
      console.log('⚠️  Maestro ya existe o error:', error.message);
    }

    console.log('');
    console.log('🎉 ¡Usuarios de prueba listos!');
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
    console.log('💡 El login está funcionando, ¡prueba iniciar sesión!');

  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  }
}

// Ejecutar
console.log('🚀 Conectando al servidor...');
createTestUsers();