# GA4 through Google Tag Manager: what is live and what is left to do

**Container:** `GTM-MKMXMR2X`, installed on every page of z-als.ch (all 4 languages, the booking wizard, the legal page and the 404).

## What the site already does

- Loads the container on every page (once the page has finished loading, so it never slows the first paint), except on `localhost` (so development and tests do not pollute your data).
- Consent Mode v2: `ad_storage`, `analytics_storage`, `ad_user_data` and `ad_personalization` start as **denied**. A banner in the visitor's language (EN, DE, FR, IT) asks once. *Accept analytics* grants `analytics_storage` only (the site runs no advertising). The choice is kept 12 months in the browser (`zals-consent`) and can be changed with **Cookie settings** in the page footer.
- Pushes these events to `dataLayer` (never names, emails, phone numbers or free text):

| Event | When | Parameters |
|---|---|---|
| `consent_granted` / `consent_declined` | the visitor answers the banner | – |
| `quote_start` | the booking wizard opens | `prefilled` (came from the homepage form), `step` |
| `quote_step` | the visitor moves between steps, forwards or back | `step`, `step_name` (`trip`, `car`, `details`, `review`, `payment`) |
| `generate_lead` | a booking request reached dispatch (WhatsApp or "pay the chauffeur") | `method` (`whatsapp`/`driver`), `trip_type`, `vehicle`, `value`, `currency` (CHF, the fare shown) |
| `begin_checkout` | the visitor is sent to Stripe (card or TWINT) | `payment_method`, `trip_type`, `vehicle`, `value`, `currency` |
| `purchase` | the visitor returns from Stripe with a paid session | `transaction_id`, `value`, `currency`, `payment_method` |
| `whatsapp_click` | any WhatsApp link or button | `link_location` |
| `phone_click` | any `tel:` link | `link_location` |
| `email_click` | any `mailto:` link | `link_location` |
| `contact_submit` | the contact form was sent or failed | `result` (`sent`/`error`), `link_location` |
| `ask_ai` | a footer "Ask AI about Z-ALS" link (since 2026-10-20) | `method` (`chatgpt`/`claude`/`gemini`/`perplexity`), `link_location` |

Campaign parameters (`utm_*`, `gclid`, `gbraid`, `wbraid`, `fbclid`, `msclkid`) are no longer stripped from the quote page's address.

## Container status

- **2026-10-04 and 10-06:** the published container had no tags (`"tags":[]`): GTM loaded, nothing reached Google Analytics.
- **2026-10-07:** the published version (2) holds **one Google tag, `G-WXJ4J6YKZQ`, page views only, and no event tags**. So page views are measured; the events in the table above are pushed to `dataLayer` but nothing forwards them to GA4 yet (step 2 to 4 below).
- **2026-10-08:** steps 2–5 below are done and published (trigger `z-als events`, 12 Data Layer Variables, GA4 Event tag with event name `{{Event}}`), tested in Tag Assistant. In GA4: Search Console linked, `checkout.stripe.com` added as an unwanted referral. Still open: key events, event data retention set to 14 months (it showed 2), and Enhanced measurement → Form interactions turned off (the contact form already sends `contact_submit`).

The steps below are done in the GTM and GA4 web interfaces with your own Google login; nothing here needs a password shared with anyone.

## Why the GA numbers before and after the migration do not compare

Three different measurement set-ups sat behind the same domain, and consent now defaults to denied:

| Period | Site | Measurement |
|---|---|---|
| until 2026-09-11 | WordPress (German at `/`, then English rebuild) | the agency's report (Google Analytics); its September 2025 "organic" count (6.4k) against 77 clicks in Search Console points to bot traffic |
| 2026-09-11 → 09-26 | Next.js site | GA4 `G-P8X3PYL98W` |
| 2026-09-26 → ~10-06 | this site | nothing was sent |
| ~2026-10-06 → | this site | GTM `GTM-MKMXMR2X` → GA4 `G-WXJ4J6YKZQ`, consent denied until a visitor accepts |

**To do in GA4:** add annotations for 2026-09-11 (Next.js launch) and 2026-09-26 → 10-06 (no measurement), so nobody reads those weeks as a collapse. Compare clicks and impressions in Search Console, which does not depend on tags or consent.

## To do in Google Tag Manager (about 10 minutes)

1. ~~Tags → New → Google tag.~~ **Done** (version 2, `G-WXJ4J6YKZQ`, trigger Initialization – All Pages).
2. **Triggers → New → Custom Event.** Event name (use *regex matching*): `^(quote_start|quote_step|generate_lead|begin_checkout|purchase|whatsapp_click|phone_click|email_click|contact_submit|ask_ai)# GA4 through Google Tag Manager: what is live and what is left to do

**Container:** `GTM-MKMXMR2X`, installed on every page of z-als.ch (all 4 languages, the booking wizard, the legal page and the 404).

## What the site already does

- Loads the container on every page (once the page has finished loading, so it never slows the first paint), except on `localhost` (so development and tests do not pollute your data).
- Consent Mode v2: `ad_storage`, `analytics_storage`, `ad_user_data` and `ad_personalization` start as **denied**. A banner in the visitor's language (EN, DE, FR, IT) asks once. *Accept analytics* grants `analytics_storage` only (the site runs no advertising). The choice is kept 12 months in the browser (`zals-consent`) and can be changed with **Cookie settings** in the page footer.
- Pushes these events to `dataLayer` (never names, emails, phone numbers or free text):

| Event | When | Parameters |
|---|---|---|
| `consent_granted` / `consent_declined` | the visitor answers the banner | – |
| `quote_start` | the booking wizard opens | `prefilled` (came from the homepage form), `step` |
| `quote_step` | the visitor moves between steps, forwards or back | `step`, `step_name` (`trip`, `car`, `details`, `review`, `payment`) |
| `generate_lead` | a booking request reached dispatch (WhatsApp or "pay the chauffeur") | `method` (`whatsapp`/`driver`), `trip_type`, `vehicle`, `value`, `currency` (CHF, the fare shown) |
| `begin_checkout` | the visitor is sent to Stripe (card or TWINT) | `payment_method`, `trip_type`, `vehicle`, `value`, `currency` |
| `purchase` | the visitor returns from Stripe with a paid session | `transaction_id`, `value`, `currency`, `payment_method` |
| `whatsapp_click` | any WhatsApp link or button | `link_location` |
| `phone_click` | any `tel:` link | `link_location` |
| `email_click` | any `mailto:` link | `link_location` |
| `contact_submit` | the contact form was sent or failed | `result` (`sent`/`error`), `link_location` |
| `ask_ai` | a footer "Ask AI about Z-ALS" link (since 2026-10-20) | `method` (`chatgpt`/`claude`/`gemini`/`perplexity`), `link_location` |

Campaign parameters (`utm_*`, `gclid`, `gbraid`, `wbraid`, `fbclid`, `msclkid`) are no longer stripped from the quote page's address.

## Container status

- **2026-10-04 and 10-06:** the published container had no tags (`"tags":[]`): GTM loaded, nothing reached Google Analytics.
- **2026-10-07:** the published version (2) holds **one Google tag, `G-WXJ4J6YKZQ`, page views only, and no event tags**. So page views are measured; the events in the table above are pushed to `dataLayer` but nothing forwards them to GA4 yet (step 2 to 4 below).
- **2026-10-08:** steps 2–5 below are done and published (trigger `z-als events`, 12 Data Layer Variables, GA4 Event tag with event name `{{Event}}`), tested in Tag Assistant. In GA4: Search Console linked, `checkout.stripe.com` added as an unwanted referral. Still open: key events, event data retention set to 14 months (it showed 2), and Enhanced measurement → Form interactions turned off (the contact form already sends `contact_submit`).

The steps below are done in the GTM and GA4 web interfaces with your own Google login; nothing here needs a password shared with anyone.

## Why the GA numbers before and after the migration do not compare

Three different measurement set-ups sat behind the same domain, and consent now defaults to denied:

| Period | Site | Measurement |
|---|---|---|
| until 2026-09-11 | WordPress (German at `/`, then English rebuild) | the agency's report (Google Analytics); its September 2025 "organic" count (6.4k) against 77 clicks in Search Console points to bot traffic |
| 2026-09-11 → 09-26 | Next.js site | GA4 `G-P8X3PYL98W` |
| 2026-09-26 → ~10-06 | this site | nothing was sent |
| ~2026-10-06 → | this site | GTM `GTM-MKMXMR2X` → GA4 `G-WXJ4J6YKZQ`, consent denied until a visitor accepts |

**To do in GA4:** add annotations for 2026-09-11 (Next.js launch) and 2026-09-26 → 10-06 (no measurement), so nobody reads those weeks as a collapse. Compare clicks and impressions in Search Console, which does not depend on tags or consent.

## To do in Google Tag Manager (about 10 minutes)

1. ~~Tags → New → Google tag.~~ **Done** (version 2, `G-WXJ4J6YKZQ`, trigger Initialization – All Pages).
2. **Triggers → New → Custom Event.** Event name (use *regex matching*): `^(quote_start|quote_step|generate_lead|begin_checkout|purchase|. Name it `z-als events`. **To do (2026-10-20):** the published trigger predates `ask_ai`; add `|ask_ai` to its regex and publish, or those clicks never reach GA4.
3. **Variables → New → Data Layer Variable** (one each): `step`, `step_name`, `method`, `trip_type`, `vehicle`, `value`, `currency`, `payment_method`, `transaction_id`, `result`, `link_location`, `prefilled`.
4. **Tags → New → Google Analytics: GA4 Event.** Configuration tag: the Google tag from step 1. Event name: the built-in variable `{{Event}}`. Add event parameters for each variable from step 3 (name = the variable's name). Trigger: `z-als events`.
5. **Preview** the container on `https://z-als.ch` (Tag Assistant), accept the banner, open `/quote` and check that the Google tag and the event tag fire. Then **Submit → Publish**.

## To do in Google Analytics 4

1. Admin → Events → mark `generate_lead` and `purchase` as **key events** (conversions).
2. Admin → Data streams → *Configure tag settings* → **List unwanted referrals** → add `checkout.stripe.com` (customers return from Stripe's checkout page; without this each return starts a new session).
3. Admin → Data settings → Data retention: set event data to 14 months.
4. Optional: link the property to Google Search Console (Admin → Product links) to see search queries next to behaviour.

## Checking it works

- Use GTM Preview (Tag Assistant) on the live site, and GA4 → Admin → DebugView while it is connected.
- With consent declined, GA4 may still receive anonymous, cookie-less pings (that is how Consent Mode works); no `_ga` cookies are set. `node tools/gtm.test.mjs https://z-als.ch` asserts exactly this and reports whether a GA4 tag is published.
