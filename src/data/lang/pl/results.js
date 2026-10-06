// Polski — wynik zanurzenia i koniec gry (ui/results.js). Źródło: src/data/lang/sk/results.js.
// Słowniczek: src/data/lang/pl/data.js. Szerokości: zdania na liście 168 px (łamią się), podtytuł 168 px drobnym,
// etykiety ryb drobnym (~40 px), przyciski 86 / 78 / 168 px, panel boczny 94 px. {n} = liczba; pieniądze/waga/głębokość
// przychodzą już sformatowane. Gracz bez rodzaju: „Tracisz…”, „Wygrana!”, „Dzięki za grę!”.
(function (HL) {
  HL.i18n.add('pl', 'results', {
    'ui.results.title': 'Wynik zanurzenia',
    'ui.results.titleEndless': 'Nieskończona głębia',
    // nagłówek (2× pismo, obrys) i wiersz pod nim ({depth} = "40 m", {min} = minuty)
    'ui.results.safe': 'BEZPIECZNIE',
    'ui.results.snapped': 'PĘKŁA!',
    'ui.results.headline': 'Najgłębiej {depth} · {min} min pod wodą',
    'ui.results.endlessSafe': 'BEZPIECZNIE · najgłębszy punkt · {min} min',
    'ui.results.endlessSnapped': 'PĘKŁA · najgłębszy punkt · {min} min',
    // etykiety w wierszu ryby (drobne wersaliki na kolorowym pasku)
    'ui.results.tag.new': 'NOWA RYBA',
    'ui.results.tag.record': 'REKORD',
    'ui.results.tag.legend': 'LEGENDA',
    'ui.results.tag.sold': 'SPRZEDANE',
    'ui.results.tag.shark': 'ZJADŁ REKIN',
    'ui.results.tag.knot': 'WĘZEŁ',
    // zerwanie: co przepadło (robak = podstawowa przynęta, inaczej „przynętę”)
    'ui.results.lostWorm': 'Tracisz robaka.',
    'ui.results.lostBait': 'Tracisz przynętę.',
    'ui.results.lostFishWorm': { one: 'Tracisz {n} rybę i robaka.', few: 'Tracisz {n} ryby i robaka.', many: 'Tracisz {n} ryb i robaka.' },
    'ui.results.lostFishBait': { one: 'Tracisz {n} rybę i przynętę.', few: 'Tracisz {n} ryby i przynętę.', many: 'Tracisz {n} ryb i przynętę.' },
    // rada po zerwaniu według przyczyny (panel 168 px, łamie się)
    'ui.results.tipTitle': 'Rada rybaków',
    'ui.results.tip.jelly': 'Meduza napina żyłkę na trzy sekundy. Z pełną żyłką omijaj ją albo płyń W GÓRĘ.',
    'ui.results.tip.spikes': 'Przy CZERWONYM nie stukaj — każde stuknięcie szarpie żyłkę i napięcie skacze.',
    'ui.results.tip.fight': 'Dużej ryby nie musisz się bać. Gorzej walczyć z nią, gdy żyłka jest już pełna.',
    'ui.results.tip.octopus': 'Ośmiornicę strząśniesz, szarpiąc haczykiem na boki.',
    'ui.results.tip.hazard': 'Legenda ciągnie razem z prądem i piorunami. Zostaw na żyłce duży zapas.',
    'ui.results.tip.eel': 'W Otchłani nie stój w miejscu. Węgorz cienia tylko na to czeka.',
    'ui.results.tip.rock': 'Skała osłabia żyłkę na stałe, aż wypłyniesz. Po uderzeniu bardziej uważaj.',
    'ui.results.tip.barrel': 'Zardzewiała beczka osłabia żyłkę na stałe, aż wypłyniesz. Po uderzeniu bardziej uważaj.',
    'ui.results.tip.depth': 'Gdy z pełną żyłką zejdziesz głębiej, napięcie rośnie nawet bez nowej ryby. Wracaj W GÓRĘ wcześniej.',
    // Letni festiwal: konkurs dnia ({fish} = nazwa ryby, {kg}/{target}/{best} = "1,4 kg", {money} = "150 €")
    'ui.results.contest': 'Konkurs dnia',
    'ui.results.contestWon': 'Wygrana! {fish} {kg} przebija cel {target}.',
    'ui.results.contestPrizePaid': 'Nagroda +{money} jest na koncie.',
    'ui.results.contestPrizeLater': 'Nagroda +{money} przyjdzie z nowym dniem.',
    'ui.results.contestBest': 'Twoja najcięższa {best} / cel {target}',
    'ui.results.contestWonToday': 'Dziś już wygrane — nagroda {money} przyjdzie z nowym dniem.',
    'ui.results.contestHint': 'Cięższa ryba wygra {money}.',
    'ui.results.contestPrize': 'Nagroda z konkursu +{money} jest na koncie.',
    // przebieg zanurzenia (liczby), zagrożenia połączone " · "
    'ui.results.stats': 'Przebieg zanurzenia',
    'ui.results.statsFights': 'Walki {fights} · złowione {landed} · uciekły {escaped}',
    'ui.results.statsTaps': 'Stuknięcia dobre {good} · złe {bad}',
    'ui.results.hazards': 'Zagrożenia: {list}',
    'ui.results.hazJelly': 'meduzy {n}',
    'ui.results.hazRock': 'skały {n}',
    'ui.results.hazBarrel': 'beczki {n}',                 // jądrowe jezioro
    'ui.results.hazShark': 'rekin zjadł {n}',
    // Nieskończona głębia
    'ui.results.rank': '{rank}. miejsce w rankingu',
    'ui.results.noRank': 'Poza rankingiem (top 10)',
    'ui.results.catchValue': 'Wartość połowu',
    'ui.results.perks': 'Ulepszenia',
    'ui.results.perkStack': '{perk} ×{n}',
    'ui.results.noPerks': 'Brak — nie udało się dotrzeć do 250 m.',
    'ui.results.catchCount': 'Połów ({n})',
    'ui.results.allLost': 'Wszystko zabrało morze.',
    'ui.results.noCatch': 'Bez połowu.',
    'ui.results.lost': 'Stracone',
    // BEZPIECZNIE (kariera); {stored}/{cap} = zapełnienie Chatki
    'ui.results.empty': 'Tym razem bez połowu. Spróbuj innej głębokości, innej pory albo innej przynęty.',
    'ui.results.toStorage': {
      one: 'Do Chatki: {n} ryba ({stored} / {cap}). Sprzedasz ją na targu.',
      few: 'Do Chatki: {n} ryby ({stored} / {cap}). Sprzedasz je na targu.',
      many: 'Do Chatki: {n} ryb ({stored} / {cap}). Sprzedasz je na targu.',
    },
    'ui.results.soldOverflow': {
      one: '{n} ryba nie zmieściła się w Chatce — sprzedana za {money}.',
      few: '{n} ryby nie zmieściły się w Chatce — sprzedane za {money}.',
      many: '{n} ryb nie zmieściło się w Chatce — sprzedane za {money}.',
    },
    'ui.results.haul': {
      one: 'Premia za {n} rybę (+{pct}): +{money} jest na koncie.',
      few: 'Premia za {n} ryby (+{pct}): +{money} jest na koncie.',
      many: 'Premia za {n} ryb (+{pct}): +{money} jest na koncie.',
    },
    'ui.results.lostOnWay': 'Stracone po drodze',
    'ui.results.questsDone': { one: 'Wykonane zadanie', few: 'Wykonane zadania', many: 'Wykonane zadania' },
    'ui.results.rewardGold': { one: '+{n} złota przynęta', few: '+{n} złote przynęty', many: '+{n} złotych przynęt' },
    'ui.results.legend': 'Legenda: {name}',
    'ui.results.daysPassed': {
      one: 'Na morzu zaczął się nowy dzień. Ceny na targu drgnęły.',
      few: 'Na morzu minęły {n} dni. Ceny na targu drgnęły.',
      many: 'Na morzu minęło {n} dni. Ceny na targu drgnęły.',
    },
    'ui.results.aquarium': 'Akwarium zarobiło {money}.',
    'ui.results.storageFull': 'Chatka jest pełna: co się w niej nie zmieści, sprzeda się zaraz po powrocie.',
    // przyciski dolnego paska
    'ui.results.toMarket': 'Na targ',
    'ui.results.toVillage': 'Do wioski',
    'ui.results.toPlant': 'Na brzeg',                   // jądrowe jezioro: z powrotem do Starej elektrowni
    'ui.results.continue': 'Kontynuuj',
    // koniec gry (Strażnik otchłani złowiony); nagłówek 2× pismem w dwóch wierszach po ~14 znaków
    'ui.results.ending.title1': 'STRAŻNIK',
    'ui.results.ending.title2': 'OTCHŁANI',
    'ui.results.ending.caught': 'złowiony',
    'ui.results.ending.text': 'Wioska świętuje. Lampiony świecą aż do rana, a rybacy piją twoje zdrowie. Morze znów jest spokojne.',
    'ui.results.ending.thanks': 'Dzięki za grę!',
    'ui.results.ending.palette': 'Paleta ENDESGA 32',
    'ui.results.ending.audio': 'Muzyka i dźwięki syntetyzowane w grze',
    'ui.results.ending.more': 'Łowić możesz dalej: rekordy, encyklopedia, Nieskończona głębia.',
    // panele boczne (PC): opisy wierszy drobnym pismem, wartość z prawej
    'ui.results.panel.fights': 'Walki',
    'ui.results.panel.landed': 'Złowione',
    'ui.results.panel.escaped': 'Uciekły',
    'ui.results.panel.goodTaps': 'Dobre stuknięcia',
    'ui.results.panel.badTaps': 'Złe stuknięcia',
    'ui.results.panel.jelly': 'Meduzy',
    'ui.results.panel.rock': 'Skały',
    'ui.results.panel.barrel': 'Beczki',                  // jądrowe jezioro
    'ui.results.panel.shark': 'Zjadł rekin',
    'ui.results.panel.career': 'Kariera',
    'ui.results.panel.dives': 'Zanurzenia',
    'ui.results.panel.caught': 'Złowione',
    'ui.results.panel.snaps': 'Zerwania',
    'ui.results.panel.earned': 'Zarobione',
    'ui.results.panel.deepest': 'Najgłębiej',
    'ui.results.panel.biggest': 'Największa',
  });
})(globalThis.HL);
