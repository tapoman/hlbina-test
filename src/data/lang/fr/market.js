// Français — Marché (ui/market.js). Clés ui.market.* — glossaire en tête de src/data/lang/fr/data.js.
// Largeurs : onglets 48 / 44 / 76 px, phrases de la liste 168 px (retour à la ligne), bouton Vendre en petite
// police (largeur selon le plus long), étiquettes de ligne en petite police (~60 px), panneau latéral 94 px.
// {pct} = « 5 % », {money}/{price}/{last} = « 83 € », {bonus} = « 1,5 » ; {first} = entier sans devise.
(function (HL) {
  HL.i18n.add('fr', 'market', {
    'ui.market.title': 'Marché',
    'ui.market.level': 'Niveau {n}',
    'ui.market.levelStorm': 'Niveau {n} · orage +{pct}',
    // onglets
    'ui.market.tab.sell': 'Vente',
    'ui.market.tab.prices': 'Prix',
    'ui.market.tab.orders': 'Commandes',
    // amélioration du Marché (carte en haut)
    'ui.market.upgrade': 'Améliorer {money}',
    'ui.market.done': 'Terminé',
    'ui.market.upgraded': 'Marché niveau {level} : {desc}',
    'ui.market.cantNow': 'Impossible pour l’instant',
    'ui.market.maxLevel': 'Niveau maximum',
    // notes au-dessus de la liste ({event} = nom de l’événement, {fish} = noms d’espèces)
    'ui.market.stormNote': 'Orage : prix +{pct}',
    'ui.market.eventNote': '★ {event} : {fish}',
    // onglet Vente
    'ui.market.inStorage': 'Dans la Cabane {stored} / {cap}',
    'ui.market.rule': 'Chaque vente : demande −{pct}.',          // une ligne de 168 px (133 px avec « 5 % »)
    'ui.market.emptyTitle': 'La Cabane est vide.',
    'ui.market.emptyHint': 'Rapporte des poissons de la mer.',
    // ligne d’espèce : « 3× Sardine » ({n} = pièces, {fish} = nom de l’espèce)
    'ui.market.countFish': '{n}× {fish}',
    'ui.market.sell': 'Vendre {money}',
    'ui.market.perPiece': '{price} l’unité',
    'ui.market.perPieceRange': '{first} → {last} l’unité',
    'ui.market.orderTag': 'commande ×{bonus}',
    'ui.market.orderTagShort': 'cde ×{bonus}',
    'ui.market.hotMult': '★ ×{mult}',
    'ui.market.sold': 'Vendu',
    'ui.market.sellAll': 'Tout vendre · {money}',
    'ui.market.storageEmpty': 'La Cabane est vide',
    // onglet Prix et courbe (libellés de colonnes en petite police, ~40 px)
    'ui.market.graphLocked': 'Le Marché niveau 2 montre la courbe des prix sur 3 jours.',
    'ui.market.graphHint': 'Touche un poisson : prix sur 3 jours.',   // une ligne de 168 px (167 px ; « Touche une espèce — courbe… » = 229 px, coupé)
    'ui.market.noKnown': 'Tu ne connais encore aucune espèce. Tu verras les prix des poissons que tu attrapes.',
    'ui.market.demand': 'demande {pct}',
    'ui.market.yesterday': 'hier',
    'ui.market.daysAgo': 'il y a {n} j',
    'ui.market.today': 'auj.',
    'ui.market.historyPending': 'historique en cours',
    // onglet Commandes
    'ui.market.ordersUnlock': 'Le Marché niveau 3 débloque les commandes des marchands.',
    'ui.market.ordersLocked': 'Un marchand commande une espèce que tu connais déjà et paie plus cher chaque pièce.',
    'ui.market.ordersHead': 'Les marchands paient plus cher chaque pièce commandée. Vends dans l’onglet Vente — le bonus s’ajoute tout seul.',
    'ui.market.noOrders': 'Aucune commande aujourd’hui. Les marchands passent chaque matin et ne veulent que des espèces que tu connais.',
    'ui.market.bonus': 'bonus ×{bonus}',
    // {got} = livrées, {n} = pièces commandées
    'ui.market.orderProgress': { one: '{got} / {n}', other: '{got} / {n}' },
    'ui.market.orderDone': 'remplie',
    'ui.market.orderLastDay': 'dernier jour',
    'ui.market.orderTomorrow': 'jusqu’à demain',
    'ui.market.orderDaysLeft': { one: 'encore {n} jour', other: 'encore {n} jours' },
    // panneaux latéraux (PC)
    'ui.market.panel.hot': 'Demandé aujourd’hui',
    'ui.market.panel.hotNone': 'Rien de spécial aujourd’hui. La forte demande change chaque matin.',
    'ui.market.panel.storm': 'Peu de pêcheurs en mer : prix +{pct}.',
    'ui.market.panel.howTitle': 'Règles du marché',   // panneau 94 px (77 px)
    'ui.market.panel.how': 'Chaque pièce vendue fait baisser la demande de son espèce de {drop} (au plus bas {min}). Chaque jour, la demande remonte de {recover} vers le maximum. Pêcher toujours la même chose ne paie pas — change de profondeur, d’heure et de météo.',
    'ui.market.panel.keyTabs': '1 2 3  onglets',
    'ui.market.panel.keySellAll': 'P  tout vendre',
    'ui.market.panel.keyBack': 'Esc  retour',
  });
})(globalThis.HL);
