// Slovenčina — spoločné texty obrazoviek (ui/common.js, core/main.js, výber jazyka, riadok výletu).
// ZDROJ prekladu (docs/I18N.md). Kľúče ui.common.*
(function (HL) {
  HL.i18n.add('sk', 'ui_common', {
    // odznak ukladania ( ' — ' = kde sa dlhý text smie rozdeliť na striedajúce sa polovice)
    'ui.common.save.nosave': 'Hra sa neukladá',
    'ui.common.save.stale': 'Hra je otvorená v inej karte — zmeny sa neukladajú',
    'ui.common.moreBelow': '↓ ďalej',
    // štítok veľkosti kusu (HL.ui.tierTag) — krátky, kreslí sa v záložke nad panelom boja
    'ui.common.tier.velky': 'VEĽKÝ KUS',
    'ui.common.tier.trofejny': 'TROFEJ',
    // výber jazyka (titulka, Nastavenia)
    'ui.common.lang.title': 'Jazyk',
    'ui.common.lang.soon': 'čoskoro',
    'ui.common.close': 'Zavrieť',
    // výlet (HL.data.tripLine): "Výlet: 3 ponory · 5 rýb · 120 €"
    'ui.common.tripLine': 'Výlet: {dives} · {fish} · {value}',
    'ui.common.tripDives': { one: '{n} ponor', few: '{n} ponory', other: '{n} ponorov' },
    'ui.common.tripFish': { one: '{n} ryba', few: '{n} ryby', other: '{n} rýb' },
    // rada pre telefón na šírku (v bočnom okraji, dva riadky)
    'ui.common.rotate1': 'Otoč telefón',
    'ui.common.rotate2': 'na výšku',
    // predvolené bočné panely (PC); riadky ovládania: klávesy / odsadený popis
    'ui.common.panel.controls': 'Ovládanie',
    'ui.common.panel.keysMove': 'A / D, myš',
    'ui.common.panel.move': 'háčik do strán',
    'ui.common.panel.keysSink': 'S, ľavé tlačidlo',
    'ui.common.panel.sink': 'klesanie',
    'ui.common.panel.keysTap': 'Medzerník, klik',
    'ui.common.panel.fight': 'boj s rybou',
    'ui.common.panel.up': 'HORE',
    'ui.common.panel.harpoon': 'harpúna',
    'ui.common.panel.pause': 'pauza / späť',
    'ui.common.panel.f2': 'F2 ladenie',
    'ui.common.panel.f3': 'F3 ladiaci výpis',
    'ui.common.panel.money': 'Peniaze',
    'ui.common.panel.day': 'Deň',
    'ui.common.panel.time': 'Čas',
    'ui.common.panel.weather': 'Počasie',
    'ui.common.panel.moon': 'Mesiac',
    // červený pruh dole pri chybe skriptu ({msg} = technická správa, neprekladá sa)
    'ui.common.errorBar': 'CHYBA: {msg}',
  });
})(globalThis.HL);
