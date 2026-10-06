// Français — écran titre (ui/title.js). Clés ui.title.* — glossaire en tête de src/data/lang/fr/data.js.
// Boutons du menu 124 px (avec icône ~110 px de texte), sous-titre sous le logo 172 px au plus.
(function (HL) {
  HL.i18n.add('fr', 'title', {
    'ui.title.tagline1': 'Chaque poisson t’enrichit.',
    'ui.title.tagline2': 'Et te rapproche de la casse.',
    'ui.title.continue': 'Continuer',
    'ui.title.newGame': 'Nouvelle partie',
    'ui.title.newGameConfirm': 'Sûr ? Tout sera perdu',
    'ui.title.endless': 'Profondeur infinie',
    'ui.title.endlessLocked': 'Phare niveau 3 requis',
    'ui.title.encyclopedia': 'Encyclopédie',
    'ui.title.settings': 'Réglages',
    'ui.title.version': 'version {v}',
    // erreur de chargement de la sauvegarde
    'ui.title.errTitle': 'Impossible de charger la partie',
    'ui.title.errKept': 'Le fichier abîmé a été mis de côté — rien n’a été écrasé.',
    'ui.title.errBackup': 'Copie : jour {day}, plongées {dives}, {money}',
    'ui.title.errNoBackup': 'Aucune copie de secours lisible.',
    'ui.title.restore': 'Restaurer la copie',
    'ui.title.nothingToRestore': 'Rien à restaurer',
    'ui.title.restart': 'Recommencer',
    'ui.title.restartConfirm': 'Sûr ? La copie sera jetée',
    'ui.title.restored': 'Sauvegarde restaurée',
    'ui.title.restoreFailed': 'Échec de la restauration',
  });
})(globalThis.HL);
