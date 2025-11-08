# Survey App

Aplicación de encuestas tecnológicas construida con React, TypeScript, Node.js y SQLite.

## 🚀 Estado Actual

✅ **Servidor Backend**: Funcionando en http://localhost:3000  
✅ **Base de Datos**: SQLite inicializada con datos de ejemplo  
✅ **API REST**: Endpoints disponibles  
⚠️ **Cliente Frontend**: Requiere construcción manual

## 📋 Requisitos Previos

- Node.js instalado
- npm instalado

## 🔧 Instalación

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Inicializar base de datos** (ya completado):
   - ✅ Archivo `dev.db` creado
   - ✅ Tablas creadas: `survey_questions`, `users`, `survey_responses`
   - ✅ Datos de ejemplo insertados

## 🚀 Uso

### Opción 1: Iniciar todo con un comando
```bash
node start-both.cjs
```

### Opción 2: Iniciar servicios por separado

**Backend (API)**:
```bash
node basic-server.cjs
```
- Servidor: http://localhost:3001
- API: http://localhost:3001/api

**Frontend (Cliente)**:
```bash
# Si Vite funciona:
cd node_modules/vite && node bin/vite.js --port 5173

# Si no, construir manualmente:
npm run build
```

## 📡 API Endpoints Disponibles

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/health` | GET | Estado del servidor |
| `/api/survey-questions` | GET | Obtener preguntas de encuesta |
| `/api/survey-responses` | POST | Enviar respuestas de encuesta |

## 🗃️ Base de Datos

**Archivo**: `dev.db` (SQLite)

**Tablas**:
- `survey_questions`: Preguntas de la encuesta
- `users`: Usuarios del sistema  
- `survey_responses`: Respuestas de los usuarios

## 🛠️ Solución de Problemas

### Error: "node no está reconocido"
- Usa rutas completas: `"C:\\Program Files\\nodejs\\node.exe"`
- Verifica que Node.js esté instalado

### Error: "Cannot find module"
- Asegúrate de ejecutar `npm install` primero
- Verifica que `node_modules` exista

### Cliente no construye
- El servidor backend funciona independientemente
- Puedes acceder a la API directamente desde http://localhost:3000

## 📁 Estructura del Proyecto

```
saa/
├── client/          # Frontend React
├── server/          # Backend Node.js
├── shared/          # Esquemas compartidos
├── dev.db           # Base de datos SQLite
├── basic-server.cjs # Servidor backend funcionando
└── start-both.cjs   # Script de inicio
```

## 🎯 Próximos Pasos

1. ✅ Backend API - **COMPLETADO**
2. ✅ Base de datos - **COMPLETADO**  
3. 🔄 Frontend cliente - En progreso
4. 📊 Integración completa - Pendiente

---

**Estado**: Backend funcionando ✅  
**Última actualización**: Servidor API operativo con datos de ejemplo