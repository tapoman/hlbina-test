// Español — Mercado (ui/market.js). Claves = src/data/lang/sk/market.js. Glosario: es/data.js.
// Anchos: pestañas 48 / 44 / 76 px, frases de la lista 168 px (se parten), botón Vender en pequeña,
// etiquetas de fila en pequeña (~60 px), panel lateral 94 px.
// {pct} = "5 %", {money}/{price}/{last} = "83 €", {bonus} = "1,5"; {first} = entero sin moneda.
(function (HL) {
  HL.i18n.add('es', 'market', {
    'ui.market.title': 'Mercado',
    'ui.market.level': 'Nivel {n}',
    'ui.market.levelStorm': 'Nivel {n} · tormenta +{pct}',
    // pestañas
    'ui.market.tab.sell': 'Venta',
    'ui.market.tab.prices': 'Precios',
    'ui.market.tab.orders': 'Pedidos',
    // mejora del Mercado (tarjeta de arriba)
    'ui.market.upgrade': 'Mejorar {money}',
    'ui.market.done': 'Completo',
    'ui.market.upgraded': 'Mercado nivel {level}: {desc}',
    'ui.market.cantNow': 'Ahora no se puede',
    'ui.market.maxLevel': 'Nivel máximo',
    // notas sobre la lista ({event} = nombre del evento, {fish} = nombres de especies)
    'ui.market.stormNote': 'Tormenta: precios +{pct}',
    'ui.market.eventNote': '★ {event}: {fish}',
    // pestaña Venta
    'ui.market.inStorage': 'En la Cabaña {stored} / {cap}',
    'ui.market.rule': 'Cada pieza baja la demanda un {pct}.',
    'ui.market.emptyTitle': 'La Cabaña está vacía.',
    'ui.market.emptyHint': 'Trae peces del mar.',
    // fila de especie: "3× Sardina" ({n} = piezas, {fish} = especie)
    'ui.market.countFish': '{n}× {fish}',
    'ui.market.sell': 'Vender {money}',
    'ui.market.perPiece': '{price} la pieza',
    'ui.market.perPieceRange': '{first} → {last} la pieza',
    'ui.market.orderTag': 'pedido ×{bonus}',
    'ui.market.orderTagShort': 'ped. ×{bonus}',
    'ui.market.hotMult': '★ ×{mult}',
    'ui.market.sold': 'Vendido',
    'ui.market.sellAll': 'Vender todo · {money}',
    'ui.market.storageEmpty': 'La Cabaña está vacía',
    // pestaña Precios y gráfico (etiquetas de columna en pequeña, ~40 px)
    'ui.market.graphLocked': 'El gráfico de precios de 3 días llega con el Mercado nivel 2.',
    'ui.market.graphHint': 'Toca una especie: precios de 3 días.',
    'ui.market.noKnown': 'Aún no conoces ninguna especie. Verás los precios de los peces que pesques.',
    'ui.market.demand': 'demanda {pct}',
    'ui.market.yesterday': 'ayer',
    'ui.market.daysAgo': 'hace {n} d',
    'ui.market.today': 'hoy',
    'ui.market.historyPending': 'recopilando historial',
    // pestaña Pedidos
    'ui.market.ordersUnlock': 'Los pedidos de comerciantes llegan con el Mercado nivel 3.',
    'ui.market.ordersLocked': 'Un comerciante pide una especie que ya conoces y paga más por cada pieza.',
    'ui.market.ordersHead': 'Los comerciantes pagan más por cada pieza pedida. Vende en la pestaña Venta: el bonus se suma solo.',
    'ui.market.noOrders': 'Hoy no hay pedidos. Los comerciantes vienen cada mañana y solo piden especies que ya conoces.',
    'ui.market.bonus': 'bonus ×{bonus}',
    // {got} = entregadas, {n} = piezas pedidas
    'ui.market.orderProgress': { one: '{got} / {n}', other: '{got} / {n}' },
    'ui.market.orderDone': 'cumplido',
    'ui.market.orderLastDay': 'último día',
    'ui.market.orderTomorrow': 'hasta mañana',
    'ui.market.orderDaysLeft': { one: 'queda {n} día', other: 'quedan {n} días' },
    // paneles laterales (PC)
    'ui.market.panel.hot': 'Hoy se busca',
    'ui.market.panel.hotNone': 'Hoy nada especial. La alta demanda cambia cada mañana.',
    'ui.market.panel.storm': 'Hay pocos pescadores en el mar: precios +{pct}.',
    'ui.market.panel.howTitle': 'Cómo va el mercado',
    'ui.market.panel.how': 'Cada pieza vendida baja la demanda de su especie un {drop} (como mínimo hasta {min}). Cada día la demanda se recupera un {recover}. Pescar siempre lo mismo no compensa: prueba otras profundidades, horas y tiempos.',
    'ui.market.panel.keyTabs': '1 2 3  pestañas',
    'ui.market.panel.keySellAll': 'P  vender todo',
    'ui.market.panel.keyBack': 'Esc  atrás',
  });
})(globalThis.HL);
