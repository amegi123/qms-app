import { state, api, icon, esc, fmtDate, badge, avatar, ago, user, toast, confirmBox, monthLabel } from '../core.js';
import { area, bars, donut, legend, gauge, hbars, toneColor, PALETTE } from '../charts.js';
import { setCrumbs, refreshCounts, route, themeSeg, bindThemeSeg } from '../app.js';
import { download } from './documents.js';

export async function renderReports(view) {
  setCrumbs(['Organization', 'Reports & Analytics']);
  const [d, sup, sat, ncr, maint] = await Promise.all([api('/dashboard'), api('/m/suppliers'), api('/m/satisfaction'), api('/m/ncr'), api('/m/maintenance')]);
  const k = d.kpi, months = d.months.map(monthLabel);
  const seg = Object.entries(sat.reduce((a, r) => { (a[r.segment] = a[r.segment] || []).push(r.score); return a; }, {})).map(([label, arr]) => ({ label, n: Math.round(arr.reduce((x, y) => x + y, 0) / arr.length) }));
  const dtByMachine = Object.entries(maint.reduce((a, r) => (a[r.machine] = (a[r.machine] || 0) + (Number(r.downtime) || 0), a), {})).map(([label, n]) => ({ label: label.split(' – ')[0], n })).sort((a, b) => b.n - a.n);
  const ncrStage = Object.entries(ncr.reduce((a, r) => (a[r.stage || 'Unknown'] = (a[r.stage || 'Unknown'] || 0) + 1, a), {})).map(([label, n], i) => ({ label, n, color: PALETTE[i] }));
  const exports = ['documents', 'ncr', 'capa', 'complaints', 'audits', 'calibration', 'maintenance', 'suppliers', 'training', 'satisfaction', 'inspections', 'records', 'reviews'];

  view.innerHTML = `
  <div class="ph"><div><div class="eyebrow">ISO 9001 · 9.1 Monitoring, measurement, analysis & evaluation</div><h1>Reports & Analytics</h1><p>Management review inputs (OP/WF/006) generated live from QMS data.</p></div>
    <div class="actions"><button class="btn" onclick="window.print()">${icon('printer')}Print / PDF</button></div></div>
  <div class="print-only" style="margin-bottom:16px"><h2>${esc(state.meta.org.name)} – Management Review Input Report</h2><p>Generated ${new Date().toLocaleString()} by ${esc(state.user.name)}</p></div>

  <div class="grid g4" style="margin-bottom:16px">
    <div class="card" style="text-align:center;padding:14px">${gauge(k.satisfaction, { label: 'Customer satisfaction' })}</div>
    <div class="card" style="text-align:center;padding:14px">${gauge(k.firstPass, { label: 'First-pass yield' })}</div>
    <div class="card" style="text-align:center;padding:14px">${gauge(k.capaOnTime, { label: 'CAPA closed on time' })}</div>
    <div class="card" style="text-align:center;padding:14px">${gauge(k.supplierScore, { label: 'Supplier performance' })}</div>
  </div>
  <div class="grid g2" style="margin-bottom:16px">
    <div class="card"><div class="card-h"><h3>Nonconformities per month</h3><span class="sub">OP/WF/005</span></div><div class="card-b">${area(d.trends.ncr, months, { color: '#f59e0b' })}</div></div>
    <div class="card"><div class="card-h"><h3>Customer complaints per month</h3><span class="sub">OP/WF/031</span></div><div class="card-b">${area(d.trends.complaints, months, { color: '#e11d48' })}</div></div>
  </div>
  <div class="grid g3" style="margin-bottom:16px">
    <div class="card"><div class="card-h"><h3>NCRs by product</h3></div><div class="card-b">${hbars(d.ncrByProduct, { color: '#f59e0b' })}</div></div>
    <div class="card"><div class="card-h"><h3>Where NCs are detected</h3></div><div class="card-b" style="display:flex;gap:14px;align-items:center">${donut(ncrStage, { size: 130, thick: 18, sub: 'NCRs' })}<div style="flex:1">${legend(ncrStage)}</div></div></div>
    <div class="card"><div class="card-h"><h3>Complaints by type</h3></div><div class="card-b">${hbars(d.complaintsByCat, { color: '#e11d48' })}</div></div>
  </div>
  <div class="grid g3" style="margin-bottom:16px">
    <div class="card"><div class="card-h"><h3>Satisfaction by customer segment</h3></div><div class="card-b">${hbars(seg, { max: 100, suffix: '%', color: '#0e9488' })}</div></div>
    <div class="card"><div class="card-h"><h3>Supplier ranking</h3><span class="sub">7 criteria</span></div><div class="card-b">${hbars(sup.filter((s) => s.score != null).sort((a, b) => b.score - a.score).map((s) => ({ label: s.title, n: s.score, color: s.status === 'suspended' ? '#e11d48' : s.score >= 75 ? '#16a34a' : '#0a5bd3' })), { max: 100, suffix: '%' })}</div></div>
    <div class="card"><div class="card-h"><h3>Downtime by machine (h)</h3><span class="sub">OP/WF/038–039</span></div><div class="card-b">${hbars(dtByMachine, { color: '#7c3aed' })}</div></div>
  </div>
  <div class="card" style="margin-bottom:16px"><div class="card-h"><h3>Management review input checklist</h3><span class="sub">ISO 9001 9.3.2 – status from live data</span></div>
    <table class="tbl"><thead><tr><th>Input</th><th>Current status</th><th>Source</th></tr></thead><tbody>
      ${[['Status of actions from previous reviews', `${d.capaStatus.filter((s) => s.key !== 'closed').reduce((a, s) => a + s.n, 0)} CAPAs open`, 'm/capa'],
        ['Customer satisfaction & feedback', `${k.satisfaction}% satisfaction · ${k.complaintsOpen} open complaints`, 'm/satisfaction'],
        ['Process performance & product conformity', `${k.firstPass}% first-pass yield · ${k.ncrOpen} open NCRs`, 'm/inspections'],
        ['Nonconformities & corrective actions', `${k.capaOpen} open · ${k.capaOverdue} overdue`, 'm/capa'],
        ['Monitoring & measuring resources', `${k.calOverdue} instruments overdue calibration`, 'm/calibration'],
        ['Audit results', `${k.auditCoverage}% department coverage this year`, 'm/audits'],
        ['Performance of external providers', `${k.supplierScore}% average supplier score`, 'm/suppliers'],
        ['Adequacy of resources', `${k.downtime} h machine downtime in 30 days · ${k.trainingOpen} trainings open`, 'm/maintenance'],
        ['Documented information', `${k.docsReviewOverdue} documents past review cycle · ${k.docsPending} changes in progress`, 'documents'],
      ].map(([a, b, c]) => `<tr><td><b>${a}</b></td><td>${b}</td><td><a href="#/${c}">${icon('arrowR', 'sm')}</a></td></tr>`).join('')}</tbody></table></div>
  <div class="card"><div class="card-h"><h3>Data exports</h3><span class="sub">CSV (Excel-ready, UTF-8)</span></div><div class="card-b chips">${exports.map((m) => `<button class="chip" data-exp="${m}">${icon('download', 'sm')}${esc(m === 'documents' ? 'Master list of documents' : state.meta.modules[m].title)}</button>`).join('')}</div></div>`;
  view.querySelectorAll('[data-exp]').forEach((b) => (b.onclick = () => download('/api/export/' + b.dataset.exp)));
}

export async function renderAdmin(view) {
  setCrumbs(['Organization', 'Users & Settings']);
  const m = state.meta;
  const activity = await api('/activity');
  const isAdmin = ['mr', 'gm'].includes(state.user.role);
  const perms = Object.entries(m.modules).map(([k, def]) => ({ k, def, roles: Object.keys(m.roles).map((r) => def.flow.some((f) => f.roles.includes(r))) }));
  view.innerHTML = `
  <div class="ph"><div><h1>Users & Settings</h1><p>People, roles and workflow permissions. Demo users — in production these come from company accounts.</p></div></div>
  <div class="grid g-main" style="margin-bottom:16px">
    <div class="card"><div class="card-h"><h3>Users</h3><span class="sub">${m.users.length} people</span></div><table class="tbl"><thead><tr><th>Name</th><th>Position</th><th>Department</th><th>Role</th></tr></thead><tbody>
      ${m.users.map((u) => `<tr><td><div class="split">${avatar(u.id)}<b>${esc(u.name)}</b>${u.demo ? '<span class="tag">demo</span>' : ''}${u.id === state.user.id ? badge('You', 'blue', true) : ''}</div></td><td>${esc(u.title)}</td><td>${esc(u.dept)}</td><td><span class="tag">${esc(m.roles[u.role])}</span></td></tr>`).join('')}</tbody></table></div>
    <div>
      <div class="card" style="margin-bottom:16px"><div class="card-h"><h3>Appearance</h3><span class="sub">Saved on this device</span></div><div class="card-b" style="padding:10px 8px">${themeSeg()}<div class="hint" style="padding:0 10px">System follows your computer’s light/dark setting.</div></div></div>
      <div class="card" style="margin-bottom:16px"><div class="card-h"><h3>System settings</h3></div><div class="card-b">
        <div class="fld"><label>Document periodic review cycle (years)</label><div class="split"><input class="input" type="number" min="1" max="10" id="rc" value="${m.settings.reviewCycleYears}" style="width:90px" ${isAdmin ? '' : 'disabled'}>${isAdmin ? `<button class="btn" id="rcSave">Save</button>` : ''}</div><div class="hint">OP/WF/001 does not define a review interval — set the company rule here.</div></div>
        <div class="divider"></div>
        <div class="dl" style="grid-template-columns:1fr"><div><span>Document source folder</span><b class="mono" style="font-size:12px">${esc(m.seeded.source)}</b></div><div><span>Files imported</span><b>${m.seeded.files} files · last import ${esc(fmtDate(m.seeded.seededAt))}</b></div></div>
        ${isAdmin ? `<div class="divider"></div><button class="btn" id="backupBtn">${icon('download')}Download full backup now</button><div class="hint" style="margin-top:6px">A daily copy is also kept automatically on the server (last 14 days).</div>` : ''}
        ${isAdmin ? `<div class="divider"></div><button class="btn danger" id="resetBtn">${icon('refresh')}Re-import documents & reset demo data</button>` : ''}
      </div></div>
      <div class="card"><div class="card-h"><h3>Audit trail</h3><span class="sub">All changes are logged</span></div><div class="list" style="max-height:330px;overflow:auto">${activity.slice(0, 40).map((a) => `<div class="li">${avatar(a.by, 'sm')}<div class="grow"><b style="white-space:normal;font-weight:500">${esc(user(a.by)?.name || '')} · ${esc(a.text)}</b><small>${ago(a.at)}</small></div></div>`).join('')}</div></div>
    </div>
  </div>
  <div class="card" style="margin-bottom:16px"><div class="card-h"><h3>SRS user hierarchy &amp; personas</h3><span class="sub">§2.1 – 15 roles, least-privilege access tiers</span></div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Role</th><th>Base</th><th>Access tier</th><th>Responsibilities in eQMS</th><th>Demo user</th></tr></thead><tbody>${(m.srsRoles || []).map((r) => { const u = m.users.find((x) => x.role === r.role); return `<tr><td class="t">${esc(r.title)}</td><td>${esc(r.base)}</td><td><span class="tag">${esc(r.tier)}</span></td><td style="font-size:12.5px;color:var(--ink-2)">${esc(r.duties)}</td><td>${u ? `<div class="split">${avatar(u.id, 'sm')}<span>${esc(u.name)}</span></div>` : '<span class="faint">—</span>'}</td></tr>`; }).join('')}</tbody></table></div></div>
  <div class="card"><div class="card-h"><h3>Workflow permission matrix</h3><span class="sub">Which roles can move each module forward (from the procedures)</span></div>
    <div class="tbl-wrap"><table class="tbl matrix"><thead><tr><th>Module</th>${Object.values(m.roles).map((r) => `<th>${esc(r)}</th>`).join('')}</tr></thead><tbody>
    ${perms.map((p) => `<tr><td><div class="split">${icon(p.def.icon, 'sm')}<b>${esc(p.def.title)}</b><span class="faint mono">${esc(p.def.procedure)}</span></div></td>${p.roles.map((x) => `<td>${x ? `<span class="lvl lvl-3">✓</span>` : `<span class="lvl lvl-0">–</span>`}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
  bindThemeSeg(view);
  view.querySelector('#backupBtn')?.addEventListener('click', () => download('/api/backup'));
  view.querySelector('#rcSave')?.addEventListener('click', async () => { state.meta.settings = await api('/settings', { method: 'PATCH', body: { reviewCycleYears: view.querySelector('#rc').value } }); toast('Review cycle updated'); });
  view.querySelector('#resetBtn')?.addEventListener('click', async () => { const c = await confirmBox({ title: 'Reset demo data?', sub: 'Re-imports all documents from the source folder and restores the sample records. Changes made in the demo are lost.', label: 'Reset', danger: true }); if (!c.ok) return; await api('/reset', { body: {} }); state.meta = await api('/meta'); toast('Data re-imported'); refreshCounts(); route(); });
}
