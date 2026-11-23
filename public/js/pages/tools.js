// Finance & production calculators from the SRS: landed cost (OP/WF/019), selling price (OP/WF/021), batch number (OF/WF/202).
import { icon, esc, $ } from '../core.js';
import { setCrumbs } from '../app.js';

const n = (id) => parseFloat(document.getElementById(id)?.value) || 0;
const fmt = (v, d = 2) => (isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : '—');
const inp = (id, label, val, hint = '') => `<div class="fld"><label>${label}</label><input class="input" type="number" step="any" id="${id}" value="${val}">${hint ? `<div class="hint">${hint}</div>` : ''}</div>`;

export async function renderTools(view) {
  setCrumbs(['Organization', 'Calculators & Tools']);
  view.innerHTML = `
  <div class="ph"><div><div class="eyebrow">OP/WF/019 · OP/WF/021 · OF/WF/202</div><h1>Calculators & Tools</h1><p>Landed cost of imported resin, selling price formulation and the standard batch-number format — all update as you type.</p></div></div>
  <div class="grid g2" style="margin-bottom:16px">
    <div class="card"><div class="card-h"><span class="kpi-ico tone-blue">${icon('truck', 'sm')}</span><h3>Foreign purchase – landed cost per kg</h3><span class="sub">OP/WF/019</span></div><div class="card-b">
      <div class="form">${inp('lc_cif', 'CIF invoice value (Birr)', 3200000)}${inp('lc_kg', 'Quantity (kg)', 24000)}${inp('lc_bank', 'Bank charges & LC (Birr)', 38000)}${inp('lc_duty', 'Customs duty & taxes (% of CIF)', 12, 'Enter the tariff for the resin HS code')}${inp('lc_ship', 'Shipping / demurrage (Birr)', 95000)}${inp('lc_inland', 'Inland transport (Birr)', 62000)}</div>
      <div class="callout ok" style="margin-top:16px" id="lc_out"></div></div></div>
    <div class="card"><div class="card-h"><span class="kpi-ico tone-teal">${icon('chart', 'sm')}</span><h3>Selling price formulation</h3><span class="sub">OP/WF/021</span></div><div class="card-b">
      <div class="form">${inp('sp_resin', 'Resin cost (Birr/kg)', 168)}${inp('sp_mb', 'Masterbatch cost (Birr/kg)', 210)}${inp('sp_cb', 'Carbon black in mix (%)', 2.3, 'SRS: 2.0 – 2.5 %')}${inp('sp_elec', 'Electricity (Birr/kg)', 6.5)}${inp('sp_dep', 'Machine depreciation (Birr/kg)', 4)}${inp('sp_labor', 'Labour (Birr/kg)', 7)}${inp('sp_scrap', 'Scrap loss (%)', 2.5)}${inp('sp_margin', 'Target profit margin (%)', 18)}${inp('sp_wpm', 'Pipe weight (kg per metre)', 1.9, 'Optional – gives price per metre')}</div>
      <div class="callout ok" style="margin-top:16px" id="sp_out"></div></div></div>
  </div>
  <div class="card"><div class="card-h"><span class="kpi-ico tone-violet">${icon('flask', 'sm')}</span><h3>Batch number generator</h3><span class="sub">OF/WF/202 · printed on every pipe metre</span></div><div class="card-b">
    <div class="form" style="grid-template-columns:repeat(6,minmax(0,1fr))">
      <div class="fld"><label>Product type</label><select class="select" id="bn_t"><option value="HD">HD – HDPE pressure</option><option value="DR">DR – Drip irrigation</option><option value="SW">SW – Corrugated</option><option value="FT">FT – Fitting</option></select></div>
      ${inp('bn_od', 'OD (mm)', 110)}${inp('bn_pn', 'PN rating', 10)}<div class="fld"><label>Date</label><input class="input" type="date" id="bn_d" value="${new Date().toISOString().slice(0, 10)}"></div>
      <div class="fld"><label>Shift</label><select class="select" id="bn_s"><option>D</option><option>N</option></select></div>${inp('bn_q', 'Sequence', 1)}</div>
    <div class="split" style="margin-top:16px"><code class="code" style="font-size:16px;padding:8px 12px" id="bn_out"></code><button class="btn" id="bn_copy">${icon('clip', 'sm')}Copy</button></div>
    <p class="muted" style="margin:10px 0 0;font-size:12.5px">Format: WF-[PROD_TYPE]-[OD_MM]-[PN]-[YYYYMMDD]-[SHIFT]-[SEQ]. Production orders assign this number automatically when started.</p></div></div>`;

  const calc = () => {
    const cif = n('lc_cif'), duty = (cif * n('lc_duty')) / 100, total = cif + n('lc_bank') + duty + n('lc_ship') + n('lc_inland');
    $('#lc_out').innerHTML = `<b>Landed cost: Birr ${fmt(total / (n('lc_kg') || 1))} per kg</b><div class="muted" style="margin-top:4px">Total landed Birr ${fmt(total, 0)} · duty Birr ${fmt(duty, 0)} · uplift over CIF ${fmt(((total - cif) / (cif || 1)) * 100, 1)} %</div>`;
    const cb = n('sp_cb') / 100, mat = (n('sp_resin') * (1 - cb) + n('sp_mb') * cb) / (1 - n('sp_scrap') / 100);
    const cost = mat + n('sp_elec') + n('sp_dep') + n('sp_labor'), price = cost / (1 - n('sp_margin') / 100);
    $('#sp_out').innerHTML = `<b>Selling price: Birr ${fmt(price)} per kg</b>${n('sp_wpm') ? ` · <b>Birr ${fmt(price * n('sp_wpm'))} per metre</b>` : ''}<div class="muted" style="margin-top:4px">Cost Birr ${fmt(cost)}/kg (material incl. scrap ${fmt(mat)}) · margin Birr ${fmt(price - cost)}/kg · VAT excluded</div>`;
    const d = ($('#bn_d').value || '').replace(/-/g, '');
    $('#bn_out').textContent = `WF-${$('#bn_t').value}-${n('bn_od')}-PN${n('bn_pn')}-${d}-${$('#bn_s').value}-${String(n('bn_q')).padStart(3, '0')}`;
  };
  view.querySelectorAll('input,select').forEach((el) => (el.oninput = calc)); calc();
  $('#bn_copy').onclick = () => navigator.clipboard?.writeText($('#bn_out').textContent);
}
