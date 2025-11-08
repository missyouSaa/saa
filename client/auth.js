// Simple auth utilities and persistent logout bar for static pages
// Detect base path for GitHub Pages vs local
(function () {
  const BASE_PATH = (function () {
    const { pathname } = window.location;
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0 && parts[0] !== 'dss-itsu') {
      return '/' + parts[0];
    }
    return '';
  })();

  function getApiBase() {
    try {
      const urlParam = new URLSearchParams(window.location.search).get('api');
      if (urlParam) return urlParam;
    } catch {}
    try {
      const ls = localStorage.getItem('API_BASE');
      if (ls) return ls;
    } catch {}
    return '';
  }

  function redirectToLogin() {
    const dest = BASE_PATH + '/login.html';
    if (!location.pathname.endsWith('/login.html')) {
      window.location.href = dest;
    }
  }

  function requireAuth(opts) {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    if (!token) {
      redirectToLogin();
      return false;
    }
    if (opts && opts.allowedRole && role !== opts.allowedRole) {
      // Redirect to correct dashboard if role mismatch
      const dest = role === 'student' ? (BASE_PATH + '/student-dashboard.html') : (BASE_PATH + '/teacher-dashboard.html');
      window.location.href = dest;
      return false;
    }
    return true;
  }

  async function logout() {
    try {
      const api = getApiBase();
      const token = localStorage.getItem('authToken');
      if (api && token) {
        try {
          await fetch(api + '/api/auth/logout', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
          });
        } catch {}
      }
    } finally {
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userFirstName');
        localStorage.removeItem('userLastName');
      } catch {}
      redirectToLogin();
    }
  }

  function injectLogoutBar(options) {
    if (document.getElementById('global-logout-bar')) return; // prevent duplicates
    const userFirstName = localStorage.getItem('userFirstName') || '';
    const userLastName = localStorage.getItem('userLastName') || '';
    const role = localStorage.getItem('userRole') || '';

    const roleLabel = role === 'student' ? 'Estudiante' : role === 'teacher' ? 'Profesor' : '';
    const userLabel = (userFirstName || userLastName) ? `${userFirstName} ${userLastName} · ${roleLabel}` : roleLabel;

    const bar = document.createElement('div');
    bar.id = 'global-logout-bar';
    bar.innerHTML = `
      <div class="nav">
        <div class="nav-brand">
          <div class="logo">🎓</div>
          <div>ITSU Analytics</div>
        </div>
        <div class="nav-right">
          <span class="nav-user">${userLabel}</span>
          <a class="nav-link" href="${BASE_PATH}/student-dashboard.html">Estudiante</a>
          <a class="nav-link" href="${BASE_PATH}/teacher-dashboard.html">Profesor</a>
          <button class="nav-btn" id="global-logout-btn">Cerrar Sesión</button>
        </div>
      </div>
    `;
    document.body.appendChild(bar);

    const btn = document.getElementById('global-logout-btn');
    if (btn) btn.onclick = logout;

    // offset page content to bar height (56px)
    const currentPaddingTop = parseInt(window.getComputedStyle(document.body).paddingTop || '0', 10);
    document.body.style.paddingTop = (currentPaddingTop + 56) + 'px';
  }

  // Expose globally
  window.SAAAuth = {
    BASE_PATH,
    requireAuth,
    injectLogoutBar,
    logout,
    getApiBase,
  };
})();
