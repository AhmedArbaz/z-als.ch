// Pixel-compares two screenshot sets from shoot.mjs (e.g. the old app vs the harvested pages) and
// writes a red-overlay diff image for every pair that differs. sharp comes from the harvest clone.
//
//   node tools/harvest/compare.mjs <dir-a> <dir-b> <diff-dir>
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const HARVEST_DIR = process.env.HARVEST_DIR || 'D:\\z-als-harvest';
const sharp = createRequire(path.join(HARVEST_DIR, 'package.json'))('sharp');
sharp.cache(false);
const [A, B, OUTDIR] = process.argv.slice(2);
fs.mkdirSync(OUTDIR, { recursive: true });

const raw = async f => { const { data, info } = await sharp(fs.readFileSync(f)).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); return { data, w: info.width, h: info.height }; };
const rows = [];
for (const name of fs.readdirSync(A).filter(f => f.endsWith('.png')).sort()) {
  const fb = path.join(B, name);
  if (!fs.existsSync(fb)) { rows.push({ name, note: 'missing in B' }); continue; }
  const a = await raw(path.join(A, name)), b = await raw(fb);
  if (a.w !== b.w || a.h !== b.h) { rows.push({ name, note: `size ${a.w}x${a.h} vs ${b.w}x${b.h}` }); continue; }
  let n = 0, x0 = a.w, y0 = a.h, x1 = -1, y1 = -1;
  const overlay = Buffer.from(b.data);
  for (let i = 0; i < a.data.length; i += 4) {
    const d = Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
    if (d > 48) {
      n++; const p = i / 4, x = p % a.w, y = (p / a.w) | 0;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      overlay[i] = 255; overlay[i + 1] = 0; overlay[i + 2] = 0; overlay[i + 3] = 255;
    }
  }
  const pct = (100 * n) / (a.w * a.h);
  if (n) await sharp(overlay, { raw: { width: a.w, height: a.h, channels: 4 } }).png().toFile(path.join(OUTDIR, name));
  rows.push({ name, pct: +pct.toFixed(3), box: n ? `${x0},${y0}-${x1},${y1}` : '' });
}
const differing = rows.filter(r => r.note || r.pct > 0);
for (const r of differing) console.log(`${r.name.padEnd(70)} ${r.note || r.pct + '%  box ' + r.box}`);
console.log(`\n${rows.length} pairs, ${rows.length - differing.length} identical, ${differing.length} differ`);
