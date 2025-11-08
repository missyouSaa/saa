const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3003; // Puerto diferente para evitar conflictos

// Tipos MIME
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Datos de ejemplo
const surveyQuestions = [
  {
    id: 1,
    question: "¿Con qué frecuencia utilizas tecnología en tu trabajo diario?",
    type: "multiple_choice",
    options: ["Constantemente", "Varias veces al día", "Ocasionalmente", "Raramente"],
    category: "Uso de tecnología"
  },
  {
    id: 2,
    question: "¿Qué herramientas tecnológicas utilizas más frecuentemente?",
    type: "multiple_choice",
    options: ["Computadora/laptop", "Smartphone", "Tablet", "Otro dispositivo"],
    category: "Dispositivos"
  },
  {
    id: 3,
    question: "¿Qué tan cómodo te sientes al adoptar nuevas tecnologías?",
    type: "rating",
    scale: 5,
    category: "Adaptación"
  }
];

// Usuarios de prueba
const users = {
  estudiante_prueba: {
    password: 'student123',
    role: 'student',
    name: 'Estudiante de Prueba',
    id: 'student_001'
  },
  maestro_prueba: {
    password: 'teacher123',
    role: 'teacher',
    name: 'Maestro de Prueba',
    id: 'teacher_001'
  }
};

// Datos del estudiante
const studentData = {
  id: 'student_001',
  name: 'Estudiante de Prueba',
  email: 'estudiante@universidad.edu.mx',
  career: 'Ingeniería en Tecnologías de la Información',
  semester: '6to',
  completedSurveys: 3,
  totalSurveys: 5,
  averageGrade: 8.5,
  progress: 60
};

// Datos del maestro
const teacherData = {
  id: 'teacher_001',
  name: 'Maestro de Prueba',
  email: 'maestro@universidad.edu.mx',
  totalStudents: 45,
  averageGrade: 8.2,
  completionRate: 75,
  surveysCompleted: 3
};

// Encuestas pendientes del estudiante
const pendingSurveys = [
  {
    id: 1,
    title: 'Encuesta de Tecnología Educativa',
    description: 'Evaluación sobre el uso de tecnología en el aula',
    deadline: '2024-01-15',
    progress: 0
  },
  {
    id: 2,
    title: 'Evaluación de Docentes',
    description: 'Retroalimentación sobre el desempeño docente',
    deadline: '2024-01-20',
    progress: 30
  }
];

// Estudiantes del maestro
const students = [
  { id: 'student_001', name: 'Juan Pérez', completedSurveys: 5, averageGrade: 9.0 },
  { id: 'student_002', name: 'María García', completedSurveys: 4, averageGrade: 8.5 },
  { id: 'student_003', name: 'Carlos López', completedSurveys: 3, averageGrade: 7.8 },
  { id: 'student_004', name: 'Ana Martínez', completedSurveys: 5, averageGrade: 9.2 },
  { id: 'student_005', name: 'Luis Rodríguez', completedSurveys: 2, averageGrade: 6.5 }
];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API endpoints
  if (pathname === '/api/health') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', message: 'Servidor funcionando' }));
    return;
  }

  // Autenticación
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { username, password, role } = JSON.parse(body);
        const user = users[username];
        
        if (user && user.password === password && user.role === role) {
          const token = Buffer.from(`${username}:${role}`).toString('base64');
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            token: token,
            user: {
              id: user.id,
              username: username,
              name: user.name,
              role: user.role
            }
          }));
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(401);
          res.end(JSON.stringify({ success: false, message: 'Credenciales inválidas' }));
        }
      } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, message: 'Error en la solicitud' }));
      }
    });
    return;
  }

  // Datos del estudiante
  if (pathname === '/api/student/profile') {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(401);
      res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
      return;
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: studentData }));
    return;
  }

  // Encuestas pendientes del estudiante
  if (pathname === '/api/student/surveys/pending') {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(401);
      res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
      return;
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: pendingSurveys }));
    return;
  }

  // Métricas del maestro
  if (pathname === '/api/teacher/metrics') {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(401);
      res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
      return;
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: teacherData }));
    return;
  }

  // Estudiantes del maestro
  if (pathname === '/api/teacher/students') {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(401);
      res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
      return;
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: students }));
    return;
  }

  if (pathname === '/api/survey-questions') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify(surveyQuestions));
    return;
  }

  if (pathname === '/api/survey-responses' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('Respuestas recibidas:', body);
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, message: 'Respuestas guardadas' }));
    });
    return;
  }

  // Servir archivos estáticos
  let filePath = path.join(__dirname, 'client', pathname);
  
  // Rutas específicas para dashboards
  if (pathname === '/student/dashboard') {
    const studentDashboardPath = path.join(__dirname, 'client', 'student-dashboard.html');
    if (fs.existsSync(studentDashboardPath)) {
      filePath = studentDashboardPath;
    } else {
      filePath = path.join(__dirname, 'client', 'login.html');
    }
  } else if (pathname === '/teacher/dashboard') {
    const teacherDashboardPath = path.join(__dirname, 'client', 'teacher-dashboard.html');
    if (fs.existsSync(teacherDashboardPath)) {
      filePath = teacherDashboardPath;
    } else {
      filePath = path.join(__dirname, 'client', 'login.html');
    }
  } else if (pathname === '/survey.html') {
    const surveyPath = path.join(__dirname, 'client', 'index.html');
    if (fs.existsSync(surveyPath)) {
      filePath = surveyPath;
    }
  } else if (pathname === '/') {
    // Si es la raíz, servir la página de login
    const loginPath = path.join(__dirname, 'client', 'login.html');
    if (fs.existsSync(loginPath)) {
      filePath = loginPath;
    } else {
      // Si no existe login.html, usar index.html
      const indexPath = path.join(__dirname, 'client', 'index.html');
      if (fs.existsSync(indexPath)) {
        filePath = indexPath;
      }
    }
  } else if (!fs.existsSync(filePath)) {
    // Si no existe el archivo, intentar con index.html
    const indexPath = path.join(__dirname, 'client', 'index.html');
    if (fs.existsSync(indexPath)) {
      filePath = indexPath;
    } else {
      // Página de bienvenida si no hay cliente
      const welcomeHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Survey App</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 40px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: rgba(255,255,255,0.1);
                padding: 40px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
              }
              .success { 
                color: #4ade80; 
                font-size: 1.2em;
                margin: 20px 0;
              }
              h1 { 
                text-align: center; 
                margin-bottom: 30px;
                font-size: 2.5em;
              }
              ul { 
                list-style: none; 
                padding: 0;
              }
              li { 
                margin: 15px 0; 
                padding: 15px;
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
                transition: all 0.3s ease;
              }
              li:hover {
                background: rgba(255,255,255,0.2);
                transform: translateX(10px);
              }
              a { 
                color: #60a5fa; 
                text-decoration: none; 
                font-weight: bold;
              }
              a:hover { 
                color: #93c5fd; 
                text-decoration: underline;
              }
              .api-link {
                background: rgba(96, 165, 250, 0.2);
                padding: 20px;
                border-radius: 15px;
                margin: 20px 0;
              }
              code {
                background: rgba(0,0,0,0.3);
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🚀 Servidor Survey App</h1>
              <p class="success">✅ El servidor está funcionando perfectamente</p>
              
              <h2>📡 API Endpoints Disponibles:</h2>
              <div class="api-link">
                <ul>
                  <li><a href="/api/health">📊 /api/health</a> - Estado del servidor</li>
                  <li><a href="/api/survey-questions">❓ /api/survey-questions</a> - Preguntas de encuesta</li>
                </ul>
              </div>
              
              <h2>🛠️ Opciones de desarrollo:</h2>
              <ul>
                <li>Para construir el cliente: <code>npm run build</code></li>
                <li>Para desarrollo con hot-reload: <code>npm run dev</code></li>
                <li>Servidor ejecutándose en: <strong>http://localhost:${PORT}</strong></li>
              </ul>
              
              <p style="text-align: center; margin-top: 30px; font-size: 0.9em; opacity: 0.8;">
                💡 El cliente React estará disponible cuando construyas el proyecto
              </p>
            </div>
          </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end(welcomeHtml);
      return;
    }
  }

  // Determinar tipo MIME
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  // Leer y servir archivo
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Archivo no encontrado');
      return;
    }

    res.setHeader('Content-Type', contentType);
    res.writeHead(200);
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api`);
  console.log(`💡 Prueba los endpoints:`);
  console.log(`   - http://localhost:${PORT}/api/health`);
  console.log(`   - http://localhost:${PORT}/api/survey-questions`);
});