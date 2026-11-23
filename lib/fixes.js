// Drafts that close the QMS gaps found in the document analysis. Everything lands in Document Control as
// DRAFT / CHANGE REQUEST so management approves it through OP/WF/001. Source Word files are never modified.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const page = (title, code, body) => `<html><head><meta charset="utf-8"><style>body{font-family:Calibri,Arial;font-size:11pt}table{border-collapse:collapse;width:100%}td,th{border:1px solid #888;padding:4px 6px;vertical-align:top}th{background:#e8eef7}h1{font-size:16pt}</style></head><body>
<table><tr><td><b>WATER FIT GENERAL TRADING</b></td><td><b>Doc No:</b> ${code}</td><td><b>Issue No:</b> DRAFT</td></tr><tr><td colspan="3"><h1>${esc(title)}</h1></td></tr></table>${body}
<p style="font-size:9pt;color:#555">DRAFT prepared by the QMS system for management approval – not yet a controlled document. PLEASE MAKE SURE THAT THIS IS THE CORRECT ISSUE BEFORE USE.</p></body></html>`;
const table = (head, rows) => `<table><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table>`;

const OBJECTIVES = [
  ['Customer satisfaction', 'Overall score from OF/WF/035 survey', '≥ 90 %', 'Annual', 'Marketing & Sales Head', '9.1.2', 'satisfaction'],
  ['Scrap rate', 'Average scrap % on shift logs (OF/WF/050)', '< 2.5 %', 'Monthly', 'Factory Manager', '8.5', 'scrapRate'],
  ['On-time delivery', 'Dispatches delivered on the promised date', '> 95 %', 'Monthly', 'Marketing & Sales Head', '8.2', 'otd'],
  ['First-pass inspection yield', 'Batches passing first test ÷ batches tested (OP/WF/040)', '≥ 95 %', 'Monthly', 'Operation Head', '8.6', 'firstPass'],
  ['Corrective actions closed on time', 'CAPAs closed by agreed date ÷ CAPAs closed', '≥ 90 %', 'Quarterly', 'Management Representative', '10.2', 'capaOnTime'],
  ['Calibration compliance', 'Instruments in calibration ÷ instruments in register', '100 %', 'Monthly', 'QA Officer', '7.1.5', 'calibration'],
  ['Supplier performance', 'Average evaluation score of approved suppliers (OP/WF/027)', '≥ 75 %', 'Half-yearly', 'Procurement & Supply Head', '8.4', 'supplierScore'],
  ['Internal audit coverage', 'Departments audited in the year ÷ all departments', '100 %', 'Yearly', 'Management Representative', '9.2', 'auditCoverage'],
  ['Documents past review date', 'Controlled documents beyond the review cycle', '0', 'Quarterly', 'Management Representative', '7.5', 'docsReviewOverdue'],
  ['Management reviews held', 'Management reviews completed in the year (OP/WF/006)', '≥ 2', 'Yearly', 'General Manager', '9.3', 'mrHeld'],
];
const PROGRAMME = [['Operation', 'Sep'], ['Procurement & Supply (Purchasing, Materials Mgmt)', 'Oct'], ['Marketing & Sales', 'Nov'], ['Top management & MR', 'Nov'], ['Finance', 'Dec'], ['Administration & HR', 'Dec'], ['Quality Assurance', 'Jan']];
const MONTHS = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

// [doc code, finding #, short note shown in the app, exact old → new text]
const CRS = [
  ['OP/WF/001', 2, 'Add periodic review rule', 'ADD new clause to section 5: “Every controlled document shall be reviewed by its owner at least every 3 years (or when a process, law or standard changes). The MR keeps the review due date on the Master List (OF/WF/004) and reminds owners 60 days before.”'],
  ['OP/WF/004', 3, 'Closure limits + form/role fixes', 'CHANGE step 1: “using OF/WF/028” → “using OF/WF/017 (CAPA Request)”.\nCHANGE: “Quality Manager” → “Management Representative”. DELETE the phrase “Non-compliance Report” (not a WF form).\nADD: “Action plan within 7 days of registration; corrective action closed within 30 days (preventive 60 days) unless the MR approves a new date.”'],
  ['OP/WF/005', 3, 'Add NCR time limits', 'ADD: “NCR is registered the same day it is found; disposition decided within 3 working days; rework or discard completed and verified within 14 days; CAPA raised under OP/WF/004 where the cause is not obvious.”'],
  ['OP/WF/003', 4, 'Correct audit form references', 'CHANGE flowchart input “OF/WF/015 (Audit Report)” → “OF/WF/016 (Audit Planning)”. CHANGE “Non-conformance Report Form OF/WF/018” → “Non-Conformity Report OF/WF/017”, aligning with OP/WF/005.'],
  ['MN/WF/001', 5, 'Fix clause cross-references', 'CHANGE 9.1.2 “OP/WF/025” → “OP/WF/032”. CHANGE 4.1/6.1 “OF/WF/031” → “OF/WF/039 (context) and OF/WF/037 (risks)”. CHANGE 4.2 “OP/WF/040” → “OF/WF/040”. DELETE reference to OP/WF/009 (no such procedure). CHANGE “Single well corrugated” → “Single Wall Corrugated” everywhere.'],
  ['OF/WF/152', 6, 'Renumber duplicate form', 'RENUMBER the bilingual “Customer Feedback Survey Questionnaires” from OF/WF/152 to OF/WF/035 (as OP/WF/032 requires); keep OF/WF/152 for the Amharic feedback recording form only. Update Master List of Formats.'],
  ['OF/WF/103', 8, 'Remove foreign footer', 'DELETE footer “Gift Real Estate Plc – Human Resource Policy & Procedures Manual” and replace with the standard WF footer. Same for forms OF/WF/093, 094, 104, 106 and 107.'],
];

function makeDoc(DATA, UP, id, name, html) {
  try {
    const dir = path.join(UP, 'generated'); fs.mkdirSync(dir, { recursive: true });
    const base = path.join(dir, name), htm = base + '.html';
    fs.writeFileSync(htm, html);
    execFileSync('textutil', ['-convert', 'docx', '-output', base + '.docx', htm]);
    const pv = path.join(DATA, 'previews', id + '.html');
    execFileSync('textutil', ['-convert', 'html', '-output', pv, base + '.docx']);
    fs.unlinkSync(htm);
    return { file: 'upload:generated/' + name + '.docx', size: fs.statSync(base + '.docx').size, preview: id };
  } catch (_) { return { file: 'upload:generated/missing', size: 0, preview: null }; } // no Word converter on this machine
}

module.exports = function applyFixes({ documents, ORG, DATA, UP, ts, day, mkAudit }) {
  const by = (c) => documents.find((d) => d.code === c);
  const hist = (d, action, tone, note) => d.history.unshift({ at: ts(-1, 10), by: 'u2', action, tone, note });
  const gen = [];

  // 1. Quality objectives OF/WF/027 (new)
  const obj = makeDoc(DATA, UP, 'f0270', 'OF-WF-027 Quality Objectives (DRAFT)', page('Quality Objectives', 'OF/WF/027',
    '<p>Per ISO 9001:2015 clause 6.2 and Quality Policy PO/WF/001 (Quality, Competency, Timeliness, Cost-Effectiveness). Targets are PROPOSED by the QMS and must be confirmed by the General Manager.</p>' +
    table(['Objective', 'How measured', 'Target', 'Frequency', 'Responsible', 'ISO clause'], OBJECTIVES.map((o) => o.slice(0, 6)))));
  const d27 = { id: 'D9027', code: 'OF/WF/027', title: 'Quality Objectives', type: 'OF', category: 'Format', department: 'General Management', owner: 'u2', issue: 0, pendingIssue: 1, status: 'approval', effective: '', notes: 'NEW – closes the missing clause 6.2 document. Targets proposed, GM to confirm.', language: 'English',
    revisions: [{ issue: 1, ext: 'docx', status: 'draft', change: 'New: 8 measurable quality objectives', name: 'OF-WF-027 Quality Objectives (DRAFT).docx', ...obj }],
    distribution: [{ dept: 'General Management', copy: 1, ack: false }, { dept: 'Quality Assurance', copy: 2, ack: false }], comments: [], history: [] };
  hist(d27, 'Draft prepared and submitted for GM approval (OF/WF/002)', 'blue', 'Prepared by QMS from gap analysis finding #1.');
  documents.push(d27); gen.push(d27);

  // 7. Audit programme (OF/WF/014 new issue)
  const ap = by('OF/WF/014');
  const grid = `<p>Year 2026/2027 – X = Internal Quality Audit planned in that month (OP/WF/003: every QMS element at least once a year).</p><table><tr><th>Department</th>${MONTHS.map((m) => `<th>${m}</th>`).join('')}</tr>${PROGRAMME.map(([d, m]) => `<tr><td>${esc(d)}</td>${MONTHS.map((x) => `<td style="text-align:center">${x === m ? 'X' : ''}</td>`).join('')}</tr>`).join('')}</table><p>Prepared by: Management Representative &nbsp;&nbsp; Approved by: General Manager</p>`;
  const prog = makeDoc(DATA, UP, 'f0140', 'OF-WF-014 Annual IQA Programme 2026-27 (DRAFT)', page('Annual Internal Quality Audit Program 2026/2027', 'OF/WF/014', grid));
  if (ap) Object.assign(ap, { status: 'approval', pendingIssue: 2, notes: '2026/27 programme filled in – all 7 departments, incl. QA (gap #7)' });
  if (ap) ap.revisions.unshift({ issue: 2, ext: 'docx', status: 'draft', change: 'Programme 2026/27 completed', name: 'OF-WF-014 Annual IQA Programme 2026-27 (DRAFT).docx', ...prog });
  if (ap) hist(ap, 'Issue 2 draft (2026/27 programme) submitted for GM approval', 'blue', 'Previous issue had no months marked.');

  // 3-6, 8. Change requests – with the exact wording
  const pack = [];
  for (const [code, n, short, text] of CRS) {
    const d = by(code); if (!d) continue;
    Object.assign(d, { status: 'requested', pendingIssue: (d.issue || 1) + 1, notes: short + ' (gap #' + n + ')' });
    hist(d, `Change request raised (OF/WF/001) – ${short}`, 'amber', text);
    pack.push([code + ' ' + d.title, '#' + n, text]);
  }
  const crDoc = makeDoc(DATA, UP, 'fc0c0', 'Change Request Pack 2026 (DRAFT)', page('Document Change Request Pack 2026', 'REC/WF/002', '<p>Exact wording changes proposed to close the QMS gaps. Each is also raised as a change request on the document in Document Control.</p>' + table(['Document', 'Gap', 'Proposed change'], pack)));
  const dcr = { id: 'D9002', code: 'REC/WF/002', title: 'Document Change Request Pack 2026', type: 'REC', category: 'Record', department: 'Quality Assurance', owner: 'u2', issue: 0, pendingIssue: 1, status: 'review', effective: '', notes: 'All proposed wording corrections in one place', language: 'English',
    revisions: [{ issue: 1, ext: 'docx', status: 'draft', change: '7 change requests', name: 'Change Request Pack 2026 (DRAFT).docx', ...crDoc }], distribution: [{ dept: 'Quality Assurance', copy: 1, ack: false }], comments: [], history: [] };
  hist(dcr, 'Pack compiled for requester review', 'blue');
  documents.push(dcr);

  // Findings: record fix status
  const F = ORG.findings;
  const fix = (i, text, code) => { F[i].fix = { text, code }; };
  fix(0, 'Draft OF/WF/027 with 8 proposed objectives awaiting GM approval; live tracking on Quality Objectives tab', 'OF/WF/027');
  fix(1, 'Review rule drafted into OP/WF/001 change request; review cycle is configurable (Users & Settings)', 'OP/WF/001');
  fix(2, 'Closure limits drafted (OP/WF/004, 005) and applied in the app as target dates: NCR 14 d, CAPA 30 d, complaint 3 d (72 h SLA)', 'OP/WF/004');
  fix(3, 'Exact corrections drafted as change requests on OP/WF/003 and OP/WF/004', 'OP/WF/003');
  fix(4, 'All manual cross-references corrected in a change request on MN/WF/001', 'MN/WF/001');
  fix(5, 'Renumbering proposed (change request on OF/WF/152)', 'OF/WF/152');
  fix(6, '2026/27 programme drafted (OF/WF/014 Issue 2) and a QA audit added to the calendar', 'OF/WF/014');
  fix(7, 'Footer removal raised as a change request (OF/WF/103, applies to 6 forms)', 'OF/WF/103');
  ORG.objectives = OBJECTIVES.map(([title, how, target, freq, owner, clause, key]) => ({ title, how, target, freq, owner, clause, key }));
};
