// Polski — Nieskończona głębia, menu trybu (ui/endless.js). Źródło: src/data/lang/sk/endless.js.
// Słowniczek: src/data/lang/pl/data.js. Szerokości: zdania 164 px (łamią się), nazwa sprzętu 60–71 px, nagłówek
// rankingu drobnym pismem wyrównany do prawej (Głębokość ~50 px, Połów ~55 px, Dzień tylko ~34 px),
// tekst przy kłódce 106 px, przycisk 168 px, panel boczny 94 px. {every} = "250 m" (HL.util.meters).
(function (HL) {
  HL.i18n.add('pl', 'endless', {
    'ui.endless.title': 'Nieskończona głębia',
    'ui.endless.subUnlocked': 'Latarnia 3 · odblokowane',
    'ui.endless.locked': 'Zablokowane',
    'ui.endless.dive': 'ZANURZ SIĘ',
    // 4 / 3 wiersze po 164 px jak sk (5. wiersz spychał tablicę pod przycisk) i „250 m” nie rozdziela się na końcu wiersza
    'ui.endless.descUnlocked': 'Jedno długie zanurzenie bez wioski i targu, stały sprzęt. Co {every} wybierasz 1 z 3 ulepszeń. Cel: jak najgłębiej i jak najcenniej.',
    'ui.endless.descLocked': 'Jedno długie zanurzenie bez wioski i targu, stały sprzęt. Co {every} wybierasz 1 z 3 ulepszeń.',
    // stały sprzęt (pozostałe nazwy z danych)
    'ui.endless.gear': 'Stały sprzęt',
    'ui.endless.harpoons': 'Harpun ×{n}',
    'ui.endless.baitMix': 'Mix przynęt',
    // ranking
    'ui.endless.board': 'Ranking · top 10',
    'ui.endless.boardEmpty': 'Na razie pusto. Pierwsze zanurzenie zapisze się tutaj — głębokość i wartość połowu.',
    'ui.endless.col.depth': 'Głębokość',
    'ui.endless.col.value': 'Połów',
    'ui.endless.col.day': 'Dzień',
    'ui.endless.rank': '{n}.',
    // 3 wiersze po 158 px jak sk — 4. wiersz wchodził na przycisk ZANURZ SIĘ (tablica rośnie w dół)
    'ui.endless.boardNote': 'Ranking jest tylko na tym urządzeniu. Wersja webowa nie ma rankingów Steam i Game Center.',
    'ui.endless.boardNoteCg': 'Ranking zapisuje się razem z twoimi postępami.',
    'ui.endless.perksExample': 'Ulepszenia, na przykład',
    // zablokowane
    'ui.endless.unlockBy': 'Odblokuje ją Latarnia na poziomie 3.',
    'ui.endless.yourMajak': 'Twoja Latarnia',
    'ui.endless.level': 'poziom {level} / 3',
    'ui.endless.majakAlso': 'Latarnia na poziomie 3 otworzy też Otchłań w karierze. Trzeba do niej złowić Mglistą damę.',
    // panele boczne (PC)
    'ui.endless.panel.perks': 'Ulepszenia',
    'ui.endless.panel.every': 'co {every}, 1 z 3',
    'ui.endless.panel.records': 'Rekordy',
    'ui.endless.panel.deepest': 'Najgłębiej',
    'ui.endless.panel.richest': 'Najcenniejszy połów',
    'ui.endless.panel.entries': 'Wpisów',
    'ui.endless.panel.keyDive': 'S / Enter: zanurz się',
    'ui.endless.panel.keyBack': 'Esc: wróć',
  });
})(globalThis.HL);
