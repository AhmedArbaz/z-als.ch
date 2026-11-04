/* One price engine for the browser and the server.
 *
 * The quote wizard shows fares from this file and server.mjs charges them. The
 * server recomputes every amount from the trip itself and never trusts a figure
 * sent by the browser. Loaded by a <script> tag after places.js (sets window.ZALS)
 * and by `import` in Node (sets globalThis.ZALS).
 *
 * Ported from z-als.ch's src/lib/fares.ts @ 9a65bb9, then changed at the client's
 * request (2026-09-25), so this site differs from z-als.ch on purpose: a transfer is
 * distance at the class rate only (no driver-time line), never below the class
 * minimum; Premium/SUV's minimum is 130.00 (not 129.91); hourly hire is `hr` per hour
 * for at least MIN_HOURS. Keep all three when re-porting. VAT (8.1%) is its own line.
 * Distances come from places.js. Run `node tools/fares.test.mjs` after any change here. */
(function (g) {
  'use strict';

  const { FARES, resolvePlace, exactCity, driveTime, parseHM } = g.ZALS_PLACES;

  /* Net per km, net minimum per transfer and net per hour of hourly hire, per class. */
  const TARIFF = {
    Business: { km: 6.00, min: 120.00, hr: 120 }, Premium: { km: 7.00, min: 130.00, hr: 130 },
    SUV: { km: 7.00, min: 130.00, hr: 130 }, Van: { km: 6.00, min: 120.00, hr: 120 },
    Electric: { km: 6.00, min: 120.00, hr: 120 }
  };
  const VAT = 0.081;
  /* Hourly hire (roadshows): at least 4 hours; past 12, dispatch plans the day. */
  const MIN_HOURS = 4, MAX_HOURS = 12;
  /* Beyond this distance dispatch quotes by hand: a longer run is a driver-hours and
     overnight-rest problem, not a multiplication. */
  const PRICED_KM = 320;
  const AIRPORTS = [
    { name: 'Zürich Airport · ZRH', sub: 'Kloten · meet & greet in arrivals' },
    { name: 'Basel Airport · BSL', sub: 'EuroAirport Basel-Mulhouse' },
    { name: 'Geneva Airport · GVA', sub: 'Cointrin' }
  ];
  const CARS = [
    { key: 'Business', name: 'Business', model: 'Mercedes E-Class or equivalent', img: '/assets/fleet/business-1200.webp', seats: 3, cases: 3 },
    { key: 'Premium', name: 'Premium', model: 'Mercedes S-Class or equivalent', img: '/assets/fleet/s-class-1200.webp', seats: 3, cases: 2 },
    { key: 'SUV', name: 'SUV', model: 'Mercedes GLE or equivalent', img: '/assets/fleet/suv.webp', seats: 4, cases: 4 },
    { key: 'Van', name: 'Business Van', model: 'Mercedes V-Class or equivalent', img: '/assets/fleet/v-class.webp', seats: 7, cases: 7 },
    { key: 'Electric', name: 'Electric', model: 'Fully electric saloon or equivalent', img: '/assets/fleet/electric.webp', seats: 3, cases: 3 },
    // Groups past the V-Class. No published tariff: always quoted by dispatch.
    { key: 'Minibus', name: 'Minibus', model: 'Mercedes Sprinter or coach, for groups', img: '/assets/fleet/sprinter.webp', seats: 16, cases: 16 }
  ];

  const round2 = n => Math.round(n * 100) / 100;
  /* Every kilometre in places.js is measured from Zürich Airport, so only a ZRH
     pick-up can be priced: a BSL or GVA figure would be the wrong airport's. */
  const fromZRH = p => /z(ü|u|ue)rich airport|zrh|kloten|flughafen z/i.test(p || '');

  /* One journey's bill in integer rappen: the km line, floored at the class minimum.
     `minutes` is the drive time, shown for information only. */
  function fareFor(cls, km, minutes) {
    const t = TARIFF[cls] || TARIFF.Business;
    const distance = Number.isFinite(km) && km > 0 ? km : 0;
    const mins = Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : 0;
    const kmRp = Math.round(distance * t.km * 100);
    const minRp = Math.round(t.min * 100);
    return { km: distance, minutes: mins, kmRp, floored: kmRp < minRp, netRp: Math.max(minRp, kmRp) };
  }

  /* Distance and drive time for a destination: published route, then the place the
     customer picked, then free text folded onto a published route. */
  function routeFor(dest) {
    const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
    const d = String(dest || '');
    /* A picked address ("Bahnhofstrasse 1, 6003 Luzern, Switzerland") prices as its town: the
       parts after the first, postcode stripped, and the first part only by exact name, so a
       street never prices as the town it is named after ("Zürichstrasse 10, 3011 Bern" is Bern)
       while "Luzern, Hotel Schweizerhof" is still Luzern. New-site only, not in Z-Als's
       fares.ts: keep it when re-porting. */
    const all = d.split(',').map(p => p.trim().replace(/^\d{4,5}\s+/, '')).filter(Boolean);
    if (all.length > 1) {
      const parts = all.slice(1);
      for (const p of parts.concat(all[0])) {
        if (own(FARES, p)) return { km: FARES[p].km, t: FARES[p].t };
        const city = exactCity(p);
        if (city) return { km: city.km, t: driveTime(city) };
      }
      for (const p of parts) {
        const key = resolvePlace(p);
        if (key && own(FARES, key)) return { km: FARES[key].km, t: FARES[key].t };
      }
      return null;
    }
    if (own(FARES, d)) return { km: FARES[d].km, t: FARES[d].t };
    const city = exactCity(d);
    if (city) return { km: city.km, t: driveTime(city) };
    const key = resolvePlace(d);
    return key && own(FARES, key) ? { km: FARES[key].km, t: FARES[key].t } : null;
  }

  /* From or to ZRH, the table's distance for the other end (null when it doesn't know that place). */
  const tableRoute = (pickup, dest) => (fromZRH(pickup) ? routeFor(dest) : fromZRH(dest) ? routeFor(pickup) : null);

  /* A one way / return the table can't price (no ZRH end, or a hotel/street it doesn't know): the
     server measures the road distance instead (server.mjs routeBetween, /api/route). */
  const needsRoute = ({ tripType, pickup, dest }) =>
    (tripType === 'oneway' || tripType === 'return') && !!pickup && !!dest && !tableRoute(pickup, dest);

  /* The fare for a trip in one class:
   *   { kind: 'fixed', net, vat, gross, km, drive, note }  one way / return up to 320 km, payable online
   *   { kind: 'estimate', net, gross, note }               hourly: hours × class rate, not payable online
   *   null                                                 quoted by dispatch
   * From or to ZRH prices from the table; anything else only with `route` ({ km, t }) measured by the server. */
  function quoteFor({ tripType, pickup, dest, hours, vehicle, route: measured }) {
    const t = TARIFF[vehicle];
    if (!t) return null;
    if (tripType === 'hourly') {
      const h = Math.min(MAX_HOURS, Math.max(MIN_HOURS, Math.round(Number(hours)) || MIN_HOURS));
      const net = round2(t.hr * h);
      return { kind: 'estimate', net, gross: round2(net * (1 + VAT)), note: h + ' hrs × CHF ' + t.hr + ' + VAT' };
    }
    const route = tableRoute(pickup, dest) || (measured && Number.isFinite(measured.km) && measured.km > 0 ? measured : null);
    if (!route || route.km > PRICED_KM) return null;
    const one = fareFor(vehicle, route.km, parseHM(route.t));
    const netRp = one.netRp * (tripType === 'return' ? 2 : 1);
    const vatRp = Math.round(netRp * VAT);
    return {
      kind: 'fixed', net: netRp / 100, vat: vatRp / 100, gross: (netRp + vatRp) / 100, km: route.km, drive: route.t,
      note: tripType === 'return' ? 'fixed fare · both ways + VAT' : 'fixed fare + VAT'
    };
  }

  /* "Today" for a booking is Zürich's date: trips run on Swiss time, whatever the visitor's or the server's clock
     says. The wizard and server.mjs check dates against it. Built from parts, so no locale changes its shape. */
  const ZURICH_DAY = new Intl.DateTimeFormat('en', { timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit' });
  function todayInZurich() {
    const p = {};
    ZURICH_DAY.formatToParts(new Date()).forEach(x => { p[x.type] = x.value; });
    return p.year + '-' + p.month + '-' + p.day;
  }

  g.ZALS = { FARES, TARIFF, VAT, MIN_HOURS, MAX_HOURS, PRICED_KM, AIRPORTS, CARS, round2, fromZRH, needsRoute, fareFor, quoteFor, todayInZurich };
})(typeof globalThis !== 'undefined' ? globalThis : window);
