// Español — resultado de la inmersión y final del juego (ui/results.js). Claves = src/data/lang/sk/results.js.
// Glosario: es/data.js. Anchos: frases 168 px (se parten), subtítulo 168 px en pequeña, etiquetas de peces
// en pequeña (~40 px), botones 86 / 78 / 168 px, panel lateral 94 px. {n} = cantidad; dinero/peso/profundidad
// llegan ya formateados.
(function (HL) {
  HL.i18n.add('es', 'results', {
    'ui.results.title': 'Resultado',
    'ui.results.titleEndless': 'Profundidad infinita',
    // titular (letra ×2, contorno) y línea bajo él ({depth} = "40 m", {min} = minutos)
    'ui.results.safe': 'A SALVO',
    'ui.results.snapped': '¡SE ROMPIÓ!',
    'ui.results.headline': 'Bajaste a {depth} · {min} min bajo el agua',
    'ui.results.endlessSafe': 'A SALVO · punto más hondo · {min} min',
    'ui.results.endlessSnapped': 'SE ROMPIÓ · punto más hondo · {min} min',
    // etiquetas en la fila del pez (versalitas pequeñas sobre franja de color)
    'ui.results.tag.new': 'NUEVO',
    'ui.results.tag.record': 'RÉCORD',
    'ui.results.tag.legend': 'LEYENDA',
    'ui.results.tag.sold': 'VENDIDO',
    'ui.results.tag.shark': 'TIBURÓN',
    'ui.results.tag.knot': 'NUDO',
    // rotura: qué se perdió (gusano = cebo básico, si no "el cebo")
    'ui.results.lostWorm': 'Perdiste el gusano.',
    'ui.results.lostBait': 'Perdiste el cebo.',
    'ui.results.lostFishWorm': { one: 'Perdiste {n} pez y el gusano.', other: 'Perdiste {n} peces y el gusano.' },
    'ui.results.lostFishBait': { one: 'Perdiste {n} pez y el cebo.', other: 'Perdiste {n} peces y el cebo.' },
    // consejo tras la rotura según la causa (panel 168 px, se parte)
    'ui.results.tipTitle': 'Consejo de pescador',
    'ui.results.tip.jelly': 'La medusa tensa el sedal tres segundos. Con el sedal lleno, esquívala o pulsa SUBIR.',
    'ui.results.tip.spikes': 'En ROJO no toques: cada toque da un tirón al sedal y la tensión se dispara.',
    'ui.results.tip.fight': 'No temas a los peces grandes. Lo malo es luchar con uno cuando ya tienes el sedal lleno.',
    'ui.results.tip.octopus': 'Al pulpo te lo quitas de encima sacudiendo el anzuelo de lado a lado.',
    'ui.results.tip.hazard': 'La leyenda tira con corrientes y rayos. Deja mucho margen en el sedal.',
    'ui.results.tip.eel': 'En el Abismo no te quedes quieto. La anguila sombría espera justo eso.',
    'ui.results.tip.rock': 'La roca debilita el sedal hasta que subas. Tras un golpe, ve con más cuidado.',
    'ui.results.tip.barrel': 'El barril oxidado debilita el sedal hasta que subas. Tras un golpe, ve con más cuidado.',
    'ui.results.tip.depth': 'Si bajas más con el sedal lleno, la tensión sube aunque no pique ningún pez nuevo. Pulsa SUBIR antes.',
    // Festival de verano: concurso del día ({fish} = pez, {kg}/{target}/{best} = "1,4 kg", {money} = "150 €")
    'ui.results.contest': 'Concurso del día',
    'ui.results.contestWon': '¡Has ganado! {fish} de {kg} pesa más que la meta de {target}.',
    'ui.results.contestPrizePaid': 'El premio de +{money} está en tu cuenta.',
    'ui.results.contestPrizeLater': 'El premio de +{money} llegará con el nuevo día.',
    'ui.results.contestBest': 'Tu pez más pesado {best} / meta {target}',
    'ui.results.contestWonToday': 'Hoy ya has ganado: el premio de {money} llegará con el nuevo día.',
    'ui.results.contestHint': 'Un pez más pesado gana {money}.',
    'ui.results.contestPrize': 'El premio del concurso, +{money}, está en tu cuenta.',
    // desarrollo de la inmersión (números), peligros unidos con " · "
    'ui.results.stats': 'Cómo fue',
    'ui.results.statsFights': 'Luchas {fights} · pescados {landed} · escapados {escaped}',
    'ui.results.statsTaps': 'Toques buenos {good} · malos {bad}',
    'ui.results.hazards': 'Peligros: {list}',
    'ui.results.hazJelly': 'medusas {n}',
    'ui.results.hazRock': 'rocas {n}',
    'ui.results.hazBarrel': 'barriles {n}',    // Lago nuclear
    'ui.results.hazShark': 'tiburón se comió {n}',
    // Profundidad infinita
    'ui.results.rank': 'Puesto {rank} en la clasificación',
    'ui.results.noRank': 'Fuera de la clasificación (top 10)',
    'ui.results.catchValue': 'Valor de la captura',
    'ui.results.perks': 'Mejoras',
    'ui.results.perkStack': '{perk} ×{n}',
    'ui.results.noPerks': 'Ninguna: no llegaste a los 250 m.',
    'ui.results.catchCount': 'Captura ({n})',
    'ui.results.allLost': 'El mar se lo llevó todo.',
    'ui.results.noCatch': 'Sin captura.',
    'ui.results.lost': 'Perdido',
    // A SALVO (partida); {stored}/{cap} = ocupación de la Cabaña
    'ui.results.empty': 'Esta vez sin captura. Prueba otra profundidad, otra hora u otro cebo.',
    'ui.results.toStorage': {
      one: 'A la Cabaña: {n} pez ({stored} / {cap}). Lo venderás en el mercado.',
      other: 'A la Cabaña: {n} peces ({stored} / {cap}). Los venderás en el mercado.',
    },
    'ui.results.soldOverflow': {
      one: '{n} pez no cupo en la Cabaña: vendido por {money}.',
      other: '{n} peces no cupieron en la Cabaña: vendidos por {money}.',
    },
    'ui.results.haul': {
      one: 'El bonus por {n} pez (+{pct}), +{money}, está en tu cuenta.',
      other: 'El bonus por {n} peces (+{pct}), +{money}, está en tu cuenta.',
    },
    'ui.results.lostOnWay': 'Perdido por el camino',
    'ui.results.questsDone': { one: 'Encargo cumplido', other: 'Encargos cumplidos' },
    'ui.results.rewardGold': { one: '+{n} cebo dorado', other: '+{n} cebos dorados' },
    'ui.results.legend': 'Leyenda: {name}',
    'ui.results.daysPassed': {
      one: 'Mientras estabas en el mar empezó un nuevo día. El mercado cambió.',
      other: 'Mientras estabas en el mar pasaron {n} días. El mercado cambió.',
    },
    'ui.results.aquarium': 'El Acuario ganó {money}.',
    'ui.results.storageFull': 'La Cabaña está llena: lo que no quepa se vende al volver.',
    // botones de la barra inferior
    'ui.results.toMarket': 'Al mercado',
    'ui.results.toVillage': 'Al pueblo',
    'ui.results.toPlant': 'A la orilla',       // Lago nuclear: vuelve a la Vieja central
    'ui.results.continue': 'Continuar',
    // final del juego (Guardián del abismo pescado); titular ×2 en dos líneas de ~14 caracteres
    'ui.results.ending.title1': 'GUARDIÁN DEL',
    'ui.results.ending.title2': 'ABISMO',
    'ui.results.ending.caught': 'ha caído',
    'ui.results.ending.text': 'El pueblo lo celebra. Los farolillos brillan hasta el alba y los pescadores brindan a tu salud. El mar vuelve a estar en calma.',
    'ui.results.ending.thanks': '¡Gracias por jugar!',
    'ui.results.ending.palette': 'Paleta ENDESGA 32',
    'ui.results.ending.audio': 'Música y sonidos sintetizados en el juego',
    'ui.results.ending.more': 'Puedes seguir pescando: récords, enciclopedia, Profundidad infinita.',
    // paneles laterales (PC): etiquetas en pequeña, valor a la derecha
    'ui.results.panel.fights': 'Luchas',
    'ui.results.panel.landed': 'Pescados',
    'ui.results.panel.escaped': 'Escapados',
    'ui.results.panel.goodTaps': 'Toques buenos',
    'ui.results.panel.badTaps': 'Toques malos',
    'ui.results.panel.jelly': 'Medusas',
    'ui.results.panel.rock': 'Rocas',
    'ui.results.panel.barrel': 'Barriles',     // Lago nuclear
    'ui.results.panel.shark': 'Tiburón',
    'ui.results.panel.career': 'Partida',
    'ui.results.panel.dives': 'Inmersiones',
    'ui.results.panel.caught': 'Pescados',
    'ui.results.panel.snaps': 'Roturas',
    'ui.results.panel.earned': 'Ganado',
    'ui.results.panel.deepest': 'Lo más hondo',
    'ui.results.panel.biggest': 'Mayor pieza',
  });
})(globalThis.HL);
