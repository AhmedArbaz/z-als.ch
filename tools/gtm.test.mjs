// Browser test of GTM + Consent Mode v2: node tools/gtm.test.mjs [base-url]
// Loads the real container (GTM-MKMXMR2X) from Google, so it needs internet. On a live origin it blocks
// /api/enquiry|contact|checkout; it never submits a form.
import { launch } from './pw.mjs';

const base = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const browser = await launch();
let fails = 0;
// The banner in any of the four languages (public/js/consent.js).
const BANNER = /Help us improve|Helfen Sie uns|Aidez-nous|Aiutaci/;
const check = (ok, msg) => { if (!ok) fails++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); };

async function visit(path, { locale = 'en-CH', choose } = {}) {
  const ctx = await browser.newContext({ locale, viewport: { width: 1280, height: 900 } });
  await ctx.route(/\/api\/(enquiry|contact|checkout)(\?|$)/, r => r.abort());
  await ctx.addInitScript(() => { try { localStorage.zalsGtm = '1'; } catch (e) {} });
  const page = await ctx.newPage();
  const hits = [];
  page.on('request', r => { const u = r.url(); if (/googletagmanager\.com\/gtm\.js|google-analytics\.com\/g\/collect|analytics\.google\.com\/g\/collect|googletagmanager\.com\/(a|g)\//.test(u)) hits.push({ t: Date.now(), u }); });
  await page.goto(base + path, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  return { ctx, page, hits };
}

for (const [lang, locale, path] of [['en', 'en-CH', '/'], ['de', 'de-CH', '/de/about'], ['fr', 'fr-CH', '/fr/services'], ['it', 'it-CH', '/it/fleet'], ['en', 'en-CH', '/quote'], ['en', 'en-CH', '/definitely-missing']]) {
  const tag = `${path} [${lang}]`;
  const { ctx, page, hits } = await visit(path, { locale });
  const dl = await page.evaluate(() => (window.dataLayer || []).map(x => (x && x.length !== undefined && x[0] ? [].slice.call(x) : x)));
  const first = JSON.stringify(dl[0] || '');
  check(/"consent","default"/.test(first) && /"analytics_storage":"denied"/.test(first), `${tag} consent default (denied) is the first dataLayer entry`);
  check(dl.findIndex(x => x && x['gtm.start']) > 0, `${tag} gtm.start comes after the consent default`);
  check(hits.some(h => /gtm\.js\?id=GTM-MKMXMR2X/.test(h.u)), `${tag} gtm.js?id=GTM-MKMXMR2X requested`);
  const banner = page.locator('[role=region]', { hasText: BANNER });
  check(await banner.isVisible(), `${tag} banner visible`);
  const txt = (await banner.innerText()).replace(/\s+/g, ' ');
  const expect = { en: 'Help us improve the site', de: 'Helfen Sie uns, die Website zu verbessern', fr: 'Aidez-nous à améliorer le site', it: 'Aiutaci a migliorare il sito' }[lang];
  check(txt.includes(expect), `${tag} banner is in ${lang}`);
  const cookiesBefore = (await ctx.cookies()).filter(c => /^_ga/.test(c.name)).length;
  check(cookiesBefore === 0, `${tag} no _ga cookies before a choice`);
  await ctx.close();
}

// Decline: no analytics storage, banner stays away on the next page.
{
  const { ctx, page } = await visit('/en/about');
  await page.getByRole('button', { name: /^Decline$/ }).click();
  await page.waitForTimeout(1500);
  const dl = JSON.stringify(await page.evaluate(() => (window.dataLayer || []).map(x => (x && x[0] ? [].slice.call(x) : x))));
  check(/"consent","update",\{"analytics_storage":"denied"\}/.test(dl), 'decline sends consent update denied');
  check((await ctx.cookies()).filter(c => /^_ga/.test(c.name)).length === 0, 'decline: still no _ga cookies');
  await page.goto(base + '/en/fleet', { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  check(!(await page.locator('[role=region]', { hasText: BANNER }).isVisible()), 'choice is remembered on the next page');
  check(await page.locator('[data-consent-open]').count() === 1, '"Cookie settings" link is present after a choice');
  await ctx.close();
}

// Accept: consent granted, and (if the container has a GA4 tag) a collect hit follows.
{
  const { ctx, page, hits } = await visit('/');
  const before = hits.length;
  await page.getByRole('button', { name: /^Accept$/ }).click();
  await page.waitForTimeout(4000);
  const dl = JSON.stringify(await page.evaluate(() => (window.dataLayer || []).map(x => (x && x[0] ? [].slice.call(x) : x))));
  check(/"consent","update",\{"analytics_storage":"granted"\}/.test(dl), 'accept sends consent update granted');
  const ga = hits.filter(h => /\/g\/collect/.test(h.u));
  console.log(`info GA4 collect requests seen: ${ga.length} (before accept ${hits.slice(0, before).filter(h => /\/g\/collect/.test(h.u)).length})`);
  // Not a failure of the site: it means the published container has no GA4 tag (check the version's tags in GTM).
  console.log(ga.length ? 'ok   a GA4 collect request is sent' : 'WARN no GA4 collect request: the published GTM container has no GA4 tag yet');
  const cookies = (await ctx.cookies()).filter(c => /^_ga/.test(c.name)).map(c => c.name);
  console.log('info cookies after accept:', cookies.join(', ') || '(none)');
  // Change of mind from the footer link.
  await page.locator('[data-consent-open]').first().click();
  check(await page.locator('[role=region]', { hasText: BANNER }).isVisible(), 'Cookie settings re-opens the banner');
  await ctx.close();
}

await browser.close();
console.log(fails ? `\n${fails} check(s) failed` : '\nall checks passed');
process.exit(fails ? 1 : 0);
