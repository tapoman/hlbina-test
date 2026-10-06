// Lepidlo kariéry (§9): načítanie a uloženie, prostredie, zloženie ponoru (DiveOpts §12)
// a jeho zápis späť do kariéry. Sim vrstva: Date, náhodu ani úložisko prehliadača si
// nevyberá sama — dodá ich main.js cez host = { entropy, storage, month }.
//
// Rozhodnutia, ktoré zmluva nechala sem:
// - ?seed=N bez ?fresh: ak uložená kariéra má iné semeno, hrá sa NOVÁ kariéra s N, ale
//   neukladá sa (persistOn = false). Harness tak dostane opakovateľný svet a hráčova
//   kariéra sa nepremaže len preto, že niekto otvoril odkaz so semenom.
// - Poškodené uloženie (nedá sa prečítať, nález #6): kópia ide pod KEY + '.bad' (ďalšie pod
//   '.bad.1', '.bad.2' … — existujúca kópia sa NIKDY neprepíše, ten istý obsah sa neuloží dvakrát),
//   hrá sa náhradná kariéra v pamäti a persistOn ostáva false, kým hráč nevyberie
//   HL.game.restoreBackup() ("Obnoviť zálohu") alebo HL.game.newCareer() ("Začať odznova").
//   Pôvodný text tak ostane v KEY aj v kópii. Načítané, ale s problémami (validate) →
//   HL.save.repair; zoznam je v HL.game.loadProblems.
// - newCareer: skutočnú kariéru (aspoň 1 ponor) najprv skopíruje pod KEY + '.bak' (nález #16);
//   prázdna kariéra zálohu neprepíše, takže dvojklik na "Nová hra" zálohu nezmaže.
// - Dve karty (nález #30): save.rev rastie pri každom zápise, aj naprieč novou kariérou. Karta si
//   pamätá rev, ktorú naposledy videla alebo zapísala (baseRev). Keď v úložisku nájde vyššiu, iná
//   karta je novšia: HL.game.stale = true, persistOn = false a táto karta už nezapíše nič
//   (ani novú kariéru) — kým sa stránka nenačíta znova. HL.game.checkStale() to zistí vopred.
// - HL.game.storageOk = false, keď úložisko chýba (a nejde o ?nosave) alebo zápis zlyhal (#33).
// - startDive: nesené návnady (min(zásoba, HL.data.baitCarry), červík ∞) odchádzajú zo zásoby
//   hneď — sú "na lodi"; nepoužité vráti applyDive. Zavretá karta uprostred ponoru = nesené
//   návnady stratené ako pri prasknutí (to je cena za neukladanie počas ponoru). Harpúny v zásobe
//   OSTÁVAJÚ (nález #38: zabitá karta ich inak zmazala natrvalo, hoci prasknutie ich vracia);
//   applyDive odpočíta len vystrelené (Result.harpoonsUsed).
// - finishDive (kariéra): úlovok ide do Chatrče (village.store, tie isté objekty), čo sa
//   nezmestí, sa hneď PREDÁ ("čo sa nezmestí, treba predať" — radšej peniaze než ticho
//   stratená ryba). Summary to hlási v stored/sold. Predaj aj uloženie sú idempotentné
//   (príznak sold, kontrola referencie), takže UI smie výsledok ešte raz predať alebo
//   uložiť a nič sa nezdvojí. Dvojité finishDive toho istého ponoru vráti ten istý Summary.
//   summary.value = predaný nadbytok + predaj uloženého po kusoch teraz (HL.market.preview) —
//   to, čo hráč naozaj dostane (nález #27), nie súčet plných cien.
// - Nekonečná hlbina: pevná výbava HL.data.endlessGear, bez peňazí a Chatrče; ceny bez živého
//   trhu (HL.market.neutralPrice, nález #5). Hodnota je jedno číslo v celých eurách:
//   summary.value === result.value === hodnota v rebríčku (HL.endless.record).
// - Udalosť: ?event (ladenie, harness) smie ľubovoľnú udalosť a má prednosť; nastavenie hráča
//   len 'auto' (podľa host.month) alebo 'none' (nález #4/#21/#35).
// - Jazyk (docs/I18N.md): settings.lang (prvýkrát HL.i18n.detect(host.languages)), ?lang= z adresy má
//   prednosť a neukladá sa; G.applyLang() pred prvým snímkom, G.setLang(kód) = voľba hráča (uloží sa).
(function (HL) {
  var G = HL.game = {
    save: null, settings: null, storage: null, persistOn: false,
    current: null, last: null, loaded: false, loadProblems: [], loadError: null, persistError: null,
    eventOverride: null, month: null, langOverride: null, loadErrorDetail: null,
    stale: false, storageOk: true, badKey: null, restoredFrom: null, restoreError: null,
  };
  var D = HL.data, T = HL.T, U = HL.util;
  var entropy = 0, careerN = 0;
  var baseRev = -1;      // revízia v úložisku, ktorú táto karta naposledy videla alebo zapísala
  var MAX_BAD = 20;      // najviac toľko kópií nečitateľného uloženia (.bad, .bad.1 … .bad.19)

  function truthy(v) { return v != null && v !== '0' && v !== 'false' && v !== false; }
  function r2(v) { return Math.round(v * 100) / 100; }

  // Bonus za veľký úlovok (majiteľ 2026-10-04: „bonus keď chytáš naraz viac rýb, že 10, 15 atď."): len v BONUSOVOM
  // ponore (hráč ho zapne v Príprave; cena: útek ryby z boja vezme všetko na udici — sim/dive.js), ryby vytiahnuté
  // JEDNÝM ponorom kariéry (vynorenie — prasknutie berie všetko, result.catch je prázdny). Od haulBonusFrom rýb
  // +haulBonusFirst z hodnoty úlovku, každých ďalších haulBonusStep rýb +haulBonusPerStep, najviac haulBonusMax.
  // Vyplatí sa hneď pri vynorení (finishDive), hodnota = to, čo hráč za úlovok naozaj dostane (summary.value).
  // Čísla sú ODHAD — posuvníky F2 „Úlovok"; first 0 = bonus vypnutý.
  // Prvý stupeň od 5 rýb (majiteľ 2026-10-04: „od 5 rýb by som dal"): 5 → +10 %, 10 → +20 % … 25 → +50 %.
  T.def('Úlovok', 'haulBonusFrom', 5, 2, 40, 1, 'Bonus za veľký úlovok: od koľkých rýb v jednom ponore');
  T.def('Úlovok', 'haulBonusStep', 5, 1, 20, 1, 'Bonus za veľký úlovok: každých ďalších N rýb = ďalší stupeň');
  T.def('Úlovok', 'haulBonusFirst', 0.1, 0, 1, 0.01, 'Bonus za veľký úlovok: prvý stupeň z hodnoty úlovku (0,1 = +10 %; 0 = vypnutý)');
  T.def('Úlovok', 'haulBonusPerStep', 0.1, 0, 1, 0.01, 'Bonus za veľký úlovok: každý ďalší stupeň pridá');
  T.def('Úlovok', 'haulBonusMax', 0.5, 0, 3, 0.05, 'Bonus za veľký úlovok: najviac (strop)');
  // Bonusový ponor nesie viac platenej návnady (majiteľ: „podľa udice, koľko nás pustí kg") — počet rýb má obmedziť
  // vlasec, nie 10 kusov (HL.data.baitCarry). Nepoužité sa vrátia; pri prasknutí sa nesené stratia ako vždy.
  T.def('Úlovok', 'haulBaitCarry', 25, 1, 100, 1, 'Bonusový ponor: koľko kusov platenej návnady nesie (bežný ponor: HL.data.baitCarry)');

  // Koľko kusov platenej návnady nesie ponor: bežný HL.data.baitCarry, bonusový T.haulBaitCarry (Príprava ukazuje to isté).
  G.baitCarry = function (haul) { return haul ? Math.max(1, Math.round(T.haulBaitCarry)) : D.baitCarry; };

  // n rýb na vlasci → { n, level (0 = žiadny), pct (podiel z hodnoty), next (od koľkých rýb ďalší stupeň; null = strop) }.
  G.haulBonus = function (n) {
    var from = Math.max(1, Math.round(T.haulBonusFrom)), step = Math.max(1, Math.round(T.haulBonusStep));
    n = Math.max(0, Math.floor(n || 0));
    if (!(T.haulBonusFirst > 0)) return { n: n, level: 0, pct: 0, next: null };
    if (n < from) return { n: n, level: 0, pct: 0, next: from };
    var level = 1 + Math.floor((n - from) / step);
    var pct = Math.min(T.haulBonusMax, T.haulBonusFirst + (level - 1) * T.haulBonusPerStep);
    var nextPct = Math.min(T.haulBonusMax, T.haulBonusFirst + level * T.haulBonusPerStep);
    return { n: n, level: level, pct: r2(pct), next: nextPct > pct + 1e-9 ? from + level * step : null };
  };

  function parseSeed(v) {
    if (v == null || v === '' || v === true) return null;
    var n = Number(v);
    return isFinite(n) ? (Math.floor(n) >>> 0) : HL.hash(String(v));
  }

  // free = ?event z URL (ladenie): smie ľubovoľnú udalosť. Nastavenie hráča len 'auto'/'none' —
  // sezóna z menu by zdvojnásobila ceny a pustila sezónne legendy celý rok (dizajn 12.3: podľa mesiaca).
  function resolveEvent(ev, month, free) {
    if (!free && ev !== 'none') ev = 'auto';
    if (ev == null || ev === 'auto') return typeof month === 'number' ? HL.world.eventForMonth(month) : null;
    if (ev === 'none') return null;
    return U.byId(D.events)[ev] ? ev : null;
  }

  // Udalosť sa smie zmeniť za behu (nastavenia) — ?event z URL má stále prednosť.
  G.applyEvent = function () {
    var fromUrl = G.eventOverride != null;
    var ev = fromUrl ? G.eventOverride : (G.settings && G.settings.event);
    HL.world.currentEvent = resolveEvent(ev, G.month, fromUrl);
    return HL.world.currentEvent;
  };

  // Jazyk: ?lang= z adresy (G.langOverride) > nastavenie hráča > slovenčina. Vráti jazyk, ktorým sa naozaj píše
  // (HL.i18n.resolve: jazyk bez tabuliek → ďalší vhodný). Texty úloh v uložení sa prepíšu do nového jazyka.
  G.applyLang = function () {
    var want = G.langOverride || (G.settings && G.settings.lang) || HL.i18n.SOURCE;
    var eff = HL.i18n.set(want);
    if (G.save && HL.village && HL.village.refreshTexts) HL.village.refreshTexts(G.save);
    return eff;
  };
  // Voľba hráča v Nastaveniach / na titulke: platí hneď, uloží sa a zruší ?lang= z adresy.
  G.setLang = function (code) {
    if (!HL.i18n.info(code) || !HL.i18n.available(code)) return false;
    G.settings.lang = code;
    G.langOverride = null;
    G.applyLang();
    G.persistSettings();
    return true;
  };

  // Dorovná trh a úlohy na aktuálny čas uloženia (starší save, nová budova).
  function settle(save) {
    HL.market.ensure(save);
    HL.market.advanceDays(save, HL.world.day(save.clock));
    HL.village.quests(save);
  }

  // ------------------------------------------------------------------ úložisko: kópie a zálohy
  function getItem(k) { try { return G.storage ? G.storage.getItem(k) : null; } catch (e) { return null; } }
  function setItem(k, v) { try { G.storage.setItem(k, v); return true; } catch (e) { return false; } }
  function badKey(n) { return HL.save.KEY + '.bad' + (n ? '.' + n : ''); }
  function parse(raw) { try { return HL.save.deserialize(raw); } catch (e) { return null; } }

  // Odloží nečitateľný text pod prvý voľný kľúč .bad, .bad.1, … Existujúcu kópiu nikdy neprepíše
  // a ten istý obsah neuloží znova (inak by každý štart s rozbitým uložením pridal ďalšiu kópiu).
  function keepBad(raw) {
    if (!G.storage || raw == null) return null;
    for (var n = 0; n < MAX_BAD; n++) {
      var k = badKey(n), cur = getItem(k);
      if (cur === raw) return k;
      if (cur == null) return setItem(k, raw) ? k : null;
    }
    return null;
  }

  // Pred prepísaním KEY inou kariérou: skutočná kariéra (aspoň 1 ponor) do .bak, nečitateľný
  // text do .bad. Prázdna kariéra .bak neprepíše (dvojklik na "Nová hra", nález #16).
  function backupCurrent(except) {
    var raw = HL.save.raw(G.storage);
    if (raw == null || raw === except) return;
    var s = parse(raw);
    if (!s) { keepBad(raw); return; }
    if (s.stats && s.stats.dives > 0) setItem(HL.save.KEY + '.bak', raw);
  }

  // Záloha, ktorú by obnovil restoreBackup: najnovšia čitateľná kópia .bad.N … .bad, potom .bak.
  function findBackup() {
    if (!G.storage) return null;
    var keys = [];
    for (var n = MAX_BAD - 1; n >= 0; n--) keys.push(badKey(n));
    keys.push(HL.save.KEY + '.bak');
    for (var i = 0; i < keys.length; i++) {
      var raw = getItem(keys[i]);
      if (raw == null) continue;
      var s = parse(raw);
      if (s) return { key: keys[i], raw: raw, save: s };
    }
    return null;
  }

  // ------------------------------------------------------------------ init
  G.init = function (query, host) {
    query = query || {};
    host = host || {};
    // init je čistá funkcia vstupov: tá istá entropia = tá istá nová kariéra. Počítadlo
    // len rozlišuje ďalšie "Nová hra" v tej istej relácii.
    entropy = host.entropy >>> 0;
    careerN = 0;
    G.month = typeof host.month === 'number' ? host.month : null;
    var nosave = truthy(query.nosave);
    var storage = nosave ? null : (host.storage || null);
    G.storage = storage;
    HL.save.storage = storage;
    // Úložisko chýba, hoci hra ukladať má (súkromné okno) — UI to musí povedať (nález #33).
    G.storageOk = !!storage || nosave;
    G.stale = false; G.persistError = null; G.badKey = null; G.restoredFrom = null; G.restoreError = null;
    G.settings = HL.save.loadSettings(storage);
    G.eventOverride = query.event != null ? String(query.event) : null;
    G.applyEvent();
    // Jazyk (docs/I18N.md): uložená voľba hráča, inak podľa prehliadača (host.languages = navigator.languages);
    // ?lang= z adresy má prednosť, ale neukladá sa (ako ?event=). Platí PRED prvým snímkom.
    HL.i18n.hostLangs = Array.isArray(host.languages) ? host.languages.slice() : host.languages ? [String(host.languages)] : [];
    if (!G.settings.lang) G.settings.lang = HL.i18n.detect(HL.i18n.hostLangs);
    G.langOverride = query.lang != null && HL.i18n.info(String(query.lang)) ? String(query.lang) : null;
    G.applyLang();

    var seed = parseSeed(query.seed);
    var save = null, persistOn = !!storage;
    G.loaded = false; G.loadProblems = []; G.loadError = null; G.loadErrorDetail = null; G.last = null; G.current = null;
    var rev = HL.save.peekRev(storage);
    baseRev = U.isNum(rev) ? rev : -1;
    if (!truthy(query.fresh)) {
      save = HL.save.loadFrom(storage);
      if (!save) {
        var raw = HL.save.raw(storage);
        if (raw != null) {
          // Nečitateľné uloženie: kópia bokom a NEUKLADAŤ, kým hráč nevyberie (restoreBackup /
          // newCareer). Predtým ho prvé uloženie náhradnej kariéry potichu prepísalo (nález #6).
          G.loadError = HL.save.lastError;
          G.loadErrorDetail = HL.save.lastErrorDetail; // technická príčina (bez prekladanej úvodnej vety)
          G.badKey = keepBad(raw);
          persistOn = false;
        }
      } else if (seed != null && save.seed !== seed) {
        save = null;
        persistOn = false;
      } else {
        var p = HL.save.validate(save);
        if (p.length) { G.loadProblems = p; HL.save.repair(save); }
        G.loaded = true;
      }
    }
    if (!save) save = HL.save.fresh(seed != null ? seed : HL.hash(entropy, 'career', careerN++));
    G.save = save;
    G.persistOn = persistOn;
    if (query.money != null && isFinite(Number(query.money))) save.money = Math.max(0, Number(query.money));
    settle(save);
    return save;
  };

  // "Nová hra" / "Začať odznova" — explicitná voľba hráča, preto smie zapisovať aj po chybe načítania.
  // Stará karta (stale) nezapíše nič: prepísala by novší postup z inej karty.
  G.newCareer = function (seed) {
    var s = HL.save.fresh(seed != null ? seed >>> 0 : HL.hash(entropy, 'career', careerN++));
    G.save = s; G.last = null; G.current = null;
    G.loadError = null; G.loadErrorDetail = null; G.loadProblems = []; G.loaded = false;
    settle(s);
    G.persistOn = !!G.storage && !G.checkStale();
    if (G.persistOn) {
      backupCurrent();
      G.persist();
    }
    return s;
  };

  // "Obnoviť zálohu": najnovšia čitateľná kópia .bad.N … .bad, potom .bak (kariéra pred poslednou
  // "Nová hra"). Súčasný obsah KEY sa pred zápisom zálohuje, takže sa obnova dá vrátiť.
  // Vráti true/false; pri neúspechu nič nezmení a G.restoreError povie prečo.
  G.restoreBackup = function () {
    G.restoreError = null;
    if (!G.storage) { G.restoreError = HL.i18n.t('sim.game.noStorage'); return false; }
    if (G.checkStale()) { G.restoreError = G.persistError; return false; }
    var b = findBackup();
    if (!b) { G.restoreError = HL.i18n.t('sim.game.noBackup'); return false; }
    var p = HL.save.validate(b.save);
    if (p.length) HL.save.repair(b.save);
    backupCurrent(b.raw);
    G.save = b.save; G.last = null; G.current = null;
    G.loadError = null; G.loadErrorDetail = null; G.loadProblems = p; G.loaded = true; G.restoredFrom = b.key;
    G.persistOn = true;
    settle(b.save);
    G.persist();
    return true;
  };

  // Pre UI (obrazovka chyby načítania): čo by "Obnoviť zálohu" obnovilo, alebo null.
  G.backupInfo = function () {
    var b = findBackup();
    if (!b) return null;
    var st = b.save.stats || {};
    return { key: b.key, dives: st.dives || 0, money: b.save.money, day: HL.world.day(b.save.clock) };
  };

  // Iná karta zapísala novší stav? Potom táto už nesmie ukladať (nález #30).
  G.checkStale = function () {
    if (!G.storage) return G.stale;
    var cur = HL.save.peekRev(G.storage);
    if (U.isNum(cur) && cur > baseRev) {
      G.stale = true;
      G.persistOn = false;
      G.persistError = HL.i18n.t('sim.game.stale');
    }
    return G.stale;
  };

  G.persist = function () {
    if (!G.save || !G.storage || !G.persistOn) return false;
    if (G.checkStale()) return false;
    var cur = HL.save.peekRev(G.storage);
    if (cur === null) keepBad(HL.save.raw(G.storage)); // nečitateľný obsah pred prepísaním odložiť
    var prev = G.save.rev;
    G.save.rev = Math.max(U.isNum(cur) ? cur : -1, baseRev, U.isNum(prev) ? prev : 0) + 1;
    var ok = HL.save.store(G.save, G.storage);
    if (ok) { baseRev = G.save.rev; G.persistError = null; G.storageOk = true; }
    else { G.save.rev = prev; G.persistError = HL.save.lastError; G.storageOk = false; }
    if (G.settings) HL.save.storeSettings(G.settings, G.storage);
    return ok;
  };

  G.persistSettings = function () {
    G.applyEvent();
    return G.storage ? HL.save.storeSettings(G.settings, G.storage) : false;
  };

  G.hasSave = function () { return HL.save.raw(G.storage) != null; };

  G.env = function (m) { return HL.world.env(G.save, m); };

  G.canEndless = function () { return HL.village.level(G.save, 'majak') >= 3; };
  // Jadrové jazero (docs/JAZERO.md): Lodenica a jazerná výbava. { ok, reason, reasonKey }.
  G.lakeAccess = function () { return HL.village.lakeAccess(G.save); };

  // ------------------------------------------------------------------ ponor
  // DiveOpts bez vedľajších účinkov (zásoba sa tu nemení) — pre prípravu aj testy.
  // req.location = 'jadro' → ponor v jadrovom jazere: jazerný vlasec a prút, háčik a návnady z mora,
  // hĺbka podľa Lodenice. Nekonečná hlbina je vždy na mori.
  G.diveOptions = function (req) {
    req = req || {};
    var save = G.save;
    var mode = req.mode === 'endless' ? 'endless' : 'career';
    var loc = mode === 'career' && HL.world.isLake(req.location) ? HL.world.location(req.location).id : HL.world.SEA;
    var lake = HL.world.isLake(loc);
    var env0 = HL.world.env(save, save.clock);
    var opts = {
      mode: mode,
      location: loc,
      seed: HL.hash(save.seed, 'dive', save.stats.dives),
      worldSeed: save.seed,
      clock0: save.clock,
      env0: env0,
      latencyMs: (G.settings && G.settings.latencyMs) || 0,
      perks: {},
      tutorial: mode === 'career' && save.stats.dives < T.introDives,
      // Bonusový ponor (hráč ho zapne v Príprave): bonus za veľký úlovok, ale útek ryby z boja vezme všetko.
      haul: mode === 'career' && !!req.haul,
      // Prvé boje kariéry sú boje nováčika (sim/fight.js: obtiažnosť 0 + úľava). Nekonečná hlbina nie.
      noviceFights: mode === 'career' ? Math.max(0, Math.round(T.noviceFights) - (save.stats.fights || 0)) : 0,
      legendsCaught: U.deepCopy(save.legends),
      // Cena v tej chvíli ponoru (búrka môže prísť cestou), nie pri štarte.
      priceFn: function (item) {
        var st = G.current && G.current.state;
        var env = st && U.isNum(st.clock) ? HL.world.env(save, st.clock) : env0;
        return HL.market.price(save, item, env);
      },
    };
    if (mode === 'endless') {
      var eg = D.endlessGear;
      opts.gear = { line: U.byId(D.lines)[eg.line], rod: U.byId(D.rods)[eg.rod], hook: U.byId(D.hooks)[eg.hook] };
      opts.harpoons = eg.harpoons;
      opts.bait = { id: eg.bait, count: Infinity };
      opts.maxDepth = Infinity;
      // Bez dediny a trhu (dizajn 12.2): skóre nezávisí od kariérneho obchodovania ani od chvíle (#5).
      opts.priceFn = HL.market.neutralPrice;
    } else {
      var baitId = req.bait || 'worm';
      var b = U.byId(D.baits)[baitId];
      HL.assert(b, 'neznáma návnada ' + baitId);
      if (lake) {
        var acc = HL.village.lakeAccess(save);
        HL.assert(acc.ok, 'na jazero sa nedá: ' + acc.reason);
        opts.gear = { line: U.byId(D.lakeLines)[save.gear.lakeLine], rod: U.byId(D.lakeRods)[save.gear.lakeRod], hook: U.byId(D.hooks)[save.gear.hook] };
      } else {
        opts.gear = { line: U.byId(D.lines)[save.gear.line], rod: U.byId(D.rods)[save.gear.rod], hook: U.byId(D.hooks)[save.gear.hook] };
      }
      opts.harpoons = save.gear.harpoons || 0;
      opts.bait = { id: baitId, count: b.infinite ? Infinity : Math.min(save.baits[baitId] || 0, G.baitCarry(opts.haul)) };
      opts.maxDepth = HL.village.maxDepth(save, loc);
      // Hodnota úlovku na vlasci = predaj po kusoch (dopyt klesá), tá istá ako nadpis výsledku (#27).
      opts.valueFn = function (items) {
        var st = G.current && G.current.state;
        var env = st && U.isNum(st.clock) ? HL.world.env(save, st.clock) : env0;
        return HL.market.preview(save, items, env).total;
      };
    }
    opts.lightBonus = HL.village.lightBonus(save, loc);
    return opts;
  };

  G.startDive = function (req) {
    HL.assert(HL.dive && typeof HL.dive.create === 'function', 'HL.dive chýba — sim/dive.js nie je načítaný');
    var opts = G.diveOptions(req);
    var st = HL.dive.create(opts);
    // Až keď ponor vznikol: nesené návnady sú na lodi, nie v zásobe. Harpúny ostávajú v zásobe
    // (odpočíta sa len vystrelená) — uloženie uprostred ponoru ich tak nezmaže (nález #38).
    if (opts.mode === 'career') {
      if (isFinite(opts.bait.count)) G.save.baits[opts.bait.id] -= opts.bait.count;
    }
    G.current = { state: st, opts: opts };
    return st;
  };

  function recordEndless(save, result, value, env) {
    if (HL.endless && typeof HL.endless.record === 'function') {
      var r = HL.endless.record(save, result, env, value);
      return typeof r === 'number' ? r : r && typeof r.rank === 'number' ? r.rank : null;
    }
    var entry = { depth: Math.round(result.maxDepth || 0), value: Math.round(value), fish: result.catch.length, day: env.day };
    var best = save.endless.best;
    best.push(entry);
    best.sort(function (a, b) { return b.depth - a.depth || b.value - a.value; });
    var i = best.indexOf(entry);
    if (best.length > 10) best.length = 10;
    return i < 10 ? i + 1 : null;
  }

  G.finishDive = function (d) {
    var rec = G.current;
    d = d || (rec && rec.state);
    HL.assert(d, 'finishDive: žiadny ponor');
    if (G.last && G.last.state === d) return G.last.summary;
    var result = d.result;
    HL.assert(result && Array.isArray(result.catch), 'finishDive: ponor ešte neskončil (result je null)');
    var save = G.save;
    var opts = rec && rec.state === d ? rec.opts : null;
    var minutes = U.isNum(result.minutes) ? result.minutes : (U.isNum(d.minutes) ? d.minutes : 0);
    var clock0 = opts ? opts.clock0 : (U.isNum(d.clock) ? d.clock - minutes : save.clock);
    var mode = result.mode || (opts && opts.mode) || 'career';

    // { dive: true }: dni prejdené počas ponoru platí Akvárium (spánok nie, nález #3).
    var adv = HL.village.advanceTo(save, clock0 + Math.round(minutes), { dive: true });
    var env = HL.world.env(save);
    var ap = HL.village.applyDive(save, result, env);
    var summary = {
      result: result, newSpecies: ap.newSpecies, records: ap.records, quests: ap.quests, unlocks: ap.unlocks,
      days: adv.days, income: adv.income, prize: adv.prize || 0, contest: ap.contest || null,
      rank: null, value: 0, stored: [], sold: null, storedPreview: null,
    };
    if (mode === 'endless') {
      // Jedno číslo pre obrazovku aj rebríček (nález #5): neutrálna cena z konca ponoru, celé eurá.
      var v = U.isNum(result.value) ? result.value : U.sum(result.catch, HL.market.neutralPrice);
      result.value = Math.max(0, Math.round(v));
      summary.value = result.value;
      summary.rank = recordEndless(save, result, summary.value, env);
    } else {
      var rest = HL.village.store(save, result.catch);
      summary.stored = result.catch.filter(function (c) { return save.storage.indexOf(c) >= 0; });
      if (rest.length) summary.sold = HL.market.sell(save, rest, env);
      // To, čo hráč naozaj dostane (nález #27): predaný nadbytok + predaj uloženého po kusoch
      // teraz (na kópii trhu, po poklese dopytu z predaja nadbytku). storedPreview.lines = ceny
      // riadkov uloženého, aby riadky výsledku sedeli s nadpisom.
      summary.storedPreview = HL.market.preview(save, summary.stored, env);
      summary.value = r2((summary.sold ? summary.sold.total : 0) + summary.storedPreview.total);
      // Bonus za veľký úlovok (G.haulBonus): hneď v peniazoch, raz (finishDive je idempotentný cez G.last).
      var hb = G.haulBonus(result.catch.length);
      if (result.haul && result.outcome === 'surfaced' && hb.pct > 0 && summary.value > 0) {
        hb.money = r2(summary.value * hb.pct);
        save.money = r2(save.money + hb.money);
        save.stats.earned = r2((save.stats.earned || 0) + hb.money); // „Zarobené" a úloha Krčmy na zárobok
        summary.haul = hb;
      }
    }
    G.last = { state: d, summary: summary };
    G.current = null;
    G.persist();
    return summary;
  };

  // ------------------------------------------------------------------ trh
  G.sell = function (items) {
    // Predané kusy z Chatrče odoberie už market.sell (na mieste, pole ostáva to isté).
    var res = HL.market.sell(G.save, items, G.env());
    G.persist();
    return res;
  };

  G.priceOf = function (item) { return HL.market.price(G.save, item, G.env()); };
})(globalThis.HL);
