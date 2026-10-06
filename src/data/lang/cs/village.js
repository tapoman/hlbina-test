// Čeština — scéna ui/village.js (vesnice). Kľúče = src/data/lang/sk/village.js; glosár v data.js.
// Šírky: bočné panely 94 px, menovka budovy do ~170 px, NA MOŘE 104 px, návod 146 px na riadok.
(function (HL) {
  HL.i18n.add('cs', 'village', {
    'ui.village.toSea': 'NA MOŘE',
    // ťuk na čas/počasí v hlavičce (toast): {period} = část dne, {weather}/{next} = počasí malým písmenem
    'ui.village.hud.now': '{period}, {weather}',
    'ui.village.hud.forecast': '{period}, {weather}. Od {time}: {next}',
    'ui.village.hud.noForecast': '{period}, {weather}. Předpověď ukáže Meteostanice.',
    // jmenovka nad budovou; {money} = cena, {level} = úroveň
    'ui.village.tag.build': 'Postavit: {money}',
    'ui.village.tag.level': 'Úroveň {level} · další {money}',
    'ui.village.tag.done': 'Úroveň 3 · hotovo',
    'ui.village.tag.sell': { one: 'Prodej {n} rybu', few: 'Prodej {n} ryby', other: 'Prodej {n} ryb' },
    'ui.village.tag.sellNone': 'Prodej ryb',
    // úsek předpovědi (i obrazovka Meteostanice): {from}–{to} = hodiny, {n} = číslo dne
    'ui.village.seg.today': '{from}–{to}',
    'ui.village.seg.tomorrow': 'zítra {from}–{to}',
    'ui.village.seg.later': 'den {n} {from}–{to}',
    // návod při první návštěvě
    'ui.village.tut.title': 'Vítej v Hlbině',
    // NA MOŘE = nezlomiteľná medzera: nápis tlačidla sa nesmie rozdeliť na dva riadky
    'ui.village.tut.text': 'Z rozpadlé chatrče postavíš rybářskou vesnici. Vyraz NA MOŘE, chyť ryby a prodej je na Tržišti. Za vydělané peníze stav budovy — každá odemkne něco nového.',
    'ui.village.tut.warn': 'Pozor: každá ryba a každý metr hloubky napíná vlasec. Když praskne, úlovek je pryč.',
    'ui.village.tut.ok': 'Rozumím',
    // boční panely (PC): vlevo předpověď a měsíc, vpravo poptávka, sklad, úkoly
    'ui.village.panel.forecast': 'Předpověď',
    'ui.village.panel.noMeteo': 'Postav Meteostanici a uvidíš, jaké počasí přijde.',
    'ui.village.panel.hours': 'na {h} h',
    'ui.village.panel.intro': 'První ponory: na moři bude klid a slunce.',
    'ui.village.panel.moon': 'Měsíc',
    'ui.village.panel.today': 'Dnes',
    'ui.village.panel.tomorrow': 'Zítra',
    'ui.village.panel.dayAfter': 'Pozítří',
    'ui.village.panel.noMoon': 'Fáze měsíce ukáže Meteostanice na úrovni 3.',
    'ui.village.panel.hot': 'Horká poptávka',
    'ui.village.panel.hotNone': 'Dnes nic mimořádného.',
    'ui.village.panel.hotMult': '×{mult}',
    'ui.village.panel.storage': 'Sklad',
    // {got} ryb z kapacity {n}; tvar podle kapacity ("3 / 5 ryb")
    'ui.village.panel.storageCount': { one: '{got} / {n} ryba', few: '{got} / {n} ryby', other: '{got} / {n} ryb' },
    'ui.village.panel.sellHint': 'Prodej je na Tržišti.',
    'ui.village.panel.quests': 'Úkoly',
    'ui.village.panel.questsLocked': 'Úkoly dávají rybáři v Hospodě od úrovně 2.',
    // rozcestník do Staré elektrárny (jaderné jezero, docs/JAZERO.md); NA JEZERO = tlačítko 104 px
    'ui.village.plant.name': 'Stará elektrárna',
    'ui.village.plant.sub': 'Jaderné jezero',
    'ui.village.plant.toLake': 'NA JEZERO',
    // NA JEZERO = nezlomiteľná medzera (ako NA MOŘE v tut.text): nápis tlačidla sa v toaste nerozdelí
    'ui.village.plant.intro': 'Postav Loděnici a v Laboratoři kup jezerní vlasec a prut. Pak NA JEZERO.',
    'ui.village.plant.zones': 'Pásma jezera',
    'ui.village.plant.reach': 'Dosah v jezeře',
    'ui.village.plant.fish': 'Ryby jezera',
  });
})(globalThis.HL);
