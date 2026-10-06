// Čeština — příprava na ponor (ui/prep.js). Kľúče = src/data/lang/sk/prep.js; glosár v data.js.
// Šírky: štítok výbavy vpravo drobným písmom (~60 px), veta pod vlascom 156 px, nadpis sekcie 168 px,
// bočný panel 94 px, štítok dňa 34 px drobného písma.
(function (HL) {
  HL.i18n.add('cs', 'prep', {
    'ui.prep.title': 'Příprava',
    'ui.prep.dive': 'PONOŘIT SE',
    'ui.prep.haul': 'BONUS',
    'ui.prep.haulToast': 'Bonus: od {from} ryb +{pct}. Když ti ryba v souboji uteče, přijdeš o všechny ryby na udici!',
    // sekce seznamu
    'ui.prep.bait': 'Návnada',
    'ui.prep.gear': 'Výbava',
    'ui.prep.reach': 'Kam sahá vlasec',
    'ui.prep.hot': 'Dnes na trhu žádané',
    'ui.prep.hotNone': 'Dnes nic mimořádného.',
    'ui.prep.hotMult': '★ ×{mult}',
    // podmínky a předpověď
    'ui.prep.noForecast': 'Předpověď ukáže až Meteostanice.',
    'ui.prep.introSun': 'První ponory jsou vždy za slunce.',
    'ui.prep.today': 'dnes',
    'ui.prep.tomorrow': 'zítra',
    'ui.prep.dayAfter': 'pozítří',
    // předpověď ryb (sekce pod počasím, 168 px): čas běžným písmem, vpravo drobně období · počasí; řádek ryby = jméno + hloubka;
    // fishShow / fishHide = řádek sbalit/rozbalit (UI přidá „ ▸" / „ ▴", nejvýš 157 px)
    'ui.prep.fish': 'Co kdy bere',
    'ui.prep.fishNow': 'teď',
    'ui.prep.fishTomorrow': 'zítra {time}',
    'ui.prep.fishDayAfter': 'pozítří {time}',
    'ui.prep.fishDay': 'den {n}, {time}',
    'ui.prep.fishCond': '{period} · {weather}',
    'ui.prep.fishNone': 'jen běžné ryby',
    'ui.prep.fishShow': { one: 'Další hodiny ({n} změna)', few: 'Další hodiny ({n} změny)', other: 'Další hodiny ({n} změn)' },
    'ui.prep.fishHide': 'Skrýt předpověď',
    // karta návnady: kolik kusů hráč bere do ponoru
    'ui.prep.carry': { one: 'bereš {n} ks', few: 'bereš {n} ks', other: 'bereš {n} ks' },
    'ui.prep.unlimited': 'bez omezení',
    // výbava ({ms} = milisekundy tolerance, {pct} = "60 %")
    'ui.prep.noFloor': 'bez dna',
    'ui.prep.limitLighthouse': 'Hlouběji pustí až Maják 3.',
    'ui.prep.limitFloor': 'Sahá až na dno moře.',
    // jaderné jezero: hranici dává Loděnice, dno jezera = jádro
    'ui.prep.limitShipyard': 'Hlouběji pustí až lepší Loděnice.',
    'ui.prep.limitCore': 'Sahá až k jádru.',
    'ui.prep.rodTolerance': 'rytmus +{ms} ms',
    'ui.prep.rodBasic': 'základní',
    'ui.prep.hookEscape': 'únik –{pct}',
    'ui.prep.hookBasic': 'základní',
    'ui.prep.harpoons': 'Harpuny',
    'ui.prep.harpoonCount': { one: '{n} ks', few: '{n} ks', other: '{n} ks' },
    'ui.prep.harpoonNone': 'žádné',
    'ui.prep.harpoonLocked': 'od Dílny 2',
    'ui.prep.storage': 'Chatrč',
    'ui.prep.storageFull': 'plná — úlovek prodáš hned',
    // {stored} = ryb v Chatrči, {n} = kapacita (tvar podle kapacity)
    'ui.prep.storageCount': { one: '{stored} / {n} ryba', few: '{stored} / {n} ryby', other: '{stored} / {n} ryb' },
    // boční panely (PC)
    'ui.prep.panel.weather': 'Počasí',
    'ui.prep.panel.weatherHint': 'Meteostanice ukáže, jaké počasí přijde. Některé ryby berou jen v dešti, v mlze nebo v bouřce.',
    'ui.prep.panel.now': 'teď',
    'ui.prep.panel.dayTime': '{day}, {time}',
    'ui.prep.panel.reach': 'Dosah',
    'ui.prep.panel.depthRule': 'Čím hlouběji jsi, tím víc ryba na vlasci váží: v 500 metrech trojnásobně.',
    'ui.prep.panel.keyDive': 'Enter  ponořit se',
    'ui.prep.panel.keyBack': 'Esc  zpět do vesnice',
    'ui.prep.panel.keyBackPlant': 'Esc  zpět do elektrárny',
  });
})(globalThis.HL);
