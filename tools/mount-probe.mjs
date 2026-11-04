// How long the page's mount (the DOMContentLoaded handler) takes under 4x CPU throttling.  node tools/mount-probe.mjs <url> [runs]
import { launch } from './pw.mjs';
const url = process.argv[2] || 'https://z-als.ch/', runs = +process.argv[3] || 5;
const browser = await launch();
const out = [];
for (let i = 0; i < runs; i++) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto(url, { waitUntil: 'load' });
  out.push(await page.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return { dclStart: Math.round(n.domContentLoadedEventStart), dclMs: Math.round(n.domContentLoadedEventEnd - n.domContentLoadedEventStart), resp: Math.round(n.responseEnd), load: Math.round(n.loadEventStart) }; }));
  await ctx.close();
}
console.log(out.map(o => JSON.stringify(o)).join('\n'));
await browser.close();
