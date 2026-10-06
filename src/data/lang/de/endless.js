// Deutsch — Endlose Tiefe, Modusmenü (ui/endless.js). Quelle: sk/endless.js. Sätze 164 px (brechen um),
// Ausrüstungsname 60–71 px, Kopf der Rangliste klein und rechtsbündig (Tiefe ~50 px, Fang ~55 px, Tag ~34 px),
// Text beim Schloss 106 px, Knopf 168 px, Seitenleiste 94 px. {every} = "250 m" (HL.util.meters).
(function (HL) {
  HL.i18n.add('de', 'endless', {
    'ui.endless.title': 'Endlose Tiefe',
    'ui.endless.subUnlocked': 'Leuchtturm 3 · frei',
    'ui.endless.locked': 'Gesperrt',
    'ui.endless.dive': 'ABTAUCHEN',
    'ui.endless.descUnlocked': 'Ein langer Tauchgang ohne Dorf und Markt, mit fester Ausrüstung. Alle {every} wählst du 1 von 3 Verbesserungen. Ziel: so tief wie möglich und mit dem wertvollsten Fang.',
    'ui.endless.descLocked': 'Ein langer Tauchgang ohne Dorf und Markt, mit fester Ausrüstung. Alle {every} wählst du 1 von 3 Verbesserungen.',
    // feste Ausrüstung (andere Namen aus den Daten)
    'ui.endless.gear': 'Feste Ausrüstung',
    'ui.endless.harpoons': 'Harpune ×{n}',
    'ui.endless.baitMix': 'Ködermix',
    // Rangliste
    'ui.endless.board': 'Rangliste · Top 10',
    'ui.endless.boardEmpty': 'Noch leer. Der erste Tauchgang landet hier — Tiefe und Wert des Fangs.',
    'ui.endless.col.depth': 'Tiefe',
    'ui.endless.col.value': 'Fang',
    'ui.endless.col.day': 'Tag',
    'ui.endless.rank': '{n}.',
    'ui.endless.boardNote': 'Die Rangliste gibt es nur auf diesem Gerät. Weltranglisten (Steam, Game Center) hat die Webversion nicht.',
    'ui.endless.boardNoteCg': 'Die Rangliste wird zusammen mit deinem Fortschritt gespeichert.',
    'ui.endless.perksExample': 'Verbesserungen, zum Beispiel',
    // gesperrt
    'ui.endless.unlockBy': 'Freigeschaltet durch Leuchtturm Stufe 3.',
    'ui.endless.yourMajak': 'Dein Leuchtturm',
    'ui.endless.level': 'Stufe {level} / 3',
    'ui.endless.majakAlso': 'Leuchtturm Stufe 3 öffnet auch den Abgrund in der Karriere. Dafür musst du die Nebeldame fangen.',
    // Seitenleisten (PC)
    'ui.endless.panel.perks': 'Verbesserungen',
    'ui.endless.panel.every': 'alle {every}, 1 von 3',
    'ui.endless.panel.records': 'Rekorde',
    'ui.endless.panel.deepest': 'Max. Tiefe',
    'ui.endless.panel.richest': 'Wertvollster Fang',
    'ui.endless.panel.entries': 'Einträge',
    'ui.endless.panel.keyDive': 'S / Enter: abtauchen',
    'ui.endless.panel.keyBack': 'Esc: zurück',
  });
})(globalThis.HL);
