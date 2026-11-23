import { state, api, icon, esc, badge, avatar } from '../core.js';
import { setCrumbs } from '../app.js';

let tab = 'overview';
export async function renderOrg(view) {
  setCrumbs(['Organization', 'Company & Context']);
  const o = state.meta.org;
  const [docs, dash] = await Promise.all([api('/documents'), api('/dashboard')]);
  state.dash = dash;
  const docByCode = Object.fromEntries(docs.map((d) => [d.code, d]));
  const tabs = [['overview', 'Overview'], ['structure', 'Organization chart'], ['context', 'Context (4.1)'], ['parties', 'Interested parties (4.2)'], ['process', 'Process map & clauses'], ['objectives', 'Quality objectives (6.2)'], ['roadmap', 'Roadmap (SRS)'], ['health', `QMS health check <span class="n">${o.findings.length}</span>`], ['drcc', 'Record classification']];
  view.innerHTML = `
    <div class="ph"><div><div class="eyebrow">MN/WF/001 Quality Manual · Issue 2</div><h1>${esc(o.name)}</h1><p>${esc(o.amharic)} · ${esc(o.address)}</p></div>
      <div class="actions"><a class="btn" href="#/documents/${docByCode['MN/WF/001']?.id || ''}">${icon('file')}Open Quality Manual</a></div></div>
    <div class="card"><div class="tabs" id="otabs" style="padding:0 18px">${tabs.map(([k, l]) => `<button data-t="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div><div id="obody" style="padding:22px"></div></div>`;
  const body = view.querySelector('#obody');
  const docLink = (code) => { const c = code.split(' ')[0]; const d = docByCode[c]; return d ? `<a href="#/documents/${d.id}" class="code">${esc(code)}</a>` : `<span class="code" style="background:var(--bad-soft);color:var(--bad)" title="Not in document set">${esc(code)}</span>`; };

  const R = {
    overview: () => `<div class="grid g-main">
      <div>
        <div class="section-t">Quality policy · PO/WF/001 ${badge('Draft – awaiting GM approval', 'amber', true)}</div>
        <blockquote style="margin:0 0 18px;padding:18px 22px;border-left:4px solid var(--brand);background:var(--brand-soft);border-radius:10px;font-size:15.5px;line-height:1.6;color:var(--ink)">“${esc(o.policy)}”</blockquote>
        <div class="section-t">Core values</div><div class="grid g4" style="margin-bottom:20px">${o.values.map((v, i) => `<div class="card" style="padding:14px;text-align:center"><span class="kpi-ico tone-${['blue', 'teal', 'amber', 'violet'][i]}" style="margin:0 auto 8px">${icon(['star', 'grad', 'clock', 'trend'][i], 'sm')}</span><b>${esc(v)}</b></div>`).join('')}</div>
        <div class="section-t">Business activities</div><ul style="margin:0 0 18px;padding-left:18px;line-height:1.9">${o.activities.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
        <div class="section-t">Products in QMS scope</div><div class="chips">${o.products.map((p) => `<span class="tag">${esc(p)}</span>`).join('')}</div>
      </div>
      <div>
        <div class="card" style="margin-bottom:14px"><div class="card-b"><div class="dl" style="grid-template-columns:1fr">
          <div><span>Standard</span><b>${esc(o.standard)}</b></div><div><span>Profile</span><b>${esc(o.profile)}</b></div>
          <div><span>Exclusion</span><b>${esc(o.exclusion)}</b></div><div><span>Quality Manual</span><b>${esc(o.manualIssue)}</b></div>
          <div><span>Approved by</span><b>Amanuel Tesfaye, General Manager</b></div></div></div></div>
        <div class="card"><div class="card-h"><h3>QMS leadership</h3></div><div class="list">${state.meta.users.filter((u) => ['gm', 'mr', 'head', 'auditor', 'qa'].includes(u.role)).map((u) => `<div class="li">${avatar(u.id)}<div class="grow"><b>${esc(u.name)}</b><small>${esc(u.title)}</small></div>${u.demo ? '<span class="tag">demo</span>' : ''}</div>`).join('')}</div></div>
      </div></div>`,
    structure: () => {
      const s = o.structure, dgm = s.children[0];
      return `<p class="muted" style="margin-top:0">OF/WF/030 Organizational Structure (Issue 1, approved by the General Manager). Rebuilt from the SmartArt diagram in the source file.</p>
      <div class="org" style="overflow-x:auto;padding-bottom:10px">
        <div class="org-node top"><b>${esc(s.name)}</b><small>Amanuel Tesfaye</small></div><div class="org-link"></div>
        <div class="org-node top"><b>${esc(dgm.name)}</b><small>Top management</small></div><div class="org-link"></div>
        <div class="org-row" style="padding-top:0;margin-bottom:6px">${dgm.staff.map((x) => `<div class="org-node" style="min-width:130px;border-style:dashed"><b>${esc(x)}</b><small>Staff function</small></div>`).join('')}</div><div class="org-link"></div>
        <div class="org-row" style="align-items:flex-start;flex-wrap:nowrap;border-top:1.5px solid var(--line-2)">${dgm.children.map((d) => `<div style="display:flex;flex-direction:column;align-items:center"><div class="org-link"></div><div class="org-node" style="border-color:var(--teal);background:var(--teal-soft)"><b>${esc(d.name)}</b><small>Department</small></div>${(d.children || []).map((c) => `<div class="org-link" style="height:12px"></div><div class="org-node" style="min-width:140px"><b>${esc(c.name)}</b>${c.sub ? `<small>${esc(c.sub)}</small>` : ''}</div>`).join('')}</div>`).join('')}</div>
      </div>`;
    },
    context: () => `<p class="muted" style="margin-top:0">${docLink('OF/WF/039')} Context of the Organization exercise.</p>
      <div class="grid g2"><div class="card"><div class="card-h"><h3>Internal strengths</h3>${badge('Strengths', 'green', true)}</div><div class="list">${o.context.strengths.map((s) => `<div class="li">${icon('check', 'sm')}<div class="grow" style="white-space:normal">${esc(s)}</div></div>`).join('')}</div>
        <div class="card-b" style="border-top:1px solid var(--line)"><div class="callout warn">No internal weaknesses are recorded in OF/WF/039 – ISO 9001 clause 4.1 expects both positive and negative internal issues.</div></div></div>
      <div class="card"><div class="card-h"><h3>External issues (PESTLE)</h3></div><table class="tbl"><thead><tr><th>Factor</th><th>Opportunity</th><th>Threat</th></tr></thead><tbody>${o.context.external.map((x) => `<tr><td><b>${esc(x.f)}</b></td><td>${x.o ? esc(x.o) : '<span class="faint">—</span>'}</td><td>${x.t ? `<span style="color:var(--bad)">${esc(x.t)}</span>` : '<span class="faint">—</span>'}</td></tr>`).join('')}</tbody></table></div></div>`,
    parties: () => `<p class="muted" style="margin-top:0">${docLink('OF/WF/040')} Interested parties and their requirements. The source form has no monitoring column – the app links each party to where it is monitored.</p>
      <div class="grid g3">${o.parties.map((p, i) => { const mon = [['Customer satisfaction', 'satisfaction'], ['Management review', 'reviews'], ['Management review', 'reviews'], ['Training & competence', 'training'], ['Supplier evaluation', 'suppliers'], ['Records register', 'records'], ['Context review', null]][i]; return `<div class="card"><div class="card-h"><span class="kpi-ico tone-${['blue', 'teal', 'violet', 'amber', 'green', 'gray', 'red'][i]}">${icon(['users', 'trend', 'shield', 'grad', 'truck', 'building', 'drop'][i], 'sm')}</span><h3>${esc(p.p)}</h3></div><div class="card-b"><ul style="margin:0;padding-left:18px;line-height:1.8">${p.e.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>${mon[1] ? `<div class="divider"></div><a class="split" href="#/m/${mon[1]}" style="font-size:12.5px">${icon('link', 'sm')}Monitored in ${esc(mon[0])}</a>` : ''}</div></div>`; }).join('')}</div>`,
    process: () => `<div class="grid g3" style="margin-bottom:20px">${[['Management processes', o.processes.management, 'violet'], ['Core processes', o.processes.core, 'blue'], ['Support processes', o.processes.support, 'teal']].map(([t, list, tone]) => `<div class="card"><div class="card-h"><span class="kpi-ico tone-${tone}">${icon('layers', 'sm')}</span><h3>${t}</h3></div><div class="card-b chips">${list.map((x) => `<span class="badge ${tone} plain" style="height:26px;font-size:12.5px">${esc(x)}</span>`).join('')}</div></div>`).join('')}</div>
      <div class="callout" style="margin-bottom:18px;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b>Customer requirements</b>${icon('arrowR', 'sm')}Signed contract${icon('arrowR', 'sm')}Production plan${icon('arrowR', 'sm')}Work order${icon('arrowR', 'sm')}Store request / purchase${icon('arrowR', 'sm')}Production & QA release${icon('arrowR', 'sm')}<b>Customer satisfaction</b></div>
      <div class="section-t">ISO 9001:2015 clause → WF documented information</div>
      <div class="card"><table class="tbl"><thead><tr><th>Clause</th><th>Requirement</th><th>WF document</th><th>In system</th></tr></thead><tbody>${o.clauses.map(([c, t, d]) => { const ok = d.split(/ · |–/)[0].trim(); const present = !!docByCode[ok]; return `<tr><td><b class="mono">${esc(c)}</b></td><td>${esc(t)}</td><td>${docLink(d)}</td><td>${present ? badge('Present', 'green') : badge('Missing', 'red')}</td></tr>`; }).join('')}</tbody></table></div>`,
    roadmap: () => {
      const ph = [['Phase 1 · Core foundation', 'Months 1–4', 'In progress', 'amber', 'Paperless QMS: 26 workflow modules, central document control, users & roles, database. Still to do: digitise the remaining ~190 individual formats as electronic forms (workflows exist; the paper layouts do not).'],
        ['Phase 2 · Mobility & serialisation', 'Months 5–7', 'Groundwork only', 'blue', 'Installable offline app (PWA), mobile menu and offline shift logs are done. Barcode / 2D DataMatrix scanning is not built.'],
        ['Phase 3 · Industrial IoT', 'Months 8–10', 'Not started', '', 'Needs access to the Jwell extruder PLCs (Modbus / OPC-UA). Today temperatures are entered manually.'],
        ['Phase 4 · Client verification', 'Months 11–12', 'Preview built', 'blue', 'Certificates carry a verification code and a public /verify page. QR images and a hosted public portal are not built.'],
        ['Phase 5 · AI & predictive quality', 'Year 2', 'Not started', '', 'Needs 6–12 months of real thermal-profile and maintenance data first.']];
      return `<p class="muted" style="margin-top:0">Growth horizons from SRS-WF-QMS-2026-v1.0 and their honest status in this build.</p><div class="grid">${ph.map(([t, w, s, tone, d]) => `<div class="card"><div class="card-h"><h3>${t}</h3><span class="sub">${w}</span><div class="r">${badge(s, tone, true)}</div></div><div class="card-b">${d}</div></div>`).join('')}</div>`;
    },
    objectives: () => {
      const k = state.dash.kpi; const cal = k.calTotal ? Math.round(((k.calTotal - k.calOverdue) / k.calTotal) * 100) : null;
      const act = { satisfaction: k.satisfaction, firstPass: k.firstPass, capaOnTime: k.capaOnTime, calibration: cal, supplierScore: k.supplierScore, scrapRate: k.scrapRate, otd: k.otd, auditCoverage: k.auditCoverage, docsReviewOverdue: k.docsReviewOverdue, mrHeld: k.mrHeld };
      const rows = (o.objectives || []).map((x) => { const v = act[x.key]; const num = parseFloat(x.target.replace(/[^\d.]/g, '')); const low = x.target.trim() === '0'; const lt = /^</.test(x.target.trim()); const gt = /^>(?!=)/.test(x.target.trim()); const ok = v == null ? null : low ? v === 0 : lt ? v < num : gt ? v > num : v >= num; return { ...x, v, ok, unit: /%/.test(x.target) ? '%' : '' }; });
      return `<div class="callout warn" style="margin-bottom:14px">${docLink('OF/WF/027')} Quality Objectives – <b>proposed targets awaiting GM approval</b>. Actual values are live from the system.</div>
      <div class="grid g4" style="margin-bottom:14px">${rows.map((x) => `<div class="card kpi" style="cursor:default"><div class="kpi-top">${esc(x.title)}</div><div class="kpi-v" style="color:var(--${x.ok == null ? 'muted' : x.ok ? 'ok' : 'bad'})">${x.v == null ? '—' : x.v + x.unit}</div><div class="kpi-f">Target ${esc(x.target)} · ${x.ok == null ? 'no data' : x.ok ? 'on target' : 'below target'}</div></div>`).join('')}</div>
      <div class="card"><table class="tbl"><thead><tr><th>Objective</th><th>How measured</th><th>Target</th><th>Actual</th><th>Frequency</th><th>Owner</th><th>ISO</th></tr></thead><tbody>${rows.map((x) => `<tr><td><b>${esc(x.title)}</b></td><td>${esc(x.how)}</td><td>${esc(x.target)}</td><td>${x.v == null ? '—' : badge(x.v + x.unit, x.ok ? 'green' : 'red', true)}</td><td>${esc(x.freq)}</td><td>${esc(x.owner)}</td><td class="mono">${esc(x.clause)}</td></tr>`).join('')}</tbody></table></div>`;
    },
    health: () => `<p class="muted" style="margin-top:0">Gaps and inconsistencies found by analysing all 152 files in the QMS 2026 folder (manual, policy, 41 procedures, 96 formats, 12 records). Resolve them to strengthen the certification audit.</p>
      <div class="grid g3" style="margin-bottom:16px">${['high', 'medium', 'low'].map((s) => `<div class="card kpi" style="cursor:default"><div class="kpi-top"><span class="kpi-ico tone-${s === 'high' ? 'red' : s === 'medium' ? 'amber' : 'gray'}">${icon('alert', 'sm')}</span>${s[0].toUpperCase() + s.slice(1)} priority</div><div class="kpi-v">${o.findings.filter((f) => f.sev === s).length}</div></div>`).join('')}</div>
      <div class="card"><div class="list">${o.findings.map((f, i) => `<div class="li" style="align-items:flex-start;padding:14px 18px"><span class="badge ${f.sev === 'high' ? 'red' : f.sev === 'medium' ? 'amber' : ''} plain" style="text-transform:capitalize;min-width:66px;justify-content:center;margin-top:2px">${f.sev}</span><div class="grow"><b style="white-space:normal">${i + 1}. ${esc(f.t)}</b><small style="display:block;margin-top:3px;font-size:13px">${esc(f.d)}</small>${f.fix ? `<div class="callout ok" style="margin-top:8px;font-size:12.5px"><b>Fix drafted:</b> ${esc(f.fix.text)} ${docLink(f.fix.code)}</div>` : ''}</div></div>`).join('')}</div></div>`,
    drcc: () => `<p class="muted" style="margin-top:0">Documents & Records Classification Codes (DRCC) from OF/WF/012. File code format per OP/WF/002: <span class="code">DEPT / DRCC / SERIAL / YEAR</span> e.g. <span class="code">OP/30/006/2026</span>. Retention: minimum 3 years, maximum 10 years; employee files for life. Disposal needs MR approval (OF/WF/013).</p>
      <div class="card"><div style="columns:3 260px;column-gap:0;padding:6px 0">${o.drcc.map(([c, t]) => `<div class="li" style="break-inside:avoid;border-bottom:1px solid var(--line)"><span class="code">${c}</span><span>${esc(t)}</span></div>`).join('')}</div></div>
      <div style="margin-top:14px"><a class="btn" href="#/m/records">${icon('archive')}Open records register</a></div>`,
  };
  const draw = () => { body.innerHTML = R[tab](); view.querySelectorAll('#otabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === tab)); };
  draw();
  view.querySelector('#otabs').onclick = (e) => { const t = e.target.closest('[data-t]')?.dataset.t; if (t) { tab = t; draw(); } };
}
