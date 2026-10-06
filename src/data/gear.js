// Vybavenie (dizajn 10.3) a návnady (5.1). Ceny sú štartovacie a násobia sa T.costScale.
// shop: ktorá budova a úroveň predmet sprístupní; needLegend: ktorá legenda musí byť chytená.
(function (HL) {
  HL.data.lines = [
    { id: 'hemp', name: 'Konopný vlasec', strength: 10, maxDepth: 100, cost: 0, shop: ['dielna', 1] },
    { id: 'nylon', name: 'Nylonový vlasec', strength: 25, maxDepth: 300, cost: 120, shop: ['dielna', 1] },
    { id: 'braided', name: 'Pletený vlasec', strength: 60, maxDepth: 800, cost: 900, shop: ['dielna', 2] },
    { id: 'steel', name: 'Oceľový vlasec', strength: 150, maxDepth: 2000, cost: 3500, shop: ['dielna', 3] },
    // "bez obmedzenia" = až na dno mora (data/world.js SEA_FLOOR); v Nekonečnej hlbine naozaj bez konca.
    { id: 'legend', name: 'Legendárny vlasec', strength: 400, maxDepth: Infinity, cost: 20000, shop: ['dielna', 3], needLegend: 'kral_burky' },
  ];

  // Prúty: postup za dobré ťuknutie navyše a širšia tolerancia rytmu (5.3).
  HL.data.rods = [
    { id: 'bamboo', name: 'Bambusový prút', progressBonus: 0, toleranceMs: 0, cost: 0, shop: ['dielna', 1] },
    { id: 'fiber', name: 'Sklolaminátový prút', progressBonus: 0.02, toleranceMs: 30, cost: 150, shop: ['dielna', 1] },
    { id: 'carbon', name: 'Karbónový prút', progressBonus: 0.04, toleranceMs: 60, cost: 800, shop: ['dielna', 2] },
    { id: 'master', name: 'Majstrovský prút', progressBonus: 0.06, toleranceMs: 100, cost: 3500, shop: ['dielna', 3] },
  ];

  // Jadrové jazero (docs/JAZERO.md): v rádioaktívnej vode sa loví JAZERNÝMI vlascami a prútmi z Laboratória
  // (bežné by skrehli — len príbeh, nie mechanika). Háčiky a návnady sú spoločné s morom. Uložené zvlášť:
  // save.gear.lakeLine / lakeRod (null = ešte žiadny). Zirkónium = obal palivových tyčí v reaktore.
  HL.data.lakeLines = [
    // 45 kg (nie 30): s 30 kg robot (tools/lake_balance.js) v Zatopenej hale bezpečne nelovil a jazero pri vstupe
    // zarábalo 0,46× mora — za 2 800 € investície. Halu ťahá olovený vlasec do 150 m; hlbšie grafitový.
    { id: 'lead', name: 'Olovený vlasec', strength: 45, maxDepth: 150, cost: 400, shop: ['laboratorium', 1] },
    { id: 'graphite', name: 'Grafitový vlasec', strength: 70, maxDepth: 450, cost: 1800, shop: ['laboratorium', 2] },
    { id: 'zirconium', name: 'Zirkóniový vlasec', strength: 160, maxDepth: 800, cost: 5000, shop: ['laboratorium', 3] },
  ];
  HL.data.lakeRods = [
    { id: 'lead_rod', name: 'Olovený prút', progressBonus: 0.02, toleranceMs: 30, cost: 300, shop: ['laboratorium', 1] },
    { id: 'graphite_rod', name: 'Grafitový prút', progressBonus: 0.04, toleranceMs: 60, cost: 1500, shop: ['laboratorium', 2] },
    { id: 'zirconium_rod', name: 'Zirkóniový prút', progressBonus: 0.06, toleranceMs: 100, cost: 4500, shop: ['laboratorium', 3] },
  ];

  // Háčiky: násobok poklesu postupu (ryba uniká pomalšie).
  HL.data.hooks = [
    { id: 'basic', name: 'Obyčajný háčik', decayMult: 1.0, cost: 0, shop: ['dielna', 1] },
    { id: 'barbed', name: 'Háčik s protihrotom', decayMult: 0.8, cost: 100, shop: ['dielna', 1] },
    { id: 'circle', name: 'Kruhový háčik', decayMult: 0.6, cost: 700, shop: ['dielna', 2] },
    { id: 'titan', name: 'Titánový háčik', decayMult: 0.4, cost: 3000, shop: ['dielna', 3] },
  ];

  HL.data.harpoon = { id: 'harpoon', name: 'Harpúna', cost: 60, maxCarry: 3, shop: ['dielna', 2] };

  // Návnady. price = za kus; worm je zadarmo a neobmedzený.
  // Na ponor sa berie najviac baitCarry kusov; každý boj (úlovok aj únik) zje jeden,
  // prasknutie vlasca zoberie všetky nesené (4.2 "stratí ... aj návnadu").
  HL.data.baits = [
    // lakeDesc = opis v príprave na jadrové jazero, kde morský opis klame (Plytčina, Útesy sú pásma mora;
    // prekladatelia 2026-10-02; svietiaca: en/de/es prekladajú „hlbokomorské"). Kalamár a zlatá platia aj pre jazero.
    { id: 'worm', name: 'Červík', price: 0, infinite: true, shop: null, desc: 'Malé ryby v plytčine', lakeDesc: 'Ryby pri hladine' },
    { id: 'shell', name: 'Kúsky mušlí', price: 2, shop: ['navnadaren', 1], desc: 'Útesové ryby, kraby', lakeDesc: 'Úhory a kapry' },
    { id: 'squid', name: 'Kalamár', price: 5, shop: ['navnadaren', 2], desc: 'Dravé a stredné ryby' },
    { id: 'glow', name: 'Svietiaca návnada', price: 12, shop: ['navnadaren', 3], desc: 'Hlbinné ryby', lakeDesc: 'Ryby šachty reaktora' },
    // Zlatá: z úloh v Krčme; Krčma L3 predáva 1 kus denne.
    { id: 'gold', name: 'Zlatá návnada', price: 250, shop: ['krcma', 3], perDay: 1, desc: 'Zvyšuje šancu na legendy' },
  ];
  HL.data.baitCarry = 10;
  // Zlatá návnada: na bežné ryby funguje ako "vhodná", legendám zvyšuje aj šancu na objavenie.
  HL.data.goldLegendSpawnMult = 2.5;

  // Pevná výbava pre Nekonečnú hlbinu (12.2).
  // bait 'mix' = zmes návnad: každý bežný druh ju berie ako "vhodnú" (×1,0), neobmedzene.
  HL.data.endlessGear = { line: 'steel', rod: 'carbon', hook: 'circle', bait: 'mix', harpoons: 1 };

  // Preklad (docs/I18N.md): line.<id>.name, rod.<id>.name, hook.<id>.name, harpoon.name, bait.<id>.name / .desc.
  HL.i18n.overlay(HL.data.lines, 'line', ['name', 'desc']);
  HL.i18n.overlay(HL.data.rods, 'rod', ['name', 'desc']);
  HL.i18n.overlay(HL.data.lakeLines, 'line', ['name', 'desc']);
  HL.i18n.overlay(HL.data.lakeRods, 'rod', ['name', 'desc']);
  HL.i18n.overlay(HL.data.hooks, 'hook', ['name', 'desc']);
  HL.i18n.overlay(HL.data.harpoon, 'harpoon', ['name', 'desc']);
  HL.i18n.overlay(HL.data.baits, 'bait', ['name', 'desc', 'lakeDesc']);
})(globalThis.HL);
