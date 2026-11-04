# z-als.ch

The Z-ALS website: the Variation 2 homepage, a Request a quote wizard and the legal page, served at
**https://z-als.ch** (www.z-als.ch 301s to it). It replaced the Next.js site
(`jalexzander662-web/z-als`, archived) on 2026-09-26. That site's Journal, About, Services, Fleet and Contact pages
are kept at their old URLs in all four languages, harvested as static HTML in their original design
(`public/{en,de,fr,it}/`, see `tools/harvest/README.md`); its other `/en`, `/de`, `/fr`, `/it` URLs 301 here (`server.mjs`).

| | |
| --- | --- |
| `design/` | Source boards. `Main`, `SiteHeader v3`, `SiteFooter v3` and `WhatsAppFab` come from the Claude Design artifact "Z-ALS — Variation 2 Homepage". `Quote` is the booking wizard, modelled on swisselitelimousine.ch/de/buchen. |
| `tools/build.mjs` | Compiles the boards to static HTML in `public/`. |
| `public/js/dc-lite.js` | Small runtime that binds the boards' own `Component` classes to that HTML, with no React or Babel. |
| `public/` | The site. It is committed because the Docker image serves it as is. `public/js/places.js` (destinations) and `public/js/fares.js` (tariff) are the one price engine, used by both the pages and the server. |
| `tools/fares.test.mjs` | `node tools/fares.test.mjs`: pins the fares, including the figures z-als.ch's own tests pin. |
| `server.mjs` | Dependency-free Node server: serves `public/`, takes card and TWINT payments through Stripe Checkout (and hears of them through Stripe's webhook), and emails each booking and each Contact-page message to dispatch through Resend. |

```bash
npm run dev        # builds, then serves http://localhost:3002 (reads .env if present)
npm run build      # after editing anything in design/
```

**Pricing.** The client's tariff (2026-09-25) in `public/js/fares.js`: a transfer is distance × the class rate, never
below the class minimum (CHF 120, or 130 for Premium and SUV), VAT 8.1% as its own line. The destination list, from the
retired Next.js site, gives about 550 Swiss postcodes and European cities a road distance from Zürich Airport; any of
them up to 320 km gets a fixed fare (one way or return), from or to the airport. Any other trip (a door address, Basel or
Geneva airport) is priced the same way on its road distance, which `server.mjs` measures with Mapbox Search Box and Directions (`/api/route`) and
measures again before it charges. Hourly hire is CHF 120/h (130 for Premium and SUV) for 4 to 12 hours, shown as a price
but settled after the journey. Anything past 320 km, a route Mapbox can't measure, and the Minibus are quoted by dispatch.

**Payment.** On the wizard's last step **Book via WhatsApp** comes first and is pre-selected: the team confirms the
chauffeur and arranges payment. Paying on the website is the alternative, for any fixed fare: **Card** (Stripe
Checkout: Visa, Mastercard, Amex, Apple Pay, Google Pay), **TWINT** (Stripe Checkout's TWINT page: a QR code on a
computer, the app on a phone; Stripe caps one TWINT payment at CHF 5,000, above that the site offers card) or **Pay
the chauffeur**. `server.mjs` re-prices every booking and never trusts an amount sent by the browser. It charges the
gross fare and stores the whole booking in the Stripe payment's metadata.

**Booking emails.** Every completed booking is emailed to dispatch (`NOTIFY_TO`, info@z-als.ch) from
`bookings@z-als.ch` through Resend, with Reply-To set to the customer, and the customer gets a confirmation.
"Book via WhatsApp" and "Pay the chauffeur" post to `/api/enquiry`; if dispatch's email fails the server answers 502
and the page says so and offers WhatsApp and the phone, so a request never looks sent when it isn't. Paid bookings
are emailed from the Stripe session as soon as Stripe's webhook (`/api/stripe/webhook`) or the customer's return
reports the payment, once. The homepage form and wizard steps 1–3 also offer "Continue on WhatsApp" with the trip so
far; those send no email, because they have no contact details yet.

**Contact pages.** The form on /en|de|fr|it/contact posts `/api/contact`: an email to dispatch only, Reply-To the
visitor. If it can't be sent, the page offers the same message on WhatsApp.

| Env | |
| --- | --- |
| `STRIPE_SECRET_KEY` | Stripe restricted key with **Checkout Sessions: Write** (card and TWINT); write includes read. **Only in Dokploy's environment panel**, never in git or chat. Without it the site works and online payment shows as unavailable. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret (`whsec_…`) of the live Stripe webhook destination `https://z-als.ch/api/stripe/webhook` (events `checkout.session.completed`, `checkout.session.async_payment_succeeded`). **Only in Dokploy's environment panel.** Without it the webhook answers 503 and paid bookings are reported by the return page only (then for sessions of any age; with it, only for sessions under an hour old). |
| `MAPBOX_TOKEN` | Mapbox token for address suggestions, used by the server only. Without it the fields show the town directory. |
| `SITE_URL` | `https://z-als.ch`: Stripe's return URLs, and the canonical host (other `*.z-als.ch` hosts 301 to it). |
| `RESEND_API_KEY` | Resend key with sending access for z-als.ch. **Only in Dokploy's environment panel.** Without it no email is sent: "Pay the chauffeur" and the contact form then say so and point to WhatsApp or the phone; "Book via WhatsApp" still opens WhatsApp. |
| `NOTIFY_TO` / `NOTIFY_FROM` | Default `info@z-als.ch` / `Z-ALS Bookings <bookings@z-als.ch>`. |
| `PORT` | 3000 in the image, 3002 by default locally. |

TWINT has to be enabled under Stripe Dashboard → Settings → Payment methods. It stays *pending* until Stripe has
checked the legal notice (company name and legal form, full address, a contact) that the site links to.

The WhatsApp button sits top-left under the header once the page scrolls, as on z-als.ch.

Payment logos in `public/assets/pay/` are from [datatrans/payment-logos](https://github.com/datatrans/payment-logos)
(CC BY-SA 4.0), unmodified. The marks themselves belong to Visa, Mastercard, American Express, Apple, Google and TWINT.

Deploy: Dokploy application `previous-variation-2` (Clients website → production, Dockerfile → Node on :3000). There is no webhook,
so push to `main` and then trigger a deploy.
