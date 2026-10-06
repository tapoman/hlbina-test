// Slovenčina — texty scény ui/village.js (dedina). ZDROJ prekladu (docs/I18N.md). Kľúče ui.village.*
// Šírky: bočné panely 94 px (drobné písmo ≈ 4 px na znak, riadok sa láme), menovka budovy do ~170 px,
// hlavné tlačidlo NA MORE 104 px (verzálky 6 px na znak), návod 146 px na riadok (láme sa).
(function (HL) {
  HL.i18n.add('sk', 'village', {
    'ui.village.toSea': 'NA MORE',
    // ťuk na čas/počasie v hlavičke (toast): {period} = časť dňa, {weather}/{next} = počasie malým písmenom
    'ui.village.hud.now': '{period}, {weather}',
    'ui.village.hud.forecast': '{period}, {weather}. O {time}: {next}',
    'ui.village.hud.noForecast': '{period}, {weather}. Predpoveď ukáže Meteostanica.',
    // menovka nad budovou (kurzor/fokus); {money} = cena, {level} = úroveň
    'ui.village.tag.build': 'Postaviť: {money}',
    'ui.village.tag.level': 'Úroveň {level} · ďalšia {money}',
    'ui.village.tag.done': 'Úroveň 3 · hotovo',
    'ui.village.tag.sell': { one: 'Predaj {n} rybu', few: 'Predaj {n} ryby', other: 'Predaj {n} rýb' },
    'ui.village.tag.sellNone': 'Predaj rýb',
    // úsek predpovede (aj obrazovka Meteostanice): {from}–{to} = hodiny 06:00–09:00, {n} = číslo dňa
    'ui.village.seg.today': '{from}–{to}',
    'ui.village.seg.tomorrow': 'zajtra {from}–{to}',
    'ui.village.seg.later': 'deň {n} {from}–{to}',
    // návod pri prvej návšteve
    'ui.village.tut.title': 'Vitaj v Hlbine',
    'ui.village.tut.text': 'Z rozpadnutej chatrče postavíš rybársku dedinu. Choď NA MORE, chyť ryby a predaj ich na Trhovisku. Za zarobené peniaze staviaj budovy — každá odomkne niečo nové.',
    'ui.village.tut.warn': 'Pozor: každá ryba a každý meter hĺbky napína vlasec. Keď praskne, úlovok je preč.',
    'ui.village.tut.ok': 'Rozumiem',
    // bočné panely (PC): vľavo predpoveď a mesiac, vpravo dopyt, úložisko, úlohy
    'ui.village.panel.forecast': 'Predpoveď',
    'ui.village.panel.noMeteo': 'Postav Meteostanicu a uvidíš, aké počasie príde.',
    'ui.village.panel.hours': 'na {h} h',
    'ui.village.panel.intro': 'Prvé ponory: na mori bude pokoj a slnko.',
    'ui.village.panel.moon': 'Mesiac',
    'ui.village.panel.today': 'Dnes',
    'ui.village.panel.tomorrow': 'Zajtra',
    'ui.village.panel.dayAfter': 'Pozajtra',
    'ui.village.panel.noMoon': 'Fázy mesiaca ukáže Meteostanica na úrovni 3.',
    'ui.village.panel.hot': 'Horúci dopyt',
    'ui.village.panel.hotNone': 'Dnes nič mimoriadne.',
    'ui.village.panel.hotMult': '×{mult}',
    'ui.village.panel.storage': 'Úložisko',
    // {got} rýb z kapacity {n}; tvar podľa kapacity ("3 / 5 rýb")
    'ui.village.panel.storageCount': { one: '{got} / {n} ryba', few: '{got} / {n} ryby', other: '{got} / {n} rýb' },
    'ui.village.panel.sellHint': 'Predaj ich na Trhovisku.',
    'ui.village.panel.quests': 'Úlohy',
    'ui.village.panel.questsLocked': 'Úlohy dávajú rybári v Krčme od úrovne 2.',
    // rázcestník do Starej elektrárne (jadrové jazero, docs/JAZERO.md)
    'ui.village.plant.name': 'Stará elektráreň',
    'ui.village.plant.sub': 'Jadrové jazero',
    'ui.village.plant.toLake': 'NA JAZERO',
    'ui.village.plant.intro': 'Postav Lodenicu a v Laboratóriu kúp jazerný vlasec a prút. Potom NA JAZERO.',
    'ui.village.plant.zones': 'Pásma jazera',
    'ui.village.plant.reach': 'Dosah v jazere',
    'ui.village.plant.fish': 'Ryby jazera',
  });
})(globalThis.HL);
