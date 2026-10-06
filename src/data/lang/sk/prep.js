// Slovenčina — príprava na ponor (ui/prep.js). ZDROJ prekladu (docs/I18N.md). Kľúče ui.prep.*
// Šírky: štítok výbavy vpravo drobným písmom (~60 px), veta pod vlascom 156 px, nadpis sekcie 168 px,
// bočný panel 94 px (vety sa zalomia). {n} = počet (množné číslo), ostatné hodnoty sú už naformátované.
(function (HL) {
  HL.i18n.add('sk', 'prep', {
    'ui.prep.title': 'Príprava',
    'ui.prep.dive': 'PONORIŤ SA',
    // bonusový ponor (prepínač vedľa PONORIŤ SA, ≤ 46 px; vysvetlenie v správe pri zapnutí)
    'ui.prep.haul': 'BONUS',
    'ui.prep.haulToast': 'Bonus: od {from} rýb +{pct}. Keď ti ryba v boji ujde, prídeš o všetky ryby na udici!',
    // sekcie zoznamu
    'ui.prep.bait': 'Návnada',
    'ui.prep.gear': 'Výbava',
    'ui.prep.reach': 'Kam siahne vlasec',
    'ui.prep.hot': 'Dnes na trhu žiadané',
    'ui.prep.hotNone': 'Dnes nič mimoriadne.',
    'ui.prep.hotMult': '★ ×{mult}',
    // podmienky a predpoveď (riadky dní majú na štítok 34 px drobného písma)
    'ui.prep.noForecast': 'Predpoveď ukáže až Meteostanica.',
    'ui.prep.introSun': 'Prvé ponory sú vždy za slnka.',
    'ui.prep.today': 'dnes',
    'ui.prep.tomorrow': 'zajtra',
    'ui.prep.dayAfter': 'pozajtra',
    // predpoveď rýb (sekcia pod počasím, 168 px): blok = čas bežným písmom od x 22 (fishNow, „17:00", fishTomorrow,
    // fishDayAfter, od 3. dňa fishDay s číslom dňa hry) a vpravo drobným fishCond (zlúčený blok s rôznym počasím len
    // obdobie); čo sa do riadku nezmestí, ide drobným pod čas. Riadok druhu = meno bežným písmom + hĺbka vpravo drobným.
    // fishNone = blok bez druhov s podmienkou (berú len ryby, ktoré berú stále). fishShow / fishHide = riadok
    // zbaliť/rozbaliť (UI pridá „ ▸" / „ ▴"; najviac 157 px bežným písmom — „Predpoveď na ďalšie hodiny (28 zmien)" má 173).
    'ui.prep.fish': 'Čo kedy berie',
    'ui.prep.fishNow': 'teraz',
    'ui.prep.fishTomorrow': 'zajtra {time}',
    'ui.prep.fishDayAfter': 'pozajtra {time}',
    'ui.prep.fishDay': 'deň {n}, {time}',
    'ui.prep.fishCond': '{period} · {weather}',
    'ui.prep.fishNone': 'len bežné ryby',
    'ui.prep.fishShow': { one: 'Ďalšie hodiny ({n} zmena)', few: 'Ďalšie hodiny ({n} zmeny)', other: 'Ďalšie hodiny ({n} zmien)' },
    'ui.prep.fishHide': 'Skryť predpoveď',
    // karta návnady: koľko kusov hráč berie do ponoru
    'ui.prep.carry': { one: 'berieš {n} ks', few: 'berieš {n} ks', other: 'berieš {n} ks' },
    'ui.prep.unlimited': 'bez obmedzenia',
    // výbava ({ms} = milisekundy tolerancie, {pct} = "60 %")
    'ui.prep.noFloor': 'bez dna',
    'ui.prep.limitLighthouse': 'Hlbšie pustí až Maják 3.',
    'ui.prep.limitFloor': 'Siaha až na dno mora.',
    'ui.prep.limitShipyard': 'Hlbšie pustí až lepšia Lodenica.',
    'ui.prep.limitCore': 'Siaha až k jadru.',
    'ui.prep.rodTolerance': 'rytmus +{ms} ms',
    'ui.prep.rodBasic': 'základný',
    'ui.prep.hookEscape': 'únik –{pct}',
    'ui.prep.hookBasic': 'základný',
    'ui.prep.harpoons': 'Harpúny',
    'ui.prep.harpoonCount': { one: '{n} ks', few: '{n} ks', other: '{n} ks' },
    'ui.prep.harpoonNone': 'žiadne',
    'ui.prep.harpoonLocked': 'od Dielne 2',
    'ui.prep.storage': 'Chatrč',
    'ui.prep.storageFull': 'plná — úlovok predáš hneď',
    // {stored} = rýb v Chatrči, {n} = kapacita (tvar podľa kapacity)
    'ui.prep.storageCount': { one: '{stored} / {n} ryba', few: '{stored} / {n} ryby', other: '{stored} / {n} rýb' },
    // bočné panely (PC)
    'ui.prep.panel.weather': 'Počasie',
    'ui.prep.panel.weatherHint': 'Meteostanica ukáže, aké počasie príde. Niektoré ryby berú len v daždi, v hmle alebo v búrke.',
    'ui.prep.panel.now': 'teraz',
    'ui.prep.panel.dayTime': '{day}, {time}',
    'ui.prep.panel.reach': 'Dosah',
    'ui.prep.panel.depthRule': 'Čím hlbšie si, tým viac ryba na vlasci váži: v 500 metroch trojnásobne.',
    'ui.prep.panel.keyDive': 'Enter  ponoriť sa',
    'ui.prep.panel.keyBack': 'Esc  späť do dediny',
    'ui.prep.panel.keyBackPlant': 'Esc  späť do elektrárne',
  });
})(globalThis.HL);
