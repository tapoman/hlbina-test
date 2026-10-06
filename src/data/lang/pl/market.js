// Polski — Targ (ui/market.js). Źródło: src/data/lang/sk/market.js. Słowniczek: src/data/lang/pl/data.js.
// Szerokości: zakładki 48 / 44 / 76 px, zdania na liście 168 px (łamią się), przycisk Sprzedaj drobnym pismem
// (szerokość według najdłuższego), etykiety w wierszu drobnym (~60 px), panel boczny 94 px.
// {pct} = "5%", {money}/{price}/{last} = "83 €", {bonus} = "1,5"; {first} = liczba całkowita bez waluty.
(function (HL) {
  HL.i18n.add('pl', 'market', {
    'ui.market.title': 'Targ',
    'ui.market.level': 'Poziom {n}',
    'ui.market.levelStorm': 'Poziom {n} · burza +{pct}',
    // zakładki
    'ui.market.tab.sell': 'Sprzedaż',
    'ui.market.tab.prices': 'Ceny',
    'ui.market.tab.orders': 'Zamówienia',
    // ulepszenie Targu (karta u góry)
    'ui.market.upgrade': 'Ulepsz {money}',
    'ui.market.done': 'Gotowe',
    'ui.market.upgraded': 'Targ poziom {level}: {desc}',
    'ui.market.cantNow': 'Teraz się nie da',
    'ui.market.maxLevel': 'Najwyższy poziom',
    // uwagi nad listą ({event} = nazwa wydarzenia, {fish} = nazwy gatunków)
    'ui.market.stormNote': 'Burza: ceny +{pct}',
    'ui.market.eventNote': '★ {event}: {fish}',
    // zakładka Sprzedaż
    'ui.market.inStorage': 'W Chatce {stored} / {cap}',
    'ui.market.rule': 'Każda sztuka obniża popyt o {pct}.',
    'ui.market.emptyTitle': 'Chatka jest pusta.',
    'ui.market.emptyHint': 'Ryby przywieziesz z morza.',
    // wiersz gatunku: "3× Sardynka" ({n} = sztuk, {fish} = nazwa gatunku)
    'ui.market.countFish': '{n}× {fish}',
    'ui.market.sell': 'Sprzedaj {money}',
    'ui.market.perPiece': '{price} za szt.',
    'ui.market.perPieceRange': '{first} → {last} za szt.',
    'ui.market.orderTag': 'zamówienie ×{bonus}',
    'ui.market.orderTagShort': 'zam. ×{bonus}',
    'ui.market.hotMult': '★ ×{mult}',
    'ui.market.sold': 'Sprzedane',
    'ui.market.sellAll': 'Sprzedaj wszystko · {money}',
    'ui.market.storageEmpty': 'Chatka jest pusta',
    // zakładka Ceny i wykres (opisy kolumn drobnym pismem, ~40 px)
    'ui.market.graphLocked': 'Wykres cen z 3 dni pokaże Targ na poziomie 2.',
    'ui.market.graphHint': 'Stuknij rybę — wykres cen z 3 dni.', // 157 px ≤ 168 (z „gatunek” 171 px, skracało się)
    'ui.market.noKnown': 'Nie znasz jeszcze żadnego gatunku. Ceny zobaczysz przy rybach, które złowisz.',
    'ui.market.demand': 'popyt {pct}',
    'ui.market.yesterday': 'wczoraj',
    'ui.market.daysAgo': '{n} d temu',
    'ui.market.today': 'dziś',
    'ui.market.historyPending': 'historia jeszcze się zbiera',
    // zakładka Zamówienia
    'ui.market.ordersUnlock': 'Zamówienia kupców odblokuje Targ na poziomie 3.',
    'ui.market.ordersLocked': 'Kupiec zamówi gatunek, który już znasz, i za każdą sztukę zapłaci więcej.',
    'ui.market.ordersHead': 'Kupcy płacą więcej za zamówioną sztukę. Sprzedawaj w zakładce Sprzedaż — premia doliczy się sama.',
    'ui.market.noOrders': 'Dziś brak zamówień. Kupcy przychodzą co rano i chcą tylko gatunków, które już znasz.',
    'ui.market.bonus': 'premia ×{bonus}',
    // {got} = dostarczone, {n} = zamówione sztuki. Bez „szt.”: od x=92 do prawego terminu jest 81 px,
    // „0 / 3 szt.” + „ostatni dzień” / „jeszcze 3 dni” = 80 px (stykały się); sztuki mówi już „3× Dorsz”.
    'ui.market.orderProgress': { one: '{got} / {n}', few: '{got} / {n}', many: '{got} / {n}' },
    'ui.market.orderDone': 'wykonane',
    'ui.market.orderLastDay': 'ostatni dzień',
    'ui.market.orderTomorrow': 'do jutra',
    // 1 dzień pisze się jako "do jutra"; zamówienie trwa 3 dni
    'ui.market.orderDaysLeft': { one: 'jeszcze {n} dzień', few: 'jeszcze {n} dni', many: 'jeszcze {n} dni' },
    // panele boczne (PC)
    'ui.market.panel.hot': 'Dziś poszukiwane',
    'ui.market.panel.hotNone': 'Dziś nic szczególnego. Gorący popyt zmienia się co rano.',
    'ui.market.panel.storm': 'Na morzu jest mało rybaków: ceny +{pct}.',
    'ui.market.panel.howTitle': 'Jak działa targ',
    'ui.market.panel.how': 'Każda sprzedana sztuka obniża popyt na gatunek o {drop} (nie niżej niż {min}). Każdego dnia popyt wraca o {recover} w stronę pełnego. Łowić ciągle to samo się nie opłaca — próbuj innych głębokości, pór i pogody.',
    'ui.market.panel.keyTabs': '1 2 3  zakładki',
    'ui.market.panel.keySellAll': 'P  sprzedaj wszystko',
    'ui.market.panel.keyBack': 'Esc  wróć',
  });
})(globalThis.HL);
