// Uloženie kariéry a nastavení (§5). Save je obyčajný JSON objekt; tento súbor ho vytvára,
// serializuje, kontroluje, opravuje a zapisuje do úložiska, ktoré dodá hostiteľ.
//
// - Žiadny globálny prehliadačový objekt: úložisko príde parametrom alebo z HL.save.storage
//   (nastaví HL.game.init podľa host.storage). V Node je null a nič sa neukladá.
//   Každý prístup k úložisku je v try/catch — súkromné okno ho smie zakázať alebo zaplniť.
// - serialize: JSON by Infinity aj NaN ticho zmenil na null. Kódujeme ich ako značky, aby
//   Infinity prežilo cestu tam a späť a NaN sa po načítaní ukázalo vo validate(), namiesto
//   toho, aby z peňazí potichu bola nula.
// - deserialize: migrácia starších verzií (zatiaľ len v1), doplnenie chýbajúcich polí
//   z predvolených hodnôt (novšia hra otvorí starší save). Hodí chybu pri nezmysle
//   (nie JSON, nie objekt, bez verzie, novšia verzia, semeno nie je číslo).
// - validate: zoznam problémov po slovensky s cestou k poľu. [] = v poriadku. Sú to správy pre VÝVOJÁRA
//   (hlásenie chyby, lastErrorDetail) — neprekladajú sa. i18n-dev: bad, fix, num (tests/i18n_scan.js)
// - store ODMIETNE zapísať save s problémami: prepísať dobrú kariéru poškodenou je horšie
//   než prísť o posledné minúty. Dôvod ostane v HL.save.lastError (a HL.game.persistError).
// - repair: opraví, čo validate nájde (NaN → predvolené, neznáme id preč), a vráti zoznam
//   opráv. Používa ho HL.game.init, aby jeden premenovaný druh nezmazal celú kariéru.
// - rev (revízia zápisu) a peekRev: podľa nich HL.game.persist pozná, že iná karta zapísala
//   novší stav, a neprepíše ho. contest = stav letnej súťaže (sim/village.js).
// - Nastavenie event je len 'auto' | 'none'; ľubovoľná udalosť iba cez ?event= (sim/game.js).
(function (HL) {
  var S = HL.save = {};
  var D = HL.data, T = HL.T, U = HL.util;

  T.def('Trh', 'startMoney', 30, 0, 100000, 5, 'Peniaze na začiatku kariéry (€)');

  // Verzia FORMÁTU (pole v). v2 (2026-10-04, jadrové jazero): staršia verzia hry (v1) v2 uloženie ODMIETNE
  // („z novšej verzie", titulka, nič neprepíše, kópia .bad) — inak by ho „opravila" a zmazala, čo nepozná: budovy,
  // výbavu, ryby a legendu jazera (zmerané na ZIP pre CrazyGames z 30. 9.: 13–21 položiek, s v2 nula). Pravidlo:
  // pribudnú id, ktoré by staršia verzia pri oprave zmazala → zvýš VERSION (migrate dostane krok). Kľúč ostáva.
  S.VERSION = 2;
  S.KEY = 'hlbina.save.v1';
  S.SETTINGS_KEY = 'hlbina.settings.v1';
  S.storage = null;
  S.lastError = null;

  var INF = '__HL_Infinity__', NINF = '__HL_-Infinity__', NAN = '__HL_NaN__';

  var idx = null;
  function I() {
    if (!idx) {
      idx = {
        b: U.byId(D.buildings), fish: U.byId(D.allFish), legend: U.byId(D.allLegends),
        line: U.byId(D.lines), rod: U.byId(D.rods), hook: U.byId(D.hooks),
        lakeLine: U.byId(D.lakeLines), lakeRod: U.byId(D.lakeRods),
        bait: U.byId(D.baits.filter(function (b) { return !b.infinite; })),
        event: U.byId(D.events),
      };
    }
    return idx;
  }
  function isObj(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
  function isInt(v) { return typeof v === 'number' && Number.isInteger(v); }
  function known(id) { return !!(I().fish[id] || I().legend[id]); }
  function gearKnown(id) { return !!(I().line[id] || I().rod[id] || I().hook[id] || I().lakeLine[id] || I().lakeRod[id]); }
  // Jazerná výbava (docs/JAZERO.md): null = ešte žiadna; inak známe id, ktoré hráč vlastní.
  var LAKE_GEAR = ['lakeLine', 'lakeRod'];
  function lakeGearOk(g, k) { return g[k] == null || (!!I()[k][g[k]] && Array.isArray(g.owned) && g.owned.indexOf(g[k]) >= 0); }

  // Predvolený save bez trhu (ten doplní HL.market.ensure).
  function template(seed) {
    var b = {};
    D.buildings.forEach(function (x) { b[x.id] = x.start; });
    var baits = {};
    D.baits.forEach(function (x) { if (!x.infinite) baits[x.id] = 0; });
    var line = D.lines[0].id, rod = D.rods[0].id, hook = D.hooks[0].id;
    return {
      v: S.VERSION, seed: seed >>> 0,
      // Revízia zápisu (nález #30): rastie pri každom HL.game.persist, aj cez novú kariéru. Karta,
      // ktorá v úložisku nájde vyššiu rev, než akú pozná, vie, že inde beží novší stav.
      rev: 0,
      money: T.startMoney,
      clock: D.START_MINUTE,
      buildings: b,
      // lakeLine / lakeRod = výbava jadrového jazera z Laboratória (null, kým ju hráč nekúpi).
      gear: { line: line, rod: rod, hook: hook, owned: [line, rod, hook], harpoons: 0, lakeLine: null, lakeRod: null },
      baits: baits,
      storage: [],
      market: { demand: {}, hot: {}, day: Math.floor(D.START_MINUTE / 1440), history: [], orders: [] },
      encyclopedia: {},
      legends: {},
      quests: { active: [], done: 0, nextId: 1 },
      tavern: { goldDay: -1, tipDay: -1 },
      // deepest = najhlbší ponor v MORI (Krčma a súťaž podľa neho vyberajú pásma), deepestLake = v jazere.
      stats: { dives: 0, snaps: 0, earned: 0, deepest: 0, deepestLake: 0, caught: 0, fights: 0, biggest: null },
      tutorial: { seen: {} },
      endless: { best: [] },
      flags: { ending: false },
      // Letná súťaž (nález #36): najlepší úlovok hráča v súťažný deň; výhra sa vyplatí na prelome dňa.
      contest: { day: -1, targetKg: 0, targetId: null, bestKg: 0, bestId: null, won: false, prize: 0, paid: false },
    };
  }

  S.fresh = function (seed) {
    var s = template(seed);
    if (HL.market && HL.market.ensure) HL.market.ensure(s);
    return s;
  };

  // ------------------------------------------------------------------ JSON
  S.serialize = function (save) {
    return JSON.stringify(save, function (k, v) {
      if (typeof v === 'number' && !isFinite(v)) return v !== v ? NAN : v > 0 ? INF : NINF;
      return v;
    });
  };

  function revive(k, v) {
    if (v === INF) return Infinity;
    if (v === NINF) return -Infinity;
    if (v === NAN) return NaN;
    return v;
  }

  // Doplní chýbajúce kľúče z predvolených (rekurzívne cez obyčajné objekty). Nič neprepíše:
  // zlý typ nechá tak, aby ho validate() nahlásil a nie potichu zamietol.
  function fill(target, def) {
    for (var k in def) {
      if (!Object.prototype.hasOwnProperty.call(def, k)) continue;
      if (target[k] === undefined) target[k] = U.deepCopy(def[k] === undefined ? null : def[k]);
      else if (isObj(def[k]) && isObj(target[k])) fill(target[k], def[k]);
    }
    return target;
  }

  function migrate(o) {
    // v1 → v2: formát je rovnaký, v2 len značí „môže obsahovať jazero" (S.VERSION vyššie).
    if (o.v === 1) o.v = 2;
    // stats.fights (2026-09-27, boje nováčika) v staršom save chýba: každá chytená ryba bola boj, takže
    // caught je dolný odhad. Nula by skúsenému hráčovi znova zapla úľavu nováčika (fill by dal 0).
    if (isObj(o.stats) && o.stats.fights === undefined && typeof o.stats.caught === 'number' && o.stats.caught >= 0) {
      o.stats.fights = Math.floor(o.stats.caught);
    }
    return o;
  }

  S.deserialize = function (str) {
    if (typeof str !== 'string') throw new Error('Uloženie nie je text');
    var o = JSON.parse(str, revive);
    if (!isObj(o)) throw new Error('Uloženie nie je objekt');
    if (!isInt(o.v) || o.v < 1) throw new Error('Uloženie nemá platnú verziu');
    if (o.v > S.VERSION) throw new Error('Uloženie je z novšej verzie hry (v' + o.v + ')');
    if (!(typeof o.seed === 'number' && isFinite(o.seed))) throw new Error('Uloženie nemá semeno');
    o = migrate(o);
    return fill(o, template(o.seed));
  };

  // ------------------------------------------------------------------ kontrola
  S.validate = function (save) {
    var P = [];
    function bad(path, msg) { P.push(path + ': ' + msg); }
    function num(path, v, min, int) {
      if (typeof v !== 'number' || v !== v) bad(path, 'nie je číslo');
      else if (!isFinite(v)) bad(path, 'nekonečno');
      else if (v < min) bad(path, 'menej ako ' + min);
      else if (int && !isInt(v)) bad(path, 'nie je celé číslo');
    }
    // Hľadá NaN kdekoľvek — aj v poliach, ktoré nižšie konkrétne nekontrolujeme.
    (function walk(v, path, depth) {
      if (depth > 12) return;
      if (typeof v === 'number' && v !== v) { bad(path, 'NaN'); return; }
      if (v && typeof v === 'object') for (var k in v) if (Object.prototype.hasOwnProperty.call(v, k)) walk(v[k], path + '.' + k, depth + 1);
    })(save, 'save', 0);
    if (!isObj(save)) return P.length ? P : ['save: nie je objekt']; // i18n-ok: správa pre vývojára

    if (save.v !== S.VERSION) bad('v', 'neznáma verzia ' + save.v);
    if (!(isInt(save.seed) && save.seed >= 0 && save.seed <= 0xffffffff)) bad('seed', 'nie je uint32');
    if (!(isInt(save.rev) && save.rev >= 0)) bad('rev', 'nie je celé číslo ≥ 0');
    if (save.money === save.money) num('money', save.money, 0);
    if (save.clock === save.clock) num('clock', save.clock, 0);

    var b = save.buildings;
    if (!isObj(b)) bad('buildings', 'chýba');
    else {
      for (var bk in b) {
        if (!I().b[bk]) bad('buildings.' + bk, 'neznáma budova');
        else if (!(isInt(b[bk]) && b[bk] >= 0 && b[bk] <= 3)) bad('buildings.' + bk, 'úroveň mimo 0..3');
      }
      D.buildings.forEach(function (x) { if (!(x.id in b)) bad('buildings.' + x.id, 'chýba'); });
    }

    var g = save.gear;
    if (!isObj(g)) bad('gear', 'chýba');
    else {
      if (!I().line[g.line]) bad('gear.line', 'neznámy vlasec ' + g.line);
      if (!I().rod[g.rod]) bad('gear.rod', 'neznámy prút ' + g.rod);
      if (!I().hook[g.hook]) bad('gear.hook', 'neznámy háčik ' + g.hook);
      if (!Array.isArray(g.owned)) bad('gear.owned', 'nie je zoznam');
      else {
        g.owned.forEach(function (id, i) { if (!gearKnown(id)) bad('gear.owned[' + i + ']', 'neznáme id ' + id); });
        ['line', 'rod', 'hook'].forEach(function (k) { if (g.owned.indexOf(g[k]) < 0) bad('gear.' + k, 'nasadené, ale nevlastnené'); });
      }
      LAKE_GEAR.forEach(function (k) { if (!lakeGearOk(g, k)) bad('gear.' + k, 'neznáma alebo nevlastnená jazerná výbava ' + g[k]); });
      if (g.harpoons === g.harpoons) num('gear.harpoons', g.harpoons, 0, true);
      if (g.harpoons > D.harpoon.maxCarry) bad('gear.harpoons', 'viac ako ' + D.harpoon.maxCarry);
    }

    if (!isObj(save.baits)) bad('baits', 'chýba');
    else for (var bt in save.baits) {
      if (!I().bait[bt]) bad('baits.' + bt, 'neznáma návnada');
      else if (save.baits[bt] === save.baits[bt]) num('baits.' + bt, save.baits[bt], 0, true);
    }

    if (!Array.isArray(save.storage)) bad('storage', 'nie je zoznam');
    else save.storage.forEach(function (it, i) {
      if (!isObj(it) || !known(it.id)) bad('storage[' + i + ']', 'neznámy druh ' + (it && it.id));
      else if (!(typeof it.w === 'number' && isFinite(it.w) && it.w > 0)) bad('storage[' + i + '].w', 'váha nie je kladné číslo');
    });

    var m = save.market;
    if (!isObj(m)) bad('market', 'chýba');
    else {
      if (!isObj(m.demand)) bad('market.demand', 'chýba');
      else for (var dk in m.demand) {
        if (!I().fish[dk]) bad('market.demand.' + dk, 'neznámy druh');
        else if (!(m.demand[dk] > 0 && m.demand[dk] <= 1)) bad('market.demand.' + dk, 'mimo (0, 1]');
      }
      if (!isObj(m.hot)) bad('market.hot', 'chýba');
      else for (var hk in m.hot) {
        if (!I().fish[hk]) bad('market.hot.' + hk, 'neznámy druh');
        else if (!(m.hot[hk] >= 1 && isFinite(m.hot[hk]))) bad('market.hot.' + hk, 'násobok < 1');
      }
      if (m.day === m.day) num('market.day', m.day, 0, true);
      if (!Array.isArray(m.history)) bad('market.history', 'nie je zoznam');
      if (!Array.isArray(m.orders)) bad('market.orders', 'nie je zoznam');
      else m.orders.forEach(function (o, i) { if (!isObj(o) || !I().fish[o.fishId]) bad('market.orders[' + i + ']', 'neznámy druh'); });
    }

    if (!isObj(save.encyclopedia)) bad('encyclopedia', 'chýba');
    else for (var ek in save.encyclopedia) {
      var e = save.encyclopedia[ek];
      if (!known(ek)) bad('encyclopedia.' + ek, 'neznámy druh');
      else if (!isObj(e)) bad('encyclopedia.' + ek, 'nie je záznam');
      else {
        if (e.n === e.n) num('encyclopedia.' + ek + '.n', e.n, 0, true);
        if (e.maxW === e.maxW) num('encyclopedia.' + ek + '.maxW', e.maxW, 0);
        if (e.firstDay === e.firstDay) num('encyclopedia.' + ek + '.firstDay', e.firstDay, 0, true);
      }
    }

    if (!isObj(save.legends)) bad('legends', 'chýba');
    else for (var lk in save.legends) if (!I().legend[lk]) bad('legends.' + lk, 'neznáma legenda');

    var q = save.quests;
    if (!isObj(q) || !Array.isArray(q.active)) bad('quests', 'chýba zoznam úloh');
    else {
      if (q.done === q.done) num('quests.done', q.done, 0, true);
      if (q.nextId === q.nextId) num('quests.nextId', q.nextId, 1, true);
      q.active.forEach(function (x, i) {
        if (!isObj(x) || ['catch', 'depth', 'value', 'count'].indexOf(x.kind) < 0) bad('quests.active[' + i + ']', 'neznámy druh úlohy');
        else if (x.kind === 'catch' && !I().fish[x.fishId]) bad('quests.active[' + i + '].fishId', 'neznámy druh ' + x.fishId);
      });
    }

    if (!isObj(save.tavern)) bad('tavern', 'chýba');
    else {
      if (save.tavern.goldDay === save.tavern.goldDay) num('tavern.goldDay', save.tavern.goldDay, -1, true);
      if (save.tavern.tipDay === save.tavern.tipDay) num('tavern.tipDay', save.tavern.tipDay, -1, true);
    }

    var st = save.stats;
    if (!isObj(st)) bad('stats', 'chýba');
    else {
      ['dives', 'snaps', 'caught', 'fights'].forEach(function (k) { if (st[k] === st[k]) num('stats.' + k, st[k], 0, true); });
      ['earned', 'deepest', 'deepestLake'].forEach(function (k) { if (st[k] === st[k]) num('stats.' + k, st[k], 0); });
      if (st.biggest !== null && !(isObj(st.biggest) && known(st.biggest.id) && st.biggest.w > 0)) bad('stats.biggest', 'neplatný rekord');
    }

    if (!isObj(save.tutorial) || !isObj(save.tutorial.seen)) bad('tutorial.seen', 'chýba');
    if (!isObj(save.endless) || !Array.isArray(save.endless.best)) bad('endless.best', 'chýba');
    else {
      if (save.endless.best.length > 10) bad('endless.best', 'viac ako 10 záznamov');
      save.endless.best.forEach(function (x, i) {
        if (!isObj(x) || !(x.depth >= 0) || !(x.value >= 0)) bad('endless.best[' + i + ']', 'neplatný záznam');
      });
    }
    if (!isObj(save.flags)) bad('flags', 'chýba');
    var c = save.contest;
    if (!isObj(c)) bad('contest', 'chýba');
    else {
      if (c.day === c.day) num('contest.day', c.day, -1, true);
      if (c.bestKg === c.bestKg) num('contest.bestKg', c.bestKg, 0);
      if (c.prize === c.prize) num('contest.prize', c.prize, 0);
    }
    return P;
  };

  // ------------------------------------------------------------------ oprava
  S.repair = function (save) {
    var fixes = [];
    var def = template(save && typeof save.seed === 'number' && isFinite(save.seed) ? save.seed : 0);
    function fix(path, what) { fixes.push(path + ': ' + what); }
    function okNum(v, min, int) { return typeof v === 'number' && isFinite(v) && v >= min && (!int || isInt(v)); }
    function fixObj(k) { if (!isObj(save[k])) { save[k] = U.deepCopy(def[k]); fix(k, 'obnovené'); } }

    if (!isObj(save)) throw new Error('repair: save nie je objekt');
    if (save.v !== S.VERSION) { save.v = S.VERSION; fix('v', S.VERSION); }
    if (!(isInt(save.seed) && save.seed >= 0 && save.seed <= 0xffffffff)) { save.seed = (Number(save.seed) || 0) >>> 0; fix('seed', save.seed); }
    if (!(isInt(save.rev) && save.rev >= 0)) { save.rev = okNum(save.rev, 0) ? Math.floor(save.rev) : 0; fix('rev', save.rev); }
    if (!okNum(save.money, 0)) { save.money = 0; fix('money', '0'); }
    if (!okNum(save.clock, 0)) { save.clock = def.clock; fix('clock', def.clock); }

    fixObj('buildings');
    for (var bk in save.buildings) if (!I().b[bk]) { delete save.buildings[bk]; fix('buildings.' + bk, 'zmazané'); }
    D.buildings.forEach(function (x) {
      var v = save.buildings[x.id];
      if (!(isInt(v) && v >= 0 && v <= 3)) { save.buildings[x.id] = isInt(v) ? U.clamp(v, 0, 3) : x.start; fix('buildings.' + x.id, save.buildings[x.id]); }
    });

    fixObj('gear');
    var g = save.gear;
    if (!Array.isArray(g.owned)) { g.owned = def.gear.owned.slice(); fix('gear.owned', 'obnovené'); }
    g.owned = g.owned.filter(function (id) { return gearKnown(id); });
    def.gear.owned.forEach(function (id) { if (g.owned.indexOf(id) < 0) g.owned.push(id); });
    ['line', 'rod', 'hook'].forEach(function (k) {
      if (!I()[k][g[k]] || g.owned.indexOf(g[k]) < 0) { g[k] = def.gear[k]; fix('gear.' + k, g[k]); }
    });
    LAKE_GEAR.forEach(function (k) { if (!lakeGearOk(g, k)) { g[k] = null; fix('gear.' + k, 'null'); } else if (g[k] === undefined) g[k] = null; });
    if (!okNum(g.harpoons, 0, true) || g.harpoons > D.harpoon.maxCarry) {
      g.harpoons = okNum(g.harpoons, 0) ? Math.min(D.harpoon.maxCarry, Math.floor(g.harpoons)) : 0; fix('gear.harpoons', g.harpoons);
    }

    fixObj('baits');
    for (var bt in save.baits) if (!I().bait[bt]) { delete save.baits[bt]; fix('baits.' + bt, 'zmazané'); }
    for (var bd in def.baits) if (!okNum(save.baits[bd], 0, true)) { save.baits[bd] = okNum(save.baits[bd], 0) ? Math.floor(save.baits[bd]) : 0; fix('baits.' + bd, save.baits[bd]); }

    if (!Array.isArray(save.storage)) { save.storage = []; fix('storage', 'obnovené'); }
    var sn = save.storage.length;
    save.storage = save.storage.filter(function (it) { return isObj(it) && known(it.id) && typeof it.w === 'number' && isFinite(it.w) && it.w > 0; });
    if (save.storage.length !== sn) fix('storage', 'zmazaných ' + (sn - save.storage.length));

    fixObj('market');
    var m = save.market;
    if (!isObj(m.demand)) m.demand = {};
    for (var dk in m.demand) if (!I().fish[dk] || !(m.demand[dk] > 0 && m.demand[dk] <= 1)) { delete m.demand[dk]; fix('market.demand.' + dk, 'zmazané'); }
    if (!isObj(m.hot)) m.hot = {};
    for (var hk in m.hot) if (!I().fish[hk] || !(m.hot[hk] >= 1 && isFinite(m.hot[hk]))) { delete m.hot[hk]; fix('market.hot.' + hk, 'zmazané'); }
    if (!okNum(m.day, 0, true)) { m.day = Math.floor(save.clock / 1440); fix('market.day', m.day); }
    if (!Array.isArray(m.history)) m.history = [];
    if (!Array.isArray(m.orders)) m.orders = [];
    m.orders = m.orders.filter(function (o) { return isObj(o) && I().fish[o.fishId]; });

    fixObj('encyclopedia');
    for (var ek in save.encyclopedia) {
      var e = save.encyclopedia[ek];
      if (!known(ek) || !isObj(e)) { delete save.encyclopedia[ek]; fix('encyclopedia.' + ek, 'zmazané'); continue; }
      if (!okNum(e.n, 0, true)) { e.n = 1; fix('encyclopedia.' + ek + '.n', 1); }
      if (!okNum(e.maxW, 0)) { e.maxW = 0; fix('encyclopedia.' + ek + '.maxW', 0); }
      if (!okNum(e.firstDay, 0, true)) { e.firstDay = 0; fix('encyclopedia.' + ek + '.firstDay', 0); }
    }

    fixObj('legends');
    for (var lk in save.legends) if (!I().legend[lk]) { delete save.legends[lk]; fix('legends.' + lk, 'zmazané'); }

    fixObj('quests');
    var q = save.quests;
    if (!Array.isArray(q.active)) q.active = [];
    q.active = q.active.filter(function (x) {
      return isObj(x) && ['catch', 'depth', 'value', 'count'].indexOf(x.kind) >= 0 && (x.kind !== 'catch' || I().fish[x.fishId]);
    });
    if (!okNum(q.done, 0, true)) q.done = 0;
    if (!okNum(q.nextId, 1, true)) q.nextId = 1 + q.done + q.active.length;

    fixObj('tavern');
    ['goldDay', 'tipDay'].forEach(function (k) { if (!okNum(save.tavern[k], -1, true)) save.tavern[k] = -1; });

    fixObj('stats');
    var st = save.stats;
    ['dives', 'snaps', 'caught', 'fights'].forEach(function (k) { if (!okNum(st[k], 0, true)) { st[k] = 0; fix('stats.' + k, 0); } });
    ['earned', 'deepest', 'deepestLake'].forEach(function (k) { if (!okNum(st[k], 0)) { st[k] = 0; fix('stats.' + k, 0); } });
    if (st.biggest !== null && !(isObj(st.biggest) && known(st.biggest.id) && st.biggest.w > 0)) { st.biggest = null; fix('stats.biggest', 'null'); }

    if (!isObj(save.tutorial) || !isObj(save.tutorial.seen)) { save.tutorial = { seen: {} }; fix('tutorial', 'obnovené'); }
    if (!isObj(save.endless) || !Array.isArray(save.endless.best)) { save.endless = { best: [] }; fix('endless', 'obnovené'); }
    save.endless.best = save.endless.best.filter(function (x) { return isObj(x) && x.depth >= 0 && x.value >= 0; }).slice(0, 10);
    fixObj('flags');
    fixObj('contest');
    var ct = save.contest;
    if (!okNum(ct.day, -1, true) || !okNum(ct.bestKg, 0) || !okNum(ct.prize, 0)) { save.contest = U.deepCopy(def.contest); fix('contest', 'obnovené'); }

    // NaN v poliach, ktoré nemajú vlastnú opravu (napr. história trhu): preč s nimi.
    (function walk(v, depth) {
      if (!v || typeof v !== 'object' || depth > 12) return;
      for (var k in v) {
        if (!Object.prototype.hasOwnProperty.call(v, k)) continue;
        if (typeof v[k] === 'number' && v[k] !== v[k]) { v[k] = 0; fix('NaN', k); } else walk(v[k], depth + 1);
      }
    })(save, 0);
    return fixes;
  };

  // ------------------------------------------------------------------ úložisko
  function pick(storage) { return storage === undefined ? S.storage : storage; }

  // Chyba úložiska: úvodná veta pre hráča (tabuľka jazyka) + technická príčina v lastErrorDetail
  // (správa prehliadača / zoznam problémov validate — pre hlásenie chyby, neprekladá sa).
  function fail(key, detail) {
    S.lastErrorDetail = String(detail);
    S.lastError = HL.i18n.t(key, { detail: S.lastErrorDetail });
  }
  function msg(e) { return (e && e.message) || e; }
  S.lastErrorDetail = null;

  S.store = function (save, storage) {
    storage = pick(storage);
    if (!storage) return false;
    var p = S.validate(save);
    if (p.length) { fail('sim.save.corrupt', p.slice(0, 3).join('; ')); return false; }
    try {
      storage.setItem(S.KEY, S.serialize(save));
      S.lastError = null; S.lastErrorDetail = null;
      return true;
    } catch (e) {
      fail('sim.save.writeFailed', msg(e));
      return false;
    }
  };

  S.raw = function (storage) {
    storage = pick(storage);
    if (!storage) return null;
    try { return storage.getItem(S.KEY); } catch (e) { fail('sim.save.unavailable', msg(e)); return null; }
  };

  // Revízia uloženého stavu bez plného načítania (nález #30): -1 = nič uložené, null = nedá sa
  // prečítať (poškodené alebo zakázané úložisko — nevieme), inak save.rev (starší save bez rev = 0).
  S.peekRev = function (storage) {
    storage = pick(storage);
    if (!storage) return -1;
    var raw;
    try { raw = storage.getItem(S.KEY); } catch (e) { return null; }
    if (raw == null) return -1;
    try {
      var o = JSON.parse(raw);
      if (!isObj(o)) return null;
      return isInt(o.rev) && o.rev >= 0 ? o.rev : 0;
    } catch (e) { return null; }
  };

  S.loadFrom = function (storage) {
    var raw = S.raw(storage);
    if (raw == null) return null;
    try { return S.deserialize(raw); } catch (e) {
      fail('sim.save.loadFailed', msg(e));
      return null;
    }
  };

  // ------------------------------------------------------------------ nastavenia
  // pixelPerfect: na CrazyGames predvolene VYPNUTÉ (majiteľ 2026-10-04: „Vyplniť okno"). Ich okno na počítači je
  // 821×462 až 1216×684 (docs.crazygames.com/requirements/gameplay, čitateľnosť pri DPR 1): celé zväčšenie by tam bolo
  // 1× a písmo 5–7 px; vyplnenie dá ~1,4–1,9×. Hráč si ostré pixely zapne v Nastaveniach (uloží sa jeho voľba).
  S.defaultSettings = function () {
    var cg = !!(HL.platform && HL.platform.name === 'crazygames');
    return { musicVol: 0.6, sfxVol: 0.8, vibration: true, latencyMs: 0, shake: true, pixelPerfect: !cg, event: 'auto' };
  };

  S.sanitizeSettings = function (o) {
    var d = S.defaultSettings();
    if (!isObj(o)) return d;
    function vol(v, dv) { return typeof v === 'number' && isFinite(v) ? U.clamp(v, 0, 1) : dv; }
    function bool(v, dv) { return typeof v === 'boolean' ? v : dv; }
    d.musicVol = vol(o.musicVol, d.musicVol);
    d.sfxVol = vol(o.sfxVol, d.sfxVol);
    d.vibration = bool(o.vibration, d.vibration);
    d.latencyMs = typeof o.latencyMs === 'number' && isFinite(o.latencyMs) ? Math.round(U.clamp(o.latencyMs, -500, 500)) : d.latencyMs;
    d.shake = bool(o.shake, d.shake);
    d.pixelPerfect = bool(o.pixelPerfect, d.pixelPerfect);
    // Hráčske nastavenie udalosti je len 'auto' (podľa kalendára) alebo 'none' (vypnuté). Ľubovoľná
    // sezóna by zdvojnásobila ceny a pustila sezónne legendy celý rok (nález #4/#21/#35); na ladenie
    // slúži ?event= v URL. Sezóna uložená staršou verziou sa zmení na 'auto'.
    d.event = o.event === 'none' ? 'none' : 'auto';
    // Jazyk (docs/I18N.md): len kód z HL.i18n.LANGS. Chýbajúci/neznámy = pole chýba a sim/game.js ho
    // doplní z prehliadača (HL.i18n.detect) — predvolené nastavenia ho preto nemajú.
    if (typeof o.lang === 'string' && HL.i18n && HL.i18n.info(o.lang)) d.lang = o.lang;
    return d;
  };

  S.loadSettings = function (storage) {
    storage = pick(storage);
    if (!storage) return S.defaultSettings();
    try {
      var raw = storage.getItem(S.SETTINGS_KEY);
      return raw == null ? S.defaultSettings() : S.sanitizeSettings(JSON.parse(raw));
    } catch (e) {
      fail('sim.save.settingsLoad', msg(e));
      return S.defaultSettings();
    }
  };

  S.storeSettings = function (settings, storage) {
    storage = pick(storage);
    if (!storage) return false;
    try { storage.setItem(S.SETTINGS_KEY, JSON.stringify(S.sanitizeSettings(settings))); return true; } catch (e) {
      fail('sim.save.settingsStore', msg(e));
      return false;
    }
  };
})(globalThis.HL);
