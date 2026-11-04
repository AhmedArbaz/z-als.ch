// The route landing pages: /<lang>/transfers/zurich-airport-to-<slug> and the hub /<lang>/transfers.
// Distances, drive times and fares are read from the price engine (public/js/fares.js), the same one the booking
// form and the server use, so a page can never state a figure the wizard would not charge.
// The words of each page live in tools/seo/routes/<slug>.<lang>.json; tools/routes.mjs renders them.

await import(new URL('../../public/js/places.js', import.meta.url));
await import(new URL('../../public/js/fares.js', import.meta.url));
const Z = globalThis.ZALS;

export const LANGS = ['en', 'de', 'fr', 'it'];

/** dest = the engine's key (and what the quote wizard prefills); name = the place in each language. */
export const ROUTES = [
  { slug: 'davos', dest: 'Davos', name: { en: 'Davos', de: 'Davos', fr: 'Davos', it: 'Davos' }, langs: ['en', 'de', 'fr', 'it'],
    notes: 'Alpine resort at about 1,560 m, reached over the Prättigau valley road through Klosters; the World Economic Forum meets here every January and ski seasons fill the cars; winter tyres are standard on every car from October to April.' },
  { slug: 'st-moritz', dest: 'St. Moritz', name: { en: 'St. Moritz', de: 'St. Moritz', fr: 'Saint-Moritz', it: 'St. Moritz' }, langs: ['en', 'de', 'fr', 'it'],
    notes: 'Engadin resort; the road runs over a high pass (the Julier) that can close in winter, which is why dispatch confirms the departure the evening before in February; the SUV is the usual winter car.' },
  { slug: 'zermatt', dest: 'Zermatt', name: { en: 'Zermatt', de: 'Zermatt', fr: 'Zermatt', it: 'Zermatt' }, via: 'Täsch', langs: ['en', 'de', 'fr', 'it'],
    notes: 'Zermatt is car-free: the drive ends at Täsch (the engine distance and time are to Zermatt/Täsch) and the last leg is by shuttle train. State this plainly; it is a fact about the village, not a limit of the service.' },
  { slug: 'interlaken', dest: 'Interlaken', name: { en: 'Interlaken', de: 'Interlaken', fr: 'Interlaken', it: 'Interlaken' }, langs: ['en', 'de'],
    notes: 'Town between Lake Thun and Lake Brienz, gateway to the Jungfrau region and the Bernese Oberland.' },
  { slug: 'lucerne', dest: 'Luzern', name: { en: 'Lucerne', de: 'Luzern', fr: 'Lucerne', it: 'Lucerna' }, langs: ['en', 'de'],
    notes: 'Short run north of the Alps; the rail link is good, so the case for a car is door-to-door service, luggage and groups.' },
  { slug: 'bern', dest: 'Bern', name: { en: 'Bern', de: 'Bern', fr: 'Berne', it: 'Berna' }, langs: ['en', 'de'],
    notes: 'Federal capital; trains are frequent, so the case for a car is door to door without changes, with luggage, and for meetings that do not match a timetable.' },
  { slug: 'basel', dest: 'Basel', name: { en: 'Basel', de: 'Basel', fr: 'Bâle', it: 'Basilea' }, langs: ['en', 'de', 'fr', 'it'],
    notes: 'Basel city and EuroAirport Basel-Mulhouse, which lies on French soil. The fixed fare in the booking form is for Basel from Zürich Airport; collections at Basel airport itself are quoted by dispatch.' },
  { slug: 'lugano', dest: 'Lugano', name: { en: 'Lugano', de: 'Lugano', fr: 'Lugano', it: 'Lugano' }, langs: ['en', 'de', 'it'],
    notes: 'Ticino, across the Alps through the Gotthard; Italian-speaking; a long run where the departure time depends on the Gotthard corridor.' },
  { slug: 'geneva', dest: 'Genève', name: { en: 'Geneva', de: 'Genf', fr: 'Genève', it: 'Ginevra' }, langs: ['en', 'de', 'fr'],
    notes: 'Lake Geneva, the full length of the Swiss plateau; a long run. The fixed fare in the booking form is from Zürich Airport to Geneva; collections at Geneva airport are quoted by dispatch.' },
];

/** Guide pages: answer-first comparisons at /<lang>/transfers/<slug> (tools/routes.mjs), words in tools/seo/routes/<slug>.<lang>.json. */
export const GUIDES = [
  { slug: 'taxi-train-or-chauffeur', langs: ['en', 'de'], label: { en: 'Taxi, train or chauffeur from Zurich Airport?', de: 'Taxi, Zug oder Chauffeur ab Flughafen Zürich?' } },
  { slug: 'zurich-airport-to-the-alps', langs: ['en', 'de'], label: { en: 'Zurich Airport to Zermatt, St. Moritz and Davos', de: 'Vom Flughafen Zürich nach Zermatt, St. Moritz und Davos' } },
];

export const route = slug => ROUTES.find(r => r.slug === slug);
export const routeUrl = (lang, slug) => `/${lang}/transfers/zurich-airport-to-${slug}`;
export const hubUrl = lang => `/${lang}/transfers`;
export const pagesFor = lang => ROUTES.filter(r => r.langs.includes(lang));
export const alternatesFor = r => [...r.langs.map(l => [l, `https://z-als.ch${routeUrl(l, r.slug)}`]), ['x-default', `https://z-als.ch${routeUrl('en', r.slug)}`]];
export const hubAlternates = () => [...LANGS.map(l => [l, `https://z-als.ch${hubUrl(l)}`]), ['x-default', `https://z-als.ch${hubUrl('en')}`]];

const CLASSES = ['Business', 'Premium', 'SUV', 'Van'];
export function facts(r) {
  const base = Z.FARES[r.dest];
  const [h, m] = base.t.split(':').map(Number);
  const out = { slug: r.slug, from: 'Zürich Airport (ZRH)', to: r.dest, via: r.via || null, km: base.km, time: base.t, hours: h, minutes: m, vatPct: +(Z.VAT * 100).toFixed(1), classes: {} };
  for (const c of CLASSES) {
    const q = Z.quoteFor({ tripType: 'oneway', pickup: 'Zürich Airport · ZRH', dest: r.dest, vehicle: c });
    const car = Z.CARS.find(x => x.key === c);
    out.classes[c] = { net: q.net, gross: q.gross, vat: q.vat, model: car.model, seats: car.seats, cases: car.cases, perKm: Z.TARIFF[c].km };
  }
  return out;
}
export const allFacts = () => ROUTES.map(facts);
