const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3001;

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

// Usuarios demo y almacenamiento simple
const DEMO_USERS = {
  estudiante_prueba: {
    password: 'student123',
    role: 'student',
    firstName: 'Estudiante',
    lastName: 'Prueba',
    id: 'student_001'
  },
  maestro_prueba: {
    password: 'teacher123',
    role: 'teacher',
    firstName: 'Maestro',
    lastName: 'Prueba',
    id: 'teacher_001'
  }
};

const USERS_FILE = path.join(__dirname, 'server-data', 'users.json');

function ensureUsersFile() {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify({}), 'utf-8');
  } catch (e) {
    console.error('Error preparando almacenamiento de usuarios:', e);
  }
}

function loadUsers() {
  try {
    ensureUsersFile();
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error cargando usuarios:', e);
    return {};
  }
}

function saveUsers(users) {
  try {
    ensureUsersFile();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error guardando usuarios:', e);
  }
}

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

  // Registro de usuarios
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { username, password, role, firstName, lastName } = JSON.parse(body);
        if (!username || !password || !role) {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, message: 'Datos incompletos' }));
          return;
        }
        if (typeof username !== 'string' || username.length < 3) {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, message: 'Usuario debe tener al menos 3 caracteres' }));
          return;
        }
        if (typeof password !== 'string' || password.length < 6) {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, message: 'Contraseña debe tener al menos 6 caracteres' }));
          return;
        }
        if (role !== 'student' && role !== 'teacher') {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, message: 'Rol inválido' }));
          return;
        }
        const users = loadUsers();
        if (users[username] || DEMO_USERS[username]) {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(409);
          res.end(JSON.stringify({ success: false, message: 'Usuario ya existe' }));
          return;
        }
        const id = role === 'teacher' ? `teacher_${Date.now()}` : `student_${Date.now()}`;
        users[username] = { password, role, firstName: firstName || '', lastName: lastName || '', id };
        saveUsers(users);
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(201);
        res.end(JSON.stringify({ success: true, user: { id, username, role, firstName, lastName } }));
      } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, message: 'Error en la solicitud' }));
      }
    });
    return;
  }

  // Inicio de sesión
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { username, password, role } = JSON.parse(body);
        const users = loadUsers();
        const user = users[username] || DEMO_USERS[username];
        if (user && user.password === password && user.role === role) {
          const token = Buffer.from(`${username}:${role}`).toString('base64');
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            token,
            user: {
              id: user.id,
              username,
              firstName: user.firstName || (user.role === 'student' ? 'Estudiante' : 'Maestro'),
              lastName: user.lastName || 'Prueba',
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

  // Perfil del estudiante
  if (pathname === '/api/student/profile') {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(401);
      res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
      return;
    }
    const profile = {
      id: 'student_001',
      name: 'Estudiante de Prueba',
      email: 'estudiante@universidad.edu.mx',
      career: 'Ingeniería en Tecnologías de la Información',
      semester: '6to',
      surveysCompleted: 3,
      surveysTotal: 5,
      completionRate: 60,
      average: 8.5,
      weeklyProgress: [
        { weekNumber: 1, tasksCompleted: 3, tasksTotal: 5 },
        { weekNumber: 2, tasksCompleted: 4, tasksTotal: 6 },
        { weekNumber: 3, tasksCompleted: 5, tasksTotal: 7 },
        { weekNumber: 4, tasksCompleted: 2, tasksTotal: 4 }
      ]
    };
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: profile }));
    return;
  }

  // Encuestas pendientes del estudiante
  if (pathname === '/api/student/surveys/pending') {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(401);
      res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
      return;
    }
    const pending = [
      { question: 'Encuesta de Tecnología Educativa', category: 'Tecnología' },
      { question: 'Evaluación de Docentes', category: 'Desempeño' }
    ];
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify(pending));
    return;
  }

  // Métricas del profesor
  if (pathname === '/api/teacher/metrics') {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(401);
      res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
      return;
    }
    const metrics = {
      totalStudents: 45,
      averageGrade: 8.2,
      completionRate: 75,
      surveysCompleted: 3
    };
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: metrics }));
    return;
  }

  // Lista de estudiantes del profesor
  if (pathname === '/api/teacher/students') {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(401);
      res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
      return;
    }
    const list = [
      { name: 'Juan Pérez', studentId: 'student_001', career: 'ITI', semester: '6to', average: 9.0, completionRate: 100 },
      { name: 'María García', studentId: 'student_002', career: 'ITI', semester: '5to', average: 8.5, completionRate: 80 },
      { name: 'Carlos López', studentId: 'student_003', career: 'ITI', semester: '4to', average: 7.8, completionRate: 65 }
    ];
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: list }));
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

              <h2>🎓 DSS-ITSU y ECAS</h2>
              <ul>
                <li><a href="/dss-itsu/index.html">🏠 Inicio DSS-ITSU</a> - Selección de rol</li>
                <li><a href="/dss-itsu/test-ils.html">🧪 Test ILS</a> - Cuestionario de 44 preguntas</li>
                <li><a href="/dss-itsu/perfil.html">🧠 Perfil + ECAS</a> - Radar y predicción de riesgo</li>
                <li><a href="/dss-itsu/recomendaciones.html">✅ Recomendaciones</a> - Acciones personalizadas</li>
                <li><a href="/dss-itsu/docente.html">👩‍🏫 Panel Docente</a> - Riesgos por estudiante y explicación</li>
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
