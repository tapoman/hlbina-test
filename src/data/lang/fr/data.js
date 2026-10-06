// Français — prekrytie dát (ryby, legendy, výbava, budovy, svet, tipy, návod, rytmy, triedy kusov).
// Tie isté kľúče ako src/data/lang/sk/data.js (vygenerovaný zo slovenských dát). docs/I18N.md.
//
// GLOSSAIRE (toutes les zones de traduction s'y tiennent) :
//   HLBINA / Hlbina       nom du jeu — jamais traduit
//   Prístav        Port                 Chatrč         Cabane (f) (stockage = « la Cabane »)
//   Trhovisko      Marché (m)           Dielňa         Atelier (m)
//   Návnadáreň     Boutique d’appâts (f) Meteostanica  Station météo (f)
//   Maják          Phare (m)            Krčma          Taverne (f)
//   Akvárium       Aquarium (m)         dedina         village
//   Plytčina / Útesy / Súmrak / Polnoc / Priepasť = Lagon / Récifs / Pénombre / Minuit / Abîme
//     (nom de zone ≤ 35 px en petit : jauge de Préparation et HUD de plongée — « Hauts-fonds » et
//     « Crépuscule » étaient coupés ; « Bas-fonds » tient mais sonne « quartiers mal famés »)
//   rod.* = style catalogue de pêche : « Canne bambou / fibre / carbone » (le nom tient en 71 px, Profondeur infinie)
//   Nekonečná hlbina  Profondeur infinie   NA MORE     EN MER
//   vlasec         ligne                napätie        tension
//   pevnosť / záťaž  résistance / charge  praskne, PRASKOL  casse, CASSÉ !
//   ponor, ponoriť sa  plongée, plonger   hladina        surface
//   HORE           HAUT (remonter)      úlovok         prise
//   najhlbšie      au plus bas (record ou limite de profondeur, comme le bilan « Au plus bas 40 m » ;
//                  « Plus profond » seul se lisait « plus profond que… »)
//   ŤUKAJ! / ČAKAJ TAPE ! / ATTENDS     ťuknutie, ťuk  tape (bonnes / mauvaises tapes)
//   ŤAHÁ / POVOLÍ  TIRE / MOLLIT        zelená / červená  VERT / ROUGE
//   zaseknutie     ferrage              boj            combat
//   rytmus / fáza  rythme / phase       unikla         s’échappe (« Décroché ! »)
//   návnada        appât (baitNoun = 'appât' : « Appât lumineux » → puce « Appât : lumineux »)
//   prút / háčik / harpúna  canne / hameçon (l’hameçon) / harpon    výbava / nasadiť  matériel / équiper
//   druh           espèce               kus            pièce (VEĽKÝ KUS = BELLE PRISE, TROFEJ = TROPHÉE)
//   dopyt / objednávka  demande / commande   obchodník   marchand
//   úloha / stopa  quête / indice       rybári         pêcheurs
//   legenda / trofej  légende / trophée  vylepšenie (Nekonečná)  bonus
//   úroveň         niveau (niv.)        postaviť / vylepšiť  construire / améliorer
//   rebríček       classement           kariéra / záloha  partie (carrière) / copie de secours (« la copie », jamais « le secours » seul)
//   súťaž / výhra  concours / prix      výlet          sortie
//   počasie / predpoveď  météo / prévisions   spln / nov  pleine lune / nouvelle lune
//   hmla / búrka   brume / orage        pásmo          zone
//   žralok / chobotnica / medúza  requin / pieuvre / méduse   skala / prúd  rocher / courant
//   tieňový úhor   anguille d’ombre     záchranný uzol nœud de secours   zlatá návnada  appât doré
//   — Lac nucléaire (docs/JAZERO.md) —
//   Stará elektráreň  Vieille centrale (f)  Jadrové jazero  Lac nucléaire (« le lac nucléaire » dans une phrase)
//   Lodenica       Chantier naval (m) — « le Chantier » seul là où la place manque (Préparation, 148 px)
//   Laboratórium   Laboratoire (m)      jazerný vlasec / prút  ligne / canne pour le lac
//   Chladiace jazero / Zatopená hala / Šachta reaktora = Lac tiède / Hall inondé / Puits atomique,
//     courts (HUD de plongée ≤ 37 px) : Lac / Hall / Puits. « Lac de refroidissement » (100 px) ne tient pas
//     dans la liste du Chantier naval (94 px) ; « Puits du réacteur · 300–800 m » = 111 px (Encyclopédie 110) ;
//     bannière de zone en ×2 si ≤ 168 px, mais la jauge de profondeur couvre x 2–8 : titre ≤ 80 px en ×1
//     (« PUITS NUCLÉAIRE » = 82 px → son P passait sous la jauge) ou > 84 px (réduit en ×1)
//   olovený / grafitový / zirkóniový  en plomb / en graphite / en zirconium (« Ligne en plomb »,
//     « Canne plomb » ; poissons : « Brochet de plomb », « Plie de graphite »)
//   sud            fût (« Fût rouillé »)  jadro (reaktora)  cœur (du réacteur)
//   breh / BREH    rive / RIVE          NA JAZERO      SUR LE LAC
// TYPO : tutoiement ; apostrophe ’ ; espace insécable ( ) avant : ; ! ? et entre un nombre et son
// unité (%, ms, s) — le retour à la ligne ne coupe jamais là. Noms d’objets en casse de phrase
// (« Ligne en acier ») : l’UI met la première lettre en minuscule dans une phrase (HL.i18n.lower1).
(function (HL) {
  HL.i18n.add('fr', 'data', {
    // fish
    "fish.sardinka.name": "Sardine",
    "fish.sardinka.hint": "Elle mord partout, tout le temps. Même au simple ver.",
    "fish.okun.name": "Bar",
    "fish.okun.hint": "Le jour, il reste près de la surface.",
    "fish.krab.name": "Crabe",
    "fish.krab.hint": "Ne sort que la nuit. Ne résiste pas aux coquillages.",
    "fish.platesa.name": "Plie",
    "fish.platesa.hint": "Les pêcheurs disent que la pluie la fait sortir.",
    "fish.makrela.name": "Maquereau",
    "fish.makrela.hint": "Les bancs de maquereaux ne passent que le matin.",
    "fish.pyskac.name": "Labre",
    "fish.pyskac.hint": "Un habitant des récifs. Il mord presque à chaque fois.",
    "fish.papagajovka.name": "Perroquet",
    "fish.papagajovka.hint": "Coloré comme un arc-en-ciel, mais seulement au soleil.",
    "fish.zubatica.name": "Denté",
    "fish.zubatica.hint": "Il chasse quand le soleil se couche.",
    "fish.murena.name": "Murène",
    "fish.murena.hint": "Sort des rochers la nuit. Se bat de façon imprévisible.",
    "fish.barakuda.name": "Barracuda",
    "fish.barakuda.hint": "Par orage, il attaquerait tout ce qui bouge.",
    "fish.svetlonoska.name": "Poisson-lanterne",
    "fish.svetlonoska.hint": "De petites lueurs dans la pénombre. Il y en a plein, là-dessous.",
    "fish.treska.name": "Morue",
    "fish.treska.hint": "Quand la brume roule sur la mer, la morue remonte.",
    "fish.uhor.name": "Anguille",
    "fish.uhor.hint": "Chasseuse nocturne de la pénombre. Se débat comme une folle.",
    "fish.tuniak.name": "Thon",
    "fish.tuniak.hint": "Le jour, il nage en profondeur. Lourd — gare à ta ligne.",
    "fish.mesacnica.name": "Lune d’argent",
    "fish.mesacnica.hint": "On l’aurait vue à la pleine lune…",
    "fish.lampasnik.name": "Baudroie abyssale",
    "fish.lampasnik.hint": "Une petite lueur dans le noir total. Ne te laisse pas duper.",
    "fish.pazravy.name": "Grand-gosier",
    "fish.pazravy.hint": "Il n’a faim que quand aucune lune ne brille au ciel.",
    "fish.raja.name": "Raie des brumes",
    "fish.raja.hint": "Une ombre des profondeurs qui monte avec la brume.",
    "fish.sklenena.name": "Poisson de verre",
    "fish.sklenena.hint": "Transparent comme le verre. Seul l’orage le réveille.",
    "fish.velkoustka.name": "Grande-gueule",
    "fish.velkoustka.hint": "Rien qu’une gueule. Vit là où même le phare ne voit rien.",
    "fish.latimeria.name": "Cœlacanthe",
    "fish.latimeria.hint": "Un fossile vivant. Il sortirait de l’Abîme à la pleine lune.",
    "fish.sled.name": "Hareng migrateur",
    "fish.sled.hint": "Au printemps, d’immenses bancs passent par ici.",
    "fish.tekvicovka.name": "Poisson-citrouille",
    "fish.tekvicovka.hint": "Une lueur orange dans la nuit d’octobre.",
    "fish.prizrak.name": "Poisson fantôme",
    "fish.prizrak.hint": "Il est là, puis il n’y est plus. En octobre seulement.",
    "fish.dvojhlavy_kapor.name": "Carpe à deux têtes",
    "fish.dvojhlavy_kapor.hint": "Deux têtes, un seul estomac. Elle mord à presque tout.",
    "fish.svietiaca_plotica.name": "Gardon lumineux",
    "fish.svietiaca_plotica.hint": "La nuit, il brille en vert. Il nage en bancs.",
    "fish.trojoky_ostriez.name": "Perche à trois yeux",
    "fish.trojoky_ostriez.hint": "Le jour, elle suit l’appât de ses trois yeux.",
    "fish.olovena_stuka.name": "Brochet de plomb",
    "fish.olovena_stuka.hint": "Lourd comme du plomb. À l’affût entre les turbines.",
    "fish.turbinovy_sumec.name": "Silure des turbines",
    "fish.turbinovy_sumec.hint": "La nuit, il se prélasse dans les entrailles des turbines.",
    "fish.hrdzavy_uhor.name": "Anguille rouillée",
    "fish.hrdzavy_uhor.hint": "Quand il pleut, elle sort des tuyaux rouillés.",
    "fish.izotopova_mihula.name": "Lamproie isotopique",
    "fish.izotopova_mihula.hint": "Elle brille si fort qu’on la voit même dans le puits atomique.",
    "fish.grafitova_platesa.name": "Plie de graphite",
    "fish.grafitova_platesa.hint": "Par orage, elle se décolle du fond en béton du puits.",

    // legend
    "legend.zlaty_uhor.name": "Anguille d’or",
    "legend.zlaty_uhor.hint": "Les matins de soleil, on dit que quelque chose d’or brille entre les récifs.",
    "legend.hmlista_dama.name": "Dame des brumes",
    "legend.hmlista_dama.hint": "Quand la brume tombe et que la lune se cache, une silhouette blanche apparaît à Minuit.",
    "legend.kral_burky.name": "Roi de l’orage",
    "legend.kral_burky.hint": "L’orage et la pleine lune à la fois. C’est alors que quelque chose d’énorme s’éveille dans l’Abîme.",
    "legend.ladova_velryba.name": "Baleine de glace",
    "legend.ladova_velryba.hint": "L’hiver seulement. Elle chante si bas qu’on l’entend jusqu’au village.",
    "legend.bludicka.name": "Feu follet",
    "legend.bludicka.hint": "Une nuit d’octobre. Une lueur qui attire les pêcheurs vers les profondeurs.",
    "legend.strazca.name": "Gardien de l’Abîme",
    "legend.strazca.hint": "Tout au fond, quelque chose garde l’Abîme. Il ne laisse approcher que qui a pris toutes les légendes.",
    "legend.atomovy_sumec.name": "Silure atomique",
    "legend.atomovy_sumec.hint": "Les nuits de pluie, le cœur du réacteur brille plus fort que jamais. Quelque chose de gros dort à ses côtés.",

    // line
    "line.hemp.name": "Ligne en chanvre",
    "line.nylon.name": "Ligne en nylon",
    "line.braided.name": "Ligne tressée",
    "line.steel.name": "Ligne en acier",
    "line.legend.name": "Ligne légendaire",
    "line.lead.name": "Ligne en plomb",
    "line.graphite.name": "Ligne en graphite",
    "line.zirconium.name": "Ligne en zirconium",

    // rod
    "rod.bamboo.name": "Canne bambou",
    "rod.fiber.name": "Canne fibre",
    "rod.carbon.name": "Canne carbone",
    "rod.master.name": "Canne de maître",
    "rod.lead_rod.name": "Canne plomb",
    "rod.graphite_rod.name": "Canne graphite",
    "rod.zirconium_rod.name": "Canne zirconium",

    // hook
    "hook.basic.name": "Hameçon simple",
    "hook.barbed.name": "Hameçon à ardillon",
    "hook.circle.name": "Hameçon rond",
    "hook.titan.name": "Hameçon en titane",

    // harpoon
    "harpoon.name": "Harpon",

    // bait
    "bait.worm.name": "Ver",
    "bait.worm.desc": "Petits poissons du Lagon",
    "bait.worm.lakeDesc": "Poissons de surface",
    "bait.shell.name": "Coquillages",
    "bait.shell.desc": "Poissons des récifs, crabes",
    "bait.shell.lakeDesc": "Anguilles et carpes",
    "bait.squid.name": "Calmar",
    "bait.squid.desc": "Prédateurs et poissons moyens",
    "bait.glow.name": "Appât lumineux",
    "bait.glow.desc": "Poissons des profondeurs",
    "bait.glow.lakeDesc": "Poissons du puits",
    "bait.gold.name": "Appât doré",
    "bait.gold.desc": "Plus de chances de légendes",

    // building
    "building.chatrc.name": "Cabane",
    "building.chatrc.level.0": "Cabane en ruine",
    "building.chatrc.level.1": "Sommeil : avancer au matin ou à la nuit",
    "building.chatrc.level.2": "Plus de place pour les poissons",
    "building.chatrc.level.3": "Foyer douillet (cosmétique)",
    "building.trhovisko.name": "Marché",
    "building.trhovisko.level.0": "—",
    "building.trhovisko.level.1": "Vente de poissons, prix et forte demande",
    "building.trhovisko.level.2": "Courbe des prix sur 3 jours",
    "building.trhovisko.level.3": "Commandes de marchands avec bonus",
    "building.dielna.name": "Atelier",
    "building.dielna.level.0": "—",
    "building.dielna.level.1": "Lignes, cannes et hameçons de base",
    "building.dielna.level.2": "Matériel avancé et harpons",
    "building.dielna.level.3": "Ligne en acier et ligne légendaire",
    "building.navnadaren.name": "Boutique d’appâts",
    "building.navnadaren.level.0": "Cabanon vide",
    "building.navnadaren.level.1": "Coquillages",
    "building.navnadaren.level.2": "Calmar",
    "building.navnadaren.level.3": "Appât lumineux",
    "building.meteostanica.name": "Station météo",
    "building.meteostanica.level.0": "Rien — juste un coup d’œil au ciel",
    "building.meteostanica.level.1": "Prévisions sur 6 heures",
    "building.meteostanica.level.2": "Prévisions sur 24 heures",
    "building.meteostanica.level.3": "Prévisions sur 3 jours et phase lunaire",
    "building.majak.name": "Phare",
    "building.majak.level.0": "Tour éteinte",
    "building.majak.level.1": "Meilleure visibilité la nuit",
    "building.majak.level.2": "Visibilité à Minuit",
    "building.majak.level.3": "Ouvre l’Abîme et la Profondeur infinie",
    "building.krcma.name": "Taverne",
    "building.krcma.level.0": "Fenêtres condamnées",
    "building.krcma.level.1": "Les pêcheurs donnent des conseils",
    "building.krcma.level.2": "Quêtes des pêcheurs",
    "building.krcma.level.3": "Indices sur les légendes et appât doré",
    "building.akvarium.name": "Aquarium",
    "building.akvarium.level.0": "Chantier",
    "building.akvarium.level.1": "Poissons exposés",
    "building.akvarium.level.2": "Touristes : petit revenu passif",
    "building.akvarium.level.3": "Trophées des légendes",
    "building.lodenica.name": "Chantier naval",
    "building.lodenica.level.0": "Barque retournée",
    "building.lodenica.level.1": "Barque blindée : lac et hall",
    // carte de niveau (104 px en petit, 2 lignes ; panneau « Tous les niveaux » ~86 px) : espaces insécables =
    // « lac et hall », « Puits atomique », « jusqu’au cœur » et « en zirconium » passent ensemble à la ligne
    "building.lodenica.level.2": "Coque en plomb : Puits atomique",
    "building.lodenica.level.3": "Cage de plongée : jusqu’au cœur",
    "building.laboratorium.name": "Laboratoire",
    "building.laboratorium.level.0": "Conteneur verrouillé",
    "building.laboratorium.level.1": "Lignes et cannes en plomb",
    "building.laboratorium.level.2": "Lignes et cannes en graphite",
    "building.laboratorium.level.3": "Lignes et cannes en zirconium",

    // zone
    "zone.plytcina.name": "Lagon",
    "zone.plytcina.desc": "Clarté, petits prix, méduses",
    "zone.utesy.name": "Récifs",
    "zone.utesy.desc": "Poissons colorés, rochers",
    "zone.sumrak.name": "Pénombre",
    "zone.sumrak.desc": "Demi-jour, premiers prédateurs",
    "zone.polnoc.name": "Minuit",
    "zone.polnoc.desc": "Obscurité, poissons lumineux",
    "zone.priepast.name": "Abîme",
    "zone.priepast.desc": "Noir absolu, légendes",
    "zone.nekonecna.name": "Profondeur infinie",
    "zone.nekonecna.desc": "Personne n’est jamais allé si bas",
    // lac nucléaire : sous-titre de bannière « 80–300 m · <desc> » ≤ 158 px en petit (centré ; plus large, son début
    // passe sous la jauge de profondeur, x 2–8) ; short = HUD de plongée ≤ 37 px
    "zone.chladiace.name": "Lac tiède",
    "zone.chladiace.desc": "Eau verte, premiers mutants",
    "zone.chladiace.short": "Lac",
    "zone.hala.name": "Hall inondé",
    "zone.hala.desc": "Turbines, passerelles, fûts",
    "zone.hala.short": "Hall",
    "zone.sachta.name": "Puits atomique",
    "zone.sachta.desc": "Barres de contrôle, cœur bleu",
    "zone.sachta.short": "Puits",

    // location
    "location.more.name": "Mer",
    "location.jadro.name": "Lac nucléaire",

    // period
    "period.morning.name": "Matin",
    "period.day.name": "Jour",
    "period.evening.name": "Soir",
    "period.night.name": "Nuit",

    // weather
    "weather.sun.name": "Soleil",
    "weather.cloudy.name": "Nuageux",
    "weather.rain.name": "Pluie",
    "weather.fog.name": "Brume",
    "weather.storm.name": "Orage",

    // moon
    "moon.0": "Nouvelle lune",
    "moon.1": "Premier croissant",
    "moon.2": "Premier quartier",
    "moon.3": "Lune croissante",
    "moon.4": "Pleine lune",
    "moon.5": "Lune décroissante",
    "moon.6": "Dernier quartier",
    "moon.7": "Dernier croissant",

    // event
    "event.spring.name": "Migration",
    "event.spring.desc": "Bancs de poissons migrateurs, prix doublés pour certaines espèces",
    "event.summer.name": "Fête de l’été",
    "event.summer.desc": "Concours de pêche au village : le poisson le plus lourd du jour",
    "event.halloween.name": "Abysses d’Halloween",
    "event.halloween.desc": "Poissons effrayants, mer plus sombre, légende de saison",
    "event.winter.name": "Pêche d’hiver",
    "event.winter.desc": "Baleine de glace, surface gelée, village de Noël",

    // cond
    "cond.any": "Toujours",
    "cond.morning": "Matin",
    "cond.day": "Jour",
    "cond.evening": "Soir",
    "cond.night": "Nuit",
    "cond.sun": "Soleil",
    "cond.cloudy": "Nuageux",
    "cond.rain": "Pluie",
    "cond.fog": "Brume",
    "cond.storm": "Orage",
    "cond.fullmoon": "Pleine lune",
    "cond.newmoon": "Nouvelle lune",
    "cond.spring": "Migration",
    "cond.summer": "Fête de l’été",
    "cond.halloween": "Halloween",
    "cond.winter": "Pêche d’hiver",
    "cond.guardian": "Phare 3 et toutes les légendes",

    // hazard
    "hazard.jelly.name": "Méduse",
    "hazard.rock.name": "Rocher pointu",
    "hazard.current.name": "Courant",

    // lakeHazard — les mêmes dangers dans le lac nucléaire (le fût rouillé y remplace le rocher)
    "lakeHazard.jelly.name": "Méduse lumineuse",
    "lakeHazard.rock.name": "Fût rouillé",
    "lakeHazard.current.name": "Courant",

    // predator
    "predator.shark.name": "Requin",
    "predator.octopus.name": "Pieuvre",
    "predator.shadowEel.name": "Anguille d’ombre",

    // perk
    "perk.strength.name": "+20 % de résistance de la ligne",
    "perk.grip.name": "Ferrage solide : +30 % de progrès par tape",
    "perk.jellyImmune.name": "Méduses sans effet",
    "perk.harpoon.name": "+1 harpon",
    "perk.light.name": "Lumière plus large",
    "perk.slowEscape.name": "Les poissons fuient 40 % moins vite",
    "perk.tolerance.name": "+60 ms de tolérance au rythme",
    "perk.sink.name": "+30 % de vitesse de descente",
    "perk.lure.name": "+30 % de chances de touche",
    "perk.sharkSlow.name": "Le requin attaque 4 s plus tard",
    "perk.rockProof.name": "Rochers sans effet sur la ligne",
    "perk.lightDepth.name": "La profondeur pèse 15 % de moins",
    "perk.knot.name": "Nœud de secours : ta 1re casse ne coûte que la moitié de la prise",

    // tip
    "tip.0": "Plus tu descends, plus un poisson charge ta ligne. À 500 mètres, il pèse trois fois plus.",
    "tip.1": "Si tu descends avec une ligne pleine, la tension monte même sans nouveau poisson.",
    "tip.2": "Tape quand le poisson mollit. Taper pendant qu’il tire ne fait que secouer la ligne.",
    "tip.3": "Pendant un combat, impossible de remonter. Commencer un combat, c’est s’engager.",
    "tip.4": "N’aie pas peur d’un gros poisson. Le pire, c’est de le combattre avec une ligne déjà pleine.",
    "tip.5": "Chaque poisson vendu fait baisser sa demande. Change de profondeur, d’heure ou de météo.",
    "tip.6": "Par orage, moins de pêcheurs sortent en mer. Les prix montent, mais le danger aussi.",
    "tip.7": "Une méduse tend la ligne un moment. Un rocher l’affaiblit jusqu’à ce que tu remontes.",
    "tip.8": "Le requin prend toujours le poisson le plus précieux. Un harpon de l’Atelier le fait fuir.",
    "tip.9": "Pour te débarrasser d’une pieuvre, secoue l’hameçon d’un côté à l’autre.",
    "tip.10": "Ne reste pas immobile dans l’Abîme. C’est justement ce qu’attend l’anguille d’ombre.",
    "tip.11": "La pluie attire les poissons vers la surface.",
    "tip.12": "On dit que la brume amène des espèces mystérieuses.",
    "tip.13": "À la pleine lune et à la nouvelle lune apparaissent des poissons qu’on ne voit pas autrement.",
    "tip.14": "Chaque espèce se bat à sa façon. Retiens son rythme, et la prochaine sera plus facile.",
    "tip.15": "Les poissons des profondeurs mordent à l’appât lumineux. Le ver n’attire que le menu fretin du Lagon.",
    "tip.16": "Derrière le village se dresse une vieille centrale. On dit que des poissons à deux têtes nagent dans son lac.",
    "tip.17": "Dans le lac nucléaire, ni requins ni pieuvres. Par contre, des fûts rouillés, ça oui.",

    // tutorial
    "tutorial.sink": "Maintiens S / clic gauche / doigt et l’hameçon descend.",
    "tutorial.move": "A / D ou souris : l’hameçon va à gauche et à droite.",
    "tutorial.bite": "Ça mord ! Tape (espace / clic) quand c’est VERT.",
    "tutorial.red": "Ne tape pas quand c’est ROUGE. La ligne se tendrait.",
    "tutorial.up": "Appuie sur W ou HAUT et ta prise est à l’abri.",
    "tutorial.tension": "L’arc en haut montre la tension. Au-delà de la résistance, la ligne casse. ↓×2 = à cette profondeur, chaque poisson pèse deux fois plus.",
    "tutorial.again": "Ta prise est à l’abri. Maintiens S (ou la souris sur l’eau) pour replonger, ou rentre au Port.",
    "tutorial.againSnap": "Ton matériel est intact, la ligne est renouée. Maintiens S (ou la souris sur l’eau) pour replonger, ou rentre au Port.",
    "tutorial.againEmpty": "Maintiens S (ou la souris sur l’eau) pour replonger, ou rentre au Port.",

    // tutorialTouch
    "tutorialTouch.sink": "Garde le doigt appuyé et l’hameçon descend.",
    "tutorialTouch.move": "Glisse le doigt à gauche et à droite — en glissant sur le côté, l’hameçon ne descend pas.",
    "tutorialTouch.bite": "Ça mord ! Tape quand c’est VERT.",
    "tutorialTouch.up": "Touche HAUT et ta prise est à l’abri.",
    "tutorialTouch.again": "Ta prise est à l’abri. Garde le doigt sur l’eau pour replonger, ou rentre au Port.",
    "tutorialTouch.againSnap": "Ton matériel est intact, la ligne est renouée. Garde le doigt sur l’eau pour replonger, ou rentre au Port.",
    "tutorialTouch.againEmpty": "Garde le doigt sur l’eau pour replonger, ou rentre au Port.",

    // unlock
    "unlock.dielna3": "L’Atelier peut passer au niveau 3 — ligne en acier",
    "unlock.majak3": "Le Phare peut passer au niveau 3 — Abîme et Profondeur infinie",
    "unlock.legendLine": "L’Atelier propose la Ligne légendaire",
    "unlock.trophy": "Trophée à l’Aquarium",
    "unlock.ending": "Le Gardien de l’Abîme est pris. Le village fait la fête !",

    // rhythm
    "rhythm.fastRegular.name": "Rapide régulier",
    "rhythm.fastRegular.desc": "Phases courtes et égales.",
    "rhythm.regular.name": "Régulier",
    "rhythm.regular.desc": "Alternance calme et régulière.",
    "rhythm.slowStrong.name": "Lent et fort",
    "rhythm.slowStrong.desc": "Longues tractions, relâches courtes.",
    "rhythm.chaotic.name": "Chaotique",
    "rhythm.chaotic.desc": "Phases de durée aléatoire.",
    "rhythm.explosive.name": "Explosif",
    "rhythm.explosive.desc": "Longue relâche calme, puis une traction courte et brutale.",
    "rhythm.fakePause.name": "Fausses pauses",
    "rhythm.fakePause.desc": "Le vert clignote un instant et vire aussitôt au rouge.",
    "rhythm.waves.name": "Vagues",
    "rhythm.waves.desc": "Le tempo accélère et ralentit en douceur.",
    "rhythm.playful.name": "Joueur",
    "rhythm.playful.desc": "Séries rapides et lentes en alternance.",
    "rhythm.extremeFast.name": "Ultra rapide",
    "rhythm.extremeFast.desc": "Phases éclair de moins d’un quart de seconde.",
    "rhythm.fakeChaos.name": "Chaos et fausses pauses",
    "rhythm.fakeChaos.desc": "Phases de durée aléatoire et un vert qui ment.",
    "rhythm.slowHuge.name": "Lent et énorme",
    "rhythm.slowHuge.desc": "Combat lent, très longues tractions d’une force énorme.",
    "rhythm.mixA.name": "Mélange : rapide et fort",
    "rhythm.mixA.desc": "Des blocs de rythme rapide régulier et lent fort alternent.",
    "rhythm.mixB.name": "Mélange : pauses et chaos",
    "rhythm.mixB.desc": "Fausses pauses et phases chaotiques en alternance.",
    "rhythm.all.name": "Tous les rythmes",
    "rhythm.all.desc": "Un autre rythme toutes les quelques tractions, tous à tour de rôle.",

    // tier
    "tier.maly.name": "petit",
    "tier.maly.tag": "PETIT",
    "tier.bezny.name": "normal",
    "tier.bezny.tag": "NORMAL",
    "tier.velky.name": "gros",
    "tier.velky.tag": "BELLE PRISE",
    "tier.trofejny.name": "trophée",
    "tier.trofejny.tag": "TROPHÉE !",
  });
})(globalThis.HL);
