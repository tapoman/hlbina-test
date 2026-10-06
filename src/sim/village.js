// Dedina (dizajn 11): budovy, obchod Dielne a Návnadárne, spánok v Chatrči, úložisko rýb,
// Krčma (tipy, úlohy, stopy k legendám, zlatá návnada), Akvárium, vizuálny progres a zápis
// ponoru do kariéry (applyDive). Vlastný stav nemá — všetko je v Save (§5).
//
// Rozhodnutia, ktoré zmluva nechala sem:
// - Ceny budov a výbavy = dáta × T.costScale, zaokrúhlené na celé eurá.
// - Offer.available = "kúpa by TERAZ prešla" (obchod ju predáva, hráč ju nemá, na peniaze
//   má). reason = prečo nie, po slovensky; locked = zamyká to budova alebo legenda
//   (UI kreslí zámok), inak ide len o peniaze alebo vlastníctvo. Rovnako goldOffer.
// - shop().baits = návnady z Návnadárne. Červík je zadarmo (nepredáva sa), zlatú predáva
//   Krčma cez goldOffer/buyGold (1 kus denne) — buyBait('gold') preto vráti false.
// - maxDepth = min(dĺžka vlasca, 1500 m pokiaľ Maják < 3, dno mora).
// - lightBonus: Maják úroveň L → noc +L × T.lightPerLighthouse px, Polnoc +(L−1) × ten istý
//   krok. L1 = lepšie v noci, L2 = prvé svetlo v Polnoci (dokument 11).
// - forecast: Meteostanica 0/6/24/72 h; fázy mesiaca (dnes a ďalšie 2 dni) len na L3.
//   Úseky sú SKUTOČNÉ počasie; počas intra ho env prebíja slnkom, preto ide ďalej aj intro.
// - fishForecast: predpoveď rýb pre Prípravu (sekcia pri forecast) — ktoré druhy s podmienkou berú v ktorej hodine
//   a hĺbke, s tým istým dosahom ako forecast; počas intra so slnkom ako ponor. Nechytené legendy len s Krčmou 3
//   (ako stopy v encyklopédii), dosah háčika podľa pravidla ponoru (HL.dive.reachM).
// - advanceTo(save, m, { dive }): posun hodín → trh (advanceDays); Akvárium platí za každý deň,
//   ktorý prejde POČAS PONORU (L2: T.aquariumPerSpecies × vystavené druhy, L3: + T.aquariumPerTrophy
//   × trofej) — spánok je zadarmo a neobmedzený, platený spánok by bol nekonečný zdroj peňazí.
//   Na prelome dňa vyplatí výhru letnej súťaže (prize). Krčma nepotrebuje "reset": tipy aj zlatá
//   návnada sú kľúčované dňom (tavern.goldDay).
// - Úlohy: sezónna úloha, ktorej udalosť skončila, pri doplnení zmizne (inak blokuje slot).
//   Úloha na hodnotu posudzuje predaj po kusoch (HL.market.preview), nie súčet plných cien.
// - contest(save, env): Letný festival — denná súťaž o najťažšiu rybu (pozri sekciu nižšie).
// - Úlohy (Krčma ≥ 2) drží stále T.questCount (3) aktívne; nové sa dopĺňajú lenivo pri
//   čítaní quests() a po applyDive, z HL.rngFor(seed, 'quest', id) — ten istý stav dá tie
//   isté úlohy. Druhy len z pásma najviac o jedno hlbšie, než kam hráč už došiel (a nie
//   z Priepasti bez Majáka 3), sezónne len počas udalosti. Úloha sa plní iba z ponoru,
//   z ktorého sa hráč VRÁTIL (prasknutie nič nesplní) a iba v kariére.
//   Podmienka druhu ("v noci") sa overuje na minúte zaseknutia result.catch[].m.
//   Počty pri druhu sú 1–4, takže text potrebuje len tvary pre 1 a 2–4 (plural je
//   pripravený aj na 5+). Hlbinár s lampášom a vzácne druhy (šanca ≤ 0,2) chce úloha po 1.
// - Jadrové jazero (docs/JAZERO.md): lakeAccess = Lodenica ≥ 1 a nasadený jazerný vlasec aj prút z Laboratória;
//   maxDepth(save, 'jadro') = min(jazerný vlasec, D.lakeShipyardDepth[Lodenica], dno jazera). Maják svieti len
//   na mori (lightBonus jazera = 0). Ponor v jazere plní encyklopédiu, peniaze a úlohy na hodnotu a počet, ale
//   NIE úlohy na hĺbku (cieľ je z morského vlasca), letnú súťaž (rybári z dediny lovia na mori) ani najhlbší
//   ponor mora (stats.deepest — podľa neho Krčma vyberá pásma); jazero má vlastný stats.deepestLake.
// - applyDive: Nekonečná hlbina plní encyklopédiu (bez legiend) a štatistiku ponorov, ale nedáva
//   peniaze, úlohy, legendy, odomknutia, najhlbší ponor kariéry ani nevracia návnady (tam je pevná
//   výbava). Kariéra: nepoužité návnady späť, harpúny −harpoonsUsed (zo zásoby pri štarte neodišli).
(function (HL) {
  var V = HL.village = {};
  var D = HL.data, T = HL.T, U = HL.util;

  T.def('Trh', 'aquariumPerTrophy', 50, 0, 1000, 5, 'Akvárium L3: € za deň za trofej legendy');
  T.def('Krčma', 'questCount', 3, 1, 6, 1, 'Počet aktívnych úloh v Krčme');
  T.def('Krčma', 'questRewardMult', 1, 0.2, 5, 0.05, 'Násobok odmien za úlohy');
  T.def('Krčma', 'questGoldChance', 0.25, 0, 1, 0.05, 'Podiel úloh, ktoré pridajú zlatú návnadu');
  // Letný festival (dizajn 12.3, nález #36): denná súťaž o najťažšiu rybu. Výhra je malá — dizajn ju
  // radí ku "kozmetike"; pri 25 € za pásmo nezatieni ani skorú ekonomiku Plytčiny (~20 € za ponor).
  T.def('Udalosti', 'contestPrizePerZone', 25, 0, 1000, 5, 'Letná súťaž: výhra € za každé dosiahnuté pásmo');
  T.def('Udalosti', 'contestNpcCatches', 4, 1, 12, 1, 'Letná súťaž: úlovky rybárov z dediny, najťažší je cieľ dňa');

  // Texty sú v tabuľkách jazyka (src/data/lang/<kód>/sim.js, docs/I18N.md):
  //   sim.village.acc.<budova>   akuzatív pre "Treba ___ na úrovni N"
  //   sim.quest.fish.<druh>      tvary druhu v úlohe { one: 'sardinku', few: '{n} sardinky', other: '{n} sardiniek' }
  //   sim.quest.cond.<token>     "v noci", "pri splne" …
  // Dôvody (reason) sú text pre hráča; UI, ktoré potrebuje vedieť PREČO, číta reasonKey (napr. 'sim.village.noMoney').
  var L = HL.i18n;
  function t(key, p) { return L.t(key, p); }
  var SINGLE = { lampasnik: true };
  // Podmienky, ktoré úloha smie pridať (majú frázu "v noci" …). Len tokeny — text je v tabuľke.
  var COND_QUEST = { morning: 1, day: 1, evening: 1, night: 1, sun: 1, cloudy: 1, rain: 1, fog: 1, storm: 1, fullmoon: 1, newmoon: 1 };
  var UNLOCK_TEXT = D.unlockText;
  var METEO_H = [0, 6, 24, 72];

  var idx = null;
  function I() {
    if (!idx) {
      idx = {
        b: U.byId(D.buildings), fish: U.byId(D.allFish), legend: U.byId(D.allLegends), bait: U.byId(D.baits),
        line: U.byId(D.lines), rod: U.byId(D.rods), hook: U.byId(D.hooks),
        lakeLine: U.byId(D.lakeLines), lakeRod: U.byId(D.lakeRods),
      };
    }
    return idx;
  }
  function r2(v) { return Math.round(v * 100) / 100; }
  function round5(v) { return Math.max(5, Math.round(v / 5) * 5); }
  function round10(v) { return Math.round(v / 10) * 10; }
  function cost(v) { return Math.round(v * T.costScale); }
  function pay(save, c) { save.money = r2(save.money - c); }
  // Druh výbavy → zoznam. lakeLine / lakeRod = jazerná výbava z Laboratória (save.gear.lakeLine / lakeRod).
  var KINDS = { line: 'lines', rod: 'rods', hook: 'hooks', lakeLine: 'lakeLines', lakeRod: 'lakeRods' };
  function kindList(kind) { return Object.prototype.hasOwnProperty.call(KINDS, kind) ? D[KINDS[kind]] : null; }

  // ------------------------------------------------------------------ budovy
  V.level = function (save, id) { return (save.buildings && save.buildings[id]) || 0; };

  function accName(building) { var k = 'sim.village.acc.' + building; return L.has(k) ? t(k) : building; }
  function needText(building, lvl) { return t('sim.village.needBuilding', { building: accName(building), level: lvl }); }
  function legendText(id) { var l = I().legend[id]; return t('sim.village.needLegend', { legend: l ? l.name : id }); }
  // Kľúč dôvodu (pre UI, ktoré sa rozhoduje podľa dôvodu, nie podľa textu).
  function needKey(need, save) {
    if (!need) return '';
    if (need.legend && !(save.legends && save.legends[need.legend])) return 'sim.village.needLegend';
    if (need.building && V.level(save, need.building[0]) < need.building[1]) return 'sim.village.needBuilding';
    return '';
  }
  function gateKey(save, item) {
    if (!item.shop) return 'sim.village.notSold';
    if (V.level(save, item.shop[0]) < item.shop[1]) return 'sim.village.needBuilding';
    if (item.needLegend && !(save.legends && save.legends[item.needLegend])) return 'sim.village.needLegend';
    return '';
  }

  // Prvá nesplnená podmienka ako slovenská veta, '' = splnené.
  function needReason(save, need) {
    if (!need) return '';
    if (need.legend && !(save.legends && save.legends[need.legend])) return legendText(need.legend);
    if (need.building && V.level(save, need.building[0]) < need.building[1]) return needText(need.building[0], need.building[1]);
    return '';
  }

  V.upgradeInfo = function (save, id) {
    var b = I().b[id];
    HL.assert(b, 'neznáma budova ' + id);
    var lvl = V.level(save, id);
    var out = { ok: false, cost: 0, level: lvl, next: null, desc: b.levels[Math.min(3, lvl)], reason: '', reasonKey: '', name: b.name };
    if (lvl >= 3) { out.reasonKey = 'sim.village.maxLevel'; out.reason = t(out.reasonKey); return out; }
    out.next = lvl + 1;
    out.cost = cost(b.cost[lvl]);
    out.desc = b.levels[lvl + 1];
    var r = needReason(save, b.need[lvl]);
    if (r) { out.reason = r; out.reasonKey = needKey(b.need[lvl], save); }
    else if (save.money < out.cost) { out.reasonKey = 'sim.village.noMoney'; out.reason = t(out.reasonKey); }
    else out.ok = true;
    return out;
  };

  V.upgrade = function (save, id) {
    var info = V.upgradeInfo(save, id);
    if (!info.ok) return false;
    pay(save, info.cost);
    save.buildings[id] = info.next;
    if (id === 'krcma') V.quests(save);
    return true;
  };

  // Prehľad všetkých budov pre obrazovku dediny.
  V.list = function (save) {
    return D.buildings.map(function (b) { return { id: b.id, name: b.name, level: V.level(save, b.id), info: V.upgradeInfo(save, b.id) }; });
  };

  // ------------------------------------------------------------------ obchod
  function gateReason(save, item) {
    if (!item.shop) return t('sim.village.notSold');
    if (V.level(save, item.shop[0]) < item.shop[1]) return needText(item.shop[0], item.shop[1]);
    if (item.needLegend && !(save.legends && save.legends[item.needLegend])) return legendText(item.needLegend);
    return '';
  }

  function gearOffer(save, item, kind) {
    var owned = save.gear.owned.indexOf(item.id) >= 0;
    var equipped = save.gear[kind] === item.id;
    var lock = gateReason(save, item);
    var c = cost(item.cost);
    var rk = owned ? (equipped ? 'sim.village.equipped' : 'sim.village.owned') : lock ? gateKey(save, item) : save.money < c ? 'sim.village.noMoney' : '';
    var reason = owned ? t(rk) : lock || (rk ? t(rk) : '');
    return { item: item, kind: kind, owned: owned, equipped: equipped, available: !owned && !lock && save.money >= c, locked: !owned && !!lock, reason: reason, reasonKey: rk, cost: c };
  }

  function harpoonOffer(save) {
    var h = D.harpoon, n = save.gear.harpoons || 0, lock = gateReason(save, h), c = cost(h.cost);
    var full = n >= h.maxCarry;
    var rk = lock ? gateKey(save, h) : full ? 'sim.village.harpoonFull' : save.money < c ? 'sim.village.noMoney' : '';
    var reason = lock || (rk ? t(rk) : '');
    return { item: h, kind: 'harpoon', owned: n > 0, equipped: false, available: !lock && !full && save.money >= c, locked: !!lock, reason: reason, reasonKey: rk, cost: c, stock: n };
  }

  function baitOffer(save, b) {
    var n = (save.baits && save.baits[b.id]) || 0, lock = gateReason(save, b), c = cost(b.price);
    var rk = lock ? gateKey(save, b) : save.money < c ? 'sim.village.noMoney' : '';
    return { item: b, kind: 'bait', owned: n > 0, equipped: false, available: !lock && save.money >= c, locked: !!lock, reason: lock || (rk ? t(rk) : ''), reasonKey: rk, cost: c, stock: n };
  }

  V.shop = function (save) {
    return {
      lines: D.lines.map(function (x) { return gearOffer(save, x, 'line'); }),
      rods: D.rods.map(function (x) { return gearOffer(save, x, 'rod'); }),
      hooks: D.hooks.map(function (x) { return gearOffer(save, x, 'hook'); }),
      harpoon: harpoonOffer(save),
      baits: D.baits.filter(function (b) { return b.shop && b.shop[0] === 'navnadaren'; }).map(function (b) { return baitOffer(save, b); }),
    };
  };

  // Laboratórium pri jadrovom jazere: jazerné vlasce a prúty (háčiky a návnady sú spoločné s morom).
  V.labShop = function (save) {
    return {
      lines: D.lakeLines.map(function (x) { return gearOffer(save, x, 'lakeLine'); }),
      rods: D.lakeRods.map(function (x) { return gearOffer(save, x, 'lakeRod'); }),
    };
  };

  V.buyGear = function (save, kind, id) {
    var list = kindList(kind);
    if (!list) return false;
    var item = U.byId(list)[id];
    if (!item) return false;
    var o = gearOffer(save, item, kind);
    if (!o.available) return false;
    pay(save, o.cost);
    save.gear.owned.push(id);
    save.gear[kind] = id;
    return true;
  };

  V.equip = function (save, kind, id) {
    var list = kindList(kind);
    if (!list || !U.byId(list)[id] || save.gear.owned.indexOf(id) < 0) return false;
    save.gear[kind] = id;
    return true;
  };

  V.buyHarpoon = function (save) {
    var o = harpoonOffer(save);
    if (!o.available) return false;
    pay(save, o.cost);
    save.gear.harpoons = (save.gear.harpoons || 0) + 1;
    return true;
  };

  V.buyBait = function (save, baitId, qty) {
    var b = I().bait[baitId];
    qty = qty == null ? 1 : Math.floor(qty);
    if (!b || !b.shop || b.shop[0] !== 'navnadaren' || !(qty >= 1)) return false;
    var o = baitOffer(save, b);
    if (gateReason(save, b) || save.money < o.cost * qty) return false;
    pay(save, o.cost * qty);
    save.baits[baitId] = (save.baits[baitId] || 0) + qty;
    return true;
  };

  // ------------------------------------------------------------------ čas, spánok, úložisko
  // Posun hodín. opts.dive = čas prešiel počas ponoru (game.finishDive) — len vtedy platí Akvárium.
  // Spánok je zadarmo, okamžitý a neobmedzený; keby aj on platil Akvárium za každý prespaný deň,
  // tlačidlo by bolo nekonečný zdroj peňazí bez rybárčenia (nález #3). Spánok ďalej posúva trh
  // (obnova dopytu, horúci dopyt — dizajn 7.2, 10.1). prize = výhra letnej súťaže vyplatená na prelome.
  V.advanceTo = function (save, newM, opts) {
    if (!U.isNum(newM) || newM <= save.clock) return { days: 0, income: 0, prize: 0 };
    var d0 = HL.world.day(save.clock), d1 = HL.world.day(newM);
    save.clock = newM;
    HL.market.advanceDays(save, d1);
    var days = d1 - d0, income = 0, prize = 0;
    if (days > 0) {
      if (opts && opts.dive) {
        income = r2(V.aquarium(save).incomePerDay * days);
        save.money = r2(save.money + income);
      }
      prize = contestSettle(save, d1);
    }
    return { days: days, income: income, prize: prize };
  };

  V.canSleep = function (save) { return V.level(save, 'chatrc') >= 1; };

  V.sleep = function (save, which) {
    var from = save.clock;
    if (!V.canSleep(save)) return { ok: false, from: from, to: from, days: 0, income: 0, prize: 0, reason: needText('chatrc', 1) };
    var to = HL.world.nextTime(from, which === 'night' ? 'night' : 'morning');
    var r = V.advanceTo(save, to);
    return { ok: true, from: from, to: to, days: r.days, income: r.income, prize: r.prize };
  };

  V.storageCap = function (save) {
    var t = D.storageByHut;
    return t[Math.min(t.length - 1, V.level(save, 'chatrc'))];
  };

  // Ukladá TIE ISTÉ objekty (nie kópie): opakované uloženie alebo už predaný kus sa
  // preskočí, takže poradie "ulož / predaj" v UI nemôže rybu zdvojiť.
  V.store = function (save, items) {
    var cap = V.storageCap(save), rest = [];
    for (var i = 0; i < (items || []).length; i++) {
      var it = items[i];
      if (!it || it.sold || save.storage.indexOf(it) >= 0) continue;
      if (save.storage.length < cap) save.storage.push(it); else rest.push(it);
    }
    return rest;
  };

  V.maxDepth = function (save, loc) {
    if (HL.world.isLake(loc)) return V.lakeMaxDepth(save);
    var line = I().line[save.gear.line] || D.lines[0];
    var cap = V.level(save, 'majak') < 3 ? 1500 : Infinity;
    return Math.min(line.maxDepth, cap, D.SEA_FLOOR);
  };

  // ------------------------------------------------------------------ jadrové jazero
  V.lakeMaxDepth = function (save) {
    var line = I().lakeLine[save.gear.lakeLine];
    if (!line) return 0;
    var cap = D.lakeShipyardDepth[Math.min(3, V.level(save, 'lodenica'))];
    return Math.min(line.maxDepth, cap, D.LAKE_FLOOR);
  };
  // Dá sa ísť na jazero? { ok, reason, reasonKey } — prvá nesplnená podmienka (UI kreslí zámok podľa reasonKey).
  V.lakeAccess = function (save) {
    var out = { ok: false, reason: '', reasonKey: '' };
    if (V.level(save, 'lodenica') < 1) { out.reasonKey = 'sim.village.needBuilding'; out.reason = needText('lodenica', 1); }
    else if (!I().lakeLine[save.gear.lakeLine]) { out.reasonKey = 'sim.village.needLakeLine'; out.reason = t(out.reasonKey); }
    else if (!I().lakeRod[save.gear.lakeRod]) { out.reasonKey = 'sim.village.needLakeRod'; out.reason = t(out.reasonKey); }
    else out.ok = true;
    return out;
  };

  V.lightBonus = function (save, loc) {
    if (HL.world.isLake(loc)) return { night: 0, midnight: 0 };
    var l = Math.min(3, V.level(save, 'majak'));
    return { night: l * T.lightPerLighthouse, midnight: Math.max(0, l - 1) * T.lightPerLighthouse };
  };

  V.forecast = function (save, env) {
    env = env || HL.world.env(save);
    var lvl = Math.min(3, V.level(save, 'meteostanica'));
    var hours = METEO_H[lvl];
    return {
      hours: hours,
      segments: hours ? HL.world.segments(save.seed, env.m, env.m + hours * 60) : [],
      moon: lvl >= 3 ? [0, 1, 2].map(function (i) { return HL.world.moon(env.m + i * 1440); }) : null,
      intro: !!env.intro,
    };
  };

  // ------------------------------------------------------------------ predpoveď rýb (Príprava)
  // Majiteľ 2026-10-04: „v danú hodinu v danej hĺbke sú dané ryby". Ktoré druhy S PODMIENKOU berú teraz a v ďalších
  // hodinách a v akej hĺbke; dosah = forecast().hours (Meteostanica 0/6/24/72 h).
  //   fishForecast(save, loc?, env?, opts?) → { hours, intro, loc, clues, blocks: [ { from, to, period, weather, moon,
  //     parts, fish: [ { id, zone, depth: [a, b], legend, known, reachable } ] } ] }
  // - Bloky idú súvisle od env.m po env.m + hours × 60 a delia sa pri každej zmene úseku počasia, obdobia a dňa (fáza
  //   mesiaca). Susedné bloky s rovnakými rybami sa zlúčia: period/weather/moon bloku platia na jeho ZAČIATKU,
  //   parts = nezlúčené kúsky { from, to, period, weather, moon } (každý s jedným prostredím).
  // - hours 0 (bez Meteostanice) = JEDEN blok TERAZ: do najbližšej zmeny obdobia alebo dňa, s TERAJŠÍM počasím. Kedy
  //   sa počasie zmení, bez Meteostanice hráč nevie — `to` teda nesľubuje počasie, UI ho ukáže ako „teraz".
  // - Prostredie kúska = { period, weather, moon, event: env.event, guardianReady: env.guardianReady }; počas úvodu
  //   (env.intro) slnečno — to isté, čo ponor (sim/dive.js makeEnv). Ryby = čo by ponor v tom prostredí naozaj ponúkol
  //   (sim/dive.js eligible): HL.world.matches a sezónny druh len počas svojej udalosti. Druhy 'any' berú stále (boli
  //   by len šum) a chytená legenda sa už neobjaví (legendsCaught) — v zozname nie sú. Poradie podľa hĺbky.
  //   known = ako encyklopédia (záznam s n > 0; neznámy druh UI ukáže ako „?").
  // - Brána legiend (revízia 2026-10-04): nechytená legenda je v zozname, len keď má hráč stopy z Krčmy (úroveň ≥ 3 —
  //   to isté pravidlo, s ktorým encyklopédia ukáže podmienky legendy, ui/encyclopedia.js). Inak by „★ ?" s časom,
  //   počasím a hĺbkou prezradil podmienky legendy skôr, než ich Krčma povie. Brána platí PRED zlúčením blokov (bloky,
  //   ktoré sa líšili len legendou, sú jeden blok). clues = či brána legendy pustila; opts.allLegends = bez brány.
  //   Bežný nechytený druh ostáva („?" s hĺbkou je zámerná nápoveda).
  // - reachable = pravidlo ponoru (sim/dive.js): bežná ryba ide za návnadou aj mimo svojho rozsahu a zaberie až
  //   HL.dive.reachM pod najhlbším miestom háčika (depth[0] − reachM ≤ maxDepth — to isté ako data.test.js; meria
  //   line_reach.test.js), legenda sa objaví len pri háčiku V JEJ rozsahu (legendSpawn: depth[0] ≤ maxDepth). Bez
  //   vlasca (maxDepth 0 — jazero bez jazerného vlasca) sa ponoriť nedá: nič.
  // - Len číta: save, prúdy náhody ani výsledok simulácie sa nezmenia (keš počasia v sim/world.js je deterministický).
  function anyCond(sp) { var c = sp.cond || ['any']; return c.length === 1 && c[0] === 'any'; }
  // Dosiahne háčik (najhlbšie maxD) na druh? Bežná ryba: dosah záberu pod háčikom; legenda: háčik v jej rozsahu.
  function reachOf(sp, legend, maxD) {
    if (!(maxD > 0)) return false;
    return legend ? sp.depth[0] <= maxD : sp.depth[0] - HL.dive.reachM(sp) <= maxD;
  }
  // Minúty v (a, b), kde sa mení obdobie (D.periods) alebo deň (fáza mesiaca), vzostupne a bez opakovania.
  function timeCuts(a, b) {
    var out = [];
    for (var day = Math.floor(a / 1440); day * 1440 < b; day++) {
      var ms = [day * 1440];
      for (var i = 0; i < D.periods.length; i++) ms.push(day * 1440 + D.periods[i].from * 60, day * 1440 + D.periods[i].to * 60);
      for (var k = 0; k < ms.length; k++) if (ms[k] > a && ms[k] < b && out.indexOf(ms[k]) < 0) out.push(ms[k]);
    }
    return out.sort(function (x, y) { return x - y; });
  }
  // Druhy miesta Lc, ktoré v prostredí e berú (bez 'any', chytených legiend a bez legiend, keď clues nie je), podľa hĺbky.
  function forecastFish(save, Lc, e, maxD, clues) {
    var list = Lc.fish.concat(Lc.legends), nFish = Lc.fish.length, enc = save.encyclopedia || {}, got = save.legends || {}, ids = [];
    for (var i = 0; i < list.length; i++) {
      var sp = list[i];
      if (anyCond(sp) || (i >= nFish && (got[sp.id] || !clues))) continue;
      if (sp.event && sp.event !== e.event) continue;
      if (HL.world.matches(sp, e)) ids.push(i);
    }
    ids.sort(function (x, y) { var a = list[x].depth, b = list[y].depth; return a[0] - b[0] || a[1] - b[1] || x - y; });
    return ids.map(function (i) {
      var sp = list[i], en = enc[sp.id];
      return { id: sp.id, zone: sp.zone, depth: [sp.depth[0], sp.depth[1]], legend: i >= nFish, known: !!(en && en.n > 0), reachable: reachOf(sp, i >= nFish, maxD) };
    });
  }

  V.fishForecast = function (save, loc, env, opts) {
    env = env || HL.world.env(save);
    var Lc = HL.world.location(loc), maxD = V.maxDepth(save, loc), m0 = env.m;
    var clues = !!(opts && opts.allLegends) || V.level(save, 'krcma') >= 3;
    var hours = V.forecast(save, env).hours, parts = [];
    if (!hours) parts.push({ from: m0, to: timeCuts(m0, m0 + 1441)[0], weather: env.weather });
    else {
      var segs = HL.world.segments(save.seed, m0, m0 + hours * 60);
      for (var s = 0; s < segs.length; s++) {
        var a = segs[s].from, cuts = timeCuts(a, segs[s].to).concat([segs[s].to]);
        for (var c = 0; c < cuts.length; c++) { parts.push({ from: a, to: cuts[c], weather: env.intro ? 'sun' : segs[s].weather }); a = cuts[c]; }
      }
    }
    var blocks = [], lastKey = null;
    for (var p = 0; p < parts.length; p++) {
      var q = parts[p];
      q.period = HL.world.period(q.from);
      q.moon = HL.world.moon(q.from);
      var e = { period: q.period, weather: q.weather, moon: q.moon, event: env.event || null, guardianReady: !!env.guardianReady };
      var fish = forecastFish(save, Lc, e, maxD, clues), key = fish.map(function (f) { return f.id; }).join(',');
      if (blocks.length && key === lastKey) {
        blocks[blocks.length - 1].to = q.to;
        blocks[blocks.length - 1].parts.push(q);
      } else {
        blocks.push({ from: q.from, to: q.to, period: q.period, weather: q.weather, moon: q.moon, fish: fish, parts: [q] });
        lastKey = key;
      }
    }
    return { hours: hours, intro: !!env.intro, loc: Lc.id, clues: clues, blocks: blocks };
  };

  // ------------------------------------------------------------------ Krčma: tipy
  // Tipy jadrového jazera (od D.lakeTipFrom) až keď hráč pozná elektráreň (navštívil ju alebo stavia Lodenicu):
  // bez nich sa mieša presne ten istý zoznam ako pred jazerom — tie isté tipy v tie isté dni (revízia 2026-10-02).
  function knowsLake(save) {
    return V.level(save, 'lodenica') > 0 || !!(save.tutorial && save.tutorial.seen && save.tutorial.seen.plant);
  }
  V.tips = function (save, day) {
    if (V.level(save, 'krcma') < 1) return [];
    if (day == null) day = HL.world.day(save.clock);
    var n = knowsLake(save) || !(D.lakeTipFrom >= 0) ? D.tips.length : Math.min(D.tips.length, D.lakeTipFrom);
    var ids = D.tips.slice(0, n).map(function (_, i) { return i; });
    HL.rngFor(save.seed, 'tips', day).shuffle(ids);
    return ids.slice(0, 3).map(function (i) { return D.tips[i]; });
  };

  // ------------------------------------------------------------------ Krčma: úlohy
  // Text úlohy v AKTUÁLNOM jazyku. save.quests.active[].text je len kópia z chvíle vzniku —
  // quests() ju pri každom čítaní obnoví (prepnutie jazyka), UI môže čítať q.text.
  V.questText = function (q) {
    if (q.kind === 'catch') {
      var fk = 'sim.quest.fish.' + q.fishId;
      var what = L.has(fk) ? L.plural(q.count, fk) : (q.count === 1 ? String(q.fishId) : q.count + ' ' + q.fishId);
      var ck = 'sim.quest.cond.' + q.cond;
      return q.cond && L.has(ck) ? t('sim.quest.catchCond', { what: what, cond: t(ck) }) : t('sim.quest.catch', { what: what });
    }
    if (q.kind === 'depth') return t('sim.quest.depth', { depth: U.meters(q.count) });
    if (q.kind === 'value') return t('sim.quest.value', { money: U.money(q.count) });
    if (q.kind === 'count') return t('sim.quest.count', { fish: L.plural(q.count, 'sim.quest.countFish') });
    return '';
  };

  function ensureQuests(save) {
    var q = save.quests;
    if (!q || typeof q !== 'object') q = save.quests = {};
    if (!Array.isArray(q.active)) q.active = [];
    if (!U.isNum(q.done)) q.done = 0;
    if (!U.isNum(q.nextId)) q.nextId = 1;
    return q;
  }

  // Druhy, ktoré sa dnes dajú rozumne zadať: pásmo najviac o jedno hlbšie ako najhlbší
  // ponor, Priepasť len s Majákom 3, sezónne druhy len počas svojej udalosti.
  V.questSpecies = function (save) {
    var deep = HL.world.zoneIndex(HL.world.zoneAt((save.stats && save.stats.deepest) || 0).id);
    var majak = V.level(save, 'majak');
    return D.fish.filter(function (f) {
      var zi = HL.world.zoneIndex(f.zone), z = D.zones[zi];
      if (zi > deep + 1) return false;
      if (z.needLighthouse && majak < z.needLighthouse) return false;
      if (f.event && f.event !== HL.world.currentEvent) return false;
      return f.cond.indexOf('guardian') < 0;
    });
  };

  function genQuest(save, id, active) {
    var rng = HL.rngFor(save.seed, 'quest', id);
    var st = save.stats || {};
    var dives = Math.max(1, st.dives || 0);
    var kinds = [{ k: 'catch', w: 5 }, { k: 'depth', w: 1.5 }, { k: 'value', w: 2 }, { k: 'count', w: 1.5 }].filter(function (x) {
      return x.k === 'catch' || !active.some(function (q) { return q.kind === x.k; });
    });
    var k = rng.weighted(kinds).k;
    var q = { id: id, kind: k, count: 0, got: 0, reward: { money: 0, gold: 0 }, text: '' };
    var mult = T.questRewardMult;
    if (k === 'depth') {
      var maxD = V.maxDepth(save), deepest = st.deepest || 0;
      var target = Math.min(maxD, Math.max(40, round10(deepest * 1.25 + 20)));
      if (target <= deepest) k = q.kind = 'catch';
      else { q.count = target; q.reward.money = round5((target * 0.4 + 20) * mult); }
    }
    if (k === 'value') {
      q.count = Math.max(30, round10((st.earned || 0) / dives * 1.4));
      q.reward.money = round5(q.count * 0.5 * mult);
    }
    if (k === 'count') {
      q.count = U.clamp(Math.round((st.caught || 0) / dives + 2), 3, 12);
      q.reward.money = round5((q.count * 8 + 10) * mult);
    }
    if (k === 'catch') {
      var taken = active.filter(function (a) { return a.kind === 'catch'; }).map(function (a) { return a.fishId; });
      var cand = V.questSpecies(save).filter(function (f) { return taken.indexOf(f.id) < 0; });
      if (!cand.length) return null;
      var f = rng.pick(cand);
      q.fishId = f.id;
      q.count = SINGLE[f.id] || f.chance <= 0.2 ? 1 : rng.int(2, 4);
      var c = f.cond.length === 1 && COND_QUEST[f.cond[0]] ? f.cond[0] : null;
      if (c && rng.chance(0.5)) q.cond = c;
      q.reward.money = round5((f.price * q.count * 1.5 + 15) * mult);
    }
    q.reward.gold = rng.chance(T.questGoldChance) ? 1 : 0;
    q.text = V.questText(q);
    return q;
  }

  function refill(save) {
    var qs = ensureQuests(save);
    // Sezónna úloha, ktorej udalosť skončila, sa nedá splniť ani zrušiť — slot by blokovala ~10
    // mesiacov (nález #22). Filter pri vzniku nestačí; čistí sa pri každom doplnení. Na mieste
    // (splice), UI drží odkaz na pole.
    for (var i = qs.active.length - 1; i >= 0; i--) {
      var q0 = qs.active[i], f0 = q0 && q0.kind === 'catch' ? I().fish[q0.fishId] : null;
      if (f0 && f0.event && f0.event !== HL.world.currentEvent) qs.active.splice(i, 1);
    }
    var guard = 0;
    while (qs.active.length < T.questCount && guard++ < 24) {
      var q = genQuest(save, qs.nextId++, qs.active);
      if (q) qs.active.push(q);
    }
  }

  V.quests = function (save) {
    if (V.level(save, 'krcma') < 2) return [];
    refill(save);
    V.refreshTexts(save);
    return save.quests.active;
  };
  // Texty aktívnych úloh v aktuálnom jazyku (po prepnutí jazyka ich volá aj sim/game.js).
  V.refreshTexts = function (save) {
    var qs = save && save.quests && save.quests.active;
    if (!Array.isArray(qs)) return;
    for (var i = 0; i < qs.length; i++) if (qs[i] && typeof qs[i] === 'object') qs[i].text = V.questText(qs[i]);
  };

  function condAt(save, token, m) {
    var fn = D.COND[token];
    return !fn || fn(HL.world.env(save, m));
  }

  // Započíta ponor do úloh; vráti dokončené (už s pripísanou odmenou). Hĺbka sa ráta len z mora.
  function progressQuests(save, result, env) {
    if (V.level(save, 'krcma') < 2 || result.outcome !== 'surfaced') return [];
    var qs = ensureQuests(save), done = [], lake = HL.world.isLake(result.location);
    var value = null;
    for (var i = 0; i < qs.active.length; i++) {
      var q = qs.active[i], ok = false;
      if (q.kind === 'catch') {
        for (var j = 0; j < result.catch.length; j++) {
          var c = result.catch[j];
          if (c.id !== q.fishId) continue;
          if (q.cond && !condAt(save, q.cond, U.isNum(c.m) ? c.m : env.m)) continue;
          q.got++;
        }
        ok = q.got >= q.count;
      } else if (q.kind === 'depth') {
        if (lake) continue;
        q.got = Math.max(q.got, Math.round(result.maxDepth || 0));
        ok = q.got >= q.count;
      } else if (q.kind === 'value') {
        // Skutočný predaj po kusoch (dopyt klesá), nie súčet plných cien — tá istá trieda chyby ako
        // nadpis "Hodnota úlovku" (nález #27).
        if (value === null) value = HL.market.preview(save, result.catch, env).total;
        q.got = Math.max(q.got, Math.round(value));
        ok = value >= q.count;
      } else if (q.kind === 'count') {
        q.got = Math.max(q.got, result.catch.length);
        ok = result.catch.length >= q.count;
      }
      if (ok) done.push(q);
    }
    for (var k = 0; k < done.length; k++) {
      var d = done[k];
      save.money = r2(save.money + d.reward.money);
      if (d.reward.gold) save.baits.gold = (save.baits.gold || 0) + d.reward.gold;
      qs.done++;
      qs.active.splice(qs.active.indexOf(d), 1);
    }
    refill(save);
    return done;
  }

  // ------------------------------------------------------------------ Krčma: stopy a zlatá návnada
  V.clues = function (save) {
    if (V.level(save, 'krcma') < 3) return [];
    return D.allLegends.map(function (l) {
      var caught = !!(save.legends && save.legends[l.id]);
      var conds = l.cond.map(function (c) { return D.COND_LABEL[c] || c; }).join(', ');
      var text = caught ? t('sim.clue.caught') : t('sim.clue.text', { hint: l.hint, conds: conds, zone: HL.world.zoneName(l.zone) });
      return { id: l.id, name: l.name, text: text, caught: caught, cond: l.cond.slice(), zone: l.zone };
    });
  };

  V.goldOffer = function (save, env) {
    env = env || HL.world.env(save);
    var g = I().bait.gold, price = cost(g.price);
    // reasonKey (kľúč dôvodu pre UI) len keď dôvod je — tvar dostupnej ponuky ostáva { available, price, reason }.
    var out = { available: false, price: price, reason: '' };
    if (gateReason(save, g)) { out.reason = gateReason(save, g); out.reasonKey = gateKey(save, g); }
    else if (save.tavern && save.tavern.goldDay === env.day) { out.reasonKey = 'sim.village.goldSoldOut'; out.reason = t(out.reasonKey); }
    else if (save.money < price) { out.reasonKey = 'sim.village.noMoney'; out.reason = t(out.reasonKey); }
    else out.available = true;
    return out;
  };

  V.buyGold = function (save, env) {
    env = env || HL.world.env(save);
    var o = V.goldOffer(save, env);
    if (!o.available) return false;
    pay(save, o.price);
    save.baits.gold = (save.baits.gold || 0) + 1;
    save.tavern.goldDay = env.day;
    return true;
  };

  // ------------------------------------------------------------------ Letný festival: rybárska súťaž
  // Dizajn 12.3: "Rybárska súťaž v dedine: najťažšia ryba dňa" (nález #36). Každý súťažný deň majú
  // rybári z dediny svoj najťažší úlovok (cieľ) z HL.rngFor(seed, 'contest', deň) — T.contestNpcCatches
  // kusov bežných druhov z pásiem, kam hráč už došiel (najviac Polnoc; rybári z dediny do Priepasti
  // nechodia). Kto v ten deň vynesie ťažšiu rybu (legendy sa nerátajú, prasknutie nič nevynesie),
  // vyhrá T.contestPrizePerZone × (dosiahnuté pásmo + 1). Vypláca sa na prelome dňa, raz za deň.
  // Cieľ sa pri prvom ponore dňa zamkne v save.contest, aby sa počas dňa nemenil.
  function contestState(save) {
    var c = save.contest;
    if (!c || typeof c !== 'object') c = save.contest = { day: -1, targetKg: 0, targetId: null, bestKg: 0, bestId: null, won: false, prize: 0, paid: false };
    return c;
  }
  function reachedZone(save) { return HL.world.zoneIndex(HL.world.zoneAt((save.stats && save.stats.deepest) || 0).id); }
  function contestPrizeNow(save) { return Math.round(T.contestPrizePerZone * (reachedZone(save) + 1)); }
  function contestTarget(save, day) {
    var cap = Math.min(reachedZone(save), HL.world.zoneIndex('polnoc'));
    var cands = D.fish.filter(function (f) { return !f.event && f.cond.indexOf('guardian') < 0 && HL.world.zoneIndex(f.zone) <= cap; });
    var rng = HL.rngFor(save.seed, 'contest', day), best = null;
    for (var i = 0; i < Math.max(1, Math.round(T.contestNpcCatches)); i++) {
      var f = rng.pick(cands);
      // Tá istá veľkosť kusu ako v ponore (sim/specimen.js, jeden hod) — rybári z dediny chytajú aj trofeje.
      var w = HL.specimen.roll(rng, f).w;
      if (!best || w > best.w) best = { id: f.id, w: w };
    }
    return best;
  }
  // Vyplatí výhru dňa, ktorý už skončil (prelom dňa). Vráti vyplatenú sumu.
  function contestSettle(save, today) {
    var c = save.contest;
    if (!c || typeof c !== 'object' || !(c.day < today) || !c.won || c.paid) return 0;
    c.paid = true;
    save.money = r2(save.money + c.prize);
    return c.prize;
  }
  // Otvorí súťažný deň (zamkne cieľ). Predošlý deň najprv vyrovná — výhra sa nestratí.
  function contestOpen(save, day) {
    var c = contestState(save);
    if (c.day === day) return c;
    if (c.day > day) return null; // úlovok z dňa, ktorý sa už uzavrel
    contestSettle(save, day);
    var t = contestTarget(save, day);
    save.contest = { day: day, targetKg: t.w, targetId: t.id, bestKg: 0, bestId: null, won: false, prize: 0, paid: false };
    return save.contest;
  }
  // Zapíše vynesený úlovok kariérneho ponoru; vráti { won, day, targetKg, targetFishId, kg, id, prize }
  // pri novej výhre, inak null.
  function contestRecord(save, result, env) {
    if (env.event !== 'summer') return null;
    var out = null;
    // Úlovky v poradí zaseknutia; ponor cez polnoc má najprv kusy zo včera, potom z dneška.
    if (result.outcome === 'surfaced') {
      for (var i = 0; i < result.catch.length; i++) {
        var it = result.catch[i];
        if (!it || it.legend || I().legend[it.id] || !U.isNum(it.w)) continue;
        var c = contestOpen(save, HL.world.day(U.isNum(it.m) ? it.m : env.m));
        if (!c || it.w <= c.bestKg) continue;
        c.bestKg = it.w;
        c.bestId = it.id;
        if (!c.won && c.bestKg > c.targetKg) {
          c.won = true;
          c.prize = contestPrizeNow(save);
          out = { won: true, day: c.day, targetKg: c.targetKg, targetFishId: c.targetId, kg: it.w, id: it.id, prize: c.prize };
        }
      }
    }
    // Dnešný cieľ sa zamkne aj po ponore bez úlovku; včerajšia výhra sa tým vyplatí (prelom dňa).
    contestOpen(save, env.day);
    if (out) out.paid = out.day < env.day;
    return out;
  }

  // Pre UI: { active, day, targetKg, targetFishId, bestKg, bestId, won, prize, paid } pre deň env.
  // Čistá funkcia (nič nezapisuje): pred prvým ponorom dňa je cieľ vypočítaný, potom zamknutý.
  V.contest = function (save, env) {
    env = env || HL.world.env(save);
    var c = save.contest && typeof save.contest === 'object' ? save.contest : {};
    var mine = c.day === env.day && c.targetId != null;
    var t = mine ? { id: c.targetId, w: c.targetKg } : contestTarget(save, env.day);
    return {
      active: env.event === 'summer', day: env.day, targetKg: t.w, targetFishId: t.id,
      bestKg: mine ? c.bestKg : 0, bestId: mine ? c.bestId : null, won: mine && c.won,
      prize: mine && c.won ? c.prize : contestPrizeNow(save), paid: mine && c.paid,
    };
  };

  // ------------------------------------------------------------------ Akvárium, vzhľad dediny
  V.aquarium = function (save) {
    var lvl = V.level(save, 'akvarium'), enc = save.encyclopedia || {};
    var species = lvl >= 1 ? D.allFish.filter(function (f) { return enc[f.id] && enc[f.id].n > 0; }).map(function (f) { return f.id; }) : [];
    var trophies = lvl >= 3 ? D.allLegends.filter(function (l) { return save.legends && save.legends[l.id]; }).map(function (l) { return l.id; }) : [];
    var income = (lvl >= 2 ? T.aquariumPerSpecies * species.length : 0) + (lvl >= 3 ? T.aquariumPerTrophy * trophies.length : 0);
    return { species: species, trophies: trophies, incomePerDay: income };
  };

  // Čím viac úrovní, tým viac svetiel, ľudí a lodí (dokument 11, "vizuálny progres").
  V.people = function (save) {
    var total = 0;
    for (var i = 0; i < D.buildings.length; i++) total += V.level(save, D.buildings[i].id);
    var legends = Object.keys(save.legends || {}).length;
    return {
      lights: total,
      people: Math.min(12, 1 + Math.floor(total / 2) + (V.level(save, 'krcma') >= 1 ? 1 : 0)),
      boats: Math.min(6, 1 + (V.level(save, 'dielna') >= 2 ? 1 : 0) + (V.level(save, 'dielna') >= 3 ? 1 : 0) +
        (V.level(save, 'trhovisko') >= 3 ? 1 : 0) + Math.floor(legends / 2)),
    };
  };

  // ------------------------------------------------------------------ zápis ponoru
  V.applyDive = function (save, result, env) {
    HL.assert(result && Array.isArray(result.catch), 'applyDive: chýba výsledok ponoru');
    env = env || HL.world.env(save);
    var endless = result.mode === 'endless', lake = HL.world.isLake(result.location);
    var out = { newSpecies: [], records: [], quests: [], unlocks: [], contest: null };

    // Úlohy PRED štatistikou: intro a počasie sa tak posudzujú v stave, v akom ponor bežal.
    // Súťaž tiež: cieľ dňa závisí od pásma, kam hráč došiel PRED týmto ponorom.
    if (!endless) {
      out.quests = progressQuests(save, result, env);
      if (!lake) out.contest = contestRecord(save, result, env);
    }

    var enc = save.encyclopedia, before = {};
    for (var id in enc) if (Object.prototype.hasOwnProperty.call(enc, id)) before[id] = true;
    var st = save.stats, caught = 0;
    for (var i = 0; i < result.catch.length; i++) {
      var c = result.catch[i];
      // Poistka k sim/dive.js (nález #1): legenda z Nekonečnej hlbiny sa do kariéry nezapíše — jej
      // odmena sa vypláca len cez trh kariéry, zápis by ju navždy "minul" bez zisku.
      if (endless && I().legend[c.id]) continue;
      caught++;
      var e = enc[c.id];
      if (!e) {
        e = enc[c.id] = { n: 0, maxW: 0, firstDay: HL.world.day(U.isNum(c.m) ? c.m : env.m) };
        out.newSpecies.push(c.id);
      }
      e.n++;
      if (c.w > e.maxW) {
        if (before[c.id] && out.records.indexOf(c.id) < 0) out.records.push(c.id);
        e.maxW = c.w;
      }
      var l = I().legend[c.id];
      if (l && !save.legends[c.id]) {
        save.legends[c.id] = true;
        var u = l.reward && l.reward.unlock;
        out.unlocks.push({ legend: c.id, unlock: u, text: UNLOCK_TEXT[u] || '' });
        if (u === 'ending') save.flags.ending = true;
      }
      if (!st.biggest || c.w > st.biggest.w) st.biggest = { id: c.id, w: c.w };
    }

    st.dives++;
    if (result.outcome === 'snapped') st.snaps++;
    st.caught += caught;
    // Boje kariéry (aj uniknuté): prvých T.noviceFights je bojov nováčika (sim/fight.js, game.diveOptions).
    st.fights = (st.fights || 0) + (result.stats && U.isNum(result.stats.fights) ? Math.max(0, Math.floor(result.stats.fights)) : 0);
    if (!endless) {
      var dm = U.isNum(result.maxDepth) ? result.maxDepth : 0;
      if (lake) st.deepestLake = Math.max(st.deepestLake || 0, dm);
      else st.deepest = Math.max(st.deepest, dm);
      var bid = result.baitId, left = result.baitLeft;
      if (bid && Object.prototype.hasOwnProperty.call(save.baits, bid) && U.isNum(left) && left > 0) {
        save.baits[bid] += Math.floor(left);
      }
      // Harpúny pri štarte ponoru zo zásoby neodchádzajú (nález #38: zabitá karta uprostred ponoru
      // ich inak zmazala natrvalo); tu sa odpočítajú len vystrelené.
      var used = U.isNum(result.harpoonsUsed) ? Math.max(0, Math.floor(result.harpoonsUsed)) : 0;
      if (used) save.gear.harpoons = Math.max(0, (save.gear.harpoons || 0) - used);
    }
    return out;
  };
})(globalThis.HL);
