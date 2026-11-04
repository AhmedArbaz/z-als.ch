# z-als.ch

This repo **is** the live site `https://z-als.ch` since 2026-09-26 (it was new.z-als.ch, before that
previous.z-als.ch). The Next.js site it replaced (`jalexzander662-web/z-als`) is archived and its Dokploy app
deleted. `www.z-als.ch` 301s to the apex with path and query (`server.mjs` does this for any `*.z-als.ch` host
routed to it except `payments.z-als.ch`, the payment portal, and only when `SITE_URL` is a z-als.ch URL), and the old site's `/en|de|fr|it/...` URLs
(148 were indexed) 301 to the closest page here via `oldSiteUrl()`. The two WordPress eras (German at the root, 2024 to 2026-09-11) are covered too:
`server.mjs` `LEGACY` (67 old paths: `/kontakt`, `/services`, `/vans-und-busse-fuer-gruppenreisen`, `/en/product-category/limo-service`,
`/about-us`, `/booking` …) → the matching page, `GONE` (`/fahrzeug-verkauf`, `/finanz-immobilien` + `/en/…`) → **410**, one resolver `destination()` for
slash, case, `.html`, www and old-site rules so every old URL is **one** 301 (`www` goes straight to the final page). Add an old path to `LEGACY` and to
`tools/redirects.test.mjs`; WordPress theme demos, party-limo and shop pages stay 404 on purpose. The router normalises the request target first
(leading `//` → `/`, so `//kontakt` is `/kontakt`; a malformed `%` or a NUL byte is a 404): anything that throws outside its `try` stops the whole Node process
(a bare `GET //` did until 2026-10-07), and `/..//host/` must never become a protocol-relative redirect; `redirects.test` covers both. Three names only: `z-als.ch`, `www.z-als.ch` and `payments.z-als.ch` (since 2026-10-24); `new.z-als.ch`
(the staging name) left Dokploy on 2026-09-27.

Where things live: `design/*.dc.html` (boards) → `tools/build.mjs` → `public/` (committed); `server.mjs` + `public/js/{places,fares}.js` (the price engine,
shared by the pages and the server) are the runtime; `tools/seo.mjs` + `tools/seo/` (meta, FAQ, routes, keywords) write every page's head and JSON-LD; `docs/seo/` is the
SEO and analytics paper trail. **The Docker image ships only `server.mjs` and `public/`**: `tools/`, `docs/` and `design/` never deploy, so a change there needs a commit but no deploy.

Commands (no dependencies, nothing to install): `npm run dev` (build + serve on :3002; `PORT=3000 npm run dev` for another
port), `npm run build` (boards → `public/`, route pages, sitemap, guards), `node tools/fares.test.mjs` (price engine +
restored pages' prices), `node tools/seo.test.mjs [base-url]` (every sitemap URL: titles, descriptions, canonical, reciprocal
hreflang, one GTM snippet, JSON-LD vs visible text, language of each page), `node tools/redirects.test.mjs [base-url]` (every legacy URL: one 301 to a 200 page whose
#anchor exists, or 410; slash, capital, query, www; needs `PORT=3005 SITE_URL=https://z-als.ch node server.mjs` running for the local www checks: preview config `z-als-www-check`; if :3005 is
taken, often by a server another session left running on old code, the preview moves it, so pass the real port: `node tools/redirects.test.mjs http://localhost:3002 http://localhost:<port>`) and
`node tools/seo/client-keywords.check.mjs` (the agency's 63 keywords against the built pages). Before every commit run build, `fares.test`, `pay.test`, `route.test`, `seo.test`, `redirects.test` against a running server, then the browser checks below.
**Pass the base URL**: `seo.test`, `seo-audit`, `glitch-probe`, `gtm.test`, `events.test` and `fonts.test` default to `http://localhost:3000`, but `npm run dev` serves :3002 (`node tools/seo.test.mjs http://localhost:3002`).
**Restart the server after a build**: it caches the restored-page set, the per-language homes and the 404 body at startup. Git Bash rewrites a lone
`/` argument into a Windows path, so prefix `MSYS_NO_PATHCONV=1` when passing paths to the probes.
Browser checks need Playwright, which the repo does not depend on: `tools/pw.mjs` finds an `npx playwright` cache or
`PLAYWRIGHT_DIR`; `tools/glitch-probe.mjs` (first paint: nothing may show before mount, layout shift ≈ 0), `tools/gtm.test.mjs`
(consent defaults, banner in 4 languages, GTM requests), `tools/events.test.mjs` (dataLayer events from the wizard) and `tools/fonts.test.mjs`
(no request to Google Fonts, faces loaded from `/assets`) use it. On this machine the package ships inside the global `playwright-cli`
(also the CLI for manual browser checks): `export PLAYWRIGHT_DIR="C:/Users/AJ30/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright"`
(`fonts.test` and `glitch-probe` pass with it, 2026-10-24); the browsers are in `%LOCALAPPDATA%\ms-playwright`.

- **Measuring / SEO report**: `docs/seo/` holds the keyword plan, the baseline and "after" crawls and Lighthouse JSON, the GA4/GTM hand-off
  and the client report. `node tools/seo-audit.mjs <url> <out.json>` crawls the sitemap; `node tools/seo-report.mjs [--pdf]` rebuilds
  `docs/seo/z-als-seo-report.html` from `report.template.html` and those files. `tools/lcp-probe.mjs`, `mount-probe.mjs` and `trace-probe.mjs` are
  field-style probes (4× CPU, slow-4G). **Lab caveat**: on this machine Lighthouse's mobile first frame is held ~1.3 s on any page served with
  latency (the old build too, via a 150 ms delay proxy), so compare old and new builds side by side (`docs/seo/ab`), never against a run from another day.
- `design/*.dc.html` is the source. `public/*.html` and `public/js/components.js` are
  generated: edit the boards, run `npm run build`, and commit `public/`, since the image serves it as is.
  Board pages: `/` (Main), `/quote` (Quote), `/legal` (Legal: imprint, privacy, terms; the rate card reads `fares.js`),
  `payments.z-als.ch/` (Pay, `public/pay.html`; see Payment portal below).
  `build.mjs` `LINKS` maps canvas board links (Services/Fleet/Contact/About/Blog → the restored `/en/services#…`,
  `/en/fleet#…`, `/en/contact`, `/en/about`, `/en/journal`, which `i18n.js` switches to the visitor's language;
  legal → `/legal#…`) and **throws on any board link it doesn't map**: any `<name>.dc.html` text in a board, a CSS comment included.
- **Restored pages** (2026-09-26, client request, "exact design"): `public/{en,de,fr,it}/{about,services,fleet,contact,
  journal,journal/<slug>}.html`, the retired Next.js site's pages harvested as static HTML at their old URLs
  (`tools/harvest/README.md`). Edit their body in place, in all 4 locales; never rebuild them onto the v3 boards (they keep the
  old header/footer on purpose). **Their `<head>` is not edited by hand any more**: `npm run build` rewrites title,
  description, canonical, Open Graph/Twitter tags, the JSON-LD graph (company + breadcrumb + BlogPosting) and the GTM
  snippet on every one of them (`tools/seo.mjs`, idempotent). Titles and descriptions live in `tools/seo/restored-meta.json`
  and `tools/seo/meta/<lang>__<path>.json` (the latter is written by `tools/splice-page.mjs`); a re-harvest needs `npm run build` after it. Styles: `public/assets/old/` (old compiled CSS + next/font files). Behaviour:
  `public/js/old-site.js` (no React, no `i18n.js`; each page sets `zals-lang` so `/`, `/quote`, `/legal` follow its language).
  Their prices are **static text**: after a `fares.js` change update them, `node tools/fares.test.mjs` fails until you do.
  They link `/assets/old/site.css?v=<first 10 hex of its sha256>`; /assets is cached 30 days, so after editing site.css
  put the new suffix in all 64 pages. Their contact form posts `/api/contact`: an email to dispatch only (Reply-To the
  visitor, never a copy to the typed address), with a hidden `zals_hp` honeypot; WhatsApp is only the fallback when the
  send fails. Its texts are `<template data-state>` elements in each locale's page (old-site.js hard-codes none).
  `server.mjs` serves them before `oldSiteUrl()` redirects anything. The old site's 30 transfer routes are replaced by the
  route pages below (`/xx/transfers/<place>` → that route page when it exists, `ROUTE_ALIAS` covering luzern, genf, saint-moritz …; otherwise the language's hub).
- **Route pages** (`/<lang>/transfers/zurich-airport-to-<slug>` and the hub `/<lang>/transfers`, 9 routes, EN/DE for all, FR/IT
  where there is demand): `tools/routes.mjs` renders them in the restored pages' layout (skeleton: `<lang>/about.html`) from
  `tools/seo/routes/<slug>.<lang>.json` (the words; `node tools/verify-route.mjs <lang> <slug>` checks them) and the price
  engine (distance, time and fares via `tools/seo/routes.mjs`; prose uses tokens like `{km}` `{time}` `{priceBusiness}`, never typed numbers).
  The keyword research behind them is `docs/seo/keyword-plan.md`. Adding a route: an entry in `tools/seo/routes.mjs`, one JSON per language, `npm run build`.
- **Homepages per language**: `/` is English; `/de`, `/fr`, `/it` are the same Main board pre-translated at build time
  (`tools/translate.mjs` runs `i18n.js`'s `t()` over the static markup), each with its own title, description, canonical, hreflang,
  FAQ (`tools/seo/faq.mjs`, numbers read from the engine) and FAQPage JSON-LD. `<html data-home>` makes `i18n.js` use the page's own
  language, send language-button clicks to the other URL, and, on `/` only, send a visitor who chose or prefers another language to
  `/de` etc. (script only: crawlers keep seeing English). `/en` → `/`; `?lang=de` on `/` → `/de`; `/x.html` → `/x`; redirects keep the query string.
- SEO: board metadata is in `tools/seo/meta.mjs` (`HOME` per language, `BOARDS`), restored pages' in the tables above; the
  `description`, canonical, hreflang, Open Graph, Twitter and JSON-LD come from `tools/seo.mjs`. schema.org has no
  `LimousineService` type (the old markup used it): the company is a `LocalBusiness` (`@id https://z-als.ch/#business`).
  Titles lead with the client's own phrases (their Sep 2025 #1s: Limousinenservice Flughafen Zürich, Zurich Airport Limousine Service, the legal name):
  `/` EN "Zurich Airport Limousine Service & Chauffeur", `/de` "Limousinenservice Flughafen Zürich & Transfer", `/en|de/about` the legal name; "airport transfer"
  stays in descriptions, the FAQ heading and the route pages. Each home / services / fleet page has ONE `<h1>` carrying its keyword: on the board it is the
  small eyebrow line (the big slogan is a `<p>` with the same look); on the restored pages the eyebrow `<span>` became the `<h1>`, the old `<h1>` a `<p>` with its class.
  `docs/seo/client-keywords.json` holds the 63 keywords and where each one lives, `docs/seo/traffic-drop-2026-10.md` the story for the client. `docs/seo/keyword-plan.md`/`.csv` are written by hand, not by the build: rerun
  `node tools/seo/make-keyword-plan.mjs` after changing `client-keywords.json` or a title in `meta.mjs`/`restored-meta.json`, or its tables go stale. Never write
  courier, app, rent/rental or taxi into titles, and "luxury" only sparingly.
  **Search-engine verification tags**: `VERIFY` in `tools/seo.mjs` (Google Search Console "HTML tag", Bing `msvalidate.01`) is written into every page's head by
  `track()`; once set it must never be removed (ownership depends on it). Google's is set since 2026-10-07 (Search Console property `https://z-als.ch/`,
  URL prefix, also verified via GTM); Bing's is still empty (Bing Webmaster can import from Search Console instead). `track()` is idempotent on the restored, route and 404 pages
  (every build re-applies it) but not on the board pages, which get it once from the build template: never run it over a finished board.
  Never add `aggregateRating` or review markup without real, attributable reviews. `npm run build` generates `public/sitemap.xml`
  (lastmod, hreflang alternates) and fails on retired tariff text (driver time, CHF 60 / hr, 6.486, courier …) or any broken
  internal link/asset in `public/**/*.html`. `robots.txt` is static (`Disallow: /api/`). Never reintroduce `noindex` (meta or `X-Robots-Tag`).
  The share image and favicon are generated by `node tools/make-og.mjs` (outputs committed).
- **Analytics**: GTM container `GTM-MKMXMR2X` is on every page (`tools/seo.mjs` writes it between `<!--z-gtm-->` markers; the board
  template calls the same function), after a Consent Mode v2 default of *denied*. `public/js/consent.js` is the banner (EN/DE/FR/IT, accept grants
  `analytics_storage` only, choice in localStorage `zals-consent` for 12 months, "Cookie settings" link in the footer);
  `public/js/track.js` + the wizard push the events listed in `docs/seo/ga4-gtm-setup.md` (no personal data). GTM does not load on localhost
  unless `localStorage.zalsGtm` is set (tests do, so `gtm.test` and `events.test` send real hits to the client's GA4: run them once per change, never in loops or review sweeps). GA4 itself is configured **inside GTM**, which the site cannot do: the container was empty on 2026-10-04/06; since 2026-10-08 it holds the Google tag
  `G-WXJ4J6YKZQ` (page views) plus one GA4 Event tag (event name `{{Event}}`, the 12 Data Layer Variables as parameters, Custom Event trigger `z-als events`).
  The event tag depends on the Google tag: never delete it. The retired Next.js site used `G-P8X3PYL98W`, so GA history is not comparable; see that document for what is left in GA4.
  GA4's "0% consent rate" diagnostic refers to the ad consent signals the site never grants (it runs no ads): expected. The pasted noscript iframe cannot honour consent.
  Open (security audit 2026-10-24): after consent, GA4's `page_location` can carry personal data from pay links (`?ref=`) and `/quote?pickup=`
  (the portal keeps its query; `/quote` strips it only after mount); redact the query in GTM. The site sends no Content-Security-Policy (no injection sink found).
  Open: the Zermatt drive time (`places.js`, 2:40) looks short against road guides (~3 h 30, sources not recorded); confirm with dispatch before changing it,
  the price table feeds the booking form, the route pages and the home FAQs, but the home route card (`design/Main.dc.html`) and the winter-routes article (4 languages) are typed by hand.
- **AEO** (being named by ChatGPT, Claude, Gemini, Perplexity; plan and baseline 2026-10-20 in `docs/seo/aeo/`): Ubersuggest AI Search Visibility tracks
  15 EN/DE prompts for Switzerland (`docs/seo/aeo/prompts.json`, ChatGPT/Gemini/AI Overviews); `node --env-file-if-exists=.env tools/aeo-check.mjs` asks Claude
  (web search) and Perplexity the same prompts monthly (`ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY` in `.env`, never in chat). `tools/seo/facts.mjs` is the quotable
  fact sheet (phone as plain text, rates from the engine) on the homes (above the FAQ), the about pages (between `<!--z-facts-->` markers) and `/llms.txt` (written by the build).
  The business JSON-LD carries `geo` and `hasOfferCatalog` from `fares.js`. Guide pages `/en|de/transfers/{taxi-train-or-chauffeur,zurich-airport-to-the-alps}`
  (`GUIDES` in `tools/seo/routes.mjs`) quote taxi/train figures from `tools/seo/external-prices.json`: **the build fails 6 months after its `checked` date**;
  re-check the sources listed there and update it. Footer column "Ask AI about Z-ALS" (`tools/seo/ask-ai.mjs`, both footers): opens each assistant with a
  question, never claims they recommend Z-ALS; logos only where the brand allows (`docs/seo/aeo/ai-logos.md`: Gemini by name, Copilot left out). Clicks push `ask_ai`.
- Privacy copy (`design/Legal.dc.html`) states what the site does: Resend, Stripe, Mapbox (no IP forwarded),
  WhatsApp, Unsplash, and Google Tag Manager/Analytics only after the visitor accepts; `zals-lang` and `zals-consent` in
  localStorage and the wizard snapshot in sessionStorage during Stripe checkout. Adding a third party or storage means updating that section.
  The imprint omits the commercial-register (CHE) number, VAT number and managing director: the client must supply them.
- `npm run dev` builds and runs `server.mjs` on :3002 (reads `.env` if present). The preview
  configs live in `.claude/launch.json`: `z-als-previous` (dev, :3002) and `z-als-www-check` (:3005, `SITE_URL=https://z-als.ch`, for `redirects.test`).
- `server.mjs` serves `public/` plus `/api/config` (which methods are on), `/api/checkout` (card → Checkout
  Session), `/api/checkout/status`, `/api/enquiry` (booking email), `/api/contact` (Contact page email),
  `/api/stripe/webhook` (paid sessions), `/api/pay` (the portal's Checkout Session), `/api/places` (address suggestions) and
  `/api/route` (measured road km). A missing file gets `public/404.html`.
- "Today" is Zürich's date everywhere: `ZALS.todayInZurich()` (fares.js) for the wizard's checks and calendar, the
  hero's date `min` and `server.mjs`. Never `new Date().toISOString()` or the visitor's local date for a booking day.
- Boards run on `public/js/dc-lite.js`, not React. Mutating `this.state` directly (e.g. in
  `componentDidMount`) renders nothing, so follow it with `this.setState({})`.
- `public/js/places.js` + `fares.js` are the one price engine for the boards, the legal rate card and the server,
  and the only copy of the tariff now (originally ported from the retired Next.js repo @ 9a65bb9; nothing to
  re-port any more). After any change run `node tools/fares.test.mjs`. `fares.js` `routeFor()`'s comma split
  (a picked address prices as its town) is deliberate. The server re-prices every payment and ignores client amounts.
- The tariff (client, 2026-09-25): a transfer is km × class rate only, floored at
  120 (130 for Premium/SUV), no driver-time line; hourly hire is `TARIFF[cls].hr` (120, or 130 for Premium/SUV) ×
  hours, `MIN_HOURS` 4 to `MAX_HOURS` 12, shown as a price but never payable online (`kind: 'estimate'`). The
  homepage route list (Davos 960 …) is hand-typed and matches km × 6.00; keep it in step.
- Any pick-up (client request, 2026-10-22): from or to ZRH prices from the `places.js` table (to ZRH = the same table reversed);
  any other one way/return (`needsRoute()`) prices on the road km `server.mjs` `routeBetween()` measures (Mapbox Search Box `/forward` +
  Directions; no house number → towns/districts first (`types=`), a town the directory knows (Lucerne, Genève, Zürich HB) is asked for as "<zip> <name>" in its own country (by name alone Mapbox gave a Lucerne in Italy, a Geneve in France); top 5 answers in German; a match must contain every word typed, a town/district beats a business listing, a picked "Hotel, street, town" retries by its address (`choose()`, `pointFor()`); no trusted match → not priced; BSL/GVA/ZRH use fixed points, never a geocode of their label; successes cached 24 h per pair, so the shown and the
  charged figure agree). The page asks `/api/route?from=&to=` through `geo.js` `findRoute()` and passes the answer to
  `quoteFor({ route })`; the server measures again in `quoteBooking()` and never reads km from a request. No answer → "quoted by
  dispatch". No empty-run charge to the pick-up (the user's choice). Tests: `node tools/route.test.mjs` (mock Mapbox + Stripe, no
  network) and `node tools/route.e2e.mjs [base-url]` (Playwright; no URL = its own mock server on :3012, with a URL it is live-safe).
- Languages: `public/js/i18n.js` translates the board pages to DE/FR/IT by exact English text (`D`, rows of
  [de, fr, it]; `P` for strings with numbers). A new English string on a board stays English until it has a row
  (`SHOW_MISSING=1 npm run build` lists what /de /fr /it still show in English; proper nouns and figures are expected there).
  Composed strings use placeholders: `T('{n} hours', { n })` in board code. On `/quote`, `/legal` and the portal the language comes from `?lang=`, then
  localStorage `zals-lang`, then the browser; switching re-translates in place (`DC.refresh()`), so the wizard keeps
  its state. On the homepages the language is the URL's (see above). The prefilled WhatsApp message follows the visitor's language; emails from `server.mjs` stay English.
  `translate="no"` keeps a subtree as is (the language buttons: `FR` is also a weekday key).
- Payment step (step 5), as the user wants it: **Book via WhatsApp** is first and pre-selected (the team confirms and
  collects payment); paying on the website is the alternative: Card, TWINT, Pay the chauffeur.
  - WhatsApp and chauffeur post `/api/enquiry` (`pay: 'whatsapp' | 'driver'`): dispatch gets an email tagged `WHATSAPP`/
    `CHAUFFEUR`, the customer a "booking request" email. Only the WhatsApp path opens `wa.me`; `window.open` must stay
    synchronous inside the click, before any `await`/`fetch`, or popup blockers drop it.
  - A request dispatch didn't get is never shown as sent: `/api/enquiry` answers 502 when the dispatch email failed,
    and the wizard's `sendEnquiry()` resolves `{ ok, customerEmailed, error }` (fixed board strings, never server text).
    Chauffeur shows "Request sent" only on ok, else an error with WhatsApp/phone links. The same booking is sent once;
    a changed one again, subject `UPDATE ·`. Going forward (Next, step indicator) and paying re-validate steps 1–3.
  - Card and TWINT are both Stripe Checkout (`payment_method_types[0]` = the method): no email and no WhatsApp before
    payment. Dispatch gets the PAID email, then the customer a "confirmed and paid" email, from whichever comes first:
    the Stripe webhook or the return page (`?paid=cs_…`; only for sessions under an hour old once `STRIPE_WEBHOOK_SECRET` is set, under a day without it, since `emailedSessions`
    empties on every redeploy). `notifyPaid()` shares one send between them, marks a session emailed only once dispatch's email went, and mails
    the customer only after. The PAID email's subject names the real pick-up (it said `ZRH →` for every trip until 2026-10-24) and its body
    "Priced on: N km (measured)", so dispatch can spot an address `routeFor()`'s comma split priced as a nearer town.
  - Customer emails are built from fixed fields only: never add the free-text notes or name sign (the form would
    become a way to mail arbitrary text to arbitrary addresses).
- TWINT needs **activating in the Stripe Dashboard** (Settings → Payment methods). Until then Stripe answers 400
  (`payment_intent_invalid_parameter` on PaymentIntents) and the wizard says "TWINT isn't available online right now".
  The client's static TWINT QR (no amount) is also on the payment portal, desktop only; see Payment portal.
- Stripe webhook: destination `https://z-als.ch/api/stripe/webhook` (live mode), events `checkout.session.completed`
  and `checkout.session.async_payment_succeeded`, signing secret in Dokploy as `STRIPE_WEBHOOK_SECRET` (the user pastes
  it). No secret → 503; a bad or stale (>300 s) signature → 400; the dispatch email failing → 500, so Stripe retries.
  It replaced the old WooCommerce endpoint `https://z-als.ch/?wc-api=wc_stripe` (always 405 here). Test locally with a
  dummy secret and events signed as Stripe does: header `t=<unix>,v1=<hex HMAC-SHA256 of "<t>.<raw body>">`.
- Test checkout without Stripe: run `server.mjs` with `STRIPE_API=http://127.0.0.1:<mock>` and a
  dummy `STRIPE_SECRET_KEY`; the mock needs `checkout/sessions` (POST, and GET for the status check; ids shaped like
  Stripe's: `cs_test_…`, or the status check says 400), and its metadata
  must carry `source: previous.z-als.ch` (an internal tag the rename left alone on purpose; changing it
  404s status checks for payments already in flight) or the status check answers 404. A `created` (unix seconds) over an
  hour old (a day without the webhook secret) stops the return page from emailing. Never create sessions with the live key.
- E2E: `/quote?trip=oneway&pickup=<ZRH>&dest=<place>&date=<future YYYY-MM-DD>&time=HH:MM&pax=2&bags=2` opens
  the wizard on step 2, skipping the custom date/time pickers. Every step stays in the DOM, hidden, so scope
  selectors with `:visible`: pick a car with `.q-cars button`, advance with `button.q-next[type=submit]:visible`,
  fill step 3's `input[name=first|last|phone|email]:visible`, pay with `button.q-next[type=button]:visible`. The repo has no dependencies: use the global `playwright-cli`
  (`playwright-cli run-code "async page => …"`), or a script with `PLAYWRIGHT_DIR` set as above. Off port 3002, set a matching `SITE_URL`;
  Stripe's return URLs use it. To test the host and old-URL redirects locally, run a second server with
  `PORT=3005 SITE_URL=https://z-als.ch` and `curl -H "Host: www.z-als.ch"` (Node `fetch` ignores a custom Host header).
- `/api/checkout`, `/api/pay`, `/api/enquiry` and `/api/contact` share one in-memory limit (20 per IP per 10 min); a long local
  test run ends in 429s, so restart the server to reset it. Tighter ones (`limited()`, 2026-10-24): booking-request copies to the customer
  3 per IP per 10 min **and** 3 per recipient address a day (rotating IPs can't aim the form at one inbox), and the greeting echoes only a
  plausible name (one or two words of letters); `/api/route` 40 per IP (each new pair costs several Mapbox calls); `/api/checkout/status` 60
  (each is a live Stripe read); `/api/places` 300. A full map drops its oldest key, never all of them.
- `server.mjs` has CRLF line endings: a scripted replace (`node -e`, `sed`) must normalise `\r\n` first or its multi-line anchors never match,
  and a `\` inside a heredoc'd replacement can vanish (a `\p{L}` regex lost its backslashes once): read the result back.
- Testing on the live site: those four endpoints email the client (and the typed customer address) or create live
  Stripe sessions. In every live Playwright context first `context.route(/\/api\/(enquiry|contact|checkout|pay)(\?|$)/, r =>
  r.abort())`, and never press step 5's pay button, the portal's Pay button, step 4's WhatsApp link or the contact form's Send. A real test
  message or payment needs the user's OK in chat. Invalid `/api/pay` bodies are safe live: they answer 400 before Stripe is called.
- A 502 from `/api/checkout` logs `stripe <endpoint> <status> <type> <code>`; `code` can be empty (as on 2026-10-23), and then only
  Stripe Dashboard → Developers → Logs has the reason (the server logs no Stripe message: it can echo request fields). A 403 means the restricted key
  lacks a permission: it needs Checkout Sessions: Write. `server.mjs` maps every Stripe error to that 502 before
  its generic 400, which once turned Stripe's 400 into a misleading "Malformed request".
- One added `style-hover`/`style-active` renumbers every later generated `dch…`/`dca…` class, so
  `public/index.html` diffs by hundreds of lines. Expected; review the board diff instead. Markup the build drops in at a board
  marker (`<!--z-faq-->`, `<!--z-journal-->`, `<!--z-ask-ai-->`) arrives after that compilation: a `style-hover` there never becomes a
  class (write a real CSS rule), and `i18n.js` translates its text nodes on `/quote` and `/legal` but not its attributes.
- Boards point images at `z-als.ch/wp-content/…/*.webp`; `tools/build.mjs` rewrites them to `public/assets/fleet/*.webp`,
  so swap a photo by overwriting that file (no rebuild), but they are cached 30 days: rename to change one (and update
  `build.mjs`, `fares.js` `CARS[].img`, the restored pages and harvest.mjs's `IMG`). `business-1200.webp` and
  `s-class-1200.webp` are 1200px re-encodes (2026-09-27) of 420–520 KB originals; `s-class` is Unsplash `pgWzo-bNUeM` (plate blurred). `v-class.webp` is Unsplash `photo-1765461734605` (replaced the dealer-plated `van.webp`,
  2026-09-25); the SUV cards use the `suv.webp` render. **No photo may show a legible number plate**: check new stock photos
  at full size before use (the hero and SUV hotlinks had plates until 2026-09-25; the restored fleet page's `bus.webp`
  stock photo had "RAD 181 G" until it was blurred on 2026-09-26, and its V-Class uses `v-class.webp`). The hero is `hero-s-class-1600.webp` (the Unsplash photo, self-hosted, preloaded; it was a hotlinked 2400px file). Typefaces are self-hosted (no Google Fonts anywhere): `build.mjs` `fonts()` inlines the latin/latin-ext `@font-face` rules of `public/assets/old/site.css` into every board, preloads Playfair and Manrope, and writes `public/assets/fonts.css` for the 404. Favicon and the other `<head>` tags of the board pages live in the `build.mjs` HTML template; the restored pages' are rewritten by `tools/seo.mjs`.
- First paint: a `<dc-if>` is `hidden` in the static HTML unless its design hint says it starts open (`build.mjs`), the header's and hero form's initial styles are baked in (`INITIAL`), and `html:not(.z-ready) body{visibility:hidden}` holds the page until `DC.mount()` has run (3 s safety). Before this the closed menu overlay painted over the hero for about half a second. `node tools/glitch-probe.mjs` must stay green. `server.mjs` serves text files brotli/gzip with ETag/304 (`no-cache` still revalidates).
- `STRIPE_SECRET_KEY` (restricted: Checkout Sessions Write) and `RESEND_API_KEY` (Sending access,
  domain z-als.ch) belong only in the Dokploy env of "New-z-als" (`zFH7Q393NAA6Ixp2smoGC`). The user pastes them in
  Environment → **Save** (deploying does not save the box); never accept one in chat or write one to a file. As of
  2026-09-25 all three are set: `/api/config` → `online:true, email:true, places:true` (`webhook:true` once
  `STRIPE_WEBHOOK_SECRET` is saved too; still false on 2026-10-07). Without the Stripe key, card shows
  "Coming soon"; without the Resend key no email is sent, so "Pay the chauffeur" and the contact form report a failure. Check names (never any part of a value) before claiming either works.
- Booking emails: `server.mjs` `notify()` → Resend, from `NOTIFY_FROM` (default `bookings@z-als.ch`; Resend's z-als.ch
  domain is verified) to `NOTIFY_TO` (default `info@z-als.ch`, one address). Test with `RESEND_API=http://127.0.0.1:<mock>` and a dummy key; a real send lands in the client's inbox.
- Deploy: `git fetch` first, since other sessions (the weekly SEO branch) push to `main` too. Merge `origin/main`; conflicts in
  `public/`, `sitemap.xml` or `tools/seo/lastmod.json` are generated, so take either side, `npm run build` and rerun the tests. Then push, and
  deploy only once `git rev-parse origin/main` equals `main` (on 2026-10-20 a rejected push still triggered a redeploy of the old commit).
  Then `POST https://admin.alexzanderkovacs.cloud/api/application.deploy` with header
  `x-api-key: <key>` and `{"applicationId":"zFH7Q393NAA6Ixp2smoGC"}`. The key is a Windows **User** environment variable `DOKPLOY_API_KEY`,
  which the Bash tool does not see: read it inside each PowerShell command with `[Environment]::GetEnvironmentVariable('DOKPLOY_API_KEY','User')`,
  never print it, and never ask the user to paste one (a pasted key must be revoked). The UI's Autodeploy toggle is on, but the
  repo has no webhook, so a push alone deploys nothing. Poll `deployment.all?applicationId=…` (newest `createdAt`) until
  `status` is `done` (about 20 s); an env edit only reaches the container on a redeploy. A deploy or domain edit made in the UI is not proof:
  on 2026-10-24 neither reached the app, so check `deployment.all` and `domain.byApplicationId` before trusting it. Then smoke-test the URL, not the
  status: `/`, `/de`, `/fr`, `/it`, `/quote`, `/legal`, a route page, `/sitemap.xml`, `/en` → 301 `/`, `www.` → apex (query kept), `/api/config` (`online`, `email`, `places` true; `webhook` stays false until the signing secret is saved),
  `https://payments.z-als.ch/` → 200 portal and `/kontakt` there → 301 apex, TLS **without `-k`** on all three names, then `node tools/redirects.test.mjs https://z-als.ch`
  (about 3 minutes live: run it in the background) and `node tools/seo.test.mjs https://z-als.ch`.
  The app pulls with its own read-only key "z-als-previous (new.z-als.ch)"; if `application.one` shows
  `customGitSSHKeyId: null`, reattach it with `application.saveGitProvider` (`customGitSSHKeyId` plus the other `customGit*`
  fields, `watchPaths`, `enableSubmodules`; the misspelt `saveGitProdiver` 404s). Env it reads: `STRIPE_SECRET_KEY`,
  `RESEND_API_KEY`, `MAPBOX_TOKEN`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL=https://z-als.ch`. Domains `z-als.ch`, `www.z-als.ch`, `payments.z-als.ch` → port 3000,
  Let's Encrypt; a deleted one comes back with `domain.create` (`host`, `path:"/"`, `port:3000`, `https:true`,
  `certificateType:"letsencrypt"`, `applicationId`, `domainType:"application"`). `domains: []` = Traefik's 19-byte 404; a 502 over a valid certificate = routed, but no container running.
- Dokploy API traps: `application.one`, `application.stop` and similar return the whole app **with env values in
  plaintext**: print names or a status code, never the body. `application.saveEnvironment` needs `createEnvFile`
  alongside `env`, `buildArgs`, `buildSecrets` and replaces the whole env: read, merge, write. Never call
  `sshKey.all`/`sshKey.one` (every private key in plaintext); `sshKey.allForApps` gives ids only. A certificate stuck on
  `TRAEFIK DEFAULT CERT` is fixed by re-saving the domain (`domain.update` with its existing values), not by redeploying;
  check the issuer with `openssl s_client -connect 156.67.219.74:443 -servername z-als.ch | openssl x509 -noout -issuer`.
  There is no rollback button (`rollbackActive` false): roll back with `git revert`, push, deploy.
- DNS (read before touching any record): since October 2026 `z-als.ch` is on **Cloudflare** (`dilbert`/`lola.ns.cloudflare.com`,
  free plan; checked 2026-10-24); it was `ch.pro.io`, `nl.pro.io`, `p.dnh.net` before, and the client's
  Plesk DNS panel edits a zone nothing queries. Every record is **DNS only** (grey cloud): proxying would put Cloudflare's certificate
  and cache in front of Traefik. Only `@`, `www` and `payments` (A → `156.67.219.74`) point here: mail stays on Metanet (`80.74.146.90`),
  `mail.z-als.ch` resolves through the `*.z-als.ch` wildcard (repointing it stops inbound mail), and that host serves plain
  HTTP, which is why HSTS here has no `includeSubDomains`. `new` has no record of its own any more, so it falls to the wildcard (Metanet).
- **Payment portal** `payments.z-als.ch` (client request, 2026-10-24): the customer pays an amount dispatch already agreed (CHF 20–5,000,
  card or TWINT) on Stripe Checkout. Board `design/Pay.dc.html` → `public/pay.html` (not in the sitemap, canonical the payments URL, its
  site links made absolute to `https://z-als.ch` by `build.mjs`). `server.mjs`: on `PAY_HOST` `/` serves the portal and `/api|js|assets` work,
  any other page 301s to the apex; `/pay` on any host 301s to the portal (on localhost `/pay` just serves it). `POST /api/pay` validates and
  creates the session (metadata `kind: portal`, plus the same `source` tag, so `/api/checkout/status` and the webhook accept it); `sendPaid()`
  mails dispatch the typed booking reference and the customer a copy without it. Nothing is priced: the range is the only amount check.
  Pay links: `https://payments.z-als.ch/?amount=480&ref=Müller-12.11&method=twint&lang=de`. Both footers link it ("Pay online"; restored pages via
  `tools/seo.mjs`; the board footer's link gets `?lang=` from `i18n.js`, since `zals-lang` doesn't cross origins). Below the panel a "bank transfer" card
  (client, 2026-10-24): holder `Zurich-A.L.S GmbH` (the bank's spelling), IBAN `CH72 0027 8278 1373 9201 F`, Copy button (no spaces); the same line is in
  the imprint. No BIC until the client confirms it. Then a "Pay with the TWINT app" card with the client's static TWINT QR (no amount; the customer types it):
  `public/assets/pay/twint-qr.png`, a clean 360px redraw of the client's photo that decodes to the same `02:…#…#` TWINT token; desktop only
  (`max-width:900px` or `hover:none` hides it: a phone can't scan its own screen). Nothing on the site sees these payments; dispatch reconciles. Test: `node tools/pay.test.mjs` (mock Stripe + Resend, no network); `redirects.test` checks the host rules.
- Address search, as on swisselitelimousine.ch: `public/js/geo.js` debounces the pick-up/destination fields into
  `/api/places?q=&s=`, which proxies Mapbox Search Box `/suggest` with `MAPBOX_TOKEN` (server-side only) and returns
  `[{ name, sub }]`; a pick fills "name, sub". No token, a Mapbox error or under 3 chars → `[]`, and the fields show
  the town directory as before. `s` is one session per visit: the free tier is 500 sessions/month (50 suggests each).
  Test with `MAPBOX_API=http://127.0.0.1:<mock>` and a dummy token in `.env`; the mock answers `{ suggestions: [{ name, place_formatted }] }`.
- Without `STRIPE_SECRET_KEY`, card and TWINT switch off (`/api/config` → `online:false`, `/api/checkout` → 503)
  and WhatsApp and pay-the-chauffeur still work, so deploying before the keys exist is safe.
