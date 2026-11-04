// Compiles the Claude Design boards in /design into static pages in /public.
//
//   node tools/build.mjs
//
// Each .dc.html board becomes plain HTML bound by public/js/dc-lite.js, and each
// board's `class Component` script is emitted unchanged into
// public/js/components.js. Re-run after re-exporting a board from Claude Design.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES, ROUTES } from './harvest/routes.mjs';
import { track, processStatic, headTags, ld, business, website, homeAlternates, esc } from './seo.mjs';
import { HOME, BOARDS, LANGS } from './seo/meta.mjs';
import { translatePage } from './translate.mjs';
import { faqSection, journalSection, faqNode, factsSection } from './seo/home-sections.mjs';
import { buildRoutes } from './routes.mjs';
import { facts } from './seo/facts.mjs';
import { askAiBoard } from './seo/ask-ai.mjs';
import { ROUTES as ROUTE_DEFS } from './seo/routes.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DESIGN = path.join(ROOT, 'design');
const OUT = path.join(ROOT, 'public');

// The homepage is built once per language (see page()): / in English, /de, /fr and /it pre-translated.
const PAGES = [
  { file: 'index.html', board: 'Main', path: '/', title: HOME.en.title, description: HOME.en.description, home: true },
  { file: 'quote.html', board: 'Quote', path: '/quote', ...BOARDS['/quote'] },
  { file: 'legal.html', board: 'Legal', path: '/legal', ...BOARDS['/legal'] },
  // The payment portal: served at payments.z-als.ch/ (its canonical), kept out of the sitemap.
  { file: 'pay.html', board: 'Pay', path: 'https://payments.z-als.ch/', ...BOARDS['/pay'], nositemap: true },
];

// The design links to boards that only exist on the canvas. Services, Fleet and
// Contact are sections of the homepage; the three legal boards are one page, /legal.
const SITE = 'https://z-als.ch';
const LINKS = [
  [/Z-ALS%20Home%20Page%20v4%20web\.dc\.html/g, '/'],
  // Extensionless: `serve` and nginx both resolve it, and a redirect from
  // /quote.html would drop the homepage's query string.
  [/Z-ALS%20Quote\.dc\.html/g, '/quote'],
  // The restored pages (public/<lang>/..., tools/harvest/). i18n.js swaps /en/ for the visitor's language.
  [/Z-ALS%20Services\.dc\.html(#[\w-]+)?/g, '/en/services$1'],
  [/Z-ALS%20Fleet\.dc\.html(#[\w-]+)?/g, '/en/fleet$1'],
  [/Z-ALS%20About\.dc\.html/g, '/en/about'],
  [/Z-ALS%20Blog\.dc\.html/g, '/en/journal'],
  [/Z-ALS%20Contact\.dc\.html#(imprint|privacy|terms)/g, '/legal#$1'],
  [/Z-ALS%20Contact\.dc\.html/g, '/en/contact'],
  // The design hotlinks the pre-rewrite site's uploads, which no longer exist.
  [/https:\/\/z-als\.ch\/wp-content\/uploads\/2017\/11\/Business-Class\.webp/g, '/assets/fleet/business-1200.webp'],
  [/https:\/\/z-als\.ch\/wp-content\/uploads\/2017\/11\/Premier-Class\.webp/g, '/assets/fleet/s-class-1200.webp'],
  [/https:\/\/z-als\.ch\/wp-content\/uploads\/2017\/11\/van\.webp/g, '/assets/fleet/v-class.webp'],
  [/(["'])assets\//g, '$1/assets/'],
];

// Typefaces: the boards share the restored pages' self-hosted font files (public/assets/old/media, declared in their
// site.css), latin and latin-ext only. They used to ask Google Fonts: a render-blocking request to another company's
// server, which also received every visitor's IP address. The same rules go to public/assets/fonts.css for the 404.
const FAMILIES = ['Playfair Display', 'Manrope', 'IBM Plex Mono'];
function fonts() {
  const css = fs.readFileSync(path.join(OUT, 'assets/old/site.css'), 'utf8');
  const faces = (css.match(/@font-face\{[^}]*\}/g) || []).filter(f => FAMILIES.includes((f.match(/font-family:([^;]+)/) || [])[1])
    && /unicode-range:(U\+\?\?|U\+100-2BA)/.test(f));
  const file = (family, style) => (faces.find(f => f.includes(`font-family:${family};font-style:${style};font-weight:400`) && /unicode-range:U\+\?\?/.test(f)) || '').match(/url\(([^)]+)\)/)?.[1];
  const preload = [file('Playfair Display', 'normal'), file('Manrope', 'normal')];
  if (faces.length < 20 || preload.some(p => !p)) throw new Error('fonts: expected the latin faces of Playfair Display and Manrope in public/assets/old/site.css');
  fs.writeFileSync(path.join(OUT, 'assets/fonts.css'), faces.join('\n') + '\n');
  return [...preload.map(p => `<link rel="preload" as="font" type="font/woff2" href="${p}" crossorigin>`), `<style>\n${faces.join('\n')}\n</style>`];
}
const SCRIPTS = ['i18n', 'dc-lite', 'places', 'fares', 'geo', 'components'];

const HREFS = { phoneHref: 'tel:+41762720909', waHref: 'https://wa.me/41762720909', mailHref: 'mailto:info@z-als.ch' };

// What the header's renderVals() returns on first render (top of page, nothing open, `active: home`).
const OPEN = 'rgba(255,255,255,0.7)', DIM = 'rgba(255,255,255,0.62)';
const CHEV = 'flex:none;transition:transform 200ms cubic-bezier(.2,.6,.2,1);transform:rotate(0deg)';
const INITIAL = {
  hdrBg: 'rgba(1,5,11,0.14)', hdrBorder: 'rgba(125,155,212,0.12)', hdrH: '86px',
  svcBg: 'transparent', fltBg: 'transparent', svcChev: CHEV, fltChev: CHEV,
  fgServices: OPEN, fgFleet: OPEN, fgAbout: OPEN, fgBlog: OPEN, fgContact: OPEN,
  ulServices: 'transparent', ulFleet: 'transparent', ulAbout: 'transparent', ulBlog: 'transparent', ulContact: 'transparent',
  langEN: '#FFFFFF', langDE: DIM, langFR: DIM, langIT: DIM,
  // Main's hero form: one way selected, fleet filter "all".
  dateColTemplate: 'repeat(2,minmax(0,1fr))',
  owBg: '#5D7DB7', owFg: '#FFFFFF', owBorder: '#5D7DB7',
  rtBg: 'transparent', rtFg: OPEN, rtBorder: 'rgba(125,155,212,0.34)', hrBg: 'transparent', hrFg: OPEN, hrBorder: 'rgba(125,155,212,0.34)',
};

const EVENTS = { onClick: 'click', onChange: 'change', onFocus: 'focus', onSubmit: 'submit', onMouseEnter: 'mouseenter', onMouseLeave: 'mouseleave' };
const ident = name => name.replace(/\W+/g, '_');
const decode = s => s.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

function load(board) {
  const src = fs.readFileSync(path.join(DESIGN, `${board}.dc.html`), 'utf8');
  const x = src.match(/<x-dc>([\s\S]*?)<\/x-dc>/);
  if (!x) throw new Error(`${board}: no <x-dc>`);
  const helmet = (x[1].match(/<helmet>([\s\S]*?)<\/helmet>/) || [, ''])[1];
  const script = src.match(/<script type="text\/x-dc" data-dc-script data-props="([^"]*)">([\s\S]*?)<\/script>/);
  return {
    board,
    helmet,
    body: x[1].replace(/<helmet>[\s\S]*?<\/helmet>/, ''),
    props: script ? JSON.parse(decode(script[1])) : {},
    js: script ? script[2] : '',
  };
}

const hoverRules = [];
const homeMisses = {};
function hoverClass(pseudo, decls) {
  const cls = `dc${pseudo[0]}${hoverRules.length}`;
  const body = decls.split(';').map(d => d.trim()).filter(Boolean).map(d => `${d} !important`).join(';');
  hoverRules.push(`.${cls}:${pseudo}{${body}}`);
  return cls;
}

function compile(board, seen) {
  const c = load(board);
  seen.set(board, c);
  let h = c.body;

  // Malformed binding in SiteHeader v3's chevrons: `{{ svcChev }:{{ svcChev }}`.
  h = h.replace(/\{\{ (\w+) \}:\{\{ \1 \}\}/g, '{{ $1 }}');
  // A block is `hidden` in the static HTML unless its design hint says it starts open: dc-lite only
  // un-hides it at mount (~0.5 s), and until then the closed menu overlay would cover the hero.
  h = h.replace(/<sc-if value="\{\{\s*([\w.]+)\s*\}\}"([^>]*)>/g, (m, k, rest) =>
    `<dc-if data-if="${k}"${/hint-placeholder-val="\{\{\s*true\s*\}\}"/.test(rest) ? '' : ' hidden'}>`).replace(/<\/sc-if>/g, '</dc-if>');
  h = h.replace(/\sref="\{\{[^"]*\}\}"/g, '').replace(/\shint-[\w-]+="[^"]*"/g, '');
  h = h.replace(/<sc-for each="\{\{\s*([\w.]+)\s*\}\}" as="(\w+)"[^>]*>/g, '<dc-for data-each="$1" data-as="$2"><template>').replace(/<\/sc-for>/g, '</template></dc-for>');
  h = h.replace(/\s(on[A-Z]\w+)="\{\{\s*([\w.]+)\s*\}\}"/g, (m, ev, fn) => {
    if (!EVENTS[ev]) throw new Error(`${board}: unsupported event ${ev}`);
    return ` data-on-${EVENTS[ev]}="${fn}"`;
  });

  // style-hover / style-active become generated classes. Inline styles win over
  // any class, so each declaration is emitted !important.
  h = h.replace(/<([a-z][\w-]*)((?:\s[^>]*?)?)>/g, (tag, name, attrs) => {
    if (!/\sstyle-(hover|active)=/.test(attrs)) return tag;
    const classes = [];
    attrs = attrs.replace(/\sstyle-(hover|active)="([^"]*)"/g, (_, kind, decls) => { classes.push(hoverClass(kind, decls)); return ''; });
    if (/\sclass="/.test(attrs)) attrs = attrs.replace(/\sclass="([^"]*)"/, (_, v) => ` class="${v} ${classes.join(' ')}"`);
    else attrs += ` class="${classes.join(' ')}"`;
    return `<${name}${attrs}>`;
  });

  // Attributes carrying a binding are re-evaluated by dc-lite on every render. A bound `style` also keeps a
  // static fallback (the declarations that need no binding, plus INITIAL values) so the first paint, before
  // dc-lite mounts, is not an unstyled page; mount overwrites it.
  h = h.replace(/\s([\w-]+)="([^"]*\{\{[^"]*)"/g, (m, name, val) => {
    const bound = ` data-t-${name}="${val}"`;
    // A bound link keeps a real address in the static HTML (crawlers and no-JS visitors), dc-lite replaces it at mount.
    if (name === 'href') { const k = (val.match(/^\{\{\s*(\w+)\s*\}\}$/) || [])[1]; return (k && HREFS[k] ? ` href="${HREFS[k]}"` : '') + bound; }
    if (name !== 'style') return bound;
    const css = val.split(';').map(d => d.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (x, k) => (k in INITIAL ? INITIAL[k] : x))).filter(d => d.trim() && !d.includes('{{')).join(';');
    return (css ? ` style="${css}"` : '') + bound;
  });
  // Whatever braces remain sit in text.
  h = h.replace(/>([^<]*)</g, (m, text) => `>${text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, '<dc-text data-k="$1"></dc-text>')}<`);

  // Images load lazily unless they carry fetchpriority (the hero) or are the header logo.
  h = h.replace(/<img\b([^>]*)>/g, (m, a) => (/\sloading=|fetchpriority=|data-m="hdr-logo"/.test(a) ? m : `<img loading="lazy" decoding="async"${a}>`));

  // Nested boards.
  h = h.replace(/<dc-import name="([^"]+)"([^>]*)><\/dc-import>/g, (m, name, attrs) => {
    const props = {};
    for (const [, k, v] of attrs.matchAll(/\s([\w-]+)="([^"{]*)"/g)) props[k.replace(/-(\w)/g, (_, ch) => ch.toUpperCase())] = v;
    const inner = compile(name, seen);
    return `<div data-component="${ident(name)}" data-props='${JSON.stringify(props)}' style="display:contents">${inner}</div>`;
  });
  return h;
}

function page({ file, board, path: urlPath, title, description, home, nositemap }) {
  hoverRules.length = 0;
  const seen = new Map();
  const body = compile(board, seen);

  // <link>/<meta> tags are shared between boards and deduplicated; each board's
  // <style> block is kept whole.
  const head = [];
  for (const c of seen.values()) {
    const styles = c.helmet.match(/<style>[\s\S]*?<\/style>/g) || [];
    const tags = c.helmet.replace(/<style>[\s\S]*?<\/style>/g, '').split('\n').map(l => l.trim()).filter(Boolean);
    for (const t of tags) if (!/name="viewport"/.test(t) && !/fonts\.(googleapis|gstatic)\.com/.test(t) && !head.includes(t)) head.push(t);
    head.push(...styles);
  }
  head.unshift(...fonts());

  const shell = ({ lang, urlPath, title, description, alternates, schema }) => `<!DOCTYPE html>
<html lang="${lang}"${home ? ' data-home' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
${headTags({ lang, path: urlPath, title, description, alternates })}
${schema}
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/assets/icon.png" type="image/png" sizes="512x512">
<link rel="apple-touch-icon" href="/assets/apple-icon.png" sizes="180x180">
<style>
/* The page is drawn once, mounted: until dc-lite has rendered and translated it, nothing shows and the entry animations wait. */
html{background:#01050B}
html:not(.z-ready) body{visibility:hidden}
html:not(.z-ready) *{animation-play-state:paused!important}
</style>
<noscript><style>html:not(.z-ready) body{visibility:visible}html:not(.z-ready) *{animation-play-state:running!important}</style></noscript>
<script>setTimeout(function(){document.documentElement.classList.add("z-ready")},3000)</script>
${SCRIPTS.map(s => `<script src="/js/${s}.js" defer></script>`).join('\n')}
${head.join('\n')}
<style>
dc-if,dc-for{display:contents}dc-if[hidden]{display:none!important}
[id]{scroll-margin-top:100px}
${hoverRules.join('\n')}
</style>
</head>
<body>
<div data-component="${ident(board)}" style="display:contents">${body}</div>
<script>addEventListener('DOMContentLoaded', function () {
  try { DC.mount(); } finally { document.documentElement.classList.add('z-ready'); }
  // The browser jumps to #anchor before DC.mount() renders, so jump again now and once fonts
  // and images have settled the layout (/#fleet, /legal#privacy).
  if (location.hash.length > 1) {
    const jump = () => { const t = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (t) t.scrollIntoView(); };
    jump(); addEventListener('load', jump, { once: true });
  }
});</script>
</body>
</html>
`;

  const finish = html => {
    for (const [re, to] of LINKS) html = html.replace(re, to);
    // A board link nothing above maps would ship as a 404.
    const stray = html.match(/[\w%]+\.dc\.html[^"']*/);
    if (stray) throw new Error(`${board}: unmapped board link ${stray[0]}`);
    return track(html);
  };
  const write = (rel, html) => { fs.mkdirSync(path.dirname(path.join(OUT, rel)), { recursive: true }); fs.writeFileSync(path.join(OUT, rel), html); };

  if (!home) {
    // ponytail: /quote and /legal switch language client-side, so their Ask-AI links ask in English.
    let html = finish(shell({ lang: 'en', urlPath, title, description, schema: ld([website(), business()]) })).replace('<!--z-ask-ai-->', () => askAiBoard('en'));
    // The portal is served on payments.z-als.ch, where every page but / is the main site's: its links say so.
    if (nositemap) html = html.replace(/(href|data-t-href)="\/(?!\/|assets\/|js\/|favicon)/g, '$1="https://z-als.ch/');
    write(file, html);
    return seen;
  }
  for (const lang of LANGS) {
    const m = HOME[lang];
    const upath = lang === 'en' ? '/' : '/' + lang;
    let html = finish(shell({ lang, urlPath: upath, title: m.title, description: m.description, alternates: homeAlternates(), schema: ld([website(lang), business(lang), faqNode(lang)]) }));
    if (lang !== 'en') {
      const r = translatePage(html, lang);
      html = r.html;
      homeMisses[lang] = r.untranslated;
    }
    // A route without a page in this language keeps the card's original behaviour (fill the form above).
    for (const r of ROUTE_DEFS) if (!r.langs.includes(lang)) html = html.replaceAll(`href="/${lang}/transfers/zurich-airport-to-${r.slug}"`, 'href="#hero-form"');
    html = html.replace('<!--z-faq-->', () => factsSection(lang) + '\n' + faqSection(lang)).replace('<!--z-journal-->', () => journalSection(lang)).replace('<!--z-ask-ai-->', () => askAiBoard(lang));
    write(lang === 'en' ? file : `${lang}/index.html`, html);
  }
  return seen;
}

const all = new Map();
process.on('exit', () => { for (const [l, m] of Object.entries(homeMisses)) if (m.length && process.env.SHOW_MISSING) console.log(`untranslated on /${l}:`, m); });
for (const p of PAGES) for (const [k, v] of page(p)) all.set(k, v);

const js = ['// GENERATED by tools/build.mjs from design/*.dc.html. Edit the boards, not this file.'];
for (const c of all.values()) js.push(`{\n${c.js.trim()}\nDC.register(${JSON.stringify(ident(c.board))}, Component);\n}`);
fs.mkdirSync(path.join(OUT, 'js'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'js', 'components.js'), js.join('\n\n') + '\n');
console.log('built', PAGES.map(p => p.file).join(', '), 'from', [...all.keys()].join(', '));

// ── Restored pages ───────────────────────────────────────────────────────────
// public/<lang>/{about,services,fleet,contact,journal,journal/<slug>}.html are static files harvested
// from the retired Next.js site (tools/harvest/). They are edited in place, not generated here; the
// build only checks them, together with the board pages, and writes the sitemap.
const restored = LOCALES.flatMap(l => ROUTES.map(r => `/${l}${r}`));
const restoredSet = new Set(restored);
for (const p of restored) if (!fs.existsSync(path.join(OUT, p + '.html'))) throw new Error(`missing ${p}.html: run tools/harvest`);

// Route landing pages and hubs (tools/routes.mjs): written from the restored pages' layout, one per language and route.
const { pages: routePages, missing: routeMissing } = buildRoutes(OUT);
if (routeMissing.length) console.log('route content not written yet:', routeMissing.join(', '));
for (const p of routePages) restoredSet.add(p.urlPath);

// GTM, consent, metadata and schema go on every restored page, route page and the 404 (idempotent, see tools/seo.mjs).
const touched = processStatic(OUT, [...restored.map(p => p.slice(1) + '.html'), ...routePages.map(p => p.file), '404.html'], new Map(routePages.map(p => [p.urlPath, p])));
if (touched) console.log('tracking snippet written to', touched, 'static pages');

// Retired tariff lines (driver time, the old hourly packages with included km, VAT-inclusive per-km
// figures) and removed services must not come back on any page. Phrases, not bare amounts: a bare
// "CHF 600.00" is also a valid 100 km fare.
const BANNED = ['60 / hr', '60 / Std', '60 / h ', '60 / ora', '60.00 + 8.1', '60.00 zzgl', '60.00 plus', '60.00 più',
  'includes 20 km', 'inkl. 20 km', '20 km inclus', 'twenty kilometres', ', 100 km', ', 200 km', '6.486', '7.567', 'CHF 6.000', 'CHF 7.000',
  'not at CHF 84', '+ CHF 1.00', 'driver time', 'Fahrzeit zu CHF', 'courier', 'Kurier', 'coursier', 'corriere', 'href="/transfers', '.dc.html'];
const htmlFiles = fs.readdirSync(OUT, { recursive: true }).map(String).filter(f => f.endsWith('.html'));
// The pages of the site that are not restored ones: the root, the other boards and the language homepages.
const HOME_PATHS = LANGS.filter(l => l !== 'en').map(l => '/' + l);
const fileOf = p => (p === '/' ? 'index' : HOME_PATHS.includes(p) ? p.slice(1) + '/index' : p.slice(1)) + '.html';
const ids = new Map();
const hasId = (p, id) => {
  if (!ids.has(p)) ids.set(p, new Set([...fs.readFileSync(path.join(OUT, fileOf(p)), 'utf8').matchAll(/\sid="([^"]+)"/g)].map(m => m[1])));
  return ids.get(p).has(id);
};
for (const f of htmlFiles) {
  const html = fs.readFileSync(path.join(OUT, f), 'utf8');
  const text = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
  for (const b of BANNED) if (text.includes(b)) throw new Error(`${f}: retired text "${b}"`);
  const skipRoutes = process.env.ALLOW_MISSING_ROUTES && routeMissing.length;
  // Every internal link and asset must resolve, #anchors included.
  for (const [, ref] of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    if (skipRoutes && /^\/(en|de|fr|it)\/transfers/.test(ref)) continue;
    const [, frag] = ref.split('#');
    const p = ref.split('#')[0].split('?')[0];
    const page = p === '/' || p === '/quote' || p === '/legal' || HOME_PATHS.includes(p) || restoredSet.has(p);
    const ok = page || p === '/favicon.ico' || (/^\/(assets|js)\//.test(p) && fs.existsSync(path.join(OUT, decodeURIComponent(p))));
    if (!ok) throw new Error(`${f}: broken link ${ref}`);
    if (page && frag && !hasId(p, frag)) throw new Error(`${f}: ${ref} has no #${frag}`);
  }
}

// sitemap.xml: the board pages, plus the restored pages with their language alternates.
const alt = r => LOCALES.map(x => `<xhtml:link rel="alternate" hreflang="${x}" href="${SITE}/${x}${r}"/>`).join('')
  + `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/en${r}"/>`;
// <lastmod> is the day a page's content last changed: tools/seo/lastmod.json remembers each file's hash and the day it was first seen with it.
const LASTMOD_FILE = path.join(ROOT, 'tools', 'seo', 'lastmod.json');
const lastmods = fs.existsSync(LASTMOD_FILE) ? JSON.parse(fs.readFileSync(LASTMOD_FILE, 'utf8')) : {};
const today = new Date().toISOString().slice(0, 10);
const day = f => {
  // CRLF → LF first: a checkout with core.autocrlf would otherwise give every page a new hash (and today's date).
  const h = crypto.createHash('sha1').update(fs.readFileSync(path.join(OUT, f), 'utf8').replace(/\r\n/g, '\n')).digest('hex').slice(0, 12);
  if (!lastmods[f] || lastmods[f].h !== h) lastmods[f] = { h, d: today };
  return lastmods[f].d;
};
const lastmod = p => day(p.slice(1) + '.html');
const homeAlt = homeAlternates().map(([hl, href]) => `<xhtml:link rel="alternate" hreflang="${hl}" href="${href}"/>`).join('');
const urls = [
  ...LANGS.map(l => `<url><loc>${SITE}${l === 'en' ? '/' : '/' + l}</loc><lastmod>${day(l === 'en' ? 'index.html' : l + '/index.html')}</lastmod>${homeAlt}</url>`),
  ...PAGES.filter(p => !p.home && !p.nositemap).map(p => `<url><loc>${SITE}${p.path}</loc><lastmod>${day(p.file)}</lastmod></url>`),
  ...restored.map(p => `<url><loc>${SITE}${p}</loc><lastmod>${lastmod(p)}</lastmod>${alt(p.slice(3))}</url>`),
  ...routePages.map(p => `<url><loc>${SITE}${p.urlPath}</loc><lastmod>${day(p.file)}</lastmod>${p.alternates.map(([hl, href]) => `<xhtml:link rel="alternate" hreflang="${hl}" href="${href}"/>`).join('')}</url>`)];
fs.writeFileSync(LASTMOD_FILE, JSON.stringify(Object.fromEntries(Object.entries(lastmods).sort()), null, 1) + '\n');
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`);
console.log(`checked ${htmlFiles.length} pages (${restored.length} restored, ${routePages.length} route pages); sitemap ${urls.length} URLs`);

// /llms.txt (llmstxt.org): the fact sheet plus the pages an AI assistant should read, in English. Rebuilt every build.
{
  const link = (title, p, note) => `- [${title}](${SITE}${p})${note ? ': ' + note : ''}`;
  const en = routePages.filter(p => p.lang === 'en');
  const txt = `# Z-ALS · Zurich Airport Limousine Service

> Zurich-Airport Limousinen Services GmbH (Z-ALS) is a chauffeur and airport limousine service based at Zürich Airport since 2004: fixed per-km fares, a Mercedes fleet, flight tracking and transfers across Switzerland and to neighbouring countries. Book online at ${SITE}/quote or through dispatch.

${facts('en').map(([k, v]) => `- ${k}: ${v}`).join('\n')}

## Main pages
${link('Home and FAQ', '/', 'services, route fares and ten answered questions')}
${link('Services', '/en/services', 'airport transfer, limousine by the hour, private chauffeur, bus, VIP pick-up')}
${link('Fleet', '/en/fleet', 'the vehicle classes, seats and cases')}
${link('About Z-ALS', '/en/about', 'the company, its base in Kloten and its chauffeurs')}
${link('Contact and dispatch', '/en/contact')}
${link('Book or get a quote', '/quote', 'the fare is shown before you send anything')}
${link('Rate card, terms and imprint', '/legal')}

## Transfers from Zürich Airport
${en.map(p => link(p.meta.title.replace(/\s*[|·–-]\s*Z-ALS.*$/, ''), p.urlPath)).join('\n')}

## Optional
${link('Journal', '/en/journal', 'articles on fixed fares, delayed flights, winter routes and chauffeur standards')}
${link('Deutsch', '/de')}
${link('Français', '/fr')}
${link('Italiano', '/it')}
`;
  fs.writeFileSync(path.join(OUT, 'llms.txt'), txt);
}
