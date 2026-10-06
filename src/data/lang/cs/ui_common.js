// Čeština — spoločné texty obrazoviek (ui/common.js, core/main.js, výber jazyka, riadok výletu).
// Kľúče = src/data/lang/sk/ui_common.js; glosár v data.js.
(function (HL) {
  HL.i18n.add('cs', 'ui_common', {
    // odznak ukládání ( ' — ' = kde se dlouhý text smí rozdělit na střídající se poloviny)
    'ui.common.save.nosave': 'Hra se neukládá',
    'ui.common.save.stale': 'Hra je otevřená v jiné kartě — změny se neukládají',
    'ui.common.moreBelow': '↓ dál',
    // štítek velikosti kusu — krátký, kreslí se v záložce nad panelem boje
    'ui.common.tier.velky': 'VELKÝ KUS',
    'ui.common.tier.trofejny': 'TROFEJ',
    // výběr jazyka (titulka, Nastavení)
    'ui.common.lang.title': 'Jazyk',
    'ui.common.lang.soon': 'brzy',
    'ui.common.close': 'Zavřít',
    // výlet: "Výlet: 3 ponory · 5 ryb · 120 €"
    'ui.common.tripLine': 'Výlet: {dives} · {fish} · {value}',
    'ui.common.tripDives': { one: '{n} ponor', few: '{n} ponory', other: '{n} ponorů' },
    'ui.common.tripFish': { one: '{n} ryba', few: '{n} ryby', other: '{n} ryb' },
    // rada pro telefon na šířku (v bočním okraji, dva řádky)
    'ui.common.rotate1': 'Otoč telefon',
    'ui.common.rotate2': 'na výšku',
    // výchozí boční panely (PC); řádky ovládání: klávesy / odsazený popis
    'ui.common.panel.controls': 'Ovládání',
    'ui.common.panel.keysMove': 'A / D, myš',
    'ui.common.panel.move': 'háček do stran',
    'ui.common.panel.keysSink': 'S, levé tlačítko',
    'ui.common.panel.sink': 'klesání',
    'ui.common.panel.keysTap': 'Mezerník, klik',
    'ui.common.panel.fight': 'boj s rybou',
    'ui.common.panel.up': 'NAHORU',
    'ui.common.panel.harpoon': 'harpuna',
    'ui.common.panel.pause': 'pauza / zpět',
    'ui.common.panel.f2': 'F2 ladění',
    'ui.common.panel.f3': 'F3 ladicí výpis',
    'ui.common.panel.money': 'Peníze',
    'ui.common.panel.day': 'Den',
    'ui.common.panel.time': 'Čas',
    'ui.common.panel.weather': 'Počasí',
    'ui.common.panel.moon': 'Měsíc',
    // červený pruh dole při chybě skriptu ({msg} = technická zpráva, nepřekládá se)
    'ui.common.errorBar': 'CHYBA: {msg}',
  });
})(globalThis.HL);
