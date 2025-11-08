const http = require('http');

// Configuración
const SERVER_URL = 'http://localhost:3003';
const API_BASE = `${SERVER_URL}/api`;

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Función para hacer peticiones HTTP
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Función principal de diagnóstico
async function runDiagnostics() {
  console.log(`${colors.blue}🔍 Iniciando diagnóstico del sistema...${colors.reset}\\n`);
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test 1: Verificar servidor
  totalTests++;
  console.log(`${colors.yellow}Test 1: Verificando servidor...${colors.reset}`);
  try {
    const health = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/health',
      method: 'GET'
    });
    
    if (health.status === 200 && health.data.status === 'ok') {
      console.log(`${colors.green}✅ Servidor funcionando correctamente${colors.reset}`);
      passedTests++;
    } else {
      console.log(`${colors.red}❌ Servidor no responde correctamente${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Error conectando al servidor: ${error.message}${colors.reset}`);
  }
  
  // Test 2: Login estudiante
  totalTests++;
  console.log(`\\n${colors.yellow}Test 2: Login de estudiante...${colors.reset}`);
  try {
    const loginData = JSON.stringify({
      username: 'estudiante_prueba',
      password: 'student123',
      role: 'student'
    });
    
    const login = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, loginData);
    
    if (login.status === 200 && login.data.success) {
      console.log(`${colors.green}✅ Login de estudiante exitoso${colors.reset}`);
      console.log(`   Token: ${login.data.token}`);
      console.log(`   Usuario: ${login.data.user.name}`);
      passedTests++;
      
      // Guardar token para pruebas posteriores
      global.studentToken = login.data.token;
    } else {
      console.log(`${colors.red}❌ Login de estudiante fallido: ${login.data.message}${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Error en login de estudiante: ${error.message}${colors.reset}`);
  }
  
  // Test 3: Login maestro
  totalTests++;
  console.log(`\\n${colors.yellow}Test 3: Login de maestro...${colors.reset}`);
  try {
    const loginData = JSON.stringify({
      username: 'maestro_prueba',
      password: 'teacher123',
      role: 'teacher'
    });
    
    const login = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, loginData);
    
    if (login.status === 200 && login.data.success) {
      console.log(`${colors.green}✅ Login de maestro exitoso${colors.reset}`);
      console.log(`   Token: ${login.data.token}`);
      console.log(`   Usuario: ${login.data.user.name}`);
      passedTests++;
      
      // Guardar token para pruebas posteriores
      global.teacherToken = login.data.token;
    } else {
      console.log(`${colors.red}❌ Login de maestro fallido: ${login.data.message}${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Error en login de maestro: ${error.message}${colors.reset}`);
  }
  
  // Test 4: Datos del estudiante
  if (global.studentToken) {
    totalTests++;
    console.log(`\\n${colors.yellow}Test 4: Datos del estudiante...${colors.reset}`);
    try {
      const profile = await makeRequest({
        hostname: 'localhost',
        port: 3003,
        path: '/api/student/profile',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${global.studentToken}`
        }
      });
      
      if (profile.status === 200 && profile.data.success) {
        console.log(`${colors.green}✅ Datos de estudiante obtenidos correctamente${colors.reset}`);
        console.log(`   Nombre: ${profile.data.data.name}`);
        console.log(`   Carrera: ${profile.data.data.career}`);
        passedTests++;
      } else {
        console.log(`${colors.red}❌ Error obteniendo datos del estudiante${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ Error en datos del estudiante: ${error.message}${colors.reset}`);
    }
  }
  
  // Test 5: Datos del maestro
  if (global.teacherToken) {
    totalTests++;
    console.log(`\\n${colors.yellow}Test 5: Datos del maestro...${colors.reset}`);
    try {
      const metrics = await makeRequest({
        hostname: 'localhost',
        port: 3003,
        path: '/api/teacher/metrics',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${global.teacherToken}`
        }
      });
      
      if (metrics.status === 200 && metrics.data.success) {
        console.log(`${colors.green}✅ Datos de maestro obtenidos correctamente${colors.reset}`);
        console.log(`   Nombre: ${metrics.data.data.name}`);
        console.log(`   Total estudiantes: ${metrics.data.data.totalStudents}`);
        passedTests++;
      } else {
        console.log(`${colors.red}❌ Error obteniendo datos del maestro${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ Error en datos del maestro: ${error.message}${colors.reset}`);
    }
  }
  
  // Resumen
  console.log(`\\n${colors.blue}📊 RESUMEN DEL DIAGNÓSTICO${colors.reset}`);
  console.log(`${colors.blue}===========================${colors.reset}`);
  console.log(`${colors.green}✅ Pruebas pasadas: ${passedTests}/${totalTests}${colors.reset}`);
  
  if (passedTests === totalTests) {
    console.log(`${colors.green}🎉 ¡Todo el sistema está funcionando correctamente!${colors.reset}`);
  } else {
    console.log(`${colors.red}⚠️  Hay ${totalTests - passedTests} problema(s) que requieren atención${colors.reset}`);
  }
  
  console.log(`\\n${colors.blue}🌐 URLs disponibles:${colors.reset}`);
  console.log(`   • Login principal: http://localhost:3003/login.html`);
  console.log(`   • Test de login: http://localhost:3003/test-login.html`);
  console.log(`   • Dashboard estudiante: http://localhost:3003/student/dashboard`);
  console.log(`   • Dashboard maestro: http://localhost:3003/teacher/dashboard`);
}

// Ejecutar diagnóstico
runDiagnostics().catch(console.error);