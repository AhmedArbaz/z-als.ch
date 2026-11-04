// One-off generator for the share image and favicon (run by hand, outputs are committed):
//   node tools/make-og.mjs      →  public/assets/og/home.jpg (1200×630), public/favicon.ico (48×48 PNG in an ICO)
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch } from './pw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const asset = p => pathToFileURL(path.join(ROOT, 'public', p)).href;

const html = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400&family=Manrope:wght@500;600&display=swap">
<style>
*{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;background:#01050B;overflow:hidden;font-family:Manrope,system-ui,sans-serif;color:#fff}
.bg{position:absolute;inset:0;background:url("${asset('assets/fleet/hero-s-class-1600.webp')}") 70% 60%/cover;filter:saturate(.7) contrast(1.06) brightness(.55)}
.shade{position:absolute;inset:0;background:linear-gradient(105deg,rgba(1,5,11,.96) 0%,rgba(5,13,28,.8) 48%,rgba(1,5,11,.35) 100%)}
.wrap{position:absolute;inset:0;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between}
img{height:44px;width:auto;display:block;align-self:flex-start}
h1{margin:0;font:400 78px/1.02 'Playfair Display',Georgia,serif;letter-spacing:-.03em;max-width:820px}
h1 span{color:#7E9BD4}
p{margin:22px 0 0;font-size:26px;font-weight:500;color:rgba(255,255,255,.82);letter-spacing:.01em}
.bar{display:flex;align-items:center;gap:16px;font-size:22px;font-weight:600;color:#7E9BD4}
.bar i{display:block;width:34px;height:1px;background:#5D7DB7}
</style>
<div class="bg"></div><div class="shade"></div>
<div class="wrap">
<img src="${asset('assets/logo-white.png')}" alt="">
<div><h1>Chauffeured airport transfers <span>across Switzerland.</span></h1><p>Zürich · Basel · Geneva · Fixed fares from CHF 120</p></div>
<div class="bar"><i></i>z-als.ch · since 2004</div>
</div>`;

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
// file:// assets are blocked from about:blank, so the card is loaded from a temp file.
const tmp = path.join(os.tmpdir(), 'zals-og.html');
fs.writeFileSync(tmp, html);
await page.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
fs.mkdirSync(path.join(ROOT, 'public/assets/og'), { recursive: true });
await page.screenshot({ path: path.join(ROOT, "public/assets/og/home.jpg"), type: "jpeg", quality: 84 });

// favicon.ico: a 48×48 PNG inside the ICO container (every current browser and Google's crawler accept it).
const icon = await browser.newPage({ viewport: { width: 48, height: 48 } });
const tmpIcon = path.join(os.tmpdir(), 'zals-icon.html');
fs.writeFileSync(tmpIcon, `<style>html,body{margin:0;background:transparent}img{width:48px;height:48px;display:block}</style><img src="${asset('assets/icon.png')}">`);
await icon.goto(pathToFileURL(tmpIcon).href, { waitUntil: 'load' });
const png = await icon.screenshot({ omitBackground: true });
const head = Buffer.alloc(22);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
head.writeUInt8(48, 6); head.writeUInt8(48, 7); head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12);
head.writeUInt32LE(png.length, 14); head.writeUInt32LE(22, 18);
fs.writeFileSync(path.join(ROOT, 'public/favicon.ico'), Buffer.concat([head, png]));
await browser.close();
console.log('wrote og/home.jpg and favicon.ico');
