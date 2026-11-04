// One-off: the five German articles that were translated earlier still had English chrome (category, "N min read",
// the Related-reading titles and blurbs) and over-long titles. Applies the approved German metadata from the
// translation run (journal.jsonl of wf_87991913-d68) to them. Run: node tools/patch-de-chrome.mjs <journal.jsonl>
import fs from 'node:fs';
import path from 'node:path';

const journal = process.argv[2];
const entries = fs.readFileSync(journal, 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
const metas = entries.filter(e => e.type === 'result' && e.result && e.result.articles).map(e => e.result.articles);
const de = metas.find(a => a.every(x => /Lesezeit/.test(x.minRead)));
if (!de) throw new Error('German metadata not found in the journal');
const map = Object.fromEntries(de.map(a => [a.slug, a]));

const DONE = ['what-a-fixed-fare-has-to-cover', 'how-a-dispatch-desk-absorbs-a-delayed-flight', 'reading-a-chauffeur-invoice', 'roadshow-logistics', 'insurance-and-licensing'];
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
for (const slug of DONE) {
  const file = path.join('public', 'de', 'journal', slug + '.html');
  let html = fs.readFileSync(file, 'utf8');
  const m = map[slug];
  // eyebrow: "<category> · <date> · N min read"
  html = html.replace(/(<span class="[^"]*__eyebrow">)([^<·]*)· (\d{4}-\d{2}-\d{2}) · [^<]*(<\/span>)/, (x, a, cat, date, z) => `${a}${esc(m.section)} · ${date} · ${esc(m.minRead)}${z}`);
  // related reading rows: title, blurb, reading time of every other article
  for (const [s, o] of Object.entries(map)) {
    const re = new RegExp(`(<a href="/de/journal/${s}">)[^<]*(</a><span class="[^"]*__stepBody">)[^<]*(</span></th><td class="[^"]*__num">)[^<]*(</td>)`);
    html = html.replace(re, (x, a, b, c, d) => `${a}${esc(o.headline)}${b}${esc(o.blurb)}${c}${esc(o.minRead)}${d}`);
  }
  html = html.replace(/("articleSection":")[^"]*(")/, (x, a, b) => `${a}${m.section}${b}`);
  fs.writeFileSync(file, html);
  fs.writeFileSync(path.join('tools', 'seo', 'meta', `de__journal__${slug}.json`), JSON.stringify({ title: m.title, description: m.description }, null, 1) + '\n');
  console.log('patched', slug);
}
