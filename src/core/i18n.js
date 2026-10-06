// Preklady (docs/I18N.md): jazyk hry, tabuľky textov, množné čísla, formát čísel a prekrytie dát.
// Bezhlavé (core): žiadny DOM, žiadna náhoda. Jazyk vyberá sim/game.js (nastavenia, ?lang=) a UI.
//
//   HL.i18n.LANGS                 [{ code, name (vlastné meno jazyka), locale, short }]
//   HL.i18n.lang                  jazyk, ktorým sa práve píše (vždy má tabuľky); pref = čo hráč/prehliadač chcel
//   HL.i18n.set(code)             prepne jazyk, prepíše dáta (prekrytie) a zavolá onChange; → skutočný jazyk
//   HL.i18n.add(code, [area,] t)  pridá tabuľku { kľúč: text | { one, few, many, other } }
//   HL.i18n.t(key, params)        text s náhradou {meno}; params.n (číslo) vyberie tvar množného čísla
//   HL.i18n.plural(n, key, params)  to isté ako t(key, { n, ... }) — tvar podľa pravidla jazyka (CLDR)
//   HL.i18n.has(key)              existuje v aktuálnom jazyku alebo v slovenčine
//   HL.i18n.missing               ['de:ui.title.newGame', …] chýbajúce kľúče (každý raz, raz aj v konzole)
//   HL.i18n.detect(zoznam)        navigator.languages → kód (sk*, cs*, de, pl, hu, es, fr; inak en; prázdny → sk)
//   HL.i18n.available(code)       jazyk má načítané tabuľky (dá sa vybrať)
//   HL.i18n.overlay(cieľ, prefix, polia)   dátový register prekladaný NA MIESTE (fish.name…); slovenský originál
//                                 ostáva odložený, set('sk') ho vráti presne
//   HL.i18n.entries()             [{ key, value }] slovenských originálov všetkých prekrytí (tools/i18n_extract_data.js)
//   HL.i18n.coverage(code)        kľúče zo slovenčiny, ktoré jazyk nemá
//   HL.i18n.fmt()                 { group, decimal, currency:'before'|'after', minGroup, pctSpace } — HL.util.money/kg/…
//   HL.i18n.onChange(fn)          po každom set()
//
// Poradie hľadania textu: aktuálny jazyk → slovenčina → samotný kľúč (a záznam do missing).
// Slovenčina je ZDROJ: tabuľky src/data/lang/sk/*.js a pôvodné hodnoty v dátach sú to isté
// (data.js je vygenerovaný z dát, stráži tests/unit/i18n.test.js).
(function (HL) {
  var I = HL.i18n = {};

  // Poradie = poradie v ponuke. short = nápis na malom tlačidle (hráč pozná „CZ" skôr ako „CS").
  I.LANGS = [
    { code: 'sk', name: 'Slovenčina', locale: 'sk-SK', short: 'SK' },
    { code: 'cs', name: 'Čeština', locale: 'cs-CZ', short: 'CZ' },
    { code: 'en', name: 'English', locale: 'en-GB', short: 'EN' },
    { code: 'de', name: 'Deutsch', locale: 'de-DE', short: 'DE' },
    { code: 'pl', name: 'Polski', locale: 'pl-PL', short: 'PL' },
    { code: 'hu', name: 'Magyar', locale: 'hu-HU', short: 'HU' },
    { code: 'es', name: 'Español', locale: 'es-ES', short: 'ES' },
    { code: 'fr', name: 'Français', locale: 'fr-FR', short: 'FR' },
  ];
  I.SOURCE = 'sk';

  // Formát čísel (CLDR): oddeľovač tisícov, desatinná čiarka/bodka, kde je €, od koľkých číslic sa tisíce
  // oddeľujú (es, pl: 1000 bez medzery, až 10 000) a či je medzera pred %. Slovenčina = presne to, čo hra
  // robila pred prekladom (tests/unit/i18n.test.js porovnáva bajt po bajte).
  var FMT = {
    sk: { group: ' ', decimal: ',', currency: 'after', minGroup: 1, pctSpace: true },
    cs: { group: ' ', decimal: ',', currency: 'after', minGroup: 1, pctSpace: true },
    en: { group: ',', decimal: '.', currency: 'before', minGroup: 1, pctSpace: false },
    de: { group: '.', decimal: ',', currency: 'after', minGroup: 1, pctSpace: true },
    pl: { group: ' ', decimal: ',', currency: 'after', minGroup: 2, pctSpace: false },
    hu: { group: ' ', decimal: ',', currency: 'after', minGroup: 1, pctSpace: false },
    es: { group: '.', decimal: ',', currency: 'after', minGroup: 2, pctSpace: true },
    fr: { group: ' ', decimal: ',', currency: 'after', minGroup: 1, pctSpace: true },
  };

  // Množné číslo podľa CLDR (celé čísla; desatinné majú vlastnú kategóriu, kde ju jazyk má).
  function isInt(n) { return Math.floor(n) === n; }
  function skcs(n) { if (!isInt(n)) return 'many'; return n === 1 ? 'one' : n >= 2 && n <= 4 ? 'few' : 'other'; }
  function pl(n) {
    if (!isInt(n)) return 'other';
    if (n === 1) return 'one';
    var m10 = n % 10, m100 = n % 100;
    return m10 >= 2 && m10 <= 4 && !(m100 >= 12 && m100 <= 14) ? 'few' : 'many';
  }
  function oneOther(n) { return n === 1 ? 'one' : 'other'; }
  function fr(n) { return Math.floor(n) === 0 || Math.floor(n) === 1 ? 'one' : 'other'; }
  var RULES = { sk: skcs, cs: skcs, pl: pl, en: oneOther, de: oneOther, es: oneOther, hu: oneOther, fr: fr };
  // Tvary, ktoré MUSÍ mať každý množný kľúč v danom jazyku (celé čísla); ostatné sú voliteľné.
  I.PLURAL_FORMS = {
    sk: ['one', 'few', 'other'], cs: ['one', 'few', 'other'], pl: ['one', 'few', 'many'],
    en: ['one', 'other'], de: ['one', 'other'], es: ['one', 'other'], hu: ['one', 'other'], fr: ['one', 'other'],
  };
  I.pluralCategory = function (n, code) {
    var r = RULES[code || I.lang] || oneOther;
    return r(Math.abs(Number(n)) || 0);
  };

  var tables = I.tables = {};
  I.LANGS.forEach(function (l) { tables[l.code] = {}; });
  I.lang = I.SOURCE;
  I.pref = I.SOURCE;
  I.hostLangs = [];
  I.missing = [];
  var seenMissing = {};
  var listeners = [];

  function own(o, k) { return !!o && Object.prototype.hasOwnProperty.call(o, k); }
  function known(code) { for (var i = 0; i < I.LANGS.length; i++) if (I.LANGS[i].code === code) return I.LANGS[i]; return null; }
  I.info = known;

  // Oblasť tabuľky → povinná predpona kľúčov (súbor src/data/lang/<kód>/<oblasť>.js). 'data' = prekrytie dát.
  function areaPrefix(area) {
    if (area === 'data') return null;
    if (area === 'sim') return 'sim.';
    if (area === 'ui_common') return 'ui.common.';
    return 'ui.' + area + '.';
  }
  I.areaPrefix = areaPrefix;
  I.areaOf = function (key) {
    if (/^sim\./.test(key)) return 'sim';
    var m = /^ui\.([a-z_]+)\./.exec(key);
    if (m) return m[1] === 'common' ? 'ui_common' : m[1];
    return 'data';
  };

  I.add = function (code, area, table) {
    if (table === undefined && typeof area === 'object') { table = area; area = null; }
    HL.assert(known(code), 'i18n.add: neznámy jazyk ' + code);
    HL.assert(table && typeof table === 'object', 'i18n.add: tabuľka nie je objekt');
    var t = tables[code], pre = area ? areaPrefix(area) : null;
    for (var k in table) {
      if (!own(table, k)) continue;
      if (area) {
        if (pre) HL.assert(k.indexOf(pre) === 0, 'i18n.add: kľúč ' + k + ' nepatrí do oblasti ' + area + ' (predpona ' + pre + ')');
        else HL.assert(!/^(ui|sim)\./.test(k), 'i18n.add: kľúč ' + k + ' patrí do ' + I.areaOf(k) + ', nie do data');
      }
      HL.assert(!own(t, k), 'i18n.add: kľúč ' + code + ':' + k + ' je definovaný dvakrát');
      var v = table[k];
      HL.assert(typeof v === 'string' || (v && typeof v === 'object'), 'i18n.add: ' + k + ' nie je text ani tvary');
      t[k] = v;
    }
    if (code === I.lang && code !== I.SOURCE) applyOverlays();
    return I;
  };

  // Jazyk sa dá vybrať, až keď je preložený aspoň z MIN_COVERAGE (inak "čoskoro"): tabuľky všetkých
  // jazykov sa načítavajú vždy (aj rozpracované), takže samotná existencia tabuľky nestačí.
  I.MIN_COVERAGE = 0.95;
  I.available = function (code) {
    if (code === I.SOURCE) return true;
    var t = tables[code];
    if (!t) return false;
    var total = 0, have = 0;
    for (var k in tables[I.SOURCE]) if (own(tables[I.SOURCE], k)) { total++; if (own(t, k)) have++; }
    return total > 0 && have > 0 && have / total >= I.MIN_COVERAGE;
  };

  function note(code, key) {
    var id = code + ':' + key;
    if (seenMissing[id]) return;
    seenMissing[id] = true;
    I.missing.push(id);
    if (typeof console !== 'undefined' && console.warn) console.warn('i18n: chýba ' + id);
  }

  // Surová hodnota (text alebo tvary) podľa poradia jazyk → sk → nič.
  function lookup(key) {
    var t = tables[I.lang];
    if (own(t, key)) return t[key];
    if (I.lang !== I.SOURCE) note(I.lang, key);
    if (own(tables[I.SOURCE], key)) return tables[I.SOURCE][key];
    note(I.SOURCE, key);
    return undefined;
  }

  // Číslo v {mene}: celé ostáva ako je (pôvodné texty počty nijako neoddeľovali — slovenčina bajt po bajte),
  // desatinné dostane čiarku/bodku jazyka. Peniaze, váhu, hĺbku pošli už naformátované (HL.util.money…).
  function numText(n) {
    if (typeof n !== 'number' || !isFinite(n) || isInt(n)) return String(n);
    return HL.util && HL.util.num ? HL.util.num(n) : String(n);
  }
  function fill(s, params) {
    if (!params || s.indexOf('{') < 0) return s;
    return s.replace(/\{(\w+)\}/g, function (m, name) {
      if (!own(params, name) || params[name] == null) return m;
      var v = params[name];
      return typeof v === 'number' ? numText(v) : String(v);
    });
  }
  function pick(forms, n) {
    var c = typeof n === 'number' ? I.pluralCategory(n) : 'other';
    if (own(forms, c)) return forms[c];
    if (c === 'many' && own(forms, 'other')) return forms.other;
    if (own(forms, 'other')) return forms.other;
    for (var k in forms) if (own(forms, k)) return forms[k];
    return '';
  }

  I.t = function (key, params) {
    var v = lookup(key);
    if (v === undefined) return key;
    if (typeof v !== 'string') v = pick(v, params && params.n);
    return fill(v, params);
  };
  I.plural = function (n, key, params) {
    var p = { n: n };
    if (params) for (var k in params) if (own(params, k)) p[k] = params[k];
    return I.t(key, p);
  };
  I.has = function (key) { return own(tables[I.lang], key) || own(tables[I.SOURCE], key); };

  // Názov vo vnútri vety (návnada, počasie, nebezpečenstvo): sk/cs/pl/… ho píšu malým písmenom,
  // nemčina podstatné mená VEĽKÝM — kód nesmie zmenšovať sám (8 miest to robilo toLowerCase()).
  var KEEP_CASE = { de: true };
  I.lower = function (s) { return s == null ? s : KEEP_CASE[I.lang] ? String(s) : String(s).toLowerCase(); };
  I.lower1 = function (s) { return !s || KEEP_CASE[I.lang] ? s : s.charAt(0).toLowerCase() + s.slice(1); };
  I.fmt = function () { return FMT[I.lang] || FMT[I.SOURCE]; };
  I.fmtOf = function (code) { return FMT[code] || FMT[I.SOURCE]; };

  // ------------------------------------------------------------------ výber jazyka
  var MAP = { sk: 'sk', cs: 'cs', cz: 'cs', en: 'en', de: 'de', pl: 'pl', hu: 'hu', es: 'es', fr: 'fr' };
  function codeOf(tag) {
    var p = String(tag || '').toLowerCase().split(/[-_]/)[0];
    return own(MAP, p) ? MAP[p] : null;
  }
  // Prvý jazyk zo zoznamu prehliadača, ktorý hra pozná. Iný jazyk (ja, it…) → angličtina.
  // Prázdny zoznam (Node, test, harness bez údaja) → slovenčina: bez informácie ostáva zdrojový jazyk.
  // avail = true: len jazyky s načítanými tabuľkami (null, keď žiadny nesedí).
  I.detect = function (list, avail) {
    var arr = Array.isArray(list) ? list : list ? [list] : [];
    for (var i = 0; i < arr.length; i++) {
      var c = codeOf(arr[i]);
      if (c && (!avail || I.available(c))) return c;
    }
    if (avail) return null;
    return arr.length ? 'en' : I.SOURCE;
  };

  // Jazyk, ktorým sa bude naozaj písať: želaný, ak má tabuľky; inak ďalší vhodný z prehliadača,
  // angličtina, slovenčina (hráč s nemeckým prehliadačom dostane nemčinu hneď, ako pribudne).
  I.resolve = function (code) {
    if (known(code) && I.available(code)) return code;
    return I.detect(I.hostLangs, true) || (I.available('en') ? 'en' : I.SOURCE);
  };

  I.set = function (code) {
    I.pref = known(code) ? code : I.SOURCE;
    var eff = I.resolve(I.pref);
    var changed = eff !== I.lang;
    I.lang = eff;
    applyOverlays();
    for (var i = 0; i < listeners.length; i++) listeners[i](eff, changed);
    return eff;
  };
  I.onChange = function (fn) { listeners.push(fn); return fn; };

  // ------------------------------------------------------------------ prekrytie dát
  // Každá položka: { obj, prop, key, sk }. set() zapíše obj[prop] = text jazyka (alebo slovenský originál).
  var OVER = [], overKeys = {};
  function entry(obj, prop, key) {
    HL.assert(typeof obj[prop] === 'string', 'i18n.overlay: ' + key + ' nie je text');
    HL.assert(!own(overKeys, key), 'i18n.overlay: kľúč ' + key + ' je dvakrát');
    overKeys[key] = true;
    var e = { obj: obj, prop: prop, key: key, sk: obj[prop] };
    OVER.push(e);
    return e;
  }
  // polia: ['name', 'hint', 'levels:level'] — 'pole:segment' = zoznam textov pod kľúčom prefix.id.segment.i
  function itemFields(item, base, fields, out) {
    for (var f = 0; f < fields.length; f++) {
      var parts = fields[f].split(':'), prop = parts[0], seg = parts[1] || parts[0];
      var v = item[prop];
      if (typeof v === 'string') out.push(entry(item, prop, base + '.' + seg));
      else if (Array.isArray(v)) for (var i = 0; i < v.length; i++) if (typeof v[i] === 'string') out.push(entry(v, i, base + '.' + seg + '.' + i));
    }
  }
  // cieľ: pole objektov s id | pole textov | objekt { kľúč: text } | objekt { kľúč: { polia } }
  I.overlay = function (target, prefix, fields) {
    HL.assert(target && typeof target === 'object', 'i18n.overlay: ' + prefix + ' nie je objekt');
    var made = [], i;
    fields = fields || [];
    if (Array.isArray(target)) {
      for (i = 0; i < target.length; i++) {
        var it = target[i];
        if (typeof it === 'string') made.push(entry(target, i, prefix + '.' + i));
        else {
          HL.assert(it && it.id != null, 'i18n.overlay: položka ' + prefix + '[' + i + '] nemá id');
          itemFields(it, prefix + '.' + it.id, fields, made);
        }
      }
    } else if (fields.some(function (f) { var p = f.split(':')[0]; return typeof target[p] === 'string' || Array.isArray(target[p]); })) {
      // jeden objekt s poľami (HL.data.harpoon) → prefix.pole
      itemFields(target, prefix, fields, made);
    } else {
      for (var k in target) {
        if (!own(target, k)) continue;
        var v = target[k];
        if (typeof v === 'string') made.push(entry(target, k, prefix + '.' + k));
        else if (v && typeof v === 'object') itemFields(v, prefix + '.' + k, fields, made);
      }
    }
    if (I.lang !== I.SOURCE) for (i = 0; i < made.length; i++) applyOne(made[i]);
    return made.length;
  };
  function applyOne(e) {
    var t = tables[I.lang];
    e.obj[e.prop] = I.lang === I.SOURCE ? e.sk : own(t, e.key) ? String(t[e.key]) : e.sk;
  }
  function applyOverlays() { for (var i = 0; i < OVER.length; i++) applyOne(OVER[i]); }

  I.entries = function () { return OVER.map(function (e) { return { key: e.key, value: e.sk }; }); };
  I.isOverlayKey = function (key) { return own(overKeys, key); };

  I.coverage = function (code) {
    var t = tables[code] || {}, out = [];
    for (var k in tables[I.SOURCE]) if (own(tables[I.SOURCE], k) && !own(t, k)) out.push(k);
    return out;
  };
})(globalThis.HL);
