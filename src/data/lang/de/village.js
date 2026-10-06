// Deutsch — Dorf (ui/village.js). Quelle: sk/village.js. Seitenleisten 94 px (klein ≈ 4 px/Zeichen, bricht um),
// Schild über dem Gebäude bis ~170 px, Knopf AUFS MEER 104 px (Großbuchstaben 6 px), Anleitung 146 px pro Zeile.
(function (HL) {
  HL.i18n.add('de', 'village', {
    'ui.village.toSea': 'AUFS MEER',
    // Tippen auf Zeit/Wetter in der Kopfzeile (Toast): {period} = Tageszeit, {weather}/{next} = Wetter
    'ui.village.hud.now': '{period}, {weather}',
    'ui.village.hud.forecast': '{period}, {weather}. Um {time}: {next}',
    'ui.village.hud.noForecast': '{period}, {weather}. Die Vorhersage zeigt die Wetterstation.',
    // Schild über dem Gebäude (Zeiger/Fokus); {money} = Preis, {level} = Stufe
    'ui.village.tag.build': 'Bauen: {money}',
    'ui.village.tag.level': 'Stufe {level} · nächste {money}',
    'ui.village.tag.done': 'Stufe 3 · fertig',
    'ui.village.tag.sell': { one: '{n} Fisch verkaufen', other: '{n} Fische verkaufen' },
    'ui.village.tag.sellNone': 'Fische verkaufen',
    // Abschnitt der Vorhersage (auch Wetterstation): {from}–{to} = 06:00–09:00, {n} = Tagesnummer
    'ui.village.seg.today': '{from}–{to}',
    'ui.village.seg.tomorrow': 'morgen {from}–{to}',
    'ui.village.seg.later': 'Tag {n} {from}–{to}',
    // Anleitung beim ersten Besuch
    'ui.village.tut.title': 'Willkommen in Hlbina',
    'ui.village.tut.text': 'Aus einer verfallenen Hütte baust du ein Fischerdorf. Fahr AUFS MEER, fang Fische und verkauf sie auf dem Markt. Vom Geld baust du Gebäude — jedes schaltet etwas Neues frei.',
    'ui.village.tut.warn': 'Achtung: Jeder Fisch und jeder Meter Tiefe spannt die Schnur. Reißt sie, ist der Fang weg.',
    'ui.village.tut.ok': 'Verstanden',
    // Seitenleisten (PC): links Vorhersage und Mond, rechts Nachfrage, Lager, Aufträge
    'ui.village.panel.forecast': 'Vorhersage',
    'ui.village.panel.noMeteo': 'Bau die Wetterstation, dann siehst du, welches Wetter kommt.',
    'ui.village.panel.hours': 'für {h} h',
    'ui.village.panel.intro': 'Erste Tauchgänge: Auf See ist es ruhig und sonnig.',
    'ui.village.panel.moon': 'Mond',
    'ui.village.panel.today': 'Heute',
    'ui.village.panel.tomorrow': 'Morgen',
    'ui.village.panel.dayAfter': 'Übermorgen',
    'ui.village.panel.noMoon': 'Mondphasen zeigt die Wetterstation ab Stufe 3.',
    'ui.village.panel.hot': 'Heiß begehrt',
    'ui.village.panel.hotNone': 'Heute nichts Besonderes.',
    'ui.village.panel.hotMult': '×{mult}',
    'ui.village.panel.storage': 'Lager',
    // {got} Fische bei Kapazität {n}; Form nach der Kapazität ("3 / 5 Fische")
    'ui.village.panel.storageCount': { one: '{got} / {n} Fisch', other: '{got} / {n} Fische' },
    'ui.village.panel.sellHint': 'Verkauf sie auf dem Markt.',
    'ui.village.panel.quests': 'Aufträge',
    'ui.village.panel.questsLocked': 'Aufträge geben die Fischer in der Kneipe ab Stufe 2.',
    // Wegweiser zum Alten Kraftwerk (Atomsee, docs/JAZERO.md); Knopf AUF DEN SEE 104 px wie AUFS MEER
    'ui.village.plant.name': 'Altes Kraftwerk',
    'ui.village.plant.sub': 'Atomsee',
    'ui.village.plant.toLake': 'AUF DEN SEE',
    'ui.village.plant.intro': 'Bau die Werft und kauf im Labor Schnur und Rute für den See. Dann AUF DEN SEE.',
    'ui.village.plant.zones': 'Zonen des Sees',
    'ui.village.plant.reach': 'Reichweite im See',
    'ui.village.plant.fish': 'Fische im See',
  });
})(globalThis.HL);
