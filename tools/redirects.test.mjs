// Old URLs from the WordPress, z-als.com and Next.js eras: each one must answer with exactly ONE 301 to a page that
// exists (and whose #anchor exists), or 410 for the two retired sections; with and without a trailing slash, with a
// capital letter, with a query string, and on www. The table below is the contract; server.mjs (LEGACY, GONE,
// oldSiteUrl) is what is tested.
//
//   node tools/redirects.test.mjs [base-url] [www-base-url]
//
// Locally the www checks need a second server that believes it is the live site, and send Host: www.z-als.ch to it:
//   PORT=3005 SITE_URL=https://z-als.ch node server.mjs
// Against the live site (base https://z-als.ch) www is requested directly (https://www.z-als.ch).
import http from 'node:http';
import https from 'node:https';

const BASE = (process.argv[2] || 'http://localhost:3002').replace(/\/$/, '');
const local = /^http:\/\/(localhost|127\.0\.0\.1)/.test(BASE);
const WWW = local
  ? { base: (process.argv[3] || 'http://localhost:3005').replace(/\/$/, ''), host: 'www.z-als.ch', origin: 'https://z-als.ch' }
  : { base: (process.argv[3] || BASE.replace('//', '//www.')).replace(/\/$/, ''), host: null, origin: new URL(BASE).origin };

// target -> the old paths that must land on it
const TABLE = {
  '/de/contact': ['/kontakt', '/pages/de/kontakt.php', '/de/kontakt'],
  '/de/services#chauffeur': ['/chauffeur-service'],
  '/de/services': ['/product-category'],
  '/de/fleet#van': ['/vans-und-busse-fuer-gruppenreisen'],
  '/de': ['/limo-service', '/product-category/limo-service', '/de/z-als'],
  '/de/transfers': ['/flughafen-transfer'],
  '/quote?lang=de': ['/buchen', '/de/bestellung'],
  '/de/fleet#rates': ['/preise', '/de/preise'],
  '/legal?lang=de#privacy': ['/datenschutz'],
  '/legal?lang=de#imprint': ['/impressum', '/de/impressum'],
  '/': ['/en/product-category/limo-service', '/en/z-als', '/home', '/ru', '/ru/z-als', '/ar', '/ar/z-als', '/index.php'],
  '/en/transfers': ['/en/flughafen-transfer', '/airport-transportation'],
  '/en/services': ['/services', '/shop', '/en/chauffeur-service', '/en/product-category', '/en/shop'],
  '/en/services#bus': ['/bus-service'],
  '/en/about': ['/about-us'],
  '/en/contact': ['/contact', '/contact-us', '/contact-us-2', '/en/kontakt'],
  '/en/fleet': ['/fleet', '/fleet-of-vehicles', '/variety-of-cars', '/beige-bmw-sedan-5-2013-2'],
  '/en/fleet#business': ['/business-class-executive-chauffeur-service'],
  '/en/fleet#premium': ['/premier-class-luxury-airport-limousine-service'],
  '/en/fleet#suv': ['/suv-class-premium-comfort-for-every-journey'],
  '/en/fleet#van': ['/vans-group-airport-transfer-service', '/mercedes-sprinter-service', '/en/vans-und-busse-fuer-gruppenreisen'],
  '/en/fleet#rates': ['/rates', '/prices', '/best-rates', '/en/preise'],
  '/quote': ['/booking', '/book-now', '/reservation', '/easy-online-booking', '/online-payment', '/transport_booking', '/en/buchen'],
  '/en/journal': ['/transport-in-switzerland', '/reliable-transport-services-in-switzerland', '/transport-network-in-europe',
    '/transportation-in-switzerland-a-complete-guide-for-tourists-and-business-travelers'],
  '/legal#privacy': ['/en/datenschutz'],
  '/sitemap.xml': ['/sitemap_index.xml', '/page-sitemap.xml', '/wp-sitemap.xml'],
};
const GONE = ['/fahrzeug-verkauf', '/finanz-immobilien', '/en/fahrzeug-verkauf', '/en/finanz-immobilien'];
// Next.js-era transfer slugs → the route page of that place (or the language's hub when that language has no page for it)
const ROUTES = [
  ['/en/transfers/luzern', '/en/transfers/zurich-airport-to-lucerne'], ['/en/transfers/zurich-airport-to-luzern', '/en/transfers/zurich-airport-to-lucerne'],
  ['/de/transfers/genf/', '/de/transfers/zurich-airport-to-geneva'], ['/fr/transfers/geneve', '/fr/transfers/zurich-airport-to-geneva'],
  ['/it/transfers/basilea', '/it/transfers/zurich-airport-to-basel'], ['/fr/transfers/saint-moritz', '/fr/transfers/zurich-airport-to-st-moritz'],
  ['/de/transfers/berne', '/de/transfers/zurich-airport-to-bern'], ['/en/transfers/bale', '/en/transfers/zurich-airport-to-basel'],
  ['/it/transfers/lucerna', '/it/transfers'], ['/fr/transfers/luzern', '/fr/transfers'], ['/en/transfers/nowhere', '/en/transfers'],
  ['/en/transfers/zurich-airport-to-davos/opengraph-image', '/en/transfers/zurich-airport-to-davos'],
];
// Rules that predate the table and must not change
const KEPT = [
  ['/en', '/'], ['/en/', '/'], ['/de/', '/de'], ['/index.html', '/'], ['/de/index.html', '/de'], ['/quote.html', '/quote'], ['/en/about/', '/en/about'],
  ['/en/about.html', '/en/about'], ['/en/quote', '/quote?lang=en'], ['/de/legal/privacy', '/legal?lang=de#privacy'], ['/?lang=de', '/de'],
  ['/de/unknown-thing', '/de'], ['/en/booking', '/'], ['/quote/', '/quote'],
];
const SERVE = ['/', '/de', '/fr', '/it', '/quote', '/legal', '/sitemap.xml', '/robots.txt', '/en/about', '/en/transfers', '/en/transfers/zurich-airport-to-davos', '/api/config'];
const MISSING = ['/sample-page', '/wp-admin', '/home-2', '/cart', '/checkout', '/category/uncategorized', '/lisa-meyere', '/wedding-limo-service'];

function get(base, path, { host, method = 'GET' } = {}) {
  const u = new URL(base + path);
  const mod = u.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const req = mod.request(u, { method, headers: { ...(host ? { Host: host } : {}), 'Accept-Encoding': 'identity' }, agent: false }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('timeout ' + path)));
    req.end();
  });
}

const fails = [];
let checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fails.push(msg); console.log('FAIL', msg); } };
const cap = p => '/' + p[1].toUpperCase() + p.slice(2);
const withQuery = (to, q) => { const [b, h] = to.split('#'); return b + (b.includes('?') ? '&' : '?') + q + (h ? '#' + h : ''); };

const answered = new Map(); // target path -> status of the page the redirect lands on (checked once)
async function landing(to) {
  const [noHash, hash] = to.split('#');
  const path = noHash;
  if (!answered.has(path)) answered.set(path, await get(BASE, path));
  const r = answered.get(path);
  return { r, hash };
}

async function expect301(from, to, opts, label = '') {
  const r = await get(opts && opts.base || BASE, from, opts);
  const want = (opts && opts.origin || '') + to;
  ok(r.status === 301 && r.location === want, `${label}${from} -> ${r.status} ${r.location} (want 301 ${want})`);
  return r;
}

for (const [to, froms] of Object.entries(TABLE)) {
  const { r, hash } = await landing(to);
  const [path] = to.split('#');
  ok(r.status === 200, `target ${path} answers ${r.status}, not 200`);
  if (hash) ok(r.body.includes(`id="${hash}"`), `target ${to}: no id="${hash}" on the page`);
  for (const from of froms) {
    await expect301(from, to);
    await expect301(from + '/', to);
    await expect301(from + '.html', to);
    await expect301(cap(from), to);
    await expect301(from, to, { base: WWW.base, host: WWW.host, origin: WWW.origin }, 'www ');
    await expect301(from + '/', to, { base: WWW.base, host: WWW.host, origin: WWW.origin }, 'www ');
  }
}
// The query string rides along, in front of a #fragment
await expect301('/kontakt/?utm_source=gbp', '/de/contact?utm_source=gbp');
await expect301('/buchen?x=1', withQuery('/quote?lang=de', 'x=1'));
await expect301('/preise/?x=1', '/de/fleet?x=1#rates');
await expect301('/impressum?a=1&b=2', '/legal?lang=de&a=1&b=2#imprint');
await expect301('/about-us?gclid=abc', '/en/about?gclid=abc', { base: WWW.base, host: WWW.host, origin: WWW.origin }, 'www ');

for (const g of GONE) for (const p of [g, g + '/', cap(g)]) {
  const r = await get(BASE, p);
  ok(r.status === 410, `${p} -> ${r.status} (want 410)`);
  const h = await get(BASE, p, { method: 'HEAD' });
  ok(h.status === 410, `HEAD ${p} -> ${h.status} (want 410)`);
  const w = await get(WWW.base, p, { host: WWW.host });
  ok(w.status === 410, `www ${p} -> ${w.status} (want 410)`);
}
for (const [from, to] of ROUTES) {
  await expect301(from, to);
  const { r } = await landing(to);
  ok(r.status === 200, `route target ${to} answers ${r.status}`);
}
for (const [from, to] of KEPT) await expect301(from, to);
for (const p of SERVE) { const r = await get(BASE, p); ok(r.status === 200 && !r.location, `${p} -> ${r.status} ${r.location || ''} (want a plain 200)`); }
for (const p of MISSING) { const r = await get(BASE, p); ok(r.status === 404 && !r.location, `${p} -> ${r.status} ${r.location || ''} (want 404)`); }
// www alone: straight to the apex, path and query kept; a POST is never redirected into the table
await expect301('/', '/', { base: WWW.base, host: WWW.host, origin: WWW.origin }, 'www ');
await expect301('/de/?q=1', '/de?q=1', { base: WWW.base, host: WWW.host, origin: WWW.origin }, 'www ');
await expect301('/en/about.html', '/en/about', { base: WWW.base, host: WWW.host, origin: WWW.origin }, 'www ');
await expect301('/en/transfers/luzern/', '/en/transfers/zurich-airport-to-lucerne', { base: WWW.base, host: WWW.host, origin: WWW.origin }, 'www ');

// Request targets that browsers normalise away but other clients send as they are (so no URL object here: it would normalise them too).
// None may crash the server, answer 500, or redirect off the site (a Location starting with // is protocol-relative).
function raw(base, path, host) {
  const u = new URL(base);
  return new Promise(resolve => {
    const req = (u.protocol === 'https:' ? https : http).request({ hostname: u.hostname, port: u.port, path, agent: false, headers: { ...(host ? { Host: host } : {}), 'Accept-Encoding': 'identity' } }, res => {
      res.resume();
      res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location }));
    });
    req.on('error', e => resolve({ error: e.code || e.message }));
    req.setTimeout(15000, () => req.destroy(new Error('timeout')));
    req.end();
  });
}
// [request target, status on the apex]; the www server answers 301 (straight to the apex page) for all of them
const ODD = [
  ['//', 200], ['//?x=1', 200], ['//?utm_source=x&lang=de', 301], ['///', 200], ['//a:99999/', 301], ['//kontakt', 301], ['//en/about', 200],
  ['/%', 404], ['/%zz', 404], ['/%E0%A4%A', 404], ['/a%00b', 404], ['/%00', 404], ['/index.html%00', 404],
  ['/..//evil.example/', 301], ['/.//evil.example/', 301], ['/%2e%2e//evil.example/', 301], ['/..//evil.example.html', 301], ['/..//evil.example/index.html', 301],
];
for (const [label, base, host, www] of [['', BASE, null, false], ['www ', WWW.base, WWW.host, true]]) {
  for (const [p, status] of ODD) {
    const r = await raw(base, p, host);
    // a malformed %-escape never reaches Node on the live site: Traefik answers 400 itself (our server answers 404, or 301 on www)
    const want = /%(?![0-9a-fA-F]{2})/.test(p) ? [400, www ? 301 : 404] : www ? [301] : [status];
    ok(!r.error && want.includes(r.status), `${label}${JSON.stringify(p)} -> ${r.error || r.status} ${r.location || ''} (want ${want.join(' or ')})`);
    // on the apex a redirect is a path starting with ONE slash; on www it goes to the apex origin
    ok(!r.location || (www ? r.location.startsWith(WWW.origin + '/') : /^\/(?!\/)/.test(r.location)), `${label}${JSON.stringify(p)} -> Location ${r.location} leaves the site`);
  }
  const alive = await raw(base, '/', host);
  ok(alive.status === 200 || alive.status === 301, `${label}server did not survive the odd requests: ${alive.error || alive.status}`);
}
const kontakt = await raw(BASE, '//kontakt');
ok(kontakt.location === '/de/contact', `//kontakt -> ${kontakt.location} (want /de/contact)`);

// The payment portal: payments.z-als.ch answers the portal at /, its scripts, assets and API; every other page is the apex's.
// Locally both names are sent to the www-check server (it believes it is the live site).
const PAYS = WWW.host ? { base: WWW.base, host: 'payments.z-als.ch' } : { base: BASE.replace('//', '//payments.'), host: null };
const APEX = WWW.host ? { base: WWW.base, host: 'z-als.ch' } : { base: BASE, host: null };
const portal = await get(PAYS.base, '/', PAYS);
ok(portal.status === 200 && portal.body.includes('Pay your booking'), `payments / -> ${portal.status} (want the portal)`);
for (const p of ['/js/i18n.js', '/api/config', '/assets/pay/twint.svg']) { const r = await get(PAYS.base, p, PAYS); ok(r.status === 200, `payments ${p} -> ${r.status} (want 200)`); }
for (const [from, to] of [['/kontakt', '/de/contact'], ['/en/about', '/en/about'], ['/quote?lang=de', '/quote?lang=de']]) {
  const r = await get(PAYS.base, from, PAYS);
  ok(r.status === 301 && r.location === 'https://z-als.ch' + to, `payments ${from} -> ${r.status} ${r.location} (want 301 https://z-als.ch${to})`);
}
for (const o of [APEX, PAYS]) await expect301('/pay?amount=480', '/?amount=480', { base: o.base, host: o.host, origin: 'https://payments.z-als.ch' }, (o === APEX ? 'apex ' : 'payments '));

console.log(`${checks} checks, ${fails.length} failed`);
if (fails.length) process.exit(1);
