/* ═══════════════════════════════════════════════════════════════
   EMLA Radio — slide-in sidebar + full-screen visualizer
   Trigger: click 'Radio' tab-pill → window.rdSidebarOpen()
   Keyboard: R toggle, F fullscreen, Esc close, Space play/pause, ←→ prev/next
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const STATE_KEY = 'emla.radio.state.v2';
  const state = Object.assign({
    open: false,       // sidebar visible?
    full: false,       // full-screen mode?
    stationId: 'rmf',
    volume: 0.6,
    playing: false
  }, (function () { try { return JSON.parse(localStorage.getItem(STATE_KEY) || '{}'); } catch { return {}; } })());

  let STATIONS = [];
  let audioEl = null, audioCtx = null, analyser = null, dataArray = null, sourceNode = null;
  let animId = null;
  let currentStation = null;
  let beatHistory = [];
  let particles = [];

  const DPR = Math.min(2, devicePixelRatio || 1);

  function save() { localStorage.setItem(STATE_KEY, JSON.stringify(state)); }
  const $s = (id) => STATIONS.find(s => s.id === id) || STATIONS[0];

  async function init() {
    try {
      const r = await fetch('data/stations.json');
      STATIONS = (await r.json()).stations;
      currentStation = $s(state.stationId);
      buildDOM();
      applyState();
      if (state.open) setTimeout(() => { if (state.playing) play(); }, 500);
    } catch (e) { console.warn('radio init fail:', e); }
  }

  /* ═══════════ DOM ═══════════ */
  function buildDOM() {
    const host = document.createElement('div');
    host.id = 'emla-radio';
    host.innerHTML = `
      <!-- Backdrop -->
      <div class="rd-side-backdrop" id="rdBackdrop"></div>

      <!-- SIDEBAR -->
      <aside class="rd-sidebar" id="rdSidebar" aria-label="Radio">
        <div class="rd-side-head">
          <div class="rd-side-title">
            <b>🎵 Radio</b>
            <small>10 stacji · Polska</small>
          </div>
          <div class="rd-side-actions">
            <button id="rdSideFull" title="Pełny ekran (F)">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            </button>
            <button id="rdSideClose" title="Zamknij (Esc)" style="font-size:18px;line-height:0;padding:0 6px">×</button>
          </div>
        </div>

        <div class="rd-side-player">
          <div class="rd-side-logo" id="rdSideLogo"></div>
          <div class="rd-side-now">
            <span class="rd-side-now-name" id="rdSideName">—</span>
            <span class="rd-side-now-sub" id="rdSideSub">—</span>
          </div>
        </div>

        <div class="rd-side-viz">
          <canvas id="rdSideViz"></canvas>
        </div>

        <div class="rd-side-controls">
          <button class="rd-ctrl" id="rdSidePrev" title="Poprzednia (←)">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button class="rd-ctrl rd-ctrl-play" id="rdSidePlay" title="Play / Pause (Space)">
            <svg id="rdSidePlayIcon" viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button class="rd-ctrl" id="rdSideNext" title="Następna (→)">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z"/></svg>
          </button>
        </div>

        <div class="rd-side-vol">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="opacity:.65"><path d="M3 9v6h4l5 5V4L7 9H3z"/></svg>
          <input type="range" id="rdSideVol" min="0" max="1" step="0.01">
        </div>

        <div class="rd-side-stations" id="rdSideStations"></div>

        <div class="rd-side-hint"><kbd>R</kbd> otwórz · <kbd>F</kbd> pełny ekran · <kbd>Esc</kbd> zamknij · <kbd>Space</kbd> play · <kbd>←→</kbd> stacja</div>
      </aside>

      <!-- FULL-SCREEN -->
      <div class="rd-full" id="rdFull">
        <button class="rd-full-close" id="rdFullClose" title="Esc">×</button>
        <div class="rd-viz-wrap">
          <canvas class="rd-viz" id="rdViz"></canvas>
          <div class="rd-viz-center">
            <div class="rd-vinyl" id="rdVinyl"></div>
            <div class="rd-now" id="rdNow"></div>
            <div class="rd-now-sub" id="rdNowSub"></div>
          </div>
        </div>
        <div class="rd-controls">
          <button class="rd-ctrl" id="rdPrev" title="Poprzednia (←)">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button class="rd-ctrl rd-ctrl-play" id="rdPlayBig" title="Play / Pause (Space)">
            <svg id="rdPlayBigIcon" viewBox="0 0 24 24" width="36" height="36" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button class="rd-ctrl" id="rdNext" title="Następna (→)">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z"/></svg>
          </button>
          <div class="rd-vol">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="opacity:.65"><path d="M3 9v6h4l5 5V4L7 9H3z"/></svg>
            <input type="range" id="rdVol" min="0" max="1" step="0.01">
          </div>
        </div>
        <div class="rd-stations" id="rdStations"></div>
      </div>
    `;
    document.body.appendChild(host);

    // Wire events
    document.getElementById('rdBackdrop').onclick = () => closeSidebar();
    document.getElementById('rdSideClose').onclick = () => closeSidebar();
    document.getElementById('rdSideFull').onclick = () => { state.full = true; applyState(); };
    document.getElementById('rdFullClose').onclick = () => { state.full = false; applyState(); };

    document.getElementById('rdSidePlay').onclick = togglePlay;
    document.getElementById('rdPlayBig').onclick = togglePlay;
    document.getElementById('rdSidePrev').onclick = () => skip(-1);
    document.getElementById('rdPrev').onclick = () => skip(-1);
    document.getElementById('rdSideNext').onclick = () => skip(1);
    document.getElementById('rdNext').onclick = () => skip(1);

    const vs = document.getElementById('rdSideVol');
    const vf = document.getElementById('rdVol');
    vs.value = vf.value = state.volume;
    const onVol = (e) => {
      state.volume = parseFloat(e.target.value);
      vs.value = vf.value = state.volume;
      if (audioEl) audioEl.volume = state.volume;
      save();
    };
    vs.oninput = vf.oninput = onVol;

    // Keyboard
    document.addEventListener('keydown', (e) => {
      const t = document.activeElement?.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA') return;
      if (e.key === 'r' || e.key === 'R') {
        state.open ? closeSidebar() : openSidebar();
        e.preventDefault();
      } else if (state.open) {
        if (e.key === 'Escape') { state.full ? (state.full = false, applyState()) : closeSidebar(); }
        else if (e.key === 'f' || e.key === 'F') { state.full = !state.full; applyState(); e.preventDefault(); }
        else if (e.key === ' ') { togglePlay(); e.preventDefault(); }
        else if (e.key === 'ArrowLeft')  { skip(-1); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { skip(1); e.preventDefault(); }
      }
    });

    // Audio element
    audioEl = new Audio();
    audioEl.crossOrigin = 'anonymous';
    audioEl.preload = 'none';
    audioEl.volume = state.volume;
    audioEl.addEventListener('playing', () => { state.playing = true; save(); updatePlay(); startViz(); });
    audioEl.addEventListener('pause',   () => { state.playing = false; save(); updatePlay(); stopViz(); });
    audioEl.addEventListener('error',   () => {
      state.playing = false; updatePlay();
      toast(`⚠️ ${currentStation.name} — stream niedostępny`);
    });

    setStation(currentStation);
    buildStationsList();

    // Expose for external trigger
    window.rdSidebarOpen = openSidebar;
  }

  function openSidebar() { state.open = true; save(); applyState(); }
  function closeSidebar() { state.open = false; state.full = false; save(); applyState(); }

  function applyState() {
    const root = document.getElementById('emla-radio');
    root.classList.toggle('rd-sidebar-open', state.open);
    root.classList.toggle('rd-full', state.full);
    if (state.open) startViz(); else stopViz();
  }

  /* ═══════════ STATION ═══════════ */
  function setStation(s) {
    currentStation = s;
    state.stationId = s.id;
    save();
    // Update both sidebar and full views
    document.getElementById('rdSideName').textContent = s.name;
    document.getElementById('rdSideSub').textContent = s.sub;
    document.getElementById('rdNow').textContent = s.name;
    document.getElementById('rdNowSub').textContent = s.sub;
    updateAccent();
    document.querySelectorAll('.rd-side-station, .rd-station').forEach(el => {
      el.classList.toggle('active', el.dataset.sid === s.id);
    });
    // Portal transition
    const viz = document.getElementById('rdViz');
    if (viz) { viz.classList.add('portal'); setTimeout(() => viz.classList.remove('portal'), 800); }

    if (audioEl) {
      const wasPlay = state.playing;
      audioEl.src = s.url;
      if (wasPlay) audioEl.play().catch(() => {});
    }
  }
  function skip(d) {
    const i = STATIONS.findIndex(s => s.id === currentStation.id);
    setStation(STATIONS[(i + d + STATIONS.length) % STATIONS.length]);
  }

  function updateAccent() {
    const c = currentStation?.color || '#4da3ff';
    document.documentElement.style.setProperty('--rd-accent', c);
    const sl = document.getElementById('rdSideLogo');
    if (sl) {
      sl.style.background = `linear-gradient(135deg, ${c}, ${shade(c, -30)})`;
      sl.textContent = currentStation?.abbr || '';
    }
    const vinyl = document.getElementById('rdVinyl');
    if (vinyl) vinyl.style.background = `radial-gradient(circle at 30% 30%, ${c}, ${shade(c, -50)} 60%, #0a1022)`;
  }
  function shade(hex, p) {
    const n = parseInt(hex.slice(1), 16);
    const R = Math.max(0, Math.min(255, ((n >> 16) & 255) + p));
    const G = Math.max(0, Math.min(255, ((n >> 8) & 255) + p));
    const B = Math.max(0, Math.min(255, (n & 255) + p));
    return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
  }

  /* ═══════════ PLAYBACK ═══════════ */
  function togglePlay() { state.playing ? pause() : play(); }
  function play() {
    if (!audioEl) return;
    if (!audioCtx) initAudioGraph();
    audioCtx?.resume?.();
    audioEl.play().catch(err => {
      toast(`⚠️ ${currentStation.name} — CORS / offline`);
      console.warn('play fail:', err);
    });
  }
  function pause() { audioEl?.pause(); }
  function updatePlay() {
    const paused = '<path d="M8 5v14l11-7z"/>';
    const playing = '<path d="M6 5h4v14H6zm8 0h4v14h-4z"/>';
    const svg = state.playing ? playing : paused;
    ['rdSidePlayIcon', 'rdPlayBigIcon'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = svg;
    });
  }

  function initAudioGraph() {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      sourceNode = audioCtx.createMediaElementSource(audioEl);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.78;
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch (e) { console.warn('AudioGraph fail (CORS?). Using pseudo-spectrum.', e); analyser = null; }
  }

  /* ═══════════ VISUALIZER ═══════════ */
  function startViz() {
    stopViz();
    const full = document.getElementById('rdViz');
    const side = document.getElementById('rdSideViz');
    if (!full || !side) return;
    const ctxF = full.getContext('2d');
    const ctxS = side.getContext('2d');
    function resize() {
      [full, side].forEach(c => {
        c.width  = c.clientWidth  * DPR;
        c.height = c.clientHeight * DPR;
      });
    }
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    particles = Array.from({ length: 120 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 2 + 0.6,
      vx: (Math.random() - 0.5) * 0.002,
      vy: (Math.random() - 0.5) * 0.002,
      hue: Math.random() * 360
    }));

    function frame() {
      t += 0.015;
      // Get FFT data (real or pseudo)
      let data;
      if (analyser) { analyser.getByteFrequencyData(dataArray); data = dataArray; }
      else {
        data = new Uint8Array(128);
        for (let i = 0; i < 128; i++) {
          data[i] = Math.min(255, (Math.sin(t * (1 + i * 0.1)) * 70 + 110 + Math.random() * 50) * Math.max(0.2, 1 - i / 200));
        }
      }
      // Beat detect
      const bassEnd = Math.floor(data.length * 0.15);
      let bassSum = 0;
      for (let i = 0; i < bassEnd; i++) bassSum += data[i];
      const bass = bassSum / bassEnd / 255;
      beatHistory.push(bass);
      if (beatHistory.length > 30) beatHistory.shift();
      const avgBass = beatHistory.reduce((a, b) => a + b, 0) / beatHistory.length;
      const beat = bass > avgBass * 1.3 && bass > 0.4;

      if (state.full) drawFull(ctxF, full, data, bass, beat, t);
      if (state.open) drawSide(ctxS, side, data, bass);

      animId = requestAnimationFrame(frame);
    }
    frame();
  }
  function stopViz() {
    if (animId) cancelAnimationFrame(animId);
    animId = null;
  }

  function drawFull(ctx, canvas, data, bass, beat, t) {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;
    const baseR = Math.min(W, H) * 0.18;
    const accent = currentStation?.color || '#4da3ff';

    // Particles
    for (const p of particles) {
      p.x += p.vx + Math.sin(t + p.hue) * 0.0008 * (1 + bass * 4);
      p.y += p.vy + Math.cos(t + p.hue * 1.3) * 0.0008 * (1 + bass * 4);
      if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
      ctx.fillStyle = `hsla(${p.hue + t * 8}, 70%, 65%, ${0.3 + bass * 0.6})`;
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r * (1 + bass * 1.2) * DPR, 0, Math.PI * 2);
      ctx.fill();
    }
    // Beat flash
    if (beat) { ctx.fillStyle = `${accent}22`; ctx.fillRect(0, 0, W, H); }
    // Circular spectrum — 180 bars
    const bars = 180;
    for (let i = 0; i < bars; i++) {
      const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
      const amp = data[i % data.length] / 255;
      const r1 = baseR + 20 * DPR;
      const r2 = r1 + amp * Math.min(W, H) * 0.22 + 4;
      const x1 = cx + Math.cos(angle) * r1;
      const y1 = cy + Math.sin(angle) * r1;
      const x2 = cx + Math.cos(angle) * r2;
      const y2 = cy + Math.sin(angle) * r2;
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, accent);
      grad.addColorStop(1, `${accent}00`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = Math.max(2, (Math.PI * 2 * r1 / bars) * 0.8);
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    // Outer glow ring
    const totalEnergy = data.reduce((a, b) => a + b, 0) / (data.length * 255);
    ctx.strokeStyle = accent;
    ctx.shadowBlur = (30 + totalEnergy * 40) * DPR;
    ctx.shadowColor = accent;
    ctx.lineWidth = (3 + totalEnergy * 6) * DPR;
    ctx.beginPath();
    ctx.arc(cx, cy, baseR + 10 * DPR + bass * 20 * DPR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawSide(ctx, canvas, data, bass) {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const accent = currentStation?.color || '#4da3ff';
    const bars = 32;
    const step = W / bars;
    // Mirrored bars from center to edges
    for (let i = 0; i < bars; i++) {
      const idx = Math.floor((i / bars) * data.length * 0.7);
      const amp = data[idx] / 255;
      const h = Math.max(4, amp * H * 0.85);
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.5 + amp * 0.5;
      ctx.fillRect(i * step + step * 0.2, (H - h) / 2, step * 0.6, h);
    }
    ctx.globalAlpha = 1;
    // Pulse ring on bass
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.25 + bass * 0.55;
    ctx.lineWidth = 2 * DPR;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.35 + bass * 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /* ═══════════ STATIONS LIST ═══════════ */
  function buildStationsList() {
    const sideList = document.getElementById('rdSideStations');
    const fullList = document.getElementById('rdStations');
    const sideHTML = STATIONS.map(s => `
      <button class="rd-side-station ${s.id === currentStation.id ? 'active' : ''}" data-sid="${s.id}" style="--c:${s.color}">
        <span class="rd-side-station-abbr">${s.abbr}</span>
        <span class="rd-side-station-info">
          <span class="rd-side-station-name">${s.name}</span>
          <span class="rd-side-station-sub">${s.sub}</span>
        </span>
        <span class="rd-side-station-eq">▌▌▌</span>
      </button>
    `).join('');
    const fullHTML = STATIONS.map(s => `
      <button class="rd-station ${s.id === currentStation.id ? 'active' : ''}" data-sid="${s.id}" style="--c:${s.color}">
        <span class="rd-station-abbr">${s.abbr}</span>
        <span class="rd-station-name">${s.name}</span>
        <span class="rd-station-sub">${s.sub}</span>
      </button>
    `).join('');
    if (sideList) sideList.innerHTML = sideHTML;
    if (fullList) fullList.innerHTML = fullHTML;
    document.querySelectorAll('.rd-side-station, .rd-station').forEach(btn => {
      btn.onclick = () => setStation($s(btn.dataset.sid));
    });
  }

  function toast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._r); t._r = setTimeout(() => t.classList.remove('show'), 2400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
