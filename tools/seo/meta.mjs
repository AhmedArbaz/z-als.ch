// Page metadata written by the keyword research (docs/seo/keyword-plan.md): one primary keyword per URL, a title of
// at most 60 characters led by that keyword, a description of 120-155 characters, native in each language.
// Board pages read PAGES/HOME below; the restored pages get theirs from tools/seo/restored-meta.json (seo.mjs).
export const SITE = 'https://z-als.ch';
export const LANGS = ['en', 'de', 'fr', 'it'];
export const homePath = l => (l === 'en' ? '/' : `/${l}`);
export const OG_LOCALE = { en: 'en_GB', de: 'de_CH', fr: 'fr_CH', it: 'it_CH' };

export const HOME = {
  en: {
    title: 'Zurich Airport Limousine Service & Chauffeur | Z-ALS',
    description: 'Zurich Airport limousine and chauffeur service since 2004: private airport transfers and limo service in Mercedes cars. Fixed fares from CHF 120, 24/7.',
  },
  de: {
    title: 'Limousinenservice Flughafen Zürich & Transfer | Z-ALS',
    description: 'Limousinenservice ab Flughafen Zürich seit 2004: Flughafentransfer mit Chauffeur in Mercedes-Limousinen in die ganze Schweiz. Festpreis ab CHF 120, 24/7.',
  },
  fr: {
    title: 'Transfert aéroport Zurich & chauffeur privé | Z-ALS',
    description: 'Chauffeur privé depuis les aéroports de Zurich, Bâle et Genève dans toute la Suisse. Tarifs fixes dès CHF 120, vol suivi, 24 h/24. Réservez en ligne.',
  },
  it: {
    title: 'Transfer aeroporto Zurigo & autista privato | Z-ALS',
    description: 'Autista privato dagli aeroporti di Zurigo, Basilea e Ginevra in tutta la Svizzera. Tariffe fisse da CHF 120, volo monitorato, 24 ore su 24. Prenota online.',
  },
};

export const BOARDS = {
  '/quote': {
    title: 'Request a Quote · Chauffeur Transfers Switzerland | Z-ALS',
    description: 'Request a chauffeur quote online: airport transfers and long-distance trips across Switzerland, fixed fares from CHF 120. Pay by card, TWINT or in the car.',
  },
  '/pay': {
    title: 'Pay Your Booking Online · Card or TWINT | Z-ALS',
    description: 'Pay the fare you agreed with Z-ALS dispatch: enter the amount and pay securely by card or TWINT through Stripe. Chauffeur service from Zurich Airport.',
  },
  '/legal': {
    title: 'Imprint, Privacy & Terms | Z-ALS',
    description: 'Imprint, privacy notice and terms of Zurich-Airport Limousinen Services GmbH (Z-ALS), Am Balsberg 36, 8302 Kloten, Switzerland.',
  },
};
