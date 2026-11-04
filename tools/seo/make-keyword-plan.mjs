// Builds docs/seo/keyword-plan.md and keyword-plan.csv from the browser research (docs/seo/keyword-research.json)
// and the titles/descriptions that are actually on the site. Run by hand: node tools/seo/make-keyword-plan.mjs
import fs from 'node:fs';
import { HOME } from './meta.mjs';

const R = JSON.parse(fs.readFileSync('docs/seo/keyword-research.json', 'utf8'));
const LANGS = ['en', 'de', 'fr', 'it'];
const NAME = { en: 'English', de: 'German', fr: 'French', it: 'Italian' };
const meta = JSON.parse(fs.readFileSync('tools/seo/restored-meta.json', 'utf8'));
const client = JSON.parse(fs.readFileSync('docs/seo/client-keywords.json', 'utf8')).keywords;
// Primaries changed on 2026-10-07 to win the client's own phrases back (the research file still holds the 2026-10-04 ones).
const HOME_PRIMARY = { en: 'zurich airport limousine service', de: 'limousinenservice flughafen zürich' };
const csvCell = s => `"${String(s).replace(/"/g, '""')}"`;

const rows = [];
for (const r of R.research) for (const k of r.keywords) rows.push({ lang: r.lang, ...k, score: k.volumeProxy * 2 - k.difficulty });
rows.sort((a, b) => a.lang.localeCompare(b.lang) || b.score - a.score);
fs.writeFileSync('docs/seo/keyword-plan.csv', ['language,keyword,intent,volume_proxy(1-5),difficulty(1-5),target_page_type,evidence', ...rows.map(r => [r.lang, r.keyword, r.intent, r.volumeProxy, r.difficulty, r.targetType, r.evidence].map(csvCell).join(','))].join('\n') + '\n');

const out = [];
out.push(`# Keyword research and plan for z-als.ch

*Prepared 2026-10-04 from searches run in a real browser on google.ch (language and region set per market), then on DuckDuckGo where Google asked for a CAPTCHA. ${rows.length} candidate keywords across ${LANGS.length} languages are in [keyword-plan.csv](keyword-plan.csv).*

## How the research was done, and what it cannot tell you

1. **Seeds** in each language: airport transfer, chauffeur and limousine service, private driver, fleet, resort routes (Davos, St. Moritz, Zermatt, Interlaken, Lucerne, Bern, Basel, Lugano, Geneva), corporate and hourly hire, price questions.
2. **Harvest**: Google autocomplete for every seed (plus an a–z expansion of the four head terms), People Also Ask, related searches, the organic and paid results for about fifteen commercial queries per language, and the title, description, headings, schema and word count of the pages that rank.
3. **Scoring**: *volume proxy* (1–5) is how prominently a phrase appears in autocomplete and related searches; *difficulty* (1–5) is who holds page one (5 = airport authority, Blacklane, Sixt, GetYourGuide, Tripadvisor; 1 = small local sites or thin pages). **These are proxies, not search volumes.** Google Keyword Planner needs a signed-in Google Ads account, which we do not have; once Search Console has a month of data, the real queries and impressions replace this guess.
4. **Limits**: Google's results pages showed a CAPTCHA part-way through the competitor study; it was not bypassed. Ranks for that part are DuckDuckGo's, on-page facts are read directly from each page.

## What the SERPs look like

${R.competitors.patterns.split('\n\n').slice(1, 4).join('\n\n')}

## Primary keyword for every URL

One primary keyword per URL; titles are at most 58 characters, descriptions 120–155.

| URL | Language | Primary keyword | Title |
|---|---|---|---|`);
const urlRows = [];
for (const l of LANGS) { const u = R.plan.urlMap.find(x => x.url === (l === 'en' ? '/' : `/${l}/`)); if (u) urlRows.push([l === 'en' ? '/' : `/${l}`, l, HOME_PRIMARY[l] || u.primaryKeyword, HOME[l].title]); }
for (const [p, m] of Object.entries(meta)) { const lang = p.split('/')[1]; if (!/journal\//.test(p) || lang === 'en') urlRows.push([p, lang, m.keyword || '', m.title]); }
for (const u of R.plan.urlMap.filter(x => /transfers\//.test(x.url))) urlRows.push([u.url.replace(/^\/transfers/, '/en/transfers'), u.lang, u.primaryKeyword, u.title]);
for (const r of urlRows) out.push(`| \`${r[0]}\` | ${r[1]} | ${r[2]} | ${r[3]} |`);

for (const l of LANGS) {
  const res = R.research.find(x => x.lang === l);
  const top = rows.filter(r => r.lang === l).slice(0, 18);
  out.push(`\n## ${NAME[l]}: best opportunities\n\n| Keyword | Intent | Volume proxy | Difficulty | Page |\n|---|---|---|---|---|`);
  for (const r of top) out.push(`| ${r.keyword} | ${r.intent} | ${r.volumeProxy} | ${r.difficulty} | ${r.targetType} |`);
  out.push(`\n**Who holds page one** (from ${res.serpNotes.length} result pages read):\n`);
  for (const s of res.serpNotes.slice(0, 8)) out.push(`- *${s.query}*: ${s.dominated}`);
  out.push(`\n**People also ask** (${res.paa.length} questions seen; they feed the FAQ):\n`);
  for (const q of [...new Set(res.paa)].slice(0, 12)) out.push(`- ${q}`);
}
const nAgency = client.filter(k => k.source === 'agency keyword list').length;
out.push(`\n## Client keywords (agency list, Sep 2025)

The ${client.length} phrases from the agency's spreadsheet (${nAgency} tracked keywords, May–Sep 2025, plus ${client.length - nAgency} social-media keywords), the page that owns each one now, and where on that page it sits. Source: [client-keywords.json](client-keywords.json). *Rank* is Google's position at the end of September 2025 on the old German WordPress site (NS = not shown).

| Keyword | Language | Sep 2025 rank | Owner URL | Placement |
|---|---|---|---|---|
${client.map(k => `| ${k.keyword} | ${k.lang} | ${k.sep2025Rank ?? 'n/a'} | ${k.ownerUrl ? '`' + k.ownerUrl + '`' : 'not targeted'} | ${k.placement.replace(/\|/g, '/')} |`).join('\n')}`);
out.push(`\n## Where a small local operator can beat the aggregators\n\n${R.plan.gaps}`);
out.push(`\n## Pages kept apart on purpose (cannibalisation)\n\n- Ownership since 2026-10-07: the English home owns every limousine / limo / airport-chauffeur phrase (\`zurich airport limousine service\`); \`/de\` owns every Limousinenservice / Limousine phrase; \`/en/services\` and \`/de/services\` own chauffeur service / Chauffeurservice (city, hourly, private chauffeur); the fleet pages own vans, groups and Mercedes; About owns the legal name; the route pages and the \`/transfers\` hubs keep the transfer terms. The home titles no longer name "airport transfer": it stays in the descriptions, the FAQ heading, the body and the hubs.\n${(R.plan.cannibalisationRisks || []).map(x => `- ${x}`).join('\n')}`);
out.push(`\n## Title formulas used\n\n${R.plan.titleFormulas}\n`);
fs.writeFileSync('docs/seo/keyword-plan.md', out.join('\n') + '\n');
console.log('keyword-plan.md', out.join('\n').length, 'chars;', rows.length, 'keywords');
