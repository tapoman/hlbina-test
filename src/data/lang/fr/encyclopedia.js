// Français — Encyclopédie (ui/encyclopedia.js). Clés ui.encyclopedia.* — glossaire en tête de fr/data.js.
// Largeurs : libellé de ligne du détail 50 px (Quand, Appât…), valeur 112 px (retour à la ligne), nom dans le
// détail 118 px, ligne sous la grille 168 px, zone · profondeur 110 px en petite police, onglets 54 / 54 / 56 px
// (trois depuis le lac ; le libellé n’est pas coupé, il déborde — lang_check ne le voit pas),
// panneau latéral 94 px (groupe 64 px). Familles à id : month.0–11 (0 = janvier), hazard.<id> (pluriel).
(function (HL) {
  HL.i18n.add('fr', 'encyclopedia', {
    'ui.encyclopedia.title': 'Encyclopédie',
    'ui.encyclopedia.subCaught': 'Pris {caught} / {total}',
    'ui.encyclopedia.subFish': 'Espèce {i} / {total}',
    'ui.encyclopedia.subLegend': 'Légende {i} / {total}',
    // 3 onglets de 54 px depuis le lac : « Poissons 21/24 » (69 px) et « Légendes 2/6 » (59 px) étaient rognés
    'ui.encyclopedia.tabFish': 'Mer {caught}/{total}',
    'ui.encyclopedia.tabLegends': 'Lég. {caught}/{total}',          // abréviation déjà en jeu : ui.dive.zone.legend
    'ui.encyclopedia.tabLake': 'Lac {caught}/{total}',
    'ui.encyclopedia.list': 'Liste',
    'ui.encyclopedia.back': 'Retour',
    'ui.encyclopedia.backVillage': 'Retour au village',
    'ui.encyclopedia.backPlant': 'Retour à la centrale',
    // case de la grille : espèce de saison hors événement (petite police, 38 px), nombre de prises
    'ui.encyclopedia.cellSeasonal': 'saison',
    'ui.encyclopedia.cellCount': '×{n}',
    // ligne sous la grille (curseur/doigt/focus)
    'ui.encyclopedia.tapFish': 'Touche un poisson pour les détails.',
    'ui.encyclopedia.tapLegend': 'Touche une légende pour les détails.',
    'ui.encyclopedia.seasonalHint': 'De saison : pendant un événement.',   // 168 px (151 px)
    'ui.encyclopedia.seasonalFish': 'Espèce de saison',
    'ui.encyclopedia.seasonalLegend': 'Légende de saison',
    'ui.encyclopedia.eventMonths': '{event} · {months}',
    'ui.encyclopedia.monthRange': '{from} – {to}',
    'ui.encyclopedia.depthRange': '{from}–{to}',
    'ui.encyclopedia.zoneDepth': '{zone} · {depth}',
    // état sans accord (noms masculins et féminins) : statut au masculin, comme un libellé de collection
    'ui.encyclopedia.caught': 'pris',
    'ui.encyclopedia.caughtTimes': 'pris {n}×',
    'ui.encyclopedia.caughtLegend': 'trophée ★',
    'ui.encyclopedia.notCaught': 'pas encore pris',
    // détail d’une espèce de saison ({desc} = description de l’événement, sans point)
    'ui.encyclopedia.onlyDuring': 'N’apparaît que pendant l’événement {event} ({months}).',
    'ui.encyclopedia.onlyDuringUnknown': 'N’apparaît que pendant un événement.',
    'ui.encyclopedia.eventDesc': '{desc}.',
    // détail : libellés de ligne (50 px au plus)
    'ui.encyclopedia.row.cond': 'Quand',
    'ui.encyclopedia.row.bait': 'Appât',
    'ui.encyclopedia.row.baitOk': 'Accepte',
    'ui.encyclopedia.row.rhythm': 'Rythme',
    'ui.encyclopedia.row.fight': 'Combat',
    'ui.encyclopedia.row.hazards': 'Dangers',
    'ui.encyclopedia.row.reward': 'Prime',
    'ui.encyclopedia.row.price': 'Prix',
    'ui.encyclopedia.row.caught': 'Pris',
    'ui.encyclopedia.row.biggest': 'Record',
    'ui.encyclopedia.row.biggestLegend': 'Record',
    'ui.encyclopedia.row.first': '1re prise',
    // détail : valeurs ({list} = rythmes des phases joints par une flèche →)
    'ui.encyclopedia.phases': { one: '{n} phase', other: '{n} phases' },
    'ui.encyclopedia.phasesList': { one: '{n} phase : {list}', other: '{n} phases : {list}' },
    'ui.encyclopedia.rewardTrophy': '{reward} + trophée',   // {reward} peut être une phrase entière (« … Le village fait la fête ! »)
    'ui.encyclopedia.pricePer': '{money} pour {kg}',
    'ui.encyclopedia.pieces': { one: '{n} pièce', other: '{n} pièces' },
    'ui.encyclopedia.biggestTimes': '{kg} ({n}×)',
    'ui.encyclopedia.firstDay': 'jour {day}',
    'ui.encyclopedia.clue': 'Conditions révélées à la Taverne.',
    'ui.encyclopedia.hint': '« {hint} »',
    // dangers d’une légende (pluriel — un phénomène, pas une pièce ; ≠ hazard.<id>.name dans data.js)
    'ui.encyclopedia.hazard.jelly': 'Méduses',
    'ui.encyclopedia.hazard.current': 'Courants',
    'ui.encyclopedia.hazard.lightning': 'Éclairs',
    'ui.encyclopedia.hazard.rock': 'Rochers',
    // mois des événements saisonniers, 0 = janvier
    'ui.encyclopedia.month.0': 'janvier',
    'ui.encyclopedia.month.1': 'février',
    'ui.encyclopedia.month.2': 'mars',
    'ui.encyclopedia.month.3': 'avril',
    'ui.encyclopedia.month.4': 'mai',
    'ui.encyclopedia.month.5': 'juin',
    'ui.encyclopedia.month.6': 'juillet',
    'ui.encyclopedia.month.7': 'août',
    'ui.encyclopedia.month.8': 'septembre',
    'ui.encyclopedia.month.9': 'octobre',
    'ui.encyclopedia.month.10': 'novembre',
    'ui.encyclopedia.month.11': 'décembre',
    // panneaux latéraux (PC) : à gauche progrès par zone + touches (libellé 46 px en petite police), à droite records
    'ui.encyclopedia.panel.zones': 'Zones',
    'ui.encyclopedia.panel.seasonal': 'De saison',
    'ui.encyclopedia.panel.legends': 'Légendes',
    'ui.encyclopedia.panel.arrows': 'Flèches',
    'ui.encyclopedia.panel.select': 'choix',
    'ui.encyclopedia.panel.detail': 'détail',
    'ui.encyclopedia.panel.tabs': 'onglets',        // touches R / L ; 62 px en petite police
    'ui.encyclopedia.panel.lakeKey': 'lac',                  // touche J
    'ui.encyclopedia.panel.lake': 'Lac',
    'ui.encyclopedia.panel.back': 'retour',
    'ui.encyclopedia.panel.records': 'Records',
    'ui.encyclopedia.panel.dives': 'Plongées',
    'ui.encyclopedia.panel.caught': 'Poissons pris',
    'ui.encyclopedia.panel.deepest': 'Au plus bas',
    'ui.encyclopedia.panel.biggest': 'Plus grosse prise',
  });
})(globalThis.HL);
