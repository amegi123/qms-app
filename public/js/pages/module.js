// Generic engine for every QMS module defined in lib/modules.js: list (table / board / calendar), record drawer, workflow, create.
import { tr, state, api, icon, esc, fmtDate, ago, avatar, user, userChip, badge, statusBadge, stateOf, empty, stepper, timeline, commentsHTML, dropzone, bindDrop, upload, toast, modal, confirmBox, drawer, formHTML, readForm, bindChecklists, displayValue, dueCell, scoreBadge, debounce, sortRows, extBadge, fmtSize, $ } from '../core.js';
import { setCrumbs, refreshCounts } from '../app.js';
import { download } from './documents.js';
import { toneColor } from '../charts.js';

const SIDE = ['hold', 'quarantine', 'retired', 'rejected', 'suspended', 'conditional', 'out', 'due'];
const FINAL = ['closed', 'released', 'rejected', 'disposed', 'retired'];
const uiState = {};
const ui = (mod) => (uiState[mod] = uiState[mod] || { q: '', status: '', dept: '', mine: false, view: 'table', sort: 'created', dir: -1 });
let current = { mod: null, rows: [] };

const COLS = {
  code: ['Code', (r) => `<span class="code">${esc(r.code || r.fileCode)}</span>`],
  fileCode: ['File code', (r) => `<span class="code">${esc(r.fileCode)}</span>`],
  status: ['Status', (r, def) => statusBadge(def, r.status)],
  created: ['Raised', (r) => `<span class="nowrap muted">${esc(fmtDate(r.created))}</span>`],
  owner: ['Owner', (r) => userChip(r.owner)], leader: ['Lead auditor', (r) => userChip(r.leader)], chair: ['Chair', (r) => userChip(r.chair)],
  due: ['Due', (r) => `<div class="nowrap">${esc(fmtDate(r.due))}<div style="font-size:12px">${dueCell(r)}</div></div>`],
  date: ['Date', (r) => `<div class="nowrap">${esc(fmtDate(r.date))}<div style="font-size:12px">${dueCell(r)}</div></div>`],
  score: ['Score', (r) => scoreBadge(r.score)],
  classification: ['Class', (r) => (r.classification ? badge(r.classification.replace(/ non-conformity| \(OFI\)/g, '').replace('Opportunity for improvement', 'OFI'), /Major/.test(r.classification) ? 'red' : /Minor/.test(r.classification) ? 'amber' : 'blue', true) : '<span class="faint">—</span>')],
  priority: ['Priority', (r) => (r.priority ? badge(r.priority, { Critical: 'red', High: 'amber', Medium: 'blue', Low: '' }[r.priority] || '', true) : '<span class="faint">—</span>')],
  riskScore: ['Score', (r) => (r.riskScore ? `<b>${r.riskScore}</b><span class="faint"> /25</span>` : '<span class="faint">—</span>')],
  riskLevel: ['Level', (r) => (r.riskLevel ? badge(r.riskLevel, { High: 'red', Medium: 'amber', Low: 'green' }[r.riskLevel], true) : '<span class="faint">—</span>')],
  tempAlert: ['Temperature', (r) => (r.tempAlert ? badge(r.tempAlert, 'red', true) : badge('In range', 'green', true))],
  alert: ['Stock alert', (r) => (r.alert ? badge(r.alert, r.alert === 'Reorder' ? 'red' : 'amber', true) : badge('OK', 'green', true))],
  method: ['Buying method', (r) => `<span style="font-size:12.5px">${esc(r.method || '—')}</span>`],
  gapCount: ['Skill gaps', (r) => (r.gapCount ? badge(r.gapCount + ' gap' + (r.gapCount > 1 ? 's' : ''), 'amber', true) : badge('None', 'green', true))],
  nbv: ['Net book value', (r) => (r.nbv != null ? `<span class="nowrap">Birr ${Number(r.nbv).toLocaleString()}</span>` : '—')],
  cost: ['Cost', (r) => (r.cost != null ? `<span class="nowrap">Birr ${Number(r.cost).toLocaleString()}</span>` : '—')],
  amount: ['Amount', (r) => (r.amount != null && r.amount !== '' ? `<span class="nowrap">Birr ${Number(r.amount).toLocaleString()}</span>` : '—')],
  apScore: ['Score', (r) => (r.apScore != null ? `<b>${r.apScore}</b><span class="faint"> /5</span>` : '<span class="faint">—</span>')],
  apGrade: ['Grade', (r) => (r.apGrade ? badge(r.apGrade, r.apGrade[0] <= 'B' ? 'green' : r.apGrade[0] === 'C' ? 'blue' : r.apGrade[0] === 'D' ? 'amber' : 'red', true) : '<span class="faint">—</span>')],
  saScore: ['Safety score', (r) => (r.saScore != null ? badge(r.saScore + ' %', r.saScore >= 90 ? 'green' : r.saScore >= 70 ? 'amber' : 'red', true) : '<span class="faint">—</span>')],
  binBalance: ['Bin balance', (r) => `${Number(r.binBalance || 0).toLocaleString()} kg`],
  inKg: ['Crushed', (r) => `${Number(r.inKg || 0).toLocaleString()} kg`],
  usedKg: ['Re-used', (r) => `${Number(r.usedKg || 0).toLocaleString()} kg`],
  oee: ['OEE', (r) => (r.oee != null ? badge(r.oee + ' %', r.oee >= 85 ? 'green' : r.oee >= 60 ? 'amber' : 'red', true) : '<span class="faint">no logs</span>')],
  mtbf: ['MTBF', (r) => (r.mtbf != null ? `${r.mtbf} h` : '<span class="faint">no failures</span>')],
  mttr: ['MTTR', (r) => (r.mttr != null ? `${r.mttr} h` : '<span class="faint">—</span>')],
  scrapPct: ['Scrap', (r) => (r.scrapPct != null && r.scrapPct !== '' ? badge(r.scrapPct + ' %', Number(r.scrapPct) < 2.5 ? 'green' : 'amber', true) : '—')],
  result: ['Result', (r) => (r.result ? badge(r.result, r.result === 'Pass' ? 'green' : r.result === 'Fail' ? 'red' : 'amber', true) : '<span class="faint">—</span>')],
  retainUntil: ['Retain until', (r) => `<span class="nowrap">${esc(/^\d/.test(r.retainUntil || '') ? fmtDate(r.retainUntil) : r.retainUntil || '—')}</span>`],
  majorNc: ['NCs', (r) => (r.majorNc == null ? '<span class="faint">—</span>' : r.majorNc ? badge(r.majorNc, 'red', true) : badge('0', 'green', true))],
  downtime: ['Downtime', (r) => (r.downtime ? `${r.downtime} h` : '<span class="faint">—</span>')],
};
const colDef = (def, k) => COLS[k] || [def.fields.find((f) => f.k === k)?.l || k, (r) => {
  const f = def.fields.find((x) => x.k === k);
  if (k === 'title' || k === 'customer') return `<span style="font-weight:550">${esc(r[k])}</span>${k === 'title' && r.customer ? `<span class="sub">${esc(r.customer)}</span>` : ''}${k === 'customer' && r.title ? '' : ''}`;
  return f && r[k] != null && r[k] !== '' ? (f.t === 'select' || f.t === 'dept' ? `<span class="nowrap">${esc(r[k])}</span>` : displayValue(f, r[k])) : '<span class="faint">—</span>';
}];

export async function renderModule(view, mod) {
  const def = state.meta.modules[mod];
  const u = ui(mod);
  setCrumbs([sectionOf(mod), def.title]);
  const rows = await api('/m/' + mod);
  current = { mod, rows };
  const counts = Object.fromEntries(def.states.map((s) => [s.key, rows.filter((r) => r.status === s.key).length]));
  const overdue = rows.filter((r) => r.overdue).length;
  const open = rows.filter((r) => !FINAL.includes(r.status)).length;
  const hasDate = def.fields.some((f) => f.k === 'date' || f.k === 'due');

  view.innerHTML = `
  <div class="ph"><div><div class="eyebrow">${esc(def.procedure)} · Forms ${esc(def.form)}</div><h1>${esc(tr(def.title))}</h1><p>${esc(def.desc)}</p></div>
    <div class="actions">${mod === 'pmplans' ? `<button class="btn" id="pmGen">${icon('refresh')}Generate due work orders</button>` : ''}<button class="btn" id="expBtn">${icon('download')}Export</button><button class="btn primary" id="newBtn">${icon('plus')}New ${esc(def.short === 'Records' ? 'file' : def.short)}</button></div></div>
  ${moduleInsights(mod, rows)}
  <div class="card">
    <div class="toolbar" style="border-bottom:0;padding-bottom:4px"><div class="chips" id="stChips">
      <button class="chip ${!u.status ? 'on' : ''}" data-s="">All <span class="n">${rows.length}</span></button>
      <button class="chip ${u.status === '_open' ? 'on' : ''}" data-s="_open">Open <span class="n">${open}</span></button>
      ${overdue ? `<button class="chip ${u.status === '_over' ? 'on' : ''}" data-s="_over" style="${u.status === '_over' ? '' : 'color:var(--bad);border-color:#f3b6bd'}">Overdue <span class="n">${overdue}</span></button>` : ''}
      ${def.states.map((s) => `<button class="chip ${u.status === s.key ? 'on' : ''}" data-s="${s.key}"><i style="width:7px;height:7px;border-radius:50%;background:${toneColor(s.tone)}"></i>${esc(s.label)} <span class="n">${counts[s.key]}</span></button>`).join('')}
    </div></div>
    <div class="toolbar">
      <div class="search">${icon('search')}<input class="input" id="q" placeholder="Search ${esc(def.title.toLowerCase())}…" value="${esc(u.q)}"></div>
      <select class="select" id="dept"><option value="">All departments</option>${state.meta.deptNames.map((d) => `<option ${u.dept === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select>
      <button class="chip ${u.mine ? 'on' : ''}" id="mine">${icon('users', 'sm')}Mine</button>
      <span class="spacer"></span>
      <div class="btn-group" id="views"><button data-v="table" class="${u.view === 'table' ? 'on' : ''}" title="Table">${icon('list', 'sm')}</button><button data-v="board" class="${u.view === 'board' ? 'on' : ''}" title="Board">${icon('grid', 'sm')}</button>${hasDate ? `<button data-v="cal" class="${u.view === 'cal' ? 'on' : ''}" title="Calendar">${icon('calendar', 'sm')}</button>` : ''}</div>
    </div>
    <div id="body"></div>
    <div class="tbl-foot" id="foot"></div>
  </div>`;

  const filtered = () => {
    const q = u.q.toLowerCase();
    let list = rows.filter((r) => (!u.dept || r.department === u.dept) && (!u.mine || [r.owner, r.leader, r.chair, r.createdBy].includes(state.user.id)));
    if (q) list = list.filter((r) => Object.values(r).some((v) => typeof v === 'string' && v.toLowerCase().includes(q)));
    if (u.status === '_open') list = list.filter((r) => !FINAL.includes(r.status));
    else if (u.status === '_over') list = list.filter((r) => r.overdue);
    else if (u.status) list = list.filter((r) => r.status === u.status);
    return sortRows(list, u.sort, u.dir);
  };
  const draw = () => {
    const list = filtered();
    const body = view.querySelector('#body');
    if (u.view === 'board') body.innerHTML = board(def, list);
    else if (u.view === 'cal') body.innerHTML = calendar(def, list);
    else body.innerHTML = table(def, list, u);
    view.querySelector('#foot').innerHTML = `<span>${list.length} of ${rows.length} record${rows.length === 1 ? '' : 's'}</span><div class="r"><span class="faint">Procedure ${esc(def.procedure)}</span></div>`;
  };
  draw();
  view.querySelector('#stChips').onclick = (e) => { const s = e.target.closest('[data-s]'); if (!s) return; u.status = s.dataset.s; view.querySelectorAll('#stChips .chip').forEach((c) => c.classList.toggle('on', c === s)); draw(); };
  view.querySelector('#q').oninput = debounce((e) => { u.q = e.target.value; draw(); }, 120);
  view.querySelector('#dept').onchange = (e) => { u.dept = e.target.value; draw(); };
  view.querySelector('#mine').onclick = (e) => { u.mine = !u.mine; e.currentTarget.classList.toggle('on', u.mine); draw(); };
  view.querySelector('#views').onclick = (e) => { const v = e.target.closest('[data-v]')?.dataset.v; if (!v) return; u.view = v; view.querySelectorAll('#views button').forEach((b) => b.classList.toggle('on', b.dataset.v === v)); draw(); };
  view.querySelector('#body').onclick = (e) => {
    const th = e.target.closest('[data-sort]'); if (th) { u.dir = u.sort === th.dataset.sort ? -u.dir : 1; u.sort = th.dataset.sort; draw(); return; }
    const id = e.target.closest('[data-id]')?.dataset.id; if (id) openRecord(mod, id);
  };
  view.querySelector('#newBtn').onclick = () => createRecord(mod);
  view.querySelector('#pmGen')?.addEventListener('click', async () => { const r = await api('/pm/generate', { body: {} }); toast(r.made ? `${r.made} work order(s) generated` : 'No plans are due'); refreshCounts(); renderModule(view, mod); });
  view.querySelector('#expBtn').onclick = () => download('/api/export/' + mod);
}

function sectionOf(mod) {
  const S = { memos: 'Leadership', recycling: 'Production', fgtransfer: 'Production', pmplans: 'Maintenance & Assets', appraisals: 'Governance & People', ppe: 'Governance & People', safetyaudits: 'Governance & People', records: 'Documentation', correspondence: 'Documentation', production: 'Production', shiftlogs: 'Production', inventory: 'Production', gatepass: 'Production', labtests: 'Quality', inspections: 'Quality', ncr: 'Quality', capa: 'Quality', calibration: 'Quality', risks: 'Quality', maintenance: 'Maintenance & Assets', assets: 'Maintenance & Assets', fixedassets: 'Maintenance & Assets', dispatch: 'Commercial', complaints: 'Commercial', satisfaction: 'Commercial', purchasing: 'Commercial', suppliers: 'Commercial', expenses: 'Commercial', audits: 'Governance & People', reviews: 'Governance & People', training: 'Governance & People', employees: 'Governance & People', hse: 'Governance & People' };
  return S[mod] || 'QMS';
}

function table(def, list, u) {
  if (!list.length) return empty('No records found', 'Adjust the filters or create a new record.', def.icon);
  const cols = def.columns;
  return `<div class="tbl-wrap"><table class="tbl"><thead><tr>${cols.map((k) => `<th class="sortable ${u.sort === k ? 'sorted' : ''}" data-sort="${k}">${esc(colDef(def, k)[0])}<span class="arr">${u.sort === k ? (u.dir > 0 ? '↑' : '↓') : '↕'}</span></th>`).join('')}<th></th></tr></thead>
    <tbody>${list.map((r) => `<tr class="click" data-id="${r.id}">${cols.map((k) => `<td class="${k === 'title' ? 't' : ''}">${colDef(def, k)[1](r, def)}</td>`).join('')}<td class="nowrap faint" style="text-align:right">${r.commentCount ? `${icon('message', 'sm')} ${r.commentCount}` : ''}${r.overdue ? ` <span class="badge red plain">Overdue</span>` : ''}</td></tr>`).join('')}</tbody></table></div>`;
}

function board(def, list) {
  return `<div style="display:grid;grid-auto-flow:column;grid-auto-columns:minmax(250px,1fr);gap:12px;padding:14px;overflow-x:auto;background:var(--surface-2)">${def.states.map((s) => {
    const items = list.filter((r) => r.status === s.key);
    return `<div style="min-width:0"><div class="split" style="margin:0 2px 8px;font-weight:600;font-size:12.5px"><i style="width:8px;height:8px;border-radius:50%;background:${toneColor(s.tone)}"></i>${esc(s.label)}<span class="faint">${items.length}</span></div>
      <div style="display:flex;flex-direction:column;gap:8px">${items.map((r) => `<div class="card" data-id="${r.id}" style="padding:11px 12px;cursor:pointer;border-radius:10px${r.overdue ? ';border-left:3px solid var(--bad)' : ''}">
        <div class="split" style="justify-content:space-between;margin-bottom:5px"><span class="mono faint">${esc(r.code || r.fileCode)}</span>${r.owner || r.leader || r.chair ? avatar(r.owner || r.leader || r.chair, 'sm') : ''}</div>
        <div style="font-weight:550;line-height:1.35">${esc(r.title || r.customer)}</div>
        <div class="split" style="margin-top:8px;font-size:12px;color:var(--muted);flex-wrap:wrap">${r.department ? `<span class="tag">${esc(r.department)}</span>` : ''}${dueCell(r)}${r.score != null ? scoreBadge(r.score) : ''}</div></div>`).join('') || '<div class="faint" style="font-size:12px;padding:10px;border:1px dashed var(--line-2);border-radius:10px;text-align:center">Empty</div>'}</div></div>`;
  }).join('')}</div>`;
}

function calendar(def, list) {
  const key = def.fields.some((f) => f.k === 'date') ? 'date' : 'due';
  const year = new Date().getFullYear();
  const cur = new Date().getMonth();
  const months = Array.from({ length: 12 }, (_, i) => i);
  const yearRows = list.filter((r) => (r[key] || '').startsWith(String(year)));
  const other = list.length - yearRows.length;
  return `<div style="padding:14px">
    ${def === state.meta.modules.audits ? `<div class="callout" style="margin-bottom:12px">${icon('info', 'sm')} <b>Annual Internal Quality Audit Programme ${year} (OF/WF/014).</b> OP/WF/003 requires every QMS element to be audited at least once a year. Departments with no audit this year: <b>${state.meta.deptNames.filter((d) => !yearRows.some((r) => r.department === d)).join(', ') || 'none ✓'}</b>.</div>` : ''}
    <div class="cal">${months.map((m) => `<div class="cal-m ${m === cur ? 'now' : ''}"><h5>${new Date(year, m, 1).toLocaleString(undefined, { month: 'short' })}</h5>${yearRows.filter((r) => +r[key].slice(5, 7) - 1 === m).map((r) => { const s = stateOf(def, r.status); return `<div class="cal-ev tone-${r.overdue ? 'red' : s.tone === 'gray' ? 'gray' : s.tone}" data-id="${r.id}" title="${esc(r.title)}">${+r[key].slice(8, 10)} · ${esc((r.title || r.customer).replace(/^IQA \d+\/\d+ – /, ''))}</div>`; }).join('')}</div>`).join('')}</div>
    ${other ? `<p class="muted" style="margin:10px 0 0;font-size:12.5px">${other} record(s) dated outside ${year} – switch to table view to see them.</p>` : ''}</div>`;
}

// ---------- insights strip per module ----------
function moduleInsights(mod, rows) {
  const card = (l, v, t, sub = '') => `<div class="card kpi" style="cursor:default"><div class="kpi-top">${esc(l)}</div><div class="kpi-v" style="font-size:24px;${t ? `color:var(--${t})` : ''}">${v}</div>${sub ? `<div class="kpi-f">${sub}</div>` : ''}</div>`;
  const open = rows.filter((r) => !FINAL.includes(r.status));
  const over = rows.filter((r) => r.overdue).length;
  const year = String(new Date().getFullYear());
  let cards = [];
  if (mod === 'ncr') {
    const by = (k) => Object.entries(rows.reduce((a, r) => (r[k] && (a[r[k]] = (a[r[k]] || 0) + 1), a), {})).sort((a, b) => b[1] - a[1])[0];
    const top = by('product'), disp = by('disposition');
    cards = [card('Open NCRs', open.length, open.length ? 'warn' : 'ok'), card(`Raised in ${year}`, rows.filter((r) => r.created.startsWith(year)).length), card('Most affected product', `<span style="font-size:16px">${esc(top?.[0] || '—')}</span>`, '', top ? `${top[1]} NCRs` : ''), card('Most common disposition', `<span style="font-size:16px">${esc(disp?.[0] || '—')}</span>`, '', disp ? `${disp[1]} times` : '')];
  } else if (mod === 'capa') {
    const closed = rows.filter((r) => r.status === 'closed').length;
    cards = [card('Open actions', open.length), card('Overdue', over, over ? 'bad' : 'ok'), card('Closed', closed, 'ok'), card('Preventive share', Math.round((rows.filter((r) => /Preventive/.test(r.type || '')).length / Math.max(1, rows.length)) * 100) + '%', '', 'ISO 9001 encourages prevention')];
  } else if (mod === 'calibration') {
    const t = new Date().toISOString().slice(0, 10), soon = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
    const act = rows.filter((r) => r.status !== 'retired');
    const od = act.filter((r) => r.due && r.due < t).length;
    cards = [card('Instruments in register', act.length), card('Overdue', od, od ? 'bad' : 'ok', 'Must not be used for acceptance'), card('Due in 30 days', act.filter((r) => r.due >= t && r.due <= soon).length, 'warn'), card('Compliance', Math.round(((act.length - od) / Math.max(1, act.length)) * 100) + '%', od ? 'warn' : 'ok')];
  } else if (mod === 'maintenance') {
    const dt = rows.reduce((a, r) => a + (Number(r.downtime) || 0), 0);
    const pm = rows.filter((r) => r.kind === 'Preventive').length;
    cards = [card('Open work orders', open.length), card('Breakdowns', rows.filter((r) => r.kind === 'Breakdown').length, 'bad'), card('Preventive share', Math.round((pm / Math.max(1, rows.length)) * 100) + '%', '', 'Target: majority preventive'), card('Total downtime', dt + ' h')];
  } else if (mod === 'suppliers') {
    const sc = rows.filter((r) => r.score != null);
    cards = [card('Suppliers', rows.length), card('Approved', rows.filter((r) => r.status === 'approved').length, 'ok'), card('Average score', Math.round(sc.reduce((a, r) => a + r.score, 0) / Math.max(1, sc.length)) + '%'), card('Suspended', rows.filter((r) => r.status === 'suspended').length, 'bad')];
  } else if (mod === 'satisfaction') {
    const sc = rows.filter((r) => r.score != null);
    const avgS = Math.round(sc.reduce((a, r) => a + r.score, 0) / Math.max(1, sc.length));
    cards = [card('Responses', rows.length), card('Overall satisfaction', avgS + '%', avgS >= 75 ? 'ok' : 'warn'), card('Would recommend', Math.round((rows.filter((r) => r.recommend === 'Yes').length / Math.max(1, rows.length)) * 100) + '%', 'ok'), card('Lowest aspect', '<span style="font-size:16px">Product price</span>', '', 'See Reports for breakdown')];
  } else if (mod === 'inspections') {
    const done = rows.filter((r) => r.result);
    cards = [card('Inspections', rows.length), card('First-pass yield', Math.round((done.filter((r) => r.result === 'Pass').length / Math.max(1, done.length)) * 100) + '%', 'ok'), card('Rejected batches', rows.filter((r) => r.status === 'rejected').length, 'bad'), card('Awaiting test / review', rows.filter((r) => ['planned', 'testing', 'review'].includes(r.status)).length, 'warn')];
  } else if (mod === 'audits') {
    const y = rows.filter((r) => (r.date || '').startsWith(year));
    cards = [card(`Audits ${year}`, y.length), card('Departments covered', `${new Set(y.map((r) => r.department)).size}/${state.meta.deptNames.length}`), card('Nonconformities raised', y.reduce((a, r) => a + (r.majorNc || 0), 0), 'warn'), card('Late audits', rows.filter((r) => r.overdue).length, rows.some((r) => r.overdue) ? 'bad' : 'ok')];
  } else if (mod === 'reviews') {
    const mr = rows.filter((r) => r.type === 'Management Review' && (r.date || '').startsWith(year));
    cards = [card(`Management reviews ${year}`, `${mr.length}<span class="muted" style="font-size:14px"> / 2 required</span>`, mr.length >= 2 ? 'ok' : 'warn', 'OP/WF/006: at least twice a year'), card('Meetings logged', rows.length), card('Minutes pending', rows.filter((r) => r.status === 'held').length, 'warn', 'Due within 5 working days'), card('Actions in progress', rows.filter((r) => r.status === 'actions').length)];
  } else if (mod === 'training') {
    const sc = rows.filter((r) => r.traineeScore);
    cards = [card('Trainings', rows.length), card('Participants trained', rows.reduce((a, r) => a + (Number(r.participants) || 0), 0)), card('Avg. trainee rating', sc.length ? (sc.reduce((a, r) => a + r.traineeScore, 0) / sc.length).toFixed(1) + ' / 5' : '—'), card('Effectiveness checks due', rows.filter((r) => r.status === 'evaluated').length, 'warn', 'Supervisor, 3–6 months after')];
  } else if (mod === 'complaints') {
    cards = [card('Open complaints', open.length, open.length ? 'warn' : 'ok'), card(`Received ${year}`, rows.filter((r) => r.created.startsWith(year)).length), card('Product-related', rows.filter((r) => r.category === 'Non-conforming product').length), card('Delivery-related', rows.filter((r) => r.category === 'Delivery').length)];
  } else if (mod === 'records') {
    cards = [card('Files registered', rows.length), card('Active', rows.filter((r) => r.status === 'active').length, 'ok'), card('Disposal requests', rows.filter((r) => r.status === 'disposal').length, 'warn', 'MR approval on OF/WF/013'), card('Legal hold', rows.filter((r) => /Yes/.test(r.legalHold || '')).length, 'bad')];
  }
  if (!cards.length) cards = extraInsights(mod, rows, card, open, year);
  return cards.length ? `<div class="grid g4" style="margin-bottom:16px">${cards.join('')}</div>` : '';
}

// ---------- create ----------
export function createRecord(mod, prefill = {}, linkFrom) {
  const def = state.meta.modules[mod];
  const m = modal({ title: `New ${def.title.replace(/s$/, '')}`, sub: `${def.procedure} · ${def.form}${linkFrom ? ` · linked to ${linkFrom.code}` : ''}`, wide: true,
    body: formHTML(def.fields.filter((f) => !['verification', 'effectiveness', 'resolution', 'conclusion', 'minutes'].includes(f.k)), prefill, { isNew: true }),
    foot: `<button class="btn" data-close>Cancel</button><button class="btn primary" id="cSave">${icon('check')}Create</button>` });
  bindChecklists(m.el);
  m.el.querySelector('#cSave').onclick = async () => {
    const data = readForm(def.fields, m.el);
    const r = await api('/m/' + mod, { body: { ...data, linkFrom } });
    if (r.offline) { m.close(); return; }
    m.close(); toast(`${def.short} ${r.code} created`); refreshCounts();
    if (location.hash.startsWith('#/m/' + mod)) { const { route } = await import('../app.js'); await route(); openRecord(mod, r.id); }
    else location.hash = `#/m/${mod}/${r.id}`;
  };
}

// ---------- record drawer ----------
export async function openRecord(mod, id, tab = 'details') {
  const def = state.meta.modules[mod];
  const [r, h] = await Promise.all([api(`/m/${mod}/${id}`), api(`/m/${mod}/${id}/history`)]);
  document.querySelector('.drawer')?.previousElementSibling?.remove(); document.querySelector('.drawer')?.remove();
  const trans = def.flow.filter((t) => t.from === r.status && t.roles.includes(state.user.role));
  const others = def.flow.filter((t) => t.from === r.status && !t.roles.includes(state.user.role));
  const title = r.title || r.customer;
  const main = def.states.filter((s) => !SIDE.includes(s.key));
  const onMain = main.some((s) => s.key === r.status);
  const d = drawer(`
    <div class="drawer-h"><div class="row1"><span class="code">${esc(r.code || r.fileCode)}</span>${statusBadge(def, r.status)}${r.overdue ? badge(`${-r.dueIn}d overdue`, 'red', true) : ''}<span class="spacer"></span><button class="iconbtn" data-close title="Close (Esc)">${icon('x')}</button></div>
      <h2>${esc(title)}</h2><div class="split muted" style="margin-top:6px;font-size:12.5px;flex-wrap:wrap">${icon(def.icon, 'sm')}${esc(def.title)} · ${esc(r.department || '')} · Raised ${esc(fmtDate(r.created))} by ${esc(user(r.createdBy)?.name || '')}</div>
      <div style="margin-top:14px">${onMain ? stepper(main, r.status) : `<div class="callout ${['quarantine', 'suspended', 'rejected'].includes(r.status) ? 'bad' : 'warn'}">${esc(stateOf(def, r.status).label)}</div>`}</div></div>
    <div class="tabs" id="rtabs">${[['details', 'Details'], ['activity', 'Activity', h.history.length], ['comments', 'Comments', h.comments.length], ['files', 'Attachments', r.attachments.length], ['links', 'Linked records', r.linked.length]].map(([k, l, n]) => `<button data-t="${k}" class="${k === tab ? 'on' : ''}">${l}${n !== undefined ? ` <span class="n">${n}</span>` : ''}</button>`).join('')}</div>
    <div class="drawer-b"><div class="pane" id="rpane"></div></div>
    <div class="drawer-f">${trans.map((t) => `<button class="btn ${t.tone === 'danger' ? 'danger' : 'primary'}" data-to="${t.to}">${esc(t.label)}</button>`).join('')}
      ${!trans.length && others.length && !FINAL.includes(r.status) ? `<span class="muted split" style="font-size:12.5px">${icon('lock', 'sm')}Next step “${esc(others[0].label)}” needs: ${esc(others[0].roles.map((x) => state.meta.roles[x]).join(', '))}</span>` : ''}
      <span class="spacer"></span>${mod === 'labtests' && r.status === 'closed' && r.result === 'Pass' ? `<a class="btn" target="_blank" href="/api/coa/${r.id}?u=${state.user.id}">${icon('printer', 'sm')}Certificate of Analysis</a>` : ''}${(def.raises || []).map((m2) => `<button class="btn" data-raise="${m2}">${icon('link', 'sm')}Raise ${esc(state.meta.modules[m2].short)}</button>`).join('')}</div>`);

  const pane = d.el.querySelector('#rpane');
  const show = (t) => {
    d.el.querySelectorAll('#rtabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === t));
    if (t === 'details') details(false);
    else if (t === 'activity') pane.innerHTML = timeline(h.history);
    else if (t === 'comments') {
      pane.innerHTML = commentsHTML(h.comments);
      pane.querySelector('#cmtBtn').onclick = async () => { const text = pane.querySelector('#cmtIn').value.trim(); if (!text) return; h.comments = await api(`/m/${mod}/${id}/comments`, { body: { text } }); show('comments'); d.el.querySelector('#rtabs [data-t=comments] .n').textContent = h.comments.length; };
    } else if (t === 'files') {
      pane.innerHTML = `${r.attachments.map((a, i) => `<div class="file">${extBadge(a.ext)}<div class="grow"><b>${esc(a.name)}</b><small>${fmtSize(a.size)} · ${esc(user(a.by)?.name || '')} · ${ago(a.at)}</small></div><button class="btn sm" data-att="${i}">${icon('download', 'sm')}</button></div>`).join('')}${dropzone('rdz', 'Attach evidence – photos, test reports, certificates')}`;
      bindDrop(pane.querySelector('#rdz'), async (file) => { r.attachments = await upload(`/m/${mod}/${id}/attachments`, file); toast('Attachment added'); d.el.querySelector('#rtabs [data-t=files] .n').textContent = r.attachments.length; show('files'); });
      pane.querySelectorAll('[data-att]').forEach((b) => (b.onclick = () => download(`/api/m/${mod}/${id}/attachments/${b.dataset.att}`)));
    } else if (t === 'links') {
      pane.innerHTML = r.linked.length ? `<div class="list" style="border:1px solid var(--line);border-radius:10px">${r.linked.map((l) => { const ld = state.meta.modules[l.mod]; return `<div class="li click" data-go="${l.mod}|${l.id}"><span class="kpi-ico tone-violet">${icon(ld.icon, 'sm')}</span><div class="grow"><b>${esc(l.title)}</b><small><span class="mono">${esc(l.code)}</span> · ${esc(ld.title)}</small></div>${statusBadge(ld, l.status)}</div>`; }).join('')}</div>` : empty('No linked records', def.raises ? `Use “Raise ${def.raises.map((x) => state.meta.modules[x].short).join(' / ')}” to create a traceable follow-up.` : '', 'link');
      pane.querySelectorAll('[data-go]').forEach((el) => (el.onclick = () => { const [m2, i2] = el.dataset.go.split('|'); d.close(); window.wfGo(m2, i2); }));
    }
  };
  const details = (edit) => {
    const fields = def.fields;
    if (!edit) {
      const extra = r.score != null ? `<div class="callout ok" style="margin-bottom:16px;display:flex;align-items:center;gap:10px">${icon('star', 'sm')}<b>Overall score: ${r.score}%</b><span class="muted">${mod === 'suppliers' ? 'average of 7 OP/WF/027 criteria (1–5)' : 'average of 7 survey aspects (Poor–Very good)'}</span></div>` : '';
      pane.innerHTML = `${extra}<div class="split" style="justify-content:space-between;margin-bottom:12px"><div class="section-t" style="margin:0">Record details</div><button class="btn sm" id="editBtn">${icon('edit', 'sm')}Edit</button></div>
        <div class="dl">${fields.map((f) => `<div class="${f.full || f.t === 'textarea' || f.t === 'checklist' ? 'full' : ''}"><span>${esc(f.l)}</span><b>${displayValue(f, r[f.k])}</b></div>`).join('')}</div>`;
      pane.querySelector('#editBtn').onclick = () => details(true);
    } else {
      pane.innerHTML = `${formHTML(fields, r)}<div class="split" style="margin-top:16px;justify-content:flex-end"><button class="btn" id="cancelEd">Cancel</button><button class="btn primary" id="saveEd">${icon('check')}Save changes</button></div>`;
      bindChecklists(pane);
      pane.querySelector('#cancelEd').onclick = () => details(false);
      pane.querySelector('#saveEd').onclick = async () => { Object.assign(r, await api(`/m/${mod}/${id}`, { method: 'PATCH', body: readForm(fields, pane) })); toast('Saved'); openRecord(mod, id, 'details'); };
    }
  };
  show(tab);
  d.el.querySelector('#rtabs').onclick = (e) => { const t = e.target.closest('[data-t]')?.dataset.t; if (t) show(t); };
  d.el.querySelectorAll('[data-to]').forEach((b) => (b.onclick = async () => {
    const t = trans.find((x) => x.to === b.dataset.to);
    const missing = (t.requires || []).filter((k) => r[k] === undefined || r[k] === null || r[k] === '' || (Array.isArray(r[k]) && !r[k].length));
    if (missing.length) { toast('Complete first: ' + missing.map((k) => def.fields.find((f) => f.k === k).l).join(', '), true); show('details'); details(true); setTimeout(() => pane.querySelector('#f_' + missing[0])?.focus(), 50); return; }
    const c = await confirmBox({ title: t.label, sub: `${r.code || r.fileCode} · ${title}`, label: t.label, danger: t.tone === 'danger', needNote: t.tone === 'danger' ? true : false, notePlaceholder: 'Add a note for the audit trail…', needPassword: !!t.sign });
    if (!c.ok) return;
    await api(`/m/${mod}/${id}/transition`, { body: { to: t.to, note: c.note, password: c.password } });
    toast(`${t.label} ✓`); refreshCounts(); d.close();
    if (location.hash.startsWith('#/m/' + mod)) { const v = document.getElementById('view'); await renderModule(v, mod); }
    openRecord(mod, id, 'details');
  }));
  d.el.querySelectorAll('[data-raise]').forEach((b) => (b.onclick = () => {
    const m2 = b.dataset.raise;
    const pre = { title: title, department: r.department, owner: r.owner };
    if (m2 === 'capa') Object.assign(pre, { source: { ncr: 'Product nonconformity', complaints: 'Customer complaint / feedback', audits: 'Internal audit', reviews: 'Management review', satisfaction: 'Customer complaint / feedback' }[mod], type: 'Corrective (NC)', title: 'Eliminate cause: ' + title });
    if (m2 === 'ncr') Object.assign(pre, { product: r.product, batch: r.title, stage: mod === 'complaints' ? 'After delivery (customer)' : mod === 'inspections' ? 'Final inspection' : '' });
    d.close(); createRecord(m2, pre, { mod, id, code: r.code });
  }));
}

function extraInsights(mod, rows, card, open, year) {
  const sum = (k, f = (r) => true) => rows.filter(f).reduce((a, r) => a + (Number(r[k]) || 0), 0);
  const fmtB = (v) => 'Birr ' + Math.round(v).toLocaleString();
  const pct = (a, b) => (b ? Math.round((a / b) * 100) + '%' : '—');
  switch (mod) {
    case 'production': return [card('Orders in progress', rows.filter((r) => ['approved', 'running', 'qc'].includes(r.status)).length), card('On QUALITY HOLD', rows.filter((r) => r.status === 'hold').length, rows.some((r) => r.status === 'hold') ? 'bad' : 'ok', 'Cannot be dispatched'), card('Metres planned', sum('meters').toLocaleString() + ' m'), card('Late orders', rows.filter((r) => r.overdue).length, 'bad')];
    case 'shiftlogs': { const sc = rows.filter((r) => r.scrapPct !== '' && r.scrapPct != null); return [card('Shifts logged', rows.length), card('Temperature alerts', rows.filter((r) => r.tempAlert).length, 'bad', 'Zones outside 170–210 °C'), card('Average scrap', sc.length ? (sc.reduce((a, r) => a + Number(r.scrapPct), 0) / sc.length).toFixed(1) + ' %' : '—', 'ok', 'Target < 2.5 %'), card('Output logged', sum('output').toLocaleString() + ' m')]; }
    case 'labtests': { const d = rows.filter((r) => r.result); return [card('Tests recorded', rows.length), card('Pass rate', pct(d.filter((r) => r.result === 'Pass').length, d.length), 'ok'), card('Failed tests', d.filter((r) => r.result === 'Fail').length, 'bad', 'Batch on hold + NCR raised'), card('CoA released', rows.filter((r) => r.status === 'closed').length, 'ok')]; }
    case 'risks': return [card('Open risks', rows.filter((r) => r.kind === 'Risk' && r.status !== 'closed').length), card('High level (≥15)', rows.filter((r) => r.riskLevel === 'High' && r.status !== 'closed').length, 'bad'), card('Opportunities', rows.filter((r) => r.kind === 'Opportunity').length, 'ok'), card('Untreated', rows.filter((r) => ['identified', 'assessed'].includes(r.status)).length, 'warn')];
    case 'assets': { const m = rows.filter((r) => r.mtbf != null); return [card('Machines', rows.filter((r) => r.status !== 'retired').length), card('Under maintenance', rows.filter((r) => r.status === 'maintenance').length, 'warn'), card('Avg MTBF', m.length ? Math.round(m.reduce((a, r) => a + r.mtbf, 0) / m.length) + ' h' : '—', '', 'Mean time between failures'), card('Total breakdowns', rows.reduce((a, r) => a + (r.failures || 0), 0), 'bad')]; }
    case 'inventory': return [card('Items', rows.filter((r) => r.status !== 'closed').length), card('Reorder alerts', rows.filter((r) => r.alert === 'Reorder').length, 'bad', 'At or below minimum'), card('On quality hold', rows.filter((r) => r.status === 'hold').length, 'bad', 'Cannot be issued'), card('Over maximum', rows.filter((r) => r.alert === 'Over max').length, 'warn')];
    case 'gatepass': return [card('Open passes', open.length), card('Inbound today', rows.filter((r) => r.direction === 'Inbound' && (r.created || '').startsWith(new Date().toISOString().slice(0, 10))).length), card('Outbound today', rows.filter((r) => r.direction === 'Outbound' && (r.created || '').startsWith(new Date().toISOString().slice(0, 10))).length), card('Awaiting authorisation', rows.filter((r) => r.status === 'requested').length, 'warn')];
    case 'dispatch': { const d = rows.filter((r) => r.onTime); return [card('Open orders', open.length), card('On-time delivery', pct(d.filter((r) => r.onTime === 'Yes').length, d.length), 'ok', 'Target > 95 %'), card('Pipeline value', fmtB(sum('amount', (r) => r.status !== 'closed'))), card('Delivered', rows.filter((r) => r.status === 'closed').length, 'ok')]; }
    case 'purchasing': return [card('Open requests', open.length), card('Open value', fmtB(sum('amount', (r) => r.status !== 'closed'))), card('Need bids / committee', rows.filter((r) => r.status !== 'closed' && r.amount > 5000).length, 'warn'), card('Received', rows.filter((r) => r.status === 'closed').length, 'ok')];
    case 'correspondence': return [card('Letters', rows.length), card('Incoming', rows.filter((r) => r.direction === 'Incoming').length), card('Outgoing', rows.filter((r) => r.direction === 'Outgoing').length), card('Unassigned', rows.filter((r) => r.status === 'registered').length, 'warn')];
    case 'employees': return [card('Employees', rows.filter((r) => r.status !== 'closed').length), card('On probation', rows.filter((r) => r.status === 'probation').length, 'warn'), card('With skill gaps', rows.filter((r) => r.gapCount).length, 'bad', 'Below required level'), card('Total gaps', rows.reduce((a, r) => a + (r.gapCount || 0), 0), 'warn', 'Candidates for training')];
    case 'hse': return [card('Open incidents', open.length, open.length ? 'warn' : 'ok'), card('Accidents / injuries', rows.filter((r) => /Accident/.test(r.type)).length, 'bad'), card('Near misses', rows.filter((r) => r.type === 'Near miss').length), card('Serious or fatal', rows.filter((r) => ['Serious', 'Fatal'].includes(r.severity)).length, 'bad')];
    case 'fixedassets': return [card('Assets', rows.filter((r) => r.status !== 'closed').length), card('Total cost', fmtB(sum('cost'))), card('Net book value', fmtB(sum('nbv')), 'ok'), card('Accumulated depreciation', fmtB(sum('cost') - sum('nbv')))];
    case 'expenses': return [card('Awaiting approval', rows.filter((r) => r.status === 'requested').length, 'warn'), card('Pending value', fmtB(sum('amount', (r) => r.status !== 'closed'))), card('Above Birr 10,000 (GM)', rows.filter((r) => r.amount > 10000 && r.status !== 'closed').length, 'bad'), card('Paid', fmtB(sum('amount', (r) => r.status === 'closed')), 'ok')];
    case 'memos': return [card('Memos', rows.length), card('Issued', rows.filter((r) => r.status === 'closed').length, 'ok'), card('Awaiting approval', rows.filter((r) => r.status === 'draft').length, 'warn'), card('This month', rows.filter((r) => (r.date || '').startsWith(new Date().toISOString().slice(0, 7))).length)];
    case 'recycling': return [card('Crusher runs', rows.length), card('Crushed total', sum('inKg').toLocaleString() + ' kg'), card('Re-used', sum('usedKg').toLocaleString() + ' kg', 'ok'), card('In regrind bins', (sum('inKg') - sum('usedKg')).toLocaleString() + ' kg', 'warn')];
    case 'fgtransfer': return [card('Transfer notes', rows.length), card('Awaiting production signature', rows.filter((r) => r.status === 'drafted').length, 'warn'), card('Awaiting store co-signature', rows.filter((r) => r.status === 'supervisor').length, 'warn'), card('Completed', rows.filter((r) => r.status === 'closed').length, 'ok')];
    case 'appraisals': { const s = rows.filter((r) => r.apScore != null); return [card('Appraisals', rows.length), card('Average score', s.length ? (s.reduce((a, r) => a + r.apScore, 0) / s.length).toFixed(2) + ' / 5' : '—'), card('Grade A–B', s.filter((r) => r.apScore >= 4).length, 'ok'), card('Below standard (E)', s.filter((r) => r.apScore < 3).length, 'bad', 'Training / warning per OP/WF/012')]; }
    case 'ppe': return [card('Items issued', sum('qty') || rows.length), card('In use', rows.filter((r) => r.status === 'issued').length, 'ok'), card('Replacement overdue', rows.filter((r) => r.status === 'issued' && r.due && r.due < new Date().toISOString().slice(0, 10)).length, 'bad'), card('Staff covered', new Set(rows.map((r) => r.title)).size)];
    case 'safetyaudits': { const s = rows.filter((r) => r.saScore != null); return [card('Audits', rows.length), card('Average score', s.length ? Math.round(s.reduce((a, r) => a + r.saScore, 0) / s.length) + ' %' : '—', 'ok'), card('Planned', rows.filter((r) => r.status === 'planned').length, 'warn'), card('Below 70 %', s.filter((r) => r.saScore < 70).length, 'bad')]; }
    case 'pmplans': return [card('Active plans', rows.filter((r) => r.status === 'active').length), card('Due now', rows.filter((r) => r.status === 'active' && r.due && r.due <= new Date().toISOString().slice(0, 10)).length, 'bad', 'Press “Generate due work orders”'), card('Daily / weekly', rows.filter((r) => ['Daily', 'Weekly'].includes(r.frequency)).length), card('Monthly / quarterly', rows.filter((r) => ['Monthly', 'Quarterly'].includes(r.frequency)).length)];
    default: return [];
  }
}
