/* EMLA Portal — Shared JavaScript — extracted from centra_oparzen.html */

/*
 * EXPECTS the following globals to be defined BEFORE this script loads:
 *   - D        : Array of facility objects (the FACILITIES data)
 *   - CHOJ     : Object { x, y } — origin map coordinates
 *   - PL_PATH  : String — simplified Poland outline SVG path
 *
 * Optional page-level overrides:
 *   - CATEGORY : Object with category-specific config (if needed)
 */

/* ═══════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════ */
let af = 'all', cs = {};
const nt = () => { const h = new Date().getHours(); return h >= 22 || h < 6 };
const nrm = s => s.replace(/[ąćęłńóśźż]/g, m => ({ą:'a',ć:'c',ę:'e',ł:'l',ń:'n',ó:'o',ś:'s',ź:'z',ż:'z'})[m] || m);

/* ═══════════════════════════════════════════════
   MINI MAP SVG GENERATOR
   ═══════════════════════════════════════════════ */
function miniMapSVG(dest, colorClass) {
  const strokeColor = colorClass === 'sg' ? 'oklch(0.6 0.2 155)' :
                      colorClass === 'sa' ? 'oklch(0.65 0.2 70)' :
                      'oklch(0.55 0.25 25)';
  return `<svg viewBox="0 0 80 62" width="72" height="56" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="${PL_PATH}" fill="var(--map-fill)" stroke="var(--map-stroke)" stroke-width="1.2" opacity="0.7"/>
    <circle cx="${CHOJ.x}" cy="${CHOJ.y}" r="13" fill="none" stroke="var(--t3)" stroke-width="0.4" stroke-dasharray="2 2" opacity="0.4"/>
    <circle cx="${CHOJ.x}" cy="${CHOJ.y}" r="27" fill="none" stroke="var(--t3)" stroke-width="0.4" stroke-dasharray="2 2" opacity="0.3"/>
    <line x1="${CHOJ.x}" y1="${CHOJ.y}" x2="${dest.x}" y2="${dest.y}" class="route-line" stroke="${strokeColor}" stroke-width="1.2" opacity="0.7"/>
    <circle cx="${dest.x}" cy="${dest.y}" r="3.5" fill="${strokeColor}" opacity="0.8"/>
    <circle cx="${dest.x}" cy="${dest.y}" r="5.5" fill="none" stroke="${strokeColor}" stroke-width="0.8" opacity="0.3"/>
    <circle cx="${CHOJ.x}" cy="${CHOJ.y}" r="2.5" fill="var(--red)" opacity="0.9"/>
    <text x="${CHOJ.x}" y="${CHOJ.y - 5}" text-anchor="middle" fill="var(--t3)" font-size="5" font-family="var(--f)" font-weight="600">Chojnice</text>
  </svg>`;
}

/* ═══════════════════════════════════════════════
   RENDER
   ═══════════════════════════════════════════════ */
function render() {
  const night = nt();
  const grid = document.getElementById('grid');
  grid.innerHTML = D.map((c, i) => {
    const phr = (list, isMore) => list.map(p => {
      const dim = night && !(p.h24 !== undefined ? p.h24 : true) ? ' ndim' : '';
      const hr = p.h ? ' hero' : '';
      const st = cs[p.n] ? `<span class="phst">dzwoniono ${cs[p.n]}</span>` : '';
      const h24dot = (p.h24 !== undefined ? p.h24 : true) ? '<span class="h24-dot" title="24h"></span>' : '';
      return `<div class="ph${hr}${dim}" onclick="copyP('${p.n.replace(/'/g, "\\'")}',this,event)" title="Kliknij aby skopiować">
        <span class="phr">${h24dot}${p.r}</span>
        <span class="phn">${p.n}</span>${st}
      </div>`;
    }).join('');

    const hm = c.mo && c.mo.length > 0;
    const mid = 'm' + c.id;
    const distPct = Math.min((c.dist / c.maxDist) * 100, 100);
    const fillClass = c.s === 'sg' ? 'sg-fill' : c.s === 'sa' ? 'sa-fill' : 'sr-fill';

    let siosHtml;
    if (c.sios) {
      siosHtml = `<div class="sios-row"><a class="sios-btn active" href="${c.sios}" target="_blank" rel="noopener"><span class="dot"></span>Wolne łóżka — SIoS</a></div>`;
    } else {
      siosHtml = `<div class="sios-row"><div class="sios-btn inactive"><span class="dot"></span>Brak publicznego systemu</div></div>`;
    }

    return `<div class="card ${c.glow}" data-t="${c.tags.join(',')}" data-s="${(c.city+' '+c.name+' '+c.addr).toLowerCase()}" id="c${c.id}">
      <div class="cstr ${c.s}"></div>
      <div class="cin">
        <div class="chd">
          <span class="ccy"><span class="kh">${i+1}</span>${c.city}</span>
          <a class="clk" href="${c.url}" target="_blank" rel="noopener">${c.ul} ↗</a>
        </div>
        <div class="cnm">${c.name}</div>
        <div class="ctr">
          <span>${c.tr.icon} ${c.tr.m}: <span class="tv">${c.tr.t}</span></span>
          <span>🚑 Droga: <span class="tv">${c.tr.r}</span></span>
        </div>
        <div class="mini-map">
          ${miniMapSVG(c.mapXY, c.s)}
          <div class="map-meta">
            <div class="dist-val">${c.dist} km</div>
            <div>od Chojnic</div>
            <div class="dist-bar"><div class="dist-bar-fill ${fillClass}" data-w="${distPct}"></div></div>
          </div>
        </div>
        <div class="phs">${phr(c.ph)}</div>
        ${hm ? `<div class="mw" id="${mid}"><div>${phr(c.mo)}</div></div><div class="mb" onclick="tm('${mid}',this)">więcej telefonów <span class="mb-arrow">↓</span></div>` : ''}
        <div class="caps">${c.caps.map(cp => `<span class="cap${cp.y ? ' y' : ''}">${cp.t}</span>`).join('')}</div>
        <div class="cbot">${siosHtml}
          <div class="cacts">
            <button class="ca" onclick="copyA(${c.id})" aria-label="Kopiuj dane">📋 Kopiuj wszystko</button>
            <button class="ca" onclick="printC(${c.id})" aria-label="Drukuj kartę">🖨 Drukuj kartę</button>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');

  /* Animate distance bars after render */
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll('.dist-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.w + '%';
      });
    }, 400);
  });
}

/* ═══════════════════════════════════════════════
   INTERACTIONS
   ═══════════════════════════════════════════════ */
function setChip(el) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  af = el.dataset.f;
  doFilter();
}

function doFilter() {
  const s = document.getElementById('search');
  if (!s) return;
  const q = nrm(s.value.toLowerCase().trim());
  document.querySelectorAll('.card').forEach(c => {
    const ms = !q || nrm(c.dataset.s).includes(q);
    const mf = af === 'all' || c.dataset.t.includes(af);
    c.style.display = (ms && mf) ? '' : 'none';
  });
}

function copyP(n, el, evt) {
  /* Ripple effect */
  const rect = el.getBoundingClientRect();
  const rx = ((evt.clientX - rect.left) / rect.width * 100);
  const ry = ((evt.clientY - rect.top) / rect.height * 100);
  el.style.setProperty('--rx', rx + '%');
  el.style.setProperty('--ry', ry + '%');
  el.classList.add('ripple');
  setTimeout(() => el.classList.remove('ripple'), 500);

  navigator.clipboard.writeText(n.replace(/\s+/g, '')).catch(() => {});
  showToast('Skopiowano: ' + n);
  const now = new Date();
  cs[n] = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  let ex = el.querySelector('.phst');
  if (ex) ex.remove();
  const s = document.createElement('span');
  s.className = 'phst';
  s.textContent = 'dzwoniono ' + cs[n];
  el.appendChild(s);
}

function copyN(raw, display) {
  navigator.clipboard.writeText(raw).catch(() => {});
  showToast('Skopiowano: ' + display);
}

function copyA(id) {
  const c = D.find(x => x.id === id);
  if (!c) return;
  let t = c.city + ' — ' + c.name + '\n' + c.addr + '\n\n';
  [...c.ph, ...c.mo].forEach(p => { t += p.r + ': ' + p.n + '\n' });
  t += '\nMożliwości: ' + c.caps.map(cp => cp.t).join(', ');
  navigator.clipboard.writeText(t).catch(() => {});
  showToast('Skopiowano dane: ' + c.city);
}

function printC(id) {
  const c = D.find(x => x.id === id);
  if (!c) return;
  const ps = [...c.ph, ...c.mo];
  const w = window.open('', '_blank', 'width=600,height=700');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${c.city}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'DM Sans','Inter',system-ui,sans-serif;padding:32px;color:#111}
h1{font-size:22px;margin-bottom:4px;font-weight:700}.sub{font-size:13px;color:#555;margin-bottom:4px}.adr{font-size:12px;color:#777;margin-bottom:20px}
.ph{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:14px}.ph:last-child{border-bottom:none}
.rl{color:#555}.nm{font-family:'JetBrains Mono','Consolas',monospace;font-weight:600;font-size:15px;letter-spacing:.03em}
.hero .nm{font-size:18px;color:#C00}.hero .rl{font-weight:600;color:#C00}
.cp{margin-top:16px;font-size:11px;color:#555}.ft{margin-top:24px;font-size:10px;color:#999;border-top:1px solid #ddd;padding-top:8px}
@media print{body{padding:20px}}</style></head><body>
<h1>${c.city}</h1><div class="sub">${c.name}</div><div class="adr">${c.addr} · <a href="${c.url}">${c.ul}</a></div>
${ps.map(p => `<div class="ph${p.h ? ' hero' : ''}"><span class="rl">${p.r}</span><span class="nm">${p.n}</span></div>`).join('')}
<div class="cp">Możliwości: ${c.caps.map(cp => cp.t).join(' · ')}</div>
<div class="ft">SOR Chojnice — Szpital im. J.K. Łukowicza · Wydruk ${new Date().toLocaleDateString('pl-PL')} · Dane wymagają weryfikacji tel.</div>
</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 300);
}

function tm(id, btn) {
  const el = document.getElementById(id);
  el.classList.toggle('open');
  btn.classList.toggle('open');
  const isOpen = el.classList.contains('open');
  btn.innerHTML = isOpen ? 'mniej <span class="mb-arrow" style="transform:rotate(180deg)">↓</span>'
                         : 'więcej telefonów <span class="mb-arrow">↓</span>';
}

function toggleTheme() {
  const b = document.body;
  const n = b.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  b.setAttribute('data-theme', n);
  localStorage.setItem('sor-t', n);
}

function toggleFs() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen();
  }
}

function showToast(m) {
  const t = document.getElementById('toast');
  t.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>${m}`;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2200);
}

function printAll() { window.print() }

/* ═══════════════════════════════════════════════
   COMMAND PALETTE
   ═══════════════════════════════════════════════ */
let cmdIdx = 0;

function openCmd() {
  const ov = document.getElementById('cmdOverlay');
  if (!ov) return;
  ov.classList.add('open');
  const inp = document.getElementById('cmdInput');
  if (!inp) return;
  inp.value = '';
  filterCmd();
  setTimeout(() => inp.focus(), 50);
}

function closeCmd() {
  const ov = document.getElementById('cmdOverlay');
  if (ov) ov.classList.remove('open');
}

function filterCmd() {
  const inp = document.getElementById('cmdInput');
  const res = document.getElementById('cmdResults');
  if (!inp || !res || typeof D === 'undefined') return;
  const q = nrm(inp.value.toLowerCase().trim());
  const filtered = D.filter(c => {
    const hay = nrm((c.city + ' ' + c.name + ' ' + c.addr + ' ' + c.caps.map(x => x.t).join(' ')).toLowerCase());
    return !q || hay.includes(q);
  });

  res.innerHTML = filtered.map((c, i) =>
    `<div class="cmd-item${i === 0 ? ' active' : ''}" onclick="goToCard(${c.id});closeCmd()" data-id="${c.id}">
      <span class="cmd-num">${c.id}</span>
      <span class="cmd-city">${c.city}</span>
      <span class="cmd-name">${c.name.split('—')[0].trim()}</span>
    </div>`
  ).join('');
  cmdIdx = 0;
}

function goToCard(id) {
  const card = document.getElementById('c' + id);
  if (!card || card.style.display === 'none') return;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.classList.add('hl');
  setTimeout(() => card.classList.remove('hl'), 1500);
}

/* ═══════════════════════════════════════════════
   SCROLL EFFECTS
   ═══════════════════════════════════════════════ */
let ticking = false;
function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (scrollY / docH * 100) : 0;
      const sp = document.getElementById('scrollProg');
      const tb = document.getElementById('topbar');
      if (sp) sp.style.width = pct + '%';
      if (tb) tb.classList.toggle('scrolled', scrollY > 20);
      ticking = false;
    });
    ticking = true;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });

/* ═══════════════════════════════════════════════
   KEYBOARD SHORTCUTS
   ═══════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  /* Command palette */
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const ov = document.getElementById('cmdOverlay');
    if (!ov) return;
    ov.classList.contains('open') ? closeCmd() : openCmd();
    return;
  }

  /* In command palette */
  const _ov = document.getElementById('cmdOverlay');
  if (_ov && _ov.classList.contains('open')) {
    const items = document.querySelectorAll('.cmd-item');
    if (e.key === 'Escape') { closeCmd(); return }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      cmdIdx = Math.min(cmdIdx + 1, items.length - 1);
      items.forEach((it, i) => it.classList.toggle('active', i === cmdIdx));
      items[cmdIdx]?.scrollIntoView({ block: 'nearest' });
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      cmdIdx = Math.max(cmdIdx - 1, 0);
      items.forEach((it, i) => it.classList.toggle('active', i === cmdIdx));
      items[cmdIdx]?.scrollIntoView({ block: 'nearest' });
    }
    if (e.key === 'Enter' && items[cmdIdx]) {
      const id = parseInt(items[cmdIdx].dataset.id);
      goToCard(id);
      closeCmd();
    }
    return;
  }

  /* Normal mode */
  if (e.target.tagName === 'INPUT') {
    if (e.key === 'Escape') { e.target.value = ''; doFilter(); e.target.blur() }
    return;
  }
  const _search = document.getElementById('search');
  if (e.key === '/' && _search) { e.preventDefault(); _search.focus() }
  if (e.key === 'Escape' && _search) { _search.value = ''; if (typeof D !== 'undefined') doFilter() }
  if (typeof D !== 'undefined') {
    const n = parseInt(e.key);
    if (n >= 1 && n <= D.length) goToCard(n);
  }
});

/* ═══════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════ */
(function init() {
  const sv = localStorage.getItem('sor-t');
  if (sv) document.body.setAttribute('data-theme', sv);
  else if (nt()) document.body.setAttribute('data-theme', 'dark');
  if (typeof D !== 'undefined' && document.getElementById('grid')) render();
  onScroll();
})();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

/* ═══════════════════════════════════════════════
   PIN ACCESS SCREEN
   ═══════════════════════════════════════════════ */
(function pinModule() {
  const PIN_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';
  const PIN_KEY = 'emla-pin-ok';
  const PIN_TTL = 12 * 60 * 60 * 1000; // 12 hours

  async function hashPin(pin) {
    const d = new TextEncoder().encode(pin);
    const h = await crypto.subtle.digest('SHA-256', d);
    return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function checkPin() {
    const ts = localStorage.getItem(PIN_KEY);
    if (!ts) return false;
    const elapsed = Date.now() - parseInt(ts, 10);
    if (elapsed > PIN_TTL || isNaN(elapsed)) {
      localStorage.removeItem(PIN_KEY);
      return false;
    }
    return true;
  }

  function clearPin() {
    localStorage.removeItem(PIN_KEY);
    location.reload();
  }

  function showPinScreen() {
    const overlay = document.createElement('div');
    overlay.className = 'pin-overlay';
    overlay.id = 'pinOverlay';
    overlay.innerHTML = `
      <div class="pin-card">
        <div class="pin-logo">SOR</div>
        <div class="pin-title">Portal EMLA</div>
        <div class="pin-subtitle">Wprowadź kod PIN aby kontynuować</div>
        <div class="pin-inputs">
          <input class="pin-digit" type="tel" maxlength="1" inputmode="numeric" autocomplete="off" aria-label="Cyfra 1">
          <input class="pin-digit" type="tel" maxlength="1" inputmode="numeric" autocomplete="off" aria-label="Cyfra 2">
          <input class="pin-digit" type="tel" maxlength="1" inputmode="numeric" autocomplete="off" aria-label="Cyfra 3">
          <input class="pin-digit" type="tel" maxlength="1" inputmode="numeric" autocomplete="off" aria-label="Cyfra 4">
        </div>
        <div class="pin-msg" id="pinMsg"></div>
      </div>`;
    document.body.appendChild(overlay);

    const digits = overlay.querySelectorAll('.pin-digit');
    const msg = overlay.querySelector('#pinMsg');
    const card = overlay.querySelector('.pin-card');

    /* Focus first digit */
    setTimeout(() => digits[0].focus(), 100);

    /* Handle input on each digit */
    digits.forEach((inp, i) => {
      inp.addEventListener('input', () => {
        inp.value = inp.value.replace(/\D/g, '').slice(-1);
        if (inp.value && i < 3) digits[i + 1].focus();
        /* Check if all 4 filled */
        const pin = Array.from(digits).map(d => d.value).join('');
        if (pin.length === 4) verifyPin(pin, digits, msg, card, overlay);
      });

      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !inp.value && i > 0) {
          digits[i - 1].focus();
          digits[i - 1].value = '';
        }
      });

      /* Allow paste of full PIN */
      inp.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 4);
        if (pasted.length >= 1) {
          for (let j = 0; j < 4; j++) {
            digits[j].value = pasted[j] || '';
          }
          if (pasted.length === 4) {
            digits[3].focus();
            verifyPin(pasted, digits, msg, card, overlay);
          } else {
            digits[Math.min(pasted.length, 3)].focus();
          }
        }
      });
    });
  }

  async function verifyPin(pin, digits, msg, card, overlay) {
    const h = await hashPin(pin);
    if (h === PIN_HASH) {
      localStorage.setItem(PIN_KEY, String(Date.now()));
      overlay.style.transition = 'opacity 0.25s ease';
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 260);
    } else {
      msg.textContent = 'Nieprawidłowy kod PIN';
      card.classList.add('pin-shake');
      digits.forEach(d => { d.classList.add('pin-error'); d.value = ''; });
      setTimeout(() => {
        card.classList.remove('pin-shake');
        digits.forEach(d => d.classList.remove('pin-error'));
        digits[0].focus();
      }, 500);
    }
  }

  /* Add "Wyloguj" link to footer */
  function addLogoutLink() {
    const foot = document.querySelector('.foot');
    if (!foot) return;
    const link = document.createElement('span');
    link.className = 'pin-logout';
    link.textContent = 'Wyloguj';
    link.title = 'Wyczyść PIN i wyloguj';
    link.addEventListener('click', (e) => { e.stopPropagation(); clearPin(); });
    foot.appendChild(document.createTextNode(' · '));
    foot.appendChild(link);
  }

  /* Init */
  if (!checkPin()) {
    showPinScreen();
  }
  addLogoutLink();

  /* Expose clearPin globally for external use */
  window.emlaLogout = clearPin;
})();

/* ═══════════════════════════════════════════════
   BED AVAILABILITY — NLP PARSER
   ═══════════════════════════════════════════════ */
(function bedModule() {
  'use strict';

  const BED_TTL = 8 * 60 * 60 * 1000;   // 8h auto-expire
  const BED_WARN = 4 * 60 * 60 * 1000;   // 4h warning threshold

  /* ── Page slug from URL ── */
  function getPageSlug() {
    const path = location.pathname.replace(/\\/g, '/');
    const file = path.split('/').pop() || '';
    return file.replace('.html', '') || 'index';
  }
  const PAGE_SLUG = getPageSlug();

  /* ── Storage key ── */
  function bedKey(facilityId) {
    return 'emla-beds-' + PAGE_SLUG + '-' + facilityId;
  }

  /* ── NLP Parser ── */
  function parseBeds(raw) {
    const text = raw.trim().toLowerCase()
      .replace(/ł/g, 'l')
      .replace(/ó/g, 'o')
      .replace(/ą/g, 'a')
      .replace(/ę/g, 'e')
      .replace(/ś/g, 's')
      .replace(/ć/g, 'c')
      .replace(/ź/g, 'z')
      .replace(/ż/g, 'z')
      .replace(/ń/g, 'n');

    /* Full-stop keywords */
    if (/^(pelny|pelen|full|brak\s*miejsc|brak)$/.test(text)) {
      return { oit: '0', oddzial: '0' };
    }

    const result = {};

    /* Tokenize: split by commas and semicolons first */
    const segments = text.split(/[,;]+/).map(s => s.trim()).filter(Boolean);

    /* If single segment with just a number or fraction → oddział */
    if (segments.length === 1) {
      const s = segments[0];
      if (/^\d+$/.test(s)) { result.oddzial = s; return result; }
      if (/^\d+\s*\/\s*\d+$/.test(s)) { result.oddzial = s.replace(/\s/g, ''); return result; }
    }

    /* Keywords → ward type mapping */
    const wardMap = [
      { keys: ['respirator', 'resp', 'wentylator'], ward: 'resp' },
      { keys: ['oiom', 'oit', 'intensywna terapia', ' it '], ward: 'oit' },
      /* 'oddzial' keywords are catch-all */
    ];

    function detectWard(seg) {
      for (const wm of wardMap) {
        for (const k of wm.keys) {
          if (seg.includes(k)) return wm.ward;
        }
      }
      /* oddział-related keywords */
      if (/oddz|lozk|miejsc|woln/.test(seg)) return 'oddzial';
      return null;
    }

    function extractValue(seg) {
      /* "pelny/pelen/brak/0 miejsc" → 0 */
      if (/pelny|pelen|brak|full/.test(seg)) return '0';

      /* "X z Y" pattern → "X/Y" */
      const zMatch = seg.match(/(\d+)\s*z\s*(\d+)/);
      if (zMatch) return zMatch[1] + '/' + zMatch[2];

      /* "X/Y" fraction */
      const fracMatch = seg.match(/(\d+)\s*\/\s*(\d+)/);
      if (fracMatch) return fracMatch[1] + '/' + fracMatch[2];

      /* Just a number */
      const nums = seg.match(/\d+/g);
      if (nums) return nums[0];

      return null;
    }

    /* Process each segment */
    for (const seg of segments) {
      let ward = detectWard(seg);
      const val = extractValue(seg);
      if (val === null) continue;

      /* If no ward detected, try positional: if we already have something assigned
         or if keyword is a number next to a ward name */
      if (!ward) {
        /* Check if segment starts with a ward abbreviation-like token */
        if (/^(oit|oiom|it)\b/.test(seg)) ward = 'oit';
        else if (/^resp\b/.test(seg)) ward = 'resp';
        else ward = 'oddzial'; /* default */
      }

      result[ward] = val;
    }

    /* Handle single-line without commas: "OIT 2/8 oddział 5/24" or "3 oit 12 oddz" */
    if (segments.length === 1 && Object.keys(result).length <= 1) {
      const s = segments[0];

      /* Pattern: "WARD NUM WARD NUM ..." */
      const multiPattern = /(?:^|\s)(oit|oiom|it|resp|respirator|wentylator|oddz(?:ial)?|lozk[a]?|miejsc|woln(?:e|ych)?)\s*(\d+(?:\s*[z\/]\s*\d+)?)|(\d+)\s*(oit|oiom|it|resp|respirator|wentylator|oddz(?:ial)?)/g;
      let m;
      const multi = {};
      while ((m = multiPattern.exec(s)) !== null) {
        let kw = m[1] || m[4];
        let v = m[2] || m[3];
        if (!kw || !v) continue;
        v = v.replace(/\s*z\s*/g, '/').replace(/\s/g, '');
        let w = 'oddzial';
        if (/^(oit|oiom|it)$/.test(kw)) w = 'oit';
        else if (/^(resp|respirator|wentylator)$/.test(kw)) w = 'resp';
        multi[w] = v;
      }
      if (Object.keys(multi).length > 0) return multi;
    }

    return Object.keys(result).length > 0 ? result : null;
  }

  /* ── Time formatting ── */
  function hhmm(ts) {
    const d = ts ? new Date(ts) : new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  /* ── Save bed data ── */
  function saveBeds(facilityId, parsed, rawText) {
    const now = Date.now();
    const data = Object.assign({}, parsed, {
      time: hhmm(),
      ts: now,
      raw: rawText
    });
    try {
      localStorage.setItem(bedKey(facilityId), JSON.stringify(data));
    } catch (e) { /* quota exceeded — ignore */ }
    return data;
  }

  /* ── Load bed data (with expiry check) ── */
  function loadBeds(facilityId) {
    try {
      const raw = localStorage.getItem(bedKey(facilityId));
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data.ts) return null;
      const age = Date.now() - data.ts;
      if (age > BED_TTL) {
        localStorage.removeItem(bedKey(facilityId));
        return null;
      }
      return data;
    } catch (e) { return null; }
  }

  /* ── Clear bed data ── */
  function clearBeds(facilityId) {
    localStorage.removeItem(bedKey(facilityId));
  }

  /* ── Render bed display ── */
  function renderBedDisplay(card, facilityId) {
    /* Remove existing display */
    const existing = card.querySelector('.bed-display');
    if (existing) existing.remove();

    const data = loadBeds(facilityId);
    if (!data) return;

    const age = Date.now() - data.ts;
    const isOld = age > BED_WARN;
    const ageClass = isOld ? 'bed-old' : '';

    /* Build ward items */
    const wards = [];
    if (data.oit !== undefined) {
      const empty = data.oit === '0' || data.oit === '0/0';
      wards.push('<span class="bed-ward' + (empty ? ' bed-zero' : ' bed-avail') + '">OIT: <strong>' + data.oit + '</strong></span>');
    }
    if (data.oddzial !== undefined) {
      const empty = data.oddzial === '0' || data.oddzial === '0/0';
      wards.push('<span class="bed-ward' + (empty ? ' bed-zero' : ' bed-avail') + '">Oddz: <strong>' + data.oddzial + '</strong></span>');
    }
    if (data.resp !== undefined) {
      const empty = data.resp === '0' || data.resp === '0/0';
      wards.push('<span class="bed-ward' + (empty ? ' bed-zero' : ' bed-avail') + '">Resp: <strong>' + data.resp + '</strong></span>');
    }

    const warningBadge = isOld ? '<span class="bed-warn-badge">&#9888;&#65039; &gt;4h</span>' : '';

    const el = document.createElement('div');
    el.className = 'bed-display ' + ageClass;
    el.innerHTML =
      '<div class="bed-row">' +
        '<span class="bed-icon">&#127973;</span>' +
        wards.join('<span class="bed-sep">|</span>') +
        '<span class="bed-time">&#128336; ' + data.time + '</span>' +
        warningBadge +
        '<button class="bed-clear" onclick="event.stopPropagation();window._bedClear(' + facilityId + ',this)" title="Usuń dane">&times;</button>' +
      '</div>';

    /* Insert after .caps */
    const caps = card.querySelector('.caps');
    if (caps) {
      caps.parentNode.insertBefore(el, caps.nextSibling);
    }
  }

  /* ── Toggle input field ── */
  function toggleBedInput(facilityId, btn) {
    const card = document.getElementById('c' + facilityId);
    if (!card) return;

    /* If input already visible, remove it */
    const existing = card.querySelector('.bed-input-wrap');
    if (existing) { existing.remove(); return; }

    const wrap = document.createElement('div');
    wrap.className = 'bed-input-wrap';

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.className = 'bed-input';
    inp.placeholder = 'np. OIT 2/8, oddział 5 wolnych';
    inp.setAttribute('autocomplete', 'off');
    inp.setAttribute('autocorrect', 'off');
    inp.setAttribute('spellcheck', 'false');

    inp.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const val = inp.value.trim();
        if (!val) { wrap.remove(); return; }
        const parsed = parseBeds(val);
        if (!parsed) {
          inp.classList.add('bed-input-err');
          setTimeout(function() { inp.classList.remove('bed-input-err'); }, 400);
          return;
        }
        saveBeds(facilityId, parsed, inp.value.trim());
        wrap.remove();
        renderBedDisplay(card, facilityId);
        showToast('Łóżka zapisane: ' + val);
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        wrap.remove();
      }
    });

    wrap.appendChild(inp);

    /* Insert after .cacts (inside .cbot) */
    const cacts = card.querySelector('.cacts');
    if (cacts) {
      cacts.parentNode.insertBefore(wrap, cacts.nextSibling);
    }

    setTimeout(function() { inp.focus(); }, 50);
  }

  /* ── Global clear handler ── */
  window._bedClear = function(facilityId, btn) {
    clearBeds(facilityId);
    const card = document.getElementById('c' + facilityId);
    if (card) {
      const disp = card.querySelector('.bed-display');
      if (disp) disp.remove();
    }
    showToast('Dane łóżek usunięte');
  };

  /* ── Global toggle handler ── */
  window._bedToggle = function(facilityId, btn) {
    toggleBedInput(facilityId, btn);
  };

  /* ── Inject buttons and restore saved data ── */
  function init() {
    if (typeof D === 'undefined') return;

    /* Wait for render to complete */
    requestAnimationFrame(function() {
      setTimeout(function() {
        D.forEach(function(c) {
          const card = document.getElementById('c' + c.id);
          if (!card) return;

          /* Add bed button to .cacts */
          const cacts = card.querySelector('.cacts');
          if (cacts && !cacts.querySelector('.bed-btn')) {
            const btn = document.createElement('button');
            btn.className = 'ca bed-btn';
            btn.setAttribute('aria-label', 'Łóżka');
            btn.innerHTML = '&#127973; Łóżka';
            btn.onclick = function(e) {
              e.stopPropagation();
              window._bedToggle(c.id, btn);
            };
            cacts.appendChild(btn);
          }

          /* Restore saved bed data */
          renderBedDisplay(card, c.id);
        });
      }, 600);
    });
  }

  init();
})();
