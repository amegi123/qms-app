// Dependency-free SVG charts that follow the CSS theme tokens.
import { esc } from './core.js';

export const PALETTE = ['#0a5bd3', '#0e9488', '#f59e0b', '#7c3aed', '#e11d48', '#64748b', '#16a34a', '#0891b2'];
const TONE = { green: '#16a34a', amber: '#f59e0b', red: '#e11d48', blue: '#0a5bd3', violet: '#7c3aed', teal: '#0e9488', gray: '#94a3b8', '': '#94a3b8' };
export const toneColor = (t) => TONE[t] || '#94a3b8';

export function donut(items, { size = 150, thick = 20, center, sub } = {}) {
  const total = items.reduce((a, x) => a + x.n, 0) || 1;
  const r = (size - thick) / 2, c = 2 * Math.PI * r;
  let off = 0;
  const arcs = items.filter((x) => x.n).map((x, i) => {
    const len = (x.n / total) * c;
    const s = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${x.color || PALETTE[i % PALETTE.length]}" stroke-width="${thick}" stroke-dasharray="${Math.max(0, len - 2)} ${c}" stroke-dashoffset="${-off}" transform="rotate(-90 ${size / 2} ${size / 2})"><title>${esc(x.label)}: ${x.n}</title></circle>`;
    off += len; return s;
  }).join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="chart"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="${thick}"/>${arcs}
    <text x="50%" y="${size / 2 + 2}" text-anchor="middle" style="font-size:24px;font-weight:700;fill:var(--ink)">${esc(center ?? total)}</text>
    <text x="50%" y="${size / 2 + 20}" text-anchor="middle" style="font-size:11px">${esc(sub || 'total')}</text></svg>`;
}
export function legend(items) {
  return `<div class="legend" style="flex-direction:column;gap:7px">${items.map((x, i) => `<div class="split" style="justify-content:space-between;gap:16px"><span><i style="background:${x.color || PALETTE[i % PALETTE.length]}"></i>${esc(x.label)}</span><b style="color:var(--ink);font-variant-numeric:tabular-nums">${x.n}</b></div>`).join('')}</div>`;
}

export function bars(series, labels, { h = 190, colors = PALETTE, stacked = true, names = [] } = {}) {
  const W = 560, pad = { l: 28, r: 8, t: 10, b: 24 };
  const n = labels.length, iw = W - pad.l - pad.r, ih = h - pad.t - pad.b;
  const totals = labels.map((_, i) => stacked ? series.reduce((a, s) => a + s[i], 0) : Math.max(...series.map((s) => s[i])));
  const max = Math.max(4, ...totals); const step = Math.ceil(max / 4);
  const top = step * 4; const bw = (iw / n) * 0.56;
  let g = '';
  for (let k = 0; k <= 4; k++) { const y = pad.t + ih - (k * step / top) * ih; g += `<line class="gl" x1="${pad.l}" x2="${W - pad.r}" y1="${y}" y2="${y}"/><text x="${pad.l - 6}" y="${y + 4}" text-anchor="end">${k * step}</text>`; }
  labels.forEach((lab, i) => {
    const x = pad.l + (iw / n) * i + (iw / n - bw) / 2;
    let acc = 0;
    series.forEach((s, si) => {
      const v = s[i]; if (!v) return;
      const bh = (v / top) * ih; const y = pad.t + ih - ((acc + v) / top) * ih;
      const w = stacked ? bw : bw / series.length; const xx = stacked ? x : x + w * si;
      g += `<rect x="${xx}" y="${y}" width="${w - (stacked ? 0 : 2)}" height="${bh}" rx="3" fill="${colors[si]}"><title>${esc(names[si] || '')} ${esc(lab)}: ${v}</title></rect>`;
      if (stacked) acc += v;
    });
    g += `<text x="${x + bw / 2}" y="${h - 6}" text-anchor="middle">${esc(lab)}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${h}" class="chart" style="width:100%;height:auto">${g}</svg>`;
}

export function area(values, labels, { h = 160, color = '#0a5bd3', max: mx } = {}) {
  const W = 560, pad = { l: 28, r: 10, t: 12, b: 24 };
  const iw = W - pad.l - pad.r, ih = h - pad.t - pad.b;
  const max = mx || Math.max(4, ...values) * 1.15;
  const pts = values.map((v, i) => [pad.l + (iw / (values.length - 1)) * i, pad.t + ih - (v / max) * ih]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const id = 'g' + Math.random().toString(36).slice(2, 7);
  let g = '';
  for (let k = 0; k <= 3; k++) { const y = pad.t + ih - (k / 3) * ih; g += `<line class="gl" x1="${pad.l}" x2="${W - pad.r}" y1="${y}" y2="${y}"/><text x="${pad.l - 6}" y="${y + 4}" text-anchor="end">${Math.round((k / 3) * max)}</text>`; }
  labels.forEach((l, i) => { if (labels.length > 8 && i % 2) return; g += `<text x="${pts[i][0]}" y="${h - 6}" text-anchor="middle">${esc(l)}</text>`; });
  return `<svg viewBox="0 0 ${W} ${h}" class="chart" style="width:100%;height:auto"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".22"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>${g}
    <path d="${line} L${pts[pts.length - 1][0]} ${pad.t + ih} L${pts[0][0]} ${pad.t + ih}Z" fill="url(#${id})"/><path d="${line}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round"/>
    ${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="3.2" fill="var(--surface)" stroke="${color}" stroke-width="2"><title>${esc(labels[i])}: ${values[i]}</title></circle>`).join('')}</svg>`;
}

export function spark(values, color = '#0a5bd3', w = 90, h = 28) {
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => `${(w / (values.length - 1)) * i},${h - 3 - (v / max) * (h - 6)}`).join(' ');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

export function gauge(pct, { size = 140, label = '', color } = {}) {
  const v = Math.max(0, Math.min(100, pct ?? 0));
  const col = color || (v >= 80 ? '#16a34a' : v >= 65 ? '#0a5bd3' : v >= 50 ? '#f59e0b' : '#e11d48');
  const r = size / 2 - 12, cx = size / 2, cy = size / 2 + 6, c = Math.PI * r;
  return `<svg width="${size}" height="${size / 2 + 28}" viewBox="0 0 ${size} ${size / 2 + 28}" class="chart">
    <path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="var(--surface-3)" stroke-width="12" stroke-linecap="round"/>
    <path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(v / 100) * c} ${c}"/>
    <text x="${cx}" y="${cy - 6}" text-anchor="middle" style="font-size:24px;font-weight:700;fill:var(--ink)">${pct == null ? '—' : v + '%'}</text>
    <text x="${cx}" y="${cy + 16}" text-anchor="middle">${esc(label)}</text></svg>`;
}

export function hbars(items, { max, color = '#0a5bd3', suffix = '' } = {}) {
  const m = max || Math.max(1, ...items.map((x) => x.n));
  return items.map((x) => `<div class="hbar"><span class="nowrap" style="overflow:hidden;text-overflow:ellipsis" title="${esc(x.label)}">${esc(x.label)}</span><div class="prog"><i style="width:${(x.n / m) * 100}%;background:${x.color || color}"></i></div><b>${x.n}${suffix}</b></div>`).join('');
}
