/* Street-address suggestions for the pick-up and destination fields, as on swisselitelimousine.ch, and road distances.
 * server.mjs /api/places proxies Mapbox Search Box, so the token never reaches the page.
 * findAddresses(text, done) waits for a typing pause, then calls done(text, rows) once per answer;
 * rows are [{ name, sub }], [] on any failure (the fields then show the town directory only). */
(function (g) {
  let timer = 0, session = '';
  function findAddresses(text, done) {
    clearTimeout(timer);
    const q = String(text || '').trim();
    if (q.length < 3) return;
    /* One Mapbox session per page visit, so typing is billed as one search, not per keystroke. */
    if (!session) session = g.crypto && g.crypto.randomUUID ? g.crypto.randomUUID() : '';
    timer = setTimeout(() => {
      fetch('/api/places?q=' + encodeURIComponent(q) + '&s=' + session)
        .then(r => (r.ok ? r.json() : []))
        .then(rows => done(text, Array.isArray(rows) ? rows : []))
        .catch(() => done(text, []));
    }, 200);
  }

  /* Road distance for a trip off the ZRH table (server.mjs /api/route). findRoute(pickup, dest, done) waits for a
     typing pause, asks once per pair (answers are kept for the visit) and always calls done(key, route) later, never
     during the caller's render; route is { km, t }, or null on any failure (the fare then reads "quoted by dispatch"). */
  const routes = new Map();
  let routeTimer = 0, pending = '';
  function findRoute(pickup, dest, done) {
    const key = pickup + '|' + dest;
    if (key === pending) return;
    clearTimeout(routeTimer);
    pending = key;
    const answer = v => { routes.set(key, v); if (pending === key) pending = ''; done(key, v); };
    if (routes.has(key)) { routeTimer = setTimeout(() => answer(routes.get(key)), 0); return; }
    routeTimer = setTimeout(() => {
      fetch('/api/route?from=' + encodeURIComponent(pickup) + '&to=' + encodeURIComponent(dest), { signal: AbortSignal.timeout(10000) })
        .then(r => (r.ok ? r.json() : null))
        .then(v => answer(v && v.km > 0 ? v : null))
        .catch(() => answer(null));
    }, 300);
  }
  g.ZALS_GEO = { findAddresses, findRoute };
})(window);
