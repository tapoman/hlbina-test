// Deutsch — gemeinsame Texte (ui/common.js, core/main.js, Sprachwahl, Tour-Zeile). Quelle: sk/ui_common.js.
(function (HL) {
  HL.i18n.add('de', 'ui_common', {
    // Speicher-Abzeichen (' — ' = hier darf ein langer Text in zwei wechselnde Hälften geteilt werden)
    'ui.common.save.nosave': 'Speichern aus',
    'ui.common.save.stale': 'In anderem Tab offen — wird nicht gespeichert',
    'ui.common.moreBelow': '↓ weiter',
    // Größen-Etikett des Fangs (HL.ui.tierTag) — kurz, als Reiter über dem Kampf-Panel
    'ui.common.tier.velky': 'BROCKEN',
    'ui.common.tier.trofejny': 'TROPHÄE',
    // Sprachwahl (Titel, Einstellungen)
    'ui.common.lang.title': 'Sprache',
    'ui.common.lang.soon': 'bald',
    'ui.common.close': 'Schließen',
    // Tour (HL.data.tripLine): "3 Tauchgänge · 5 Fische · 120 €" — ohne „Tour:“, sonst bricht die Zeile auf der
    // Karte an der Oberfläche (156 px) fast immer um (8/180 statt 137/180 einzeilig) und schiebt Abzeichen hinaus
    'ui.common.tripLine': '{dives} · {fish} · {value}',
    'ui.common.tripDives': { one: '{n} Tauchgang', other: '{n} Tauchgänge' },
    'ui.common.tripFish': { one: '{n} Fisch', other: '{n} Fische' },
    // Hinweis für ein quer gehaltenes Handy (im Seitenrand, zwei Zeilen)
    'ui.common.rotate1': 'Dreh das Handy',
    'ui.common.rotate2': 'hochkant',
    // Standard-Seitenleisten (PC); Steuerzeilen: Tasten / eingerückte Beschreibung
    'ui.common.panel.controls': 'Steuerung',
    'ui.common.panel.keysMove': 'A / D, Maus',
    'ui.common.panel.move': 'Haken seitwärts',
    'ui.common.panel.keysSink': 'S, linke Taste',
    'ui.common.panel.sink': 'sinken',
    'ui.common.panel.keysTap': 'Leertaste, Klick',
    'ui.common.panel.fight': 'Kampf mit Fisch',
    'ui.common.panel.up': 'HOCH',
    'ui.common.panel.harpoon': 'Harpune',
    'ui.common.panel.pause': 'Pause / zurück',
    'ui.common.panel.f2': 'F2 Regler',
    'ui.common.panel.f3': 'F3 Debug-Ausgabe',
    'ui.common.panel.money': 'Geld',
    'ui.common.panel.day': 'Tag',
    'ui.common.panel.time': 'Zeit',
    'ui.common.panel.weather': 'Wetter',
    'ui.common.panel.moon': 'Mond',
    // roter Balken unten bei einem Skriptfehler ({msg} = technische Meldung, nicht übersetzt)
    'ui.common.errorBar': 'FEHLER: {msg}',
  });
})(globalThis.HL);
