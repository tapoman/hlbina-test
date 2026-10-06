// Boj s rybou — rytmická minihra (dizajn 5.3, 5.4, 6; ARCHITECTURE.md §11).
//
//   HL.fight.create({ species, weight, lineKg, rng, rod, hook, latencyMs, perks, novice?, difficulty? }) -> Fight
//         novice: true = jeden z prvých T.noviceFights bojov kariéry → obtiažnosť 0 a úľava navyše (T.noviceEase)
//         difficulty: 0..1 natvrdo (testy, harness); bez neho si ju boj spočíta sám z druhu a váhy
//   HL.fight.difficulty(species, weight) -> D 0..1   obtiažnosť boja (legenda = 1), pozri nižšie
//   HL.fight.ease(D, novice?) -> { tempo, tol, gain, start, bad, decay }   násobky pri obtiažnosti D
//   HL.fight.update(f, dt) -> [udalosti]       {type:'phase', kind, fake, dur} | {type:'bossPhase', n}
//                                              | {type:'landed'} | {type:'escaped'}
//   HL.fight.tap(f) -> 'good' | 'bad' | 'ignored'
//   HL.fight.pullKg(f) -> kg     ťah ryby práve teraz (0 mimo ŤAHÁ); bez hĺbky — tú pridá sim/tension.js
//   HL.fight.peakPullKg(species, lineKg) -> kg   najväčší ťah v ktorejkoľvek fáze (legenda × max pullMult)
//   HL.fight.spikeKg(f) -> kg    súčet doznievajúcich skokov po zlých ťuknutiach
//   HL.fight.timeline(f, withNext?) -> [{ kind, fake, start, end, current? }]   pre pás rytmu v UI
//
// ROZHODNUTIE: boj začína fázou ŤAHÁ. Po zábere ryba trhne (dizajn: záber = ryba bojuje),
// hráč najprv vidí červenú a učí sa čakať na zelenú; prvé ťuknutie "naslepo" je chyba.
// Prvá fáza príde ako udalosť {type:'phase', kind:'pull'} v prvom update().
// Udalosti, ktoré spôsobí tap() ('bossPhase', 'landed'), vráti NAJBLIŽŠÍ update() — stav (done,
// progress, bossPhase) je však platný hneď po tap(). Kto ťuká, musí v tom istom kroku zavolať aj update().
// Perky Nekonečnej hlbiny: perks = { grip, slowEscape, tolerance } (true alebo počet výberov);
// grip a slowEscape sa pri opakovaní násobia (1,3^n, 0,6^n), tolerancia sčíta (+60 ms × n).
//
// Pole Fight (číta UI; zapisuje iba tento súbor):
//   species, weight, lineKg, legend      druh (dátový objekt), váha kusu, záťaž na vlasci, je legenda?
//   phase 'pull'|'slack', fake           aktuálna fáza; fake = falošný zelený záblesk
//   phaseT, phaseDur                     uplynulý čas a dĺžka aktuálnej fázy (s) — ukazovateľ rytmu
//   phaseN                               poradie aktuálnej fázy od začiatku boja (0, 1, 2…) — zmena = nová fáza
//   next                                 nasledujúca fáza { kind, dur, fake } — look-ahead pre toleranciu.
//                                        UI ju NEMÁ ukazovať: prezradila by falošné pauzy vopred.
//   progress 0..1                        postup chytania (lišta); 1 = ryba visí na vlasci, 0 = únik
//   bossPhase, bossPhases, bossMarks     index fázy legendy (0..2), počet fáz (3 / 0), značky na lište (štart + zvyšok × 1/3, 2/3)
//   rhythmType, rhythmName               id a slovenský názov práve bežiaceho rytmu
//   t, done, outcome                     čas boja (s); done = true po 'landed'/'escaped'; outcome = to isté ako reťazec
//   taps { good, bad, ignored }          počty ťuknutí
//   flash null | { kind:'good'|'bad', t }  posledné posúdené ťuknutie; t = f.t V OKAMIHU ťuknutia
//                                        (UI počíta vek = f.t − flash.t; po skončení boja f.t stojí)
//   tolSec, decay, need                  platná tolerancia PO zelenej (s, s úľavou), pokles postupu (za s), needProgress legendy
//   tolEarlySec, beatSec                 tolerancia PRED zelenou (bez úľavy) a takt tohto boja (T.tapBeatSec × ease.tempo)
//   history [{ kind, start, end, fake }] niekoľko posledných fáz (na posúdenie ťuknutia v čase t − latencyMs)
//   difficulty 0..1, novice              obtiažnosť tohto boja (UI: bodky) a či je to boj nováčika
//
// OBTIAŽNOSŤ (testeri 2026-09-27: "prvé ryby a tie všetky early a low lvl sú celkom ťažké pre ľudí").
// D = vážený priemer (T.diffZoneW/RareW/WeightW) troch čísel 0..1:
//   pásmo druhu (Plytčina 0 … Priepasť 1), vzácnosť (nízka základná šanca na záber = vzácnejší =
//   ťažší, normované cez bežné druhy) a váha kusu (logaritmicky cez rozsah typických váh druhov);
//   k tomu PRÍPLATOK za kus ťažší než typický (trofejný = T.diffSpecimenBonus, sim/specimen.js).
//   Legendy D = 1. D = 1 hrá boj PRESNE ako pred zmenou (tests/unit/difficulty.test.js porovnáva
//   stopy so zlatým záznamom starého fight.js) — hlboké ryby a legendy ostávajú, ako boli naladené.
// Nižšia D boj uľahčí (násobky 1 + (ľahký − 1) × (1 − D)): dlhšie fázy rytmu (IBA skutočné — falošný
// záblesk ostáva kratší ako reakcia) a s nimi aj TAKT (inak by dlhšia zelená dala búšičovi 2 dobré
// ťuknutia namiesto 1), širšia tolerancia IBA PO začiatku zelenej (strana pomalého človeka; pred
// zelenou ťuká len búšič), pomalší pokles, väčší zisk za PRVÉ dobré ťuknutie zelenej. Strata za zlé
// ťuknutie a štart postupu predvolene ostávajú (posuvníky áno): búšenie (6–12 ťuknutí/s) nesmie
// vyhrať ľahkú rybu so ŽIADNYM prútom a háčikom (fight.test.js "búšenie NEvyhráva", difficulty.test.js)
// — čísla, prečo, sú pri posuvníkoch nižšie a pri beatSec/tolSec.
//
// Posudzovanie ťuknutia: v čase tj = t − latencyMs (kalibrácia oneskorenia). Platí ako zelené, ak tj
// padne do skutočnej zelenej rozšírenej o toleranciu na OBE strany (preto história a jedna fáza
// dopredu; pred zelenou tolEarlySec, po nej tolSec), alebo DO falošného záblesku bez akejkoľvek
// tolerancie (dizajn: záblesk má oklamať).
// Ťuknutie, ktorého tj je pred začiatkom boja, sa ignoruje — hráč vtedy ešte nebojoval.
(function (HL) {
  var T = HL.T;
  // Dokument 3: "ťukanie v rytme". Bez obmedzenia (meranie tools/rhythmfight_balance.js) búšenie
  // počas zelenej chytí každý druh za 1–4,5 s a čítanie rytmu stráca zmysel. Pevné "1 na zelenú"
  // zas trestalo druhy s dlhou zelenou (Barakuda 46 s so základnou výbavou). Preto TAKT: v jednej
  // zelenej sa dobré ťuknutia počítajú najviac raz za tapBeatSec — krátka zelená = 1 ťuknutie,
  // dlhé pokojné povolenie = niekoľko, búšenie rýchlejšie než takt nepridá nič, len riziko červenej.
  // Posuvníky sú tu preto, že "koľko ťuknutí na jednu zelenú" je hlavná otázka pocitu z boja.
  T.def('Boj', 'goodTapsPerSlack', 0, 0, 5, 1, 'Najviac dobrých ťuknutí za jednu zelenú (0 = bez limitu)');
  T.def('Boj', 'tapBeatSec', 0.45, 0, 1.5, 0.05, 'Takt: najmenší odstup dobrých ťuknutí v jednej zelenej (s)');
  // Majiteľ po hraní: "keď netrafíš v správnom bode, ryba bojuje, strácaš postup a môže utiecť".
  // Zlé ťuknutie (mimo zelenej) preto okrem skoku napätia (dokument 5.3) aj ZNÍŽI postup;
  // keď postup klesne na 0, ryba unikne hneď (aj s návnadou). 0 = pôvodné pravidlo dokumentu.
  T.def('Boj', 'badTapProgress', 0.10, 0, 0.5, 0.01, 'Zlé ťuknutie: ryba sa bráni — strata postupu (0,10 = zmaže jeden dobrý zásah)');
  // Vylepšenia Nekonečnej hlbiny, ktoré menia boj (data/world.js perks). Opakovaný výber sa násobí
  // (grip, slowEscape) alebo sčíta (tolerancia) — násobenie nikdy nespraví pokles záporným.
  T.def('Nekonečná', 'perkGrip', 1.3, 1, 3, 0.05, 'Pevné zaseknutie: násobok postupu za ťuknutie');
  T.def('Nekonečná', 'perkSlowEscape', 0.6, 0.1, 1, 0.05, 'Pomalší únik: násobok poklesu postupu');
  T.def('Nekonečná', 'perkToleranceMs', 60, 0, 300, 5, 'Tolerancia rytmu navyše za vylepšenie (ms)');
  // Obtiažnosť boja podľa hĺbky, vzácnosti a váhy (hlavička súboru). Hodnoty "ľahký" platia pri D = 0
  // (sardinka), pri D = 1 je každý násobok presne 1. Sú to ODHADY overené robotmi (difficulty.test.js,
  // tests/autopilot.js --novice) — nie tým, že to hrá človek.
  T.def('Obtiažnosť', 'diffScaling', 1, 0, 1, 0.05, 'Sila škálovania obtiažnosti (0 = každá ryba ťažká ako pred zmenou)');
  T.def('Obtiažnosť', 'diffZoneW', 0.6, 0, 1, 0.05, 'Obtiažnosť: váha hĺbky (pásma) druhu');
  T.def('Obtiažnosť', 'diffRareW', 0.2, 0, 1, 0.05, 'Obtiažnosť: váha vzácnosti druhu');
  T.def('Obtiažnosť', 'diffWeightW', 0.2, 0, 1, 0.05, 'Obtiažnosť: váha hmotnosti kusu');
  T.def('Obtiažnosť', 'diffSpecimenBonus', 0.15, 0, 0.5, 0.01, 'Obtiažnosť: príplatok za trofejný kus (veľký úmerne menej)');
  T.def('Obtiažnosť', 'diffTempoEasy', 1.6, 1, 2.5, 0.05, 'Najľahšia ryba: fázy rytmu × (dlhšie; falošný záblesk nie)');
  T.def('Obtiažnosť', 'diffTolEasy', 2, 1, 4, 0.1, 'Najľahšia ryba: tolerancia rytmu ×');
  // Zisk a strata sú hlavná obrana proti búšeniu (búšič má veľa zlých a len jedno-dve dobré ťuknutia
  // na zelenú). Namerané (tools/difficulty_table.js): zisk × 1,7 a strata × 0,5 = búšenie 6/s vytiahlo
  // 7 druhov (sardinka, okúň, platesa, makrela, barakuda, svetlonoska, sklenená); zisk × 1,25 a strata
  // × 1 = 0 druhov pri 6/8/12 za s — ale LEN s bambusom: s lepším prútom až po oprave taktu a tolerancie
  // (beatSec, tolEarlySec vyššie; fight.test.js "s KAŽDÝM prútom"). Uľahčujú hlavne tolerancia, tempo a pokles.
  T.def('Obtiažnosť', 'diffGainEasy', 1.25, 1, 3, 0.05, 'Najľahšia ryba: postup za PRVÉ dobré ťuknutie zelenej ×');
  // Štart 0,45 (prvý odhad) nováčikovi nepomohol (robot: rovnaké % v každom pásme), ale búšičovi áno:
  // prežil prvý ťah Barakudy a v jej dlhých zelených potom zbieral — vyhral 45 % bojov (starý boj 35 %,
  // štart 0,30 → 8 %). Predvolene preto bez úľavy štartu; posuvník ostáva na skúšanie.
  T.def('Obtiažnosť', 'diffStartEasy', 0.30, 0.05, 0.9, 0.01, 'Najľahšia ryba: postup na začiatku boja (0,30 = ako ostatné)');
  T.def('Obtiažnosť', 'diffBadEasy', 1, 0.2, 2, 0.05, 'Najľahšia ryba: strata postupu za zlé ťuknutie × (pod 1 = búšenie vyhráva)');
  T.def('Obtiažnosť', 'diffDecayEasy', 0.6, 0.1, 1, 0.05, 'Najľahšia ryba: pokles postupu ×');
  T.def('Obtiažnosť', 'noviceFights', 5, 0, 30, 1, 'Nováčik: prvých X bojov kariéry má obtiažnosť 0');
  T.def('Obtiažnosť', 'noviceEase', 1.2, 1, 2, 0.05, 'Nováčik: úľava navyše (fázy a tolerancia ×, pokles ÷)');

  var EPS = 1e-9;

  // Obtiažnosť 0..1 (hlavička súboru). Čistá funkcia dát a T — UI ju smie volať aj mimo boja.
  function difficulty(species, weight) {
    HL.assert(species && HL.util.isNum(species.weight), 'fight.difficulty: druh bez váhy');
    if (species.phases && species.phases.length) return 1;
    var fish = HL.data.fish, zones = HL.data.zones, i;
    var cMin = Infinity, cMax = -Infinity, wMin = Infinity, wMax = -Infinity;
    for (i = 0; i < fish.length; i++) {
      cMin = Math.min(cMin, fish[i].chance); cMax = Math.max(cMax, fish[i].chance);
      wMin = Math.min(wMin, fish[i].weight); wMax = Math.max(wMax, fish[i].weight);
    }
    // Pásmo: poradie v HL.data.zones bez "len Nekonečná" (Plytčina 0 … Priepasť 1). Pásmo jazera
    // (docs/JAZERO.md) sa počíta ako morské pásmo diffAs; vzácnosť a váha na škále rýb mora — jazero je
    // obsah strednej hry, jeho plytké pásmo nesmie byť ľahké ako sardinka.
    var zid = species.zone, lz = HL.world.zoneById(zid);
    if (lz && lz.diffAs) zid = lz.diffAs;
    var zi = -1, zn = 0;
    for (i = 0; i < zones.length; i++) {
      if (zones[i].endlessOnly) continue;
      if (zones[i].id === zid) zi = zn;
      zn++;
    }
    var z = zi < 0 ? 1 : zn > 1 ? zi / (zn - 1) : 0;
    var rare = cMax > cMin ? HL.util.clamp01((cMax - species.chance) / (cMax - cMin)) : 0;
    var w = HL.util.isNum(weight) && weight > 0 ? weight : species.weight;
    var wn = wMax > wMin ? HL.util.clamp01((Math.log(w) - Math.log(wMin)) / (Math.log(wMax) - Math.log(wMin))) : 0;
    var sw = T.diffZoneW + T.diffRareW + T.diffWeightW;
    var base = sw > 0 ? (T.diffZoneW * z + T.diffRareW * rare + T.diffWeightW * wn) / sw : 0;
    // Príplatok za kus ťažší ako typický: 0 pri typickej váhe, plný pri najväčšom násobku triedy.
    var top = HL.specimen ? HL.specimen.maxMult() : 1.5;
    var over = top > 1 ? HL.util.clamp01((w / species.weight - 1) / (top - 1)) : 0;
    return HL.util.clamp01(base + T.diffSpecimenBonus * over);
  }

  // Násobky boja pri obtiažnosti D. Vzorec 1 + (ľahký − 1) × (1 − D): pri D = 1 je rozdiel vynásobený
  // nulou, takže vyjde presne 1 z konštrukcie (nie spoliehaním sa na zaokrúhlenie) — D = 1 = starý boj
  // bit po bite. (Tvar lerp(ľahký, 1, D) dal pri skúšaných hodnotách tiež presne 1, test to nerozlíši.)
  function ease(D, novice) {
    var e = 1 - HL.util.clamp01(D);
    var nv = novice ? 1 + (T.noviceEase - 1) * T.diffScaling : 1;
    function m(easy) { return 1 + (easy - 1) * e; }
    return {
      tempo: m(T.diffTempoEasy) * nv,
      tol: m(T.diffTolEasy) * nv,
      gain: m(T.diffGainEasy),
      start: T.progressStart + (T.diffStartEasy - T.progressStart) * e,
      bad: m(T.diffBadEasy),
      decay: m(T.diffDecayEasy) / nv,
    };
  }
  // Chýbajúci prút/háčik = žiadny bonus. Neutrálna hodnota nič nevymýšľa (na rozdiel od
  // "rozumného" smeru), len nepridá výhodu, ktorú hráč nemá.
  var NEUTRAL_ROD = { progressBonus: 0, toleranceMs: 0 };
  var NEUTRAL_HOOK = { decayMult: 1 };

  function perkCount(perks, id) {
    var v = perks && perks[id];
    if (v === true) return 1;
    return HL.util.isNum(v) && v > 0 ? Math.floor(v) : 0;
  }

  // Násobky obtiažnosti sa čítajú ŽIVO (posuvník F2 platí hneď), D a nováčik sú pevné od záberu.
  function easeOf(f) { return ease(f.difficulty, f.novice); }
  // Tolerancia bez úľavy obtiažnosti (základ + prút + vylepšenie) — platí PRED zelenou.
  function tolEarlySec(f) {
    return (T.toleranceMs + (f.rod.toleranceMs || 0) + T.perkToleranceMs * f.perkN.tolerance) / 1000;
  }
  // Úľava tolerancie (ease.tol) platí iba PO začiatku zelenej — na strane, kam padne ťuknutie
  // pomalého človeka (reaguje na zelenú, takže mešká). Pred zelenou ťukne len ten, kto ťuká naslepo:
  // dvojnásobná tolerancia pred zelenou (prvý pokus) dala búšičovi zadarmo prvé dobré ťuknutie
  // každej zelenej aj s úľavou zisku — s lepším prútom potom búšenie vyťahovalo sardinky.
  function tolSec(f) {
    return tolEarlySec(f) * easeOf(f).tol;
  }
  // Takt sa naťahuje s tempom rytmu (ease.tempo). Keby ostal T.tapBeatSec, dlhšia zelená ľahkej ryby
  // by vošla do DVOCH taktov: rýchly pravidelný rytmus 0,35 s × 1,6 = 0,56 s > 0,45 s, takže búšič
  // dostal 2 dobré ťuknutia na zelenú namiesto jedného a sklolaminátovým prútom vytiahol sardinku,
  // makrelu aj svetlonosku (starý boj: 0). S taktom × tempo je ťuknutí na zelenú toľko ako v starom boji.
  function beatSec(f) {
    return T.tapBeatSec * easeOf(f).tempo;
  }
  // Pravidlá posudzovania ťuknutia, ktoré číta aj UI/roboti (f.tolSec, f.tolEarlySec, f.beatSec).
  function refreshRules(f) {
    f.tolSec = tolSec(f);
    f.tolEarlySec = tolEarlySec(f);
    f.beatSec = beatSec(f);
  }
  // first = prvé dobré ťuknutie tejto zelenej. Úľava zisku (ease.gain) platí IBA preň: nováčik ťuká
  // raz na zelenú a dostane ju celú, kým búšič v dlhej zelenej (Barakuda, výbušný rytmus) zbiera
  // ďalšie ťuknutia v takte — tie ostávajú bez úľavy, inak by búšenie ľahkých rýb vyhrávalo častejšie.
  function gainPerTap(f, first) {
    var g = (T.progressPerTap + (f.rod.progressBonus || 0)) * Math.pow(T.perkGrip, f.perkN.grip) / f.need;
    return first === false ? g : g * easeOf(f).gain;
  }
  function decayRate(f) {
    return T.decayPerSec * f.hook.decayMult * Math.pow(T.perkSlowEscape, f.perkN.slowEscape) * easeOf(f).decay;
  }
  function pullMult(f) {
    return f.legend ? (f.species.phases[f.bossPhase].pullMult || 1) : 1;
  }

  function prep(ph) { return { kind: ph.kind, dur: ph.dur, fake: ph.fake, src: ph.src, good: 0 }; }

  function setCurrent(f, ph, start) {
    ph.start = start;
    f.cur = ph;
    f.phase = ph.kind;
    f.fake = ph.fake;
    f.phaseDur = ph.dur;
    f.phaseT = f.t - start;
    f.phaseN++;
  }

  function useRhythm(f, type, tempo, start) {
    // ease = dlhšie SKUTOČNÉ fázy pri nižšej obtiažnosti; falošný záblesk rytmus nenaťahuje (sim/rhythm.js).
    f.gen = HL.rhythm.create(type, f.rng, { tempo: tempo || 1, start: start, ease: easeOf(f).tempo });
    f.rhythmType = type;
    f.rhythmName = HL.rhythm.TYPES[type].name;
  }

  function create(o) {
    HL.assert(o && o.species, 'fight.create: chýba species');
    var sp = o.species;
    var legend = !!(sp.phases && sp.phases.length);
    HL.assert(legend || typeof sp.rhythm === 'string', 'fight.create: druh ' + sp.id + ' nemá rytmus');
    HL.assert(HL.util.isNum(sp.pull) && sp.pull > 0, 'fight.create: druh ' + sp.id + ' nemá silu ťahu');
    HL.assert(HL.util.isNum(o.weight) && o.weight > 0, 'fight.create: váha musí byť kladné číslo');
    HL.assert(o.rng && typeof o.rng.next === 'function', 'fight.create: chýba rng (HL.RNG)');
    var lineKg = o.lineKg != null ? o.lineKg : (legend ? sp.lineKg : o.weight);
    HL.assert(HL.util.isNum(lineKg) && lineKg >= 0, 'fight.create: lineKg');
    var latencyMs = o.latencyMs == null ? 0 : o.latencyMs;
    HL.assert(HL.util.isNum(latencyMs), 'fight.create: latencyMs');
    var need = sp.needProgress == null ? 1 : sp.needProgress;
    HL.assert(HL.util.isNum(need) && need > 0, 'fight.create: needProgress');
    var hook = o.hook || NEUTRAL_HOOK;
    HL.assert(HL.util.isNum(hook.decayMult) && hook.decayMult >= 0, 'fight.create: hook.decayMult');
    HL.assert(o.difficulty == null || HL.util.isNum(o.difficulty), 'fight.create: difficulty');
    var novice = !!o.novice && !legend;
    var raw = novice ? 0 : o.difficulty != null ? HL.util.clamp01(o.difficulty) : difficulty(sp, o.weight);
    // T.diffScaling 0 = škálovanie vypnuté (každý boj D = 1, ako pred zmenou); 1 = plné.
    // Pri plnom škálovaní presne raw (aby f.difficulty === HL.fight.difficulty(...) aj v pohyblivej čiarke).
    var D = T.diffScaling >= 1 ? raw : 1 - T.diffScaling * (1 - raw);

    var f = {
      species: sp, weight: o.weight, lineKg: lineKg, legend: legend,
      difficulty: D, novice: novice,
      phase: 'pull', fake: false, phaseT: 0, phaseDur: 0, phaseN: -1, next: null,
      progress: ease(D, novice).start,
      bossPhase: 0, bossPhases: legend ? sp.phases.length : 0, bossMarks: [],
      rhythmType: null, rhythmName: '',
      t: 0, done: false, outcome: null,
      taps: { good: 0, bad: 0, ignored: 0 },
      flash: null,
      tolSec: 0, tolEarlySec: 0, beatSec: 0, decay: 0, need: need,
      history: [],
      // vnútorné
      rod: o.rod || NEUTRAL_ROD, hook: hook, latencyMs: latencyMs,
      perkN: { grip: perkCount(o.perks, 'grip'), slowEscape: perkCount(o.perks, 'slowEscape'), tolerance: perkCount(o.perks, 'tolerance') },
      // Vlastný prúd náhody: rytmus boja nezávisí od toho, čo iné ponor medzitým losuje.
      // Z volajúceho rng berieme jedno číslo, aby dva boje z toho istého stavu neboli rovnaké.
      rng: new HL.RNG((o.rng.next() * 4294967296) >>> 0),
      gen: null, cur: null, spikes: [], lastTap: null, pending: [],
    };
    // Prahy fáz legendy delia ZOSTÁVAJÚCI postup (od štartu po 100 %) na tretiny. Pri prahoch
    // 1/3 a 2/3 by štart 0,30 preskočil prvú fázu hneď prvým ťuknutím (namerané 0,5–1,7 s boja).
    for (var i = 1; i < f.bossPhases; i++) f.bossMarks.push(f.progress + (1 - f.progress) * i / f.bossPhases);
    if (legend) useRhythm(f, sp.phases[0].rhythm, sp.phases[0].tempo, 'pull');
    else useRhythm(f, sp.rhythm, 1, 'pull');
    setCurrent(f, prep(f.gen.next()), 0);
    f.next = prep(f.gen.next());
    refreshRules(f);
    f.decay = decayRate(f);
    f.pending.push({ type: 'phase', kind: f.phase, fake: f.fake, dur: f.phaseDur });
    return f;
  }

  function finish(f, outcome, list) {
    f.done = true;
    f.outcome = outcome;
    list.push({ type: outcome });
  }

  function update(f, dt) {
    var ev = f.pending;
    f.pending = [];
    if (f.done) return ev;
    HL.assert(HL.util.isNum(dt) && dt >= 0, 'fight.update: dt');
    f.t += dt;
    // Veľký dt môže preskočiť viac fáz naraz; každá musí prejsť históriou aj udalosťou,
    // inak by posudzovanie ťuknutia a zvuk stratili fázu.
    while (f.t >= f.cur.start + f.cur.dur) {
      var c = f.cur, end = c.start + c.dur;
      f.history.push({ kind: c.kind, start: c.start, end: end, fake: c.fake, src: c.src, good: c.good });
      var nx = f.next;
      setCurrent(f, nx, end);
      f.next = prep(f.gen.next());
      ev.push({ type: 'phase', kind: nx.kind, fake: nx.fake, dur: nx.dur });
    }
    f.phaseT = f.t - f.cur.start;
    refreshRules(f);
    f.decay = decayRate(f);

    // História stačí na oneskorenie + toleranciu; 2 s navyše pre pás rytmu v UI.
    var keep = f.t - Math.max(2, Math.abs(f.latencyMs) / 1000 + f.tolSec + 0.5);
    while (f.history.length && f.history[0].end < keep) f.history.shift();
    var dec = T.spikeDecaySec;
    while (f.spikes.length && f.t - f.spikes[0].t >= dec) f.spikes.shift();

    f.progress -= f.decay * dt;
    if (f.progress <= 0) {
      f.progress = 0;
      finish(f, 'escaped', ev);
    }
    return ev;
  }

  // Zelený úsek, do ktorého padne čas tj (alebo null). Pri viacerých vyhrá najbližší —
  // na ten sa započíta strop goodTapsPerSlack.
  // Vracia aj skutočné hranice zelenej (bez tolerancie): lastSpan = { start, end, inside }.
  var lastSpan = null;
  function greenAt(f, tj) {
    var tol = f.tolSec, best = null, bestD = Infinity;
    lastSpan = null;
    function consider(s, start, end) {
      if (s.kind !== 'slack') return;
      // Pred zelenou tolerancia BEZ úľavy obtiažnosti (tolEarlySec), po nej s úľavou (tolSec).
      var lo = s.fake ? start : start - f.tolEarlySec, hi = s.fake ? end : end + tol;
      if (tj < lo - EPS || tj > hi + EPS) return;
      var d = tj < start ? start - tj : tj > end ? tj - end : 0;
      if (d < bestD) { bestD = d; best = s; lastSpan = { start: start, end: end, inside: d === 0 }; }
    }
    for (var i = 0; i < f.history.length; i++) consider(f.history[i], f.history[i].start, f.history[i].end);
    var curEnd = f.cur.start + f.cur.dur;
    consider(f.cur, f.cur.start, curEnd);
    consider(f.next, curEnd, curEnd + f.next.dur);
    return best;
  }

  // Legenda mení rytmus pri 1/3 a 2/3 postupu. Iba dopredu: boss, ktorý by sa pri poklese
  // vracal do ľahšej fázy, by odmeňoval nečinnosť. Aktuálna fáza aj look-ahead ostávajú
  // (ťuknutie už mohlo byť posúdené podľa nich); nový rytmus nadviaže až po nich.
  function checkBoss(f) {
    while (f.legend && f.bossPhase < f.bossPhases - 1 && f.progress >= f.bossMarks[f.bossPhase] - EPS) {
      f.bossPhase++;
      var ph = f.species.phases[f.bossPhase];
      useRhythm(f, ph.rhythm, ph.tempo, f.next.kind === 'pull' ? 'slack' : 'pull');
      f.pending.push({ type: 'bossPhase', n: f.bossPhase });
    }
  }

  function tap(f) {
    if (f.done) return 'ignored';
    if (f.lastTap !== null && f.t - f.lastTap < T.tapCooldownMs / 1000 - EPS) { f.taps.ignored++; return 'ignored'; }
    var tj = f.t - f.latencyMs / 1000;
    if (tj < 0) { f.taps.ignored++; return 'ignored'; }
    f.lastTap = f.t;
    refreshRules(f);
    var seg = greenAt(f, tj);
    // Tolerancia (a latencia) pomáha iba PRVÉMU ťuknutiu zelenej — tomu, kto takt trafil tesne.
    // Ďalšie ťuknutie tej istej zelenej, ktoré už padne do skutočnej červenej, je zlé: inak pri
    // rýchlych rytmoch (Sklenená ryba, fázy 0,2 s) tolerancia prekryla takmer celú červenú a búšenie
    // vytiahlo rybu (namerané: 8 ťuknutí/s → úlovok, hoci ostatné druhy už búšením unikali).
    if (seg && seg.good > 0 && !lastSpan.inside) seg = null;
    if (seg) {
      if (T.goodTapsPerSlack > 0 && seg.good >= T.goodTapsPerSlack) { f.taps.ignored++; return 'ignored'; }
      if (seg.good > 0 && tj - seg.lastGood < f.beatSec - EPS) { f.taps.ignored++; return 'ignored'; }
      var first = seg.good === 0;
      seg.good++;
      seg.lastGood = tj;
      f.taps.good++;
      f.progress = Math.min(1, f.progress + gainPerTap(f, first));
      f.flash = { kind: 'good', t: f.t };
      checkBoss(f);
      if (f.progress >= 1 - EPS) { f.progress = 1; finish(f, 'landed', f.pending); }
      return 'good';
    }
    // Skok vzniká v skutočnom čase ťuknutia (vlasec trhne teraz), aj keď sa posudzuje t − latencyMs.
    f.taps.bad++;
    f.spikes.push({ t: f.t, kg: T.redSpikeFrac * f.lineKg });
    // Ryba sa bráni: postup klesne (legenda ÷ need ako pri zisku — ťažší boj stráca pomalšie).
    var loss = T.badTapProgress / f.need * easeOf(f).bad;
    f.lastLoss = Math.min(f.progress, loss);
    f.progress = Math.max(0, f.progress - loss);
    f.flash = { kind: 'bad', t: f.t, loss: f.lastLoss };
    if (f.progress <= EPS) { f.progress = 0; finish(f, 'escaped', f.pending); }
    return 'bad';
  }

  function pullKg(f) {
    if (f.done || f.phase !== 'pull') return 0;
    var ramp = T.pullRampSec > 0 ? Math.min(1, f.phaseT / T.pullRampSec) : 1;
    return f.lineKg * f.species.pull * pullMult(f) * ramp;
  }

  // Najväčší ťah, aký ryba vyvinie v KTOREJKOĽVEK fáze boja (bez hĺbky — tú pridá tension.js).
  // Prečo tu a nie v UI: výstražný "!" (táto ryba by pretrhla vlasec) počítal lineKg × pull a pri
  // legende vynechal pullMult fázy 2/3 — legenda bez značky potom vlasec pretrhla (nález #9).
  // Jeden vzorec pre sim aj UI, aby sa znova nerozišli.
  function peakPullKg(species, lineKg) {
    HL.assert(species && HL.util.isNum(species.pull), 'fight.peakPullKg: druh bez sily ťahu');
    HL.assert(HL.util.isNum(lineKg), 'fight.peakPullKg: lineKg');
    var m = 1;
    var ph = species.phases || [];
    for (var i = 0; i < ph.length; i++) m = Math.max(m, ph[i].pullMult || 1);
    return lineKg * species.pull * m;
  }

  // Lineárne doznievanie: skok zmizne presne po T.spikeDecaySec a skoky sa sčítajú,
  // takže mlátenie do červenej napätie naozaj nahromadí (dizajn: najväčšie riziko hry).
  function spikeKg(f) {
    if (f.done) return 0;
    var dec = T.spikeDecaySec, s = 0;
    for (var i = 0; i < f.spikes.length; i++) {
      var age = f.t - f.spikes[i].t;
      if (age < dec) s += f.spikes[i].kg * (1 - age / dec);
    }
    return s;
  }

  function timeline(f, withNext) {
    var out = [];
    for (var i = 0; i < f.history.length; i++) {
      var h = f.history[i];
      out.push({ kind: h.kind, fake: h.fake, start: h.start, end: h.end });
    }
    var curEnd = f.cur.start + f.cur.dur;
    out.push({ kind: f.cur.kind, fake: f.cur.fake, start: f.cur.start, end: curEnd, current: true });
    if (withNext) out.push({ kind: f.next.kind, fake: f.next.fake, start: curEnd, end: curEnd + f.next.dur });
    return out;
  }

  HL.fight = {
    create: create,
    difficulty: difficulty,
    ease: ease,
    update: update,
    tap: tap,
    pullKg: pullKg,
    peakPullKg: peakPullKg,
    spikeKg: spikeKg,
    timeline: timeline,
  };
})(globalThis.HL);
