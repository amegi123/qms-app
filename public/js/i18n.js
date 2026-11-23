// Amharic (አማርኛ) interface. The translator runs over the rendered DOM, so every page, drawer, dialog and toast is covered.
// Labels are machine-drafted and should be reviewed by a native speaker. Document contents and user-entered data stay as written.
import { DICT } from './am-dict.js';
export const AM = { ...DICT };
let LC = null;
setTimeout(() => MON_EN.forEach((m, i) => { if (!AM[m]) AM[m] = MON_AM[i]; }), 0);
const lookupPl = (x) => lookup(x) || lookup(x + 's') || lookup(x + 'es') || lookup(x.replace(/y$/, 'ies'));
const lookup = (t) => { if (AM[t]) return AM[t]; if (!LC) { LC = {}; for (const k in AM) LC[k.toLowerCase()] = AM[k]; } return LC[t.toLowerCase()]; };
export const MON_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const MON_AM = ['ጃንዩ', 'ፌብሩ', 'ማርች', 'ኤፕሪ', 'ሜይ', 'ጁን', 'ጁላይ', 'ኦገስ', 'ሴፕቴ', 'ኦክቶ', 'ኖቬም', 'ዲሴም'];

// Strings that contain numbers or names: [regex, builder]
export const PATTERNS = [
  [/^(\d+)d overdue$/, (m) => `${m[1]} ቀን ዘግይቷል`],
  [/^Due in (\d+)d$/, (m) => `በ${m[1]} ቀን ውስጥ ይደርሳል`],
  [/^in (\d+)d$/, (m) => `በ${m[1]} ቀን`],
  [/^(\d+) of (\d+) record\(s\)$/, (m) => `${m[1]} ከ${m[2]} መዝገቦች`],
  [/^(\d+) of (\d+) records?$/, (m) => `${m[1]} ከ${m[2]} መዝገቦች`],
  [/^(\d+) document\(s\)$/, (m) => `${m[1]} ሰነዶች`],
  [/^(\d+) documents?$/, (m) => `${m[1]} ሰነዶች`],
  [/^Showing (\d+)–(\d+) of (\d+)$/, (m) => `ከ${m[3]} ውስጥ ${m[1]}–${m[2]} ታይቷል`],
  [/^Page (\d+) \/ (\d+)$/, (m) => `ገጽ ${m[1]} / ${m[2]}`],
  [/^Good (morning|afternoon|evening), (.+)$/, (m) => `${{ morning: 'እንደምን አደሩ', afternoon: 'እንደምን ዋሉ', evening: 'እንደምን አመሹ' }[m[1]]}፣ ${m[2]}`],
  [/^(\d+) items? need you$/, (m) => `${m[1]} ጉዳዮች እርስዎን ይጠብቃሉ`],
  [/^(\d+)\/(\d+) acknowledged$/, (m) => `${m[1]}/${m[2]} አረጋግጠዋል`],
  [/^Signed in as (.+)$/, (m) => `እንደ ${m[1]} ገብተዋል`],
  [/^Now acting as (.+)$/, (m) => `አሁን እንደ ${m[1]}`],
  [/^Target (.+) · (on target|below target|no data)$/, (m) => `ግብ ${m[1]} · ${{ 'on target': 'ግቡ ላይ', 'below target': 'ከግብ በታች', 'no data': 'መረጃ የለም' }[m[2]]}`],
  [/^Issue (\d+)$/, (m) => `እትም ${m[1]}`],
  [/^Revision (\d+)$/, (m) => `ማሻሻያ ${m[1]}`],
  [/^(\d+) comments?$/, (m) => `${m[1]} አስተያየቶች`],
  [/^(\d+) gaps?$/, (m) => `${m[1]} ክፍተቶች`],
  [/^(\d+) overdue$/, (m) => `${m[1]} ዘግይተዋል`],
  [/^(\d+) open$/, (m) => `${m[1]} ክፍት`],
  [/^(\d+) people$/, (m) => `${m[1]} ሰዎች`],
  [/^(\d+) files? · last import (.+)$/, (m) => `${m[1]} ፋይሎች · የመጨረሻ ማስመጣት ${m[2]}`],
  [/^Procedure (.+)$/, (m) => `አሰራር ${m[1]}`],
  [/^New (.+)$/, (m) => `አዲስ ${lookupPl(m[1]) || m[1]}`],
  [/^Search (.+)…$/, (m) => `${lookupPl(m[1]) || m[1]} ይፈልጉ…`],
  [/^(\d+) h$/, (m) => `${m[1]} ሰዓት`],
  [/^(\d+) \/ (\d+)$/, (m) => `${m[1]} / ${m[2]}`],
  [/^(.+) · Forms (.+)$/, (m) => `${lookup(m[1]) || m[1]} · ቅጾች ${m[2]}`],
  [/^Forms (OF\/WF.+)$/, (m) => `ቅጾች ${m[1]}`],
  [/^(NCR|CAPA|Complaints) ([^:]+): (\d+)$/, (m) => `${lookup(m[1]) || m[1]} ${lookup(m[2]) || m[2]}፦ ${m[3]}`],
  [/^(\d+) in change workflow ·$/, (m) => `${m[1]} በለውጥ ሂደት ·`],
  [/^(\d+) review overdue$/, (m) => `${m[1]} ግምገማ ዘግይቷል`],
  [/^(\d+) late$/, (m) => `${m[1]} ዘግይተዋል`],
  [/^(\d+) audits open ·$/, (m) => `${m[1]} ኦዲቶች ክፍት ·`],
  [/^(\d+) open complaints?$/, (m) => `${m[1]} ክፍት ቅሬታዎች`],
  [/^· (\d+)% closed on time$/, (m) => `· ${m[1]}% በጊዜ ተዘግተዋል`],
  [/^· (\d+) due in 30 days$/, (m) => `· ${m[1]} በ30 ቀን ውስጥ ይደርሳሉ`],
  [/^(\d+) times?$/, (m) => `${m[1]} ጊዜ`],
  [/^(\d+) NCRs$/, (m) => `${m[1]} NCRs`],
  [/^the analysis of your (\d+) QMS files found (\d+) gaps \((\d+) high priority\) — e\.g\. quality objectives \(OF\/WF\/027\) missing and no document review interval defined\.$/, (m) => `የ${m[1]} QMS ፋይሎችዎ ትንተና ${m[2]} ክፍተቶችን አግኝቷል (${m[3]} ከፍተኛ ቅድሚያ) — ለምሳሌ የጥራት ግቦች (OF/WF/027) የሉም፣ የሰነድ ግምገማ ጊዜም አልተወሰነም።`],
  [/^(.+) \((\d+) criteria\)$/, (m) => `${lookup(m[1]) || m[1]} (${m[2]} መመዘኛዎች)`],
  [/^Next step “(.+)” needs: (.+)$/, (m) => `ቀጣይ ደረጃ “${lookup(m[1]) || m[1]}” የሚያስፈልገው፦ ${m[2].split(', ').map((r) => lookup(r) || r).join('፣ ')}`],
  [/^Raised (.+) by (.+)$/, (m) => `በ${m[2]} ${m[1]} ተፈጥሯል`],
  [/^Use “(.+)” to create a traceable follow-up\.$/, (m) => `ተከታይ እርምጃ ለመፍጠር “${m[1].split(' / ').map((x) => lookup(x) || x).join(' / ')}” ይጠቀሙ።`],
  [/^(\d+) record\(s\) dated outside (\d+) – switch to table view to see them\.$/, (m) => `${m[1]} መዝገቦች ከ${m[2]} ውጭ ናቸው – ለማየት ወደ ሰንጠረዥ እይታ ይቀይሩ።`],
  [/^Raise (.+) \/ (.+)$/, (m) => `${lookup(m[1]) || m[1]} / ${lookup(m[2]) || m[2]} አስነሳ`],
  [/^Raise (.+)$/, (m) => `${lookup(m[1]) || m[1]} አስነሳ`],
  [/^Landed cost: Birr (.+) per kg$/, (m) => `የደረሰ ወጪ፦ በኪሎ ብር ${m[1]}`],
  [/^Selling price: Birr (.+) per kg(?: · Birr (.+) per metre)?$/, (m) => `የመሸጫ ዋጋ፦ በኪሎ ብር ${m[1]}${m[2] ? ` · በሜትር ብር ${m[2]}` : ''}`],
  [/^Overall score: (\d+%)$/, (m) => `ጠቅላላ ውጤት፦ ${m[1]}`],
  [/^Due (\d+)d$/, (m) => `${m[1]} ቀን`],
  [/^Birr (.+)$/, (m) => `ብር ${m[1]}`],
  [/^(\d+) acknowledgements pending$/, (m) => `${m[1]} ማረጋገጫዎች በመጠባበቅ ላይ`],
  [/^(\d+) in change workflow · (\d+) review overdue$/, (m) => `${m[1]} በለውጥ ሂደት · ${m[2]} ግምገማ ዘግይቷል`],
  [/^(Change requested|Drafting|Requester review|Awaiting approval|Issued \(controlled\)|Obsolete|Request rejected): (\d+)$/, (m) => `${lookup(m[1]) || m[1]}፦ ${m[2]}`],
];

const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'KBD']);
function tx1(t) {
  const d = lookup(t); if (d) return d;
  for (const [re, fn] of PATTERNS) { const m = t.match(re); if (m) return fn(m); }
  return null;
}
function tx(s) {
  const t = s.trim();
  if (!t || !/[A-Za-z]/.test(t)) return s;
  let r = tx1(t);
  if (r == null && t.includes(' · ')) { const parts = t.split(' · ').map((p) => tx1(p.trim()) ?? p); r = parts.join(' · '); if (r === t) r = null; }
  return r == null ? s : s.replace(t, r);
}
function textNode(n) {
  const p = n.parentElement; if (!p || SKIP.has(p.tagName) || p.closest('[data-notr]')) return;
  if (p.tagName === 'OPTION' && !p.hasAttribute('value')) p.setAttribute('value', n.nodeValue.trim());
  const v = tx(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v;
}
export function translateTree(root) {
  if (!root) return;
  if (root.nodeType === 3) return textNode(root);
  if (root.nodeType !== 1) return;
  root.querySelectorAll?.('option:not([value])').forEach((o) => o.setAttribute('value', o.textContent.trim()));
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
  nodes.forEach(textNode);
  const els = root.matches?.('[placeholder],[title]') ? [root] : [];
  root.querySelectorAll?.('[placeholder],[title]').forEach((e) => els.push(e));
  els.forEach((e) => ['placeholder', 'title'].forEach((a) => { if (e.hasAttribute(a)) { const v = tx(e.getAttribute(a)); if (v !== e.getAttribute(a)) e.setAttribute(a, v); } }));
}
let obs = null;
export function startTranslator() {
  if (obs) return;
  translateTree(document.body);
  obs = new MutationObserver((muts) => { for (const m of muts) { if (m.type === 'characterData') textNode(m.target); else if (m.type === 'attributes') { const v = tx(m.target.getAttribute(m.attributeName) || ''); if (v !== m.target.getAttribute(m.attributeName)) m.target.setAttribute(m.attributeName, v); } else m.addedNodes.forEach((n) => translateTree(n)); } });
  obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['title', 'placeholder'] });
}
export function stopTranslator() { obs?.disconnect(); obs = null; }
