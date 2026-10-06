// Titulná obrazovka (dizajn 15): more za súmraku, dedina ako silueta na myse, logo a menu.
//
// Prečo súmrak: je to chvíľa, keď sa rybári vracajú — teplé okná dediny proti tmavnúcemu
// moru hovoria o hre skôr než ktorýkoľvek text (bezpečie hore, neznámo dole).
// Paralaxa: tri vrstvy sa hýbu rôzne rýchlo — kopce v diaľke pomaly, vlny pri nás rýchlo.
//
// Menu:
// - Pokračovať len keď kariéra MÁ postup (ponor, budova nad štartom, záznam v encyklopédii).
//   Čerstvo vytvorená kariéra bez postupu nie je čo "pokračovať".
// - Nová hra pri existujúcom postupe chce DVA kliky: prvý zmení tlačidlo na výstrahu
//   (T.titleConfirmSec sekúnd), až druhý kariéru zmaže. Esc výstrahu zruší.
//   Potvrdenie sa najprv T.titleArmSec NABÍJA (tlačidlo je zakázané a plní sa pásik): bez toho
//   jeden dvojklik alebo Enter-Enter zmazal celú kariéru (review #16, kritické). Poistka widgetov
//   proti dvojkliku na to nestačí — klávesnicu nekryje a myš kryje len 0,3 s na tom istom mieste.
//   Tlačidlo pri výstrahe mení len nápis, nie polohu ani výšku (druhý klik nesmie trafiť iné).
// - Chyba načítania (HL.game.loadError, review #6/#33): namiesto Pokračovať/Nová hra ukáže
//   tabuľku s chybou a voľby "Obnoviť zálohu" (HL.game.restoreBackup) a "Začať odznova"
//   (HL.game.newCareer). Kým hráč nevyberie, sim neukladá nič (persistOn = false), takže
//   poškodené uloženie ani záloha sa potichu neprepíšu. Začať odznova pri čitateľnej zálohe
//   chce tiež nabité potvrdenie — UI by zálohu potom už neponúklo.
// - Nekonečná hlbina je zamknutá, kým Maják nie je na úrovni 3 — tlačidlo ostáva viditeľné
//   so zámkom a dôvodom (hráč vie, čo ho čaká), ale nedá sa stlačiť.
// - Jazyk (docs/I18N.md): tlačidlo so zemeguľou vpravo hore ('SK ▾', kláves L) otvorí zoznam jazykov
//   vlastnými menami (HL.ui.langList) — hráč z inej krajiny ho nájde bez čítania po slovensky. Kým je
//   zoznam otvorený, menu sa nekreslí (nedá sa omylom stlačiť nič pod ním); Esc/klik mimo ho zavrie.
(function (HL) {
  function t(k, p) { return HL.i18n.t(k, p); }
  var T = HL.T;
  T.def('Titulka', 'titleConfirmSec', 3, 1, 10, 0.5, 'Nová hra: ako dlho čaká výstraha na potvrdenie (s)');
  T.def('Titulka', 'titleArmSec', 0.8, 0.2, 3, 0.1, 'Nová hra: ako dlho po výstrahe je potvrdenie zakázané (s) — dvojklik nezmaže kariéru');

  var W = 180, H = 320, HORIZON = 142, BTN_W = 124;
  function P(n) { return HL.pal[n]; }
  function hash01(i, salt) { return HL.hash(i | 0, salt | 0) / 4294967296; }

  // confirmId = tlačidlo, ktoré práve čaká na potvrdenie ('t_new' | 't_restart' | null),
  // confirm = koľko ešte čaká, arm = koľko sa ešte nabíja (dovtedy je zakázané).
  var S = { t: 0, confirm: 0, confirmId: null, arm: 0, buttons: [], progress: false, fx: null, loadErr: null, backup: null, lang: false, langBox: null };

  // Text chyby z úložiska môže byť anglický text prehliadača so znakmi, ktoré písmo nepozná
  // (štvorčeky by harness hlásil ako chybu) — neznámy znak sa vynechá.
  function fontSafe(s, opts) {
    var out = '';
    for (var ch of String(s || '')) out += HL.font.has(ch, opts) ? ch : (ch === '"' || ch === '\'' ? '' : ' ');
    return out.replace(/ +/g, ' ').trim();
  }

  // Dvojkrokové potvrdenie s nabíjaním: prvé stlačenie zapne výstrahu a nabíjanie, druhé
  // (po nabití) vráti true. Počas nabíjania je tlačidlo zakázané, takže ho nič nestlačí.
  function confirmed(id) {
    if (S.confirmId === id && S.confirm > 0) return S.arm <= 0;
    S.confirmId = id;
    S.arm = T.titleArmSec;
    S.confirm = Math.max(T.titleConfirmSec, T.titleArmSec + 1);
    HL.ui.sfx('error');
    return false;
  }
  function cancelConfirm() { S.confirm = 0; S.arm = 0; S.confirmId = null; }
  function newSeed() { return (Math.random() * 4294967296) >>> 0; } // v UI smie byť náhoda z prehliadača

  function hasProgress(s) {
    if (!s) return false;
    if ((s.stats && s.stats.dives) > 0) return true;
    if (s.encyclopedia && Object.keys(s.encyclopedia).length) return true;
    for (var i = 0; i < HL.data.buildings.length; i++) {
      var b = HL.data.buildings[i];
      if ((s.buildings[b.id] || 0) > (b.start || 0)) return true;
    }
    return false;
  }

  // Dedina na myse vpravo: siluety budov + svietiace okná (tie isté sprity ako v dedine).
  // Rozostúpené, aby siluety nesplynuli do jednej fľaky; akvárium nie — jeho nočná vrstva
  // je celá svietiaca nádrž a v siluete by pôsobila ako modrá diera.
  var SKYLINE = [
    { n: 'bld_chatrc_1', x: 92, dy: 3 }, { n: 'bld_krcma_2', x: 114, dy: 0 },
  ];

  function drawScene(ctx, t) {
    var D = HL.draw;
    // --- obloha za súmraku
    D.ditherGradient(ctx, 0, 0, W, 64, P('ink'), P('navy'), 0, 1);
    D.ditherGradient(ctx, 0, 64, W, 40, P('navy'), P('purple'), 0, 1);
    D.ditherGradient(ctx, 0, 104, W, 24, P('purple'), P('pinkPurple'), 0, 1);
    D.ditherGradient(ctx, 0, 128, W, HORIZON - 128, P('pinkPurple'), P('orange'), 0, 0.8);
    for (var i = 0; i < 30; i++) {
      var sx = Math.floor(hash01(i, 5) * W), sy = Math.floor(hash01(i, 6) * 70);
      var tw = Math.sin(t * (0.8 + hash01(i, 7) * 2) + i);
      if (tw > -0.3) D.px(ctx, sx, sy, tw > 0.8 ? P('white') : P(i % 2 ? 'greyLight' : 'grey'));
    }
    // --- slnko na obzore (spodná polovica zapadne pod more)
    var sunX = 62;
    D.circle(ctx, sunX, HORIZON, 21, P('orange'));
    D.circle(ctx, sunX, HORIZON, 17, P('amber'));
    D.circle(ctx, sunX, HORIZON, 11, P('yellow'));
    // pásy oblakov cez slnko, pomaly sa unášajú
    for (var c = 0; c < 4; c++) {
      var cy = 110 + c * 7, cw = 40 + c * 12;
      var cx = Math.round(((hash01(c, 9) * 260 + t * (2 + c)) % 260) - 60);
      D.rect(ctx, cx, cy, cw, 2, P(c % 2 ? 'plum' : 'purple'));
      D.rect(ctx, cx + 6, cy + 2, cw - 14, 1, P('plum'));
    }
    // --- kopce v diaľke (pomalá vrstva)
    var off1 = t * 1.2;
    for (var x = 0; x < W; x++) {
      var hx = x + off1;
      var y = Math.round(HORIZON - 6 - 5 * (0.6 + 0.4 * Math.sin(hx * 0.05) + 0.2 * Math.sin(hx * 0.17)));
      if (x > 84) continue; // vpravo je mys s dedinou
      D.rect(ctx, x, y, 1, HORIZON - y, P('purple'));
    }
    // --- mys s dedinou (stredná vrstva)
    var mOff = Math.round(Math.sin(t * 0.15) * 3);
    for (var mx = 84; mx < W + 4; mx++) {
      var top = Math.round(HORIZON - 4 - Math.min(16, (mx - 84) * 0.45) - 2 * Math.sin(mx * 0.2));
      D.rect(ctx, mx + mOff, top, 1, HORIZON - top + 1, P('plum'));
    }
    for (var k = 0; k < SKYLINE.length; k++) {
      var b = SKYLINE[k], sil = HL.spr.silhouette(b.n, 0, 'plum'), sz = HL.spr.size(b.n);
      var bx = b.x + mOff, by = HORIZON - 12 - sz.h + b.dy;
      D.sprite(ctx, sil, bx, by);
      D.sprite(ctx, HL.spr.get(b.n + '_lights'), bx, by);
    }
    // maják na špičke mysu s otáčajúcim sa svetlom
    var mk = 'bld_majak_1', msz = HL.spr.size(mk), mX = 154 + mOff, mY = HORIZON - 16 - msz.h;
    D.sprite(ctx, HL.spr.silhouette(mk, 0, 'plum'), mX, mY);
    D.sprite(ctx, HL.spr.get(mk + '_lights'), mX, mY);
    // Kužeľ je nízko pod mottom. Plné pásy (HL.villageArt.beam, ten istý ako v dedine) —
    // ditherovaný sa na 1× čítal ako bodkovaná čiara (vizuálna kritika D9, kolo 2). Telo po
    // ružovej rampe súmraku končí fialovou oblohy, takže lúč do nej zaniká.
    HL.villageArt.beam(ctx, mX + Math.floor(msz.w / 2), mY + 4, t, { speed: 0.8, maxLen: 64, spread: 0.05, tilt: 0, body: ['pink', 'pinkPurple', 'purple'] });

    // --- more
    D.ditherGradient(ctx, 0, HORIZON, W, 30, P('pinkPurple'), P('purple'), 0.2, 1);
    D.ditherGradient(ctx, 0, HORIZON + 30, W, 70, P('purple'), P('navy'), 0, 1);
    D.ditherGradient(ctx, 0, HORIZON + 100, W, H - HORIZON - 100, P('navy'), P('ink'), 0, 0.9);
    // odraz slnka: čiarky pod slnkom, čím ďalej od obzoru, tým užšie a redšie
    for (var r = 0; r < 26; r++) {
      var ry = HORIZON + 2 + r * 3, span = Math.max(3, 30 - r);
      var n = Math.max(1, 5 - (r >> 2));
      for (var q = 0; q < n; q++) {
        var ph = hash01(r * 7 + q, 11);
        if (Math.sin(t * 3 + ph * 20) < 0) continue;
        var rx = Math.round(sunX - span / 2 + ph * span);
        D.rect(ctx, rx, ry, 2 + (r < 6 ? 2 : 0), 1, P(r < 8 ? 'yellow' : r < 16 ? 'amber' : 'orange'));
      }
    }
    // vlny: pomalé pri obzore, rýchle pri nás (paralaxa)
    for (var wv = 0; wv < 16; wv++) {
      var wy = HORIZON + 6 + Math.round(wv * wv * 0.62), sp = 2 + wv * 1.6, per = 20 + wv * 4, len2 = 2 + (wv >> 2);
      for (var j = -1; j < W / per + 2; j++) {
        var wx = Math.round((((j * per + hash01(j + wv * 17, 13) * 12 + t * sp) % (W + per)) + W + per) % (W + per)) - per / 2;
        D.rect(ctx, wx, wy, len2, 1, P(wv < 4 ? 'pinkPurple' : wv < 9 ? 'purple' : 'slateDark'));
      }
    }
    // loďka rybára sa vracia domov
    var boatX = Math.round(18 + Math.sin(t * 0.2) * 6), bob = Math.round(Math.sin(t * 1.5));
    var bs = HL.spr.silhouette('boat_small', 0, 'ink');
    ctx.save(); ctx.beginPath(); ctx.rect(boatX - 2, 0, 30, HORIZON + 36 + bob); ctx.clip();
    D.sprite(ctx, bs, boatX, HORIZON + 36 + bob - 9);
    ctx.restore();
    D.px(ctx, boatX + 14, HORIZON + 24 + bob, P('yellow'));
    D.px(ctx, boatX + 14, HORIZON + 25 + bob, P('amber'));
    for (var bw = -2; bw < 28; bw += 2) D.px(ctx, boatX + bw + (Math.floor(t * 3) % 2), HORIZON + 36 + bob, P('pinkPurple'));
    // čajky (siluety)
    for (var g = 0; g < 2; g++) {
      var gx = Math.round(((hash01(g, 21) * 240 + t * (7 + g * 3)) % 240) - 30), gy = 96 + g * 10 + Math.round(Math.sin(t + g) * 3);
      D.sprite(ctx, HL.spr.silhouette('gull', Math.floor(t * 3 + g) % 2, 'ink'), gx, gy);
    }
  }

  // Logo v tej istej mierke 2× ako nadpisy inde v hre (Spíš…, panely): 3× pixely vedľa 1×/2×
  // pôsobili ako iná hra (vizuálna kritika). Váhu mu dá obrys z ink a tieň z plum.
  var LOGO_S = 2;
  function drawLogo(ctx, time) {
    var F = HL.font, D = HL.draw, o = { align: 'center', scale: LOGO_S };
    var y = 24 + Math.round(Math.sin(time * 1.2) * 1), cx = W / 2;
    var dirs = [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 2], [2, 2]];
    // Názov hry sa neprekladá (značka).
    for (var i = 0; i < dirs.length; i++) F.draw(ctx, 'HLBINA', cx + dirs[i][0], y + dirs[i][1], P(i >= 4 ? 'plum' : 'ink'), o); // i18n-ok: názov hry
    F.draw(ctx, 'HLBINA', cx, y, P('sandLight'), o); // i18n-ok: názov hry
    var lw = F.measure('HLBINA', o), rx = Math.round(cx - lw / 2) - 4, ry = y + 22; // i18n-ok: názov hry
    D.rect(ctx, rx, ry, lw + 8, 1, P('amber'));
    D.rect(ctx, rx + 1, ry + 1, lw + 6, 1, P('orange'));
    F.draw(ctx, t('ui.title.tagline1'), cx, y + 34, P('white'), { align: 'center', shadow: P('ink'), maxWidth: W - 8 });
    F.draw(ctx, t('ui.title.tagline2'), cx, y + 46, P('amber'), { align: 'center', shadow: P('ink'), maxWidth: W - 8 });
  }

  // [ikona][3 px][nápis] vycentrované v tlačidle presne ako HL.w.button (stred verzálok 5 px
  // nad stredom tlačidla), farba LOCKED_TEXT z palety (grey #8b9bb4 na slateDark = 3,4:1).
  var LOCKED_TEXT = 'grey';
  function lockedLabel(ctx, x, y, w, h, label, iconName) {
    var F = HL.font, icon = iconName ? HL.spr.get(iconName) : null, iw = icon ? icon.width + 3 : 0;
    var o = { maxWidth: Math.max(0, w - 6 - iw) }, tw = F.measure(F.fit(label, o.maxWidth, o), o);
    var cx = x + Math.floor((w - (iw + tw)) / 2), midY = y + Math.floor((h - 2) / 2);
    if (icon) HL.draw.sprite(ctx, icon, cx, midY - Math.floor(icon.height / 2));
    F.draw(ctx, label, cx + iw, midY - 5, P(LOCKED_TEXT), o);
  }

  // Tabuľka chyby načítania nad menu: čo sa stalo, že nič neprepadlo a čo obnoví záloha.
  var ERR_W = 164;
  function errorLines() {
    var F = HL.font, sm = { small: true }, out = [];
    function add(text, color, small) {
      // číslo sa neodtrhne od tisícok ani od jednotky (hu zalomilo "25 | 000 €") — nezlomiteľná medzera
      var o = small ? sm : {}, ls = F.wrap(String(text).replace(/(\d) (?=[0-9€%\p{L}])/gu, '$1 '), ERR_W - 12, o);
      for (var i = 0; i < ls.length; i++) out.push({ text: ls[i], color: color, small: !!small });
    }
    add(t('ui.title.errTitle'), 'amber');
    add(t('ui.title.errKept'), 'white', true);
    var b = S.backup;
    if (b) add(t('ui.title.errBackup', { day: b.day + 1, dives: b.dives, money: HL.util.money(Math.floor(b.money)) }), 'greenLight', true);
    else add(t('ui.title.errNoBackup'), 'pink', true);
    // technická príčina (pre hlásenie chyby) — zalomená, najviac 3 riadky. Bez prekladanej úvodnej vety
    // (HL.game.loadErrorDetail); starší stav bez neho: odstráni sa slovenská úvodná veta.
    var detail = HL.game.loadErrorDetail != null ? HL.game.loadErrorDetail : String(S.loadErr).replace(/^Uloženie sa nedá načítať:\s*/, '');
    var tech = fontSafe(detail, sm);
    if (tech) { var tl = F.wrap(tech, ERR_W - 12, sm).slice(0, 3); for (var j = 0; j < tl.length; j++) out.push({ text: tl[j], color: 'grey', small: true }); }
    return out;
  }
  function drawError(ctx, bottom) {
    // riadky po HL.font.lineStep (malé 10, normálne 12): pri 9 px sa diakritika lepila hore
    var F = HL.font, lines = errorLines(), h = 8, sm = { small: true };
    function step(l) { return l.small ? F.lineStep(sm) : F.lineStep(); }
    for (var i = 0; i < lines.length; i++) h += step(lines[i]);
    var x = Math.round((W - ERR_W) / 2), y = Math.max(70, bottom - h);
    HL.draw.panel(ctx, x, y, ERR_W, h, 'dark');
    var yy = y + 4;
    for (var k = 0; k < lines.length; k++) {
      var l = lines[k];
      F.draw(ctx, l.text, x + 6, yy, P(l.color), l.small ? sm : null);
      yy += step(l);
    }
    return { x: x, y: y, w: ERR_W, h: h };
  }

  // Zoznam jazykov nad stmaveným menu: panel so zemeguľou a nadpisom, riadky jazykov, Zavrieť.
  // Klik mimo panela (neviditeľná plocha 'lang_shade' pod ním) zoznam zavrie.
  var LANG_W = 150, LANG_ROW = 18, LANG_GAP = 3;
  function closeLang() { S.lang = false; HL.w.setFocus('t_lang'); }
  function drawLang(ctx) {
    var D = HL.draw, F = HL.font, n = HL.i18n.LANGS.length;
    var listH = n * LANG_ROW + (n - 1) * LANG_GAP;
    var h = 22 + listH + 8 + 20 + 6, x = Math.round((W - LANG_W) / 2), y = Math.max(26, Math.round((H - h) / 2) + 8);
    HL.w.hit('lang_panel', x, y, LANG_W, h, { nav: false }); // klik na panel (nie na riadok) nič nezavrie
    D.panel(ctx, x, y, LANG_W, h);
    HL.ui.globe(ctx, x + 8, y + 7, P('cyan'));
    F.draw(ctx, t('ui.common.lang.title'), x + 20, y + 5, P('amber'), { maxWidth: LANG_W - 28 });
    HL.ui.langList(ctx, x + 6, y + 22, LANG_W - 12, { rowH: LANG_ROW, gap: LANG_GAP });
    HL.w.button(ctx, 'lang_close', x + 6, y + 22 + listH + 8, LANG_W - 12, 20, t('ui.common.close'), {});
    return { x: x, y: y, w: LANG_W, h: h };
  }

  HL.scenes.def('title', {
    enter: function () {
      HL.w.nav = true;
      S.t = 0; cancelConfirm(); S.lang = false; S.langBox = null;
      S.progress = hasProgress(HL.game.save);
      S.loadErr = HL.game.loadError || null;
      S.backup = S.loadErr && HL.game.backupInfo ? HL.game.backupInfo() : null;
      S.fx = HL.fx.create({ w: W, h: H, seed: 3 });
      if (HL.music) HL.music.set('title');
      if (HL.audio && HL.audio.ambience) HL.audio.ambience('sea');
    },
    exit: function () { if (HL.audio && HL.audio.ambience) HL.audio.ambience(null); },

    update: function (dt) {
      S.t += dt;
      S.fx.update(dt);
      if (S.arm > 0) S.arm = Math.max(0, S.arm - dt);
      if (S.confirm > 0) { S.confirm = Math.max(0, S.confirm - dt); if (S.confirm <= 0) cancelConfirm(); }
      // Výber jazyka: kým je otvorený, menu pod ním nič nerobí.
      if (S.lang) {
        var code = HL.ui.langPicked();
        if (code) { HL.ui.langApply(code); closeLang(); return; }
        if (HL.w.clicked('t_lang') || HL.w.clicked('lang_close') || HL.w.clicked('lang_shade') || HL.input.actionPressed('back')) { closeLang(); HL.ui.sfx('ui_back'); }
        return;
      }
      if (HL.w.clicked('t_lang')) { cancelConfirm(); S.lang = true; HL.w.setFocus('lang_' + HL.i18n.lang); return; }
      if (HL.w.clicked('t_continue')) { HL.go('village'); return; }
      if (HL.w.clicked('t_new')) {
        if (S.progress && !confirmed('t_new')) return;
        // Nové semeno kariéry — v UI smie byť náhoda z prehliadača (sim ju dostáva zvonka).
        HL.game.newCareer(newSeed());
        cancelConfirm();
        HL.go('village');
        return;
      }
      if (HL.w.clicked('t_restore')) {
        if (HL.game.restoreBackup && HL.game.restoreBackup()) {
          S.loadErr = null; S.backup = null; cancelConfirm();
          S.progress = hasProgress(HL.game.save);
          HL.ui.toast(t('ui.title.restored'), 'good');
          HL.w.setFocus(S.progress ? 't_continue' : 't_new');
        } else HL.ui.toast(HL.game.restoreError || t('ui.title.restoreFailed'), 'bad');
        return;
      }
      if (HL.w.clicked('t_restart')) {
        if (S.backup && !confirmed('t_restart')) return;
        HL.game.newCareer(newSeed());
        S.loadErr = null; S.backup = null; cancelConfirm();
        HL.go('village');
        return;
      }
      if (HL.w.clicked('t_endless')) { if (HL.game.canEndless()) HL.go('endless'); return; }
      if (HL.w.clicked('t_encyclopedia')) { HL.go('encyclopedia', { back: 'title' }); return; }
      if (HL.w.clicked('t_settings')) { HL.go('settings', { back: 'title' }); return; }
      if (HL.input.actionPressed('back') && S.confirm > 0) { cancelConfirm(); HL.ui.sfx('ui_back'); }
    },

    draw: function (ctx) {
      var time = S.t, F = HL.font;
      drawScene(ctx, time);
      drawLogo(ctx, time);

      // Jazyk: malé tlačidlo vpravo hore (zemeguľa + skratka), na každej titulke. Otvorený zoznam:
      // stmavenie s neviditeľnou plochou (klik mimo = zavrieť) → tlačidlo jazyka nad ním → panel.
      if (S.lang) {
        if (HL.draw.shade) HL.draw.shade(ctx, 0, 0, W, H, 2);
        HL.w.hit('lang_shade', 0, 0, W, H, { nav: false });
        HL.ui.langButton(ctx, 't_lang', W - HL.ui.LANG_BTN_W - 4, 4);
        S.langBox = drawLang(ctx);
        S.buttons = [];
        S.fx.draw(ctx, W, H);
        return;
      }
      HL.ui.langButton(ctx, 't_lang', W - HL.ui.LANG_BTN_W - 4, 4);
      S.langBox = null;

      var locked = !HL.game.canEndless();
      var list = [];
      // Výstraha mení len nápis a farbu; počas nabíjania je tlačidlo zakázané (pásik ukazuje nabitie).
      // Výstraha, ktorá sa bežným písmom nezmestí (sk "Naozaj? Záloha sa nepoužije" 126 px v 118, es, pl…), ide
      // drobným písmom celá — predtým výpustka zjedla práve to, ČO sa stratí. Kratšia ostáva bežným písmom.
      function confirmBtn(id, label, warn, h, style) {
        var on = S.confirmId === id && S.confirm > 0, arming = on && S.arm > 0;
        return { id: id, label: on ? warn : label, h: h, style: on ? 'danger' : style, disabled: arming, arming: arming,
          small: on && F.measure(warn) > BTN_W - 6 };
      }
      if (S.loadErr) {
        var nb = !S.backup;
        list.push({ id: 't_restore', label: t('ui.title.restore'), h: 26, style: 'primary', disabled: nb, note: nb ? t('ui.title.nothingToRestore') : null });
        list.push(confirmBtn('t_restart', t('ui.title.restart'), t('ui.title.restartConfirm'), 24, nb ? 'primary' : 'normal'));
      } else {
        if (S.progress) list.push({ id: 't_continue', label: t('ui.title.continue'), h: 26, style: 'primary' });
        list.push(confirmBtn('t_new', t('ui.title.newGame'), t('ui.title.newGameConfirm'), S.progress ? 24 : 26, S.progress ? 'normal' : 'primary'));
      }
      list.push({ id: 't_endless', label: t('ui.title.endless'), h: 24, icon: locked ? 'icon_lock' : null, disabled: locked, note: locked ? t('ui.title.endlessLocked') : null });
      list.push({ id: 't_encyclopedia', label: t('ui.title.encyclopedia'), h: 24, icon: 'icon_book' });
      list.push({ id: 't_settings', label: t('ui.title.settings'), h: 24, icon: 'icon_gear' });
      var total = 0;
      for (var i = 0; i < list.length; i++) total += list[i].h + (list[i].note ? 9 : 0) + (i ? 5 : 0);
      var y = 307 - total, x = Math.round((W - BTN_W) / 2);
      S.errBox = S.loadErr ? drawError(ctx, y - 6) : null;
      S.buttons = [];
      for (var k = 0; k < list.length; k++) {
        var b = list[k];
        // Zamknutá Nekonečná hlbina: zakázané tlačidlo widgetov píše slate na slateDark = 1,73:1
        // (kritika D1, kolo 2) — nápis aj zámok sa preto kreslia tu, sivou grey (3,4:1), stále
        // tlmene ako zakázané, ale čitateľne. Tlačidlo samo ostáva zakázané (nedá sa stlačiť).
        var own = b.id === 't_endless' && b.disabled;
        HL.w.button(ctx, b.id, x, y, BTN_W, b.h, own ? '' : b.label, { style: b.style, icon: own ? null : b.icon, disabled: b.disabled, autofocus: k === 0, small: !!b.small });
        if (own) lockedLabel(ctx, x, y, BTN_W, b.h, b.label, b.icon);
        if (b.arming) {
          // pásik nabíjania na spodku tlačidla (vnútri — rozloženie sa nemení)
          var f = 1 - S.arm / Math.max(0.01, T.titleArmSec);
          HL.draw.rect(ctx, x + 2, y + b.h - 3, Math.round((BTN_W - 4) * f), 1, P('amber'));
        }
        S.buttons.push({ id: b.id, x: x, y: y, w: BTN_W, h: b.h, disabled: !!b.disabled });
        y += b.h;
        if (b.note) { F.draw(ctx, b.note, W / 2, y + 2, P('greyLight'), { small: true, align: 'center', shadow: P('ink') }); y += 9; }
        y += 5;
      }
      F.draw(ctx, t('ui.title.version', { v: HL.VERSION }), W - 3, H - 9, P('slate'), { small: true, align: 'right' });
      S.fx.draw(ctx, W, H);
    },

    probe: function () {
      return {
        lang: HL.i18n.lang, langPref: HL.i18n.pref, langOpen: S.lang, langBox: S.langBox,
        progress: S.progress, canContinue: S.progress && !S.loadErr, confirmNew: S.confirmId === 't_new' && S.confirm > 0,
        confirm: S.confirm > 0 ? S.confirmId : null, arming: S.arm > 0,
        loadError: S.loadErr, backup: S.backup, errBox: S.errBox || null,
        endlessLocked: !HL.game.canEndless(), buttons: S.buttons.map(function (b) { return b.id; }),
        seed: HL.game.save ? HL.game.save.seed : null,
      };
    },
  });
})(globalThis.HL);
