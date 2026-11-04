// Static SEO checks over every URL in the sitemap: node tools/seo.test.mjs [base-url]
// Fails (exit 1) on: bad status, missing/duplicate/over-long titles or descriptions, wrong canonical, broken hreflang,
// missing or doubled GTM, JSON-LD that does not parse or whose FAQ is not on the page, English left on a DE/FR/IT page,
// internal links to redirects, missing images, robots.txt / sitemap problems.
const base = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const SITE = 'https://z-als.ch';
let fails = 0;
const fail = (m) => { fails++; console.log('FAIL ' + m); };

const get = async (p, opt = {}) => fetch(base + p, { redirect: 'manual', ...opt });
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, 'i')) || [])[1];
const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');

const sitemap = await (await get('/sitemap.xml')).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(SITE, ''));
const sitemapAlt = new Map();
for (const m of sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
  const loc = (m[1].match(/<loc>([^<]+)<\/loc>/) || [])[1];
  sitemapAlt.set(loc, [...m[1].matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map(x => [x[1], x[2]]));
}
console.log(`${urls.length} URLs in sitemap.xml`);

const pages = new Map();
for (let i = 0; i < urls.length; i += 8) {
  await Promise.all(urls.slice(i, i + 8).map(async u => {
    const r = await get(u);
    if (r.status !== 200) { fail(`${u}: status ${r.status}`); return; }
    pages.set(u, await r.text());
  }));
}

const STOP = { en: ['the', 'and', 'of', 'to', 'is', 'that', 'for', 'with', 'are', 'was', 'this', 'not', 'we', 'you', 'have', 'be', 'as', 'your'], de: ['der', 'die', 'das', 'und', 'ist', 'nicht', 'mit', 'für', 'den', 'ein', 'eine', 'wir', 'sie', 'zu'], fr: ['le', 'la', 'les', 'et', 'est', 'des', 'une', 'pour', 'pas', 'que', 'nous', 'vous', 'du', 'un'], it: ['il', 'la', 'le', 'e', 'è', 'di', 'che', 'per', 'non', 'una', 'con', 'del', 'dei', 'un'] };
const titles = new Map(), descs = new Map(), hreflangs = new Map();
const imgChecked = new Set();

for (const [u, html] of pages) {
  const head = (html.match(/<head[\s\S]*?<\/head>/i) || [''])[0];
  const body = (html.match(/<body[\s\S]*<\/body>/i) || [''])[0];
  const lang = (html.match(/<html[^>]*\blang="([^"]*)"/i) || [])[1];
  const expectLang = /^\/(de|fr|it)(\/|$)/.test(u) ? u.split('/')[1] : /^\/(en)(\/|$)/.test(u) ? 'en' : 'en';
  if (lang !== expectLang && !(u === '/quote' || u === '/legal')) fail(`${u}: <html lang="${lang}"> should be "${expectLang}"`);

  const title = decode((head.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
  if (!title || title.length > 60 || title.length < 15) fail(`${u}: title is ${title.length} chars: "${title}"`);
  titles.set(title, [...(titles.get(title) || []), u]);
  const dTag = (head.match(/<meta name="description"[^>]*>/) || [''])[0];
  const desc = decode(attr(dTag, 'content') || '');
  if (desc.length < 120 || desc.length > 160) fail(`${u}: description is ${desc.length} chars`);
  descs.set(desc, [...(descs.get(desc) || []), u]);

  const canon = attr((head.match(/<link rel="canonical"[^>]*>/) || [''])[0], 'href');
  if (canon !== SITE + (u === '/' ? '/' : u)) fail(`${u}: canonical is ${canon}`);
  const alts = [...head.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map(m => [m[1], m[2]]);
  hreflangs.set(SITE + u, alts);
  if (alts.length) {
    if (!alts.some(([, h]) => h === canon)) fail(`${u}: hreflang set does not contain the page itself`);
    if (!alts.some(([l]) => l === 'x-default')) fail(`${u}: hreflang has no x-default`);
  }
  const inMap = sitemapAlt.get(SITE + u);
  if (inMap && inMap.length && alts.length && JSON.stringify(inMap.map(x => x.join('=')).sort()) !== JSON.stringify(alts.map(x => x.join('=')).sort())) fail(`${u}: sitemap hreflang differs from the page's`);

  for (const p of ['og:title', 'og:description', 'og:url', 'og:image', 'og:locale', 'twitter:card']) if (!new RegExp(`(property|name)="${p}"`).test(head)) fail(`${u}: missing ${p}`);
  const og = attr((head.match(/<meta property="og:image"[^>]*>/) || [''])[0], 'content') || '';
  if (!/^https:\/\/z-als\.ch\//.test(og)) fail(`${u}: og:image is not absolute: ${og}`);
  else if (!imgChecked.has(og)) { imgChecked.add(og); const r = await get(og.replace(SITE, ''), { method: 'HEAD' }); if (r.status !== 200) fail(`${u}: og:image ${og} → ${r.status}`); }

  const gtm = (html.match(/googletagmanager\.com\/gtm\.js\?id='\+i/g) || []).length, id = (html.match(/'GTM-MKMXMR2X'/g) || []).length, ns = (html.match(/googletagmanager\.com\/ns\.html\?id=GTM-MKMXMR2X/g) || []).length;
  if (gtm !== 1 || id !== 1 || ns !== 1) fail(`${u}: GTM snippet ×${gtm} (id ×${id}), noscript ×${ns} (want 1 each)`);
  if (!/analytics_storage:'denied'/.test(head)) fail(`${u}: consent default missing`);

  const h1 = (body.match(/<h1\b/g) || []).length;
  if (h1 !== 1) fail(`${u}: ${h1} h1 elements`);

  const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
  if (!ldBlocks.length) fail(`${u}: no JSON-LD`);
  const nodes = [];
  for (const b of ldBlocks) { try { const j = JSON.parse(b); nodes.push(...(j['@graph'] || [j])); } catch (e) { fail(`${u}: JSON-LD does not parse`); } }
  const types = nodes.map(n => n['@type']);
  if (!types.includes('LocalBusiness')) fail(`${u}: JSON-LD has no LocalBusiness`);
  if (types.includes('LimousineService')) fail(`${u}: JSON-LD still uses LimousineService (not a schema.org type)`);
  const visible = decode(body.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
  for (const n of nodes.filter(x => x['@type'] === 'FAQPage')) for (const q of n.mainEntity) {
    if (!visible.includes(q.name.replace(/\s+/g, ' ')) ) fail(`${u}: FAQ question not visible on the page: "${q.name}"`);
    if (!visible.includes(q.acceptedAnswer.text.replace(/\s+/g, ' ').slice(0, 60))) fail(`${u}: FAQ answer not visible on the page: "${q.name}"`);
  }
  for (const n of nodes.filter(x => x['@type'] === 'Service')) for (const o of n.offers || []) {
    const shown = new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2 }).format(+o.price);
    if (!visible.includes(shown) && !visible.includes(new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2 }).format(+o.price)) && !visible.includes(new Intl.NumberFormat('fr-CH', { minimumFractionDigits: 2 }).format(+o.price)) && !visible.includes(new Intl.NumberFormat('it-CH', { minimumFractionDigits: 2 }).format(+o.price))) fail(`${u}: Offer price ${o.price} is not shown on the page`);
  }
  // Footer "Ask AI about Z-ALS": the four assistants, each opened with the question in the page's language.
  {
    const want = { chatgpt: 'https://chatgpt.com/?q=', claude: 'https://claude.ai/new?q=', gemini: 'https://www.google.com/search?udm=50&q=', perplexity: 'https://www.perplexity.ai/search?q=' };
    const qLang = (u === '/quote' || u === '/legal') ? 'en' : expectLang;
    const QWORD = { en: 'What is Z-ALS', de: 'Was ist Z-ALS', fr: 'Qu’est-ce que Z-ALS', it: 'Che cos’è Z-ALS' }[qLang];
    for (const [p, prefix] of Object.entries(want)) {
      const a = (html.match(new RegExp(`<a [^>]*data-ask-ai="${p}"[^>]*>`)) || [])[0];
      if (!a) { fail(`${u}: footer has no Ask-AI link for ${p}`); continue; }
      const href = decode(attr(a, 'href') || '');
      if (!href.startsWith(prefix) || !decodeURIComponent(href.slice(prefix.length).replace(/\+/g, ' ')).startsWith(QWORD)) fail(`${u}: ${p} link does not ask in ${qLang}: ${href.slice(0, 90)}`);
      if (!/target="_blank"/.test(a) || !/rel="noopener/.test(a)) fail(`${u}: ${p} link must open a new tab with rel=noopener`);
    }
  }

  // The quotable fact sheet: phone as plain text and the per-km rate, in the static HTML (no JS needed).
  if (/^\/(de|fr|it)?$|^\/(en|de|fr|it)\/about$/.test(u)) {
    if (!visible.includes('+41 76 272 0909')) fail(`${u}: phone number not in the page text`);
    if (!/CHF 6[.,]00 (per|pro|par|al) km/.test(visible)) fail(`${u}: fact sheet rate (CHF 6.00 per km) not in the page text`);
  }

  // Language: a page that says it is DE/FR/IT must read as that language.
  if (expectLang !== 'en' && u !== '/quote' && u !== '/legal') {
    const ws = visible.toLowerCase().match(/[a-zà-ÿ']{2,}/g) || [];
    const share = list => ws.filter(w => list.includes(w)).length / Math.max(1, ws.length);
    const enShare = share(STOP.en.filter(x => !STOP[expectLang].includes(x)));
    if (enShare > 0.04) fail(`${u}: ${(enShare * 100).toFixed(1)}% English function words on a ${expectLang} page`);
    if (share(STOP[expectLang]) < 0.07) fail(`${u}: does not read as ${expectLang}`);
  }

  // Internal links must not pass through a redirect.
  for (const m of html.matchAll(/href="(\/[^"#]*)/g)) {
    const h = m[1];
    if (/^\/\?lang=/.test(h)) fail(`${u}: link to ${h} (use the language homepage)`);
  }
}
for (const [t, us] of titles) if (us.length > 1) fail(`duplicate title "${t}": ${us.join(', ')}`);
for (const [d, us] of descs) if (us.length > 1) fail(`duplicate description on ${us.join(', ')}`);

// hreflang must be reciprocal: every page an alternate points to points back.
for (const [page, alts] of hreflangs) for (const [, href] of alts) {
  const back = hreflangs.get(href);
  if (!back) fail(`${page}: hreflang → ${href} is not a sitemap page`);
  else if (!back.some(([, h]) => h === page)) fail(`${page}: hreflang → ${href}, which does not link back`);
}

// Redirects and robots.
for (const [p, to] of [['/index.html', '/'], ['/quote.html', '/quote'], ['/en', '/'], ['/de/', '/de'], ['/en/about.html', '/en/about'], ['/?lang=de&utm_source=t', '/de?utm_source=t']]) {
  const r = await get(p);
  const loc = (r.headers.get('location') || '').replace(base, '').replace(SITE, '');
  if (r.status !== 301 || loc !== to) fail(`${p}: expected 301 → ${to}, got ${r.status} ${loc}`);
}
const robots = await (await get('/robots.txt')).text();
if (!/Disallow:\s*\/api\//.test(robots)) fail('robots.txt does not disallow /api/');
if (!/Sitemap:\s*https:\/\/z-als\.ch\/sitemap\.xml/.test(robots)) fail('robots.txt has no Sitemap line');
if (/noindex/i.test(robots)) fail('robots.txt must never say noindex');
for (const [u, html] of pages) if (/noindex/i.test(html.match(/<head[\s\S]*?<\/head>/i)[0].replace(/<script[\s\S]*?<\/script>/g, ''))) fail(`${u}: noindex found`);
// /llms.txt: plain text, the phone in it, and every z-als.ch link in it answers 200.
const llms = await get('/llms.txt');
if (llms.status !== 200 || !/^text\/plain/.test(llms.headers.get('content-type') || '')) fail(`/llms.txt: ${llms.status} ${llms.headers.get('content-type')}`);
else {
  const txt = await llms.text();
  if (!txt.includes('+41 76 272 0909')) fail('/llms.txt: no phone number');
  const links = [...txt.matchAll(/\(https:\/\/z-als\.ch(\/[^)#\s]*)/g)].map(m => m[1]);
  if (links.length < 15) fail(`/llms.txt: only ${links.length} links`);
  for (const l of links) { const r = await get(l); if (r.status !== 200) fail(`/llms.txt links ${l} → ${r.status}`); }
}
const enc = await get('/', { headers: { 'accept-encoding': 'br' } });
if (!enc.headers.get('content-encoding')) fail('/ is not compressed');
if (!enc.headers.get('etag')) fail('/ has no ETag');

console.log(fails ? `\n${fails} problem(s) in ${pages.size} pages` : `\nall checks passed for ${pages.size} pages`);
process.exit(fails ? 1 : 0);
