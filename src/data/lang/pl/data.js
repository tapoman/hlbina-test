// Polski — przekrycie danych (HL.i18n.overlay): nazwy ryb, budynków, sprzętu, świat, porady, samouczek, rytmy.
// Klucze = src/data/lang/sk/data.js (wygenerowany ze słowackich danych). Zasady: docs/I18N.md.
//
// SŁOWNICZEK (trzymać się go we WSZYSTKICH obszarach pl/*.js):
//   ponor → zanurzenie (ZANURZ SIĘ, wynurz się) · vlasec → żyłka · prút → wędka · háčik → haczyk
//   návnada → przynęta · úlovok → połów · prasknutie → zerwanie (PĘKŁA! = żyłka) · napätie → napięcie
//   ťuknutie / ŤUKAJ → stuknięcie / STUKAJ · zelená / červená → ZIELONE / CZERWONE (światło)
//   ťahá / povolí → CIĄGNIE / LUZUJE (ciąg / luz) · zaseknutie → zacięcie · boj → walka · rytmus → rytm
//   harpúna → harpun · HORE → W GÓRĘ · hladina → powierzchnia · Prístav → Port · výlet → rejs
//   dedina → wioska · Chatrč → Chatka · Trhovisko → Targ · Dielňa → Warsztat · Návnadáreň → Przynęciarnia
//   Meteostanica → Stacja meteo · Maják → Latarnia · Krčma → Karczma · Akvárium → Akwarium
//   pásmo → strefa: Płycizna, Rafy, Zmierzch, Północ, Otchłań · Nekonečná hlbina → Nieskończona głębia
//   legenda → legenda · trofej → trofeum · kus (veľkosť) → okaz · druh → gatunek · úloha → zadanie
//   rybári → rybacy · dopyt → popyt · objednávka → zamówienie · obchodník → kupiec · úložisko → magazyn
//   vylepšenie (Nieskończona) → ulepszenie · vylepšiť (budynek) → ulepsz · úroveň → poziom · súťaž → konkurs
//   udalosť → wydarzenie · predpoveď → prognoza · ladenie (F2) → strojenie · Zmes návnad → Mix przynęt
//   drobné rybky z plytčiny → drobnica z płycizny · z jedného ponoru → naraz · návrh (kalibrácia) → propozycja
//   nástrahy / hrozí → zagrożenia · znova (tlačidlo) → znowu · ks → szt. (tam, gdzie mieści się jednostka)
// Jadrové jazero (docs/JAZERO.md):
//   Stará elektráreň → Stara elektrownia · Jadrové jazero → Jądrowe jezioro · NA JAZERO → NA JEZIORO
//   Lodenica → Stocznia (ż.; dop. Stoczni, bier. Stocznię) · Laboratórium → Laboratorium (n., w lp. nieodmienne)
//   pásma jazera (krótko): Jezioro chłodzące (Jezioro), Zatopiona hala (Hala), Szyb reaktora (Szyb)
//   jadro (reaktora) → rdzeń · jazerný vlasec / prút → żyłka / wędka na jezioro · mutanti → mutanty
//   olovený → ołowiany · grafitový → grafitowy · zirkóniový → cyrkonowy · (hrdzavý) sud → (zardzewiała) beczka
//   hrdzavý → zardzewiały; krótko „rdzawy” (Rdzawy węgorz, opis Zatopionej hali — brak miejsca w napisie)
//   Breh / BREH → Brzeg / BRZEG (powrót z jeziora) · Na breh → Na brzeg · Atómový sumec → Atomowy sum
// Gracz: formy BEZ rodzaju (czas teraźniejszy, „złowiono“, „tracisz“), nie „złowiłeś / złowiłaś“.
// Nazwa gry HLBINA / Hlbina się NIE tłumaczy (w zdaniu odmieniona: „w Hlbinie“).
// Liczby w tekstach po polsku: 1500 m (bez spacji do 9999), 20% (bez spacji przed %).
(function (HL) {
  HL.i18n.add('pl', 'data', {
    // fish
    "fish.sardinka.name": "Sardynka",
    "fish.sardinka.hint": "Bierze zawsze i wszędzie. Nawet na zwykłego robaka.",
    "fish.okun.name": "Okoń morski",
    "fish.okun.hint": "W dzień trzyma się przy powierzchni.",
    "fish.krab.name": "Krab",
    "fish.krab.hint": "Wychodzi dopiero nocą. Nie oprze się małżom.",
    "fish.platesa.name": "Gładzica",
    "fish.platesa.hint": "Rybacy mówią, że wypędza ją deszcz.",
    "fish.makrela.name": "Makrela",
    "fish.makrela.hint": "Ławice makreli pokazują się tylko rano.",
    "fish.pyskac.name": "Wargacz",
    "fish.pyskac.hint": "Mieszkaniec raf. Bierze prawie zawsze.",
    "fish.papagajovka.name": "Papugoryba",
    "fish.papagajovka.hint": "Kolorowa jak tęcza, ale tylko w słońcu.",
    "fish.zubatica.name": "Zębacz",
    "fish.zubatica.hint": "Poluje, gdy zachodzi słońce.",
    "fish.murena.name": "Murena",
    "fish.murena.hint": "Nocą wychodzi ze skał. Walczy nieprzewidywalnie.",
    "fish.barakuda.name": "Barakuda",
    "fish.barakuda.hint": "Podobno w burzę atakuje wszystko, co się rusza.",
    "fish.svetlonoska.name": "Świetlik",
    "fish.svetlonoska.hint": "Drobne światełka w półmroku. Na dole jest ich pełno.",
    "fish.treska.name": "Dorsz",
    "fish.treska.hint": "Gdy nad morzem kłębi się mgła, dorsz podpływa wyżej.",
    "fish.uhor.name": "Węgorz",
    "fish.uhor.hint": "Nocny łowca z półmroku. Miota się jak szalony.",
    "fish.tuniak.name": "Tuńczyk",
    "fish.tuniak.hint": "W dzień ciągnie w głębinie. Ciężki — uważaj na żyłkę.",
    "fish.mesacnica.name": "Srebrna księżycówka",
    "fish.mesacnica.hint": "Podobno widziano ją przy pełni…",
    "fish.lampasnik.name": "Głębinnik z lampą",
    "fish.lampasnik.hint": "Światełko w zupełnej ciemności. Nie daj się nabrać.",
    "fish.pazravy.name": "Żarłoczny węgorz",
    "fish.pazravy.hint": "Głodny jest tylko wtedy, gdy na niebie nie świeci księżyc.",
    "fish.raja.name": "Mglista płaszczka",
    "fish.raja.hint": "Głębinowy cień, który unosi się razem z mgłą.",
    "fish.sklenena.name": "Szklana ryba",
    "fish.sklenena.hint": "Przezroczysta jak szkło. Budzi ją dopiero burza.",
    "fish.velkoustka.name": "Gardzielec",
    "fish.velkoustka.hint": "Sama paszcza. Żyje tam, gdzie nie sięga nawet latarnia.",
    "fish.latimeria.name": "Latimeria",
    "fish.latimeria.hint": "Żywa skamielina. Przy pełni podobno wypływa z otchłani.",
    "fish.sled.name": "Śledź wędrowny",
    "fish.sled.hint": "Wiosną ciągną tędy ogromne ławice.",
    "fish.tekvicovka.name": "Dyniówka",
    "fish.tekvicovka.hint": "Pomarańczowe światełko w październikową noc.",
    "fish.prizrak.name": "Ryba widmo",
    "fish.prizrak.hint": "Jest, a potem znów jej nie ma. Tylko w październiku.",

    // legend
    "legend.zlaty_uhor.name": "Złoty węgorz",
    "legend.zlaty_uhor.hint": "Rano, gdy jest słonecznie, między rafami podobno coś błyska złotem.",
    "legend.hmlista_dama.name": "Mglista dama",
    "legend.hmlista_dama.hint": "Gdy jest mgła, a księżyc się chowa, w Północy zjawia się biała postać.",
    "legend.kral_burky.name": "Król burzy",
    "legend.kral_burky.hint": "Burza i pełnia naraz. Wtedy w otchłani budzi się coś ogromnego.",
    "legend.ladova_velryba.name": "Lodowy wieloryb",
    "legend.ladova_velryba.hint": "Tylko zimą. Śpiewa tak głęboko, że słychać go aż w wiosce.",
    "legend.bludicka.name": "Błędny ognik głębin",
    "legend.bludicka.hint": "Październikowa noc. Światełko, które wabi rybaków w głębiny.",
    "legend.strazca.name": "Strażnik otchłani",
    "legend.strazca.hint": "Na samym dnie coś strzeże otchłani. Dopuści do siebie tylko tego, kto złowił wszystkie legendy.",

    // fish (Jądrowe jezioro — mutanty)
    "fish.dvojhlavy_kapor.name": "Dwugłowy karp",
    "fish.dvojhlavy_kapor.hint": "Dwie głowy, jeden żołądek. Bierze prawie na wszystko.",
    "fish.svietiaca_plotica.name": "Świecąca płotka",
    "fish.svietiaca_plotica.hint": "Nocą świeci na zielono. Pływa w ławicach.",
    "fish.trojoky_ostriez.name": "Trójoki okoń",
    "fish.trojoky_ostriez.hint": "W dzień śledzi przynętę wszystkimi trzema oczami.",
    "fish.olovena_stuka.name": "Ołowiany szczupak",
    "fish.olovena_stuka.hint": "Ciężki jak ołów. Czai się między turbinami.",
    "fish.turbinovy_sumec.name": "Turbinowy sum",
    "fish.turbinovy_sumec.hint": "Nocą wyleguje się w trzewiach turbin.",
    "fish.hrdzavy_uhor.name": "Rdzawy węgorz",
    "fish.hrdzavy_uhor.hint": "Gdy pada, wypełza z zardzewiałych rur.",
    "fish.izotopova_mihula.name": "Izotopowy minóg",
    "fish.izotopova_mihula.hint": "Świeci tak, że widać go nawet w szybie reaktora.",
    "fish.grafitova_platesa.name": "Grafitowa gładzica",
    "fish.grafitova_platesa.hint": "W burzę odkleja się od betonowego dna szybu.",

    // legend (Jądrowe jezioro)
    "legend.atomovy_sumec.name": "Atomowy sum",
    "legend.atomovy_sumec.hint": "W deszczową noc rdzeń jarzy się najjaśniej. Przy nim śpi coś wielkiego.",

    // line
    "line.hemp.name": "Żyłka konopna",
    "line.nylon.name": "Żyłka nylonowa",
    "line.braided.name": "Żyłka pleciona",
    "line.steel.name": "Żyłka stalowa",
    "line.legend.name": "Żyłka legendarna",

    // rod
    "rod.bamboo.name": "Wędka bambusowa",
    "rod.fiber.name": "Wędka z laminatu",
    "rod.carbon.name": "Wędka węglowa",
    "rod.master.name": "Wędka mistrzowska",

    // line (jezioro, Laboratorium)
    "line.lead.name": "Żyłka ołowiana",
    "line.graphite.name": "Żyłka grafitowa",
    "line.zirconium.name": "Żyłka cyrkonowa",

    // rod (jezioro, Laboratorium)
    "rod.lead_rod.name": "Wędka ołowiana",
    "rod.graphite_rod.name": "Wędka grafitowa",
    "rod.zirconium_rod.name": "Wędka cyrkonowa",

    // hook
    "hook.basic.name": "Zwykły haczyk",
    "hook.barbed.name": "Haczyk z zadziorem",
    "hook.circle.name": "Haczyk kołowy",
    "hook.titan.name": "Haczyk tytanowy",

    // harpoon
    "harpoon.name": "Harpun",

    // bait
    "bait.worm.name": "Robak",
    "bait.worm.desc": "Drobnica z płycizny",
    "bait.worm.lakeDesc": "Ryby przy powierzchni",
    "bait.shell.name": "Kawałki małży",
    "bait.shell.desc": "Ryby rafowe, kraby",
    "bait.shell.lakeDesc": "Węgorze i karpie",
    "bait.squid.name": "Kalmar",
    "bait.squid.desc": "Ryby drapieżne i średnie",
    "bait.glow.name": "Świecąca przynęta",
    "bait.glow.desc": "Ryby głębinowe",
    "bait.glow.lakeDesc": "Ryby szybu reaktora",
    "bait.gold.name": "Złota przynęta",
    "bait.gold.desc": "Zwiększa szansę na legendy",

    // building
    "building.chatrc.name": "Chatka",
    "building.chatrc.level.0": "Rozpadająca się chatka",
    "building.chatrc.level.1": "Sen: przesuwa czas na rano albo na noc",
    "building.chatrc.level.2": "Większy magazyn ryb",
    "building.chatrc.level.3": "Przytulny dom (ozdoba)",
    "building.trhovisko.name": "Targ",
    "building.trhovisko.level.0": "—",
    "building.trhovisko.level.1": "Sprzedaż ryb, ceny i gorący popyt",
    "building.trhovisko.level.2": "Wykres cen z 3 dni",
    "building.trhovisko.level.3": "Zamówienia kupców z premią",
    "building.dielna.name": "Warsztat",
    "building.dielna.level.0": "—",
    "building.dielna.level.1": "Podstawowe żyłki, wędki i haczyki",
    "building.dielna.level.2": "Lepszy sprzęt i harpuny",
    "building.dielna.level.3": "Żyłka stalowa i legendarna",
    "building.navnadaren.name": "Przynęciarnia",
    "building.navnadaren.level.0": "Pusta buda",
    "building.navnadaren.level.1": "Kawałki małży",
    "building.navnadaren.level.2": "Kalmar",
    "building.navnadaren.level.3": "Świecąca przynęta",
    "building.meteostanica.name": "Stacja meteo",
    "building.meteostanica.level.0": "Nic — tylko spojrzenie w niebo",
    "building.meteostanica.level.1": "Prognoza na 6 godzin",
    "building.meteostanica.level.2": "Prognoza na 24 godziny",
    "building.meteostanica.level.3": "Prognoza na 3 dni i faza księżyca",
    "building.majak.name": "Latarnia",
    "building.majak.level.0": "Zgaszona wieża",
    "building.majak.level.1": "Lepsza widoczność nocą",
    "building.majak.level.2": "Widoczność w Północy",
    "building.majak.level.3": "Otwiera Otchłań i Nieskończoną głębię",
    "building.krcma.name": "Karczma",
    "building.krcma.level.0": "Zabite deskami okna",
    "building.krcma.level.1": "Rybacy dzielą się radami",
    "building.krcma.level.2": "Zadania od rybaków",
    "building.krcma.level.3": "Tropy legend i złota przynęta",
    "building.akvarium.name": "Akwarium",
    "building.akvarium.level.0": "Plac budowy",
    "building.akvarium.level.1": "Wystawione ryby",
    "building.akvarium.level.2": "Turyści: mały dochód pasywny",
    "building.akvarium.level.3": "Trofea legend",
    // poziomy: karta ulepszenia łamie tekst na ≤ 2 wiersze po 104 px drobnym pismem
    "building.lodenica.name": "Stocznia",
    "building.lodenica.level.0": "Wywrócona łódka",
    "building.lodenica.level.1": "Pancerna łódka: jezioro i hala",
    "building.lodenica.level.2": "Ołowiany kadłub: Szyb reaktora",
    "building.lodenica.level.3": "Klatka nurkowa: aż do rdzenia",
    "building.laboratorium.name": "Laboratorium",
    "building.laboratorium.level.0": "Zamknięty kontener",
    "building.laboratorium.level.1": "Ołowiane żyłki i wędki",
    "building.laboratorium.level.2": "Grafitowe żyłki i wędki",
    "building.laboratorium.level.3": "Cyrkonowe żyłki i wędki",

    // zone
    "zone.plytcina.name": "Płycizna",
    "zone.plytcina.desc": "Światło, tanie ryby, meduzy",
    "zone.utesy.name": "Rafy",
    "zone.utesy.desc": "Kolorowe ryby, skały",
    "zone.sumrak.name": "Zmierzch",
    "zone.sumrak.desc": "Półmrok, pierwsze drapieżniki",
    "zone.polnoc.name": "Północ",
    "zone.polnoc.desc": "Ciemność, świecące ryby",
    "zone.priepast.name": "Otchłań",
    "zone.priepast.desc": "Absolutna ciemność, legendy",
    "zone.nekonecna.name": "Nieskończona głębia",
    "zone.nekonecna.desc": "Tu jeszcze nikt nie dopłynął",
    // desc stoi w napisie „0–80 m · <desc>” (drobne pismo, środek x = 90). maxWidth to 170 px, ale z lewej leży
    // na nim głębokościomierz (x 2–8): napis szerszy niż ~160 px traci pierwszą cyfrę („80–300 m” → „0–300 m”).
    // Dlatego krócej niż sk: 150 / 152 / 149 px (bez „ciepła”, „zardzewiałe” → „rdzawe”, bez „blask”).
    // short = etykieta w małym HUD zanurzenia (37 px) i na mapie zasięgu, gdy pełna nazwa się nie mieści.
    "zone.chladiace.name": "Jezioro chłodzące",
    "zone.chladiace.desc": "Zielona woda, pierwsze mutanty",
    "zone.chladiace.short": "Jezioro",
    "zone.hala.name": "Zatopiona hala",
    "zone.hala.desc": "Turbiny, kładki, rdzawe beczki",
    "zone.hala.short": "Hala",
    "zone.sachta.name": "Szyb reaktora",
    "zone.sachta.desc": "Beton, pręty, błękitny rdzeń",
    "zone.sachta.short": "Szyb",

    // location
    "location.more.name": "Morze",
    "location.jadro.name": "Jądrowe jezioro",

    // period
    "period.morning.name": "Rano",
    "period.day.name": "Dzień",
    "period.evening.name": "Wieczór",
    "period.night.name": "Noc",

    // weather
    "weather.sun.name": "Słonecznie",
    "weather.cloudy.name": "Pochmurno",
    "weather.rain.name": "Deszcz",
    "weather.fog.name": "Mgła",
    "weather.storm.name": "Burza",

    // moon
    "moon.0": "Nów",
    "moon.1": "Przybywający sierp",
    "moon.2": "Pierwsza kwadra",
    "moon.3": "Przybywający księżyc",
    "moon.4": "Pełnia",
    "moon.5": "Ubywający księżyc",
    "moon.6": "Ostatnia kwadra",
    "moon.7": "Ubywający sierp",

    // event
    "event.spring.name": "Wiosenna migracja",
    "event.spring.desc": "Ławice ryb wędrownych, podwójne ceny wybranych gatunków",
    "event.summer.name": "Letni festiwal",
    "event.summer.desc": "Konkurs wędkarski w wiosce: najcięższa ryba dnia",
    "event.halloween.name": "Halloweenowa głębia",
    "event.halloween.desc": "Straszne ryby, ciemniejsze morze, sezonowa legenda",
    "event.winter.name": "Zimowe łowy",
    "event.winter.desc": "Lodowy wieloryb, zamarznięta tafla, świąteczna wioska",

    // cond
    "cond.any": "Zawsze",
    "cond.morning": "Rano",
    "cond.day": "Dzień",
    "cond.evening": "Wieczór",
    "cond.night": "Noc",
    "cond.sun": "Słonecznie",
    "cond.cloudy": "Pochmurno",
    "cond.rain": "Deszcz",
    "cond.fog": "Mgła",
    "cond.storm": "Burza",
    "cond.fullmoon": "Pełnia",
    "cond.newmoon": "Nów",
    "cond.spring": "Wiosenna migracja",
    "cond.summer": "Letni festiwal",
    "cond.halloween": "Halloween",
    "cond.winter": "Zimowe łowy",
    "cond.guardian": "Latarnia 3 i wszystkie legendy",

    // hazard
    "hazard.jelly.name": "Meduza",
    "hazard.rock.name": "Ostra skała",
    "hazard.current.name": "Prąd",

    // lakeHazard (jezioro: te same zasady, beczki zamiast skał)
    "lakeHazard.jelly.name": "Świecąca meduza",
    "lakeHazard.rock.name": "Zardzewiała beczka",
    "lakeHazard.current.name": "Prąd",

    // predator
    "predator.shark.name": "Rekin",
    "predator.octopus.name": "Ośmiornica",
    "predator.shadowEel.name": "Węgorz cienia",

    // perk
    "perk.strength.name": "+20% wytrzymałości żyłki",
    "perk.grip.name": "Mocne zacięcie: +30% postępu za stuknięcie",
    "perk.jellyImmune.name": "Meduzy cię ignorują",
    "perk.harpoon.name": "+1 harpun",
    "perk.light.name": "Większy stożek światła",
    "perk.slowEscape.name": "Ryby uciekają o 40% wolniej",
    "perk.tolerance.name": "+60 ms tolerancji rytmu",
    "perk.sink.name": "+30% szybkości opadania",
    "perk.lure.name": "+30% szansy na branie",
    "perk.sharkSlow.name": "Rekin atakuje o 4 s później",
    "perk.rockProof.name": "Skały nie niszczą żyłki",
    "perk.lightDepth.name": "Głębia obciąża o 15% mniej",
    "perk.knot.name": "Węzeł ratunkowy: przeżyjesz pierwsze zerwanie (tracisz połowę ryb)",

    // tip
    "tip.0": "Im głębiej jesteś, tym mocniej ryba obciąża żyłkę. Na głębokości 500 m waży trzy razy tyle.",
    "tip.1": "Gdy z pełną żyłką zejdziesz głębiej, napięcie rośnie nawet bez nowej ryby.",
    "tip.2": "Stukaj, gdy ryba luzuje. Stuknięcie podczas ciągu tylko szarpie żyłkę.",
    "tip.3": "Podczas walki nie wypłyniesz. Zacząć walkę to zobowiązanie.",
    "tip.4": "Dużej ryby nie musisz się bać. Gorzej walczyć z nią, gdy żyłka jest już pełna.",
    "tip.5": "Każda sprzedana ryba obniża popyt na swój gatunek. Spróbuj innej głębokości, pory, pogody.",
    "tip.6": "W burzę na morze wypływa mniej rybaków. Ceny rosną, ale niebezpieczeństwo też.",
    "tip.7": "Meduza na chwilę napina żyłkę. Skała osłabia ją na stałe, aż wypłyniesz.",
    "tip.8": "Rekin zawsze wybiera najcenniejszą rybę. Harpun z Warsztatu go przegoni.",
    "tip.9": "Ośmiornicę strząśniesz, szarpiąc haczykiem na boki.",
    "tip.10": "W Otchłani nie stój w miejscu. Węgorz cienia tylko na to czeka.",
    "tip.11": "Deszcz wabi ryby ku powierzchni.",
    "tip.12": "Mgła podobno przynosi tajemnicze gatunki.",
    "tip.13": "Przy pełni i nowiu pokazują się ryby, których inaczej nie zobaczysz.",
    "tip.14": "Każdy gatunek walczy po swojemu. Gdy zapamiętasz jego rytm, następnego złowisz łatwiej.",
    "tip.15": "Na świecącą przynętę biorą ryby głębinowe. Na robaka tylko drobnica z płycizny.",
    "tip.16": "Za wioską stoi stara elektrownia. Podobno w jej jeziorze pływają ryby o dwóch głowach.",
    "tip.17": "W jądrowym jeziorze nie ma rekinów ani ośmiornic. Za to są zardzewiałe beczki.",

    // tutorial
    "tutorial.sink": "Trzymaj S / lewy przycisk / palec, a haczyk opada.",
    "tutorial.move": "A / D albo mysz: haczyk w lewo i w prawo.",
    "tutorial.bite": "Ryba bierze! Stukaj (spacja / klik), gdy świeci ZIELONE.",
    "tutorial.red": "Przy CZERWONYM nie stukaj. Żyłka by się napięła.",
    "tutorial.up": "Wciśnij klawisz W albo W GÓRĘ, a połów jest bezpieczny.",
    "tutorial.tension": "Łuk u góry pokazuje napięcie. Gdy przekroczy wytrzymałość, żyłka pęknie. ↓×2 = na tej głębokości każda ryba waży dwa razy więcej.",
    "tutorial.again": "Połów jest bezpieczny. Trzymaj S (albo mysz na wodzie), by znów się zanurzyć, albo wróć do Portu.",
    "tutorial.againSnap": "Sprzęt został, żyłka jest nawiązana. Trzymaj S (albo mysz na wodzie), by znów się zanurzyć, albo wróć do Portu.",
    "tutorial.againEmpty": "Trzymaj S (albo mysz na wodzie), by znów się zanurzyć, albo wróć do Portu.",

    // tutorialTouch
    "tutorialTouch.sink": "Trzymaj palec w miejscu, a haczyk opada.",
    "tutorialTouch.move": "Przesuwaj palcem w lewo i w prawo — przy ruchu na boki haczyk nie opada.",
    "tutorialTouch.bite": "Ryba bierze! Stukaj, gdy świeci ZIELONE.",
    "tutorialTouch.up": "Stuknij W GÓRĘ, a połów jest bezpieczny.",
    "tutorialTouch.again": "Połów jest bezpieczny. Trzymaj palec na wodzie, by znów się zanurzyć, albo wróć do Portu.",
    "tutorialTouch.againSnap": "Sprzęt został, żyłka jest nawiązana. Trzymaj palec na wodzie, by znów się zanurzyć, albo wróć do Portu.",
    "tutorialTouch.againEmpty": "Trzymaj palec na wodzie, by znów się zanurzyć, albo wróć do Portu.",

    // unlock
    "unlock.dielna3": "Warsztat: można zbudować poziom 3 — żyłka stalowa",
    "unlock.majak3": "Latarnia: można zbudować poziom 3 — Otchłań i Nieskończona głębia",
    "unlock.legendLine": "Warsztat oferuje Żyłkę legendarną",
    "unlock.trophy": "Trofeum w Akwarium",
    "unlock.ending": "Strażnik otchłani złowiony. Wioska świętuje!",

    // rhythm
    "rhythm.fastRegular.name": "Szybki regularny",
    "rhythm.fastRegular.desc": "Krótkie, równe fazy.",
    "rhythm.regular.name": "Regularny",
    "rhythm.regular.desc": "Spokojna, równa zmiana.",
    "rhythm.slowStrong.name": "Wolny silny",
    "rhythm.slowStrong.desc": "Długie ciągi, krótkie luzy.",
    "rhythm.chaotic.name": "Chaotyczny",
    "rhythm.chaotic.desc": "Losowe długości faz.",
    "rhythm.explosive.name": "Wybuchowy",
    "rhythm.explosive.desc": "Długi spokojny luz, potem gwałtowny krótki ciąg.",
    "rhythm.fakePause.name": "Fałszywe pauzy",
    "rhythm.fakePause.desc": "Zielone na chwilę mignie i od razu zmienia się w czerwone.",
    "rhythm.waves.name": "Fale",
    "rhythm.waves.desc": "Tempo płynnie przyspiesza i zwalnia.",
    "rhythm.playful.name": "Figlarny",
    "rhythm.playful.desc": "Na zmianę szybkie i wolne serie.",
    "rhythm.extremeFast.name": "Ekstremalnie szybki",
    "rhythm.extremeFast.desc": "Błyskawiczne fazy krótsze niż ćwierć sekundy.",
    "rhythm.fakeChaos.name": "Chaos z fałszywymi pauzami",
    "rhythm.fakeChaos.desc": "Losowe długości faz i zielone, które kłamie.",
    "rhythm.slowHuge.name": "Wolny potężny",
    "rhythm.slowHuge.desc": "Wolna walka, bardzo długie ciągi z ogromną siłą.",
    "rhythm.mixA.name": "Mieszanka: szybki i silny",
    "rhythm.mixA.desc": "Na zmianę bloki szybkiego regularnego i wolnego silnego rytmu.",
    "rhythm.mixB.name": "Mieszanka: pauzy i chaos",
    "rhythm.mixB.desc": "Na zmianę fałszywe pauzy i chaotyczne fazy.",
    "rhythm.all.name": "Wszystkie rytmy",
    "rhythm.all.desc": "Co kilka ciągów inny rytm, po kolei wszystkie.",

    // tier
    "tier.maly.name": "mały",
    "tier.maly.tag": "MAŁY",
    "tier.bezny.name": "zwykły",
    "tier.bezny.tag": "ZWYKŁY",
    "tier.velky.name": "duży",
    "tier.velky.tag": "DUŻY OKAZ",
    "tier.trofejny.name": "trofealny",
    "tier.trofejny.tag": "TROFEUM!",
  });
})(globalThis.HL);
