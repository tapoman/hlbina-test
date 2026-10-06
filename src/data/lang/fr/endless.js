// Français — Profondeur infinie, menu du mode (ui/endless.js). Clés ui.endless.* — glossaire en tête de fr/data.js.
// Largeurs : phrases 164 px (retour à la ligne), nom du matériel 60–71 px, en-tête du classement en petite
// police alignée à droite (Profondeur ~50 px, Prise ~55 px, Jour ~34 px seulement), texte du cadenas 106 px,
// bouton 168 px, panneau latéral 94 px. {every} = « 250 m » (HL.util.meters).
(function (HL) {
  HL.i18n.add('fr', 'endless', {
    'ui.endless.title': 'Profondeur infinie',
    'ui.endless.subUnlocked': 'Phare 3 · débloquée',
    'ui.endless.locked': 'Verrouillée',
    'ui.endless.dive': 'PLONGER',
    'ui.endless.descUnlocked': 'Une longue plongée sans village ni marché, au matériel fixe. 1 bonus sur 3 tous les {every}. But : au plus bas, avec la plus belle prise.',
    'ui.endless.descLocked': 'Une longue plongée sans village ni marché, au matériel fixe. 1 bonus sur 3 tous les {every}.',
    // matériel fixe (autres noms dans les données)
    'ui.endless.gear': 'Matériel fixe',
    'ui.endless.harpoons': 'Harpon ×{n}',
    'ui.endless.baitMix': 'Appâts variés',          // 65 px au plus (61 px)
    // classement
    'ui.endless.board': 'Classement · top 10',
    'ui.endless.boardEmpty': 'Encore vide. Ta première plongée s’inscrira ici — profondeur et valeur de la prise.',
    'ui.endless.col.depth': 'Prof.',
    'ui.endless.col.value': 'Prise',
    'ui.endless.col.day': 'Jour',
    'ui.endless.rank': '{n}.',
    'ui.endless.boardNote': 'Classement propre à cet appareil. Pas de classement mondial (Steam, Game Center) en version web.',
    'ui.endless.boardNoteCg': 'Le classement est enregistré avec ta progression.',
    'ui.endless.perksExample': 'Bonus, par exemple',
    // verrouillé
    'ui.endless.unlockBy': 'Le Phare niveau 3 la débloque.',
    'ui.endless.yourMajak': 'Ton Phare',
    'ui.endless.level': 'niveau {level} / 3',
    'ui.endless.majakAlso': 'Le Phare niveau 3 ouvre aussi l’Abîme dans ta partie. Il faut pour cela attraper la Dame des brumes.',
    // panneaux latéraux (PC)
    'ui.endless.panel.perks': 'Bonus',
    'ui.endless.panel.every': 'tous les {every}, 1 sur 3',
    'ui.endless.panel.records': 'Records',
    'ui.endless.panel.deepest': 'Au plus bas',
    'ui.endless.panel.richest': 'Prise la plus riche',
    'ui.endless.panel.entries': 'Entrées',
    'ui.endless.panel.keyDive': 'S / Enter : plonger',
    'ui.endless.panel.keyBack': 'Esc : retour',
  });
})(globalThis.HL);
