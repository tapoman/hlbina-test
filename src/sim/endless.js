// Nekonečná hlbina (dizajn 12.2, ARCHITECTURE.md §12): vylepšenia počas ponoru a rebríček.
//
//   HL.endless.offer(d) -> [id, id, id]      volá sim/dive.js, keď háčik dosiahne d.nextPerkAt;
//                                            stav 'perk' (simulácia stojí), udalosť 'perkOffer'
//   HL.endless.take(d, index) -> id          výber cez DiveInput.perkPick (0|1|2); udalosť 'perkTaken'
//   HL.endless.apply(d, id)                  účinok vylepšenia (bez ponuky — take ho volá)
//   HL.endless.count(d, id) -> počet výberov
//   HL.endless.pool(d) -> [id]               čo sa ešte smie ponúknuť
//   HL.endless.record(save, result, dayOrEnv, value?) -> poradie 1..10, alebo -1 mimo rebríčka
//   HL.endless.best(save) -> [ { depth, value, fish, day } ]
//
// Účinky (d.perks = { id: počet }; čítajú ich tie súbory, ktoré účinok počítajú, v okamihu použitia):
//   strength    pevnosť × T.perkStrength^n            sim/dive.js (refreshLine)
//   grip        postup za ťuknutie × T.perkGrip^n     sim/fight.js
//   slowEscape  pokles postupu × T.perkSlowEscape^n   sim/fight.js
//   tolerance   + T.perkToleranceMs × n               sim/fight.js
//   jellyImmune medúzy sa háčika nedotknú              sim/dive.js
//   harpoon     +1 harpúna hneď                        tu (apply)
//   light       svetlo + T.perkLightPx × n            sim/dive.js (d.light pre UI)
//   sink        klesanie × T.perkSink^n                sim/dive.js
//   lure        šanca na záber × T.perkLure^n          sim/dive.js
//   sharkSlow   žralok útočí o T.perkSharkSlowSec × n neskôr   sim/dive.js
//   rockProof   skaly neoslabia vlasec                 sim/dive.js
//   lightDepth  deliteľ hĺbky × T.perkLightDepth^n     sim/tension.js
//   knot        n zachránených prasknutí               sim/dive.js (snap)
// Opakovaný výber sa násobí, nie sčíta (ako v sim/fight.js): pri násobení nič nepretečie do nezmyslu.
//
// ROZHODNUTIA:
// - Ponuka = 3 RÔZNE vylepšenia z vlastného prúdu náhody ponoru (d._.r.perk), takže rovnaké semeno
//   ponúkne rovnaké vylepšenia. 'jellyImmune' a 'rockProof' sa po výbere už neponúkajú — druhý kus
//   by nič nerobil a ponuka s mŕtvou voľbou je v skutočnosti ponuka dvoch.
// - Rebríček: top 10 podľa hĺbky, pri rovnosti podľa hodnoty; rovnaký výsledok ako starší záznam
//   sa zaradí ZA neho (starší rekord si miesto drží). Poradie je od 1 (ako záložná cesta v sim/game.js);
//   výsledok mimo top 10 vráti -1. Tretí parameter je deň (číslo) alebo Env (game.js posiela Env).
//   Hodnota: explicitný 4. parameter, inak result.value (sim/dive.js ju počíta cez opts.priceFn
//   na konci ponoru), inak 0. Prasknutý ponor sa zapíše tiež — hĺbka je výkon, úlovok je 0.
(function (HL) {
  var U = HL.util, D = HL.data, T = HL.T;
  var OFFER = 3;
  var MAX_BEST = 10;
  var ONCE = { jellyImmune: true, rockProof: true };

  var ids = null;
  function known(id) {
    if (!ids) { ids = {}; for (var i = 0; i < D.perks.length; i++) ids[D.perks[i].id] = D.perks[i]; }
    return ids[id] || null;
  }

  function count(d, id) {
    var v = d.perks && d.perks[id];
    if (v === true) return 1;
    return U.isNum(v) && v > 0 ? Math.floor(v) : 0;
  }

  function pool(d) {
    var out = [];
    for (var i = 0; i < D.perks.length; i++) {
      var id = D.perks[i].id;
      if (ONCE[id] && count(d, id) > 0) continue;
      out.push(id);
    }
    return out;
  }

  function offer(d) {
    HL.assert(d && d.mode === 'endless', 'endless.offer: iba v Nekonečnej hlbine');
    var list = d._.r.perk.shuffle(pool(d)).slice(0, OFFER);
    d.perkOffer = list;
    d.state = 'perk';
    var at = d.nextPerkAt;
    d.nextPerkAt += T.endlessPerkEvery;
    d.events.push({ type: 'perkOffer', ids: list.slice(), depth: at });
    return list;
  }

  function apply(d, id) {
    HL.assert(known(id), 'endless.apply: neznáme vylepšenie ' + id);
    d.perks[id] = count(d, id) + 1;
    if (id === 'harpoon') d.harpoons += 1;
    if (HL.dive && HL.dive.refresh) HL.dive.refresh(d);
    return d.perks[id];
  }

  function take(d, index) {
    HL.assert(d.state === 'perk' && d.perkOffer, 'endless.take: žiadna ponuka');
    var id = d.perkOffer[index];
    HL.assert(id, 'endless.take: neplatný výber ' + index);
    var n = apply(d, id);
    d.perkOffer = null;
    d.state = 'dive';
    d.events.push({ type: 'perkTaken', id: id, n: n, name: known(id).name });
    return id;
  }

  function best(save) {
    if (!save.endless || !Array.isArray(save.endless.best)) save.endless = { best: [] };
    return save.endless.best;
  }

  function record(save, result, when, value) {
    HL.assert(save && result && Array.isArray(result.catch), 'endless.record: chýba uloženie alebo výsledok');
    var day = U.isNum(when) ? when
      : when && U.isNum(when.day) ? when.day
      : U.isNum(save.clock) ? HL.world.day(save.clock) : 0;
    var v = U.isNum(value) ? value : U.isNum(result.value) ? result.value : 0;
    var entry = {
      depth: Math.max(0, Math.round(U.isNum(result.maxDepth) ? result.maxDepth : 0)),
      value: Math.max(0, Math.round(v)),
      fish: result.catch.length,
      day: day,
    };
    var list = best(save);
    list.push(entry);
    // Array.prototype.sort je stabilný (ES2019), takže nový záznam ostane za rovnakým starším.
    list.sort(function (a, b) { return b.depth - a.depth || b.value - a.value; });
    var i = list.indexOf(entry);
    if (list.length > MAX_BEST) list.length = MAX_BEST;
    return i < MAX_BEST ? i + 1 : -1;
  }

  function perkName(id) { var p = known(id); return p ? p.name : String(id); }

  HL.endless = {
    OFFER: OFFER,
    MAX_BEST: MAX_BEST,
    offer: offer,
    take: take,
    apply: apply,
    count: count,
    pool: pool,
    record: record,
    best: best,
    perkName: perkName,
  };
})(globalThis.HL);
