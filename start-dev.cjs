#!/usr/bin/env node

// Script de desarrollo simple que no requiere tsx
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor de desarrollo...');

// Establecer variables de entorno
process.env.NODE_ENV = 'development';

// Intentar diferentes formas de ejecutar TypeScript
const nodePath = process.execPath;
const serverPath = path.join(__dirname, 'server', 'index.ts');

// Opción 1: Intentar con ts-node si existe
const tsNodePath = path.join(__dirname, 'node_modules', '.bin', 'ts-node.cmd');
const fs = require('fs');

if (fs.existsSync(tsNodePath)) {
  console.log('📦 Usando ts-node...');
  const child = spawn(tsNodePath, [serverPath], {
    stdio: 'inherit',
    shell: true
  });
  
  child.on('error', (err) => {
    console.error('❌ Error con ts-node:', err);
    tryAlternative();
  });
} else {
  tryAlternative();
}

function tryAlternative() {
  // Opción 2: Compilar y ejecutar
  console.log('📦 Compilando TypeScript...');
  
  const tscPath = path.join(__dirname, 'node_modules', '.bin', 'tsc.cmd');
  
  if (fs.existsSync(tscPath)) {
    const compileChild = spawn(tscPath, ['--outDir', 'dist', '--module', 'commonjs', '--target', 'es2020', 'server/index.ts'], {
      stdio: 'inherit',
      shell: true
    });
    
    compileChild.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Compilación exitosa, ejecutando...');
        const runChild = spawn(nodePath, ['dist/server/index.js'], {
          stdio: 'inherit'
        });
        
        runChild.on('error', (err) => {
          console.error('❌ Error ejecutando:', err);
          fallbackServer();
        });
      } else {
        console.error('❌ Error de compilación');
        fallbackServer();
      }
    });
  } else {
    fallbackServer();
  }
}

function fallbackServer() {
  // Opción 3: Servidor de desarrollo simple
  console.log('📦 Iniciando servidor de desarrollo simple...');
  
  const express = require('express');
  const app = express();
  const cors = require('cors');
  
  app.use(cors());
  app.use(express.json());
  
  // Rutas de ejemplo
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', environment: 'development', timestamp: new Date().toISOString() });
  });
  
  app.get('/api/survey/questions', (req, res) => {
    // Datos de ejemplo
    const questions = [
      {
        id: 1,
        question_text: "¿Prefieres procesar información paso a paso de manera secuencial?",
        question_type: "cognitive_scale",
        category: "Perfil Cognitivo",
        dimension: "Sequential-Global",
        options: null,
        order_num: 1
      },
      {
        id: 2,
        question_text: "¿Aprendes mejor cuando te involucras activamente en actividades prácticas?",
        question_type: "cognitive_scale",
        category: "Perfil Cognitivo",
        dimension: "Active-Reflective",
        options: null,
        order_num: 2
      }
    ];
    res.json(questions);
  });
  
  const PORT = process.env.PORT || 3001;
  
  app.listen(PORT, () => {
    console.log(`✅ Servidor de desarrollo ejecutándose en http://localhost:${PORT}`);
    console.log('📊 Endpoints disponibles:');
    console.log('  GET  /api/health - Estado del servidor');
    console.log('  GET  /api/survey/questions - Preguntas del cuestionario');
  });
}