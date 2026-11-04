// Puts a translated article into its restored page: node tools/splice-page.mjs <lang> <journal/slug> <main.html> <meta.json>
//   main.html  the translated <main>...</main> element, same markup as the English one
//   meta.json  { "title": "<=60 chars", "description": "120-160 chars", "headline": "= the h1 text", "section": "translated category" }
// Replaces <main>, the BlogPosting headline/description/articleSection/inLanguage and the page's old head fields,
// and records title + description in tools/seo/meta/<lang>__<path>.json, where tools/seo.mjs reads them at build.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [lang, rel, mainFile, metaFile] = process.argv.slice(2);
if (!metaFile) { console.error('usage: splice-page.mjs <de|fr|it> <journal/slug> <main.html> <meta.json>'); process.exit(2); }
if (!['de', 'fr', 'it'].includes(lang)) throw new Error('lang must be de, fr or it');

const file = path.join(ROOT, 'public', lang, rel + '.html');
let html = fs.readFileSync(file, 'utf8');
const main = fs.readFileSync(mainFile, 'utf8').trim();
const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
if (!/^<main[\s>]/.test(main) || !/<\/main>$/.test(main)) throw new Error('main.html must be exactly one <main>...</main> element');
for (const k of ['title', 'description', 'headline']) if (!meta[k]) throw new Error('meta.json needs ' + k);

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const json = s => JSON.stringify(s).slice(1, -1);

html = html.replace(/<main[\s\S]*<\/main>/, () => main);
html = html.replace(/<title>[^<]*<\/title>/, () => `<title>${esc(meta.title)}</title>`);
html = html.replace(/<meta name="description" content="[^"]*">/, () => `<meta name="description" content="${esc(meta.description)}">`);
html = html.replace(/<meta property="og:title" content="[^"]*">/, () => `<meta property="og:title" content="${esc(meta.headline)}">`);
html = html.replace(/<meta property="og:description" content="[^"]*">/, () => `<meta property="og:description" content="${esc(meta.description)}">`);
html = html.replace(/<meta name="twitter:title" content="[^"]*">/, () => `<meta name="twitter:title" content="${esc(meta.headline)}">`);
html = html.replace(/<meta name="twitter:description" content="[^"]*">/, () => `<meta name="twitter:description" content="${esc(meta.description)}">`);
html = html.replace(/("@type":"BlogPosting","headline":")[^"]*(","description":")[^"]*(")/, (m, a, b, c) => `${a}${json(meta.headline)}${b}${json(meta.description)}${c}`);
html = html.replace(/("inLanguage":")\w+(")/g, `$1${lang}$2`);
if (meta.section) html = html.replace(/("articleSection":")[^"]*(")/, (m, a, b) => `${a}${json(meta.section)}${b}`);
fs.writeFileSync(file, html);

const dir = path.join(ROOT, 'tools', 'seo', 'meta');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, `${lang}__${rel.replace(/\//g, '__')}.json`), JSON.stringify({ title: meta.title, description: meta.description }, null, 1) + '\n');
console.log('spliced', path.relative(ROOT, file));
