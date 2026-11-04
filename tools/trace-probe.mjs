// Main-thread tasks over 40 ms during load, from a Chrome trace: what ran, and when first paint happened.
//   node tools/trace-probe.mjs <url> [--block=gtm] [--accepted]
import { launch } from './pw.mjs';

const url = process.argv[2] || 'https://z-als.ch/en/services';
const block = (process.argv.find(a => a.startsWith('--block=')) || '').slice(8);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
if (block === 'gtm') await ctx.route(/googletagmanager/, r => r.abort());
if (process.argv.includes('--accepted')) await ctx.addInitScript(() => localStorage.setItem('zals-consent', JSON.stringify({ a: false, t: Date.now() })));
const page = await ctx.newPage();
await browser.startTracing(page, { categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink.user_timing', 'loading'] });
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(3500);
const buf = await browser.stopTracing();
const events = JSON.parse(buf.toString()).traceEvents;
const nav = events.find(e => e.name === 'navigationStart' && e.args?.data?.isLoadingMainFrame) || events.find(e => e.name === 'navigationStart');
const t0 = nav.ts;
const ms = t => Math.round((t - t0) / 1000);
const mark = n => { const e = events.find(x => x.name === n && x.ts >= t0); return e ? ms(e.ts) : null; };
console.log('FCP', mark('firstContentfulPaint'), 'LCP', events.filter(e => e.name === 'largestContentfulPaint::Candidate' && e.ts >= t0).map(e => ms(e.ts)).join(','), 'DCL', mark('domContentLoadedEventEnd'), 'load', mark('loadEventEnd'));
const main = events.find(e => e.name === 'thread_name' && e.args?.name === 'CrRendererMain');
const tasks = events.filter(e => e.ph === 'X' && e.tid === main?.tid && e.pid === main?.pid && e.name === 'RunTask' && e.dur > 40000 && e.ts >= t0);
for (const t of tasks) {
  const inside = events.filter(e => e.ph === 'X' && e.tid === t.tid && e.ts >= t.ts && e.ts + e.dur <= t.ts + t.dur && e !== t && e.dur > 15000 && !/RunTask/.test(e.name));
  console.log(`${String(ms(t.ts)).padStart(5)} ms  ${Math.round(t.dur / 1000)} ms:`, [...new Set(inside.map(e => e.name + (e.args?.data?.url ? ' ' + e.args.data.url.split('/').pop() : '') + ' ' + Math.round(e.dur / 1000)))].slice(0, 8).join(' | '));
}
await browser.close();
