// Výsledok ponoru (dizajn 2 slučka, 4 prasknutie, 12.2 Nekonečná hlbina, 15.5 obrazovka).
//
// Scéna dostane Summary z HL.game.finishDive (§9 + §16) a nič v kariére už NEMENÍ — ryby sú
// v tej chvíli dávno v Chatrči alebo predané (finishDive). Úlohou je povedať hráčovi, čo sa
// stalo, a poslať ho ďalej: na trh (predať), do dediny, alebo späť do Nekonečnej hlbiny.
//
// Rozhodnutia:
// - Tri podoby podľa výsledku: V BEZPEČÍ (kariéra), PRASKOL! (kariéra), Nekonečná hlbina.
//   Každá má iné hlavné tlačidlo — po prasknutí niet čo predávať, "Na trh" by klamalo.
// - Riadky a nadpis majú JEDEN zdroj (nález #27): nadpis = summary.value = predaný nadbytok +
//   náhľad predaja uloženého po kusoch (HL.market.preview, dopyt klesá s každým kusom). Riadok
//   ryby v Chatrči berie svoju cenu zo summary.storedPreview.lines, riadok predanej z sold.lines —
//   súčet riadkov je presne nadpis. (Predtým mal každý kus cenu pri plnom dopyte a tretia
//   sardinka "stála" toľko ako prvá.) Bez storedPreview (starý Summary) dnešná cena kusu.
// - Stratené cestou (žralok, záchranný uzol) sa ukážu aj po šťastnom návrate a v Nekonečnej
//   hlbine (nález #28) — sivé, so štítkom príčiny. Na mobile nie je bočný panel, inak by
//   hráč stratu nikde nevidel.
// - Letný festival (nález #36): počas leta blok "Súťaž dňa" — tvoja najťažšia / cieľ
//   (HL.village.contest), výhra z ponoru (summary.contest) a výplata (summary.prize).
// - Bonus za veľký úlovok (majiteľ 2026-10-04, summary.haul zo sim/game.js): veta pod hodnotou úlovku — suma NAVYŠE
//   k nej, vyplatená už pri vynorení (nadpis ostáva hodnota úlovku = súčet riadkov, #27).
// - Pokračovať v Nekonečnej hlbine posiela { resume: true } — scéna si nechá, kam vedie späť (#23).
// - Vzhľad (vizuálny kritik): plné plochy namiesto šachovnice, nadpis na tmavom páse s 1-px
//   obrysom (červená PRASKOL! mala na modrej kontrast 2:1), vety bežným písmom. Pod úlovkom
//   "Priebeh ponoru" — na mobile bez bočných panelov inak nikde nie je.
// - Tip po prasknutí sa vyberá podľa toho, ČO vlasec pretrhlo: stav ponoru (HL.game.last.state)
//   drží rozklad napätia z okamihu prasknutia (d.tension.parts). Všeobecný tip by nič nenaučil.
// - Koniec hry (unlock 'ending') je samostatný panel NAD výsledkom: najprv oslava, potom
//   bežný výsledok a hra pokračuje (dizajn 12.1: po dohraní sa dá loviť ďalej).
// - ?demo=1|snap|endless|legend|ending (harness): keď scéna nedostane summary, odohrá krátky
//   ponor SKUTOČNOU cestou (startDive → dive.update so vstupom robota → finishDive), aby fotka
//   ukazovala skutočný Summary. Ak by robot cieľ nedosiahol, použije sa vymyslený Summary
//   a sonda to hlási (demo: 'fabricated'). Demo nikdy nezapisuje hráčovu kariéru na disk.
// - Preklad (docs/I18N.md): texty sú v src/data/lang/<kód>/results.js (kľúče ui.results.*) a počítajú sa
//   pri stavbe blokov (vstup do scény) a pri kreslení. Počty cez HL.i18n.plural — celé vety s tvarom
//   podľa počtu ("Stratil si 3 ryby a červíka."), nie lepené z kúskov.
(function (HL) {
  var W = 180, H = 320, M = 6, BAR_Y = 284, ROW_H = 24;

  var st = null;

  function P() { return HL.pal; }
  function F() { return HL.font; }
  var byId = null;
  function species(id) {
    if (!byId) byId = HL.util.byId(HL.data.allFish.concat(HL.data.allLegends));
    return byId[id] || { id: id, name: id };
  }


  function t(k, p) { return HL.i18n.t(k, p); }
  function tp(n, k, p) { return HL.i18n.plural(n, k, p); }
  // Číslo sa pri zalomení nesmie odtrhnúť od jednotky ani od podstatného mena ("3 | ryby",
  // "10 | €", "1 | 500 m"): medzeru za číslicou nahradí nezlomiteľná (písmo ju pozná, F.wrap
  // láme len na obyčajnej medzere).
  // \p{L} = písmeno každého jazyka (zoznam len so slovenskou diakritikou lámal pl "3 | żarłoczne").
  function nb(s) { return String(s).replace(/(\d) (?=[0-9€%\p{L}])/gu, '$1\u00a0'); }
  // HL.util.kg nezoskupuje tisícky ("5000 kg"); legendy vážia aj tisíce kg.
  function kg(w) { return HL.util.kg(w); } // HL.util.kg už oddeľuje tisíce

  // ================================================================== demo (harness)
  var DT = 1 / 60;
  var REACT_S = 0.16; // robot reaguje na zelenú ako človek — falošné pauzy ho oklamú tiež

  function noInput() { return { moveX: 0, targetX: null, sink: false, tap: false, up: false, harpoon: false, perkPick: null }; }

  function fightInput(d, bot, inp) {
    var f = d.fight;
    if (f.phaseN !== bot.phaseKey) { bot.phaseKey = f.phaseN; bot.slackSeen = f.phase === 'slack' ? d.t : -1; }
    var gap = Math.max(0.2, (f.beatSec || HL.T.tapBeatSec || 0.45) + 0.03); // takt TOHTO boja (× tempo ľahkej ryby)
    if (f.phase === 'slack' && bot.slackSeen >= 0 && d.t - bot.slackSeen >= REACT_S && d.t - bot.lastTap >= gap) {
      inp.tap = true; bot.lastTap = d.t;
    }
  }

  // Najbližšia ryba v páse okolo háčika — robot k nej posunie háčik (ako hráč myšou).
  function steer(d, inp, onlyId) {
    var best = null, bd = 1e9;
    for (var i = 0; i < d.fish.length; i++) {
      var fi = d.fish[i];
      if (onlyId && fi.id !== onlyId) continue;
      var dy = (fi.depth - d.hook.depth) * HL.T.pxPerM;
      var dd = Math.abs(dy) + Math.abs(fi.x - d.hook.x) * 0.5;
      if (Math.abs(dy) < 40 && dd < bd) { bd = dd; best = fi; }
    }
    if (best) inp.targetX = best.x;
    return best;
  }

  function threats(d, inp, bot) {
    if (d.shark && d.shark.phase === 'warn' && d.onLine.length) { if (d.harpoons > 0) inp.harpoon = true; else inp.up = true; }
    if ((d.octopus && d.octopus.attached) || d.shadowEel) {
      bot.shakeT += DT;
      if (bot.shakeT > 0.12) { bot.shakeT = 0; bot.shakeDir = -bot.shakeDir; }
      inp.moveX = bot.shakeDir; inp.targetX = null;
    }
  }

  function botDive(plan) {
    var G = HL.game;
    var d = G.startDive({ bait: plan.bait || 'worm', mode: plan.mode || 'career' });
    if (plan.start) plan.start(d);
    var bot = { lastTap: -1, slackSeen: -1, phaseKey: null, shakeDir: 1, shakeT: 0, spawned: false };
    var steps = 0, max = 60 * (plan.maxSec || 300);
    while (d.state !== 'over' && steps++ < max) {
      var inp = noInput();
      if (d.state === 'perk') inp.perkPick = 0;
      else if (d.state === 'fight' && d.fight) fightInput(d, bot, inp);
      else if (d.state === 'dive') plan.policy(d, inp, bot);
      HL.dive.update(d, DT, inp);
    }
    if (d.state !== 'over') throw new Error('demo: ponor sa neskončil');
    return G.finishDive(d);
  }

  // Obyčajný lov: klesni do hĺbky, chyť N rýb, choď HORE.
  function fishPolicy(depth, n, maxT) {
    return function (d, inp, bot) {
      threats(d, inp, bot);
      if (d.onLine.length >= n || d.t > maxT) { inp.up = true; return; }
      if (d.hook.depth < depth) inp.sink = true;
      if (inp.moveX === 0) steer(d, inp);
    };
  }

  var DEMOS = {
    // Stredná kariéra: Krčma s úlohami, čiastočne plná Chatrč, pár známych druhov (rekord).
    '1': function () {
      var s = HL.game.save;
      s.buildings.krcma = Math.max(2, s.buildings.krcma);
      var prior = [{ id: 'sardinka', w: 0.18 }, { id: 'sardinka', w: 0.2 }, { id: 'okun', w: 0.9 }, { id: 'krab', w: 0.8 }];
      prior.forEach(function (it) {
        s.storage.push(it);
        var e = s.encyclopedia[it.id] || (s.encyclopedia[it.id] = { n: 0, maxW: 0, firstDay: 0 });
        e.n++; e.maxW = Math.max(e.maxW, it.w);
      });
      var qs = HL.village.quests(s), depth = 40, n = 3;
      qs.forEach(function (q) {
        if (q.kind === 'depth' && q.count <= 95) depth = Math.max(depth, q.count + 3);
        if (q.kind === 'count' && q.count <= 5) n = Math.max(n, q.count);
      });
      return botDive({ bait: 'worm', maxSec: 240, policy: fishPolicy(depth, n, 200), want: 'surfaced' });
    },
    // Prasknutie: dve ryby na vlasci a potom kŕdeľ medúz (tá istá funkcia ako prirodzený výskyt).
    snap: function () {
      return botDive({
        bait: 'worm', maxSec: 240,
        policy: function (d, inp, bot) {
          threats(d, inp, bot);
          if (d.onLine.length < 2 && d.t < 200) {
            if (d.hook.depth < 45) inp.sink = true;
            steer(d, inp);
            return;
          }
          if (d.hook.depth < 90) inp.sink = true;
          if (!d.jellyHits.length || d.t - (bot.jt || 0) > 0.4) { HL.dive.spawn(d, 'jelly', { x: d.hook.x, depth: d.hook.depth, vx: 0 }); bot.jt = d.t; }
        },
      });
    },
    // Nekonečná hlbina: dva výbery vylepšení (250 m, 500 m), potom HORE.
    endless: function () {
      return botDive({
        mode: 'endless', maxSec: 300,
        policy: function (d, inp, bot) {
          threats(d, inp, bot);
          if (d.hook.depth >= 540 || d.t > 240) { inp.up = true; return; }
          inp.sink = true;
          if (inp.moveX === 0) steer(d, inp);
        },
      });
    },
    // Legenda: Zlatý úhor v Útesoch (ráno a slnečno — prvý deň to platí) → odomkne Dielňu 3.
    legend: function () {
      var s = HL.game.save;
      ['braided', 'master', 'titan'].forEach(function (id) { if (s.gear.owned.indexOf(id) < 0) s.gear.owned.push(id); });
      s.gear.line = 'braided'; s.gear.rod = 'master'; s.gear.hook = 'titan';
      s.baits.shell = 10;
      return botDive({
        bait: 'shell', maxSec: 300,
        policy: function (d, inp, bot) {
          threats(d, inp, bot);
          var got = d.onLine.some(function (c) { return c.legend; });
          if (got || d.t > 260) { inp.up = true; return; }
          if (d.hook.depth < 110) { inp.sink = true; return; }
          if (!bot.spawned) { HL.dive.spawn(d, 'fish', { id: 'zlaty_uhor', x: 20, depth: d.hook.depth }); bot.spawned = true; }
          if (!steer(d, inp, 'zlaty_uhor')) steer(d, inp);
        },
      });
    },
    // Koniec hry: tri legendy, Maják 3, legendárna výbava; háčik pri dne (harness ?depth ako ponor).
    ending: function () {
      var s = HL.game.save;
      s.legends.zlaty_uhor = true; s.legends.hmlista_dama = true; s.legends.kral_burky = true;
      s.buildings.majak = 3; s.buildings.dielna = 3;
      ['legend', 'master', 'titan'].forEach(function (id) { if (s.gear.owned.indexOf(id) < 0) s.gear.owned.push(id); });
      s.gear.line = 'legend'; s.gear.rod = 'master'; s.gear.hook = 'titan';
      s.baits.glow = 10;
      s.stats.dives = Math.max(s.stats.dives, 30);
      return botDive({
        bait: 'glow', maxSec: 400,
        start: function (d) { if (HL.scenario && HL.scenario.dive) HL.scenario.dive(d, { depth: 2850 }); },
        policy: function (d, inp, bot) {
          threats(d, inp, bot);
          var got = d.onLine.some(function (c) { return c.id === 'strazca'; });
          if (got || d.t > 360) { inp.up = true; return; }
          if (!bot.spawned) { HL.dive.spawn(d, 'fish', { id: 'strazca', x: 30, depth: d.hook.depth }); bot.spawned = true; }
          if (inp.moveX === 0 && !steer(d, inp, 'strazca')) inp.moveX = Math.sin(d.t * 3) > 0 ? 1 : -1;
        },
      });
    },
  };

  // Vymyslený Summary — len keď robot nedosiahol cieľ; sonda to hlási ako 'fabricated'.
  function fabricated(kind) {
    var c = function (id, w) { return { id: id, w: w, legend: !!HL.util.byId(HL.data.allLegends)[id], m: HL.game.save.clock, depth: 40 }; };
    var res = { outcome: kind === 'snap' ? 'snapped' : 'surfaced', catch: [], lost: [], baitId: 'worm', baitLeft: Infinity, harpoonsLeft: 0,
      minutes: 3, maxDepth: 42, mode: kind === 'endless' ? 'endless' : 'career', stats: { fights: 3, landed: 2, escaped: 1, goodTaps: 9, badTaps: 2, jelly: 0, rock: 0, sharkEats: 0 }, perks: {}, value: 0 };
    var sum = { result: res, newSpecies: [], records: [], quests: [], unlocks: [], days: 0, income: 0, rank: null, value: 0, stored: [], sold: null };
    if (kind === 'snap') res.lost = [c('okun', 1.1), c('sardinka', 0.2)].map(function (x) { x.cause = 'snap'; return x; });
    else if (kind === 'ending') { res.catch = [c('strazca', 5000)]; sum.unlocks = [{ legend: 'strazca', unlock: 'ending', text: '' }]; sum.newSpecies = ['strazca']; res.maxDepth = 2860; }
    else if (kind === 'legend') { res.catch = [c('zlaty_uhor', 9)]; sum.unlocks = [{ legend: 'zlaty_uhor', unlock: 'dielna3', text: '' }]; sum.newSpecies = ['zlaty_uhor']; res.maxDepth = 112; }
    else if (kind === 'endless') { res.maxDepth = 540; res.perks = { strength: 1, lure: 1 }; sum.rank = 1; }
    else if (kind !== 'empty') { res.catch = [c('okun', 1.1), c('sardinka', 0.2)]; sum.newSpecies = ['okun', 'sardinka']; sum.stored = res.catch.slice(); }
    else { res.maxDepth = 0; res.minutes = 0; } // scéna otvorená bez ponoru: prázdny výsledok, nič vymyslené
    return sum;
  }

  var WANT = { '1': 'surfaced', snap: 'snapped', endless: null, legend: 'surfaced', ending: 'surfaced' };

  function runDemo(kind) {
    if (!DEMOS[kind]) kind = '1';
    // Demo nesmie prepísať hráčovu kariéru na disku, ak niekto otvorí adresu bez ?nosave.
    HL.game.persistOn = false;
    var sum = null, how = 'scripted', err = null;
    try {
      sum = DEMOS[kind]();
      var want = WANT[kind];
      var ok = !want || sum.result.outcome === want;
      if (kind === 'legend' || kind === 'ending') ok = ok && sum.unlocks.length > 0;
      if (!ok) { how = 'fabricated'; err = 'robot nedosiahol cieľ (' + sum.result.outcome + ')'; sum = null; } // i18n-ok: sonda harnessu (demo), pre vývojára
    } catch (e) { how = 'fabricated'; err = String(e && e.message || e); sum = null; }
    if (!sum) sum = fabricated(kind);
    return { summary: sum, how: how, err: err, kind: kind };
  }

  // ================================================================== obsah obrazovky
  // Rada po prasknutí podľa príčiny (pickTip vráti id): text z tabuľky ui.results.tip.<id>, inak 'depth'.
  function tipText(id) {
    switch (id) {
      case 'jelly': return t('ui.results.tip.jelly');
      case 'spikes': return t('ui.results.tip.spikes');
      case 'fight': return t('ui.results.tip.fight');
      case 'octopus': return t('ui.results.tip.octopus');
      case 'hazard': return t('ui.results.tip.hazard');
      case 'eel': return t('ui.results.tip.eel');
      case 'rock': return t('ui.results.tip.rock');
      case 'barrel': return t('ui.results.tip.barrel');   // jadrové jazero: prekážka je sud
      default: return t('ui.results.tip.depth');
    }
  }

  function pickTip(sum) {
    var k = pickTipKind(sum);
    return k === 'rock' && HL.world.isLake(sum.result.location) ? 'barrel' : k;
  }
  function pickTipKind(sum) {
    var last = HL.game.last, d = last && last.summary === sum ? last.state : null;
    var res = sum.result;
    if (d && d.tension && d.tension.parts) {
      var ten = d.tension, p = ten.parts, strength = ten.strength || 1;
      if (ten.ratio <= 1 && res.maxDepth >= 1500) return 'eel';
      var cand = [['jelly', p.jelly], ['spikes', p.spikes], ['fight', p.fight], ['octopus', p.octopus], ['hazard', p.hazard]];
      cand.sort(function (a, b) { return (b[1] || 0) - (a[1] || 0); });
      if ((cand[0][1] || 0) > strength * 0.15) return cand[0][0];
      if (d.line && d.line.damage > 0) return 'rock';
      return 'depth';
    }
    var s = res.stats || {};
    if (s.jelly > 0) return 'jelly';
    if (s.badTaps > 2) return 'spikes';
    if (s.rock > 0) return 'rock';
    return res.maxDepth >= 1500 ? 'eel' : 'depth';
  }

  var UNLOCK = HL.data.unlockText;

  // Riadky úlovku: ktorá ryba ide do Chatrče (cena z náhľadu predaja po kusoch — súčet riadkov
  // = nadpis, #27), ktorú už finishDive predal (cena predaja), a odznaky NOVÝ DRUH (prvý kus
  // druhu) a REKORD (najťažší kus druhu).
  function catchRows(sum) {
    var res = sum.result, stored = sum.stored || [], soldLines = (sum.sold && sum.sold.lines) || [];
    var prev = (sum.storedPreview && sum.storedPreview.lines) || null;
    var si = 0, pi = 0, rows = [], newSeen = {}, heaviest = {};
    res.catch.forEach(function (c) { if (!heaviest[c.id] || c.w > heaviest[c.id].w) heaviest[c.id] = c; });
    for (var i = 0; i < res.catch.length; i++) {
      var c = res.catch[i], isStored = stored.indexOf(c) >= 0, row = { item: c, tags: [] };
      if (res.mode === 'endless') { row.price = null; }
      else if (isStored) {
        // storedPreview.lines idú v poradí summary.stored = poradie úlovku (finishDive)
        row.price = prev && prev[pi] && prev[pi].id === c.id ? prev[pi].price : HL.game.priceOf(c);
        pi++; row.where = 'stored';
      }
      else if (!sum.sold) { row.price = HL.game.priceOf(c); row.where = 'stored'; }
      else { row.price = soldLines[si] ? soldLines[si].price : HL.game.priceOf(c); si++; row.where = 'sold'; row.tags.push([t('ui.results.tag.sold'), 'slate', 'white']); }
      if (c.legend) row.tags.unshift([t('ui.results.tag.legend'), 'yellow', 'ink']);
      // veľký / trofejný kus (sim/specimen.js) — za NOVÝ DRUH a REKORD, pred LEGENDA a PREDANÉ
      if (HL.ui.tierTag(c.tier)) row.tags.unshift(HL.ui.tierTag(c.tier));
      if (sum.newSpecies.indexOf(c.id) >= 0 && !newSeen[c.id]) { newSeen[c.id] = true; row.tags.unshift([t('ui.results.tag.new'), 'cyan', 'ink']); }
      if (sum.records.indexOf(c.id) >= 0 && heaviest[c.id] === c) row.tags.unshift([t('ui.results.tag.record'), 'amber', 'ink']);
      rows.push(row);
    }
    return rows;
  }

  function build(sum, demo, trip) {
    var res = sum.result;
    var s = {
      sum: sum, res: res, demo: demo, t: 0, trip: trip || null,
      kind: res.mode === 'endless' ? 'endless' : res.outcome === 'snapped' ? 'snap' : 'safe',
      rows: catchRows(sum), tip: null, blocks: [], contentH: 0,
      ending: sum.unlocks.some(function (u) { return u.unlock === 'ending'; }),
      fx: HL.fx.create({ seed: 0x51f7, w: W, h: H }), rng: new HL.RNG(0x51f7), fw: 0,
    };
    s.endingOpen = s.ending;
    if (s.kind === 'snap') s.tip = pickTip(sum);
    s.blocks = blocksFor(s);
    s.contentH = s.blocks.reduce(function (a, b) { return a + b.h; }, 0) + 4;
    return s;
  }

  // ------------------------------------------------------------------ bloky zoznamu
  // Každý blok = { h, draw(ctx, y) }; výška je známa vopred (zoznam ju potrebuje už v 1. snímku).
  function wrapH(text, w, opts) { return F().wrap(text, w, opts).length * F().lineHeight(opts); }

  function tag(ctx, xr, y, tg) {
    var F_ = F(), D = HL.draw, w = F_.measure(tg[0], { small: true }) + 4;
    D.rect(ctx, xr - w, y, w, 8, P()[tg[1]]);
    F_.draw(ctx, tg[0], xr - w + 2, y, P()[tg[2]], { small: true });
    return w;
  }

  function fishRow(ctx, y, row, grey) {
    var P_ = P(), F_ = F(), D = HL.draw, c = row.item, sp = species(c.id);
    // Ryba na papierovej dlaždici, stratená ako tieň na tmavej (ten istý jazyk ako Trhovisko a
    // Encyklopédia; tmavý obrys spritu na navy nebolo vidno — vizuálny kritik, 2. kolo, D4).
    HL.ui.fishTile(ctx, c.id, M, y + 1, 30, 21, { dark: grey });
    var price = row.price != null ? HL.util.money(row.price) : '';
    var pw = price ? F_.measure(price) : 0;
    F_.draw(ctx, sp.name, M + 34, y + 2, grey ? P_.grey : P_.white, { maxWidth: W - 2 * M - 38 - pw });
    if (price) F_.draw(ctx, price, W - M - 1, y + 2, grey ? P_.slate : P_.yellow, { align: 'right' });
    var wEnd = M + 34 + F_.draw(ctx, kg(c.w), M + 34, y + 14, grey ? P_.grey : P_.greyLight, { small: true });
    // odznaky sprava doľava v poradí dôležitosti; ktorý by prekryl váhu, sa už nekreslí
    var xr = W - M - 1;
    for (var i = 0; i < row.tags.length; i++) {
      if (xr - F_.measure(row.tags[i][0], { small: true }) - 4 < wEnd + 3) break;
      xr -= tag(ctx, xr, y + 14, row.tags[i]) + 2;
    }
    D.rect(ctx, M, y + ROW_H - 1, W - 2 * M, 1, P_.slateDark);
  }

  // Vety bežným písmom (drobné sa na 1× nedá čítať — vizuálny kritik); drobné len na štítky a čísla.
  function textBlock(text, color, opts) {
    opts = opts || {};
    text = nb(text);
    var w = W - 2 * M - (opts.indent || 0), fo = { small: !!opts.small };
    return { h: wrapH(text, w, fo) + (opts.pad || 4), draw: function (ctx, y) { F().drawWrapped(ctx, text, M + (opts.indent || 0), y, w, color(), fo); } };
  }

  // Príčina straty → štítok. Prasknutie štítok nemá (po prasknutí je stratené všetko).
  function lostTag(cause) {
    if (cause === 'shark') return [t('ui.results.tag.shark'), 'redDark', 'white'];
    if (cause === 'knot') return [t('ui.results.tag.knot'), 'slate', 'white'];
    return null;
  }
  // Stratené ryby ako sivé riadky; vráti ich počet (sonda: lostShown).
  function lostRows(B, lost) {
    lost.forEach(function (l) {
      var lt = lostTag(l.cause), row = { item: l, price: null, tags: lt ? [lt] : [] };
      if (HL.ui.tierTag(l.tier)) row.tags.push(HL.ui.tierTag(l.tier));
      B.push({ h: ROW_H, draw: function (ctx, y) { fishRow(ctx, y, row, true); } });
    });
    return lost.length;
  }

  // Letný festival (#36): súťaž dňa. Kým leto trvá, vždy "tvoja najťažšia / cieľ"; výhra z tohto
  // ponoru a výplata na prelome dňa aj vtedy, keď sa medzitým leto skončilo. Vráti true, ak niečo ukázal.
  function contestBlocks(B, sum, section) {
    var V = HL.village;
    if (sum.result.mode === 'endless' || !V || typeof V.contest !== 'function') return false;
    var c = V.contest(HL.game.save, HL.game.env()), u = HL.util;
    var won = sum.contest && sum.contest.won ? sum.contest : null;
    var prize = sum.prize > 0 ? sum.prize : 0;
    if (!c.active && !won && !prize) return false;
    section(t('ui.results.contest'));
    if (won) {
      B.push(textBlock(t('ui.results.contestWon', { fish: species(won.id).name, kg: kg(won.kg), target: kg(won.targetKg) }),
        function () { return P().greenLight; }, { pad: 2 }));
      B.push(textBlock(won.paid ? t('ui.results.contestPrizePaid', { money: u.money(won.prize) }) : t('ui.results.contestPrizeLater', { money: u.money(won.prize) }),
        function () { return P().white; }, { pad: 4 }));
    } else if (c.active) {
      var mine = c.bestKg > 0 ? kg(c.bestKg) : '—';
      B.push(textBlock(t('ui.results.contestBest', { best: mine, target: kg(c.targetKg) }), function () { return P().white; }, { pad: 2 }));
      var hint = c.won ? t('ui.results.contestWonToday', { money: u.money(c.prize) }) : t('ui.results.contestHint', { money: u.money(c.prize) });
      B.push(textBlock(hint, function () { return P().greyLight; }, { pad: 4 }));
    }
    if (prize && !(won && won.paid)) B.push(textBlock(t('ui.results.contestPrize', { money: u.money(prize) }), function () { return P().greenLight; }, { pad: 4 }));
    return true;
  }

  // Priebeh ponoru (čísla z Result.stats) — na mobile nie je ľavý panel, inak by ich hráč nevidel
  // a pod krátkym úlovkom by ostalo prázdne miesto.
  function statsBlocks(B, res, section) {
    var s = res.stats || {}, n = function (v) { return v | 0; };
    section(t('ui.results.stats'));
    B.push(textBlock(t('ui.results.statsFights', { fights: n(s.fights), landed: n(s.landed), escaped: n(s.escaped) }), function () { return P().greyLight; }, { pad: 1 }));
    B.push(textBlock(t('ui.results.statsTaps', { good: n(s.goodTaps), bad: n(s.badTaps) }), function () { return P().greyLight; }, { pad: 1 }));
    var haz = [];
    if (n(s.jelly)) haz.push(t('ui.results.hazJelly', { n: n(s.jelly) }));
    if (n(s.rock)) haz.push(t(HL.world.isLake(res.location) ? 'ui.results.hazBarrel' : 'ui.results.hazRock', { n: n(s.rock) }));
    if (n(s.sharkEats)) haz.push(t('ui.results.hazShark', { n: n(s.sharkEats) }));
    if (haz.length) B.push(textBlock(t('ui.results.hazards', { list: haz.join(' · ') }), function () { return P().greyLight; }, { pad: 1 }));
  }

  // Výlet (séria ponorov z karty na hladine, ui/dive.js): keď sa končí výsledkom (legenda), jeho súhrn
  // by sa inak stratil — v Prístave ho hráč dostane len po tlačidle PRÍSTAV. Pri 1 ponore je to ten istý údaj.
  function tripBlock(B, s) {
    if (!s.trip || !(s.trip.dives >= 2) || !HL.data.tripLine) return false;
    B.push(textBlock(HL.data.tripLine(s.trip), function () { return P().greyLight; }, { pad: 4 }));
    return true;
  }

  function blocksFor(s) {
    var B = [], sum = s.sum, res = s.res, P_ = P(), u = HL.util;
    var gap = function (h) { B.push({ h: h, gap: true, draw: function () {} }); };
    // keep: nadpis sekcie sa kreslí len spolu s prvým blokom pod ním (nesmie ostať sám nad lištou)
    var section = function (label) { B.push({ h: 14, keep: true, draw: function (ctx, y) { HL.ui.section(ctx, M, y, W - 2 * M, label); } }); };
    s.lostShown = 0; s.contest = false;
    if (s.kind === 'snap') {
      var n = res.lost.length, worm = res.baitId === 'worm';
      var msg = n ? tp(n, worm ? 'ui.results.lostFishWorm' : 'ui.results.lostFishBait') : t(worm ? 'ui.results.lostWorm' : 'ui.results.lostBait');
      B.push(textBlock(msg, function () { return P().white; }, { pad: 6 }));
      s.lostShown = lostRows(B, res.lost);
      gap(8);
      var tipTxt = nb(tipText(s.tip));
      var th = wrapH(tipTxt, W - 2 * M - 22, {}) + 22;
      B.push({ h: th + 6, draw: function (ctx, y) {
        HL.draw.panel(ctx, M, y, W - 2 * M, th, 'dark');
        HL.draw.sprite(ctx, HL.spr.get('icon_warn'), M + 5, y + 5);
        F().draw(ctx, t('ui.results.tipTitle'), M + 20, y + 5, P().amber);
        F().drawWrapped(ctx, tipTxt, M + 6, y + 18, W - 2 * M - 12, P().greyLight, {});
      } });
      if (contestBlocks(B, sum, section)) { s.contest = true; gap(3); }
      tripBlock(B, s);
      statsBlocks(B, res, section);
      return B;
    }
    if (s.kind === 'endless') {
      var rk = sum.rank;
      var rankTxt = rk >= 1 ? t('ui.results.rank', { rank: rk }) : t('ui.results.noRank');
      B.push({ h: 34, draw: function (ctx, y) {
        HL.draw.panel(ctx, M, y, W - 2 * M, 30, 'dark');
        F().draw(ctx, t('ui.results.catchValue'), M + 6, y + 4, P().greyLight, { small: true });
        F().draw(ctx, u.money(sum.value), W - M - 6, y + 3, P().yellow, { align: 'right' });
        HL.draw.sprite(ctx, HL.spr.get('icon_trophy'), M + 5, y + 16);
        F().draw(ctx, rankTxt, M + 20, y + 17, rk >= 1 ? P().white : P().grey, { maxWidth: W - 2 * M - 26 });
      } });
      var perks = Object.keys(res.perks || {}).filter(function (k) { return res.perks[k] > 0; });
      section(t('ui.results.perks'));
      if (!perks.length) B.push(textBlock(t('ui.results.noPerks'), function () { return P().greyLight; }));
      perks.forEach(function (k) {
        var pd = HL.util.byId(HL.data.perks)[k], pn = pd ? pd.name : k;
        var txt = res.perks[k] > 1 ? t('ui.results.perkStack', { perk: pn, n: res.perks[k] }) : pn;
        B.push(textBlock('· ' + txt, function () { return P().greyLight; }, { pad: 2 }));
      });
      gap(4);
      section(t('ui.results.catchCount', { n: res.catch.length }));
      if (!res.catch.length) B.push(textBlock(res.outcome === 'snapped' ? t('ui.results.allLost') : t('ui.results.noCatch'), function () { return P().greyLight; }));
      s.rows.forEach(function (row) { B.push({ h: ROW_H, draw: function (ctx, y) { fishRow(ctx, y, row, res.outcome === 'snapped'); } }); });
      if (res.lost.length) { gap(3); section(t('ui.results.lost')); s.lostShown = lostRows(B, res.lost); }
      gap(4);
      statsBlocks(B, res, section);
      return B;
    }
    // --- V BEZPEČÍ (kariéra)
    if (!res.catch.length) B.push(textBlock(t('ui.results.empty'), function () { return P().greyLight; }, { pad: 6 }));
    s.rows.forEach(function (row) { B.push({ h: ROW_H, draw: function (ctx, y) { fishRow(ctx, y, row, false); } }); });
    if (res.catch.length) {
      B.push({ h: 16, draw: function (ctx, y) {
        F().draw(ctx, t('ui.results.catchValue'), M, y + 3, P().greyLight);
        F().draw(ctx, u.money(sum.value), W - M - 1, y + 3, P().yellow, { align: 'right', shadow: P().plum });
      } });
      // Bonus za veľký úlovok (summary.haul, sim/game.js finishDive): NAVYŠE k hodnote úlovku, vyplatený pri vynorení.
      if (sum.haul) B.push(textBlock(tp(sum.haul.n, 'ui.results.haul', { pct: u.pct(sum.haul.pct), money: u.money(sum.haul.money) }), function () { return P().amber; }));
      var nStored = (sum.stored || []).length;
      if (nStored) {
        var cap = HL.village.storageCap(HL.game.save);
        B.push(textBlock(tp(nStored, 'ui.results.toStorage', { stored: HL.game.save.storage.length, cap: cap }), function () { return P().greyLight; }));
      }
      if (sum.sold && sum.sold.lines.length) {
        var k = sum.sold.lines.length;
        B.push(textBlock(tp(k, 'ui.results.soldOverflow', { money: u.money(sum.sold.total) }), function () { return P().white; }));
      }
    }
    // Stratené cestou hore (žralok) — aj keď ponor dopadol dobre (#28).
    if (res.lost.length) { gap(3); section(t('ui.results.lostOnWay')); s.lostShown = lostRows(B, res.lost); }
    if (sum.quests.length) {
      gap(3);
      section(tp(sum.quests.length, 'ui.results.questsDone'));
      sum.quests.forEach(function (q) {
        var rew = [];
        if (q.reward && q.reward.money) rew.push('+' + u.money(q.reward.money));
        if (q.reward && q.reward.gold) rew.push(tp(q.reward.gold, 'ui.results.rewardGold'));
        var r = rew.join(' · '), qt = nb(q.text);
        var th = wrapH(qt, W - 2 * M - 8, {});
        B.push({ h: th + 16, draw: function (ctx, y) {
          HL.draw.rect(ctx, M, y, 2, th + 11, P().greenLight);
          F().drawWrapped(ctx, qt, M + 6, y, W - 2 * M - 8, P().white, {});
          F().draw(ctx, r, M + 6, y + th + 2, P().greenLight, { small: true });
        } });
      });
    }
    if (sum.unlocks.length) {
      gap(3);
      sum.unlocks.forEach(function (un) {
        var name = species(un.legend).name;
        var text = nb(UNLOCK[un.unlock] || un.text || '');
        var th = wrapH(text, W - 2 * M - 12, {});
        var h = 24 + th;
        B.push({ h: h + 4, draw: function (ctx, y) {
          HL.draw.panel(ctx, M, y, W - 2 * M, h, 'paper');
          HL.draw.sprite(ctx, HL.spr.get('icon_star'), M + 5, y + 5);
          F().draw(ctx, t('ui.results.legend', { name: name }), M + 19, y + 5, P().plum, { maxWidth: W - 2 * M - 24 });
          F().drawWrapped(ctx, text, M + 6, y + 18, W - 2 * M - 12, P().wood, {});
        } });
      });
    }
    if (contestBlocks(B, sum, function (label) { gap(3); section(label); })) s.contest = true;
    if (sum.days > 0) {
      gap(3);
      var dt = tp(sum.days, 'ui.results.daysPassed');
      if (sum.income > 0) dt += ' ' + t('ui.results.aquarium', { money: u.money(sum.income) });
      B.push(textBlock(dt, function () { return P().greyLight; }));
    }
    gap(3);
    tripBlock(B, s);
    statsBlocks(B, res, section);
    // Plná Chatrč = ďalší úlovok sa predá hneď po návrate (finishDive) — oplatí sa to vedieť na trhu.
    var sv = HL.game.save;
    if (sv.storage.length >= HL.village.storageCap(sv)) {
      B.push(textBlock(t('ui.results.storageFull'), function () { return P().amber; }, { pad: 4 }));
    }
    return B;
  }

  // ------------------------------------------------------------------ hlavička výsledku
  // Nadpis s 1-px obrysom z atramentu: červená PRASKOL! mala na modrom pozadí kontrast 2:1
  // (vizuálny kritik). Obrys dá každému okraju písmena kontrast voči atramentu (červená 4,3:1),
  // nech je pod ním čokoľvek — a pás pod nadpisom je aj tak plný atrament.
  var OUTLINE = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]];
  function outlined(ctx, text, x, y, color, opts) {
    var o = {};
    for (var k in opts) if (k !== 'shadow') o[k] = opts[k];
    for (var i = 0; i < OUTLINE.length; i++) F().draw(ctx, text, x + OUTLINE[i][0], y + OUTLINE[i][1], P().ink, o);
    return F().draw(ctx, text, x, y, color, o);
  }

  function drawHeadline(ctx) {
    var P_ = P(), F_ = F(), res = st.res, u = HL.util, y = 26;
    var mins = Math.max(1, Math.round(res.minutes || 0));
    if (st.kind === 'endless') {
      outlined(ctx, isFinite(res.maxDepth) ? u.meters(res.maxDepth) : '—', W / 2, y, P_.cyan, { align: 'center', scale: 2 });
      var sub = res.outcome === 'snapped' ? t('ui.results.endlessSnapped', { min: mins }) : t('ui.results.endlessSafe', { min: mins });
      F_.draw(ctx, sub, W / 2, y + 23, res.outcome === 'snapped' ? P_.red : P_.greyLight, { align: 'center', small: true, maxWidth: W - 12 });
      return;
    }
    var snap = st.kind === 'snap';
    // prasknutie sa na chvíľu zatrasie (fx.offset), bezpečie jemne "vydýchne" — žiadna priehľadnosť
    var o = st.fx.offset();
    outlined(ctx, snap ? t('ui.results.snapped') : t('ui.results.safe'), W / 2 + o.x, y + o.y, snap ? P_.red : P_.greenLight, { align: 'center', scale: 2 });
    var line = t('ui.results.headline', { depth: u.meters(res.maxDepth || 0), min: mins });
    F_.draw(ctx, line, W / 2, y + 23, P_.greyLight, { align: 'center', small: true, maxWidth: W - 12 });
  }

  // ------------------------------------------------------------------ panel konca hry
  function drawEnding(ctx) {
    var P_ = P(), F_ = F(), D = HL.draw;
    D.rect(ctx, 0, 0, W, H, P_.ink); // nočné nebo: plná plocha (hviezdy a ohňostroj na nej svietia)
    // hviezdy: pevné body (semeno), blikanie podľa času — bez náhody za behu
    for (var i = 0; i < 40; i++) {
      var sx = (i * 73) % W, sy = (i * 131) % 120;
      if (Math.floor(st.t * 3 + i) % 5) D.px(ctx, sx, sy, i % 3 ? P_.greyLight : P_.yellow);
    }
    st.fx.draw(ctx, W, H);
    F_.draw(ctx, t('ui.results.ending.title1'), W / 2, 12, P_.amber, { align: 'center', scale: 2, shadow: P_.plum });
    F_.draw(ctx, t('ui.results.ending.title2'), W / 2, 34, P_.amber, { align: 'center', scale: 2, shadow: P_.plum });
    F_.draw(ctx, t('ui.results.ending.caught'), W / 2, 58, P_.white, { align: 'center' });
    var g = HL.spr.fish('strazca', Math.floor(st.t * 4) % Math.max(1, HL.spr.frames('fish_strazca')));
    HL.draw.sprite(ctx, g, Math.floor((W - g.width) / 2), 74);
    var y = 74 + g.height + 8;
    y += F_.drawWrapped(ctx, t('ui.results.ending.text'), M + 4, y, W - 2 * M - 8, P_.greyLight, {});
    y += 8;
    D.rect(ctx, 40, y, W - 80, 1, P_.slate);
    y += 6;
    // vety bežným písmom, drobné len na titulky (paleta, zvuk)
    var credits = [['HLBINA', P_.cyan, false], // i18n-ok: názov hry sa neprekladá
      [t('ui.results.ending.thanks'), P_.white, false], [t('ui.results.ending.palette'), P_.grey, true], [t('ui.results.ending.audio'), P_.grey, true]];
    for (var i2 = 0; i2 < credits.length; i2++) {
      F_.draw(ctx, credits[i2][0], W / 2, y, credits[i2][1], { align: 'center', small: credits[i2][2] });
      y += credits[i2][2] ? 10 : 13;
    }
    y += 4;
    F_.drawWrapped(ctx, t('ui.results.ending.more'), M + 4, y, W - 2 * M - 8, P_.white, {});
    D.rect(ctx, 0, BAR_Y, W, H - BAR_Y, P_.ink);
    HL.w.button(ctx, 'ending_ok', M, BAR_Y + 5, W - 2 * M, 28, t('ui.results.continue'), { style: 'primary', autofocus: true });
  }

  // ------------------------------------------------------------------ bočné panely (PC)
  function drawPanel(ctx, side, w, h) {
    var P_ = P(), F_ = F();
    HL.draw.panel(ctx, 2, 2, w - 4, h - 4, 'dark');
    if (!st) return;
    var rows, y = 26;
    if (side === 'L') {
      F_.draw(ctx, t('ui.results.stats'), 8, 8, P_.amber, { maxWidth: w - 16 });
      var s = st.res.stats || {}, lk = HL.world.isLake(st.res.location);
      rows = [[t('ui.results.panel.fights'), s.fights], [t('ui.results.panel.landed'), s.landed], [t('ui.results.panel.escaped'), s.escaped],
        [t('ui.results.panel.goodTaps'), s.goodTaps], [t('ui.results.panel.badTaps'), s.badTaps],
        [t('ui.results.panel.jelly'), s.jelly], [t(lk ? 'ui.results.panel.barrel' : 'ui.results.panel.rock'), s.rock]];
      // jazero nemá žraloky (D.lakePredators) — riadok „Zjedol žralok 0" by klamal (prekladatelia 2026-10-02)
      if (!lk) rows.push([t('ui.results.panel.shark'), s.sharkEats]);
    } else {
      F_.draw(ctx, t('ui.results.panel.career'), 8, 8, P_.amber);
      var c = HL.game.save.stats, u = HL.util, lkc = HL.world.isLake(st.res.location);
      // rekord hĺbky toho miesta, kde sa práve lovilo (morský rekord pri ponore v jazere by klamal)
      rows = [[t('ui.results.panel.dives'), c.dives], [t('ui.results.panel.caught'), c.caught], [t('ui.results.panel.snaps'), c.snaps],
        [t('ui.results.panel.earned'), u.money(c.earned || 0)],
        lkc ? [t('ui.building.lodenica.deepest'), u.meters(c.deepestLake || 0)] : [t('ui.results.panel.deepest'), u.meters(c.deepest || 0)]];
      if (c.biggest) rows.push([t('ui.results.panel.biggest'), species(c.biggest.id).name + ' ' + kg(c.biggest.w)]);
    }
    // krátka hodnota v tom istom riadku vpravo, dlhá (meno ryby) pod popisom
    for (var i = 0; i < rows.length; i++) {
      var val = String(rows[i][1] == null ? 0 : rows[i][1]);
      F_.draw(ctx, rows[i][0], 8, y + 2, P_.grey, { small: true });
      if (F_.measure(val) + F_.measure(rows[i][0], { small: true }) + 8 <= w - 16) {
        F_.draw(ctx, val, w - 8, y, P_.white, { align: 'right' });
        y += 14;
      } else {
        y += 10 + F_.drawWrapped(ctx, val, 8, y + 10, w - 16, P_.white, {}) + 3;
      }
      HL.draw.rect(ctx, 8, y - 2, w - 16, 1, P_.navy);
    }
  }

  // ------------------------------------------------------------------ scéna
  HL.scenes.def('results', {
    enter: function (p) {
      p = p || {};
      HL.w.nav = true;
      var sum = p.summary || null, demo = null;
      if (!sum && (p.demo || HL.query.demo)) {
        demo = runDemo(String(p.demo || HL.query.demo));
        sum = demo.summary;
      }
      if (!sum) sum = fabricated('empty');
      // Summary skladá sim/game.js; polia, ktoré nemusia byť (starší ponor, iná cesta), doplníme
      // prázdne — scéna nesmie spadnúť na tom, že úloh ani odomknutí nebolo.
      ['newSpecies', 'records', 'quests', 'unlocks', 'stored'].forEach(function (k) { if (!Array.isArray(sum[k])) sum[k] = []; });
      if (!HL.util.isNum(sum.value)) sum.value = HL.util.isNum(sum.result && sum.result.value) ? sum.result.value : 0;
      sum.result.catch = sum.result.catch || [];
      sum.result.lost = sum.result.lost || [];
      st = build(sum, demo, p.trip);
      // ponor v jadrovom jazere sa vracia do Starej elektrárne, morský do dediny (docs/JAZERO.md)
      st.home = HL.world.isLake(sum.result.location) ? 'elektraren' : 'village';
      var endless = st.kind === 'endless';
      if (HL.music) HL.music.set(endless ? 'endless' : st.ending ? 'legend' : 'village');
      if (HL.audio) HL.audio.ambience(endless ? 'sea' : 'village');
      // Jeden zvuk podľa toho, čo je najdôležitejšie (prasknutie si ping zahralo už v ponore).
      if (st.kind === 'snap') st.fx.shake(3, 0.4);
      else if (sum.unlocks.length) HL.ui.sfx('legend');
      else if (sum.quests.length) HL.ui.sfx('quest');
      else if (sum.sold && sum.sold.total > 0) HL.ui.sfx('coin');
      HL.w.setFocus(st.ending ? 'ending_ok' : st.kind === 'safe' ? 'to_market' : st.kind === 'snap' ? 'to_village' : 'to_endless');
    },
    exit: function () { HL.w.nav = false; },

    update: function (dt) {
      st.t += dt;
      st.fx.update(dt);
      if (st.endingOpen) {
        // ohňostroj nad dedinou: čas z dt, polohy z vlastného semena
        st.fw -= dt;
        if (st.fw <= 0) {
          st.fw = 0.35;
          st.fx.emit(st.rng.next() < 0.5 ? 'sparkGood' : 'coins', 20 + st.rng.next() * 140, 20 + st.rng.next() * 90, { n: 12 });
        }
        if (HL.w.clicked('ending_ok') || HL.ui.backPressed()) {
          st.endingOpen = false;
          st.fx.clear();
          HL.w.setFocus('to_market');
        }
        return;
      }
      if (st.kind === 'endless') {
        // resume: Nekonečná hlbina si nechá, kam vedie späť (Maják → dedina), #23
        if (HL.w.clicked('to_endless') || HL.ui.backPressed()) HL.go('endless', { resume: true });
        return;
      }
      if (HL.w.clicked('to_market')) { HL.go('market', { back: st.home || 'village' }); return; }
      if (HL.w.clicked('to_village') || HL.ui.backPressed()) HL.go(st.home || 'village');
    },

    draw: function (ctx) {
      var P_ = P(), D = HL.draw;
      if (st.endingOpen) { drawEnding(ctx); return; }
      // Plné plochy (vizuálny kritik): zoznam na tmavomodrej, nadpis na páse atramentu —
      // šachovnica pod drobným písmom a pod červeným PRASKOL! sa nedala čítať.
      var top = 60;
      D.rect(ctx, 0, 0, W, H, P_.navy);
      D.rect(ctx, 0, 22, W, top - 24, P_.ink);
      drawHeadline(ctx);
      D.rect(ctx, 0, top - 2, W, 1, P_.slateDark);
      var sy = HL.w.beginScroll(ctx, 'res_list', 0, top, W, BAR_Y - top, st.contentH);
      // Zoznam končí celým blokom (vizuálny kritik, 2. kolo, D2: "ďalší riadok vykúka spod lišty").
      var cut = HL.ui.listCut(top, BAR_Y - top, sy), B = st.blocks;
      var y = top + 2;
      for (var i = 0; i < B.length; i++) {
        var end = y + B[i].h;
        if (B[i].keep) { // nadpis + medzery za ním + prvý obsahový blok = jeden celok
          var j = i + 1, yy = end;
          while (j < B.length && (B[j].gap || B[j].keep)) { yy += B[j].h; j++; }
          if (j < B.length) end = yy + B[j].h;
        }
        if (!B[i].gap && !cut.fits(y, end)) break;
        B[i].draw(ctx, y);
        y += B[i].h;
      }
      HL.w.endScroll(ctx);
      HL.ui.moreBelow(ctx, cut, 0, W);
      st.hidden = cut.hidden;
      st.fx.draw(ctx, W, H);
      D.rect(ctx, 0, BAR_Y, W, H - BAR_Y, P_.ink);
      D.rect(ctx, 0, BAR_Y, W, 1, P_.slateDark);
      if (st.kind === 'safe') {
        HL.w.button(ctx, 'to_market', M, BAR_Y + 5, 86, 28, t('ui.results.toMarket'), { style: 'primary', icon: 'icon_money', hotkey: 'KeyT' });
        HL.w.button(ctx, 'to_village', M + 90, BAR_Y + 5, W - 2 * M - 90, 28, t(st.home === 'elektraren' ? 'ui.results.toPlant' : 'ui.results.toVillage'), { hotkey: 'KeyD' });
      } else if (st.kind === 'snap') {
        HL.w.button(ctx, 'to_village', M, BAR_Y + 5, W - 2 * M, 28, t(st.home === 'elektraren' ? 'ui.results.toPlant' : 'ui.results.toVillage'), { style: 'primary' });
      } else {
        HL.w.button(ctx, 'to_endless', M, BAR_Y + 5, W - 2 * M, 28, t('ui.results.continue'), { style: 'primary' });
      }
      var title = st.kind === 'endless' ? t('ui.results.titleEndless') : t('ui.results.title');
      HL.ui.header(ctx, title, { back: false });
    },

    drawPanel: drawPanel,

    probe: function () {
      if (!st) return { ready: false };
      var sum = st.sum, res = st.res;
      return {
        kind: st.kind, outcome: res.outcome, mode: res.mode || 'career',
        rows: st.rows.length, lost: (res.lost || []).length,
        value: sum.value, maxDepth: res.maxDepth,
        newSpecies: sum.newSpecies.length, records: sum.records.length, quests: sum.quests.length,
        unlocks: sum.unlocks.map(function (u) { return u.unlock; }),
        stored: (sum.stored || []).length, soldCount: sum.sold ? sum.sold.lines.length : 0, soldTotal: sum.sold ? sum.sold.total : 0,
        tags: st.rows.map(function (r) { return r.tags.map(function (tg) { return tg[0]; }).join('+'); }),
        tip: st.tip, rank: sum.rank, perks: Object.keys(res.perks || {}).length,
        ending: st.ending, endingOpen: st.endingOpen,
        demo: st.demo ? st.demo.how : null, demoKind: st.demo ? st.demo.kind : null, demoError: st.demo ? st.demo.err : null,
        contentH: st.contentH, hidden: st.hidden || 0, // bloky pod spodným okrajom zoznamu (D2)
        // ceny v riadkoch úlovku (súčet = value v kariére, #27), zobrazené stratené (#28), súťaž (#36)
        rowPrices: st.rows.map(function (r) { return r.price; }),
        lostShown: st.lostShown || 0, contest: !!st.contest,
        haul: sum.haul ? { n: sum.haul.n, pct: sum.haul.pct, money: sum.haul.money } : null,   // bonus za veľký úlovok
        trip: st.trip ? { dives: st.trip.dives, fish: st.trip.fish, value: st.trip.value } : null,
      };
    },
  });
})(globalThis.HL);
