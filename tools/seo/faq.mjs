// The homepage FAQ in four languages. Every answer restates what the Terms (design/Legal.dc.html) and the price
// engine (public/js/fares.js) already say; numbers are read from the engine, not typed, so they cannot drift.
// The same list becomes the visible section and the FAQPage JSON-LD (tools/build.mjs), so the two always match.

await import(new URL('../../public/js/places.js', import.meta.url));
await import(new URL('../../public/js/fares.js', import.meta.url));
const Z = globalThis.ZALS;

const fare = (dest, cls = 'Business') => Z.quoteFor({ tripType: 'oneway', pickup: 'Zürich Airport · ZRH', dest, vehicle: cls }).net;
const FMT = { en: 'en-GB', de: 'de-CH', fr: 'fr-CH', it: 'it-CH' };
const chf = (n, lang) => 'CHF ' + new Intl.NumberFormat(FMT[lang]).format(n);
const t = d => { const r = Z.FARES[d]; return r.t.replace(':', 'h'); };

export function homeFaq(lang) {
  const c = n => chf(n, lang);
  const F = {
    zurich: fare('Zürich city'), luzern: fare('Luzern'), basel: fare('Basel'), bern: fare('Bern'), davos: fare('Davos'),
    interlaken: fare('Interlaken'), moritz: fare('St. Moritz'), zermatt: fare('Zermatt'), vat: +(Z.VAT * 100).toFixed(1),
    kmBiz: Z.TARIFF.Business.km.toFixed(2), kmPrem: Z.TARIFF.Premium.km.toFixed(2),
    hrBiz: Z.TARIFF.Business.hr, hrPrem: Z.TARIFF.Premium.hr, minH: Z.MIN_HOURS, maxH: Z.MAX_HOURS,
  };
  const Q = {
    en: [
      ['What does a limousine service from Zurich Airport cost?',
        `Fares from Zürich Airport are fixed and shown before you send anything. In the Business class (Mercedes E-Class or equivalent, up to three passengers): ${c(F.zurich)} to Zürich city, ${c(F.luzern)} to Lucerne, ${c(F.basel)} to Basel, ${c(F.bern)} to Bern, ${c(F.davos)} to Davos, ${c(F.interlaken)} to Interlaken, ${c(F.moritz)} to St. Moritz and ${c(F.zermatt)} to Zermatt, plus ${F.vat}% VAT. Premium (S-Class) and SUV are charged at CHF ${F.kmPrem} per kilometre instead of CHF ${F.kmBiz}.`],
      ['What is included in the fare?',
        'Waiting, luggage handling, tolls and the Swiss motorway vignette are included, and so are child seats fitted before the journey, sixty minutes of waiting after your flight lands and passenger insurance. Nothing in this list is added to the invoice afterwards; VAT is shown as its own line.'],
      ['What happens if my flight is delayed?',
        'Give us your flight number when you book. We track the inbound flight and move the pick-up time with it at no charge. Waiting beyond the included sixty minutes is charged pro rata at the hourly rate of your class, and only after we have contacted you.'],
      ['Where does the airport limo meet me at Zurich Airport?',
        'Your chauffeur waits inside the arrivals hall at Zürich Airport in Kloten. The booking form has a field for the name on the sign, and our dispatch confirms the details with you by email or WhatsApp before you travel.'],
      ['Which cars can I book?',
        'Business (Mercedes E-Class or equivalent, 3 passengers), Premium (S-Class, 3), SUV (Mercedes GLE, 4), Business Van (V-Class, up to 7 passengers and 7 cases) and a fully electric saloon. Groups of up to 16 travel by minibus, quoted by dispatch. Cars are booked by class, so you receive the stated model or an equivalent.'],
      ['Can I hire a personal chauffeur in Zurich by the hour?',
        `Yes. Hourly hire starts at ${F.minH} hours and runs up to ${F.maxH}: a personal chauffeur and car at ${c(F.hrBiz)} per hour in the Business class, ${c(F.hrPrem)} in Premium and SUV, plus ${F.vat}% VAT. The booking form shows an estimate, and our dispatch confirms it personally.`],
      ['How can I pay?',
        'Online by card or TWINT (processed by Stripe), to the chauffeur on the day, or arranged with our team on WhatsApp. Corporate and contract clients are invoiced monthly.'],
      ['Do you drive to Davos, St. Moritz and Zermatt?',
        `Yes. They are fixed fares from Zürich Airport, about ${t('Davos')} to Davos and ${t('St. Moritz')} to St. Moritz. Zermatt is car-free: the drive ends at Täsch, ${t('Zermatt')} from the airport, and the last leg is by shuttle train. In winter we confirm the departure the evening before, against the forecast and the pass status.`],
      ['Do you also collect from Basel and Geneva airports?',
        'Yes. A pick-up at Basel or Geneva airport, or at any address in Switzerland, gets a fixed fare in the booking form, by road distance. Journeys over 320 km are quoted per route by dispatch, with tolls, night hours and driver rest named in the quote.'],
      ['Can I change or cancel a booking?',
        'Yes. Tell dispatch by phone, WhatsApp or email as early as possible. Any cancellation charge is stated when your booking is confirmed.'],
    ],
    de: [
      ['Was kostet ein Limousinenservice ab Flughafen Zürich?',
        `Die Preise ab Flughafen Zürich sind Festpreise und stehen fest, bevor Sie etwas senden. In der Business-Klasse (Mercedes E-Klasse oder gleichwertig, bis zu drei Personen): ${c(F.zurich)} in die Stadt Zürich, ${c(F.luzern)} nach Luzern, ${c(F.basel)} nach Basel, ${c(F.bern)} nach Bern, ${c(F.davos)} nach Davos, ${c(F.interlaken)} nach Interlaken, ${c(F.moritz)} nach St. Moritz und ${c(F.zermatt)} nach Zermatt, jeweils zuzüglich ${F.vat}% MwSt. Premium (S-Klasse) und SUV werden mit CHF ${F.kmPrem} statt CHF ${F.kmBiz} pro Kilometer berechnet.`],
      ['Was ist im Preis enthalten?',
        'Wartezeit, Gepäckhandling, Maut und die Schweizer Autobahnvignette sind inbegriffen, ebenso Kindersitze, die vor der Fahrt montiert werden, sechzig Minuten Wartezeit nach der Landung und die Passagierversicherung. Nichts davon wird nachträglich in Rechnung gestellt; die MwSt. steht auf einer eigenen Zeile.'],
      ['Was passiert, wenn mein Flug Verspätung hat?',
        'Nennen Sie uns bei der Buchung Ihre Flugnummer. Wir verfolgen den ankommenden Flug und verschieben die Abholzeit ohne Aufpreis mit. Wartezeit über die inbegriffenen sechzig Minuten hinaus wird anteilig zum Stundensatz Ihrer Klasse berechnet, und erst nachdem wir Sie kontaktiert haben.'],
      ['Wo holt mich der Chauffeur am Flughafen Zürich ab?',
        'Ihr Chauffeur wartet in der Ankunftshalle des Flughafens Zürich in Kloten. Im Buchungsformular können Sie den Namen für das Schild angeben, und unsere Disposition bestätigt Ihnen die Details vor der Reise per E-Mail oder WhatsApp.'],
      ['Welche Fahrzeuge kann ich buchen?',
        'Business (Mercedes E-Klasse oder gleichwertig, 3 Personen), Premium (S-Klasse, 3), SUV (Mercedes GLE, 4), Business Van (V-Klasse, bis zu 7 Personen und 7 Koffer) und eine vollelektrische Limousine. Gruppen bis 16 Personen reisen im Minibus, den die Disposition offeriert. Fahrzeuge werden nach Klasse gebucht, Sie erhalten also das genannte Modell oder ein gleichwertiges.'],
      ['Kann ich in Zürich einen persönlichen Chauffeur stundenweise mieten?',
        `Ja. Die Stundenbuchung beginnt bei ${F.minH} Stunden und geht bis ${F.maxH}: persönlicher Chauffeur und Fahrzeug für ${c(F.hrBiz)} pro Stunde in der Business-Klasse, ${c(F.hrPrem)} in Premium und SUV, zuzüglich ${F.vat}% MwSt. Das Buchungsformular zeigt eine Schätzung, die unsere Disposition persönlich bestätigt.`],
      ['Wie kann ich bezahlen?',
        'Online mit Karte oder TWINT (über Stripe), beim Chauffeur am Tag der Fahrt oder in Absprache mit unserem Team über WhatsApp. Firmen- und Vertragskunden erhalten monatlich eine Rechnung.'],
      ['Fahren Sie nach Davos, St. Moritz und Zermatt?',
        `Ja. Es sind Festpreise ab Flughafen Zürich, rund ${t('Davos')} nach Davos und ${t('St. Moritz')} nach St. Moritz. Zermatt ist autofrei: Die Fahrt endet in Täsch, ${t('Zermatt')} ab dem Flughafen, die letzte Etappe legen Sie mit dem Shuttlezug zurück. Im Winter bestätigen wir die Abfahrt am Vorabend, anhand von Wetterprognose und Passstatus.`],
      ['Holen Sie auch an den Flughäfen Basel und Genf ab?',
        'Ja. Abholungen an den Flughäfen Basel und Genf oder an jeder Adresse in der Schweiz erhalten im Buchungsformular einen Festpreis nach Strassendistanz. Fahrten über 320 km offeriert die Disposition pro Strecke, mit Maut, Nachtstunden und Fahrerruhezeit im Angebot ausgewiesen.'],
      ['Kann ich eine Buchung ändern oder stornieren?',
        'Ja. Teilen Sie es unserer Disposition so früh wie möglich telefonisch, per WhatsApp oder E-Mail mit. Eine allfällige Stornogebühr wird bei der Bestätigung Ihrer Buchung genannt.'],
    ],
    fr: [
      ['Combien coûte un service de limousine depuis l’aéroport de Zurich ?',
        `Les tarifs depuis l’aéroport de Zurich sont fixes et affichés avant tout envoi. En classe Business (Mercedes Classe E ou équivalent, jusqu’à trois passagers) : ${c(F.zurich)} vers Zurich, ${c(F.luzern)} vers Lucerne, ${c(F.basel)} vers Bâle, ${c(F.bern)} vers Berne, ${c(F.davos)} vers Davos, ${c(F.interlaken)} vers Interlaken, ${c(F.moritz)} vers Saint-Moritz et ${c(F.zermatt)} vers Zermatt, TVA de ${F.vat}% en sus. Premium (Classe S) et SUV sont facturés CHF ${F.kmPrem} le kilomètre au lieu de CHF ${F.kmBiz}.`],
      ['Qu’est-ce qui est compris dans le tarif ?',
        'L’attente, la manutention des bagages, les péages et la vignette autoroutière suisse sont compris, de même que les sièges enfant installés avant le trajet, soixante minutes d’attente après l’atterrissage et l’assurance des passagers. Rien de cette liste n’est ajouté à la facture après coup ; la TVA figure sur une ligne distincte.'],
      ['Que se passe-t-il si mon vol a du retard ?',
        'Communiquez-nous votre numéro de vol à la réservation. Nous suivons le vol à l’arrivée et décalons l’heure de prise en charge sans frais. L’attente au-delà des soixante minutes comprises est facturée au prorata du tarif horaire de votre classe, et seulement après que nous vous avons contacté.'],
      ['Où ma limousine avec chauffeur m’attend-elle à l’aéroport de Zurich ?',
        'Votre chauffeur vous attend dans le hall des arrivées de l’aéroport de Zurich, à Kloten. Le formulaire de réservation permet d’indiquer le nom à inscrire sur la pancarte, et notre dispatch vous confirme les détails par e-mail ou WhatsApp avant le voyage.'],
      ['Quels véhicules puis-je réserver ?',
        'Business (Mercedes Classe E ou équivalent, 3 passagers), Premium (Classe S, 3), SUV (Mercedes GLE, 4), Business Van (Classe V, jusqu’à 7 passagers et 7 valises) et une berline entièrement électrique. Les groupes jusqu’à 16 personnes voyagent en minibus, sur devis du dispatch. Les véhicules sont réservés par classe : vous recevez le modèle indiqué ou un modèle équivalent.'],
      ['Puis-je réserver un chauffeur privé à Zurich à l’heure ?',
        `Oui. La mise à disposition commence à ${F.minH} heures et va jusqu’à ${F.maxH} : chauffeur privé et véhicule à ${c(F.hrBiz)} de l’heure en classe Business, ${c(F.hrPrem)} en Premium et SUV, TVA de ${F.vat}% en sus. Le formulaire de réservation affiche une estimation, que notre dispatch confirme personnellement.`],
      ['Comment puis-je payer ?',
        'En ligne par carte ou TWINT (via Stripe), auprès du chauffeur le jour du trajet, ou convenu avec notre équipe sur WhatsApp. Les clients entreprises et contrats sont facturés chaque mois.'],
      ['Conduisez-vous à Davos, Saint-Moritz et Zermatt ?',
        `Oui. Ce sont des tarifs fixes depuis l’aéroport de Zurich, environ ${t('Davos')} jusqu’à Davos et ${t('St. Moritz')} jusqu’à Saint-Moritz. Zermatt est sans voitures : le trajet s’arrête à Täsch, à ${t('Zermatt')} de l’aéroport, et le dernier tronçon se fait en train-navette. En hiver, nous confirmons le départ la veille au soir, selon la météo et l’état des cols.`],
      ['Prenez-vous aussi en charge aux aéroports de Bâle et de Genève ?',
        'Oui. Une prise en charge aux aéroports de Bâle ou de Genève, ou à toute adresse en Suisse, reçoit un prix fixe dans le formulaire de réservation, selon la distance routière. Les trajets de plus de 320 km sont chiffrés par trajet par le dispatch, avec péages, heures de nuit et repos du chauffeur indiqués dans le devis.'],
      ['Puis-je modifier ou annuler une réservation ?',
        'Oui. Prévenez notre dispatch le plus tôt possible par téléphone, WhatsApp ou e-mail. Les éventuels frais d’annulation sont indiqués lors de la confirmation de votre réservation.'],
    ],
    it: [
      ['Quanto costa un servizio limousine dall’aeroporto di Zurigo?',
        `Le tariffe dall’aeroporto di Zurigo sono fisse e indicate prima di inviare qualsiasi cosa. In classe Business (Mercedes Classe E o equivalente, fino a tre passeggeri): ${c(F.zurich)} per Zurigo città, ${c(F.luzern)} per Lucerna, ${c(F.basel)} per Basilea, ${c(F.bern)} per Berna, ${c(F.davos)} per Davos, ${c(F.interlaken)} per Interlaken, ${c(F.moritz)} per St. Moritz e ${c(F.zermatt)} per Zermatt, più IVA al ${F.vat}%. Premium (Classe S) e SUV costano CHF ${F.kmPrem} al chilometro invece di CHF ${F.kmBiz}.`],
      ['Che cosa comprende la tariffa?',
        'Attesa, gestione dei bagagli, pedaggi e vignetta autostradale svizzera sono compresi, così come i seggiolini per bambini montati prima del viaggio, sessanta minuti di attesa dopo l’atterraggio e l’assicurazione dei passeggeri. Nulla di questo elenco viene aggiunto in fattura in seguito; l’IVA compare su una riga a parte.'],
      ['Che cosa succede se il mio volo è in ritardo?',
        'Ci comunichi il numero del volo al momento della prenotazione. Seguiamo il volo in arrivo e spostiamo l’orario di ritiro senza costi. L’attesa oltre i sessanta minuti inclusi viene addebitata pro rata alla tariffa oraria della Sua classe, e solo dopo che L’abbiamo contattata.'],
      ['Dove mi aspetta l’autista della limousine all’aeroporto di Zurigo?',
        'L’autista La attende nella sala arrivi dell’aeroporto di Zurigo, a Kloten. Il modulo di prenotazione prevede un campo per il nome da riportare sul cartello, e la nostra centrale operativa Le conferma i dettagli via e-mail o WhatsApp prima del viaggio.'],
      ['Quali auto posso prenotare?',
        'Business (Mercedes Classe E o equivalente, 3 passeggeri), Premium (Classe S, 3), SUV (Mercedes GLE, 4), Business Van (Classe V, fino a 7 passeggeri e 7 valigie) e una berlina completamente elettrica. I gruppi fino a 16 persone viaggiano in minibus, con preventivo della centrale. Le auto si prenotano per classe: riceve il modello indicato o uno equivalente.'],
      ['Posso prenotare un autista privato a Zurigo a ore?',
        `Sì. Il noleggio a ore parte da ${F.minH} ore e arriva a ${F.maxH}: autista privato e auto a ${c(F.hrBiz)} l’ora in classe Business, ${c(F.hrPrem)} in Premium e SUV, più IVA al ${F.vat}%. Il modulo di prenotazione mostra una stima, che la nostra centrale conferma personalmente.`],
      ['Come posso pagare?',
        'Online con carta o TWINT (tramite Stripe), all’autista il giorno del viaggio, oppure in accordo con il nostro team su WhatsApp. I clienti aziendali e con contratto ricevono fattura mensile.'],
      ['Andate a Davos, St. Moritz e Zermatt?',
        `Sì. Sono tariffe fisse dall’aeroporto di Zurigo, circa ${t('Davos')} per Davos e ${t('St. Moritz')} per St. Moritz. Zermatt è senza auto: il viaggio termina a Täsch, a ${t('Zermatt')} dall’aeroporto, e l’ultimo tratto si fa con il treno navetta. In inverno confermiamo la partenza la sera prima, in base alle previsioni e allo stato dei passi.`],
      ['Ritirate anche agli aeroporti di Basilea e Ginevra?',
        'Sì. Un ritiro agli aeroporti di Basilea o Ginevra, o a qualsiasi indirizzo in Svizzera, riceve una tariffa fissa nel modulo di prenotazione, in base alla distanza stradale. I viaggi oltre 320 km vengono quotati per tratta dalla centrale, con pedaggi, ore notturne e riposo dell’autista indicati nel preventivo.'],
      ['Posso modificare o annullare una prenotazione?',
        'Sì. Lo comunichi alla nostra centrale il prima possibile per telefono, WhatsApp o e-mail. L’eventuale penale di annullamento viene indicata alla conferma della prenotazione.'],
    ],
  };
  return Q[lang].map(([q, a]) => ({ q, a }));
}

export const FAQ_HEADING = {
  en: { eyebrow: 'Questions', h2: ['Zurich airport transfers: ', 'questions we are asked'] },
  de: { eyebrow: 'Fragen', h2: ['Flughafentransfer Zürich: ', 'häufige Fragen'] },
  fr: { eyebrow: 'Questions', h2: ['Transfert aéroport Zurich : ', 'vos questions'] },
  it: { eyebrow: 'Domande', h2: ['Transfer aeroporto Zurigo: ', 'le domande più frequenti'] },
};
