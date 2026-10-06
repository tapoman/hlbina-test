// Syntetizovaný zvuk (dizajn 4.2, 14.2, 15). Žiadne zvukové súbory: všetko sú
// oscilátory, šum, filtre a obálky WebAudio — hra sa spúšťa z file:// a fetch
// lokálnych súborov tam nefunguje, a syntéza sa dá ladiť posuvníkmi (HL.T, panel F2).
//
// Prečo "Engine" nad ľubovoľným kontextom: ten istý kód beží naživo (AudioContext)
// aj v samoteste nad OfflineAudioContext (tools/audio_test.html). Keby samotest mal
// vlastnú kópiu zvukov, meral by kópiu, nie hru.
//
// Bez AudioContext (Node, zakázaný zvuk, ?mute=1) sú všetky funkcie tiché no-op:
// zvuk nikdy nesmie zhodiť hru.
(function (HL) {
  var T = HL.T;
  var A = HL.audio = {};

  // ------------------------------------------------------------------ ladenie
  // Hodnoty sú ODHAD — nikto ich zatiaľ nepočul. Preto sú všetky na posuvníkoch.
  var d = T.def;
  d('Zvuk', 'sfxPitchVar', 0.04, 0, 0.2, 0.005, 'Náhodná odchýlka výšky opakovaných zvukov (±)');
  d('Zvuk', 'sfxVolVar', 0.12, 0, 0.5, 0.01, 'Náhodné stíšenie opakovaných zvukov (najviac)');
  d('Zvuk', 'sfxMinGapMs', 30, 0, 200, 5, 'Ten istý zvuk sa nezopakuje skôr ako (ms)');
  d('Zvuk', 'sfxMaxVoices', 24, 4, 64, 1, 'Najviac súčasne znejúcich efektov');
  d('Zvuk', 'creakVolLo', 0.10, 0, 1, 0.01, 'Škrípanie: hlasitosť pri prahu warn1');
  d('Zvuk', 'creakVolHi', 0.38, 0, 1, 0.01, 'Škrípanie: hlasitosť tesne pred prasknutím');
  d('Zvuk', 'creakHzLo', 70, 20, 400, 1, 'Škrípanie: frekvencia trenia pri warn1 (Hz)');
  d('Zvuk', 'creakHzHi', 240, 20, 800, 1, 'Škrípanie: frekvencia trenia pri prasknutí (Hz)');
  d('Zvuk', 'creakGrit', 1.0, 0, 3, 0.05, 'Škrípanie: hrubosť (nepravidelnosť, šum, pišťanie)');
  d('Zvuk', 'creakWobbleHz', 7.5, 1, 20, 0.5, 'Kmitanie od warn2: frekvencia (Hz)');
  d('Zvuk', 'creakWobbleDepth', 0.7, 0, 1, 0.05, 'Kmitanie: hĺbka tesne pred prasknutím');
  d('Zvuk', 'alarmHz', 2200, 600, 5000, 10, 'Varovný tón od warn3 (Hz)');
  d('Zvuk', 'alarmRateHz', 5, 1, 16, 0.5, 'Varovný tón: pulzy za sekundu');
  d('Zvuk', 'alarmVol', 0.20, 0, 0.6, 0.01, 'Varovný tón: hlasitosť');
  d('Zvuk', 'snapFadeSec', 2, 0.2, 6, 0.1, 'Po prasknutí: návrat zvuku z ticha (s)');
  d('Zvuk', 'ambVol', 0.5, 0, 1, 0.05, 'Prostredie (vlny, čajky, hlbina) voči efektom');
  d('Zvuk', 'gullMinSec', 5, 1, 60, 1, 'Čajky: najkratší odstup (s)');
  d('Zvuk', 'gullMaxSec', 14, 1, 90, 1, 'Čajky: najdlhší odstup (s)');
  // Navijak: hlavná akcia hry (klesanie) bola úplne tichá — majiteľ po hraní napísal "pridaj zvuky".
  // 0,30 bolo pri meraní vo Firefoxe sotva nad šumom mora (špička 1,2×) — navijak treba počuť.
  d('Zvuk', 'reelVol', 0.85, 0, 1.5, 0.01, 'Navijak pri klesaní: hlasitosť cvakania');
  d('Zvuk', 'reelRateLo', 14, 2, 60, 1, 'Navijak: cvaknutia za s pri pomalom klesaní');
  d('Zvuk', 'reelRateHi', 44, 5, 90, 1, 'Navijak: cvaknutia za s pri najrýchlejšom klesaní');
  d('Zvuk', 'reelHz', 2600, 500, 8000, 50, 'Navijak: výška cvaknutia (Hz)');
  d('Zvuk', 'reelBubbles', 1.5, 0, 8, 0.1, 'Bublinky pri klesaní: počet za s pri plnej rýchlosti');
  // Dozvuk hudby (pokojný štýl, music.js). Impulz sa vyrobí šumom; zmena dĺžky alebo tlmenia ho prerobí.
  d('Hudba', 'calmVerbSec', 2.4, 0.3, 8, 0.1, 'Pokojná: dozvuk – dĺžka (s)');
  d('Hudba', 'calmVerbDamp', 0.6, 0, 1, 0.05, 'Pokojná: dozvuk – ako rýchlo chvost stmavne');
  d('Hudba', 'calmVerbPreMs', 22, 0, 150, 1, 'Pokojná: dozvuk – oneskorenie začiatku (ms)');
  d('Hudba', 'calmVerbTone', 4000, 500, 16000, 50, 'Pokojná: dozvuk – jas (dolná priepusť, Hz)');

  // ------------------------------------------------------------------ pomôcky
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  // AudioParam hodí TypeError na NaN/Infinity. Každé číslo zvonku prejde týmto sitom,
  // inak by jedna NaN v napätí zhodila krok hry.
  function fin(v, def) { return (typeof v === 'number' && isFinite(v)) ? v : def; }

  // Plynulá zmena parametra (bez "zipper" šumu pri ťahaní posuvníka alebo raste napätia).
  function glide(param, v, t, tc) { param.setTargetAtTime(v, t, tc); }
  // Zastaví automatizáciu na AKTUÁLNEJ hodnote — inak by zrušenie rampy skočilo
  // na predchádzajúci bod a cvaklo.
  function hold(param, t) {
    if (param.cancelAndHoldAtTime) { param.cancelAndHoldAtTime(t); return; }
    var v = param.value;
    param.cancelScheduledValues(t);
    param.setValueAtTime(v, t);
  }

  // Úderová obálka: nábeh z nuly, exponenciálny pokles do takmer nuly (bez kliku na konci).
  function envPerc(param, t, a, peak, dec) {
    peak = Math.max(0, peak);
    param.setValueAtTime(0, t);
    param.linearRampToValueAtTime(peak, t + a);
    param.exponentialRampToValueAtTime(0.0001, t + a + dec);
    param.linearRampToValueAtTime(0, t + a + dec + 0.01);
    return t + a + dec + 0.01;
  }
  // Držaná obálka: nábeh, držanie, lineárne doznenie do nuly.
  function envSus(param, t, a, peak, holdSec, rel) {
    peak = Math.max(0, peak);
    param.setValueAtTime(0, t);
    param.linearRampToValueAtTime(peak, t + a);
    param.setValueAtTime(peak, t + a + holdSec);
    param.linearRampToValueAtTime(0, t + a + holdSec + rel);
    return t + a + holdSec + rel;
  }

  // Mäkké orezanie na konci reťazca: nad 0,8 sa krivka ohýba, nikdy neprekročí 0,98.
  // Zaručuje, že hráč nepočuje digitálne praskanie — ALE kvôli tomu je kontrola
  // "špička ≤ 1" na výstupe triviálna. Samotest preto meria aj surový signál (opts.raw).
  function softClipCurve() {
    var n = 2048, c = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      var x = i / (n - 1) * 2 - 1, ax = Math.abs(x);
      var y = ax < 0.8 ? ax : 0.8 + 0.18 * Math.tanh((ax - 0.8) / 0.18);
      c[i] = x < 0 ? -y : y;
    }
    return c;
  }

  // ------------------------------------------------------------------ Engine
  // opts.raw = bez kompresora, limitera a orezania (len pre meranie rezervy v samoteste).
  function Engine(ctx, opts) {
    opts = opts || {};
    var E = this;
    E.ctx = ctx;
    E.raw = !!opts.raw;
    // Lokálna náhoda: zvuk nie je simulácia, ale s pevným semenom je samotest opakovateľný.
    E.rng = new HL.RNG(opts.seed || 0x51a7e);
    E.voices = 0;
    E.ends = [];              // konce znejúcich efektov (limit hlasov podľa času, nie onended)
    E.lastPlay = {};
    E.depth = 0;
    E.cr = null;              // graf škrípania (vytvorí sa až pri prvom napätí nad warn1)
    E.creakRatio = 0;
    E.creakAge = 0;
    E.creakBlockUntil = -1;
    E.reelV = 0;              // 0..1 rýchlosť klesania (navijak); 0 = ticho
    E.reelAge = 0;
    E.reelPhase = 0;
    E.amb = null;             // { kind, gain, stop[] }
    E.ambOld = [];
    E.ambTimer = 0;
    E.vol = { music: 0.6, sfx: 0.8 };
    E.snaps = 0;

    var master = ctx.createGain();
    master.gain.value = 0.9;
    E.master = master;
    if (E.raw) {
      master.connect(ctx.destination);
    } else {
      // Jemný kompresor zlepí mix; tvrdý limiter a mäkké orezanie chránia pred špičkami,
      // keď sa naraz stretne hudba, škrípanie a výbuch zvukov z jedného kroku.
      var comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 3;
      comp.attack.value = 0.004; comp.release.value = 0.25;
      var lim = ctx.createDynamicsCompressor();
      lim.threshold.value = -3; lim.knee.value = 0; lim.ratio.value = 20;
      lim.attack.value = 0.001; lim.release.value = 0.1;
      var clip = ctx.createWaveShaper();
      clip.curve = softClipCurve();
      master.connect(comp); comp.connect(lim); lim.connect(clip); clip.connect(ctx.destination);
    }
    // Merač živého výstupu — harness ním dokazuje, že naživo niečo naozaj znie.
    if (ctx.createAnalyser) {
      E.analyser = ctx.createAnalyser();
      E.analyser.fftSize = 2048;
      master.connect(E.analyser);
    }
    // duck = spoločné stíšenie pre snapSilence. "Ping" ide okolo neho (bus sting).
    E.duck = ctx.createGain();
    E.duck.connect(master);
    E.bus = {
      sfx: gainNode(ctx, 1, E.duck),
      music: gainNode(ctx, 1, E.duck),
      amb: gainNode(ctx, 1, E.duck),
      sting: gainNode(ctx, 1, master),
    };
    // Ozvena ako send: jej výstup vteká späť do vstupu busu, takže ju škáluje hlasitosť busu.
    E.echo = { sfx: makeEcho(ctx, E.bus.sfx, 0.27), music: makeEcho(ctx, E.bus.music, 0.36), sting: makeEcho(ctx, E.bus.sting, 0.31) };
    // Dozvuk len pre hudbu (pokojný štýl). Bez ConvolverNode (atrapa v Node) je null a hudba hrá bez neho.
    // Impulz sa NEvyrába tu: Engine vzniká v prvom ťuknutí (HL.audio.unlock) a výroba + priradenie impulzu
    // predĺžili prvé ťuknutie o ~20 ms (nezávislá kontrola 2026-10-01). Vyrobí sa, až keď ho pokojná stopa
    // naozaj potrebuje (music.js → _verbSync(true), mimo vstupu); chiptune ho nevyrobí vôbec.
    E.verb = makeReverb(ctx, E.bus.music);
    E.plucks = { map: {}, n: 0 };
    E._crackle = null;

    E.white = noiseBuffer(ctx, 2, 'white', E.rng);
    E.brown = noiseBuffer(ctx, 3, 'brown', E.rng);
    E.jitter = jitterBuffer(ctx, 4, 24, E.rng);
    E.jitterFast = jitterBuffer(ctx, 3, 70, E.rng);
    E.setVolumes(E.vol.music, E.vol.sfx, true);
  }

  function gainNode(ctx, v, dest) {
    var g = ctx.createGain();
    g.gain.value = v;
    if (dest) g.connect(dest);
    return g;
  }
  function makeEcho(ctx, dest, time) {
    var inp = ctx.createGain();
    var dl = ctx.createDelay(1.5);
    dl.delayTime.value = time;
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2400;
    var fb = gainNode(ctx, 0.32);
    var wet = gainNode(ctx, 0.5, dest);
    inp.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(wet);
    return inp;
  }
  // Dozvuk: vstup -> oneskorenie -> konvolúcia -> dolná priepusť -> výstup do busu hudby (hlasitosť
  // hudby ho škáluje). Priepusť: šumový začiatok impulzu je jasný a zjasňoval aj tmavú hĺbku (kontrola
  // 2026-10-01: v 900 a 1800 m bola pokojná jasnejšia než chiptune) — teplý dozvuk patrí k pokojnej hudbe.
  function makeReverb(ctx, dest) {
    if (typeof ctx.createConvolver !== 'function' || typeof ctx.createDelay !== 'function') return null;
    var inp = ctx.createGain();
    var pre = ctx.createDelay(0.5);
    var conv = ctx.createConvolver();
    try { conv.normalize = true; } catch (e) { /* staršie prehliadače */ }
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 4000; lp.Q.value = 0.5;
    var out = gainNode(ctx, 1, dest);
    inp.connect(pre); pre.connect(conv); conv.connect(lp); lp.connect(out);
    return { input: inp, pre: pre, conv: conv, lp: lp, out: out, sec: null, damp: null, wanted: false };
  }
  // Impulz dozvuku: stereo šum s exponenciálnym poklesom (−60 dB na konci) a tlmením výšok, ktoré
  // s časom rastie — skutočná miestnosť pohltí výšky skôr ako hĺbky, preto chvost tmavne.
  // Vlastná náhoda: nesmie posunúť prúd E.rng (variácie efektov). Pokles násobením (nie exp na vzorku).
  function reverbIR(ctx, sec, damp) {
    var sr = ctx.sampleRate, n = Math.max(256, Math.floor(sr * sec)), fadeN = Math.max(1, Math.floor(sr * 0.004));
    var b = ctx.createBuffer(2, n, sr), rng = new HL.RNG(0x7e7b), k = Math.exp(-6.9 / n);
    for (var c = 0; c < 2; c++) {
      var x = b.getChannelData(c), lp = 0, env = 1;
      for (var i = 0; i < n; i++) {
        lp += (1 - damp * 0.93 * i / n) * ((rng.next() * 2 - 1) - lp);
        x[i] = lp * env * (i < fadeN ? i / fadeN : 1);
        env *= k;
      }
    }
    return b;
  }
  function noiseBuffer(ctx, sec, color, rng) {
    var n = Math.floor(ctx.sampleRate * sec);
    var b = ctx.createBuffer(1, n, ctx.sampleRate);
    var x = b.getChannelData(0), last = 0, peak = 0, i;
    for (i = 0; i < n; i++) {
      var w = rng.next() * 2 - 1;
      if (color === 'brown') { last = (last + 0.02 * w) / 1.02; x[i] = last; }
      else x[i] = w;
      if (Math.abs(x[i]) > peak) peak = Math.abs(x[i]);
    }
    // Hnedý šum má malú amplitúdu — normalizujeme, aby "v" vo zvukoch znamenalo to isté.
    if (color === 'brown' && peak > 0) for (i = 0; i < n; i++) x[i] = x[i] / peak * 0.9;
    return b;
  }
  // Pomaly sa meniaca náhodná krivka v rozsahu -1..1 (rate zmien za sekundu).
  // Rozkolíše výšku trenia — pravidelný pílovitý tón znie ako bzučiak, nie ako vlasec.
  function jitterBuffer(ctx, sec, rate, rng) {
    var n = Math.floor(ctx.sampleRate * sec);
    var b = ctx.createBuffer(1, n, ctx.sampleRate);
    var x = b.getChannelData(0);
    var seg = Math.max(1, Math.floor(ctx.sampleRate / rate));
    var a = rng.next() * 2 - 1, c = rng.next() * 2 - 1;
    for (var i = 0; i < n; i++) {
      var k = i % seg;
      if (k === 0 && i > 0) { a = c; c = rng.next() * 2 - 1; }
      var t = k / seg;
      x[i] = a + (c - a) * t * t * (3 - 2 * t);
    }
    return b;
  }

  // ---------------------------------------------------------------- stavebné kamene
  // Každý zdroj si pamätá koniec; play() podľa najneskoršieho uprace uzly po dozvučaní.
  Engine.prototype._track = function (src, end) {
    if (end > this._voiceEnd) { this._voiceEnd = end; this._voiceSrc = src; }
  };

  function applyFilter(ctx, node, t, f) {
    var bq = ctx.createBiquadFilter();
    bq.type = f.type || 'lowpass';
    bq.frequency.setValueAtTime(Math.max(10, f.f), t);
    if (f.f2) bq.frequency.exponentialRampToValueAtTime(Math.max(10, f.f2), t + (f.glide || 0.2));
    bq.Q.value = f.q != null ? f.q : 0.8;
    node.connect(bq);
    return bq;
  }

  // Tón: o = { type, f, f2, glide, a, d (úder) | sus+hold+r (držaný), v, detune, vib, filter, send }
  Engine.prototype.tone = function (dest, t, o) {
    var ctx = this.ctx;
    var osc = ctx.createOscillator();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(Math.max(1, o.f), t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f2), t + (o.glide || (o.d || 0.1)));
    if (o.detune || o.detune2 != null) osc.detune.setValueAtTime(fin(o.detune, 0), t);
    var a = o.a != null ? o.a : 0.004;
    var g = ctx.createGain();
    var end = o.sus ? envSus(g.gain, t, a, o.v, o.hold || 0, o.r || 0.08) : envPerc(g.gain, t, a, o.v, o.d || 0.1);
    end += 0.02;
    // detune2: plynulý posun ladenia počas tónu (kolísanie pásky v pokojnej hudbe), bez LFO uzla na každý tón.
    if (o.detune2 != null) osc.detune.linearRampToValueAtTime(fin(o.detune2, 0), end);
    if (o.vib) {
      // Oneskorené vibrato (typické pre chiptune): tón začne rovno a až potom sa rozkýve.
      var lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = o.vib.rate || 5.5;
      lg.gain.setValueAtTime(0, t);
      lg.gain.linearRampToValueAtTime(o.vib.cents || 10, t + (o.vib.delay || 0.001));
      lfo.connect(lg); lg.connect(osc.detune);
      lfo.start(t); lfo.stop(end);
    }
    var node = osc;
    if (o.filter) node = applyFilter(ctx, node, t, o.filter);
    node.connect(g);
    g.connect(dest);
    if (o.send) this.send(g, o.send, o.bus);
    osc.start(t); osc.stop(end);
    this._track(osc, end);
    return osc;
  };

  // Šum: o = { d | sus+hold+r, a, v, filter, brown, rate, send }
  Engine.prototype.noise = function (dest, t, o) {
    var ctx = this.ctx;
    var src = ctx.createBufferSource();
    src.buffer = o.brown ? this.brown : this.white;
    src.loop = true;
    if (o.rate) src.playbackRate.value = o.rate;
    var a = o.a != null ? o.a : 0.002;
    var g = ctx.createGain();
    var end = o.sus ? envSus(g.gain, t, a, o.v, o.hold || 0, o.r || 0.08) : envPerc(g.gain, t, a, o.v, o.d || 0.1);
    end += 0.02;
    var node = src;
    if (o.filter) node = applyFilter(ctx, node, t, o.filter);
    node.connect(g);
    g.connect(dest);
    if (o.send) this.send(g, o.send, o.bus);
    // Náhodný začiatok v bufferi, aby dva rovnaké šumy nezneli ako kópia.
    src.start(t, this.rng.next() * (src.buffer.duration - 0.5));
    src.stop(end);
    this._track(src, end);
    return src;
  };

  // Bublinka: krátky stúpajúci sínus.
  Engine.prototype.bubble = function (dest, t, f, v) {
    return this.tone(dest, t, { type: 'sine', f: f, f2: f * 2.2, glide: 0.05, a: 0.003, d: 0.06, v: v });
  };

  Engine.prototype.send = function (node, amount, bus) {
    var s = this.ctx.createGain();
    s.gain.value = amount;
    node.connect(s);
    s.connect(this.echo[bus || 'sfx']);
  };

  // ---------------------------------------------------------- nástroje pokojnej hudby
  // Prečo nie len oscilátory ako chiptune: štvorec a pílka s vibratom sú presne to „pískanie",
  // ktoré majiteľ nazval otravným (2026-10-01). Elektrické piano (FM), drnkaná struna
  // (Karplus–Strong) a dozvuk znejú ako bežná pokojná hudba — stále bez jediného súboru.

  // Impulz dozvuku: vyrobí sa až na požiadanie (want = pokojná stopa ho potrebuje), potom sa prerobí len
  // pri zmene dĺžky/tlmenia (posuvník F2); oneskorenie a jas sa menia hneď. Engine.update ho volá každý
  // snímok — kým ho nikto nechcel, nerobí nič (chiptune dozvuk nepoužíva a nič zaň neplatí).
  Engine.prototype._verbSync = function (want) {
    var V = this.verb;
    if (!V) return;
    if (want) V.wanted = true;
    if (!V.wanted) return;
    var sec = clamp(fin(T.calmVerbSec, 2.4), 0.3, 10), damp = clamp01(fin(T.calmVerbDamp, 0.6));
    if (V.sec === null || Math.abs(V.sec - sec) > 0.04 || Math.abs(V.damp - damp) > 0.01) {
      var ir = reverbIR(this.ctx, sec, damp);
      V.sec = sec; V.damp = damp;   // aj pri zlyhaní nižšie: neprerábať každý snímok
      try { V.conv.buffer = ir; } catch (e) {
        // Prehliadač, ktorý nedovolí druhý buffer: nový uzol na to isté miesto, starý odpojiť
        // (inak by každá zmena posuvníka nechala ďalší uzol visieť na výstupe).
        var old = V.conv;
        try { old.disconnect(); } catch (e2) { /* nič */ }
        try { V.pre.disconnect(); } catch (e2) { /* nič */ }
        try {
          V.conv = this.ctx.createConvolver();
          try { V.conv.normalize = true; } catch (e3) { /* nič */ }
          V.conv.buffer = ir;
          V.pre.connect(V.conv); V.conv.connect(V.lp);
        } catch (e4) { this.verb = null; return; }   // bez dozvuku: hudba hrá suchá, nie ticho
      }
    }
    var pre = clamp(fin(T.calmVerbPreMs, 22), 0, 400) / 1000;
    if (Math.abs(V.pre.delayTime.value - pre) > 1e-4) V.pre.delayTime.value = pre;
    var tone = clamp(fin(T.calmVerbTone, 4000), 500, 16000);
    if (Math.abs(V.lp.frequency.value - tone) > 0.5) V.lp.frequency.value = tone;
  };

  // Elektrické piano: nosná sínusovka moduluje sínusovku 1:1 (FM). Index modulácie po údere
  // klesá — tón začne jasne a potom zmäkne, hlasitosť doznieva ako pri skutočnom klavíri.
  // „tine" = krátky zvonivý alikvot (×4) pri údere. o = { f, v, a, hold, r, index, tine, detune, detune2 }
  Engine.prototype.epiano = function (dest, t, o) {
    var ctx = this.ctx, f = Math.max(1, fin(o.f, 220));
    var v = Math.max(0, fin(o.v, 0.08)), a = Math.max(0.001, fin(o.a, 0.004));
    var hold = Math.max(0.02, fin(o.hold, 1)), rel = Math.max(0.02, fin(o.r, 0.4));
    var I0 = Math.max(0, fin(o.index, 1.4)), tine = Math.max(0, fin(o.tine, 0.1));
    var car = ctx.createOscillator(), mod = ctx.createOscillator(), mg = ctx.createGain(), amp = ctx.createGain();
    car.type = 'sine'; mod.type = 'sine';
    car.frequency.setValueAtTime(f, t); mod.frequency.setValueAtTime(f, t);
    var tr = t + a + hold, end = tr + rel;
    var d0 = fin(o.detune, 0), d1 = fin(o.detune2, d0);
    car.detune.setValueAtTime(d0, t); mod.detune.setValueAtTime(d0, t);
    if (d1 !== d0) { car.detune.linearRampToValueAtTime(d1, end); mod.detune.linearRampToValueAtTime(d1, end); }
    mg.gain.setValueAtTime(0, t);
    mg.gain.linearRampToValueAtTime(f * I0, t + 0.003);
    mg.gain.setTargetAtTime(f * I0 * 0.12, t + 0.003, 0.35);
    var sus = 0.3, tau = 0.9;
    amp.gain.setValueAtTime(0, t);
    amp.gain.linearRampToValueAtTime(v, t + a);
    amp.gain.setTargetAtTime(v * sus, t + a, tau);
    amp.gain.setValueAtTime(v * sus + v * (1 - sus) * Math.exp(-hold / tau), tr);
    amp.gain.linearRampToValueAtTime(0, end);
    mod.connect(mg); mg.connect(car.frequency);
    car.connect(amp); amp.connect(dest);
    car.start(t); mod.start(t);
    car.stop(end + 0.02);
    // Výkon: index po údere klesne na ~12 % (jas dozvie), potom modulátor plynulo stíchne a zastaví sa —
    // dlhý akord inak držal 2 oscilátory celé sekundy kvôli sotva počuteľným alikvotom.
    var mOff = t + 0.003 + 1.2;
    if (mOff + 0.3 < end) {
      mg.gain.setValueAtTime(f * I0 * (0.12 + 0.88 * Math.exp(-1.2 / 0.35)), mOff);
      mg.gain.linearRampToValueAtTime(0, mOff + 0.25);
      mod.stop(mOff + 0.27);
    } else mod.stop(end + 0.02);
    if (tine > 0 && f * 4 < 9000) {
      var to = ctx.createOscillator(), tg = ctx.createGain();
      to.type = 'sine'; to.frequency.setValueAtTime(f * 4, t);
      tg.gain.setValueAtTime(0, t);
      tg.gain.linearRampToValueAtTime(v * tine, t + 0.002);
      tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      tg.gain.linearRampToValueAtTime(0, t + 0.23);
      to.connect(tg); tg.connect(dest);
      to.start(t); to.stop(t + 0.25);
    }
    this._track(car, end + 0.02);
    return end + 0.02;
  };

  // Drnkaná struna (Karplus–Strong): krátky šumový úder koluje v slučke dĺžky jednej periódy
  // a priemerovanie susedných vzoriek ho pri každom obehu zmäkčí — znie ako harfa/nylonová gitara.
  // Buffer sa vyrobí raz pre tón (22 050 Hz stačí, struna je mäkká) a potom sa len prehráva.
  // Perióda má celé číslo vzoriek, preto presnú výšku dorovná rýchlosť prehrávania (rate).
  Engine.prototype.pluckBuf = function (midi) {
    midi = Math.round(fin(midi, 60));
    var sec = clamp(fin(T.calmPluckSec, 1.6), 0.2, 6), soft = clamp01(fin(T.calmPluckSoft, 0.7));
    var key = midi + '|' + sec.toFixed(2) + '|' + soft.toFixed(2);
    var C = this.plucks;
    if (C.map[key]) return C.map[key];
    if (C.n >= 48) { C.map = {}; C.n = 0; }   // strop pamäte (~6 MB), staré tóny sa vyrobia znova
    var SRp = 22050, f = 440 * Math.pow(2, (midi - 69) / 12);
    var N = Math.max(2, Math.floor(SRp / f - 0.5)), fGen = SRp / (N + 0.5);
    var ring = sec * Math.pow(220 / f, 0.35);          // nižšie struny doznievajú dlhšie
    var len = Math.max(N + 2, Math.floor(SRp * Math.min(6, ring * 1.1)));
    var b = this.ctx.createBuffer(1, len, SRp), x = b.getChannelData(0);
    var rng = new HL.RNG(0x9f1 + midi * 131);
    var c = 1 - 0.88 * soft, lp = 0, mean = 0, i;
    for (i = 0; i < N; i++) { lp += c * ((rng.next() * 2 - 1) - lp); x[i] = lp; mean += lp / N; }
    for (i = 0; i < N; i++) x[i] -= mean;
    var rho = Math.pow(0.001, 1 / (Math.max(0.05, ring) * fGen));
    x[N] = rho * x[0];
    for (i = N + 1; i < len; i++) x[i] = rho * 0.5 * (x[i - N] + x[i - N - 1]);
    var pk = 0;
    for (i = 0; i < len; i++) { var ax = Math.abs(x[i]); if (ax > pk) pk = ax; }
    var fade = Math.min(len, Math.floor(SRp * 0.03));
    for (i = 0; i < len; i++) {
      x[i] = pk > 0 ? x[i] / pk : 0;
      if (i >= len - fade) x[i] *= (len - i) / fade;
    }
    var out = { buf: b, rate: f / fGen, dur: len / SRp, f: f, fGen: fGen };
    C.map[key] = out; C.n++;
    return out;
  };

  // Prehranie vyrobeného tónu. o = { v, a, cut (s – skoršie stlmenie), r, detune, detune2, rateMul }
  Engine.prototype.sample = function (dest, t, smp, o) {
    var ctx = this.ctx, src = ctx.createBufferSource();
    src.buffer = smp.buf;
    var rate = Math.max(0.05, fin(smp.rate, 1) * fin(o.rateMul, 1));
    src.playbackRate.setValueAtTime(rate, t);
    var dur = smp.dur / rate, a = Math.max(0.001, fin(o.a, 0.002)), v = Math.max(0, fin(o.v, 0.1));
    var end = t + dur;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + a);
    var cut = fin(o.cut, 0);
    if (cut > 0 && t + a + cut < end) {
      var r = Math.max(0.02, fin(o.r, 0.12));
      g.gain.setValueAtTime(v, t + a + cut);
      g.gain.linearRampToValueAtTime(0, t + a + cut + r);
      end = Math.min(end, t + a + cut + r);
    }
    if (src.detune && (o.detune || o.detune2 != null)) {
      src.detune.setValueAtTime(fin(o.detune, 0), t);
      if (o.detune2 != null) src.detune.linearRampToValueAtTime(fin(o.detune2, 0), end);
    }
    src.connect(g); g.connect(dest);
    src.start(t); src.stop(end + 0.02);
    this._track(src, end + 0.02);
    return end + 0.02;
  };

  // Praskanie platne (lo-fi): 5 s slučka — tiché syčanie a riedke kliky. Vyrobí sa raz.
  Engine.prototype.crackleBuf = function () {
    if (this._crackle) return this._crackle;
    var SRc = 22050, n = SRc * 5, b = this.ctx.createBuffer(1, n, SRc), x = b.getChannelData(0);
    var rng = new HL.RNG(0xc4ac), hiss = 0, edge = 512, i;
    for (i = 0; i < n; i++) {
      hiss += 0.3 * ((rng.next() * 2 - 1) - hiss);
      var e = i < edge ? i / edge : i > n - edge ? (n - i) / edge : 1;   // šev slučky bez kliku
      x[i] = hiss * 0.08 * e;
    }
    for (var k = 0; k < 40; k++) {
      var at = Math.floor(rng.next() * (n - 2 * edge)) + edge, amp = (0.15 + 0.85 * Math.pow(rng.next(), 3)) * (rng.next() < 0.5 ? -1 : 1);
      for (var j = 0; j < 20; j++) x[at + j] += amp * Math.exp(-j / 2.5) * (j % 2 ? -0.5 : 1);
    }
    this._crackle = b;
    return b;
  };
  // Slučka bufferu do dest s nábehom; vráti { src, gain } — volajúci ju zastaví (stop) pri upratovaní.
  Engine.prototype.loop = function (dest, t, buf, v) {
    var src = this.ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    var g = gainNode(this.ctx, 0, dest);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(Math.max(0, fin(v, 0)), t + 1);
    src.connect(g);
    src.start(t);
    return { src: src, gain: g };
  };

  // ------------------------------------------------------------------ zvuky
  // voices[meno] = { fn(E, t, { out, p, rng }) -> trvanie v s, gap?, sting? }
  // p = násobok výšky (pitch). Úrovne sú zvolené tak, aby surová špička každého
  // zvuku pri plnej hlasitosti ostala pod 1,0 (overuje tools/audio_check.js).
  var V = A.voices = {};
  function def(name, fn, extra) {
    V[name] = { fn: fn, gap: extra && extra.gap, sting: extra && extra.sting };
  }

  def('ui_click', function (E, t, o) {
    E.tone(o.out, t, { type: 'square', f: 1320 * o.p, f2: 990 * o.p, glide: 0.03, a: 0.002, d: 0.04, v: 0.22, filter: { f: 5000 } });
    return 0.06;
  });
  def('ui_back', function (E, t, o) {
    E.tone(o.out, t, { type: 'square', f: 700 * o.p, f2: 430 * o.p, glide: 0.07, a: 0.002, d: 0.08, v: 0.22, filter: { f: 4000 } });
    return 0.1;
  });
  def('coin', function (E, t, o) {
    E.tone(o.out, t, { type: 'square', f: 988 * o.p, a: 0.002, d: 0.07, v: 0.15 });
    E.tone(o.out, t + 0.07, { type: 'square', f: 1319 * o.p, a: 0.002, d: 0.32, v: 0.15, send: 0.2 });
    E.tone(o.out, t + 0.07, { type: 'triangle', f: 659 * o.p, a: 0.002, d: 0.25, v: 0.12 });
    return 0.42;
  });
  def('buy', function (E, t, o) {
    E.noise(o.out, t, { d: 0.05, v: 0.22, filter: { type: 'highpass', f: 3000 } });
    var f = [1047, 1319, 1568];
    for (var i = 0; i < 3; i++) E.tone(o.out, t + 0.03 + i * 0.06, { type: 'triangle', f: f[i] * o.p, a: 0.002, d: 0.22, v: 0.2 });
    E.tone(o.out, t + 0.03, { type: 'square', f: 523 * o.p, a: 0.002, d: 0.18, v: 0.07 });
    return 0.4;
  });
  def('upgrade', function (E, t, o) {
    var f = [523, 659, 784, 1047, 1319];
    for (var i = 0; i < f.length; i++) {
      E.tone(o.out, t + i * 0.07, { type: 'square', f: f[i] * o.p, a: 0.003, d: i === f.length - 1 ? 0.45 : 0.12, v: 0.12, send: 0.25, vib: { rate: 6, cents: 12, delay: 0.1 } });
    }
    E.tone(o.out, t, { type: 'triangle', f: 262 * o.p, a: 0.01, d: 0.6, v: 0.22 });
    return 0.8;
  });
  def('bite', function (E, t, o) {
    // "Plunk" plaváka + šplech + krátky signál: hráč musí okamžite vedieť, že ryba zabrala.
    E.tone(o.out, t, { type: 'sine', f: 360 * o.p, f2: 110 * o.p, glide: 0.12, a: 0.003, d: 0.22, v: 0.42 });
    E.noise(o.out, t, { d: 0.1, v: 0.16, filter: { type: 'bandpass', f: 1300, f2: 600, glide: 0.1, q: 1 } });
    E.tone(o.out, t + 0.02, { type: 'square', f: 880 * o.p, a: 0.002, d: 0.06, v: 0.1 });
    E.tone(o.out, t + 0.09, { type: 'square', f: 1175 * o.p, a: 0.002, d: 0.08, v: 0.1 });
    return 0.3;
  });
  def('landed', function (E, t, o) {
    var f = [784, 1047, 1319, 1568];
    for (var i = 0; i < f.length; i++) E.tone(o.out, t + i * 0.06, { type: 'triangle', f: f[i] * o.p, a: 0.002, d: i === 3 ? 0.4 : 0.1, v: 0.24 });
    E.tone(o.out, t + 0.18, { type: 'square', f: 392 * o.p, a: 0.004, d: 0.3, v: 0.08, send: 0.2 });
    E.tone(o.out, t, { type: 'sine', f: 150 * o.p, f2: 60, glide: 0.12, a: 0.003, d: 0.15, v: 0.32 });
    return 0.65;
  });
  def('escape', function (E, t, o) {
    E.tone(o.out, t, { type: 'square', f: 587 * o.p, f2: 277 * o.p, glide: 0.4, a: 0.005, sus: true, hold: 0.3, r: 0.12, v: 0.13, vib: { rate: 8, cents: 45 }, filter: { f: 2200 } });
    E.noise(o.out, t + 0.05, { d: 0.2, v: 0.12, filter: { type: 'bandpass', f: 900, q: 0.8 } });
    return 0.5;
  });
  def('tap_good', function (E, t, o) {
    // Hlavná spätná väzba rytmu — musí prejsť cez hudbu boja (audio_check hlási odstup v dB).
    E.tone(o.out, t, { type: 'triangle', f: 1760 * o.p, a: 0.001, d: 0.07, v: 0.45 });
    E.tone(o.out, t, { type: 'square', f: 3520 * o.p, a: 0.001, d: 0.02, v: 0.07 });
    E.noise(o.out, t, { d: 0.02, v: 0.16, filter: { type: 'highpass', f: 6000 } });
    return 0.08;
  });
  def('tap_bad', function (E, t, o) {
    // Dva rozladené tóny = tupý bzukot; hráč ho počuje aj bez pohľadu na ukazovateľ.
    E.tone(o.out, t, { type: 'square', f: 98 * o.p, a: 0.002, d: 0.16, v: 0.17, filter: { f: 800 } });
    E.tone(o.out, t, { type: 'square', f: 104 * o.p, a: 0.002, d: 0.16, v: 0.17, filter: { f: 800 } });
    E.noise(o.out, t, { d: 0.08, v: 0.25, filter: { f: 400 } });
    return 0.2;
  });
  def('phase_pull', function (E, t, o) {
    E.tone(o.out, t, { type: 'sawtooth', f: 82 * o.p, a: 0.015, d: 0.17, v: 0.24, filter: { f: 300, f2: 1000, glide: 0.1, q: 3 } });
    return 0.2;
  });
  def('phase_slack', function (E, t, o) {
    E.tone(o.out, t, { type: 'sine', f: 1175 * o.p, a: 0.002, d: 0.14, v: 0.24 });
    E.tone(o.out, t, { type: 'triangle', f: 2350 * o.p, a: 0.002, d: 0.06, v: 0.06 });
    return 0.17;
  });
  // Prasknutie: prask vlasca, švih a dlhý kovový "ping". Ide cez bus "sting", ktorý
  // snapSilence nestíši — ping má zaznieť sám, v tichu (dizajn 14.2).
  def('snap', function (E, t, o) {
    E.noise(o.out, t, { d: 0.04, v: 0.4, filter: { type: 'highpass', f: 2500 } });
    E.tone(o.out, t, { type: 'sine', f: 180, f2: 55, glide: 0.1, a: 0.002, d: 0.12, v: 0.25 });
    var f = 2637 * o.p;
    E.tone(o.out, t + 0.005, { type: 'sine', f: f, f2: f * 0.985, glide: 1.0, a: 0.002, d: 1.1, v: 0.32, send: 0.3, bus: 'sting' });
    E.tone(o.out, t + 0.005, { type: 'sine', f: f * 2.76, a: 0.002, d: 0.4, v: 0.07 });
    E.tone(o.out, t + 0.005, { type: 'sine', f: f * 5.4, a: 0.002, d: 0.18, v: 0.035 });
    return 1.2;
  }, { gap: 0.3, sting: true });
  def('jelly', function (E, t, o) {
    // Elektrický zášľah: bzučiaci pílovitý tón s rýchlym tremolom a praskanie.
    var ctx = E.ctx;
    var trem = ctx.createGain();
    trem.gain.value = 0.5;
    var lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.type = 'square'; lfo.frequency.value = 32; lg.gain.value = 0.5;
    lfo.connect(lg); lg.connect(trem.gain);
    trem.connect(o.out);
    E.tone(trem, t, { type: 'sawtooth', f: 55 * o.p, a: 0.005, d: 0.4, v: 0.3, filter: { f: 2500 } });
    E.noise(trem, t, { d: 0.35, v: 0.26, filter: { type: 'bandpass', f: 3000, q: 2 } });
    lfo.start(t); lfo.stop(t + 0.45);
    return 0.45;
  });
  def('rock', function (E, t, o) {
    E.noise(o.out, t, { d: 0.28, v: 0.34, filter: { type: 'bandpass', f: 2200, f2: 700, glide: 0.25, q: 4 } });
    E.tone(o.out, t, { type: 'sine', f: 90 * o.p, f2: 50, glide: 0.15, a: 0.003, d: 0.18, v: 0.34 });
    E.tone(o.out, t, { type: 'square', f: 130 * o.p, a: 0.001, d: 0.03, v: 0.1 });
    return 0.32;
  });
  def('shark_warn', function (E, t, o) {
    // Dva striedavé nízke tóny (poltón) — hrozba, ktorú každý pozná.
    var seq = [[0, 82.4, 0.3], [0.36, 87.3, 0.3], [0.8, 82.4, 0.16], [0.98, 87.3, 0.16], [1.16, 82.4, 0.16], [1.34, 87.3, 0.24]];
    for (var i = 0; i < seq.length; i++) {
      E.tone(o.out, t + seq[i][0], { type: 'sawtooth', f: seq[i][1] * o.p, a: 0.02, sus: true, hold: seq[i][2] - 0.02, r: 0.06, v: 0.3, filter: { f: 520, q: 2 } });
    }
    E.tone(o.out, t, { type: 'triangle', f: 1760 * o.p, a: 0.002, d: 0.1, v: 0.07 });
    E.tone(o.out, t + 0.12, { type: 'triangle', f: 1760 * o.p, a: 0.002, d: 0.1, v: 0.07 });
    return 1.62;
  });
  def('harpoon', function (E, t, o) {
    E.noise(o.out, t, { d: 0.18, a: 0.02, v: 0.3, filter: { type: 'bandpass', f: 500, f2: 3500, glide: 0.16, q: 1.5 } });
    E.tone(o.out, t + 0.16, { type: 'square', f: 180 * o.p, f2: 60, glide: 0.1, a: 0.002, d: 0.12, v: 0.22 });
    E.noise(o.out, t + 0.16, { d: 0.07, v: 0.2, filter: { f: 800 } });
    return 0.35;
  });
  def('octopus', function (E, t, o) {
    E.tone(o.out, t, { type: 'sine', f: 420 * o.p, f2: 140 * o.p, glide: 0.3, a: 0.01, d: 0.34, v: 0.3, vib: { rate: 18, cents: 150 } });
    E.noise(o.out, t, { d: 0.25, a: 0.02, v: 0.14, filter: { f: 600 } });
    return 0.4;
  });
  def('octopus_off', function (E, t, o) {
    E.tone(o.out, t, { type: 'sine', f: 180 * o.p, f2: 760 * o.p, glide: 0.12, a: 0.003, d: 0.14, v: 0.3 });
    for (var i = 0; i < 3; i++) E.bubble(o.out, t + 0.08 + i * 0.06, (500 + 250 * i) * o.p, 0.12);
    return 0.35;
  });
  def('eel', function (E, t, o) {
    E.noise(o.out, t, { a: 0.12, sus: true, hold: 0.12, r: 0.1, v: 0.16, filter: { type: 'bandpass', f: 4000, q: 1 } });
    E.tone(o.out, t + 0.3, { type: 'square', f: 220 * o.p, f2: 70, glide: 0.06, a: 0.002, d: 0.08, v: 0.22 });
    E.tone(o.out, t + 0.42, { type: 'square', f: 200 * o.p, f2: 60, glide: 0.06, a: 0.002, d: 0.1, v: 0.22 });
    return 0.55;
  });
  def('thunder', function (E, t, o) {
    E.noise(o.out, t, { d: 0.08, v: 0.35, filter: { type: 'highpass', f: 1500 } });
    E.noise(o.out, t + 0.02, { brown: true, a: 0.05, d: 2.3, v: 0.55, filter: { f: 450 * o.p, f2: 90, glide: 2.0, q: 0.5 } });
    E.noise(o.out, t + 0.45, { brown: true, a: 0.2, d: 1.6, v: 0.35, filter: { f: 250 * o.p, f2: 70, glide: 1.4, q: 0.5 } });
    return 2.5;
  });
  def('splash', function (E, t, o) {
    E.noise(o.out, t, { d: 0.35, v: 0.32, filter: { type: 'bandpass', f: 1400 * o.p, f2: 500, glide: 0.3, q: 0.8 } });
    for (var i = 0; i < 3; i++) E.bubble(o.out, t + 0.1 + i * 0.07, (380 + o.rng.next() * 500) * o.p, 0.1);
    return 0.45;
  });
  def('ascend', function (E, t, o) {
    // Dĺžka zodpovedá animácii HORE (T.ascendSec ~1 s).
    E.noise(o.out, t, { a: 0.3, sus: true, hold: 0.4, r: 0.2, v: 0.22, filter: { type: 'bandpass', f: 300, f2: 2600, glide: 0.9, q: 1.2 } });
    E.tone(o.out, t, { type: 'triangle', f: 220 * o.p, f2: 880 * o.p, glide: 0.9, a: 0.1, sus: true, hold: 0.6, r: 0.2, v: 0.12 });
    return 0.92;
  });
  def('surface', function (E, t, o) {
    E.noise(o.out, t, { d: 0.35, v: 0.28, filter: { type: 'bandpass', f: 1400, f2: 500, glide: 0.3, q: 0.8 } });
    var f = [523, 659, 784];
    for (var i = 0; i < 3; i++) E.tone(o.out, t + 0.15 + i * 0.03, { type: 'triangle', f: f[i] * o.p, a: 0.02, sus: true, hold: 0.35, r: 0.3, v: 0.12 });
    E.tone(o.out, t + 0.25, { type: 'sine', f: 1047 * o.p, a: 0.003, d: 0.5, v: 0.1, send: 0.3 });
    return 0.85;
  });
  def('legend', function (E, t, o) {
    // Zlovestné zjavenie: hlboký úder, temný dron a mollový akord s dlhým nábehom.
    E.tone(o.out, t, { type: 'sine', f: 70, f2: 40, glide: 0.3, a: 0.005, d: 0.5, v: 0.36 });
    E.tone(o.out, t, { type: 'sawtooth', f: 55 * o.p, a: 0.4, sus: true, hold: 1.2, r: 0.6, v: 0.16, filter: { f: 400, f2: 1100, glide: 1.4, q: 2 } });
    var f = [110, 130.8, 164.8];
    for (var i = 0; i < 3; i++) E.tone(o.out, t + 0.1, { type: 'triangle', f: f[i] * o.p, a: 0.6, sus: true, hold: 0.9, r: 0.6, v: 0.1, vib: { rate: 4, cents: 15, delay: 0.6 } });
    E.tone(o.out, t + 0.8, { type: 'sine', f: 622 * o.p, a: 0.003, d: 1.2, v: 0.08, send: 0.4 });
    return 2.2;
  });
  def('perk', function (E, t, o) {
    var f = [1047, 1175, 1319, 1568, 1760, 2093];
    for (var i = 0; i < f.length; i++) E.tone(o.out, t + i * 0.045, { type: i % 2 ? 'sine' : 'triangle', f: f[i] * o.p, a: 0.002, d: 0.25, v: 0.13, send: 0.35 });
    return 0.55;
  });
  def('quest', function (E, t, o) {
    var f = [[0, 523, 0.1], [0.1, 659, 0.1], [0.2, 784, 0.1], [0.3, 1047, 0.4]];
    for (var i = 0; i < f.length; i++) E.tone(o.out, t + f[i][0], { type: 'square', f: f[i][1] * o.p, a: 0.003, sus: true, hold: f[i][2] - 0.02, r: 0.06, v: 0.12, filter: { f: 3500 }, vib: i === 3 ? { rate: 6, cents: 14, delay: 0.12 } : null });
    E.tone(o.out, t, { type: 'triangle', f: 262 * o.p, a: 0.005, sus: true, hold: 0.25, r: 0.05, v: 0.2 });
    E.tone(o.out, t + 0.3, { type: 'triangle', f: 196 * o.p, a: 0.005, sus: true, hold: 0.35, r: 0.1, v: 0.2 });
    return 0.8;
  });
  def('error', function (E, t, o) {
    E.tone(o.out, t, { type: 'square', f: 220 * o.p, a: 0.002, sus: true, hold: 0.06, r: 0.02, v: 0.14, filter: { f: 1800 } });
    E.tone(o.out, t + 0.11, { type: 'square', f: 220 * o.p, a: 0.002, sus: true, hold: 0.06, r: 0.02, v: 0.14, filter: { f: 1800 } });
    return 0.21;
  });
  def('sleep', function (E, t, o) {
    var f = [784, 659, 523];
    for (var i = 0; i < 3; i++) E.tone(o.out, t + i * 0.3, { type: 'triangle', f: f[i] * o.p, a: 0.02, sus: true, hold: 0.3, r: 0.25, v: 0.14, send: 0.3 });
    E.tone(o.out, t, { type: 'sine', f: 262 * o.p, a: 0.3, sus: true, hold: 0.8, r: 0.4, v: 0.1 });
    return 1.52;
  });

  // Čajka pre prostredie dediny (nie je v zozname efektov — spúšťa ju časovač).
  function gull(E, dest, t, p, pan) {
    var node = dest;
    if (E.ctx.createStereoPanner) {
      var pn = E.ctx.createStereoPanner();
      pn.pan.value = pan;
      pn.connect(dest);
      node = pn;
    }
    E.tone(node, t, { type: 'triangle', f: 1400 * p, f2: 1900 * p, glide: 0.12, a: 0.02, sus: true, hold: 0.14, r: 0.12, v: 0.09, vib: { rate: 13, cents: 60 }, filter: { f: 3000 } });
    E.tone(node, t + 0.32, { type: 'triangle', f: 1500 * p, f2: 1200 * p, glide: 0.15, a: 0.02, sus: true, hold: 0.08, r: 0.1, v: 0.07, vib: { rate: 13, cents: 60 }, filter: { f: 3000 } });
  }

  // ------------------------------------------------------------------ play
  Engine.prototype.play = function (name, o) {
    var voice = V[name];
    if (!voice) { noteMissing(name); return false; }
    o = o || {};
    var ctx = this.ctx, now = ctx.currentTime;
    var gap = voice.gap != null ? voice.gap : T.sfxMinGapMs / 1000;
    var last = this.lastPlay[name];
    // Veľa udalostí v jednom kroku (napr. 5 predaných rýb) by sa sčítalo do jedného
    // hlasného kliku. Tesné opakovanie sa zahodí.
    if (last != null && now - last < gap && !o.force) return false;
    // Počet znejúcich hlasov podľa naplánovaných koncov. onended by stačil len vtedy,
    // keby vždy prišiel — pri pozastavenom kontexte nepríde a efekty by navždy stíchli.
    for (var k = this.ends.length - 1; k >= 0; k--) if (this.ends[k] <= now) this.ends.splice(k, 1);
    if (this.ends.length >= T.sfxMaxVoices && !o.force) return false;
    var pitch = clamp(fin(o.pitch, 1), 0.25, 4);
    var vol = clamp(fin(o.vol, 1), 0, 2);
    var pan = clamp(fin(o.pan, 0), -1, 1);
    // Opakovaný zvuk s mierne inou výškou a hlasitosťou neunaví ucho ("strojovú" repetíciu).
    if (o.vary !== false) {
      pitch *= 1 + (this.rng.next() * 2 - 1) * T.sfxPitchVar;
      vol *= 1 - this.rng.next() * T.sfxVolVar;
    }
    var out = ctx.createGain();
    out.gain.value = vol;
    var tail = out;
    if (pan && ctx.createStereoPanner) {
      var pn = ctx.createStereoPanner();
      pn.pan.value = pan;
      out.connect(pn);
      tail = pn;
    }
    tail.connect(voice.sting ? this.bus.sting : this.bus.sfx);
    this._voiceEnd = 0; this._voiceSrc = null;
    var dur = voice.fn(this, now + 0.002, { out: out, p: pitch, rng: this.rng });
    var E = this, src = this._voiceSrc;
    this.ends.push(Math.max(this._voiceEnd, now + 0.01));
    this.voices = this.ends.length;
    this.lastPlay[name] = now;
    // Upratanie po dozvučaní: bez toho by každé ťuknutie nechalo visieť uzly v grafe.
    if (src) {
      src.onended = function () {
        try { tail.disconnect(); } catch (e) { /* už odpojené */ }
      };
    }
    return dur > 0 ? dur : true;
  };

  var missing = A.missing = [];
  function noteMissing(name) {
    if (missing.indexOf(String(name)) < 0 && missing.length < 50) missing.push(String(name));
  }

  // ------------------------------------------------------------------ škrípanie (4.2, 14.2)
  // Mapovanie napätia na parametre je čistá funkcia — dá sa testovať v Node a čítajú
  // ju aj merania. Hranice berie ŽIVO z T.warn1..3 (posuvníky F2 ich menia).
  A.creakParams = function (ratio) {
    // NaN -> 0 (ticho), Infinity -> strop; napätie nad 1 znamená prasknutie, nie hlasnejšie.
    var r = ratio > 0 ? Math.min(ratio, 1.2) : 0;
    var w1 = T.warn1, w2 = Math.max(T.warn2, w1), w3 = Math.max(T.warn3, w2);
    var lo = Math.max(1, T.creakHzLo), hi = Math.max(1, T.creakHzHi);
    if (!(r >= w1)) return { on: false, level: 0, x: 0, vol: 0, hz: lo, grit: 0, squeal: 0, wobble: 0, alarm: 0 };
    var x = clamp01((r - w1) / Math.max(1e-6, 1 - w1));
    var level = r >= w3 ? 3 : r >= w2 ? 2 : 1;
    // Výška stúpa exponenciálne (hudobne rovnomerne), nie lineárne v Hz.
    var hz = lo * Math.pow(hi / lo, x);
    var g = Math.max(0, T.creakGrit);
    return {
      on: true, level: level, x: x,
      vol: lerp(T.creakVolLo, T.creakVolHi, x),
      hz: hz,
      grit: g * lerp(0.35, 1, x),
      squeal: g * 0.12 * x * x,
      wobble: r >= w2 ? T.creakWobbleDepth * lerp(0.35, 1, clamp01((r - w2) / Math.max(1e-6, 1 - w2))) : 0,
      alarm: r >= w3 ? T.alarmVol * lerp(0.7, 1, clamp01((r - w3) / Math.max(1e-6, 1 - w3))) : 0,
    };
  };

  Engine.prototype._creakGraph = function () {
    var ctx = this.ctx, t = ctx.currentTime, E = this;
    var c = { last: {} };
    c.out = gainNode(ctx, 0, this.bus.sfx);
    c.wob = gainNode(ctx, 1, c.out);          // kmitanie (VCA)
    // Trenie: pílovitý tón s rozkolísanou výškou cez rezonančný dolný priepust.
    c.saw = ctx.createOscillator(); c.saw.type = 'sawtooth'; c.saw.frequency.value = T.creakHzLo;
    c.sawF = ctx.createBiquadFilter(); c.sawF.type = 'lowpass'; c.sawF.Q.value = 5; c.sawF.frequency.value = T.creakHzLo * 6;
    c.saw.connect(c.sawF); c.sawF.connect(c.wob);
    c.jit = ctx.createBufferSource(); c.jit.buffer = E.jitter; c.jit.loop = true;
    c.jitG = gainNode(ctx, 0); c.jit.connect(c.jitG); c.jitG.connect(c.saw.detune);
    // Drsnosť: pásmový šum, ktorého stred ide s výškou trenia.
    c.nz = ctx.createBufferSource(); c.nz.buffer = E.white; c.nz.loop = true;
    c.nzF = ctx.createBiquadFilter(); c.nzF.type = 'bandpass'; c.nzF.Q.value = 5; c.nzF.frequency.value = T.creakHzLo * 9;
    // Nepravidelná amplitúda šumu (praskot trenia "stick-slip").
    c.crk = gainNode(ctx, 1, c.wob);
    c.nzG = gainNode(ctx, 0, c.crk);
    c.nz.connect(c.nzF); c.nzF.connect(c.nzG);
    c.jf = ctx.createBufferSource(); c.jf.buffer = E.jitterFast; c.jf.loop = true;
    c.jfG = gainNode(ctx, 0); c.jf.connect(c.jfG); c.jfG.connect(c.crk.gain);
    // Pišťanie napnutého vlasca (rastie s kvadrátom napätia). Drží sa POD pásmom poplachu:
    // na ×11 sedelo presne na 2,3 kHz a zakrývalo varovný tón (odhalila to kontrola sondy).
    c.sq = ctx.createOscillator(); c.sq.type = 'sine'; c.sq.frequency.value = T.creakHzLo * 7;
    c.sqG = gainNode(ctx, 0, c.wob); c.sq.connect(c.sqG);
    c.jitSq = gainNode(ctx, 0); c.jitG.connect(c.jitSq); c.jitSq.connect(c.sq.detune);
    // Kmitanie od warn2: LFO na hlasitosť aj na výšku.
    c.lfo = ctx.createOscillator(); c.lfo.frequency.value = T.creakWobbleHz;
    c.lfoA = gainNode(ctx, 0); c.lfo.connect(c.lfoA); c.lfoA.connect(c.wob.gain);
    c.lfoP = gainNode(ctx, 0); c.lfo.connect(c.lfoP); c.lfoP.connect(c.saw.detune);
    // Poplach od warn3: vysoký tón pulzujúci štvorcovým LFO. Štvorec ide cez dolný
    // priepust 40 Hz, takže pulzy majú mäkké hrany a necvakajú.
    c.alarm = ctx.createOscillator(); c.alarm.type = 'triangle'; c.alarm.frequency.value = T.alarmHz;
    c.alarm2 = ctx.createOscillator(); c.alarm2.type = 'sine'; c.alarm2.frequency.value = T.alarmHz * 2;
    c.alarmVCA = gainNode(ctx, 0, this.bus.sfx);
    c.alarm2G = gainNode(ctx, 0.25, c.alarmVCA);
    c.alarm.connect(c.alarmVCA); c.alarm2.connect(c.alarm2G);
    c.pulse = ctx.createOscillator(); c.pulse.type = 'square'; c.pulse.frequency.value = T.alarmRateHz;
    c.pulseF = ctx.createBiquadFilter(); c.pulseF.type = 'lowpass'; c.pulseF.frequency.value = 40; c.pulseF.Q.value = 0.5;
    c.pulseG = gainNode(ctx, 0);
    c.pulse.connect(c.pulseF); c.pulseF.connect(c.pulseG); c.pulseG.connect(c.alarmVCA.gain);
    var srcs = [c.saw, c.jit, c.nz, c.jf, c.sq, c.lfo, c.alarm, c.alarm2, c.pulse];
    for (var i = 0; i < srcs.length; i++) srcs[i].start(t);
    return c;
  };

  // Nastaví parameter len pri skutočnej zmene — creak() sa volá 60× za sekundu
  // a každé volanie by inak pridalo udalosť do časovej osi parametra.
  function cset(c, key, param, v, t, tc) {
    var last = c.last[key];
    if (last !== undefined && Math.abs(last - v) <= Math.abs(v) * 0.002 + 1e-5) return;
    c.last[key] = v;
    glide(param, v, t, tc);
  }

  Engine.prototype.creak = function (ratio) {
    var now = this.ctx.currentTime;
    this.creakAge = 0;
    var r = fin(ratio, 0);
    if (now < this.creakBlockUntil) r = 0;
    this.creakRatio = r;
    var p = A.creakParams(r);
    if (!p.on && !this.cr) return p;          // ticho a graf ešte netreba stavať
    var c = this.cr || (this.cr = this._creakGraph());
    var tc = 0.05;
    cset(c, 'vol', c.out.gain, p.vol, now, p.on ? tc : 0.06);
    cset(c, 'hz', c.saw.frequency, p.hz, now, tc);
    cset(c, 'sawF', c.sawF.frequency, p.hz * 6, now, tc);
    cset(c, 'nzF', c.nzF.frequency, p.hz * 9, now, tc);
    cset(c, 'sq', c.sq.frequency, p.hz * 7, now, tc);
    cset(c, 'jit', c.jitG.gain, 35 * p.grit + 5, now, tc);
    cset(c, 'jitSq', c.jitSq.gain, 0.4, now, tc);
    cset(c, 'nzG', c.nzG.gain, 0.5 * p.grit, now, tc);
    cset(c, 'jf', c.jfG.gain, 0.45 * Math.min(1, p.grit), now, tc);
    cset(c, 'sqG', c.sqG.gain, p.squeal, now, tc);
    cset(c, 'wob', c.wob.gain, 1 - p.wobble / 2, now, tc);
    cset(c, 'lfoA', c.lfoA.gain, p.wobble / 2, now, tc);
    cset(c, 'lfoP', c.lfoP.gain, 40 * p.wobble, now, tc);
    cset(c, 'lfoHz', c.lfo.frequency, T.creakWobbleHz, now, tc);
    cset(c, 'alarmHz', c.alarm.frequency, T.alarmHz * (1 + 0.08 * p.x), now, tc);
    cset(c, 'alarm2Hz', c.alarm2.frequency, T.alarmHz * 2 * (1 + 0.08 * p.x), now, tc);
    cset(c, 'pulseHz', c.pulse.frequency, T.alarmRateHz, now, tc);
    cset(c, 'alarmV', c.alarmVCA.gain, p.alarm / 2, now, p.alarm ? 0.02 : 0.05);
    cset(c, 'pulseG', c.pulseG.gain, p.alarm / 2, now, p.alarm ? 0.02 : 0.05);
    return p;
  };

  Engine.prototype._creakKill = function (now) {
    var c = this.cr;
    if (!c) return;
    c.last = {};
    glide(c.out.gain, 0, now, 0.008);
    glide(c.alarmVCA.gain, 0, now, 0.008);
    glide(c.pulseG.gain, 0, now, 0.008);
    this.creakRatio = 0;
  };

  // ------------------------------------------------------------------ navijak (klesanie)
  // Cvakanie rohatky navijaka, ktoré zrýchľuje s rýchlosťou klesania, + občasná bublinka.
  // Cvaknutia sa plánujú v update() na hodinách AudioContextu (rovnomerne v rámci kroku).
  Engine.prototype.reel = function (v) {
    this.reelV = clamp01(fin(v, 0));
    this.reelAge = 0;
  };
  Engine.prototype._reelStep = function (dt, now) {
    this.reelAge += dt;
    if (this.reelAge > 0.25) this.reelV = 0;   // volajúci prestal volať (iná scéna) — nesmie cvakať ďalej
    var v = this.reelV;
    if (!(v > 0.02) || now < this.creakBlockUntil) { this.reelPhase = 0; return; }
    this.reelPhase += lerp(T.reelRateLo, T.reelRateHi, v) * dt;
    var n = Math.floor(this.reelPhase);
    this.reelPhase -= n;
    for (var k = 0; k < n; k++) {
      var tk = now + 0.02 + (k / n) * dt;
      this.noise(this.bus.sfx, tk, { d: 0.014, v: T.reelVol * (0.55 + 0.45 * v) * (0.8 + 0.4 * this.rng.next()),
        filter: { type: 'bandpass', f: T.reelHz * (0.9 + 0.35 * v), q: 2 } });
    }
    if (this.rng.next() < dt * T.reelBubbles * v) this.bubble(this.bus.sfx, now + 0.03, 380 + this.rng.next() * 700, 0.07);
  };

  // ------------------------------------------------------------------ prasknutie (14.2)
  Engine.prototype.snapSilence = function (sec) {
    sec = clamp(fin(sec, 1.5), 0, 30);
    var now = this.ctx.currentTime;
    this.play('snap', { vary: false, force: true });
    this.creakBlockUntil = now + sec;
    this._creakKill(now);
    var g = this.duck.gain;
    hold(g, now);
    g.linearRampToValueAtTime(0, now + 0.04);
    g.setValueAtTime(0, now + 0.04 + sec);
    g.linearRampToValueAtTime(1, now + 0.04 + sec + T.snapFadeSec);
    this.snaps++;
    return true;
  };

  // ------------------------------------------------------------------ hlasitosť
  // Posuvník 0..1 -> zosilnenie v^2: ucho vníma hlasitosť logaritmicky, takže lineárny
  // posuvník by mal celú zmenu natlačenú do spodnej štvrtiny.
  Engine.prototype.setVolumes = function (music, sfx, instant) {
    var m = clamp01(fin(music, this.vol.music)), s = clamp01(fin(sfx, this.vol.sfx));
    this.vol.music = m; this.vol.sfx = s;
    var t = this.ctx.currentTime, b = this.bus;
    var set = function (param, v) { if (instant) param.value = v; else glide(param, v, t, 0.03); };
    set(b.music.gain, m * m);
    set(b.sfx.gain, s * s);
    set(b.sting.gain, s * s);
    set(b.amb.gain, s * s * T.ambVol);
  };

  // ------------------------------------------------------------------ prostredie
  Engine.prototype.ambience = function (kind) {
    if (kind !== 'village' && kind !== 'sea') kind = null;
    var cur = this.amb;
    if ((cur ? cur.kind : null) === kind) return;   // žiadna druhá kópia tej istej slučky
    var ctx = this.ctx, now = ctx.currentTime;
    if (cur) {
      hold(cur.gain.gain, now);
      cur.gain.gain.linearRampToValueAtTime(0, now + 1.5);
      for (var i = 0; i < cur.stop.length; i++) cur.stop[i].stop(now + 1.6);
      this.ambOld.push({ layer: cur, until: now + 1.7 });
    }
    this.amb = null;
    if (!kind) return;
    var L = { kind: kind, gain: gainNode(ctx, 0, this.bus.amb), stop: [], rumbleF: null };
    L.gain.gain.setValueAtTime(0, now);
    L.gain.gain.linearRampToValueAtTime(1, now + 1.5);
    var E = this;
    function loop(buf, filt, f, q, v, lfoHz, lfoDepth, lfoParam) {
      var s = ctx.createBufferSource(); s.buffer = buf; s.loop = true;
      var bq = ctx.createBiquadFilter(); bq.type = filt; bq.frequency.value = f; bq.Q.value = q;
      var g = gainNode(ctx, v, L.gain);
      s.connect(bq); bq.connect(g);
      if (lfoHz) {
        var lfo = ctx.createOscillator(), lg = gainNode(ctx, lfoDepth);
        lfo.frequency.value = lfoHz;
        lfo.connect(lg); lg.connect(lfoParam === 'f' ? bq.frequency : g.gain);
        lfo.start(now); L.stop.push(lfo);
      }
      s.start(now, E.rng.next() * 1.5); L.stop.push(s);
      return bq;
    }
    if (kind === 'village') {
      // Príboj: hnedý šum s pomalým nádychom a výdychom vĺn, nad ním syčanie peny.
      loop(this.brown, 'lowpass', 700, 0.5, 0.45, 0.11, 0.3, 'g');
      loop(this.white, 'bandpass', 600, 0.6, 0.05, 0.083, 0.04, 'g');
      this.ambTimer = 1.5 + this.rng.next() * 3;
    } else {
      // Pod hladinou: nízke dunenie; čím hlbšie, tým tmavšie (setDepth).
      L.rumbleF = loop(this.brown, 'lowpass', 200, 0.7, 0.8, 0.05, 30, 'f');
      loop(this.white, 'bandpass', 180, 3, 0.03, 0.07, 0.02, 'g');
      this.ambTimer = 2 + this.rng.next() * 4;
      this._rumble(now);
    }
    this.amb = L;
  };

  Engine.prototype._rumble = function (now) {
    if (!this.amb || !this.amb.rumbleF) return;
    var f = 220 - 130 * clamp01(this.depth / 1500);
    glide(this.amb.rumbleF.frequency, f, now, 0.5);
  };

  Engine.prototype.setDepth = function (m) {
    m = Math.max(0, fin(m, 0));
    if (Math.abs(m - this.depth) < 5) return;
    this.depth = m;
    this._rumble(this.ctx.currentTime);
  };

  // ------------------------------------------------------------------ krok
  Engine.prototype.update = function (dt) {
    dt = clamp(fin(dt, 0), 0, 0.5);
    var now = this.ctx.currentTime;
    // Strážca škrípania: keď ho volajúci prestane volať (koniec ponoru, iná scéna),
    // nesmie ostať visieť ako nekonečný tón.
    this.creakAge += dt;
    if (this.cr && this.creakRatio > 0 && this.creakAge > 0.25) this.creak(0);
    // Posuvník dozvuku v F2 sa prejaví hneď (lacná kontrola, prerába len pri zmene). Chyba dozvuku
    // nesmie zastaviť plánovanie hudby: bez dozvuku hra hrá ďalej.
    try { this._verbSync(); } catch (e) { this.verb = null; }
    this._reelStep(dt, now);
    if (this.amb) {
      this.ambTimer -= dt;
      if (this.ambTimer <= 0) {
        var r = this.rng;
        if (this.amb.kind === 'village') {
          gull(this, this.amb.gain, now + 0.05, 0.9 + r.next() * 0.25, r.next() * 1.6 - 0.8);
          this.ambTimer = T.gullMinSec + r.next() * Math.max(0, T.gullMaxSec - T.gullMinSec);
        } else {
          var n = 1 + Math.floor(r.next() * 3);
          for (var i = 0; i < n; i++) this.bubble(this.amb.gain, now + 0.05 + i * 0.07, 300 + r.next() * 400, 0.05);
          this.ambTimer = 2 + r.next() * 5;
        }
      }
    }
    for (var k = this.ambOld.length - 1; k >= 0; k--) {
      if (now > this.ambOld[k].until) {
        try { this.ambOld[k].layer.gain.disconnect(); } catch (e) { /* už odpojené */ }
        this.ambOld.splice(k, 1);
      }
    }
  };

  // Okamžitá úroveň živého výstupu (pre harness): { rms, peak }.
  Engine.prototype.meter = function () {
    if (!this.analyser || !this.analyser.getFloatTimeDomainData) return null;
    var buf = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(buf);
    var s = 0, pk = 0;
    for (var i = 0; i < buf.length; i++) { var v = buf[i]; s += v * v; if (Math.abs(v) > pk) pk = Math.abs(v); }
    return { rms: Math.sqrt(s / buf.length), peak: pk };
  };

  A.Engine = Engine;
  A.createEngine = function (ctx, opts) { return new Engine(ctx, opts); };
  A.names = function () { return Object.keys(V); };

  // ================================================================== živá fasáda HL.audio
  var Ctor = (typeof AudioContext !== 'undefined') ? AudioContext
    : (typeof webkitAudioContext !== 'undefined') ? webkitAudioContext : null; // eslint-disable-line no-undef
  var live = null, broken = false;
  var vols = { music: 0.6, sfx: 0.8 };
  // Stlmenie platformou (CrazyGames settings.muteAudio, core/platform.js): má PREDNOSŤ pred hlasitosťou hráča
  // aj pred tlačidlom zvuku v pauze — kým platí, idú do zbernice nuly. vols ostávajú hráčove, takže
  // po zrušení sa vráti presne jeho hlasitosť (nastavenia v HL.game.settings sa nemenia).
  var platformMute = false;
  function applyVols(instant) {
    if (live) live.setVolumes(platformMute ? 0 : vols.music, platformMute ? 0 : vols.sfx, instant);
  }
  var seen = { music: null, sfx: null };
  var wantAmb = null;
  var wantDepth = 0;        // hĺbka zadaná pred odomknutím (ako prostredie) — nesmie sa stratiť
  A.available = !!Ctor;

  function muted() { return !!(HL.query && (HL.query.mute === '1' || HL.query.mute === true)); }
  function running() { return !!(live && live.ctx.state === 'running'); }

  // Prvé gesto hráča (input.js volá pri každom stlačení): prehliadače nedovolia zvuk
  // pred gestom, preto sa kontext vytvára až tu, nie pri načítaní.
  A.unlock = function () {
    if (!Ctor || broken || muted()) return false;
    try {
      if (!live) {
        var ctx;
        // Staršie Safari (webkitAudioContext) nepozná parameter s voľbami.
        try { ctx = new Ctor({ latencyHint: 'interactive' }); } catch (e1) { ctx = new Ctor(); }
        live = new Engine(ctx);
        // iPhone: bez tohto Web Audio zmĺkne pri prepínači ticha (Safari 17+ pozná audioSession).
        try { if (typeof navigator !== 'undefined' && navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* staršie Safari */ }
        applyVols(true);
        live.setDepth(wantDepth);
        if (wantAmb) live.ambience(wantAmb);
        if (typeof document !== 'undefined' && document.addEventListener) {
          // Skrytá karta: slučka hry stojí, takže by škrípanie a dron zneli donekonečna.
          document.addEventListener('visibilitychange', function () {
            if (!live) return;
            try { if (document.hidden) live.ctx.suspend(); else live.ctx.resume(); } catch (e) { /* nič */ }
          });
        }
      }
      // 'suspended' pred gestom, na iOS aj 'interrupted' (hovor, zamknutie) — obe treba obnoviť.
      var st = live.ctx.state;
      if (st !== 'running' && st !== 'closed' && !(typeof document !== 'undefined' && document.hidden)) {
        var pr = live.ctx.resume();
        if (pr && pr.catch) pr.catch(function () { /* prehliadač gesto ešte neuznal */ });
      }
      return true;
    } catch (e) {
      broken = true;
      live = null;
      return false;
    }
  };

  A.setVolumes = function (music, sfx) {
    vols.music = clamp01(fin(music, vols.music));
    vols.sfx = clamp01(fin(sfx, vols.sfx));
    applyVols(false);
  };
  // true = všetok zvuk hry na 0 (CrazyGames muteAudio), false = späť na hráčove hlasitosti. Vráti, či sa zmenil.
  A.setPlatformMute = function (on) {
    on = !!on;
    if (on === platformMute) return false;
    platformMute = on;
    applyVols(false);
    return true;
  };
  A.play = function (name, o) {
    if (!V[name]) { noteMissing(name); return false; }
    if (!running()) return false;
    try { return live.play(name, o); } catch (e) { return false; }
  };
  A.creak = function (ratio) {
    if (!running()) return false;
    try { live.creak(ratio); return true; } catch (e) { return false; }
  };
  A.reel = function (v) {
    if (!running()) return false;
    try { live.reel(v); return true; } catch (e) { return false; }
  };
  A.snapSilence = function (sec) {
    if (!running()) return false;
    try { return live.snapSilence(sec); } catch (e) { return false; }
  };
  A.ambience = function (kind) {
    wantAmb = (kind === 'village' || kind === 'sea') ? kind : null;
    if (live) { try { live.ambience(wantAmb); } catch (e) { /* ticho */ } }
  };
  A._setDepth = function (m) {
    wantDepth = Math.max(0, fin(m, wantDepth));
    if (live) live.setDepth(wantDepth);
  };

  // Vibrácie (dizajn 15): iba ak ich hráč nevypol. Bez nastavení platí predvolené "zapnuté".
  A.vibrate = function (pattern) {
    var s = HL.game && HL.game.settings;
    if (s && s.vibration === false) return false;
    if (typeof navigator === 'undefined' || !navigator || typeof navigator.vibrate !== 'function') return false;
    // Pred prvým dotykom Chrome volanie zablokuje a zapíše chybu do konzoly ([Intervention]).
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return false;
    try { return navigator.vibrate(pattern) !== false; } catch (e) { return false; }
  };

  A.update = function (dt) {
    // Nastavenia sa čítajú každý krok, ale použijú sa len pri ZMENE — inak by prebili
    // setVolumes() volané priamo (napr. náhľad posuvníka).
    var s = HL.game && HL.game.settings;
    if (s && (s.musicVol !== seen.music || s.sfxVol !== seen.sfx)) {
      seen.music = s.musicVol; seen.sfx = s.sfxVol;
      A.setVolumes(s.musicVol, s.sfxVol);
    }
    if (!running()) return;
    try {
      live.update(dt);
      if (HL.music && HL.music._tick) HL.music._tick(live);
    } catch (e) {
      if (HL.debug && HL.debug.errors && HL.debug.errors.length < 30) HL.debug.errors.push('audio: ' + (e && e.message));
    }
  };

  // Stav pre harness a ladenie — čísla, nie text.
  A.probe = function () {
    return {
      available: A.available, muted: muted(), broken: broken,
      state: live ? live.ctx.state : 'none',
      time: live ? live.ctx.currentTime : 0,
      volumes: { music: vols.music, sfx: vols.sfx },
      // platformMute = stlmenie z CrazyGames; effective = čo naozaj ide do zberníc (hráčove hlasitosti alebo 0)
      platformMute: platformMute,
      effective: { music: platformMute ? 0 : vols.music, sfx: platformMute ? 0 : vols.sfx },
      voices: live ? live.voices : 0,
      creak: live ? live.creakRatio : 0,
      reel: live ? live.reelV : 0,
      creakBuilt: !!(live && live.cr),
      ambience: live && live.amb ? live.amb.kind : wantAmb,
      snaps: live ? live.snaps : 0,
      meter: live ? live.meter() : null,
      missing: missing.slice(),
    };
  };
  A._live = function () { return live; };
})(globalThis.HL);
