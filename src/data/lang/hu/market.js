// Preklad hu / market — Trhovisko (ui/market.js). Kľúče = src/data/lang/sk/market.js. Szójegyzék: hu/data.js.
// Szélességek: fülek 48 / 44 / 76 px, mondatok a listában 168 px (tördel), Elad gomb apróval, címkék a sorban
// apróval (~60 px), oldalsó panel 94 px. {pct} = "5%" → "{pct}-kal" mindig helyes (százalékkal).
(function (HL) {
  HL.i18n.add('hu', 'market', {
    'ui.market.title': 'Piac',
    'ui.market.level': '{n}. szint',
    'ui.market.levelStorm': '{n}. szint · vihar +{pct}',
    // fülek
    'ui.market.tab.sell': 'Eladás',
    'ui.market.tab.prices': 'Árak',
    'ui.market.tab.orders': 'Rendelések',
    // a Piac fejlesztése (kártya fent)
    'ui.market.upgrade': 'Fejlesztés {money}',
    'ui.market.done': 'Kész',
    'ui.market.upgraded': 'Piac {level}. szint: {desc}',
    'ui.market.cantNow': 'Most nem lehet',
    'ui.market.maxLevel': 'Legmagasabb szint',
    // megjegyzések a lista fölött
    'ui.market.stormNote': 'Vihar: árak +{pct}',
    'ui.market.eventNote': '★ {event}: {fish}',
    // Eladás fül
    'ui.market.inStorage': 'A Kunyhóban {stored} / {cap}',
    'ui.market.rule': 'Minden eladott darab: −{pct} kereslet.',
    'ui.market.emptyTitle': 'A Kunyhó üres.',
    'ui.market.emptyHint': 'Halat a tengerről hozol.',
    // faj sora: "3× Szardínia"
    'ui.market.countFish': '{n}× {fish}',
    'ui.market.sell': 'Elad {money}',
    'ui.market.perPiece': '{price} / db',
    'ui.market.perPieceRange': '{first} → {last} / db',
    'ui.market.orderTag': 'rendelés ×{bonus}',
    'ui.market.orderTagShort': 'rend. ×{bonus}',
    'ui.market.hotMult': '★ ×{mult}',
    'ui.market.sold': 'Eladva',
    'ui.market.sellAll': 'Mindet elad · {money}',
    'ui.market.storageEmpty': 'A Kunyhó üres',
    // Árak fül és grafikon (oszlopcímkék apróval, ~40 px)
    'ui.market.graphLocked': 'A 3 napos árgrafikont a 2. szintű Piac mutatja.',
    'ui.market.graphHint': 'Koppints egy fajra — 3 napos árak.',
    'ui.market.noKnown': 'Még egy fajt sem ismersz. Az árakat a kifogott halaknál látod.',
    'ui.market.demand': 'kereslet {pct}',
    'ui.market.yesterday': 'tegnap',
    'ui.market.daysAgo': '{n} napja',
    'ui.market.today': 'ma',
    'ui.market.historyPending': 'az előzmények még gyűlnek',
    // Rendelések fül
    'ui.market.ordersUnlock': 'A kereskedők rendeléseit a 3. szintű Piac nyitja meg.',
    'ui.market.ordersLocked': 'A kereskedő olyan fajt rendel, amelyet már ismersz, és minden darabért többet fizet.',
    'ui.market.ordersHead': 'A kereskedők többet fizetnek a rendelt darabért. Adj el az Eladás fülön — a bónusz magától hozzáadódik.',
    'ui.market.noOrders': 'Ma nincs rendelés. A kereskedők minden reggel jönnek, és csak olyan fajt kérnek, amelyet már ismersz.',
    'ui.market.bonus': 'bónusz ×{bonus}',
    // {got} = leszállítva, {n} = rendelt darab
    'ui.market.orderProgress': { one: '{got} / {n} db', other: '{got} / {n} db' },
    'ui.market.orderDone': 'teljesítve',
    'ui.market.orderLastDay': 'utolsó nap',
    'ui.market.orderTomorrow': 'holnapig',
    'ui.market.orderDaysLeft': { one: 'még {n} nap', other: 'még {n} nap' },
    // oldalsó panelek (PC)
    'ui.market.panel.hot': 'Ma keresett',
    'ui.market.panel.hotNone': 'Ma semmi különös. A nagy kereslet minden reggel változik.',
    'ui.market.panel.storm': 'Kevés halász van a tengeren: árak +{pct}.',
    'ui.market.panel.howTitle': 'A piac működése',
    'ui.market.panel.how': 'Minden eladott darab {drop}-kal csökkenti a faj iránti keresletet (legfeljebb {min}-ra). Naponta {recover}-kal tér vissza a teljes felé. Mindig ugyanazt fogni nem éri meg — próbálj más mélységet, időt és időjárást.',
    'ui.market.panel.keyTabs': '1 2 3  fülek',
    'ui.market.panel.keySellAll': 'P  mindet elad',
    'ui.market.panel.keyBack': 'Esc  vissza',
  });
})(globalThis.HL);
