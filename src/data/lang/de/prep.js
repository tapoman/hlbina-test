// Deutsch — Vorbereitung vor dem Tauchgang (ui/prep.js). Quelle: sk/prep.js. Ausrüstungs-Etikett rechts klein
// (~60 px), Satz unter der Schnur 156 px, Abschnittstitel 168 px, Seitenleiste 94 px, Tages-Etikett 34 px klein.
(function (HL) {
  HL.i18n.add('de', 'prep', {
    'ui.prep.title': 'Vorbereitung',
    'ui.prep.dive': 'ABTAUCHEN',
    'ui.prep.haul': 'BONUS',
    'ui.prep.haulToast': 'Bonus: ab {from} Fischen +{pct}. Entkommt dir ein Fisch im Kampf, sind alle Fische an der Leine weg!',
    // Abschnitte der Liste
    'ui.prep.bait': 'Köder',
    'ui.prep.gear': 'Ausrüstung',
    'ui.prep.reach': 'Wie weit die Schnur reicht',
    'ui.prep.hot': 'Heute am Markt gefragt',
    'ui.prep.hotNone': 'Heute nichts Besonderes.',
    'ui.prep.hotMult': '★ ×{mult}',
    // Bedingungen und Vorhersage (Tageszeilen: 34 px kleine Schrift fürs Etikett)
    'ui.prep.noForecast': 'Vorhersage erst mit Wetterstation.',
    'ui.prep.introSun': 'Die ersten Tauchgänge sind immer sonnig.',
    'ui.prep.today': 'heute',
    'ui.prep.tomorrow': 'morgen',
    'ui.prep.dayAfter': 'in 2 T.',                 // „übermorgen“ = 42 px, Etikett hat 34 px vor dem Balken
    // Fisch-Vorhersage (Abschnitt unter dem Wetter, 168 px): Zeit normal, rechts klein Tageszeit · Wetter; Fischzeile = Name + Tiefe;
    // fishShow / fishHide = Zeile auf-/zuklappen (UI hängt „ ▸“ / „ ▴“ an, höchstens 157 px — „Nächste Stunden (28 Änderungen)“ = 150)
    'ui.prep.fish': 'Was wann beißt',
    'ui.prep.fishNow': 'jetzt',
    'ui.prep.fishTomorrow': 'morgen {time}',
    'ui.prep.fishDayAfter': 'übermorgen {time}',
    'ui.prep.fishDay': 'Tag {n}, {time}',
    'ui.prep.fishCond': '{period} · {weather}',
    'ui.prep.fishNone': 'nur gewöhnliche Fische',
    'ui.prep.fishShow': { one: 'Später ({n} Änderung)', other: 'Später ({n} Änderungen)' },
    'ui.prep.fishHide': 'Vorhersage ausblenden',
    // Köderkarte: wie viele Stück der Spieler mitnimmt
    'ui.prep.carry': { one: 'dabei: {n} Stk.', other: 'dabei: {n} Stk.' },
    'ui.prep.unlimited': 'unbegrenzt',
    // Ausrüstung ({ms} = Toleranz in Millisekunden, {pct} = "60 %")
    'ui.prep.noFloor': 'bodenlos',
    'ui.prep.limitLighthouse': 'Tiefer erst mit Leuchtturm 3.',
    'ui.prep.limitFloor': 'Reicht bis zum Meeresgrund.',
    'ui.prep.limitShipyard': 'Tiefer erst mit besserer Werft.',   // Atomsee: Grenze setzt die Werft
    'ui.prep.limitCore': 'Reicht bis zum Kern.',                  // Atomsee: Grund = Reaktorkern
    'ui.prep.rodTolerance': 'Rhythmus +{ms} ms',
    'ui.prep.rodBasic': 'einfach',
    'ui.prep.hookEscape': 'Flucht –{pct}',
    'ui.prep.hookBasic': 'einfach',
    'ui.prep.harpoons': 'Harpunen',
    'ui.prep.harpoonCount': { one: '{n} Stk.', other: '{n} Stk.' },
    'ui.prep.harpoonNone': 'keine',
    'ui.prep.harpoonLocked': 'ab Werkstatt 2',
    'ui.prep.storage': 'Hütte',
    'ui.prep.storageFull': 'voll — Fang wird verkauft',   // rechts in der Zeile: je länger, desto kürzer der Name links
    // {stored} = Fische in der Hütte, {n} = Kapazität (Form nach der Kapazität)
    'ui.prep.storageCount': { one: '{stored} / {n} Fisch', other: '{stored} / {n} Fische' },
    // Seitenleisten (PC)
    'ui.prep.panel.weather': 'Wetter',
    'ui.prep.panel.weatherHint': 'Die Wetterstation zeigt, welches Wetter kommt. Manche Fische beißen nur bei Regen, Nebel oder Sturm.',
    'ui.prep.panel.now': 'jetzt',
    'ui.prep.panel.dayTime': '{day}, {time}',
    'ui.prep.panel.reach': 'Reichweite',
    'ui.prep.panel.depthRule': 'Je tiefer du bist, desto mehr wiegt der Fisch an der Schnur: in 500 Metern dreifach.',
    'ui.prep.panel.keyDive': 'Enter  abtauchen',
    'ui.prep.panel.keyBack': 'Esc  zurück ins Dorf',
    'ui.prep.panel.keyBackPlant': 'Esc  zum Kraftwerk',   // ohne „zurück“: sonst 102 px klein, Leiste hat ~94
  });
})(globalThis.HL);
