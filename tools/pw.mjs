// Loads Playwright for the dev-only browser checks (tools/glitch-probe.mjs, tools/gtm.test.mjs).
// The repo has no dependencies, so use `npm i -g playwright`, an `npx playwright` cache, or PLAYWRIGHT_DIR.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

function find() {
  const cache = path.join(process.env.LOCALAPPDATA || '', 'npm-cache', '_npx');
  const dirs = [process.env.PLAYWRIGHT_DIR, ...(fs.existsSync(cache) ? fs.readdirSync(cache).map(d => path.join(cache, d, 'node_modules', 'playwright')) : [])];
  return dirs.find(d => d && fs.existsSync(path.join(d, 'package.json')));
}

export async function chromium() {
  const dir = find();
  const pw = dir ? createRequire(import.meta.url)(dir) : await import('playwright');
  return pw.chromium;
}

// Start Chrome without relying on the version-matched ms-playwright download.
export async function launch(opts = {}) {
  const c = await chromium();
  try { return await c.launch({ ...opts }); } catch { return await c.launch({ channel: 'chrome', ...opts }); }
}
