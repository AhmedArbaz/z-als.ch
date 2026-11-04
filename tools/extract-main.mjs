// Prints the <main>...</main> element of a built page: node tools/extract-main.mjs <lang> <path-without-lang>
//   e.g. node tools/extract-main.mjs en journal/winter-routes
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const [lang, rel] = process.argv.slice(2);
const html = fs.readFileSync(path.join(ROOT, lang, rel + '.html'), 'utf8');
const m = html.match(/<main[\s\S]*<\/main>/);
if (!m) { console.error('no <main> in', lang, rel); process.exit(1); }
console.log(m[0]);
