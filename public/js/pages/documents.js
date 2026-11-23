import { state, api, icon, esc, fmtDate, ago, avatar, user, userChip, badge, statusBadge, stateOf, empty, stepper, timeline, commentsHTML, dropzone, bindDrop, upload, toast, modal, confirmBox, can, debounce, extBadge, fmtSize, sortRows, $ } from '../core.js';
import { setCrumbs, refreshCounts } from '../app.js';

const F = () => state.meta.documentFlow;
const GROUPS = [
  ['all', 'All', () => true],
  ['mp', 'Manual & Policy', (d) => ['MN', 'PO'].includes(d.type)],
  ['sys', 'System procedures', (d) => d.category === 'System Procedure'],
  ['dep', 'Departmental procedures', (d) => d.category === 'Departmental Procedure'],
  ['of', 'Formats', (d) => d.type === 'OF'],
  ['rec', 'Records & plans', (d) => d.type === 'REC'],
];
const ui = { group: 'all', status: '', dept: '', q: '', sort: 'code', dir: 1, page: 0 };
const PER = 25;

export function openDocDrawer(id) { location.hash = '#/documents/' + id; }

export async function renderDocuments(view) {
  setCrumbs(['Documentation', 'Document Control']);
  const docs = await api('/documents');
  const s = {
    issued: docs.filter((d) => d.status === 'issued').length,
    flow: docs.filter((d) => ['requested', 'drafting', 'review', 'approval'].includes(d.status)).length,
    overdue: docs.filter((d) => d.reviewOverdue).length,
    ack: docs.reduce((a, d) => a + (d.status === 'issued' ? d.ackTotal - d.ackDone : 0), 0),
    obsolete: docs.reduce((a, d) => a + d.revisions.filter((r) => ['superseded', 'obsolete'].includes(r.status)).length, 0),
  };
  view.innerHTML = `
  <div class="ph"><div><div class="eyebrow">OP/WF/001 · Master List OF/WF/004</div><h1>Document Control</h1><p>Every controlled manual, procedure, format and record of Water Fit — with issue status, approvals, distribution and full-text search.</p></div>
    <div class="actions"><a class="btn" href="/api/export/documents" id="expBtn">${icon('download')}Export master list</a><button class="btn primary" id="newDocBtn">${icon('plus')}New document request</button></div></div>
  <div class="grid g4" style="grid-template-columns:repeat(5,minmax(0,1fr));margin-bottom:16px">
    ${[['Issued & controlled', s.issued, 'green', 'check', 'issued'], ['In change workflow', s.flow, 'blue', 'refresh', 'flow'], ['Review overdue', s.overdue, s.overdue ? 'red' : 'green', 'clock', 'overdue'], ['Acknowledgements pending', s.ack, s.ack ? 'amber' : 'green', 'users', 'ack'], ['Superseded issues archived', s.obsolete, 'gray', 'archive', '']].map(([l, v, t, ic, f]) => `<div class="card kpi" data-qf="${f}"><div class="kpi-top"><span class="kpi-ico tone-${t}">${icon(ic, 'sm')}</span>${l}</div><div class="kpi-v">${v}</div></div>`).join('')}
  </div>
  <div class="card">
    <div class="toolbar" style="border-bottom:0;padding-bottom:4px"><div class="chips" id="grp">${GROUPS.map(([k, l, fn]) => `<button class="chip ${ui.group === k ? 'on' : ''}" data-g="${k}">${l} <span class="n">${docs.filter(fn).length}</span></button>`).join('')}</div></div>
    <div class="toolbar">
      <div class="search">${icon('search')}<input class="input" id="dq" placeholder="Search code or title…" value="${esc(ui.q)}"></div>
      <select class="select" id="dd"><option value="">All departments</option>${state.meta.deptNames.map((d) => `<option ${ui.dept === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select>
      <select class="select" id="ds"><option value="">All statuses</option>${F().states.map((x) => `<option value="${x.key}" ${ui.status === x.key ? 'selected' : ''}>${esc(x.label)}</option>`).join('')}<option value="overdue" ${ui.status === 'overdue' ? 'selected' : ''}>Review overdue</option><option value="ack" ${ui.status === 'ack' ? 'selected' : ''}>Acknowledgement pending</option></select>
      <span class="spacer"></span><span class="muted" id="dcount"></span>
    </div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr>${[['code', 'Code'], ['title', 'Title'], ['category', 'Type'], ['issue', 'Issue'], ['status', 'Status'], ['effective', 'Effective'], ['reviewDue', 'Review due'], ['ackDone', 'Distribution'], ['owner', 'Owner']].map(([k, l]) => `<th class="sortable ${ui.sort === k ? 'sorted' : ''}" data-s="${k}">${l}<span class="arr">${ui.sort === k ? (ui.dir > 0 ? '↑' : '↓') : '↕'}</span></th>`).join('')}</tr></thead><tbody id="drows"></tbody></table></div>
    <div class="tbl-foot" id="dfoot"></div>
  </div>`;

  const draw = () => {
    const g = GROUPS.find((x) => x[0] === ui.group)[2];
    const q = ui.q.toLowerCase();
    let rows = docs.filter(g).filter((d) => (!ui.dept || d.department === ui.dept) && (!q || (d.code + ' ' + d.title).toLowerCase().includes(q)));
    if (ui.status === 'overdue') rows = rows.filter((d) => d.reviewOverdue);
    else if (ui.status === 'ack') rows = rows.filter((d) => d.status === 'issued' && d.ackDone < d.ackTotal);
    else if (ui.status === 'flow') rows = rows.filter((d) => ['requested', 'drafting', 'review', 'approval'].includes(d.status));
    else if (ui.status) rows = rows.filter((d) => d.status === ui.status);
    rows = sortRows(rows, ui.sort, ui.dir);
    const pages = Math.max(1, Math.ceil(rows.length / PER)); ui.page = Math.min(ui.page, pages - 1);
    const slice = rows.slice(ui.page * PER, ui.page * PER + PER);
    view.querySelector('#drows').innerHTML = slice.length ? slice.map((d) => `<tr class="click" data-id="${d.id}">
      <td><span class="code">${esc(d.code)}</span></td>
      <td class="t">${esc(d.title)}<span class="sub">${esc(d.department)}${d.notes ? ' · ' + esc(d.notes) : ''}</span></td>
      <td><span class="tag">${esc(d.category)}</span></td>
      <td class="nowrap">${d.issue ? 'Issue ' + d.issue : '—'}${d.pendingIssue ? ` <span class="muted">→ ${d.pendingIssue}</span>` : ''}</td>
      <td>${statusBadge(F(), d.status)}</td>
      <td class="nowrap">${esc(fmtDate(d.effective))}</td>
      <td class="nowrap">${d.reviewDue ? `<span class="${d.reviewOverdue ? 'due-over' : ''}">${esc(fmtDate(d.reviewDue))}</span>` : '<span class="faint">—</span>'}</td>
      <td class="nowrap">${d.ackTotal ? `<div class="split"><div class="prog" style="width:54px"><i style="width:${(d.ackDone / d.ackTotal) * 100}%;background:${d.ackDone === d.ackTotal ? 'var(--ok)' : 'var(--warn)'}"></i></div><span class="muted">${d.ackDone}/${d.ackTotal}</span></div>` : '—'}</td>
      <td>${avatar(d.owner, 'sm')}</td></tr>`).join('') : `<tr><td colspan="9">${empty('No documents match', 'Try clearing filters.')}</td></tr>`;
    view.querySelector('#dcount').textContent = `${rows.length} document${rows.length === 1 ? '' : 's'}`;
    view.querySelector('#dfoot').innerHTML = `<span>Showing ${rows.length ? ui.page * PER + 1 : 0}–${Math.min(rows.length, ui.page * PER + PER)} of ${rows.length}</span><div class="r"><button class="btn sm" ${ui.page === 0 ? 'disabled' : ''} data-p="-1">${icon('chevL', 'sm')}Prev</button><span>Page ${ui.page + 1} / ${pages}</span><button class="btn sm" ${ui.page >= pages - 1 ? 'disabled' : ''} data-p="1">Next${icon('chevR', 'sm')}</button></div>`;
  };
  draw();
  view.querySelector('#grp').onclick = (e) => { const g = e.target.closest('[data-g]')?.dataset.g; if (!g) return; ui.group = g; ui.page = 0; view.querySelectorAll('#grp .chip').forEach((c) => c.classList.toggle('on', c.dataset.g === g)); draw(); };
  view.querySelector('#dq').oninput = debounce((e) => { ui.q = e.target.value; ui.page = 0; draw(); }, 120);
  view.querySelector('#dd').onchange = (e) => { ui.dept = e.target.value; ui.page = 0; draw(); };
  view.querySelector('#ds').onchange = (e) => { ui.status = e.target.value; ui.page = 0; draw(); };
  view.querySelectorAll('[data-qf]').forEach((el) => el.onclick = () => { if (!el.dataset.qf) return; ui.status = el.dataset.qf === 'issued' ? 'issued' : el.dataset.qf; ui.group = 'all'; ui.page = 0; renderDocuments(view); });
  view.querySelector('thead').onclick = (e) => { const k = e.target.closest('[data-s]')?.dataset.s; if (!k) return; ui.dir = ui.sort === k ? -ui.dir : 1; ui.sort = k; renderDocuments(view); };
  view.querySelector('#drows').onclick = (e) => { const id = e.target.closest('[data-id]')?.dataset.id; if (id) location.hash = '#/documents/' + id; };
  view.querySelector('#dfoot').onclick = (e) => { const p = e.target.closest('[data-p]')?.dataset.p; if (p) { ui.page += +p; draw(); } };
  view.querySelector('#expBtn').onclick = (e) => { e.preventDefault(); download('/api/export/documents'); };
  view.querySelector('#newDocBtn').onclick = () => newDocRequest();
}

export async function download(url) {
  const r = await fetch(url, { headers: { 'x-user': state.user.id } });
  if (!r.ok) return toast('Download failed', true);
  const blob = await r.blob();
  const name = (r.headers.get('Content-Disposition') || '').match(/filename="?([^"]+)"?/)?.[1] || 'download';
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = decodeURIComponent(name); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function newDocRequest() {
  const types = state.meta.documentFlow.types;
  const m = modal({
    title: 'Document creation request', sub: 'Form OF/WF/001 – the MR checks the master list and assigns the next number.',
    body: `<div class="form"><div class="fld full"><label>Document title <span class="req">*</span></label><input class="input" id="nt" placeholder="e.g. Raw Material Incoming Inspection"></div>
      <div class="fld"><label>Document type <span class="req">*</span></label><select class="select" id="ny">${['OP', 'OF', 'WI', 'PO', 'MN', 'EX'].map((k) => `<option value="${k}">${k} – ${esc(types[k])}</option>`).join('')}</select></div>
      <div class="fld"><label>Department</label><select class="select" id="nd">${state.meta.deptNames.map((d) => `<option ${d === state.user.dept ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select></div>
      <div class="fld full"><label>Justification</label><textarea class="input" id="nr" placeholder="Why is this document needed? What process or risk does it control?"></textarea></div></div>`,
    foot: `<button class="btn" data-close>Cancel</button><button class="btn primary" id="nGo">${icon('send')}Submit request</button>`,
  });
  m.el.querySelector('#nGo').onclick = async () => {
    const d = await api('/documents', { body: { title: m.el.querySelector('#nt').value.trim(), type: m.el.querySelector('#ny').value, department: m.el.querySelector('#nd').value, reason: m.el.querySelector('#nr').value.trim() } });
    m.close(); toast(`Request ${d.code} submitted`); refreshCounts(); location.hash = '#/documents/' + d.id;
  };
}

// ---------------- viewer ----------------
export async function renderDocViewer(view, id) {
  const d = await api('/documents/' + id);
  setCrumbs(['Documentation', 'Document Control', d.code]);
  const flow = F();
  const transitions = flow.flow.filter((t) => t.from === d.status && t.roles.includes(state.user.role));
  const curIdx = d.revisions.findIndex((r) => r.status === 'current');
  const showIdx = curIdx >= 0 ? curIdx : 0;
  const shown = d.revisions[showIdx];
  const draftIdx = d.revisions.findIndex((r) => r.status === 'draft');
  const myRow = d.distribution.find((x) => x.dept === state.user.dept);
  const wm = d.status === 'issued' ? `<div class="watermark">${icon('shield', 'sm')}CONTROLLED ELECTRONIC COPY · Issue ${d.issue} · Effective ${esc(fmtDate(d.effective))} · Approved by ${esc(user(shown?.approvedBy)?.name || 'General Manager')}<span class="spacer"></span><span style="font-weight:500">Please make sure this is the correct issue before use</span></div>`
    : d.status === 'obsolete' ? `<div class="watermark obs">${icon('alert', 'sm')}OBSOLETE - RETAINED FOR HISTORICAL REFERENCE</div>`
    : `<div class="watermark draft">${icon('edit', 'sm')}${curIdx >= 0 ? `Showing current Issue ${d.issue}. Issue ${d.pendingIssue} is in progress (${esc(stateOf(flow, d.status).label)}).` : 'DRAFT – not yet approved for use'}</div>`;

  view.innerHTML = `
  <div class="ph"><div><div class="split" style="margin-bottom:6px"><a href="#/documents" class="btn ghost sm">${icon('chevL', 'sm')}Master list</a><span class="code">${esc(d.code)}</span>${statusBadge(flow, d.status)}<span class="tag">${esc(d.category)}</span></div>
    <h1>${esc(d.title)}</h1><p>${esc(d.department)} · Owner ${esc(user(d.owner)?.name || '')} · ${d.issue ? 'Issue ' + d.issue : 'New document'}${d.reviewDue ? ` · Next review <span class="${d.reviewOverdue ? 'due-over' : ''}">${esc(fmtDate(d.reviewDue))}</span>` : ''}</p></div>
    <div class="actions">
      ${transitions.map((t) => `<button class="btn ${t.tone === 'danger' ? 'danger' : 'primary'}" data-to="${t.to}">${esc(t.label)}</button>`).join('')}
      ${d.status === 'issued' ? `<button class="btn" id="chgBtn">${icon('edit')}Request change</button>` : ''}
      ${shown ? `<button class="btn" data-dl="${showIdx}">${icon('download')}Download</button>` : ''}
      <button class="btn" onclick="window.print()">${icon('printer')}</button>
    </div></div>
  <div class="card" style="padding:14px 18px;margin-bottom:16px">${stepper(flow.states, d.status === 'rejected' ? 'requested' : d.status, ['obsolete', 'rejected'])}</div>
  ${d.reviewOverdue ? `<div class="callout warn" style="margin-bottom:16px">${icon('clock', 'sm')} <b>Periodic review overdue.</b> This issue has been in force since ${esc(fmtDate(d.effective))}; the configured review cycle is ${state.meta.settings.reviewCycleYears} years. Use <b>Request change</b> to revise, or confirm it is still valid.</div>` : ''}
  <div class="viewer">
    <div class="paper">${wm}${shown?.preview ? `<div class="docview" id="docview"><div class="skeleton" style="height:500px;margin:24px"></div></div>` : `<div class="empty" style="padding:90px 20px">${shown ? `<div class="ico">${icon('file', 'lg')}</div><b>${esc((shown.ext || '').toUpperCase())} file – no inline preview</b>Download to open it in ${/xls/.test(shown.ext) ? 'Excel' : 'its application'}.<div style="margin-top:14px"><button class="btn" data-dl="${showIdx}">${icon('download')}Download</button></div>` : `<div class="ico">${icon('upload', 'lg')}</div><b>No file yet</b>Upload the draft once the request is accepted.`}</div>`}</div>
    <div>
      ${['drafting', 'review'].includes(d.status) ? `<div class="card" style="margin-bottom:14px"><div class="card-h"><h3>Draft for Issue ${d.pendingIssue}</h3></div><div class="card-b">${draftIdx >= 0 ? `<div class="file">${extBadge(d.revisions[draftIdx].ext)}<div class="grow"><b>${esc(d.revisions[draftIdx].name || d.revisions[draftIdx].file.split('/').pop())}</b><small>${fmtSize(d.revisions[draftIdx].size)} · draft</small></div><button class="btn sm" data-dl="${draftIdx}">${icon('download', 'sm')}</button></div>` : ''}${dropzone('dz', draftIdx >= 0 ? 'Replace draft file' : 'Upload draft file')}</div></div>` : ''}
      <div class="card" style="margin-bottom:14px"><div class="card-h"><h3>Details</h3></div><div class="card-b"><div class="dl">
        <div><span>Document no.</span><b class="mono">${esc(d.code)}</b></div><div><span>Type</span><b>${esc(state.meta.documentFlow.types[d.type] || d.category)}</b></div>
        <div><span>Issue</span><b>${d.issue || '—'}${d.pendingIssue ? ` → ${d.pendingIssue}` : ''}</b></div><div><span>Effective</span><b>${esc(fmtDate(d.effective))}</b></div>
        <div><span>Owner</span>${userChip(d.owner)}</div><div><span>Language</span><b>${esc(d.language)}</b></div>
        ${d.procedureModules?.length ? `<div class="full"><span>Implemented in the system as</span><div class="chips" style="margin-top:4px">${d.procedureModules.map((m) => `<a class="chip" href="#/m/${m}">${icon(state.meta.modules[m].icon, 'sm')}${esc(state.meta.modules[m].title)}</a>`).join('')}</div></div>` : ''}
      </div></div></div>
      <div class="card" style="margin-bottom:14px"><div class="card-h"><h3>Distribution</h3><span class="sub">Release note OF/WF/003</span><div class="r">${badge(`${d.ackDone}/${d.ackTotal} acknowledged`, d.ackDone === d.ackTotal ? 'green' : 'amber', true)}</div></div>
        <div class="list">${d.distribution.map((x) => `<div class="li"><span class="mono faint">#${x.copy}</span><div class="grow"><b>${esc(x.dept)}</b><small>${x.ack ? `Received ${esc(fmtDate(x.ackAt))}${x.ackBy ? ' by ' + esc(user(x.ackBy)?.name) : ''}` : d.status === 'issued' ? 'Awaiting acknowledgement' : 'Will receive on issue'}</small></div>${x.ack ? badge('Received', 'green', true) : d.status === 'issued' && x === myRow ? `<button class="btn sm primary" id="ackBtn">${icon('check', 'sm')}Acknowledge</button>` : badge('Pending', '', true)}</div>`).join('')}</div>
        ${['mr', 'gm'].includes(state.user.role) ? `<div class="card-b" style="border-top:1px solid var(--line);padding:10px 18px"><button class="btn sm ghost" id="distBtn">${icon('edit', 'sm')}Edit distribution list</button></div>` : ''}</div>
      <div class="card" style="margin-bottom:14px"><div class="card-h"><h3>Issue history</h3></div><div class="list">${d.revisions.length ? d.revisions.map((r, i) => `<div class="li">${extBadge(r.ext).replace('class="ext"', 'class="ext" style="width:28px;height:32px;font-size:8.5px"')}<div class="grow"><b>Issue ${r.issue} ${badge(r.status === 'current' ? 'Current' : r.status === 'draft' ? 'Draft' : r.status === 'obsolete' ? 'Obsolete' : 'Superseded', r.status === 'current' ? 'green' : r.status === 'draft' ? 'amber' : 'red', true)}</b><small>${esc(r.change || '')}${r.effective ? ' · ' + esc(fmtDate(r.effective)) : ''}</small></div>${r.preview && i !== showIdx ? `<a class="btn sm ghost" target="_blank" href="/api/documents/${d.id}/preview/${i}?u=${state.user.id}" title="Preview">${icon('eye', 'sm')}</a>` : ''}<button class="btn sm ghost" data-dl="${i}" title="Download">${icon('download', 'sm')}</button></div>`).join('') : empty('No issues yet', '', 'file')}</div></div>
      <div class="card"><div class="tabs" id="dtabs"><button class="on" data-t="act">Activity</button><button data-t="cmt">Comments <span class="n">${d.comments.length}</span></button></div><div class="pane" id="dpane"></div></div>
    </div>
  </div>`;

  const pane = view.querySelector('#dpane');
  const showTab = (t) => {
    view.querySelectorAll('#dtabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === t));
    if (t === 'act') pane.innerHTML = timeline(d.history);
    else {
      pane.innerHTML = commentsHTML(d.comments);
      pane.querySelector('#cmtBtn').onclick = async () => { const text = pane.querySelector('#cmtIn').value.trim(); if (!text) return; d.comments = await api(`/documents/${d.id}/comments`, { body: { text } }); showTab('cmt'); view.querySelector('#dtabs [data-t=cmt] .n').textContent = d.comments.length; };
    }
  };
  showTab('act');
  view.querySelector('#dtabs').onclick = (e) => { const t = e.target.closest('[data-t]')?.dataset.t; if (t) showTab(t); };
  view.querySelectorAll('[data-dl]').forEach((b) => (b.onclick = () => download(`/api/documents/${d.id}/file/${b.dataset.dl}`)));
  view.querySelectorAll('[data-to]').forEach((b) => (b.onclick = async () => {
    const t = transitions.find((x) => x.to === b.dataset.to);
    const r = await confirmBox({ title: t.label, sub: `${d.code} · ${d.title}`, label: t.label, danger: t.tone === 'danger', needNote: !!t.note || undefined, notePlaceholder: t.to === 'issued' ? '' : 'Explain the decision…', needPassword: t.to === 'issued' });
    if (!r.ok) return;
    await api(`/documents/${d.id}/transition`, { body: { to: t.to, note: r.note, password: r.password } });
    toast(t.label + ' ✓'); refreshCounts(); renderDocViewer(view, id);
  }));
  view.querySelector('#ackBtn')?.addEventListener('click', async () => { await api(`/documents/${d.id}/ack`, { body: {} }); toast('Receipt acknowledged'); refreshCounts(); renderDocViewer(view, id); });
  view.querySelector('#chgBtn')?.addEventListener('click', async () => {
    const r = await confirmBox({ title: 'Request change (OF/WF/001)', sub: `Raise a change request for ${d.code} Issue ${d.issue + 1}. The Department Head / MR will accept or reject it.`, label: 'Submit change request', needNote: true, notePlaceholder: 'What needs to change and why?' });
    if (!r.ok) return;
    await api('/documents', { body: { kind: 'revision', baseId: d.id, reason: r.note } }); toast('Change request raised'); refreshCounts(); renderDocViewer(view, id);
  });
  view.querySelector('#distBtn')?.addEventListener('click', () => {
    const m = modal({ title: 'Distribution list', sub: 'Departments that receive a controlled copy', body: `<div class="chips" id="dl">${state.meta.deptNames.map((dep) => `<label class="chip ${d.distribution.some((x) => x.dept === dep) ? 'on' : ''}"><input type="checkbox" hidden value="${esc(dep)}" ${d.distribution.some((x) => x.dept === dep) ? 'checked' : ''}>${esc(dep)}</label>`).join('')}</div>`, foot: `<button class="btn" data-close>Cancel</button><button class="btn primary" id="dlSave">Save</button>` });
    m.el.querySelectorAll('label.chip').forEach((l) => l.onclick = (e) => { e.preventDefault(); const c = l.querySelector('input'); c.checked = !c.checked; l.classList.toggle('on', c.checked); });
    m.el.querySelector('#dlSave').onclick = async () => { await api(`/documents/${d.id}/distribution`, { body: { depts: [...m.el.querySelectorAll('input:checked')].map((x) => x.value) } }); m.close(); toast('Distribution updated'); renderDocViewer(view, id); };
  });
  const dv = view.querySelector('#docview');
  if (dv) renderPreview(dv, `/api/documents/${d.id}/preview/${showIdx}?u=${state.user.id}`);
  const dz = view.querySelector('#dz');
  if (dz) bindDrop(dz, async (file) => { await upload(`/documents/${d.id}/file`, file); toast('Draft uploaded'); renderDocViewer(view, id); });
}

// Render the converted Word HTML inside a Shadow DOM (isolated styles, scripts/handlers stripped).
async function renderPreview(host, url) {
  const html = await (await fetch(url)).text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,iframe,object,embed,link,meta,base,form').forEach((n) => n.remove());
  doc.querySelectorAll('*').forEach((el) => [...el.attributes].forEach((a) => { if (/^on/i.test(a.name) || /javascript:/i.test(a.value)) el.removeAttribute(a.name); }));
  const styles = [...doc.querySelectorAll('style')].map((s) => s.textContent).join('\n');
  const root = host.attachShadow ? (host.shadowRoot || host.attachShadow({ mode: 'open' })) : host;
  root.innerHTML = `<style>${styles}</style><style>:host{display:block;background:#fff;color:#1a1a1a;height:calc(100vh - 230px);overflow:auto}
    .pg{max-width:860px;margin:0 auto;padding:30px 44px 60px}
    .pg,.pg p,.pg li,.pg td,.pg th,.pg span{font-family:Calibri,'Segoe UI',Arial,sans-serif!important;font-size:13.5px!important;line-height:1.55!important;color:#1a1a1a}
    .pg table{border-collapse:collapse;margin:10px 0;width:100%!important;table-layout:auto}.pg td,.pg th,.pg col{width:auto!important}.pg td,.pg th{border:1px solid #d3d9e0!important;padding:5px 8px!important;vertical-align:top}
    .pg p{margin:0 0 6px!important}.pg b,.pg strong{font-weight:700}</style><div class="pg">${doc.body.innerHTML}</div>`;
}
