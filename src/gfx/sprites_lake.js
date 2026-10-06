// Sprity Starej elektrárne a jadrového jazera okrem rýb (docs/JAZERO.md): budovy Lodenica a Laboratórium
// (úrovne 0–3 + svetlá), hrdzavé sudy (prekážky v jazere namiesto skál), kulisy elektrárne a rázcestník
// v dedine. Ten istý štýl a pomôcky ako gfx/sprites.js (HL.spr.kit). Zmluva mien a rozmerov: tools/sheet_check.js.
//
// Štýl: ako budovy dediny — svetlo zhora zľava, 1 px obrys (budovy a sudy atrament, kulisy elektrárne
// slateDark = tmavší tón ich betónovej rampy: sú ďaleko za budovami a atramentový obrys by ich pritiahol
// dopredu), okná a svetlá cez K.win / b.light. Elektráreň je stará, zarastená, trochu strašidelná, nikdy
// pochmúrna; žiarenie je len príbeh (žlté trojlístky, zelená žiara skúmaviek), žiadna mechanika.
// Žiadny náhodný jednopixelový šum — stekance, nity a mach sú zámerné ťahy.
(function (HL) {
  'use strict';
  var K = HL.spr.kit;
  var ell = K.shapeEll;

  // =================================================================== POMÔCKY
  // Trojlístok (znak žiarenia). Ručne nakreslené vzory: skutočný trojlístok navzorkovaný do 5–8 px sa
  // rozpadne (stred padne na roh pixelov) alebo vyzerá ako tvár. K = lopatky a stred, Y = žltý kotúč,
  // A = obruba kotúča (tmavší tón vlastnej rampy, ART_SPEC §5) — špičky lopatiek ostávajú na okraji.
  var TREFOIL = {
    8: ['..AAAA..', '.KKYYKK.', 'AKKYYKKA', 'KKYKKYKK', 'AYYKKYYA', 'AYYYYYYA', '.AYKKYA.', '..AKKA..'],
    5: ['.KYK.', 'KKYKK', 'YYKYY', 'YYYYY', '.YKY.'],
    3: ['KYK', 'YKY', 'YKY'],
  };
  function trefoil(b, x, y, n, ink, yel, rim) {
    var p = TREFOIL[n];
    for (var j = 0; j < p.length; j++) for (var i = 0; i < p[j].length; i++) {
      var ch = p[j].charAt(i);
      if (ch === 'K') b.px(x + i, y + j, ink || 'ink');
      else if (ch === 'Y') b.px(x + i, y + j, yel || 'yellow');
      else if (ch === 'A') b.px(x + i, y + j, rim || 'redDark');   // oranžová mala jas ako obloha a plot (Δ 0,02)
    }
  }
  // Kreslí predmet (napr. loď pred hangárom) do vlastnej bitmapy a vloží ho s 1 px atramentovou škárou
  // všade, kde susedí s tým, čo je už nakreslené za ním — inak sa sivá loď a sivá strecha zlejú do jednej
  // hmoty (slepý kritik, D3). Svetlá predmetu idú s ním, svetlo pod škárou sa zmaže.
  function inFront(b, draw) {
    var t = new b.constructor(b.w, b.h), w = b.w, i;
    draw(t);
    for (var y = 0; y < b.h; y++) for (var x = 0; x < w; x++) {
      i = y * w + x;
      if (t.d[i] || !b.d[i]) continue;
      if ((x > 0 && t.d[i - 1]) || (x < w - 1 && t.d[i + 1]) || (y > 0 && t.d[i - w]) || (y < b.h - 1 && t.d[i + w])) { b.d[i] = b.ci('ink'); b.g[i] = 0; }
    }
    for (i = 0; i < t.d.length; i++) if (t.d[i]) { b.d[i] = t.d[i]; b.g[i] = t.g[i]; }
  }
  // Tmavší sused na rampe (stekance, tieň) — ten istý princíp ako HL.pal.darker, len v rámci materiálu.
  var DARK = {
    white: 'greyLight', greyLight: 'grey', grey: 'slate', slate: 'slateDark', slateDark: 'slateDark',
    sand: 'clay', clay: 'rust', rust: 'redDark', redDark: 'wood', wood: 'plum', pink: 'red', red: 'redDark',
    amber: 'orange', orange: 'rust', woodLight: 'wood', yellow: 'amber', blue: 'blueDark', blueDark: 'navy',
  };
  function darker(b, x, y) {
    var v = b.at(x, y);
    if (!v) return;
    var name = HL.pal.names[v - 1];
    if (DARK[name]) b.px(x, y, DARK[name]);
  }
  function rivets(b, x0, x1, y, step, c) { for (var x = x0; x <= x1; x += step) b.px(x, y, c); }
  // Vzor zo znakov (riadky textu) → pixely; mapa znak → farba.
  function pattern(b, x, y, rows, map) {
    for (var j = 0; j < rows.length; j++) for (var i = 0; i < rows[j].length; i++) {
      var c = map[rows[j].charAt(i)];
      if (c) b.px(x + i, y + j, c);
    }
  }

  // Bok lodného kontajnera: vlnitý plech (rebro každý 3. stĺpec), horný rám a ľavý stĺpik na svetle,
  // spodný rám a pravý stĺpik v tieni. c = { hi, body, rib, lo }.
  var C_RUST = { hi: 'clay', body: 'rust', rib: 'redDark', lo: 'wood' };
  var C_BLUE = { hi: 'blue', body: 'blueDark', rib: 'navy', lo: 'navy' };
  function container(b, x, y, w, h, c) {
    b.rect(x, y, w, h, c.body);
    for (var i = 2; i < w - 2; i += 3) b.rect(x + i, y + 1, 1, h - 2, c.rib);
    b.rect(x, y, w, 1, c.hi);
    b.rect(x, y + h - 1, w, 1, c.lo);
    b.rect(x, y, 1, h - 1, c.hi);
    b.rect(x + w - 1, y, 1, h, c.lo);
  }
  // Hrdzavé stekance spod horného rámu: krátke zvislé ťahy o tón tmavšie. s = [x, y, dĺžka].
  function streaks(b, list) { list.forEach(function (s) { for (var j = 0; j < s[2]; j++) darker(b, s[0], s[1] + j); }); }
  // Betónové/drevené kvádre, na ktorých kontajner stojí (spodný riadok = zem).
  function blocks(b, xs, y, h) { xs.forEach(function (x) { b.rect(x, y, 3, h, 'slate'); b.rect(x, y, 3, 1, 'grey'); b.px(x, y + 1, 'grey'); }); }

  // Oceľové dvere s okienkom (kontajner, laboratórium). lit = okienko svieti.
  function steelDoor(b, x, y, w, h, lit) {
    b.rect(x, y, w, h, 'grey');
    b.rect(x, y, 1, h, 'greyLight'); b.rect(x, y, w, 1, 'greyLight');
    b.rect(x + w - 1, y + 1, 1, h - 1, 'slate');
    b.rect(x + 1, y + 2, w - 2, 2, 'navy');
    b.px(x + 1, y + 2, 'blueDark');
    b.px(x + w - 2, y + (h >> 1) + 1, 'amber');
    if (lit) for (var i = 1; i < w - 1; i++) { b.light(x + i, y + 2, 'yellow'); b.light(x + i, y + 3, 'amber'); }
  }
  // Nástenný ventilátor: oceľový prstenec, tmavý otvor, vrtuľa v tvare kríža (súvislé lopatky — šikmé
  // lopatky z jednotlivých pixelov vyzerali ako šachovnica), náboj.
  function fan(b, cx, cy, r) {
    ell(cx, cy, r, r, function (x, y) { b.px(x, y, x + y < cx + cy - 1 ? 'grey' : 'slate'); });
    ell(cx, cy, r - 1, r - 1, function (x, y) { b.px(x, y, 'ink'); });
    var hx = Math.floor(cx), hy = Math.floor(cy);
    for (var s = 1; s < r - 1; s++) {
      b.px(hx - s, hy, 'greyLight'); b.px(hx, hy - s, 'greyLight');
      b.px(hx + s, hy, 'grey'); b.px(hx, hy + s, 'grey');
    }
    b.px(hx, hy, 'white');
  }

  // Sud (200 l) postavený, mierne zhora: eliptické viečko (zadná obruba, prepadnutý stred so zátkou,
  // predná obruba na svetle), telo tienené zľava doprava, dve vystupujúce obruče, zaoblené dno.
  // p = { lid, hi, mid, lo, hoop }
  var D_RUST = { lid: 'sand', hi: 'clay', mid: 'rust', lo: 'redDark', hoop: 'wood' };
  var D_OLD = { lid: 'clay', hi: 'rust', mid: 'redDark', lo: 'wood', hoop: 'plum' };
  var D_PAINT = { lid: 'sand', hi: 'amber', mid: 'clay', lo: 'rust', hoop: 'redDark' };   // vyblednutá žltá
  function drumUp(b, x, y, w, h, p) {
    for (var i = 0; i < w; i++) {
      var u = (i + 0.5) / w;
      b.rect(x + i, y + 2, 1, h - 2, u < 0.3 ? p.hi : u < 0.72 ? p.mid : p.lo);
    }
    b.rect(x + 1, y, w - 2, 1, p.hi);                                       // zadná obruba
    b.rect(x, y + 1, w, 1, p.hi); b.rect(x + 1, y + 1, w - 2, 1, p.lo);     // prepadnutý stred viečka
    b.px(x + w - 3, y + 1, p.hoop);                                         // zátka
    b.rect(x, y + 2, w - 1, 1, p.lid);                                      // predná obruba na svetle
    [y + Math.round(h * 0.42), y + Math.round(h * 0.74)].forEach(function (yy) {
      for (var i = 0; i < w; i++) b.px(x + i, yy, i < w * 0.3 ? p.lid : p.hoop);
    });
    b.px(x, y + h - 1, 0); b.px(x + w - 1, y + h - 1, 0);                   // zaoblené dno
  }
  // Sud ležiaci: valec bokom, svetlo zhora; ľavé dno (k nám) je elipsa: svetlá obruba, tmavší stred,
  // zátka; pravý koniec zaoblený. Obruče sú zvislé.
  function drumSide(b, x, y, w, h, p) {
    for (var j = 0; j < h; j++) {
      var v = (j + 0.5) / h;
      b.rect(x + 2, y + j, w - 3, 1, v < 0.3 ? p.hi : v < 0.72 ? p.mid : p.lo);
    }
    b.rect(x + w - 1, y + 1, 1, h - 2, p.lo);                               // zaoblený pravý koniec
    [x + 2 + Math.round((w - 3) * 0.36), x + 2 + Math.round((w - 3) * 0.7)].forEach(function (xx) {
      for (var j = 0; j < h; j++) b.px(xx, y + j, j < h * 0.3 ? p.lid : p.hoop);
    });
    b.rect(x, y + 1, 1, h - 2, p.lid);                                      // dno: obruba
    b.px(x + 1, y, p.lid); b.px(x + 1, y + h - 1, p.hi);
    b.rect(x + 1, y + 1, 1, h - 2, p.mid); b.rect(x + 2, y + 1, 1, h - 2, p.hi);
    b.px(x + 1, y + Math.floor(h / 2), p.hoop);                             // zátka
  }

  // =================================================================== BUDOVY: LODENICA
  // Lodenica = prístup do hĺbky jazera (ako Maják v mori). 0 prevrátený čln, 1 pancierová loďka na
  // drevenom móle pri kôlni, 2 hangár s väčším oloveným trupom na sklze a žeriav, 3 väčší hangár
  // + navijaková veža s ponornou guľou (batysférou) na reťazi. Žeriav a veža sú žlté (stavebná technika).
  K.bld('lodenica', 0, 30, 14, function (b) {
    // veslo zapichnuté v piesku (za člnom); navrchu 1 px voľný pre obrys
    b.rect(27, 5, 1, 8, 'woodLight'); b.px(27, 12, 'wood');
    b.rect(26, 1, 3, 5, 'woodLight'); b.rect(28, 2, 1, 4, 'wood'); b.px(26, 1, 0); b.px(28, 1, 0);
    // trup hore dnom: kýl hore takmer rovný, zadné zrkadlo vľavo zvislé, prova vpravo šikmo k zemi.
    // Hore vyblednutá spodná farba (hrdzavá), svetlý pás čiary ponoru, dole lapené dosky boku.
    b.poly([[2, 13], [2, 5], [3, 4], [18, 4], [22, 6], [24.5, 9], [26, 13]], 'wood');
    b.each(function (x, y) {
      if (y > 12) return;
      var c = y <= 4 ? (x < 9 ? 'clay' : 'rust') : y <= 6 ? (x < 5 ? 'clay' : 'rust') : y === 7 ? 'sand' :
        y === 12 ? 'plum' : (y % 2 ? 'wood' : 'woodLight');
      if (x === 2 && y > 4 && y < 12) c = y === 7 ? 'sandLight' : y < 7 ? 'clay' : 'woodLight';   // zrkadlo na svetle
      if (y === 12 && (x < 5 || x > 22)) c = 'wood';                       // na zem sadá len koncami
      b.px(x, y, c);
    });
    // prerazená doska boku
    [[14, 8], [15, 8], [13, 9], [14, 9], [15, 9], [16, 9], [14, 10], [15, 10], [15, 11]].forEach(function (p) { b.px(p[0], p[1], 'ink'); });
    b.px(17, 8, 'sand'); b.px(12, 10, 'sand'); b.px(16, 11, 'woodLight');   // vylomené konce dosiek
    // úlomky dosiek pred člnom
    b.rect(8, 13, 6, 1, 'woodLight'); b.rect(18, 13, 4, 1, 'wood');
    K.grass(b, 1, 28, 13);
  });

  // Pancierová loďka: oceľový trup s nitmi, prova stúpa, kormidlovňa s priezorom, svetlomet a lampa.
  // (x, y) = palubná hrana pri korme.
  function armoredBoat(b, x, y, lit) {
    b.poly([[x, y], [x + 15, y], [x + 21, y - 2.5], [x + 18, y + 7], [x + 2.5, y + 7], [x, y + 4]], 'slate');
    b.each(function (xx, yy) {
      if (xx < x - 1 || xx > x + 22 || yy < y - 3 || yy > y + 7 || !b.is(xx, yy, 'slate')) return;
      if (!b.at(xx, yy - 1)) b.px(xx, yy, 'greyLight');                     // palubná hrana
      else if (!b.at(xx, yy - 2) || yy === y + 1) b.px(xx, yy, 'grey');
      else if (yy === y + 6) b.px(xx, yy, 'slateDark');
    });
    rivets(b, x + 2, x + 17, y + 3, 2, 'greyLight');
    [x + 7, x + 13].forEach(function (sx) { b.rect(sx, y + 2, 1, 4, 'slateDark'); });
    // kormidlovňa s úzkym pancierovým priezorom
    b.rect(x + 6, y - 5, 7, 5, 'grey'); b.rect(x + 6, y - 5, 1, 5, 'greyLight'); b.rect(x + 12, y - 4, 1, 4, 'slate');
    b.rect(x + 5, y - 6, 9, 1, 'slate'); b.rect(x + 5, y - 6, 4, 1, 'grey');
    K.win(b, x + 8, y - 3, 3, 1, lit, 'slateDark');
    b.rect(x + 9, y - 9, 1, 3, 'slate'); K.lantern(b, x + 9, y - 10);
    // svetlomet na prove
    b.rect(x + 16, y - 3, 2, 2, 'greyLight'); b.px(x + 17, y - 2, 'grey'); b.px(x + 18, y - 3, 'yellow');
    if (lit) b.light(x + 18, y - 3, 'yellow');
  }
  K.bld('lodenica', 1, 36, 26, function (b) {
    // drevené mólo na kôloch (okraje plátna voľné pre obrys)
    b.rect(1, 21, 34, 1, 'sand'); b.rect(1, 22, 34, 1, 'woodLight'); b.rect(1, 23, 34, 1, 'wood');
    for (var x = 3; x < 35; x += 4) b.px(x, 22, 'wood');
    [2, 12, 23, 32].forEach(function (x) { b.rect(x, 24, 2, 2, 'wood'); b.px(x, 24, 'woodLight'); });
    // kôlňa
    K.planks(b, 2, 12, 9, 9);
    K.shedRoof(b, 2, 10, 9, 11, ['grey', 'slate']);
    K.win(b, 5, 15, 3, 3, true);
    // loďka na podložkách
    [16, 25].forEach(function (x) { b.rect(x, 19, 3, 2, 'wood'); b.rect(x, 19, 3, 1, 'woodLight'); });
    armoredBoat(b, 13, 12, true);
    b.rect(34, 18, 1, 3, 'wood'); b.px(34, 18, 'woodLight');                 // úväzový kôl
  });

  // Hangár lodenice: doskové steny, plechová sedlová strecha, veľké otvorené vráta. inside(b, x, y, w, h)
  // kreslí do tmavých vrát (napr. provu lode); svieti len to, čo ostalo tmavé (vnútro hangára), od
  // podielu výšky litFrom nadol — s loďou vo vrátach svieti celé vnútro, aby loď bola tmavá silueta.
  function boathouse(b, x0, x1, yRoof, yWall, yBot, doorW, inside, litFrom) {
    K.planks(b, x0, yWall, x1 - x0 + 1, yBot - yWall + 1);
    K.roof(b, x0, x1, yRoof, yWall - 1, ['grey', 'slate', 'slateDark']);
    var dx = Math.round((x0 + x1) / 2 - doorW / 2 + 0.5), dy = yWall + 4, dh = yBot - dy + 1;
    b.rect(dx - 1, dy - 1, doorW + 2, 1, 'wood');
    b.rect(dx, dy, doorW, dh, 'ink');
    if (inside) inside(b, dx, dy, doorW, dh);
    var from = litFrom == null ? 0.4 : litFrom;
    for (var j = 0; j < dh; j++) for (var i = 0; i < doorW; i++) {
      if (j > dh * from && b.is(dx + i, dy + j, 'ink')) b.light(dx + i, dy + j, j > dh * 0.8 ? 'orange' : 'amber');
    }
    return { dx: dx, dy: dy, dh: dh };
  }
  // Olovený trup: väčšia ťažká loď z tmavých olovených plátov s nitmi, kajuta s okrúhlymi okienkami.
  // (x, y) = palubná hrana pri korme.
  function leadBoat(b, x, y, lit) {
    b.poly([[x, y], [x + 20, y], [x + 26, y - 3], [x + 22, y + 9], [x + 3, y + 9], [x, y + 5]], 'slate');
    b.each(function (xx, yy) {
      if (xx < x - 1 || xx > x + 27 || yy < y - 4 || yy > y + 9 || !b.is(xx, yy, 'slate')) return;
      if (!b.at(xx, yy - 1)) b.px(xx, yy, 'grey');
      else if (yy >= y + 6) b.px(xx, yy, 'slateDark');
    });
    b.line(x + 1, y + 3, x + 22, y + 3, 'slateDark');                       // spoje olovených plátov
    [x + 6, x + 13, x + 20].forEach(function (sx) { b.rect(sx, y + 1, 1, 5, 'slateDark'); });
    rivets(b, x + 2, x + 22, y + 1, 2, 'grey');
    rivets(b, x + 3, x + 21, y + 5, 3, 'grey');
    // kajuta
    b.rect(x + 8, y - 6, 9, 6, 'grey'); b.rect(x + 8, y - 6, 1, 6, 'greyLight'); b.rect(x + 16, y - 5, 1, 5, 'slate');
    b.rect(x + 7, y - 7, 11, 1, 'slate'); b.rect(x + 7, y - 7, 5, 1, 'grey');
    [x + 10, x + 13].forEach(function (wx) {
      b.rect(wx, y - 4, 2, 2, 'navy'); b.px(wx, y - 4, 'blueDark');
      if (lit) { b.light(wx, y - 4, 'yellow'); b.light(wx + 1, y - 4, 'amber'); b.light(wx, y - 3, 'amber'); b.light(wx + 1, y - 3, 'amber'); }
    });
    // komín s olovenou čiapkou
    b.rect(x + 4, y - 5, 3, 5, 'slate'); b.rect(x + 4, y - 5, 1, 5, 'grey'); b.rect(x + 3, y - 6, 5, 1, 'slateDark');
    b.rect(x + 12, y - 11, 1, 4, 'slate'); K.lantern(b, x + 12, y - 12);
  }
  K.bld('lodenica', 2, 46, 34, function (b) {
    // žeriav (za loďou): žltý stĺp a výložník, lano s hákom, výstražné svetlo
    b.rect(42, 3, 2, 30, 'amber'); b.rect(43, 4, 1, 29, 'orange');
    for (var y = 7; y < 31; y += 4) b.px(42, y, 'orange');
    b.rect(25, 3, 19, 2, 'amber'); b.rect(25, 4, 19, 1, 'orange');
    for (var x = 27; x < 41; x += 3) b.px(x, 3, 'yellow');
    b.line(41, 5, 37, 9, 'orange');                                          // vzpera
    b.rect(26, 5, 1, 7, 'slateDark'); b.rect(25, 12, 3, 1, 'grey'); b.px(25, 13, 'grey'); b.px(27, 11, 'grey');
    b.px(43, 2, 'slate'); b.px(43, 1, 'red'); b.light(43, 1, 'red');
    // hangár
    boathouse(b, 2, 21, 6, 17, 33, 9);
    K.win(b, 10, 11, 3, 3, true, 'wood');
    // olovený trup na podstavci a koľajniciach sklzu
    b.rect(18, 32, 26, 1, 'slate'); b.rect(18, 33, 26, 1, 'slateDark');
    [24, 33].forEach(function (x) { b.rect(x, 29, 3, 3, 'wood'); b.rect(x, 29, 3, 1, 'woodLight'); });
    inFront(b, function (t) { leadBoat(t, 18, 20, true); });
    K.grass(b, 1, 44, 33);
  });

  // Ponorná guľa (batysféra): oceľová guľa so svetlom zľava-zhora, prstenec nitov, svietiace okienko.
  function bathysphere(b, cx, cy, r, lit) {
    ell(cx, cy, r, r, function (x, y) {
      var dx = (x + 0.5 - cx) / r, dy = (y + 0.5 - cy) / r, l = -dx * 0.6 - dy * 0.8;
      b.px(x, y, l > 0.45 ? 'greyLight' : l > -0.1 ? 'grey' : l > -0.6 ? 'slate' : 'slateDark');
    });
    b.px(Math.floor(cx - r * 0.45), Math.floor(cy - r * 0.55), 'white');
    for (var x = Math.ceil(cx - r) + 1; x < cx + r - 1; x += 2) b.px(x, Math.floor(cy) + 2, 'slateDark');
    b.rect(Math.floor(cx) - 2, Math.floor(cy - r) - 1, 4, 2, 'slate'); b.rect(Math.floor(cx) - 1, Math.floor(cy - r) - 2, 2, 1, 'grey');
    var wx = Math.floor(cx) - 1, wy = Math.floor(cy) - 2;
    b.rect(wx - 1, wy - 1, 5, 4, 'slateDark');
    b.rect(wx, wy, 3, 2, 'blueDark'); b.px(wx, wy, 'cyan');
    if (lit) for (var j = 0; j < 2; j++) for (var i = 0; i < 3; i++) b.light(wx + i, wy + j, i + j < 2 ? 'white' : 'cyan');
  }
  K.bld('lodenica', 3, 56, 50, function (b) {
    // navijaková veža: dve žlté nohy, horný nosník s navijakom, reťaz s batysférou
    b.rect(34, 6, 2, 43, 'amber'); b.rect(35, 7, 1, 42, 'orange');
    b.rect(51, 6, 2, 43, 'amber'); b.rect(52, 7, 1, 42, 'orange');
    b.rect(32, 4, 23, 3, 'amber'); b.rect(32, 6, 23, 1, 'orange'); b.rect(32, 4, 23, 1, 'yellow');
    b.line(36, 7, 39, 10, 'orange'); b.line(50, 7, 47, 10, 'orange');      // rohové vzpery
    b.rect(36, 41, 15, 1, 'amber'); b.rect(36, 42, 15, 1, 'orange');
    // navijak navrchu (riadok 0 voľný pre obrys)
    b.rect(40, 1, 7, 3, 'slate'); b.rect(40, 1, 7, 1, 'grey'); b.rect(41, 2, 5, 1, 'greyLight');
    b.px(54, 3, 'red'); b.light(54, 3, 'red');
    // reťaz: striedavo očká
    for (var y = 7; y < 21; y++) b.px(43 + (y % 2), y, y % 2 ? 'grey' : 'greyLight');
    bathysphere(b, 43.5, 28, 7, true);
    // hangár; vo vrátach prova oloveného trupu spredu (tvar V) na podložkách
    boathouse(b, 2, 29, 12, 26, 49, 12, function (b, dx, dy, w, h) {
      var top = dy + 8;
      for (var j = 0; j < 6; j++) for (var i = j; i < w - 1 - j; i++) b.px(dx + i, top + j, j === 0 ? 'grey' : (i < w / 2 ? 'slate' : 'slateDark'));
      b.rect(dx + 5, top + 1, 1, 5, 'grey');
      b.rect(dx + 2, top + 4, 2, h - 12, 'wood'); b.rect(dx + w - 4, top + 4, 2, h - 12, 'wood');
      b.px(dx + 2, top + 4, 'woodLight'); b.px(dx + w - 4, top + 4, 'woodLight');
    }, 0.12);
    K.win(b, 14, 17, 3, 4, true, 'wood');
    [5, 25].forEach(function (x) { K.win(b, x, 30, 2, 3, true, 'wood'); });
    K.lantern(b, 31, 30);
    K.grass(b, 1, 54, 49);
  });

  // =================================================================== BUDOVY: LABORATÓRIUM
  // Laboratórium = jazerná výbava (ako Dielňa). 0 zamknutý hrdzavý kontajner, 1 kontajner-laboratórium
  // (dvere, okno, anténa), 2 dva kontajnery na sebe, ventilátor, svietiaci štít s bankou, 3 prístavba
  // so sklenenou kupolou a svietiacimi skúmavkami, satelitná anténa.
  K.bld('laboratorium', 0, 30, 16, function (b) {
    container(b, 2, 3, 26, 12, C_RUST);
    streaks(b, [[6, 4, 5], [13, 4, 3], [19, 4, 7]]);
    // uzáver: dve zvislé tyče so zámkom
    [22, 25].forEach(function (x) { b.rect(x, 4, 1, 10, 'grey'); b.px(x, 4, 'greyLight'); b.rect(x - 1, 8, 3, 1, 'slate'); });
    b.rect(23, 9, 2, 1, 'grey'); b.rect(23, 10, 2, 2, 'amber'); b.px(23, 10, 'yellow');
    // vyblednutý trojlístok
    trefoil(b, 8, 6, 5, 'wood', 'sand');
    // burina popri stene
    [[3, 4], [5, 2], [16, 3], [27, 5]].forEach(function (s) { for (var j = 0; j < s[1]; j++) b.px(s[0] + (j === 2 ? 1 : 0), 14 - j, j % 2 ? 'greenDark' : 'green'); });
    K.grass(b, 1, 28, 15);
  });
  K.bld('laboratorium', 1, 34, 26, function (b) {
    // anténa na streche
    b.rect(24, 3, 1, 8, 'slate'); b.rect(21, 5, 7, 1, 'grey'); b.rect(22, 7, 5, 1, 'grey');
    b.px(24, 2, 'red'); b.light(24, 2, 'red');
    b.line(25, 9, 30, 10, 'slateDark');                                     // kábel
    // kontajner na kvádroch
    container(b, 2, 11, 30, 12, C_RUST);
    streaks(b, [[5, 12, 4], [17, 12, 6], [29, 12, 3]]);
    blocks(b, [3, 15, 28], 23, 3);
    steelDoor(b, 20, 13, 6, 10, true);
    b.rect(19, 23, 8, 1, 'woodLight'); b.rect(20, 24, 6, 1, 'wood');        // schodík
    K.win(b, 7, 14, 6, 3, true, 'slateDark');
    trefoil(b, 13, 15, 5);
    K.grass(b, 1, 32, 25);
  });
  // Svietiaci štít: biela plocha s bankou zelenej tekutiny a riadkami „nápisu“; v noci svieti.
  function labSign(b, x, y) {
    b.rect(x + 2, y + 6, 1, 3, 'slate'); b.rect(x + 11, y + 6, 1, 3, 'slate');
    b.rect(x, y, 14, 6, 'slate');
    b.rect(x + 1, y + 1, 12, 4, 'white');
    pattern(b, x + 2, y + 1, ['..S..', '..S..', '.SGS.', 'SGGGS'], { S: 'slate', G: 'green' });
    b.rect(x + 8, y + 2, 4, 1, 'slate'); b.rect(x + 8, y + 4, 3, 1, 'slate');
    for (var j = 1; j < 5; j++) for (var i = 1; i < 13; i++) {
      var v = b.at(x + i, y + j);
      b.light(x + i, y + j, v === b.ci('white') ? 'white' : v === b.ci('green') ? 'greenLight' : 'cyan');
    }
  }
  K.bld('laboratorium', 2, 44, 36, function (b) {
    labSign(b, 14, 1);
    // horný kontajner (modrý) a dolný (hrdzavý)
    container(b, 8, 9, 30, 12, C_BLUE);
    container(b, 2, 21, 36, 12, C_RUST);
    streaks(b, [[6, 22, 5], [12, 22, 3], [31, 22, 6], [14, 10, 4], [26, 10, 3]]);
    blocks(b, [3, 18, 34], 33, 3);
    fan(b, 9.5, 26.5, 4);
    K.win(b, 16, 24, 6, 3, true, 'slateDark');
    K.win(b, 12, 12, 5, 3, true, 'slateDark'); K.win(b, 21, 12, 5, 3, true, 'slateDark');
    steelDoor(b, 30, 11, 5, 9, true);
    steelDoor(b, 27, 23, 6, 10, false);
    // schody na horný kontajner
    b.line(39, 32, 39, 20, 'slate');
    for (var s = 0; s < 6; s++) b.rect(39, 31 - s * 2, 3, 1, 'grey');
    b.rect(37, 19, 6, 1, 'grey'); b.line(42, 18, 42, 31, 'slate');
    trefoil(b, 23, 27, 5);
    K.grass(b, 1, 43, 35);
  });

  // Satelitná anténa: tanier (elipsa pootočená k oblohe) so svetlou obrubou, ramienko s prijímačom, stojan.
  function dish(b, cx, cy, rx, ry, ang) {
    var ca = Math.cos(ang), sa = Math.sin(ang);
    for (var y = Math.floor(cy - rx - 1); y <= cy + rx + 1; y++) for (var x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
      var px = x + 0.5 - cx, py = y + 0.5 - cy, u = px * ca + py * sa, v = -px * sa + py * ca;
      var d = (u * u) / (rx * rx) + (v * v) / (ry * ry);
      if (d <= 1) b.px(x, y, d > 0.55 && v < 0 ? 'white' : d > 0.6 ? 'grey' : v < -0.3 ? 'grey' : 'greyLight');
    }
  }
  // Sklenená skúmavka so zelenou žiarou (žiarenie len ako príbeh).
  function tankGlow(b, x, y, h) {
    b.rect(x, y, 3, h, 'greenLight'); b.rect(x, y, 1, h, 'white');
    b.rect(x - 1, y - 1, 5, 1, 'grey'); b.rect(x - 1, y + h, 5, 1, 'slate');
    for (var j = 0; j < h; j++) for (var i = 0; i < 3; i++) b.light(x + i, y + j, j < 1 || i === 0 ? 'white' : 'greenLight');
  }
  K.bld('laboratorium', 3, 56, 46, function (b) {
    // satelitná anténa na hornom kontajneri
    b.rect(15, 10, 2, 7, 'slate'); b.rect(15, 10, 1, 7, 'grey'); b.rect(12, 16, 7, 1, 'grey');
    dish(b, 13, 8, 7, 3, -0.6);
    b.line(13, 8, 9, 3, 'slate'); b.rect(8, 2, 2, 2, 'grey'); b.px(8, 2, 'greyLight');
    // anténa so svetlom
    b.rect(30, 2, 1, 15, 'slate'); b.rect(28, 5, 5, 1, 'grey'); b.rect(29, 8, 3, 1, 'grey');
    b.px(30, 1, 'red'); b.light(30, 1, 'red');
    // kontajnery
    container(b, 6, 17, 28, 12, C_BLUE);
    container(b, 2, 29, 32, 13, C_RUST);
    streaks(b, [[6, 30, 5], [26, 30, 4], [12, 18, 3]]);
    blocks(b, [3, 16, 30], 42, 4);
    K.win(b, 10, 20, 5, 3, true, 'slateDark'); K.win(b, 20, 20, 5, 3, true, 'slateDark');
    K.win(b, 6, 32, 6, 3, true, 'slateDark');
    steelDoor(b, 22, 31, 6, 10, true);
    trefoil(b, 15, 33, 5);
    fan(b, 30.5, 35.5, 3);
    // prístavba so sklenenou kupolou
    b.rect(35, 30, 19, 15, 'greyLight'); b.rect(35, 30, 19, 1, 'white'); b.rect(52, 31, 2, 14, 'grey');
    b.rect(34, 29, 21, 1, 'slate');
    ell(44.5, 30, 9, 9, function (x, y) { if (y < 29) b.px(x, y, (x + y) % 5 === 0 ? 'white' : y < 25 ? 'cyan' : 'blue'); });
    for (var y = 21; y < 29; y++) for (var x = 35; x < 55; x++) if (b.is(x, y, 'cyan') || b.is(x, y, 'blue')) b.light(x, y, 'cyan');
    // skúmavky so zelenou žiarou za veľkým oknom prístavby
    b.rect(37, 33, 15, 9, 'navy');
    tankGlow(b, 38, 34, 7); tankGlow(b, 43, 35, 6); tankGlow(b, 48, 34, 7);
    b.rect(37, 42, 15, 1, 'slate');
    K.grass(b, 1, 54, 45);
  });

  // =================================================================== PREKÁŽKY V JAZERE: HRDZAVÉ SUDY
  // Namiesto skál (rovnaké plátna ako rock_s/m/l). Zásah do vlasca je ten istý (sim/dive.js ROCKS:
  // 10×6, 16×10, 26×14 px v strede sprite), preto hmota sudov ten obdĺžnik zhruba vypĺňa.
  // Bez červenej (napätie) a bez svetlozelenej (ťukaj teraz) — ART_SPEC §3.
  K.def('barrel_s', 12, 10, 1, function (b) {
    drumSide(b, 1, 2, 10, 7, D_RUST);
    b.rect(5, 3, 2, 1, 'sand');                                             // odlesk
    trefoil(b, 6, 4, 3, 'ink', 'amber');
    b.px(10, 7, 0); b.px(9, 7, 'wood');                                     // preliačina
    b.outline('ink');
  }, 'prop');
  K.def('barrel_m', 20, 14, 1, function (b) {
    drumUp(b, 2, 1, 8, 11, D_OLD);
    b.px(9, 4, 0); b.px(8, 4, 'wood');                                      // preliačina
    drumSide(b, 8, 6, 11, 7, D_RUST);
    b.rect(12, 7, 2, 1, 'sand');
    trefoil(b, 14, 8, 3);
    b.px(17, 12, 'green'); b.px(16, 12, 'greenDark'); b.px(3, 11, 'green');
    b.outline('ink');
  }, 'prop');
  K.def('barrel_l', 34, 22, 1, function (b) {
    drumUp(b, 17, 2, 10, 13, D_OLD);
    drumUp(b, 5, 4, 10, 14, D_PAINT);
    trefoil(b, 7, 9, 5);
    b.px(13, 14, 'rust'); b.px(12, 15, 'rust'); b.px(6, 8, 'rust');        // olúpaná farba
    drumSide(b, 13, 11, 16, 9, D_RUST);
    b.rect(18, 12, 3, 1, 'sand');
    b.px(28, 13, 0); b.px(27, 13, 'wood');
    [[16, 19, 'green'], [17, 19, 'greenDark'], [23, 19, 'green'], [6, 17, 'green'], [7, 17, 'greenDark']].forEach(function (p) { b.px(p[0], p[1], p[2]); });
    b.outline('ink');
  }, 'prop');

  // =================================================================== KULISY STAREJ ELEKTRÁRNE
  // Kreslené v 1× na obrazovku 180 × 320 (obloha, počasie a noc kreslí scéna).

  // Chladiaca veža: hyperbolický plášť (úzky krk v hornej štvrtine, rozšírený vrch a široká päta),
  // svetlo zľava, vyblednutý pás pod lemom, stekance, vstup vzduchu so šikmými stĺpmi, zarastená päta.
  K.def('el_tower', 40, 64, 1, function (b) {
    var cx = 20, top = 2, bot = 56, waist = 19;
    function hw(y) { y = Math.min(y, bot); return 10 * Math.sqrt(1 + Math.pow((y - waist) / (y < waist ? 18.75 : 25.8), 2)); }
    for (var y = top; y <= 62; y++) {
      var h = hw(y);
      for (var x = Math.round(cx - h); x < Math.round(cx + h); x++) {
        var u = (x + 0.5 - cx) / h;
        b.px(x, y, u < -0.62 ? 'greyLight' : u < 0.15 ? 'grey' : 'slate');
      }
    }
    for (var x2 = 0; x2 < 40; x2++) {
      if (b.at(x2, top)) b.px(x2, top, x2 < cx ? 'white' : 'greyLight');
      if (b.at(x2, top + 1)) b.px(x2, top + 1, x2 < cx - 4 ? 'greyLight' : 'grey');
      for (var yy = 5; yy <= 7; yy++) if (b.at(x2, yy)) {
        var v = HL.pal.names[b.at(x2, yy) - 1];
        b.px(x2, yy, v === 'greyLight' ? 'clay' : v === 'grey' ? 'rust' : 'redDark');
      }
    }
    [[-0.5, 9, 14], [-0.1, 9, 7], [0.25, 9, 20], [0.55, 9, 11], [-0.3, 30, 9], [0.1, 36, 6]].forEach(function (s) {
      for (var y = s[1]; y < s[1] + s[2]; y++) darker(b, Math.floor(cx + s[0] * hw(y)), y);
    });
    for (y = 52; y <= 55; y++) for (x = 0; x < 40; x++) darker(b, x, y);
    // vstup vzduchu: tmavý pás so šikmými stĺpmi, betónový prstenec a základ
    for (y = 57; y <= 62; y++) for (x = 0; x < 40; x++) if (b.at(x, y)) b.px(x, y, 'slateDark');
    function col(x, y, c) { if (b.at(x, y)) b.px(x, y, c); }                // stĺpy len vnútri plášťa
    for (var k = 3; k < 37; k += 4) {
      for (var j = 0; j < 6; j++) { col(k + Math.floor(j / 2), 62 - j, j < 3 ? 'grey' : 'slate'); col(k + 5 - Math.floor(j / 2), 62 - j, 'slate'); }
    }
    for (x = 0; x < 40; x++) if (b.at(x, 56)) b.px(x, 56, x < cx - 6 ? 'greyLight' : 'grey');
    b.rect(2, 63, 36, 1, 'slate');
    // zarastená päta: popínavé stonky
    [[4, 63, 8], [8, 63, 4], [33, 63, 6]].forEach(function (s) {
      for (var j = 0; j < s[2]; j++) b.px(s[0] + (j % 3 === 2 ? 1 : 0), s[1] - j, j % 2 ? 'greenDark' : 'green');
    });
    b.outline('slateDark');
  }, 'prop');

  // Para nad vežou: chumáč obláčikov nad širokým výstupom, každý so svetlom zľava-zhora; kreslí sa
  // zhora nadol, takže spodný (čerstvý) obláčik má svetlú hranu cez ten nad ním. Snímok 1 sa nadúva.
  K.def('el_steam', 32, 24, 2, function (b, f) {
    var puffs = f ?
      [[19, 5.5, 6, 5], [10, 10, 6, 5.5], [23, 12, 7, 6], [15, 15, 8, 6], [16, 21, 13, 3]] :
      [[18, 6.5, 5.5, 4.5], [11, 11, 6, 5], [22, 12.5, 6.5, 5.5], [15, 16, 8.5, 5.5], [16, 21, 13.5, 3]];
    puffs.forEach(function (p) {
      ell(p[0], p[1], p[2], p[3], function (x, y) {
        var dx = (x + 0.5 - p[0]) / p[2], dy = (y + 0.5 - p[1]) / p[3], l = -dx * 0.55 - dy * 0.85;
        b.px(x, y, l > -0.15 ? 'white' : l > -0.65 ? 'greyLight' : 'grey');
      });
    });
  }, 'prop');

  // Reaktorová hala: kontajnment s kupolou, nízka hala s oknami, potrubie, zarastené steny.
  K.def('el_reactor', 64, 48, 1, function (b) {
    var cx = 17.5;
    // potrubie z haly do kontajnmentu (za nimi)
    b.rect(30, 19, 14, 2, 'greyLight'); b.rect(30, 20, 14, 1, 'grey');
    b.rect(42, 19, 2, 8, 'greyLight'); b.rect(43, 19, 1, 8, 'grey');
    [33, 38].forEach(function (x) { b.rect(x, 18, 1, 4, 'slate'); });
    // kontajnment: valec + kupola
    for (var y = 24; y <= 46; y++) for (var x = 4; x <= 31; x++) {
      var u = (x + 0.5 - cx) / 14;
      b.px(x, y, u < -0.6 ? 'greyLight' : u < 0.2 ? 'grey' : 'slate');
    }
    ell(cx, 24.5, 14, 13, function (x, y) {
      if (y > 24) return;
      var dx = (x + 0.5 - cx) / 14, dy = (y + 0.5 - 24.5) / 13, l = -dx * 0.6 - dy * 0.8;
      b.px(x, y, l > 0.55 ? 'white' : l > 0.15 ? 'greyLight' : l > -0.3 ? 'grey' : 'slate');
    });
    b.rect(4, 24, 28, 1, 'slate'); b.rect(4, 25, 28, 1, 'greyLight'); b.rect(19, 25, 13, 1, 'grey');
    b.rect(9, 40, 4, 7, 'slateDark'); b.rect(9, 40, 4, 1, 'slate');           // vstup
    // hala
    b.rect(30, 27, 31, 20, 'grey'); b.rect(30, 27, 31, 1, 'greyLight'); b.rect(30, 28, 1, 19, 'greyLight');
    b.rect(30, 26, 32, 1, 'slate');
    for (x = 36; x < 60; x += 6) b.rect(x, 28, 1, 19, 'slate');
    [33, 39, 45, 51, 57].forEach(function (x) { b.rect(x, 30, 2, 3, 'navy'); b.px(x, 30, 'blueDark'); });
    b.rect(48, 37, 10, 10, 'slate'); for (y = 38; y < 47; y += 2) b.rect(48, y, 10, 1, 'slateDark');
    b.rect(52, 21, 6, 5, 'grey'); b.rect(52, 21, 6, 1, 'greyLight'); b.rect(53, 23, 4, 1, 'slate'); b.rect(53, 25, 4, 1, 'slate');
    trefoil(b, 39, 38, 5);
    // stekance a zarastenie
    [[6, 26, 9], [14, 26, 5], [24, 26, 12], [33, 33, 7], [45, 28, 6]].forEach(function (s) { for (var j = 0; j < s[2]; j++) darker(b, s[0], s[1] + j); });
    [[5, 47, 9], [7, 47, 6], [28, 47, 5], [31, 47, 8], [60, 47, 10], [58, 47, 6]].forEach(function (s) {
      for (var j = 0; j < s[2]; j++) { b.px(s[0] + (j % 4 === 3 ? 1 : 0), s[1] - j, j % 3 === 1 ? 'greenDark' : 'green'); }
    });
    b.outline('slateDark');
  }, 'prop');

  // Vetrací komín: štíhly, mierne sa zužuje, tmavočerveno-biele pásy, dva tenké servisné prstence,
  // sadze navrchu, výstražné svetlo (svieti aj v noci — svietiaca vrstva). Komín je aj v kulise PONORU nad hladinou a
  // čistá červená (#e43b44) je tam vyhradená nebezpečenstvu (ART_SPEC §3; slepý kritik kolá 0–5, P8) → redDark/plum/rust.
  K.def('el_chimney', 12, 72, 1, function (b) {
    for (var y = 4; y <= 66; y++) {
      var t = (y - 4) / 62, hw = 2.5 + t * 1.2, band = Math.floor((y - 4) / 6) % 2;
      for (var x = Math.round(6 - hw); x < Math.round(6 + hw); x++) {
        var shade = x >= Math.round(6 + hw) - 2, lit = x === Math.round(6 - hw);
        b.px(x, y, band ? (shade ? 'plum' : 'redDark') : (shade ? 'greyLight' : 'white'));
        if (lit && band) b.px(x, y, 'rust');
      }
    }
    for (y = 4; y <= 6; y++) for (x = 0; x < 12; x++) darker(b, x, y);     // sadze navrchu
    [22, 44].forEach(function (yy) {                                        // prstenec presahuje plášť o 1 px
      var xs = []; for (var x = 0; x < 12; x++) if (b.at(x, yy)) xs.push(x);
      for (x = xs[0] - 1; x <= xs[xs.length - 1] + 1; x++) b.px(x, yy, 'slate');
    });
    b.rect(2, 67, 8, 5, 'grey'); b.rect(2, 67, 8, 1, 'greyLight'); b.rect(2, 68, 1, 4, 'greyLight'); b.rect(8, 68, 2, 4, 'slate');
    b.rect(5, 3, 2, 1, 'slate');
    b.glow(5, 2, 'orange'); b.glow(6, 2, 'orange');
    b.outline('slateDark');
  }, 'prop');

  // Plot (opakuje sa vodorovne po 16 px): betónový stĺpik so šikmým ramenom, dva ostnaté drôty
  // (ostne = krátke priečne čiarky), dva hladké drôty mierne prevísajúce. Žiadne pletivo ani mriežka bodiek.
  K.def('el_fence', 16, 12, 1, function (b) {
    function wire(y, sag) { for (var x = 0; x < 16; x++) b.px(x, y + (sag && x > 5 && x < 12 ? 1 : 0), 'grey'); }
    wire(1, false); wire(4, false); wire(7, true); wire(10, true);
    [6, 12].forEach(function (x) { b.px(x, 0, 'slate'); b.px(x, 2, 'slate'); });
    [3, 9, 15].forEach(function (x) { b.px(x, 3, 'slate'); b.px(x, 5, 'slate'); });
    b.rect(0, 2, 1, 10, 'greyLight'); b.rect(1, 2, 1, 10, 'grey'); b.rect(2, 3, 1, 9, 'slate');
    b.px(1, 1, 'grey'); b.px(2, 0, 'grey'); b.px(2, 1, 'slate');
  }, 'prop');

  // Výstražná tabuľka: žltý kotúč s trojlístkom.
  K.def('el_sign', 8, 8, 1, function (b) { trefoil(b, 0, 0, 8); }, 'prop');

  // Stožiar vedenia: dve nohy, dve priečne ramená s izolátormi, mrežovanie len veľkými X (nie hustá
  // mriežka). meta.wires = body, kde visia vodiče (scéna medzi nimi kreslí drôty).
  K.def('el_pylon', 24, 48, 1, function (b) {
    b.line(3, 47, 9, 15, 'grey'); b.line(20, 47, 14, 15, 'slate');
    b.line(9, 15, 10, 4, 'grey'); b.line(14, 15, 13, 4, 'slate');
    b.rect(10, 1, 4, 3, 'slate'); b.rect(10, 1, 2, 1, 'grey'); b.px(11, 0, 'slate');
    b.rect(1, 15, 22, 1, 'slate'); b.rect(1, 14, 22, 1, 'grey');
    b.rect(3, 7, 18, 1, 'slate'); b.rect(3, 6, 18, 1, 'grey');
    b.line(2, 13, 8, 10, 'slate'); b.line(21, 13, 15, 10, 'slate');
    [[1, 16], [22, 16], [3, 8], [20, 8]].forEach(function (p) { b.rect(p[0], p[1], 1, 3, 'greyLight'); b.px(p[0], p[1] + 3, 'white'); });
    function legX(side, y) { return side ? 20 + (14 - 20) * (47 - y) / 32 : 3 + (9 - 3) * (47 - y) / 32; }
    var rows = [16, 26, 36, 47];
    for (var i = 0; i < rows.length - 1; i++) {
      var y0 = rows[i], y1 = rows[i + 1];
      b.line(legX(0, y0), y0, legX(1, y1), y1, 'slate');
      b.line(legX(1, y0), y0, legX(0, y1), y1, 'slate');
      if (i) b.line(legX(0, y0), y0, legX(1, y0), y0, 'slate');
    }
    b.line(10, 12, 13, 8, 'slate'); b.line(13, 12, 10, 8, 'slate');
    b.rect(2, 46, 3, 2, 'greyLight'); b.rect(19, 46, 3, 2, 'grey');
    b.meta.wires = [[1, 19], [22, 19], [3, 11], [20, 11]];
  }, 'prop');

  // Rázcestník v dedine: drevená tabuľa v tvare šípky doprava s trojlístkom a namaľovanou šípkou.
  K.def('sign_elektraren', 16, 24, 1, function (b) {
    b.rect(4, 8, 2, 15, 'wood'); b.rect(4, 8, 1, 15, 'woodLight');
    b.poly([[1, 2], [12, 2], [15, 5.5], [12, 9], [1, 9]], 'woodLight');
    b.rect(1, 2, 12, 1, 'sand'); b.px(13, 3, 'sand');
    b.rect(1, 8, 11, 1, 'wood'); b.px(12, 7, 'wood'); b.px(13, 6, 'wood');
    trefoil(b, 3, 3, 5);
    b.rect(9, 5, 3, 1, 'wood'); b.px(11, 4, 'wood'); b.px(11, 6, 'wood');
    K.grass(b, 1, 9, 23);
    b.px(3, 23, 'green'); b.px(6, 23, 'green');
    b.outline('ink');
  }, 'prop');
})(globalThis.HL);
