// ===== الربط الحقيقي مع Ainsoft =====
// ده الملف الوحيد اللي بيتعدّل لما تيجي وثائق الـ API. 3 حاجات بس:
//  1) config.js / .env  -> العنوان والمفتاح
//  2) STATUS_MAP        -> ترجمة حالات Ainsoft لحالاتنا
//  3) mapResponse()     -> ترتيب الحقول من رد Ainsoft
// ملحوظة أمان: بنرجّع حقول قليلة بس (حالة، إمارة، منطقة، تواريخ). ما نرجّعش اسم العميل ولا تليفونه ولا المبلغ.
const cfg = require('../config').AINSOFT;

// اكتب هنا القيم الفعلية اللي Ainsoft بترجعها (بالحروف الصغيرة) -> حالتنا
const STATUS_MAP = {
  // 'new': 'received',
  // 'picked up': 'picked_up',
  // 'in store': 'at_hub',
  // 'assigned': 'out_for_delivery',
  // 'delivered': 'delivered',
  // 'returned': 'returned',
  // 'postponed': 'postponed',
  // 'cancelled': 'cancelled',
};

// حوّل رد Ainsoft لشكلنا. عدّل أسماء الحقول حسب الوثائق.
function mapResponse(awb, body) {
  const order = body.data || body; // TODO
  const raw = String(order.status || '').toLowerCase();
  return {
    awb,
    status: STATUS_MAP[raw] || 'received',
    emirate: order.emirate || '',   // TODO
    area: order.area || '',         // TODO
    updatedAt: order.updated_at || new Date().toISOString(), // TODO
    events: (order.history || []).map((h) => ({  // TODO
      status: STATUS_MAP[String(h.status || '').toLowerCase()] || 'received',
      at: h.date, note: '',
    })),
  };
}

module.exports = {
  async track(awb) {
    if (!cfg.BASE_URL || !cfg.API_KEY) throw new Error('Ainsoft not configured');
    const url = cfg.BASE_URL + cfg.TRACK_PATH.replace('{awb}', encodeURIComponent(awb));
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), cfg.TIMEOUT_MS);
    try {
      const res = await fetch(url, { headers: { [cfg.AUTH_HEADER]: cfg.AUTH_PREFIX + cfg.API_KEY, Accept: 'application/json' }, signal: ctl.signal });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Ainsoft HTTP ' + res.status);
      return mapResponse(awb, await res.json());
    } finally { clearTimeout(t); }
  },
};
