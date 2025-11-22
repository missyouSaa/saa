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

## 🌐 Acceso desde otra computadora en la misma red (LAN)

Sigue estos pasos para que otro equipo en tu misma red Wi‑Fi acceda al proyecto:

1) Obtén tu IP local del equipo que ejecutará el servidor
- Windows: abre PowerShell y ejecuta `ipconfig`. Anota el `IPv4 Address` (ej. `192.168.1.25`).
- macOS/Linux: ejecuta `ip a` o `ifconfig` y anota la IP (ej. `192.168.0.12`).

2) Arranca el servidor en ese equipo
- Windows (PowerShell):
  - `& 'C:\Program Files\nodejs\node.exe' basic-server.cjs` (o con puerto específico: `$env:PORT=3006; node basic-server.cjs`)
- macOS/Linux:
  - `PORT=3006 node basic-server.cjs`
- El servidor escucha en todas las interfaces, por lo tanto será accesible vía IP LAN.

3) Permite el acceso en el firewall (Windows)
- Cuando Windows pregunte “Permitir acceso” para Node.js, acepta en redes privadas.
- Si no aparece el aviso, ve a “Firewall de Windows → Permitir una app” y habilita Node.js en redes privadas.

4) Abre desde otro ordenador en la misma red
- En el navegador del segundo equipo, abre `http://<IP_DEL_SERVIDOR>:3006/login.html`.
- Ejemplo: `http://192.168.1.25:3006/login.html`.

5) GitHub Pages con backend en LAN (opcional)
- Si usas Pages para servir el cliente, apunta la API al servidor LAN con:
  - `https://<tu-usuario>.github.io/<repo>/?api=http://<IP_DEL_SERVIDOR>:3006`
- El cliente detectará `API_BASE` vía `?api=` y funcionará con tu servidor local.

6) Problemas comunes
- “Connection refused”: el backend no está corriendo o el puerto/Firewall bloquea la entrada.
- “Timeout”: equipos en redes distintas (aislamiento AP) o perfil de red “Pública” bloquea acceso.
- Solución: comprueba IP correcta, que el puerto sea el mismo, y que el firewall permita Node.js.

7) Nota sobre encuestas
- La página de encuestas fue deshabilitada:
  - `index.html` redirige al login.
  - `survey.html` muestra un aviso y redirige al dashboard.
  - Los dashboards ya no enlazan a la encuesta.
