// Procedurálny pixel art (dizajn 14.1). Nič sa nenačítava zo súborov — každý obrázok
// sa pri prvom použití nakreslí kódom do bitmapy s INDEXMI farieb palety a až potom
// sa prevedie na canvas. Prečo indexy a nie rovno canvas:
//   - farba mimo palety sa nedá ani zapísať (Bmp.ci hodí chybu pri preklepe),
//   - bitmapa beží aj v Node, takže testy overia tvar, veľkosť a farby bez prehliadača,
//   - svietiaca vrstva (glow) je druhé pole indexov v tej istej bitmape, takže maska
//     svetiel sedí na pixel presne na obrázku.
// Štýl (dohodnutý smer): bokorys, bez vyhladzovania a prechodov (iba dithering),
// 1 px tmavý obrys, tieňovanie 2–3 tónmi zhora, jasný odlesk v oku, ryby hľadia DOPRAVA.
(function (HL) {
  'use strict';
  var S = HL.spr = {};
  // Obrys rýb (slepý kritik kolo 0, F1): 0 = atrament ako predtým, 1–3 = o toľko stupňov rampy tmavší než susedné telo.
  // Platí po ďalšom načítaní (sprity sa stavajú raz). ODHAD — posuvník F2 „Ryby".
  if (HL.T && HL.T.def) HL.T.def('Ryby', 'fishOutline', 1, 0, 3, 1, 'Ryby: obrys (0 = atrament, 1–3 = o toľko stupňov tmavší než telo; po obnovení)');

  // ------------------------------------------------------------------ paleta
  var NAMES = null, IDX = null, RGB = null;
  function pal() {
    if (NAMES) return;
    NAMES = HL.pal.names; IDX = {}; RGB = [null];
    for (var i = 0; i < NAMES.length; i++) {
      IDX[NAMES[i]] = i + 1;
      RGB.push(HL.pal.toRGB(HL.pal[NAMES[i]]));
    }
  }

  // Bayerova matica 4×4: dithering je v celej hre jediný spôsob "polopriehľadnosti"
  // a prechodu, lebo miešanie farieb by vyrobilo odtiene mimo palety.
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function dith(x, y, level) { return BAYER[(y & 3) * 4 + (x & 3)] < level * 16; }
  // Nepravidelný, ale stály šum (mramorovanie, škvrny): Bayer by dal pravidelnú
  // mriežku bodiek, ktorá pôsobí ako tkanina, nie ako koža ryby.
  function noise(x, y, salt) { return HL.hash(x | 0, y | 0, salt | 0) / 4294967296; }

  // ------------------------------------------------------------------ bitmapa
  function Bmp(w, h) {
    this.w = w; this.h = h;
    this.d = new Uint8Array(w * h);   // 0 = priehľadné, i+1 = HL.pal.names[i]
    this.g = new Uint8Array(w * h);   // svietiaca vrstva, rovnaké kódovanie
    this.meta = {};
  }
  var B = Bmp.prototype;
  B.ci = function (c) {
    if (typeof c === 'number') return c;
    var i = IDX[c];
    if (!i) throw new Error('HL.spr: farba mimo palety: ' + c);
    return i;
  };
  B.inside = function (x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; };
  B.px = function (x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (!this.inside(x, y)) return;
    this.d[y * this.w + x] = c ? this.ci(c) : 0;
  };
  // Pixel, ktorý svieti: kreslí sa do obrázka aj do masky svetla (gc = farba v tme).
  B.glow = function (x, y, c, gc) {
    x = Math.round(x); y = Math.round(y);
    if (!this.inside(x, y)) return;
    this.d[y * this.w + x] = this.ci(c);
    this.g[y * this.w + x] = this.ci(gc || c);
  };
  B.at = function (x, y) {
    x = Math.round(x); y = Math.round(y);
    return this.inside(x, y) ? this.d[y * this.w + x] : 0;
  };
  B.is = function (x, y, c) { return this.at(x, y) === this.ci(c); };
  B.rect = function (x, y, w, h, c) {
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.px(x + i, y + j, c);
  };
  B.line = function (x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1, e = dx + dy;
    for (;;) {
      this.px(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      var e2 = 2 * e;
      if (e2 >= dy) { e += dy; x0 += sx; }
      if (e2 <= dx) { e += dx; y0 += sy; }
    }
  };
  // Tvary sa testujú v strede pixela (x+0,5), preto sú súradnice "hrany pixelov".
  B.ell = function (cx, cy, rx, ry, c) {
    var self = this;
    shapeEll(cx, cy, rx, ry, function (x, y) { self.px(x, y, c); });
  };
  B.poly = function (pts, c) {
    var self = this;
    shapePoly(pts, function (x, y) { self.px(x, y, c); });
  };
  B.each = function (fn) {
    for (var y = 0; y < this.h; y++) for (var x = 0; x < this.w; x++) {
      var v = this.d[y * this.w + x];
      if (v) fn(x, y, v);
    }
  };
  B.count = function () { var n = 0; for (var i = 0; i < this.d.length; i++) if (this.d[i]) n++; return n; };
  B.glowCount = function () { var n = 0; for (var i = 0; i < this.g.length; i++) if (this.g[i]) n++; return n; };
  // 1 px obrys okolo všetkého nepriehľadného (4-susedstvo — rohy ostanú mäkké, ako
  // pri ručnom pixel arte). Obrys sa kreslí len do priehľadných pixelov.
  B.outline = function (c, onlyIf) {
    var ci = this.ci(c), w = this.w, h = this.h, d = this.d, add = [];
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      if (d[y * w + x]) continue;
      if ((x > 0 && d[y * w + x - 1]) || (x < w - 1 && d[y * w + x + 1]) ||
          (y > 0 && d[(y - 1) * w + x]) || (y < h - 1 && d[(y + 1) * w + x])) {
        if (!onlyIf || onlyIf(x, y)) add.push(y * w + x);
      }
    }
    for (var i = 0; i < add.length; i++) d[add[i]] = ci;
    // rampOutline ich vie neskôr prefarbiť; gen = poradie volania (druhý obrys okolo prvého = dvojitý obrys)
    var gen = this._outlineGen = (this._outlineGen || 0) + 1;
    if (!this._outlineOf) this._outlineOf = {};
    for (i = 0; i < add.length; i++) this._outlineOf[add[i]] = gen;
    this._outlinePx = (this._outlinePx || []).concat(add);
  };
  // Obrys TMAVŠÍM TÓNOM VLASTNEJ RAMPY (ART_SPEC §5): každý pixel, ktorý pridal outline() a ostal vo farbe obrysu,
  // dostane farbu o `steps` stupňov palety tmavšiu než najtmavší susedný pixel tela (nie obrysu). Slepý kritik, ryby
  // kolo 0 (F1): atramentový obrys na 35 z 39 rýb bol tretina pixelov každej ryby — nálepky, nie ryby vo vode.
  B.rampOutline = function (steps) {
    var list = this._outlinePx;
    if (!list || !list.length || !(steps > 0)) return 0;
    var w = this.w, h = this.h, d = this.d, set = {}, names = HL.pal.names, P = HL.pal, done = 0, i, out = [];
    for (i = 0; i < list.length; i++) set[list[i]] = d[list[i]];
    var gen = this._outlineOf || {}, drop = [];
    for (i = 0; i < list.length; i++) {
      var p = list[i], x = p % w, y = (p - x) / w, best = 0, bestL = 1e9, older = false;
      if (d[p] !== set[p]) { out.push(0); continue; }                    // pixel neskôr prekreslený — nechať
      var nb = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1];
      for (var k = 0; k < 4; k++) {
        var j = nb[k];
        if (j < 0 || !d[j]) continue;
        if (set[j] !== undefined) { if (gen[j] < gen[p]) older = true; continue; }
        var dn = P.darker(names[d[j] - 1], steps), v = parseInt(dn.slice(1), 16);
        var L = 0.2126 * (v >> 16) + 0.7152 * ((v >> 8) & 255) + 0.0722 * (v & 255);
        if (L < bestL) { bestL = L; best = dn; }
      }
      // obrys okolo staršieho obrysu, ktorý sa nedotýka tela = dvojitý obrys (2 px) → preč (ART_SPEC §5: 1 px)
      if (!best && older) drop.push(p);
      out.push(best);
    }
    for (i = 0; i < list.length; i++) {
      if (!out[i]) continue;
      for (var n = 0; n < names.length; n++) if (P[names[n]] === out[i]) { d[list[i]] = n + 1; done++; break; }
    }
    for (i = 0; i < drop.length; i++) d[drop[i]] = 0;
    return done;
  };
  // Nahradí farbu v celom obrázku (alebo len kde platí podmienka).
  B.swap = function (from, to, where) {
    var f = this.ci(from), t = to ? this.ci(to) : 0;
    for (var y = 0; y < this.h; y++) for (var x = 0; x < this.w; x++) {
      var i = y * this.w + x;
      if (this.d[i] === f && (!where || where(x, y))) this.d[i] = t;
    }
  };
  // Pixel je na okraji tvaru (má priehľadného suseda, alebo suseda vo farbe obrysu —
  // aby to fungovalo aj PO nakreslení obrysu).
  B.edge = function (x, y, outlineC) {
    if (!this.at(x, y)) return false;
    var o = outlineC ? this.ci(outlineC) : -1, self = this;
    function out(xx, yy) { var v = self.at(xx, yy); return !v || v === o; }
    return out(x - 1, y) || out(x + 1, y) || out(x, y - 1) || out(x, y + 1);
  };
  B.flipX = function () {
    var w = this.w;
    for (var y = 0; y < this.h; y++) for (var x = 0; x < (w >> 1); x++) {
      var a = y * w + x, b = y * w + (w - 1 - x);
      var t = this.d[a]; this.d[a] = this.d[b]; this.d[b] = t;
      t = this.g[a]; this.g[a] = this.g[b]; this.g[b] = t;
    }
  };

  function shapeEll(cx, cy, rx, ry, fn) {
    for (var y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) {
      for (var x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
        var dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) fn(x, y);
      }
    }
  }
  function shapePoly(pts, fn) {
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, i;
    for (i = 0; i < pts.length; i++) {
      minX = Math.min(minX, pts[i][0]); maxX = Math.max(maxX, pts[i][0]);
      minY = Math.min(minY, pts[i][1]); maxY = Math.max(maxY, pts[i][1]);
    }
    for (var y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      for (var x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
        var px = x + 0.5, py = y + 0.5, inside = false;
        for (i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          var xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
          if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
        }
        if (inside) fn(x, y);
      }
    }
    var j;
  }

  function band(bands, rel) {
    for (var i = 0; i < bands.length; i++) if (rel <= bands[i][0] + 1e-9) return bands[i][1];
    return bands[bands.length - 1][1];
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // ------------------------------------------------------------------ ryby: telo
  // Polovičná výška tela v bode t (0 = chvostová stopka, 1 = špička nosa).
  // p = [stopka, maximum, nos, poloha maxima, tvar hlavy 'round'|'point'|'blunt']
  function halfH(t, p) {
    var ped = p[0], max = p[1], nose = p[2], peak = p[3], head = p[4] || 'round';
    if (t <= peak) {
      var s = t / peak;
      return ped + (max - ped) * (1 - (1 - s) * (1 - s));
    }
    var u = (t - peak) / (1 - peak);
    var f = head === 'point' ? 1 - u : head === 'blunt' ? Math.sqrt(Math.max(0, 1 - Math.pow(u, 4))) : Math.sqrt(Math.max(0, 1 - u * u));
    return nose + (max - nose) * f;
  }

  // Geometria tela: pre každý stĺpec x horný a spodný riadok. Na ňu sa potom
  // vešajú plutvy, vzory a oko, takže druh sa mení parametrami, nie súradnicami.
  function geom(o) {
    var cols = {};
    for (var x = o.x0; x <= o.x1; x++) {
      var t = (x - o.x0) / (o.x1 - o.x0);
      var cy = o.cy + (o.bend ? o.bend(t, x) : 0);
      var up = halfH(t, o.top), dn = halfH(t, o.bot);
      var y0 = Math.ceil(cy - up - 0.5), y1 = Math.floor(cy + dn - 0.5);
      if (y1 < y0) y1 = y0;
      cols[x] = { top: y0, bot: y1, t: t };
    }
    return {
      cols: cols, x0: o.x0, x1: o.x1,
      X: function (t) { return Math.round(o.x0 + (o.x1 - o.x0) * t); },
      c: function (x) { return cols[Math.max(o.x0, Math.min(o.x1, Math.round(x)))]; },
      mid: function (x) { var c = this.c(x); return (c.top + c.bot) / 2; },
      rel: function (x, r) { var c = this.c(x); return Math.round(c.top + (c.bot - c.top) * r); },
    };
  }

  // Farba podľa výšky v stĺpci: chrbát → bok → brucho; spodný pixel je v tieni
  // (svetlo zhora). Ryby sú v prírode tmavé zhora a svetlé zospodu — pásy to spájajú.
  function paintBody(b, G, bands, under) {
    for (var x = G.x0; x <= G.x1; x++) {
      var c = G.cols[x], n = c.bot - c.top;
      for (var y = c.top; y <= c.bot; y++) {
        var rel = n ? (y - c.top) / n : 0.5;
        var col = band(bands, rel);
        if (under && y === c.bot && n >= 2) col = under;
        b.px(x, y, col);
      }
    }
  }

  // Plutva nad (dir=-1) alebo pod (dir=1) telom medzi t=a..z.
  // shape: 'sail' vysoká vpredu, 'round', 'flat', 'back' vysoká vzadu.
  function fin(b, G, dir, a, z, h, c, opt) {
    opt = opt || {};
    var xa = G.X(a), xz = G.X(z);
    for (var x = xa; x <= xz; x++) {
      var s = xz === xa ? 1 : (x - xa) / (xz - xa), f;
      switch (opt.shape) {
        case 'round': f = Math.sin(Math.PI * (0.1 + 0.8 * s)); break;
        case 'flat': f = s < 0.15 || s > 0.85 ? 0.6 : 1; break;
        case 'back': f = s < 0.3 ? 1 : 1 - (s - 0.3) / 0.8; break;
        default: f = s < 0.8 ? 0.35 + 0.65 * s / 0.8 : 1 - (s - 0.8) / 0.25;
      }
      var n = Math.max(1, Math.round(h * f));
      var col = G.c(x);
      for (var k = 1; k <= n; k++) {
        var y = dir < 0 ? col.top - k : col.bot + k;
        var cc = c;
        if (opt.spine && (x - xa) % 2 === 0) cc = opt.spine;
        if (opt.edge && k === n) cc = opt.edge;
        b.px(x, y, cc);
      }
    }
  }

  // Chvostová plutva. sw = výkyv špičiek pre druhý snímok (mávnutie chvostom).
  function tail(b, G, o, f) {
    var x0 = G.x0, c0 = G.cols[x0], mid = (c0.top + c0.bot + 1) / 2;
    var L = o.len, sp = o.spread, sw = f ? (o.swing == null ? 1 : o.swing) : 0;
    var top = c0.top, bot = c0.bot + 1, tipX = x0 - L, pts;
    switch (o.type) {
      case 'round':
        pts = [[x0 + 1, top], [tipX + 1, mid - sp + sw], [tipX, mid + sw * 0.5], [tipX + 1, mid + sp + sw], [x0 + 1, bot]];
        break;
      case 'trunc':
        pts = [[x0 + 1, top], [tipX, mid - sp + sw], [tipX, mid + sp + sw], [x0 + 1, bot]];
        break;
      case 'lunate':
        pts = [[x0 + 1, top], [tipX, mid - sp + sw], [x0 - L * 0.35, mid + sw * 0.5], [tipX, mid + sp + sw], [x0 + 1, bot]];
        break;
      case 'point':
        pts = [[x0 + 1, top], [tipX, mid + sw], [x0 + 1, bot]];
        break;
      default: // 'fork'
        pts = [[x0 + 1, top], [tipX, mid - sp + sw], [x0 - L * (o.notch || 0.45), mid + sw * 0.5], [tipX, mid + sp + sw], [x0 + 1, bot]];
    }
    b.poly(pts, o.c);
    // Lúče plutvy: tmavšia čiara v strede dodá objem aj pri 16 px.
    if (o.c2) b.line(x0, Math.round(mid - 0.5), tipX + 1, Math.round(mid - 0.5 + sw * 0.5), o.c2);
  }

  // Oko: size 1 = tmavý bod, 2 = 2×2 s odleskom, 3 = dúhovka okolo zrenice.
  function eye(b, x, y, size, o) {
    o = o || {};
    var hi = o.hi || 'white', pu = o.pupil || 'ink';
    if (size === 1) { b.px(x, y, pu); if (o.glow) b.glow(x, y, o.glow); return; }
    if (size === 2) {
      b.px(x, y, pu); b.px(x + 1, y, hi); b.px(x, y + 1, pu); b.px(x + 1, y + 1, pu);
      if (o.glow) { b.glow(x, y, o.glow); b.glow(x, y + 1, o.glow); b.glow(x + 1, y + 1, o.glow); b.glow(x + 1, y, hi); }
      return;
    }
    var ir = o.iris || 'ink';
    b.rect(x, y, 3, 3, ir);
    b.px(x + 1, y + 1, pu); b.px(x + 2, y + 1, pu); b.px(x + 1, y + 2, pu);
    b.px(x + 2, y, hi);
    if (o.glow) for (var j = 0; j < 3; j++) for (var i = 0; i < 3; i++) b.glow(x + i, y + j, b.at(x + i, y + j) === b.ci(hi) ? hi : o.glow);
  }

  // Univerzálna ryba: chvost → plutvy → telo → vzor → oko → ústa → obrys.
  // Každý druh si z toho berie čo potrebuje a pridá vlastné detaily v o.pattern.
  function fishBody(b, f, o) {
    var G = geom(o);
    if (o.tail) tail(b, G, o.tail, f);
    (o.dorsal || []).forEach(function (d) { fin(b, G, -1, d.a, d.z, d.h, d.c, d); });
    (o.anal || []).forEach(function (d) { fin(b, G, 1, d.a, d.z, d.h, d.c, d); });
    paintBody(b, G, o.bands, o.under);
    if (o.pattern) o.pattern(b, G, f);
    if (o.gill) {
      var gx = G.X(o.gill.t);
      var gc = G.c(gx);
      for (var y = gc.top + 1 + (o.gill.skip || 0); y < gc.bot - (o.gill.skipBot || 0); y++) b.px(gx - (y > (gc.top + gc.bot) / 2 + 1 ? 1 : 0), y, o.gill.c);
    }
    if (o.pect) {
      var px0 = G.X(o.pect.t), py0 = G.rel(px0, o.pect.r == null ? 0.6 : o.pect.r);
      var L = o.pect.len, dy = f ? 1 : 0;
      b.poly([[px0 + 1, py0], [px0 - L, py0 + 1 + dy + (o.pect.drop || 0)], [px0 - L + 1, py0 + 2 + dy + (o.pect.drop || 0)], [px0 + 1, py0 + 2]], o.pect.c);
    }
    if (o.mouth) {
      var mx = o.x1, my = G.rel(o.x1, o.mouth.r == null ? 0.6 : o.mouth.r);
      for (var i = 0; i < (o.mouth.len || 1); i++) b.px(mx - i, my, o.mouth.c || 'ink');
    }
    if (o.eye) eye(b, o.eye.x, o.eye.y, o.eye.size, o.eye);
    b.outline(o.outline || 'ink');
    b.meta.mouth = [o.x1 + 1, G.rel(o.x1, 0.55)];
    return G;
  }

  // Úhorovitý tvar: stredová čiara sa vlní (vlna beží od hlavy k chvostu, druhý
  // snímok = posun fázy), hrúbka sa zužuje do chvosta. Plutvový lem ide po celej dĺžke.
  function eelBody(b, f, o) {
    var cols = {};
    for (var x = o.x0; x <= o.x1; x++) {
      var t = (x - o.x0) / (o.x1 - o.x0);
      var amp = o.amp * Math.pow(1 - t, 1.2);
      var cy = o.cy + amp * Math.sin(t * Math.PI * 2 * o.waves + (f ? Math.PI * 0.5 : 0) + (o.phase || 0));
      var th;
      if (t > o.headT) {
        var u = (t - o.headT) / (1 - o.headT);
        th = o.thick * (o.headMax || 1) * Math.sqrt(Math.max(0.05, 1 - Math.pow(u, o.snout || 2)));
      } else {
        th = lerp(o.tailThick || 0.5, o.thick, Math.pow(t / o.headT, 0.6));
      }
      var up = th, dn = th * (o.belly || 1);
      var y0 = Math.ceil(cy - up - 0.5), y1 = Math.floor(cy + dn - 0.5);
      if (y1 < y0) y1 = y0;
      cols[x] = { top: y0, bot: y1, t: t };
    }
    var G = {
      cols: cols, x0: o.x0, x1: o.x1,
      X: function (t) { return Math.round(o.x0 + (o.x1 - o.x0) * t); },
      c: function (x) { return cols[Math.max(o.x0, Math.min(o.x1, Math.round(x)))]; },
      mid: function (x) { var c = this.c(x); return (c.top + c.bot) / 2; },
      rel: function (x, r) { var c = this.c(x); return Math.round(c.top + (c.bot - c.top) * r); },
    };
    if (o.finC) {
      for (var fx = G.X(o.finFrom || 0); fx <= G.X(o.finTo || 0.8); fx++) {
        b.px(fx, cols[fx].top - 1, o.finC);
        if (o.finBot !== false && cols[fx].t < (o.finBotTo || 0.6)) b.px(fx, cols[fx].bot + 1, o.finC);
      }
    }
    paintBody(b, G, o.bands, o.under);
    return G;
  }

  // ------------------------------------------------------------------ register
  var GEN = {};      // meno -> { w, h, frames, fn(b, f), kind }
  var BMP = {};      // meno#snímok -> Bmp
  var CAN = {};      // meno#snímok#vrstva -> canvas
  var built = false;
  function def(name, w, h, frames, fn, kind) { GEN[name] = { w: w, h: h, frames: frames, fn: fn, kind: kind || 'prop' }; }
  function fishDef(id, w, h, fn) { def('fish_' + id, w, h, 2, fn, 'fish'); }

  // =================================================================== RYBY
  function defineFish() {
    // ---------------------------------------------------------------- Plytčina
    // Sardinka: štíhla, tmavomodrý chrbát, strieborný bok a rad tmavých bodiek.
    fishDef('sardinka', 16, 8, function (b, f) {
      fishBody(b, f, {
        x0: 5, x1: 14, cy: 3.5,
        top: [0.9, 2.3, 0.9, 0.55], bot: [0.9, 2.2, 0.8, 0.5],
        bands: [[0.25, 'blueDark'], [0.5, 'blue'], [0.75, 'greyLight'], [1, 'white']],
        tail: { type: 'fork', len: 3, spread: 2.2, c: 'grey', c2: 'slate' },
        dorsal: [{ a: 0.35, z: 0.55, h: 1, c: 'slate' }],
        pattern: function (b, G) { [7, 9, 11].forEach(function (x) { b.px(x, G.cols[x].top + 3, 'slate'); }); },
        eye: { x: 12, y: 2, size: 2 },
        mouth: { r: 0.7 },
      });
    });

    // Okúň: vysoké telo, ostnatá chrbtová plutva, zvislé tmavé pruhy, oranžové plutvy.
    fishDef('okun', 16, 12, function (b, f) {
      fishBody(b, f, {
        x0: 4, x1: 14, cy: 6.5,
        top: [1.2, 3.2, 1.3, 0.55], bot: [1.2, 2.8, 1.2, 0.5],
        bands: [[0.2, 'green'], [0.6, 'greenLight'], [0.85, 'yellow'], [1, 'sandLight']],
        tail: { type: 'trunc', len: 3, spread: 2.5, c: 'orange', c2: 'rust' },
        dorsal: [{ a: 0.45, z: 0.8, h: 2, c: 'greenDark', spine: 'greenLight' }, { a: 0.12, z: 0.4, h: 1.2, c: 'green', shape: 'flat' }],
        anal: [{ a: 0.2, z: 0.35, h: 1.2, c: 'orange' }, { a: 0.55, z: 0.62, h: 1.6, c: 'orange' }],
        pattern: function (b, G) {
          [5, 7, 9].forEach(function (x) {
            var c = G.cols[x];
            for (var y = c.top + 1; y <= c.top + Math.round((c.bot - c.top) * 0.7); y++) b.px(x, y, 'greenDark');
          });
        },
        eye: { x: 12, y: 4, size: 2 },
        mouth: { r: 0.65, len: 2 },
      });
    });

    // Krab: žiadny rybí tvar — široký červený pancier, klepetá hore, oči na stopkách.
    fishDef('krab', 16, 12, function (b, f) {
      // nohy (3 páry), v druhom snímku sa striedajú
      for (var i = 0; i < 3; i++) {
        var lift = (i + f) % 2;
        b.line(5 - i, 8, 3 - i, 10 - lift, 'redDark'); b.px(3 - i, 11 - lift, 'redDark');
        b.line(10 + i, 8, 12 + i, 10 - lift, 'redDark'); b.px(12 + i, 11 - lift, 'redDark');
      }
      // ramená a klepetá
      var cy = f ? 2 : 3;
      b.line(4, 6, 3, cy + 2, 'red'); b.line(11, 6, 12, cy + 2, 'red');
      [[1, cy], [12, cy]].forEach(function (p) {
        b.rect(p[0], p[1], 3, 3, 'red');
        b.px(p[0] + 1, p[1], 'orange');
        b.px(p[0] + 1, p[1] - 1, 'red'); // horný hrot
        b.px(p[0] + (p[0] < 8 ? 2 : 0), p[1] - 1, 'red');
        b.px(p[0] + 1, p[1] + 2, 'redDark');
      });
      // otvorené klepeto: medzera v strede hornej časti
      b.px(2, cy - 1, 0); b.px(13, cy - 1, 0);
      // pancier
      var G = { top: 4, bot: 9 };
      shapeEll(8, 7, 5, 3, function (x, y) {
        var rel = (y - 4) / 5;
        b.px(x, y, rel < 0.2 ? 'orange' : rel < 0.7 ? 'red' : 'redDark');
      });
      b.px(6, 5, 'pink'); b.px(7, 5, 'pink');
      // oči na stopkách
      b.px(6, 4, 'redDark'); b.px(9, 4, 'redDark');
      b.px(6, 3, 'ink'); b.px(9, 3, 'ink'); b.px(6, 2, 'white'); b.px(9, 2, 'white');
      b.px(7, 8, 'redDark'); b.px(8, 8, 'redDark');
      b.outline('ink');
      b.meta.mouth = [8, 9];
      return G;
    });

    // Platesa: plochá, oválna, lem plutiev dookola, OBE oči na hornej hrane, oranžové škvrny.
    fishDef('platesa', 16, 10, function (b, f) {
      var sw = f ? 1 : 0;
      b.poly([[4, 4], [1, 2 + sw], [1, 7 + sw], [4, 6]], 'clay');
      b.px(2, 4 + sw, 'woodLight'); b.px(2, 5 + sw, 'woodLight');
      // lem plutiev hore a dolu (jemné lúče)
      for (var x = 4; x <= 12; x++) {
        b.px(x, 2, (x % 2) ? 'clay' : 'sand');
        b.px(x, 7, (x % 2) ? 'clay' : 'sand');
      }
      shapeEll(8.5, 4.5, 6, 2.3, function (x, y) {
        b.px(x, y, y <= 3 ? 'sand' : y <= 5 ? 'clay' : 'woodLight');
      });
      [[6, 4], [9, 5], [8, 3], [11, 4]].forEach(function (p) { b.px(p[0], p[1], 'orange'); });
      // obe oči na hornej hrane pri hlave
      b.px(11, 1, 'ink'); b.px(12, 2, 'ink'); b.px(11, 2, 'white'); b.px(13, 2, 'white');
      b.px(14, 5, 'wood');
      b.outline('ink');
      b.meta.mouth = [15, 5];
    });

    // ---------------------------------------------------------------- Útesy
    // Makrela: štíhle vreteno, modrozelený chrbát s vlnitými čiernymi pruhmi, drobné plutvičky pri chvoste.
    fishDef('makrela', 16, 8, function (b, f) {
      fishBody(b, f, {
        x0: 4, x1: 14, cy: 3.5,
        top: [0.7, 2.2, 0.7, 0.45, 'point'], bot: [0.7, 2.1, 0.7, 0.45, 'point'],
        bands: [[0.45, 'blue'], [0.75, 'greyLight'], [1, 'white']],
        tail: { type: 'fork', len: 4, spread: 2.6, c: 'slate', c2: 'slateDark', notch: 0.55 },
        dorsal: [{ a: 0.45, z: 0.6, h: 1.2, c: 'slateDark' }],
        pattern: function (b, G) {
          // vlnité tmavé pruhy: každý druhý stĺpec, striedavo o riadok nižšie
          for (var x = G.x0 + 1; x <= G.x1 - 4; x += 2) {
            var c = G.cols[x], y0 = c.top + ((x >> 1) % 2);
            b.px(x, y0, 'navy'); b.px(x, y0 + 1, 'navy');
            b.px(x + 1, c.top, 'green');
          }
          // plutvičky pri chvoste
          b.px(G.x0 + 1, G.cols[G.x0 + 1].top - 1, 'slate'); b.px(G.x0 + 3, G.cols[G.x0 + 3].top - 1, 'slate');
          b.px(G.x0 + 1, G.cols[G.x0 + 1].bot + 1, 'slate');
        },
        eye: { x: 12, y: 2, size: 2 },
        mouth: { r: 0.7 },
      });
    });

    // Pyskáč: pestrý útesový pyskoun — zelený, žlté brucho, oranžové čiary na hlave, ružové pery.
    fishDef('pyskac', 16, 10, function (b, f) {
      fishBody(b, f, {
        x0: 4, x1: 13, cy: 5,
        top: [1.1, 2.7, 1.2, 0.5], bot: [1.1, 2.5, 1.1, 0.5],
        bands: [[0.25, 'blue'], [0.6, 'greenLight'], [1, 'yellow']], under: 'amber',
        tail: { type: 'round', len: 3, spread: 2.3, c: 'blue', c2: 'blueDark' },
        dorsal: [{ a: 0.1, z: 0.85, h: 1, c: 'orange', shape: 'flat' }],
        anal: [{ a: 0.15, z: 0.5, h: 1, c: 'orange', shape: 'flat' }],
        pattern: function (b, G) {
          for (var x = G.x0; x <= G.x1 - 3; x++) b.px(x, G.rel(x, 0.45), 'pink');
          b.px(10, 4, 'orange'); b.px(11, 5, 'orange'); b.px(10, 6, 'orange');
        },
        eye: { x: 11, y: 3, size: 2 },
      });
      b.px(14, 5, 'pink'); b.px(14, 6, 'pink'); b.px(15, 5, 'ink'); b.px(15, 6, 'ink');
      b.meta.mouth = [15, 5];
    });

    // Papagájovka: biely "zobák" zrastených zubov, lýrovitý chvost. Farby (kritik ryby kolo 3, F5): JEDNA rodina
    // tieňovaná po stupňoch — tmavozelený chrbát, zelený bok, piesočné brucho (ako olivový ostriež vo vzore) — a znak
    // druhu len na chvoste (ružový), plutvách (oranžové) a pruhu okolo oka (oranžový). Predtým dúha
    // cyan/greenLight/pink/yellow s bodkami po 1 px a modrou hlavou vo farbe vody Útesov.
    fishDef('papagajovka', 30, 16, function (b, f) {
      fishBody(b, f, {
        x0: 8, x1: 26, cy: 8,
        top: [1.8, 5.8, 2.4, 0.5, 'blunt'], bot: [1.8, 5.2, 2.0, 0.5],
        bands: [[0.2, 'greenDark'], [0.6, 'green'], [0.85, 'sand'], [1, 'sandLight']], under: 'sand',
        tail: { type: 'lunate', len: 7, spread: 5.5, c: 'pink', c2: 'pinkPurple' },
        // plutvy oranžové (kritik kolo 4: s ružovými sa plietla so zubaticou — tvar 85 % zhodný, líšil sa len chrbát)
        dorsal: [{ a: 0.15, z: 0.85, h: 2, c: 'orange', edge: 'rust', shape: 'flat' }],
        anal: [{ a: 0.15, z: 0.45, h: 2, c: 'orange', edge: 'rust', shape: 'flat' }],
        pattern: function (b, G) {
          // šupiny: krátke 2-px oblúčiky tmavšieho tónu v radoch (nie bodky po 1 px)
          for (var x = G.x0 + 2; x < G.X(0.7); x += 3) {
            var c = G.cols[x], row = ((x - G.x0) / 3) % 2 ? 2 : 4;
            for (var y = c.top + row; y < G.rel(x, 0.6) - 1; y += 4) { b.px(x, y, 'greenDark'); b.px(x + 1, y + 1, 'greenDark'); }
          }
          // pruh okolo oka
          b.line(22, 5, 24, 11, 'orange'); b.line(24, 10, 26, 10, 'orange');
        },
        pect: { t: 0.66, len: 4, c: 'pink', r: 0.55 },
        eye: { x: 23, y: 6, size: 2 },
      });
      // zobák
      b.px(27, 8, 'white'); b.px(27, 9, 'greyLight'); b.px(28, 8, 'white'); b.px(28, 10, 'greyLight'); b.px(27, 10, 'greyLight');
      b.px(28, 9, 'ink');
      b.outline('ink');
      b.meta.mouth = [29, 9];
    });

    // Zubatica: ružová, strmé čelo, modré bodky na chrbte, viditeľné zuby.
    fishDef('zubatica', 30, 16, function (b, f) {
      fishBody(b, f, {
        x0: 8, x1: 26, cy: 8,
        top: [1.6, 5.2, 1.6, 0.55, 'blunt'], bot: [1.6, 4.2, 1.8, 0.5],
        bands: [[0.2, 'pinkPurple'], [0.65, 'pink'], [1, 'skinLight']], under: 'skin',
        tail: { type: 'fork', len: 7, spread: 5, c: 'pinkPurple', c2: 'purple' },
        dorsal: [{ a: 0.2, z: 0.8, h: 2.4, c: 'pink', spine: 'pinkPurple', shape: 'flat' }],
        anal: [{ a: 0.2, z: 0.4, h: 2, c: 'pink' }],
        pattern: function (b, G) {
          [[12, 0.2], [15, 0.15], [18, 0.2], [21, 0.25], [14, 0.4], [17, 0.35]].forEach(function (p) { b.px(p[0], G.rel(p[0], p[1]), 'blue'); });
          for (var x = G.x0 + 2; x < G.X(0.85); x++) b.px(x, G.rel(x, 0.3), 'skinLight');
        },
        gill: { t: 0.78, c: 'pinkPurple', skip: 1 },
        pect: { t: 0.72, len: 4, c: 'skinLight', r: 0.55 },
        eye: { x: 22, y: 6, size: 3, iris: 'amber' },
      });
      // ústa s tesákmi
      b.px(26, 10, 'ink'); b.px(25, 10, 'ink'); b.px(24, 10, 'ink');
      b.px(26, 11, 'white'); b.px(24, 9, 'white'); b.px(27, 10, 'white');
      b.meta.mouth = [28, 10];
    });

    // Mureňa: dlhá, zelenohnedá so sieťovým vzorom, otvorená papuľa so zubami.
    fishDef('murena', 32, 13, function (b, f) {
      var G = eelBody(b, f, {
        x0: 1, x1: 29, cy: 6.5, amp: 1.6, waves: 0.9, thick: 3.2, headT: 0.78, headMax: 1.15, snout: 2.2,
        tailThick: 1, finC: 'greenDark', finFrom: 0.02, finTo: 0.8, finBotTo: 0.6,
        bands: [[0.2, 'green'], [0.7, 'greenDark'], [1, 'tealDark']], under: 'tealDark',
      });
      // mramorovanie: nepravidelné žltozelené škvrny (sieťový vzor mureny)
      for (var x = G.x0 + 1; x <= G.x1 - 2; x++) {
        var c = G.cols[x];
        for (var y = c.top; y <= c.bot; y++) {
          var n = noise(x >> 1, y >> 1, 7) * 0.6 + noise(x, y, 8) * 0.4;
          if (n > 0.62 && b.at(x, y)) b.px(x, y, n > 0.8 ? 'amber' : y < (c.top + c.bot) / 2 ? 'greenLight' : 'sand');
        }
      }
      // otvorená papuľa: klin do hlavy
      var hx = 29, cy = G.mid(hx);
      b.poly([[30.5, cy - 1.5], [24, cy + 0.5], [30.5, cy + 2.5]], 'redDark');
      b.px(29, Math.round(cy - 1), 'white'); b.px(27, Math.round(cy), 'white');
      b.px(29, Math.round(cy + 2), 'white'); b.px(27, Math.round(cy + 1), 'white');
      b.px(30, Math.round(cy - 1), 'green'); b.px(30, Math.round(cy + 2), 'greenDark');
      eye(b, 26, Math.round(cy) - 2, 2, { hi: 'yellow' });
      b.outline('ink');
      b.meta.mouth = [31, Math.round(cy + 1)];
    });

    // Barakuda: dlhá strieborná, špicatá vysunutá čeľusť, tmavé šikmé pruhy.
    fishDef('barakuda', 32, 11, function (b, f) {
      fishBody(b, f, {
        x0: 7, x1: 29, cy: 5,
        top: [1, 2.4, 0.6, 0.45, 'point'], bot: [1, 2.5, 1.2, 0.45, 'point'],
        bands: [[0.25, 'slate'], [0.5, 'grey'], [0.8, 'greyLight'], [1, 'white']], under: 'grey',
        tail: { type: 'fork', len: 6, spread: 3.8, c: 'slateDark', c2: 'slate', notch: 0.5 },
        dorsal: [{ a: 0.5, z: 0.62, h: 2, c: 'slateDark', shape: 'sail' }, { a: 0.18, z: 0.28, h: 1.6, c: 'slate' }],
        anal: [{ a: 0.18, z: 0.28, h: 1.4, c: 'slate' }],
        pattern: function (b, G) {
          for (var k = 0; k < 6; k++) {
            var x = G.x0 + 2 + k * 3;
            var c = G.cols[x];
            b.px(x, c.top, 'slateDark'); b.px(x + 1, c.top + 1, 'slateDark'); if (c.bot - c.top > 3) b.px(x + 1, c.top + 2, 'slateDark');
          }
          for (var x2 = G.x0 + 2; x2 < G.x1 - 3; x2++) b.px(x2, G.rel(x2, 0.5), 'greyLight');
        },
        pect: { t: 0.7, len: 3, c: 'slate', r: 0.6 },
        eye: { x: 25, y: 3, size: 2, hi: 'yellow' },
      });
      // predsunutá spodná čeľusť so zubom
      b.px(30, 6, 'grey'); b.px(29, 6, 'greyLight'); b.px(28, 5, 'ink'); b.px(29, 5, 'ink');
      b.px(27, 6, 'white');
      b.outline('ink');
      b.meta.mouth = [31, 6];
    });

    // ---------------------------------------------------------------- Súmrak
    // Svetlonoska: malá tmavá rybka s veľkým okom a radom svietiacich bodiek na bruchu.
    fishDef('svetlonoska', 16, 8, function (b, f) {
      fishBody(b, f, {
        x0: 5, x1: 14, cy: 3.5,
        top: [0.8, 2.3, 1.6, 0.6, 'blunt'], bot: [0.8, 2.3, 1.4, 0.6, 'blunt'],
        bands: [[0.25, 'slateDark'], [0.6, 'slate'], [1, 'grey']],
        tail: { type: 'fork', len: 4, spread: 2.5, c: 'slate', c2: 'slateDark' },
        dorsal: [{ a: 0.4, z: 0.6, h: 1, c: 'slate' }],
        // obrovské oko je znak svetlonosky
        eye: { x: 11, y: 1, size: 3, iris: 'greyLight' },
      });
      [6, 8, 10, 12].forEach(function (x) { b.glow(x, 5, 'cyan'); });
      b.glow(7, 3, 'cyan'); b.glow(14, 4, 'cyan');
      b.meta.mouth = [15, 4];
    });

    // Treska: hnedozelená mramorovaná, svetlá bočná čiara, tri chrbtové plutvy, fúz na brade.
    fishDef('treska', 30, 15, function (b, f) {
      fishBody(b, f, {
        x0: 7, x1: 26, cy: 7,
        top: [1.3, 4.4, 2.0, 0.45], bot: [1.3, 4.0, 1.6, 0.45],
        bands: [[0.35, 'woodLight'], [0.7, 'sand'], [1, 'sandLight']], under: 'sand',
        tail: { type: 'trunc', len: 5, spread: 4, c: 'woodLight', c2: 'wood' },
        dorsal: [{ a: 0.18, z: 0.35, h: 2, c: 'woodLight', shape: 'round' }, { a: 0.4, z: 0.58, h: 2.5, c: 'woodLight', shape: 'round' }, { a: 0.62, z: 0.78, h: 3, c: 'woodLight', shape: 'round' }],
        anal: [{ a: 0.15, z: 0.32, h: 2, c: 'sand', shape: 'round' }, { a: 0.38, z: 0.56, h: 2, c: 'sand', shape: 'round' }],
        pattern: function (b, G) {
          for (var x = G.x0; x <= G.x1; x++) {
            var c = G.cols[x];
            for (var y = c.top; y <= G.rel(x, 0.5); y++) {
              var n = noise(x >> 1, y >> 1, 3) * 0.7 + noise(x, y, 4) * 0.3;
              if (n > 0.55) b.px(x, y, n > 0.75 ? 'wood' : 'green');
            }
          }
          // svetlá bočná čiara, zahnutá nad prsnou plutvou
          for (x = G.x0 + 1; x < G.X(0.8); x++) b.px(x, G.rel(x, x > G.X(0.55) ? 0.35 : 0.45), 'sandLight');
        },
        gill: { t: 0.8, c: 'wood', skip: 1 },
        pect: { t: 0.74, len: 4, c: 'woodLight', r: 0.55 },
        eye: { x: 22, y: 4, size: 2 },
        mouth: { r: 0.62, len: 2 },
      });
      // fúz na brade — dotýka sa obrysu brady (kritik ryby kolo 3, F3: o riadok nižšie visel vo vode)
      b.px(25, 11, 'sandLight'); b.px(25, 12, 'sand');
      b.outline('ink', function (x, y) { return y >= 11; });
      b.meta.mouth = [27, 9];
    });

    // Úhor: tmavohnedý štíhly had so svetlým žltkastým bruchom, malá hlava, súvislý lem
    // plutvy. Hnedý zámerne: sivý by sa pletel s tieňovým úhorom (predátor), zelený s mureňou.
    fishDef('uhor', 32, 10, function (b, f) {
      var G = eelBody(b, f, {
        x0: 1, x1: 30, cy: 4.5, amp: 2, waves: 1.1, thick: 1.8, headT: 0.86, headMax: 1, snout: 1.5,
        tailThick: 0.6, finC: 'wood', finFrom: 0.0, finTo: 0.6, finBotTo: 0.45,
        bands: [[0.35, 'wood'], [0.7, 'woodLight'], [1, 'sand']], under: 'skin',
      });
      var hx = 27, c = G.c(hx);
      b.px(hx, c.top + 1, 'ink'); b.px(hx + 1, c.top + 1, 'white');
      b.px(30, G.rel(30, 0.7), 'ink'); b.px(29, G.rel(29, 0.7), 'ink');
      var px0 = 24, pc = G.c(px0);
      b.px(px0, pc.bot, 'sand'); b.px(px0 - 1, pc.bot + 1, 'woodLight');
      b.outline('ink');
      b.meta.mouth = [31, G.rel(30, 0.6)];
    });

    // Tuniak: mohutné vreteno, tmavomodrý chrbát, strieborný bok, žlté plutvičky pri chvoste, kosákový chvost.
    fishDef('tuniak', 32, 18, function (b, f) {
      fishBody(b, f, {
        x0: 9, x1: 29, cy: 9,
        top: [1, 5.2, 1.8, 0.45, 'round'], bot: [1, 5, 1.6, 0.45],
        bands: [[0.22, 'blueDark'], [0.32, 'blue'], [0.7, 'greyLight'], [1, 'white']], under: 'grey',
        tail: { type: 'lunate', len: 8, spread: 7.5, c: 'blueDark', c2: 'navy' },
        dorsal: [{ a: 0.55, z: 0.75, h: 2, c: 'blueDark' }, { a: 0.35, z: 0.45, h: 4, c: 'amber', shape: 'sail' }],
        anal: [{ a: 0.33, z: 0.43, h: 4, c: 'amber', shape: 'sail' }],
        pattern: function (b, G) {
          for (var x = G.x0 + 1; x < G.X(0.3); x += 2) {
            b.px(x, G.cols[x].top - 1, 'yellow'); b.px(x, G.cols[x].bot + 1, 'yellow');
          }
          b.px(G.x0, G.mid(G.x0), 'slate');
          for (x = G.X(0.1); x < G.X(0.85); x++) b.px(x, G.rel(x, 0.3), 'cyan');
        },
        gill: { t: 0.8, c: 'grey', skip: 3 },
        pect: { t: 0.72, len: 6, c: 'slateDark', r: 0.4, drop: 0 },
        eye: { x: 25, y: 6, size: 2 },
        mouth: { r: 0.62, len: 2 },
      });
    });

    // Mesačnica: okrúhla strieborná (ako opah), ružové brucho, biele svietivé bodky, červené plutvy.
    fishDef('mesacnica', 28, 22, function (b, f) {
      var G = fishBody(b, f, {
        x0: 7, x1: 25, cy: 11,
        top: [1.3, 8, 3, 0.5, 'round'], bot: [1.3, 7.5, 2.5, 0.5],
        bands: [[0.2, 'slate'], [0.45, 'grey'], [0.72, 'greyLight'], [1, 'pink']], under: 'pinkPurple',
        tail: { type: 'lunate', len: 6, spread: 5, c: 'red', c2: 'redDark' },
        dorsal: [{ a: 0.2, z: 0.75, h: 2.5, c: 'red', edge: 'redDark' }],
        anal: [{ a: 0.3, z: 0.62, h: 2, c: 'red', shape: 'flat' }],
        pect: { t: 0.62, len: 5, c: 'red', r: 0.45 },
        eye: { x: 21, y: 8, size: 3, iris: 'amber' },
        mouth: { r: 0.6, len: 2 },
      });
      // lesk: svietivé biele škvrny ako hviezdy na striebre
      [[11, 7], [14, 11], [17, 7], [12, 14], [16, 16], [19, 13], [10, 10], [15, 5]].forEach(function (p) { b.glow(p[0], p[1], 'white'); });
      // kosák odlesku na čele
      for (var x = 17; x <= 21; x++) b.glow(x, G.cols[x].top + 1 + (x > 20 ? 1 : 0), 'white', 'greyLight');
    });

    // ---------------------------------------------------------------- Polnoc
    // Hlbinár s lampášom: guľaté tmavé telo, obrovská papuľa s ihlovitými zubami,
    // prút na čele zakončený svietiacim lampášom.
    fishDef('lampasnik', 28, 22, function (b, f) {
      var bob = f ? 1 : 0;
      tail(b, { x0: 6, cols: { 6: { top: 11, bot: 14 } } }, { type: 'round', len: 4, spread: 4, c: 'wood', c2: 'plum' }, f);
      shapeEll(13, 13, 8, 7, function (x, y) {
        var rel = (y - 6) / 14;
        b.px(x, y, rel < 0.2 ? 'woodLight' : rel < 0.65 ? 'wood' : 'plum');
      });
      // chrbtové ostne
      b.px(10, 5, 'wood'); b.px(12, 5, 'wood'); b.px(11, 4, 'wood');
      // papuľa: klin z pravej strany, spodná čeľusť vysunutá
      b.poly([[22, 10], [15, 14], [23, 18], [24, 18]], 'ink');
      b.poly([[21, 18], [24, 17], [22, 20], [16, 19]], 'wood');
      [[21, 11], [19, 12], [17, 13]].forEach(function (p) { b.px(p[0], p[1], 'white'); });
      [[22, 16], [20, 16], [18, 15]].forEach(function (p) { b.px(p[0], p[1], 'white'); });
      // prút a lampáš
      b.line(15, 6, 17, 2, 'woodLight'); b.line(18, 1, 22, 1, 'woodLight'); b.line(23, 2, 24, 3 + bob, 'woodLight');
      b.outline('ink');
      b.glow(24, 4 + bob, 'white', 'yellow');
      b.glow(23, 5 + bob, 'yellow'); b.glow(25, 5 + bob, 'yellow'); b.glow(24, 6 + bob, 'amber');
      b.glow(24, 5 + bob, 'white', 'yellow');
      eye(b, 18, 9, 2, { hi: 'white' });
      b.px(8, 12, 'woodLight');
      b.meta.mouth = [23, 15];
    });

    // Pažravý úhor (vakovitý úhor): obrovská vačkovitá papuľa, drobné oko pri špičke,
    // dlhý bičovitý chvost so svietiacim ružovým koncom.
    fishDef('pazravy', 32, 16, function (b, f) {
      var G = eelBody(b, f, {
        x0: 2, x1: 19, cy: 9, amp: 2.2, waves: 1.1, thick: 1.4, headT: 0.8, headMax: 1.6, snout: 3,
        tailThick: 0.5, bands: [[0.3, 'pinkPurple'], [1, 'purple']], under: 'plum',
      });
      // obrovská papuľa roztvorená do "V": horná a spodná čeľusť z kĺbu za okom,
      // vnútro je tmavý vak — to je celý druh, telo je len bič za ňou
      var cl = f ? 1 : 0, hx = 18, hy = G.mid(18);
      b.poly([[hx, hy - 1], [30, 1 + cl], [31, 2 + cl], [30, 14 - cl], [hx, hy + 1.5]], 'plum');
      b.poly([[hx + 2, hy], [29, 3 + cl], [29, 12 - cl]], 'ink');
      b.line(hx, hy - 2, 30, 1 + cl, 'pinkPurple'); b.line(hx, hy - 1, 29, 2 + cl, 'purple');
      b.line(hx, hy + 2, 30, 14 - cl, 'pinkPurple'); b.line(hx + 1, hy + 2, 29, 13 - cl, 'purple');
      b.outline('ink');
      b.px(hx - 1, hy - 2, 'ink'); b.px(hx, hy - 2, 'white');
      // svietiaci koniec chvosta a bodky na okraji čeľuste
      var ty = G.cols[3].top;
      b.glow(1, ty, 'pink'); b.glow(2, ty, 'pink'); b.glow(1, ty - 1, 'pinkPurple'); b.glow(0, ty, 'pinkPurple');
      b.glow(3, ty, 'white', 'pink');
      [[24, 4 + cl], [28, 2 + cl], [26, 11 - cl]].forEach(function (p) { b.glow(p[0], p[1] - (p[1] < 8 ? 0 : -1), 'pink'); });
      b.meta.mouth = [31, 8];
    });

    // Hmlistá raja: prízračný kosoštvorec krídel (pohľad zboku-zhora), dlhý tenký chvost,
    // svetlé okraje a svietiace bodky na krídlach.
    fishDef('raja', 32, 16, function (b, f) {
      var fl = f ? 1 : 0;
      // chvost
      for (var x = 1; x <= 11; x++) b.px(x, 9 + Math.round(Math.sin(x * 0.7 + fl * 1.6)), x < 4 ? 'slate' : 'grey');
      b.poly([[10, 8], [18, 1 + fl], [30, 7], [29, 9], [16, 14 - fl]], 'grey');
      // tieňovanie: horné krídlo svetlé, spodné tmavšie
      b.each(function (x, y) {
        if (b.is(x, y, 'grey')) {
          if (y < 6) b.px(x, y, dith(x, y, 0.5) ? 'greyLight' : 'grey');
          else if (y > 9) b.px(x, y, dith(x, y, 0.5) ? 'slate' : 'grey');
        }
      });
      b.line(12, 7, 29, 8, 'slate');
      b.outline('ink');
      // svetlé okraje krídel
      for (var k = 0; k < 7; k++) b.glow(12 + k, 7 - Math.round(k * (6 - fl) / 7), 'white', 'greyLight');
      [[16, 11], [20, 5], [23, 6], [14, 5], [19, 11]].forEach(function (p) { b.glow(p[0], p[1], 'cyan'); });
      b.px(26, 7, 'ink'); b.px(27, 7, 'white'); b.px(24, 6, 'ink');
      b.meta.mouth = [30, 8];
    });

    // ---------------------------------------------------------------- Priepasť
    // Sklenená ryba: priehľadná — svetlý obrys, viditeľná kostra a orgány, veľké oko.
    fishDef('sklenena', 16, 10, function (b, f) {
      var G = geom({ x0: 4, x1: 14, cy: 4.5, top: [0.9, 3, 1.3, 0.5], bot: [0.9, 3, 1.2, 0.5] });
      var sw = f ? 1 : 0;
      b.poly([[5, 3], [1, 1 + sw], [2, 4.5 + sw], [1, 8 + sw], [5, 6]], 'grey');
      paintBody(b, G, [[1, 'greyLight']]);
      // vnútro vyprázdniť, okraj ostane
      var inner = [];
      b.each(function (x, y) { if (!b.edge(x, y)) inner.push([x, y]); });
      inner.forEach(function (p) { b.px(p[0], p[1], dith(p[0], p[1], 0.12) ? 'blue' : 0); });
      b.outline('ink');
      // kostra a orgány
      for (var x = 3; x <= 12; x++) b.glow(x, 4, 'greyLight', 'cyan');
      [5, 7, 9, 11].forEach(function (x) { b.glow(x, 3, 'grey', 'cyan'); b.glow(x, 5, 'grey', 'cyan'); });
      b.px(9, 6, 'pink'); b.px(10, 6, 'red'); b.px(8, 6, 'pink');
      eye(b, 12, 3, 2);
      b.meta.mouth = [15, 5];
    });

    // Veľkoústka (ako tesákovec): krátke telo, gigantická otvorená papuľa, obrie tesáky,
    // modré svietiace bodky pozdĺž čeľuste.
    fishDef('velkoustka', 30, 22, function (b, f) {
      var sw = f ? 1 : 0;
      b.poly([[8, 9], [2, 5 + sw], [4, 11 + sw], [2, 16 + sw], [8, 14]], 'slate');
      shapeEll(14, 11.5, 8, 6.5, function (x, y) { b.px(x, y, y < 7 ? 'grey' : y < 13 ? 'slate' : 'slateDark'); });
      // hlava: horná a spodná čeľusť
      b.poly([[14, 5], [26, 4], [28, 8], [18, 10]], 'grey');
      b.line(15, 5, 26, 4, 'greyLight');
      b.poly([[14, 15], [27, 18], [26, 20], [14, 19]], 'slate');
      b.poly([[18, 10], [28, 8], [28, 17], [15, 14]], 'plum');
      b.poly([[20, 11], [27, 10], [27, 15], [18, 13]], 'ink');
      // tesáky
      b.line(26, 9, 26, 12, 'white'); b.line(23, 10, 23, 12, 'greyLight');
      b.line(25, 17, 25, 14, 'white'); b.line(21, 15, 21, 13, 'greyLight');
      b.px(27, 9, 'white');
      b.px(10, 4, 'slate'); b.px(11, 5, 'slate'); b.px(12, 4, 'slate');
      b.outline('ink');
      [[16, 18], [19, 18], [22, 19], [25, 19], [10, 16], [13, 17]].forEach(function (p) { b.glow(p[0], p[1], 'cyan'); });
      eye(b, 19, 6, 2);
      b.meta.mouth = [28, 12];
    });

    // Latiméria: modrá "živá fosília" s bielymi škvrnami, mäsité lalokovité plutvy,
    // trojlaločný chvost s malým stredným lalokom.
    fishDef('latimeria', 48, 26, function (b, f) {
      var sw = f ? 1 : 0;
      // trojlaločný chvost
      b.poly([[12, 9], [3, 4 + sw], [6, 12], [12, 12]], 'blue');
      b.poly([[12, 14], [6, 13], [3, 21 + sw], [12, 17]], 'blue');
      b.poly([[7, 12], [1, 11 + sw], [1, 14 + sw], [7, 14]], 'blueDark');
      var G = geom({ x0: 11, x1: 44, cy: 12.5, top: [3, 8, 3.5, 0.5, 'blunt'], bot: [3, 7.5, 3, 0.5] });
      // lalokovité plutvy: mäsitá stopka + vejár
      function lobe(x, y, dx, dy) {
        b.ell(x, y, 2.2, 1.6, 'blueDark');
        b.ell(x + dx, y + dy, 2, 1.5, 'blue');
      }
      lobe(G.X(0.32), G.cols[G.X(0.32)].top - 1, -2, -2 + sw);
      lobe(G.X(0.28), G.cols[G.X(0.28)].bot + 1, -2, 2 - sw);
      lobe(G.X(0.48), G.cols[G.X(0.48)].bot + 1, -2, 2);
      b.poly([[G.X(0.55), G.cols[G.X(0.55)].top + 1], [G.X(0.58), G.cols[G.X(0.55)].top - 5], [G.X(0.68), G.cols[G.X(0.68)].top - 3], [G.X(0.68), G.cols[G.X(0.68)].top + 1]], 'blue');
      paintBody(b, G, [[0.08, 'cyan'], [0.35, 'blue'], [0.8, 'blueDark'], [1, 'navy']]);
      // šupiny (nepravidelné tmavé zrnká) a biele škvrny
      b.each(function (x, y) { if (b.is(x, y, 'blueDark') && noise(x, y, 11) > 0.78) b.px(x, y, 'navy'); });
      [[16, 8], [17, 8], [20, 14], [24, 9], [25, 10], [28, 15], [31, 8], [33, 13], [34, 13], [22, 18], [37, 10], [19, 11], [29, 11]].forEach(function (p) { b.px(p[0], p[1], 'white'); });
      lobe(G.X(0.72), G.rel(G.X(0.72), 0.7), -3, 2 + sw);
      b.line(G.X(0.82), G.rel(G.X(0.82), 0.25), G.X(0.82), G.rel(G.X(0.82), 0.8), 'navy');
      b.outline('ink');
      eye(b, 40, 9, 3, { iris: 'greenLight' });
      b.px(44, 15, 'ink'); b.px(43, 15, 'ink');
      b.meta.mouth = [46, 14];
    });

    // ---------------------------------------------------------------- sezónne
    // Sleď: väčší a vyšší ako sardinka, zelenomodrý chrbát, bez bodiek, vysunutá spodná čeľusť.
    fishDef('sled', 16, 10, function (b, f) {
      fishBody(b, f, {
        x0: 4, x1: 14, cy: 4.5,
        top: [0.9, 2.6, 0.7, 0.5, 'point'], bot: [0.9, 3.0, 1.0, 0.45],
        bands: [[0.15, 'greenDark'], [0.3, 'green'], [0.4, 'greenLight'], [0.75, 'greyLight'], [1, 'white']], under: 'grey',
        tail: { type: 'fork', len: 4, spread: 3.2, c: 'grey', c2: 'slate', notch: 0.6 },
        dorsal: [{ a: 0.4, z: 0.6, h: 1.4, c: 'greenDark' }],
        anal: [{ a: 0.15, z: 0.3, h: 1, c: 'grey' }],
        eye: { x: 12, y: 3, size: 2 },
      });
      b.px(14, 6, 'ink'); b.px(15, 6, 'greyLight');
      b.px(15, 5, 0);
      b.meta.mouth = [15, 5];
    });

    // Tekvicovka: okrúhla oranžová ako tekvica, zelená "stopka" namiesto plutvy,
    // vyrezaná svietiaca tvár.
    fishDef('tekvicovka', 16, 14, function (b, f) {
      var sw = f ? 2 : 0;
      b.poly([[4, 6], [0.5, 3 + sw], [0.5, 10 + sw], [4, 9]], 'rust');
      shapeEll(9, 7.5, 6, 5.5, function (x, y) {
        var rel = (y - 2) / 11;
        b.px(x, y, rel < 0.2 ? 'amber' : rel < 0.75 ? 'orange' : 'rust');
      });
      // rebrá tekvice
      for (var y = 4; y <= 11; y++) { b.px(y < 6 || y > 9 ? 6 : 5, y, 'rust'); }
      b.px(8, 1, 'green'); b.px(9, 1, 'green'); b.px(9, 0, 'greenDark'); b.px(10, 1, 'greenLight');
      b.outline('ink', function (x, y) { return y > 0; });
      // vyrezaná tvár (svieti) — v druhom snímku plameň sviečky zablikne
      var hi = f ? 'amber' : 'yellow', lo = f ? 'yellow' : 'amber';
      b.glow(11, 5, hi); b.glow(12, 5, 'yellow'); b.glow(11, 6, lo, 'yellow');
      b.glow(9, 9, hi); b.glow(10, 10, 'yellow'); b.glow(11, 9, lo, 'yellow'); b.glow(12, 10, hi); b.glow(13, 9, 'yellow');
      b.meta.mouth = [15, 9];
    });

    // Prízračná ryba: bledá, priesvitná (dither s dierami), roztrhaný vlajúci chvost, prázdne oči.
    fishDef('prizrak', 28, 16, function (b, f) {
      var G = geom({ x0: 7, x1: 26, cy: 7.5, top: [1.5, 5.8, 3.2, 0.68, 'round'], bot: [1.5, 5.4, 2.8, 0.62] });
      // cáry: roztrhaný chvost, ktorý sa vlní a stráca
      for (var k = 0; k < 3; k++) {
        for (var x = 1; x <= 9; x++) {
          var y = 5.5 + k * 2 + Math.sin(x * 0.7 + f * 1.9 + k * 1.3) * 1.1;
          if (x > 2 + k) b.px(x, y, x < 5 ? 'grey' : 'greyLight');
        }
      }
      paintBody(b, G, [[0.35, 'white'], [0.8, 'greyLight'], [1, 'grey']]);
      // svieti okraj prednej časti — v tme ostane obrys prízraku
      var rim = [];
      b.each(function (x, y) { if (x >= 13 && b.edge(x, y)) rim.push([x, y]); });
      b.outline('slateDark');
      // priesvitnosť: zadná časť tela sa rozpadá do diery (dither hustne k chvostu)
      for (x = 7; x <= 18; x++) {
        var c = G.cols[x];
        for (y = c.top + 1; y < c.bot; y++) if (dith(x, y, (18 - x) / 12 * 0.75 + 0.1)) b.px(x, y, 0);
      }
      rim.forEach(function (p) { b.glow(p[0], p[1], b.at(p[0], p[1]) || 'white', 'white'); });
      // prázdne oko a ústa v tvare "o"
      b.rect(21, 4, 2, 3, 'ink'); b.glow(22, 4, 'cyan');
      b.rect(24, 9, 2, 2, 'ink'); b.px(23, 9, 'slateDark');
      b.meta.mouth = [27, 10];
    });

    defineLegends();
  }

  // =================================================================== LEGENDY
  function defineLegends() {
    // Zlatý úhor: dlhý zlatý úhor s trblietkami.
    fishDef('zlaty_uhor', 58, 20, function (b, f) {
      var G = eelBody(b, f, {
        x0: 2, x1: 55, cy: 10, amp: 3.5, waves: 1.1, thick: 3.6, headT: 0.86, headMax: 1.05, snout: 1.8,
        tailThick: 0.8, finC: 'amber', finFrom: 0.0, finTo: 0.8, finBotTo: 0.55,
        bands: [[0.2, 'yellow'], [0.65, 'amber'], [1, 'orange']], under: 'rust',
      });
      for (var x = G.x0 + 3; x < G.x1 - 5; x += 4) b.px(x, G.rel(x, 0.35), 'sandLight');
      var hx = 51, c = G.c(hx);
      b.px(55, G.rel(55, 0.65), 'rust'); b.px(54, G.rel(54, 0.65), 'rust');
      b.outline('ink');
      eye(b, hx, c.top + 1, 2);
      // trblietky: na tele aj hviezdičky okolo
      [[10, 0.3], [18, 0.5], [27, 0.3], [35, 0.6], [43, 0.35]].forEach(function (p) { b.glow(p[0], G.rel(p[0], p[1]), 'white', 'yellow'); });
      var st = f ? [[14, 2], [38, 16]] : [[30, 2], [22, 17]];
      st.forEach(function (p) {
        b.glow(p[0], p[1], 'white', 'yellow');
        b.glow(p[0] - 1, p[1], 'yellow'); b.glow(p[0] + 1, p[1], 'yellow');
        b.glow(p[0], p[1] - 1, 'yellow'); b.glow(p[0], p[1] + 1, 'yellow');
      });
      b.meta.mouth = [57, G.rel(55, 0.6)];
    });

    // Hmlistá dáma: biela zahalená postava — rajovité telo s kapucňou,
    // dlhé vlajúce závoje, ktoré sa strácajú do priehľadna.
    // Hmlistá dáma: biela závojovka — malé elegantné telo a obrovské vlajúce závoje
    // (chrbtový, análny, chvostové stuhy), ktoré sa k okrajom strácajú do hmly.
    fishDef('hmlista_dama', 62, 40, function (b, f) {
      var ph = f ? 1.2 : 0;
      // chvostové stuhy: od tela dozadu, vejárovito, čím ďalej, tým priesvitnejšie
      for (var k = 0; k < 5; k++) {
        var spread = (k - 2) * 3.2;
        for (var x = 4; x <= 42; x++) {
          var t = (42 - x) / 38;                       // 0 pri tele, 1 na konci
          var y = 20 + spread * t * 1.6 + Math.sin(x * 0.25 + ph + k) * (0.5 + 2.2 * t);
          var th = t < 0.4 ? 2 : 1;
          for (var j = 0; j < th; j++) {
            if (t < 0.45 || dith(x, Math.round(y) + j, 1.05 - t)) b.px(x, y + j, t > 0.7 ? 'grey' : (k % 2 ? 'greyLight' : 'white'));
          }
        }
      }
      // chrbtový závoj: vysoký oblúk nad telom, previsnutý dozadu
      var wv = f ? 1 : 0;
      b.poly([[38, 16], [46, 13], [50, 13], [44, 5], [36, 1 + wv], [28, 3 + wv], [22, 8 + wv], [30, 9], [34, 12]], 'greyLight');
      // análny závoj: dole, dlhší a mäkší
      b.poly([[38, 23], [48, 25], [44, 31], [36, 37 - wv], [26, 38 - wv], [20, 33 - wv], [30, 30], [34, 26]], 'greyLight');
      // dither: závoje k okrajom rednú
      b.each(function (x, y) {
        if (b.is(x, y, 'greyLight') && x < 44) {
          var fade = Math.max(0, (44 - x) / 22);
          if (dith(x, y, fade * 0.55)) b.px(x, y, 'grey');
        }
      });
      // telo: malé, oválne, biele
      shapeEll(49, 19.5, 10, 6.5, function (x, y) { b.px(x, y, y < 16 ? 'white' : y < 23 ? 'white' : 'greyLight'); });
      b.line(41, 18, 50, 18, 'greyLight');
      b.px(44, 16, 'greyLight'); b.px(47, 21, 'greyLight');
      var rim = [];
      b.each(function (x, y) { if (b.edge(x, y) && (x + y) % 2 === 0) rim.push([x, y]); });
      b.outline('slate');
      rim.forEach(function (p) { b.glow(p[0], p[1], b.at(p[0], p[1]), 'white'); });
      // tvár: tmavé oko s modrým svitom, riasa, ruženec na líci, drobné ústa
      b.rect(53, 17, 2, 2, 'ink'); b.glow(54, 17, 'cyan');
      b.px(53, 16, 'slate'); b.px(52, 16, 'slate');
      b.px(55, 20, 'pink');
      b.px(58, 20, 'slate');
      b.meta.mouth = [60, 20];
    });

    // Kráľ búrky: obrovská tmavá ryba, koruna/plutvy v tvare bleskov, žlté oko.
    fishDef('kral_burky', 64, 38, function (b, f) {
      var sw = f ? 1 : 0;
      var G = geom({ x0: 16, x1: 60, cy: 21, top: [3, 11, 4, 0.5, 'blunt'], bot: [3, 10, 5, 0.45] });
      // chvost s bleskovými okrajmi
      b.poly([[17, 17], [3, 4 + sw], [9, 21], [3, 36 + sw], [17, 25]], 'slateDark');
      b.line(4, 5 + sw, 8, 12, 'yellow'); b.line(8, 12, 6, 13, 'yellow'); b.line(6, 13, 10, 20, 'yellow');
      b.line(4, 35 + sw, 8, 29, 'yellow'); b.line(8, 29, 6, 28, 'yellow'); b.line(6, 28, 10, 22, 'yellow');
      // koruna: nízka tmavá chrbtová plutva, z ktorej trčia cikcakové blesky
      b.poly([[22, 12], [26, 7], [46, 7], [49, 12]], 'slateDark');
      var i;
      [[26, 0], [32, 1], [38, 0], [44, 2]].forEach(function (p, k) {
        var x = p[0], t = p[1] + ((k + f) % 2);
        // blesk: dva šikmé ťahy spojené zubom, 2 px hrubý, špička hore
        var zz = [[x, 9], [x + 2, t + 5], [x - 1, t + 5], [x + 1, t]];
        for (var s = 0; s < zz.length - 1; s++) {
          b.line(zz[s][0], zz[s][1], zz[s + 1][0], zz[s + 1][1], 'yellow');
          b.line(zz[s][0] + 1, zz[s][1], zz[s + 1][0] + 1, zz[s + 1][1], 'amber');
        }
      });
      paintBody(b, G, [[0.06, 'grey'], [0.18, 'slate'], [0.55, 'slateDark'], [0.85, 'navy'], [1, 'ink']]);
      // blesky po boku
      var bolt = [[24, 18], [30, 16], [29, 20], [36, 17], [35, 21], [44, 18]];
      for (i = 0; i < bolt.length - 1; i++) b.line(bolt[i][0], bolt[i][1], bolt[i + 1][0], bolt[i + 1][1], i % 2 ? 'cyan' : 'yellow');
      // prsná plutva ako blesk
      b.poly([[46, 25], [41, 30 + sw], [44, 30 + sw], [39, 35 + sw], [48, 28], [45, 28], [49, 25]], 'yellow');
      b.line(52, 13, 52, 28, 'navy');
      // papuľa so zubami
      b.line(52, 27, 60, 25, 'ink');
      [53, 56, 59].forEach(function (x) { b.px(x, 27 - Math.round((x - 52) / 4) - 1, 'white'); });
      b.outline('ink');
      eye(b, 53, 16, 3, { iris: 'yellow', hi: 'white' });
      b.meta.mouth = [62, 25];
    });

    // Ľadová veľryba: ľadovo modrá veľryba, biele ryhy na hrdle, ľadové kryštály na chrbte.
    fishDef('ladova_velryba', 96, 38, function (b, f) {
      var sw = f ? 2 : 0;
      // Veľryba, nie ryba: vodorovné chvostové laloky (zboku tenký klin), mohutná
      // hlava, dlhá čiara úst, malé oko pri kútiku, ryhy na hrdle, malá chrbtová plutva vzadu.
      var G = geom({ x0: 20, x1: 93, cy: 20, top: [2, 11, 9, 0.5, 'blunt'], bot: [2, 11, 8, 0.62, 'blunt'],
        bend: function (t) { return t < 0.15 ? -(0.15 - t) * 20 * (f ? 0.3 : 1) : 0; } });
      var ty = G.cols[20].top + 1;
      b.poly([[22, ty - 1], [5, ty - 4 - sw], [1, ty - 3 - sw], [7, ty + 0.5], [2, ty + 3 - sw], [6, ty + 3.5 - sw], [22, ty + 3]], 'blue');
      b.line(4, ty - 3 - sw, 20, ty, 'cyan');
      // malá chrbtová plutva vzadu
      var dc = G.c(40);
      b.poly([[35, dc.top + 1], [41, dc.top - 3], [43, dc.top + 1]], 'blue');
      paintBody(b, G, [[0.08, 'white'], [0.3, 'cyan'], [0.75, 'blue'], [1, 'blueDark']]);
      // ľadové kryštály: drobné hranaté úlomky na chrbte
      [[52, 3], [58, 4], [64, 2], [70, 3]].forEach(function (p, i) {
        var c = G.c(p[0]);
        b.poly([[p[0] - 1.5, c.top + 1], [p[0], c.top - p[1]], [p[0] + 1.5, c.top + 1]], 'white');
        b.px(p[0] + 1, c.top - 1, 'cyan');
      });
      // ryhy na hrdle
      for (var x = 60; x <= 90; x++) {
        var c = G.c(x);
        [0.78, 0.86, 0.94].forEach(function (r) { if ((x + Math.round(r * 10)) % 6) b.px(x, c.top + Math.round((c.bot - c.top) * r), 'greyLight'); });
      }
      // námraza: nepravidelné svetlé zrnká
      b.each(function (x, y) { if (b.is(x, y, 'blue') && noise(x, y, 21) > 0.9) b.px(x, y, 'cyan'); });
      // prsná plutva: dlhá biela (ako keporkak)
      b.poly([[66, 27], [52, 35 + (f ? -1 : 0)], [55, 36 + (f ? -1 : 0)], [70, 29]], 'white');
      b.line(56, 34, 67, 28, 'greyLight');
      // dlhá zahnutá čiara úst
      b.line(70, 24, 80, 26, 'blueDark'); b.line(80, 26, 92, 24, 'blueDark');
      b.outline('ink');
      eye(b, 74, 21, 2, { hi: 'white' });
      // svieti: kryštály a ryhy
      b.each(function (x, y) {
        if ((b.is(x, y, 'white') && y < 14) || (b.is(x, y, 'greyLight') && x > 57 && y > 20)) b.glow(x, y, b.is(x, y, 'white') ? 'white' : 'greyLight', 'cyan');
      });
      b.meta.mouth = [94, 23];
    });

    // Bludička hlbín: tmavá štíhla ryba, dlhý prút a veľký modrozelený plameň-bludička.
    fishDef('bludicka', 46, 30, function (b, f) {
      var bob = f ? 1 : 0;
      fishBody(b, f, {
        x0: 7, x1: 27, cy: 20,
        top: [1.2, 4, 1.6, 0.55], bot: [1.2, 3.6, 1.8, 0.5],
        bands: [[0.25, 'pinkPurple'], [0.7, 'purple'], [1, 'plum']], under: 'plum',
        tail: { type: 'round', len: 6, spread: 4, c: 'purple', c2: 'plum' },
        dorsal: [{ a: 0.2, z: 0.55, h: 2, c: 'purple', shape: 'round' }],
        anal: [{ a: 0.2, z: 0.45, h: 2, c: 'purple', shape: 'round' }],
        eye: { x: 23, y: 18, size: 2, glow: 'cyan', hi: 'white', pupil: 'cyan' },
        mouth: { r: 0.62, len: 3 },
      });
      // prút
      b.line(24, 16, 26, 10, 'pinkPurple'); b.line(27, 9, 32, 6, 'pinkPurple'); b.line(33, 6, 36, 8 + bob, 'pinkPurple');
      b.px(26, 9, 'pinkPurple');
      // plameň bludičky: kvapka + jazyky
      var cx = 37, cy = 12 + bob;
      shapeEll(cx, cy, 4, 3.5, function (x, y) { b.glow(x, y, 'greenLight'); });
      shapeEll(cx, cy + 0.5, 2.6, 2.3, function (x, y) { b.glow(x, y, 'cyan'); });
      b.glow(cx - 1, cy, 'white'); b.glow(cx, cy, 'white'); b.glow(cx - 1, cy + 1, 'white');
      var tongues = f ? [[35, 7], [38, 6], [40, 8]] : [[36, 6], [39, 7], [34, 8]];
      tongues.forEach(function (p) { b.glow(p[0], p[1], 'greenLight'); b.glow(p[0], p[1] + 1, 'cyan'); });
      // odlietajúce iskričky
      (f ? [[42, 5], [30, 3]] : [[43, 9], [33, 2]]).forEach(function (p) { b.glow(p[0], p[1], 'cyan'); });
      b.meta.mouth = [28, 21];
    });

    // Strážca priepasti: prastarý pancierový leviatan, kostené ostne, trojica
    // svietiacich očí, svietiace ryhy medzi platňami.
    fishDef('strazca', 96, 50, function (b, f) {
      var sw = f ? 2 : 0;
      var G = geom({ x0: 26, x1: 92, cy: 26, top: [4, 15, 8, 0.45, 'blunt'], bot: [4, 13, 9, 0.5, 'blunt'] });
      // dlhý chvost s plutvou
      for (var x = 2; x <= 27; x++) {
        var t = (x - 2) / 25;
        var cy = 26 + Math.sin(t * 3 + f) * 2 * (1 - t);
        var th = lerp(1, 4, t);
        for (var y = Math.round(cy - th); y <= Math.round(cy + th); y++) b.px(x, y, y < cy - th * 0.3 ? 'slate' : 'slateDark');
      }
      b.poly([[2, 26 + sw], [0, 14], [7, 22], [9, 26], [7, 30], [0, 38], [2, 26 + sw]], 'slateDark');
      // kostené ostne na chrbte
      for (var k = 0; k < 7; k++) {
        var sx = G.X(0.12 + k * 0.1), c = G.c(sx);
        b.poly([[sx - 3, c.top + 2], [sx - 1 - (k % 2), c.top - 5 - (k % 3)], [sx + 2, c.top + 2]], k % 2 ? 'grey' : 'greyLight');
      }
      paintBody(b, G, [[0.06, 'greyLight'], [0.2, 'slate'], [0.6, 'slateDark'], [1, 'navy']]);
      // pancierové platne: oblúky
      for (k = 0; k < 6; k++) {
        var px0 = G.X(0.1 + k * 0.12);
        var pc = G.c(px0);
        for (y = pc.top + 2; y < pc.bot - 1; y++) {
          var off = Math.round(Math.pow((y - (pc.top + pc.bot) / 2) / ((pc.bot - pc.top) / 2), 2) * 3);
          b.px(px0 - off, y, 'navy');
          b.px(px0 - off + 1, y, 'slate');
        }
      }
      // papuľa so zubami
      var jy = 32;
      b.poly([[70, jy - 1], [93, jy - 3], [93, jy + 3], [72, jy + 1]], 'ink');
      for (x = 74; x <= 91; x += 3) { b.px(x, jy - 2 + Math.round((74 - x) / 10), 'greyLight'); b.px(x + 1, jy + 1, 'white'); }
      b.outline('ink');
      // svietiace ryhy medzi platňami
      for (k = 0; k < 6; k++) {
        px0 = G.X(0.1 + k * 0.12); pc = G.c(px0);
        for (y = pc.top + 3; y < pc.bot - 2; y += 2) {
          off = Math.round(Math.pow((y - (pc.top + pc.bot) / 2) / ((pc.bot - pc.top) / 2), 2) * 3);
          b.glow(px0 - off + 1, y, 'cyan');
        }
      }
      // tri oči
      [[80, 19], [85, 21], [75, 22]].forEach(function (p, i) {
        b.glow(p[0], p[1], 'red'); b.glow(p[0] + 1, p[1], 'amber', 'yellow'); b.glow(p[0], p[1] + 1, 'redDark', 'red'); b.glow(p[0] + 1, p[1] + 1, 'red');
        if (i === 0) { b.glow(p[0] + 2, p[1], 'red'); b.glow(p[0] - 1, p[1] + 1, 'red'); }
      });
      b.meta.mouth = [94, 32];
    });
  }

  // =================================================================== TVORY A NEBEZPEČENSTVÁ
  function defineCreatures() {
    // Medúza: priesvitný zvon (dither s dierami), štvorlístok vo vnútri, vlajúce chápadlá.
    def('jelly', 14, 18, 2, function (b, f) {
      var sq = f ? 1 : 0;
      for (var k = 0; k < 4; k++) {
        var x0 = 3.5 + k * 2.3;
        for (var y = 7 - sq; y <= 16; y++) {
          var x = x0 + Math.sin(y * 0.55 + k * 1.3 + f * 1.6) * 1.1;
          if (y < 12 || dith(Math.round(x), y, 1.15 - (y - 11) / 6)) b.px(x, y, k % 2 ? 'pink' : 'pinkPurple');
        }
      }
      var bell = [];
      shapeEll(7, 7 - sq, 6 + sq * 0.5, 6 - sq, function (x, y) { if (y <= 7 - sq) { b.px(x, y, 'pinkPurple'); bell.push([x, y]); } });
      // zúbkovaný okraj zvona
      for (var x2 = 2; x2 <= 12; x2 += 2) b.px(x2, 8 - sq, 'pinkPurple');
      // svetlý lem zvona zhora, tmavšie jadro
      bell.forEach(function (p) { if (b.edge(p[0], p[1]) && p[1] < 6 - sq) b.px(p[0], p[1], 'pink'); });
      b.outline('plum', function (x, y) { return y <= 9; });
      // priesvitnosť iba pri spodnom okraji zvona (prosvitá more)
      bell.forEach(function (p) { if (p[1] >= 6 - sq && !b.edge(p[0], p[1], 'plum') && dith(p[0], p[1], 0.5)) b.px(p[0], p[1], 0); });
      // štvorlístok (gonády) a odlesk
      b.px(6, 4 - sq, 'purple'); b.px(8, 4 - sq, 'purple'); b.px(7, 3 - sq, 'purple'); b.px(7, 5 - sq, 'purple');
      b.px(4, 3 - sq, 'white'); b.px(4, 2 - sq, 'white'); b.px(5, 2 - sq, 'white');
    }, 'creature');

    // Žralok: sivý chrbát, biele brucho, vysoká trojuholníková plutva, žiabre, asymetrický chvost.
    def('shark', 50, 22, 2, function (b, f) {
      var sw = f ? 2 : 0;
      var G = geom({ x0: 13, x1: 47, cy: 12, top: [1.2, 4.6, 1.4, 0.45, 'round'], bot: [1.2, 4.2, 1.8, 0.5, 'round'] });
      var c0 = G.cols[13];
      b.poly([[14, c0.top], [2, 1 + sw], [5, 4 + sw], [9, c0.top + 1], [9, c0.bot], [5, c0.bot + 4 - sw * 0.5], [14, c0.bot + 1]], 'slate');
      var dx = G.X(0.5), dc = G.c(dx);
      b.poly([[dx - 5, dc.top + 1], [dx + 1, dc.top - 7], [dx + 3, dc.top + 1]], 'slate');
      b.line(dx + 1, dc.top - 6, dx + 2, dc.top, 'grey');
      var ax = G.X(0.22);
      b.poly([[ax - 2, G.c(ax).bot], [ax - 1, G.c(ax).bot + 3], [ax + 2, G.c(ax).bot]], 'slate');
      paintBody(b, G, [[0.35, 'slate'], [0.5, 'grey'], [1, 'greyLight']], 'grey');
      b.each(function (x, y) { if (b.is(x, y, 'greyLight') && y > G.mid(x) + 1) b.px(x, y, 'white'); });
      [36, 38, 40].forEach(function (x) { var c = G.c(x); for (var y = c.top + 3; y <= c.top + 5; y++) b.px(x, y, 'slateDark'); });
      var px0 = G.X(0.68), py0 = G.rel(px0, 0.7);
      b.poly([[px0 + 2, py0], [px0 - 6, py0 + 6 - sw * 0.5], [px0 - 3, py0 + 6 - sw * 0.5], [px0 + 4, py0 + 1]], 'slate');
      b.line(40, G.rel(40, 0.8), 45, G.rel(45, 0.75), 'slateDark');
      b.outline('ink');
      b.px(43, G.rel(43, 0.3), 'ink'); b.px(44, G.rel(44, 0.3), 'white');
    }, 'creature');

    // Chobotnica: hlavový vak hore, veľké oči, osem kučeravých chápadiel s prísavkami.
    def('octopus', 24, 24, 2, function (b, f) {
      for (var k = 0; k < 6; k++) {
        var bx = 5 + k * 2.8, dir = k < 3 ? -1 : 1;
        for (var y = 11; y <= 22; y++) {
          var t = (y - 11) / 11;
          var x = bx + dir * t * t * 3 + Math.sin(y * 0.6 + k * 1.1 + f * 1.8) * 1.3 * t;
          var th = t < 0.5 ? 2 : 1;
          for (var j = 0; j < th; j++) b.px(x + j, y, 'rust');
          if (t > 0.2 && y % 2 === 0) b.px(x + (dir < 0 ? 1 : 0), y, 'pink');
        }
      }
      shapeEll(12, 7.5, 7, 6.5, function (x, y) { b.px(x, y, y < 4 ? 'clay' : y < 10 ? 'rust' : 'redDark'); });
      b.px(9, 3, 'sand'); b.px(10, 2, 'sand');
      [[10, 6], [15, 5], [13, 10]].forEach(function (p) { b.px(p[0], p[1], 'redDark'); });
      b.outline('ink');
      // oči s vodorovnou zrenicou
      [[7, 9], [15, 9]].forEach(function (p) { b.px(p[0], p[1], 'yellow'); b.px(p[0] + 1, p[1], 'yellow'); b.px(p[0], p[1] + 1, 'ink'); b.px(p[0] + 1, p[1] + 1, 'ink'); });
    }, 'creature');

    // Tieňový úhor: skoro čierny, dymový okraj, svietiace červené oči (v Priepasti ho vidno len podľa nich).
    def('shadow_eel', 44, 14, 2, function (b, f) {
      var G = eelBody(b, f, {
        x0: 2, x1: 41, cy: 7, amp: 2.5, waves: 1.2, thick: 2.6, headT: 0.84, headMax: 1.15, snout: 1.7,
        tailThick: 0.7, finC: 'slateDark', finFrom: 0, finTo: 0.75, finBotTo: 0.5,
        bands: [[0.15, 'grey'], [0.5, 'slate'], [0.85, 'slateDark'], [1, 'navy']],
      });
      b.outline('ink');
      // dymový lem: riedke tmavé pixely nad chrbtom
      for (var x = 4; x < 36; x++) { var c = G.cols[x]; if (dith(x, c.top - 2, 0.3)) b.px(x, c.top - 2, 'slateDark'); }
      var hy = G.cols[38].top + 1;
      b.glow(37, hy, 'red'); b.glow(38, hy, 'red', 'amber'); b.glow(39, hy + 1, 'redDark', 'red');
      b.line(38, G.rel(38, 0.75), 41, G.rel(41, 0.6), 'ink');
      b.px(40, G.rel(40, 0.8), 'greyLight');
    }, 'creature');
  }

  // =================================================================== PROSTREDIE A REKVIZITY
  // Ostrá skala: mnohouholník, ľavá stena na svetle, pravá v tieni, hrany zhora svetlé.
  function rock(b, pts, ridge) {
    b.poly(pts, 'slate');
    b.each(function (x, y) {
      var left = x < ridge(y);
      var top = !b.at(x, y - 1);
      b.px(x, y, top ? (left ? 'greyLight' : 'grey') : left ? 'grey' : (y > b.h * 0.7 ? 'slateDark' : 'slate'));
    });
    b.each(function (x, y) { if (y > b.h - 4 && noise(x, y, 5) > 0.72) b.px(x, y, noise(x, y, 6) > 0.5 ? 'green' : 'greenDark'); });
  }

  function defineProps() {
    def('rock_s', 12, 10, 1, function (b) {
      rock(b, [[1, 9], [3, 3], [5, 5], [7, 1], [10, 6], [11, 9]], function (y) { return 7 - (y - 1) * 0.2; });
      b.outline('ink');
    });
    def('rock_m', 20, 14, 1, function (b) {
      rock(b, [[1, 13], [3, 6], [6, 8], [9, 1], [12, 6], [14, 4], [18, 10], [19, 13]], function (y) { return 10 + (y - 1) * 0.3; });
      b.line(9, 5, 11, 10, 'slateDark');
      b.outline('ink');
    });
    def('rock_l', 34, 22, 1, function (b) {
      rock(b, [[1, 21], [3, 12], [7, 13], [10, 4], [13, 9], [17, 1], [21, 8], [24, 6], [28, 13], [32, 16], [33, 21]], function (y) { return 17 + (y - 1) * 0.35; });
      b.line(17, 4, 15, 12, 'slateDark'); b.line(15, 12, 18, 18, 'slateDark');
      b.line(24, 9, 26, 15, 'slateDark');
      b.outline('ink');
    });

    // Chaluha: dlhá stonka s listami striedavo vľavo a vpravo, pohupuje sa.
    def('seaweed_a', 12, 32, 2, function (b, f) {
      function sx(y) { return 6 + Math.sin(y * 0.22 + f * 1.3) * 1.6 * (1 - y / 32); }
      for (var y = 1; y <= 31; y++) b.px(sx(y), y, 'green');
      for (var k = 0; k < 6; k++) {
        var ly = 4 + k * 4.6, side = k % 2 ? 1 : -1, x0 = sx(ly);
        shapeEll(x0 + side * 2.3, ly, 2.4, 1.2, function (x, yy) { b.px(x, yy, yy < ly ? 'greenLight' : 'green'); });
      }
      b.px(sx(1), 0, 'greenLight');
      b.outline('tealDark');
    });
    // Morská tráva: trs listov z jedného miesta.
    def('seaweed_b', 14, 22, 2, function (b, f) {
      [[-4, 14, 'green'], [-1, 20, 'greenLight'], [2, 17, 'green'], [4, 12, 'greenDark'], [-2, 10, 'greenDark']].forEach(function (bl, k) {
        for (var y = 0; y < bl[1]; y++) {
          var t = y / bl[1];
          var x = 7 + bl[0] * t + Math.sin(t * 3 + f * 1.4 + k) * 1.2 * t;
          b.px(x, 21 - y, bl[2]);
          if (t < 0.5) b.px(x + 1, 21 - y, bl[2]);
        }
      });
      b.outline('tealDark');
    });
    // Koral A: rozvetvený (parožnatý), ružový; hrubé konáre dole, tenké so svetlými polypmi hore.
    def('coral_a', 18, 18, 1, function (b) {
      function br(x, y, a, len, d) {
        var x2 = x + Math.cos(a) * len, y2 = y - Math.sin(a) * len;
        b.line(x, y, x2, y2, d > 1 ? 'pinkPurple' : 'pink');
        if (d > 1) b.line(x + 1, y, x2 + 1, y2, d > 2 ? 'purple' : 'pinkPurple');
        if (d > 0) { br(x2, y2, a + 0.6, len * 0.72, d - 1); br(x2, y2, a - 0.55, len * 0.75, d - 1); }
        else { b.px(x2, y2, 'skinLight'); }
      }
      br(8, 17, Math.PI / 2 + 0.35, 4, 3);
      br(9, 17, Math.PI / 2 - 0.4, 4.5, 3);
      b.outline('plum');
    });
    // Koral B: mozgový koral, oranžová kupola s kľukatými ryhami.
    def('coral_b', 18, 12, 1, function (b) {
      shapeEll(9, 11, 8, 9, function (x, y) { if (y <= 11) b.px(x, y, y < 5 ? 'amber' : 'orange'); });
      b.each(function (x, y) { if (Math.sin(x * 1.1 + Math.sin(y * 1.3) * 1.8) > 0.55 && y > 3) b.px(x, y, 'rust'); });
      b.outline('redDark');
    });

    // Háčik s červíkom. Horné očko = miesto, kde je priviazaný vlasec (meta.anchor).
    def('hook', 9, 14, 1, function (b) {
      b.px(5, 0, 'grey'); b.px(4, 1, 'grey'); b.px(6, 1, 'grey'); b.px(5, 2, 'greyLight');
      b.line(5, 3, 5, 10, 'greyLight');
      b.px(4, 11, 'grey'); b.px(3, 11, 'grey'); b.px(2, 10, 'grey'); b.px(1, 9, 'greyLight'); b.px(1, 8, 'greyLight'); b.px(2, 7, 'white');
      b.px(2, 9, 'grey');
      // červík omotaný okolo ohybu
      b.px(4, 10, 'pink'); b.px(3, 10, 'pinkPurple'); b.px(6, 9, 'pink'); b.px(6, 11, 'pinkPurple'); b.px(5, 12, 'pink'); b.px(4, 12, 'pinkPurple');
      b.outline('ink');
      b.px(5, 1, 0);
      b.meta.anchor = [5, 0];
    });
    def('harpoon', 22, 8, 1, function (b) {
      b.line(3, 4, 15, 4, 'woodLight'); b.line(3, 5, 15, 5, 'wood');
      b.poly([[15, 2], [21, 4.5], [15, 7]], 'grey');
      b.line(16, 4, 20, 4, 'greyLight');
      b.px(14, 2, 'grey'); b.px(14, 6, 'slate');
      b.px(1, 3, 'sand'); b.px(2, 4, 'sand'); b.px(1, 5, 'sand'); b.px(2, 6, 'sand'); b.px(0, 4, 'clay');
      b.outline('ink');
    });
    // Bublina: svetlý krúžok s odleskom, bez tmavého obrysu (je to vzduch, nie vec).
    def('bubble', 6, 6, 1, function (b) {
      shapeEll(3, 3, 3, 3, function (x, y) { b.px(x, y, 'cyan'); });
      shapeEll(3, 3, 2, 2, function (x, y) { b.px(x, y, 0); });
      b.px(1, 1, 'white'); b.px(2, 1, 'white'); b.px(1, 2, 'white');
    });
  }

  // =================================================================== IKONY
  function cloud(b, ox, oy, dark) {
    var top = dark ? 'grey' : 'white', mid = dark ? 'slate' : 'greyLight', low = dark ? 'slateDark' : 'grey';
    [[3.5 + ox, 6 + oy, 3, 2.5], [6.5 + ox, 4.5 + oy, 3.2, 3], [9 + ox, 6.5 + oy, 2.4, 2]].forEach(function (e) {
      shapeEll(e[0], e[1], e[2], e[3], function (x, y) { b.px(x, y, y < 4 + oy ? top : y < 7 + oy ? mid : low); });
    });
  }
  function sun(b, cx, cy, r, rays) {
    if (rays) {
      [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (d) { b.px(cx + d[0] * (r + 2) - 0.5, cy + d[1] * (r + 2) - 0.5, 'amber'); });
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (d) { b.px(cx + d[0] * (r + 1) - 0.5, cy + d[1] * (r + 1) - 0.5, 'amber'); });
    }
    shapeEll(cx, cy, r, r, function (x, y) { b.px(x, y, x + y > cx + cy + 1 ? 'amber' : 'yellow'); });
  }

  function defineIcons() {
    def('icon_sun', 12, 12, 1, function (b) { sun(b, 6, 6, 3, true); b.px(4, 4, 'white'); b.outline('ink'); }, 'icon');
    def('icon_cloudy', 12, 12, 1, function (b) { sun(b, 4, 4, 2.5, false); cloud(b, 0.5, 3, false); b.outline('ink'); }, 'icon');
    def('icon_rain', 12, 12, 1, function (b) {
      cloud(b, 0, 0, true);
      [[3, 9], [6, 10], [9, 9], [4, 11], [8, 11]].forEach(function (p, i) { b.px(p[0], p[1], i < 3 ? 'cyan' : 'blue'); });
      b.outline('ink');
    }, 'icon');
    def('icon_fog', 12, 12, 1, function (b) {
      for (var k = 0; k < 3; k++) for (var x = 1 + (k % 2); x <= 10 - ((k + 1) % 2); x++) b.px(x, 2 + k * 3 + (x % 4 === 0 ? 1 : 0), k === 1 ? 'grey' : 'greyLight');
      b.outline('ink');
    }, 'icon');
    def('icon_storm', 12, 12, 1, function (b) {
      cloud(b, 0, -1, true);
      b.poly([[6, 6], [4, 9], [6, 9], [5, 12], [8, 8], [6, 8], [7, 6]], 'yellow');
      b.outline('ink');
    }, 'icon');

    // Mesiac: 0 nov … 4 spln; dorastá sprava, cúva zľava. Neosvetlená časť ostáva
    // tmavá (nie priehľadná), aby sa fáza dala čítať aj pri nove.
    for (var k = 0; k < 8; k++) (function (k) {
      def('moon_' + k, 12, 12, 1, function (b) {
        var th = k / 8 * Math.PI * 2, c = Math.cos(th);
        shapeEll(6, 6, 5, 5, function (x, y) {
          var dx = (x + 0.5 - 6) / 5, dy = (y + 0.5 - 6) / 5, s = Math.sqrt(Math.max(0, 1 - dy * dy));
          var lit = k === 0 ? false : k === 4 ? true : k < 4 ? dx > c * s : dx < -c * s;
          b.px(x, y, lit ? 'sandLight' : 'slate');
        });
        [[4, 4], [7, 7], [7, 3]].forEach(function (p) { if (b.is(p[0], p[1], 'sandLight')) b.px(p[0], p[1], 'sand'); });
        b.outline('ink');
      }, 'icon');
    })(k);

    def('icon_money', 11, 11, 1, function (b) {
      shapeEll(5.5, 5.5, 4.5, 4.5, function (x, y) { b.px(x, y, x + y < 8 ? 'yellow' : x + y > 12 ? 'orange' : 'amber'); });
      // € : oblúk "C" s dvoma priečkami
      [[5, 2], [6, 2], [7, 2], [4, 3], [3, 4], [4, 4], [5, 4], [6, 4], [4, 5], [3, 6], [4, 6], [5, 6], [6, 6], [4, 7], [5, 8], [6, 8], [7, 8]].forEach(function (p) { b.px(p[0], p[1], 'rust'); });
      b.outline('ink');
    }, 'icon');
    def('icon_warn', 11, 11, 1, function (b) {
      b.poly([[5.5, 0], [11, 10], [0, 10]], 'amber');
      b.line(5, 1, 1, 9, 'yellow');
      b.line(5, 3, 5, 6, 'ink'); b.line(6, 3, 6, 6, 'ink'); b.px(5, 8, 'ink'); b.px(6, 8, 'ink');
      b.outline('ink');
    }, 'icon');
    def('icon_fish', 11, 9, 1, function (b) {
      b.poly([[0, 1], [3, 4.5], [0, 8]], 'blue');
      shapeEll(6.5, 4.5, 4, 3, function (x, y) { b.px(x, y, y < 4 ? 'cyan' : 'blue'); });
      b.px(8, 3, 'ink');
      b.outline('ink');
    }, 'icon');
    def('icon_lock', 11, 12, 1, function (b) {
      shapeEll(5.5, 4.5, 3.5, 4, function (x, y) { b.px(x, y, 'grey'); });
      shapeEll(5.5, 4.5, 1.8, 2.5, function (x, y) { b.px(x, y, 0); });
      b.rect(1, 5, 9, 6, 'amber'); b.rect(1, 5, 9, 1, 'yellow'); b.rect(1, 10, 9, 1, 'orange');
      b.px(5, 7, 'ink'); b.px(5, 8, 'ink');
      b.outline('ink');
    }, 'icon');
    def('icon_up', 11, 11, 1, function (b) {
      b.poly([[5.5, 0], [11, 5.5], [7.5, 5.5], [7.5, 11], [3.5, 11], [3.5, 5.5], [0, 5.5]], 'green');
      b.line(5, 1, 1, 5, 'greenLight'); b.line(4, 6, 4, 10, 'greenLight');
      b.outline('ink');
    }, 'icon');
    def('icon_star', 11, 11, 1, function (b) {
      var pts = [];
      for (var i = 0; i < 10; i++) {
        var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 2.3 : 5.5;
        pts.push([5.5 + Math.cos(a) * r, 5.8 + Math.sin(a) * r]);
      }
      b.poly(pts, 'yellow');
      b.each(function (x, y) { if (x + y > 11) b.px(x, y, 'amber'); });
      b.outline('ink');
    }, 'icon');
    def('icon_trophy', 11, 11, 1, function (b) {
      b.poly([[2, 0], [9, 0], [8, 5], [3, 5]], 'amber');
      b.line(2, 0, 3, 4, 'yellow');
      b.px(1, 1, 'amber'); b.px(0, 2, 'amber'); b.px(1, 3, 'amber');
      b.px(9, 1, 'amber'); b.px(10, 2, 'amber'); b.px(9, 3, 'amber');
      b.rect(5, 6, 1, 2, 'orange');
      b.rect(3, 8, 5, 2, 'wood'); b.rect(3, 8, 5, 1, 'woodLight');
      b.outline('ink');
    }, 'icon');
    def('icon_book', 11, 11, 1, function (b) {
      b.rect(1, 1, 8, 9, 'red'); b.rect(1, 1, 1, 9, 'redDark');
      b.rect(9, 2, 1, 8, 'sandLight');
      b.rect(3, 3, 5, 1, 'amber');
      b.px(6, 10, 'cyan'); b.px(6, 9, 'cyan');
      b.outline('ink');
    }, 'icon');
    def('icon_gear', 11, 11, 1, function (b) {
      // ozubené koleso: štyri hranaté zuby v osiach + štyri šikmé
      [[4, 0], [4, 9], [0, 4], [9, 4]].forEach(function (p) { b.rect(p[0], p[1], p[0] === 4 ? 3 : 2, p[0] === 4 ? 2 : 3, 'grey'); });
      [[1, 1], [8, 1], [1, 8], [8, 8]].forEach(function (p) { b.rect(p[0], p[1], 2, 2, 'grey'); });
      shapeEll(5.5, 5.5, 3.6, 3.6, function (x, y) { b.px(x, y, x + y < 10 ? 'greyLight' : 'grey'); });
      shapeEll(5.5, 5.5, 1.5, 1.5, function (x, y) { b.px(x, y, 0); });
      b.outline('ink');
    }, 'icon');
    def('icon_sleep', 11, 11, 1, function (b) {
      shapeEll(4, 6.5, 3.8, 3.8, function (x, y) { b.px(x, y, 'yellow'); });
      shapeEll(5.8, 5.2, 3.2, 3.2, function (x, y) { b.px(x, y, 0); });
      b.line(6, 0, 9, 0, 'greyLight'); b.line(9, 0, 6, 3, 'greyLight'); b.line(6, 3, 9, 3, 'greyLight');
      b.outline('ink');
    }, 'icon');

    // Návnady
    def('bait_worm', 12, 10, 1, function (b) {
      var pts = [[1, 7], [2, 6], [3, 5], [4, 5], [5, 6], [6, 7], [7, 7], [8, 6], [9, 5], [9, 4], [10, 3]];
      pts.forEach(function (p, i) { b.px(p[0], p[1], i % 2 ? 'pink' : 'pinkPurple'); b.px(p[0], p[1] + 1, 'pinkPurple'); });
      b.px(10, 2, 'pink');
      b.outline('ink');
    }, 'icon');
    def('bait_shell', 12, 11, 1, function (b) {
      b.poly([[6, 1], [11, 7], [9, 9], [3, 9], [1, 7]], 'sandLight');
      [3, 5, 7, 9].forEach(function (x) { b.line(6, 2, x, 8, 'sand'); });
      b.rect(4, 9, 4, 1, 'clay');
      b.outline('ink');
    }, 'icon');
    def('bait_squid', 12, 12, 1, function (b) {
      shapeEll(6, 4, 3, 3.6, function (x, y) { b.px(x, y, y < 3 ? 'skinLight' : 'pink'); });
      b.poly([[6, 0], [9, 3], [3, 3]], 'skinLight');
      [3, 5, 7, 9].forEach(function (x, i) { b.line(x, 7, x + (i % 2 ? 1 : -1), 10, 'pink'); });
      b.px(5, 5, 'ink'); b.px(7, 5, 'ink');
      b.outline('ink');
    }, 'icon');
    def('bait_glow', 12, 12, 1, function (b) {
      b.rect(3, 1, 6, 2, 'wood');
      b.rect(2, 3, 8, 8, 'slateDark');
      shapeEll(6, 7, 2.6, 2.6, function (x, y) { b.glow(x, y, 'cyan'); });
      b.glow(5, 6, 'white', 'cyan'); b.glow(6, 7, 'white', 'cyan');
      b.px(3, 4, 'slate');
      b.outline('ink');
    }, 'icon');
    def('bait_gold', 12, 12, 1, function (b) {
      // zlatá lyžička-blyskáč s háčikom
      shapeEll(5, 5, 3.5, 4.5, function (x, y) { b.px(x, y, x + y < 9 ? 'yellow' : 'amber'); });
      b.px(4, 3, 'white'); b.px(3, 4, 'white');
      b.line(7, 9, 9, 11, 'grey'); b.px(10, 10, 'grey');
      b.px(5, 0, 'grey');
      b.outline('ink');
    }, 'icon');
    def('bait_mix', 12, 12, 1, function (b) {
      b.poly([[1, 10], [3, 6], [9, 6], [11, 10]], 'wood'); b.line(2, 7, 10, 7, 'woodLight');
      b.px(3, 5, 'pink'); b.px(4, 4, 'pinkPurple'); b.px(5, 5, 'pink');
      b.px(7, 4, 'sandLight'); b.px(8, 5, 'sandLight'); b.px(8, 3, 'sand');
      b.px(6, 3, 'skinLight'); b.glow(9, 4, 'cyan');
      b.outline('ink');
    }, 'icon');
  }

  // =================================================================== VÝBAVA
  function defineGear() {
    var threads = {
      hemp: ['sand', 'clay'], nylon: ['cyan', 'blue'], braided: ['greenLight', 'green'],
      steel: ['greyLight', 'grey'], legend: ['yellow', 'amber'],
    };
    // Jazerné vlasce (docs/JAZERO.md): olovo, grafit, zirkónium — cievka z kovu, nie z dreva.
    threads.lead = ['grey', 'slate']; threads.graphite = ['slate', 'slateDark']; threads.zirconium = ['cyan', 'greyLight'];
    (HL.data.lines || []).concat(HL.data.lakeLines || []).forEach(function (ln) {
      var c = threads[ln.id] || ['grey', 'slate'];
      def('line_' + ln.id, 12, 12, 1, function (b) {
        var fl = ln.id === 'legend' ? ['amber', 'orange'] : ln.id === 'steel' ? ['slate', 'slateDark']
          : ln.id === 'lead' || ln.id === 'graphite' ? ['greyLight', 'grey'] : ln.id === 'zirconium' ? ['yellow', 'amber'] : ['woodLight', 'wood'];
        b.rect(1, 1, 2, 10, fl[0]); b.rect(9, 1, 2, 10, fl[0]);
        b.px(2, 1, fl[1]); b.px(2, 10, fl[1]); b.px(10, 1, fl[1]); b.px(10, 10, fl[1]);
        for (var y = 3; y <= 8; y++) for (var x = 3; x <= 8; x++) {
          var alt = ln.id === 'braided' ? (x + y) % 2 : y % 2;
          b.px(x, y, alt ? c[1] : c[0]);
        }
        b.line(8, 8, 11, 11, c[0]);
        if (ln.id === 'legend') { b.px(5, 4, 'white'); b.px(6, 6, 'white'); }
        b.outline('ink');
      }, 'gear');
    });
    var rods = {
      bamboo: { s: 'sand', s2: 'woodLight', h: 'wood', reel: null, node: 'woodLight' },
      fiber: { s: 'white', s2: 'greyLight', h: 'sand', reel: 'grey', wrap: 'blue' },
      carbon: { s: 'slateDark', s2: 'navy', h: 'wood', reel: 'slate', wrap: 'red' },
      master: { s: 'amber', s2: 'orange', h: 'wood', reel: 'greyLight', wrap: 'yellow' },
      // jazerné prúty: olovený (sivý, ťažká rukoväť), grafitový (čierny lesk), zirkóniový (svetlý s modrou)
      lead_rod: { s: 'grey', s2: 'slate', h: 'slateDark', reel: 'greyLight', wrap: 'yellow' },
      graphite_rod: { s: 'slate', s2: 'ink', h: 'slateDark', reel: 'grey', wrap: 'greenLight' },
      zirconium_rod: { s: 'greyLight', s2: 'cyan', h: 'slate', reel: 'white', wrap: 'blue' },
    };
    (HL.data.rods || []).concat(HL.data.lakeRods || []).forEach(function (rd) {
      var r = rods[rd.id] || rods.bamboo;
      def('rod_' + rd.id, 12, 12, 1, function (b) {
        b.line(3, 9, 11, 1, r.s); b.line(3, 10, 10, 3, r.s2);
        b.line(0, 11, 3, 8, r.h); b.line(1, 11, 3, 9, r.h);
        if (r.node) { b.px(6, 6, r.node); b.px(9, 3, r.node); }
        if (r.wrap) { b.px(6, 5, r.wrap); b.px(9, 2, r.wrap); }
        if (r.reel) { b.rect(3, 10, 2, 2, r.reel); }
        b.outline('ink');
        b.px(11, 0, 'greyLight');
      }, 'gear');
    });
    (HL.data.hooks || []).forEach(function (hk) {
      def('hook_' + hk.id, 12, 12, 1, function (b) {
        var m = hk.id === 'titan' ? ['cyan', 'greyLight'] : hk.id === 'circle' ? ['greyLight', 'slate'] : ['greyLight', 'grey'];
        if (hk.id === 'circle') {
          shapeEll(6, 6.5, 4, 4, function (x, y) { b.px(x, y, y < 6 ? m[0] : m[1]); });
          shapeEll(6, 6.5, 2.8, 2.8, function (x, y) { b.px(x, y, 0); });
          b.px(3, 4, 0); b.px(4, 4, 0); b.px(4, 5, m[0]);
          b.px(6, 1, m[0]); b.px(6, 0, m[1]);
        } else {
          var thick = hk.id === 'titan';
          b.line(7, 1, 7, 8, m[0]); if (thick) b.line(8, 1, 8, 8, m[1]);
          b.px(6, 9, m[1]); b.px(5, 10, m[1]); b.px(4, 10, m[1]); b.px(3, 9, m[0]); b.px(2, 8, m[0]); b.px(2, 7, m[0]); b.px(2, 6, 'white');
          if (thick) { b.px(6, 10, m[1]); b.px(3, 10, m[1]); }
          if (hk.id === 'barbed' || thick) { b.px(3, 7, m[1]); }
          b.px(7, 0, m[1]); b.px(6, 0, m[1]); b.px(8, 0, m[1]);
        }
        b.outline('ink');
      }, 'gear');
    });
  }

  // =================================================================== DEDINA
  function defineVillage() {
    def('boat_small', 26, 12, 1, function (b) {
      b.line(5, 1, 16, 9, 'woodLight');
      b.poly([[0, 4], [25, 4], [21, 10], [4, 10]], 'wood');
      b.line(1, 4, 24, 4, 'sand'); b.line(1, 5, 23, 5, 'woodLight');
      b.line(4, 9, 21, 9, 'plum');
      b.line(8, 7, 18, 7, 'woodLight');
      b.px(12, 3, 'wood'); b.px(13, 3, 'wood');
      b.outline('ink');
    }, 'village');
    def('boat_big', 50, 34, 1, function (b) {
      // sťažeň, lanovie, vlajka
      b.line(18, 1, 18, 20, 'wood');
      b.line(18, 2, 2, 19, 'grey'); b.line(18, 2, 45, 16, 'grey');
      b.rect(19, 1, 4, 2, 'red'); b.px(19, 3, 'redDark');
      b.poly([[18, 6], [9, 18], [18, 18]], 'sandLight'); b.line(17, 7, 17, 17, 'sand');
      // kabína
      b.rect(26, 9, 13, 11, 'sandLight'); b.rect(25, 7, 15, 2, 'rust'); b.rect(26, 9, 13, 1, 'white');
      b.rect(28, 12, 3, 3, 'navy'); b.rect(33, 12, 3, 3, 'navy');
      [[28, 12], [33, 12]].forEach(function (w) { for (var j = 0; j < 3; j++) for (var i = 0; i < 3; i++) b.g[(w[1] + j) * b.w + w[0] + i] = b.ci(i + j < 2 ? 'yellow' : 'amber'); });
      b.px(38, 5, 'slateDark'); b.rect(37, 4, 2, 3, 'slateDark');
      // trup
      b.poly([[1, 19], [48, 17], [44, 31], [6, 31]], 'white');
      b.each(function (x, y) { if (y >= 19 && b.is(x, y, 'white')) b.px(x, y, y > 25 ? (y > 29 ? 'redDark' : 'red') : y === 19 ? 'white' : 'greyLight'); });
      b.line(2, 22, 46, 21, 'blueDark');
      b.px(40, 24, 'navy'); b.px(12, 24, 'navy');
      b.outline('ink');
    }, 'village');

    function villager(b, f, c) {
      var s = f ? 1 : 0;
      // nohy
      b.line(3 - s, 10, 3 - s, 12, c.leg); b.line(5 + s, 10, 5 + s, 12, c.leg);
      b.px(3 - s, 13, c.shoe); b.px(5 + s, 13, c.shoe); b.px(2 - s, 13, c.shoe); b.px(6 + s, 13, c.shoe);
      // telo
      b.rect(2, 5, 5, 5, c.body); b.rect(2, 9, 5, 1, c.body2);
      if (c.apron) b.rect(3, 6, 3, 4, c.apron);
      // ruky kývajú
      b.px(1, 6 + s, c.body2); b.px(1, 7 + s, c.skin); b.px(7, 7 - s, c.body2); b.px(7, 8 - s, c.skin);
      // hlava
      b.rect(3, 2, 3, 3, c.skin); b.px(5, 3, 'ink');
      c.hat(b);
      b.outline('ink');
    }
    def('villager_a', 9, 15, 2, function (b, f) {
      villager(b, f, { leg: 'navy', shoe: 'wood', body: 'amber', body2: 'orange', skin: 'skinLight',
        hat: function (b) { b.rect(2, 1, 5, 1, 'amber'); b.rect(3, 0, 3, 1, 'yellow'); b.px(7, 2, 'amber'); b.px(1, 2, 'amber'); } });
    }, 'village');
    def('villager_b', 9, 15, 2, function (b, f) {
      villager(b, f, { leg: 'skin', shoe: 'plum', body: 'green', body2: 'greenDark', skin: 'skin', apron: 'sandLight',
        hat: function (b) { b.rect(2, 1, 5, 1, 'red'); b.rect(3, 0, 3, 1, 'red'); b.px(2, 2, 'wood'); b.px(2, 3, 'wood'); b.px(1, 4, 'redDark'); } });
    }, 'village');

    def('pier', 50, 18, 1, function (b) {
      for (var x = 3; x < 50; x += 11) { b.rect(x, 5, 2, 13, 'wood'); b.px(x + 1, 6, 'plum'); b.rect(x, 16, 2, 2, 'plum'); }
      b.line(4, 7, 14, 14, 'wood'); b.line(15, 7, 25, 14, 'wood'); b.line(26, 7, 36, 14, 'wood');
      b.rect(0, 2, 50, 3, 'woodLight'); b.rect(0, 2, 50, 1, 'sand');
      for (x = 3; x < 50; x += 5) b.px(x, 3, 'wood');
      b.rect(0, 4, 50, 1, 'wood');
      b.rect(45, 0, 3, 2, 'slate'); b.px(45, 0, 'grey');
      b.outline('ink');
    }, 'village');
    def('lamp', 7, 22, 1, function (b) {
      b.rect(3, 7, 1, 13, 'slate'); b.rect(2, 19, 3, 2, 'slate'); b.rect(2, 20, 3, 1, 'slateDark');
      b.rect(1, 1, 5, 1, 'grey'); b.px(3, 0, 'grey');
      b.rect(1, 2, 5, 4, 'slate');
      b.rect(2, 2, 3, 3, 'amber');
      for (var j = 0; j < 3; j++) for (var i = 0; i < 3; i++) b.glow(2 + i, 2 + j, i === 1 && j < 2 ? 'yellow' : 'amber');
      b.rect(2, 6, 3, 1, 'slate');
      b.outline('ink');
    }, 'village');
    def('gull', 13, 9, 2, function (b, f) {
      shapeEll(6.5, 5, 3.5, 1.8, function (x, y) { b.px(x, y, y > 5 ? 'greyLight' : 'white'); });
      b.px(10, 4, 'white'); b.px(11, 4, 'amber'); b.px(9, 4, 'ink');
      // krídla ako "M": hore (snímok 0) a dole (snímok 1), tmavé končeky
      if (f) { b.poly([[4, 5], [1, 8], [3, 8], [6, 5]], 'grey'); b.poly([[7, 5], [10, 8], [12, 8], [9, 5]], 'grey'); b.px(1, 8, 'slateDark'); b.px(11, 8, 'slateDark'); }
      else { b.poly([[4, 4], [2, 0], [0, 1], [5, 5]], 'grey'); b.poly([[8, 4], [10, 0], [12, 1], [7, 5]], 'grey'); b.px(0, 1, 'slateDark'); b.px(11, 0, 'slateDark'); }
      b.px(3, 5, 'grey');
      b.outline('ink');
    }, 'village');
  }

  // =================================================================== BUDOVY
  // Pomocníci na budovy. Súradnice sú od ľavého horného rohu; spodný riadok plátna je zem.
  // Okno: cez deň tmavé sklo, v noci (vrstva svetiel) teplé žlté — preto sa svetlo
  // zapisuje iba do svietiacej vrstvy (B.light), obrázok ostáva denný.
  B.light = function (x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (this.inside(x, y) && this.d[y * this.w + x]) this.g[y * this.w + x] = this.ci(c);
  };
  function planks(b, x, y, w, h, light) {
    for (var i = 0; i < w; i++) for (var j = 0; j < h; j++) {
      var seam = (i % 4) === 3;
      b.px(x + i, y + j, seam ? 'wood' : (light ? ((i >> 2) % 2 ? 'sand' : 'woodLight') : ((i >> 2) % 2 ? 'woodLight' : 'wood')));
    }
    for (i = 0; i < w; i++) b.px(x + i, y + h - 1, light ? 'wood' : 'plum');
  }
  function bricks(b, x, y, w, h) {
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
      var row = j >> 1, off = row % 2 ? 2 : 0;
      var mortar = (j % 2 === 1) || ((i + off) % 4 === 3);
      b.px(x + i, y + j, mortar ? 'slate' : (j < 2 ? 'greyLight' : 'grey'));
    }
  }
  function roof(b, x0, x1, yTop, yBase, c, style) {
    // sedlová strecha: štít uprostred, presah o 1 px, riadky škridiel striedavo
    var cx = (x0 + x1) / 2;
    b.poly([[x0 - 1, yBase + 1], [cx, yTop], [x1 + 1, yBase + 1]], c[1]);
    b.each(function (x, y) {
      if (y < yTop || y > yBase || !b.is(x, y, c[1])) return;
      var edge = !b.at(x, y - 1) || !b.at(x - 1, y) || !b.at(x + 1, y);
      if (edge && x <= cx) b.px(x, y, c[0]);
      else if (style !== 'flat' && (y - yTop) % 3 === 2) b.px(x, y, c[2]);
    });
    b.line(x0 - 1, yBase + 1, x1 + 1, yBase + 1, c[2]);
  }
  function shedRoof(b, x0, x1, yHigh, yLow, c) {
    b.poly([[x0 - 1, yHigh], [x1 + 2, yLow], [x1 + 2, yLow + 2], [x0 - 1, yHigh + 2]], c[1]);
    b.line(x0 - 1, yHigh, x1 + 1, yLow, c[0]);
  }
  function win(b, x, y, w, h, lit, frame) {
    b.rect(x - 1, y - 1, w + 2, h + 2, frame || 'plum');
    b.rect(x, y, w, h, 'navy');
    b.px(x, y, 'blueDark');
    if (w > 2 && h > 2) { b.line(x + (w >> 1), y, x + (w >> 1), y + h - 1, frame || 'plum'); }
    if (lit) for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
      if (b.is(x + i, y + j, 'navy') || b.is(x + i, y + j, 'blueDark')) b.light(x + i, y + j, (i + j) < 2 ? 'yellow' : 'amber');
    }
  }
  function door(b, x, y, w, h, c, lit) {
    b.rect(x, y, w, h, c || 'wood');
    b.rect(x, y, 1, h, 'plum');
    b.px(x + w - 2, y + (h >> 1), 'amber');
    if (lit) for (var j = 1; j < h; j++) for (var i = 1; i < w - 1; i++) b.light(x + i, y + j, j < 2 ? 'yellow' : 'orange');
  }
  function lantern(b, x, y) {
    b.px(x, y - 1, 'slateDark');
    b.px(x, y, 'amber'); b.px(x, y + 1, 'amber');
    b.light(x, y, 'yellow'); b.light(x, y + 1, 'amber');
  }
  function smoke(b, x, y, n) {
    for (var k = 0; k < n; k++) shapeEll(x + k * 2, y - k * 3, 1.6 + k * 0.4, 1.3 + k * 0.3, function (xx, yy) { if (!b.at(xx, yy)) b.px(xx, yy, k % 2 ? 'greyLight' : 'white'); });
  }
  function grass(b, x0, x1, y) {
    for (var x = x0; x <= x1; x++) if (noise(x, y, 9) > 0.6) { b.px(x, y, 'green'); if (noise(x, y, 10) > 0.6) b.px(x, y - 1, 'greenLight'); }
  }
  function awning(b, x, y, w, c1, c2) {
    for (var i = 0; i < w; i++) {
      var c = ((i >> 1) % 2) ? c2 : c1;
      b.px(x + i, y, c); b.px(x + i, y + 1, c); b.px(x + i, y + 2, c);
      if (i % 2 === 0) b.px(x + i, y + 3, c);
    }
    b.line(x, y, x + w - 1, y, c1 === 'white' ? 'greyLight' : c1);
  }
  function crate(b, x, y, s) {
    b.rect(x, y, s, s, 'woodLight'); b.line(x, y, x + s - 1, y + s - 1, 'wood'); b.rect(x, y, s, 1, 'sand');
  }
  function barrel(b, x, y) {
    b.rect(x, y, 4, 5, 'wood'); b.rect(x + 1, y, 2, 5, 'woodLight'); b.rect(x, y + 1, 4, 1, 'slate'); b.rect(x, y + 3, 4, 1, 'slate');
  }
  function fishIcon(b, x, y, c) { b.px(x, y, c); b.px(x + 1, y, c); b.px(x + 2, y, c); b.px(x - 1, y - 1, c); b.px(x - 1, y + 1, c); b.px(x + 2, y - 1, c === 'white' ? 'greyLight' : c); }
  function bld(id, lvl, w, h, fn) {
    def('bld_' + id + '_' + lvl, w, h, 1, function (b) {
      fn(b);
      b.outline('ink');
      b.meta.ground = h - 1;
    }, 'building');
    GEN['bld_' + id + '_' + lvl + '_lights'] = { w: w, h: h, frames: 1, src: 'bld_' + id + '_' + lvl, kind: 'lights' };
  }

  function defineBuildings() {
    // ------------------------------------------------ Chatrč
    bld('chatrc', 0, 30, 18, function (b) {
      planks(b, 3, 9, 7, 8); b.px(3, 8, 'wood'); b.px(5, 7, 'woodLight'); b.px(8, 8, 'wood');
      planks(b, 20, 12, 6, 5); b.px(21, 11, 'wood'); b.px(24, 11, 'woodLight');
      b.line(5, 5, 20, 10, 'wood'); b.line(5, 6, 20, 11, 'plum'); b.px(12, 7, 0); b.px(13, 8, 0);
      b.line(11, 16, 19, 14, 'woodLight');
      b.px(9, 14, 'navy'); b.px(8, 14, 'navy'); b.px(8, 13, 'navy');
      grass(b, 1, 28, 16);
    });
    bld('chatrc', 1, 30, 24, function (b) {
      planks(b, 5, 12, 20, 11);
      roof(b, 3, 26, 3, 11, ['woodLight', 'wood', 'plum']);
      door(b, 12, 16, 4, 7, 'wood');
      win(b, 19, 15, 3, 3, true);
      b.px(8, 15, 'plum'); b.px(9, 18, 'plum');
      grass(b, 1, 28, 22);
    });
    bld('chatrc', 2, 40, 28, function (b) {
      planks(b, 28, 17, 9, 10); shedRoof(b, 27, 37, 15, 17, ['woodLight', 'wood']);
      barrel(b, 30, 22); crate(b, 34, 23, 3);
      planks(b, 4, 14, 24, 13);
      roof(b, 2, 29, 3, 13, ['clay', 'rust', 'redDark']);
      door(b, 13, 19, 4, 8, 'wood', true);
      win(b, 6, 17, 3, 3, true); win(b, 21, 17, 4, 3, true);
      grass(b, 1, 38, 26);
    });
    bld('chatrc', 3, 50, 38, function (b) {
      smoke(b, 36, 6, 3);
      b.rect(33, 7, 4, 9, 'grey'); b.rect(33, 7, 4, 1, 'greyLight'); b.rect(33, 8, 1, 8, 'slate');
      bricks(b, 4, 33, 38, 4);
      planks(b, 5, 19, 36, 14, true);
      roof(b, 2, 43, 6, 18, ['pink', 'red', 'redDark']);
      door(b, 20, 24, 5, 9, 'wood', true);
      win(b, 8, 22, 4, 4, true, 'wood'); win(b, 31, 22, 4, 4, true, 'wood');
      win(b, 21, 12, 3, 3, true, 'wood');
      b.rect(7, 27, 6, 2, 'wood'); b.rect(30, 27, 6, 2, 'wood');
      [8, 10, 12, 31, 33, 35].forEach(function (x) { b.px(x, 26, x % 4 ? 'pink' : 'yellow'); b.px(x - 1, 26, 'green'); });
      lantern(b, 27, 23);
      // prístavba s plotom
      b.rect(43, 29, 6, 1, 'woodLight'); b.rect(44, 28, 1, 8, 'wood'); b.rect(48, 28, 1, 8, 'wood'); b.rect(43, 32, 6, 1, 'woodLight');
      grass(b, 1, 48, 36);
    });

    // ------------------------------------------------ Trhovisko
    bld('trhovisko', 0, 30, 12, function (b) {
      crate(b, 4, 6, 5); b.px(5, 6, 0); b.px(6, 7, 0); b.px(7, 6, 0);
      crate(b, 11, 8, 3);
      b.rect(22, 2, 2, 9, 'wood'); b.px(22, 1, 'woodLight');
      b.line(15, 10, 26, 9, 'woodLight');
      grass(b, 1, 28, 10);
    });
    bld('trhovisko', 1, 32, 22, function (b) {
      b.rect(5, 6, 2, 15, 'wood'); b.rect(25, 6, 2, 15, 'wood');
      awning(b, 3, 3, 26, 'red', 'white');
      b.rect(4, 14, 24, 2, 'woodLight'); b.rect(4, 16, 24, 1, 'wood');
      b.rect(6, 17, 20, 4, 'wood'); b.line(6, 18, 25, 18, 'plum');
      fishIcon(b, 9, 13, 'blue'); fishIcon(b, 15, 13, 'greyLight'); fishIcon(b, 21, 13, 'pink');
      lantern(b, 8, 8);
      crate(b, 27, 17, 4);
    });
    bld('trhovisko', 2, 44, 26, function (b) {
      [3, 19, 22, 38].forEach(function (x) { b.rect(x, 8, 2, 17, 'wood'); });
      awning(b, 1, 5, 20, 'red', 'white'); awning(b, 21, 5, 21, 'blue', 'white');
      b.rect(2, 17, 18, 2, 'woodLight'); b.rect(3, 19, 16, 5, 'wood');
      b.rect(23, 17, 18, 2, 'woodLight'); b.rect(24, 19, 16, 5, 'wood');
      fishIcon(b, 6, 16, 'blue'); fishIcon(b, 12, 16, 'greyLight'); fishIcon(b, 27, 16, 'pink'); fishIcon(b, 33, 16, 'amber');
      // tabuľa s cenami
      b.rect(15, 0, 14, 5, 'wood'); b.rect(16, 1, 12, 3, 'tealDark');
      b.line(17, 2, 20, 2, 'white'); b.line(22, 2, 26, 3, 'greenLight');
      lantern(b, 6, 10); lantern(b, 36, 10);
    });
    bld('trhovisko', 3, 56, 34, function (b) {
      roof(b, 2, 53, 1, 12, ['blue', 'blueDark', 'navy']);
      [3, 20, 36, 52].forEach(function (x) { b.rect(x, 13, 2, 20, 'wood'); b.rect(x, 13, 1, 20, 'woodLight'); });
      awning(b, 5, 14, 15, 'red', 'white'); awning(b, 21, 14, 15, 'amber', 'white'); awning(b, 37, 14, 15, 'blue', 'white');
      [5, 21, 37].forEach(function (x) {
        b.rect(x, 25, 15, 2, 'woodLight'); b.rect(x + 1, 27, 13, 6, 'wood');
        fishIcon(b, x + 3, 24, 'blue'); fishIcon(b, x + 9, 24, x === 21 ? 'amber' : 'greyLight');
      });
      // zástava s rybou
      b.rect(22, 5, 12, 5, 'amber'); b.rect(22, 9, 12, 1, 'orange'); fishIcon(b, 27, 7, 'rust');
      // girlanda svetielok pod odkvapom
      for (var x = 4; x < 52; x += 4) { var y = 13 + (x % 8 === 0 ? 1 : 0); b.px(x, y, 'amber'); b.light(x, y, 'yellow'); }
      crate(b, 53, 29, 2);
    });

    // ------------------------------------------------ Dielňa
    bld('dielna', 0, 30, 12, function (b) {
      b.rect(3, 8, 14, 1, 'woodLight'); b.rect(4, 7, 12, 1, 'wood'); b.rect(3, 6, 10, 1, 'woodLight');
      b.line(20, 6, 27, 6, 'woodLight'); b.line(20, 7, 18, 10, 'wood'); b.line(21, 7, 23, 10, 'wood'); b.line(26, 7, 24, 10, 'wood'); b.line(27, 7, 29, 10, 'wood');
      grass(b, 1, 28, 10);
    });
    bld('dielna', 1, 32, 24, function (b) {
      planks(b, 3, 10, 24, 13);
      shedRoof(b, 2, 27, 5, 9, ['grey', 'slate']);
      b.rect(6, 13, 9, 10, 'plum'); b.rect(6, 13, 9, 1, 'wood');
      b.line(8, 15, 8, 21, 'greyLight'); b.line(11, 14, 13, 21, 'woodLight'); b.px(12, 16, 'slate');
      for (var j = 0; j < 9; j++) for (var i = 0; i < 9; i++) if (j > 3) b.light(6 + i, 14 + j, j > 6 ? 'orange' : 'amber');
      win(b, 20, 14, 3, 3, true);
      // štít s háčikom
      b.rect(27, 12, 4, 6, 'sandLight'); b.line(29, 13, 29, 16, 'slate'); b.px(28, 16, 'slate');
    });
    bld('dielna', 2, 44, 30, function (b) {
      smoke(b, 33, 5, 2);
      b.rect(31, 5, 3, 8, 'slate'); b.rect(31, 5, 3, 1, 'grey');
      planks(b, 3, 13, 32, 16);
      roof(b, 1, 36, 4, 12, ['grey', 'slate', 'slateDark']);
      b.rect(15, 18, 8, 11, 'plum'); for (var j = 2; j < 11; j++) for (var i = 0; i < 8; i++) b.light(15 + i, 18 + j, j > 7 ? 'orange' : 'amber');
      b.rect(15, 18, 8, 1, 'wood');
      win(b, 6, 17, 4, 3, true); win(b, 27, 17, 4, 3, true);
      // stojan s prútmi
      b.line(37, 12, 37, 28, 'sand'); b.line(39, 14, 39, 28, 'woodLight'); b.line(41, 11, 40, 28, 'sand'); b.rect(36, 27, 7, 1, 'wood');
      barrel(b, 10, 24);
    });
    bld('dielna', 3, 54, 40, function (b) {
      smoke(b, 36, 5, 3);
      bricks(b, 32, 6, 6, 12);
      bricks(b, 3, 18, 36, 21);
      roof(b, 1, 40, 8, 17, ['grey', 'slate', 'slateDark']);
      planks(b, 40, 24, 12, 15); shedRoof(b, 39, 52, 21, 24, ['woodLight', 'wood']);
      // vyhňa v dverách
      b.rect(15, 26, 10, 13, 'ink');
      for (var j = 0; j < 13; j++) for (var i = 0; i < 10; i++) if (j > 5) b.light(15 + i, 26 + j, j > 9 ? 'orange' : (i % 3 ? 'amber' : 'yellow'));
      b.rect(17, 34, 6, 2, 'slateDark'); b.rect(19, 36, 2, 3, 'slateDark');
      win(b, 6, 23, 5, 4, true, 'slateDark'); win(b, 29, 23, 5, 4, true, 'slateDark');
      // štít s nákovou
      b.rect(10, 11, 8, 5, 'sandLight'); b.rect(11, 13, 6, 1, 'slateDark'); b.rect(13, 14, 2, 1, 'slateDark'); b.rect(11, 12, 3, 1, 'slateDark');
      // cievka vlasca
      b.rect(44, 33, 6, 5, 'wood'); b.rect(45, 34, 4, 3, 'cyan');
      win(b, 44, 27, 4, 3, true);
    });

    // ------------------------------------------------ Návnadáreň
    bld('navnadaren', 0, 28, 18, function (b) {
      planks(b, 5, 7, 17, 10);
      shedRoof(b, 4, 22, 4, 6, ['wood', 'plum']);
      b.rect(8, 9, 11, 5, 'navy');
      b.line(8, 9, 18, 13, 'woodLight'); b.line(8, 13, 18, 9, 'woodLight');
      grass(b, 1, 26, 16);
    });
    bld('navnadaren', 1, 30, 22, function (b) {
      planks(b, 5, 8, 20, 13);
      shedRoof(b, 4, 25, 4, 6, ['clay', 'rust']);
      b.rect(8, 10, 12, 5, 'navy');
      for (var i = 0; i < 12; i++) for (var j = 0; j < 5; j++) b.light(8 + i, 10 + j, j < 2 ? 'yellow' : 'amber');
      b.line(7, 9, 20, 7, 'woodLight');   // odklopená okenica
      b.rect(7, 15, 14, 1, 'woodLight');
      b.rect(9, 12, 4, 3, 'slate'); b.px(10, 12, 'sandLight'); b.px(11, 12, 'sand');
      // štítok s červíkom
      b.rect(22, 11, 6, 4, 'sandLight'); b.px(23, 13, 'pink'); b.px(24, 12, 'pink'); b.px(25, 13, 'pink'); b.px(26, 12, 'pink');
    });
    bld('navnadaren', 2, 38, 26, function (b) {
      planks(b, 4, 10, 26, 15);
      roof(b, 2, 31, 2, 9, ['clay', 'rust', 'redDark']);
      b.rect(7, 13, 11, 5, 'navy'); for (var i = 0; i < 11; i++) for (var j = 0; j < 5; j++) b.light(7 + i, 13 + j, j < 2 ? 'yellow' : 'amber');
      b.rect(6, 18, 13, 1, 'woodLight');
      door(b, 22, 16, 4, 9, 'wood');
      barrel(b, 30, 20); barrel(b, 33, 20);
      // štít s kalamárom
      b.rect(10, 4, 7, 4, 'sandLight'); b.px(12, 5, 'pink'); b.px(13, 5, 'pink'); b.px(14, 5, 'pink'); b.px(12, 6, 'pink'); b.px(14, 6, 'pink');
    });
    bld('navnadaren', 3, 46, 30, function (b) {
      planks(b, 3, 11, 38, 18, true);
      roof(b, 1, 42, 1, 10, ['cyan', 'blue', 'blueDark']);
      // výklad s poličkami svietiacich pohárov
      b.rect(6, 14, 18, 10, 'navy'); b.rect(6, 18, 18, 1, 'wood'); b.rect(6, 23, 18, 1, 'wood');
      for (var x = 7; x < 24; x += 3) {
        b.px(x, 16, 'cyan'); b.px(x, 17, 'cyan'); b.px(x + 1, 21, 'greenLight'); b.px(x + 1, 22, 'greenLight');
        b.light(x, 16, 'cyan'); b.light(x, 17, 'white'); b.light(x + 1, 21, 'greenLight'); b.light(x + 1, 22, 'cyan');
      }
      door(b, 29, 18, 5, 10, 'wood', true);
      // svietiaci štít
      b.rect(13, 3, 14, 5, 'slateDark'); for (var i = 0; i < 12; i++) { b.px(14 + i, 5, i % 3 ? 'cyan' : 'white'); b.light(14 + i, 5, 'cyan'); }
      barrel(b, 36, 24);
    });

    // ------------------------------------------------ Meteostanica
    bld('meteostanica', 0, 28, 12, function (b) {
      // len lavička a pohľad na oblohu
      b.rect(6, 6, 12, 1, 'woodLight'); b.rect(6, 7, 12, 1, 'wood'); b.rect(7, 8, 1, 3, 'wood'); b.rect(16, 8, 1, 3, 'wood');
      b.rect(6, 3, 12, 1, 'woodLight'); b.rect(7, 4, 1, 2, 'wood'); b.rect(16, 4, 1, 2, 'wood');
      b.rect(22, 3, 1, 8, 'wood'); b.px(23, 3, 'greyLight'); b.px(24, 4, 'grey');
      grass(b, 1, 26, 10);
    });
    bld('meteostanica', 1, 28, 28, function (b) {
      b.rect(8, 4, 1, 23, 'slate');
      b.line(4, 3, 12, 3, 'grey'); b.px(13, 3, 'grey'); b.px(12, 2, 'grey'); b.px(12, 4, 'grey');
      b.px(3, 2, 'red'); b.px(4, 2, 'red'); b.px(3, 4, 'red'); b.px(4, 4, 'red');
      b.px(8, 2, 'amber');
      // meteorologická búdka so žalúziami
      b.rect(15, 15, 10, 8, 'white'); for (var y = 16; y < 23; y += 2) b.line(16, y, 23, y, 'greyLight');
      b.rect(14, 14, 12, 1, 'greyLight');
      b.rect(16, 23, 1, 4, 'slate'); b.rect(23, 23, 1, 4, 'slate');
      b.px(24, 17, 'red'); b.light(24, 17, 'red');
      b.px(8, 2, 'amber'); b.light(8, 2, 'yellow');
      grass(b, 1, 26, 26);
    });
    bld('meteostanica', 2, 36, 38, function (b) {
      // stožiar s miskami anemometra
      b.rect(22, 3, 1, 20, 'slate');
      b.line(17, 5, 27, 5, 'grey'); b.rect(16, 4, 2, 2, 'greyLight'); b.rect(27, 4, 2, 2, 'greyLight'); b.rect(21, 1, 2, 2, 'greyLight');
      b.line(18, 10, 26, 10, 'grey'); b.px(27, 10, 'red'); b.px(17, 9, 'red'); b.px(17, 11, 'red');
      planks(b, 6, 24, 24, 13, true);
      roof(b, 4, 31, 16, 23, ['greyLight', 'grey', 'slate']);
      win(b, 10, 27, 4, 3, true); win(b, 22, 27, 4, 3, true);
      door(b, 16, 28, 4, 9, 'wood');
      b.rect(31, 30, 4, 4, 'white'); b.rect(32, 34, 1, 3, 'slate');
    });
    bld('meteostanica', 3, 44, 50, function (b) {
      // veža s pozorovacou plošinou a kupolou radaru
      b.rect(21, 1, 1, 8, 'slate'); b.px(21, 0, 'red'); b.light(21, 0, 'red');
      shapeEll(21.5, 12, 6, 5, function (x, y) { if (y <= 12) b.px(x, y, x < 20 ? 'white' : 'greyLight'); });
      b.rect(14, 12, 16, 2, 'slate');
      b.rect(15, 14, 14, 9, 'sandLight'); win(b, 17, 16, 4, 3, true); win(b, 24, 16, 4, 3, true);
      b.rect(12, 23, 20, 2, 'woodLight'); for (var x = 12; x < 32; x += 3) b.rect(x, 21, 1, 2, 'wood');
      bricks(b, 14, 25, 16, 24);
      win(b, 19, 29, 5, 4, true, 'slateDark');
      door(b, 19, 40, 5, 9, 'wood', true);
      // veterný rukáv a vlajky
      b.rect(36, 18, 1, 31, 'slate'); b.rect(37, 18, 3, 2, 'orange'); b.rect(40, 19, 2, 1, 'white'); b.rect(42, 19, 1, 1, 'orange');
      b.rect(6, 26, 1, 23, 'slate'); b.rect(7, 26, 4, 3, 'blue'); b.px(7, 27, 'white');
      b.rect(33, 42, 5, 5, 'white'); for (var y = 43; y < 47; y += 2) b.line(34, y, 37, y, 'greyLight');
    });

    // ------------------------------------------------ Maják
    function tower(b, cx, yTop, yBot, wTop, wBot, stripes) {
      for (var y = yTop; y <= yBot; y++) {
        var t = (y - yTop) / (yBot - yTop), hw = lerp(wTop, wBot, t) / 2;
        for (var x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) {
          var band = stripes ? Math.floor((y - yTop) / stripes) % 2 : 0;
          var shade = x > cx + hw * 0.4;
          var c = band ? (shade ? 'redDark' : 'red') : (shade ? 'greyLight' : 'white');
          if (!stripes) c = shade ? 'grey' : 'greyLight';
          b.px(x, y, c);
        }
      }
    }
    function lampRoom(b, cx, y, w, lit) {
      b.rect(cx - (w >> 1) - 1, y + 5, w + 3, 1, 'slateDark');
      b.rect(cx - (w >> 1), y + 1, w + 1, 4, 'navy');
      for (var x = cx - (w >> 1); x <= cx + (w >> 1); x += 2) b.rect(x, y + 1, 1, 4, 'slateDark');
      b.poly([[cx - (w >> 1) - 1, y + 1], [cx + 0.5, y - 3], [cx + (w >> 1) + 2, y + 1]], 'red');
      b.px(cx, y - 4, 'slateDark');
      if (lit) for (var j = 1; j < 5; j++) for (var i = -(w >> 1); i <= (w >> 1); i++) b.light(cx + i, y + j, Math.abs(i) < 2 ? 'white' : 'yellow');
    }
    bld('majak', 0, 28, 30, function (b) {
      for (var y = 10; y <= 28; y++) for (var x = 9; x <= 19; x++) {
        var jag = y < 14 && noise(x, 1, 13) * 4 > y - 10;
        if (!jag) b.px(x, y, x > 16 ? 'slate' : (noise(x, y, 14) > 0.8 ? 'slate' : 'grey'));
      }
      b.rect(12, 21, 4, 8, 'ink');
      b.rect(3, 26, 4, 3, 'grey'); b.rect(21, 25, 3, 4, 'slate'); b.px(24, 28, 'grey');
      grass(b, 1, 26, 28);
    });
    bld('majak', 1, 28, 44, function (b) {
      tower(b, 14, 12, 42, 8, 12, 0);
      lampRoom(b, 14, 5, 6, true);
      door(b, 12, 36, 4, 7, 'wood');
      win(b, 13, 22, 2, 3, false);
      grass(b, 1, 26, 42);
    });
    bld('majak', 2, 32, 58, function (b) {
      tower(b, 16, 14, 56, 10, 16, 7);
      b.rect(8, 12, 17, 2, 'slateDark'); for (var x = 8; x < 25; x += 2) b.px(x, 11, 'slateDark');
      lampRoom(b, 16, 5, 8, true);
      door(b, 14, 49, 5, 8, 'wood', true);
      win(b, 15, 30, 2, 3, true, 'slateDark');
      grass(b, 1, 30, 56);
    });
    bld('majak', 3, 44, 72, function (b) {
      tower(b, 18, 16, 70, 12, 20, 8);
      b.rect(9, 14, 19, 2, 'slateDark'); for (var x = 9; x < 28; x += 2) b.px(x, 13, 'slateDark');
      lampRoom(b, 18, 6, 10, true);
      // lúče svetla do strán
      [[5, 9], [1, 9], [31, 9], [35, 9], [3, 8], [33, 8], [3, 10], [33, 10]].forEach(function (p) { b.px(p[0], p[1], 'yellow'); b.light(p[0], p[1], 'yellow'); });
      b.rect(6, 9, 2, 1, 'yellow'); b.light(6, 9, 'yellow'); b.light(7, 9, 'yellow');
      b.rect(29, 9, 2, 1, 'yellow'); b.light(29, 9, 'yellow'); b.light(30, 9, 'yellow');
      door(b, 16, 62, 5, 9, 'wood', true);
      win(b, 17, 30, 2, 3, true, 'slateDark'); win(b, 17, 46, 2, 3, true, 'slateDark');
      // domček strážcu
      planks(b, 29, 60, 12, 11, true); roof(b, 28, 41, 54, 59, ['clay', 'rust', 'redDark']);
      win(b, 33, 63, 3, 3, true);
    });

    // ------------------------------------------------ Krčma
    bld('krcma', 0, 36, 26, function (b) {
      planks(b, 3, 11, 30, 14);
      b.poly([[1, 12], [10, 3], [24, 5], [35, 12]], 'wood');
      b.line(1, 12, 10, 3, 'woodLight'); b.px(15, 5, 0); b.px(16, 6, 0); b.px(20, 6, 0);
      [[6, 14], [24, 14]].forEach(function (w) {
        b.rect(w[0], w[1], 5, 4, 'navy');
        b.line(w[0] - 1, w[1], w[0] + 5, w[1] + 3, 'woodLight'); b.line(w[0] - 1, w[1] + 3, w[0] + 5, w[1], 'woodLight');
      });
      b.rect(15, 16, 5, 9, 'wood'); b.line(14, 18, 20, 18, 'woodLight'); b.line(14, 22, 20, 22, 'woodLight');
      b.line(27, 24, 32, 22, 'woodLight');
      grass(b, 1, 34, 24);
    });
    bld('krcma', 1, 38, 28, function (b) {
      planks(b, 3, 12, 32, 15);
      roof(b, 1, 36, 2, 11, ['clay', 'rust', 'redDark']);
      door(b, 16, 18, 5, 9, 'wood', true);
      win(b, 6, 15, 5, 4, true); win(b, 26, 15, 5, 4, true);
      // vývesný štít s krígľom
      b.line(33, 13, 37, 13, 'slateDark'); b.rect(33, 14, 5, 5, 'sandLight');
      b.rect(34, 15, 2, 3, 'amber'); b.px(34, 15, 'white'); b.px(36, 16, 'amber');
    });
    bld('krcma', 2, 46, 36, function (b) {
      bricks(b, 3, 24, 38, 11);
      planks(b, 4, 12, 36, 12);
      roof(b, 2, 41, 1, 11, ['clay', 'rust', 'redDark']);
      b.rect(3, 23, 38, 1, 'woodLight'); for (var x = 4; x < 40; x += 3) b.px(x, 22, 'wood');
      win(b, 7, 15, 4, 4, true); win(b, 18, 15, 4, 4, true); win(b, 31, 15, 4, 4, true);
      win(b, 7, 27, 5, 4, true, 'slateDark'); win(b, 31, 27, 5, 4, true, 'slateDark');
      door(b, 19, 26, 6, 9, 'wood', true);
      barrel(b, 41, 30); barrel(b, 37, 30);
      b.line(42, 16, 45, 16, 'slateDark'); b.rect(42, 17, 4, 5, 'sandLight'); b.rect(43, 18, 2, 3, 'amber');
    });
    bld('krcma', 3, 56, 44, function (b) {
      smoke(b, 44, 4, 3);
      b.rect(41, 5, 4, 8, 'grey'); b.rect(41, 5, 4, 1, 'greyLight');
      bricks(b, 3, 30, 50, 13);
      planks(b, 4, 16, 48, 14);
      roof(b, 2, 53, 4, 15, ['pink', 'red', 'redDark']);
      b.rect(3, 29, 50, 1, 'woodLight'); for (var x = 4; x < 52; x += 3) b.px(x, 28, 'wood');
      [7, 17, 36, 46].forEach(function (x) { win(b, x, 19, 4, 4, true); });
      win(b, 26, 8, 4, 3, true);
      [6, 14, 38, 46].forEach(function (x) { win(b, x, 33, 4, 4, true, 'slateDark'); });
      door(b, 24, 32, 7, 11, 'wood', true);
      // lampióny pod odkvapom
      for (x = 5; x < 52; x += 6) lantern(b, x, 16);
      // lavica a sudy
      b.rect(0, 40, 6, 1, 'woodLight'); b.rect(1, 41, 1, 2, 'wood'); b.rect(4, 41, 1, 2, 'wood');
      barrel(b, 51, 38);
      b.line(25, 26, 30, 26, 'slateDark'); b.rect(24, 22, 8, 4, 'sandLight'); b.rect(26, 23, 3, 2, 'amber');
    });

    // ------------------------------------------------ Akvárium
    function tank(b, x, y, w, h, seed) {
      b.rect(x - 1, y - 1, w + 2, h + 2, 'slate');
      b.rect(x, y, w, h, 'blue'); b.rect(x, y, w, 1, 'cyan');
      for (var i = 0; i < w; i++) if (noise(i, seed, 30) > 0.6) b.px(x + i, y + h - 1, 'green');
      var cs = ['orange', 'yellow', 'pink', 'white'];
      for (var k = 0; k < Math.max(1, w * h / 18); k++) {
        var fx = x + 1 + Math.floor(noise(k, seed, 31) * (w - 3)), fy = y + 2 + Math.floor(noise(k, seed, 32) * (h - 4));
        b.px(fx, fy, cs[k % cs.length]); b.px(fx + 1, fy, cs[k % cs.length]); b.px(fx - 1, fy, 'blueDark');
      }
      for (var j = 0; j < h; j++) for (i = 0; i < w; i++) {
        var v = b.at(x + i, y + j);
        b.light(x + i, y + j, v === b.ci('blue') ? 'blue' : v);
      }
    }
    bld('akvarium', 0, 32, 22, function (b) {
      b.rect(4, 18, 24, 3, 'grey'); b.rect(4, 18, 24, 1, 'greyLight');
      b.rect(6, 4, 1, 14, 'woodLight'); b.rect(25, 4, 1, 14, 'woodLight'); b.rect(15, 8, 1, 10, 'woodLight');
      b.rect(5, 8, 22, 1, 'wood'); b.rect(5, 13, 22, 1, 'wood');
      b.line(6, 13, 15, 8, 'wood'); b.line(16, 8, 25, 13, 'wood');
      b.rect(9, 15, 4, 3, 'rust'); b.rect(10, 14, 2, 1, 'rust'); b.line(9, 16, 12, 16, 'redDark');
      b.rect(28, 12, 1, 8, 'wood'); b.rect(27, 10, 4, 3, 'amber'); b.px(28, 11, 'ink');
      grass(b, 1, 30, 20);
    });
    bld('akvarium', 1, 34, 26, function (b) {
      b.rect(3, 9, 28, 16, 'sandLight'); b.rect(3, 24, 28, 1, 'sand');
      b.rect(2, 6, 30, 3, 'slateDark'); b.rect(2, 6, 30, 1, 'slate');
      tank(b, 6, 12, 15, 9, 1);
      door(b, 24, 16, 4, 8, 'wood', true);
      b.rect(22, 11, 8, 3, 'blue'); fishIcon(b, 25, 12, 'white');
    });
    bld('akvarium', 2, 46, 32, function (b) {
      b.rect(3, 11, 40, 20, 'sandLight'); b.rect(3, 30, 40, 1, 'sand');
      roof(b, 1, 44, 2, 10, ['cyan', 'blue', 'blueDark'], 'flat');
      tank(b, 6, 15, 12, 9, 2); tank(b, 28, 15, 12, 9, 3);
      door(b, 20, 21, 6, 9, 'wood', true);
      // nástenná maľba ryby nad dverami
      b.rect(19, 13, 8, 5, 'blue'); fishIcon(b, 22, 15, 'amber');
      b.rect(43, 5, 1, 25, 'slate'); b.rect(44, 5, 2, 3, 'red');
      b.rect(0, 25, 3, 5, 'amber'); b.rect(0, 24, 3, 1, 'rust');
    });
    bld('akvarium', 3, 56, 44, function (b) {
      // trofej: zlatá ryba na podstavci na vrchole kupoly
      b.rect(26, 5, 4, 2, 'slate');
      b.px(25, 2, 'amber'); b.rect(26, 1, 4, 3, 'yellow'); b.px(30, 2, 'amber'); b.px(31, 1, 'amber'); b.px(31, 3, 'amber'); b.px(29, 1, 'ink');
      b.light(27, 2, 'yellow'); b.light(28, 2, 'yellow');
      // sklenená kupola
      shapeEll(28, 17, 12, 10, function (x, y) { if (y <= 16) b.px(x, y, (x + y) % 6 === 0 || y === 12 ? 'white' : (y < 11 ? 'cyan' : 'blue')); });
      for (var y = 8; y <= 16; y++) for (var x = 16; x <= 40; x++) if (b.is(x, y, 'cyan') || b.is(x, y, 'blue')) b.light(x, y, 'cyan');
      b.rect(3, 17, 50, 26, 'sandLight'); b.rect(3, 42, 50, 1, 'sand');
      b.rect(2, 16, 52, 2, 'slate');
      tank(b, 6, 21, 12, 10, 4); tank(b, 38, 21, 12, 10, 5);
      tank(b, 21, 21, 14, 6, 6);
      door(b, 24, 32, 8, 10, 'wood', true);
      [6, 12, 43, 49].forEach(function (x) { b.rect(x, 34, 2, 8, 'greyLight'); b.rect(x, 34, 2, 1, 'white'); });
    });
  }

  // ------------------------------------------------------------------ build all
  function ensure() {
    if (built) return;
    pal();
    built = true;
    defineFish();
    defineCreatures();
    defineProps();
    defineIcons();
    defineGear();
    defineVillage();
    defineBuildings();
  }

  // ------------------------------------------------------------------ canvas
  function makeCanvas(w, h) {
    if (typeof document === 'undefined') return null;
    var c = document.createElement('canvas');
    c.width = Math.max(1, w); c.height = Math.max(1, h);
    return c;
  }
  // Bitmapa -> canvas. layer 'd' obrázok, 'g' svetlá; solid = jedna farba (silueta).
  function toCanvas(b, layer, solid) {
    var c = makeCanvas(b.w, b.h);
    if (!c) return { width: b.w, height: b.h, bitmap: b, layer: layer, solid: solid || 0 };
    var ctx = c.getContext('2d');
    var img = ctx.createImageData(b.w, b.h), src = layer === 'g' ? b.g : b.d, px = img.data;
    for (var i = 0; i < src.length; i++) {
      var v = src[i];
      if (!v) continue;
      var rgb = RGB[solid || v];
      px[i * 4] = rgb[0]; px[i * 4 + 1] = rgb[1]; px[i * 4 + 2] = rgb[2]; px[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return c;
  }

  function resolve(name) {
    ensure();
    if (GEN[name]) return name;
    if (GEN['fish_' + name]) return 'fish_' + name;   // holé id ryby je alias
    return null;
  }
  function frameOf(g, frame) {
    var n = g.frames;
    return n > 1 ? (((frame | 0) % n) + n) % n : 0;
  }
  function noteMissing(name) {
    if (S.missing.indexOf(name) < 0) S.missing.push(name);
  }
  // Zástupný obrázok: purpurovo-čierna šachovnica, aby chýbajúci sprite bolo vidno hneď.
  function placeholder() {
    var b = new Bmp(8, 8);
    for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) b.px(x, y, ((x >> 1) + (y >> 1)) % 2 ? 'magenta' : 'ink');
    return b;
  }

  // ------------------------------------------------------------------ API
  var RESERVED_FISH = [['red', 'rust'], ['greenLight', 'green'], ['magenta', 'pink']];
  S.RESERVED_FISH = RESERVED_FISH;
  // Ryba nesmie mať VÝPLŇ vo farbe vody, v ktorej ju hráč vidí (slepý kritik ryby kolo 2: chrbát tuniaka = voda
  // v 320 m → v hre len brucho a plutvy). Meria tests/unit/fish_art.test.js (voda podľa HL.sea.qDay a rampy miesta,
  // pod 600 m / 300 m voda vo svetle háčika; obrys sa nepočíta — ten je tmavší tón tela). Výmeny pre druhy nad 15 %
  // tela; smer ako vo vzore: ryba svetlejšia / sivšia než voda, tmavšie diely tmavšie než voda.
  var FISH_WATER = {
    tuniak: [['blueDark', 'slate'], ['navy', 'slateDark']],
    latimeria: [['blueDark', 'slate'], ['navy', 'slateDark']],
    strazca: [['navy', 'blueDark']],
    kral_burky: [['navy', 'purple']],
    velkoustka: [['plum', 'purple']],
    pyskac: [['blue', 'slate'], ['blueDark', 'navy']],
    sardinka: [['blue', 'blueDark']],
    trojoky_ostriez: [['tealDark', 'slateDark']],
  };
  S.FISH_WATER = FISH_WATER;
  S.missing = [];

  // Čistá bitmapa (bez canvasu) — pre testy v Node a pre nástroje. null = neznáme meno.
  S.bitmap = function (name, frame) {
    var n = resolve(name);
    if (!n) return null;
    var g = GEN[n], f = frameOf(g, frame), key = n + '#' + f;
    if (!BMP[key]) {
      var b;
      if (g.src) {
        var base = S.bitmap(g.src, f);
        b = new Bmp(base.w, base.h);
        b.d.set(base.g);
      } else {
        b = new Bmp(g.w, g.h);
        g.fn(b, f);
        if (g.kind === 'fish') {
          // Vyhradené farby ponoru (ART_SPEC §3) na rybe ako ozdoba nie: red = napätie/nebezpečenstvo → rust (rovnaký jas),
          // greenLight = „ťukaj teraz" v boji → green, magenta → pink. Slepý kritik ryby kolo 1 (F8): papagájovka na háčiku
          // mala bok greenLight, krab a mesačnica čistú červenú. Svietiaca vrstva (b.g, len v tme) ostáva. PRED obrysom,
          // aby obrys vznikol z konečnej farby tela.
          for (var ri = 0; ri < RESERVED_FISH.length; ri++) b.swap(RESERVED_FISH[ri][0], RESERVED_FISH[ri][1]);
          var fw = FISH_WATER[n.replace(/^fish_/, '')] || [];
          for (var wi = 0; wi < fw.length; wi++) b.swap(fw[wi][0], fw[wi][1]);
          if (HL.T && HL.T.fishOutline > 0) b.rampOutline(Math.round(HL.T.fishOutline));
        }
      }
      BMP[key] = b;
    }
    return BMP[key];
  };

  S.get = function (name, frame) {
    var n = resolve(name);
    if (!n) {
      noteMissing(name);
      if (!CAN['?']) CAN['?'] = toCanvas(placeholder(), 'd');
      return CAN['?'];
    }
    var f = frameOf(GEN[n], frame), key = n + '#' + f + '#d';
    if (!CAN[key]) CAN[key] = toCanvas(S.bitmap(n, f), 'd');
    return CAN[key];
  };

  S.fish = function (id, frame) {
    ensure();
    if (!GEN['fish_' + id]) return S.get('fish_' + id, frame);
    return S.get('fish_' + id, frame);
  };

  function speciesData(id) {
    var all = (HL.data.allFish || HL.data.fish || []).concat(HL.data.allLegends || HL.data.legends || []);
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  // Rozmer nakresleného obrázka ryby + trieda a miesto úst (kam patrí háčik).
  S.fishSize = function (id) {
    var n = resolve('fish_' + id);
    if (!n) { noteMissing('fish_' + id); return { w: 8, h: 8, cls: 16, frames: 1, mouth: { x: 8, y: 4 } }; }
    var b = S.bitmap(n, 0), sd = speciesData(id);
    var m = b.meta.mouth || [b.w, b.h >> 1];
    return { w: b.w, h: b.h, cls: sd ? sd.size : 16, frames: GEN[n].frames, mouth: { x: m[0], y: m[1] } };
  };

  // Rozmer ľubovoľného sprite (pre rozloženie UI bez vytvárania canvasu).
  S.size = function (name) {
    var n = resolve(name);
    if (!n) return { w: 8, h: 8, frames: 1 };
    var b = S.bitmap(n, 0);
    return { w: b.w, h: b.h, frames: GEN[n].frames };
  };
  S.frames = function (name) { var n = resolve(name); return n ? GEN[n].frames : 1; };
  // Body pre umiestnenie: mouth (ryby — kam patrí háčik), anchor (háčik — kde je
  // uviazaný vlasec), ground (budovy — riadok zeme = spodný riadok plátna).
  S.meta = function (name) { var n = resolve(name); return n ? S.bitmap(n, 0).meta : {}; };

  // Jednofarebná silueta (encyklopédia: nechytený druh = tieň; varovanie pred žralokom).
  S.silhouette = function (id, frame, color) {
    var n = resolve(id);
    if (!n) { noteMissing(id); return S.get(id, frame); }
    var col = color || 'slate';
    var f = frameOf(GEN[n], frame), key = n + '#' + f + '#s:' + col;
    if (!CAN[key]) CAN[key] = toCanvas(S.bitmap(n, f), 'd', IDX[col] || IDX.slate);
    return CAN[key];
  };

  // Len svietiace pixely, na rovnakom mieste ako v obrázku — kreslia sa NAD tmou.
  // Ryby, ktoré podľa dát nesvietia (glow:false), vrátia null.
  S.glowMask = function (id, frame) {
    var n = resolve(id);
    if (!n) { noteMissing(id); return null; }
    if (GEN[n].kind === 'fish') {
      var sd = speciesData(n.slice(5));
      if (sd && !sd.glow) return null;
    }
    var f = frameOf(GEN[n], frame), b = S.bitmap(n, f);
    if (!b.glowCount()) return null;
    var key = n + '#' + f + '#g';
    if (!CAN[key]) CAN[key] = toCanvas(b, 'g');
    return CAN[key];
  };

  // Všetky mená, ktoré pozná get() (ryby ako fish_<id>).
  S.list = function () { ensure(); return Object.keys(GEN); };

  // Pre nástroje: druh sprite (fish, creature, prop, icon, building, lights, village).
  S.kind = function (name) { var n = resolve(name); return n ? GEN[n].kind : null; };

  // Zahodí vyrovnávaciu pamäť (napr. po zmene palety v ladení).
  S.clearCache = function () { BMP = {}; CAN = {}; };

  // Registrácia spritov z iného modulu (gfx/seascape.js: rastliny a orientačné body podmoria) —
  // ten istý zápis ako vyššie: kresba do indexov palety, cache, svetlá, testy cez S.bitmap.
  S.def = def;
  S.shape = { ell: shapeEll, poly: shapePoly };
  S.noise = noise;
  // Pomôcky kresby pre moduly, ktoré pridávajú sprity v tom istom štýle (jadrové jazero: gfx/sprites_lake_fish.js,
  // gfx/sprites_lake.js). Tie isté funkcie ako vyššie — ryba z iného súboru sa kreslí rovnakým telom, okom
  // a obrysom; budova rovnakými doskami, strechou, oknami a svetlami (bld vyrobí aj vrstvu _lights).
  S.kit = {
    def: def, fishDef: fishDef, bld: bld,
    fishBody: fishBody, eelBody: eelBody, geom: geom, paintBody: paintBody, fin: fin, tail: tail, eye: eye,
    shapeEll: shapeEll, shapePoly: shapePoly, noise: noise, dith: dith, lerp: lerp, band: band,
    planks: planks, bricks: bricks, roof: roof, shedRoof: shedRoof, win: win, door: door, lantern: lantern,
    smoke: smoke, grass: grass, awning: awning, crate: crate, barrel: barrel, fishIcon: fishIcon, rock: rock, cloud: cloud,
  };

  // Pre testy: bitmapa ako trieda (kontrolná sonda si vyrobí vlastnú chybnú).
  S._Bmp = Bmp;
  S._dith = dith;
})(globalThis.HL);
