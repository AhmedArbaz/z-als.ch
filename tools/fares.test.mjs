// The fares every page shows and server.mjs charges. Run: node tools/fares.test.mjs
//
// Since 2026-09-25 this site's tariff differs from z-als.ch's on purpose (see fares.js).
import assert from 'node:assert/strict';

await import('../public/js/places.js');
await import('../public/js/fares.js');
const { quoteFor, fareFor } = globalThis.ZALS;

const ZRH = 'Zürich Airport · ZRH';
const q = (dest, vehicle = 'Business', tripType = 'oneway', pickup = ZRH) => quoteFor({ tripType, pickup, dest, vehicle });

// Distance at the class rate only (client, 2026-09-25), matching the homepage route list;
// the class minimum floors short trips.
assert.deepEqual([q('Davos').net, q('Davos').vat, q('Davos').gross], [960, 77.76, 1037.76]);
assert.equal(fareFor('Business', 3, 15).floored, true);
assert.deepEqual([q('Kloten').net, q('Kloten').gross], [120, 129.72]);

// Premium and SUV: 130.00 minimum, not z-als.ch's 129.91.
assert.equal(q('Zürich', 'Premium').net, 130);
assert.equal(q('Zürich', 'SUV', 'return').net, 260);

// ZRH → Bern: 135 km × 6.00 = 810.00 net.
assert.deepEqual([q('Bern').net, q('Bern').gross], [810, 875.61]);
assert.equal(q('Bern', 'Premium').net, 135 * 7);

// Hourly: hours × class rate, at least 4 hours, never payable online.
const hr = (vehicle, hours) => quoteFor({ tripType: 'hourly', pickup: ZRH, hours, vehicle });
assert.deepEqual([hr('Premium', 4).net, hr('Premium', 4).gross], [520, 562.12]);
assert.equal(hr('Business', 4).net, 480);
assert.equal(hr('SUV', 6).net, 780);
assert.equal(hr('Van', 2).net, 480);
assert.equal(hr('Electric', 99).net, 12 * 120);
assert.equal(hr('Business', 4).kind, 'estimate');
assert.equal(hr('Minibus', 4), null);

// A postcode, a directory town and free text all price.
assert.equal(q('3800 Interlaken').net, q('Interlaken').net);
assert.equal(q('Grindelwald').kind, 'fixed');
assert.equal(q('geneva').net, q('Genève').net);

// Return is both legs, VAT once on the total.
assert.equal(q('Bern', 'Business', 'return').net, 1620);
assert.equal(q('Bern', 'Business', 'return').gross, 1751.22);

// Quoted by dispatch: past 320 km, another airport, a door pick-up, no tariff, junk.
assert.equal(q('Hamburg'), null);
assert.equal(q('Bern', 'Business', 'oneway', 'Basel Airport · BSL'), null);
assert.equal(q('Bern', 'Business', 'oneway', 'Bahnhofstrasse 1, Zürich'), null);
assert.equal(q('Bern', 'Minibus'), null);
for (const junk of ['__proto__', 'constructor', 'toString', '', 'x'.repeat(500)]) assert.equal(q(junk), null, junk);

// Every priced fare is whole rappen and adds up.
for (const dest of ['Zug', 'Lugano', 'Zermatt', 'Bolzano', 'Grindelwald', 'Kloten'])
  for (const v of ['Business', 'Premium', 'SUV', 'Van', 'Electric']) {
    const f = q(dest, v);
    assert.equal(Math.round(f.gross * 100), Math.round(f.net * 100) + Math.round(f.vat * 100), dest + ' ' + v);
  }

// To the airport prices like from it (same table, reversed).
{
  const { needsRoute } = globalThis.ZALS;
  const at = (pickup, dest, route, vehicle = 'Business', tripType = 'oneway') => quoteFor({ tripType, pickup, dest, vehicle, route });
  assert.equal(at('Bern', ZRH).net, 810);
  assert.equal(at('Bahnhofstrasse 1, 6003 Luzern, Switzerland', ZRH).net, q('Luzern').net);
  // Anywhere → anywhere uses the road distance the server measured.
  assert.equal(needsRoute({ tripType: 'oneway', pickup: 'Badenerstrasse 122, 8004 Zürich', dest: 'Basel' }), true);
  assert.equal(needsRoute({ tripType: 'oneway', pickup: ZRH, dest: 'Basel' }), false);
  assert.equal(needsRoute({ tripType: 'oneway', pickup: 'Basel', dest: ZRH }), false);
  assert.equal(needsRoute({ tripType: 'hourly', pickup: 'Basel', dest: '' }), false);
  assert.equal(at('Badenerstrasse 122, 8004 Zürich', 'Basel', null), null);
  const city = at('Badenerstrasse 122, 8004 Zürich', 'Basel', { km: 87, t: '1:15' });
  assert.deepEqual([city.net, city.gross, city.kind], [522, 564.28, 'fixed']);
  assert.equal(at('Zürich HB', 'Zürich Opera', { km: 2, t: '0:10' }, 'Premium').net, 130);
  assert.equal(at('Basel', 'Genève', { km: 321, t: '3:30' }), null);
  assert.equal(at('Basel', 'Bern', { km: 100, t: '1:10' }, 'Business', 'return').net, 1200);
  assert.equal(at('Basel', 'Bern', { km: NaN, t: '' }), null);
  // A route never overrides the table when one end is ZRH.
  assert.equal(at(ZRH, 'Bern', { km: 1, t: '0:05' }).net, 810);
  // A hotel or street the table doesn't know, to or from ZRH, is measured too.
  assert.equal(needsRoute({ tripType: 'oneway', pickup: 'Hotel Baur au Lac', dest: ZRH }), true);
  assert.equal(needsRoute({ tripType: 'oneway', pickup: ZRH, dest: 'Paradeplatz' }), true);
  assert.equal(needsRoute({ tripType: 'oneway', pickup: 'Bern', dest: ZRH }), false);
  assert.equal(at('Hotel Baur au Lac', ZRH, { km: 12, t: '0:20' }).net, 120);
  assert.equal(at('Hotel Baur au Lac', ZRH), null);
}

// A picked street address prices as its town, never as a town its street is named after.
assert.equal(q('Bahnhofstrasse 1, 6003 Luzern, Switzerland').net, q('Luzern').net);
assert.equal(q('Zürichstrasse 10, 3011 Bern, Schweiz').net, q('Bern').net);
assert.equal(q('The Dolder Grand, Kurhausstrasse 65, 8032 Zürich, Switzerland').net, q('Zürich').net);
assert.equal(q('Rue du Rhône 1, 1204 Genève, Switzerland').net, q('Genève').net);
assert.equal(q('Unter den Linden 77, 10117 Berlin, Germany'), null);
assert.equal(q('Hauptstrasse 5, 9999 Nowhere, Switzerland'), null);
// Typed free text with the town first still prices, as it did before addresses.
assert.equal(q('Luzern, Hotel Schweizerhof').net, q('Luzern').net);

// The restored pages (public/<lang>/..., harvested from the retired site) print their prices as
// static text. They must match this engine in every language; after a tariff change, edit them.
{
  const fs = await import('node:fs');
  const { ROUTES, LOCALES } = await import('./harvest/routes.mjs');
  const { TARIFF, VAT, MIN_HOURS, MAX_HOURS } = globalThis.ZALS;
  const CLASSES = ['Business', 'Premium', 'SUV', 'Van', 'Electric']; // the old site's order everywhere
  const html = p => fs.readFileSync(new URL(`../public/${p}.html`, import.meta.url), 'utf8');
  const text = s => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
  const amounts = s => [...s.matchAll(/CHF ([\d ]+\.\d\d)/g)].map(m => Number(m[1].replace(/ /g, '')));
  const after = (s, marker, n) => { const i = s.indexOf(marker); assert.ok(i >= 0, 'missing ' + marker); return amounts(s.slice(i)).slice(0, n); };
  const gross = n => Math.round(n * (1 + VAT) * 100) / 100;
  const HRS = { en: 'hrs', de: 'Std.', fr: 'h', it: 'ore' };

  for (const l of LOCALES) {
    const fleet = html(`${l}/fleet`);
    // Rate card: one row per class, per km / incl. VAT / minimum, in class order.
    const rows = [...fleet.matchAll(/<tr><th scope="row">[^<]*<\/th>((?:<td[^>]*>CHF [^<]*<\/td>){3})<\/tr>/g)].map(m => amounts(m[1]));
    assert.deepEqual(rows, CLASSES.map(c => [TARIFF[c].km, gross(TARIFF[c].km), TARIFF[c].min]), `${l}/fleet rate card`);
    // The five class cards: per km, total incl. VAT, minimum.
    for (const [id, c] of [['business', 'Business'], ['premium', 'Premium'], ['suv', 'SUV'], ['van', 'Van'], ['electric', 'Electric']])
      assert.deepEqual(after(fleet, `id="${id}"`, 3), [TARIFF[c].km, gross(TARIFF[c].km), TARIFF[c].min], `${l}/fleet #${id}`);
    // Example fares from ZRH (Business).
    for (const dest of ['Zürich city', 'Zug', 'Luzern', 'St. Moritz', 'Milano'])
      assert.deepEqual(after(fleet, `<th scope="row">${dest}</th>`, 1), [q(dest).net], `${l}/fleet example ${dest}`);

    // Services, limousine by the hour: Business/Van/Electric and Premium/SUV share a row each.
    assert.equal(TARIFF.Van.hr, TARIFF.Business.hr); assert.equal(TARIFF.Electric.hr, TARIFF.Business.hr); assert.equal(TARIFF.SUV.hr, TARIFF.Premium.hr);
    const limo = html(`${l}/services`).split('id="limousine"')[1].split('id="chauffeur"')[0];
    assert.deepEqual(amounts(limo).slice(0, 4), [TARIFF.Business.hr, gross(TARIFF.Business.hr), TARIFF.Premium.hr, gross(TARIFF.Premium.hr)], `${l}/services hourly`);
    assert.ok(text(limo).includes(`${MIN_HOURS} ${HRS[l]}`) && text(limo).includes(`${MAX_HOURS} ${HRS[l]}`), `${l}/services hours`);

    // Every restored page's header fleet panel: net per km, in class order.
    for (const r of ROUTES) {
      const panel = html(`${l}${r}`).split('data-panel="flt"')[1];
      const km = [...panel.matchAll(/CHF (\d+\.\d\d) \/ km/g)].slice(0, 5).map(m => Number(m[1]));
      assert.deepEqual(km, CLASSES.map(c => TARIFF[c].km), `${l}${r} header fleet panel`);
    }
  }

  // Figures written into article prose (English bodies also serve fr/it and 6 de articles).
  const B = TARIFF.Business, P = TARIFF.Premium, E = TARIFF.Electric, S = TARIFF.SUV, f2 = n => n.toFixed(2);
  const WORD = { 4: 'four', 12: 'twelve' }, WORT = { 4: 'vier' };
  const zurichKm = Math.round(q('Zürich city').km * B.km);
  const prose = {
    'journal/what-a-fixed-fare-has-to-cover': [`CHF ${f2(B.km)} for Business`, `CHF ${f2(P.km)} for Premium and SUV`, `CHF ${f2(B.min)} or CHF ${f2(P.min)}`, `not at CHF ${zurichKm}.`],
    'journal/reading-a-chauffeur-invoice': [`CHF ${f2(B.km)} per kilometre for Business`, `CHF ${f2(P.km)} for Premium and SUV, floored at CHF ${f2(B.min)} and CHF ${f2(P.min)}`,
      `CHF ${f2(B.hr)} an hour, CHF ${f2(P.hr)} for Premium and SUV, for at least ${WORD[MIN_HOURS]} hours`],
    'journal/roadshow-logistics': [`CHF ${f2(B.hr)}, or CHF ${f2(P.hr)} for Premium and SUV, with a ${WORD[MIN_HOURS]}-hour minimum`, `longer than ${WORD[MAX_HOURS]} hours`],
    'journal/why-we-quote-by-hand': [`CHF ${f2(B.km)} per kilometre for Business`, `CHF ${f2(P.km)} for Premium and SUV`, `CHF ${f2(B.min)} rather than`],
    'journal/business-travel-emissions-and-the-car-that-meets-you': [`CHF ${f2(E.km)} per kilometre, minimum fare CHF ${f2(E.min)}`],
    'journal/winter-routes': [`CHF ${f2(S.km)} per kilometre`],
  };
  // These five have their own German body (checked below where it quotes figures).
  const DE_BODY = ['how-a-dispatch-desk-absorbs-a-delayed-flight', 'insurance-and-licensing', 'reading-a-chauffeur-invoice', 'roadshow-logistics', 'what-a-fixed-fare-has-to-cover'];
  // English pages carry the sentences; the translations (2026-10) must carry the same amounts, with CHF in front.
  for (const [r, phrases] of Object.entries(prose)) {
    for (const s of phrases) assert.ok(text(html(`en/${r}`)).includes(s), `en/${r}: expected "${s}"`);
    const amts = [...new Set(phrases.flatMap(s => [...s.matchAll(/CHF (\d+(?:\.\d\d)?)/g)].map(m => m[1])))];
    for (const l of ['fr', 'it', ...(DE_BODY.includes(r.split('/')[1]) ? [] : ['de'])])
      for (const a of amts) assert.ok(text(html(`${l}/${r}`)).includes(`CHF ${a}`), `${l}/${r}: expected the amount CHF ${a}`);
  }
  assert.ok(B.min === 120 && zurichKm < B.min, 'why-we-quote-by-hand says "seventy-eight" and Zürich city prices at the minimum');
  const de = { 'journal/what-a-fixed-fare-has-to-cover': [`CHF ${f2(B.km)} für Business`, `CHF ${f2(P.km)} für Premium und SUV`, `CHF ${f2(B.min)} beziehungsweise CHF ${f2(P.min)}`],
    'journal/reading-a-chauffeur-invoice': [`CHF ${f2(B.km)} pro Kilometer`, `CHF ${f2(B.min)} beziehungsweise CHF ${f2(P.min)}`,
      `CHF ${f2(B.hr)} pro Stunde, für Premium und SUV bei CHF ${f2(P.hr)}, mindestens ${WORT[MIN_HOURS]} Stunden`] };
  for (const [r, phrases] of Object.entries(de)) for (const s of phrases) assert.ok(text(html(`de/${r}`)).includes(s), `de/${r}: expected "${s}"`);

  // The new pages' header fleet panel quotes the net per-km rate.
  for (const c of CLASSES) assert.ok(html('index').includes(`CHF ${f2(TARIFF[c].km)} / km`), `index header panel ${c}`);
}

// The business JSON-LD (every page) carries the rate card AI answers quote: per-km rate, minimum and hourly rate per class.
{
  const { business } = await import('./seo.mjs');
  const b = business();
  assert.equal(b.geo['@type'], 'GeoCoordinates');
  const offers = b.hasOfferCatalog.itemListElement;
  const spec = (name, unit) => offers.find(o => o.itemOffered.name.startsWith(name)).priceSpecification.find(p => p.unitCode === unit);
  assert.deepEqual([spec('Business', 'KMT').price, spec('Business', 'KMT').minPrice], [6, 120]);
  assert.deepEqual([spec('Premium', 'KMT').price, spec('Premium', 'KMT').minPrice], [7, 130]);
  assert.equal(spec('SUV', 'HUR').price, 130);
  assert.equal(spec('Business Van', 'HUR').price, 120);
  assert.equal(offers.length, 5);
  assert.ok(offers.every(o => o.priceSpecification.every(p => p.priceCurrency === 'CHF' && p.valueAddedTaxIncluded === false)));
}

// Outside prices (taxi, train) on the guide pages: formatted per language, and refused once their check is over 6 months old.
{
  const { externalTokens } = await import('./routes.mjs');
  const ext = { checked: '2026-10-20', taxiCityMin: 50, taxiCityMax: 70, taxiBase: 6, taxiKm: 3.8, trainCity: 7.2, trainCityMinutes: '10–15',
    trains: { zermatt: { minutes: 211, changes: 1 }, 'st-moritz': { minutes: 203, changes: 2 }, davos: { minutes: 158, changes: 2 } } };
  assert.throws(() => externalTokens(ext, 'en', '2027-04-21'), /older than 6 months/);
  assert.doesNotThrow(() => externalTokens(ext, 'en', '2027-04-19'));
  const en = externalTokens(ext, 'en', '2026-10-21'), de = externalTokens(ext, 'de', '2026-10-21');
  assert.deepEqual([en.trainCity, en.taxiCity, en.taxiTariff, en.checked], ['CHF 7.20', 'CHF 50–70', 'CHF 6.00 + CHF 3.80 per km', '20 October 2026']);
  assert.deepEqual([en.trainZermatt, en.trainZermattChanges, de.trainDavos, de.trainDavosChanges], ['3 h 31 min', '1 change', '2 Std. 38 Min.', '2 Umstiege']);
}

console.log('fares ok');
