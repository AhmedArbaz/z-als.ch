// Footer column "Ask AI about Z-ALS": each link opens an AI assistant with a question about Z-ALS in the page's language.
// One renderer for both footers (board pages via tools/build.mjs, restored/route pages via tools/seo.mjs processStatic).
// Logos follow each brand's own rules (docs/seo/aeo/ai-logos.md): ChatGPT, Claude and Perplexity marks unaltered and
// monochrome (tools/seo/ai-icons/, from simple-icons); Gemini by name only, since Google needs permission for its icons.
// It never claims the assistants recommend Z-ALS: it only opens the question.
// Every string here is our own constant (no visitor input), so nothing needs HTML-escaping.
import fs from 'node:fs';

const icon = f => fs.readFileSync(new URL(`./ai-icons/${f}.svg`, import.meta.url), 'utf8')
  .replace(/<title>[^<]*<\/title>/, '').replace('<svg ', '<svg aria-hidden="true" focusable="false" width="16" height="16" fill="currentColor" style="flex:none" ');
// A neutral "ask" glyph (speech bubble) where a brand's logo may not be used.
const ASK = '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';

const AI = [
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/?q=', svg: icon('openai') },
  { id: 'claude', name: 'Claude', url: 'https://claude.ai/new?q=', svg: icon('claude') },
  { id: 'gemini', name: 'Gemini', sub: 'Google AI Mode', url: 'https://www.google.com/search?udm=50&q=', svg: ASK },
  { id: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai/search?q=', svg: icon('perplexity') },
];

export const ASK_AI = {
  en: { head: 'Ask AI about Z-ALS', q: 'What is Z-ALS (Zurich Airport Limousine Service, z-als.ch) and what do its airport transfers cost?' },
  de: { head: 'KI zu Z-ALS fragen', q: 'Was ist Z-ALS (Zurich-Airport Limousinen Services, z-als.ch) und was kosten die Flughafentransfers?' },
  fr: { head: 'Demander à l’IA', q: 'Qu’est-ce que Z-ALS (Zurich Airport Limousine Service, z-als.ch) et combien coûtent ses transferts aéroport ?' },
  it: { head: 'Chiedi all’IA', q: 'Che cos’è Z-ALS (Zurich Airport Limousine Service, z-als.ch) e quanto costano i suoi transfer aeroportuali?' },
};

/** The column's links; `link` is the attribute string for each <a> in the target footer's style. */
function links(lang, link, subStyle) {
  const t = ASK_AI[lang] || ASK_AI.en, q = encodeURIComponent(t.q).replace(/%20/g, '+');
  return AI.map(a => `<a ${link} href="${a.url}${q}" target="_blank" rel="noopener noreferrer" data-ask-ai="${a.id}">${a.svg}<span>${a.name}${a.sub ? `<span ${subStyle}> · ${a.sub}</span>` : ''}</span></a>`).join('');
}

/** For the board footer (design/SiteFooter v3.dc.html, marker <!--z-ask-ai-->): inline styles like its other columns. */
export function askAiBoard(lang) {
  // A real rule, not style-hover: this markup goes in after build.mjs has compiled the board's hover attributes.
  const a = 'style="display:inline-flex;align-items:center;gap:10px;font-size:15px;color:rgba(255,255,255,0.82);text-decoration:none"';
  return `<div><style>a[data-ask-ai]:hover{color:#FFFFFF!important;text-decoration:underline!important;text-underline-offset:3px}</style><div style="font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.03em;color:#7E9BD4">${(ASK_AI[lang] || ASK_AI.en).head}</div><div style="display:flex;flex-direction:column;gap:12px;margin-top:20px">${links(lang, a, 'style="color:rgba(255,255,255,0.5);font-size:13px"')}</div></div>`;
}

/** For the restored pages' footer (SiteFooter-module classes), between markers so a rebuild replaces it. */
export function askAiOld(lang) {
  const P = c => `SiteFooter-module__nBz1BW__${c}`;
  return `<!--z-ask-ai--><div><div class="${P('colHead')}">${ASK_AI[lang].head}</div><div class="${P('colLinks')}">${links(lang, `class="${P('colLink')}" style="gap:10px"`, 'style="opacity:.55;font-size:13px"')}</div></div><!--/z-ask-ai-->`;
}
