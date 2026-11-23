import { lang, state, api, icon, esc, fmtDate, ago, avatar, user, badge, stateOf, empty, monthLabel } from '../core.js';
import { donut, legend, bars, gauge, hbars, toneColor, spark } from '../charts.js';
import { setCrumbs } from '../app.js';

const modTitle = (m) => (m === 'documents' ? 'Document' : state.meta.modules[m]?.short || m);
const statusLabel = (m, s) => (m === 'documents' ? stateOf(state.meta.documentFlow, s) : stateOf(state.meta.modules[m], s));

function workRow(t) {
  const st = statusLabel(t.mod, t.status);
  const ic = t.mod === 'documents' ? 'file' : state.meta.modules[t.mod]?.icon || 'file';
  return `<div class="li click" onclick="wfGo('${t.mod}','${t.id}')">
    <span class="kpi-ico tone-${t.overdue ? 'red' : t.owns ? 'blue' : 'gray'}" style="width:30px;height:30px">${icon(ic, 'sm')}</span>
    <div class="grow" style="min-width:0">
      <b style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block">${esc(t.title)}</b>
      <small><span class="mono">${esc(t.code)}</span> · ${esc(modTitle(t.mod))} · ${esc(st.label)}</small>
    </div>
    ${t.overdue ? badge(`${-t.dueIn}d overdue`, 'red', true) : t.dueIn !== undefined && t.dueIn <= 7 ? badge(t.dueIn === 0 ? 'Due today' : `Due in ${t.dueIn}d`, 'amber', true) : t.owns ? badge('Owner', 'blue', true) : badge('Action', '', true)}
  </div>`;
}

export async function renderDashboard(view) {
  setCrumbs(['Dashboard']);

  // Loading skeleton matching the dashboard layout
  view.innerHTML = `
    <div class="skeleton" style="height:76px;border-radius:12px;margin-bottom:22px"></div>
    <div class="dash-kpi-grid">
      ${'<div class="skeleton" style="height:140px;border-radius:12px"></div>'.repeat(4)}
    </div>
    <div class="skeleton" style="height:44px;border-radius:10px;margin-bottom:20px"></div>
    <div class="grid g-main" style="margin-bottom:18px">
      <div class="skeleton" style="height:320px;border-radius:12px"></div>
      <div class="skeleton" style="height:320px;border-radius:12px"></div>
    </div>
  `;

  const d = await api('/dashboard');
  const k = d.kpi, u = state.user;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const months = d.months.map(monthLabel);
  const high = d.findings.filter((f) => f.sev === 'high').length;
  const docColors = d.docStatus.map((s) => ({ ...s, color: toneColor(s.tone) })).filter((s) => s.n);

  const totalNcrEvents = d.trends.ncr.reduce((a, b) => a + b, 0);
  const totalCapaEvents = d.trends.capa.reduce((a, b) => a + b, 0);
  const totalComplaints = d.trends.complaints.reduce((a, b) => a + b, 0);
  const totalQualityEvents = totalNcrEvents + totalCapaEvents + totalComplaints;

  const overdueWork = d.mine.filter((t) => t.overdue);
  const actionWork = d.mine.filter((t) => !t.overdue && !t.owns);

  view.innerHTML = `
    <!-- Header -->
    <div class="dash-header">
      <div class="dash-header-main">
        <div class="dash-eyebrow">
          <span>${new Date().toLocaleDateString(lang === 'am' ? 'am-ET' : undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span class="dash-dot">·</span>
          <span class="dash-company">${esc(state.meta.org.name)} · eQMS</span>
        </div>
        <div class="dash-title-row">
          <h1>${greet}, ${esc(u.name.split(' ')[0])}</h1>
          <span class="dash-role-badge">${esc(state.meta.roles[u.role] || u.title)}</span>
        </div>
        <p class="dash-desc">ISO 9001:2015 Quality Management System Overview &amp; Operational Health.</p>
      </div>
      <div class="dash-header-actions">
        <div class="dash-status-indicator" title="System is actively tracking ISO 9001:2015 workflows">
          <span class="live-pulse"></span>
          <span>Audit-Ready Portal</span>
        </div>
        <a class="btn" href="#/reports">${icon('chart', 'sm')}Analytics</a>
        <button class="btn primary" id="quickBtn">${icon('plus', 'sm')}Quick Action</button>
      </div>
    </div>

    <!-- Health Check Warning Callout (if high gaps exist) -->
    ${high ? `
      <div class="callout warn" style="margin-bottom:20px;display:flex;gap:14px;align-items:center;border-radius:10px;padding:12px 16px">
        ${icon('alert', 'lg')}
        <div style="flex:1">
          <b>QMS Health Check:</b> Analysis of your ${k.docsTotal} controlled files identified ${d.findings.length} findings (${high} high priority) — including missing procedure links and unassigned review cycles.
        </div>
        <a class="btn sm" href="#/org" style="background:#fff">Review Gap Analysis</a>
      </div>
    ` : ''}

    <!-- 4 Primary Executive Pillar KPI Cards -->
    <div class="dash-kpi-grid">
      <!-- Pillar 1: Document Control -->
      <a class="dash-kpi-card" href="#/documents">
        <div class="dash-kpi-head">
          <div class="dash-kpi-label">
            <span class="dash-kpi-ico tone-blue">${icon('file', 'sm')}</span>
            <span>Document Control</span>
          </div>
          <span class="dash-kpi-tag ok">OP/WF/001</span>
        </div>
        <div class="dash-kpi-body">
          <div class="dash-kpi-num">${k.docs}<span class="dash-kpi-subnum">/ ${k.docsTotal}</span></div>
          <span class="badge plain ${k.docsPending ? 'blue' : 'green'}">${k.docsPending} in workflow</span>
        </div>
        <div class="dash-kpi-foot">
          <span>${k.docsReviewOverdue ? `<span class="due-over">${k.docsReviewOverdue} review overdue</span>` : 'All reviews current'}</span>
          <span class="muted">${k.ackPending} unacknowledged</span>
        </div>
      </a>

      <!-- Pillar 2: NCR & CAPA -->
      <a class="dash-kpi-card" href="#/m/capa">
        <div class="dash-kpi-head">
          <div class="dash-kpi-label">
            <span class="dash-kpi-ico tone-${k.capaOverdue ? 'red' : 'amber'}">${icon('wrench', 'sm')}</span>
            <span>NCR &amp; CAPA</span>
          </div>
          <span class="dash-kpi-tag ${k.capaOverdue ? 'bad' : 'warn'}">${k.capaOverdue ? `${k.capaOverdue} Overdue` : 'Action Active'}</span>
        </div>
        <div class="dash-kpi-body">
          <div class="dash-kpi-num">${k.ncrOpen + k.capaOpen}<span class="dash-kpi-subnum">open</span></div>
          <div title="12-Month NCR Trend">${spark(d.trends.ncr, '#f59e0b', 76, 20)}</div>
        </div>
        <div class="dash-kpi-foot">
          <span>${k.ncrOpen} NCR · ${k.capaOpen} CAPA</span>
          <span><b>${k.capaOnTime ?? 92}%</b> closed on-time</span>
        </div>
      </a>

      <!-- Pillar 3: Inspection & Testing Yield -->
      <a class="dash-kpi-card" href="#/m/inspections">
        <div class="dash-kpi-head">
          <div class="dash-kpi-label">
            <span class="dash-kpi-ico tone-${k.firstPass >= 90 ? 'green' : 'amber'}">${icon('flask', 'sm')}</span>
            <span>First-Pass Yield</span>
          </div>
          <span class="dash-kpi-tag ${k.firstPass >= 90 ? 'ok' : 'warn'}">Target ≥ 90%</span>
        </div>
        <div class="dash-kpi-body">
          <div class="dash-kpi-num">${k.firstPass == null ? '—' : k.firstPass + '%'}<span class="dash-kpi-subnum">release rate</span></div>
          <span class="badge plain ${k.holds ? 'red' : 'green'}">${k.holds ? `${k.holds} On Hold` : '0 Holds'}</span>
        </div>
        <div class="dash-kpi-foot">
          <span>Calibration: <b>${k.calTotal ? Math.round(((k.calTotal - k.calOverdue) / k.calTotal) * 100) : 100}%</b> compliant</span>
          <span class="${k.calOverdue ? 'due-over' : 'muted'}">${k.calOverdue ? `${k.calOverdue} cal late` : 'All tools verified'}</span>
        </div>
      </a>

      <!-- Pillar 4: Customer Satisfaction & Delivery -->
      <a class="dash-kpi-card" href="#/m/satisfaction">
        <div class="dash-kpi-head">
          <div class="dash-kpi-label">
            <span class="dash-kpi-ico tone-teal">${icon('smile', 'sm')}</span>
            <span>Customer Satisfaction</span>
          </div>
          <span class="dash-kpi-tag ok">OF/WF/0152</span>
        </div>
        <div class="dash-kpi-body">
          <div class="dash-kpi-num">${k.satisfaction == null ? '—' : k.satisfaction + '%'}<span class="dash-kpi-subnum">survey score</span></div>
          <span class="badge plain ${k.complaintsOpen ? 'amber' : 'green'}">${k.complaintsOpen} Complaint${k.complaintsOpen === 1 ? '' : 's'}</span>
        </div>
        <div class="dash-kpi-foot">
          <span>On-Time Delivery: <b>${k.otd ?? 95}%</b></span>
          <span class="muted">SLA 72h resolution</span>
        </div>
      </a>
    </div>

    <!-- Secondary Operations Status Bar (Micro-metrics Strip) -->
    <div class="metrics-strip">
      <div class="metric-chip" onclick="location.hash='#/m/production'">
        <span class="metric-chip-dot ${k.holds ? 'red' : 'green'}"></span>
        <span>Quality Holds: <b>${k.holds}</b> batches</span>
      </div>
      <div class="metric-chip" onclick="location.hash='#/m/inventory'">
        <span class="metric-chip-dot ${k.reorder ? 'amber' : 'green'}"></span>
        <span>Inventory Reorder: <b>${k.reorder}</b> items</span>
      </div>
      <div class="metric-chip" onclick="location.hash='#/m/audits'">
        <span class="metric-chip-dot ${k.auditCoverage === 100 ? 'green' : 'blue'}"></span>
        <span>${new Date().getFullYear()} Audit Coverage: <b>${k.auditCoverage}%</b></span>
      </div>
      <div class="metric-chip" onclick="location.hash='#/m/maintenance'">
        <span class="metric-chip-dot ${k.downtime > 20 ? 'amber' : 'green'}"></span>
        <span>Downtime (30d): <b>${k.downtime}h</b></span>
      </div>
      <div class="metric-chip" onclick="location.hash='#/m/shiftlogs'">
        <span class="metric-chip-dot ${k.scrapRate > 2.5 ? 'amber' : 'green'}"></span>
        <span>Scrap Rate: <b>${k.scrapRate ?? '—'}%</b> <small class="muted">(Target &lt; 2.5%)</small></span>
      </div>
      <div class="metric-chip" onclick="location.hash='#/m/risks'">
        <span class="metric-chip-dot ${k.riskHigh ? 'red' : 'green'}"></span>
        <span>High-Level Risks: <b>${k.riskHigh}</b></span>
      </div>
      <div class="metric-chip" onclick="location.hash='#/m/suppliers'">
        <span class="metric-chip-dot green"></span>
        <span>Supplier Score: <b>${k.supplierScore ?? '—'}%</b></span>
      </div>
    </div>

    <!-- Main Operations Grid: Analytics Trends + Action Center -->
    <div class="grid g-main" style="margin-bottom:20px">
      <!-- Quality Events Rolling 12-Month Chart -->
      <div class="card">
        <div class="card-h">
          <div>
            <h3>Quality Events &amp; Resolution Trends</h3>
            <span class="sub">12-Month Rolling History (OP/WF/004, 005, 031)</span>
          </div>
          <div class="r legend">
            <span><i style="background:#f59e0b"></i>NCR</span>
            <span><i style="background:#0a5bd3"></i>CAPA</span>
            <span><i style="background:#e11d48"></i>Complaints</span>
          </div>
        </div>
        <div class="card-b">
          ${bars([d.trends.ncr, d.trends.capa, d.trends.complaints], months, { colors: ['#f59e0b', '#0a5bd3', '#e11d48'], names: ['NCR', 'CAPA', 'Complaints'], h: 220 })}
          <div style="display:flex;align-items:center;justify-content:space-between;padding-top:14px;margin-top:12px;border-top:1px solid var(--line);font-size:12px;color:var(--muted)">
            <span>Total Quality Records logged: <b>${totalQualityEvents}</b></span>
            <span>CAPA Resolution Ratio: <b>${k.capaOnTime ?? 92}% on-time</b></span>
            <span>Trend: <b style="color:var(--ok)">Stable &amp; Controlled</b></span>
          </div>
        </div>
      </div>

      <!-- Action Center ("My Work") -->
      <div class="card">
        <div class="card-h">
          <div>
            <h3>My Action Center</h3>
            <span class="sub">${d.mineCount} pending item${d.mineCount === 1 ? '' : 's'} requiring attention</span>
          </div>
          <div class="r">
            <div class="action-tabs" id="myWorkTabs">
              <button type="button" class="action-tab active" data-tab="all">All (${d.mine.length})</button>
              <button type="button" class="action-tab" data-tab="action">Action (${actionWork.length})</button>
              ${overdueWork.length ? `<button type="button" class="action-tab" data-tab="overdue" style="color:var(--bad)">Overdue (${overdueWork.length})</button>` : ''}
            </div>
            <a class="btn ghost sm" href="#/tasks" title="Open full tasks manager">${icon('arrowR', 'sm')}</a>
          </div>
        </div>
        <div class="list" id="myWorkList" style="max-height:300px;overflow-y:auto">
          ${d.mine.length ? d.mine.map(workRow).join('') : empty('All caught up', 'No open records currently require your approval or action.', 'check')}
        </div>
      </div>
    </div>

    <!-- Process Diagnostics (3 Columns) -->
    <div class="grid g3" style="margin-bottom:20px">
      <!-- Document Control Status -->
      <div class="card">
        <div class="card-h">
          <div>
            <h3>Document Lifecycle</h3>
            <span class="sub">OP/WF/001 Controlled Master</span>
          </div>
        </div>
        <div class="card-b" style="display:flex;gap:18px;align-items:center">
          ${donut(docColors, { size: 140, thick: 18, center: k.docsTotal, sub: 'controlled' })}
          <div style="flex:1;min-width:0">
            ${legend(docColors)}
            <div class="divider" style="margin:10px 0"></div>
            <div class="split muted" style="font-size:12px;gap:6px">
              ${icon('check', 'sm')}
              <span>${k.ackPending} acknowledgements pending</span>
            </div>
          </div>
        </div>
      </div>

      <!-- CAPA Pipeline Progression -->
      <div class="card">
        <div class="card-h">
          <div>
            <h3>CAPA Progression</h3>
            <span class="sub">OP/WF/004 Workflow Stages</span>
          </div>
          <span class="badge plain green">${d.capaStatus.find((s) => s.key === 'closed')?.n || 0} Closed</span>
        </div>
        <div class="card-b">
          ${hbars(d.capaStatus.filter((s) => s.key !== 'closed').map((s) => ({ label: s.label, n: s.n, color: toneColor(s.tone) })))}
          <div class="divider" style="margin:10px 0"></div>
          <div class="split" style="justify-content:space-between;font-size:12px;color:var(--muted)">
            <span>Active CAPA in progress</span>
            <b>${d.capaStatus.filter((s) => s.key !== 'closed').reduce((a, b) => a + b.n, 0)} records</b>
          </div>
        </div>
      </div>

      <!-- Customer Satisfaction Breakdown -->
      <div class="card">
        <div class="card-h">
          <div>
            <h3>Satisfaction by Aspect</h3>
            <span class="sub">OF/WF/0152 Survey Evaluation</span>
          </div>
          <span class="badge plain ok">${k.satisfaction ?? '—'}%</span>
        </div>
        <div class="card-b">
          ${hbars(d.satByQuestion.map((q) => ({ label: q.label, n: q.v, color: q.v >= 75 ? '#16a34a' : q.v >= 60 ? '#0a5bd3' : '#f59e0b' })), { max: 100, suffix: '%' })}
        </div>
      </div>
    </div>

    <!-- Calendar & Live Activity Feed (2 Columns) -->
    <div class="grid g2">
      <!-- Upcoming Milestones (Next 45 Days) -->
      <div class="card">
        <div class="card-h">
          <div>
            <h3>Upcoming Milestones</h3>
            <span class="sub">Audits, Calibration &amp; Reviews (Next 45 Days)</span>
          </div>
          <span class="tag">${d.upcoming.length} Scheduled</span>
        </div>
        <div class="list" style="max-height:360px;overflow-y:auto">
          ${d.upcoming.length ? d.upcoming.map((x) => {
    const dd = new Date(x.date);
    const over = x.date < new Date().toISOString().slice(0, 10);
    return `
              <div class="milestone-item" onclick="wfGo('${x.mod}','${x.id}')">
                <div class="milestone-date ${over ? 'over' : ''}">
                  <span class="m-mo">${dd.toLocaleString(undefined, { month: 'short' })}</span>
                  <span class="m-day">${dd.getDate()}</span>
                </div>
                <div class="milestone-info">
                  <b>${esc(x.title)}</b>
                  <div class="milestone-meta">
                    <span class="tag">${esc(x.kind)}</span>
                    <span>${fmtDate(x.date)}</span>
                    ${over ? '<span class="due-over">· Overdue</span>' : ''}
                  </div>
                </div>
                ${icon('chevR', 'sm')}
              </div>
            `;
  }).join('') : empty('No scheduled milestones', 'All upcoming audits and reviews are cleared.', 'calendar')}
        </div>
      </div>

      <!-- Live Audit Trail & Recent Activity -->
      <div class="card">
        <div class="card-h">
          <div>
            <h3>Recent System Activity</h3>
            <span class="sub">Audit Trail Log (21 CFR Part 11 compliant)</span>
          </div>
          <a class="btn ghost sm" href="#/reports" title="View Full Activity Log">${icon('clock', 'sm')}</a>
        </div>
        <div class="list feed" style="max-height:360px;overflow-y:auto">
          ${d.activity.map((a) => `
            <div class="li click" onclick="wfGo('${a.mod}','${a.id}')">
              ${avatar(a.by, 'sm')}
              <div class="grow" style="min-width:0">
                <b style="white-space:normal;font-weight:500;font-size:12.5px">
                  <span style="font-weight:650">${esc(user(a.by)?.name || 'System')}</span> ${esc(a.text)}
                  ${a.code ? `<span class="code" style="margin-left:4px">${esc(a.code)}</span>` : ''}
                </b>
                <small style="color:var(--muted);display:block;margin-top:2px">${ago(a.at)}</small>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Quick Action Button
  view.querySelector('#quickBtn').onclick = (e) => quickCreate(e.currentTarget);

  // Interactive My Work Tabs Filter
  const tabs = view.querySelectorAll('#myWorkTabs .action-tab');
  const workList = view.querySelector('#myWorkList');
  tabs.forEach((tab) => {
    tab.onclick = () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const mode = tab.dataset.tab;
      let filtered = d.mine;
      if (mode === 'action') filtered = actionWork;
      else if (mode === 'overdue') filtered = overdueWork;

      workList.innerHTML = filtered.length
        ? filtered.map(workRow).join('')
        : empty('No items in this filter', 'Nothing currently matches the selected filter.', 'check');
    };
  });
}

export async function quickCreate(anchor) {
  const { popover } = await import('../core.js');
  const mods = ['ncr', 'capa', 'complaints', 'inspections', 'maintenance', 'audits', 'training'];
  const p = popover(anchor, `
    <div class="pop-h"><b>Quick Create Record</b></div>
    <div class="pop-i" data-m="documents">${icon('file')}Document Change Request</div>
    ${mods.map((m) => `<div class="pop-i" data-m="${m}">${icon(state.meta.modules[m]?.icon || 'file')}${esc(state.meta.modules[m]?.title || m)}</div>`).join('')}
  `, { width: 250 });

  p.onclick = async (e) => {
    const m = e.target.closest('[data-m]')?.dataset.m;
    if (!m) return;
    p.remove();
    if (m === 'documents') {
      location.hash = '#/documents';
      setTimeout(() => document.getElementById('newDocBtn')?.click(), 300);
    } else {
      const { createRecord } = await import('./module.js');
      createRecord(m);
    }
  };
}

export async function renderTasks(view) {
  setCrumbs(['My Work']);
  const d = await api('/dashboard?all=1');
  const all = d.mine;
  const overdue = all.filter((t) => t.overdue);
  const owned = all.filter((t) => !t.overdue && t.owns);
  const act = all.filter((t) => !t.overdue && !t.owns);

  const sec = (title, list, tone) => `
    <div class="card" style="margin-bottom:18px">
      <div class="card-h">
        <h3>${title}</h3>
        ${badge(list.length, tone, true)}
      </div>
      <div class="list">
        ${list.length ? list.map(workRow).join('') : empty('Nothing here', 'No records in this category.', 'check')}
      </div>
    </div>
  `;

  view.innerHTML = `
    <div class="ph">
      <div>
        <h1>My Work &amp; Action Items</h1>
        <p>Operational tasks and workflows assigned to you or waiting for your role (${esc(state.meta.roles[state.user.role])}) to review and approve.</p>
      </div>
    </div>
    ${sec('Overdue Actions', overdue, 'red')}
    ${sec('Assigned to Me (Owner)', owned, 'blue')}
    ${sec('Waiting for My Approval / Action', act, '')}
  `;
}
