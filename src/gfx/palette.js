// Paleta: ENDESGA 32 (voľne použiteľná 32-farebná pixel-art paleta od Endesgu).
// Dizajn 14.1: "obmedzená, približne 32 farieb". Všetko, čo sa kreslí, berie farby
// ODTIAĽTO — žiadne ručne písané hex kódy v iných súboroch (výnimka: priehľadnosť
// cez HL.pal.rgba). Plynulé prechody sa robia ditheringom, nie miešaním farieb.
(function (HL) {
  var P = HL.pal = {
    rust: '#be4a2f', clay: '#d77643', sandLight: '#ead4aa', sand: '#e4a672',
    woodLight: '#b86f50', wood: '#733e39', plum: '#3e2731', redDark: '#a22633',
    red: '#e43b44', orange: '#f77622', amber: '#feae34', yellow: '#fee761',
    greenLight: '#63c74d', green: '#3e8948', greenDark: '#265c42', tealDark: '#193c3e',
    blueDark: '#124e89', blue: '#0099db', cyan: '#2ce8f5', white: '#ffffff',
    greyLight: '#c0cbdc', grey: '#8b9bb4', slate: '#5a6988', slateDark: '#3a4466',
    navy: '#262b44', ink: '#181425', magenta: '#ff0044', purple: '#68386c',
    pinkPurple: '#b55088', pink: '#f6757a', skinLight: '#e8b796', skin: '#c28569',
  };
  var NAMES = Object.keys(P);
  Object.defineProperty(P, 'names', { value: NAMES, enumerable: false });

  // Rampy na tieňovanie (od svetlej po tmavú).
  Object.defineProperty(P, 'ramps', {
    enumerable: false,
    value: {
      sea: ['cyan', 'blue', 'blueDark', 'navy', 'ink'],
      wood: ['sand', 'woodLight', 'wood', 'plum'],
      sand: ['sandLight', 'sand', 'clay', 'woodLight'],
      leaf: ['greenLight', 'green', 'greenDark', 'tealDark'],
      stone: ['greyLight', 'grey', 'slate', 'slateDark', 'navy'],
      fire: ['yellow', 'amber', 'orange', 'rust', 'redDark'],
      rose: ['pink', 'pinkPurple', 'purple', 'plum'],
      skin: ['skinLight', 'skin', 'woodLight', 'wood'],
    },
  });

  // Farba vody podľa hĺbky: tyrkysová → čierna (14.1). Vracia dve susedné farby
  // rampy a podiel t pre dithering medzi nimi.
  var SEA_STOPS = [
    { d: 0, c: 'blue' }, { d: 50, c: 'blue' }, { d: 200, c: 'blueDark' },
    { d: 600, c: 'navy' }, { d: 1500, c: 'ink' },
  ];
  // Jadrové jazero (docs/JAZERO.md): teplá zelená pri hladine → tmavozelená hala → tmavotyrkysová šachta (žiaru
  // jadra kreslí ponor zvlášť). Ten istý tvar ako more, aby UI (príprava, hĺbkomer, encyklopédia) kreslilo jedným kódom.
  var LAKE_STOPS = [
    { d: 0, c: 'green' }, { d: 50, c: 'green' }, { d: 120, c: 'greenDark' }, { d: 300, c: 'tealDark' }, { d: 800, c: 'tealDark' },
  ];
  function stopsAt(STOPS, depth) {
    if (!(depth > 0)) return { a: P[STOPS[0].c], b: P[STOPS[0].c], t: 0 };
    for (var i = 0; i < STOPS.length - 1; i++) {
      var s0 = STOPS[i], s1 = STOPS[i + 1];
      if (depth < s1.d) return { a: P[s0.c], b: P[s1.c], t: (depth - s0.d) / (s1.d - s0.d) };
    }
    var last = P[STOPS[STOPS.length - 1].c];
    return { a: last, b: last, t: 0 };
  }
  Object.defineProperty(P, 'seaAt', { enumerable: false, value: function (depth) { return stopsAt(SEA_STOPS, depth); } });
  Object.defineProperty(P, 'lakeAt', { enumerable: false, value: function (depth) { return stopsAt(LAKE_STOPS, depth); } });
  // Voda lovného miesta: 'jadro' = jazero, inak more.
  Object.defineProperty(P, 'waterAt', { enumerable: false, value: function (loc, depth) { return loc === 'jadro' ? stopsAt(LAKE_STOPS, depth) : stopsAt(SEA_STOPS, depth); } });

  // '#rrggbb' + alfa -> 'rgba(r,g,b,a)'. Neplatný vstup hodí chybu — prehliadač by
  // neplatnú farbu TICHO ignoroval a kreslil predchádzajúcou (čierna scéna bez chyby).
  Object.defineProperty(P, 'rgba', {
    enumerable: false,
    value: function (hex, a) {
      var m = /^#([0-9a-f]{6})$/i.exec(hex);
      if (!m || !(a >= 0 && a <= 1)) throw new Error('HL.pal.rgba: neplatná farba ' + hex + ' / ' + a);
      var n = parseInt(m[1], 16);
      return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
    },
  });
  Object.defineProperty(P, 'toRGB', {
    enumerable: false,
    value: function (hex) {
      var n = parseInt(hex.slice(1), 16);
      return [n >> 16, (n >> 8) & 255, n & 255];
    },
  });

  // ------------------------------------------------------------------ stmavovanie po rampe
  // Tmavší sused KAŽDEJ z 32 farieb: rovnaký odtieň, nižší jas (L* v Lab klesá pri každom
  // kroku — stráži gfx.test.js). Zdroj: rampy ENDESGA 32 vyššie (poradie palety je rampa),
  // kde sa rampy rozchádzajú, rozhodla vzdialenosť v Lab. Všetko sa končí v 'ink'.
  // Slúži HL.draw.shade: stmavenie prekrytím šachovnicou miešalo dve farby a na 1× vyzeralo
  // ako špinavá mriežka; posun po rampe dá čistý, tmavší pixel art a paleta ostane presná.
  var DARKER = {
    white: 'greyLight', greyLight: 'grey', grey: 'slate', slate: 'slateDark', slateDark: 'navy', navy: 'ink', ink: 'ink',
    yellow: 'amber', amber: 'orange', orange: 'rust', rust: 'redDark', redDark: 'plum', plum: 'ink',
    red: 'redDark', magenta: 'redDark',
    sandLight: 'sand', sand: 'woodLight', clay: 'woodLight', woodLight: 'wood', wood: 'plum',
    skinLight: 'skin', skin: 'woodLight',
    pink: 'pinkPurple', pinkPurple: 'purple', purple: 'plum',
    greenLight: 'green', green: 'greenDark', greenDark: 'tealDark', tealDark: 'ink',
    cyan: 'blue', blue: 'blueDark', blueDark: 'navy',
  };
  Object.defineProperty(P, 'DARKER', { enumerable: false, value: DARKER });
  var byRGB = {};  // 0xRRGGBB -> meno farby
  for (var ni = 0; ni < NAMES.length; ni++) byRGB[parseInt(P[NAMES[ni]].slice(1), 16)] = NAMES[ni];
  // Farba mimo palety (napr. sprite s priehľadnosťou) → najbližšia farba palety (RGB).
  function nearestName(v) {
    if (byRGB[v] !== undefined) return byRGB[v];
    var r = v >> 16, g = (v >> 8) & 255, b = v & 255, best = 'ink', bd = Infinity;
    for (var i = 0; i < NAMES.length; i++) {
      var n = parseInt(P[NAMES[i]].slice(1), 16);
      var dr = (n >> 16) - r, dg = ((n >> 8) & 255) - g, db = (n & 255) - b;
      var d = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
      if (d < bd) { bd = d; best = NAMES[i]; }
    }
    return best;
  }
  function stepName(name, steps) { for (var s = 0; s < steps; s++) name = DARKER[name]; return name; }
  // darker('#fee761' | 'yellow', 2) → '#f77622'. Výsledok je VŽDY farba z palety.
  Object.defineProperty(P, 'darker', {
    enumerable: false,
    value: function (c, steps) {
      steps = steps == null ? 1 : Math.max(0, Math.round(steps));
      var name;
      if (NAMES.indexOf(c) >= 0) name = c;
      else {
        var m = /^#([0-9a-f]{6})$/i.exec(c);
        // neplatná farba musí spadnúť nahlas (prehliadač by ju ticho nahradil predchádzajúcou)
        if (!m || !(steps >= 0)) throw new Error('HL.pal.darker: neplatná farba ' + c + ' / ' + steps);
        name = nearestName(parseInt(m[1], 16));
      }
      return P[stepName(name, steps)];
    },
  });
  // Rýchla cesta pre shade(): 0xRRGGBB → 0xRRGGBB o `steps` tmavšie (cache podľa krokov).
  var shadeMaps = {};
  Object.defineProperty(P, 'darkerRGB', {
    enumerable: false,
    value: function (v, steps) {
      var m = shadeMaps[steps] || (shadeMaps[steps] = new Map());
      var out = m.get(v);
      if (out === undefined) {
        if (m.size > 4096) m.clear(); // farby mimo palety nesmú cache nafúknuť
        out = parseInt(P[stepName(nearestName(v), steps)].slice(1), 16);
        m.set(v, out);
      }
      return out;
    },
  });
})(globalThis.HL);
