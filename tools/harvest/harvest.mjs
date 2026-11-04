// Harvests the retired Next.js site's Journal, About, Services, Fleet and Contact pages (4 locales)
// into static files: public/<locale>/<route>.html, public/assets/old/ (compiled CSS + next/font files),
// public/assets/og/ (article share images). Run it against a patched clone of the old repo, served by
// `npm run start:standalone`; see tools/harvest/README.md. After a harvest the pages are plain HTML:
// edit public/<locale>/... directly.
//
//   node tools/harvest/harvest.mjs [base-url]        default http://127.0.0.1:3100
//   HARVEST_DIR (default D:\z-als-harvest) is the clone; Playwright and the build output come from it.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { ROUTES, LOCALES, SLUGS } from './routes.mjs';

const HARVEST_DIR = process.env.HARVEST_DIR || 'D:\\z-als-harvest';
const { chromium } = createRequire(path.join(HARVEST_DIR, 'package.json'))('playwright');
const BASE = (process.argv[2] || 'http://127.0.0.1:3100').replace(/\/$/, '');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PUBLIC = path.join(ROOT, 'public');
const SITE = 'https://z-als.ch';

const write = (file, data) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, data); };

// ── 1. Capture every page with its client-only markup (panels, overlay, FAB, form states) ─────────────
async function capture(browser, l, r) {
  const url = `${BASE}/${l}${r}`;
  const desk = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await desk.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  const navButtons = page.locator('#site-header nav button[aria-expanded]');
  const panel = () => page.evaluate(() => document.getElementById('site-header').children[1]?.outerHTML || '');
  await navButtons.nth(0).hover(); await page.waitForTimeout(250);
  const svc = await panel();
  await navButtons.nth(1).hover(); await page.waitForTimeout(250);
  const flt = await panel();
  if (!svc || !flt || svc === flt) throw new Error(`${url}: header panels not captured`);

  let states = null;
  if (r === '/contact') {
    await page.mouse.move(700, 800); await page.waitForTimeout(300);
    const form = page.locator('form[data-eyebrow]');
    await form.locator('input[type=text]').fill('Test');
    await form.locator('input[type=email]').fill('a@b'); // valid for the browser, rejected by the form's own check
    await form.locator('textarea').fill('Test');
    await form.locator('input[type=checkbox]').check();
    await form.locator('button[type=submit]').click(); await page.waitForTimeout(150);
    const invalid = await form.locator('[aria-live]').innerHTML();
    await page.evaluate(() => { window.open = () => null; });
    await form.locator('input[type=email]').fill('test@example.ch');
    await form.locator('button[type=submit]').click(); await page.waitForTimeout(150);
    const opened = (await form.locator('[aria-live]').innerHTML()).replace(/href="https:\/\/wa\.me\/[^"]*"/, 'href="{{href}}"');
    if (invalid === opened || !opened.includes('{{href}}')) throw new Error(`${url}: contact form states not captured`);
    states = { invalid, opened };
  }

  const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const mp = await mob.newPage();
  await mp.goto(url, { waitUntil: 'networkidle' });
  await mp.locator('#site-header button:visible').last().click(); await mp.waitForTimeout(250);
  const overlay = await mp.evaluate(() => document.getElementById('site-header').nextElementSibling?.outerHTML || '');
  await mp.keyboard.press('Escape'); await mp.waitForTimeout(150);
  await mp.mouse.wheel(0, 900); await mp.waitForTimeout(400);
  // WhatsAppFab renders nothing until scrolled; React mounts it as the last child of the footer.
  const fab = await mp.evaluate(() => {
    const wrap = document.querySelector('[class*="WhatsAppFab-module"][class*="wrap"]');
    return wrap && wrap.parentElement.tagName === 'FOOTER' && !wrap.nextElementSibling ? wrap.outerHTML : null;
  });
  if (!overlay || !fab) throw new Error(`${url}: overlay or FAB not captured`);
  await mob.close();

  // A fresh render, then the captured markup goes back in, hidden, where React would mount it.
  await page.goto(url, { waitUntil: 'networkidle' });
  const html = await page.evaluate(({ svc, flt, overlay, fab, states }) => {
    const make = (markup, attr) => { const t = document.createElement('template'); t.innerHTML = markup; const el = t.content.firstElementChild; el.hidden = true; el.setAttribute(attr, ''); return el; };
    const h = document.getElementById('site-header');
    const s = make(svc, 'data-panel'); s.setAttribute('data-panel', 'svc');
    const f = make(flt, 'data-panel'); f.setAttribute('data-panel', 'flt');
    h.children[0].after(s, f);
    const nav = h.querySelectorAll('nav button[aria-expanded]');
    nav[0].setAttribute('data-open-panel', 'svc'); nav[1].setAttribute('data-open-panel', 'flt');
    [...h.querySelectorAll('button')].filter(b => !b.hasAttribute('aria-expanded')).pop().setAttribute('data-menu', '');
    const o = make(overlay, 'data-overlay'); h.after(o);
    o.querySelector('button').setAttribute('data-close', '');
    document.querySelector('footer').append(make(fab, 'data-fab'));
    if (states) {
      const form = document.querySelector('form[data-eyebrow]');
      for (const [k, v] of Object.entries(states)) { const t = document.createElement('template'); t.setAttribute('data-state', k); t.innerHTML = v; form.append(t); }
    }
    return '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
  }, { svc, flt, overlay, fab, states });
  const css = await page.$$eval('link[rel=stylesheet]', ls => ls.map(l => l.getAttribute('href')));
  await desk.close();
  return { html, css };
}

// ── 2. Turn a captured Next page into a plain static one ──────────────────────────────────────────────
const IMG = src => {
  const p = decodeURIComponent(src);
  if (p === '/fleet/van.webp') return '/assets/fleet/v-class.webp'; // the old photo showed a dealer plate
  // 1200px re-encodes (2026-09-27): the originals weighed 420-520 KB for 320px thumbnails.
  if (p === '/fleet/business.webp' || p === '/fleet/s-class.webp') return '/assets' + p.replace('.webp', '-1200.webp');
  if (p.startsWith('/fleet/')) return '/assets' + p;
  if (p === '/logo-white.png' || p === '/logo.png') return '/assets' + p;
  throw new Error('unmapped image ' + p);
};

function clean(html, l, r, cssHref) {
  let h = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/g, '')
    .replace(/<next-route-announcer[\s\S]*?<\/next-route-announcer>/g, '')
    .replace(/<link\b[^>]*rel="(?:stylesheet|modulepreload|canonical|alternate|expect)"[^>]*>/g, '')
    .replace(/<link\b[^>]*as="(?:script|image|style)"[^>]*>/g, '')
    .replace(/<meta\b[^>]*name="next-size-adjust"[^>]*>/g, '')
    .replace(/<meta\b[^>]*property="og:url"[^>]*>/g, '')
    .replace(/\snonce="[^"]*"/g, '')
    .replace(/\s(?:srcset|sizes)="[^"]*"/g, '')
    .replace(/\/_next\/image\?url=([^&"]+)[^"]*/g, (m, u) => IMG(u))
    .replace(/\/_next\/static\/media\//g, '/assets/old/media/')
    .replace(/href="\/icon\.png[^"]*"/g, 'href="/assets/icon.png"')
    .replace(/href="\/apple-icon\.png[^"]*"/g, 'href="/assets/apple-icon.png"')
    // Old-site pages that are not restored live on the new site now.
    .replace(/href="\/(en|de|fr|it)"/g, 'href="/?lang=$1"')
    .replace(/href="\/(en|de|fr|it)\/quote"/g, 'href="/quote?lang=$1"')
    .replace(/href="\/(en|de|fr|it)\/legal\/(imprint|privacy|terms)"/g, 'href="/legal?lang=$1#$2"')
    // Share images and structured data point at live URLs.
    .replace(/https:\/\/z-als\.ch\/(?:en|de|fr|it)\/journal\/([a-z0-9-]+)\/opengraph-image[^"]*/g, `${SITE}/assets/og/$1.png`)
    .replace(/"https:\/\/z-als\.ch\/(?:en|de|fr|it)"/g, `"${SITE}/"`);
  if (/_next|\/transfers/.test(h)) throw new Error(`${l}${r}: leftover ${h.match(/.{40}(?:_next|\/transfers).{40}/)?.[0]}`);

  const alt = LOCALES.map(x => `<link rel="alternate" hreflang="${x}" href="${SITE}/${x}${r}">`).join('')
    + `<link rel="alternate" hreflang="x-default" href="${SITE}/en${r}">`;
  const head = `<link rel="canonical" href="${SITE}/${l}${r}">${alt}<meta property="og:url" content="${SITE}/${l}${r}">`
    + `<link rel="stylesheet" href="${cssHref}"><style>[hidden]{display:none!important}</style>`
    + `<script>try{localStorage.setItem('zals-lang','${l}')}catch(e){}</script>`
    + `<script src="/js/old-site.js" defer></script>`;
  return h.replace('</head>', head + '</head>');
}

// ── 3. Run ────────────────────────────────────────────────────────────────────────────────────────────
const browser = await chromium.launch();
const pages = [];
const cssOrder = [];
for (const l of LOCALES) {
  for (const r of ROUTES) {
    const { html, css } = await capture(browser, l, r);
    for (const c of css) if (!cssOrder.includes(c)) cssOrder.push(c);
    pages.push({ l, r, html });
  }
  console.log(`${l}: captured ${ROUTES.length}`);
}
await browser.close();

// Compiled CSS, in first-seen document order, plus the next/font files it references.
let css = '';
for (const href of cssOrder) {
  if (!href.startsWith('/_next/static/')) throw new Error('unexpected stylesheet ' + href);
  css += `/* ${href} */\n` + await (await fetch(BASE + href)).text() + '\n';
}
const fonts = [...new Set([...css.matchAll(/url\(\.\.\/media\/([^)]+)\)/g)].map(m => m[1]))];
css = css.replace(/url\(\.\.\/media\//g, 'url(/assets/old/media/').replace(/}/g, '}\n');
for (const f of fonts) write(path.join(PUBLIC, 'assets/old/media', f), fs.readFileSync(path.join(HARVEST_DIR, '.next/static/media', f)));
write(path.join(PUBLIC, 'assets/old/site.css'), css);
const cssHref = '/assets/old/site.css?v=' + crypto.createHash('sha256').update(css).digest('hex').slice(0, 10);

for (const { l, r, html } of pages) write(path.join(PUBLIC, l, r + '.html'), clean(html, l, r, cssHref));

// Share images (the old opengraph-image renders the English title for every locale).
for (const s of SLUGS) {
  const res = await fetch(`${BASE}/en/journal/${s}/opengraph-image`);
  if (!res.ok) throw new Error(`og ${s}: ${res.status}`);
  write(path.join(PUBLIC, 'assets/og', s + '.png'), Buffer.from(await res.arrayBuffer()));
}
// The bus photo, with its number plate blurred in the clone.
write(path.join(PUBLIC, 'assets/fleet/bus.webp'), fs.readFileSync(path.join(HARVEST_DIR, 'public/fleet/bus.webp')));

console.log(`wrote ${pages.length} pages, site.css (${cssOrder.length} chunks, ${fonts.length} fonts), ${SLUGS.length} og images`);
