// Napätie vlasca (dizajn 4, ARCHITECTURE.md §10).
//
//   HL.tension.depthMult(depth, div?) -> 1 + depth / (div || T.depthDiv)
//   HL.tension.depthDiv(d)            -> platný deliteľ pre ponor d (vylepšenie lightDepth ho zväčší)
//   HL.tension.compute(d) -> { total, strength, ratio, level, parts:{ fish, fight, spikes, jelly, octopus, hazard } }
//
// Prečo je napätie čistá funkcia stavu ponoru a nie priebežne sčítavané číslo: násobiteľ sa
// počíta z AKTUÁLNEJ hĺbky háčika (dizajn 4: "keď hráč klesne s plným vlascom hlbšie, napätie
// narastie aj bez novej ryby"). Keby sa záťaž ryby zapísala v hĺbke záberu, klesanie s úlovkom
// by nebolo riskantné a hlavná dilema hry by zmizla.
//
// Časti (parts):
//   fish     Σ lineKg × depthMult(hĺbka háčika) za ryby VISIACE na vlasci (d.onLine)
//   fight    ťah bojujúcej ryby (HL.fight.pullKg) × (1 + (depthMult − 1) × T.pullDepthScale)
//   spikes   skoky po zlých ťuknutiach (HL.fight.spikeKg) × ten istý faktor
//   jelly    počet aktívnych dotykov medúzy × T.jellyTensionFrac × pevnosť
//   octopus  T.octopusLoadKg × depthMult × octopus.load (nábeh 0..1), kým je chobotnica prichytená
//   hazard   ROZŠÍRENIE zmluvy: trhnutia prúdu a blesky počas boja s legendou (d.hazardSpikes),
//            lineárne doznievajú za T.spikeDecaySec ako skoky boja. Samostatne, aby UI a testy
//            videli, že skok spôsobila legenda, a nie hráčovo zlé ťuknutie.
// level: 0 pod T.warn1, 1 od warn1 (škrípanie), 2 od warn2 (kmitanie), 3 od warn3 (vysoký tón).
// Prasknutie rozhoduje sim/dive.js, keď ratio > 1 (prísne väčšie: presne plná pevnosť ešte drží).
(function (HL) {
  var T = HL.T;
  // Vylepšenie Nekonečnej hlbiny "Hĺbka zaťažuje o 15 % menej" (data/world.js perks: lightDepth).
  // Deliteľ sa pri opakovanom výbere násobí, takže násobiteľ nikdy neklesne pod 1.
  T.def('Nekonečná', 'perkLightDepth', 1.15, 1, 2, 0.01, 'Ľahšia hĺbka: násobok deliteľa hĺbky');

  function perkN(d, id) {
    var v = d && d.perks && d.perks[id];
    if (v === true) return 1;
    return HL.util.isNum(v) && v > 0 ? Math.floor(v) : 0;
  }

  function depthMult(depth, div) {
    var dv = div || T.depthDiv;
    HL.assert(HL.util.isNum(depth), 'tension.depthMult: hĺbka nie je číslo');
    // Nad hladinou (záporná hĺbka pri animácii) vlasec nezaťaží menej ako na hladine.
    return 1 + Math.max(0, depth) / dv;
  }

  function depthDiv(d) {
    return T.depthDiv * Math.pow(T.perkLightDepth, perkN(d, 'lightDepth'));
  }

  function levelOf(ratio) {
    if (ratio >= T.warn3) return 3;
    if (ratio >= T.warn2) return 2;
    if (ratio >= T.warn1) return 1;
    return 0;
  }

  // Lineárne doznievanie ako skoky v boji (sim/fight.js): skok zmizne presne po T.spikeDecaySec.
  function decaying(list, now) {
    var dec = T.spikeDecaySec, s = 0;
    if (!list) return 0;
    for (var i = 0; i < list.length; i++) {
      var age = now - list[i].t;
      if (age >= 0 && age < dec) s += list[i].kg * (1 - age / dec);
    }
    return s;
  }

  function compute(d) {
    HL.assert(d && d.hook && d.line, 'tension.compute: chýba stav ponoru');
    var depth = d.hook.depth;
    var dm = depthMult(depth, depthDiv(d));
    var strength = d.line.strength;
    HL.assert(HL.util.isNum(strength) && strength > 0, 'tension.compute: pevnosť vlasca musí byť kladná');

    var fish = 0, i;
    var on = d.onLine || [];
    for (i = 0; i < on.length; i++) {
      HL.assert(HL.util.isNum(on[i].lineKg), 'tension.compute: ryba bez lineKg (' + on[i].id + ')');
      fish += on[i].lineKg * dm;
    }

    // Dokument 5.3: ťah = váha × sila ťahu bez hĺbky; T.pullDepthScale to smie zapnúť.
    var pullScale = 1 + (dm - 1) * T.pullDepthScale;
    var fight = 0, spikes = 0;
    if (d.fight && HL.fight) {
      fight = HL.fight.pullKg(d.fight) * pullScale;
      spikes = HL.fight.spikeKg(d.fight) * pullScale;
    }

    var hits = 0, now = d.t || 0;
    var jh = d.jellyHits || [];
    for (i = 0; i < jh.length; i++) if (jh[i].until > now) hits++;
    var jelly = hits * T.jellyTensionFrac * strength;

    var octopus = d.octopus && d.octopus.attached ? T.octopusLoadKg * dm : 0;
    // Nábeh (0..1, píše ho sim/dive.js od prichytenia): plná záťaž v tom istom kroku, v ktorom sa
    // chobotnica chytí, pretrhla vlasec bez varovania (nález #2/#7). Bez poľa load = plná záťaž.
    if (octopus && HL.util.isNum(d.octopus.load)) octopus *= HL.util.clamp01(d.octopus.load);
    var hazard = decaying(d.hazardSpikes, now) * pullScale;

    var total = fish + fight + spikes + jelly + octopus + hazard;
    var ratio = total / strength;
    return {
      total: total, strength: strength, ratio: ratio, level: levelOf(ratio), depthMult: dm,
      parts: { fish: fish, fight: fight, spikes: spikes, jelly: jelly, octopus: octopus, hazard: hazard },
    };
  }

  HL.tension = {
    depthMult: depthMult,
    depthDiv: depthDiv,
    levelOf: levelOf,
    decaying: decaying,
    compute: compute,
  };
})(globalThis.HL);
