// Polski — Encyklopedia (ui/encyclopedia.js). Źródło: src/data/lang/sk/encyclopedia.js. Słowniczek: src/data/lang/pl/data.js.
// Szerokości: opis wiersza szczegółów 50 px (Warunki, Przynęta…), wartość 112 px (łamie się), nazwa w szczegółach 118 px,
// wiersz pod siatką 168 px, strefa · głębokość 110 px drobnym, zakładki ~84 px, panel boczny 94 px (grupa 64 px).
// Rodziny z id: month.0–11 (0 = styczeń), hazard.<id> (zagrożenia legend, liczba mnoga).
(function (HL) {
  HL.i18n.add('pl', 'encyclopedia', {
    'ui.encyclopedia.title': 'Encyklopedia',
    'ui.encyclopedia.subCaught': 'Złowione {caught} / {total}',
    'ui.encyclopedia.subFish': 'Gatunek {i} / {total}',
    'ui.encyclopedia.subLegend': 'Legenda {i} / {total}',
    'ui.encyclopedia.tabFish': 'Ryby {caught}/{total}',
    'ui.encyclopedia.tabLegends': 'Legendy {caught}/{total}',
    'ui.encyclopedia.tabLake': 'Jezioro {caught}/{total}',   // trzecia zakładka 56 px: „Jezioro 9/9” ma 51 px
    'ui.encyclopedia.list': 'Lista',
    'ui.encyclopedia.back': 'Wróć',
    'ui.encyclopedia.backVillage': 'Wróć do wioski',
    'ui.encyclopedia.backPlant': 'Wróć do elektrowni',
    // komórka siatki: gatunek sezonowy poza wydarzeniem (drobne pismo, 38 px), liczba połowów
    'ui.encyclopedia.cellSeasonal': 'sezonowe',
    'ui.encyclopedia.cellCount': '×{n}',
    // wiersz pod siatką (kursor/palec/fokus)
    // wiersz 168 px: „Stuknij legendę, by zobaczyć szczegóły.” (178 px) się skracał; obie wersje równoległe
    'ui.encyclopedia.tapFish': 'Stuknij rybę, by ją poznać.',
    'ui.encyclopedia.tapLegend': 'Stuknij legendę, by ją poznać.',
    'ui.encyclopedia.seasonalHint': 'Sezonowe tylko w czasie wydarzeń.',
    'ui.encyclopedia.seasonalFish': 'Gatunek sezonowy',
    'ui.encyclopedia.seasonalLegend': 'Legenda sezonowa',
    'ui.encyclopedia.eventMonths': '{event} · {months}',
    'ui.encyclopedia.monthRange': '{from} – {to}',
    'ui.encyclopedia.depthRange': '{from}–{to}',
    'ui.encyclopedia.zoneDepth': '{zone} · {depth}',
    // stan bez rodzaju: nazwy mają różny rodzaj (okoń, makrela, Król burzy) — forma bezosobowa
    'ui.encyclopedia.caught': 'złowiono',
    'ui.encyclopedia.caughtTimes': 'złowiono {n}×',
    'ui.encyclopedia.caughtLegend': 'złowiono ★',
    'ui.encyclopedia.notCaught': 'nie złowiono',
    // szczegóły gatunku sezonowego ({desc} = opis wydarzenia z danych, bez kropki)
    'ui.encyclopedia.onlyDuring': 'Pojawia się tylko podczas wydarzenia {event} ({months}).',
    'ui.encyclopedia.onlyDuringUnknown': 'Pojawia się tylko podczas wydarzenia.',
    'ui.encyclopedia.eventDesc': '{desc}.',
    // szczegóły: opisy wierszy (najwyżej 50 px)
    'ui.encyclopedia.row.cond': 'Warunki',
    'ui.encyclopedia.row.bait': 'Przynęta',
    'ui.encyclopedia.row.baitOk': 'Też na',
    'ui.encyclopedia.row.rhythm': 'Rytm',
    'ui.encyclopedia.row.fight': 'Walka',
    'ui.encyclopedia.row.hazards': 'Zagrożenia', // 47 px ≤ 50; jak w ponorze i wynikach
    'ui.encyclopedia.row.reward': 'Nagroda',
    'ui.encyclopedia.row.price': 'Cena',
    'ui.encyclopedia.row.caught': 'Złowiono',
    'ui.encyclopedia.row.biggest': 'Rekord',
    'ui.encyclopedia.row.biggestLegend': 'Rekord',
    'ui.encyclopedia.row.first': 'Pierwszy',
    // szczegóły: wartości wierszy ({list} = rytmy faz połączone strzałką →)
    'ui.encyclopedia.phases': { one: '{n} faza', few: '{n} fazy', many: '{n} faz' },
    'ui.encyclopedia.phasesList': { one: '{n} faza: {list}', few: '{n} fazy: {list}', many: '{n} faz: {list}' },
    'ui.encyclopedia.rewardTrophy': '{reward} + trofeum',   // {reward} bywa całym zdaniem („Wioska świętuje!”)
    'ui.encyclopedia.pricePer': '{money} za {kg}',
    'ui.encyclopedia.pieces': { one: '{n} sztuka', few: '{n} sztuki', many: '{n} sztuk' },
    'ui.encyclopedia.biggestTimes': '{kg} ({n}×)',
    'ui.encyclopedia.firstDay': 'dzień {day}',
    'ui.encyclopedia.clue': 'Warunki zdradzili w Karczmie.',
    'ui.encyclopedia.hint': '„{hint}”',
    // zagrożenia legendy (liczba mnoga — zjawisko, nie jedna sztuka; inne niż hazard.<id>.name w data.js)
    'ui.encyclopedia.hazard.jelly': 'Meduzy',
    'ui.encyclopedia.hazard.current': 'Prądy',
    'ui.encyclopedia.hazard.lightning': 'Pioruny',
    'ui.encyclopedia.hazard.rock': 'Skały',
    // miesiące wydarzeń sezonowych, 0 = styczeń
    'ui.encyclopedia.month.0': 'styczeń',
    'ui.encyclopedia.month.1': 'luty',
    'ui.encyclopedia.month.2': 'marzec',
    'ui.encyclopedia.month.3': 'kwiecień',
    'ui.encyclopedia.month.4': 'maj',
    'ui.encyclopedia.month.5': 'czerwiec',
    'ui.encyclopedia.month.6': 'lipiec',
    'ui.encyclopedia.month.7': 'sierpień',
    'ui.encyclopedia.month.8': 'wrzesień',
    'ui.encyclopedia.month.9': 'październik',
    'ui.encyclopedia.month.10': 'listopad',
    'ui.encyclopedia.month.11': 'grudzień',
    // panele boczne (PC): z lewej postęp po strefach + klawisze (opis 46 px drobnym), z prawej statystyki kariery
    'ui.encyclopedia.panel.zones': 'Strefy',
    'ui.encyclopedia.panel.seasonal': 'Sezonowe',
    'ui.encyclopedia.panel.legends': 'Legendy',
    'ui.encyclopedia.panel.arrows': '↑↓←→',                 // kolumna klawiszy ma 32 px: „Strzałki” (29 px) zlewało się z opisem
    'ui.encyclopedia.panel.select': 'wybór',
    'ui.encyclopedia.panel.detail': 'szczegóły',
    'ui.encyclopedia.panel.tabs': 'ryby / legendy',
    'ui.encyclopedia.panel.lakeKey': 'jezioro',
    'ui.encyclopedia.panel.lake': 'Jezioro',
    'ui.encyclopedia.panel.back': 'wstecz',
    'ui.encyclopedia.panel.records': 'Statystyki',
    'ui.encyclopedia.panel.dives': 'Zanurzenia',
    'ui.encyclopedia.panel.caught': 'Złowione ryby',
    'ui.encyclopedia.panel.deepest': 'Najgłębiej',
    'ui.encyclopedia.panel.biggest': 'Największy połów',
  });
})(globalThis.HL);
