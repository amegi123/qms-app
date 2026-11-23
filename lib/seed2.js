// Sample operational data for the SRS modules (illustrative – real machines, products, standards).
module.exports = function ({ mk, H, day }) {
  const batch = (code, od, pn, n) => `WF-${code}-${od}-PN${pn}-${day(-n).replace(/-/g, '')}-D-001`;
  const b1 = batch('HD', 110, 10, 3), b2 = batch('HD', 63, 10, 5), b3 = batch('DR', 16, 0, 6), b4 = batch('HD', 250, 16, 1);
  return {
    production: [
      mk('production', 'PRD', -1, { title: 'Ethio Global Construction – 250mm PN16 water main', product: 'HDPE Pipe PN16', size: '250', meters: 1800, line: 'Jwell HDPE extrusion line', resin: 'PE 100', carbonBlack: 2.3, regrind: 0, due: day(9), department: 'Operation', owner: 'u11', batch: b4, status: 'running', createdBy: 'u5' }, [H(-1, 'u11', 'Start production (assign batch no.)', 'blue')]),
      mk('production', 'PRD', -3, { title: 'UNICEF WASH – 110mm PN10 coils', product: 'HDPE Pipe PN10', size: '110', meters: 3000, line: 'DOLCI 01 line', resin: 'PE 100', carbonBlack: 2.2, regrind: 0, due: day(5), department: 'Operation', owner: 'u11', batch: b1, status: 'hold', disposition: '', createdBy: 'u5' }, [H(-2, 'u4', 'AUTO quality hold – failed Impact Strength (OF/WF/204)', 'red')]),
      mk('production', 'PRD', -5, { title: 'World Vision – 63mm PN10', product: 'HDPE Pipe PN10', size: '63', meters: 5000, line: 'DOLCI 01 line', resin: 'PE 100', carbonBlack: 2.4, regrind: 0, due: day(-1), department: 'Operation', owner: 'u11', batch: b2, status: 'transferred', createdBy: 'u5' }),
      mk('production', 'PRD', -6, { title: 'German Agro – 16mm drip lateral', product: 'Drip Irrigation Pipe', size: '16', meters: 20000, line: 'Drip irrigation line', resin: 'PE 80', carbonBlack: 2.0, regrind: 8, due: day(7), department: 'Operation', owner: 'u11', batch: b3, status: 'qc', createdBy: 'u5' }),
      mk('production', 'PRD', -2, { title: 'Water-Aid – 32mm corrugated conduit', product: 'Single Wall Corrugated Pipe', size: '32', meters: 8000, line: 'Single wall corrugated line', resin: 'PE 80', carbonBlack: 2.1, regrind: 6, due: day(14), department: 'Operation', owner: 'u11', status: 'approved', createdBy: 'u5' }),
      mk('production', 'PRD', 0, { title: 'Botor Construction – 90mm PN6', product: 'HDPE Pipe PN6', size: '90', meters: 2400, line: 'NOVAMEC 03 line', resin: 'PE 100', due: day(18), department: 'Operation', owner: 'u11', status: 'planned', createdBy: 'u7' }),
    ],
    shiftlogs: [
      mk('shiftlogs', 'SHF', 0, { title: b4, line: 'Jwell HDPE extrusion line', shift: 'Day', date: day(0), owner: 'u11', department: 'Operation', z1: 185, z2: 192, z3: 198, z4: 204, z5: 208, meltTemp: 212, meltPressure: 182, haulOff: 0.6, vacuumWater: 18, output: 420, scrapPct: 1.4, downtime: 0.5, remarks: 'Normal run.', status: 'logged', createdBy: 'u11' }),
      mk('shiftlogs', 'SHF', -1, { title: b1, line: 'DOLCI 01 line', shift: 'Night', date: day(-1), owner: 'u11', department: 'Operation', z1: 178, z2: 188, z3: 196, z4: 206, z5: 218, meltTemp: 224, meltPressure: 205, haulOff: 1.4, vacuumWater: 24, output: 610, scrapPct: 3.6, downtime: 1.5, remarks: 'Zone 5 overshoot; vacuum pump bearing noise.', status: 'logged', createdBy: 'u11' }),
      mk('shiftlogs', 'SHF', -2, { title: b2, line: 'DOLCI 01 line', shift: 'Day', date: day(-2), owner: 'u11', department: 'Operation', z1: 180, z2: 190, z3: 196, z4: 202, z5: 206, meltTemp: 210, meltPressure: 178, haulOff: 2.1, vacuumWater: 17, output: 980, scrapPct: 1.1, downtime: 0, status: 'closed', createdBy: 'u11' }),
      mk('shiftlogs', 'SHF', -3, { title: b3, line: 'Drip irrigation line', shift: 'Day', date: day(-3), owner: 'u11', department: 'Operation', z1: 172, z2: 180, z3: 188, z4: 194, z5: 198, meltTemp: 200, meltPressure: 120, haulOff: 18, vacuumWater: 16, output: 3200, scrapPct: 2.2, downtime: 0.3, status: 'closed', createdBy: 'u11' }),
    ],
    labtests: [
      mk('labtests', 'LAB', -2, { title: b1 + ' – impact', batch: b1, test: 'Impact Strength (OF/WF/204)', value: 14, testDate: day(-2), owner: 'u4', department: 'Quality Assurance', result: 'Fail', autoNcr: true, remarks: 'TIR 14 % > 10 % – brittle failures at 0 °C.', status: 'recorded', createdBy: 'u4' }),
      mk('labtests', 'LAB', -5, { title: b2 + ' – ash content', batch: b2, test: 'Ash Content (OF/WF/201)', value: 2.3, testDate: day(-5), owner: 'u4', department: 'Quality Assurance', result: 'Pass', status: 'closed', createdBy: 'u4' }, [H(-4, 'u4', 'Review results', 'blue'), H(-4, 'u2', 'Release Certificate of Analysis (e-signed)', 'green')].map((h) => ({ ...h, signed: true }))),
      mk('labtests', 'LAB', -5, { title: b2 + ' – hydrostatic 20°C', batch: b2, test: 'Hydrostatic Pressure (OF/WF/205)', hydro: 'No failure', testDate: day(-5), owner: 'u4', department: 'Quality Assurance', result: 'Pass', status: 'reviewed', createdBy: 'u4' }),
      mk('labtests', 'LAB', -6, { title: b3 + ' – shrinkage', batch: b3, test: 'Longitudinal Reversion (OF/WF/207)', value: 2.1, testDate: day(-6), owner: 'u4', department: 'Quality Assurance', result: 'Pass', status: 'recorded', createdBy: 'u4' }),
      mk('labtests', 'LAB', -1, { title: 'Resin lot GRV-0951 – ash content', batch: 'GRV-0951', test: 'Ash Content (OF/WF/201)', value: 3.1, testDate: day(-1), owner: 'u4', department: 'Quality Assurance', result: 'Fail', autoNcr: true, remarks: 'Ash 3.1 % outside 2.0–2.5 % – raw material lot quarantined.', status: 'recorded', createdBy: 'u4' }),
    ],
    risks: [
      ['Resin shortage delays production (foreign exchange / import)', 'Supply chain', 4, 5, 'Keep 6 weeks safety stock; second supplier approved', 'monitoring', 'u6'],
      ['Birr devaluation raises landed resin cost', 'Foreign exchange', 4, 4, 'Review selling prices monthly (OP/WF/021); forward purchases', 'treating', 'u8'],
      ['Extruder breakdown during large order', 'Technical / machinery', 3, 5, 'PM plan OF/WF/067 enforced; critical spares in store', 'treating', 'u5'],
      ['Out-of-spec pipe reaches customer', 'Quality', 2, 5, 'Batch certificate + quality hold + 100 % hydrostatic sample', 'monitoring', 'u2'],
      ['Policy change on imports / customs duty', 'Legal / regulatory', 3, 3, '', 'identified', 'u1'],
      ['New market: SWC conduit for telecom projects', 'Operational', 3, 4, 'Prepare technical offer', 'assessed', 'u7'],
    ].map(([title, category, l, s, treatment, status, owner], i) => mk('risks', 'RSK', -60 + i * 5, { title: title, kind: i === 5 ? 'Opportunity' : 'Risk', category, department: 'General Management', owner, likelihood: l, severity: s, treatment, due: day(30 + i * 10), status, createdBy: 'u2' })),
    assets: [
      ['Jwell HDPE extrusion line', 'Extruder', 'Jwell', 'SJ-120/33', 'JW-2019-0412', 160], ['DOLCI 01 line', 'Extruder', 'Dolci', 'DL-90', 'DL-0118', 90], ['NOVAMEC 03 line', 'Extruder', 'Novamec', 'NV-75', 'NV-7731', 75],
      ['Single wall corrugated line', 'Extruder', 'Corrugator', 'SWC-32', 'SWC-211', 45], ['Drip irrigation line', 'Extruder', 'Local build', 'DI-16', 'DI-009', 55], ['Crushing machine', 'Granulator / crusher', 'Zhang', 'ZK-400', 'ZK-8841', 30],
      ['Chiller', 'Cooling / chiller', 'Carrier', '30RB', 'CH-2210', 40], ['Compressor', 'Compressor', 'Atlas Copco', 'GA37', 'AC-5520', 37], ['Butt-fusion welding machine', 'Welding machine', 'Rothenberger', 'RO-400', 'RO-1190', 8],
    ].map(([title, assetType, make, model, serial, power], i) => mk('assets', 'AST', -900 + i, { title, assetType, make, model, serial, power, location: 'Kality factory', installed: day(-1200 + i * 60), department: 'Operation', owner: 'u10', status: i === 6 ? 'maintenance' : 'active', createdBy: 'u10' })),
    inventory: [
      ['PE 100 resin – black (25 kg bags)', 'RES-100', 'Raw HDPE resin', 'bag (25 kg)', 420, 600, 2400, 'Raw store A1'], ['PE 80 resin (25 kg bags)', 'RES-080', 'Raw HDPE resin', 'bag (25 kg)', 1100, 400, 1600, 'Raw store A2'],
      ['Carbon black masterbatch', 'MB-CB', 'Carbon black masterbatch', 'kg', 650, 500, 2000, 'Raw store B1'], ['Extruder die heater band', 'SP-HB1', 'Spare parts', 'piece', 2, 4, 12, 'Spares C3'],
      ['HDPE coil 110mm PN10 ' + b1, 'FG-110-10', 'Finished pipe coils / bundles', 'm', 2400, 0, 5000, 'FPS yard 2'], ['HDPE 63mm PN10 coils', 'FG-063-10', 'Finished pipe coils / bundles', 'm', 6200, 1000, 12000, 'FPS yard 1'],
      ['Printer ribbon', 'SP-RB', 'Spare parts', 'piece', 3, 10, 40, 'Spares C1'],
    ].map(([title, itemCode, category, unit, onHand, min, max, location], i) => mk('inventory', 'INV', -300 + i, { title, itemCode, category, unit, onHand, min, max, location, department: 'Procurement & Supply', status: i === 4 ? 'hold' : 'active', createdBy: 'u12' })),
    gatepass: [
      mk('gatepass', 'GP', -1, { title: 'PE 100 resin delivery – 24 t', direction: 'Inbound', vehicle: 'AA-3-B58213', driver: 'Dawit K.', refDoc: 'PO-2026-0412', qty: '960 bags', department: 'Procurement & Supply', status: 'closed', createdBy: 'u12' }),
      mk('gatepass', 'GP', 0, { title: 'Dispatch – UNICEF 63mm coils', direction: 'Outbound', vehicle: 'ET-4-A19844', driver: 'Mulu B.', refDoc: 'DSP-1', qty: '5,000 m', department: 'Marketing & Sales', status: 'authorized', createdBy: 'u12' }),
      mk('gatepass', 'GP', 0, { title: 'Spare parts – Jwell heater bands', direction: 'Inbound', vehicle: 'AA-2-C77120', driver: 'Courier', refDoc: 'PO-2026-0431', department: 'Procurement & Supply', status: 'requested', createdBy: 'u12' }),
    ],
    dispatch: [
      mk('dispatch', 'DSP', -8, { customer: 'World Vision', title: 'PI-2026-0368 – 63mm PN10', product: 'HDPE Pipe PN10', standard: 'ISO 4427', qty: 5000, amount: 480000, leadTime: 10, due: day(-1), department: 'Marketing & Sales', owner: 'u7', feasibility: 'Stock 1,200 m; production capacity 2 days on DOLCI 01.', batch: b2, certificate: 'LAB-2026-002', waybill: 'WB-2231', onTime: 'Yes', status: 'closed', createdBy: 'u7' }),
      mk('dispatch', 'DSP', -4, { customer: 'UNICEF', title: 'PI-2026-0412 – 110mm PN10', product: 'HDPE Pipe PN10', standard: 'ISO 4427', qty: 3000, amount: 910000, leadTime: 7, due: day(5), department: 'Marketing & Sales', owner: 'u7', feasibility: 'Run on DOLCI 01, 3 days.', batch: b1, status: 'ready', createdBy: 'u7' }),
      mk('dispatch', 'DSP', -2, { customer: 'Ethio Global Construction', title: 'PI-2026-0431 – 250mm PN16', product: 'HDPE Pipe PN16', standard: 'DIN 8074/8075', qty: 1800, amount: 2350000, leadTime: 14, due: day(9), department: 'Marketing & Sales', owner: 'u7', status: 'proforma', createdBy: 'u7' }),
      mk('dispatch', 'DSP', -15, { customer: 'Botor Construction', title: 'PI-2026-0330 – 90mm PN6', product: 'HDPE Pipe PN6', standard: 'ES / CES', qty: 1200, amount: 160000, leadTime: 7, due: day(-8), department: 'Marketing & Sales', owner: 'u7', feasibility: 'In stock.', batch: 'WF-HD-90-PN6-OLD-001', certificate: 'LAB-2025-188', waybill: 'WB-2190', onTime: 'No', status: 'closed', createdBy: 'u7' }),
    ],
    purchasing: [
      ['PE 100 resin – 24 tonnes (foreign)', 3200000, 'Foreign', 'rfq', ''], ['Heater bands for Jwell line', 42000, 'Local', 'evaluated', 'Sino Extrusion Spares Co.'], ['Printer ribbons (10)', 3800, 'Local', 'closed', 'Bole Packaging PLC'], ['Safety boots & gloves', 78000, 'Local', 'requisition', ''],
    ].map(([title, amount, origin, status, supplier], i) => mk('purchasing', 'PUR', -12 + i * 3, { title, amount, origin, budgetRef: status === 'requisition' ? '' : 'BDG-2026-' + (10 + i), department: i === 0 ? 'Procurement & Supply' : 'Operation', owner: 'u13', supplier, justification: status === 'evaluated' ? 'Lowest bid had 6-week lead time; selected supplier delivers in 10 days.' : '', status, createdBy: 'u13' })),
    correspondence: [
      mk('correspondence', 'COR', -2, { title: 'UNICEF – technical specification for 2026 WASH tender', direction: 'Incoming', party: 'UNICEF Ethiopia', refNo: 'UN/ET/0912', date: day(-2), department: 'Marketing & Sales', owner: 'u7', due: day(3), action: 'Prepare proforma and test certificates.', status: 'assigned', createdBy: 'u7' }),
      mk('correspondence', 'COR', -1, { title: 'Ethiopian Standards Agency – conformity inspection notice', direction: 'Incoming', party: 'Ethiopian Standards Agency', date: day(-1), department: 'Quality Assurance', status: 'registered', createdBy: 'u2' }),
      mk('correspondence', 'COR', -6, { title: 'Reply to Water-Aid on delivery schedule', direction: 'Outgoing', party: 'Water-Aid', refNo: 'WF/OUT/221', date: day(-6), department: 'Marketing & Sales', owner: 'u7', status: 'closed', createdBy: 'u7' }),
    ],
    employees: [
      ['Hanna Girma', 'Production Supervisor', 'Operation', 4, 4, 2, 3, 3, 4], ['Kidus Wolde', 'Senior Technician', 'Operation', 3, 2, 3, 1, 4, 3], ['Dawit Fekadu', 'QA Officer', 'Quality Assurance', 3, 2, 1, 4, 1, 3], ['Yonas Haile', 'Storekeeper', 'Procurement & Supply', 3, 0, 0, 0, 0, 3], ['Selam Tadesse', 'Admin & HR Head', 'Administration & HR', 3, 0, 0, 0, 0, 3],
    ].map(([title, position, department, required, e, w, l, m, s], i) => mk('employees', 'EMP', -700 + i, { title, position, department, hireDate: day(-900 + i * 80), education: 'BSc / Diploma', required, sExtrusion: e, sWelding: w, sLab: l, sMaint: m, sSafety: s, status: i === 3 ? 'probation' : 'active', createdBy: 'u15' })),
    hse: [
      mk('hse', 'HSE', -9, { title: 'Operator burn injury at die head', type: 'Accident / injury', severity: 'Serious', date: day(-9), location: 'DOLCI 01', person: 'Machine operator', department: 'Operation', owner: 'u5', description: 'Gloves not rated for heat while clearing the die.', action: 'Heat-resistant gloves issued; LOTO briefing for all operators.', status: 'actioned', createdBy: 'u11' }),
      mk('hse', 'HSE', -2, { title: 'Near miss – forklift and pedestrian at FPS yard', type: 'Near miss', severity: 'Minor', date: day(-2), location: 'FPS yard', department: 'Procurement & Supply', owner: 'u6', status: 'investigating', createdBy: 'u12' }),
    ],
    fixedassets: [
      ['Jwell HDPE extrusion line', 'Machinery & equipment', 14500000, -2300], ['Factory building – Kality', 'Buildings', 22000000, -3000], ['Delivery truck ET-4-A19844', 'Vehicles', 3800000, -1100], ['Office computers (12)', 'Computers', 480000, -1500], ['Kality land lease', 'Land', 6500000, -3400],
    ].map(([title, category, cost, off], i) => mk('fixedassets', 'FA', -500 + i, { title, tag: `WF-0${i + 1}-001-00${i + 1}`, category, cost, purchaseDate: day(off), location: 'Kality factory', condition: i === 3 ? 'Fair' : 'Good', department: 'Finance', status: 'active', createdBy: 'u8' })),
    memos: [
      mk('memos', 'MEM', -10, { title: 'Mandatory heat-resistant gloves at all die heads', department: 'Operation', owner: 'u17', date: day(-10), to: ['Operation', 'Quality Assurance', 'Administration & HR'], body: 'Effective immediately, heat-resistant gloves must be worn when clearing die heads. Supervisors verify at shift start.', status: 'closed', createdBy: 'u17' }),
      mk('memos', 'MEM', -3, { title: 'Annual physical inventory – 8 December', department: 'Procurement & Supply', owner: 'u6', date: day(-3), to: ['Procurement & Supply', 'Finance', 'Operation'], body: 'Count committee to be appointed by the GM. Movements frozen on count days (OP/WF/025).', status: 'approved', createdBy: 'u6' }),
      mk('memos', 'MEM', -1, { title: 'ISO 9001 surveillance audit preparation', department: 'Quality Assurance', owner: 'u2', date: day(-1), to: [], body: '', status: 'draft', createdBy: 'u2' }),
    ],
    recycling: [
      mk('recycling', 'RCY', -2, { title: 'Crusher run – start-up purge', date: day(-2), material: 'HDPE black (PE 100)', source: 'Start-up purge', inKg: 260, usedKg: 180, bin: 'Bin R1', runHours: 3, owner: 'u11', department: 'Operation', status: 'closed', createdBy: 'u11' }),
      mk('recycling', 'RCY', -1, { title: 'Crusher run – NCR coils 110mm', date: day(-1), material: 'HDPE black (PE 100)', source: 'Non-conforming batch (NCR)', inKg: 1400, usedKg: 0, bin: 'Bin R2', runHours: 6, owner: 'u11', department: 'Operation', status: 'logged', createdBy: 'u11' }),
      mk('recycling', 'RCY', -4, { title: 'Corrugated trimmings', date: day(-4), material: 'Corrugated conduit', source: 'Cut-offs / trimmings', inKg: 120, usedKg: 100, bin: 'Bin R3', runHours: 1, owner: 'u11', department: 'Operation', status: 'closed', createdBy: 'u11' }),
    ],
    fgtransfer: [
      mk('fgtransfer', 'FGT', -5, { title: 'World Vision 63mm PN10 – transfer to FPS', batch: b2, product: 'HDPE Pipe PN10', qty: '5,000 m (50 coils)', location: 'FPS yard 1', department: 'Operation', status: 'closed', createdBy: 'u11' }, [H(-5, 'u11', 'Production supervisor signs (e-signed)', 'blue'), H(-5, 'u12', 'Store keeper receives & co-signs (e-signed)', 'green')].map((h) => ({ ...h, signed: true }))),
      mk('fgtransfer', 'FGT', -1, { title: 'German Agro drip lateral 16mm – transfer', batch: b3, product: 'Drip Irrigation Pipe', qty: '20,000 m', location: 'FPS yard 3', department: 'Operation', status: 'supervisor', createdBy: 'u11' }),
      mk('fgtransfer', 'FGT', 0, { title: 'Ethio Global 250mm PN16 – first coils', batch: b4, product: 'HDPE Pipe PN16', qty: '600 m', department: 'Operation', status: 'drafted', createdBy: 'u11' }),
    ],
    appraisals: [
      mk('appraisals', 'APR', -20, { title: 'Hanna Girma', position: 'Production Supervisor', kind: 'Management staff (OF/WF/103)', period: 'Jan–Jun 2026', department: 'Operation', owner: 'u17', j1: 5, j2: 4, j3: 4, j4: 5, j5: 4, j6: 5, j7: 4, j8: 4, j9: 4, j10: 4, j11: 5, j12: 3, comments: 'Strong shift control; improve cost awareness on scrap.', status: 'closed', createdBy: 'u17' }),
      mk('appraisals', 'APR', -8, { title: 'Kidus Wolde', position: 'Maintenance Officer', kind: 'Non-management staff (OF/WF/104)', period: 'Jul–Dec 2026', department: 'Operation', owner: 'u5', j1: 4, j2: 3, j3: 4, j4: 4, j5: 3, j6: 4, comments: 'Good diagnostics; attendance to improve.', status: 'evaluated', createdBy: 'u5' }),
      mk('appraisals', 'APR', -2, { title: 'Yonas Haile', position: 'Store Keeper', kind: 'Probation (OF/WF/105)', period: '45-day probation', department: 'Procurement & Supply', owner: 'u6', status: 'draft', createdBy: 'u6' }),
    ],
    ppe: [
      mk('ppe', 'PPE', -30, { title: 'Abel Mekonnen', ppeType: 'Heat-resistant gloves', qty: 2, issueDate: day(-30), due: day(60), department: 'Operation', owner: 'u15', status: 'issued', createdBy: 'u15' }),
      mk('ppe', 'PPE', -200, { title: 'Samrawit Dessie', ppeType: 'Safety boots', qty: 1, issueDate: day(-200), due: day(-5), department: 'Operation', owner: 'u15', status: 'issued', createdBy: 'u15' }),
      mk('ppe', 'PPE', -90, { title: 'Hanna Girma', ppeType: 'Ear plugs / muffs', qty: 1, issueDate: day(-90), due: day(90), department: 'Operation', owner: 'u15', status: 'closed', createdBy: 'u15' }),
    ],
    safetyaudits: [
      mk('safetyaudits', 'SAF', -14, { title: 'Extrusion hall – DOLCI / JWELL', date: day(-14), department: 'Operation', owner: 'u17', checklist: ['PPE worn by all staff', 'Fire extinguishers present & valid', 'Machine guards in place', 'Housekeeping – floors clear', 'Emergency exits unobstructed', 'First-aid kit stocked', 'Chemical & resin storage safe'], findings: 'Lock-out / tag-out not followed on night shift; hot-surface signs missing at die heads.', status: 'closed', createdBy: 'u17' }),
      mk('safetyaudits', 'SAF', -2, { title: 'Finished goods yard & loading', date: day(12), department: 'Procurement & Supply', owner: 'u15', status: 'planned', createdBy: 'u15' }),
    ],
    pmplans: [
      ['Daily extruder check – heaters, vacuum, cooling', 'JWELL 02 – HDPE extrusion line', 'Daily', -1, 'Checks 34, 35, 63, 67'], ['Weekly lubrication & gearbox oil level', 'DOLCI 01 – HDPE extrusion line', 'Weekly', 2, 'Checks 01, 03, 08'],
      ['Monthly gearbox oil inspection', 'NOVAMEC 03 – extrusion line', 'Monthly', -3, 'Checks 01, 03'], ['Quarterly electrical panel thermal scan', 'JWELL 02 – HDPE extrusion line', 'Quarterly', 30, 'Checks 54, 40'], ['Compressor oil & filter', 'Compressor', 'Monthly', 12, 'Check 57'],
    ].map(([title, machine, frequency, off, checks], i) => mk('pmplans', 'PM', -100 + i, { title, machine, frequency, due: day(off), owner: 'u10', department: 'Operation', checks, status: 'active', createdBy: 'u10' })),
    expenses: [
      mk('expenses', 'PAY', -3, { title: 'Spare parts payment – heater bands', type: 'Purchase payment', payee: 'Sino Extrusion Spares Co.', amount: 42000, department: 'Procurement & Supply', owner: 'u13', status: 'approved', createdBy: 'u13' }),
      mk('expenses', 'PAY', -1, { title: 'Site visit per diem – Adama project', type: 'Per diem request', payee: 'Getachew', amount: 6400, department: 'Marketing & Sales', owner: 'u7', status: 'requested', createdBy: 'u14' }),
      mk('expenses', 'PAY', -6, { title: 'Petty cash – cleaning supplies', type: 'Petty cash voucher', payee: 'Local shop', amount: 450, department: 'Administration & HR', status: 'closed', createdBy: 'u9' }),
      mk('expenses', 'PAY', -2, { title: 'Resin import – bank payment 1st tranche', type: 'Payment request', payee: 'Ethiopian Petrochemical Imports', amount: 1600000, department: 'Finance', owner: 'u8', status: 'requested', createdBy: 'u8' }),
    ],
  };
};
