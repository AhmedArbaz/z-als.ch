// "Z-ALS at a glance": the short, quotable fact sheet AI assistants and search snippets lift word for word.
// One source for the homepages (above the FAQ), the restored about pages and /llms.txt. Rates come from the
// price engine, like the FAQ, so they cannot drift; the phone number is plain text here on purpose (elsewhere
// it is only in tel:/wa.me links and JSON-LD).
await import(new URL('../../public/js/places.js', import.meta.url));
await import(new URL('../../public/js/fares.js', import.meta.url));
const Z = globalThis.ZALS;

export const PHONE = '+41 76 272 0909';
const FMT = { en: 'en-GB', de: 'de-CH', fr: 'fr-CH', it: 'it-CH' };

export const FACTS_HEADING = {
  en: { eyebrow: 'Z-ALS at a glance', h2: ['The short version, ', 'in facts'] },
  de: { eyebrow: 'Z-ALS auf einen Blick', h2: ['Das Wichtigste ', 'in Fakten'] },
  fr: { eyebrow: 'Z-ALS en bref', h2: ['L’essentiel, ', 'en faits'] },
  it: { eyebrow: 'Z-ALS in breve', h2: ['L’essenziale, ', 'in fatti'] },
};

/** [label, value] pairs in the page's language. */
export function facts(lang) {
  const n = (x, d = 2) => new Intl.NumberFormat(FMT[lang], { minimumFractionDigits: d, maximumFractionDigits: d }).format(x);
  const T = Z.TARIFF, vat = n(Z.VAT * 100, 1);
  const r = { biz: n(T.Business.km), prem: n(T.Premium.km), minB: n(T.Business.min, 0), minP: n(T.Premium.min, 0), hrB: n(T.Business.hr, 0), hrP: n(T.Premium.hr, 0), minH: Z.MIN_HOURS, maxH: Z.MAX_HOURS };
  return {
    en: [
      ['Company', 'Zurich-Airport Limousinen Services GmbH (Z-ALS), chauffeur and airport limousine service since 2004'],
      ['Base', 'Am Balsberg 36, 8302 Kloten, next to Zürich Airport'],
      ['Dispatch, 24/7', `${PHONE} (phone and WhatsApp) · info@z-als.ch`],
      ['Fleet', 'Mercedes E-Class, S-Class, GLE SUV, V-Class van (up to 7 passengers) and an electric saloon; minibus for groups up to 16'],
      ['Fixed fares', `CHF ${r.biz} per km in Business and Van, CHF ${r.prem} in Premium and SUV; minimum CHF ${r.minB} (CHF ${r.minP} Premium/SUV); plus ${vat}% VAT`],
      ['Hourly hire', `CHF ${r.hrB} per hour (CHF ${r.hrP} Premium/SUV), ${r.minH} to ${r.maxH} hours`],
      ['Included', 'Flight tracking, 60 minutes of free waiting after landing, meet & greet in arrivals, tolls and vignette, child seats'],
      ['Coverage', 'Zürich, Basel and Geneva airports to anywhere in Switzerland, and to Germany, France, Italy, Austria and Liechtenstein'],
    ],
    de: [
      ['Unternehmen', 'Zurich-Airport Limousinen Services GmbH (Z-ALS), Chauffeur- und Flughafen-Limousinenservice seit 2004'],
      ['Standort', 'Am Balsberg 36, 8302 Kloten, beim Flughafen Zürich'],
      ['Disposition, 24/7', `${PHONE} (Telefon und WhatsApp) · info@z-als.ch`],
      ['Flotte', 'Mercedes E-Klasse, S-Klasse, GLE SUV, V-Klasse Van (bis 7 Personen) und eine Elektro-Limousine; Kleinbus für Gruppen bis 16'],
      ['Festpreise', `CHF ${r.biz} pro km in Business und Van, CHF ${r.prem} in Premium und SUV; mindestens CHF ${r.minB} (CHF ${r.minP} Premium/SUV); zuzüglich ${vat}% MwSt.`],
      ['Stundenmiete', `CHF ${r.hrB} pro Stunde (CHF ${r.hrP} Premium/SUV), ${r.minH} bis ${r.maxH} Stunden`],
      ['Inbegriffen', 'Flugüberwachung, 60 Minuten Gratis-Wartezeit nach der Landung, Empfang in der Ankunftshalle, Maut und Vignette, Kindersitze'],
      ['Einsatzgebiet', 'Ab den Flughäfen Zürich, Basel und Genf in die ganze Schweiz sowie nach Deutschland, Frankreich, Italien, Österreich und Liechtenstein'],
    ],
    fr: [
      ['Entreprise', 'Zurich-Airport Limousinen Services GmbH (Z-ALS), service de chauffeur et de limousine aéroport depuis 2004'],
      ['Base', 'Am Balsberg 36, 8302 Kloten, à côté de l’aéroport de Zurich'],
      ['Dispatch, 24h/24', `${PHONE} (téléphone et WhatsApp) · info@z-als.ch`],
      ['Flotte', 'Mercedes Classe E, Classe S, SUV GLE, van Classe V (jusqu’à 7 passagers) et une berline électrique ; minibus pour les groupes jusqu’à 16'],
      ['Prix fixes', `CHF ${r.biz} par km en Business et Van, CHF ${r.prem} en Premium et SUV ; minimum CHF ${r.minB} (CHF ${r.minP} Premium/SUV) ; plus ${vat} % de TVA`],
      ['Location à l’heure', `CHF ${r.hrB} de l’heure (CHF ${r.hrP} Premium/SUV), de ${r.minH} à ${r.maxH} heures`],
      ['Inclus', 'Suivi du vol, 60 minutes d’attente offertes après l’atterrissage, accueil dans le hall des arrivées, péages et vignette, sièges enfant'],
      ['Couverture', 'Depuis les aéroports de Zurich, Bâle et Genève vers toute la Suisse, ainsi que l’Allemagne, la France, l’Italie, l’Autriche et le Liechtenstein'],
    ],
    it: [
      ['Azienda', 'Zurich-Airport Limousinen Services GmbH (Z-ALS), servizio di autista e limousine aeroportuale dal 2004'],
      ['Sede', 'Am Balsberg 36, 8302 Kloten, accanto all’aeroporto di Zurigo'],
      ['Centrale, 24/7', `${PHONE} (telefono e WhatsApp) · info@z-als.ch`],
      ['Flotta', 'Mercedes Classe E, Classe S, SUV GLE, van Classe V (fino a 7 passeggeri) e una berlina elettrica; minibus per gruppi fino a 16'],
      ['Tariffe fisse', `CHF ${r.biz} al km in Business e Van, CHF ${r.prem} in Premium e SUV; minimo CHF ${r.minB} (CHF ${r.minP} Premium/SUV); più IVA ${vat}%`],
      ['Noleggio orario', `CHF ${r.hrB} all’ora (CHF ${r.hrP} Premium/SUV), da ${r.minH} a ${r.maxH} ore`],
      ['Incluso', 'Monitoraggio del volo, 60 minuti di attesa gratuita dopo l’atterraggio, accoglienza nella hall arrivi, pedaggi e vignetta, seggiolini per bambini'],
      ['Copertura', 'Dagli aeroporti di Zurigo, Basilea e Ginevra in tutta la Svizzera e verso Germania, Francia, Italia, Austria e Liechtenstein'],
    ],
  }[lang];
}
