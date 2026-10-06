// Deutsch — Texte der Simulation (sim/*.js). Quelle: src/data/lang/sk/sim.js; Glossar: de/data.js.
// Plural (de): one (1) und other. {n} = Anzahl.
(function (HL) {
  HL.i18n.add('de', 'sim', {
    // --- Dorf: Gründe, warum etwas nicht geht (Offer.reason, upgradeInfo.reason; Schlüssel in reasonKey)
    'sim.village.needBuilding': '{building} Stufe {level} nötig',
    'sim.village.needLegend': 'Erst Legende {legend} fangen',
    'sim.village.maxLevel': 'Höchste Stufe',
    'sim.village.noMoney': 'Nicht genug Geld',
    'sim.village.notSold': 'Nicht im Verkauf',
    'sim.village.equipped': 'Aktiv',
    'sim.village.owned': 'Im Besitz',
    'sim.village.harpoonFull': 'Mehr Harpunen trägst du nicht',
    'sim.village.goldSoldOut': 'Heute ist kein Goldköder mehr da. Komm morgen wieder.',
    // Atomsee (docs/JAZERO.md): ohne Schnur und Rute aus dem Labor geht es nicht auf den See
    'sim.village.needLakeLine': 'Schnur aus dem Labor nötig',
    'sim.village.needLakeRod': 'Rute aus dem Labor nötig',
    // Gebäude in „{building} Stufe {level} nötig“ (im Deutschen ohne Fall-Endung)
    'sim.village.acc.chatrc': 'Hütte',
    'sim.village.acc.trhovisko': 'Markt',
    'sim.village.acc.dielna': 'Werkstatt',
    'sim.village.acc.navnadaren': 'Köderladen',
    'sim.village.acc.meteostanica': 'Wetterstation',
    'sim.village.acc.majak': 'Leuchtturm',
    'sim.village.acc.krcma': 'Kneipe',
    'sim.village.acc.akvarium': 'Aquarium',
    'sim.village.acc.lodenica': 'Werft',
    'sim.village.acc.laboratorium': 'Labor',

    // --- Aufträge in der Kneipe
    'sim.quest.catch': 'Fang {what}',
    'sim.quest.catchCond': 'Fang {what} {cond}',
    'sim.quest.depth': 'Tauch bis {depth} und kehr zurück',
    'sim.quest.value': 'Fang für {money} in einem Tauchgang',
    'sim.quest.count': 'Fang {fish} in einem Tauchgang',
    'sim.quest.countFish': { one: '{n} Fisch', other: '{n} Fische' },
    // Art im Auftrag (Akkusativ): one = ein Stück OHNE Zahl („Fang einen Aal“), other mit Zahl
    'sim.quest.fish.sardinka': { one: 'eine Sardine', other: '{n} Sardinen' },
    'sim.quest.fish.okun': { one: 'einen Wolfsbarsch', other: '{n} Wolfsbarsche' },
    'sim.quest.fish.krab': { one: 'eine Krabbe', other: '{n} Krabben' },
    'sim.quest.fish.platesa': { one: 'eine Flunder', other: '{n} Flundern' },
    'sim.quest.fish.makrela': { one: 'eine Makrele', other: '{n} Makrelen' },
    'sim.quest.fish.pyskac': { one: 'einen Lippfisch', other: '{n} Lippfische' },
    'sim.quest.fish.papagajovka': { one: 'einen Papageifisch', other: '{n} Papageifische' },
    'sim.quest.fish.zubatica': { one: 'eine Brasse', other: '{n} Brassen' },
    'sim.quest.fish.murena': { one: 'eine Muräne', other: '{n} Muränen' },
    'sim.quest.fish.barakuda': { one: 'einen Barrakuda', other: '{n} Barrakudas' },
    'sim.quest.fish.svetlonoska': { one: 'einen Laternenfisch', other: '{n} Laternenfische' },
    'sim.quest.fish.treska': { one: 'einen Kabeljau', other: '{n} Kabeljaue' },
    'sim.quest.fish.uhor': { one: 'einen Aal', other: '{n} Aale' },
    'sim.quest.fish.tuniak': { one: 'einen Thunfisch', other: '{n} Thunfische' },
    'sim.quest.fish.mesacnica': { one: 'einen Gotteslachs', other: '{n} Gotteslachse' },
    'sim.quest.fish.lampasnik': { one: 'einen Anglerfisch', other: '{n} Anglerfische' },
    'sim.quest.fish.pazravy': { one: 'einen Pelikanaal', other: '{n} Pelikanaale' },
    'sim.quest.fish.raja': { one: 'einen Nebelrochen', other: '{n} Nebelrochen' },
    'sim.quest.fish.sklenena': { one: 'einen Glasfisch', other: '{n} Glasfische' },
    'sim.quest.fish.velkoustka': { one: 'ein Großmaul', other: '{n} Großmäuler' },
    'sim.quest.fish.latimeria': { one: 'einen Quastenflosser', other: '{n} Quastenflosser' },
    'sim.quest.fish.sled': { one: 'einen Hering', other: '{n} Heringe' },
    'sim.quest.fish.tekvicovka': { one: 'einen Kürbisfisch', other: '{n} Kürbisfische' },
    'sim.quest.fish.prizrak': { one: 'einen Geisterfisch', other: '{n} Geisterfische' },
    // Bedingung des Auftrags („Fang 3 Aale nachts“)
    'sim.quest.cond.morning': 'morgens',
    'sim.quest.cond.day': 'tagsüber',
    'sim.quest.cond.evening': 'abends',
    'sim.quest.cond.night': 'nachts',
    'sim.quest.cond.sun': 'bei Sonnenschein',
    'sim.quest.cond.cloudy': 'bei Wolken',
    'sim.quest.cond.rain': 'bei Regen',
    'sim.quest.cond.fog': 'bei Nebel',
    'sim.quest.cond.storm': 'bei Sturm',
    'sim.quest.cond.fullmoon': 'bei Vollmond',
    'sim.quest.cond.newmoon': 'bei Neumond',

    // --- Hinweise zu Legenden (Kneipe Stufe 3)
    'sim.clue.caught': 'Gefangen. Die Trophäe gehört ins Aquarium.',
    'sim.clue.text': '{hint} Bedingungen: {conds}. Zone: {zone}.',

    // --- Welt
    'sim.world.day': 'Tag {n}',
    'sim.world.clear': 'Klar',

    // --- Karriere und Speichern ({detail} = technische Ursache, wird nicht übersetzt)
    'sim.game.noStorage': 'Das Spiel speichert nicht — nichts wiederherzustellen.',
    'sim.game.noBackup': 'Keine Sicherung lässt sich laden.',
    'sim.game.stale': 'Das Spiel ist in einem anderen Tab offen — dieser Tab speichert nicht mehr. Lade die Seite neu.',
    'sim.save.corrupt': 'Nicht gespeichert, Spielstand beschädigt: {detail}',
    'sim.save.writeFailed': 'Speichern fehlgeschlagen: {detail}',
    'sim.save.unavailable': 'Speicher nicht verfügbar: {detail}',
    'sim.save.loadFailed': 'Spielstand lässt sich nicht laden: {detail}',
    'sim.save.settingsLoad': 'Einstellungen lassen sich nicht laden: {detail}',
    'sim.save.settingsStore': 'Einstellungen lassen sich nicht speichern: {detail}',
  });
})(globalThis.HL);
