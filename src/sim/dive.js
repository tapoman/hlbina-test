// Simulácia ponoru (dizajn 3, 4, 5, 6, 7, 9, 12.2; ARCHITECTURE.md §12).
//
//   HL.dive.create(DiveOpts) -> DiveState
//   HL.dive.update(d, dt, DiveInput) -> d.events (udalosti tohto kroku)
//   HL.dive.cameraTop(d) -> hĺbka (m) na vrchu obrazovky ; HL.dive.screenY(d, depth) -> px
//   HL.dive.value(d) -> odhad hodnoty úlovku na vlasci (opts.valueFn(položky), inak súčet opts.priceFn)
//   HL.dive.spawn(d, druh, o) -> objekt    ROZŠÍRENIE: 'fish' | 'jelly' | 'rock' | 'shark' | 'octopus' | 'shadowEel'
//         Prirodzené spawnovanie volá TIE ISTÉ funkcie, takže scenáre (ui/scenario, harness) a testy
//         bežia rovnakou cestou ako hra — nič sa nevkladá do stavu "bokom".
//   HL.dive.refresh(d)   prepočíta pevnosť vlasca, svetlo a napätie (po vylepšení, po scenári)
//   HL.dive.baitMatch(baitId, species) -> 'ideal'|'ok'|'bad' ; HL.dive.biteChance(d, species) -> 0..1
//
// Stav sa mení iba tu. Náhoda iba z HL.rngFor(opts.seed, 'dive', prúd) — každý subsystém má
// VLASTNÝ prúd (ryby, záber, boj, nebezpečenstvá, predátori, legendy, vylepšenia), takže zmena
// počtu hodov v jednom (napr. viac medúz v daždi) nepreháže, ktoré ryby prídu.
//
// ROZHODNUTIA, ktoré zmluva nechala sem:
// - Poradie kroku: čas → HORE → harpúna → háčik → boj (ťuk, potom fight.update, ako chce fight.js)
//   → svet (ryby, legendy, medúzy, skaly, predátori, počasie) → napätie → prasknutie → vylepšenie.
// - Prostredie sa prepočíta vždy, keď hodiny prejdú celú minútu: obdobie, mesiac a počasie
//   z HL.world.weatherAt(worldSeed, clock). Intro (env0.intro) = vždy slnečno. Zmena → 'weather'.
// - Ryby: druh je vhodný, ak jeho rozsah hĺbok zasahuje do [háčik − T.fishSpawnAbove, háčik +
//   T.fishSpawnBelow], platí HL.world.matches (podmienky vrátane udalosti) a sezónny druh má svoju
//   udalosť. Váha výberu 1,0 pre cond ['any'], T.condSpawnWeight (1,4) pre podmienené — lov podľa
//   počasia a času sa tak oplatí. Ryba sa objaví tesne za ľavým/pravým okrajom v hĺbke háčik +
//   náhoda(−70, +90) m orezanej do rozsahu druhu a pláva vodorovne CEZ CELÚ šírku (každá ryba teda
//   prejde nad/pod háčikom, "čo sa objaví, musí vedieť doplávať k háčiku"), s jemným vlnením.
//   Rýchlosť podľa veľkosti: 16 px 18–28 px/s, 32 px 12–20, 64 px 8–12 (× T.fishSpeedMult).
//   Kŕdeľ (species.school) = 4–7 kusov naraz. T.fishMax obmedzuje počet rýb pri NOVOM spawne;
//   kŕdeľ ho smie prekročiť (inak by pri limite 7 kŕdeľ takmer nikdy nevznikol). Zmizne ďaleko
//   za okrajom (30 px) alebo 200 m od háčika.
// - Záber: ryba, ktorej návnada NIE JE nevhodná, v T.attractRadius pláva k háčiku; v T.biteRadius
//   hodí kockou RAZ (vzorec §12). Nevhodná návnada neláka, ale ryba, ktorá náhodou prepláva
//   dosahom, hodí s ×0,2 (tak to vzorec predpokladá). Neúspech → uteká T.biteCooldown s a potom
//   sa otočí späť ("skúsi znova"); po dvoch odmietnutiach odpláva nadobro.
//   Návnada 'mix' (Nekonečná) = vhodná pre každý bežný druh; 'gold' = vhodná pre bežné, ideálna pre legendy.
// - Legendy: T.legendPerMin výskytov za minútu, kým platí matches(legenda, env) (Strážca cez token
//   'guardian' = env.guardianReady) a háčik je v jej hĺbke; zlatá návnada × HL.data.goldLegendSpawnMult.
//   Najviac jedna naraz. Legenda z opts.legendsCaught (alebo chytená v tomto ponore) sa znova
//   neobjaví — inak by sa 12 000 € dalo loviť dookola. V Nekonečnej hlbine sa neobjaví vôbec
//   (nemá trh, odmena by prepadla). Legenda, ktorá odpláva bez záberu → 'legendLeave' {id, uid}. Počas boja s legendou: 'jelly' → medúzy
//   mierené na stojaci háčik (× T.legendJellyMult), 'current' → trhnutia (T.currentYankFrac ×
//   lineKg), 'lightning' → blesky (udalosť strong:true + skok T.lightningSpikeFrac × lineKg).
//   Trhnutia a blesky idú do napätia ako parts.hazard (sim/tension.js), doznievajú T.spikeDecaySec.
// - Búrka: bočný prúd (d.current.force, px/s) mení smer každé 3–6 s, rozbieha sa plynule;
//   blesky 'lightning' (strong:false, len vizuál) každých 5–12 s. Predátori × T.stormPredatorMult.
// - Žralok: prichádza len vtedy, keď je čo zjesť (na vlasci aspoň jedna ryba). 'warn' trvá
//   T.sharkDelaySec (+ T.perkSharkSlowSec za vylepšenie), potom 'attack' zožerie najcennejšiu rybu
//   podľa opts.priceFn a 'leave'. Harpúna (počas 'warn') ho odoženie; HORE počas 'warn' = úlovok
//   v bezpečí (počas výstupu sa nič nedeje). shark.y = odsadenie od háčika v px (UI kreslí na
//   screenY(háčik) + y), shark.depth = tá istá poloha v metroch.
// - Chobotnica: najprv sa T.octopusWarnSec blíži (udalosť 'octopusWarn', phase 'warn', bez záťaže;
//   HORE ju zruší), potom sa chytí ('octopusGrab', phase 'attached') a záťaž T.octopusLoadKg ×
//   depthMult nabieha T.octopusRampSec (octopus.load 0..1). Strasie sa T.octopusShakes zmenami smeru
//   háčika, medzi ktorými háčik prešiel aspoň T.octopusLegPx, v kĺzavom okne T.octopusWindowSec.
//   Počas boja sa háčik nehýbe, takže sa strasiť nedá — preto sa počas boja nová neobjaví
//   a blížiaca sa počká (jej varovanie neplynie).
// - Tieňový úhor: objaví sa v Priepasti (predators.shadowEel.from) na T.eelStaySec. Čas státia
//   sa meria OD JEHO PRÍCHODU (inak by hráč, ktorý 10 s čakal na rybu, dostal ranu v okamihu
//   príchodu úhora bez varovania) a počas boja neplynie. Háčik "stojí", keď neklesá a nepohol sa
//   aspoň o T.stillSpeedPx px/s. Uhryznutie = prasknutie.
// - Bonusový ponor (DiveOpts.haul, len kariéra, majiteľ 2026-10-04): ryba, ktorá v boji ujde ('escaped'), vezme
//   so sebou všetko na udici — položky lost[] s cause 'escape' a udalosť 'haulLost' { id, lost }. Vlasec ostáva,
//   ponor pokračuje. Odmena: bonus za veľký úlovok pri vynorení (sim/game.js G.haulBonus). Result.haul = režim.
// - Prasknutie: 'snap', stav 'snapped' na T.snapSec, potom 'over'. Stratí sa úlovok aj všetky
//   nesené návnady (neobmedzený červík/zmes ostáva ∞). Harpúny ostávajú (sú výbava na lodi).
//   Žralok vo varovaní odpláva (nemá čo zjesť), úhor a chobotnica zmiznú.
//   Vylepšenie 'knot' zachráni prvé prasknutie: vlasec zhodí polovicu úlovku (zaokrúhlené nahor,
//   najťažšie záťaže prvé), bojovaná ryba unikne, skoky zmiznú; udalosť 'knot' (rozšírenie).
// - Každá udalosť nad rámec zoznamu §12 je rozšírenie: 'upBlocked' (HORE počas boja), 'knot',
//   'yank' (trhnutie legendy), 'eelLeave', 'octopusWarn', 'legendLeave', 'haulLost'. Položky lost[] nesú
//   cause: 'shark'|'knot'|'snap'|'escape'. Result.harpoonsUsed = vystrelené harpúny.
// - d.light (px) = polomer svetla háčika pre UI: T.lightRadius + Maják v noci / v Polnoci + vylepšenie.
// - opts.tutorial simuláciu nemení (iba návod v UI).
// - Lovné miesto (docs/JAZERO.md): opts.location ('more' predvolené | 'jadro') určí pásma, druhy, legendy,
//   nebezpečenstvá a predátorov ponoru (HL.data.locations). More berie TIE ISTÉ zoznamy ako predtým, takže
//   jeho prúdy náhody sú bit po bite rovnaké. Bonus za dážď platí v prvom pásme miesta (more: Plytčina),
//   svetlo Majáka v Polnoci len v mori. Nekonečná hlbina je len v mori. d.location, Result.location.
(function (HL) {
  var T = HL.T, U = HL.util, D = HL.data;
  var d_ = T.def;

  d_('Ponor', 'snapSec', 1.2, 0.3, 3, 0.1, 'Prasknutie: trvanie pred koncom ponoru (s)');
  d_('Ponor', 'fishSpawnAbove', 70, 0, 200, 5, 'Ryby sa objavujú najviac X m nad háčikom');
  d_('Ponor', 'fishSpawnBelow', 90, 0, 250, 5, 'Ryby sa objavujú najviac X m pod háčikom');
  d_('Ponor', 'condSpawnWeight', 1.4, 0.5, 5, 0.1, 'Váha výskytu druhov s podmienkou (bežné = 1)');
  d_('Ponor', 'fishSpeedMult', 1.0, 0.3, 3, 0.05, 'Násobok rýchlosti plávania rýb');
  d_('Ponor', 'approachMult', 1.3, 0.5, 4, 0.05, 'Ryba pláva k návnade × rýchlejšie');
  d_('Ponor', 'fleeMult', 1.6, 1, 4, 0.1, 'Ryba po odmietnutí uteká × rýchlejšie');
  d_('Ponor', 'stillSpeedPx', 4, 0.5, 30, 0.5, 'Háčik "stojí" pod touto rýchlosťou (px/s)');
  d_('Nebezpečenstvá', 'jellyRateMult', 1, 0, 5, 0.1, 'Násobok výskytu medúz (dáta: perMin)');
  d_('Nebezpečenstvá', 'rockRateMult', 1, 0, 5, 0.1, 'Násobok výskytu skál (dáta: perMin)');
  d_('Nebezpečenstvá', 'stormPredatorMult', 1.5, 1, 4, 0.1, 'Búrka: násobok výskytu predátorov');
  d_('Nebezpečenstvá', 'sharkLeaveSec', 1.2, 0.2, 5, 0.1, 'Žralok: odchod (s, vizuál)');
  d_('Nebezpečenstvá', 'octopusWindowSec', 2.5, 0.5, 8, 0.1, 'Chobotnica: okno na trhnutia (s)');
  d_('Nebezpečenstvá', 'octopusLegPx', 6, 1, 40, 1, 'Chobotnica: najmenší posun medzi trhnutiami (px)');
  // Varovanie a nábeh (nález #2/#7): chobotnica sa chytala s plnou záťažou v kroku, v ktorom vznikla,
  // a vlasec praskol z tichého oblúka. Dizajn 4.2/19: žiadne prasknutie bez varovania.
  d_('Nebezpečenstvá', 'octopusWarnSec', 1.5, 0.5, 5, 0.1, 'Chobotnica: blíži sa (varovanie) pred prichytením (s)');
  d_('Nebezpečenstvá', 'octopusRampSec', 1.0, 0.2, 4, 0.1, 'Chobotnica: nábeh záťaže po prichytení (s)');
  d_('Nebezpečenstvá', 'eelStaySec', 14, 3, 60, 1, 'Tieňový úhor: ako dlho krúži (s)');
  d_('Nebezpečenstvá', 'legendJellyMult', 4, 1, 12, 0.5, 'Legenda s medúzami: násobok medúz počas boja');
  d_('Nebezpečenstvá', 'currentYankFrac', 0.5, 0, 2, 0.05, 'Legenda s prúdom: trhnutie × lineKg');
  d_('Nebezpečenstvá', 'lightningSpikeFrac', 0.2, 0, 1, 0.05, 'Legenda s bleskami: skok × lineKg');
  d_('Nekonečná', 'perkStrength', 1.2, 1, 2, 0.05, 'Vylepšenie: násobok pevnosti vlasca');
  d_('Nekonečná', 'perkSink', 1.3, 1, 2, 0.05, 'Vylepšenie: násobok rýchlosti klesania');
  d_('Nekonečná', 'perkLure', 1.3, 1, 2, 0.05, 'Vylepšenie: násobok šance na záber');
  d_('Nekonečná', 'perkSharkSlowSec', 4, 0, 15, 0.5, 'Vylepšenie: žralok útočí neskôr o (s)');
  d_('Nekonečná', 'perkLightPx', 12, 0, 40, 1, 'Vylepšenie: väčší kužeľ svetla (px)');

  // Herná plocha je 180 px široká (§2). Sim nesmie čítať HL.view (v Node neexistuje).
  var PW = 180;
  var X_MIN = 6, X_MAX = PW - 6;
  var OFF = 12;            // ryba vzniká tesne za okrajom
  var DESPAWN_PX = 30;     // a zmizne, keď je ďalej
  var FAR_M = 200;         // alebo keď je od háčika ďalej ako toľko metrov
  var JELLY_R = 7;         // dotyk medúzy (px)
  var WOB_A = 1.5, WOB_W = 1.3; // vlnenie rýb (m, rad/s) — len vizuál
  var SCHOOL_DY = 3;       // kŕdeľ: členovia ± toľko metrov okolo hĺbky prvého (aj nad rozsah druhu)
  // Tabuľka rýchlostí zo zadania (px/s) podľa veľkostnej triedy sprite.
  var SPEED = { 16: [18, 28], 32: [12, 20], 64: [8, 12] };
  var ROCKS = { s: [10, 6], m: [16, 10], l: [26, 14] };   // šírka × výška v px (sprite rock_s/m/l)
  var MATCH = { ideal: 1.5, ok: 1.0, bad: 0.2 };          // dizajn 5.2
  var NO_INPUT = {};
  var STREAMS = ['spawn', 'bite', 'fight', 'haz', 'pred', 'legend', 'perk', 'weather'];

  var idx = null;
  function I() {
    if (!idx) {
      idx = {
        sp: U.byId(D.allFish.concat(D.allLegends)),
        weather: U.byId(D.weathers),
        period: U.byId(D.periods),
      };
    }
    return idx;
  }

  function perkN(d, id) {
    var v = d.perks && d.perks[id];
    if (v === true) return 1;
    return U.isNum(v) && v > 0 ? Math.floor(v) : 0;
  }
  function emit(d, type, o) {
    var e = { type: type };
    if (o) for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) e[k] = o[k];
    d.events.push(e);
    return e;
  }
  function r2(v) { return Math.round(v * 100) / 100; }
  function isLegend(sp) { return !!(sp && sp.phases && sp.phases.length); }

  // ------------------------------------------------------------------ prostredie
  function makeEnv(d, m) {
    var e0 = d._.env0;
    return {
      m: m,
      day: HL.world.day(m),
      minuteOfDay: HL.world.minuteOfDay(m),
      hour: HL.world.hour(m),
      period: HL.world.period(m),
      weather: e0.intro ? 'sun' : HL.world.weatherAt(d._.worldSeed, m),
      moon: HL.world.moon(m),
      event: e0.event || null,
      intro: !!e0.intro,
      guardianReady: !!e0.guardianReady,
    };
  }

  function advanceClock(d, dt) {
    d.t += dt;
    d.minutes += dt * T.minutesPerSec;
    d.clock = d._.clock0 + d.minutes;
    var mm = Math.floor(d.clock);
    if (mm !== d._.envMinute) {
      d._.envMinute = mm;
      var prev = d.env.weather;
      d.env = makeEnv(d, d.clock);
      if (d.env.weather !== prev) emit(d, 'weather', { id: d.env.weather, prev: prev });
    }
  }

  // ------------------------------------------------------------------ návnada a záber
  function listMatch(baitId, sp) {
    var b = sp.bait || {};
    if ((b.ideal || []).indexOf(baitId) >= 0) return 'ideal';
    if ((b.ok || []).indexOf(baitId) >= 0) return 'ok';
    return 'bad';
  }
  function baitMatch(baitId, sp) {
    var legend = isLegend(sp);
    if (baitId === 'mix') return legend ? listMatch(baitId, sp) : 'ok';
    if (baitId === 'gold') return legend ? 'ideal' : 'ok';
    return listMatch(baitId, sp);
  }

  function biteChance(d, sp) {
    var env = d.env, ix = I();
    var match = baitMatch(d.bait.id, sp);
    var w = ix.weather[env.weather], p = ix.period[env.period];
    var c = sp.chance * MATCH[match] * (w ? w.biteMult : 1) * (p ? p.biteMult : 1);
    if (env.weather === 'rain' && HL.world.zoneAt(d.hook.depth, d.mode === 'endless', d.location).id === d._.loc.zones[0].id) c *= 1 + T.rainShallowBonus;
    var cond = sp.cond || [];
    if (env.weather === 'fog' && (cond.indexOf('fog') >= 0 || cond.indexOf('newmoon') >= 0)) c *= 1 + T.fogBonus;
    c *= T.biteChanceMult * Math.pow(T.perkLure, perkN(d, 'lure'));
    return U.clamp01(c);
  }

  function hasBait(d) { return d.bait.count > 0; }

  function eatBait(d) {
    if (!isFinite(d.bait.count)) return;
    d.bait.count = Math.max(0, d.bait.count - 1);
    if (d.bait.count === 0) emit(d, 'baitOut', { id: d.bait.id });
  }

  // ------------------------------------------------------------------ ryby
  function speciesRange(d, sp) {
    // Nekonečná hlbina nemá dno: pod 3000 m žijú druhy Priepasti.
    if (d.mode === 'endless' && sp.zone === 'priepast' && !isLegend(sp)) return [sp.depth[0], Infinity];
    return sp.depth;
  }
  function eligible(d, sp) {
    if (sp.event && sp.event !== d.env.event) return false;
    return HL.world.matches(sp, d.env);
  }
  function isConditional(sp) {
    var c = sp.cond || ['any'];
    return !(c.length === 1 && c[0] === 'any');
  }

  function addFish(d, sp, o) {
    var r = d._.r.spawn;
    var legend = isLegend(sp);
    var sr = SPEED[sp.size] || SPEED[32];
    var dir = o.dir || (o.x != null ? (o.x < PW / 2 ? 1 : -1) : r.sign());
    // Veľkosť kusu (sim/specimen.js): trieda malý/bežný/veľký/trofejný — JEDEN hod z prúdu 'spawn'
    // ako predtým (±25 %), takže ten istý ponor prinesie tie isté druhy v tých istých chvíľach.
    // Legenda má pevnú váhu a záťaž (lineKg) a triedu nemá.
    var sz = legend ? null : HL.specimen.roll(r, sp, o.tier);
    var w = legend ? sp.weight : sz.w;
    var f = {
      uid: ++d._.uid, id: sp.id,
      x: o.x != null ? o.x : (dir > 0 ? -OFF : PW + OFF),
      depth: Math.max(0.5, o.depth),
      dir: dir,
      speed: (o.speed != null ? o.speed : r.range(sr[0], sr[1])) * T.fishSpeedMult,
      w: w, lineKg: legend ? sp.lineKg : w, tier: legend ? null : sz.tier,
      state: 'swim', cool: 0, legend: legend,
      size: sp.size, glow: !!sp.glow, wob: r.range(0, 6.2832), refusals: 0, inBite: false,
    };
    d.fish.push(f);
    return f;
  }

  function spawnFish(d, sp, o) {
    o = o || {};
    if (isLegend(sp)) {
      var lf = addFish(d, sp, o);
      d._.legendUid = lf.uid;
      emit(d, 'legendAppear', { id: sp.id, uid: lf.uid });
      return lf;
    }
    if (!sp.school || o.single) return addFish(d, sp, o);
    // Kŕdeľ: spoločný smer a tempo, rozostúpení za sebou (za okrajom), aby vplávali v rade.
    var r = d._.r.spawn, n = r.int(4, 7), dir = o.dir || r.sign();
    var sr = SPEED[sp.size] || SPEED[16], sp0 = r.range(sr[0], sr[1]);
    var first = null;
    for (var i = 0; i < n; i++) {
      var x0 = o.x != null ? o.x : (dir > 0 ? -OFF : PW + OFF);
      var f = addFish(d, sp, {
        dir: dir, speed: sp0 * r.range(0.95, 1.05),
        x: x0 - dir * i * r.range(10, 16), depth: o.depth + r.range(-SCHOOL_DY, SCHOOL_DY),
      });
      if (!first) first = f;
    }
    return first;
  }

  function naturalFish(d, dt) {
    d._.fishNext -= dt;
    if (d._.fishNext > 0) return;
    var r = d._.r.spawn;
    d._.fishNext = r.range(0.5, 1.5) / Math.max(0.01, T.fishSpawnPerSec);
    var n = 0;
    for (var i = 0; i < d.fish.length; i++) if (!d.fish[i].legend) n++;
    if (n >= T.fishMax) return;
    var lo = Math.max(0, d.hook.depth - T.fishSpawnAbove), hi = d.hook.depth + T.fishSpawnBelow;
    var cands = [], list = d._.loc.fish;
    for (var k = 0; k < list.length; k++) {
      var sp = list[k], rg = speciesRange(d, sp);
      if (rg[1] < lo || rg[0] > hi) continue;
      if (!eligible(d, sp)) continue;
      cands.push(sp);
    }
    if (!cands.length) return;
    var pick = r.weighted(cands, function (s) { return isConditional(s) ? T.condSpawnWeight : 1; });
    var rg2 = speciesRange(d, pick);
    var depth = U.clamp(d.hook.depth + r.range(-T.fishSpawnAbove, T.fishSpawnBelow), rg2[0], rg2[1]);
    spawnFish(d, pick, { depth: depth });
  }

  // DOSAH ZÁBERU (m): o koľko hlbšie pod háčikom smie začínať rozsah hĺbok druhu, aby ešte zabral.
  // Ryba zbadá návnadu v T.attractRadius a pláva k nej rovno — aj MIMO svojho rozsahu hĺbok;
  // vlnenie ju pred tým zdvihne až o 2 × WOB_A a člen kŕdľa začína až SCHOOL_DY nad rozsahom.
  // Revízia 2026-09-27: pravidlo "vlasec, ktorého maxDepth <= depth[0], k druhu nedosiahne" bolo
  // nepravdivé — mureňa [100, 200] brala háčik zaparkovaný na konci konopného vlasca (100 m) a trofejný
  // kus (12 kg ťahu) ho istotne pretrhol; namerané: rozsah od 124 m ešte berie, od 126 m už nie.
  // data.test.js počíta dosah vlasca týmto číslom, tests/unit/line_reach.test.js ho overuje ponorom.
  function reachM(sp) {
    return Math.max(T.attractRadius, T.biteRadius) / T.pxPerM + 2 * WOB_A + (sp && sp.school ? SCHOOL_DY : 0);
  }

  function removeFish(d, f) {
    var i = d.fish.indexOf(f);
    if (i >= 0) d.fish.splice(i, 1);
    if (f.legend && d._.legendUid === f.uid) d._.legendUid = null;
  }

  function updateFish(d, dt, canBite) {
    var h = d.hook, ppm = T.pxPerM;
    var lure = canBite && hasBait(d);
    var bitten = null;
    for (var i = d.fish.length - 1; i >= 0; i--) {
      var f = d.fish[i], sp = I().sp[f.id];
      f.cool = Math.max(0, f.cool - dt);
      var dx = h.x - f.x, dy = (h.depth - f.depth) * ppm, dist = Math.sqrt(dx * dx + dy * dy);
      var match = baitMatch(d.bait.id, sp);
      if (f.state === 'swim' && lure && match !== 'bad' && f.cool <= 0 && dist < T.attractRadius && !bitten) f.state = 'approach';
      if (f.state === 'approach') {
        if (!lure || dist > T.attractRadius * 1.5) {
          f.state = 'swim';
        } else if (dist > 1e-6) {
          var v = f.speed * T.approachMult, stp = Math.min(dist, v * dt);
          f.x += dx / dist * stp;
          f.depth += dy / dist * stp / ppm;
          if (Math.abs(dx) > 0.5) f.dir = dx > 0 ? 1 : -1;
        }
      } else {
        f.x += f.dir * f.speed * (f.state === 'flee' ? T.fleeMult : 1) * dt;
        f.depth += WOB_A * WOB_W * Math.cos(WOB_W * d.t + f.wob) * dt;
        if (f.state === 'flee' && f.cool <= 0) {
          f.state = 'swim';
          // "Skúsi znova" — otočí sa späť k háčiku; po dvoch odmietnutiach odpláva nadobro.
          if (f.refusals < 2) f.dir = h.x > f.x ? 1 : -1;
        }
      }
      f.depth = Math.max(0.5, f.depth);
      dx = h.x - f.x; dy = (h.depth - f.depth) * ppm; dist = Math.sqrt(dx * dx + dy * dy);
      var inside = dist <= T.biteRadius;
      if (inside && !f.inBite && lure && f.cool <= 0 && !bitten) {
        // Kocka sa hádže RAZ pri vstupe do dosahu (znova až po vyjdení alebo po cooldowne).
        if (d._.r.bite.next() < biteChance(d, sp)) {
          bitten = f;
        } else {
          f.cool = T.biteCooldown;
          f.refusals++;
          f.state = 'flee';
          f.dir = f.x < h.x ? -1 : 1;
        }
      }
      f.inBite = inside;
      var gone = (f.dir > 0 && f.x > PW + DESPAWN_PX) || (f.dir < 0 && f.x < -DESPAWN_PX) ||
        Math.abs(f.depth - h.depth) > FAR_M;
      if (gone && f !== bitten) {
        // Legenda odplávala bez záberu — UI vráti hudbu z 'legend' (nález #15). Záber (startFight)
        // legendu odoberie inou cestou, takže tam udalosť nevznikne.
        if (f.legend && d._.legendUid === f.uid) emit(d, 'legendLeave', { id: f.id, uid: f.uid });
        removeFish(d, f);
      }
    }
    if (bitten) startFight(d, bitten);
  }

  // ------------------------------------------------------------------ boj
  function startFight(d, f) {
    var sp = I().sp[f.id];
    removeFish(d, f);
    // Obtiažnosť si boj spočíta sám z druhu a váhy (sim/fight.js). Nováčik = prvé T.noviceFights bojov
    // kariéry (DiveOpts.noviceFights = koľko ich ešte ostáva na začiatku ponoru).
    d.fight = HL.fight.create({
      species: sp, weight: f.w, lineKg: f.lineKg, rng: d._.r.fight,
      rod: d._.gear.rod, hook: d._.gear.hook, latencyMs: d._.latencyMs, perks: d.perks,
      novice: d.stats.fights < d._.noviceFights,
    });
    d.fightFish = { id: f.id, w: f.w, lineKg: f.lineKg, legend: f.legend, tier: f.tier || null, x: d.hook.x, depth: d.hook.depth, m: d.clock, uid: f.uid };
    d.state = 'fight';
    d.stats.fights++;
    d._.yankT = d._.r.haz.range(1.5, 3);
    d._.boltT = d._.r.haz.range(1.5, 3);
    emit(d, 'bite', { id: f.id, legend: f.legend, w: f.w, tier: f.tier || null });
    emit(d, 'fightStart', { id: f.id, legend: f.legend, rhythm: d.fight.rhythmType, tier: f.tier || null, difficulty: d.fight.difficulty, novice: d.fight.novice });
  }

  function endFight(d) {
    d.fight = null;
    d.fightFish = null;
    d.state = 'dive';
  }

  function fightStep(d, dt, inp) {
    var f = d.fight;
    if (inp.tap) {
      var r = HL.fight.tap(f);
      if (r === 'good') { d.stats.goodTaps++; emit(d, 'tapGood', { progress: f.progress }); }
      else if (r === 'bad') { d.stats.badTaps++; emit(d, 'tapBad', { spikeKg: T.redSpikeFrac * f.lineKg }); }
    }
    var ev = HL.fight.update(f, dt);
    for (var i = 0; i < ev.length; i++) {
      var e = ev[i];
      if (e.type === 'phase') emit(d, 'phase', { kind: e.kind, fake: e.fake, dur: e.dur });
      else if (e.type === 'bossPhase') emit(d, 'bossPhase', { n: e.n });
      else if (e.type === 'landed') {
        var ff = d.fightFish;
        var item = { id: ff.id, w: ff.w, lineKg: ff.lineKg, legend: ff.legend, tier: ff.tier || null, m: ff.m, depth: ff.depth, uid: ff.uid };
        d.onLine.push(item);
        if (ff.legend) d._.caughtNow[ff.id] = true;
        d.stats.landed++;
        endFight(d);
        emit(d, 'landed', { id: item.id, w: item.w, legend: item.legend, tier: item.tier });
        eatBait(d);
        return;
      } else if (e.type === 'escaped') {
        var id = d.fightFish.id;
        d.stats.escaped++;
        endFight(d);
        emit(d, 'escaped', { id: id });
        eatBait(d);
        // Bonusový ponor (majiteľ 2026-10-04: „bonus prichádza s tým, že keď niečo chytáš a utečie, tak zoberie
        // všetko"): ryba, ktorá v boji ujde, vezme so sebou všetko na udici. Vlasec ostáva celý a ponor pokračuje;
        // čo je v lodi (predošlé ponory), sa nemení. Prasknutie má vlastné pravidlo (snap).
        if (d.haul && d.onLine.length) {
          var gone = d.onLine.slice();
          for (var gi = 0; gi < gone.length; gi++) loseItem(d, gone[gi], 'escape');
          refreshLine(d);
          emit(d, 'haulLost', { id: id, lost: gone.length });
        }
        return;
      }
    }
  }

  // ------------------------------------------------------------------ háčik
  function moveHook(d, dt, inp) {
    var h = d.hook, x0 = h.x;
    if (inp.targetX != null && U.isNum(inp.targetX)) {
      h.x = U.damp(h.x, inp.targetX, T.pointerFollow, dt);
    } else if (inp.moveX) {
      h.x += U.clamp(inp.moveX, -1, 1) * T.hookSpeedX * dt;
    }
    h.x += d.current.force * dt;
    h.x = U.clamp(h.x, X_MIN, X_MAX);

    h.vy = 0;
    if (inp.sink && h.depth < d.line.maxDepth) {
      var v = Math.min(T.sinkMax, T.sinkBase + T.sinkPerM * h.depth) * Math.pow(T.perkSink, perkN(d, 'sink'));
      h.depth += v * dt;
      h.vy = v;
    }
    if (h.depth >= d.line.maxDepth) {
      h.depth = d.line.maxDepth;
      h.vy = 0;
      if (!d._.atMax) { d._.atMax = true; emit(d, 'maxDepth', { depth: h.depth }); }
    }
    h.sinking = h.vy > 0;
    if (h.depth > d.maxDepthReached) d.maxDepthReached = h.depth;

    var dx = h.x - x0;
    var moved = h.sinking || (dt > 0 && Math.abs(dx) / dt >= T.stillSpeedPx);
    d._.moved = moved;
    h.still = moved ? 0 : h.still + dt;
    shakeTrack(d, dx);

    var z = HL.world.zoneAt(h.depth, d.mode === 'endless', d.location);
    if (z.id !== d.zone) {
      d.zone = z.id;
      emit(d, 'zone', { id: z.id, name: z.name });
    }
  }

  // Zmena smeru háčika sa počíta, až keď predošlý úsek meral aspoň T.octopusLegPx — drobné
  // chvenie prstom chobotnicu nestrasie, rázne trhanie zo strany na stranu áno (dizajn 9.2).
  function shakeTrack(d, dx) {
    var s = d._.shake;
    var dir = dx > 1e-9 ? 1 : dx < -1e-9 ? -1 : 0;
    if (!dir) return;
    if (s.dir === 0) { s.dir = dir; s.leg = Math.abs(dx); return; }
    if (dir === s.dir) { s.leg += Math.abs(dx); return; }
    var counted = s.leg >= T.octopusLegPx;
    s.dir = dir;
    s.leg = Math.abs(dx);
    if (counted && d.octopus && d.octopus.attached) {
      d.octopus.rev.push(d.t);
      pruneOcto(d);
      emit(d, 'octopusShake', { n: d.octopus.shakes });
    }
  }
  function pruneOcto(d) {
    var o = d.octopus;
    while (o.rev.length && d.t - o.rev[0] > T.octopusWindowSec) o.rev.shift();
    o.shakes = o.rev.length;
  }

  // ------------------------------------------------------------------ nebezpečenstvá
  function spawnJelly(d, o) {
    var r = d._.r.haz, dir = o.vx != null ? (o.vx >= 0 ? 1 : -1) : r.sign();
    var j = {
      uid: ++d._.uid,
      x: o.x != null ? o.x : (dir > 0 ? -OFF : PW + OFF),
      depth: Math.max(0.5, o.depth),
      vx: o.vx != null ? o.vx : dir * r.range(6, 12),
      bob: r.range(0, 6.2832), hit: false,
    };
    d.jellies.push(j);
    return j;
  }

  function jellyStep(d, dt, active) {
    var H = d._.loc.hazards.jelly, h = d.hook, r = d._.r.haz;
    if (active) {
      var inZone = h.depth >= H.from && h.depth <= H.to;
      var rate = inZone ? H.perMin / 60 * (d.env.weather === 'rain' ? H.rainMult : 1) * T.jellyRateMult : 0;
      if (rate > 0 && r.next() < rate * dt) spawnJelly(d, { depth: h.depth + r.range(-25, 50) });
      // Legenda s medúzami: medúzy mierené priamo na stojaci háčik.
      if (d.fight && d.fight.legend && (d.fight.species.hazards || []).indexOf('jelly') >= 0) {
        var lr = H.perMin / 60 * T.legendJellyMult;
        if (r.next() < lr * dt) {
          var side = r.sign();
          spawnJelly(d, { x: side > 0 ? -OFF : PW + OFF, depth: h.depth + r.range(-2, 2), vx: side * r.range(8, 14) });
        }
      }
    }
    var immune = perkN(d, 'jellyImmune') > 0;
    for (var i = d.jellies.length - 1; i >= 0; i--) {
      var j = d.jellies[i];
      j.x += j.vx * dt;
      j.depth += 0.6 * Math.cos(1.1 * d.t + j.bob) * dt;
      var dx = Math.abs(h.x - j.x), dy = Math.abs(h.depth - j.depth) * T.pxPerM;
      if (active && !j.hit && !immune && dx < JELLY_R && dy < JELLY_R) {
        j.hit = true;
        d.jellyHits.push({ until: d.t + T.jellySec });
        d.stats.jelly++;
        emit(d, 'jelly', { uid: j.uid, until: d.t + T.jellySec });
      }
      if ((j.vx > 0 && j.x > PW + DESPAWN_PX) || (j.vx < 0 && j.x < -DESPAWN_PX) || Math.abs(j.depth - h.depth) > FAR_M) d.jellies.splice(i, 1);
    }
    for (var k = d.jellyHits.length - 1; k >= 0; k--) if (d.jellyHits[k].until <= d.t) d.jellyHits.splice(k, 1);
  }

  function spawnRock(d, o) {
    var r = d._.r.haz;
    var size = o.size || r.pick(['s', 'm', 'm', 'l']);
    var wh = ROCKS[size] || ROCKS.m;
    var rock = {
      uid: ++d._.uid, size: size,
      x: o.x != null ? o.x : r.range(12, PW - 12),
      depth: o.depth, w: wh[0], h: wh[1], hit: false,
    };
    d.rocks.push(rock);
    return rock;
  }

  function rockStep(d, dt, active) {
    var H = d._.loc.hazards.rock, h = d.hook, r = d._.r.haz;
    var to = d.mode === 'endless' ? Infinity : H.to;
    if (active && d.state === 'dive') {
      // Skaly vznikajú POD háčikom (mimo obrazovky), aby sa k nim dalo doklesať a vyhnúť sa im.
      var at = h.depth + r.range(105, 140);
      if (at >= H.from && at <= to && r.next() < H.perMin / 60 * T.rockRateMult * dt) spawnRock(d, { depth: at });
    }
    for (var i = d.rocks.length - 1; i >= 0; i--) {
      var k = d.rocks[i];
      if (active && !k.hit && Math.abs(h.x - k.x) <= k.w / 2 && Math.abs(h.depth - k.depth) * T.pxPerM <= k.h / 2) {
        k.hit = true;
        d.stats.rock++;
        if (perkN(d, 'rockProof') > 0) {
          emit(d, 'rock', { uid: k.uid, blocked: true, loss: 0 });
        } else {
          d._.rockMult *= 1 - T.rockStrengthLoss;
          refreshLine(d);
          emit(d, 'rock', { uid: k.uid, blocked: false, loss: T.rockStrengthLoss, strength: d.line.strength });
        }
      }
      if (k.depth < h.depth - 150 || k.depth > h.depth + 300) d.rocks.splice(i, 1);
    }
  }

  // ------------------------------------------------------------------ predátori
  function dangerMult(d) {
    return (d.mode === 'endless' ? T.endlessDanger : 1) * (d.env.weather === 'storm' ? T.stormPredatorMult : 1);
  }

  function spawnShark(d, o) {
    o = o || {};
    var r = d._.r.pred;
    d.shark = {
      phase: 'warn', t: 0, side: o.side || r.sign(), y: o.y != null ? o.y : r.range(-50, 40), depth: 0,
      delay: T.sharkDelaySec + T.perkSharkSlowSec * perkN(d, 'sharkSlow'),
    };
    d.shark.depth = d.hook.depth + d.shark.y / T.pxPerM;
    emit(d, 'sharkWarn', { side: d.shark.side, delay: d.shark.delay });
    return d.shark;
  }

  function mostValuable(d) {
    var best = null, bv = -Infinity;
    for (var i = 0; i < d.onLine.length; i++) {
      var v = d._.priceFn(d.onLine[i]);
      if (v > bv) { bv = v; best = d.onLine[i]; }
    }
    return best ? { item: best, value: bv } : null;
  }

  function loseItem(d, item, cause) {
    var i = d.onLine.indexOf(item);
    if (i >= 0) d.onLine.splice(i, 1);
    var l = { id: item.id, w: item.w, legend: item.legend, tier: item.tier || null, m: item.m, depth: item.depth, cause: cause };
    d.lost.push(l);
    return l;
  }

  function sharkStep(d, dt) {
    var s = d.shark;
    s.t += dt;
    s.depth = d.hook.depth + s.y / T.pxPerM;
    if (s.phase === 'warn' && s.t >= s.delay) {
      s.phase = 'attack';
      s.t = 0;
      var mv = mostValuable(d);
      if (mv) {
        loseItem(d, mv.item, 'shark');
        d.stats.sharkEats++;
        emit(d, 'sharkEat', { id: mv.item.id, w: mv.item.w, value: mv.value });
      }
    } else if (s.phase === 'attack' && s.t >= 0.35) {
      s.phase = 'leave';
      s.t = 0;
    } else if (s.phase === 'leave' && s.t >= T.sharkLeaveSec) {
      d.shark = null;
      emit(d, 'sharkLeave', {});
    }
  }

  // Chobotnica má dve fázy (nález #2/#7):
  //   'warn'     priplýva zboku k háčiku T.octopusWarnSec (udalosť octopusWarn), BEZ záťaže.
  //              Obrana v tejto chvíli: HORE (výstup ju zruší). Počas boja čaká — háčik sa vtedy
  //              nedá strasť ani vytiahnuť, takže by sa chytila bez šance na odpoveď.
  //   'attached' chytí sa (octopusGrab) a záťaž nabieha lineárne T.octopusRampSec (o.load 0..1,
  //              v kroku prichytenia 0). Trhanie zo strany na stranu ju strasie ako doteraz.
  // attached je true iba vo fáze 'attached' (čítajú ho tension.js, UI aj autopilot).
  function spawnOctopus(d, o) {
    o = o || {};
    var r = d._.r.pred, side = o.side === 1 || o.side === -1 ? o.side : r.sign();
    var x0 = side > 0 ? PW + OFF : -OFF, dy0 = r.range(4, 14);
    d.octopus = {
      phase: 'warn', attached: false, t: 0, warnT: 0, load: 0, shakes: 0, side: side,
      x: x0, depth: Math.max(0, d.hook.depth + dy0), x0: x0, dy0: dy0, rev: [],
    };
    emit(d, 'octopusWarn', { x: x0, depth: d.octopus.depth, sec: T.octopusWarnSec });
    return d.octopus;
  }

  function octoStep(d, dt) {
    var o = d.octopus;
    o.t += dt;
    if (o.phase === 'warn') {
      if (d.state !== 'fight') o.warnT += dt;
      var k = Math.min(1, o.warnT / T.octopusWarnSec);
      o.x = o.x0 + (d.hook.x - o.x0) * k;
      o.depth = Math.max(0, d.hook.depth + o.dy0 * (1 - k) - 4 * k);
      if (k < 1) return;
      o.phase = 'attached';
      o.attached = true;
      o.t = 0;
      o.load = 0;
      d._.shake = { dir: 0, leg: 0 };
      emit(d, 'octopusGrab', { loadKg: T.octopusLoadKg, rampSec: T.octopusRampSec });
      return;
    }
    o.load = Math.min(1, o.t / T.octopusRampSec);
    o.x = d.hook.x;
    o.depth = Math.max(0, d.hook.depth - 4);
    pruneOcto(d);
    if (o.shakes >= T.octopusShakes) {
      d.octopus = null;
      emit(d, 'octopusOff', { t: o.t });
    }
  }

  function spawnEel(d) {
    var r = d._.r.pred;
    d.shadowEel = { x: r.range(20, PW - 20), depth: d.hook.depth + r.range(-8, 8), t: 0, still: 0, stay: T.eelStaySec, side: r.sign() };
    emit(d, 'eelWarn', { stillSec: T.eelStillSec });
    return d.shadowEel;
  }

  function eelStep(d, dt) {
    var e = d.shadowEel;
    e.t += dt;
    // Krúži okolo háčika (len vizuál).
    e.x = U.clamp(d.hook.x + Math.cos(e.t * 0.9) * 40 * e.side, X_MIN, X_MAX);
    e.depth = d.hook.depth + Math.sin(e.t * 0.9) * 10;
    if (d.state === 'dive') {
      e.still = d._.moved ? 0 : e.still + dt;
      if (e.still > T.eelStillSec) {
        emit(d, 'eelBite', { still: e.still });
        d.shadowEel = null;
        snap(d, 'eel');
        return;
      }
    }
    if (e.t >= e.stay) {
      d.shadowEel = null;
      emit(d, 'eelLeave', {});
    }
  }

  function predators(d, dt, active) {
    var P = d._.loc.predators, r = d._.r.pred, h = d.hook, dm = dangerMult(d);
    if (active) {
      if (!d.shark && d.onLine.length && h.depth >= P.shark.from && r.next() < T.sharkPerMin / 60 * dm * dt) spawnShark(d);
      // Nie počas boja: háčik vtedy stojí a HORE nejde, na chobotnicu by sa nedalo odpovedať.
      if (!d.octopus && d.state !== 'fight' && h.depth >= P.octopus.from && r.next() < T.octopusPerMin / 60 * dm * dt) spawnOctopus(d);
      if (!d.shadowEel && h.depth >= P.shadowEel.from && r.next() < T.eelPerMin / 60 * dm * dt) spawnEel(d);
    }
    if (d.shark) sharkStep(d, dt);
    if (d.octopus) octoStep(d, dt);
    if (d.shadowEel && d.state !== 'snapped') eelStep(d, dt);
  }

  // ------------------------------------------------------------------ počasie a legendy
  function weatherStep(d, dt) {
    var c = d.current, r = d._.r.weather;
    var storm = d.env.weather === 'storm';
    if (storm) {
      c.t -= dt;
      if (c.t <= 0) { c.target = r.sign() * T.currentForce * r.range(0.5, 1); c.t = r.range(3, 6); }
      d._.lightT -= dt;
      if (d._.lightT <= 0) { d._.lightT = r.range(5, 12); emit(d, 'lightning', { strong: false }); }
    } else {
      c.target = 0;
    }
    // Prúd sa rozbieha plynule (~1 s), aby sa háčik nedal "vytrhnúť" jedným krokom.
    c.force = U.approach(c.force, c.target, Math.max(1, T.currentForce) * dt);
  }

  function legendHazards(d, dt) {
    var f = d.fight;
    var hz = (f && f.legend && f.species.hazards) || [];
    if (hz.indexOf('current') >= 0) {
      d._.yankT -= dt;
      if (d._.yankT <= 0) {
        d._.yankT = d._.r.haz.range(2.5, 4.5);
        var kg = T.currentYankFrac * f.lineKg;
        d.hazardSpikes.push({ t: d.t, kg: kg });
        emit(d, 'yank', { kg: kg });
      }
    }
    if (hz.indexOf('lightning') >= 0) {
      d._.boltT -= dt;
      if (d._.boltT <= 0) {
        d._.boltT = d._.r.haz.range(3, 6);
        var kb = T.lightningSpikeFrac * f.lineKg;
        d.hazardSpikes.push({ t: d.t, kg: kb });
        emit(d, 'lightning', { strong: true, kg: kb });
      }
    }
    while (d.hazardSpikes.length && d.t - d.hazardSpikes[0].t >= T.spikeDecaySec) d.hazardSpikes.shift();
  }

  function legendSpawn(d, dt) {
    // Nekonečná hlbina nemá dedinu ani trh (dizajn 12.2): chytená legenda by sa zapísala, ale jej
    // "veľký zisk" by sa nikdy nevyplatil a kariéra by ju už neukázala (nález #1).
    if (d.mode === 'endless') return;
    if (d._.legendUid != null || (d.fight && d.fight.legend)) return;
    var h = d.hook, cands = [], Ls = d._.loc.legends;
    for (var i = 0; i < Ls.length; i++) {
      var L = Ls[i];
      if (d._.caught[L.id] || d._.caughtNow[L.id]) continue;
      if (h.depth < L.depth[0] || h.depth > L.depth[1]) continue;
      if (!eligible(d, L)) continue;
      cands.push(L);
    }
    if (!cands.length) return;
    var r = d._.r.legend;
    var rate = T.legendPerMin / 60 * (d.bait.id === 'gold' ? D.goldLegendSpawnMult : 1);
    if (r.next() >= rate * dt) return;
    var L2 = cands.length === 1 ? cands[0] : r.pick(cands);
    spawnFish(d, L2, { depth: U.clamp(h.depth + r.range(-15, 25), L2.depth[0], L2.depth[1]) });
  }

  // ------------------------------------------------------------------ vlasec, napätie, prasknutie
  function refreshLine(d) {
    d.line.strength = d.line.base * Math.pow(T.perkStrength, perkN(d, 'strength')) * d._.rockMult;
    d.line.damage = 1 - d._.rockMult;
  }

  function refreshLight(d) {
    var lb = d._.lightBonus;
    var night = d.env.period === 'night' ? (lb.night || 0) : 0;
    // Maják svieti len na mori: v jazere je pásmo s indexom Polnoci iné miesto (docs/JAZERO.md).
    var zi = HL.world.isLake(d.location) ? -1 : HL.world.zoneIndex(d.zone);
    var mid = zi >= HL.world.zoneIndex('polnoc') && zi >= 0 ? (lb.midnight || 0) : 0;
    d.light = T.lightRadius + night + mid + T.perkLightPx * perkN(d, 'light');
  }

  function refresh(d) {
    refreshLine(d);
    refreshLight(d);
    d.tension = HL.tension.compute(d);
    return d;
  }

  function tensionStep(d, canSnap) {
    refreshLine(d);
    var tn = HL.tension.compute(d);
    d.tension = tn;
    if (tn.level !== d._.level) {
      emit(d, 'warn', { level: tn.level, prev: d._.level, ratio: tn.ratio });
      d._.level = tn.level;
    }
    if (canSnap && tn.ratio > 1) snap(d, 'tension');
  }

  function snap(d, cause) {
    if (perkN(d, 'knot') > d._.knotsUsed) {
      d._.knotsUsed++;
      var order = d.onLine.slice().sort(function (a, b) { return b.lineKg - a.lineKg; });
      var drop = Math.ceil(order.length / 2);
      for (var i = 0; i < drop; i++) loseItem(d, order[i], 'knot');
      if (d.fight) {
        var id = d.fightFish.id;
        d.stats.escaped++;
        endFight(d);
        emit(d, 'escaped', { id: id });
        eatBait(d);
      }
      d.hazardSpikes.length = 0;
      emit(d, 'knot', { dropped: drop, cause: cause });
      refreshLine(d);
      d.tension = HL.tension.compute(d);
      d._.level = d.tension.level;
      return;
    }
    emit(d, 'snap', { cause: cause, lost: d.onLine.length, ratio: d.tension ? d.tension.ratio : null });
    var items = d.onLine.slice();
    for (var k = 0; k < items.length; k++) loseItem(d, items[k], 'snap');
    if (isFinite(d.bait.count)) d.bait.count = 0;
    d.fight = null;
    d.fightFish = null;
    // Vlasec je preč: predátori nemajú na čo čakať (UI by inak kreslilo zamrznutého žraloka).
    d.octopus = null;
    d.shadowEel = null;
    if (d.shark && d.shark.phase === 'warn') { d.shark.phase = 'leave'; d.shark.t = 0; }
    d.state = 'snapped';
    d._.snapT = 0;
  }

  function finish(d, outcome) {
    var items = outcome === 'surfaced' ? d.onLine : [];
    var cat = items.map(function (c) { return { id: c.id, w: c.w, legend: !!c.legend, tier: c.tier || null, m: c.m, depth: c.depth }; });
    var val = 0;
    if (d._.valueFn) val = d._.valueFn(cat);
    else for (var i = 0; i < cat.length; i++) val += d._.priceFn(cat[i]);
    d.result = {
      outcome: outcome,
      catch: cat,
      lost: d.lost.map(function (l) { return Object.assign({}, l); }),
      baitId: d.bait.id,
      baitLeft: d.bait.count,
      harpoonsLeft: d.harpoons,
      // Vystrelené harpúny: kariéra ich odpočíta zo zásoby (tá sa pri štarte ponoru už nenuluje, #38).
      harpoonsUsed: d._.harpoonsUsed,
      minutes: d.minutes,
      maxDepth: d.maxDepthReached,
      mode: d.mode,
      location: d.location,
      haul: !!d.haul,
      stats: Object.assign({}, d.stats),
      perks: Object.assign({}, d.perks),
      value: val,
    };
    d.state = 'over';
  }

  // Mimo ponoru (výstup, prasknutie) žralok už len odpláva; nič nezje.
  function sharkFade(d, dt) {
    if (!d.shark) return;
    d.shark.t += dt;
    if (d.shark.phase === 'leave' && d.shark.t >= T.sharkLeaveSec) d.shark = null;
  }

  // ------------------------------------------------------------------ výstup HORE
  function startAscend(d) {
    d.state = 'ascend';
    d._.ascT = 0;
    d._.ascFrom = d.hook.depth;
    d.hook.vy = 0;
    d.hook.sinking = false;
    // Úlovok je v bezpečí hneď po stlačení (dizajn 6): žralok odchádza, chobotnica sa pustí.
    if (d.shark && d.shark.phase === 'warn') { d.shark.phase = 'leave'; d.shark.t = 0; }
    d.octopus = null;
    emit(d, 'ascend', { depth: d.hook.depth, fish: d.onLine.length });
  }

  function ascendStep(d, dt) {
    d._.ascT += dt;
    var k = T.ascendSec > 0 ? Math.min(1, d._.ascT / T.ascendSec) : 1;
    d.hook.depth = d._.ascFrom * (1 - U.smooth(k));
    sharkFade(d, dt);
    if (k >= 1) {
      d.hook.depth = 0;
      emit(d, 'surfaced', { fish: d.onLine.length });
      finish(d, 'surfaced');
    }
  }

  // ------------------------------------------------------------------ verejné API
  function create(o) {
    HL.assert(o && (o.mode === 'career' || o.mode === 'endless'), 'dive.create: mode je career|endless');
    HL.assert(U.isNum(o.seed), 'dive.create: seed');
    HL.assert(U.isNum(o.worldSeed), 'dive.create: worldSeed (počasie počas ponoru)');
    HL.assert(U.isNum(o.clock0), 'dive.create: clock0');
    HL.assert(o.env0 && typeof o.env0 === 'object', 'dive.create: env0');
    HL.assert(o.gear && o.gear.line && o.gear.rod && o.gear.hook, 'dive.create: gear { line, rod, hook }');
    HL.assert(U.isNum(o.gear.line.strength) && o.gear.line.strength > 0, 'dive.create: pevnosť vlasca');
    HL.assert(o.bait && typeof o.bait.id === 'string' && typeof o.bait.count === 'number' && o.bait.count >= 0, 'dive.create: bait { id, count }');
    HL.assert(typeof o.maxDepth === 'number' && o.maxDepth > 0, 'dive.create: maxDepth');
    HL.assert(typeof o.priceFn === 'function', 'dive.create: priceFn (žralok a hodnota úlovku)');
    HL.assert(HL.world && HL.fight && HL.tension, 'dive.create: chýba HL.world / HL.fight / HL.tension');
    var loc = HL.world.location(o.location);
    HL.assert(o.mode !== 'endless' || !HL.world.isLake(loc.id), 'dive.create: Nekonečná hlbina je len v mori');

    var r = {};
    for (var i = 0; i < STREAMS.length; i++) r[STREAMS[i]] = HL.rngFor(o.seed >>> 0, 'dive', STREAMS[i]);
    var perks = {};
    for (var k in (o.perks || {})) if (Object.prototype.hasOwnProperty.call(o.perks, k)) perks[k] = o.perks[k] === true ? 1 : o.perks[k];

    var d = {
      mode: o.mode, location: loc.id, t: 0, minutes: 0, clock: o.clock0, env: null,
      state: 'dive',
      hook: { x: PW / 2, depth: 0, vy: 0, still: 0, sinking: false },
      maxDepthReached: 0,
      line: { strength: o.gear.line.strength, base: o.gear.line.strength, maxDepth: o.maxDepth, damage: 0 },
      bait: { id: o.bait.id, count: o.bait.count },
      harpoons: U.isNum(o.harpoons) ? o.harpoons : 0,
      onLine: [], lost: [],
      // Bonusový ponor (DiveOpts.haul, len kariéra): bonus za veľký úlovok, ale ryba, ktorá v boji ujde, vezme všetko.
      haul: !!o.haul && o.mode !== 'endless',
      fish: [], jellies: [], rocks: [], jellyHits: [], hazardSpikes: [],
      current: { force: 0, target: 0, t: 0 },
      shark: null, octopus: null, shadowEel: null,
      fight: null, fightFish: null,
      tension: null, events: [], result: null,
      perkOffer: null, perks: perks,
      nextPerkAt: o.mode === 'endless' ? T.endlessPerkEvery : null,
      stats: { fights: 0, landed: 0, escaped: 0, goodTaps: 0, badTaps: 0, jelly: 0, rock: 0, sharkEats: 0 },
      zone: null, light: 0,
      // vnútorné — UI ich nečíta
      _: {
        r: r, loc: loc, env0: o.env0, worldSeed: o.worldSeed >>> 0, clock0: o.clock0, envMinute: Math.floor(o.clock0),
        gear: o.gear, latencyMs: o.latencyMs || 0, priceFn: o.priceFn,
        valueFn: typeof o.valueFn === 'function' ? o.valueFn : null,
        lightBonus: o.lightBonus || { night: 0, midnight: 0 },
        caught: Object.assign({}, o.legendsCaught || {}), caughtNow: {},
        tutorial: !!o.tutorial,
        noviceFights: U.isNum(o.noviceFights) && o.noviceFights > 0 ? Math.floor(o.noviceFights) : 0,
        uid: 0, fishNext: r.spawn.range(0, 1) / Math.max(0.01, T.fishSpawnPerSec),
        legendUid: null, rockMult: 1, knotsUsed: 0, level: 0, atMax: false, moved: false, harpoonsUsed: 0,
        shake: { dir: 0, leg: 0 }, lightT: r.weather.range(2, 6), yankT: 0, boltT: 0,
        snapT: 0, ascT: 0, ascFrom: 0,
      },
    };
    d.env = makeEnv(d, o.clock0);
    d.zone = HL.world.zoneAt(0, d.mode === 'endless', d.location).id;
    refresh(d);
    d._.level = d.tension.level;
    return d;
  }

  function update(d, dt, inp) {
    d.events = [];
    if (d.state === 'over') return d.events;
    HL.assert(U.isNum(dt) && dt >= 0, 'dive.update: dt');
    inp = inp || NO_INPUT;

    // Výber vylepšenia: simulácia stojí (ani čas, ani ryby), kým hráč nevyberie.
    if (d.state === 'perk') {
      var pick = inp.perkPick;
      if (pick === 0 || pick === 1 || pick === 2) HL.endless.take(d, pick);
      return d.events;
    }

    advanceClock(d, dt);

    if (d.state === 'snapped') {
      d._.snapT += dt;
      updateFish(d, dt, false);
      sharkFade(d, dt);
      if (d._.snapT >= T.snapSec) finish(d, 'snapped');
      return d.events;
    }
    if (d.state === 'ascend') {
      updateFish(d, dt, false);
      ascendStep(d, dt);
      return d.events;
    }

    if (inp.up) {
      if (d.state === 'dive') {
        startAscend(d);
        updateFish(d, dt, false);
        ascendStep(d, dt);
        return d.events;
      }
      emit(d, 'upBlocked', {});
    }

    if (inp.harpoon && d.shark && d.shark.phase === 'warn' && d.harpoons > 0) {
      d.harpoons--;
      d._.harpoonsUsed++;
      d.shark.phase = 'leave';
      d.shark.t = 0;
      emit(d, 'harpoonHit', { left: d.harpoons });
    }

    if (d.state === 'dive') {
      moveHook(d, dt, inp);
    } else {
      // Počas boja sa háčik nehýbe (dizajn 3) a čas státia neplynie (dizajn 9.2).
      d.hook.vy = 0;
      d.hook.sinking = false;
      d._.moved = false;
    }
    if (d.state === 'fight') fightStep(d, dt, inp);

    var active = d.state === 'dive' || d.state === 'fight';
    naturalFish(d, dt);
    updateFish(d, dt, d.state === 'dive');
    if (d.state === 'dive') legendSpawn(d, dt);
    jellyStep(d, dt, active);
    rockStep(d, dt, active);
    weatherStep(d, dt);
    legendHazards(d, dt);
    predators(d, dt, active);
    refreshLight(d);

    if (d.state === 'dive' || d.state === 'fight') tensionStep(d, true);
    else tensionStep(d, false);

    if (d.mode === 'endless' && d.state === 'dive' && d.hook.depth >= d.nextPerkAt && HL.endless) HL.endless.offer(d);
    return d.events;
  }

  function cameraTop(d) { return d.hook.depth - T.hookScreenY / T.pxPerM; }
  function screenY(d, depth) { return (depth - cameraTop(d)) * T.pxPerM; }
  // Odhad hodnoty úlovku na vlasci (HUD, banner pri vynorení). opts.valueFn (kariéra) = predaj po
  // kusoch s klesajúcim dopytom, rovnako ako nadpis výsledku (nález #27); bez nej súčet priceFn.
  function value(d) {
    if (d._.valueFn) return d._.valueFn(d.onLine);
    var s = 0;
    for (var i = 0; i < d.onLine.length; i++) s += d._.priceFn(d.onLine[i]);
    return s;
  }

  function spawn(d, kind, o) {
    o = o || {};
    if (kind === 'fish') {
      var sp = I().sp[o.id];
      HL.assert(sp, 'dive.spawn: neznámy druh ' + o.id);
      return spawnFish(d, sp, { x: o.x, depth: o.depth != null ? o.depth : d.hook.depth, dir: o.dir, speed: o.speed, single: o.single, tier: o.tier });
    }
    if (kind === 'jelly') return spawnJelly(d, { x: o.x, depth: o.depth != null ? o.depth : d.hook.depth, vx: o.vx });
    if (kind === 'rock') return spawnRock(d, { x: o.x, depth: o.depth != null ? o.depth : d.hook.depth, size: o.size });
    if (kind === 'shark') return spawnShark(d, o);
    if (kind === 'octopus') return spawnOctopus(d, o);
    if (kind === 'shadowEel') return spawnEel(d);
    throw new Error('dive.spawn: neznámy druh objektu ' + kind);
  }

  HL.dive = {
    PW: PW,
    create: create,
    update: update,
    cameraTop: cameraTop,
    screenY: screenY,
    value: value,
    spawn: spawn,
    refresh: refresh,
    baitMatch: baitMatch,
    biteChance: biteChance,
    reachM: reachM,
  };
})(globalThis.HL);
