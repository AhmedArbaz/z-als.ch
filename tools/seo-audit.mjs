// Crawl a site from its sitemap and report SEO facts per page.
//   node tools/seo-audit.mjs <base-url> [out.json]
// No dependencies. Used for the before/after numbers in the SEO report.
import { writeFileSync } from 'node:fs';

const base = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const out = process.argv[3];

const attr = (tag, name) => (tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, 'i')) || [])[1];
const all = (re, s) => [...s.matchAll(re)];
const strip = s => s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

async function page(url) {
  const r = await fetch(url, { redirect: 'manual', headers: { 'accept-encoding': 'gzip, br' } });
  const html = r.status === 200 ? await r.text() : '';
  const head = (html.match(/<head[\s\S]*?<\/head>/i) || [''])[0];
  const metas = all(/<meta\b[^>]*>/gi, head).map(m => m[0]);
  const meta = n => { const m = metas.find(t => attr(t, 'name') === n || attr(t, 'property') === n); return m && attr(m, 'content'); };
  const links = all(/<link\b[^>]*>/gi, head).map(m => m[0]);
  const ld = all(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi, html).map(m => { try { return JSON.parse(m[1]); } catch { return { _invalid: true }; } });
  const types = ld.flatMap(j => (j['@graph'] || [j]).map(x => x['@type'])).flat().filter(Boolean);
  const body = (html.match(/<body[\s\S]*<\/body>/i) || [''])[0];
  return {
    url, status: r.status, location: r.headers.get('location') || undefined,
    encoding: r.headers.get('content-encoding') || '', etag: !!r.headers.get('etag'), bytes: html.length,
    lang: (html.match(/<html[^>]*\blang="([^"]*)"/i) || [])[1],
    title: (head.match(/<title>([\s\S]*?)<\/title>/i) || [])[1],
    description: meta('description'),
    canonical: links.filter(t => attr(t, 'rel') === 'canonical').map(t => attr(t, 'href'))[0],
    hreflang: links.filter(t => attr(t, 'rel') === 'alternate' && attr(t, 'hreflang')).map(t => `${attr(t, 'hreflang')}=${attr(t, 'href')}`),
    og: ['og:title', 'og:description', 'og:image', 'og:locale', 'og:url'].filter(n => meta(n)),
    twitter: !!meta('twitter:card'),
    robots: meta('robots'),
    h1: all(/<h1\b/gi, body).length, h2: all(/<h2\b/gi, body).length,
    main: /<main\b/i.test(body),
    words: strip(body).split(' ').length,
    imgs: all(/<img\b[^>]*>/gi, body).length,
    imgNoAlt: all(/<img\b[^>]*>/gi, body).filter(m => !/\balt=/i.test(m[0])).length,
    imgNoSize: all(/<img\b[^>]*>/gi, body).filter(m => !/\bwidth=/i.test(m[0])).length,
    jsonld: types, jsonldInvalid: ld.some(j => j._invalid),
    gtm: all(/googletagmanager\.com\/gtm\.js/g, html).length, gtmNoscript: all(/googletagmanager\.com\/ns\.html/g, html).length,
  };
}

const sitemap = await (await fetch(base + '/sitemap.xml')).text();
const urls = all(/<loc>([^<]+)<\/loc>/g, sitemap).map(m => m[1].replace(/^https?:\/\/[^/]+/, base));
const rows = [];
for (let i = 0; i < urls.length; i += 8) rows.push(...await Promise.all(urls.slice(i, i + 8).map(page)));

const dup = k => { const c = {}; rows.forEach(r => r[k] && (c[r[k]] = (c[r[k]] || 0) + 1)); return Object.values(c).filter(n => n > 1).reduce((a, b) => a + b, 0); };
const summary = {
  base, pages: rows.length, non200: rows.filter(r => r.status !== 200).length,
  titleMissing: rows.filter(r => !r.title).length, titleOver60: rows.filter(r => (r.title || '').length > 60).length, titleDuplicated: dup('title'),
  descMissing: rows.filter(r => !r.description).length, descShort: rows.filter(r => r.description && r.description.length < 120).length,
  descLong: rows.filter(r => (r.description || '').length > 160).length, descDuplicated: dup('description'),
  noCanonical: rows.filter(r => !r.canonical).length, noHreflang: rows.filter(r => !r.hreflang.length).length,
  noOgImage: rows.filter(r => !r.og.includes('og:image')).length, noJsonld: rows.filter(r => !r.jsonld.length).length,
  noMain: rows.filter(r => !r.main).length, imgNoSize: rows.reduce((a, r) => a + r.imgNoSize, 0),
  gtmPages: rows.filter(r => r.gtm === 1 && r.gtmNoscript === 1).length, gtmBad: rows.filter(r => r.gtm > 1 || r.gtmNoscript > 1).length,
  gzip: rows.filter(r => r.encoding).length,
};
const result = { summary, rows };
if (out) writeFileSync(out, JSON.stringify(result, null, 1));
console.log(JSON.stringify(summary, null, 1));
