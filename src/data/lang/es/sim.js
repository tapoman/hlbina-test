// Español — textos de la simulación (sim/*.js). Claves = src/data/lang/sk/sim.js. Glosario: es/data.js.
// Plurales es: { one, other }. En sim.quest.fish.* la forma one va SIN número ("Pesca una anguila").
(function (HL) {
  HL.i18n.add('es', 'sim', {
    // --- pueblo: por qué algo no se puede
    'sim.village.needBuilding': 'Requiere {building} nivel {level}',
    'sim.village.needLegend': 'Requiere la leyenda {legend}',
    'sim.village.maxLevel': 'Nivel máximo',
    'sim.village.noMoney': 'Falta dinero',
    'sim.village.notSold': 'No está a la venta',
    'sim.village.equipped': 'Equipado',
    'sim.village.owned': 'Ya lo tienes',
    'sim.village.harpoonFull': 'No puedes llevar más arpones',
    'sim.village.goldSoldOut': 'Hoy ya no queda cebo dorado. Vuelve mañana.',
    // Lago nuclear (docs/JAZERO.md): sin el equipo de lago del Laboratorio no se va al lago
    'sim.village.needLakeLine': 'Requiere un sedal de lago del Laboratorio',
    'sim.village.needLakeRod': 'Requiere una caña de lago del Laboratorio',
    // edificio dentro de "Requiere {building} nivel {level}"
    'sim.village.acc.chatrc': 'Cabaña',
    'sim.village.acc.trhovisko': 'Mercado',
    'sim.village.acc.dielna': 'Taller',
    'sim.village.acc.navnadaren': 'Tienda de cebos',
    'sim.village.acc.meteostanica': 'Estación meteo',
    'sim.village.acc.majak': 'Faro',
    'sim.village.acc.krcma': 'Taberna',
    'sim.village.acc.akvarium': 'Acuario',
    'sim.village.acc.lodenica': 'Astillero',
    'sim.village.acc.laboratorium': 'Laboratorio',

    // --- encargos de la Taberna
    'sim.quest.catch': 'Pesca {what}',
    'sim.quest.catchCond': 'Pesca {what} {cond}',
    'sim.quest.depth': 'Baja a {depth} y vuelve',
    'sim.quest.value': 'Pesca por valor de {money} en una inmersión',
    'sim.quest.count': 'Trae al menos {fish} de una inmersión',
    'sim.quest.countFish': { one: '{n} pez', other: '{n} peces' },
    'sim.quest.fish.sardinka': { one: 'una sardina', other: '{n} sardinas' },
    'sim.quest.fish.okun': { one: 'una lubina', other: '{n} lubinas' },
    'sim.quest.fish.krab': { one: 'un cangrejo', other: '{n} cangrejos' },
    'sim.quest.fish.platesa': { one: 'una solla', other: '{n} sollas' },
    'sim.quest.fish.makrela': { one: 'una caballa', other: '{n} caballas' },
    'sim.quest.fish.pyskac': { one: 'un budión', other: '{n} budiones' },
    'sim.quest.fish.papagajovka': { one: 'un pez loro', other: '{n} peces loro' },
    'sim.quest.fish.zubatica': { one: 'un dentón', other: '{n} dentones' },
    'sim.quest.fish.murena': { one: 'una morena', other: '{n} morenas' },
    'sim.quest.fish.barakuda': { one: 'una barracuda', other: '{n} barracudas' },
    'sim.quest.fish.svetlonoska': { one: 'un pez linterna', other: '{n} peces linterna' },
    'sim.quest.fish.treska': { one: 'un bacalao', other: '{n} bacalaos' },
    'sim.quest.fish.uhor': { one: 'una anguila', other: '{n} anguilas' },
    'sim.quest.fish.tuniak': { one: 'un atún', other: '{n} atunes' },
    'sim.quest.fish.mesacnica': { one: 'un pez luna plateado', other: '{n} peces luna plateados' },
    'sim.quest.fish.lampasnik': { one: 'un rape abisal', other: '{n} rapes abisales' },
    'sim.quest.fish.pazravy': { one: 'una anguila voraz', other: '{n} anguilas voraces' },
    'sim.quest.fish.raja': { one: 'una raya brumosa', other: '{n} rayas brumosas' },
    'sim.quest.fish.sklenena': { one: 'un pez de cristal', other: '{n} peces de cristal' },
    'sim.quest.fish.velkoustka': { one: 'un bocazas', other: '{n} bocazas' },
    'sim.quest.fish.latimeria': { one: 'un celacanto', other: '{n} celacantos' },
    'sim.quest.fish.sled': { one: 'un arenque migratorio', other: '{n} arenques migratorios' },
    'sim.quest.fish.tekvicovka': { one: 'un pez calabaza', other: '{n} peces calabaza' },
    'sim.quest.fish.prizrak': { one: 'un pez fantasma', other: '{n} peces fantasma' },
    // condición del encargo ("Pesca 3 anguilas de noche")
    'sim.quest.cond.morning': 'por la mañana',
    'sim.quest.cond.day': 'de día',
    'sim.quest.cond.evening': 'por la tarde',
    'sim.quest.cond.night': 'de noche',
    'sim.quest.cond.sun': 'con sol',
    'sim.quest.cond.cloudy': 'con cielo nublado',
    'sim.quest.cond.rain': 'bajo la lluvia',
    'sim.quest.cond.fog': 'con niebla',
    'sim.quest.cond.storm': 'con tormenta',
    'sim.quest.cond.fullmoon': 'con luna llena',
    'sim.quest.cond.newmoon': 'con luna nueva',

    // --- pistas de leyendas (Taberna nivel 3)
    'sim.clue.caught': 'Pescada. El trofeo va al Acuario.',
    'sim.clue.text': '{hint} Condiciones: {conds}. Zona: {zone}.',

    // --- mundo
    'sim.world.day': 'Día {n}',
    'sim.world.clear': 'Despejado',

    // --- partida y guardado ({detail} = causa técnica, no se traduce)
    'sim.game.noStorage': 'La partida no se guarda: no hay de dónde restaurarla.',
    'sim.game.noBackup': 'No se puede cargar ninguna copia de seguridad.',
    'sim.game.stale': 'La partida está abierta en otra pestaña: esta ya no guarda. Recarga la página.',
    'sim.save.corrupt': 'No se guardó, el estado de la partida está dañado: {detail}',
    'sim.save.writeFailed': 'Error al guardar: {detail}',
    'sim.save.unavailable': 'Almacenamiento no disponible: {detail}',
    'sim.save.loadFailed': 'No se puede cargar la partida: {detail}',
    'sim.save.settingsLoad': 'No se pueden cargar los ajustes: {detail}',
    'sim.save.settingsStore': 'No se pueden guardar los ajustes: {detail}',
  });
})(globalThis.HL);
