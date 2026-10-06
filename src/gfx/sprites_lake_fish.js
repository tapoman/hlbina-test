// Ryby-mutanty jadrového jazera (docs/JAZERO.md, data/fish.js HL.data.lakeFish / lakeLegends).
// Kreslia sa TÝM ISTÝM spôsobom ako morské ryby (gfx/sprites.js): HL.spr.kit.fishDef + fishBody / eelBody,
// indexy palety ENDESGA 32, bokorys, ryba hľadí DOPRAVA, 1 px tmavý obrys, 2 snímky (mávnutie chvostom),
// svietiaca vrstva (b.glow) len pri druhoch s glow: true. Zmluva mien a rozmerov: tools/sheet_check.js.
// Majiteľ: žiadna mechanika žiarenia — mutácia musí byť čitateľná priamo z obrázka (dve hlavy, tretie oko,
// turbína namiesto chvosta…). Tón: útulná arkáda, mutanty skôr smiešne než strašidelné, nikdy krvavé.
(function (HL) {
  'use strict';
  var K = HL.spr.kit;

  // Vlastný tvar (druhá hlava, prísavka…) vyfarbený ako telo: v každom stĺpci podľa výšky v ňom
  // (chrbát tmavší, brucho svetlejšie — to isté svetlo zhora ako paintBody).
  function shadeShape(b, fill, bands, under) {
    var cols = {}, seen = {};
    fill(function (x, y) {
      var k = x + ',' + y;
      if (seen[k]) return;
      seen[k] = 1;
      var c = cols[x] || (cols[x] = { top: y, bot: y, ys: [] });
      if (y < c.top) c.top = y;
      if (y > c.bot) c.bot = y;
      c.ys.push(y);
    });
    Object.keys(cols).forEach(function (kx) {
      var x = +kx, c = cols[kx], n = c.bot - c.top;
      c.ys.forEach(function (y) {
        var col = K.band(bands, n ? (y - c.top) / n : 0.5);
        if (under && y === c.bot && n >= 2) col = under;
        b.px(x, y, col);
      });
    });
    return cols;
  }
  function polyFill(pts) { return function (fn) { K.shapePoly(pts, fn); }; }
  function ellFill(cx, cy, rx, ry) { return function (fn) { K.shapeEll(cx, cy, rx, ry, fn); }; }
  function both(a, c) { return function (fn) { a(fn); c(fn); }; }

  // ================================================================ Chladiace jazero
  // Dvojhlavý kapor: vysoký bronzový kapor s veľkými šupinami a fúzmi; z pleca mu vyrastá druhá,
  // menšia hlava (dopredu a nahor) — každá má vlastné oko, ústa a fúz.
  K.fishDef('dvojhlavy_kapor', 32, 24, function (b, f) {
    var bands = [[0.18, 'wood'], [0.45, 'woodLight'], [0.8, 'amber'], [1, 'sand']];
    // tmavší tón pod šupinou podľa farby pod ňou (o stupeň rampy nižšie)
    var DARK = { wood: 'plum', woodLight: 'wood', amber: 'clay', sand: 'clay' };
    // šupiny: rady oblúčikov "v" (spodný okraj šupiny), striedavo posunuté — samotné bodky sa čítali ako
    // fliačiky a slepý kritik kapra nespoznal. Mení len farby tela (obrys ani priehľadné pixely nie).
    function scales(b, x0, x1, top, bot) {
      for (var x = x0; x <= x1; x++) for (var y = top(x) + 1; y <= bot(x) - 1; y++) {
        var row = Math.floor((y - 1) / 3);
        if ((y - 1) % 3 !== 0 || (x + (row % 2) * 2) % 4 !== 0) continue;
        [[-1, 0], [0, 1], [1, 0]].forEach(function (d) {
          var cur = HL.pal.names[b.at(x + d[0], y + d[1]) - 1];
          if (DARK[cur]) b.px(x + d[0], y + d[1], DARK[cur]);
        });
      }
    }
    // druhá hlava s krkom — kreslí sa PRED telom, telo ju pri pleci prekryje a obrys ide okolo oboch.
    // Bez jantárového pásu: jantárová špička na malej hlave pôsobila ako kačací zobák. V 2. snímku kývne nadol.
    var nod = f ? 0.6 : 0;
    var hd = shadeShape(b, both(polyFill([[16.5, 11], [19, 7], [22, 4.5 + nod], [23.5, 7.8 + nod], [21, 10.5]]), ellFill(25.3, 5.2 + nod, 3.5, 2.7)),
      [[0.2, 'wood'], [0.62, 'woodLight'], [1, 'sand']], 'woodLight');
    var G = K.fishBody(b, f, {
      x0: 8, x1: 27, cy: 15,
      top: [1.8, 6, 2.8, 0.45, 'round'], bot: [1.8, 4.8, 2.2, 0.5, 'round'],
      bands: bands, under: 'clay',
      tail: { type: 'fork', len: 6, spread: 5, c: 'woodLight', c2: 'wood', notch: 0.4 },
      dorsal: [{ a: 0.1, z: 0.44, h: 2.6, c: 'wood', spine: 'woodLight' }],
      anal: [{ a: 0.12, z: 0.24, h: 2, c: 'clay' }, { a: 0.46, z: 0.56, h: 1.4, c: 'clay', shape: 'round' }],
      pattern: function (b, G) {
        // šupiny len na tele, nie na hlave
        scales(b, G.x0 + 2, G.X(0.7), function (x) { return G.cols[x].top; }, function (x) { return G.cols[x].bot; });
      },
      gill: { t: 0.78, c: 'wood', skip: 1 },
      pect: { t: 0.74, len: 4, c: 'clay', r: 0.66 },
      eye: { x: 24, y: 12, size: 2 },
    });
    // druhá hlava: šupiny na krku, skrela, oko, pysky; vráska na krku ju oddelí od pleca
    scales(b, 19, 21, function (x) { return hd[x].top; }, function (x) { return Math.min(hd[x].bot, 9); });
    var hy = Math.round(5.2 + nod);
    b.line(23, hy - 1, 23, hy + 1, 'wood'); b.px(22, hy + 2, 'wood');
    K.eye(b, 25, hy - 2, 2);
    b.px(28, hy + 1, 'ink'); b.px(27, hy + 1, 'ink');
    b.line(19, 10, 22, 9, 'wood');
    // pysky a ústa hlavnej hlavy
    var my = G.rel(27, 0.6);
    b.px(27, my, 'ink'); b.px(28, my - 1, 'clay'); b.px(28, my, 'clay');
    b.outline('ink');
    // fúzy (kapor ich má v kútikoch úst) — na oboch hlavách; svetlé, oranžový fúz sa čítal ako "visiaci pixel"
    b.px(27, my + 1, 'sand'); b.px(27, my + 2, 'sand'); b.px(26, my + 3, 'sand'); b.px(29, my + 1, 'sand'); b.px(30, my + 2, 'sand');
    b.px(28, hy + 2, 'sand'); b.px(28, hy + 3, 'sand');
    b.meta.mouth = [29, my];
  });

  // Svietiaca plotica: strieborná so zelenkavým chrbtom, červené oko (plotica ho naozaj má),
  // oranžovočervené plutvy, hlboko vykrojený chvost a svietiaca zelená bočná čiara.
  K.fishDef('svietiaca_plotica', 16, 10, function (b, f) {
    var G = K.fishBody(b, f, {
      x0: 4, x1: 13, cy: 5,
      top: [1, 3.3, 1.3, 0.45], bot: [1, 2.9, 1.1, 0.5],
      // chrbát modrosivý, nie zelený: voda plytčiny jazera je green/greenDark a pixely v jej farbe pôsobili
      // ako diery (19 px) — zelenú dáva svietiaca bočná čiara
      bands: [[0.2, 'slateDark'], [0.38, 'slate'], [0.72, 'greyLight'], [1, 'white']], under: 'grey',
      tail: { type: 'fork', len: 4, spread: 3, c: 'clay', notch: 0.35 },
      dorsal: [{ a: 0.42, z: 0.62, h: 1.6, c: 'slateDark' }],
      anal: [{ a: 0.16, z: 0.3, h: 1.2, c: 'orange' }, { a: 0.5, z: 0.6, h: 1.2, c: 'orange' }],
      mouth: { r: 0.6 },
    });
    // červené oko: dúhovka (červená) so zrenicou a odleskom
    b.px(11, 3, 'red'); b.px(12, 3, 'white'); b.px(11, 4, 'red'); b.px(12, 4, 'ink');
    // svietiaca bočná čiara od žiabier k chvostu (súvislá; tri bodky striedavo s bielou pôsobili ako zrnenie)
    for (var x = 5; x <= 9; x++) b.glow(x, 5, 'greenLight');
    b.meta.mouth = [14, G.rel(13, 0.6)];
  });

  // Trojoký ostriež: žltozlatý ostriež s tmavými pruhmi, ostnatou chrbtovou a oranžovými plutvami —
  // a s TRETÍM okom na čele: rovnaké oko ako to obyčajné, priamo nad ním (dve oči na jednom boku = mutant).
  // Slepý kritik: biela očná guľa nad obrysom = "hrbolček", žlté oko trčiace nad hlavu = "časť plutvy";
  // až rovnaké oko VNÚTRI hlavy sa číta ako oko. Bok je žltý, tmavé časti tealDark, nie zelené: voda
  // Chladiaceho jazera je green → greenDark (HL.pal.lakeAt) a pixely vo farbe vody pôsobia ako diery.
  K.fishDef('trojoky_ostriez', 16, 15, function (b, f) {
    K.fishBody(b, f, {
      x0: 3, x1: 14, cy: 8.5,
      top: [1.3, 4.3, 2.4, 0.5], bot: [1.3, 3.4, 1.6, 0.5],
      bands: [[0.25, 'tealDark'], [0.62, 'yellow'], [0.85, 'amber'], [1, 'sandLight']],
      tail: { type: 'trunc', len: 3, spread: 2.8, c: 'orange', c2: 'rust' },
      dorsal: [{ a: 0.22, z: 0.48, h: 2, c: 'tealDark', spine: 'amber' }, { a: 0.04, z: 0.2, h: 1.2, c: 'tealDark', shape: 'flat' }],
      anal: [{ a: 0.18, z: 0.32, h: 1.2, c: 'orange' }, { a: 0.55, z: 0.62, h: 1.6, c: 'orange' }],
      pattern: function (b, G) {
        [4, 6, 8].forEach(function (x) {
          var c = G.cols[x];
          for (var y = c.top + 1; y <= c.top + Math.round((c.bot - c.top) * 0.7); y++) b.px(x, y, 'tealDark');
        });
        // tretie oko na čele so žltým viečkom (oddelí zrenicu od tmavého chrbta)
        b.px(9, 5, 'yellow'); b.px(10, 4, 'yellow'); b.px(11, 4, 'yellow');
        K.eye(b, 10, 5, 2);
      },
      eye: { x: 12, y: 8, size: 2 },
      mouth: { r: 0.65, len: 2 },
    });
  });

  // ================================================================ Zatopená hala
  // Olovená šťuka: dlhá olovenosivá, plutvy ďaleko vzadu (ako šťuka), plochý kačací zobák so zubami,
  // na boku vypuklé nity v dvoch radoch — ryba z olovených plátov.
  K.fishDef('olovena_stuka', 32, 12, function (b, f) {
    K.fishBody(b, f, {
      x0: 6, x1: 24, cy: 6,
      top: [1.2, 2.5, 1.9, 0.45, 'blunt'], bot: [1.2, 2.7, 2.2, 0.5, 'blunt'],
      bands: [[0.25, 'slateDark'], [0.62, 'slate'], [1, 'grey']], under: 'slate',
      tail: { type: 'fork', len: 5, spread: 3.8, c: 'slate', c2: 'slateDark', notch: 0.35 },
      dorsal: [{ a: 0.04, z: 0.24, h: 2.2, c: 'slate', edge: 'grey', shape: 'flat' }],
      anal: [{ a: 0.03, z: 0.21, h: 2, c: 'slate', edge: 'grey', shape: 'flat' }, { a: 0.5, z: 0.58, h: 1.4, c: 'slate', edge: 'grey' }],
      pattern: function (b, G) {
        // nity: vypuklé hlavičky 2 × 2 v dvoch striedavých radoch (svetlá vľavo hore, tieň vpravo dole) —
        // po 1 px ich slepý kritik vôbec nezbadal ("plain grey with no spots"), biele pôsobili ako druhý rad zubov
        [[9, 0.2], [13, 0.2], [17, 0.2], [11, 0.62], [15, 0.62]].forEach(function (p) {
          var x = p[0], y = G.rel(x, p[1]);
          b.px(x, y, 'greyLight'); b.px(x + 1, y, 'grey'); b.px(x, y + 1, 'grey'); b.px(x + 1, y + 1, 'slateDark');
        });
        // kačací zobák: plochá horná čeľusť rozšírená na konci, dlhšia spodná, papuľa so zubami
        b.rect(24, 4, 5, 1, 'slate'); b.rect(24, 5, 6, 1, 'grey'); b.px(29, 4, 'slate');
        b.rect(23, 7, 7, 1, 'greyLight'); b.px(30, 7, 'grey'); b.rect(24, 8, 5, 1, 'grey');
        b.line(22, 6, 30, 6, 'ink');
        [24, 27].forEach(function (x) { b.px(x, 6, 'white'); });
        b.px(25, 7, 'white'); b.px(28, 7, 'white');
      },
      pect: { t: 0.72, len: 3, c: 'grey', r: 0.75 },
      eye: { x: 20, y: 4, size: 2, hi: 'yellow' },
    });
    b.meta.mouth = [31, 7];
  });

  // Turbínový sumec: tmavý sumec so širokou plochou hlavou a dlhými fúzmi; namiesto chvostovej plutvy
  // má lopatkové koleso turbíny (v druhom snímku pootočené), v boku zaskrutkovanú skrutku.
  K.fishDef('turbinovy_sumec', 32, 16, function (b, f) {
    // turbína: koleso spredu — kovový veniec (svetlý hore vľavo), vo vnútri 4 zahnuté lopatky s tmavými
    // medzerami a náboj s osou; v druhom snímku pootočené o 45°. Voľné lopatky bez venca slepý kritik
    // čítal ako rozoklaný chvost (3 lopatky) a ako "prekrížené kosti" (4 do X).
    var hx = 5.5, hy = 8, spin = f ? Math.PI / 4 : 0;
    K.shapeEll(hx, hy, 4.6, 4.6, function (x, y) {
      var dx = x + 0.5 - hx, dy = y + 0.5 - hy, r = Math.sqrt(dx * dx + dy * dy), c;
      if (r > 3.4) c = dx + dy < 0 ? 'greyLight' : 'slate';
      else {
        var a = Math.atan2(dy, dx) - spin - r * 0.35, d = ((a % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2);
        c = d < 0.9 ? (d < 0.35 ? 'greyLight' : 'grey') : 'slateDark';
      }
      b.px(x, y, c);
    });
    b.rect(10, 7, 1, 2, 'slate');
    var G = K.fishBody(b, f, {
      x0: 10, x1: 29, cy: 8,
      top: [1.2, 3.4, 2.4, 0.75, 'blunt'], bot: [1.2, 3.6, 2.2, 0.7, 'blunt'],
      bands: [[0.3, 'slateDark'], [0.75, 'slate'], [1, 'grey']], under: 'slate',
      dorsal: [{ a: 0.6, z: 0.67, h: 1.6, c: 'slateDark' }],
      anal: [{ a: 0.04, z: 0.62, h: 1.6, c: 'slateDark', shape: 'flat', edge: 'slate' }],
      pattern: function (b, G) {
        // mramorovanie sumca: nepravidelné tmavé fľaky na boku (ručne rozmiestnené, nie zrnenie)
        [[12, 0.45, [[0, 0], [1, 0], [1, 1]]], [15, 0.6, [[0, 0], [1, 0]]], [20, 0.55, [[0, 0], [0, 1], [1, 1]]], [23, 0.62, [[0, 0], [1, 0]]]].forEach(function (s) {
          var y0 = G.rel(s[0], s[1]);
          s[2].forEach(function (d) { b.px(s[0] + d[0], y0 + d[1], 'slateDark'); });
        });
        // skrutka v boku: kovová hlavička 3 × 3 (svetlá hore vľavo, zárez v strede). Bez hrdze: červená aj
        // hnedá škvrna na sivom tele sa slepému kritikovi dvakrát čítala ako rana ("rust or sores", "a sore").
        var sx = 16, sy = G.rel(16, 0.3);
        b.px(sx, sy, 'white'); b.px(sx + 1, sy, 'greyLight'); b.px(sx + 2, sy, 'grey');
        b.px(sx, sy + 1, 'greyLight'); b.px(sx + 1, sy + 1, 'slateDark'); b.px(sx + 2, sy + 1, 'slate');
        b.px(sx, sy + 2, 'grey'); b.px(sx + 1, sy + 2, 'slate'); b.px(sx + 2, sy + 2, 'slateDark');
        // široká papuľa až pod oko, spodná čeľusť o kúsok dlhšia
        var my = G.rel(29, 0.55);
        b.line(24, my, 29, my, 'ink');
        b.px(30, my + 1, 'slate');
      },
      pect: { t: 0.8, len: 3, c: 'slateDark', r: 0.8 },
    });
    // drobné očko vpredu na plochej hlave
    var ec = G.c(26);
    b.px(26, ec.top + 1, 'ink'); b.px(27, ec.top + 1, 'white');
    // kovový náboj turbíny s osou
    b.px(5, 7, 'greyLight'); b.px(5, 8, 'ink'); b.px(4, 8, 'grey'); b.px(6, 7, 'grey');
    // fúzy (svetlé, aby boli vidno): dlhý z kútika úst vlečený dozadu popod brucho, druhý dopredu-dole,
    // dva krátke na brade; v 2. snímku sa pohnú
    var my = G.rel(29, 0.55), wv = f ? 1 : 0;
    b.line(25, my + 1, 23, my + 4, 'greyLight'); b.line(23, my + 4, 18, my + 5 + wv, 'greyLight');
    b.line(29, my, 31, my + 2 + wv, 'greyLight'); b.px(31, my + 3 + wv, 'greyLight');
    [26, 28].forEach(function (x) { var c = G.c(x); b.px(x, c.bot + 1, 'grey'); b.px(x, c.bot + 2, 'grey'); });
    b.meta.mouth = [30, my];
  });

  // Hrdzavý úhor: úhor ako hrdzavá rúra — tmavohnedý chrbát, hrdzavý bok, na chrbte odlupujúce sa šupinky
  // hrdze s pruhmi, ktoré z nich stekajú, lem plutvy s dierami ako prehrdzavený plech.
  K.fishDef('hrdzavy_uhor', 32, 11, function (b, f) {
    // Vlastná silueta (hrubší, väčšia špicatá hlava, iná vlna): s parametrami morského úhora sa čítal ako
    // "ten istý úhor prefarbený na oranžovo" (slepý kritik).
    var G = K.eelBody(b, f, {
      x0: 1, x1: 30, cy: 5, amp: 1.8, waves: 1.25, phase: 0.6, thick: 2.2, headT: 0.82, headMax: 1.15, snout: 1.3,
      tailThick: 0.7, finC: 'wood', finFrom: 0.0, finTo: 0.6, finBotTo: 0.4,
      bands: [[0.35, 'wood'], [0.75, 'rust'], [1, 'clay']], under: 'woodLight',
    });
    // prehrdzavený lem plutvy: dve diery
    [8, 15].forEach(function (x) { b.px(x, G.cols[x].top - 1, 0); b.px(x + 1, G.cols[x + 1].top - 1, 0); });
    // hrdza ako na plechu: odlupujúce sa šupinky (matná hrdzavá, svetlý okraj chytá svetlo zhora) s tmavou
    // jamkou vedľa a pruhy hrdze, ktoré z nich stekajú nadol po boku. Jasná oranžová/jantárová na tmavom
    // pôsobila ako žeravé uhlíky, nie hrdza.
    [[4, 0.25], [9, 0.2], [14, 0.25], [19, 0.15], [23, 0.2]].forEach(function (p, i) {
      var x = p[0], y = G.rel(x, p[1]);
      b.px(x, y, 'sand'); b.px(x + 1, y, 'clay'); b.px(x + 2, y, 'plum');
      for (var k = 1; k <= 2 + (i % 2); k++) if (y + k < G.c(x + 1).bot) b.px(x + 1, y + k, 'clay');
    });
    var hx = 26, c = G.c(hx);
    b.px(30, G.rel(30, 0.7), 'ink'); b.px(29, G.rel(29, 0.7), 'ink'); b.px(28, G.rel(28, 0.7), 'ink');
    var px0 = 23, pc = G.c(px0);
    b.px(px0, pc.bot, 'clay'); b.px(px0 - 1, pc.bot + 1, 'rust');
    b.outline('ink');
    b.px(hx, c.top + 1, 'ink'); b.px(hx + 1, c.top + 1, 'yellow');
    b.meta.mouth = [31, G.rel(30, 0.6)];
  });

  // ================================================================ Šachta reaktora
  // Izotopová mihuľa: úhorovitá bez párových plutiev, vpredu okrúhla prísavka so zúbkami, za okom rad
  // SIEDMICH žiabrových otvorov — tie svietia azúrovo; po chrbte svietiace zelené škvrny.
  K.fishDef('izotopova_mihula', 32, 13, function (b, f) {
    var G = K.eelBody(b, f, {
      x0: 1, x1: 27, cy: 6.5, amp: 3, waves: 1.1, phase: -0.7, thick: 2.5, headT: 0.84, headMax: 1.0, snout: 3,
      tailThick: 0.5,
      bands: [[0.2, 'slateDark'], [0.55, 'slate'], [0.85, 'grey'], [1, 'greyLight']], under: 'slate',
    });
    // dve nízke chrbtové plutvy v zadnej polovici; druhá prechádza do chvostového lemu
    var x;
    for (x = G.X(0.04); x <= G.X(0.22); x++) b.px(x, G.cols[x].top - 1, 'slate');
    for (x = G.X(0.27); x <= G.X(0.42); x++) b.px(x, G.cols[x].top - 1, 'slate');
    for (x = G.X(0.04); x <= G.X(0.12); x++) b.px(x, G.cols[x].bot + 1, 'slate');
    // prísavka: okrúhly mäsitý ovál na konci hlavy (širší než hlava), v druhom snímku sa roztvorí
    var hc = G.c(27), my = (hc.top + hc.bot) / 2 + 0.5, op = f ? 0.5 : 0;
    // zrezané rohy: ovál 4 × 6 px vyzeral ako štvorec (slepý kritik: "magenta square")
    K.shapeEll(28.8, my, 2.3, 3.2 + op, function (x, y) { b.px(x, y, 'pinkPurple'); });
    K.shapeEll(29.6, my, 1.0, 2.0 + op, function (x, y) { b.px(x, y, 'plum'); });
    b.outline('ink');
    b.px(29, Math.round(my - 2 - op), 'sandLight'); b.px(29, Math.round(my + 1 + op), 'sandLight');
    // oko a 7 žiabrových otvorov za ním (svietia azúrovo)
    var ex = 24, ec = G.c(ex);
    b.px(ex, ec.top + 1, 'ink'); b.px(ex + 1, ec.top + 1, 'white');
    for (var k = 0; k < 7; k++) {
      var gx = 21 - k * 2;
      b.glow(gx, G.rel(gx, 0.42), 'cyan');
    }
    // svietiace zelené škvrny na chrbte zadnej polovice
    [[3, 0.4], [5, 0.25], [7, 0.55]].forEach(function (p) { b.glow(p[0], G.rel(p[0], p[1]), 'greenLight'); });
    b.meta.mouth = [31, Math.round(my)];
  });

  // Grafitová platesa: veľká plochá ryba (pohľad na hornú stranu), tmavosivá ako tuha, s kovovým leskom
  // (svetlý oblúk pod horným okrajom), lem plutiev dookola (v druhom snímku sa vlní), OBE oči na tele pri
  // hlave. Oči na hornej hrane (ako má morská platesa) slepý kritik za oči nepovažoval a šikmý svetlý pruh
  // čítal ako "jazvu" — ryba vyzerala ako pleskáč; s očami na tele ju spoznal ako platesu.
  K.fishDef('grafitova_platesa', 32, 16, function (b, f) {
    var sw = f ? 1 : 0;
    // chvost: vejár na krátkej stopke
    b.poly([[6.5, 6.5], [1.5, 3 + sw], [1.5, 13 + sw], [6.5, 9.5]], 'slateDark');
    b.line(2, 8 + sw, 5, 8, 'slate'); b.line(2, 5 + sw, 5, 7, 'slate'); b.line(2, 11 + sw, 5, 9, 'slate');
    // lem plutiev dookola okrem hlavy: lúče (prúžky), v druhom snímku sa posunú = vlnenie
    K.shapeEll(16.5, 8, 11, 7, function (x, y) { if (x < 25) b.px(x, y, ((x + sw) % 2) ? 'slate' : 'slateDark'); });
    // telo: široký ovál (plocháč je pri pohľade na hornú stranu skoro okrúhly), svetlo zhora-zľava
    var cells = [];
    K.shapeEll(17.5, 8, 10.5, 5.3, function (x, y) { cells.push([x, y]); b.px(x, y, y <= 5 ? 'grey' : y <= 9 ? 'slate' : 'slateDark'); });
    // kovový lesk: svetlý oblúk tesne pod horným okrajom vľavo (odraz na lesklej tuhe), na vrchu záblesk
    cells.forEach(function (p) {
      var x = p[0], y = p[1];
      if (!b.edge(x, y) && b.edge(x, y - 1) && x >= 9 && x <= 17) b.px(x, y, x >= 11 && x <= 15 ? 'greyLight' : 'grey');
    });
    b.px(13, 4, 'white');
    // tuhové škvrny (ako škvrny platesy, len tmavé)
    [[12, 8], [16, 7], [15, 10], [19, 9], [20, 6]].forEach(function (p) {
      b.px(p[0], p[1], 'slateDark'); b.px(p[0] + 1, p[1], 'slateDark'); b.px(p[0], p[1] + 1, 'slateDark'); b.px(p[0] + 1, p[1] + 1, 'navy');
    });
    b.outline('ink');
    // OBE oči na hornej strane tela pri hlave, tesne pri sebe (jedno vyššie a vpredu) — znak plocháča;
    // svetlý lem okolo, aby sa na tmavej tuhe nestratili
    [[22, 5], [25, 7]].forEach(function (p) {
      b.px(p[0] - 1, p[1], 'greyLight'); b.px(p[0], p[1] - 1, 'greyLight'); b.px(p[0] + 1, p[1] - 1, 'greyLight');
      b.px(p[0], p[1], 'ink'); b.px(p[0] + 1, p[1], 'white'); b.px(p[0], p[1] + 1, 'ink'); b.px(p[0] + 1, p[1] + 1, 'ink');
    });
    // malé krivé ústa na spodnej strane hlavy
    b.px(27, 10, 'ink'); b.px(26, 11, 'ink');
    b.meta.mouth = [28, 10];
  });

  // ================================================================ LEGENDA
  // Atómový sumec: obrovský tmavý sumec spod jadra reaktora; brucho podsvietené modrou Čerenkovovou
  // žiarou, po boku svietiace tigrovité pruhy, dlhé svietiace fúzy, malé azúrové oko pod ťažkým obočím.
  // (Škvrny v radoch pôsobili ako okienka ponorky a bočná čiara so škvrnami ako plošný spoj — preto pruhy.)
  K.fishDef('atomovy_sumec', 64, 30, function (b, f) {
    var sw = f ? 1 : 0;
    var G = K.geom({ x0: 15, x1: 59, cy: 14.5, top: [2.2, 6.8, 3.6, 0.72, 'round'], bot: [2.2, 7, 4.6, 0.66, 'blunt'] });
    // chvost: zaoblený, mávne
    K.tail(b, G, { type: 'round', len: 11, spread: 5.5, c: 'slateDark', c2: 'navy', swing: 2 }, f);
    // dlhá análna plutva (spodný okraj podsvietený jadrom; lúče pôsobili ako "hrebeň") a malá chrbtová
    K.fin(b, G, 1, 0.02, 0.6, 2.6, 'navy', { shape: 'flat', edge: 'blueDark' });
    K.fin(b, G, -1, 0.56, 0.64, 2.4, 'slateDark', { shape: 'round' });
    // telo: tmavé, brucho podsvietené modrou žiarou jadra pod ním
    K.paintBody(b, G, [[0.1, 'slate'], [0.35, 'slateDark'], [0.75, 'navy'], [1, 'blueDark']], 'blue');
    // prsná plutva
    var px0 = G.X(0.8), py0 = G.rel(px0, 0.72);
    b.poly([[px0 + 1, py0], [px0 - 7, py0 + 4 + sw], [px0 - 5, py0 + 5 + sw], [px0 + 2, py0 + 2]], 'slateDark');
    // široká papuľa: dlhá čiara úst a svetlejšia spodná pera. Bez zubov: biele body na papuli sa čítali
    // ako okienka, potom ako druhé oko (slepý kritik, 2 kolá) — hrozivosť nesú obočie, žiara a fúzy.
    var my = G.rel(59, 0.55);
    b.line(47, my + 1, 59, my, 'ink');
    b.line(48, my + 2, 59, my + 1, 'slate');
    // krátke fúzy na brade
    [52, 55].forEach(function (x) { var c = G.c(x); b.px(x, c.bot + 1, 'slate'); b.px(x - 1, c.bot + 2, 'slate'); });
    b.outline('ink');
    // Čerenkovova žiara: tigrovité pruhy od chrbta nadol, zahnuté dozadu, k bruchu sa zužujú a tmavnú
    [[0.14, 0.42], [0.25, 0.58], [0.36, 0.5], [0.47, 0.62], [0.58, 0.5], [0.68, 0.58]].forEach(function (s) {
      var x0 = G.X(s[0]), c = G.c(x0), y1 = G.rel(x0, s[1]);
      for (var y = c.top + 1; y <= y1; y++) {
        var k = y - c.top - 1, x = x0 - Math.floor(k / 3);
        b.glow(x, y, k < 2 ? 'cyan' : 'blue', k < 3 ? 'cyan' : 'blue');
        if (k < 2) b.glow(x + 1, y, 'blue');
      }
    });
    // oko pod ťažkým obočím
    var ex = 54, ey = G.c(54).top + 2;
    b.px(ex - 1, ey - 1, 'ink'); b.px(ex, ey - 1, 'ink'); b.px(ex + 1, ey - 1, 'navy');
    b.glow(ex, ey, 'cyan'); b.glow(ex + 1, ey, 'white', 'cyan');
    // dlhé fúzy z kútika úst: jeden sa vlečie dozadu popod brucho (esovito, v 2. snímku sa vlna posunie),
    // druhý visí dopredu; pri papuli tmavé, ku koncu svietia čoraz jasnejšie
    function whisker(n, fx, fy) {
      var px = null, py = null;
      for (var k = 0; k <= n; k++) {
        var u = k / n, x = Math.round(fx(u)), y = Math.round(fy(u));
        if (x === px && y === py) continue;
        px = x; py = y;
        if (u < 0.3) b.px(x, y, 'slate');
        else b.glow(x, y, u > 0.8 ? 'cyan' : 'blue');
      }
    }
    whisker(40, function (u) { return 49 - 15 * u; }, function (u) { return my + 2 + 10.5 * Math.sin(u * Math.PI * 0.55) + Math.sin(u * Math.PI * 2 + sw * 1.6) * 1.2 * u; });
    whisker(24, function (u) { return 58 + 4 * Math.sin(u * Math.PI * 0.5); }, function (u) { return my + 1 + 10 * u; });
    b.glow(62 - sw, my + 11, 'cyan');
    b.meta.mouth = [60, my];
  });
})(globalThis.HL);
