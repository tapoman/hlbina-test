// Español — Profundidad infinita, menú del modo (ui/endless.js). Claves = src/data/lang/sk/endless.js.
// Glosario: es/data.js. Anchos: frases 164 px (se parten), nombre del equipo 60–71 px, cabecera de la
// clasificación en pequeña alineada a la derecha (Prof. ~50 px, Captura ~55 px, Día ~34 px),
// texto junto al candado 106 px, botón 168 px, panel lateral 94 px. {every} = "250 m".
(function (HL) {
  HL.i18n.add('es', 'endless', {
    'ui.endless.title': 'Profundidad infinita',
    'ui.endless.subUnlocked': 'Faro 3 · desbloqueado',
    'ui.endless.locked': 'Bloqueado',
    'ui.endless.dive': 'SUMERGIRSE',
    'ui.endless.descUnlocked': 'Una inmersión larga con equipo fijo, sin pueblo ni mercado. Cada {every} eliges 1 de 3 mejoras. Meta: bajar al máximo con la mejor captura.',
    'ui.endless.descLocked': 'Una inmersión larga con equipo fijo, sin pueblo ni mercado. Cada {every} eliges 1 de 3 mejoras.',
    // equipo fijo (los demás nombres vienen de los datos)
    'ui.endless.gear': 'Equipo fijo',
    'ui.endless.harpoons': 'Arpón ×{n}',
    'ui.endless.baitMix': 'Cebos mixtos',
    // clasificación
    'ui.endless.board': 'Clasificación · top 10',
    'ui.endless.boardEmpty': 'Vacía por ahora. La primera inmersión se apuntará aquí: profundidad y valor de la captura.',
    'ui.endless.col.depth': 'Prof.',
    'ui.endless.col.value': 'Captura',
    'ui.endless.col.day': 'Día',
    'ui.endless.rank': '{n}.',
    'ui.endless.boardNote': 'Solo en este dispositivo. La versión web no tiene clasificaciones mundiales (Steam, Game Center).',
    'ui.endless.boardNoteCg': 'La clasificación se guarda junto con tu progreso.',
    'ui.endless.perksExample': 'Mejoras, por ejemplo',
    // bloqueado
    'ui.endless.unlockBy': 'Se desbloquea con el Faro nivel 3.',
    'ui.endless.yourMajak': 'Tu Faro',
    'ui.endless.level': 'nivel {level} / 3',
    'ui.endless.majakAlso': 'El Faro nivel 3 también abre el Abismo en la partida. Para construirlo hay que pescar a la Dama de la niebla.',
    // paneles laterales (PC)
    'ui.endless.panel.perks': 'Mejoras',
    'ui.endless.panel.every': 'cada {every}, 1 de 3',
    'ui.endless.panel.records': 'Récords',
    'ui.endless.panel.deepest': 'Lo más hondo',
    'ui.endless.panel.richest': 'Captura más valiosa',
    'ui.endless.panel.entries': 'Entradas',
    'ui.endless.panel.keyDive': 'S / Enter: sumergirse',
    'ui.endless.panel.keyBack': 'Esc: atrás',
  });
})(globalThis.HL);
