// Platforma (hostiteľ hry): 'web' (GitHub Pages, dvojklik z file://, dist/Hlbina.html) alebo 'crazygames'
// (CrazyGames SDK v3, docs/CRAZYGAMES.md). Bezhlavé: nesiaha na prehliadač — main.js podá SDK aj úložisko
// prehliadača zvonka (host), takže to isté beží v Node testoch (tests/unit/platform.test.js) s atrapou SDK.
//
//   HL.platform.init(host) -> Promise<'web'|'crazygames'>
//       host = { sdk: window.CrazyGames.SDK | null, local: localStorage | null, timeoutMs?: 6000,
//                setTimeout?: fn, clearTimeout?: fn }
//     Bez SDK je hotové HNEĎ (ready = true synchrónne) — web nabieha presne ako predtým.
//     S SDK: await SDK.init() najviac timeoutMs; environment 'crazygames' | 'local' → adaptér 'crazygames',
//     čokoľvek iné ('disabled' = cudzia doména, výnimka, časový limit) → 'web' a dôvod v HL.platform.reason.
//   HL.platform.storage      úložisko pre HL.game.init (getItem/setItem/removeItem):
//                            web = localStorage (alebo null), crazygames = SDK.data (Data Module, 1 MB, účet hráča).
//                            Keď SDK.data nefunguje (modul vypnutý v portáli: 'dataModuleDisabled'), ostane
//                            localStorage — udalosti hry do SDK idú ďalej; dôvod v storageReason.
//   HL.platform.setGameplay(bool)   hrá sa / nehrá sa; SDK dostane gameplayStart/Stop LEN pri ZMENE
//                                   (main.js volá každý krok podľa scene.gameplay()).
//   gameplayStart() / gameplayStop() / loadingStart() / loadingStop() / happytime()
//   HL.platform.muted, onMute(fn)   SDK settings.muteAudio (má prednosť pred zvukom v hre); fn(muted) sa zavolá
//                                   hneď s aktuálnym stavom a potom pri každej zmene.
//   HL.platform.landInGameplay      true na CrazyGames: hra preskočí titulku (main.js firstScene).
//   HL.platform.locale              CrazyGames SDK user.systemInfo.locale ('sk-SK'), inak null.
//   HL.platform.devTools(query)     panel F2 / výpis F3 povolené? (CrazyGames len s ?debug=1)
//   HL.platform.languages(prehliadač)  jazyky pre prvý štart: web = prehliadač, CrazyGames = [locale, 'en'] / ['en'].
//   HL.platform.probe()             stav pre harness (tools/crazygames_check.js).
//
// Migrácia (docs CrazyGames: „copy all the existing localStorage keys into the data module"): pri prvom štarte
// s SDK.data sa každý kľúč 'hlbina.*' z localStorage, ktorý v SDK.data ešte NIE JE, skopíruje; potom sa zapíše
// značka MIGRATED_KEY. Existujúce dáta účtu sa nikdy neprepíšu (účet je novší zdroj pravdy).
(function (HL) {
  var P = HL.platform = {
    name: 'web', env: null, ready: false, reason: null,
    storage: null, storageKind: 'none', storageReason: null,
    muted: false, landInGameplay: false, playing: false, loading: false,
    migrated: null, calls: [], errors: [], locale: null,
    PREFIX: 'hlbina.', MIGRATED_KEY: 'hlbina.platform.migrated',
    // SDK.data: „Game data when converted to a JSON string cannot exceed 1048576 bytes." Rezerva na réžiu JSON
    // a kľúče, ktoré nepoznáme — radšej chyba zápisu (HL.game.persistError), než ticho stratený postup.
    DATA_LIMIT: 1000000,
    TIMEOUT_MS: 6000,
  };
  var sdk = null, pendingLoading = false, muteFns = [], initPromise = null;

  function msg(e) { return String((e && (e.message || e.code)) || e); }
  function note(name) { P.calls.push(name); if (P.calls.length > 200) P.calls.shift(); }
  function err(where, e) { if (P.errors.length < 30) P.errors.push(where + ': ' + msg(e)); }

  // Volanie SDK nesmie zhodiť hru: výnimka aj odmietnutý Promise sa len zapíše do errors.
  function sdkCall(name) {
    note(name);
    if (P.name !== 'crazygames' || !sdk || !sdk.game || typeof sdk.game[name] !== 'function') return false;
    try {
      var r = sdk.game[name]();
      if (r && typeof r.then === 'function') r.then(null, function (e) { err(name, e); });
      return true;
    } catch (e) { err(name, e); return false; }
  }

  // Dĺžka v bajtoch UTF-8 (limit SDK je v bajtoch; slovenské texty úloh majú diakritiku).
  function utf8(s) {
    var n = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c < 0x80) n += 1;
      else if (c < 0x800) n += 2;
      else if (c >= 0xd800 && c <= 0xdbff) { n += 4; i++; }
      else n += 3;
    }
    return n;
  }

  // SDK.data ako úložisko s tvarom localStorage. Veľkosti kľúčov, ktoré sme čítali alebo zapísali,
  // strážia limit 1 MB (SDK.data nevie vymenovať kľúče, preto len známe).
  function dataStorage(data) {
    var sizes = {};
    function cost(k, v) { return utf8(String(k)) + utf8(String(v)) + 6; } // "k":"v", v JSON
    function total() { var s = 2; for (var k in sizes) s += sizes[k]; return s; }
    return {
      kind: 'crazygames',
      getItem: function (k) {
        var v = data.getItem(k);
        if (v == null) { delete sizes[k]; return null; }
        v = String(v); sizes[k] = cost(k, v);
        return v;
      },
      setItem: function (k, v) {
        v = String(v);
        var c = cost(k, v), sum = total() - (sizes[k] || 0) + c;
        if (sum > P.DATA_LIMIT) throw new Error('CrazyGames Data: ' + sum + ' B > limit ' + P.DATA_LIMIT + ' B'); // i18n-ok: technická príčina
        data.setItem(k, v);
        sizes[k] = c;
      },
      removeItem: function (k) { data.removeItem(k); delete sizes[k]; },
      bytes: total,
    };
  }

  function useWeb(local, why) {
    P.name = 'web'; P.ready = true; P.reason = why || null;
    P.storage = local || null; P.storageKind = local ? 'local' : 'none';
    P.landInGameplay = false; P.muted = false; P.locale = null;
    sdk = null;
    return P.name;
  }

  // Jednorazová migrácia 'hlbina.*' z localStorage do SDK.data. Vráti počet skopírovaných kľúčov,
  // alebo null, keď už prebehla. Zlyhaný zápis značku nezapíše — ďalší štart skúsi zvyšok znova.
  function migrate(store, local) {
    if (store.getItem(P.MIGRATED_KEY) != null) return null;
    var copied = 0, keys = [];
    if (local && typeof local.key === 'function') {
      var n = 0;
      try { n = local.length || 0; } catch (e) { n = 0; }
      for (var i = 0; i < n; i++) {
        var k = null;
        try { k = local.key(i); } catch (e) { k = null; }
        if (k && k.indexOf(P.PREFIX) === 0 && k !== P.MIGRATED_KEY) keys.push(k);
      }
    }
    for (var j = 0; j < keys.length; j++) {
      if (store.getItem(keys[j]) != null) continue; // účet už má svoje — neprepísať
      var v = null;
      try { v = local.getItem(keys[j]); } catch (e) { v = null; }
      if (v == null) continue;
      store.setItem(keys[j], v);
      copied++;
    }
    store.setItem(P.MIGRATED_KEY, String(copied));
    return copied;
  }

  function useCrazy(s, local) {
    sdk = s; P.name = 'crazygames'; P.ready = true; P.env = s.environment; P.landInGameplay = true;
    // Úložisko: SDK.data (Data Module), inak localStorage (modul vypnutý v portáli → čítanie hodí chybu).
    P.storage = local || null; P.storageKind = local ? 'local' : 'none';
    try {
      if (!s.data || typeof s.data.getItem !== 'function') throw new Error('SDK.data chýba'); // i18n-ok: dôvod pre harness
      var store = dataStorage(s.data);
      store.getItem(P.MIGRATED_KEY); // skúšobné čítanie: vypnutý modul hodí 'dataModuleDisabled'
      P.storage = store; P.storageKind = 'crazygames';
      try { P.migrated = migrate(store, local); } catch (e) { err('migrácia', e); } // i18n-ok: harness
    } catch (e) { P.storageReason = msg(e); err('data', e); }
    // Jazyk hráča podľa CrazyGames (docs.crazygames.com/requirements/gameplay: „use the user's language based on
    // locale … provided through the system info method … fallback to English") — P.languages().
    try {
      var si = s.user && s.user.systemInfo, loc = si && si.locale;
      P.locale = typeof loc === 'string' && loc ? loc : null;
    } catch (e) { P.locale = null; err('systemInfo', e); } // i18n-ok: harness
    // Stlmenie zvuku z nastavení CrazyGames (má prednosť pred zvukom v hre) — aj živá zmena.
    try { setMuted(!!(s.game && s.game.settings && s.game.settings.muteAudio)); } catch (e) { err('settings', e); }
    try {
      if (s.game && typeof s.game.addSettingsChangeListener === 'function') {
        s.game.addSettingsChangeListener(function (st) { setMuted(!!(st && st.muteAudio)); });
      }
    } catch (e) { err('addSettingsChangeListener', e); }
    if (pendingLoading) { pendingLoading = false; sdkCall('loadingStart'); }
    return P.name;
  }

  function setMuted(m) {
    m = !!m;
    if (m === P.muted) return;
    P.muted = m;
    note(m ? 'muteAudio:true' : 'muteAudio:false');
    for (var i = 0; i < muteFns.length; i++) { try { muteFns[i](m); } catch (e) { err('onMute', e); } }
  }
  P._setMuted = setMuted; // testy a harness (skutočnú zmenu posiela SDK cez addSettingsChangeListener)

  P.onMute = function (fn) {
    if (typeof fn !== 'function') return;
    muteFns.push(fn);
    try { fn(P.muted); } catch (e) { err('onMute', e); }
  };

  // Nástroje vývojára (panel F2, výpis F3 a ich nápovedy): na CrazyGames len s ?debug=1. main.js → HL.devTools.
  P.devTools = function (q) { return !(P.name === 'crazygames' && !(q && q.debug)); };

  // Zoznam jazykov pre HL.i18n.detect pri PRVOM štarte (uložená voľba hráča a ?lang= majú prednosť — sim/game.js).
  // Web: jazyky prehliadača (ako doteraz). CrazyGames: ich locale, inak angličtina — nie prehliadač.
  P.languages = function (browser) {
    if (P.name !== 'crazygames') return browser;
    return P.locale ? [P.locale, 'en'] : ['en'];
  };

  // Testovací odkaz (majiteľ 2026-10-06: kamaráti majú začať „s resetnutým progresom"): tapoman.github.io/hlbina-test/
  // má ten istý origin ako verejný tapoman.github.io/hlbina-hra/ = jeden localStorage — kariéra by prešla z jedného
  // odkazu na druhý a staršia verzia by novšie uloženie odmietla. Preto vlastný menný priestor kľúčov ('hlbina-test:' +
  // kľúč) pre http(s) adresu, ktorej PRVÝ priečinok sa začína 'hlbina-test' (hlbina-test2 … = ďalšie kolo od nuly).
  // Všade inde '' = pôvodné kľúče: file://, server v sieti, hlbina-hra, itch.io (cesta sa mení s každou verziou —
  // priestor podľa cesty by tam aktualizáciou stratil postup), CrazyGames (SDK.data). To isté pravidlo má nápis pri
  // štarte v index.html; zhodu aj to, že úložisko prehliadača inde nikto nečíta, stráži tests/unit/store_ns.test.js.
  P.STORE_NS_RE = /^https?:\/\/[^\/?#]+\/(hlbina-test[^\/?#]*)(?:[\/?#]|$)/i;
  P.storeNs = function (href) {
    var m = P.STORE_NS_RE.exec(String(href || ''));
    return m ? m[1].toLowerCase() + ':' : '';
  };
  // Úložisko v mennom priestore: rozhranie localStorage (getItem/setItem/removeItem/key/length) nad kľúčmi ns + kľúč;
  // key/length vidia len kľúče tohto priestoru. Prázdny ns (alebo žiadne úložisko) = to isté úložisko bez obalu.
  P.nsStore = function (store, ns) {
    if (!store || !ns) return store;
    function own() {
      var out = [], n = 0;
      try { n = store.length || 0; } catch (e) { n = 0; }
      for (var i = 0; i < n; i++) {
        var k = null;
        try { k = store.key(i); } catch (e) { k = null; }
        if (k && k.indexOf(ns) === 0) out.push(k.slice(ns.length));
      }
      return out;
    }
    var w = {
      ns: ns,
      getItem: function (k) { return store.getItem(ns + k); },
      setItem: function (k, v) { store.setItem(ns + k, v); },
      removeItem: function (k) { store.removeItem(ns + k); },
      key: function (i) { var l = own(); return i >= 0 && i < l.length ? l[i] : null; },
    };
    Object.defineProperty(w, 'length', { get: function () { return own().length; }, enumerable: true });
    return w;
  };

  P.init = function (host) {
    if (initPromise) return initPromise;
    host = host || {};
    var local = host.local || null, s = host.sdk || null;
    if (!s || typeof s.init !== 'function') {
      useWeb(local, s ? 'SDK bez init()' : null); // i18n-ok: dôvod pre harness
      initPromise = Promise.resolve(P.name);
      return initPromise;
    }
    P.name = 'pending'; P.ready = false;
    var ms = host.timeoutMs > 0 ? host.timeoutMs : P.TIMEOUT_MS;
    var setT = host.setTimeout || (typeof setTimeout === 'function' ? setTimeout : null);
    var clearT = host.clearTimeout || (typeof clearTimeout === 'function' ? clearTimeout : null);
    initPromise = new Promise(function (resolve) {
      var done = false, timer = null;
      function finish(ok, why) {
        if (done) return;
        done = true;
        if (timer !== null && clearT) { try { clearT(timer); } catch (e) { /* nič */ } }
        if (ok) useCrazy(s, local); else { useWeb(local, why); pendingLoading = false; }
        resolve(P.name);
      }
      if (setT) timer = setT(function () { finish(false, 'SDK.init časový limit ' + ms + ' ms'); }, ms); // i18n-ok: harness
      var pr;
      try { pr = s.init(); } catch (e) { finish(false, 'SDK.init: ' + msg(e)); return; } // i18n-ok: harness
      Promise.resolve(pr).then(function () {
        var env = s.environment;
        if (env === 'crazygames' || env === 'local') finish(true);
        else finish(false, 'environment ' + env); // i18n-ok: harness
      }, function (e) { finish(false, 'SDK.init: ' + msg(e)); }); // i18n-ok: harness
    });
    return initPromise;
  };

  // ------------------------------------------------------------------ udalosti hry
  // Idempotentné: SDK dostane volanie len pri skutočnej zmene stavu.
  P.setGameplay = function (on) {
    on = !!on;
    if (on === P.playing) return false;
    P.playing = on;
    sdkCall(on ? 'gameplayStart' : 'gameplayStop');
    return true;
  };
  P.gameplayStart = function () { return P.setGameplay(true); };
  P.gameplayStop = function () { return P.setGameplay(false); };

  // loadingStart pred init() sa zapamätá a SDK ho dostane hneď po úspešnom init (SDK pred init volať nejde).
  P.loadingStart = function () {
    if (P.loading) return false;
    P.loading = true;
    if (!P.ready) { pendingLoading = true; note('loadingStart'); return true; }
    sdkCall('loadingStart');
    return true;
  };
  P.loadingStop = function () {
    if (!P.loading) return false;
    P.loading = false;
    if (pendingLoading) { pendingLoading = false; note('loadingStop'); return true; }
    sdkCall('loadingStop');
    return true;
  };
  P.happytime = function () { return sdkCall('happytime'); };

  P.probe = function () {
    return {
      name: P.name, env: P.env, ready: P.ready, reason: P.reason,
      storageKind: P.storageKind, storageReason: P.storageReason,
      storageBytes: P.storage && P.storage.bytes ? P.storage.bytes() : null,
      muted: P.muted, playing: P.playing, loading: P.loading, landInGameplay: P.landInGameplay,
      migrated: P.migrated, calls: P.calls.slice(), errors: P.errors.slice(), locale: P.locale,
      devTools: HL.devTools !== false,
    };
  };

  // Len pre testy: späť do stavu pred init (Node načíta HL raz na test, ale pre istotu).
  P._reset = function () {
    sdk = null; pendingLoading = false; muteFns = []; initPromise = null;
    P.name = 'web'; P.env = null; P.ready = false; P.reason = null; P.storage = null; P.storageKind = 'none';
    P.storageReason = null; P.muted = false; P.landInGameplay = false; P.playing = false; P.loading = false;
    P.migrated = null; P.calls = []; P.errors = []; P.locale = null;
  };
})(globalThis.HL);
