// Veľkosť kusu (spätná väzba testerov 2026-09-27: "váha ryby a veľkosť, rarita").
//
//   HL.specimen.TIERS -> [{ id, name, tag, w, lo, hi }]   od najmenšieho; w = váha výberu,
//                                                          lo..hi = násobok typickej váhy druhu
//   HL.specimen.roll(rng, species, force?) -> { w, tier, mult }   váha kusu (kg, 2 desatinné miesta) a trieda
//                                                          (force = id triedy natvrdo: harness ?tier=, testy)
//   HL.specimen.maxMult() -> najväčší možný násobok (data.test.js: ťah najťažšieho kusu vs. vlasec)
//   HL.specimen.minMult() -> najmenší možný násobok
//   HL.specimen.tier(id) -> trieda | null ; HL.specimen.tierOf(species, w) -> id triedy podľa pomeru váh
//                          (len ZÁLOHA pre starší kus bez poľa tier — pri hranici ho zaokrúhlenie váhy môže posunúť)
//
// Predtým mal každý kus váhu typická × (1 ± 25 %) rovnomerne. Teraz sa najprv losuje TRIEDA
// (malý / bežný / veľký / trofejný) a v nej násobok. Vzácny trofejný kus je ťažší, drahší
// (cena rastie s váhou, HL.market) a ťažší na boj (HL.fight.difficulty ho pridá k obtiažnosti).
//
// ROZHODNUTIE: roll() berie z rng PRÁVE JEDNO číslo, rovnako ako starý hod váhy. To isté číslo
// určí triedu (kumulatívne váhy) aj polohu v nej (zvyšok v rámci triedy). Prúd 'spawn' ponoru
// preto ostáva zarovnaný: ten istý ponor prinesie tie isté druhy v tých istých chvíľach ako pred
// zmenou — mení sa len váha kusov. (Tri hody by posunuli všetky ďalšie ryby a staré testy by
// zrazu merali iné more.)
//
// Hranice tried nadväzujú (hi jednej = lo ďalšej), takže násobky pokrývajú súvislý interval
// [minMult, maxMult] a priemer je blízko 1 (ekonomika sa nepohne). Najväčší násobok stráži
// data.test.js: ťah najťažšieho kusu nesmie sám prekročiť najslabší vlasec, ktorý k druhu dosiahne.
(function (HL) {
  var T = HL.T;
  var d_ = T.def;
  // Váhy výberu (relatívne) a rozsahy násobkov. Posuvníky, lebo "ako často trofej" je otázka pocitu.
  d_('Obtiažnosť', 'tierSmallW', 25, 0, 100, 1, 'Veľkosť kusu: váha výberu — malý');
  d_('Obtiažnosť', 'tierNormalW', 50, 0, 100, 1, 'Veľkosť kusu: váha výberu — bežný');
  d_('Obtiažnosť', 'tierBigW', 18, 0, 100, 1, 'Veľkosť kusu: váha výberu — veľký');
  d_('Obtiažnosť', 'tierTrophyW', 7, 0, 100, 1, 'Veľkosť kusu: váha výberu — trofejný');
  d_('Obtiažnosť', 'tierSmallLo', 0.7, 0.3, 1, 0.05, 'Veľkosť kusu: malý od × typickej váhy');
  d_('Obtiažnosť', 'tierNormalLo', 0.9, 0.5, 1, 0.05, 'Veľkosť kusu: bežný od × (= malý do)');
  d_('Obtiažnosť', 'tierBigLo', 1.1, 1, 1.5, 0.05, 'Veľkosť kusu: veľký od × (= bežný do)');
  d_('Obtiažnosť', 'tierTrophyLo', 1.3, 1, 2, 0.05, 'Veľkosť kusu: trofejný od × (= veľký do)');
  // Strop 1,5: vyšší by pri mureni na konopnom vlasci a latimérii na oceľovom prekročil pevnosť
  // samotným ťahom (data.test.js) — isté prasknutie, ktorému hráč nevie zabrániť.
  d_('Obtiažnosť', 'tierTrophyHi', 1.5, 1, 2, 0.05, 'Veľkosť kusu: trofejný do × (strop — stráži data.test.js)');

  // name/tag = slovenský zdroj; prekladá sa na mieste (tier.<id>.name / .tag, docs/I18N.md).
  // i18n-source:begin
  var DEFS = [
    { id: 'maly', name: 'malý', tag: 'MALÝ', wKey: 'tierSmallW', loKey: 'tierSmallLo', hiKey: 'tierNormalLo' },
    { id: 'bezny', name: 'bežný', tag: 'BEŽNÝ', wKey: 'tierNormalW', loKey: 'tierNormalLo', hiKey: 'tierBigLo' },
    { id: 'velky', name: 'veľký', tag: 'VEĽKÝ KUS', wKey: 'tierBigW', loKey: 'tierBigLo', hiKey: 'tierTrophyLo' },
    { id: 'trofejny', name: 'trofejný', tag: 'TROFEJ!', wKey: 'tierTrophyW', loKey: 'tierTrophyLo', hiKey: 'tierTrophyHi' },
  ];
  // i18n-source:end
  HL.i18n.overlay(DEFS, 'tier', ['name', 'tag']);

  // Triedy sa čítajú ŽIVO z T (posuvník F2 platí hneď). Neplatné poradie (lo > hi po ladení)
  // sa zoradí, aby hod nikdy nevrátil zápornú ani obrátenú váhu.
  function tiers() {
    return DEFS.map(function (t) {
      var lo = T[t.loKey], hi = T[t.hiKey];
      if (hi < lo) { var x = lo; lo = hi; hi = x; }
      return { id: t.id, name: t.name, tag: t.tag, w: Math.max(0, T[t.wKey]), lo: lo, hi: hi };
    });
  }

  function r2(v) { return Math.round(v * 100) / 100; }

  // force = id triedy natvrdo (harness ?tier=, testy): hod sa aj tak spraví (prúd ostane zarovnaný)
  // a určí polohu v tej triede.
  function roll(rng, species, force) {
    HL.assert(rng && typeof rng.next === 'function', 'specimen.roll: chýba rng (HL.RNG)');
    HL.assert(species && HL.util.isNum(species.weight) && species.weight > 0, 'specimen.roll: druh bez váhy');
    var ts = tiers(), total = 0, i;
    for (i = 0; i < ts.length; i++) total += ts[i].w;
    var u = rng.next();                   // JEDINÝ hod (pozri hlavičku)
    var pick = ts[1], frac = u, forced = force != null ? tier(force) : null;
    HL.assert(force == null || forced, 'specimen.roll: neznáma trieda ' + force);
    if (forced) pick = forced;
    else if (total > 0) {
      var x = u * total;
      for (i = 0; i < ts.length; i++) {
        if (ts[i].w <= 0) continue;
        pick = ts[i];
        if (x < ts[i].w) { frac = x / ts[i].w; break; }
        x -= ts[i].w;
        frac = 1;
      }
    }
    var mult = pick.lo + (pick.hi - pick.lo) * HL.util.clamp01(frac);
    // Aj najmenší kus váži aspoň 0,01 kg (r2 by inak drobnú rybu pri násobku 0,3 zaokrúhlil na 0).
    return { w: Math.max(0.01, r2(species.weight * mult)), tier: pick.id, mult: mult };
  }

  function maxMult() {
    var ts = tiers(), m = 0;
    for (var i = 0; i < ts.length; i++) if (ts[i].w > 0) m = Math.max(m, ts[i].hi);
    return m;
  }
  function minMult() {
    var ts = tiers(), m = Infinity;
    for (var i = 0; i < ts.length; i++) if (ts[i].w > 0) m = Math.min(m, ts[i].lo);
    return m;
  }
  function tier(id) {
    var ts = tiers();
    for (var i = 0; i < ts.length; i++) if (ts[i].id === id) return ts[i];
    return null;
  }
  function tierOf(species, w) {
    if (!species || !(species.weight > 0) || !HL.util.isNum(w)) return null;
    var ratio = w / species.weight, ts = tiers();
    for (var i = 0; i < ts.length; i++) if (ratio < ts[i].hi) return ts[i].id;
    return ts[ts.length - 1].id;
  }

  HL.specimen = {
    tiers: tiers,
    roll: roll,
    maxMult: maxMult,
    minMult: minMult,
    tier: tier,
    tierOf: tierOf,
  };
  // Kópia pri každom čítaní — mená v aktuálnom jazyku (DEFS sa prekladajú na mieste).
  Object.defineProperty(HL.specimen, 'TIERS', {
    enumerable: true,
    get: function () { return DEFS.map(function (t) { return { id: t.id, name: t.name, tag: t.tag }; }); },
  });
})(globalThis.HL);
