// Checks the words of one route page: node tools/verify-route.mjs <lang> <slug|_hub>
// File: tools/seo/routes/<slug>.<lang>.json   (see tools/routes.mjs for how it is rendered)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'seo', 'routes');
const [lang, slug] = process.argv.slice(2);
if (!lang || !slug) { console.error('usage: verify-route.mjs <en|de|fr|it> <slug|_hub>'); process.exit(2); }
const file = path.join(DIR, `${slug}.${lang}.json`);
if (!fs.existsSync(file)) { console.log(`FAIL ${lang}/${slug}: ${path.basename(file)} does not exist`); process.exit(1); }
let j;
try { j = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { console.log(`FAIL ${lang}/${slug}: invalid JSON: ${e.message}`); process.exit(1); }
const hub = slug === '_hub';
// Guide pages (tools/routes.mjs GUIDES) compare several routes and outside prices: route-page length, guide tokens, no price note.
const { GUIDES } = await import('./seo/routes.mjs');
const guide = GUIDES.some(g => g.slug === slug);

const p = [];
const str = (v, name, min, max) => { if (typeof v !== 'string' || !v.trim()) p.push(`${name} missing`); else if (v.length < min || v.length > max) p.push(`${name} is ${v.length} chars (want ${min}-${max}): "${v}"`); };
str(j.title, 'title', 20, 58);
str(j.description, 'description', 125, 155);
str(j.h1, 'h1', 12, 90);
str(j.lede, 'lede', 40, 240);
if (!Array.isArray(j.intro) || j.intro.length < 2 || j.intro.length > 3) p.push('intro needs 2-3 paragraphs');
const secs = j.sections || [];
if (secs.length < (hub ? 2 : 4) || secs.length > 6) p.push(`sections: ${secs.length} (want ${hub ? '2-6' : '4-6'})`);
secs.forEach((s, i) => {
  if (!s.h2 || !Array.isArray(s.paragraphs) || !s.paragraphs.length) p.push(`section ${i + 1} needs h2 and paragraphs`);
  else if (s.paragraphs.join(' ').split(/\s+/).length < 45) p.push(`section ${i + 1} ("${s.h2}") is too thin (<45 words)`);
});
const faq = j.faq || [];
if (faq.length < 5 || faq.length > 7) p.push(`faq: ${faq.length} questions (want 5-7)`);
faq.forEach((f, i) => { if (!f.q || !f.a || !/\?\s*$/.test(f.q)) p.push(`faq ${i + 1}: needs a question ending in ? and an answer`); });
if (!hub && !guide) str(j.priceNote, 'priceNote', 40, 400);

const all = [j.lede, ...(j.intro || []), ...secs.flatMap(s => [s.h2, ...(s.paragraphs || []), ...(s.bullets || [])]), j.priceNote, ...faq.flatMap(f => [f.q, f.a])].filter(Boolean).join(' \n ');
const words = all.split(/\s+/).length;
if (words < (hub ? 380 : 650) || words > 1500) p.push(`${words} words in total (want ${hub ? 380 : 650}-1500)`);

const TOKENS = new Set(['km', 'time', 'priceBusiness', 'pricePremium', 'priceSuv', 'priceVan', 'vat', 'dest']);
const GUIDE_TOKEN = /^(price|pricePremium|priceVan|time|km|train)[A-Z]\w*$|^(taxiCity|taxiTariff|trainCity|trainCityTime|checked)$/;
for (const m of all.matchAll(/\{(\w+)\}/g)) if (!TOKENS.has(m[1]) && !(guide && GUIDE_TOKEN.test(m[1]))) p.push(`unknown token {${m[1]}} (allowed: ${[...TOKENS].join(', ')})`);
if (!hub && !guide) {
  if (!/\{km\}/.test(all)) p.push('the distance token {km} must appear at least once');
  if (!/\{time\}/.test(all)) p.push('the drive-time token {time} must appear at least once');
  if (!/\{priceBusiness\}/.test(all)) p.push('{priceBusiness} must appear at least once (e.g. in the first section)');
}
const stripped = all.replace(/\{\w+\}/g, '');
if (/CHF\s*\d|\d\s*CHF|Fr\.\s*\d/i.test(stripped)) p.push('raw price in the text: use {priceBusiness} / {pricePremium} / {priceSuv} / {priceVan}');
if (/\b\d+([.,]\d+)?\s*(km|kilomet|Std|stunden|heures?|ore|hours?|hrs?|min)\b/i.test(stripped.replace(/\b60\s*(minut|Minut|minuti)\w*/gi, '').replace(/\bsechzig\b/gi, ''))) p.push('a raw distance or duration: use {km} and {time}; only "60 minutes" of included waiting may be written out');
const BAD = /guarantee|garantie|garantiert|garantito|award|auszeichn|premiato|best price|bester preis|meilleur prix|miglior prezzo|5[- ]star|five[- ]star|f(ü|ue)nf[- ]sterne|rated|bewertet|reviews|bewertungen|avis clients|recensioni|free cancel|kostenlos\w* stornier|annulation gratuite|cancellazione gratuita|cheapest|g(ü|ue)nstigste|le moins cher|pi(ù|u) economic|no hidden|keine versteckten|sans frais cach|senza costi nascosti|VIP|luxury|luxus|luxe|lusso/i;
const bad = stripped.match(BAD);
if (bad) p.push(`claim the site cannot back up: "${bad[0]}" (reviews, awards, guarantees, "cheapest", "luxury" ...)`);

const STOP = { en: ['the', 'and', 'of', 'to', 'is', 'that', 'for', 'with', 'are', 'was', 'this', 'not', 'we', 'you', 'have', 'be', 'as', 'your'], de: ['der', 'die', 'das', 'und', 'ist', 'nicht', 'mit', 'für', 'den', 'ein', 'eine', 'wir', 'sie', 'zu'], fr: ['le', 'la', 'les', 'et', 'est', 'des', 'une', 'pour', 'pas', 'que', 'nous', 'vous', 'du', 'un'], it: ['il', 'la', 'le', 'e', 'è', 'di', 'che', 'per', 'non', 'una', 'con', 'del', 'dei', 'un'] };
const w = (stripped.toLowerCase().match(/[a-zà-ÿ']{2,}/g) || []);
const share = list => w.filter(x => list.includes(x)).length / Math.max(1, w.length);
if (share(STOP[lang]) < 0.08) p.push(`does not read as ${lang} (${(share(STOP[lang]) * 100).toFixed(1)}% ${lang} function words)`);
if (lang !== 'en' && share(STOP.en.filter(x => !STOP[lang].includes(x))) > 0.03) p.push('too much English left in a non-English page');

console.log(p.length ? `FAIL ${lang}/${slug}\n  - ${p.join('\n  - ')}` : `ok   ${lang}/${slug} (${words} words)`);
process.exit(p.length ? 1 : 0);
