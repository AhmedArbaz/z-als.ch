// One-off: the journal index pages in DE/FR/IT still listed the articles in English. Applies the approved
// translated headlines, blurbs, categories and reading times from the translation run.
//   node tools/patch-journal-index.mjs <journal.jsonl>
import fs from 'node:fs';

const entries = fs.readFileSync(process.argv[2], 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
const metas = entries.filter(e => e.type === 'result' && e.result && e.result.articles).map(e => e.result.articles);
const pick = re => metas.find(a => a.every(x => re.test(x.minRead)));
const BY = { de: pick(/Lesezeit/), fr: pick(/de lecture/), it: pick(/di lettura/) };
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

for (const [lang, list] of Object.entries(BY)) {
  if (!list) throw new Error('no metadata for ' + lang);
  const map = Object.fromEntries(list.map(a => [a.slug, a]));
  const file = `public/${lang}/journal.html`;
  let html = fs.readFileSync(file, 'utf8');
  // The featured article: category · date · reading time, headline and blurb.
  const f = map['the-arrivals-gap'];
  html = html.replace(/(<div class="[^"]*__eyebrow">)Operations · (\d{4}-\d{2}-\d{2}) · [^<]*(<\/div>)/, (x, a, d, z) => `${a}${esc(f.section)} · ${d} · ${esc(f.minRead)}${z}`);
  html = html.replace(/(<h2 class="[^"]*__h2Dark">)The arrivals gap:[^<]*(<\/h2>)/, (x, a, z) => `${a}${esc(f.headline)}${z}`);
  html = html.replace(/(<p class="[^"]*__bodyDark">)Biometric registration[^<]*(<\/p>)/, (x, a, z) => `${a}${esc(f.blurb)}${z}`);
  // The list.
  for (const [slug, m] of Object.entries(map)) {
    const re = new RegExp(`(<a href="/${lang}/journal/${slug}">)[^<]*(</a><span class="[^"]*__stepBody">)[^<]*(</span></th><td class="[^"]*__num">[^<]*</td><td class="[^"]*__num">)[^<]*(</td>)`);
    if (!re.test(html)) { if (slug === 'the-arrivals-gap') continue; throw new Error(`${lang}: row for ${slug} not found`); } // the featured one has no row
    html = html.replace(re, (x, a, b, c, d) => `${a}${esc(m.headline)}${b}${esc(m.blurb)}${c}${esc(m.minRead)}${d}`);
  }
  fs.writeFileSync(file, html);
  console.log('patched', file);
}
