// Svet (dizajn 7): herný čas, denné obdobia, mesiac, počasie, sezónne udalosti a prostredie
// (Env), ktoré čítajú ponor, trh aj dedina. Žiadny vlastný stav okrem kešu počasia
// a HL.world.currentEvent (nastavuje HL.game.init).
//
// POČASIE — pravidlo, ktoré zmluva nechala na tento súbor:
//   Súvislé úseky od minúty 0 kariéry. Úsek k trvá
//       HL.rngFor(seed, 'weather', k).int(T.weatherMinH, T.weatherMaxH) hodín
//   a počasie je vážený výber podľa HL.data.weathers[].w z TOHO ISTÉHO generátora.
//   Ak padne rovnaké ako v predošlom úseku, hádže sa ešte RAZ — bez toho by sa slnko
//   (váha 30) opakovalo v ~23 % zmien a Meteostanica by predpovedala hlavne "to isté";
//   úplný zákaz opakovania by zas bol nápadne umelý (strieda sa to ako semafor).
//   Úseky závisia len od semena a poradia, nie od toho, čo hráč robí — preto predpoveď
//   Meteostanice (segments) a skutočnosť (weatherAt) čítajú tú istú tabuľku a nikdy si
//   neprotirečia. Tabuľka sa kešuje pre semeno a aktuálne T.weatherMinH/MaxH (panel F2
//   ich smie meniť za behu — starý keš by potom klamal).
//   Poistka: najviac MAX_SEG úsekov (desiatky herných rokov); ďalej sa tabuľka opakuje
//   dookola, aby poškodené hodiny (napr. 1e12) nezamrazili hru generovaním.
//
// PROSTREDIE env(save, m):
//   intro = save.stats.dives < T.introDives → počasie je vždy 'sun' (riziko 19: systémy
//   prichádzajú postupne). weatherAt/segments vracajú SKUTOČNÉ počasie aj počas intra;
//   village.forecast to preto posiela ďalej s príznakom intro.
//   guardianReady = Maják na úrovni 3 a všetky HL.data.guardianRequires v save.legends.
//   event = HL.world.currentEvent.
(function (HL) {
  var W = HL.world = {};
  var D = HL.data, T = HL.T;
  var DAY = 1440;
  var MAX_SEG = 50000;
  var CACHE_SEEDS = 8;

  W.currentEvent = null;

  // ------------------------------------------------------------------ čas
  W.day = function (m) { return Math.floor(m / DAY); };
  W.minuteOfDay = function (m) { return ((m % DAY) + DAY) % DAY; };
  W.hour = function (m) { return Math.floor(W.minuteOfDay(m) / 60); };

  // Obdobia z dát; noc prechádza cez polnoc (from > to). Hodina bez obdobia je chyba
  // v dátach alebo tu — žiadne "vráť posledné": posledné je práve noc a náhradná hodnota
  // by skryla aj pokazené pretáčanie cez polnoc (mutant v tools/world_mutants.js to ukázal).
  W.period = function (m) {
    var h = W.hour(m), P = D.periods;
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      if (p.from < p.to ? (h >= p.from && h < p.to) : (h >= p.from || h < p.to)) return p.id;
    }
    HL.assert(false, 'hodina ' + h + ' nemá denné obdobie (HL.data.periods)');
  };

  W.moon = function (m) { return (((W.day(m) + D.MOON_OFFSET) % 8) + 8) % 8; };

  // Ranný budíček = 06:00 (začiatok kariérneho dňa), nočný = začiatok obdobia Noc.
  function wakeMinute(which) {
    if (which === 'night') {
      var n = D.periods.filter(function (p) { return p.id === 'night'; })[0];
      return (n ? n.from : 21) * 60;
    }
    return W.minuteOfDay(D.START_MINUTE);
  }
  // Najbližšie 06:00 / 21:00 PRÍSNE po m (spánok o 06:00 posunie na ďalšie ráno, nie na teraz).
  W.nextTime = function (m, which) {
    var target = wakeMinute(which);
    var base = W.day(m) * DAY + target;
    return base > m ? base : base + DAY;
  };

  // ------------------------------------------------------------------ počasie
  var cache = {};
  var cacheOrder = [];

  function table(seed) {
    seed = seed >>> 0;
    var lo = Math.min(T.weatherMinH, T.weatherMaxH), hi = Math.max(T.weatherMinH, T.weatherMaxH);
    var key = seed + '|' + lo + '|' + hi;
    var t = cache[key];
    if (!t) {
      t = cache[key] = { seed: seed, lo: lo, hi: hi, ends: [], weathers: [] };
      cacheOrder.push(key);
      if (cacheOrder.length > CACHE_SEEDS) delete cache[cacheOrder.shift()];
    }
    return t;
  }

  function extend(t, m) {
    var ends = t.ends, ws = t.weathers;
    while (ends.length < MAX_SEG && (ends.length === 0 || ends[ends.length - 1] <= m)) {
      var k = ends.length;
      var rng = HL.rngFor(t.seed, 'weather', k);
      var hours = rng.int(t.lo, t.hi);
      var w = rng.weighted(D.weathers).id;
      var prev = k > 0 ? ws[k - 1] : null;
      if (w === prev) w = rng.weighted(D.weathers).id;
      ends.push((k > 0 ? ends[k - 1] : 0) + hours * 60);
      ws.push(w);
    }
  }

  // Minúta za koncom tabuľky sa zabalí dookola (poistka proti nezmyselným hodinám).
  function norm(t, m) {
    if (!(m >= 0)) return 0;
    extend(t, m);
    var end = t.ends[t.ends.length - 1];
    return m < end ? m : m % end;
  }

  function segIndex(t, m) {
    var ends = t.ends, a = 0, b = ends.length - 1;
    while (a < b) {
      var mid = (a + b) >> 1;
      if (ends[mid] > m) b = mid; else a = mid + 1;
    }
    return a;
  }

  W.weatherAt = function (seed, m) {
    var t = table(seed);
    var mm = norm(t, m);
    return t.weathers[segIndex(t, mm)];
  };

  // Úseky prekrývajúce [fromM, toM), orezané na tento rozsah. Súvislé: prvý začína
  // vo fromM, posledný končí v toM, medzi nimi bez medzier.
  W.segments = function (seed, fromM, toM) {
    var out = [];
    if (!(toM > fromM)) return out;
    var t = table(seed);
    if (fromM < 0) fromM = 0;
    extend(t, toM);
    var end = t.ends[t.ends.length - 1];
    if (toM > end) {
      // Za poistkou: po hodinách cez weatherAt (pomalšie, ale správne a konečné).
      for (var m = fromM; m < toM;) {
        var w = W.weatherAt(seed, m), n = Math.min(toM, (Math.floor(m / 60) + 1) * 60);
        if (out.length && out[out.length - 1].weather === w && out[out.length - 1].to === m) out[out.length - 1].to = n;
        else out.push({ from: m, to: n, weather: w });
        m = n;
      }
      return out;
    }
    for (var k = segIndex(t, fromM); k < t.ends.length; k++) {
      var s = k > 0 ? t.ends[k - 1] : 0, e = t.ends[k];
      if (s >= toM) break;
      out.push({ from: Math.max(s, fromM), to: Math.min(e, toM), weather: t.weathers[k] });
    }
    return out;
  };

  // ------------------------------------------------------------------ udalosti
  W.eventForMonth = function (month0) {
    for (var i = 0; i < D.events.length; i++) {
      if (D.events[i].months.indexOf(month0) >= 0) return D.events[i].id;
    }
    return null;
  };

  // ------------------------------------------------------------------ prostredie
  W.guardianReady = function (save) {
    if (!save || !save.buildings || (save.buildings.majak || 0) < 3) return false;
    var L = save.legends || {};
    for (var i = 0; i < D.guardianRequires.length; i++) if (!L[D.guardianRequires[i]]) return false;
    return true;
  };

  W.env = function (save, m) {
    if (m == null) m = save ? save.clock : D.START_MINUTE;
    var intro = !!(save && save.stats && save.stats.dives < T.introDives);
    var seed = save ? save.seed >>> 0 : 0;
    return {
      m: m,
      day: W.day(m),
      minuteOfDay: W.minuteOfDay(m),
      hour: W.hour(m),
      period: W.period(m),
      weather: intro ? 'sun' : W.weatherAt(seed, m),
      moon: W.moon(m),
      event: W.currentEvent || null,
      intro: intro,
      guardianReady: W.guardianReady(save),
    };
  };

  // Všetky tokeny podmienky musia platiť. Neznámy token je chyba v dátach — nahlas.
  W.matches = function (f, env) {
    var c = f.cond || ['any'];
    for (var i = 0; i < c.length; i++) {
      var fn = D.COND[c[i]];
      HL.assert(typeof fn === 'function', 'neznáma podmienka ' + c[i] + ' (' + f.id + ')');
      if (!fn(env)) return false;
    }
    return true;
  };

  // ------------------------------------------------------------------ lovné miesta (docs/JAZERO.md)
  // Bez miesta = more: každá funkcia nižšie sa bez parametra správa presne ako pred jazerom.
  W.SEA = 'more';
  W.location = function (id) {
    var L = D.locations, want = id || W.SEA;
    for (var i = 0; i < L.length; i++) if (L[i].id === want) return L[i];
    HL.assert(false, 'neznáme lovné miesto ' + id);
  };
  // Miesto druhu, legendy alebo pásma (morské nemajú pole location).
  W.locOf = function (o) { return (o && o.location) || W.SEA; };
  W.isLake = function (loc) { return !!loc && loc !== W.SEA; };
  // Pásmo podľa id v ktoromkoľvek mieste (more prvé), alebo null.
  W.zoneById = function (id) {
    var L = D.locations;
    for (var i = 0; i < L.length; i++) for (var k = 0; k < L[i].zones.length; k++) if (L[i].zones[k].id === id) return L[i].zones[k];
    return null;
  };

  // Kariéra nepozná Nekonečnú hlbinu: pod dnom je stále Priepasť. loc = lovné miesto (predvolené more).
  W.zoneAt = function (depth, endless, loc) {
    var Z = W.location(loc).zones, last = null;
    if (!(depth > 0)) depth = 0;
    for (var i = 0; i < Z.length; i++) {
      if (Z[i].endlessOnly && !endless) continue;
      last = Z[i];
      if (depth >= Z[i].from && depth < Z[i].to) return Z[i];
    }
    return last;
  };
  // Poradie pásma v JEHO mieste (Plytčina 0 … ; Chladiace jazero 0 …). loc obmedzí hľadanie na jedno miesto.
  W.zoneIndex = function (zoneId, loc) {
    var L = loc ? [W.location(loc)] : D.locations;
    for (var k = 0; k < L.length; k++) for (var i = 0; i < L[k].zones.length; i++) if (L[k].zones[i].id === zoneId) return i;
    return -1;
  };

  // ------------------------------------------------------------------ texty
  function nameOf(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].name;
    return String(id);
  }
  W.clockLabel = function (m) {
    var mod = Math.floor(W.minuteOfDay(m));
    return HL.util.pad2(Math.floor(mod / 60)) + ':' + HL.util.pad2(mod % 60);
  };
  W.dayLabel = function (m) { return HL.i18n.t('sim.world.day', { n: W.day(m) + 1 }); };
  // Voliteľná minúta m: v noci je "slnečno" nezmysel — hovorí sa "Jasno" a svieti mesiac.
  // Všetky obrazovky majú brať meno aj ikonu počasia odtiaľto (predtým to 2 scény riešili po svojom).
  function clearNight(id, m) { return id === 'sun' && HL.util.isNum(m) && W.period(m) === 'night'; }
  W.weatherName = function (id, m) { return clearNight(id, m) ? HL.i18n.t('sim.world.clear') : nameOf(D.weathers, id); };
  W.weatherIcon = function (id, m) { return clearNight(id, m) ? 'moon_' + W.moon(m) : 'icon_' + id; };
  W.periodName = function (id) { return nameOf(D.periods, id); };
  W.zoneName = function (id) { var z = W.zoneById(id); return z ? z.name : String(id); };
  W.locationName = function (id) { return W.location(id).name; };
  W.moonName = function (phase) { return D.moonPhases[phase] || ''; };
  W.eventName = function (id) { return id ? nameOf(D.events, id) : ''; };
})(globalThis.HL);
