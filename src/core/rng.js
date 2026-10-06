// Deterministický generátor (mulberry32). Všetko náhodné v simulácii ide cez
// HL.RNG, aby sa dal ponor aj celá kariéra zopakovať z jedného semena.
// Math.random sa v sim/ NEPOUŽÍVA (kontroluje tests/unit/architecture.test.js).
(function (HL) {
  function RNG(seed) {
    this.s = (seed >>> 0) || 0x9e3779b9;
  }
  RNG.prototype.next = function () {
    var t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  RNG.prototype.range = function (a, b) { return a + (b - a) * this.next(); };
  RNG.prototype.int = function (a, b) { return a + Math.floor(this.next() * (b - a + 1)); };
  RNG.prototype.chance = function (p) { return this.next() < p; };
  RNG.prototype.pick = function (arr) { return arr[Math.floor(this.next() * arr.length)]; };
  RNG.prototype.sign = function () { return this.next() < 0.5 ? -1 : 1; };
  // Vážený výber: items = [{w: 3, ...}, ...] alebo weightFn(item).
  RNG.prototype.weighted = function (items, weightFn) {
    var total = 0, i, w;
    for (i = 0; i < items.length; i++) total += Math.max(0, weightFn ? weightFn(items[i]) : items[i].w);
    if (total <= 0) return null;
    var r = this.next() * total;
    for (i = 0; i < items.length; i++) {
      w = Math.max(0, weightFn ? weightFn(items[i]) : items[i].w);
      if (r < w) return items[i];
      r -= w;
    }
    return items[items.length - 1];
  };
  RNG.prototype.shuffle = function (arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(this.next() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  };
  // Nezávislý podprúd — napr. počasie dňa 12 nezávisí od toho, koľko rýb sa predalo.
  RNG.prototype.fork = function (salt) { return new RNG(HL.hash(this.s, salt >>> 0)); };

  // Stabilný hash niekoľkých celých čísel -> uint32.
  HL.hash = function () {
    var h = 0x811c9dc5;
    for (var i = 0; i < arguments.length; i++) {
      var v = arguments[i];
      if (typeof v === 'string') {
        for (var k = 0; k < v.length; k++) { h ^= v.charCodeAt(k); h = Math.imul(h, 0x01000193); }
      } else {
        v = v >>> 0;
        for (var b = 0; b < 4; b++) { h ^= (v >>> (b * 8)) & 0xff; h = Math.imul(h, 0x01000193); }
      }
    }
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13;
    return h >>> 0;
  };
  // RNG odvodený z ľubovoľných kľúčov: HL.rngFor(seed, 'weather', 12)
  HL.rngFor = function () { return new RNG(HL.hash.apply(null, arguments)); };
  HL.RNG = RNG;
})(globalThis.HL);
