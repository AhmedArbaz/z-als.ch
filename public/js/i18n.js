/* EN / DE / FR / IT for both pages, without touching the boards' markup.
 *
 * The boards are written in English. This file translates every visible string by its
 * exact English text: walk() rewrites the static markup (text nodes, placeholder /
 * aria-label / alt / title, template contents) and dc-lite passes every bound value
 * through t(). A string missing from D stays English, so every new English string on a
 * board needs a row here: [German, French, Italian]. Wording follows z-als.ch's
 * src/i18n (Offerte / Disposition, devis / centrale, preventivo / centrale; formal
 * Sie / vous / Lei).
 *
 * t(s, vars) fills {name} placeholders after translating, so composed strings are one
 * row: t('{n} hours', { n: 4 }). Emails to dispatch (server.mjs) stay English. */
(function (g) {
  'use strict';

  const LANGS = ['en', 'de', 'fr', 'it'];
  const LOCALES = { en: 'en-GB', de: 'de-CH', fr: 'fr-CH', it: 'it-CH' };
  const KEY = 'zals-lang';

  /* English → [de, fr, it] */
  const D = {
    // Page titles
    'Request a Quote · Chauffeur Transfers Switzerland | Z-ALS': ['Offerte anfragen · Chauffeur-Transfers Schweiz | Z-ALS', 'Demander un devis · Transferts chauffeur Suisse | Z-ALS', 'Richiedi un preventivo · Transfer con autista Svizzera | Z-ALS'],
    'Imprint, Privacy & Terms | Z-ALS': ['Impressum, Datenschutz & AGB | Z-ALS', 'Mentions légales, confidentialité et CGV | Z-ALS', 'Note legali, privacy e condizioni | Z-ALS'],

    // Header, menus, footer
    'Home': ['Startseite', 'Accueil', 'Home'],
    'Services': ['Dienstleistungen', 'Services', 'Servizi'],
    'Fleet': ['Flotte', 'Flotte', 'Flotta'],
    'Company': ['Unternehmen', 'Entreprise', 'Azienda'],
    'Journal': ['Journal', 'Journal', 'Journal'],
    'Contact': ['Kontakt', 'Contact', 'Contatti'],
    'Request a quote': ['Offerte anfragen', 'Demander un devis', 'Richiedi un preventivo'],
    'Quote': ['Offerte', 'Devis', 'Preventivo'],
    'Language': ['Sprache', 'Langue', 'Lingua'],
    'Main': ['Hauptnavigation', 'Navigation principale', 'Navigazione principale'],
    'Open menu': ['Menü öffnen', 'Ouvrir le menu', 'Apri il menu'],
    'Close menu': ['Menü schliessen', 'Fermer le menu', 'Chiudi il menu'],
    'Menu': ['Menü', 'Menu', 'Menu'],
    'Z-ALS home': ['Z-ALS Startseite', 'Accueil Z-ALS', 'Home Z-ALS'],
    'Call Z-ALS dispatch': ['Z-ALS Disposition anrufen', 'Appeler la centrale Z-ALS', 'Chiama la centrale Z-ALS'],
    'Chat with Z-ALS dispatch on WhatsApp': ['Der Z-ALS Disposition auf WhatsApp schreiben', 'Écrire à la centrale Z-ALS sur WhatsApp', 'Scriva alla centrale Z-ALS su WhatsApp'],
    'Three airports': ['Drei Flughäfen', 'Trois aéroports', 'Tre aeroporti'],
    'Zürich · Basel · Geneva': ['Zürich · Basel · Genf', 'Zurich · Bâle · Genève', 'Zurigo · Basilea · Ginevra'],
    'We collect at all three and drive on across Switzerland, Italy, France, Germany and Austria.': ['Wir holen Sie an allen drei ab und fahren weiter durch die Schweiz, Italien, Frankreich, Deutschland und Österreich.', 'Nous vous prenons en charge dans les trois et poursuivons à travers la Suisse, l’Italie, la France, l’Allemagne et l’Autriche.', 'La prendiamo in tutti e tre e proseguiamo in Svizzera, Italia, Francia, Germania e Austria.'],
    'Zurich chauffeur service →': ['Chauffeurservice Zürich →', 'Service de chauffeur à Zurich →', 'Servizio autista a Zurigo →'],
    'Luxury Mercedes limousines, vans and SUVs, always with a professional chauffeur: choose the class that fits your group and your luggage.': ['Luxuriöse Mercedes-Limousinen, Vans und SUVs, immer mit professionellem Chauffeur: Wählen Sie die Klasse, die zu Ihrer Gruppe und Ihrem Gepäck passt.', 'Limousines, vans et SUV Mercedes haut de gamme, toujours avec un chauffeur professionnel : choisissez la classe adaptée à votre groupe et à vos bagages.', 'Limousine, van e SUV Mercedes di lusso, sempre con autista professionista: scelga la classe adatta al gruppo e ai bagagli.'],
    'All services →': ['Alle Dienstleistungen →', 'Tous les services →', 'Tutti i servizi →'],
    'Airport transfer': ['Flughafentransfer', 'Transfert aéroport', 'Transfer aeroportuale'],
    'Flight watched, chauffeur inside arrivals, 60 minutes waiting included.': ['Flug überwacht, Chauffeur in der Ankunftshalle, 60 Minuten Wartezeit inbegriffen.', 'Vol suivi, chauffeur dans le hall d’arrivée, 60 minutes d’attente incluses.', 'Volo monitorato, autista nella sala arrivi, 60 minuti di attesa inclusi.'],
    'Limousine by the hour': ['Limousine stundenweise', 'Limousine à l’heure', 'Limousine a ore'],
    'Roadshows, board days and alpine runs — the car stays with you.': ['Roadshows, Verwaltungsratstage und Alpenfahrten — das Fahrzeug bleibt bei Ihnen.', 'Roadshows, journées de conseil et trajets alpins — la voiture reste avec vous.', 'Roadshow, giornate di consiglio e tratte alpine — l’auto resta con Lei.'],
    'Private chauffeur': ['Privatchauffeur', 'Chauffeur privé', 'Autista privato'],
    'A trained, insured, discreet driver — for your own car if you prefer.': ['Ein geschulter, versicherter, diskreter Fahrer — auf Wunsch auch für Ihr eigenes Fahrzeug.', 'Un chauffeur formé, assuré et discret — pour votre propre voiture si vous préférez.', 'Un autista formato, assicurato e discreto — anche per la Sua auto, se preferisce.'],
    'Documents & parcel courier': ['Dokumenten- & Paketkurier', 'Coursier documents & colis', 'Corriere documenti e pacchi'],
    'Signature-critical papers moved between the airports the same day.': ['Unterschriftsrelevante Dokumente am selben Tag zwischen den Flughäfen befördert.', 'Documents à signer acheminés entre les aéroports le jour même.', 'Documenti da firmare trasportati tra gli aeroporti in giornata.'],
    'Business Class': ['Business-Klasse', 'Classe Business', 'Classe Business'],
    'Premium Class': ['Premium-Klasse', 'Classe Premium', 'Classe Premium'],
    'SUV Class': ['SUV-Klasse', 'Classe SUV', 'Classe SUV'],
    'Business VAN Class': ['Business-Van-Klasse', 'Classe Business Van', 'Classe Business Van'],
    'Electric Car': ['Elektrofahrzeug', 'Voiture électrique', 'Auto elettrica'],
    'Full fleet & rate card →': ['Ganze Flotte & Tarife →', 'Toute la flotte & tarifs →', 'Tutta la flotta e tariffe →'],
    'Mercedes E-Class': ['Mercedes E-Klasse', 'Mercedes Classe E', 'Mercedes Classe E'],
    'Mercedes S-Class': ['Mercedes S-Klasse', 'Mercedes Classe S', 'Mercedes Classe S'],
    'Mercedes V-Class': ['Mercedes V-Klasse', 'Mercedes Classe V', 'Mercedes Classe V'],
    'SUV class — black Mercedes-Benz SUV': ['SUV-Klasse — schwarzer Mercedes-Benz SUV', 'Classe SUV — SUV Mercedes-Benz noir', 'Classe SUV — SUV Mercedes-Benz nero'],
    'Fully electric saloon on charge': ['Vollelektrische Limousine an der Ladestation', 'Berline entièrement électrique en charge', 'Berlina completamente elettrica in ricarica'],
    'Chauffeured transfers from Zürich, Basel and Geneva airports — onward to anywhere in Switzerland, Italy, France, Germany and Austria.': ['Chauffeur-Transfers ab den Flughäfen Zürich, Basel und Genf — weiter an jedes Ziel in der Schweiz, Italien, Frankreich, Deutschland und Österreich.', 'Transferts avec chauffeur depuis les aéroports de Zurich, Bâle et Genève — vers toute destination en Suisse, Italie, France, Allemagne et Autriche.', 'Transfer con autista dagli aeroporti di Zurigo, Basilea e Ginevra — verso qualsiasi destinazione in Svizzera, Italia, Francia, Germania e Austria.'],
    'Business · E-Class': ['Business · E-Klasse', 'Business · Classe E', 'Business · Classe E'],
    'Premium · S-Class': ['Premium · S-Klasse', 'Premium · Classe S', 'Premium · Classe S'],
    'Business Van · V-Class': ['Business Van · V-Klasse', 'Business Van · Classe V', 'Business Van · Classe V'],
    'Rate card': ['Tarife', 'Tarifs', 'Tariffe'],
    'About Z-ALS': ['Über Z-ALS', 'À propos de Z-ALS', 'Chi siamo'],
    'Contact & dispatch': ['Kontakt & Disposition', 'Contact & centrale', 'Contatti e centrale'],
    'Ask AI about Z-ALS': ['KI zu Z-ALS fragen', 'Demander à l’IA', 'Chiedi all’IA'],
    'We accept': ['Wir akzeptieren', 'Nous acceptons', 'Accettiamo'],
    'Secure payment by Stripe · or pay the chauffeur': ['Sichere Zahlung über Stripe · oder beim Chauffeur bezahlen', 'Paiement sécurisé par Stripe · ou payez le chauffeur', 'Pagamento sicuro con Stripe · oppure paghi l’autista'],
    'The legal text is provided in English.': ['Der rechtliche Text liegt nur auf Englisch vor.', 'Le texte juridique est fourni en anglais.', 'Il testo legale è disponibile in inglese.'],
    'Imprint': ['Impressum', 'Mentions légales', 'Note legali'],
    'Privacy': ['Datenschutz', 'Confidentialité', 'Privacy'],
    'Terms': ['AGB', 'CGV', 'Condizioni'],

    // Homepage: hero and booking form
    'Zurich Airport limousine & chauffeur service': ['Limousinenservice & Chauffeur · Flughafen Zürich', 'Limousine & chauffeur privé · aéroport de Zurich', 'Limousine e autista privato · aeroporto di Zurigo'],
    'The car is already': ['Das Fahrzeug steht schon', 'La voiture est déjà', 'L’auto è già'],
    'at the kerb.': ['vor der Tür.', 'devant la porte.', 'davanti alla porta.'],
    'Chauffeured Zurich airport transfers, with pick-ups from Basel and Geneva too, then on to anywhere in Switzerland and across Central Europe. Your flight is monitored, your chauffeur waits inside arrivals, and the fare is agreed before you board.': ['Chauffeur-Flughafentransfers ab Zürich, auf Wunsch auch ab Basel und Genf, weiter in die ganze Schweiz und durch Mitteleuropa. Ihr Flug wird überwacht, Ihr Chauffeur wartet in der Ankunftshalle, und der Preis steht fest, bevor Sie einsteigen.', 'Transferts aéroport avec chauffeur à Zurich, mais aussi depuis Bâle et Genève, puis partout en Suisse et à travers l’Europe centrale. Votre vol est suivi, votre chauffeur vous attend dans le hall d’arrivée et le prix est convenu avant l’embarquement.', 'Transfer aeroportuali con autista a Zurigo, e anche da Basilea e Ginevra, poi in tutta la Svizzera e in Europa centrale. Il Suo volo è monitorato, l’autista La attende nella sala arrivi e la tariffa è concordata prima dell’imbarco.'],
    'Fixed fare, agreed up front': ['Festpreis, im Voraus vereinbart', 'Prix fixe, convenu à l’avance', 'Tariffa fissa, concordata in anticipo'],
    '60 minutes waiting included': ['60 Minuten Wartezeit inbegriffen', '60 minutes d’attente incluses', '60 minuti di attesa inclusi'],
    'Flight numbers monitored': ['Flugnummern überwacht', 'Numéros de vol suivis', 'Numeri di volo monitorati'],
    'One way': ['Einfache Fahrt', 'Aller simple', 'Solo andata'],
    'Round trip': ['Hin- und Rückfahrt', 'Aller-retour', 'Andata e ritorno'],
    'Return': ['Retour', 'Retour', 'Ritorno'],
    'Hourly': ['Stundenweise', 'À l’heure', 'A ore'],
    'Pick-up': ['Abholung', 'Prise en charge', 'Ritiro'],
    'Destination': ['Ziel', 'Destination', 'Destinazione'],
    'Duration': ['Dauer', 'Durée', 'Durata'],
    'Date': ['Datum', 'Date', 'Data'],
    'Time': ['Zeit', 'Heure', 'Ora'],
    'Return date': ['Rückfahrdatum', 'Date de retour', 'Data di ritorno'],
    'Return time': ['Rückfahrzeit', 'Heure de retour', 'Ora di ritorno'],
    'Passengers': ['Passagiere', 'Passagers', 'Passeggeri'],
    'Luggage': ['Gepäck', 'Bagages', 'Bagagli'],
    'Or type any address or hotel': ['Oder beliebige Adresse bzw. Hotel eingeben', 'Ou saisissez une adresse ou un hôtel', 'Oppure inserisca un indirizzo o un hotel'],
    'Address search by Mapbox · or type any address or hotel': ['Adresssuche von Mapbox · oder beliebige Adresse bzw. Hotel eingeben', 'Recherche d’adresse par Mapbox · ou saisissez une adresse ou un hôtel', 'Ricerca indirizzi di Mapbox · oppure inserisca un indirizzo o un hotel'],
    'Address search by Mapbox': ['Adresssuche von Mapbox', 'Recherche d’adresse par Mapbox', 'Ricerca indirizzi di Mapbox'],
    'Calculating fare…': ['Fahrpreis wird berechnet…', 'Calcul du tarif…', 'Calcolo della tariffa…'],
    'Measuring the road distance for your fare…': ['Die Strassendistanz für Ihren Fahrpreis wird berechnet…', 'Calcul de la distance routière pour votre tarif…', 'Calcolo della distanza stradale per la sua tariffa…'],
    'Address, hotel or airport': ['Adresse, Hotel oder Flughafen', 'Adresse, hôtel ou aéroport', 'Indirizzo, hotel o aeroporto'],
    'Address, airport or hotel': ['Adresse, Flughafen oder Hotel', 'Adresse, aéroport ou hôtel', 'Indirizzo, aeroporto o hotel'],
    'Any city in Switzerland or Central Europe': ['Jede Stadt in der Schweiz oder Mitteleuropa', 'Toute ville en Suisse ou en Europe centrale', 'Qualsiasi città in Svizzera o in Europa centrale'],
    'Minimum 4 hours. Long-distance roadshows: route and hours confirmed by dispatch.': ['Mindestens 4 Stunden. Roadshows über lange Distanzen: Route und Stunden bestätigt die Disposition.', 'Minimum 4 heures. Roadshows longue distance : itinéraire et heures confirmés par la centrale.', 'Minimo 4 ore. Roadshow su lunghe distanze: percorso e ore confermati dalla centrale.'],
    'Fewer hours': ['Weniger Stunden', 'Moins d’heures', 'Meno ore'],
    'More hours': ['Mehr Stunden', 'Plus d’heures', 'Più ore'],
    'Fewer passengers': ['Weniger Passagiere', 'Moins de passagers', 'Meno passeggeri'],
    'More passengers': ['Mehr Passagiere', 'Plus de passagers', 'Più passeggeri'],
    'Fewer bags': ['Weniger Gepäckstücke', 'Moins de bagages', 'Meno bagagli'],
    'More bags': ['Mehr Gepäckstücke', 'Plus de bagages', 'Più bagagli'],
    'Choose your car →': ['Fahrzeug wählen →', 'Choisir la voiture →', 'Scegli l’auto →'],
    'Continue on WhatsApp': ['Weiter auf WhatsApp', 'Continuer sur WhatsApp', 'Continua su WhatsApp'],
    'Fixed fare · VAT separate': ['Festpreis · MwSt. separat', 'Prix fixe · TVA en sus', 'Tariffa fissa · IVA a parte'],
    'Hourly hire · min. 4 hrs · VAT separate': ['Stundenweise · mind. 4 Std. · MwSt. separat', 'À l’heure · min. 4 h · TVA en sus', 'A ore · min. 4 ore · IVA a parte'],
    'Fare on quote': ['Preis auf Offerte', 'Prix sur devis', 'Tariffa su preventivo'],
    'Opening WhatsApp — dispatch answers personally, day or night.': ['WhatsApp wird geöffnet — die Disposition antwortet persönlich, Tag und Nacht.', 'Ouverture de WhatsApp — la centrale répond personnellement, de jour comme de nuit.', 'Apertura di WhatsApp — la centrale risponde di persona, giorno e notte.'],
    'Groups of more than 7 travel by Minibus or coach, quoted by dispatch, all costs shown before you travel.': ['Gruppen ab 8 Personen reisen im Minibus oder Reisebus, offeriert von der Disposition, alle Kosten vor der Reise genannt.', 'Les groupes de plus de 7 voyagent en minibus ou en autocar, chiffrés par la centrale, tous les coûts indiqués avant le départ.', 'I gruppi di più di 7 persone viaggiano in minibus o pullman, quotati dalla centrale, con tutti i costi indicati prima della partenza.'],
    'Every other pick-up and destination is quoted per route by dispatch, all costs shown before you travel.': ['Alle anderen Abholorte und Ziele offeriert die Disposition pro Strecke, alle Kosten vor der Reise genannt.', 'Tout autre lieu de prise en charge et destination est chiffré par trajet par la centrale, tous les coûts indiqués avant le départ.', 'Ogni altro ritiro e destinazione è quotato per tratta dalla centrale, con tutti i costi indicati prima della partenza.'],
    '{hours} hrs × CHF {rate} / hr · {car}. Premium and SUV: CHF {top} / hr. Choose the car in the next step.': ['{hours} Std. × CHF {rate} / Std. · {car}. Premium und SUV: CHF {top} / Std. Fahrzeug im nächsten Schritt wählen.', '{hours} h × CHF {rate} / h · {car}. Premium et SUV : CHF {top} / h. Choisissez la voiture à l’étape suivante.', '{hours} ore × CHF {rate} / ora · {car}. Premium e SUV: CHF {top} / ora. Scelga l’auto nel passo successivo.'],
    '{from} → {dest} · {km} km · drive time {drive} · fixed fare, VAT separate.': ['{from} → {dest} · {km} km · Fahrzeit {drive} · Festpreis, MwSt. separat.', '{from} → {dest} · {km} km · durée {drive} · prix fixe, TVA en sus.', '{from} → {dest} · {km} km · durata {drive} · tariffa fissa, IVA a parte.'],
    '{from} → {dest} · {km} km · drive time {drive} · both ways, fixed fare, VAT separate.': ['{from} → {dest} · {km} km · Fahrzeit {drive} · Hin- und Rückfahrt, Festpreis, MwSt. separat.', '{from} → {dest} · {km} km · durée {drive} · aller-retour, prix fixe, TVA en sus.', '{from} → {dest} · {km} km · durata {drive} · andata e ritorno, tariffa fissa, IVA a parte.'],

    // Homepage: sections
    'Airports we collect from': ['Flughäfen, an denen wir abholen', 'Aéroports desservis', 'Aeroporti serviti'],
    'Countries we drop off in': ['Länder, in die wir fahren', 'Pays desservis', 'Paesi serviti'],
    'Driving since': ['Unterwegs seit', 'En route depuis', 'In strada dal'],
    'Kloten, Zürich': ['Kloten, Zürich', 'Kloten, Zurich', 'Kloten, Zurigo'],
    'Dispatch answered live': ['Disposition persönlich erreichbar', 'Centrale joignable en direct', 'Centrale sempre raggiungibile'],
    'Swiss-registered operator': ['In der Schweiz eingetragenes Unternehmen', 'Entreprise inscrite en Suisse', 'Operatore registrato in Svizzera'],
    'Zurich-Airport Limousinen Services GmbH, Am Balsberg 36, Kloten — trading since 2004.': ['Zurich-Airport Limousinen Services GmbH, Am Balsberg 36, Kloten — tätig seit 2004.', 'Zurich-Airport Limousinen Services GmbH, Am Balsberg 36, Kloten — en activité depuis 2004.', 'Zurich-Airport Limousinen Services GmbH, Am Balsberg 36, Kloten — attiva dal 2004.'],
    'Fixed fares, costs inside': ['Festpreise, alles inbegriffen', 'Prix fixes, tout compris', 'Tariffe fisse, tutto incluso'],
    'Waiting, luggage, tolls and vignette sit inside the quoted figure. Distance and 8.1% VAT are billed as separate lines. No card kept on file.': ['Wartezeit, Gepäck, Maut und Vignette sind im offerierten Betrag enthalten. Strecke und 8,1 % MwSt. werden als getrennte Positionen verrechnet. Keine Kartendaten gespeichert.', 'L’attente, les bagages, les péages et la vignette sont compris dans le montant indiqué. La distance et la TVA de 8,1 % figurent sur des lignes séparées. Aucune carte enregistrée.', 'Attesa, bagagli, pedaggi e vignetta sono compresi nell’importo indicato. Distanza e IVA all’8,1 % sono esposte come voci separate. Nessuna carta memorizzata.'],
    'Flights watched, waiting included': ['Flüge überwacht, Wartezeit inbegriffen', 'Vols suivis, attente incluse', 'Voli monitorati, attesa inclusa'],
    'We follow the flight number and hold the car for 60 minutes after landing at no charge.': ['Wir verfolgen die Flugnummer und halten das Fahrzeug nach der Landung 60 Minuten kostenlos bereit.', 'Nous suivons le numéro de vol et gardons la voiture 60 minutes après l’atterrissage, sans frais.', 'Seguiamo il numero di volo e teniamo l’auto a disposizione per 60 minuti dopo l’atterraggio, senza costi.'],
    'Four languages on the road': ['Vier Sprachen unterwegs', 'Quatre langues en route', 'Quattro lingue a bordo'],
    'German, English, French and Italian — in the car and on the dispatch line, 24 / 7.': ['Deutsch, Englisch, Französisch und Italienisch — im Fahrzeug und bei der Disposition, 24 / 7.', 'Allemand, anglais, français et italien — dans la voiture et à la centrale, 24 / 7.', 'Tedesco, inglese, francese e italiano — in auto e in centrale, 24 / 7.'],
    'All routes and fares from Zürich Airport →': ['Alle Strecken und Preise ab Flughafen Zürich →', 'Tous les trajets et tarifs depuis l’aéroport de Zurich →', 'Tutte le tratte e tariffe dall’aeroporto di Zurigo →'],
    'Routes and fares': ['Strecken und Preise', 'Trajets et tarifs', 'Tratte e tariffe'],
    'Popular routes': ['Beliebte Strecken', 'Trajets populaires', 'Tratte più richieste'],
    'Where would you like': ['Wo möchten Sie', 'Où souhaitez-vous', 'Dove desidera'],
    'to land?': ['landen?', 'atterrir ?', 'atterrare?'],
    'Fixed fares from Zürich Airport, published up front. Distance and 8.1% VAT are billed as separate lines — no surge, no surprise.': ['Festpreise ab Flughafen Zürich, im Voraus publiziert. Strecke und 8,1 % MwSt. werden getrennt ausgewiesen — keine Zuschläge, keine Überraschungen.', 'Prix fixes depuis l’aéroport de Zurich, publiés à l’avance. La distance et la TVA de 8,1 % figurent sur des lignes séparées — pas de majoration, pas de surprise.', 'Tariffe fisse dall’aeroporto di Zurigo, pubblicate in anticipo. Distanza e IVA all’8,1 % sono voci separate — nessun sovrapprezzo, nessuna sorpresa.'],
    'ZRH → ZÜRICH CITY': ['ZRH → ZÜRICH STADT', 'ZRH → ZURICH VILLE', 'ZRH → ZURIGO CENTRO'],
    'ZRH → BASEL': ['ZRH → BASEL', 'ZRH → BÂLE', 'ZRH → BASILEA'],
    'ZRH → BERN': ['ZRH → BERN', 'ZRH → BERNE', 'ZRH → BERNA'],
    'ZRH → LUZERN': ['ZRH → LUZERN', 'ZRH → LUCERNE', 'ZRH → LUCERNA'],
    'Request this route →': ['Diese Strecke anfragen →', 'Demander ce trajet →', 'Richiedi questa tratta →'],
    'Business-class fare shown for 1–3 passengers. Basel and Geneva pickups, and every other Swiss or cross-border destination, are quoted per route by dispatch.': ['Preis der Business-Klasse für 1–3 Passagiere. Abholungen in Basel und Genf sowie alle anderen Ziele in der Schweiz und im Ausland offeriert die Disposition pro Strecke.', 'Tarif classe Business pour 1 à 3 passagers. Les prises en charge à Bâle et Genève, et toute autre destination en Suisse ou à l’étranger, sont chiffrées par trajet par la centrale.', 'Tariffa classe Business per 1–3 passeggeri. I ritiri a Basilea e Ginevra e ogni altra destinazione in Svizzera o all’estero sono quotati per tratta dalla centrale.'],
    'Zürich old town along the Limmat': ['Zürcher Altstadt an der Limmat', 'Vieille ville de Zurich au bord de la Limmat', 'Città vecchia di Zurigo lungo la Limmat'],
    'Bridge over the Rhine in Basel': ['Brücke über den Rhein in Basel', 'Pont sur le Rhin à Bâle', 'Ponte sul Reno a Basilea'],
    'Bern old town above the Aare': ['Berner Altstadt über der Aare', 'Vieille ville de Berne au-dessus de l’Aar', 'Città vecchia di Berna sopra l’Aar'],
    'Lucerne water tower on the Reuss': ['Luzerner Wasserturm an der Reuss', 'Tour d’eau de Lucerne sur la Reuss', 'Torre dell’acqua di Lucerna sulla Reuss'],
    'Interlaken between its two lakes': ['Interlaken zwischen seinen zwei Seen', 'Interlaken entre ses deux lacs', 'Interlaken tra i suoi due laghi'],
    'Davos in its alpine valley': ['Davos in seinem Alpental', 'Davos dans sa vallée alpine', 'Davos nella sua valle alpina'],
    'St. Moritz in winter snow': ['St. Moritz im Winterschnee', 'Saint-Moritz sous la neige', 'St. Moritz sotto la neve'],
    'Zermatt village below the Matterhorn': ['Zermatt unter dem Matterhorn', 'Zermatt au pied du Cervin', 'Zermatt ai piedi del Cervino'],
    'Corporate & standing accounts': ['Firmen- & Daueraufträge', 'Comptes entreprises & abonnements', 'Conti aziendali e contratti continuativi'],
    'The car stays with you.': ['Das Fahrzeug bleibt bei Ihnen.', 'La voiture reste avec vous.', 'L’auto resta con Lei.'],
    'Board meetings, roadshows, alpine runs and events anywhere in Switzerland or across the border — the same car and chauffeur for the whole day. Repeat corporate accounts, private clients and standing airport contracts, since 2004.': ['Verwaltungsratssitzungen, Roadshows, Alpenfahrten und Anlässe überall in der Schweiz oder im Ausland — dasselbe Fahrzeug und derselbe Chauffeur den ganzen Tag. Firmenkunden, Privatkunden und feste Flughafenverträge, seit 2004.', 'Conseils d’administration, roadshows, trajets alpins et événements partout en Suisse ou à l’étranger — la même voiture et le même chauffeur toute la journée. Comptes entreprises, clients privés et contrats aéroport réguliers, depuis 2004.', 'Consigli di amministrazione, roadshow, tratte alpine ed eventi ovunque in Svizzera o all’estero — la stessa auto e lo stesso autista per tutta la giornata. Clienti aziendali, privati e contratti aeroportuali continuativi, dal 2004.'],
    'Ask about a standing arrangement': ['Nach einer festen Vereinbarung fragen', 'Demander un accord permanent', 'Chieda un accordo continuativo'],
    'Black Mercedes S-Class parked outside a business district building': ['Schwarze Mercedes S-Klasse vor einem Bürogebäude', 'Mercedes Classe S noire garée devant un immeuble de bureaux', 'Mercedes Classe S nera parcheggiata davanti a un edificio per uffici'],
    'Black Mercedes-Benz S-Class parked at the kerb': ['Schwarze Mercedes-Benz S-Klasse am Strassenrand', 'Mercedes-Benz Classe S noire garée au bord du trottoir', 'Mercedes-Benz Classe S nera parcheggiata a bordo strada'],
    'The fleet': ['Die Flotte', 'La flotte', 'La flotta'],
    'Five cars, one': ['Fünf Fahrzeuge, ein', 'Cinq voitures, un', 'Cinque auto, un'],
    'standard of quiet': ['Anspruch an Ruhe', 'même niveau de calme', 'unico standard di silenzio'],
    'Full fleet & rates →': ['Ganze Flotte & Tarife →', 'Toute la flotte & tarifs →', 'Tutta la flotta e tariffe →'],
    'All classes': ['Alle Klassen', 'Toutes les classes', 'Tutte le classi'],
    'Electric': ['Elektro', 'Électrique', 'Elettrica'],
    'Minibus': ['Kleinbus', 'Minibus', 'Minibus'],
    'rear cabin': ['Fondraum', 'cabine arrière', 'cabina posteriore'],
    'Mercedes E-Class or equivalent': ['Mercedes E-Klasse oder gleichwertig', 'Mercedes Classe E ou équivalent', 'Mercedes Classe E o equivalente'],
    'Mercedes S-Class or equivalent': ['Mercedes S-Klasse oder gleichwertig', 'Mercedes Classe S ou équivalent', 'Mercedes Classe S o equivalente'],
    'Mercedes GLE or equivalent': ['Mercedes GLE oder gleichwertig', 'Mercedes GLE ou équivalent', 'Mercedes GLE o equivalente'],
    'Mercedes V-Class or equivalent': ['Mercedes V-Klasse oder gleichwertig', 'Mercedes Classe V ou équivalent', 'Mercedes Classe V o equivalente'],
    'Fully electric saloon or equivalent': ['Vollelektrische Limousine oder gleichwertig', 'Berline entièrement électrique ou équivalent', 'Berlina completamente elettrica o equivalente'],
    'Mercedes Sprinter or coach, for groups': ['Mercedes Sprinter oder Reisebus, für Gruppen', 'Mercedes Sprinter ou autocar, pour les groupes', 'Mercedes Sprinter o pullman, per gruppi'],
    'Five ways we': ['Fünf Arten, wie wir', 'Cinq façons de', 'Cinque modi in cui'],
    'drive for you': ['für Sie fahren', 'rouler pour vous', 'guidiamo per Lei'],
    '01 · MOST BOOKED': ['01 · AM MEISTEN GEBUCHT', '01 · LE PLUS RÉSERVÉ', '01 · IL PIÙ PRENOTATO'],
    'Meet and greet inside arrivals at Zürich, Basel or Geneva. Flight monitored, 60 minutes of waiting included.': ['Empfang in der Ankunftshalle in Zürich, Basel oder Genf. Flug überwacht, 60 Minuten Wartezeit inbegriffen.', 'Accueil dans le hall d’arrivée à Zurich, Bâle ou Genève. Vol suivi, 60 minutes d’attente incluses.', 'Accoglienza nella sala arrivi a Zurigo, Basilea o Ginevra. Volo monitorato, 60 minuti di attesa inclusi.'],
    'from CHF 120.00 + 8.1% VAT': ['ab CHF 120.00 zzgl. 8,1 % MwSt.', 'dès CHF 120.00 + TVA 8,1 %', 'da CHF 120.00 + IVA 8,1 %'],
    'Book a transfer →': ['Transfer buchen →', 'Réserver un transfert →', 'Prenota un transfer →'],
    'Board meetings, roadshows, alpine runs and events anywhere in Switzerland or across the border.': ['Verwaltungsratssitzungen, Roadshows, Alpenfahrten und Anlässe überall in der Schweiz oder im Ausland.', 'Conseils d’administration, roadshows, trajets alpins et événements partout en Suisse ou à l’étranger.', 'Consigli di amministrazione, roadshow, tratte alpine ed eventi ovunque in Svizzera o all’estero.'],
    'from CHF 120 / hr + 8.1% VAT · min. 4 hrs': ['ab CHF 120 / Std. zzgl. 8,1 % MwSt. · mind. 4 Std.', 'dès CHF 120 / h + TVA 8,1 % · min. 4 h', 'da CHF 120 / ora + IVA 8,1 % · min. 4 ore'],
    'A trained, insured, discreet chauffeur — in our car or yours — for a day, a season, or a standing arrangement.': ['Ein geschulter, versicherter, diskreter Chauffeur — in unserem oder Ihrem Fahrzeug — für einen Tag, eine Saison oder dauerhaft.', 'Un chauffeur formé, assuré et discret — dans notre voiture ou la vôtre — pour un jour, une saison ou de façon permanente.', 'Un autista formato, assicurato e discreto — con la nostra auto o la Sua — per un giorno, una stagione o in modo continuativo.'],
    'CHF 60 / hr + 8.1% VAT': ['CHF 60 / Std. zzgl. 8,1 % MwSt.', 'CHF 60 / h + TVA 8,1 %', 'CHF 60 / ora + IVA 8,1 %'],
    'Bus service': ['Busservice', 'Service de bus', 'Servizio bus'],
    'Minibus and coach for groups, delegations and events.': ['Minibus und Reisebus für Gruppen, Delegationen und Anlässe.', 'Minibus et autocar pour groupes, délégations et événements.', 'Minibus e pullman per gruppi, delegazioni ed eventi.'],
    'Price on request': ['Preis auf Anfrage', 'Prix sur demande', 'Prezzo su richiesta'],
    'Group pick-up and drop-off by minibus and coach for larger parties, delegations and events across Zurich and Switzerland.': ['Gruppentransfers mit Kleinbus und Reisebus für grössere Gruppen, Delegationen und Anlässe in Zürich und der ganzen Schweiz.', 'Transferts de groupes en minibus et autocar pour grands groupes, délégations et événements à Zurich et dans toute la Suisse.', 'Transfer di gruppo in minibus e pullman per gruppi numerosi, delegazioni ed eventi a Zurigo e in tutta la Svizzera.'],
    'per km · on request': ['pro km · auf Anfrage', 'par km · sur demande', 'al km · su richiesta'],
    'VIP pick-up & bodyguard': ['VIP-Abholung & Bodyguard', 'Prise en charge VIP & garde du corps', 'Ritiro VIP e guardia del corpo'],
    'A trained bodyguard accompanies the journey for clients who require discreet personal protection.': ['Ein ausgebildeter Bodyguard begleitet die Fahrt für Kunden, die diskreten Personenschutz benötigen.', 'Un garde du corps formé accompagne le trajet pour les clients qui ont besoin d’une protection discrète.', 'Una guardia del corpo addestrata accompagna il viaggio per i clienti che necessitano di protezione discreta.'],
    'Enquire →': ['Anfragen →', 'Se renseigner →', 'Richiedi →'],
    'How it works': ['So funktioniert es', 'Comment ça marche', 'Come funziona'],
    'Four steps to': ['In vier Schritten', 'Quatre étapes jusqu’à', 'Quattro passi fino'],
    'the kerb': ['zum Fahrzeug', 'la voiture', 'all’auto'],
    'Send your trip details': ['Reisedaten senden', 'Envoyez les détails du trajet', 'Invii i dettagli del viaggio'],
    'Pick-up, destination, date and time — or hourly, if the car should just stay with you.': ['Abholort, Ziel, Datum und Zeit — oder stundenweise, wenn das Fahrzeug einfach bei Ihnen bleiben soll.', 'Lieu de prise en charge, destination, date et heure — ou à l’heure, si la voiture doit simplement rester avec vous.', 'Ritiro, destinazione, data e ora — oppure a ore, se l’auto deve semplicemente restare con Lei.'],
    'See your fixed fare': ['Festpreis sehen', 'Voir votre prix fixe', 'Veda la tariffa fissa'],
    'The published per-kilometre rate for your class, shown before you send anything — VAT stated separately.': ['Der publizierte Kilometertarif Ihrer Klasse, angezeigt bevor Sie etwas senden — MwSt. separat ausgewiesen.', 'Le tarif au kilomètre publié pour votre classe, affiché avant tout envoi — TVA indiquée séparément.', 'La tariffa al chilometro pubblicata per la Sua classe, mostrata prima dell’invio — IVA indicata a parte.'],
    'Confirm with dispatch': ['Mit der Disposition bestätigen', 'Confirmer avec la centrale', 'Confermi con la centrale'],
    'One tap to WhatsApp. The dispatcher who runs the journey answers personally, day or night.': ['Ein Tipp auf WhatsApp. Der Disponent, der die Fahrt leitet, antwortet persönlich, Tag und Nacht.', 'Un geste vers WhatsApp. Le répartiteur qui gère le trajet répond personnellement, de jour comme de nuit.', 'Un tocco su WhatsApp. Il dispatcher che gestisce il viaggio risponde di persona, giorno e notte.'],
    'Meet your chauffeur': ['Ihren Chauffeur treffen', 'Retrouvez votre chauffeur', 'Incontri il Suo autista'],
    'Waiting inside arrivals, flight number monitored, 60 minutes of waiting included at no charge.': ['Wartet in der Ankunftshalle, Flugnummer überwacht, 60 Minuten Wartezeit kostenlos inbegriffen.', 'Il vous attend dans le hall d’arrivée, numéro de vol suivi, 60 minutes d’attente incluses sans frais.', 'In attesa nella sala arrivi, numero di volo monitorato, 60 minuti di attesa inclusi senza costi.'],
    'Twenty-two years of arrivals at Kloten.': ['Zweiundzwanzig Jahre Ankünfte in Kloten.', 'Vingt-deux ans d’arrivées à Kloten.', 'Ventidue anni di arrivi a Kloten.'],
    'Zurich-Airport Limousinen Services GmbH · founded 2004': ['Zurich-Airport Limousinen Services GmbH · gegründet 2004', 'Zurich-Airport Limousinen Services GmbH · fondée en 2004', 'Zurich-Airport Limousinen Services GmbH · fondata nel 2004'],
    'Travellers in the terminal at Zürich Airport, Kloten': ['Reisende im Terminal des Flughafens Zürich, Kloten', 'Voyageurs dans le terminal de l’aéroport de Zurich, Kloten', 'Viaggiatori nel terminal dell’aeroporto di Zurigo, Kloten'],
    'From the': ['Aus dem', 'Extraits du', 'Dal'],
    'journal': ['Journal', 'journal', 'journal'],
    'All articles →': ['Alle Artikel →', 'Tous les articles →', 'Tutti gli articoli →'],
    'How a dispatch desk absorbs a delayed flight': ['Wie eine Disposition einen verspäteten Flug auffängt', 'Comment une centrale absorbe un vol retardé', 'Come una centrale gestisce un volo in ritardo'],
    'Reading a chauffeur invoice: the six lines that matter': ['Eine Chauffeur-Rechnung lesen: die sechs Positionen, die zählen', 'Lire une facture de chauffeur : les six lignes qui comptent', 'Leggere la fattura di un autista: le sei voci che contano'],
    'Winter routes: when the Julier decides your schedule': ['Winterstrecken: wenn der Julier Ihren Zeitplan bestimmt', 'Routes d’hiver : quand le Julier décide de votre horaire', 'Percorsi invernali: quando il passo del Giulia decide i Suoi orari'],
    'Why we quote by hand instead of by algorithm': ['Warum wir von Hand offerieren statt per Algorithmus', 'Pourquoi nous chiffrons à la main plutôt que par algorithme', 'Perché quotiamo a mano e non con un algoritmo'],
    'Tell us the flight.': ['Nennen Sie uns den Flug.', 'Indiquez-nous le vol.', 'Ci indichi il volo.'],
    'We will do the rest.': ['Wir erledigen den Rest.', 'Nous faisons le reste.', 'Al resto pensiamo noi.'],
    'Send the flight number and the address. The dispatcher who will run the journey answers you personally, with the fare agreed before you travel.': ['Senden Sie Flugnummer und Adresse. Der Disponent, der die Fahrt leitet, antwortet Ihnen persönlich, mit dem vereinbarten Preis vor der Reise.', 'Envoyez le numéro de vol et l’adresse. Le répartiteur qui gérera le trajet vous répond personnellement, avec un prix convenu avant le départ.', 'Invii il numero di volo e l’indirizzo. Il dispatcher che gestirà il viaggio Le risponde di persona, con la tariffa concordata prima della partenza.'],
    '60 min waiting included': ['60 Min. Wartezeit inbegriffen', '60 min d’attente incluses', '60 min di attesa inclusi'],
    'Dispatch answered 24 / 7': ['Disposition erreichbar 24 / 7', 'Centrale joignable 24 / 7', 'Centrale raggiungibile 24 / 7'],

    // Request a quote: steps and fields
    'Book your chauffeur': ['Buchen Sie Ihren Chauffeur', 'Réservez votre chauffeur', 'Prenoti il Suo autista'],
    'in five steps.': ['in fünf Schritten.', 'en cinq étapes.', 'in cinque passi.'],
    'Tell us the trip, choose the car, and book with our team on WhatsApp or pay online by card or TWINT. Fixed fares from Zürich Airport are shown as you go; every other route is quoted personally by dispatch, all costs stated before you travel.': ['Nennen Sie uns die Fahrt, wählen Sie das Fahrzeug und buchen Sie bei unserem Team auf WhatsApp oder bezahlen Sie online per Karte oder TWINT. Festpreise ab Flughafen Zürich sehen Sie laufend; alle anderen Strecken offeriert die Disposition persönlich, alle Kosten vor der Reise genannt.', 'Indiquez le trajet, choisissez la voiture et réservez auprès de notre équipe sur WhatsApp ou payez en ligne par carte ou TWINT. Les prix fixes depuis l’aéroport de Zurich s’affichent au fur et à mesure ; tout autre trajet est chiffré personnellement par la centrale, tous les coûts indiqués avant le départ.', 'Ci indichi il viaggio, scelga l’auto e prenoti con il nostro team su WhatsApp o paghi online con carta o TWINT. Le tariffe fisse dall’aeroporto di Zurigo sono mostrate man mano; ogni altra tratta è quotata personalmente dalla centrale, con tutti i costi indicati prima della partenza.'],
    'Booking steps': ['Buchungsschritte', 'Étapes de réservation', 'Passaggi della prenotazione'],
    'Trip': ['Fahrt', 'Trajet', 'Viaggio'],
    'Vehicle': ['Fahrzeug', 'Véhicule', 'Veicolo'],
    'Details': ['Angaben', 'Coordonnées', 'Dati'],
    'Review': ['Prüfen', 'Vérifier', 'Riepilogo'],
    'Payment': ['Zahlung', 'Paiement', 'Pagamento'],
    'Trip type': ['Art der Fahrt', 'Type de trajet', 'Tipo di viaggio'],
    'How would you like to travel?': ['Wie möchten Sie reisen?', 'Comment souhaitez-vous voyager ?', 'Come desidera viaggiare?'],
    'Minimum 4 hours · the car and chauffeur stay with you. Long-distance roadshows: route and hours confirmed by dispatch.': ['Mindestens 4 Stunden · Fahrzeug und Chauffeur bleiben bei Ihnen. Roadshows über lange Distanzen: Route und Stunden bestätigt die Disposition.', 'Minimum 4 heures · la voiture et le chauffeur restent avec vous. Roadshows longue distance : itinéraire et heures confirmés par la centrale.', 'Minimo 4 ore · auto e autista restano con Lei. Roadshow su lunghe distanze: percorso e ore confermati dalla centrale.'],
    'Pick-up time': ['Abholzeit', 'Heure de prise en charge', 'Ora di ritiro'],
    'Select a date': ['Datum wählen', 'Choisir une date', 'Scegli una data'],
    'Select a time': ['Zeit wählen', 'Choisir une heure', 'Scegli un orario'],
    'Previous month': ['Vorheriger Monat', 'Mois précédent', 'Mese precedente'],
    'Next month': ['Nächster Monat', 'Mois suivant', 'Mese successivo'],
    'MO': ['MO', 'LU', 'LU'], 'TU': ['DI', 'MA', 'MA'], 'WE': ['MI', 'ME', 'ME'], 'TH': ['DO', 'JE', 'GI'],
    'FR': ['FR', 'VE', 'VE'], 'SA': ['SA', 'SA', 'SA'], 'SU': ['SO', 'DI', 'DO'],
    'HOUR': ['STD.', 'HEURE', 'ORA'],
    'Please correct the marked fields before continuing.': ['Bitte korrigieren Sie die markierten Felder, bevor Sie fortfahren.', 'Veuillez corriger les champs signalés avant de continuer.', 'La preghiamo di correggere i campi evidenziati prima di continuare.'],
    'Choose vehicle': ['Fahrzeug wählen', 'Choisir le véhicule', 'Scegli il veicolo'],
    'Prefer WhatsApp? Continue there →': ['Lieber WhatsApp? Dort weitermachen →', 'Vous préférez WhatsApp ? Continuez-y →', 'Preferisce WhatsApp? Continui lì →'],
    'Choose your car': ['Wählen Sie Ihr Fahrzeug', 'Choisissez votre voiture', 'Scelga la Sua auto'],
    '← Back': ['← Zurück', '← Retour', '← Indietro'],
    'Your details': ['Ihre Angaben', 'Vos coordonnées', 'I Suoi dati'],
    'Who is travelling?': ['Wer reist?', 'Qui voyage ?', 'Chi viaggia?'],
    'Dispatch uses these only to confirm this journey with you.': ['Die Disposition verwendet diese Angaben nur, um diese Fahrt mit Ihnen zu bestätigen.', 'La centrale les utilise uniquement pour confirmer ce trajet avec vous.', 'La centrale li usa solo per confermare questo viaggio con Lei.'],
    'First name': ['Vorname', 'Prénom', 'Nome'],
    'Last name': ['Nachname', 'Nom', 'Cognome'],
    'Mobile': ['Mobiltelefon', 'Mobile', 'Cellulare'],
    '· with country code': ['· mit Landesvorwahl', '· avec indicatif pays', '· con prefisso internazionale'],
    'Email': ['E-Mail', 'E-mail', 'E-mail'],
    'Flight number': ['Flugnummer', 'Numéro de vol', 'Numero di volo'],
    '· optional': ['· optional', '· facultatif', '· facoltativo'],
    'e.g. LX 318': ['z. B. LX 318', 'p. ex. LX 318', 'ad es. LX 318'],
    'Name on the sign': ['Name auf dem Schild', 'Nom sur la pancarte', 'Nome sul cartello'],
    'Child seats': ['Kindersitze', 'Sièges enfant', 'Seggiolini per bambini'],
    'Fewer child seats': ['Weniger Kindersitze', 'Moins de sièges enfant', 'Meno seggiolini'],
    'More child seats': ['Mehr Kindersitze', 'Plus de sièges enfant', 'Più seggiolini'],
    'Notes for the chauffeur': ['Hinweise für den Chauffeur', 'Remarques pour le chauffeur', 'Note per l’autista'],
    'Check your request': ['Anfrage prüfen', 'Vérifiez votre demande', 'Controlli la Sua richiesta'],
    'Nothing is booked yet. Dispatch confirms the car and the fare with you personally.': ['Noch ist nichts gebucht. Die Disposition bestätigt Fahrzeug und Preis persönlich mit Ihnen.', 'Rien n’est encore réservé. La centrale confirme la voiture et le prix avec vous personnellement.', 'Non è ancora prenotato nulla. La centrale conferma auto e tariffa con Lei di persona.'],
    'Edit': ['Bearbeiten', 'Modifier', 'Modifica'],
    'Passenger': ['Passagier', 'Passager', 'Passeggero'],
    'Vehicle & fare': ['Fahrzeug & Preis', 'Véhicule & prix', 'Veicolo e tariffa'],
    'Waiting (60 min at airports), luggage, tolls and vignette are inside the fare. VAT 8.1% is billed as a separate line. Online payments are handled by Stripe; this site never sees or stores card details.': ['Wartezeit (60 Min. an Flughäfen), Gepäck, Maut und Vignette sind im Preis enthalten. Die MwSt. von 8,1 % wird separat ausgewiesen. Online-Zahlungen wickelt Stripe ab; diese Website sieht und speichert keine Kartendaten.', 'L’attente (60 min dans les aéroports), les bagages, les péages et la vignette sont compris dans le prix. La TVA de 8,1 % figure sur une ligne séparée. Les paiements en ligne sont traités par Stripe ; ce site ne voit ni ne conserve les données de carte.', 'Attesa (60 min negli aeroporti), bagagli, pedaggi e vignetta sono compresi nella tariffa. L’IVA dell’8,1 % è indicata a parte. I pagamenti online sono gestiti da Stripe; questo sito non vede né conserva i dati della carta.'],
    'Continue to payment': ['Weiter zur Zahlung', 'Continuer vers le paiement', 'Continua al pagamento'],
    'Type': ['Art', 'Type', 'Tipo'],
    'Name': ['Name', 'Nom', 'Nome'],
    'Name sign': ['Namensschild', 'Pancarte', 'Cartello'],
    'Notes': ['Hinweise', 'Remarques', 'Note'],
    'Flight': ['Flug', 'Vol', 'Volo'],
    'Fare': ['Preis', 'Prix', 'Tariffa'],
    'Fare (net)': ['Preis (netto)', 'Prix (HT)', 'Tariffa (netto)'],
    'VAT 8.1%': ['MwSt. 8,1 %', 'TVA 8,1 %', 'IVA 8,1 %'],
    'Total': ['Total', 'Total', 'Totale'],
    'Total incl. VAT': ['Total inkl. MwSt.', 'Total TTC', 'Totale IVA incl.'],
    'Your fare': ['Ihr Preis', 'Votre prix', 'La Sua tariffa'],
    'Your fare · {car}': ['Ihr Preis · {car}', 'Votre prix · {car}', 'La Sua tariffa · {car}'],
    'From · Business class': ['Ab · Business-Klasse', 'Dès · classe Business', 'Da · classe Business'],
    'Quoted by dispatch': ['Offerte durch die Disposition', 'Sur devis de la centrale', 'Su preventivo della centrale'],
    'quoted by dispatch': ['offeriert durch die Disposition', 'chiffré par la centrale', 'quotato dalla centrale'],
    'On request': ['Auf Anfrage', 'Sur demande', 'Su richiesta'],
    'fixed fare + VAT': ['Festpreis zzgl. MwSt.', 'prix fixe HT', 'tariffa fissa + IVA'],
    'fixed fare · both ways + VAT': ['Festpreis · Hin- und Rückfahrt zzgl. MwSt.', 'prix fixe · aller-retour HT', 'tariffa fissa · andata e ritorno + IVA'],
    'Too small for {pax} passengers and {bags} bags': ['Zu klein für {pax} Passagiere und {bags} Gepäckstücke', 'Trop petite pour {pax} passagers et {bags} bagages', 'Troppo piccola per {pax} passeggeri e {bags} bagagli'],

    // Validation
    'Please enter a pick-up address.': ['Bitte geben Sie eine Abholadresse ein.', 'Veuillez saisir une adresse de prise en charge.', 'Inserisca un indirizzo di ritiro.'],
    'Please enter a destination.': ['Bitte geben Sie ein Ziel ein.', 'Veuillez saisir une destination.', 'Inserisca una destinazione.'],
    'Please choose a date.': ['Bitte wählen Sie ein Datum.', 'Veuillez choisir une date.', 'Scelga una data.'],
    'That date has already passed.': ['Dieses Datum liegt in der Vergangenheit.', 'Cette date est déjà passée.', 'Questa data è già passata.'],
    'Please choose a pick-up time.': ['Bitte wählen Sie eine Abholzeit.', 'Veuillez choisir une heure de prise en charge.', 'Scelga un orario di ritiro.'],
    'At least 1 passenger is required.': ['Mindestens 1 Passagier ist erforderlich.', 'Au moins 1 passager est requis.', 'È richiesto almeno 1 passeggero.'],
    'For more than 16 passengers, call dispatch.': ['Für mehr als 16 Passagiere rufen Sie bitte die Disposition an.', 'Pour plus de 16 passagers, appelez la centrale.', 'Per più di 16 passeggeri, chiami la centrale.'],
    'Please enter a whole number.': ['Bitte geben Sie eine ganze Zahl ein.', 'Veuillez indiquer un nombre entier.', 'Inserisca un numero intero.'],
    'Please enter the number of bags (0 is fine).': ['Bitte geben Sie die Anzahl Gepäckstücke ein (0 ist möglich).', 'Veuillez indiquer le nombre de bagages (0 est possible).', 'Indichi il numero di bagagli (anche 0).'],
    'Please choose a return date.': ['Bitte wählen Sie ein Rückfahrdatum.', 'Veuillez choisir une date de retour.', 'Scelga una data di ritorno.'],
    'The return must be after the outbound trip.': ['Die Rückfahrt muss nach der Hinfahrt liegen.', 'Le retour doit suivre l’aller.', 'Il ritorno deve essere successivo all’andata.'],
    'Please choose a return time.': ['Bitte wählen Sie eine Rückfahrzeit.', 'Veuillez choisir une heure de retour.', 'Scelga un orario di ritorno.'],
    'Please choose a car to continue.': ['Bitte wählen Sie ein Fahrzeug, um fortzufahren.', 'Veuillez choisir une voiture pour continuer.', 'Scelga un’auto per continuare.'],
    'That car is too small for your party. Please choose another.': ['Dieses Fahrzeug ist zu klein für Ihre Gruppe. Bitte wählen Sie ein anderes.', 'Cette voiture est trop petite pour votre groupe. Veuillez en choisir une autre.', 'Quest’auto è troppo piccola per il Suo gruppo. Ne scelga un’altra.'],
    'Please enter a first name.': ['Bitte geben Sie einen Vornamen ein.', 'Veuillez saisir un prénom.', 'Inserisca un nome.'],
    'Please enter a last name.': ['Bitte geben Sie einen Nachnamen ein.', 'Veuillez saisir un nom.', 'Inserisca un cognome.'],
    'Please enter a mobile number dispatch can reach.': ['Bitte geben Sie eine Mobilnummer an, unter der die Disposition Sie erreicht.', 'Veuillez saisir un numéro de mobile où la centrale peut vous joindre.', 'Inserisca un numero di cellulare a cui la centrale possa raggiungerLa.'],
    'Please enter a valid email address.': ['Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'Veuillez saisir une adresse e-mail valide.', 'Inserisca un indirizzo e-mail valido.'],
    'Please choose how you would like to pay.': ['Bitte wählen Sie, wie Sie bezahlen möchten.', 'Veuillez choisir comment vous souhaitez payer.', 'Scelga come desidera pagare.'],

    // Payment step
    'How would you like to pay?': ['Wie möchten Sie bezahlen?', 'Comment souhaitez-vous payer ?', 'Come desidera pagare?'],
    'Payment method': ['Zahlungsart', 'Moyen de paiement', 'Metodo di pagamento'],
    'Book with our team on WhatsApp: they confirm your chauffeur and arrange payment with you.': ['Buchen Sie bei unserem Team auf WhatsApp: Es bestätigt Ihren Chauffeur und vereinbart die Zahlung mit Ihnen.', 'Réservez auprès de notre équipe sur WhatsApp : elle confirme votre chauffeur et organise le paiement avec vous.', 'Prenoti con il nostro team su WhatsApp: conferma il Suo autista e concorda il pagamento con Lei.'],
    'Prefer to pay now? Pay securely by card or TWINT on the website.': ['Lieber jetzt bezahlen? Sicher per Karte oder TWINT auf der Website.', 'Vous préférez payer maintenant ? Payez en toute sécurité par carte ou TWINT sur le site.', 'Preferisce pagare ora? Paghi in sicurezza con carta o TWINT sul sito.'],
    'Book via WhatsApp': ['Via WhatsApp buchen', 'Réserver via WhatsApp', 'Prenota via WhatsApp'],
    'Our team confirms your chauffeur and arranges payment with you on WhatsApp.': ['Unser Team bestätigt Ihren Chauffeur und vereinbart die Zahlung mit Ihnen auf WhatsApp.', 'Notre équipe confirme votre chauffeur et organise le paiement avec vous sur WhatsApp.', 'Il nostro team conferma il Suo autista e concorda il pagamento con Lei su WhatsApp.'],
    'Recommended': ['Empfohlen', 'Recommandé', 'Consigliato'],
    'Or pay now on the website': ['Oder jetzt auf der Website bezahlen', 'Ou payez maintenant sur le site', 'Oppure paghi ora sul sito'],
    'Card': ['Karte', 'Carte', 'Carta'],
    'card': ['Karte', 'carte', 'carta'],
    'the chauffeur': ['den Chauffeur', 'le chauffeur', 'l’autista'],
    'CASH': ['BAR', 'ESPÈCES', 'CONTANTI'],
    'CARD': ['KARTE', 'CARTE', 'CARTA'],
    'Visa, Mastercard, American Express, Apple Pay or Google Pay, on Stripe\'s secure page.': ['Visa, Mastercard, American Express, Apple Pay oder Google Pay, auf der sicheren Seite von Stripe.', 'Visa, Mastercard, American Express, Apple Pay ou Google Pay, sur la page sécurisée de Stripe.', 'Visa, Mastercard, American Express, Apple Pay o Google Pay, sulla pagina sicura di Stripe.'],
    'Pay in the TWINT app on Stripe\'s secure page: a QR code on a computer, straight into the app on a phone.': ['Bezahlen Sie in der TWINT-App über die sichere Seite von Stripe: am Computer per QR-Code, am Handy direkt in der App.', 'Payez dans l’app TWINT via la page sécurisée de Stripe : un code QR sur ordinateur, directement dans l’app sur téléphone.', 'Paghi nell’app TWINT sulla pagina sicura di Stripe: un codice QR sul computer, direttamente nell’app sul telefono.'],
    'TWINT is limited to CHF 5,000 per payment. Please pay by card.': ['TWINT ist auf CHF 5’000 pro Zahlung begrenzt. Bitte bezahlen Sie per Karte.', 'TWINT est limité à CHF 5’000 par paiement. Veuillez payer par carte.', 'TWINT è limitato a CHF 5’000 per pagamento. Paghi con carta.'],
    'Pay the chauffeur': ['Beim Chauffeur bezahlen', 'Payer le chauffeur', 'Pagare l’autista'],
    'Cash, card or TWINT in the car, at the end of the journey.': ['Bar, Karte oder TWINT im Fahrzeug, am Ende der Fahrt.', 'Espèces, carte ou TWINT dans la voiture, à la fin du trajet.', 'Contanti, carta o TWINT in auto, alla fine del viaggio.'],
    'Hourly hire is settled after the journey.': ['Stundenweise Buchungen werden nach der Fahrt abgerechnet.', 'La location à l’heure est réglée après le trajet.', 'Il noleggio a ore si salda dopo il viaggio.'],
    'Groups and the Minibus are priced by dispatch. Please book via WhatsApp or pay the chauffeur.': ['Gruppen und den Minibus offeriert die Disposition. Bitte buchen Sie via WhatsApp oder bezahlen Sie beim Chauffeur.', 'Les groupes et le minibus sont chiffrés par la centrale. Réservez via WhatsApp ou payez le chauffeur.', 'Gruppi e minibus sono quotati dalla centrale. Prenoti via WhatsApp o paghi l’autista.'],
    'Online payment covers fixed fares up to 320 km. Dispatch prices this one, so please book via WhatsApp or pay the chauffeur.': ['Online-Zahlung gilt für Festpreise bis 320 km. Diese Fahrt offeriert die Disposition, bitte buchen Sie via WhatsApp oder bezahlen Sie beim Chauffeur.', 'Le paiement en ligne couvre les prix fixes jusqu’à 320 km. Celui-ci est chiffré par la centrale : réservez via WhatsApp ou payez le chauffeur.', 'Il pagamento online copre le tariffe fisse fino a 320 km. Questo è quotato dalla centrale: prenoti via WhatsApp o paghi l’autista.'],
    'Coming soon': ['Demnächst verfügbar', 'Bientôt disponible', 'Presto disponibile'],
    'Checking availability…': ['Verfügbarkeit wird geprüft…', 'Vérification de la disponibilité…', 'Verifica della disponibilità…'],
    'Please wait…': ['Bitte warten…', 'Veuillez patienter…', 'Attenda…'],
    'Continue on WhatsApp →': ['Weiter auf WhatsApp →', 'Continuer sur WhatsApp →', 'Continua su WhatsApp →'],
    'Pay {amount} by card →': ['{amount} per Karte bezahlen →', 'Payer {amount} par carte →', 'Paga {amount} con carta →'],
    'Pay {amount} with TWINT →': ['{amount} mit TWINT bezahlen →', 'Payer {amount} avec TWINT →', 'Paga {amount} con TWINT →'],
    'Send booking request →': ['Buchungsanfrage senden →', 'Envoyer la demande →', 'Invia la richiesta →'],
    'Choose a payment method': ['Zahlungsart wählen', 'Choisir un moyen de paiement', 'Scelga un metodo di pagamento'],
    'Payment cancelled. Nothing was charged. Choose a method to try again.': ['Zahlung abgebrochen. Es wurde nichts belastet. Wählen Sie eine Zahlungsart, um es erneut zu versuchen.', 'Paiement annulé. Rien n’a été débité. Choisissez un moyen pour réessayer.', 'Pagamento annullato. Nulla è stato addebitato. Scelga un metodo per riprovare.'],
    'The payment was not completed, so nothing was charged. Please try again, or choose another way to pay.': ['Die Zahlung wurde nicht abgeschlossen, es wurde nichts belastet. Bitte versuchen Sie es erneut oder wählen Sie eine andere Zahlungsart.', 'Le paiement n’a pas abouti, rien n’a été débité. Veuillez réessayer ou choisir un autre moyen de paiement.', 'Il pagamento non è stato completato, nulla è stato addebitato. Riprovi o scelga un altro metodo di pagamento.'],
    'We could not confirm the payment. If you were charged, dispatch will see it. Send the request on WhatsApp and mention it.': ['Wir konnten die Zahlung nicht bestätigen. Falls Ihnen etwas belastet wurde, sieht es die Disposition. Senden Sie die Anfrage auf WhatsApp und erwähnen Sie es.', 'Nous n’avons pas pu confirmer le paiement. Si vous avez été débité, la centrale le verra. Envoyez la demande sur WhatsApp en le mentionnant.', 'Non siamo riusciti a confermare il pagamento. Se Le è stato addebitato, la centrale lo vedrà. Invii la richiesta su WhatsApp e lo segnali.'],
    'Online payment is unavailable right now.': ['Online-Zahlung ist derzeit nicht verfügbar.', 'Le paiement en ligne est indisponible pour le moment.', 'Il pagamento online non è al momento disponibile.'],
    'Online payment is unavailable right now. You can still pay the chauffeur.': ['Online-Zahlung ist derzeit nicht verfügbar. Sie können weiterhin beim Chauffeur bezahlen.', 'Le paiement en ligne est indisponible pour le moment. Vous pouvez toujours payer le chauffeur.', 'Il pagamento online non è al momento disponibile. Può comunque pagare l’autista.'],
    'Online payment is not set up yet.': ['Online-Zahlung ist noch nicht eingerichtet.', 'Le paiement en ligne n’est pas encore disponible.', 'Il pagamento online non è ancora attivo.'],
    'Only one-way and return transfers can be paid online.': ['Online bezahlen lassen sich nur einfache Fahrten und Retourfahrten.', 'Seuls les allers simples et allers-retours peuvent être payés en ligne.', 'Online si possono pagare solo viaggi di sola andata e di andata e ritorno.'],
    'This route is quoted by dispatch and cannot be paid online yet.': ['Diese Strecke offeriert die Disposition; sie kann noch nicht online bezahlt werden.', 'Ce trajet est chiffré par la centrale et ne peut pas encore être payé en ligne.', 'Questa tratta è quotata dalla centrale e non può ancora essere pagata online.'],
    'Questions? Chat with dispatch on WhatsApp →': ['Fragen? Schreiben Sie der Disposition auf WhatsApp →', 'Des questions ? Écrivez à la centrale sur WhatsApp →', 'Domande? Scriva alla centrale su WhatsApp →'],
    'Request sent. We\'ve emailed a copy to {email}; dispatch confirms your chauffeur personally.': ['Anfrage gesendet. Wir haben eine Kopie an {email} gesendet; die Disposition bestätigt Ihren Chauffeur persönlich.', 'Demande envoyée. Nous avons envoyé une copie à {email} ; la centrale confirme votre chauffeur personnellement.', 'Richiesta inviata. Abbiamo inviato una copia a {email}; la centrale conferma il Suo autista di persona.'],
    'Request sent. Dispatch confirms your chauffeur personally, by email or WhatsApp.': ['Anfrage gesendet. Die Disposition bestätigt Ihren Chauffeur persönlich, per E-Mail oder WhatsApp.', 'Demande envoyée. La centrale confirme votre chauffeur personnellement, par e-mail ou WhatsApp.', 'Richiesta inviata. La centrale conferma il Suo autista di persona, via e-mail o WhatsApp.'],
    'We couldn\'t send your request. Please book via WhatsApp or call dispatch on +41 76 272 0909.': ['Wir konnten Ihre Anfrage nicht senden. Bitte buchen Sie via WhatsApp oder rufen Sie die Disposition an: +41 76 272 0909.', 'Nous n’avons pas pu envoyer votre demande. Réservez via WhatsApp ou appelez la centrale au +41 76 272 0909.', 'Non siamo riusciti a inviare la Sua richiesta. Prenoti via WhatsApp o chiami la centrale al +41 76 272 0909.'],
    'Too many attempts. Please try again later.': ['Zu viele Versuche. Bitte versuchen Sie es später erneut.', 'Trop de tentatives. Veuillez réessayer plus tard.', 'Troppi tentativi. Riprovi più tardi.'],
    'Chat on WhatsApp': ['Auf WhatsApp schreiben', 'Écrire sur WhatsApp', 'Scrivici su WhatsApp'],
    'Call dispatch ·': ['Disposition anrufen ·', 'Appeler la centrale ·', 'Chiama la centrale ·'],
    'WhatsApp opened with your booking. Press send there and our team takes it from here. If WhatsApp didn\'t open, use one of the options below.': ['WhatsApp wurde mit Ihrer Buchung geöffnet. Tippen Sie dort auf Senden, unser Team übernimmt ab da. Falls sich WhatsApp nicht geöffnet hat, nutzen Sie eine der Optionen unten.', 'WhatsApp s’est ouvert avec votre réservation. Appuyez sur Envoyer et notre équipe prend le relais. Si WhatsApp ne s’est pas ouvert, utilisez l’une des options ci-dessous.', 'WhatsApp si è aperto con la Sua prenotazione. Prema Invia e il nostro team se ne occupa. Se WhatsApp non si è aperto, usi una delle opzioni qui sotto.'],
    'WhatsApp opened, but our email copy didn\'t go through. Please press Send in WhatsApp, or use one of the options below.': ['WhatsApp wurde geöffnet, aber unsere E-Mail-Kopie ist nicht angekommen. Bitte tippen Sie in WhatsApp auf Senden oder nutzen Sie eine der Optionen unten.', 'WhatsApp s’est ouvert, mais notre copie par e-mail n’est pas partie. Appuyez sur Envoyer dans WhatsApp, ou utilisez l’une des options ci-dessous.', 'WhatsApp si è aperto, ma la nostra copia via e-mail non è partita. Prema Invia in WhatsApp, oppure usi una delle opzioni qui sotto.'],
    'WhatsApp opened with your booking. Press send there and our team takes it from here; we\'ve also emailed you a copy. If WhatsApp didn\'t open, use one of the options below.': ['WhatsApp wurde mit Ihrer Buchung geöffnet. Tippen Sie dort auf Senden, unser Team übernimmt ab da; eine Kopie haben wir Ihnen auch per E-Mail geschickt. Falls sich WhatsApp nicht geöffnet hat, nutzen Sie eine der Optionen unten.', 'WhatsApp s’est ouvert avec votre réservation. Appuyez sur Envoyer et notre équipe prend le relais ; nous vous avons aussi envoyé une copie par e-mail. Si WhatsApp ne s’est pas ouvert, utilisez l’une des options ci-dessous.', 'WhatsApp si è aperto con la Sua prenotazione. Prema Invia e il nostro team se ne occupa; Le abbiamo anche inviato una copia via e-mail. Se WhatsApp non si è aperto, usi una delle opzioni qui sotto.'],
    'Open WhatsApp': ['WhatsApp öffnen', 'Ouvrir WhatsApp', 'Apri WhatsApp'],
    'Email it instead': ['Stattdessen per E-Mail senden', 'L’envoyer par e-mail', 'Inviala via e-mail'],
    'Card and TWINT payments run on Stripe\'s own secure page. This site never sees card details.': ['Karten- und TWINT-Zahlungen laufen über die sichere Seite von Stripe. Diese Website sieht keine Kartendaten.', 'Les paiements par carte et TWINT passent par la page sécurisée de Stripe. Ce site ne voit jamais les données de carte.', 'I pagamenti con carta e TWINT avvengono sulla pagina sicura di Stripe. Questo sito non vede mai i dati della carta.'],
    'Payment received. Thank you.': ['Zahlung erhalten. Vielen Dank.', 'Paiement reçu. Merci.', 'Pagamento ricevuto. Grazie.'],
    'You\'re booked.': ['Ihre Buchung steht.', 'Votre réservation est confirmée.', 'La Sua prenotazione è confermata.'],
    'A confirmation email is on its way to': ['Eine Bestätigung ist unterwegs an', 'Un e-mail de confirmation est en route vers', 'Un’e-mail di conferma è in arrivo a'],
    'Dispatch already has your booking. The dispatcher who runs the journey confirms your chauffeur personally, day or night. Questions? Chat with dispatch on WhatsApp.': ['Die Disposition hat Ihre Buchung bereits. Der Disponent, der die Fahrt leitet, bestätigt Ihren Chauffeur persönlich, Tag und Nacht. Fragen? Schreiben Sie der Disposition auf WhatsApp.', 'La centrale a déjà votre réservation. Le répartiteur qui gère le trajet confirme votre chauffeur personnellement, de jour comme de nuit. Des questions ? Écrivez à la centrale sur WhatsApp.', 'La centrale ha già la Sua prenotazione. Il dispatcher che gestisce il viaggio conferma il Suo autista di persona, giorno e notte. Domande? Scriva alla centrale su WhatsApp.'],
    ', and dispatch already has your booking. The dispatcher who runs the journey confirms your chauffeur personally, day or night. Questions? Chat with dispatch on WhatsApp.': [', und die Disposition hat Ihre Buchung bereits. Der Disponent, der die Fahrt leitet, bestätigt Ihren Chauffeur persönlich, Tag und Nacht. Fragen? Schreiben Sie der Disposition auf WhatsApp.', ', et la centrale a déjà votre réservation. Le répartiteur qui gère le trajet confirme votre chauffeur personnellement, de jour comme de nuit. Des questions ? Écrivez à la centrale sur WhatsApp.', ', e la centrale ha già la Sua prenotazione. Il dispatcher che gestisce il viaggio conferma il Suo autista di persona, giorno e notte. Domande? Scriva alla centrale su WhatsApp.'],
    'Chat with dispatch on WhatsApp': ['Der Disposition auf WhatsApp schreiben', 'Écrire à la centrale sur WhatsApp', 'Scriva alla centrale su WhatsApp'],
    'WhatsApp opened. Press send there to reach dispatch.': ['WhatsApp ist geöffnet. Tippen Sie dort auf Senden, um die Disposition zu erreichen.', 'WhatsApp est ouvert. Appuyez sur Envoyer pour joindre la centrale.', 'WhatsApp è aperto. Prema Invia per raggiungere la centrale.'],
    'Your request': ['Ihre Anfrage', 'Votre demande', 'La Sua richiesta'],
    'Your booking': ['Ihre Buchung', 'Votre réservation', 'La Sua prenotazione'],
    '{amount} paid via {method} · reference {ref}. Stripe emails your receipt.': ['{amount} bezahlt via {method} · Referenz {ref}. Stripe sendet Ihnen die Quittung per E-Mail.', '{amount} payés via {method} · référence {ref}. Stripe vous envoie le reçu par e-mail.', '{amount} pagati tramite {method} · riferimento {ref}. Stripe Le invia la ricevuta via e-mail.'],

    // Composed values
    '{amount} + VAT': ['{amount} zzgl. MwSt.', '{amount} HT', '{amount} + IVA'],
    '{date} at {time}': ['{date} um {time}', '{date} à {time}', '{date} alle {time}'],
    '{n} hours': ['{n} Stunden', '{n} heures', '{n} ore'],
    '{n} hrs': ['{n} Std.', '{n} h', '{n} ore'],
    '{n} seats': ['{n} Sitzplätze', '{n} places', '{n} posti'],
    '{n} cases': ['{n} Koffer', '{n} valises', '{n} valigie'],
    '{n} pax': ['{n} Pers.', '{n} pers.', '{n} pers.'],
    '{n} bags': ['{n} Gepäckstücke', '{n} bagages', '{n} bagagli'],
    '{km} km from ZRH': ['{km} km ab ZRH', '{km} km depuis ZRH', '{km} km da ZRH'],

    // WhatsApp message to dispatch (in the visitor's language)
    'Book A Ride': ['Fahrt buchen', 'Réserver un trajet', 'Prenota una corsa'],
    'Name:': ['Name:', 'Nom :', 'Nome:'],
    'Contact No:': ['Telefonnummer:', 'Téléphone :', 'Telefono:'],
    'Pick-up Address:': ['Abholadresse:', 'Adresse de prise en charge :', 'Indirizzo di ritiro:'],
    'Drop-off Address:': ['Zieladresse:', 'Adresse de destination :', 'Indirizzo di destinazione:'],
    'Booking request': ['Buchungsanfrage', 'Demande de réservation', 'Richiesta di prenotazione'],
    'Booking request from z-als.ch': ['Buchungsanfrage von z-als.ch', 'Demande de réservation depuis z-als.ch', 'Richiesta di prenotazione da z-als.ch'],
    'total {amount} incl. VAT': ['total {amount} inkl. MwSt.', 'total {amount} TTC', 'totale {amount} IVA incl.'],
    'to be quoted by dispatch': ['wird von der Disposition offeriert', 'à chiffrer par la centrale', 'da quotare dalla centrale'],
    'PAID {amount} via {method} · Stripe ref {ref}': ['BEZAHLT {amount} via {method} · Stripe-Ref. {ref}', 'PAYÉ {amount} via {method} · réf. Stripe {ref}', 'PAGATO {amount} tramite {method} · rif. Stripe {ref}'],
    'pay the chauffeur (cash or card in the car)': ['beim Chauffeur bezahlen (bar oder Karte im Fahrzeug)', 'payer le chauffeur (espèces ou carte dans la voiture)', 'pagare l’autista (contanti o carta in auto)'],
    'to arrange with the Z-ALS team': ['mit dem Z-ALS Team zu vereinbaren', 'à convenir avec l’équipe Z-ALS', 'da concordare con il team Z-ALS'],
    'after dispatch confirms the fare': ['nachdem die Disposition den Preis bestätigt', 'après confirmation du prix par la centrale', 'dopo la conferma della tariffa dalla centrale'],

    // Countries in the address suggestions
    'Switzerland': ['Schweiz', 'Suisse', 'Svizzera'],
    'Germany': ['Deutschland', 'Allemagne', 'Germania'],
    'Austria': ['Österreich', 'Autriche', 'Austria'],
    'Italy': ['Italien', 'Italie', 'Italia'],
    'France': ['Frankreich', 'France', 'Francia'],
    'Czechia': ['Tschechien', 'Tchéquie', 'Cechia'],
    'Slovenia': ['Slowenien', 'Slovénie', 'Slovenia'],
    'Luxembourg': ['Luxemburg', 'Luxembourg', 'Lussemburgo'],

    // Payment portal (payments.z-als.ch, design/Pay.dc.html)
    'Pay Your Booking Online · Card or TWINT | Z-ALS': ['Buchung online bezahlen · Karte oder TWINT | Z-ALS', 'Payer votre réservation en ligne · carte ou TWINT | Z-ALS', 'Paga la prenotazione online · carta o TWINT | Z-ALS'],
    'Pay online': ['Online bezahlen', 'Payer en ligne', 'Paga online'],
    'Secure online payment': ['Sichere Online-Zahlung', 'Paiement en ligne sécurisé', 'Pagamento online sicuro'],
    'Pay your booking': ['Buchung bezahlen', 'Payer votre réservation', 'Paghi la sua prenotazione'],
    'Agreed a fare with our dispatch by phone or WhatsApp? Pay it here in a minute, by card or TWINT.': ['Haben Sie einen Preis mit unserer Disposition per Telefon oder WhatsApp vereinbart? Bezahlen Sie ihn hier in einer Minute, per Karte oder TWINT.', 'Vous avez convenu d’un tarif avec notre centrale par téléphone ou WhatsApp ? Réglez-le ici en une minute, par carte ou TWINT.', 'Ha concordato una tariffa con la nostra centrale per telefono o WhatsApp? La paghi qui in un minuto, con carta o TWINT.'],
    'Secure checkout by Stripe': ['Sichere Zahlung über Stripe', 'Paiement sécurisé par Stripe', 'Pagamento sicuro con Stripe'],
    "You pay on Stripe's own page. This site never sees card details.": ['Sie bezahlen auf der Seite von Stripe. Diese Website sieht nie Kartendaten.', 'Vous payez sur la page de Stripe. Ce site ne voit jamais les données de carte.', 'Paga sulla pagina di Stripe. Questo sito non vede mai i dati della carta.'],
    'Receipt by email': ['Quittung per E-Mail', 'Reçu par e-mail', 'Ricevuta via e-mail'],
    'Stripe emails your receipt the moment the payment goes through.': ['Stripe sendet Ihnen die Quittung, sobald die Zahlung durch ist.', 'Stripe vous envoie le reçu dès que le paiement est passé.', 'Stripe le invia la ricevuta appena il pagamento è andato a buon fine.'],
    'Dispatch is told at once': ['Die Disposition weiss es sofort', 'La centrale est prévenue aussitôt', 'La centrale è avvisata subito'],
    'Your payment reaches our dispatch straight away, day or night.': ['Ihre Zahlung erreicht unsere Disposition sofort, Tag und Nacht.', 'Votre paiement parvient aussitôt à notre centrale, de jour comme de nuit.', 'Il suo pagamento arriva subito alla nostra centrale, giorno e notte.'],
    'Questions about the amount? Our dispatch answers 24 / 7.': ['Fragen zum Betrag? Unsere Disposition ist rund um die Uhr erreichbar.', 'Une question sur le montant ? Notre centrale répond 24 h/24, 7 j/7.', 'Domande sull’importo? La nostra centrale risponde 24 ore su 24.'],
    'Checking your payment…': ['Ihre Zahlung wird geprüft …', 'Vérification de votre paiement…', 'Verifica del pagamento in corso…'],
    'This takes a few seconds.': ['Das dauert ein paar Sekunden.', 'Cela prend quelques secondes.', 'Ci vogliono pochi secondi.'],
    'Stripe emails your receipt. Dispatch has your payment and confirms your chauffeur personally.': ['Stripe sendet Ihnen die Quittung. Die Disposition hat Ihre Zahlung und bestätigt Ihren Chauffeur persönlich.', 'Stripe vous envoie le reçu. La centrale a reçu votre paiement et vous confirme votre chauffeur personnellement.', 'Stripe le invia la ricevuta. La centrale ha ricevuto il pagamento e le conferma personalmente l’autista.'],
    'Make another payment': ['Weitere Zahlung', 'Effectuer un autre paiement', 'Effettua un altro pagamento'],
    'Payment details': ['Zahlungsangaben', 'Détails du paiement', 'Dati del pagamento'],
    'Enter the amount dispatch gave you. All fields except the reference are required.': ['Geben Sie den Betrag ein, den Ihnen die Disposition genannt hat. Alle Felder ausser der Referenz sind Pflicht.', 'Saisissez le montant indiqué par la centrale. Tous les champs sauf la référence sont obligatoires.', 'Inserisca l’importo indicato dalla centrale. Tutti i campi tranne il riferimento sono obbligatori.'],
    'Payment cancelled. Nothing was charged.': ['Zahlung abgebrochen. Es wurde nichts belastet.', 'Paiement annulé. Rien n’a été débité.', 'Pagamento annullato. Nulla è stato addebitato.'],
    'Amount': ['Betrag', 'Montant', 'Importo'],
    '· incl. 8.1% VAT': ['· inkl. 8,1 % MwSt.', '· TVA 8,1 % incluse', '· IVA 8,1% inclusa'],
    'incl. 8.1% VAT': ['inkl. 8,1 % MwSt.', 'TVA 8,1 % incluse', 'IVA 8,1% inclusa'],
    'From CHF 20 to CHF 5,000': ['Von CHF 20 bis CHF 5000', 'De CHF 20 à CHF 5000', 'Da CHF 20 a CHF 5000'],
    'Booking reference': ['Buchungsreferenz', 'Référence de réservation', 'Riferimento della prenotazione'],
    'e.g. your name and travel date': ['z. B. Ihr Name und Reisedatum', 'p. ex. votre nom et la date du trajet', 'es. il suo nome e la data del viaggio'],
    'Full name': ['Vor- und Nachname', 'Nom complet', 'Nome e cognome'],
    '· for the receipt': ['· für die Quittung', '· pour le reçu', '· per la ricevuta'],
    'Pay with': ['Bezahlen mit', 'Payer par', 'Paga con'],
    'Prefer a bank transfer?': ['Lieber per Banküberweisung?', 'Vous préférez un virement bancaire ?', 'Preferisce un bonifico bancario?'],
    'Account holder': ['Kontoinhaber', 'Titulaire du compte', 'Intestatario del conto'],
    'Copy IBAN': ['IBAN kopieren', 'Copier l’IBAN', 'Copia IBAN'],
    'Copied': ['Kopiert', 'Copié', 'Copiato'],
    'Please use your booking reference as the payment message. Our dispatch confirms once the money arrives.': ['Bitte geben Sie Ihre Buchungsreferenz als Zahlungsmitteilung an. Unsere Disposition bestätigt, sobald das Geld eingegangen ist.', 'Veuillez indiquer votre référence de réservation comme communication. Notre centrale confirme dès réception du montant.', 'Indichi il riferimento della prenotazione come causale. La nostra centrale conferma appena riceve l’importo.'],
    'Bank account': ['Bankverbindung', 'Compte bancaire', 'Conto bancario'],
    'Pay with the TWINT app': ['Mit der TWINT-App bezahlen', 'Payer avec l’app TWINT', 'Paghi con l’app TWINT'],
    'TWINT QR code for Zurich-A.L.S GmbH': ['TWINT-QR-Code von Zurich-A.L.S GmbH', 'Code QR TWINT de Zurich-A.L.S GmbH', 'Codice QR TWINT di Zurich-A.L.S GmbH'],
    'Open TWINT on your phone, scan this code and enter the amount you agreed with dispatch. Please add your booking reference as the message.': ['Öffnen Sie TWINT auf Ihrem Handy, scannen Sie diesen Code und geben Sie den mit der Disposition vereinbarten Betrag ein. Bitte geben Sie Ihre Buchungsreferenz als Mitteilung an.', 'Ouvrez TWINT sur votre téléphone, scannez ce code et saisissez le montant convenu avec la centrale. Veuillez indiquer votre référence de réservation en message.', 'Apra TWINT sul telefono, scansioni questo codice e inserisca l’importo concordato con la centrale. Indichi il riferimento della prenotazione come messaggio.'],
    'To pay': ['Zu bezahlen', 'À payer', 'Da pagare'],
    "You continue to Stripe's secure page to pay.": ['Sie bezahlen auf der sicheren Seite von Stripe.', 'Vous payez sur la page sécurisée de Stripe.', 'Paga sulla pagina sicura di Stripe.'],
    'Please enter the amount you agreed with dispatch.': ['Bitte geben Sie den mit der Disposition vereinbarten Betrag ein.', 'Veuillez saisir le montant convenu avec la centrale.', 'Inserisca l’importo concordato con la centrale.'],
    'Please enter the amount in francs, e.g. 480 or 480.50.': ['Bitte geben Sie den Betrag in Franken ein, z. B. 480 oder 480.50.', 'Veuillez saisir le montant en francs, p. ex. 480 ou 480.50.', 'Inserisca l’importo in franchi, es. 480 o 480.50.'],
    'Online payments are from CHF 20 to CHF 5,000. For other amounts, please contact dispatch.': ['Online-Zahlungen sind von CHF 20 bis CHF 5000 möglich. Für andere Beträge kontaktieren Sie bitte die Disposition.', 'Les paiements en ligne vont de CHF 20 à CHF 5000. Pour un autre montant, contactez la centrale.', 'I pagamenti online vanno da CHF 20 a CHF 5000. Per altri importi contatti la centrale.'],
    'Please enter your full name.': ['Bitte geben Sie Ihren vollständigen Namen ein.', 'Veuillez saisir votre nom complet.', 'Inserisca nome e cognome.'],
    'Please check the amount and your details.': ['Bitte prüfen Sie den Betrag und Ihre Angaben.', 'Veuillez vérifier le montant et vos coordonnées.', 'Controlli l’importo e i suoi dati.'],
    "TWINT isn't available online right now. Please pay by card.": ['TWINT ist online gerade nicht verfügbar. Bitte bezahlen Sie per Karte.', 'TWINT n’est pas disponible en ligne pour le moment. Veuillez payer par carte.', 'TWINT non è disponibile online al momento. Paghi con carta.'],
    'Online payment is unavailable right now. Please call or WhatsApp dispatch.': ['Die Online-Zahlung ist gerade nicht verfügbar. Bitte rufen Sie die Disposition an oder schreiben Sie per WhatsApp.', 'Le paiement en ligne est indisponible pour le moment. Appelez la centrale ou écrivez-lui sur WhatsApp.', 'Il pagamento online non è disponibile al momento. Chiami la centrale o le scriva su WhatsApp.'],
    'The payment was not completed, so nothing was charged. Please try again.': ['Die Zahlung wurde nicht abgeschlossen, es wurde also nichts belastet. Bitte versuchen Sie es erneut.', 'Le paiement n’a pas abouti, rien n’a donc été débité. Veuillez réessayer.', 'Il pagamento non è stato completato, quindi nulla è stato addebitato. Riprovi.'],
    'We could not confirm the payment. If you were charged, dispatch will see it. Please call or WhatsApp dispatch if in doubt.': ['Wir konnten die Zahlung nicht bestätigen. Falls Ihnen etwas belastet wurde, sieht es die Disposition. Rufen Sie im Zweifel an oder schreiben Sie per WhatsApp.', 'Nous n’avons pas pu confirmer le paiement. Si vous avez été débité, la centrale le verra. En cas de doute, appelez-la ou écrivez-lui sur WhatsApp.', 'Non abbiamo potuto confermare il pagamento. Se le è stato addebitato, la centrale lo vedrà. In caso di dubbio chiami o scriva su WhatsApp.'],
    'Hello Z-ALS, I have a question about paying my booking.': ['Hallo Z-ALS, ich habe eine Frage zur Bezahlung meiner Buchung.', 'Bonjour Z-ALS, j’ai une question sur le paiement de ma réservation.', 'Buongiorno Z-ALS, ho una domanda sul pagamento della mia prenotazione.'],
    'Opening secure payment…': ['Sichere Zahlung wird geöffnet …', 'Ouverture du paiement sécurisé…', 'Apertura del pagamento sicuro…'],
    'Pay by card →': ['Per Karte bezahlen →', 'Payer par carte →', 'Paga con carta →'],
    'Pay with TWINT →': ['Mit TWINT bezahlen →', 'Payer avec TWINT →', 'Paga con TWINT →'],
    '{amount} paid by {method} · reference {ref}.': ['{amount} bezahlt per {method} · Referenz {ref}.', '{amount} payés par {method} · référence {ref}.', '{amount} pagati con {method} · riferimento {ref}.']
  };

  /* Strings with numbers the boards bake into markup, or fares.js composes. */
  const P = [
    [/^(\d+) hrs × CHF (\d+) \+ VAT$/, ['$1 Std. × CHF $2 zzgl. MwSt.', '$1 h × CHF $2 HT', '$1 ore × CHF $2 + IVA']],
    [/^(.+) · \+ 8\.1% VAT$/, ['$1 · zzgl. 8,1 % MwSt.', '$1 · + TVA 8,1 %', '$1 · + IVA 8,1 %']],
    [/^CHF (\d+) \/ hr$/, ['CHF $1 / Std.', 'CHF $1 / h', 'CHF $1 / ora']],
    [/^(\d+) seats · (\d+) cases$/, ['$1 Sitzplätze · $2 Koffer', '$1 places · $2 valises', '$1 posti · $2 valigie']],
    [/^(\d+) seats · rear cabin$/, ['$1 Sitzplätze · Fondraum', '$1 places · cabine arrière', '$1 posti · cabina posteriore']],
    [/^(\d+) seats$/, ['$1 Sitzplätze', '$1 places', '$1 posti']],
    [/^(\d+) cases$/, ['$1 Koffer', '$1 valises', '$1 valigie']],
    [/^STEP (\d+)$/, ['SCHRITT $1', 'ÉTAPE $1', 'PASSO $1']],
    [/^Z-ALS on (\w+)$/, ['Z-ALS auf $1', 'Z-ALS sur $1', 'Z-ALS su $1']]
  ];

  const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const write = l => { try { localStorage.setItem(KEY, l); } catch (e) {} };
  /* The homepage exists per language: /, /de, /fr, /it (tools/build.mjs pre-translates them and marks <html data-home>).
     Their language is the page's own; switching languages there goes to the other URL. The English root also sends a visitor
     who chose another language (or whose browser prefers one) to that page, in script, so crawlers keep seeing English. */
  const HOME = (() => { try { return document.documentElement.hasAttribute('data-home'); } catch (e) { return false; } })();
  const homeUrl = l => (l === 'en' ? '/' : '/' + l);
  function preferred() {
    let q = null;
    try { q = new URLSearchParams(location.search).get('lang'); } catch (e) {}
    if (q && LANGS.includes(q.toLowerCase())) return q.toLowerCase();
    const saved = read();
    if (saved && LANGS.includes(saved)) return saved;
    for (const l of navigator.languages || [navigator.language || '']) {
      const two = String(l).slice(0, 2).toLowerCase();
      if (LANGS.includes(two)) return two;
    }
    return 'en';
  }
  function pick() {
    if (HOME) {
      const own = document.documentElement.lang.slice(0, 2).toLowerCase();
      if (own === 'en' && location.pathname === '/') {
        const want = preferred();
        if (want !== 'en') {
          const rest = new URLSearchParams(location.search); rest.delete('lang');
          write(want);
          const r = rest.toString(); location.replace(homeUrl(want) + (r ? '?' + r : '') + location.hash);
        }
      }
      write(own);
      return own;
    }
    let q = null;
    try { q = new URLSearchParams(location.search).get('lang'); } catch (e) {}
    if (q && LANGS.includes(q.toLowerCase())) { write(q.toLowerCase()); return q.toLowerCase(); }
    const saved = read();
    if (saved && LANGS.includes(saved)) return saved;
    for (const l of navigator.languages || [navigator.language || '']) {
      const two = String(l).slice(0, 2).toLowerCase();
      if (LANGS.includes(two)) return two;
    }
    return 'en';
  }

  let lang = pick();
  let col = LANGS.indexOf(lang) - 1;

  function lookup(k) {
    const row = D[k];
    if (row) return row[col];
    for (const [re, out] of P) if (re.test(k)) return k.replace(re, out[col]);
    return null;
  }

  /* The translation of s (surrounding whitespace kept), or s itself; then {name} → vars.name. */
  function t(s, vars) {
    if (s == null) return s;
    let out = String(s);
    if (col >= 0) {
      const k = out.replace(/\s+/g, ' ').trim();
      const r = k ? lookup(k) : null;
      if (r != null) out = out.match(/^\s*/)[0] + r + out.match(/\s*$/)[0];
    }
    if (vars) out = out.replace(/\{(\w+)\}/g, (m, n) => (n in vars ? vars[n] : m));
    return out;
  }

  /* Static markup: text nodes and text attributes, each translated from its English
     original so the language can change in place. Bound values (dc-text, data-t-*) and
     dc-for rows are re-rendered by dc-lite instead; translate="no" keeps a subtree as is. */
  const ATTRS = ['placeholder', 'aria-label', 'alt', 'title'];
  const origText = new WeakMap(), origAttr = new WeakMap();
  const SKIP = { SCRIPT: 1, STYLE: 1, 'DC-TEXT': 1, 'DC-FOR': 1, TEMPLATE: 1 };
  function walk(root) {
    const base = root.body || root;
    const tw = document.createTreeWalker(base, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.nodeType === 1 && (SKIP[n.tagName] || n.getAttribute('translate') === 'no') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
    });
    for (let n = tw.currentNode; n; n = tw.nextNode()) {
      if (n.nodeType === 3) {
        if (!/[A-Za-z]/.test(n.nodeValue)) continue;
        if (!origText.has(n)) origText.set(n, n.nodeValue);
        const v = t(origText.get(n));
        if (n.nodeValue !== v) n.nodeValue = v;
      } else if (n.nodeType === 1) {
        let o = origAttr.get(n);
        for (const a of ATTRS) {
          if (!n.hasAttribute(a) || n.hasAttribute('data-t-' + a)) continue;
          if (!o) { o = {}; origAttr.set(n, o); }
          if (!(a in o)) o[a] = n.getAttribute(a);
          n.setAttribute(a, t(o[a]));
        }
        /* Links to the restored /en|de|fr|it/ pages open in the visitor's language. */
        if (n.tagName === 'A' && /^(https:\/\/z-als\.ch)?\/(en|de|fr|it)(\/|#|$)/.test(n.getAttribute('href') || '')) {
          n.setAttribute('href', n.getAttribute('href').replace(/^((?:https:\/\/z-als\.ch)?\/)(en|de|fr|it)/, '$1' + lang));
        }
        /* The portal is another origin, so the stored language doesn't reach it: the link carries it. */
        if (n.tagName === 'A' && /^https:\/\/payments\.z-als\.ch\/(\?lang=\w\w)?$/.test(n.getAttribute('href') || '')) {
          n.setAttribute('href', 'https://payments.z-als.ch/?lang=' + lang);
        }
      }
    }
    base.querySelectorAll('template').forEach(tpl => walk(tpl.content));
  }

  let title = null;
  function applyDoc() {
    document.documentElement.lang = lang;
    if (title == null) title = document.title;
    document.title = t(title);
  }

  function set(l) {
    if (!LANGS.includes(l) || l === lang) return;
    write(l);
    if (HOME) { location.assign(homeUrl(l) + location.search.replace(/[?&]lang=[^&]*/g, '').replace(/^&/, '?') + location.hash); return; }
    lang = l; col = LANGS.indexOf(l) - 1;
    applyDoc();
    walk(document);
    if (g.DC && g.DC.refresh) g.DC.refresh();
  }

  applyDoc();
  g.ZALS_I18N = {
    t, walk, set, LANGS,
    get lang() { return lang; },
    get locale() { return LOCALES[lang]; }
  };
})(window);
