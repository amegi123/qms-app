// WATERFIT OS — Sales & CRM Pipeline (OP/WF/030 Order Branching)
import { state, api, icon, esc, fmtDate, badge, toast, modal, confirmBox } from '../core.js';
import { setCrumbs } from '../app.js';

export async function renderCrm(view) {
  setCrumbs(['Sales & CRM Pipeline']);

  view.innerHTML = `<div class="skeleton" style="height:80px;border-radius:12px;margin-bottom:20px"></div>
    <div class="skeleton" style="height:500px;border-radius:12px"></div>`;

  const [leads, dispatches, inv] = await Promise.all([
    api('/leads'),
    api('/m/dispatch'),
    api('/m/inventory')
  ]);

  const totalPipelineVal = leads.reduce((s, l) => s + (Number(l.estimatedVal) || 0), 0);
  const totalSalesVal = dispatches.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const wonCount = leads.filter((l) => l.stage === 'order_won').length;
  const conversionRate = leads.length ? Math.round((wonCount / leads.length) * 100) : 0;

  const STAGES = [
    { key: 'inquiry', title: 'New Leads / Inquiries', tone: 'blue' },
    { key: 'qualified', title: 'Technical Evaluation', tone: 'amber' },
    { key: 'quote_sent', title: 'Proforma Issued', tone: 'violet' },
    { key: 'order_won', title: 'Order Confirmed (OP/WF/030)', tone: 'teal' },
    { key: 'dispatched', title: 'Dispatched / Fulfilled', tone: 'green' }
  ];

  const channelBadge = (ch) => {
    const map = {
      'TikTok': 'tone-red',
      'Web': 'tone-blue',
      'Referral': 'tone-green',
      'Direct / Tender': 'tone-violet'
    };
    return `<span class="tag ${map[ch] || ''}">${esc(ch || 'Direct')}</span>`;
  };

  view.innerHTML = `
    <!-- Header -->
    <div class="ph">
      <div>
        <div class="eyebrow">OP/WF/030 Customer Order Capture &amp; Fulfillment · Business OS</div>
        <h1>Sales &amp; CRM Pipeline</h1>
        <p>Omni-channel leads (TikTok, Web, Referrals, Tenders) with automatic stock-available vs. production-required decision routing.</p>
      </div>
      <div class="actions">
        <button class="btn" id="crmCreditBtn">${icon('shield', 'sm')}Customer Credit Tiers</button>
        <button class="btn primary" id="newLeadBtn">${icon('plus', 'sm')}New Inquiry / Lead</button>
      </div>
    </div>

    <!-- Executive CRM KPI Cards -->
    <div class="exec-kpi-grid">
      <div class="exec-kpi-card">
        <div class="exec-kpi-head">
          <div class="exec-kpi-title">${icon('trend', 'sm')}Total Pipeline Value</div>
          <span class="tag">Active</span>
        </div>
        <div class="exec-kpi-val">ETB ${(totalPipelineVal / 1e6).toFixed(2)}M</div>
        <div class="exec-kpi-sub"><span>${leads.length} qualified opportunities</span></div>
      </div>
      <div class="exec-kpi-card">
        <div class="exec-kpi-head">
          <div class="exec-kpi-title">${icon('check', 'sm')}Invoiced &amp; Dispatched</div>
          <span class="badge plain green">Fulfilled</span>
        </div>
        <div class="exec-kpi-val">ETB ${(totalSalesVal / 1e6).toFixed(2)}M</div>
        <div class="exec-kpi-sub"><span>${dispatches.length} completed dispatches</span></div>
      </div>
      <div class="exec-kpi-card">
        <div class="exec-kpi-head">
          <div class="exec-kpi-title">${icon('smile', 'sm')}Win / Conversion Rate</div>
          <span class="tag">Q4 Performance</span>
        </div>
        <div class="exec-kpi-val">${conversionRate}%</div>
        <div class="exec-kpi-sub"><span>${wonCount} of ${leads.length} leads converted</span></div>
      </div>
      <div class="exec-kpi-card">
        <div class="exec-kpi-head">
          <div class="exec-kpi-title">${icon('layers', 'sm')}Branching Decision</div>
          <span class="badge plain ok">OP/WF/030</span>
        </div>
        <div class="exec-kpi-val" style="font-size:18px">Stock vs. Production</div>
        <div class="exec-kpi-sub"><span>Automated dispatch / scheduling</span></div>
      </div>
    </div>

    <!-- CRM Mobile Stage Switcher Nav (Visible on mobile viewports <= 860px) -->
    <div class="crm-mobile-nav" id="crmMobileNav">
      ${STAGES.map((st, idx) => {
        const stageLeads = leads.filter((l) => (st.key === 'dispatched' ? l.stage === 'dispatched' || l.stage === 'order_won' : l.stage === st.key));
        const shortName = st.key === 'inquiry' ? 'Inquiries' :
                          st.key === 'qualified' ? 'Evaluation' :
                          st.key === 'quote_sent' ? 'Proforma' :
                          st.key === 'order_won' ? 'Confirmed' : 'Dispatched';
        return `
          <button class="crm-stage-tab ${idx === 0 ? 'active' : ''}" data-stage="${st.key}">
            <span>${esc(shortName)}</span>
            <span class="badge plain ${st.tone}">${stageLeads.length}</span>
          </button>
        `;
      }).join('')}
    </div>

    <!-- CRM Kanban Board -->
    <div class="crm-board" id="crmBoard">
      ${STAGES.map((st, idx) => {
        const stageLeads = leads.filter((l) => (st.key === 'dispatched' ? l.stage === 'dispatched' || l.stage === 'order_won' : l.stage === st.key));
        return `
          <div class="crm-col ${idx === 0 ? 'active-mobile-stage' : ''}" data-stage="${st.key}">
            <div class="crm-col-h">
              <span>${esc(st.title)}</span>
              <span class="badge plain ${st.tone}">${stageLeads.length}</span>
            </div>
            <div class="crm-col-list">
              ${stageLeads.length ? stageLeads.map((l) => `
                <div class="crm-deal-card" data-id="${l.id}">
                  <div class="crm-deal-meta">
                    <span class="mono">${esc(l.code)}</span>
                    ${channelBadge(l.channel)}
                  </div>
                  <div class="crm-deal-title">${esc(l.customer)}</div>
                  <div style="font-size:12px;color:var(--ink-2)">${esc(l.product)}</div>
                  <div class="crm-deal-val">ETB ${Number(l.estimatedVal).toLocaleString()}</div>
                  <div style="font-size:11px;color:var(--muted);margin-top:2px">${esc(l.contact || 'No contact')}</div>
                  <div style="margin-top:8px;display:flex;gap:6px">
                    <button class="btn sm branch-btn" data-id="${l.id}" title="OP/WF/030 Order Branching" style="flex:1;font-size:11px;padding:4px 8px">
                      ${icon('layers', 'sm')}Route Order
                    </button>
                  </div>
                </div>
              `).join('') : '<div class="empty" style="padding:24px 8px"><small>No opportunities in this stage</small></div>'}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Mobile CRM Stage Switcher Tab Binding
  const stageTabs = view.querySelectorAll('.crm-stage-tab');
  const stageCols = view.querySelectorAll('.crm-col');
  stageTabs.forEach((tab) => {
    tab.onclick = () => {
      stageTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const targetStage = tab.dataset.stage;
      stageCols.forEach((col) => {
        if (col.dataset.stage === targetStage) {
          col.classList.add('active-mobile-stage');
        } else {
          col.classList.remove('active-mobile-stage');
        }
      });
    };
  });

  // New Lead Modal
  view.querySelector('#newLeadBtn').onclick = () => {
    const m = modal({
      title: 'New Customer Inquiry / Lead',
      body: `
        <form id="leadForm" class="form" onsubmit="return false;">
          <div class="fld"><label>Customer / Enterprise Name *</label><input class="input" id="ld_cust" placeholder="e.g. Oromia Water Bureau, Botor Construction" required></div>
          <div class="fld"><label>Contact Person &amp; Phone</label><input class="input" id="ld_contact" placeholder="Ato / W/ro ... (0911-...)"></div>
          <div class="fld"><label>Acquisition Channel</label>
            <select class="select" id="ld_ch">
              <option value="Web">Website Inquiry</option>
              <option value="TikTok">TikTok / Social Media</option>
              <option value="Referral">Client Referral</option>
              <option value="Direct / Tender">Direct / Enterprise Tender</option>
            </select>
          </div>
          <div class="fld"><label>Product Required *</label>
            <select class="select" id="ld_prod">
              <option value="HDPE Pipe PN10 (90mm)">HDPE Pipe PN10 (90mm)</option>
              <option value="HDPE Pipe PN16 (160mm & 250mm)">HDPE Pipe PN16 (160mm & 250mm)</option>
              <option value="HDPE Pipe PN6 (63mm)">HDPE Pipe PN6 (63mm)</option>
              <option value="Drip Irrigation Pipe 16mm">Drip Irrigation Pipe 16mm</option>
              <option value="Single Wall Corrugated Pipe (DN 100mm)">Single Wall Corrugated Pipe (DN 100mm)</option>
            </select>
          </div>
          <div class="fld"><label>Estimated Order Value (ETB) *</label><input class="input" type="number" id="ld_val" value="1500000" required></div>
          <div class="fld full"><label>Project Notes / Technical Specifications</label><textarea class="textarea" id="ld_notes" rows="2" placeholder="Required pressure rating, project location, delivery timeline..."></textarea></div>
          <div class="form-actions" style="margin-top:14px;display:flex;justify-content:flex-end;gap:8px">
            <button class="btn" type="button" id="ldCancel">Cancel</button>
            <button class="btn primary" type="submit" id="ldSave">Create Opportunity</button>
          </div>
        </form>
      `
    });
    m.querySelector('#ldCancel').onclick = () => m.close();
    m.querySelector('#leadForm').onsubmit = async () => {
      const body = {
        customer: m.querySelector('#ld_cust').value.trim(),
        contact: m.querySelector('#ld_contact').value.trim(),
        channel: m.querySelector('#ld_ch').value,
        product: m.querySelector('#ld_prod').value,
        estimatedVal: Number(m.querySelector('#ld_val').value) || 0,
        notes: m.querySelector('#ld_notes').value.trim()
      };
      await api('/leads', { method: 'POST', body });
      toast('Opportunity created');
      m.close();
      renderCrm(view);
    };
  };

  // Customer Credit Tiers Directory Modal
  view.querySelector('#crmCreditBtn').onclick = () => {
    modal({
      title: 'Waterfit Customer Credit Tiers & Dispatch Limits',
      body: `
        <p class="muted" style="margin-top:0">Official credit limit governance governing OP/WF/030 dispatch authorizations.</p>
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th>Tier</th><th>Customer Category</th><th>Credit Limit (ETB)</th><th>Payment Terms</th><th>Dispatch Approval Rule</th></tr></thead>
            <tbody>
              <tr><td><span class="badge plain green">Tier A</span></td><td><b>Government &amp; Regional Water Bureaus</b></td><td>Up to ETB 20,000,000</td><td>45 days credit</td><td>Standard Sales Officer sign-off</td></tr>
              <tr><td><span class="badge plain blue">Tier B</span></td><td><b>Established Grade 1–3 Contractors</b></td><td>Up to ETB 5,000,000</td><td>30 days credit</td><td>Finance Officer credit check required</td></tr>
              <tr><td><span class="badge plain amber">Tier C</span></td><td><b>Private Commercial &amp; New Contractors</b></td><td>ETB 500,000</td><td>15 days / 50% deposit</td><td>Finance Manager sign-off</td></tr>
              <tr><td><span class="badge plain red">Tier D</span></td><td><b>Spot / Retail / Walk-in Customers</b></td><td>0 (Zero credit)</td><td>100% advance payment</td><td>Dispatch blocked until payment receipt confirmed</td></tr>
            </tbody>
          </table>
        </div>
      `
    });
  };

  // OP/WF/030 Order Branching Trigger
  view.querySelectorAll('.branch-btn').forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const leadId = btn.dataset.id;
      const lead = leads.find((l) => l.id === leadId);
      if (!lead) return;

      const m = modal({
        title: `OP/WF/030 Order Branching: ${esc(lead.customer)}`,
        body: `
          <p>Evaluate inventory availability against requirements to trigger <b>Stock Reservation (Branch A)</b> or <b>Production Scheduling (Branch B)</b>.</p>
          <div class="card-b" style="background:var(--surface-2);border-radius:8px;padding:12px;margin-bottom:14px">
            <div><b>Customer:</b> ${esc(lead.customer)}</div>
            <div><b>Product:</b> ${esc(lead.product)}</div>
            <div><b>Estimated Value:</b> ETB ${Number(lead.estimatedVal).toLocaleString()}</div>
          </div>
          <div class="fld"><label>Requested Quantity (Meters)</label><input class="input" type="number" id="branchMeters" value="2400"></div>
          <div class="form-actions" style="margin-top:16px;display:flex;justify-content:flex-end;gap:8px">
            <button class="btn" id="branchCancel">Cancel</button>
            <button class="btn primary" id="executeBranchBtn">${icon('layers', 'sm')}Execute OP/WF/030 Branching</button>
          </div>
        `
      });
      m.querySelector('#branchCancel').onclick = () => m.close();
      m.querySelector('#executeBranchBtn').onclick = async () => {
        const meters = Number(m.querySelector('#branchMeters').value) || 2400;
        const res = await api(`/leads/${leadId}/branch`, { method: 'POST', body: { meters } });
        m.close();
        modal({
          title: res.branch === 'stock_available' ? 'Branch A: Stock Available' : 'Branch B: Production Required',
          body: `
            <div class="callout ${res.branch === 'stock_available' ? 'ok' : 'info'}" style="margin-bottom:12px">
              <b>${res.message}</b>
            </div>
            ${res.dispatch ? `<p><b>Dispatch Order Created:</b> <a href="#/m/dispatch/${res.dispatch.id}">${res.dispatch.code}</a></p>` : ''}
            ${res.production ? `<p><b>Work Order Created:</b> <a href="#/m/production/${res.production.id}">${res.production.code}</a></p>` : ''}
          `
        });
        renderCrm(view);
      };
    };
  });
}
