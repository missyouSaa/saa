# Saa App

Aplicación con cliente estático (HTML) y servidor Node.js con endpoints de autenticación y dashboards.

## 📝 Guía rápida (abrir en otro computador con TRAE)

- Requisitos: instala Node.js LTS, Git y la app TRAE (inicia sesión y conecta GitHub).
- En TRAE, abre el repo `missyouSaa/saa` desde tu GitHub.
- Arranca el servidor simple (por defecto `PORT=3005`):
  - Windows con Node en PATH: `node basic-server.cjs`
  - Windows sin PATH: `& 'C:\\Program Files\\nodejs\\node.exe' basic-server.cjs`
  - macOS/Linux: `node basic-server.cjs`
- Abre `http://localhost:3005/login.html` y valida el flujo.
- Credenciales demo:
  - Estudiante: usuario `estudiante_prueba`, contraseña `student123`
  - Docente: usuario `maestro_prueba`, contraseña `teacher123`
- Verifica redirecciones: estudiante → `student-dashboard.html`, docente → `teacher-dashboard.html`.
- Alternativa Dev completo (cliente + API integrados): `npm install` y luego `npm run dev`.
- Problemas comunes:
  - `node` no reconocido: usa la ruta completa de `node.exe` indicada arriba o añade Node al PATH.
  - Puerto ocupado: ejecuta con otro puerto (`$env:PORT=3006; node basic-server.cjs` en Windows, `PORT=3006 node basic-server.cjs` en macOS/Linux).
  - En GitHub Pages: las rutas `/api/*` requieren backend; configura `?api=https://tu-backend` o `localStorage.apiBase`.

## 🚀 Ejecutar desde GitHub

Hay dos formas principales:

- GitHub Pages (solo cliente): `client/` se publica como sitio estático.
- GitHub Codespaces o clon local (cliente + servidor): ejecuta el backend y el cliente juntos.

### GitHub Pages (cliente)

Ya está configurado el workflow en `.github/workflows/deploy-pages.yml` para publicar `client/`.

Pasos:
- Entra a `Settings → Pages` y selecciona "GitHub Actions" como fuente.
- Haz push a `main` o ejecuta el workflow manualmente.
- La URL será `https://<tu-usuario>.github.io/<repo>/` (por ejemplo: `https://missyouSaa.github.io/saa/`).

Importante:
- El login/registro requieren un backend accesible. En GitHub Pages puedes indicar el backend con:
  - Parámetro de URL: añade `?api=https://tu-backend` a la URL.
  - O guarda base API: en consola del navegador ejecuta `localStorage.setItem('apiBase','https://tu-backend')`.

### Desplegar backend (Render/Railway)

El backend usa `basic-server.cjs` y respeta `PORT` del entorno.

Render (ejemplo):
- Crea un nuevo servicio "Web Service" conectado a este repo.
- Start Command: `node basic-server.cjs`.
- Asegúrate de que el servicio use la variable `PORT` (Render la inyecta).
- Obtén la URL pública (p.ej. `https://saa-backend.onrender.com`).
- Configura el cliente (GitHub Pages) con `?api=https://saa-backend.onrender.com`.

Railway (alternativa):
- Crea proyecto y despliega desde GitHub.
- Start Command: `node basic-server.cjs`.
- Usa el puerto del entorno (`PORT`).

### GitHub Codespaces

Permite ejecutar todo desde GitHub sin instalar nada local.
- Abre el repo → Code → "Create codespace on main".
- En el terminal del Codespace:
  - `node basic-server.cjs` (backend + estáticos)
  - Abre el puerto publicado y usa la URL generada para el cliente.

## 🧪 Ejecución Local

Requisitos:
- Node.js

Backend y cliente estático:
```bash
# Windows (PowerShell)
$env:PORT=3006; node basic-server.cjs
# macOS/Linux
PORT=3006 node basic-server.cjs
```

Cliente: abrir `http://localhost:3006/`.

## 📡 Endpoints principales

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- Rutas cliente: `/login.html`, `/student-dashboard.html`, `/teacher-dashboard.html`

## 🔧 Notas de configuración del cliente

- El cliente detecta GitHub Pages y ajusta rutas automáticamente.
- Para usar backend externo en Pages, define `API_BASE` vía `?api=` o `localStorage.apiBase`.

## 📁 Estructura

```
saa/
├── client/                 # HTML/CSS/JS estático y dashboards
├── basic-server.cjs        # Servidor Node simple (API + estáticos)
├── server/                 # Código TS (opcional, no usado por el server simple)
├── .github/workflows/      # Deploy a GitHub Pages
└── README.md               # Instrucciones
```

## 🛠️ Problemas comunes

- `node` no reconocido: usa ruta completa `"C:\\Program Files\\nodejs\\node.exe"`.
- Puerto ocupado: cambia `PORT` (ej. 3006).
- En Pages sin backend: configura `?api=` o `localStorage.apiBase` con la URL del backend.

## 🎯 Estado

- Cliente estático listo para Pages.
- Backend listo para desplegar (Render/Railway) o ejecutar localmente.
