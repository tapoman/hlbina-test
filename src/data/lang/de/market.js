// Deutsch — Markt (ui/market.js). Quelle: sk/market.js. Reiter 48 / 44 / 76 px, Sätze in der Liste 168 px
// (brechen um), Verkaufsknopf klein (Breite nach dem längsten), Etiketten in der Zeile klein (~60 px),
// Seitenleiste 94 px. {pct} = "5 %", {money}/{price}/{last} = "83 €", {bonus} = "1,5"; {first} = Zahl ohne €.
(function (HL) {
  HL.i18n.add('de', 'market', {
    'ui.market.title': 'Markt',
    'ui.market.level': 'Stufe {n}',
    'ui.market.levelStorm': 'Stufe {n} · Sturm +{pct}',
    // Reiter
    'ui.market.tab.sell': 'Verkauf',
    'ui.market.tab.prices': 'Preise',
    'ui.market.tab.orders': 'Bestellungen',
    // Ausbau des Markts (Karte oben)
    'ui.market.upgrade': 'Ausbauen {money}',
    'ui.market.done': 'Fertig',
    'ui.market.upgraded': 'Markt Stufe {level}: {desc}',
    'ui.market.cantNow': 'Jetzt nicht möglich',
    'ui.market.maxLevel': 'Höchste Stufe',
    // Hinweise über der Liste ({event} = Name des Ereignisses, {fish} = Artnamen)
    'ui.market.stormNote': 'Sturm: Preise +{pct}',
    'ui.market.eventNote': '★ {event}: {fish}',
    // Reiter Verkauf
    'ui.market.inStorage': 'In der Hütte {stored} / {cap}',
    'ui.market.rule': 'Jeder Verkauf: Nachfrage −{pct}.',   // 168 px
    'ui.market.emptyTitle': 'Die Hütte ist leer.',
    'ui.market.emptyHint': 'Fische bringst du vom Meer mit.',
    // Zeile einer Art: "3× Sardine" ({n} = Stück, {fish} = Artname)
    'ui.market.countFish': '{n}× {fish}',
    'ui.market.sell': 'Verkauf {money}',
    'ui.market.perPiece': '{price} je Stück',
    'ui.market.perPieceRange': '{first} → {last}/Stk.',   // 69 px klein
    'ui.market.orderTag': 'Bestellung ×{bonus}',
    'ui.market.orderTagShort': 'Best. ×{bonus}',
    'ui.market.hotMult': '★ ×{mult}',
    'ui.market.sold': 'Verkauft',
    'ui.market.sellAll': 'Alles verkaufen · {money}',
    'ui.market.storageEmpty': 'Die Hütte ist leer',
    // Reiter Preise und Grafik (Spaltenbeschriftung klein, ~40 px)
    'ui.market.graphLocked': 'Die Preisgrafik für 3 Tage zeigt der Markt ab Stufe 2.',
    'ui.market.graphHint': 'Art antippen: Preisgrafik für 3 Tage.',   // 168 px
    'ui.market.noKnown': 'Du kennst noch keine Art. Preise siehst du bei Fischen, die du fängst.',
    'ui.market.demand': 'Nachfrage {pct}',
    'ui.market.yesterday': 'gestern',
    'ui.market.daysAgo': 'vor {n} T.',
    'ui.market.today': 'heute',
    'ui.market.historyPending': 'Verlauf wird noch gesammelt',
    // Reiter Bestellungen
    'ui.market.ordersUnlock': 'Händlerbestellungen schaltet der Markt ab Stufe 3 frei.',
    'ui.market.ordersLocked': 'Ein Händler bestellt eine Art, die du schon kennst, und zahlt für jedes Stück mehr.',
    'ui.market.ordersHead': 'Händler zahlen für bestellte Stücke mehr. Verkauf im Reiter Verkauf — der Bonus kommt von selbst dazu.',
    'ui.market.noOrders': 'Heute keine Bestellung. Händler kommen jeden Morgen und wollen nur Arten, die du schon kennst.',
    'ui.market.bonus': 'Bonus ×{bonus}',
    // {got} = geliefert, {n} = bestellte Stück
    'ui.market.orderProgress': { one: '{got} / {n} Stk.', other: '{got} / {n} Stk.' },
    'ui.market.orderDone': 'erledigt',
    'ui.market.orderLastDay': 'letzter Tag',
    'ui.market.orderTomorrow': 'bis morgen',
    'ui.market.orderDaysLeft': { one: 'noch {n} Tag', other: 'noch {n} Tage' },
    // Seitenleisten (PC)
    'ui.market.panel.hot': 'Heute gefragt',
    'ui.market.panel.hotNone': 'Heute nichts Besonderes. Die heiße Nachfrage wechselt jeden Morgen.',
    'ui.market.panel.storm': 'Wenig Fischer auf See: Preise +{pct}.',
    'ui.market.panel.howTitle': 'So geht der Markt',
    'ui.market.panel.how': 'Jedes verkaufte Stück senkt die Nachfrage nach der Art um {drop} (nie unter {min}). Jeden Tag erholt sich die Nachfrage um {recover}. Immer dasselbe zu fangen lohnt nicht — probier andere Tiefen, Zeiten und Wetter.',
    'ui.market.panel.keyTabs': '1 2 3  Reiter',
    'ui.market.panel.keySellAll': 'P  alles verkaufen',
    'ui.market.panel.keyBack': 'Esc  zurück',
  });
})(globalThis.HL);
