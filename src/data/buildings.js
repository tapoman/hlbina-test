// Budovy dediny (dizajn 11). Každá má 3 úrovne; level 0 = nepostavená / ruina.
// cost[i] = cena za povýšenie z úrovne i na i+1. need[i] = podmienka pre úroveň i+1.
// Podmienky: { legend: 'id' } | { building: ['id', lvl] }.
(function (HL) {
  HL.data.buildings = [
    { id: 'chatrc', name: 'Chatrč', start: 0, cost: [40, 500, 2500], need: [null, null, null],
      levels: ['Rozpadnutá chatrč', 'Spánok: posun času na ráno alebo na noc', 'Väčšie úložisko rýb', 'Útulný domov (kozmetika)'] },
    { id: 'trhovisko', name: 'Trhovisko', start: 1, cost: [0, 600, 3000], need: [null, null, null],
      levels: ['—', 'Predaj rýb, ceny a horúci dopyt', 'Graf cien za 3 dni', 'Objednávky obchodníkov s bonusom'] },
    { id: 'dielna', name: 'Dielňa', start: 1, cost: [0, 700, 4000], need: [null, null, { legend: 'zlaty_uhor' }],
      levels: ['—', 'Základné vlasce, prúty a háčiky', 'Pokročilé vybavenie a harpúny', 'Oceľový a legendárny vlasec'] },
    { id: 'navnadaren', name: 'Návnadáreň', start: 0, cost: [60, 450, 2200], need: [null, null, null],
      levels: ['Prázdna búda', 'Kúsky mušlí', 'Kalamár', 'Svietiaca návnada'] },
    { id: 'meteostanica', name: 'Meteostanica', start: 0, cost: [150, 800, 3000], need: [null, null, null],
      levels: ['Nič — len pohľad na oblohu', 'Predpoveď na 6 hodín', 'Predpoveď na 24 hodín', 'Predpoveď na 3 dni a fáza mesiaca'] },
    { id: 'majak', name: 'Maják', start: 0, cost: [300, 1500, 6000], need: [null, null, { legend: 'hmlista_dama' }],
      levels: ['Zhasnutá veža', 'Lepšia viditeľnosť v noci', 'Viditeľnosť v Polnoci', 'Odomyká Priepasť a Nekonečnú hlbinu'] },
    { id: 'krcma', name: 'Krčma', start: 0, cost: [200, 1200, 4000], need: [null, null, null],
      levels: ['Zatlčené okná', 'Rybári rozprávajú tipy', 'Úlohy od rybárov', 'Stopy k legendám a zlatá návnada'] },
    { id: 'akvarium', name: 'Akvárium', start: 0, cost: [350, 2000, 6000], need: [null, null, null],
      levels: ['Stavenisko', 'Vystavené ryby', 'Turisti: malý pasívny príjem', 'Trofeje legiend'] },
    // Stará elektráreň (docs/JAZERO.md) — stoja pri jadrovom jazere, nie v dedine (site). Lodenica = prístup
    // do hĺbky jazera (ako Maják v mori), Laboratórium = jazerná výbava (ako Dielňa).
    { id: 'lodenica', name: 'Lodenica', start: 0, cost: [1200, 3500, 8000], site: 'elektraren',
      need: [{ building: ['dielna', 2] }, { building: ['laboratorium', 1] }, { legend: 'hmlista_dama' }],
      levels: ['Prevrátený čln', 'Pancierová loďka: jazero a hala', 'Olovený trup: Šachta reaktora', 'Ponorná klietka: až k jadru'] },
    { id: 'laboratorium', name: 'Laboratórium', start: 0, cost: [900, 3000, 7000], site: 'elektraren',
      need: [{ building: ['lodenica', 1] }, null, null],
      levels: ['Zamknutý kontajner', 'Olovené vlasce a prúty', 'Grafitové vlasce a prúty', 'Zirkóniové vlasce a prúty'] },
  ];

  // Veľkosť úložiska rýb v Chatrči podľa úrovne (0..3). Čo sa nezmestí, treba predať.
  HL.data.storageByHut = [6, 6, 24, 30];

  // Preklad (docs/I18N.md): building.<id>.name a building.<id>.level.<0..3>.
  HL.i18n.overlay(HL.data.buildings, 'building', ['name', 'levels:level']);
})(globalThis.HL);
