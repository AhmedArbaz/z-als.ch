// z-als.ch (formerly new.z-als.ch and previous.z-als.ch): serves public/ and creates Stripe Checkout sessions (card or TWINT),
// emails every booking to dispatch, and a confirmation to the customer, through Resend, and emails the Contact
// pages' messages to dispatch. Paid bookings reach dispatch through Stripe's webhook as well as the return page.
//
//   node server.mjs            PORT (default 3002), SITE_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
//                              RESEND_API_KEY, NOTIFY_TO, NOTIFY_FROM, MAPBOX_TOKEN
//
// No dependencies. The Stripe and Resend secrets only ever live in the
// environment (the Dokploy panel in production); the browser never sees them.
// Every amount is recomputed here from public/js/fares.js, never taken from the request.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, 'public');
await import(new URL('./public/js/places.js', import.meta.url));
await import(new URL('./public/js/fares.js', import.meta.url));
const { CARS, AIRPORTS, MIN_HOURS, MAX_HOURS, fromZRH, needsRoute, quoteFor, todayInZurich } = globalThis.ZALS;
const { fold, resolvePlace, exactCity } = globalThis.ZALS_PLACES;
// Stripe's ceiling for a single TWINT payment.
const TWINT_MAX_CHF = 5000;
const DISPATCH_PHONE = '+41 76 272 0909';

const PORT = Number(process.env.PORT) || 3002;
const SITE_URL = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';
// The signing secret (whsec_…) of the Stripe webhook destination https://z-als.ch/api/stripe/webhook.
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
// Only overridden by the test harness, which points it at a local mock.
const STRIPE_API = (process.env.STRIPE_API || 'https://api.stripe.com').replace(/\/$/, '');
const RESEND_KEY = process.env.RESEND_API_KEY || '';
const RESEND_API = (process.env.RESEND_API || 'https://api.resend.com').replace(/\/$/, '');
const NOTIFY_TO = process.env.NOTIFY_TO || 'info@z-als.ch';
const NOTIFY_FROM = process.env.NOTIFY_FROM || 'Z-ALS Bookings <bookings@z-als.ch>';
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN || '';
const MAPBOX_API = (process.env.MAPBOX_API || 'https://api.mapbox.com').replace(/\/$/, '');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};
const HEADERS = {
  // No includeSubDomains: mail.z-als.ch is still served over plain HTTP by the old host.
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

function send(res, status, body, type = 'application/json') {
  res.writeHead(status, { ...HEADERS, 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

function redirect(res, location) {
  res.writeHead(301, { ...HEADERS, Location: location, 'Cache-Control': 'no-cache' });
  res.end();
}

/* Three sites lived on this domain before this one, and search engines still know their URLs:
   - the WordPress sites (2024-26: German at the root, English under /en, then an English rebuild with new slugs);
     their paths (/kontakt, /services, /vans-und-busse-fuer-gruppenreisen ...) are the LEGACY table below;
   - the z-als.com-era paths (/de/z-als, /pages/de/kontakt.php), also in LEGACY;
   - the Next.js site under /en, /de, /fr and /it (148 indexed URLs). Its About, Services, Fleet, Contact
     and Journal pages are restored as static files at the same paths (public/<lang>/..., harvested by
     tools/harvest/); they are served as they are. Its transfer routes go to the route page of the same
     place when there is one, else the language's hub; any other leftover lands on the homepage.
   Every legacy URL answers with exactly one 301 (destination() below), whatever its slash, case or host. */
const LEGACY = new Map(Object.entries({
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
  // /services was German on WordPress v1/v2 and English on v3; the English site is the one search engines saw last.
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
}).flatMap(([to, from]) => from.map(f => [f, to])));
// Two WordPress sections with no equivalent here (vehicle sales, finance and real estate): gone for good, not the homepage.
const GONE = new Set(['/fahrzeug-verkauf', '/finanz-immobilien', '/en/fahrzeug-verkauf', '/en/finanz-immobilien']);
// Old transfer-route slugs by place name, in the four languages, to the slug the route pages use.
const ROUTE_ALIAS = { luzern: 'lucerne', lucerna: 'lucerne', genf: 'geneva', geneve: 'geneva', ginevra: 'geneva', berne: 'bern', berna: 'bern',
  bale: 'basel', basilea: 'basel', 'saint-moritz': 'st-moritz' };
const CANON_HOST = new URL(SITE_URL).host;
// The payment portal (design/Pay.dc.html): payments.z-als.ch live, /pay on localhost.
const PAY_HOST = CANON_HOST.endsWith('z-als.ch') ? 'payments.' + CANON_HOST : '';
const PAY_URL = PAY_HOST ? 'https://' + PAY_HOST + '/' : SITE_URL + '/pay';
const RESTORED = new Set(fs.readdirSync(PUBLIC, { recursive: true })
  .map(f => '/' + String(f).replace(/\\/g, '/'))
  .filter(f => /^\/(en|de|fr|it)\/.+\.html$/.test(f) && !/\/index\.html$/.test(f))
  .map(f => f.slice(0, -'.html'.length)));
// The language homepages (public/<lang>/index.html, built from the Main board) live at /de, /fr and /it;
// English is the root, so /en goes there.
const HOMES = new Set(['de', 'fr', 'it'].filter(l => fs.existsSync(path.join(PUBLIC, l, 'index.html'))).map(l => '/' + l));
// A redirect keeps the visitor's query string (utm_*, gclid ...); a target that has its own query gets it appended.
const withQuery = (target, search) => {
  if (!search) return target;
  const [base, hash] = target.split('#');
  return base + (base.includes('?') ? '&' + search.slice(1) : search) + (hash ? '#' + hash : '');
};
function oldSiteUrl(pathname) {
  if (RESTORED.has(pathname) || HOMES.has(pathname)) return null;
  if (pathname === '/en' || pathname === '/en/') return '/';
  if (/^\/(de|fr|it)\/$/.test(pathname) && HOMES.has(pathname.slice(0, -1))) return pathname.slice(0, -1);
  const m = pathname.match(/^\/(en|de|fr|it)(?:\/([^/]+)(?:\/([^/]+))?)?(?:\/.*)?$/);
  if (!m) return null;
  const [, lang, section, sub] = m;
  // Trailing slashes, extra segments (…/opengraph-image) and unknown articles: the nearest restored page.
  if (section === 'journal' && sub && RESTORED.has(`/${lang}/journal/${sub}`)) return `/${lang}/journal/${sub}`;
  if (section === 'transfers' && sub) {
    const place = sub.replace(/^zurich-airport-to-/, '');
    const route = `/${lang}/transfers/zurich-airport-to-${ROUTE_ALIAS[place] || place}`;
    if (RESTORED.has(route)) return route;
  }
  if (section && RESTORED.has(`/${lang}/${section}`)) return `/${lang}/${section}`;
  if (section === 'quote') return `/quote?lang=${lang}`;
  if (section === 'legal') return `/legal?lang=${lang}${/^(imprint|privacy|terms)$/.test(sub || '') ? '#' + sub : ''}`;
  return HOMES.has('/' + lang) ? '/' + lang : lang === 'en' ? '/' : `/?lang=${lang}`;
}

/** Where a GET for `pathname` goes: 410 (gone for good), a path to 301 to (with #fragment or ?query of its own), or null = serve it as it is.
 *  One URL per page, in one hop: the WordPress-era table first (with or without a trailing slash, any case),
 *  then the slash, `.html` and old-site rules, so a legacy URL never takes two redirects to land. */
function destination(pathname) {
  if (pathname.startsWith('/api/')) return null;
  // The table is matched without trailing slash, `.html` and case, so /kontakt, /Kontakt/ and /kontakt.html all take the one hop.
  const key = pathname.toLowerCase().replace(/\/+$/, '').replace(/\.html$/, '').replace(/\/+$/, '') || '/';
  if (GONE.has(key)) return 410;
  if (LEGACY.has(key)) return LEGACY.get(key);
  // /quote/, /en/about/ and /en/transfers/zurich-airport-to-davos/ are the same pages without the slash; /en is the root.
  let p = pathname.length > 1 ? pathname.replace(/\/+$/, '') || '/' : pathname;
  // /index.html, /quote.html, /en/about.html and /de/index.html are the same pages as /, /quote ...
  if (/\.html$/.test(p) && p !== '/404.html') p = p.slice(0, -'.html'.length).replace(/\/index$/, '') || '/';
  return oldSiteUrl(p) || (p !== pathname ? p : null);
}

// A missing page gets the site's own 404 page, read once; plain text if the file isn't there.
const NOT_FOUND = (() => { try { return fs.readFileSync(path.join(PUBLIC, '404.html'), 'utf8'); } catch { return 'Not found'; } })();

// Text files are compressed once per version and kept in memory (public/ is small and read-only at runtime).
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.svg', '.xml', '.txt', '.json']);
const packed = new Map();
function pack(file, st, enc) {
  const key = `${enc}:${file}:${st.mtimeMs}:${st.size}`;
  if (!packed.has(key)) {
    const raw = fs.readFileSync(file);
    packed.set(key, enc === 'br' ? zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9 } }) : zlib.gzipSync(raw, { level: 9 }));
  }
  return packed.get(key);
}

function serveStatic(req, res, pathname) {
  // A malformed %-sequence or a NUL byte is a path that does not exist, not a server error.
  let rel;
  try { rel = decodeURIComponent(pathname); } catch { return send(res, 404, NOT_FOUND, 'text/html; charset=utf-8'); }
  if (rel.includes('\0')) return send(res, 404, NOT_FOUND, 'text/html; charset=utf-8');
  if (rel.endsWith('/')) rel += 'index.html';
  let file = path.join(PUBLIC, path.normalize(rel));
  if (!file.startsWith(PUBLIC + path.sep)) return send(res, 404, NOT_FOUND, 'text/html; charset=utf-8');
  if (!path.extname(file) && fs.existsSync(file + '.html')) file += '.html';
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, NOT_FOUND, 'text/html; charset=utf-8');
    const long = pathname.startsWith('/assets/');
    const ext = path.extname(file);
    const accept = String(req.headers['accept-encoding'] || '');
    const enc = COMPRESSIBLE.has(ext) ? (/\bbr\b/.test(accept) ? 'br' : /\bgzip\b/.test(accept) ? 'gzip' : '') : '';
    // A validator lets every revalidation answer 304 instead of re-sending the file.
    const etag = `W/"${st.size.toString(16)}-${Math.round(st.mtimeMs).toString(16)}"`;
    const headers = {
      ...HEADERS,
      'Content-Type': TYPES[ext] || 'application/octet-stream',
      'Cache-Control': long ? 'public, max-age=2592000' : 'no-cache',
      ETag: etag,
      Vary: 'Accept-Encoding'
    };
    if (req.headers['if-none-match'] === etag) { res.writeHead(304, headers); return res.end(); }
    if (!enc) {
      res.writeHead(200, { ...headers, 'Content-Length': st.size });
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(file).pipe(res);
    }
    const body = pack(file, st, enc);
    res.writeHead(200, { ...headers, 'Content-Encoding': enc, 'Content-Length': body.length });
    res.end(req.method === 'HEAD' ? undefined : body);
  });
}

// ── Checkout ────────────────────────────────────────────────────────────────

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const int = v => (Number.isInteger(Number(v)) && String(v).trim() !== '' ? Number(v) : NaN);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const oneLine = v => v.replace(/\s+/g, ' ');

/* Sanitises and validates a wizard booking of any trip type. Returns { booking, car, problems }. */
function readBooking(b) {
  const tripType = ['oneway', 'return', 'hourly'].includes(b.tripType) ? b.tripType : null;
  const booking = {
    tripType,
    pickup: oneLine(str(b.pickup, 240)), dest: tripType === 'hourly' ? '' : oneLine(str(b.dest, 240)), hours: int(b.hours),
    date: str(b.date, 10), time: str(b.time, 5), returnDate: str(b.returnDate, 10), returnTime: str(b.returnTime, 5),
    pax: int(b.pax), bags: int(b.bags), vehicle: str(b.vehicle, 20),
    first: oneLine(str(b.first, 60)), last: oneLine(str(b.last, 60)), phone: str(b.phone, 40), email: str(b.email, 120),
    flight: str(b.flight, 20), sign: str(b.sign, 60), childSeats: int(b.childSeats) || 0, notes: str(b.notes, 400),
    method: ['card', 'twint'].includes(b.method) ? b.method : null,
    pay: ['driver', 'whatsapp'].includes(b.pay) ? b.pay : ''
  };
  const car = CARS.find(c => c.key === booking.vehicle);
  const dateOk = s => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
  const timeOk = s => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
  const problems = [];
  if (!tripType) problems.push('trip');
  if (!booking.pickup) problems.push('pickup');
  if (tripType === 'hourly' ? !(booking.hours >= MIN_HOURS && booking.hours <= MAX_HOURS) : !booking.dest) problems.push('dest');
  if (!dateOk(booking.date) || booking.date < todayInZurich()) problems.push('date');
  if (!timeOk(booking.time)) problems.push('time');
  if (tripType === 'return' && (!dateOk(booking.returnDate) || booking.returnDate < booking.date || !timeOk(booking.returnTime))) problems.push('return');
  if (!(booking.pax >= 1 && booking.pax <= 16)) problems.push('pax');
  if (!(booking.bags >= 0 && booking.bags <= 16)) problems.push('bags');
  if (!car || car.seats < booking.pax || car.cases < booking.bags) problems.push('vehicle');
  if (!booking.first || !booking.last) problems.push('name');
  if (booking.phone.replace(/\D/g, '').length < 7) problems.push('phone');
  if (!EMAIL.test(booking.email)) problems.push('email');
  return { booking, car, problems };
}

/* The one place a booking is priced on the server: a trip off the ZRH table is measured here, never taken from the request. */
async function quoteBooking(b) {
  const route = needsRoute(b) ? await routeBetween(b.pickup, b.dest) : undefined;
  const fare = quoteFor({ tripType: b.tripType, pickup: b.pickup, dest: b.dest, hours: b.hours, vehicle: b.vehicle, route });
  // What Mapbox resolved, so dispatch can spot a wrong match before the trip.
  return fare && route ? { ...fare, measured: route.from + ' → ' + route.to } : fare;
}

/* Validates the booking and prices it for online payment. Returns { booking, fare, car } or { error }. */
async function priceBooking(b) {
  if (!['oneway', 'return'].includes(b.tripType)) return { error: 'Only one-way and return transfers can be paid online.' };
  const { booking, car, problems } = readBooking(b);
  if (!booking.method) problems.unshift('method');
  if (problems.length) return { error: 'Invalid booking: ' + problems.join(', ') };

  const fare = await quoteBooking(booking);
  if (!fare || fare.kind !== 'fixed') return { error: 'This route is quoted by dispatch and cannot be paid online yet.' };
  if (booking.method === 'twint' && fare.gross > TWINT_MAX_CHF) return { error: 'TWINT is limited to CHF 5,000 per payment. Please pay by card.' };
  return { booking, fare, car };
}

// ── Email to dispatch ───────────────────────────────────────────────────────

const chf = n => 'CHF ' + Number(n).toFixed(2);
const TRIP = { oneway: 'One way', return: 'Return', hourly: 'Hourly' };

/* The booking as dispatch reads it, in the order of the wizard's WhatsApp message. */
function bookingText(b, car, payLine, fare) {
  const L = ['New booking request from z-als.ch', ''];
  L.push('Trip: ' + TRIP[b.tripType]);
  L.push('Pick-up: ' + b.pickup);
  L.push(b.tripType === 'hourly' ? 'Duration: ' + b.hours + ' hours' : 'Destination: ' + b.dest);
  L.push('Date: ' + b.date + ' at ' + b.time);
  if (b.tripType === 'return') L.push('Return: ' + b.returnDate + ' at ' + b.returnTime);
  L.push('Passengers: ' + b.pax + ' · Luggage: ' + b.bags);
  L.push('Vehicle: ' + car.name + ' (' + car.model + ')');
  L.push('Fare: ' + (fare ? chf(fare.net) + ' ' + fare.note + ' · total ' + chf(fare.gross) + ' incl. VAT' : 'to be quoted by dispatch'));
  if (fare && fare.km) L.push('Distance: ' + fare.km + ' km' + (fare.measured ? ' (measured by Mapbox: ' + fare.measured + ')' : ''));
  L.push(payLine, '');
  L.push('Name: ' + b.first + ' ' + b.last);
  L.push('Mobile: ' + b.phone);
  L.push('Email: ' + b.email);
  if (b.flight) L.push('Flight: ' + b.flight);
  if (b.sign) L.push('Name sign: ' + b.sign);
  if (b.childSeats) L.push('Child seats: ' + b.childSeats);
  if (b.notes) L.push('Notes: ' + b.notes);
  L.push('', 'Reply to this email to answer the customer.');
  return L.join('\n');
}

/* Never throws: a failed email must not block the customer's next step. To dispatch unless `to` is given. */
async function notify(subject, text, replyTo, to = NOTIFY_TO) {
  if (!RESEND_KEY) { console.log('email off (no RESEND_API_KEY):', subject.split(' · ')[0]); return false; }
  try {
    const r = await fetch(RESEND_API + '/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: NOTIFY_FROM, to: [to], subject, text, reply_to: replyTo || undefined })
    });
    if (r.ok) return true;
    // Log Resend's error name only: its message can echo request fields.
    const j = await r.json().catch(() => ({}));
    console.error('resend', r.status, j.name);
  } catch (e) {
    console.error('resend unreachable', e && e.cause && e.cause.code);
  }
  return false;
}

/* The confirmation the customer receives. Built from fixed fields only: the free-text notes and
   name sign stay out, so the form can't be used to mail arbitrary text to arbitrary addresses.
   The address fields are still typed by the visitor, so links in them are removed. */
const noLinks = v => String(v).replace(/(?:https?:\/\/|www\.)\S*/gi, '[link removed]');
function customerText(first, rows, payLines) {
  // Only a plausible name is echoed, so the greeting can't carry a message to whoever's address was typed.
  const L = [/^(?=.{1,30}$)[\p{L}\p{M}'-]+(?: [\p{L}\p{M}'-]+)?$/u.test(first) ? 'Hello ' + first + ',' : 'Hello,', '', 'Thank you for booking with Z-ALS. Here are your details:', ''];
  for (const [k, v] of rows) if (v) L.push(k + ': ' + v);
  L.push('', ...payLines, '');
  L.push('Questions or changes? Reply to this email, or call or WhatsApp dispatch on ' + DISPATCH_PHONE + ', day or night.');
  L.push('', 'Z-ALS · Zurich Airport Limousine Service');
  return L.join('\n');
}

/* "Pay the chauffeur" and "Book via WhatsApp": the wizard's last step posts here. Dispatch and
   the customer each get an email; the WhatsApp path also opens WhatsApp in the browser. A booking dispatch
   didn't get answers 502, so the page never says "sent" for a request that went nowhere. `update: true`
   marks a corrected copy of a request that already arrived. */
async function createEnquiry(body, ip) {
  const { booking: b, car, problems } = readBooking(body);
  if (problems.length) return [400, { error: 'Invalid booking: ' + problems.join(', ') }];
  const route = b.tripType === 'hourly' ? b.pickup + ' · ' + b.hours + ' hrs' : b.pickup + ' → ' + b.dest;
  const fare = await quoteBooking(b);
  const payLine = {
    driver: 'Payment: pay the chauffeur (cash, card or TWINT in the car)',
    whatsapp: 'Payment: to arrange with the customer on WhatsApp (not paid yet)'
  }[b.pay] || 'Payment: not chosen yet (the customer continued on WhatsApp)';
  const tag = b.pay === 'whatsapp' ? 'WHATSAPP · ' : b.pay === 'driver' ? 'CHAUFFEUR · ' : '';
  const emailed = await notify((body.update === true ? 'UPDATE · ' : '') + 'New booking · ' + tag + oneLine(route) + ' · ' + b.date + ' ' + b.time + ' · ' + oneLine(b.first + ' ' + b.last),
    bookingText(b, car, payLine, fare), b.email);
  if (!emailed) return [502, { error: 'Not sent' }];

  // A tighter cap than the endpoint's: each customer copy goes to an address the visitor typed.
  // Per address too: rotating IPs must not turn the form into a mailer aimed at one inbox.
  if (limited(ip, customerMails, 3) || limited(b.email.toLowerCase(), recipients, 3, 24 * 3600 * 1000)) return [200, { ok: true, emailed, customerEmailed: false }];
  const rows = [['Trip', TRIP[b.tripType]], ['Pick-up', noLinks(b.pickup)],
    b.tripType === 'hourly' ? ['Duration', b.hours + ' hours'] : ['Destination', noLinks(b.dest)],
    ['Date', b.date + ' at ' + b.time], ['Return', b.tripType === 'return' ? b.returnDate + ' at ' + b.returnTime : ''],
    ['Passengers', String(b.pax)], ['Luggage', String(b.bags)], ['Vehicle', car.name + ' (' + car.model + ')'],
    ['Fare', fare ? chf(fare.gross) + ' incl. 8.1% VAT (' + chf(fare.net) + ' + ' + chf(fare.gross - fare.net) + ' VAT)' : 'quoted by dispatch']];
  const pay = b.pay === 'driver'
    ? ['Payment: you pay the chauffeur at the end of the journey, by cash, card or TWINT.', 'Dispatch confirms your chauffeur personally, by email or WhatsApp.']
    : ['Our team will contact you on WhatsApp to confirm your chauffeur and arrange payment.'];
  const customerEmailed = await notify('Your Z-ALS booking request · ' + b.date + ' ' + b.time, customerText(noLinks(b.first), rows, pay), NOTIFY_TO, b.email);
  return [200, { ok: true, emailed, customerEmailed }];
}

/* The restored Contact pages' form (public/js/old-site.js): a message to dispatch only, Reply-To the visitor.
   No copy goes to the address typed in, so the form can't mail arbitrary text to arbitrary people. */
async function createContact(b) {
  // A hidden field only a bot fills in: answer as if sent, send nothing.
  if (str(b.zals_hp, 200)) return [200, { ok: true }];
  const c = {
    name: oneLine(str(b.name, 120)), email: str(b.email, 254), phone: str(b.phone, 32), subject: oneLine(str(b.subject, 80)),
    message: str(b.message, 2000), lang: ['en', 'de', 'fr', 'it'].includes(b.lang) ? b.lang : 'en'
  };
  if (!c.name || !EMAIL.test(c.email) || !c.message) return [400, { error: 'Invalid message' }];
  const L = ['New message from the z-als.ch contact form', '', 'Name: ' + c.name, 'Email: ' + c.email];
  if (c.phone) L.push('Phone: ' + c.phone);
  L.push('Subject: ' + (c.subject || '—'), 'Language: ' + c.lang.toUpperCase(), '', c.message, '', 'Reply to this email to answer.');
  const ok = await notify('New enquiry · ' + (c.subject || 'Contact') + ' · ' + c.name, L.join('\n'), c.email);
  return ok ? [200, { ok: true }] : [502, { error: 'Not sent' }];
}

// ponytail: in-memory, so a redeploy forgets which sessions were emailed. Stripe only retries a webhook
// that failed, and the return page only sends for sessions under an hour old, so a repeat is rare.
const emailedSessions = new Set(), sendingPaid = new Map();

/* A paid Checkout Session (card or TWINT), emailed to dispatch and then to the customer from
   Stripe's own metadata rather than anything the browser sends. Resolves true once dispatch has it.
   The customer copy goes only after that, so a retried webhook never mails the customer twice, and
   the webhook and the return page arriving together share one send. */
function notifyPaid(id, amountRp, m) {
  if (emailedSessions.has(id)) return Promise.resolve(true);
  if (!sendingPaid.has(id)) sendingPaid.set(id, sendPaid(id, amountRp, m).finally(() => sendingPaid.delete(id)));
  return sendingPaid.get(id);
}

async function sendPaid(id, amountRp, m) {
  const paid = chf((amountRp || 0) / 100);
  const L = ['PAID booking from z-als.ch', ''];
  const via = m.method === 'twint' ? 'TWINT' : 'card', ref = id.slice(-10).toUpperCase();
  if (m.kind === 'portal') {
    const ok = await notify('PAID payment · ' + paid + ' · ' + (m.ref || 'no reference') + ' · ' + (m.name || ''),
      ['PAID on payments.z-als.ch', '', 'Paid: ' + paid + ' incl. VAT via ' + via + ' · Stripe ref ' + ref, 'Booking reference: ' + (m.ref || '—'),
        'Name: ' + (m.name || ''), 'Email: ' + (m.email || ''), '', 'Reply to this email to answer the customer.'].join('\n'), m.email);
    if (!ok) return false;
    emailedSessions.add(id);
    // The booking reference is typed by the customer, so it stays out of their copy (fixed fields only).
    if (m.email) notify('Your payment to Z-ALS is received · ' + paid,
      customerText(noLinks((m.name || '').split(' ')[0]), [['Amount', paid + ' incl. 8.1% VAT'], ['Paid by', via], ['Payment reference', ref]],
        ['Stripe emails your receipt.', 'Dispatch has your payment and confirms your chauffeur personally.']), NOTIFY_TO, m.email);
    return true;
  }
  L.push('Paid: ' + paid + ' incl. VAT via ' + via + ' · Stripe ref ' + ref);
  L.push('Trip: ' + (m.trip === 'return' ? 'Return' : 'One way'));
  // Priced distance, so dispatch can spot an address priced as a nearer town (routeFor's comma split).
  if (m.km) L.push('Priced on: ' + m.km + ' km' + (m.measured ? ' (' + m.measured + ')' : ''));
  const rows = [['Pick-up', m.pickup], ['Destination', m.destination], ['When', m.when], ['Passengers', m.passengers], ['Luggage', m.luggage],
    ['Vehicle', m.vehicle], ['', ''], ['Name', m.name], ['Mobile', m.mobile], ['Email', m.email], ['Flight', m.flight], ['Name sign', m.sign],
    ['Child seats', m.child_seats], ['Notes', m.notes]];
  for (const [k, v] of rows) if (!k) L.push(''); else if (v) L.push(k + ': ' + v);
  L.push('', 'Reply to this email to answer the customer.');
  const ok = await notify('PAID booking · ' + paid + ' · ' + (m.pickup || '') + ' → ' + (m.destination || '') + ' · ' + (m.when || '') + ' · ' + (m.name || ''),
    L.join('\n'), m.email);
  if (!ok) return false;
  emailedSessions.add(id);
  if (m.email) {
    const rows = [['Trip', m.trip === 'return' ? 'Return' : 'One way'], ['Pick-up', noLinks(m.pickup || '')], ['Destination', noLinks(m.destination || '')],
      ['When', m.when], ['Passengers', m.passengers], ['Luggage', m.luggage], ['Vehicle', m.vehicle]];
    notify('Your Z-ALS booking is confirmed and paid · ' + (m.when || ''),
      customerText(noLinks((m.name || '').split(' ')[0]), rows, ['Paid: ' + paid + ' incl. 8.1% VAT by ' + via + ' · reference ' + ref + '. Stripe emails your receipt.',
        'Dispatch has your booking and confirms your chauffeur personally.']), NOTIFY_TO, m.email);
  }
  return true;
}

/* Stripe-Signature: t=<unix time>,v1=<hex HMAC-SHA256 of "<t>.<raw body>", keyed with the whsec_… secret as is>,
   possibly several v1 while a secret is rolled. Returns the event, or null for anything unsigned, stale or forged. */
function stripeEvent(raw, header) {
  let t = '';
  const sigs = [];
  for (const part of String(header || '').split(',')) {
    const [k, v = ''] = part.trim().split('=');
    if (k === 't') t = v;
    else if (k === 'v1' && /^[0-9a-f]{64}$/.test(v)) sigs.push(Buffer.from(v, 'hex'));
  }
  if (!/^\d+$/.test(t) || Math.abs(Date.now() / 1000 - Number(t)) > 300) return null;
  const want = createHmac('sha256', WEBHOOK_SECRET).update(t + '.').update(raw).digest();
  if (!sigs.some(sig => timingSafeEqual(sig, want))) return null;
  try { return JSON.parse(raw.toString('utf8')); } catch { return null; }
}

async function stripe(method, endpoint, form) {
  const r = await fetch(STRIPE_API + '/v1/' + endpoint, {
    method,
    headers: { Authorization: 'Bearer ' + STRIPE_KEY, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form ? form.toString() : undefined
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) {
    // Log Stripe's error type only: its message can echo request fields.
    console.error('stripe', endpoint.split('/')[0], r.status, json.error && json.error.type, json.error && json.error.code);
    throw Object.assign(new Error('stripe'), { status: r.status });
  }
  return json;
}

async function createCheckout(body) {
  const { error, booking: b, fare, car } = await priceBooking(body);
  if (error) return [400, { error }];

  const when = b.date + ' ' + b.time + (b.tripType === 'return' ? ' · return ' + b.returnDate + ' ' + b.returnTime : '');
  const title = ((b.tripType === 'return' ? 'Return transfer ' : 'Transfer ') + oneLine(b.pickup) + ' → ' + oneLine(b.dest) + ' · ' + car.name).slice(0, 250);
  const meta = {
    trip: b.tripType, pickup: b.pickup, destination: b.dest, when, passengers: String(b.pax), luggage: String(b.bags),
    vehicle: car.name, name: b.first + ' ' + b.last, mobile: b.phone, email: b.email,
    flight: b.flight, sign: b.sign, child_seats: String(b.childSeats || ''), notes: b.notes,
    fare_net_chf: fare.net.toFixed(2), vat_chf: (fare.gross - fare.net).toFixed(2), km: String(fare.km), measured: fare.measured || '',
    method: b.method, source: 'previous.z-als.ch'
  };

  const put = (f, prefix) => {
    for (const [k, v] of Object.entries(meta)) if (v) f.set(prefix + '[' + k + ']', v.slice(0, 500));
  };

  const f = new URLSearchParams();
  f.set('mode', 'payment');
  f.set('payment_method_types[0]', b.method);
  f.set('line_items[0][quantity]', '1');
  f.set('line_items[0][price_data][currency]', 'chf');
  f.set('line_items[0][price_data][unit_amount]', String(Math.round(fare.gross * 100)));
  f.set('line_items[0][price_data][product_data][name]', title);
  f.set('line_items[0][price_data][product_data][description]', when + ' · incl. 8.1% VAT (CHF ' + (fare.gross - fare.net).toFixed(2) + ')');
  f.set('customer_email', b.email);
  f.set('locale', 'auto');
  f.set('success_url', SITE_URL + '/quote?paid={CHECKOUT_SESSION_ID}');
  f.set('cancel_url', SITE_URL + '/quote?cancelled=1');
  f.set('payment_intent_data[description]', title + ' · ' + when);
  put(f, 'metadata');
  put(f, 'payment_intent_data[metadata]');
  try {
    const session = await stripe('POST', 'checkout/sessions', f);
    return [200, { url: session.url }];
  } catch (e) {
    // Stripe answers 400 while TWINT is not activated in the Stripe Dashboard.
    if (b.method === 'twint' && e.status === 400) return [502, { error: "TWINT isn't available online right now. Please pay by card, or book via WhatsApp." }];
    throw e;
  }
}

/* The payment portal: an amount dispatch already agreed with the customer (by phone, WhatsApp or a pay link), paid by
   card or TWINT. Nothing is priced here, so the range is the only check on the amount. */
const PAY_MIN_CHF = 20;
async function createPayment(body) {
  const amount = ['string', 'number'].includes(typeof body.amount) ? String(body.amount).trim() : '';
  const rp = /^\d{1,4}(\.\d{1,2})?$/.test(amount) ? Math.round(Number(amount) * 100) : NaN;
  const p = { name: oneLine(str(body.name, 100)), email: str(body.email, 254), ref: oneLine(str(body.ref, 60)), method: body.method };
  const lang = ['en', 'de', 'fr', 'it'].includes(body.lang) ? body.lang : 'auto';
  if (!(rp >= PAY_MIN_CHF * 100 && rp <= TWINT_MAX_CHF * 100) || !['card', 'twint'].includes(p.method) || p.name.length < 2 || !EMAIL.test(p.email)) {
    return [400, { error: 'Invalid payment' }];
  }
  const gross = rp / 100, vat = gross - gross / (1 + globalThis.ZALS.VAT);
  const title = 'Z-ALS payment' + (p.ref ? ' · ' + p.ref : '');
  const f = new URLSearchParams();
  f.set('mode', 'payment');
  f.set('payment_method_types[0]', p.method);
  f.set('line_items[0][quantity]', '1');
  f.set('line_items[0][price_data][currency]', 'chf');
  f.set('line_items[0][price_data][unit_amount]', String(rp));
  f.set('line_items[0][price_data][product_data][name]', title);
  f.set('line_items[0][price_data][product_data][description]', 'Chauffeur service · incl. 8.1% VAT (' + chf(vat) + ')');
  f.set('customer_email', p.email);
  f.set('locale', lang);
  f.set('success_url', PAY_URL + '?paid={CHECKOUT_SESSION_ID}');
  f.set('cancel_url', PAY_URL + '?cancelled=1');
  f.set('payment_intent_data[description]', title);
  const meta = { kind: 'portal', name: p.name, email: p.email, ref: p.ref, method: p.method, vat_chf: vat.toFixed(2), source: 'previous.z-als.ch' };
  for (const [k, v] of Object.entries(meta)) if (v) { f.set('metadata[' + k + ']', v); f.set('payment_intent_data[metadata][' + k + ']', v); }
  try {
    return [200, { url: (await stripe('POST', 'checkout/sessions', f)).url }];
  } catch (e) {
    // Stripe answers 400 while TWINT is not activated in the Stripe Dashboard.
    if (p.method === 'twint' && e.status === 400) return [502, { error: 'twint' }];
    throw e;
  }
}

/* A card Checkout Session (cs_…). Only this site's own payments are reported, so the
   endpoint can't be used to look up other Stripe payments. */
async function checkoutStatus(id) {
  if (!/^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(id)) return [400, { error: 'Bad payment id' }];
  const s = await stripe('GET', 'checkout/sessions/' + id);
  const [paid, status, amountRp, m] = [s.payment_status === 'paid', s.payment_status, s.amount_total, s.metadata || {}];
  if (m.source !== 'previous.z-als.ch') return [404, { error: 'Not found' }];
  // A fresh return tells dispatch too, in case the webhook is late. With the webhook set up, an old paid URL reopened
  // after a redeploy (which empties emailedSessions) must not send the booking again: the webhook has it. Without
  // the webhook the return page is the only report, so it sends for a day (a customer returns within minutes).
  if (paid && !(s.created && Date.now() / 1000 - s.created > (WEBHOOK_SECRET ? 3600 : 86400))) notifyPaid(id, amountRp, m);
  return [200, { paid, status, amount: (amountRp || 0) / 100, method: m.method || '', ref: id.slice(-10).toUpperCase() }];
}

// ── Address suggestions (Mapbox Search Box, as on swisselitelimousine.ch) ──
// The token stays here; the page only ever sees { name, sub } rows. Any failure answers [],
// and the field falls back to the town directory.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function suggestPlaces(q, session) {
  if (!MAPBOX_TOKEN || q.length < 3) return [];
  const params = new URLSearchParams({
    q, access_token: MAPBOX_TOKEN, session_token: UUID.test(session) ? session : crypto.randomUUID(),
    country: 'ch,de,at,fr,it,gb,es,nl,be,lu,li,ie,pl', language: 'en', limit: '6', proximity: '8.5492,47.4502'
  });
  try {
    const r = await fetch(MAPBOX_API + '/search/searchbox/v1/suggest?' + params, { signal: AbortSignal.timeout(4000) });
    if (!r.ok) { console.error('mapbox suggest', r.status); return []; }
    const seen = new Set();
    return ((await r.json()).suggestions || [])
      .map(x => ({ name: String(x.name || '').slice(0, 80), sub: String(x.place_formatted || x.full_address || '').slice(0, 150) }))
      .filter(x => x.name && !seen.has(x.name + x.sub) && seen.add(x.name + x.sub));
  } catch (e) {
    console.error('mapbox suggest', e && e.name);
    return [];
  }
}

// ── Road distance for trips off the ZRH table (Mapbox Geocoding v6 + Directions) ──
// The page shows it through /api/route and the server measures again before charging, from this cache, so the
// two agree. Airports use fixed points: geocoding their labels could land anywhere. Any failure is null (dispatch).
const AIRPORT_AT = { ZRH: [8.5492, 47.4502], BSL: [7.5292, 47.5896], GVA: [6.1090, 46.2381] };
const ROUTE_TTL = 24 * 3600 * 1000, ROUTE_MAX = 1000, routes = new Map();
const hm = s => { const m = Math.round(s / 300) * 5; return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); };

/* Which of Mapbox's answers to measure from. A match must contain every word the customer typed (folded, so Zürich =
   Zurich; filler like "hotel" or "the" aside): live Mapbox answered "Dolder Grand" with a Grand'rue in Mulhouse and
   "Luzern" with a clinic whose name lists Luzern. Among full matches a town or district wins over a business listing. */
const FILLER = new Set(['hotel', 'the', 'and', 'und', 'der', 'die', 'das', 'les', 'des', 'switzerland', 'schweiz', 'suisse', 'svizzera']);
const PLACE_TYPES = new Set(['place', 'city', 'locality', 'neighborhood', 'district', 'postcode', 'region']);
const words = s => fold(s).split(' ').filter(w => (w.length >= 3 || /^\d+$/.test(w)) && !FILLER.has(w));
function choose(place, features) {
  const usable = features.filter(f => f && f.geometry && Array.isArray(f.geometry.coordinates) && f.properties);
  const isPlace = f => PLACE_TYPES.has(f.properties.feature_type);
  const full = usable.filter(f => {
    const p = f.properties, have = new Set(words([p.name, p.place_formatted, p.full_address].join(' ')));
    return words(place).every(w => have.has(w));
  });
  return full.find(isPlace) || full[0] || null;
}

async function lookup(q, types, country = 'ch,de,at,fr,it,li') {
  const params = new URLSearchParams({ q, access_token: MAPBOX_TOKEN, country, language: 'de', limit: '5', proximity: '8.5492,47.4502' });
  if (types) params.set('types', types);
  const r = await fetch(MAPBOX_API + '/search/searchbox/v1/forward?' + params, { signal: AbortSignal.timeout(4000) });
  if (!r.ok) throw new Error('geocode ' + r.status);
  return (await r.json()).features || [];
}

/* { at: [lng, lat], name } for a place, or null when Mapbox has no match it can stand behind (see choose()).
   Search Box /forward, the product behind the address suggestions: it knows hotels and other places by name. */
async function pointFor(place) {
  if (fromZRH(place)) return { at: AIRPORT_AT.ZRH, name: 'Zürich Airport' };
  const airport = AIRPORTS.find(a => a.name === place);
  if (airport) return { at: AIRPORT_AT[airport.name.slice(-3)], name: airport.name };
  let f = null;
  // No house number: a town the site's directory knows (Lucerne, Genève, Geneva, Zürich HB …) is asked for by its postcode
  // and name in its own country, since by name alone live Mapbox gave a Lucerne in Italy and a Geneve in Haute-Savoie.
  // Other names try towns and districts first, so "Lausanne" is the town, not a listing that mentions it.
  if (!/\d/.test(place)) {
    const known = exactCity(place) || exactCity(resolvePlace(place) || '');
    const towns = known
      ? await lookup(known.zip + ' ' + known.name.replace(/\s*·\s*/g, ' '), 'postcode,place,locality,neighborhood,district', known.cc.toLowerCase())
      : await lookup(place, 'place,locality,neighborhood,district');
    f = known ? towns.find(t => t && t.geometry && Array.isArray(t.geometry.coordinates) && t.properties) || null : choose(place, towns);
  }
  if (!f) f = choose(place, await lookup(place));
  // A picked suggestion "Hotel, street 1, town": Mapbox may answer with the bare address, which lacks the hotel's name.
  const rest = place.split(',').slice(1).join(',').trim();
  if (!f && /\d/.test(rest)) f = choose(rest, await lookup(rest));
  if (!f) return null;
  const p = f.properties;
  const name = p.feature_type === 'poi' || !p.full_address ? [p.name, p.full_address || p.place_formatted].filter(Boolean).join(', ') : p.full_address;
  return { at: f.geometry.coordinates, name: String(name || place).slice(0, 200) };
}

/* { km, t, from, to } (from/to: the places Mapbox resolved, for dispatch to check), or null. Misses are kept a minute,
   so retyping a pair Mapbox can't measure doesn't bill it again. */
async function routeBetween(pickup, dest) {
  if (!MAPBOX_TOKEN || !pickup || !dest || pickup.length > 240 || dest.length > 240) return null;
  const key = fold(pickup) + '|' + fold(dest), hit = routes.get(key);
  if (hit && Date.now() - hit.at < (hit.route ? ROUTE_TTL : 60 * 1000)) return hit.route;
  const keep = route => {
    if (routes.size >= ROUTE_MAX) routes.delete(routes.keys().next().value);
    routes.set(key, { at: Date.now(), route });
    return route;
  };
  try {
    const [a, b] = await Promise.all([pointFor(pickup), pointFor(dest)]);
    if (!a || !b) return keep(null);
    const r = await fetch(MAPBOX_API + '/directions/v5/mapbox/driving/' + a.at.join(',') + ';' + b.at.join(',') + '?overview=false&access_token=' + MAPBOX_TOKEN,
      { signal: AbortSignal.timeout(4000) });
    if (!r.ok) throw new Error('directions ' + r.status);
    const leg = ((await r.json()).routes || [])[0];
    if (!leg || !(leg.distance >= 0)) return keep(null);
    // Two addresses at one point (or under 500 m apart) are still a trip: 1 km, so the class minimum applies.
    return keep({ km: Math.max(1, Math.round(leg.distance / 1000)), t: hm(leg.duration), from: a.name, to: b.name });
  } catch (e) {
    // Outages are not kept: the next ask tries Mapbox again.
    console.error('mapbox route', e && (e.name === 'Error' ? e.message : e.name));
    return null;
  }
}

/* The visitor as Traefik saw them: it appends the connecting address to X-Forwarded-For, so the last hop is real and
   the first is whatever the client sent (a fresh one per request would dodge every limit). */
const clientIp = req => String(req.headers['x-forwarded-for'] || '').split(',').pop().trim() || req.socket.remoteAddress || '';

// A little friction against someone scripting session creation.
const hits = new Map(), typing = new Map(), routes10 = new Map(), statusHits = new Map(), customerMails = new Map(), recipients = new Map();
function limited(ip, map = hits, max = 20, win = 10 * 60 * 1000) {
  const now = Date.now();
  const list = (map.get(ip) || []).filter(t => now - t < win);
  list.push(now);
  map.set(ip, list);
  // Drop the oldest key, never all of them: a clear would let 5,000 fresh addresses reset everyone's limit.
  if (map.size > 5000) map.delete(map.keys().next().value);
  return list.length > max;
}

function readRaw(req, limit = 16 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > limit) {
        // Stop buffering but keep draining, so the 413 reaches the client
        // instead of a reset connection.
        // A promise settles once, so the repeat rejects are no-ops.
        chunks.length = 0;
        reject(Object.assign(new Error('too large'), { status: 413 }));
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJson(req, limit) {
  const raw = await readRaw(req, limit);
  try { return JSON.parse(raw.toString('utf8') || '{}'); }
  catch { throw Object.assign(new Error('bad json'), { status: 400 }); }
}

// ── Router ──────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  // `//` and `//?x=1` make new URL() throw once a base is given, and a throw out here (not inside the try) would take the
  // whole process down: one request line was enough. Leading slashes are collapsed first (`//kontakt` is `/kontakt`, as on
  // Apache and nginx), and anything still unparsable is a 400.
  let url;
  try { url = new URL(req.url.replace(/^\/{2,}/, '/'), 'http://x'); } catch { return send(res, 400, 'Bad request', 'text/plain'); }
  // `/..//host/` resolves to `//host/`: collapse again, so no redirect we send can be protocol-relative (an open redirect).
  url.pathname = url.pathname.replace(/^\/{2,}/, '/');
  try {
    const isRead = req.method === 'GET' || req.method === 'HEAD';
    const dest = isRead ? destination(url.pathname) : null;
    if (dest === 410) return send(res, 410, NOT_FOUND, 'text/html; charset=utf-8');
    // www.z-als.ch (and any other *.z-als.ch name pointed here) answers with the canonical host, straight to the final
    // page (one hop, not www then the old-URL rules); localhost, the sslip host and the container healthcheck (127.0.0.1)
    // are left alone. The first test keeps a missing SITE_URL (localhost) from sending www visitors to localhost.
    const host = String(req.headers.host || '').toLowerCase().replace(/:\d+$/, '');
    // /pay on any of our names is the portal's own address.
    if (isRead && PAY_HOST && url.pathname === '/pay') return redirect(res, PAY_URL + url.search);
    // The payments host answers only the portal, its scripts, assets and the API; any other page is the main site's.
    if (PAY_HOST && host === PAY_HOST) {
      if (isRead && url.pathname === '/') return serveStatic(req, res, '/pay.html');
      if (isRead && !/^\/(api|js|assets)\/|^\/favicon\.ico$/.test(url.pathname)) return redirect(res, SITE_URL + withQuery(dest || url.pathname, url.search));
    } else if (CANON_HOST.endsWith('z-als.ch') && host !== CANON_HOST && host.endsWith('.z-als.ch')) return redirect(res, SITE_URL + withQuery(dest || url.pathname, url.search));
    if (dest) return redirect(res, withQuery(dest, url.search));
    if (isRead && url.pathname === '/404.html') return send(res, 404, NOT_FOUND, 'text/html; charset=utf-8');
    // ?lang=de on the English root (the old site's links) goes to the German homepage.
    const wantLang = url.searchParams.get('lang');
    if (isRead && url.pathname === '/' && HOMES.has('/' + wantLang)) {
      const rest = new URLSearchParams(url.search); rest.delete('lang');
      return redirect(res, '/' + wantLang + (rest.size ? '?' + rest : ''));
    }
    if (isRead && HOMES.has(url.pathname)) return serveStatic(req, res, url.pathname + '/index.html');
    if (url.pathname === '/api/config' && req.method === 'GET') {
      return send(res, 200, { online: !!STRIPE_KEY, methods: STRIPE_KEY ? ['card', 'twint'] : [], email: !!RESEND_KEY, places: !!MAPBOX_TOKEN, webhook: !!WEBHOOK_SECRET });
    }
    if (url.pathname === '/api/places' && req.method === 'GET') {
      const ip = clientIp(req);
      // Typing hits this per keystroke pause, so it gets its own, looser limit.
      if (limited(ip, typing, 300)) return send(res, 429, []);
      return send(res, 200, await suggestPlaces(str(url.searchParams.get('q'), 100), url.searchParams.get('s') || ''));
    }
    if (url.pathname === '/api/route' && req.method === 'GET') {
      const ip = clientIp(req);
      // Each new pair can cost several Mapbox calls, so it gets a tighter cap than typing.
      if (limited(ip, typing, 300) || limited(ip, routes10, 40)) return send(res, 429, null);
      const trip = { tripType: 'oneway', pickup: str(url.searchParams.get('from'), 240), dest: str(url.searchParams.get('to'), 240) };
      return send(res, 200, needsRoute(trip) ? await routeBetween(trip.pickup, trip.dest) : null);
    }
    if (url.pathname === '/api/enquiry' && req.method === 'POST') {
      const ip = clientIp(req);
      if (limited(ip)) return send(res, 429, { error: 'Too many attempts. Please try again later.' });
      if (!String(req.headers['content-type'] || '').startsWith('application/json')) return send(res, 415, { error: 'JSON only' });
      const [status, body] = await createEnquiry(await readJson(req), ip);
      return send(res, status, body);
    }
    if (url.pathname === '/api/contact' && req.method === 'POST') {
      const ip = clientIp(req);
      if (limited(ip)) return send(res, 429, { error: 'Too many attempts. Please try again later.' });
      if (!String(req.headers['content-type'] || '').startsWith('application/json')) return send(res, 415, { error: 'JSON only' });
      const [status, body] = await createContact(await readJson(req));
      return send(res, status, body);
    }
    // Stripe's webhook destination: paid Checkout Sessions reach dispatch even if the customer never comes back.
    // Not rate limited; the signature is the gate. A 500 makes Stripe retry.
    if (url.pathname === '/api/stripe/webhook' && req.method === 'POST') {
      if (!WEBHOOK_SECRET) return send(res, 503, { error: 'Webhook not configured' });
      const event = stripeEvent(await readRaw(req, 512 * 1024), req.headers['stripe-signature']);
      if (!event) return send(res, 400, { error: 'Bad signature' });
      const cs = event.data && event.data.object;
      if (['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)
        && cs && cs.payment_status === 'paid' && cs.metadata && cs.metadata.source === 'previous.z-als.ch'
        && !(await notifyPaid(cs.id, cs.amount_total, cs.metadata))) return send(res, 500, { error: 'Email failed' });
      return send(res, 200, { received: true });
    }
    if (url.pathname === '/api/checkout' && req.method === 'POST') {
      if (!STRIPE_KEY) return send(res, 503, { unavailable: true, error: 'Online payment is not set up yet.' });
      const ip = clientIp(req);
      if (limited(ip)) return send(res, 429, { error: 'Too many attempts. Please try again later.' });
      if (!String(req.headers['content-type'] || '').startsWith('application/json')) return send(res, 415, { error: 'JSON only' });
      const [status, body] = await createCheckout(await readJson(req));
      return send(res, status, body);
    }
    if (url.pathname === '/api/pay' && req.method === 'POST') {
      if (!STRIPE_KEY) return send(res, 503, { unavailable: true, error: 'Online payment is not set up yet.' });
      const ip = clientIp(req);
      if (limited(ip)) return send(res, 429, { error: 'Too many attempts. Please try again later.' });
      if (!String(req.headers['content-type'] || '').startsWith('application/json')) return send(res, 415, { error: 'JSON only' });
      const [status, body] = await createPayment(await readJson(req));
      return send(res, status, body);
    }
    if (url.pathname === '/api/checkout/status' && req.method === 'GET') {
      if (!STRIPE_KEY) return send(res, 503, { unavailable: true });
      if (limited(clientIp(req), statusHits, 60)) return send(res, 429, {});
      const [status, body] = await checkoutStatus(url.searchParams.get('id') || '');
      return send(res, status, body);
    }
    if (url.pathname.startsWith('/api/')) return send(res, 404, { error: 'Not found' });
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', 'text/plain');
    return serveStatic(req, res, url.pathname);
  } catch (e) {
    if (e.status === 413) return send(res, 413, { error: 'Request too large' });
    // Before the 400 below: a Stripe refusal carries Stripe's own status (often 400).
    if (e.message === 'stripe') return send(res, 502, { error: 'The payment provider could not be reached. Please try again, or book via WhatsApp.' });
    if (e.status === 400) return send(res, 400, { error: 'Malformed request' });
    console.error('server error', e && e.message);
    return send(res, 500, { error: 'Something went wrong.' });
  }
});

server.listen(PORT, () => console.log(`z-als.ch on :${PORT} · online payment ${STRIPE_KEY ? 'ON' : 'OFF (no STRIPE_SECRET_KEY)'} · Stripe webhook ${WEBHOOK_SECRET ? 'ON' : 'OFF (no STRIPE_WEBHOOK_SECRET)'} · email ${RESEND_KEY ? 'ON → ' + NOTIFY_TO : 'OFF (no RESEND_API_KEY)'} · address search ${MAPBOX_TOKEN ? 'ON' : 'OFF (no MAPBOX_TOKEN)'}`));
