const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando Survey App...');

// Iniciar servidor backend
console.log('📡 Iniciando servidor backend...');
const backend = spawn(
  'C:\\Program Files\\nodejs\\node.exe',
  ['basic-server.cjs'],
  {
    stdio: 'inherit',
    shell: false
  }
);

// Esperar un momento antes de iniciar el cliente
setTimeout(() => {
  console.log('🌐 Iniciando cliente de desarrollo...');
  
  // Intentar iniciar Vite para el cliente
  const frontend = spawn(
    'cmd.exe',
    ['/c', 'cd', 'node_modules\\vite', '&&', 'C:\\Program Files\\nodejs\\node.exe', 'bin\\vite.js', '--port', '5173'],
    {
      stdio: 'inherit',
      shell: true
    }
  );

  frontend.on('error', (err) => {
    console.log('⚠️  No se pudo iniciar Vite, pero el servidor backend está funcionando');
    console.log('📋 Puedes acceder a la API en: http://localhost:3000/api');
    console.log('💡 Para construir el cliente manualmente: npm run build');
  });

}, 2000);

// Manejar cierre
process.on('SIGINT', () => {
  console.log('\\n🛑 Deteniendo servidores...');
  backend.kill();
  process.exit();
});

console.log('\\n✅ Servidores iniciados:');
console.log('📊 Backend API: http://localhost:3000');
console.log('🌐 Frontend (si funciona): http://localhost:5173');
console.log('\\nPresiona Ctrl+C para detener todos los servicios');