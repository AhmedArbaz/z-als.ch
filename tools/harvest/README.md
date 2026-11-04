# Restored old-site pages

`public/{en,de,fr,it}/{about,services,fleet,contact,journal,journal/<slug>}.html` are the Journal, About,
Services, Fleet and Contact pages of the retired Next.js site (`jalexzander662-web/z-als`, archived),
harvested on 2026-09-26 so they keep their exact design in all four languages at their old URLs.

They are **plain static files now**: edit them in place (all four locales), then `npm run build`, which
checks them (retired prices, broken links) and regenerates `public/sitemap.xml`. Their styles are
`public/assets/old/site.css` and `public/assets/old/media/*.woff2` (the old compiled CSS and next/font
files); their behaviour (header panels, phone menu, WhatsApp button, contact form) is
`public/js/old-site.js`. Prices on them are static text that `node tools/fares.test.mjs` compares with
`public/js/fares.js`: after a tariff change, update them there too.

You only need the files below to harvest again from the old source:

| File | |
| --- | --- |
| `routes.mjs` | The restored routes and locales (shared with `tools/build.mjs`). |
| `old-site.patch` | What was changed in the old source before harvesting: today's tariff (no driver time, hourly CHF 120/130, min 4 h, Milano priced), copy fixes in 4 languages, no transfer links, real social links, the bus photo's plate blurred, a `data-eyebrow` hook on the contact form. |
| `harvest.mjs` | Renders every page with Playwright, captures the client-only markup (panels, overlay, WhatsApp button, form states) in place, strips Next.js, rewrites links/images, writes the files above. |
| `shoot.mjs`, `compare.mjs` | Screenshots every page and state, and pixel-diffs two runs (old app vs harvested). |

Re-harvest (the old repo is archived, so clone it; nothing is ever pushed back):

```bash
git clone https://github.com/jalexzander662-web/z-als D:/z-als-harvest
cd D:/z-als-harvest && git apply --binary <this repo>/tools/harvest/old-site.patch && npm ci
NEXT_PUBLIC_SITE_URL=https://z-als.ch npm run build
PORT=3100 HOSTNAME=127.0.0.1 npm run start:standalone
# in this repo:
node tools/harvest/harvest.mjs http://127.0.0.1:3100 && npm run build && node tools/fares.test.mjs
```

On 2026-09-26 the harvested pages matched the patched old app pixel for pixel, apart from the V-Class
photo (the old one showed a dealer plate) and one-pixel text anti-aliasing.
