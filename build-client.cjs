const { build } = require('vite');
const path = require('path');

async function buildClient() {
  try {
    console.log('🚀 Iniciando construcción del cliente...');
    
    // Configuración de Vite
    const config = {
      plugins: [
        require('@vitejs/plugin-react').default()
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'client', 'src'),
          '@shared': path.resolve(__dirname, 'shared'),
          '@assets': path.resolve(__dirname, 'attached_assets')
        }
      },
      root: path.resolve(__dirname, 'client'),
      build: {
        outDir: path.resolve(__dirname, 'dist', 'public'),
        emptyOutDir: true,
        rollupOptions: {
          input: path.resolve(__dirname, 'client', 'index.html')
        }
      }
    };

    console.log('📦 Construyendo con Vite...');
    await build(config);
    
    console.log('✅ Construcción completada exitosamente');
    console.log('📁 Archivos generados en: dist/public');
    
  } catch (error) {
    console.error('❌ Error durante la construcción:', error.message);
    process.exit(1);
  }
}

buildClient();