// Generatívna hudba (dizajn 14.2): chiptune/lo-fi, pokojná na hladine, s hĺbkou
// temnejšia a riedka, v Priepasti takmer len dron s občasnými zvonmi.
//
// Prečo generatívna a nie nahraté slučky: hudba musí plynule reagovať na hĺbku
// (každý meter trochu inak) a nesmie sa po desiatich ponoroch omrzieť.
//
// Plánovanie: HL.audio.update(dt) volá M._tick každý krok; noty sa plánujú na
// ctx.currentTime so stálym predstihom (T.musicLookahead), takže tempo nezávisí od
// toho, či prehliadač práve stíha 60 snímok.
//
// Stopy: najviac JEDNA stopa na každý základný režim. Rýchle striedanie set()
// stopu len prelína tam a späť — nikdy nevzniknú dve kópie tej istej slučky.
// Boj ('fight') nie je samostatná stopa: pridá napätý pulz NAD hudbu ponoru.
//
// ŠTÝLY (T.musicStyle): 1 = pokojný lo-fi (predvolený), 2 = ambient bez bicích, 0 = pôvodný chiptune.
// Majiteľ 2026-10-01: chiptune (štvorcová melódia s vibratom, hi-haty na každú osminu, 86 BPM) je
// otravný, chce normálnu pokojnú hudbu. Pokojný štýl hrá elektrické piano a drnkanú strunu
// (audio.js epiano/pluckBuf) s plochou, mäkkou basou a dozvukom; bicie sú jemné a len na hladine.
// Hĺbka sa správa ako predtým (redšie, nižšie, temnejšie, dron a zvony). Chiptune ostáva ako štýl 0
// na porovnanie — jeho kód (chipStep) je nezmenený. Všetky čísla sú ODHAD na posuvníkoch (F2,
// skupina Hudba; tools/music_lab.html): či je to príjemné, rozhodne človek ušami, nie test.
(function (HL) {
  var T = HL.T;
  var M = HL.music = {};

  var d = T.def;
  d('Hudba', 'musicStyle', 1, 0, 2, 1, 'Štýl hudby: 0 = pôvodný chiptune, 1 = pokojný lo-fi, 2 = ambient bez bicích');
  d('Hudba', 'musicBpm', 86, 50, 140, 1, 'Chiptune: tempo v dedine (úderov za minútu)');
  d('Hudba', 'musicSwing', 0.16, 0, 0.4, 0.01, 'Chiptune: swing: oneskorenie párnych šestnástin (podiel kroku)');
  d('Hudba', 'musicXfadeSec', 1.5, 0.1, 6, 0.1, 'Prelínanie pri zmene hudby (s)');
  d('Hudba', 'musicDeepSlow', 0.18, 0, 0.5, 0.01, 'Chiptune: spomalenie tempa v Priepasti (podiel)');
  d('Hudba', 'musicDensity', 1, 0.2, 2, 0.05, 'Chiptune: násobok hustoty melódie');
  d('Hudba', 'musicLeadVol', 0.10, 0, 0.4, 0.01, 'Chiptune: hlasitosť melódie');
  d('Hudba', 'musicBassVol', 0.17, 0, 0.5, 0.01, 'Chiptune: hlasitosť basy');
  d('Hudba', 'musicPadVol', 0.035, 0, 0.2, 0.005, 'Chiptune: hlasitosť plochy (na jeden hlas)');
  d('Hudba', 'musicDroneVol', 0.13, 0, 0.4, 0.01, 'Hlasitosť drónu v hĺbke');
  d('Hudba', 'musicPulseVol', 0.08, 0, 0.3, 0.01, 'Hlasitosť napätého pulzu v boji');
  d('Hudba', 'musicLookahead', 0.3, 0.08, 1, 0.01, 'Plánovanie nôt dopredu (s)');
  d('Hudba', 'musicEndlessRush', 0.12, 0, 0.5, 0.01, 'Nekonečná hlbina: zrýchlenie tempa (podiel)');
  // Pokojný štýl (1 a 2). Hlasitosti sú na jeden tón; spolu ich škáluje calmGain.
  d('Hudba', 'calmBpm', 70, 50, 110, 1, 'Pokojná: tempo v dedine (úderov za minútu)');
  d('Hudba', 'calmSwing', 0.12, 0, 0.4, 0.01, 'Pokojná: swing (oneskorenie párnych šestnástin)');
  d('Hudba', 'calmDeepSlow', 0.2, 0, 0.5, 0.01, 'Pokojná: spomalenie tempa v Priepasti (podiel)');
  d('Hudba', 'calmGain', 1.15, 0, 2, 0.05, 'Pokojná: celková hlasitosť hudby');
  d('Hudba', 'calmKeysVol', 0.1, 0, 0.3, 0.005, 'Pokojná: elektrické piano – hlasitosť (na tón)');
  d('Hudba', 'calmKeysBright', 1.4, 0, 4, 0.05, 'Pokojná: piano – jas úderu (FM index)');
  d('Hudba', 'calmKeysTine', 0.06, 0, 0.5, 0.01, 'Pokojná: piano – zvonivý úder (podiel)');
  d('Hudba', 'calmCutoff', 2600, 300, 9000, 50, 'Pokojná: jas piana (dolná priepusť, Hz)');
  d('Hudba', 'calmComp', 0.3, 0, 1, 0.05, 'Pokojná: druhý úder akordu v takte (lo-fi sprievod)');
  d('Hudba', 'calmStrum', 0.35, 0, 1, 0.05, 'Pokojná: podiel úsekov, kde akordy hrá gitara namiesto piana');
  d('Hudba', 'calmStrumVol', 0.6, 0, 2, 0.05, 'Pokojná: gitara – hlasitosť brnknutia');
  d('Hudba', 'calmStrumBed', 0.9, 0, 1, 0.05, 'Pokojná: tiché piano pod gitarou (vyrovná hlasitosť s klavírnymi úsekmi)');
  d('Hudba', 'calmPluckVol', 0.2, 0, 0.5, 0.01, 'Pokojná: struna (melódia, gitara) – hlasitosť');
  d('Hudba', 'calmPluckSec', 1.6, 0.2, 6, 0.1, 'Pokojná: struna – dĺžka doznievania (s)');
  d('Hudba', 'calmPluckSoft', 0.7, 0, 1, 0.05, 'Pokojná: struna – mäkkosť úderu');
  d('Hudba', 'calmMelody', 1, 0, 2, 0.05, 'Pokojná: hustota melódie (násobok)');
  d('Hudba', 'calmRest', 0.45, 0, 1, 0.05, 'Pokojná: šanca, že melódia vynechá frázu (dýchanie)');
  d('Hudba', 'calmMelodyKeys', 0.3, 0, 1, 0.05, 'Pokojná: podiel fráz melódie na piane namiesto struny');
  d('Hudba', 'calmArpVol', 0.08, 0, 0.3, 0.005, 'Pokojná: harfa (rozložené akordy) – hlasitosť');
  d('Hudba', 'calmArp', 1, 0, 2, 0.05, 'Pokojná: harfa – hustota (násobok)');
  d('Hudba', 'calmPadVol', 0.05, 0, 0.15, 0.002, 'Pokojná: plocha – hlasitosť (na hlas)');
  d('Hudba', 'calmPadCutoff', 1600, 150, 5000, 10, 'Pokojná: plocha – jas (Hz)');
  d('Hudba', 'calmBassVol', 0.07, 0, 0.4, 0.01, 'Pokojná: basa – hlasitosť');
  d('Hudba', 'calmBassBite', 0.5, 0, 1.5, 0.05, 'Pokojná: basa – alikvoty (počuť ju aj v telefóne)');
  d('Hudba', 'calmDrumVol', 0.6, 0, 1.5, 0.05, 'Pokojná: bicie – hlasitosť (0 = bez bicích)');
  d('Hudba', 'calmShaker', 0.6, 0, 1.5, 0.05, 'Pokojná: šuchot namiesto hi-hatu – hlasitosť');
  d('Hudba', 'calmCrackle', 0.5, 0, 2, 0.05, 'Pokojná: praskanie platne v dedine – hlasitosť');
  d('Hudba', 'calmWowCents', 6, 0, 30, 0.5, 'Pokojná: kolísanie pásky (centy)');
  d('Hudba', 'calmWowHz', 0.45, 0.05, 3, 0.05, 'Pokojná: kolísanie pásky – rýchlosť (Hz)');
  d('Hudba', 'calmHumanMs', 12, 0, 40, 1, 'Pokojná: ľudská nepresnosť načasovania (ms)');
  d('Hudba', 'calmVerb', 0.35, 0, 1.5, 0.01, 'Pokojná: dozvuk – množstvo');
  d('Hudba', 'calmPulseTone', 2, 0, 5, 0.1, 'Pokojná: boj – hlasitosť tlmeného tónu na osminy (počuť v telefóne)');

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function fin(v, def) { return (typeof v === 'number' && isFinite(v)) ? v : def; }
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function hold(param, t) {
    if (param.cancelAndHoldAtTime) { param.cancelAndHoldAtTime(t); return; }
    var v = param.value;
    param.cancelScheduledValues(t);
    param.setValueAtTime(v, t);
  }
  function fadeTo(param, v, t, sec) { hold(param, t); param.linearRampToValueAtTime(v, t + sec); }
  // Hodnota z tabuľky pre plynulý index hĺbky (lineárne medzi pásmami).
  function arr(a, i) {
    if (i <= 0) return a[0];
    if (i >= a.length - 1) return a[a.length - 1];
    var k = Math.floor(i);
    return a[k] + (a[k + 1] - a[k]) * (i - k);
  }

  // ------------------------------------------------------------------ harmónia
  var SC = M.SCALES = {
    majPent: [0, 2, 4, 7, 9],
    major: [0, 2, 4, 5, 7, 9, 11],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    minor: [0, 2, 3, 5, 7, 8, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
  };
  // Jas módu: od jasného durového po najtemnejší frygický (pre testy a ladenie).
  M.BRIGHT = { majPent: 4, major: 4, dorian: 3, minor: 2, phrygian: 1 };

  // Pásma používajú tú istú sadu tónov (biele klávesy) — C dur, D dórska, a mol,
  // e frygická. Mení sa len ťažisko, preto prechod medzi pásmami nikdy nezaškrípe
  // ako zmena tóniny, iba "stmavne". chords = stupne v harmonickej stupnici.
  var ZONE = [
    { scale: 'majPent', harm: 'major', root: 60, chords: [0, 5, 3, 4] },     // Plytčina: I vi IV V
    { scale: 'dorian', harm: 'dorian', root: 62, chords: [0, 3, 0, 3] },     // Útesy: i IV
    { scale: 'minor', harm: 'minor', root: 57, chords: [0, 5, 6, 0] },       // Súmrak: i VI VII i
    { scale: 'phrygian', harm: 'phrygian', root: 52, chords: [0, 1, 0, 0] }, // Polnoc: i bII
    { scale: 'phrygian', harm: 'phrygian', root: 52, chords: [0, 0, 1, 0] }, // Priepasť: dron
  ];

  // Hranice pásiem berieme z dát (dizajn 7.1), aby sa hudba zmenila tam, kde hra
  // ukáže nové pásmo. Bez dát (samostatný test zvuku) platia čísla z dokumentu.
  function anchors() {
    var z = HL.data && HL.data.zones;
    if (z && z.length >= 5 && isFinite(z[4].to)) return [z[0].from, z[1].from, z[2].from, z[3].from, z[4].from, z[4].to];
    return [0, 50, 200, 600, 1500, 3000];
  }
  // Jadrové jazero (docs/JAZERO.md): hĺbka jazera sa mapuje na náladu morského pásma, ktorému zodpovedá
  // (zone.diffAs — tá istá väzba ako obtiažnosť boja): Chladiace jazero ≈ Útesy (dórska), Zatopená hala ≈ Súmrak
  // (mol), Šachta ≈ Polnoc (frygická). Hladina jazera tak znie tajomnejšie ako plytčina mora. More sa nemení.
  var location = null;
  M.setLocation = function (loc) { location = loc || null; };
  M.location = function () { return location; };
  function lakeIndex(m) {
    var Z = HL.data && HL.data.lakeZones;
    if (!Z || !Z.length || !HL.world) return 1;
    var a = [], ix = [];
    for (var k = 0; k < Z.length; k++) { a.push(Z[k].from); ix.push(Math.max(0, HL.world.zoneIndex(Z[k].diffAs, 'more'))); }
    a.push(Z[Z.length - 1].to); ix.push(ix[ix.length - 1] + 0.6);
    for (var i = 0; i < a.length - 1; i++) if (m < a[i + 1]) return ix[i] + (m - a[i]) / (a[i + 1] - a[i]) * (ix[i + 1] - ix[i]);
    return ix[ix.length - 1];
  }
  // Plynulý index hĺbky: 0 = hladina, 1 = začiatok Útesov, ... 4 = Priepasť, 5 = dno.
  M.depthIndex = function (m) {
    m = Math.max(0, fin(m, 0));
    if (location && HL.world && HL.world.isLake(location)) return lakeIndex(m);
    var a = anchors();
    for (var i = 0; i < a.length - 1; i++) if (m < a[i + 1]) return i + (m - a[i]) / (a[i + 1] - a[i]);
    return a.length - 1;
  };

  var MODES = M.MODES = ['title', 'village', 'dive', 'fight', 'legend', 'endless'];

  M.STYLES = ['chiptune', 'pokojná lo-fi', 'ambient'];
  M.style = function () { var s = Math.round(fin(T.musicStyle, 1)); return s < 0 ? 0 : s > 2 ? 2 : s; };

  // Čistá funkcia: aká má byť hudba v režime, hĺbke a štýle (predvolene T.musicStyle). Testuje sa v Node.
  M.profile = function (mode, depth, style) {
    style = style == null ? M.style() : style;
    var P = style === 0 ? chipProfile(mode, depth) : calmProfile(mode, depth, style);
    P.style = style;
    P.mode = mode;
    return P;
  };

  // Akordové postupy pokojného štýlu (stupne harmonickej stupnice pásma, ako ZONE.chords). Každých
  // 8 taktov sa vyberie jeden — postup sa neomrzí tak rýchlo ako jediná štvortaktová slučka.
  var CALM_PROGS = [
    [[0, 5, 3, 4], [3, 2, 5, 0], [1, 4, 0, 5], [0, 3, 1, 4]], // Plytčina a dedina (C dur): I vi IV V · IV iii vi I · ii V I vi · I IV ii V
    [[0, 3, 0, 3], [0, 3, 4, 3], [0, 6, 3, 0]],               // Útesy (D dórska): i7 IV7 …
    [[0, 5, 6, 0], [0, 3, 5, 4], [0, 5, 3, 4]],               // Súmrak (a mol): i VI VII i …
    [[0, 1, 0, 0], [0, 1, 0, 6]],                             // Polnoc (e frygická): i bII
    [[0, 0, 1, 0]],                                           // Priepasť: dron
  ];

  function calmProfile(mode, depth, style) {
    var P, z, i, zi;
    if (mode === 'legend') {
      P = {
        scale: 'phrygian', harm: 'phrygian', root: 50, chords: [0, 0, 1, 0], progs: [[0, 0, 1, 0]], zone: 4, depthIdx: 4,
        bpm: T.calmBpm * 0.8, swing: 0, lead: 0, leadOct: 62, keys: 0, arp: 0, strum: 0,
        bass: 0, bassWalk: 0, hats: 0, kick: 0, snare: 0, pad: 0.7, drone: 1, bells: 0.25, restless: 0,
        crackle: 0, verb: 1.3, bright: 0.5, motif: 'legend',
      };
    } else if (mode === 'dive' || mode === 'fight' || mode === 'endless') {
      i = M.depthIndex(depth); zi = Math.min(4, Math.floor(i)); z = ZONE[zi];
      // Pod vodou bez bicích a bez praskania platne: piano, harfa, plocha; s hĺbkou ďalej a tmavšie.
      P = {
        scale: z.scale, harm: z.harm, root: z.root, chords: CALM_PROGS[zi][0], progs: CALM_PROGS[zi], zone: zi, depthIdx: i,
        bpm: T.calmBpm * (0.94 - T.calmDeepSlow * clamp01(i / 4)),
        swing: T.calmSwing * (1 - clamp01(i / 3)),
        lead: arr([0.32, 0.3, 0.24, 0.14, 0.035, 0.02], i),
        leadOct: Math.round(arr([72, 71, 69, 64, 62, 60], i)),
        keys: arr([0.6, 0.5, 0.4, 0.18, 0.06, 0.04], i),
        arp: arr([0.35, 0.35, 0.3, 0.08, 0, 0], i),   // v Polnoci takmer bez harfy (drnknutia zjasňovali tmu)
        strum: 0,   // gitara len na hladine a v dedine; pod vodou piano (brnknutie = 4 ostré nábehy po sebe)
        bass: arr([0.7, 0.6, 0.5, 0.3, 0, 0], i),
        bassWalk: arr([0.2, 0.15, 0.05, 0, 0, 0], i),
        hats: 0, kick: 0, snare: 0,
        pad: arr([0.65, 0.65, 0.7, 0.8, 0.6, 0.5], i),
        drone: arr([0, 0, 0.2, 0.6, 1, 1], i),
        bells: arr([0, 0, 0.05, 0.15, 0.4, 0.3], i),
        restless: 0, crackle: 0,
        verb: arr([0.85, 0.95, 1.05, 1.2, 1.35, 1.4], i),
        bright: arr([1, 0.85, 0.7, 0.45, 0.33, 0.3], i),
        motif: null,
      };
      if (mode === 'endless') {
        // Nepokojná aj v pokojnom štýle: rýchlejšia, menej swingu, tichý šuchot na šestnástiny.
        P.restless = 1;
        P.bpm *= 1 + T.musicEndlessRush;
        P.swing *= 0.4;
        P.hats = Math.max(P.hats, 0.3);
      }
    } else {
      z = ZONE[0];
      P = {
        scale: z.scale, harm: z.harm, root: z.root, chords: CALM_PROGS[0][0], progs: CALM_PROGS[0], zone: 0, depthIdx: 0,
        bpm: T.calmBpm, swing: T.calmSwing, lead: 0.4, leadOct: 72, keys: 0.85, arp: 0.2, strum: T.calmStrum,
        bass: 0.9, bassWalk: 0.25, hats: 0.35, kick: 0.6, snare: 0.5, pad: 0.5, drone: 0, bells: 0, restless: 0,
        crackle: 1, verb: 0.75, bright: 1, motif: null,
      };
      if (mode === 'title') {
        P.bpm = T.calmBpm * 0.92; P.lead = 0.3; P.hats = 0.2; P.kick = 0.3; P.snare = 0.2; P.pad = 0.6; P.bassWalk = 0.1;
      }
    }
    if (style === 2) {
      // Ambient: bez bicích a praskania (šuchot ostáva len v nepokojnej Nekonečnej), viac plochy a harfy, pomalšie.
      P.kick = 0; P.snare = 0; P.crackle = 0;
      if (mode !== 'endless') P.hats = 0;
      if (mode !== 'legend') { P.pad = Math.min(1, P.pad * 1.3 + 0.2); P.arp = Math.min(1, P.arp * 1.4); }
      P.bpm *= 0.9; P.verb *= 1.2;
    }
    P.lead = clamp01(P.lead * T.calmMelody);
    P.arp = clamp01(P.arp * T.calmArp);
    return P;
  }

  // Pôvodný chiptune (štýl 0) — nezmenený.
  function chipProfile(mode, depth) {
    var P, z;
    if (mode === 'legend') {
      P = {
        scale: 'phrygian', harm: 'phrygian', root: 50, chords: [0, 0, 1, 0], zone: 4, depthIdx: 4,
        bpm: T.musicBpm * 0.76, swing: 0, lead: 0, leadOct: 62, leadWave: 'triangle',
        bass: 0, bassWalk: 0, hats: 0, kick: 0, snare: 0, pad: 0.6, drone: 1, bells: 0.25, restless: 0,
        motif: 'legend',
      };
    } else if (mode === 'dive' || mode === 'fight' || mode === 'endless') {
      var i = M.depthIndex(depth), zi = Math.min(4, Math.floor(i));
      z = ZONE[zi];
      P = {
        scale: z.scale, harm: z.harm, root: z.root, chords: z.chords, zone: zi, depthIdx: i,
        bpm: T.musicBpm * (0.97 - T.musicDeepSlow * clamp01(i / 4)),
        swing: T.musicSwing * (1 - clamp01(i / 3)),
        lead: arr([0.5, 0.42, 0.3, 0.16, 0.05, 0.03], i),
        leadOct: Math.round(arr([72, 71, 69, 64, 62, 60], i)),
        leadWave: zi >= 3 ? 'triangle' : 'square',
        bass: arr([0.8, 0.7, 0.55, 0.3, 0, 0], i),
        bassWalk: arr([0.3, 0.2, 0.1, 0, 0, 0], i),
        hats: arr([0.5, 0.35, 0.12, 0, 0, 0], i),
        kick: arr([0.35, 0.25, 0.1, 0, 0, 0], i),
        snare: arr([0.3, 0.15, 0, 0, 0, 0], i),
        pad: arr([0, 0.25, 0.55, 0.8, 0.6, 0.5], i),
        drone: arr([0, 0, 0.2, 0.6, 1, 1], i),
        bells: arr([0, 0, 0.05, 0.15, 0.4, 0.3], i),
        restless: 0, motif: null,
      };
      if (mode === 'endless') {
        // Nepokojná: rýchlejšia, bez uvoľneného swingu, s tikaním aj v hĺbke.
        P.restless = 1;
        P.bpm *= 1 + T.musicEndlessRush;
        P.swing *= 0.4;
        P.hats = Math.max(P.hats, 0.3);
      }
    } else {
      z = ZONE[0];
      P = {
        scale: z.scale, harm: z.harm, root: z.root, chords: z.chords, zone: 0, depthIdx: 0,
        bpm: T.musicBpm, swing: T.musicSwing, lead: 0.55, leadOct: 72, leadWave: 'square',
        bass: 1, bassWalk: 0.5, hats: 0.75, kick: 0.7, snare: 0.6, pad: 0, drone: 0, bells: 0, restless: 0,
        motif: null,
      };
      if (mode === 'title') {
        P.bpm = T.musicBpm * 0.9; P.lead = 0.38; P.hats = 0.35; P.kick = 0.3; P.snare = 0.2; P.pad = 0.5; P.bassWalk = 0.2;
      }
    }
    P.lead = clamp01(P.lead * T.musicDensity);
    return P;
  }

  // ------------------------------------------------------------------ melódia
  function degToMidi(pr, deg) {
    var mel = SC[pr.scale], n = mel.length;
    var base = pr.root + 12 * Math.round((pr.leadOct - pr.root) / 12);
    var oct = Math.floor(deg / n);
    return base + mel[deg - oct * n] + 12 * oct;
  }
  function harmMidi(pr, deg, around) {
    var h = SC[pr.harm], n = h.length;
    var oct = Math.floor(deg / n);
    var m = pr.root + h[deg - oct * n] + 12 * oct;
    while (m < around - 6) m += 12;
    while (m > around + 6) m -= 12;
    return m;
  }

  // Motív = 2 takty (32 šestnástin). Krokovanie po stupňoch s prevahou malých krokov
  // a ťažké doby hustejšie — znie to ako melódia, nie ako náhodné tóny.
  // maxLen: najdlhšia nota v šestnástinách (pokojný štýl dlhšie; bez neho pôvodné 4 / nepokojná 2).
  function genMotif(r, pr, maxLen) {
    var n = SC[pr.scale].length, out = new Array(32), deg = r.int(0, 2), i;
    var moves = [-2, -1, -1, 0, 1, 1, 2];
    for (i = 0; i < 32; i += 2) {
      var strong = i % 8 === 0, mid = i % 4 === 0;
      var p = pr.lead * (strong ? 1.5 : mid ? 1.0 : 0.6);
      if (r.next() >= p) continue;
      deg = Math.max(-2, Math.min(n + 3, deg + moves[r.int(0, moves.length - 1)]));
      var at = i;
      if (pr.restless && !strong && r.next() < 0.35) at = i + 1;   // synkopa
      out[at] = { deg: deg, len: 2 };
    }
    // Dĺžka noty = po ďalšiu notu (najviac 4 kroky, nepokojná 2).
    var cap = maxLen || (pr.restless ? 2 : 4), last = -1;
    for (i = 0; i < 32; i++) {
      if (!out[i]) continue;
      if (last >= 0) out[last].len = Math.min(cap, i - last);
      last = i;
    }
    if (last >= 0) { out[last].len = Math.min(cap, 32 - last); out[last].deg = Math.round(out[last].deg / n) * n; }
    out.dens = pr.lead;
    return out;
  }

  // ------------------------------------------------------------------ prehrávač
  function createPlayer(E, opts) {
    opts = opts || {};
    var P = { engine: E, tracks: [], mode: null, base: null, depth: 0, seed: opts.seed || 0x3a11, made: 0 };

    function find(base) {
      for (var i = 0; i < P.tracks.length; i++) if (P.tracks[i].base === base) return P.tracks[i];
      return null;
    }
    function newTrack(base, now) {
      var ctx = E.ctx;
      P.made++;
      var tr = {
        base: base, id: P.made, state: 'new', fadeEnd: 0, pulse: false, pulseUntil: -1,
        step: 0, grid: now + 0.05, skipped: 0,
        rng: HL.rngFor(P.seed, base, P.made),
        motif: null, motifA: null, motifB: null,
        stats: { lead: 0, leadMidi: 0, bass: 0, hats: 0, kick: 0, snare: 0, pad: 0, drone: 0, bells: 0, pulse: 0, motif: 0, steps: 0, keys: 0, strum: 0, arp: 0 },
        gain: ctx.createGain(), pulseGain: ctx.createGain(),
        // wet = vstup stopy do spoločného dozvuku; prelína sa SPOLU s gain, inak by dozvuk
        // odchádzajúcej stopy znel ďalej naplno. calm/b/crackle vzniknú až v pokojnom štýle.
        wet: ctx.createGain(), calm: null, b: null, crackle: null,
      };
      tr.gain.gain.value = 0;
      tr.gain.connect(E.bus.music);
      tr.pulseGain.gain.value = 0;
      tr.pulseGain.connect(tr.gain);
      tr.wet.gain.value = 0;
      if (E.verb) tr.wet.connect(E.verb.input);
      return tr;
    }
    P._newTrack = function (base, now) {
      var tr = newTrack(base, now != null ? now : E.ctx.currentTime);
      P.tracks.push(tr);
      return tr;
    };

    P.set = function (mode, o) {
      o = o || {};
      if (mode === undefined) mode = null;
      if (mode !== null && MODES.indexOf(mode) < 0) return false;
      if (mode === P.mode && !o.force) return true;
      var now = o.at != null ? o.at : E.ctx.currentTime;
      var fade = o.instant ? 0.01 : T.musicXfadeSec;
      var base = mode;
      if (mode === 'fight') base = (P.base === 'dive' || P.base === 'endless' || P.base === 'legend') ? P.base : 'dive';
      P.mode = mode;
      P.base = base;
      for (var i = 0; i < P.tracks.length; i++) {
        var tr = P.tracks[i];
        if (tr.base === base || tr.state === 'out') continue;
        fadeTo(tr.gain.gain, 0, now, fade);
        fadeTo(tr.wet.gain, 0, now, fade);
        tr.state = 'out';
        tr.fadeEnd = now + fade;
      }
      if (base) {
        var cur = find(base);
        if (!cur) { cur = newTrack(base, now); P.tracks.push(cur); }
        if (cur.state !== 'in') { fadeTo(cur.gain.gain, 1, now, fade); fadeTo(cur.wet.gain, 1, now, fade); cur.state = 'in'; }
        var wantPulse = mode === 'fight';
        if (cur.pulse !== wantPulse) {
          cur.pulse = wantPulse;
          fadeTo(cur.pulseGain.gain, wantPulse ? 1 : 0, now, 0.6);
          if (!wantPulse) cur.pulseUntil = now + 0.7;
        }
      }
      return true;
    };

    P.setDepth = function (m) { P.depth = Math.max(0, fin(m, P.depth)); };

    P.tick = function (now) {
      now = now != null ? now : E.ctx.currentTime;
      var horizon = now + T.musicLookahead;
      for (var i = P.tracks.length - 1; i >= 0; i--) {
        var tr = P.tracks[i];
        if (tr.state === 'out' && now >= tr.fadeEnd) {
          // Dozneli: odpojiť. Noty naplánované za koncom prelínania by aj tak mlčali.
          // Slučka praskania beží donekonečna — bez stop() by tichá pálila výkon aj po odpojení.
          try { tr.gain.disconnect(); } catch (e) { /* už odpojené */ }
          try { tr.wet.disconnect(); } catch (e) { /* už odpojené */ }
          if (tr.crackle) { try { tr.crackle.src.stop(); } catch (e) { /* už stojí */ } tr.crackle = null; }
          P.tracks.splice(i, 1);
          continue;
        }
        // Skrytá karta / zásek: zmeškané noty sa NEdohrávajú naraz (znelo by to ako výbuch).
        if (tr.grid < now - 0.2) { tr.skipped++; tr.grid = now + 0.02; }
        var guard = 0;
        while (tr.grid < horizon && guard++ < 64) {
          var pr = M.profile(tr.base, P.depth);
          var sd = 60 / pr.bpm / 4;
          // Swing: chiptune posúva párne šestnástiny. Pokojný štýl hrá mimo Nekonečnej len na osminách, takže
          // posúva osminu na „a" (krok 2 zo 4) o dvojnásobok — inak by posuvník calmSwing nerobil nič.
          var sw = pr.style === 0 ? (tr.step % 2 ? pr.swing * sd : 0) : (tr.step % 4 === 2 ? 2 * pr.swing * sd : tr.step % 2 ? pr.swing * sd : 0);
          var t = tr.grid + sw;
          step(tr, pr, tr.step, Math.max(t, now), sd);
          tr.step++;
          tr.grid += sd;
        }
      }
    };

    P.info = function () {
      return P.tracks.map(function (tr) {
        return { base: tr.base, id: tr.id, state: tr.state, pulse: tr.pulse, skipped: tr.skipped, stats: Object.assign({}, tr.stats) };
      });
    };

    // --------------------------------------------------------------- jeden krok (1/16)
    // Štýl sa číta každý krok (profil), takže prepnutie posuvníkom v F2 platí od ďalšej noty.
    function step(tr, pr, s, t, sd) {
      if (pr.style === 0) chipStep(tr, pr, s, t, sd);
      else calmStep(tr, pr, s, t, sd);
    }

    // Pôvodný chiptune (štýl 0) — nezmenený, okrem stlmenia praskania po prepnutí zo štýlu 1.
    function chipStep(tr, pr, s, t, sd) {
      var r = tr.rng, st = s % 16, bar = Math.floor(s / 16);
      var dest = tr.gain;
      var chordDeg = pr.chords[bar % pr.chords.length];
      tr.stats.steps++;

      if (st === 0 && tr.crackle) tr.crackle.gain.gain.setTargetAtTime(0, t, 0.3);
      if (st === 0) onBar(tr, pr, bar, t, sd, chordDeg);

      if (pr.motif === 'legend') legendStep(tr, pr, s, t, sd);
      else melody(tr, pr, s, t, sd, chordDeg);

      // Basa: základ akordu na 1. a 3. dobu, prechodové tóny podľa hustoty.
      var bassRoot = harmMidi(pr, chordDeg, 40);
      if ((st === 0 || st === 8) && r.next() < pr.bass) {
        note(tr, 'bass', dest, t, { type: 'triangle', f: mtof(bassRoot), a: 0.006, sus: true, hold: sd * (pr.zone >= 2 ? 6 : 4), r: 0.1, v: T.musicBassVol });
      } else if ((st === 6 || st === 14) && r.next() < pr.bassWalk) {
        note(tr, 'bass', dest, t, { type: 'triangle', f: mtof(bassRoot + (r.next() < 0.5 ? 7 : 12)), a: 0.006, sus: true, hold: sd * 1.4, r: 0.06, v: T.musicBassVol * 0.8 });
      } else if (pr.restless && (st === 3 || st === 11) && r.next() < 0.35) {
        note(tr, 'bass', dest, t, { type: 'triangle', f: mtof(bassRoot), a: 0.004, sus: true, hold: sd * 0.8, r: 0.05, v: T.musicBassVol * 0.7 });
      }

      // Bicie: mäkký lo-fi kopák, tichý virbel na 2 a 4, hi-haty na osminy.
      if ((st === 0 && r.next() < pr.kick) || (st === 8 && r.next() < pr.kick * 0.6) || (pr.restless && st === 10 && r.next() < 0.4)) {
        note(tr, 'kick', dest, t, { type: 'sine', f: 110, f2: 45, glide: 0.08, a: 0.003, d: 0.14, v: 0.2 });
      }
      if ((st === 4 || st === 12) && r.next() < pr.snare) {
        tr.stats.snare++;
        E.noise(dest, t, { d: 0.09, v: 0.06, filter: { type: 'bandpass', f: 1800, q: 0.7 } });
        E.tone(dest, t, { type: 'triangle', f: 190, a: 0.002, d: 0.05, v: 0.05 });
      }
      var hatP = st % 2 === 0 ? pr.hats * (st % 4 === 2 ? 1 : 0.6) : (pr.restless ? pr.hats * 0.4 : 0);
      if (hatP > 0 && r.next() < hatP) {
        tr.stats.hats++;
        E.noise(dest, t, { d: 0.03, v: st % 4 === 2 ? 0.045 : 0.03, filter: { type: 'highpass', f: 7000 } });
      }

      // Napätý pulz boja: osminové staccato na základe akordu + tikot šestnástin.
      if (tr.pulse || t < tr.pulseUntil) {
        if (st % 2 === 0) {
          tr.stats.pulse++;
          E.tone(tr.pulseGain, t, { type: 'sawtooth', f: mtof(harmMidi(pr, chordDeg, 47)), a: 0.003, d: 0.11, v: T.musicPulseVol * (st % 4 === 0 ? 1 : 0.7), filter: { f: 1600, f2: 300, glide: 0.1, q: 4 } });
        }
        E.noise(tr.pulseGain, t, { d: 0.015, v: 0.02, filter: { type: 'highpass', f: 9000 } });
      }
    }

    function note(tr, kind, dest, t, o) {
      tr.stats[kind]++;
      return E.tone(dest, t, o);
    }

    function onBar(tr, pr, bar, t, sd, chordDeg) {
      var barSec = 16 * sd, r = tr.rng, k;
      if (pr.pad > 0.02) {
        // Plocha: trojzvuk akordu v strednej polohe, dlhý nábeh (neruší melódiu).
        for (k = 0; k < 3; k++) {
          var pm = harmMidi(pr, chordDeg + 2 * k, 60);
          note(tr, 'pad', tr.gain, t, { type: 'triangle', f: mtof(pm), detune: k === 1 ? 6 : -4, a: Math.min(0.8, barSec * 0.3), sus: true, hold: barSec * 0.75, r: barSec * 0.35, v: T.musicPadVol * pr.pad, filter: { f: 1200 } });
        }
      }
      if (pr.drone > 0.02 && bar % 2 === 0) {
        // Dron: prázdna kvinta na základe, dva takty s prekrytím (bez diery medzi nimi).
        var root = pr.root - 12, len = 2 * barSec;
        note(tr, 'drone', tr.gain, t, { type: 'sine', f: mtof(root), a: 1.2, sus: true, hold: Math.max(0.1, len - 1.0), r: 1.5, v: T.musicDroneVol * pr.drone });
        E.tone(tr.gain, t, { type: 'triangle', f: mtof(root + 12), a: 1.5, sus: true, hold: Math.max(0.1, len - 1.2), r: 1.5, v: T.musicDroneVol * 0.35 * pr.drone, filter: { f: 500 }, vib: { rate: 0.3, cents: 8 } });
        E.tone(tr.gain, t, { type: 'sine', f: mtof(root + 19), a: 2, sus: true, hold: Math.max(0.1, len - 1.5), r: 1.5, v: T.musicDroneVol * 0.15 * pr.drone });
      }
      if (pr.bells > 0) {
        for (k = 0; k < 2; k++) {
          if (r.next() >= pr.bells) continue;
          var bm = degToMidi(pr, r.int(0, SC[pr.scale].length)) + 12;
          var bt = t + k * 8 * sd;
          tr.stats.bells++;
          // Zvon: sínus + neharmonický alikvot, veľa ozveny — v tme znie ďaleko.
          E.tone(tr.gain, bt, { type: 'sine', f: mtof(bm), a: 0.002, d: 1.6, v: 0.07, send: 0.5, bus: 'music' });
          E.tone(tr.gain, bt, { type: 'sine', f: mtof(bm) * 2.76, a: 0.002, d: 0.5, v: 0.018 });
        }
      }
    }

    function melody(tr, pr, s, t, sd, chordDeg) {
      var ps = s % 32, r = tr.rng;
      if (ps === 0) {
        // Forma AA'BA: opakovanie robí z náhody melódiu, ktorú si ucho zapamätá.
        var form = Math.floor(s / 32) % 4;
        if (form === 0 || !tr.motifA) tr.motifA = genMotif(r, pr);
        if (form === 2 || !tr.motifB) tr.motifB = genMotif(r, pr);
        if (form === 1) {
          tr.motif = tr.motifA.slice();
          tr.motif.dens = tr.motifA.dens;
          var tail = genMotif(r, pr);
          for (var i = 24; i < 32; i++) tr.motif[i] = tail[i];
        } else tr.motif = form === 2 ? tr.motifB : tr.motifA;
      }
      var nt = tr.motif && tr.motif[ps];
      if (!nt) return;
      // Hĺbka rastie aj uprostred frázy: noty navyše oproti aktuálnej hustote vypadnú.
      if (pr.lead < tr.motif.dens && r.next() > pr.lead / tr.motif.dens) return;
      var m = degToMidi(pr, nt.deg);
      if (ps % 8 === 0) {
        // Na ťažkej dobe sa melódia prichytí k najbližšiemu tónu akordu.
        var best = m, bd = 99;
        for (var k = 0; k < 3; k++) {
          var c = harmMidi(pr, chordDeg + 2 * k, m);
          if (Math.abs(c - m) < bd) { bd = Math.abs(c - m); best = c; }
        }
        if (bd <= 2) m = best;
      }
      tr.stats.leadMidi += m;
      note(tr, 'lead', tr.gain, t, {
        type: pr.leadWave, f: mtof(m), a: 0.006, sus: true, hold: Math.max(0.03, nt.len * sd * 0.8), r: 0.07,
        v: T.musicLeadVol * (pr.leadWave === 'triangle' ? 1.4 : 1), filter: { f: pr.zone >= 2 ? 1800 : 2800, q: 0.7 },
        vib: { rate: 5.5, cents: 9, delay: 0.12 }, send: 0.12, bus: 'music',
      });
    }

    // Legenda: vlastný zlovestný motív (malá sekunda a tritón), údery tympanu na 1. dobu.
    var LEG = [[[0, 0, 8], [8, 1, 8], [16, 0, 6], [24, 6, 8]], [[0, 0, 8], [8, 1, 8], [16, 3, 6], [24, 1, 8]]];
    function legendStep(tr, pr, s, t, sd) {
      var ps = s % 32, ph = LEG[Math.floor(s / 32) % 2];
      for (var i = 0; i < ph.length; i++) {
        if (ph[i][0] !== ps) continue;
        var m = pr.root - 12 + ph[i][1];
        tr.stats.motif++;
        E.tone(tr.gain, t, { type: 'sawtooth', f: mtof(m), a: 0.03, sus: true, hold: ph[i][2] * sd * 0.85, r: 0.2, v: 0.12, filter: { f: 650, q: 3 } });
        E.tone(tr.gain, t, { type: 'square', f: mtof(m + 12), a: 0.05, sus: true, hold: ph[i][2] * sd * 0.7, r: 0.2, v: 0.035, filter: { f: 1200 } });
      }
      if (s % 16 === 0) {
        tr.stats.kick++;
        E.tone(tr.gain, t, { type: 'sine', f: 98, f2: 49, glide: 0.2, a: 0.003, d: 0.5, v: 0.24 });
        E.noise(tr.gain, t, { d: 0.1, v: 0.05, filter: { f: 300 } });
      }
    }

    // ============================================================ pokojný štýl (1 a 2)
    // Každá vrstva má VLASTNÝ prúd náhody (odvodený zo semena stopy a mena vrstvy). Pri jednom spoločnom
    // prúde zmenil posuvník jednej vrstvy noty všetkých ostatných: calmDrumVol 0 a calmStrumBed 0 prepísali
    // melódiu (nezávislá kontrola 2026-10-01). Teraz posuvník vrstvy mení len jej vlastné noty.
    var LAYERS = ['harm', 'keys', 'guitar', 'bed', 'comp', 'mel', 'arp', 'bass', 'drum', 'bell', 'wow'];
    function calmState(tr) {
      if (!tr.calm) {
        var R = {};
        for (var i = 0; i < LAYERS.length; i++) R[LAYERS[i]] = HL.rngFor(P.seed, tr.base, tr.id, 'calm', LAYERS[i]);
        tr.calm = { prog: null, zone: -1, strum: false, deg: 0, voic: null, center: 62, rest: false, melKeys: false, arpOn: false, rng: R, wowPh: R.wow.next() * 6.2832 };
      }
      return tr.calm;
    }

    // Zbernice stopy: piano a plocha cez dolnú priepusť (jas), basa cez vlastnú, struny a bicie
    // priamo. Každá posiela časť do dozvuku cez tr.wet (prelína sa so stopou). Melodické nástroje (piano,
    // plocha, struna, basa) majú na tón len zdroj + zosilnenie — filter je spoločný na zbernici, žiadny LFO
    // (výkon v telefóne, žiadne visiace väzby). Vlastný filter na tón majú len bicie, dron, pulz boja a tympan.
    function calmBuses(tr) {
      if (tr.b) return tr.b;
      var ctx = E.ctx;
      var mk = function (lpHz, send) {
        var g = ctx.createGain(), node = g, lp = null, s = null;
        if (lpHz) { lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = lpHz; lp.Q.value = 0.5; g.connect(lp); node = lp; }
        node.connect(tr.gain);
        if (send) { s = ctx.createGain(); s.gain.value = 0; node.connect(s); s.connect(tr.wet); }
        return { input: g, lp: lp, send: s };
      };
      tr.b = { keys: mk(2600, true), pad: mk(900, true), pluck: mk(0, true), low: mk(650, false), drum: mk(0, true), fx: mk(0, true) };
      // Dozvuk až teraz (prvá pokojná stopa, v slučke hry — nie v prvom ťuknutí).
      if (E._verbSync) { try { E._verbSync(true); } catch (e) { E.verb = null; } }
      return tr.b;
    }

    // Hodnoty zberníc podľa posuvníkov a hĺbky. Pri vzniku zberníc HNEĎ (inak by prvú sekundu
    // znela predvolená hlasitosť — kontrola „calmGain 0 = ticho" to odhalila), potom raz za takt plynulo.
    function busValues(pr) {
      var g = Math.max(0, fin(T.calmGain, 1.15)), vb = Math.max(0, fin(T.calmVerb, 0.35)) * fin(pr.verb, 1), br = fin(pr.bright, 1);
      return {
        g: g,
        keysLp: clamp(fin(T.calmCutoff, 2600) * br, 120, 16000), padLp: clamp(fin(T.calmPadCutoff, 1600) * br, 80, 12000),
        keysSend: vb * 0.9, padSend: vb * 1.1, pluckSend: vb, drumSend: vb * 0.25, fxSend: vb * 1.4,
        crackle: Math.max(0, fin(T.calmCrackle, 0.5)) * fin(pr.crackle, 0) * g * 0.025,
      };
    }
    function syncBuses(tr, pr, t) {
      var fresh = !tr.b, B = calmBuses(tr), V = busValues(pr);
      var set = fresh
        ? function (param, v) { param.value = Math.max(0, fin(v, 0)); }
        : function (param, v) { param.setTargetAtTime(Math.max(0, fin(v, 0)), t, 0.25); };
      for (var k in B) set(B[k].input.gain, V.g);
      set(B.keys.lp.frequency, V.keysLp);
      set(B.pad.lp.frequency, V.padLp);
      set(B.keys.send.gain, V.keysSend);
      set(B.pad.send.gain, V.padSend);
      set(B.pluck.send.gain, V.pluckSend);
      set(B.drum.send.gain, V.drumSend);
      set(B.fx.send.gain, V.fxSend);
      if (V.crackle > 0 && !tr.crackle) tr.crackle = E.loop(tr.gain, t, E.crackleBuf(), V.crackle);
      else if (tr.crackle) set(tr.crackle.gain.gain, V.crackle);
    }

    // Kolísanie pásky: ladenie tónu podľa času (dve pomalé vlny). Počíta sa pre začiatok a koniec
    // tónu a medzi nimi sa ladenie posúva rampou — bez LFO uzla pripojeného ku každej note.
    function wow(tr, t) {
      var c = Math.max(0, fin(T.calmWowCents, 6)), hz = Math.max(0.01, fin(T.calmWowHz, 0.45));
      return c * (0.8 * Math.sin(6.2832 * hz * t + tr.calm.wowPh) + 0.4 * Math.sin(6.2832 * 0.13 * t + 1.7));
    }
    // Ľudská nepresnosť načasovania (nikdy nie do minulosti). r = prúd náhody vrstvy, ktorá hrá.
    function human(r, t, amt) {
      var ms = Math.max(0, fin(T.calmHumanMs, 12)) * (amt == null ? 1 : amt);
      return Math.max(E.ctx.currentTime, t + (r.next() * 2 - 1) * ms / 1000);
    }

    // Akord bez základu (ten hrá basa): 3., 5., 7. a 9. stupeň, alebo 7-akord so základom.
    // Všetky tóny okolo jedného stredu → hlasy sa medzi akordmi hýbu len o kúsok.
    function voicing(pr, deg, C, r) {
      var steps = r.next() < 0.5 ? [2, 4, 6, 8] : [0, 2, 4, 6], out = [];
      for (var k = 0; k < steps.length; k++) {
        var m = harmMidi(pr, deg + steps[k], C.center);
        if (out.indexOf(m) < 0) out.push(m);
      }
      return out.sort(function (a, b) { return a - b; });
    }

    // Akord na elektrickom piane. r = prúd náhody tej úlohy (hlavný akord, tiché piano pod gitarou, druhý úder).
    function keysChord(tr, notes, t, hold, vel, r) {
      var spread = 0.01 + r.next() * 0.02, w0 = wow(tr, t), w1 = wow(tr, t + hold);
      tr.stats.keys++;
      for (var k = 0; k < notes.length; k++) {
        E.epiano(tr.b.keys.input, human(r, t + k * spread, 0.5), {
          f: mtof(notes[k]), v: T.calmKeysVol * vel * (0.85 + 0.3 * r.next()), hold: hold, r: 0.7,
          index: T.calmKeysBright * (0.7 + 0.5 * vel), tine: T.calmKeysTine, detune: w0, detune2: w1,
        });
      }
    }
    // Gitara: tóny akordu brnknuté rýchlo po sebe (nahor, alebo nadol pri slabom druhom údere).
    function strumChord(tr, notes, t, vel, down, r) {
      var gap = 0.016 + r.next() * 0.012, w = wow(tr, t), seq = notes.slice();
      if (down) seq.reverse();
      tr.stats.strum++;
      for (var k = 0; k < seq.length; k++) {
        E.sample(tr.b.pluck.input, human(r, t + k * gap, 0.3), E.pluckBuf(seq[k]), { v: T.calmPluckVol * fin(T.calmStrumVol, 0.6) * vel * (1 - 0.06 * k), a: 0.004, detune: w });
      }
    }

    function calmBar(tr, pr, bar, t, sd) {
      var C = tr.calm, R = C.rng, r = R.harm, barSec = 16 * sd, k;
      syncBuses(tr, pr, t);
      if (!C.prog || bar % 8 === 0 || C.zone !== pr.zone) {
        C.prog = pr.progs[r.int(0, pr.progs.length - 1)];
        C.zone = pr.zone;
        C.strum = r.next() < fin(pr.strum, 0.35);
      }
      C.deg = C.prog[bar % C.prog.length];
      C.center = pr.zone >= 2 ? 58 : 62;
      C.voic = voicing(pr, C.deg, C, r);
      // Šanca akordu v takte rastie s pr.keys: v dedine skoro každý takt, v Priepasti zriedka.
      if (pr.keys > 0.02 && r.next() < Math.min(1, pr.keys * 1.25)) {
        var vel = 0.6 + 0.4 * pr.keys;
        if (C.strum) {
          // Gitara doznieva rýchlo, piano drží celý takt: bez tichého piana pod ňou bol gitarový úsek o 3–5 dB
          // tichší a pri zmene úseku hudba poskočila (nezávislá kontrola 2026-10-01).
          strumChord(tr, C.voic, t, vel, false, R.guitar);
          var bed = Math.max(0, fin(T.calmStrumBed, 0.9));
          if (bed > 0) keysChord(tr, C.voic, t, barSec * 0.8, vel * bed, R.bed);
        } else keysChord(tr, C.voic, t, barSec * 0.8, vel, R.keys);
      }
      // Plocha: základ, terc a septima okolo C4 (nie nižšie — telefón pod ~250 Hz nehrá) cez tmavú priepusť.
      // Jeden oscilátor na tón, tóny navzájom rozladené (−6/0/+6 centov), hlasitosť ×1,4 = energia dvoch
      // (výkon). Od Polnoci trojuholník namiesto pílky: pílka mala v hĺbke viac alikvotov a pokojná vyšla
      // jasnejšia než chiptune (ten tam má trojuholníkovú plochu) — kontrola 2026-10-01, 4 semená.
      var pv = T.calmPadVol * pr.pad;
      if (pv > 0.0005) {
        var pt = [0, 2, 6], a = Math.min(2, barSec * 0.45), w0 = wow(tr, t), w1 = wow(tr, t + barSec * 1.4);
        var padWave = pr.zone >= 3 ? 'triangle' : 'sawtooth';
        for (k = 0; k < 3; k++) {
          var f = mtof(harmMidi(pr, C.deg + pt[k], 60)), dt = (k - 1) * 6;
          tr.stats.pad++;
          E.tone(tr.b.pad.input, t, { type: padWave, f: f, detune: w0 + dt, detune2: w1 + dt, a: a, sus: true, hold: barSec * 0.7, r: barSec * 0.7, v: pv * 1.4 });
        }
      }
      if (pr.drone > 0.02 && bar % 2 === 0) {
        // Dron ako v chiptune (prázdna kvinta na základe), ale s dozvukom.
        var root = pr.root - 12, len = 2 * barSec, fx = tr.b.fx.input;
        tr.stats.drone++;
        E.tone(fx, t, { type: 'sine', f: mtof(root), a: 1.2, sus: true, hold: Math.max(0.1, len - 1.0), r: 1.5, v: T.musicDroneVol * pr.drone });
        E.tone(fx, t, { type: 'triangle', f: mtof(root + 12), a: 1.5, sus: true, hold: Math.max(0.1, len - 1.2), r: 1.5, v: T.musicDroneVol * 0.3 * pr.drone, filter: { f: 500 } });
        E.tone(fx, t, { type: 'sine', f: mtof(root + 19), a: 2, sus: true, hold: Math.max(0.1, len - 1.5), r: 1.5, v: T.musicDroneVol * 0.12 * pr.drone });
      }
      if (pr.bells > 0) {
        var rb = R.bell;
        for (k = 0; k < 2; k++) {
          if (rb.next() >= pr.bells) continue;
          var bm = degToMidi(pr, rb.int(0, SC[pr.scale].length)) + 12, bt = t + k * 8 * sd;
          tr.stats.bells++;
          E.tone(tr.b.fx.input, bt, { type: 'sine', f: mtof(bm), a: 0.003, d: 2.2, v: 0.06 });
          E.tone(tr.b.fx.input, bt, { type: 'sine', f: mtof(bm) * 2.76, a: 0.002, d: 0.6, v: 0.012 });
        }
      }
    }

    function calmMelody(tr, pr, s, t, sd) {
      var ps = s % 32, C = tr.calm, r = C.rng.mel, i;
      if (ps === 0) {
        // Forma AA'BA ako v chiptune, ale noty dlhšie a každá druhá fráza smie vynechať (dýchanie).
        var form = Math.floor(s / 32) % 4, cap = pr.restless ? 3 : 6;
        if (form === 0 || !tr.motifA) tr.motifA = genMotif(r, pr, cap);
        if (form === 2 || !tr.motifB) tr.motifB = genMotif(r, pr, cap);
        if (form === 1) {
          tr.motif = tr.motifA.slice();
          tr.motif.dens = tr.motifA.dens;
          var tail = genMotif(r, pr, cap);
          for (i = 24; i < 32; i++) tr.motif[i] = tail[i];
        } else tr.motif = form === 2 ? tr.motifB : tr.motifA;
        C.rest = (form === 1 || form === 3) && r.next() < fin(T.calmRest, 0.45);
        C.melKeys = r.next() < fin(T.calmMelodyKeys, 0.3);
      }
      if (C.rest || !(pr.lead > 0)) return;
      var nt = tr.motif && tr.motif[ps];
      if (!nt) return;
      if (pr.lead < tr.motif.dens && r.next() > pr.lead / tr.motif.dens) return;
      var m = degToMidi(pr, nt.deg);
      if (ps % 8 === 0) {
        var best = m, bd = 99;
        for (var k = 0; k < 3; k++) {
          var c = harmMidi(pr, C.deg + 2 * k, m);
          if (Math.abs(c - m) < bd) { bd = Math.abs(c - m); best = c; }
        }
        if (bd <= 2) m = best;
      }
      tr.stats.lead++;
      tr.stats.leadMidi += m;
      var vel = (ps % 8 === 0 ? 1 : ps % 4 === 0 ? 0.85 : 0.7) * (0.8 + 0.4 * r.next());
      var tt = human(r, t), len = nt.len * sd;
      if (C.melKeys) {
        E.epiano(tr.b.keys.input, tt, { f: mtof(m), v: T.calmKeysVol * 1.5 * vel, hold: len * 0.9, r: 0.6, index: T.calmKeysBright * 0.9, tine: T.calmKeysTine * 1.2, detune: wow(tr, tt), detune2: wow(tr, tt + len) });
      } else {
        E.sample(tr.b.pluck.input, tt, E.pluckBuf(m), { v: T.calmPluckVol * vel, a: 0.004, detune: wow(tr, tt) });
      }
    }

    // Harfa: tóny akordu hore a dole, oktávu nad akordom; každé 4 takty sa rozhodne, či hrá. Hrá na
    // štvrťové noty, osminu pridá len občas — osminová harfa dala pod vodou viac ostrých nábehov ako chiptune.
    function calmArp(tr, pr, s, t) {
      var st = s % 16, C = tr.calm, r = C.rng.arp;
      if (s % 64 === 0) C.arpOn = r.next() < pr.arp;
      if (!C.arpOn || !(pr.arp > 0) || st % 2 || !C.voic || !C.voic.length) return;
      if (st % 4 === 2 ? r.next() > 0.3 * pr.arp : r.next() > 0.55 + 0.35 * pr.arp) return;
      var n = C.voic.length, cyc = Math.max(1, n * 2 - 2), idx = (st / 2) % cyc;
      var m = C.voic[idx < n ? idx : cyc - idx] + 12;
      tr.stats.arp++;
      E.sample(tr.b.pluck.input, human(r, t, 0.5), E.pluckBuf(m), { v: T.calmArpVol * (0.7 + 0.5 * r.next()) * (st % 8 === 0 ? 1.1 : 0.85), a: 0.005, detune: wow(tr, t) });
    }

    function calmBass(tr, pr, s, t, sd) {
      if (!(pr.bass > 0.01)) return;
      var st = s % 16, C = tr.calm, r = C.rng.bass, barSec = 16 * sd, root = harmMidi(pr, C.deg, 40), m = null, hold = 0;
      if (st === 0 && r.next() < pr.bass) { m = root; hold = pr.style === 2 ? barSec * 0.9 : barSec * 0.45; }
      else if (st === 10 && r.next() < pr.bassWalk) { m = root + (r.next() < 0.6 ? 7 : 12); hold = 4 * sd; }
      else if (st === 14 && r.next() < pr.bassWalk * 0.4) { m = root + (r.next() < 0.5 ? -2 : 2); hold = 1.5 * sd; }
      if (m === null) return;
      tr.stats.bass++;
      // Sínus = teplý základ (slúchadlá); tichá pílka cez dolnú priepusť zbernice (~650 Hz) pridá 2.–7. alikvot,
      // aby basu počul aj malý reproduktor telefónu (sám základ ~80 Hz nezahrá — meranie „telefón").
      var f = mtof(m), low = tr.b.low.input, tt = human(r, t, 0.3);
      E.tone(low, tt, { type: 'sine', f: f, a: 0.015, sus: true, hold: hold, r: 0.3, v: T.calmBassVol });
      E.tone(low, tt, { type: 'sawtooth', f: f, a: 0.02, sus: true, hold: hold, r: 0.3, v: T.calmBassVol * fin(T.calmBassBite, 0.5) });
    }

    // Jemné bicie: mäkký kopák, metlička namiesto virblu, šuchot namiesto hi-hatu (pomalý nábeh =
    // žiadne ostré „cik"). Pod vodou ich profil vypne. Pri calmDrumVol 0 sa náhoda ťahá rovnako, len
    // sa nič nezahrá — stlmenie bicích nesmie zmeniť melódiu (prúd náhody je spoločný pre celú stopu).
    function calmDrums(tr, pr, s, t) {
      var dv = Math.max(0, fin(T.calmDrumVol, 0.6)), on = dv > 0;
      var st = s % 16, r = tr.calm.rng.drum, dr = tr.b.drum.input;
      if (pr.kick > 0 && ((st === 0 && r.next() < pr.kick) || (st === 10 && r.next() < pr.kick * 0.45) || (pr.restless && st === 6 && r.next() < 0.3))) {
        if (on) {
          tr.stats.kick++;
          E.tone(dr, t, { type: 'sine', f: 82, f2: 44, glide: 0.09, a: 0.003, d: 0.3, v: 0.16 * dv });
        }
      }
      if (pr.snare > 0 && (st === 4 || st === 12) && r.next() < pr.snare) {
        var ts = human(r, t, 0.6);
        if (on) {
          tr.stats.snare++;
          E.noise(dr, ts, { a: 0.01, d: 0.22, v: 0.05 * dv, filter: { type: 'bandpass', f: 1600, q: 0.5 } });
          E.tone(dr, ts, { type: 'triangle', f: 175, a: 0.003, d: 0.07, v: 0.025 * dv });
        }
      }
      var hp = st % 2 === 0 ? pr.hats * (st % 4 === 2 ? 1 : 0.55) : (pr.restless ? pr.hats * 0.35 : 0);
      if (hp > 0 && r.next() < hp) {
        var sv = Math.max(0, fin(T.calmShaker, 0.6)) * dv * (st % 4 === 2 ? 0.02 : 0.013) * (0.7 + 0.6 * r.next());
        var th = human(r, t, 0.5);
        if (on) {
          tr.stats.hats++;
          E.noise(dr, th, { a: 0.006, d: 0.06, v: sv, filter: { type: 'bandpass', f: 5200, q: 0.8 } });
        }
      }
    }

    // Boj v pokojnom štýle: tlkot srdca na doby a tlmený basový tón na osminy — napätie bez pílky
    // a tikotu. (Prvá verzia mala na osminách drnknutú strunu: meranie ukázalo viac ostrých nábehov
    // ako chiptune — struna má jasný úder. Mäkký trojuholník cez dolnú priepusť ho nemá.)
    function calmPulse(tr, pr, s, t) {
      var st = s % 16, pv = Math.max(0, fin(T.musicPulseVol, 0.08)) * Math.max(0, fin(T.calmGain, 1.15));
      if (!(pv > 0)) return;
      if (st % 4 === 0) {
        tr.stats.pulse++;
        E.tone(tr.pulseGain, t, { type: 'sine', f: 64, f2: 42, glide: 0.1, a: 0.006, d: 0.22, v: pv * 2.2 });
        if (st % 8 === 0) E.tone(tr.pulseGain, t + 0.16, { type: 'sine', f: 58, f2: 40, glide: 0.1, a: 0.006, d: 0.18, v: pv * 1.3 });
      }
      if (st % 2 === 0) {
        tr.stats.pulse++;
        // Okolo E4 (~330 Hz) s alikvotmi do ~2 kHz: tlkot srdca (~60 Hz) mobil nezahrá, tento tón áno.
        // Meranie 2026-10-01 (pulz osamote vs celý boj, pásmo 300–5000 Hz): pôvodný tón ~150 Hz bol o 21 dB
        // pod hudbou = v telefóne nepočuť; cieľ ~14 dB pod hudbou (rytmický pulz je počuť aj tichší).
        var f = mtof(harmMidi(pr, tr.calm.deg || 0, 64));
        E.tone(tr.pulseGain, t, { type: 'triangle', f: f, a: 0.008, d: 0.14, v: pv * fin(T.calmPulseTone, 2) * (st % 4 === 0 ? 1.3 : 0.9), filter: { f: 2000, q: 0.7 } });
      }
    }

    // Legenda v pokojnom štýle: ten istý zlovestný motív, ale tmavým pianom namiesto pílky a štvorca.
    function calmLegend(tr, pr, s, t, sd) {
      var ps = s % 32, ph = LEG[Math.floor(s / 32) % 2], keys = tr.b.keys.input;
      for (var i = 0; i < ph.length; i++) {
        if (ph[i][0] !== ps) continue;
        var m = pr.root - 12 + ph[i][1];
        tr.stats.motif++;
        E.epiano(keys, t, { f: mtof(m), v: T.calmKeysVol * 1.5, hold: ph[i][2] * sd * 0.85, r: 0.8, index: 0.9, tine: 0.05 });
        E.epiano(keys, t, { f: mtof(m + 12), v: T.calmKeysVol * 0.7, hold: ph[i][2] * sd * 0.7, r: 0.8, index: 0.6, tine: 0 });
      }
      // Tympan: patrí k bicím — stlmí ho calmDrumVol 0 a ambient (štýl 2 = bez bicích) ho nehrá vôbec.
      var tv = pr.style === 2 ? 0 : Math.max(0, fin(T.calmDrumVol, 0.6)) / 0.6;
      if (s % 16 === 0 && tv > 0) {
        tr.stats.kick++;
        E.tone(tr.b.drum.input, t, { type: 'sine', f: 98, f2: 49, glide: 0.2, a: 0.003, d: 0.6, v: 0.2 * tv });
        E.noise(tr.b.drum.input, t, { d: 0.12, v: 0.04 * tv, filter: { f: 300 } });
      }
    }

    function calmStep(tr, pr, s, t, sd) {
      var st = s % 16, bar = Math.floor(s / 16), C = calmState(tr), r = C.rng.comp;
      tr.stats.steps++;
      if (!tr.b) syncBuses(tr, pr, t);   // vznik zberníc s hodnotami posuvníkov hneď, nie po nábehu
      if (st === 0 || !C.prog) calmBar(tr, pr, bar, t, sd);
      if (pr.motif === 'legend') calmLegend(tr, pr, s, t, sd);
      else {
        // Lo-fi sprievod: občas druhý, slabší úder akordu na „a" druhej alebo tretej doby — len kde hrajú
        // bicie (groove na hladine); pod vodou by len pridal ostré nábehy.
        if ((st === 6 || st === 10) && pr.kick > 0 && pr.keys > 0.2 && r.next() < fin(T.calmComp, 0.3) * pr.keys) {
          if (C.strum) strumChord(tr, C.voic, t, 0.45, true, r);
          else keysChord(tr, C.voic, t, 4 * sd, 0.45, r);
        }
        calmMelody(tr, pr, s, t, sd);
        calmArp(tr, pr, s, t);
      }
      calmBass(tr, pr, s, t, sd);
      calmDrums(tr, pr, s, t);
      if (tr.pulse || t < tr.pulseUntil) calmPulse(tr, pr, s, t);
    }

    return P;
  }
  M.createPlayer = createPlayer;

  // ================================================================== živá fasáda
  var want = { mode: null, depth: 0 };
  var player = null;
  var unknown = M.unknown = [];

  M.set = function (mode) {
    if (mode === undefined) mode = null;
    if (mode !== null && MODES.indexOf(mode) < 0) {
      if (unknown.indexOf(String(mode)) < 0 && unknown.length < 20) unknown.push(String(mode));
      return false;
    }
    want.mode = mode;
    // Miesto (jazero) platí len pre hudbu ponoru; každá iná scéna je na súši alebo v mori (Nekonečná hlbina) —
    // revízia 2026-10-02: po výlete na jazero znela predsieň Nekonečnej hlbiny ako jazero (pásmo 1 namiesto 0).
    if (mode !== 'dive' && mode !== 'fight' && mode !== 'legend') location = null;
    if (player) { try { player.set(mode); } catch (e) { /* hudba nesmie zhodiť hru */ } }
    return true;
  };
  M.setDepth = function (m) {
    want.depth = Math.max(0, fin(m, want.depth));
    if (player) player.setDepth(want.depth);
    if (HL.audio && HL.audio._setDepth) HL.audio._setDepth(want.depth);
  };
  M.mode = function () { return want.mode; };
  // Volá HL.audio.update, keď beží zvuk. Prehrávač vzniká až s prvým živým kontextom.
  M._tick = function (E) {
    if (!player || player.engine !== E) {
      player = createPlayer(E);
      player.setDepth(want.depth);
      if (want.mode) player.set(want.mode);
    }
    player.tick();
  };
  M.probe = function () {
    return { mode: want.mode, depth: want.depth, tracks: player ? player.info() : [], unknown: unknown.slice() };
  };
})(globalThis.HL);
