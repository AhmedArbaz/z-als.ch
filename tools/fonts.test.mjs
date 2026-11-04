// The boards and the 404 must use the self-hosted typefaces: no request to Google Fonts, and the faces the first
// screen needs are actually loaded from this site.   node tools/fonts.test.mjs [base-url]
import { launch } from './pw.mjs';
const base = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const browser = await launch();
let failed = false;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); failed ||= !c; };
for (const p of ['/', '/de', '/quote', '/legal', '/no-such-page']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const external = [], fontUrls = [];
  page.on('request', r => { const u = r.url(); if (/fonts\.(googleapis|gstatic)\.com/.test(u)) external.push(u); if (r.resourceType() === 'font') fontUrls.push(new URL(u).pathname); });
  await page.goto(base + p, { waitUntil: 'networkidle' });
  const loaded = await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, '') + ' ' + f.weight); });
  ok(external.length === 0, `${p} asks Google Fonts for nothing${external.length ? ' (' + external[0] + ')' : ''}`);
  ok(loaded.some(f => f.startsWith('Manrope')), `${p} Manrope loaded (${[...new Set(loaded)].join(', ')})`);
  if (p !== '/legal' && p !== '/quote') ok(loaded.some(f => f.startsWith('Playfair')), `${p} Playfair Display loaded`);
  ok(fontUrls.every(u => u.startsWith('/assets/')), `${p} every font file comes from /assets/`);
  await ctx.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
