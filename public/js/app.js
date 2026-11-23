import { state, api, icon, esc, $, $$, avatar, initials, toast, popover, debounce, user, ago, tr, lang, setLangPref, syncQueue, queued, modal } from './core.js';
import { renderTools } from './pages/tools.js';
import { renderDashboard, renderTasks } from './pages/dashboard.js';
import { renderDocuments, renderDocViewer, openDocDrawer } from './pages/documents.js';
import { renderModule, openRecord } from './pages/module.js';
import { renderOrg } from './pages/org.js';
import { renderReports, renderAdmin } from './pages/reports.js';

// ---------- theme: 'light' (default) | 'dark' | 'system' ----------
const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : { matches: false };
let themePref = 'light';
try { themePref = localStorage.getItem('wf-theme-pref') || 'light'; } catch (_) { }
const applyTheme = () => { document.documentElement.dataset.theme = themePref === 'system' ? (mq.matches ? 'dark' : 'light') : themePref; };
applyTheme();
mq.addEventListener?.('change', () => { if (themePref === 'system') { applyTheme(); updateThemeIcon(); } });
export function setTheme(pref) {
  themePref = pref;
  try { localStorage.setItem('wf-theme-pref', pref); } catch (_) { }
  applyTheme(); updateThemeIcon();
  document.querySelectorAll('.theme-seg button[data-theme]').forEach((b) => b.classList.toggle('on', b.dataset.theme === pref));
}
export const themeSeg = () => `<div class="theme-seg">${[['light', 'sun', 'Light'], ['dark', 'moon', 'Dark'], ['system', 'monitor', 'System']].map(([k, ic, l]) => `<button data-theme="${k}" class="${themePref === k ? 'on' : ''}">${icon(ic, 'sm')}${l}</button>`).join('')}</div><div class="theme-seg" style="margin-top:0">${[['en', 'English'], ['am', 'አማርኛ']].map(([k, l]) => `<button data-lang="${k}" class="${lang === k ? 'on' : ''}">${l}</button>`).join('')}</div>`;
export const bindThemeSeg = (root) => root.querySelectorAll('.theme-seg button').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); if (b.dataset.lang) { setLangPref(b.dataset.lang); document.querySelector('.pop')?.remove(); state.user ? shell() : login(); return; } setTheme(b.dataset.theme); if (state.user) route(); }));
function updateThemeIcon() { const b = document.getElementById('themeBtn'); if (b) b.innerHTML = icon(document.documentElement.dataset.theme === 'dark' ? 'moon' : 'sun'); }

const NAV = [
  {
    id: 'overview',
    sec: 'Overview',
    icon: 'home',
    collapsible: false,
    items: [
      ['dashboard', 'Dashboard', 'home'],
      ['tasks', 'My Work', 'zap'],
    ],
  },
  {
    id: 'quality',
    sec: 'Quality & Compliance',
    icon: 'shield',
    collapsible: true,
    items: [
      ['documents', 'Document Control', 'file'],
      ['m/records', 'Records Register', 'archive'],
      ['m/correspondence', 'Incoming / Outgoing Register', 'message'],
      ['m/audits', 'Internal Audits', 'clipboard'],
      ['m/ncr', 'Non-Conforming Product', 'alert'],
      ['m/capa', 'Corrective Actions', 'wrench'],
      ['m/reviews', 'Management Review', 'users'],
      ['m/risks', 'Risk & Opportunity Register', 'target'],
      ['m/memos', 'Internal Memos', 'message'],
    ],
  },
  {
    id: 'production',
    sec: 'Production & Plant',
    icon: 'layers',
    collapsible: true,
    items: [
      ['m/production', 'Production Orders', 'layers'],
      ['m/shiftlogs', 'Shift Production Log', 'clock'],
      ['m/recycling', 'Scrap & Recycling', 'refresh'],
      ['m/fgtransfer', 'Finished Goods Transfer Notes', 'send'],
    ],
  },
  {
    id: 'qa_lab',
    sec: 'QA, Lab & Testing',
    icon: 'flask',
    collapsible: true,
    items: [
      ['m/labtests', 'Laboratory Tests & CoA', 'flask'],
      ['m/inspections', 'Inspection & Testing', 'eye'],
      ['m/calibration', 'Calibration', 'gauge'],
    ],
  },
  {
    id: 'maintenance',
    sec: 'Maintenance & Assets',
    icon: 'cog',
    collapsible: true,
    items: [
      ['m/assets', 'Machines & Assets', 'sitemap'],
      ['m/pmplans', 'Preventive Maintenance Plans', 'calendar'],
      ['m/maintenance', 'Maintenance', 'cog'],
    ],
  },
  {
    id: 'procurement',
    sec: 'Procurement & Inventory',
    icon: 'truck',
    collapsible: true,
    items: [
      ['m/purchasing', 'Purchase Requests', 'truck'],
      ['m/suppliers', 'Supplier Evaluation', 'shield'],
      ['m/inventory', 'Inventory & Stock', 'grid'],
      ['m/gatepass', 'Gate Passes', 'lock'],
    ],
  },
  {
    id: 'sales',
    sec: 'Sales & Customers',
    icon: 'smile',
    collapsible: true,
    items: [
      ['m/dispatch', 'Sales & Dispatch', 'send'],
      ['m/complaints', 'Customer Complaints', 'star'],
      ['m/satisfaction', 'Customer Satisfaction', 'smile'],
    ],
  },
  {
    id: 'hr_hse',
    sec: 'People & Safety',
    icon: 'users',
    collapsible: true,
    items: [
      ['m/employees', 'Employees & Competency', 'users'],
      ['m/training', 'Training & Competence', 'grad'],
      ['m/appraisals', 'Performance Appraisals', 'star'],
      ['m/hse', 'Health, Safety & Environment', 'drop'],
      ['m/ppe', 'PPE Issuance Log', 'shield'],
      ['m/safetyaudits', 'Factory Safety Audits', 'clipboard'],
    ],
  },
  {
    id: 'finance',
    sec: 'Finance & Tools',
    icon: 'chart',
    collapsible: true,
    isSecondary: true,
    items: [
      ['m/expenses', 'Payments & Expenses', 'chart'],
      ['m/fixedassets', 'Fixed Assets', 'building'],
      ['tools', 'Calculators & Tools', 'trend'],
    ],
  },
  {
    id: 'org',
    sec: 'Organization & Admin',
    icon: 'building',
    collapsible: true,
    isSecondary: true,
    items: [
      ['org', 'Company & Context', 'building'],
      ['reports', 'Reports & Analytics', 'chart'],
      ['admin', 'Users & Settings', 'shield'],
    ],
  },
];

export function toggleSidebar(forceState) {
  const isCollapsed = forceState !== undefined ? forceState : !document.body.classList.contains('side-collapsed');
  document.body.classList.toggle('side-collapsed', isCollapsed);
  try { localStorage.setItem('wf-side-collapsed', isCollapsed ? '1' : '0'); } catch (_) {}
  const btn = $('#sideCollapseBtn');
  if (btn) {
    btn.title = isCollapsed ? 'Expand sidebar (Ctrl+[)' : 'Collapse sidebar (Ctrl+[)';
    btn.setAttribute('aria-expanded', !isCollapsed);
  }
}

let collapsedGroups = new Set();
try {
  const saved = localStorage.getItem('wf-nav-collapsed');
  if (saved) collapsedGroups = new Set(JSON.parse(saved));
  else collapsedGroups = new Set(['qa_lab', 'maintenance', 'procurement', 'sales', 'hr_hse', 'finance', 'org']);
} catch (_) {
  collapsedGroups = new Set(['qa_lab', 'maintenance', 'procurement', 'sales', 'hr_hse', 'finance', 'org']);
}

function saveCollapsedGroups() {
  try { localStorage.setItem('wf-nav-collapsed', JSON.stringify([...collapsedGroups])); } catch (_) { }
}

function toggleGroup(gid) {
  if (collapsedGroups.has(gid)) collapsedGroups.delete(gid); else collapsedGroups.add(gid);
  saveCollapsedGroups();
  const isExpanded = !collapsedGroups.has(gid);
  const itemsEl = document.getElementById(`group-${gid}`);
  if (itemsEl) itemsEl.style.display = isExpanded ? '' : 'none';
  const btn = document.querySelector(`[data-toggle="${gid}"]`);
  if (btn) btn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
}

function ensureGroupOpen(gid) {
  if (collapsedGroups.has(gid)) {
    collapsedGroups.delete(gid);
    saveCollapsedGroups();
    const itemsEl = document.getElementById(`group-${gid}`);
    if (itemsEl) itemsEl.style.display = '';
    const btn = document.querySelector(`[data-toggle="${gid}"]`);
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }
}

function renderNavHtml() {
  let renderedSecondaryDivider = false;
  return NAV.map((g) => {
    let dividerHtml = '';
    if (g.isSecondary && !renderedSecondaryDivider) {
      renderedSecondaryDivider = true;
      dividerHtml = `<div class="nav-divider"></div><div class="nav-divider-label">${tr('System & Admin')}</div>`;
    }
    const isExpanded = !g.collapsible || !collapsedGroups.has(g.id);
    return `${dividerHtml}<div class="nav-group" data-gid="${g.id}">
      ${g.collapsible ? `
        <button type="button" class="nav-sec-btn" data-toggle="${g.id}" aria-expanded="${isExpanded}" title="${esc(tr(g.sec))}">
          <span class="nav-sec-icon">${icon(g.icon, 'sm')}</span>
          <span class="nav-sec-title">${tr(g.sec)}</span>
          <span class="nav-sec-badge" data-gb="${g.id}" hidden></span>
          <span class="nav-sec-chev">${icon('chevD', 'sm')}</span>
        </button>
      ` : `
        <div class="nav-sec">
          <span class="nav-sec-title">${tr(g.sec)}</span>
        </div>
      `}
      <div class="nav-group-items" id="group-${g.id}" style="${isExpanded ? '' : 'display:none'}">
        ${g.items.map(([r, l, ic]) => `
          <a href="#/${r}" data-r="${r}" class="nav-item" title="${esc(tr(l))}">
            <span class="nav-icon">${icon(ic)}</span>
            <span class="nav-label">${tr(l)}</span>
            <span class="count" data-c="${r}" hidden></span>
          </a>
        `).join('')}
      </div>
    </div>`;
  }).join('');
}

async function boot() {
  state.meta = await api('/meta');
  let saved = null; try { saved = localStorage.getItem('wf-user'); } catch (_) { }
  const u = saved && state.meta.users.find((x) => x.id === saved);
  if (u) { state.user = u; shell(); } else login();
}

const userEmail = (u) => u.email || `${u.name.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@waterfit.et`;

function login() {
  const o = state.meta.org;
  const users = state.meta.users || [];
  const quickRoleKeys = ['gm', 'mr', 'qa', 'auditor', 'head', 'staff'];
  const quickUsers = quickRoleKeys.map((r) => users.find((u) => u.role === r)).filter(Boolean);
  const defaultUser = quickUsers[0] || users[0];

  document.body.innerHTML = `<div class="login">
    <div class="login-art">
      <div class="login-logo"><img src="/img/logo.png" alt="${esc(o.name)}"></div>
      <h1>One integrated system for every procedure, record &amp; action.</h1>
      <p>Built for ${esc(o.name)} on official ${esc(o.standard)} quality management procedures OP/WF/001–046.</p>
      <div class="login-badges">
        <span class="login-badge-pill">${icon('shield', 'sm')} ISO 9001:2015</span>
        <span class="login-badge-pill">${icon('lock', 'sm')} 21 CFR Part 11 Audit Trail</span>
        <span class="login-badge-pill">${icon('file', 'sm')} 150 Controlled Documents</span>
      </div>
      <div class="login-stats">
        <div><b>150</b><small>controlled documents</small></div>
        <div><b>12</b><small>QMS modules</small></div>
        <div><b>7</b><small>departments</small></div>
      </div>
    </div>
    <div class="login-form">
      <div class="login-theme" style="width:250px">${themeSeg()}</div>
      <div class="login-card">
        <div class="eyebrow">${tr('Enterprise Access')} · ISO 9001:2015</div>
        <h2>${tr('Sign in to WF QMS')}</h2>
        <div class="auth-sub">${tr('Enter your email and password or use a quick demo role.')}</div>
        <div id="loginError" class="auth-error" hidden></div>
        <form class="auth-form" id="loginForm" onsubmit="return false;">
          <div class="auth-field">
            <label for="loginEmail">${tr('Work Email')}</label>
            <div class="auth-input-wrap">
              <span class="auth-input-ico">${icon('users', 'sm')}</span>
              <input type="text" class="auth-input" id="loginEmail" placeholder="name@waterfit.et" value="${esc(userEmail(defaultUser))}" autocomplete="username" spellcheck="false" required>
            </div>
          </div>
          <div class="auth-field">
            <div class="auth-field-header">
              <label for="loginPassword">${tr('Password')}</label>
              <a href="#" class="auth-forgot" id="authForgot">${tr('Forgot password?')}</a>
            </div>
            <div class="auth-input-wrap">
              <span class="auth-input-ico">${icon('lock', 'sm')}</span>
              <input type="password" class="auth-input" id="loginPassword" placeholder="••••••••" value="wf2026" autocomplete="current-password" required>
              <button type="button" class="auth-pw-toggle" id="authPwToggle" title="Toggle password visibility">
                ${icon('eye', 'sm')}
              </button>
            </div>
          </div>
          <div class="auth-row">
            <label class="auth-remember">
              <input type="checkbox" id="authRemember" checked>
              <span>${tr('Remember this device')}</span>
            </label>
            <span class="auth-demo-hint">Demo pass: <b>wf2026</b></span>
          </div>
          <button type="submit" class="btn primary auth-submit-btn" id="authSubmit">
            <span>${tr('Sign in to QMS')}</span>
            ${icon('arrowR', 'sm')}
          </button>
        </form>

        <div class="auth-divider">
          <span>${tr('OR SELECT DEMO ROLE')}</span>
        </div>

        <div class="demo-grid">
          ${quickUsers.map((u) => `
            <div class="demo-card ${u.id === defaultUser.id ? 'active' : ''}" data-uid="${u.id}" data-email="${esc(userEmail(u))}" title="${esc(u.name)} (${esc(state.meta.roles[u.role])})">
              <div class="demo-card-head">
                ${avatar(u.id, 'sm')}
                <span class="tag">${esc(state.meta.roles[u.role]?.split(' ')[0] || u.role.toUpperCase())}</span>
              </div>
              <b>${esc(u.name.split(' ')[0])}</b>
              <small>${esc(state.meta.roles[u.role] || u.title)}</small>
            </div>
          `).join('')}
        </div>

        <button type="button" class="demo-toggle-btn" id="demoToggleAll">
          <span>${tr('Browse all 18 demo accounts')}</span>
          ${icon('chevD', 'sm')}
        </button>

        <div class="demo-all-users" id="demoAllUsers" style="display:none">
          ${users.filter((u) => u.role !== 'external').map((u) => `
            <div class="user-opt" data-uid="${u.id}" data-email="${esc(userEmail(u))}">
              ${avatar(u.id, 'sm')}
              <div class="grow">
                <b>${esc(u.name)}</b>
                <small>${esc(u.title)} · ${esc(userEmail(u))}</small>
              </div>
              <span class="tag">${esc(state.meta.roles[u.role])}</span>
            </div>
          `).join('')}
        </div>

        <p class="faint" style="font-size:11.5px;margin:14px 0 0;text-align:center">
          <a href="#" id="extLink">${tr('Sign in as external auditor (read-only)')}</a>
        </p>
      </div>
    </div>
  </div>`;

  bindThemeSeg(document.body);

  const emailIn = $('#loginEmail');
  const pwIn = $('#loginPassword');
  const pwToggle = $('#authPwToggle');
  const form = $('#loginForm');
  const toggleBtn = $('#demoToggleAll');
  const allUsersBox = $('#demoAllUsers');

  if (pwToggle && pwIn) {
    pwToggle.onclick = () => {
      const isPw = pwIn.type === 'password';
      pwIn.type = isPw ? 'text' : 'password';
      pwToggle.innerHTML = icon(isPw ? 'eye' : 'lock', 'sm');
    };
  }

  const selectUser = (uid, email, autoSubmit = false) => {
    $$('.demo-card').forEach((c) => c.classList.toggle('active', c.dataset.uid === uid));
    if (emailIn) emailIn.value = email;
    if (pwIn && !pwIn.value) pwIn.value = 'wf2026';
    if (autoSubmit) signIn(uid, null, pwIn?.value || 'wf2026');
  };

  $$('.demo-card').forEach((el) => {
    el.onclick = () => selectUser(el.dataset.uid, el.dataset.email, true);
  });

  $$('.user-opt').forEach((el) => {
    el.onclick = () => selectUser(el.dataset.uid, el.dataset.email, true);
  });

  if (toggleBtn && allUsersBox) {
    toggleBtn.onclick = () => {
      const open = allUsersBox.style.display !== 'none';
      allUsersBox.style.display = open ? 'none' : 'flex';
      toggleBtn.innerHTML = open
        ? `<span>${tr('Browse all 18 demo accounts')}</span>${icon('chevD', 'sm')}`
        : `<span>${tr('Hide user list')}</span>${icon('chevD', 'sm')}`;
    };
  }

  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const emailVal = emailIn?.value.trim().toLowerCase() || '';
      const pwVal = pwIn?.value || '';
      if (!emailVal) {
        showLoginError('Please enter your work email or username.');
        emailIn?.focus();
        return;
      }
      let found = users.find((x) =>
        x.id.toLowerCase() === emailVal ||
        (x.email && x.email.toLowerCase() === emailVal) ||
        userEmail(x).toLowerCase() === emailVal ||
        x.name.toLowerCase() === emailVal ||
        x.name.toLowerCase().replace(/[^a-z0-9]+/g, '.') === emailVal ||
        x.role.toLowerCase() === emailVal
      );
      if (!found) {
        found = users.find((x) => emailVal.includes(x.role.toLowerCase()) || emailVal.includes(x.name.toLowerCase().split(' ')[0]));
      }
      if (!found) found = defaultUser;
      signIn(found, null, pwVal);
    };
  }

  $('#authForgot').onclick = (e) => {
    e.preventDefault();
    modal({
      title: 'Demo Password Reset',
      sub: 'Standard password for demo accounts is wf2026.',
      body: '<div style="line-height:1.6"><p>All demo accounts in this environment share the password: <code>wf2026</code>.</p><p style="margin-top:8px">Accounts requiring MFA (GM &amp; MR) use one-time verification code: <code>246810</code>.</p><div class="card" style="padding:10px 14px;margin-top:12px;background:var(--surface-2);font-size:12px;color:var(--muted)">In production, password reset requests are handled through your enterprise Active Directory / Single Sign-On (SSO) service.</div></div>',
      foot: '<button class="btn primary" data-close>Got it</button>'
    });
  };

  $('#extLink').onclick = (e) => {
    e.preventDefault();
    signIn('u18');
  };
}

function showLoginError(msg) {
  const errBox = $('#loginError');
  if (errBox) {
    errBox.hidden = false;
    errBox.innerHTML = `${icon('alert', 'sm')}<span>${esc(msg)}</span>`;
  } else {
    toast(msg, true);
  }
}

async function signIn(idOrUser, otp, password) {
  let u = typeof idOrUser === 'string' ? state.meta.users.find((x) => x.id === idOrUser) : idOrUser;
  if (!u) {
    showLoginError('User account not found.');
    return;
  }
  if (['gm', 'mr'].includes(u.role) && !otp) {
    const m = modal({
      title: 'Two-factor sign-in (MFA)',
      sub: `${esc(u.name)} (${esc(state.meta.roles[u.role])}) – management accounts require a one-time verification code.`,
      body: '<div class="fld"><label>6-digit code</label><input class="input" id="otp" inputmode="numeric" maxlength="6" placeholder="Demo code: 246810" value="246810" style="width:100%"><div class="hint" style="margin-top:6px">For this demo environment, enter <b>246810</b>.</div></div>',
      foot: '<button class="btn" data-close>Cancel</button><button class="btn primary" id="otpGo">Verify & sign in</button>'
    });
    m.el.querySelector('#otpGo').onclick = () => {
      const v = m.el.querySelector('#otp').value.trim();
      m.close();
      signIn(u, v, password);
    };
    m.el.querySelector('#otp').onkeydown = (e) => {
      if (e.key === 'Enter') m.el.querySelector('#otpGo').click();
    };
    setTimeout(() => m.el.querySelector('#otp')?.focus(), 50);
    return;
  }

  const btn = $('#authSubmit');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="spin"></span> Signing in…`;
  }

  try {
    state.user = await api('/login', {
      body: {
        userId: u.id,
        email: userEmail(u),
        password: password || 'wf2026',
        otp
      }
    });
    try { localStorage.setItem('wf-user', u.id); } catch (_) { }
    shell();
    toast(`Signed in as ${state.user.name}`);
  } catch (err) {
    showLoginError(err.message || 'Login failed');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span>Sign in to QMS</span>${icon('arrowR', 'sm')}`;
    }
  }
}

function shell() {
  const u = state.user;
  const isSideCollapsed = localStorage.getItem('wf-side-collapsed') === '1';
  if (isSideCollapsed) document.body.classList.add('side-collapsed');
  else document.body.classList.remove('side-collapsed');

  document.body.innerHTML = `<div class="app">
    <aside class="side">
      <div class="side-head">
        <div class="side-head-top">
          <a href="#/dashboard" class="brandlogo side-brand-full" title="Water Fit QMS">
            <img src="/img/logo.png" alt="Water Fit General Trading">
          </a>
          <a href="#/dashboard" class="side-brand-compact" title="Water Fit QMS">
            <span class="side-brand-mark">WF</span>
          </a>
          <button type="button" class="side-collapse-btn" id="sideCollapseBtn" title="${isSideCollapsed ? 'Expand sidebar (Ctrl+[)' : 'Collapse sidebar (Ctrl+[)'}" aria-label="Toggle sidebar width" aria-expanded="${!isSideCollapsed}">
            ${icon('chevL', 'sm')}
          </button>
        </div>
        <div class="side-brand-meta">
          <div class="side-brand-info">
            <b>${tr('Quality Management System')}</b>
            <small>Water Fit General Trading · Addis Ababa</small>
          </div>
          <span class="side-brand-iso"><span class="iso-dot"></span>ISO 9001:2015</span>
        </div>
      </div>
      <div class="nav-filter-wrap">
        <div class="nav-filter">
          ${icon('search', 'sm')}
          <input type="text" id="navFilterInput" placeholder="${tr('Find module…')}" autocomplete="off" spellcheck="false">
          <button type="button" class="nav-filter-clear" id="navFilterClear" title="Clear filter" style="display:none">
            ${icon('x', 'sm')}
          </button>
        </div>
        <button type="button" class="nav-expand-toggle" id="navExpandToggle" title="Expand / collapse all sections">
          ${icon('more', 'sm')}
        </button>
        <button type="button" class="nav-search-collapsed-btn" id="navSearchCollapsedBtn" title="Search modules (⌘K)">
          ${icon('search', 'sm')}
        </button>
      </div>
      <div class="side-scroll">
        <nav class="nav" id="nav">
          ${renderNavHtml()}
          <div class="nav-no-match" id="navNoMatch" style="display:none"></div>
        </nav>
      </div>
      <div class="side-foot">
        <div class="me" id="me" role="button" tabindex="0" title="Account settings & appearance">
          <div class="me-avatar-wrap">
            ${avatar(u.id)}
            <span class="online-indicator"></span>
          </div>
          <div class="me-info">
            <b>${esc(u.name)}</b>
            <small>${esc(u.title || state.meta.roles[u.role] || u.dept)}</small>
          </div>
          <div class="me-action">
            ${icon('chevD', 'sm')}
          </div>
        </div>
      </div>
    </aside>
    <div class="main">
      <header class="top">
        <button class="iconbtn menubtn" id="menuBtn" title="Menu">${icon('menu')}</button>
        <div class="crumbs" id="crumbs"></div>
        <button class="searchbtn" id="searchBtn">${icon('search')}<span>${tr('Search documents, records, people…')}</span><kbd>⌘K</kbd></button>
        <button class="iconbtn" id="themeBtn" title="Appearance – light / dark">${icon(document.documentElement.dataset.theme === 'dark' ? 'moon' : 'sun')}</button>
        <button class="iconbtn" id="bellBtn" title="Notifications">${icon('bell')}<span class="dot" hidden></span></button>
      </header>
      <main class="content" id="view"></main>
    </div></div>`;
  $('#searchBtn').onclick = openCmdk;
  const navSearchCollapsedBtn = $('#navSearchCollapsedBtn');
  if (navSearchCollapsedBtn) navSearchCollapsedBtn.onclick = openCmdk;
  const sideCollapseBtn = $('#sideCollapseBtn');
  if (sideCollapseBtn) sideCollapseBtn.onclick = () => toggleSidebar();
  $('#themeBtn').onclick = (e) => { const p = popover(e.currentTarget, `<div class="pop-h"><b>Appearance</b></div><div style="padding:4px 0 2px">${themeSeg()}</div>`, { width: 290 }); bindThemeSeg(p); };
  $('#bellBtn').onclick = openNotifications;
  $('#me').onclick = (e) => {
    const p = popover(e.currentTarget, `<div class="pop-h">${avatar(u.id)}<div style="margin-left:10px"><b>${esc(u.name)}</b><div class="muted" style="font-size:12px">${esc(u.title)} · ${esc(u.dept)}</div></div></div>
      <div class="nav-sec" style="padding:10px 14px 2px">Appearance</div>${themeSeg()}<div class="pop-i" data-a="switch">${icon('users')}Switch user (demo)</div><div class="pop-i" data-a="admin">${icon('shield')}Users & settings</div><div class="pop-i" data-a="out">${icon('logout')}Sign out</div>`, { align: 'left' });
    bindThemeSeg(p);
    p.onclick = (ev) => { const a = ev.target.closest('[data-a]')?.dataset.a; if (!a) return; p.remove(); if (a === 'admin') location.hash = '#/admin'; else { try { localStorage.removeItem('wf-user'); } catch (_) { } state.user = null; login(); } };
  };

  $('#nav').onclick = (e) => {
    const toggleBtn = e.target.closest('[data-toggle]');
    if (toggleBtn) {
      e.preventDefault();
      toggleGroup(toggleBtn.dataset.toggle);
      return;
    }
    if (e.target.closest('a')) {
      document.body.classList.remove('nav-open');
    }
  };

  document.addEventListener('click', (e) => {
    if (document.body.classList.contains('nav-open') && !e.target.closest('.side') && !e.target.closest('#menuBtn')) {
      document.body.classList.remove('nav-open');
    }
  });

  if (!window._wfSideKeyBound) {
    window._wfSideKeyBound = true;
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '[') {
        e.preventDefault();
        toggleSidebar();
      }
    });
  }

  const navInput = $('#navFilterInput');
  const navClear = $('#navFilterClear');
  const navNoMatch = $('#navNoMatch');
  if (navInput) {
    const filterNav = () => {
      const q = navInput.value.trim().toLowerCase();
      navClear.style.display = q ? 'flex' : 'none';
      let totalMatches = 0;

      $$('#nav .nav-group').forEach((grp) => {
        const items = $$(grp, '.nav-item');
        let groupMatches = 0;

        items.forEach((item) => {
          const label = item.querySelector('.nav-label');
          const text = label ? label.textContent.toLowerCase() : '';
          const routeVal = (item.dataset.r || '').toLowerCase();
          const matches = !q || text.includes(q) || routeVal.includes(q);

          item.style.display = matches ? 'flex' : 'none';
          if (matches) {
            groupMatches++;
            totalMatches++;
          }
        });

        const gid = grp.dataset.gid;
        const itemsContainer = $(`#group-${gid}`, grp);
        const toggleBtn = $(`[data-toggle="${gid}"]`, grp);

        if (q) {
          grp.style.display = groupMatches > 0 ? '' : 'none';
          if (itemsContainer) itemsContainer.style.display = '';
          if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
        } else {
          grp.style.display = '';
          if (itemsContainer) itemsContainer.style.display = (!grp.querySelector('[data-toggle]') || !collapsedGroups.has(gid)) ? '' : 'none';
          if (toggleBtn) toggleBtn.setAttribute('aria-expanded', !collapsedGroups.has(gid) ? 'true' : 'false');
        }
      });

      if (navNoMatch) {
        navNoMatch.style.display = (q && totalMatches === 0) ? 'block' : 'none';
        if (q && totalMatches === 0) {
          navNoMatch.innerHTML = `<b>No modules found</b><small>No matches for "${esc(q)}"</small>`;
        }
      }
    };

    navInput.addEventListener('input', filterNav);
    navClear.addEventListener('click', () => {
      navInput.value = '';
      filterNav();
      navInput.focus();
    });
  }

  const expandToggle = $('#navExpandToggle');
  if (expandToggle) {
    expandToggle.onclick = () => {
      const collapsibles = NAV.filter((g) => g.collapsible).map((g) => g.id);
      const anyCollapsed = collapsibles.some((id) => collapsedGroups.has(id));
      if (anyCollapsed) {
        collapsedGroups.clear();
        saveCollapsedGroups();
        collapsibles.forEach((id) => {
          const gEl = $(`#group-${id}`);
          if (gEl) gEl.style.display = '';
          const btn = $(`[data-toggle="${id}"]`);
          if (btn) btn.setAttribute('aria-expanded', 'true');
        });
        expandToggle.title = 'Collapse all sections';
      } else {
        collapsibles.forEach((id) => collapsedGroups.add(id));
        saveCollapsedGroups();
        collapsibles.forEach((id) => {
          const gEl = $(`#group-${id}`);
          if (gEl) gEl.style.display = 'none';
          const btn = $(`[data-toggle="${id}"]`);
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
        expandToggle.title = 'Expand all sections';
      }
    };
  }

  window.onhashchange = () => { document.body.classList.remove('nav-open'); route(); };
  $('#menuBtn').onclick = () => document.body.classList.toggle('nav-open');
  syncQueue();
  if (!location.hash) location.hash = '#/dashboard'; else route();
  refreshCounts();
}

export async function refreshCounts() {
  try {
    const [c, n] = await Promise.all([api('/counts'), api('/notifications')]);
    state.counts = c;
    const groupTotals = {};

    $$('[data-c]').forEach((el) => {
      const key = el.dataset.c.replace('m/', '');
      const v = c[key];
      if (!v) {
        el.hidden = true;
        return;
      }
      const shown = v.overdue || v.open;
      el.hidden = !shown;
      el.textContent = shown;
      el.classList.toggle('alert', !!v.overdue);
      el.title = v.overdue ? `${v.overdue} overdue` : `${v.open} open`;

      const grp = el.closest('.nav-group');
      if (grp && grp.dataset.gid) {
        const gid = grp.dataset.gid;
        groupTotals[gid] = groupTotals[gid] || { total: 0, overdue: 0 };
        groupTotals[gid].total += (shown || 0);
        groupTotals[gid].overdue += (v.overdue || 0);
      }
    });

    $$('[data-gb]').forEach((badgeEl) => {
      const gid = badgeEl.dataset.gb;
      const gv = groupTotals[gid];
      if (gv && gv.total > 0) {
        badgeEl.hidden = false;
        badgeEl.textContent = gv.total;
        badgeEl.classList.toggle('alert', gv.overdue > 0);
        badgeEl.title = gv.overdue ? `${gv.overdue} overdue in section` : `${gv.total} open in section`;
      } else {
        badgeEl.hidden = true;
      }
    });

    const dot = $('#bellBtn .dot'); if (dot) dot.hidden = !n.length;
    state.notifications = n;
  } catch (_) { }
}

export function setCrumbs(parts) {
  $('#crumbs').innerHTML = [`<span>WF QMS</span>`, ...parts.map((p, i) => i === parts.length - 1 ? `<b>${esc(p)}</b>` : `<span>${esc(p)}</span>`)].join(icon('chevR', 'sm'));
}

export async function route() {
  if (!state.user) return;
  const [, a = 'dashboard', b, c] = location.hash.split('/');
  const key = a === 'm' ? `m/${b}` : a;
  const activeLink = $(`#nav a[data-r="${key}"]`);
  $$('#nav a').forEach((el) => el.classList.toggle('active', el === activeLink));
  if (activeLink) {
    const grp = activeLink.closest('.nav-group');
    if (grp && grp.dataset.gid) ensureGroupOpen(grp.dataset.gid);
  }
  const view = $('#view'); view.scrollTop = 0; window.scrollTo(0, 0);
  try {
    if (a === 'dashboard') await renderDashboard(view);
    else if (a === 'tasks') await renderTasks(view);
    else if (a === 'documents' && b) await renderDocViewer(view, b);
    else if (a === 'documents') await renderDocuments(view);
    else if (a === 'm' && state.meta.modules[b]) { await renderModule(view, b); if (c) openRecord(b, c); }
    else if (a === 'org') await renderOrg(view);
    else if (a === 'tools') await renderTools(view);
    else if (a === 'reports') await renderReports(view);
    else if (a === 'admin') await renderAdmin(view);
    else await renderDashboard(view);
  } catch (e) { console.error(e); view.innerHTML = `<div class="card"><div class="empty"><b>Could not load this page</b>${esc(e.message)}</div></div>`; }
}
export function go(mod, id) {
  if (mod === 'documents') { openDocDrawer(id); return; }
  if (mod === 'user') { location.hash = '#/admin'; return; }
  const target = `#/m/${mod}`;
  if (location.hash.startsWith(target)) openRecord(mod, id); else location.hash = `${target}/${id}`;
}
window.wfGo = go;

// ---------- notifications ----------
function openNotifications(e) {
  const list = state.notifications || [];
  const p = popover(e.currentTarget, `<div class="pop-h"><b>Notifications</b><span class="spacer"></span><span class="badge plain">${list.length}</span></div>
    <div style="max-height:420px;overflow:auto">${list.length ? list.map((n, i) => `<div class="notif" data-i="${i}"><span class="feed-dot tone-${{ red: 'red', amber: 'amber', blue: 'blue', violet: 'violet' }[n.tone]}">${icon(n.tone === 'red' ? 'alert' : n.tone === 'violet' ? 'check' : 'clock', 'sm')}</span><div style="min-width:0"><b style="font-weight:550">${esc(n.text)}</b><small>${esc(n.sub || '')}</small></div></div>`).join('') : '<div class="empty" style="width:340px"><b>You’re all caught up</b>No overdue items or pending acknowledgements.</div>'}</div>`, { width: 380 });
  p.onclick = (ev) => { const i = ev.target.closest('[data-i]')?.dataset.i; if (i === undefined) return; p.remove(); const n = list[i]; go(n.mod, n.id); };
}

// ---------- command palette ----------
const PAGES = NAV.flatMap((g) => g.items.map(([r, l, ic]) => ({ kind: 'page', r, title: l, ic, sub: g.sec })));
function openCmdk() {
  if ($('.cmdk')) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = `<div class="scrim"></div><div class="cmdk"><div class="cmdk-box"><div class="cmdk-in">${icon('search', 'lg')}<input id="ck" placeholder="Search 150 documents (full text), records, people and pages…" autocomplete="off"><kbd>esc</kbd></div><div class="cmdk-res" id="ckr"></div>
    <div class="cmdk-f"><span><kbd>↑</kbd> <kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span>Searches inside procedure text, e.g. “quorum”, “hydrostatic”, “retention”</span></div></div></div>`;
  document.body.appendChild(wrap);
  const input = $('#ck'), res = $('#ckr');
  let items = [], sel = 0;
  const close = () => { wrap.remove(); document.removeEventListener('keydown', key, true); };
  wrap.querySelector('.scrim').onclick = close; wrap.querySelector('.cmdk').onclick = (e) => { if (e.target.classList.contains('cmdk')) close(); };
  const mark = (s, q) => { const t = esc(s || ''); if (!q) return t; const i = t.toLowerCase().indexOf(esc(q).toLowerCase()); return i < 0 ? t : t.slice(0, i) + '<mark>' + t.slice(i, i + esc(q).length) + '</mark>' + t.slice(i + esc(q).length); };
  const ICON = { documents: 'file', user: 'users', page: 'arrowR' };
  const draw = (q) => {
    const groups = {};
    items.forEach((it, i) => { const g = it.kind === 'page' ? 'Pages' : it.kind === 'documents' ? 'Documents' : it.kind === 'user' ? 'People' : state.meta.modules[it.kind]?.title || 'Records'; (groups[g] = groups[g] || []).push([it, i]); });
    res.innerHTML = items.length ? Object.entries(groups).map(([g, arr]) => `<div class="cmdk-g">${esc(g)}</div>${arr.map(([it, i]) => `<div class="cmdk-i ${i === sel ? 'sel' : ''}" data-i="${i}"><span class="kpi-ico tone-${it.kind === 'documents' ? 'blue' : it.kind === 'page' ? 'gray' : 'violet'}" style="width:26px;height:26px">${icon(it.ic || ICON[it.kind] || state.meta.modules[it.kind]?.icon || 'file', 'sm')}</span><div class="grow"><b>${it.code ? `<span class="code" style="margin-right:6px">${mark(it.code, q)}</span>` : ''}${mark(it.title, q)}</b><small>${it.snippet ? mark(it.snippet, q) : esc(it.sub || '')}</small></div>${icon('chevR', 'sm')}</div>`).join('')}`).join('')
      : `<div class="empty"><b>No results</b>Try a document code like OP/WF/005 or a word from a procedure.</div>`;
    res.querySelector('.sel')?.scrollIntoView({ block: 'nearest' });
  };
  const run = debounce(async () => {
    const q = input.value.trim();
    const pages = PAGES.filter((p) => !q || p.title.toLowerCase().includes(q.toLowerCase()));
    items = q.length >= 2 ? [...pages.slice(0, 3), ...(await api('/search?q=' + encodeURIComponent(q)))] : pages;
    sel = 0; draw(q);
  }, 140);
  const open = (it) => { close(); if (!it) return; if (it.kind === 'page') location.hash = '#/' + it.r; else if (it.kind === 'documents') location.hash = '#/documents/' + it.id; else go(it.kind, it.id); };
  const key = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); draw(input.value.trim()); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); draw(input.value.trim()); }
    else if (e.key === 'Enter') { e.preventDefault(); open(items[sel]); }
  };
  document.addEventListener('keydown', key, true);
  res.onclick = (e) => { const i = e.target.closest('[data-i]')?.dataset.i; if (i !== undefined) open(items[i]); };
  input.oninput = run; input.focus(); run();
}
document.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && state.user) { e.preventDefault(); openCmdk(); } });

window.addEventListener('online', () => syncQueue().then(() => refreshCounts()));
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => { });
boot();
