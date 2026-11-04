/* The Z-ALS destination directory and published route table, shared by the pages
 * and server.mjs.
 *
 * Ported from z-als.ch (jalexzander662-web/z-als @ 9a65bb9): the data verbatim from
 * src/lib/places.data.ts, the lookups line for line from src/lib/places.ts. Every
 * kilometre is road distance from Zürich Airport. When z-als.ch's directory changes,
 * re-port it rather than editing rows here, so the two sites keep one price list.
 *
 * Loaded by a <script> tag before fares.js (sets window.ZALS_PLACES) and by `import`
 * in Node. The server calls these with untrusted input, which is why lookups go
 * through Map (no '__proto__' or 'constructor' off the prototype chain) and queries
 * are capped at 64 characters. */
(function (g) {
  'use strict';

  /* Distances and drive times from Zürich Airport. These published routes win over
     the directory, so their hand-checked drive times are what gets billed. */
  const FARES = {
    'Zürich city': { km: 13, t: '0:15' }, 'Winterthur': { km: 22, t: '0:20' }, 'Zug': { km: 45, t: '0:35' },
    'Luzern': { km: 68, t: '0:55' }, 'Konstanz': { km: 85, t: '1:00' }, 'Basel': { km: 90, t: '1:05' },
    'Vaduz': { km: 110, t: '1:15' }, 'Bregenz': { km: 130, t: '1:25' }, 'Mulhouse': { km: 130, t: '1:30' },
    'Bern': { km: 135, t: '1:35' }, 'Andermatt': { km: 145, t: '1:50' }, 'Klosters': { km: 155, t: '2:05' },
    'Davos': { km: 160, t: '2:10' }, 'Interlaken': { km: 165, t: '2:00' }, 'Freiburg': { km: 165, t: '1:50' },
    'Lech': { km: 200, t: '2:20' }, 'Strasbourg': { km: 200, t: '2:15' }, 'Lugano': { km: 205, t: '2:30' },
    'St. Moritz': { km: 215, t: '2:55' }, 'Stuttgart': { km: 220, t: '2:20' }, 'Gstaad': { km: 230, t: '2:50' },
    'Como': { km: 235, t: '2:35' }, 'Lausanne': { km: 240, t: '2:30' }, 'Zermatt': { km: 250, t: '2:40' },
    'Milano': { km: 280, t: '3:00' }, 'Innsbruck': { km: 280, t: '3:00' }, 'Genève': { km: 285, t: '3:00' },
    'Verbier': { km: 290, t: '3:15' }, 'München': { km: 310, t: '3:30' }, 'Bolzano': { km: 320, t: '3:30' }
  };

  /* ── Data: [zip, name, canton or country code, kmFromZRH, searchAliases?] ── */

  const ALIAS = {
    'zurich': 'Zürich city', 'zürich': 'Zürich city', 'zurich city': 'Zürich city', 'zürich city': 'Zürich city', 'kloten': 'Zürich city',
    'geneva': 'Genève', 'geneve': 'Genève', 'genève': 'Genève', 'genf': 'Genève', 'ginevra': 'Genève',
    'munich': 'München', 'muenchen': 'München', 'münchen': 'München',
    'milan': 'Milano', 'mailand': 'Milano',
    'vienna': 'Wien', 'prague': 'Praha', 'prag': 'Praha',
    'venice': 'Venezia', 'venedig': 'Venezia',
    'st moritz': 'St. Moritz', 'sankt moritz': 'St. Moritz', 'saint moritz': 'St. Moritz',
    'zermatt täsch': 'Zermatt', 'zermatt tasch': 'Zermatt', 'täsch': 'Zermatt', 'tasch': 'Zermatt',
    'lech zürs': 'Lech', 'lech zurs': 'Lech', 'zürs': 'Lech', 'zurs': 'Lech',
    'freiburg i br': 'Freiburg', 'freiburg im breisgau': 'Freiburg',
    'bolzano südtirol': 'Bolzano', 'bolzano sudtirol': 'Bolzano', 'bozen': 'Bolzano',
    'cortina d ampezzo': 'Cortina',
    'courchevel val d isère': 'Courchevel', 'val d isère': 'Courchevel', 'val d isere': 'Courchevel',
    'lucerne': 'Luzern', 'basle': 'Basel', 'berne': 'Bern', 'strassburg': 'Strasbourg'
  };

  const COUNTRY = { CH: 'Switzerland', DE: 'Germany', AT: 'Austria', IT: 'Italy', FR: 'France', LI: 'Liechtenstein', CZ: 'Czechia', SI: 'Slovenia', LU: 'Luxembourg' };

  const CH_ROWS = [
    ['8302', 'Kloten', 'ZH', 3], ['8152', 'Glattbrugg', 'ZH', 5], ['8180', 'Bülach', 'ZH', 10],
    ['8105', 'Regensdorf', 'ZH', 10], ['8600', 'Dübendorf', 'ZH', 12],
    ['8001', 'Zürich', 'ZH', 13, 'zurich city centre hb bahnhofstrasse'],
    ['8702', 'Zollikon', 'ZH', 17], ['8952', 'Schlieren', 'ZH', 18], ['8700', 'Küsnacht', 'ZH', 20],
    ['8400', 'Winterthur', 'ZH', 22], ['8610', 'Uster', 'ZH', 22], ['8953', 'Dietikon', 'ZH', 22],
    ['8703', 'Erlenbach', 'ZH', 23], ['5400', 'Baden', 'AG', 25], ['5430', 'Wettingen', 'AG', 25],
    ['8803', 'Rüschlikon', 'ZH', 26], ['8706', 'Meilen', 'ZH', 28], ['8800', 'Thalwil', 'ZH', 28],
    ['5200', 'Brugg', 'AG', 30], ['8620', 'Wetzikon', 'ZH', 30], ['8712', 'Stäfa', 'ZH', 33],
    ['8810', 'Horgen', 'ZH', 33], ['8500', 'Frauenfeld', 'TG', 35], ['8630', 'Rüti', 'ZH', 38],
    ['8820', 'Wädenswil', 'ZH', 38], ['8808', 'Pfäffikon SZ', 'SZ', 40], ['5600', 'Lenzburg', 'AG', 40],
    ['6340', 'Baar', 'ZG', 42], ['5000', 'Aarau', 'AG', 45], ['6300', 'Zug', 'ZG', 45],
    ['8200', 'Schaffhausen', 'SH', 45], ['8640', 'Rapperswil-Jona', 'SG', 45], ['9500', 'Wil', 'SG', 45],
    ['6330', 'Cham', 'ZG', 48], ['8840', 'Einsiedeln', 'SZ', 50], ['8570', 'Weinfelden', 'TG', 50],
    ['8260', 'Stein am Rhein', 'SH', 55], ['8730', 'Uznach', 'SG', 55], ['4600', 'Olten', 'SO', 55],
    ['8280', 'Kreuzlingen', 'TG', 65], ['6003', 'Luzern', 'LU', 68, 'lucerne lucerna'],
    ['8750', 'Glarus', 'GL', 70], ['4310', 'Rheinfelden', 'AG', 75], ['6430', 'Schwyz', 'SZ', 75],
    ['6210', 'Sursee', 'LU', 75], ['8590', 'Romanshorn', 'TG', 75], ['9100', 'Herisau', 'AR', 78],
    ['4410', 'Liestal', 'BL', 80], ['6370', 'Stans', 'NW', 80],
    ['9000', 'St. Gallen', 'SG', 80, 'sankt gallen saint gall'],
    ['6060', 'Sarnen', 'OW', 85], ['6440', 'Brunnen', 'SZ', 85], ['9400', 'Rorschach', 'SG', 85],
    ['9658', 'Wildhaus', 'SG', 85], ['4051', 'Basel', 'BS', 90, 'basle bale basilea'],
    ['4123', 'Allschwil', 'BL', 95], ['6460', 'Altdorf', 'UR', 95], ['6390', 'Engelberg', 'OW', 95],
    ['9050', 'Appenzell', 'AI', 95], ['9430', 'St. Margrethen', 'SG', 95], ['7320', 'Sargans', 'SG', 100],
    ['9470', 'Buchs SG', 'SG', 105], ['7310', 'Bad Ragaz', 'SG', 105], ['7302', 'Landquart', 'GR', 110],
    ['7000', 'Chur', 'GR', 120, 'coire coira'], ['4500', 'Solothurn', 'SO', 130],
    ['3011', 'Bern', 'BE', 135, 'berne berna'], ['7078', 'Lenzerheide', 'GR', 135],
    ['2800', 'Delémont', 'JU', 135], ['3400', 'Burgdorf', 'BE', 140], ['7017', 'Flims', 'GR', 140],
    ['6490', 'Andermatt', 'UR', 145], ['7031', 'Laax', 'GR', 145], ['2540', 'Grenchen', 'SO', 145],
    ['7050', 'Arosa', 'GR', 150], ['3600', 'Thun', 'BE', 155], ['7250', 'Klosters', 'GR', 155],
    ['7180', 'Disentis', 'GR', 155], ['6780', 'Airolo', 'TI', 155],
    ['2502', 'Biel/Bienne', 'BE', 160, 'bienne biel'], ['7270', 'Davos', 'GR', 160],
    ['7132', 'Vals', 'GR', 160], ['2900', 'Porrentruy', 'JU', 160], ['3800', 'Interlaken', 'BE', 165],
    ['3280', 'Murten', 'FR', 170, 'morat'], ['2000', 'Neuchâtel', 'NE', 180, 'neuenburg'],
    ['3823', 'Wengen', 'BE', 180], ['6500', 'Bellinzona', 'TI', 185],
    ['1700', 'Fribourg', 'FR', 185, 'freiburg friburgo'], ['3818', 'Grindelwald', 'BE', 185],
    ['2300', 'La Chaux-de-Fonds', 'NE', 195], ['6900', 'Lugano', 'TI', 205], ['6600', 'Locarno', 'TI', 205],
    ['7524', 'Zuoz', 'GR', 210], ['6612', 'Ascona', 'TI', 210], ['1400', 'Yverdon-les-Bains', 'VD', 215],
    ['1630', 'Bulle', 'FR', 215], ['3900', 'Brig', 'VS', 215, 'brigue briga'],
    ['7500', 'St. Moritz', 'GR', 215, 'sankt moritz saint moritz'], ['7513', 'Silvaplana', 'GR', 220],
    ['6830', 'Chiasso', 'TI', 225], ['3792', 'Saanen', 'BE', 228], ['7550', 'Scuol', 'GR', 230],
    ['3780', 'Gstaad', 'BE', 230], ['3906', 'Saas-Fee', 'VS', 240], ['7563', 'Samnaun', 'GR', 240],
    ['1003', 'Lausanne', 'VD', 240], ['3920', 'Zermatt · Täsch', 'VS', 250, 'zermatt tasch matterhorn'],
    ['1110', 'Morges', 'VD', 250], ['1800', 'Vevey', 'VD', 255], ['1865', 'Les Diablerets', 'VD', 255],
    ['1180', 'Rolle', 'VD', 255], ['1820', 'Montreux', 'VD', 260], ['1260', 'Nyon', 'VD', 265],
    ['1884', 'Villars-sur-Ollon', 'VD', 270], ['3960', 'Sierre', 'VS', 280], ['3963', 'Crans-Montana', 'VS', 285],
    ['1201', 'Genève', 'GE', 285, 'geneva genf ginevra'],
    ['1215', 'Genève Airport', 'GE', 283, 'geneva airport gva cointrin'],
    ['1936', 'Verbier', 'VS', 290], ['1950', 'Sion', 'VS', 300, 'sitten'],
    ['1997', 'Haute-Nendaz', 'VS', 300, 'nendaz']
  ];

  const CH_MORE = [
    ['8002', 'Zürich · Enge', 'ZH', 16], ['8003', 'Zürich · Wiedikon', 'ZH', 15],
    ['8004', 'Zürich · Aussersihl', 'ZH', 14], ['8005', 'Zürich · Kreis 5', 'ZH', 12],
    ['8006', 'Zürich · Oberstrass', 'ZH', 12], ['8008', 'Zürich · Seefeld', 'ZH', 16],
    ['8032', 'Zürich · Hottingen', 'ZH', 15], ['8037', 'Zürich · Wipkingen', 'ZH', 12],
    ['8038', 'Zürich · Wollishofen', 'ZH', 18], ['8044', 'Zürich · Fluntern', 'ZH', 14],
    ['8046', 'Zürich · Affoltern', 'ZH', 10], ['8047', 'Zürich · Albisrieden', 'ZH', 15],
    ['8048', 'Zürich · Altstetten', 'ZH', 14], ['8049', 'Zürich · Höngg', 'ZH', 12],
    ['8050', 'Zürich · Oerlikon', 'ZH', 8], ['8051', 'Zürich · Schwamendingen', 'ZH', 9],
    ['8052', 'Zürich · Seebach', 'ZH', 7], ['8053', 'Zürich · Witikon', 'ZH', 17],
    ['8055', 'Zürich · Friesenberg', 'ZH', 17], ['8057', 'Zürich · Unterstrass', 'ZH', 11],
    ['8304', 'Wallisellen', 'ZH', 8], ['8305', 'Dietlikon', 'ZH', 8], ['8306', 'Brüttisellen', 'ZH', 7],
    ['8307', 'Effretikon', 'ZH', 13], ['8309', 'Nürensdorf', 'ZH', 9], ['8107', 'Buchs ZH', 'ZH', 12],
    ['8117', 'Fällanden', 'ZH', 14], ['8125', 'Zollikerberg', 'ZH', 17], ['8127', 'Forch', 'ZH', 20],
    ['8132', 'Egg', 'ZH', 22], ['8134', 'Adliswil', 'ZH', 22], ['8135', 'Langnau am Albis', 'ZH', 25],
    ['8142', 'Uitikon', 'ZH', 20], ['8320', 'Fehraltorf', 'ZH', 18], ['8330', 'Pfäffikon ZH', 'ZH', 22],
    ['8340', 'Hinwil', 'ZH', 30], ['8472', 'Seuzach', 'ZH', 25], ['8542', 'Wiesendangen', 'ZH', 26],
    ['8604', 'Volketswil', 'ZH', 14], ['8804', 'Au ZH', 'ZH', 30], ['8805', 'Richterswil', 'ZH', 35],
    ['8903', 'Birmensdorf', 'ZH', 20], ['8910', 'Affoltern am Albis', 'ZH', 30],
    ['8932', 'Mettmenstetten', 'ZH', 33], ['8245', 'Feuerthalen', 'ZH', 42],
    ['8957', 'Spreitenbach', 'AG', 20], ['8967', 'Widen', 'AG', 25],
    ['8834', 'Schindellegi', 'SZ', 35], ['8853', 'Lachen', 'SZ', 45],
    ['8867', 'Niederurnen', 'GL', 60], ['8752', 'Näfels', 'GL', 65], ['8762', 'Schwanden', 'GL', 78],
    ['8783', 'Linthal', 'GL', 90], ['8880', 'Walenstadt', 'SG', 90], ['8887', 'Mels', 'SG', 100],
    ['8890', 'Flums', 'SG', 95], ['8898', 'Flumserberg', 'SG', 100],
    ['5210', 'Windisch', 'AG', 30], ['5300', 'Turgi', 'AG', 28], ['5303', 'Würenlingen', 'AG', 25],
    ['5312', 'Döttingen', 'AG', 35], ['5415', 'Nussbaumen', 'AG', 25], ['5432', 'Neuenhof', 'AG', 24],
    ['5610', 'Wohlen AG', 'AG', 40], ['5612', 'Villmergen', 'AG', 38], ['5620', 'Bremgarten', 'AG', 33],
    ['5630', 'Muri AG', 'AG', 42], ['5643', 'Sins', 'AG', 45], ['5070', 'Frick', 'AG', 60],
    ['5080', 'Laufenburg', 'AG', 60], ['5330', 'Bad Zurzach', 'AG', 45], ['5730', 'Reinach AG', 'AG', 50],
    ['4663', 'Aarburg', 'AG', 60], ['4800', 'Zofingen', 'AG', 62], ['4303', 'Kaiseraugst', 'AG', 82],
    ['4332', 'Stein AG', 'AG', 78],
    ['6010', 'Kriens', 'LU', 72], ['6030', 'Ebikon', 'LU', 65], ['6048', 'Horw', 'LU', 75],
    ['6280', 'Hochdorf', 'LU', 55], ['6110', 'Wolhusen', 'LU', 85], ['6130', 'Willisau', 'LU', 78],
    ['6170', 'Schüpfheim', 'LU', 95], ['6353', 'Weggis', 'LU', 80], ['6354', 'Vitznau', 'LU', 85],
    ['6312', 'Steinhausen', 'ZG', 45], ['6314', 'Unterägeri', 'ZG', 55], ['6343', 'Rotkreuz', 'ZG', 52],
    ['6362', 'Stansstad', 'NW', 82], ['6375', 'Beckenried', 'NW', 90], ['6055', 'Alpnach', 'OW', 88],
    ['6072', 'Sachseln', 'OW', 90], ['6078', 'Lungern', 'OW', 100], ['6472', 'Erstfeld', 'UR', 105],
    ['6484', 'Wassen', 'UR', 120],
    ['3052', 'Zollikofen', 'BE', 140], ['3110', 'Münsingen', 'BE', 150], ['3123', 'Belp', 'BE', 145],
    ['3250', 'Lyss', 'BE', 155], ['3270', 'Aarberg', 'BE', 155], ['3360', 'Herzogenbuchsee', 'BE', 120],
    ['3380', 'Wangen an der Aare', 'BE', 115], ['3510', 'Konolfingen', 'BE', 150],
    ['3550', 'Langnau im Emmental', 'BE', 145], ['3612', 'Steffisburg', 'BE', 158],
    ['3652', 'Hilterfingen', 'BE', 160], ['3700', 'Spiez', 'BE', 165], ['3714', 'Frutigen', 'BE', 180],
    ['3715', 'Adelboden', 'BE', 195], ['3775', 'Lenk im Simmental', 'BE', 215],
    ['3776', 'Zweisimmen', 'BE', 205], ['3778', 'Schönried', 'BE', 225], ['3812', 'Wilderswil', 'BE', 168],
    ['3822', 'Lauterbrunnen', 'BE', 178], ['3825', 'Mürren', 'BE', 180], ['3855', 'Brienz', 'BE', 175],
    ['3860', 'Meiringen', 'BE', 170], ['2560', 'Nidau', 'BE', 160], ['2610', 'St-Imier', 'BE', 175],
    ['2710', 'Tavannes', 'BE', 155], ['2720', 'Tramelan', 'BE', 160], ['2740', 'Moutier', 'BE', 148],
    ['3904', 'Naters', 'VS', 218], ['3930', 'Visp', 'VS', 220], ['3925', 'Grächen', 'VS', 235],
    ['3910', 'Saas-Grund', 'VS', 238], ['3954', 'Leukerbad', 'VS', 235], ['3952', 'Susten', 'VS', 230],
    ['3984', 'Fiesch', 'VS', 230], ['3987', 'Riederalp', 'VS', 235], ['1920', 'Martigny', 'VS', 300],
    ['1937', 'Orsières', 'VS', 305], ['1938', 'Champex-Lac', 'VS', 310], ['1966', 'Ayent', 'VS', 305],
    ['1972', 'Anzère', 'VS', 300], ['1983', 'Évolène', 'VS', 320], ['1993', 'Veysonnaz', 'VS', 305],
    ['1870', 'Monthey', 'VS', 290], ['1874', 'Champéry', 'VS', 305], ['1875', 'Morgins', 'VS', 300],
    ['1890', 'St-Maurice', 'VS', 285],
    ['1020', 'Renens', 'VD', 245], ['1024', 'Écublens', 'VD', 245], ['1030', 'Bussigny', 'VD', 242],
    ['1040', 'Échallens', 'VD', 240], ['1052', 'Le Mont-sur-Lausanne', 'VD', 240],
    ['1066', 'Épalinges', 'VD', 245], ['1071', 'Chexbres', 'VD', 250], ['1095', 'Lutry', 'VD', 245],
    ['1096', 'Cully', 'VD', 248], ['1170', 'Aubonne', 'VD', 258], ['1196', 'Gland', 'VD', 262],
    ['1295', 'Mies', 'VD', 270], ['1296', 'Coppet', 'VD', 272], ['1297', 'Founex', 'VD', 272],
    ['1860', 'Aigle', 'VD', 250], ['1854', 'Leysin', 'VD', 255], ['1882', 'Gryon', 'VD', 268],
    ['1660', "Château-d'Oex", 'VD', 238, 'chateau d oex'], ['1580', 'Avenches', 'VD', 180],
    ['1202', 'Genève · Pâquis', 'GE', 285], ['1204', 'Genève · Rive', 'GE', 285],
    ['1206', 'Genève · Champel', 'GE', 287], ['1209', 'Genève · Petit-Saconnex', 'GE', 283],
    ['1213', 'Onex', 'GE', 288], ['1214', 'Vernier', 'GE', 285], ['1218', 'Le Grand-Saconnex', 'GE', 283],
    ['1223', 'Cologny', 'GE', 288], ['1224', 'Chêne-Bougeries', 'GE', 288], ['1226', 'Thônex', 'GE', 290],
    ['1227', 'Carouge', 'GE', 288], ['1245', 'Collonge-Bellerive', 'GE', 290], ['1290', 'Versoix', 'GE', 280],
    ['1723', 'Marly', 'FR', 190], ['1752', 'Villars-sur-Glâne', 'FR', 190],
    ['1618', 'Châtel-St-Denis', 'FR', 220], ['1637', 'Charmey', 'FR', 215], ['1656', 'Jaun', 'FR', 205],
    ['1663', 'Gruyères', 'FR', 215], ['1680', 'Romont', 'FR', 210],
    ['2013', 'Colombier', 'NE', 185], ['2017', 'Boudry', 'NE', 188], ['2074', 'Marin', 'NE', 175],
    ['2108', 'Couvet', 'NE', 200], ['2114', 'Fleurier', 'NE', 205], ['2400', 'Le Locle', 'NE', 200],
    ['2830', 'Courrendlin', 'JU', 140], ['2854', 'Bassecourt', 'JU', 145],
    ['2350', 'Saignelégier', 'JU', 165], ['2340', 'Le Noirmont', 'JU', 170],
    ['4622', 'Egerkingen', 'SO', 60], ['4702', 'Oensingen', 'SO', 70], ['4710', 'Balsthal', 'SO', 75],
    ['4056', 'Basel · St. Johann', 'BS', 90], ['4058', 'Basel · Kleinbasel', 'BS', 90],
    ['4125', 'Riehen', 'BS', 92], ['4102', 'Binningen', 'BL', 92], ['4106', 'Therwil', 'BL', 95],
    ['4127', 'Birsfelden', 'BL', 90], ['4132', 'Muttenz', 'BL', 88], ['4133', 'Pratteln', 'BL', 85],
    ['4142', 'Münchenstein', 'BL', 92], ['4144', 'Arlesheim', 'BL', 92], ['4147', 'Aesch BL', 'BL', 95],
    ['4153', 'Reinach BL', 'BL', 95], ['4242', 'Laufen', 'BL', 105], ['4450', 'Sissach', 'BL', 85],
    ['4460', 'Gelterkinden', 'BL', 82],
    ['9010', 'St. Gallen · Ost', 'SG', 80], ['9200', 'Gossau SG', 'SG', 72], ['9230', 'Flawil', 'SG', 68],
    ['9240', 'Uzwil', 'SG', 60], ['9300', 'Wittenbach', 'SG', 82], ['9403', 'Goldach', 'SG', 84],
    ['9422', 'Staad', 'SG', 88], ['9435', 'Heerbrugg', 'SG', 95], ['9450', 'Altstätten', 'SG', 100],
    ['9463', 'Oberriet', 'SG', 100], ['9472', 'Grabs', 'SG', 105], ['9475', 'Sevelen', 'SG', 105],
    ['9602', 'Bazenheid', 'SG', 55], ['9620', 'Lichtensteig', 'SG', 60], ['9630', 'Wattwil', 'SG', 62],
    ['9642', 'Ebnat-Kappel', 'SG', 68], ['9650', 'Nesslau', 'SG', 75], ['9657', 'Unterwasser', 'SG', 84],
    ['9410', 'Heiden', 'AR', 90], ['9320', 'Arbon', 'TG', 85], ['8580', 'Amriswil', 'TG', 65],
    ['8595', 'Altnau', 'TG', 70], ['8598', 'Bottighofen', 'TG', 68], ['8554', 'Müllheim', 'TG', 45],
    ['8560', 'Märstetten', 'TG', 50], ['8575', 'Bürglen TG', 'TG', 55], ['8266', 'Steckborn', 'TG', 50],
    ['8253', 'Diessenhofen', 'TG', 50], ['9542', 'Münchwilen TG', 'TG', 50],
    ['8212', 'Neuhausen am Rheinfall', 'SH', 48], ['8240', 'Thayngen', 'SH', 50],
    ['7013', 'Domat/Ems', 'GR', 125], ['7018', 'Flims Waldhaus', 'GR', 142], ['7075', 'Churwalden', 'GR', 130],
    ['7077', 'Valbella', 'GR', 134], ['7100', 'Ilanz', 'GR', 135], ['7133', 'Obersaxen', 'GR', 150],
    ['7153', 'Falera', 'GR', 145], ['7165', 'Breil/Brigels', 'GR', 150], ['7166', 'Trun', 'GR', 148],
    ['7188', 'Sedrun', 'GR', 160], ['7203', 'Trimmis', 'GR', 115], ['7208', 'Malans', 'GR', 110],
    ['7212', 'Seewis', 'GR', 118], ['7214', 'Grüsch', 'GR', 120], ['7220', 'Schiers', 'GR', 125],
    ['7240', 'Küblis', 'GR', 140], ['7246', 'St. Antönien', 'GR', 145], ['7260', 'Davos Dorf', 'GR', 162],
    ['7304', 'Maienfeld', 'GR', 108], ['7402', 'Bonaduz', 'GR', 125], ['7430', 'Thusis', 'GR', 135],
    ['7435', 'Splügen', 'GR', 155], ['7440', 'Andeer', 'GR', 150], ['7450', 'Tiefencastel', 'GR', 140],
    ['7460', 'Savognin', 'GR', 150], ['7477', 'Filisur', 'GR', 148], ['7482', 'Bergün', 'GR', 155],
    ['7502', 'Bever', 'GR', 205], ['7503', 'Samedan', 'GR', 205], ['7504', 'Pontresina', 'GR', 210],
    ['7505', 'Celerina', 'GR', 208], ['7514', 'Sils im Engadin', 'GR', 220], ['7516', 'Maloja', 'GR', 225],
    ['7522', 'La Punt Chamues-ch', 'GR', 205], ['7525', 'S-chanf', 'GR', 208], ['7530', 'Zernez', 'GR', 220],
    ['7536', 'Sta. Maria Val Müstair', 'GR', 240], ['7537', 'Müstair', 'GR', 245], ['7542', 'Susch', 'GR', 225],
    ['7545', 'Guarda', 'GR', 228], ['7546', 'Ardez', 'GR', 228], ['7551', 'Ftan', 'GR', 232],
    ['7552', 'Vulpera', 'GR', 232], ['7554', 'Sent', 'GR', 235], ['7560', 'Martina', 'GR', 245],
    ['7603', 'Vicosoprano', 'GR', 230], ['7610', 'Soglio', 'GR', 235], ['7742', 'Poschiavo', 'GR', 240],
    ['7743', 'Brusio', 'GR', 250],
    ['6512', 'Giubiasco', 'TI', 185], ['6710', 'Biasca', 'TI', 175], ['6760', 'Faido', 'TI', 165],
    ['6616', 'Losone', 'TI', 208], ['6614', 'Brissago', 'TI', 215], ['6807', 'Taverne', 'TI', 200],
    ['6815', 'Melide', 'TI', 210], ['6816', 'Bissone', 'TI', 212], ['6828', 'Balerna', 'TI', 222],
    ['6850', 'Mendrisio', 'TI', 220], ['6924', 'Sorengo', 'TI', 207], ['6926', 'Montagnola', 'TI', 210],
    ['6978', 'Gandria', 'TI', 210]
  ];

  const INTL_ROWS = [
    ['78462', 'Konstanz', 'DE', 85, 'constance'], ['88045', 'Friedrichshafen', 'DE', 100],
    ['9490', 'Vaduz', 'LI', 110], ['9497', 'Triesenberg', 'LI', 115], ['6900', 'Bregenz', 'AT', 130],
    ['88131', 'Lindau', 'DE', 130], ['68100', 'Mulhouse', 'FR', 130, 'mulhausen'],
    ['79098', 'Freiburg im Breisgau', 'DE', 165], ['68000', 'Colmar', 'FR', 175], ['89073', 'Ulm', 'DE', 190],
    ['6764', 'Lech · Zürs', 'AT', 200, 'lech zurs arlberg'], ['67000', 'Strasbourg', 'FR', 200, 'strassburg'],
    ['6580', 'St. Anton am Arlberg', 'AT', 220, 'sankt anton'], ['70173', 'Stuttgart', 'DE', 220],
    ['22100', 'Como', 'IT', 235], ['21010', 'Malpensa Airport', 'IT', 240, 'mxp milano malpensa'],
    ['6561', 'Ischgl', 'AT', 250], ['76530', 'Baden-Baden', 'DE', 250],
    ['20121', 'Milano', 'IT', 280, 'milan mailand'], ['6020', 'Innsbruck', 'AT', 280],
    ['76133', 'Karlsruhe', 'DE', 280], ['80331', 'München', 'DE', 310, 'munich muenchen'],
    ['24121', 'Bergamo', 'IT', 320], ['39100', 'Bolzano', 'IT', 320, 'bozen'], ['74000', 'Annecy', 'FR', 320],
    ['74400', 'Chamonix', 'FR', 340, 'chamonix mont blanc'], ['6370', 'Kitzbühel', 'AT', 350],
    ['74120', 'Megève', 'FR', 350], ['60311', 'Frankfurt am Main', 'DE', 380], ['37121', 'Verona', 'IT', 380],
    ['10121', 'Torino', 'IT', 380, 'turin'], ['5020', 'Salzburg', 'AT', 440], ['69001', 'Lyon', 'FR', 450],
    ["73150", "Val d'Isère", 'FR', 480, 'val disere'], ["32043", "Cortina d'Ampezzo", 'IT', 480, 'cortina'],
    ['73120', 'Courchevel', 'FR', 500], ['30100', 'Venezia', 'IT', 560, 'venice venedig'],
    ['1000', 'Ljubljana', 'SI', 600], ['110 00', 'Praha', 'CZ', 700, 'prague prag'],
    ['1010', 'Wien', 'AT', 720, 'vienna vienne'],
    ['79761', 'Waldshut-Tiengen', 'DE', 60], ['78224', 'Singen', 'DE', 65], ['78315', 'Radolfzell', 'DE', 75],
    ['79539', 'Lörrach', 'DE', 80], ['79576', 'Weil am Rhein', 'DE', 85], ['68300', 'Saint-Louis', 'FR', 88],
    ['88212', 'Ravensburg', 'DE', 130], ['6850', 'Dornbirn', 'AT', 135], ['6800', 'Feldkirch', 'AT', 145],
    ['78050', 'Villingen-Schwenningen', 'DE', 150], ['6700', 'Bludenz', 'AT', 170],
    ['87435', 'Kempten', 'DE', 190], ['77652', 'Offenburg', 'DE', 190], ['23022', 'Chiavenna', 'IT', 200],
    ['72072', 'Tübingen', 'DE', 200], ['90000', 'Belfort', 'FR', 200], ['22017', 'Menaggio', 'IT', 215],
    ['21100', 'Varese', 'IT', 250], ['28838', 'Stresa', 'IT', 250], ['23900', 'Lecco', 'IT', 255],
    ['25000', 'Besançon', 'FR', 260], ['74072', 'Heilbronn', 'DE', 260], ['86150', 'Augsburg', 'DE', 270],
    ['1220', 'Divonne-les-Bains', 'FR', 275], ['74100', 'Annemasse', 'FR', 280],
    ['23041', 'Livigno', 'IT', 280], ['1210', 'Ferney-Voltaire', 'FR', 285], ['6100', 'Seefeld', 'AT', 290],
    ['74500', 'Évian-les-Bains', 'FR', 300, 'evian'], ['11100', 'Aosta', 'IT', 320, 'aoste'],
    ['54000', 'Nancy', 'FR', 320], ['6450', 'Sölden', 'AT', 330], ['6290', 'Mayrhofen', 'AT', 330],
    ['23032', 'Bormio', 'IT', 330], ['39012', 'Merano', 'IT', 330, 'meran'], ['21000', 'Dijon', 'FR', 330],
    ['74220', 'La Clusaz', 'FR', 340], ['25121', 'Brescia', 'IT', 340],
    ['16121', 'Genova', 'IT', 350, 'genoa genua'], ['11013', 'Courmayeur', 'IT', 350],
    ['38122', 'Trento', 'IT', 350, 'trient'], ['57000', 'Metz', 'FR', 350], ['21200', 'Beaune', 'FR', 350],
    ['97070', 'Würzburg', 'DE', 350], ['74110', 'Morzine', 'FR', 380], ['74260', 'Les Gets', 'FR', 380],
    ['5753', 'Saalbach', 'AT', 380], ['55116', 'Mainz', 'DE', 380], ['65183', 'Wiesbaden', 'DE', 385],
    ['46100', 'Mantova', 'IT', 400], ['38086', 'Madonna di Campiglio', 'IT', 400, 'campiglio'],
    ['38000', 'Grenoble', 'FR', 400], ['93047', 'Regensburg', 'DE', 400], ['5700', 'Zell am See', 'AT', 400],
    ['39048', 'Selva di Val Gardena', 'IT', 400, 'wolkenstein groden val gardena'],
    ['10058', 'Sestriere', 'IT', 420], ['39033', 'Corvara', 'IT', 420, 'alta badia'],
    ['1111', 'Luxembourg', 'LU', 420], ['73700', 'Bourg-Saint-Maurice', 'FR', 430, 'les arcs'],
    ['90402', 'Nürnberg', 'DE', 430, 'nuremberg'], ['38750', "Alpe d'Huez", 'FR', 450, 'huez'],
    ['73320', 'Tignes', 'FR', 470], ['40121', 'Bologna', 'IT', 470], ['73550', 'Méribel', 'FR', 500],
    ['4280', 'Kranjska Gora', 'SI', 540], ['50667', 'Köln', 'DE', 540, 'cologne'],
    ['4020', 'Linz', 'AT', 550], ['50122', 'Firenze', 'IT', 550, 'florence florenz'],
    ['51100', 'Reims', 'FR', 550], ['40213', 'Düsseldorf', 'DE', 570],
    ['34121', 'Trieste', 'IT', 570, 'triest'], ['4260', 'Bled', 'SI', 560], ['45127', 'Essen', 'DE', 590],
    ['9020', 'Klagenfurt', 'AT', 600], ['301 00', 'Plzeň', 'CZ', 640, 'pilsen'],
    ['2000', 'Maribor', 'SI', 640], ['6320', 'Portorož', 'SI', 640], ['8010', 'Graz', 'AT', 650],
    ['75001', 'Paris', 'FR', 650], ['06000', 'Nice', 'FR', 700, 'nizza'], ['13001', 'Marseille', 'FR', 700],
    ['360 01', 'Karlovy Vary', 'CZ', 700, 'karlsbad'], ['30159', 'Hannover', 'DE', 700],
    ['04109', 'Leipzig', 'DE', 700], ['01067', 'Dresden', 'DE', 720], ['602 00', 'Brno', 'CZ', 780, 'brunn'],
    ['00184', 'Roma', 'IT', 850, 'rome rom'], ['10115', 'Berlin', 'DE', 850],
    ['20095', 'Hamburg', 'DE', 850]
  ];

  /* ── Lookups ── */

  const MAX_QUERY = 64;
  const DEFAULT_LIMIT = 8;

  /** Lowercase, strip diacritics, collapse anything else to single spaces. */
  function fold(s) {
    return String(s || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  /** Looser than fold: keeps diacritics but drops digits, so "8001 Zürich" resolves on the name. */
  function normPlace(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/\d/g, ' ')
      .replace(/[.,;:·\-–—'’()/]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const row = (r, cc) => ({
    zip: r[0], name: r[1], region: r[2], country: cc || r[2], km: r[3], alias: r[4] || '', label: r[0] + ' ' + r[1], s: ''
  });

  /** Every postcode with a distance. */
  const PLACES = CH_ROWS.map(r => row(r, 'CH'))
    .concat(CH_MORE.map(r => row(r, 'CH')), INTL_ROWS.map(r => row(r)))
    .map(p => Object.assign(p, { s: fold(p.zip + ' ' + p.name + ' ' + p.alias + ' ' + p.region + ' ' + (COUNTRY[p.country] || '')) }))
    .filter((p, i, all) => all.findIndex(q => q.label === p.label) === i);

  /** One row per city, keeping its nearest postcode. */
  const CITIES = (() => {
    const seen = new Set(), out = [];
    for (const p of PLACES.slice().sort((a, b) => a.km - b.km)) {
      const k = fold(p.name) + '|' + p.country;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(Object.assign({}, p, {
        city: p.name, label: p.name, cc: p.country,
        place: p.country === 'CH' ? p.region : (COUNTRY[p.country] || p.country),
        cs: fold(p.name + ' ' + p.alias + ' ' + p.region + ' ' + (COUNTRY[p.country] || ''))
      }));
    }
    return out;
  })();

  const ALIAS_INDEX = new Map(Object.entries(ALIAS).map(([k, v]) => [normPlace(k), v]));
  const FARE_INDEX = new Map(Object.keys(FARES).map(k => [normPlace(k), k]));
  /* The FARES key is "Zürich city"; a bare "Zürich" is the same journey. */
  const FARE_TIME = new Map(Object.keys(FARES).map(k => [fold(k), FARES[k].t]).concat([['zurich', '0:20']]));

  /** Free text resolved to a published route name (a FARES key), or null. */
  function resolvePlace(value) {
    const n = normPlace(value).slice(0, MAX_QUERY);
    if (!n) return null;
    const alias = ALIAS_INDEX.get(n);
    if (alias) return alias;
    const key = FARE_INDEX.get(n);
    if (key) return key;
    // Below three characters a substring search matches almost everything.
    if (n.length < 3) return null;
    for (const [a, canonical] of ALIAS_INDEX) if (a.length > 2 && n.includes(a)) return canonical;
    for (const [k, canonical] of FARE_INDEX) if (k.length > 2 && (n.includes(k) || k.includes(n))) return canonical;
    return null;
  }

  const CITY_INDEX = new Map(CITIES.map(c => [fold(c.city), c]));

  /** The directory row a destination names exactly, or null. Checked before resolvePlace:
      a customer who picked "Kloten" (3 km) was shown 3 km, not the 13 km Zürich route. */
  function exactCity(value) {
    const f = fold(value).slice(0, MAX_QUERY);
    if (!f) return null;
    return CITY_INDEX.get(f) || CITY_INDEX.get(f.split(' ')[0]) || null;
  }

  const POPULAR = CITIES.slice(0, DEFAULT_LIMIT);

  /** Cities matching a query, best match first. Every token must match. */
  function searchPlaces(query, limit) {
    limit = limit || DEFAULT_LIMIT;
    const raw = String(query == null ? '' : query);
    if (raw.length > MAX_QUERY) return [];
    const f = fold(raw);
    if (!f) return POPULAR.slice(0, limit);
    const tokens = f.split(' ');
    const hits = [];
    for (const c of CITIES) {
      const name = fold(c.city);
      let ok = true, rank = 9;
      for (const t of tokens) {
        const inCity = c.cs.includes(t);
        const inZip = c.zip.startsWith(t);
        if (!inCity && !inZip) { ok = false; break; }
        const r = name.indexOf(t) === 0 || inZip ? 0 : c.cs.includes(' ' + t) ? 1 : 2;
        if (r < rank) rank = r;
      }
      if (ok) hits.push({ p: c, r: rank });
    }
    hits.sort((a, b) => a.r - b.r || a.p.city.length - b.p.city.length || a.p.km - b.p.km);
    return hits.slice(0, limit).map(h => h.p);
  }

  /** Drive time as H:MM: a published route time, else estimated (12 min airport egress + 0.6 min/km). */
  function driveTime(p) {
    const t = FARE_TIME.get(fold(p.name)) || FARE_TIME.get(fold(String(p.name).split('·')[0]));
    if (t) return t;
    const mins = Math.round((12 + p.km * 0.6) / 5) * 5;
    return Math.floor(mins / 60) + ':' + String(mins % 60).padStart(2, '0');
  }

  /** H:MM back to whole minutes. Anything malformed is 0: a fare must under-bill, never be NaN. */
  function parseHM(t) {
    const m = /^(\d{1,2}):([0-5]\d)$/.exec(String(t == null ? '' : t));
    return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
  }

  g.ZALS_PLACES = { FARES, PLACES, CITIES, fold, normPlace, resolvePlace, exactCity, searchPlaces, driveTime, parseHM };
})(typeof globalThis !== 'undefined' ? globalThis : window);
