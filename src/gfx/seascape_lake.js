// PODMORIE JADROVÉHO JAZERA (docs/JAZERO.md) — svet pre motor gfx/seascape.js (HL.sea.addWorld('jadro', …)).
//
// Ten istý motor ako more (vrstvy far/mid/near, kusy po pásmach, kmap tmy, rastliny na kotvách, svetlo háčika),
// iný svet: betónové a oceľové steny s ROVNÝMI hranami (st.wob, st.flat), zelená voda pri hladine → tmavá
// tyrkysová v šachte (qStops na rampe jazera v ui/dive.js: greenLight, green, greenDark, tealDark, ink), trstina
// a riasy v Chladiacom jazere, potrubia a ventily v Zatopenej hale, riadiace tyče a káble v Šachte reaktora.
// Orientačné body: nasávací kanál, turbína, lávka, pohony riadiacich tyčí; na dne (800 m) betónová podlaha
// a nádoba jadra s palivovými tyčami. Žiara jadra (Čerenkov) nie je farba kusov — kreslí ju ui/dive.js nad tmou
// (core = poloha nádoby), aby ju tma neprekryla ako všetko ostatné.
(function (HL) {
  'use strict';
  var T = HL.T, U = HL.sea.util, C = U.C, PW = U.PW, vn = U.vn, kOf = U.kOf;
  var def = HL.spr.def, ell = HL.spr.shape.ell, poly = HL.spr.shape.poly;
  function nz(x, y, salt) { return HL.spr.noise(x, y, salt); }

  var d_ = T.def;
  // Denná farba vody jazera (poloha na rampe jazera: 1 zelená, 2 tmavozelená, 3 tmavotyrkysová). ODHAD — posuvníky F2.
  d_('Jazero', 'lakeQ80', 1.7, 1, 3, 0.05, 'Jazero: voda v 80 m (koniec Chladiaceho jazera), poloha na rampe');
  d_('Jazero', 'lakeQ150', 2.0, 1, 3, 0.05, 'Jazero: voda v 150 m (Zatopená hala)');
  // 2,48: stupeň tmy kOf (= round(q) − 1) sa zmení až pri 300 m, na hranici haly a šachty — pri 2,6 bol pás 280–300 m
  // celý atrament (všetky tri vrstvy haly o stupeň tmavšie) tesne nad svetlou šachtou.
  d_('Jazero', 'lakeQ300', 2.48, 1.5, 3, 0.01, 'Jazero: voda v 300 m (koniec haly)');
  d_('Jazero', 'lakeQ420', 3.0, 2, 3, 0.05, 'Jazero: voda v 420 m a hlbšie (Šachta reaktora)');

  // Štýly blízkej steny podľa pásma jazera (farby pre vodu pri hladine, tmavnú o kOf stupňov ako more).
  // top = osvetlený vrch kusu, rim = hrana do vody. wob = vlnenie hrany (more 1), flat = rovný vrch (betón).
  // Žiadna greenLight: v ponore patrí len boju (ART_SPEC §3) — vrch betónu v Chladiacom jazere je svetlosivý, riasy
  // pod ním zelené (revízia 2026-10-02; stráži lake_sea.test.js).
  // Tón stien jazera = POSUVNÍKY (F2, skupina „Jazero"): vzdialená, stredná a blízka stena v každom pásme, index do TONES
  // (od najtmavšej po najsvetlejšiu; farba platí pri hladine pásma, hlbšie tmavne o kOf stupňov rampy ako more).
  // Slepý kritik: kolo 0 (J3 = 4) — stredná a blízka stena s tým istým jasom, diaľka od 280 m vo farbe vody; kolo 1 —
  // betónová diaľka dala čistý rebrík jasu, ale vrstvy prestali patriť k farbe vody (5,8 vs 6,0 = bez rozdielu). Odtieň
  // proti hodnote je VKUS: predvolené čísla sú ODHAD (diaľka v odtieni vody, stred a blízko po rebríku, svetlá šachta),
  // posúdi majiteľ. Geometria kusov sa posuvníkmi nemení (len farby). Stráži lake_sea.test.js (roviny pri predvolených).
  var TONES = ['ink', 'navy', 'tealDark', 'slateDark', 'greenDark', 'slate', 'grey', 'greyLight'];
  var LIGHTER = { ink: 'navy', navy: 'slateDark', tealDark: 'greenDark', slateDark: 'slate', greenDark: 'green', slate: 'grey', grey: 'greyLight', greyLight: 'white' };
  var TONE_HELP = ' (0 atrament · 1 tmavomodrá · 2 tmavotyrkysová · 3 tmavá bridlica · 4 tmavozelená · 5 bridlica · 6 sivá · 7 svetlosivá)';
  var ZT = { chladiace: 'Cool', hala: 'Hall', sachta: 'Shaft' };
  var ZN = { chladiace: 'Chladiace jazero', hala: 'Zatopená hala', sachta: 'Šachta' };
  var TONE_DEF = { Cool: [4, 3, 1], Hall: [4, 3, 1], Shaft: [5, 6, 7] };   // [ďaleko, stred, blízko]
  ['chladiace', 'hala', 'sachta'].forEach(function (z) {
    var k = ZT[z], dv = TONE_DEF[k];
    d_('Jazero', 'lakeToneFar' + k, dv[0], 0, 7, 1, 'Jazero: tón vzdialenej steny — ' + ZN[z] + TONE_HELP);
    d_('Jazero', 'lakeToneMid' + k, dv[1], 0, 7, 1, 'Jazero: tón strednej steny — ' + ZN[z] + TONE_HELP);
    d_('Jazero', 'lakeToneNear' + k, dv[2], 0, 7, 1, 'Jazero: tón blízkej steny (telo; vrch má pásmo svoj) — ' + ZN[z] + TONE_HELP);
  });
  function toneAt(key) { return TONES[Math.max(0, Math.min(TONES.length - 1, Math.round(T[key])))]; }
  function darker1(c) { return HL.pal.names.find(function (n) { return HL.pal[n] === HL.pal.darker(c, 1); }); }
  // Tvar kusov podľa vrstvy a pásma (rovnaký ako pred posuvníkmi — rozloženie sveta sa nemení)
  var NEAR_GEOM = {
    chladiace: { kinds: [3, 1, 3, 2], h: [0.35, 0.8], w: 0.9, top: 'greyLight', top2: 'green', wob: 0.35, flat: true },
    hala: { kinds: [4, 1, 4], h: [0.5, 1.2], w: 1.0, top: 'rust', top2: 'wood', wob: 0.25, flat: true },
    // Šachta je nakreslená SVETLO (betón) ako Priepasť mora — svetlý vrch, telo podľa posuvníka.
    sachta: { kinds: [4, 4, 3], h: [0.7, 1.6], w: 1.0, deep: true, top: 'white', top2: 'greyLight', wob: 0.2, flat: true },
  };
  var FAR_GEOM = { kinds: [4, 3, 4, 1], h: [0.33, 1], w: 1, wob: 0.3, flat: true };
  var MID_GEOM = { kinds: [1, 4, 3], h: [0.3, 1], w: 1, wob: 0.3, flat: true };
  // Štýly sa držia v pamäti podľa (vrstva, pásmo, tón): ten istý objekt pre všetky kusy (testy menia farbu na ňom).
  var stCache = {};
  function styleOf(layer, z, tone) {
    var key = layer + ':' + z + ':' + tone;
    if (stCache[key]) return stCache[key];
    var g = layer === 'near' ? NEAR_GEOM[z] : layer === 'mid' ? MID_GEOM : FAR_GEOM, st = {};
    for (var k in g) st[k] = g[k];
    var dk = darker1(tone);
    if (layer === 'near') { st.body = tone; st.rim = LIGHTER[tone]; st.crack = dk; st.shadow = dk; }
    else { st.top = tone; st.top2 = tone; st.body = tone; st.rim = tone; st.crack = dk; st.shadow = dk; }
    return (stCache[key] = st);
  }
  function zoneOf(dep) { var z = U.zoneId(dep, false, 'jadro'); return ZT[z] ? z : 'sachta'; }
  function layerStyle(layer, dep) {
    var z = zoneOf(dep), K = { far: 'lakeToneFar', mid: 'lakeToneMid', near: 'lakeToneNear' }[layer] + ZT[z];
    return styleOf(layer, z, toneAt(K));
  }
  function toneSig() { var o = []; for (var z in ZT) ['Far', 'Mid', 'Near'].forEach(function (l) { o.push(T['lakeTone' + l + ZT[z]]); }); return o.join(','); }

  // Čo rastie (a hrdzavie) v ktorom pásme jazera. p = pravdepodobnosť na jedno miesto.
  // Slepý kritik kolo 4 (P5): stredná vrstva haly mala jediný sprite (lk_pipes) → ten istý tvar 3× na ľavej stene na
  // jednej obrazovke. Každý zoznam má aspoň 2 varianty a jazero ich STRIEDA podľa výšky miesta a strany (pickFlora),
  // nie náhodne — susedné miesta na tej istej stene majú iný tvar. Stráži lake_ui.test.js (sprity naozaj nakreslené).
  var FLORA = {
    chladiace: { p: 0.8, list: ['lk_reed', 'lk_algae', 'sea_grass'] },
    hala: { p: 0.5, list: ['lk_pipe', 'lk_valve', 'lk_gauge'] },
    sachta: { p: 0.4, list: ['lk_rod', 'lk_cable', 'lk_lamp'] },
  };
  var MID_FLORA = {
    chladiace: { p: 0.6, list: ['lk_reedwall', 'lk_reedclump'] },
    hala: { p: 0.45, list: ['lk_pipes', 'lk_girder', 'lk_duct', 'lk_column'] },
  };
  // rank = poradie osadeného miesta na tej istej strane v kúsku (motor: floraPlan) — susedné na jednej stene sú vždy
  // iné; pravá strana posunutá o 2 (oproti sebe iné). Prvý pokus podľa výšky (pás 29 px) nechal 3 rovnaké rúrky na stene.
  function pickFlora(list, A, q, rank) { return list[((rank | 0) + (A.x0 >= PW / 2 ? 2 : 0)) % list.length]; }
  // Orientačné body (spodok spritu v hĺbke depth; v strednej vrstve menovitej).
  var LANDMARKS = [
    { id: 'intake', name: 'lm_intake', layer: 'near', depth: 46, side: -1, x: 0 },
    { id: 'turbine', name: 'lm_turbine', layer: 'mid', depth: 170, side: 1, x: 0 },
    { id: 'catwalk', name: 'lm_catwalk', layer: 'near', depth: 252, side: 1, x: 0 },
    { id: 'rods', name: 'lm_rods', layer: 'mid', depth: 540, side: -1, x: 8 },
  ];

  // ------------------------------------------------------------------ dno: betón a nádoba jadra
  // Nádoba jadra v strede dna (stĺpce x0..x1, výška h px nad podlahou). ui/dive.js nad ňou kreslí žiaru.
  var CORE = { x0: 56, x1: 124, h: 26 };
  function floorRow() { return HL.data.LAKE_FLOOR * T.pxPerM; }
  function floorTop(x) {
    var fr = floorRow();
    // rovná betónová podlaha; pri nádobe schod (základ nádoby)
    if (x >= CORE.x0 - 6 && x < CORE.x1 + 6) return fr - 3;
    return fr - 6 + (Math.floor(x / 37) % 2);
  }
  function paintFloor(buf, kmap, r0, n) {
    var fr = floorRow(), kp = kOf(HL.data.LAKE_FLOOR, 'jadro');
    if (r0 + n <= fr - CORE.h - 4) return;
    function put(x, ly, c) { if (x < 0 || x >= PW || ly < r0 || ly >= r0 + n) return; buf[(ly - r0) * PW + x] = c; kmap[(ly - r0) * PW + x] = kp; }
    for (var x = 0; x < PW; x++) {
      var top = floorTop(x);
      // podlaha je nakreslená SVETLO (ako dno Priepasti): v tmavej šachte (k = 2) je z nej sivomodrý betón, nie atrament
      for (var ly = Math.max(top, r0); ly < r0 + n; ly++) {
        var d = ly - top, c;
        if (d === 0) c = C.white;
        else if (d === 1) c = C.greyLight;
        else if (d > 3 && U.mod(ly - fr, 9) === 0) c = C.slate;   // škáry betónových dosiek
        else c = C.grey;
        put(x, ly, c);
      }
      if (x % 23 === 0) for (var s = 1; s < 5; s++) put(x, top + s, C.slate); // zvislé škáry
    }
    // nádoba jadra: oceľové steny, vnútri palivové tyče a medzi nimi voda (žiaru dokreslí dive.js)
    var y0 = fr - 3 - CORE.h;
    for (var xx = CORE.x0; xx < CORE.x1; xx++) {
      var wall = xx < CORE.x0 + 3 || xx >= CORE.x1 - 3;
      for (var yy = y0; yy < fr - 3; yy++) {
        var c2;
        if (yy === y0) c2 = C.greyLight;                                   // horný lem nádoby
        else if (wall) c2 = xx === CORE.x0 || xx === CORE.x1 - 1 ? C.slate : C.grey;
        else {
          var col = (xx - CORE.x0 - 3) % 5, rod = col < 2;
          if (yy < y0 + 4) c2 = C.blueDark;                                 // voda nad tyčami
          else if (rod) c2 = yy === y0 + 4 ? C.cyan : col === 0 ? C.grey : C.slate;
          else c2 = C.blue;                                                 // voda medzi tyčami
        }
        put(xx, yy, c2);
      }
    }
  }

  HL.sea.addWorld('jadro', {
    floor: function () { return HL.data.LAKE_FLOOR; },
    qStops: function () { return [[0, 1], [25, 1], [80, T.lakeQ80], [150, T.lakeQ150], [300, T.lakeQ300], [420, T.lakeQ420], [HL.data.LAKE_FLOOR, T.lakeQ420]]; },
    schools: false,
    flora: FLORA, midFlora: MID_FLORA, landmarks: LANDMARKS, pickFlora: pickFlora,
    paintFloor: paintFloor, floorTop: floorTop, core: CORE,
    sig: function () { return [T.lakeQ80, T.lakeQ150, T.lakeQ300, T.lakeQ420].join(',') + '|' + toneSig(); },
    cfg: function (name) {
      var wd = HL.sea.worldDef('jadro');
      if (name === 'far') return { wd: wd, min: 6, span: T.seaFarW * 0.8, hMax: T.seaFarH, alt: 420, envSalt: 2190, anti: true, eMin: 0.22, wVar: 0.5,
        salt: 2100, style: function (dep) { return layerStyle('far', dep); } };
      if (name === 'mid') return { wd: wd, min: 0, span: T.seaMidW, hMax: T.seaMidH, alt: 240, envSalt: 2390, anti: true, eMin: 0.1, wVar: 0.35,
        salt: 2300, style: function (dep) { return layerStyle('mid', dep); } };
      return { wd: wd, min: 3, span: T.seaWallW, hMax: T.seaWallH, alt: 110, envSalt: 2590, anti: true, eMin: 0.1, wVar: 0.3,
        salt: 2500, style: function (dep) { var st = layerStyle('near', dep); return st.deep ? U.nearStyleOf({ x: st }, 'x', st) : st; } };
    },
  });

  // ================================================================== sprity (kind 'sea')
  // Trstina (Chladiace jazero): tenké stonky, dve s hnedým klasom, kývu sa.
  def('lk_reed', 12, 26, 2, function (b, f) {
    [[2, 22, 'green', 0], [4, 25, 'greenDark', 1], [6, 19, 'green', 0], [8, 24, 'green', 1], [10, 16, 'greenDark', 0]].forEach(function (s, k) {
      for (var y = 0; y < s[1]; y++) {
        var t = y / s[1], x = s[0] + Math.sin(t * 2 + f * 1.2 + k) * 1.1 * t;
        b.px(x, 25 - y, s[2]);
      }
      if (s[3]) {
        var tx = s[0] + Math.sin(2 + f * 1.2 + k) * 1.1;
        b.rect(Math.round(tx), 25 - s[1] - 1, 2, 5, 'wood');
        b.px(Math.round(tx), 25 - s[1] - 1, 'woodLight');
        b.px(Math.round(tx) + 1, 25 - s[1] - 3, 'greenDark');
      }
    });
    b.outline('tealDark');
  }, 'sea');
  // Riasy (Chladiace jazero): vláknitý trs, vlákna sa vlnia (zelená, tmavozelená; svetlozelená len na 2 špičkách).
  def('lk_algae', 14, 16, 2, function (b, f) {
    for (var k = 0; k < 7; k++) {
      var x0 = 2 + k * 1.6, h = 8 + Math.round(6 * nz(k, 5, 2801));
      for (var y = 0; y < h; y++) {
        var t = y / h, x = x0 + Math.sin(t * 4 + f * 1.5 + k * 0.8) * 1.4 * t;
        b.px(x, 15 - y, k % 3 === 1 ? 'greenDark' : 'green');
      }
      if (k === 2 || k === 5) b.px(x0 + Math.sin(4 + f * 1.5 + k * 0.8) * 1.4, 15 - h, 'greenLight');
    }
    b.outline('tealDark');
  }, 'sea');
  // Pahýľ potrubia (Zatopená hala): príruba, tmavý otvor, hrdzavé stekance.
  def('lk_pipe', 14, 14, 1, function (b) {
    b.rect(3, 4, 8, 10, 'slate');
    b.rect(3, 4, 2, 10, 'grey');
    b.rect(1, 2, 12, 3, 'grey');
    b.rect(1, 2, 12, 1, 'greyLight');
    b.rect(4, 3, 6, 1, 'ink');
    b.rect(9, 5, 1, 6, 'rust'); b.rect(6, 7, 1, 4, 'rust');
    b.px(2, 3, 'slateDark'); b.px(11, 3, 'slateDark');
    b.outline('ink');
  }, 'sea');
  // Ventil (Zatopená hala): ručné koleso na krátkej rúrke, hrdzavo červené.
  def('lk_valve', 12, 14, 1, function (b) {
    b.rect(5, 6, 3, 8, 'slate'); b.rect(5, 6, 1, 8, 'grey');
    ell(6.5, 4.5, 4.6, 2.4, function (x, y) { b.px(x, y, y < 4 ? 'rust' : 'redDark'); });   // nie red — tá patrí nebezpečenstvu (P8)
    ell(6.5, 4.5, 2.6, 1.0, function (x, y) { b.px(x, y, 0); });
    b.px(6, 4, 'rust'); b.px(7, 4, 'rust');
    b.rect(2, 12, 9, 2, 'slateDark'); b.rect(2, 12, 9, 1, 'grey');
    b.outline('ink');
  }, 'sea');
  // Riadiaca tyč (Šachta reaktora): sivá tyč s tyrkysovými pásmi, na konci kladka.
  def('lk_rod', 8, 22, 1, function (b) {
    b.rect(3, 2, 2, 20, 'greyLight'); b.rect(4, 2, 1, 20, 'grey');
    [6, 12, 18].forEach(function (y) { b.rect(3, y, 2, 1, 'cyan'); });
    b.rect(1, 0, 6, 2, 'slate'); b.rect(1, 0, 6, 1, 'grey');
    b.outline('slateDark');
  }, 'sea');
  // Zväzok káblov (Šachta): visí a kýve sa, žltá páska.
  def('lk_cable', 14, 20, 2, function (b, f) {
    [[4, 'slateDark'], [7, 'navy'], [10, 'slateDark']].forEach(function (c, k) {
      for (var y = 0; y < 18; y++) b.px(c[0] + Math.sin(y * 0.3 + f * 1.2 + k) * 1.2 * (y / 18), 19 - y, c[1]);
    });
    b.rect(3, 6, 9, 2, 'amber'); b.rect(3, 7, 9, 1, 'orange');
    b.rect(2, 18, 11, 2, 'slate');
    b.outline('ink');
  }, 'sea');
  // Porast trstiny (stredná vrstva Chladiaceho jazera): hustý pás stoniek, pár klasov.
  def('lk_reedwall', 28, 36, 2, function (b, f) {
    for (var k = 0; k < 13; k++) {
      var x0 = 1 + k * 2.1, h = 22 + Math.round(12 * nz(k, 9, 2803)), c = k % 3 ? 'green' : 'greenDark';
      for (var y = 0; y < h; y++) {
        var t = y / h;
        b.px(x0 + Math.sin(t * 1.8 + f * 1.1 + k * 0.7) * 1.3 * t, 35 - y, c);
      }
      if (k % 4 === 1) b.rect(Math.round(x0 + Math.sin(1.8 + f * 1.1 + k * 0.7) * 1.3), 35 - h - 1, 2, 4, 'wood');
    }
    b.outline('tealDark');
  }, 'sea');
  // Zväzok rúr (stredná vrstva Zatopenej haly): dve hrubé rúry s kolenom a prírubami.
  def('lk_pipes', 30, 26, 1, function (b) {
    b.rect(0, 6, 30, 6, 'slate'); b.rect(0, 6, 30, 1, 'grey'); b.rect(0, 11, 30, 1, 'slateDark');
    b.rect(0, 14, 22, 5, 'slate'); b.rect(0, 14, 22, 1, 'grey');
    b.rect(18, 14, 5, 12, 'slate'); b.rect(18, 14, 1, 12, 'grey');
    [7, 19].forEach(function (x) { b.rect(x, 5, 2, 8, 'grey'); });
    b.rect(10, 13, 2, 7, 'grey');
    b.rect(24, 7, 1, 4, 'rust'); b.rect(14, 15, 1, 3, 'rust');
    b.outline('ink');
  }, 'sea');

  // Zlomený oceľový nosník (stredná vrstva haly): šikmý profil I, nity, hrdzavé stekance, zubatý koniec.
  def('lk_girder', 30, 20, 1, function (b) {
    for (var i = 0; i < 28; i++) {
      var y = 16 - Math.round(i * 0.42);
      b.px(1 + i, y - 3, 'grey'); b.px(1 + i, y - 2, 'slate'); b.px(1 + i, y - 1, 'slate'); b.px(1 + i, y, 'slateDark');
      if (i % 6 === 3) b.px(1 + i, y - 2, 'slateDark');
    }
    b.px(28, 3, 0); b.px(27, 2, 0); b.px(28, 5, 0);
    b.rect(8, 14, 1, 4, 'rust'); b.rect(20, 9, 1, 3, 'rust');
    b.outline('navy');
  }, 'sea');
  // Vzduchotechnika (stredná vrstva haly): plechový kanál so spojmi, príruba a mriežka na konci, hrdza.
  def('lk_duct', 30, 14, 1, function (b) {
    b.rect(0, 3, 26, 8, 'slate'); b.rect(0, 3, 26, 1, 'grey'); b.rect(0, 10, 26, 1, 'slateDark');
    for (var x = 4; x < 26; x += 7) b.rect(x, 3, 1, 8, 'slateDark');
    b.rect(25, 1, 4, 12, 'grey'); b.rect(25, 1, 4, 1, 'greyLight');
    for (var y = 3; y < 11; y += 2) b.rect(26, y, 2, 1, 'navy');
    b.rect(10, 11, 1, 2, 'rust'); b.rect(18, 11, 1, 3, 'rust');
    b.outline('navy');
  }, 'sea');
  // Zlomený betónový stĺp (stredná vrstva haly): zubatý vrch, vytŕčajúca hrdzavá výstuž, trhliny, päta.
  def('lk_column', 14, 34, 1, function (b) {
    b.rect(2, 8, 10, 26, 'grey'); b.rect(2, 8, 2, 26, 'greyLight'); b.rect(10, 8, 2, 26, 'slate');
    [[2, 6], [4, 4], [6, 7], [8, 5], [10, 7]].forEach(function (p) { b.rect(p[0], p[1], 2, 8 - p[1], 'grey'); });
    b.rect(4, 0, 1, 6, 'rust'); b.rect(9, 1, 1, 5, 'rust');
    b.px(6, 14, 'slateDark'); b.px(7, 15, 'slateDark'); b.px(7, 16, 'slateDark'); b.px(5, 24, 'slateDark'); b.px(6, 25, 'slateDark');
    b.rect(2, 31, 10, 3, 'slate');
    b.outline('slateDark');
  }, 'sea');
  // Manometer (Zatopená hala, blízka stena): okrúhly ciferník na krátkej rúrke, ručička, úchyt.
  def('lk_gauge', 12, 16, 1, function (b) {
    b.rect(5, 9, 2, 7, 'slate'); b.rect(5, 9, 1, 7, 'grey');
    ell(5.5, 5.5, 5, 5, function (x, y) { b.px(x, y, 'grey'); });
    ell(5.5, 5.5, 3.6, 3.6, function (x, y) { b.px(x, y, 'greyLight'); });
    b.line(5, 6, 8, 3, 'slateDark');
    b.rect(2, 14, 8, 2, 'slateDark');
    b.outline('navy');
  }, 'sea');
  // Mŕtva lampa v klietke (Šachta, blízka stena): držiak, mliečne sklo, mreža.
  def('lk_lamp', 10, 14, 1, function (b) {
    b.rect(4, 8, 2, 6, 'slate'); b.rect(1, 12, 8, 2, 'slateDark');
    ell(4.5, 4.5, 3.6, 4.2, function (x, y) { b.px(x, y, 'greyLight'); });
    b.rect(1, 2, 8, 1, 'slate'); b.rect(1, 5, 8, 1, 'slate'); b.rect(4, 0, 2, 9, 'slate');
    b.px(3, 3, 'white');
    b.outline('slateDark');
  }, 'sea');
  // Trs trstiny (stredná vrstva Chladiaceho jazera): menší a redší než porast, kýve sa.
  def('lk_reedclump', 20, 26, 2, function (b, f) {
    for (var k = 0; k < 8; k++) {
      var x0 = 2 + k * 2.1, h = 12 + Math.round(10 * nz(k, 11, 2805)), c = k % 3 ? 'greenDark' : 'green';
      for (var y = 0; y < h; y++) { var t = y / h; b.px(x0 + Math.sin(t * 1.6 + f * 1.1 + k) * 1.2 * t, 25 - y, c); }
      if (k % 3 === 1) b.rect(Math.round(x0 + Math.sin(1.6 + f * 1.1 + k) * 1.2), 25 - h - 1, 2, 3, 'wood');
    }
    b.outline('tealDark');
  }, 'sea');

  // ---- orientačné body
  // Nasávací kanál (Chladiace jazero, ľavá stena): betónový blok s okrúhlym otvorom a mrežou.
  def('lm_intake', 44, 30, 1, function (b) {
    b.rect(0, 2, 40, 28, 'slateDark'); b.rect(0, 2, 40, 2, 'slate'); b.rect(0, 2, 40, 1, 'grey');
    ell(22, 17, 12, 11, function (x, y) { b.px(x, y, 'grey'); });
    ell(22, 17, 10, 9, function (x, y) { b.px(x, y, 'ink'); });
    for (var gx = 15; gx <= 29; gx += 3) for (var gy = 9; gy < 26; gy++) if (b.is(gx, gy, 'ink')) b.px(gx, gy, 'slate');
    for (var gy2 = 12; gy2 <= 22; gy2 += 5) for (var gx2 = 13; gx2 < 32; gx2++) if (b.is(gx2, gy2, 'ink')) b.px(gx2, gy2, 'slate');
    b.rect(30, 20, 1, 9, 'rust'); b.rect(12, 22, 1, 6, 'rust');
    b.rect(40, 6, 4, 22, 'slate');
    b.outline('ink');
  }, 'sea');
  // Turbína (Zatopená hala, stredná vrstva): plášť s otvoreným rotorom — lopatky na hriadeli.
  def('lm_turbine', 56, 44, 1, function (b) {
    poly([[2, 43], [2, 14], [10, 6], [46, 6], [54, 14], [54, 43]], function (x, y) { b.px(x, y, y < 9 ? 'grey' : 'slate'); });
    b.rect(8, 16, 40, 22, 'ink');
    b.rect(6, 25, 44, 3, 'greyLight');                                       // hriadeľ
    [11, 18, 25, 32, 39].forEach(function (x, k) {
      var h = 9 - Math.abs(k - 2) * 2;
      b.rect(x, 26 - h, 4, h * 2 + 2, k % 2 ? 'grey' : 'greyLight');
      b.rect(x + 3, 26 - h, 1, h * 2 + 2, 'slate');
    });
    b.rect(2, 40, 52, 4, 'slateDark'); b.rect(2, 40, 52, 1, 'slate');
    b.rect(44, 8, 2, 30, 'rust'); b.rect(10, 9, 1, 6, 'rust');
    b.outline('ink');
  }, 'sea');
  // Lávka (Zatopená hala, pravá stena): oceľový rošt so žltým zábradlím a vzperou. Nakreslená pre ĽAVÚ stenu
  // (vzpera a pätka vľavo) ako všetky sprity stien — motor ju pre pravú stenu zrkadlí (flip = side > 0). Revízia
  // 2026-10-02: kreslená pre pravú stenu a po zrkadlení visela pätka 9–29 px vo vode a pri stene nebola opora.
  def('lm_catwalk', 62, 24, 1, function (b) {
    b.rect(0, 12, 62, 3, 'slate'); b.rect(0, 12, 62, 1, 'grey');
    for (var x = 3; x < 61; x += 4) b.px(x, 13, 'slateDark');
    for (var p = 59; p > 0; p -= 12) { b.rect(p, 3, 1, 9, 'amber'); }
    b.rect(0, 3, 62, 1, 'amber'); b.rect(0, 7, 62, 1, 'orange');
    b.line(5, 15, 0, 23, 'slate'); b.line(31, 15, 15, 23, 'slate'); b.rect(0, 22, 16, 2, 'slateDark');
    b.rect(43, 3, 1, 9, 'rust');
    b.outline('ink');
  }, 'sea');
  // Pohony riadiacich tyčí (Šachta, stredná vrstva): doska a zväzok rúrok s tyrkysovými koncami.
  def('lm_rods', 40, 60, 1, function (b) {
    b.rect(0, 0, 40, 6, 'grey'); b.rect(0, 0, 40, 1, 'greyLight'); b.rect(0, 5, 40, 1, 'slate');
    for (var k = 0; k < 7; k++) {
      var x = 3 + k * 5, len = 30 + Math.round(18 * nz(k, 3, 2811));
      b.rect(x, 6, 3, len, k % 2 ? 'slate' : 'grey');
      b.rect(x, 6, 1, len, 'greyLight');
      b.rect(x, 6 + len, 3, 2, 'cyan');
    }
    b.outline('slateDark');
  }, 'sea');
})(globalThis.HL);
