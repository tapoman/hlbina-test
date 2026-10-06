// English — Market (ui/market.js). Keys ui.market.*  Tabs 48 / 44 / 76 px, list sentences 168 px (wrap),
// Sell button in small font, row tags small (~60 px), side panel 94 px.
// {pct} = "5%", {money}/{price}/{last} = "€83", {bonus} = "1.5"; {first} = whole number without currency.
(function (HL) {
  HL.i18n.add('en', 'market', {
    'ui.market.title': 'Market',
    'ui.market.level': 'Level {n}',
    'ui.market.levelStorm': 'Level {n} · storm +{pct}',
    // tabs
    'ui.market.tab.sell': 'Sell',
    'ui.market.tab.prices': 'Prices',
    'ui.market.tab.orders': 'Orders',
    // Market upgrade (card at the top)
    'ui.market.upgrade': 'Upgrade {money}',
    'ui.market.done': 'Done',
    'ui.market.upgraded': 'Market level {level}: {desc}',
    'ui.market.cantNow': "Can't right now",
    'ui.market.maxLevel': 'Max level',
    // notes above the list ({event} = event name, {fish} = species names)
    'ui.market.stormNote': 'Storm: prices +{pct}',
    'ui.market.eventNote': '★ {event}: {fish}',
    // Sell tab
    'ui.market.inStorage': 'In the Hut {stored} / {cap}',
    'ui.market.rule': 'Each fish sold lowers demand by {pct}.',
    'ui.market.emptyTitle': 'The Hut is empty.',
    'ui.market.emptyHint': 'Bring fish back from the sea.',
    // species row: "3× Sardine" ({n} = pieces, {fish} = species name)
    'ui.market.countFish': '{n}× {fish}',
    'ui.market.sell': 'Sell {money}',
    'ui.market.perPiece': '{price} each',
    'ui.market.perPieceRange': '€{first} → {last} each',
    'ui.market.orderTag': 'order ×{bonus}',
    'ui.market.orderTagShort': 'ord. ×{bonus}',
    'ui.market.hotMult': '★ ×{mult}',
    'ui.market.sold': 'Sold',
    'ui.market.sellAll': 'Sell all · {money}',
    'ui.market.storageEmpty': 'The Hut is empty',
    // Prices tab and chart (column labels in small font, ~40 px)
    'ui.market.graphLocked': 'Market level 2 shows a 3-day price chart.',
    'ui.market.graphHint': 'Tap a species: 3-day price chart.',
    'ui.market.noKnown': "You don't know any species yet. You'll see prices for the fish you catch.",
    'ui.market.demand': 'demand {pct}',
    'ui.market.yesterday': 'yesterday',
    'ui.market.daysAgo': '{n} d ago',
    'ui.market.today': 'today',
    'ui.market.historyPending': 'history still building',
    // Orders tab
    'ui.market.ordersUnlock': 'Merchant orders unlock at Market level 3.',
    'ui.market.ordersLocked': 'A merchant orders a species you already know and pays more for each one.',
    'ui.market.ordersHead': 'Merchants pay more for each ordered fish. Sell on the Sell tab — the bonus is added automatically.',
    'ui.market.noOrders': 'No orders today. Merchants come every morning and only want species you already know.',
    'ui.market.bonus': 'bonus ×{bonus}',
    // {got} = delivered, {n} = ordered
    'ui.market.orderProgress': { one: '{got} / {n}', other: '{got} / {n}' },
    'ui.market.orderDone': 'filled',
    'ui.market.orderLastDay': 'last day',
    'ui.market.orderTomorrow': 'till tomorrow',
    'ui.market.orderDaysLeft': { one: '{n} day left', other: '{n} days left' },
    // side panels (PC)
    'ui.market.panel.hot': 'Wanted today',
    'ui.market.panel.hotNone': 'Nothing special today. Hot demand changes every morning.',
    'ui.market.panel.storm': 'Few fishers at sea: prices +{pct}.',
    'ui.market.panel.howTitle': 'How prices work',
    'ui.market.panel.how': 'Each fish sold lowers demand for its species by {drop} (down to {min}). Every day demand recovers {recover} toward full. Catching the same thing over and over does not pay — try other depths, times and weather.',
    'ui.market.panel.keyTabs': '1 2 3  tabs',
    'ui.market.panel.keySellAll': 'P  sell all',
    'ui.market.panel.keyBack': 'Esc  back',
  });
})(globalThis.HL);
