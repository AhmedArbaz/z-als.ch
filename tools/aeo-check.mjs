// Monthly AI-visibility check for the assistants Ubersuggest can't see: Claude and Perplexity.
// Asks each the prompts in docs/seo/aeo/prompts.json and appends the result to docs/seo/aeo/<date>.json.
// Run: node --env-file-if-exists=.env tools/aeo-check.mjs   (needs ANTHROPIC_API_KEY and/or PERPLEXITY_API_KEY)
// Test: node tools/aeo-check.test.mjs

const NAMES = /z-als|zurich[- ]airport limousine|z-als\.ch/i;

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// ponytail: rank = index among top-level list lines (numbered, bulleted or **bold**-led, not indented); prose-only answers get none.
const ITEM = /^(?:\d+[.)]|[-*•]|\*\*)\s*/;

export function score(text) {
  const items = text.split('\n').filter(l => ITEM.test(l));
  const i = items.findIndex(l => NAMES.test(l));
  return { named: NAMES.test(text), rank: i < 0 ? null : i + 1 };
}

// Plain fetch on purpose: the repo has no dependencies.
async function claude(prompt) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-opus-5-5', max_tokens: 16000,
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 5, user_location: { type: 'approximate', country: 'CH', city: 'Zurich' } }],
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`claude ${r.status} ${(await r.text()).slice(0, 200)}`);
  const m = await r.json();
  // A refusal or a paused long search is not an answer: log it as an error rather than score it as "not named".
  if (m.stop_reason !== 'end_turn') throw new Error(`claude stopped: ${m.stop_reason}`);
  const texts = m.content.filter(b => b.type === 'text');
  // The URLs the answer actually cites, not every search result Claude read.
  return { text: texts.map(b => b.text).join(''), urls: texts.flatMap(b => (b.citations || []).map(c => c.url)).filter(Boolean) };
}

async function perplexity(prompt) {
  const r = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'sonar', messages: [{ role: 'user', content: prompt }] }),
  });
  if (!r.ok) throw new Error(`perplexity ${r.status} ${(await r.text()).slice(0, 200)}`);
  const m = await r.json();
  return { text: m.choices[0].message.content, urls: m.citations || [] };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = new URL('../docs/seo/aeo/', import.meta.url);
  const prompts = JSON.parse(readFileSync(new URL('prompts.json', dir), 'utf8'));
  const providers = { claude: process.env.ANTHROPIC_API_KEY && claude, perplexity: process.env.PERPLEXITY_API_KEY && perplexity };
  const on = Object.entries(providers).filter(([, f]) => f);
  if (!on.length) { console.error('Set ANTHROPIC_API_KEY and/or PERPLEXITY_API_KEY in .env'); process.exit(1); }
  const results = [];
  for (const { lang, prompt } of prompts) for (const [provider, ask] of on) {
    try {
      const { text, urls } = await ask(prompt);
      const s = score(text);
      results.push({ provider, lang, prompt, ...s, cited_z_als: urls.some(u => /z-als\.ch/.test(u)), urls, answer: text });
      console.log(`${provider.padEnd(10)} ${s.named ? `named${s.rank ? ` #${s.rank}` : ''}` : '-'.padEnd(5)}  ${prompt}`);
    } catch (e) { results.push({ provider, lang, prompt, error: e.message }); console.log(`${provider} error: ${e.message}`); }
  }
  const ok = results.filter(r => !r.error);
  const summary = Object.fromEntries(on.map(([p]) => {
    const rs = ok.filter(r => r.provider === p), ranks = rs.filter(r => r.rank).map(r => r.rank);
    return [p, { answers: rs.length, visibility: rs.length ? Math.round(100 * rs.filter(r => r.named).length / rs.length) : null,
      average_rank: ranks.length ? +(ranks.reduce((a, b) => a + b) / ranks.length).toFixed(1) : null }];
  }));
  const date = new Date().toISOString().slice(0, 10);
  mkdirSync(dir, { recursive: true });
  writeFileSync(new URL(`${date}.json`, dir), JSON.stringify({ date, summary, results }, null, 2) + '\n');
  console.log(JSON.stringify(summary), `→ docs/seo/aeo/${date}.json`);
}
