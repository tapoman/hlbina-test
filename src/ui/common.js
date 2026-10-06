// Spoločný vizuálny jazyk obrazoviek: hlavička so šípkou späť a peniazmi, pozadia,
// nadpisy sekcií, oznámenia (toast), zmenšené ryby do zoznamov. Nech štyri scény od
// štyroch autorov vyzerajú ako jedna hra — nový prvok UI patrí SEM, nie do jednej scény.
//
//   HL.ui.bg(ctx, 'sea'|'paper'|'night'|'deep')
//   HL.ui.header(ctx, 'Dielňa', { back: true, money: true, sub: 'Úroveň 2' })  → tlačidlo id 'back'
//   HL.ui.backPressed()             V UPDATE: klik na šípku alebo Esc/Backspace
//   HL.ui.section(ctx, x, y, w, 'Vlasce')
//   HL.ui.toast('Nedostatok peňazí', 'bad'|'good'|'info')   (kreslí main.js nad scénou)
//   HL.ui.thumb(fishId, maxW, maxH) → canvas (ryba zmenšená najbližším susedom na box)
//   HL.ui.fishThumb / HL.ui.silhouette(id, maxW, maxH[, farba]) → to isté, ale telo ostane ≥ T.uiThumbMinPx
//   HL.ui.fishTile(ctx, id, x, y, w, h, { dark })  ryba v riadku zoznamu na papieri / tieň na tmavej dlaždici
//   HL.ui.tabs(ctx, x, y, w, tabs, vybraná, { h, panel })   záložky (jeden vzhľad)
//   HL.ui.listCut(top, h, sy) + HL.ui.moreBelow(ctx, cut, x, w)   zoznam končí celým riadkom
//   HL.ui.sfx('coin')               bezpečný HL.audio.play
//   HL.ui.nb(text) → text, v ktorom sa číslo pri zalomení neodtrhne od jednotky/tisícok (pred F.wrap)
//   HL.ui.saveProblem() → null|'nosave'|'stale'   (odznak dole kreslí drawOverlay sám)
//   HL.ui.M = 6 (okraj), HL.ui.HEAD = 22 (výška hlavičky), HL.ui.W = 180, HL.ui.H = 320
(function (HL) {
  var U = HL.ui = { M: 6, HEAD: 22, W: 180, H: 320 };
  var toasts = [];

  U.sfx = function (name, opts) {
    try { if (HL.audio && HL.audio.play) return HL.audio.play(name, opts); } catch (e) { /* zvuk nesmie zhodiť hru */ }
    return false;
  };

  U.bg = function (ctx, kind) {
    var P = HL.pal, D = HL.draw;
    if (kind === 'paper') {
      D.rect(ctx, 0, 0, U.W, U.H, P.sand);
      D.dither(ctx, 0, 0, U.W, U.H, P.sandLight, 0.35);
    } else if (kind === 'night') {
      D.ditherGradient(ctx, 0, 0, U.W, U.H, P.navy, P.ink, 0, 1);
    } else if (kind === 'deep') {
      D.ditherGradient(ctx, 0, 0, U.W, U.H, P.blueDark, P.ink, 0, 1);
    } else {
      D.ditherGradient(ctx, 0, 0, U.W, U.H, P.blueDark, P.navy, 0, 1);
    }
  };

  U.header = function (ctx, title, opts) {
    opts = opts || {};
    var P = HL.pal, D = HL.draw, F = HL.font;
    D.rect(ctx, 0, 0, U.W, U.HEAD, P.ink);
    D.rect(ctx, 0, U.HEAD - 1, U.W, 1, P.slateDark);
    var tx = 6;
    if (opts.back !== false) {
      HL.w.button(ctx, 'back', 2, 2, 22, U.HEAD - 5, '←', { style: 'ghost', hotkey: null });
      tx = 28;
    }
    F.draw(ctx, title, tx, opts.sub ? 1 : 5, P.white, { maxWidth: 104 });
    if (opts.sub) F.draw(ctx, opts.sub, tx, 11, P.grey, { small: true, maxWidth: 104 });
    if (opts.money !== false && HL.game && HL.game.save) {
      // Zaokrúhlené NADOL: pri 1 499,60 € by hlavička ukazovala 1 500 € a vedľa "Chýba 1 €" (review #25).
      var txt = HL.util.money(Math.floor(HL.game.save.money + 1e-9));
      var w = F.measure(txt);
      F.draw(ctx, txt, U.W - 5 - w, 5, P.yellow, { shadow: P.plum });
    }
  };

  // Text pred F.wrap: číslo sa pri zalomení neodtrhne od tisícok, jednotky ani podstatného mena
  // ("25 | 000 €", "1 | 500 m", "o 40 | %", pl "3 | żarłoczne") — medzera za číslicou → nezlomiteľná
  // (písmo ju kreslí ako medzeru, F.wrap láme len na obyčajnej). \p{L} = písmeno každého jazyka.
  U.nb = function (s) { return String(s == null ? '' : s).replace(/(\d) (?=[0-9€%\p{L}])/gu, '$1 '); };

  U.backPressed = function () {
    return HL.w.clicked('back') || HL.input.actionPressed('back');
  };

  U.section = function (ctx, x, y, w, label, color) {
    var P = HL.pal;
    HL.font.draw(ctx, label, x, y, color || P.amber);
    HL.draw.rect(ctx, x, y + 10, w, 1, P.slateDark);
    return y + 13;
  };

  // --------------------------------------------------------------- oznámenia
  U.toast = function (text, kind, life) { // life (s): dlhšia správa (vysvetlenie pravidla) potrebuje viac času
    toasts.push({ text: String(text), kind: kind || 'info', t: 0, life: life > 0 ? life : 2.2 });
    if (toasts.length > 3) toasts.shift();
    if (kind === 'bad') U.sfx('error');
  };
  U.update = function (dt) {
    for (var i = toasts.length - 1; i >= 0; i--) { toasts[i].t += dt; if (toasts[i].t > toasts[i].life) toasts.splice(i, 1); }
    // Nový problém s ukladaním sa ohlási aj oznámením (odznak dole je malý, toto si hráč všimne).
    badge.t += dt;
    var k = U.saveProblem();
    if (k !== badge.kind) { if (k) U.toast(SAVE_TEXT[k], 'bad'); badge.kind = k; badge.t = 0; }
  };

  // --------------------------------------------------------------- stav ukladania
  // Chyby ukladania sa predtým iba zapísali do HL.game (persistError, storage = null) a žiadna
  // scéna ich neukázala — hra bežala ďalej a postup po zatvorení zmizol (review #33). Teraz je
  // na každej obrazovke malý trvalý odznak — HORE, pod hlavičkou vpravo: dole prekrýval tlačidlá
  // HORE / NA MORE / Predať všetko. ?nosave=1 (harness) nie je chyba — bez odznaku.
  HL.T.def('UI', 'saveBadgeFlipSec', 2.5, 0.5, 10, 0.5, 'Odznak "neukladá sa": po koľkých s sa strieda dlhý text po polovičkách');
  // Text v aktuálnom jazyku pri každom čítaní (ui.common.save.nosave / .stale). ' — ' v preklade = miesto,
  // kde sa dlhý odznak smie rozdeliť na striedajúce sa polovičky.
  var SAVE_TEXT = {};
  ['nosave', 'stale'].forEach(function (k) {
    Object.defineProperty(SAVE_TEXT, k, { enumerable: true, get: function () { return HL.i18n.t('ui.common.save.' + k); } });
  });
  U.SAVE_TEXT = SAVE_TEXT;
  var badge = { kind: null, t: 0 };
  function truthy(v) { return v != null && v !== '0' && v !== 'false' && v !== false; }
  // → null | 'nosave' | 'stale'
  U.saveProblem = function () {
    var G = HL.game;
    if (!G || !G.save) return null;
    if (truthy((HL.query || {}).nosave)) return null;
    if (G.stale) return 'stale';
    if (G.storageOk === false) return 'nosave';
    // kým sim/game.js nemá storageOk: úložisko zablokované (null) alebo zápis zlyhal
    if (G.storageOk === undefined && (!G.storage || G.persistError)) return 'nosave';
    return null;
  };
  // Text odznaku, ktorý sa práve kreslí (pre harness a testy).
  U.saveBadgeText = function () {
    var k = U.saveProblem();
    if (!k) return null;
    var txt = SAVE_TEXT[k];
    // Nezmestí sa na šírku plochy → strieda sa po častiach (radšej než dva riadky cez HORE).
    var parts = HL.font.measure(txt, { small: true }) > U.W - 10 ? txt.split(' — ') : [txt];
    return parts[Math.floor(badge.t / HL.T.saveBadgeFlipSec) % parts.length];
  };
  function drawSaveBadge(ctx) {
    var s = U.saveBadgeText();
    if (!s) return;
    var P = HL.pal, F = HL.font, D = HL.draw;
    var w = F.measure(s, { small: true }) + 8, x = U.W - w - 2, y = U.HEAD + 1;
    D.rect(ctx, x, y, w, 10, P.ink);
    D.rect(ctx, x + 1, y + 1, w - 2, 9, P.redDark);
    F.draw(ctx, s, x + 4, y + 1, P.white, { small: true });
  }

  U.drawOverlay = function (ctx) {
    var P = HL.pal, F = HL.font, D = HL.draw;
    drawSaveBadge(ctx);
    for (var i = 0; i < toasts.length; i++) {
      var t = toasts[i];
      var col = t.kind === 'bad' ? P.red : t.kind === 'good' ? P.green : P.slate;
      var lines = F.wrap(U.nb(t.text), 150);
      var h = lines.length * 11 + 6, y = 34 + i * (h + 3);
      // krátky nájazd zhora, na konci zmizne naraz (bez priehľadnosti — paleta ostáva čistá)
      var slide = Math.min(1, t.t / 0.12);
      y = Math.round(y - (1 - slide) * 12);
      D.rect(ctx, 12, y, 156, h, P.ink);
      D.rect(ctx, 13, y + 1, 154, h - 2, col);
      D.rect(ctx, 13, y + h - 2, 154, 1, P.ink);
      for (var k = 0; k < lines.length; k++) F.draw(ctx, lines[k], 90, y + 3 + k * 11, P.white, { align: 'center', shadow: P.ink });
    }
  };
  U.toasts = function () { return toasts.map(function (t) { return t.text; }); };

  // --------------------------------------------------------------- záložky
  // Jeden vzhľad záložiek pre všetky obrazovky (vizuálny kritik, 2. kolo: Trhovisko a Encyklopédia
  // mali opačnú polaritu — raz bola vybraná tmavšia, raz svetlejšia). Vybraná má farbu obsahu pod
  // ňou (opts.panel, predvolene navy) a splýva s ním, hore jantárová linka, žlté písmo; nevybraná je
  // zapustená (slateDark, pod myšou slate), svetlosivé písmo a pod ňou atramentová čiara. Zamknutá
  // nesie zámok (nie tmavšie písmo — sivé na slateDark malo 3,4:1). Ťuk = celá záložka, id 'tab_' + t.id.
  //   HL.ui.tabs(ctx, x, y, w, [{ id, label, hotkey, w?, locked? }], vybranéId, { h: 18, panel }) → { id: stav }
  // Bez t.w sa šírka delí rovnako; posledná záložka vždy siaha po x + w.
  // Nápis sa musí zmestiť do záložky (2 px od okraja). Keď sa pri rovnakých šírkach nezmestí (tretia záložka Jazero
  // a dlhší preklad — revízia 2026-10-02: 'Legenden 6/6' presahoval do susednej záložky v de, es aj hu), šírky sa
  // rozdelia podľa dĺžky nápisov; až keď nestačí ani to, VŠETKY záložky prejdú na malé písmo (jeden vzhľad)
  // a posledná možnosť je skrátenie výpustkou (F.fit ho hlási tools/lang_check.js). Kým sa všetko zmestí, nič sa nemení.
  var TAB_PAD = 4;
  U.tabs = function (ctx, x, y, w, tabs, selected, opts) {
    opts = opts || {};
    var P = HL.pal, D = HL.draw, F = HL.font, h = opts.h || 18, gap = 2, n = tabs.length;
    var fixed = tabs.every(function (t) { return t.w > 0; });
    var eq = Math.floor((w - (n - 1) * gap) / n);
    function lockOf(t) { return t.locked && HL.spr && HL.spr.get ? HL.spr.get('icon_lock') : null; }
    function need(t, sm) { var lk = lockOf(t); return F.measure(t.label, sm) + (lk ? lk.width + 3 : 0); }
    var ws = [], acc = x, k;
    for (k = 0; k < n; k++) { ws.push(k === n - 1 ? x + w - acc : (fixed ? tabs[k].w - gap : eq)); acc += fixed ? tabs[k].w : eq + gap; }
    function fits(sm) { return tabs.every(function (t, i) { return need(t, sm) <= ws[i] - TAB_PAD; }); }
    function byNeed(sm) {
      var room = w - (n - 1) * gap, sum = 0, o = [];
      for (var j = 0; j < n; j++) { o.push(need(tabs[j], sm) + TAB_PAD); sum += o[j]; }
      if (sum > room) return null;
      var extra = room - sum, each = Math.floor(extra / n);
      for (j = 0; j < n; j++) o[j] += each;
      o[n - 1] += extra - each * n;
      return o;
    }
    var sm = null;
    if (!fits(null)) {
      var prop = fixed ? null : byNeed(null);
      if (prop) ws = prop;
      else { sm = { small: true }; prop = fixed ? null : byNeed(sm); if (prop) ws = prop; }
    }
    D.rect(ctx, x, y + h - 1, w, 1, P.ink);
    var out = {}, tx = x;
    for (var i = 0; i < n; i++) {
      var t = tabs[i], on = t.id === selected;
      var tw = ws[i];
      var st = HL.w.hit('tab_' + t.id, tx, y, tw, h, { hotkey: t.hotkey || null });
      D.rect(ctx, tx + 1, y, tw - 2, h, P.ink);
      D.rect(ctx, tx, y + 1, tw, h - 1, P.ink);
      D.rect(ctx, tx + 1, y + 1, tw - 2, on ? h - 1 : h - 2, on ? (opts.panel || P.navy) : st.hover ? P.slate : P.slateDark);
      if (on) D.rect(ctx, tx + 2, y + 1, tw - 4, 1, P.amber);
      var lock = lockOf(t), lockW = lock ? lock.width + 3 : 0;
      var room = tw - TAB_PAD - lockW, lw = Math.min(need(t, sm), room + lockW), lx = tx + Math.floor((tw - lw) / 2);
      if (lock) { D.sprite(ctx, lock, lx, y + Math.floor((h - lock.height) / 2)); lx += lockW; }
      var fo = { small: !!sm, maxWidth: room };
      F.draw(ctx, t.label, lx, y + (sm ? Math.floor((h - 5) / 2) - 2 : Math.floor((h - 9) / 2)), on ? P.yellow : st.hover ? P.white : P.greyLight, fo);
      out[t.id] = st;
      tx += tw + gap;
    }
    return out;
  };

  // --------------------------------------------------------------- zoznam končí celým riadkom
  // Vizuálny kritik (2. kolo, D2): spodný okraj zoznamu nesmie pretnúť riadok napoly (tlačidlo
  // "Predať 2 €" useknuté v polovici popisu, ďalší riadok výsledku vykúkal spod lišty). Blok, ktorý by
  // pod spodným okrajom vytŕčal, sa nekreslí a jeho tlačidlo nejde stlačiť; pod posledným celým blokom
  // ostane prázdno a keď je dosť vysoké, povie "↓ ďalej". Horný okraj reže normálne (tam riadok pri
  // posune odchádza). Blok vyšší než výrez sa kreslí vždy — inak by sa nedal nikdy ukázať.
  // Klávesnica: skrytý riadok zaregistruje neviditeľný cieľ TESNE POD výrezom (cut.ghost) — šípka naň
  // skočí, widgets ho posunú do výrezu (reveal) a v ďalšom snímku sa nakreslí celý. Myš/prst ho nestlačí
  // (je mimo orezu).
  //   var sy = HL.w.beginScroll(ctx, id, x, top, w, h, contentH), cut = HL.ui.listCut(top, h, sy);
  //   if (cut.fits(y0, y1)) { …kresli blok… } else cut.ghost('sell_x', bx, by, bw, bh);
  //   HL.w.endScroll(ctx); HL.ui.moreBelow(ctx, cut, 0, 180);
  // Súradnice y0/y1/ghost sú súradnice OBSAHU (ako vo vnútri beginScroll).
  U.listCut = function (top, h, sy) {
    var c = { top: top, bottom: top + h, sy: sy || 0, last: top + (sy || 0), hidden: 0, stopped: false };
    c.fits = function (y0, y1) {
      if (!c.stopped && (y1 - c.sy <= c.bottom || y1 - y0 > h)) { if (y1 > c.last) c.last = y1; return true; }
      c.stopped = true; c.hidden++;
      return false;
    };
    c.ghost = function (id, x, y, w, hh) {
      return HL.w.hit(id, x, Math.max(y, c.bottom + c.sy), w, hh, {});
    };
    return c;
  };
  U.moreBelow = function (ctx, cut, x, w) {
    if (!cut || !cut.hidden) return false;
    var y0 = Math.max(cut.top, cut.last - cut.sy), gap = cut.bottom - y0;
    if (gap < 13) return false;
    HL.font.draw(ctx, HL.i18n.t('ui.common.moreBelow'), x + Math.floor(w / 2), y0 + Math.floor((gap - 9) / 2), HL.pal.grey, { align: 'center' });
    return true;
  };

  // --------------------------------------------------------------- zmenšené obrázky
  // Vizuálny kritik (2. kolo, D4): úhor 32 × 10 zmenšený na polovicu mal v riadku trhu 2 px — a jeden
  // z nich bol tmavý obrys, ktorý na tmavom riadku nie je vidno. Preto:
  //  1. Náhľad ryby sa zmenšuje LEN tak, aby telo ostalo hrubé aspoň T.uiThumbMinPx (medián
  //     nepriehľadných px v stĺpci); radšej menšie zmenšenie a orez chvosta (najviac T.uiThumbCropMax
  //     šírky, strana úst ostáva — HL.spr.fishSize(id).mouth).
  //  2. Ryba v riadku zoznamu leží na PAPIERI (HL.ui.fishTile): všetky sprity majú tmavý obrys a ten na
  //     navy/atramente zmizne (sonda tools/fix_menus_r2.js: 0 % okraja nad 3:1), na sandLight má 94 %.
  //     Neznámy alebo stratený druh = tmavá dlaždica s tieňom (ten istý jazyk ako Encyklopédia).
  HL.T.def('UI', 'uiThumbMinPx', 4, 1, 10, 1, 'Náhľad ryby: najmenšia hrúbka tela (medián px v stĺpci); tenšia ryba sa zmenší menej a chvost sa oreže');
  HL.T.def('UI', 'uiThumbCropMax', 0.25, 0, 0.6, 0.05, 'Náhľad ryby: najviac aký podiel šírky smie orez chvosta ubrať');
  var thumbs = {};
  function scaled(src, inv) {
    var w = Math.max(1, Math.floor(src.width / inv)), h = Math.max(1, Math.floor(src.height / inv));
    var c = HL.draw.canvas(w, h), cx = c.getContext('2d');
    cx.imageSmoothingEnabled = false;
    cx.drawImage(src, 0, 0, src.width, src.height, 0, 0, w, h);
    return c;
  }
  // Medián nepriehľadných pixelov v stĺpci (stĺpce bez pixelu sa nerátajú).
  function thickness(c) {
    var d;
    try { d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; } catch (e) { return 0; }
    var cols = [];
    for (var x = 0; x < c.width; x++) {
      var n = 0;
      for (var y = 0; y < c.height; y++) if (d[(y * c.width + x) * 4 + 3] > 0) n++;
      if (n) cols.push(n);
    }
    cols.sort(function (a, b) { return a - b; });
    return cols.length ? cols[cols.length >> 1] : 0;
  }
  function crop(c, maxW, maxH, keepRight) {
    if (c.width <= maxW && c.height <= maxH) return c;
    var w = Math.min(maxW, c.width), h = Math.min(maxH, c.height);
    var o = HL.draw.canvas(w, h), ox = o.getContext('2d');
    ox.imageSmoothingEnabled = false;
    ox.drawImage(c, keepRight ? c.width - w : 0, Math.floor((c.height - h) / 2), w, h, 0, 0, w, h);
    return o;
  }
  // Obrys po zmenšení: najbližší sused pri 1/3, 1/4 preskočí väčšinu pixelov obrysu a zo svetlej ryby
  // (Ľadová veľryba, Hmlistá dáma) ostal na papieri svetlý fľak (sonda: viditeľná výška 1 px). Každý
  // nepriehľadný pixel na okraji náhľadu dostane farbu, ktorú má na okraji pôvodný sprite (najčastejšia
  // farba jeho obrysu) — farba ostáva z palety, len sa vráti to, čo zmenšenie zahodilo.
  var edgeCache = {};
  function isEdge(d, w, h, x, y) {
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) return true;
    return d[(y * w + x - 1) * 4 + 3] === 0 || d[(y * w + x + 1) * 4 + 3] === 0 || d[((y - 1) * w + x) * 4 + 3] === 0 || d[((y + 1) * w + x) * 4 + 3] === 0;
  }
  function edgeColor(src, key) {
    if (edgeCache[key] !== undefined) return edgeCache[key];
    var d, w = src.width, h = src.height, count = {}, best = null, bn = 0;
    try { d = src.getContext('2d').getImageData(0, 0, w, h).data; } catch (e) { return (edgeCache[key] = null); }
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var i = (y * w + x) * 4;
      if (d[i + 3] === 0 || !isEdge(d, w, h, x, y)) continue;
      var c = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
      count[c] = (count[c] || 0) + 1;
      if (count[c] > bn) { bn = count[c]; best = c; }
    }
    return (edgeCache[key] = best);
  }
  function reoutline(c, rgb) {
    if (rgb == null) return c;
    try {
      var cx = c.getContext('2d'), img = cx.getImageData(0, 0, c.width, c.height), d = img.data, w = c.width, h = c.height, hit = [];
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 0 && isEdge(d, w, h, x, y)) hit.push((y * w + x) * 4);
      for (var k = 0; k < hit.length; k++) { d[hit[k]] = rgb >> 16; d[hit[k] + 1] = (rgb >> 8) & 255; d[hit[k] + 2] = rgb & 255; d[hit[k] + 3] = 255; }
      cx.putImageData(img, 0, 0);
    } catch (e) { /* plátno bez pixelov (testy v node) — náhľad ostane bez zmeny */ }
    return c;
  }
  function fitThick(src, key, maxW, maxH, keepRight) {
    var base = key;
    key = key + ':' + maxW + 'x' + maxH + ':' + HL.T.uiThumbMinPx + ':' + HL.T.uiThumbCropMax;
    if (thumbs[key]) return thumbs[key];
    var s = Math.min(1, maxW / src.width, maxH / src.height);
    var inv = s >= 1 ? 1 : Math.ceil(1 / s);
    var best = scaled(src, inv), used = inv;
    if (inv > 1 && thickness(best) < HL.T.uiThumbMinPx) {
      for (var k = inv - 1; k >= 1; k--) {
        var w = Math.floor(src.width / k), h = Math.floor(src.height / k);
        if (h > maxH || (w - maxW) / w > HL.T.uiThumbCropMax) break; // menšie k = ešte väčší orez
        var c = scaled(src, k);
        if (thickness(c) >= HL.T.uiThumbMinPx) { best = crop(c, maxW, maxH, keepRight); used = k; break; }
      }
    }
    if (used > 1) best = reoutline(best, edgeColor(src, base));
    thumbs[key] = best;
    return best;
  }
  function mouthRight(id, src) {
    var fs = HL.spr.fishSize ? HL.spr.fishSize(id) : null;
    return !(fs && fs.mouth && fs.mouth.x < src.width / 2);
  }
  // HL.ui.thumb ostáva PÔVODNÉ (volajú ho aj dedina, budovy a ponor — ich autori s ním ladia); pravidlo
  // hrúbky je HL.ui.fishThumb a používajú ho len scény, ktoré ho zaviedli (menu, trh, výsledok, príprava).
  U.thumb = function (id, maxW, maxH) { return U.fit(HL.spr.fish(id, 0), 'fish:' + id, maxW, maxH); };
  U.fishThumb = function (id, maxW, maxH) {
    var src = HL.spr.fish(id, 0);
    return fitThick(src, 'fishT:' + id, maxW, maxH, mouthRight(id, src));
  };
  // Tieň druhu do boxu (to isté pravidlo hrúbky ako U.thumb). Jedna implementácia pre všetky scény.
  U.silhouette = function (id, maxW, maxH, color) {
    var src = HL.spr.silhouette(id, 0, color);
    return fitThick(src, 'sil:' + id + ':' + color, maxW, maxH, mouthRight(id, src));
  };
  // Ľubovoľný canvas (tieň, ikona, budova) do boxu; key = pod čím ho uložiť do cache.
  U.fit = function (src, key, maxW, maxH) {
    key = key + ':' + maxW + 'x' + maxH;
    if (thumbs[key]) return thumbs[key];
    var s = Math.min(1, maxW / src.width, maxH / src.height);
    // Len násobky 1/2, 1/3, 1/4 — pixel art pri ľubovoľnom pomere "pláva".
    var inv = s >= 1 ? 1 : Math.ceil(1 / s);
    thumbs[key] = scaled(src, inv);
    return thumbs[key];
  };

  // Ryba v riadku zoznamu: dlaždica (papier = druh poznáš / máš ho; tmavá = neznámy alebo stratený)
  // a na nej náhľad vycentrovaný v (w − 4) × (h − 5). Rám s odrezanými rohmi ako tlačidlá a panely.
  //   HL.ui.fishTile(ctx, 'uhor', x, y, 30, 22)                   farebný sprite na papieri
  //   HL.ui.fishTile(ctx, 'uhor', x, y, 30, 22, { dark: true })   tieň na tmavej dlaždici
  U.TILE = { paper: 'sandLight', paperShade: 'sand', paperRim: 'wood', dark: 'ink', darkRim: 'slateDark', shadow: 'slate' };
  U.fishTile = function (ctx, id, x, y, w, h, opts) {
    opts = opts || {};
    var P = HL.pal, D = HL.draw, dark = !!opts.dark;
    D.rect(ctx, x + 1, y, w - 2, h, P[dark ? U.TILE.darkRim : U.TILE.paperRim]);
    D.rect(ctx, x, y + 1, w, h - 2, P[dark ? U.TILE.darkRim : U.TILE.paperRim]);
    D.rect(ctx, x + 1, y + 1, w - 2, h - 2, P[dark ? U.TILE.dark : U.TILE.paperShade]);
    if (!dark) D.rect(ctx, x + 1, y + 1, w - 2, h - 3, P[U.TILE.paper]);
    var bw = w - 4, bh = h - 5;
    var img = dark ? U.silhouette(id, bw, bh, U.TILE.shadow) : U.fishThumb(id, bw, bh);
    D.sprite(ctx, img, x + 2 + Math.floor((bw - img.width) / 2), y + 2 + Math.floor((bh - img.height) / 2));
    return img;
  };

  // Veľkosť kusu (sim/specimen.js) ako štítok: [text, pozadie, písmo] (mená farieb HL.pal) alebo null.
  // Ukazuje sa len veľký a trofejný — malý a bežný kus je "normálna ryba", štítok by bol šum.
  // Jeden zdroj pre panel boja, kartu na hladine a riadky výsledku.
  //   HL.ui.tierTag('trofejny') -> ['TROFEJ', 'yellow', 'ink'] ; HL.ui.tierTag('bezny') -> null
  // TIER_TAG nesie KĽÚČ textu (ui.common.tier.<id>); tierTag vráti text v aktuálnom jazyku.
  U.TIER_TAG = { velky: ['ui.common.tier.velky', 'orange', 'ink'], trofejny: ['ui.common.tier.trofejny', 'yellow', 'ink'] };
  U.tierTag = function (tier) {
    var d = tier && U.TIER_TAG[tier];
    return d ? [HL.i18n.t(d[0]), d[1], d[2]] : null;
  };
  // Obtiažnosť boja 0..1 → 1..5 bodiek (panel boja).
  U.diffDots = function (D) { return 1 + Math.round(HL.util.clamp01(D || 0) * 4); };

  // --------------------------------------------------------------- výber jazyka (titulka, Nastavenia)
  // Hráč z inej krajiny musí jazyk nájsť BEZ čítania po slovensky: tlačidlo so zemeguľou a skratkou
  // jazyka ('SK ▾'), zoznam jazykov ich VLASTNÝMI menami (Deutsch, Polski…). Jazyk, ktorý ešte nemá
  // preklad (HL.i18n.available), je sivý s poznámkou 'čoskoro' a nedá sa vybrať. Jeden vzhľad pre obe scény.
  //   HL.ui.langButton(ctx, id, x, y) → { hover, focus, down }   (šírka U.LANG_BTN_W, výška U.LANG_BTN_H)
  //   HL.ui.langList(ctx, x, y, w, { rowH, gap }) → výška; riadky = tlačidlá 'lang_<kód>' (nedostupné zakázané)
  //   HL.ui.langPicked() → kód alebo null (V UPDATE: klik/Enter na dostupný riadok)
  //   HL.ui.langApply(kód) → true, keď sa jazyk naozaj zmenil (HL.game.setLang: platí hneď a uloží sa)
  U.LANG_BTN_W = 40; U.LANG_BTN_H = 16;
  var GLOBE = ['..###..', '.#.#.#.', '#..#..#', '#######', '#..#..#', '.#.#.#.', '..###..'];
  U.globe = function (ctx, x, y, color) {
    for (var r = 0; r < GLOBE.length; r++) for (var c = 0; c < GLOBE[r].length; c++) if (GLOBE[r][c] === '#') HL.draw.rect(ctx, x + c, y + r, 1, 1, color);
  };
  U.langButton = function (ctx, id, x, y) {
    var P = HL.pal, D = HL.draw, F = HL.font, w = U.LANG_BTN_W, h = U.LANG_BTN_H;
    var st = HL.w.hit(id, x, y, w, h, { hotkey: 'KeyL' });
    var dy = st.down ? 1 : 0;
    D.rect(ctx, x + 1, y, w - 2, h, P.ink);
    D.rect(ctx, x, y + 1, w, h - 2, P.ink);
    D.rect(ctx, x + 1, y + 1, w - 2, h - 2, P.slateDark);
    D.rect(ctx, x + 1, y + 1 + dy, w - 2, h - 3, st.down ? P.slateDark : st.hover ? P.grey : P.slate);
    if (!st.down) D.rect(ctx, x + 2, y + 1, w - 4, 1, P.grey);
    var info = HL.i18n.info(HL.i18n.lang) || HL.i18n.LANGS[0];
    var label = info.short + ' ▾';
    var tw = F.measure(label), cx = x + Math.floor((w - (7 + 3 + tw)) / 2);
    U.globe(ctx, cx, y + 4 + dy, P.cyan);
    F.draw(ctx, label, cx + 10, y + 2 + dy, P.white, { shadow: P.ink });
    return st;
  };
  U.langList = function (ctx, x, y, w, opts) {
    opts = opts || {};
    var F = HL.font, P = HL.pal, rowH = opts.rowH || 18, gap = opts.gap == null ? 3 : opts.gap, cur = HL.i18n.lang, yy = y;
    for (var i = 0; i < HL.i18n.LANGS.length; i++) {
      var L = HL.i18n.LANGS[i], ok = HL.i18n.available(L.code);
      HL.w.button(ctx, 'lang_' + L.code, x, yy, w, rowH, L.name, { style: L.code === cur ? 'primary' : 'normal', disabled: !ok, autofocus: L.code === cur });
      if (L.code === cur) HL.font.draw(ctx, '✓', x + 6, yy + Math.floor((rowH - 2) / 2) - 5, P.ink);
      if (!ok) F.draw(ctx, HL.i18n.t('ui.common.lang.soon'), x + w - 5, yy + Math.floor((rowH - 2) / 2) - 3, P.grey, { small: true, align: 'right' });
      yy += rowH + gap;
    }
    return yy - gap - y;
  };
  U.langPicked = function () {
    for (var i = 0; i < HL.i18n.LANGS.length; i++) {
      var c = HL.i18n.LANGS[i].code;
      if (HL.w.clicked('lang_' + c) && HL.i18n.available(c)) return c;
    }
    return null;
  };
  U.langApply = function (code) {
    var before = HL.i18n.lang;
    if (!HL.game || !HL.game.setLang || !HL.game.setLang(code)) return false;
    return HL.i18n.lang !== before;
  };
})(globalThis.HL);
