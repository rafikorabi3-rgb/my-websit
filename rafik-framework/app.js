/* Rafik Framework — Active Learning Engine
   حالة واحدة (S) من أربعة أقسام تُحفظ محلياً، وفي حساب المستخدم حين تتاح قاعدة بيانات الصفحة. */
(() => {
'use strict';

const BASE = window.RF_CURRICULUM, TPL = window.RF_TEMPLATES;
const LS_KEY = 'rafik-framework-ale-v1';
const SECTIONS = ['core', 'log', 'work', 'board'];

/* ───────── أدوات ───────── */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const clone = o => JSON.parse(JSON.stringify(o));
const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
function setPath(o, p, v) { const ks = p.split('.'), last = ks.pop(); ks.reduce((a, k) => (a[k] ??= {}), o)[last] = v; }
const daysTo = d => (d ? Math.round((new Date(d + 'T00:00') - new Date(today() + 'T00:00')) / 864e5) : null);
function deepMerge(a, b) {
  if (Array.isArray(b)) return b;
  if (b && typeof b === 'object') {
    const o = a && typeof a === 'object' && !Array.isArray(a) ? { ...a } : {};
    for (const k in b) o[k] = deepMerge(o[k], b[k]);
    return o;
  }
  return b === undefined ? a : b;
}

/* ───────── ثوابت العرض ───────── */
const KIND = ['المستوى', 'الفصل', 'الوحدة', 'المعرفة'];
const KIND_EN = ['Level', 'Chapter', 'Module', 'Knowledge'];
const STATUS = { new: 'لم تبدأ', progress: 'قيد الدراسة', review: 'مكتملة · غير متقنة', mastered: 'متقنة' };
const STATUS_OPTS = Object.entries(STATUS).map(([v, t]) => [v, t]);
const PRIO = ['غير محددة', 'منخفضة', 'متوسطة', 'عالية'];
const PRIO_OPTS = PRIO.map((t, i) => [i, t]);
const LOGTYPE = { gap: 'فجوة معرفية', question: 'سؤال غير محسوم' };
const LOGSTATUS = {
  gap: [['open', 'مفتوحة', 'neg'], ['working', 'قيد المعالجة', 'neu'], ['resolved', 'سُدّت', 'pos']],
  question: [['open', 'مفتوح', 'neg'], ['working', 'أميل إلى رأي', 'neu'], ['resolved', 'محسوم', 'pos']],
};
const HYP_STATUS = [['active', 'نشطة', 'info'], ['confirmed', 'مؤكدة', 'pos'], ['invalid', 'مُبطلة', 'neg'], ['paused', 'معلّقة', 'unk']];
const HORIZON = [['unk', 'غير محدد', 'unk'], ['day', 'يومي'], ['week', 'أسبوعي'], ['month', 'شهري'], ['quarter', 'فصلي'], ['long', 'أطول']];
const LEVEL_ROLE = [['support', 'دعم'], ['resist', 'مقاومة'], ['pivot', 'محوري'], ['confirm', 'تأكيد', 'pos'], ['invalid', 'إبطال', 'neg'], ['target', 'هدف'], ['unk', 'غير محسوم', 'unk']];
const SCEN_KIND = [['base', 'أساسي', 'info'], ['alt', 'بديل'], ['tail', 'مخاطرة ذيلية', 'neg'], ['unk', 'غير محسوم', 'unk']];
const EV_SIDE = [['for', 'مؤيد', 'pos'], ['against', 'معارض', 'neg'], ['neutral', 'محايد', 'neu']];
const W_DEFAULT = { review: 30, progress: 18, fresh: 10, gap: 12, weak: 4, practical: 8, teaching: 10, prereq: 25, order: 2 };
const W_LABEL = {
  review: 'وحدة مكتملة لكنها غير متقنة', progress: 'وحدة بدأتها ولم تكملها', fresh: 'وحدة جديدة في المستوى الحالي',
  gap: 'كل فجوة أو سؤال مفتوح مرتبط بالوحدة', weak: 'كل نقطة معرفة غير متقنة', practical: 'كل درجة في الأولوية العملية',
  teaching: 'ارتباطها بمسؤولية تعليمية', prereq: 'خصم لكل متطلب سابق لم يكتمل', order: 'ترتيبها في المسار',
};
const TH_DEFAULT = { mastered: 80, pass: 50 };

/* ───────── الحالة الافتراضية ───────── */
function newSheet(def, name) { return { id: uid('sh'), name, date: today(), fields: {}, rows: clone(def.rows) }; }
function newHyp(o = {}) {
  return {
    id: uid('h'), title: '', asset: 'الذهب XAU/USD', horizon: 'unk', status: 'active', statement: '', concepts: [],
    levels: [{ label: 'مستوى الإبطال', value: '', role: 'invalid', note: '' }, { label: 'مستوى التأكيد', value: '', role: 'confirm', note: '' }],
    scenarios: [{ name: 'السيناريو الأساسي', kind: 'base', prob: '', trigger: '', path: '', target: '' }, { name: 'السيناريو البديل', kind: 'alt', prob: '', trigger: '', path: '', target: '' }],
    evidence: [], confirms: [{ text: '', met: false }], invalidates: [{ text: '', met: false }],
    review: '', notes: '', created: today(), ...o,
  };
}
function defaults() {
  const sheets = {};
  TPL.sheets.forEach(d => { const s = newSheet(d, 'النسخة الأولى'); sheets[d.id] = { active: s.id, items: [s] }; });
  return {
    core: {
      currentLevel: 'L01',
      teaching: [{ id: uid('t'), title: 'شرح محركات الذهب للمتعلمين', audience: '', due: '', modules: ['L01-C4-M2'], done: false, example: true }],
      weights: { ...W_DEFAULT }, thresholds: { ...TH_DEFAULT },
      mods: {}, custom: { titles: {}, confirmed: {}, added: {}, removed: [] },
    },
    log: {
      items: [
        { id: uid('g'), type: 'question', text: 'هل ضعف العلاقة بين الذهب والعوائد الحقيقية منذ 2022 تحوّل دائم أم مرحلة مؤقتة؟', module: 'L01-C4-M2', priority: 3, status: 'open', note: '', resolution: '', created: today() },
        { id: uid('g'), type: 'question', text: 'ما العناوين النهائية للمستويات 02 وما بعدها، وكم عددها؟', module: '', priority: 2, status: 'open', note: 'العناوين الحالية خيارات مقترحة فقط.', resolution: '', created: today() },
      ],
      sessions: [],
    },
    work: {
      sheets,
      checklists: TPL.checklists.map(c => ({ id: uid('c'), title: c.title, items: c.items.map(t => ({ id: uid('i'), text: t, done: false })) })),
    },
    board: {
      items: [newHyp({
        title: 'اتجاه الذهب على المدى المتوسط', example: true, concepts: ['L01-C2-M1', 'L01-C4-M2'],
        statement: '', horizon: 'month',
      })],
      open: null,
    },
    ts: { core: 0, log: 0, work: 0, board: 0 },
  };
}
function hydrate(raw) {
  const d = defaults();
  if (!raw || typeof raw !== 'object') return d;
  for (const s of SECTIONS) if (raw[s] && typeof raw[s] === 'object') d[s] = deepMerge(d[s], raw[s]);
  d.ts = { ...d.ts, ...(raw.ts || {}) };
  return d;
}

/* ───────── التخزين ───────── */
let S, T = [], IDX = {};
const UI = {
  view: 'home', sel: { level: null, chapter: null, module: null }, edit: null,
  lesson: null, logFilter: { type: 'all', status: 'open' }, tpl: 'market-map',
};
const store = { local: true, cloud: null, cloudOk: false, busy: false, dirty: new Set(), last: {}, loadTs: {} };
let saveTimer = null, undoSnap = null, toastTimer = null;

function loadLocal() { try { return JSON.parse(localStorage.getItem(LS_KEY)); } catch { return null; } }
function writeLocal() { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); store.local = true; } catch { store.local = false; } }
function touch() { clearTimeout(saveTimer); saveTimer = setTimeout(persist, 500); }
function persist() {
  const now = Date.now();
  for (const s of SECTIONS) {
    const j = JSON.stringify(S[s]);
    if (j !== store.last[s]) { store.last[s] = j; S.ts[s] = now; store.dirty.add(s); }
  }
  writeLocal(); pushCloud(); paintStore();
}
async function pushCloud() {
  if (!store.cloud || store.busy) return;
  store.busy = true;
  try {
    while (store.dirty.size) {
      const s = store.dirty.values().next().value; store.dirty.delete(s);
      const body = { ts: S.ts[s], json: store.last[s] };
      try { await store.cloud.doc('rf-' + s).set(body); store.cloudOk = true; }
      catch (e) {
        if (e && e.code === 'unavailable') {
          await new Promise(r => setTimeout(r, 800 + Math.random() * 800));
          try { await store.cloud.doc('rf-' + s).set(body); store.cloudOk = true; continue; } catch { /* يسقط إلى الأسفل */ }
        }
        store.cloudOk = false; store.dirty.add(s); break;
      }
    }
  } finally { store.busy = false; paintStore(); }
}
async function initCloud() {
  if (!window.claude || typeof window.claude.use !== 'function') return;
  try {
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    const id = user ? await user.id() : null;
    if (!db || !id) return;
    const col = db.collection('data/users/' + id);
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 10000));
    const snaps = await Promise.race([Promise.all(SECTIONS.map(s => col.doc('rf-' + s).get())), timeout]);
    let adopted = false;
    snaps.forEach((snap, i) => {
      const s = SECTIONS[i], d = snap.exists ? snap.data() : null;
      if (d && typeof d.json === 'string' && (d.ts || 0) > (store.loadTs[s] || 0)) {
        try {
          S[s] = deepMerge(defaults()[s], JSON.parse(d.json)); S.ts[s] = d.ts;
          store.last[s] = JSON.stringify(S[s]); adopted = true;
        } catch { /* مستند تالف: نبقي النسخة المحلية */ }
      } else if ((S.ts[s] || 0) > ((d && d.ts) || 0)) store.dirty.add(s);
    });
    store.cloud = col; store.cloudOk = true;
    if (adopted) { writeLocal(); rebuild(); render(); toast('حُمّلت بياناتك المحفوظة في حسابك'); }
    pushCloud();
  } catch { /* نبقى على التخزين المحلي */ }
  paintStore();
}
function paintStore() {
  const el = $('#store'); if (!el) return;
  let cls = 'ok', txt = 'يُحفظ في هذا المتصفح فقط';
  if (store.cloud && store.cloudOk) txt = 'يُحفظ في حسابك تلقائياً';
  else if (store.cloud && !store.cloudOk) { cls = 'warn'; txt = 'تعذّر الحفظ في الحساب. النسخة المحلية سليمة'; }
  else if (!store.local) { cls = 'bad'; txt = 'التخزين غير متاح. انسخ بياناتك قبل الإغلاق'; }
  el.className = 'store ' + cls; el.textContent = txt;
}

/* ───────── شجرة المنهج الفعلية (الأساس + تعديلات المستخدم) ───────── */
function rebuild() {
  const c = S.core.custom; IDX = {};
  const mk = (n, depth, parent) => {
    const o = { ...n, depth, parent };
    if (c.titles[n.id] != null && c.titles[n.id] !== '') o.title = c.titles[n.id];
    o.prov = c.confirmed[n.id] != null ? !c.confirmed[n.id] : !!n.prov;
    IDX[n.id] = o;
    o.children = [...(n.children || []), ...(c.added[n.id] || [])].filter(k => !c.removed.includes(k.id)).map(k => mk(k, depth + 1, o));
    return o;
  };
  T = [...BASE.levels, ...(c.added.root || [])].filter(k => !c.removed.includes(k.id)).map(l => mk(l, 0, null));
}
const modulesOf = n => (n.depth === 2 ? [n] : n.depth < 2 ? n.children.flatMap(modulesOf) : []);
const allModules = () => T.flatMap(modulesOf);
const curLevel = () => (IDX[S.core.currentLevel] && IDX[S.core.currentLevel].depth === 0 ? IDX[S.core.currentLevel] : T[0]);
const MOD0 = Object.freeze({ k: Object.freeze({}) });
const modR = id => S.core.mods[id] || MOD0;
const modW = id => { const m = (S.core.mods[id] ??= {}); m.k ??= {}; return m; };
const statusOf = id => (STATUS[modR(id).status] ? modR(id).status : 'new');
const practicalOf = m => { const v = modR(m.id).practical; return v === undefined || v === '' ? (m.practical || 0) : Number(v) || 0; };
const kState = (mid, kid) => (modR(mid).k || {})[kid];
function stats(n) {
  const c = { new: 0, progress: 0, review: 0, mastered: 0 }, ms = modulesOf(n);
  ms.forEach(m => c[statusOf(m.id)]++);
  return { total: ms.length, ...c, done: c.review + c.mastered };
}
const gapsFor = id => S.log.items.filter(i => i.module === id && i.status !== 'resolved');
const teachFor = id => S.core.teaching.filter(t => !t.done && (t.modules || []).includes(id));
const hypsFor = id => S.board.items.filter(h => (h.concepts || []).includes(id));
const modOpts = () => allModules().map(m => [m.id, `${m.id.replace(/-/g, '·')} — ${m.title}`]);

/* ───────── اختيار الدرس التالي ───────── */
function rank() {
  const lvl = curLevel(); if (!lvl) return [];
  const W = { ...W_DEFAULT, ...S.core.weights }, ms = modulesOf(lvl), num = v => Number(v) || 0;
  return ms.map((m, i) => {
    const st = statusOf(m.id), parts = [];
    const gaps = gapsFor(m.id).length;
    const weak = m.children.filter(k => kState(m.id, k.id) === 'weak').length;
    if (st === 'mastered' && !gaps && !weak) return null;
    if (st === 'review') parts.push(['مكتملة لكنها غير متقنة', num(W.review)]);
    else if (st === 'progress') parts.push(['بدأتها ولم تكملها', num(W.progress)]);
    else if (st === 'new') parts.push(['وحدة جديدة في المستوى الحالي', num(W.fresh)]);
    if (gaps) parts.push([`${gaps} فجوة أو سؤال مفتوح`, Math.min(gaps, 3) * num(W.gap)]);
    if (weak) parts.push([`${weak} نقطة معرفة غير متقنة`, Math.min(weak, 4) * num(W.weak)]);
    const pr = practicalOf(m);
    if (pr) parts.push([`أولوية عملية ${PRIO[pr]}`, pr * num(W.practical)]);
    teachFor(m.id).forEach(t => {
      const d = daysTo(t.due); let pts = num(W.teaching), lbl = 'مسؤولية تعليمية: ' + (t.title || 'بلا عنوان');
      if (d != null) {
        if (d < 0) { pts *= 2; lbl += ' (فات موعدها)'; }
        else if (d <= 7) { pts *= 2; lbl += ` (خلال ${d} يوم)`; }
        else if (d <= 21) pts = Math.round(pts * 1.5);
      }
      parts.push([lbl, pts]);
    });
    (m.prereq || []).map(id => IDX[id]).filter(x => x && !['review', 'mastered'].includes(statusOf(x.id)))
      .forEach(x => parts.push([`تسبقها وحدة لم تكتمل: ${x.title}`, -num(W.prereq)]));
    parts.push(['ترتيبها في المسار', (ms.length - i) * num(W.order)]);
    return { m, parts, score: parts.reduce((a, x) => a + x[1], 0) };
  }).filter(Boolean).sort((a, b) => b.score - a.score);
}

/* ───────── مكوّنات HTML صغيرة ───────── */
const G = p => getPath(p.startsWith('UI.') ? UI : S, p.slice(p.indexOf('.') + 1));
const fid = p => 'f-' + p.replace(/[^\w-]/g, '_');
const code = id => `<bdi class="code" dir="ltr">${esc(id.replace(/-/g, ' › '))}</bdi>`;
const pill = st => `<span class="pill st-${st}">${STATUS[st]}</span>`;
const provChip = n => (n.prov ? '<span class="chip unk">مؤقت</span>' : '');
function inp(path, o = {}) {
  const v = G(path) ?? '';
  return `<input id="${fid(path)}" type="${o.type || 'text'}" data-bind="${path}" value="${esc(v)}" placeholder="${esc(o.ph || '')}" aria-label="${esc(o.label || o.ph || '')}"${o.min != null ? ` min="${o.min}"` : ''}${o.max != null ? ` max="${o.max}"` : ''}${o.calc ? ' data-calc' : ''}${o.cls ? ` class="${o.cls}"` : ''}>`;
}
function area(path, o = {}) {
  return `<textarea id="${fid(path)}" data-bind="${path}" rows="${o.rows || 2}" placeholder="${esc(o.ph || '')}" aria-label="${esc(o.label || o.ph || '')}">${esc(G(path) ?? '')}</textarea>`;
}
function sel(path, opts, o = {}) {
  const cur = G(path) ?? '', hit = opts.find(x => String(x[0]) === String(cur));
  return `<select id="${fid(path)}" data-bind="${path}" data-re${o.num ? ' data-num' : ''} class="${hit && hit[2] ? 'tone-' + hit[2] : ''}" aria-label="${esc(o.label || '')}">${o.blank ? '<option value="">—</option>' : ''}${opts.map(x => `<option value="${esc(x[0])}"${String(x[0]) === String(cur) ? ' selected' : ''}>${esc(x[1])}</option>`).join('')}</select>`;
}
const field = (label, control, cls = '') => `<label class="field ${cls}"><span>${esc(label)}</span>${control}</label>`;
function strip(n, big) {
  const ms = modulesOf(n);
  if (!ms.length) return '<div class="strip empty">لا وحدات بعد</div>';
  return `<div class="strip${big ? ' big' : ''}" role="img" aria-label="حالة ${ms.length} وحدة">${ms.map(m => `<i class="seg st-${statusOf(m.id)}" title="${esc(m.title)} · ${STATUS[statusOf(m.id)]}"></i>`).join('')}</div>`;
}
const head = (title, sub, actions = '') => `<header class="vh"><div><h1>${title}</h1>${sub ? `<p class="lead">${sub}</p>` : ''}</div>${actions ? `<div class="vh-actions">${actions}</div>` : ''}</header>`;
const empty = t => `<p class="empty">${t}</p>`;

/* ───────── الصفحة الرئيسية ───────── */
function attention() {
  const out = [];
  S.board.items.forEach(h => {
    if (h.status !== 'active') return;
    if ((h.invalidates || []).some(x => x.met)) out.push(['bad', `تحقق شرط إبطال في فرضية «${h.title || 'بلا عنوان'}»`, 'openHyp', h.id, 'راجعها']);
    const d = daysTo(h.review);
    if (d != null && d <= 0) out.push(['warn', `حان موعد مراجعة فرضية «${h.title || 'بلا عنوان'}»`, 'openHyp', h.id, 'افتحها']);
    const weak = (h.concepts || []).map(id => IDX[id]).filter(m => m && statusOf(m.id) !== 'mastered');
    if (weak.length) out.push(['warn', `فرضية «${h.title || 'بلا عنوان'}» تستند إلى مفهوم لم تتقنه: ${weak[0].title}`, 'startLesson', weak[0].id, 'ادرسه']);
  });
  S.core.teaching.filter(t => !t.done && t.due).forEach(t => {
    const d = daysTo(t.due);
    if (d <= 14) out.push([d < 0 ? 'bad' : 'warn', `مسؤولية تعليمية ${d < 0 ? 'فات موعدها' : d === 0 ? 'اليوم' : `خلال ${d} يوم`}: ${t.title}`, 'go', 'profile', 'التفاصيل']);
  });
  upcomingEvents(7).forEach(e => out.push(['info', `${e.d === 0 ? 'اليوم' : `بعد ${e.d} يوم`}: ${e.row.event || 'حدث بلا اسم'}`, 'openTpl', 'event-calendar', 'التقويم']));
  allModules().filter(m => statusOf(m.id) === 'review').slice(0, 3).forEach(m => out.push(['warn', `وحدة غير متقنة: ${m.title}`, 'startLesson', m.id, 'راجعها']));
  S.log.items.filter(i => i.status !== 'resolved' && Number(i.priority) === 3).slice(0, 3).forEach(i => out.push(['info', `${LOGTYPE[i.type]} بأولوية عالية: ${i.text}`, 'go', 'gaps', 'السجل']));
  return out.slice(0, 8);
}
function upcomingEvents(days) {
  const st = S.work.sheets['event-calendar']; if (!st) return [];
  const sh = st.items.find(i => i.id === st.active) || st.items[0]; if (!sh) return [];
  return sh.rows.map(row => ({ row, d: daysTo(row.date) })).filter(e => e.d != null && e.d >= 0 && e.d <= days).sort((a, b) => a.d - b.d);
}
function reasonChips(r, max = 9) {
  return `<ul class="reasons">${r.parts.slice(0, max).map(p => `<li><span>${esc(p[0])}</span><b class="${p[1] < 0 ? 'neg' : ''}" dir="ltr">${p[1] > 0 ? '+' : ''}${p[1]}</b></li>`).join('')}</ul>`;
}
function vHome() {
  const lvl = curLevel();
  if (!lvl) return head('لا مستويات في المنهج', 'أضف مستوى من صفحة المنهج، أو تراجع عن الحذف.', '<a class="btn primary" href="#curriculum">افتح المنهج</a>');
  const st = stats(lvl), r = rank(), top = r[0];
  const open = S.log.items.filter(i => i.status !== 'resolved');
  const gaps = open.filter(i => i.type === 'gap').length, qs = open.length - gaps;
  const act = S.board.items.filter(h => h.status === 'active').length;
  const att = attention();
  const tile = (n, label, view, tone = '') => `<a class="tile ${tone}" href="#${view}"><b>${n}</b><span>${label}</span></a>`;
  return `
  <section class="hero">
    <div class="hero-main">
      <p class="eyebrow" dir="ltr">Level → Chapter → Module → Knowledge</p>
      <h1><span class="lvl" dir="ltr">Level ${esc(lvl.id.slice(1))}</span><span class="lvl-name">${esc(lvl.title)}</span></h1>
      <p class="lead">${esc(lvl.summary || '')}</p>
      ${strip(lvl, true)}
      <p class="legend"><span><i class="seg st-mastered"></i>متقنة ${st.mastered}</span><span><i class="seg st-review"></i>غير متقنة ${st.review}</span><span><i class="seg st-progress"></i>قيد الدراسة ${st.progress}</span><span><i class="seg st-new"></i>لم تبدأ ${st.new}</span></p>
    </div>
    <aside class="next">
      <h2>الدرس التالي</h2>
      ${top ? `<p class="next-title">${esc(top.m.title)}</p>${code(top.m.id)}
        <p class="muted">اختير لأن:</p>${reasonChips(top, 4)}
        <div class="row"><button class="btn primary" data-act="startLesson" data-id="${top.m.id}">ابدأ الدرس</button><a class="btn" href="#lesson">بدائل أخرى</a></div>`
      : `<p>${st.total ? 'أتممت كل وحدات هذا المستوى ولا فجوات مفتوحة فيه.' : 'هذا المستوى بلا وحدات بعد.'}</p><a class="btn" href="#curriculum">افتح المنهج</a>`}
    </aside>
  </section>
  <section class="tiles">
    ${tile(`${st.mastered}<small>/${st.total}</small>`, 'وحدات متقنة في المستوى', 'curriculum')}
    ${tile(st.review, 'مكتملة وغير متقنة', 'curriculum', st.review ? 'warn' : '')}
    ${tile(gaps, 'فجوات معرفية مفتوحة', 'gaps', gaps ? 'warn' : '')}
    ${tile(qs, 'أسئلة غير محسومة', 'gaps')}
    ${tile(act, 'فرضيات نشطة', 'board')}
  </section>
  <div class="cols">
    <section class="card">
      <h2>فصول المستوى الحالي</h2>
      ${lvl.children.length ? `<ul class="chapters">${lvl.children.map(c => { const s = stats(c); return `<li><button class="link" data-act="pick" data-id="${c.id}" data-go="1">${esc(c.title)}</button> ${provChip(c)}<span class="muted num">${s.mastered}/${s.total}</span>${strip(c)}</li>`; }).join('')}</ul>` : empty('لا فصول في هذا المستوى. أضفها من صفحة المنهج.')}
    </section>
    <section class="card">
      <h2>يحتاج انتباهك</h2>
      ${att.length ? `<ul class="att">${att.map(a => `<li class="${a[0]}"><span>${esc(a[1])}</span><button class="btn sm" data-act="${a[2]}" data-id="${esc(a[3])}">${a[4]}</button></li>`).join('')}</ul>` : empty('لا شيء عاجل الآن.')}
    </section>
  </div>
  <section class="card">
    <h2>آخر الجلسات</h2>
    ${S.log.sessions.length ? `<div class="scroll"><table class="tbl plain"><thead><tr><th>التاريخ</th><th>الوحدة</th><th>النتيجة</th><th>الحكم</th></tr></thead><tbody>${S.log.sessions.slice(0, 6).map(s => `<tr><td class="num">${esc(s.date)}</td><td>${esc(IDX[s.module] ? IDX[s.module].title : s.module)}</td><td class="num">${s.pct}%</td><td>${pill(s.outcome)}</td></tr>`).join('')}</tbody></table></div>` : empty('لم تسجّل أي جلسة بعد. ابدأ الدرس التالي لتظهر هنا.')}
  </section>`;
}

/* ───────── المنهج ───────── */
function nodeEditor(n) {
  return `<div class="neditor">
    ${field('العنوان', `<input id="ttl-${n.id}" data-bind="S.core.custom.titles.${n.id}" data-echo="${n.id}" value="${esc(n.title)}">`)}
    ${n.options ? field('عناوين مقترحة', `<select id="opt-${n.id}" data-on="pickTitle" data-id="${n.id}"><option value="">اختر مقترحاً…</option>${n.options.map(o => `<option>${esc(o)}</option>`).join('')}</select>`) : ''}
    <label class="check"><input type="checkbox" id="prov-${n.id}" data-on="toggleProv" data-id="${n.id}"${n.prov ? ' checked' : ''}> عنصر مؤقت لم يُحسم بعد</label>
    <div class="row">${n.depth === 0 && S.core.currentLevel !== n.id ? `<button class="btn sm" data-act="setLevel" data-id="${n.id}">اجعله مستواي الحالي</button>` : ''}<button class="btn sm danger" data-act="delNode" data-id="${n.id}">حذف ${KIND[n.depth]}</button></div>
  </div>`;
}
function mcol(depth, nodes, selId, parentId) {
  return `<section class="mcol">
    <h2>${KIND[depth]}<span class="code" dir="ltr">${KIND_EN[depth]}</span></h2>
    ${nodes.length ? `<ul>${nodes.map(n => { const s = stats(n); return `<li class="${n.id === selId ? 'on' : ''}">
      <div class="mrow"><button class="mitem" data-act="pick" data-id="${n.id}"${n.id === selId ? ' aria-current="true"' : ''}>
        <span class="mtop">${code(n.id)}${provChip(n)}${depth === 0 && S.core.currentLevel === n.id ? '<span class="chip info">الحالي</span>' : ''}${depth === 2 ? pill(statusOf(n.id)) : ''}</span>
        <span class="mtitle" data-title="${n.id}">${esc(n.title)}</span>
        ${depth < 2 ? `<span class="msub">${strip(n)}<span class="muted num">${s.mastered}/${s.total}</span></span>` : ''}
      </button><button class="btn sm ghost" data-act="editNode" data-id="${n.id}">${UI.edit === n.id ? 'إغلاق' : 'تعديل'}</button></div>
      ${UI.edit === n.id ? nodeEditor(n) : ''}</li>`; }).join('')}</ul>` : empty(depth === 0 ? 'لا مستويات.' : `لا ${depth === 1 ? 'فصول' : 'وحدات'} هنا بعد.`)}
    ${parentId ? `<form class="add" data-submit="addNode" data-parent="${parentId}" data-depth="${depth}"><input name="t" id="add-${parentId}" placeholder="${depth === 0 ? 'عنوان مستوى جديد' : depth === 1 ? 'عنوان فصل جديد' : 'عنوان وحدة جديدة'}" aria-label="إضافة ${KIND[depth]}"><button class="btn sm">إضافة</button></form>` : ''}
  </section>`;
}
function moduleDetail(m) {
  const p = modR(m.id), gaps = gapsFor(m.id), hyps = hypsFor(m.id), teach = teachFor(m.id);
  const pre = (m.prereq || []).map(id => IDX[id]).filter(Boolean);
  const userPrio = !(p.practical === undefined || p.practical === '');
  return `<section class="card detail">
    <div class="detail-head">
      <div>${code(m.id)} ${pill(statusOf(m.id))} ${provChip(m)}
        <h2 data-title="${m.id}">${esc(m.title)}</h2>
        ${m.en ? `<p class="en" dir="ltr">${esc(m.en)}</p>` : ''}
        ${m.summary ? `<p class="lead">${esc(m.summary)}</p>` : ''}
      </div>
      <button class="btn primary" data-act="startLesson" data-id="${m.id}">ابدأ درساً عملياً</button>
    </div>
    <div class="fields">
      ${field('حالة الوحدة', sel(`S.core.mods.${m.id}.status`, STATUS_OPTS.map(o => [o[0], o[1]]), { label: 'حالة الوحدة' }))}
      ${field(`الأولوية العملية${userPrio ? '' : ' (مقترحة)'}`, `<select id="pr-${m.id}" data-bind="S.core.mods.${m.id}.practical" data-re data-num aria-label="الأولوية العملية">${PRIO_OPTS.map(o => `<option value="${o[0]}"${practicalOf(m) === o[0] ? ' selected' : ''}>${o[1]}</option>`).join('')}</select>`)}
      ${p.last ? field('آخر جلسة', `<output class="num">${esc(p.last)} · ${p.score ?? '—'}%</output>`) : ''}
    </div>
    <h3>نقاط المعرفة <span class="code" dir="ltr">Knowledge</span></h3>
    ${m.children.length ? `<ul class="klist">${m.children.map(k => { const v = kState(m.id, k.id); return `<li class="${v || ''}">
      <div class="krow">${code(k.id.slice(m.id.length + 1))}<span class="ktext" data-title="${k.id}">${esc(k.title)}</span>
      <span class="kbtns"><button class="btn sm ${v === 'ok' ? 'on-good' : ''}" data-act="kset" data-m="${m.id}" data-k="${k.id}" data-v="ok" aria-pressed="${v === 'ok'}">أتقنتها</button><button class="btn sm ${v === 'weak' ? 'on-warn' : ''}" data-act="kset" data-m="${m.id}" data-k="${k.id}" data-v="weak" aria-pressed="${v === 'weak'}">لم أتقنها</button><button class="btn sm ghost" data-act="editNode" data-id="${k.id}">${UI.edit === k.id ? 'إغلاق' : 'تعديل'}</button></span></div>
      ${UI.edit === k.id ? nodeEditor(k) : ''}</li>`; }).join('')}</ul>` : empty('لا نقاط معرفة في هذه الوحدة بعد.')}
    <form class="add" data-submit="addNode" data-parent="${m.id}" data-depth="3"><input name="t" id="add-${m.id}" placeholder="نقطة معرفة جديدة" aria-label="إضافة نقطة معرفة"><button class="btn sm">إضافة</button></form>
    <div class="cols tight">
      <div>
        <h3>ما يرتبط بها</h3>
        <ul class="links">
          ${pre.length ? `<li><b>تسبقها:</b> ${pre.map(x => `<button class="link" data-act="pick" data-id="${x.id}">${esc(x.title)}</button> ${pill(statusOf(x.id))}`).join('، ')}</li>` : ''}
          <li><b>فجوات وأسئلة مفتوحة:</b> ${gaps.length ? gaps.map(g => esc(g.text)).join(' · ') : 'لا شيء'} <button class="link" data-act="logFor" data-id="${m.id}">سجّل واحدة</button></li>
          <li><b>فرضيات تستند إليها:</b> ${hyps.length ? hyps.map(h => `<button class="link" data-act="openHyp" data-id="${h.id}">${esc(h.title || 'بلا عنوان')}</button>`).join('، ') : 'لا شيء'}</li>
          <li><b>مسؤوليات تعليمية:</b> ${teach.length ? teach.map(t => esc(t.title)).join('، ') : 'لا شيء'}</li>
          ${(m.tools || []).length ? `<li><b>أدوات التطبيق:</b> ${m.tools.map(toolLink).join('، ')}</li>` : ''}
        </ul>
      </div>
      <div><h3>ملاحظاتي على الوحدة</h3>${area(`S.core.mods.${m.id}.note`, { rows: 5, ph: 'ملخصك، أمثلتك، ما تريد تذكّره عند التدريس' })}</div>
    </div>
  </section>`;
}
function toolLink(t) {
  if (t === 'checklists') return '<button class="link" data-act="openTpl" data-id="checklists">قوائم الفحص</button>';
  const d = TPL.sheets.find(x => x.id === t);
  return d ? `<button class="link" data-act="openTpl" data-id="${t}">${esc(d.title)}</button>` : '';
}
function vCurr() {
  const L = (IDX[UI.sel.level] && IDX[UI.sel.level].depth === 0 && IDX[UI.sel.level]) || curLevel();
  const C = L && (L.children.find(c => c.id === UI.sel.chapter) || L.children[0]);
  const M = C && (C.children.find(m => m.id === UI.sel.module) || C.children[0]);
  const prov = Object.values(IDX).filter(n => n.prov && n.depth < 3).length;
  return head('المنهج', `أربع طبقات ثابتة: المستوى، ثم الفصل، ثم الوحدة، ثم نقطة المعرفة. ${prov ? `فيه ${prov} عنصراً مؤقتاً بانتظار قرارك.` : 'كل العناصر معتمدة.'}`) + `
  <div class="miller">
    ${mcol(0, T, L && L.id, 'root')}
    ${L ? mcol(1, L.children, C && C.id, L.id) : ''}
    ${C ? mcol(2, C.children, M && M.id, C.id) : '<section class="mcol"><h2>الوحدة<span class="code" dir="ltr">Module</span></h2>' + empty('اختر فصلاً أو أضف واحداً.') + '</section>'}
  </div>
  ${M ? moduleDetail(M) : `<section class="card">${empty(L && L.prov && !L.children.length ? 'هذا المستوى محجوز ولم تُحسم بنيته. اضغط «تعديل» لاختيار عنوانه، ثم أضف فصوله.' : 'اختر وحدة لعرض تفاصيلها.')}</section>`}`;
}

/* ───────── الدرس العملي ───────── */
const STEPS = ['الشرح', 'الاختبار', 'التطبيق', 'التقييم'];
const OPEN_RATE = ['لم أستطع', 'جزئياً', 'بثقة'];
const OUTCOME_TXT = { mastered: 'متمكّن', review: 'مكتملة وتحتاج مراجعة', progress: 'غير متقنة بعد' };
function assess(L) {
  const m = IDX[L.id], qs = m.quiz || [];
  const correct = qs.filter((q, i) => L.ans[i] === q.a).length;
  const comps = [];
  if (qs.length) comps.push(['أسئلة الاختيار', correct / qs.length, 50, `${correct} من ${qs.length}`]);
  comps.push(['السؤال المفتوح، بتقييمك', L.openRate == null ? 0 : L.openRate / 2, 20, L.openRate == null ? 'لم يُقيَّم' : OPEN_RATE[L.openRate]]);
  comps.push(['ثقتك في الوحدة', (Number(L.conf) - 1) / 4, 20, `${L.conf} من 5`]);
  const app = (L.appM.trim() ? 1 : 0) + (L.appG.trim() ? 1 : 0);
  comps.push(['التطبيق على الأسواق والذهب', app / 2, 10, `${app} من 2`]);
  const tw = comps.reduce((a, c) => a + c[2], 0);
  const pct = Math.round(100 * comps.reduce((a, c) => a + c[1] * c[2], 0) / tw);
  const weak = m.children.filter(k => kState(m.id, k.id) === 'weak');
  const TH = { ...TH_DEFAULT, ...S.core.thresholds };
  const outcome = pct >= Number(TH.mastered) && !weak.length ? 'mastered' : pct >= Number(TH.pass) ? 'review' : 'progress';
  const wrong = qs.map((q, i) => ({ q, i })).filter(x => L.ans[x.i] != null && L.ans[x.i] !== x.q.a);
  return { comps, pct, weak, wrong, outcome, unanswered: qs.filter((q, i) => L.ans[i] == null).length, TH };
}
function vLessonPick() {
  const r = rank(), lvl = curLevel();
  return head('الدرس العملي', `يُختار الموضوع من وحدات ${esc(lvl ? lvl.title : '')} بحسب حالتها، فجواتك المفتوحة، أولوياتك العملية، ومسؤولياتك في التعليم.`,
    '<a class="btn" href="#profile">عدّل أوزان الاختيار</a>') + (r.length ? `
  <section class="card pickA">
    <p class="eyebrow">المقترح الآن</p>
    <div class="detail-head"><div>${code(r[0].m.id)} ${pill(statusOf(r[0].m.id))}<h2>${esc(r[0].m.title)}</h2><p class="lead">${esc(r[0].m.summary || '')}</p></div>
    <button class="btn primary" data-act="startLesson" data-id="${r[0].m.id}">ابدأ الدرس</button></div>
    <h3>لماذا هذا الدرس</h3>${reasonChips(r[0])}
    <p class="muted">المجموع <b class="num">${r[0].score}</b>. الأوزان مؤقتة، وتعدّلها من «الملف والبيانات».</p>
  </section>
  <section class="card">
    <h2>بدائل مرتبة</h2>
    ${r.length > 1 ? `<ul class="alts">${r.slice(1).map(x => `<li><div><b>${esc(x.m.title)}</b> ${code(x.m.id)} ${pill(statusOf(x.m.id))}<p class="muted">${x.parts.filter(p => p[1]).slice(0, 3).map(p => esc(p[0])).join(' · ')}</p></div><span class="score num">${x.score}</span><button class="btn sm" data-act="startLesson" data-id="${x.m.id}">ابدأ</button></li>`).join('')}</ul>` : empty('لا بدائل أخرى في هذا المستوى.')}
  </section>` : `<section class="card">${empty(lvl && modulesOf(lvl).length ? 'أتممت كل وحدات المستوى الحالي بلا فجوات مفتوحة. انتقل إلى المستوى التالي من «الملف والبيانات»، أو أضف وحدات جديدة من المنهج.' : 'المستوى الحالي بلا وحدات. أضف فصولاً ووحدات من صفحة المنهج، أو عُد إلى مستوى فيه محتوى.')}<div class="row"><a class="btn" href="#curriculum">المنهج</a><a class="btn" href="#profile">الملف والبيانات</a></div></section>`);
}
function vLesson() {
  const L = UI.lesson;
  if (!L || !IDX[L.id] || IDX[L.id].depth !== 2) return vLessonPick();
  const m = IDX[L.id], base = `S.core.mods.${m.id}`;
  const stepper = `<ol class="stepper">${STEPS.map((s, i) => `<li><button class="${i === L.step ? 'on' : ''}${i < L.step ? ' done' : ''}" data-act="lstep" data-n="${i}"${i === L.step ? ' aria-current="step"' : ''}><b class="num">${i + 1}</b>${s}</button></li>`).join('')}</ol>`;
  const nav = (prev, next, nextLabel) => `<div class="row lnav">${prev != null ? `<button class="btn" data-act="lstep" data-n="${prev}">السابق</button>` : '<span></span>'}${next != null ? `<button class="btn primary" data-act="lstep" data-n="${next}">${nextLabel}</button>` : ''}</div>`;
  let body = '';
  if (L.step === 0) {
    body = `<section class="card prose">
      ${m.summary ? `<p class="lead">${esc(m.summary)}</p>` : ''}
      ${(m.explain || []).length ? m.explain.map(e => `<h3>${esc(e[0])}</h3><p>${esc(e[1])}</p>`).join('') : `<p class="muted">لا شرح جاهز لهذه الوحدة لأنها من إضافتك أو لم يُكتب محتواها بعد. اكتب شرحك هنا ليصير مرجع الدرس.</p>${area(base + '.note', { rows: 8, ph: 'الفكرة الأساسية، كيف تعمل، الخطأ الشائع' })}`}
      ${m.teach ? `<aside class="teach"><b>عند تدريسها</b><p>${esc(m.teach)}</p></aside>` : ''}
    </section>
    <section class="card">
      <h2>نقاط المعرفة</h2><p class="muted">علّم كل نقطة. ما تعلّمه «لم أتقنها» يدخل في التقييم ويُقترح كفجوة.</p>
      ${m.children.length ? `<ul class="klist">${m.children.map(k => { const v = kState(m.id, k.id); return `<li class="${v || ''}"><div class="krow">${code(k.id.slice(m.id.length + 1))}<span class="ktext">${esc(k.title)}</span><span class="kbtns"><button class="btn sm ${v === 'ok' ? 'on-good' : ''}" data-act="kset" data-m="${m.id}" data-k="${k.id}" data-v="ok" aria-pressed="${v === 'ok'}">أتقنتها</button><button class="btn sm ${v === 'weak' ? 'on-warn' : ''}" data-act="kset" data-m="${m.id}" data-k="${k.id}" data-v="weak" aria-pressed="${v === 'weak'}">لم أتقنها</button></span></div></li>`; }).join('')}</ul>` : empty('لا نقاط معرفة. أضفها من صفحة المنهج.')}
    </section>${nav(null, 1, 'إلى الاختبار')}`;
  } else if (L.step === 1) {
    const qs = m.quiz || [];
    body = `${qs.map((q, i) => { const a = L.ans[i]; return `<section class="card quiz"><h3><span class="num">${i + 1}.</span> ${esc(q.q)}</h3>
      <div class="opts">${q.o.map((o, j) => `<button class="opt${a != null ? (j === q.a ? ' right' : j === a ? ' wrong' : '') : ''}" data-act="answer" data-q="${i}" data-o="${j}"${a != null ? ' disabled' : ''}>${esc(o)}${a != null && j === q.a ? '<span class="tag">الصحيحة</span>' : ''}${a != null && j === a && j !== q.a ? '<span class="tag">إجابتك</span>' : ''}</button>`).join('')}</div>
      ${a != null ? `<p class="why ${a === q.a ? 'ok' : 'no'}"><b>${a === q.a ? 'صحيح.' : 'غير صحيح.'}</b> ${esc(q.why)}</p>` : ''}</section>`; }).join('')}
    <section class="card quiz"><h3>${qs.length ? 'سؤال مفتوح' : 'اختبر نفسك'}</h3>
      <p>${esc(m.open || 'لا أسئلة جاهزة لهذه الوحدة. اكتب سؤالاً يختبر فهمك لها وأجب عنه.')}</p>
      ${area('UI.lesson.open', { rows: 4, ph: 'اكتب إجابتك بكلماتك' })}
      <p class="muted">كيف كانت إجابتك؟</p>
      <div class="row">${OPEN_RATE.map((t, i) => `<button class="btn sm ${L.openRate === i ? 'on-pick' : ''}" data-act="openRate" data-n="${i}" aria-pressed="${L.openRate === i}">${t}</button>`).join('')}</div>
    </section>${nav(0, 2, 'إلى التطبيق')}`;
  } else if (L.step === 2) {
    const ap = m.apply || { markets: 'أين يظهر هذا المفهوم في الأسواق العالمية هذا الأسبوع؟', gold: 'كيف يغيّر هذا المفهوم قراءتك للذهب الآن؟' };
    body = `<section class="card apply"><h2>الأسواق العالمية</h2><p>${esc(ap.markets)}</p>${area('UI.lesson.appM', { rows: 4, ph: 'ملاحظتك مع الدليل والتاريخ' })}</section>
    <section class="card apply gold"><h2>الذهب</h2><p>${esc(ap.gold)}</p>${area('UI.lesson.appG', { rows: 4, ph: 'قراءتك للذهب في ضوء هذه الوحدة' })}
      <div class="row"><button class="btn sm" data-act="hypFromLesson">حوّل قراءة الذهب إلى فرضية في لوحة المتابعة</button></div></section>
    ${ap.task || (m.tools || []).length ? `<section class="card"><h2>مهمة في مساحات العمل</h2>${ap.task ? `<p>${esc(ap.task)}</p>` : ''}<p>${(m.tools || []).map(toolLink).join(' ، ')}</p><p class="muted">ما تكتبه هناك يُحفظ، والدرس يبقى مفتوحاً حتى تعود.</p></section>` : ''}
    ${nav(1, 3, 'إلى التقييم')}`;
  } else {
    const a = assess(L), out = L.outcome || a.outcome, r = rank(), nxt = r[0];
    body = `<section class="card">
      <div class="verdict v-${out}"><b class="num">${a.pct}%</b><div><p class="eyebrow">الحكم ${L.outcome && L.outcome !== a.outcome ? 'بتعديلك' : 'المقترح'}</p><h2>${OUTCOME_TXT[out]}</h2>
        <p class="muted">العتبات المؤقتة: ${a.TH.mastered}% للتمكّن دون نقاط غير متقنة، و${a.TH.pass}% للاكتمال.</p></div></div>
      ${a.unanswered ? `<p class="why no">بقي ${a.unanswered} سؤالاً بلا إجابة، وتُحسب خطأً.</p>` : ''}
      <table class="tbl plain"><thead><tr><th>المكوّن</th><th>نتيجتك</th><th>الوزن</th><th></th></tr></thead><tbody>
      ${a.comps.map(c => `<tr><td>${c[0]}</td><td>${esc(c[3])}</td><td class="num">${c[2]}%</td><td class="barcell"><span class="bar"><i style="inline-size:${Math.round(c[1] * 100)}%"></i></span></td></tr>`).join('')}</tbody></table>
      <div class="fields">
        ${field('ثقتك في الوحدة من 1 إلى 5', `<input id="f-conf" type="range" min="1" max="5" step="1" data-bind="UI.lesson.conf" data-re data-num value="${L.conf}">`)}
        ${field('عدّل الحكم إن رأيت غير ذلك', `<select id="f-outcome" data-bind="UI.lesson.outcome" data-re><option value="">كما هو مقترح</option>${Object.entries(OUTCOME_TXT).map(([v, t]) => `<option value="${v}"${L.outcome === v ? ' selected' : ''}>${t}</option>`).join('')}</select>`)}
      </div>
    </section>
    ${a.wrong.length || a.weak.length ? `<section class="card"><h2>فجوات مقترحة للتسجيل</h2><p class="muted">أزل العلامة عمّا لا تريد تسجيله.</p><ul class="checks">
      ${a.wrong.map(x => `<li><label class="check"><input type="checkbox" id="gs-q${x.i}" data-bind="UI.lesson.gapSel.q${x.i}"${L.gapSel['q' + x.i] === false ? '' : ' checked'}${L.saved ? ' disabled' : ''}> سؤال أخطأت فيه: ${esc(x.q.q)}</label></li>`).join('')}
      ${a.weak.map(k => `<li><label class="check"><input type="checkbox" id="gs-${k.id}" data-bind="UI.lesson.gapSel.${k.id}"${L.gapSel[k.id] === false ? '' : ' checked'}${L.saved ? ' disabled' : ''}> نقطة لم تتقنها: ${esc(k.title)}</label></li>`).join('')}</ul></section>` : ''}
    ${L.saved ? `<section class="card nextstep"><p class="eyebrow">الخطوة التالية</p>
      ${nxt ? (nxt.m.id === m.id ? `<h2>أعد هذه الوحدة بعد سدّ فجواتها</h2><p>ما زالت «${esc(m.title)}» الأعلى أولوية. راجع ما سجّلته في السجل ثم أعد الدرس.</p>` : `<h2>${esc(nxt.m.title)}</h2>${code(nxt.m.id)}${reasonChips(nxt, 3)}`) : '<h2>أتممت المستوى الحالي</h2><p>لا وحدات متبقية ولا فجوات مفتوحة. حدّد مستواك التالي من «الملف والبيانات».</p>'}
      <div class="row">${nxt ? `<button class="btn primary" data-act="startLesson" data-id="${nxt.m.id}">${nxt.m.id === m.id ? 'أعد الدرس' : 'ابدأ الدرس التالي'}</button>` : ''}<a class="btn" href="#gaps">سجل الفجوات</a><button class="btn" data-act="endLesson">أغلق الدرس</button></div></section>`
    : `<div class="row lnav"><button class="btn" data-act="lstep" data-n="2">السابق</button><button class="btn primary" data-act="saveLesson">احفظ التقييم وحدّث حالة الوحدة</button></div>`}`;
  }
  return head(esc(m.title), `${code(m.id)} ${m.en ? `<span class="en" dir="ltr">${esc(m.en)}</span>` : ''}`, '<button class="btn" data-act="endLesson">اختر درساً آخر</button>') + stepper + body;
}

/* ───────── سجل الفجوات والأسئلة ───────── */
function vLog() {
  const f = UI.logFilter, all = S.log.items.map((it, i) => ({ it, i }));
  const list = all.filter(x => (f.type === 'all' || x.it.type === f.type) && (f.status === 'all' || (f.status === 'open' ? x.it.status !== 'resolved' : x.it.status === 'resolved')))
    .sort((a, b) => (Number(b.it.priority) || 0) - (Number(a.it.priority) || 0));
  const fb = (k, v, t) => `<button class="btn sm ${f[k] === v ? 'on-pick' : ''}" data-act="logFilter" data-k="${k}" data-v="${v}" aria-pressed="${f[k] === v}">${t}</button>`;
  const mo = modOpts();
  return head('الفجوات والأسئلة غير المحسومة', 'الفجوة شيء لم تتقنه بعد. السؤال غير المحسوم شيء لا جواب نهائياً له عندك، ويبقى مفتوحاً حتى تحسمه بدليل.') + `
  <section class="card">
    <h2>تسجيل جديد</h2>
    <form class="logform" data-submit="addLog">
      ${field('النوع', `<select name="type" id="nl-type"><option value="gap">${LOGTYPE.gap}</option><option value="question">${LOGTYPE.question}</option></select>`)}
      ${field('النص', `<input name="text" id="nl-text" required placeholder="ما الذي لم تتقنه، أو ما السؤال المفتوح؟">`, 'grow')}
      ${field('الوحدة المرتبطة', `<select name="module" id="nl-module"><option value="">بلا وحدة</option>${mo.map(o => `<option value="${o[0]}"${UI.logModule === o[0] ? ' selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`)}
      ${field('الأولوية', `<select name="priority" id="nl-prio">${[1, 2, 3].map(i => `<option value="${i}"${i === 2 ? ' selected' : ''}>${PRIO[i]}</option>`).join('')}</select>`)}
      <button class="btn primary">سجّل</button>
    </form>
  </section>
  <div class="row filters">${fb('type', 'all', 'الكل')}${fb('type', 'gap', 'الفجوات')}${fb('type', 'question', 'الأسئلة')}<span class="sep"></span>${fb('status', 'open', 'المفتوحة')}${fb('status', 'done', 'المحسومة')}${fb('status', 'all', 'كل الحالات')}<span class="muted num">${list.length}</span></div>
  ${list.length ? `<ul class="logs">${list.map(({ it, i }) => { const b = `S.log.items.${i}`; return `<li class="card log ${it.type} ${it.status}">
    <div class="log-top"><span class="chip ${it.type === 'gap' ? 'warn' : 'info'}">${LOGTYPE[it.type]}</span>
      ${sel(b + '.status', LOGSTATUS[it.type], { label: 'الحالة' })}
      ${sel(b + '.priority', [1, 2, 3].map(n => [n, 'أولوية ' + PRIO[n]]), { label: 'الأولوية', num: 1 })}
      <span class="muted num">${esc(it.created || '')}</span>
      <button class="btn sm ghost danger" data-act="delLog" data-i="${i}">حذف</button></div>
    ${area(b + '.text', { rows: 2, label: 'النص' })}
    <div class="cols tight">
      ${field('الوحدة المرتبطة', sel(b + '.module', mo, { blank: true, label: 'الوحدة المرتبطة' }))}
      ${field(it.type === 'gap' ? 'ما الذي تحتاجه لسدّها' : 'موقفك المؤقت وما قد يحسمه', area(b + '.note', { rows: 2 }))}
    </div>
    ${it.status === 'resolved' ? field(it.type === 'gap' ? 'كيف سُدّت' : 'كيف حُسم، وبأي دليل', area(b + '.resolution', { rows: 2 })) : ''}
    ${it.module && IDX[it.module] ? `<div class="row"><button class="btn sm" data-act="startLesson" data-id="${it.module}">ادرس «${esc(IDX[it.module].title)}»</button></div>` : ''}
  </li>`; }).join('')}</ul>` : `<section class="card">${empty('لا عناصر بهذا التصنيف.')}</section>`}`;
}

/* ───────── مساحات العمل ───────── */
const activeIx = st => Math.max(0, st.items.findIndex(i => i.id === st.active));
const optLabel = (opts, v) => (opts.find(o => o[0] === v) || [])[1] || '';
const SUMMARY = {
  risk(sh) {
    const rs = sh.rows.map(r => ({ r, l: Number(r.like) || 0, i: Number(r.impact) || 0 })).filter(x => x.l && x.i);
    if (!rs.length) return '<p class="muted">أدخل الاحتمال والأثر لتظهر الأخطار على الشبكة.</p>';
    let grid = '<div class="heat" role="img" aria-label="شبكة الاحتمال والأثر"><span class="ax-y">الأثر</span>';
    for (let i = 5; i >= 1; i--) for (let l = 1; l <= 5; l++) {
      const here = rs.filter(x => x.l === l && x.i === i), sc = l * i;
      grid += `<div class="cell ${sc >= 15 ? 'hi' : sc >= 8 ? 'mid' : 'lo'}" title="احتمال ${l} × أثر ${i}">${here.length ? `<b>${here.length}</b>` : ''}</div>`;
    }
    grid += '<span class="ax-x">الاحتمال</span></div>';
    const top = rs.sort((a, b) => b.l * b.i - a.l * a.i).slice(0, 4);
    return `<div class="sum-flex">${grid}<ol class="toprisks">${top.map(x => `<li><b class="num">${x.l * x.i}</b>${esc(x.r.risk || 'خطر بلا اسم')}</li>`).join('')}</ol></div>`;
  },
  gold(sh) {
    const sign = { sup: 1, prs: -1 };
    const rs = sh.rows.filter(r => r.dir === 'sup' || r.dir === 'prs');
    const unk = sh.rows.filter(r => !r.dir || r.dir === 'unk').length;
    if (!rs.length) return `<p class="muted">حدّد أثر كل محرك لتظهر محصّلة القراءة. ${unk} محركاً غير محسوم.</p>`;
    const noW = rs.filter(r => !Number(r.weight)).length;
    const net = rs.reduce((a, r) => a + sign[r.dir] * (Number(r.weight) || 1), 0);
    return `<div class="sum-flex"><div class="net ${net > 0 ? 'pos' : net < 0 ? 'neg' : ''}"><b class="num" dir="ltr">${net > 0 ? '+' : ''}${net}</b><span>صافي المحركات: ${net > 0 ? 'داعم' : net < 0 ? 'ضاغط' : 'متوازن'}</span></div>
      <ul class="diverge"><li class="dleg"><span></span><span><em>ضاغط</em><em>داعم</em></span></li>${sh.rows.map(r => { const w = Number(r.weight) || 1, s = sign[r.dir] || 0; return `<li><span class="dl">${esc(r.driver || '—')}</span><span class="dtrack"><i class="${s > 0 ? 'pos' : s < 0 ? 'neg' : 'nil'}" style="inline-size:${s ? w * 10 : 0}%"></i></span></li>`; }).join('')}</ul></div>
      <p class="muted">${noW ? `${noW} محركاً بلا وزن، وحُسب كلٌّ منها بوزن 1. ` : ''}${unk ? `${unk} محركاً غير محسوم وخارج الحساب. ` : ''}الصافي يلخّص افتراضاتك الحالية ولا يتنبأ بالسعر.</p>`;
  },
  macro(sh) {
    const c = { sup: 0, prs: 0, neu: 0, unk: 0 };
    sh.rows.forEach(r => c[r.gold || 'unk']++);
    return `<p class="counts"><span class="chip pos">داعم للذهب ${c.sup}</span><span class="chip neg">ضاغط ${c.prs}</span><span class="chip neu">محايد ${c.neu}</span><span class="chip unk">غير محسوم ${c.unk}</span></p>`;
  },
  calendar(sh) {
    const up = sh.rows.map(r => ({ r, d: daysTo(r.date) })).filter(x => x.d != null && x.d >= 0).sort((a, b) => a.d - b.d);
    const undated = sh.rows.filter(r => !r.date).length;
    return `<p class="counts">${up.length ? `<span class="chip info">الأقرب: ${esc(up[0].r.event || 'حدث')} ${up[0].d === 0 ? 'اليوم' : `بعد ${up[0].d} يوم`}</span>` : ''}<span class="chip neu">قادمة ${up.length}</span>${undated ? `<span class="chip unk">بلا تاريخ ${undated}</span>` : ''}<button class="btn sm" data-act="sortRows" data-key="date">رتّب حسب التاريخ</button></p>`;
  },
};
function cell(col, path, row) {
  if (col.type === 'calc') { const s = (Number(row.like) || 0) * (Number(row.impact) || 0); return `<output class="score num ${s >= 15 ? 'hi' : s >= 8 ? 'mid' : s ? 'lo' : ''}" data-score>${s || '—'}</output>`; }
  if (col.type === 'select') return sel(path, col.options, { blank: true, label: col.label });
  if (col.type === 'area') return area(path, { rows: 2, label: col.label });
  if (col.type === 'num') return inp(path, { type: 'number', min: col.min, max: col.max, label: col.label, calc: 1 });
  if (col.type === 'date') return inp(path, { type: 'date', label: col.label });
  return inp(path, { label: col.label });
}
function vSheet(def) {
  const st = S.work.sheets[def.id], ix = activeIx(st), sh = st.items[ix], base = `S.work.sheets.${def.id}.items.${ix}`;
  return `<section class="card sheet">
    <p class="lead">${esc(def.purpose)}</p>
    <div class="sheetbar">
      ${field('النسخة', `<select id="inst-${def.id}" data-bind="S.work.sheets.${def.id}.active" data-re aria-label="النسخة">${st.items.map(i => `<option value="${i.id}"${i.id === sh.id ? ' selected' : ''}>${esc(i.name || 'بلا اسم')} · ${esc(i.date || '')}</option>`).join('')}</select>`)}
      ${field('اسم النسخة', inp(base + '.name'))}
      ${field('التاريخ', inp(base + '.date', { type: 'date' }))}
      <div class="row"><button class="btn sm" data-act="sheetNew" data-mode="dup">كرّر كنسخة جديدة</button><button class="btn sm" data-act="sheetNew" data-mode="blank">نسخة من القالب</button><button class="btn sm" data-act="sheetCopy">انسخ كنص</button>${st.items.length > 1 ? '<button class="btn sm ghost danger" data-act="sheetDel">احذف النسخة</button>' : ''}</div>
    </div>
    ${def.fields.length ? `<div class="fields wide">${def.fields.map(f => field(f.label, f.type === 'select' ? sel(`${base}.fields.${f.key}`, f.options, { blank: true, label: f.label }) : area(`${base}.fields.${f.key}`, { rows: 3 }), f.type === 'area' ? 'grow' : '')).join('')}</div>` : ''}
    <div id="sheet-summary" class="summary">${def.summary ? SUMMARY[def.summary](sh) : ''}</div>
    <div class="scroll"><table class="tbl"><thead><tr>${def.cols.map(c => `<th style="min-inline-size:${c.w}px">${esc(c.label)}</th>`).join('')}<th></th></tr></thead>
      <tbody>${sh.rows.map((row, r) => `<tr${def.id === 'event-calendar' && daysTo(row.date) != null && daysTo(row.date) >= 0 && daysTo(row.date) <= 7 ? ' class="soon"' : ''}>${def.cols.map(c => `<td>${cell(c, `${base}.rows.${r}.${c.key}`, row)}</td>`).join('')}<td><button class="btn sm ghost danger" data-act="rowDel" data-r="${r}" aria-label="حذف الصف">حذف</button></td></tr>`).join('')}</tbody></table></div>
    <div class="row"><button class="btn sm" data-act="rowAdd">أضف ${def.rowLabel}</button></div>
  </section>`;
}
function vChecklists() {
  return `<div class="cols checklists">${S.work.checklists.map((c, ci) => { const done = c.items.filter(i => i.done).length; return `<section class="card">
    <div class="cl-head">${inp(`S.work.checklists.${ci}.title`, { cls: 'title-inp', label: 'عنوان القائمة' })}<span class="muted num">${done}/${c.items.length}</span></div>
    <ul class="checks">${c.items.map((it, ii) => `<li class="${it.done ? 'done' : ''}"><label class="check"><input type="checkbox" id="ck-${it.id}" data-bind="S.work.checklists.${ci}.items.${ii}.done" data-re${it.done ? ' checked' : ''}><span>${esc(it.text)}</span></label><button class="btn sm ghost danger" data-act="ckDel" data-c="${ci}" data-i="${ii}" aria-label="حذف البند">حذف</button></li>`).join('')}</ul>
    <form class="add" data-submit="ckAdd" data-c="${ci}"><input name="t" id="ckadd-${c.id}" placeholder="بند جديد" aria-label="بند جديد"><button class="btn sm">إضافة</button></form>
    <div class="row"><button class="btn sm" data-act="ckReset" data-c="${ci}">أعد التعليم من البداية</button><button class="btn sm ghost danger" data-act="clDel" data-c="${ci}">احذف القائمة</button></div>
  </section>`; }).join('')}</div>
  <form class="add wide" data-submit="clAdd"><input name="t" id="cladd" placeholder="عنوان قائمة فحص جديدة" aria-label="قائمة فحص جديدة"><button class="btn">أضف قائمة</button></form>`;
}
function vWork() {
  const tabs = [...TPL.sheets.map(d => [d.id, d.title]), ['checklists', 'قوائم فحص التحليل']];
  if (!tabs.some(t => t[0] === UI.tpl)) UI.tpl = tabs[0][0];
  const def = TPL.sheets.find(d => d.id === UI.tpl);
  return head('مساحات العمل', 'قوالب تعيد استخدامها: كل قالب يحتفظ بنسخ مؤرخة، والقالب الأصلي يبقى نقطة البداية.') + `
  <nav class="tabs" aria-label="القوالب">${tabs.map(t => `<button class="${t[0] === UI.tpl ? 'on' : ''}" data-act="openTpl" data-id="${t[0]}"${t[0] === UI.tpl ? ' aria-current="true"' : ''}>${t[1]}</button>`).join('')}</nav>
  ${def ? vSheet(def) : vChecklists()}`;
}

/* ───────── لوحة المتابعة ───────── */
function hypEditor(h, i) {
  const b = `S.board.items.${i}`, mo = modOpts().filter(o => !(h.concepts || []).includes(o[0]));
  const list = (key, label, hint) => `<div><h3>${label}</h3><p class="muted">${hint}</p><ul class="conds">${(h[key] || []).map((c, j) => `<li class="${c.met ? 'met' : ''}"><label class="check"><input type="checkbox" id="${key}-${h.id}-${j}" data-bind="${b}.${key}.${j}.met" data-re${c.met ? ' checked' : ''}><span class="sr">تحقق</span></label>${inp(`${b}.${key}.${j}.text`, { ph: 'شرط محدد يمكن التحقق منه' })}<button class="btn sm ghost danger" data-act="hypDel" data-i="${i}" data-key="${key}" data-j="${j}">حذف</button></li>`).join('')}</ul><button class="btn sm" data-act="hypAdd" data-i="${i}" data-key="${key}">أضف شرطاً</button></div>`;
  const ev = { for: 0, against: 0, neutral: 0 }; (h.evidence || []).forEach(e => ev[e.side || 'neutral']++);
  const probs = (h.scenarios || []).map(s => Number(s.prob) || 0), psum = probs.reduce((a, x) => a + x, 0);
  return `<div class="hyp-edit">
    <div class="fields wide">
      ${field('عنوان الفرضية', inp(b + '.title', { ph: 'عنوان قصير' }), 'grow')}
      ${field('الأصل', inp(b + '.asset'))}
      ${field('الأفق', sel(b + '.horizon', HORIZON, { label: 'الأفق' }))}
      ${field('الحالة', sel(b + '.status', HYP_STATUS, { label: 'الحالة' }))}
      ${field('المراجعة القادمة', inp(b + '.review', { type: 'date' }))}
    </div>
    ${field('نص الفرضية: التوقع، السبب، الأفق', area(b + '.statement', { rows: 3, ph: 'أتوقع … خلال … لأن …' }))}
    <h3>المفاهيم الأكاديمية التي تستند إليها</h3>
    <ul class="concepts">${(h.concepts || []).map((id, j) => { const m = IDX[id]; return m ? `<li>${code(id)}<button class="link" data-act="pick" data-id="${id}" data-go="1">${esc(m.title)}</button>${pill(statusOf(id))}${statusOf(id) !== 'mastered' ? `<button class="btn sm" data-act="startLesson" data-id="${id}">ادرسها</button>` : ''}<button class="btn sm ghost danger" data-act="hypDel" data-i="${i}" data-key="concepts" data-j="${j}">فكّ الربط</button></li>` : `<li class="muted">وحدة محذوفة <button class="btn sm ghost danger" data-act="hypDel" data-i="${i}" data-key="concepts" data-j="${j}">أزلها</button></li>`; }).join('')}</ul>
    <select id="addc-${h.id}" data-on="hypConcept" data-i="${i}" aria-label="اربط وحدة"><option value="">اربط وحدة من المنهج…</option>${mo.map(o => `<option value="${o[0]}">${esc(o[1])}</option>`).join('')}</select>
    <h3>المستويات</h3>
    <div class="scroll"><table class="tbl"><thead><tr><th style="min-inline-size:170px">الوصف</th><th style="min-inline-size:120px">المستوى</th><th style="min-inline-size:120px">الدور</th><th style="min-inline-size:220px">ماذا يعني إن وصل إليه السعر</th><th></th></tr></thead><tbody>
      ${(h.levels || []).map((l, j) => `<tr><td>${inp(`${b}.levels.${j}.label`)}</td><td>${inp(`${b}.levels.${j}.value`, { ph: 'غير محدد' })}</td><td>${sel(`${b}.levels.${j}.role`, LEVEL_ROLE, { label: 'الدور' })}</td><td>${inp(`${b}.levels.${j}.note`)}</td><td><button class="btn sm ghost danger" data-act="hypDel" data-i="${i}" data-key="levels" data-j="${j}">حذف</button></td></tr>`).join('')}</tbody></table></div>
    <button class="btn sm" data-act="hypAdd" data-i="${i}" data-key="levels">أضف مستوى</button>
    <h3>السيناريوهات</h3>
    <div class="scens">${(h.scenarios || []).map((s, j) => `<div class="scen"><div class="fields wide">${field('الاسم', inp(`${b}.scenarios.${j}.name`), 'grow')}${field('النوع', sel(`${b}.scenarios.${j}.kind`, SCEN_KIND, { label: 'النوع' }))}${field('الاحتمال % (مؤقت)', inp(`${b}.scenarios.${j}.prob`, { type: 'number', min: 0, max: 100, ph: '—' }))}</div>
      ${field('المحفّز', inp(`${b}.scenarios.${j}.trigger`, { ph: 'ما الذي يطلق هذا السيناريو' }))}${field('المسار المتوقع', area(`${b}.scenarios.${j}.path`, { rows: 2 }))}${field('المستويات المستهدفة', inp(`${b}.scenarios.${j}.target`, { ph: 'غير محددة' }))}
      <button class="btn sm ghost danger" data-act="hypDel" data-i="${i}" data-key="scenarios" data-j="${j}">احذف السيناريو</button></div>`).join('')}</div>
    <div class="row"><button class="btn sm" data-act="hypAdd" data-i="${i}" data-key="scenarios">أضف سيناريو</button>${psum ? `<span class="muted">مجموع الاحتمالات المدخلة <b class="num">${psum}%</b></span>` : ''}</div>
    <h3>الأدلة</h3>
    <p class="counts"><span class="chip pos">مؤيد ${ev.for}</span><span class="chip neg">معارض ${ev.against}</span><span class="chip neu">محايد ${ev.neutral}</span>${(h.evidence || []).length && !ev.against ? '<span class="chip warn">لا دليل معارضاً مسجّلاً</span>' : ''}</p>
    <div class="scroll"><table class="tbl"><thead><tr><th style="min-inline-size:260px">الدليل</th><th style="min-inline-size:110px">الجانب</th><th style="min-inline-size:140px">التاريخ</th><th style="min-inline-size:160px">المصدر</th><th></th></tr></thead><tbody>
      ${(h.evidence || []).map((e, j) => `<tr><td>${area(`${b}.evidence.${j}.text`, { rows: 2 })}</td><td>${sel(`${b}.evidence.${j}.side`, EV_SIDE, { label: 'الجانب' })}</td><td>${inp(`${b}.evidence.${j}.date`, { type: 'date' })}</td><td>${inp(`${b}.evidence.${j}.source`)}</td><td><button class="btn sm ghost danger" data-act="hypDel" data-i="${i}" data-key="evidence" data-j="${j}">حذف</button></td></tr>`).join('')}</tbody></table></div>
    <button class="btn sm" data-act="hypAdd" data-i="${i}" data-key="evidence">أضف دليلاً</button>
    <div class="cols tight">${list('confirms', 'ما الذي يؤكد الفرضية', 'علّم الشرط حين يتحقق.')}${list('invalidates', 'ما الذي يبطلها', 'اكتبها قبل الحدث. تحقق أي شرط منها يستدعي مراجعة الحالة.')}</div>
    ${field('ملاحظات ومراجعات', area(b + '.notes', { rows: 3 }))}
    <div class="row"><button class="btn sm ghost danger" data-act="hypRemove" data-i="${i}">احذف الفرضية</button></div>
  </div>`;
}
function vBoard() {
  const items = S.board.items;
  const linked = [...new Set(items.flatMap(h => h.concepts || []))].map(id => IDX[id]).filter(Boolean);
  return head('لوحة المتابعة', 'كل فرضية عن الذهب أو الأسواق تُربط بالمفاهيم التي تستند إليها، وبأدلتها ومستوياتها وسيناريوهاتها، وبما يؤكدها أو يبطلها.',
    '<button class="btn primary" data-act="hypNew">فرضية جديدة</button>') + `
  <section class="card">
    <h2>من المفهوم إلى التحليل</h2>
    ${linked.length ? `<div class="scroll"><table class="tbl plain"><thead><tr><th>المفهوم</th><th>تمكّنك منه</th><th>الفرضيات التي تستند إليه</th><th>فجوات مفتوحة</th><th></th></tr></thead><tbody>
      ${linked.map(m => { const hs = hypsFor(m.id), st = statusOf(m.id), g = gapsFor(m.id).length; return `<tr class="${st !== 'mastered' && hs.some(h => h.status === 'active') ? 'flag' : ''}"><td>${code(m.id)} ${esc(m.title)}</td><td>${pill(st)}</td><td>${hs.map(h => `<button class="link" data-act="openHyp" data-id="${h.id}">${esc(h.title || 'بلا عنوان')}</button>`).join('، ')}</td><td class="num">${g || '—'}</td><td>${st !== 'mastered' ? `<button class="btn sm" data-act="startLesson" data-id="${m.id}">ادرسه</button>` : ''}</td></tr>`; }).join('')}</tbody></table></div>
      <p class="muted">الصف المعلَّم يعني أن فرضية نشطة تعتمد على مفهوم لم تتقنه بعد.</p>` : empty('لم تربط أي فرضية بوحدة من المنهج بعد.')}
  </section>
  ${items.length ? items.map((h, i) => {
    const open = S.board.open === h.id, st = HYP_STATUS.find(s => s[0] === h.status) || HYP_STATUS[0];
    const ev = { for: 0, against: 0 }; (h.evidence || []).forEach(e => { if (ev[e.side] != null) ev[e.side]++; });
    const inv = (h.invalidates || []).filter(x => x.met).length, con = (h.confirms || []).filter(x => x.met).length;
    return `<section class="card hyp ${h.status}" id="hyp-${h.id}">
      <div class="hyp-head"><div><span class="chip ${st[2]}">${st[1]}</span>${h.example ? '<span class="chip unk">مثال فارغ، عدّله أو احذفه</span>' : ''}
        <h2>${esc(h.title || 'فرضية بلا عنوان')}</h2>
        <p class="muted">${esc(h.asset || '')} · الأفق: ${esc(optLabel(HORIZON, h.horizon) || 'غير محدد')}${h.review ? ` · المراجعة <span class="num">${esc(h.review)}</span>` : ''}</p>
        ${h.statement ? `<p>${esc(h.statement)}</p>` : ''}
        <p class="counts"><span class="chip pos">أدلة مؤيدة ${ev.for}</span><span class="chip neg">معارضة ${ev.against}</span><span class="chip neu">مفاهيم ${(h.concepts || []).length}</span>${con ? `<span class="chip pos">شروط تأكيد تحققت ${con}</span>` : ''}${inv ? `<span class="chip neg">شروط إبطال تحققت ${inv}</span>` : ''}</p>
      </div><button class="btn" data-act="openHyp" data-id="${h.id}" aria-expanded="${open}">${open ? 'إغلاق' : 'افتح وعدّل'}</button></div>
      ${open ? hypEditor(h, i) : ''}
    </section>`; }).join('') : `<section class="card">${empty('لا فرضيات. أنشئ واحدة لتبدأ الربط بين ما تدرسه وما تحلله.')}</section>`}`;
}

/* ───────── الملف والبيانات ───────── */
function vProfile() {
  const W = { ...W_DEFAULT, ...S.core.weights }, mo = modOpts();
  return head('الملف والبيانات', 'ما يحدد اختيار الدرس التالي: مستواك، مسؤولياتك في التعليم، والأوزان. كلها قابلة للتعديل.') + `
  <section class="card">
    <h2>المستوى الحالي</h2>
    <div class="fields">${field('أدرس الآن', `<select id="f-level" data-bind="S.core.currentLevel" data-re>${T.map(l => `<option value="${l.id}"${l.id === S.core.currentLevel ? ' selected' : ''}>Level ${esc(l.id.slice(1))} — ${esc(l.title)}${l.prov ? ' (مؤقت)' : ''}</option>`).join('')}</select>`)}</div>
  </section>
  <section class="card">
    <h2>مسؤولياتي في التعليم</h2>
    <p class="muted">اربط كل مسؤولية بالوحدات التي تحتاجها. الوحدات المرتبطة ترتفع في ترتيب الدروس، وأكثر كلما اقترب الموعد.</p>
    ${S.core.teaching.length ? `<ul class="teachlist">${S.core.teaching.map((t, i) => { const b = `S.core.teaching.${i}`; return `<li class="${t.done ? 'done' : ''}">
      <div class="fields wide">${field('المسؤولية', inp(b + '.title', { ph: 'درس، دورة، جلسة، مادة مكتوبة' }), 'grow')}${field('لمن', inp(b + '.audience', { ph: 'غير محدد' }))}${field('الموعد', inp(b + '.due', { type: 'date' }))}
        <label class="check"><input type="checkbox" id="td-${t.id}" data-bind="${b}.done" data-re${t.done ? ' checked' : ''}> أُنجزت</label></div>
      <div class="row">${t.example ? '<span class="chip unk">مثال، عدّله أو احذفه</span>' : ''}${(t.modules || []).map((id, j) => IDX[id] ? `<span class="chip neu">${esc(IDX[id].title)} <button class="x" data-act="teachUnlink" data-i="${i}" data-j="${j}" aria-label="فكّ ربط ${esc(IDX[id].title)}">×</button></span>` : '').join('')}
        <select id="tl-${t.id}" data-on="teachLink" data-i="${i}" aria-label="اربط وحدة"><option value="">اربط وحدة…</option>${mo.filter(o => !(t.modules || []).includes(o[0])).map(o => `<option value="${o[0]}">${esc(o[1])}</option>`).join('')}</select>
        <button class="btn sm ghost danger" data-act="teachDel" data-i="${i}">حذف</button></div></li>`; }).join('')}</ul>` : empty('لا مسؤوليات مسجّلة.')}
    <button class="btn sm" data-act="teachAdd">أضف مسؤولية</button>
  </section>
  <section class="card">
    <h2>أوزان اختيار الدرس <span class="chip unk">مؤقتة</span></h2>
    <p class="muted">نقاط كل عامل في ترتيب الوحدات. ارفع وزن ما تريده أن يغلب.</p>
    <div class="fields weights">${Object.keys(W_DEFAULT).map(k => field(W_LABEL[k], `<input id="w-${k}" type="number" min="0" max="100" data-bind="S.core.weights.${k}" value="${esc(W[k])}">`)).join('')}</div>
    <h3>عتبات التمكّن <span class="chip unk">مؤقتة</span></h3>
    <div class="fields">${field('نسبة «متمكّن»', inp('S.core.thresholds.mastered', { type: 'number', min: 0, max: 100 }))}${field('نسبة «مكتملة»', inp('S.core.thresholds.pass', { type: 'number', min: 0, max: 100 }))}</div>
    <button class="btn sm" data-act="resetWeights">أعد القيم المقترحة</button>
  </section>
  <section class="card">
    <h2>البيانات</h2>
    <p><span id="store2" class="store-inline"></span></p>
    <div class="row"><button class="btn" data-act="exportCopy">انسخ نسخة احتياطية</button>${window.claude ? '' : '<button class="btn" data-act="exportFile">نزّل ملف JSON</button>'}</div>
    <h3>استيراد نسخة احتياطية</h3>
    <textarea id="import-text" rows="4" placeholder="ألصق هنا نص النسخة الاحتياطية" aria-label="نص النسخة الاحتياطية"></textarea>
    <div class="row"><button class="btn" data-act="importText">استورد من النص</button><label class="btn filebtn">اختر ملفاً<input type="file" id="import-file" accept="application/json,.json" data-on="importFile"></label></div>
    <h3>إعادة الضبط</h3>
    <div class="row"><button class="btn danger" data-act="resetAll">امسح كل شيء وابدأ من جديد</button></div>
  </section>`;
}

/* ───────── العرض والتوجيه ───────── */
const VIEWS = { home: vHome, curriculum: vCurr, lesson: vLesson, gaps: vLog, workspaces: vWork, board: vBoard, profile: vProfile };
function render() {
  const main = $('#app'), act = document.activeElement;
  const keep = act && act.id && main.contains(act) ? act.id : null;
  let pos = null; try { if (keep && act.selectionStart != null) pos = [act.selectionStart, act.selectionEnd]; } catch { /* نوع لا يدعم التحديد */ }
  main.innerHTML = VIEWS[UI.view]();
  document.querySelectorAll('.rail a[data-view]').forEach(a => { const on = a.dataset.view === UI.view; a.classList.toggle('on', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
  const open = S.log.items.filter(i => i.status !== 'resolved').length;
  const bg = $('#badge-gaps'); if (bg) { bg.textContent = open || ''; bg.hidden = !open; }
  const s2 = $('#store2'); if (s2) s2.textContent = $('#store').textContent;
  if (keep) { const el = document.getElementById(keep); if (el) { el.focus({ preventScroll: true }); if (pos) try { el.setSelectionRange(pos[0], pos[1]); } catch { /* تجاهل */ } } }
}
function go(view, top = true) {
  UI.view = VIEWS[view] ? view : 'home';
  if (location.hash.slice(1) !== UI.view) { try { history.replaceState(null, '', '#' + UI.view); } catch { location.hash = UI.view; } }
  render(); if (top) window.scrollTo(0, 0);
}
function route() { const h = location.hash.slice(1); const v = VIEWS[h] ? h : 'home'; if (v !== UI.view || !$('#app').firstChild) { UI.view = v; render(); window.scrollTo(0, 0); } }
function toast(msg, undo) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button class="btn sm" data-act="undo">تراجع</button>' : ''}`;
  t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, undo ? 9000 : 3500);
}
function mutate(fn, msg) { fn(); rebuild(); touch(); render(); if (msg) toast(msg); }
function destructive(msg, fn) {
  undoSnap = JSON.stringify(SECTIONS.reduce((o, s) => ((o[s] = S[s]), o), {}));
  fn(); rebuild(); touch(); render(); toast(msg, true);
}
function showText(title, text) {
  const d = $('#dlg'); $('#dlg-title').textContent = title; $('#dlg-text').value = text;
  if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  $('#dlg-text').select();
}
async function copyText(text, okMsg) {
  try { await navigator.clipboard.writeText(text); toast(okMsg); }
  catch { showText('انسخ النص يدوياً', text); }
}
function addLog(type, text, module, priority) {
  if (S.log.items.some(i => i.status !== 'resolved' && i.text === text && (i.module || '') === (module || ''))) return false;
  S.log.items.unshift({ id: uid('g'), type, text, module: module || '', priority: Number(priority) || 2, status: 'open', note: '', resolution: '', created: today() });
  return true;
}
function nextId(parentId, depth) {
  const c = S.core.custom, letter = 'LCMK'[depth];
  const mkId = n => (depth === 0 ? 'L' + String(n).padStart(2, '0') : `${parentId}-${letter}${n}`);
  const taken = new Set([...Object.keys(IDX), ...c.removed, ...Object.values(c.added).flat().map(x => x.id)]);
  let n = 1; while (taken.has(mkId(n))) n++;
  return mkId(n);
}
function sheetCtx() { const def = TPL.sheets.find(d => d.id === UI.tpl); if (!def) return null; const st = S.work.sheets[def.id], ix = activeIx(st); return { def, st, ix, sh: st.items[ix] }; }
function sheetAsText({ def, sh }) {
  const cols = def.cols.filter(c => c.type !== 'calc');
  const val = (c, r) => String(c.type === 'select' ? optLabel(c.options, r[c.key]) : r[c.key] ?? '').replace(/\s*\n\s*/g, ' ').replace(/\|/g, '/');
  const lines = [`# ${def.title} — ${sh.name || ''} (${sh.date || ''})`, ''];
  def.fields.forEach(f => { const v = (sh.fields || {})[f.key]; if (v) lines.push(`${f.label}: ${f.type === 'select' ? optLabel(f.options, v) : v}`); });
  if (def.fields.length) lines.push('');
  lines.push('| ' + cols.map(c => c.label).join(' | ') + ' |', '|' + cols.map(() => ' --- ').join('|') + '|');
  sh.rows.forEach(r => lines.push('| ' + cols.map(c => val(c, r)).join(' | ') + ' |'));
  return lines.join('\n');
}
const exportJSON = () => JSON.stringify({ app: 'rafik-framework-ale', v: 1, exported: new Date().toISOString(), ...SECTIONS.reduce((o, s) => ((o[s] = S[s]), o), {}) }, null, 2);
function importJSON(text) {
  let raw; try { raw = JSON.parse(text); } catch { toast('النص ليس JSON صالحاً. تأكد أنك لصقت النسخة كاملة.'); return; }
  if (!raw || !SECTIONS.some(s => raw[s] && typeof raw[s] === 'object')) { toast('الملف لا يحتوي بيانات هذا التطبيق.'); return; }
  destructive('استُوردت النسخة الاحتياطية', () => { const h = hydrate(raw); SECTIONS.forEach(s => { S[s] = h[s]; }); UI.lesson = null; });
}

/* ───────── الأفعال ───────── */
const ACT = {
  go: d => go(d.id),
  undo() { if (!undoSnap) return; const o = JSON.parse(undoSnap); SECTIONS.forEach(s => { S[s] = o[s]; }); undoSnap = null; rebuild(); touch(); render(); toast('تم التراجع'); },
  closeDlg() { const d = $('#dlg'); d.close ? d.close() : d.removeAttribute('open'); },

  pick(d) {
    const n = IDX[d.id]; if (!n) return;
    const chain = []; for (let x = n; x; x = x.parent) chain[x.depth] = x.id;
    UI.sel = { level: chain[0] || null, chapter: chain[1] || null, module: chain[2] || null };
    if (d.go || UI.view !== 'curriculum') go('curriculum'); else render();
  },
  editNode(d) { UI.edit = UI.edit === d.id ? null : d.id; render(); },
  setLevel: d => mutate(() => { S.core.currentLevel = d.id; }, 'تغيّر مستواك الحالي'),
  delNode(d) { const n = IDX[d.id]; if (!n) return; destructive(`حُذف ${KIND[n.depth]} «${n.title}»`, () => { S.core.custom.removed.push(d.id); UI.edit = null; if (S.core.currentLevel === d.id) S.core.currentLevel = (T.find(l => l.id !== d.id) || {}).id || ''; }); },
  addNode(d, form) {
    const t = form.t.value.trim(); if (!t) return;
    const depth = Number(d.depth), id = nextId(d.parent, depth), c = S.core.custom;
    (c.added[d.parent] ??= []).push({ id, title: t, prov: depth < 3, user: true });
    mutate(() => {}, `أُضيف ${KIND[depth]}`);
    if (depth < 3) ACT.pick({ id });
  },
  kset(d) { const k = modW(d.m).k; k[d.k] === d.v ? delete k[d.k] : (k[d.k] = d.v); if (statusOf(d.m) === 'new') modW(d.m).status = 'progress'; mutate(() => {}); },
  logFor(d) { UI.logModule = d.id; go('gaps'); const el = $('#nl-text'); if (el) el.focus(); },

  startLesson(d) {
    if (!IDX[d.id]) return;
    UI.lesson = { id: d.id, step: 0, ans: {}, open: '', openRate: null, conf: 3, appM: '', appG: '', gapSel: {}, outcome: '', saved: false };
    if (statusOf(d.id) === 'new') { modW(d.id).status = 'progress'; touch(); }
    go('lesson');
  },
  endLesson() { UI.lesson = null; go('lesson'); },
  lstep(d) { UI.lesson.step = Number(d.n); render(); window.scrollTo(0, 0); },
  answer(d) { const L = UI.lesson; if (L.ans[d.q] == null) { L.ans[d.q] = Number(d.o); render(); } },
  openRate(d) { UI.lesson.openRate = Number(d.n); render(); },
  hypFromLesson() {
    const L = UI.lesson, m = IDX[L.id];
    const h = newHyp({ title: 'قراءة الذهب: ' + m.title, statement: L.appG.trim(), concepts: [m.id] });
    S.board.items.unshift(h); S.board.open = h.id; touch(); toast('أُنشئت فرضية مرتبطة بهذه الوحدة في لوحة المتابعة');
  },
  saveLesson() {
    const L = UI.lesson, a = assess(L), out = L.outcome || a.outcome, p = modW(L.id);
    p.status = out; p.score = a.pct; p.conf = Number(L.conf); p.last = today(); p.n = (p.n || 0) + 1;
    let added = 0;
    a.wrong.forEach(x => { if (L.gapSel['q' + x.i] !== false && addLog('gap', 'أخطأت في سؤال: ' + x.q.q, L.id, 2)) added++; });
    a.weak.forEach(k => { if (L.gapSel[k.id] !== false && addLog('gap', 'نقطة لم أتقنها: ' + k.title, L.id, 2)) added++; });
    S.log.sessions.unshift({ id: uid('s'), module: L.id, date: today(), pct: a.pct, outcome: out, conf: Number(L.conf), open: L.open, appM: L.appM, appG: L.appG });
    S.log.sessions.length = Math.min(S.log.sessions.length, 150);
    L.saved = true; touch(); render();
    toast(`حُفظ التقييم: ${OUTCOME_TXT[out]}${added ? `، وسُجّلت ${added} فجوة` : ''}`);
  },

  logFilter(d) { UI.logFilter[d.k] = d.v; render(); },
  addLog(d, form) {
    const text = form.text.value.trim(); if (!text) return;
    const ok = addLog(form.type.value, text, form.module.value, form.priority.value);
    UI.logModule = null; UI.logFilter.status = 'open';
    if (UI.logFilter.type !== 'all') UI.logFilter.type = form.type.value;
    mutate(() => {}, ok ? 'سُجّل' : 'هذا العنصر مسجّل ومفتوح بالفعل');
  },
  delLog: d => destructive('حُذف العنصر', () => { S.log.items.splice(Number(d.i), 1); }),

  openTpl(d) { UI.tpl = d.id; go('workspaces', UI.view !== 'workspaces'); },
  rowAdd() { const c = sheetCtx(); c.sh.rows.push({}); mutate(() => {}); },
  rowDel(d) { const c = sheetCtx(); destructive('حُذف الصف', () => { c.sh.rows.splice(Number(d.r), 1); }); },
  sortRows(d) { const c = sheetCtx(); mutate(() => { c.sh.rows.sort((a, b) => (a[d.key] || '9999').localeCompare(b[d.key] || '9999')); }, 'رُتّبت الصفوف'); },
  sheetNew(d) {
    const c = sheetCtx();
    const s = d.mode === 'dup' ? { ...clone(c.sh), id: uid('sh'), name: (c.sh.name || 'نسخة') + ' — محدّثة', date: today() } : newSheet(c.def, 'نسخة جديدة');
    mutate(() => { c.st.items.unshift(s); c.st.active = s.id; }, d.mode === 'dup' ? 'نُسخت النسخة الحالية بتاريخ اليوم' : 'أُنشئت نسخة فارغة من القالب');
  },
  sheetDel() { const c = sheetCtx(); if (c.st.items.length < 2) return; destructive('حُذفت النسخة', () => { c.st.items.splice(c.ix, 1); c.st.active = c.st.items[0].id; }); },
  sheetCopy() { copyText(sheetAsText(sheetCtx()), 'نُسخ الجدول كنص'); },
  ckDel: d => destructive('حُذف البند', () => { S.work.checklists[d.c].items.splice(Number(d.i), 1); }),
  ckAdd(d, form) { const t = form.t.value.trim(); if (!t) return; mutate(() => { S.work.checklists[d.c].items.push({ id: uid('i'), text: t, done: false }); }); },
  ckReset: d => mutate(() => { S.work.checklists[d.c].items.forEach(i => { i.done = false; }); }, 'أُعيد تعليم القائمة'),
  clDel: d => destructive('حُذفت القائمة', () => { S.work.checklists.splice(Number(d.c), 1); }),
  clAdd(d, form) { const t = form.t.value.trim(); if (!t) return; mutate(() => { S.work.checklists.push({ id: uid('c'), title: t, items: [] }); }); },

  hypNew() { const h = newHyp(); mutate(() => { S.board.items.unshift(h); S.board.open = h.id; }); },
  openHyp(d) {
    S.board.open = S.board.open === d.id && UI.view === 'board' ? null : d.id; touch();
    go('board', false);
    const el = document.getElementById('hyp-' + d.id); if (el && S.board.open) el.scrollIntoView({ block: 'start' });
  },
  hypAdd(d) {
    const h = S.board.items[d.i];
    const blank = { levels: { label: '', value: '', role: 'unk', note: '' }, scenarios: { name: '', kind: 'unk', prob: '', trigger: '', path: '', target: '' }, evidence: { text: '', side: 'for', date: today(), source: '' }, confirms: { text: '', met: false }, invalidates: { text: '', met: false } }[d.key];
    mutate(() => { (h[d.key] ??= []).push({ ...blank }); });
  },
  hypDel(d) { const h = S.board.items[d.i]; destructive('حُذف العنصر', () => { h[d.key].splice(Number(d.j), 1); }); },
  hypRemove: d => destructive('حُذفت الفرضية', () => { S.board.items.splice(Number(d.i), 1); }),
  hypConcept(d, el) { if (!el.value) return; const h = S.board.items[d.i]; mutate(() => { (h.concepts ??= []).push(el.value); delete h.example; }); },

  teachAdd: () => mutate(() => { S.core.teaching.push({ id: uid('t'), title: '', audience: '', due: '', modules: [], done: false }); }),
  teachDel: d => destructive('حُذفت المسؤولية', () => { S.core.teaching.splice(Number(d.i), 1); }),
  teachLink(d, el) { if (!el.value) return; mutate(() => { (S.core.teaching[d.i].modules ??= []).push(el.value); }); },
  teachUnlink: d => mutate(() => { S.core.teaching[d.i].modules.splice(Number(d.j), 1); }),
  resetWeights: () => mutate(() => { S.core.weights = { ...W_DEFAULT }; S.core.thresholds = { ...TH_DEFAULT }; }, 'أُعيدت القيم المقترحة'),

  pickTitle(d, el) { if (!el.value) return; mutate(() => { S.core.custom.titles[d.id] = el.value; }); },
  toggleProv(d, el) { mutate(() => { S.core.custom.confirmed[d.id] = !el.checked; }); },

  exportCopy() { copyText(exportJSON(), 'نُسخت النسخة الاحتياطية. ألصقها في ملف نصي واحفظه.'); },
  exportFile() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([exportJSON()], { type: 'application/json' }));
    a.download = `rafik-framework-${today()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  },
  importText() { const v = $('#import-text').value.trim(); if (v) importJSON(v); else toast('ألصق نص النسخة الاحتياطية أولاً.'); },
  importFile(d, el) { const f = el.files && el.files[0]; if (!f) return; f.text().then(importJSON).catch(() => toast('تعذّرت قراءة الملف.')); },
  resetAll: () => destructive('مُسحت كل البيانات', () => { const h = defaults(); SECTIONS.forEach(s => { S[s] = h[s]; }); UI.lesson = null; UI.edit = null; }),
};

/* ───────── ربط الأحداث ───────── */
function valOf(el) {
  if (el.type === 'checkbox') return el.checked;
  if (el.type === 'number' || el.type === 'range' || el.dataset.num != null) return el.value === '' ? '' : Number(el.value);
  return el.value;
}
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
  const fn = ACT[el.dataset.act]; if (fn) fn(el.dataset, el);
});
document.addEventListener('submit', e => {
  const f = e.target; e.preventDefault();
  const fn = ACT[f.dataset.submit]; if (fn) fn(f.dataset, f);
});
document.addEventListener('input', e => {
  const el = e.target, p = el.dataset && el.dataset.bind; if (!p) return;
  const isUI = p.startsWith('UI.');
  setPath(isUI ? UI : S, p.slice(p.indexOf('.') + 1), valOf(el));
  if (!isUI) touch();
  if (el.dataset.echo) { rebuild(); document.querySelectorAll(`[data-title="${el.dataset.echo}"]`).forEach(x => { x.textContent = el.value || IDX[el.dataset.echo].title; }); }
  if (el.dataset.calc != null) {
    const c = sheetCtx();
    if (c) {
      if (c.def.summary) $('#sheet-summary').innerHTML = SUMMARY[c.def.summary](c.sh);
      const out = el.closest('tr') && el.closest('tr').querySelector('[data-score]');
      if (out) { const r = c.sh.rows[[...el.closest('tbody').children].indexOf(el.closest('tr'))]; const s = (Number(r.like) || 0) * (Number(r.impact) || 0); out.textContent = s || '—'; out.className = 'score num ' + (s >= 15 ? 'hi' : s >= 8 ? 'mid' : s ? 'lo' : ''); }
    }
  }
});
document.addEventListener('change', e => {
  const el = e.target; if (!el.dataset) return;
  if (el.dataset.on && ACT[el.dataset.on]) { ACT[el.dataset.on](el.dataset, el); return; }
  if (el.dataset.bind && el.dataset.re != null) { rebuild(); render(); }
});
window.addEventListener('hashchange', route);
window.addEventListener('pagehide', () => { clearTimeout(saveTimer); persist(); });

/* ───────── الإقلاع ───────── */
const raw = loadLocal();
S = hydrate(raw);
SECTIONS.forEach(s => { store.last[s] = JSON.stringify(S[s]); store.loadTs[s] = S.ts[s] || 0; });
rebuild(); route(); paintStore(); initCloud();
})();
