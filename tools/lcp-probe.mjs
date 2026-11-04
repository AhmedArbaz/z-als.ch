// Median FCP / LCP of a page under throttling, with variants that isolate what delays it.
//   node tools/lcp-probe.mjs <url> [runs]     variants: as shipped, no GTM request, consent already answered
import { launch } from './pw.mjs';

const url = process.argv[2] || 'https://z-als.ch/en/services';
const runs = +process.argv[3] || 5;
const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];

const browser = await launch();
async function once({ blockGtm, answered }) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'en-CH' });
  if (blockGtm) await ctx.route(/googletagmanager\.com/, r => r.abort());
  if (answered) await ctx.addInitScript(() => { try { localStorage.setItem('zals-consent', JSON.stringify({ a: false, t: Date.now() })); } catch (e) {} });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
    window.__m = { lcp: 0, el: '' };
    new PerformanceObserver(l => l.getEntries().forEach(e => { window.__m.lcp = Math.round(e.startTime); window.__m.el = e.element ? e.element.nodeName + '.' + String(e.element.className).slice(0, 24) : e.url; })).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => l.getEntries().forEach(e => { if (e.name === 'first-contentful-paint') window.__m.fcp = Math.round(e.startTime); })).observe({ type: 'paint', buffered: true });
  });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const m = await page.evaluate(() => window.__m);
  await ctx.close();
  return m;
}

for (const [name, v] of [['as shipped', {}], ['no GTM request', { blockGtm: true }], ['consent answered', { answered: true }], ['no GTM + answered', { blockGtm: true, answered: true }]]) {
  const r = [];
  for (let i = 0; i < runs; i++) r.push(await once(v));
  console.log(name.padEnd(20), 'FCP', med(r.map(x => x.fcp)), 'LCP', med(r.map(x => x.lcp)), 'LCP el', r[0].el, '| all LCP', r.map(x => x.lcp).join(','));
}
await browser.close();
