// Browser test of fares for any pick-up (Playwright): node tools/route.e2e.mjs [base-url]
// No URL: starts a mock Mapbox and server.mjs on :3012 (Zürich → Basel measures 87 km, so Business is CHF 522.00),
// then also checks a Mapbox outage. With a URL (e.g. https://z-als.ch) it checks the live site: it blocks
// /api/enquiry|contact|checkout and never presses a pay, WhatsApp or send button.
import http from 'node:http';
import { spawn } from 'node:child_process';
import { launch } from './pw.mjs';

await import('../public/js/places.js');
await import('../public/js/fares.js');
const { todayInZurich } = globalThis.ZALS;

let base = (process.argv[2] || '').replace(/\/$/, '');
const local = !base;
let fail = false, child, mock;
if (local) {
  mock = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    const json = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
    if (fail) return json(500, {});
    if (u.pathname === '/search/searchbox/v1/forward') {
      const q = u.searchParams.get('q');
      return json(200, { features: [{ geometry: { coordinates: /basel/i.test(q) ? [7.58, 47.56] : /bern/i.test(q) ? [7.44, 46.95] : [8.53, 47.38] }, properties: { feature_type: 'place', name: q } }] });
    }
    // Zürich ↔ Basel 87 km, anything else 100 km.
    if (u.pathname.startsWith('/directions/')) return json(200, { routes: [{ distance: /8\.53/.test(u.pathname) && /7\.58/.test(u.pathname) ? 87000 : 100000, duration: 4500 }] });
    json(200, { suggestions: [] });
  });
  await new Promise(r => mock.listen(0, '127.0.0.1', r));
  base = 'http://localhost:3012';
  child = spawn(process.execPath, ['server.mjs'], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, PORT: '3012', SITE_URL: base, MAPBOX_TOKEN: 'test', MAPBOX_API: 'http://127.0.0.1:' + mock.address().port, STRIPE_SECRET_KEY: 'sk_test_dummy', STRIPE_API: 'http://127.0.0.1:9', RESEND_API_KEY: '' },
    stdio: ['ignore', 'pipe', 'inherit']
  });
  process.on('exit', () => child.kill());
  await new Promise((resolve, reject) => { child.stdout.on('data', d => { if (/z-als\.ch on/.test(d)) resolve(); }); child.on('exit', c => reject(new Error('server exited ' + c))); });
}

const browser = await launch();
let fails = 0;
const check = (ok, msg) => { if (!ok) fails++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); };
async function open(path) {
  const ctx = await browser.newContext({ locale: 'en-CH', viewport: { width: 1280, height: 900 } });
  await ctx.route(/\/api\/(enquiry|contact|checkout)(\?|$)/, r => r.abort());
  // Dismiss the consent banner as a visitor would (decline): nothing is sent to Google.
  await ctx.addInitScript(() => { try { localStorage.setItem('zals-consent', JSON.stringify({ a: false, t: Date.now() })); } catch (e) {} });
  const page = await ctx.newPage();
  await page.goto(base + path, { waitUntil: 'load' });
  return { ctx, page };
}
const until = async (fn, ms = 12000) => { const end = Date.now() + ms; let v; while (Date.now() < end) { if ((v = await fn())) return v; await new Promise(r => setTimeout(r, 200)); } return v; };

const day = new Date(Date.parse(todayInZurich()) + 7 * 864e5).toISOString().slice(0, 10);
const quoteUrl = (pickup, dest) => '/quote?trip=oneway&pickup=' + encodeURIComponent(pickup) + '&dest=' + encodeURIComponent(dest) + '&date=' + day + '&time=10:00&pax=2&bags=2';
const CLIENT = ['Zürich, Badenerstrasse 122', 'Basel - St. Johann'];   // the trip from the client's screenshot

try {
  // Wizard: the client's trip gets a fare on the car step.
  {
    const { ctx, page } = await open(quoteUrl(...CLIENT));
    const card = page.locator('.q-cars button:visible', { hasText: 'E-Class' });
    const price = await until(async () => { const t = await card.locator('.q-car-price strong').innerText(); return /CHF/.test(t) && t; });
    check(!!price, `/quote client trip: Business shows a fare (${price || 'none'})`);
    if (local) check(price === 'CHF 522.00', '/quote: 87 km × CHF 6.00 = CHF 522.00');
    // Through to the payment step: card is offered (never pressed).
    await card.click();
    await page.locator('button.q-next[type=submit]:visible').click();
    for (const [n, v] of [['first', 'Test'], ['last', 'Person'], ['phone', '+41 79 000 00 00'], ['email', 'test@example.com']]) await page.locator(`input[name=${n}]:visible`).fill(v);
    await page.locator('button.q-next[type=submit]:visible').click();
    await page.locator('button.q-next[type=submit]:visible').click();
    const cardPay = page.locator('.q-pay:visible', { hasText: 'Visa' });
    await until(async () => (await cardPay.getAttribute('aria-disabled')) === 'false', 6000);
    check((await cardPay.getAttribute('aria-disabled')) === 'false', '/quote step 5: card payment available for the client trip');
    await ctx.close();
  }
  // Another pick-up prices on its own distance.
  {
    const { ctx, page } = await open(quoteUrl('Bern', 'Basel'));
    const t = await until(async () => { const v = await page.locator('.q-cars button:visible', { hasText: 'E-Class' }).locator('.q-car-price strong').innerText(); return /CHF/.test(v) && v; });
    check(!!t, `/quote Bern → Basel shows a fare (${t || 'none'})`);
    if (local) check(t === 'CHF 600.00', '/quote Bern → Basel: 100 km = CHF 600.00, not the Zürich figure');
    await ctx.close();
  }
  // Hero: type the trip, then change the pick-up: the fare follows.
  {
    const { ctx, page } = await open('/');
    const [pickup, dest] = [page.locator('#hero-form input[placeholder="Address, hotel or airport"]'), page.locator('#hero-form input[placeholder="Any city in Switzerland or Central Europe"]')];
    await pickup.fill(CLIENT[0]); await dest.fill(CLIENT[1]); await dest.press('Escape');
    const fareText = () => page.locator('#hero-form').innerText();
    const first = await until(async () => { const m = /CHF ([\d ]+\.\d\d) \+ VAT/.exec(await fareText()); return m && m[1]; });
    check(!!first, `/ hero client trip: fare shown (CHF ${first || '—'})`);
    if (local) check(first === '522.00', '/ hero: CHF 522.00');
    await pickup.fill('Bern'); await pickup.press('Escape');
    const second = await until(async () => { const m = /CHF ([\d ]+\.\d\d) \+ VAT/.exec(await fareText()); return m && m[1] !== first && m[1]; });
    check(!!second, `/ hero: changing the pick-up changes the fare (CHF ${second || 'unchanged'})`);
    await ctx.close();
  }
  // Mapbox down: the fare falls back to dispatch, never hangs on "Calculating".
  if (local) {
    fail = true;
    const { ctx, page } = await open(quoteUrl('Thun', 'Basel'));
    const text = await until(async () => { const v = await page.locator('.q-cars button:visible', { hasText: 'E-Class' }).locator('.q-car-price strong').innerText(); return v === 'On request' && v; }, 15000);
    check(text === 'On request', '/quote with Mapbox down: "On request", not stuck on Calculating');
    await ctx.close();
  }
} finally {
  await browser.close();
  if (child) child.kill();
  if (mock) mock.close();
}
console.log(fails ? `${fails} failed` : 'route e2e ok');
process.exit(fails ? 1 : 0);
