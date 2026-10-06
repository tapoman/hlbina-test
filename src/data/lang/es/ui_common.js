// Español — textos comunes de pantallas (ui/common.js, core/main.js, selector de idioma, línea de salida).
// Claves = src/data/lang/sk/ui_common.js. Glosario: es/data.js.
(function (HL) {
  HL.i18n.add('es', 'ui_common', {
    // insignia de guardado (' — ' = donde un texto largo puede partirse en mitades alternas)
    'ui.common.save.nosave': 'La partida no se guarda',
    'ui.common.save.stale': 'Partida abierta en otra pestaña — no se guardan los cambios',
    'ui.common.moreBelow': '↓ más',
    // etiqueta de tamaño de la pieza (HL.ui.tierTag), sobre el panel de lucha
    'ui.common.tier.velky': 'GRANDE',
    'ui.common.tier.trofejny': 'TROFEO',
    // selector de idioma (portada, Ajustes)
    'ui.common.lang.title': 'Idioma',
    'ui.common.lang.soon': 'pronto',
    'ui.common.close': 'Cerrar',
    // salida (HL.data.tripLine): "Salida: 3 inmersiones · 5 peces · 120 €"
    'ui.common.tripLine': 'Salida: {dives} · {fish} · {value}',
    'ui.common.tripDives': { one: '{n} inmersión', other: '{n} inmersiones' },
    'ui.common.tripFish': { one: '{n} pez', other: '{n} peces' },
    // consejo para el móvil en horizontal (margen lateral, dos líneas)
    'ui.common.rotate1': 'Gira el móvil',
    'ui.common.rotate2': 'en vertical',
    // paneles laterales por defecto (PC); líneas de controles: teclas / descripción
    'ui.common.panel.controls': 'Controles',
    'ui.common.panel.keysMove': 'A / D, ratón',
    'ui.common.panel.move': 'anzuelo a los lados',
    'ui.common.panel.keysSink': 'S, botón izquierdo',
    'ui.common.panel.sink': 'bajar',
    'ui.common.panel.keysTap': 'Espacio, clic',
    'ui.common.panel.fight': 'lucha con el pez',
    'ui.common.panel.up': 'SUBIR',
    'ui.common.panel.harpoon': 'arpón',
    'ui.common.panel.pause': 'pausa / atrás',
    'ui.common.panel.f2': 'F2 ajuste fino',
    'ui.common.panel.f3': 'F3 depuración',
    'ui.common.panel.money': 'Dinero',
    'ui.common.panel.day': 'Día',
    'ui.common.panel.time': 'Hora',
    'ui.common.panel.weather': 'Tiempo',
    'ui.common.panel.moon': 'Luna',
    // barra roja abajo si falla un script ({msg} = mensaje técnico, no se traduce)
    'ui.common.errorBar': 'ERROR: {msg}',
  });
})(globalThis.HL);
