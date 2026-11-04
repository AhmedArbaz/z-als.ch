// Two sections the homepage gets at build time, in the language of the page: the FAQ (also the FAQPage JSON-LD)
// and three journal articles. They are plain HTML in the board's visual style, so crawlers see real text and
// links; tools/build.mjs puts them in at <!--z-faq--> and <!--z-journal--> after the page has been translated.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { homeFaq, FAQ_HEADING } from './faq.mjs';
import { esc } from '../seo.mjs';
import { facts, FACTS_HEADING } from './facts.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'public');
const SERIF = "font-family:'Playfair Display',Georgia,serif;font-weight:400;letter-spacing:-0.025em;line-height:1.06";

export function faqNode(lang) {
  return { '@type': 'FAQPage', '@id': `https://z-als.ch/${lang === 'en' ? '' : lang}#faq`, inLanguage: lang,
    mainEntity: homeFaq(lang).map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
}

export function faqSection(lang) {
  const H = FAQ_HEADING[lang];
  const items = homeFaq(lang).map(({ q, a }, i) => `<details${i === 0 ? ' open' : ''} style="border-bottom:1px solid #CFDAEB">
<summary style="cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:22px 0;font-size:clamp(16px,1.3vw,19px);font-weight:600;line-height:1.35;color:#0A1730">${esc(q)}<span aria-hidden="true" class="z-faq-plus" style="flex:none;font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:22px;color:#46659F">+</span></summary>
<p style="margin:0 0 24px;max-width:72ch;font-size:16px;line-height:1.7;color:rgba(10,23,48,0.8)">${esc(a)}</p>
</details>`).join('\n');
  return `<section data-screen-label="FAQ" id="faq" style="background:#EEF2F8;color:#0A1730;padding:clamp(72px,8vw,124px) 0">
<style>#faq summary::-webkit-details-marker{display:none}#faq details[open] .z-faq-plus{transform:rotate(45deg)}#faq .z-faq-plus{transition:transform 180ms ease-out}</style>
<div style="max-width:1400px;margin:0 auto;padding:0 clamp(20px,4vw,56px)">
<div style="font-size:12px;font-weight:600;letter-spacing:0.03em;color:#46659F">${esc(H.eyebrow)}</div>
<h2 style="margin:16px 0 0;max-width:24ch;${SERIF};font-size:clamp(30px,4vw,52px);color:#0A1730;text-wrap:balance">${esc(H.h2[0])}<span style="color:#46659F">${esc(H.h2[1])}</span></h2>
<div style="margin-top:clamp(28px,4vw,48px);max-width:960px;border-top:1px solid #CFDAEB">
${items}
</div>
</div>
</section>`;
}

/** "Z-ALS at a glance" (tools/seo/facts.mjs): plain text crawlers and AI assistants can quote. */
export function factsSection(lang) {
  const H = FACTS_HEADING[lang];
  const rows = facts(lang).map(([k, v]) => `<div style="padding:18px 0;border-top:1px solid #CFDAEB"><dt style="font-size:12px;font-weight:600;letter-spacing:0.03em;color:#46659F">${esc(k)}</dt><dd style="margin:6px 0 0;font-size:16px;line-height:1.6;color:#0A1730">${esc(v)}</dd></div>`).join('\n');
  return `<section data-screen-label="Facts" id="facts" style="background:#FFFFFF;color:#0A1730;padding:clamp(64px,7vw,104px) 0">
<div style="max-width:1400px;margin:0 auto;padding:0 clamp(20px,4vw,56px)">
<div style="font-size:12px;font-weight:600;letter-spacing:0.03em;color:#46659F">${esc(H.eyebrow)}</div>
<h2 style="margin:16px 0 0;max-width:24ch;${SERIF};font-size:clamp(28px,3.6vw,46px);color:#0A1730;text-wrap:balance">${esc(H.h2[0])}<span style="color:#46659F">${esc(H.h2[1])}</span></h2>
<dl style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));column-gap:clamp(24px,4vw,56px);margin:clamp(28px,4vw,44px) 0 0">
${rows}
</dl>
</div>
</section>`;
}

const JOURNAL = {
  en: { eyebrow: 'From the journal', h2: ['Notes from ', 'the dispatch desk'], read: 'Read the article →', all: 'All articles →' },
  de: { eyebrow: 'Aus dem Journal', h2: ['Notizen aus ', 'der Disposition'], read: 'Artikel lesen →', all: 'Alle Artikel →' },
  fr: { eyebrow: 'Du journal', h2: ['Notes de ', 'notre dispatch'], read: 'Lire l’article →', all: 'Tous les articles →' },
  it: { eyebrow: 'Dal journal', h2: ['Note dalla ', 'centrale operativa'], read: 'Leggi l’articolo →', all: 'Tutti gli articoli →' },
};
const ARTICLES = ['what-a-fixed-fare-has-to-cover', 'how-a-dispatch-desk-absorbs-a-delayed-flight', 'winter-routes'];
const text = h => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();

export function journalSection(lang) {
  const J = JOURNAL[lang];
  const cards = ARTICLES.map(slug => {
    const html = fs.readFileSync(path.join(ROOT, lang, 'journal', slug + '.html'), 'utf8');
    const h1 = text((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || slug);
    const lede = text((html.match(/<p class="[^"]*lede[^"]*">([\s\S]*?)<\/p>/) || [])[1] || '');
    const eyebrow = text((html.match(/<span class="[^"]*__eyebrow">([\s\S]*?)<\/span>/) || [])[1] || '').replace(/\s*·\s*\d{4}-\d{2}-\d{2}\s*·\s*/, ' · ');
    return `<a href="/${lang}/journal/${slug}" style="display:flex;flex-direction:column;gap:14px;padding:26px;border:1px solid #CFDAEB;border-radius:16px;background:#FFFFFF;color:#0A1730;text-decoration:none">
<span style="font-size:11px;font-weight:600;letter-spacing:0.05em;color:#46659F">${esc(eyebrow)}</span>
<span style="${SERIF};font-size:clamp(22px,2vw,28px);line-height:1.14">${esc(h1)}</span>
<span style="font-size:15px;line-height:1.6;color:rgba(10,23,48,0.72)">${esc(lede)}</span>
<span style="margin-top:auto;font-size:12px;font-weight:600;letter-spacing:0.03em">${esc(J.read)}</span>
</a>`;
  }).join('\n');
  return `<section data-screen-label="Journal" style="background:#FFFFFF;color:#0A1730;padding:clamp(64px,7vw,104px) 0">
<div style="max-width:1400px;margin:0 auto;padding:0 clamp(20px,4vw,56px)">
<div style="display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:16px 40px">
<div>
<div style="font-size:12px;font-weight:600;letter-spacing:0.03em;color:#46659F">${esc(J.eyebrow)}</div>
<h2 style="margin:16px 0 0;${SERIF};font-size:clamp(28px,3.6vw,46px);color:#0A1730;text-wrap:balance">${esc(J.h2[0])}<span style="color:#46659F">${esc(J.h2[1])}</span></h2>
</div>
<a href="/${lang}/journal" style="display:inline-flex;align-items:center;min-height:44px;font-size:13px;font-weight:600;color:#0A1730;text-decoration:underline;text-underline-offset:4px">${esc(J.all)}</a>
</div>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:20px;margin-top:clamp(28px,4vw,44px)">
${cards}
</div>
</div>
</section>`;
}
