// Builds data/db.json from the real WF QMS folder + organisation facts extracted from the QMS documents.
// Usage: node seed.js   (QMS_ROOT env var overrides the source folder)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const QMS_ROOT = process.env.QMS_ROOT || '/Users/pro2019/Downloads/QMS 2026';
const DATA = path.join(__dirname, 'data');
const PREV = path.join(DATA, 'previews');
const TEXT = path.join(DATA, 'text');
[DATA, PREV, TEXT].forEach((d) => fs.mkdirSync(d, { recursive: true }));

const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 16);
const today = new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const day = (off) => iso(new Date(today.getTime() + off * 86400000));
const ts = (off, h = 9) => { const d = new Date(today.getTime() + off * 86400000); d.setHours(h, 15 + (Math.abs(off * 7) % 40)); return d.toISOString(); };

// ---------------------------------------------------------------- users
// Real names come from the QMS documents (GM approval blocks, IQA plan 01/2020). Others are demo placeholders.
const USERS = [
  { id: 'u1', name: 'Amanuel Tesfaye', title: 'General Manager', role: 'gm', dept: 'General Management', color: '#0a5bd3' },
  { id: 'u2', name: 'Addisalem Bekele', title: 'Quality Management Representative (QMR)', role: 'mr', dept: 'Quality Assurance', color: '#0e9488' },
  { id: 'u3', name: 'Meseret Alemu', title: 'Internal Auditor / QMS Task Force', role: 'auditor', dept: 'Quality Assurance', color: '#7c3aed' },
  { id: 'u4', name: 'Dawit Fekadu', title: 'QA/QC Laboratory Head & Inspector', role: 'qa', dept: 'Quality Assurance', color: '#db2777' },
  { id: 'u5', name: 'Tamrat', title: 'Operation Department Head', role: 'head', dept: 'Operation', color: '#ea580c' },
  { id: 'u6', name: 'Feleke Yirga', title: 'Procurement & Supply Head', role: 'head', dept: 'Procurement & Supply', color: '#16a34a' },
  { id: 'u7', name: 'Getachew', title: 'Marketing & Sales Head', role: 'head', dept: 'Marketing & Sales', color: '#ca8a04' },
  { id: 'u8', name: 'Elisa', title: 'Finance Head', role: 'head', dept: 'Finance', color: '#0891b2' },
  { id: 'u9', name: 'Selam Tadesse', title: 'Administration & HR Head', role: 'head', dept: 'Administration & HR', color: '#be123c', demo: true },
  { id: 'u10', name: 'Kidus Wolde', title: 'Maintenance Officer (Technic)', role: 'maint', dept: 'Operation', color: '#4f46e5', demo: true },
  { id: 'u11', name: 'Hanna Girma', title: 'Production Supervisor', role: 'supervisor', dept: 'Operation', color: '#9333ea', demo: true },
  { id: 'u12', name: 'Yonas Haile', title: 'Store Keeper (Raw / Finished / Spares)', role: 'store', dept: 'Procurement & Supply', color: '#65a30d', demo: true },
  { id: 'u13', name: 'Mulugeta Assefa', title: 'Procurement & Supplies Officer', role: 'procurement', dept: 'Procurement & Supply', color: '#0d9488', demo: true },
  { id: 'u14', name: 'Rahel Bekele', title: 'Marketing & Sales Officer', role: 'sales', dept: 'Marketing & Sales', color: '#d97706', demo: true },
  { id: 'u15', name: 'Tigist Hailu', title: 'HR & Administration Officer', role: 'hr', dept: 'Administration & HR', color: '#be185d', demo: true },
  { id: 'u16', name: 'Biniam Tekle', title: 'Finance Officer', role: 'finance', dept: 'Finance', color: '#0369a1', demo: true },
  { id: 'u17', name: 'Biruk Alemayehu', title: 'Factory Manager – Kality', role: 'factory', dept: 'Operation', color: '#b45309', demo: true },
  { id: 'u19', name: 'Abel Mekonnen', title: 'Machine Operator – Jwell line', role: 'operator', dept: 'Operation', color: '#7c2d12', demo: true },
  { id: 'u20', name: 'Samrawit Dessie', title: 'Compounding & Mixing Operator', role: 'compounder', dept: 'Operation', color: '#166534', demo: true },
  { id: 'u18', name: 'Certification Body Auditor', title: 'External Auditor / Inspector (time-bound)', role: 'external', dept: 'External', color: '#475569', demo: true, expires: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10) },
];

// ---------------------------------------------------------------- organisation (from MN/WF/001 Issue 2, PO/WF/001, OF/WF/030, 039, 040)
const ORG = {
  name: 'WATER FIT GENERAL TRADING', short: 'Water Fit', abbr: 'WF', amharic: 'ዋተር ፊት ጄኔራል ትሬዲንግ',
  address: 'Mickyleyland Street, Bole Sub-City, Addis Ababa, Ethiopia',
  profile: 'A midsized manufacturer, supplier and distributor of water-work related products, with annual sales well over 35 million Ethiopian Birr.',
  standard: 'ISO 9001:2015', exclusion: 'Clause 8.3 Design and Development – WATER FIT does not design and develop its products or services.',
  manualIssue: 'Issue 2 · January 2025 – scope expansion: Single Wall Corrugated conduit & Drip Irrigation pipes',
  policy: 'Waterfit General Trading is committed to manufacture and provide quality plastic products that can satisfy all stakeholders at a timely manner by complying ISO 9001:2015 Quality Management System and other applicable requirements.',
  values: ['Quality', 'Competency', 'Timeliness', 'Cost-Effectiveness'],
  activities: ['Manufacturing of HDPE pipes, irrigation pipes and single wall corrugated pipes', 'Supply to water supply & irrigation projects', 'Sanitary fittings and commission agency', 'Retail roof and floor coverings', 'Butt-welding (fusion) services'],
  products: ['HDPE Pipes PN 4–25', 'Drip Irrigation Pipes (OD 16, 20, 25 mm)', 'Single Wall Corrugated Pipes (OD 16, 20, 25, 32 mm)', 'HDPE fittings', 'UPVC pipes & fittings (PN 10/12/16)', 'PVC pipes & fittings', 'PE / PP pressure pipes & fittings', 'UPVC & HDPE well casings and screens', 'Cast iron & cast steel valves', 'GI pipes & galvanized malleable fittings', 'Water meters', 'Steel casings'],
  structure: {
    name: 'General Manager', children: [{
      name: 'Deputy General Manager',
      staff: ['System & Planning', 'Management Assistant', 'Legal Advisor', 'Quality Assurance'],
      children: [
        { name: 'Procurement & Supply', children: [{ name: 'Procurement' }, { name: 'Materials Management' }] },
        { name: 'Marketing & Sales', children: [{ name: 'Marketing Team' }, { name: 'Sales Team' }] },
        { name: 'Operation', children: [{ name: 'Production', sub: 'Supervisors' }, { name: 'Technic', sub: 'Technicians' }, { name: 'Welding', sub: 'Project Manager' }] },
        { name: 'Administration & HR', children: [{ name: 'Human Resource Mgmt' }, { name: 'General Services' }] },
        { name: 'Finance', children: [{ name: 'General Accounts' }, { name: 'Cost & Budget' }] },
      ],
    }],
  },
  context: {
    strengths: ['Hard work for quality product, good customer handling and services', 'Honesty and professional competence', 'Respectful culture – a positive working place', 'Internationally certified, professional, well-educated skilled employees', 'Manufacturing HDPE, drip irrigation and single wall corrugated pipes with certified good quality'],
    external: [
      { f: 'Legal', o: 'Legally registered', t: 'Instability in the country, rapid policy changes' },
      { f: 'Technological', o: 'Computerized, time effective, one-window system (networking different working locations to one system)', t: 'Maintenance not available on time' },
      { f: 'Competitive', o: 'Profitable, able to stand by', t: '' },
      { f: 'Market', o: 'Few competing companies in pipe manufacturing', t: 'Delayed pipe production caused by raw material shortage' },
      { f: 'Cultural', o: 'Full acceptance', t: '' },
      { f: 'Social', o: 'Good acceptance, profit', t: '' },
      { f: 'Economic', o: '', t: 'Inflation, economic crash' },
    ],
  },
  parties: [
    { p: 'Clients', e: ['Good service & customer handling', 'Quality product', 'Price deflation'] },
    { p: 'Owners / Shareholders', e: ['Profitability', 'Big scope of work', 'Good employee performance & accountability'] },
    { p: 'Management', e: ['Good quality management system', 'Good work environment', 'Clear and effective work'] },
    { p: 'Employees', e: ['Salary increment', 'Good work environment', 'Recognition, reward, health & safety'] },
    { p: 'Suppliers & Service Providers', e: ['Continuous purchase orders', 'Agreements', 'Future company requests'] },
    { p: 'Government & Regulators', e: ['Tax compliance', 'Infrastructure & accountability', 'Trustworthiness'] },
    { p: 'Society', e: ['Work opportunity', 'Environmental protection', 'Infrastructure'] },
  ],
  processes: {
    management: ['Management Review', 'Continual Improvement'],
    core: ['Marketing & Sales', 'Planning', 'Production', 'Quality Assurance', 'Store'],
    support: ['Purchasing', 'Materials Management', 'Maintenance & Property', 'Finance', 'Human Resources'],
  },
  clauses: [
    ['4.1', 'Context of the organization', 'OF/WF/039'], ['4.2', 'Interested parties', 'OF/WF/040'], ['5.2', 'Quality policy', 'PO/WF/001'],
    ['5.3', 'Roles & organizational structure', 'OF/WF/030'], ['6.1', 'Risks & opportunities', 'OF/WF/037'], ['6.2', 'Quality objectives', 'OF/WF/027'],
    ['7.2', 'Competence & training', 'OP/WF/011'], ['7.1.5', 'Monitoring & measuring resources', 'OP/WF/041'], ['7.4', 'Communication', 'OP/WF/008'],
    ['7.5', 'Documented information', 'OP/WF/001 · 002'], ['8.2', 'Customer requirements', 'OP/WF/030'], ['8.4', 'Externally provided processes', 'OP/WF/027 · 028'],
    ['8.5', 'Production & service provision', 'OP/WF/034–037'], ['8.6', 'Release of products', 'OP/WF/040'], ['8.7', 'Nonconforming outputs', 'OP/WF/005'],
    ['9.1.2', 'Customer satisfaction', 'OP/WF/032'], ['9.2', 'Internal audit', 'OP/WF/003'], ['9.3', 'Management review', 'OP/WF/006'], ['10.2', 'Nonconformity & corrective action', 'OP/WF/004'],
  ],
  findings: [
    { sev: 'high', t: 'Quality objectives (OF/WF/027) not in the document set', d: 'Clause 6.2 requires measurable objectives; the manual references OF/WF/027 but no file exists.' },
    { sev: 'high', t: 'No document review interval defined', d: 'OP/WF/001 never states how often documents are re-reviewed. All procedures are still Issue 1 from 2020. The app uses a configurable 3-year cycle.' },
    { sev: 'medium', t: 'No CAPA / NCR closure time limit', d: 'OP/WF/004 & 005 say "within an agreed time frame". Due dates are set per action in the app.' },
    { sev: 'medium', t: 'Form number conflicts in system procedures', d: 'OP/WF/004 cites OF/WF/028 for CAPA (list says 017); OP/WF/003 cites 015 as planning input (planning form is 016); 017/018 both named "NCR".' },
    { sev: 'medium', t: 'Manual cross-references out of date', d: 'Customer satisfaction cited as OP/WF/025 (actually 032); context cited as OF/WF/031 and 039; interested parties cited as OP/WF/040 (is OF/WF/040); OP/WF/009 cited but not on master list.' },
    { sev: 'low', t: 'Duplicate form OF/WF/152', d: 'Two different customer feedback forms (Amharic recording form and bilingual questionnaire) share number 152.' },
    { sev: 'low', t: 'Annual audit programme never filled', d: 'OF/WF/014 (2020/2021) grid has no months marked. Only one IQA (01/2020, 14 Dec 2020) is evidenced.' },
    { sev: 'low', t: 'HR templates carry a foreign footer', d: 'Forms 093, 094, 103, 104, 106, 107 show "Gift Real Estate Plc" footer – adapted from another company.' },
  ],
  drcc: [
    ['01', 'Outgoing letters'], ['02', 'Incoming letters'], ['03', 'Report'], ['04', 'Plans / work schedules'], ['05', 'Minutes'], ['06', 'Bank statement'], ['07', 'Payment'],
    ['08', 'VAT declaration'], ['09', 'Z-report'], ['10', 'Sales'], ['11', 'Payroll'], ['12', 'Fixed asset'], ['13', 'Purchase order'], ['14', 'Suppliers & subcontractors list and evaluation'],
    ['15', 'Store requisition issue voucher'], ['16', 'Store receiving note'], ['17', 'Material issue note'], ['18', 'Legal case'], ['19', 'Agreements'], ['20', 'Procedures, work instructions & formats'],
    ['21', 'Loan'], ['22', 'Vacancy & applicants CV'], ['23', 'Personal file'], ['24', 'Discipline case'], ['25', 'Training need assessment'], ['26', 'Training schedule & attendance'],
    ['27', 'Training impact assessment'], ['28', 'Employee performance evaluation'], ['29', 'Job descriptions'], ['30', 'Machinery maintenance history'], ['31', 'Certificates of calibration'],
    ['32', 'Internal job order'], ['33', 'DOLCI parameter'], ['34', 'Daily activity'], ['35', 'Finished goods receiving note'], ['36', 'Finished goods transfer note'], ['37', 'Delivery note'],
    ['38', 'Production order transfer note'], ['39', 'Daily production report'], ['40', 'Inventory'], ['41', 'Weigh bridge report'], ['42', 'NOVAMEC parameter'], ['44', 'External documents'],
    ['45', 'Obsolete documents'], ['46', 'License'], ['47', 'Material specification'], ['55', 'Raw material requisition'], ['58', 'Production damage product report'], ['62', 'Preventive maintenance confirmation'], ['63', 'HDPE checklist'],
  ],
};

// ---------------------------------------------------------------- documents
const SKIP = (n) => n.startsWith('~') || n.startsWith('.') || /\.(tmp|zip|py)$/i.test(n);
function walk(dir) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP(e.name)) continue;
    const p = path.join(dir, e.name);
    out = e.isDirectory() ? out.concat(walk(p)) : out.concat(p);
  }
  return out;
}
const DEPT_FROM_FOLDER = {
  '1. Operation': 'Operation', '2. QA': 'Quality Assurance', '3. M&S': 'Marketing & Sales', '4. Admin': 'Administration & HR', '5. Finance': 'Finance', '6. P&S': 'Procurement & Supply',
  Operation: 'Operation', Purchasing: 'Procurement & Supply', 'A&HR': 'Administration & HR', 'M&S': 'Marketing & Sales', Finance: 'Finance',
};
const OWNER_BY_DEPT = { 'General Management': 'u1', 'Quality Assurance': 'u2', Operation: 'u5', 'Procurement & Supply': 'u6', 'Marketing & Sales': 'u7', Finance: 'u8', 'Administration & HR': 'u9' };
const pad = (n) => String(n).padStart(3, '0');
const tidy = (s) => s.replace(/[_]+/g, ' ').replace(/\s+/g, ' ').replace(/\s+\./g, '.').trim();
const titleCase = (s) => (s === s.toUpperCase() && /[A-Z]{3}/.test(s) ? s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : s);

let unnumbered = 0;
function classify(rel) {
  const parts = rel.split(path.sep);
  const name = parts[parts.length - 1];
  const stem = name.replace(/\.[^.]+$/, '').trim();
  const top = parts[0];
  let code, title = stem, type, dept = 'Quality Assurance', category, issue = 1, status = 'issued', effective = '2020-10-07', notes = '';

  let m;
  if ((m = stem.match(/^(MN|PO|OP|OF)-WF-(\d{3})[\s_]*(.*)$/i))) {
    type = m[1].toUpperCase(); code = `${type}/WF/${m[2]}`; title = m[3] || stem;
  } else if ((m = stem.match(/^OP-WF-(welding|contract formulation)/i))) {
    type = 'OP'; code = m[1].toLowerCase() === 'welding' ? 'OP/WF/045' : 'OP/WF/044'; title = m[1].toLowerCase() === 'welding' ? 'Welding Operation (Butt Fusion)' : 'Contract Formulation for Welding';
  } else if (/Health & Safety Policy for Covid/i.test(stem)) {
    type = 'OP'; code = 'OP/WF/046'; title = 'Health & Safety Policy for Covid-19 Prevention';
  } else if (/Anual Audit Program/i.test(stem)) {
    type = 'OF'; code = 'OF/WF/014'; title = 'Annual Internal Quality Audit Program';
  } else if (top === 'QMS TEMPLATES' && (m = stem.match(/^(\d{2,3})(?:-\d+)?\s*[-_ ]?\s*(.*)$/))) {
    type = 'OF'; code = `OF/WF/${pad(+m[1])}`; title = m[2] || stem;
  } else if (top === 'QMS TEMPLATES') {
    type = 'OF'; code = `OF/WF/U${String(++unnumbered).padStart(2, '0')}`; notes = 'No form number assigned – uncontrolled format';
  } else if (top === 'QMS Records') {
    type = 'REC';
    if (/Classification|Rec Class/i.test(stem)) { const d = stem.match(/Class\.?\s*(All final|HR|P& S|Operation|Finance)/i); code = `OF/WF/012-${d ? d[1].replace(/\W/g, '').toUpperCase().slice(0, 4) : 'GEN'}`; title = `Documents & Records Classification Index${d ? ' – ' + d[1].replace('All final', 'All departments').replace('P& S', 'P&S') : ''}`; }
    else if (/master list procedure/i.test(stem)) { code = 'OF/WF/004-A'; title = 'Master List of Documents (Procedures)'; }
    else if (/Formats final/i.test(stem)) { code = 'OF/WF/004-B'; title = 'Master List of Formats'; }
    else if (/IQA Plan/i.test(stem)) { code = 'OF/WF/016-01'; title = 'IQA Plan – Audit No. 01/2020'; effective = '2020-12-14'; }
    else if (/FITTING/i.test(stem)) { code = 'OF/WF/021-01'; title = 'Action Plan – Fitting Arrangement'; effective = '2020-01-21'; }
    else if (/fixed asset/i.test(stem)) { code = 'OF/WF/021-02'; title = 'Action Plan – Fixed Asset Identification & Coding'; effective = '2020-01-21'; }
    else if (/record Checklist/i.test(stem)) { code = 'REC/WF/001'; title = 'QMS Records Checklist'; }
    else { code = `REC/WF/${pad(++unnumbered + 100)}`; }
  } else {
    type = 'OF'; code = `OF/WF/U${String(++unnumbered).padStart(2, '0')}`;
  }

  // department & category
  if (top === 'QMS DOCUMENTS' && parts[1].startsWith('3-')) { dept = DEPT_FROM_FOLDER[parts[2]] || 'Operation'; category = 'Departmental Procedure'; }
  else if (top === 'QMS TEMPLATES') { dept = DEPT_FROM_FOLDER[parts[2]] || 'Quality Assurance'; category = 'Format'; }
  else if (type === 'MN') { dept = 'General Management'; category = 'Quality Manual'; }
  else if (type === 'PO') { dept = 'General Management'; category = 'Policy'; }
  else if (type === 'OP') { category = 'System Procedure'; }
  else if (type === 'OF') { category = 'Format'; if (/030|039|040/.test(code)) dept = 'General Management'; }
  else { category = 'Record'; if (/Finance/i.test(title)) dept = 'Finance'; else if (/HR/.test(code)) dept = 'Administration & HR'; else if (/OPER/.test(code)) dept = 'Operation'; else if (/PS/.test(code) || /Fitting|Fixed Asset/i.test(title)) dept = 'Procurement & Supply'; }

  // special cases from the 2026 DOCUMENTS folder
  if (top === 'DOCUMENTS' && type === 'MN') { issue = 2; effective = '2025-01-22'; title = 'Quality Manual'; }
  if (top === 'QMS DOCUMENTS' && type === 'MN') { title = 'Quality Manual'; }
  if (/\(Draft\)/i.test(stem)) { status = 'approval'; effective = ''; notes = 'Draft awaiting GM approval'; }
  if (/\(Final Draft\)/i.test(stem)) { status = 'review'; effective = ''; notes = 'Final draft – requester review'; }
  title = titleCase(tidy(title.replace(/\((Final )?Draft\)/i, '')).replace(/^\d+\s+/, ''));
  if (code === 'OP/WF/040') title = 'Testing';
  if (code === 'OF/WF/039') title = 'Context of the Organization';
  if (code === 'OF/WF/040') title = "Interested Parties' Requirements";
  return { code, title, type, dept, category, issue, status, effective, notes, top };
}

const docsByKey = new Map();
let fileCount = 0;
for (const top of ['QMS DOCUMENTS', 'QMS TEMPLATES', 'QMS Records', 'DOCUMENTS']) {
  const base = path.join(QMS_ROOT, top);
  if (!fs.existsSync(base)) continue;
  for (const full of walk(base)) {
    const rel = path.relative(QMS_ROOT, full);
    const ext = path.extname(full).slice(1).toLowerCase();
    const c = classify(rel);
    fileCount++;
    const h = hash(rel);
    // previews + text (macOS textutil); cached
    if (/^docx?$/.test(ext)) {
      const pv = path.join(PREV, h + '.html'), tx = path.join(TEXT, h + '.txt');
      try { if (!fs.existsSync(pv)) execFileSync('textutil', ['-convert', 'html', '-output', pv, full]); } catch (_) {}
      try { if (!fs.existsSync(tx)) execFileSync('textutil', ['-convert', 'txt', '-output', tx, full]); } catch (_) {}
    }
    const stat = fs.statSync(full);
    const rev = {
      issue: c.issue, file: rel, ext, size: stat.size, preview: /^docx?$/.test(ext) ? h : null,
      status: c.status === 'issued' ? 'current' : 'draft', effective: c.effective,
      approvedBy: c.status === 'issued' ? 'u1' : null, change: c.issue === 1 ? 'Initial release' : 'Scope expansion & addition of new line: Single Wall Corrugated conduit & Drip Irrigation pipes',
    };
    const key = c.code + '|' + (c.code === 'OF/WF/152' ? c.title : '');
    const existing = docsByKey.get(key);
    if (existing) {
      // merge as another issue (e.g. Quality Manual Issue 1 → Issue 2; duplicate audit programme copy)
      if (rev.issue > existing.issue) {
        existing.revisions.forEach((r) => { if (r.status === 'current') { r.status = 'superseded'; } });
        existing.revisions.unshift(rev); existing.issue = rev.issue; existing.effective = rev.effective; existing.title = c.title;
      } else if (rev.issue < existing.issue) {
        rev.status = 'superseded'; existing.revisions.push(rev);
      } else { existing.copies = (existing.copies || 1) + 1; }
      continue;
    }
    docsByKey.set(key, {
      code: c.code, title: c.title, type: c.type, category: c.category, department: c.dept,
      owner: c.type === 'OP' && c.category === 'System Procedure' ? 'u2' : OWNER_BY_DEPT[c.dept] || 'u2',
      issue: c.issue, status: c.status, effective: c.effective, notes: c.notes, language: 'English / Amharic',
      revisions: [rev],
    });
  }
}
const DEPT_LIST = ['General Management', 'Quality Assurance', 'Operation', 'Procurement & Supply', 'Marketing & Sales', 'Administration & HR', 'Finance'];
const documents = [...docsByKey.values()]
  .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }))
  .map((d, i) => {
    const id = 'D' + String(i + 1).padStart(4, '0');
    const dist = d.category.includes('Procedure') && d.department === 'Quality Assurance' || ['MN', 'PO'].includes(d.type) ? DEPT_LIST : [...new Set([d.department, 'Quality Assurance'])];
    const issued = d.status === 'issued';
    const history = [];
    d.revisions.slice().reverse().forEach((r) => {
      if (r.effective) history.push({ at: r.effective + 'T09:00:00.000Z', by: 'u1', action: `Issue ${r.issue} approved & issued`, tone: 'green', note: r.change });
    });
    if (!issued) history.push({ at: ts(-12), by: 'u2', action: d.status === 'approval' ? 'Submitted for GM approval (OF/WF/002)' : 'Draft submitted for requester review', tone: 'blue' });
    history.push({ at: ts(-3, 8), by: 'u2', action: 'Imported into QMS system from document folder', tone: 'gray' });
    return {
      id, ...d, history: history.reverse(),
      distribution: dist.map((dep, k) => ({ dept: dep, copy: k + 1, ack: issued && !(d.issue === 2 && k > 3), ackAt: issued ? (d.effective || '2020-10-07') : null })),
      comments: [],
    };
  });
// A few realistic in-flight document changes
const byCode = (c) => documents.find((d) => d.code === c);
const flag = (c, patch, hist) => { const d = byCode(c); if (d) { Object.assign(d, patch); if (hist) d.history.unshift(hist); } };
flag('OP/WF/004', { status: 'drafting', pendingIssue: 2, notes: 'Revision to fix form references (OF/WF/017 vs 028)' }, { at: ts(-6), by: 'u2', action: 'Revision Issue 2 started – drafting', tone: 'amber', note: 'Correct CAPA form reference and add closure time limits.' });
flag('OP/WF/041', { status: 'requested', pendingIssue: 2, notes: 'Add calibration intervals per instrument' }, { at: ts(-2), by: 'u4', action: 'Change request raised (OF/WF/001)', tone: 'gray', note: 'Procedure gives no calibration interval – propose 12 months for gauges, 6 months for pressure test rig.' });

// ---------------------------------------------------------------- gap fixes (drafts for management approval)
require('./lib/fixes')({ documents, ORG, DATA, UP: path.join(__dirname, 'uploads'), ts, day });

// ---------------------------------------------------------------- full-text index
const fulltext = {};
for (const d of documents) {
  const cur = d.revisions[0];
  if (cur.preview) {
    const tx = path.join(TEXT, cur.preview + '.txt');
    if (fs.existsSync(tx)) fulltext[d.id] = fs.readFileSync(tx, 'utf8').replace(/\s+/g, ' ').slice(0, 60000);
  }
}

// ---------------------------------------------------------------- module records (demo operational data on real products/machines/customers)
let seq = {};
const year = today.getFullYear();
const mk = (mod, prefix, created, data, hist = []) => {
  seq[mod] = (seq[mod] || 0) + 1;
  return {
    id: `${mod}-${seq[mod]}`, code: `${prefix}-${year}-${pad(seq[mod])}`, created: ts(created), createdBy: data.createdBy || 'u2',
    ...data, comments: data.comments || [], attachments: [], links: data.links || [],
    history: [...hist, { at: ts(created), by: data.createdBy || 'u2', action: 'Created', tone: 'gray' }],
  };
};
const H = (off, by, action, tone = 'blue', note) => ({ at: ts(off), by, action, tone, note });

const ncr = [
  mk('ncr', 'NCR', -3, { title: 'Wall thickness below minimum on 110mm PN10 coils', product: 'HDPE Pipe PN10', stage: 'In process', batch: 'PO-2026-1184 / DOLCI 01 night shift', qty: '14 coils (1,400 m)', department: 'Operation', owner: 'u5', description: 'Measured 6.1 mm vs 6.6 mm minimum at 3 o’clock position; sizing sleeve vacuum low.', status: 'evaluation', createdBy: 'u4' },
    [H(-2, 'u4', 'Registered in NC log', 'amber'), H(-1, 'u5', 'Evaluation started', 'amber')]),
  mk('ncr', 'NCR', -9, { title: 'Printing illegible on drip irrigation laterals', product: 'Drip Irrigation Pipe', stage: 'Final inspection', batch: 'PO-2026-1171', qty: '38 rolls', department: 'Operation', owner: 'u11', description: 'Ink ribbon misaligned; product marking (size, PN, date, WF) unreadable on 30% of length.', disposition: 'Rework', status: 'disposition', createdBy: 'u4' },
    [H(-8, 'u4', 'Registered in NC log', 'amber'), H(-7, 'u5', 'Disposition decided: Rework', 'blue')]),
  mk('ncr', 'NCR', -21, { title: 'Supplier resin batch with high moisture', product: 'Raw Material (HDPE resin)', stage: 'Incoming material', batch: 'GRV-0932', qty: '8 tonnes', department: 'Procurement & Supply', owner: 'u6', description: 'Bubbles in extrudate; moisture test above supplier COA.', disposition: 'Concession (customer agreed)', verification: 'Dried 4h at 80°C before use; trial run passed visual & dimensional checks.', status: 'closed', createdBy: 'u4', links: [{ mod: 'capa', id: 'capa-3' }] },
    [H(-20, 'u4', 'Registered in NC log', 'amber'), H(-18, 'u6', 'Disposition: dry & use', 'blue'), H(-14, 'u4', 'Verified', 'teal'), H(-13, 'u2', 'Closed', 'green')]),
  mk('ncr', 'NCR', -1, { title: 'Ovality out of tolerance on 250mm PN16 – coiling', product: 'HDPE Pipe PN16', stage: 'Final inspection', batch: 'PO-2026-1190 / JWELL 02', qty: '6 lengths', department: 'Operation', owner: 'u5', status: 'reported', createdBy: 'u11' }),
  mk('ncr', 'NCR', -34, { title: 'Weld bead height insufficient – site joint', product: 'Butt-fusion Weld Joint', stage: 'After delivery (customer)', batch: 'Welding contract WC-07', qty: '3 joints', department: 'Operation', owner: 'u5', description: 'Data-log shows heat-soak time short; ambient below 5°C with wind.', disposition: 'Rework', verification: 'Joints cut and re-welded with wind shelter; data-log approved.', status: 'closed', createdBy: 'u4' },
    [H(-33, 'u4', 'Registered', 'amber'), H(-30, 'u5', 'Rework', 'blue'), H(-27, 'u4', 'Verified', 'teal'), H(-26, 'u2', 'Closed', 'green')]),
  mk('ncr', 'NCR', -48, { title: 'Corrugated pipe crushed during loading', product: 'Single Wall Corrugated Pipe', stage: 'At delivery', batch: 'DN-5521', qty: '120 m', department: 'Procurement & Supply', owner: 'u12', disposition: 'Discard / Crush for recycling', verification: 'Crushed and returned to FPS as regrind (OP/WF/037).', status: 'closed', createdBy: 'u12' }, [H(-45, 'u2', 'Closed', 'green')]),
];

const capa = [
  mk('capa', 'CAPA', -19, { title: 'Prevent moisture-related defects from resin deliveries', type: 'Corrective (NC)', source: 'Product nonconformity', department: 'Procurement & Supply', owner: 'u6', due: day(9), correction: 'Batch dried before use.', rootCause: 'No incoming moisture check; resin stored outdoors under tarpaulin at supplier and at WF yard.', actionPlan: '1) Add moisture test to GRV inspection. 2) Covered resin store. 3) Notify supplier & add to evaluation.', status: 'implementing', links: [{ mod: 'ncr', id: 'ncr-3' }] },
    [H(-17, 'u6', 'Root cause analysis', 'amber'), H(-12, 'u6', 'Action plan submitted', 'blue'), H(-10, 'u6', 'Implementation started', 'blue')]),
  mk('capa', 'CAPA', -40, { title: 'Calibration records missing for 2 pressure gauges', type: 'Corrective (NC)', source: 'Internal audit', department: 'Quality Assurance', owner: 'u4', due: day(-6), rootCause: 'No reminder system; calibration card not updated after outsourced calibration.', actionPlan: 'Register all instruments in QMS calibration module with due-date alerts.', status: 'verification' },
    [H(-35, 'u4', 'Root cause analysis', 'amber'), H(-30, 'u4', 'Action plan submitted', 'blue'), H(-20, 'u4', 'Implementation', 'blue'), H(-4, 'u4', 'Verification requested', 'violet')]),
  mk('capa', 'CAPA', -60, { title: 'Supplier moisture control (raised from audit)', type: 'Preventive (PNC)', source: 'Monitoring discrepancy', department: 'Procurement & Supply', owner: 'u6', due: day(-25), rootCause: 'Supplier storage', actionPlan: 'Supplier agreement updated', effectiveness: 'No recurrence in 3 deliveries.', status: 'closed' }, [H(-28, 'u2', 'Cleared & closed', 'green')]),
  mk('capa', 'CAPA', -5, { title: 'Late deliveries to NGO projects', type: 'Corrective (NC)', source: 'Customer complaint / feedback', department: 'Marketing & Sales', owner: 'u7', due: day(25), status: 'rca', links: [{ mod: 'complaints', id: 'complaints-1' }] }, [H(-4, 'u7', 'Root cause analysis started', 'amber')]),
  mk('capa', 'CAPA', -2, { title: 'Preventive maintenance plan (OF/WF/067) not followed for NOVAMEC 03', type: 'Preventive (PNC)', source: 'Recurring problem', department: 'Operation', owner: 'u10', due: day(14), status: 'raised', createdBy: 'u5' }),
  mk('capa', 'CAPA', -14, { title: 'Quality objectives not defined (clause 6.2)', type: 'Corrective (NC)', source: 'Management review', department: 'General Management', owner: 'u2', due: day(-2), rootCause: 'OF/WF/027 never issued after 2020 task force.', actionPlan: 'Draft measurable objectives per process with KPI matrix (OF/WF/038); GM approval.', status: 'planned' }, [H(-10, 'u2', 'Action plan submitted', 'blue')]),
];

const complaints = [
  mk('complaints', 'CC', -6, { customer: 'UNICEF', title: 'Delivery of 63mm PN10 pipes 9 days late for WASH project', channel: 'Email', category: 'Delivery', orderRef: 'INV-2026-0412', department: 'Marketing & Sales', owner: 'u7', details: 'Project site in Afar delayed; customer requests revised schedule commitment.', status: 'action', links: [{ mod: 'capa', id: 'capa-4' }] },
    [H(-5, 'u2', 'Registered (CAR register)', 'amber'), H(-4, 'u7', 'Classified: Delivery', 'amber'), H(-4, 'u2', 'CPA requested (OF/WF/019)', 'blue')]),
  mk('complaints', 'CC', -2, { customer: 'Ethio Global Construction', title: 'Fitting leakage at 90mm electrofusion joint', channel: 'Site visit', orderRef: 'INV-2026-0438', department: 'Operation', owner: 'u5', status: 'registered' }),
  mk('complaints', 'CC', -27, { customer: 'World Vision', title: 'Coil length short by 4 m on 100 m coils', channel: 'Phone', category: 'Non-conforming product', orderRef: 'INV-2026-0367', department: 'Operation', owner: 'u5', resolution: 'Credit note issued; meter counter recalibrated.', status: 'closed' }, [H(-20, 'u7', 'Customer informed', 'teal'), H(-18, 'u2', 'Closed', 'green')]),
  mk('complaints', 'CC', -15, { customer: 'Water-Aid', title: 'Store keeper customer handling at loading', channel: 'In person', category: 'Service', department: 'Procurement & Supply', owner: 'u6', resolution: 'Apology issued; customer-handling training scheduled for store staff.', status: 'informed' }, [H(-10, 'u6', 'Customer informed', 'teal')]),
  mk('complaints', 'CC', -44, { customer: 'Botor Construction', title: 'Invoice price differs from proforma', channel: 'Letter', category: 'Other', department: 'Finance', owner: 'u8', resolution: 'Corrected invoice issued.', status: 'closed' }, [H(-40, 'u2', 'Closed', 'green')]),
];

const audits = [
  mk('audits', 'IQA', -700, { title: 'IQA 01/2020 – All departments & top management', department: 'Quality Assurance', clauses: 'All ISO 9001:2015 clauses – all processes', leader: 'u3', date: '2020-12-14', objectives: 'Verify compliance with ISO 9001:2015. Auditors: Meseret Alemu, Feleke, Getachew, Addisalem Bekele.', findings: 'Historical audit imported from IQA Plan 01/2020.', majorNc: 0, observations: 0, conclusion: 'Imported historical record – report not in document set.', status: 'closed' }),
  mk('audits', 'IQA', -70, { title: 'IQA 01/2026 – Operation (Production, Technic, Welding)', department: 'Operation', clauses: '7.1.5, 8.5, 8.6, 8.7', leader: 'u3', date: day(-62), objectives: 'Production control, NCP control, calibration, maintenance.', findings: '2 NCs: calibration records missing (2 gauges); PM checklist OF/WF/069 not filled for NOVAMEC 03. 3 observations.', majorNc: 2, observations: 3, conclusion: 'System effective with exceptions; CAPAs raised.', status: 'followup', links: [{ mod: 'capa', id: 'capa-2' }, { mod: 'capa', id: 'capa-5' }] }),
  mk('audits', 'IQA', -40, { title: 'IQA 02/2026 – Procurement & Supply', department: 'Procurement & Supply', clauses: '8.4, 7.1.3, 8.5.4', leader: 'u3', date: day(-33), objectives: 'Purchasing, supplier evaluation, store control.', findings: '1 NC: supplier evaluation sheet not updated for resin supplier.', majorNc: 1, observations: 2, conclusion: 'Effective.', status: 'closed' }),
  mk('audits', 'IQA', -10, { title: 'IQA 03/2026 – Marketing & Sales', department: 'Marketing & Sales', clauses: '8.2, 9.1.2', leader: 'u3', date: day(4), objectives: 'Sales, complaint handling and satisfaction monitoring.', status: 'distributed' }),
  mk('audits', 'IQA', -5, { title: 'IQA 04/2026 – Finance', department: 'Finance', clauses: '7.5, 8.2.1', leader: 'u2', date: day(18), status: 'planned' }),
  mk('audits', 'IQA', -5, { title: 'IQA 05/2026 – Administration & HR', department: 'Administration & HR', clauses: '7.1.2, 7.2, 7.3', leader: 'u3', date: day(32), status: 'planned' }),
  mk('audits', 'IQA', -5, { title: 'IQA 07/2026 – Quality Assurance', department: 'Quality Assurance', clauses: '7.1.5, 8.6, 8.7, 9.1', leader: 'u6', date: day(55), status: 'planned' }),
  mk('audits', 'IQA', -5, { title: 'IQA 06/2026 – Top management & MR', department: 'General Management', clauses: '4, 5, 6, 9.3, 10', leader: 'u3', date: day(-8), status: 'planned' }),
];

const reviews = [
  mk('reviews', 'MRM', -150, { title: 'Management Review 01/2026', type: 'Management Review', date: day(-148), chair: 'u1', department: 'General Management', inputs: ['Status of previous actions', 'Customer satisfaction & feedback', 'Process performance & product conformity', 'Nonconformities & corrective actions', 'Audit results', 'Adequacy of resources'], attendance: '9 of 11 members (82%)', minutes: 'Decided: define quality objectives (CAPA), procure 2nd chiller, start supplier re-evaluation.', status: 'closed' }, [H(-140, 'u2', 'Minutes circulated', 'violet'), H(-60, 'u1', 'Closed', 'green')]),
  mk('reviews', 'MRM', -12, { title: 'Management Review 02/2026', type: 'Management Review', date: day(6), chair: 'u1', department: 'General Management', inputs: ['Status of previous actions', 'Audit results', 'Nonconformities & corrective actions', 'Customer satisfaction & feedback', 'External provider performance'], status: 'notified' }, [H(-8, 'u1', 'GM approved – agenda circulated', 'blue')]),
  mk('reviews', 'MRM', -20, { title: 'Operation weekly production meeting', type: 'Department meeting', date: day(-18), chair: 'u5', department: 'Operation', attendance: '7 of 8', minutes: 'Raw material shortage risk for December; plan reduced on JWELL 02.', status: 'minutes' }),
];

const training = [
  mk('training', 'TRN', -30, { title: 'ISO 9001:2015 internal auditor refresher', need: 'CAPA / audit finding', department: 'Quality Assurance', trainer: 'External – DQS Ethiopia', date: day(-21), participants: 6, venue: 'Head office meeting room', traineeScore: 4, status: 'evaluated' }),
  mk('training', 'TRN', -20, { title: 'Butt-fusion welding parameters & data-log reading', need: 'Competency matrix gap', department: 'Operation', trainer: 'Kidus Wolde', date: day(-10), participants: 9, venue: 'Factory – welding bay', traineeScore: 5, status: 'evaluated' }),
  mk('training', 'TRN', -8, { title: 'Customer handling for store keepers', need: 'CAPA / audit finding', department: 'Procurement & Supply', trainer: 'A&HR', date: day(12), participants: 5, status: 'approved' }),
  mk('training', 'TRN', -3, { title: 'HDPE machine setup checklist (OF/WF/053) for new operators', need: 'New employee induction', department: 'Operation', trainer: 'Hanna Girma', date: day(20), status: 'requested', createdBy: 'u5' }),
  mk('training', 'TRN', -200, { title: 'Fire safety & first aid', need: 'Training needs assessment', department: 'Administration & HR', trainer: 'Addis Ababa Fire & Emergency', date: day(-190), participants: 24, traineeScore: 4, effectiveness: 'Supervisors confirm drill response improved; 2 fire marshals appointed.', status: 'closed' }),
];

const instruments = [
  ['Digital caliper 0–300 mm', 'Quality Control', 'Outsourced (authorized body)', 12, -300, 'Conforming'], ['Ultrasonic wall thickness gauge', 'Quality Control', 'Outsourced (authorized body)', 12, -340, 'Conforming'],
  ['Pressure gauge – hydrostatic test rig', 'Quality Control', 'Outsourced (authorized body)', 6, -200, 'Adjusted'], ['Pressure gauge – DOLCI 01 melt', 'Double Screw 1', 'In-house', 6, -150, 'Conforming'],
  ['Temperature controller – JWELL 02 barrel', 'Double Screw 2', 'In-house', 12, -100, 'Conforming'], ['Weigh bridge 60 t', 'Store / Gate', 'Outsourced (authorized body)', 12, -380, 'Conforming'],
  ['Platform scale 300 kg', 'Compound', 'Outsourced (authorized body)', 12, -90, 'Conforming'], ['Measuring tape 100 m', 'Quality Control', 'In-house', 12, -30, 'Conforming'],
  ['Thermometer – chiller', 'Chiller', 'In-house', 12, -20, 'Conforming'], ['Pressure gauge – compressor', 'Compressor', 'In-house', 12, -400, 'Conforming'],
];
const addMonths = (off, m) => { const d = new Date(today.getTime() + off * 86400000); d.setMonth(d.getMonth() + m); return iso(d); };
const calibration = instruments.map(([title, location, method, interval, last, result], i) => {
  const due = addMonths(last, interval);
  const st = i === 9 ? 'quarantine' : i === 5 ? 'out' : 'active';
  return mk('calibration', 'EQ', -400, { title, serial: `WF-QC-${pad(i + 1)}`, location, range: '', department: 'Quality Assurance', method, interval, lastCal: day(last), due, result, status: st, createdBy: 'u4' });
});

const maintenance = [
  mk('maintenance', 'WO', -1, { title: 'Vacuum pump failure – sizing tank', kind: 'Breakdown', machine: 'DOLCI 01 – HDPE extrusion line', department: 'Operation', owner: 'u10', due: day(1), downtime: 6, cause: 'Pump bearing seized; low vacuum caused thickness NCR.', status: 'inprogress', createdBy: 'u11', links: [{ mod: 'ncr', id: 'ncr-1' }] }, [H(-1, 'u5', 'Technician assigned', 'amber')]),
  mk('maintenance', 'WO', -4, { title: 'Weekly PM – gear box oil, heaters, inverter (OF/WF/067)', kind: 'Preventive', machine: 'JWELL 02 – HDPE extrusion line', department: 'Operation', owner: 'u10', due: day(-1), downtime: 2, actionTaken: 'Checks 01, 03, 34, 35, 40 done; oil topped up.', status: 'verify' }),
  mk('maintenance', 'WO', -9, { title: 'Chiller low cooling – refrigerant leak', kind: 'Breakdown', machine: 'Chiller', department: 'Operation', owner: 'u10', downtime: 14, cause: 'Leak at condenser joint', actionTaken: 'Brazed joint, recharged gas.', status: 'closed' }),
  mk('maintenance', 'WO', -2, { title: 'Daily PM – NOVAMEC 03 water filter & temperature', kind: 'Preventive', machine: 'NOVAMEC 03 – extrusion line', department: 'Operation', due: day(0), status: 'requested', createdBy: 'u5' }),
  mk('maintenance', 'WO', -16, { title: 'Compressor oil change', kind: 'Preventive', machine: 'Compressor', department: 'Operation', owner: 'u10', downtime: 1, actionTaken: 'Oil changed (check 57).', status: 'closed' }),
  mk('maintenance', 'WO', -25, { title: 'Crusher blade replacement', kind: 'Breakdown', machine: 'Crushing machine', department: 'Operation', owner: 'u10', downtime: 8, actionTaken: 'Blades replaced and sharpened set stored.', status: 'closed' }),
];

const supplierRows = [
  ['Ethiopian Petrochemical Imports (HDPE PE100)', 'HDPE resin / raw material', 'Foreign', [4, 3, 3, 3, 4, 3, 5], 'approved'],
  ['Addis Masterbatch Industries', 'Masterbatch & additives', 'Local', [4, 4, 4, 4, 4, 3, 4], 'approved'],
  ['Sino Extrusion Spares Co.', 'Spare parts', 'Foreign', [3, 2, 2, 2, 3, 2, 4], 'conditional'],
  ['Bole Packaging PLC', 'Packaging', 'Local', [4, 3, 4, 5, 4, 3, 4], 'approved'],
  ['National Metrology Institute of Ethiopia', 'Calibration services', 'Local', [3, 2, 3, 3, 5, 3, 5], 'approved'],
  ['Merkato Logistics', 'Transport / logistics', 'Local', [4, 3, 3, 2, 2, 3, 2], 'evaluation'],
  ['Gulf Resin Trading FZE', 'HDPE resin / raw material', 'Foreign', [5, 4, 2, 2, 2, 2, 3], 'suspended'],
];
const suppliers = supplierRows.map(([title, category, origin, s, status]) => mk('suppliers', 'SUP', -120, { title, category, origin, department: 'Procurement & Supply', sPrice: s[0], sDiscount: s[1], sShipping: s[2], sDelivery: s[3], sReliability: s[4], sReciprocity: s[5], sQuality: s[6], status, createdBy: 'u6' }));

const inspections = [
  mk('inspections', 'QI', -1, { title: 'PO-2026-1190 · 250mm PN16 · JWELL 02', product: 'HDPE Pipe PN16', size: '250', line: 'JWELL 02 / Day', department: 'Quality Assurance', tests: ['Visual & surface finish', 'Outside diameter', 'Wall thickness', 'Ovality'], samples: 3, status: 'testing', createdBy: 'u4' }),
  mk('inspections', 'QI', -2, { title: 'PO-2026-1188 · 63mm PN10 · DOLCI 01', product: 'HDPE Pipe PN10', size: '63', line: 'DOLCI 01 / Day', department: 'Quality Assurance', tests: ['Visual & surface finish', 'Outside diameter', 'Wall thickness', 'Ovality', 'Length', 'Marking / printing', 'Hydrostatic pressure'], samples: 5, result: 'Pass', remarks: 'OD 63.2, e 3.9 mm; 1h hydrostatic test passed.', status: 'released', createdBy: 'u4' }),
  mk('inspections', 'QI', -3, { title: 'PO-2026-1184 · 110mm PN10 · DOLCI 01', product: 'HDPE Pipe PN10', size: '110', line: 'DOLCI 01 / Night', department: 'Quality Assurance', tests: ['Wall thickness', 'Outside diameter'], samples: 4, result: 'Fail', remarks: 'Wall 6.1 mm < 6.6 mm min.', status: 'rejected', createdBy: 'u4', links: [{ mod: 'ncr', id: 'ncr-1' }] }),
  mk('inspections', 'QI', -4, { title: 'PO-2026-1179 · 16mm drip lateral', product: 'Drip Irrigation Pipe', size: '16', line: 'Drip line / Day', department: 'Quality Assurance', tests: ['Visual & surface finish', 'Outside diameter', 'Marking / printing'], samples: 6, result: 'Pass', status: 'released', createdBy: 'u4' }),
  mk('inspections', 'QI', -5, { title: 'PO-2026-1176 · 32mm SWC conduit', product: 'Single Wall Corrugated Pipe', size: '32', line: 'Corrugated line', department: 'Quality Assurance', tests: ['Visual & surface finish', 'Outside diameter', 'Length'], samples: 4, result: 'Pass', status: 'review', createdBy: 'u4' }),
  mk('inspections', 'QI', -6, { title: 'PO-2026-1171 · 20mm drip lateral', product: 'Drip Irrigation Pipe', size: '20', line: 'Drip line / Night', department: 'Quality Assurance', tests: ['Marking / printing'], samples: 5, result: 'Fail', remarks: 'Marking illegible.', status: 'rejected', createdBy: 'u4', links: [{ mod: 'ncr', id: 'ncr-2' }] }),
  mk('inspections', 'QI', 0, { title: 'PO-2026-1192 · 90mm PN6', product: 'HDPE Pipe PN6', size: '90', line: 'DOLCI 01 / Day', department: 'Quality Assurance', status: 'planned', createdBy: 'u4' }),
];

const customers = [['UNICEF', 'NGO / International'], ['World Vision', 'NGO / International'], ['Water-Aid', 'NGO / International'], ['Ethio Global Construction', 'Construction contractor'], ['Botor Construction', 'Construction contractor'], ['CGC Overseas Construction Group', 'Construction contractor'], ['Lvia', 'NGO / International'], ['Inter-Aid France', 'NGO / International'], ['German Agro', 'Farmer / irrigation'], ['Ashkir General Construction', 'Construction contractor']];
const satisfaction = customers.map(([customer, segment], i) => {
  const r = (b) => Math.max(1, Math.min(4, b + ((i * 7 + b) % 3) - 1));
  return mk('satisfaction', 'CSS', -40 + i, { customer, segment, title: `Annual survey ${year}`, date: day(-40 + i), department: 'Marketing & Sales', q1: r(3), q2: r(3), q3: r(i === 2 ? 1 : 3), q4: r(4), q5: r(i < 3 ? 2 : 3), q6: r(3), q7: r(2), recommend: i % 4 === 3 ? 'Maybe' : 'Yes', comments: i === 0 ? 'Improve delivery commitment for remote project sites.' : '', status: i < 6 ? 'analysed' : 'collected', createdBy: 'u7' });
});

const recCat = (c, yrs) => ({ c, yrs });
const records = [
  ['Personal files – permanent staff', 'HR', '23', 'Employee files', 'Administration & HR', 'Confidential (access via OF/WF/006)', null],
  ['Payment vouchers 2025', 'FN', '07', 'Financial records', 'Finance', 'Confidential (access via OF/WF/006)', 10],
  ['Purchase orders 2025', 'PS', '13', 'Purchasing records', 'Procurement & Supply', 'Internal', 3],
  ['Internal audit reports', 'QA', '03', 'Audit reports', 'Quality Assurance', 'Internal', 3],
  ['Calibration certificates', 'OP', '31', 'QMS records', 'Operation', 'Internal', 3],
  ['Machinery maintenance history cards', 'OP', '30', 'Operational records', 'Operation', 'Internal', 3],
  ['Daily production reports 2026', 'OP', '39', 'Operational records', 'Operation', 'Internal', 3],
  ['Incoming letters 2026', 'GM', '02', 'Outgoing & incoming letters', 'General Management', 'Internal', 3],
  ['Obsolete documents', 'QA', '45', 'QMS documents', 'Quality Assurance', 'Internal', 3],
  ['External documents (ISO 9001:2015 – EX/WF/001)', 'QA', '44', 'External documents', 'Quality Assurance', 'Internal', 3],
  ['Store receiving notes 2021', 'PS', '16', 'Store records', 'Procurement & Supply', 'Internal', 3],
  ['Legal case – contract dispute', 'GM', '18', 'Outgoing & incoming letters', 'General Management', 'Confidential (access via OF/WF/006)', 3],
].map(([title, dk, cls, category, department, confidential, yrs], i) => {
  const yr = i === 10 ? 2021 : i === 1 || i === 2 ? 2025 : year;
  const opened = `${yr}-01-0${(i % 8) + 1}`;
  const retainUntil = yrs ? `${yr + yrs}-12-31` : '';
  const status = i === 10 ? 'disposal' : i === 2 ? 'closed' : 'active';
  return mk('records', 'FILE', -100, { title, fileCode: `${dk}/${cls}/${pad(i + 1)}/${yr}`, category, department, medium: i % 3 === 0 ? 'Hard copy + electronic backup' : 'Hard copy', location: `${department} office – cabinet ${(i % 4) + 1}`, confidential, opened, retainUntil: retainUntil || 'Lifetime (employee files)', legalHold: i === 11 ? 'Yes – legal case pending' : 'No', status });
});

const all = { ncr, capa, complaints, audits, reviews, training, calibration, maintenance, suppliers, inspections, satisfaction, records };
Object.assign(all, require('./lib/seed2')({ mk, H, day }));
// NCR classification for sample NCRs; CAPA root-cause sample
all.ncr.forEach((r, i) => { r.classification = r.classification || (i % 5 === 0 ? 'Major non-conformity' : i % 7 === 3 ? 'Opportunity for improvement (OFI)' : 'Minor non-conformity'); });
all.complaints.forEach((r, i) => { r.priority = r.priority || ['High', 'Medium', 'Low', 'Critical'][i % 4]; });

// spread creation over the year for trend charts (historic closed items)
const hist = [];
for (let m = 11; m >= 1; m--) {
  const n = [3, 2, 4, 2, 3, 5, 2, 3, 4, 2, 3][m - 1];
  for (let k = 0; k < n; k++) hist.push({ mod: k % 3 === 0 ? 'complaints' : k % 2 ? 'capa' : 'ncr', off: -m * 30 - k * 4 });
}
const histTitles = { ncr: ['Surface scratches on coils', 'Diameter oversize 32mm', 'Colour streaks – masterbatch', 'Wrong PN printed'], capa: ['Operator skipped setup checklist', 'Store FIFO not applied', 'Late PM on chiller', 'Supplier COA missing'], complaints: ['Late delivery', 'Coil length short', 'Damaged on arrival', 'Invoice error'] };
hist.forEach(({ mod, off }, i) => {
  const t = histTitles[mod][i % 4];
  const base = { title: t, department: ['Operation', 'Procurement & Supply', 'Marketing & Sales'][i % 3], owner: ['u5', 'u6', 'u7'][i % 3], status: 'closed' };
  if (mod === 'ncr') Object.assign(base, { product: ['HDPE Pipe PN10', 'Drip Irrigation Pipe', 'HDPE Pipe PN16'][i % 3], stage: 'Final inspection', disposition: 'Rework' });
  if (mod === 'capa') Object.assign(base, { type: 'Corrective (NC)', source: 'Product nonconformity', due: day(off + 20) });
  if (mod === 'complaints') Object.assign(base, { customer: customers[i % customers.length][0], category: ['Delivery', 'Non-conforming product', 'Other'][i % 3] });
  all[mod].push(mk(mod, { ncr: 'NCR', capa: 'CAPA', complaints: 'CC' }[mod], off, base, [H(off + 10, 'u2', 'Closed', 'green')]));
});
// renumber codes chronologically per module
for (const list of Object.values(all)) {
  if (!list[0] || !/-\d{4}-/.test(list[0].code)) continue;
  const prefix = list[0].code.split('-')[0];
  const byYear = {};
  list.slice().sort((a, b) => a.created.localeCompare(b.created)).forEach((r) => {
    const y = r.created.slice(0, 4); byYear[y] = (byYear[y] || 0) + 1; r.code = `${prefix}-${y}-${pad(byYear[y])}`;
  });
  list.sort((a, b) => b.created.localeCompare(a.created));
}

const activity = [];
for (const [mod, list] of Object.entries(all)) for (const r of list) for (const h of r.history) if (new Date(h.at) > new Date(today.getTime() - 30 * 86400000) && h.action !== 'Created') activity.push({ at: h.at, by: h.by, text: h.action, mod, id: r.id, code: r.code, title: r.title || r.customer });
for (const d of documents) for (const h of d.history) if (new Date(h.at) > new Date(today.getTime() - 30 * 86400000)) activity.push({ at: h.at, by: h.by, text: h.action, mod: 'documents', id: d.id, code: d.code, title: d.title });
activity.sort((a, b) => b.at.localeCompare(a.at));

const db = {
  meta: { seededAt: new Date().toISOString(), source: QMS_ROOT, files: fileCount },
  settings: { reviewCycleYears: 3, closureDays: { ncr: 14, capa: 30, complaints: 3 }, maxRegrind: { pressure: 0, other: 10 }, company: ORG.name },
  users: USERS, org: ORG, documents, ...all, activity: activity.slice(0, 120),
};
fs.writeFileSync(path.join(DATA, 'db.json'), JSON.stringify(db, null, 1));
fs.writeFileSync(path.join(DATA, 'fulltext.json'), JSON.stringify(fulltext));
const cats = documents.reduce((a, d) => (a[d.category] = (a[d.category] || 0) + 1, a), {});
console.log(`Seeded from ${fileCount} files → ${documents.length} controlled documents`, cats);
console.log('Module records:', Object.fromEntries(Object.entries(all).map(([k, v]) => [k, v.length])));
