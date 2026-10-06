// Polski — wspólne teksty ekranów (ui/common.js, core/main.js, wybór języka, wiersz rejsu).
// Źródło: src/data/lang/sk/ui_common.js. Słowniczek: src/data/lang/pl/data.js.
(function (HL) {
  HL.i18n.add('pl', 'ui_common', {
    // plakietka zapisu ( ' — ' = gdzie długi tekst można podzielić na naprzemienne połowy)
    'ui.common.save.nosave': 'Gra się nie zapisuje',
    'ui.common.save.stale': 'Gra otwarta w innej karcie — zmiany się nie zapisują',
    'ui.common.moreBelow': '↓ dalej',
    // etykieta wielkości okazu (HL.ui.tierTag) — krótka, nad panelem walki
    'ui.common.tier.velky': 'DUŻY OKAZ',
    'ui.common.tier.trofejny': 'TROFEUM',
    // wybór języka (ekran tytułowy, Ustawienia)
    'ui.common.lang.title': 'Język',
    'ui.common.lang.soon': 'wkrótce',
    'ui.common.close': 'Zamknij',
    // rejs (HL.data.tripLine): "Rejs: 3 zanurzenia · 5 ryb · 120 €"
    'ui.common.tripLine': 'Rejs: {dives} · {fish} · {value}',
    'ui.common.tripDives': { one: '{n} zanurzenie', few: '{n} zanurzenia', many: '{n} zanurzeń' },
    'ui.common.tripFish': { one: '{n} ryba', few: '{n} ryby', many: '{n} ryb' },
    // rada dla telefonu w poziomie (na bocznym marginesie, dwa wiersze)
    'ui.common.rotate1': 'Obróć telefon',
    'ui.common.rotate2': 'pionowo',
    // domyślne panele boczne (PC); wiersze sterowania: klawisze / wcięty opis
    'ui.common.panel.controls': 'Sterowanie',
    'ui.common.panel.keysMove': 'A / D, mysz',
    'ui.common.panel.move': 'haczyk na boki',
    'ui.common.panel.keysSink': 'S, lewy przycisk',
    'ui.common.panel.sink': 'opadanie',
    'ui.common.panel.keysTap': 'Spacja, klik',
    'ui.common.panel.fight': 'walka z rybą',
    'ui.common.panel.up': 'W GÓRĘ',
    'ui.common.panel.harpoon': 'harpun',
    'ui.common.panel.pause': 'pauza / wstecz',
    'ui.common.panel.f2': 'F2 strojenie',
    'ui.common.panel.f3': 'F3 dane techniczne',
    'ui.common.panel.money': 'Pieniądze',
    'ui.common.panel.day': 'Dzień',
    'ui.common.panel.time': 'Czas',
    'ui.common.panel.weather': 'Pogoda',
    'ui.common.panel.moon': 'Księżyc',
    // czerwony pasek na dole przy błędzie skryptu ({msg} = komunikat techniczny, bez tłumaczenia)
    'ui.common.errorBar': 'BŁĄD: {msg}',
  });
})(globalThis.HL);
