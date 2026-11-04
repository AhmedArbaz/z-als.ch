# Keyword research and plan for z-als.ch

*Prepared 2026-10-04 from searches run in a real browser on google.ch (language and region set per market), then on DuckDuckGo where Google asked for a CAPTCHA. 427 candidate keywords across 4 languages are in [keyword-plan.csv](keyword-plan.csv).*

## How the research was done, and what it cannot tell you

1. **Seeds** in each language: airport transfer, chauffeur and limousine service, private driver, fleet, resort routes (Davos, St. Moritz, Zermatt, Interlaken, Lucerne, Bern, Basel, Lugano, Geneva), corporate and hourly hire, price questions.
2. **Harvest**: Google autocomplete for every seed (plus an a–z expansion of the four head terms), People Also Ask, related searches, the organic and paid results for about fifteen commercial queries per language, and the title, description, headings, schema and word count of the pages that rank.
3. **Scoring**: *volume proxy* (1–5) is how prominently a phrase appears in autocomplete and related searches; *difficulty* (1–5) is who holds page one (5 = airport authority, Blacklane, Sixt, GetYourGuide, Tripadvisor; 1 = small local sites or thin pages). **These are proxies, not search volumes.** Google Keyword Planner needs a signed-in Google Ads account, which we do not have; once Search Console has a month of data, the real queries and impressions replace this guess.
4. **Limits**: Google's results pages showed a CAPTCHA part-way through the competitor study; it was not bypassed. Ranks for that part are DuckDuckGo's, on-page facts are read directly from each page.

## What the SERPs look like

WHO RANKS: (1) Aggregators/marketplaces dominate the generic airport queries: Shuttle Direct (EN #2, DE #1, IT #2), Transfeero (FR #1, IT #1, plus paid ads), Blacklane (DE chauffeurservice #3), ProntoPro (DE chauffeurservice #1), Alps2Alps/Daytrip/Rome2rio (Davos). (2) The airport authority ranks #1 EN on a page about connecting flights (intent mismatch), so the EN head term is not locked. (3) Small Swiss operators do rank: Swiss2Alps, ZurichPickup, Zuerich Airport Taxi, airportzurichtransfers.ch, TransferB, Lucare, PMG, Swivon, Swiss Elite Transfers. A thin 129-word brand page (airporttaxi.ch) holds DE #4 and Blacklane holds DE chauffeurservice #3 with ~500 words and no FAQ, so page-1 slots are winnable with a better structured page.

TITLE FORMULAS OBSERVED (what each page optimises its title for): (a) '[Head keyword] [Place] | Brand' is the base: 'Zurich Airport Transfer & Private Taxi | ZurichPickup', 'Transferts Aéroport Zurich ZRH | Transfeero', 'Chauffeurservice in Zürich | Blacklane', 'Limousinen- und Chauffeurservice Zürich | PMG Limousine'. (b) Two head terms joined with '&' or 'und' to capture both: 'Airport & Taxi Transfer', 'Flughafen Zürich Taxi & Chauffeurservice', 'Limousinen- und Chauffeurservice', 'Taxis & transferts aéroportuaires', 'Train, taxi ou privé'. 'Taxi' is co-optimised in 6 of the 12 airport-query local titles. (c) Qualifier in title: 'mit Festpreis' (Lucare), 'Fixed Price' + '2 hours' (AlpinBus), 'Günstige' (airportzurichtransfers), 'con prezzo fisso' (TransferB separate URL), 'Privatfahrer & Tagesbuchung' (BlackLimousines). (d) PRICE IN TITLE/META is rare and effective on route queries: 'from CHF 515' (Swiss Elite Transfers), 'From €76 / £64 per person' (Alps2Alps H1+meta), 'ab CHF 60' (Citylane, SERP snippet), 'Ab 120 € pro Stunde' (BlackLimousines meta). Only 2 of 28 titles carry a price. (e) Meta-description trust stack repeated almost everywhere: fixed price / Festpreis / prix fixe / prezzo fisso, flight tracking (Flugverfolgung / suivi de vol / tracciamento volo), 24/7, meet & greet, free cancellation, child seats; rating in meta only on toptransfer ('★4.9 (214 reviews)'). (f) Over-long machine titles (Shuttle Direct DE ~118 chars, IT ~125 chars) and truncated ones (Noble IT: 'Servizio con autista e') are weak and still rank on authority.

H1 AND SECTIONS: H1 mirrors the query head term almost verbatim (e.g. 'Transfer Aeroporto di Zurigo (ZRH)', 'Flughafen Zürich Taxi', 'Zurich Airport to Davos Transfer'); Lucare's brand-promise H1 ('Ihr Chauffeur in Zürich. Immer derselbe.') works only because the title carries the keyword. Recurring H2 blocks on winners: how it works / book in 3 steps; fleet or vehicle classes; popular destinations/routes (internal link hub); 'what does it cost' or 'prices by vehicle class'; meet & greet + flight tracking + waiting time; child seats; reviews; FAQ. Davos route pages add distance and duration (150-154 km, ~2 h), pick-up both ways (Davos to Zurich), winter/summer, skis and luggage, WEF, and a 'private vs taxi vs shuttle vs train' comparison. Depth: winners 900 to 2,500 words (Transfeero 1.9-2.0k, Alps2Alps 2.5k, AlpinBus 1.9k, zrhairport.ch 1.7k, Swivon 1.6k, PMG 1.6k); smallest ranking local pages 740-930 words.

## Primary keyword for every URL

One primary keyword per URL; titles are at most 58 characters, descriptions 120–155.

| URL | Language | Primary keyword | Title |
|---|---|---|---|
| `/` | en | zurich airport limousine service | Zurich Airport Limousine Service & Chauffeur | Z-ALS |
| `/de` | de | limousinenservice flughafen zürich | Limousinenservice Flughafen Zürich & Transfer | Z-ALS |
| `/fr` | fr | transfert aéroport zurich | Transfert aéroport Zurich & chauffeur privé | Z-ALS |
| `/it` | it | transfer aeroporto zurigo | Transfer aeroporto Zurigo & autista privato | Z-ALS |
| `/en/services` | en | zurich chauffeur service | Zurich Chauffeur Service | Private & Corporate | Z-ALS |
| `/en/fleet` | en | luxury van chauffeur zurich | Luxury Van & Mercedes Chauffeur Zurich | Fleet | Z-ALS |
| `/en/about` | en | zurich-airport limousinen services gmbh | Zurich-Airport Limousinen Services GmbH | About Z-ALS |
| `/en/contact` | en | book airport transfer zurich | Book Airport Transfer Zurich | Contact Z-ALS Kloten |
| `/en/journal` | en | zurich airport transfer guide | Zurich Airport Transfer Guide | Journal | Z-ALS |
| `/en/journal/what-a-fixed-fare-has-to-cover` | en | fixed price airport taxi | Fixed Price Airport Taxi: What the Fare Covers | Z-ALS |
| `/en/journal/reading-a-chauffeur-invoice` | en | how much does it cost to hire a chauffeur | How Much Does It Cost to Hire a Chauffeur? | Z-ALS |
| `/de/services` | de | chauffeurservice zürich | Chauffeurservice Zürich | Privat & Business | Z-ALS |
| `/de/fleet` | de | v-klasse mit chauffeur | V-Klasse & Vans mit Chauffeur Zürich | Fuhrpark | Z-ALS |
| `/de/about` | de | zurich-airport limousinen services gmbh | Zurich-Airport Limousinen Services GmbH | Über Z-ALS |
| `/de/contact` | de | chauffeur kloten | Chauffeur Kloten buchen | Kontakt | Z-ALS |
| `/de/journal` | de | flughafentransfer zürich ratgeber | Flughafentransfer Zürich Ratgeber | Journal | Z-ALS |
| `/fr/services` | fr | chauffeur privé zurich | Chauffeur privé Zurich | Service de limousine | Z-ALS |
| `/fr/fleet` | fr | mercedes classe v avec chauffeur | Mercedes Classe V avec chauffeur | Flotte | Z-ALS |
| `/fr/about` | fr | chauffeur vip suisse | Chauffeur VIP Suisse | À propos de Z-ALS, Kloten |
| `/fr/contact` | fr | réserver chauffeur zurich kloten | Réserver chauffeur Zurich Kloten | Contact | Z-ALS |
| `/fr/journal` | fr | guide transfert aéroport zurich | Guide transfert aéroport Zurich | Journal | Z-ALS |
| `/it/services` | it | autista privato zurigo | Autista privato Zurigo | Servizio limousine | Z-ALS |
| `/it/fleet` | it | mercedes classe v con autista | Mercedes Classe V con autista | Flotta | Z-ALS |
| `/it/about` | it | noleggio con conducente svizzera | Noleggio con conducente Svizzera | Chi siamo | Z-ALS |
| `/it/contact` | it | prenota autista zurigo | Prenota autista Zurigo Kloten | Contatti | Z-ALS |
| `/it/journal` | it | guida transfer aeroporto zurigo | Guida transfer aeroporto Zurigo | Journal | Z-ALS |
| `/en/journal/business-travel-emissions-and-the-car-that-meets-you` | en | scope 3 category 6 ground transport | Scope 3 Category 6: Ground Transport Emissions | Z-ALS |
| `/en/journal/how-a-dispatch-desk-absorbs-a-delayed-flight` | en | flight delayed zurich airport transfer | Delayed Flight at Zurich Airport: What Happens | Z-ALS |
| `/en/journal/insurance-and-licensing` | en | chauffeur licence insurance switzerland | Chauffeur Insurance & Licensing: What to Ask | Z-ALS |
| `/en/journal/roadshow-logistics` | en | roadshow transport zurich | Roadshow Transport Zurich: 14 Cars on One Sheet | Z-ALS |
| `/en/journal/the-arrivals-gap` | en | zurich airport arrivals pick up time | Zurich Airport Arrivals: The New Walk to the Kerb | Z-ALS |
| `/en/journal/what-we-ask-of-a-chauffeur` | en | chauffeur requirements switzerland | Chauffeur Requirements: Licence, Checks, Training | Z-ALS |
| `/en/journal/who-is-actually-driving` | en | who is driving chauffeur switzerland | Who Is Driving Your Transfer? Swiss Rules | Z-ALS |
| `/en/journal/why-we-quote-by-hand` | en | fixed fare chauffeur quote | Fixed Fare Quotes by Hand, Not by Algorithm | Z-ALS |
| `/en/journal/winter-routes` | en | zurich to st moritz winter transfer | Zurich to St. Moritz in Winter: Julier Pass Routes | Z-ALS |
| `/en/transfers/zurich-airport-to-davos` | en | zurich to davos transfer | Zurich to Davos Transfer | Private Chauffeur | Z-ALS |
| `/en/transfers/zurich-airport-to-st-moritz` | en | zurich to st moritz transfer | Zurich to St. Moritz Transfer | Private Chauffeur | Z-ALS |
| `/en/transfers/zurich-airport-to-zermatt` | en | zurich to zermatt transfer | Zurich to Zermatt Transfer | Private Chauffeur | Z-ALS |
| `/en/transfers/zurich-airport-to-interlaken` | en | zurich to interlaken transfer | Zurich to Interlaken Transfer | Private Chauffeur | Z-ALS |
| `/en/transfers/zurich-airport-to-lucerne` | en | zurich to lucerne private transfer | Zurich to Lucerne Private Transfer | Chauffeur | Z-ALS |
| `/en/transfers/zurich-airport-to-bern` | en | zurich airport to bern transfer | Zurich Airport to Bern Transfer | Chauffeur | Z-ALS |
| `/en/transfers/zurich-airport-to-basel` | en | zurich airport to basel private transfer | Zurich Airport to Basel Private Transfer | Z-ALS |
| `/en/transfers/geneva-airport-to-zurich` | en | geneva airport to zurich transfer | Geneva Airport to Zurich Transfer | Chauffeur | Z-ALS |
| `/en/transfers/zurich-airport-to-st-anton` | en | zurich airport to st anton transfer | Zurich Airport to St. Anton Transfer | Chauffeur | Z-ALS |
| `/en/transfers/zurich-airport-to-lugano` | en | zurich airport to lugano transfer | Zurich Airport to Lugano Transfer | Chauffeur | Z-ALS |
| `/de/transfers/zurich-airport-to-davos` | de | transfer zürich davos | Transfer Zürich Davos | Privat mit Chauffeur | Z-ALS |
| `/de/transfers/zurich-airport-to-st-moritz` | de | transfer zürich st. moritz | Transfer Zürich St. Moritz | Privat mit Chauffeur | Z-ALS |
| `/de/transfers/zurich-airport-to-zermatt` | de | transfer zürich zermatt | Transfer Zürich Zermatt | Privat mit Chauffeur | Z-ALS |
| `/de/transfers/zurich-airport-to-interlaken` | de | transfer zürich interlaken | Transfer Zürich Interlaken | Privat mit Chauffeur | Z-ALS |
| `/de/transfers/zurich-airport-to-lucerne` | de | transfer zürich luzern privat | Transfer Zürich Luzern privat | Chauffeur | Z-ALS |
| `/de/transfers/zurich-airport-to-bern` | de | transfer zürich flughafen bern | Transfer Zürich Flughafen Bern | Chauffeur | Z-ALS |
| `/de/transfers/zurich-airport-to-basel` | de | flughafentransfer basel zürich | Flughafentransfer Basel Zürich | Chauffeur | Z-ALS |
| `/de/transfers/geneva-airport-to-zurich` | de | flughafentransfer genf | Flughafentransfer Genf Zürich | Chauffeur | Z-ALS |
| `/de/transfers/zurich-airport-to-st-anton` | de | transfer zürich flughafen vorarlberg | Transfer Zürich Flughafen Vorarlberg & Arlberg | Z-ALS |
| `/de/transfers/zurich-airport-to-lugano` | de | transfer zürich lugano | Transfer Zürich Lugano | Privat mit Chauffeur | Z-ALS |
| `/fr/transfers/zurich-airport-to-davos` | fr | transfert zurich davos | Transfert Zurich Davos | Chauffeur privé | Z-ALS |
| `/fr/transfers/zurich-airport-to-st-moritz` | fr | transfert zurich saint-moritz | Transfert Zurich Saint-Moritz | Chauffeur privé | Z-ALS |
| `/fr/transfers/zurich-airport-to-zermatt` | fr | transfert zurich zermatt | Transfert Zurich Zermatt | Chauffeur privé | Z-ALS |
| `/fr/transfers/geneva-airport-to-zurich` | fr | transfert genève zurich | Transfert Genève Zurich | Chauffeur privé | Z-ALS |
| `/fr/transfers/zurich-airport-to-basel` | fr | transfert aéroport zurich bâle | Transfert aéroport Zurich Bâle | Chauffeur privé | Z-ALS |
| `/it/transfers/zurich-airport-to-davos` | it | transfer zurigo davos | Transfer Zurigo Davos | Autista privato | Z-ALS |
| `/it/transfers/zurich-airport-to-st-moritz` | it | transfer zurigo st moritz | Transfer Zurigo St. Moritz | Autista privato | Z-ALS |
| `/it/transfers/zurich-airport-to-zermatt` | it | transfer zurigo zermatt | Transfer Zurigo Zermatt | Autista privato | Z-ALS |
| `/it/transfers/zurich-airport-to-lugano` | it | transfer lugano aeroporto zurigo | Transfer Lugano Aeroporto Zurigo | Autista privato | Z-ALS |
| `/it/transfers/zurich-airport-to-basel` | it | transfer aeroporto basilea | Transfer aeroporto Basilea | Autista privato | Z-ALS |

## English: best opportunities

| Keyword | Intent | Volume proxy | Difficulty | Page |
|---|---|---|---|---|
| chauffeur zurich | commercial | 5 | 3 | home |
| zurich chauffeur service | commercial | 5 | 3 | services |
| limousine service zurich | commercial | 5 | 3 | home |
| zurich to davos transfer | commercial | 5 | 3 | route |
| executive chauffeur zurich | commercial | 4 | 2 | services |
| limo service zurich | transactional | 4 | 2 | home |
| basel airport transfer | commercial | 5 | 4 | route |
| geneva airport transfer | commercial | 5 | 4 | route |
| zurich airport transfer | commercial | 5 | 5 | home |
| zurich airport limousine service | commercial | 4 | 3 | home |
| chauffeur zurich airport | commercial | 4 | 3 | home |
| private chauffeur zurich | commercial | 4 | 3 | services |
| corporate chauffeur zurich | commercial | 4 | 3 | services |
| limousine service zurich airport | commercial | 4 | 3 | home |
| switzerland chauffeur service | commercial | 4 | 3 | home |
| zurich airport to davos transfer | commercial | 4 | 3 | route |
| zurich to interlaken transfer | commercial | 4 | 3 | route |
| zurich airport transfer price | commercial | 4 | 4 | services |

**Who holds page one** (from 25 result pages read):

- *zurich airport transfer*: Mixed: airport authority #1, 4 sponsored ads (flyyt.ch, alpha-service.ch, zurichpickup.ch, destinata.ch), local pack (FLYYT, Zurich Airport Transfer, Zurich Pickup, Airport Zürich Taxi), aggregators (GetYourGuide, Tripadvisor, Sixt ride) plus small operators. 4 PAA. Title style: 'Zurich Airport Transfer | Fixed Price - No Surprises', 'Fixed Price Zurich Airport Transfers'.
- *chauffeur zurich*: Job boards (Indeed, jobs.ch, JobScout24, chauffeur-jobs.ch, LinkedIn) share page 1 with small local chauffeur firms; local pack of 3 limousine services; no ads or PAA seen. Related searches are job terms (Chauffeur Kat B, jobs).
- *limousine service zurich*: Small Swiss operators and directories; Sixt ride is the only big brand; canton licensing page (zh.ch) also ranks. No ads, local pack or PAA seen.
- *private driver zurich airport*: Small local operators and local pack (AJL, Zurich Pickup, Noble Transfer); Swiss Top Transfer #1; no aggregators in the top results; no ads. 4 PAA.
- *zurich airport taxi price*: Airport authority #1, official taxi partner, taxi-fare calculators, aggregators (Welcome Pickups, City Airport Taxis), Quora/Facebook; local pack of taxi firms. 4 PAA.
- *zurich to davos transfer*: Transfer aggregators/marketplaces (Alps2Alps, Transfeero, AlpinBus, AlpTransfer), Rome2Rio, Tripadvisor, Facebook; two small Swiss operators. No ads or local pack. 3 PAA.
- *zurich to st moritz transfer*: Blacklane #1 plus Grandlane, Trainline, GetYourGuide, Rome2Rio, Alps2Alps, City Airport Taxis. Giant brands present. 4 PAA.
- *zurich to zermatt transfer*: Aggregators and rail (Alps2Alps, AlpinBus, GetByTransfer, Trainline, Tripadvisor, City Airport Taxis), destination site zermatt.swiss, Facebook groups. No local operators on page 1. 4 PAA.

**People also ask** (56 questions seen; they feed the FAQ):

- What is cheaper in Zurich, taxi or Uber?
- Is 55 minutes enough to transfer at Zurich Airport?
- Do I have to go through security again for connecting flight Zurich?
- How much is a taxi from Zurich Airport to city Centre?
- Where can I find a personal driver in Zurich?
- What is the VIP service at Zurich Airport?
- Can Uber pick up at Zurich Airport?
- How much is a taxi from Zurich to the airport?
- Is it cheaper to book a taxi in advance or at the airport?
- How much is it from Zurich Airport to city Centre?
- Is there a train from Zurich to Davos?
- How do people get to Davos?

## German: best opportunities

| Keyword | Intent | Volume proxy | Difficulty | Page |
|---|---|---|---|---|
| limousinenservice zürich | commercial | 5 | 3 | services |
| limousinenservice zürich flughafen | transactional | 5 | 3 | services |
| flughafentransfer zürich | transactional | 5 | 5 | services |
| taxi flughafen zürich | transactional | 5 | 5 | services |
| taxi flughafen zürich pauschal | commercial | 4 | 3 | services |
| chauffeurservice zürich | commercial | 4 | 3 | home |
| chauffeur service zürich | commercial | 4 | 3 | home |
| limousinenservice luzern | commercial | 4 | 3 | route |
| limousinenservice basel | commercial | 4 | 3 | route |
| flughafentransfer zürich günstig | commercial | 4 | 4 | services |
| flughafentransfer vorarlberg zürich kosten | commercial | 3 | 2 | route |
| taxi flughafen zürich preis | commercial | 4 | 4 | journal-article |
| taxi flughafen zürich günstig | commercial | 4 | 4 | services |
| taxi flughafen zürich kindersitz | informational | 3 | 2 | journal-article |
| flughafentaxi zürich | transactional | 4 | 4 | services |
| transfer zürich flughafen | transactional | 4 | 4 | services |
| transfer zürich flughafen vorarlberg | transactional | 3 | 2 | route |
| privatchauffeur kosten | informational | 3 | 2 | journal-article |

**Who holds page one** (from 21 result pages read):

- *flughafentransfer zürich*: Sixt ride #1 plus sponsored local pack (Zuerich Airport Taxi & Transfer, Zurich Airport Transfer, Zurich Pickup, Airport Zürich Taxi); then aggregators World Transfer, Blacklane, Hoppa, GetYourGuide, Grandlane; official-partner Airport Taxi Zürich. Related: Günstiger Transfer zum Flughafen Zürich, Flughafentaxi Zürich, Taxi Flughafen Zürich pauschal, Black Transfer, P65 Shuttle Bus.
- *chauffeurservice zürich*: Specialist Swiss limousine firms (Fischer Limousine #1, INTERLINE, swissfirstlimousine.ch, rentava.ch) with an AI overview and a Destinata knowledge panel; Sixt ride and Grandlane are the only big names. No ads seen. Related: Limousinenservice Schweiz/Zürich Flughafen, Limousinen Chauffeur Jobs, Fischer Limousine.
- *limousinenservice zürich*: Small and mid-size local operators plus local pack (The Swiss Limousine Kloten, Premium Limousines Rümlang, Zürich-Airport Limousinen Services) and directories (search.ch, Trustpilot, zh.ch, stretch.ch). No giants on page 1.
- *limousinenservice zürich flughafen*: Airport authority page #1 (CHF 65 taxi to city), then local limousine firms and the airport's GLM listing; PAA block. No aggregators.
- *privatchauffeur flughafen zürich*: Job boards (Indeed, Jooble, jobs.ch, WIZBII) fill the top and all related searches; commercial results are Grandlane, Blacklane, Chabé, Limousine Transfer Hire, Swiss Airport Driver, zurichairporttransfer.ch plus a local pack.
- *taxi flughafen zürich preis*: Airport authority #1 with PAA, then official-partner Airport Taxi Zürich and price-calculator/tariff pages; no aggregators.
- *transfer zürich davos*: Transfer aggregators and Swiss small operators mixed with tourism board; no local pack, no ads.
- *transfer zürich st. moritz*: Mix of Viator, Rome2Rio, GetTransfer, Alps2Alps and small Swiss firms (Bilgimann, airporttaxizrh.com, jetset-revolution, SWIVON); helicopter operator also ranks. PAA about getting to St. Moritz.

**People also ask** (36 questions seen; they feed the FAQ):

- Wie finde ich einen günstigen Flughafentransfer in Zürich?
- Wie viel kostet ein Taxi nach Zürich Flughafen?
- Wie viel kostet ein Flughafentaxi?
- Gibt es einen Shuttle-Service vom Flughafen Zürich?
- Wie viel kostet ein Taxi für 20 km in der Schweiz?
- Kann ich mit Uber zum Flughafen Zürich fahren?
- Wie viel kostet Uber in Zürich?
- Wie ist die beste Anreise nach St. Moritz?
- Wie komme ich am einfachsten nach St. Moritz?
- Wie viel kostet ein Taxi vom Flughafen Basel?
- Gibt es einen Shuttle-Service vom Flughafen Basel?
- Wie viel kostet ein Taxi von Basel nach Zürich?

## French: best opportunities

| Keyword | Intent | Volume proxy | Difficulty | Page |
|---|---|---|---|---|
| transfert aéroport bâle mulhouse | commercial | 5 | 3 | route |
| chauffeur privé suisse salaire | informational | 5 | 3 | journal-article |
| chauffeur privé suisse emploi | informational | 5 | 3 | journal-article |
| navette aéroport bâle mulhouse | informational | 5 | 4 | route |
| prix taxi aéroport zurich | commercial | 4 | 3 | journal-article |
| transfert aéroport genève | commercial | 4 | 3 | route |
| taxi aéroport genève | transactional | 4 | 3 | route |
| taxi aéroport genève prix | commercial | 4 | 3 | route |
| transfert genève chamonix | transactional | 4 | 3 | route |
| chauffeur privé genève | transactional | 4 | 3 | services |
| taxi aéroport bâle mulhouse | transactional | 4 | 3 | route |
| chauffeur privé suisse | commercial | 4 | 3 | home |
| limousine zurich | commercial | 4 | 3 | services |
| taxi aéroport zurich | transactional | 4 | 4 | services |
| airport transfers zurich | commercial | 4 | 4 | services |
| transfer zurich st moritz | transactional | 4 | 4 | route |
| transfer zurich zermatt | transactional | 4 | 4 | route |
| navette aéroport genève | informational | 4 | 4 | route |

**Who holds page one** (from 16 result pages read):

- *transfert aéroport zurich*: Mix of airport/tourism authority (zuerich.com, flughafen-zuerich.ch x2), Zurich taxi operators (airporttaxi-zuerich.ch), aggregators (Grandlane, Uber, Tripadvisor, Noble Transfer) and small FR/CH transfer sites (Transfer Baltici, SWIVON). Local pack with 3 limo/chauffeur listings at Kloten (ratings 5.0). No ad text seen in page text. Related searches are airport-info (plan terminaux, arrivée, parking, gare, train, taxi Zurich). Titles optimise for 'Transfert aéroport (de) Zurich (ZRH)', 'à prix fixe', 'Service de Navette'.
- *chauffeur privé zurich*: Blacklane first, SIXT ride second (aggregator/brand giants), then Chabé, Haimour International and small Zurich chauffeur firms. No local pack, no airport authority. Titles use 'Chauffeur privé (à) Zurich', 'Service de chauffeur (privé) (à) Zurich', 'Chauffeur privé VTC'. swiss-limo.ch shows a price table (CHF 140-180 short trip, CHF 3.5-4.5/km long distance, hourly CHF 100-140). PAA is salary/hiring oriented.
- *service de limousine zurich*: SIXT ride first, then Grandlane, directories (search.ch, local.ch, zh.ch regulatory page for limousine licences) and small sites (Masarwy, LimoLines, destinata.ch, limousineservicezurich.com). Several titles are English even on the FR SERP. Competitors claim 'fixed prices', 'licensed chauffeurs', 'Mercedes E/S/V fleet' (same as our fleet). No PAA, no local pack.
- *chauffeur privé suisse*: Job intent dominates (Indeed, Jooble, Manpower, My Swiss, Jobup, Google Jobs widget; salary/emploi related searches). Commercial results are few: chauffeur-drive.ch, Chabé (/suisse), GenevaChauffeur, Viator list and a 3-listing local pack (SwissChauffeur Zürich, Falcon VIP Kloten, Wetransferswiss Oberglatt). PAA: salary, how to become, how to hire.
- *taxi aéroport zurich prix*: Official/airport and local taxi sites with price info: visitonszurich.com (CHF 6.75 minimum, CHF 3.80/km), airporttaxi-zuerich.ch, flughafen-zuerich.ch (about CHF 65 to city), airporttaxi24.ch (fixed price pages per town, from CHF 145), Transfer Baltici, Holiday Taxis (from EUR 28), cab.taxi, zuerichairporttaxi.ch. Local pack with 3 taxi listings (Rümlang/Kloten). PAA about taxi price calculation and Uber vs taxi. Titles use 'prix fixe' heavily.
- *transfert zurich davos*: Aggregators and transfer marketplaces: Grandlane (853.7 EUR), Transfeero, MyTransfers, Swiss Activities (CHF 425-945), Alps2Alps (from EUR 76 shared), Rome2Rio, plus swiss-limo.ch (from CHF 525, 150 km) and SWIVON. Helicopter result (aeroaffaires). No local pack. Observed competitor private-transfer prices (CHF 425-854) are well below CHF 960.
- *transfert zurich zermatt*: Aggregators and travel sites: Alpine Fleet, Alps2Alps (from EUR 92), SWIVON, Rome2Rio, Booking.com attractions, Rail Europe, MySwissAlps; also destination/tourism bodies (zermatt.swiss, myswitzerland.com). Related searches include 'Zermatt to zurich private transfer', 'Zurich to Zermatt by car', 'Geneva to Zermatt'. Trains dominate informational variants.
- *transfert zurich saint-moritz*: Train sites first (Trainline x2, Rail Europe, Omio, Rome2Rio) because 'transfert' is read as transport; private transfer results: Grandlane (from CHF 814), swiss-limo.ch (200 km, from CHF 750), GetTransfer. Related searches: Paris-Zurich train, Bernina Express. No local pack.

**People also ask** (29 questions seen; they feed the FAQ):

- Quels sont les horaires du train de Zurich à l'aéroport ?
- L'aéroport de Zurich est-il grand ?
- Combien de terminaux y a-t-il à l'aéroport de Zurich ?
- Quel terminal Swiss à Zurich ?
- Quel est le salaire d'un chauffeur privé en Suisse ?
- Quel est le salaire d'un chauffeur privé ?
- Comment engager un chauffeur privé ?
- Quel est le tarif d'un chauffeur privé sans voiture ?
- Comment devenir chauffeur privé en Suisse ?
- Quel est le salaire d'un chauffeur privé pour particulier ?
- Qui est moins cher, Uber ou taxi ?
- Comment se calcule le prix d'une course en taxi ?

## Italian: best opportunities

| Keyword | Intent | Volume proxy | Difficulty | Page |
|---|---|---|---|---|
| autista privato ticino | commercial | 4 | 2 | services |
| transfer basilea colmar | transactional | 4 | 2 | route |
| noleggio auto con autista per matrimonio | transactional | 4 | 3 | services |
| ncc svizzera | informational | 4 | 3 | services |
| transfer lugano malpensa | transactional | 4 | 3 | route |
| noleggio auto con autista prezzi | commercial | 4 | 4 | services |
| auto matrimonio con autista | transactional | 3 | 2 | services |
| noleggio auto matrimonio ticino | transactional | 3 | 2 | services |
| noleggio con conducente ticino | commercial | 3 | 2 | services |
| ncc lugano | commercial | 3 | 2 | services |
| autista privato svizzera stipendio | informational | 3 | 2 | journal-article |
| autista privato per ricchi svizzera | informational | 3 | 2 | journal-article |
| autista privato lugano | commercial | 3 | 2 | services |
| autista privato lugano svizzera | commercial | 3 | 2 | services |
| autista privato occasionale | commercial | 3 | 2 | services |
| transfer st moritz | transactional | 4 | 4 | route |
| transfer zermatt | transactional | 4 | 4 | route |
| transfer basilea europa park | transactional | 3 | 2 | route |

**Who holds page one** (from 20 result pages read):

- *transfer aeroporto zurigo*: Aggregators (Transfeero, Hoppa, Tripadvisor, Airports Taxi Transfers) plus the airport authority (2 results) and a 3-pack local map. 4 PAA, Related searches are airport-info (mappa, partenze, WiFi). No ad blocks seen in extracted text. Title phrasing: 'Transfer Aeroporto di Zurigo (ZRH)', 'Trasferimento aeroporto Zurigo - Servizio shuttle', 'Servizio di trasferimento privato dall'aeroporto di Zurigo'.
- *autista privato zurigo*: Swiss chauffeur companies in Italian (Rentava, Grandlane, swiss-limo.ch, SWIVON, Masarwy, Chauffeurs & Services), aggregator Transfeero, a 3-pack local map (Noble Transfer, Chabe, Travel Karoshi), and 3 job-board results (Randstad, ONLOGIST, Jooble). No PAA.
- *servizio limousine zurigo*: Local/Swiss limo sites and tour marketplaces (Rentava, SWIVON, Masarwy, airporttaxi24.ch, Noble Transfer, Limousine Center, Grandlane, Tripadvisor x2). No PAA, no local pack, no ads seen. Phrase 'Servizio limousine Zurigo' is the exact title wording for SWIVON, Masarwy, Noble.
- *autista privato svizzera*: Job intent: Jooble, Google AI Overview (salary), Manpower, ONLOGIST, Bellini Personal, Post. Customer pages in minority (VCS Luxury Rental Lugano, Chabe, Limousinehire.ch). 4 PAA all about pay and how to hire. Related searches are job/Ticino terms.
- *taxi aeroporto zurigo prezzo*: Mixed: informational price pages (scoprizurigo.com featured snippet, Welcomepickups), airport authority, official Airport Taxi Zürich, airporttaxi24.ch programmatic per-town price pages, AtoB, Uber, CAB.TAXI, zuerichairporttaxi.ch. Local pack of 3 taxi firms. 4 PAA (Uber vs taxi, Uber a Zurigo, centro, tariffe Svizzera). Related: Taxi Zurigo aeroporto, Zurich taxi 24, Glm limousine zurich.
- *transfer zurigo davos*: Aggregators and ski-transfer specialists (Alps2Alps, Ski-Lifts, Transfeero, GetTransfer, Tripadvisor, Rome2Rio) plus SWIVON and Transfer Baltici in Italian. Mostly English titles on the IT SERP; Related searches in English. No PAA, no local pack. zurichairporttransfers-ch.com quotes CHF 540 per vehicle.
- *transfer zurigo st moritz*: Giants: Blacklane #1, Viator, GetYourGuide, Tripadvisor, Alps2Alps, GetTransfer, Grandlane, BlackLimo. SWIVON the only Italian-titled Swiss page. No PAA. Related searches in English (train, bus, Glacier Express, helicopter).
- *transfer zurigo zermatt*: Aggregators plus tourism/transfer specialists (Alps2Alps, Swiss Activities, Swiss Top Transfer, AlpinBus, GetByTransfer, Tripadvisor, zermatt.swiss official). Italian-language local sites absent. No PAA. Prices seen: CHF 760-1185 (Swiss Activities), CHF 860 (Swiss Top Transfer), EUR 747-1467 (GetByTransfer).

**People also ask** (38 questions seen; they feed the FAQ):

- Come spostarsi dall'aeroporto di Zurigo al centro?
- Cosa significa "transfer aeroporto"?
- Quanto dista l'aeroporto di Zurigo al centro?
- Quanti terminal ha l'aeroporto di Zurigo?
- Qual è più economico, Uber o taxi?
- C'è Uber a Zurigo?
- Quali sono le tariffe per un taxi in Svizzera?
- Quanto viene pagato un autista privato?
- Come avere un autista privato?
- Come si chiamano gli autisti privati?
- Cosa fa un autista privato?
- Quanto si paga un autista privato?

## Client keywords (agency list, Sep 2025)

The 63 phrases from the agency's spreadsheet (43 tracked keywords, May–Sep 2025, plus 20 social-media keywords), the page that owns each one now, and where on that page it sits. Source: [client-keywords.json](client-keywords.json). *Rank* is Google's position at the end of September 2025 on the old German WordPress site (NS = not shown).

| Keyword | Language | Sep 2025 rank | Owner URL | Placement |
|---|---|---|---|---|
| zürich airport limousinen services gmbh | de | 1 | `/` | body (trust strip, closing line, footer, About page) + JSON-LD (legalName, alternateName); the About titles carry the legal name |
| Hire Personal Chauffeur In Zurich | en | 2 | `/en/services` | H2 (rename 'Private chauffeur' to 'Hire a personal chauffeur in Zurich') + description |
| Limousinen Flughafen | de | 1 | `/de` | title + H1 (as 'Limousinenservice Flughafen Zürich') |
| Professional Chauffeur Service Near Me | en | 1 | `/en/services` | description ('Professional chauffeur service in Zurich'); 'near me' is not written into the copy |
| limousinenservice flughafen zürich | de | 1 | `/de` | title (exact) + H1 + description |
| limousinenservice zürich flughafen | de | 1 | `/de` | title + H1 + description (same phrase, other word order) |
| Chauffeur Service Zurich Airport | en | 4 | `/` | title (words) + H1 + description (phrase 'chauffeur service') |
| Zurich Airport Limousine Service | en | 6 | `/` | title (exact, leading) + H1 + description |
| Limo Service Flughafen Zürich | de | 1 | `/de` | title through 'Limousinenservice Flughafen Zürich'; 'Limo' optional once in the body |
| Limousinenservice Taxi Airport Zurich | de | 4 | `/de` | title + body ('Limousinenservice'); 'taxi' stays out of titles, headings and descriptions |
| Zurich Chauffeur Service | en | 6 | `/en/services` | title (keep) + H1 + body intro |
| Limousine Service Zurich Flughafen | de | 5 | `/de` | title + description |
| Zurich Airport Chauffeur Service | en | 6 | `/` | H1 + description + title (words) |
| Limo Service Zurich Airport | en | 5 | `/` | body ('airport limo' once, e.g. in an FAQ answer); title through 'Limousine Service' |
| airport transfers & limousinen service gmbh | de | 5 | `/` | none; add to JSON-LD alternateName only if the client confirms it is a real trading name |
| Airport Chauffeur Service In Zurich | en | 7 | `/` | H1 + description |
| limo servis airport zurich | en | 11 | `/` | none (misspelling; covered by the limousine/limo wording) |
| Limo Service Zürich | en | 21 | `/` | body (synonym); title through Limousine Service |
| Chauffeur Service Zürich | de | 10 | `/de/services` | H1 + body intro (EN searchers are served by /en/services) |
| Limousine Service Zurich Airport | en | 7 | `/` | title (same words, other order) + description |
| Rent Luxury Vans In Zurich | en | 8 | `/en/fleet` | title ('Luxury Van & Mercedes Chauffeur Zurich') + description; 'rent' is not used, every vehicle comes with a chauffeur |
| Chauffeurservice Zürich | de | 16 | `/de/services` | H1 + body intro |
| Luxury Limousine Service In Zurich | en | NS | `/` | body (home fleet section: 'Luxury Mercedes limousines ...'); not in the meta text |
| Airport Limousine Service In Zurich | en | 11 | `/` | title (words) + H1 |
| limousinen service zürich | de | 13 | `/de` | title + H1 (as 'Limousinenservice') |
| limousinservice zurich | de | 11 | `/de` | none (misspelling; covered by Limousinenservice) |
| Limousine Service Zurich | en | 10 | `/` | title (words) + description |
| zurich airport limousine | en | 13 | `/` | title (exact, as the start of 'Zurich Airport Limousine Service') |
| Airport Limo Transfers In Zurich | en | 12 | `/` | body |
| Zurich Limousine Service | en | 18 | `/` | title (words) |
| Zurich Airport Limo | en | 16 | `/` | body ('Zurich Airport limo' once) |
| Zurich Limo Service | en | 16 | `/` | body |
| Zürich Limousinenservice | de | 21 | `/de` | title |
| Limousinenservice Zurich | de | 16 | `/de` | title |
| Limousinen Zürich | de | 30 | `/de` | title + H1 |
| Chauffeur Hire Zurich Airport | en | 26 | `/` | body / FAQ ('hire') |
| Limousine Service In Zurich | en | 28 | `/` | title (words) |
| Hire A Chauffeur Service In Switzerland | en | 67 | `/en/about` | body (About page); the meta text says 'Swiss chauffeur service' |
| Chauffeured Service In Zurich | en | 65 | `/en/services` | body |
| Airport Chauffeur Zurich | en | 64 | `/` | H1 + description |
| Chauffeur Service In Zurich | en | 87 | `/en/services` | H1 + body intro |
| Limousine Zürich | de | 5 | `/de` | title + H1 |
| Chauffeur Zurich | en | 48 | `/en/services` | title (words, through 'Zurich Chauffeur Service') |
| Zurich airport limousine service | en | n/a | `/` | title (exact) + H1 + description |
| Zurich chauffeur service | en | n/a | `/en/services` | title (keep) + H1 + body |
| luxury airport transfers Zurich | en | n/a | `/` | body (home fleet section and FAQ) |
| Zürich Limousinenservice Flughafen | de | n/a | `/de` | title |
| Mercedes chauffeur Zürich | en | n/a | `/en/fleet` | title ('Mercedes Chauffeur Zurich' exact in the proposal) |
| Zurich airport private transfer | en | n/a | `/en/transfers` | route pages ('private transfer' in the EN route copy); the hub keeps 'fixed-price airport transfers' |
| premium Zurich chauffeur service | en | n/a | `/en/services` | body ('Premium' is already the S-Class class name) |
| Zurich airport van rental (group travel focus) | en | n/a | `/en/fleet` | none as written; reframe as 'van with chauffeur' / 'group transfers' |
| Zurich airport group transfers | en | n/a | `/en/fleet` | description + H2 ('Sprinter and bus' to 'Group transfers: Sprinter and bus') |
| chauffeured courier service Zurich | en | n/a | not targeted | none (DO NOT TARGET) |
| cross-border chauffeur Europe | en | n/a | `/` | body (home routes section: 'every other Swiss or cross-border destination', Central Europe) |
| Zürich Flughafen Limousinenservice | de | n/a | `/de` | title |
| book Zurich chauffeur by app | en | n/a | not targeted | none; use 'book online' (/quote) or 'book via WhatsApp' |
| 24/7 airport limo Zurich | en | n/a | `/` | description (24/7) + body ('limo') |
| professional chauffeur Zurich | en | n/a | `/en/services` | description ('Professional chauffeur service in Zurich') |
| luxury van transfers Zurich airport | en | n/a | `/en/fleet` | description ('luxury vans, Sprinters and coaches for group transfers from Zurich Airport') |
| Z-ALS limousine Zurich | en | n/a | `/` | title (proposed home title has Zurich + Limousine + '/ Z-ALS') |
| Zürich Flughafentransfer Limousine | de | n/a | `/de` | description ('Flughafentransfer ... Mercedes-Limousinen') |
| airport transfer Mercedes limousine Zurich | en | n/a | `/` | description + body |
| Zurich chauffeur service book online | en | n/a | `/en/services` | description + body ('Zurich chauffeur service'); booking online is the quote form (button 'Request a quote') |

## Where a small local operator can beat the aggregators

"Opportunities competitors miss: (1) Taxi vs Uber vs fixed-fare chauffeur: 'What is cheaper in Zurich, taxi or Uber?' appears as PAA on 12+ SERPs and 'Can Uber pick up at Zurich Airport?' in EN, DE, FR and IT, yet no private operator answers it; write one honest comparison article per language and link it from the home and journal. (2) Distance and travel-time pages ('how far is Davos from Zurich', 'da zurigo a lugano') have demand but only rail and tourism sites answer; fold a short facts block into each route page and consider one article. (3) Seasonal WEF Davos (January) and ski transfers: a section on the Davos page covering ski equipment and winter road conditions; the existing 'winter-routes' article can link into it. (4) Kloten local intent: 'chauffeur kloten', 'limousine service kloten' and 'airport taxi zurich kloten' show geo demand with only a few small operators; add address, opening hours and LocalBusiness schema, and claim a Google Business Profile for Kloten. (5) Zermatt honesty: most competitors skip that cars stop at Täsch; saying so is a trust signal. (6) Price positioning: Z-ALS published fares (Davos 960, St. Moritz 1290, Zermatt 1500, Interlaken 990, Basel 540, Luzern 408) are roughly 1.7 to 2.4 times competitor 'from' prices, so compete on a single-vehicle fare, no meter, 24/7 dispatch and Swiss licensing rather than on price in titles. (7) Austrian cross-border (St. Anton, Lech, Vorarlberg) is searched in DE and EN with weak competition; quote by hand and say so. (8) FAQ schema with the eight questions per language on the home and contact pages. Limits and honesty notes: volumeProxy is autocomplete rank only, not search volume; entries marked derived (journal indexes, About, Contact FR/IT, Lugano EN/DE, Geneva FR/DE) were built from the nearest observed phrasing and need validation in Search Console. Job-intent noise (chauffeur jobs, salaries) dominates 'chauffeur', 'privatchauffeur', 'chauffeur privé suisse' and 'autista privato svizzera', so those heads are avoided. Wedding-car and stretch-limo terms (hochzeitsauto, voiture de mariage, limousine mieten) were excluded because the fleet is E-, S-, V-Class, SUV and bus. Geneva and EuroAirport local-airport queries are dominated by French-side operators and public transport and are not targeted. Flight tracking and meet-and-greet are not claimed anywhere; the FAQ question on flight delays should be answered only with what dispatch actually does. Existing pages under /en/journal/* beyond the two mapped are left unchanged. Route pages for FR/IT where evidence was thin (Interlaken, Lucerne, Bern, St. Anton) are omitted and can be added later at the same slug."

## Pages kept apart on purpose (cannibalisation)

- Ownership since 2026-10-07: the English home owns every limousine / limo / airport-chauffeur phrase (`zurich airport limousine service`); `/de` owns every Limousinenservice / Limousine phrase; `/en/services` and `/de/services` own chauffeur service / Chauffeurservice (city, hourly, private chauffeur); the fleet pages own vans, groups and Mercedes; About owns the legal name; the route pages and the `/transfers` hubs keep the transfer terms. The home titles no longer name "airport transfer": it stays in the descriptions, the FAQ heading, the body and the hubs.
- Home /  (zurich airport transfer) vs /en/services (zurich chauffeur service): airport head term goes to the home page, the chauffeur/limousine/corporate/hourly cluster goes to services; the home keeps 'limousine service' only in its title and secondary keywords to protect the existing #2 ranking for 'zurich airport limousine service'.
- Home (zurich airport transfer) vs /en/contact (book airport transfer zurich) vs /en/journal (zurich airport transfer guide): the three are separated by intent (commercial head term, transactional booking and Kloten, informational guides). Same pattern in DE, FR and IT with 'Ratgeber/Guide/Guida' and 'buchen/réserver/prenota'.
- Services (zurich chauffeur service) vs About (switzerland chauffeur service): city-level service term versus national brand term; About stays a company page and must not repeat the services copy.
- Home airport transfer vs route pages (zurich to davos transfer etc.): the home never lists per-route price keywords; route pages never use 'zurich airport transfer' as a title head. Basel (zurich airport to basel private transfer) also carries 'basel airport transfer' only as a secondary on the route page, never on the home.
- Journal article 'what-a-fixed-fare-has-to-cover' (fixed price airport taxi) vs the home's 'airport transfer switzerland fixed price': the informational taxi-comparison phrasing is kept on the article, the commercial phrasing on the home.
- Fleet (mercedes v class chauffeur zurich) vs Services (private chauffeur zurich): fleet gets vehicle-model terms only; 'hire' phrasing for self-drive V-Class (v-klasse mieten) is intentionally not targeted.
- Davos (zurich to davos transfer) vs a future 'WEF Davos' article: the seasonal WEF phrasing stays a secondary keyword on the route page until a dedicated article exists.
- FR/IT homes vs EN: FR and IT users often type English route queries; those English phrasings are secondary keywords on FR/IT route pages only if the page copy is in FR/IT, and are never assigned to a separate URL.
- Zermatt/Interlaken/Lucerne route pages vs 'train' informational queries: train and timetable queries (Trainline, SBB) are deliberately excluded to avoid ranking for the wrong intent.
- 'chauffeur zurich' and 'privatchauffeur' head terms are job-board polluted, so they are served by services pages through 'zurich chauffeur service' and 'chauffeurservice zürich' rather than their own pages.

## Title formulas used

"Board homes: '{head airport-transfer keyword} [& secondary term | fixed-fare hook] | Z-ALS' (EN keeps '& Limousine Service' to retain the existing #2 ranking; DE/FR carry 'Festpreis ab / Prix fixe dès CHF 120'; IT drops the number to stay under 58 characters). Services and Fleet: '{keyword} | {audience or Fleet} | Z-ALS'. Contact: '{booking keyword with Kloten} | Contact | Z-ALS'. About and Journal: '{national or guide keyword} | About Z-ALS or Journal | Z-ALS'. Routes: '{Zurich to X Transfer} | Private Chauffeur | Z-ALS' (DE 'Privat mit Chauffeur', FR/IT 'Chauffeur privé' or 'Autista privato'), dropping 'Private Chauffeur' for 'Chauffeur' when the keyword is long. Titles are 58 characters or fewer; descriptions are 125 to 155 characters, lead with the service, give one concrete fact (distance, Täsch shuttle, Gotthard) and end on the fixed-fare promise. No prices in route titles because competitor 'from' prices (CHF 81 to 650) undercut Z-ALS fares. No flight-tracking, meet-and-greet or review claims."

