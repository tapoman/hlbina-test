// Nekonečná hlbina — ponuka režimu (dizajn 12.2): popis, pevná výbava, miestny rebríček top 10
// a tlačidlo PONORIŤ SA. Samotný ponor spúšťa scéna 'dive' (HL.game.startDive má jediné miesto volania).
//
// Rozhodnutia:
// - Zamknutý režim sa neskrýva: hráč vidí, čo ho čaká (sivé), a presne čo ho odomkne
//   (Maják na úrovni 3) aj kde teraz je. Tlačidlo je vypnuté, nie preč.
// - "Posledný výsledok" v rebríčku: poradie z parametra {rank} (výsledky ho môžu poslať),
//   inak z HL.game.last, ak posledný dokončený ponor bol Nekonečná hlbina. Uložený rebríček
//   (save.endless.best) si poradie posledného ponoru nepamätá — po reštarte hry sa nezvýrazní nič.
// - Globálne rebríčky (Steam, Game Center, Google Play) sú v dizajne 12.2, ale vo webovej
//   verzii nie sú — povie to jeden malý riadok, aby nikto nečakal, že sa výsledok niekam odošle.
// - Pevná výbava sa číta z HL.data.endlessGear, mená z dát (zmena výbavy = zmena na jednom mieste).
// - Kam vedie "späť" (#23): výslovný parameter back ('village' z Majáka, 'title' z titulky). Návrat
//   z výsledku ponoru (results → { resume: true }) si nechá pôvodný cieľ — inak by Maják → ponor →
//   výsledok → Pokračovať → Esc hodil hráča na titulku namiesto do dediny. Bez parametra titulka
//   (nie "posledný cieľ": titulka volá HL.go('endless') bez back a po návšteve z dediny by Esc
//   viedol do dediny).
// - Vzhľad: plné plochy (žiadna šachovnica), vety bežným písmom (drobné sa na 1× nedá čítať).
(function (HL) {
  var S = { back: 'title', t: 0, latest: null };
  var BAR_Y = 290;

  function P(n) { return HL.pal[n]; }
  function t(k, p) { return HL.i18n.t(k, p); }
  // Číslo sa pri zalomení neodtrhne od jednotky ("250 | m", "o 40 | % pomalšie") — nezlomiteľná medzera.
  function nb(s) { return String(s).replace(/(\d) (?=[0-9€%\p{L}])/gu, '$1 '); }
  function byId(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }
  function unlocked() { return !!HL.game.canEndless(); }
  function best() { return HL.endless && HL.endless.best ? HL.endless.best(HL.game.save) : (HL.game.save.endless.best || []); }

  function latestRank(p) {
    if (p && typeof p.rank === 'number') return p.rank;
    var last = HL.game.last;
    var r = last && last.summary;
    if (r && r.result && r.result.mode === 'endless' && typeof r.rank === 'number' && r.rank > 0) return r.rank;
    return null;
  }

  // Pevná výbava: [sprite, názov, stĺpec, riadok]. Dva stĺpce bežným písmom: dlhšie mená
  // (≈ 69 px) idú do ľavého, širšieho stĺpca, aby sa nič neskracovalo výpustkou.
  function gearList() {
    var g = HL.data.endlessGear, D = HL.data;
    var line = byId(D.lines, g.line), rod = byId(D.rods, g.rod), hook = byId(D.hooks, g.hook);
    return [
      ['line_' + g.line, line ? line.name : g.line, 0, 0],
      ['rod_' + g.rod, rod ? rod.name : g.rod, 0, 1],
      ['harpoon', t('ui.endless.harpoons', { n: g.harpoons }), 0, 2],
      ['hook_' + g.hook, hook ? hook.name : g.hook, 1, 0],
      ['bait_' + g.bait, t('ui.endless.baitMix'), 1, 1],
    ];
  }

  function drawGear(ctx, y, on) {
    var F = HL.font, D = HL.draw, items = gearList();
    for (var i = 0; i < items.length; i++) {
      var x = items[i][2] ? 94 : 6, w = items[i][2] ? 80 : 86, yy = y + items[i][3] * 14;
      var name = items[i][0];
      var img = on ? HL.spr.get(name) : HL.spr.silhouette(name, 0, 'slate');
      var iw = Math.max(12, img.width);
      D.sprite(ctx, img, x + Math.floor((iw - img.width) / 2), yy + Math.floor((12 - img.height) / 2));
      F.draw(ctx, items[i][1], x + iw + 3, yy + 1, on ? P('white') : P('grey'), { maxWidth: w - iw - 3 });
    }
    return y + 3 * 14;
  }

  function drawBoard(ctx, y) {
    var F = HL.font, D = HL.draw, list = best();
    var cols = { rank: 22, depth: 74, value: 132, day: 168 };
    if (!list.length) {
      F.drawWrapped(ctx, t('ui.endless.boardEmpty'), 11, y + 2, 158, P('greyLight'), {});
      return y + 36;
    }
    F.draw(ctx, '#', cols.rank, y, P('grey'), { small: true, align: 'right' });
    F.draw(ctx, t('ui.endless.col.depth'), cols.depth, y, P('grey'), { small: true, align: 'right' });
    F.draw(ctx, t('ui.endless.col.value'), cols.value, y, P('grey'), { small: true, align: 'right' });
    F.draw(ctx, t('ui.endless.col.day'), cols.day, y, P('grey'), { small: true, align: 'right' });
    y += 9;
    for (var i = 0; i < 10; i++) {
      var e = list[i], yy = y + i * 10;
      var mine = S.latest != null && S.latest === i + 1;
      if (mine) { D.rect(ctx, 7, yy - 1, 166, 10, P('plum')); D.rect(ctx, 7, yy - 1, 2, 10, P('amber')); }
      else if (i % 2) D.rect(ctx, 7, yy - 1, 166, 10, P('navy'));
      var c = mine ? P('yellow') : (i === 0 ? P('amber') : P('white'));
      F.draw(ctx, t('ui.endless.rank', { n: i + 1 }), cols.rank, yy, e ? c : P('slateDark'), { align: 'right' });
      if (!e) { F.draw(ctx, '—', cols.depth, yy, P('slateDark'), { align: 'right' }); continue; }
      F.draw(ctx, HL.util.meters(e.depth), cols.depth, yy, c, { align: 'right' });
      F.draw(ctx, HL.util.money(e.value), cols.value, yy, mine ? P('yellow') : P('greyLight'), { align: 'right' });
      F.draw(ctx, String((e.day | 0) + 1), cols.day, yy, P('grey'), { align: 'right' });
    }
    return y + 100;
  }

  function drawUnlocked(ctx) {
    var F = HL.font, U = HL.ui, D = HL.draw;
    var y = 26;
    var desc = t('ui.endless.descUnlocked', { every: HL.util.meters(HL.T.endlessPerkEvery) });
    y += F.drawWrapped(ctx, nb(desc), 8, y, 164, P('greyLight'), { lineHeight: 10 }) + 3;
    y = U.section(ctx, 6, y, 168, t('ui.endless.gear'));
    y = drawGear(ctx, y + 1, true) + 2;
    y = U.section(ctx, 6, y, 168, t('ui.endless.board'));
    // Tabuľka a poznámka na tmavej doske. Poznámka je veta → bežné písmo (drobné sa nedá čítať).
    // Na CrazyGames je rebríček v účte hráča a iné platformy (Steam, Game Center) sa tam nespomínajú (revízia 2026-10-04).
    var note = F.wrap(t(HL.platform && HL.platform.name === 'crazygames' ? 'ui.endless.boardNoteCg' : 'ui.endless.boardNote'), 158, { lineHeight: 10 });
    var boardH = (best().length ? 109 : 36) + 3 + note.length * 10 + 5;
    D.panel(ctx, 6, y - 1, 168, boardH, 'dark');
    var ny = drawBoard(ctx, y + 2) + 2;
    for (var i = 0; i < note.length; i++) F.draw(ctx, note[i], 11, ny + i * 10, P('greyLight'), {});
    // Prázdny rebríček nechá dole miesto: príklady vylepšení (na mobile nie je bočný panel so zoznamom).
    if (!best().length) {
      var py = U.section(ctx, 6, y - 1 + boardH + 5, 168, t('ui.endless.perksExample'));
      ['strength', 'jellyImmune', 'knot'].forEach(function (id) {
        var pk = null;
        for (var k = 0; k < HL.data.perks.length; k++) if (HL.data.perks[k].id === id) pk = HL.data.perks[k];
        // Celá položka musí skončiť nad tlačidlom (predtým sa strážil len ZAČIATOK: 2–3 riadky od y 276
        // vbehli pod PONORIŤ SA); radšej vynechať celú než useknúť.
        var pn = pk ? F.wrap(nb(pk.name), 158, { lineHeight: 10 }) : [];
        if (!pk || py > 276 || py + (pn.length - 1) * 10 + F.lineHeight() > BAR_Y) return;
        D.rect(ctx, 9, py + 3, 2, 2, P('cyan'));
        for (var pi = 0; pi < pn.length; pi++) F.draw(ctx, pn[pi], 14, py + pi * 10, P('greyLight'), {});
        py += pn.length * 10 + 1;
      });
    }
  }

  function drawLocked(ctx) {
    var F = HL.font, D = HL.draw, U = HL.ui;
    var lvl = HL.village.level(HL.game.save, 'majak');
    var y = 26;
    var desc = t('ui.endless.descLocked', { every: HL.util.meters(HL.T.endlessPerkEvery) });
    y += F.drawWrapped(ctx, nb(desc), 8, y, 164, P('grey'), { lineHeight: 10 }) + 6;

    // zámok: maják v súčasnom stave + čo chýba
    var bx = 6, by = y, bw = 168, bh = 96;
    D.panel(ctx, bx, by, bw, bh, 'dark');
    D.rect(ctx, bx + 1, by + bh - 24, bw - 2, 23, P('navy')); // zem pod majákom: plná plocha, nie prechod
    var bld = HL.spr.get('bld_majak_' + Math.max(0, Math.min(3, lvl)));
    D.sprite(ctx, bld, bx + 26 - Math.floor(bld.width / 2), by + bh - 4 - bld.height);
    D.sprite(ctx, HL.spr.get('icon_lock'), bx + 56, by + 10);
    F.draw(ctx, t('ui.endless.locked'), bx + 71, by + 12, P('amber'));
    F.drawWrapped(ctx, t('ui.endless.unlockBy'), bx + 56, by + 28, bw - 62, P('white'), {});
    F.draw(ctx, t('ui.endless.yourMajak'), bx + 56, by + 56, P('grey'), { small: true });
    F.draw(ctx, t('ui.endless.level', { level: lvl }), bx + 56, by + 65, P('greyLight'));
    for (var i = 0; i < 3; i++) D.rect(ctx, bx + 56 + i * 16, by + 80, 13, 5, i < lvl ? P('amber') : P('slateDark'));
    y = by + bh + 6;

    y = U.section(ctx, 6, y, 168, t('ui.endless.gear'), P('grey'));
    y = drawGear(ctx, y + 1, false) + 4;
    F.drawWrapped(ctx, t('ui.endless.majakAlso'), 8, y, 164, P('greyLight'), { lineHeight: 10 });
  }

  HL.scenes.def('endless', {
    enter: function (p) {
      p = p || {};
      if (p.back === 'village' || p.back === 'title') S.back = p.back;
      else if (!p.resume) S.back = 'title'; // resume = návrat z výsledku: cieľ ostáva (#23)
      S.t = 0;
      S.latest = latestRank(p);
      // Zamknuté: jediný prvok s fokusom by bola šípka späť a Enter ("chcem sa ponoriť") by
      // hráča vyhodil z obrazovky. Bez navigácie Enter nerobí nič; Esc a myš/dotyk fungujú.
      HL.w.nav = unlocked();
      if (HL.music && HL.music.set) HL.music.set('endless');
      if (HL.audio && HL.audio.ambience) HL.audio.ambience('sea');
    },
    exit: function () { HL.w.nav = false; },
    update: function (dt) {
      S.t += dt;
      if (HL.ui.backPressed()) {
        // Šum mora patrí len k ponoru; späť do dediny jej vlastný, na titulku ticho (titulka si nastaví svoj).
        if (HL.audio && HL.audio.ambience) HL.audio.ambience(S.back === 'village' ? 'village' : null);
        HL.go(S.back, {});
        return;
      }
      if (HL.w.clicked('dive') && unlocked()) HL.go('dive', { mode: 'endless' });
    },
    draw: function (ctx) {
      var on = unlocked();
      HL.draw.rect(ctx, 0, 0, 180, 320, P('ink')); // plná plocha, nie šachovnica (vizuálny kritik)
      HL.ui.header(ctx, t('ui.endless.title'), { money: false, sub: on ? t('ui.endless.subUnlocked') : t('ui.endless.locked') });
      if (on) drawUnlocked(ctx); else drawLocked(ctx);
      HL.w.button(ctx, 'dive', 6, BAR_Y, 168, 26, t('ui.endless.dive'), { style: 'primary', disabled: !on, hotkey: 'KeyS', autofocus: true });
    },
    // Široká obrazovka: vľavo všetky možné vylepšenia, vpravo osobné rekordy.
    drawPanel: function (ctx, side, w, h) {
      var D = HL.draw, F = HL.font;
      D.panel(ctx, 2, 2, w - 4, h - 4);
      if (side === 'L') {
        F.draw(ctx, t('ui.endless.panel.perks'), 8, 8, P('amber'));
        F.draw(ctx, t('ui.endless.panel.every', { every: HL.util.meters(HL.T.endlessPerkEvery) }), 8, 19, P('grey'), { small: true });
        // bežné písmo s riadkom 10 px — celý zoznam sa tak do panela zmestí a dá sa čítať
        var y = 32;
        for (var i = 0; i < HL.data.perks.length; i++) {
          var pl = F.wrap(nb(HL.data.perks[i].name), w - 21, { lineHeight: 10 });
          if (y + pl.length * 10 > h - 6) break; // radšej vynechať celé vylepšenie než useknúť riadok
          D.rect(ctx, 8, y + 5, 2, 2, P('cyan'));
          for (var li = 0; li < pl.length; li++) F.draw(ctx, pl[li], 13, y + li * 10, P('greyLight'), {});
          y += pl.length * 10 + 1;
        }
        return;
      }
      var list = best();
      F.draw(ctx, t('ui.endless.panel.records'), 8, 8, P('amber'));
      var deepest = list.length ? list[0].depth : 0;
      var richest = 0;
      for (var k = 0; k < list.length; k++) richest = Math.max(richest, list[k].value);
      F.draw(ctx, t('ui.endless.panel.deepest'), 8, 24, P('grey'), { small: true });
      F.draw(ctx, list.length ? HL.util.meters(deepest) : '—', 8, 33, P('white'));
      F.draw(ctx, t('ui.endless.panel.richest'), 8, 50, P('grey'), { small: true });
      F.draw(ctx, list.length ? HL.util.money(richest) : '—', 8, 59, P('yellow'));
      F.draw(ctx, t('ui.endless.panel.entries'), 8, 76, P('grey'), { small: true });
      F.draw(ctx, list.length + ' / 10', 8, 85, P('white'));
      F.draw(ctx, t('ui.endless.panel.keyDive'), 8, h - 30, P('grey'), { small: true, maxWidth: w - 16 });
      F.draw(ctx, t('ui.endless.panel.keyBack'), 8, h - 21, P('grey'), { small: true });
    },
    probe: function () {
      var list = best();
      return {
        unlocked: unlocked(), majak: HL.village.level(HL.game.save, 'majak'), back: S.back,
        rows: list.length, latestRank: S.latest,
        best: list.slice(0, 10).map(function (e) { return { depth: e.depth, value: e.value, day: e.day }; }),
        gear: gearList().map(function (g) { return g[0]; }),
        canDive: unlocked(), focused: HL.w.focused(),
      };
    },
  });
})(globalThis.HL);
