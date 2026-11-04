// Checks a translated restored page against its English twin: node tools/verify-article.mjs <lang> <relative-path-without-lang>
//   e.g. node tools/verify-article.mjs fr journal/winter-routes
// Same markup (tags, classes, link targets up to the language prefix), real translation (little English left,
// no leftover German/French/Italian from another page), title <= 60, description 120-160, one h1.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const [lang, rel] = process.argv.slice(2);
if (!lang || !rel) { console.error('usage: verify-article.mjs <de|fr|it> <journal/slug>'); process.exit(2); }
const read = l => fs.readFileSync(path.join(ROOT, l, rel + '.html'), 'utf8');
const en = read('en'), tr = read(lang);

const main = h => (h.match(/<main[\s\S]*<\/main>/) || [''])[0];
const skeleton = h => [...main(h).matchAll(/<([a-z][\w-]*)((?:\s[^>]*?)?)\/?>/gi)].map(m => {
  const cls = (m[2].match(/\sclass="([^"]*)"/) || [])[1] || '';
  const href = (m[2].match(/\shref="([^"]*)"/) || [])[1] || '';
  return `${m[1]}.${cls}${href ? '>' + href.replace(/^\/(en|de|fr|it)/, '/L').replace(/lang=\w+/, 'lang=L') : ''}`;
});
const text = h => main(h).replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').toLowerCase();
const words = t => t.match(/[a-zà-ÿ']{2,}/g) || [];

const problems = [];
const a = skeleton(en), b = skeleton(tr);
if (a.length !== b.length) problems.push(`markup: ${a.length} tags in en vs ${b.length} in ${lang}`);
else for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) { problems.push(`markup differs at tag #${i}: en "${a[i]}" vs ${lang} "${b[i]}"`); break; }

const STOP = { en: ['the', 'and', 'of', 'to', 'is', 'that', 'for', 'with', 'are', 'was', 'this', 'not', 'we', 'you', 'have', 'be', 'as', 'your'], de: ['der', 'die', 'das', 'und', 'ist', 'nicht', 'mit', 'für', 'den', 'ein', 'eine', 'wir', 'sie', 'zu'], fr: ['le', 'la', 'les', 'et', 'est', 'des', 'une', 'pour', 'pas', 'que', 'nous', 'vous', 'du', 'un'], it: ['il', 'la', 'le', 'e', 'è', 'di', 'che', 'per', 'non', 'una', 'con', 'del', 'dei', 'un'] };
const share = (ws, list) => ws.filter(w => list.includes(w)).length / Math.max(1, ws.length);
const w = words(text(tr));
const enShare = share(w, STOP.en.filter(x => !STOP[lang].includes(x)));
const ownShare = share(w, STOP[lang]);
if (enShare > 0.07) problems.push(`still English: ${(enShare * 100).toFixed(1)}% English function words in the body`);
if (ownShare < 0.08) problems.push(`not ${lang}: only ${(ownShare * 100).toFixed(1)}% ${lang} function words in the body`);

const title = (tr.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
const desc = (tr.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
if (!title || title.length > 60) problems.push(`title is ${title.length} chars: "${title}"`);
if (desc.length < 120 || desc.length > 160) problems.push(`description is ${desc.length} chars (want 120-160)`);
if ((main(tr).match(/<h1\b/g) || []).length !== 1) problems.push('needs exactly one h1');
if (!new RegExp(`<html lang="${lang}"`).test(tr)) problems.push(`html lang is not ${lang}`);
const ldLang = [...tr.matchAll(/"inLanguage":"(\w+)"/g)].map(m => m[1]);
if (ldLang.some(l => l !== lang)) problems.push(`JSON-LD inLanguage ${ldLang.join(',')} should be ${lang}`);
const ldHead = (tr.match(/"headline":"([^"]*)"/) || [])[1];
const h1 = (main(tr).match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '';
if (ldHead && h1 && ldHead.replace(/&[a-z#0-9]+;/g, '').trim() !== h1.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/g, '').trim()) problems.push(`JSON-LD headline "${ldHead}" differs from the h1 "${h1.replace(/<[^>]+>/g, '')}"`);

console.log(problems.length ? `FAIL ${lang}/${rel}\n  - ${problems.join('\n  - ')}` : `ok   ${lang}/${rel}  (${w.length} words, ${(ownShare * 100).toFixed(0)}% ${lang}, ${(enShare * 100).toFixed(1)}% en)`);
process.exit(problems.length ? 1 : 0);
