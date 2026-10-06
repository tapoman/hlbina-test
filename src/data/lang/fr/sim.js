// Français — textes de la simulation (sim/*.js). Règles : docs/I18N.md — {nom} = remplacement,
// { one, other } = formes du pluriel (français : 0 et 1 = one), {n} = nombre. Glossaire en tête de fr/data.js.
(function (HL) {
  HL.i18n.add('fr', 'sim', {
    // --- village : pourquoi quelque chose est impossible (Offer.reason, upgradeInfo.reason ; clé dans reasonKey)
    'sim.village.needBuilding': 'Il faut {building} niveau {level}',
    // {legend} = nom nu (« Dame des brumes ») : pas d’article possible, d’où la forme étiquette
    // (ligne de boutique 144 px en petit : « Légende requise : Dame des brumes » = 128 px)
    'sim.village.needLegend': 'Légende requise : {legend}',
    'sim.village.maxLevel': 'Niveau maximum',
    'sim.village.noMoney': 'Pas assez d’argent',
    'sim.village.notSold': 'Pas en vente',
    'sim.village.equipped': 'Équipé',
    'sim.village.owned': 'Déjà à toi',
    'sim.village.harpoonFull': 'Pas de place pour plus de harpons',
    'sim.village.goldSoldOut': 'Plus d’appât doré aujourd’hui. Reviens demain.',
    // lac nucléaire (docs/JAZERO.md) : sans matériel du Laboratoire, pas de sortie sur le lac
    'sim.village.needLakeLine': 'Il faut une ligne du Laboratoire pour le lac',
    'sim.village.needLakeRod': 'Il faut une canne du Laboratoire pour le lac',
    // bâtiment avec article, pour la phrase « Il faut {building} niveau {level} »
    'sim.village.acc.chatrc': 'la Cabane',
    'sim.village.acc.trhovisko': 'le Marché',
    'sim.village.acc.dielna': 'l’Atelier',
    'sim.village.acc.navnadaren': 'la Boutique d’appâts',
    'sim.village.acc.meteostanica': 'la Station météo',
    'sim.village.acc.majak': 'le Phare',
    'sim.village.acc.krcma': 'la Taverne',
    'sim.village.acc.akvarium': 'l’Aquarium',
    'sim.village.acc.lodenica': 'le Chantier naval',
    'sim.village.acc.laboratorium': 'le Laboratoire',

    // --- quêtes de la Taverne
    'sim.quest.catch': 'Attrape {what}',
    'sim.quest.catchCond': 'Attrape {what} {cond}',
    'sim.quest.depth': 'Plonge à {depth} et reviens',
    'sim.quest.value': 'Rapporte en une plongée une prise de {money}',
    'sim.quest.count': 'Rapporte au moins {fish} d’une plongée',
    'sim.quest.countFish': { one: '{n} poisson', other: '{n} poissons' },
    // espèce dans une quête : one = une pièce SANS nombre (« Attrape une anguille »), other avec le nombre
    'sim.quest.fish.sardinka': { one: 'une sardine', other: '{n} sardines' },
    'sim.quest.fish.okun': { one: 'un bar', other: '{n} bars' },
    'sim.quest.fish.krab': { one: 'un crabe', other: '{n} crabes' },
    'sim.quest.fish.platesa': { one: 'une plie', other: '{n} plies' },
    'sim.quest.fish.makrela': { one: 'un maquereau', other: '{n} maquereaux' },
    'sim.quest.fish.pyskac': { one: 'un labre', other: '{n} labres' },
    'sim.quest.fish.papagajovka': { one: 'un perroquet', other: '{n} perroquets' },
    'sim.quest.fish.zubatica': { one: 'un denté', other: '{n} dentés' },
    'sim.quest.fish.murena': { one: 'une murène', other: '{n} murènes' },
    'sim.quest.fish.barakuda': { one: 'un barracuda', other: '{n} barracudas' },
    'sim.quest.fish.svetlonoska': { one: 'un poisson-lanterne', other: '{n} poissons-lanternes' },
    'sim.quest.fish.treska': { one: 'une morue', other: '{n} morues' },
    'sim.quest.fish.uhor': { one: 'une anguille', other: '{n} anguilles' },
    'sim.quest.fish.tuniak': { one: 'un thon', other: '{n} thons' },
    'sim.quest.fish.mesacnica': { one: 'une lune d’argent', other: '{n} lunes d’argent' },
    'sim.quest.fish.lampasnik': { one: 'une baudroie abyssale', other: '{n} baudroies abyssales' },
    'sim.quest.fish.pazravy': { one: 'un grand-gosier', other: '{n} grands-gosiers' },
    'sim.quest.fish.raja': { one: 'une raie des brumes', other: '{n} raies des brumes' },
    'sim.quest.fish.sklenena': { one: 'un poisson de verre', other: '{n} poissons de verre' },
    'sim.quest.fish.velkoustka': { one: 'une grande-gueule', other: '{n} grandes-gueules' },
    'sim.quest.fish.latimeria': { one: 'un cœlacanthe', other: '{n} cœlacanthes' },
    'sim.quest.fish.sled': { one: 'un hareng migrateur', other: '{n} harengs migrateurs' },
    'sim.quest.fish.tekvicovka': { one: 'un poisson-citrouille', other: '{n} poissons-citrouilles' },
    'sim.quest.fish.prizrak': { one: 'un poisson fantôme', other: '{n} poissons fantômes' },
    // condition de quête (« Attrape 3 anguilles la nuit »)
    'sim.quest.cond.morning': 'le matin',
    'sim.quest.cond.day': 'en journée',
    'sim.quest.cond.evening': 'le soir',
    'sim.quest.cond.night': 'la nuit',
    'sim.quest.cond.sun': 'au soleil',
    'sim.quest.cond.cloudy': 'sous les nuages',
    'sim.quest.cond.rain': 'sous la pluie',
    'sim.quest.cond.fog': 'dans la brume',
    'sim.quest.cond.storm': 'pendant l’orage',
    'sim.quest.cond.fullmoon': 'à la pleine lune',
    'sim.quest.cond.newmoon': 'à la nouvelle lune',

    // --- indices sur les légendes (Taverne niv. 3)
    'sim.clue.caught': 'C’est fait. Le trophée a sa place à l’Aquarium.',
    'sim.clue.text': '{hint} Conditions : {conds}. Zone : {zone}.',

    // --- monde
    'sim.world.day': 'Jour {n}',
    'sim.world.clear': 'Dégagé',

    // --- partie et sauvegarde ({detail} = cause technique, non traduite)
    'sim.game.noStorage': 'Le jeu ne sauvegarde pas — rien à restaurer.',
    'sim.game.noBackup': 'Aucune copie de secours lisible.',
    'sim.game.stale': 'Jeu ouvert dans un autre onglet — celui-ci ne sauvegarde plus. Recharge la page.',
    'sim.save.corrupt': 'Non sauvegardé, l’état du jeu est abîmé : {detail}',
    'sim.save.writeFailed': 'Échec de la sauvegarde : {detail}',
    'sim.save.unavailable': 'Stockage indisponible : {detail}',
    'sim.save.loadFailed': 'Impossible de charger la sauvegarde : {detail}',
    'sim.save.settingsLoad': 'Impossible de charger les réglages : {detail}',
    'sim.save.settingsStore': 'Impossible d’enregistrer les réglages : {detail}',
  });
})(globalThis.HL);
