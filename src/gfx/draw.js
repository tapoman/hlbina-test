// Kresliace primitíva. Všetko na celé pixely a iba farbami z palety: plynulé
// prechody (tma, hmla, záblesk) sa robia usporiadaným ditheringom (Bayer 4×4),
// nie priehľadnosťou — tá by vyrobila farby mimo palety a rozmazala pixel art.
//
// darkness() beží v hlbinách KAŽDÝ snímok, preto je postavená na cache:
//   - vzor tmy pre každú zo 17 úrovní je hotový CanvasPattern,
//   - svetlo je vopred vyrobená „pečiatka" (diera s ditherovaným okrajom) pre
//     každý polomer a fázu Bayerovej mriežky, vyrazí sa cez destination-out,
//   - všetko sa skladá v jednom offscreen plátne a na scénu ide jediným drawImage.
(function (HL) {
  var D = HL.draw = {};
  var T = HL.T;

  T.def('Grafika', 'gfxLightInner', 0.5, 0.05, 0.95, 0.05, 'Svetlo v tme: podiel polomeru úplne bez tmy (zvyšok je ditherovaný okraj)');

  // Bayerova matica 4×4: prah pixela (x, y) = BAYER[(y & 3) * 4 + (x & 3)] ∈ 0..15.
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  D.BAYER = BAYER;
  // Úroveň 0..1 -> počet zapnutých pixelov zo 16 (0 = nič, 16 = plná farba).
  D.levelN = function (level) {
    if (!(level > 0)) return 0;
    return level >= 1 ? 16 : Math.round(level * 16);
  };
  D.bayer = function (x, y) { return BAYER[((y & 3) << 2) | (x & 3)]; };
  D.dithered = function (x, y, level) { return D.bayer(x, y) < D.levelN(level); };

  // Nové plátno (prehliadač: <canvas>, worker: OffscreenCanvas, Node: null).
  D.canvas = function (w, h) {
    if (typeof document !== 'undefined' && document.createElement) {
      var c = document.createElement('canvas'); c.width = w; c.height = h; return c;
    }
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
    return null;
  };

  function col(c) {
    if (!c) return HL.pal.white;
    if (c.charAt(0) !== '#' && HL.pal[c]) return HL.pal[c];
    return c;
  }

  // ------------------------------------------------------------------ vzory ditheringu
  var patterns = {}, patCtx = null;
  D.pattern = function (color, n) {
    color = col(color);
    var key = color + '|' + n;
    var p = patterns[key];
    if (p !== undefined) return p;
    var c = D.canvas(4, 4);
    if (!c) { patterns[key] = null; return null; }
    var x = c.getContext('2d');
    x.fillStyle = color;
    for (var i = 0; i < 16; i++) if (BAYER[i] < n) x.fillRect(i & 3, i >> 2, 1, 1);
    if (!patCtx) patCtx = D.canvas(1, 1).getContext('2d');
    p = patCtx.createPattern(c, 'repeat');
    patterns[key] = p;
    return p;
  };

  // ------------------------------------------------------------------ základ
  D.rect = function (ctx, x, y, w, h, c) {
    if (w <= 0 || h <= 0) return;
    ctx.fillStyle = col(c);
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };
  // Jednopixelový obrys.
  D.frame = function (ctx, x, y, w, h, c) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    if (w <= 0 || h <= 0) return;
    ctx.fillStyle = col(c);
    ctx.fillRect(x, y, w, 1);
    ctx.fillRect(x, y + h - 1, w, 1);
    ctx.fillRect(x, y + 1, 1, h - 2);
    ctx.fillRect(x + w - 1, y + 1, 1, h - 2);
  };
  D.px = function (ctx, x, y, c) { ctx.fillStyle = col(c); ctx.fillRect(Math.round(x), Math.round(y), 1, 1); };

  // Pixelová čiara (Bresenham) — žiadne vyhladzovanie, žiadne polopriehľadné okraje.
  D.pline = function (ctx, x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    ctx.fillStyle = col(c);
    if (y0 === y1) { ctx.fillRect(Math.min(x0, x1), y0, Math.abs(x1 - x0) + 1, 1); return; }
    if (x0 === x1) { ctx.fillRect(x0, Math.min(y0, y1), 1, Math.abs(y1 - y0) + 1); return; }
    var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    var dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    var err = dx + dy;
    for (var guard = 0; guard < 4096; guard++) {
      ctx.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      var e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };

  // Kruh po riadkoch (plný) alebo obrys (filled === false).
  D.circle = function (ctx, cx, cy, r, c, filled) {
    cx = Math.round(cx); cy = Math.round(cy);
    ctx.fillStyle = col(c);
    if (r < 0.5) { ctx.fillRect(cx, cy, 1, 1); return; }
    var ro = (r + 0.5) * (r + 0.5), ri = (r - 0.5) * (r - 0.5);
    var R = Math.ceil(r);
    for (var dy = -R; dy <= R; dy++) {
      var q = ro - dy * dy;
      if (q < 0) continue;
      var so = Math.floor(Math.sqrt(q));
      if (filled === false) {
        // obrys = pixely s (r − ½)² < d² ≤ (r + ½)²; v každom riadku súvislý úsek na oboch stranách
        var qi = ri - dy * dy;
        var a = qi >= 0 ? Math.floor(Math.sqrt(qi)) + 1 : -so;
        if (a > so) continue;
        if (a <= 0) { ctx.fillRect(cx - so, cy + dy, so * 2 + 1, 1); continue; }
        ctx.fillRect(cx - so, cy + dy, so - a + 1, 1);
        ctx.fillRect(cx + a, cy + dy, so - a + 1, 1);
      } else {
        ctx.fillRect(cx - so, cy + dy, so * 2 + 1, 1);
      }
    }
  };

  // ------------------------------------------------------------------ dithering
  D.dither = function (ctx, x, y, w, h, color, level) {
    var n = D.levelN(level);
    if (n <= 0 || w <= 0 || h <= 0) return;
    if (n >= 16) { D.rect(ctx, x, y, w, h, color); return; }
    var p = D.pattern(color, n);
    if (!p) return;
    ctx.fillStyle = p;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };

  // Zvislý prechod colA (hore) -> colB (dole); t0/t1 = podiel colB na hornom/dolnom
  // okraji (0 = čisté A, 1 = čisté B). Riadky s rovnakou úrovňou idú jedným fillRect.
  D.ditherGradient = function (ctx, x, y, w, h, colA, colB, t0, t1) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    if (w <= 0 || h <= 0) return;
    if (t0 == null) t0 = 0;
    if (t1 == null) t1 = 1;
    D.rect(ctx, x, y, w, h, colA);
    var runStart = 0, runN = -1;
    for (var r = 0; r <= h; r++) {
      var n = r < h ? D.levelN(h > 1 ? t0 + (t1 - t0) * r / (h - 1) : t0) : -2;
      if (n !== runN) {
        if (runN > 0) D.dither(ctx, x, y + runStart, w, r - runStart, colB, runN / 16);
        runStart = r; runN = n;
      }
    }
  };

  // ------------------------------------------------------------------ tma a svetlá
  // Množstvo svetla vo vzdialenosti d od stredu svetla s polomerom r (1 = plné, 0 = tma).
  D.lightAt = function (d, r) {
    var inner = r * T.gfxLightInner;
    if (d <= inner) return 1;
    if (d >= r) return 0;
    return 1 - (d - inner) / (r - inner);
  };
  // Referenčná (pomalá) odpoveď: je pixel (x, y) po darkness() tmavý? Tma pixela je
  // min(úroveň, 1 − svetlo) pre každé svetlo — rýchla cesta nižšie MUSÍ dať to isté
  // (overuje tools/gfx_check.js pixel po pixeli).
  D.darkAt = function (x, y, level, lights) {
    var b = D.bayer(x, y);
    if (b >= D.levelN(level)) return false;
    for (var i = 0; lights && i < lights.length; i++) {
      var L = lights[i];
      var R = lightR(L.r);
      if (!(R > 0)) continue;
      var lx = Math.round(L.x), ly = Math.round(L.y);
      var d = Math.sqrt((x - lx) * (x - lx) + (y - ly) * (y - ly));
      if (b >= Math.round((1 - D.lightAt(d, R)) * 16)) return false;
    }
    return true;
  };
  // Polomery sa zaokrúhľujú na celé px — pečiatka sa tak dá znovu použiť.
  function lightR(r) { return Math.round(r); }

  var stamps = new Map();
  function stampFor(R, phx, phy) {
    var key = R + ':' + phx + ':' + phy + ':' + T.gfxLightInner;
    var s = stamps.get(key);
    if (s) return s;
    if (stamps.size > 256) stamps.clear(); // blikajúce polomery nesmú cache nafúknuť
    var size = 2 * R + 1;
    var c = D.canvas(size, size);
    var x = c.getContext('2d');
    var img = x.createImageData(size, size);
    var dd = img.data;
    for (var j = 0; j < size; j++) {
      for (var i = 0; i < size; i++) {
        var dx = i - R, dy = j - R;
        var a = D.lightAt(Math.sqrt(dx * dx + dy * dy), R);
        if (a <= 0) continue;
        // svetová súradnica pixela = fáza + i (fáza je poloha ľavého horného rohu mod 4)
        var b = BAYER[(((phy + j) & 3) << 2) | ((phx + i) & 3)];
        if (b >= Math.round((1 - a) * 16)) dd[(j * size + i) * 4 + 3] = 255; // diera
      }
    }
    x.putImageData(img, 0, 0);
    stamps.set(key, c);
    return c;
  }

  var dark = { c: null, x: null, w: 0, h: 0 };
  D.darkness = function (ctx, w, h, level, lights) {
    var n = D.levelN(level);
    if (n <= 0) return;
    w = Math.round(w); h = Math.round(h);
    if (!dark.c || dark.w !== w || dark.h !== h) {
      dark.c = D.canvas(w, h);
      if (!dark.c) return;
      dark.x = dark.c.getContext('2d');
      dark.w = w; dark.h = h;
    }
    var b = dark.x;
    b.globalCompositeOperation = 'copy';
    b.fillStyle = n >= 16 ? HL.pal.ink : D.pattern(HL.pal.ink, n);
    b.fillRect(0, 0, w, h);
    b.globalCompositeOperation = 'destination-out';
    for (var i = 0; lights && i < lights.length; i++) {
      var L = lights[i];
      var R = lightR(L.r);
      if (!(R > 0)) continue;
      var lx = Math.round(L.x), ly = Math.round(L.y);
      if (lx + R < 0 || ly + R < 0 || lx - R >= w || ly - R >= h) continue;
      var x0 = lx - R, y0 = ly - R;
      b.drawImage(stampFor(R, x0 & 3, y0 & 3), x0, y0);
    }
    b.globalCompositeOperation = 'source-over';
    ctx.drawImage(dark.c, 0, 0);
  };

  // ------------------------------------------------------------------ stmavenie po rampe
  // Stmaví UŽ NAKRESLENÉ pixely v obdĺžniku: každá farba palety sa posunie o `steps` stupňov
  // dolu po svojej rampe (HL.pal.darker). Nahrádza stmavenie šachovnicou (dither 'ink'), ktoré
  // na 1× vyzeralo ako mriežka cez obraz; výsledok ostáva presne v palete (aj farba mimo
  // palety sa najprv zaokrúhli na najbližšiu). Súradnice ako všetko ostatné (rešpektuje posun
  // a mierku ctx), ALE getImageData/putImageData nepoznajú orez — obdĺžnik drž v kreslenej ploche.
  // Cena (celá plocha 180×320, headless Edge, tools/fix_input_shade.js): samotný prepočet ~0,5 ms,
  // ale prvé čítanie v snímku vynúti dokreslenie všetkého predtým → snímok + shade o 3–6 ms dlhší.
  // Preto JEDNO volanie na snímok cez celú plochu, nie veľa malých.
  D.shade = function (ctx, x, y, w, h, steps) {
    steps = Math.round(steps || 0);
    if (steps <= 0 || !(w > 0) || !(h > 0) || !ctx.getImageData) return;
    var m = ctx.getTransform ? ctx.getTransform() : null;
    var sx = m ? m.a : 1, sy = m ? m.d : 1, tx = m ? m.e : 0, ty = m ? m.f : 0;
    var x0 = Math.round(x * sx + tx), y0 = Math.round(y * sy + ty);
    var x1 = Math.round((x + w) * sx + tx), y1 = Math.round((y + h) * sy + ty);
    var cw = ctx.canvas ? ctx.canvas.width : x1, ch = ctx.canvas ? ctx.canvas.height : y1;
    x0 = Math.max(0, x0); y0 = Math.max(0, y0); x1 = Math.min(cw, x1); y1 = Math.min(ch, y1);
    if (x1 <= x0 || y1 <= y0) return;
    var img = ctx.getImageData(x0, y0, x1 - x0, y1 - y0), d = img.data;
    var dk = HL.pal.darkerRGB, lastIn = -1, lastOut = 0;
    for (var i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) continue; // priehľadný pixel (offscreen plátno) ostáva priehľadný
      var v = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
      if (v !== lastIn) { lastIn = v; lastOut = dk(v, steps); } // susedné pixely mávajú rovnakú farbu
      d[i] = lastOut >> 16; d[i + 1] = (lastOut >> 8) & 255; d[i + 2] = lastOut & 255; d[i + 3] = 255;
    }
    ctx.putImageData(img, x0, y0);
  };

  // ------------------------------------------------------------------ oblúk napätia
  // Pixely medzikružia (r − thick, r] s uhlom; uložené po riadkoch, aby sa súvislé
  // úseky kreslili jedným fillRect. Uhly ako canvas: 0 = doprava, kladne v smere hodín.
  var rings = {};
  function ringPixels(r, thick) {
    var key = r + ':' + thick;
    if (rings[key]) return rings[key];
    var list = [];
    var R = Math.ceil(r) + 1;
    for (var dy = -R; dy <= R; dy++) {
      for (var dx = -R; dx <= R; dx++) {
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d <= r + 0.5 && d > r - thick + 0.5) list.push(dx, dy, Math.atan2(dy, dx));
      }
    }
    rings[key] = list;
    return list;
  }
  D.arcPixels = function (r, thick, a0, a1) {
    var out = [], list = ringPixels(Math.round(r), Math.max(1, Math.round(thick)));
    var span = a1 - a0, TAU = Math.PI * 2;
    for (var i = 0; i < list.length; i += 3) {
      var a = list[i + 2] - a0;
      a = ((a % TAU) + TAU) % TAU;
      if (span >= TAU || a <= span + 1e-9) out.push(list[i], list[i + 1]);
    }
    return out;
  };
  D.arc = function (ctx, cx, cy, r, a0, a1, thick, color) {
    if (!(a1 > a0)) return;
    cx = Math.round(cx); cy = Math.round(cy);
    var p = D.arcPixels(r, thick || 1, a0, a1);
    ctx.fillStyle = col(color);
    var rs = 0;
    for (var i = 0; i < p.length; i += 2) {
      var endRun = i + 2 >= p.length || p[i + 3] !== p[i + 1] || p[i + 2] !== p[i] + 1;
      if (endRun) {
        ctx.fillRect(cx + p[rs], cy + p[rs + 1], p[i] - p[rs] + 1, 1);
        rs = i + 2;
      }
    }
  };

  // ------------------------------------------------------------------ panely a lišty
  // Obrys s odrezanými rohmi — pixel-artový „zaoblený" rám.
  function cutRect(ctx, x, y, w, h, c) {
    D.rect(ctx, x + 1, y, w - 2, h, c);
    D.rect(ctx, x, y + 1, w, h - 2, c);
  }
  D.panel = function (ctx, x, y, w, h, style) {
    var P = HL.pal;
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    if (w < 4 || h < 4) { D.rect(ctx, x, y, w, h, P.navy); return; }
    if (style === 'dark') {
      cutRect(ctx, x, y, w, h, P.navy);
      D.rect(ctx, x + 1, y + 1, w - 2, h - 2, P.ink);
      D.rect(ctx, x + 1, y + 1, 1, 1, P.slateDark);
      D.rect(ctx, x + w - 2, y + 1, 1, 1, P.slateDark);
    } else if (style === 'paper') {
      // tabuľa v dedine: piesočný papier v drevenom ráme, klinčeky v rohoch
      cutRect(ctx, x, y, w, h, P.wood);
      D.rect(ctx, x + 1, y + 1, w - 2, h - 2, P.sand);
      D.rect(ctx, x + 1, y + 1, w - 2, h - 3, P.sandLight);
      if (w >= 8 && h >= 8) {
        D.rect(ctx, x + 2, y + 2, 1, 1, P.woodLight);
        D.rect(ctx, x + w - 3, y + 2, 1, 1, P.woodLight);
        D.rect(ctx, x + 2, y + h - 4, 1, 1, P.woodLight);
        D.rect(ctx, x + w - 3, y + h - 4, 1, 1, P.woodLight);
      }
    } else if (style === 'wood') {
      cutRect(ctx, x, y, w, h, P.plum);
      D.rect(ctx, x + 1, y + 1, w - 2, h - 2, P.woodLight);
      D.rect(ctx, x + 1, y + 1, w - 2, 1, P.sand);
      for (var py = y + 7; py < y + h - 2; py += 7) D.rect(ctx, x + 1, py, w - 2, 1, P.wood);
      D.rect(ctx, x + 1, y + h - 2, w - 2, 1, P.wood);
    } else {
      // 'default': tmavý bridlicový rám
      cutRect(ctx, x, y, w, h, P.ink);
      D.rect(ctx, x + 1, y + 1, w - 2, h - 2, P.slateDark);
      D.rect(ctx, x + 2, y + 2, w - 4, h - 4, P.navy);
      D.rect(ctx, x + 2, y + 1, w - 4, 1, P.slate);
    }
  };

  D.bar = function (ctx, x, y, w, h, frac, fill, bg, border) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    var P = HL.pal;
    if (border !== null) { D.rect(ctx, x, y, w, h, border || P.ink); x++; y++; w -= 2; h -= 2; }
    D.rect(ctx, x, y, w, h, bg || P.navy);
    var f = frac > 0 ? (frac >= 1 ? 1 : frac) : 0;
    D.rect(ctx, x, y, Math.round(w * f), h, fill || P.greenLight);
  };

  // Sprite na celé pixely; flip = zrkadlovo (sprity hľadia doprava).
  D.sprite = function (ctx, img, x, y, opts) {
    if (!img) return;
    x = Math.round(x); y = Math.round(y);
    var flip = opts && opts.flip, alpha = opts && opts.alpha, s = (opts && opts.scale) || 1;
    if (!flip && alpha == null && s === 1) { ctx.drawImage(img, x, y); return; }
    ctx.save();
    if (alpha != null) ctx.globalAlpha = alpha;
    if (flip) { ctx.translate(x + img.width * s, y); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, img.width * s, img.height * s); }
    else ctx.drawImage(img, x, y, img.width * s, img.height * s);
    ctx.restore();
  };
})(globalThis.HL);
