// Polski — scena ui/village.js (wioska). Źródło: src/data/lang/sk/village.js. Słowniczek: src/data/lang/pl/data.js.
// Szerokości: panele boczne 94 px (drobne pismo ≈ 4 px na znak, wiersz się łamie), etykieta budynku do ~170 px,
// główny przycisk NA MORZE 104 px (wersaliki 6 px na znak), samouczek 146 px na wiersz (łamie się).
(function (HL) {
  HL.i18n.add('pl', 'village', {
    'ui.village.toSea': 'NA MORZE',
    // stuknięcie w czas/pogodę w nagłówku (toast): {period} = pora dnia, {weather}/{next} = pogoda małą literą
    'ui.village.hud.now': '{period}, {weather}',
    'ui.village.hud.forecast': '{period}, {weather}. O {time}: {next}',
    'ui.village.hud.noForecast': '{period}, {weather}. Prognozę pokaże Stacja meteo.',
    // etykieta nad budynkiem (kursor/fokus); {money} = cena, {level} = poziom
    'ui.village.tag.build': 'Zbuduj: {money}',
    'ui.village.tag.level': 'Poziom {level} · następny {money}',
    'ui.village.tag.done': 'Poziom 3 · gotowe',
    'ui.village.tag.sell': { one: 'Sprzedaj {n} rybę', few: 'Sprzedaj {n} ryby', many: 'Sprzedaj {n} ryb' },
    'ui.village.tag.sellNone': 'Sprzedaż ryb',
    // odcinek prognozy (też ekran Stacji meteo): {from}–{to} = godziny 06:00–09:00, {n} = numer dnia
    'ui.village.seg.today': '{from}–{to}',
    'ui.village.seg.tomorrow': 'jutro {from}–{to}',
    'ui.village.seg.later': 'dzień {n} {from}–{to}',
    // samouczek przy pierwszej wizycie
    'ui.village.tut.title': 'Witaj w Hlbinie',
    'ui.village.tut.text': 'Z rozpadającej się chatki zbudujesz wioskę rybacką. Wypłyń NA MORZE, złów ryby i sprzedaj je na Targu. Za zarobione pieniądze stawiaj budynki — każdy odblokuje coś nowego.',
    'ui.village.tut.warn': 'Uwaga: każda ryba i każdy metr głębokości napina żyłkę. Gdy pęknie, połów przepada.',
    'ui.village.tut.ok': 'Rozumiem',
    // panele boczne (PC): z lewej prognoza i księżyc, z prawej popyt, magazyn, zadania
    'ui.village.panel.forecast': 'Prognoza',
    'ui.village.panel.noMeteo': 'Zbuduj Stację meteo, a zobaczysz, jaka pogoda nadejdzie.',
    'ui.village.panel.hours': 'na {h} h',
    'ui.village.panel.intro': 'Pierwsze zanurzenia: na morzu będzie spokój i słońce.',
    'ui.village.panel.moon': 'Księżyc',
    'ui.village.panel.today': 'Dziś',
    'ui.village.panel.tomorrow': 'Jutro',
    'ui.village.panel.dayAfter': 'Pojutrze',
    'ui.village.panel.noMoon': 'Fazy księżyca pokaże Stacja meteo na poziomie 3.',
    'ui.village.panel.hot': 'Gorący popyt',
    'ui.village.panel.hotNone': 'Dziś nic szczególnego.',
    'ui.village.panel.hotMult': '×{mult}',
    'ui.village.panel.storage': 'Magazyn',
    // {got} ryb z pojemności {n}; forma według pojemności ("3 / 5 ryb")
    'ui.village.panel.storageCount': { one: '{got} / {n} ryba', few: '{got} / {n} ryby', many: '{got} / {n} ryb' },
    'ui.village.panel.sellHint': 'Sprzedaj je na Targu.',
    'ui.village.panel.quests': 'Zadania',
    'ui.village.panel.questsLocked': 'Zadania dają rybacy w Karczmie od poziomu 2.',
    // drogowskaz do Starej elektrowni (jądrowe jezioro, docs/JAZERO.md); przycisk NA JEZIORO 104 px
    'ui.village.plant.name': 'Stara elektrownia',
    'ui.village.plant.sub': 'Jądrowe jezioro',
    'ui.village.plant.toLake': 'NA JEZIORO',
    'ui.village.plant.intro': 'Zbuduj Stocznię, a w Laboratorium kup żyłkę i wędkę na jezioro. Potem NA JEZIORO.',
    'ui.village.plant.zones': 'Strefy jeziora',
    'ui.village.plant.reach': 'Zasięg w jeziorze',
    'ui.village.plant.fish': 'Ryby jeziora',
  });
})(globalThis.HL);
