// English — data overlay (fish, legends, gear, buildings, world, tips, tutorial, rhythms, size tiers).
// Same keys as src/data/lang/sk/data.js (generated from the Slovak data). docs/I18N.md.
//
// GLOSSARY (keep every area consistent with this list):
//   HLBINA / Hlbina       brand name — never translated
//   Prístav               Harbor            Chatrč           Hut (storage = "the Hut")
//   Trhovisko             Market            Dielňa           Workshop
//   Návnadáreň            Bait Shop         Meteostanica     Weather Station
//   Maják                 Lighthouse        Krčma            Tavern
//   Akvárium              Aquarium          dedina           village
//   Plytčina / Útesy / Súmrak / Polnoc / Priepasť = Shallows / Reefs / Twilight / Midnight / Abyss
//   Nekonečná hlbina      Endless Deep      NA MORE          SET SAIL
//   vlasec                line              napätie          tension (line tension)
//   pevnosť / záťaž       strength / load   praskne, PRASKOL snaps, SNAPPED!
//   ponor, ponoriť sa     dive              hladina          surface
//   HORE                  UP                úlovok           catch
//   ŤUKAJ! / ČAKAJ        TAP! / WAIT       ťuknutie         tap (good / bad taps)
//   ŤAHÁ / POVOLÍ         PULL / SLACK      zelená / červená GREEN / RED
//   zaseknutie            Hooked            boj              fight
//   rytmus / fáza         rhythm / phase    ryba unikla      got away / escaped
//   návnada               bait (names end in " bait" — ui.dive.card.baitNoun strips it)
//   prút / háčik / harpúna rod / hook / harpoon   výbava / nasadiť  gear / equip
//   CASING: fish, legend, building, zone and event names are Title Case (proper names, never lowercased).
//   Gear and bait ITEM names are sentence case ("Steel line", "Glow bait"): the UI lowercases them inside
//   sentences — HL.i18n.lower1 only lowers the FIRST letter, so "Steel Line" rendered as "(steel Line)".
//   druh                  species           kus (veľký, trofejný) fish (BIG ONE, TROPHY)
//   dopyt / objednávka    demand / order    obchodník        merchant
//   úloha / stopa         quest / clue      rybári           fishers
//   legenda / trofej      legend / trophy   vylepšenie (Nekonečná) upgrade
//   úroveň                level             postaviť / vylepšiť  build / upgrade
//   rebríček              leaderboard       kariéra / záloha career / backup
//   súťaž / výhra         contest / prize   výlet            trip
//   počasie / predpoveď   weather / forecast  spln / nov     full moon / new moon
//   pásmo                 zone              žralok / chobotnica / medúza  shark / octopus / jellyfish
//   skala / prúd          rock / current    tieňový úhor     shadow eel
//   záchranný uzol        lifesaver knot    zlatá návnada    golden bait (item "Golden bait")
//   --- Nuclear Lake (second fishing spot, docs/JAZERO.md) ---
//   Stará elektráreň      Old Power Plant   Jadrové jazero   Nuclear Lake (location; More = Sea)
//   Lodenica              Shipyard          Laboratórium     Laboratory
//   Chladiace jazero / Zatopená hala / Šachta reaktora = Cooling Lake / Flooded Hall / Reactor Shaft
//     short HUD labels    Jazero / Hala / Šachta = Lake / Hall / Shaft
//   NA JAZERO             TO THE LAKE       BREH / Breh      SHORE / Shore (lake counterpart of HARBOR / Harbor)
//   jazerný vlasec / prút lake line / rod   morský vlasec    sea line
//   olovený / grafitový / zirkóniový = lead / graphite / zirconium ("Lead line", "Graphite rod", "Lead Pike")
//   hrdzavý sud           rusty barrel (the lake's "rock")   svietiaca medúza  glowing jellyfish
//   jadro                 core (reactor core = lake bottom)  mutant          mutant
(function (HL) {
  HL.i18n.add('en', 'data', {
    // fish
    "fish.sardinka.name": "Sardine",
    "fish.sardinka.hint": "Bites always and everywhere. Even on a plain worm.",
    "fish.okun.name": "Sea Bass",
    "fish.okun.hint": "Stays near the surface during the day.",
    "fish.krab.name": "Crab",
    "fish.krab.hint": "Only comes out at night. Can't resist shells.",
    "fish.platesa.name": "Flounder",
    "fish.platesa.hint": "Fishers say the rain drives it out.",
    "fish.makrela.name": "Mackerel",
    "fish.makrela.hint": "Mackerel schools only show up in the morning.",
    "fish.pyskac.name": "Wrasse",
    "fish.pyskac.hint": "A reef dweller. Bites almost every time.",
    "fish.papagajovka.name": "Parrotfish",
    "fish.papagajovka.hint": "Colorful as a rainbow, but only when the sun is out.",
    "fish.zubatica.name": "Sea Bream",
    "fish.zubatica.hint": "Hunts when the sun goes down.",
    "fish.murena.name": "Moray Eel",
    "fish.murena.hint": "Leaves the rocks at night. Fights unpredictably.",
    "fish.barakuda.name": "Barracuda",
    "fish.barakuda.hint": "In a storm, they say it attacks anything that moves.",
    "fish.svetlonoska.name": "Lanternfish",
    "fish.svetlonoska.hint": "Tiny lights in the gloom. The deep is full of them.",
    "fish.treska.name": "Cod",
    "fish.treska.hint": "When fog rolls over the sea, the cod rise.",
    "fish.uhor.name": "Eel",
    "fish.uhor.hint": "A night hunter from the gloom. Thrashes like mad.",
    "fish.tuniak.name": "Tuna",
    "fish.tuniak.hint": "Swims deep during the day. Heavy — mind your line.",
    "fish.mesacnica.name": "Silver Moonfish",
    "fish.mesacnica.hint": "Said to be seen at full moon…",
    "fish.lampasnik.name": "Anglerfish",
    "fish.lampasnik.hint": "A little light in total darkness. Don't let it fool you.",
    "fish.pazravy.name": "Gulper Eel",
    "fish.pazravy.hint": "Only hungry when there's no moon in the sky.",
    "fish.raja.name": "Mist Ray",
    "fish.raja.hint": "A shadow of the deep that rises with the fog.",
    "fish.sklenena.name": "Glassfish",
    "fish.sklenena.hint": "Clear as glass. Only a storm wakes it up.",
    "fish.velkoustka.name": "Swallower",
    "fish.velkoustka.hint": "All mouth. Lives where not even the lighthouse can see.",
    "fish.latimeria.name": "Coelacanth",
    "fish.latimeria.hint": "A living fossil. Said to rise from the Abyss at full moon.",
    "fish.sled.name": "Herring",
    "fish.sled.hint": "Every spring, huge schools pass through here.",
    "fish.tekvicovka.name": "Pumpkinfish",
    "fish.tekvicovka.hint": "An orange glow on an October night.",
    "fish.prizrak.name": "Ghostfish",
    "fish.prizrak.hint": "It's there, and then it isn't. October only.",

    // fish — Nuclear Lake mutants
    "fish.dvojhlavy_kapor.name": "Two-Headed Carp",
    "fish.dvojhlavy_kapor.hint": "Two heads, one stomach. Bites on almost anything.",
    "fish.svietiaca_plotica.name": "Glowing Roach",
    "fish.svietiaca_plotica.hint": "Glows green at night. Swims in schools.",
    "fish.trojoky_ostriez.name": "Three-Eyed Perch",
    "fish.trojoky_ostriez.hint": "By day it watches your bait with all three eyes.",
    "fish.olovena_stuka.name": "Lead Pike",
    "fish.olovena_stuka.hint": "Heavy as lead. Lurks between the turbines.",
    "fish.turbinovy_sumec.name": "Turbine Catfish",
    "fish.turbinovy_sumec.hint": "At night it lounges in the guts of the turbines.",
    "fish.hrdzavy_uhor.name": "Rusty Eel",
    "fish.hrdzavy_uhor.hint": "When it rains, it crawls out of the rusty pipes.",
    "fish.izotopova_mihula.name": "Isotope Lamprey",
    "fish.izotopova_mihula.hint": "Glows so bright you can see it even in the Reactor Shaft.",
    "fish.grafitova_platesa.name": "Graphite Flounder",
    "fish.grafitova_platesa.hint": "A storm peels it off the concrete floor of the shaft.",

    // legend
    "legend.zlaty_uhor.name": "Golden Eel",
    "legend.zlaty_uhor.hint": "On sunny mornings, something golden is said to flash between the reefs.",
    "legend.hmlista_dama.name": "Mist Lady",
    "legend.hmlista_dama.hint": "When fog rolls in and the moon hides, a white figure appears in Midnight.",
    "legend.kral_burky.name": "Storm King",
    "legend.kral_burky.hint": "A storm and a full moon at once. That's when something huge wakes in the Abyss.",
    "legend.ladova_velryba.name": "Ice Whale",
    "legend.ladova_velryba.hint": "Winter only. It sings so deep you can hear it in the village.",
    "legend.bludicka.name": "Deep Wisp",
    "legend.bludicka.hint": "An October night. A little light that lures fishers into the deep.",
    "legend.strazca.name": "Abyss Guardian",
    "legend.strazca.hint": "At the very bottom, something guards the Abyss. It only lets near those who caught every legend.",

    // legend — Nuclear Lake
    "legend.atomovy_sumec.name": "Atomic Catfish",
    "legend.atomovy_sumec.hint": "On a rainy night the core glows brightest. Something big sleeps beside it.",

    // line
    "line.hemp.name": "Hemp line",
    "line.nylon.name": "Nylon line",
    "line.braided.name": "Braided line",
    "line.steel.name": "Steel line",
    "line.legend.name": "Legendary line",

    // rod
    "rod.bamboo.name": "Bamboo rod",
    "rod.fiber.name": "Fiberglass rod",
    "rod.carbon.name": "Carbon rod",
    "rod.master.name": "Master rod",

    // line — lake lines (Laboratory)
    "line.lead.name": "Lead line",
    "line.graphite.name": "Graphite line",
    "line.zirconium.name": "Zirconium line",

    // rod — lake rods (Laboratory)
    "rod.lead_rod.name": "Lead rod",
    "rod.graphite_rod.name": "Graphite rod",
    "rod.zirconium_rod.name": "Zirconium rod",

    // hook
    "hook.basic.name": "Basic hook",
    "hook.barbed.name": "Barbed hook",
    "hook.circle.name": "Circle hook",
    "hook.titan.name": "Titanium hook",

    // harpoon
    "harpoon.name": "Harpoon",

    // bait
    "bait.worm.name": "Worm",
    "bait.worm.desc": "Small fish in the Shallows",
    "bait.worm.lakeDesc": "Fish near the surface",
    "bait.shell.name": "Shell bits",
    "bait.shell.desc": "Reef fish, crabs",
    "bait.shell.lakeDesc": "Eels and carp",
    "bait.squid.name": "Squid",
    "bait.squid.desc": "Predators and mid-size fish",
    "bait.glow.name": "Glow bait",
    "bait.glow.desc": "Deep-sea fish",
    "bait.glow.lakeDesc": "Reactor shaft fish",
    "bait.gold.name": "Golden bait",
    "bait.gold.desc": "Better odds of legends",

    // building
    "building.chatrc.name": "Hut",
    "building.chatrc.level.0": "Ruined hut",
    "building.chatrc.level.1": "Sleep: skip to morning or night",
    "building.chatrc.level.2": "Bigger fish storage",
    "building.chatrc.level.3": "Cozy home (cosmetic)",
    "building.trhovisko.name": "Market",
    "building.trhovisko.level.0": "—",
    "building.trhovisko.level.1": "Sell fish, prices and hot demand",
    "building.trhovisko.level.2": "3-day price chart",
    "building.trhovisko.level.3": "Merchant orders with a bonus",
    "building.dielna.name": "Workshop",
    "building.dielna.level.0": "—",
    "building.dielna.level.1": "Basic lines, rods and hooks",
    "building.dielna.level.2": "Advanced gear and harpoons",
    "building.dielna.level.3": "Steel and legendary line",
    "building.navnadaren.name": "Bait Shop",
    "building.navnadaren.level.0": "Empty shed",
    "building.navnadaren.level.1": "Shell bits",
    "building.navnadaren.level.2": "Squid",
    "building.navnadaren.level.3": "Glow bait",
    "building.meteostanica.name": "Weather Station",
    "building.meteostanica.level.0": "Nothing — just a look at the sky",
    "building.meteostanica.level.1": "6-hour forecast",
    "building.meteostanica.level.2": "24-hour forecast",
    "building.meteostanica.level.3": "3-day forecast and moon phase",
    "building.majak.name": "Lighthouse",
    "building.majak.level.0": "Unlit tower",
    "building.majak.level.1": "Better visibility at night",
    "building.majak.level.2": "Visibility in Midnight",
    "building.majak.level.3": "Unlocks the Abyss and Endless Deep",
    "building.krcma.name": "Tavern",
    "building.krcma.level.0": "Boarded-up windows",
    "building.krcma.level.1": "Fishers share tips",
    "building.krcma.level.2": "Quests from fishers",
    "building.krcma.level.3": "Legend clues and golden bait",
    "building.akvarium.name": "Aquarium",
    "building.akvarium.level.0": "Building site",
    "building.akvarium.level.1": "Fish on display",
    "building.akvarium.level.2": "Tourists: small passive income",
    "building.akvarium.level.3": "Legend trophies",
    "building.lodenica.name": "Shipyard",
    "building.lodenica.level.0": "Upturned boat",
    "building.lodenica.level.1": "Armored boat: Lake and Hall",
    "building.lodenica.level.2": "Lead hull: Reactor Shaft",
    "building.lodenica.level.3": "Diving cage: down to the core",
    "building.laboratorium.name": "Laboratory",
    "building.laboratorium.level.0": "Locked container",
    "building.laboratorium.level.1": "Lead lines and rods",
    "building.laboratorium.level.2": "Graphite lines and rods",
    "building.laboratorium.level.3": "Zirconium lines and rods",

    // zone
    "zone.plytcina.name": "Shallows",
    "zone.plytcina.desc": "Light, cheap fish, jellyfish",
    "zone.utesy.name": "Reefs",
    "zone.utesy.desc": "Colorful fish, rocks",
    "zone.sumrak.name": "Twilight",
    "zone.sumrak.desc": "Gloom, first predators",
    "zone.polnoc.name": "Midnight",
    "zone.polnoc.desc": "Darkness, glowing fish",
    "zone.priepast.name": "Abyss",
    "zone.priepast.desc": "Pitch black, legends",
    "zone.nekonecna.name": "Endless Deep",
    "zone.nekonecna.desc": "No one has swum this far yet",
    // Nuclear Lake zones; .short = tiny dive HUD label (≤ 8 chars). The desc follows "300–800 m · " in the centered
    // zone banner (small font): keep the whole line ≤ 160 px, or its first digits hide under the depth gauge (x 2–8).
    "zone.chladiace.name": "Cooling Lake",
    "zone.chladiace.desc": "Warm green water, first mutants",
    "zone.chladiace.short": "Lake",
    "zone.hala.name": "Flooded Hall",
    "zone.hala.desc": "Turbines, catwalks, barrels",
    "zone.hala.short": "Hall",
    "zone.sachta.name": "Reactor Shaft",
    "zone.sachta.desc": "Control rods, blue core glow",
    "zone.sachta.short": "Shaft",

    // location
    "location.more.name": "Sea",
    "location.jadro.name": "Nuclear Lake",

    // period
    "period.morning.name": "Morning",
    "period.day.name": "Day",
    "period.evening.name": "Evening",
    "period.night.name": "Night",

    // weather
    "weather.sun.name": "Sunny",
    "weather.cloudy.name": "Cloudy",
    "weather.rain.name": "Rain",
    "weather.fog.name": "Fog",
    "weather.storm.name": "Storm",

    // moon
    "moon.0": "New Moon",
    "moon.1": "Waxing Crescent",
    "moon.2": "First Quarter",
    "moon.3": "Waxing Gibbous",
    "moon.4": "Full Moon",
    "moon.5": "Waning Gibbous",
    "moon.6": "Last Quarter",
    "moon.7": "Waning Crescent",

    // event
    "event.spring.name": "Spring Migration",
    "event.spring.desc": "Schools of migrating fish, double prices for some species",
    "event.summer.name": "Summer Festival",
    "event.summer.desc": "Village fishing contest: heaviest fish of the day",
    "event.halloween.name": "Halloween Deep",
    "event.halloween.desc": "Spooky fish, a darker sea, a seasonal legend",
    "event.winter.name": "Winter Fishing",
    "event.winter.desc": "Ice whale, frozen surface, a festive village",

    // cond
    "cond.any": "Anytime",
    "cond.morning": "Morning",
    "cond.day": "Day",
    "cond.evening": "Evening",
    "cond.night": "Night",
    "cond.sun": "Sunny",
    "cond.cloudy": "Cloudy",
    "cond.rain": "Rain",
    "cond.fog": "Fog",
    "cond.storm": "Storm",
    "cond.fullmoon": "Full Moon",
    "cond.newmoon": "New Moon",
    "cond.spring": "Spring Migration",
    "cond.summer": "Summer Festival",
    "cond.halloween": "Halloween",
    "cond.winter": "Winter Fishing",
    "cond.guardian": "Lighthouse 3 and all legends",

    // hazard
    "hazard.jelly.name": "Jellyfish",
    "hazard.rock.name": "Sharp Rock",
    "hazard.current.name": "Current",

    // lakeHazard — same hazards in the Nuclear Lake (a rusty barrel is the lake's rock)
    "lakeHazard.jelly.name": "Glowing Jellyfish",
    "lakeHazard.rock.name": "Rusty Barrel",
    "lakeHazard.current.name": "Current",

    // predator
    "predator.shark.name": "Shark",
    "predator.octopus.name": "Octopus",
    "predator.shadowEel.name": "Shadow Eel",

    // perk
    "perk.strength.name": "+20% line strength",
    "perk.grip.name": "Firm hookset: +30% progress per tap",
    "perk.jellyImmune.name": "Jellyfish ignore you",
    "perk.harpoon.name": "+1 harpoon",
    "perk.light.name": "Bigger light cone",
    "perk.slowEscape.name": "Fish escape 40% slower",
    "perk.tolerance.name": "+60\u00a0ms rhythm tolerance",
    "perk.sink.name": "+30% sinking speed",
    "perk.lure.name": "+30% bite chance",
    "perk.sharkSlow.name": "Sharks attack 4\u00a0s later",
    "perk.rockProof.name": "Rocks don't damage the line",
    "perk.lightDepth.name": "Depth adds 15% less load",
    "perk.knot.name": "Lifesaver knot: survive one snap (lose half the catch)",

    // tip
    "tip.0": "The deeper you are, the more a fish loads your line. At 500\u00a0meters it weighs three times as much.",
    "tip.1": "Sink deeper with a full line and tension rises even without a new fish.",
    "tip.2": "Tap when the fish goes slack. Tapping while it pulls only jerks the line.",
    "tip.3": "You can't go up while fighting. Starting a fight is a commitment.",
    "tip.4": "Don't fear a big fish. Fighting it once your line is already full is worse.",
    "tip.5": "Every fish you sell lowers its demand. Try another depth, time or weather.",
    "tip.6": "Fewer fishers go out in a storm. Prices go up, but so does the danger.",
    "tip.7": "A jellyfish tightens the line for a moment. A rock weakens it until you surface.",
    "tip.8": "A shark always goes for your most valuable fish. A harpoon from the Workshop drives it off.",
    "tip.9": "Shake off an octopus by jerking the hook from side to side.",
    "tip.10": "Don't stand still in the Abyss. That's exactly what the shadow eel waits for.",
    "tip.11": "Rain draws fish up to the surface.",
    "tip.12": "They say fog brings mysterious species.",
    "tip.13": "At full moon and new moon, fish appear that you won't see otherwise.",
    "tip.14": "Every species fights its own way. Learn its rhythm and the next one comes easier.",
    "tip.15": "Deep-sea fish bite on glow bait. Worms only catch small fry in the Shallows.",
    "tip.16": "Beyond the village stands an old power plant. They say two-headed fish swim in its lake.",
    "tip.17": "The Nuclear Lake has no sharks or octopuses. It does have rusty barrels, though.",

    // tutorial
    "tutorial.sink": "Hold S / left mouse / finger and the hook sinks.",
    "tutorial.move": "A / D or mouse: move the hook left and right.",
    "tutorial.bite": "A bite! Tap (space / click) while it's GREEN.",
    "tutorial.red": "Don't tap on RED. It strains the line.",
    "tutorial.up": "Press W or UP and your catch is safe.",
    "tutorial.tension": "The arc at the top shows tension. Past the line's strength, it snaps. ↓×2 = at this depth every fish weighs double.",
    "tutorial.again": "Your catch is safe. Hold S (or the mouse on the water) to dive again, or go back to the Harbor.",
    "tutorial.againSnap": "Your gear is fine, the line is re-tied. Hold S (or the mouse on the water) to dive again, or go back to the Harbor.",
    "tutorial.againEmpty": "Hold S (or the mouse on the water) to dive again, or go back to the Harbor.",

    // tutorialTouch
    "tutorialTouch.sink": "Keep your finger down and the hook sinks.",
    "tutorialTouch.move": "Drag left and right — the hook doesn't sink while you drag sideways.",
    "tutorialTouch.bite": "A bite! Tap while it's GREEN.",
    "tutorialTouch.up": "Tap UP and your catch is safe.",
    "tutorialTouch.again": "Your catch is safe. Hold your finger on the water to dive again, or go back to the Harbor.",
    "tutorialTouch.againSnap": "Your gear is fine, the line is re-tied. Hold your finger on the water to dive again, or go back to the Harbor.",
    "tutorialTouch.againEmpty": "Hold your finger on the water to dive again, or go back to the Harbor.",

    // unlock
    "unlock.dielna3": "Workshop can build level 3 — steel line",
    "unlock.majak3": "Lighthouse can build level 3 — Abyss and Endless Deep",
    "unlock.legendLine": "Workshop now sells the legendary line",
    "unlock.trophy": "Trophy in the Aquarium",
    "unlock.ending": "The Abyss Guardian is caught. The village celebrates!",

    // rhythm
    "rhythm.fastRegular.name": "Fast & Steady",
    "rhythm.fastRegular.desc": "Short, even phases.",
    "rhythm.regular.name": "Steady",
    "rhythm.regular.desc": "Calm, even back-and-forth.",
    "rhythm.slowStrong.name": "Slow & Strong",
    "rhythm.slowStrong.desc": "Long pulls, short slack.",
    "rhythm.chaotic.name": "Chaotic",
    "rhythm.chaotic.desc": "Random phase lengths.",
    "rhythm.explosive.name": "Explosive",
    "rhythm.explosive.desc": "Long calm slack, then a sudden short pull.",
    "rhythm.fakePause.name": "Fake Pauses",
    "rhythm.fakePause.desc": "Green flashes for a moment and turns red right away.",
    "rhythm.waves.name": "Waves",
    "rhythm.waves.desc": "The tempo smoothly speeds up and slows down.",
    "rhythm.playful.name": "Playful",
    "rhythm.playful.desc": "Fast and slow runs take turns.",
    "rhythm.extremeFast.name": "Lightning Fast",
    "rhythm.extremeFast.desc": "Split-second phases, under a quarter second.",
    "rhythm.fakeChaos.name": "Chaos & Fakes",
    "rhythm.fakeChaos.desc": "Random phase lengths and a green that lies.",
    "rhythm.slowHuge.name": "Slow Giant",
    "rhythm.slowHuge.desc": "A slow fight with very long pulls of huge force.",
    "rhythm.mixA.name": "Mix: Fast & Strong",
    "rhythm.mixA.desc": "Blocks of fast steady and slow strong rhythm take turns.",
    "rhythm.mixB.name": "Mix: Fakes & Chaos",
    "rhythm.mixB.desc": "Fake pauses and chaotic phases take turns.",
    "rhythm.all.name": "All Rhythms",
    "rhythm.all.desc": "A new rhythm every few pulls, one after another.",

    // tier
    "tier.maly.name": "small",
    "tier.maly.tag": "SMALL",
    "tier.bezny.name": "regular",
    "tier.bezny.tag": "REGULAR",
    "tier.velky.name": "big",
    "tier.velky.tag": "BIG ONE",
    "tier.trofejny.name": "trophy",
    "tier.trofejny.tag": "TROPHY!",
  });
})(globalThis.HL);
