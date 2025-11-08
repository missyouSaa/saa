// ITSU DSS-ITSU core logic: ILS test, profile, recommendations, simple clustering

const ITSU = (() => {
  const state = {
    role: localStorage.getItem('userRole') || null,
    perfil: JSON.parse(localStorage.getItem('perfil') || 'null'),
  };

  function setRole(role) {
    localStorage.setItem('userRole', role);
    state.role = role;
  }

  // 44 ILS questions bank (11 per dimension).
  // For brevity, questions are representative; you can replace with official ILS Spanish items.
  const ilsQuestions = [
    // Activo vs Reflexivo (q1-q11)
    { id: 1, dim: 'AR', a: 'Discuto con otros', b: 'Pienso por mi cuenta', text: 'Entiendo mejor lo que aprendo en clase si:' },
    { id: 2, dim: 'AR', a: 'Hago actividades', b: 'Escucho y pienso', text: 'Aprendo mejor cuando:' },
    { id: 3, dim: 'AR', a: 'Participo activamente', b: 'Observo y reflexiono', text: 'Durante la clase yo:' },
    { id: 4, dim: 'AR', a: 'Trabajo en grupo', b: 'Trabajo solo', text: 'Para estudiar prefiero:' },
    { id: 5, dim: 'AR', a: 'Explicar a otros', b: 'Escribir mis ideas', text: 'Entiendo más cuando:' },
    { id: 6, dim: 'AR', a: 'Experimento', b: 'Analizo mentalmente', text: 'Al aprender un tema nuevo:' },
    { id: 7, dim: 'AR', a: 'Debato', b: 'Reflexiono', text: 'Para comprender:' },
    { id: 8, dim: 'AR', a: 'Simulo o ejecuto', b: 'Planifico', text: 'Ante un problema:' },
    { id: 9, dim: 'AR', a: 'Hago ejercicios', b: 'Leo y pienso', text: 'Cuando estudio yo:' },
    { id: 10, dim: 'AR', a: 'Pruebo ideas', b: 'Analizo ideas', text: 'Al trabajar en proyectos:' },
    { id: 11, dim: 'AR', a: 'Hablar me ayuda', b: 'El silencio me ayuda', text: 'Mi estilo al aprender es:' },
    // Sensorial vs Intuitivo (q12-q22)
    { id: 12, dim: 'SI', a: 'Datos concretos', b: 'Conceptos abstractos', text: 'Prefiero:' },
    { id: 13, dim: 'SI', a: 'Ejemplos reales', b: 'Teoría primero', text: 'Aprendo mejor con:' },
    { id: 14, dim: 'SI', a: 'Procedimientos claros', b: 'Ideas novedosas', text: 'Me atrae más:' },
    { id: 15, dim: 'SI', a: 'Hechos verificables', b: 'Inferencias', text: 'Me baso en:' },
    { id: 16, dim: 'SI', a: 'Detalles', b: 'Visión general', text: 'Me gusta:' },
    { id: 17, dim: 'SI', a: 'Aplicaciones prácticas', b: 'Hipótesis', text: 'Me interesan:' },
    { id: 18, dim: 'SI', a: 'Instrucciones paso a paso', b: 'Explorar libremente', text: 'Prefiero:' },
    { id: 19, dim: 'SI', a: 'Realidad tangible', b: 'Ideas intuitivas', text: 'Me enfoco en:' },
    { id: 20, dim: 'SI', a: 'Memorizar datos', b: 'Descubrir patrones', text: 'Me resulta más fácil:' },
    { id: 21, dim: 'SI', a: 'Pruebas prácticas', b: 'Exploración conceptual', text: 'Cuando aprendo:' },
    { id: 22, dim: 'SI', a: 'Experiencia directa', b: 'Imaginación', text: 'Me guía:' },
    // Visual vs Verbal (q23-q33)
    { id: 23, dim: 'VV', a: 'Imágenes/diagramas', b: 'Texto/lectura', text: 'Entiendo mejor con:' },
    { id: 24, dim: 'VV', a: 'Videos', b: 'Audio/explicación', text: 'Me ayuda más:' },
    { id: 25, dim: 'VV', a: 'Mapas mentales', b: 'Notas escritas', text: 'Prefiero:' },
    { id: 26, dim: 'VV', a: 'Esquemas', b: 'Descripción verbal', text: 'Para aprender:' },
    { id: 27, dim: 'VV', a: 'Gráficos', b: 'Lecturas', text: 'Me resultan útiles:' },
    { id: 28, dim: 'VV', a: 'Demostraciones visuales', b: 'Explicaciones verbales', text: 'Me gusta más:' },
    { id: 29, dim: 'VV', a: 'Colores y formas', b: 'Palabras', text: 'Recuerdo mejor:' },
    { id: 30, dim: 'VV', a: 'Infografías', b: 'Artículos', text: 'Prefiero:' },
    { id: 31, dim: 'VV', a: 'Presentaciones visuales', b: 'Debates', text: 'Me involucra más:' },
    { id: 32, dim: 'VV', a: 'Animaciones', b: 'Lecturas guiadas', text: 'Entiendo mejor con:' },
    { id: 33, dim: 'VV', a: 'Diagrama de flujo', b: 'Descripción', text: 'Para procesos:' },
    // Secuencial vs Global (q34-q44)
    { id: 34, dim: 'SG', a: 'Paso a paso', b: 'Visión general primero', text: 'Aprendo:' },
    { id: 35, dim: 'SG', a: 'Orden estricto', b: 'Explorar conexiones', text: 'Prefiero:' },
    { id: 36, dim: 'SG', a: 'Plan detallado', b: 'Meta final', text: 'Me ayuda:' },
    { id: 37, dim: 'SG', a: 'Secuencia lógica', b: 'Saltar pasos', text: 'En proyectos:' },
    { id: 38, dim: 'SG', a: 'Estructura clara', b: 'Flexibilidad', text: 'Me funciona:' },
    { id: 39, dim: 'SG', a: 'Ítems por orden', b: 'Contexto general', text: 'Me guío por:' },
    { id: 40, dim: 'SG', a: 'Temas uno por uno', b: 'Relaciones entre temas', text: 'Prefiero:' },
    { id: 41, dim: 'SG', a: 'Checklist', b: 'Mapa conceptual', text: 'Uso:' },
    { id: 42, dim: 'SG', a: 'Siguientes pasos claros', b: 'Objetivo general', text: 'Me motiva:' },
    { id: 43, dim: 'SG', a: 'Resuelvo en orden', b: 'Busco atajos', text: 'Al resolver:' },
    { id: 44, dim: 'SG', a: 'Guía detallada', b: 'Resumen general', text: 'Para estudiar:' },
  ];

  function renderILSForm() {
    const root = document.getElementById('ils-root');
    if (!root) return;
    root.innerHTML = '';

    const form = document.createElement('form');
    form.className = 'card';
    ilsQuestions.forEach(q => {
      const div = document.createElement('div');
      div.className = 'question';
      div.innerHTML = `
        <h4>${q.id}. ${q.text}</h4>
        <label class="option"><input type="radio" name="q${q.id}" value="a"> a) ${q.a}</label>
        <label class="option"><input type="radio" name="q${q.id}" value="b"> b) ${q.b}</label>
      `;
      form.appendChild(div);
    });

    const actions = document.createElement('div');
    actions.className = 'row';
    actions.innerHTML = `
      <button type="button" class="btn" onclick="ITSU.calcularILS()">Calcular ILS</button>
      <button type="reset" class="btn outline">Limpiar</button>
    `;
    form.appendChild(actions);

    root.appendChild(form);
  }

  function calcularILS() {
    let activo = 0, sensorial = 0, visual = 0, secuencial = 0;
    for (const q of ilsQuestions) {
      const sel = document.querySelector(`input[name="q${q.id}"]:checked`);
      if (!sel) continue;
      const v = sel.value;
      if (q.dim === 'AR' && v === 'a') activo++;
      if (q.dim === 'SI' && v === 'a') sensorial++;
      if (q.dim === 'VV' && v === 'a') visual++;
      if (q.dim === 'SG' && v === 'a') secuencial++;
    }

    const resultado = {
      activo_reflexivo: activo >= 7 ? 'Activo' : 'Reflexivo',
      sensorial_intuitivo: sensorial >= 7 ? 'Sensorial' : 'Intuitivo',
      visual_verbal: visual >= 7 ? 'Visual' : 'Verbal',
      secuencial_global: secuencial >= 7 ? 'Secuencial' : 'Global',
      scores: { activo, sensorial, visual, secuencial }
    };
    localStorage.setItem('perfil', JSON.stringify(resultado));
    window.location.href = 'perfil.html';
  }

  // Recommendations per dimension
  const recomendaciones = {
    Activo: ['Haz ejercicios prácticos', 'Trabaja en grupo', 'Simula código', 'Presenta tus ideas', 'Usa talleres'],
    Reflexivo: ['Escribe resúmenes', 'Piensa en silencio', 'Revisa teoría', 'Planifica tu estudio', 'Analiza casos'],
    Sensorial: ['Usa ejemplos reales', 'Practica con datos', 'Aplica procedimientos', 'Relaciónalo con la realidad'],
    Intuitivo: ['Explora ideas nuevas', 'Busca patrones', 'Experimenta hipótesis', 'Lee teoría avanzada'],
    Visual: ['Usa diagramas', 'Mira videos', 'Crea mapas mentales', 'Infografías y gráficas'],
    Verbal: ['Lee artículos', 'Debate en clase', 'Escribe notas', 'Explica con tus palabras'],
    Secuencial: ['Estudia paso a paso', 'Checklist de tareas', 'Divide en módulos', 'Sigue guías detalladas'],
    Global: ['Empieza por el panorama', 'Mapa conceptual', 'Relaciona ideas', 'Explora conexiones']
  };

  function getRecomendaciones(perfil) {
    return {
      AR: recomendaciones[perfil.activo_reflexivo],
      SI: recomendaciones[perfil.sensorial_intuitivo],
      VV: recomendaciones[perfil.visual_verbal],
      SG: recomendaciones[perfil.secuencial_global]
    };
  }

  // Simple clustering: k-means on scores using data/estudiantes.json if available
  async function clusterEstudiantes(k = 4) {
    try {
      const resp = await fetch('data/estudiantes.json');
      if (!resp.ok) return null;
      const data = await resp.json();
      const points = data.map(d => [d.scores.activo, d.scores.sensorial, d.scores.visual, d.scores.secuencial]);
      if (points.length === 0) return null;
      // init centroids with first k points
      let centroids = points.slice(0, k);
      let changed = true, iter = 0;
      const assign = (p) => {
        let best = 0, bestDist = Infinity;
        for (let i = 0; i < k; i++) {
          const c = centroids[i];
          const d = Math.sqrt(p.reduce((sum, v, idx) => sum + Math.pow(v - c[idx], 2), 0));
          if (d < bestDist) { bestDist = d; best = i; }
        }
        return best;
      };
      let labels = points.map(assign);
      while (changed && iter < 20) {
        changed = false; iter++;
        // recompute centroids
        const sums = Array.from({ length: k }, () => [0,0,0,0]);
        const counts = Array.from({ length: k }, () => 0);
        labels.forEach((l, idx) => {
          counts[l]++;
          for (let j = 0; j < 4; j++) sums[l][j] += points[idx][j];
        });
        centroids = centroids.map((c, i) => counts[i] ? sums[i].map(v => v / counts[i]) : c);
        // reassign
        const newLabels = points.map(assign);
        for (let i = 0; i < labels.length; i++) if (labels[i] !== newLabels[i]) changed = true;
        labels = newLabels;
      }
      return { centroids, labels };
    } catch (e) {
      console.warn('Clustering error:', e.message);
      return null;
    }
  }

  function toggleDark() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }
  function initTheme() {
    const t = localStorage.getItem('theme');
    if (t === 'dark') document.documentElement.classList.add('dark');
  }

  return {
    state,
    setRole,
    ilsQuestions,
    renderILSForm,
    calcularILS,
    getRecomendaciones,
    clusterEstudiantes,
    toggleDark,
    initTheme,
  };
})();

// Init theme on load
ITSU.initTheme();

// =========================
// ECAS: Early Cognitive Alert System
// Logistic Regression scoring + simple explainability
// =========================

const ECAS = (() => {
  let model = null; // { intercept, coefs: { visual, activo, nota1, nota2, asistencia } }

  async function loadModel() {
    if (model) return model;
    try {
      const resp = await fetch('data/model.json');
      if (!resp.ok) throw new Error('No se pudo cargar el modelo ECAS');
      model = await resp.json();
      return model;
    } catch (e) {
      console.warn('ECAS model load error:', e.message);
      // Fallback: default coefficients
      model = {
        intercept: -2.0,
        coefs: { visual: 0.15, activo: -0.05, nota1: -0.30, nota2: -0.35, asistencia: -0.80 }
      };
      return model;
    }
  }

  function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

  function normalizeFeatures({ visual, activo, nota1, nota2, asistencia }) {
    // Scores: 0-11 -> scale to 0-1; Notas: assume 0-10 -> 0-1; Asistencia: if 0-100 -> 0-1
    const v = (visual ?? 0) / 11;
    const a = (activo ?? 0) / 11;
    const n1 = (nota1 ?? 0) / 10;
    const n2 = (nota2 ?? 0) / 10;
    const att = (asistencia ?? 0) > 1 ? (asistencia / 100) : (asistencia ?? 0);
    return { visual: v, activo: a, nota1: n1, nota2: n2, asistencia: att };
  }

  function levelAndAction(prob) {
    const p = prob * 100;
    if (p >= 70) return { nivel: 'Rojo', color: 'red', accion: 'Reunión urgente + tutoría práctica' };
    if (p >= 40) return { nivel: 'Amarillo', color: 'yellow', accion: 'Enviar video + ejercicio práctico' };
    return { nivel: 'Verde', color: 'green', accion: 'Mantener estrategia actual' };
  }

  async function predict(featuresRaw) {
    const m = await loadModel();
    const x = normalizeFeatures(featuresRaw);
    const z = m.intercept
      + m.coefs.visual * x.visual
      + m.coefs.activo * x.activo
      + m.coefs.nota1 * x.nota1
      + m.coefs.nota2 * x.nota2
      + m.coefs.asistencia * x.asistencia;
    const prob = sigmoid(z);
    const exp = [
      { feature: 'Visual', value: x.visual, weight: m.coefs.visual, contribution: m.coefs.visual * x.visual },
      { feature: 'Activo', value: x.activo, weight: m.coefs.activo, contribution: m.coefs.activo * x.activo },
      { feature: 'Nota 1', value: x.nota1, weight: m.coefs.nota1, contribution: m.coefs.nota1 * x.nota1 },
      { feature: 'Nota 2', value: x.nota2, weight: m.coefs.nota2, contribution: m.coefs.nota2 * x.nota2 },
      { feature: 'Asistencia', value: x.asistencia, weight: m.coefs.asistencia, contribution: m.coefs.asistencia * x.asistencia }
    ];
    const la = levelAndAction(prob);
    return { prob, level: la.nivel, color: la.color, accion: la.accion, explanation: exp };
  }

  async function predictFromPerfilInputs() {
    const perfil = JSON.parse(localStorage.getItem('perfil') || 'null');
    const n1 = parseFloat(document.getElementById('nota1')?.value || '0');
    const n2 = parseFloat(document.getElementById('nota2')?.value || '0');
    const asistencia = parseFloat(document.getElementById('asistencia')?.value || '0');
    const res = await predict({
      visual: perfil?.scores?.visual || 0,
      activo: perfil?.scores?.activo || 0,
      nota1: n1, nota2: n2, asistencia
    });
    renderAlerta(res);
    return res;
  }

  function renderAlerta(res) {
    const alertDiv = document.getElementById('alerta');
    if (!alertDiv) return;
    alertDiv.innerHTML = `
      <div class="card" style="border-left:6px solid ${res.color};">
        <h3>Riesgo de Deserción: ${res.level} (${(res.prob*100).toFixed(1)}%)</h3>
        <p><strong>Acción sugerida:</strong> ${res.accion}</p>
        <div class="space"></div>
        <div>
          <h4>Explicación (contribuciones):</h4>
          <ul>
            ${res.explanation.map(e => `<li>${e.feature}: valor=${e.value.toFixed(2)} · peso=${e.weight.toFixed(2)} · contrib=${e.contribution.toFixed(3)}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  return { loadModel, predict, predictFromPerfilInputs, renderAlerta };
})();

