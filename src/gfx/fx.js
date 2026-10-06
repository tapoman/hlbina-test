// Efekty: častice z pevného zásobníka, plávajúci text, trasenie, záblesk a počasie.
//
// Zásobník má pevnú veľkosť a pri preplnení prepíše najstaršie častice — žiadne
// alokácie počas hry (GC záseky by rozbili rytmus boja). Častice nikdy nemiznú
// priehľadnosťou (tá vyrába farby mimo palety); ku koncu života blikajú alebo
// stmavnú o stupeň rampy.
//
// Počasie (rain/fog/snow) je BEZ STAVU: poloha každej kvapky je funkcia času t
// a jej indexu, takže sa dá nakresliť ľubovoľný snímok a dva behy vyzerajú rovnako.
(function (HL) {
  var X = HL.fx = {};
  var T = HL.T;

  T.def('Efekty', 'fxAmount', 1, 0, 3, 0.1, 'Množstvo častíc (násobok)');
  T.def('Efekty', 'fxShakeScale', 1, 0, 3, 0.1, 'Sila trasenia obrazovky (násobok)');
  T.def('Efekty', 'fxTextSec', 1.1, 0.3, 4, 0.1, 'Plávajúci text: trvanie (s)');
  T.def('Efekty', 'fxTextRise', 18, 0, 60, 1, 'Plávajúci text: stúpanie (px/s)');

  var POOL = 384, TEXTS = 16;

  // Druhy častíc. Farby sú mená z palety; n = predvolený počet.
  var KINDS = {
    bubbles:   { n: 6,  life: [1.2, 2.4], speed: [4, 10],  angle: [-2.0, -1.1], g: -14, drag: 0.6, colors: ['cyan', 'blue', 'white'] },
    splash:    { n: 14, life: [0.45, 0.9], speed: [30, 75], angle: [-2.7, -0.45], g: 170, drag: 0.2, colors: ['white', 'cyan', 'blue'] },
    sparkGood: { n: 10, life: [0.25, 0.5], speed: [30, 70], angle: [-Math.PI, Math.PI], g: 0, drag: 3.5, colors: ['greenLight', 'yellow', 'white'] },
    sparkBad:  { n: 10, life: [0.25, 0.55], speed: [25, 65], angle: [-Math.PI, Math.PI], g: 60, drag: 3, colors: ['red', 'orange', 'magenta'] },
    snapBurst: { n: 28, life: [0.4, 0.95], speed: [40, 120], angle: [-Math.PI, Math.PI], g: 40, drag: 2.2, colors: ['white', 'greyLight', 'red', 'yellow'] },
    ink:       { n: 12, life: [1.0, 1.8], speed: [6, 22],  angle: [-Math.PI, Math.PI], g: -2, drag: 1.2, colors: ['purple', 'plum', 'navy'] },
    coins:     { n: 8,  life: [0.8, 1.2], speed: [45, 85], angle: [-2.3, -0.85], g: 190, drag: 0.1, colors: ['amber'] },
    scales:    { n: 10, life: [1.0, 1.8], speed: [8, 26],  angle: [-2.6, -0.5], g: 26, drag: 1.5, colors: ['white', 'cyan', 'greyLight', 'blue'] },
  };
  X.KINDS = Object.keys(KINDS);
  // Pri doznievaní: farba o stupeň tmavšia (namiesto priehľadnosti).
  var FADE = {
    white: 'greyLight', greyLight: 'grey', cyan: 'blue', blue: 'blueDark', greenLight: 'green', yellow: 'amber',
    red: 'redDark', orange: 'rust', magenta: 'redDark', purple: 'plum', plum: 'navy', navy: 'ink', amber: 'orange',
  };

  function shakeDisabled() {
    var g = HL.game;
    return !!(g && g.settings && g.settings.shake === false);
  }

  function Fx(opts) {
    opts = opts || {};
    this.rng = new HL.RNG(opts.seed != null ? opts.seed : 0x5eed);
    this.p = [];
    for (var i = 0; i < POOL; i++) this.p.push({ on: false, k: '', x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, c: '', g: 0, drag: 0, s: 1, ph: 0 });
    this.cursor = 0;
    this.texts = [];
    for (var j = 0; j < TEXTS; j++) this.texts.push({ on: false, x: 0, y: 0, text: '', c: '', life: 0, max: 1 });
    this.tcursor = 0;
    this.sh = { amp: 0, dur: 0, t: 0, x: 0, y: 0 };
    this.fl = { c: null, dur: 0, t: 0 };
    this.time = 0;
    this.w = opts.w || 180;
    this.h = opts.h || 320;
  }

  // emit(druh, x, y, { n, colors, angle:[a,b], speed:[a,b], dx, dy }) — dx/dy pridá unášanie
  Fx.prototype.emit = function (kind, x, y, opts) {
    var K = KINDS[kind];
    HL.assert(K, 'fx.emit: neznámy druh ' + kind);
    opts = opts || {};
    var r = this.rng;
    var n = Math.round((opts.n != null ? opts.n : K.n) * T.fxAmount);
    var colors = opts.colors || K.colors;
    var ang = opts.angle || K.angle, spd = opts.speed || K.speed;
    for (var i = 0; i < n; i++) {
      var p = this.p[this.cursor];
      this.cursor = (this.cursor + 1) % POOL;
      var a = r.range(ang[0], ang[1]), v = r.range(spd[0], spd[1]);
      p.on = true; p.k = kind;
      p.x = x + r.range(-1.5, 1.5); p.y = y + r.range(-1.5, 1.5);
      p.vx = Math.cos(a) * v + (opts.dx || 0); p.vy = Math.sin(a) * v + (opts.dy || 0);
      p.max = p.life = r.range(K.life[0], K.life[1]);
      p.c = colors[i % colors.length];
      p.g = K.g; p.drag = K.drag;
      p.s = kind === 'bubbles' ? (r.chance(0.35) ? 2 : 1) : kind === 'ink' ? r.range(1.5, 3) : kind === 'snapBurst' && r.chance(0.3) ? 3 : 1;
      p.ph = r.range(0, 6.28);
    }
    return n;
  };

  Fx.prototype.text = function (x, y, text, color) {
    var t = this.texts[this.tcursor];
    this.tcursor = (this.tcursor + 1) % TEXTS;
    t.on = true; t.x = x; t.y = y; t.text = String(text); t.c = color || HL.pal.white;
    t.max = t.life = T.fxTextSec;
  };

  Fx.prototype.shake = function (px, s) {
    if (shakeDisabled()) return;
    px *= T.fxShakeScale;
    var cur = this.sh.dur > 0 ? this.sh.amp * this.sh.t / this.sh.dur : 0;
    if (px < cur) return; // slabšie trasenie neprebije silnejšie, ktoré ešte doznieva
    this.sh.amp = px; this.sh.dur = s; this.sh.t = s;
  };

  Fx.prototype.flash = function (color, s) {
    this.fl.c = color || HL.pal.white; this.fl.dur = s; this.fl.t = s;
  };

  Fx.prototype.update = function (dt) {
    this.time += dt;
    for (var i = 0; i < POOL; i++) {
      var p = this.p[i];
      if (!p.on) continue;
      p.life -= dt;
      if (p.life <= 0) { p.on = false; continue; }
      var k = Math.exp(-p.drag * dt);
      p.vx *= k; p.vy *= k;
      p.vy += p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.k === 'bubbles') p.x += Math.sin(this.time * 6 + p.ph) * 6 * dt;       // bublina sa vlní
      else if (p.k === 'scales') p.x += Math.sin(this.time * 4 + p.ph) * 10 * dt;  // šupina padá ako list
      else if (p.k === 'ink') p.s += dt * 1.6;                                     // atrament sa rozpíja
    }
    for (var j = 0; j < TEXTS; j++) {
      var t = this.texts[j];
      if (!t.on) continue;
      t.life -= dt;
      t.y -= T.fxTextRise * dt;
      if (t.life <= 0) t.on = false;
    }
    var sh = this.sh;
    if (sh.t > 0 && !shakeDisabled()) {
      sh.t = Math.max(0, sh.t - dt);
      var a = sh.amp * (sh.dur > 0 ? sh.t / sh.dur : 0);
      sh.x = Math.round(this.rng.range(-a, a));
      sh.y = Math.round(this.rng.range(-a, a));
    } else { sh.t = 0; sh.x = 0; sh.y = 0; }
    if (this.fl.t > 0) this.fl.t = Math.max(0, this.fl.t - dt);
  };

  Fx.prototype.offset = function () { return { x: this.sh.x, y: this.sh.y }; };
  Fx.prototype.count = function () {
    var n = 0;
    for (var i = 0; i < POOL; i++) if (this.p[i].on) n++;
    return n;
  };
  Fx.prototype.clear = function () {
    for (var i = 0; i < POOL; i++) this.p[i].on = false;
    for (var j = 0; j < TEXTS; j++) this.texts[j].on = false;
    this.sh.t = 0; this.sh.x = this.sh.y = 0; this.fl.t = 0;
  };

  function pc(name) { return HL.pal[name] || name; }

  Fx.prototype.draw = function (ctx, w, h) {
    var D = HL.draw, P = HL.pal;
    w = w || this.w; h = h || this.h;
    var blinkOff = Math.floor(this.time * 30) % 2 === 1;
    for (var i = 0; i < POOL; i++) {
      var p = this.p[i];
      if (!p.on) continue;
      var f = p.life / p.max; // 1 -> 0
      var name = p.c;
      if (f < 0.35) {
        if (p.k !== 'ink' && p.k !== 'coins' && blinkOff) continue;
        name = FADE[name] || name;
      }
      var x = Math.round(p.x), y = Math.round(p.y);
      var c = pc(name);
      switch (p.k) {
        case 'bubbles':
          if (p.s === 2) { D.rect(ctx, x, y, 2, 2, c); D.px(ctx, x, y, P.white); }
          else D.px(ctx, x, y, c);
          break;
        case 'coins': {
          // minca sa točí: šírka 3 -> 1 -> 3
          var spin = Math.abs(Math.sin(this.time * 12 + p.ph));
          var cw = spin > 0.5 ? 3 : 1;
          D.rect(ctx, x - (cw >> 1), y - 1, cw, 3, f < 0.35 ? P.orange : P.amber);
          D.px(ctx, x - (cw >> 1), y - 1, P.yellow);
          break;
        }
        case 'ink':
          D.circle(ctx, x, y, p.s, c);
          break;
        case 'scales': {
          var glint = Math.floor(this.time * 10 + p.ph) % 3 === 0;
          D.px(ctx, x, y, glint ? P.white : c);
          break;
        }
        case 'sparkGood': case 'sparkBad': case 'snapBurst': {
          // krátka čiarka proti smeru letu = rýchlosť
          D.px(ctx, x, y, c);
          var sp = Math.abs(p.vx) + Math.abs(p.vy);
          if (sp > 30) D.px(ctx, x - Math.sign(p.vx) * (Math.abs(p.vx) > Math.abs(p.vy) / 2 ? 1 : 0), y - Math.sign(p.vy) * (Math.abs(p.vy) > Math.abs(p.vx) / 2 ? 1 : 0), c);
          if (p.s === 3) D.rect(ctx, x - 1, y, 3, 1, c);
          break;
        }
        default:
          D.px(ctx, x, y, c);
      }
    }
    for (var j = 0; j < TEXTS; j++) {
      var t = this.texts[j];
      if (!t.on) continue;
      if (t.life / t.max < 0.25 && blinkOff) continue;
      if (HL.font) HL.font.draw(ctx, t.text, t.x, t.y, t.c, { align: 'center', shadow: true });
    }
    if (this.fl.t > 0 && this.fl.dur > 0) D.dither(ctx, 0, 0, w, h, this.fl.c, this.fl.t / this.fl.dur);
  };

  X.create = function (opts) { return new Fx(opts); };
  X.Fx = Fx;

  // ------------------------------------------------------------------ počasie
  // Rýchly celočíselný hash -> 0..1 (index kvapky, soľ). Bez stavu, bez Math.random.
  function h01(i, salt) {
    var x = Math.imul((i + 1) ^ Math.imul(salt, 0x27d4eb2d), 0x9e3779b1);
    x ^= x >>> 15; x = Math.imul(x, 0x85ebca6b); x ^= x >>> 13;
    return (x >>> 0) / 4294967296;
  }
  function mod(a, m) { return ((a % m) + m) % m; }

  // Pixelový dážď: šikmé čiarky (vietor zľava), dve farby pre hĺbku.
  X.rain = function (ctx, t, intensity, w, h) {
    var P = HL.pal;
    var n = Math.round(Math.max(0, Math.min(1, intensity)) * 110);
    var span = w + 40;
    for (var i = 0; i < n; i++) {
      var sp = 150 + h01(i, 1) * 120;
      var len = 3 + Math.floor(h01(i, 2) * 4);
      var y = mod(t * sp + h01(i, 3) * (h + len), h + len) - len;
      var x = Math.round(mod(h01(i, 4) * span - y * 0.3, span) - 20);
      var c = i % 3 === 0 ? P.grey : P.greyLight;
      var half = len >> 1;
      ctx.fillStyle = c;
      ctx.fillRect(x, Math.round(y), 1, half);
      ctx.fillRect(x - 1, Math.round(y) + half, 1, len - half);
    }
  };

  // Hmla (dizajn 14.1 „hmla ako vrstvy"): pomaly sa unášajúce PLNÉ vodorovné pásy s vlnitým horným aj
  // dolným okrajom; jadro color2, plášť color. Žiadne bodky Bayerovej mriežky (slepý kritik kolo 0, P1) ani
  // pruhy riadkov (v3: pôsobili ako pokazená obrazovka). Kreslí sa nad hladinou (dive.js oreže na oblohu) —
  // pod vodou je hmla zakalená farba vody, nič neprekrýva ryby. Okraje po stĺpcoch 3 px, súvislé úseky = 1 fillRect.
  X.fog = function (ctx, t, density, w, h, color, color2) {
    var d = Math.max(0, Math.min(1, density));
    if (d <= 0 || !(h > 0)) return;
    var c1 = color || HL.pal.greyLight, c2 = color2 || HL.pal.white, COL = 3, nx = Math.ceil(w / COL), half = new Float32Array(nx);
    for (var k = 0; k < 3; k++) {
      var cy = h * (0.35 + 0.22 * k) + Math.sin(t * 0.3 + k * 2.1) * 4;
      var bh = (10 + 6 * Math.sin(k * 1.3 + 1)) * (0.5 + 0.5 * d), drift = (k % 2 ? -1 : 1) * (4 + 2 * k), maxH = 0;
      for (var i = 0; i < nx; i++) {
        var wav = 0.5 + 0.5 * Math.sin((i * COL + t * drift) * 0.05 + k * 1.7) * Math.sin((i * COL - t * drift * 0.6) * 0.021 + k);
        half[i] = bh / 2 * wav;
        if (half[i] > maxH) maxH = half[i];
      }
      for (var y = Math.floor(cy - maxH); y <= Math.ceil(cy + maxH); y++) {
        var dy = Math.abs(y + 0.5 - cy), runX = -1, runC = null;
        for (var j = 0; j <= nx; j++) {
          var c = j < nx && dy < half[j] ? (dy < half[j] * 0.45 ? c2 : c1) : null;
          if (c !== runC) {
            if (runC) { ctx.fillStyle = runC; ctx.fillRect(runX * COL, y, (j - runX) * COL, 1); }
            runX = j; runC = c;
          }
        }
      }
    }
  };

  // Sneh: vločky padajú pomaly a kývu sa; každá siedma je väčšia (krížik).
  X.snow = function (ctx, t, intensity, w, h) {
    var P = HL.pal;
    var n = Math.round(Math.max(0, Math.min(1, intensity)) * 80);
    for (var i = 0; i < n; i++) {
      var sp = 10 + h01(i, 11) * 22;
      var y = Math.round(mod(t * sp + h01(i, 12) * (h + 4), h + 4) - 2);
      var sway = 2 + h01(i, 13) * 5;
      var x = Math.round(mod(h01(i, 14) * w + Math.sin(t * (0.6 + h01(i, 15) * 1.2) + i) * sway, w));
      if (i % 7 === 0) {
        ctx.fillStyle = P.greyLight;
        ctx.fillRect(x - 1, y, 3, 1);
        ctx.fillRect(x, y - 1, 1, 3);
        ctx.fillStyle = P.white;
        ctx.fillRect(x, y, 1, 1);
      } else {
        ctx.fillStyle = i % 3 ? P.white : P.greyLight;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  };
})(globalThis.HL);
