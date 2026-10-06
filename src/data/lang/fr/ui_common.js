// Français — textes communs des écrans (ui/common.js, core/main.js, choix de langue, ligne de sortie).
// Clés ui.common.* — glossaire en tête de src/data/lang/fr/data.js.
(function (HL) {
  HL.i18n.add('fr', 'ui_common', {
    // badge de sauvegarde ( ' — ' = endroit où un long texte peut se couper en deux moitiés alternées)
    'ui.common.save.nosave': 'Le jeu ne sauvegarde pas',
    'ui.common.save.stale': 'Jeu ouvert dans un autre onglet — rien n’est sauvegardé',
    'ui.common.moreBelow': '↓ suite',
    // étiquette de taille (HL.ui.tierTag) — courte, onglet au-dessus du panneau de combat
    'ui.common.tier.velky': 'BELLE PRISE',
    'ui.common.tier.trofejny': 'TROPHÉE',
    // choix de langue (titre, Réglages)
    'ui.common.lang.title': 'Langue',
    'ui.common.lang.soon': 'bientôt',
    'ui.common.close': 'Fermer',
    // sortie (HL.data.tripLine) : « Sortie : 3 plongées · 5 poissons · 120 € »
    'ui.common.tripLine': 'Sortie : {dives} · {fish} · {value}',
    'ui.common.tripDives': { one: '{n} plongée', other: '{n} plongées' },
    'ui.common.tripFish': { one: '{n} poisson', other: '{n} poissons' },
    // conseil pour téléphone à l’horizontale (dans la marge, deux lignes)
    'ui.common.rotate1': 'Passe en mode',
    'ui.common.rotate2': 'portrait',
    // panneaux latéraux par défaut (PC) ; lignes de commandes : touches / description en retrait
    'ui.common.panel.controls': 'Commandes',
    'ui.common.panel.keysMove': 'A / D, souris',
    'ui.common.panel.move': 'hameçon de côté',
    'ui.common.panel.keysSink': 'S, clic gauche',
    'ui.common.panel.sink': 'descente',
    'ui.common.panel.keysTap': 'Espace, clic',
    'ui.common.panel.fight': 'combat',
    'ui.common.panel.up': 'HAUT',
    'ui.common.panel.harpoon': 'harpon',
    'ui.common.panel.pause': 'pause / retour',
    'ui.common.panel.f2': 'F2 réglage fin',
    'ui.common.panel.f3': 'F3 infos de débogage',
    'ui.common.panel.money': 'Argent',
    'ui.common.panel.day': 'Jour',
    'ui.common.panel.time': 'Heure',
    'ui.common.panel.weather': 'Météo',
    'ui.common.panel.moon': 'Lune',
    // bandeau rouge en bas en cas d’erreur de script ({msg} = message technique, non traduit)
    'ui.common.errorBar': 'ERREUR : {msg}',
  });
})(globalThis.HL);
