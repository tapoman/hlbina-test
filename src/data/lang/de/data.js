// Deutsch — Datenüberlagerung (fish., building., line. …): dieselben Schlüssel wie src/data/lang/sk/data.js
// (dort generiert). Übersetzt an Ort und Stelle über HL.i18n.overlay (docs/I18N.md).
//
// GLOSSAR (alle 13 Dateien halten sich daran; kurz, weil die Spielfläche nur 180 px breit ist):
//   Hlbina / HLBINA  bleibt (Marke)        ponor = Tauchgang, ponoriť sa = abtauchen, HORE = HOCH
//   vlasec = Schnur, prút = Rute,          háčik = Haken, harpúna = Harpune, návnada = Köder
//   úlovok = Fang, prasknúť = reißen (PRASKOL! = GERISSEN!), pevnosť vlasca = Tragkraft
//   v bezpečí = in Sicherheit (im Satz) / GESICHERT (Überschrift), SI HORE = OBEN
//   napätie = Spannung, ťah = Zug (ŤAHÁ = ZIEHT), povolí = LOCKER, zaseknutie = Anhieb
//   ťukať = tippen, dobré ťuknutie = Treffer, zlé ťuknutie = Fehltipp, rytmus = Rhythmus, fáza = Phase
//   (nur in der engen Boss-Zeile des Kampfs „Takt: … · Phase 1/3“ — „Rhythmus“ passt dort nicht in 118 px)
//   pásmo = Zone: Flachsee, Riffe, Zwielicht, Tiefsee, Abgrund, Endlose Tiefe (Zonen-Etiketten haben 35 px klein!)
//   Prístav = Hafen, dedina = Dorf, výlet = Tour, úroveň = Stufe, postaviť = bauen, vylepšiť = ausbauen
//   Chatrč = Hütte, Trhovisko = Markt, Dielňa = Werkstatt, Návnadáreň = Köderladen,
//   Meteostanica = Wetterstation, Maják = Leuchtturm, Krčma = Kneipe, Akvárium = Aquarium
//   úložisko = Lager, dopyt = Nachfrage, objednávka = Bestellung, obchodník = Händler, úloha = Auftrag
//   stopy k legendám = Hinweise, odmena = Belohnung, zlatá návnada = Goldköder, trofej = Trophäe
//   nasadiť = nutzen, nasadené = aktiv, vylepšenie (Endlose Tiefe) = Verbesserung, rebríček = Rangliste
//   encyklopédia = Enzyklopädie, druh = Art, legenda = Legende, súťaž = Turnier (Angelturnier), výhra = Gewinn
//   medúza = Qualle, skala = Fels, prúd = Strömung, žralok = Hai, chobotnica = Krake, tieňový úhor = Schattenaal
//   Strážca priepasti = Abgrundwächter; kúsky mušlí = Muscheln; výlet-Zeile ohne „Tour:“ (sonst 2 Zeilen auf der Karte)
//   najhlbšie: dieser Tauchgang = Tiefster Punkt (Seitenleiste), Karriere = Max. Tiefe / Am tiefsten — nie „Rekord“
//   Jadrové jazero (docs/JAZERO.md): Stará elektráreň = Altes Kraftwerk, Jadrové jazero = Atomsee, kurz „der See“
//   (immer mit Artikel/Präposition „den/im See“ — „die See“ und Komposita wie „Seeschnur“ klingen nach Meer!)
//   Lodenica = Werft, Laboratórium = Labor; Zonen Kühlsee, Überflutete Halle, Kernschacht (kurz Kühlsee/Halle/Schacht;
//   Šachta reaktora = Kernschacht, weil „REAKTORSCHACHT“ im Zonen-Banner unter den Tiefenmesser lief)
//   olovený/grafitový/zirkóniový = Blei-/Graphit-/Zirkonium- (Bleischnur, Graphitrute …), jazerný vlasec = Schnur
//   aus dem Labor / für den See; jadro = Kern, hrdzavý sud = rostiges Fass, svietiaca medúza = Leuchtqualle
//   NA JAZERO = AUF DEN SEE, breh = Ufer (BREH = UFER, Na breh = Ans Ufer), more (Ort) = Meer
//   Anrede immer „du“; Substantive groß (HL.i18n.lower lässt sie groß).
(function (HL) {
  HL.i18n.add('de', 'data', {
    // fish
    "fish.sardinka.name": "Sardine",
    "fish.sardinka.hint": "Beißt immer und überall. Sogar auf einen einfachen Wurm.",
    "fish.okun.name": "Wolfsbarsch",
    "fish.okun.hint": "Hält sich tagsüber nahe der Oberfläche auf.",
    "fish.krab.name": "Krabbe",
    "fish.krab.hint": "Kommt erst nachts heraus. Kann Muscheln nicht widerstehen.",
    "fish.platesa.name": "Flunder",
    "fish.platesa.hint": "Die Fischer sagen, der Regen treibt sie heraus.",
    "fish.makrela.name": "Makrele",
    "fish.makrela.hint": "Makrelenschwärme zeigen sich nur morgens.",
    "fish.pyskac.name": "Lippfisch",
    "fish.pyskac.hint": "Ein Riffbewohner. Beißt fast immer.",
    "fish.papagajovka.name": "Papageifisch",
    "fish.papagajovka.hint": "Bunt wie ein Regenbogen, aber nur bei Sonnenschein.",
    "fish.zubatica.name": "Brasse",
    "fish.zubatica.hint": "Jagt, wenn die Sonne untergeht.",
    "fish.murena.name": "Muräne",
    "fish.murena.hint": "Kommt nachts aus den Felsen. Kämpft unberechenbar.",
    "fish.barakuda.name": "Barrakuda",
    "fish.barakuda.hint": "Bei Sturm greift er angeblich alles an, was sich bewegt.",
    "fish.svetlonoska.name": "Laternenfisch",
    "fish.svetlonoska.hint": "Winzige Lichter im Zwielicht. Da unten gibt es jede Menge davon.",
    "fish.treska.name": "Kabeljau",
    "fish.treska.hint": "Wenn Nebel übers Meer zieht, steigt der Kabeljau auf.",
    "fish.uhor.name": "Aal",
    "fish.uhor.hint": "Nächtlicher Jäger aus dem Zwielicht. Zappelt wie verrückt.",
    "fish.tuniak.name": "Thunfisch",
    "fish.tuniak.hint": "Zieht tagsüber in der Tiefe. Schwer — pass auf deine Schnur auf.",
    "fish.mesacnica.name": "Gotteslachs",
    "fish.mesacnica.hint": "Man will ihn bei Vollmond gesehen haben…",
    "fish.lampasnik.name": "Anglerfisch",
    "fish.lampasnik.hint": "Ein Lichtlein in völliger Dunkelheit. Lass dich nicht täuschen.",
    "fish.pazravy.name": "Pelikanaal",
    "fish.pazravy.hint": "Hungrig ist er nur, wenn kein Mond am Himmel steht.",
    "fish.raja.name": "Nebelrochen",
    "fish.raja.hint": "Ein Schatten der Tiefe, der mit dem Nebel aufsteigt.",
    "fish.sklenena.name": "Glasfisch",
    "fish.sklenena.hint": "Durchsichtig wie Glas. Erst ein Sturm weckt ihn.",
    "fish.velkoustka.name": "Großmaul",
    "fish.velkoustka.hint": "Nichts als Maul. Lebt dort, wohin nicht mal der Leuchtturm reicht.",
    "fish.latimeria.name": "Quastenflosser",
    "fish.latimeria.hint": "Ein lebendes Fossil. Bei Vollmond steigt er angeblich aus dem Abgrund.",
    "fish.sled.name": "Hering",
    "fish.sled.hint": "Im Frühling ziehen hier riesige Schwärme durch.",
    "fish.tekvicovka.name": "Kürbisfisch",
    "fish.tekvicovka.hint": "Ein orangefarbenes Licht in der Oktobernacht.",
    "fish.prizrak.name": "Geisterfisch",
    "fish.prizrak.hint": "Mal ist er da, mal nicht. Nur im Oktober.",

    // legend
    "legend.zlaty_uhor.name": "Goldener Aal",
    "legend.zlaty_uhor.hint": "Morgens bei Sonne soll zwischen den Riffen etwas golden aufblitzen.",
    "legend.hmlista_dama.name": "Nebeldame",
    "legend.hmlista_dama.hint": "Bei Nebel, wenn sich der Mond versteckt, erscheint in der Tiefsee eine weiße Gestalt.",
    "legend.kral_burky.name": "Sturmkönig",
    "legend.kral_burky.hint": "Sturm und Vollmond zugleich. Dann erwacht im Abgrund etwas Riesiges.",
    "legend.ladova_velryba.name": "Eiswal",
    "legend.ladova_velryba.hint": "Nur im Winter. Er singt so tief, dass man ihn bis ins Dorf hört.",
    "legend.bludicka.name": "Tiefenirrlicht",
    "legend.bludicka.hint": "Oktobernacht. Ein Licht, das Fischer in die Tiefe lockt.",
    "legend.strazca.name": "Abgrundwächter",
    "legend.strazca.hint": "Ganz unten bewacht etwas den Abgrund. Es lässt nur den heran, der alle Legenden gefangen hat.",

    // fish (Atomsee, Mutanten — docs/JAZERO.md)
    "fish.dvojhlavy_kapor.name": "Zweikopfkarpfen",
    "fish.dvojhlavy_kapor.hint": "Zwei Köpfe, ein Magen. Beißt auf fast alles.",
    "fish.svietiaca_plotica.name": "Leuchtplötze",
    "fish.svietiaca_plotica.hint": "Leuchtet nachts grün. Schwimmt im Schwarm.",
    "fish.trojoky_ostriez.name": "Dreiaugenbarsch",
    "fish.trojoky_ostriez.hint": "Tagsüber beäugt er den Köder mit allen drei Augen.",
    "fish.olovena_stuka.name": "Bleihecht",
    "fish.olovena_stuka.hint": "Schwer wie Blei. Lauert zwischen den Turbinen.",
    "fish.turbinovy_sumec.name": "Turbinenwels",
    "fish.turbinovy_sumec.hint": "Nachts räkelt er sich im Bauch der Turbinen.",
    "fish.hrdzavy_uhor.name": "Rostaal",
    "fish.hrdzavy_uhor.hint": "Bei Regen kriecht er aus rostigen Rohren.",
    "fish.izotopova_mihula.name": "Isotopen-Neunauge",
    "fish.izotopova_mihula.hint": "Leuchtet so hell, dass man es sogar im Kernschacht sieht.",
    "fish.grafitova_platesa.name": "Graphitflunder",
    "fish.grafitova_platesa.hint": "Bei Sturm löst sie sich vom Betonboden des Schachts.",

    // legend (Atomsee)
    "legend.atomovy_sumec.name": "Atomwels",
    "legend.atomovy_sumec.hint": "In Regennächten strahlt der Kern am hellsten. Neben ihm schläft etwas Großes.",

    // line
    "line.hemp.name": "Hanfschnur",
    "line.nylon.name": "Nylonschnur",
    "line.braided.name": "Flechtschnur",
    "line.steel.name": "Stahlschnur",
    "line.legend.name": "Legendäre Schnur",

    // rod
    "rod.bamboo.name": "Bambusrute",
    "rod.fiber.name": "Glasfaserrute",
    "rod.carbon.name": "Karbonrute",
    "rod.master.name": "Meisterrute",

    // line (Atomsee, aus dem Labor)
    "line.lead.name": "Bleischnur",
    "line.graphite.name": "Graphitschnur",
    "line.zirconium.name": "Zirkoniumschnur",

    // rod (Atomsee, aus dem Labor)
    "rod.lead_rod.name": "Bleirute",
    "rod.graphite_rod.name": "Graphitrute",
    "rod.zirconium_rod.name": "Zirkoniumrute",

    // hook
    "hook.basic.name": "Einfacher Haken",
    "hook.barbed.name": "Widerhaken",
    "hook.circle.name": "Kreishaken",
    "hook.titan.name": "Titanhaken",

    // harpoon
    "harpoon.name": "Harpune",

    // bait
    "bait.worm.name": "Wurm",
    "bait.worm.desc": "Kleine Fische, Flachsee",
    "bait.worm.lakeDesc": "Fische an der Oberfläche",
    "bait.shell.name": "Muscheln",
    "bait.shell.desc": "Rifffische, Krabben",
    "bait.shell.lakeDesc": "Aale und Karpfen",
    "bait.squid.name": "Tintenfisch",
    "bait.squid.desc": "Räuber und mittlere Fische",
    "bait.glow.name": "Leuchtköder",
    "bait.glow.desc": "Tiefseefische",
    "bait.glow.lakeDesc": "Fische im Kernschacht",
    "bait.gold.name": "Goldköder",
    "bait.gold.desc": "Erhöht die Chance auf Legenden",

    // building
    "building.chatrc.name": "Hütte",
    "building.chatrc.level.0": "Verfallene Hütte",
    "building.chatrc.level.1": "Schlafen bis morgens oder nachts",
    "building.chatrc.level.2": "Größeres Fischlager",
    "building.chatrc.level.3": "Gemütliches Heim (Deko)",
    "building.trhovisko.name": "Markt",
    "building.trhovisko.level.0": "—",
    "building.trhovisko.level.1": "Fischverkauf, Preise und heiße Nachfrage",
    "building.trhovisko.level.2": "Preisgrafik für 3 Tage",
    "building.trhovisko.level.3": "Händlerbestellungen mit Bonus",
    "building.dielna.name": "Werkstatt",
    "building.dielna.level.0": "—",
    "building.dielna.level.1": "Einfache Schnüre, Ruten und Haken",
    "building.dielna.level.2": "Bessere Ausrüstung und Harpunen",
    "building.dielna.level.3": "Stahlschnur und Legendäre Schnur",
    "building.navnadaren.name": "Köderladen",
    "building.navnadaren.level.0": "Leere Bude",
    "building.navnadaren.level.1": "Muscheln",
    "building.navnadaren.level.2": "Tintenfisch",
    "building.navnadaren.level.3": "Leuchtköder",
    "building.meteostanica.name": "Wetterstation",
    "building.meteostanica.level.0": "Nichts — nur ein Blick zum Himmel",
    "building.meteostanica.level.1": "Vorhersage für 6 Stunden",
    "building.meteostanica.level.2": "Vorhersage für 24 Stunden",
    "building.meteostanica.level.3": "Vorhersage für 3 Tage und Mondphase",
    "building.majak.name": "Leuchtturm",
    "building.majak.level.0": "Erloschener Turm",
    "building.majak.level.1": "Bessere Sicht bei Nacht",
    "building.majak.level.2": "Sicht in der Tiefsee",
    "building.majak.level.3": "Öffnet Abgrund und Endlose Tiefe",
    "building.krcma.name": "Kneipe",
    "building.krcma.level.0": "Vernagelte Fenster",
    "building.krcma.level.1": "Fischer erzählen Tipps",
    "building.krcma.level.2": "Aufträge von Fischern",
    "building.krcma.level.3": "Hinweise zu Legenden und Goldköder",
    "building.akvarium.name": "Aquarium",
    "building.akvarium.level.0": "Baustelle",
    "building.akvarium.level.1": "Ausgestellte Fische",
    "building.akvarium.level.2": "Touristen: kleines passives Einkommen",
    "building.akvarium.level.3": "Trophäen der Legenden",
    "building.lodenica.name": "Werft",
    "building.lodenica.level.0": "Umgedrehtes Boot",
    "building.lodenica.level.1": "Panzerboot: Kühlsee und Halle",
    "building.lodenica.level.2": "Bleirumpf: Kernschacht",
    "building.lodenica.level.3": "Tauchkäfig: bis zum Kern",
    "building.laboratorium.name": "Labor",
    "building.laboratorium.level.0": "Verschlossener Container",
    "building.laboratorium.level.1": "Bleischnüre und -ruten",
    "building.laboratorium.level.2": "Graphitschnüre und -ruten",
    "building.laboratorium.level.3": "Zirkoniumschnüre und -ruten",

    // zone
    "zone.plytcina.name": "Flachsee",
    "zone.plytcina.desc": "Licht, billige Fische, Quallen",
    "zone.utesy.name": "Riffe",
    "zone.utesy.desc": "Bunte Fische, Felsen",
    "zone.sumrak.name": "Zwielicht",
    "zone.sumrak.desc": "Halbdunkel, erste Räuber",
    "zone.polnoc.name": "Tiefsee",
    "zone.polnoc.desc": "Dunkel, leuchtende Fische",
    "zone.priepast.name": "Abgrund",
    "zone.priepast.desc": "Völlige Dunkelheit, Legenden",
    "zone.nekonecna.name": "Endlose Tiefe",
    "zone.nekonecna.desc": "Hier war noch niemand",
    // Atomsee: .short = Etikett in der Tauchleiste (37 px klein) und im Zonenbalken der Vorbereitung.
    // Banner beim Zonenwechsel: Name in Großbuchstaben 2× nur bis 162 px — „GEFLUTETE HALLE“ (168) und
    // „REAKTORSCHACHT“ (166) liefen links unter den Tiefenmesser (G/R abgeschnitten). Länger = 1× (sauber).
    // desc: Banner-Zeile „300–800 m · …“ (klein, zentriert) höchstens 162 px, sonst beginnt sie unter dem
    // Tiefenmesser (x 2–8) — „Steuerstäbe“ (164 px) verdeckte die 3 von 300, daher „Regelstäbe“ (158 px).
    "zone.chladiace.name": "Kühlsee",
    "zone.chladiace.desc": "Warm und grün, erste Mutanten",
    "zone.chladiace.short": "Kühlsee",
    "zone.hala.name": "Überflutete Halle",
    "zone.hala.desc": "Turbinen, Stege, rostige Fässer",
    "zone.hala.short": "Halle",
    "zone.sachta.name": "Kernschacht",
    "zone.sachta.desc": "Beton, Regelstäbe, blauer Kern",
    "zone.sachta.short": "Schacht",

    // location
    "location.more.name": "Meer",
    "location.jadro.name": "Atomsee",

    // period
    "period.morning.name": "Morgen",
    "period.day.name": "Tag",
    "period.evening.name": "Abend",
    "period.night.name": "Nacht",

    // weather
    "weather.sun.name": "Sonnig",
    "weather.cloudy.name": "Bewölkt",
    "weather.rain.name": "Regen",
    "weather.fog.name": "Nebel",
    "weather.storm.name": "Sturm",

    // moon
    "moon.0": "Neumond",
    "moon.1": "Zunehmende Sichel",
    "moon.2": "Erstes Viertel",
    "moon.3": "Zunehmender Mond",
    "moon.4": "Vollmond",
    "moon.5": "Abnehmender Mond",
    "moon.6": "Letztes Viertel",
    "moon.7": "Abnehmende Sichel",

    // event
    "event.spring.name": "Frühlingszug",
    "event.spring.desc": "Schwärme von Zugfischen, doppelte Preise für einige Arten",
    "event.summer.name": "Sommerfest",
    "event.summer.desc": "Angelturnier im Dorf: der schwerste Fisch des Tages",
    "event.halloween.name": "Halloween-Tiefe",
    "event.halloween.desc": "Gruselfische, dunkleres Meer, saisonale Legende",
    "event.winter.name": "Winterfang",
    "event.winter.desc": "Eiswal, zugefrorene Oberfläche, Weihnachtsdorf",

    // cond
    "cond.any": "Jederzeit",
    "cond.morning": "Morgen",
    "cond.day": "Tag",
    "cond.evening": "Abend",
    "cond.night": "Nacht",
    "cond.sun": "Sonnig",
    "cond.cloudy": "Bewölkt",
    "cond.rain": "Regen",
    "cond.fog": "Nebel",
    "cond.storm": "Sturm",
    "cond.fullmoon": "Vollmond",
    "cond.newmoon": "Neumond",
    "cond.spring": "Frühlingszug",
    "cond.summer": "Sommerfest",
    "cond.halloween": "Halloween",
    "cond.winter": "Winterfang",
    "cond.guardian": "Leuchtturm 3 und alle Legenden",

    // hazard
    "hazard.jelly.name": "Qualle",
    "hazard.rock.name": "Scharfer Fels",
    "hazard.current.name": "Strömung",

    // lakeHazard
    "lakeHazard.jelly.name": "Leuchtqualle",
    "lakeHazard.rock.name": "Rostiges Fass",
    "lakeHazard.current.name": "Strömung",

    // predator
    "predator.shark.name": "Hai",
    "predator.octopus.name": "Krake",
    "predator.shadowEel.name": "Schattenaal",

    // perk
    "perk.strength.name": "+20 % Tragkraft der Schnur",
    "perk.grip.name": "Fester Anhieb: Treffer zählen +30 %",
    "perk.jellyImmune.name": "Quallen ignorieren dich",
    "perk.harpoon.name": "+1 Harpune",
    "perk.light.name": "Größerer Lichtkegel",
    "perk.slowEscape.name": "Fische fliehen 40 % langsamer",
    "perk.tolerance.name": "+60 ms Rhythmus-Toleranz",
    "perk.sink.name": "+30 % Sinkgeschwindigkeit",
    "perk.lure.name": "+30 % Chance auf Biss",
    "perk.sharkSlow.name": "Hai greift 4 s später an",
    "perk.rockProof.name": "Felsen schaden der Schnur nicht",
    "perk.lightDepth.name": "Tiefe belastet 15 % weniger",
    "perk.knot.name": "Rettungsknoten: den ersten Riss überlebst du (halber Fang weg)",

    // tip
    "tip.0": "Je tiefer du bist, desto mehr belastet ein Fisch die Schnur. In 500 Metern wiegt er dreifach.",
    "tip.1": "Sinkst du mit voller Schnur tiefer, steigt die Spannung auch ohne neuen Fisch.",
    "tip.2": "Tippe, wenn der Fisch locker lässt. Tippen während des Zugs reißt nur an der Schnur.",
    "tip.3": "Solange du kämpfst, kommst du nicht hoch. Wer einen Kampf beginnt, muss ihn beenden.",
    "tip.4": "Vor großen Fischen musst du keine Angst haben. Schlimmer ist der Kampf, wenn die Schnur schon voll ist.",
    "tip.5": "Jeder verkaufte Fisch senkt seine Nachfrage. Probier eine andere Tiefe, Zeit oder anderes Wetter.",
    "tip.6": "Bei Sturm fahren weniger Fischer raus. Die Preise steigen, die Gefahr aber auch.",
    "tip.7": "Eine Qualle spannt die Schnur kurz. Ein Fels schwächt sie dauerhaft, bis du auftauchst.",
    "tip.8": "Der Hai holt sich immer den wertvollsten Fisch. Eine Harpune aus der Werkstatt verscheucht ihn.",
    "tip.9": "Einen Kraken schüttelst du ab, indem du den Haken hin und her reißt.",
    "tip.10": "Bleib im Abgrund nicht stehen. Genau darauf wartet der Schattenaal.",
    "tip.11": "Regen lockt Fische an die Oberfläche.",
    "tip.12": "Nebel bringt angeblich geheimnisvolle Arten.",
    "tip.13": "Bei Vollmond und Neumond zeigen sich Fische, die du sonst nie siehst.",
    "tip.14": "Jede Art kämpft auf ihre Weise. Merkst du dir ihren Rhythmus, fängst du die nächste leichter.",
    "tip.15": "Auf Leuchtköder beißen Tiefseefische. Auf Wurm nur kleine Fische in der Flachsee.",
    "tip.16": "Hinter dem Dorf steht ein altes Kraftwerk. In seinem See sollen Fische mit zwei Köpfen schwimmen.",
    "tip.17": "Im Atomsee gibt es weder Haie noch Kraken. Dafür aber rostige Fässer.",

    // tutorial
    "tutorial.sink": "Halte S / linke Maustaste / Finger und der Haken sinkt.",
    "tutorial.move": "A / D oder Maus: Haken nach links und rechts.",
    "tutorial.bite": "Biss! Tippe (Leertaste / Klick), wenn GRÜN leuchtet.",
    "tutorial.red": "Bei ROT nicht tippen. Die Schnur würde sich spannen.",
    "tutorial.up": "Drück W oder HOCH und der Fang ist in Sicherheit.",
    "tutorial.tension": "Der Bogen oben zeigt die Spannung. Übersteigt sie die Tragkraft, reißt die Schnur. ↓×2 = in dieser Tiefe wiegt jeder Fisch doppelt.",
    "tutorial.again": "Fang gesichert. Halte S (oder Maus aufs Wasser) und tauch wieder ab, oder zurück in den Hafen.",
    "tutorial.againSnap": "Ausrüstung heil, Schnur neu geknüpft. Halte S (oder Maus aufs Wasser) und tauch wieder ab, oder zurück in den Hafen.",
    "tutorial.againEmpty": "Halte S (oder Maus aufs Wasser) und tauch wieder ab, oder zurück in den Hafen.",

    // tutorialTouch
    "tutorialTouch.sink": "Finger still halten: Haken sinkt.",
    "tutorialTouch.move": "Zieh den Finger zur Seite — dabei sinkt der Haken nicht.",
    "tutorialTouch.bite": "Ein Fisch hat angebissen! Tippe, wenn GRÜN leuchtet.",
    "tutorialTouch.up": "Tippe auf HOCH und der Fang ist in Sicherheit.",
    "tutorialTouch.again": "Fang gesichert. Halte den Finger aufs Wasser und tauch wieder ab, oder zurück in den Hafen.",
    "tutorialTouch.againSnap": "Ausrüstung heil, Schnur neu geknüpft. Halte den Finger aufs Wasser und tauch wieder ab, oder zurück in den Hafen.",
    "tutorialTouch.againEmpty": "Finger aufs Wasser und wieder abtauchen, oder zurück zum Hafen.",

    // unlock
    "unlock.dielna3": "Werkstatt Stufe 3 frei — Stahlschnur",
    "unlock.majak3": "Leuchtturm Stufe 3 frei — Abgrund und Endlose Tiefe",
    "unlock.legendLine": "Legendäre Schnur in der Werkstatt",
    "unlock.trophy": "Trophäe im Aquarium",
    "unlock.ending": "Der Abgrundwächter ist gefangen. Das Dorf feiert!",

    // rhythm
    "rhythm.fastRegular.name": "Schnell, gleichmäßig",
    "rhythm.fastRegular.desc": "Kurze, gleiche Phasen.",
    "rhythm.regular.name": "Gleichmäßig",
    "rhythm.regular.desc": "Ruhiger, gleichmäßiger Wechsel.",
    "rhythm.slowStrong.name": "Langsam, kräftig",
    "rhythm.slowStrong.desc": "Lange Züge, kurzes Nachlassen.",
    "rhythm.chaotic.name": "Chaotisch",
    "rhythm.chaotic.desc": "Zufällige Phasenlängen.",
    "rhythm.explosive.name": "Explosiv",
    "rhythm.explosive.desc": "Lange ruhige Pause, dann ein heftiger kurzer Zug.",
    "rhythm.fakePause.name": "Falsche Pausen",
    "rhythm.fakePause.desc": "Grün blinkt kurz auf und wird sofort rot.",
    "rhythm.waves.name": "Wellen",
    "rhythm.waves.desc": "Das Tempo wird fließend schneller und langsamer.",
    "rhythm.playful.name": "Verspielt",
    "rhythm.playful.desc": "Schnelle und langsame Serien im Wechsel.",
    "rhythm.extremeFast.name": "Extrem schnell",
    "rhythm.extremeFast.desc": "Blitzphasen, kürzer als eine Viertelsekunde.",
    "rhythm.fakeChaos.name": "Chaos mit falschen Pausen",
    "rhythm.fakeChaos.desc": "Zufällige Phasenlängen und ein Grün, das lügt.",
    "rhythm.slowHuge.name": "Langsam, riesig",
    "rhythm.slowHuge.desc": "Langsamer Kampf, sehr lange Züge mit enormer Kraft.",
    "rhythm.mixA.name": "Mix: schnell und kräftig",
    "rhythm.mixA.desc": "Blöcke aus schnellem gleichmäßigem und langsamem kräftigem Rhythmus im Wechsel.",
    "rhythm.mixB.name": "Mix: falsche Pausen und Chaos",
    "rhythm.mixB.desc": "Falsche Pausen und chaotische Phasen im Wechsel.",
    "rhythm.all.name": "Alle Rhythmen",
    "rhythm.all.desc": "Alle paar Züge ein anderer Rhythmus, nach und nach alle.",

    // tier
    "tier.maly.name": "klein",
    "tier.maly.tag": "KLEIN",
    "tier.bezny.name": "normal",
    "tier.bezny.tag": "NORMAL",
    "tier.velky.name": "groß",
    "tier.velky.tag": "BROCKEN",
    "tier.trofejny.name": "Trophäe",
    "tier.trofejny.tag": "TROPHÄE!",
  });
})(globalThis.HL);
