// Simple client-side telemetry for static pages
// Captures common events and attempts to send them to backend if available
(function(){
  const queueKey = 'SAA_TELEMETRY_QUEUE';
  const apiBase = (function(){
    try { return localStorage.getItem('API_BASE') || localStorage.getItem('apiBase') || ''; } catch { return ''; }
  })();

  function now(){ return new Date().toISOString(); }
  function readQueue(){
    try { return JSON.parse(localStorage.getItem(queueKey) || '[]'); } catch { return []; }
  }
  function writeQueue(q){
    try { localStorage.setItem(queueKey, JSON.stringify(q)); } catch {}
  }

  async function flush(){
    const q = readQueue();
    if (!q.length) return;
    if (!apiBase) return; // keep until backend configured
    try {
      const token = localStorage.getItem('authToken') || '';
      const res = await fetch(apiBase + '/api/telemetry/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': 'Bearer ' + token } : {}) },
        body: JSON.stringify({ events: q })
      });
      if (res.ok) {
        writeQueue([]);
      }
    } catch {}
  }

  function track(type, payload){
    const event = { type, payload, ts: now(), url: location.pathname, role: localStorage.getItem('userRole') || null };
    const q = readQueue(); q.push(event); writeQueue(q);
    // try a best-effort flush in background
    setTimeout(flush, 0);
  }

  function initAutoCapture(){
    // Role selection buttons on login
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        track('role_select', { role: btn.dataset.role });
      });
    });
    // Login form submit
    const lf = document.getElementById('loginForm');
    if (lf) {
      lf.addEventListener('submit', () => {
        const u = (document.getElementById('username') || {}).value || '';
        const roleBtn = document.querySelector('.role-btn.active');
        const role = roleBtn ? roleBtn.dataset.role : localStorage.getItem('userRole');
        track('login_submit', { username: u ? 'provided' : 'empty', role });
      });
    }
    // Survey start/submit hooks if available
    const root = document.getElementById('survey-root');
    if (root) {
      // wrap global functions if present
      const origStart = window.startSurvey;
      const origSubmit = window.submitSurvey;
      if (typeof origStart === 'function') {
        window.startSurvey = function(type){ track('survey_start', { type }); return origStart(type); };
      }
      if (typeof origSubmit === 'function') {
        window.submitSurvey = function(){ track('survey_submit', {}); return origSubmit(); };
      }
    }
    // Nav link clicks
    document.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        track('nav_click', { href: a.getAttribute('href') });
      });
    });
  }

  window.SAATelemetry = { track, flush, initAutoCapture };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoCapture);
  } else {
    initAutoCapture();
  }
})();

