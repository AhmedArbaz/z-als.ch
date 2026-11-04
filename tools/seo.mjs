// Tracking and SEO post-processing shared by the board build and the restored pages.
//
// The restored pages (public/{en,de,fr,it}/..., public/404.html) are static files that the build only
// checks, so everything that must land on EVERY page (GTM, consent, page metadata) is written by this
// module: idempotently, between marker comments, so a rebuild or a re-harvest converges on the same
// result and a changed snippet replaces the old one.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const GTM_ID = 'GTM-MKMXMR2X';

// Search-engine ownership tags, on every page (boards, restored and route pages, the 404): Google Search Console's "HTML tag"
// token and Bing Webmaster's msvalidate.01. Paste each `content` value between the quotes. NEVER remove one once set:
// ownership of the property depends on the tag staying on the page. An empty value writes nothing.
export const VERIFY = { 'google-site-verification': 'kG_uNB5OpU17ojXoag_HQncSdG1DPJANH3ZUxRuyHBk', 'msvalidate.01': '' };
const verifyTags = Object.entries(VERIFY).filter(([, v]) => v).map(([k, v]) => `<meta name="${k}" content="${v}">\n`).join('');

// Head, right after <meta charset>: Consent Mode v2 defaults (denied until the visitor decides), then
// the GTM container as Google gives it (started on `load`, so it never competes with first paint: about
// 130 ms of mobile LCP on a throttled run), then the consent banner and the event helper.
// GTM is skipped on localhost so development and tests don't pollute GA4; set localStorage.zalsGtm=1
// in a test browser to load it anyway.
export const HEAD = `<!--z-gtm-->
${verifyTags}<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
(function(){var d={ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'};
gtag('consent','default',Object.assign({wait_for_update:500},d));
try{var v=JSON.parse(localStorage.getItem('zals-consent')||'null');
if(v&&v.t>Date.now()-31536e6&&v.a)gtag('consent','update',{analytics_storage:'granted'})}catch(e){}})();</script>
<!-- Google Tag Manager -->
<script>addEventListener('load',function(){if(!/^(localhost|127\\.0\\.0\\.1)$/.test(location.hostname)||(function(){try{return localStorage.zalsGtm}catch(e){}})()){(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}')}})</script>
<!-- End Google Tag Manager -->
<script src="/js/consent.js" defer></script>
<script src="/js/track.js" defer></script>
<!--/z-gtm-->`;

// Right after <body>.
export const BODY = `<!--z-gtm-ns-->
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
<!--/z-gtm-ns-->`;

const strip = html => html
  .replace(/\n*<!--z-gtm-->[\s\S]*?<!--\/z-gtm-->\n*/g, '')
  .replace(/\n*<!--z-gtm-ns-->[\s\S]*?<!--\/z-gtm-ns-->\n*/g, '');

/** Puts the tracking blocks into one page's HTML (replacing any earlier copy). */
export function track(html) {
  html = strip(html);
  if (!/<meta charset="utf-8">/i.test(html) || !/<body[^>]*>/i.test(html)) throw new Error('seo.track: page has no <meta charset> or <body>');
  return html
    .replace(/(<meta charset="utf-8">)(<meta name="viewport"[^>]*>)?/i, (m, charset, viewport = '') => `${charset}${viewport}${HEAD}`)
    .replace(/<body[^>]*>/i, m => `${m}${BODY}`);
}

import { facts, FACTS_HEADING } from './seo/facts.mjs';
import { askAiOld } from './seo/ask-ai.mjs';
const aboutFacts = lang => {
  const H = FACTS_HEADING[lang];
  const rows = facts(lang).map(([k, v]) => `<div style="padding:16px 0;border-top:1px solid rgba(125,155,212,0.25)"><dt style="font-size:12px;letter-spacing:0.04em;color:#7E9BD4">${esc(k)}</dt><dd style="margin:6px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.86)">${esc(v)}</dd></div>`).join('');
  return `<!--z-facts--><section class="Page-module__tyTi3W__sectionDark" id="facts"><div class="Page-module__tyTi3W__wrap"><div class="Page-module__tyTi3W__eyebrow">${esc(H.eyebrow)}</div><h2 class="Page-module__tyTi3W__h2Dark">${esc(H.h2[0])}<span class="Page-module__tyTi3W__accentLight">${esc(H.h2[1])}</span></h2><dl style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));column-gap:48px;margin:32px 0 0">${rows}</dl></div></section><!--/z-facts-->`;
};

const HUB_LABEL = { en: 'Routes and fares', de: 'Strecken und Preise', fr: 'Trajets et tarifs', it: 'Tratte e tariffe' };
const PAY_LABEL = { en: 'Pay online', de: 'Online bezahlen', fr: 'Payer en ligne', it: 'Paga online' };

/** Rewrites every restored page and the 404 in place; returns how many files changed. */
export function processStatic(OUT, files, pages = new Map()) {
  const meta = loadMeta();
  let changed = 0;
  for (const f of files) {
    const p = path.join(OUT, f);
    const before = fs.readFileSync(p, 'utf8');
    let after = track(before);
    const m = f.replaceAll('\\', '/').match(/^(en|de|fr|it)\/(.+)\.html$/);
    if (m) {
      const urlPath = `/${m[1]}/${m[2]}`;
      const page = pages.get(urlPath);
      after = retag(after, { lang: m[1], urlPath, meta: page ? page.meta : meta[urlPath], alternates: page && page.alternates, extra: page && page.extra });
      // The footer's Services column also links the route pages' hub.
      if (!after.includes(`href="/${m[1]}/transfers"`)) {
        after = after.replace(/(<a class="[^"]*colLink[^"]*" href="\/\w\w\/services#transfer">[^<]*<\/a>)/, (x) => `${x}<a class="${(x.match(/class="([^"]*)"/) || [])[1]}" href="/${m[1]}/transfers">${HUB_LABEL[m[1]]}</a>`);
      }
      // ...and the Company column the payment portal (payments.z-als.ch), in the page's language.
      if (!after.includes('href="https://payments.z-als.ch/')) {
        after = after.replace(/(<a class="[^"]*colLink[^"]*" href="\/quote\?lang=\w\w">[^<]*<\/a>)/, (x) => `${x}<a class="${(x.match(/class="([^"]*)"/) || [])[1]}" href="https://payments.z-als.ch/?lang=${m[1]}">${PAY_LABEL[m[1]]}</a>`);
      }
      // Footer: the "Ask AI about Z-ALS" column (tools/seo/ask-ai.mjs) after the last column; 200px columns so all five fit one row.
      after = after.replace(/<!--z-ask-ai-->[\s\S]*?<!--\/z-ask-ai-->/, '');
      after = after.replace(/(<div><div class="SiteFooter-module__nBz1BW__colHead">(?:(?!<\/div><\/div>)[\s\S])*<\/div><\/div>)(?![\s\S]*SiteFooter-module__nBz1BW__colHead)/, (x) => x + askAiOld(m[1]));
      after = after.replace(/class="SiteFooter-module__nBz1BW__columns"(?: style="[^"]*")?/, 'class="SiteFooter-module__nBz1BW__columns" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))"');
      // About pages: the quotable fact sheet (tools/seo/facts.mjs) before the closing call to action, rewritten every build.
      if (m[2] === 'about') {
        after = after.replace(/<!--z-facts-->[\s\S]*?<!--\/z-facts-->/, '');
        after = after.replace(/<section class="Page-module__tyTi3W__cta">/, x => aboutFacts(m[1]) + x);
      }
      // The language homepages are real pages now (/de, /fr, /it); /?lang=xx only redirects to them.
      after = after.replace(/href="\/\?lang=(en|de|fr|it)"/g, (x, l) => `href="${l === 'en' ? '/' : '/' + l}"`);
    }
    if (after !== before) { fs.writeFileSync(p, after); changed++; }
  }
  return changed;
}

// ── Structured data and head tags ────────────────────────────────────────────
import { SITE, LANGS, homePath, OG_LOCALE } from './seo/meta.mjs';

export const BUSINESS_ID = `${SITE}/#business`;
export const OG_DEFAULT = `${SITE}/assets/og/home.jpg`;

/** The company, once, for every page. (schema.org has no LimousineService type; the old markup used one.) */
const BUSINESS_DESC = {
  en: 'Limousine and chauffeur service for airport transfers from Zürich, Basel and Geneva airports across Switzerland and Europe. Fixed fares, flights monitored, in business since 2004.',
  de: 'Limousinenservice und Chauffeur-Flughafentransfers ab Zürich, Basel und Genf in die ganze Schweiz und nach Europa. Festpreise, Flug überwacht, seit 2004.',
  fr: 'Transferts aéroport avec chauffeur depuis Zurich, Bâle et Genève dans toute la Suisse et en Europe. Prix fixes, vol suivi, depuis 2004.',
  it: 'Transfer aeroportuali con autista da Zurigo, Basilea e Ginevra in tutta la Svizzera e in Europa. Tariffe fisse, volo monitorato, dal 2004.',
};
// The rate card, read from the price engine so it cannot drift: per-km rate with the class minimum, and the hourly rate.
await import(new URL('../public/js/places.js', import.meta.url));
await import(new URL('../public/js/fares.js', import.meta.url));
const offerCatalog = () => {
  const Z = globalThis.ZALS, price = (p, unitCode, extra) => ({ '@type': 'UnitPriceSpecification', price: p, priceCurrency: 'CHF', unitCode, valueAddedTaxIncluded: false, ...extra });
  return {
    '@type': 'OfferCatalog', name: 'Chauffeured transfers and hourly hire',
    itemListElement: Z.CARS.filter(c => Z.TARIFF[c.key]).map(c => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: `${c.name} · ${c.model}`, description: `Up to ${c.seats} passengers and ${c.cases} cases.` },
      priceSpecification: [price(Z.TARIFF[c.key].km, 'KMT', { minPrice: Z.TARIFF[c.key].min }), price(Z.TARIFF[c.key].hr, 'HUR', { eligibleQuantity: { '@type': 'QuantitativeValue', minValue: Z.MIN_HOURS, maxValue: Z.MAX_HOURS, unitCode: 'HUR' } })],
    })),
  };
};

export function business(lang = 'en') {
  return {
    '@type': 'LocalBusiness',
    '@id': BUSINESS_ID,
    name: 'Z-ALS · Zurich-Airport Limousinen Services',
    legalName: 'Zurich-Airport Limousinen Services GmbH',
    // The names the client's customers and the old sites used; the legal name above is the registered one.
    alternateName: ['Z-ALS', 'Zürich-Airport Limousinen Services', 'Zurich Airport Limousine Service'],
    description: BUSINESS_DESC[lang] || BUSINESS_DESC.en,
    url: `${SITE}/`,
    logo: { '@type': 'ImageObject', url: `${SITE}/assets/icon.png`, width: 512, height: 512 },
    image: OG_DEFAULT,
    telephone: '+41 76 272 0909',
    email: 'info@z-als.ch',
    address: { '@type': 'PostalAddress', streetAddress: 'Am Balsberg 36', postalCode: '8302', addressLocality: 'Kloten', addressRegion: 'ZH', addressCountry: 'CH' },
    // ponytail: Am Balsberg, Kloten to ~100 m; swap in the Google Business Profile pin if it differs.
    geo: { '@type': 'GeoCoordinates', latitude: 47.442, longitude: 8.567 },
    hasOfferCatalog: offerCatalog(),
    foundingDate: '2004',
    priceRange: 'CHF 120+',
    currenciesAccepted: 'CHF',
    paymentAccepted: 'Credit card, TWINT, cash',
    knowsLanguage: LANGS,
    areaServed: [
      ...['Switzerland', 'Germany', 'France', 'Italy', 'Austria', 'Liechtenstein'].map(c => ({ '@type': 'Country', name: c })),
      ...['Zürich', 'Basel', 'Geneva', 'Bern', 'Lucerne', 'Interlaken', 'Davos', 'St. Moritz', 'Zermatt'].map(c => ({ '@type': 'City', name: c })),
    ],
    openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' },
    sameAs: [
      'https://www.facebook.com/zurichairportlimousinenservices/',
      'https://www.instagram.com/zurich_airport_limousine/',
      'https://www.linkedin.com/company/145191040/',
      'https://www.tiktok.com/@senol.1962',
      'https://www.youtube.com/@Limousineserv/videos',
      'https://maps.google.com/?cid=14848855290927465453',
    ],
  };
}

export function website(lang = 'en') {
  return { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'Z-ALS', inLanguage: lang, publisher: { '@id': BUSINESS_ID } };
}

export const ld = nodes => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes })}</script>`;
export const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** description, canonical, hreflang, Open Graph, Twitter, theme colour and favicon for one URL. */
export function headTags({ lang = 'en', path: urlPath, title, description, ogImage = OG_DEFAULT, alternates }) {
  const url = /^https:/.test(urlPath) ? urlPath : SITE + urlPath;
  const t = [
    `<meta name="description" content="${esc(description)}">`,
    `<link rel="canonical" href="${url}">`,
    ...(alternates || []).map(([hl, href]) => `<link rel="alternate" hreflang="${hl}" href="${href}">`),
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Z-ALS">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:locale" content="${OG_LOCALE[lang]}">`,
    `<meta property="og:image" content="${ogImage}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    `<meta name="twitter:image" content="${ogImage}">`,
    `<meta name="theme-color" content="#01050B">`,
  ];
  return t.join('\n');
}

/** The four homepage URLs, for hreflang (and the sitemap). */
export const homeAlternates = () => [...LANGS.map(l => [l, SITE + (l === 'en' ? '/' : '/' + l)]), ['x-default', SITE + '/']];
export { homePath };

// ── Restored pages: metadata, canonical, schema ─────────────────────────────
const HERE = path.dirname(fileURLToPath(import.meta.url));
const HOME_LABEL = { en: 'Home', de: 'Startseite', fr: 'Accueil', it: 'Home' };
const SECTION_LABEL = {
  services: { en: 'Services', de: 'Dienstleistungen', fr: 'Services', it: 'Servizi' },
  fleet: { en: 'Fleet', de: 'Flotte', fr: 'Flotte', it: 'Flotta' },
  about: { en: 'About', de: 'Über uns', fr: 'À propos', it: 'Chi siamo' },
  contact: { en: 'Contact', de: 'Kontakt', fr: 'Contact', it: 'Contatti' },
  journal: { en: 'Journal', de: 'Journal', fr: 'Journal', it: 'Journal' },
  transfers: { en: 'Transfers', de: 'Transfers', fr: 'Transferts', it: 'Transfer' },
};

/** title + description per restored page: tools/seo/restored-meta.json, overridden by tools/seo/meta/<lang>__<path>.json. */
export function loadMeta() {
  const table = JSON.parse(fs.readFileSync(path.join(HERE, 'seo', 'restored-meta.json'), 'utf8'));
  const dir = path.join(HERE, 'seo', 'meta');
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json'))) {
      const key = '/' + f.slice(0, -5).replace(/__/g, '/');
      table[key] = { ...table[key], ...JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) };
    }
  }
  return table;
}

const metaTag = (attr, key, content) => `<meta ${attr}="${key}" content="${esc(content)}">`;
function setMeta(html, attr, key, content) {
  const re = new RegExp(`<meta ${attr}="${key.replace(/[:.]/g, '\$&')}" content="[^"]*">`);
  return re.test(html) ? html.replace(re, () => metaTag(attr, key, content)) : html.replace('</head>', () => `${metaTag(attr, key, content)}</head>`);
}
const getMeta = (html, attr, key) => (html.match(new RegExp(`<meta ${attr}="${key.replace(/[:.]/g, '\$&')}" content="([^"]*)">`)) || [])[1];

/**
 * Rewrites one restored page's head: title, description, canonical, Open Graph, Twitter card, theme colour,
 * favicon and one JSON-LD graph (the company, a breadcrumb, and whatever the page already carried: its
 * BlogPosting). `meta` = { title, description }; `extra` = more graph nodes (Service, FAQPage ...).
 */
export function retag(html, { lang, urlPath, meta, extra = [], ogImage, ogType, alternates }) {
  const url = SITE + urlPath;
  const type = ogType || getMeta(html, 'property', 'og:type') || 'website';
  const image = ogImage || getMeta(html, 'property', 'og:image') || OG_DEFAULT;
  const isDefaultImage = image === OG_DEFAULT;
  if (meta && meta.title) html = html.replace(/<title>[^<]*<\/title>/, () => `<title>${esc(meta.title)}</title>`);
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1].replace(/&amp;/g, '&');
  const description = (meta && meta.description) || getMeta(html, 'name', 'description') || '';
  html = setMeta(html, 'name', 'description', description);
  html = setMeta(html, 'property', 'og:title', title);
  html = setMeta(html, 'property', 'og:description', description);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'property', 'og:locale', OG_LOCALE[lang]);
  html = setMeta(html, 'property', 'og:type', type);
  html = setMeta(html, 'property', 'og:site_name', 'Z-ALS');
  html = setMeta(html, 'property', 'og:image', image);
  if (isDefaultImage) { html = setMeta(html, 'property', 'og:image:width', '1200'); html = setMeta(html, 'property', 'og:image:height', '630'); }
  html = setMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = setMeta(html, 'name', 'twitter:title', title);
  html = setMeta(html, 'name', 'twitter:description', description);
  html = setMeta(html, 'name', 'twitter:image', image);
  html = setMeta(html, 'name', 'theme-color', '#01050B');
  html = /<link rel="canonical"/.test(html) ? html.replace(/<link rel="canonical" href="[^"]*">/, () => `<link rel="canonical" href="${url}">`) : html.replace('</head>', () => `<link rel="canonical" href="${url}"></head>`);
  if (alternates) {
    html = html.replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*">/g, '');
    html = html.replace(/(<link rel="canonical" href="[^"]*">)/, m => m + alternates.map(([hl, href]) => `<link rel="alternate" hreflang="${hl}" href="${href}">`).join(''));
  }
  if (!/rel="icon" href="\/favicon\.ico"/.test(html)) html = html.replace(/<link rel="icon"/, () => '<link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="icon"');

  // One JSON-LD graph: keep what the page says about itself (BlogPosting), replace the company node.
  const kept = [];
  html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (m, json) => {
    try { for (const n of [].concat(JSON.parse(json)['@graph'] || JSON.parse(json))) { delete n['@context']; if (n['@type'] === 'BlogPosting') kept.push(n); } } catch (e) {}
    return '';
  });
  for (const n of kept) {
    if (n['@type'] === 'BlogPosting') {
      n.image = image; n.publisher = { '@id': BUSINESS_ID }; n.author = { '@id': BUSINESS_ID };
      n.headline = n.headline || title;
    }
  }
  const parts = urlPath.split('/').filter(Boolean); // [lang, section, ...]
  const crumbs = [{ name: HOME_LABEL[lang], url: SITE + (lang === 'en' ? '/' : '/' + lang) }];
  if (parts[1] && SECTION_LABEL[parts[1]]) crumbs.push({ name: SECTION_LABEL[parts[1]][lang], url: `${SITE}/${lang}/${parts[1]}` });
  if (parts.length > 2) crumbs.push({ name: ((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || title).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim(), url });
  const breadcrumb = parts.length > 1 ? { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })) } : null;
  const graph = [business(lang), ...kept, ...(breadcrumb ? [breadcrumb] : []), ...extra];
  return html.replace('</head>', () => `${ld(graph)}</head>`);
}
