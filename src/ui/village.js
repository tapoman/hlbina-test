// Dedina — hlavná obrazovka (dizajn 11 a 15.1): budovy, počasie, čas a tlačidlo NA MORE.
//
// Pohľad: stojíme na vode a pozeráme na dedinu, ktorá sa šplhá do kopca. More je DOLE,
// preto hlavné tlačidlo NA MORE leží priamo pri vode (a ponor potom pokračuje pod hladinu).
// Bočné sprity (lode, mólo, dedinčania) majú čiaru vody, takže more v popredí im sedí lepšie
// než vzdialený horizont.
//
// Rozloženie 8 parciel: tri terasy nad sebou + maják na skale pri vode. Každá parcela má
// rezervovanú šírku budovy na ÚROVNI 3 (najširšia 56 px) — dedina sa teda pri raste nikdy
// neprekryje a každá budova je vidieť celá v mierke 1×. Štyri budovy vedľa seba by sa pri
// úrovni 3 do 180 px nezmestili (spolu ~200 px), preto 3 + 2 + 2 + maják.
//   hore (krcma, akvarium, meteostanica) — meteostanica na kopci, kde vidno oblohu
//   stred (chatrc, dielna)               — hráčov domov v strede obrazu
//   breh (trhovisko, navnadaren) + maják na skale — ryby sa predávajú pri móle
//
// Vizuálny progres (dizajn 11): lampy, dedinčania a lode rátame z HL.village.people(save),
// takže čím vyššie úrovne, tým živšia dedina — aj v noci (viac svetiel).
//
// Noc: scéna sa nakreslí denne, potom ju A.nightShade STMAVÍ PO RAMPÁCH PALETY (každá farba
// o T.villageShadeSteps krokov na svojho tmavšieho suseda, HL.pal.darkerRGB) s odstupňovanými
// kruhmi svetla okolo lámp a obývaných budov, a NAVRCH idú svietiace vrstvy okien
// (bld_*_lights). Predtým tma = ink cez Bayerovu šachovnicu: na 1× sa každý sprite rozpadol
// na 1-px mriežku a obrysy aj okná sa stratili v šume (vizuálna kritika D9). Stmavenie po
// rampe dá čisté tmavšie pixely a paleta ostáva presná. Obloha sa nestmavuje — kreslí sa už
// nočnými farbami (navy by inak zmizla v ink a s ňou obzor).
// Hmla (A.fog): opar (vodorovné pásy, hustý pri vode, redne smerom hore) + CHUCHVALCE — dlhé
// jazyky hmly, ktoré sa pomaly unášajú a majú medzery. Každý pixel sa zmieša s farbou hmly
// a nahradí NAJBLIŽŠOU farbou palety — žiadna šachovnica, obrysy ostanú, okná sa kreslia až
// nad ňou (ostanú ostré). V noci je opar slabší: plný pás cez tmavú vodu z nej robil jednu
// plochú farbu (88 % #3a4466) a hmla sa nedala rozoznať (kritika D6, kolo 2) — v noci hmlu
// nesú chuchvalce, pásová obloha so svetlejším oparom pri obzore a kruh okolo mesiaca.
//
// Spoločné kreslenie oblohy a počasia (HL.villageArt) používa aj titulná obrazovka
// a obrazovka budovy — nech je to jedna dedina pod jednou oblohou. Stará elektráreň (ui/elektraren.js)
// berie odtiaľto aj HUD, odznak „!" a menovku budovy.
//
// Rázcestník do Starej elektrárne (jadrové jazero, docs/JAZERO.md) stojí na strednej terase vpravo
// (SIGN) — dedina je plná, 8 parciel. Klik alebo fokus = menovka, ďalší klik = scéna 'elektraren'.
(function (HL) {
  var T = HL.T;
  // Texty pre hráča: i18n.t('ui.village.…') (src/data/lang/sk/village.js). Nie skratka t(): v kreslení
  // dediny je `t` čas animácie (desiatky funkcií) a zatienená skratka by volala číslo (docs/I18N.md §3.6).
  var i18n = HL.i18n;
  T.def('Dedina', 'villageNightDark', 0.6, 0, 1, 0.05, 'Dedina: hustota tmy v noci');
  T.def('Dedina', 'villageTwilightH', 2, 0.5, 4, 0.25, 'Dedina: dĺžka úsvitu a súmraku (h)');
  T.def('Dedina', 'villageDawnH', 6, 4, 9, 0.25, 'Dedina: hodina, keď je po úsvite úplne svetlo');
  T.def('Dedina', 'villageLampR', 16, 4, 40, 1, 'Dedina: polomer svetla lampy (px)');
  T.def('Dedina', 'villageWindowR', 13, 0, 40, 1, 'Dedina: polomer svetla obývanej budovy (px)');
  T.def('Dedina', 'villageWalk', 7, 0, 30, 0.5, 'Dedina: rýchlosť chôdze dedinčanov (px/s)');
  T.def('Dedina', 'villageBob', 1, 0, 4, 1, 'Dedina: hojdanie lodí (px)');
  T.def('Dedina', 'villageLightningSec', 5, 1, 20, 0.5, 'Dedina: priemerný odstup bleskov v búrke (s)');
  T.def('Dedina', 'villageShadeSteps', 2, 0, 4, 1, 'Dedina: o koľko krokov rampy palety stmavne plná noc');
  T.def('Dedina', 'villagePoolInner', 0.55, 0, 1, 0.05, 'Dedina: vnútro kruhu svetla (podiel polomeru) bez stmavenia; zvyšok kruhu o krok menej');
  T.def('Dedina', 'villageFogDensity', 0.5, 0, 1, 0.05, 'Dedina: hustota hmly v najnižšom páse (vyššie pásy redšie)');
  T.def('Dedina', 'villageFogBands', 4, 1, 8, 1, 'Dedina: počet pásov hmly');
  T.def('Dedina', 'villageFogWave', 3, 0, 10, 1, 'Dedina: vlnenie okrajov pásov hmly (px)');
  T.def('Dedina', 'villageFogNightHaze', 0.15, 0, 1, 0.05, 'Dedina: opar v noci ako podiel dennej hustoty (plný opar robí z nočnej vody jednu farbu)');
  T.def('Dedina', 'villageFogStrands', 6, 0, 6, 1, 'Dedina: počet chuchvalcov hmly (0 = len opar)');
  T.def('Dedina', 'villageFogStrandDensity', 0.55, 0, 1, 0.05, 'Dedina: hustota jadra chuchvalca (okraj je 0,55× tohto)');
  T.def('Dedina', 'villageFogStrandThick', 3, 1, 8, 1, 'Dedina: polovičná hrúbka chuchvalca v najhustejšom mieste (px)');
  T.def('Dedina', 'villageFogStrandGap', 0.35, 0, 0.9, 0.05, 'Dedina: ako veľmi sa chuchvalce trhajú (0 = súvislý pás)');
  T.def('Dedina', 'villageFogDrift', 2.5, 0, 12, 0.5, 'Dedina: rýchlosť unášania chuchvalcov (px/s)');
  T.def('Dedina', 'villageMoonHalo', 6, 0, 12, 1, 'Dedina: šírka kruhu okolo mesiaca v hmle (px, 0 = bez)');
  T.def('Dedina', 'villageMoonGlitter', 12, 0, 30, 1, 'Dedina: počet odleskov mesiaca na vode v noci (0 = bez)');
  T.def('Dedina', 'villageModalSteps', 2, 1, 6, 1, 'Dedina: o koľko krokov rampy stmavne scéna pod návodom');
  T.def('Dedina', 'beamSpread', 0.07, 0, 0.3, 0.01, 'Maják: rozširovanie lúča (polovičná výška na px dĺžky)');
  T.def('Dedina', 'beamTilt', -0.12, -0.4, 0.4, 0.02, 'Maják: sklon lúča v dedine (px na px; záporný = hore, preč od chodníka terasy)');
  T.def('Dedina', 'beamClear', 4, 0, 20, 1, 'Maják: odstup konca lúča od parcely Dielne (px)');
  T.def('Dedina', 'gullSunMargin', 4, 0, 10, 1, 'Čajky: odstup od slnka, keď ho obletujú (px)');
  T.def('Dedina', 'gullSwerveDist', 18, 1, 60, 1, 'Čajky: odkiaľ (px od slnka vodorovne) začnú uhýbať nad/pod slnko');

  var W = 180, H = 320, HEAD = 22, BAR_Y = 288;

  // ================================================================== spoločné umenie
  var A = HL.villageArt = {};

  function P(n) { return HL.pal[n]; }
  function hash01(i, salt) { return HL.hash(i | 0, salt | 0) / 4294967296; }
  A.hash01 = hash01;

  // Hodina ako desatinné číslo (6,5 = 06:30).
  function hourF(env) { return env.minuteOfDay / 60; }

  // Tma podľa času: noc plná, súmrak T.villageTwilightH hodín pred 21:00, úsvit rovnako dlho
  // PRED T.villageDawnH. Ráno o 06:00 (začiatok hry aj budíček zo Chatrče) je už svetlo:
  // ditherovaná tma cez celú dedinu vyzerá ako špinavá sieťka, nie ako ráno.
  // Búrka ešte trochu stmaví aj deň.
  A.darkness = function (env) {
    var h = hourF(env), tw = T.villageTwilightH, N = T.villageNightDark, d0 = T.villageDawnH - tw, d;
    if (h >= 21 || h < d0) d = N;
    else if (h < T.villageDawnH) d = N * (1 - (h - d0) / tw);
    else if (h >= 21 - tw) d = N * (h - (21 - tw)) / tw;
    else d = 0;
    if (env.weather === 'storm') d = Math.min(1, d + 0.12);
    return Math.round(d * 100) / 100;
  };
  A.isNight = function (env) { var h = hourF(env); return h >= 21 || h < 5; };
  // Svietia okná a lampy? Už za súmraku, nie až v úplnej tme.
  var LIGHTS_ON = 0.12;
  A.lightsOn = function (env) { return A.darkness(env) >= LIGHTS_ON; };

  // Tri farby oblohy (hore, stred, dole) podľa hodiny a počasia.
  A.skyStops = function (env) {
    var h = hourF(env), w = env.weather;
    if (h >= 21 || h < 5) return w === 'storm' || w === 'rain' ? ['ink', 'navy', 'slateDark'] : w === 'fog' ? ['ink', 'navy', 'slateDark'] : ['ink', 'ink', 'navy'];
    if (w === 'storm') return ['navy', 'slateDark', 'slate'];
    if (w === 'rain') return ['slateDark', 'slate', 'grey'];
    if (w === 'fog') return ['slate', 'grey', 'greyLight'];
    if (h < T.villageDawnH + 1) return ['navy', 'purple', 'pink'];              // úsvit
    if (h >= 21 - T.villageTwilightH) return ['navy', 'purple', 'orange'];      // súmrak
    if (h >= 17) return ['blueDark', 'blue', 'amber'];                           // podvečer
    if (w === 'cloudy') return ['slate', 'grey', 'greyLight'];
    return ['blueDark', 'blue', 'cyan'];
  };

  // Nočná hmla: obloha v PLNÝCH pásoch (ink, navy, pri obzore svetlejší opar slateDark) s mierne
  // zvlnenou hranicou — ditherovaný prechod by bol 1-px sieťka cez celú oblohu (D9) a jednoliata
  // ink (98,7 % plochy) nehovorila nič o hmle (D6).
  var FOG_SKY = [0.3, 0.55]; // hranice pásov ako podiel výšky oblohy
  function skyBands(ctx, x, y, w, h, s) {
    var D = HL.draw, b1 = y + Math.round(h * FOG_SKY[0]), b2 = y + Math.round(h * FOG_SKY[1]);
    D.rect(ctx, x, y, w, h, P(s[0]));
    for (var cx = 0; cx < w; cx++) {
      var y1 = b1 + Math.round(1.5 * Math.sin((x + cx) * 0.07) + Math.sin((x + cx) * 0.023 + 1)), y2 = b2 + Math.round(1.5 * Math.sin((x + cx) * 0.05 + 2));
      D.rect(ctx, x + cx, y1, 1, y + h - y1, P(s[1]));
      D.rect(ctx, x + cx, y2, 1, y + h - y2, P(s[2]));
    }
  }

  A.sky = function (ctx, x, y, w, h, env) {
    var s = A.skyStops(env), D = HL.draw, h1 = Math.floor(h * 0.55);
    if (env.weather === 'fog' && A.isNight(env)) { skyBands(ctx, x, y, w, h, s); return; }
    D.ditherGradient(ctx, x, y, w, h1, P(s[0]), P(s[1]), 0, 1);
    D.ditherGradient(ctx, x, y + h1, w, h - h1, P(s[1]), P(s[2]), 0, 1);
    if (env.event === 'halloween') D.dither(ctx, x, y, w, h, P('purple'), 0.25);
  };

  // Hviezdy (v noci a za súmraku pri jasnej oblohe). Blikajú každá inou fázou.
  A.stars = function (ctx, x, y, w, h, t, env) {
    if (env.weather === 'rain' || env.weather === 'storm' || env.weather === 'fog') return;
    var d = A.darkness(env);
    if (d < 0.2) return;
    var n = Math.round(40 * d);
    for (var i = 0; i < n; i++) {
      var sx = x + Math.floor(hash01(i, 71) * w), sy = y + Math.floor(hash01(i, 72) * h);
      var tw = Math.sin(t * (1 + hash01(i, 73) * 2) + i * 1.7);
      if (tw < -0.6) continue;
      HL.draw.px(ctx, sx, sy, tw > 0.7 ? P('white') : (i % 3 ? P('greyLight') : P('grey')));
    }
  };

  // Slnko cez deň a mesiac (sprite moon_N) v noci; oblúk po oblohe podľa hodiny.
  // Najnižší bod oblúka je nad strechami najvyššej terasy (budovy ho nezakryjú).
  A.sunMoonPos = function (env, x0, x1, yLow, yHigh) {
    var h = hourF(env), night = h >= 20.5 || h < 5.5;
    var f = night ? ((h + 24 - 20.5) % 24) / 9 : (h - 5.5) / 15;
    f = Math.max(0, Math.min(1, f));
    return { night: night, x: Math.round(x0 + (x1 - x0) * f), y: Math.round(yLow - Math.sin(Math.PI * f) * (yLow - yHigh)) };
  };
  A.sunMoon = function (ctx, env, x0, x1, yLow, yHigh) {
    var p = A.sunMoonPos(env, x0, x1, yLow, yHigh), D = HL.draw;
    if (env.weather === 'storm' || env.weather === 'rain') return p;
    if (p.night) {
      // V hmle svetlo mesiaca rozptýli do kruhu: dva plné prstence po rampe (navy, slateDark).
      var halo = Math.round(T.villageMoonHalo);
      if (env.weather === 'fog' && halo > 0) {
        D.circle(ctx, p.x, p.y, 6 + halo, P('navy'));
        D.circle(ctx, p.x, p.y, 6 + Math.ceil(halo / 2), P('slateDark'));
      }
      D.sprite(ctx, HL.spr.get('moon_' + env.moon), p.x - 6, p.y - 6);
    } else if (env.weather === 'fog') {
      // Slnko v hmle = bledý kotúč (predtým štvorec šachovnice 17×17 cez slnko — sieťka, D9).
      D.circle(ctx, p.x, p.y, 7, P('greyLight'));
      D.circle(ctx, p.x, p.y, 5, P('white'));
    } else {
      var h = hourF(env), low = h < 7.5 || h > 18;
      D.circle(ctx, p.x, p.y, 7, P(low ? 'orange' : 'amber'));
      D.circle(ctx, p.x, p.y, 5, P(low ? 'amber' : 'yellow'));
      D.px(ctx, p.x - 2, p.y - 2, P('white'));
      if (env.weather === 'cloudy') {
        // cez slnko ide pás oblaku (plné farby): predtým šachovnica 17×17 (sieťka, D9)
        D.rect(ctx, p.x - 9, p.y + 1, 19, 1, P('greyLight'));
        D.rect(ctx, p.x - 10, p.y + 2, 21, 2, P('grey'));
        D.rect(ctx, p.x - 8, p.y + 4, 16, 1, P('slate'));
      }
    }
    return p;
  };

  // Oblaky: kruhy s tmavším spodkom, pomaly sa unášajú. Počet a farba podľa počasia.
  A.clouds = function (ctx, env, t, x, y, w, h) {
    var wt = env.weather, n = { sun: 2, cloudy: 5, rain: 6, storm: 6, fog: 0 }[wt];
    if (!n) return;
    var night = A.darkness(env) > 0.3;
    var top = wt === 'storm' ? 'slate' : wt === 'rain' ? 'grey' : night ? 'slate' : 'white';
    var mid = wt === 'storm' ? 'slateDark' : wt === 'rain' ? 'slate' : night ? 'slateDark' : 'greyLight';
    var bot = wt === 'storm' ? 'navy' : wt === 'rain' ? 'slateDark' : night ? 'navy' : 'grey';
    var D = HL.draw;
    for (var i = 0; i < n; i++) {
      var span = w + 60, sp = 1.5 + hash01(i, 81) * 2.5;
      var cx = x - 30 + (((hash01(i, 82) * span + t * sp) % span) + span) % span;
      var cy = y + 4 + Math.floor(hash01(i, 83) * (h * 0.7));
      var s = 4 + Math.floor(hash01(i, 84) * 4);
      var puffs = [[-s, 1, s * 0.7], [0, -1, s], [s * 1.1, 1, s * 0.8], [s * 0.4, 2, s * 0.8]];
      for (var k = 0; k < puffs.length; k++) D.circle(ctx, cx + puffs[k][0], cy + puffs[k][1] + 1, puffs[k][2], P(bot));
      for (k = 0; k < puffs.length; k++) D.circle(ctx, cx + puffs[k][0], cy + puffs[k][1], puffs[k][2], P(mid));
      for (k = 0; k < puffs.length; k++) D.circle(ctx, cx + puffs[k][0] - 1, cy + puffs[k][1] - 1, Math.max(1, puffs[k][2] - 2), P(top));
    }
  };

  // Dážď a sneh — nad celou scénou. Hmla má vlastnú vrstvu (A.fog), kreslí sa POD svetlami.
  A.weatherFx = function (ctx, env, t, w, h) {
    var wt = env.weather;
    if (wt === 'rain') HL.fx.rain(ctx, t, 0.55, w, h);
    else if (wt === 'storm') HL.fx.rain(ctx, t, 1, w, h);
    if (env.event === 'winter') HL.fx.snow(ctx, t, wt === 'storm' ? 1 : 0.6, w, h);
  };

  // ---------------------------------------------------------------- stmavenie a hmla po pixeloch
  // Obe čítajú už nakreslené pixely hernej plochy (logické plátno 180×320, ctx môže mať len
  // posun — bočné panely) a zapisujú farby výlučne z palety.
  //
  // Vrstva scény v pamäti s willReadFrequently (softvérové plátno): na plátne hry (GPU) musí
  // každé getImageData počkať, kým sa dokreslí všetko pred ním — v dedine to bolo 3,6 ms za
  // snímok len za stmavenie (merané v prehliadači). Scéna sa preto kreslí sem a na obrazovku
  // ide jedným drawImage. Jedna vrstva na veľkosť, zdieľa ju dedina aj budova.
  var layers = {};
  A.layer = function (w, h) {
    var k = w + 'x' + h, L = layers[k];
    if (L === undefined) {
      var c = HL.draw.canvas(w, h);
      L = layers[k] = c ? c.getContext('2d', { willReadFrequently: true }) : null;
    }
    if (!L) return null;
    L.setTransform(1, 0, 0, 1, 0, 0);
    L.imageSmoothingEnabled = false;
    L.globalAlpha = 1;
    L.fillStyle = HL.pal.ink;
    L.fillRect(0, 0, w, h);
    return L;
  };

  function pixelRect(ctx, x, y, w, h) {
    if (!ctx.getImageData) return null;
    var m = ctx.getTransform ? ctx.getTransform() : null;
    if (m && (m.a !== 1 || m.d !== 1)) return null; // plátno je vždy v logických px; iná mierka = nepodporené
    var tx = m ? m.e : 0, ty = m ? m.f : 0, cw = ctx.canvas ? ctx.canvas.width : x + w + tx, ch = ctx.canvas ? ctx.canvas.height : y + h + ty;
    var X0 = Math.max(0, Math.round(x + tx)), Y0 = Math.max(0, Math.round(y + ty));
    var X1 = Math.min(cw, Math.round(x + w + tx)), Y1 = Math.min(ch, Math.round(y + h + ty));
    if (X1 <= X0 || Y1 <= Y0) return null;
    // lx/ly = logické súradnice ľavého horného pixela (bez posunu)
    return { X: X0, Y: Y0, w: X1 - X0, h: Y1 - Y0, lx: X0 - tx, ly: Y0 - ty };
  }

  // Koľko krokov rampy zodpovedá tme A.darkness (plná noc = T.villageShadeSteps). Kým svietia
  // okná (A.lightsOn — súmrak, aj búrka cez deň), je scéna aspoň o krok tmavšia: rozsvietené
  // okná nad jasne zelenou lúkou pod čiernou búrkou pôsobili ako chyba.
  A.shadeSteps = function (level) {
    if (!(level > 0)) return 0;
    var s = Math.round(level / Math.max(0.05, T.villageNightDark) * T.villageShadeSteps);
    if (level >= LIGHTS_ON && T.villageShadeSteps > 0) s = Math.max(1, s);
    return Math.max(0, Math.min(6, s));
  };

  // Mapa krokov (Uint8Array) sa prepočíta len keď sa zmenia svetlá, tma alebo výrez —
  // svetlá stoja (jediné, čo sa hýbe, je hojdajúca sa loď), takže skoro vždy z cache.
  var shadeCache = { key: null, map: null };
  function shadeMap(r, steps, lights, skyTo, keep) {
    var key = [r.X, r.Y, r.w, r.h, steps, skyTo, T.villagePoolInner].join(',') + '|' +
      (lights || []).map(function (L) { return Math.round(L.x) + ',' + Math.round(L.y) + ',' + Math.round(L.r); }).join(';') + '|' +
      (keep || []).map(function (k) { return k.name + '#' + (k.frame || 0) + '@' + k.x + ',' + k.y; }).join(';');
    if (shadeCache.key === key) return shadeCache.map;
    var w = r.w, h = r.h, map = new Uint8Array(w * h), i, x, y;
    for (y = 0; y < h; y++) {
      var ly = r.ly + y, sky = skyTo != null && ly < skyTo;
      for (x = 0; x < w; x++) map[y * w + x] = sky ? 0 : steps;
    }
    // Budovy, ktoré trčia do oblohy, sa stmavia presne po svojich pixeloch (bitmapa spritu).
    for (var k = 0; keep && k < keep.length; k++) {
      var kp = keep[k], bm = HL.spr.bitmap(kp.name, kp.frame || 0); // snímok: para nad vežou elektrárne má 2
      if (!bm) continue;
      for (var by = 0; by < bm.h; by++) {
        var yy = kp.y + by - r.ly;
        if (yy < 0 || yy >= h || kp.y + by >= skyTo) continue;
        for (var bx = 0; bx < bm.w; bx++) {
          var xx = kp.x + bx - r.lx;
          if (xx >= 0 && xx < w && bm.d[by * bm.w + bx]) map[yy * w + xx] = steps;
        }
      }
    }
    // Kruhy svetla: vnútro bez stmavenia, prstenec o krok menej. Ostré, odstupňované okraje
    // (pixel art), žiadny dither na hrane.
    var inner = T.villagePoolInner;
    for (var l = 0; lights && l < lights.length; l++) {
      var L = lights[l], R = Math.max(0, L.r), ri = R * inner;
      var cx = L.x - r.lx, cy = L.y - r.ly;
      var x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(w - 1, Math.ceil(cx + R));
      var y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(h - 1, Math.ceil(cy + R));
      for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
        i = y * w + x;
        if (!map[i]) continue;
        var dx = x + 0.5 - cx, dy = y + 0.5 - cy, d2 = dx * dx + dy * dy;
        if (d2 <= ri * ri) map[i] = 0;
        else if (d2 <= R * R) map[i] = Math.min(map[i], Math.max(0, steps - 1));
      }
    }
    shadeCache.key = key; shadeCache.map = map;
    return map;
  }

  // Noc po rampách palety: region (x, y, w, h) stmavne o A.shadeSteps(level) krokov, okolo
  // svetiel menej, nad riadkom skyTo len pixely budov z `keep` ([{ name, x, y }]).
  // Vracia počet krokov (0 = nič sa nestalo).
  A.nightShade = function (ctx, x, y, w, h, level, lights, skyTo, keep) {
    var steps = A.shadeSteps(level);
    if (steps <= 0) return 0;
    var r = pixelRect(ctx, x, y, w, h);
    if (!r) { HL.draw.shade(ctx, x, y, w, h, steps); return steps; }
    var map = shadeMap(r, steps, lights, skyTo, keep);
    var img = ctx.getImageData(r.X, r.Y, r.w, r.h), px = new Uint32Array(img.data.buffer);
    var tabs = [];
    for (var s0 = 1; s0 <= steps; s0++) tabs[s0] = table(shadeTabs, s0);
    for (var p = 0; p < map.length; p++) {
      var s = map[p];
      if (!s) continue;
      var tb = tabs[s], c = px[p] & 0xffffff, sl = ((c >>> 19) & 31) | (((c >>> 11) & 31) << 5) | (((c >>> 3) & 31) << 10);
      if (tb.k[sl] !== c) { tb.k[sl] = c; tb.v[sl] = (darkerOf(c, s) | 0xff000000) >>> 0; }
      px[p] = tb.v[sl];
    }
    ctx.putImageData(img, r.X, r.Y);
    return steps;
  };

  // Rýchla cache "farba → farba" nad 32-bit pixelmi (RGBA v pamäti = ABGR ako Uint32 na
  // little-endian): priamo mapovaná tabuľka podľa 5 bitov z každého kanála, s kontrolou celej
  // farby (kolízia sa len prepočíta). Map.get pre každý pixel stál ~1 ms na snímok.
  var shadeTabs = {}, fogTabs = {};
  function table(tabs, id) {
    return tabs[id] || (tabs[id] = { k: new Int32Array(32768).fill(-1), v: new Uint32Array(32768) });
  }
  // px32 má bajty R, G, B v poradí 0x00BBGGRR — prevod na 0xRRGGBB pre paletu a späť.
  function swap(c) { return ((c & 0xff) << 16) | (c & 0xff00) | ((c >>> 16) & 0xff); }
  function darkerOf(c, steps) { return swap(HL.pal.darkerRGB(swap(c), steps)); }

  // Hmla: T.villageFogBands vodorovných pásov od spodku regiónu nahor, najspodnejší s hustotou
  // T.villageFogDensity, každý vyšší redší. Okraje pásov sa pomaly vlnia (celé pixely, nízka
  // frekvencia). Pixel v páse = najbližšia farba palety k zmesi (pixel, farba hmly, hustota).
  var fogColor = { rgb: 0, a: 0 };
  function fogOf(c) { // c = 0x00BBGGRR → zmes s farbou hmly → najbližšia farba palety (0x00BBGGRR)
    var v = swap(c), f = fogColor.rgb, a = fogColor.a;
    var mr = Math.round((v >> 16) * (1 - a) + (f >> 16) * a), mg = Math.round(((v >> 8) & 255) * (1 - a) + ((f >> 8) & 255) * a);
    var mb = Math.round((v & 255) * (1 - a) + (f & 255) * a);
    return swap(HL.pal.darkerRGB((mr << 16) | (mg << 8) | mb, 0));
  }
  // keep = [{ name, x, y }] sprity (budovy, lampy), ktorých pixely hmla VYNECHÁ: budova ostane
  // ostrá pred hmlou. Sivá kamenná Dielňa v sivej hmle inak splynula s pozadím (kritika D4;
  // tools/fix_village_night.js meria kontrast jej obrysu).
  var fogKeep = { key: null, mask: null };
  function keepMask(r, keep) {
    var key = r.X + ',' + r.Y + ',' + r.w + ',' + r.h + '|' + (keep || []).map(function (k) { return k.name + '#' + (k.frame || 0) + '@' + k.x + ',' + k.y; }).join(';');
    if (fogKeep.key === key) return fogKeep.mask;
    var mask = new Uint8Array(r.w * r.h);
    for (var k = 0; keep && k < keep.length; k++) {
      var kp = keep[k], bm = HL.spr.bitmap(kp.name, kp.frame || 0); // snímok: para nad vežou elektrárne má 2
      if (!bm) continue;
      for (var by = 0; by < bm.h; by++) {
        var yy = kp.y + by - r.ly;
        if (yy < 0 || yy >= r.h) continue;
        for (var bx = 0; bx < bm.w; bx++) {
          var xx = kp.x + bx - r.lx;
          if (xx >= 0 && xx < r.w && bm.d[by * bm.w + bx]) mask[yy * r.w + xx] = 1;
        }
      }
    }
    fogKeep.key = key; fogKeep.mask = mask;
    return mask;
  }
  // Chuchvalce hmly: poloha (podiel výšky regiónu odhora), hrúbka a hustota (násobky ladiacich
  // čísel) a smer unášania. Dva v oblohe, dva medzi terasami, dva nad vodou — hmla leží nízko,
  // preto sú spodné hrubšie. (Poradie = poradie vypínania cez T.villageFogStrands.)
  var FOG_STRANDS = [
    { at: 0.85, th: 1, d: 1, dir: 1 },
    { at: 0.95, th: 1.2, d: 1, dir: -1 },
    { at: 0.07, th: 0.5, d: 0.8, dir: -1 },
    { at: 0.46, th: 0.8, d: 1, dir: 1 },
    { at: 0.18, th: 0.7, d: 0.9, dir: 1 },
    { at: 0.68, th: 0.9, d: 1, dir: -1 },
  ];
  var fogLevels = new Uint8Array(0);
  // Opar: T.villageFogBands vodorovných pásov od spodku regiónu nahor, najspodnejší s hustotou
  // T.villageFogDensity (v noci × T.villageFogNightHaze), každý vyšší redší, horné hrany sa
  // pomaly vlnia. Chuchvalce: FOG_STRANDS — jadro T.villageFogStrandDensity, krajné riadky
  // 0,55× toho; hrúbka sa po dĺžke mení a pod T.villageFogStrandGap sa jazyk pretrhne, celý vzor
  // sa unáša T.villageFogDrift px/s. Pixel = najbližšia farba palety k zmesi (pixel, farba hmly,
  // väčšia z hustôt), hustoty zaokrúhlené na 0,05 (málo tabuliek v cache).
  A.fog = function (ctx, env, t, x, y, w, h, keep) {
    if (env.weather !== 'fog') return 0;
    var r = pixelRect(ctx, x, y, w, h);
    if (!r) return 0;
    var skip = keepMask(r, keep), night = A.darkness(env) > 0.3;
    var n = Math.max(1, Math.round(T.villageFogBands)), wave = T.villageFogWave, bh = r.h / n;
    var dens = T.villageFogDensity * (night ? T.villageFogNightHaze : 1);
    var fname = night ? 'slate' : 'greyLight', f = parseInt(HL.pal[fname].slice(1), 16);
    var N = r.w * r.h, lv = fogLevels.length >= N ? fogLevels : (fogLevels = new Uint8Array(N));
    lv.fill(0, 0, N);
    function put(p, a) { var q = Math.round(a * 20); if (q > lv[p]) lv[p] = q; }
    var cx, py, k;
    // (1) opar
    if (dens > 0) {
      for (cx = 0; cx < r.w; cx++) {
        var below = r.h;
        for (k = 0; k < n; k++) {
          var edge = Math.round(r.h - (k + 1) * bh + wave * Math.sin((r.lx + cx) * 0.045 + t * 0.25 + k * 1.9));
          var a = dens * (n - k) / n;
          for (py = Math.max(0, edge); py < Math.min(r.h, below); py++) put(py * r.w + cx, a);
          below = Math.max(0, Math.min(below, edge));
        }
      }
    }
    // (2) chuchvalce (v malom regióne — výklad budovy — tenšie)
    var ns = Math.min(FOG_STRANDS.length, Math.round(T.villageFogStrands)), gap = Math.min(0.95, T.villageFogStrandGap);
    var thickK = Math.max(0.5, Math.min(1, h / 266));
    for (var s = 0; s < ns; s++) {
      var st = FOG_STRANDS[s], thick = T.villageFogStrandThick * st.th * thickK;
      var core = T.villageFogStrandDensity * st.d, rim = core * 0.55;
      var yc0 = Math.round(y + h * st.at) - r.ly, drift = t * T.villageFogDrift * st.dir * (0.7 + 0.1 * s);
      for (cx = 0; cx < r.w; cx++) {
        var u = r.lx + cx - drift;
        var e = 0.5 + 0.35 * Math.sin(u * 0.035 + s * 1.7) + 0.25 * Math.sin(u * 0.09 + s * 4.1);
        var q = (e - gap) / (1 - gap);
        if (q <= 0) continue;
        var half = Math.round(thick * Math.min(1, q));
        if (half <= 0) continue;
        var yc = yc0 + Math.round(wave * 0.5 * Math.sin(u * 0.05 + s * 2.9));
        for (var dy = -half; dy <= half; dy++) {
          py = yc + dy;
          if (py >= 0 && py < r.h) put(py * r.w + cx, Math.abs(dy) < half ? core : rim);
        }
      }
    }
    // (3) zmiešanie s farbou hmly → najbližšia farba palety
    var img = ctx.getImageData(r.X, r.Y, r.w, r.h), px = new Uint32Array(img.data.buffer);
    if (Object.keys(fogTabs).length > 24) fogTabs = {}; // ladenie hustoty cez F2 nesmie nafúknuť pamäť
    var tabs = [];
    fogColor.rgb = f;
    for (var p = 0; p < N; p++) {
      var lq = lv[p];
      if (!lq || skip[p]) continue;
      var tb = tabs[lq] || (tabs[lq] = table(fogTabs, fname + '|' + lq));
      var c = px[p] & 0xffffff, sl = ((c >>> 19) & 31) | (((c >>> 11) & 31) << 5) | (((c >>> 3) & 31) << 10);
      if (tb.k[sl] !== c) { fogColor.a = Math.min(1, lq / 20); tb.k[sl] = c; tb.v[sl] = (fogOf(c) | 0xff000000) >>> 0; }
      px[p] = tb.v[sl];
    }
    ctx.putImageData(img, r.X, r.Y);
    return n + ns;
  };

  // Malá hviezdička 5×5 (úroveň budovy). Plná = dosiahnutá, dutá = ešte nie.
  A.star = function (ctx, x, y, filled) {
    var D = HL.draw;
    var rows = ['..#..', '.###.', '#####', '.###.', '#.#.#'];
    var fill = filled ? P('yellow') : P('slate'), edge = filled ? P('orange') : P('slateDark');
    for (var j = 0; j < 5; j++) for (var i = 0; i < 5; i++) if (rows[j][i] === '#') D.px(ctx, x + i, y + j, j >= 3 ? edge : fill);
  };
  A.levelStars = function (ctx, cx, y, level) {
    var x = Math.round(cx - 9);
    HL.draw.rect(ctx, x - 1, y - 1, 19, 7, P('ink'));
    for (var i = 0; i < 3; i++) A.star(ctx, x + i * 6, y, i < level);
  };

  // Sneh na strechách (zimná udalosť): horný obrys sprite z jeho bitmapy — funguje pre
  // každú budovu a úroveň bez kreslenia zvláštnych zimných spritov.
  var topCache = {};
  A.roofLine = function (name) {
    if (topCache[name]) return topCache[name];
    var b = HL.spr.bitmap(name, 0), out = [];
    if (b) for (var x = 0; x < b.w; x++) {
      var y = -1;
      for (var yy = 0; yy < b.h; yy++) if (b.d[yy * b.w + x]) { y = yy; break; }
      out.push(y);
    }
    topCache[name] = out;
    return out;
  };

  // ================================================================== rozloženie dediny
  // x = ľavý okraj rezervovaného miesta, w = šírka budovy na úrovni 3, gy = riadok zeme.
  var PLOTS = [
    { id: 'krcma', x: 6, w: 56, gy: 112 },
    { id: 'akvarium', x: 68, w: 56, gy: 112 },
    { id: 'meteostanica', x: 130, w: 44, gy: 112 },
    { id: 'chatrc', x: 8, w: 50, gy: 170 },
    { id: 'dielna', x: 70, w: 54, gy: 170 },
    { id: 'trhovisko', x: 4, w: 56, gy: 226 },
    { id: 'navnadaren', x: 68, w: 46, gy: 226 },
    { id: 'majak', x: 133, w: 44, gy: 234 },
  ];
  var TERRACES = [
    { gy: 112, x0: 0, x1: W, walk: [4, 170] },
    { gy: 170, x0: 0, x1: W, walk: [4, 118] },
    { gy: 226, x0: 0, x1: 128, walk: [6, 108] },
  ];
  var LAMPS = [
    { x: 62, gy: 112 }, { x: 64, gy: 226 }, { x: 124, gy: 112 }, { x: 60, gy: 170 }, { x: 117, gy: 226 }, { x: 125, gy: 170 },
  ];
  var SEA_Y = 238;
  A.PLOTS = PLOTS;
  // rázcestník do elektrárne: x = ľavý okraj spritu, gy = riadok zeme strednej terasy
  var SIGN = { x: 148, gy: 170 };
  A.SIGN = SIGN;

  function plotSprite(p, level) {
    var name = 'bld_' + p.id + '_' + level, sz = HL.spr.size(name);
    return { name: name, w: sz.w, h: sz.h, x: p.x + Math.floor((p.w - sz.w) / 2), y: p.gy - (sz.h - 1) };
  }

  // Kopce v diaľke — dve vrstvy siluet (paralaxa pri pohľade z titulky aj tu).
  function hillsY(x, k, base, amp) {
    return Math.round(base - amp * (0.55 + 0.3 * Math.sin(x * 0.045 + k * 2.3) + 0.15 * Math.sin(x * 0.13 + k)));
  }
  A.hills = function (ctx, env, x0, w, base, amp, k, color) {
    for (var x = 0; x < w; x++) {
      var y = hillsY(x + x0, k, base, amp);
      HL.draw.rect(ctx, x, y, 1, base + 60 - y, P(color));
    }
  };
  var HORIZON = 90;
  // Vzdialené more od obzoru y0 po y1 (dedina: 90–112; obrazovka budovy: pás za kopcami).
  function horizonSea(ctx, env, t, y0, y1) {
    y0 = y0 == null ? HORIZON : y0; y1 = y1 == null ? 112 : y1;
    var D = HL.draw, h = hourF(env), night = A.darkness(env) > 0.3;
    var dawn = h < T.villageDawnH + 1 || h >= 21 - T.villageTwilightH;
    var top = night ? 'navy' : env.weather === 'storm' || env.weather === 'rain' ? 'slate' : dawn ? 'pinkPurple' : 'blue';
    var bot = night ? 'ink' : env.weather === 'storm' || env.weather === 'rain' ? 'slateDark' : dawn ? 'purple' : 'blueDark';
    D.ditherGradient(ctx, 0, y0, W, y1 - y0, P(top), P(bot), 0, 0.8);
    var wet = env.weather === 'storm' || env.weather === 'rain';
    D.rect(ctx, 0, y0, W, 1, P(night ? 'slateDark' : wet ? 'grey' : dawn ? 'pink' : 'cyan'));
    // odlesky na vzdialenej vode — krátke, pomalé
    var rows = Math.max(1, Math.min(5, Math.floor((y1 - y0 - 3) / 4)));
    for (var i = 0; i < 14; i++) {
      var y = y0 + 3 + (i % rows) * 4, x = Math.round(((A.hash01(i, 97) * W + t * (1 + (i % 3))) % W));
      if (Math.sin(t * 2 + i) > -0.2) D.rect(ctx, x, y, 2 + (i % 5 > 2 ? 1 : 0), 1, P(night ? 'slate' : dawn ? 'pink' : 'cyan'));
    }
    // plachetnice na obzore
    for (var k = 0; k < 2; k++) {
      var sx = Math.round(((A.hash01(k, 98) * (W + 20) + t * (0.6 + k * 0.4)) % (W + 20)) - 10), sy = y0 - 3 + k * 5;
      var sail = night ? 'slate' : 'white', hull = night ? 'ink' : 'wood';
      D.rect(ctx, sx + 1, sy, 1, 3, P(sail)); D.rect(ctx, sx + 2, sy + 1, 1, 2, P(sail)); D.rect(ctx, sx, sy + 3, 5, 1, P(hull));
    }
  }
  A.horizonSea = horizonSea;
  // Vzdialený kopec vľavo na obzore (vpravo ostáva otvorené more).
  function farHill(ctx, hc) {
    for (var x = 0; x < 70; x++) {
      var y = Math.round(HORIZON - 2 - 12 * Math.max(0, Math.cos(x / 70 * Math.PI / 2)) - 2 * Math.sin(x * 0.3));
      HL.draw.rect(ctx, x, y, 1, HORIZON + 1 - y, P(hc[0]));
    }
  }

  function hillColors(env) {
    var h = hourF(env);
    if (h >= 21 || h < 5) return ['navy', 'ink'];
    if (h < T.villageDawnH + 1 || h >= 21 - T.villageTwilightH) return ['purple', 'plum'];
    if (env.weather === 'fog' || env.weather === 'rain' || env.weather === 'storm') return ['slate', 'slateDark'];
    return ['tealDark', 'greenDark'];
  }

  // Terasa: chodník, kamenný múrik a svah trávy pod ním.
  function terrace(ctx, tr, env, winter) {
    var D = HL.draw, gy = tr.gy;
    D.rect(ctx, tr.x0, gy, tr.x1 - tr.x0, 1, P(winter ? 'white' : 'sandLight'));
    D.rect(ctx, tr.x0, gy + 1, tr.x1 - tr.x0, 2, P(winter ? 'greyLight' : 'sand'));
    D.dither(ctx, tr.x0, gy + 1, tr.x1 - tr.x0, 2, P(winter ? 'white' : 'clay'), 0.25);
    if (gy < SEA_Y - 20) {
      // múrik z kameňov
      for (var j = 0; j < 6; j++) {
        for (var x = tr.x0; x < tr.x1; x++) {
          var row = j >> 1, off = row % 2 ? 3 : 0;
          var mortar = j % 2 === 1 && ((x + off) % 6 === 5) || j === 5;
          D.px(ctx, x, gy + 3 + j, mortar ? P('slateDark') : (j < 1 ? P('grey') : P('slate')));
        }
      }
      D.rect(ctx, tr.x0, gy + 9, tr.x1 - tr.x0, 2, P('greenDark'));
    }
  }

  // dim = o koľko krokov rampy stmaviť (strom kreslený až po nočnom stmavení scény)
  function tree(ctx, x, gy, winter, dim) {
    var D = HL.draw, Q = function (n) { return dim ? HL.pal.darker(n, dim) : P(n); };
    D.rect(ctx, x - 1, gy - 6, 3, 7, Q('wood'));
    D.px(ctx, x - 1, gy - 6, Q('plum'));
    D.circle(ctx, x, gy - 11, 6, Q('ink'));
    D.circle(ctx, x, gy - 11, 5, Q(winter ? 'slate' : 'greenDark'));
    D.circle(ctx, x - 1, gy - 12, 4, Q(winter ? 'greyLight' : 'green'));
    D.circle(ctx, x - 2, gy - 13, 2, Q(winter ? 'white' : 'greenLight'));
  }

  function bush(ctx, x, y, winter, dim) {
    var D = HL.draw, Q = function (n) { return dim ? HL.pal.darker(n, dim) : P(n); };
    D.circle(ctx, x, y, 3, Q('greenDark'));
    D.circle(ctx, x - 1, y - 1, 2, Q(winter ? 'white' : 'green'));
  }
  A.tree = tree; A.bush = bush;

  // Vták obletí slnko: keď by obdĺžnik (x, y, w, h) prekryl kruh `avoid` ({ x, y, r }) +
  // T.gullSunMargin, plynulo uhne nad neho (alebo pod, ak by nad ním narazil do hlavičky) —
  // vychýlenie rastie, ako sa vták blíži k slnku (T.gullSwerveDist px), priamo nad ním je celé.
  // Tmavá čajka cez stlmené červené slnko pod návodom vyzerala ako značka "zákaz vjazdu"
  // (vizuálna kritika D4, kolo 2). Vracia posun y (px).
  function swerve(x, w, y, h, avoid) {
    if (!avoid) return 0;
    var m = T.gullSunMargin, top = avoid.y - avoid.r - m, bot = avoid.y + avoid.r + m;
    if (y + h - 1 < top || y > bot) return 0;
    var dx = Math.max(0, avoid.x - avoid.r - (x + w - 1), x - (avoid.x + avoid.r)), D0 = Math.max(1, T.gullSwerveDist);
    if (dx >= D0) return 0;
    var up = (y + h - 1) - top + 1, down = bot - y + 1, dirUp = y - up >= HEAD + 1 && up <= down + 6;
    var k = 1 - dx / D0; k = k * k * (3 - 2 * k);
    return dirUp ? -Math.round(k * up) : Math.round(k * down);
  }
  A.swerve = swerve;

  // Čajky cez deň (nie v noci ani v daždi) — dedina aj obrazovka budovy. avoid = slnko { x, y, r }.
  A.gulls = function (ctx, env, t, y0, n, avoid) {
    if (A.isNight(env) || env.weather === 'storm' || env.weather === 'rain') return;
    for (var gl = 0; gl < (n || 3); gl++) {
      var gspan = W + 40, gsp = 9 + gl * 4, dir = gl % 2 ? -1 : 1, img = HL.spr.get('gull', Math.floor(t * 3 + gl) % 2);
      var gx2 = Math.round(((hash01(gl, 31) * gspan + t * gsp * dir) % gspan + gspan) % gspan) - 20;
      var gy2 = y0 + gl * 9 + Math.round(Math.sin(t * 0.9 + gl) * 4);
      gy2 += swerve(gx2, img.width, gy2, img.height, avoid);
      HL.draw.sprite(ctx, img, gx2, gy2, { flip: dir < 0 });
    }
  };

  // Lúč majáka (dedina aj titulka): PLNÉ pásy, nie dither — bodkovaný lúč sa na 1× čítal ako
  // bodkovaná čiara a v dedine jeho riedky koniec splýval s výhňou Dielne do jedného žltého
  // pásu (vizuálna kritika D4/D9, kolo 2). Kužeľ = telo (o.body: tri farby od lampy preč, posledná
  // blízka pozadiu, takže lúč do neho zaniká) + 1 px jadro (o.core: yellow → amber → orange).
  // Otáča sa: dĺžka = |cos(t·speed)| × maxLen, smer podľa sin. o = { speed, maxLen, minX, maxX,
  // tilt, spread, body, core }: minX/maxX lúč orežú (v dedine nesmie siahnuť do parcely Dielne),
  // tilt = sklon (px na px). Vracia { x0, x1, y0, y1, len, dir } | null.
  A.beam = function (ctx, lx, ly, t, o) {
    o = o || {};
    var a = t * (o.speed || 0.9), c = Math.cos(a), dir = Math.sin(a) >= 0 ? -1 : 1;
    var reach = dir < 0 ? lx - (o.minX != null ? o.minX : 0) : (o.maxX != null ? o.maxX : W) - lx;
    var len = Math.round(Math.abs(c) * Math.max(0, Math.min(o.maxLen || 60, reach)));
    if (len < 4) return null;
    var D = HL.draw, spread = o.spread != null ? o.spread : T.beamSpread, tilt = o.tilt || 0;
    var CORE = o.core || ['yellow', 'amber', 'orange'], BODY = o.body || ['slate', 'slateDark', 'navy'], y0 = 1e9, y1 = -1e9;
    for (var d = 2; d < len; d++) {
      var band = Math.min(2, Math.floor(3 * d / len));
      var half = Math.floor(d * spread + 0.5), cx = lx + dir * d, cy = Math.round(ly + d * tilt);
      if (half >= 1) D.rect(ctx, cx, cy - half, 1, 2 * half + 1, P(BODY[band]));
      D.px(ctx, cx, cy, P(CORE[band]));
      y0 = Math.min(y0, cy - half); y1 = Math.max(y1, cy + half);
    }
    return { x0: Math.min(lx + dir * 2, lx + dir * (len - 1)), x1: Math.max(lx + dir * 2, lx + dir * (len - 1)), y0: y0, y1: y1, len: len, dir: dir };
  };

  // Skala pod majákom — plochý vrch pre budovu, svah k vode.
  function rocks(ctx) {
    var D = HL.draw;
    for (var x = 122; x < W; x++) {
      var top = x < 131 ? 234 + (131 - x) : 234;
      var bot = 258 + Math.round(Math.sin(x * 0.4) * 2);
      D.rect(ctx, x, top, 1, bot - top, P('slate'));
      D.px(ctx, x, top, P('grey'));
      if (hash01(x, 91) > 0.55) D.px(ctx, x, top + 3 + Math.floor(hash01(x, 92) * 12), P('slateDark'));
      if (hash01(x, 93) > 0.7) D.px(ctx, x, top + 1, P('greyLight'));
      D.rect(ctx, x, bot - 5, 1, 5, P('slateDark'));
    }
  }

  function sea(ctx, env, t, y0) {
    var D = HL.draw, night = A.darkness(env) > 0.3;
    var top = night ? 'navy' : env.weather === 'storm' ? 'slateDark' : 'blue';
    var bot = night ? 'ink' : 'blueDark';
    D.ditherGradient(ctx, 0, y0, W, H - y0, P(top), P(bot), 0.1, 1);
    // Vlnky: čím bližšie (nižšie), tým rýchlejšie a dlhšie — paralaxa na vode.
    var hl = night ? 'slate' : (hourF(env) < 7 || hourF(env) >= 19 ? 'pink' : 'cyan');
    for (var k = 0; k < 9; k++) {
      var y = y0 + 3 + k * 6, sp = 3 + k * 2.2, len = 2 + (k >> 1), period = 23 + k * 3;
      for (var i = -1; i < W / period + 1; i++) {
        var x = Math.round(((i * period + hash01(i + k * 31, 95) * 9 + t * sp * (k % 2 ? 1 : -1)) % (W + period) + W + period) % (W + period)) - period / 2;
        D.rect(ctx, x, y + ((i + k) % 2), len, 1, P(k < 3 ? hl : (i % 2 ? hl : 'white')));
      }
    }
    // Odlesk mesiaca v noci (nie v daždi a búrke): krátke čiarky pod mesiacom, bližšie k nám
    // rozhádzanejšie, blikajú. Nočná voda bola plochá tmavá plocha bez jediného bodu záujmu
    // (kritika D6). Kreslí sa PRED nočným stmavením, preto o 2 kroky rampy svetlejšia farba
    // (greyLight → po stmavení slate; v hmle grey → slateDark, mesiac je za oparom).
    var mp = A.sunMoonPos(env, 14, 118, 52, 32), ng = Math.round(T.villageMoonGlitter);
    if (night && mp.night && ng > 0 && env.weather !== 'rain' && env.weather !== 'storm') {
      var gc = P(env.weather === 'fog' ? 'grey' : 'greyLight'), rowStep = Math.max(2, Math.floor((BAR_Y - y0 - 6) / ng));
      for (var gI = 0; gI < ng; gI++) {
        if (Math.sin(t * 2.3 + gI * 1.7) < -0.35) continue;
        var spread = 3 + gI * 1.3, gx = Math.round(mp.x + (hash01(gI, 101) - 0.5) * 2 * spread);
        D.rect(ctx, gx, y0 + 3 + gI * rowStep, 2 + (gI % 3 === 0 ? 2 : gI % 2), 1, gc);
      }
    }
    // pena pri brehu
    for (var x2 = 0; x2 < 124; x2++) {
      var f = Math.sin(x2 * 0.3 + t * 2) + Math.sin(x2 * 0.11 - t);
      if (f > 0.3) D.px(ctx, x2, y0, P('white'));
      else if (f > -0.4) D.px(ctx, x2, y0, P('greyLight'));
    }
  }

  // Miesta lodí: prvá kotví pri móle, druhá (veľká) vpredu, ďalšie pomaly krúžia vo svojich
  // pruhoch TAM A SPÄŤ (dookola by loď na okraji obrazovky "preskočila"). Kreslia sa
  // odzadu dopredu podľa čiary vody, aby bližšia loď prekryla vzdialenejšiu.
  function boatSlots(n, t) {
    var out = [{ name: 'boat_small', x: 44, water: 247, flip: false, i: 0 }];
    if (n >= 2) out.push({ name: 'boat_big', x: 96, water: 283, flip: true, i: 1 });
    var lanes = [[262, -4, 40], [270, 128, 158], [277, 18, 62], [266, 56, 90]];
    for (var b = 2; b < n; b++) {
      var ln = lanes[(b - 2) % lanes.length], len = ln[2] - ln[1];
      var sp = 2.5 + b * 0.7, u = (hash01(b, 51) * len * 2 + t * sp) % (len * 2), right = u < len;
      out.push({ name: 'boat_small', x: Math.round(ln[1] + (right ? u : len * 2 - u)), water: ln[0], flip: !right, i: b });
    }
    out.sort(function (a, c) { return a.water - c.water; });
    return out;
  }

  // Loď pláva na čiare vody: kreslí sa orezaná nad hladinou (3 px trupu sú pod vodou),
  // na hladine pena. Plný pás vody pod loďou by na ditherovanom mori svietil ako plť.
  function boat(ctx, s, t, env) {
    var D = HL.draw, spr = HL.spr.get(s.name), bob = Math.round(Math.sin(t * 1.6 + s.i * 1.9) * T.villageBob);
    var water = s.water + bob, y = water - spr.height + 3;
    ctx.save();
    ctx.beginPath(); ctx.rect(s.x - 2, y - 2, spr.width + 4, water - y + 2); ctx.clip();
    D.sprite(ctx, spr, s.x, y, { flip: s.flip });
    ctx.restore();
    var night = A.darkness(env) > 0.3;
    for (var k = -2; k < spr.width + 2; k += 2) D.px(ctx, s.x + k + (Math.floor(t * 3 + s.i) % 2), water, P(night ? 'slate' : 'cyan'));
    return { x: s.x, y: y, w: spr.width, h: spr.height, name: s.name, flip: s.flip };
  }

  function lampAt(ctx, l) { HL.draw.sprite(ctx, HL.spr.get('lamp'), l.x, l.gy - 21); }

  // Dedinčan chodí tam a späť po chodníku terasy (poloha je funkcia času — bez stavu).
  function walker(i, t) {
    var tr = TERRACES[i % TERRACES.length];
    var a = tr.walk[0], b = tr.walk[1], len = b - a;
    var sp = T.villageWalk * (0.7 + hash01(i, 61) * 0.6);
    var ph = hash01(i, 62) * len * 2;
    var u = (ph + t * sp) % (len * 2);
    var right = u < len;
    var x = a + (right ? u : len * 2 - u);
    return { x: Math.round(x), gy: tr.gy, right: right, name: i % 2 ? 'villager_b' : 'villager_a', frame: Math.floor(t * 4 + i) % 2 };
  }

  // Girlanda (zima = svetielka, leto = vlajočky) medzi dvoma bodmi s priehybom.
  // dim = o koľko krokov rampy stmaviť farby (noc; vlajočky sa kreslia až po stmavení scény)
  function garland(ctx, x0, y0, x1, y1, sag, kind, t, lit, dim) {
    var D = HL.draw, n = Math.max(2, Math.round((x1 - x0) / 3));
    var cols = kind === 'flags' ? ['red', 'amber', 'cyan', 'greenLight'] : ['red', 'greenLight', 'yellow', 'cyan'];
    for (var i = 0; i <= n; i++) {
      var u = i / n, x = Math.round(x0 + (x1 - x0) * u), y = Math.round(y0 + (y1 - y0) * u + sag * 4 * u * (1 - u));
      D.px(ctx, x, y, P('ink'));
      if (kind === 'flags') {
        if (i % 2 === 0 && i < n) {
          var c = HL.pal.darker(cols[(i >> 1) % cols.length], dim || 0);
          D.rect(ctx, x, y + 1, 3, 1, c); D.rect(ctx, x, y + 2, 2, 1, c); D.px(ctx, x, y + 3, c);
        }
      } else if (i % 2 === 0) {
        var on = !lit || ((i >> 1) + Math.floor(t * 2)) % 3 !== 0;
        D.px(ctx, x, y + 1, on ? P(cols[(i >> 1) % cols.length]) : P('slateDark'));
      }
    }
  }
  // Girlandy visia NAD strechami terasy (medzi lampami a okrajom), nie cez priečelia —
  // vlajočky cez okná sa v mierke 1× menia na farebný šum.
  var GARLANDS = [
    [0, 60, 90, 62, 6], [90, 62, 180, 59, 6],
    [0, 124, 62, 126, 4], [62, 126, 126, 124, 4],
    [0, 186, 64, 188, 4], [64, 188, 118, 186, 4],
  ];
  function garlands(ctx, kind, t, lit, dim) {
    for (var i = 0; i < GARLANDS.length; i++) { var g = GARLANDS[i]; garland(ctx, g[0], g[1], g[2], g[3], g[4], kind, t, lit, dim); }
  }

  function pumpkin(ctx, x, gy, lit) {
    var D = HL.draw;
    D.rect(ctx, x, gy - 4, 6, 4, P('orange'));
    D.rect(ctx, x + 1, gy - 5, 4, 1, P('orange'));
    D.rect(ctx, x, gy - 1, 6, 1, P('rust'));
    D.px(ctx, x + 2, gy - 6, P('green'));
    D.px(ctx, x + 1, gy - 3, lit ? P('yellow') : P('ink'));
    D.px(ctx, x + 4, gy - 3, lit ? P('yellow') : P('ink'));
    D.rect(ctx, x + 2, gy - 2, 2, 1, lit ? P('yellow') : P('ink'));
  }
  var PUMPKINS = [[20, 112], [150, 112], [46, 170], [100, 170], [40, 226]];
  function pumpkins(ctx, lit) { for (var i = 0; i < PUMPKINS.length; i++) pumpkin(ctx, PUMPKINS[i][0], PUMPKINS[i][1], lit); }

  // Statické vrstvy (svah, terasy s múrikmi po pixeloch, skala) sa kreslia raz do plátna
  // v pamäti: múriky sú tisícky 1-px obdĺžnikov a každý snímok by ich kreslil znova.
  var layerCache = {};
  function cached(key, w, h, fn) {
    var c = layerCache[key];
    if (!c) {
      c = layerCache[key] = HL.draw.canvas(w, h);
      // softvérové plátno ako vrstva scény (A.layer): veľké plátno by prehliadač dal na GPU
      // a každé nakreslenie do softvérovej vrstvy by ho muselo čítať späť
      var g = c.getContext('2d', { willReadFrequently: true });
      g.imageSmoothingEnabled = false;
      fn(g);
    }
    return c;
  }

  // Svah každej terasy: hore svetlejší, pri ďalšom múriku tmavší — bez toho je
  // prázdna dedina (samé ruiny) len plochý zelený obdĺžnik. (Noc stmavuje A.nightShade.)
  function ground(ctx, winter) {
    var D = HL.draw;
    var gA = winter ? 'white' : 'green', gB = winter ? 'greyLight' : 'greenDark';
    D.rect(ctx, 0, 112, W, SEA_Y - 112, P(gA));
    D.ditherGradient(ctx, 0, 150, W, 20, P(gA), P(gB), 0, 0.5);
    D.ditherGradient(ctx, 0, 206, W, 20, P(gA), P(gB), 0, 0.5);
    for (var g = 0; g < 90; g++) {
      var gx = Math.floor(hash01(g, 41) * W), gyy = 124 + Math.floor(hash01(g, 42) * 100);
      if (winter) { D.px(ctx, gx, gyy, P(g % 3 ? 'greyLight' : 'grey')); continue; }
      if (g % 6 === 0) { D.px(ctx, gx, gyy, P(g % 12 === 0 ? 'yellow' : 'pink')); continue; }
      D.px(ctx, gx, gyy, P('greenLight')); D.px(ctx, gx + 1, gyy + 1, P('greenDark'));
      if (g % 4 === 1) D.px(ctx, gx, gyy - 1, P('greenLight'));
    }
    // pieskový breh
    D.rect(ctx, 0, 226, 128, SEA_Y - 226, P(winter ? 'greyLight' : 'sand'));
    D.dither(ctx, 0, 229, 128, SEA_Y - 229, P(winter ? 'white' : 'sandLight'), 0.3);
    for (var row = 0; row < 3; row++) {
      terrace(ctx, TERRACES[row], null, winter);
      // schody medzi terasami
      if (row < 2) {
        var ya = TERRACES[row].gy + 3, yb = TERRACES[row + 1].gy;
        for (var sy = ya; sy < yb; sy += 4) { D.rect(ctx, 62 + (row ? 0 : 1), sy, 6, 2, P(winter ? 'white' : 'sand')); D.rect(ctx, 62 + (row ? 0 : 1), sy + 2, 6, 1, P('clay')); }
      }
    }
    tree(ctx, 128, 170, winter); bush(ctx, 3, 180, winter); bush(ctx, 124, 186, winter);
    tree(ctx, 121, 226, winter);
    bush(ctx, 64, 128, winter); bush(ctx, 176, 132, winter);
  }

  // ================================================================== scéna
  var S = {
    t: 0, fx: null, tut: false, hover: null, strike: 0, nextStrike: 3, strikes: 0, thunderAt: -1,
    lastPlots: [], counts: {}, env: null, beam: null,
  };

  function save() { return HL.game.save; }
  function level(id) { return HL.village.level(save(), id); }
  function nameOf(id) { for (var i = 0; i < HL.data.buildings.length; i++) if (HL.data.buildings[i].id === id) return HL.data.buildings[i].name; return id; }

  function showTutorial() {
    var s = save();
    return !!s && !(s.tutorial && s.tutorial.seen && s.tutorial.seen.village) && (s.stats.dives || 0) === 0;
  }

  function closeTutorial() {
    var s = save();
    if (!s.tutorial) s.tutorial = { seen: {} };
    if (!s.tutorial.seen) s.tutorial.seen = {};
    s.tutorial.seen.village = true;
    S.tut = false;
    HL.game.persist();
  }

  function openPlot(id) {
    if (id === 'trhovisko') HL.go('market', { back: 'village' });
    else HL.go('building', { id: id });
  }

  HL.scenes.def('village', {
    enter: function (p) {
      HL.w.nav = true;
      // Návrat z mora (karta na hladine → PRÍSTAV): súhrn výletu, ktorý sa práve skončil.
      if (p && p.trip && p.trip.dives > 0 && HL.data.tripLine) HL.ui.toast(HL.data.tripLine(p.trip), 'info');
      S.t = 0; S.strikes = 0; S.strike = 0; S.nextStrike = 2 + Math.random() * 3; S.thunderAt = -1;
      S.fx = HL.fx.create({ w: W, h: H, seed: 11 });
      S.tut = showTutorial();
      S.hover = null;
      if (HL.music) HL.music.set('village');
      if (HL.audio && HL.audio.ambience) HL.audio.ambience('village');
    },

    exit: function () {
      if (HL.audio && HL.audio.ambience) HL.audio.ambience(null);
    },

    update: function (dt) {
      S.t += dt;
      S.fx.update(dt);
      var env = HL.game.env();
      // Búrka: blesk v náhodných odstupoch, hrom o chvíľu neskôr (zvuk ide pomalšie ako svetlo).
      if (env.weather === 'storm') {
        S.nextStrike -= dt;
        if (S.nextStrike <= 0) {
          S.strike = 0.18; S.strikes++; S.thunderAt = 0.35 + Math.random() * 0.5;
          S.nextStrike = T.villageLightningSec * (0.5 + Math.random());
        }
      }
      if (S.strike > 0) S.strike = Math.max(0, S.strike - dt);
      if (S.thunderAt >= 0) { S.thunderAt -= dt; if (S.thunderAt < 0) HL.ui.sfx('thunder', { vol: 0.6 }); }

      if (S.tut) {
        if (HL.w.clicked('tut_ok') || HL.input.actionPressed('back')) closeTutorial();
        return;
      }
      // Budova má prednosť pred skratkou Enter pre NA MORE: keď je fokus na budove,
      // Enter aktivuje obe (fokus aj skratku) — hráč chcel tú, na ktorej stojí.
      for (var i = 0; i < PLOTS.length; i++) {
        if (HL.w.clicked('bld_' + PLOTS[i].id)) { openPlot(PLOTS[i].id); return; }
      }
      if (HL.w.clicked('go_plant')) { HL.go('elektraren'); return; }
      if (HL.w.clicked('go_encyclopedia')) { HL.go('encyclopedia', { back: 'village' }); return; }
      if (HL.w.clicked('go_settings')) { HL.go('settings', { back: 'village' }); return; }
      if (HL.w.clicked('hud_info')) { hudInfo(env); return; }
      if (HL.w.clicked('go_sea')) { HL.go('prep'); return; }
      if (HL.ui.backPressed()) { if (HL.input.actionPressed('back')) HL.ui.sfx('ui_back'); HL.go('title'); }
    },

    draw: function (screen) {
      // Celá scéna sa kreslí do vrstvy v pamäti a na plátno ide jedným drawImage (A.layer).
      var ctx = A.layer(W, H) || screen;
      var env = S.env = HL.game.env(), s = save(), t = S.t, D = HL.draw;
      var dark = A.darkness(env), lit = A.lightsOn(env), winter = env.event === 'winter';
      var people = HL.village.people(s);
      var interactive = !S.tut;
      var nLamps = Math.min(LAMPS.length, Math.floor(people.lights / 3));

      // --- obloha a pozadie
      A.sky(ctx, 0, HEAD, W, 100, env);
      A.stars(ctx, 0, HEAD, W, 70, t, env);
      A.clouds(ctx, env, t, 0, HEAD, W, 44);
      // Za hornou terasou otvorené more až po obzor (dedina stojí na myse) a vľavo
      // vzdialený kopec — tri roviny hĺbky: obzor, dedina, more pri nás.
      horizonSea(ctx, env, t);
      var hc = hillColors(env);
      farHill(ctx, hc);

      // --- kopec a terasy (zhora nadol = odzadu dopredu)
      // Svah každej terasy: hore svetlejší, pri ďalšom múriku tmavší — bez toho je
      // prázdna dedina (samé ruiny) len plochý zelený obdĺžnik.
      // (Predtým sa sneh za šera kreslil vopred sivší, lebo ink šachovnica cez biely sneh bola
      // mriežka. Noc teraz stmavuje po rampe palety — sneh sa stmaví sám a v kruhu lampy ostane biely.)
      D.sprite(ctx, cached('ground:' + winter, W, SEA_Y, function (g) { ground(g, winter); }), 0, 0);

      var plots = [], row;
      var terraceOf = { 112: 0, 170: 1, 226: 2, 234: 3 };
      for (row = 0; row < 3; row++) {
        // budovy tejto terasy
        for (var i = 0; i < PLOTS.length; i++) {
          if (terraceOf[PLOTS[i].gy] === row) plots.push(drawPlot(ctx, PLOTS[i], winter));
        }
        // lampy tejto terasy (pribúdajú s úrovňami budov)
        for (var l = 0; l < nLamps; l++) if (LAMPS[l].gy === TERRACES[row].gy) lampAt(ctx, LAMPS[l]);
      }
      // --- rázcestník do Starej elektrárne (stredná terasa vpravo)
      var signImg = HL.spr.get('sign_elektraren'), signY = SIGN.gy - (signImg.height - 1);
      D.sprite(ctx, signImg, SIGN.x, signY);

      // --- dedinčania (v noci väčšina doma, v búrke skoro nikto)
      var nWalk = A.isNight(env) ? Math.ceil(people.people / 3) : people.people;
      if (env.weather === 'storm') nWalk = Math.min(nWalk, 1);
      for (var v = 0; v < nWalk; v++) {
        var wk = walker(v, t);
        D.sprite(ctx, HL.spr.get(wk.name, wk.frame), wk.x - 4, wk.gy - 14, { flip: !wk.right });
      }

      // --- sezónna výzdoba (letné vlajočky visia v oblohe, ktorá sa nestmavuje — kreslia sa
      // až po stmavení, rovno tmavšími farbami)
      if (env.event === 'winter') garlands(ctx, 'lights', t, false);
      if (env.event === 'halloween') pumpkins(ctx, false);

      // --- more, potom všetko, čo z neho trčí (skala s majákom, mólo, lode)
      sea(ctx, env, t, SEA_Y);
      D.sprite(ctx, cached('rocks', W, 262, rocks), 0, 0);
      plots.push(drawPlot(ctx, PLOTS[7], winter));
      D.sprite(ctx, HL.spr.get('pier'), 72, SEA_Y - 4);
      var boats = [], nb = people.boats;
      var slots = boatSlots(nb, t);
      for (var b = 0; b < slots.length; b++) boats.push(boat(ctx, slots[b], t, env));
      var big = boats.filter(function (x) { return x.name === 'boat_big'; })[0] || null;

      // --- noc: stmavenie po rampách palety s kruhmi svetla, potom hmla, navrch svietiace okná
      var lights = [], shadeSteps = 0;
      if (dark > 0 && S.strike <= 0) {
        if (lit) {
          for (var q = 0; q < plots.length; q++) {
            if (plots[q].level > 0) lights.push({ x: plots[q].sx + plots[q].sw / 2, y: plots[q].sy + plots[q].sh * 0.55, r: T.villageWindowR + plots[q].level * 2 });
          }
          for (var l2 = 0; l2 < nLamps; l2++) lights.push({ x: LAMPS[l2].x + 3, y: LAMPS[l2].gy - 18, r: T.villageLampR });
          if (big) lights.push({ x: big.x + 18, y: big.y + 13, r: 9 });
        }
        // obloha nad obzorom je už nočná — stmavia sa len budovy, ktoré do nej trčia
        var keep = [];
        for (var kq = 0; kq < plots.length; kq++) if (plots[kq].sy < HORIZON) keep.push({ name: plots[kq].name, x: plots[kq].sx, y: plots[kq].sy });
        shadeSteps = A.nightShade(ctx, 0, HEAD, W, BAR_Y - HEAD, dark, lights, HORIZON, keep);
      }
      if (env.event === 'summer') garlands(ctx, 'flags', t, false, shadeSteps);
      // hmla medzi budovami, nie cez ne (budovy a lampy ostanú ostré pred ňou)
      var fogKeepOut = plots.map(function (pl) { return { name: pl.name, x: pl.sx, y: pl.sy }; });
      fogKeepOut.push({ name: 'sign_elektraren', x: SIGN.x, y: signY });
      for (var fl = 0; fl < nLamps; fl++) fogKeepOut.push({ name: 'lamp', x: LAMPS[fl].x, y: LAMPS[fl].gy - 21 });
      A.fog(ctx, env, t, 0, HEAD, W, BAR_Y - HEAD, fogKeepOut);
      S.beam = null;
      if (lit) {
        for (var q2 = 0; q2 < plots.length; q2++) {
          if (plots[q2].level > 0) D.sprite(ctx, HL.spr.get(plots[q2].name + '_lights'), plots[q2].sx, plots[q2].sy);
        }
        var lg = HL.spr.glowMask('lamp');
        for (var l3 = 0; l3 < nLamps; l3++) if (lg) D.sprite(ctx, lg, LAMPS[l3].x, LAMPS[l3].gy - 21);
        if (big) { var bg = HL.spr.glowMask('boat_big'); if (bg) D.sprite(ctx, bg, big.x, big.y, { flip: big.flip }); }
        S.beam = level('majak') > 0 ? beam(ctx, plots[plots.length - 1], t) : null;
        if (env.event === 'halloween') pumpkins(ctx, true);
        if (winter) garlands(ctx, 'lights', t, true);
      }
      // slnko/mesiac a hviezdy nad tmou (inak by ich dither rozbil)
      var sm = A.sunMoon(ctx, env, 14, 118, 52, 32);
      if (dark >= 0.3) A.stars(ctx, 0, HEAD, W, 40, t, env);

      // --- vtáky (cez deň a nie v daždi)
      var sunAvoid = sm && !sm.night ? { x: sm.x, y: sm.y, r: 7 } : null;
      A.gulls(ctx, env, t, 30, 3, sunAvoid);
      if (!A.isNight(env) && env.weather !== 'storm' && env.weather !== 'rain' && env.event === 'spring') springBirds(ctx, t, sunAvoid);

      // --- počasie a blesk
      A.weatherFx(ctx, env, t, W, H);
      if (S.strike > 0) D.dither(ctx, 0, HEAD, W, H - HEAD, P('white'), Math.min(1, S.strike / 0.18) * 0.75);

      // --- hviezdy úrovní, odznaky, menovky (UI — nad tmou)
      S.hover = null;
      var affordable = [], labels = [];
      for (var k2 = 0; k2 < plots.length; k2++) {
        var pl = plots[k2];
        A.levelStars(ctx, pl.p.x + pl.p.w / 2, pl.p.gy + 3, pl.level);
        var info = HL.village.upgradeInfo(s, pl.p.id);
        pl.badge = null;
        if (info.ok) { pl.badge = '!'; affordable.push(pl.p.id); badge(ctx, pl.sx + pl.sw - 3, pl.sy - 4, t, k2); }
        if (pl.p.id === 'trhovisko' && s.storage.length) { pl.badge = pl.badge || 'fish'; fishBadge(ctx, pl.sx + 1, pl.sy - 5, s.storage.length); }
        if (interactive) {
          var hy = Math.min(pl.sy - 2, pl.p.gy - 24);
          pl.hit = { x: pl.p.x, y: hy, w: pl.p.w, h: pl.p.gy + 9 - hy };
          var st = HL.w.hit('bld_' + pl.p.id, pl.hit.x, pl.hit.y, pl.hit.w, pl.hit.h);
          if (st.hover || st.focus) { labels.push(pl); if (st.hover) S.hover = pl.p.id; }
        }
      }
      for (var lb = 0; lb < labels.length; lb++) nameTag(ctx, labels[lb], s);
      S.sign = { x: SIGN.x - 4, y: signY - 6, w: signImg.width + 8, h: SIGN.gy + 9 - (signY - 6) };
      // Rázcestník stojí ZA budovami (kreslí sa pred nimi): jeho plocha na klik končí nad parcelou, ktorá ho
      // prekrýva — Maják na úrovni 2–3 siaha lampou až pod tabuľu (revízia 2026-10-02: klik na lampu majáka
      // otvoril elektráreň a nad prekryvom sa kreslili obe menovky).
      for (var sp = 0; sp < plots.length; sp++) {
        var ph = plots[sp].hit;
        if (ph && ph.x < S.sign.x + S.sign.w && S.sign.x < ph.x + ph.w && ph.y < S.sign.y + S.sign.h && S.sign.y < ph.y + ph.h) S.sign.h = Math.max(8, ph.y - S.sign.y);
      }
      if (interactive) {
        var sh = HL.w.hit('go_plant', S.sign.x, S.sign.y, S.sign.w, S.sign.h);
        if (sh.hover || sh.focus) { signTag(ctx, signImg.width); if (sh.hover) S.hover = 'elektraren'; }
      }
      S.lastPlots = plots;
      S.counts = { boats: boats.length, walkers: nWalk, lamps: nLamps, lights: lights.length, people: people.people, affordable: affordable, sun: sm, shadeSteps: shadeSteps, fog: env.weather === 'fog' };

      S.fx.draw(ctx, W, H);
      hud(ctx, env, s, interactive);
      bottomBar(ctx, interactive);
      if (S.tut) tutorialPanel(ctx);
      if (ctx !== screen) screen.drawImage(ctx.canvas, 0, 0);
    },

    // Riadky malého písma pod sebou idú po F.lineStep (8 + 2 px), nie po 7–8 px: pri 7 px sa
    // diakritika spodného riadku lepila na písmeno nad ňou ('zajtra' → 'zajtŗa', 'Dnes' →
    // 'Dneş', kritika D2 kolo 2). Riadok predpovede aj mesiaca = presne dva riadky textu.
    drawPanel: function (ctx, side, pw, ph) {
      var s = save(), env = S.env || HL.game.env(), D = HL.draw, F = HL.font;
      var sm = { small: true }, LS = F.lineStep(sm), smw = { small: true, lineHeight: LS };
      D.panel(ctx, 2, 2, pw - 4, ph - 4);
      var x = 8, w = pw - 16, y = 8;
      if (side === 'L') {
        var fc = HL.village.forecast(s, env);
        y = HL.ui.section(ctx, x, y, w, i18n.t('ui.village.panel.forecast'));
        var secH = y - 8, rowH = 2 * LS;
        if (!fc.hours) {
          D.sprite(ctx, HL.spr.get(HL.world.weatherIcon(env.weather, env.m)), x, y + 1);
          F.draw(ctx, HL.world.weatherName(env.weather, env.m), x + 15, y + 2, P('white'), { maxWidth: w - 15 });
          y += 16;
          y += F.drawWrapped(ctx, i18n.t('ui.village.panel.noMeteo'), x, y, w, P('grey'), smw) + 4;
        } else {
          F.draw(ctx, i18n.t('ui.village.panel.hours', { h: fc.hours }), x + w, y - 13, P('grey'), { small: true, align: 'right' });
          // Koľko riadkov predpovede sa zmestí nad blok Mesiaca (ten musí ostať celý v paneli).
          var intro = fc.intro ? F.wrap(i18n.t('ui.village.panel.intro'), w, sm) : [];
          var moonTop = ph - 6 - secH - (fc.moon ? 3 * rowH : 2 * LS);
          var maxRows = Math.max(1, Math.floor((moonTop - 4 - y - (intro.length ? intro.length * LS + 3 : 0)) / rowH));
          for (var i = 0; i < fc.segments.length && i < maxRows; i++) {
            var sg = fc.segments[i];
            D.sprite(ctx, HL.spr.get(HL.world.weatherIcon(sg.weather, sg.from)), x, y + 2);
            F.draw(ctx, segLabel(sg, env), x + 15, y + 1, P('greyLight'), { small: true, maxWidth: w - 15 });
            F.draw(ctx, HL.world.weatherName(sg.weather, sg.from), x + 15, y + 1 + LS, P('white'), { small: true, maxWidth: w - 15 });
            y += rowH;
          }
          for (var ii = 0; ii < intro.length; ii++) F.draw(ctx, intro[ii], x, y + ii * LS, P('amber'), sm);
          if (intro.length) y += intro.length * LS + 3;
        }
        y = fc.hours ? Math.max(y + 4, Math.min(214, ph - 6 - secH - (fc.moon ? 3 * rowH : 2 * LS))) : y + 8;
        y = HL.ui.section(ctx, x, y, w, i18n.t('ui.village.panel.moon'));
        if (fc.moon) {
          var labelsM = [i18n.t('ui.village.panel.today'), i18n.t('ui.village.panel.tomorrow'), i18n.t('ui.village.panel.dayAfter')];
          for (var m = 0; m < 3; m++) {
            D.sprite(ctx, HL.spr.get('moon_' + fc.moon[m]), x, y + 2);
            F.draw(ctx, labelsM[m], x + 15, y + 1, P('grey'), sm);
            F.draw(ctx, HL.world.moonName(fc.moon[m]), x + 15, y + 1 + LS, P('white'), { small: true, maxWidth: w - 15 });
            y += rowH;
          }
        } else {
          F.drawWrapped(ctx, i18n.t('ui.village.panel.noMoon'), x, y, w, P('grey'), smw);
        }
      } else {
        y = HL.ui.section(ctx, x, y, w, i18n.t('ui.village.panel.hot'));
        var hot = HL.market.hot(s);
        if (!hot.length) { F.drawWrapped(ctx, i18n.t('ui.village.panel.hotNone'), x, y, w, P('grey'), smw); y += 12; }
        for (var hI = 0; hI < hot.length; hI++) {
          var th = HL.ui.thumb(hot[hI].id, 16, 10);
          D.sprite(ctx, th, x, y + 1 + Math.floor((10 - th.height) / 2));
          F.draw(ctx, fishName(hot[hI].id), x + 19, y + 1, P('white'), { small: true, maxWidth: w - 44 });
          F.draw(ctx, i18n.t('ui.village.panel.hotMult', { mult: HL.util.num(Math.round(hot[hI].mult * 10) / 10) }), x + w, y + 1, P('yellow'), { small: true, align: 'right' });
          y += 13;
        }
        y += 6;
        y = HL.ui.section(ctx, x, y, w, i18n.t('ui.village.panel.storage'));
        var cap = HL.village.storageCap(s), n = s.storage.length;
        F.draw(ctx, i18n.plural(cap, 'ui.village.panel.storageCount', { got: n }), x, y, P('white'), { small: true });
        D.bar(ctx, x, y + 9, w, 5, cap ? n / cap : 0, n >= cap ? P('red') : P('greenLight'));
        y += 18;
        if (n) y += F.drawWrapped(ctx, i18n.t('ui.village.panel.sellHint'), x, y, w, P('grey'), smw) + 4;
        y += 4;
        y = HL.ui.section(ctx, x, y, w, i18n.t('ui.village.panel.quests'));
        if (level('krcma') < 2) {
          F.drawWrapped(ctx, i18n.t('ui.village.panel.questsLocked'), x, y, w, P('grey'), smw);
        } else {
          var qs = HL.village.quests(s);
          for (var qi = 0; qi < qs.length && y < ph - 30; qi++) {
            var lines = F.wrap(HL.ui.nb(qs[qi].text), w, sm).slice(0, 3);
            for (var li = 0; li < lines.length; li++) F.draw(ctx, lines[li], x, y + li * LS, P('white'), sm);
            y += (lines.length - 1) * LS + 8 + 1;
            D.bar(ctx, x, y, w, 4, qs[qi].count ? qs[qi].got / qs[qi].count : 0, P('amber'));
            y += 8;
          }
        }
      }
    },

    probe: function () {
      var env = S.env || HL.game.env(), s = save();
      var fc = HL.village.forecast(s, env);
      return {
        tutorial: S.tut,
        day: env.day + 1, clock: HL.world.clockLabel(env.m), period: env.period, weather: env.weather, event: env.event,
        dark: A.darkness(env), lightsOn: A.lightsOn(env), strikes: S.strikes,
        plots: S.lastPlots.map(function (p) {
          return { id: p.p.id, level: p.level, sprite: p.name, x: p.sx, y: p.sy, w: p.sw, h: p.sh, badge: p.badge || null, hit: p.hit || null };
        }),
        affordable: S.counts.affordable || [],
        hovered: S.hover, focused: HL.w.focused(),
        boats: S.counts.boats, walkers: S.counts.walkers, people: S.counts.people, lamps: S.counts.lamps, lightHoles: S.counts.lights, shadeSteps: S.counts.shadeSteps || 0, fogLayer: !!S.counts.fog,
        beam: S.beam || null,
        sign: S.sign || null,
        moonHud: level('meteostanica') >= 3, forecastHours: fc.hours,
        storage: s.storage.length, cap: HL.village.storageCap(s),
        sun: S.counts.sun ? { night: S.counts.sun.night, x: S.counts.sun.x, y: S.counts.sun.y } : null,
      };
    },
  });

  // ------------------------------------------------------------------ kúsky kreslenia
  function drawPlot(ctx, p, winter) {
    var lvl = level(p.id), sp = plotSprite(p, lvl), img = HL.spr.get(sp.name);
    HL.draw.sprite(ctx, img, sp.x, sp.y);
    if (winter) {
      var top = A.roofLine(sp.name);
      for (var x = 0; x < top.length; x++) if (top[x] >= 0 && top[x] < sp.h - 3) {
        HL.draw.px(ctx, sp.x + x, sp.y + top[x], P('white'));
        if (x % 3 !== 1) HL.draw.px(ctx, sp.x + x, sp.y + top[x] + 1, P('greyLight'));
      }
    }
    return { p: p, level: lvl, name: sp.name, sx: sp.x, sy: sp.y, sw: sp.w, sh: sp.h };
  }
  A.plotSprite = plotSprite;

  // Svetlo majáka (A.beam): otáča sa, doľava končí T.beamClear px pred parcelou Dielne (inak
  // jeho koniec ležal na jej výhni) a mierne stúpa (T.beamTilt) — lampa je vo výške chodníka
  // strednej terasy a vodorovný lúč sa s ním zlieval.
  function beam(ctx, pl, t) {
    var lvl = pl.level, die = PLOTS.filter(function (q) { return q.id === 'dielna'; })[0];
    var lx = pl.sx + Math.floor(pl.sw / 2), ly = pl.sy + (lvl >= 3 ? 7 : lvl === 2 ? 5 : 4);
    return A.beam(ctx, lx, ly, t, { speed: 0.9, maxLen: 40 + lvl * 20, minX: die.x + die.w + T.beamClear, tilt: T.beamTilt });
  }

  // Kŕdeľ (jarná udalosť): 5 bodiek v klíne x0−12 … x0+1, riadky base−2 … base+7 (s mávaním) —
  // ako čajky obletí slnko (swerve), inak by ho preťal pri rannom a večernom slnku.
  function springBirds(ctx, t, avoid) {
    var x0 = ((t * 14) % (W + 60)) - 40, base = 44;
    base += swerve(Math.round(x0) - 13, 15, base - 2, 10, avoid);
    for (var i = 0; i < 5; i++) {
      var x = Math.round(x0 - Math.abs(i - 2) * 6), y = Math.round(base + Math.abs(i - 2) * 3 + Math.sin(t * 5 + i) * 1);
      var up = Math.floor(t * 6 + i) % 2;
      HL.draw.px(ctx, x, y, P('ink')); HL.draw.px(ctx, x + 1, y + (up ? -1 : 1), P('ink')); HL.draw.px(ctx, x - 1, y + (up ? -1 : 1), P('ink'));
    }
  }

  function badge(ctx, x, y, t, i) {
    var bob = Math.round(Math.sin(t * 5 + i) * 1), D = HL.draw;
    D.circle(ctx, x, y + bob, 5, P('ink'));
    D.circle(ctx, x, y + bob, 4, P('yellow'));
    D.px(ctx, x - 1, y - 2 + bob, P('white'));
    D.rect(ctx, x, y - 2 + bob, 1, 3, P('ink'));
    D.px(ctx, x, y + 2 + bob, P('ink'));
  }

  function fishBadge(ctx, x, y, n) {
    var D = HL.draw, txt = String(n), tw = HL.font.measure(txt, { small: true });
    var w = 13 + tw + 3;
    D.rect(ctx, x, y, w, 11, P('ink'));
    D.rect(ctx, x + 1, y + 1, w - 2, 9, P('blueDark'));
    D.sprite(ctx, HL.spr.get('icon_fish'), x + 1, y + 1);
    HL.font.draw(ctx, txt, x + 13, y + 1, P('white'), { small: true });
  }

  function nameTag(ctx, pl, s) {
    var F = HL.font, D = HL.draw;
    var info = HL.village.upgradeInfo(s, pl.p.id);
    var title = nameOf(pl.p.id);
    var sub = pl.level === 0 ? (info.next ? i18n.t('ui.village.tag.build', { money: HL.util.money(info.cost) }) : '')
      : info.next ? i18n.t('ui.village.tag.level', { level: pl.level, money: HL.util.money(info.cost) }) : i18n.t('ui.village.tag.done');
    if (pl.p.id === 'trhovisko') sub = s.storage.length ? i18n.plural(s.storage.length, 'ui.village.tag.sell') : i18n.t('ui.village.tag.sellNone');
    var w = Math.max(F.measure(title), F.measure(sub, { small: true })) + 8;
    var x = Math.round(pl.sx + pl.sw / 2 - w / 2);
    x = Math.max(2, Math.min(W - 2 - w, x));
    // podnadpis 13 px pod nadpisom (nie 11): pod dotiahnutím 'j' v "Maják" by sa inak
    // diakritika malého písma prilepila hore (kritika D2 — trieda "riadky pod sebou")
    var y = Math.max(HEAD + 2, pl.sy - 26);
    D.panel(ctx, x, y, w, 23, 'paper');
    F.draw(ctx, title, x + 4, y + 1, P('plum'));
    F.draw(ctx, sub, x + 4, y + 14, info.ok ? P('greenDark') : P('wood'), { small: true });
  }

  function hud(ctx, env, s, interactive) {
    var D = HL.draw, F = HL.font;
    D.rect(ctx, 0, 0, W, HEAD, P('ink'));
    D.rect(ctx, 0, HEAD - 1, W, 1, P('slateDark'));
    F.draw(ctx, HL.world.dayLabel(env.m), 5, 1, P('white'));
    F.draw(ctx, HL.world.clockLabel(env.m), 42, 1, P('greyLight'));
    // Jasná noc: "Slnečno" so slnkom o polnoci by pôsobilo ako chyba — ukáže sa Jasno a mesiac.
    var clearNight = env.weather === 'sun' && A.isNight(env);
    var sub = HL.world.periodName(env.period) + ' · ' + HL.world.weatherName(env.weather, env.m);
    F.draw(ctx, sub, 5, 12, P('grey'), { small: true, maxWidth: 80 });
    D.sprite(ctx, HL.spr.get(HL.world.weatherIcon(env.weather, env.m)), 88, 5);
    if (level('meteostanica') >= 3 && !clearNight) D.sprite(ctx, HL.spr.get('moon_' + env.moon), 102, 5);
    // Zostatok sa ukazuje ZAOKRÚHLENÝ NADOL: 39,60 € ako "40 €" vedľa ceny 40 € a zakázaného
    // Postaviť pôsobilo ako chyba (review #25). Kto má 39 €, vidí, že na 40 € nemá.
    var txt = HL.util.money(Math.floor(s.money + 1e-9)), mw = F.measure(txt);
    F.draw(ctx, txt, W - 5 - mw, 5, P('yellow'), { shadow: P('plum') });
    // Ťuk na čas/počasie povie podrobnosti — na mobile nie sú bočné panely.
    if (interactive) HL.w.hit('hud_info', 0, 0, 116, HEAD - 1, { nav: false });
  }

  function hudInfo(env) {
    var s = save(), fc = HL.village.forecast(s, env);
    // Počasie ide doprostred vety malým písmenom (NEMČINA by chcela veľké — docs/I18N.md, zatiaľ v kóde).
    var p = { period: HL.world.periodName(env.period), weather: HL.i18n.lower(HL.world.weatherName(env.weather, env.m)) };
    var key = 'ui.village.hud.now';
    if (fc.hours && fc.segments.length > 1) {
      key = 'ui.village.hud.forecast';
      p.time = HL.world.clockLabel(fc.segments[1].from);
      p.next = HL.i18n.lower(HL.world.weatherName(fc.segments[1].weather, fc.segments[1].from));
    } else if (!fc.hours) key = 'ui.village.hud.noForecast';
    HL.ui.toast(i18n.t(key, p), 'info');
  }

  function bottomBar(ctx, interactive) {
    var D = HL.draw;
    D.rect(ctx, 0, BAR_Y, W, H - BAR_Y, P('ink'));
    D.rect(ctx, 0, BAR_Y, W, 1, P('slateDark'));
    var dis = !interactive;
    HL.w.button(ctx, 'go_encyclopedia', 4, BAR_Y + 4, 30, 26, '', { icon: 'icon_book', disabled: dis, nav: interactive });
    HL.w.button(ctx, 'go_sea', 38, BAR_Y + 3, 104, 28, i18n.t('ui.village.toSea'), { style: 'primary', hotkey: dis ? null : 'Enter', disabled: dis, nav: interactive, autofocus: true });
    HL.w.button(ctx, 'go_settings', W - 34, BAR_Y + 4, 30, 26, '', { icon: 'icon_gear', disabled: dis, nav: interactive });
  }

  function tutorialPanel(ctx) {
    var D = HL.draw, F = HL.font;
    // Stmaví sa len scéna (hlavička a lišta ostanú čitateľné) — po rampách palety o
    // T.villageModalSteps krokov, nie ink šachovnicou (tá na 1× robila z dediny mriežku; kritika D9).
    D.shade(ctx, 0, HEAD, W, BAR_Y - HEAD, T.villageModalSteps);
    var x = 10, w = 160, y = 58;
    var text = i18n.t('ui.village.tut.text');
    var warn = i18n.t('ui.village.tut.warn');
    var l1 = F.wrap(text, w - 14), l2 = F.wrap(warn, w - 14), NS = F.lineStep();
    var h = 20 + l1.length * NS + 6 + l2.length * NS + 40;
    D.panel(ctx, x, y, w, h, 'paper');
    F.draw(ctx, i18n.t('ui.village.tut.title'), x + w / 2, y + 6, P('plum'), { align: 'center' });
    D.rect(ctx, x + 20, y + 17, w - 40, 1, P('woodLight'));
    var yy = y + 22;
    for (var i = 0; i < l1.length; i++) F.draw(ctx, l1[i], x + 7, yy + i * NS, P('wood'));
    yy += l1.length * NS + 6;
    for (var j = 0; j < l2.length; j++) F.draw(ctx, l2[j], x + 7, yy + j * NS, P('redDark'));
    yy += l2.length * NS + 8;
    HL.w.button(ctx, 'tut_ok', x + w / 2 - 45, yy, 90, 26, i18n.t('ui.village.tut.ok'), { style: 'primary', hotkey: 'Enter', autofocus: true });
  }

  // "06:00–09:00" dnes, "zajtra 06:00–09:00", "deň 3 06:00–09:00" (n = číslo dňa ako HL.world.dayLabel).
  function segLabel(sg, env) {
    var d0 = HL.world.day(sg.from), today = env.day;
    var key = d0 === today ? 'ui.village.seg.today' : d0 === today + 1 ? 'ui.village.seg.tomorrow' : 'ui.village.seg.later';
    return i18n.t(key, { n: d0 + 1, from: HL.world.clockLabel(sg.from), to: HL.world.clockLabel(sg.to) });
  }
  A.segLabel = segLabel;
  // Menovka rázcestníka: kam vedie a čo tam je (jadrové jazero) — ten istý papierik ako pri budovách.
  function signTag(ctx, sw) {
    var F = HL.font, D = HL.draw;
    var title = i18n.t('ui.village.plant.name'), sub = i18n.t('ui.village.plant.sub');
    var w = Math.max(F.measure(title), F.measure(sub, { small: true })) + 8;
    var x = Math.max(2, Math.min(W - 2 - w, Math.round(SIGN.x + sw / 2 - w / 2)));
    var y = Math.max(HEAD + 2, SIGN.gy - 50);
    D.panel(ctx, x, y, w, 23, 'paper');
    F.draw(ctx, title, x + 4, y + 1, P('plum'));
    F.draw(ctx, sub, x + 4, y + 14, P('wood'), { small: true });
  }
  // Pre Starú elektráreň (ui/elektraren.js): tá istá hlavička, odznak a menovka budovy.
  A.hud = hud; A.hudInfo = hudInfo; A.badge = badge; A.nameTag = nameTag; A.cached = cached;
  A.clearCached = function () { layerCache = {}; };   // testy: vrstvy sa nakreslia znova (sonda vidí, čím sa kreslia)

  var fishById = null;
  function fishName(id) {
    // oba lovné miesta: kus z jadrového jazera v Chatrči má meno, nie id (revízia 2026-10-02)
    if (!fishById) fishById = HL.util.byId(HL.data.allFish.concat(HL.data.allLegends));
    return fishById[id] ? fishById[id].name : id;
  }
  A.fishName = fishName;
})(globalThis.HL);
