// The old Next.js pages restored on z-als.ch (harvested in all four locales). One list, used by
// harvest.mjs, shoot.mjs and build.mjs, so a page can't be harvested but never built, or the reverse.
export const LOCALES = ['en', 'de', 'fr', 'it'];

export const SLUGS = [
  'the-arrivals-gap', 'what-a-fixed-fare-has-to-cover', 'business-travel-emissions-and-the-car-that-meets-you',
  'how-a-dispatch-desk-absorbs-a-delayed-flight', 'what-we-ask-of-a-chauffeur', 'who-is-actually-driving',
  'reading-a-chauffeur-invoice', 'roadshow-logistics', 'winter-routes', 'insurance-and-licensing', 'why-we-quote-by-hand',
];

// Section of each route in the old header's nav (for aria-current / data-active).
export const ROUTES = ['/about', '/services', '/fleet', '/contact', '/journal', ...SLUGS.map(s => `/journal/${s}`)];
export const sectionOf = r => r.split('/')[1];
