// Preklad hu / data — prekrytie dát (mená rýb, budov, výbavy, svet, tipy, návod, rytmy). Kľúče = src/data/lang/sk/data.js.
//
// SZÓJEGYZÉK (glosár sk → hu) — minden területen ezt használjuk:
//   vlasec → zsinór            prút → bot                háčik → horog            návnada → csali
//   harpúna → szigony          ponor → merülés           úlovok → zsákmány        druh → faj
//   boj (s rybou) → fárasztás  ťuknutie → koppintás      napätie → feszülés       pevnosť → teherbírás
//   prasknutie → szakadás      unikla → leakadt          hladina → felszín        hĺbka → mélység
//   pásmo → zóna               dedina → falu             prístav → Kikötő         rybári → halászok
//   úroveň N → N. szint        vylepšenie → fejlesztés   výbava → felszerelés     úložisko → raktár
//   dopyt → kereslet           objednávka → rendelés     úloha → feladat          stopy → nyomok
//   rebríček → ranglista       výlet → túra              predpoveď → előrejelzés  kus → darab (db)
//   HORE (tlačidlo) → FEL      ŤUKAJ → KOPPINTS          zelená/červená → ZÖLD/PIROS
//   Budovy: Chatrč → Kunyhó, Trhovisko → Piac, Dielňa → Műhely, Návnadáreň → Csalibolt,
//           Meteostanica → Meteoállomás, Maják → Világítótorony, Krčma → Kocsma, Akvárium → Akvárium
//   Pásma:  Plytčina → Sekély, Útesy → Zátony, Súmrak → Alkony, Polnoc → Éjfél,  (krátke: štítky pod lištou dosahu ~33 px drobným)
//           Priepasť → Szakadék, Nekonečná hlbina → pásmo „Végtelen“ (štítok pásma má 37 px drobným),
//           režim/tlačidlo/nadpis „Végtelen mélység“
//   záloha → biztonsági mentés (krátko „mentés“); rytmus → ritmus, fáza → fázis; úder → ütem
//   Jadrové jazero (docs/JAZERO.md):
//           Stará elektráreň → Régi erőmű, Jadrové jazero → Atomtó (more → Tenger), breh → part
//           NA JAZERO → AZ ATOMTÓRA (ako A TENGERRE; „A TÓRA“ by sa vo verzálkach čítalo ako Tóra),
//           BREH (karta na hladine) → PARTRA, Breh (Esc) → Partra, Na breh → A partra
//           Lodenica → Hajóműhely, Laboratórium → Laboratórium, jazerný vlasec/prút → tavi zsinór/bot
//           olovený → ólom- (Ólomzsinór, Ólombot), grafitový → grafit-, zirkóniový → cirkónium-
//           sud → hordó, mutant → mutáns, jadro (reaktora) → reaktormag (krátko „mag“), riadiace tyče → (szabályozó)rudak
//   Pásma jazera: Chladiace jazero → Hűtőtó (krátke: Hűtőtó), Zatopená hala → Elöntött csarnok (krátke: Csarnok),
//           Šachta reaktora → Reaktorakna (krátke: Akna). „Elárasztott csarnok“ sa nezmestí do zóna · hĺbka (110 px).
//   Názov hry HLBINA / Hlbina sa neprekladá (značka). Po číslovke jednotné číslo: „3 hal“.
//   Prípony za {zástupným menom} len tam, kde nezávisia od čísla: {pct}-kal (százalékkal), {time}-kor,
//   {every}-enként (250 m-enként). Časy od/do: „{time} órától“ (nie -tól/-től, tie závisia od čísla).
(function (HL) {
  HL.i18n.add('hu', 'data', {
    // fish
    "fish.sardinka.name": "Szardínia",
    "fish.sardinka.hint": "Mindig és mindenhol kap. Még a sima gilisztára is.",
    "fish.okun.name": "Tengeri sügér",
    "fish.okun.hint": "Nappal a felszín közelében tartózkodik.",
    "fish.krab.name": "Rák",
    "fish.krab.hint": "Csak éjjel mászik elő. A kagylónak nem tud ellenállni.",
    "fish.platesa.name": "Lepényhal",
    "fish.platesa.hint": "A halászok szerint az eső csalja elő.",
    "fish.makrela.name": "Makréla",
    "fish.makrela.hint": "A makrélarajok csak reggel mutatkoznak.",
    "fish.pyskac.name": "Ajakoshal",
    "fish.pyskac.hint": "A zátonyok lakója. Szinte mindig kap.",
    "fish.papagajovka.name": "Papagájhal",
    "fish.papagajovka.hint": "Színes, mint a szivárvány, de csak ha süt a nap.",
    "fish.zubatica.name": "Fogashal",
    "fish.zubatica.hint": "Napnyugtakor vadászik.",
    "fish.murena.name": "Muréna",
    "fish.murena.hint": "Éjjel előbújik a sziklák közül. Kiszámíthatatlanul harcol.",
    "fish.barakuda.name": "Barrakuda",
    "fish.barakuda.hint": "Viharban állítólag mindenre támad, ami mozog.",
    "fish.svetlonoska.name": "Lámpáshal",
    "fish.svetlonoska.hint": "Apró fénypontok a félhomályban. Odalent tele van velük.",
    "fish.treska.name": "Tőkehal",
    "fish.treska.hint": "Amikor köd ül a tengerre, a tőkehal feljebb jön.",
    "fish.uhor.name": "Angolna",
    "fish.uhor.hint": "Éjszakai vadász a félhomályból. Úgy vergődik, mint egy bolond.",
    "fish.tuniak.name": "Tonhal",
    "fish.tuniak.hint": "Nappal a mélyben vonul. Nehéz — vigyázz a zsinórra.",
    "fish.mesacnica.name": "Ezüst holdhal",
    "fish.mesacnica.hint": "Állítólag teliholdkor látták…",
    "fish.lampasnik.name": "Lámpás ördöghal",
    "fish.lampasnik.hint": "Fénypont a teljes sötétben. Ne hagyd, hogy rászedjen.",
    "fish.pazravy.name": "Falánk angolna",
    "fish.pazravy.hint": "Csak akkor éhes, ha nem világít a hold az égen.",
    "fish.raja.name": "Ködös rája",
    "fish.raja.hint": "Mélységi árny, amely a köddel emelkedik.",
    "fish.sklenena.name": "Üveghal",
    "fish.sklenena.hint": "Átlátszó, mint az üveg. Csak a vihar ébreszti fel.",
    "fish.velkoustka.name": "Nagyszájú hal",
    "fish.velkoustka.hint": "Csupa száj. Ott él, ahová a világítótorony sem lát el.",
    "fish.latimeria.name": "Bojtosúszós hal",
    "fish.latimeria.hint": "Élő kövület. Teliholdkor állítólag feljön a szakadékból.",
    "fish.sled.name": "Vándorhering",
    "fish.sled.hint": "Tavasszal hatalmas rajok vonulnak erre.",
    "fish.tekvicovka.name": "Tökhal",
    "fish.tekvicovka.hint": "Narancssárga fénypont az októberi éjszakában.",
    "fish.prizrak.name": "Kísértethal",
    "fish.prizrak.hint": "Ott van, aztán megint nincs. Csak októberben.",

    // legend
    "legend.zlaty_uhor.name": "Aranyangolna",
    "legend.zlaty_uhor.hint": "Reggel, napsütésben állítólag valami aranyosan megcsillan a zátonyok között.",
    "legend.hmlista_dama.name": "Ködös hölgy",
    "legend.hmlista_dama.hint": "Amikor köd van és a hold elbújik, az Éjfél zónában fehér alak jelenik meg.",
    "legend.kral_burky.name": "Viharkirály",
    "legend.kral_burky.hint": "Vihar és telihold egyszerre. Ilyenkor valami óriási ébred a szakadékban.",
    "legend.ladova_velryba.name": "Jégbálna",
    "legend.ladova_velryba.hint": "Csak télen. Olyan mélyen énekel, hogy még a faluban is hallani.",
    "legend.bludicka.name": "Mélységi lidérc",
    "legend.bludicka.hint": "Októberi éj. Fénypont, amely a mélybe csalja a halászokat.",
    "legend.strazca.name": "A szakadék őre",
    "legend.strazca.hint": "A legmélyén valami őrzi a szakadékot. Csak azt engedi magához, aki minden legendát kifogott.",

    // fish (Atomtó)
    "fish.dvojhlavy_kapor.name": "Kétfejű ponty",
    "fish.dvojhlavy_kapor.hint": "Két fej, egy gyomor. Szinte bármire rákap.",
    "fish.svietiaca_plotica.name": "Világító bodorka",
    "fish.svietiaca_plotica.hint": "Éjjel zölden világít. Rajokban úszik.",
    "fish.trojoky_ostriez.name": "Háromszemű sügér",
    "fish.trojoky_ostriez.hint": "Nappal mindhárom szemével a csalit figyeli.",
    "fish.olovena_stuka.name": "Ólomcsuka",
    "fish.olovena_stuka.hint": "Nehéz, mint az ólom. A turbinák között leselkedik.",
    "fish.turbinovy_sumec.name": "Turbinaharcsa",
    "fish.turbinovy_sumec.hint": "Éjjel a turbinák gyomrában heverészik.",
    "fish.hrdzavy_uhor.name": "Rozsdás angolna",
    "fish.hrdzavy_uhor.hint": "Ha esik, előmászik a rozsdás csövekből.",
    "fish.izotopova_mihula.name": "Izotópos ingola",
    "fish.izotopova_mihula.hint": "Úgy világít, hogy még a reaktoraknában is látszik.",
    "fish.grafitova_platesa.name": "Grafitlepényhal",
    "fish.grafitova_platesa.hint": "Viharban leválik az akna betonfenekéről.",

    // legend (Atomtó)
    "legend.atomovy_sumec.name": "Atomharcsa",
    "legend.atomovy_sumec.hint": "Esős éjszakán a reaktormag ragyog a legfényesebben. Valami nagy alszik mellette.",

    // line
    "line.hemp.name": "Kenderzsinór",
    "line.nylon.name": "Nejlonzsinór",
    "line.braided.name": "Fonott zsinór",
    "line.steel.name": "Acélzsinór",
    "line.legend.name": "Legendás zsinór",

    // rod
    "rod.bamboo.name": "Bambuszbot",
    "rod.fiber.name": "Üvegszálas bot",
    "rod.carbon.name": "Karbonbot",
    "rod.master.name": "Mesterbot",

    // line (Atomtó — Laboratórium)
    "line.lead.name": "Ólomzsinór",
    "line.graphite.name": "Grafitzsinór",
    "line.zirconium.name": "Cirkóniumzsinór",

    // rod (Atomtó — Laboratórium)
    "rod.lead_rod.name": "Ólombot",
    "rod.graphite_rod.name": "Grafitbot",
    "rod.zirconium_rod.name": "Cirkóniumbot",

    // hook
    "hook.basic.name": "Egyszerű horog",
    "hook.barbed.name": "Szakállas horog",
    "hook.circle.name": "Körhorog",
    "hook.titan.name": "Titánhorog",

    // harpoon
    "harpoon.name": "Szigony",

    // bait
    "bait.worm.name": "Giliszta",
    "bait.worm.desc": "Kis halak a sekélyben",
    "bait.worm.lakeDesc": "Felszín közeli halak",
    "bait.shell.name": "Kagylódarabok",
    "bait.shell.desc": "Zátonyhalak, rákok",
    "bait.shell.lakeDesc": "Angolnák és pontyok",
    "bait.squid.name": "Tintahal",
    "bait.squid.desc": "Ragadozó és közepes halak",
    "bait.glow.name": "Világító csali",
    "bait.glow.desc": "Mélységi halak",
    "bait.glow.lakeDesc": "Reaktorakna halai",
    "bait.gold.name": "Aranycsali",
    "bait.gold.desc": "Nagyobb esély a legendákra",

    // building
    "building.chatrc.name": "Kunyhó",
    "building.chatrc.level.0": "Düledező kunyhó",
    "building.chatrc.level.1": "Alvás: ugrás reggelre vagy éjjelre",
    "building.chatrc.level.2": "Nagyobb halraktár",
    "building.chatrc.level.3": "Otthonos ház (dísz)",
    "building.trhovisko.name": "Piac",
    "building.trhovisko.level.0": "—",
    "building.trhovisko.level.1": "Halak eladása, árak és nagy kereslet",
    "building.trhovisko.level.2": "3 napos árgrafikon",
    "building.trhovisko.level.3": "Kereskedők rendelései bónusszal",
    "building.dielna.name": "Műhely",
    "building.dielna.level.0": "—",
    "building.dielna.level.1": "Alap zsinórok, botok és horgok",
    "building.dielna.level.2": "Haladó felszerelés és szigonyok",
    "building.dielna.level.3": "Acél- és legendás zsinór",
    "building.navnadaren.name": "Csalibolt",
    "building.navnadaren.level.0": "Üres bódé",
    "building.navnadaren.level.1": "Kagylódarabok",
    "building.navnadaren.level.2": "Tintahal",
    "building.navnadaren.level.3": "Világító csali",
    "building.meteostanica.name": "Meteoállomás",
    "building.meteostanica.level.0": "Semmi — csak az ég látványa",
    "building.meteostanica.level.1": "6 órás előrejelzés",
    "building.meteostanica.level.2": "24 órás előrejelzés",
    "building.meteostanica.level.3": "3 napos előrejelzés és holdfázis",
    "building.majak.name": "Világítótorony",
    "building.majak.level.0": "Kialudt torony",
    "building.majak.level.1": "Jobb látás éjjel",
    "building.majak.level.2": "Látás az Éjfél zónában",
    "building.majak.level.3": "Nyitja: Szakadék, Végtelen mélység",
    "building.krcma.name": "Kocsma",
    "building.krcma.level.0": "Bedeszkázott ablakok",
    "building.krcma.level.1": "A halászok tippeket mesélnek",
    "building.krcma.level.2": "Feladatok a halászoktól",
    "building.krcma.level.3": "Legendák nyomai és aranycsali",
    "building.akvarium.name": "Akvárium",
    "building.akvarium.level.0": "Építési terület",
    "building.akvarium.level.1": "Kiállított halak",
    "building.akvarium.level.2": "Turisták: kis passzív bevétel",
    "building.akvarium.level.3": "Legendák trófeái",
    "building.lodenica.name": "Hajóműhely",
    "building.lodenica.level.0": "Felborult csónak",
    "building.lodenica.level.1": "Páncélcsónak: tó és csarnok",
    "building.lodenica.level.2": "Ólomburkolat: Reaktorakna",
    "building.lodenica.level.3": "Merülőketrec: a reaktormagig",
    "building.laboratorium.name": "Laboratórium",
    "building.laboratorium.level.0": "Lezárt konténer",
    "building.laboratorium.level.1": "Ólomzsinór és -bot",
    "building.laboratorium.level.2": "Grafitzsinór és -bot",
    "building.laboratorium.level.3": "Cirkóniumzsinór és -bot",

    // zone
    "zone.plytcina.name": "Sekély",
    "zone.plytcina.desc": "Fény, olcsó halak, medúzák",
    "zone.utesy.name": "Zátony",
    "zone.utesy.desc": "Színes halak, sziklák",
    "zone.sumrak.name": "Alkony",
    "zone.sumrak.desc": "Félhomály, első ragadozók",
    "zone.polnoc.name": "Éjfél",
    "zone.polnoc.desc": "Sötétség, világító halak",
    "zone.priepast.name": "Szakadék",
    "zone.priepast.desc": "Teljes sötétség, legendák",
    "zone.nekonecna.name": "Végtelen",
    "zone.nekonecna.desc": "Ide még senki sem úszott le",
    "zone.chladiace.name": "Hűtőtó",
    "zone.chladiace.desc": "Meleg zöld víz, első mutánsok",
    "zone.chladiace.short": "Hűtőtó",
    "zone.hala.name": "Elöntött csarnok",
    "zone.hala.desc": "Turbinák, pallók, rozsdás hordók",
    "zone.hala.short": "Csarnok",
    "zone.sachta.name": "Reaktorakna",
    "zone.sachta.desc": "Beton, rudak, a mag kék fénye",
    "zone.sachta.short": "Akna",

    // location
    "location.more.name": "Tenger",
    "location.jadro.name": "Atomtó",

    // period
    "period.morning.name": "Reggel",
    "period.day.name": "Nappal",
    "period.evening.name": "Este",
    "period.night.name": "Éjjel",

    // weather
    "weather.sun.name": "Napos",
    "weather.cloudy.name": "Felhős",
    "weather.rain.name": "Eső",
    "weather.fog.name": "Köd",
    "weather.storm.name": "Vihar",

    // moon
    "moon.0": "Újhold",
    "moon.1": "Növő sarló",
    "moon.2": "Első negyed",
    "moon.3": "Növő hold",
    "moon.4": "Telihold",
    "moon.5": "Fogyó hold",
    "moon.6": "Utolsó negyed",
    "moon.7": "Fogyó sarló",

    // event
    "event.spring.name": "Tavaszi vándorlás",
    "event.spring.desc": "Vándorló halrajok, egyes fajok dupla áron",
    "event.summer.name": "Nyári fesztivál",
    "event.summer.desc": "Horgászverseny a faluban: a nap legnehezebb hala",
    "event.halloween.name": "Halloweeni mélység",
    "event.halloween.desc": "Kísérteties halak, sötétebb tenger, szezonális legenda",
    "event.winter.name": "Téli halászat",
    "event.winter.desc": "Jégbálna, befagyott felszín, karácsonyi falu",

    // cond
    "cond.any": "Bármikor",
    "cond.morning": "Reggel",
    "cond.day": "Nappal",
    "cond.evening": "Este",
    "cond.night": "Éjjel",
    "cond.sun": "Napos",
    "cond.cloudy": "Felhős",
    "cond.rain": "Eső",
    "cond.fog": "Köd",
    "cond.storm": "Vihar",
    "cond.fullmoon": "Telihold",
    "cond.newmoon": "Újhold",
    "cond.spring": "Tavaszi vándorlás",
    "cond.summer": "Nyári fesztivál",
    "cond.halloween": "Halloween",
    "cond.winter": "Téli halászat",
    "cond.guardian": "Világítótorony 3 és minden legenda",

    // hazard
    "hazard.jelly.name": "Medúza",
    "hazard.rock.name": "Éles szikla",
    "hazard.current.name": "Áramlat",

    // lakeHazard
    "lakeHazard.jelly.name": "Világító medúza",
    "lakeHazard.rock.name": "Rozsdás hordó",
    "lakeHazard.current.name": "Áramlat",

    // predator
    "predator.shark.name": "Cápa",
    "predator.octopus.name": "Polip",
    "predator.shadowEel.name": "Árnyangolna",

    // perk
    "perk.strength.name": "+20% zsinórerő",
    "perk.grip.name": "Erős bevágás: +30% haladás koppintásonként",
    "perk.jellyImmune.name": "A medúzák nem bántanak",
    "perk.harpoon.name": "+1 szigony",
    "perk.light.name": "Nagyobb fénykúp",
    "perk.slowEscape.name": "A halak 40%-kal lassabban szöknek",
    "perk.tolerance.name": "+60 ms ritmustűrés",
    "perk.sink.name": "+30% süllyedési sebesség",
    "perk.lure.name": "+30% esély a kapásra",
    "perk.sharkSlow.name": "A cápa 4 mp-cel később támad",
    "perk.rockProof.name": "A sziklák nem sértik a zsinórt",
    "perk.lightDepth.name": "A mélység 15%-kal kevésbé terhel",
    "perk.knot.name": "Mentőcsomó: az első szakadást túléled (a zsákmány fele odavész)",

    // tip
    "tip.0": "Minél mélyebben vagy, annál jobban terheli a hal a zsinórt. 500 méteren háromszor annyit nyom.",
    "tip.1": "Ha teli zsinórral mélyebbre süllyedsz, a feszülés új hal nélkül is nő.",
    "tip.2": "Akkor koppints, amikor a hal enged. Húzás közben a koppintás csak megrántja a zsinórt.",
    "tip.3": "Fárasztás közben nem mehetsz fel. Aki belekezd, annak végig kell csinálnia.",
    "tip.4": "A nagy haltól nem kell félned. Rosszabb, ha akkor fárasztod, amikor a zsinór már tele van.",
    "tip.5": "Minden eladott hal csökkenti a faja iránti keresletet. Próbálj más mélységet, időt, időjárást.",
    "tip.6": "Viharban kevesebb halász megy ki a tengerre. Az árak nőnek, de a veszély is.",
    "tip.7": "A medúza egy időre megfeszíti a zsinórt. A szikla tartósan gyengíti, amíg fel nem jössz.",
    "tip.8": "A cápa mindig a legértékesebb halat választja. A Műhely szigonya elűzi.",
    "tip.9": "A polipot úgy rázod le, hogy a horgot oldalról oldalra rángatod.",
    "tip.10": "A Szakadékban ne állj egy helyben. Az árnyangolna épp erre vár.",
    "tip.11": "Az eső a felszínre csalja a halakat.",
    "tip.12": "A köd állítólag titokzatos fajokat hoz.",
    "tip.13": "Teliholdkor és újholdkor olyan halak jönnek elő, amilyeneket máskor nem látsz.",
    "tip.14": "Minden faj a maga módján harcol. Ha megjegyzed a ritmusát, a következőt könnyebben kifogod.",
    "tip.15": "A világító csalira mélységi halak kapnak. A gilisztára csak apró halak a sekélyben.",
    "tip.16": "A falu mögött áll a régi erőmű. Azt beszélik, a tavában kétfejű halak úszkálnak.",
    "tip.17": "Az atomtóban nincs se cápa, se polip. Rozsdás hordó viszont annál több.",

    // tutorial
    "tutorial.sink": "Tartsd lenyomva az S-t / a bal gombot / az ujjad, és a horog süllyed.",
    "tutorial.move": "A / D vagy egér: a horog balra és jobbra.",
    "tutorial.bite": "A hal ráharapott! Koppints (szóköz / kattintás), amikor ZÖLD a fény.",
    "tutorial.red": "PIROS alatt ne koppints. A zsinór megfeszülne.",
    "tutorial.up": "Nyomd meg a W-t vagy a FEL gombot, és a zsákmány biztonságban van.",
    "tutorial.tension": "A felső ív a feszülést mutatja. Ha túllépi a teherbírást, a zsinór elszakad. ↓×2 = ebben a mélységben minden hal kétszer annyit nyom.",
    "tutorial.again": "A zsákmány biztonságban. Tartsd lenyomva az S-t (vagy az egeret a vízen), és újra lemerülsz, vagy térj vissza a Kikötőbe.",
    "tutorial.againSnap": "A felszerelés megmaradt, a zsinórt újrakötötted. Tartsd lenyomva az S-t (vagy az egeret a vízen), és újra lemerülsz, vagy térj vissza a Kikötőbe.",
    "tutorial.againEmpty": "Tartsd lenyomva az S-t (vagy az egeret a vízen), és újra lemerülsz, vagy térj vissza a Kikötőbe.",

    // tutorialTouch
    "tutorialTouch.sink": "Tartsd az ujjad egy helyben, és a horog süllyed.",
    "tutorialTouch.move": "Húzd az ujjad balra és jobbra — oldalra húzás közben a horog nem süllyed.",
    "tutorialTouch.bite": "A hal ráharapott! Koppints, amikor ZÖLD a fény.",
    "tutorialTouch.up": "Koppints a FEL gombra, és a zsákmány biztonságban van.",
    "tutorialTouch.again": "A zsákmány biztonságban. Tartsd az ujjad a vízen, és újra lemerülsz, vagy térj vissza a Kikötőbe.",
    "tutorialTouch.againSnap": "A felszerelés megmaradt, a zsinórt újrakötötted. Tartsd az ujjad a vízen, és újra lemerülsz, vagy térj vissza a Kikötőbe.",
    "tutorialTouch.againEmpty": "Tartsd az ujjad a vízen, és újra lemerülsz, vagy térj vissza a Kikötőbe.",

    // unlock
    "unlock.dielna3": "A Műhely megépítheti a 3. szintet — acélzsinór",
    "unlock.majak3": "A Világítótorony megépítheti a 3. szintet — Szakadék és Végtelen mélység",
    "unlock.legendLine": "A Műhely Legendás zsinórt kínál",
    "unlock.trophy": "Trófea az Akváriumban",
    "unlock.ending": "A szakadék őre horogra akadt. A falu ünnepel!",

    // rhythm
    "rhythm.fastRegular.name": "Gyors egyenletes",
    "rhythm.fastRegular.desc": "Rövid, egyforma fázisok.",
    "rhythm.regular.name": "Egyenletes",
    "rhythm.regular.desc": "Nyugodt, egyenletes váltakozás.",
    "rhythm.slowStrong.name": "Lassú erős",
    "rhythm.slowStrong.desc": "Hosszú húzások, rövid engedések.",
    "rhythm.chaotic.name": "Kaotikus",
    "rhythm.chaotic.desc": "Véletlen hosszú fázisok.",
    "rhythm.explosive.name": "Robbanékony",
    "rhythm.explosive.desc": "Hosszú, nyugodt engedés, aztán heves, rövid húzás.",
    "rhythm.fakePause.name": "Álszünetek",
    "rhythm.fakePause.desc": "A zöld egy pillanatra felvillan, és rögtön pirosra vált.",
    "rhythm.waves.name": "Hullámok",
    "rhythm.waves.desc": "A tempó folyamatosan gyorsul és lassul.",
    "rhythm.playful.name": "Játékos",
    "rhythm.playful.desc": "Gyors és lassú sorozatok váltakoznak.",
    "rhythm.extremeFast.name": "Extrém gyors",
    "rhythm.extremeFast.desc": "Villámgyors fázisok, negyed másodpercnél is rövidebbek.",
    "rhythm.fakeChaos.name": "Csalóka káosz",
    "rhythm.fakeChaos.desc": "Véletlen hosszú fázisok és egy zöld, amely hazudik.",
    "rhythm.slowHuge.name": "Lassú óriás",
    "rhythm.slowHuge.desc": "Lassú fárasztás, nagyon hosszú húzások óriási erővel.",
    "rhythm.mixA.name": "Gyors és erős",
    "rhythm.mixA.desc": "Gyors egyenletes és lassú erős ritmus blokkjai váltakoznak.",
    "rhythm.mixB.name": "Álszünet és káosz",
    "rhythm.mixB.desc": "Álszünetek és kaotikus fázisok váltakoznak.",
    "rhythm.all.name": "Mind egyben",
    "rhythm.all.desc": "Néhány húzásonként más ritmus, sorra mind.",

    // tier
    "tier.maly.name": "kicsi",
    "tier.maly.tag": "KICSI",
    "tier.bezny.name": "átlagos",
    "tier.bezny.tag": "ÁTLAGOS",
    "tier.velky.name": "nagy",
    "tier.velky.tag": "NAGY HAL",
    "tier.trofejny.name": "trófeás",
    "tier.trofejny.tag": "TRÓFEA!",
  });
})(globalThis.HL);
