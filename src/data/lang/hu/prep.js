// Preklad hu / prep — príprava na ponor (ui/prep.js). Kľúče = src/data/lang/sk/prep.js. Szójegyzék: hu/data.js.
// Szélességek: felszerelés címkéje jobbra apróval (~60 px), mondat a zsinór alatt 156 px, szakaszcím 168 px,
// oldalsó panel 94 px (tördel); a napok címkéje 34 px apró betűvel.
(function (HL) {
  HL.i18n.add('hu', 'prep', {
    'ui.prep.title': 'Felkészülés',
    'ui.prep.dive': 'MERÜLÉS',
    'ui.prep.haul': 'BÓNUSZ',
    'ui.prep.haulToast': 'Bónusz: legalább {from} hal = +{pct}. Ha egy hal elszökik a harcban, a horgon lévő összes hal odavész!',
    // a lista szakaszai
    'ui.prep.bait': 'Csali',
    'ui.prep.gear': 'Felszerelés',
    'ui.prep.reach': 'Meddig ér a zsinór',
    'ui.prep.hot': 'Ma keresett a piacon',
    'ui.prep.hotNone': 'Ma semmi különös.',
    'ui.prep.hotMult': '★ ×{mult}',
    // feltételek és előrejelzés
    'ui.prep.noForecast': 'Előrejelzést a Meteoállomás ad.',
    'ui.prep.introSun': 'Az első merülések mindig napsütésben vannak.',
    'ui.prep.today': 'ma',
    'ui.prep.tomorrow': 'holnap',
    'ui.prep.dayAfter': '+2 nap',
    // hal-előrejelzés (szakasz az időjárás alatt, 168 px): idő normál betűvel, jobbra apróval napszak · időjárás; halsor = név + mélység;
    // fishShow / fishHide = összecsukás/kinyitás sora (a UI hozzáteszi: „ ▸” / „ ▴”, legfeljebb 157 px)
    'ui.prep.fish': 'Mi mikor kap',
    'ui.prep.fishNow': 'most',
    'ui.prep.fishTomorrow': 'holnap {time}',
    'ui.prep.fishDayAfter': 'holnapután {time}',
    'ui.prep.fishDay': '{n}. nap, {time}',
    'ui.prep.fishCond': '{period} · {weather}',
    'ui.prep.fishNone': 'csak a szokásos halak',
    'ui.prep.fishShow': { one: 'Későbbi órák ({n} változás)', other: 'Későbbi órák ({n} változás)' },
    'ui.prep.fishHide': 'Előrejelzés elrejtése',
    // csalikártya: hány darabot visz a játékos a merülésre
    'ui.prep.carry': { one: 'viszel {n} db', other: 'viszel {n} db' },
    'ui.prep.unlimited': 'korlátlan',
    // felszerelés ({ms} = tűrés ms-ban, {pct} = "60%")
    'ui.prep.noFloor': 'feneketlen',
    'ui.prep.limitLighthouse': 'Mélyebbre csak a 3. szintű Világítótorony enged.',
    'ui.prep.limitFloor': 'Egészen a tengerfenékig ér.',
    // Atomtó: a mondat a zsinór alatt legfeljebb 148 px (limitShipyard), a limitCore nem rövidül (≤ 150 px)
    'ui.prep.limitShipyard': 'Mélyebbre jobb Hajóműhely kell.',
    'ui.prep.limitCore': 'Egészen a reaktormagig ér.',
    'ui.prep.rodTolerance': 'ritmus +{ms} ms',
    'ui.prep.rodBasic': 'alap',
    'ui.prep.hookEscape': 'szökés –{pct}',
    'ui.prep.hookBasic': 'alap',
    'ui.prep.harpoons': 'Szigonyok',
    'ui.prep.harpoonCount': { one: '{n} db', other: '{n} db' },
    'ui.prep.harpoonNone': 'nincs',
    'ui.prep.harpoonLocked': 'Műhely 2-től',
    'ui.prep.storage': 'Kunyhó',
    'ui.prep.storageFull': 'tele — a zsákmányt azonnal eladod',
    // {stored} = hal a Kunyhóban, {n} = befogadóképesség
    'ui.prep.storageCount': { one: '{stored} / {n} hal', other: '{stored} / {n} hal' },
    // oldalsó panelek (PC)
    'ui.prep.panel.weather': 'Időjárás',
    'ui.prep.panel.weatherHint': 'A Meteoállomás megmutatja, milyen idő jön. Néhány hal csak esőben, ködben vagy viharban kap.',
    'ui.prep.panel.now': 'most',
    'ui.prep.panel.dayTime': '{day}, {time}',
    'ui.prep.panel.reach': 'Hatótáv',
    'ui.prep.panel.depthRule': 'Minél mélyebben vagy, annál többet nyom a hal a zsinóron: 500 méteren háromszor annyit.',
    'ui.prep.panel.keyDive': 'Enter  merülés',
    'ui.prep.panel.keyBack': 'Esc  vissza a faluba',
    'ui.prep.panel.keyBackPlant': 'Esc  vissza az erőműbe',
  });
})(globalThis.HL);
