// Screenshots every restored page, and the header/FAB states, so the harvested pages can be
// diffed against the real old site. Playwright comes from the harvest clone (this repo has no deps).
//
//   node tools/harvest/shoot.mjs <base-url> <out-dir>      e.g. http://127.0.0.1:3100 D:\z-als-harvest\shots\baseline
//   HARVEST_DIR (default D:\z-als-harvest) is the clone of the old Next.js site.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROUTES, LOCALES } from './routes.mjs';

const HARVEST_DIR = process.env.HARVEST_DIR || 'D:\\z-als-harvest';
const { chromium } = createRequire(path.join(HARVEST_DIR, 'package.json'))('playwright');
const [base, out] = process.argv.slice(2);
if (!base || !out) { console.error('usage: shoot.mjs <base-url> <out-dir>'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });

const VIEWPORTS = { d: { width: 1440, height: 900 }, m: { width: 390, height: 844 } };
const name = (l, r, v, s = 'full') => `${l}${r.replace(/\//g, '_')}_${v}_${s}.png`;
const errors = [];

const browser = await chromium.launch();
async function open(vp, url) {
  const ctx = await browser.newContext({ viewport: vp, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') errors.push(`${url} :: ${m.text()}`); });
  page.on('pageerror', e => errors.push(`${url} :: pageerror ${e.message}`));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${url} :: ${r.status()} ${r.url()}`); });
  const res = await page.goto(base + url, { waitUntil: 'networkidle' });
  if (!res || res.status() !== 200) errors.push(`${url} :: status ${res && res.status()}`);
  await page.evaluate(() => document.fonts.ready);
  // Full-size photos (no Next image optimizer here) can still be decoding; wait, or they shoot blank.
  await page.evaluate(() => Promise.all([...document.images].map(i => { i.loading = 'eager'; return i.decode().catch(() => {}); })));
  await page.waitForTimeout(250);
  return { ctx, page };
}

let n = 0;
for (const l of LOCALES) {
  for (const r of ROUTES) {
    for (const [v, vp] of Object.entries(VIEWPORTS)) {
      const { ctx, page } = await open(vp, `/${l}${r}`);
      await page.screenshot({ path: path.join(out, name(l, r, v)), fullPage: true });
      await ctx.close(); n++;
    }
  }
  // Header and FAB states, on the About page.
  const url = `/${l}/about`;
  let { ctx, page } = await open(VIEWPORTS.d, url);
  await page.mouse.wheel(0, 400); await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, name(l, '/about', 'd', 'scrolled')) });
  await page.mouse.wheel(0, -400); await page.waitForTimeout(300);
  const navButtons = page.locator('#site-header nav button[aria-expanded]');
  await navButtons.nth(0).hover(); await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, name(l, '/about', 'd', 'services')) });
  await navButtons.nth(1).hover(); await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, name(l, '/about', 'd', 'fleet')) });
  await ctx.close();
  ({ ctx, page } = await open(VIEWPORTS.m, url));
  await page.locator('#site-header button:visible').last().click(); await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, name(l, '/about', 'm', 'overlay')) });
  await ctx.close();
  ({ ctx, page } = await open(VIEWPORTS.m, url));
  await page.mouse.wheel(0, 600); await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(out, name(l, '/about', 'm', 'fab')) });
  await ctx.close();
  n += 5;
  console.log(`${l}: done`);
}
await browser.close();
fs.writeFileSync(path.join(out, '_errors.txt'), errors.join('\n'));
console.log(`${n} screenshots in ${out}; ${errors.length} console/network errors (see _errors.txt)`);
