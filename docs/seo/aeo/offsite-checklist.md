# AEO: off-site checklist (for the client and the agency)

AI assistants recommend what *other* sources say about a business far more than what its own site says. The site work
(fact sheet, structured data, `/llms.txt`, the two guides, the Ask-AI footer) shipped on 2026-10-20; these steps are the
other half and need a person with the client's logins. Tick them off with a date.

Goal: Z-ALS named in at least 40% of the 15 tracked prompts with an average rank of 3 or better by April 2027
(baseline 0%, `baseline-2026-10-20.json`). Check every month: Ubersuggest AI Search Visibility (ChatGPT, Gemini, Google AI
Overviews) and `node --env-file-if-exists=.env tools/aeo-check.mjs` (Claude, Perplexity).

## 1. This week (highest leverage)

- [ ] **Google Business Profile** (`maps.google.com/?cid=14848855290927465453`): business name exactly
      "Z-ALS – Zurich Airport Limousine Service"; address Am Balsberg 36, 8302 Kloten; phone +41 76 272 0909; website
      https://z-als.ch; primary category "Limousine service", secondary "Chauffeur service" and "Airport shuttle service";
      services with prices (CHF 6.00/km Business, CHF 7.00/km Premium/SUV, minimum CHF 120/130, hourly CHF 120/130, plus VAT);
      opening hours 24/7; 10+ recent photos of the cars (no legible number plates). If its map pin differs from
      47.442, 8.567, put the pin's coordinates into `geo` in `tools/seo.mjs`.
- [ ] **Reviews**: ask every customer of the last 12 months for a Google review (a short link from GBP → "Ask for reviews",
      sent by dispatch after each ride). Reply to every review, including old ones. Never buy or script reviews.
- [ ] **Bing Webmaster Tools** (ChatGPT search and Copilot use Bing's index): sign in, *Import from Google Search Console*,
      submit `https://z-als.ch/sitemap.xml`. If it asks for the meta tag instead, paste its `msvalidate.01` value into
      `VERIFY` in `tools/seo.mjs`, build, commit, deploy.
- [ ] **GTM**: add `|ask_ai` to the `z-als events` trigger regex and publish (see `docs/seo/ga4-gtm-setup.md`), so the
      footer's Ask-AI clicks reach GA4.
- [ ] **API keys for the monthly check**: put `ANTHROPIC_API_KEY` and `PERPLEXITY_API_KEY` into `.env` (never in chat or a
      commit), then run `tools/aeo-check.mjs` once for the Claude/Perplexity baseline.

## 2. This month: consistent listings (same name, address, phone everywhere)

- [ ] local.ch and search.ch (the Swiss directories AI tools and Apple Maps read)
- [ ] Apple Business Connect (Apple Maps, Siri)
- [ ] Tripadvisor: list Z-ALS under "Transportation → Taxis & Shuttles" in Kloten/Zürich and ask customers for reviews there too
- [ ] Yelp Switzerland, Moneyhouse/Zefix entry check (legal name, address)
- [ ] Wikidata: an item for "Zurich-Airport Limousinen Services GmbH" (instance of: business; country: Switzerland; located in:
      Kloten; inception: 2004; official website: https://z-als.ch; plus the social profiles from the site's `sameAs`)

## 3. Ongoing: be where the AIs look for recommendations

- [ ] Answer real questions on the Tripadvisor Zürich forum and Reddit (r/askswitzerland, r/zurich, r/Switzerland) about getting
      from the airport to Zermatt, St. Moritz, Davos or a hotel: helpful first, say openly that you run Z-ALS, link the guide page
      that answers it (`/en/transfers/zurich-airport-to-the-alps`, `/en/transfers/taxi-train-or-chauffeur`).
- [ ] Ask partner hotels, event agencies and corporate travel managers to list Z-ALS as their airport transfer on their own
      sites ("getting here" pages are what AI answers quote).
- [ ] Pitch the guides to Swiss travel and ski blogs ("how to get from Zurich Airport to Zermatt"): one cited article is worth more
      than ten directory entries.
- [ ] Keep the name identical everywhere: "Z-ALS – Zurich Airport Limousine Service" (legal name Zurich-Airport Limousinen
      Services GmbH where a legal name is asked).

## 4. Housekeeping the build will force

- **By 2027-04-20** the build fails until someone re-checks the taxi and train figures in `tools/seo/external-prices.json`
  (sources listed in the file), updates them and the `checked` date.
- Review at 4 and 8 weeks (around 2026-11-17 and 2026-12-15): compare Ubersuggest and `aeo-check` with the baseline, note which
  prompts moved and which competitors are named instead.
