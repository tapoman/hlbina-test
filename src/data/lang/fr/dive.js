// Français — scène PLONGÉE (ui/dive.js), carte en surface et panneaux latéraux compris. Clés ui.dive.*
// Glossaire en tête de src/data/lang/fr/data.js. (− est U+2212, – U+2013, — U+2014, … U+2026.)
// Largeur (px logiques ; police normale ≈ 5 px/car., petite ≈ 4 px) : bouton HAUT et commande de combat 64 px
// (HAUT avec icône), HARPON 66 px, bannière 168 px en taille double (plus long = réduit), ligne de la carte
// en surface 156 px (retour à la ligne), panneaux latéraux ~94 px, étiquette de tension sous l’arc 62 px.
(function (HL) {
  HL.i18n.add('fr', 'dive', {
    // --- barre du bas, barre du haut, commande de combat
    'ui.dive.up': 'HAUT',
    'ui.dive.catchLabel': 'Prise',
    'ui.dive.fishCount': { one: '{n} poisson', other: '{n} poissons' },
    'ui.dive.count': '×{count}',                        // nombre d’appâts / de harpons sur la barre
    'ui.dive.baitMixShort': 'Mix',                      // appât illimité sans nom (barre, 36 px)
    'ui.dive.mult': '×{v}',                             // multiplicateur de profondeur (↓×1,1)
    'ui.dive.loadKg': '{total} / {strength} kg',        // charge / résistance de la ligne
    'ui.dive.pad.tap': 'TAPE !',
    'ui.dive.pad.wait': 'ATTENDS',
    'ui.dive.harpoon': 'HARPON',
    // prime de grosse prise (sim/game.js haulBonus) : la barre l’affiche à la place de « Prise », ≤ 54 px en petit.
    // « prime » et non « bonus » : bonus = améliorations de la Profondeur infinie (glossaire, fr/data.js).
    'ui.dive.haulHint': 'Prime dès {next}',

    // --- bannières et textes près de l’hameçon
    'ui.dive.banner.caught': 'PRISE !',
    'ui.dive.banner.legendCaught': 'LÉGENDE !',
    'ui.dive.banner.legend': 'LÉGENDE',
    'ui.dive.banner.bossPhase': 'PHASE {phase}/3',
    'ui.dive.banner.bossPhaseSub': '{name} change de rythme',
    'ui.dive.banner.knot': 'NŒUD DE SECOURS',
    'ui.dive.banner.knotSub': 'La ligne a tenu, perdu : {fish}',
    'ui.dive.banner.haulLost': 'PRISE PERDUE',
    'ui.dive.banner.haulLostSub': 'Le poisson s’est échappé et a emporté {fish}',
    'ui.dive.banner.safe': 'À L’ABRI',
    'ui.dive.banner.up': 'EN SURFACE',
    'ui.dive.banner.safeSub': 'Prise {money} · {fish}',
    'ui.dive.banner.noCatch': 'Rien pris',
    'ui.dive.banner.zoneSub': '{from}–{to} · {desc}',  // plage de la zone (from sans unité) et description
    'ui.dive.banner.zoneSubOpen': 'dès {from} · {desc}', // zone sans fond (Profondeur infinie)
    'ui.dive.fx.fightsBack': 'Il résiste ! −{pct}',
    'ui.dive.fx.escaped': 'Décroché !',
    'ui.dive.fx.legendLeft': '{name} a filé',
    'ui.dive.fx.legendUnknown': 'Légende',
    'ui.dive.fx.jelly': 'Méduse !',
    'ui.dive.fx.rockBlocked': 'Rocher',
    'ui.dive.fx.rock': 'Rocher ! −{pct}',
    'ui.dive.fx.barrel': 'Fût ! −{pct}',             // lac nucléaire : l’obstacle est un fût rouillé
    'ui.dive.fx.barrelBlocked': 'Fût',
    'ui.dive.fx.sharkAte': 'Mangé par le requin : {name}',
    'ui.dive.fx.harpoonHit': 'Touché !',
    'ui.dive.fx.baitOut': 'Plus d’appât !',
    'ui.dive.fx.upBlocked': 'Pas de remontée en combat',
    'ui.dive.fx.lineEnd': 'Bout de la ligne : {depth}',
    'ui.dive.fx.weather': 'Météo : {weather}',

    // --- marques au-dessus du monde (requin, pieuvre, anguille)
    'ui.dive.shark': 'REQUIN',
    'ui.dive.octopus.title': 'PIEUVRE !',
    'ui.dive.octopus.warn': 'elle s’accroche dans {sec} s · HAUT = fuir',
    'ui.dive.octopus.shake': 'SECOUE DE CÔTÉ !',
    'ui.dive.eel.move': 'BOUGE !',

    // --- panneau de combat
    'ui.dive.fight.rhythm': 'Rythme : {name}',
    'ui.dive.fight.rhythmBoss': 'Rythme : {name} · Phase {phase}/{of}',
    'ui.dive.fight.rhythmUnknown': 'inconnu',
    'ui.dive.fight.pull': 'TIRE',
    'ui.dive.fight.slack': 'MOLLIT',
    'ui.dive.fight.hooked': 'Ferrage',
    'ui.dive.fight.risk': 'Au ferrage, jusqu’à {after} / {strength} kg',
    'ui.dive.fight.riskSnap': 'Au ferrage, jusqu’à {after} / {strength} kg — casse !',

    // --- casse, bonus (Profondeur infinie), pause
    'ui.dive.snap.title': 'CASSÉ !',
    'ui.dive.snap.eel': 'L’anguille d’ombre a coupé la ligne',
    'ui.dive.snap.tension': 'La ligne n’a pas tenu la tension',
    'ui.dive.snap.nothing': 'Il n’y avait rien sur la ligne',
    'ui.dive.lost': 'Perdu : {what}',
    'ui.dive.perk.title': 'BONUS',
    'ui.dive.perk.sub': 'Profondeur {depth} · choisis-en un (1, 2, 3)',
    'ui.dive.pause.title': 'PAUSE',
    'ui.dive.pause.resume': 'Reprendre',
    'ui.dive.pause.soundOn': 'Son : activé',
    'ui.dive.pause.soundOff': 'Son : coupé',
    'ui.dive.pause.surface': 'Remonter (HAUT)',
    'ui.dive.pause.hint': 'Esc ou P = reprendre',
    'ui.dive.pause.noSurface': 'Pas de remontée pendant un combat',

    // --- panneau latéral gauche (plongée et surface) : profondeur et commandes. Noms des touches dans le code.
    'ui.dive.side.depth': 'PROFONDEUR',
    'ui.dive.side.line': 'Ligne : {depth}',
    'ui.dive.side.lineEndless': 'Ligne : sans fin',
    'ui.dive.side.deepest': 'Au plus bas : {depth}',   // petite police, 96 px : « Au plus bas : 12 345 m » = 82 px
    'ui.dive.help.title': 'Commandes',
    'ui.dive.help.moveKeys': 'A/D, souris',
    'ui.dive.help.move': 'de côté',
    'ui.dive.help.sinkKeys': 'S, clic g.',
    'ui.dive.help.sink': 'descente',
    'ui.dive.help.tapKeys': 'Espace',
    'ui.dive.help.tap': 'combat',
    'ui.dive.help.up': 'HAUT',
    'ui.dive.help.harpoon': 'harpon',
    'ui.dive.help.pause': 'pause',
    'ui.dive.help.again': 'replonger',
    'ui.dive.help.dive': 'plonger',
    'ui.dive.help.bait': 'appât',
    'ui.dive.help.harbour': 'Port',
    'ui.dive.help.shore': 'Rive',

    // --- panneau latéral droit : prise, tension, prévisions, zone, appât
    'ui.dive.side.catch': 'PRISE',
    'ui.dive.side.lost': 'PERDU',
    'ui.dive.side.nothingYet': 'Rien pour l’instant',
    'ui.dive.side.more': '+ autres : {count}',
    'ui.dive.side.total': 'Total',
    'ui.dive.side.tension': 'TENSION',
    'ui.dive.side.depthMult': 'prof. {mult}',          // à droite de « 0,9 / 10 kg », sans limite : ≤ 38 px comme le sk
    'ui.dive.part.fish': 'poissons en ligne',
    'ui.dive.part.fight': 'traction',
    'ui.dive.part.spikes': 'mauvaises tapes',
    'ui.dive.part.jelly': 'méduse',
    'ui.dive.part.octopus': 'pieuvre',
    'ui.dive.part.hazard': 'orage',
    'ui.dive.forecast.title': 'Prévisions',
    'ui.dive.forecast.now': 'maintenant',
    'ui.dive.forecast.from': 'dès {time}',
    'ui.dive.zone.title': 'DANS LA ZONE',
    'ui.dive.zone.bait': 'appât',
    'ui.dive.zone.ideal': 'idéal',
    'ui.dive.zone.ok': 'mord',
    'ui.dive.zone.no': 'non',
    'ui.dive.zone.bites': 'Mordent à : {baits}',     // noms d’appâts en minuscules
    'ui.dive.zone.legend': 'Lég. : {name}',
    'ui.dive.zone.hazards': 'Dangers',
    'ui.dive.side.baitMix': 'Appâts variés',
    'ui.dive.side.baitLeft': 'reste {count}',
    'ui.dive.side.baitUnlimited': 'illimité',
    'ui.dive.side.harpoons': 'Harpons : {count}',
    'ui.dive.side.lineKg': 'Ligne : {kg}',
    'ui.dive.side.lineKgDamaged': 'Ligne : {kg}, abîmée',
    'ui.dive.side.shed': 'Cabane',

    // --- carte en surface (ligne 156 px, retour à la ligne ; un nombre ne se sépare pas de son unité)
    'ui.dive.card.again': 'REPLONGER',                 // bouton 112 px
    'ui.dive.card.harbour': 'PORT',                     // bouton 52 px
    'ui.dive.card.shore': 'RIVE',                      // lac nucléaire : retour à la Vieille centrale (52 px)
    // Mot retiré du nom d’appât sur la puce ; en français le nom vient devant (« Appât lumineux »), la puce
    // le retire du DÉBUT (« Appât : lumineux ×5 », ui/dive.js chipName) ; la phrase « Épuisé » garde le nom entier.
    'ui.dive.card.baitNoun': 'appât',
    'ui.dive.card.bait': 'Appât : {name}',
    'ui.dive.card.baitCount': 'Appât : {name} ×{count}',
    'ui.dive.card.noCatch': 'rien pris',
    'ui.dive.card.causeEel': 'L’anguille d’ombre a coupé la ligne.',
    'ui.dive.card.causeTension': 'La ligne n’a pas tenu la tension.',
    'ui.dive.card.baitLost': '{count}× {name}',         // appâts perdus (nom en minuscules)
    'ui.dive.card.nothing': 'Il n’y avait rien sur la ligne.',
    'ui.dive.card.stored': 'Dans la Cabane {count} / {cap}',
    'ui.dive.card.sold': { one: '{n} vendu pour {money}', other: '{n} vendus pour {money}' },
    'ui.dive.card.soldFull': { one: 'Cabane pleine · {n} vendu pour {money}', other: 'Cabane pleine · {n} vendus pour {money}' },
    'ui.dive.card.tryElse': 'Essaie une autre profondeur, heure ou appât.',
    // nombre devant : « Prime pour 12 poissons : … » dépassait la ligne dès +4 € (174 px)
    'ui.dive.card.haul': { one: '{n} poisson : prime +{pct} → +{money}', other: '{n} poissons : prime +{pct} → +{money}' },
    'ui.dive.card.baitRanOut': 'Épuisé : {from} → maintenant {to}.',
    'ui.dive.card.rewardGold': { one: '+{n} appât doré', other: '+{n} appâts dorés' },
    'ui.dive.card.moreBadges': '… et autres : {count}',
    // badges de la carte : étiquette (petite police sur couleur) + texte après
    'ui.dive.badge.quest': 'QUÊTE',
    'ui.dive.badge.legend': 'LÉGENDE',
    'ui.dive.badge.newSpecies': 'NOUVEAU',
    'ui.dive.badge.record': 'RECORD',
    'ui.dive.badge.contest': 'CONCOURS',
    'ui.dive.badge.contestWon': 'gagné ! {name} {kg} · +{money}',
    'ui.dive.badge.contestProgress': 'toi {best} / cible {target}',
    'ui.dive.badge.prize': 'PRIX',
    'ui.dive.badge.prizeText': 'du concours : +{money} encaissés',
    'ui.dive.badge.shark': 'REQUIN',
    'ui.dive.badge.sharkText': 'a mangé : {list}',
    'ui.dive.badge.knot': 'NŒUD',
    'ui.dive.badge.knotText': 'perdu : {list}',
    'ui.dive.badge.day': 'NOUVEAU JOUR',
    'ui.dive.badge.dayText': 'le marché a bougé',
    'ui.dive.badge.dayIncome': 'le marché a bougé · Aquarium +{money}',
    // panneau latéral en surface : sortie
    'ui.dive.trip.title': 'SORTIE',
    'ui.dive.trip.dives': 'Plongées',
    'ui.dive.trip.fish': 'Poissons pris',
    'ui.dive.trip.value': 'Valeur',
    'ui.dive.trip.snaps': 'Casses',
    'ui.dive.trip.timeStops': 'Tant que tu es en surface, le temps s’arrête.',
  });
})(globalThis.HL);
