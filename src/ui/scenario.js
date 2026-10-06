// Scenáre pre harness (tools/shot.js) a ručné ladenie cez URL. Nič z toho nebeží
// v bežnej hre — iba keď je parameter v adrese. Všetko ide cez skutočnú simuláciu:
// počasie sa NEVNUCUJE, hľadá sa skutočný čas, kedy také počasie podľa semena nastane.
//
//   ?demo=built        všetky budovy na úrovni 3, všetka výbava, návnady, dve legendy, časť encyklopédie
//   ?demo=some         časť encyklopédie (8 druhov)
//   ?line=braided      vlastniť a nasadiť vlasec
//   ?time=22           posunúť hodiny na 22:00 (toho dňa, alebo nasledujúceho)
//   ?weather=storm     posunúť hodiny na najbližšiu hodinu s týmto počasím (vypne intro)
// Ponor (volá ui/dive.js hneď po HL.game.startDive):
//   ?depth=320         háčik začne v tejto hĺbke
//   ?fight=okun        hneď začne boj s týmto druhom
//   ?demo=catch        na vlasci visia 3 ryby
//   ?demo=heavy        na vlasci toľko rýb, aby napätie bolo ~90 %
(function (HL) {
  var S = HL.scenario = {};

  S.apply = function (Q) {
    var s = HL.game && HL.game.save;
    if (!s) return;
    var changed = false;
    if (Q.demo === 'built') {
      HL.data.buildings.forEach(function (b) { s.buildings[b.id] = 3; });
      ['hemp', 'nylon', 'braided', 'steel'].forEach(own);
      ['bamboo', 'fiber', 'carbon', 'master'].forEach(own);
      ['basic', 'barbed', 'circle', 'titan'].forEach(own);
      s.gear.line = 'steel'; s.gear.rod = 'master'; s.gear.hook = 'titan'; s.gear.harpoons = 3;
      // jadrové jazero (docs/JAZERO.md): celá jazerná výbava
      ['lead', 'graphite', 'zirconium', 'lead_rod', 'graphite_rod', 'zirconium_rod'].forEach(own);
      s.gear.lakeLine = 'zirconium'; s.gear.lakeRod = 'zirconium_rod';
      if (s.tutorial && s.tutorial.seen) s.tutorial.seen.plant = true; // skúsený hráč: úvod elektrárne už videl
      s.baits.shell = 20; s.baits.squid = 20; s.baits.glow = 20; s.baits.gold = 2;
      s.legends.zlaty_uhor = true; s.legends.hmlista_dama = true;
      s.stats.dives = Math.max(s.stats.dives, 12);
      fillEncyclopedia(s, 99);
      if (!Q.money) s.money = 25000;
      changed = true;
    }
    if (Q.demo === 'some') { fillEncyclopedia(s, 8); s.stats.dives = Math.max(s.stats.dives, 5); changed = true; }
    if (Q.line && HL.data.lines.some(function (l) { return l.id === Q.line; })) { own(Q.line); s.gear.line = Q.line; changed = true; }
    if (Q.money) { s.money = Number(Q.money) || 0; changed = true; }
    // ?loc=jadro: ponor v jadrovom jazere — Lodenica podľa ?depth (L1 do 300 m, L2 do 700, L3 k jadru) a jazerná výbava
    if (Q.loc === 'jadro') {
      var dq = Number(Q.depth) || 0;
      s.buildings.dielna = Math.max(s.buildings.dielna || 0, 2);
      s.buildings.lodenica = Math.max(s.buildings.lodenica || 0, dq > 700 ? 3 : dq > 300 ? 2 : 1);
      s.buildings.laboratorium = Math.max(s.buildings.laboratorium || 0, 3);
      ['zirconium', 'zirconium_rod'].forEach(own);
      if (!s.gear.lakeLine) s.gear.lakeLine = 'zirconium';
      if (!s.gear.lakeRod) s.gear.lakeRod = 'zirconium_rod';
      s.stats.dives = Math.max(s.stats.dives, HL.T.introDives);
      changed = true;
    }
    if (Q.weather) {
      s.stats.dives = Math.max(s.stats.dives, HL.T.introDives);
      var wantHour = Q.time != null ? Number(Q.time) : null;
      var m0 = Math.floor(s.clock / 60) * 60;
      for (var k = 0; k < 24 * 60; k++) { // hľadá až 60 dní dopredu po hodinách
        var m = m0 + k * 60;
        if (HL.world.weatherAt(s.seed, m) !== Q.weather) continue;
        if (wantHour != null && Math.floor(HL.world.minuteOfDay(m) / 60) !== wantHour) continue;
        s.clock = m;
        break;
      }
      changed = true;
    } else if (Q.time != null) {
      var h = Number(Q.time);
      var day = HL.world.day(s.clock);
      var target = day * 1440 + h * 60;
      if (target < s.clock) target += 1440;
      s.clock = target;
      changed = true;
    }
    if (changed && HL.market && HL.market.ensure) HL.market.ensure(s);

    function own(id) { if (s.gear.owned.indexOf(id) < 0) s.gear.owned.push(id); }
  };

  function fillEncyclopedia(s, n) {
    var list = HL.data.fish.filter(function (f) { return !f.event; }).slice(0, n);
    list.forEach(function (f, i) {
      var e = s.encyclopedia[f.id] = { n: 1 + (i % 4), maxW: Math.round(f.weight * (1.1 + (i % 3) * 0.05) * 10) / 10, firstDay: 0 };
      // štatistiky musia súhlasiť s encyklopédiou (inak panel ukazoval "Chytených rýb 0" pri 8 druhoch)
      s.stats.caught = (s.stats.caught || 0) + e.n;
      // každá chytená ryba bola boj: demo kariéra s encyklopédiou nie je nováčik (T.noviceFights)
      s.stats.fights = Math.max(s.stats.fights || 0, s.stats.caught);
      if (!s.stats.biggest || e.maxW > s.stats.biggest.w) s.stats.biggest = { id: f.id, w: e.maxW };
    });
  }

  // Ponorové scenáre. Dopĺňa ich ui/dive.js — tu je iba to, čo nepotrebuje vnútro dive.js.
  S.dive = function (d, Q) {
    if (!d) return;
    if (Q.depth != null) {
      var dep = Math.max(0, Math.min(Number(Q.depth) || 0, d.line && isFinite(d.line.maxDepth) ? d.line.maxDepth : 1e9));
      d.hook.depth = dep;
      d.maxDepthReached = Math.max(d.maxDepthReached || 0, dep);
    }
    var lake = HL.world.isLake(d.location);
    if (Q.demo === 'catch') {
      (lake ? ['trojoky_ostriez', 'dvojhlavy_kapor', 'svietiaca_plotica'] : ['makrela', 'pyskac', 'papagajovka']).forEach(function (id) { hang(id); });
      d.tension = HL.tension.compute(d);
    }
    if (Q.demo === 'heavy') {
      // Plní vlasec od najťažšieho druhu, ktorý sa ešte zmestí, kým napätie nie je 85–92 % —
      // stav "červená" musí byť NAOZAJ v zábere (kritik: pôvodný scenár skončil na 60 % a zelenej).
      var mult = HL.tension.depthMult(d.hook.depth);
      var list = HL.world.location(d.location).fish.filter(function (f) { return !f.event; }).sort(function (a, b) { return b.weight - a.weight; });
      for (var guard = 0; guard < 60; guard++) {
        var room = d.line.strength * 0.92 - HL.tension.compute(d).total, pick = null;
        for (var i = 0; i < list.length; i++) if (list[i].weight * mult <= room) { pick = list[i]; break; }
        if (!pick) break;
        hang(pick.id);
        if (HL.tension.compute(d).total >= d.line.strength * 0.85) break;
      }
      d.tension = HL.tension.compute(d);
    }
    function hang(id) {
      var f = HL.data.allFish.find(function (x) { return x.id === id; });
      d.onLine.push({ id: f.id, w: f.weight, lineKg: f.weight, legend: false, tier: 'bezny', m: d.clock, depth: d.hook.depth });
    }
  };
})(globalThis.HL);
