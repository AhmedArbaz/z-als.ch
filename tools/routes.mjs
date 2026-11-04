// Builds the route landing pages and the hubs: public/<lang>/transfers/zurich-airport-to-<slug>.html and
// public/<lang>/transfers.html. Layout, header and footer are the restored pages' (taken from <lang>/about.html);
// the words come from tools/seo/routes/<slug>.<lang>.json; distances, times and fares from the price engine.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS, ROUTES, GUIDES, facts, routeUrl, hubUrl, pagesFor, alternatesFor, hubAlternates } from './seo/routes.mjs';
import { translator } from './translate.mjs';
import { esc } from './seo.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = c => `Page-module__tyTi3W__${c}`;
const NF = { en: 'en-GB', de: 'de-CH', fr: 'fr-CH', it: 'it-CH' };
const tx = html => html.replace(/&amp;/g, '&');

const L = {
  en: { route: 'Route', fares: 'Fixed fares', cls: 'Class', net: 'Fare excl. VAT', gross: 'Fare incl. {vat} VAT', others: 'Other routes from Zürich Airport', all: 'All routes and fares →', faq: 'Frequently asked questions', min: 'min', h: 'h', from: 'Zürich Airport', hubRoutes: 'Routes and fares', book: 'Request a quote', fareCap: 'Fixed fares from Zürich Airport, per car, one way', pax: 'passengers', cases: 'cases' },
  de: { route: 'Strecke', fares: 'Festpreise', cls: 'Klasse', net: 'Preis exkl. MwSt.', gross: 'Preis inkl. {vat} MwSt.', others: 'Weitere Strecken ab Flughafen Zürich', all: 'Alle Strecken und Preise →', faq: 'Häufige Fragen', min: 'Min.', h: 'Std.', from: 'Flughafen Zürich', hubRoutes: 'Strecken und Preise', book: 'Offerte anfragen', fareCap: 'Festpreise ab Flughafen Zürich, pro Fahrzeug, einfache Fahrt', pax: 'Personen', cases: 'Koffer' },
  fr: { route: 'Trajet', fares: 'Tarifs fixes', cls: 'Classe', net: 'Tarif hors TVA', gross: 'Tarif TVA {vat} incluse', others: 'Autres trajets depuis l’aéroport de Zurich', all: 'Tous les trajets et tarifs →', faq: 'Questions fréquentes', min: 'min', h: 'h', from: 'Aéroport de Zurich', hubRoutes: 'Trajets et tarifs', book: 'Demander un devis', fareCap: 'Tarifs fixes depuis l’aéroport de Zurich, par véhicule, aller simple', pax: 'passagers', cases: 'valises' },
  it: { route: 'Tratta', fares: 'Tariffe fisse', cls: 'Classe', net: 'Tariffa IVA esclusa', gross: 'Tariffa IVA {vat} inclusa', others: 'Altre tratte dall’aeroporto di Zurigo', all: 'Tutte le tratte e tariffe →', faq: 'Domande frequenti', min: 'min', h: 'h', from: 'Aeroporto di Zurigo', hubRoutes: 'Tratte e tariffe', book: 'Richiedi un preventivo', fareCap: 'Tariffe fisse dall’aeroporto di Zurigo, per veicolo, solo andata', pax: 'passeggeri', cases: 'valigie' },
};
const CARS = [['Business', 'Business'], ['Premium', 'Premium'], ['SUV', 'SUV'], ['Van', 'Business Van']];

const money = (n, lang, dec = 0) => 'CHF ' + new Intl.NumberFormat(NF[lang], { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n);
const duration = (f, lang) => { const l = L[lang]; return f.hours ? `${f.hours} ${l.h}${f.minutes ? ` ${f.minutes} ${l.min}` : ''}` : `${f.minutes} ${l.min}`; };

function tokens(f, lang) {
  return { km: String(f.km), time: duration(f, lang), vat: `${f.vatPct}%`,
    priceBusiness: money(f.classes.Business.net, lang), pricePremium: money(f.classes.Premium.net, lang), priceSuv: money(f.classes.SUV.net, lang), priceVan: money(f.classes.Van.net, lang) };
}
// Taxi and train figures for the guide pages: tools/seo/external-prices.json, with its sources and the day they were checked.
// They are not ours to keep current, so a check older than 6 months stops the build until someone looks again.
const CHANGES = { en: n => `${n} change${n === 1 ? '' : 's'}`, de: n => `${n} Umstieg${n === 1 ? '' : 'e'}`, fr: n => `${n} changement${n === 1 ? '' : 's'}`, it: n => `${n} cambi${n === 1 ? 'o' : ''}` };
export function externalTokens(ext, lang, today = new Date().toISOString().slice(0, 10)) {
  const limit = new Date(ext.checked); limit.setMonth(limit.getMonth() + 6);
  if (new Date(today) > limit) throw new Error(`tools/seo/external-prices.json was checked ${ext.checked}, older than 6 months: re-check the taxi and train figures and their sources, then update "checked"`);
  const n = (x, d = 2) => new Intl.NumberFormat(NF[lang], { minimumFractionDigits: d, maximumFractionDigits: d }).format(x);
  const per = { en: 'per km', de: 'pro km', fr: 'par km', it: 'al km' }[lang];
  const tk = { trainCity: `CHF ${n(ext.trainCity)}`, trainCityTime: `${ext.trainCityMinutes} ${L[lang].min}`, taxiCity: `CHF ${ext.taxiCityMin}–${ext.taxiCityMax}`,
    taxiTariff: `CHF ${n(ext.taxiBase)} + CHF ${n(ext.taxiKm)} ${per}`,
    checked: new Intl.DateTimeFormat(NF[lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(ext.checked)) };
  for (const [slug, t] of Object.entries(ext.trains)) {
    const key = camel(slug);
    tk[`train${key}`] = duration({ hours: Math.floor(t.minutes / 60), minutes: t.minutes % 60 }, lang);
    tk[`train${key}Changes`] = CHANGES[lang](t.changes);
  }
  return tk;
}

// Guide pages (GUIDES in tools/seo/routes.mjs): answer-first comparisons at /<lang>/transfers/<slug>, rendered like the hub.
const guideUrl = (lang, slug) => `/${lang}/transfers/${slug}`;
const guideAlternates = g => [...g.langs.map(l => [l, `https://z-als.ch${guideUrl(l, g.slug)}`]), ['x-default', `https://z-als.ch${guideUrl('en', g.slug)}`]];
const EXT = JSON.parse(fs.readFileSync(new URL('./seo/external-prices.json', import.meta.url), 'utf8'));
const camel = slug => slug.replace(/-(\w)/g, (m, c) => c.toUpperCase()).replace(/^\w/, c => c.toUpperCase());
/** Every route's Business fare, drive time and distance ({priceZermatt}, {timeZermatt}, {kmZermatt}), plus Zürich city ({priceCity}…). */
function guideTokens(lang) {
  const tk = {};
  for (const r of ROUTES) { const f = facts(r), k = camel(r.slug); Object.assign(tk, { [`price${k}`]: money(f.classes.Business.net, lang), [`pricePremium${k}`]: money(f.classes.Premium.net, lang), [`priceVan${k}`]: money(f.classes.Van.net, lang), [`time${k}`]: duration(f, lang), [`km${k}`]: String(f.km) }); }
  const city = c => globalThis.ZALS.quoteFor({ tripType: 'oneway', pickup: 'Zürich Airport · ZRH', dest: 'Zürich city', vehicle: c }).net;
  return { ...tk, priceCity: money(city('Business'), lang), pricePremiumCity: money(city('Premium'), lang), priceVanCity: money(city('Van'), lang) };
}

const fill = (s, tk) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in tk ? tk[k] : m));
const text = (s, tk) => esc(fill(s, tk)).replace(/&quot;/g, '"');

function fareTable(f, lang) {
  const l = L[lang], t = translator(lang);
  const rows = CARS.map(([key, name]) => {
    const c = f.classes[key];
    return `<tr><th scope="row">${esc(t(name))}<span class="${P('stepBody')}">${esc(t(c.model))} · ${c.seats} ${l.pax} · ${c.cases} ${l.cases}</span></th><td class="${P('num')}">${money(c.net, lang, 2)}</td><td class="${P('num')}">${money(c.gross, lang, 2)}</td></tr>`;
  }).join('');
  return `<div class="${P('tableWrap')}"><table class="${P('table')}"><caption>${esc(l.fareCap)}</caption><thead><tr><th scope="col">${l.cls}</th><th scope="col">${l.net}</th><th scope="col">${esc(l.gross.replace('{vat}', f.vatPct + '%'))}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function otherRoutes(lang, exceptSlug, current) {
  const l = L[lang];
  const rows = pagesFor(lang).filter(r => r.slug !== exceptSlug).map(r => {
    const f = facts(r);
    return `<tr><th scope="row"><a href="${routeUrl(lang, r.slug)}">${esc(l.from)} → ${esc(r.name[lang])}</a><span class="${P('stepBody')}">${f.km} km · ${esc(duration(f, lang))}</span></th><td class="${P('num')}">${money(f.classes.Business.net, lang, 2)}</td></tr>`;
  }).join('');
  return `<section class="${P('sectionInk')}"><div class="${P('wrap')}"><div class="${P('eyebrow')}">${esc(exceptSlug ? l.others : l.hubRoutes)}</div><div class="${P('tableWrap')}"><table class="${P('table')}"><tbody>${rows}</tbody></table></div>${exceptSlug ? `<p style="margin-top:24px"><a class="${P('eyebrow')}" href="${hubUrl(lang)}">${esc(l.all)}</a></p>` : ''}${GUIDES.filter(g => g.langs.includes(lang) && g.slug !== current).map(g => `<p style="margin-top:16px"><a class="${P('eyebrow')}" href="${guideUrl(lang, g.slug)}">${esc(g.label[lang])} →</a></p>`).join('')}</div></section>`;
}

const quoteHref = (lang, dest) => `/quote?${dest ? `trip=oneway&pickup=${encodeURIComponent('Zürich Airport · ZRH').replace(/%20/g, '+')}&dest=${encodeURIComponent(dest).replace(/%20/g, '+')}&` : ''}lang=${lang}`;

function prose(c, tk, lang) {
  const out = [];
  for (const p of c.intro) out.push(`<p>${text(p, tk)}</p>`);
  for (const s of c.sections) {
    out.push(`<h2>${text(s.h2, tk)}</h2>`);
    for (const p of s.paragraphs) out.push(`<p>${text(p, tk)}</p>`);
    if (s.bullets && s.bullets.length) out.push(`<ul>${s.bullets.map(b => `<li>${text(b, tk)}</li>`).join('')}</ul>`);
  }
  out.push(`<h2>${esc(L[lang].faq)}</h2>`);
  for (const f of c.faq) out.push(`<h3>${text(f.q, tk)}</h3><p>${text(f.a, tk)}</p>`);
  return out.join('');
}

function main({ lang, c, tk, f, r, cta, slug }) {
  const l = L[lang];
  const eyebrow = r ? `${l.route} · ${l.from} → ${r.name[lang]} · ${f.km} km · ${duration(f, lang)}` : c.eyebrow ? fill(c.eyebrow, tk) : l.hubRoutes;
  const hero = `<section class="${P('hero')}"><div aria-hidden="true" class="${P('heroScrim')}"></div><div aria-hidden="true" class="${P('heroGlow')}"></div><div class="${P('heroInner')}"><div class="${P('eyebrowRow')}"><span class="${P('rule')}"></span><span class="${P('eyebrow')}">${esc(eyebrow)}</span></div><h1 class="${P('h1')}">${text(c.h1, tk)}</h1><p class="${P('lede')}">${text(c.lede, tk)}</p></div></section>`;
  const fares = r ? `<section class="${P('sectionInk')}"><div class="${P('wrap')}"><div class="${P('eyebrow')}">${esc(l.fares)}</div>${fareTable(f, lang)}<p class="${P('stepBody')}" style="max-width:72ch">${text(c.priceNote, tk)}</p></div></section>` : '';
  const body = `<section class="${P('sectionDark')}"><div class="${P('wrap')}"><article class="${P('prose')}">${prose(c, tk, lang)}</article></div></section>`;
  const others = otherRoutes(lang, r && r.slug, slug);
  return `<main>${hero}${fares}${body}${others}${cta}</main>`;
}

const faqNode = (c, tk, url) => ({ '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: c.faq.map(q => ({ '@type': 'Question', name: fill(q.q, tk), acceptedAnswer: { '@type': 'Answer', text: fill(q.a, tk) } })) });
function serviceNode(r, f, lang, c, tk, url) {
  return { '@type': 'Service', '@id': `${url}#service`, name: fill(c.h1, tk), serviceType: 'Chauffeur transfer', provider: { '@id': 'https://z-als.ch/#business' }, inLanguage: lang,
    areaServed: [{ '@type': 'Place', name: 'Zürich Airport' }, { '@type': 'City', name: r.name[lang] }],
    offers: CARS.map(([key, name]) => ({ '@type': 'Offer', name: `${name} · ${f.classes[key].model}`, price: f.classes[key].net.toFixed(2), priceCurrency: 'CHF',
      priceSpecification: { '@type': 'PriceSpecification', price: f.classes[key].net.toFixed(2), priceCurrency: 'CHF', valueAddedTaxIncluded: false }, url: 'https://z-als.ch' + quoteHref(lang, r.dest).replace(/&lang=\w+$/, '') })) };
}

/** Writes every page whose content file exists; returns the page records processStatic needs. */
export function buildRoutes(OUT) {
  const done = [];
  const missing = [];
  for (const lang of LANGS) {
    const skeletonFile = path.join(OUT, lang, 'about.html');
    const skeleton = fs.readFileSync(skeletonFile, 'utf8');
    const cta0 = (skeleton.match(/<section class="[^"]*__cta">[\s\S]*?<\/section>/) || [])[0];
    if (!cta0) throw new Error(`${lang}/about.html has no call-to-action section`);
    const ctaFor = dest => cta0.replace(/href="\/quote\?lang=\w+"/, `href="${quoteHref(lang, dest)}"`);
    const targets = [...pagesFor(lang).map(r => ({ r, slug: r.slug, url: routeUrl(lang, r.slug) })), { r: null, slug: '_hub', url: hubUrl(lang) },
      ...GUIDES.filter(g => g.langs.includes(lang)).map(g => ({ r: null, g, slug: g.slug, url: guideUrl(lang, g.slug) }))];
    for (const { r, g, slug, url } of targets) {
      const file = path.join(ROOT, 'tools', 'seo', 'routes', `${slug}.${lang}.json`);
      if (!fs.existsSync(file)) { missing.push(`${slug}.${lang}`); continue; }
      const c = JSON.parse(fs.readFileSync(file, 'utf8'));
      const f = r ? facts(r) : facts(ROUTES[0]);
      const tk = g ? { ...tokens(f, lang), ...guideTokens(lang), ...externalTokens(EXT, lang) } : tokens(f, lang);
      // The header's language links point at the same page in the other languages (the hub where this route has no page
      // in that language); the skeleton's Company item is not this page's section, so it loses its "current" mark.
      const langHref = l => (r && r.langs.includes(l) ? routeUrl(l, r.slug) : g && g.langs.includes(l) ? guideUrl(l, g.slug) : hubUrl(l));
      const html = skeleton
        .replace(/<main[\s\S]*<\/main>/, () => main({ lang, c, tk, f, r, slug, cta: ctaFor(r && r.dest) }))
        .replace(/<a hreflang="(en|de|fr|it)"([^>]*?) href="[^"]*">/g, (m, l, rest) => `<a hreflang="${l}"${rest} href="${langHref(l)}">`)
        .replace(/(<a class="[^"]*navItem[^"]*") aria-current="page"/g, '$1');
      const rel = url.slice(1) + '.html';
      fs.mkdirSync(path.dirname(path.join(OUT, rel)), { recursive: true });
      fs.writeFileSync(path.join(OUT, rel), html);
      const full = 'https://z-als.ch' + url;
      done.push({ file: rel, lang, urlPath: url, meta: { title: fill(c.title, tk), description: fill(c.description, tk) },
        alternates: r ? alternatesFor(r) : g ? guideAlternates(g) : hubAlternates(), extra: [...(r ? [serviceNode(r, f, lang, c, tk, full)] : []), faqNode(c, tk, full)], slug });
    }
  }
  return { pages: done, missing };
}
