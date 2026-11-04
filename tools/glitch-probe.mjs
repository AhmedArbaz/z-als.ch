// Measures what a visitor sees while the page loads: does anything paint before the page is mounted, and
// does the layout move?  node tools/glitch-probe.mjs [base-url] [path ...]
import { launch } from './pw.mjs';

const base = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const paths = process.argv.slice(3).length ? process.argv.slice(3) : ['/', '/quote', '/legal', '/?lang=de'];
const browser = await launch();

let failed = false;
for (const [name, vp, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['mobile', { width: 390, height: 844 }, true]]) {
  for (const p of paths) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, locale: 'en-CH' });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.addInitScript(() => {
      const ev = window.__ev = [];
      for (const type of ['paint', 'layout-shift', 'largest-contentful-paint']) {
        new PerformanceObserver(l => l.getEntries().forEach(e => ev.push({ type, name: e.name, t: Math.round(e.startTime), v: e.value, src: (e.sources || []).map(s => (s.node && (s.node.nodeName + (s.node.className ? '.' + String(s.node.className).slice(0, 30) : '') + (s.node.id ? '#' + s.node.id : ''))) + ' ' + Math.round(s.previousRect.y) + '->' + Math.round(s.currentRect.y) + ' h' + Math.round(s.currentRect.height)) }))).observe({ type, buffered: true });
      }
      // Per frame: is the body visible, and is the mobile menu overlay (if rendered) on screen, while the page is not mounted?
      (function tick() {
        const root = document.documentElement;
        const ready = root.classList.contains('z-ready');
        const body = document.body;
        const visible = !!body && getComputedStyle(body).visibility !== 'hidden';
        const ov = document.querySelector('[data-menu="overlay"]');
        const overlayShown = !!ov && ov.getClientRects().length > 0 && getComputedStyle(ov).visibility !== 'hidden';
        if (visible && !ready) ev.push({ type: 'visible-before-ready', t: Math.round(performance.now()), overlayShown });
        if (overlayShown && ready) ev.push({ type: 'overlay-after-ready', t: Math.round(performance.now()) });
        requestAnimationFrame(tick);
      })();
    });
    await page.goto(base + p, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const ev = await page.evaluate(() => window.__ev);
    const cls = ev.filter(e => e.type === 'layout-shift').reduce((a, e) => a + e.v, 0);
    const early = ev.filter(e => e.type === 'visible-before-ready');
    const overlay = ev.filter(e => e.type === 'overlay-after-ready' || (e.type === 'visible-before-ready' && e.overlayShown));
    const fcp = (ev.find(e => e.name === 'first-contentful-paint') || {}).t;
    const lcp = ev.filter(e => e.type === 'largest-contentful-paint').map(e => e.t).pop();
    const bad = early.length > 0 || overlay.length > 0 || cls > 0.05;
    failed ||= bad;
    console.log(`${bad ? 'FAIL' : 'ok  '} ${name.padEnd(7)} ${p.padEnd(10)} FCP ${fcp}ms LCP ${lcp}ms CLS ${cls.toFixed(4)} paintedBeforeMount ${early.length} overlayFrames ${overlay.length}`);
    for (const s of ev.filter(e => e.type === "layout-shift" && e.v > 0.001)) console.log(`      shift ${s.v.toFixed(4)} @${s.t}ms ${(s.src || []).join(" | ")}`);
    await ctx.close();
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
