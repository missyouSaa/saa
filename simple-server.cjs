const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del cliente
const clientPath = path.join(__dirname, 'client', 'dist');
const clientSrcPath = path.join(__dirname, 'client', 'src');

// Si existe la carpeta dist, usarla
if (fs.existsSync(clientPath)) {
  app.use(express.static(clientPath));
} else if (fs.existsSync(clientSrcPath)) {
  // Si no existe dist, servir el cliente en desarrollo
  console.log('📁 Servidor cliente en modo desarrollo');
  // Servir archivos estáticos del cliente
  app.use('/src', express.static(path.join(__dirname, 'client', 'src')));
  app.use(express.static(path.join(__dirname, 'client')));
}

// API básica
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando' });
});

// Obtener preguntas de encuesta
app.get('/api/survey-questions', (req, res) => {
  const questions = [
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
  
  res.json(questions);
});

// Enviar respuestas
app.post('/api/survey-responses', (req, res) => {
  console.log('Respuestas recibidas:', req.body);
  res.json({ success: true, message: 'Respuestas guardadas' });
});

// Ruta catch-all para SPA
app.get('*', (req, res) => {
  const indexPath = path.join(clientPath, 'index.html');
  const devIndexPath = path.join(__dirname, 'client', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else if (fs.existsSync(devIndexPath)) {
    res.sendFile(devIndexPath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Survey App</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 600px; margin: 0 auto; }
            .success { color: green; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Servidor funcionando correctamente</h1>
            <p class="success">El servidor está listo para recibir peticiones.</p>
            <h2>Endpoints disponibles:</h2>
            <ul>
              <li><a href="/api/health">/api/health</a> - Estado del servidor</li>
              <li><a href="/api/survey-questions">/api/survey-questions</a> - Preguntas de encuesta</li>
            </ul>
            <p>Para construir el cliente: <code>npm run build</code></p>
          </div>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api`);
});