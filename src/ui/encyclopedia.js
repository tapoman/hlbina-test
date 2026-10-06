// Encyklopédia (dizajn 8.2, obrazovka 15.7): mriežka všetkých druhov a legiend, detail druhu.
//
// Rozhodnutia:
// - Mriežka 4 × 6 (ryby) a 2 × 3 (legendy) sa zmestí bez posúvania: na mobile je posúvanie
//   zoznamu ďalšie gesto, ktoré sa bije s ťuknutím na bunku — radšej nič neposúvať.
// - Pozadie bunky = voda pásma, v ktorom druh žije (Plytčina svetlomodrá … Priepasť čierna).
//   Mriežka tak bez nadpisov ukazuje, kde ryby hľadať, a smerom dole "tmavne" ako more.
// - Nechytený druh = tieň + '?'. Meno a pásmo sa ukazujú (o tých rybári v Krčme rozprávajú),
//   podmienky, návnada, rytmus a cena nie — namiesto nich nápoveda (8.2). Inak by nápoveda
//   "Vraj ju videli pri splne…" nemala čo odhaľovať.
// - Sezónny druh mimo svojej udalosti (a nechytený) je iba značka 'sezónne' — neprezradí tvar
//   ani meno, len kedy sa objaví. Počíta sa do "Y" v 'Chytené X / Y', lebo bunka je na obrazovke.
// - Legenda je chytená, keď je v save.legends (demo=built ich tam dáva bez záznamu v encyklopédii).
//   Podmienky nechytenej legendy odhalí až Krčma na úrovni 3 (stopy k legendám, dizajn 11).
// - Rytmus sa ukáže až po úlovku (zadanie): hráč sa ho má naučiť v boji, encyklopédia ho len pripomenie.
// - Mená sa do 40-px buniek nezmestia; riadok pod mriežkou ukazuje, čo je pod kurzorom/prstom/fokusom.
// - Vzhľad (vizuálny kritik): plné plochy, žiadna šachovnica. Chytená bunka = voda pásma (jedna
//   farba z rampy mora). Zamknutá bunka má JEDNO spracovanie pre všetky pásma aj sezónne druhy:
//   tmavá karta (voda pásma o 2 kroky rampy tmavšia), tieň v jednej farbe (TIEŇ) a '?'. Sezónny
//   druh tvar neprezradí — namiesto tieňa veľký '?' v tej istej farbe. Pásmo drží pásik dole.
// - Udalosť sa v Nastaveniach zapnúť nedá (len Automaticky/Žiadna, nálezy #4/#21/#35) — detail
//   sezónneho druhu to preto nesľubuje; povie len, v ktorých mesiacoch príde.
// - Jadrové jazero (docs/JAZERO.md): tretia karta „Jazero" v mriežke rýb (8 mutantov + Atómový sumec na konci).
//   Legenda jazera má detail legendy (fázy, odmena) aj keď stojí v mriežke rýb. Voda pásma jazera = jeho
//   zelená rampa (HL.pal.lakeAt), hĺbkomer v detaile ukazuje pásma jazera.
(function (HL) {
  var S = { tab: 'fish', view: 'grid', idx: 0, back: 'title', t: 0, hoverId: null, lastOpened: null };

  var COLS = 4, CW = 40, CH = 32, GAP = 2, GX = 7, GY = 44;            // ryby: 6 riadkov po 34 px
  var LCOLS = 2, LCW = 82, LCH = 64, LGAP = 4, LGX = 6;                // legendy: 3 riadky po 68 px
  var INFO_Y = 250, BAR_Y = 290, BAR_H = 26;

  // Voda pásma = jedna farba rampy mora (smerom dole tmavne). Plná plocha, nie prechod ditheringom.
  var WATER = { plytcina: 'blue', utesy: 'blueDark', sumrak: 'navy', polnoc: 'ink', priepast: 'ink',
    chladiace: 'green', hala: 'tealDark', sachta: 'navy' };
  // Zamknutá bunka: jedna farba tieňa pre všetky pásma (na tmavej karte je vidno všade).
  var SHADOW = 'slate';
  function waterColor(zone) { return P(WATER[zone] || 'ink'); }
  // Vizuálny kritik (2. kolo, D4): "makrela na #124e89 má príliš malý kontrast". Nebola jediná — každý
  // sprite má tmavý obrys a na vode Útesov/Súmraku/Polnoci/Priepasti z neho nebolo vidno nič (sonda
  // tools/fix_menus_r2.js: 0 % okrajových pixelov s kontrastom ≥ 3:1 u 16 z 30 druhov). Preto:
  // CHYTENÝ druh = papierová karta (sandLight — najhorší sprite prizrak 0,54, čo je jeho strop na
  // akejkoľvek farbe palety; priemer 0,94), NECHYTENÝ = atramentová karta s tieňom. Pásmo, kde druh
  // žije, nesie v OBOCH prípadoch pásik vody dole (mriežka tak stále tmavne smerom do hĺbky).
  function card(ctx, x, y, w, h, zone, locked) {
    var D = HL.draw, TL = HL.ui.TILE;
    D.rect(ctx, x, y, w, h, locked ? P('ink') : P(TL.paper));
    if (h > 6) {
      var band = waterColor(zone);
      if (locked && band === P('ink')) band = P('navy'); // atrament na atramente by nebolo vidno
      D.rect(ctx, x, y + h - 2, w, 2, band);
    }
  }
  var REWARD = HL.data.unlockText; // jediný zdroj textov odmien (data/text.js; prekladá sa na mieste)

  function P(n) { return HL.pal[n]; }
  function t(k, p) { return HL.i18n.t(k, p); }
  // Mesiac (0 = január) a nástraha legendy: rodiny kľúčov ui.encyclopedia.month.<i> / .hazard.<id>
  // (tests/unit/i18n.test.js). Neznáma nástraha ukáže svoje id ako predtým.
  function monthName(m) { return t('ui.encyclopedia.month.' + m); }
  function hazardName(h) { var k = 'ui.encyclopedia.hazard.' + h; return HL.i18n.has(k) ? t(k) : h; }
  function save() { return HL.game.save; }
  var LAKE_LIST = null;
  function lakeList() { return LAKE_LIST || (LAKE_LIST = HL.data.lakeFish.concat(HL.data.lakeLegends)); }
  function list() { return S.tab === 'legends' ? HL.data.legends : S.tab === 'lake' ? lakeList() : HL.data.fish; }
  function isLegendTab() { return S.tab === 'legends'; }
  function isLegendSp(sp) { return HL.data.allLegends.indexOf(sp) >= 0; }
  function allSpecies() { return HL.data.allFish.concat(HL.data.allLegends); }
  function entry(id) { var e = save().encyclopedia; return e && e[id] && e[id].n > 0 ? e[id] : null; }

  // 'caught' | 'unknown' | 'seasonal'
  function stateOf(sp) {
    var s = save();
    var caught = !!entry(sp.id) || (isLegendSp(sp) && !!(s.legends && s.legends[sp.id]));
    if (caught) return 'caught';
    if (sp.event && sp.event !== HL.world.currentEvent) return 'seasonal';
    return 'unknown';
  }

  function counts(arr) {
    var c = 0, hidden = 0;
    for (var i = 0; i < arr.length; i++) {
      var st = stateOf(arr[i]);
      if (st === 'caught') c++; else if (st === 'seasonal') hidden++;
    }
    return { caught: c, total: arr.length, hidden: hidden };
  }

  function eventOf(id) { for (var i = 0; i < HL.data.events.length; i++) if (HL.data.events[i].id === id) return HL.data.events[i]; return null; }
  function monthsLabel(ev) {
    if (!ev || !ev.months.length) return '';
    var a = monthName(ev.months[0]), b = monthName(ev.months[ev.months.length - 1]);
    return a === b ? a : t('ui.encyclopedia.monthRange', { from: a, to: b });
  }
  function baitNames(ids) {
    return ids.map(function (id) {
      for (var i = 0; i < HL.data.baits.length; i++) if (HL.data.baits[i].id === id) return HL.data.baits[i].name;
      return id;
    }).join(', ');
  }
  function condLabel(cond) { return cond.map(function (c) { return HL.data.COND_LABEL[c] || c; }).join(', '); }
  // "80–190 m": prvé číslo bez jednotky (formát čísla jazyka), druhé s ňou
  function depthLabel(sp) { return t('ui.encyclopedia.depthRange', { from: HL.util.num(Math.round(sp.depth[0])), to: HL.util.meters(sp.depth[1]) }); }
  // "Útesy · 80–190 m" (riadok pod mriežkou aj detail)
  function zoneLabel(sp) { return t('ui.encyclopedia.zoneDepth', { zone: HL.world.zoneName(sp.zone), depth: depthLabel(sp) }); }

  // ------------------------------------------------------------------ zmenšenie tieňa
  // Zmenšenie tieňa do boxu — spoločné HL.ui.fit (celé delitele, najbližší sused).
  function fitCanvas(src, key, maxW, maxH) {
    if (src.width <= maxW && src.height <= maxH) return src;
    return HL.ui.fit(src, key, maxW, maxH);
  }
  // Obrázok druhu do boxu: chytený = sprite (animovaný, ak sa zmestí 1:1), inak tieň.
  function picture(sp, st, maxW, maxH, frame) {
    if (st === 'caught') {
      var src = HL.spr.fish(sp.id, frame);
      return src.width <= maxW && src.height <= maxH ? src : HL.ui.fishThumb(sp.id, maxW, maxH);
    }
    return fitCanvas(HL.spr.silhouette(sp.id, 0, SHADOW), 'sil_' + sp.id + SHADOW, maxW, maxH);
  }

  // Pozadie bunky/okna: chytený = papierová karta, zamknutý (nechytený aj sezónny) = atramentová.
  // Dole 2-px pásik vody pásma — každá bunka ukazuje, kde druh hľadať.
  function water(ctx, x, y, w, h, zone, locked) { card(ctx, x, y, w, h, zone, locked); }

  // Rám s odrezanými rohmi (rovnaký jazyk ako HL.draw.panel a tlačidlá).
  function cutFrame(ctx, x, y, w, h, c) {
    var D = HL.draw;
    D.rect(ctx, x + 1, y, w - 2, 1, c); D.rect(ctx, x + 1, y + h - 1, w - 2, 1, c);
    D.rect(ctx, x, y + 1, 1, h - 2, c); D.rect(ctx, x + w - 1, y + 1, 1, h - 2, c);
  }

  // ------------------------------------------------------------------ bunka
  // Ryba: obrázok v hornej časti (h − 10), dole 9-px pás na počet úlovkov alebo '?'.
  // Legenda: obrázok nad menom.
  function drawCell(ctx, sp, x, y, w, h, st, active, legend) {
    var D = HL.draw, F = HL.font;
    D.rect(ctx, x + 1, y + 1, w - 2, h - 2, P('ink'));
    if (st === 'seasonal') {
      // tá istá tmavá karta ako nechytený druh; tvar sa neprezradí — veľký '?' vo farbe tieňa
      water(ctx, x + 1, y + 1, w - 2, h - 2, sp.zone, true);
      F.draw(ctx, '?', x + w / 2, y + Math.floor((h - 10) / 2) - 9, P(SHADOW), { align: 'center', scale: 2 });
      F.draw(ctx, t('ui.encyclopedia.cellSeasonal'), x + w / 2, y + h - 11, P('pink'), { align: 'center', small: true, shadow: P('ink') });
      D.rect(ctx, x + 1, y + 1, 4, 1, P('pinkPurple')); D.rect(ctx, x + 1, y + 2, 2, 1, P('pinkPurple')); D.rect(ctx, x + 1, y + 3, 1, 1, P('pinkPurple'));
    } else {
      water(ctx, x + 1, y + 1, w - 2, h - 2, sp.zone, st !== 'caught');
      var areaH = legend ? h - 14 : h - 10;
      var frame = active ? Math.floor(S.t * 3) % 2 : 0;
      var img = picture(sp, st, w - 4, areaH, frame);
      D.sprite(ctx, img, x + Math.floor((w - img.width) / 2), y + 1 + Math.floor((areaH - img.height) / 2));
      // Na papierovej karte tmavé písmo (plum 9,4:1, wood 5,8:1 na sandLight), nad pásikom pásma.
      if (legend) {
        F.draw(ctx, sp.name, x + w / 2, y + h - 11, st === 'caught' ? P('plum') : P('greyLight'), { align: 'center', small: true, maxWidth: w - 4 });
      }
      if (st === 'caught') {
        var e = entry(sp.id);
        if (legend) D.sprite(ctx, HL.spr.get('icon_trophy'), x + w - 13, y + 2);
        else if (e) F.draw(ctx, t('ui.encyclopedia.cellCount', { n: e.n }), x + w - 3, y + h - 11, P('wood'), { small: true, align: 'right' });
      } else {
        F.draw(ctx, '?', x + w - 3, legend ? y + 2 : y + h - 11, P('greyLight'), { align: 'right', shadow: P('ink') });
      }
      if (sp.event) { // sezónny druh počas udalosti: fialový roh
        D.rect(ctx, x + 1, y + 1, 4, 1, P('pinkPurple')); D.rect(ctx, x + 1, y + 2, 2, 1, P('pinkPurple')); D.rect(ctx, x + 1, y + 3, 1, 1, P('pinkPurple'));
      }
    }
    cutFrame(ctx, x, y, w, h, active ? P('white') : (S.lastOpened === sp.id ? P('amber') : P('ink')));
  }

  function cellRect(i) {
    if (isLegendTab()) {
      var c = i % LCOLS, r = Math.floor(i / LCOLS);
      return { x: LGX + c * (LCW + LGAP), y: GY + r * (LCH + LGAP), w: LCW, h: LCH };
    }
    var cc = i % COLS, rr = Math.floor(i / COLS);
    return { x: GX + cc * (CW + GAP), y: GY + rr * (CH + GAP), w: CW, h: CH };
  }

  // ------------------------------------------------------------------ kreslenie: mriežka
  // Záložky = spoločné HL.ui.tabs (vizuálny kritik, 2. kolo: tu bola vybraná svetlejšia, na Trhovisku tmavšia).
  function drawTabs(ctx) {
    var cf = counts(HL.data.fish), cl = counts(HL.data.legends), cj = counts(lakeList());
    HL.ui.tabs(ctx, 6, 24, 168, [
      { id: 'fish', label: t('ui.encyclopedia.tabFish', { caught: cf.caught, total: cf.total }), hotkey: 'KeyR' },
      { id: 'legends', label: t('ui.encyclopedia.tabLegends', { caught: cl.caught, total: cl.total }), hotkey: 'KeyL' },
      { id: 'lake', label: t('ui.encyclopedia.tabLake', { caught: cj.caught, total: cj.total }), hotkey: 'KeyJ' },
    ], S.tab, { h: 18, panel: P('navy') });
  }

  function drawGrid(ctx) {
    var arr = list();
    var hover = null, focusSp = null;
    for (var i = 0; i < arr.length; i++) {
      var r = cellRect(i), sp = arr[i];
      var hs = HL.w.hit('cell_' + sp.id, r.x, r.y, r.w, r.h, { autofocus: S.lastOpened ? S.lastOpened === sp.id : i === 0 });
      var active = hs.hover || (hs.focus && HL.input.usingKeyboard);
      if (hs.hover) hover = sp;
      if (hs.focus) focusSp = sp;
      drawCell(ctx, sp, r.x, r.y, r.w, r.h, stateOf(sp), active, isLegendTab());
    }
    var shown = hover || (HL.input.usingKeyboard ? focusSp : null);
    S.hoverId = shown ? shown.id : null;
    drawInfo(ctx, shown);
  }

  function drawInfo(ctx, sp) {
    var F = HL.font, y = INFO_Y;
    HL.draw.rect(ctx, 6, y, 168, 1, P('slateDark'));
    if (!sp) {
      var c = counts(list());
      F.draw(ctx, t(isLegendTab() ? 'ui.encyclopedia.tapLegend' : 'ui.encyclopedia.tapFish'), 90, y + 6, P('greyLight'), { align: 'center', maxWidth: 168 });
      // veta bežným písmom (drobné sa na 1× nedá čítať) — a krátka, aby sa zmestila do riadku
      if (c.hidden) F.draw(ctx, t('ui.encyclopedia.seasonalHint'), 90, y + 19, P('grey'), { align: 'center', maxWidth: 168 });
      return;
    }
    var st = stateOf(sp);
    if (st === 'seasonal') {
      var ev = eventOf(sp.event);
      F.draw(ctx, t(isLegendSp(sp) ? 'ui.encyclopedia.seasonalLegend' : 'ui.encyclopedia.seasonalFish'), 8, y + 5, P('pink'), { maxWidth: 164 });
      F.draw(ctx, (ev ? t('ui.encyclopedia.eventMonths', { event: ev.name, months: monthsLabel(ev) }) : ''), 8, y + 18, P('grey'), { small: true, maxWidth: 164 });
      return;
    }
    F.draw(ctx, sp.name, 8, y + 5, st === 'caught' ? P('white') : P('greyLight'), { maxWidth: 164 });
    var zone = zoneLabel(sp);
    var e = entry(sp.id);
    var right = st === 'caught' ? (e ? t('ui.encyclopedia.caughtTimes', { n: e.n }) : t('ui.encyclopedia.caught')) : t('ui.encyclopedia.notCaught');
    F.draw(ctx, zone, 8, y + 18, P('grey'), { small: true, maxWidth: 110 });
    F.draw(ctx, right, 172, y + 18, st === 'caught' ? P('greenLight') : P('grey'), { small: true, align: 'right' });
  }

  // ------------------------------------------------------------------ kreslenie: detail
  function row(ctx, y, label, value, color) {
    var F = HL.font;
    F.draw(ctx, label, 8, y, P('grey'), { maxWidth: 50 });
    return Math.max(11, F.drawWrapped(ctx, HL.ui.nb(value), 60, y, 112, color || P('white'), {}));
  }

  // Hĺbkomer (ako v ponore vľavo, dizajn 15.3): päť pásiem rovnako vysokých — lineárna
  // stupnica by Plytčinu (50 z 3000 m) stlačila na jeden pixel. Biela značka = kde druh žije.
  function depthGauge(ctx, x, y, h, range, mark, loc) { // mark: farba značky (na papieri atrament, na tmavej karte biela)
    var D = HL.draw, zones = HL.world.location(loc).zones.filter(function (z) { return !z.endlessOnly; });
    var seg = h / zones.length;
    function toY(d) {
      for (var i = 0; i < zones.length; i++) {
        var z = zones[i];
        if (d <= z.to || i === zones.length - 1) return y + Math.round((i + Math.min(1, Math.max(0, (d - z.from) / (z.to - z.from)))) * seg);
      }
      return y + h;
    }
    // Rampa mora (HL.pal.ramps.sea) zhora nadol; sivý rám, aby tmavé pásma nezmizli v tmavej vode.
    var ramp = HL.world.isLake(loc) ? ['green', 'greenDark', 'tealDark', 'navy', 'ink'] : HL.pal.ramps.sea;
    HL.draw.frame(ctx, x - 1, y - 1, 7, h + 2, P('slate'));
    for (var i = 0; i < zones.length; i++) {
      D.rect(ctx, x, y + Math.round(i * seg), 5, Math.round((i + 1) * seg) - Math.round(i * seg), P(ramp[Math.min(i, ramp.length - 1)]));
    }
    var y0 = toY(range[0]), y1 = Math.max(toY(range[0]) + 2, toY(range[1]));
    D.rect(ctx, x + 6, y0, 2, y1 - y0, mark || P('white'));
    D.rect(ctx, x + 6, y0, 4, 1, mark || P('white'));
    D.rect(ctx, x + 6, y1 - 1, 4, 1, mark || P('white'));
  }

  function drawDetail(ctx) {
    var D = HL.draw, F = HL.font;
    var arr = list(), sp = arr[S.idx], st = stateOf(sp), legend = isLegendSp(sp);
    var e = entry(sp.id);
    // obrázok v okne s vodou pásma
    var bh = legend ? 70 : 56, bx = 6, by = 26, bw = 168;
    D.rect(ctx, bx, by, bw, bh, P('ink'));
    if (st === 'seasonal') {
      water(ctx, bx + 1, by + 1, bw - 2, bh - 2, sp.zone, true);
      F.draw(ctx, '?', 90, by + Math.floor(bh / 2) - 11, P(SHADOW), { align: 'center', scale: 2 });
    } else {
      water(ctx, bx + 1, by + 1, bw - 2, bh - 2, sp.zone, st !== 'caught');
      var frame = Math.floor(S.t * 2.5) % 2;
      var img = picture(sp, st, bw - 8, bh - 8, frame);
      // Malá ryba (16 px) 2× najbližším susedom, inak 1:1 — celé násobky, ostré pixely.
      var sc = (!legend && img.width <= 16) ? 2 : 1;
      var ix = bx + Math.floor((bw - img.width * sc) / 2), iy = by + Math.floor((bh - img.height * sc) / 2);
      D.sprite(ctx, img, ix, iy, { scale: sc });
    }
    cutFrame(ctx, bx, by, bw, bh, st === 'caught' && legend ? P('amber') : P('slateDark'));
    if (st !== 'seasonal') depthGauge(ctx, bx + 5, by + 4, bh - 8, sp.depth, st === 'caught' ? P('ink') : P('white'), HL.world.locOf(sp));

    var y = by + bh + 4;
    if (st === 'seasonal') {
      var ev = eventOf(sp.event);
      F.draw(ctx, t(legend ? 'ui.encyclopedia.seasonalLegend' : 'ui.encyclopedia.seasonalFish'), 8, y, P('pink'), { maxWidth: 164 });
      y += 14;
      var txt = ev ? t('ui.encyclopedia.onlyDuring', { event: ev.name, months: monthsLabel(ev) }) : t('ui.encyclopedia.onlyDuringUnknown');
      y += F.drawWrapped(ctx, txt, 8, y, 164, P('greyLight'), {}) + 6;
      if (ev && ev.desc) {
        var dl = F.wrap(HL.ui.nb(t('ui.encyclopedia.eventDesc', { desc: ev.desc })), 156, {});
        HL.draw.panel(ctx, 6, y, 168, dl.length * 11 + 8, 'dark');
        for (var di = 0; di < dl.length; di++) F.draw(ctx, dl[di], 12, y + 5 + di * 11, P('pink'));
        y += dl.length * 11 + 14;
      }
      // (Nápoveda "Udalosť sa dá zapnúť aj v Nastaveniach" zmizla — Nastavenia sezónu nezapnú, #35.)
      return;
    }
    F.draw(ctx, sp.name, 8, y, st === 'caught' ? P('white') : P('greyLight'), { maxWidth: 118 });
    // Stav bez rodu: mená sú rôzneho rodu (okúň, makrela, Kráľ búrky), prídavné meno by nesedelo.
    if (st !== 'caught') F.draw(ctx, t('ui.encyclopedia.notCaught'), 172, y + 2, P('grey'), { small: true, align: 'right' });
    else if (legend) F.draw(ctx, t('ui.encyclopedia.caughtLegend'), 172, y + 2, P('yellow'), { small: true, align: 'right' });
    y += 12;
    F.draw(ctx, zoneLabel(sp), 8, y, P('cyan'), { small: true, maxWidth: 164 });
    y += 11;
    D.rect(ctx, 6, y, 168, 1, P('slateDark'));
    y += 4;

    var known = st === 'caught';
    var clue = legend && !known && HL.village.level(save(), 'krcma') >= 3; // stopy z Krčmy L3
    if (legend) {
      y += row(ctx, y, t('ui.encyclopedia.row.cond'), known || clue ? condLabel(sp.cond) : '?', known || clue ? P('white') : P('grey'));
      y += row(ctx, y, t('ui.encyclopedia.row.bait'), known || clue ? baitNames(sp.bait.ideal) : '?', known || clue ? P('white') : P('grey'));
      var ph = [];
      sp.phases.forEach(function (p) {
        var nm = HL.rhythm.TYPES[p.rhythm] ? HL.rhythm.TYPES[p.rhythm].name : p.rhythm;
        if (ph[ph.length - 1] !== nm) ph.push(nm); // tri fázy s tým istým rytmom = jeden názov
      });
      var nph = sp.phases.length;
      y += row(ctx, y, t('ui.encyclopedia.row.fight'), known ? HL.i18n.plural(nph, 'ui.encyclopedia.phasesList', { list: ph.join(' → ') }) : HL.i18n.plural(nph, 'ui.encyclopedia.phases'), P('white'));
      if (known && sp.hazards.length) y += row(ctx, y, t('ui.encyclopedia.row.hazards'), sp.hazards.map(hazardName).join(', '));
      var rw = REWARD[sp.reward && sp.reward.unlock] || '';
      y += row(ctx, y, t('ui.encyclopedia.row.reward'), rw && rw !== REWARD.trophy ? t('ui.encyclopedia.rewardTrophy', { reward: rw }) : REWARD.trophy, P('amber'));
      y += row(ctx, y, t('ui.encyclopedia.row.price'), HL.util.money(sp.price), P('yellow'));
      if (known && e) y += row(ctx, y, t('ui.encyclopedia.row.biggestLegend'), t('ui.encyclopedia.biggestTimes', { kg: HL.util.kg(e.maxW), n: e.n }));
      if (clue) { F.draw(ctx, t('ui.encyclopedia.clue'), 8, y, P('greyLight'), { maxWidth: 164 }); y += 12; }
    } else {
      y += row(ctx, y, t('ui.encyclopedia.row.cond'), known ? condLabel(sp.cond) : '?', known ? P('white') : P('grey'));
      y += row(ctx, y, t('ui.encyclopedia.row.bait'), known ? baitNames(sp.bait.ideal) : '?', known ? P('white') : P('grey'));
      // Návnady uprostred vety malým písmenom — okrem nemčiny, kde sú podstatné mená vždy s veľkým.
      var okBaits = baitNames(sp.bait.ok);
      if (known && sp.bait.ok.length) y += row(ctx, y, t('ui.encyclopedia.row.baitOk'), HL.i18n.lower(okBaits), P('greyLight'));
      var rt = HL.rhythm.TYPES[sp.rhythm];
      y += row(ctx, y, t('ui.encyclopedia.row.rhythm'), known && rt ? rt.name : '?', known ? P('white') : P('grey'));
      // popis rytmu je veta → bežné písmo (drobné sa na 1× nedá čítať)
      if (known && rt && rt.desc) y += F.drawWrapped(ctx, rt.desc, 60, y - 1, 112, P('greyLight'), {}) + 1;
      y += row(ctx, y, t('ui.encyclopedia.row.price'), known ? t('ui.encyclopedia.pricePer', { money: HL.util.money(sp.price), kg: HL.util.kg(sp.weight) }) : '?', known ? P('yellow') : P('grey'));
      if (known && e) {
        y += row(ctx, y, t('ui.encyclopedia.row.caught'), HL.i18n.plural(e.n, 'ui.encyclopedia.pieces'));
        y += row(ctx, y, t('ui.encyclopedia.row.biggest'), HL.util.kg(e.maxW), P('greenLight'));
        if (typeof e.firstDay === 'number') y += row(ctx, y, t('ui.encyclopedia.row.first'), t('ui.encyclopedia.firstDay', { day: e.firstDay + 1 }), P('greyLight'));
      }
    }
    if (!known) {
      // Nápoveda (8.2): nechytený druh je tieň so šuškandou rybárov.
      y += 4;
      var lines = F.wrap(HL.ui.nb(t('ui.encyclopedia.hint', { hint: sp.hint })), 156, {});
      var h = lines.length * 11 + 8;
      HL.draw.panel(ctx, 6, y, 168, h, 'dark');
      for (var i = 0; i < lines.length; i++) F.draw(ctx, lines[i], 12, y + 5 + i * 11, P('sand'));
    }
  }

  // ------------------------------------------------------------------ scéna
  function openDetail(i) {
    S.view = 'detail'; S.idx = i; S.lastOpened = list()[i].id;
    HL.w.setFocus('next');
  }
  function closeDetail() {
    S.view = 'grid';
    HL.w.setFocus('cell_' + list()[S.idx].id);
  }
  function setTab(tab) {
    if (S.tab === tab) return;
    S.tab = tab; S.view = 'grid'; S.idx = 0; S.lastOpened = null;
    HL.w.setFocus('tab_' + tab);
  }

  HL.scenes.def('encyclopedia', {
    enter: function (p) {
      p = p || {};
      S.back = p.back === 'village' || p.back === 'elektraren' ? p.back : 'title';
      var qt = p.tab || (HL.query && HL.query.scene === 'encyclopedia' ? HL.query.tab : null); // ?tab=lake (harness)
      S.tab = qt === 'legends' || qt === 'lake' ? qt : p.back === 'elektraren' ? 'lake' : 'fish';
      S.view = 'grid'; S.idx = 0; S.t = 0; S.hoverId = null; S.lastOpened = null;
      HL.w.nav = true;
      if (HL.music && HL.music.set) HL.music.set(S.back === 'title' ? 'title' : 'village');
    },
    exit: function () { HL.w.nav = false; },

    update: function (dt) {
      S.t += dt;
      var W = HL.w;
      if (S.view === 'detail') {
        S.hoverId = null;
        var n = list().length;
        if (HL.ui.backPressed() || W.clicked('grid')) { closeDetail(); return; }
        if (W.clicked('prev')) { S.idx = (S.idx - 1 + n) % n; S.lastOpened = list()[S.idx].id; }
        if (W.clicked('next')) { S.idx = (S.idx + 1) % n; S.lastOpened = list()[S.idx].id; }
        return;
      }
      if (HL.ui.backPressed() || W.clicked('leave')) { HL.go(S.back, {}); return; }
      if (W.clicked('tab_fish')) setTab('fish');
      if (W.clicked('tab_legends')) setTab('legends');
      if (W.clicked('tab_lake')) setTab('lake');
      var arr = list();
      for (var i = 0; i < arr.length; i++) if (W.clicked('cell_' + arr[i].id)) { openDetail(i); break; }
    },

    draw: function (ctx) {
      HL.draw.rect(ctx, 0, 0, 180, 320, P('navy')); // plná plocha, nie šachovnica (vizuálny kritik)
      var c = counts(list());
      if (S.view === 'detail') {
        HL.ui.header(ctx, t('ui.encyclopedia.title'), { money: false, sub: t(isLegendSp(list()[S.idx]) ? 'ui.encyclopedia.subLegend' : 'ui.encyclopedia.subFish', { i: S.idx + 1, total: c.total }) });
        drawDetail(ctx);
        HL.w.button(ctx, 'prev', 6, BAR_Y, 44, BAR_H, '←', { hotkey: 'KeyA' });
        HL.w.button(ctx, 'grid', 54, BAR_Y, 72, BAR_H, t('ui.encyclopedia.list'), {});
        HL.w.button(ctx, 'next', 130, BAR_Y, 44, BAR_H, '→', { hotkey: 'KeyD', autofocus: true });
        return;
      }
      var all = counts(allSpecies());
      HL.ui.header(ctx, t('ui.encyclopedia.title'), { money: false, sub: t('ui.encyclopedia.subCaught', { caught: all.caught, total: all.total }) });
      drawTabs(ctx);
      drawGrid(ctx);
      HL.w.button(ctx, 'leave', 6, BAR_Y, 168, BAR_H, t(S.back === 'village' ? 'ui.encyclopedia.backVillage' : S.back === 'elektraren' ? 'ui.encyclopedia.backPlant' : 'ui.encyclopedia.back'), {});
    },

    // Široká obrazovka: vľavo postup po pásmach, vpravo záznamy kariéry.
    drawPanel: function (ctx, side, w, h) {
      var D = HL.draw, F = HL.font;
      D.panel(ctx, 2, 2, w - 4, h - 4);
      if (side === 'L') {
        F.draw(ctx, t('ui.encyclopedia.panel.zones'), 8, 8, P('amber'));
        var y = 24;
        var zones = HL.data.zones.filter(function (z) { return !z.endlessOnly; });
        var groups = zones.map(function (z) {
          return { name: z.name, color: 'cyan', list: HL.data.fish.filter(function (f) { return f.zone === z.id && !f.event; }) };
        });
        groups.push({ name: t('ui.encyclopedia.panel.seasonal'), color: 'pinkPurple', list: HL.data.fish.filter(function (f) { return !!f.event; }) });
        groups.push({ name: t('ui.encyclopedia.panel.legends'), color: 'amber', list: HL.data.legends });
        groups.push({ name: t('ui.encyclopedia.panel.lake'), color: 'greenLight', list: lakeList() });
        for (var i = 0; i < groups.length; i++) {
          var c = counts(groups[i].list);
          F.draw(ctx, groups[i].name, 8, y, P('greyLight'), { maxWidth: 64 });
          F.draw(ctx, c.caught + '/' + c.total, w - 8, y, c.caught === c.total ? P('greenLight') : P('white'), { align: 'right' });
          D.bar(ctx, 8, y + 11, w - 16, 5, c.total ? c.caught / c.total : 0, P(groups[i].color), P('navy'));
          y += 24;
        }
        // klávesy ako zoznam (kláves + čo robí), nie jedna dlhá veta drobným písmom
        // mená kláves (Enter, Esc, R / L) sa neprekladajú; šípky sú slovo
        var keys = [[t('ui.encyclopedia.panel.arrows'), t('ui.encyclopedia.panel.select')], ['Enter', t('ui.encyclopedia.panel.detail')],
          ['R / L', t('ui.encyclopedia.panel.tabs')], ['J', t('ui.encyclopedia.panel.lakeKey')], ['Esc', t('ui.encyclopedia.panel.back')]]; // i18n-ok: mená kláves
        for (var ki = 0; ki < keys.length; ki++) {
          F.draw(ctx, keys[ki][0], 8, y + 6 + ki * 10, P('greyLight'), { small: true });
          F.draw(ctx, keys[ki][1], 40, y + 6 + ki * 10, P('grey'), { small: true, maxWidth: w - 48 });
        }
        return;
      }
      var st = save().stats || {};
      F.draw(ctx, t('ui.encyclopedia.panel.records'), 8, 8, P('amber'));
      var rows = [
        [t('ui.encyclopedia.panel.dives'), String(st.dives || 0)],
        [t('ui.encyclopedia.panel.caught'), String(st.caught || 0)],
        [t('ui.encyclopedia.panel.deepest'), HL.util.meters(st.deepest || 0)],
      ];
      var yy = 24;
      for (var k = 0; k < rows.length; k++) {
        F.draw(ctx, rows[k][0], 8, yy, P('grey'), { small: true });
        F.draw(ctx, rows[k][1], 8, yy + 9, P('white'));
        yy += 26;
      }
      F.draw(ctx, t('ui.encyclopedia.panel.biggest'), 8, yy, P('grey'), { small: true });
      if (st.biggest) {
        var sp = allSpecies().filter(function (f) { return f.id === st.biggest.id; })[0];
        F.draw(ctx, sp ? sp.name : st.biggest.id, 8, yy + 9, P('white'), { maxWidth: w - 16 });
        F.draw(ctx, HL.util.kg(st.biggest.w), 8, yy + 20, P('greenLight'));
        if (sp) HL.ui.fishTile(ctx, sp.id, 8, yy + 34, w - 16, 44); // tá istá papierová karta ako chytený druh
      } else F.draw(ctx, '—', 8, yy + 9, P('grey'));
    },

    probe: function () {
      var arr = list(), c = counts(arr);
      var sp = S.view === 'detail' ? arr[S.idx] : null;
      return {
        tab: S.tab, view: S.view, cells: arr.length, caught: c.caught, total: c.total, hiddenSeasonal: c.hidden,
        fishCaught: counts(HL.data.fish).caught, legendsCaught: counts(HL.data.legends).caught, lakeCaught: counts(lakeList()).caught,
        allCaught: counts(allSpecies()).caught, allTotal: allSpecies().length,
        focused: HL.w.focused(), hover: S.hoverId, lastOpened: S.lastOpened,
        detail: sp ? sp.id : null, detailState: sp ? stateOf(sp) : null, detailIndex: sp ? S.idx : -1,
        back: S.back,
      };
    },
  });
})(globalThis.HL);
