// Slovenčina — Trhovisko (ui/market.js). ZDROJ prekladu (docs/I18N.md). Kľúče ui.market.*
// Šírky: záložky 48 / 44 / 76 px, vety v zozname 168 px (zalomia sa), tlačidlo Predať drobným písmom
// (šírka podľa najdlhšieho), štítky v riadku drobným (~60 px), bočný panel 94 px.
// {pct} = "5 %", {money}/{price}/{last} = "83 €", {bonus} = "1,5"; {first} = celé číslo bez meny.
(function (HL) {
  HL.i18n.add('sk', 'market', {
    'ui.market.title': 'Trhovisko',
    'ui.market.level': 'Úroveň {n}',
    'ui.market.levelStorm': 'Úroveň {n} · búrka +{pct}',
    // záložky
    'ui.market.tab.sell': 'Predaj',
    'ui.market.tab.prices': 'Ceny',
    'ui.market.tab.orders': 'Objednávky',
    // vylepšenie Trhoviska (karta hore)
    'ui.market.upgrade': 'Vylepšiť {money}',
    'ui.market.done': 'Hotovo',
    'ui.market.upgraded': 'Trhovisko úroveň {level}: {desc}',
    'ui.market.cantNow': 'Teraz sa nedá',
    'ui.market.maxLevel': 'Najvyššia úroveň',
    // poznámky nad zoznamom ({event} = meno udalosti, {fish} = mená druhov)
    'ui.market.stormNote': 'Búrka: ceny +{pct}',
    'ui.market.eventNote': '★ {event}: {fish}',
    // záložka Predaj
    'ui.market.inStorage': 'V Chatrči {stored} / {cap}',
    'ui.market.rule': 'Každý kus zníži dopyt o {pct}.',
    'ui.market.emptyTitle': 'Chatrč je prázdna.',
    'ui.market.emptyHint': 'Ryby prinesieš z mora.',
    // riadok druhu: "3× Sardinka" ({n} = kusov, {fish} = meno druhu)
    'ui.market.countFish': '{n}× {fish}',
    'ui.market.sell': 'Predať {money}',
    'ui.market.perPiece': '{price} za kus',
    'ui.market.perPieceRange': '{first} → {last} za kus',
    'ui.market.orderTag': 'objednávka ×{bonus}',
    'ui.market.orderTagShort': 'obj. ×{bonus}',
    'ui.market.hotMult': '★ ×{mult}',
    'ui.market.sold': 'Predané',
    'ui.market.sellAll': 'Predať všetko · {money}',
    'ui.market.storageEmpty': 'Chatrč je prázdna',
    // záložka Ceny a graf (popisy stĺpcov drobným písmom, ~40 px)
    'ui.market.graphLocked': 'Graf cien za 3 dni ukáže Trhovisko úrovne 2.',
    'ui.market.graphHint': 'Ťukni na druh — graf cien za 3 dni.',
    'ui.market.noKnown': 'Zatiaľ nepoznáš žiadny druh. Ceny uvidíš pri rybách, ktoré chytíš.',
    'ui.market.demand': 'dopyt {pct}',
    'ui.market.yesterday': 'včera',
    'ui.market.daysAgo': 'pred {n} d',
    'ui.market.today': 'dnes',
    'ui.market.historyPending': 'história sa ešte zbiera',
    // záložka Objednávky
    'ui.market.ordersUnlock': 'Objednávky obchodníkov odomkne Trhovisko úrovne 3.',
    'ui.market.ordersLocked': 'Obchodník si objedná druh, ktorý už poznáš, a za každý kus zaplatí viac.',
    'ui.market.ordersHead': 'Obchodníci zaplatia za objednaný kus viac. Predávaj v záložke Predaj — bonus sa pripočíta sám.',
    'ui.market.noOrders': 'Dnes žiadna objednávka. Obchodníci chodia každé ráno a chcú len druhy, ktoré už poznáš.',
    'ui.market.bonus': 'bonus ×{bonus}',
    // {got} = dodané, {n} = objednané kusy
    'ui.market.orderProgress': { one: '{got} / {n} ks', few: '{got} / {n} ks', other: '{got} / {n} ks' },
    'ui.market.orderDone': 'splnená',
    'ui.market.orderLastDay': 'posledný deň',
    'ui.market.orderTomorrow': 'do zajtra',
    // 1 deň sa píše ako "do zajtra"; "ešte 5 dni" je pôvodný text hry (bajt po bajte), objednávka trvá 3 dni
    'ui.market.orderDaysLeft': { one: 'ešte {n} deň', few: 'ešte {n} dni', other: 'ešte {n} dni' },
    // bočné panely (PC)
    'ui.market.panel.hot': 'Dnes žiadané',
    'ui.market.panel.hotNone': 'Dnes nič mimoriadne. Horúci dopyt sa mení každé ráno.',
    'ui.market.panel.storm': 'Na mori je málo rybárov: ceny +{pct}.',
    'ui.market.panel.howTitle': 'Ako funguje trh',
    'ui.market.panel.how': 'Každý predaný kus zníži dopyt po druhu o {drop} (najmenej na {min}). Každý deň sa dopyt vráti o {recover} smerom k plnému. Loviť stále to isté sa neoplatí — skús iné hĺbky, časy a počasie.',
    'ui.market.panel.keyTabs': '1 2 3  záložky',
    'ui.market.panel.keySellAll': 'P  predať všetko',
    'ui.market.panel.keyBack': 'Esc  späť',
  });
})(globalThis.HL);
