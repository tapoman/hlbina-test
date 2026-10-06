// Ryby. Prepis tabuľky 8.1 dizajnového dokumentu + legendy (9.3) + sezónne druhy.
//
// Polia:
//   id        stabilný kľúč (ukladá sa do save — NEMENIŤ)
//   name      slovenský názov
//   zone      id pásma z data/world.js
//   depth     [min, max] m — kde sa druh objavuje (v rámci pásma, legendy užšie)
//   weight    typická váha v kg; jednotlivé kusy majú váhu weight × násobok triedy (sim/specimen.js:
//             malý / bežný / veľký / trofejný). fishWeightVar = starý rozptyl ±25 % (už ho nič nelosuje).
//   lineKg    iba legendy: záťaž na vlasci v kg (pred hĺbkovým násobkom).
//             Legendy "plávajú samy" — 180 kg Kráľ búrky by inak pri ×8 nikdy
//             nešiel chytiť. Bežné ryby: lineKg = váha kusu.
//   price     základná cena v € za kus typickej váhy
//   cond      podmienky výskytu, všetky musia platiť (tokeny: data/world.js COND)
//   rhythm    typ rytmu boja (sim/rhythm.js); legendy majú phases[]
//   pull      sila ťahu 1,0–2,5 (ťah vo fáze ŤAHÁ = váha × pull)
//   chance    základná šanca na záber pri priblížení (0–1); vzácne = opatrné
//   bait      { ideal: [...], ok: [...] } — ostatné návnady sú nevhodné (×0,2)
//   glow      svieti v tme (viditeľná aj mimo kužeľa svetla)
//   size      16 | 32 | 64 — veľkostná trieda sprite (dizajn 14.1)
//   hint      nápoveda v encyklopédii, kým druh nie je chytený
//   added     true = nie je v tabuľke dokumentu, doplnené (dokument: "dá sa rozširovať")
(function (HL) {
  var W = 0.25; // bežný rozptyl váhy ±25 %

  // Ťah a hĺbka ťažkých druhov sú zvolené tak, aby NAJŤAŽŠÍ kus (trofejný × 1,5, sim/specimen.js) SÁM
  // neprekročil pevnosť najslabšieho vlasca, ktorý od druhu ešte dostane ZÁBER (tests/unit/data.test.js,
  // line_reach.test.js) — inak isté prasknutie bez šance, dokument 19: "žiadne nefér prasknutia".
  // DOSAH ZÁBERU: ryba ide za návnadou až ~22 m aj mimo svojho rozsahu (+ vlnenie = sim/dive.js reachM,
  // 25 m), takže háčik na konci konopného vlasca (100 m) berie druhy od 125 m vyššie, nylonového od 325 m.
  // Revízia 2026-09-27: trofejná mureňa (4 × 1,5 × 2,0 = 12 kg) trhala konopný vlasec 27× z 27 aj od
  // 100 m. Oprava ŤAHOM tam, kde je druh zárobkom lacného vlasca: mureňa 1,65 (9,9 kg, konopný ju berie ako
  // pred triedami, rozsah od 80 m ako pôvodne) a tuniak 1,35 (24,3 kg na nylone). Presun pod dosah vlasca
  // (mureňa 130 m, tuniak 330 m) zasekol 1–4 z 20 kariér robota na 900 ponoroch. Barakuda (5 × 2,2 = 11 kg
  // už TYPICKÁ, na konopnom nefér aj pred triedami, len v búrke) žije od 130 m — ťah 2,2 je jej výbušný rytmus.
  // Tuniak ostáva ťažký visením: 12 kg × hĺbkový násobok 2,2 v 300 m = 26 kg (výstražný "!" v ponore).
  HL.data.fish = [
    // ------------------------------------------------------------ Plytčina 0–50 m
    { id: 'sardinka', name: 'Sardinka', zone: 'plytcina', depth: [0, 50], weight: 0.2, price: 2,
      cond: ['any'], rhythm: 'fastRegular', pull: 1.0, chance: 0.60,
      bait: { ideal: ['worm'], ok: ['shell'] }, glow: false, size: 16,
      hint: 'Tá sa chytí vždy a všade. Aj na obyčajného červíka.' },
    { id: 'okun', name: 'Morský okúň', zone: 'plytcina', depth: [5, 50], weight: 1.0, price: 6,
      cond: ['day'], rhythm: 'regular', pull: 1.3, chance: 0.45,
      bait: { ideal: ['worm'], ok: ['shell', 'squid'] }, glow: false, size: 16,
      hint: 'Cez deň sa zdržiava pri hladine.' },
    { id: 'krab', name: 'Krab', zone: 'plytcina', depth: [15, 50], weight: 0.8, price: 8,
      cond: ['night'], rhythm: 'slowStrong', pull: 1.6, chance: 0.40,
      bait: { ideal: ['shell'], ok: ['worm'] }, glow: false, size: 16,
      hint: 'Vylieza až v noci. Mušle nevydrží.' },
    { id: 'platesa', name: 'Platesa', zone: 'plytcina', depth: [10, 50], weight: 1.2, price: 7,
      cond: ['rain'], rhythm: 'waves', pull: 1.3, chance: 0.45,
      bait: { ideal: ['worm'], ok: ['shell'] }, glow: false, size: 16,
      hint: 'Rybári vravia, že ju vyháňa dážď.' },

    // ------------------------------------------------------------ Útesy 50–200 m
    { id: 'makrela', name: 'Makrela', zone: 'utesy', depth: [50, 160], weight: 1.5, price: 10,
      cond: ['morning'], rhythm: 'fastRegular', pull: 1.4, chance: 0.45,
      bait: { ideal: ['shell'], ok: ['worm', 'squid'] }, glow: false, size: 16,
      hint: 'Kŕdle makriel sa ukazujú len ráno.' },
    { id: 'pyskac', name: 'Pyskáč', zone: 'utesy', depth: [50, 200], weight: 0.8, price: 9,
      cond: ['any'], rhythm: 'regular', pull: 1.2, chance: 0.50,
      bait: { ideal: ['shell'], ok: ['worm'] }, glow: false, size: 16, added: true,
      hint: 'Obyvateľ útesov. Zobne takmer vždy.' },
    { id: 'papagajovka', name: 'Papagájovka', zone: 'utesy', depth: [60, 180], weight: 2.0, price: 18,
      cond: ['sun'], rhythm: 'playful', pull: 1.5, chance: 0.35,
      bait: { ideal: ['shell'], ok: ['worm'] }, glow: false, size: 32,
      hint: 'Farebná ako dúha, ale len keď svieti slnko.' },
    { id: 'zubatica', name: 'Zubatica', zone: 'utesy', depth: [60, 200], weight: 2.5, price: 22,
      cond: ['evening'], rhythm: 'regular', pull: 1.6, chance: 0.35,
      bait: { ideal: ['squid'], ok: ['shell'] }, glow: false, size: 32, added: true,
      hint: 'Loví, keď slnko zapadá.' },
    { id: 'murena', name: 'Mureňa', zone: 'utesy', depth: [80, 200], weight: 4.0, price: 30,
      cond: ['night'], rhythm: 'chaotic', pull: 1.65, chance: 0.30,
      bait: { ideal: ['squid'], ok: ['shell'] }, glow: false, size: 32,
      hint: 'V noci vylieza zo skál. Bojuje nevyspytateľne.' },
    { id: 'barakuda', name: 'Barakuda', zone: 'utesy', depth: [130, 200], weight: 5.0, price: 35,
      cond: ['storm'], rhythm: 'explosive', pull: 2.2, chance: 0.30,
      bait: { ideal: ['squid'], ok: ['shell'] }, glow: false, size: 32,
      hint: 'Za búrky vraj útočí na všetko, čo sa hýbe.' },

    // ------------------------------------------------------------ Súmrak 200–600 m
    { id: 'svetlonoska', name: 'Svetlonoska', zone: 'sumrak', depth: [200, 600], weight: 0.3, price: 22,
      cond: ['any'], rhythm: 'fastRegular', pull: 1.1, chance: 0.50,
      bait: { ideal: ['squid'], ok: ['shell', 'glow'] }, glow: true, size: 16, added: true,
      hint: 'Drobné svetielka v šere. Je ich tam dole plno.' },
    { id: 'treska', name: 'Treska', zone: 'sumrak', depth: [200, 500], weight: 6.0, price: 40,
      cond: ['fog'], rhythm: 'slowStrong', pull: 1.8, chance: 0.35,
      bait: { ideal: ['squid'], ok: ['shell'] }, glow: false, size: 32,
      hint: 'Keď sa nad morom valí hmla, treska stúpa.' },
    { id: 'uhor', name: 'Úhor', zone: 'sumrak', depth: [220, 600], weight: 3.0, price: 45,
      cond: ['night'], rhythm: 'chaotic', pull: 1.9, chance: 0.35,
      bait: { ideal: ['squid'], ok: ['glow'] }, glow: false, size: 32,
      hint: 'Nočný lovec zo šera. Mrská sa ako šibnutý.' },
    { id: 'tuniak', name: 'Tuniak', zone: 'sumrak', depth: [300, 600], weight: 12.0, price: 80,
      cond: ['day'], rhythm: 'slowStrong', pull: 1.35, chance: 0.25,
      bait: { ideal: ['squid'], ok: [] }, glow: false, size: 32,
      hint: 'Cez deň ťahá v hĺbke. Ťažký — daj si pozor na vlasec.' },
    { id: 'mesacnica', name: 'Striebristá mesačnica', zone: 'sumrak', depth: [250, 600], weight: 5.0, price: 90,
      cond: ['fullmoon'], rhythm: 'waves', pull: 1.6, chance: 0.25,
      bait: { ideal: ['squid'], ok: ['glow'] }, glow: true, size: 32,
      hint: 'Vraj ju videli pri splne…' },

    // ------------------------------------------------------------ Polnoc 600–1500 m
    { id: 'lampasnik', name: 'Hlbinár s lampášom', zone: 'polnoc', depth: [600, 1500], weight: 4.0, price: 120,
      cond: ['any'], rhythm: 'fakePause', pull: 1.7, chance: 0.30,
      bait: { ideal: ['glow'], ok: ['squid'] }, glow: true, size: 32,
      hint: 'Svetielko v úplnej tme. Nenechaj sa ním oklamať.' },
    { id: 'pazravy', name: 'Pažravý úhor', zone: 'polnoc', depth: [650, 1500], weight: 3.0, price: 150,
      cond: ['newmoon'], rhythm: 'fakeChaos', pull: 2.0, chance: 0.25,
      bait: { ideal: ['glow'], ok: ['squid'] }, glow: true, size: 32,
      hint: 'Hladný je len vtedy, keď na nebi nesvieti mesiac.' },
    { id: 'raja', name: 'Hmlistá raja', zone: 'polnoc', depth: [700, 1500], weight: 15.0, price: 200,
      cond: ['fog'], rhythm: 'waves', pull: 2.0, chance: 0.20,
      bait: { ideal: ['glow'], ok: ['squid'] }, glow: true, size: 32,
      hint: 'Hlbinný tieň, ktorý sa zdvíha s hmlou.' },

    // ------------------------------------------------------------ Priepasť 1500+ m
    { id: 'sklenena', name: 'Sklenená ryba', zone: 'priepast', depth: [1500, 3000], weight: 1.0, price: 300,
      cond: ['storm'], rhythm: 'extremeFast', pull: 1.5, chance: 0.25,
      bait: { ideal: ['glow'], ok: [] }, glow: true, size: 16,
      hint: 'Priehľadná ako sklo. Prebúdza ju až búrka.' },
    { id: 'velkoustka', name: 'Veľkoústka', zone: 'priepast', depth: [1500, 3000], weight: 6.0, price: 250,
      cond: ['any'], rhythm: 'chaotic', pull: 1.9, chance: 0.30,
      bait: { ideal: ['glow'], ok: ['squid'] }, glow: true, size: 32, added: true,
      hint: 'Samá papuľa. Žije tam, kam nedovidí ani maják.' },
    { id: 'latimeria', name: 'Latiméria', zone: 'priepast', depth: [1500, 3000], weight: 40.0, price: 500,
      cond: ['fullmoon'], rhythm: 'slowHuge', pull: 2.5, chance: 0.15,
      bait: { ideal: ['glow'], ok: ['squid'] }, glow: false, size: 64,
      hint: 'Živá fosília. Pri splne vraj vystupuje z priepasti.' },

    // ------------------------------------------------------------ sezónne druhy
    { id: 'sled', name: 'Sťahovavý sleď', zone: 'plytcina', depth: [5, 50], weight: 0.4, price: 5,
      cond: ['spring'], rhythm: 'fastRegular', pull: 1.1, chance: 0.60, school: true,
      bait: { ideal: ['worm'], ok: ['shell'] }, glow: false, size: 16, event: 'spring',
      hint: 'Na jar tadiaľto tiahnu obrovské kŕdle.' },
    { id: 'tekvicovka', name: 'Tekvicovka', zone: 'utesy', depth: [50, 200], weight: 1.5, price: 25,
      cond: ['halloween', 'night'], rhythm: 'chaotic', pull: 1.5, chance: 0.40,
      bait: { ideal: ['worm', 'shell'], ok: ['squid'] }, glow: true, size: 16, event: 'halloween',
      hint: 'Oranžové svetielko v októbrovej noci.' },
    { id: 'prizrak', name: 'Prízračná ryba', zone: 'sumrak', depth: [250, 600], weight: 2.0, price: 70,
      cond: ['halloween'], rhythm: 'fakePause', pull: 1.6, chance: 0.35,
      bait: { ideal: ['glow'], ok: ['squid'] }, glow: true, size: 32, event: 'halloween',
      hint: 'Je tam, a potom zase nie je. Len v októbri.' },
  ];

  // Legendy (9.3). Boj má 3 fázy; postup 0→100 % prechádza fázami pri 1/3 a 2/3.
  // phases[i].rhythm = typ rytmu v tej fáze, pullMult násobí pull.
  // hazards = čo počas boja vstupuje do napätia (sim/dive.js).
  HL.data.legends = [
    { id: 'zlaty_uhor', name: 'Zlatý úhor', zone: 'utesy', depth: [80, 190], weight: 9, lineKg: 9, price: 1200,
      cond: ['morning', 'sun'], pull: 1.8, chance: 0.45, glow: true, size: 64,
      bait: { ideal: ['gold', 'shell'], ok: ['squid', 'worm'] },
      phases: [{ rhythm: 'fastRegular', pullMult: 1.0 }, { rhythm: 'playful', pullMult: 1.1 }, { rhythm: 'fastRegular', pullMult: 1.2, tempo: 0.8 }],
      hazards: [], reward: { unlock: 'dielna3' },
      hint: 'Ráno, keď je slnečno, sa medzi útesmi vraj niečo zlatisto zablysne.' },
    { id: 'hmlista_dama', name: 'Hmlistá dáma', zone: 'polnoc', depth: [620, 1400], weight: 30, lineKg: 9, price: 4000,
      cond: ['fog', 'newmoon'], pull: 2.0, chance: 0.40, glow: true, size: 64,
      bait: { ideal: ['gold', 'glow'], ok: ['squid'] },
      phases: [{ rhythm: 'fakePause', pullMult: 1.0 }, { rhythm: 'fakePause', pullMult: 1.1, tempo: 0.9 }, { rhythm: 'fakePause', pullMult: 1.2, tempo: 0.8 }],
      hazards: ['jelly'], reward: { unlock: 'majak3' },
      hint: 'Keď je hmla a mesiac sa schová, v Polnoci sa zjavuje biela postava.' },
    { id: 'kral_burky', name: 'Kráľ búrky', zone: 'priepast', depth: [1550, 2400], weight: 180, lineKg: 15, price: 12000,
      cond: ['storm', 'fullmoon'], pull: 2.5, chance: 0.40, glow: false, size: 64,
      bait: { ideal: ['gold', 'glow'], ok: ['squid'] },
      phases: [{ rhythm: 'slowStrong', pullMult: 1.0 }, { rhythm: 'chaotic', pullMult: 1.1 }, { rhythm: 'slowHuge', pullMult: 1.25 }],
      hazards: ['current', 'lightning'], reward: { unlock: 'legendLine' },
      hint: 'Búrka a spln naraz. Vtedy sa v priepasti prebúdza niečo obrovské.' },
    { id: 'ladova_velryba', name: 'Ľadová veľryba', zone: 'priepast', depth: [1800, 2600], weight: 2400, lineKg: 16, price: 15000,
      cond: ['winter'], pull: 2.2, chance: 0.40, glow: true, size: 64, event: 'winter',
      bait: { ideal: ['gold', 'squid'], ok: ['glow'] },
      phases: [{ rhythm: 'slowHuge', pullMult: 1.0, tempo: 1.3 }, { rhythm: 'waves', pullMult: 1.0, tempo: 1.3 }, { rhythm: 'slowHuge', pullMult: 1.15, tempo: 1.5 }],
      hazards: ['jelly'], reward: { unlock: 'trophy' }, needProgress: 1.6,
      hint: 'Len v zime. Spieva tak hlboko, že ju počuť až v dedine.' },
    { id: 'bludicka', name: 'Bludička hlbín', zone: 'polnoc', depth: [650, 1300], weight: 12, lineKg: 10, price: 3000,
      cond: ['halloween', 'night'], pull: 1.9, chance: 0.40, glow: true, size: 64, event: 'halloween',
      bait: { ideal: ['gold', 'glow'], ok: ['squid'] },
      phases: [{ rhythm: 'fakePause', pullMult: 1.0 }, { rhythm: 'chaotic', pullMult: 1.1 }, { rhythm: 'fakeChaos', pullMult: 1.2 }],
      hazards: ['jelly'], reward: { unlock: 'trophy' },
      hint: 'Októbrová noc. Svetielko, ktoré láka rybárov do hlbín.' },
    { id: 'strazca', name: 'Strážca priepasti', zone: 'priepast', depth: [2800, 3000], weight: 5000, lineKg: 25, price: 50000,
      cond: ['guardian'], pull: 2.5, chance: 0.50, glow: true, size: 64, final: true,
      bait: { ideal: ['gold'], ok: ['glow', 'squid'] },
      phases: [{ rhythm: 'mixA', pullMult: 1.0 }, { rhythm: 'mixB', pullMult: 1.15 }, { rhythm: 'all', pullMult: 1.3 }],
      hazards: ['jelly', 'current', 'lightning'], reward: { unlock: 'ending' }, needProgress: 1.4,
      hint: 'Na samom dne niečo stráži priepasť. Pustí k sebe len toho, kto chytil všetky legendy.' },
  ];

  // Jadrové jazero (docs/JAZERO.md): ryby-mutanty Starej elektrárne. Vlastné zoznamy — more sa nemení
  // (každý výber z HL.data.fish/legends ostáva len morský). Pravidlá ako v mori; location = miesto.
  // Ťah: najťažší kus (trofejný × 1,5) unesie najslabší JAZERNÝ vlasec, ktorý od druhu dostane záber
  // (tests/unit/lake.test.js): olovený 45 kg do 150 m, grafitový 70 kg do 450 m (data/gear.js).
  // Ceny haly sú o ~20 % vyššie ako v návrhu (docs/JAZERO.md): ťažké ryby haly sa na olovený vlasec zmestia len
  // 2–3 a robot (tools/lake_balance.js) by pri vstupe do jazera zarábal 0,75× mora.
  HL.data.lakeFish = [
    // ------------------------------------------------------------ Chladiace jazero 0–80 m
    { id: 'dvojhlavy_kapor', name: 'Dvojhlavý kapor', zone: 'chladiace', location: 'jadro', depth: [0, 80], weight: 3.0, price: 16,
      cond: ['any'], rhythm: 'regular', pull: 1.5, chance: 0.50,
      bait: { ideal: ['worm'], ok: ['shell'] }, glow: false, size: 32,
      hint: 'Dve hlavy, jeden žalúdok. Zoberie skoro čokoľvek.' },
    { id: 'svietiaca_plotica', name: 'Svietiaca plotica', zone: 'chladiace', location: 'jadro', depth: [5, 80], weight: 0.4, price: 12,
      cond: ['night'], rhythm: 'fastRegular', pull: 1.1, chance: 0.45, school: true,
      bait: { ideal: ['worm'], ok: ['glow'] }, glow: true, size: 16,
      hint: 'V noci svieti nazeleno. Pláva v kŕdľoch.' },
    { id: 'trojoky_ostriez', name: 'Trojoký ostriež', zone: 'chladiace', location: 'jadro', depth: [10, 80], weight: 1.2, price: 14,
      cond: ['day'], rhythm: 'playful', pull: 1.4, chance: 0.40,
      bait: { ideal: ['worm'], ok: ['shell'] }, glow: false, size: 16,
      hint: 'Cez deň sleduje návnadu všetkými tromi očami.' },

    // ------------------------------------------------------------ Zatopená hala 80–300 m
    { id: 'olovena_stuka', name: 'Olovená šťuka', zone: 'hala', location: 'jadro', depth: [80, 300], weight: 6.0, price: 55,
      cond: ['any'], rhythm: 'explosive', pull: 1.8, chance: 0.35,
      bait: { ideal: ['squid'], ok: ['shell'] }, glow: false, size: 32,
      hint: 'Ťažká ako olovo. Číha medzi turbínami.' },
    { id: 'turbinovy_sumec', name: 'Turbínový sumec', zone: 'hala', location: 'jadro', depth: [100, 300], weight: 10.0, price: 72,
      cond: ['night'], rhythm: 'slowStrong', pull: 1.6, chance: 0.30,
      bait: { ideal: ['squid'], ok: ['worm'] }, glow: false, size: 32,
      hint: 'V noci sa vyvaľuje v útrobách turbín.' },
    { id: 'hrdzavy_uhor', name: 'Hrdzavý úhor', zone: 'hala', location: 'jadro', depth: [90, 300], weight: 3.0, price: 50,
      cond: ['rain'], rhythm: 'chaotic', pull: 1.9, chance: 0.30,
      bait: { ideal: ['shell'], ok: ['squid'] }, glow: false, size: 32,
      hint: 'Keď prší, vylieza z hrdzavých rúr.' },

    // ------------------------------------------------------------ Šachta reaktora 300–800 m
    { id: 'izotopova_mihula', name: 'Izotopová mihuľa', zone: 'sachta', location: 'jadro', depth: [300, 800], weight: 2.0, price: 90,
      cond: ['any'], rhythm: 'fakePause', pull: 1.7, chance: 0.35,
      bait: { ideal: ['glow'], ok: ['squid'] }, glow: true, size: 32,
      hint: 'Svieti tak, že ju vidno aj v šachte reaktora.' },
    { id: 'grafitova_platesa', name: 'Grafitová platesa', zone: 'sachta', location: 'jadro', depth: [320, 800], weight: 8.0, price: 120,
      cond: ['storm'], rhythm: 'waves', pull: 2.0, chance: 0.25,
      bait: { ideal: ['glow'], ok: ['squid'] }, glow: false, size: 32,
      hint: 'Za búrky sa odlepí od betónového dna šachty.' },
  ];

  // Legenda jazera: žije pri jadre (pod 720 m) — tam pustí až Lodenica 3 (sim/village.js lakeMaxDepth).
  HL.data.lakeLegends = [
    { id: 'atomovy_sumec', name: 'Atómový sumec', zone: 'sachta', location: 'jadro', depth: [720, 800], weight: 150, lineKg: 12, price: 8000,
      cond: ['night', 'rain'], pull: 2.2, chance: 0.40, glow: true, size: 64,
      bait: { ideal: ['gold', 'glow'], ok: ['squid'] },
      phases: [{ rhythm: 'waves', pullMult: 1.0 }, { rhythm: 'fakePause', pullMult: 1.1 }, { rhythm: 'chaotic', pullMult: 1.2, tempo: 0.9 }],
      hazards: ['jelly'], reward: { unlock: 'trophy' },
      hint: 'V daždivej noci jadro žiari najjasnejšie. Niečo veľké pri ňom spí.' },
  ];

  // Všetky druhy oboch miest — na vyhľadanie podľa id (cena, meno, encyklopédia). Výber náhodou z nich NIE.
  HL.data.allFish = HL.data.fish.concat(HL.data.lakeFish);
  HL.data.allLegends = HL.data.legends.concat(HL.data.lakeLegends);

  // Ktoré legendy treba na Strážcu (9.3). Ľadová veľryba je sezónna — keby bola
  // podmienkou, záverečný boj by sa dal hrať len v decembri a januári.
  HL.data.guardianRequires = ['zlaty_uhor', 'hmlista_dama', 'kral_burky'];
  HL.data.fishWeightVar = W;

  // Preklad (docs/I18N.md): mená a nápovedy sa prekladajú NA MIESTE kľúčmi fish.<id>.name / .hint,
  // legend.<id>.name / .hint. Slovenčina tu ostáva zdrojom (src/data/lang/sk/data.js je z nej vygenerovaný).
  HL.i18n.overlay(HL.data.fish, 'fish', ['name', 'hint']);
  HL.i18n.overlay(HL.data.legends, 'legend', ['name', 'hint']);
  HL.i18n.overlay(HL.data.lakeFish, 'fish', ['name', 'hint']);
  HL.i18n.overlay(HL.data.lakeLegends, 'legend', ['name', 'hint']);
})(globalThis.HL);
