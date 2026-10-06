// Čeština — prekrytie dát (mená rýb, budov, výbavy, sveta, tipy, návod…). Kľúče = src/data/lang/sk/data.js
// (vygenerovaný zdroj); pravidlá docs/I18N.md. Názov hry HLBINA/Hlbina sa neprekladá (značka).
//
// GLOSÁR (sk → cs) — drž sa ho vo všetkých 13 súboroch:
//   dedina → vesnice · Prístav → Přístav · Chatrč → Chatrč (ž.) · Trhovisko → Tržiště (s.) · Dielňa → Dílna (ž.)
//   Návnadáreň → Návnadárna (ž.) · Meteostanica → Meteostanice (ž.) · Maják → Maják (m.) · Krčma → Hospoda (ž.)
//   Akvárium → Akvárium (s.) · úložisko → sklad
//   Pásma: Plytčina → Mělčina · Útesy → Útesy · Súmrak → Soumrak · Polnoc → Půlnoc · Priepasť → Propast
//          Nekonečná hlbina → Nekonečná hlubina (režim; značka HLBINA ostáva)
//   vlasec → vlasec · prút → prut · háčik → háček · harpúna → harpuna · návnada → návnada · červík → žížala
//   kalamár → oliheň · výbava → výbava · úlovok → úlovek · ponor → ponor · hĺbka → hloubka
//   napätie → napětí · pevnosť → pevnost · prasknutie → prasknutí · PRASKOL → PRASKL · zaseknutie → zaseknutí
//   ťukať / ťuknutie / ťuk → ťukat / ťuknutí / ťuk · ťah / povolí → tah / povolí · HORE (tlačidlo) → NAHORU
//   dopyt → poptávka · objednávka → objednávka · rebríček → žebříček · vylepšenie → vylepšení · úloha → úkol
//   stopa → stopa · legenda → legenda · trofej → trofej · predpoveď → předpověď · počasie → počasí
//   spln / nov → úplněk / nov · udalosť → událost · súťaž → soutěž · výhra → výhra · odmena → odměna
//   Ryby: sardinka, mořský okoun, krab, platýs, makrela, pyskoun, ploskozubec (papagájovka), pražma (zubatica),
//         muréna, barakuda, lampovník (svetlonoska), treska, úhoř, tuňák, stříbrný měsíčník, ďas s lucernou,
//         žravý úhoř, mlžný rejnok, skleněná ryba, hltoun (veľkoústka), latimérie, tažný sleď, dýňovka, přízračná ryba
//   Jadrové jazero (docs/JAZERO.md):
//     Stará elektráreň → Stará elektrárna · Jadrové jazero → Jaderné jezero · jadro → jádro · More (miesto) → Moře
//     Lodenica → Loděnice (ž., akuz. Loděnici) · Laboratórium → Laboratoř (ž., akuz. Laboratoř, z Laboratoře)
//     jazerný vlasec / prút → jezerní vlasec / prut · olovený → olověný · grafitový → grafitový · zirkóniový → zirkoniový
//     Pásma: Chladiace jazero → Chladicí jezero (krátko Jezero) · Zatopená hala → Zatopená hala (Hala)
//            · Šachta reaktora → Šachta reaktoru (Šachta) · riadiace tyče → řídicí tyče
//     hrdzavý sud → rezavý sud · Breh / BREH → Břeh / BŘEH · Na breh → Na břeh · NA JAZERO → NA JEZERO
//     Ryby: dvouhlavý kapr, svítící plotice, tříoký okoun (ostriež), olověná štika, turbínový sumec, rezavý úhoř,
//           izotopová mihule, grafitový platýs (platesa — m. rod ako Platýs); legenda Atomový sumec
//   Oslovenie: tykanie, mužský rod ako v slovenčine (Ztratil jsi, Vyhrál jsi).
(function (HL) {
  HL.i18n.add('cs', 'data', {
    // fish
    "fish.sardinka.name": "Sardinka",
    "fish.sardinka.hint": "Ta se chytí vždycky a všude. I na obyčejnou žížalu.",
    "fish.okun.name": "Mořský okoun",
    "fish.okun.hint": "Přes den se drží u hladiny.",
    "fish.krab.name": "Krab",
    "fish.krab.hint": "Vylézá až v noci. Mušlím neodolá.",
    "fish.platesa.name": "Platýs",
    "fish.platesa.hint": "Rybáři říkají, že ho vyhání déšť.",
    "fish.makrela.name": "Makrela",
    "fish.makrela.hint": "Hejna makrel se ukazují jen ráno.",
    "fish.pyskac.name": "Pyskoun",
    "fish.pyskac.hint": "Obyvatel útesů. Bere skoro vždycky.",
    "fish.papagajovka.name": "Ploskozubec",
    "fish.papagajovka.hint": "Barevný jako duha, ale jen když svítí slunce.",
    "fish.zubatica.name": "Pražma",
    "fish.zubatica.hint": "Loví, když slunce zapadá.",
    "fish.murena.name": "Muréna",
    "fish.murena.hint": "V noci vylézá ze skal. Bojuje nevyzpytatelně.",
    "fish.barakuda.name": "Barakuda",
    "fish.barakuda.hint": "Za bouřky prý útočí na všechno, co se hýbe.",
    "fish.svetlonoska.name": "Lampovník",
    "fish.svetlonoska.hint": "Drobná světýlka v šeru. Je jich tam dole plno.",
    "fish.treska.name": "Treska",
    "fish.treska.hint": "Když se nad mořem valí mlha, treska stoupá.",
    "fish.uhor.name": "Úhoř",
    "fish.uhor.hint": "Noční lovec ze šera. Mrská sebou jako šílený.",
    "fish.tuniak.name": "Tuňák",
    "fish.tuniak.hint": "Přes den táhne v hloubce. Těžký — dej si pozor na vlasec.",
    "fish.mesacnica.name": "Stříbrný měsíčník",
    "fish.mesacnica.hint": "Prý ho viděli za úplňku…",
    "fish.lampasnik.name": "Ďas s lucernou",
    "fish.lampasnik.hint": "Světýlko v naprosté tmě. Nenech se jím oklamat.",
    "fish.pazravy.name": "Žravý úhoř",
    "fish.pazravy.hint": "Hladový je jen tehdy, když na nebi nesvítí měsíc.",
    "fish.raja.name": "Mlžný rejnok",
    "fish.raja.hint": "Hlubinný stín, který se zvedá s mlhou.",
    "fish.sklenena.name": "Skleněná ryba",
    "fish.sklenena.hint": "Průhledná jako sklo. Probouzí ji až bouřka.",
    "fish.velkoustka.name": "Hltoun",
    "fish.velkoustka.hint": "Samá tlama. Žije tam, kam nedohlédne ani maják.",
    "fish.latimeria.name": "Latimérie",
    "fish.latimeria.hint": "Živoucí fosilie. Za úplňku prý vystupuje z propasti.",
    "fish.sled.name": "Tažný sleď",
    "fish.sled.hint": "Na jaře tudy táhnou obrovská hejna.",
    "fish.tekvicovka.name": "Dýňovka",
    "fish.tekvicovka.hint": "Oranžové světýlko v říjnové noci.",
    "fish.prizrak.name": "Přízračná ryba",
    "fish.prizrak.hint": "Je tam, a pak zase není. Jen v říjnu.",

    // legend
    "legend.zlaty_uhor.name": "Zlatý úhoř",
    "legend.zlaty_uhor.hint": "Ráno, když je slunečno, se prý mezi útesy něco zlatavě zablýskne.",
    "legend.hmlista_dama.name": "Mlžná dáma",
    "legend.hmlista_dama.hint": "Když je mlha a měsíc se schová, v Půlnoci se zjevuje bílá postava.",
    "legend.kral_burky.name": "Král bouře",
    "legend.kral_burky.hint": "Bouřka a úplněk najednou. Tehdy se v propasti probouzí něco obrovského.",
    "legend.ladova_velryba.name": "Ledová velryba",
    "legend.ladova_velryba.hint": "Jen v zimě. Zpívá tak hluboko, že ji je slyšet až ve vesnici.",
    "legend.bludicka.name": "Bludička hlubin",
    "legend.bludicka.hint": "Říjnová noc. Světýlko, které láká rybáře do hlubin.",
    "legend.strazca.name": "Strážce propasti",
    "legend.strazca.hint": "Na samém dně něco střeží propast. Pustí k sobě jen toho, kdo chytil všechny legendy.",

    // fish (Jaderné jezero — mutanti)
    "fish.dvojhlavy_kapor.name": "Dvouhlavý kapr",
    "fish.dvojhlavy_kapor.hint": "Dvě hlavy, jeden žaludek. Vezme skoro cokoli.",
    "fish.svietiaca_plotica.name": "Svítící plotice",
    "fish.svietiaca_plotica.hint": "V noci svítí nazeleno. Plave v hejnech.",
    "fish.trojoky_ostriez.name": "Tříoký okoun",
    "fish.trojoky_ostriez.hint": "Přes den sleduje návnadu všemi třemi očima.",
    "fish.olovena_stuka.name": "Olověná štika",
    "fish.olovena_stuka.hint": "Těžká jako olovo. Číhá mezi turbínami.",
    "fish.turbinovy_sumec.name": "Turbínový sumec",
    "fish.turbinovy_sumec.hint": "V noci se vyvaluje v útrobách turbín.",
    "fish.hrdzavy_uhor.name": "Rezavý úhoř",
    "fish.hrdzavy_uhor.hint": "Když prší, vylézá z rezavých rour.",
    "fish.izotopova_mihula.name": "Izotopová mihule",
    "fish.izotopova_mihula.hint": "Svítí tak, že ji je vidět i v šachtě reaktoru.",
    "fish.grafitova_platesa.name": "Grafitový platýs",
    "fish.grafitova_platesa.hint": "Za bouřky se odlepí od betonového dna šachty.",

    // legend (Jaderné jezero)
    "legend.atomovy_sumec.name": "Atomový sumec",
    "legend.atomovy_sumec.hint": "Za deštivé noci jádro září nejjasněji. Něco velkého u něj spí.",

    // line
    "line.hemp.name": "Konopný vlasec",
    "line.nylon.name": "Nylonový vlasec",
    "line.braided.name": "Pletený vlasec",
    "line.steel.name": "Ocelový vlasec",
    "line.legend.name": "Legendární vlasec",

    // rod
    "rod.bamboo.name": "Bambusový prut",
    "rod.fiber.name": "Sklolaminátový prut",
    "rod.carbon.name": "Karbonový prut",
    "rod.master.name": "Mistrovský prut",

    // line (jezerní — z Laboratoře)
    "line.lead.name": "Olověný vlasec",
    "line.graphite.name": "Grafitový vlasec",
    "line.zirconium.name": "Zirkoniový vlasec",

    // rod (jezerní — z Laboratoře)
    "rod.lead_rod.name": "Olověný prut",
    "rod.graphite_rod.name": "Grafitový prut",
    "rod.zirconium_rod.name": "Zirkoniový prut",

    // hook
    "hook.basic.name": "Obyčejný háček",
    "hook.barbed.name": "Háček s protihrotem",
    "hook.circle.name": "Kruhový háček",
    "hook.titan.name": "Titanový háček",

    // harpoon
    "harpoon.name": "Harpuna",

    // bait
    "bait.worm.name": "Žížala",
    "bait.worm.desc": "Malé ryby v mělčině",
    "bait.worm.lakeDesc": "Ryby u hladiny",
    "bait.shell.name": "Kousky mušlí",
    "bait.shell.desc": "Útesové ryby, krabi",
    "bait.shell.lakeDesc": "Úhoři a kapři",
    "bait.squid.name": "Oliheň",
    "bait.squid.desc": "Dravé a střední ryby",
    "bait.glow.name": "Svítící návnada",
    "bait.glow.desc": "Hlubinné ryby",
    "bait.glow.lakeDesc": "Ryby šachty reaktoru",
    "bait.gold.name": "Zlatá návnada",
    "bait.gold.desc": "Zvyšuje šanci na legendy",

    // building
    "building.chatrc.name": "Chatrč",
    "building.chatrc.level.0": "Rozpadlá chatrč",
    "building.chatrc.level.1": "Spánek: posun času na ráno nebo na noc",
    "building.chatrc.level.2": "Větší sklad ryb",
    "building.chatrc.level.3": "Útulný domov (kosmetika)",
    "building.trhovisko.name": "Tržiště",
    "building.trhovisko.level.0": "—",
    "building.trhovisko.level.1": "Prodej ryb, ceny a horká poptávka",
    "building.trhovisko.level.2": "Graf cen za 3 dny",
    "building.trhovisko.level.3": "Objednávky obchodníků s bonusem",
    "building.dielna.name": "Dílna",
    "building.dielna.level.0": "—",
    "building.dielna.level.1": "Základní vlasce, pruty a háčky",
    "building.dielna.level.2": "Pokročilá výbava a harpuny",
    "building.dielna.level.3": "Ocelový a legendární vlasec",
    "building.navnadaren.name": "Návnadárna",
    "building.navnadaren.level.0": "Prázdná bouda",
    "building.navnadaren.level.1": "Kousky mušlí",
    "building.navnadaren.level.2": "Oliheň",
    "building.navnadaren.level.3": "Svítící návnada",
    "building.meteostanica.name": "Meteostanice",
    "building.meteostanica.level.0": "Nic — jen pohled na oblohu",
    "building.meteostanica.level.1": "Předpověď na 6 hodin",
    "building.meteostanica.level.2": "Předpověď na 24 hodin",
    "building.meteostanica.level.3": "Předpověď na 3 dny a fáze měsíce",
    "building.majak.name": "Maják",
    "building.majak.level.0": "Zhasnutá věž",
    "building.majak.level.1": "Lepší viditelnost v noci",
    "building.majak.level.2": "Viditelnost v Půlnoci",
    "building.majak.level.3": "Odemyká Propast a Nekonečnou hlubinu",
    "building.krcma.name": "Hospoda",
    "building.krcma.level.0": "Zatlučená okna",
    "building.krcma.level.1": "Rybáři vyprávějí tipy",
    "building.krcma.level.2": "Úkoly od rybářů",
    "building.krcma.level.3": "Stopy k legendám a zlatá návnada",
    "building.akvarium.name": "Akvárium",
    "building.akvarium.level.0": "Staveniště",
    "building.akvarium.level.1": "Vystavené ryby",
    "building.akvarium.level.2": "Turisté: malý pasivní příjem",
    "building.akvarium.level.3": "Trofeje legend",
    "building.lodenica.name": "Loděnice",
    "building.lodenica.level.0": "Převrácený člun",
    "building.lodenica.level.1": "Pancéřová loďka: jezero a hala",
    "building.lodenica.level.2": "Olověný trup: Šachta reaktoru",
    "building.lodenica.level.3": "Ponorná klec: až k jádru",
    "building.laboratorium.name": "Laboratoř",
    "building.laboratorium.level.0": "Zamčený kontejner",
    "building.laboratorium.level.1": "Olověné vlasce a pruty",
    "building.laboratorium.level.2": "Grafitové vlasce a pruty",
    "building.laboratorium.level.3": "Zirkoniové vlasce a pruty",

    // zone
    "zone.plytcina.name": "Mělčina",
    "zone.plytcina.desc": "Světlo, levné ryby, medúzy",
    "zone.utesy.name": "Útesy",
    "zone.utesy.desc": "Barevné ryby, skály",
    "zone.sumrak.name": "Soumrak",
    "zone.sumrak.desc": "Šero, první predátoři",
    "zone.polnoc.name": "Půlnoc",
    "zone.polnoc.desc": "Tma, svítící ryby",
    "zone.priepast.name": "Propast",
    "zone.priepast.desc": "Absolutní tma, legendy",
    "zone.nekonecna.name": "Nekonečná hlubina",
    "zone.nekonecna.desc": "Sem ještě nikdo nedoplaval",
    "zone.chladiace.name": "Chladicí jezero",
    "zone.chladiace.desc": "Teplá zelená voda, první mutanti",
    "zone.chladiace.short": "Jezero",
    "zone.hala.name": "Zatopená hala",
    "zone.hala.desc": "Turbíny, lávky, rezavé sudy",
    "zone.hala.short": "Hala",
    "zone.sachta.name": "Šachta reaktoru",
    // nápis pásma: „300–800 m · " + popis drobným písmom do 170 px; „…, modrá záře jádra" by sa skrátil (178 px)
    "zone.sachta.desc": "Beton, řídicí tyče, modrá záře",
    "zone.sachta.short": "Šachta",

    // location
    "location.more.name": "Moře",
    "location.jadro.name": "Jaderné jezero",

    // period
    "period.morning.name": "Ráno",
    "period.day.name": "Den",
    "period.evening.name": "Večer",
    "period.night.name": "Noc",

    // weather
    "weather.sun.name": "Slunečno",
    "weather.cloudy.name": "Oblačno",
    "weather.rain.name": "Déšť",
    "weather.fog.name": "Mlha",
    "weather.storm.name": "Bouřka",

    // moon
    "moon.0": "Nov",
    "moon.1": "Dorůstající srpek",
    "moon.2": "První čtvrť",
    "moon.3": "Dorůstající měsíc",
    "moon.4": "Úplněk",
    "moon.5": "Ubývající měsíc",
    "moon.6": "Poslední čtvrť",
    "moon.7": "Ubývající srpek",

    // event
    "event.spring.name": "Jarní migrace",
    "event.spring.desc": "Hejna tažných ryb, dvojnásobné ceny vybraných druhů",
    "event.summer.name": "Letní festival",
    "event.summer.desc": "Rybářská soutěž ve vesnici: nejtěžší ryba dne",
    "event.halloween.name": "Halloweenská hlubina",
    "event.halloween.desc": "Strašidelné ryby, tmavší moře, sezónní legenda",
    "event.winter.name": "Zimní lov",
    "event.winter.desc": "Ledová velryba, zamrzlá hladina, vánoční vesnice",

    // cond
    "cond.any": "Kdykoli",
    "cond.morning": "Ráno",
    "cond.day": "Den",
    "cond.evening": "Večer",
    "cond.night": "Noc",
    "cond.sun": "Slunečno",
    "cond.cloudy": "Oblačno",
    "cond.rain": "Déšť",
    "cond.fog": "Mlha",
    "cond.storm": "Bouřka",
    "cond.fullmoon": "Úplněk",
    "cond.newmoon": "Nov",
    "cond.spring": "Jarní migrace",
    "cond.summer": "Letní festival",
    "cond.halloween": "Halloween",
    "cond.winter": "Zimní lov",
    "cond.guardian": "Maják 3 a všechny legendy",

    // hazard
    "hazard.jelly.name": "Medúza",
    "hazard.rock.name": "Ostrá skála",
    "hazard.current.name": "Proud",

    // lakeHazard
    "lakeHazard.jelly.name": "Svítící medúza",
    "lakeHazard.rock.name": "Rezavý sud",
    "lakeHazard.current.name": "Proud",

    // predator
    "predator.shark.name": "Žralok",
    "predator.octopus.name": "Chobotnice",
    "predator.shadowEel.name": "Stínový úhoř",

    // perk
    "perk.strength.name": "+20 % pevnost vlasce",
    "perk.grip.name": "Pevné zaseknutí: +30 % postup za ťuknutí",
    "perk.jellyImmune.name": "Medúzy tě ignorují",
    "perk.harpoon.name": "+1 harpuna",
    "perk.light.name": "Větší kužel světla",
    "perk.slowEscape.name": "Ryby unikají o 40 % pomaleji",
    "perk.tolerance.name": "+60 ms tolerance rytmu",
    "perk.sink.name": "+30 % rychlost klesání",
    "perk.lure.name": "+30 % šance na záběr",
    "perk.sharkSlow.name": "Žralok útočí o 4 s později",
    "perk.rockProof.name": "Skály nepoškozují vlasec",
    "perk.lightDepth.name": "Hloubka zatěžuje o 15 % méně",
    "perk.knot.name": "Záchranný uzel: první prasknutí přežiješ (ztratíš polovinu úlovku)",

    // tip
    "tip.0": "Čím hlouběji jsi, tím víc ryba zatíží vlasec. V 500 metrech váží trojnásobek.",
    "tip.1": "Když s plným vlascem klesneš hlouběji, napětí roste i bez nové ryby.",
    "tip.2": "Ťukej, když ryba povolí. Ťuknutí během tahu jen škubne vlascem.",
    "tip.3": "Dokud bojuješ, nahoru se nedostaneš. Začít boj je závazek.",
    "tip.4": "Velké ryby se bát nemusíš. Horší je bojovat s ní, když už máš vlasec plný.",
    "tip.5": "Každá prodaná ryba sníží svou poptávku. Zkus jinou hloubku, jiný čas, jiné počasí.",
    "tip.6": "Za bouřky vyráží na moře méně rybářů. Ceny jdou nahoru, ale i nebezpečí.",
    "tip.7": "Medúza vlasec na chvíli napne. Skála ho natrvalo oslabí, dokud nevyplaveš nahoru.",
    "tip.8": "Žralok si vždycky vybere tu nejcennější rybu. Harpuna z Dílny ho zažene.",
    "tip.9": "Chobotnici ze sebe setřeseš škubáním háčku ze strany na stranu.",
    "tip.10": "V Propasti nezůstávej stát. Stínový úhoř čeká právě na to.",
    "tip.11": "Déšť láká ryby k hladině.",
    "tip.12": "Mlha prý přináší tajemné druhy.",
    "tip.13": "Za úplňku a za novu se ukazují ryby, které jinak neuvidíš.",
    "tip.14": "Každý druh bojuje po svém. Když si zapamatuješ jeho rytmus, dalšího chytíš snáz.",
    "tip.15": "Na svítící návnadu berou hlubinné ryby. Na žížalu jen drobné rybky v mělčině.",
    "tip.16": "Za vesnicí stojí stará elektrárna. Prý v jejím jezeře plavou ryby se dvěma hlavami.",
    "tip.17": "V jaderném jezeře nejsou žraloci ani chobotnice. Zato rezavé sudy ano.",

    // tutorial
    "tutorial.sink": "Drž S / levé tlačítko / prst a háček klesá.",
    "tutorial.move": "A / D nebo myš: háček doleva a doprava.",
    "tutorial.bite": "Ryba zabrala! Ťukej (mezerník / klik), když svítí ZELENÁ.",
    "tutorial.red": "Během ČERVENÉ neťukej. Vlasec by se napnul.",
    "tutorial.up": "Stiskni W nebo NAHORU a úlovek je v bezpečí.",
    "tutorial.tension": "Oblouk nahoře ukazuje napětí. Když překročí pevnost, vlasec praskne. ↓×2 = v této hloubce váží každá ryba dvakrát víc.",
    "tutorial.again": "Úlovek je v bezpečí. Drž S (nebo myš na vodě) a ponoříš se znovu, nebo se vrať do Přístavu.",
    "tutorial.againSnap": "Výbava zůstala, vlasec je navázaný. Drž S (nebo myš na vodě) a ponoříš se znovu, nebo se vrať do Přístavu.",
    "tutorial.againEmpty": "Drž S (nebo myš na vodě) a ponoříš se znovu, nebo se vrať do Přístavu.",

    // tutorialTouch
    "tutorialTouch.sink": "Drž prst na místě a háček klesá.",
    "tutorialTouch.move": "Táhni prstem doleva a doprava — při tažení do stran háček neklesá.",
    "tutorialTouch.bite": "Ryba zabrala! Ťukej, když svítí ZELENÁ.",
    "tutorialTouch.up": "Ťukni na NAHORU a úlovek je v bezpečí.",
    "tutorialTouch.again": "Úlovek je v bezpečí. Drž prst na vodě a ponoříš se znovu, nebo se vrať do Přístavu.",
    "tutorialTouch.againSnap": "Výbava zůstala, vlasec je navázaný. Drž prst na vodě a ponoříš se znovu, nebo se vrať do Přístavu.",
    "tutorialTouch.againEmpty": "Drž prst na vodě a ponoříš se znovu, nebo se vrať do Přístavu.",

    // unlock
    "unlock.dielna3": "Dílna může postavit úroveň 3 — ocelový vlasec",
    "unlock.majak3": "Maják může postavit úroveň 3 — Propast a Nekonečná hlubina",
    "unlock.legendLine": "Dílna nabízí Legendární vlasec",
    "unlock.trophy": "Trofej v Akváriu",
    "unlock.ending": "Strážce propasti je chycen. Vesnice slaví!",

    // rhythm
    "rhythm.fastRegular.name": "Rychlý pravidelný",
    "rhythm.fastRegular.desc": "Krátké stejné fáze.",
    "rhythm.regular.name": "Pravidelný",
    "rhythm.regular.desc": "Klidné, rovnoměrné střídání.",
    "rhythm.slowStrong.name": "Pomalý silný",
    "rhythm.slowStrong.desc": "Dlouhé tahy, krátká povolení.",
    "rhythm.chaotic.name": "Chaotický",
    "rhythm.chaotic.desc": "Náhodné délky fází.",
    "rhythm.explosive.name": "Výbušný",
    "rhythm.explosive.desc": "Dlouhé klidné povolení, pak prudký krátký tah.",
    "rhythm.fakePause.name": "Falešné pauzy",
    "rhythm.fakePause.desc": "Zelená na chvíli blikne a hned se změní na červenou.",
    "rhythm.waves.name": "Vlny",
    "rhythm.waves.desc": "Tempo se plynule zrychluje a zpomaluje.",
    "rhythm.playful.name": "Hravý",
    "rhythm.playful.desc": "Střídání rychlých a pomalých sérií.",
    "rhythm.extremeFast.name": "Extrémně rychlý",
    "rhythm.extremeFast.desc": "Bleskové fáze kratší než čtvrt sekundy.",
    "rhythm.fakeChaos.name": "Chaos s falešnými pauzami",
    "rhythm.fakeChaos.desc": "Náhodné délky fází a zelená, která klame.",
    "rhythm.slowHuge.name": "Pomalý obrovský",
    "rhythm.slowHuge.desc": "Pomalý boj, velmi dlouhé tahy obrovskou silou.",
    "rhythm.mixA.name": "Směs: rychlý a silný",
    "rhythm.mixA.desc": "Střídají se bloky rychlého pravidelného a pomalého silného rytmu.",
    "rhythm.mixB.name": "Směs: falešné pauzy a chaos",
    "rhythm.mixB.desc": "Střídají se falešné pauzy a chaotické fáze.",
    "rhythm.all.name": "Všechny rytmy",
    "rhythm.all.desc": "Každých pár tahů jiný rytmus, postupně všechny.",

    // tier
    "tier.maly.name": "malý",
    "tier.maly.tag": "MALÝ",
    "tier.bezny.name": "běžný",
    "tier.bezny.tag": "BĚŽNÝ",
    "tier.velky.name": "velký",
    "tier.velky.tag": "VELKÝ KUS",
    "tier.trofejny.name": "trofejní",
    "tier.trofejny.tag": "TROFEJ!",
  });
})(globalThis.HL);
