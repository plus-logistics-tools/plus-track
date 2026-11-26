const T = {
  ar: { title: 'تتبّع شحنتك', sub: 'اكتب رقم الطلب أو رقم الفاتورة وشوف حالته في ثانيتين.', ph: 'مثال: PL1002', go: 'تتبّع', try: 'جرّب:', recent: 'آخر عمليات البحث', clear: 'مسح',
    awb: 'رقم الطلب', loc: 'المنطقة', upd: 'آخر تحديث', notfound: 'مش لاقيين الطلب ده', nfp: 'اتأكد من الرقم أو كلّم شركة الشحن.', bad: 'اكتب رقم صحيح (حروف أو أرقام فقط).',
    fail: 'حصلت مشكلة مؤقتة', failp: 'جرّب تاني بعد شوية.', rate: 'طلبات كتير، استنى دقيقة.', demo: 'بيانات تجريبية للعرض فقط', foot: 'Plus Logistics © تتبّع الشحنات',
    st: { received: 'تم استلام الطلب', picked_up: 'تم الاستلام من التاجر', at_hub: 'في مخزن الشركة', out_for_delivery: 'خرج للتوصيل', delivered: 'تم التسليم', returned: 'تم الإرجاع للتاجر', postponed: 'مؤجّل', cancelled: 'ملغي' },
    ago: (m) => m < 1 ? 'دلوقتي' : m < 60 ? `من ${m} دقيقة` : m < 1440 ? `من ${Math.floor(m / 60)} ساعة` : `من ${Math.floor(m / 1440)} يوم`, loc2: 'جاري التوصيل' },
  en: { title: 'Track your shipment', sub: 'Enter your order or invoice number and see its status in seconds.', ph: 'e.g. PL1002', go: 'Track', try: 'Try:', recent: 'Recent searches', clear: 'Clear',
    awb: 'Order No.', loc: 'Area', upd: 'Last update', notfound: 'We could not find this order', nfp: 'Check the number or contact the courier.', bad: 'Enter a valid number (letters or digits only).',
    fail: 'Temporary problem', failp: 'Please try again in a moment.', rate: 'Too many requests, wait a minute.', demo: 'Demo data, for preview only', foot: 'Plus Logistics © Shipment tracking',
    st: { received: 'Order received', picked_up: 'Picked up from merchant', at_hub: 'At our hub', out_for_delivery: 'Out for delivery', delivered: 'Delivered', returned: 'Returned to merchant', postponed: 'Postponed', cancelled: 'Cancelled' },
    ago: (m) => m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.floor(m / 60)} h ago` : `${Math.floor(m / 1440)} d ago` },
};
const FLOW = ['received', 'picked_up', 'at_hub', 'out_for_delivery', 'delivered'];
const BADGE = { delivered: 'b-ok', out_for_delivery: 'b-run', at_hub: 'b-info', picked_up: 'b-info', received: 'b-info', postponed: 'b-warn', returned: 'b-bad', cancelled: 'b-bad' };
const $ = (id) => document.getElementById(id);
let lang = localStorage.getItem('lang') || 'ar', last = null, isDemoFallback = false;
const store = { get: () => { try { return JSON.parse(localStorage.getItem('recent') || '[]'); } catch { return []; } }, set: (v) => localStorage.setItem('recent', JSON.stringify(v.slice(0, 5))) };

// بيانات احتياطية لما الصفحة تتفتح من غير سيرفر (معاينة ثابتة)
const h = (x) => new Date(Date.now() - x * 3600e3).toISOString();
const FB = { PL1001: ['delivered', 'Dubai', 'Al Barsha', [52, 46, 40, 28, 25]], PL1002: ['out_for_delivery', 'Sharjah', 'Al Nahda', [20, 14, 9, 2]], PL1003: ['at_hub', 'Ajman', 'Al Nuaimiya', [10, 5, 1]],
  PL1004: ['postponed', 'Abu Dhabi', 'Khalifa City', [70, 60, 52, 30, 26]], PL1005: ['returned', 'Ras Al Khaimah', 'Al Nakheel', [120, 110, 80, 50]] };
function fallback(awb) {
  const r = FB[awb.toUpperCase()]; if (!r) return null;
  const seq = ['received', 'picked_up', 'at_hub', 'out_for_delivery']; const evs = r[3].map((x, i) => ({ status: i < r[3].length - 1 || ['delivered'].includes(r[0]) ? (r[0] === 'returned' && i === r[3].length - 1 ? 'returned' : r[0] === 'postponed' && i === r[3].length - 1 ? 'postponed' : [...seq, 'delivered'][i]) : r[0], at: h(x) }));
  evs[evs.length - 1].status = r[0];
  return { awb: awb.toUpperCase(), status: r[0], emirate: r[1], area: r[2], updatedAt: evs[evs.length - 1].at, events: evs };
}

async function lookup(awb) {
  try {
    const res = await fetch('/api/track?awb=' + encodeURIComponent(awb), { cache: 'no-store' });
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('json')) throw new Error('static');
    isDemoFallback = false;
    if (res.status === 404) return { error: 'notfound' };
    if (res.status === 400) return { error: 'bad' };
    if (res.status === 429) return { error: 'rate' };
    if (!res.ok) return { error: 'fail' };
    return { data: await res.json() };
  } catch (e) { isDemoFallback = true; const d = fallback(awb); return d ? { data: d } : { error: 'notfound' }; }
}

const fmt = (iso) => new Date(iso).toLocaleString(lang === 'ar' ? 'ar-AE' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const mins = (iso) => Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function render(r) {
  const t = T[lang], box = $('result');
  if (!r) { box.innerHTML = ''; return; }
  if (r.error) {
    const m = { notfound: [t.notfound, t.nfp, '🔍'], bad: [t.bad, '', '⚠️'], rate: [t.rate, '', '⏳'], fail: [t.fail, t.failp, '⚠️'] }[r.error];
    box.innerHTML = `<div class="card err"><div class="ic">${m[2]}</div><h3>${m[0]}</h3><p>${m[1]}</p></div>`; return;
  }
  const d = r.data, byStatus = {}; d.events.forEach((e) => (byStatus[e.status] = e));
  let steps;
  if (FLOW.includes(d.status)) {
    const idx = FLOW.indexOf(d.status);
    steps = FLOW.map((s, i) => `<li class="${i < idx ? 'done' : i === idx ? (s === 'delivered' ? 'done' : 'now') : 'todo'}"><span class="dot">${i < idx || s === 'delivered' && i === idx ? '✓' : ''}</span><div class="s">${t.st[s]}</div><div class="t">${byStatus[s] ? fmt(byStatus[s].at) : ''}</div></li>`).join('');
  } else {
    steps = d.events.map((e, i) => `<li class="${i === d.events.length - 1 ? 'now' : 'done'}"><span class="dot">${i === d.events.length - 1 ? '' : '✓'}</span><div class="s">${t.st[e.status] || esc(e.status)}</div><div class="t">${fmt(e.at)}</div></li>`).join('');
  }
  box.innerHTML = `<div class="card"><div class="rhead"><div><div class="lbl">${t.awb}</div><div class="awb">${esc(d.awb)}</div></div><span class="badge ${BADGE[d.status] || 'b-info'}">${t.st[d.status] || esc(d.status)}</span></div>
  <div class="facts"><div><span class="lbl">${t.loc}</span><b>${esc([d.area, d.emirate].filter(Boolean).join('، ').replace('،', lang === 'ar' ? '،' : ','))}</b></div><div><span class="lbl">${t.upd}</span><b>${t.ago(mins(d.updatedAt))}</b></div></div>
  <ol class="steps">${steps}</ol>${isDemoFallback || d.demo ? `<div class="demo">${t.demo}</div>` : ''}</div>`;
}

async function go(awb) {
  awb = awb.trim(); if (!awb) return;
  $('awb').value = awb; $('awb').blur();
  $('result').innerHTML = '<div class="card"><div class="spin"></div></div>';
  const r = await lookup(awb); last = r; render(r);
  if (r.data) { const l = store.get().filter((x) => x !== r.data.awb); l.unshift(r.data.awb); store.set(l); drawRecent(); }
  $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function drawRecent() {
  const t = T[lang], l = store.get(), el = $('recent');
  el.innerHTML = l.length ? `<h2><span>${t.recent}</span><button class="clr" type="button" id="clr">${t.clear}</button></h2>` + l.map((a) => `<button class="ritem" type="button" data-a="${esc(a)}"><span>${esc(a)}</span><span>${lang === 'ar' ? '‹' : '›'}</span></button>`).join('') : '';
  el.querySelectorAll('.ritem').forEach((b) => (b.onclick = () => go(b.dataset.a)));
  const c = $('clr'); if (c) c.onclick = () => { store.set([]); drawRecent(); };
}
function ui() {
  const t = T[lang];
  document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  $('t-title').textContent = t.title; $('t-sub').textContent = t.sub; $('awb').placeholder = t.ph; $('go').textContent = t.go;
  $('lang').textContent = lang === 'ar' ? 'EN' : 'عربي'; $('foot').textContent = t.foot;
  $('chips').innerHTML = `<span>${t.try}</span>` + ['PL1002', 'PL1001', 'PL1004'].map((a) => `<button class="chip" type="button" data-a="${a}">${a}</button>`).join('');
  $('chips').querySelectorAll('.chip').forEach((b) => (b.onclick = () => go(b.dataset.a)));
  drawRecent(); render(last);
}
$('form').onsubmit = (e) => { e.preventDefault(); go($('awb').value); };
$('lang').onclick = () => { lang = lang === 'ar' ? 'en' : 'ar'; localStorage.setItem('lang', lang); ui(); };
ui();
const q = new URLSearchParams(location.search).get('awb'); if (q) go(q);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
