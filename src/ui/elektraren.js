// Stará elektráreň (docs/JAZERO.md) — obrazovka pri jadrovom jazere: dve budovy (Lodenica, Laboratórium),
// chladiace veže a reaktor za plotom, jazero dole a tlačidlo NA JAZERO. Ten istý jazyk ako dedina
// (ui/village.js): obloha, počasie, noc po rampách palety a hmla z HL.villageArt, odznak „!" a menovka
// budovy, tlačidlá deklarované v draw() a čítané v update().
//
// Pohľad: stojíme na vode a pozeráme na breh (ako v dedine). Jazero je DOLE, preto NA JAZERO leží pri
// vode. Elektráreň je cieľ do budúcna: dá sa sem prísť od začiatku (rázcestník v dedine), ale Lodenica
// sa dá postaviť až s Dielňou 2 — karta budovy to povie.
//
// HL.plantArt.backdrop = kulisa elektrárne (kopce, veže s parou, reaktor, komín, stĺpy, plot) — kreslí ju
// aj výklad budovy (ui/building.js) a hladina jazera v ponore, aby to bolo jedno miesto.
(function (HL) {
  var T = HL.T;
  var i18n = HL.i18n;
  T.def('Elektráreň', 'plantSteamSec', 0.6, 0.1, 3, 0.05, 'Elektráreň: ako dlho trvá jeden snímok pary nad vežou (s)');
  T.def('Elektráreň', 'plantGlowN', 10, 0, 40, 1, 'Elektráreň: počet svetielok vo vode jazera v noci (0 = bez)');
  T.def('Elektráreň', 'plantWaterWave', 1, 0, 4, 1, 'Elektráreň: vlnenie odleskov na jazere (px)');

  var W = 180, H = 320, HEAD = 22, BAR_Y = 288, LAKE_Y = 240, FENCE_Y = 170, HORIZON = 172;
  // x = ľavý okraj rezervovaného miesta, w = šírka budovy na úrovni 3, gy = riadok zeme (ako dedina)
  var PLOTS = [
    { id: 'lodenica', x: 8, w: 56, gy: LAKE_Y + 1 },
    { id: 'laboratorium', x: 104, w: 56, gy: 206 },
  ];

  function P(n) { return HL.pal[n]; }
  function A() { return HL.villageArt; }
  function save() { return HL.game.save; }
  function level(id) { return HL.village.level(save(), id); }
  function h01(i, salt) { return HL.hash(i | 0, salt | 0) / 4294967296; }

  // ------------------------------------------------------------------ kulisa (aj pre iné scény)
  var Art = HL.plantArt = {};
  function towerColors(env) {
    var a = A(), night = a.darkness(env) > 0.3;
    return night ? 'navy' : env.weather === 'fog' || env.weather === 'rain' || env.weather === 'storm' ? 'slate' : 'tealDark';
  }
  // Kulisa stojí v pásme OBLOHY (nad obzorom), ktoré nočné stmavenie scén (HL.villageArt.nightShade) nechá tak —
  // obloha sa kreslí už nočnými farbami. Bez ďalšieho by veže a reaktor svietili v noci denne nad stmavenou zemou
  // (elektráreň, výklad budovy aj obzor ponoru — tá istá trieda, revízia 2026-10-02). Preto backdrop/fence VRÁTIA
  // zoznam nakreslených spritov: scény s nightShade ich dajú do `keep` (stmavia sa raz, ako budovy dediny trčiace do
  // oblohy), ponor (bez nightShade) ich kreslí rovno stmavené (preShade) o tie isté kroky rampy palety.
  var shadeCache = {}, shadeN = 0;
  function shaded(name, frame, steps) {
    if (!(steps > 0)) return HL.spr.get(name, frame);
    var key = name + '#' + frame + '#' + steps;
    if (shadeCache[key]) return shadeCache[key];
    var b = HL.spr.bitmap(name, frame), c = b && HL.draw.canvas(b.w, b.h);
    if (!c) return HL.spr.get(name, frame);
    var x = c.getContext('2d'), img = x.createImageData(b.w, b.h), px = img.data;
    for (var i = 0; i < b.d.length; i++) {
      var v = b.d[i];
      if (!v) continue;
      var n = parseInt(HL.pal.darker(HL.pal.names[v - 1], steps).slice(1), 16);
      px[i * 4] = n >> 16; px[i * 4 + 1] = (n >> 8) & 255; px[i * 4 + 2] = n & 255; px[i * 4 + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    if (++shadeN > 120) { shadeCache = {}; shadeN = 1; }
    return (shadeCache[key] = c);
  }
  Art.shadeSteps = function (env) { var a = A(); return a.shadeSteps ? a.shadeSteps(a.darkness(env)) : 0; };
  // Kulisa elektrárne s dolným okrajom (zem kulís) v base: kopce, stĺpy, veže s parou, reaktor, komín. Kopce majú
  // nočnú farbu samy (towerColors). preShade = sprity rovno stmavené (ponor). Vráti [{ name, x, y, frame }].
  Art.backdrop = function (ctx, env, t, base, preShade) {
    var a = A(), D = HL.draw, spr = HL.spr, steps = preShade ? Art.shadeSteps(env) : 0, drawn = [];
    function get(name, f) { return shaded(name, f || 0, steps); }
    function put(name, f, x, y) { D.sprite(ctx, get(name, f), x, y); drawn.push({ name: name, frame: f || 0, x: x, y: y }); }
    a.hills(ctx, env, 0, W, base - 2, 16, 3, towerColors(env));
    var pylon = get('el_pylon');
    [[2, 0], [150, 1]].forEach(function (p) { put('el_pylon', 0, p[0], base - pylon.height + 2 - p[1] * 4); });
    // drôty medzi stĺpmi (prevesené, 1 px)
    var py0 = base - pylon.height + 6, py1 = base - pylon.height + 2;
    for (var x = 2 + pylon.width; x < 150; x++) {
      var u = (x - 2 - pylon.width) / (148 - pylon.width), sag = Math.round(Math.sin(u * Math.PI) * 6);
      D.px(ctx, x, Math.round(py0 + (py1 - py0) * u) + sag, P('slateDark'));
    }
    var tower = get('el_tower'), steamN = Math.max(1, spr.frames('el_steam'));
    var towers = [16, 54];
    for (var i = 0; i < towers.length; i++) {
      var tx = towers[i], ty = base - tower.height + 1;
      put('el_tower', 0, tx, ty);
      var fr = Math.floor(t / Math.max(0.1, T.plantSteamSec) + i) % steamN, st = get('el_steam', fr);
      put('el_steam', fr, tx + Math.floor((tower.width - st.width) / 2) + (i ? 2 : -1), ty - st.height + 3);
    }
    var reactor = get('el_reactor');
    put('el_reactor', 0, 98, base - reactor.height + 1);
    var chimney = get('el_chimney');
    put('el_chimney', 0, 164, base - chimney.height + 1);
    return drawn;
  };
  // Plot so značkami pozdĺž riadku y (spodok plotu). Vráti [{ name, x, y }] (do keep nočného stmavenia — plot trčí nad obzor).
  Art.fence = function (ctx, y, x0, x1) {
    var D = HL.draw, fence = HL.spr.get('el_fence'), sign = HL.spr.get('el_sign'), drawn = [];
    for (var x = x0; x < x1; x += fence.width) { D.sprite(ctx, fence, x, y - fence.height + 1); drawn.push({ name: 'el_fence', x: x, y: y - fence.height + 1 }); }
    for (var k = 0; k < 3; k++) { D.sprite(ctx, sign, x0 + 26 + k * 58, y - fence.height + 3); drawn.push({ name: 'el_sign', x: x0 + 26 + k * 58, y: y - fence.height + 3 }); }
    return drawn;
  };
  // Prechod dvoch farieb po RIADKOCH (pruhy ako voda v ponore), nie šachovnicou: slepý kritik kolo 3 (P1) — lúka aj jazero
  // boli tá istá zelená šachovnica a jazero sa čítalo ako ďalšia lúka. V bloku `blk` riadkov má farba B podiel u (u0 → u1).
  function bandGradient(ctx, x, y, w, h, cA, cB, u0, u1, blk) {
    blk = blk || 6;
    var runY = y, runC = null;
    for (var r = 0; r <= h; r++) {
      var c = null;
      if (r < h) { var u = u0 + (u1 - u0) * (r / Math.max(1, h - 1)), nB = Math.round(u * blk); c = (r % blk) >= blk - nB ? cB : cA; }
      if (c !== runC) { if (runC) HL.draw.rect(ctx, x, runY, w, y + r - runY, runC); runY = y + r; runC = c; }
    }
  }
  Art.bands = bandGradient;
  // Hladina jazera od y0 po y1: odlesky, v noci svetielka (žiara z hĺbky). O stupeň TMAVŠIA než lúka nad brehom
  // (lúka zelená → tmavozelená, jazero tmavozelená → tmavotyrkysová), aby sa voda nečítala ako tráva (kolo 3, J9).
  Art.lake = function (ctx, env, t, y0, y1) {
    var a = A(), D = HL.draw, night = a.darkness(env) > 0.3, wet = env.weather === 'rain' || env.weather === 'storm';
    Art.bands(ctx, 0, y0, W, y1 - y0, P(night ? 'tealDark' : 'greenDark'), P(night ? 'ink' : 'tealDark'), 0, 0.85);
    D.rect(ctx, 0, y0, W, 1, P(night ? 'greenDark' : wet ? 'grey' : 'greyLight'));   // odraz oblohy (nie greenLight — ten patrí boju)
    var amp = Math.max(0, Math.round(T.plantWaterWave));
    for (var i = 0; i < 16; i++) {
      var y = y0 + 3 + (i % 6) * 7, x = Math.round((h01(i, 61) * W + t * (2 + (i % 3))) % W);
      if (y >= y1 - 1) continue;
      if (Math.sin(t * 1.7 + i) > -0.3) D.rect(ctx, x, y + Math.round(Math.sin(t + i) * amp * 0.5), 2 + (i % 4 > 1 ? 2 : 0), 1, P(night ? 'green' : 'greyLight'));
    }
    // trstina pri brehu (vpravo; vľavo stojí Lodenica)
    for (var r = 0; r < 9; r++) {
      var rx = 150 + Math.floor(h01(r, 62) * 28), rh = 4 + Math.floor(h01(r, 63) * 6), sw = Math.round(Math.sin(t * 1.3 + r) * 0.6);
      D.rect(ctx, rx + sw, y0 - rh + 2, 1, rh, P(r % 3 ? 'greenDark' : 'green'));
      if (r % 3 === 0) D.rect(ctx, rx + sw, y0 - rh + 1, 1, 2, P('wood'));
    }
  };
  // Svetielka v jazere (kreslia sa NAD tmou, ako okná): žiara mutantov z hĺbky. Vráti počet.
  Art.glints = function (ctx, env, t, y0, y1) {
    var a = A(), D = HL.draw, n = a.darkness(env) > 0.3 ? Math.round(T.plantGlowN) : 0;
    for (var i = 0; i < n; i++) {
      var x = Math.round((h01(i, 71) * W + Math.sin(t * 0.4 + i) * 6 + W) % W), y = y0 + 4 + Math.floor(h01(i, 72) * Math.max(1, y1 - y0 - 6));
      var on = Math.sin(t * (0.8 + h01(i, 73)) + i * 1.7) > 0.2;
      if (on) D.px(ctx, x, y, P(i % 3 ? 'greenLight' : 'cyan'));
    }
    return n;
  };

  // ------------------------------------------------------------------ zem (raz do vrstvy)
  // winter = Zimný lov: sneh na tráve, betóne aj chodníku (ako zem dediny a výklad budovy — revízia 2026-10-02:
  // elektráreň mala v decembri zelenú lúku pod snežením). Jazero ostáva otvorené ako more v dedine; ľad je len v ponore.
  function ground(ctx, winter) {
    var D = HL.draw;
    // betónová plocha pri plote, svah s trávou k brehu
    D.rect(ctx, 0, FENCE_Y, W, 206 - FENCE_Y, P(winter ? 'greyLight' : 'grey'));
    D.rect(ctx, 0, FENCE_Y, W, 1, P(winter ? 'white' : 'greyLight'));
    for (var k = 0; k < 6; k++) D.rect(ctx, k * 32 + 10, FENCE_Y + 6 + (k % 2) * 9, 14, 1, P(winter ? 'grey' : 'slate')); // škáry v betóne
    D.rect(ctx, 0, 206, W, LAKE_Y - 206, P(winter ? 'white' : 'green'));
    Art.bands(ctx, 0, 216, W, LAKE_Y - 216, P(winter ? 'white' : 'green'), P(winter ? 'greyLight' : 'greenDark'), 0, 0.5);
    D.rect(ctx, 0, 206, W, 2, P('slate'));            // múrik terasy
    D.rect(ctx, 0, 208, W, 1, P('slateDark'));
    for (var g = 0; g < 40; g++) {
      var gx = Math.floor(h01(g, 81) * W), gy = 212 + Math.floor(h01(g, 82) * (LAKE_Y - 216));
      D.px(ctx, gx, gy, P(winter ? (g % 3 ? 'greyLight' : 'grey') : g % 5 ? 'greenLight' : 'yellow'));
    }
    // chodník od terasy k lodenici
    for (var sy = 209; sy < LAKE_Y - 2; sy += 4) { D.rect(ctx, 74, sy, 6, 2, P(winter ? 'white' : 'sand')); D.rect(ctx, 74, sy + 2, 6, 1, P('clay')); }
    // breh
    D.rect(ctx, 0, LAKE_Y - 3, W, 3, P('wood'));
    D.rect(ctx, 0, LAKE_Y - 3, W, 1, P('woodLight'));
  }

  // ------------------------------------------------------------------ scéna
  var S = { t: 0, fx: null, plots: [], hover: null, counts: {}, env: null, access: null, told: false };

  function plotSprite(p, lvl) {
    var name = 'bld_' + p.id + '_' + lvl, sz = HL.spr.size(name);
    return { name: name, w: sz.w, h: sz.h, x: p.x + Math.floor((p.w - sz.w) / 2), y: p.gy - (sz.h - 1) };
  }
  function drawPlot(ctx, p) {
    var lvl = level(p.id), sp = plotSprite(p, lvl);
    HL.draw.sprite(ctx, HL.spr.get(sp.name), sp.x, sp.y);
    return { p: p, level: lvl, name: sp.name, sx: sp.x, sy: sp.y, sw: sp.w, sh: sp.h };
  }

  function bottomBar(ctx, acc) {
    var D = HL.draw;
    D.rect(ctx, 0, BAR_Y, W, H - BAR_Y, P('ink'));
    D.rect(ctx, 0, BAR_Y, W, 1, P('slateDark'));
    HL.w.button(ctx, 'go_encyclopedia', 4, BAR_Y + 4, 30, 26, '', { icon: 'icon_book' });
    HL.w.button(ctx, 'go_lake', 38, BAR_Y + 3, 104, 28, i18n.t('ui.village.plant.toLake'), { style: acc.ok ? 'primary' : null, disabled: !acc.ok, hotkey: acc.ok ? 'Enter' : null, autofocus: acc.ok });
    HL.w.button(ctx, 'go_settings', W - 34, BAR_Y + 4, 30, 26, '', { icon: 'icon_gear' });
    if (!acc.ok) {
      // prečo sa ešte nedá: papierik nad lištou (celá veta, nie skratka)
      var F = HL.font, lines = F.wrap(HL.ui.nb(acc.reason), W - 16, { small: true }), ls = F.lineStep({ small: true });
      var hgt = lines.length * ls + 5, y = BAR_Y - hgt - 2;
      D.panel(ctx, 4, y, W - 8, hgt, 'paper');
      for (var i = 0; i < lines.length; i++) F.draw(ctx, lines[i], 8, y + 2 + i * ls, P('wood'), { small: true });
    }
  }

  HL.scenes.def('elektraren', {
    enter: function (p) {
      HL.w.nav = true;
      if (p && p.trip && p.trip.dives > 0 && HL.data.tripLine) HL.ui.toast(HL.data.tripLine(p.trip), 'info');
      S.t = 0; S.hover = null;
      S.fx = HL.fx.create({ w: W, h: H, seed: 31 });
      var s = save();
      if (!(s.tutorial && s.tutorial.seen && s.tutorial.seen.plant)) {
        if (!s.tutorial) s.tutorial = { seen: {} };
        if (!s.tutorial.seen) s.tutorial.seen = {};
        s.tutorial.seen.plant = true;
        HL.ui.toast(i18n.t('ui.village.plant.intro'), 'info');
        HL.game.persist();
      }
      if (HL.music) HL.music.set('village');
      if (HL.audio && HL.audio.ambience) HL.audio.ambience('village');
    },
    exit: function () { if (HL.audio && HL.audio.ambience) HL.audio.ambience(null); },

    update: function (dt) {
      S.t += dt;
      S.fx.update(dt);
      // Skratka Enter pre NA JAZERO sa aktivuje SPOLU s tlačidlom, na ktorom je fokus — hráč chcel to, na
      // ktorom stojí: budovy, kniha, ozubené koliesko a šípka späť majú prednosť (ako v dedine; revízia
      // 2026-10-02: Enter na knihe otvoril prípravu na jazero).
      for (var i = 0; i < PLOTS.length; i++) {
        if (HL.w.clicked('bld_' + PLOTS[i].id)) { HL.go('building', { id: PLOTS[i].id }); return; }
      }
      if (HL.w.clicked('go_encyclopedia')) { HL.go('encyclopedia', { back: 'elektraren' }); return; }
      if (HL.w.clicked('go_settings')) { HL.go('settings', { back: 'elektraren' }); return; }
      if (HL.ui.backPressed()) { if (HL.input.actionPressed('back')) HL.ui.sfx('ui_back'); HL.go('village'); return; }
      if (HL.w.clicked('go_lake')) {
        var acc = HL.village.lakeAccess(save());
        if (acc.ok) HL.go('prep', { location: 'jadro', back: 'elektraren' });
        else { HL.ui.toast(acc.reason, 'bad'); HL.ui.sfx('error'); }
      }
    },

    draw: function (screen) {
      var a = A(), ctx = a.layer(W, H) || screen, D = HL.draw;
      var env = S.env = HL.game.env(), s = save(), t = S.t;
      var dark = a.darkness(env), lit = a.lightsOn(env);
      var acc = S.access = HL.village.lakeAccess(s);

      a.sky(ctx, 0, HEAD, W, HORIZON - HEAD, env);
      a.stars(ctx, 0, HEAD, W, 70, t, env);
      a.clouds(ctx, env, t, 0, HEAD, W, 44);
      var skyline = Art.backdrop(ctx, env, t, FENCE_Y);
      var winter = env.event === 'winter';
      D.sprite(ctx, a.cached('plant-ground:' + winter, W, LAKE_Y, function (g) { ground(g, winter); }), 0, 0);
      skyline = skyline.concat(Art.fence(ctx, FENCE_Y + 2, 0, W));

      var plots = [];
      plots.push(drawPlot(ctx, PLOTS[1]));
      Art.lake(ctx, env, t, LAKE_Y, BAR_Y);
      plots.push(drawPlot(ctx, PLOTS[0]));

      // noc: stmavenie po rampách palety s kruhmi svetla budov, potom hmla, navrch okná a svetielka
      var lights = [], steps = 0;
      if (dark > 0) {
        if (lit) for (var q = 0; q < plots.length; q++) if (plots[q].level > 0) lights.push({ x: plots[q].sx + plots[q].sw / 2, y: plots[q].sy + plots[q].sh * 0.55, r: T.villageWindowR + plots[q].level * 2 });
        // kulisa a plot trčia nad obzor (do pásma oblohy) — stmavia sa ako budovy dediny nad obzorom (keep)
        steps = a.nightShade(ctx, 0, HEAD, W, BAR_Y - HEAD, dark, lights, HORIZON, skyline);
      }
      a.fog(ctx, env, t, 0, HEAD, W, BAR_Y - HEAD, plots.map(function (pl) { return { name: pl.name, x: pl.sx, y: pl.sy }; }));
      if (lit) for (var q2 = 0; q2 < plots.length; q2++) if (plots[q2].level > 0) D.sprite(ctx, HL.spr.get(plots[q2].name + '_lights'), plots[q2].sx, plots[q2].sy);
      var glints = Art.glints(ctx, env, t, LAKE_Y + 2, BAR_Y);
      var sm = a.sunMoon(ctx, env, 14, 118, 52, 32);
      if (dark >= 0.3) a.stars(ctx, 0, HEAD, W, 40, t, env);
      a.weatherFx(ctx, env, t, W, H);

      // UI nad tmou: hviezdy úrovní, odznak „!", menovky
      S.hover = null;
      var labels = [];
      // Kým je jazero zamknuté, NA JAZERO je vypnuté a fokus pri príchode patrí budove, ktorá je ďalším krokom
      // (bez Lodenice Lodenica, potom Laboratórium s vlascom a prútom) — inak padol na prvú registrovanú budovu
      // a menovka ukazovala Laboratórium, ktoré sa ešte postaviť nedá (revízia 2026-10-02).
      var next = acc.ok ? null : level('lodenica') < 1 ? 'lodenica' : 'laboratorium';
      for (var k = 0; k < plots.length; k++) {
        var pl = plots[k], info = HL.village.upgradeInfo(s, pl.p.id);
        a.levelStars(ctx, pl.p.x + pl.p.w / 2, pl.p.gy + 3, pl.level);
        pl.badge = null;
        if (info.ok) { pl.badge = '!'; a.badge(ctx, pl.sx + pl.sw - 3, pl.sy - 4, t, k); }
        var hy = Math.min(pl.sy - 2, pl.p.gy - 24);
        pl.hit = { x: pl.p.x, y: hy, w: pl.p.w, h: pl.p.gy + 9 - hy };
        var st = HL.w.hit('bld_' + pl.p.id, pl.hit.x, pl.hit.y, pl.hit.w, pl.hit.h, { autofocus: pl.p.id === next });
        if (st.hover || st.focus) { labels.push(pl); if (st.hover) S.hover = pl.p.id; }
      }
      for (var lb = 0; lb < labels.length; lb++) a.nameTag(ctx, labels[lb], s);
      S.plots = plots;
      S.counts = { lights: lights.length, shadeSteps: steps, glints: glints, sun: sm };

      S.fx.draw(ctx, W, H);
      HL.ui.header(ctx, i18n.t('ui.village.plant.name'), {
        back: true, money: true,
        sub: HL.world.dayLabel(env.m) + ' · ' + HL.world.clockLabel(env.m) + ' · ' + HL.world.weatherName(env.weather, env.m),
      });
      bottomBar(ctx, acc);
      if (ctx !== screen) screen.drawImage(ctx.canvas, 0, 0);
    },

    drawPanel: function (ctx, side, pw, ph) {
      var s = save(), D = HL.draw, F = HL.font, x = 8, w = pw - 16, y = 8, sm = { small: true }, ls = F.lineStep(sm);
      D.panel(ctx, 2, 2, pw - 4, ph - 4);
      if (side === 'L') {
        y = HL.ui.section(ctx, x, y, w, i18n.t('ui.village.plant.zones'));
        var lvl = level('lodenica');
        HL.data.lakeZones.forEach(function (z) {
          var open = lvl >= z.needShipyard;
          if (!open) D.sprite(ctx, HL.spr.get('icon_lock'), x, y);
          F.draw(ctx, z.name, x + (open ? 0 : 13), y + 1, P(open ? 'white' : 'grey'), { small: true, maxWidth: w - 13 });
          F.draw(ctx, HL.util.meters(z.from) + ' – ' + HL.util.meters(z.to), x, y + 1 + ls, P('grey'), sm);
          y += 2 * ls + 4;
        });
        var md = HL.village.lakeMaxDepth(s);
        y += 4;
        y = HL.ui.section(ctx, x, y, w, i18n.t('ui.village.plant.reach'));
        F.draw(ctx, md > 0 ? HL.util.meters(md) : '—', x, y, P(md > 0 ? 'yellow' : 'grey'));
      } else {
        y = HL.ui.section(ctx, x, y, w, i18n.t('ui.village.plant.fish'));
        var enc = s.encyclopedia || {};
        HL.data.lakeFish.concat(HL.data.lakeLegends).forEach(function (f) {
          if (y > ph - 20) return;
          var known = enc[f.id] && enc[f.id].n > 0;
          var th = known ? HL.ui.thumb(f.id, 16, 10) : HL.ui.silhouette(f.id, 16, 10, 'slate');
          D.sprite(ctx, th, x, y + 1 + Math.floor((10 - th.height) / 2));
          F.draw(ctx, known ? f.name : '???', x + 19, y + 1, P(known ? 'white' : 'slate'), { small: true, maxWidth: w - 19 });
          y += 13;
        });
      }
    },

    probe: function () {
      var env = S.env || HL.game.env(), s = save(), acc = S.access || HL.village.lakeAccess(s);
      return {
        plots: S.plots.map(function (p) { return { id: p.p.id, level: p.level, sprite: p.name, x: p.sx, y: p.sy, w: p.sw, h: p.sh, badge: p.badge || null, hit: p.hit || null }; }),
        access: { ok: acc.ok, reasonKey: acc.reasonKey || null },
        lakeMaxDepth: HL.village.lakeMaxDepth(s),
        hovered: S.hover, focused: HL.w.focused(),
        dark: A().darkness(env), lights: S.counts.lights || 0, shadeSteps: S.counts.shadeSteps || 0, glints: S.counts.glints || 0,
        weather: env.weather, period: env.period,
      };
    },
  });
})(globalThis.HL);
