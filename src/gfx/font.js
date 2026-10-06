// Bitmapové písmo HLBINY. Žiadny canvas fillText: systémové písma sa pri 180×320
// rozmazávajú, každý prehliadač ich kreslí inak a diakritika by nesedela na pixeloch.
//
// Dve rezy:
//   normal  bunka 11 px: riadky 0–1 miesto na diakritiku nad VEĽKÝMI písmenami,
//           2–8 verzálky (7 px), 4–8 malé písmená (x-výška 5), 9–10 dotiahnutia (g, j, p, q, y)
//   small   bunka 8 px:  riadky 0–1 diakritika, 2–6 verzálky a číslice (5 px),
//           3–6 malé písmená, 7 dotiahnutia — hustý HUD (čísla, ladiaci výpis)
//
// Glyf sa zapisuje ako 'horný_riadok riadok riadok …' ('#' = pixel). Písmená
// s diakritikou sa SKLADAJÚ zo základného písmena a značky (dĺžeň, mäkčeň, vokáň,
// prehláska, krúžok), aby každá značka mala jeden tvar a jedno miesto — ručne
// kreslené sú iba výnimky, kde by zloženie kolidovalo (ĺ, Ů).
//
// Kreslenie: jedna maska (biele glyfy) na rez, z nej farebné atlasy v cache podľa
// farby, text = séria drawImage na celočíselné súradnice. Rýchle a pixelovo presné:
// maska má iba plne nepriehľadné pixely, takže farba po zafarbení ostáva z palety.
(function (HL) {
  var F = HL.font = {};
  F.missing = [];   // znaky, ktoré písmo nepozná (harness ich hlási ako chybu)

  // ------------------------------------------------------------------ rez "normal"
  var NORMAL = {
    'A': '2 .###. #...# #...# ##### #...# #...# #...#',
    'B': '2 ####. #...# #...# ####. #...# #...# ####.',
    'C': '2 .###. #...# #.... #.... #.... #...# .###.',
    'D': '2 ####. #...# #...# #...# #...# #...# ####.',
    'E': '2 ##### #.... #.... ####. #.... #.... #####',
    'F': '2 ##### #.... #.... ####. #.... #.... #....',
    'G': '2 .###. #...# #.... #.### #...# #...# .###.',
    'H': '2 #...# #...# #...# ##### #...# #...# #...#',
    'I': '2 ### .#. .#. .#. .#. .#. ###',
    'J': '2 ...# ...# ...# ...# #..# #..# .##.',
    'K': '2 #...# #..#. #.#.. ##... #.#.. #..#. #...#',
    'L': '2 #... #... #... #... #... #... ####',
    'M': '2 #...# ##.## #.#.# #.#.# #...# #...# #...#',
    'N': '2 #...# ##..# ##..# #.#.# #..## #..## #...#',
    'O': '2 .###. #...# #...# #...# #...# #...# .###.',
    'P': '2 ####. #...# #...# ####. #.... #.... #....',
    'Q': '2 .###. #...# #...# #...# #.#.# #..#. .##.#',
    'R': '2 ####. #...# #...# ####. #.#.. #..#. #...#',
    'S': '2 .###. #...# #.... .###. ....# #...# .###.',
    'T': '2 ##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..',
    'U': '2 #...# #...# #...# #...# #...# #...# .###.',
    'V': '2 #...# #...# #...# #...# .#.#. .#.#. ..#..',
    'W': '2 #...# #...# #...# #.#.# #.#.# ##.## #...#',
    'X': '2 #...# #...# .#.#. ..#.. .#.#. #...# #...#',
    'Y': '2 #...# #...# .#.#. ..#.. ..#.. ..#.. ..#..',
    'Z': '2 ##### ....# ...#. ..#.. .#... #.... #####',

    'a': '4 .##. ...# .### #..# .###',
    'b': '2 #... #... ###. #..# #..# #..# ###.',
    'c': '4 .### #... #... #... .###',
    'd': '2 ...# ...# .### #..# #..# #..# .###',
    'e': '4 .##. #..# #### #... .###',
    'f': '2 .## #.. ### #.. #.. #.. #..',
    'g': '4 .### #..# #..# #..# .### ...# .##.',
    'h': '2 #... #... ###. #..# #..# #..# #..#',
    'i': '2 # . # # # # #',
    'ı': '4 # # # # #', // ı bez bodky — základ pre í
    'j': '2 ..# ... ..# ..# ..# ..# ..# ..# ##.',
    'k': '2 #... #... #..# #.#. ##.. #.#. #..#',
    'l': '2 #. #. #. #. #. #. .#',
    'm': '4 ####. #.#.# #.#.# #.#.# #.#.#',
    'n': '4 ###. #..# #..# #..# #..#',
    'o': '4 .##. #..# #..# #..# .##.',
    'p': '4 ###. #..# #..# #..# ###. #... #...',
    'q': '4 .### #..# #..# #..# .### ...# ...#',
    'r': '4 #.## ##.. #... #... #...',
    's': '4 .### #... .##. ...# ###.',
    't': '3 .#. ### .#. .#. .#. .##',
    'u': '4 #..# #..# #..# #..# .###',
    'v': '4 #...# #...# .#.#. .#.#. ..#..',
    'w': '4 #...# #...# #.#.# #.#.# .#.#.',
    'x': '4 #...# .#.#. ..#.. .#.#. #...#',
    'y': '4 #..# #..# #..# #..# .### ...# .##.',
    'z': '4 #### ...# .##. #... ####',

    '0': '2 .###. #...# #..## #.#.# ##..# #...# .###.',
    '1': '2 ..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.',
    '2': '2 .###. #...# ....# ...#. ..#.. .#... #####',
    '3': '2 .###. #...# ....# ..##. ....# #...# .###.',
    '4': '2 ...#. ..##. .#.#. #..#. ##### ...#. ...#.',
    '5': '2 ##### #.... ####. ....# ....# #...# .###.',
    '6': '2 .###. #.... #.... ####. #...# #...# .###.',
    '7': '2 ##### ....# ...#. ..#.. ..#.. ..#.. ..#..',
    '8': '2 .###. #...# #...# .###. #...# #...# .###.',
    '9': '2 .###. #...# #...# .#### ....# ....# .###.',

    '!': '2 # # # # # . #',
    '"': '2 #.# #.#',
    '#': '2 .#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.',
    '$': '2 ..#.. .#### #.#.. .###. ..#.# ####. ..#..',
    '%': '2 ##..# ##.#. ...#. ..#.. .#... .#.## #..##',
    '&': '2 .##.. #..#. .##.. .#... #.#.# #..#. .##.#',
    "'": '2 # # #',          // 3 px — mäkčeň v ď ľ ť Ľ má 2 px, aby ľ ≠ l'
    '(': '2 .# #. #. #. #. #. .#',
    ')': '2 #. .# .# .# .# .# #.',
    '*': '3 ..#.. #.#.# .###. #.#.# ..#..',
    '+': '5 .#. ### .#.',
    ',': '8 .# #.',
    '-': '6 ###',
    '.': '8 #',
    '/': '2 ..# ..# .#. .#. .#. #.. #..',
    ':': '5 # . . #',
    ';': '5 .# .. .. .# #.',
    '<': '3 ..# .#. #.. .#. ..#',
    '=': '5 ### ... ###',
    '>': '3 #.. .#. ..# .#. #..',
    '?': '2 .##. #..# ...# ..#. .#.. .... .#..',
    '@': '2 .###. #...# #.### #.#.# #.##. #.... .###.',
    '[': '2 ## #. #. #. #. #. ##',
    '\\': '2 #.. #.. .#. .#. .#. ..# ..#',
    ']': '2 ## .# .# .# .# .# ##',
    '^': '2 .#. #.#',
    '_': '9 #####',
    '`': '2 #. .#',
    '{': '2 ..# .#. .#. #.. .#. .#. ..#',
    '|': '2 # # # # # # #',
    '}': '2 #.. .#. .#. ..# .#. .#. #..',
    '~': '5 .##.# #..#.',

    '€': '2 ..### .#... ####. .#... ####. .#... ..###',
    '°': '2 .#. #.# .#.',
    '×': '5 #.# .#. #.#',
    '·': '6 #',
    '…': '8 #.#.#',
    '–': '6 ####',
    '—': '6 #######',
    '±': '2 ..#.. ..#.. ##### ..#.. ..#.. ..... #####',
    '−': '6 #####',               // matematické mínus (U+2212): širšie než - (3) aj – (4), užšie než — (7)
    '∞': '4 .#...#. #.#.#.# #..#..# #.#.#.# .#...#.',
    '✓': '3 .....# ....#. #..#.. .##... ..#...',
    '←': '4 ..#.. .#... ##### .#... ..#..',
    '→': '4 ..#.. ...#. ##### ...#. ..#..',
    '↑': '3 ..#.. .###. #.#.# ..#.. ..#.. ..#..',
    '↓': '3 ..#.. ..#.. ..#.. #.#.# .###. ..#..',
    '★': '2 ...#... ..###.. ####### .#####. ..###.. .##.##. .#...#.',
    '♥': '3 .#.#. ##### ##### .###. ..#..',
    '„': '8 .#.# #.#.',
    '“': '2 #.#. .#.#',
    '”': '2 .#.# #.#.',
    '‚': '8 .# #.',
    '‘': '2 #. .#',
    '’': '2 .# #.',
    '«': '5 .#.# #.#. .#.#',
    '»': '5 #.#. .#.# #.#.',
    // Ručne: zložené by kolidovali (dĺžeň by splynul s driekom l; krúžok sa nad
    // verzálku nezmestí — U je o riadok nižšie, ako to robia pixelové písma).
    'ĺ': '0 .# #. .. #. #. #. #. #. .#',
    'Ů': '0 ..#.. .#.#. ..#.. #...# #...# #...# #...# #...# .###.',
    // Ďalšie jazyky (docs/I18N.md): prečiarknuté ł/Ł (poľština), ostré s ß/ẞ (nemčina), spojené æ/œ
    // (francúzština), obrátené ¡/¿ (španielčina) — tvar, nie značka nad písmenom, preto ručne.
    'ł': '2 .#. .#. .## ##. .#. .#. ..#',
    'Ł': '2 .#... .#... .#.#. .##.. ##... .#... .####',
    'ß': '2 .##. #..# #.#. #..# #..# #..# #.#.',
    'ẞ': '2 .###. #...# #..#. #.#.. #..#. #...# #.##.',
    'æ': '4 .##.##. ...#..# .###### #..#... .######',
    'œ': '4 .##.##. #..#..# #..#### #..#... .##.###',
    'Æ': '2 ..##### .#.#... #..#... ######. #..#... #..#... #..####',
    'Œ': '2 .###### #..#... #..#... #..###. #..#... #..#... .######',
    '¡': '4 # . # # # # #',
    '¿': '4 ..#. .... ..#. .#.. #... #..# .##.',
    '▾': '5 ##### .###. ..#..',
    // ▸ / ▴ na riadku predpovede rýb v Príprave („Ďalšie hodiny (N zmien) ▸", „Skryť predpoveď ▴")
    '▸': '4 #.. ##. ### ##. #..',
    '▴': '5 ..#.. .###. #####',
  };
  // Značky NAD písmenom (riadky 0–1 nad verzálkou, nad malým písmenom s medzerou) a POD ním
  // (cedilla, ogonek: riadky 9–10 pod účiarím). dacute = dvojitá čiarka (ő, ű), tilde = vlnovka (ñ) —
  // dve rôzne značky, aby sa ő nedalo zameniť s ñ-ovou vlnovkou ani s ö.
  var NORMAL_MARKS = {
    acute: '.# #.', grave: '#. .#', caron: '#.# .#.', circ: '.#. #.#', uml: '#.#', ring: '.#. #.# .#.', apos: '# #',
    // bodka ż je štvorček 2×2: jednopixelová sa od z (a ź) líšila o 1 px (gfx.test.js)
    dot: '## ##', dacute: '.#.# #.#.', tilde: '.##.# #..#.', cedilla: '.# #.', ogonek: '.# #.',
  };
  var BELOW = { cedilla: 'center', ogonek: 'right' };

  // ------------------------------------------------------------------ rez "small"
  var SMALL = {
    'A': '2 .#. #.# ### #.# #.#',
    'B': '2 ##. #.# ##. #.# ##.',
    'C': '2 .## #.. #.. #.. .##',
    'D': '2 ##. #.# #.# #.# ##.',
    'E': '2 ### #.. ##. #.. ###',
    'F': '2 ### #.. ##. #.. #..',
    'G': '2 .## #.. #.# #.# .##',
    'H': '2 #.# #.# ### #.# #.#',
    'I': '2 ### .#. .#. .#. ###',
    'J': '2 ..# ..# ..# #.# .#.',
    'K': '2 #.# #.# ##. #.# #.#',
    'L': '2 #.. #.. #.. #.. ###',
    'M': '2 #...# ##.## #.#.# #...# #...#',
    'N': '2 #..# ##.# #.## #..# #..#',
    'O': '2 .#. #.# #.# #.# .#.',
    'P': '2 ##. #.# ##. #.. #..',
    'Q': '2 .#. #.# #.# #.# .##',
    'R': '2 ##. #.# ##. #.# #.#',
    'S': '2 .## #.. .#. ..# ##.',
    'T': '2 ### .#. .#. .#. .#.',
    'U': '2 #.# #.# #.# #.# ###',
    'V': '2 #.# #.# #.# .#. .#.',
    'W': '2 #...# #...# #.#.# ##.## #...#',
    'X': '2 #.# #.# .#. #.# #.#',
    'Y': '2 #.# #.# .#. .#. .#.',
    'Z': '2 ### ..# .#. #.. ###',

    // Malé písmená: každé dve sa líšia aspoň v 3 pixeloch (gfx.test.js). Dotiahnutie nahor je
    // tu len 1 px, takže 'a' ako 'd' bez driečika sa čítalo ako 'o' ("zlotá návnodo") a h/n,
    // u/v, g/y sa líšili v 1–2 pixeloch. Preto: dvojposchodové 'a' (oblúk hore, bruško dole),
    // 'h' a 'k' s nízkym ramenom, 'u' široké 4 px (ako v normálnom reze), 'y' s chvostom do
    // stredu. 'v' ostáva klasické 3 px — zúžený spodok ('#.# #.# .#. .#.') síce prešiel testom,
    // ale 'vlasec' sa potom čítal 'ylasec' (porovnávacia fotka v hlásení).
    'a': '3 ##. .## #.# ###',
    'b': '2 #.. ##. #.# #.# ##.',
    'c': '3 .## #.. #.. .##',
    'd': '2 ..# .## #.# #.# .##',
    'e': '3 .#. ### #.. .##',
    'f': '2 .## #.. ##. #.. #..',
    'g': '3 .## #.# .## ..# ##.',
    'h': '2 #.. #.. ##. #.# #.#',
    'i': '1 # . # # # #',
    'ı': '3 # # # #',
    'j': '1 .# .. .# .# .# .# #.',
    'k': '2 #.. #.. #.# ##. #.#',
    'l': '2 #. #. #. #. .#',
    'm': '3 ####. #.#.# #.#.# #.#.#',
    'n': '3 ##. #.# #.# #.#',
    'o': '3 .#. #.# #.# .#.',
    'p': '3 ##. #.# ##. #.. #..',
    'q': '3 .## #.# .## ..# ..#',
    'r': '3 #.# ##. #.. #..',
    's': '3 .## #.. ..# ##.',
    't': '2 .#. ### .#. .#. ..#',
    'u': '3 #..# #..# #..# .###',
    'v': '3 #.# #.# #.# .#.',
    'w': '3 #...# #...# #.#.# .#.#.',
    'x': '3 #.# .#. .#. #.#',
    'y': '3 #.# #.# .## ..# .#.',
    'z': '3 ### ..# .#. ###',

    '0': '2 ### #.# #.# #.# ###',
    '1': '2 .#. ##. .#. .#. ###',
    '2': '2 ##. ..# .#. #.. ###',
    '3': '2 ##. ..# .#. ..# ##.',
    '4': '2 #.# #.# ### ..# ..#',
    '5': '2 ### #.. ##. ..# ##.',
    '6': '2 .## #.. ### #.# ###',
    '7': '2 ### ..# .#. .#. .#.',
    '8': '2 ### #.# ### #.# ###',
    '9': '2 ### #.# ### ..# ##.',

    '!': '2 # # # . #',
    '"': '2 #.# #.#',
    '#': '2 .#.# #### .#.# #### #.#.',
    '$': '1 .#. .## #.. .#. ..# ##. .#.',
    '%': '2 #.. ..# .#. #.. ..#',   // bodky v protiľahlých rohoch — '#.# … #.#' sa čítalo ako X
    '&': '2 .#. #.# .#. #.# .##',
    "'": '1 # #',            // vyššie než mäkčeň v ď ľ ť (riadky 2–3)
    '(': '2 .# #. #. #. .#',
    ')': '2 #. .# .# .# #.',
    '*': '2 #.# .#. #.#',
    '+': '3 .#. ### .#.',
    ',': '6 .# #.',
    '-': '4 ##',
    '.': '6 #',
    '/': '2 ..# ..# .#. #.. #..',
    ':': '3 # . . #',
    ';': '3 .# .. .. .# #.',
    '<': '2 ..# .#. #.. .#. ..#',
    '=': '3 ### ... ###',
    '>': '2 #.. .#. ..# .#. #..',
    '?': '2 ##. ..# .#. ... .#.',
    '@': '2 .##. #.## #.## #... .##.',
    '[': '2 ## #. #. #. ##',
    '\\': '2 #.. #.. .#. ..# ..#',
    ']': '2 ## .# .# .# ##',
    '^': '2 .#. #.#',
    '_': '7 ###',
    '`': '1 #. .#',
    '{': '2 .## .#. ##. .#. .##',
    '|': '2 # # # # #',
    '}': '2 ##. .#. .## .#. ##.',
    '~': '3 .#.# #.#.',

    '€': '2 ..## .#.. ###. .#.. ..##',
    '°': '2 .#. #.# .#.',
    '×': '3 #.# .#. #.#',
    '·': '4 #',
    '…': '6 #.#.#',
    '–': '4 ###',
    '—': '4 #####',
    '±': '2 .#. ### .#. ... ###',
    '−': '4 ####',
    '∞': '3 .#.#. #.#.# #.#.# .#.#.',
    '✓': '3 ...# ..#. #.#. .#..',
    '←': '3 .#... ##### .#...',
    '→': '3 ...#. ##### ...#.',
    '↑': '2 .#. ### .#. .#. .#.',
    '↓': '2 .#. .#. .#. ### .#.',
    '★': '2 ..#.. ##### .###. .#.#. #...#',
    '♥': '2 .#.#. ##### ##### .###. ..#..',
    '„': '6 .#.# #.#.',
    '“': '1 #.#. .#.#',
    '”': '1 .#.# #.#.',
    '‚': '6 .# #.',
    '‘': '1 #. .#',
    '’': '1 .# #.',
    '«': '3 .#.# #.#. .#.#',
    '»': '3 #.#. .#.# #.#.',
    'ĺ': '0 .# #. .. #. #. #. .#',
    'Ů': '0 .#. #.# .#. #.# #.# #.# ###',
    'ł': '2 .#. .## ##. .#. ..#',
    'Ł': '2 .#.. .##. ##.. .#.. .###',
    'ß': '2 .##. #..# #.#. #..# #.#.',
    'ẞ': '2 .##. #..# #.#. #..# #.##',
    'æ': '3 ##.#. .#### #.#.. #####',
    'œ': '3 .#.#. #.### #.#.. .#.##',
    'Æ': '2 .#### #.#.. ####. #.#.. #.###',
    'Œ': '2 .#### #.#.. #.##. #.#.. .####',
    '¡': '3 # . # # #',
    '¿': '3 .#. ... .#. #.. .##',
    '▾': '3 ### .#.',
    '▸': '3 #. ## #.',
    '▴': '3 .#. ###',
    // drobné u má 4 px: zložený vokáň (3 px) by sa od ú líšil o 1 px — tu je vokáň cez celú šírku
    'û': '0 .##. #..# .... #..# #..# #..# .###',
  };
  // Drobný rez: značky pod písmenom majú len 1 riadok (7), vlnovka a dvojitá čiarka sú užšie
  // (malé o/n sú široké 3 px) a navzájom aj od prehlásky odlišné.
  var SMALL_MARKS = {};
  for (var mk0 in NORMAL_MARKS) SMALL_MARKS[mk0] = NORMAL_MARKS[mk0];
  SMALL_MARKS.tilde = '.#.# #.#.';
  SMALL_MARKS.dacute = '#.# #.#';
  SMALL_MARKS.cedilla = '#';
  SMALL_MARKS.ogonek = '#';

  // Zložené znaky: [základ, značka, posun značky v x]. 'apos' je mäkčeň v tvare
  // apostrofu vpravo od driekového ťahu (ď ľ ť Ľ) — stĺpec dáva tabuľka APOS.
  var COMPOSE = {
    'á': ['a', 'acute'], 'ä': ['a', 'uml'], 'č': ['c', 'caron'], 'ď': ['d', 'apos'],
    'é': ['e', 'acute'], 'ě': ['e', 'caron'], 'í': ['ı', 'acute'], 'ľ': ['l', 'apos'],
    'ň': ['n', 'caron'], 'ó': ['o', 'acute'], 'ô': ['o', 'circ'], 'ö': ['o', 'uml'],
    'ŕ': ['r', 'acute'], 'ř': ['r', 'caron'], 'š': ['s', 'caron'], 'ť': ['t', 'apos'],
    'ú': ['u', 'acute'], 'ů': ['u', 'ring'], 'ü': ['u', 'uml'], 'ý': ['y', 'acute'], 'ž': ['z', 'caron'],
    'Á': ['A', 'acute'], 'Ä': ['A', 'uml'], 'Č': ['C', 'caron'], 'Ď': ['D', 'caron'],
    'É': ['E', 'acute'], 'Ě': ['E', 'caron'], 'Í': ['I', 'acute'], 'Ĺ': ['L', 'acute'], 'Ľ': ['L', 'apos'],
    'Ň': ['N', 'caron'], 'Ó': ['O', 'acute'], 'Ô': ['O', 'circ'], 'Ö': ['O', 'uml'],
    'Ŕ': ['R', 'acute'], 'Ř': ['R', 'caron'], 'Š': ['S', 'caron'], 'Ť': ['T', 'caron'],
    'Ú': ['U', 'acute'], 'Ü': ['U', 'uml'], 'Ý': ['Y', 'acute'], 'Ž': ['Z', 'caron'],
    // poľština
    'ą': ['a', 'ogonek'], 'ć': ['c', 'acute'], 'ę': ['e', 'ogonek'], 'ń': ['n', 'acute'], 'ś': ['s', 'acute'],
    'ź': ['z', 'acute'], 'ż': ['z', 'dot'],
    'Ą': ['A', 'ogonek'], 'Ć': ['C', 'acute'], 'Ę': ['E', 'ogonek'], 'Ń': ['N', 'acute'], 'Ś': ['S', 'acute'],
    'Ź': ['Z', 'acute'], 'Ż': ['Z', 'dot'],
    // maďarčina
    'ő': ['o', 'dacute'], 'ű': ['u', 'dacute'], 'Ő': ['O', 'dacute'], 'Ű': ['U', 'dacute'],
    // francúzština
    'à': ['a', 'grave'], 'â': ['a', 'circ'], 'ç': ['c', 'cedilla'], 'è': ['e', 'grave'], 'ê': ['e', 'circ'],
    'ë': ['e', 'uml'], 'î': ['ı', 'circ'], 'ï': ['ı', 'uml'], 'ù': ['u', 'grave'], 'û': ['u', 'circ'], 'ÿ': ['y', 'uml'],
    'À': ['A', 'grave'], 'Â': ['A', 'circ'], 'Ç': ['C', 'cedilla'], 'È': ['E', 'grave'], 'Ê': ['E', 'circ'],
    'Ë': ['E', 'uml'], 'Î': ['I', 'circ'], 'Ï': ['I', 'uml'], 'Ù': ['U', 'grave'], 'Û': ['U', 'circ'], 'Ÿ': ['Y', 'uml'],
    // španielčina (á é í ó ú ü sú vyššie)
    'ñ': ['n', 'tilde'], 'Ñ': ['N', 'tilde'],
  };
  var APOS = {
    normal: { d: 5, l: 2, t: 3, L: 2 },
    small: { d: 4, l: 2, t: 4, L: 2 },
  };

  // Všetko, čo hra MUSÍ vedieť napísať (zmluva ARCHITECTURE §13 + znaky z dát).
  var REQUIRED = '';
  for (var c = 32; c < 127; c++) REQUIRED += String.fromCharCode(c);
  REQUIRED += 'áäčďéěíĺľňóôŕřšťúůýž' + 'ÁÄČĎÉĚÍĹĽŇÓÔŔŘŠŤÚŮÝŽ' + '€°×·…–—←→↑↓★♥±−∞✓' + '▸▴'; // ▸▴ = zbaliť/rozbaliť (Príprava)
  // Písmená ďalších jazykov hry (docs/I18N.md): nemčina, poľština, maďarčina, francúzština, španielčina
  // (čeština je vyššie) + ▾ na tlačidle výberu jazyka.
  F.REQUIRED_LANG = 'öüßÖÜẞ' + 'ąćęłńśźżĄĆĘŁŃŚŹŻ' + 'őűŐŰ' + 'àâæçèêëîïœùûÿÀÂÆÇÈÊËÎÏŒÙÛŸ' + 'ñÑ¿¡' + '▾';
  REQUIRED += F.REQUIRED_LANG;
  F.REQUIRED = REQUIRED;

  // ------------------------------------------------------------------ stavba rezov
  function parse(src, h, ch) {
    var parts = src.split(' ');
    var top = +parts[0];
    var rows = parts.slice(1);
    var w = rows[0].length;
    var bits = new Uint8Array(w * h);
    for (var r = 0; r < rows.length; r++) {
      HL.assert(rows[r].length === w, 'font: glyf ' + ch + ' má riadky rôznej šírky');
      HL.assert(top + r < h, 'font: glyf ' + ch + ' presahuje výšku bunky');
      for (var x = 0; x < w; x++) if (rows[r].charAt(x) === '#') bits[(top + r) * w + x] = 1;
    }
    return { w: w, bits: bits, top: top };
  }
  function parseMark(src) {
    var rows = src.split(' ');
    return { w: rows[0].length, h: rows.length, rows: rows };
  }

  // Značka nad písmenom: nad verzálkou/driekom tesne (na viac nie je miesto),
  // nad malým písmenom s medzerou jedného riadku, aby sa nezlepila s telom.
  // Značka pod písmenom (cedilla, ogonek): riadok hneď pod účiarím, v strede alebo vpravo.
  function compose(face, base, mark, dx, ch, marks) {
    var b = face.map[base];
    HL.assert(b, 'font: chýba základ ' + base + ' pre ' + ch);
    var m = marks[mark];
    HL.assert(m, 'font: chýba značka ' + mark + ' pre ' + ch);
    var h = face.h;
    var mx, my;
    if (BELOW[mark]) {
      my = face.base + 1;
      HL.assert(my + m.h <= h, 'font: značka ' + mark + ' sa nezmestí pod ' + ch);
      mx = BELOW[mark] === 'right' ? b.w - m.w : Math.round((b.w - m.w) / 2);
      mx += dx || 0;
    } else if (mark === 'apos') {
      mx = APOS[face.name][base];
      HL.assert(mx != null, 'font: apostrof pre ' + base + ' nemá stĺpec');
      my = face.capTop;
    } else {
      var tall = b.top <= face.capTop;
      var bottom = tall ? b.top - 1 : face.xTop - 2;
      my = Math.max(0, bottom - m.h + 1);
      mx = Math.round((b.w - m.w) / 2) + (dx || 0);
    }
    var minX = Math.min(0, mx), maxX = Math.max(b.w, mx + m.w);
    var w = maxX - minX;
    var bits = new Uint8Array(w * h);
    for (var y = 0; y < h; y++) for (var x = 0; x < b.w; x++) if (b.bits[y * b.w + x]) bits[y * w + x - minX] = 1;
    for (var r = 0; r < m.h; r++) {
      for (var k = 0; k < m.w; k++) if (m.rows[r].charAt(k) === '#') bits[(my + r) * w + mx + k - minX] = 1;
    }
    return { w: w, bits: bits, top: Math.min(b.top, my) };
  }

  function makeFace(name, h, capTop, xTop, base, space, table, markSrc, box) {
    var face = { name: name, h: h, capTop: capTop, xTop: xTop, base: base, map: {}, order: [], atlas: null, tinted: {}, nTinted: 0 };
    var marks = {};
    for (var mk in markSrc) marks[mk] = parseMark(markSrc[mk]);
    var ch;
    for (ch in table) face.map[ch] = parse(table[ch], h, ch);
    var sp = { w: space, bits: new Uint8Array(space * h), top: h };
    face.map[' '] = sp;
    face.map[' '] = sp;  // nezlomiteľná medzera: rovnako široká, ale wrap ju nedelí
    for (ch in COMPOSE) {
      if (face.map[ch]) continue; // ručne kreslená výnimka má prednosť
      var e = COMPOSE[ch];
      face.map[ch] = compose(face, e[0], e[1], e[2], ch, marks);
    }
    face.box = parse(box, h, 'box');
    // Pozície v atlase: glyfy vedľa seba s 1 px medzerou.
    var ax = 0;
    for (ch in face.map) {
      var g = face.map[ch];
      if (face.order.indexOf(g) >= 0) continue;
      g.ax = ax; ax += g.w + 1;
      face.order.push(g);
    }
    face.box.ax = ax; ax += face.box.w + 1;
    face.order.push(face.box);
    face.atlasW = ax;
    return face;
  }

  var FACES = {
    // účiarie (posledný riadok verzálok): normálne 8, drobné 6 — pod ním dotiahnutia a cedilla/ogonek
    normal: makeFace('normal', 11, 2, 4, 8, 3, NORMAL, NORMAL_MARKS, '2 ##### #...# #...# #...# #...# #...# #####'),
    small: makeFace('small', 8, 2, 3, 6, 2, SMALL, SMALL_MARKS, '2 ### #.# #.# #.# ###'),
  };
  F.faces = FACES;

  function faceOf(opts) { return opts && opts.small ? FACES.small : FACES.normal; }
  function scaleOf(opts) {
    var s = opts && opts.scale;
    return s > 1 ? Math.round(s) : 1;
  }

  // Glyf pre znak; neznámy znak = štvorček + záznam do F.missing (raz za znak).
  function glyph(face, ch) {
    var g = face.map[ch];
    if (g) return g;
    if (ch === '\t') return face.map[' '];
    if (F.missing.indexOf(ch) < 0) F.missing.push(ch);
    return face.box;
  }

  F.has = function (ch, opts) { return !!faceOf(opts).map[ch]; };
  // Bitmapa glyfu ako riadky '#'/'.' (celá výška bunky) — pre testy a harness.
  F.glyphRows = function (ch, opts) {
    var face = faceOf(opts), g = face.map[ch];
    if (!g) return null;
    var rows = [];
    for (var y = 0; y < face.h; y++) {
      var s = '';
      for (var x = 0; x < g.w; x++) s += g.bits[y * g.w + x] ? '#' : '.';
      rows.push(s);
    }
    return rows;
  };
  F.chars = function (opts) { return Object.keys(faceOf(opts).map); };

  // ------------------------------------------------------------------ meranie
  function measureLine(face, text) {
    var w = 0, n = 0;
    for (var ch of text) {
      if (ch === '\r') continue;
      w += glyph(face, ch).w + 1;
      n++;
    }
    return n ? w - 1 : 0;
  }

  F.measure = function (text, opts) {
    text = text == null ? '' : String(text);
    var face = faceOf(opts), s = scaleOf(opts);
    if (text.indexOf('\n') < 0) return measureLine(face, text) * s;
    var lines = text.split('\n'), best = 0;
    for (var i = 0; i < lines.length; i++) best = Math.max(best, measureLine(face, lines[i]));
    return best * s;
  };

  F.lineHeight = function (opts) {
    if (opts && opts.lineHeight) return opts.lineHeight;
    return faceOf(opts).h * scaleOf(opts);
  };

  // Krok riadkov pre text POD SEBOU (lineHeight + medzera navyše). lineHeight je výška bunky
  // a pri ňom sa diakritika prilepí k riadku nad ňou: malé písmo má značku 1 px nad telom
  // písmena, ale pod čiarou predošlého riadku je tiež len 1 prázdny riadok (pod dotiahnutím
  // g/j/p/y žiadny) — 'zajtra' nad 'Búrka' sa čítalo 'zajtŗa', 'Dnes' nad 'Prvá' ako 'Dneş'
  // (vizuálna kritika D2). Aby značka patrila k SVOJMU písmenu, musí byť od riadku nad ňou
  // ďalej než od neho: malé písmo 8 + 2 = 10 px, normálne 11 + 1 = 12 px (merané:
  // tools/fix_village_round3.js). lineHeight sa NEMENÍ (zmluva gfx.test.js a rozloženia
  // ostatných scén) — scény, ktoré skladajú text pod seba, berú lineStep.
  var T = HL.T;
  if (T && T.def) {
    T.def('UI', 'fontSmallLeading', 2, 0, 4, 1, 'Malé písmo: medzera navyše medzi riadkami pod sebou (px) — diakritika sa nesmie lepiť hore');
    T.def('UI', 'fontLeading', 1, 0, 4, 1, 'Normálne písmo: medzera navyše medzi riadkami pod sebou (px)');
  }
  F.lineStep = function (opts) {
    var lead = opts && opts.small ? (T ? T.fontSmallLeading : 2) : (T ? T.fontLeading : 1);
    return F.lineHeight(opts) + Math.round(lead) * scaleOf(opts);
  };

  // Texty, ktoré fit() naozaj skrátil výpustkou (preklad je dlhší než miesto) — každý raz, najviac 200.
  // tools/lang_check.js ich hlási po scénach ako problém. { text, maxWidth, small }
  F.truncated = [];
  var truncSeen = {};
  function noteTrunc(text, maxWidth, opts) {
    var k = text + '\u0000' + maxWidth;
    if (truncSeen[k] || F.truncated.length >= 200) return;
    truncSeen[k] = true;
    F.truncated.push({ text: text, maxWidth: maxWidth, small: !!(opts && opts.small) });
  }
  F.clearTruncated = function () { F.truncated.length = 0; truncSeen = {}; };

  // Skráti text tak, aby sa zmestil do maxWidth, a dá na koniec výpustku.
  F.fit = function (text, maxWidth, opts) {
    text = String(text == null ? '' : text);
    if (F.measure(text, opts) <= maxWidth) return text;
    noteTrunc(text, maxWidth, opts);
    var chars = Array.from(text);
    while (chars.length) {
      chars.pop();
      while (chars.length && chars[chars.length - 1] === ' ') chars.pop();
      var cand = chars.join('') + '…';
      if (F.measure(cand, opts) <= maxWidth) return cand;
    }
    return F.measure('…', opts) <= maxWidth ? '…' : '';
  };

  // Jednopísmenové predložky a spojky nesmú ostať na konci riadka (slovenská sadzba:
  // „v / meste" je chyba) — prilepia sa k nasledujúcemu slovu.
  var GLUE = /^[aikosuvzAIKOSUVZ]$/;
  // Číslo sa neodtrhne od toho, čo ide za ním: tisíce ("1 | 250 €"), jednotka ("250 | m", "45 | %") ani
  // počítaný predmet ("3 | ryby"). Trieda chyby, nie jedno miesto: platí pre KAŽDÝ F.wrap (predtým to riešili
  // tri rôzne pomocníky len na časti volaní — HL.ui.nb, nbsp v ui/dive.js, regex v ui/title.js).
  var NUM_END = /\d$/, NUM_NEXT = /^[0-9€%À-ɏA-Za-z]/;
  var PUNCT = /[,.;:!?…)»“”%]/;
  var TAIL_GLUE = /^(.*\S) +([aikosuvzAIKOSUVZ]) *$/;

  // Lámanie po znakoch; plné riadky pridá do out, vráti rozpracovaný zvyšok.
  // Riadok nezačne interpunkciou (vezme so sebou posledné písmeno) a neskončí
  // jednopísmenovou predložkou (tá prejde na ďalší riadok).
  function hardBreak(s, maxWidth, opts, out) {
    var part = '';
    for (var ch of s) {
      if (part && F.measure(part + ch, opts) > maxWidth) {
        var move = '';
        if (PUNCT.test(ch)) {
          var arr = Array.from(part);
          if (arr.length > 1) { move = arr.pop(); part = arr.join(''); }
        }
        var m = TAIL_GLUE.exec(part);
        if (m) { part = m[1]; move = m[2] + ' ' + move; }
        part = part.replace(/ +$/, '');
        if (part) out.push(part);
        part = (move + ch).replace(/^ +/, '');
      } else part += ch;
    }
    return part;
  }

  F.wrap = function (text, maxWidth, opts) {
    var out = [];
    var paras = String(text == null ? '' : text).split('\n');
    for (var p = 0; p < paras.length; p++) {
      var words = paras[p].split(' ').filter(function (x) { return x !== ''; });
      var units = [], carry = '';
      for (var i = 0; i < words.length; i++) {
        var glue = GLUE.test(words[i]) || (NUM_END.test(words[i]) && NUM_NEXT.test(words[i + 1] || ''));
        if (glue && i < words.length - 1) { carry = carry ? carry + ' ' + words[i] : words[i]; continue; }
        units.push(carry ? carry + ' ' + words[i] : words[i]);
        carry = '';
      }
      if (carry) units.push(carry);
      var line = '';
      for (var u = 0; u < units.length; u++) {
        var cand = line ? line + ' ' + units[u] : units[u];
        if (F.measure(cand, opts) <= maxWidth) { line = cand; continue; }
        if (line) { out.push(line); line = ''; }
        if (F.measure(units[u], opts) <= maxWidth) { line = units[u]; continue; }
        // Jednotka (slovo, alebo predložka prilepená k slovu) je širšia ako riadok:
        // láme sa po znakoch celá, aby predložka neostala na konci riadka.
        line = hardBreak(units[u], maxWidth, opts, out);
      }
      out.push(line);
    }
    return out;
  };

  // ------------------------------------------------------------------ kreslenie
  function makeCanvas(w, h) {
    if (typeof document !== 'undefined' && document.createElement) {
      var c = document.createElement('canvas'); c.width = w; c.height = h; return c;
    }
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
    return null; // Node: meranie a zalamovanie fungujú, kreslenie je no-op
  }

  function maskOf(face) {
    if (face.atlas !== null) return face.atlas;
    var c = makeCanvas(face.atlasW, face.h);
    if (!c) { face.atlas = false; return false; }
    var x = c.getContext('2d');
    var img = x.createImageData(face.atlasW, face.h);
    var d = img.data;
    for (var i = 0; i < face.order.length; i++) {
      var g = face.order[i];
      for (var y = 0; y < face.h; y++) {
        for (var k = 0; k < g.w; k++) {
          if (!g.bits[y * g.w + k]) continue;
          var o = (y * face.atlasW + g.ax + k) * 4;
          d[o] = d[o + 1] = d[o + 2] = d[o + 3] = 255;
        }
      }
    }
    x.putImageData(img, 0, 0);
    face.atlas = c;
    return c;
  }

  function tinted(face, color) {
    var t = face.tinted[color];
    if (t) return t;
    var mask = maskOf(face);
    if (!mask) return null;
    if (face.nTinted > 64) { face.tinted = {}; face.nTinted = 0; } // poistka proti rastu cache
    var c = makeCanvas(face.atlasW, face.h);
    if (!c) return null;
    var x = c.getContext('2d');
    x.drawImage(mask, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = color;
    x.fillRect(0, 0, face.atlasW, face.h);
    face.tinted[color] = c;
    face.nTinted++;
    return c;
  }

  function colorOf(color) {
    if (!color) return HL.pal.white;
    if (color.charAt(0) !== '#' && HL.pal[color]) return HL.pal[color]; // meno z palety
    return color;
  }

  function drawRun(ctx, face, text, x, y, color, s) {
    var atlas = tinted(face, color);
    if (!atlas) return;
    var h = face.h;
    for (var ch of text) {
      if (ch === '\r') continue;
      var g = glyph(face, ch);
      if (g.w && g !== face.map[' ']) ctx.drawImage(atlas, g.ax, 0, g.w, h, x, y, g.w * s, h * s);
      x += (g.w + 1) * s;
    }
  }

  F.draw = function (ctx, text, x, y, color, opts) {
    text = text == null ? '' : String(text);
    opts = opts || {};
    if (text.indexOf('\n') >= 0) {
      var lines = text.split('\n'), lh = F.lineHeight(opts), best = 0;
      for (var i = 0; i < lines.length; i++) best = Math.max(best, F.draw(ctx, lines[i], x, y + i * lh, color, opts));
      return best;
    }
    var face = faceOf(opts), s = scaleOf(opts);
    if (opts.maxWidth != null) text = F.fit(text, opts.maxWidth, opts);
    var w = measureLine(face, text) * s;
    var x0 = Math.round(x), y0 = Math.round(y);
    if (opts.align === 'center') x0 -= Math.floor(w / 2);
    else if (opts.align === 'right') x0 -= w;
    ctx.imageSmoothingEnabled = false;
    if (opts.shadow) drawRun(ctx, face, text, x0 + s, y0 + s, colorOf(opts.shadow === true ? HL.pal.ink : opts.shadow), s);
    drawRun(ctx, face, text, x0, y0, colorOf(color), s);
    return w;
  };

  F.drawWrapped = function (ctx, text, x, y, maxWidth, color, opts) {
    opts = opts || {};
    var lines = F.wrap(text, maxWidth, opts);
    var lh = F.lineHeight(opts);
    var o = {};
    for (var k in opts) if (k !== 'maxWidth') o[k] = opts[k];
    for (var i = 0; i < lines.length; i++) F.draw(ctx, lines[i], x, y + i * lh, color, o);
    return lines.length * lh;
  };
})(globalThis.HL);
