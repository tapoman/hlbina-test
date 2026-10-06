// Español — preparación de la inmersión (ui/prep.js). Claves = src/data/lang/sk/prep.js. Glosario: es/data.js.
// Anchos: etiqueta del equipo a la derecha en pequeña (~60 px), frase bajo el sedal 156 px, título de sección
// 168 px, panel lateral 94 px (se parte). {n} = cantidad (plural), el resto ya viene formateado.
(function (HL) {
  HL.i18n.add('es', 'prep', {
    'ui.prep.title': 'Preparación',
    'ui.prep.dive': 'SUMERGIRSE',
    'ui.prep.haul': 'BONUS',
    'ui.prep.haulToast': 'Bonus: desde {from} peces +{pct}. Si un pez se escapa en la lucha, pierdes todos los peces de la línea.',
    // secciones de la lista
    'ui.prep.bait': 'Cebo',
    'ui.prep.gear': 'Equipo',
    'ui.prep.reach': 'Hasta dónde llega el sedal',
    'ui.prep.hot': 'Hoy se busca en el mercado',
    'ui.prep.hotNone': 'Hoy nada especial.',
    'ui.prep.hotMult': '★ ×{mult}',
    // condiciones y previsión (las filas de días tienen 34 px de letra pequeña para la etiqueta)
    'ui.prep.noForecast': 'La Estación meteo da la previsión.',
    'ui.prep.introSun': 'Las primeras inmersiones son siempre con sol.',
    'ui.prep.today': 'hoy',
    'ui.prep.tomorrow': 'mañana',
    'ui.prep.dayAfter': 'pasado',
    // previsión de peces (sección bajo el tiempo, 168 px): hora en letra normal, a la derecha en pequeña momento · tiempo;
    // fila de pez = nombre + profundidad; fishShow / fishHide = fila plegar/desplegar (la UI añade « ▸» / « ▴», máx. 157 px)
    'ui.prep.fish': 'Qué pica y cuándo',
    'ui.prep.fishNow': 'ahora',
    'ui.prep.fishTomorrow': 'mañana {time}',
    'ui.prep.fishDayAfter': 'pasado mañana {time}',
    'ui.prep.fishDay': 'día {n}, {time}',
    'ui.prep.fishCond': '{period} · {weather}',
    'ui.prep.fishNone': 'solo peces comunes',
    'ui.prep.fishShow': { one: 'Próximas horas ({n} cambio)', other: 'Próximas horas ({n} cambios)' },
    'ui.prep.fishHide': 'Ocultar previsión',
    // tarjeta del cebo: cuántas unidades lleva el jugador
    'ui.prep.carry': { one: 'llevas {n} ud.', other: 'llevas {n} ud.' },
    'ui.prep.unlimited': 'sin límite',
    // equipo ({ms} = milisegundos de tolerancia, {pct} = "60 %")
    'ui.prep.noFloor': 'sin fondo',
    'ui.prep.limitLighthouse': 'Más abajo solo con el Faro 3.',
    'ui.prep.limitFloor': 'Llega hasta el fondo del mar.',
    // Lago nuclear: frase bajo el sedal, 148 px en letra normal ("Más abajo solo con mejor Astillero." no cabía)
    'ui.prep.limitShipyard': 'Más abajo: mejora el Astillero.',
    'ui.prep.limitCore': 'Llega hasta el núcleo.',
    'ui.prep.rodTolerance': 'ritmo +{ms} ms',
    'ui.prep.rodBasic': 'básica',
    'ui.prep.hookEscape': 'fuga –{pct}',
    'ui.prep.hookBasic': 'básico',
    'ui.prep.harpoons': 'Arpones',
    'ui.prep.harpoonCount': { one: '{n} ud.', other: '{n} ud.' },
    'ui.prep.harpoonNone': 'ninguno',
    'ui.prep.harpoonLocked': 'desde Taller 2',
    'ui.prep.storage': 'Cabaña',
    'ui.prep.storageFull': 'llena — se vende al volver',
    // {stored} = peces en la Cabaña, {n} = capacidad (forma según la capacidad)
    'ui.prep.storageCount': { one: '{stored} / {n} pez', other: '{stored} / {n} peces' },
    // paneles laterales (PC)
    'ui.prep.panel.weather': 'Tiempo',
    'ui.prep.panel.weatherHint': 'La Estación meteo muestra qué tiempo viene. Algunos peces solo pican con lluvia, niebla o tormenta.',
    'ui.prep.panel.now': 'ahora',
    'ui.prep.panel.dayTime': '{day}, {time}',
    'ui.prep.panel.reach': 'Alcance',
    'ui.prep.panel.depthRule': 'Cuanto más hondo estés, más pesa el pez en el sedal: a 500 metros, el triple.',
    'ui.prep.panel.keyDive': 'Enter  sumergirse',
    'ui.prep.panel.keyBack': 'Esc  volver al pueblo',
    'ui.prep.panel.keyBackPlant': 'Esc  volver a la central',
  });
})(globalThis.HL);
