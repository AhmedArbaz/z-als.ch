// Builds the client SEO report from the measurements in docs/seo/baseline and docs/seo/after.
//   node tools/seo-report.mjs [--pdf]      writes docs/seo/z-als-seo-report.html (and .pdf with --pdf)
// The template (docs/seo/report.template.html) holds the words; this file only fills in numbers read from data,
// so the report cannot disagree with the files it cites. Re-run after new Lighthouse/crawl files are saved.
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const seo = p => path.join(root, 'docs/seo', p);
const json = p => JSON.parse(readFileSync(p, 'utf8'));
const DATE = '6 October 2026';

// ---- Lighthouse -----------------------------------------------------------------------------------------
const med = a => { const s = a.filter(x => x != null).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
function lh(files) {
  const runs = files.filter(existsSync).map(json);
  if (!runs.length) return null;
  const score = k => med(runs.map(r => Math.round((r.categories[k]?.score ?? 0) * 100)));
  const val = k => med(runs.map(r => r.audits[k]?.numericValue));
  return { n: runs.length, perf: score('performance'), seo: score('seo'), a11y: score('accessibility'), lcp: val('largest-contentful-paint'), cls: val('cumulative-layout-shift'), kb: val('total-byte-weight') / 1024, tbt: val('total-blocking-time') };
}
const PAGES = [
  { label: 'Home', before: d => [seo(`baseline/lh-home--${d}.json`)], after: d => runs('home--', d) },
  { label: 'Booking form', before: d => [seo(`baseline/lh-home-quote-${d}.json`)], after: d => runs('quote--', d) },
  { label: 'Services', before: d => [seo(`baseline/lh-home-en-services-${d}.json`)], after: d => runs('home-en-services--', d) },
  { label: 'Fleet', before: d => [seo(`baseline/lh-home-en-fleet-${d}.json`)], after: d => runs('home-en-fleet--', d) },
  { label: 'German home', before: () => [], after: d => runs('de--', d) },
  { label: 'Davos route page', before: () => [], after: d => runs('route-davos--', d) },
];
function runs(name, d) { return [seo(`after/lh-${name}${d}.json`), seo(`after/lh-${name}${d}-r2.json`), seo(`after/lh-${name}${d}-r3.json`)]; }
const chip = n => n == null ? '–' : `<span class="chip ${n >= 90 ? 'good' : n >= 50 ? 'warn' : 'bad'}">${n}</span>`;
const pair = (b, a, f) => `<span class="pair">${b == null ? '<span class="before">new</span>' : f(b)}<span class="arrow">→</span>${f(a)}</span>`;
const sec = ms => (ms / 1000).toFixed(1) + ' s';
const clsF = v => v < 0.001 ? '0' : v.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
const sizeF = kb => kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : Math.round(kb) + ' KB';
const scoreCell = (b, a) => `<td>${b == null ? '<span class="before">new</span>' : chip(b)}<span class="arrow">→</span>${chip(a)}</td>`;
function lhRows(device) {
  let maxRuns = 0;
  const rows = PAGES.map(p => {
    const b = lh(p.before(device)), a = lh(p.after(device));
    maxRuns = Math.max(maxRuns, a.n);
    return `<tr><td>${p.label}</td>${scoreCell(b?.perf, a.perf)}${scoreCell(b?.seo, a.seo)}${scoreCell(b?.a11y, a.a11y)}` +
      `<td class="n">${pair(b?.lcp, a.lcp, sec)}</td><td class="n">${pair(b?.cls, a.cls, clsF)}</td><td class="n">${pair(b?.kb, a.kb, sizeF)}</td></tr>`;
  });
  return { html: rows.join('\n'), maxRuns };
}

// Mobile: the same machine and the same added network delay (150 ms per response, files in docs/seo/ab) for the old build
// (commit f340791) and the new one, because Lighthouse's first frame on this machine is held back by network latency
// whatever the page, which made the live runs of 4 and 6 October incomparable.
const AB = [['Home', 'home'], ['Booking form', 'quote'], ['Services', 'services'], ['Fleet', 'fleet']];
const abFiles = (key, build) => [1, 2, 3].map(r => seo(`ab/lh-${key}--${build}-r${r}.json`));
function abRows() {
  let n = 0;
  const html = AB.map(([label, key]) => {
    const b = lh(abFiles(key, 'old')), a = lh(abFiles(key, 'new'));
    n = Math.max(n, a.n, b.n);
    return `<tr><td>${label}</td>${scoreCell(b.perf, a.perf)}${scoreCell(b.seo, a.seo)}${scoreCell(b.a11y, a.a11y)}` +
      `<td class="n">${pair(b.lcp, a.lcp, sec)}</td><td class="n">${pair(b.tbt, a.tbt, ms => Math.round(ms) + ' ms')}</td><td class="n">${pair(b.kb, a.kb, sizeF)}</td></tr>`;
  });
  return { html: html.join('\n'), n };
}

// ---- Crawl ----------------------------------------------------------------------------------------------
const before = json(seo('baseline/crawl-live.json')).summary;
const afterCrawl = json(seo('after/crawl-live.json'));
const after = afterCrawl.summary;
const rows = afterCrawl.rows;
const path_ = r => r.url.replace('https://z-als.ch', '') || '/';
const titleOf = u => (rows.find(r => path_(r) === u) || {}).title || '';

const home = { b: lh(PAGES[0].before('desktop')), a: lh(PAGES[0].after('desktop')) };
const liveM = { b: lh(PAGES[0].before('mobile')), a: lh(PAGES[0].after('mobile')) };
const homeM = { b: lh(abFiles('home', 'old')), a: lh(abFiles('home', 'new')) };
const ba = (label, small, b, a) => `<div class="ba-row" role="row"><div class="ba-label" role="rowheader">${label}${small ? `<small>${small}</small>` : ''}</div><div class="num before" role="cell">${b}</div><div class="num after" role="cell">${a}</div></div>`;
const baRows = [
  ba('Pages in the sitemap', 'one page for each language, plus resort routes', before.pages, after.pages),
  ba('Pages sharing a title with another page', '', before.titleDuplicated, after.titleDuplicated),
  ba('Titles longer than Google shows', '60 characters', before.titleOver60, after.titleOver60),
  ba('Descriptions missing, too short or too long', '', before.descMissing + before.descShort + before.descLong, after.descMissing + after.descShort + after.descLong),
  ba('Pages without a social preview image', '', before.noOgImage, after.noOgImage),
  ba('Pages without structured data', '', before.noJsonld, after.noJsonld),
  ba('German, French and Italian articles still in English', 'of 33', 28, 0),
  ba('Pages sent compressed', '', `${before.gzip} of ${before.pages}`, `${after.gzip} of ${after.pages}`),
  ba('Lighthouse SEO score, home page', '', home.b.seo, home.a.seo),
  ba('Lighthouse performance, home page, desktop', '', home.b.perf, home.a.perf),
  ba('Layout shift while loading, home page, desktop', 'lower is better; Google asks for under 0.1', clsF(home.b.cls), clsF(home.a.cls)),
  ba('Largest paint, home page, mobile', 'old build against new build on one machine, same conditions', sec(homeM.b.lcp), sec(homeM.a.lcp)),
  ba('Data sent for the home page, mobile', 'old build against new build on one machine', sizeF(homeM.b.kb), sizeF(homeM.a.kb)),
  ba('Pages with Tag Manager and consent banner', '', before.gtmPages, after.gtmPages),
].join('\n');

// ---- Keyword tables -------------------------------------------------------------------------------------
const KW = [
  ['/', 'zurich airport transfer'], ['/de', 'flughafentransfer zürich'], ['/fr', 'transfert aéroport zurich'], ['/it', 'transfer aeroporto zurigo'],
  ['/en/services', 'zurich chauffeur service'], ['/de/services', 'chauffeurservice zürich'], ['/fr/services', 'chauffeur privé zurich'], ['/it/services', 'autista privato zurigo'],
  ['/en/fleet', 'mercedes v class chauffeur zurich'], ['/de/fleet', 'v-klasse mit chauffeur'], ['/fr/fleet', 'mercedes classe v avec chauffeur'], ['/it/fleet', 'mercedes classe v con autista'],
];
const homeKeywords = KW.map(([u, k]) => `<tr><td><code>${u}</code></td><td>${k}</td><td>${titleOf(u)}</td></tr>`).join('\n');

const { ROUTES, facts, routeUrl, hubUrl } = await import('./seo/routes.mjs');
const LANG_NAME = { en: 'EN', de: 'DE', fr: 'FR', it: 'IT' };
const chf = n => 'CHF ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '’');
const routesTable = ROUTES.map(r => {
  const f = facts(r);
  const also = r.langs.filter(l => l !== 'en' && l !== 'de').map(l => LANG_NAME[l]).join(', ') || '–';
  return `<tr><td>Zurich Airport to ${r.name.en}${r.via ? ` (${r.via})` : ''}</td><td class="n">${f.km} km</td><td class="n">${f.hours} h ${String(f.minutes).padStart(2, '0')}</td><td class="n">${chf(f.classes.Business.net)}</td>` +
    `<td>${titleOf(routeUrl('en', r.slug))}</td><td>${r.langs.includes('de') ? titleOf(routeUrl('de', r.slug)) : '–'}</td><td>${also}</td></tr>`;
}).join('\n');
const vat = facts(ROUTES[0]).vatPct;

// ---- Inventory ------------------------------------------------------------------------------------------
const kind = u => /^\/(en|de|fr|it)\/transfers/.test(u) ? 'Route pages and overviews' : /\/journal\/./.test(u) ? 'Journal articles' : /\/journal$/.test(u) ? 'Journal indexes'
  : /^\/(en|de|fr|it)\//.test(u) ? 'Services, fleet, about, contact' : (u === '/quote' || u === '/legal') ? 'Booking form and legal' : 'Home pages';
const langOf = u => (u.match(/^\/(en|de|fr|it)\//) || [, ({ '/de': 'de', '/fr': 'fr', '/it': 'it' })[u] || (u === '/' ? 'en' : '')])[1];
const inv = {};
for (const r of rows) { const u = path_(r), k = kind(u), l = langOf(u); (inv[k] ||= { en: 0, de: 0, fr: 0, it: 0, '': 0 })[l]++; }
const ORDER = ['Home pages', 'Services, fleet, about, contact', 'Route pages and overviews', 'Journal indexes', 'Journal articles', 'Booking form and legal'];
const total = o => o.en + o.de + o.fr + o.it + o[''];
const inventory = ORDER.map(k => { const o = inv[k]; return `<tr><td>${k}</td>${['en', 'de', 'fr', 'it'].map(l => `<td class="n">${o[l] || '–'}</td>`).join('')}<td class="n">${total(o)}</td></tr>`; }).join('\n')
  + `<tr><td><b>All pages</b></td>${['en', 'de', 'fr', 'it'].map(l => `<td class="n"><b>${ORDER.reduce((s, k) => s + inv[k][l], 0)}</b></td>`).join('')}<td class="n"><b>${rows.length}</b></td></tr>`;
const routePages = rows.filter(r => /\/transfers\/zurich-airport-to-/.test(r.url)).length;

// ---- Fill the template ----------------------------------------------------------------------------------
const mobile = abRows(), desktop = lhRows('desktop');
const fill = {
  date: DATE, 'ba-rows': baRows, 'home-keywords': homeKeywords, 'routes-table': routesTable, 'lh-desktop': desktop.html, 'lh-mobile': mobile.html,
  runs: mobile.n, 'live-mobile-home': `${liveM.b.perf} → ${liveM.a.perf} (largest paint ${sec(liveM.b.lcp)} → ${sec(liveM.a.lcp)})`, inventory, pages: rows.length, 'route-count': routePages,
};
let html = readFileSync(seo('report.template.html'), 'utf8').replace(/\{\{([\w-]+)\}\}/g, (m, k) => { if (!(k in fill)) throw new Error('no value for {{' + k + '}}'); return fill[k]; });
html = html.replace('Fares are net of 8.1% VAT', `Fares are net of ${vat}% VAT`);
writeFileSync(seo('z-als-seo-report.html'), html);
console.log(`wrote docs/seo/z-als-seo-report.html (${rows.length} pages, mobile median of ${mobile.n} runs)`);

if (process.argv.includes('--pdf')) {
  const { launch } = await import('./pw.mjs');
  const browser = await launch();
  const ctx = await browser.newContext({ colorScheme: 'light', viewport: { width: 1000, height: 1400 } });
  const page = await ctx.newPage();
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${html}</body></html>`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: seo('z-als-seo-report.pdf'), format: 'A4', printBackground: true, margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' }, displayHeaderFooter: true,
    headerTemplate: '<span></span>', footerTemplate: '<div style="font:8px Manrope,Arial,sans-serif;color:#667;width:100%;text-align:center">Z-ALS SEO Report · <span class="pageNumber"></span> / <span class="totalPages"></span></div>' });
  await browser.close();
  console.log('wrote docs/seo/z-als-seo-report.pdf');
}
