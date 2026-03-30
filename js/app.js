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
  const q = nrm(document.getElementById('search').value.toLowerCase().trim());
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
  ov.classList.add('open');
  const inp = document.getElementById('cmdInput');
  inp.value = '';
  filterCmd();
  setTimeout(() => inp.focus(), 50);
}

function closeCmd() {
  document.getElementById('cmdOverlay').classList.remove('open');
}

function filterCmd() {
  const q = nrm(document.getElementById('cmdInput').value.toLowerCase().trim());
  const res = document.getElementById('cmdResults');
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
      document.getElementById('scrollProg').style.width = pct + '%';
      document.getElementById('topbar').classList.toggle('scrolled', scrollY > 20);
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
    ov.classList.contains('open') ? closeCmd() : openCmd();
    return;
  }

  /* In command palette */
  if (document.getElementById('cmdOverlay').classList.contains('open')) {
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
  if (e.key === '/') { e.preventDefault(); document.getElementById('search').focus() }
  if (e.key === 'Escape') { document.getElementById('search').value = ''; doFilter() }
  const n = parseInt(e.key);
  if (n >= 1 && n <= D.length) goToCard(n);
});

/* ═══════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════ */
(function init() {
  const sv = localStorage.getItem('sor-t');
  if (sv) document.body.setAttribute('data-theme', sv);
  else if (nt()) document.body.setAttribute('data-theme', 'dark');
  render();
  onScroll();
})();
