// Deutsch — Ergebnis des Tauchgangs und Spielende (ui/results.js). Quelle: sk/results.js.
// Breiten: Sätze in der Liste 168 px (brechen um), Untertitel 168 px klein, Fisch-Etiketten klein (~40 px),
// Knöpfe 86 / 78 / 168 px, Seitenleiste 94 px. {n} = Anzahl; Geld/Gewicht/Tiefe kommen fertig formatiert.
(function (HL) {
  HL.i18n.add('de', 'results', {
    'ui.results.title': 'Ergebnis',
    'ui.results.titleEndless': 'Endlose Tiefe',
    // Überschrift (doppelte Schrift, Umriss) und Zeile darunter ({depth} = "40 m", {min} = Minuten)
    'ui.results.safe': 'GESICHERT',
    'ui.results.snapped': 'GERISSEN!',
    'ui.results.headline': 'Bis {depth} · {min} min unter Wasser',
    'ui.results.endlessSafe': 'GESICHERT · tiefster Punkt · {min} min',
    'ui.results.endlessSnapped': 'GERISSEN · tiefster Punkt · {min} min',
    // Etiketten in der Fischzeile (kleine Großbuchstaben auf farbigem Streifen)
    'ui.results.tag.new': 'NEUE ART',
    'ui.results.tag.record': 'REKORD',
    'ui.results.tag.legend': 'LEGENDE',
    'ui.results.tag.sold': 'VERKAUFT',
    'ui.results.tag.shark': 'HAI-BEUTE',
    'ui.results.tag.knot': 'KNOTEN',
    // Riss: was verloren ging (Wurm = Grundköder, sonst "Köder")
    'ui.results.lostWorm': 'Du hast den Wurm verloren.',
    'ui.results.lostBait': 'Du hast den Köder verloren.',
    'ui.results.lostFishWorm': { one: 'Du hast {n} Fisch und den Wurm verloren.', other: 'Du hast {n} Fische und den Wurm verloren.' },
    'ui.results.lostFishBait': { one: 'Du hast {n} Fisch und den Köder verloren.', other: 'Du hast {n} Fische und den Köder verloren.' },
    // Rat nach dem Riss je nach Ursache (Panel 168 px, bricht um)
    'ui.results.tipTitle': 'Rat der Fischer',
    'ui.results.tip.jelly': 'Eine Qualle spannt die Schnur drei Sekunden lang. Mit voller Schnur weich ihr aus oder geh HOCH.',
    'ui.results.tip.spikes': 'Bei ROT nicht tippen — jedes Tippen reißt an der Schnur und die Spannung springt hoch.',
    'ui.results.tip.fight': 'Vor großen Fischen musst du keine Angst haben. Schlimmer ist der Kampf, wenn die Schnur schon voll ist.',
    'ui.results.tip.octopus': 'Einen Kraken schüttelst du ab, indem du den Haken hin und her reißt.',
    'ui.results.tip.hazard': 'Eine Legende zieht auch mit Strömung und Blitzen. Lass auf der Schnur viel Reserve.',
    'ui.results.tip.eel': 'Bleib im Abgrund nicht stehen. Genau darauf wartet der Schattenaal.',
    'ui.results.tip.rock': 'Ein Fels schwächt die Schnur dauerhaft, bis du auftauchst. Sei nach einem Stoß vorsichtiger.',
    'ui.results.tip.barrel': 'Ein rostiges Fass schwächt die Schnur dauerhaft, bis du auftauchst. Sei nach einem Stoß vorsichtiger.',
    'ui.results.tip.depth': 'Sinkst du mit voller Schnur tiefer, steigt die Spannung auch ohne neuen Fisch. Geh früher HOCH.',
    // Sommerfest: Turnier des Tages ({fish} = Fischname, {kg}/{target}/{best} = "1,4 kg", {money} = "150 €")
    'ui.results.contest': 'Tagesturnier',
    'ui.results.contestWon': 'Gewonnen! {fish} {kg} ist schwerer als das Ziel {target}.',
    'ui.results.contestPrizePaid': 'Gewinn +{money} ist auf dem Konto.',
    'ui.results.contestPrizeLater': 'Gewinn +{money} kommt beim Tageswechsel.',
    'ui.results.contestBest': 'Dein schwerster {best} / Ziel {target}',
    'ui.results.contestWonToday': 'Heute schon gewonnen — Gewinn {money} kommt beim Tageswechsel.',
    'ui.results.contestHint': 'Ein schwererer Fisch gewinnt {money}.',
    'ui.results.contestPrize': 'Turniergewinn +{money} ist auf dem Konto.',
    // Verlauf des Tauchgangs (Zahlen), Gefahren mit " · " verbunden
    'ui.results.stats': 'Verlauf',
    'ui.results.statsFights': 'Kämpfe {fights} · gefangen {landed} · entkommen {escaped}',
    'ui.results.statsTaps': 'Treffer {good} · Fehltipps {bad}',
    'ui.results.hazards': 'Gefahren: {list}',
    'ui.results.hazJelly': 'Quallen {n}',
    'ui.results.hazRock': 'Felsen {n}',
    'ui.results.hazBarrel': 'Fässer {n}',         // Atomsee
    'ui.results.hazShark': 'Hai fraß {n}',
    // Endlose Tiefe
    'ui.results.rank': '{rank}. Platz der Rangliste',
    'ui.results.noRank': 'Nicht in der Rangliste (Top 10)',
    'ui.results.catchValue': 'Wert des Fangs',
    'ui.results.perks': 'Verbesserungen',
    'ui.results.perkStack': '{perk} ×{n}',
    'ui.results.noPerks': 'Keine — du kamst nicht bis 250 m.',
    'ui.results.catchCount': 'Fang ({n})',
    'ui.results.allLost': 'Das Meer hat alles genommen.',
    'ui.results.noCatch': 'Kein Fang.',
    'ui.results.lost': 'Verloren',
    // GESICHERT (Karriere); {stored}/{cap} = Belegung der Hütte
    'ui.results.empty': 'Diesmal kein Fang. Probier eine andere Tiefe, Zeit oder einen anderen Köder.',
    'ui.results.toStorage': {
      one: 'In die Hütte: {n} Fisch ({stored} / {cap}). Verkauf ihn auf dem Markt.',
      other: 'In die Hütte: {n} Fische ({stored} / {cap}). Verkauf sie auf dem Markt.',
    },
    'ui.results.soldOverflow': {
      one: '{n} Fisch passte nicht in die Hütte — verkauft für {money}.',
      other: '{n} Fische passten nicht in die Hütte — verkauft für {money}.',
    },
    'ui.results.haul': {
      one: 'Bonus für {n} Fisch (+{pct}): +{money} ist auf dem Konto.',
      other: 'Bonus für {n} Fische (+{pct}): +{money} ist auf dem Konto.',
    },
    'ui.results.lostOnWay': 'Unterwegs verloren',
    'ui.results.questsDone': { one: 'Auftrag erledigt', other: 'Aufträge erledigt' },
    'ui.results.rewardGold': { one: '+{n} Goldköder', other: '+{n} Goldköder' },
    'ui.results.legend': 'Legende: {name}',
    'ui.results.daysPassed': {
      one: 'Während du auf See warst, begann ein neuer Tag. Der Markt hat sich bewegt.',
      other: 'Während du auf See warst, vergingen {n} Tage. Der Markt hat sich bewegt.',
    },
    'ui.results.aquarium': 'Das Aquarium hat {money} verdient.',
    'ui.results.storageFull': 'Die Hütte ist voll: Was nicht hineinpasst, wird nach der Rückkehr sofort verkauft.',
    // Knöpfe der unteren Leiste
    'ui.results.toMarket': 'Zum Markt',
    'ui.results.toVillage': 'Ins Dorf',
    'ui.results.toPlant': 'Ans Ufer',              // Atomsee: zurück zum Alten Kraftwerk
    'ui.results.continue': 'Weiter',
    // Spielende (Abgrundwächter gefangen); Überschrift in doppelter Schrift auf zwei Zeilen
    'ui.results.ending.title1': 'ABGRUND-',
    'ui.results.ending.title2': 'WÄCHTER',
    'ui.results.ending.caught': 'ist gefangen',
    'ui.results.ending.text': 'Das Dorf feiert. Die Laternen leuchten bis zum Morgen und die Fischer trinken auf dein Wohl. Das Meer ist wieder ruhig.',
    'ui.results.ending.thanks': 'Danke fürs Spielen!',
    'ui.results.ending.palette': 'Palette ENDESGA 32',
    'ui.results.ending.audio': 'Musik und Klänge im Spiel synthetisiert',
    'ui.results.ending.more': 'Du kannst weiter angeln: Rekorde, Enzyklopädie, Endlose Tiefe.',
    // Seitenleisten (PC): Zeilenbeschriftung klein, Wert rechts
    'ui.results.panel.fights': 'Kämpfe',
    'ui.results.panel.landed': 'Gefangen',
    'ui.results.panel.escaped': 'Entkommen',
    'ui.results.panel.goodTaps': 'Treffer',
    'ui.results.panel.badTaps': 'Fehltipps',
    'ui.results.panel.jelly': 'Quallen',
    'ui.results.panel.rock': 'Felsen',
    'ui.results.panel.barrel': 'Fässer',         // Atomsee
    'ui.results.panel.shark': 'Hai-Beute',
    'ui.results.panel.career': 'Karriere',
    'ui.results.panel.dives': 'Tauchgänge',
    'ui.results.panel.caught': 'Gefangen',
    'ui.results.panel.snaps': 'Risse',
    'ui.results.panel.earned': 'Verdient',
    'ui.results.panel.deepest': 'Max. Tiefe',
    'ui.results.panel.biggest': 'Größter',
  });
})(globalThis.HL);
