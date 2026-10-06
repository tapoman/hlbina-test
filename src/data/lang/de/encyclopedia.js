// Deutsch — Enzyklopädie (ui/encyclopedia.js). Quelle: sk/encyclopedia.js. Zeilenbeschriftung im Detail 50 px,
// Wert 112 px (bricht um), Name im Detail 118 px, Zeile unter dem Raster 168 px, Zone · Tiefe 110 px klein,
// Reiter ~84 px, Seitenleiste 94 px (Gruppe 64 px). Monate groß (deutsche Substantive).
(function (HL) {
  HL.i18n.add('de', 'encyclopedia', {
    'ui.encyclopedia.title': 'Enzyklopädie',
    'ui.encyclopedia.subCaught': 'Gefangen {caught} / {total}',
    'ui.encyclopedia.subFish': 'Art {i} / {total}',
    'ui.encyclopedia.subLegend': 'Legende {i} / {total}',
    'ui.encyclopedia.tabFish': 'Fische {caught}/{total}',
    'ui.encyclopedia.tabLegends': 'Legenden {caught}/{total}',
    'ui.encyclopedia.tabLake': 'See {caught}/{total}',   // 3. Reiter 56 px: „Atomsee 9/9“ = 55 px, zu eng
    'ui.encyclopedia.list': 'Liste',
    'ui.encyclopedia.back': 'Zurück',
    'ui.encyclopedia.backVillage': 'Zurück ins Dorf',
    'ui.encyclopedia.backPlant': 'Zurück zum Kraftwerk',
    // Rasterzelle: saisonale Art außerhalb des Ereignisses (klein, 38 px), Anzahl Fänge
    'ui.encyclopedia.cellSeasonal': 'saisonal',
    'ui.encyclopedia.cellCount': '×{n}',
    // Zeile unter dem Raster (Zeiger/Finger/Fokus)
    'ui.encyclopedia.tapFish': 'Tippe auf einen Fisch für Details.',
    'ui.encyclopedia.tapLegend': 'Tippe auf eine Legende für Details.',
    'ui.encyclopedia.seasonalHint': 'Saisonale Arten nur bei Ereignissen.',
    'ui.encyclopedia.seasonalFish': 'Saisonale Art',
    'ui.encyclopedia.seasonalLegend': 'Saisonale Legende',
    'ui.encyclopedia.eventMonths': '{event} · {months}',
    'ui.encyclopedia.monthRange': '{from} – {to}',
    'ui.encyclopedia.depthRange': '{from}–{to}',
    'ui.encyclopedia.zoneDepth': '{zone} · {depth}',
    // Status
    'ui.encyclopedia.caught': 'gefangen',
    'ui.encyclopedia.caughtTimes': '{n}× gefangen',
    'ui.encyclopedia.caughtLegend': 'gefangen ★',
    'ui.encyclopedia.notCaught': 'nicht gefangen',
    // Detail einer saisonalen Art ({desc} = Beschreibung des Ereignisses, ohne Punkt)
    'ui.encyclopedia.onlyDuring': 'Erscheint nur beim Ereignis {event} ({months}).',
    'ui.encyclopedia.onlyDuringUnknown': 'Erscheint nur bei einem Ereignis.',
    'ui.encyclopedia.eventDesc': '{desc}.',
    // Detail: Zeilenbeschriftung (höchstens 50 px)
    'ui.encyclopedia.row.cond': 'Wann',
    'ui.encyclopedia.row.bait': 'Köder',
    'ui.encyclopedia.row.baitOk': 'Auch auf',
    'ui.encyclopedia.row.rhythm': 'Rhythmus',
    'ui.encyclopedia.row.fight': 'Kampf',
    'ui.encyclopedia.row.hazards': 'Gefahren',
    'ui.encyclopedia.row.reward': 'Lohn',
    'ui.encyclopedia.row.price': 'Preis',
    'ui.encyclopedia.row.caught': 'Gefangen',
    'ui.encyclopedia.row.biggest': 'Rekord',
    'ui.encyclopedia.row.biggestLegend': 'Rekord',
    'ui.encyclopedia.row.first': 'Erstfang',
    // Detail: Werte ({list} = Rhythmen der Phasen mit Pfeil →)
    'ui.encyclopedia.phases': { one: '{n} Phase', other: '{n} Phasen' },
    'ui.encyclopedia.phasesList': { one: '{n} Phase: {list}', other: '{n} Phasen: {list}' },
    'ui.encyclopedia.rewardTrophy': '{reward} + Trophäe',   // {reward} = unlock.* (auch ein ganzer Satz) — „und“ klebte am Satz
    'ui.encyclopedia.pricePer': '{money} für {kg}',
    'ui.encyclopedia.pieces': { one: '{n} Stück', other: '{n} Stück' },
    'ui.encyclopedia.biggestTimes': '{kg} ({n}×)',
    'ui.encyclopedia.firstDay': 'Tag {day}',
    'ui.encyclopedia.clue': 'Die Kneipe verriet die Bedingungen.',   // 164 px
    'ui.encyclopedia.hint': '„{hint}“',
    // Gefahren einer Legende (Plural — Erscheinung, nicht ein Stück)
    'ui.encyclopedia.hazard.jelly': 'Quallen',
    'ui.encyclopedia.hazard.current': 'Strömungen',
    'ui.encyclopedia.hazard.lightning': 'Blitze',
    'ui.encyclopedia.hazard.rock': 'Felsen',
    // Monate der saisonalen Ereignisse, 0 = Januar
    'ui.encyclopedia.month.0': 'Januar',
    'ui.encyclopedia.month.1': 'Februar',
    'ui.encyclopedia.month.2': 'März',
    'ui.encyclopedia.month.3': 'April',
    'ui.encyclopedia.month.4': 'Mai',
    'ui.encyclopedia.month.5': 'Juni',
    'ui.encyclopedia.month.6': 'Juli',
    'ui.encyclopedia.month.7': 'August',
    'ui.encyclopedia.month.8': 'September',
    'ui.encyclopedia.month.9': 'Oktober',
    'ui.encyclopedia.month.10': 'November',
    'ui.encyclopedia.month.11': 'Dezember',
    // Seitenleisten (PC): links Fortschritt nach Zonen + Tasten (Beschreibung 46 px klein), rechts Rekorde
    'ui.encyclopedia.panel.zones': 'Zonen',
    'ui.encyclopedia.panel.seasonal': 'Saisonal',
    'ui.encyclopedia.panel.legends': 'Legenden',
    'ui.encyclopedia.panel.arrows': 'Pfeile',
    'ui.encyclopedia.panel.select': 'Auswahl',
    'ui.encyclopedia.panel.detail': 'Details',
    'ui.encyclopedia.panel.tabs': 'Fische/Legenden',   // 62 px klein
    'ui.encyclopedia.panel.lakeKey': 'See',           // Taste J = Reiter „See“
    'ui.encyclopedia.panel.lake': 'Atomsee',          // Gruppe unter Flachsee … Abgrund: „See“ allein klänge nach Meer
    'ui.encyclopedia.panel.back': 'zurück',
    'ui.encyclopedia.panel.records': 'Rekorde',
    'ui.encyclopedia.panel.dives': 'Tauchgänge',
    'ui.encyclopedia.panel.caught': 'Fische gefangen',
    'ui.encyclopedia.panel.deepest': 'Max. Tiefe',
    'ui.encyclopedia.panel.biggest': 'Größter Fang',
  });
})(globalThis.HL);
