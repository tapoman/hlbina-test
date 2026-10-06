// Svet: hĺbkové pásma, denné obdobia, počasie, mesiac, sezónne udalosti,
// nebezpečenstvá a vylepšenia Nekonečnej hlbiny (dizajn 7, 9, 12).
(function (HL) {
  var D = HL.data;

  D.SEA_FLOOR = 3000;          // dno mora v kariére (Strážca priepasti žije pri dne)
  D.START_MINUTE = 6 * 60;     // hra začína 1. deň o 06:00

  // light: 0 = plné svetlo, 1 = absolútna tma (bez svetla háčika nevidno nič okrem svietiacich rýb)
  D.zones = [
    { id: 'plytcina', name: 'Plytčina', from: 0, to: 50, light: 0.0, desc: 'Svetlo, lacné ryby, medúzy' },
    { id: 'utesy', name: 'Útesy', from: 50, to: 200, light: 0.15, desc: 'Farebné ryby, skaly' },
    { id: 'sumrak', name: 'Súmrak', from: 200, to: 600, light: 0.55, desc: 'Šero, prví predátori' },
    { id: 'polnoc', name: 'Polnoc', from: 600, to: 1500, light: 0.9, desc: 'Tma, svietiace ryby' },
    { id: 'priepast', name: 'Priepasť', from: 1500, to: 3000, light: 1.0, desc: 'Absolútna tma, legendy', needLighthouse: 3 },
    // Len v Nekonečnej hlbine.
    { id: 'nekonecna', name: 'Nekonečná hlbina', from: 3000, to: Infinity, light: 1.0, desc: 'Sem ešte nikto nedoplával', endlessOnly: true },
  ];

  // Jadrové jazero (docs/JAZERO.md): druhé lovné miesto pri Starej elektrárni. Rozšírenie nad dokument —
  // more ostáva presne také, aké bolo (zoznamy mora sa nemenia, jazero má vlastné). Rovnaké pravidlá ako
  // more; žiadne žiarenie. diffAs = pásmo mora, ktorému zodpovedá obtiažnosť boja (sim/fight.js) — jazero je
  // obsah strednej hry, jeho plytčina nie je sardinková. needShipyard = úroveň Lodenice pre pásmo.
  D.LAKE_FLOOR = 800;
  D.lakeZones = [
    // short = meno do úzkej lišty ponoru (celé meno ukáže nápis pásma)
    { id: 'chladiace', name: 'Chladiace jazero', short: 'Jazero', from: 0, to: 80, light: 0.1, desc: 'Teplá zelená voda, mutanti', location: 'jadro', diffAs: 'utesy', needShipyard: 1 },
    { id: 'hala', name: 'Zatopená hala', short: 'Hala', from: 80, to: 300, light: 0.45, desc: 'Turbíny, lávky, sudy', location: 'jadro', diffAs: 'sumrak', needShipyard: 1 },
    { id: 'sachta', name: 'Šachta reaktora', short: 'Šachta', from: 300, to: 800, light: 0.85, desc: 'Riadiace tyče, žiara jadra', location: 'jadro', diffAs: 'polnoc', needShipyard: 2 },
  ];

  // Lodenica (data/buildings.js) púšťa do hĺbky jazera ako Maják do Priepasti: úroveň → najväčšia hĺbka (m).
  // L1 = Chladiace jazero a Zatopená hala, L2 = Šachta reaktora (bez jadra), L3 = až k jadru (legenda od 720 m).
  D.lakeShipyardDepth = [0, 300, 700, 800];

  // Denné obdobia (7.2). Hodiny [from, to) v rámci dňa; noc prechádza cez polnoc.
  D.periods = [
    { id: 'morning', name: 'Ráno', from: 5, to: 10, biteMult: 1.15 },
    { id: 'day', name: 'Deň', from: 10, to: 17, biteMult: 1.0 },
    { id: 'evening', name: 'Večer', from: 17, to: 21, biteMult: 1.15 },
    { id: 'night', name: 'Noc', from: 21, to: 5, biteMult: 0.9 },
  ];

  // Počasie (7.3). w = váha pri generovaní. biteMult platí všade; zvláštne efekty rieši sim.
  D.weathers = [
    { id: 'sun', name: 'Slnečno', w: 30, biteMult: 1.0 },
    { id: 'cloudy', name: 'Oblačno', w: 28, biteMult: 1.05 },
    { id: 'rain', name: 'Dážď', w: 18, biteMult: 1.0 },   // +T.rainShallowBonus v Plytčine, viac medúz
    { id: 'fog', name: 'Hmla', w: 13, biteMult: 1.0 },    // tajomné druhy, horšia viditeľnosť
    { id: 'storm', name: 'Búrka', w: 11, biteMult: 1.0 }, // ceny +T.stormPriceBonus, prúdy, blesky, viac predátorov
  ];

  // Mesiac (7.4): 8 fáz, jedna za herný deň. 0 = nov, 4 = spln.
  D.moonPhases = ['Nov', 'Dorastajúci kosák', 'Prvá štvrť', 'Dorastajúci mesiac', 'Spln', 'Cúvajúci mesiac', 'Posledná štvrť', 'Cúvajúci kosák'];
  D.MOON_OFFSET = 2; // fáza dňa d = (d + MOON_OFFSET) % 8 → prvý spln na 3. deň, prvý nov na 7. deň

  // Sezónne udalosti (12.3). months = mesiace skutočného kalendára, 0 = január.
  D.events = [
    { id: 'spring', name: 'Jarná migrácia', months: [2, 3], desc: 'Kŕdle sťahovavých rýb, dvojnásobné ceny vybraných druhov',
      priceMult: { sled: 2, makrela: 2, tuniak: 2 } },
    { id: 'summer', name: 'Letný festival', months: [6, 7], desc: 'Rybárska súťaž v dedine: najťažšia ryba dňa' },
    { id: 'halloween', name: 'Halloweenska hlbina', months: [9], desc: 'Strašidelné ryby, tmavšie more, sezónna legenda' },
    { id: 'winter', name: 'Zimný lov', months: [11, 0], desc: 'Ľadová veľryba, zamrznutá hladina, vianočná dedina' },
  ];

  // Tokeny podmienok výskytu (fish.cond). Všetky v zozname musia platiť.
  // env = { period, weather, moon (0..7), event (id|null), guardianReady (bool) }
  D.COND = {
    any: function () { return true; },
    morning: function (e) { return e.period === 'morning'; },
    day: function (e) { return e.period === 'day'; },
    evening: function (e) { return e.period === 'evening'; },
    night: function (e) { return e.period === 'night'; },
    sun: function (e) { return e.weather === 'sun'; },
    cloudy: function (e) { return e.weather === 'cloudy'; },
    rain: function (e) { return e.weather === 'rain'; },
    fog: function (e) { return e.weather === 'fog'; },
    storm: function (e) { return e.weather === 'storm'; },
    fullmoon: function (e) { return e.moon === 4; },
    newmoon: function (e) { return e.moon === 0; },
    spring: function (e) { return e.event === 'spring'; },
    summer: function (e) { return e.event === 'summer'; },
    halloween: function (e) { return e.event === 'halloween'; },
    winter: function (e) { return e.event === 'winter'; },
    guardian: function (e) { return !!e.guardianReady; },
  };
  // Čitateľný popis podmienky pre encyklopédiu a Krčmu.
  D.COND_LABEL = {
    any: 'Kedykoľvek', morning: 'Ráno', day: 'Deň', evening: 'Večer', night: 'Noc',
    sun: 'Slnečno', cloudy: 'Oblačno', rain: 'Dážď', fog: 'Hmla', storm: 'Búrka',
    fullmoon: 'Spln', newmoon: 'Nov', spring: 'Jarná migrácia', summer: 'Letný festival',
    halloween: 'Halloween', winter: 'Zimný lov', guardian: 'Maják 3 a všetky legendy',
  };

  // Nebezpečenstvá (9.1, 9.2). Pásma, kde sa smú objaviť; čísla sú v core/tuning.js.
  D.hazards = {
    jelly: { name: 'Medúza', from: 0, to: 1500, perMin: 1.2, rainMult: 2.5 },
    rock: { name: 'Ostrá skala', from: 50, to: 3000, perMin: 1.0 },
    current: { name: 'Prúd', weather: 'storm' },
  };
  D.predators = {
    shark: { name: 'Žralok', from: 200 },
    octopus: { name: 'Chobotnica', from: 600 },
    shadowEel: { name: 'Tieňový úhor', from: 1500 },
  };
  // Jazero: tie isté medúzy a prekážky (hrdzavé sudy namiesto skál — ten istý zásah do vlasca, iný obrázok).
  // Žraloky, chobotnice ani tieňový úhor v jazere nie sú (from: Infinity = nikdy).
  D.lakeHazards = {
    jelly: { name: 'Svietiaca medúza', from: 0, to: 800, perMin: 1.0, rainMult: 2.5 },
    rock: { name: 'Hrdzavý sud', from: 30, to: 800, perMin: 1.0 },
    current: { name: 'Prúd', weather: 'storm' },
  };
  D.lakePredators = { shark: { from: Infinity }, octopus: { from: Infinity }, shadowEel: { from: Infinity } };

  // Lovné miesta. Ponor beží v jednom (DiveOpts.location, sim/dive.js); predvolené je more. fish/legends dopĺňa
  // data/fish.js (načíta sa skôr, preto sa priraďujú tu). Rovnaký objekt mora = more je bit po bite to isté.
  D.locations = [
    { id: 'more', name: 'More', zones: D.zones, floor: D.SEA_FLOOR, hazards: D.hazards, predators: D.predators,
      fish: D.fish, legends: D.legends },
    { id: 'jadro', name: 'Jadrové jazero', zones: D.lakeZones, floor: D.LAKE_FLOOR, hazards: D.lakeHazards, predators: D.lakePredators,
      fish: D.lakeFish, legends: D.lakeLegends },
  ];

  // Nekonečná hlbina (12.2): každých T.endlessPerkEvery m výber 1 z 3.
  D.perks = [
    { id: 'strength', name: '+20 % pevnosť vlasca' },
    { id: 'grip', name: 'Pevné zaseknutie: +30 % postup za ťuknutie' },
    { id: 'jellyImmune', name: 'Medúzy ťa ignorujú' },
    { id: 'harpoon', name: '+1 harpúna' },
    { id: 'light', name: 'Väčší kužeľ svetla' },
    { id: 'slowEscape', name: 'Ryby unikajú o 40 % pomalšie' },
    { id: 'tolerance', name: '+60 ms tolerancia rytmu' },
    { id: 'sink', name: '+30 % rýchlosť klesania' },
    { id: 'lure', name: '+30 % šanca na záber' },
    { id: 'sharkSlow', name: 'Žralok útočí o 4 s neskôr' },
    { id: 'rockProof', name: 'Skaly nepoškodzujú vlasec' },
    { id: 'lightDepth', name: 'Hĺbka zaťažuje o 15 % menej' },
    { id: 'knot', name: 'Záchranný uzol: prvé prasknutie prežiješ (stratíš polovicu úlovku)' },
  ];

  // Preklad (docs/I18N.md): zone.<id>.name/.desc, period.<id>.name, weather.<id>.name, moon.<0..7>,
  // event.<id>.name/.desc, cond.<token>, hazard.<id>.name, predator.<id>.name, perk.<id>.name.
  var L = HL.i18n;
  L.overlay(D.zones, 'zone', ['name', 'desc']);
  L.overlay(D.lakeZones, 'zone', ['name', 'desc', 'short']);
  L.overlay(D.locations, 'location', ['name']);
  L.overlay(D.periods, 'period', ['name']);
  L.overlay(D.weathers, 'weather', ['name']);
  L.overlay(D.moonPhases, 'moon');
  L.overlay(D.events, 'event', ['name', 'desc']);
  L.overlay(D.COND_LABEL, 'cond');
  L.overlay(D.hazards, 'hazard', ['name']);
  L.overlay(D.lakeHazards, 'lakeHazard', ['name']);
  L.overlay(D.predators, 'predator', ['name']);
  L.overlay(D.perks, 'perk', ['name']);
})(globalThis.HL);
