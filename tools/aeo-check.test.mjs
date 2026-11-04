// The AI-answer scorer behind tools/aeo-check.mjs. Run: node tools/aeo-check.test.mjs (no API calls).
import assert from 'node:assert/strict';
import { score } from './aeo-check.mjs';

// Any of the brand's names counts, in any case.
assert.equal(score('Try Z-ALS for a fixed fare.').named, true);
assert.equal(score('zurich airport limousine service is reliable').named, true);
assert.equal(score('Zurich-Airport Limousinen Services GmbH runs S-Classes').named, true);
assert.equal(score('Book on z-als.ch').named, true);
assert.equal(score('Blacklane and Sixt ride are popular.').named, false);

// Rank = position of the first list item that names Z-ALS; numbered, bulleted or bold-led lists.
const list = `Here are good options:

1. **Blacklane** – global chauffeur network.
2. **TripTransfer** – private transfers.
3. **Z-ALS** – Zurich Airport Limousine Service, fixed fares.

Z-ALS also covers Zermatt.`;
assert.equal(score(list).rank, 3);
assert.equal(score('- Mozio\n- Zurich Airport Limousine Service (z-als.ch)\n- HOP IN').rank, 2);
// Indented sub-bullets under a brand are details, not brands.
assert.equal(score('1. **Blacklane**\n   - fixed prices\n   - app\n2. **Z-ALS**\n   - Kloten').rank, 2);
// Named only in prose, or not at all: no rank.
assert.equal(score('Z-ALS is one option.').rank, null);
assert.equal(score('1. Blacklane\n2. Sixt').rank, null);

console.log('aeo-check: all assertions passed');
