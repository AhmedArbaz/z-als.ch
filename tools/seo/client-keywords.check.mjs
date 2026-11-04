// Checks docs/seo/client-keywords.json against the built pages (public/): for every keyword with an owner URL, the words
// of the phrase must all be in each place its `placement` names (title, H1, description, body/FAQ/H2), in any order and
// inside longer words (Limousinenservice carries "limousinen" and "service"). Exact-phrase hits are listed as a bonus.
//   node tools/seo/client-keywords.check.mjs [--all]      --all also prints the keywords that pass
import fs from 'node:fs';

const K = JSON.parse(fs.readFileSync('docs/seo/client-keywords.json', 'utf8')).keywords;
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&amp;/g, '&').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const STOP = new Set(['in', 'a', 'an', 'the', 'of', 'and', 'by', 'for', 'to', 'de']);
const fileOf = url => url === '/' ? 'public/index.html' : fs.existsSync(`public${url}.html`) ? `public${url}.html` : `public${url}/index.html`;
const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');

const pages = {};
function page(url) {
  if (pages[url]) return pages[url];
  const html = fs.readFileSync(fileOf(url), 'utf8');
  const g = re => norm(((html.match(re) || [])[1] || '').replace(/<[^>]+>/g, ' '));
  return pages[url] = {
    title: g(/<title>([^<]*)<\/title>/),
    h1: g(/<h1[^>]*>([\s\S]*?)<\/h1>/),
    description: g(/<meta name="description" content="([^"]*)"/),
    body: norm(strip(html)),
    jsonld: norm((html.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || []).join(' ')),
  };
}

let bad = 0;
const rows = [];
for (const k of K) {
  if (!k.ownerUrl || /^none|DO NOT TARGET/i.test(k.placement)) continue;
  const p = page(k.ownerUrl);
  const fields = [];
  if (/\btitle\b/i.test(k.placement)) fields.push('title');
  if (/\bh1\b/i.test(k.placement)) fields.push('h1');
  if (/\bdescription\b/i.test(k.placement)) fields.push('description');
  if (/\bbody\b|\bFAQ\b|\bH2\b|\bCTA\b/i.test(k.placement)) fields.push('body');
  if (/JSON-LD/i.test(k.placement)) fields.push('jsonld');
  if (!fields.length) continue;
  const phrase = norm(k.target || k.keyword);
  const words = phrase.split(' ').filter(w => !STOP.has(w));
  const missing = fields.filter(f => !words.every(w => p[f].includes(w)));
  const exact = ['title', 'h1', 'description', 'body'].filter(f => p[f].includes(phrase));
  if (missing.length) bad++;
  rows.push({ keyword: k.keyword, url: k.ownerUrl, need: fields.join('+'), missing: missing.join('+'), exact: exact.join('+') });
}
for (const r of rows) if (r.missing || process.argv.includes('--all')) console.log(`${r.missing ? 'FAIL' : 'ok  '} ${r.keyword}  [${r.url}]  needs ${r.need}${r.missing ? '  MISSING in ' + r.missing : ''}  exact in: ${r.exact || '-'}`);
console.log(`${rows.length} keywords checked, ${bad} with a placement not met, ${rows.filter(r => r.exact.includes('title')).length} exact in a title, ${rows.filter(r => r.exact.includes('h1')).length} exact in an H1`);
if (bad) process.exit(1);
