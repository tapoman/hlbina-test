// Polski — teksty symulacji (sim/*.js). Źródło: src/data/lang/sk/sim.js. Zasady: docs/I18N.md,
// słowniczek: src/data/lang/pl/data.js. Liczba mnoga pl: one (1) / few (2–4, 22–24…, nie 12–14) / many (0, 5–21…).
(function (HL) {
  HL.i18n.add('pl', 'sim', {
    // --- wioska: dlaczego się nie da (Offer.reason, upgradeInfo.reason; klucz w reasonKey)
    'sim.village.needBuilding': 'Wymaga {building} na poziomie {level}',
    // wiersz sklepu 144 px drobnym pismem: „Najpierw złów legendę: Błędny ognik głębin” miało 157 px
    'sim.village.needLegend': 'Wymaga legendy: {legend}',
    'sim.village.maxLevel': 'Najwyższy poziom',
    'sim.village.noMoney': 'Za mało pieniędzy',
    'sim.village.notSold': 'Nie na sprzedaż',
    'sim.village.equipped': 'W użyciu',
    'sim.village.owned': 'Masz już',
    'sim.village.harpoonFull': 'Więcej harpunów nie uniesiesz',
    'sim.village.goldSoldOut': 'Dziś złotej przynęty już nie ma. Przyjdź jutro.',
    // jądrowe jezioro (docs/JAZERO.md): bez sprzętu z Laboratorium na jezioro się nie da
    'sim.village.needLakeLine': 'Wymaga żyłki na jezioro z Laboratorium',
    'sim.village.needLakeRod': 'Wymaga wędki na jezioro z Laboratorium',
    // dopełniacz budynku do zdania „Wymaga {building} na poziomie {level}”
    'sim.village.acc.chatrc': 'Chatki',
    'sim.village.acc.trhovisko': 'Targu',
    'sim.village.acc.dielna': 'Warsztatu',
    'sim.village.acc.navnadaren': 'Przynęciarni',
    'sim.village.acc.meteostanica': 'Stacji meteo',
    'sim.village.acc.majak': 'Latarni',
    'sim.village.acc.krcma': 'Karczmy',
    'sim.village.acc.akvarium': 'Akwarium',
    'sim.village.acc.lodenica': 'Stoczni',
    'sim.village.acc.laboratorium': 'Laboratorium',

    // --- zadania w Karczmie
    'sim.quest.catch': 'Złów {what}',
    'sim.quest.catchCond': 'Złów {what} {cond}',
    'sim.quest.depth': 'Zanurz się na głębokość {depth} i wróć',
    // „naraz” = z jednego zanurzenia; krótko, bo zadanie stoi też w JEDNYM wierszu plakietki na karcie powierzchni
    'sim.quest.value': 'Przywieź naraz połów wart {money}',
    'sim.quest.count': 'Przywieź naraz co najmniej {fish}',
    'sim.quest.countFish': { one: '{n} rybę', few: '{n} ryby', many: '{n} ryb' },
    // gatunek w zadaniu (biernik): one = jedna sztuka BEZ liczby („Złów węgorza”), few/many z liczbą
    'sim.quest.fish.sardinka': { one: 'sardynkę', few: '{n} sardynki', many: '{n} sardynek' },
    'sim.quest.fish.okun': { one: 'okonia morskiego', few: '{n} okonie morskie', many: '{n} okoni morskich' },
    'sim.quest.fish.krab': { one: 'kraba', few: '{n} kraby', many: '{n} krabów' },
    'sim.quest.fish.platesa': { one: 'gładzicę', few: '{n} gładzice', many: '{n} gładzic' },
    'sim.quest.fish.makrela': { one: 'makrelę', few: '{n} makrele', many: '{n} makreli' },
    'sim.quest.fish.pyskac': { one: 'wargacza', few: '{n} wargacze', many: '{n} wargaczy' },
    'sim.quest.fish.papagajovka': { one: 'papugorybę', few: '{n} papugoryby', many: '{n} papugoryb' },
    'sim.quest.fish.zubatica': { one: 'zębacza', few: '{n} zębacze', many: '{n} zębaczy' },
    'sim.quest.fish.murena': { one: 'murenę', few: '{n} mureny', many: '{n} muren' },
    'sim.quest.fish.barakuda': { one: 'barakudę', few: '{n} barakudy', many: '{n} barakud' },
    'sim.quest.fish.svetlonoska': { one: 'świetlika', few: '{n} świetliki', many: '{n} świetlików' },
    'sim.quest.fish.treska': { one: 'dorsza', few: '{n} dorsze', many: '{n} dorszy' },
    'sim.quest.fish.uhor': { one: 'węgorza', few: '{n} węgorze', many: '{n} węgorzy' },
    'sim.quest.fish.tuniak': { one: 'tuńczyka', few: '{n} tuńczyki', many: '{n} tuńczyków' },
    'sim.quest.fish.mesacnica': { one: 'srebrną księżycówkę', few: '{n} srebrne księżycówki', many: '{n} srebrnych księżycówek' },
    'sim.quest.fish.lampasnik': { one: 'głębinnika z lampą', few: '{n} głębinniki z lampą', many: '{n} głębinników z lampą' },
    'sim.quest.fish.pazravy': { one: 'żarłocznego węgorza', few: '{n} żarłoczne węgorze', many: '{n} żarłocznych węgorzy' },
    'sim.quest.fish.raja': { one: 'mglistą płaszczkę', few: '{n} mgliste płaszczki', many: '{n} mglistych płaszczek' },
    'sim.quest.fish.sklenena': { one: 'szklaną rybę', few: '{n} szklane ryby', many: '{n} szklanych ryb' },
    'sim.quest.fish.velkoustka': { one: 'gardzielca', few: '{n} gardzielce', many: '{n} gardzielców' },
    'sim.quest.fish.latimeria': { one: 'latimerię', few: '{n} latimerie', many: '{n} latimerii' },
    'sim.quest.fish.sled': { one: 'śledzia wędrownego', few: '{n} śledzie wędrowne', many: '{n} śledzi wędrownych' },
    'sim.quest.fish.tekvicovka': { one: 'dyniówkę', few: '{n} dyniówki', many: '{n} dyniówek' },
    'sim.quest.fish.prizrak': { one: 'rybę widmo', few: '{n} ryby widma', many: '{n} ryb widm' },
    // warunek zadania („Złów 3 węgorze nocą”)
    'sim.quest.cond.morning': 'rano',
    'sim.quest.cond.day': 'w dzień',
    'sim.quest.cond.evening': 'wieczorem',
    'sim.quest.cond.night': 'nocą',
    'sim.quest.cond.sun': 'w słońcu',
    'sim.quest.cond.cloudy': 'pod chmurami',
    'sim.quest.cond.rain': 'w deszczu',
    'sim.quest.cond.fog': 'we mgle',
    'sim.quest.cond.storm': 'w czasie burzy',
    'sim.quest.cond.fullmoon': 'przy pełni',
    'sim.quest.cond.newmoon': 'przy nowiu',

    // --- tropy legend (Karczma, poziom 3)
    'sim.clue.caught': 'Złowiono. Trofeum trafi do Akwarium.',
    'sim.clue.text': '{hint} Warunki: {conds}. Strefa: {zone}.',

    // --- świat
    'sim.world.day': 'Dzień {n}',
    'sim.world.clear': 'Pogodnie',

    // --- kariera i zapis ({detail} = przyczyna techniczna, nie tłumaczy się)
    'sim.game.noStorage': 'Gra się nie zapisuje — nie ma skąd przywrócić.',
    'sim.game.noBackup': 'Żadnej kopii nie da się wczytać.',
    'sim.game.stale': 'Gra jest otwarta w innej karcie — ta karta już nie zapisuje. Wczytaj stronę ponownie.',
    'sim.save.corrupt': 'Nie zapisano, stan gry jest uszkodzony: {detail}',
    'sim.save.writeFailed': 'Zapis się nie powiódł: {detail}',
    'sim.save.unavailable': 'Pamięć niedostępna: {detail}',
    'sim.save.loadFailed': 'Nie można wczytać zapisu: {detail}',
    'sim.save.settingsLoad': 'Nie można wczytać ustawień: {detail}',
    'sim.save.settingsStore': 'Nie można zapisać ustawień: {detail}',
  });
})(globalThis.HL);
