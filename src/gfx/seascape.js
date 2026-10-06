// PODMORIE — krajina za vodou v ponore (ART_SPEC.md §1 a §4, art/RUBRIC_podmorie.md, ARCHITECTURE.md §20).
//
// Tri vrstvy do diaľky (dizajn 14.1: „paralax 3 až 4 vrstvy pozadia — riasy, skaly, vzdialené siluety"):
//   far  — vzdialené útesy (posun T.diveFarScroll): ploché, len o stupeň od farby vody,
//   mid  — skalné výbežky, chaluhy, koraly, oblúk a vrak (posun T.diveMidScroll),
//   near — steny priekopy, v ktorej háčik klesá (posun 1 = pevne vo svete): balvany a dosky s rastlinami,
//          loďka, kostra veľryby, ruiny a dno mora.
// Ďalej = bližšie farbe vody, bližšie = tmavšie (atmosférická perspektíva). Vrstvy oddeľuje HODNOTA.
//
// FARBY: všetko je nakreslené pre DENNÚ MODRÚ VODU (stupeň k = 0) a tmavne o celé stupne rampy palety
// (HL.pal.darker). Každý KUS skaly má stupeň podľa dennej farby vody vo svojej hĺbke (qDay → kOf, zapečený do
// kmap) — prechod farby je na škáre medzi kusmi. Kolo 1 farbilo po riadkoch podľa vody a pruhy prechodu išli
// naprieč skalami aj riasami (kritik P7). Noc, búrka a svetlo háčika posunú celý snímok o dk (dive.js seaDk).
// Svetlo háčika vráti blízkej stene T.seaLampLit stupňov (drawLit): v tme vidno skaly a kostru naplno
// len v kuželi svetla (dizajn 14.1), mimo neho sú to tmavé siluety na tmavomodrej vode.
//
// SVET JE PEVNÝ a maľuje sa po kúskoch: každá vrstva má zoznam kusov skaly cez celú kariéru (0 m až dno)
// a orientačné body; štýl kusov sa mení podľa pásma (Plytčina svahy s riasami, Útesy dosky s koralovým
// lemom, Súmrak vysoké útesy, Polnoc čadičové stĺpy, Priepasť komíny a dno). Index farieb kúska
// (CH riadkov) sa namaľuje, keď ho treba, a plátno sa robí len pre stupne k na obrazovke (LRU).
// Hĺbky pod rozsahom (Nekonečná hlbina) opakujú úsek Priepasti (slučka loop0..loop1, bez dna).
// Rozmiestnenie: HL.hash s pevnými soľami (nie semeno uloženia) — vrak je vždy v tej istej hĺbke.
//
// VIAC SVETOV (docs/JAZERO.md): tento modul je motor (vrstvy, kusy, kmap, rastliny, svetlo) + svet MORA.
// Ďalší svet (jadrové jazero, gfx/seascape_lake.js) sa zaregistruje cez HL.sea.addWorld(loc, def) — vlastné
// pásma, štýly stien, rastliny, orientačné body, denná farba vody (qStops) a dno. v.loc v drawBack/drawNear
// vyberie svet; bez neho je to more — a more je bit po bite to isté ako pred zmenou (odtlačok kúskov).
(function (HL) {
  'use strict';
  var T = HL.T, P = HL.pal;
  var PW = 180, H = 320, CH = 256;

  var d_ = T.def;
  // posun vrstiev voči svetu (ďalej = pomalšie, ART_SPEC §6); vlastník je tento modul — svet stavia aj v Node
  d_('Podmorie', 'diveFarScroll', 0.25, 0.05, 1, 0.05, 'Paralaxa: vzdialené útesy (násobok posunu kamery)');
  d_('Podmorie', 'diveMidScroll', 0.55, 0.05, 1, 0.05, 'Paralaxa: stredné skaly (násobok posunu kamery)');
  d_('Podmorie', 'seaFarW', 96, 0, 140, 1, 'Vzdialené útesy: ako ďaleko od okraja siahajú v najširšom mieste (px)');
  d_('Podmorie', 'seaFarH', 150, 60, 240, 2, 'Vzdialené útesy: najvyšší kus skaly (px)');
  d_('Podmorie', 'seaMidW', 60, 0, 110, 1, 'Stredné skaly: ako ďaleko od okraja siahajú v najširšom mieste (px)');
  d_('Podmorie', 'seaMidH', 96, 30, 200, 2, 'Stredné skaly: najvyšší kus (px)');
  d_('Podmorie', 'seaMidAlt', 300, 60, 1000, 10, 'Stredné skaly: po koľkých m (menovitých) sa strany vystriedajú');
  d_('Podmorie', 'seaWallW', 36, 0, 80, 1, 'Blízke steny: ako ďaleko od okraja siahajú v najširšom mieste (px)');
  d_('Podmorie', 'seaWallH', 72, 20, 160, 2, 'Blízke steny: najvyšší kus skaly (px)');
  d_('Podmorie', 'seaWallAlt', 130, 30, 600, 5, 'Blízke steny: po koľkých m sa strany vystriedajú (skala vľavo ↔ vpravo)');
  d_('Podmorie', 'seaDeepWiden', 0.45, 0, 1.5, 0.05, 'Blízke steny v Polnoci a Priepasti: o koľko sú širšie (podiel; priekopa sa zužuje)');
  d_('Podmorie', 'seaDecor', 1, 0, 2, 0.1, 'Rastliny a koraly na skalách: hustota (násobok)');
  d_('Podmorie', 'seaKelp', 1, 0, 2, 0.1, 'Chaluhový les a koraly v strednej vrstve (Plytčina, Útesy): hustota (násobok)');
  d_('Podmorie', 'seaSchools', 3, 0, 8, 1, 'Vzdialené kŕdle drobných rýb (Plytčina až Súmrak): koľko na výšku obrazovky');
  d_('Podmorie', 'seaSchoolSize', 9, 3, 20, 1, 'Vzdialené kŕdle: rýb v kŕdli');
  d_('Podmorie', 'seaLampLit', 2, 0, 4, 1, 'Svetlo háčika vráti blízkej stene X stupňov farby (0 = v tme ostane tmavá)');
  d_('Podmorie', 'seaLandmarks', 1, 0, 1, 1, 'Orientačné body (loďka, oblúk, vrak, kostra, ruiny, komíny): 1 = áno');
  // Denná farba vody (poloha na rampe mora 1 modrá, 2 tmavomodrá, 3 navy, 4 atrament) — identita pásiem (kritik
  // kolo 1, K6: od 262 m po 2 205 m bola voda tá istá navy). Súmrak tmavomodrý, Polnoc navy, Priepasť čierna.
  // Prechody (pásy dvoch farieb) ležia v stredoch pásiem: Útesy modrá → tmavomodrá, Súmrak tmavomodrá → navy. Plytčina
  // tmavne už od 30 m — kolo 2: Plytčina bola 195 riadkov jednej plochej sýtej modrej bez prechodu (K2 = 5).
  d_('Podmorie', 'seaQ60', 1.3, 1, 2, 0.05, 'Voda v 60 m (koniec Plytčiny): poloha na rampe (1 modrá … 3 navy)');
  d_('Podmorie', 'seaQ120', 1.5, 1, 2.5, 0.05, 'Voda v 120 m (stred Útesov): poloha na rampe');
  d_('Podmorie', 'seaQ200', 1.9, 1, 3, 0.05, 'Voda v 200 m (koniec Útesov): poloha na rampe');
  d_('Podmorie', 'seaQ300', 2.2, 1.5, 3, 0.05, 'Voda v 300 m (Súmrak): poloha na rampe');
  d_('Podmorie', 'seaQ420', 2.5, 1.5, 3, 0.05, 'Voda v 420 m (stred Súmraku): poloha na rampe');
  d_('Podmorie', 'seaQ560', 3.0, 2, 3, 0.05, 'Voda v 560 m (koniec Súmraku): poloha na rampe');
  d_('Podmorie', 'seaInkFromM', 1500, 600, 3000, 50, 'Voda začne prechádzať do čiernej (m) — Priepasť');
  d_('Podmorie', 'seaInkFullM', 1650, 650, 3200, 50, 'Voda je celá čierna od (m)');

  var NAMES = P.names, IX = {};
  for (var ni = 0; ni < NAMES.length; ni++) IX[NAMES[ni]] = ni + 1;
  var C = IX;

  // LUT[k][index] = 0xRRGGBB farby po k stupňoch tmy (HL.pal.darker — vždy farba z palety).
  var LUT = [];
  function lut(k) {
    if (LUT[k]) return LUT[k];
    var a = new Int32Array(NAMES.length + 1);
    for (var i = 0; i < NAMES.length; i++) a[i + 1] = parseInt(P.darker(NAMES[i], k).slice(1), 16);
    return (LUT[k] = a);
  }
  // Hmla: skaly a rastliny sa zakalia ako voda (dive.js FOG_RAMP) — modrá rodina → sivomodrá. Kolo 3 (P7): v hmle
  // ostala štrbina medzi stenami v čistej tmavomodrej, keď všetka voda okolo bola sivá.
  var FOG_MAP = { cyan: 'greyLight', blue: 'grey', blueDark: 'slate' };
  // LUT vrstvy: k stupňov tmy, potom výnimky vrstvy (remap[k]: meno pred stmavením → meno farby) a hmla.
  var LUTX = {};
  function lutFor(remap, k, fog) {
    var key = (remap ? remap.id : '-') + ':' + k + (fog ? 'f' : '');
    if (LUTX[key]) return LUTX[key];
    var a = new Int32Array(lut(k)), over = remap && remap[k];
    for (var i = 0; i < NAMES.length; i++) {
      var name = over && over[NAMES[i]] ? over[NAMES[i]] : P.darker(NAMES[i], k), nm = name.charAt(0) === '#' ? null : name;
      if (!nm) { for (var j = 0; j < NAMES.length; j++) if (P[NAMES[j]] === name) nm = NAMES[j]; }
      if (fog && FOG_MAP[nm]) nm = FOG_MAP[nm];
      a[i + 1] = parseInt(P[nm].slice(1), 16);
    }
    return (LUTX[key] = a);
  }
  // Vzdialené útesy pri k = 1 tealDark (jas 52,7 pod tmavomodrou vodou 69,5 — hodnota aj iný odtieň, diaľka do zelenkasta
  // ako vo vzore); pri k ≥ 2 zmiznú vo vode (navy na navy, atrament na atramente) — v tme diaľku nevidno.
  // Pri k ≥ 2 (navy a čierna voda) zmizne celá vrstva vrátane škár — kolo 4: v Polnoci ostali z nej len 1-px čiary
  // škár na vode („stena nakreslená farbou vody"). V tme diaľku nevidno.
  var FAR_REMAP = { id: 'far', 1: { slate: 'tealDark' }, 2: { slateDark: 'navy' }, 3: { slateDark: 'ink' } };

  // ------------------------------------------------------------------ šum (stály)
  function hv(i, salt) { return HL.hash(i | 0, salt | 0, 7919) / 4294967296; }
  function mod(a, n) { return ((a % n) + n) % n; }
  // Hladký 1D šum 0..1: hodnoty v mriežke s bunkou `cell`, kubické vyhladenie.
  function vn(y, cell, salt) {
    var f = y / cell, i = Math.floor(f), t = f - i, a = hv(i, salt), b = hv(i + 1, salt);
    t = t * t * (3 - 2 * t);
    return a + (b - a) * t;
  }
  function smooth01(a, b, v) { var t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); }

  // ------------------------------------------------------------------ denná farba vody podľa hĺbky
  // Svety: loc → definícia (more nižšie, jazero gfx/seascape_lake.js). Neznáme miesto = more.
  var WORLDS = {};
  function wdef(loc) { return (loc && WORLDS[loc]) || WORLDS.more; }
  function seaStops() {
    return [[0, 1], [30, 1], [60, T.seaQ60], [120, T.seaQ120], [200, T.seaQ200], [300, T.seaQ300], [420, T.seaQ420],
      [560, T.seaQ560], [T.seaInkFromM, T.seaQ560], [Math.max(T.seaInkFromM + 1, T.seaInkFullM), 4]];
  }
  function qDay(depth, loc) {
    var S = wdef(loc).qStops();
    if (!(depth > 0)) return S[0][1];
    for (var i = 1; i < S.length; i++) {
      if (depth < S[i][0]) return S[i - 1][1] + (S[i][1] - S[i - 1][1]) * (depth - S[i - 1][0]) / (S[i][0] - S[i - 1][0]);
    }
    return S[S.length - 1][1];
  }
  // Stupeň tmy, o ktorý je kus skaly v hĺbke depth tmavší ako jeho kresba (nakreslená pre dennú vodu pri hladine).
  function kOf(depth, loc) { return Math.max(0, Math.min(3, Math.round(qDay(depth, loc)) - 1)); }

  // ------------------------------------------------------------------ pásma a štýly stien
  function zoneId(depth, endless, loc) { return HL.world.zoneAt(depth, endless, loc).id; }
  // Tvar kusu: podiel šírky v pomernej výške t (0 = vrch, 1 = spodok).
  var SHAPES = [
    function (t) { return Math.sqrt(Math.max(0, 1 - Math.pow(2 * t - 1, 2))); },                             // 0 balvan
    function (t) { return t < 0.16 ? Math.sqrt(t / 0.16) : t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4 * 0.92; },      // 1 doska s previsom
    function (t) { return 0.3 + 0.7 * Math.pow(t, 0.55); },                                                    // 2 svah (širší dole)
    function (t) { return t < 0.12 ? 0.55 + 3.75 * t : t < 0.8 ? 1 - 0.25 * (t - 0.12) : 0.83 - (t - 0.8) * 3.9; }, // 3 stupeň
    function (t) { return t < 0.06 ? 0.7 + 5 * t : 1 - 0.08 * t; },                                            // 4 stĺp (čadič)
  ];
  // Štýl blízkej steny podľa pásma: tvary kusov, výška (podiel T.seaWallH), šírka (násobok) a farby pre
  // dennú vodu. top = osvetlený vrch kusu (riasy v Plytčine, koralový lem na Útesoch), rim = hrana do vody.
  var NEAR_STYLE = {
    plytcina: { kinds: [2, 2, 0, 3], h: [0.35, 0.8], w: 0.9, top: 'greenDark', top2: 'tealDark', body: 'navy', rim: 'slateDark', crack: 'ink', shadow: 'ink' },
    utesy: { kinds: [1, 3, 1, 0], h: [0.3, 0.75], w: 1.0, top: 'purple', top2: 'slateDark', body: 'navy', rim: 'slateDark', crack: 'ink', shadow: 'ink' },
    sumrak: { kinds: [1, 1, 3], h: [0.5, 1.2], w: 1.1, top: 'slate', top2: 'slateDark', body: 'navy', rim: 'slateDark', crack: 'ink', shadow: 'ink' },
    polnoc: { kinds: [4, 4, 1], h: [0.7, 1.6], w: 1.0, deep: true, top: 'slate', top2: 'slateDark', body: 'navy', rim: 'slate', crack: 'ink', shadow: 'ink' },
    // Priepasť je nakreslená SVETLO: pri čiernej vode (k = 3) sú to tmavomodré skaly so svetlejším vrchom na čiernej —
    // obrátené poradie hodnôt ako v Polnoci (čierne skaly na tmavomodrej vode), aby sa pásma nedali zameniť.
    priepast: { kinds: [4, 1, 0, 3], h: [0.5, 1.3], w: 1.0, deep: true, top: 'greyLight', top2: 'grey', body: 'grey', rim: 'slate', crack: 'slateDark', shadow: 'slateDark' },
  };
  NEAR_STYLE.nekonecna = NEAR_STYLE.priepast;
  var FAR_ST = { kinds: [0, 2, 3, 0], h: [0.33, 1], w: 1, top: 'slate', top2: 'slate', body: 'slate', rim: 'slate', crack: 'slateDark', shadow: 'slateDark' };
  var MID_ST = { kinds: [1, 2, 3, 1], h: [0.3, 1], w: 1, top: 'slate', top2: 'slate', body: 'blueDark', rim: 'slate', crack: 'navy', shadow: 'navy' };
  var MID_ST_DEEP = { kinds: [4, 1, 3], h: [0.5, 1], w: 1.15, top: 'slate', top2: 'slate', body: 'blueDark', rim: 'slate', crack: 'navy', shadow: 'navy' };

  // ------------------------------------------------------------------ vrstvy
  // Riadok vrstvy ly ↔ „menovitá hĺbka" = hĺbka, v ktorej je ten riadok v strede obrazovky (vrstva sa
  // posúva pomalšie než svet, takže ten istý kus je vidno cez väčší rozsah hĺbok).
  function nominal(L, ly) { return ((ly - H / 2) / L.rate + H / 2) / T.pxPerM; }
  function rowAt(L, depthM) { return (depthM * T.pxPerM - H / 2) * L.rate + H / 2; }

  // Kusy jednej strany v úseku [y0, y1): žiadny kus nepresiahne y1 (posledný sa skráti) — hranica úseku je
  // potom škára medzi kusmi, nie rez cez skalu (slučka Nekonečnej hlbiny nadväzuje bez švu).
  function pieces(L, side, y0, y1, cfg, salt) {
    var list = [], y = y0, j = Math.floor(y0 / 7) + 1;
    while (y < y1) {
      var st = cfg.style(nominal(L, y + 20));
      var h = Math.round(cfg.hMax * (st.h[0] + (st.h[1] - st.h[0]) * hv(j, salt + 1)));
      h = Math.max(8, Math.min(h, y1 - y));
      var e = smooth01(0.25, 0.75, vn(y + h / 2, cfg.alt * T.pxPerM * L.rate, cfg.envSalt));
      if (cfg.anti && side > 0) e = 1 - e;
      e = cfg.eMin + (1 - cfg.eMin) * e;
      var w = cfg.min + cfg.span * st.w * e * (1 - cfg.wVar + cfg.wVar * hv(j, salt + 2));
      var kind = st.kinds[Math.floor(hv(j, salt + 3) * st.kinds.length)];
      list.push({ y: y, h: h, w: w, shape: SHAPES[kind], st: st });
      y += Math.max(5, Math.min(h, Math.round(h * (0.45 + 0.3 * hv(j, salt + 4)))));
      j++;
    }
    return list;
  }

  // Vrstva: rozsah riadkov kariéry + slučka pre hĺbky pod ním (Nekonečná hlbina).
  function makeLayer(name, rate, cfg) {
    // posun aspoň 0,05: menovitá hĺbka delí posunom (uložená stará hodnota 0 by dala nekonečno)
    var L = { name: name, rate: Math.max(0.05, rate), cfg: cfg, wd: cfg.wd, chunks: {}, cans: {}, nCan: 0, objects: [] };
    var FLOOR = cfg.wd.floor();
    var floorRow = FLOOR * T.pxPerM;
    L.extent = Math.ceil((rowAt(L, FLOOR) + H + 2 * CH) / CH) * CH;
    // slučka: štyri kúsky Priepasti (pri blízkej stene ešte pred dnom — dno sa nikdy neopakuje)
    var loopEnd = Math.floor((name === 'near' ? floorRow - 2 * CH : rowAt(L, FLOOR - 120)) / CH) * CH;
    L.loop1 = Math.max(4 * CH, loopEnd);
    L.loop0 = L.loop1 - 4 * CH;
    L.sides = [-1, 1].map(function (side, s) {
      var salt = cfg.salt + s * 50;
      return {
        side: side,
        a: pieces(L, side, -CH, L.loop0, cfg, salt),
        b: pieces(L, side, L.loop0, L.loop1, cfg, salt + 7),
        c: pieces(L, side, L.loop1, L.extent, cfg, salt + 13),
      };
    });
    return L;
  }

  // Namaľuje kusy jednej strany do bufra riadkov [r0, r0 + n) (riadky vrstvy; riadok bufra 0 = r0). Každý kus
  // dostane do kmap svoj stupeň tmy podľa (menovitej) hĺbky stredu — prechod farby je na škáre medzi kusmi, nie
  // pruhmi cez skalu (kritik kolo 1, P7: pruhy prechodu išli naprieč skalami aj riasami).
  function paintPieces(buf, kmap, r0, n, list, side, shift, L) {
    // binárne nájdi prvý kus, ktorý môže zasahovať do r0 (kusy sú zoradené podľa y, výška ≤ 2·CH)
    var lo = 0, hi = list.length;
    while (lo < hi) { var m = (lo + hi) >> 1; if (list[m].y + shift + 2 * CH < r0) lo = m + 1; else hi = m; }
    for (var b = lo; b < list.length; b++) {
      var B = list[b], by = B.y + shift;
      if (by >= r0 + n) break;
      if (by + B.h <= r0) continue;
      var st = B.st, top = C[st.top], top2 = C[st.top2], body = C[st.body], rim = C[st.rim], crack = C[st.crack], shadow = C[st.shadow];
      // široký kus = väčšie vlnenie hrany (kritik kolo 1: rovná hrana ako podľa pravítka, 60 px)
      var ws = st.wob == null ? 1 : st.wob;
      var prevW = 0, kp = kOf(nominal(L, by + B.h / 2), L.wd.loc), wob = (1.2 + 0.05 * B.w) * ws;
      for (var r = 0; r < B.h; r++) {
        var ly = by + r;
        var wr = Math.max(0, Math.round(B.w * B.shape((r + 0.5) / B.h) + wob * (2 * vn(ly, 9, 31 + side) - 1) + 0.8 * ws * (2 * vn(ly, 3, 47 + side) - 1)));
        var wn = r + 1 < B.h ? Math.round(B.w * B.shape((r + 1.5) / B.h)) : 0;
        var row = ly - r0;
        if (row >= 0 && row < n) {
          for (var i = 0; i < wr && i < PW; i++) {
            var jag = st.flat ? 0 : Math.floor(2.99 * vn(i + B.y * 0.37, 4, 59 + side));  // zubatý vrch: 0–2 riadky podľa stĺpca
            if (r < jag) continue;
            var x = side < 0 ? i : PW - 1 - i, o = row * PW + x, was = buf[o], c;
            if (r === jag || i >= prevW) c = was ? crack : top;            // vrch: pod iným kusom škára, inak svetlo zhora
            else if (i === wr - 1) c = rim;                                  // hrana do vody
            else if (i >= wn) c = shadow;                                    // spodok previsu
            else if (r === jag + 1 && i >= prevW - 1) c = top2;
            else c = body;
            buf[o] = c;
            kmap[o] = kp;
          }
        }
        prevW = wr;
      }
    }
  }

  // Sprite (index bitmapa z HL.spr) do bufra: x, ly = ľavý horný roh v riadkoch vrstvy, kp = stupeň tmy.
  // Pixel s prázdnou farbou, ale nastavenou svietiacou vrstvou (b.g) je VÝREZ: zmaže skalu pod sebou — cez
  // otvor oblúka je vidno vodu, nie kusy skaly za ním (kritik kolo 1: oblúk nebolo v zábere spoznať).
  function paintSprite(buf, kmap, r0, n, name, x, ly, flip, kp) {
    var b = HL.spr.bitmap(name, 0);
    if (!b) return;
    for (var j = 0; j < b.h; j++) {
      var row = ly + j - r0;
      if (row < 0 || row >= n) continue;
      for (var i = 0; i < b.w; i++) {
        var q = j * b.w + i, v = b.d[q], xx = x + (flip ? b.w - 1 - i : i);
        if (xx < 0 || xx >= PW) continue;
        if (v) { buf[row * PW + xx] = v; kmap[row * PW + xx] = kp; }
        else if (b.g[q]) buf[row * PW + xx] = 0;
      }
    }
  }

  // Dno mora (blízka vrstva, kariéra): nerovný vrch s osvetleným lemom a vodorovné vrstvy usadenín. Žiadne
  // zrnká: v1 ich mala 4 % a v tme vyzerali ako hviezdna obloha (šum, K11).
  function floorTop(x) {
    var fr = HL.data.SEA_FLOOR * T.pxPerM;
    return Math.round(fr - 6 + 7 * vn(x, 23, 2101) + 5 * vn(x, 7, 2102) - 10 * Math.max(0, Math.sin((x - 20) / 160 * Math.PI)) * vn(x, 60, 2103));
  }
  // Kamene na dne: oblé, vrch svetlejší, spodok tmavý (tvar, nie zrnká — kolo 0: 4 % zrniek vyzeralo ako hviezdy).
  var FLOOR_STONES = [[14, 3, 5, 3], [38, 6, 3, 2], [61, 2, 7, 4], [96, 5, 4, 3], [122, 3, 6, 3], [151, 7, 3, 2], [170, 2, 5, 3]];
  function paintStones(buf, kmap, r0, n, kp) {
    for (var i = 0; i < FLOOR_STONES.length; i++) {
      var st = FLOOR_STONES[i], cx = st[0], rx = st[2], ry = st[3], top = floorTop(cx), cy = top + st[1];
      HL.spr.shape.ell(cx, cy, rx, ry, function (x, y) {
        if (x < 0 || x >= PW || y < r0 || y >= r0 + n) return;
        var dy = y + 0.5 - cy, o = (y - r0) * PW + x;
        buf[o] = dy < -ry + 1.3 ? C.grey : dy > ry - 1.5 ? C.navy : C.slate;
        kmap[o] = kp;
      });
    }
  }
  function paintFloor(buf, kmap, r0, n) {
    var fr = HL.data.SEA_FLOOR * T.pxPerM, kp = kOf(HL.data.SEA_FLOOR);
    if (r0 + n <= fr - 24) return;
    for (var x = 0; x < PW; x++) {
      var top = floorTop(x);
      for (var ly = Math.max(top, r0); ly < r0 + n; ly++) {
        var d = ly - top, c;
        if (d === 0) c = C.grey;
        else if (d === 1) c = C.slate;
        else if (d > 4 && mod(ly - fr + Math.round(4 * vn(x, 23, 2104)), 11) === 0 && vn(x + ly * 3, 9, 2106) > 0.55) c = C.navy;   // krátke vrstvy
        else c = C.slateDark;
        buf[(ly - r0) * PW + x] = c;
        kmap[(ly - r0) * PW + x] = kp;
      }
    }
    paintStones(buf, kmap, r0, n, kp);
  }

  // Kúsok vrstvy ci: index farieb (CH riadkov) + plochy na vrchu skál (kotvy rastlín). Raz, potom z pamäte.
  function chunkData(L, ci) {
    var e = L.chunks[ci];
    if (e) return e;
    var r0 = ci * CH - 1, n = CH + 1, buf = new Uint8Array(n * PW), kmap = new Uint8Array(n * PW);   // +1 riadok nad kúskom pre kotvy
    // úseky a | b (slučka Nekonečnej) | c: žiadny kus nepresahuje hranicu úseku, takže opakovanie b za loop1
    // nadväzuje škárou medzi kusmi, nie rezom cez skalu
    for (var s = 0; s < 2; s++) {
      var S = L.sides[s];
      paintPieces(buf, kmap, r0, n, S.a, S.side, 0, L);
      paintPieces(buf, kmap, r0, n, S.b, S.side, 0, L);
      paintPieces(buf, kmap, r0, n, S.c, S.side, 0, L);
    }
    if (T.seaLandmarks >= 1) {
      for (var k = 0; k < L.objects.length; k++) {
        var O = L.objects[k];
        if (O.ly + O.h > r0 && O.ly < r0 + n) paintSprite(buf, kmap, r0, n, O.name, O.x, O.ly, O.flip, kOf(O.depth, L.wd.loc));
      }
    }
    if (L.name === 'near' && L.wd.paintFloor) L.wd.paintFloor(buf, kmap, r0, n, L);
    // kotvy: súvislé úseky ≥ 3 px skaly, nad ktorými je voda
    var anchors = [];
    for (var row = 1; row < n; row++) {
      var run0 = -1;
      for (var x = 0; x <= PW; x++) {
        var top = x < PW && buf[row * PW + x] && !buf[(row - 1) * PW + x];
        if (top && run0 < 0) run0 = x;
        if (!top && run0 >= 0) {
          if (x - run0 >= 3) anchors.push({ ly: r0 + row, x0: run0, x1: x });
          run0 = -1;
        }
      }
    }
    e = L.chunks[ci] = { buf: buf.subarray(PW), kmap: kmap.subarray(PW), anchors: anchors };
    return e;
  }
  var tick = 0;
  function chunkCanvas(L, ci, dk, fog) {
    var key = ci + ':' + dk + (fog ? 'f' : ''), e = L.cans[key];
    if (e) { e.used = ++tick; return e.c; }
    var cv = HL.draw.canvas(PW, CH);
    if (!cv) return null;
    var data = chunkData(L, ci), x = cv.getContext('2d'), img = x.createImageData(PW, CH), px = img.data, buf = data.buf, km = data.kmap;
    var rm = L.cfg.remap, lts = [lutFor(rm, 0, fog), lutFor(rm, 1, fog), lutFor(rm, 2, fog), lutFor(rm, 3, fog), lutFor(rm, 4, fog)];
    for (var i = 0, n = PW * CH; i < n; i++) {
      var v = buf[i];
      if (!v) continue;
      var rgb = lts[Math.max(0, Math.min(4, km[i] + dk))][v], o = i * 4;
      px[o] = rgb >> 16; px[o + 1] = (rgb >> 8) & 255; px[o + 2] = rgb & 255; px[o + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    L.cans[key] = { c: cv, used: ++tick };
    if (++L.nCan > 14) {
      var oldK = null, oldT = Infinity;
      for (var kk in L.cans) if (L.cans[kk].used < oldT) { oldT = L.cans[kk].used; oldK = kk; }
      if (oldK) { delete L.cans[oldK]; L.nCan--; }
    }
    return cv;
  }
  // Riadok vrstvy → riadok v bufri (−1 = nič): nad hladinou nič, pod rozsahom kariéry slučka (Nekonečná).
  function mapRow(L, ty, endless) {
    if (ty < 0) return -1;
    if (endless && ty >= L.loop1) return L.loop0 + mod(ty - L.loop0, L.loop1 - L.loop0);
    return ty < L.extent ? ty : -1;
  }
  // Vrstva v riadkoch obrazovky [y0, y1), dk = posun tmy pre celý snímok (noc, búrka, svetlo háčika).
  function drawLayer(ctx, L, off, y0, y1, dk, endless, fog) {
    for (var y = y0; y < y1;) {
      var ty = mapRow(L, y + off, endless);
      if (ty < 0) { y++; continue; }
      var ci = Math.floor(ty / CH), cy = ty - ci * CH, len = Math.min(y1 - y, CH - cy);
      var img = chunkCanvas(L, ci, dk, fog);
      if (img) ctx.drawImage(img, 0, cy, PW, len, 0, y, PW, len);
      y += len;
    }
  }

  // ------------------------------------------------------------------ stavba sveta
  // Orientačné body (K10 rubriky): spodok spritu v hĺbke `depth` (m; v strednej vrstve menovitej), x od
  // okraja strany. Každý dáva zmysel svojmu pásmu.
  var LANDMARKS = [
    { id: 'boat', name: 'lm_boat', layer: 'near', depth: 37, side: -1, x: 0 },
    { id: 'arch', name: 'lm_arch', layer: 'mid', depth: 128, side: 1, x: 0 },
    { id: 'wreck', name: 'lm_wreck', layer: 'mid', depth: 290, side: -1, x: 16 },
    { id: 'whale', name: 'lm_whale', layer: 'near', depth: 1010, side: 1, x: 0 },
    { id: 'ruins', name: 'lm_ruins', layer: 'near', depth: 2230, side: -1, x: 0 },
    { id: 'vents', name: 'lm_vents', layer: 'near', depth: 2997, side: 1, x: 18 },
  ];
  var Wc = {}, sigc = {};
  function signature() {
    return [T.pxPerM, T.diveFarScroll, T.diveMidScroll, T.seaFarW, T.seaFarH, T.seaMidW, T.seaMidH, T.seaMidAlt,
      T.seaWallW, T.seaWallH, T.seaWallAlt, T.seaDeepWiden, T.seaLandmarks].join(',');
  }
  // Blízka stena podľa pásma: štýl pásma, v hlbokých pásmach (deep) širšia o T.seaDeepWiden.
  function nearStyleOf(table, zid, fallback) {
    var st = table[zid] || fallback;
    if (!st.deep) return st;
    var o = {}; for (var k in st) o[k] = st[k];
    o.w = st.w * (1 + T.seaDeepWiden);
    return o;
  }
  function world(loc) {
    var wd = wdef(loc), s = signature() + '|' + (wd.sig ? wd.sig() : '');
    if (Wc[wd.loc] && sigc[wd.loc] === s) return Wc[wd.loc];
    sigc[wd.loc] = s;
    var far = makeLayer('far', T.diveFarScroll, wd.cfg('far'));
    var mid = makeLayer('mid', T.diveMidScroll, wd.cfg('mid'));
    var near = makeLayer('near', 1, wd.cfg('near'));
    wd.landmarks.forEach(function (lm) {
      var L = lm.layer === 'mid' ? mid : near, b = HL.spr.bitmap(lm.name, 0);
      if (!b) return;
      var ly = Math.round(lm.layer === 'mid' ? rowAt(L, lm.depth) : lm.depth * T.pxPerM) - b.h;
      var x = lm.center ? Math.round((PW - b.w) / 2) : lm.side < 0 ? lm.x : PW - lm.x - b.w;
      L.objects.push({ name: lm.name, x: x, ly: ly, h: b.h, flip: !lm.center && lm.side > 0, depth: lm.depth, id: lm.id });
    });
    return (Wc[wd.loc] = { far: far, mid: mid, near: near, wd: wd });
  }

  // ------------------------------------------------------------------ sprity po úsekoch tmy (rastliny)
  var spCache = {}, spN = 0;
  function spriteK(name, f, k, flip, fog) {
    var key = name + '#' + f + '#' + k + (flip ? 'f' : '') + (fog ? 'h' : '');
    var c = spCache[key];
    if (c) return c;
    var b = HL.spr.bitmap(name, f);
    if (!b) return null;
    c = HL.draw.canvas(b.w, b.h);
    if (!c) return null;
    var x = c.getContext('2d'), img = x.createImageData(b.w, b.h), px = img.data, lt = lutFor(null, k, fog);
    for (var yy = 0; yy < b.h; yy++) {
      for (var xx = 0; xx < b.w; xx++) {
        var v = b.d[yy * b.w + xx];
        if (!v) continue;
        var o = (yy * b.w + (flip ? b.w - 1 - xx : xx)) * 4, rgb = lt[v];
        px[o] = rgb >> 16; px[o + 1] = (rgb >> 8) & 255; px[o + 2] = rgb & 255; px[o + 3] = 255;
      }
    }
    x.putImageData(img, 0, 0);
    if (++spN > 400) { spCache = {}; spN = 1; }
    return (spCache[key] = c);
  }
  // Sprite stmavený o k stupňov (rastlina má stupeň svojej hĺbky ako skala, na ktorej rastie).
  function blit(ctx, name, f, x, y, k, flip, fog) {
    var b = HL.spr.bitmap(name, f);
    if (!b) return false;
    x = Math.round(x); y = Math.round(y);
    if (y + b.h <= 0 || y >= H || x + b.w <= 0 || x >= PW) return false;
    var img = spriteK(name, f, Math.max(0, Math.min(4, k)), flip, fog);
    if (img) ctx.drawImage(img, x, y);
    return !!img;
  }

  // ------------------------------------------------------------------ rastliny na skalách
  // Čo rastie v ktorom pásme (dizajn 7.1): Plytčina chaluhy a tráva, Útesy koraly a vejáre, Súmrak riedke
  // biče a sklené huby, Polnoc ľalie, Priepasť rúrkovce. p = pravdepodobnosť na jedno miesto.
  var FLORA = {
    plytcina: { p: 0.8, list: ['sea_weed', 'sea_tuft', 'sea_kelp', 'sea_grass'] },
    utesy: { p: 0.85, list: ['sea_fan', 'sea_tubes', 'sea_brain', 'sea_tuft'] },
    sumrak: { p: 0.45, list: ['sea_whip', 'sea_sponge'] },
    polnoc: { p: 0.35, list: ['sea_lily', 'sea_whip'] },
    priepast: { p: 0.4, list: ['sea_worms', 'sea_lily'] },
    nekonecna: { p: 0.25, list: ['sea_worms'] },
  };
  var MID_FLORA = {
    plytcina: { p: 0.7, list: ['sea_kelpwall', 'sea_kelpstand'] },
    utesy: { p: 0.6, list: ['sea_coralhead', 'sea_kelpstand'] },
  };
  // Ktorá rastlina stojí na q-tom mieste jednej kotvy: susedné miesta berú zo zoznamu postupne (nikdy dve rovnaké
  // vedľa seba — kolo 4, P5), začiatok podľa kotvy.
  function plantAt(list, anchorSeed, q) { return list[(Math.floor(hv(anchorSeed, 1602) * list.length) + q) % list.length]; }
  // Poradie OSADENÝCH miest na každej strane v kúsku (svet s pickFlora — jazero): čisto podľa kotiev a hustoty, nie podľa
  // kamery, takže sa sprity pri posúvaní nemenia; uloží sa na kúsok. -1 = miesto bez rastliny.
  function floraPlan(L, ci, data, table, density, depthOf, shift, endless) {
    var key = 'plan:' + density + ':' + shift;
    if (data[key]) return data[key];
    var rank = { '-1': ci, '1': ci }, plan = [];
    for (var a = 0; a < data.anchors.length; a++) {
      var A = data.anchors[a], dep = depthOf(A.ly + shift), row = [];
      var fl = dep >= 2 ? table[zoneId(dep, endless, L.wd.loc)] : null;
      var len = A.x1 - A.x0, n = Math.max(1, Math.floor(len / 16));
      for (var q = 0; q < n; q++) {
        var side = A.x0 + (q + 0.5) * len / n > PW / 2 ? 1 : -1;
        row.push(fl && !(hv(A.ly * 7 + A.x0 * 131 + q * 17, 1601) > fl.p * density) ? rank[side]++ : -1);
      }
      plan.push(row);
    }
    return (data[key] = plan);
  }
  // Rastliny na kotvách viditeľných kúskov vrstvy. Na dlhej ploche (rímsa, dno) každých ~16 px jedna.
  function drawFlora(ctx, v, L, off, dk, table, density, depthOf, info, key) {
    var c0 = Math.floor((off - 90) / CH), c1 = Math.floor((off + H + 90) / CH);
    for (var cc = c0; cc <= c1; cc++) {
      var vy0 = cc * CH, ty0 = mapRow(L, vy0, v.endless);
      if (ty0 < 0) continue;
      var ci = Math.floor(ty0 / CH), data = chunkData(L, ci), shift = vy0 - ci * CH;
      var plan = L.wd.pickFlora ? floraPlan(L, ci, data, table, density, depthOf, shift, v.endless) : null;
      for (var a = 0; a < data.anchors.length; a++) {
        var A = data.anchors[a], ly = A.ly + shift, y = ly - off;
        if (y < -10 || y > H + 90) continue;
        var dep = depthOf(ly);
        if (dep < 2) continue;
        var fl = table[zoneId(dep, v.endless, L.wd.loc)];
        if (!fl) continue;
        var len = A.x1 - A.x0, n = Math.max(1, Math.floor(len / 16));
        for (var q = 0; q < n; q++) {
          var seed = A.ly * 7 + A.x0 * 131 + q * 17;
          if (hv(seed, 1601) > fl.p * density) continue;
          // svet môže vyberať po svojom (jazero: striedanie podľa výšky a strany — P5); more = plantAt ako doteraz
          var name = plan ? L.wd.pickFlora(fl.list, A, q, plan[a][q]) : plantAt(fl.list, A.ly * 7 + A.x0 * 131, q), b = HL.spr.bitmap(name, 0);
          if (!b) continue;
          var cx = A.x0 + (q + 0.5) * len / n, flip = cx > PW / 2;
          var fr = HL.spr.frames(name) > 1 ? Math.floor(v.t * 1.1 + hv(seed, 1603) * 4) % 2 : 0;
          if (blit(ctx, name, fr, Math.round(cx - b.w / 2), y - b.h + 1, kOf(dep, L.wd.loc) + dk, flip, v.fog)) {
            info[key]++;
            if (info.placed) info.placed.push({ name: name, x: Math.round(cx), y: y, side: cx > PW / 2 ? 1 : -1, layer: key });   // sondy (v.collect)
          }
        }
      }
    }
  }

  // ------------------------------------------------------------------ vzdialené kŕdle
  // Drobné rybky (3 × 1 px) v kŕdli vo vzdialenej vrstve: o stupeň tmavšie ako voda za nimi, bez obrysu, pomaly
  // plávajú a vlnia sa — život v diaľke, ktorý sa nedá zameniť s rybami hry (tie majú obrys, oči a 16+ px).
  // Len Plytčina až Súmrak (menovitá hĺbka): hlbšie je tma a život sú svietiace siluety (dive.js drawFarLife).
  function drawSchools(ctx, v, w, info) {
    var n = Math.round(T.seaSchools);
    if (!(n > 0)) return;
    var L = w.far, off = v.cam * L.rate, period = H + 160, size = Math.round(T.seaSchoolSize);
    for (var k = Math.floor((off - 80) / period * n) - 1, kEnd = Math.ceil((off + H + 80) / period * n) + 1; k <= kEnd; k++) {
      var ly = k * period / n + hv(k, 1801) * 70, y0 = Math.round(ly - off);
      if (y0 < v.y0 - 20 || y0 > H + 20) continue;
      var dep = nominal(L, ly);
      if (dep < 4 || dep > 560 || hv(k, 1802) > 0.8) continue;
      var dir = hv(k, 1803) < 0.5 ? -1 : 1, span = PW + 120, sp = 4 + hv(k, 1804) * 5;
      var cx = ((hv(k, 1805) * span + dir * v.t * sp) % span + span) % span - 60;
      var col = P.darker(P[RAMP_K[Math.max(0, Math.min(3, kOf(dep) + v.dk))]], 1);
      var colName = NAMES.filter(function (n) { return P[n] === col; })[0];
      if (v.fog && FOG_MAP[colName]) col = P[FOG_MAP[colName]];
      ctx.fillStyle = col;
      for (var f = 0; f < size; f++) {
        var fx = Math.round(cx + (hv(f, k * 31 + 1806) - 0.5) * 26 + Math.sin(v.t * 1.3 + f) * 2);
        var fy = Math.round(y0 + (hv(f, k * 31 + 1807) - 0.5) * 12 + Math.sin(v.t * 0.9 + f * 1.7) * 1.5);
        if (fy < v.y0 || fy >= H || fx < -3 || fx >= PW) continue;
        ctx.fillRect(dir > 0 ? fx : fx - 1, fy, 3, 1);
        ctx.fillRect(dir > 0 ? fx + 2 : fx - 1, fy - 1, 1, 1);   // hlava trochu vyššie — tvar rybky, nie čiarka
      }
      info.schools++;
    }
  }
  // farba vody pri danom stupni podmoria (k = 0 → modrá): kŕdeľ je o stupeň tmavší ako voda
  var RAMP_K = ['blue', 'blueDark', 'navy', 'ink'];

  // ------------------------------------------------------------------ verejné API
  // v = { cam (px sveta na vrchu obrazovky), y0 (prvý riadok pod hladinou), dk (posun tmy celého snímku: noc,
  //       búrka — dive.js seaDk), t (s), endless (bool) }. Kusy majú vlastný stupeň tmy podľa hĺbky (kmap).
  // drawBack = vzdialené útesy, stredné skaly s chaluhami, oblúk a vrak; drawNear = blízke steny, rastliny,
  // loďka, kostra, ruiny a dno. Medzi nimi dive.js kreslí svetlo háčika a slnečné lúče (svetlo je PRED
  // diaľkou, ale ZA blízkou stenou — stenu v ňom ukáže drawLit). Vrátia štruktúru za pixelmi pre sondu.
  function visibleLandmarks(L, off, info) {
    for (var i = 0; i < L.objects.length; i++) {
      var O = L.objects[i], y = O.ly - off;
      if (y + O.h > 0 && y < H && info.landmarks.indexOf(O.id) < 0) info.landmarks.push(O.id);
    }
  }
  function drawBack(ctx, v) {
    var w = world(v.loc), wd = w.wd, info = { flora: 0, kelp: 0, schools: 0, dk: v.dk, landmarks: [], lit: false, loc: wd.loc, placed: v.collect ? [] : null };
    var offF = Math.round(v.cam * w.far.rate), offM = Math.round(v.cam * w.mid.rate);
    drawLayer(ctx, w.far, offF, v.y0, H, v.dk, v.endless, v.fog);
    if (!v.endless && wd.schools) drawSchools(ctx, v, w, info);
    drawLayer(ctx, w.mid, offM, v.y0, H, v.dk, v.endless, v.fog);
    drawFlora(ctx, v, w.mid, offM, v.dk, wd.midFlora, T.seaKelp, function (ly) { return nominal(w.mid, ly); }, info, 'kelp');
    if (T.seaLandmarks >= 1 && !v.endless) visibleLandmarks(w.mid, offM, info);
    return info;
  }
  // y0/y1/dk voliteľne: drawLit kreslí len riadky svetla a o stupne svetlejšie
  function drawNear(ctx, v, info, y0, y1, dk) {
    var w = world(v.loc), off = Math.round(v.cam);
    info = info || { flora: 0, kelp: 0, landmarks: [] };
    if (y0 == null) { y0 = v.y0; y1 = H; dk = v.dk; }
    drawLayer(ctx, w.near, off, y0, y1, dk, v.endless, v.fog);
    drawFlora(ctx, v, w.near, off, dk, w.wd.flora, T.seaDecor, function (ly) { return ly / T.pxPerM; }, info, 'flora');
    if (T.seaLandmarks >= 1 && !v.endless && info.landmarks) visibleLandmarks(w.near, off, info);
    return info;
  }

  // Blízka stena v kuželi svetla háčika: tie isté riadky o T.seaLampLit stupňov svetlejšie, orezané maskou
  // kotúča svetla (lamp.mask = plátno kotúča s ditherovaným okrajom z dive.js, mx/my = jeho ľavý horný roh).
  var lit = { c: null, x: null };
  function drawLit(ctx, v, lamp) {
    var up = Math.round(lamp && lamp.up != null ? lamp.up : T.seaLampLit);   // lamp.up: iné svetlo (jadro jazera)
    if (!(up > 0) || !lamp || !lamp.mask) return false;
    var mw = lamp.mask.width, mh = lamp.mask.height, y0 = Math.max(v.y0, lamp.my), y1 = Math.min(H, lamp.my + mh);
    if (y1 <= y0) return false;
    if (!lit.c) { lit.c = HL.draw.canvas(PW, H); if (!lit.c) return false; lit.x = lit.c.getContext('2d'); }
    var b = lit.x;
    b.globalCompositeOperation = 'source-over';
    b.clearRect(0, 0, PW, H);
    drawNear(b, v, { flora: 0, kelp: 0 }, y0, y1, v.dk - up);
    b.globalCompositeOperation = 'destination-in';
    b.drawImage(lamp.mask, lamp.mx, lamp.my);
    // destination-in mimo obdĺžnika masky (niektoré prehliadače ho nechajú) — zmaž ručne
    b.globalCompositeOperation = 'source-over';
    if (lamp.my > 0) b.clearRect(0, 0, PW, lamp.my);
    if (lamp.my + mh < H) b.clearRect(0, lamp.my + mh, PW, H - lamp.my - mh);
    if (lamp.mx > 0) b.clearRect(0, 0, lamp.mx, H);
    if (lamp.mx + mw < PW) b.clearRect(lamp.mx + mw, 0, PW - lamp.mx - mw, H);
    if (lamp.clipY != null && lamp.clipY < H) b.clearRect(0, Math.max(0, lamp.clipY), PW, H - Math.max(0, lamp.clipY));   // svetlo nejde pod clipY
    ctx.drawImage(lit.c, 0, y0, PW, y1 - y0, 0, y0, PW, y1 - y0);
    return true;
  }

  // ------------------------------------------------------------------ sprity (kind 'sea')
  var def = HL.spr.def, ell = HL.spr.shape.ell, poly = HL.spr.shape.poly;
  function nz(x, y, salt) { return HL.spr.noise(x, y, salt); }

  // ---- rastliny na skalách
  // Vysoká chaluha: stonka s listami striedavo vľavo a vpravo, kýve sa vrcholom.
  def('sea_kelp', 11, 44, 2, function (b, f) {
    function sx(y) { return 5 + Math.sin(y * 0.15 + f * 1.2) * 1.8 * (1 - y / 44); }
    for (var y = 2; y <= 43; y++) { b.px(sx(y), y, 'green'); if (y > 30) b.px(sx(y) + 1, y, 'greenDark'); }
    for (var k = 0; k < 7; k++) {
      var ly = 5 + k * 5.2, side = k % 2 ? 1 : -1, x0 = sx(ly);
      ell(x0 + side * 2.6, ly, 2.6, 1.1, function (x, yy) { b.px(x, yy, yy < ly ? 'green' : 'greenDark'); });
    }
    b.px(sx(2), 1, 'greenLight'); b.px(sx(2), 2, 'greenLight');
    b.outline('tealDark');
  }, 'sea');
  // Riasa (Plytčina): stonka s listami striedavo vľavo a vpravo — ako pôvodná seaweed_a, ale listy zelené / tmavozelené;
  // svetlozelená len na špičke (ART_SPEC §3: plochy svetlozelenej = „ťukaj teraz"; kolo 2, P8).
  def('sea_weed', 12, 32, 2, function (b, f) {
    function sx(y) { return 6 + Math.sin(y * 0.22 + f * 1.3) * 1.6 * (1 - y / 32); }
    for (var y = 1; y <= 31; y++) b.px(sx(y), y, 'green');
    for (var k = 0; k < 6; k++) {
      var ly = 4 + k * 4.6, side = k % 2 ? 1 : -1, x0 = sx(ly);
      ell(x0 + side * 2.3, ly, 2.4, 1.2, function (x, yy) { b.px(x, yy, yy < ly ? 'green' : 'greenDark'); });
    }
    b.px(sx(1), 0, 'greenLight');
    b.outline('tealDark');
  }, 'sea');
  // Trs morskej trávy (Plytčina, Útesy): listy z jedného miesta v zelenej a tmavozelenej (bez svetlozeleného listu).
  def('sea_tuft', 14, 22, 2, function (b, f) {
    [[-4, 14, 'green'], [-1, 20, 'green'], [2, 17, 'greenDark'], [4, 12, 'greenDark'], [-2, 10, 'greenDark']].forEach(function (bl, k) {
      for (var y = 0; y < bl[1]; y++) {
        var t = y / bl[1], x = 7 + bl[0] * t + Math.sin(t * 3 + f * 1.4 + k) * 1.2 * t;
        b.px(x, 21 - y, bl[2]);
        if (t < 0.5) b.px(x + 1, 21 - y, bl[2]);
      }
    });
    b.outline('tealDark');
  }, 'sea');
  // Morská tráva: nízky hustý trs.
  def('sea_grass', 16, 12, 2, function (b, f) {
    for (var k = 0; k < 8; k++) {
      var x0 = 2 + k * 1.6, h = 6 + Math.round(5 * nz(k, 3, 1801)), lean = (k - 4) * 0.25;
      for (var y = 0; y < h; y++) {
        var t = y / h, x = x0 + lean * y * 0.6 + Math.sin(t * 2.5 + f * 1.3 + k) * 0.8 * t;
        b.px(x, 11 - y, k % 3 === 0 ? 'greenDark' : 'green');
      }
    }
    b.outline('tealDark');
  }, 'sea');
  // Morský vejár (gorgónia): plný vejár (fialový), svetlejší lem a niekoľko tmavších žiliek z kmeňa — nie mriežka
  // jednotlivých pixelov konárov (kritik kolo 1, K11: bodkované vejáre).
  def('sea_fan', 22, 19, 1, function (b) {
    for (var y = 0; y < 19; y++) for (var x = 0; x < 22; x++) {
      var dx = (x + 0.5 - 11) / 10.5, dy = (y + 0.5 - 18) / 16, r = Math.sqrt(dx * dx + dy * dy);
      var edge = 0.88 + 0.08 * Math.sin(Math.atan2(dy, dx) * 9);
      if (y < 17 && r <= edge) b.px(x, y, r > edge - 0.12 ? 'pinkPurple' : 'purple');
    }
    for (var k = 0; k < 5; k++) { var a = Math.PI * (0.18 + k * 0.16); b.line(11, 17, 11 + Math.cos(a) * 9, 17 - Math.sin(a) * 13, 'plum'); }
    b.rect(10, 16, 2, 3, 'plum');
  }, 'sea');
  // Rúrkovité huby: tri rúrky rôznej výšky, tmavý otvor navrchu (tlmene hnedé, nie oranžové).
  def('sea_tubes', 13, 15, 1, function (b) {
    [[1, 9, 'woodLight'], [5, 13, 'wood'], [9, 7, 'woodLight']].forEach(function (t) {
      var x = t[0], h = t[1], top = 14 - h;
      b.rect(x, top, 3, h, t[2]);
      b.px(x, top + 1, 'clay');
      for (var y = top + 2; y < 15; y++) b.px(x + 2, y, 'plum');
      b.px(x + 1, top, 'plum');
    });
    b.outline('plum');
  }, 'sea');
  // Mozgový koral: zelená kupola s ryhami. Sivý s tmavým obrysom vyzeral ako skala-prekážka (kritik kolo 1, P3);
  // oranžový a ružový patria rybám (K9).
  def('sea_brain', 16, 10, 1, function (b) {
    ell(8, 10, 7.5, 8.5, function (x, y) { if (y <= 9) b.px(x, y, y < 3 ? 'green' : 'greenDark'); });
    b.each(function (x, y) { if (Math.sin(x * 1.1 + Math.sin(y * 1.3) * 1.8) > 0.55 && y > 2) b.px(x, y, 'tealDark'); });
  }, 'sea');
  // Morský bič: tenké ohnuté stonky (Súmrak).
  def('sea_whip', 11, 26, 2, function (b, f) {
    [[3, 24, 0.6], [6, 19, -0.4], [8, 25, 0.2]].forEach(function (s, k) {
      for (var y = 0; y < s[1]; y++) {
        var t = y / s[1], x = s[0] + s[2] * y * 0.25 + Math.sin(t * 2 + f * 1.1 + k) * 1.2 * t;
        b.px(x, 25 - y, y > s[1] - 3 ? 'greyLight' : 'grey');
      }
    });
    b.outline('slateDark');
  }, 'sea');
  // Hubka (Súmrak): váza so zvislými rebrami (nie mriežka — kritik D9/P1), ružovofialová — sivá s tmavým obrysom
  // sa podobala na skalu-prekážku (kritik kolo 3, P3).
  def('sea_sponge', 12, 16, 1, function (b) {
    for (var y = 0; y < 16; y++) {
      var hw = 2 + y * 0.22 + (y < 3 ? 1 : 0), cx = 6, x0 = Math.round(cx - hw);
      for (var x = x0; x <= Math.round(cx + hw - 1); x++) b.px(x, 15 - y, (x - x0) % 3 === 1 ? 'pink' : 'pinkPurple');
    }
    b.rect(3, 0, 6, 1, 'pink');
    b.rect(4, 1, 4, 1, 'purple');
    b.outline('purple');
  }, 'sea');
  // Morská ľalia (Polnoc): stonka a perovité ramená, bledá — v tme ju ukáže svetlo háčika.
  def('sea_lily', 14, 22, 2, function (b, f) {
    for (var y = 8; y < 22; y++) b.px(7 + Math.sin(y * 0.3) * 0.6, y, 'grey');
    for (var k = 0; k < 5; k++) {
      var a = Math.PI * (0.15 + k * 0.175) + (f ? 0.08 : -0.08);
      for (var r = 1; r < 7; r++) {
        var x = 7 + Math.cos(a) * r, y = 8 - Math.sin(a) * r * 1.1;
        b.px(x, y, r > 4 ? 'pinkPurple' : 'greyLight');
      }
    }
    b.outline('slateDark');
  }, 'sea');
  // Rúrkovce (Priepasť): biele rúrky s ružovými chocholmi.
  def('sea_worms', 14, 15, 2, function (b, f) {
    [[2, 9], [5, 13], [8, 8], [11, 11]].forEach(function (w, k) {
      var x = w[0], h = w[1];
      for (var y = 0; y < h; y++) b.px(x + (y > h - 3 && k % 2 ? 1 : 0), 14 - y, y % 3 ? 'greyLight' : 'grey');
      var ty = 14 - h, sw = (f + k) % 2;
      b.px(x - 1 + sw, ty, 'pink'); b.px(x + sw, ty - 1, 'pink'); b.px(x + 1 + sw, ty, 'pinkPurple');
    });
    b.outline('slateDark');
  }, 'sea');

  // ---- stredná vrstva (siluety: menej detailu, tmavšie)
  // Kopa koralov: silueta s osvetleným vrchom.
  def('sea_coralhead', 30, 15, 1, function (b) {
    ell(15, 15, 14, 9, function (x, y) { if (y < 15) b.px(x, y, 'purple'); });
    ell(8, 11, 5, 5, function (x, y) { b.px(x, y, 'purple'); });
    ell(21, 10, 6, 6, function (x, y) { b.px(x, y, 'purple'); });
    b.each(function (x, y) { if (!b.at(x, y - 1)) b.px(x, y, 'pinkPurple'); });
    b.each(function (x, y) { if (y > 12 || (!b.at(x, y + 1) && y > 8)) b.px(x, y, 'plum'); });
  }, 'sea');
  // Chaluhový les: vysoké stonky s listami (2 px hrubé — tenká čiara by sa plietla s vlascom).
  function kelpStalks(b, f, stalks, H0) {
    stalks.forEach(function (s, k) {
      var x0 = s[0], h = s[1], ph = s[2];
      for (var y = 0; y < h; y++) {
        var t = y / h, x = x0 + Math.sin(t * 3 + ph + f * 0.9) * 2.4 * t, yy = H0 - 1 - y;
        b.px(x, yy, 'greenDark'); b.px(x + 1, yy, 'tealDark');
        if (y % 5 === 2 && y > 4) {
          var side = (Math.floor(y / 5) + k) % 2 ? 1 : -1;
          b.px(x + (side > 0 ? 2 : -1), yy, 'greenDark'); b.px(x + (side > 0 ? 3 : -2), yy - 1, 'greenDark');
          b.px(x + (side > 0 ? 2 : -1), yy - 1, 'greenDark');
        }
      }
      b.px(x0 + Math.sin(3 + ph + f * 0.9) * 2.4, H0 - h, 'green');
    });
  }
  def('sea_kelpwall', 28, 72, 2, function (b, f) { kelpStalks(b, f, [[4, 66, 0], [10, 52, 1.7], [16, 72, 3.1], [22, 44, 4.4]], 72); }, 'sea');
  def('sea_kelpstand', 18, 46, 2, function (b, f) { kelpStalks(b, f, [[4, 40, 0.9], [11, 46, 2.3]], 46); }, 'sea');

  // ---- orientačné body (maľujú sa do vrstvy: tmavnú s vodou, v kuželi svetla sú v plných farbách)
  // Potopená loďka (Plytčina): drevený trup na skalnom výbežku, rebrá dosiek, riasy, zlomené veslo.
  def('lm_boat', 40, 22, 1, function (b) {
    for (var y = 15; y < 22; y++) for (var x = 0; x < 36 - (y - 15) * 2.5; x++) b.px(x, y, y === 15 ? 'greenDark' : x > 30 - (y - 15) * 2.5 ? 'slateDark' : 'navy');
    for (var x2 = 4; x2 <= 34; x2++) {
      var t = (x2 - 4) / 30, top = Math.round(5 + t * 3), keel = Math.round(top + 2 + 8 * Math.pow(Math.sin(Math.PI * t), 0.7));
      for (var yy = top; yy <= Math.min(keel, 16); yy++) b.px(x2, yy, yy === top ? 'woodLight' : (yy - top) % 3 === 0 ? 'plum' : 'wood');
    }
    b.line(5, 5, 4, 2, 'wood'); b.line(34, 8, 36, 5, 'wood');                       // statne
    b.line(14, 1, 24, 7, 'woodLight'); b.px(13, 0, 'wood'); b.px(14, 0, 'wood');   // zlomené veslo
    b.each(function (x, y) { if (y > 11 && y < 15 && b.is(x, y, 'wood') && !b.at(x, y + 2)) b.px(x, y, 'greenDark'); });
    b.rect(18, 9, 3, 2, 'ink');                                                      // diera v trupe
  }, 'sea');
  // Skalný oblúk (Útesy, stredná vrstva): ručne zadaný nepravidelný obrys (vonkajší tvar mínus otvor) — noha
  // vľavo, hrubá klenba, masív pri pravej stene. Vrch osvetlený, strop otvoru a pravá strana nohy v tieni, pár
  // prasklín. Otvor je výrez (paintSprite: vidno vodu, nie skaly za ním). Predtým: v2 geometrický „h", v6 noha
  // ako rovný obdĺžnik (kritik kolo 1, w08), v7 kamene ako guľaté koráliky.
  def('lm_arch', 74, 62, 1, function (b) {
    var OUT = [[1, 62], [6, 57], [2, 50], [8, 45], [3, 38], [9, 32], [5, 26], [10, 20], [13, 14], [18, 9], [25, 5], [33, 2], [42, 1], [50, 3],
      [56, 2], [62, 5], [67, 3], [74, 6], [74, 62]];
    var HOLE = [[17, 62], [18, 50], [16, 41], [19, 33], [22, 26], [28, 19], [35, 15], [43, 14], [50, 17], [55, 23], [57, 31],
      [56, 40], [58, 50], [57, 62]];
    var hole = {};
    poly(HOLE, function (x, y) { hole[y * 74 + x] = 1; });
    poly(OUT, function (x, y) { if (!hole[y * 74 + x]) b.px(x, y, 'blueDark'); });
    b.each(function (x, y) {
      if (!b.at(x, y - 1)) b.px(x, y, 'slate');                                   // svetlo zhora
      else if (!b.at(x, y - 2) && (x + y) % 3) b.px(x, y, 'slate');
      else if (!b.at(x, y + 1) && y < 61) b.px(x, y, 'navy');                     // strop otvoru v tieni
      else if (hole[y * 74 + x + 1] || hole[y * 74 + x + 2]) b.px(x, y, 'navy');  // strana nohy k otvoru v tieni
    });
    b.line(8, 30, 11, 37, 'navy'); b.line(11, 37, 9, 45, 'navy');                 // praskliny
    b.line(30, 6, 34, 11, 'navy'); b.line(61, 22, 64, 33, 'navy'); b.line(64, 33, 62, 44, 'navy');
    poly(HOLE, function (x, y) { if (!b.at(x, y)) b.g[y * b.w + x] = 1; });        // výrez
    [[24, 0], [37, 0], [48, 0], [65, 0]].forEach(function (c, k) {                  // koralové chumáče na vrchu
      for (var i2 = -2; i2 <= 2; i2++) {
        var x = c[0] + i2, y0 = 0;
        while (y0 < 61 && !b.at(x, y0 + 1)) y0++;
        if (y0 >= 61) continue;
        b.px(x, y0, k % 2 ? 'pinkPurple' : 'purple');
        if (Math.abs(i2) < 2) b.px(x, y0 - 1, 'pinkPurple');
      }
    });
  }, 'sea');
  // Vrak plachetnice (Súmrak, stredná vrstva): naklonený trup s dierami, zlomený sťažeň, laná, riasy.
  def('lm_wreck', 96, 54, 1, function (b) {
    var tilt = 0.14;
    for (var x = 6; x <= 92; x++) {
      var t = (x - 6) / 86, deck = Math.round(26 + (x - 6) * tilt - (t > 0.82 ? (t - 0.82) * 20 : 0));
      var keel = Math.round(deck + 3 + 15 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05)), 0.6));
      for (var y = deck; y <= Math.min(keel, 53); y++) b.px(x, y, y === deck ? 'woodLight' : (y - deck) % 4 === 0 ? 'plum' : 'wood');
    }
    b.rect(30, 22, 18, 7, 'wood'); b.rect(30, 22, 18, 1, 'woodLight'); b.rect(33, 25, 3, 2, 'ink'); b.rect(40, 25, 3, 2, 'ink'); // kajuta
    [[52, 34, 7, 5], [70, 40, 5, 4], [22, 36, 4, 3]].forEach(function (h) { ell(h[0], h[1], h[2] / 2, h[3] / 2, function (x, y) { if (b.at(x, y)) b.px(x, y, 'ink'); }); });
    b.line(40, 22, 22, 0, 'woodLight'); b.line(41, 22, 23, 0, 'wood');              // zlomený sťažeň
    b.line(28, 9, 38, 9, 'wood');                                                   // rahno
    b.line(23, 1, 8, 27, 'slate'); b.line(41, 21, 80, 34, 'slate');                 // laná
    b.line(64, 30, 66, 18, 'wood');                                                 // pahýľ druhého sťažňa
    b.each(function (x, y) { if (!b.at(x, y - 1) && nz(x, y, 2221) < 0.3 && y > 20) { b.px(x, y, 'greenDark'); if (nz(x, y, 2222) < 0.4) b.px(x, y + 1, 'greenDark'); } });
  }, 'sea');
  // Kostra veľryby (Polnoc, blízka vrstva): na rímse od pravej steny; chrbtica, rebrá, lebka s čeľusťou. Kosti sú
  // sivé, svetlosivý len vrch lebky — kolo 1: lebka (svetlosivá, jas ≈ 201) pri háčiku prebila ryby (P2).
  def('lm_whale', 86, 34, 1, function (b) {
    for (var y = 26; y < 34; y++) for (var x = 0; x < 86; x++) if (x > 6 + (34 - y) * 1.5) b.px(x, y, y === 26 ? 'slate' : y === 27 ? 'slateDark' : 'navy');
    for (var x2 = 16; x2 < 70; x2 += 3) { var sy0 = 14 + Math.round(Math.sin(x2 * 0.05) * 1.5); b.rect(x2, sy0, 2, 2, 'grey'); b.px(x2 + 2, sy0 + 1, 'slate'); }
    for (var r = 0; r < 9; r++) {
      var rx = 22 + r * 5, rh = 11 - Math.abs(r - 3) * 1.1;
      for (var t = 0; t < 1; t += 0.06) b.px(rx + Math.sin(t * Math.PI) * 3.5, 16 + t * rh, t < 0.5 ? 'grey' : 'slate');
    }
    poly([[66, 12], [84, 15], [86, 21], [70, 22], [64, 18]], function (x, y) { b.px(x, y, 'grey'); });   // lebka
    b.each(function (x, y) { if (x >= 64 && y <= 15 && !b.at(x, y - 1)) b.px(x, y, 'greyLight'); });
    b.line(68, 23, 85, 25, 'slate'); b.line(68, 24, 84, 26, 'slate');                                        // čeľusť
    b.rect(72, 16, 2, 2, 'ink');                                                                              // očnica
    b.line(10, 24, 16, 16, 'slate'); b.line(8, 25, 4, 22, 'slate');                                            // chvost
  }, 'sea');
  // Ruiny (Priepasť, blízka vrstva): dva zlomené stĺpy s hlavicami, ležiaci stĺp, kus architrávu.
  def('lm_ruins', 56, 66, 1, function (b) {
    for (var y = 58; y < 66; y++) for (var x = 0; x < 56 - (y - 58) * 3; x++) b.px(x, y, y === 58 ? 'slate' : 'navy');
    function col(x0, top, w) {
      for (var yy = top; yy < 58; yy++) for (var xx = x0; xx < x0 + w; xx++) b.px(xx, yy, (xx - x0) % 3 === 2 ? 'slate' : xx === x0 ? 'greyLight' : 'grey');
      b.rect(x0 - 2, top - 3, w + 4, 3, 'greyLight'); b.rect(x0 - 2, top - 1, w + 4, 1, 'grey');
      b.rect(x0 - 1, 56, w + 2, 2, 'slate');
    }
    col(8, 14, 7); col(30, 30, 7);
    b.rect(4, 6, 20, 5, 'grey'); b.rect(4, 6, 20, 1, 'greyLight'); b.line(24, 6, 27, 11, 'slate');
    for (var x4 = 36; x4 < 54; x4++) for (var y4 = 52; y4 < 57; y4++) b.px(x4, y4, y4 === 52 ? 'greyLight' : (x4 % 4 === 0) ? 'slate' : 'grey');
    b.line(10, 24, 13, 31, 'slateDark'); b.line(13, 31, 11, 37, 'slateDark'); b.line(33, 41, 35, 47, 'slateDark'); b.line(9, 8, 14, 10, 'slate');
    [[11, 30], [32, 40], [42, 51]].forEach(function (p) { b.px(p[0], p[1], 'pinkPurple'); b.px(p[0] + 1, p[1], 'pink'); });
  }, 'sea');
  // Komíny na dne (Priepasť): tri hrboľaté stĺpy s tmavým dymom nad nimi.
  def('lm_vents', 52, 70, 1, function (b) {
    [[6, 30, 7], [22, 44, 9], [38, 22, 6]].forEach(function (c, k) {
      var x0 = c[0], h = c[1], w = c[2];
      for (var y = 0; y < h; y++) {
        var ww = w + Math.round(2 * Math.sin(y * 0.7 + k) + (y > h - 6 ? (y - h + 6) * 0.8 : 0)), xs = Math.round(x0 - (ww - w) / 2);
        for (var x = 0; x < ww; x++) b.px(xs + x, 69 - y, x === 0 ? 'slate' : x === ww - 1 ? 'navy' : 'slateDark');
      }
      var tx = Math.round(x0 + w / 2), ty = 69 - h;
      b.rect(tx - 1, ty, 3, 1, 'clay');
      for (var p = 0; p < 4; p++) ell(tx + Math.sin(p * 1.7 + k) * 2, ty - 4 - p * 5, 2.5 + p * 0.6, 2 + p * 0.3, function (x, y) { if (!b.at(x, y)) b.px(x, y, 'ink'); });
    });
  }, 'sea');

  // Svet mora: tie isté nastavenia vrstiev ako pred viacerými svetmi (odtlačok kúskov sa nesmie zmeniť).
  WORLDS.more = {
    loc: 'more',
    floor: function () { return HL.data.SEA_FLOOR; },
    qStops: seaStops,
    schools: true,
    flora: FLORA, midFlora: MID_FLORA, landmarks: LANDMARKS,
    paintFloor: function (buf, kmap, r0, n) { paintFloor(buf, kmap, r0, n); },
    cfg: function (name) {
      var wd = WORLDS.more;
      if (name === 'far') return { wd: wd, min: 6, span: T.seaFarW, hMax: T.seaFarH, alt: 520, envSalt: 1190, anti: true, eMin: 0.22, wVar: 0.65,
        salt: 1100, remap: FAR_REMAP, style: function () { return FAR_ST; } };
      if (name === 'mid') return { wd: wd, min: 0, span: T.seaMidW, hMax: T.seaMidH, alt: T.seaMidAlt, envSalt: 1390, anti: true, eMin: 0.1, wVar: 0.45,
        salt: 1300, style: function (dep) { return dep > 650 ? MID_ST_DEEP : MID_ST; } };
      return { wd: wd, min: 3, span: T.seaWallW, hMax: T.seaWallH, alt: T.seaWallAlt, envSalt: 1590, anti: true, eMin: 0.08, wVar: 0.4,
        salt: 1500, style: function (dep) { return nearStyleOf(NEAR_STYLE, zoneId(dep, false), NEAR_STYLE.priepast); } };
    },
  };

  HL.sea = {
    // ďalší svet (gfx/seascape_lake.js): def = { loc, floor(), qStops(), schools, flora, midFlora, landmarks,
    // paintFloor(buf, kmap, r0, n, L), cfg(name) → nastavenia vrstvy, sig() } — pozri WORLDS.more
    addWorld: function (loc, def) { def.loc = loc; WORLDS[loc] = def; delete Wc[loc]; },
    worldDef: wdef,
    // pomôcky motora pre definície svetov (rovnaký šum a indexy farieb ako more)
    util: { vn: vn, hv: hv, mod: mod, smooth01: smooth01, C: C, kOf: kOf, nearStyleOf: nearStyleOf, zoneId: zoneId, SHAPES: SHAPES, PW: PW, CH: CH },
    drawBack: drawBack,
    drawNear: drawNear,
    drawLit: drawLit,
    // pre testy a nástroje: svet v indexoch farieb (bez plátna)
    world: world,
    // farba, ktorou sa meno farby z kresby vrstvy ('far'|'mid'|'near') ukáže pri k stupňoch tmy (aj výnimky vrstvy, hmla)
    colorAt: function (layer, name, k, fog) {
      var rm = layer === 'far' ? FAR_REMAP : null, v = lutFor(rm, k, fog)[NAMES.indexOf(name) + 1];
      return '#' + ('000000' + v.toString(16)).slice(-6);
    },
    qDay: qDay,
    kOf: kOf,
    chunkData: chunkData,
    mapRow: mapRow,
    nominal: nominal,
    rowAt: rowAt,
    floorTop: floorTop,
    LANDMARKS: LANDMARKS,
    FLORA: FLORA,
    MID_FLORA: MID_FLORA,
    plantAt: plantAt,
    CH: CH,
  };
})(globalThis.HL);
