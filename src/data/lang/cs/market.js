// Čeština — Tržiště (ui/market.js). Kľúče = src/data/lang/sk/market.js; glosár v data.js.
// Šírky: záložky 48 / 44 / 76 px, vety v zozname 168 px (zalomia sa), tlačidlo Prodat drobným písmom,
// štítky v riadku drobným (~60 px), bočný panel 94 px.
(function (HL) {
  HL.i18n.add('cs', 'market', {
    'ui.market.title': 'Tržiště',
    'ui.market.level': 'Úroveň {n}',
    'ui.market.levelStorm': 'Úroveň {n} · bouřka +{pct}',
    // záložky
    'ui.market.tab.sell': 'Prodej',
    'ui.market.tab.prices': 'Ceny',
    'ui.market.tab.orders': 'Objednávky',
    // vylepšení Tržiště (karta nahoře)
    'ui.market.upgrade': 'Vylepšit {money}',
    'ui.market.done': 'Hotovo',
    'ui.market.upgraded': 'Tržiště úroveň {level}: {desc}',
    'ui.market.cantNow': 'Teď to nejde',
    'ui.market.maxLevel': 'Nejvyšší úroveň',
    // poznámky nad seznamem ({event} = jméno události, {fish} = jména druhů)
    'ui.market.stormNote': 'Bouřka: ceny +{pct}',
    'ui.market.eventNote': '★ {event}: {fish}',
    // záložka Prodej
    'ui.market.inStorage': 'V Chatrči {stored} / {cap}',
    'ui.market.rule': 'Každý kus sníží poptávku o {pct}.',
    'ui.market.emptyTitle': 'Chatrč je prázdná.',
    'ui.market.emptyHint': 'Ryby doneseš z moře.',
    // řádek druhu: "3× Sardinka"
    'ui.market.countFish': '{n}× {fish}',
    'ui.market.sell': 'Prodat {money}',
    'ui.market.perPiece': '{price} za kus',
    'ui.market.perPieceRange': '{first} → {last} za kus',
    'ui.market.orderTag': 'objednávka ×{bonus}',
    'ui.market.orderTagShort': 'obj. ×{bonus}',
    'ui.market.hotMult': '★ ×{mult}',
    'ui.market.sold': 'Prodáno',
    'ui.market.sellAll': 'Prodat vše · {money}',
    'ui.market.storageEmpty': 'Chatrč je prázdná',
    // záložka Ceny a graf (popisy sloupců drobným písmem, ~40 px)
    'ui.market.graphLocked': 'Graf cen za 3 dny ukáže Tržiště úrovně 2.',
    'ui.market.graphHint': 'Ťukni na druh — graf cen za 3 dny.',
    'ui.market.noKnown': 'Zatím neznáš žádný druh. Ceny uvidíš u ryb, které chytíš.',
    'ui.market.demand': 'poptávka {pct}',
    'ui.market.yesterday': 'včera',
    'ui.market.daysAgo': 'před {n} d',
    'ui.market.today': 'dnes',
    'ui.market.historyPending': 'historie se ještě sbírá',
    // záložka Objednávky
    'ui.market.ordersUnlock': 'Objednávky obchodníků odemkne Tržiště úrovně 3.',
    'ui.market.ordersLocked': 'Obchodník si objedná druh, který už znáš, a za každý kus zaplatí víc.',
    'ui.market.ordersHead': 'Obchodníci zaplatí za objednaný kus víc. Prodávej v záložce Prodej — bonus se přičte sám.',
    'ui.market.noOrders': 'Dnes žádná objednávka. Obchodníci chodí každé ráno a chtějí jen druhy, které už znáš.',
    'ui.market.bonus': 'bonus ×{bonus}',
    // {got} = dodáno, {n} = objednané kusy
    'ui.market.orderProgress': { one: '{got} / {n} ks', few: '{got} / {n} ks', other: '{got} / {n} ks' },
    'ui.market.orderDone': 'splněna',
    'ui.market.orderLastDay': 'poslední den',
    'ui.market.orderTomorrow': 'do zítřka',
    'ui.market.orderDaysLeft': { one: 'ještě {n} den', few: 'ještě {n} dny', other: 'ještě {n} dní' },
    // boční panely (PC)
    'ui.market.panel.hot': 'Dnes žádané',
    'ui.market.panel.hotNone': 'Dnes nic mimořádného. Horká poptávka se mění každé ráno.',
    'ui.market.panel.storm': 'Na moři je málo rybářů: ceny +{pct}.',
    'ui.market.panel.howTitle': 'Jak funguje trh',
    'ui.market.panel.how': 'Každý prodaný kus sníží poptávku po druhu o {drop} (nejméně na {min}). Každý den se poptávka vrátí o {recover} směrem k plné. Lovit pořád to samé se nevyplatí — zkus jiné hloubky, časy a počasí.',
    'ui.market.panel.keyTabs': '1 2 3  záložky',
    'ui.market.panel.keySellAll': 'P  prodat vše',
    'ui.market.panel.keyBack': 'Esc  zpět',
  });
})(globalThis.HL);
