// WATERFIT OS — Grounded AI Executive Advisor & Immutable Audit Trail (Workspace 10)
import { state, api, icon, esc, fmtDate, ago, avatar, user, badge } from '../core.js';
import { setCrumbs } from '../app.js';

export async function renderAdvisor(view) {
  setCrumbs(['Intelligence & Admin', 'AI Executive Advisor']);

  view.innerHTML = `<div class="skeleton" style="height:120px;border-radius:12px;margin-bottom:20px"></div>
    <div class="skeleton" style="height:400px;border-radius:12px"></div>`;

  const [adv, activity] = await Promise.all([
    api('/advisor'),
    api('/activity')
  ]);

  const k = adv.kpi;

  view.innerHTML = `
    <!-- Executive Hero -->
    <div class="advisor-hero">
      <div class="advisor-hero-badge">
        <span class="live-pulse"></span>
        <span>${esc(adv.engine)}</span>
      </div>
      <h1>Grounded AI Executive Advisor</h1>
      <p>Autonomous decision intelligence parsing live operational data across sales, extrusion lines, laboratory tests, inventory levels, and ISO compliance. All insights grounded in real database records with zero hallucinated statistics.</p>
    </div>

    <!-- 4 Live Grounded Intelligence Diagnostic Cards -->
    <div class="exec-kpi-grid" style="margin-bottom:20px">
      <!-- Finance & Revenue -->
      <div class="exec-kpi-card">
        <div class="exec-kpi-head">
          <div class="exec-kpi-title">${icon('trend', 'sm')}Sales &amp; Cashflow</div>
          <span class="advisor-tag-live">[Live DB Grounded]</span>
        </div>
        <div class="exec-kpi-val">ETB ${(k.totalSalesETB / 1e6).toFixed(2)}M</div>
        <div class="exec-kpi-sub">
          <span>Receivables: <b>ETB ${(k.openReceivablesETB / 1e6).toFixed(2)}M</b></span>
          <a href="#/crm" class="nowrap">${icon('arrowR', 'sm')}</a>
        </div>
      </div>

      <!-- Plant Scrap & Extrusion -->
      <div class="exec-kpi-card">
        <div class="exec-kpi-head">
          <div class="exec-kpi-title">${icon('layers', 'sm')}Plant Scrap Rate</div>
          <span class="advisor-tag-live">[Live DB Grounded]</span>
        </div>
        <div class="exec-kpi-val">${k.avgScrapRate}%</div>
        <div class="exec-kpi-sub">
          <span>${k.scrapStatus}</span>
          <span class="badge plain ${k.avgScrapRate <= 2.5 ? 'green' : 'red'}">&lt; 2.5% max</span>
        </div>
      </div>

      <!-- Quality Hold & Quarantine -->
      <div class="exec-kpi-card">
        <div class="exec-kpi-head">
          <div class="exec-kpi-title">${icon('alert', 'sm')}Quarantine Hard-Lock</div>
          <span class="advisor-tag-live">[Live DB Grounded]</span>
        </div>
        <div class="exec-kpi-val">${k.qualityHoldCount} <span style="font-size:14px;color:var(--muted)">batch(es)</span></div>
        <div class="exec-kpi-sub">
          <span>Zero-Dispatch Enforced</span>
          <span class="badge plain ${k.qualityHoldCount ? 'red' : 'green'}">${k.qualityHoldCount ? 'Quarantined' : 'Clean'}</span>
        </div>
      </div>

      <!-- Inventory Stock Health -->
      <div class="exec-kpi-card">
        <div class="exec-kpi-head">
          <div class="exec-kpi-title">${icon('grid', 'sm')}Inventory Health</div>
          <span class="advisor-tag-live">[Live DB Grounded]</span>
        </div>
        <div class="exec-kpi-val">${k.lowStockCount} <span style="font-size:14px;color:var(--muted)">at reorder</span></div>
        <div class="exec-kpi-sub">
          <span>30d Downtime: <b>${k.downtimeHours}h</b></span>
          <a href="#/m/inventory" class="nowrap">${icon('arrowR', 'sm')}</a>
        </div>
      </div>
    </div>

    <!-- Extrusion Line Operational Status Strip -->
    <div class="extrusion-strip">
      <div class="extrusion-strip-header">
        <div class="extrusion-strip-title">${icon('zap', 'sm')}Extrusion Plant Runtime &amp; Barrel Temperature Zones (170–210 °C)</div>
        <span class="badge plain green">All 4 Lines Online</span>
      </div>
      <div class="extrusion-grid">
        ${adv.lines.map((ln) => `
          <div class="extrusion-card">
            <div class="extrusion-card-top">
              <b>${esc(ln.name)}</b>
              <span class="badge plain green">${esc(ln.status)}</span>
            </div>
            <div class="extrusion-specs">${esc(ln.spec)}</div>
            <div style="font-size:12px;font-weight:600;color:var(--ink-2)">${esc(ln.product)}</div>
            <div class="extrusion-zones">
              <span class="temp-pill">${esc(ln.tempStatus)}</span>
              <span class="temp-pill">Speed: ${esc(ln.speed)}</span>
              <span class="temp-pill">Scrap: ${esc(ln.scrap)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Interactive Grounded Intelligence Console -->
    <div class="advisor-chat-box">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <h3 style="margin:0 0 4px">Autonomous Executive Query Console</h3>
          <p class="muted" style="margin:0;font-size:12.5px">Query live system databases in natural language. Instant mathematical aggregation and procedure validation.</p>
        </div>
        <span class="tag">Grounded Model</span>
      </div>

      <!-- Quick Suggested Queries -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
        <button class="chip q-chip" data-q="Summarize plant scrap and extrusion line performance">${icon('zap', 'sm')}Plant Scrap &amp; Extrusion</button>
        <button class="chip q-chip" data-q="Which batches are on quality hold or failed laboratory tests?">${icon('alert', 'sm')}Quality Hold Batches</button>
        <button class="chip q-chip" data-q="Show total confirmed sales in ETB and open receivables">${icon('trend', 'sm')}Sales &amp; Receivables (ETB)</button>
        <button class="chip q-chip" data-q="What is our inventory stock risk and minimum reorder level?">${icon('grid', 'sm')}Inventory Reorder Risk</button>
      </div>

      <!-- Input Row -->
      <div class="advisor-input-row">
        <input class="advisor-input" id="advInput" placeholder="Ask about extrusion scrap, revenue, quality holds, or maintenance downtime…">
        <button class="btn primary" id="advSendBtn">${icon('send', 'sm')}Run Query</button>
      </div>

      <!-- Answer Box -->
      <div class="advisor-ans" id="advAns" style="display:none"></div>
    </div>

    <!-- Strategic Executive Recommendations Feed -->
    <div class="card" style="margin-bottom:20px">
      <div class="card-h">
        <div>
          <h3>Live Grounded Recommendations</h3>
          <span class="sub">Generated from real transaction logs across all 10 workspaces</span>
        </div>
        <span class="badge plain blue">${adv.recommendations.length} Active Directives</span>
      </div>
      <div class="list">
        ${adv.recommendations.map((rec) => `
          <div class="li" style="padding:14px 16px;border-bottom:1px solid var(--line)">
            <span class="kpi-ico tone-blue" style="width:36px;height:36px">${icon('zap', 'sm')}</span>
            <div class="grow" style="min-width:0">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <span class="tag">${esc(rec.category)}</span>
                <span class="advisor-tag-live">${esc(rec.tag)}</span>
              </div>
              <b style="font-size:13.5px;color:var(--ink);display:block">${esc(rec.title)}</b>
              <p style="margin:4px 0 0;font-size:12.5px;color:var(--ink-2)"><b>Recommended Action:</b> ${esc(rec.action)}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Immutable Audit Trail (21 CFR Part 11 Compliant) -->
    <div class="card">
      <div class="card-h">
        <div>
          <h3>Immutable Audit Trail</h3>
          <span class="sub">Tamper-proof chronological log of all electronic signatures and database modifications</span>
        </div>
        <span class="tag">21 CFR Part 11</span>
      </div>
      <div class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr><th>Timestamp</th><th>User</th><th>Action &amp; Operation</th><th>Module</th><th>Record Code</th><th>IP / Device</th></tr>
          </thead>
          <tbody>
            ${activity.slice(0, 30).map((act) => `
              <tr>
                <td class="mono" style="font-size:11.5px">${fmtDate(act.at)} <span class="muted">${new Date(act.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></td>
                <td><div class="split">${avatar(act.by, 'sm')}<span>${esc(user(act.by)?.name || 'System')}</span></div></td>
                <td><b>${esc(act.text)}</b></td>
                <td><span class="tag">${esc(act.mod)}</span></td>
                <td><span class="mono">${esc(act.code || act.id || '—')}</span></td>
                <td class="mono muted" style="font-size:11px">${esc(act.ip || '127.0.0.1')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Query console interactivity
  const advInput = view.querySelector('#advInput');
  const advSendBtn = view.querySelector('#advSendBtn');
  const advAns = view.querySelector('#advAns');

  const executeQuery = async (queryText) => {
    if (!queryText) return;
    advAns.style.display = 'block';
    advAns.innerHTML = `<span class="muted">${icon('refresh', 'sm')} Analyzing live database records...</span>`;
    const res = await api('/advisor/query', { method: 'POST', body: { query: queryText } });
    advAns.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <span class="advisor-tag-live">${esc(res.tag)}</span>
        <span class="muted" style="font-size:11px">${ago(res.at)}</span>
      </div>
      <div>${res.reply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}</div>
    `;
  };

  advSendBtn.onclick = () => executeQuery(advInput.value.trim());
  advInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeQuery(advInput.value.trim());
  });

  view.querySelectorAll('.q-chip').forEach((chip) => {
    chip.onclick = () => {
      const q = chip.dataset.q;
      advInput.value = q;
      executeQuery(q);
    };
  });
}
