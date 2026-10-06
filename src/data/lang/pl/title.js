// Polski — ekran tytułowy (ui/title.js). Źródło: src/data/lang/sk/title.js. Słowniczek: src/data/lang/pl/data.js.
// Przyciski menu 124 px (z ikoną ~110 px na tekst), podtytuł pod logo najwyżej 172 px.
(function (HL) {
  HL.i18n.add('pl', 'title', {
    'ui.title.tagline1': 'Każda ryba to zysk.',
    'ui.title.tagline2': 'I krok bliżej do zerwania.',
    'ui.title.continue': 'Kontynuuj',
    'ui.title.newGame': 'Nowa gra',
    'ui.title.newGameConfirm': 'Na pewno? Postęp przepadnie',
    'ui.title.endless': 'Nieskończona głębia',
    'ui.title.endlessLocked': 'Otworzy ją Latarnia 3',
    'ui.title.encyclopedia': 'Encyklopedia',
    'ui.title.settings': 'Ustawienia',
    'ui.title.version': 'wersja {v}',
    // błąd wczytywania zapisanej gry
    'ui.title.errTitle': 'Nie można wczytać zapisanej gry',
    'ui.title.errKept': 'Uszkodzony plik odłożono na bok — nic nie nadpisano.',
    'ui.title.errBackup': 'Kopia: dzień {day}, zanurzenia {dives}, {money}',
    'ui.title.errNoBackup': 'Nie znaleziono czytelnej kopii.',
    'ui.title.restore': 'Przywróć kopię',
    'ui.title.nothingToRestore': 'Nie ma czego przywrócić',
    'ui.title.restart': 'Zacznij od nowa',
    // kopia NIE przepada (zostaje w .bad/.bak) — gra tylko zaczyna bez niej (sk: „Záloha sa nepoužije”)
    'ui.title.restartConfirm': 'Na pewno? Bez użycia kopii',
    'ui.title.restored': 'Kopia przywrócona',
    'ui.title.restoreFailed': 'Nie udało się przywrócić kopii',
  });
})(globalThis.HL);
