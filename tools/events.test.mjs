// Walks the booking wizard and the link helpers and checks the dataLayer events GTM will map to GA4.
//   node tools/events.test.mjs [base-url]
// Stubs /api/enquiry|contact|checkout, so nothing is sent or emailed, and never opens WhatsApp for real.
import { launch } from './pw.mjs';

const base = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const browser = await launch();
let fails = 0;
const check = (ok, msg) => { if (!ok) fails++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); };

const day = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-CH' });
await ctx.route(/\/api\/(enquiry|contact|checkout)(\?|$)/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"customerEmailed":false}' }));
await ctx.route(/wa\.me|googletagmanager|google-analytics/, r => r.abort());
await ctx.addInitScript(() => { try { localStorage.setItem('zals-consent', JSON.stringify({ a: false, t: Date.now() })); } catch (e) {} });
const page = await ctx.newPage();
const events = () => page.evaluate(() => (window.dataLayer || []).filter(x => x && !x.length && x.event).map(x => JSON.parse(JSON.stringify(x))));

const q = new URLSearchParams({ trip: 'oneway', pickup: 'Zürich Airport · ZRH', dest: 'Davos', date: day, time: '10:30', pax: '2', bags: '2', utm_source: 'test', gclid: 'abc' });
await page.goto(`${base}/quote?${q}`, { waitUntil: 'load' });
await page.waitForTimeout(800);
check(/utm_source=test/.test(page.url()) && /gclid=abc/.test(page.url()) && !/trip=/.test(page.url()), 'campaign parameters survive, wizard parameters are stripped: ' + page.url().replace(base, ''));
let ev = await events();
check(ev.some(e => e.event === 'quote_start' && e.prefilled === true), 'quote_start (prefilled)');

await page.locator('.q-cars button').first().click();
await page.locator('button.q-next[type=submit]:visible').click();
await page.waitForTimeout(300);
await page.fill('input[name=first]:visible', 'Test');
await page.fill('input[name=last]:visible', 'Tester');
await page.fill('input[name=phone]:visible', '+41 79 000 00 00');
await page.fill('input[name=email]:visible', 'test@example.com');
await page.locator('button.q-next[type=submit]:visible').click();
await page.waitForTimeout(300);
await page.locator('button.q-next[type=submit]:visible').click();
await page.waitForTimeout(300);
ev = await events();
const steps = ev.filter(e => e.event === 'quote_step').map(e => e.step);
check(steps.join() === '3,4,5', `quote_step events for steps 3,4,5; step 2 is quote_start's step (got ${steps.join()})`);

// Pay the chauffeur => generate_lead (the enquiry endpoint is stubbed).
await page.getByText('Pay the chauffeur', { exact: false }).first().click().catch(() => {});
await page.locator('button.q-next[type=button]:visible').click();
await page.waitForTimeout(800);
ev = await events();
const lead = ev.find(e => e.event === 'generate_lead');
check(!!lead && lead.method === 'driver' && lead.currency === 'CHF' && lead.value > 0, 'generate_lead (driver) with value ' + JSON.stringify(lead));
check(!JSON.stringify(ev).match(/test@example|Tester|\+41 79/), 'no personal data in any event');

// Links on a restored page.
await page.goto(`${base}/en/contact`, { waitUntil: 'load' });
await page.evaluate(() => { document.addEventListener('click', e => e.preventDefault(), true); });
for (const [sel, name] of [['a[href^="tel:"]', 'phone_click'], ['a[href^="mailto:"]', 'email_click']]) {
  const a = page.locator(sel).first();
  if (await a.count()) { await a.click({ force: true }); }
  const got = (await events()).some(e => e.event === name);
  check(got, `${name} on /en/contact`);
}
await browser.close();
console.log(fails ? `\n${fails} check(s) failed` : '\nall checks passed');
process.exit(fails ? 1 : 0);
