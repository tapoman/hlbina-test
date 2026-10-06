// Polski — przygotowanie do zanurzenia (ui/prep.js). Źródło: src/data/lang/sk/prep.js. Słowniczek: src/data/lang/pl/data.js.
// Szerokości: etykieta sprzętu z prawej drobnym pismem (~60 px), zdanie pod żyłką 156 px, nagłówek sekcji 168 px,
// panel boczny 94 px (zdania się łamią). {n} = liczba (liczba mnoga), pozostałe wartości już sformatowane.
(function (HL) {
  HL.i18n.add('pl', 'prep', {
    'ui.prep.title': 'Przygotowanie',
    'ui.prep.dive': 'ZANURZ SIĘ',
    'ui.prep.haul': 'PREMIA',
    'ui.prep.haulToast': 'Premia: od {from} ryb +{pct}. Gdy ryba ucieknie w walce, tracisz wszystkie ryby z wędki!',
    // sekcje listy
    'ui.prep.bait': 'Przynęta',
    'ui.prep.gear': 'Sprzęt',
    'ui.prep.reach': 'Dokąd sięga żyłka',
    'ui.prep.hot': 'Dziś poszukiwane na targu',
    'ui.prep.hotNone': 'Dziś nic szczególnego.',
    'ui.prep.hotMult': '★ ×{mult}',
    // warunki i prognoza (wiersze dni mają na etykietę 34 px drobnego pisma)
    'ui.prep.noForecast': 'Prognozę pokaże Stacja meteo.',
    'ui.prep.introSun': 'Na początku zawsze świeci słońce.', // maxWidth 158 px; stare zdanie 183 px
    'ui.prep.today': 'dziś',
    'ui.prep.tomorrow': 'jutro',
    'ui.prep.dayAfter': 'pojutrze',
    // prognoza ryb (sekcja pod pogodą, 168 px): czas zwykłym pismem, z prawej drobnym pora · pogoda; wiersz ryby = nazwa + głębokość;
    // „dzień 150, 18:00” + „Wieczór · Pochmurno” nie mieści się w jednym wierszu — pora · pogoda idzie wtedy drobnym pod czas;
    // fishShow / fishHide = wiersz zwiń/rozwiń (UI dodaje „ ▸” / „ ▴”, najwyżej 157 px)
    'ui.prep.fish': 'Co kiedy bierze',
    'ui.prep.fishNow': 'teraz',
    'ui.prep.fishTomorrow': 'jutro {time}',
    'ui.prep.fishDayAfter': 'pojutrze {time}',
    'ui.prep.fishDay': 'dzień {n}, {time}',
    'ui.prep.fishCond': '{period} · {weather}',
    'ui.prep.fishNone': 'tylko zwykłe ryby',
    'ui.prep.fishShow': { one: 'Kolejne godziny ({n} zmiana)', few: 'Kolejne godziny ({n} zmiany)', many: 'Kolejne godziny ({n} zmian)' },
    'ui.prep.fishHide': 'Ukryj prognozę',
    // karta przynęty: ile sztuk gracz bierze na zanurzenie
    // bez „szt.”: nazwa ma 168 − 23 − ta etykieta − 8 px, „Świecąca przynęta” (81 px) się skracała
    'ui.prep.carry': { one: 'bierzesz {n}', few: 'bierzesz {n}', many: 'bierzesz {n}' },
    'ui.prep.unlimited': 'bez limitu',
    // sprzęt ({ms} = milisekundy tolerancji, {pct} = "60%")
    'ui.prep.noFloor': 'bez dna',
    'ui.prep.limitLighthouse': 'Głębiej tylko z Latarnią 3.', // 148 px; stare 150 px się skracało
    'ui.prep.limitFloor': 'Sięga aż do dna morza.',
    // jądrowe jezioro: limit Stoczni (maxWidth 148 px — ma 140 px) i dno = rdzeń reaktora
    'ui.prep.limitShipyard': 'Głębiej tylko z lepszą Stocznią.',
    'ui.prep.limitCore': 'Sięga aż do rdzenia.',
    'ui.prep.rodTolerance': 'rytm +{ms} ms',
    'ui.prep.rodBasic': 'podstawowa',
    'ui.prep.hookEscape': 'ucieczka –{pct}',
    'ui.prep.hookBasic': 'podstawowy',
    'ui.prep.harpoons': 'Harpuny',
    'ui.prep.harpoonCount': { one: '{n} szt.', few: '{n} szt.', many: '{n} szt.' },
    'ui.prep.harpoonNone': 'brak',
    'ui.prep.harpoonLocked': 'od Warsztatu 2',
    'ui.prep.storage': 'Chatka',
    'ui.prep.storageFull': 'pełna — połów sprzedasz od razu',
    // {stored} = ryb w Chatce, {n} = pojemność (forma według pojemności)
    'ui.prep.storageCount': { one: '{stored} / {n} ryba', few: '{stored} / {n} ryby', many: '{stored} / {n} ryb' },
    // panele boczne (PC)
    'ui.prep.panel.weather': 'Pogoda',
    'ui.prep.panel.weatherHint': 'Stacja meteo pokaże, jaka pogoda nadejdzie. Niektóre ryby biorą tylko w deszczu, we mgle albo w burzę.',
    'ui.prep.panel.now': 'teraz',
    'ui.prep.panel.dayTime': '{day}, {time}',
    'ui.prep.panel.reach': 'Zasięg',
    'ui.prep.panel.depthRule': 'Im głębiej jesteś, tym więcej ryba na żyłce waży: na głębokości 500 m trzy razy tyle.',
    'ui.prep.panel.keyDive': 'Enter  zanurz się',
    'ui.prep.panel.keyBack': 'Esc  wróć do wioski',
    'ui.prep.panel.keyBackPlant': 'Esc  wróć do elektrowni',
  });
})(globalThis.HL);
