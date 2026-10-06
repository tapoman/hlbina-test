// Español — escena del pueblo (ui/village.js). Claves = src/data/lang/sk/village.js. Glosario: es/data.js.
// Anchos: paneles laterales 94 px (letra pequeña ≈ 4 px/carácter), etiqueta del edificio ~170 px,
// botón AL MAR 104 px (mayúsculas 6 px/carácter), tutorial 146 px por línea.
(function (HL) {
  HL.i18n.add('es', 'village', {
    'ui.village.toSea': 'AL MAR',
    // toque en hora/tiempo de la cabecera (toast): {period} = parte del día, {weather}/{next} en minúscula
    'ui.village.hud.now': '{period}, {weather}',
    'ui.village.hud.forecast': '{period}, {weather}. A las {time}: {next}',
    'ui.village.hud.noForecast': '{period}, {weather}. La previsión la da la Estación meteo.',
    // etiqueta sobre el edificio; {money} = precio, {level} = nivel
    'ui.village.tag.build': 'Construir: {money}',
    'ui.village.tag.level': 'Nivel {level} · siguiente {money}',
    'ui.village.tag.done': 'Nivel 3 · completo',
    'ui.village.tag.sell': { one: 'Vender {n} pez', other: 'Vender {n} peces' },
    'ui.village.tag.sellNone': 'Venta de peces',
    // tramo de previsión: {from}–{to} = horas 06:00–09:00, {n} = número de día
    'ui.village.seg.today': '{from}–{to}',
    'ui.village.seg.tomorrow': 'mañana {from}–{to}',
    'ui.village.seg.later': 'día {n} {from}–{to}',
    // tutorial de la primera visita
    'ui.village.tut.title': 'Bienvenido a Hlbina',
    'ui.village.tut.text': 'De una cabaña en ruinas harás un pueblo pesquero. Sal AL MAR, pesca y vende los peces en el Mercado. Con lo que ganes, construye edificios: cada uno desbloquea algo nuevo.',
    'ui.village.tut.warn': 'Ojo: cada pez y cada metro de profundidad tensan el sedal. Si se rompe, adiós captura.',
    'ui.village.tut.ok': 'Entendido',
    // paneles laterales (PC): izquierda previsión y luna, derecha demanda, almacén, encargos
    'ui.village.panel.forecast': 'Previsión',
    'ui.village.panel.noMeteo': 'Construye la Estación meteo y verás qué tiempo viene.',
    'ui.village.panel.hours': 'a {h} h',
    'ui.village.panel.intro': 'Primeras inmersiones: el mar estará en calma y con sol.',
    'ui.village.panel.moon': 'Luna',
    'ui.village.panel.today': 'Hoy',
    'ui.village.panel.tomorrow': 'Mañana',
    'ui.village.panel.dayAfter': 'Pasado mañana',
    'ui.village.panel.noMoon': 'Las fases lunares las muestra la Estación meteo nivel 3.',
    'ui.village.panel.hot': 'Alta demanda',
    'ui.village.panel.hotNone': 'Hoy nada especial.',
    'ui.village.panel.hotMult': '×{mult}',
    'ui.village.panel.storage': 'Almacén',
    // {got} peces de una capacidad de {n}; forma según la capacidad ("3 / 5 peces")
    'ui.village.panel.storageCount': { one: '{got} / {n} pez', other: '{got} / {n} peces' },
    'ui.village.panel.sellHint': 'Véndelos en el Mercado.',
    'ui.village.panel.quests': 'Encargos',
    'ui.village.panel.questsLocked': 'Los pescadores de la Taberna dan encargos desde el nivel 2.',
    // poste indicador hacia la Vieja central (Lago nuclear, docs/JAZERO.md); toLake = botón 104 px como AL MAR
    'ui.village.plant.name': 'Vieja central',
    'ui.village.plant.sub': 'Lago nuclear',
    'ui.village.plant.toLake': 'AL LAGO',
    'ui.village.plant.intro': 'Construye el Astillero y compra sedal y caña de lago en el Laboratorio. Luego, AL LAGO.',
    'ui.village.plant.zones': 'Zonas del lago',
    'ui.village.plant.reach': 'Alcance en el lago',
    'ui.village.plant.fish': 'Peces del lago',
  });
})(globalThis.HL);
