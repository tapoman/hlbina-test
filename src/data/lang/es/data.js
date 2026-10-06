// Español — prekrytie dát (mená rýb, budov, výbavy, svet, tipy, návod, rytmy). Kľúče = src/data/lang/sk/data.js
// (vygenerovaný zdroj). Pravidlá: docs/I18N.md.
//
// GLOSARIO (usar SIEMPRE el mismo término en las 13 áreas):
//   HLBINA / Hlbina       marca, no se traduce
//   ponor / ponoriť sa    inmersión / sumergirse        (botón: SUMERGIRSE, OTRA INMERSIÓN)
//   HORE (tlačidlo)       SUBIR                          vyplávať = salir a flote
//   úlovok                captura                        chytiť = pescar
//   vlasec                sedal                          prút = caña, háčik = anzuelo, harpúna = arpón
//   návnada               cebo                           červík = gusano, kúsky mušlí = mejillón
//   napätie / pevnosť     tensión / resistencia          praskol = ¡SE ROMPIÓ!, prasknutie = rotura
//   hĺbka / pásmo         profundidad / zona             násobok = ×
//   boj / ťuknutie        lucha / toque (tocar)          ŤAHÁ = TIRA, POVOLÍ = AFLOJA, zaseknutie = clavada
//   ZELENÁ / ČERVENÁ      VERDE / ROJO
//   dedina / prístav      pueblo / Puerto                výlet = salida
//   Chatrč                Cabaña (úložisko = almacén)    Trhovisko = Mercado, Dielňa = Taller
//   Návnadáreň            Tienda de cebos                Meteostanica = Estación meteo, Maják = Faro
//   Krčma                 Taberna                        Akvárium = Acuario
//   úlohy / stopy         encargos / pistas              objednávky (trh) = pedidos, dopyt = demanda
//   legenda / trofej      leyenda / trofeo               vylepšenie (Nekonečná) = mejora
//   úroveň                nivel                          výbava = equipo, nasadiť = equipar
//   pásma: Plytčina = Bajíos, Útesy = Arrecifes, Súmrak = Ocaso (no Penumbra: 34 px, se pega a sus vecinos en la barra de Prep), Polnoc = Tinieblas,
//          Priepasť = Abismo, Nekonečná hlbina = Profundidad infinita (modo de juego)
//   predpoveď = previsión, počasie = tiempo, udalosť = evento, rebríček = clasificación
//   najhlbšie: en ESTA inmersión = Máximo / Bajaste a…; récord de la partida = Lo más hondo (nunca "Récord" para la inmersión)
//   pozajtra = Pasado mañana (Prep: "pasado" — la etiqueta tiene 34 px y la barra la tapa)
//   NOVÝ DRUH (štítok) = NUEVO (sirve para pez y leyenda); zlatá návnada = cebo dorado ("+1 dorado" solo en la tarjeta)
//   ★ = leyenda (como en la Enciclopedia): panel de zona "★ {name}" — "Leyenda: Guardián del abismo" no cabe en 94 px
//   LAGO NUCLEAR (docs/JAZERO.md):
//   Stará elektráreň      Vieja central (en frase: la central)   Jadrové jazero = Lago nuclear (pestaña/tecla: Lago/lago)
//   Lodenica              Astillero (m.)                 Laboratórium = Laboratorio (m.)
//   NA JAZERO (botón)     AL LAGO (como AL MAR)          breh / BREH = orilla / ORILLA (A la orilla = volver a la central)
//   pásma del lago: Chladiace jazero = Lago refrigerante (corto: Lago; "Lago de refrigeración" no cabe en 110 px
//          con la profundidad), Zatopená hala = Sala inundada (Sala), Šachta reaktora = Pozo del reactor (Pozo); jadro = núcleo
//   jazerný / morský vlasec, prút = sedal / caña de lago, de mar (como "caña de mar / de río" en la pesca real)
//   olovený / grafitový / zirkóniový = de plomo / de grafito / de circonio; PERO Grafitový prút = Caña de grafito PURO:
//          "Caña de grafito" ya es Karbónový prút (Taller). "Caña de carbono" no sirve: 74 px y la lista de equipo de
//          Profundidad infinita deja 71 px (se cortaba)
//   sud = barril (Hrdzavý sud = Barril oxidado), Svietiaca medúza = Medusa luminosa, mutant = mutante
//   ANCHO: medir con HL.font.measure (fuente real, como tests/unit/i18n.test.js); límites en los comentarios de sk/*.js
(function (HL) {
  HL.i18n.add('es', 'data', {
    // fish
    'fish.sardinka.name': 'Sardina',
    'fish.sardinka.hint': 'Pica siempre y en todas partes. Hasta con un simple gusano.',
    'fish.okun.name': 'Lubina',
    'fish.okun.hint': 'De día se queda cerca de la superficie.',
    'fish.krab.name': 'Cangrejo',
    'fish.krab.hint': 'Solo sale de noche. No se resiste al mejillón.',
    'fish.platesa.name': 'Solla',
    'fish.platesa.hint': 'Los pescadores dicen que la lluvia la hace salir.',
    'fish.makrela.name': 'Caballa',
    'fish.makrela.hint': 'Los bancos de caballas solo aparecen por la mañana.',
    'fish.pyskac.name': 'Budión',
    'fish.pyskac.hint': 'Vive en los arrecifes. Pica casi siempre.',
    'fish.papagajovka.name': 'Pez loro',
    'fish.papagajovka.hint': 'Colorido como el arcoíris, pero solo cuando brilla el sol.',
    'fish.zubatica.name': 'Dentón',
    'fish.zubatica.hint': 'Caza cuando se pone el sol.',
    'fish.murena.name': 'Morena',
    'fish.murena.hint': 'De noche sale de entre las rocas. Lucha de forma imprevisible.',
    'fish.barakuda.name': 'Barracuda',
    'fish.barakuda.hint': 'Dicen que con tormenta ataca todo lo que se mueve.',
    'fish.svetlonoska.name': 'Pez linterna',
    'fish.svetlonoska.hint': 'Lucecitas en la penumbra. Ahí abajo hay montones.',
    'fish.treska.name': 'Bacalao',
    'fish.treska.hint': 'Cuando la niebla cubre el mar, el bacalao sube.',
    'fish.uhor.name': 'Anguila',
    'fish.uhor.hint': 'Cazadora nocturna de la penumbra. Se retuerce como loca.',
    'fish.tuniak.name': 'Atún',
    'fish.tuniak.hint': 'De día nada en lo hondo. Pesa mucho — cuida tu sedal.',
    'fish.mesacnica.name': 'Pez luna plateado',
    'fish.mesacnica.hint': 'Dicen que lo vieron con luna llena…',
    'fish.lampasnik.name': 'Rape abisal',
    'fish.lampasnik.hint': 'Una lucecita en la oscuridad total. No te dejes engañar.',
    'fish.pazravy.name': 'Anguila voraz',
    'fish.pazravy.hint': 'Solo tiene hambre cuando no hay luna en el cielo.',
    'fish.raja.name': 'Raya brumosa',
    'fish.raja.hint': 'Una sombra abisal que sube con la niebla.',
    'fish.sklenena.name': 'Pez de cristal',
    'fish.sklenena.hint': 'Transparente como el cristal. Solo lo despierta la tormenta.',
    'fish.velkoustka.name': 'Bocazas',
    'fish.velkoustka.hint': 'Todo boca. Vive donde ni el faro alcanza a ver.',
    'fish.latimeria.name': 'Celacanto',
    'fish.latimeria.hint': 'Un fósil viviente. Dicen que sube del abismo con luna llena.',
    'fish.sled.name': 'Arenque migratorio',
    'fish.sled.hint': 'En primavera pasan por aquí bancos enormes.',
    'fish.tekvicovka.name': 'Pez calabaza',
    'fish.tekvicovka.hint': 'Una lucecita naranja en la noche de octubre.',
    'fish.prizrak.name': 'Pez fantasma',
    'fish.prizrak.hint': 'Está ahí, y luego ya no. Solo en octubre.',

    // fish — Lago nuclear (mutantes)
    'fish.dvojhlavy_kapor.name': 'Carpa bicéfala',
    'fish.dvojhlavy_kapor.hint': 'Dos cabezas y un solo estómago. Se traga casi cualquier cosa.',
    'fish.svietiaca_plotica.name': 'Rutilo luminoso',
    'fish.svietiaca_plotica.hint': 'De noche brilla en verde. Nada en bancos.',
    'fish.trojoky_ostriez.name': 'Perca de tres ojos',
    'fish.trojoky_ostriez.hint': 'De día no le quita los tres ojos de encima al cebo.',
    'fish.olovena_stuka.name': 'Lucio de plomo',
    'fish.olovena_stuka.hint': 'Pesado como el plomo. Acecha entre las turbinas.',
    'fish.turbinovy_sumec.name': 'Siluro de turbina',
    'fish.turbinovy_sumec.hint': 'De noche se revuelca en las entrañas de las turbinas.',
    'fish.hrdzavy_uhor.name': 'Anguila oxidada',
    'fish.hrdzavy_uhor.hint': 'Cuando llueve, sale de las tuberías oxidadas.',
    'fish.izotopova_mihula.name': 'Lamprea isotópica',
    'fish.izotopova_mihula.hint': 'Brilla tanto que se la ve hasta en el pozo del reactor.',
    'fish.grafitova_platesa.name': 'Solla de grafito',
    'fish.grafitova_platesa.hint': 'Con tormenta se despega del fondo de hormigón del pozo.',

    // legend
    'legend.zlaty_uhor.name': 'Anguila dorada',
    'legend.zlaty_uhor.hint': 'Dicen que las mañanas de sol algo dorado destella entre los arrecifes.',
    'legend.hmlista_dama.name': 'Dama de la niebla',
    'legend.hmlista_dama.hint': 'Cuando hay niebla y la luna se esconde, en las Tinieblas aparece una figura blanca.',
    'legend.kral_burky.name': 'Rey de la tormenta',
    'legend.kral_burky.hint': 'Tormenta y luna llena a la vez. Entonces algo enorme despierta en el abismo.',
    'legend.ladova_velryba.name': 'Ballena de hielo',
    'legend.ladova_velryba.hint': 'Solo en invierno. Canta tan hondo que se la oye hasta en el pueblo.',
    'legend.bludicka.name': 'Fuego fatuo abisal',
    'legend.bludicka.hint': 'Noche de octubre. Una lucecita que atrae a los pescadores hacia el fondo.',
    'legend.strazca.name': 'Guardián del abismo',
    'legend.strazca.hint': 'En lo más hondo, algo guarda el abismo. Solo se acerca a quien ha pescado todas las leyendas.',

    // legend — Lago nuclear
    'legend.atomovy_sumec.name': 'Siluro atómico',
    'legend.atomovy_sumec.hint': 'En las noches de lluvia el núcleo brilla más que nunca. Algo grande duerme a su lado.',

    // line
    'line.hemp.name': 'Sedal de cáñamo',
    'line.nylon.name': 'Sedal de nailon',
    'line.braided.name': 'Sedal trenzado',
    'line.steel.name': 'Sedal de acero',
    'line.legend.name': 'Sedal legendario',

    // rod
    'rod.bamboo.name': 'Caña de bambú',
    'rod.fiber.name': 'Caña de fibra',
    'rod.carbon.name': 'Caña de grafito',
    'rod.master.name': 'Caña maestra',

    // line — Lago nuclear (Laboratorio)
    'line.lead.name': 'Sedal de plomo',
    'line.graphite.name': 'Sedal de grafito',
    'line.zirconium.name': 'Sedal de circonio',

    // rod — Lago nuclear (Laboratorio)
    'rod.lead_rod.name': 'Caña de plomo',
    'rod.graphite_rod.name': 'Caña de grafito puro',   // "Caña de grafito" ya es la caña de carbono del Taller
    'rod.zirconium_rod.name': 'Caña de circonio',

    // hook
    'hook.basic.name': 'Anzuelo simple',
    'hook.barbed.name': 'Anzuelo con púa',
    'hook.circle.name': 'Anzuelo curvo',
    'hook.titan.name': 'Anzuelo de titanio',

    // harpoon
    'harpoon.name': 'Arpón',

    // bait
    'bait.worm.name': 'Gusano',
    'bait.worm.desc': 'Pececillos de bajíos',
    'bait.worm.lakeDesc': 'Peces de superficie',
    'bait.shell.name': 'Mejillón',
    'bait.shell.desc': 'Peces de arrecife, cangrejos',
    'bait.shell.lakeDesc': 'Anguilas y carpas',
    'bait.squid.name': 'Calamar',
    'bait.squid.desc': 'Depredadores y peces medianos',
    'bait.glow.name': 'Cebo luminoso',
    'bait.glow.desc': 'Peces abisales',
    'bait.glow.lakeDesc': 'Peces del pozo',
    'bait.gold.name': 'Cebo dorado',
    'bait.gold.desc': 'Más probabilidad de leyendas',

    // building
    'building.chatrc.name': 'Cabaña',
    'building.chatrc.level.0': 'Cabaña en ruinas',
    'building.chatrc.level.1': 'Dormir: saltar a la mañana o a la noche',
    'building.chatrc.level.2': 'Almacén de peces más grande',
    'building.chatrc.level.3': 'Hogar acogedor (decoración)',
    'building.trhovisko.name': 'Mercado',
    'building.trhovisko.level.0': '—',
    'building.trhovisko.level.1': 'Venta de peces, precios y alta demanda',
    'building.trhovisko.level.2': 'Gráfico de precios de 3 días',
    'building.trhovisko.level.3': 'Pedidos de comerciantes con bonus',
    'building.dielna.name': 'Taller',
    'building.dielna.level.0': '—',
    'building.dielna.level.1': 'Sedales, cañas y anzuelos básicos',
    'building.dielna.level.2': 'Equipo avanzado y arpones',
    'building.dielna.level.3': 'Sedal de acero y legendario',
    'building.navnadaren.name': 'Tienda de cebos',
    'building.navnadaren.level.0': 'Caseta vacía',
    'building.navnadaren.level.1': 'Mejillón',
    'building.navnadaren.level.2': 'Calamar',
    'building.navnadaren.level.3': 'Cebo luminoso',
    'building.meteostanica.name': 'Estación meteo',
    'building.meteostanica.level.0': 'Nada, solo mirar al cielo',
    'building.meteostanica.level.1': 'Previsión a 6 horas',
    'building.meteostanica.level.2': 'Previsión a 24 horas',
    'building.meteostanica.level.3': 'Previsión a 3 días y fase lunar',
    'building.majak.name': 'Faro',
    'building.majak.level.0': 'Torre apagada',
    'building.majak.level.1': 'Mejor visibilidad de noche',
    'building.majak.level.2': 'Visibilidad en las Tinieblas',
    'building.majak.level.3': 'Abre el Abismo y la Profundidad infinita',
    'building.krcma.name': 'Taberna',
    'building.krcma.level.0': 'Ventanas tapiadas',
    'building.krcma.level.1': 'Los pescadores dan consejos',
    'building.krcma.level.2': 'Encargos de los pescadores',
    'building.krcma.level.3': 'Pistas de leyendas y cebo dorado',
    'building.akvarium.name': 'Acuario',
    'building.akvarium.level.0': 'En obras',
    'building.akvarium.level.1': 'Peces expuestos',
    'building.akvarium.level.2': 'Turistas: ingresos pasivos',
    'building.akvarium.level.3': 'Trofeos de leyendas',
    'building.lodenica.name': 'Astillero',
    'building.lodenica.level.0': 'Bote volcado',
    'building.lodenica.level.1': 'Bote blindado: lago y sala',
    'building.lodenica.level.2': 'Casco de plomo: Pozo del reactor',
    'building.lodenica.level.3': 'Jaula sumergible: hasta el núcleo',
    'building.laboratorium.name': 'Laboratorio',
    'building.laboratorium.level.0': 'Contenedor cerrado',
    'building.laboratorium.level.1': 'Sedales y cañas de plomo',
    'building.laboratorium.level.2': 'Sedales y cañas de grafito',
    'building.laboratorium.level.3': 'Sedales y cañas de circonio',

    // zone
    'zone.plytcina.name': 'Bajíos',
    'zone.plytcina.desc': 'Luz, peces baratos, medusas',
    'zone.utesy.name': 'Arrecifes',
    'zone.utesy.desc': 'Peces de colores, rocas',
    'zone.sumrak.name': 'Ocaso',
    'zone.sumrak.desc': 'Poca luz, depredadores',
    'zone.polnoc.name': 'Tinieblas',
    'zone.polnoc.desc': 'Sin luz, peces luminosos',
    'zone.priepast.name': 'Abismo',
    'zone.priepast.desc': 'Negrura total, leyendas',
    'zone.nekonecna.name': 'Profundidad infinita',
    'zone.nekonecna.desc': 'Nadie llegó aquí aún',
    // zonas del Lago nuclear; short = HUD de la inmersión (≤ 8 letras); desc va en el rótulo tras "0–80 m · " (170 px en pequeña)
    'zone.chladiace.name': 'Lago refrigerante',
    'zone.chladiace.desc': 'Agua tibia y verde, mutantes',
    'zone.chladiace.short': 'Lago',
    'zone.hala.name': 'Sala inundada',
    'zone.hala.desc': 'Turbinas, pasarelas, barriles',
    'zone.hala.short': 'Sala',
    'zone.sachta.name': 'Pozo del reactor',
    'zone.sachta.desc': 'Barras de control, brillo azul',
    'zone.sachta.short': 'Pozo',

    // location
    'location.more.name': 'Mar',
    'location.jadro.name': 'Lago nuclear',

    // period
    'period.morning.name': 'Mañana',
    'period.day.name': 'Día',
    'period.evening.name': 'Tarde',
    'period.night.name': 'Noche',

    // weather
    'weather.sun.name': 'Soleado',
    'weather.cloudy.name': 'Nublado',
    'weather.rain.name': 'Lluvia',
    'weather.fog.name': 'Niebla',
    'weather.storm.name': 'Tormenta',

    // moon
    'moon.0': 'Luna nueva',
    'moon.1': 'Luna creciente',
    'moon.2': 'Cuarto creciente',
    'moon.3': 'Gibosa creciente',
    'moon.4': 'Luna llena',
    'moon.5': 'Gibosa menguante',
    'moon.6': 'Cuarto menguante',
    'moon.7': 'Luna menguante',

    // event
    'event.spring.name': 'Migración primaveral',
    'event.spring.desc': 'Bancos de peces migratorios, precio doble para algunas especies',
    'event.summer.name': 'Festival de verano',
    'event.summer.desc': 'Concurso de pesca en el pueblo: el pez más pesado del día',
    'event.halloween.name': 'Halloween abisal',
    'event.halloween.desc': 'Peces de miedo, mar más oscuro, leyenda de temporada',
    'event.winter.name': 'Pesca invernal',
    'event.winter.desc': 'Ballena de hielo, superficie helada, pueblo navideño',

    // cond
    'cond.any': 'Siempre',
    'cond.morning': 'Mañana',
    'cond.day': 'Día',
    'cond.evening': 'Tarde',
    'cond.night': 'Noche',
    'cond.sun': 'Soleado',
    'cond.cloudy': 'Nublado',
    'cond.rain': 'Lluvia',
    'cond.fog': 'Niebla',
    'cond.storm': 'Tormenta',
    'cond.fullmoon': 'Luna llena',
    'cond.newmoon': 'Luna nueva',
    'cond.spring': 'Migración primaveral',
    'cond.summer': 'Festival de verano',
    'cond.halloween': 'Halloween',
    'cond.winter': 'Pesca invernal',
    'cond.guardian': 'Faro 3 y todas las leyendas',

    // hazard
    'hazard.jelly.name': 'Medusa',
    'hazard.rock.name': 'Roca afilada',
    'hazard.current.name': 'Corriente',

    // lakeHazard (Lago nuclear: el barril hace lo mismo que la roca)
    'lakeHazard.jelly.name': 'Medusa luminosa',
    'lakeHazard.rock.name': 'Barril oxidado',
    'lakeHazard.current.name': 'Corriente',

    // predator
    'predator.shark.name': 'Tiburón',
    'predator.octopus.name': 'Pulpo',
    'predator.shadowEel.name': 'Anguila sombría',

    // perk
    'perk.strength.name': '+20 % resistencia del sedal',
    'perk.grip.name': 'Clavada firme: +30 % avance por toque',
    'perk.jellyImmune.name': 'Las medusas te ignoran',
    'perk.harpoon.name': '+1 arpón',
    'perk.light.name': 'Cono de luz más grande',
    'perk.slowEscape.name': 'Los peces escapan un 40 % más lento',
    'perk.tolerance.name': '+60 ms de tolerancia al ritmo',
    'perk.sink.name': '+30 % velocidad de descenso',
    'perk.lure.name': '+30 % probabilidad de picada',
    'perk.sharkSlow.name': 'El tiburón ataca 4 s más tarde',
    'perk.rockProof.name': 'Las rocas no dañan el sedal',
    // lightDepth y knot más cortos: con 3 + 4 líneas el panel izquierdo de Profundidad infinita (89 px) no cabía y
    // se saltaba el nudo entero; ahora 2 + 3 líneas y caben las 13 mejoras
    'perk.lightDepth.name': 'La profundidad pesa un 15 % menos',
    'perk.knot.name': 'Nudo salvador: una rotura solo cuesta media captura',

    // tip
    'tip.0': 'Cuanto más hondo estés, más carga el pez sobre el sedal. A 500 metros pesa el triple.',
    'tip.1': 'Si bajas más con el sedal lleno, la tensión sube aunque no pique ningún pez nuevo.',
    'tip.2': 'Toca cuando el pez afloje. Tocar mientras tira solo da un tirón al sedal.',
    'tip.3': 'Mientras luchas, no puedes subir. Empezar una lucha es un compromiso.',
    'tip.4': 'No temas a los peces grandes. Lo malo es luchar con uno cuando ya tienes el sedal lleno.',
    'tip.5': 'Cada pez vendido baja su demanda. Prueba otra profundidad, otra hora, otro tiempo.',
    'tip.6': 'Con tormenta salen menos pescadores al mar. Los precios suben, pero el peligro también.',
    'tip.7': 'La medusa tensa el sedal un momento. La roca lo debilita hasta que subas.',
    'tip.8': 'El tiburón siempre elige el pez más valioso. Un arpón del Taller lo espanta.',
    'tip.9': 'Al pulpo te lo quitas de encima sacudiendo el anzuelo de lado a lado.',
    'tip.10': 'En el Abismo no te quedes quieto. La anguila sombría espera justo eso.',
    'tip.11': 'La lluvia atrae a los peces hacia la superficie.',
    'tip.12': 'Dicen que la niebla trae especies misteriosas.',
    'tip.13': 'Con luna llena y con luna nueva salen peces que no verás en otro momento.',
    'tip.14': 'Cada especie lucha a su manera. Si recuerdas su ritmo, el próximo será más fácil.',
    'tip.15': 'Con cebo luminoso pican los peces abisales. Con gusano, solo pececillos de los bajíos.',
    'tip.16': 'Detrás del pueblo se alza la vieja central. Dicen que en su lago nadan peces de dos cabezas.',
    'tip.17': 'En el lago nuclear no hay tiburones ni pulpos. Barriles oxidados, en cambio, sí.',

    // tutorial
    'tutorial.sink': 'Mantén S / el botón izquierdo / el dedo y el anzuelo baja.',
    'tutorial.move': 'A / D o el ratón: anzuelo a izquierda y derecha.',
    'tutorial.bite': '¡Ha picado! Toca (espacio / clic) cuando se ilumine el VERDE.',
    'tutorial.red': 'En ROJO no toques. El sedal se tensaría.',
    'tutorial.up': 'Pulsa W o SUBIR y la captura estará a salvo.',
    'tutorial.tension': 'El arco de arriba muestra la tensión. Si supera la resistencia, el sedal se rompe. ↓×2 = a esta profundidad cada pez pesa el doble.',
    // again: 3 líneas como sk (con 4 líneas + "Salida:" en 2 líneas, la tarjeta de la primera inmersión en PC ocultaba "NUEVO")
    'tutorial.again': 'Captura a salvo. Mantén S (o el ratón en el agua) para bajar otra vez, o vuelve al Puerto.',
    'tutorial.againSnap': 'El equipo sigue, el sedal está anudado. Mantén S (o el ratón en el agua) para bajar otra vez, o vuelve al Puerto.',
    'tutorial.againEmpty': 'Mantén S (o el ratón en el agua) para bajar otra vez, o vuelve al Puerto.',

    // tutorialTouch
    'tutorialTouch.sink': 'Deja el dedo quieto y el anzuelo baja.',
    'tutorialTouch.move': 'Arrastra el dedo a izquierda y derecha — al moverlo de lado el anzuelo no baja.',
    'tutorialTouch.bite': '¡Ha picado! Toca cuando se ilumine el VERDE.',
    'tutorialTouch.up': 'Toca SUBIR y la captura estará a salvo.',
    'tutorialTouch.again': 'Captura a salvo. Mantén el dedo en el agua para sumergirte otra vez, o vuelve al Puerto.',
    'tutorialTouch.againSnap': 'El equipo sigue, el sedal está anudado. Mantén el dedo en el agua para sumergirte otra vez, o vuelve al Puerto.',
    'tutorialTouch.againEmpty': 'Mantén el dedo en el agua para sumergirte otra vez, o vuelve al Puerto.',

    // unlock
    'unlock.dielna3': 'El Taller ya puede subir a nivel 3 — sedal de acero',
    'unlock.majak3': 'El Faro ya puede subir a nivel 3 — Abismo y Profundidad infinita',
    'unlock.legendLine': 'El Taller ofrece el Sedal legendario',
    'unlock.trophy': 'Trofeo en el Acuario',
    'unlock.ending': '¡El Guardián del abismo ha caído! ¡El pueblo lo celebra!',

    // rhythm
    'rhythm.fastRegular.name': 'Rápido regular',
    'rhythm.fastRegular.desc': 'Fases cortas e iguales.',
    'rhythm.regular.name': 'Regular',
    'rhythm.regular.desc': 'Alternancia tranquila y uniforme.',
    'rhythm.slowStrong.name': 'Lento y fuerte',
    'rhythm.slowStrong.desc': 'Tirones largos, pausas cortas.',
    'rhythm.chaotic.name': 'Caótico',
    'rhythm.chaotic.desc': 'Fases de duración aleatoria.',
    'rhythm.explosive.name': 'Explosivo',
    'rhythm.explosive.desc': 'Una larga pausa tranquila y luego un tirón corto y brusco.',
    'rhythm.fakePause.name': 'Pausas falsas',
    'rhythm.fakePause.desc': 'El verde parpadea un instante y enseguida pasa a rojo.',
    'rhythm.waves.name': 'Olas',
    'rhythm.waves.desc': 'El ritmo acelera y frena con suavidad.',
    'rhythm.playful.name': 'Juguetón',
    'rhythm.playful.desc': 'Alterna series rápidas y lentas.',
    'rhythm.extremeFast.name': 'Ultrarrápido',
    'rhythm.extremeFast.desc': 'Fases relámpago de menos de un cuarto de segundo.',
    'rhythm.fakeChaos.name': 'Caos con pausas falsas',
    'rhythm.fakeChaos.desc': 'Fases aleatorias y un verde que engaña.',
    'rhythm.slowHuge.name': 'Lento y enorme',
    'rhythm.slowHuge.desc': 'Lucha lenta, tirones muy largos con una fuerza enorme.',
    'rhythm.mixA.name': 'Mezcla: rápido y fuerte',
    'rhythm.mixA.desc': 'Alterna bloques de ritmo rápido regular y lento fuerte.',
    'rhythm.mixB.name': 'Mezcla: pausas falsas y caos',
    'rhythm.mixB.desc': 'Alterna pausas falsas y fases caóticas.',
    'rhythm.all.name': 'Todos los ritmos',
    'rhythm.all.desc': 'Cada pocos tirones cambia de ritmo, hasta pasar por todos.',

    // tier
    'tier.maly.name': 'pequeño',
    'tier.maly.tag': 'PEQUEÑO',
    'tier.bezny.name': 'común',
    'tier.bezny.tag': 'COMÚN',
    'tier.velky.name': 'grande',
    'tier.velky.tag': 'GRANDE',
    'tier.trofejny.name': 'de trofeo',
    'tier.trofejny.tag': '¡TROFEO!',
  });
})(globalThis.HL);
