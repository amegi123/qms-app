// Core helpers: state, API, icons, formatting, UI primitives.
export const state = { user: null, meta: null, counts: {} };
// ---------- language (English / Amharic) – machine-drafted labels, to be reviewed by a native speaker ----------
import { AM, MON_AM, startTranslator, stopTranslator } from './i18n.js';
export let lang = 'en'; try { lang = localStorage.getItem('wf-lang') || 'en'; } catch (_) {}
export const setLangPref = (l) => { lang = l; try { localStorage.setItem('wf-lang', l); } catch (_) {} document.documentElement.lang = l; l === 'am' ? startTranslator() : stopTranslator(); };
export const tr = (s) => (lang === 'am' && AM[s]) || s;
document.documentElement.lang = lang;
if (lang === 'am') document.addEventListener('DOMContentLoaded', startTranslator), setTimeout(startTranslator, 0);

// ---------- icons ----------
const P = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M9 13h6 M9 17h4',
  alert: 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z M12 9v4 M12 17h.01',
  wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
  message: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  clipboard: 'M9 3h6v4H9z M9 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-3 M9 14l2 2 4-4',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8',
  grad: 'M22 10 12 5 2 10l10 5 10-5z M6 12v5c3 2 9 2 12 0v-5',
  gauge: 'M12 14l4-4 M3.3 19a10 10 0 1 1 17.4 0z',
  cog: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  truck: 'M1 4h14v12H1z M15 8h4l3 3v5h-7z M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  flask: 'M9 3h6 M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3 M7 15h10',
  archive: 'M3 4h18v4H3z M5 8v12h14V8 M10 12h4',
  smile: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M8 14s1.5 2 4 2 4-2 4-2 M9 9h.01 M15 9h.01',
  building: 'M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16 M16 9h2a2 2 0 0 1 2 2v10 M2 21h20 M8 7h4 M8 11h4 M8 15h4',
  chart: 'M3 3v18h18 M7 15l4-4 3 3 5-6',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9 M13.7 21a2 2 0 0 1-3.4 0',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 1v2 M12 21v2 M4.2 4.2l1.4 1.4 M18.4 18.4l1.4 1.4 M1 12h2 M21 12h2 M4.2 19.8l1.4-1.4 M18.4 5.6l1.4-1.4',
  plus: 'M12 5v14 M5 12h14', x: 'M18 6 6 18 M6 6l12 12', check: 'M20 6 9 17l-5-5', chevR: 'm9 18 6-6-6-6', chevD: 'm6 9 6 6 6-6', chevL: 'm15 18-6-6 6-6',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3', upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2',
  link: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7 M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7', logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  filter: 'M22 3H2l8 9.5V19l4 2v-8.5z', printer: 'M6 9V2h12v7 M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M6 14h12v8H6z',
  calendar: 'M3 5h18v16H3z M16 3v4 M8 3v4 M3 10h18', shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
  list: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01', grid: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
  send: 'M22 2 11 13 M22 2l-7 20-4-9-9-4z', clip: 'M21.4 11.1l-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5',
  trend: 'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6', refresh: 'M21 2v6h-6 M3 12a9 9 0 0 1 15-6.7L21 8 M3 22v-6h6 M21 12a9 9 0 0 1-15 6.7L3 16',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01', edit: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  sitemap: 'M9 3h6v4H9z M3 17h6v4H3z M15 17h6v4h-6z M12 7v5 M6 17v-5h12v5', drop: 'M12 2.7l5.7 5.6a8 8 0 1 1-11.3 0z',
  layers: 'M12 2 2 7l10 5 10-5z M2 17l10 5 10-5 M2 12l10 5 10-5', target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2-6.2 3.2 1.2-6.8-5-4.9 6.9-1z', more: 'M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  arrowR: 'M5 12h14 M12 5l7 7-7 7', menu: 'M3 6h18 M3 12h18 M3 18h18', monitor: 'M2 4h20v13H2z M8 21h8 M12 17v4', zap: 'M13 2 3 14h9l-1 8 10-12h-9z', lock: 'M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4',
};
export const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[n] || P.file}"/></svg>`;

// ---------- utils ----------
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const todayISO = () => new Date().toISOString().slice(0, 10);
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const fmtDate = (s) => { if (!s || !/^\d{4}-\d{2}-\d{2}/.test(s)) return s || '—'; const [y, m, d] = s.slice(0, 10).split('-'); return `${+d} ${(lang === 'am' ? MON_AM : MON)[+m - 1]} ${y}`; };
export const monthLabel = (ym) => (lang === 'am' ? MON_AM : MON)[+ym.slice(5, 7) - 1];
export function ago(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + 'm ago'; if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  if (s < 86400 * 7) return Math.floor(s / 86400) + 'd ago'; return fmtDate(iso);
}
export const fmtSize = (b) => (b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');
export const user = (id) => state.meta?.users.find((u) => u.id === id);
export const initials = (n) => n.split(/\s+/).map((x) => x[0]).slice(0, 2).join('').toUpperCase();
export const avatar = (id, cls = '') => { const u = user(id); return u ? `<span class="avatar ${cls}" style="background:${u.color}" title="${esc(u.name)}">${initials(u.name)}</span>` : ''; };
export const userChip = (id) => { const u = user(id); return u ? `<span class="split">${avatar(id, 'sm')}<span>${esc(u.name)}</span></span>` : '<span class="faint">—</span>'; };
export const badge = (label, tone = '', plain) => `<span class="badge ${tone} ${plain ? 'plain' : ''}">${esc(label)}</span>`;
export const stateOf = (def, key) => def.states.find((s) => s.key === key) || { label: key, tone: '' };
export const statusBadge = (def, key) => { const s = stateOf(def, key); return badge(s.label, s.tone === 'gray' ? '' : s.tone); };
export function dueCell(r) {
  if (r.dueIn === undefined) return '';
  if (r.overdue) return `<span class="due-over">${-r.dueIn}d overdue</span>`;
  if (r.dueIn <= 7) return `<span class="due-soon">${r.dueIn === 0 ? 'Due today' : `Due in ${r.dueIn}d`}</span>`;
  return `<span class="muted">in ${r.dueIn}d</span>`;
}
export const EXT_COLORS = { doc: '#2b579a', docx: '#2b579a', xls: '#1d6f42', xlsx: '#1d6f42', pdf: '#c7372f', ppt: '#c43e1c', pptx: '#c43e1c', png: '#7c3aed', jpg: '#7c3aed', jpeg: '#7c3aed', txt: '#64748b', csv: '#1d6f42' };
export const extBadge = (ext) => `<span class="ext" style="background:${EXT_COLORS[ext] || '#64748b'}">${esc(ext || '?')}</span>`;
export const debounce = (fn, ms = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
export const can = (flow, from, to) => flow.some((f) => f.from === from && f.to === to && f.roles.includes(state.user.role));

// ---------- API ----------
// ---------- offline queue (factory-floor tablets): shift logs, lab tests and inspections are saved locally and synced later ----------
const QKEY = 'wf-queue', OFFLINE_OK = /^\/m\/(shiftlogs|labtests|inspections)$/;
const readQ = () => { try { return JSON.parse(localStorage.getItem(QKEY) || '[]'); } catch (_) { return []; } };
const writeQ = (q) => { try { localStorage.setItem(QKEY, JSON.stringify(q)); } catch (_) {} };
export const queued = () => readQ().length;
export async function syncQueue() {
  const q = readQ(); if (!q.length || !navigator.onLine) return 0;
  const left = []; let done = 0;
  for (const it of q) { try { const r = await fetch('/api' + it.url, { method: 'POST', headers: { 'x-user': it.user, 'Content-Type': 'application/json' }, body: JSON.stringify(it.body) }); if (r.ok) done++; else left.push(it); } catch (_) { left.push(it); } }
  writeQ(left); if (done) toast(`${done} offline record${done > 1 ? 's' : ''} synced`); return done;
}
export async function api(url, opts = {}) {
  const method = opts.method || (opts.body ? 'POST' : 'GET');
  const headers = { 'x-user': state.user?.id || '', ...(opts.body && !(opts.raw) ? { 'Content-Type': 'application/json' } : {}), ...(opts.headers || {}) };
  let r;
  try { r = await fetch('/api' + url, { method, headers, body: opts.raw ? opts.body : opts.body ? JSON.stringify(opts.body) : undefined }); }
  catch (e) {
    if (method === 'POST' && !opts.raw && OFFLINE_OK.test(url)) { const q = readQ(); q.push({ url, body: opts.body, user: state.user?.id }); writeQ(q); toast('Offline – saved on this device, will sync when Wi-Fi returns'); return { offline: true, code: '(pending sync)', id: 'offline' }; }
    toast('You appear to be offline', true); throw e;
  }
  const data = await r.json().catch(() => ({}));
  if (!r.ok) { toast(data.error || 'Something went wrong', true); throw new Error(data.error); }
  return data;
}
export async function upload(url, file) {
  if (file.size > 50 * 1024 * 1024) { toast('File too large (max 50 MB)', true); throw new Error('too large'); }
  return api(url, { method: 'PUT', raw: true, body: file, headers: { 'x-filename': encodeURIComponent(file.name), 'Content-Type': 'application/octet-stream' } });
}

// ---------- toasts ----------
export function toast(msg, isErr) {
  let host = $('.toasts'); if (!host) { host = document.createElement('div'); host.className = 'toasts'; document.body.appendChild(host); }
  const t = document.createElement('div'); t.className = 'toast' + (isErr ? ' err' : '');
  t.innerHTML = `${icon(isErr ? 'alert' : 'check')}<span>${esc(msg)}</span>`;
  host.appendChild(t); setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3200);
}

// ---------- overlays ----------
let escStack = [];
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && escStack.length) { e.preventDefault(); escStack[escStack.length - 1](); } });
function overlay(html, cls) {
  const scrim = document.createElement('div'); scrim.className = 'scrim'; if (cls === 'modal') scrim.style.zIndex = 59;
  const el = document.createElement('div'); el.className = cls; el.innerHTML = html;
  document.body.append(scrim, el);
  const close = () => { scrim.remove(); el.remove(); escStack = escStack.filter((f) => f !== close); };
  scrim.onclick = close; escStack.push(close);
  el.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
  return { el, close };
}
export const drawer = (html) => overlay(html, 'drawer');
export function modal({ title, sub, body, foot, wide }) {
  const m = overlay(`<div class="modal-box ${wide ? 'wide' : ''}"><div class="modal-h"><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div><div class="modal-b">${body}</div><div class="modal-f">${foot || '<button class="btn" data-close>Close</button>'}</div></div>`, 'modal');
  m.el.addEventListener('click', (e) => { if (e.target === m.el) m.close(); });
  setTimeout(() => m.el.querySelector('input,textarea,select')?.focus(), 30);
  return m;
}
export function confirmBox({ title, sub, label = 'Confirm', danger, needNote, notePlaceholder, needPassword }) {
  return new Promise((resolve) => {
    const noteHtml = needNote !== undefined ? `<div class="fld"><label>${needNote ? 'Reason <span class="req">*</span>' : 'Comment (optional)'}</label><textarea class="input" id="cNote" style="width:100%" placeholder="${esc(notePlaceholder || '')}"></textarea></div>` : '';
    const pwHtml = needPassword ? `<div class="fld" style="margin-top:12px"><label>${icon('lock', 'sm')} Electronic signature – re-enter your password <span class="req">*</span></label><input class="input" type="password" id="cPw" autocomplete="off" placeholder="Demo password: wf2026"><div class="hint">Your signature, name, time and IP address are recorded in the audit trail.</div></div>` : '';
    const m = modal({ title, sub, body: noteHtml + pwHtml || '<span></span>', foot: `<button class="btn" data-close>Cancel</button><button class="btn ${danger ? 'danger' : 'primary'}" id="cOk">${esc(label)}</button>` });
    if (!noteHtml && !pwHtml) m.el.querySelector('.modal-b').remove();
    m.el.querySelector('#cOk').onclick = () => {
      const note = m.el.querySelector('#cNote')?.value.trim(), password = m.el.querySelector('#cPw')?.value;
      if (needNote && !note) { toast('Please give a reason', true); return; }
      if (needPassword && !password) { toast('Password required to sign', true); return; }
      m.close(); resolve({ ok: true, note, password });
    };
    escStack[escStack.length - 1] = (() => { const c = m.close; return () => { c(); resolve({ ok: false }); }; })();
  });
}
export function popover(anchor, html, { align = 'right', width } = {}) {
  document.querySelector('.pop')?.remove();
  const r = anchor.getBoundingClientRect();
  const el = document.createElement('div'); el.className = 'pop'; el.innerHTML = html; if (width) el.style.width = width + 'px';
  document.body.appendChild(el);
  const w = el.offsetWidth; el.style.top = (r.bottom + 6) + 'px';
  el.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, align === 'right' ? r.right - w : r.left)) + 'px';
  if (r.bottom + el.offsetHeight > window.innerHeight - 8) el.style.top = Math.max(8, r.top - el.offsetHeight - 6) + 'px';
  const off = (e) => { if (!el.contains(e.target) && e.target !== anchor && !anchor.contains(e.target)) { el.remove(); document.removeEventListener('mousedown', off); } };
  setTimeout(() => document.addEventListener('mousedown', off), 0);
  el.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) el.remove(); });
  return el;
}

// ---------- form builder ----------
export function fieldInput(f, v, opts = {}) {
  const id = 'f_' + f.k, val = v ?? '';
  const deptOpts = state.meta.deptNames;
  switch (f.t) {
    case 'textarea': return `<textarea class="input" id="${id}" rows="3">${esc(val)}</textarea>`;
    case 'select': return `<select class="select" id="${id}"><option value="">Select…</option>${f.opts.map((o) => `<option ${o === val ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    case 'dept': return `<select class="select" id="${id}"><option value="">Select…</option>${deptOpts.map((o) => `<option ${o === (val || (opts.isNew ? state.user.dept : '')) ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    case 'user': return `<select class="select" id="${id}"><option value="">Unassigned</option>${state.meta.users.map((u) => `<option value="${u.id}" ${u.id === val ? 'selected' : ''}>${esc(u.name)} — ${esc(u.title)}</option>`).join('')}</select>`;
    case 'date': return `<input class="input" type="date" id="${id}" value="${esc(val)}">`;
    case 'number': return `<input class="input" type="number" min="0" id="${id}" value="${esc(val)}">`;
    case 'rating': return `<select class="select" id="${id}"><option value="">—</option>${[5, 4, 3, 2, 1].map((n) => `<option value="${n}" ${+val === n ? 'selected' : ''}>${n} – ${['', 'Unacceptable', 'Fair', 'Good', 'Very good', 'Outstanding'][n]}</option>`).join('')}</select>`;
    case 'scale4': return `<select class="select" id="${id}"><option value="">—</option>${[4, 3, 2, 1].map((n) => `<option value="${n}" ${+val === n ? 'selected' : ''}>${['', 'Poor', 'Satisfactory', 'Good', 'Very good'][n]}</option>`).join('')}</select>`;
    case 'checklist': return `<div class="chips" id="${id}">${f.opts.map((o) => `<label class="chip ${(val || []).includes(o) ? 'on' : ''}" style="cursor:pointer"><input type="checkbox" value="${esc(o)}" ${(val || []).includes(o) ? 'checked' : ''} style="display:none">${esc(o)}</label>`).join('')}</div>`;
    default: return `<input class="input" id="${id}" value="${esc(val)}">`;
  }
}
export function formHTML(fields, rec = {}, opts = {}) {
  return `<div class="form">${fields.map((f) => `<div class="fld ${f.full || f.t === 'textarea' || f.t === 'checklist' ? 'full' : ''}"><label>${esc(f.l)}${f.req ? ' <span class="req">*</span>' : ''}</label>${fieldInput(f, rec[f.k], opts)}</div>`).join('')}</div>`;
}
export function bindChecklists(root) {
  root.querySelectorAll('.chips label.chip').forEach((l) => l.addEventListener('click', (e) => { e.preventDefault(); const cb = l.querySelector('input'); cb.checked = !cb.checked; l.classList.toggle('on', cb.checked); }));
}
export function readForm(fields, root) {
  const out = {};
  for (const f of fields) {
    const el = root.querySelector('#f_' + f.k); if (!el) continue;
    out[f.k] = f.t === 'checklist' ? [...el.querySelectorAll('input:checked')].map((x) => x.value) : el.value;
  }
  return out;
}
export function displayValue(f, v) {
  if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) return '<span class="faint">—</span>';
  if (f.t === 'user') return userChip(v);
  if (f.t === 'date') return esc(fmtDate(v));
  if (f.t === 'rating') return `${stars(v, 5)} <span class="muted">${v}/5</span>`;
  if (f.t === 'scale4') return badge(['', 'Poor', 'Satisfactory', 'Good', 'Very good'][v], ['', 'red', 'amber', 'blue', 'green'][v]);
  if (f.t === 'checklist') return `<div class="chips">${v.map((x) => `<span class="tag">${esc(x)}</span>`).join('')}</div>`;
  if (f.t === 'textarea') return `<div style="white-space:pre-wrap">${esc(v)}</div>`;
  return esc(v);
}
export const stars = (v, max) => `<span style="color:#f5a524;letter-spacing:1px">${'★'.repeat(Math.round(v))}<span style="color:var(--line-2)">${'★'.repeat(max - Math.round(v))}</span></span>`;
export const scoreBadge = (s) => (s == null ? '<span class="faint">—</span>' : badge(s + '%', s >= 80 ? 'green' : s >= 65 ? 'blue' : s >= 50 ? 'amber' : 'red', true));

export function empty(title, sub, ico = 'search') { return `<div class="empty"><div class="ico">${icon(ico, 'lg')}</div><b>${esc(title)}</b>${esc(sub || '')}</div>`; }
export function stepper(states, cur, skip = []) {
  const list = states.filter((s) => !skip.includes(s.key));
  const idx = list.findIndex((s) => s.key === cur);
  return `<div class="stepper">${list.map((s, i) => `${i ? `<div class="st-line ${i <= idx ? 'done' : ''}"></div>` : ''}<div class="st ${i < idx || (i === idx && i === list.length - 1) ? 'done' : i === idx ? 'cur' : ''}"><span class="n">${i < idx || (i === idx && i === list.length - 1) ? '✓' : i + 1}</span>${esc(s.label)}</div>`).join('')}</div>`;
}
export function timeline(items) {
  if (!items.length) return empty('No activity yet', '', 'clock');
  return `<div class="tl">${items.map((h) => { const u = user(h.by); return `<div class="tl-i ${h.tone || ''}"><b>${esc(h.action)}</b><small>${u ? esc(u.name) + ' · ' : ''}${esc(fmtDate(h.at))} ${h.at && h.at.length > 10 ? new Date(h.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</small>${h.note ? `<p>${esc(h.note)}</p>` : ''}</div>`; }).join('')}</div>`;
}
export function commentsHTML(list) {
  return `<div id="cmts">${list.length ? list.map((c) => `<div class="cmt">${avatar(c.by)}<div class="body"><b>${esc(user(c.by)?.name || '')}</b><small>${ago(c.at)}</small><p>${esc(c.text)}</p></div></div>`).join('') : '<p class="muted" style="margin:0 0 14px">No comments yet. Start the discussion.</p>'}</div>
    <div class="split" style="align-items:flex-start">${avatar(state.user.id)}<textarea class="input" id="cmtIn" rows="2" style="flex:1;min-height:60px" placeholder="Write a comment…"></textarea><button class="btn primary" id="cmtBtn">${icon('send')}Post</button></div>`;
}
export function dropzone(id, label = 'Drop a file here or click to browse') {
  return `<label class="drop" id="${id}">${icon('upload', 'lg')}<b>${esc(label)}</b><small>PDF, Word, Excel, PowerPoint, images · max 50 MB</small><input type="file" hidden></label>`;
}
export function bindDrop(el, onFile) {
  const input = el.querySelector('input');
  input.onchange = () => input.files[0] && onFile(input.files[0]);
  el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('over'); });
  el.addEventListener('dragleave', () => el.classList.remove('over'));
  el.addEventListener('drop', (e) => { e.preventDefault(); el.classList.remove('over'); e.dataTransfer.files[0] && onFile(e.dataTransfer.files[0]); });
}
export function sortRows(rows, key, dir) {
  return rows.slice().sort((a, b) => {
    let x = a[key], y = b[key];
    if (key === 'owner' || key === 'leader' || key === 'chair') { x = user(x)?.name || ''; y = user(y)?.name || ''; }
    if (x == null) return 1; if (y == null) return -1;
    return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true })) * dir;
  });
}
