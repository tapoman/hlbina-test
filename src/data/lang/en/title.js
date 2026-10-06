// English — title screen (ui/title.js). Keys ui.title.*  Menu buttons 124 px (~110 px for text next to an icon),
// tagline under the logo at most 172 px.
(function (HL) {
  HL.i18n.add('en', 'title', {
    'ui.title.tagline1': 'Every fish makes you richer.',
    'ui.title.tagline2': 'And closer to snapping.',
    'ui.title.continue': 'Continue',
    'ui.title.newGame': 'New Game',
    'ui.title.newGameConfirm': 'Sure? Progress is lost',
    'ui.title.endless': 'Endless Deep',
    'ui.title.endlessLocked': 'Needs Lighthouse level 3',
    'ui.title.encyclopedia': 'Encyclopedia',
    'ui.title.settings': 'Settings',
    'ui.title.version': 'version {v}',
    // saved game failed to load
    'ui.title.errTitle': "Can't load your saved game",
    'ui.title.errKept': 'The damaged file was set aside — nothing was overwritten.',
    'ui.title.errBackup': 'Backup: day {day}, dives {dives}, {money}',
    'ui.title.errNoBackup': 'No readable backup was found.',
    'ui.title.restore': 'Restore backup',
    'ui.title.nothingToRestore': 'Nothing to restore',
    'ui.title.restart': 'Start over',
    'ui.title.restartConfirm': "Sure? Backup won't be used",
    'ui.title.restored': 'Backup restored',
    'ui.title.restoreFailed': "Couldn't restore the backup",
  });
})(globalThis.HL);
