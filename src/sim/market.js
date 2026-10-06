// Živý trh (dizajn 10.1). Stav žije v save.market, tu sú len pravidlá.
//
// Cena kusu = základná × (w / typická váha) × dopyt × horúci × počasie × udalosť × T.priceScale
//   dopyt:   1,0 na začiatku; predaný kus −T.demandDrop (najmenej T.demandMin);
//            každý nový deň +T.demandRecover smerom k 1,0. Obe zmeny sú ADITÍVNE v bodoch
//            základu (dokument: "zníži dopyt o 5 %" ceny, nie 5 % z už zníženej) — podlaha 0,4
//            sa tak dosiahne po 12 kusoch jedného druhu, čo je citeľné, ale nie trestajúce.
//            Dopyt sa zaokrúhľuje na 6 miest, aby 30 dní naraz a 30× po dni dalo TO ISTÉ číslo.
//   horúci:  každý nový deň 1–2 druhy × T.hotMin..T.hotMax z HL.rngFor(seed, 'hot', deň).
//            Nie počas intra, nie legendy, sezónne druhy len počas svojej udalosti.
//   počasie: búrka +T.stormPriceBonus (menej rybárov na mori).
//   udalosť: HL.data.events[].priceMult[id].
//   Legendy majú pevnú cenu × T.priceScale — žiadny dopyt, horúci ani počasie.
// Ceny sú zaokrúhlené na centy; displej ich zaokrúhli na celé eurá (HL.util.money). Celé
// eurá by pri sardinke (2 €) zlikvidovali klesanie ceny po kusoch.
//
// História: pri každom novom dni sa zapíše "kurz" typického kusu každého bežného druhu
// (bez počasia — búrka je chvíľková a graf Trhoviska má ukazovať trh, nie oblohu).
// Drží sa posledných HISTORY_DAYS dní. trend() porovnáva živý kurz so včerajším záznamom,
// takže po dnešnom predaji ukáže šípku dolu.
//
// Objednávky obchodníkov (Trhovisko L3): 1 za deň z HL.rngFor(seed, 'order', deň) — druh,
// ktorý už hráč chytil, 2–4 kusy, bonus × T.orderBonusMin..Max na tie kusy, platí
// T.orderDays dní. Zámerne NEZÁVISÍ od iných objednávok (ani vylúčením duplicít): vďaka
// tomu je deň čistou funkciou (semeno, deň, encyklopédia) a advanceDays môže preskočiť
// stovky dní bez toho, aby sa výsledok líšil od krokovania po dni.
//
// preview(save, items, env, {noOrders}) = M.sell nad tieňovou kópiou (nič nemení); neutralPrice(item)
// = cena bez živého trhu pre Nekonečnú hlbinu.
//
// Ryby jadrového jazera (docs/JAZERO.md) majú cenu, dopyt aj históriu ako morské, ale horúci dopyt a
// objednávky obchodníkov sa losujú len z rýb mora — prúdy 'hot' a 'order' mora sa tak nezmenili.
//
// Predaný kus dostane neviditeľný príznak sold (Object.defineProperty, neserializuje sa):
// ten istý objekt sa druhý raz nepredá ani neuloží do Chatrče (village.store) — výsledok
// ponoru môže UI predať aj uložiť bez rizika, že peniaze pripíše dvakrát.
(function (HL) {
  var M = HL.market = {};
  var D = HL.data, T = HL.T, U = HL.util;

  T.def('Trh', 'orderBonusMin', 1.5, 1, 4, 0.05, 'Objednávka obchodníka: bonus najmenej ×');
  T.def('Trh', 'orderBonusMax', 2.2, 1, 5, 0.05, 'Objednávka obchodníka: bonus najviac ×');
  T.def('Trh', 'orderDays', 2, 1, 7, 1, 'Objednávka obchodníka platí (dní)');

  var HISTORY_DAYS = 4;
  // Krokovať treba aspoň toľko posledných dní, koľko siaha pamäť trhu (história 4 dni,
  // objednávka najviac 7 dní). Staršie dni by aj tak zmizli; z nich prežije len dopyt,
  // ktorý sa vracia lineárne, a ten sa dá dopočítať naraz.
  var FULL_DAYS = 8;

  var idx = null;
  function I() {
    if (!idx) idx = { fish: U.byId(D.allFish), legend: U.byId(D.allLegends), event: U.byId(D.events) };
    return idx;
  }
  function r2(v) { return Math.round(v * 100) / 100; }
  function r6(v) { return Math.round(v * 1e6) / 1e6; }
  function today(save) { return HL.world.day(save.clock); }
  function intro(save) { return !!(save.stats && save.stats.dives < T.introDives); }
  function eventOk(f) { return !f.event || f.event === HL.world.currentEvent; }

  M.ensure = function (save) {
    var m = save.market;
    if (!m || typeof m !== 'object') m = save.market = {};
    if (!m.demand || typeof m.demand !== 'object') m.demand = {};
    if (!m.hot || typeof m.hot !== 'object') m.hot = {};
    if (!U.isNum(m.day)) m.day = today(save);
    if (!Array.isArray(m.history)) m.history = [];
    if (!Array.isArray(m.orders)) m.orders = [];
    if (!m.history.length) m.history.push(record(save, m.day));
    return m;
  };

  M.demand = function (save, id) {
    var d = save.market && save.market.demand ? save.market.demand[id] : undefined;
    return U.isNum(d) ? d : 1;
  };

  function eventMult(id, eventId) {
    var e = eventId ? I().event[eventId] : null;
    return e && e.priceMult && e.priceMult[id] ? e.priceMult[id] : 1;
  }

  // Kurz typického kusu bez počasia (pre históriu a trend).
  M.quote = function (save, id) {
    var f = I().fish[id];
    if (!f) { var l = I().legend[id]; return l ? r2(l.price * T.priceScale) : 0; }
    var hot = save.market && save.market.hot && save.market.hot[id] ? save.market.hot[id] : 1;
    return r2(f.price * M.demand(save, id) * hot * eventMult(id, HL.world.currentEvent) * T.priceScale);
  };

  M.price = function (save, item, env) {
    env = env || HL.world.env(save);
    var l = I().legend[item.id];
    if (l) return r2(l.price * T.priceScale);
    var f = I().fish[item.id];
    HL.assert(f, 'neznámy druh na trhu: ' + item.id);
    var w = U.isNum(item.w) && item.w > 0 ? item.w : f.weight;
    var hot = save.market && save.market.hot && save.market.hot[item.id] ? save.market.hot[item.id] : 1;
    var weather = env.weather === 'storm' ? 1 + T.stormPriceBonus : 1;
    return r2(f.price * (w / f.weight) * M.demand(save, item.id) * hot * weather * eventMult(item.id, env.event) * T.priceScale);
  };

  function activeOrder(save, fishId, day) {
    var os = save.market.orders;
    for (var i = 0; i < os.length; i++) {
      var o = os[i];
      if (o.fishId === fishId && o.untilDay >= day && o.got < o.count) return o;
    }
    return null;
  }

  M.sell = function (save, items, env) {
    env = env || HL.world.env(save);
    M.ensure(save);
    var lines = [], total = 0, day = env.day;
    for (var i = 0; i < (items || []).length; i++) {
      var it = items[i];
      if (!it || it.sold) continue;
      var line = { id: it.id, w: it.w, price: M.price(save, it, env) };
      if (I().fish[it.id]) {
        var o = activeOrder(save, it.id, day);
        if (o) { line.price = r2(line.price * o.bonus); line.order = o.id; o.got++; }
        var dm = save.market.demand;
        var nd = r6(Math.max(T.demandMin, M.demand(save, it.id) - T.demandDrop));
        if (nd >= 1) delete dm[it.id]; else dm[it.id] = nd;
      }
      total += line.price;
      lines.push(line);
      if (typeof it === 'object') Object.defineProperty(it, 'sold', { value: true, enumerable: false, configurable: true, writable: true });
    }
    // Predaný kus z Chatrče zmizne hneď tu (na mieste — UI môže držať odkaz na pole),
    // inak by sa uložil do save a po načítaní sa dal predať znova.
    if (Array.isArray(save.storage)) {
      for (var s = save.storage.length - 1; s >= 0; s--) if (save.storage[s] && save.storage[s].sold) save.storage.splice(s, 1);
    }
    total = r2(total);
    save.money = r2(save.money + total);
    save.stats.earned = r2((save.stats.earned || 0) + total);
    return { total: total, lines: lines };
  };

  // "Koľko by som za tieto kusy dostal TERAZ" — skutočný M.sell nad tieňovou kópiou trhu: ten istý
  // vzorec, pokles dopytu po kusoch, objednávky aj zaokrúhlenie, ale save, kusy ani Chatrč sa
  // nezmenia. Súčet nezávislých cien (každý kus pri dopyte pred predajom) nadhodnocoval úlovok
  // (nález #27). opts.noOrders = trhová cena bez bonusu obchodníka. Už predané kusy preskočí.
  M.preview = function (save, items, env, opts) {
    env = env || HL.world.env(save);
    var m = save.market || {};
    var shadow = {
      seed: save.seed, clock: save.clock, buildings: save.buildings, encyclopedia: save.encyclopedia,
      stats: { earned: 0, dives: save.stats ? save.stats.dives : 0 }, money: 0, storage: null,
      market: {
        demand: Object.assign({}, m.demand), hot: m.hot || {}, day: m.day, history: (m.history || []).slice(),
        orders: opts && opts.noOrders ? [] : (m.orders || []).map(function (o) { return Object.assign({}, o); }),
      },
    };
    var copies = [];
    for (var i = 0; i < (items || []).length; i++) {
      var it = items[i];
      if (it && !it.sold) copies.push({ id: it.id, w: it.w });
    }
    return M.sell(shadow, copies, env);
  };

  // Cena bez živého trhu (Nekonečná hlbina, nález #5): základ × (w / typická váha) × T.priceScale,
  // legenda pevná cena × T.priceScale. Žiadny dopyt, horúci dopyt, počasie ani udalosť — skóre
  // rebríčka nesmie závisieť od toho, ako hráč obchoduje v kariére, ani od chvíle ocenenia.
  M.neutralPrice = function (item) {
    var l = I().legend[item.id];
    if (l) return r2(l.price * T.priceScale);
    var f = I().fish[item.id];
    HL.assert(f, 'neznámy druh: ' + item.id);
    var w = U.isNum(item.w) && item.w > 0 ? item.w : f.weight;
    return r2(f.price * (w / f.weight) * T.priceScale);
  };

  // ------------------------------------------------------------------ nový deň
  function record(save, day) {
    var prices = {};
    for (var i = 0; i < D.allFish.length; i++) prices[D.allFish[i].id] = M.quote(save, D.allFish[i].id);
    return { day: day, prices: prices };
  }

  function recover(m, amount) {
    for (var id in m.demand) {
      if (!Object.prototype.hasOwnProperty.call(m.demand, id)) continue;
      var v = r6(Math.min(1, m.demand[id] + amount));
      if (v >= 1) delete m.demand[id]; else m.demand[id] = v;
    }
  }

  function rollHot(save, day) {
    var hot = {};
    if (intro(save)) return hot;
    var cand = D.fish.filter(eventOk);
    if (!cand.length) return hot;
    var rng = HL.rngFor(save.seed, 'hot', day);
    var n = Math.min(cand.length, rng.int(1, 2));
    rng.shuffle(cand);
    var lo = Math.min(T.hotMin, T.hotMax), hi = Math.max(T.hotMin, T.hotMax);
    for (var i = 0; i < n; i++) hot[cand[i].id] = U.clamp(Math.round(rng.range(lo, hi) * 10) / 10, lo, hi);
    return hot;
  }

  function rollOrder(save, day) {
    var enc = save.encyclopedia || {};
    var cand = D.fish.filter(function (f) { return enc[f.id] && enc[f.id].n > 0 && eventOk(f); });
    if (!cand.length) return null;
    var rng = HL.rngFor(save.seed, 'order', day);
    var f = rng.pick(cand);
    var lo = Math.min(T.orderBonusMin, T.orderBonusMax), hi = Math.max(T.orderBonusMin, T.orderBonusMax);
    return {
      id: day, fishId: f.id, count: rng.int(2, 4), got: 0,
      bonus: U.clamp(r2(rng.range(lo, hi)), lo, hi),
      untilDay: day + Math.max(1, Math.round(T.orderDays)) - 1,
    };
  }

  function newDay(save, day) {
    var m = save.market;
    recover(m, T.demandRecover);
    m.orders = m.orders.filter(function (o) { return o.untilDay >= day && o.got < o.count; });
    m.hot = rollHot(save, day);
    if (((save.buildings && save.buildings.trhovisko) || 0) >= 3) {
      var o = rollOrder(save, day);
      if (o) m.orders.push(o);
    }
    m.history.push(record(save, day));
    if (m.history.length > HISTORY_DAYS) m.history.splice(0, m.history.length - HISTORY_DAYS);
  }

  // Vráti počet dní, ktoré prešli. Pri dlhej medzere (spánok cez stovky dní, poškodené
  // hodiny) sa dopyt dopočíta naraz a krokujú sa len posledné FULL_DAYS dni — výsledok je
  // rovnaký ako pri krokovaní po jednom (overuje market.test.js).
  M.advanceDays = function (save, toDay) {
    M.ensure(save);
    var m = save.market;
    toDay = Math.floor(toDay);
    if (!(toDay > m.day)) return 0;
    var total = toDay - m.day;
    var skip = total - FULL_DAYS;
    if (skip > 0) {
      recover(m, T.demandRecover * skip);
      m.day += skip;
      m.orders = m.orders.filter(function (o) { return o.untilDay >= m.day; });
    }
    while (m.day < toDay) {
      m.day++;
      newDay(save, m.day);
    }
    return total;
  };

  // ------------------------------------------------------------------ čítanie pre UI
  M.history = function (save, id) {
    var h = (save.market && save.market.history) || [], out = [];
    for (var i = 0; i < h.length; i++) if (U.isNum(h[i].prices[id])) out.push(h[i].prices[id]);
    return out;
  };

  M.trend = function (save, id) {
    var h = (save.market && save.market.history) || [];
    var y = null, d = today(save) - 1;
    for (var i = h.length - 1; i >= 0; i--) if (h[i].day === d) { y = h[i].prices[id]; break; }
    if (!U.isNum(y)) return 0;
    var now = M.quote(save, id), eps = Math.max(0.005, y * 0.001);
    return now > y + eps ? 1 : now < y - eps ? -1 : 0;
  };

  M.hot = function (save) {
    var h = (save.market && save.market.hot) || {}, out = [];
    for (var id in h) if (Object.prototype.hasOwnProperty.call(h, id)) out.push({ id: id, mult: h[id] });
    return out;
  };

  M.orders = function (save) {
    var d = today(save);
    return ((save.market && save.market.orders) || []).filter(function (o) { return o.untilDay >= d; });
  };
})(globalThis.HL);
