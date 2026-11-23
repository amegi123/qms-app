// Modules added from SRS-WF-QMS-2026-v1.0 (Waterfit eQMS 2026). Merged into MODULES by lib/modules.js.
const ALL = ['gm', 'mr', 'head', 'qa', 'auditor', 'staff', 'factory', 'supervisor', 'operator', 'compounder', 'maint', 'store', 'procurement', 'sales', 'hr', 'finance'];
const S = (key, label, tone) => ({ key, label, tone });
const PRODUCTS = ['HDPE Pipe PN6', 'HDPE Pipe PN10', 'HDPE Pipe PN16', 'HDPE Pipe PN25', 'Drip Irrigation Pipe', 'Single Wall Corrugated Pipe', 'HDPE Fitting'];
const LINES = ['Jwell HDPE extrusion line', 'DOLCI 01 line', 'NOVAMEC 03 line', 'Single wall corrugated line', 'Drip irrigation line'];
const TESTS = ['Ash Content (OF/WF/201)', 'Impact Strength (OF/WF/204)', 'Hydrostatic Pressure (OF/WF/205)', 'Longitudinal Reversion (OF/WF/207)'];
const money = { t: 'number' };

const NEW = {
  production: {
    title: 'Production Orders', short: 'Production', icon: 'layers', prefix: 'PRD', procedure: 'OP/WF/034–037', form: 'OF/WF/050 · 154',
    desc: 'Customer orders turned into scheduled production orders: line allocation, resin grade, carbon black and regrind rules, automatic batch numbering and quality hold.',
    fields: [
      { k: 'title', l: 'Order / customer', t: 'text', req: true, full: true },
      { k: 'product', l: 'Product', t: 'select', opts: PRODUCTS, req: true },
      { k: 'size', l: 'Size OD (mm)', t: 'text', req: true },
      { k: 'meters', l: 'Quantity (m)', t: 'number', req: true },
      { k: 'line', l: 'Extrusion line', t: 'select', opts: LINES, req: true },
      { k: 'resin', l: 'Virgin resin grade', t: 'select', opts: ['PE 100', 'PE 80'] },
      { k: 'carbonBlack', l: 'Carbon black masterbatch %', t: 'number', hint: 'Must be 2.0 – 2.5 % (UV protection)' },
      { k: 'regrind', l: 'Regrind / crushed material %', t: 'number', hint: 'Pressure pipes: 0 %. Others: max per Settings' },
      { k: 'due', l: 'Delivery date', t: 'date', req: true },
      { k: 'department', l: 'Department', t: 'dept' },
      { k: 'owner', l: 'Production supervisor', t: 'user' },
      { k: 'batch', l: 'Batch number (auto)', t: 'text' },
      { k: 'disposition', l: 'Hold disposition', t: 'select', opts: ['Release', 'Rework', 'Regrind / crush', 'Scrap', 'Return to vendor'] },
      { k: 'notes', l: 'Notes', t: 'textarea', full: true },
    ],
    columns: ['code', 'title', 'product', 'size', 'line', 'batch', 'due', 'status'],
    states: [S('planned', 'Planned', 'gray'), S('approved', 'Approved', 'blue'), S('running', 'In production', 'amber'), S('qc', 'QC release', 'violet'), S('transferred', 'Transferred to store', 'teal'), S('closed', 'Closed', 'green'), S('hold', 'QUALITY HOLD', 'red')],
    flow: [
      { from: 'planned', to: 'approved', label: 'Approve production plan', roles: ['factory', 'head', 'gm'], requires: ['line', 'resin'] },
      { from: 'approved', to: 'running', label: 'Start production (assign batch no.)', roles: ['supervisor', 'factory', 'head'] },
      { from: 'running', to: 'qc', label: 'Send to QC release', roles: ['supervisor', 'factory', 'qa'] },
      { from: 'running', to: 'hold', label: 'Place on quality hold', roles: ['qa', 'supervisor', 'factory', 'head'], tone: 'danger' },
      { from: 'qc', to: 'transferred', label: 'Release – transfer to store (OF/WF/052)', roles: ['qa', 'supervisor', 'factory'] },
      { from: 'qc', to: 'hold', label: 'Place on quality hold', roles: ['qa'], tone: 'danger' },
      { from: 'hold', to: 'running', label: 'Hold lifted – back to production', roles: ['qa', 'factory'], requires: ['disposition'] },
      { from: 'transferred', to: 'closed', label: 'Store receipt co-signed (OF/WF/057)', roles: ['store', 'supervisor'] },
    ],
    raises: ['ncr'],
  },

  shiftlogs: {
    title: 'Shift Production Log', short: 'Shift log', icon: 'clock', prefix: 'SHF', procedure: 'OP/WF/036', form: 'OF/WF/050 · 058 · 060',
    desc: 'Hourly extrusion parameters per line and shift. Barrel zone temperatures outside 170–210 °C are flagged automatically. Works offline on tablets.',
    fields: [
      { k: 'title', l: 'Production order / batch', t: 'text', req: true },
      { k: 'line', l: 'Line', t: 'select', opts: LINES, req: true },
      { k: 'shift', l: 'Shift', t: 'select', opts: ['Day', 'Night'], req: true },
      { k: 'date', l: 'Date', t: 'date', req: true },
      { k: 'owner', l: 'Operator', t: 'user' },
      { k: 'department', l: 'Department', t: 'dept' },
      { k: 'z1', l: 'Barrel zone 1 °C', t: 'number' }, { k: 'z2', l: 'Barrel zone 2 °C', t: 'number' }, { k: 'z3', l: 'Barrel zone 3 °C', t: 'number' },
      { k: 'z4', l: 'Barrel zone 4 °C', t: 'number' }, { k: 'z5', l: 'Barrel zone 5 °C', t: 'number' },
      { k: 'meltTemp', l: 'Melt temperature °C', t: 'number' }, { k: 'meltPressure', l: 'Melt pressure bar', t: 'number' },
      { k: 'haulOff', l: 'Haul-off speed m/min', t: 'number' }, { k: 'vacuumWater', l: 'Vacuum / cooling water °C', t: 'number' },
      { k: 'output', l: 'Output (m)', t: 'number' }, { k: 'scrapPct', l: 'Scrap %', t: 'number' }, { k: 'downtime', l: 'Downtime (h)', t: 'number' },
      { k: 'remarks', l: 'Shift handover remarks', t: 'textarea', full: true },
    ],
    columns: ['code', 'title', 'line', 'shift', 'date', 'output', 'scrapPct', 'tempAlert', 'status'],
    states: [S('logged', 'Logged', 'blue'), S('closed', 'Verified by supervisor', 'green')],
    flow: [{ from: 'logged', to: 'closed', label: 'Verify & hand over', roles: ['supervisor', 'factory', 'head'] }],
  },

  labtests: {
    title: 'Laboratory Tests & CoA', short: 'Lab test', icon: 'flask', prefix: 'LAB', procedure: 'OP/WF/040', form: 'OF/WF/201 · 204 · 205 · 207 · 206',
    desc: 'Ash, impact, hydrostatic and shrinkage tests judged automatically against thresholds. A failure places the batch on quality hold and raises a Major NCR. Passed batches get a verifiable Certificate of Analysis.',
    fields: [
      { k: 'title', l: 'Sample / batch no.', t: 'text', req: true, full: true },
      { k: 'batch', l: 'Batch number', t: 'text', req: true },
      { k: 'test', l: 'Test', t: 'select', opts: TESTS, req: true },
      { k: 'value', l: 'Measured value', t: 'number', hint: 'Ash % · Impact TIR % · Shrinkage %' },
      { k: 'hydro', l: 'Hydrostatic result', t: 'select', opts: ['No failure', 'Rupture or weeping leak'] },
      { k: 'testDate', l: 'Test date', t: 'date', req: true },
      { k: 'owner', l: 'Tested by', t: 'user' },
      { k: 'department', l: 'Department', t: 'dept' },
      { k: 'remarks', l: 'Remarks', t: 'textarea', full: true },
    ],
    columns: ['code', 'title', 'test', 'value', 'result', 'testDate', 'status'],
    states: [S('recorded', 'Recorded', 'blue'), S('reviewed', 'Lab head reviewed', 'violet'), S('closed', 'CoA released', 'green')],
    flow: [
      { from: 'recorded', to: 'reviewed', label: 'Review results', roles: ['qa', 'head'] },
      { from: 'reviewed', to: 'closed', label: 'Release Certificate of Analysis', roles: ['qa', 'mr', 'gm'], sign: true },
    ],
    raises: ['ncr'],
  },

  risks: {
    title: 'Risk & Opportunity Register', short: 'Risk', icon: 'target', prefix: 'RSK', procedure: 'ISO 6.1', form: 'OF/WF/037',
    desc: 'Operational, supply-chain, FX, technical and quality risks scored Likelihood × Severity, with treatment plans and review.',
    fields: [
      { k: 'title', l: 'Risk / opportunity', t: 'text', req: true, full: true },
      { k: 'kind', l: 'Type', t: 'select', opts: ['Risk', 'Opportunity'], req: true },
      { k: 'category', l: 'Category', t: 'select', opts: ['Operational', 'Supply chain', 'Foreign exchange', 'Technical / machinery', 'Quality', 'Legal / regulatory', 'Health & safety'], req: true },
      { k: 'department', l: 'Department', t: 'dept', req: true },
      { k: 'owner', l: 'Risk owner', t: 'user' },
      { k: 'likelihood', l: 'Likelihood (1–5)', t: 'rating' },
      { k: 'severity', l: 'Severity (1–5)', t: 'rating' },
      { k: 'treatment', l: 'Treatment plan', t: 'textarea', full: true },
      { k: 'due', l: 'Next review', t: 'date' },
    ],
    columns: ['code', 'title', 'category', 'riskScore', 'riskLevel', 'owner', 'due', 'status'],
    states: [S('identified', 'Identified', 'gray'), S('assessed', 'Assessed', 'amber'), S('treating', 'Treatment in progress', 'blue'), S('monitoring', 'Monitoring', 'teal'), S('closed', 'Closed', 'green')],
    flow: [
      { from: 'identified', to: 'assessed', label: 'Complete assessment', roles: ['mr', 'head', 'gm', 'factory'], requires: ['likelihood', 'severity'] },
      { from: 'assessed', to: 'treating', label: 'Start treatment', roles: ['mr', 'head', 'gm', 'factory'], requires: ['treatment'] },
      { from: 'treating', to: 'monitoring', label: 'Treatment implemented', roles: ['head', 'mr', 'factory'] },
      { from: 'monitoring', to: 'closed', label: 'Close risk', roles: ['mr', 'gm'] },
    ],
    raises: ['capa'],
  },

  assets: {
    title: 'Machines & Assets', short: 'Asset', icon: 'cog', prefix: 'AST', procedure: 'OP/WF/038–039', form: 'OF/WF/042',
    desc: 'Machinery registry and history sheet. MTBF and MTTR are computed from the maintenance work orders for each machine.',
    fields: [
      { k: 'title', l: 'Machine name', t: 'text', req: true, full: true },
      { k: 'assetType', l: 'Type', t: 'select', opts: ['Extruder', 'Vacuum tank', 'Haul-off', 'Cutter', 'Compressor', 'Cooling / chiller', 'Granulator / crusher', 'Welding machine', 'Generator', 'Other'] },
      { k: 'make', l: 'Manufacturer', t: 'text' }, { k: 'model', l: 'Model', t: 'text' }, { k: 'serial', l: 'Serial no.', t: 'text' },
      { k: 'power', l: 'Power rating (kW)', t: 'number' }, { k: 'location', l: 'Location', t: 'text' }, { k: 'installed', l: 'Installed', t: 'date' },
      { k: 'department', l: 'Department', t: 'dept' }, { k: 'owner', l: 'Maintenance lead', t: 'user' },
    ],
    columns: ['code', 'title', 'assetType', 'make', 'location', 'mtbf', 'mttr', 'status'],
    states: [S('active', 'In service', 'green'), S('maintenance', 'Under maintenance', 'amber'), S('retired', 'Retired', 'gray')],
    flow: [
      { from: 'active', to: 'maintenance', label: 'Take out of service', roles: ['maint', 'head', 'factory'] },
      { from: 'maintenance', to: 'active', label: 'Return to service', roles: ['maint', 'head', 'factory'] },
      { from: 'active', to: 'retired', label: 'Retire asset', roles: ['gm', 'factory'] },
    ],
  },

  inventory: {
    title: 'Inventory & Stock', short: 'Stock item', icon: 'grid', prefix: 'INV', procedure: 'OP/WF/026', form: 'OF/WF/070 · 080–082 · 165',
    desc: 'Perpetual stock of resin, masterbatch, spares and finished coils with min/max levels and automatic reorder alerts. Items on quality hold cannot be issued.',
    fields: [
      { k: 'title', l: 'Item', t: 'text', req: true, full: true },
      { k: 'itemCode', l: 'Item code', t: 'text', req: true },
      { k: 'category', l: 'Category', t: 'select', opts: ['Raw HDPE resin', 'Carbon black masterbatch', 'Additives', 'Spare parts', 'Finished pipe coils / bundles', 'Fittings', 'Packaging'], req: true },
      { k: 'unit', l: 'Unit', t: 'select', opts: ['kg', 'bag (25 kg)', 'm', 'coil', 'piece'] },
      { k: 'onHand', l: 'On hand', t: 'number', req: true }, { k: 'min', l: 'Minimum', t: 'number', req: true }, { k: 'max', l: 'Maximum', t: 'number' },
      { k: 'location', l: 'Bin / rack', t: 'text' }, { k: 'department', l: 'Department', t: 'dept' },
    ],
    columns: ['code', 'title', 'category', 'onHand', 'min', 'alert', 'location', 'status'],
    states: [S('active', 'Available', 'green'), S('hold', 'QUALITY HOLD – no issue', 'red'), S('closed', 'Discontinued', 'gray')],
    flow: [
      { from: 'active', to: 'hold', label: 'Place on quality hold', roles: ['qa', 'store', 'head'], tone: 'danger' },
      { from: 'hold', to: 'active', label: 'Release from hold', roles: ['qa', 'mr'] },
      { from: 'active', to: 'closed', label: 'Discontinue item', roles: ['store', 'head'] },
    ],
  },

  gatepass: {
    title: 'Gate Passes', short: 'Gate pass', icon: 'shield', prefix: 'GP', procedure: 'OP/WF/026', form: 'OF/WF/065',
    desc: 'Inbound and outbound vehicle and material authorisation.',
    fields: [
      { k: 'title', l: 'Material / purpose', t: 'text', req: true, full: true },
      { k: 'direction', l: 'Direction', t: 'select', opts: ['Inbound', 'Outbound'], req: true },
      { k: 'vehicle', l: 'Vehicle plate', t: 'text', req: true }, { k: 'driver', l: 'Driver', t: 'text' },
      { k: 'refDoc', l: 'Reference (PO / invoice / dispatch)', t: 'text' }, { k: 'qty', l: 'Quantity', t: 'text' },
      { k: 'department', l: 'Department', t: 'dept' },
    ],
    columns: ['code', 'title', 'direction', 'vehicle', 'refDoc', 'created', 'status'],
    states: [S('requested', 'Requested', 'gray'), S('authorized', 'Authorised', 'blue'), S('closed', 'Gate-out / in recorded', 'green')],
    flow: [
      { from: 'requested', to: 'authorized', label: 'Authorise', roles: ['store', 'head', 'factory'] },
      { from: 'authorized', to: 'closed', label: 'Record gate movement', roles: ['store'] },
    ],
  },

  dispatch: {
    title: 'Sales & Dispatch', short: 'Order', icon: 'send', prefix: 'DSP', procedure: 'OP/WF/030', form: 'OF/WF/156 · 157',
    desc: 'Proforma → contract review (stock vs capacity) → dispatch note matched to batch number and test certificate. Batches on quality hold cannot be dispatched.',
    fields: [
      { k: 'customer', l: 'Customer', t: 'text', req: true },
      { k: 'title', l: 'Proforma / order ref.', t: 'text', req: true },
      { k: 'product', l: 'Product & standard', t: 'select', opts: PRODUCTS },
      { k: 'standard', l: 'Pipe standard', t: 'select', opts: ['ISO 4427', 'DIN 8074/8075', 'ES / CES'] },
      { k: 'qty', l: 'Quantity (m)', t: 'number' }, { k: 'amount', l: 'Value (Birr)', t: 'number' },
      { k: 'leadTime', l: 'Lead time (days)', t: 'number' }, { k: 'due', l: 'Promised delivery', t: 'date' },
      { k: 'department', l: 'Department', t: 'dept' }, { k: 'owner', l: 'Sales officer', t: 'user' },
      { k: 'feasibility', l: 'Contract review – stock / capacity check', t: 'textarea', full: true },
      { k: 'batch', l: 'Batch number dispatched', t: 'text' }, { k: 'certificate', l: 'Test certificate ref. (CoA)', t: 'text' },
      { k: 'waybill', l: 'Waybill no.', t: 'text' }, { k: 'onTime', l: 'Delivered on time?', t: 'select', opts: ['Yes', 'No'] },
    ],
    columns: ['code', 'customer', 'title', 'product', 'amount', 'due', 'status'],
    states: [S('proforma', 'Proforma', 'gray'), S('accepted', 'Order accepted', 'blue'), S('ready', 'Ready to dispatch', 'amber'), S('dispatched', 'Dispatched', 'violet'), S('closed', 'Delivered', 'green')],
    flow: [
      { from: 'proforma', to: 'accepted', label: 'Accept order after contract review', roles: ['sales', 'head'], requires: ['feasibility'] },
      { from: 'accepted', to: 'ready', label: 'Goods ready (batch assigned)', roles: ['store', 'sales', 'head'], requires: ['batch'] },
      { from: 'ready', to: 'dispatched', label: 'Issue dispatch note (OF/WF/157)', roles: ['store', 'sales'], requires: ['batch', 'certificate', 'waybill'] },
      { from: 'dispatched', to: 'closed', label: 'Confirm delivery', roles: ['sales', 'head'], requires: ['onTime'] },
    ],
    raises: ['complaints'],
  },

  purchasing: {
    title: 'Purchase Requests', short: 'Purchase', icon: 'truck', prefix: 'PUR', procedure: 'OP/WF/027', form: 'OF/WF/181–184',
    desc: 'Requisition → RFQ → comparative evaluation → purchase order → receipt. The buying method follows the OP/WF/027 value thresholds.',
    fields: [
      { k: 'title', l: 'Item / description', t: 'text', req: true, full: true },
      { k: 'qty', l: 'Quantity', t: 'text' }, { k: 'amount', l: 'Estimated value (Birr)', t: 'number', req: true },
      { k: 'origin', l: 'Local / foreign', t: 'select', opts: ['Local', 'Foreign'] }, { k: 'budgetRef', l: 'Budget reference', t: 'text' },
      { k: 'department', l: 'Requesting department', t: 'dept', req: true }, { k: 'owner', l: 'Purchaser', t: 'user' },
      { k: 'supplier', l: 'Selected supplier', t: 'text' },
      { k: 'justification', l: 'Evaluation / justification (if not lowest bid)', t: 'textarea', full: true },
      { k: 'poNo', l: 'Purchase order no.', t: 'text' },
    ],
    columns: ['code', 'title', 'amount', 'method', 'department', 'supplier', 'status'],
    states: [S('requisition', 'Requisition', 'gray'), S('rfq', 'RFQ / bids', 'blue'), S('evaluated', 'Evaluated', 'violet'), S('ordered', 'PO issued', 'amber'), S('closed', 'Received & closed', 'green')],
    flow: [
      { from: 'requisition', to: 'rfq', label: 'Send request for quotation', roles: ['procurement', 'head'], requires: ['budgetRef'] },
      { from: 'rfq', to: 'evaluated', label: 'Complete comparative evaluation', roles: ['procurement', 'head'], requires: ['supplier', 'justification'] },
      { from: 'evaluated', to: 'ordered', label: 'Approve & issue PO (GM)', roles: ['gm', 'head'], requires: ['poNo'] },
      { from: 'ordered', to: 'closed', label: 'Goods received & inspected', roles: ['store', 'procurement'] },
    ],
  },

  correspondence: {
    title: 'Incoming / Outgoing Register', short: 'Letter', icon: 'file', prefix: 'COR', procedure: 'OP/WF/002', form: 'OF/WF/005 · 011',
    desc: 'Register of correspondence, customer specifications and regulatory releases, with assignment and follow-up.',
    fields: [
      { k: 'title', l: 'Subject', t: 'text', req: true, full: true },
      { k: 'direction', l: 'Direction', t: 'select', opts: ['Incoming', 'Outgoing'], req: true },
      { k: 'party', l: 'From / to', t: 'text', req: true }, { k: 'refNo', l: 'Reference no.', t: 'text' },
      { k: 'date', l: 'Date', t: 'date', req: true }, { k: 'department', l: 'Department', t: 'dept' },
      { k: 'owner', l: 'Assigned to', t: 'user' }, { k: 'due', l: 'Reply due', t: 'date' },
      { k: 'action', l: 'Action required', t: 'textarea', full: true },
    ],
    columns: ['code', 'title', 'direction', 'party', 'date', 'owner', 'status'],
    states: [S('registered', 'Registered', 'gray'), S('assigned', 'Assigned', 'blue'), S('closed', 'Closed', 'green')],
    flow: [
      { from: 'registered', to: 'assigned', label: 'Assign for action', roles: ['head', 'mr', 'gm'], requires: ['owner'] },
      { from: 'assigned', to: 'closed', label: 'Close', roles: ALL },
    ],
  },

  employees: {
    title: 'Employees & Competency', short: 'Employee', icon: 'users', prefix: 'EMP', procedure: 'OP/WF/010–014', form: 'OF/WF/093 · 098 · 103 · 104',
    desc: 'Employee records with the competency matrix: actual vs required level (0–4) for critical skills, with automatic gap analysis.',
    fields: [
      { k: 'title', l: 'Full name', t: 'text', req: true }, { k: 'position', l: 'Position / job title', t: 'text', req: true },
      { k: 'department', l: 'Department', t: 'dept', req: true }, { k: 'hireDate', l: 'Employment date', t: 'date' },
      { k: 'education', l: 'Education', t: 'text' }, { k: 'required', l: 'Required level for role (0–4)', t: 'number' },
      { k: 'sExtrusion', l: 'Extrusion operation', t: 'number' }, { k: 'sWelding', l: 'Butt-fusion welding', t: 'number' },
      { k: 'sLab', l: 'Laboratory testing', t: 'number' }, { k: 'sMaint', l: 'Machine maintenance', t: 'number' }, { k: 'sSafety', l: 'Health & safety', t: 'number' },
      { k: 'certs', l: 'Certified skills / trainings', t: 'textarea', full: true },
    ],
    columns: ['code', 'title', 'position', 'department', 'hireDate', 'gapCount', 'status'],
    states: [S('probation', 'On probation (45 days)', 'amber'), S('active', 'Permanent', 'green'), S('closed', 'Left company', 'gray')],
    flow: [
      { from: 'probation', to: 'active', label: 'Confirm permanent (probation appraisal)', roles: ['hr', 'head', 'gm'] },
      { from: 'active', to: 'closed', label: 'Terminate employment (OP/WF/013)', roles: ['hr', 'gm'], tone: 'danger' },
      { from: 'probation', to: 'closed', label: 'Terminate at probation', roles: ['hr', 'gm'], tone: 'danger' },
    ],
  },

  hse: {
    title: 'Health, Safety & Environment', short: 'Incident', icon: 'alert', prefix: 'HSE', procedure: 'OP/WF/046', form: 'OF/WF/091',
    desc: 'Accident, near-miss and unsafe-condition reporting with investigation and corrective action.',
    fields: [
      { k: 'title', l: 'What happened', t: 'text', req: true, full: true },
      { k: 'type', l: 'Type', t: 'select', opts: ['Accident / injury', 'Near miss', 'Unsafe condition', 'PPE issue', 'Environmental'], req: true },
      { k: 'severity', l: 'Severity', t: 'select', opts: ['Minor', 'Serious', 'Fatal'] }, { k: 'date', l: 'Date', t: 'date', req: true },
      { k: 'location', l: 'Location', t: 'text' }, { k: 'person', l: 'Person involved', t: 'text' },
      { k: 'department', l: 'Department', t: 'dept' }, { k: 'owner', l: 'Investigator', t: 'user' },
      { k: 'description', l: 'Description & cause', t: 'textarea', full: true },
      { k: 'action', l: 'Corrective action', t: 'textarea', full: true },
    ],
    columns: ['code', 'title', 'type', 'severity', 'date', 'department', 'status'],
    states: [S('reported', 'Reported', 'red'), S('investigating', 'Investigating', 'amber'), S('actioned', 'Action implemented', 'blue'), S('closed', 'Closed', 'green')],
    flow: [
      { from: 'reported', to: 'investigating', label: 'Start investigation', roles: ['head', 'factory', 'hr', 'mr'] },
      { from: 'investigating', to: 'actioned', label: 'Corrective action done', roles: ['head', 'factory', 'hr', 'mr'], requires: ['description', 'action'] },
      { from: 'actioned', to: 'closed', label: 'Close incident', roles: ['mr', 'hr', 'gm'] },
    ],
    raises: ['capa'],
  },

  fixedassets: {
    title: 'Fixed Assets', short: 'Fixed asset', icon: 'building', prefix: 'FA', procedure: 'OP/WF/024', form: 'OF/WF/134 · 176–179',
    desc: 'Asset register with straight-line depreciation (buildings 5 %, computers 20 %, other 15 %, land 0; carried at Birr 1 when fully depreciated).',
    fields: [
      { k: 'title', l: 'Asset', t: 'text', req: true, full: true }, { k: 'tag', l: 'Tag (WF-01-001-001)', t: 'text' },
      { k: 'category', l: 'Category', t: 'select', opts: ['Land', 'Buildings', 'Machinery & equipment', 'Computers', 'Vehicles', 'Furniture & office', 'Moulds & dies'], req: true },
      { k: 'cost', l: 'Cost (Birr)', t: 'number', req: true }, { k: 'purchaseDate', l: 'Purchase date', t: 'date', req: true },
      { k: 'location', l: 'Location', t: 'text' }, { k: 'condition', l: 'Condition', t: 'select', opts: ['Very good', 'Good', 'Fair', 'Non-functional', 'Damaged'] },
      { k: 'department', l: 'Department', t: 'dept' },
    ],
    columns: ['code', 'title', 'category', 'cost', 'nbv', 'condition', 'status'],
    states: [S('active', 'In use', 'green'), S('disposal', 'Disposal committee', 'amber'), S('closed', 'Disposed', 'gray')],
    flow: [
      { from: 'active', to: 'disposal', label: 'Request disposal', roles: ['head', 'store', 'finance'] },
      { from: 'disposal', to: 'closed', label: 'Approve disposal (GM)', roles: ['gm'], sign: true },
      { from: 'disposal', to: 'active', label: 'Reject disposal', roles: ['gm'], tone: 'danger' },
    ],
  },

  expenses: {
    title: 'Payments & Expenses', short: 'Payment', icon: 'chart', prefix: 'PAY', procedure: 'OP/WF/016', form: 'OF/WF/135–139',
    desc: 'Payment requests, petty cash, per diem and settlements. Amounts above Birr 10,000 need the General Manager.',
    fields: [
      { k: 'title', l: 'Purpose', t: 'text', req: true, full: true },
      { k: 'type', l: 'Type', t: 'select', opts: ['Payment request', 'Petty cash voucher', 'Per diem request', 'Per diem settlement', 'Purchase payment'], req: true },
      { k: 'payee', l: 'Payee', t: 'text', req: true }, { k: 'amount', l: 'Amount (Birr)', t: 'number', req: true },
      { k: 'department', l: 'Department', t: 'dept', req: true }, { k: 'owner', l: 'Requested by', t: 'user' },
      { k: 'refDoc', l: 'Attached reference (PO / invoice)', t: 'text' },
    ],
    columns: ['code', 'title', 'type', 'payee', 'amount', 'department', 'status'],
    states: [S('requested', 'Requested', 'gray'), S('approved', 'Approved', 'blue'), S('checked', 'Checked by finance', 'violet'), S('closed', 'Paid', 'green')],
    flow: [
      { from: 'requested', to: 'approved', label: 'Approve request', roles: ['head', 'gm'] },
      { from: 'approved', to: 'checked', label: 'Check against procedure checklist', roles: ['finance'] },
      { from: 'checked', to: 'closed', label: 'Mark paid', roles: ['finance'], sign: true },
    ],
  },
  memos: {
    title: 'Internal Memos', short: 'Memo', icon: 'message', prefix: 'MEM', procedure: 'OP/WF/007 · 008', form: 'OF/WF/026',
    desc: 'Internal memo system: draft, approve and issue memos to departments with a record of who received them.',
    fields: [
      { k: 'title', l: 'Subject', t: 'text', req: true, full: true },
      { k: 'department', l: 'Issuing department', t: 'dept', req: true }, { k: 'owner', l: 'Issued by', t: 'user' },
      { k: 'date', l: 'Date', t: 'date', req: true },
      { k: 'to', l: 'Distribution', t: 'checklist', full: true, opts: ['General Management', 'Quality Assurance', 'Operation', 'Procurement & Supply', 'Marketing & Sales', 'Administration & HR', 'Finance'] },
      { k: 'body', l: 'Memo text', t: 'textarea', full: true },
    ],
    columns: ['code', 'title', 'department', 'owner', 'date', 'status'],
    states: [S('draft', 'Draft', 'gray'), S('approved', 'Approved', 'blue'), S('closed', 'Issued', 'green')],
    flow: [
      { from: 'draft', to: 'approved', label: 'Approve memo', roles: ['head', 'gm', 'mr', 'factory'], requires: ['body'] },
      { from: 'approved', to: 'closed', label: 'Issue to distribution list', roles: ['mr', 'head', 'hr', 'factory'], requires: ['to'] },
    ],
  },

  recycling: {
    title: 'Scrap & Recycling', short: 'Crusher run', icon: 'refresh', prefix: 'RCY', procedure: 'OP/WF/037', form: 'OF/WF/051',
    desc: 'Granulator / crusher run records, regrind bin balance and damaged-product reports.',
    fields: [
      { k: 'title', l: 'Run / source', t: 'text', req: true, full: true },
      { k: 'date', l: 'Date', t: 'date', req: true },
      { k: 'material', l: 'Material', t: 'select', opts: ['HDPE black (PE 100)', 'HDPE (PE 80)', 'Drip irrigation lateral', 'Corrugated conduit', 'Mixed colours'], req: true },
      { k: 'source', l: 'Source of scrap', t: 'select', opts: ['Start-up purge', 'Damaged product (OF/WF/051)', 'Non-conforming batch (NCR)', 'Cut-offs / trimmings'] },
      { k: 'inKg', l: 'Crushed (kg)', t: 'number', req: true }, { k: 'usedKg', l: 'Re-used in production (kg)', t: 'number' },
      { k: 'bin', l: 'Regrind bin', t: 'text' }, { k: 'runHours', l: 'Crusher run (h)', t: 'number' },
      { k: 'owner', l: 'Crusher operator', t: 'user' }, { k: 'department', l: 'Department', t: 'dept' },
      { k: 'remarks', l: 'Remarks', t: 'textarea', full: true },
    ],
    columns: ['code', 'title', 'material', 'inKg', 'usedKg', 'binBalance', 'date', 'status'],
    states: [S('logged', 'Logged', 'blue'), S('closed', 'Verified', 'green')],
    flow: [{ from: 'logged', to: 'closed', label: 'Verify & file', roles: ['supervisor', 'factory', 'head'] }],
    raises: ['ncr'],
  },

  fgtransfer: {
    title: 'Finished Goods Transfer Notes', short: 'Transfer note', icon: 'send', prefix: 'FGT', procedure: 'OP/WF/034 · 036', form: 'OF/WF/052 · 057 · 079',
    desc: 'Finished goods handed from production to store, co-signed by the production supervisor and the store keeper.',
    fields: [
      { k: 'title', l: 'Production order / batch', t: 'text', req: true, full: true },
      { k: 'batch', l: 'Batch number', t: 'text', req: true },
      { k: 'product', l: 'Product', t: 'select', opts: PRODUCTS, req: true }, { k: 'qty', l: 'Quantity (m / coils)', t: 'text', req: true },
      { k: 'location', l: 'Store location', t: 'text' }, { k: 'department', l: 'Department', t: 'dept' },
      { k: 'remarks', l: 'Remarks', t: 'textarea', full: true },
    ],
    columns: ['code', 'title', 'batch', 'product', 'qty', 'created', 'status'],
    states: [S('drafted', 'Drafted', 'gray'), S('supervisor', 'Signed by production', 'blue'), S('closed', 'Received & co-signed by store', 'green')],
    flow: [
      { from: 'drafted', to: 'supervisor', label: 'Production supervisor signs (OF/WF/052)', roles: ['supervisor', 'factory'], sign: true },
      { from: 'supervisor', to: 'closed', label: 'Store keeper receives & co-signs (OF/WF/057)', roles: ['store'], sign: true },
    ],
  },

  appraisals: {
    title: 'Performance Appraisals', short: 'Appraisal', icon: 'star', prefix: 'APR', procedure: 'OP/WF/012', form: 'OF/WF/103 · 104',
    desc: 'Bi-annual appraisal for management (12 criteria) and non-management staff (first 6 criteria), 1–5 scale with automatic grade A–E.',
    fields: [
      { k: 'title', l: 'Employee', t: 'text', req: true }, { k: 'position', l: 'Position', t: 'text' },
      { k: 'kind', l: 'Form', t: 'select', opts: ['Management staff (OF/WF/103)', 'Non-management staff (OF/WF/104)', 'Probation (OF/WF/105)'], req: true },
      { k: 'period', l: 'Evaluation period', t: 'text', req: true }, { k: 'department', l: 'Department', t: 'dept', req: true }, { k: 'owner', l: 'Evaluator', t: 'user' },
      { k: 'j1', l: 'Job knowledge', t: 'rating' }, { k: 'j2', l: 'Productivity', t: 'rating' }, { k: 'j3', l: 'Quality of work', t: 'rating' },
      { k: 'j4', l: 'Cooperation', t: 'rating' }, { k: 'j5', l: 'Attendance', t: 'rating' }, { k: 'j6', l: 'Safety / confidentiality', t: 'rating' },
      { k: 'j7', l: 'Initiative (mgmt)', t: 'rating' }, { k: 'j8', l: 'Supervisory capability (mgmt)', t: 'rating' }, { k: 'j9', l: 'Communication (mgmt)', t: 'rating' },
      { k: 'j10', l: 'Planning & organising (mgmt)', t: 'rating' }, { k: 'j11', l: 'Adaptability (mgmt)', t: 'rating' }, { k: 'j12', l: 'Cost effectiveness (mgmt)', t: 'rating' },
      { k: 'comments', l: 'Evaluator comments / areas for improvement', t: 'textarea', full: true },
    ],
    columns: ['code', 'title', 'position', 'period', 'apScore', 'apGrade', 'status'],
    states: [S('draft', 'Draft', 'gray'), S('evaluated', 'Evaluated', 'blue'), S('closed', 'Approved (GM) & filed', 'green')],
    flow: [
      { from: 'draft', to: 'evaluated', label: 'Submit evaluation', roles: ['head', 'factory', 'hr'], requires: ['j1', 'j2', 'j3'] },
      { from: 'evaluated', to: 'closed', label: 'GM approves – action plan', roles: ['gm', 'hr'], sign: true },
    ],
    raises: ['training'],
  },

  ppe: {
    title: 'PPE Issuance Log', short: 'PPE issue', icon: 'shield', prefix: 'PPE', procedure: 'OP/WF/046', form: 'OF/WF/091',
    desc: 'Personal protective equipment issued to staff with replacement dates.',
    fields: [
      { k: 'title', l: 'Employee', t: 'text', req: true },
      { k: 'ppeType', l: 'PPE item', t: 'select', opts: ['Safety helmet', 'Heat-resistant gloves', 'Safety boots', 'Ear plugs / muffs', 'Face mask / respirator', 'Safety goggles', 'Apron / coverall'], req: true },
      { k: 'qty', l: 'Quantity', t: 'number' }, { k: 'issueDate', l: 'Issue date', t: 'date', req: true }, { k: 'due', l: 'Replace by', t: 'date' },
      { k: 'department', l: 'Department', t: 'dept' }, { k: 'owner', l: 'Issued by', t: 'user' },
    ],
    columns: ['code', 'title', 'ppeType', 'issueDate', 'due', 'department', 'status'],
    states: [S('issued', 'In use', 'green'), S('closed', 'Returned / replaced', 'gray')],
    flow: [{ from: 'issued', to: 'closed', label: 'Mark returned / replaced', roles: ['hr', 'store', 'head', 'factory'] }],
  },

  safetyaudits: {
    title: 'Factory Safety Audits', short: 'Safety audit', icon: 'clipboard', prefix: 'SAF', procedure: 'OP/WF/046', form: 'OF/WF/091',
    desc: 'Periodic walk-through audits of the factory with a safety checklist and score.',
    fields: [
      { k: 'title', l: 'Area audited', t: 'text', req: true, full: true }, { k: 'date', l: 'Date', t: 'date', req: true },
      { k: 'department', l: 'Department', t: 'dept' }, { k: 'owner', l: 'Auditor', t: 'user' },
      { k: 'checklist', l: 'Checks passed', t: 'checklist', full: true, opts: ['PPE worn by all staff', 'Fire extinguishers present & valid', 'Machine guards in place', 'Lock-out / tag-out followed', 'Housekeeping – floors clear', 'Emergency exits unobstructed', 'First-aid kit stocked', 'Hot surfaces / die heads signed', 'Chemical & resin storage safe'] },
      { k: 'findings', l: 'Findings & actions', t: 'textarea', full: true },
    ],
    columns: ['code', 'title', 'date', 'department', 'saScore', 'owner', 'status'],
    states: [S('planned', 'Planned', 'gray'), S('closed', 'Completed', 'green')],
    flow: [{ from: 'planned', to: 'closed', label: 'Complete audit', roles: ['head', 'factory', 'hr', 'mr'], requires: ['checklist'] }],
    raises: ['capa'],
  },

  pmplans: {
    title: 'Preventive Maintenance Plans', short: 'PM plan', icon: 'calendar', prefix: 'PM', procedure: 'OP/WF/039', form: 'OF/WF/067 · 069',
    desc: 'Recurring maintenance tasks (daily, weekly, monthly, quarterly). The scheduler turns due plans into work orders automatically.',
    fields: [
      { k: 'title', l: 'Task', t: 'text', req: true, full: true },
      { k: 'machine', l: 'Machine', t: 'select', opts: ['DOLCI 01 – HDPE extrusion line', 'JWELL 02 – HDPE extrusion line', 'NOVAMEC 03 – extrusion line', 'Drip irrigation line', 'Corrugated pipe line', 'Crushing machine', 'Chiller', 'Compressor', 'Water pump', 'Generator', 'Butt-fusion welding machine'], req: true },
      { k: 'frequency', l: 'Frequency', t: 'select', opts: ['Daily', 'Weekly', 'Monthly', 'Quarterly'], req: true },
      { k: 'due', l: 'Next due', t: 'date', req: true }, { k: 'owner', l: 'Technician', t: 'user' }, { k: 'department', l: 'Department', t: 'dept' },
      { k: 'checks', l: 'Checks (OF/WF/067 codes)', t: 'textarea', full: true },
    ],
    columns: ['code', 'title', 'machine', 'frequency', 'due', 'owner', 'status'],
    states: [S('active', 'Scheduled', 'green'), S('paused', 'Paused', 'amber'), S('closed', 'Discontinued', 'gray')],
    flow: [
      { from: 'active', to: 'paused', label: 'Pause plan', roles: ['maint', 'head', 'factory'] },
      { from: 'paused', to: 'active', label: 'Resume plan', roles: ['maint', 'head', 'factory'] },
      { from: 'active', to: 'closed', label: 'Discontinue', roles: ['head', 'factory'] },
    ],
  },
};

// Adjustments to modules defined in modules.js
function patch(M) {
  const add = (m, f, after) => { const i = after ? M[m].fields.findIndex((x) => x.k === after) + 1 : M[m].fields.length; M[m].fields.splice(i, 0, ...f); };
  // NCR: classification (Major / Minor / OFI) + containment
  add('ncr', [{ k: 'classification', l: 'Classification', t: 'select', opts: ['Major non-conformity', 'Minor non-conformity', 'Opportunity for improvement (OFI)'], req: true }], 'title');
  M.ncr.columns.splice(2, 0, 'classification');
  // CAPA: 5-Why + Ishikawa
  add('capa', [
    { k: 'why1', l: '5-Why 1: Why did it happen?', t: 'text', full: true }, { k: 'why2', l: 'Why 2', t: 'text', full: true }, { k: 'why3', l: 'Why 3', t: 'text', full: true },
    { k: 'why4', l: 'Why 4', t: 'text', full: true }, { k: 'why5', l: 'Why 5 → root cause', t: 'text', full: true },
    { k: 'fishbone', l: 'Ishikawa (fishbone) categories involved', t: 'checklist', full: true, opts: ['Man (people)', 'Machine', 'Material', 'Method', 'Measurement', 'Environment'] },
  ], 'correction');
  // Complaints: priority + 72 h SLA
  add('complaints', [{ k: 'priority', l: 'Priority', t: 'select', opts: ['Low', 'Medium', 'High', 'Critical'] }, { k: 'batch', l: 'Production batch no.', t: 'text' }], 'category');
  M.complaints.columns.splice(3, 0, 'priority');
  // Audits: auditor independence + checklist
  add('audits', [{ k: 'checklist', l: 'ISO 9001:2015 audit checklist (OF/WF/020) – clauses verified', t: 'checklist', full: true, opts: ['4 Context', '5 Leadership', '6 Planning', '7 Support', '8 Operation', '9 Performance evaluation', '10 Improvement'] }], 'objectives');
  // Suppliers: SRS weighting Quality 40 / Delivery 30 / Price 15 / Service 15
  add('suppliers', [{ k: 'sService', l: 'Service / support', t: 'rating' }], 'sQuality');
  M.suppliers.desc = 'Approved supplier list scored semi-annually: Quality 40 %, Delivery 30 %, Price 15 %, Service 15 % (SRS). Under 60 % is flagged underperforming.';
  add('reviews', [{ k: 'attendees', l: 'Digital attendance log', t: 'checklist', full: true, opts: ['Amanuel Tesfaye (GM)', 'Addisalem Bekele (MR)', 'Meseret Alemu', 'Dawit Fekadu', 'Tamrat (Operation)', 'Feleke Yirga (P&S)', 'Getachew (M&S)', 'Elisa (Finance)', 'Selam Tadesse (HR)'] }], 'attendance');
  M.assets.columns.splice(7, 0, 'oee');
  // Records: retention per SRS
  const rc = M.records.fields.find((f) => f.k === 'category'); rc.opts.push('Production & test logs (5 yrs)', 'Audit records (7 yrs)');
  // Production personnel can act on QA flows
  for (const m of Object.values(M)) for (const t of m.flow) { if (t.roles.includes('head') && !t.roles.includes('factory')) t.roles.push('factory'); if (t.roles.includes('qa') && !t.roles.includes('supervisor') && ['ncr', 'inspections'].includes(m.prefix.toLowerCase()) === false && m.prefix === 'NCR') t.roles.push('supervisor'); }
  for (const t of M.maintenance.flow) { if (!t.roles.includes('maint')) t.roles.push('maint'); }
  for (const t of M.calibration.flow) { if (!t.roles.includes('maint')) t.roles.push('maint'); }
}
module.exports = { NEW, patch };
