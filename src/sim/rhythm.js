// Rytmy boja (dizajn 5.4): "Každý druh bojuje inak. Hráč sa jeho rytmus učí a pri
// ďalšom stretnutí ho spozná." Preto je rytmus vlastnosť DRUHU (fish.rhythm, legendy
// phases[i].rhythm) a nie náhoda boja — dve sardinky bojujú rovnako, len nie identicky.
//
//   HL.rhythm.TYPES -> { typ: { name, desc, basic, parts? } }      name/desc po slovensky pre UI a encyklopédiu
//   HL.rhythm.create(typ, rng, { tempo, start, ease }) -> gen
//   gen.next() -> { kind:'pull'|'slack', dur, fake, src }
//   HL.rhythm.preview(typ, n, seed?) -> [fázy]                     pevná ukážka rytmu (encyklopédia, návod)
//
// dur  = sekundy, UŽ vynásobené T.phaseScale × tempo (× ease pri skutočných fázach) a zdola
//        orezané na T.phaseMinSec (kratšiu fázu by hráč ani nevidel, a 0 by zasekla slučku boja).
// ease = násobok dĺžky SKUTOČNÝCH fáz (obtiažnosť boja, sim/fight.js; 1 = bez zmeny). Falošný
//        záblesk sa ním NEnaťahuje — pri ľahkej rybe by inak trval dosť dlho na to, aby naň hráč
//        zareagoval, a prestal by byť falošný. Hody rng sú pri každom ease tie isté.
// fake = true iba pri 'slack': zelený záblesk kratší než ľudská reakcia (~0,1 s). Po ňom
//        VŽDY nasleduje 'pull' — ryba povolenie len predstiera (Falošné pauzy).
// src  = ktorý ZÁKLADNÝ typ fázu vyrobil. Pri zmesiach (mixA, mixB, all) tak UI aj testy
//        vidia, ktorý blok práve beží; pri základných typoch je src = typ.
// start = druh prvej fázy ('pull' predvolene). Boj pri prechode fázy legendy vymieňa
//        generátor uprostred striedania a nový musí nadviazať správnym druhom (sim/fight.js).
//
// Striedanie: pull, slack, pull, slack…; falošný záblesk je 'slack' vložený medzi dva ťahy.
// Tabuľka dĺžok nižšie je ZÁKLAD v sekundách pred škálovaním — tempo celého rytmu sa ladí
// jediným posuvníkom T.phaseScale, takže tabuľka ostáva čitateľná ako popis charakteru druhu.
(function (HL) {
  HL.T.def('Boj', 'fakeChance', 0.40, 0, 0.9, 0.05, 'Falošné pauzy: šanca, že zelená je len záblesk');
  HL.T.def('Boj', 'phaseMinSec', 0.06, 0.03, 0.3, 0.01, 'Najkratšia fáza rytmu po škálovaní (s)');

  // Falošný záblesk musí byť kratší než reakcia (~0,2 s), inak by ho hráč stihol "chytiť"
  // a pauza by nebola falošná. 0,08–0,12 s sa dá VIDIEŤ, ale nie naň zareagovať.
  var FAKE_FLASH = [0.08, 0.12];
  // Bez stropu by náhoda občas vyrobila 5 zábleskov za sebou a skutočná zelená by neprišla
  // tak dlho, že by ryba unikla bez viny hráča.
  var MAX_FAKES_IN_ROW = 2;

  function jit(rng, c, frac) { return c * (1 + frac * (2 * rng.next() - 1)); }
  function jitFn(c, frac) { return function (rng) { return jit(rng, c, frac); }; }
  function rangeFn(a, b) { return function (rng) { return rng.range(a, b); }; }

  // Vlny: tempo sa PLYNULE mení — dĺžka závisí od poradia fázy, nie od náhody.
  // Náhodný je len počiatočný posun, aby každý boj nezačínal v tom istom bode vlny.
  function wave(rng, st) {
    if (st.k == null) st.k = rng.int(0, 12);
    var d = 0.6 * (1 + 0.5 * Math.sin(st.k * 0.5));
    st.k++;
    return d;
  }

  // Hravý: séria 3–4 rýchlych párov, potom 2 pomalé. Séria sa mení iba pred ťahom,
  // aby ťah a povolenie jedného páru mali rovnaké tempo (pár je jednotka, ktorú hráč číta).
  function playful(rng, st, kind) {
    if (st.cur == null || (kind === 'pull' && st.left <= 0)) {
      st.cur = st.cur === 'fast' ? 'slow' : 'fast';
      st.left = st.cur === 'fast' ? rng.int(3, 4) : 2;
    }
    var d = st.cur === 'fast' ? jit(rng, 0.25, 0.08) : jit(rng, 0.8, 0.08);
    if (kind === 'slack') st.left--;
    return d;
  }

  // Základné typy. pull/slack(rng, st, kind) vracia základnú dĺžku v sekundách;
  // st = vlastný stav typu (vlny, série, falošné záblesky). fakes = typ vkladá falošné záblesky.
  // name/desc sú SLOVENSKÝ ZDROJ prekladu (TYPES nižšie sa prekladá na mieste: rhythm.<typ>.name/.desc).
  // i18n-source:begin
  var BASIC = {
    fastRegular: { name: 'Rýchly pravidelný', desc: 'Krátke rovnaké fázy.',
      pull: jitFn(0.35, 0.05), slack: jitFn(0.35, 0.05) },
    regular: { name: 'Pravidelný', desc: 'Pokojné, rovnomerné striedanie.',
      pull: jitFn(0.6, 0.05), slack: jitFn(0.6, 0.05) },
    slowStrong: { name: 'Pomalý silný', desc: 'Dlhé ťahy, krátke povolenia.',
      pull: rangeFn(1.1, 1.4), slack: rangeFn(0.4, 0.5) },
    chaotic: { name: 'Chaotický', desc: 'Náhodné dĺžky fáz.',
      pull: rangeFn(0.2, 1.2), slack: rangeFn(0.2, 0.9) },
    explosive: { name: 'Výbušný', desc: 'Dlhé pokojné povolenie, potom prudký krátky ťah.',
      pull: rangeFn(0.35, 0.5), slack: rangeFn(1.4, 2.2) },
    fakePause: { name: 'Falošné pauzy', desc: 'Zelená na chvíľu blikne a hneď sa zmení na červenú.',
      // Ťah po falošnom záblesku je kratší: záblesk ťah len "prerušil", celkový ťah nemá rásť.
      pull: function (rng, st) { return st.afterFake ? rng.range(0.4, 0.7) : rng.range(0.7, 1.0); },
      slack: rangeFn(0.5, 0.7), fakes: true },
    waves: { name: 'Vlny', desc: 'Tempo sa plynule zrýchľuje a spomaľuje.', pull: wave, slack: wave },
    playful: { name: 'Hravý', desc: 'Striedanie rýchlych a pomalých sérií.', pull: playful, slack: playful },
    extremeFast: { name: 'Extrémne rýchly', desc: 'Bleskové fázy kratšie ako štvrť sekundy.',
      pull: rangeFn(0.18, 0.22), slack: rangeFn(0.18, 0.22) },
    fakeChaos: { name: 'Chaos s falošnými pauzami', desc: 'Náhodné dĺžky fáz a zelená, ktorá klame.',
      pull: rangeFn(0.2, 1.2), slack: rangeFn(0.2, 0.9), fakes: true },
    slowHuge: { name: 'Pomalý obrovský', desc: 'Pomalý boj, veľmi dlhé ťahy obrovskou silou.',
      pull: rangeFn(1.6, 2.2), slack: rangeFn(0.45, 0.6) },
  };
  var BASIC_IDS = Object.keys(BASIC);

  // Zmesi pre Strážcu priepasti ("kombinuje všetky rytmy"). Blok = niekoľko párov
  // ťah+povolenie jedného základného typu; kratší blok by sa nedal rozpoznať.
  var COMPOSITE = {
    mixA: { name: 'Zmes: rýchly a silný', desc: 'Striedajú sa bloky rýchleho pravidelného a pomalého silného rytmu.',
      parts: ['fastRegular', 'slowStrong'], pairs: [2, 3] },
    mixB: { name: 'Zmes: falošné pauzy a chaos', desc: 'Striedajú sa falošné pauzy a chaotické fázy.',
      parts: ['fakePause', 'chaotic'], pairs: [2, 3] },
    all: { name: 'Všetky rytmy', desc: 'Každých pár ťahov iný rytmus, postupne všetky.',
      parts: BASIC_IDS, pairs: [2, 2], shuffle: true },
  };
  // i18n-source:end

  var TYPES = {};
  BASIC_IDS.forEach(function (id) { TYPES[id] = { name: BASIC[id].name, desc: BASIC[id].desc, basic: true }; });
  Object.keys(COMPOSITE).forEach(function (id) {
    TYPES[id] = { name: COMPOSITE[id].name, desc: COMPOSITE[id].desc, basic: false, parts: COMPOSITE[id].parts.slice() };
  });
  // Preklad na mieste (docs/I18N.md): rhythm.<typ>.name / .desc. Boj si meno kopíruje pri štarte (f.rhythmName).
  HL.i18n.overlay(TYPES, 'rhythm', ['name', 'desc']);

  function Gen(type, rng, tempo, start, ease) {
    this.type = type;
    this.rng = rng;
    this.tempo = tempo;
    this.ease = ease;
    this.expect = start === 'slack' ? 'slack' : 'pull';
    this.st = {};
    this.comp = COMPOSITE[type] || null;
    this.cur = this.comp ? null : type;
    this.order = [];
    this.bi = -1;
    this.pairsLeft = 0;
    if (this.comp) this.nextBlock();
  }

  Gen.prototype.nextBlock = function () {
    var c = this.comp;
    this.bi++;
    if (c.shuffle) {
      if (this.bi >= this.order.length) {
        this.order = this.rng.shuffle(c.parts.slice());
        this.bi = 0;
        // Na hranici cyklu by sa ten istý typ mohol zopakovať — dva bloky za sebou splynú do jedného.
        if (this.order.length > 1 && this.order[0] === this.cur) {
          var t = this.order[0]; this.order[0] = this.order[1]; this.order[1] = t;
        }
      }
      this.cur = this.order[this.bi];
    } else {
      this.cur = c.parts[this.bi % c.parts.length];
    }
    this.pairsLeft = this.rng.int(c.pairs[0], c.pairs[1]);
  };

  Gen.prototype.next = function () {
    var rng = this.rng, kind = this.expect;
    // Blok sa mení len pred ťahom: blok tak vždy začína celým párom a nový typ je čitateľný.
    if (this.comp && kind === 'pull' && this.pairsLeft <= 0) this.nextBlock();
    var id = this.cur, spec = BASIC[id];
    var st = this.st[id] || (this.st[id] = {});
    var base, fake = false;
    if (kind === 'pull') {
      base = spec.pull(rng, st, 'pull');
      st.afterFake = false;
      this.expect = 'slack';
    } else {
      if (spec.fakes && (st.fakes || 0) < MAX_FAKES_IN_ROW && rng.chance(HL.T.fakeChance)) {
        base = rng.range(FAKE_FLASH[0], FAKE_FLASH[1]);
        fake = true;
        st.fakes = (st.fakes || 0) + 1;
        st.afterFake = true;
      } else {
        base = spec.slack(rng, st, 'slack');
        st.fakes = 0;
        if (this.comp) this.pairsLeft--;
      }
      this.expect = 'pull';
    }
    // ease iba pri skutočnej fáze; pri 1 je súčin bit po bite ten istý ako pred jeho zavedením.
    var dur = Math.max(HL.T.phaseMinSec, fake ? base * HL.T.phaseScale * this.tempo : base * HL.T.phaseScale * this.tempo * this.ease);
    return { kind: kind, dur: dur, fake: fake, src: id };
  };

  function create(type, rng, opts) {
    HL.assert(Object.prototype.hasOwnProperty.call(TYPES, type), 'rhythm.create: neznámy typ rytmu ' + type);
    HL.assert(rng && typeof rng.next === 'function', 'rhythm.create: chýba rng (HL.RNG)');
    opts = opts || {};
    var tempo = opts.tempo == null ? 1 : opts.tempo;
    HL.assert(HL.util.isNum(tempo) && tempo > 0, 'rhythm.create: tempo musí byť kladné číslo');
    HL.assert(opts.start == null || opts.start === 'pull' || opts.start === 'slack', 'rhythm.create: start je pull|slack');
    var ease = opts.ease == null ? 1 : opts.ease;
    HL.assert(HL.util.isNum(ease) && ease > 0, 'rhythm.create: ease musí byť kladné číslo');
    return new Gen(type, rng, tempo, opts.start, ease);
  }

  function preview(type, n, seed) {
    var g = create(type, HL.rngFor(seed || 0, 'rhythmPreview', type));
    var out = [];
    for (var i = 0; i < (n || 12); i++) out.push(g.next());
    return out;
  }

  HL.rhythm = {
    TYPES: TYPES,
    BASIC_IDS: BASIC_IDS.slice(),
    FAKE_FLASH: FAKE_FLASH.slice(),
    create: create,
    preview: preview,
  };
})(globalThis.HL);
