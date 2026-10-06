// Čeština — titulná obrazovka (ui/title.js). Kľúče = src/data/lang/sk/title.js; glosár v data.js.
// Tlačidlá menu 124 px (s ikonou ~110 px na text), podnadpis pod logom najviac 172 px.
(function (HL) {
  HL.i18n.add('cs', 'title', {
    'ui.title.tagline1': 'Každá ryba tě dělá bohatším.',
    'ui.title.tagline2': 'A blíž k přetržení.',
    'ui.title.continue': 'Pokračovat',
    'ui.title.newGame': 'Nová hra',
    'ui.title.newGameConfirm': 'Opravdu? Ztratíš postup',     // 118 px; „Postup se ztratí" mal 119 px
    'ui.title.endless': 'Nekonečná hlubina',
    'ui.title.endlessLocked': 'Odemkne Maják na úrovni 3',
    'ui.title.encyclopedia': 'Encyklopedie',
    'ui.title.settings': 'Nastavení',
    'ui.title.version': 'verze {v}',
    // chyba načtení uložené hry
    'ui.title.errTitle': 'Uloženou hru nelze načíst',
    'ui.title.errKept': 'Poškozený soubor zůstal odložený stranou — nic se nepřepsalo.',
    'ui.title.errBackup': 'Záloha: den {day}, ponory {dives}, {money}',
    'ui.title.errNoBackup': 'Čitelná záloha se nenašla.',
    'ui.title.restore': 'Obnovit zálohu',
    'ui.title.nothingToRestore': 'Není co obnovit',
    'ui.title.restart': 'Začít znovu',
    'ui.title.restartConfirm': 'Opravdu? Zálohu nepoužiješ',
    'ui.title.restored': 'Záloha obnovena',
    'ui.title.restoreFailed': 'Zálohu se nepodařilo obnovit',
  });
})(globalThis.HL);
