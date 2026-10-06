// Slovenčina — Nekonečná hlbina, ponuka režimu (ui/endless.js). ZDROJ prekladu (docs/I18N.md). Kľúče ui.endless.*
// Šírky: vety 164 px (zalomia sa), meno výbavy 60–71 px, hlavička rebríčka drobným písmom zarovnaná
// doprava (Hĺbka ~50 px, Úlovok ~55 px, Deň len ~34 px),
// text pri zámku 106 px, tlačidlo 168 px, bočný panel 94 px. {every} = "250 m" (HL.util.meters).
(function (HL) {
  HL.i18n.add('sk', 'endless', {
    'ui.endless.title': 'Nekonečná hlbina',
    'ui.endless.subUnlocked': 'Maják 3 · odomknuté',
    'ui.endless.locked': 'Zamknuté',
    'ui.endless.dive': 'PONORIŤ SA',
    'ui.endless.descUnlocked': 'Jeden dlhý ponor bez dediny a trhu, s pevnou výbavou. Každých {every} vyberieš 1 z 3 vylepšení. Cieľ: čo najhlbšie a s najcennejším úlovkom.',
    'ui.endless.descLocked': 'Jeden dlhý ponor bez dediny a trhu, s pevnou výbavou. Každých {every} si vyberieš 1 z 3 vylepšení.',
    // pevná výbava (ostatné mená z dát)
    'ui.endless.gear': 'Pevná výbava',
    'ui.endless.harpoons': 'Harpúna ×{n}',
    'ui.endless.baitMix': 'Zmes návnad',
    // rebríček
    'ui.endless.board': 'Rebríček · top 10',
    'ui.endless.boardEmpty': 'Zatiaľ prázdny. Prvý ponor sa zapíše sem — hĺbka aj hodnota úlovku.',
    'ui.endless.col.depth': 'Hĺbka',
    'ui.endless.col.value': 'Úlovok',
    'ui.endless.col.day': 'Deň',
    'ui.endless.rank': '{n}.',
    'ui.endless.boardNote': 'Rebríček je len v tomto zariadení. Svetové rebríčky (Steam, Game Center) webová verzia nemá.',
    // CrazyGames: rebríček je v účte hráča (SDK.data), iné platformy sa nespomínajú (ui/endless.js)
    'ui.endless.boardNoteCg': 'Rebríček sa ukladá spolu s tvojím postupom.',
    'ui.endless.perksExample': 'Vylepšenia, napríklad',
    // zamknuté
    'ui.endless.unlockBy': 'Odomkne ju Maják na úrovni 3.',
    'ui.endless.yourMajak': 'Tvoj Maják',
    'ui.endless.level': 'úroveň {level} / 3',
    'ui.endless.majakAlso': 'Maják na úrovni 3 odomkne aj Priepasť v kariére. Treba k nemu chytiť Hmlistú dámu.',
    // bočné panely (PC)
    'ui.endless.panel.perks': 'Vylepšenia',
    'ui.endless.panel.every': 'každých {every}, 1 z 3',
    'ui.endless.panel.records': 'Rekordy',
    'ui.endless.panel.deepest': 'Najhlbšie',
    'ui.endless.panel.richest': 'Najcennejší úlovok',
    'ui.endless.panel.entries': 'Záznamov',
    'ui.endless.panel.keyDive': 'S / Enter: ponoriť sa',
    'ui.endless.panel.keyBack': 'Esc: späť',
  });
})(globalThis.HL);
