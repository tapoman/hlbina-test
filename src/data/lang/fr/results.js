// Français — bilan de plongée et fin du jeu (ui/results.js). Clés ui.results.* — glossaire en tête de fr/data.js.
// Largeurs : phrases de la liste 168 px (retour à la ligne), sous-titre 168 px en petite police, étiquettes de
// poissons en petite police (~40 px), boutons 86 / 78 / 168 px, panneau latéral 94 px. {n} = nombre.
(function (HL) {
  HL.i18n.add('fr', 'results', {
    'ui.results.title': 'Bilan de plongée',
    'ui.results.titleEndless': 'Profondeur infinie',
    // titre (police ×2, contour) et ligne dessous ({depth} = « 40 m », {min} = minutes)
    'ui.results.safe': 'À L’ABRI',
    'ui.results.snapped': 'CASSÉ !',
    'ui.results.headline': 'Au plus bas {depth} · {min} min sous l’eau',
    'ui.results.endlessSafe': 'À L’ABRI · point le plus bas · {min} min',
    'ui.results.endlessSnapped': 'CASSÉ · point le plus bas · {min} min',
    // étiquettes dans la ligne d’un poisson (petites capitales sur bande colorée)
    'ui.results.tag.new': 'NOUVEAU',
    'ui.results.tag.record': 'RECORD',
    'ui.results.tag.legend': 'LÉGENDE',
    'ui.results.tag.sold': 'VENDU',
    'ui.results.tag.shark': 'MANGÉ PAR REQUIN',
    'ui.results.tag.knot': 'NŒUD',
    // casse : ce qui a été perdu (ver = appât de base, sinon « appât »)
    'ui.results.lostWorm': 'Tu as perdu ton ver.',
    'ui.results.lostBait': 'Tu as perdu ton appât.',
    'ui.results.lostFishWorm': { one: 'Tu as perdu {n} poisson et ton ver.', other: 'Tu as perdu {n} poissons et ton ver.' },
    'ui.results.lostFishBait': { one: 'Tu as perdu {n} poisson et ton appât.', other: 'Tu as perdu {n} poissons et ton appât.' },
    // conseil après une casse selon la cause (panneau 168 px, retour à la ligne)
    'ui.results.tipTitle': 'Conseil des pêcheurs',
    'ui.results.tip.jelly': 'Une méduse tend la ligne pendant trois secondes. Avec une ligne pleine, évite-la ou remonte.',
    'ui.results.tip.spikes': 'Ne tape pas pendant le ROUGE — chaque tape secoue la ligne et la tension bondit.',
    'ui.results.tip.fight': 'N’aie pas peur d’un gros poisson. Le pire, c’est de le combattre avec une ligne déjà pleine.',
    'ui.results.tip.octopus': 'Pour te débarrasser d’une pieuvre, secoue l’hameçon d’un côté à l’autre.',
    'ui.results.tip.hazard': 'Une légende tire aussi avec le courant et les éclairs. Garde beaucoup de marge sur ta ligne.',
    'ui.results.tip.eel': 'Ne reste pas immobile dans l’Abîme. C’est justement ce qu’attend l’anguille d’ombre.',
    'ui.results.tip.rock': 'Un rocher affaiblit la ligne jusqu’à ce que tu remontes. Après un choc, sois plus prudent.',
    'ui.results.tip.barrel': 'Un fût rouillé affaiblit la ligne jusqu’à ce que tu remontes. Après un choc, sois plus prudent.',
    'ui.results.tip.depth': 'Si tu descends avec une ligne pleine, la tension monte même sans nouveau poisson. Remonte plus tôt.',
    // Fête de l’été : concours du jour ({fish} = nom du poisson, {kg}/{target}/{best} = « 1,4 kg », {money} = « 150 € »)
    'ui.results.contest': 'Concours du jour',
    'ui.results.contestWon': 'Gagné ! {fish} {kg} pèse plus que l’objectif {target}.',
    'ui.results.contestPrizePaid': 'Le prix de +{money} est sur ton compte.',
    'ui.results.contestPrizeLater': 'Le prix de +{money} arrive au changement de jour.',
    'ui.results.contestBest': 'Ton plus lourd {best} / objectif {target}',
    'ui.results.contestWonToday': 'Déjà gagné aujourd’hui — le prix de {money} arrive au changement de jour.',
    'ui.results.contestHint': 'Un poisson plus lourd gagne {money}.',
    'ui.results.contestPrize': 'Prix du concours : +{money} sur ton compte.',
    // déroulé de la plongée (chiffres), dangers joints par « · »
    'ui.results.stats': 'Statistiques',                // panneau 94 px
    'ui.results.statsFights': 'Combats {fights} · pris {landed} · échappés {escaped}',
    'ui.results.statsTaps': 'Tapes bonnes {good} · mauvaises {bad}',
    'ui.results.hazards': 'Dangers : {list}',
    'ui.results.hazJelly': 'méduses {n}',
    'ui.results.hazRock': 'rochers {n}',
    'ui.results.hazBarrel': 'fûts {n}',                 // lac nucléaire
    'ui.results.hazShark': 'mangés par requin {n}',
    // Profondeur infinie
    'ui.results.rank': 'Place {rank} au classement',
    'ui.results.noRank': 'Hors classement (top 10)',
    'ui.results.catchValue': 'Valeur de la prise',
    'ui.results.perks': 'Bonus',
    'ui.results.perkStack': '{perk} ×{n}',
    'ui.results.noPerks': 'Aucun — tu n’as pas atteint 250 m.',
    'ui.results.catchCount': 'Prise ({n})',
    'ui.results.allLost': 'La mer a tout repris.',
    'ui.results.noCatch': 'Rien pris.',
    'ui.results.lost': 'Perdu',
    // À L’ABRI (partie) ; {stored}/{cap} = remplissage de la Cabane
    'ui.results.empty': 'Rien cette fois. Essaie une autre profondeur, une autre heure ou un autre appât.',
    'ui.results.toStorage': {
      one: 'Dans la Cabane : {n} poisson ({stored} / {cap}). Vends-le au marché.',
      other: 'Dans la Cabane : {n} poissons ({stored} / {cap}). Vends-les au marché.',
    },
    'ui.results.soldOverflow': {
      one: '{n} poisson ne tenait pas dans la Cabane — vendu pour {money}.',
      other: '{n} poissons ne tenaient pas dans la Cabane — vendus pour {money}.',
    },
    // prime de grosse prise (« prime » : bonus = améliorations de la Profondeur infinie), déjà versée en surface
    'ui.results.haul': {
      one: 'Prime pour {n} poisson (+{pct}) : +{money} sur ton compte.',
      other: 'Prime pour {n} poissons (+{pct}) : +{money} sur ton compte.',
    },
    'ui.results.lostOnWay': 'Perdu en route',
    'ui.results.questsDone': { one: 'Quête réussie', other: 'Quêtes réussies' },
    'ui.results.rewardGold': { one: '+{n} appât doré', other: '+{n} appâts dorés' },
    'ui.results.legend': 'Légende : {name}',
    'ui.results.daysPassed': {
      one: 'Pendant que tu étais en mer, un nouveau jour a commencé. Le marché a bougé.',
      other: 'Pendant que tu étais en mer, {n} jours ont passé. Le marché a bougé.',
    },
    'ui.results.aquarium': 'L’Aquarium a rapporté {money}.',
    'ui.results.storageFull': 'Cabane pleine : ce qui n’y tient pas est vendu dès le retour.',
    // boutons de la barre du bas
    'ui.results.toMarket': 'Au marché',
    'ui.results.toVillage': 'Au village',
    'ui.results.toPlant': 'Vers la rive',
    'ui.results.continue': 'Continuer',
    // fin du jeu (Gardien de l’Abîme pris) ; titre en police ×2 sur deux lignes de ~14 caractères
    'ui.results.ending.title1': 'LE GARDIEN',
    'ui.results.ending.title2': 'DE L’ABÎME',
    'ui.results.ending.caught': 'est pris',
    'ui.results.ending.text': 'Le village fait la fête. Les lampions brillent jusqu’au matin et les pêcheurs trinquent à ta santé. La mer est de nouveau calme.',
    'ui.results.ending.thanks': 'Merci d’avoir joué !',
    'ui.results.ending.palette': 'Palette ENDESGA 32',
    'ui.results.ending.audio': 'Musique et sons synthétisés dans le jeu',
    'ui.results.ending.more': 'Tu peux continuer à pêcher : records, encyclopédie, Profondeur infinie.',
    // panneaux latéraux (PC) : libellés en petite police, valeur à droite
    'ui.results.panel.fights': 'Combats',
    'ui.results.panel.landed': 'Pris',
    'ui.results.panel.escaped': 'Échappés',
    'ui.results.panel.goodTaps': 'Bonnes tapes',
    'ui.results.panel.badTaps': 'Mauvaises tapes',
    'ui.results.panel.jelly': 'Méduses',
    'ui.results.panel.rock': 'Rochers',
    'ui.results.panel.barrel': 'Fûts',
    'ui.results.panel.shark': 'Mangés (requin)',
    'ui.results.panel.career': 'Carrière',
    'ui.results.panel.dives': 'Plongées',
    'ui.results.panel.caught': 'Pris',
    'ui.results.panel.snaps': 'Casses',
    'ui.results.panel.earned': 'Gagné',
    'ui.results.panel.deepest': 'Au plus bas',
    'ui.results.panel.biggest': 'Plus gros',
  });
})(globalThis.HL);
