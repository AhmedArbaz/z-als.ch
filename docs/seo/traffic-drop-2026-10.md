# Why clicks and impressions fell, and what was changed (2026-10-07)

For the conversation with Zurich-Airport Limousinen Services GmbH. Evidence comes from the agency's spreadsheet
(*Digital_Marketing_Report_Z-als*, data May–September **2025**), the Internet Archive, live requests to z-als.ch and the old
host, and the code of the three sites that have served this domain. Search Console data for 2026 has not been seen yet
(see "What we still need").

## In one paragraph

In September 2025 the old German WordPress site ranked **#1** on Google.ch for the company name, "limousinenservice flughafen
zürich", "Limo Service Flughafen Zürich" and "Limousinen Flughafen", and #2 to #13 for most of the 43 phrases the agency
tracked; Search Console was flat to rising (10,177 impressions, 77 clicks, average position 17.5). Since then the website
was rebuilt **three times in about six months**, and each time the old addresses were dropped without a forwarding rule and
the wording moved from "limousine" to "airport transfer". Search engines were left with addresses that end in an error page,
a homepage that changed language, and titles that no longer contain the words people search for.

## Timeline

| When | What served z-als.ch | What it did to search |
|---|---|---|
| 2024-07 → ~2026-03 | WordPress (Elementor, TranslatePress), **German at `/`**, English under `/en/`, title "Zürich-Airport Limousinen Services - Z-ALS" | The site that held the rankings above |
| ~2026-03 → 2026-09-11 | WordPress rebuild: English copy, new page names (`/about-us`, `/contact`, `/bus-service` …) | German ranking page now English; old German addresses already gone |
| 2026-09-11 → 09-26 | Next.js site: `/` forwarded to `/en`, German at `/de`; Google Analytics `G-P8X3PYL98W`; a 25-minute certificate outage at the switch | Every WordPress address returned an error |
| 2026-09-26 → 10-06 | This site: `/de` forwarded to an English page whose canonical was `/`; **no analytics at all**; no Search Console token | German signals had nowhere to land for ten days |
| 2026-10-06 → | This site with Tag Manager (`GTM-MKMXMR2X`, tag `G-WXJ4J6YKZQ`), titles "Airport Transfer & Chauffeur Service" | Better pages, but still no forwarding for old addresses, and the title that held #2 ("Zurich Airport Limousine Service") had been replaced |

## Causes, with evidence

1. **Old addresses led nowhere.** `server.mjs` stripped the trailing slash first and only knew the Next.js paths
   (`/en|de|fr|it/…`). So `/kontakt/`, `/services/`, `/chauffeur-service/`, `/vans-und-busse-fuer-gruppenreisen/`, `/buchen/`,
   `/preise/` went 301 → **404**, and every old `/en/<x>` address went 301 → 301 → the homepage, which Google reads as a soft
   404. Six of the seven addresses the agency's backlinks point at were affected (the seventh is the homepage).
2. **The best phrase was removed on 2026-10-06.** On 2026-10-04 z-als.ch was #2 for "zurich airport limousine service" with
   exactly that title. The 10-06 pass changed it to "Zurich Airport Transfer & Chauffeur Service" and the German title to
   "Flughafentransfer Zürich & Chauffeurservice", against the keyword plan's own advice. After that the visible text of the
   English and German pages used "Limousinenservice", "limousine service", "limo" and "Gruppenreisen" **zero times**, no heading
   carried a keyword and the legal name was in no title. 28 of the agency's 43 keywords are limo/limousine terms.
3. **The numbers are not comparable across the migrations.** Three different measurement set-ups sat behind the domain
   (see `ga4-gtm-setup.md`), consent defaults to "denied", and the container published on 2026-10-07 holds one Google tag
   (page views only) and no event tags. The agency's September 2025 "organic" count (6.4k) against 77 Search Console clicks
   points to bot traffic, so Search Console is the figure to watch.
4. **No ownership proof for Google or Bing.** No verification tag, file or DNS record is left (the old DNS record sat on the
   wrong name, `z-als.ch.z-als.ch`).
5. **Backlinks are mostly bookmarking networks** (`*.ipt.pw`, `*.sbm.pw`); they do not help and are not a reason for the drop.

Healthy and unchanged: all 102 sitemap URLs answer 200, every page has its own canonical and reciprocal hreflang, nothing is
`noindex`, the content is in the raw HTML, and the wildcard subdomains only show the host's "unavailable" page.

## What this release changes

**Old addresses (one 301 each, any slash, any capital letter, www or not):**

- 67 WordPress and z-als.com addresses now land on the matching page (`/kontakt` → `/de/contact`, `/chauffeur-service` →
  `/de/services#chauffeur`, `/vans-und-busse-fuer-gruppenreisen` → `/de/fleet#van`, `/en/product-category/limo-service` → `/`,
  `/about-us` → `/en/about`, `/booking` → `/quote`, `/sitemap_index.xml` → `/sitemap.xml` …); the full table is in `server.mjs`
  (`LEGACY`) and checked by `tools/redirects.test.mjs`.
- `/fahrzeug-verkauf` and `/finanz-immobilien` (vehicle sales, finance and real estate, no equivalent now) answer **410 Gone**.
- Old Next.js transfer addresses go to the route page of the same place (`/en/transfers/luzern` →
  `/en/transfers/zurich-airport-to-lucerne`), else the language's transfer overview.
- WordPress theme demo, wedding/prom/birthday-limo and shop pages stay 404: there is no equivalent service.

**Words on the pages (agency keyword list, 63 phrases, placement in `client-keywords.json`, check with
`node tools/seo/client-keywords.check.mjs`):**

| Page | New title |
|---|---|
| `/` | Zurich Airport Limousine Service & Chauffeur \| Z-ALS |
| `/de` | Limousinenservice Flughafen Zürich & Transfer \| Z-ALS |
| `/en/fleet` · `/de/fleet` | Luxury Van & Mercedes Chauffeur Zurich · V-Klasse & Vans mit Chauffeur Zürich |
| `/en/about` · `/de/about` | Zurich-Airport Limousinen Services GmbH \| About Z-ALS · … \| Über Z-ALS |
| `/en/services` · `/de/services` | unchanged (Zurich Chauffeur Service · Chauffeurservice Zürich) |

- One keyword `<h1>` on the home and the services/fleet pages (the large slogan keeps its look; only the HTML tag changed).
- FAQ questions reworded ("What does a limousine service from Zurich Airport cost?") and a new one on hiring a chauffeur by
  the hour, in all four languages, with prices read from the fare engine.
- "Hire a personal chauffeur in Zurich" / "Chauffeur mieten in Zürich" and "Group transfers: Sprinter and bus" headings, one
  "luxury" sentence on the home fleet section, "Zurich chauffeur service" link text, the company's other names in the
  structured data, and the Google Business Profile map link.
- Never used: courier, app, rent/rental, taxi in a title, hand-typed prices.

## What we still need (handoffs)

- **Google Search Console** (client or whoever holds the property): add a URL-prefix property for `https://z-als.ch`, choose
  the "HTML tag" method and send the `content` value (it goes into `VERIFY` in `tools/seo.mjs`); or, if that user can publish in
  Tag Manager, verify through the container. Export Performance → Queries and Pages (last 16 months) as CSV into
  `docs/seo/gsc/`. After the deploy: check *Manual actions*, *Pages → Not found / Soft 404*, resubmit `sitemap.xml`, request
  indexing for `/`, `/de`, `/en/services`, `/en/fleet`. Domain property alternative: a DNS TXT at `@` in the pro.io zone.
- **Bing Webmaster Tools:** import from Search Console, or send the `msvalidate.01` value; resubmit the sitemap.
- **Tag Manager / GA4:** add the GA4 Event tag and the `z-als events` trigger (`ga4-gtm-setup.md`), mark `generate_lead` and
  `purchase` as key events, annotate 2026-09-11 and 2026-09-26 → 10-06.
- **Google Business Profile:** website `https://z-als.ch/de?utm_source=gbp&utm_medium=organic`; name the services
  Limousinenservice and Chauffeurservice.
- **Agency:** stop the `ipt.pw` / `sbm.pw` bookmarking; repoint the blogspot/medium posts in the sheet to the new addresses.
  No disavow unless Search Console reports a manual action.
- **Client:** rotate every password in the agency's spreadsheet (they are in plain text); have Metanet switch the old
  WordPress site off on its host while keeping mail; confirm the founding year of the GmbH (site says 2004, the old site said
  2014), whether "airport transfers & limousinen service gmbh" is a trading name, group sizes (FAQ says 16 by minibus, fleet
  page lists a 21-seat Sprinter and a 50-seat bus), the contact details on the old site (info@z-als.com, +41 76 435 59 78),
  and the Zermatt drive time (2:40 looks short).
