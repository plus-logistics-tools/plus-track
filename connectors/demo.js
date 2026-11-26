// بيانات تجريبية. شكل النتيجة هو "العقد" اللي لازم أي connector يرجّعه.
// Status codes: received, picked_up, at_hub, out_for_delivery, delivered, returned, postponed, cancelled
const d = (s) => new Date(Date.now() - s * 3600e3).toISOString();
const DATA = {
  PL1001: { status: 'delivered', emirate: 'Dubai', area: 'Al Barsha', events: [
    ['received', 52, 'Order registered'], ['picked_up', 46, ''], ['at_hub', 40, ''], ['out_for_delivery', 28, ''], ['delivered', 25, '']] },
  PL1002: { status: 'out_for_delivery', emirate: 'Sharjah', area: 'Al Nahda', events: [
    ['received', 20, ''], ['picked_up', 14, ''], ['at_hub', 9, ''], ['out_for_delivery', 2, '']] },
  PL1003: { status: 'at_hub', emirate: 'Ajman', area: 'Al Nuaimiya', events: [
    ['received', 10, ''], ['picked_up', 5, ''], ['at_hub', 1, '']] },
  PL1004: { status: 'postponed', emirate: 'Abu Dhabi', area: 'Khalifa City', events: [
    ['received', 70, ''], ['picked_up', 60, ''], ['at_hub', 52, ''], ['out_for_delivery', 30, ''], ['postponed', 26, 'Customer asked for another day']] },
  PL1005: { status: 'returned', emirate: 'Ras Al Khaimah', area: 'Al Nakheel', events: [
    ['received', 120, ''], ['picked_up', 110, ''], ['out_for_delivery', 80, ''], ['returned', 50, '']] },
};
module.exports = {
  async track(awb) {
    const r = DATA[String(awb).toUpperCase()];
    if (!r) return null;
    return { awb: String(awb).toUpperCase(), status: r.status, emirate: r.emirate, area: r.area,
      updatedAt: d(r.events[r.events.length - 1][1]),
      events: r.events.map(([status, h, note]) => ({ status, at: d(h), note })) };
  },
};
