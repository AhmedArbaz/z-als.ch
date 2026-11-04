// The payment portal's API (server.mjs /api/pay): the amount range and field checks, the Checkout Session it asks
// Stripe for, and the emails a paid session sends (dispatch gets the booking reference, the customer never sees it).
// Run: node tools/pay.test.mjs   (starts its own mock Stripe + Resend and a server on :3013; no network)
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { createHmac } from 'node:crypto';

let stripeBody = '';
const mails = [];
const mock = http.createServer((req, res) => {
  let b = '';
  req.on('data', c => { b += c; });
  req.on('end', () => {
    const json = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
    if (req.url === '/v1/checkout/sessions' && req.method === 'POST') {
      stripeBody = b;
      // Stripe refuses TWINT until it is activated in the Dashboard.
      if (new URLSearchParams(b).get('metadata[ref]') === 'no-twint') return json(400, { error: { type: 'invalid_request_error', code: 'payment_intent_invalid_parameter' } });
      return json(200, { id: 'cs_test_1234567890', url: 'https://checkout.example/x' });
    }
    if (req.url === '/emails' && req.method === 'POST') { mails.push(JSON.parse(b)); return json(200, { id: 'm' }); }
    json(404, {});
  });
});
await new Promise(r => mock.listen(0, '127.0.0.1', r));
const MOCK = 'http://127.0.0.1:' + mock.address().port;

const PORT = 3013, BASE = 'http://localhost:' + PORT, SECRET = 'test-signing-secret';
const child = spawn(process.execPath, ['server.mjs'], {
  cwd: new URL('..', import.meta.url),
  env: { ...process.env, PORT: String(PORT), SITE_URL: BASE, STRIPE_API: MOCK, STRIPE_SECRET_KEY: 'test-key', RESEND_API: MOCK, RESEND_API_KEY: 'test-key',
    STRIPE_WEBHOOK_SECRET: SECRET, MAPBOX_TOKEN: '' },
  stdio: ['ignore', 'pipe', 'inherit']
});
process.on('exit', () => child.kill());
await new Promise((resolve, reject) => {
  child.stdout.on('data', d => { if (/z-als\.ch on/.test(d)) resolve(); });
  child.on('exit', code => reject(new Error('server exited ' + code)));
});

const post = (p, body, headers = { 'Content-Type': 'application/json' }) => fetch(BASE + p, { method: 'POST', headers, body: typeof body === 'string' ? body : JSON.stringify(body) });
const good = { amount: '480.00', ref: 'Müller-12.11', name: 'Anna Test', email: 'anna@example.com', method: 'twint', lang: 'de' };

// Refused: out of range, too precise, not a number, unknown method, bad email, no name.
for (const bad of [{ amount: '19.99' }, { amount: '5000.01' }, { amount: '1.234' }, { amount: '480,00' }, { amount: 'abc' }, { amount: -480 },
  { method: 'paypal' }, { email: 'anna@' }, { name: 'A' }]) {
  const r = await post('/api/pay', { ...good, ...bad });
  assert.equal(r.status, 400, 'refused: ' + JSON.stringify(bad));
}
assert.equal((await post('/api/pay', 'amount=480', { 'Content-Type': 'application/x-www-form-urlencoded' })).status, 415, 'JSON only');

// Accepted: the edges and a normal payment.
for (const amount of ['20', 5000, '480.5']) assert.equal((await post('/api/pay', { ...good, amount })).status, 200, 'accepted: ' + amount);
const r = await post('/api/pay', good);
assert.equal(r.status, 200);
assert.equal((await r.json()).url, 'https://checkout.example/x');
const f = new URLSearchParams(stripeBody);
assert.equal(f.get('line_items[0][price_data][unit_amount]'), '48000');
assert.equal(f.get('line_items[0][price_data][currency]'), 'chf');
assert.equal(f.get('payment_method_types[0]'), 'twint');
assert.equal(f.get('metadata[kind]'), 'portal');
assert.equal(f.get('metadata[source]'), 'previous.z-als.ch', 'the status check and webhook accept only this tag');
assert.equal(f.get('metadata[ref]'), 'Müller-12.11');
assert.equal(f.get('locale'), 'de');
assert.equal(f.get('success_url'), BASE + '/pay?paid={CHECKOUT_SESSION_ID}');
assert.equal(f.get('cancel_url'), BASE + '/pay?cancelled=1');
assert.match(f.get('line_items[0][price_data][product_data][description]'), /CHF 35\.97/, 'VAT share of 480 incl. 8.1%');

// TWINT not activated → its own answer, so the page can say "pay by card".
const nt = await post('/api/pay', { ...good, ref: 'no-twint' });
assert.equal(nt.status, 502);
assert.equal((await nt.json()).error, 'twint');

// A signed webhook for that session: dispatch first (with the reference), then the customer (without it).
const event = JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: 'cs_test_portal_0001', payment_status: 'paid', amount_total: 48000,
  metadata: Object.fromEntries([...f].filter(([k]) => k.startsWith('metadata[')).map(([k, v]) => [k.slice(9, -1), v])) } } });
const t = Math.floor(Date.now() / 1000);
const sig = createHmac('sha256', SECRET).update(t + '.' + event).digest('hex');
const wh = await post('/api/stripe/webhook', event, { 'Content-Type': 'application/json', 'Stripe-Signature': `t=${t},v1=${sig}` });
assert.equal(wh.status, 200);
await new Promise(res => setTimeout(res, 300));
const [toDispatch, toCustomer] = mails;
assert.deepEqual(toDispatch.to, ['info@z-als.ch']);
assert.match(toDispatch.subject, /^PAID payment · CHF 480\.00 · Müller-12\.11 · Anna Test$/);
assert.match(toDispatch.text, /via TWINT/);
assert.equal(toDispatch.reply_to, 'anna@example.com');
assert.deepEqual(toCustomer.to, ['anna@example.com']);
assert.match(toCustomer.text, /^Hello Anna,/);
assert.match(toCustomer.text, /CHF 480\.00 incl\. 8\.1% VAT/);
assert.ok(!/Müller/.test(toCustomer.subject + toCustomer.text), 'the typed reference stays out of the customer email');
// A retried webhook never mails anyone twice.
await post('/api/stripe/webhook', event, { 'Content-Type': 'application/json', 'Stripe-Signature': `t=${t},v1=${sig}` });
await new Promise(res => setTimeout(res, 200));
assert.equal(mails.length, 2);

// Booking requests: the customer copy never echoes a message typed as the name, and one inbox gets at most 3 a day,
// however many IPs send them (each XFF value counts as its own client).
const enquiry = { tripType: 'oneway', pickup: 'Zürich Airport · ZRH', dest: 'Davos', date: '2099-01-10', time: '10:00', pax: 2, bags: 2,
  vehicle: 'Business', first: 'Win a prize at evil.example', last: 'X', phone: '+41 79 000 00 00', email: 'victim@example.com', pay: 'driver' };
const sent = [];
for (let i = 0; i < 4; i++) {
  const e = await post('/api/enquiry', enquiry, { 'Content-Type': 'application/json', 'X-Forwarded-For': '203.0.113.' + i });
  assert.equal(e.status, 200);
  sent.push((await e.json()).customerEmailed);
}
assert.deepEqual(sent, [true, true, true, false], 'per-address cap on customer copies');
const copy = mails.filter(m => m.to[0] === 'victim@example.com').at(-1);
assert.match(copy.text, /^Hello,\n/);
assert.ok(!/evil/.test(copy.text), 'the typed "name" stays out of the customer copy');

// Locally the portal is /pay.
const page = await fetch(BASE + '/pay');
assert.equal(page.status, 200);
assert.match(await page.text(), /Pay your booking/);

child.kill(); mock.close();
console.log('pay.test: all checks passed');
