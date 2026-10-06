// Preklad hu / village — dedina (ui/village.js). Kľúče = src/data/lang/sk/village.js. Szójegyzék: hu/data.js.
// Szélességek: oldalsó panelek 94 px (apró ≈ 4 px/betű, tördel), épület címkéje ~170 px, A TENGERRE gomb 104 px
// (nagybetű 6 px), útmutató 146 px soronként (tördel). {time}-kor: a -kor rag nem függ a számtól.
(function (HL) {
  HL.i18n.add('hu', 'village', {
    'ui.village.toSea': 'A TENGERRE',
    // koppintás az időre/időjárásra a fejlécben (toast): {period} = napszak, {weather}/{next} = időjárás kisbetűvel
    'ui.village.hud.now': '{period}, {weather}',
    'ui.village.hud.forecast': '{period}, {weather}. {time}-kor: {next}',
    'ui.village.hud.noForecast': '{period}, {weather}. Előrejelzést a Meteoállomás ad.',
    // címke az épület fölött; {money} = ár, {level} = szint
    'ui.village.tag.build': 'Építés: {money}',
    'ui.village.tag.level': '{level}. szint · következő: {money}',
    'ui.village.tag.done': '3. szint · kész',
    'ui.village.tag.sell': { one: 'Adj el {n} halat', other: 'Adj el {n} halat' },
    'ui.village.tag.sellNone': 'Halak eladása',
    // az előrejelzés szakasza: {from}–{to} = órák 06:00–09:00, {n} = a nap száma
    'ui.village.seg.today': '{from}–{to}',
    'ui.village.seg.tomorrow': 'holnap {from}–{to}',
    'ui.village.seg.later': '{n}. nap {from}–{to}',
    // útmutató az első látogatáskor
    'ui.village.tut.title': 'Üdv Hlbinában!',
    'ui.village.tut.text': 'Egy düledező kunyhóból halászfalut építesz. Menj A TENGERRE, fogj halat, és add el a Piacon. A megkeresett pénzből építkezz — minden épület valami újat nyit meg.',
    'ui.village.tut.warn': 'Vigyázz: minden hal és a mélység minden métere feszíti a zsinórt. Ha elszakad, a zsákmány odavész.',
    'ui.village.tut.ok': 'Értem',
    // oldalsó panelek (PC): bal oldalt előrejelzés és hold, jobb oldalt kereslet, raktár, feladatok
    'ui.village.panel.forecast': 'Előrejelzés',
    'ui.village.panel.noMeteo': 'Építs Meteoállomást, és látni fogod, milyen idő jön.',
    'ui.village.panel.hours': '{h} órára',
    'ui.village.panel.intro': 'Első merülések: nyugodt tenger és napsütés.',
    'ui.village.panel.moon': 'Hold',
    'ui.village.panel.today': 'Ma',
    'ui.village.panel.tomorrow': 'Holnap',
    'ui.village.panel.dayAfter': 'Holnapután',
    'ui.village.panel.noMoon': 'A hold fázisait a 3. szintű Meteoállomás mutatja.',
    'ui.village.panel.hot': 'Nagy kereslet',
    'ui.village.panel.hotNone': 'Ma semmi különös.',
    'ui.village.panel.hotMult': '×{mult}',
    'ui.village.panel.storage': 'Raktár',
    // {got} hal a {n} befogadóképességből
    'ui.village.panel.storageCount': { one: '{got} / {n} hal', other: '{got} / {n} hal' },
    'ui.village.panel.sellHint': 'Add el őket a Piacon.',
    'ui.village.panel.quests': 'Feladatok',
    'ui.village.panel.questsLocked': 'Feladatot a halászok a Kocsma 2. szintjétől adnak.',
    // útjelző a Régi erőműhöz (Atomtó, docs/JAZERO.md); AZ ATOMTÓRA gomb 104 px, a bevezető toast 150 px soronként
    'ui.village.plant.name': 'Régi erőmű',
    'ui.village.plant.sub': 'Atomtó',
    'ui.village.plant.toLake': 'AZ ATOMTÓRA',
    'ui.village.plant.intro': 'Hajóműhely kell, és tavi zsinór meg bot a Laboratóriumból. Aztán AZ ATOMTÓRA!',
    'ui.village.plant.zones': 'A tó zónái',
    'ui.village.plant.reach': 'Hatótáv a tóban',
    'ui.village.plant.fish': 'A tó halai',
  });
})(globalThis.HL);
