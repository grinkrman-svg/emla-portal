// ═══════════════════════════════════════════════════
// EMLA Loader — Supabase backend for protokoły / leki / kalkulatory
// Created: 2026-04-29 (Phase 0/1/2)
// Schema: emla (zqfqqwdfndkipnklajdf.supabase.co)
// ═══════════════════════════════════════════════════
//
// Usage in HTML pages:
//   <script src="js/emla-loader.js"></script>
//   const drugs    = await EmlaAPI.getDrugs();
//   const drugs    = await EmlaAPI.getDrugs({ category: 'antybiotyki' });
//   const proto    = await EmlaAPI.getProtocols({ category: 'sepsa' });
//   const proto    = await EmlaAPI.getProtocol('SEPSA-SSC-2021');
//   const calcs    = await EmlaAPI.getCalculators();
//   const versions = await EmlaAPI.getGuidelinesVersions();
//
// Notes:
// - All data is reference (public read RLS policy).
// - To save calculator history (per-doctor), call EmlaAPI.saveCalcResult(...).
//   That requires an auth.uid() — for now offline, use localStorage fallback.
// ═══════════════════════════════════════════════════

const EmlaAPI = (() => {
  // Public anon key — safe to ship in client (read-only on reference tables)
  const SUPABASE_URL = 'https://zqfqqwdfndkipnklajdf.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxZnFxd2RmbmRraXBua2xhamRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2ODg0NTYsImV4cCI6MjA5MDI2NDQ1Nn0.Pff3qR_smoJ0OQjbVk_FNT8oftB7Fugy2XgMYIBQlU0';
  // ↑ Replace with your project's anon key on first deploy. This is the public key, safe.
  //   For now, generate via: Supabase Dashboard → Settings → API → anon/public key.

  const HEADERS_READ = {
    'apikey':         SUPABASE_ANON,
    'Authorization':  'Bearer ' + SUPABASE_ANON,
    'Accept-Profile': 'emla',
    'Content-Type':   'application/json',
  };

  /** Generic GET helper */
  async function _get(path, params = {}) {
    const qs = new URLSearchParams(params).toString();
    const url = `${SUPABASE_URL}/rest/v1/${path}${qs ? '?' + qs : ''}`;
    const r = await fetch(url, { headers: HEADERS_READ });
    if (!r.ok) {
      console.error('[EmlaAPI]', r.status, await r.text());
      throw new Error(`EmlaAPI ${path} → ${r.status}`);
    }
    return r.json();
  }

  /** Get drugs, optionally filter by category or verified */
  async function getDrugs({ category, verified, limit = 500 } = {}) {
    const p = { select: '*', order: 'category.asc,id.asc', limit: String(limit) };
    if (category) p.category = `eq.${category}`;
    if (verified !== undefined) p.verified = `eq.${verified}`;
    return _get('drugs', p);
  }

  /** Get single drug by id */
  async function getDrug(id) {
    const rows = await _get('drugs', { id: `eq.${id}`, select: '*' });
    return rows[0] || null;
  }

  /** Search drugs by INN/PL name (case-insensitive) */
  async function searchDrugs(query) {
    const q = String(query).toLowerCase();
    // PostgREST `or` filter — search inn/pl_name
    return _get('drugs', {
      or: `(inn.ilike.*${q}*,pl_name.ilike.*${q}*)`,
      select: 'id,inn,pl_name,category,typical_adult_dose',
      order: 'category.asc',
      limit: '50',
    });
  }

  /** Get protocols, optionally filter by category */
  async function getProtocols({ category, source } = {}) {
    const p = { select: 'id,code,category,title_pl,short_description,source,source_year,valid_until,smoke_test_passed', order: 'category.asc,source.asc' };
    if (category) p.category = `eq.${category}`;
    if (source)   p.source   = `eq.${source}`;
    return _get('protocols', p);
  }

  /** Get full protocol by code */
  async function getProtocol(code) {
    const rows = await _get('protocols', { code: `eq.${code}`, select: '*' });
    return rows[0] || null;
  }

  /** Get calculators */
  async function getCalculators() {
    return _get('calculators', { select: '*', order: 'category.asc,code.asc' });
  }

  /** Get current guidelines versions (sources we track) */
  async function getGuidelinesVersions() {
    return _get('guidelines_versions', { select: '*', order: 'source.asc', is_current: 'eq.true' });
  }

  /** Save calculator result locally (Supabase later when auth wired) */
  function saveCalcResult({ calc_code, patient_number, inputs, result_value, result_interpretation }) {
    const key = 'emla_calc_history';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.push({
      calc_code, patient_number,
      inputs, result_value, result_interpretation,
      calculated_at: new Date().toISOString(),
    });
    // keep last 100 entries
    if (list.length > 100) list.splice(0, list.length - 100);
    localStorage.setItem(key, JSON.stringify(list));
    return list[list.length - 1];
  }
  function getCalcHistory(calc_code) {
    const list = JSON.parse(localStorage.getItem('emla_calc_history') || '[]');
    return calc_code ? list.filter(x => x.calc_code === calc_code) : list;
  }

  /** Render markdown content_md to HTML (lightweight, no deps) */
  function renderMd(md) {
    if (!md) return '';
    return md
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^### (.*)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.*)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, m => '<ul>' + m + '</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[hul])/gm, '<p>')
      .replace(/<p><\/p>/g, '');
  }

  return {
    SUPABASE_URL, SUPABASE_ANON,
    getDrugs, getDrug, searchDrugs,
    getProtocols, getProtocol,
    getCalculators,
    getGuidelinesVersions,
    saveCalcResult, getCalcHistory,
    renderMd,
  };
})();

// Auto-export to window for inline scripts
if (typeof window !== 'undefined') window.EmlaAPI = EmlaAPI;
