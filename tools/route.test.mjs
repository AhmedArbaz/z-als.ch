// Fares for trips that neither start nor end at Zürich Airport: server.mjs measures the road distance
// (Mapbox Geocoding + Directions) and charges that, never a figure sent by the browser.
// Run: node tools/route.test.mjs   (starts its own mock Mapbox + Stripe and a server on :3011; no network)
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';

await import('../public/js/places.js');
await import('../public/js/fares.js');
const { todayInZurich } = globalThis.ZALS;

let fail = false, stripeBody = '';
const geocoded = [];
const mock = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const json = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
  if (u.pathname === '/v1/checkout/sessions' && req.method === 'POST') {
    let b = ''; req.on('data', c => { b += c; }); req.on('end', () => { stripeBody = b; json(200, { id: 'cs_test_1234567890', url: 'https://checkout.example/x' }); });
    return;
  }
  if (fail) return json(500, {});
  if (u.pathname === '/search/searchbox/v1/forward') {
    const q = u.searchParams.get('q');
    geocoded.push(q);
    // Shaped like live Mapbox answers (2026-10-22), including its wrong guesses for hotel names it reads as streets.
    const feat = (coordinates, feature_type, name, place_formatted, full_address) => ({ geometry: { coordinates }, properties: { feature_type, name, place_formatted, full_address } });
    const f = (...a) => json(200, { features: [feat(...a)] });
    // Towns only (types=…): names come back in German, so Genève is "Genf" and Lucerne "Luzern". Nothing for hotels or streets.
    if (u.searchParams.get('types')) {
      const town = (c, t, n, pf) => json(200, { features: [feat(c, t, n, pf)] });
      const swiss = u.searchParams.get('country') === 'ch';
      // Live, unrestricted: "Lucerne" is a hamlet in Italy and "Genève" a Geneve in Haute-Savoie.
      if (/^lucerne$/i.test(q) && !swiss) return town([7.2, 44.3], 'locality', 'Lucerne', 'Aisone, Provinz Cuneo, Italien');
      if (/^gen(è|e)ve$/i.test(q) && !swiss) return town([6.1, 45.9], 'locality', 'Geneve', 'Annecy, Département Haute-Savoie, Frankreich');
      if (/luzern/i.test(q) && swiss) return town([8.31, 47.05], 'place', 'Luzern', 'Luzern, Schweiz');
      if (/gen(è|e)ve/i.test(q) && swiss) return town([6.14, 46.2], 'place', 'Genf', 'Genf, Schweiz');
      if (/^luzern$/i.test(q)) return town([8.31, 47.05], 'place', 'Luzern', 'Luzern, Schweiz');
      if (/johann/i.test(q)) return town([7.58, 47.56], 'neighborhood', 'St. Johann', 'Basel, Basel-Stadt, Schweiz');
      if (/^(\d{4} )?(basel|bern|thun)$/i.test(q)) return town(/basel/i.test(q) ? [7.58, 47.56] : [8.53, 47.38], 'place', q.replace(/^\d{4} /, ''), 'Schweiz');
      if (/dolder|baur/i.test(q)) return town([8.0, 46.5], 'locality', 'Grandvillard', 'Fribourg, Schweiz');   // a near-miss town: must not be taken
      return json(200, { features: [] });
    }
    // A business listing whose name mentions the town comes first, the town itself second.
    if (q === 'Luzern') return json(200, { features: [feat([8.6, 47.4], 'poi', 'CARE Preventive AG Zürich, Basel, Bern, Luzern', 'Zürich, Schweiz'), feat([8.31, 47.05], 'place', 'Luzern', 'Luzern, Schweiz')] });
    if (/johann/i.test(q)) return json(200, { features: [feat([7.57, 47.57], 'poi', 'PureGym Basel St. Johann', 'Vogesenstrasse 87, 4056 Basel', 'Vogesenstrasse 87, 4056 Basel, Schweiz'), feat([7.58, 47.56], 'neighborhood', 'St. Johann', 'Basel, Basel-Stadt, Schweiz')] });
    // A picked suggestion "POI name, address": Mapbox answers with the bare address, which lacks the hotel's name.
    if (/kurhausstrasse/i.test(q)) return f([8.57, 47.37], 'address', 'Kurhausstrasse 65', '8032 Zürich, Schweiz', 'Kurhausstrasse 65, 8032 Zürich, Schweiz');
    if (/badenerstrasse/i.test(q)) return f([8.53, 47.38], 'address', 'Badenerstrasse 122', '8004 Zürich, Switzerland', 'Badenerstrasse 122, 8004 Zürich, Switzerland');
    if (/basel/i.test(q)) return f([7.58, 47.56], 'place', 'Basel', 'Basel-Stadt, Switzerland');
    if (/baur au lac/i.test(q)) return f([8.539, 47.367], 'poi', 'Baur au Lac', 'Talstrasse 1, 8001 Zürich, Switzerland', 'Talstrasse 1, 8001 Zürich, Switzerland');
    if (/dolder/i.test(q)) return f([7.33, 47.75], 'street', 'Grand\'rue', '68100 Mulhouse, France', 'Grand\'rue, 68100 Mulhouse, France');
    if (/guess/i.test(q)) return f([8.52, 47.37], 'street', 'Londonstrasse', '8000 Zürich, Switzerland', 'Londonstrasse, 8000 Zürich, Switzerland');
    if (/same street/i.test(q)) return f([8.54, 47.37], 'address', q, '8001 Zürich, Switzerland', q + ', 8001 Zürich, Switzerland');
    return f([8.53, 47.38], 'place', q, 'Switzerland');
  }
  if (u.pathname.startsWith('/directions/v5/mapbox/driving/'))
    return json(200, { routes: [/8\.54,47\.37;8\.54,47\.37/.test(u.pathname) ? { distance: 0, duration: 60 } : { distance: 87000, duration: 4500 }] });
  json(404, {});
});
await new Promise(r => mock.listen(0, '127.0.0.1', r));
const MOCK = 'http://127.0.0.1:' + mock.address().port;

const PORT = 3011, BASE = 'http://localhost:' + PORT;
const child = spawn(process.execPath, ['server.mjs'], {
  cwd: new URL('..', import.meta.url),
  env: { ...process.env, PORT: String(PORT), SITE_URL: BASE, MAPBOX_TOKEN: 'test', MAPBOX_API: MOCK, STRIPE_API: MOCK, STRIPE_SECRET_KEY: 'sk_test_dummy', RESEND_API_KEY: '', STRIPE_WEBHOOK_SECRET: '' },
  stdio: ['ignore', 'pipe', 'inherit']
});
const done = () => { child.kill(); mock.close(); };
process.on('exit', () => child.kill());
await new Promise((resolve, reject) => {
  child.stdout.on('data', d => { if (/z-als\.ch on/.test(d)) resolve(); });
  child.on('exit', code => reject(new Error('server exited ' + code)));
});

const get = async p => (await fetch(BASE + p)).json();
const post = (p, body) => fetch(BASE + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const day = new Date(Date.parse(todayInZurich()) + 7 * 864e5).toISOString().slice(0, 10);
const booking = (pickup, dest) => ({ tripType: 'oneway', pickup, dest, date: day, time: '10:00', pax: 2, bags: 2, vehicle: 'Business',
  first: 'Test', last: 'Person', phone: '+41 79 000 00 00', email: 'test@example.com' });

try {
  const measured = await get('/api/route?from=' + encodeURIComponent('Badenerstrasse 122, 8004 Zürich') + '&to=Basel');
  assert.deepEqual([measured.km, measured.t], [87, '1:15']);
  // From or to ZRH the table prices it: no route, no Mapbox call.
  assert.equal(await get('/api/route?from=' + encodeURIComponent('Zürich Airport · ZRH') + '&to=Basel'), null);
  // Basel and Geneva airports use fixed coordinates, never a geocode of the label.
  assert.equal((await get('/api/route?from=' + encodeURIComponent('Basel Airport · BSL') + '&to=' + encodeURIComponent('Zürich HB'))).km, 87);
  assert.ok(!geocoded.some(q => /airport/i.test(q)), 'airport labels were geocoded: ' + geocoded.join(' | '));

  // Checkout charges the server's figure even when the body forges one: 87 km × 6.00 = 522.00 + 8.1% VAT = 564.28.
  const r = await post('/api/checkout', { ...booking('Badenerstrasse 122, 8004 Zürich', 'Basel'), method: 'card', km: 1, route: { km: 1, t: '0:01' }, amount: 1 });
  assert.equal(r.status, 200, await r.clone().text());
  const form = new URLSearchParams(stripeBody);
  assert.equal(form.get('line_items[0][price_data][unit_amount]'), '56428');
  assert.match(form.get('line_items[0][price_data][product_data][name]'), /^Transfer Badenerstrasse 122, 8004 Zürich → Basel/);
  // Dispatch sees what was measured, so a wrong geocode can be caught before the trip.
  assert.equal(form.get('metadata[km]'), '87');
  assert.equal(form.get('metadata[measured]'), 'Badenerstrasse 122, 8004 Zürich, Switzerland → Basel, Schweiz');
  // The client's own wording, town first, and a Basel district both resolve.
  assert.equal((await get('/api/route?from=' + encodeURIComponent('Zürich, Badenerstrasse 122') + '&to=' + encodeURIComponent('Basel - St. Johann'))).km, 87);
  // A hotel Mapbox knows is priced from where it is.
  const hotel = await get('/api/route?from=' + encodeURIComponent('Hotel Baur au Lac') + '&to=Basel');
  assert.match(hotel.from, /^Baur au Lac, Talstrasse 1, 8001 Zürich/);
  // A town or district beats a business listing that merely mentions it.
  assert.equal((await get('/api/route?from=Luzern&to=Basel')).from, 'Luzern, Luzern, Schweiz');
  // A town typed in another language, which the site's directory knows, is that town (not its canton's centre).
  assert.equal((await get('/api/route?from=Lucerne&to=Basel')).from, 'Luzern, Luzern, Schweiz');
  assert.equal((await get('/api/route?from=' + encodeURIComponent('Genève') + '&to=Basel')).from, 'Genf, Genf, Schweiz');
  assert.equal((await get('/api/route?from=Geneva&to=Bern')).from, 'Genf, Genf, Schweiz');
  assert.match((await get('/api/route?from=Bern&to=' + encodeURIComponent('Basel - St. Johann'))).to, /^St\. Johann, Basel/);
  // A picked "Hotel, street, town" suggestion is measured from its address when Mapbox doesn't return the hotel.
  const picked = await get('/api/route?from=' + encodeURIComponent('The Dolder Grand, Kurhausstrasse 65, 8032 Zürich, Switzerland') + '&to=Basel');
  assert.equal(picked && picked.from, 'Kurhausstrasse 65, 8032 Zürich, Schweiz');
  // A match that lacks words the customer typed is a guess, never a fixed fare: "Dolder Grand" → a Grand'rue in Mulhouse.
  assert.equal(await get('/api/route?from=' + encodeURIComponent('Dolder Grand') + '&to=Basel'), null);
  assert.equal(await get('/api/route?from=' + encodeURIComponent('Guess Street 1') + '&to=Basel'), null);
  // Two addresses at the same point still price (1 km → the class minimum), never "quoted by dispatch".
  assert.equal((await get('/api/route?from=Same Street 1&to=Same Street 2')).km, 1);
  // The rate limit keys on the hop the proxy added (the last), not one the client can make up (the first).
  let limited = false;
  for (let i = 0; i < 305 && !limited; i++)
    limited = (await fetch(BASE + '/api/route?from=Bern&to=' + encodeURIComponent('Zürich Airport · ZRH'), { headers: { 'X-Forwarded-For': '10.0.0.' + i + ', 203.0.113.9' } })).status === 429;
  assert.ok(limited, 'a changing first X-Forwarded-For hop bypassed the limit');

  // Mapbox down: no route, and online payment refuses (dispatch quotes it).
  fail = true;
  assert.equal(await get('/api/route?from=Bern&to=Thun'), null);
  assert.equal((await post('/api/checkout', { ...booking('Bern', 'Thun'), method: 'card' })).status, 400);
  // The measured route is cached, so a price shown before an outage is still charged.
  assert.equal((await post('/api/checkout', { ...booking('Badenerstrasse 122, 8004 Zürich', 'Basel'), method: 'card' })).status, 200);
  console.log('route ok');
} finally {
  done();
}
