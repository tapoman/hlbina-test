// Drobné čisté pomôcky. Žiadny DOM.
(function (HL) {
  var U = HL.util = {};
  U.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  U.clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  U.lerp = function (a, b, t) { return a + (b - a) * t; };
  U.invLerp = function (a, b, v) { return b === a ? 0 : (v - a) / (b - a); };
  // Posun k cieľu najviac o `step` (bez prestrelenia).
  U.approach = function (v, target, step) {
    return v < target ? Math.min(v + step, target) : Math.max(v - step, target);
  };
  // Exponenciálne dotiahnutie nezávislé od dĺžky kroku: rate = podiel za sekundu.
  U.damp = function (v, target, rate, dt) { return U.lerp(target, v, Math.exp(-rate * dt)); };
  U.smooth = function (t) { t = U.clamp01(t); return t * t * (3 - 2 * t); };
  U.dist2 = function (ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
  U.isNum = function (v) { return typeof v === 'number' && isFinite(v); };
  U.sum = function (arr, fn) { var s = 0; for (var i = 0; i < arr.length; i++) s += fn ? fn(arr[i]) : arr[i]; return s; };
  U.byId = function (arr) { var m = {}; for (var i = 0; i < arr.length; i++) m[arr[i].id] = arr[i]; return m; };
  U.deepCopy = function (o) { return JSON.parse(JSON.stringify(o)); };

  // --- formátovanie čísel podľa jazyka (HL.i18n.fmt(); slovenčina = pôvodný výstup bajt po bajte) ---
  // sk: "1 235 €", "0,2 kg", "1 200 m", "45 %"   en: "€1,235", "0.2 kg", "1,200 m", "45%"   de: "1.235 €"
  var SK = { group: ' ', decimal: ',', currency: 'after', minGroup: 1, pctSpace: true };
  function fmt() { return HL.i18n && HL.i18n.fmt ? HL.i18n.fmt() : SK; }
  // Oddeľovač tisícov do celej časti čísla (reťazec číslic, prípadne so znamienkom). minGroup 2 = es/pl:
  // štvorciferné číslo bez oddeľovača (1000), od piatich číslic áno (10 000).
  function group(s, f) {
    var digits = s.replace(/^-/, '').length;
    if (digits <= 3 || (f.minGroup > 1 && digits < 4 + f.minGroup - 1)) return s;
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, f.group);
  }
  // Číslo s oddeľovačom tisícov a desatinnou čiarkou/bodkou jazyka: num(1234.5) -> "1 234,5" (sk).
  // decimals (voliteľné) = presne toľko desatinných miest; bez neho také, aké číslo má.
  U.num = function (v, decimals) {
    var f = fmt();
    var s = decimals != null ? Number(v).toFixed(decimals) : String(v);
    var neg = s.charAt(0) === '-', parts = (neg ? s.slice(1) : s).split('.');
    return (neg ? '-' : '') + group(parts[0], f) + (parts.length > 1 ? f.decimal + parts[1] : '');
  };
  // Desatinný oddeľovač jazyka (',' alebo '.').
  U.dec = function () { return fmt().decimal; };
  // 1234.5 -> "1 235 €" ; malé sumy s centami sa v hre nepoužívajú
  U.money = function (v) {
    var f = fmt(), n = Math.round(v);
    var s = group(String(Math.abs(n)), f);
    return (n < 0 ? '-' : '') + (f.currency === 'before' ? '€' + s : s + ' €');
  };
  // 0.2 -> "0,2 kg" ; 12 -> "12 kg"
  U.kg = function (v) {
    var f = fmt();
    var r = v < 10 ? Math.round(v * 10) / 10 : Math.round(v);
    // tisíce oddelené ako pri peniazoch a metroch (legendy vážia tisíce kg)
    var s = String(r), neg = s.charAt(0) === '-', parts = (neg ? s.slice(1) : s).split('.');
    return (neg ? '-' : '') + group(parts[0], f) + (parts.length > 1 ? f.decimal + parts[1] : '') + ' kg';
  };
  U.meters = function (v) { return group(String(Math.round(v)), fmt()) + ' m'; };
  U.pct = function (v) { return Math.round(v * 100) + (fmt().pctSpace ? ' %' : '%'); };
  U.pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
  // ZASTARANÉ (docs/I18N.md): slovenské skloňovanie s tvarmi v kóde. Nové texty cez
  // HL.i18n.plural(n, 'kľúč') — tvary sú v tabuľke jazyka. Ostáva, kým ho používajú neprevedené scény.
  // plural(3, 'ryba', 'ryby', 'rýb')
  U.plural = function (n, one, few, many) {
    n = Math.abs(n);
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return few;
    return many;
  };
})(globalThis.HL);
