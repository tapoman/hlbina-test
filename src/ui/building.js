// Obrazovka budovy (dizajn 11): budova na kúsku zeme, jej úroveň, čo robí teraz, karta
// ďalšej úrovne s cenou a tlačidlom Postaviť/Vylepšiť, a pod tým obsah budovy
// (spánok a úložisko, obchod, predpoveď, tipy a úlohy, akvárium...).
//
// Rozloženie (180×320):
//   0–22    hlavička (HL.ui.header): meno, "Úroveň N z 3", peniaze, šípka späť
//   22–102  výklad: obloha podľa času a počasia (tá istá ako v dedine), budova na zemi
//   104–156 karta ďalšej úrovne — PEVNÁ, nie v zozname: vylepšenie je cieľ hry (dizajn 11),
//           nesmie sa odscrollovať preč
//   158–…   posúvaný obsah budovy
//   288–320 lišta s hlavnou akciou budovy (Chatrč: spánok; Maják 3: Nekonečná hlbina)
//
// Budovy Starej elektrárne (data/buildings.js site: 'elektraren' — Lodenica, Laboratórium, docs/JAZERO.md)
// používajú tú istú obrazovku: výklad má jazero a chladiace veže (HL.plantArt), späť vedie do elektrárne,
// Lodenica má v lište NA JAZERO, Laboratórium predáva jazerné vlasce a prúty (HL.village.labShop).
//
// Tlačidlá v zozname sa deklarujú v draw() spolu s akciou (S.actions[id] = funkcia)
// a update() spustí tú, ktorú HL.w.clicked nahlási. Jedno miesto, kde tlačidlo vzniká,
// je aj jediné miesto, ktoré vie, čo robí — žiadne dvojité zoznamy id.
(function (HL) {
  var T = HL.T;
  T.def('Budovy', 'sleepFadeSec', 0.5, 0.1, 2, 0.05, 'Spánok: stmievanie a rozsvietenie (s)');
  T.def('Budovy', 'sleepHoldSec', 0.9, 0.2, 3, 0.1, 'Spánok: ako dlho je tma s nápisom Spíš… (s)');
  T.def('Budovy', 'upgradeLockSec', 0.5, 0, 2, 0.05, 'Po vylepšení je tlačidlo Vylepšiť zakázané (s) — dvojklik nekúpi dve úrovne');
  T.def('Budovy', 'listFadePx', 9, 0, 30, 1, 'Zoznam: výška stmaveného okraja, za ktorým zoznam pokračuje (px, 0 = bez)');
  T.def('Budovy', 'listFadeSteps', 3, 1, 5, 1, 'Zoznam: o koľko krokov rampy palety stmavne pás pri samej hrane');

  var W = 180, H = 320, HEAD = 22, GROUND = 96, CARD_Y = 104, CARD_H = 52, BODY_Y = 158, BAR_Y = 288;
  var M = 6, BW = W - 2 * M - 4; // šírka obsahu (4 px na posuvník)
  var WEATHER_COL = { sun: 'amber', cloudy: 'grey', rain: 'blue', fog: 'greyLight', storm: 'purple' };

  // Texty pre hráča: src/data/lang/sk/building.js (docs/I18N.md). Čas animácie sa tu volá `time`, nie t.
  function t(k, p) { return HL.i18n.t(k, p); }
  function P(n) { return HL.pal[n]; }
  function save() { return HL.game.save; }
  function U() { return HL.util; }
  function F() { return HL.font; }
  function D() { return HL.draw; }
  function lower1(s) { return HL.i18n.lower1(s); } // nemčina nezmenšuje (podstatné mená)
  // Krok riadkov pod sebou (HL.font.lineStep): malé 10 px, normálne 12 px. Pri 8/9 a 11 px sa
  // diakritika riadku prilepila k dotiahnutiu (g, j, p, y) riadku nad ňou — sonda
  // tools/fix_village_round3.js ('Dnes'/'Prvá štvrť', 'Bambusový prút'/'základný prút').
  function LS() { return F().lineStep({ small: true }); }
  function NS() { return F().lineStep(); }
  function bdata(id) { for (var i = 0; i < HL.data.buildings.length; i++) if (HL.data.buildings[i].id === id) return HL.data.buildings[i]; return null; }

  var S = { id: 'chatrc', t: 0, fx: null, actions: {}, sleep: null, lastSleep: null, body: null, bodyH: 0, info: null, barH: 0, rows: {}, upLock: 0 };

  // ------------------------------------------------------------------ obsah (výška vopred)
  // Zoznam blokov s výškou; kreslí sa až v posúvanom výreze. Výšky musia byť známe pred
  // beginScroll (potrebuje celkovú výšku obsahu), preto text sa láme už tu.
  function Body() { this.items = []; this.h = 0; }
  Body.prototype.add = function (h, fn) { this.items.push({ y: this.h, h: h, fn: fn }); this.h += h; return this; };
  Body.prototype.gap = function (n) { this.h += n; return this; };
  Body.prototype.para = function (text, color, small) {
    var o = { small: !!small }, lines = F().wrap(HL.ui.nb(text), BW, o), lh = F().lineStep(o);
    return this.add(lines.length * lh + 3, function (ctx, x, y) {
      for (var i = 0; i < lines.length; i++) F().draw(ctx, lines[i], x, y + i * lh, P(color || 'greyLight'), o);
    });
  };
  Body.prototype.section = function (label, right) {
    return this.add(16, function (ctx, x, y) {
      HL.ui.section(ctx, x, y + 2, BW, label);
      if (right != null) F().draw(ctx, right, x + BW, y + 3, P('greyLight'), { small: true, align: 'right' });
    });
  };

  function action(id, fn) { S.actions[id] = fn; }

  // ------------------------------------------------------------------ akcie
  function doUpgrade() {
    var s = save(), id = S.id, before = HL.village.level(s, id);
    var info = HL.village.upgradeInfo(s, id);
    if (S.upLock > 0) return;
    if (!HL.village.upgrade(s, id)) { HL.ui.toast(reasonText(info, info.cost, s.money) || t('ui.building.cantNow'), 'bad'); return; }
    S.upLock = T.upgradeLockSec;
    var b = bdata(id);
    HL.ui.sfx('upgrade');
    S.fx.emit('sparkGood', W / 2, GROUND - 20, { n: 26, speed: [20, 70] });
    S.fx.emit('sparkGood', W / 2 - 16, GROUND - 8, { n: 12 });
    S.fx.emit('sparkGood', W / 2 + 16, GROUND - 8, { n: 12 });
    S.fx.flash(P('white'), 0.18);
    // veta pre každú budovu zvlášť: rod mena budovy sa v jazykoch líši (sk/building.js)
    HL.ui.toast(before === 0 ? t('ui.building.built.' + id, { name: b.name }) : t('ui.building.upgraded.' + id, { name: b.name, level: before + 1 }), 'good');
    HL.game.persist();
  }

  function startSleep(which) {
    var s = save();
    if (!HL.village.canSleep(s)) { HL.ui.toast(t('ui.building.sleep.fixHut'), 'bad'); return; }
    S.sleep = { t: 0, which: which, done: false, told: false, res: null };
    HL.ui.sfx('sleep');
  }

  function stepSleep(dt) {
    var sl = S.sleep, s = save(), fade = T.sleepFadeSec, hold = T.sleepHoldSec;
    sl.t += dt;
    if (!sl.done && sl.t >= fade) {
      // Čas sa posunie, až keď je úplná tma — hráč nevidí skok oblohy.
      sl.res = HL.village.sleep(s, sl.which);
      sl.done = true;
      S.lastSleep = sl.res;
      HL.game.persist();
    }
    if (sl.done && !sl.told && sl.t >= fade + hold) {
      sl.told = true;
      var r = sl.res;
      if (r && r.ok) {
        var when = { day: HL.world.dayLabel(r.to), time: HL.world.clockLabel(r.to) };
        HL.ui.toast(t(sl.which === 'night' ? 'ui.building.sleep.night' : 'ui.building.sleep.morning', when), 'info');
        if (r.income > 0) HL.ui.toast(t('ui.building.sleep.income', { money: U().money(r.income) }), 'good');
        // výhra letnej súťaže sa vypláca na prelome dňa — aj keď ho hráč prespí (sim: sleep().prize)
        if (r.prize > 0) HL.ui.toast(t('ui.building.sleep.prize', { money: U().money(r.prize) }), 'good');
      } else if (r) HL.ui.toast(r.reason || t('ui.building.sleep.cant'), 'bad');
    }
    if (sl.t >= fade * 2 + hold) S.sleep = null;
  }

  function buyGear(kind, id, name) {
    var s = save();
    if (HL.village.buyGear(s, kind, id)) {
      HL.ui.sfx('buy');
      HL.ui.toast(t('ui.building.shop.bought', { name: name }), 'good');
      HL.game.persist();
    } else {
      var o = findOffer(kind, id);
      HL.ui.toast((o && o.reason) || t('ui.building.shop.buyFailed'), 'bad');
    }
  }
  function findOffer(kind, id) {
    var lab = kind === 'lakeLine' || kind === 'lakeRod';
    var sh = lab ? HL.village.labShop(save()) : HL.village.shop(save());
    var list = kind === 'line' || kind === 'lakeLine' ? sh.lines : kind === 'rod' || kind === 'lakeRod' ? sh.rods : sh.hooks;
    for (var i = 0; i < list.length; i++) if (list[i].item.id === id) return list[i];
    return null;
  }
  function equip(kind, id, name) {
    if (HL.village.equip(save(), kind, id)) { HL.ui.toast(t('ui.building.shop.equippedToast', { name: name }), 'info'); HL.game.persist(); }
  }
  function buyHarpoon() {
    var s = save();
    if (HL.village.buyHarpoon(s)) { HL.ui.sfx('buy'); HL.ui.toast(t('ui.building.shop.harpoonBought', { have: s.gear.harpoons, max: HL.data.harpoon.maxCarry }), 'good'); HL.game.persist(); }
    else HL.ui.toast(HL.village.shop(s).harpoon.reason || t('ui.building.shop.buyFailed'), 'bad');
  }
  function buyBait(id, qty, name) {
    var s = save();
    if (HL.village.buyBait(s, id, qty)) { HL.ui.sfx('buy'); HL.ui.toast(t('ui.building.shop.baitBought', { qty: qty, name: name }), 'good'); HL.game.persist(); }
    else HL.ui.toast(t('sim.village.noMoney'), 'bad'); // ten istý text ako dôvod zo simulácie
  }
  function buyGold() {
    var s = save(), env = HL.game.env();
    var o = HL.village.goldOffer(s, env);
    if (HL.village.buyGold(s, env)) { HL.ui.sfx('coin'); HL.ui.toast(t('ui.building.krcma.goldBought'), 'good'); HL.game.persist(); }
    else HL.ui.toast(o.reason || t('ui.building.krcma.cantBuyNow'), 'bad');
  }

  // ------------------------------------------------------------------ kúsky riadkov
  function iconBox(ctx, name, x, y) {
    D().rect(ctx, x, y, 16, 16, P('ink'));
    D().rect(ctx, x + 1, y + 1, 14, 14, P('navy'));
    var img = HL.spr.get(name);
    D().sprite(ctx, img, x + 8 - Math.floor(img.width / 2), y + 8 - Math.floor(img.height / 2));
  }
  function tag(ctx, text, x, y, w, color) {
    D().frame(ctx, x, y, w, 16, P(color));
    F().draw(ctx, text, x + w / 2, y + 4, P(color), { small: true, align: 'center', maxWidth: w - 4 });
  }
  function rowLine(ctx, x, y) { D().rect(ctx, x, y, BW, 1, P('navy')); }

  // Riadok obchodu: ikona, meno, vlastnosti, vpravo cena + tlačidlo alebo zámok.
  // Zamknutý alebo nedostupný predmet má pod sebou dôvod (celou šírkou, nech sa zmestí).
  // Vlastnosti sa LÁMU (nie skracujú výpustkou): "máš 0 / 3" pri harpúne bolo to podstatné
  // a výpustka ho zjedla (review #24 — trieda "skrátený text v obchode").
  var STATS_W = 96;
  function shopRow(b, o, icon, name, stats, kind) {
    var reasonLine = o.locked || (!o.owned && !o.available && o.reason && kind !== 'harpoon') || (kind === 'harpoon' && !o.available && o.reason);
    var ls = LS(), sl = F().wrap(HL.ui.nb(stats), STATS_W, { small: true }), extra = (sl.length - 1) * ls;
    var h = (reasonLine ? 40 : 31) + extra;
    var idBuy = 'buy_' + kind + '_' + o.item.id, idEq = 'eq_' + kind + '_' + o.item.id;
    if (kind === 'harpoon') action(idBuy, buyHarpoon);
    else if (!o.owned) action(idBuy, function () { buyGear(kind, o.item.id, name); });
    else if (!o.equipped) action(idEq, function () { equip(kind, o.item.id, name); });
    S.rows.shop = (S.rows.shop || 0) + 1;
    b.add(h, function (ctx, x, y) {
      iconBox(ctx, icon, x, y + 3);
      F().draw(ctx, name, x + 20, y + 2, P(o.locked ? 'grey' : 'white'), { maxWidth: 100 });
      for (var si = 0; si < sl.length; si++) F().draw(ctx, sl[si], x + 20, y + 15 + si * ls, P('grey'), { small: true });
      var yb = y + extra; // dôvod a čiara idú pod zalomené vlastnosti (cena a tlačidlo ostávajú hore)
      var rx = x + BW - 46;
      if (kind !== 'harpoon' && o.owned) {
        if (o.equipped) tag(ctx, t('ui.building.shop.equipped'), rx, y + 6, 46, 'greenLight');
        else HL.w.button(ctx, idEq, rx, y + 5, 46, 18, t('ui.building.shop.equip'), { small: true });
      } else if (o.locked) {
        D().sprite(ctx, HL.spr.get('icon_lock'), rx + 1, y + 4);
        F().draw(ctx, U().money(o.cost), rx + 46, y + 6, P('grey'), { small: true, align: 'right' });
      } else {
        F().draw(ctx, U().money(o.cost), rx + 46, y + 1, P(o.available ? 'yellow' : 'pink'), { small: true, align: 'right' });
        HL.w.button(ctx, idBuy, rx, y + 10, 46, 17, t('ui.building.shop.buy'), { small: true, disabled: !o.available, style: o.available ? 'normal' : null });
      }
      if (reasonLine) F().draw(ctx, reasonText(o, o.cost, save().money), x + 20, yb + 29, P(o.locked ? 'amber' : 'pink'), { small: true, maxWidth: BW - 20 });
      rowLine(ctx, x, y + h - 2);
    });
  }

  // ------------------------------------------------------------------ obsah budov
  var BODIES = {
    chatrc: function (b, s, lvl) {
      if (!HL.village.canSleep(s)) b.para(t('ui.building.chatrc.needHut'), 'amber');
      else b.para(t('ui.building.chatrc.sleepInfo'), 'grey', true);
      var cap = HL.village.storageCap(s), n = s.storage.length;
      b.section(t('ui.building.chatrc.storage'), n + ' / ' + cap);
      b.add(9, function (ctx, x, y) { D().bar(ctx, x, y, BW, 6, cap ? n / cap : 0, n >= cap ? P('red') : P('greenLight')); });
      if (!n) b.para(t('ui.building.chatrc.empty'), 'grey', true);
      S.rows.storage = n;
      for (var i = 0; i < n; i++) (function (it) {
        // Dlhé meno ("Striebristá mesačnica") sa zalomí na druhý riadok, neskráti (review #24).
        var nl = F().wrap(HL.villageArt.fishName(it.id), 124 - 4 - F().measure(U().kg(it.w), { small: true }) - 24, { small: true });
        var ls = LS();
        b.add(14 + (nl.length - 1) * ls, function (ctx, x, y) {
          var th = HL.ui.thumb(it.id, 20, 10);
          D().sprite(ctx, th, x + 10 - Math.floor(th.width / 2), y + 6 - Math.floor(th.height / 2));
          for (var k = 0; k < nl.length; k++) F().draw(ctx, nl[k], x + 24, y + 2 + k * ls, P('white'), { small: true });
          F().draw(ctx, U().kg(it.w), x + 124, y + 2 + (nl.length - 1) * ls, P('greyLight'), { small: true, align: 'right' });
          F().draw(ctx, '~' + U().money(HL.game.priceOf(it)), x + BW, y + 2 + (nl.length - 1) * ls, P('yellow'), { small: true, align: 'right' });
        });
      })(s.storage[i]);
      if (n) {
        action('b_market', function () { HL.go('market', { back: 'village' }); });
        b.gap(3).add(26, function (ctx, x, y) { HL.w.button(ctx, 'b_market', x, y, BW, 22, t('ui.building.chatrc.sell'), { icon: 'icon_money' }); });
      }
      b.gap(4).section(t('ui.building.chatrc.home'));
      b.para(lvl >= 3 ? t('ui.building.chatrc.homeDone') : t('ui.building.chatrc.homeLater'), lvl >= 3 ? 'greenLight' : 'grey', true);
    },

    dielna: function (b, s, lvl) {
      if (lvl < 1) { b.para(t('ui.building.dielna.closed'), 'amber'); return; }
      var sh = HL.village.shop(s);
      b.section(t('ui.building.dielna.lines'), t('ui.building.dielna.linesCols'));
      sh.lines.forEach(function (o) {
        var l = o.item;
        shopRow(b, o, 'line_' + l.id, l.name, isFinite(l.maxDepth) ? t('ui.building.dielna.lineStats', { kg: U().kg(l.strength), depth: U().meters(l.maxDepth) })
          : t('ui.building.dielna.lineStatsNoLimit', { kg: U().kg(l.strength) }), 'line');
      });
      b.gap(4).section(t('ui.building.dielna.rods'), t('ui.building.dielna.rodsCols'));
      sh.rods.forEach(function (o) {
        var r = o.item;
        var st = r.progressBonus || r.toleranceMs ? t('ui.building.dielna.rodStats', { pct: U().pct(r.progressBonus), ms: r.toleranceMs }) : t('ui.building.dielna.rodBasic');
        shopRow(b, o, 'rod_' + r.id, r.name, st, 'rod');
      });
      b.gap(4).section(t('ui.building.dielna.hooks'), t('ui.building.dielna.hooksCols'));
      sh.hooks.forEach(function (o) {
        var k = o.item;
        shopRow(b, o, 'hook_' + k.id, k.name, k.decayMult < 1 ? t('ui.building.dielna.hookStats', { pct: U().pct(1 - k.decayMult) }) : t('ui.building.dielna.hookBasic'), 'hook');
      });
      b.gap(4).section(t('ui.building.dielna.harpoons'));
      var ho = sh.harpoon;
      shopRow(b, ho, 'harpoon', HL.data.harpoon.name, t('ui.building.dielna.harpoonStats', { have: s.gear.harpoons || 0, max: HL.data.harpoon.maxCarry }), 'harpoon');
      b.para(t('ui.building.dielna.note'), 'grey', true);
    },

    navnadaren: function (b, s, lvl) {
      var worm = HL.util.byId(HL.data.baits).worm;
      b.section(t('ui.building.navnadaren.baits'), t('ui.building.navnadaren.baitsCols'));
      S.rows.baits = 0;
      b.add(28, function (ctx, x, y) {
        iconBox(ctx, 'bait_worm', x, y + 3);
        F().draw(ctx, worm.name, x + 20, y + 2, P('white'));
        F().draw(ctx, t('ui.building.navnadaren.worm', { desc: lower1(worm.desc) }), x + 20, y + 15, P('grey'), { small: true, maxWidth: BW - 20 });
        rowLine(ctx, x, y + 26);
      });
      HL.village.shop(s).baits.forEach(function (o) {
        var bt = o.item, id = bt.id;
        S.rows.baits++;
        if (!o.locked) {
          action('bait1_' + id, function () { buyBait(id, 1, bt.name); });
          action('bait10_' + id, function () { buyBait(id, 10, bt.name); });
        }
        // Popis sa láme (nie skracuje): "čo priláka" je dôvod, prečo návnadu kupovať.
        var dl = F().wrap(HL.ui.nb(t('ui.building.navnadaren.lures', { desc: lower1(bt.desc) })), 86, { small: true });
        var ls = LS(), h = 15 + (dl.length + 1) * ls + 4 + (o.locked ? ls : 0);
        b.add(h, function (ctx, x, y) {
          iconBox(ctx, 'bait_' + id, x, y + 3);
          F().draw(ctx, bt.name, x + 20, y + 2, P(o.locked ? 'grey' : 'white'), { maxWidth: 88 });
          for (var k = 0; k < dl.length; k++) F().draw(ctx, dl[k], x + 20, y + 15 + k * ls, P('grey'), { small: true });
          F().draw(ctx, t('ui.building.navnadaren.stock', { have: o.stock, price: U().money(o.cost) }), x + 20, y + 15 + dl.length * ls, P('greyLight'), { small: true, maxWidth: 88 });
          var rx = x + BW - 56;
          if (o.locked) {
            D().sprite(ctx, HL.spr.get('icon_lock'), rx + 44, y + 3);
            F().draw(ctx, o.reason, x + 20, y + 15 + (dl.length + 1) * ls, P('amber'), { small: true, maxWidth: BW - 20 });
          } else {
            var ok1 = s.money >= o.cost, ok10 = s.money >= o.cost * 10;
            HL.w.button(ctx, 'bait1_' + id, rx, y + 5, 24, 20, t('ui.building.navnadaren.buy1'), { small: true, disabled: !ok1 });
            HL.w.button(ctx, 'bait10_' + id, rx + 27, y + 5, 29, 20, t('ui.building.navnadaren.buy10'), { small: true, disabled: !ok10 });
          }
          rowLine(ctx, x, y + h - 2);
        });
      });
      b.gap(4).para(HL.i18n.plural(HL.data.baitCarry, 'ui.building.navnadaren.carry'), 'grey', true);
      if (lvl < 1) b.para(t('ui.building.navnadaren.closed'), 'amber');
    },

    meteostanica: function (b, s, lvl, env) {
      var fc = HL.village.forecast(s, env);
      if (!fc.hours) {
        b.section(t('ui.building.meteostanica.skyNow'));
        b.add(25, function (ctx, x, y) {
          D().sprite(ctx, HL.spr.get(HL.world.weatherIcon(env.weather, env.m)), x, y + 4);
          F().draw(ctx, HL.world.weatherName(env.weather, env.m), x + 16, y + 1, P('white'));
          F().draw(ctx, t('ui.building.meteostanica.periodTime', { period: HL.world.periodName(env.period), time: HL.world.clockLabel(env.m) }), x + 16, y + 14, P('grey'), { small: true });
        });
        b.para(t('ui.building.meteostanica.noMeteo'), 'grey', true);
        return;
      }
      b.section(t('ui.building.meteostanica.forecast', { h: fc.hours }));
      var m0 = env.m, span = fc.hours * 60;
      b.add(34, function (ctx, x, y) {
        var bx = x, by = y + 14, bw = BW, bh = 8;
        D().rect(ctx, bx - 1, by - 1, bw + 2, bh + 2, P('ink'));
        for (var i = 0; i < fc.segments.length; i++) {
          var sg = fc.segments[i];
          var x0 = bx + Math.round((sg.from - m0) / span * bw), x1 = bx + Math.round((sg.to - m0) / span * bw);
          D().rect(ctx, x0, by, Math.max(1, x1 - x0), bh, P(WEATHER_COL[sg.weather] || 'grey'));
          if (i) D().rect(ctx, x0, by, 1, bh, P('ink'));
          if (x1 - x0 >= 13) D().sprite(ctx, HL.spr.get(HL.world.weatherIcon(sg.weather, sg.from)), Math.round((x0 + x1) / 2) - 6, y);
        }
        // dni: zvislá čiarka o polnoci
        for (var dd = 1; dd <= fc.hours / 24; dd++) {
          var mid = (HL.world.day(m0) + dd) * 1440;
          if (mid >= m0 + span) break;
          var mx = bx + Math.round((mid - m0) / span * bw);
          D().rect(ctx, mx, by - 2, 1, bh + 4, P('white'));
        }
        F().draw(ctx, t('ui.building.meteostanica.now'), bx, by + bh + 2, P('grey'), { small: true });
        F().draw(ctx, t('ui.building.meteostanica.plusHours', { h: fc.hours }), bx + bw, by + bh + 2, P('grey'), { small: true, align: 'right' });
      });
      S.rows.segments = fc.segments.length;
      fc.segments.forEach(function (sg) {
        b.add(14, function (ctx, x, y) {
          D().sprite(ctx, HL.spr.get(HL.world.weatherIcon(sg.weather, sg.from)), x, y);
          F().draw(ctx, HL.villageArt.segLabel(sg, env), x + 16, y + 2, P('greyLight'), { small: true });
          F().draw(ctx, HL.world.weatherName(sg.weather, sg.from), x + BW, y + 2, P('white'), { small: true, align: 'right' });
        });
      });
      if (fc.intro) b.gap(2).para(t('ui.building.meteostanica.intro'), 'amber', true);
      b.gap(4).section(t('ui.building.meteostanica.moon'));
      if (fc.moon) {
        var lab = [t('ui.building.meteostanica.today'), t('ui.building.meteostanica.tomorrow'), t('ui.building.meteostanica.dayAfter')];
        var ls = LS();
        b.add(16 + 3 * ls, function (ctx, x, y) {
          for (var i = 0; i < 3; i++) {
            var cx = x + 27 + i * 55;
            D().sprite(ctx, HL.spr.get('moon_' + fc.moon[i]), cx - 6, y + 1);
            F().draw(ctx, lab[i], cx, y + 15, P('grey'), { small: true, align: 'center' });
            var nm = F().wrap(HL.world.moonName(fc.moon[i]), 54, { small: true });
            for (var k = 0; k < nm.length && k < 2; k++) F().draw(ctx, nm[k], cx, y + 15 + (k + 1) * ls, P('white'), { small: true, align: 'center' });
          }
        });
        b.para(t('ui.building.meteostanica.moonHint'), 'grey', true);
      } else b.para(t('ui.building.meteostanica.noMoon'), 'grey', true);
    },

    majak: function (b, s, lvl) {
      var md = HL.village.maxDepth(s), line = HL.util.byId(HL.data.lines)[s.gear.line] || HL.data.lines[0];
      var lb = HL.village.lightBonus(s);
      b.section(t('ui.building.majak.reach'));
      b.add(16, function (ctx, x, y) {
        F().draw(ctx, t('ui.building.majak.deepest'), x, y + 2, P('greyLight'));
        F().draw(ctx, U().meters(md), x + BW, y + 2, P('yellow'), { align: 'right' });
      });
      var longer = HL.data.lines.some(function (l) { return l.maxDepth > line.maxDepth; });
      var why = md >= line.maxDepth ? t(longer ? 'ui.building.majak.lineLimitLonger' : 'ui.building.majak.lineLimit', { line: lower1(line.name) })
        : md >= 1500 && lvl < 3 ? t('ui.building.majak.abyssGate') : t('ui.building.majak.floor');
      b.para(why, 'grey', true);
      b.para(t('ui.building.majak.light', { night: lb.night, midnight: lb.midnight }), 'greyLight', true);
      b.gap(4).section(t('ui.building.majak.levels'));
      var detail = ['', t('ui.building.majak.detail.1'), t('ui.building.majak.detail.2'), t('ui.building.majak.detail.3')];
      var data = bdata('majak');
      for (var i = 1; i <= 3; i++) (function (i) {
        // nadpis úrovne sa láme ("Odomyká Priepasť a Nekonečnú hlbinu" sa do riadka nezmestí)
        var tl = F().wrap(HL.ui.nb(data.levels[i]), BW - 10), dt = F().wrap(HL.ui.nb(detail[i]), BW - 10, { small: true }), ns = NS(), ls = LS();
        b.add(tl.length * ns + dt.length * ls + 4, function (ctx, x, y) {
          HL.villageArt.star(ctx, x + 1, y + 3, lvl >= i);
          for (var a = 0; a < tl.length; a++) F().draw(ctx, tl[a], x + 10, y + 1 + a * ns, P(lvl >= i ? 'white' : 'grey'));
          for (var c = 0; c < dt.length; c++) F().draw(ctx, dt[c], x + 10, y + 1 + tl.length * ns + 1 + c * ls, P(lvl >= i ? 'greenLight' : 'slate'), { small: true });
        });
      })(i);
      if (lvl >= 3) b.para(t('ui.building.majak.endless'), 'amber', true);
    },

    krcma: function (b, s, lvl) {
      if (lvl < 1) { b.para(t('ui.building.krcma.closed'), 'grey'); return; }
      b.section(t('ui.building.krcma.talk'));
      HL.village.tips(s).forEach(function (tip) {
        var lines = F().wrap(HL.ui.nb(t('ui.building.krcma.quote', { tip: tip })), BW - 12), ns = NS();
        b.add(lines.length * ns + 10, function (ctx, x, y) {
          D().panel(ctx, x, y, BW, lines.length * ns + 6, 'paper');
          for (var i = 0; i < lines.length; i++) F().draw(ctx, lines[i], x + 6, y + 2 + i * ns, P('wood'));
        });
      });
      if (lvl < 2) { b.para(t('ui.building.krcma.questsLater'), 'grey', true); return; }
      var qs = HL.village.quests(s);
      S.rows.quests = qs.length;
      b.gap(2).section(t('ui.building.krcma.quests'), t('ui.building.krcma.questsDone', { done: s.quests.done || 0 }));
      qs.forEach(function (q) {
        var lines = F().wrap(HL.ui.nb(q.text), BW), ns = NS(), ls = LS();
        var prog = q.kind === 'depth' ? U().meters(q.got) + ' / ' + U().meters(q.count)
          : q.kind === 'value' ? U().money(q.got) + ' / ' + U().money(q.count) : q.got + ' / ' + q.count;
        var rew = t(q.reward.gold ? 'ui.building.krcma.rewardGold' : 'ui.building.krcma.reward', { money: U().money(q.reward.money) });
        b.add(lines.length * ns + 15 + ls, function (ctx, x, y) {
          for (var i = 0; i < lines.length; i++) F().draw(ctx, lines[i], x, y + i * ns, P('white'));
          var yy = y + lines.length * ns;
          D().bar(ctx, x, yy, 70, 7, q.count ? Math.min(1, q.got / q.count) : 0, P('amber'));
          F().draw(ctx, prog, x + 74, yy, P('greyLight'), { small: true });
          F().draw(ctx, rew, x + BW, yy + ls, P('yellow'), { small: true, align: 'right', maxWidth: BW });
          rowLine(ctx, x, yy + ls + 10);
        });
      });
      if (lvl < 3) { b.para(t('ui.building.krcma.cluesLater'), 'grey', true); return; }
      b.gap(4).section(t('ui.building.krcma.clues'));
      HL.village.clues(s).forEach(function (c) {
        var lines = F().wrap(HL.ui.nb(c.text), BW, { small: true }), ls = LS();
        b.add(14 + lines.length * ls + 3, function (ctx, x, y) {
          F().draw(ctx, c.name, x, y + 1, P(c.caught ? 'greenLight' : 'amber'), { maxWidth: BW - 12 });
          if (c.caught) D().sprite(ctx, HL.spr.get('icon_trophy'), x + BW - 11, y);
          for (var i = 0; i < lines.length; i++) F().draw(ctx, lines[i], x, y + 14 + i * ls, P(c.caught ? 'grey' : 'greyLight'), { small: true });
        });
      });
      var env = HL.game.env(), go = HL.village.goldOffer(s, env), gold = HL.util.byId(HL.data.baits).gold;
      b.gap(4).section(t('ui.building.krcma.gold'), t('ui.building.krcma.goldHave', { have: s.baits.gold || 0 }));
      action('b_gold', buyGold);
      // popis sa láme vedľa tlačidla (skrátený "zvyšuje šancu na legen…" nepovedal, čo robí)
      var gl = F().wrap(HL.ui.nb(t('ui.building.krcma.goldDesc', { desc: lower1(gold.desc) })), BW - 72, { small: true });
      var ls = LS(), gy = Math.max(13, 2 + gl.length * ls), gr = go.available ? [] : F().wrap(HL.ui.nb(reasonText(go, go.price, s.money)), BW - 20, { small: true });
      var gr0 = Math.max(28, gy + ls);
      b.add(gr.length ? gr0 + gr.length * ls + 2 : Math.max(30, gy + 10), function (ctx, x, y) {
        iconBox(ctx, 'bait_gold', x, y + 3);
        for (var gi = 0; gi < gl.length; gi++) F().draw(ctx, gl[gi], x + 20, y + 2 + gi * ls, P('greyLight'), { small: true });
        F().draw(ctx, U().money(go.price), x + 20, y + gy, P(go.available ? 'yellow' : 'pink'), { small: true });
        HL.w.button(ctx, 'b_gold', x + BW - 50, y + 4, 50, 20, t('ui.building.shop.buy'), { small: true, disabled: !go.available });
        for (var ri = 0; ri < gr.length; ri++) F().draw(ctx, gr[ri], x + 20, y + gr0 + ri * ls, P('pink'), { small: true });
      });
    },

    akvarium: function (b, s, lvl) {
      var aq = HL.village.aquarium(s);
      if (lvl < 1) { b.para(t('ui.building.akvarium.closed'), 'grey'); return; }
      b.section(t('ui.building.akvarium.tank'), t('ui.building.akvarium.species', { count: aq.species.length }));
      S.rows.tank = aq.species.length;
      b.add(98, function (ctx, x, y) { tank(ctx, x, y, BW, 94, aq); });
      if (lvl >= 2) {
        b.para(t(lvl >= 3 ? 'ui.building.akvarium.incomeTrophy' : 'ui.building.akvarium.income', {
          income: U().money(aq.incomePerDay), perSpecies: U().money(T.aquariumPerSpecies), perTrophy: U().money(T.aquariumPerTrophy),
        }), 'greenLight', true);
      } else b.para(t('ui.building.akvarium.incomeLater'), 'grey', true);
      if (lvl < 3) { b.para(t('ui.building.akvarium.trophiesLater'), 'grey', true); return; }
      b.gap(4).section(t('ui.building.akvarium.trophies'), t('ui.building.akvarium.trophyCount', { got: aq.trophies.length, total: HL.data.allLegends.length }));
      S.rows.trophies = aq.trophies.length;
      HL.data.allLegends.forEach(function (l) {
        var got = aq.trophies.indexOf(l.id) >= 0;
        b.add(22, function (ctx, x, y) {
          D().sprite(ctx, HL.spr.get(got ? 'icon_trophy' : 'icon_lock'), x, y + 4);
          var th = got ? HL.ui.thumb(l.id, 32, 18) : null;
          if (th) D().sprite(ctx, th, x + 30 - Math.floor(th.width / 2), y + 10 - Math.floor(th.height / 2));
          F().draw(ctx, got ? l.name : '???', x + 50, y + 5, P(got ? 'yellow' : 'slate'), { maxWidth: BW - 50 });
        });
      });
    },

    // Lodenica (jadrové jazero): kam až sa v jazere dá, prečo nie hlbšie, pásma so zámkom a cesta na jazero.
    lodenica: function (b, s, lvl) {
      var acc = HL.village.lakeAccess(s), md = HL.village.lakeMaxDepth(s);
      var line = HL.util.byId(HL.data.lakeLines)[s.gear.lakeLine];
      if (lvl < 1) b.para(t('ui.building.lodenica.closed'), 'amber');
      b.section(t('ui.building.lodenica.lake'));
      b.add(16, function (ctx, x, y) {
        F().draw(ctx, t('ui.building.lodenica.deepest'), x, y + 2, P('greyLight'));
        F().draw(ctx, md > 0 ? U().meters(md) : '—', x + BW, y + 2, P(md > 0 ? 'yellow' : 'grey'), { align: 'right' });
      });
      var cap = HL.data.lakeShipyardDepth[Math.min(3, lvl)];
      var why = !line ? t('ui.building.lodenica.noLine')
        : md >= HL.data.LAKE_FLOOR ? t('ui.building.lodenica.floor')
          : md >= cap && md < line.maxDepth ? t('ui.building.lodenica.shipyardLimit', { level: lvl + 1 })
            : t('ui.building.lodenica.lineLimit', { line: lower1(line.name) });
      if (lvl >= 1) b.para(why, 'grey', true);
      b.gap(4).section(t('ui.building.lodenica.zones'));
      S.rows.zones = HL.data.lakeZones.length;
      HL.data.lakeZones.forEach(function (z) {
        var open = lvl >= z.needShipyard, rng = U().meters(z.from) + ' – ' + U().meters(z.to);
        b.add(14, function (ctx, x, y) {
          if (!open) D().sprite(ctx, HL.spr.get('icon_lock'), x, y + 1);
          F().draw(ctx, z.name, x + 14, y + 2, P(open ? 'white' : 'grey'), { maxWidth: BW - 70 });
          F().draw(ctx, rng, x + BW, y + 4, P(open ? 'greyLight' : 'slate'), { small: true, align: 'right' });
        });
      });
      b.gap(2).para(t('ui.building.lodenica.info'), 'grey', true);
      if (lvl >= 1 && !acc.ok) b.para(acc.reason, 'amber', true);
    },

    // Laboratórium (jadrové jazero): jazerné vlasce a prúty — ten istý obchod ako v Dielni.
    laboratorium: function (b, s, lvl) {
      if (lvl < 1) { b.para(t('ui.building.laboratorium.closed'), 'amber'); return; }
      var sh = HL.village.labShop(s);
      b.section(t('ui.building.laboratorium.lines'), t('ui.building.dielna.linesCols'));
      sh.lines.forEach(function (o) {
        var l = o.item;
        shopRow(b, o, 'line_' + l.id, l.name, t('ui.building.dielna.lineStats', { kg: U().kg(l.strength), depth: U().meters(l.maxDepth) }), 'lakeLine');
      });
      b.gap(4).section(t('ui.building.laboratorium.rods'), t('ui.building.dielna.rodsCols'));
      sh.rods.forEach(function (o) {
        var r = o.item;
        shopRow(b, o, 'rod_' + r.id, r.name, t('ui.building.dielna.rodStats', { pct: U().pct(r.progressBonus), ms: r.toleranceMs }), 'lakeRod');
      });
      b.para(t('ui.building.laboratorium.note'), 'grey', true);
    },

    trhovisko: function (b, s) {
      b.para(t('ui.building.trhovisko.info'), 'greyLight', true);
      action('b_market', function () { HL.go('market', { back: 'village' }); });
      b.add(28, function (ctx, x, y) { HL.w.button(ctx, 'b_market', x, y + 2, BW, 24, t('ui.building.trhovisko.open'), { style: 'primary', icon: 'icon_money' }); });
    },
  };

  // Akvárium: vystavené druhy plávajú sem a tam (poloha = funkcia času, bez stavu).
  function tank(ctx, x, y, w, h, aq) {
    var d = D(), time = S.t, A = HL.villageArt;
    d.rect(ctx, x, y, w, h, P('ink'));
    d.ditherGradient(ctx, x + 2, y + 2, w - 4, h - 4, P('blue'), P('blueDark'), 0, 1);
    d.rect(ctx, x + 2, y + h - 8, w - 4, 6, P('sand'));
    d.dither(ctx, x + 2, y + h - 8, w - 4, 2, P('sandLight'), 0.5);
    d.sprite(ctx, HL.spr.get('seaweed_a', Math.floor(time * 2) % 2), x + 4, y + h - 38);
    d.sprite(ctx, HL.spr.get('seaweed_b', Math.floor(time * 2 + 1) % 2), x + w - 18, y + h - 28);
    d.sprite(ctx, HL.spr.get('coral_b'), x + w / 2 - 9, y + h - 18);
    ctx.save(); ctx.beginPath(); ctx.rect(x + 2, y + 2, w - 4, h - 10); ctx.clip();
    var list = aq.species.slice(0, 18);
    for (var i = 0; i < list.length; i++) {
      var th = HL.ui.thumb(list[i], 22, 12);
      var len = w - 10 - th.width, sp = 6 + A.hash01(i, 3) * 10;
      var u = (A.hash01(i, 4) * len * 2 + time * sp) % (len * 2), right = u < len;
      var fx = x + 5 + Math.round(right ? u : len * 2 - u);
      var fy = y + 5 + (i % 7) * 11 + Math.round(Math.sin(time * 1.3 + i) * 2);
      d.sprite(ctx, th, fx, fy, { flip: !right });
    }
    for (var k = 0; k < 8; k++) {
      var by = y + h - 10 - ((time * (8 + k * 2) + A.hash01(k, 8) * 80) % (h - 12));
      d.px(ctx, x + 8 + Math.floor(A.hash01(k, 9) * (w - 16)), Math.round(by), P('cyan'));
    }
    ctx.restore();
    // odlesk skla
    d.rect(ctx, x + 4, y + 4, 1, 14, P('cyan'));
    d.rect(ctx, x + 6, y + 4, 1, 6, P('cyan'));
    if (!list.length) F().draw(ctx, t('ui.building.akvarium.empty'), x + w / 2, y + h / 2 - 6, P('white'), { align: 'center', shadow: P('ink') });
  }

  // ------------------------------------------------------------------ výklad a karta
  // Výklad: budova na kúsku dediny. Malá budova (úroveň 0–1) stála v prázdnom pruhu oblohy
  // (vizuálna kritika) — za kopcami je preto more s plachetnicami, po stranách stromy, pri
  // obývanej budove lampa a cez deň okolo prejde dedinčan a letia čajky.
  // Noc a hmla ako v dedine (HL.villageArt.nightShade / fog — po rampách palety, bez šachovnice).
  // Kreslí sa do vrstvy v pamäti (čítanie pixelov na plátne hry by čakalo na GPU) a na obrazovku
  // ide jedným drawImage.
  var SHOW_H = 103, SEA0 = 64, LAMP_DX = -12;
  function showcase(screen, env, lvl) {
    var d = D(), A = HL.villageArt, time = S.t, ctx = A.layer(W, SHOW_H) || screen;
    var winter = env.event === 'winter', night = A.isNight(env);
    A.sky(ctx, 0, HEAD, W, GROUND - HEAD, env);
    A.stars(ctx, 0, HEAD, W, 38, time, env);
    A.clouds(ctx, env, time, 0, HEAD, W, 30);
    var skyline = [];
    if (bdata(S.id).site === 'elektraren' && HL.plantArt) {
      // budova Starej elektrárne: za ňou veže a reaktor, nie more (docs/JAZERO.md); v noci sa stmavia s budovou (keep)
      skyline = HL.plantArt.backdrop(ctx, env, time, GROUND - 3) || [];
    } else {
      A.horizonSea(ctx, env, time, SEA0, GROUND - 10);
      A.hills(ctx, env, Math.floor(time * 0.5), W, GROUND - 2, 14, 1, night ? 'navy' : env.weather === 'sun' || env.weather === 'cloudy' ? 'greenDark' : 'slateDark');
    }
    d.rect(ctx, 0, GROUND, W, 102 - GROUND, P(winter ? 'white' : 'green'));
    d.rect(ctx, 0, GROUND, W, 1, P(winter ? 'greyLight' : 'greenLight'));
    d.dither(ctx, 0, GROUND + 3, W, 102 - GROUND - 3, P(winter ? 'greyLight' : 'greenDark'), 0.5);
    var name = 'bld_' + S.id + '_' + lvl, sz = HL.spr.size(name);
    var bx = Math.round(W / 2 - sz.w / 2), by = GROUND - (sz.h - 1);
    var lampX = bx + LAMP_DX, lamp = lvl > 0 && lampX > 34;
    if (lamp) d.sprite(ctx, HL.spr.get('lamp'), lampX, GROUND - 21);
    d.sprite(ctx, HL.spr.get(name), bx, by);
    if (lvl > 0 && !night && env.weather !== 'storm') {
      // dedinčan ide po lúke tam a späť (poloha je funkcia času, bez stavu)
      var span = 104, u = (time * T.villageWalk * 0.8) % (span * 2), right = u < span, vx = 38 + Math.round(right ? u : span * 2 - u);
      d.sprite(ctx, HL.spr.get(S.id.length % 2 ? 'villager_b' : 'villager_a', Math.floor(time * 4) % 2), vx - 4, GROUND - 13, { flip: !right });
    }
    var dark = A.darkness(env), lit = lvl > 0 && A.lightsOn(env);
    var lights = lit ? [{ x: W / 2, y: by + sz.h * 0.55, r: 18 + lvl * 4 }] : [];
    if (lit && lamp) lights.push({ x: lampX + 3, y: GROUND - 18, r: T.villageLampR });
    // Obloha, more na obzore aj kopce sa kreslia už nočnými farbami — stmavie sa lúka a budova
    // s lampou (po pixeloch spritu); v kruhu svetla by inak vyskočil dither nočného mora.
    var steps = dark > 0 ? A.nightShade(ctx, 0, HEAD, W, 102 - HEAD, dark, lights, GROUND,
      [{ name: name, x: bx, y: by }].concat(lamp ? [{ name: 'lamp', x: lampX, y: GROUND - 21 }] : [], skyline)) : 0;
    // stromy po stranách až po stmavení, rovno tmavšími farbami (sú mimo kruhov svetla)
    A.tree(ctx, 14, GROUND, winter, steps); A.bush(ctx, 29, GROUND - 2, winter, steps);
    A.tree(ctx, 167, GROUND, winter, steps); A.bush(ctx, 152, GROUND - 2, winter, steps);
    A.fog(ctx, env, time, 0, HEAD, W, 102 - HEAD, [{ name: name, x: bx, y: by }].concat(lamp ? [{ name: 'lamp', x: lampX, y: GROUND - 21 }] : []));
    if (lit) {
      d.sprite(ctx, HL.spr.get(name + '_lights'), bx, by);
      var lg = lamp && HL.spr.glowMask('lamp');
      if (lg) d.sprite(ctx, lg, lampX, GROUND - 21);
    }
    var sun = A.sunMoon(ctx, env, 16, 164, 58, 34);
    // čajky obletia slnko (čajka cez neho = "zákaz vjazdu", kritika D4 v dedine — tá istá trieda)
    A.gulls(ctx, env, time, 30, 2, sun && !sun.night ? { x: sun.x, y: sun.y, r: 7 } : null);
    ctx.save(); ctx.beginPath(); ctx.rect(0, HEAD, W, 102 - HEAD); ctx.clip();
    A.weatherFx(ctx, env, time, W, 102);
    ctx.restore();
    A.levelStars(ctx, W - 16, HEAD + 5, lvl);
    d.rect(ctx, 0, 102, W, 1, P('ink'));
    if (ctx !== screen) screen.drawImage(ctx.canvas, 0, 0, W, SHOW_H, 0, 0, W, SHOW_H);
  }

  // Koľko chýba: peniaze majú centy, ale ukazujú sa celé eurá. Zaokrúhlené 0,40 € by dalo
  // "Chýba 0 €" pri zakázanom Postaviť (review #25) — chýbajúca suma sa preto zaokrúhľuje NAHOR.
  // o = ponuka/upgradeInfo zo simulácie: rozhoduje KĽÚČ dôvodu (reasonKey), nie jeho text — ten je v jazyku hráča.
  function shortText(cost, money) { return t('ui.building.card.short', { money: U().money(Math.max(1, Math.ceil(cost - money - 1e-9))) }); }
  function reasonText(o, cost, money) { return o.reasonKey === 'sim.village.noMoney' ? shortText(cost, money) : o.reason; }

  function card(ctx, s, info) {
    var d = D(), f = F(), x = 4, y = CARD_Y, w = W - 8, sm = { small: true };
    d.panel(ctx, x, y, w, CARD_H);
    if (!info.next) {
      // Hotová budova: karta ukáže všetko, čo budova vie (tri úrovne), nie prázdne miesto.
      f.draw(ctx, t('ui.building.card.allBuilt'), x + 6, y + 3, P('amber'));
      var lv = bdata(S.id).levels;
      for (var i = 1; i <= 3; i++) {
        HL.villageArt.star(ctx, x + 6, y + 15 + (i - 1) * 11, true);
        f.draw(ctx, lv[i], x + 14, y + 15 + (i - 1) * 11, P('white'), { small: true, maxWidth: w - 20 });
      }
      return;
    }
    var label = info.level === 0 ? t('ui.building.card.build') : t('ui.building.card.upgrade');
    f.draw(ctx, info.level === 0 ? t('ui.building.card.building') : t('ui.building.card.level', { level: info.next }), x + 6, y + 3, P('amber'));
    var dl = f.wrap(info.desc, 104, sm);
    for (var j = 0; j < dl.length && j < 2; j++) f.draw(ctx, dl[j], x + 6, y + 15 + j * f.lineStep(sm), P('white'), sm);
    d.sprite(ctx, HL.spr.get('icon_money'), x + 6, y + 34);
    var costTxt = U().money(info.cost);
    f.draw(ctx, costTxt, x + 20, y + 35, P(s.money >= info.cost ? 'yellow' : 'pink'));
    // Po úspešnom vylepšení je tlačidlo chvíľu zakázané: stojí na tom istom mieste s cenou
    // ďalšej úrovne a druhý klik dvojkliku (alebo Enter-Enter, ktoré poistka widgetov nekryje)
    // by kúpil aj ďalšiu úroveň (review #18).
    var locked = S.upLock > 0;
    HL.w.button(ctx, 'b_upgrade', x + w - 60, y + 6, 55, 26, label, { style: info.ok && !locked ? 'primary' : null, disabled: !info.ok || locked, hotkey: 'KeyV' });
    action('b_upgrade', doUpgrade);
    if (!info.ok) {
      // Dôvod (napr. "Treba chytiť legendu Hmlistá dáma") sa LÁME na dva riadky vedľa ceny —
      // skrátený výpustkou nepovedal, ktorú legendu treba, a nikde inde na obrazovke nie je (#24).
      // (tests/unit/villageui.test.js overí pre každú budovu a úroveň, že sa zmestí celý)
      var rw = x + w - 5 - (x + 20 + f.measure(costTxt) + 6);
      var rl = f.wrap(reasonText(info, info.cost, s.money), rw, sm);
      for (var k = 0; k < rl.length && k < 2; k++) f.draw(ctx, rl[k], x + w - 5, y + 33 + k * f.lineStep(sm) + (rl.length === 1 ? 3 : 0), P('pink'), { small: true, align: 'right' });
    }
  }

  function bottomBar(ctx, s, lvl) {
    var d = D();
    S.barH = 0;
    if (S.id === 'chatrc') {
      S.barH = H - BAR_Y;
      d.rect(ctx, 0, BAR_Y, W, H - BAR_Y, P('ink'));
      d.rect(ctx, 0, BAR_Y, W, 1, P('slateDark'));
      var can = HL.village.canSleep(s);
      HL.w.button(ctx, 'b_sleep_morning', 4, BAR_Y + 4, 84, 26, t('ui.building.sleep.toMorning'), { icon: 'icon_sleep', disabled: !can, hotkey: 'KeyR', style: can ? 'primary' : null });
      HL.w.button(ctx, 'b_sleep_night', 92, BAR_Y + 4, 84, 26, t('ui.building.sleep.toNight'), { icon: 'icon_sleep', disabled: !can, hotkey: 'KeyN' });
      action('b_sleep_morning', function () { startSleep('morning'); });
      action('b_sleep_night', function () { startSleep('night'); });
    } else if (S.id === 'lodenica' && HL.village.lakeAccess(s).ok) {
      S.barH = H - BAR_Y;
      d.rect(ctx, 0, BAR_Y, W, H - BAR_Y, P('ink'));
      d.rect(ctx, 0, BAR_Y, W, 1, P('slateDark'));
      HL.w.button(ctx, 'b_lake', 20, BAR_Y + 3, 140, 28, t('ui.building.lodenica.go'), { style: 'primary' });
      action('b_lake', function () { HL.go('prep', { location: 'jadro', back: 'elektraren' }); });
    } else if (S.id === 'majak' && lvl >= 3) {
      S.barH = H - BAR_Y;
      d.rect(ctx, 0, BAR_Y, W, H - BAR_Y, P('ink'));
      d.rect(ctx, 0, BAR_Y, W, 1, P('slateDark'));
      HL.w.button(ctx, 'b_endless', 20, BAR_Y + 3, 140, 28, t('ui.building.majak.endlessButton'), { style: 'primary' });
      // späť z Nekonečnej hlbiny patrí do dediny, nie na titulku (review #23)
      action('b_endless', function () { HL.go('endless', { back: 'village' }); });
    }
  }

  // Plátno, ktoré nič nekreslí: položky zoznamu mimo výrezu sa "kreslia" doň (ich tlačidlá sa
  // zaregistrujú, ale nič sa nerastruje). Bez getImageData, takže D.shade ho preskočí.
  var NULL_CTX = (function () {
    function noop() {}
    return {
      canvas: { width: W, height: H }, fillStyle: null, globalAlpha: 1, imageSmoothingEnabled: false, globalCompositeOperation: 'source-over',
      fillRect: noop, drawImage: noop, save: noop, restore: noop, beginPath: noop, rect: noop, clip: noop, translate: noop, scale: noop,
      setTransform: noop, strokeRect: noop, putImageData: noop,
      getTransform: function () { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }; },
    };
  })();

  // Okraj zoznamu, za ktorým ešte niečo je (dole, a po posunutí aj hore), stmavne po rampách
  // palety v T.listFadeSteps pásoch — najtmavší pri samej hrane. Riadok rozrezaný hranou výrezu
  // (napr. "Oceľový vlasec" v Dielni) tak nekončí ostrým polovičným písmenom, ale zaniká
  // v tme a hovorí "pokračuje nižšie" (vizuálna kritika D2, kolo 2). Posuvník (2 px vpravo) sa
  // nestmavuje.
  //
  // Cena: čítať pixely z plátna hry by čakalo na GPU a čítanie vrstvy v pamäti ju musí najprv
  // dorastrovať (glyfy písma sú na GPU plátnach). Do vrstvy preto ide LEN to, čo zasahuje do
  // stmaveného okraja (1–2 položky), ostatné sa kreslí rovno na obrazovku a mimo výrezu do
  // NULL_CTX; okraj sa číta a zapisuje raz. Každá položka sa kreslí práve raz (tlačidlá sa
  // registrujú len raz). Merané (headless Edge, Dielňa 3, celý snímok): 2,4 ms bez okraja →
  // 4,3–4,4 ms s ním; T.listFadePx = 0 ho vypne (2,0–2,1 ms).
  function fadeGeom(viewH) {
    var sc = HL.w.scrollOf('body'), n = Math.max(1, Math.round(T.listFadeSteps)), band = Math.max(1, Math.round(T.listFadePx / n));
    if (!sc || !(T.listFadePx > 0) || !(sc.max > 0)) return null;
    var g = { n: n, band: band, fh: Math.min(n * band, Math.floor(viewH / 2)), bottom: sc.y < sc.max - 0.5, top: sc.y > 0.5 };
    return g.bottom || g.top ? g : null;
  }
  var fadeCache = {}, NAVY_RGB = parseInt(HL.pal.navy.slice(1), 16);
  function lumOf(v) { return 0.2126 * ((v >> 16) & 255) + 0.7152 * ((v >> 8) & 255) + 0.0722 * (v & 255); }
  function fadeRows(c, y0, g, fromTop) {
    // Obsah zaniká DO POZADIA zoznamu: stmavne po rampe, ale nie pod navy (inak by pozadie
    // okraja zčernelo na ink a spodok zoznamu by bol čierny pruh), a čo je tmavšie než navy
    // (obrysy ink), splynie s navy.
    var img = c.getImageData(0, y0, W - 2, g.fh), d = img.data, lastIn = -1, lastOut = 0, lastS = -1;
    function fade(v, s) {
      var k = v + '|' + s, o = fadeCache[k];
      if (o === undefined) {
        o = HL.pal.darkerRGB(v, s);
        if (lumOf(o) < lumOf(NAVY_RGB)) o = NAVY_RGB;
        if (Object.keys(fadeCache).length > 512) fadeCache = {};
        fadeCache[k] = o;
      }
      return o;
    }
    for (var row = 0; row < g.fh; row++) {
      var r = fromTop ? row : g.fh - 1 - row; // r = 0 pri samej hrane
      var s = Math.max(0, g.n - Math.floor(r / g.band));
      if (s <= 0) continue;
      for (var i = row * (W - 2) * 4, e = i + (W - 2) * 4; i < e; i += 4) {
        var v = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
        if (v !== lastIn || s !== lastS) { lastIn = v; lastS = s; lastOut = fade(v, s); }
        d[i] = lastOut >> 16; d[i + 1] = (lastOut >> 8) & 255; d[i + 2] = lastOut & 255; d[i + 3] = 255;
      }
    }
    c.putImageData(img, 0, y0);
  }
  function drawList(ctx, body, viewH) {
    var sy = HL.w.beginScroll(ctx, 'body', 0, BODY_Y, W, viewH, body.h) || 0;
    var g = fadeGeom(viewH), lc = g ? HL.villageArt.layer(W, H) : null, bands = [], blit = [];
    if (lc && !lc.getImageData) lc = null;
    if (lc) {
      // okraje v súradniciach obrazovky: [y0, y1)
      if (g.bottom) bands.push([BODY_Y + viewH - g.fh, BODY_Y + viewH, false]);
      if (g.top) bands.push([BODY_Y, BODY_Y + g.fh, true]);
      bands.forEach(function (b) { D().rect(lc, 0, b[0], W, b[1] - b[0], P('navy')); blit.push([b[0], b[1]]); });
      lc.save(); lc.beginPath(); lc.rect(0, BODY_Y, W, viewH); lc.clip(); lc.translate(0, -sy);
    }
    for (var i = 0; i < body.items.length; i++) {
      var it = body.items[i], a = BODY_Y + it.y - sy, b = a + it.h; // riadky položky na obrazovke
      var vis = b > BODY_Y - 2 && a < BODY_Y + viewH + 2, target = vis ? ctx : NULL_CTX;
      if (vis && lc && bands.some(function (r) { return b > r[0] && a < r[1]; })) {
        target = lc;
        D().rect(lc, 0, BODY_Y + it.y, W, it.h, P('navy')); // pozadie zoznamu pod položkou (lc je posunutá o -sy)
        blit.push([Math.max(BODY_Y, a), Math.min(BODY_Y + viewH, b)]);
      }
      it.fn(target, M, BODY_Y + it.y);
    }
    HL.w.endScroll(ctx);
    if (!lc) return;
    lc.restore();
    bands.forEach(function (b) { fadeRows(lc, b[0], g, b[2]); });
    // posuvník (posledné 2 px vpravo) kreslí endScroll na obrazovku — z vrstvy sa neprenáša
    blit.forEach(function (r) { if (r[1] > r[0]) ctx.drawImage(lc.canvas, 0, r[0], W - 2, r[1] - r[0], 0, r[0], W - 2, r[1] - r[0]); });
  }

  function sleepOverlay(ctx) {
    var sl = S.sleep, fade = T.sleepFadeSec, hold = T.sleepHoldSec, lv;
    if (sl.t < fade) lv = sl.t / fade;
    else if (sl.t < fade + hold) lv = 1;
    else lv = Math.max(0, 1 - (sl.t - fade - hold) / fade);
    // Stmievanie po rampách palety (6 krokov = všetko v ink), nie ink šachovnicou — tá robila
    // z celej obrazovky na 1× mriežku (vizuálna kritika D9, "a všade inde").
    if (lv >= 1) D().rect(ctx, 0, 0, W, H, P('ink'));
    else D().shade(ctx, 0, 0, W, H, Math.round(lv * 6));
    if (lv >= 1) {
      F().draw(ctx, t('ui.building.sleep.sleeping'), W / 2, 140, P('greyLight'), { align: 'center', scale: 2 });
      for (var i = 0; i < 3; i++) { // tri stúpajúce 'z' = chrápanie (znak, nie slovo — v každom jazyku rovnaký)
        var zt = (sl.t * 1.5 + i * 0.33) % 1;
        F().draw(ctx, 'z', W / 2 + 26 + i * 6 + Math.round(zt * 6), 132 - i * 7 - Math.round(zt * 10), P(i === 2 ? 'white' : 'grey'), { small: i < 2 });
      }
    }
  }

  // ------------------------------------------------------------------ scéna
  HL.scenes.def('building', {
    enter: function (p) {
      p = p || {};
      var id = p.id || (HL.query && HL.query.id);
      if (!bdata(id)) { HL.go('village'); id = 'chatrc'; }
      // budova elektrárne vedie späť do elektrárne, dedinská do dediny
      S.home = bdata(id).site || 'village';
      S.id = id; S.t = 0; S.sleep = null; S.lastSleep = null; S.actions = {}; S.upLock = 0;
      S.fx = HL.fx.create({ w: W, h: H, seed: 21 });
      HL.w.nav = true;
      // Klávesnica začína na šípke späť, nie na prvom tlačidle (to je drahé Vylepšiť, v Dielni
      // za ním Kúpiť): Enter-Enter z dediny by inak hneď po otvorení budovy minul stovky eur.
      HL.w.setFocus('back');
      if (HL.music) HL.music.set('village');
      if (HL.audio && HL.audio.ambience) HL.audio.ambience('village');
    },
    exit: function () { if (HL.audio && HL.audio.ambience) HL.audio.ambience(null); },

    update: function (dt) {
      S.t += dt;
      S.fx.update(dt);
      if (S.upLock > 0) S.upLock = Math.max(0, S.upLock - dt);
      if (S.sleep) { stepSleep(dt); return; } // počas spánku sa nič nestláča
      for (var id in S.actions) {
        if (HL.w.clicked(id)) { S.actions[id](); return; }
      }
      // Klik na šípku už cvakol (main.js); vlastný zvuk späť len pre Esc/Backspace.
      if (HL.ui.backPressed()) { if (HL.input.actionPressed('back')) HL.ui.sfx('ui_back'); HL.go(S.home || 'village'); }
    },

    draw: function (ctx) {
      var s = save(), env = HL.game.env(), lvl = HL.village.level(s, S.id), b = bdata(S.id);
      S.actions = {}; S.rows = {};
      var info = S.info = HL.village.upgradeInfo(s, S.id);

      showcase(ctx, env, lvl);
      // Pozadie zoznamu plné navy: ink šachovnica za textom bola 1-px šum pod každým riadkom
      // (vizuálna kritika D9 — trieda "šachovnica cez veľkú plochu").
      D().rect(ctx, 0, 103, W, H - 103, P('navy'));
      card(ctx, s, info);

      // obsah budovy
      var body = new Body();
      if (lvl < 3) body.para(t('ui.building.now', { what: b.levels[lvl] }), lvl ? 'greyLight' : 'grey');
      (BODIES[S.id] || BODIES.trhovisko)(body, s, lvl, env);
      body.gap(6);
      S.body = body;
      bottomBar(ctx, s, lvl);
      var viewH = (S.barH ? BAR_Y : H) - BODY_Y - 2;
      S.bodyH = body.h; S.viewH = viewH;
      // Kreslí sa všetko, aj mimo výrezu: tlačidlá mimo obrazovky sa musia zaregistrovať, inak
      // by sa k nim klávesnica nedostala a zoznam by sa k nim neposunul (drawList: mimo výrezu
      // do NULL_CTX, okraj so stmavením cez vrstvu v pamäti).
      drawList(ctx, body, viewH);

      HL.ui.header(ctx, b.name, { back: true, money: true, sub: lvl ? t('ui.building.levelOf', { level: lvl }) : t('ui.building.notBuilt.' + S.id) });
      S.fx.draw(ctx, W, H);
      if (S.sleep) sleepOverlay(ctx);
    },

    drawPanel: function (ctx, side, pw, ph) {
      var s = save(), d = D(), f = F(), x = 8, w = pw - 16, y = 8;
      d.panel(ctx, 2, 2, pw - 4, ph - 4);
      if (side === 'L') {
        y = HL.ui.section(ctx, x, y, w, t('ui.building.panel.levels'));
        var b = bdata(S.id), lvl = HL.village.level(s, S.id), sm = { small: true }, ls = LS();
        for (var i = 1; i <= 3; i++) {
          HL.villageArt.star(ctx, x, y + 2, lvl >= i);
          var lines = f.wrap(HL.ui.nb(b.levels[i]), w - 9, sm);
          for (var k = 0; k < lines.length; k++) f.draw(ctx, lines[k], x + 9, y + 1 + k * ls, P(lvl >= i ? 'white' : 'grey'), sm);
          var yy = y + 1 + lines.length * ls; // cena je ďalší riadok toho istého bloku
          if (b.cost[i - 1] != null && lvl < i) { f.draw(ctx, U().money(Math.round(b.cost[i - 1] * T.costScale)), x + 9, yy, P('yellow'), sm); yy += ls; }
          y = Math.max(y + 12, yy) + 3;
        }
      } else {
        var site = bdata(S.id).site;
        y = HL.ui.section(ctx, x, y, w, site ? t('ui.building.panel.plant') : t('ui.building.panel.village'));
        HL.data.buildings.filter(function (bd) { return bd.site === site; }).forEach(function (bd) {
          var l = HL.village.level(s, bd.id);
          f.draw(ctx, bd.name, x, y, P(bd.id === S.id ? 'yellow' : 'white'), { small: true, maxWidth: w - 20 });
          for (var i2 = 0; i2 < 3; i2++) d.rect(ctx, x + w - 17 + i2 * 6, y + 1, 4, 4, P(i2 < l ? 'amber' : 'slateDark'));
          y += 11;
        });
        y += 6;
        y = HL.ui.section(ctx, x, y, w, t('ui.building.panel.storage'));
        var cap = HL.village.storageCap(s);
        f.draw(ctx, s.storage.length + ' / ' + cap, x, y, P('white'), { small: true });
      }
    },

    probe: function () {
      var s = save(), info = S.info || HL.village.upgradeInfo(s, S.id), sc = HL.w.scrollOf('body');
      return {
        id: S.id, level: HL.village.level(s, S.id), next: info.next, canUpgrade: info.ok, cost: info.cost, reason: info.reason || null,
        actions: Object.keys(S.actions), rows: S.rows, bodyH: S.bodyH, viewH: S.viewH || 0, scroll: sc,
        upgradeLocked: S.upLock > 0, sleeping: !!S.sleep, lastSleep: S.lastSleep ? { ok: S.lastSleep.ok, from: S.lastSleep.from, to: S.lastSleep.to, days: S.lastSleep.days, income: S.lastSleep.income, prize: S.lastSleep.prize || 0 } : null,
        clock: s.clock, storage: s.storage.length, gear: { line: s.gear.line, rod: s.gear.rod, hook: s.gear.hook, harpoons: s.gear.harpoons },
        baits: { shell: s.baits.shell, squid: s.baits.squid, glow: s.baits.glow, gold: s.baits.gold },
      };
    },
  });
})(globalThis.HL);
