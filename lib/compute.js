// Computed values and business rules for the SRS modules.
const MONTHS_BETWEEN = (a, b) => (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
const num = (v) => (v === '' || v == null || isNaN(v) ? null : Number(v));
const DEP = { Land: 0, Buildings: 5, Computers: 20 };
const PROD_CODE = { 'Drip Irrigation Pipe': 'DR', 'Single Wall Corrugated Pipe': 'SW', 'HDPE Fitting': 'FT' };

function evalLab(r) {
  const t = r.test || '', v = num(r.value);
  if (/Ash/.test(t)) return v == null ? null : v >= 2.0 && v <= 2.5 ? 'Pass' : 'Fail';
  if (/Impact/.test(t)) return v == null ? null : v <= 10 ? 'Pass' : 'Fail';
  if (/Reversion/.test(t)) return v == null ? null : v <= 3.0 ? 'Pass' : 'Fail';
  if (/Hydrostatic/.test(t)) return r.hydro ? (r.hydro === 'No failure' ? 'Pass' : 'Fail') : null;
  return null;
}
const purchaseMethod = (a) => (a == null ? null : a <= 5000 ? 'Direct purchase' : a <= 50000 ? 'Proformas required' : a <= 100000 ? 'Committee evaluation (band not defined in OP/WF/027)' : 'Advertised in mass media');

const COMPUTE = {
  appraisals: (r) => {
    const n = /Non-management|Probation/.test(r.kind || '') ? 6 : 12;
    const v = Array.from({ length: n }, (_, i) => num(r['j' + (i + 1)])).filter((x) => x != null);
    if (!v.length) return {};
    const avg = Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 100) / 100;
    return { apScore: avg, apGrade: avg >= 4.5 ? 'A – Outstanding' : avg >= 4.0 ? 'B – Excellent' : avg >= 3.5 ? 'C – Very good' : avg >= 3.0 ? 'D – Good' : 'E – Below standard' };
  },
  safetyaudits: (r) => ({ saScore: Array.isArray(r.checklist) ? Math.round((r.checklist.length / 9) * 100) : null }),
  recycling: (r) => ({ binBalance: (num(r.inKg) || 0) - (num(r.usedKg) || 0) }),
  risks: (r) => { const s = (num(r.likelihood) || 0) * (num(r.severity) || 0); return { riskScore: s || null, riskLevel: !s ? null : s >= 15 ? 'High' : s >= 8 ? 'Medium' : 'Low' }; },
  shiftlogs: (r) => { const bad = ['z1', 'z2', 'z3', 'z4', 'z5'].map((k) => num(r[k])).filter((v) => v != null && (v < 170 || v > 210)); return { tempAlert: bad.length ? `${bad.length} zone(s) outside 170–210 °C` : null }; },
  inventory: (r) => { const o = num(r.onHand), mn = num(r.min), mx = num(r.max); return { alert: o != null && mn != null && o <= mn ? 'Reorder' : o != null && mx != null && o > mx ? 'Over max' : null }; },
  purchasing: (r) => ({ method: purchaseMethod(num(r.amount)) }),
  employees: (r) => { const req = num(r.required) ?? 3; const sk = ['sExtrusion', 'sWelding', 'sLab', 'sMaint', 'sSafety'].map((k) => num(r[k])).filter((v) => v != null); return { gapCount: sk.filter((v) => v < req).length }; },
  fixedassets: (r) => {
    const cost = num(r.cost); if (cost == null || !r.purchaseDate) return {};
    const rate = r.category in DEP ? DEP[r.category] : 15; const months = Math.max(0, MONTHS_BETWEEN(new Date(r.purchaseDate), new Date()));
    const dep = Math.min(cost - 1, cost * (rate / 100) * (months / 12));
    return { depRate: rate, nbv: Math.max(1, Math.round(r.category === 'Land' ? cost : cost - dep)) };
  },
  assets: (r, db) => {
    const wo = (db.maintenance || []).filter((m) => m.machine && r.title && m.machine.split(' – ')[0].toLowerCase() === r.title.split(' – ')[0].toLowerCase() && m.kind === 'Breakdown');
    const first = r.installed ? new Date(r.installed) : new Date(Date.now() - 365 * 864e5);
    const hours = Math.max(24, (Date.now() - first.getTime()) / 36e5);
    const dt = wo.reduce((a, m) => a + (num(m.downtime) || 0), 0);
    const logs = (db.shiftlogs || []).filter((s) => s.line && r.title && s.line.toLowerCase() === r.title.toLowerCase());
    let oee = null;
    if (logs.length) { const planned = logs.length * 12, down = logs.reduce((a, s) => a + (num(s.downtime) || 0), 0), sc = logs.reduce((a, s) => a + (num(s.scrapPct) || 0), 0) / logs.length; oee = Math.round(Math.max(0, (planned - down) / planned) * (1 - sc / 100) * 1000) / 10; }
    return { oee, failures: wo.length, mttr: wo.length ? Math.round((dt / wo.length) * 10) / 10 : null, mtbf: wo.length ? Math.round((hours - dt) / wo.length) : null };
  },
};

// Validation before create/update. Throw Error(message) to reject.
const RULES = {
  production: (d, ex, ctx) => {
    const cb = num(d.carbonBlack); if (cb != null && (cb < 2.0 || cb > 2.5)) throw new Error('Carbon black masterbatch must be between 2.0 % and 2.5 % (UV protection)');
    const p = d.product ?? ex?.product, rg = num(d.regrind);
    if (rg != null && p) { const pressure = /HDPE Pipe PN/.test(p); const max = pressure ? ctx.settings.maxRegrind.pressure : ctx.settings.maxRegrind.other; if (rg > max) throw new Error(`Regrind above the allowed maximum for this product (${max} %)`); }
  },
  audits: (d, ex, ctx) => {
    const leader = ctx.user(d.leader ?? ex?.leader), dept = d.department ?? ex?.department;
    if (leader && dept && leader.dept === dept) throw new Error(`Auditor independence: ${leader.name} works in ${dept} and cannot audit it`);
  },
};
// Guards on workflow transitions.
const GUARDS = {
  expenses: (r, t, ctx) => { if (t.to === 'approved' && Number(r.amount) > 10000 && ctx.user.role !== 'gm') throw new Error('Above Birr 10,000 – General Manager approval required'); },
  dispatch: (r, t, ctx) => {
    if (t.to === 'dispatched') {
      const hold = (ctx.db.production || []).find((p) => p.batch && p.batch === r.batch && p.status === 'hold') || (ctx.db.labtests || []).find((l) => l.batch === r.batch && l.result === 'Fail' && l.status !== 'closed');
      if (hold) throw new Error(`Batch ${r.batch} is on QUALITY HOLD – it cannot be dispatched until released`);
    }
  },
};
function batchNumber(r, db) {
  const code = /HDPE Pipe/.test(r.product) ? 'HD' : PROD_CODE[r.product] || 'XX';
  const pn = (r.product.match(/PN(\d+)/) || [])[1] || '00';
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `WF-${code}-${String(r.size).replace(/\D/g, '') || '0'}-PN${pn}-${d}-D`;
  const n = (db.production || []).filter((p) => p.batch && p.batch.startsWith(prefix)).length + 1;
  return `${prefix}-${String(n).padStart(3, '0')}`;
}
module.exports = { COMPUTE, RULES, GUARDS, evalLab, batchNumber, purchaseMethod };
