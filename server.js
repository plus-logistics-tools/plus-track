// سيرفر بسيط بدون مكتبات: node server.js
// بيقدّم الصفحة + /api/track?awb=...  والمفتاح بيفضل هنا على السيرفر بس.
const http = require('http'), fs = require('fs'), path = require('path');
const cfg = require('./config');
const connector = require('./connectors/' + cfg.CONNECTOR);
const PUB = path.join(__dirname, 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
const hits = new Map();
setInterval(() => hits.clear(), 60e3).unref();
const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/api/track') {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const n = (hits.get(ip) || 0) + 1; hits.set(ip, n);
    if (n > cfg.RATE_LIMIT_PER_MIN) return json(res, 429, { error: 'rate_limited' });
    const awb = (u.searchParams.get('awb') || '').trim();
    if (!/^[A-Za-z0-9\-]{3,30}$/.test(awb)) return json(res, 400, { error: 'bad_awb' });
    try {
      const r = await connector.track(awb);
      return r ? json(res, 200, r) : json(res, 404, { error: 'not_found' });
    } catch (e) { console.error(e.message); return json(res, 502, { error: 'upstream' }); }
  }
  let f = path.normalize(path.join(PUB, u.pathname === '/' ? 'index.html' : u.pathname));
  if (!f.startsWith(PUB) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(cfg.PORT, () => console.log('Plus Tracking on http://localhost:' + cfg.PORT + ' [' + cfg.CONNECTOR + ']'));
