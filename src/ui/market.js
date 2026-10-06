// Trhovisko (dizajn 10.1 živý trh, 11 budova Trhovisko, 15.6 obrazovka Trh).
//
// Tri záložky: Predaj (ryby z Chatrče), Ceny (dnešné ceny, trend, horúci dopyt, graf od L2),
// Objednávky (obchodníci s bonusom, od L3). Ceny aj predaj počíta VÝHRADNE sim/market.js —
// scéna nič neprepočítava po svojom, aby číslo na tlačidle bolo presne to, čo príde na účet.
//
// Rozhodnutia:
// - Suma na tlačidle "Predať" je náhľad skutočného predaja: HL.market.sell nad KÓPIOU trhu
//   (dopyt, objednávky) a kópiami rýb. Každý predaný kus zníži dopyt, takže tretia sardinka
//   je lacnejšia než prvá — náhľad to vie, násobenie "počet × cena" by klamalo.
// - Riadok ukazuje cenu PRVÉHO kusu dnes a pod ňou, kam klesne posledný. Dizajn 10.1 chce,
//   aby hráč videl, že jeden druh sa donekonečna predávať neoplatí.
// - Hlavné tlačidlo "Predať všetko" je v spodnej lište vo VŠETKÝCH záložkách: je to hlavná
//   akcia trhu a musí byť stále pod palcom na tom istom mieste.
// - Záložka Objednávky sa dá otvoriť aj pod L3 — ukáže zámok a čo ju odomkne. Zakázané
//   tlačidlo by hráčovi nepovedalo prečo.
// - Harness: ?scene=market&demo=built posunie hodiny o 3 dni (skutočný trh: história, horúci
//   dopyt, objednávky) a naplní Chatrč reprezentatívnym úlovkom — inak by fotka trhu ukazovala
//   prázdnu Chatrč a jednodňový graf. Beží len raz za načítanie stránky a len z adresy.
// - Náhľad predaja je HL.market.preview (sim) — ten istý výpočet ako nadpis výsledku ponoru (#27).
// - Dvojklik (#29, trieda #18): po predaji druhu ostane jeho riadok T.marketHoldSec na mieste ako
//   vypnuté "Predané" s TÝM ISTÝM id tlačidla, takže ďalší druh sa pod kurzor neposunie a druhý
//   klik (aj pomalý, za poistkou widgetov 0,3 s — Windows berie dvojklik do 0,5 s) aj druhý Enter
//   trafia vypnuté tlačidlo. Rovnako Vylepšiť: po kúpe je chvíľu vypnuté a karta nezmizne.
// - Toast po vylepšení menuje úroveň, ktorú hráč PRÁVE kúpil (#26) — upgradeInfo po kúpe už
//   opisuje nasledujúcu (ešte zamknutú).
// - Vzhľad (vizuálny kritik): plné plochy namiesto šachovnice, vety bežným písmom (pravidlo
//   dopytu má vlastný riadok), tlačidlá Predať majú jeden ľavý okraj (spoločná šírka).
// - Preklad (docs/I18N.md): texty sú v src/data/lang/<kód>/market.js (kľúče ui.market.*), počítajú sa pri
//   kreslení (aj nápisy záložiek). Šírky záložiek sú pevné — preklad sa musí zmestiť (lang_check).
(function (HL) {
  function t(k, p) { return HL.i18n.t(k, p); }
  function tp(n, k, p) { return HL.i18n.plural(n, k, p); }
  var W = 180, H = 320, M = 6, BAR_Y = 284;
  HL.T.def('UI', 'marketHoldSec', 0.6, 0, 2, 0.05, 'Trhovisko: ako dlho po predaji druhu / vylepšení ostane riadok na mieste a tlačidlo vypnuté (s) — pomalý dvojklik nepredá ďalší druh');
  var TABS = [
    { id: 'sell', w: 48, key: 'Digit1' },
    { id: 'prices', w: 44, key: 'Digit2' },
    { id: 'orders', w: 76, key: 'Digit3' },
  ];
  function tabLabel(id) { return id === 'sell' ? t('ui.market.tab.sell') : id === 'prices' ? t('ui.market.tab.prices') : t('ui.market.tab.orders'); }
  var SELL_H = 36, PRICE_H = 26, GRAPH_H = 50, ORDER_H = 34;

  var UP_BW = 74;
  var st = { back: 'village', tab: 'sell', sel: null, fx: null, t: 0, view: null, demoFilled: false, hold: null, upHold: 0 };
  var harnessDone = false;

  function P() { return HL.pal; }
  function F() { return HL.font; }
  function save() { return HL.game.save; }
  function level() { return HL.village.level(save(), 'trhovisko'); }
  var byId = null;
  function species(id) {
    if (!byId) byId = HL.util.byId(HL.data.allFish.concat(HL.data.allLegends));
    return byId[id] || { id: id, name: id, weight: 1 };
  }
  function known(id) { var e = save().encyclopedia[id]; return !!(e && e.n > 0); }

  // Ryba v riadku = dlaždica z common.js (papier = poznáš, tmavá s tieňom = neznámy / predaný druh).
  // Vizuálny kritik (2. kolo, D4): úhor mal na tmavom riadku 2 px a obrys rýb na navy zmizol.
  function tile(ctx, id, x, y, w, h, dark) { return HL.ui.fishTile(ctx, id, x, y, w, h, { dark: !!dark }); }
  function num(v) { return HL.util.num(v); } // desatinná čiarka/bodka jazyka ("1,5")
  // Číslo sa pri zalomení neodtrhne od jednotky ("5 | %") — nezlomiteľná medzera.
  // \p{L} = písmeno každého jazyka (zoznam len so slovenskou diakritikou lámal pl "3 | żarłoczne").
  function nb(s) { return String(s).replace(/(\d) (?=[0-9€%\p{L}])/gu, '$1\u00a0'); }

  // ------------------------------------------------------------------ náhľad predaja
  // HL.market.preview = skutočný HL.market.sell nad tieňovou kópiou trhu (sim, nič nemení): rovnaký
  // vzorec, zaokrúhlenie aj objednávky. Ten istý náhľad počíta nadpis výsledku ponoru (#27).
  // noOrders: trhová cena bez bonusu obchodníka (riadok "za kus"); bez neho skutočná výplata.
  function preview(items, noOrders) {
    return HL.market.preview(save(), items, HL.game.env(), noOrders ? { noOrders: true } : null);
  }

  function hotMult(id) { var h = save().market.hot; return h && h[id] ? h[id] : 0; }
  function orderFor(id) {
    var os = HL.market.orders(save());
    for (var i = 0; i < os.length; i++) if (os[i].fishId === id && os[i].got < os[i].count) return os[i];
    return null;
  }

  // Skupiny rýb v Chatrči podľa druhu, zoradené podľa sumy (najcennejšie hore).
  function groups() {
    var s = save(), map = {}, order = [];
    for (var i = 0; i < s.storage.length; i++) {
      var it = s.storage[i];
      if (!it || it.sold) continue;
      if (!map[it.id]) { map[it.id] = { id: it.id, items: [] }; order.push(map[it.id]); }
      map[it.id].items.push(it);
    }
    order.forEach(function (g) {
      // suma na tlačidle = skutočná výplata (s objednávkou); "za kus" = trhová cena (dopyt klesá)
      g.total = preview(g.items).total;
      var plain = preview(g.items, true);
      g.first = plain.lines.length ? plain.lines[0].price : 0;
      g.last = plain.lines.length ? plain.lines[plain.lines.length - 1].price : 0;
    });
    order.sort(function (a, b) { return b.total - a.total || (a.id < b.id ? -1 : 1); });
    return order;
  }

  // Riadky záložky Ceny: dnes horúce druhy hore, potom známe druhy v poradí hĺbky.
  function priceRows() {
    var s = save(), hot = HL.market.hot(s).map(function (h) { return h.id; }), out = [];
    var ev = HL.world.currentEvent;
    hot.forEach(function (id) { if (species(id).price != null) out.push(id); });
    HL.data.allFish.forEach(function (f) { // aj ryby jadrového jazera, keď ich hráč pozná
      if (out.indexOf(f.id) >= 0) return;
      if (f.event && f.event !== ev) return;
      if (known(f.id)) out.push(f.id);
    });
    return out;
  }

  // ------------------------------------------------------------------ harness
  function harnessFill() {
    var s = save(), Q = HL.query;
    if (!Q.weather) {
      s.clock += 3 * 1440;
      HL.market.advanceDays(s, HL.world.day(s.clock));
    }
    var cap = HL.village.storageCap(s);
    var ids = ['sardinka', 'sardinka', 'sardinka', 'sardinka', 'makrela', 'makrela', 'treska', 'tuniak', 'uhor'];
    HL.market.hot(s).forEach(function (h) { ids.push(h.id, h.id); });
    HL.market.orders(s).forEach(function (o) { ids.push(o.fishId, o.fishId); });
    for (var i = 0; i < ids.length && s.storage.length < cap; i++) {
      var f = species(ids[i]);
      s.storage.push({ id: f.id, w: Math.round(f.weight * (0.85 + ((i * 37) % 30) / 100) * 100) / 100 });
    }
    HL.game.persistOn = false; // harness nikdy nezapisuje hráčovu kariéru
    st.demoFilled = true;
  }

  // ------------------------------------------------------------------ rozloženie
  // Vety bežným písmom (drobné sa na 1× nedá čítať — vizuálny kritik). Výška sa zráta vopred,
  // zoznam ju potrebuje už v prvom snímku.
  var LH = 11;
  function para(text, w) { return F().wrap(nb(text), w, {}); }

  function computeView() {
    var s = save(), lvl = level(), env = HL.game.env();
    var up = lvl < 3 ? HL.village.upgradeInfo(s, 'trhovisko') : null;
    // Po kúpe poslednej úrovne karta ešte chvíľu ostane (vypnutá) — záložky sa inak posunú pod
    // kurzor a druhý klik dvojkliku by trafil záložku.
    if (!up && st.upHold > 0) up = { next: 3, desc: HL.util.byId(HL.data.buildings).trhovisko.levels[3], cost: 0, ok: false, done: true };
    var v = { lvl: lvl, env: env, up: up };
    var y = 24;
    if (v.up) {
      v.upY = y;
      v.upLines = F().wrap(v.up.desc, W - 2 * M - UP_BW - 16, { small: true });
      v.upH = Math.max(26, 13 + v.upLines.length * 8 + 3);
      y += v.upH + 3;
    }
    v.tabY = y; y += 18;
    v.listY = y; v.listH = BAR_Y - y;
    v.groups = groups();
    // Riadky záložky Predaj: skutočné skupiny + práve predaná (na svojom mieste, vypnutá).
    v.sellRows = v.groups.slice();
    if (st.hold && !v.groups.some(function (g) { return g.id === st.hold.id; })) {
      v.sellRows.splice(Math.min(st.hold.idx, v.sellRows.length), 0, st.hold);
    }
    // Spoločná šírka tlačidiel Predať = jeden ľavý okraj (vizuálny kritik): podľa najdlhšieho popisu.
    v.btnW = 52;
    v.groups.forEach(function (g) { v.btnW = Math.max(v.btnW, F().measure(t('ui.market.sell', { money: HL.util.money(g.total) }), { small: true }) + 10); });
    v.all = preview(s.storage.filter(function (it) { return it && !it.sold; }));
    v.storm = env.weather === 'storm';
    var evd = env.event ? HL.util.byId(HL.data.events)[env.event] : null;
    v.eventMult = evd && evd.priceMult ? evd : null;
    if (st.tab === 'sell') v.contentH = sellContentH(v);
    else if (st.tab === 'prices') { v.rows = priceRows(); v.contentH = pricesContentH(v); }
    else { v.orders = HL.market.orders(s); v.contentH = ordersContentH(v); }
    return v;
  }

  function noteH(v) { return (v.storm ? 12 : 0) + (v.eventMult ? 12 : 0); }
  function sellContentH(v) { return 4 + noteH(v) + 2 * LH + 12 + (v.sellRows.length ? v.sellRows.length * SELL_H : 40) + 6; }
  function pricesContentH(v) {
    var h = 4 + noteH(v) + (v.lvl < 2 ? para(t('ui.market.graphLocked'), W - 2 * M - 16).length * LH : LH) + 3;
    h += v.rows.length ? v.rows.length * PRICE_H : 6 + para(t('ui.market.noKnown'), W - 2 * M).length * LH;
    if (st.sel && v.lvl >= 2 && v.rows.indexOf(st.sel) >= 0) h += GRAPH_H;
    return h + 6;
  }
  function ordersContentH(v) {
    if (v.lvl < 3) return 50 + para(t('ui.market.ordersLocked'), W - 2 * M - 12).length * LH + 6;
    var head = para(t('ui.market.ordersHead'), W - 2 * M).length * LH + 4;
    return 6 + head + (v.orders.length ? v.orders.length * ORDER_H : 6 + para(t('ui.market.noOrders'), W - 2 * M).length * LH) + 6;
  }

  // ------------------------------------------------------------------ kreslenie: spoločné
  function drawUpgrade(ctx, v) {
    var P_ = P(), F_ = F(), u = v.up, y = v.upY;
    HL.draw.panel(ctx, M, y, W - 2 * M, v.upH, 'dark');
    HL.draw.sprite(ctx, HL.spr.get('icon_up'), M + 4, y + 4);
    F_.draw(ctx, t('ui.market.level', { n: u.next }), M + 18, y + 5, P_.amber, { small: true });
    for (var i = 0; i < v.upLines.length; i++) F_.draw(ctx, v.upLines[i], M + 5, y + 15 + i * 8, P_.white, { small: true });
    var bw = UP_BW, bh = 20;
    // Chvíľu po kúpe vypnuté (dvojklik nekúpi ďalšiu úroveň); po poslednej úrovni "Hotovo".
    var hold = st.upHold > 0;
    HL.w.button(ctx, 'upgrade', W - M - bw - 4, y + Math.floor((v.upH - bh) / 2), bw, bh, u.done ? t('ui.market.done') : t('ui.market.upgrade', { money: HL.util.money(u.cost) }),
      { style: u.ok && !hold ? 'primary' : 'normal', disabled: !u.ok || hold, small: true });
  }

  // Záložky = spoločné HL.ui.tabs (vizuálny kritik, 2. kolo: Trhovisko a Encyklopédia mali opačnú polaritu).
  function drawTabs(ctx, v) {
    HL.ui.tabs(ctx, M, v.tabY, W - 2 * M, TABS.map(function (tab) {
      return { id: tab.id, label: tabLabel(tab.id), w: tab.w, hotkey: tab.key, locked: tab.id === 'orders' && v.lvl < 3 };
    }), st.tab, { h: 18, panel: P().navy });
  }

  function drawNotes(ctx, v, y) {
    var P_ = P(), F_ = F();
    if (v.storm) {
      HL.draw.sprite(ctx, HL.spr.get('icon_storm'), M, y - 2);
      F_.draw(ctx, t('ui.market.stormNote', { pct: HL.util.pct(HL.T.stormPriceBonus) }), M + 15, y, P_.amber, { small: true });
      y += 12;
    }
    if (v.eventMult) {
      var names = Object.keys(v.eventMult.priceMult).map(function (id) { return species(id).name; }).join(', ');
      F_.draw(ctx, t('ui.market.eventNote', { event: v.eventMult.name, fish: names }), M, y, P_.yellow, { small: true, maxWidth: W - 2 * M });
      y += 12;
    }
    return y;
  }

  // ------------------------------------------------------------------ záložka Predaj
  function drawSell(ctx, v) {
    var P_ = P(), F_ = F(), D = HL.draw, s = save(), u = HL.util;
    var y = drawNotes(ctx, v, v.listY + 4);
    var cap = HL.village.storageCap(s);
    // Pravidlo dopytu je veta, ktorú má hráč prečítať → vlastný riadok, bežné písmo (vizuálny kritik).
    F_.draw(ctx, t('ui.market.inStorage', { stored: s.storage.length, cap: cap }), M, y, P_.white);
    y += LH;
    F_.draw(ctx, nb(t('ui.market.rule', { pct: u.pct(HL.T.demandDrop) })), M, y, P_.greyLight, { maxWidth: W - 2 * M });
    y += LH;
    D.rect(ctx, M, y + 4, W - 2 * M, 1, P_.slateDark);
    y += 12;
    if (!v.sellRows.length) {
      HL.draw.sprite(ctx, HL.spr.get('icon_fish'), W / 2 - 5, y + 4);
      F_.draw(ctx, t('ui.market.emptyTitle'), W / 2, y + 16, P_.white, { align: 'center' });
      F_.draw(ctx, t('ui.market.emptyHint'), W / 2, y + 28, P_.greyLight, { align: 'center' });
      return;
    }
    var bw = v.btnW, bx0 = W - M - bw, textW = W - 2 * M - 34 - bw - 4;
    for (var i = 0; i < v.sellRows.length; i++) {
      var g = v.sellRows[i], sp = species(g.id), ry = y + i * SELL_H;
      // Riadok končí spodkom tlačidla (ry + 32); keď by ho okraj zoznamu pretol, nekreslí sa (#D2).
      if (!v.cut.fits(ry, ry + 32)) { v.cut.ghost('sell_' + g.id, bx0, ry + 16, bw, 16); continue; }
      if (g.ghost) { drawSoldRow(ctx, g, ry, bx0, bw); continue; }
      tile(ctx, g.id, M, ry + 5, 30, 22);
      // 1. riadok meno cez celú šírku; 2. cena prvého → posledného kusu; 3. odznaky; tlačidlo vpravo dole
      F_.draw(ctx, t('ui.market.countFish', { n: g.items.length, fish: sp.name }), M + 32, ry + 3, P_.white, { maxWidth: W - 2 * M - 34 });
      var label = t('ui.market.sell', { money: u.money(g.total) });
      var priceTxt = g.items.length > 1 && Math.round(g.last) < Math.round(g.first)
        ? t('ui.market.perPieceRange', { first: Math.round(g.first), last: u.money(g.last) })
        : t('ui.market.perPiece', { price: u.money(g.first) });
      F_.draw(ctx, priceTxt, M + 32, ry + 16, P_.greyLight, { small: true, maxWidth: textW });
      var bx = M + 32, hm = hotMult(g.id), ord = orderFor(g.id);
      if (hm) bx += F_.draw(ctx, t('ui.market.hotMult', { mult: num(hm) }), bx, ry + 25, P_.yellow, { small: true }) + 5;
      if (ord) {
        // plné slovo, keď sa zmestí; inak skratka — radšej "obj." než useknuté "objednávka…"
        var ot = t('ui.market.orderTag', { bonus: num(ord.bonus) }), room = M + 32 + textW - bx;
        if (F_.measure(ot, { small: true }) > room) ot = t('ui.market.orderTagShort', { bonus: num(ord.bonus) });
        F_.draw(ctx, ot, bx, ry + 25, P_.cyan, { small: true, maxWidth: room });
      }
      HL.w.button(ctx, 'sell_' + g.id, bx0, ry + 16, bw, 16, label, { small: true, style: 'normal' });
      g.btnY = ry + 16; g.btnX = bx0 + bw / 2;
      D.rect(ctx, M, ry + SELL_H - 1, W - 2 * M, 1, P_.slateDark);
    }
  }

  // Práve predaný druh: riadok ostane na mieste s vypnutým tlačidlom TOHO ISTÉHO id (fokus naň
  // ostane a druhý Enter/klik nič nespraví), kým neuplynie T.marketHoldSec (#29).
  function drawSoldRow(ctx, g, ry, bx0, bw) {
    var P_ = P(), F_ = F(), D = HL.draw;
    tile(ctx, g.id, M, ry + 5, 30, 22, true);
    F_.draw(ctx, t('ui.market.countFish', { n: g.n, fish: species(g.id).name }), M + 32, ry + 3, P_.grey, { maxWidth: W - 2 * M - 34 });
    F_.draw(ctx, '+' + HL.util.money(g.total), M + 32, ry + 16, P_.greenLight, { small: true, maxWidth: W - 2 * M - 38 - bw });
    HL.w.button(ctx, 'sell_' + g.id, bx0, ry + 16, bw, 16, t('ui.market.sold'), { small: true, disabled: true });
    D.rect(ctx, M, ry + SELL_H - 1, W - 2 * M, 1, P_.slateDark);
  }

  // ------------------------------------------------------------------ záložka Ceny
  function drawPrices(ctx, v) {
    var P_ = P(), F_ = F(), D = HL.draw, s = save(), u = HL.util;
    var y = drawNotes(ctx, v, v.listY + 4);
    if (v.lvl < 2) {
      HL.draw.sprite(ctx, HL.spr.get('icon_lock'), M, y - 1);
      y += F_.drawWrapped(ctx, nb(t('ui.market.graphLocked')), M + 15, y, W - 2 * M - 16, P_.greyLight, {}) + 3;
    } else {
      F_.draw(ctx, t('ui.market.graphHint'), M, y, P_.greyLight, { maxWidth: W - 2 * M });
      y += LH + 3;
    }
    if (!v.rows.length) {
      F_.drawWrapped(ctx, nb(t('ui.market.noKnown')), M, y + 6, W - 2 * M, P_.white, {});
      return;
    }
    for (var i = 0; i < v.rows.length; i++) {
      var id = v.rows[i], sp = species(id), sel = st.sel === id && v.lvl >= 2;
      if (!v.cut.fits(y, y + PRICE_H - 1)) { if (v.lvl >= 2) v.cut.ghost('price_' + id, M, y, W - 2 * M, PRICE_H - 1); y += PRICE_H + (sel ? GRAPH_H : 0); continue; }
      if (v.lvl >= 2) {
        var hh = HL.w.hit('price_' + id, M, y, W - 2 * M, PRICE_H - 1);
        // pod myšou aj vybraný riadok = slateDark (navy na navy zozname nebolo vidno)
        if (sel || hh.hover) D.rect(ctx, M, y, W - 2 * M, PRICE_H - 1, P_.slateDark);
      }
      tile(ctx, id, M, y + 1, 28, 23, !known(id));
      var price = HL.market.price(s, { id: id, w: sp.weight }, v.env);
      var tr = HL.market.trend(s, id);
      var arrow = tr > 0 ? '↑' : tr < 0 ? '↓' : '–';
      // D1 (2. kolo): '–' slate mal na navy 2,5:1, '↓' červená 3,3:1 → sivá 4,9:1, ružová 5,1:1
      var ac = tr > 0 ? P_.greenLight : tr < 0 ? P_.pink : P_.grey;
      var pt = u.money(price), pw = F_.measure(pt);
      F_.draw(ctx, arrow, W - M - 2, y + 3, ac, { align: 'right' });
      F_.draw(ctx, pt, W - M - 12, y + 3, P_.yellow, { align: 'right' });
      F_.draw(ctx, sp.name, M + 30, y + 3, known(id) ? P_.white : P_.greyLight, { maxWidth: W - 2 * M - 30 - pw - 16 });
      // dopyt: lišta 0,4..1,0 (farba podľa výšky) + percentá, horúci dopyt vpravo
      var dm = HL.market.demand(s, id), frac = (dm - HL.T.demandMin) / Math.max(0.01, 1 - HL.T.demandMin);
      var dc = dm >= 0.85 ? P_.greenLight : dm >= 0.6 ? P_.amber : P_.red;
      HL.draw.bar(ctx, M + 30, y + 16, 34, 5, frac, dc, P_.ink, P_.ink);
      F_.draw(ctx, t('ui.market.demand', { pct: u.pct(dm) }), M + 68, y + 15, P_.greyLight, { small: true });
      var hm = hotMult(id);
      if (hm) F_.draw(ctx, t('ui.market.hotMult', { mult: num(hm) }), W - M - 2, y + 15, P_.yellow, { small: true, align: 'right' });
      y += PRICE_H;
      if (sel) {
        if (v.cut.fits(y, y + GRAPH_H - 3)) drawGraph(ctx, id, y, v);
        else if (st.revealSel) {
          // práve vybraný riadok pri spodku: graf by sa neukázal → posuň zoznam, aby bol celý (ďalší snímok)
          HL.w.setScroll('mk_list', v.cut.sy + (y + GRAPH_H - 3 - v.cut.sy) - v.cut.bottom);
        }
        st.revealSel = false;
        y += GRAPH_H;
      }
    }
  }

  // Graf: stĺpce = záznamy histórie (ranný kurz dňa), posledný = živá cena teraz.
  function drawGraph(ctx, id, y, v) {
    var P_ = P(), F_ = F(), D = HL.draw, s = save();
    var hist = (s.market.history || []).filter(function (h) { return HL.util.isNum(h.prices[id]); });
    var today = HL.world.day(s.clock);
    var pts = hist.filter(function (h) { return h.day < today; }).slice(-3).map(function (h) {
      var dd = today - h.day;
      return { label: dd === 1 ? t('ui.market.yesterday') : t('ui.market.daysAgo', { n: dd }), v: h.prices[id] };
    });
    pts.push({ label: t('ui.market.today'), v: HL.market.quote(s, id), now: true });
    var max = 0;
    pts.forEach(function (p) { max = Math.max(max, p.v); });
    D.panel(ctx, M, y, W - 2 * M, GRAPH_H - 3, 'dark');
    var gx = M + 8, gw = W - 2 * M - 16, colW = Math.floor(gw / 4), baseY = y + GRAPH_H - 15, maxH = 22;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], cx = gx + i * colW + Math.floor((colW - 14) / 2);
      var bh = max > 0 ? Math.max(1, Math.round(p.v / max * maxH)) : 1;
      D.rect(ctx, cx, baseY - bh, 14, bh, p.now ? P_.amber : P_.blue);
      D.rect(ctx, cx, baseY - bh, 14, 1, p.now ? P_.yellow : P_.cyan);
      F_.draw(ctx, String(Math.round(p.v)), cx + 7, baseY - bh - 8, P_.white, { small: true, align: 'center' });
      F_.draw(ctx, p.label, cx + 7, baseY + 2, p.now ? P_.amber : P_.grey, { small: true, align: 'center' });
    }
    D.rect(ctx, gx, baseY, gw, 1, P_.slate);
    if (pts.length < 2) F_.draw(ctx, t('ui.market.historyPending'), W - M - 6, y + 4, P_.grey, { small: true, align: 'right' });
    st.graphPoints = pts.length;
  }

  // ------------------------------------------------------------------ záložka Objednávky
  function drawOrders(ctx, v) {
    var P_ = P(), F_ = F(), D = HL.draw, u = HL.util, y = v.listY + 6;
    if (v.lvl < 3) {
      HL.draw.sprite(ctx, HL.spr.get('icon_lock'), W / 2 - 5, y + 6);
      F_.drawWrapped(ctx, nb(t('ui.market.ordersUnlock')), M + 6, y + 24, W - 2 * M - 12, P_.white, {});
      F_.drawWrapped(ctx, nb(t('ui.market.ordersLocked')), M + 6, y + 50, W - 2 * M - 12, P_.greyLight, {});
      return;
    }
    y += F_.drawWrapped(ctx, nb(t('ui.market.ordersHead')), M, y, W - 2 * M, P_.greyLight, {}) + 4;
    if (!v.orders.length) {
      F_.drawWrapped(ctx, nb(t('ui.market.noOrders')), M, y + 6, W - 2 * M, P_.white, {});
      return;
    }
    var today = HL.world.day(save().clock);
    for (var i = 0; i < v.orders.length; i++) {
      var o = v.orders[i], sp = species(o.fishId), done = o.got >= o.count;
      if (!v.cut.fits(y, y + ORDER_H - 3)) { y += ORDER_H; continue; }
      tile(ctx, o.fishId, M, y + 2, 30, 24);
      var bonus = t('ui.market.bonus', { bonus: num(o.bonus) });
      F_.draw(ctx, bonus, W - M - 1, y + 3, P_.cyan, { small: true, align: 'right' });
      F_.draw(ctx, t('ui.market.countFish', { n: o.count, fish: sp.name }), M + 32, y + 2, P_.white, { maxWidth: W - 2 * M - 36 - F_.measure(bonus, { small: true }) });
      HL.draw.bar(ctx, M + 32, y + 16, 50, 6, o.got / o.count, done ? P_.greenLight : P_.amber, P_.ink, P_.ink);
      F_.draw(ctx, tp(o.count, 'ui.market.orderProgress', { got: o.got }), M + 86, y + 15, P_.greyLight, { small: true });
      var left = o.untilDay - today;
      var when = done ? t('ui.market.orderDone') : left <= 0 ? t('ui.market.orderLastDay') : left === 1 ? t('ui.market.orderTomorrow') : tp(left, 'ui.market.orderDaysLeft');
      F_.draw(ctx, when, W - M - 1, y + 15, done ? P_.greenLight : left <= 0 ? P_.orange : P_.grey, { small: true, align: 'right' });
      D.rect(ctx, M, y + ORDER_H - 2, W - 2 * M, 1, P_.navy);
      y += ORDER_H;
    }
  }

  // ------------------------------------------------------------------ akcie
  function sellItems(items, fromX, fromY) {
    if (!items.length) return null;
    var r = HL.game.sell(items.slice());
    if (!(r.total > 0) && !r.lines.length) return null;
    HL.ui.sfx('coin');
    HL.ui.toast('+' + HL.util.money(r.total), 'good');
    st.fx.emit('coins', fromX, fromY, { n: Math.min(24, 6 + r.lines.length * 2) });
    st.lastSale = { total: r.total, n: r.lines.length };
    return r;
  }

  function scrollY() { var sc = HL.w.scrollOf('mk_list'); return sc ? sc.y : 0; }

  // ------------------------------------------------------------------ bočné panely (PC)
  function drawPanel(ctx, side, w, h) {
    var P_ = P(), F_ = F(), s = save();
    HL.draw.panel(ctx, 2, 2, w - 4, h - 4, 'dark');
    if (side === 'L') {
      F_.draw(ctx, t('ui.market.panel.hot'), 8, 8, P_.amber);
      var hot = HL.market.hot(s), y = 26;
      if (!hot.length) y += F_.drawWrapped(ctx, t('ui.market.panel.hotNone'), 8, y, w - 16, P_.greyLight, {});
      hot.forEach(function (hh) {
        tile(ctx, hh.id, 6, y - 3, 31, 22, !known(hh.id));
        F_.drawWrapped(ctx, species(hh.id).name, 40, y, w - 46, P_.white, { small: true });
        F_.draw(ctx, t('ui.market.hotMult', { mult: num(hh.mult) }), 40, y + 10, P_.yellow, { small: true });
        y += 26;
      });
      var env = HL.game.env();
      y = Math.max(y + 8, 90);
      HL.draw.sprite(ctx, HL.spr.get(HL.world.weatherIcon(env.weather, env.m)), 8, y);
      F_.draw(ctx, HL.world.weatherName(env.weather, env.m), 24, y + 2, P_.greyLight, { small: true });
      if (env.weather === 'storm') F_.drawWrapped(ctx, nb(t('ui.market.panel.storm', { pct: HL.util.pct(HL.T.stormPriceBonus) })), 8, y + 16, w - 16, P_.amber, {});
    } else {
      F_.draw(ctx, t('ui.market.panel.howTitle'), 8, 8, P_.amber, { maxWidth: w - 16 });
      var U = HL.util;
      var tx = t('ui.market.panel.how', { drop: U.pct(HL.T.demandDrop), min: U.pct(HL.T.demandMin), recover: U.pct(HL.T.demandRecover) });
      // pravidlo trhu je veta → bežné písmo s riadkom 10 px, aby sa zmestilo nad zoznam kláves
      F_.drawWrapped(ctx, nb(tx), 8, 24, w - 16, P_.white, { lineHeight: 10 });
      F_.draw(ctx, t('ui.market.panel.keyTabs'), 8, h - 40, P_.greyLight, { small: true });
      F_.draw(ctx, t('ui.market.panel.keySellAll'), 8, h - 30, P_.greyLight, { small: true });
      F_.draw(ctx, t('ui.market.panel.keyBack'), 8, h - 20, P_.greyLight, { small: true });
    }
  }

  // ------------------------------------------------------------------ scéna
  HL.scenes.def('market', {
    enter: function (p) {
      p = p || {};
      HL.w.nav = true;
      st.back = p.back && HL.scenes.get(p.back) && p.back !== 'market' ? p.back : 'village';
      st.tab = TABS.some(function (tab) { return tab.id === p.tab; }) ? p.tab : 'sell';
      st.sel = null; st.t = 0; st.lastSale = null; st.graphPoints = 0; st.hold = null; st.upHold = 0;
      st.fx = HL.fx.create({ seed: 0x7a4d, w: W, h: H });
      HL.market.ensure(save());
      if (!harnessDone && HL.query.scene === 'market' && HL.query.demo === 'built') { harnessDone = true; harnessFill(); }
      st.view = computeView();
      // Fokus na záložku, nie na "Predať všetko": Enter hneď po vstupe nesmie predať celú Chatrč.
      HL.w.setFocus('tab_' + st.tab);
      if (HL.music) HL.music.set('village');
      if (HL.audio) HL.audio.ambience('village');
    },
    exit: function () { HL.w.nav = false; },

    update: function (dt) {
      st.t += dt;
      st.fx.update(dt);
      var v = st.view || computeView();
      if (HL.ui.backPressed()) { HL.go(st.back); return; }
      for (var i = 0; i < TABS.length; i++) {
        if (HL.w.clicked('tab_' + TABS[i].id) && st.tab !== TABS[i].id) { st.tab = TABS[i].id; st.sel = null; HL.w.setScroll('mk_list', 0); }
      }
      if (st.upHold > 0) st.upHold = Math.max(0, st.upHold - dt);
      if (st.hold && (st.hold.t -= dt) <= 0) st.hold = null;
      if (HL.w.clicked('upgrade') && !(st.upHold > 0)) {
        if (HL.village.upgrade(save(), 'trhovisko')) {
          var lv = level();
          HL.ui.sfx('upgrade');
          // Úroveň, ktorú hráč PRÁVE kúpil (#26); upgradeInfo po kúpe by opísal nasledujúcu.
          HL.ui.toast(t('ui.market.upgraded', { level: lv, desc: HL.util.byId(HL.data.buildings).trhovisko.levels[lv] }), 'good');
          HL.game.persist();
          st.fx.emit('coins', W - 40, 34, { n: 10 });
          st.upHold = HL.T.marketHoldSec;
        } else HL.ui.toast(v.up ? v.up.reason || t('ui.market.cantNow') : t('ui.market.maxLevel'), 'bad');
      }
      if (st.tab === 'sell') {
        for (var g = 0; g < v.groups.length; g++) {
          var gr = v.groups[g];
          if (!HL.w.clicked('sell_' + gr.id)) continue;
          var sold = sellItems(gr.items, gr.btnX || W - 30, (gr.btnY || 150) - scrollY());
          // riadok ostane na svojom mieste ako vypnuté "Predané" (dvojklik, #29)
          if (sold) st.hold = { ghost: true, id: gr.id, idx: g, n: sold.lines.length, total: sold.total, t: HL.T.marketHoldSec };
          break; // jeden predaj za krok — zoznam sa práve zmenil
        }
      }
      if (st.tab === 'prices' && v.rows && v.lvl >= 2) {
        for (var r = 0; r < v.rows.length; r++) {
          if (HL.w.clicked('price_' + v.rows[r])) { st.sel = st.sel === v.rows[r] ? null : v.rows[r]; st.revealSel = !!st.sel; }
        }
      }
      if (HL.w.clicked('sell_all')) {
        var all = save().storage.filter(function (it) { return it && !it.sold; });
        if (all.length) sellItems(all, W / 2, BAR_Y);
      }
    },

    draw: function (ctx) {
      var P_ = P(), D = HL.draw;
      var v = st.view = computeView();
      // Plné plochy (vizuálny kritik): piesočná "markíza" nad záložkami, tmavá doska stola pod
      // zoznamom. Šachovnica cez celú plochu rozbíjala drobné písmo aj tenké čiary.
      D.rect(ctx, 0, 0, W, v.listY, P_.sand);
      D.rect(ctx, 0, v.listY, W, BAR_Y - v.listY, P_.navy);
      if (v.up) drawUpgrade(ctx, v);
      drawTabs(ctx, v);
      var sy = HL.w.beginScroll(ctx, 'mk_list', 0, v.listY, W, v.listH, v.contentH);
      v.cut = HL.ui.listCut(v.listY, v.listH, sy); // riadok pri spodnej lište buď celý, alebo vôbec (D2)
      if (st.tab === 'sell') drawSell(ctx, v);
      else if (st.tab === 'prices') drawPrices(ctx, v);
      else drawOrders(ctx, v);
      HL.w.endScroll(ctx);
      HL.ui.moreBelow(ctx, v.cut, 0, W);
      D.rect(ctx, 0, BAR_Y, W, H - BAR_Y, P_.ink);
      D.rect(ctx, 0, BAR_Y, W, 1, P_.slateDark);
      var n = v.all.lines.length;
      var label = n ? t('ui.market.sellAll', { money: HL.util.money(v.all.total) }) : t('ui.market.storageEmpty');
      HL.w.button(ctx, 'sell_all', M, BAR_Y + 5, W - 2 * M, 28, label, { style: 'primary', disabled: !n, hotkey: 'KeyP', icon: n ? 'icon_money' : null });
      st.fx.draw(ctx, W, H);
      HL.ui.header(ctx, t('ui.market.title'), { sub: v.storm ? t('ui.market.levelStorm', { n: v.lvl, pct: HL.util.pct(HL.T.stormPriceBonus) }) : t('ui.market.level', { n: v.lvl }) });
    },

    drawPanel: drawPanel,

    probe: function () {
      var v = st.view || computeView(), s = save();
      return {
        level: v.lvl, tab: st.tab, back: st.back,
        storageCount: s.storage.length, groups: v.groups.length,
        groupTotals: v.groups.map(function (g) { return g.total; }),
        groupIds: v.groups.map(function (g) { return g.id; }),
        groupFirst: v.groups.map(function (g) { return g.first; }),
        sellAllTotal: v.all.total, sellAllCount: v.all.lines.length,
        priceRows: v.rows ? v.rows.length : null, priceIds: v.rows ? v.rows.slice(0, 6) : null,
        selected: st.sel, graphPoints: st.sel ? st.graphPoints : 0,
        orders: v.orders ? v.orders.length : HL.market.orders(s).length, ordersLocked: v.lvl < 3,
        canUpgrade: !!(v.up && v.up.ok), upgradeCost: v.up ? v.up.cost : null,
        storm: v.storm, hot: HL.market.hot(s).map(function (h) { return h.id; }),
        lastSale: st.lastSale, demoFilled: st.demoFilled,
        contentH: v.contentH, listH: v.listH, hidden: v.cut ? v.cut.hidden : 0, // riadky pod okrajom (D2)
        // dvojklik (#29): práve predaný druh drží miesto; vylepšenie chvíľu vypnuté
        hold: st.hold ? st.hold.id : null, holdLeft: st.hold ? st.hold.t : 0, upHold: st.upHold,
      };
    },
  });
})(globalThis.HL);
