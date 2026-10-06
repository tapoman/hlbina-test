// Panel F2: živé posuvníky pre všetky ladiace konštanty HL.T.
//
// Prečo DOM a nie herné widgety: panel musí fungovať aj vtedy, keď je rozbitá
// grafika hry, musí mať skutočné textové polia (presné čísla, kopírovanie) a nesmie
// sa báť priestoru — hra má 180 px na šírku, konštánt je okolo sto.
//
// Naladené hodnoty (iba tie, čo sa líšia od predvolených — HL.T.changed()) sa po
// KAŽDEJ zmene uložia do localStorage 'hlbina.tuning.v1' a pri štarte sa načítajú,
// takže ďalšia relácia ich nehádže znova. Export/Import JSON ich prenesie inam.
//
// Kým je panel otvorený, input.js ignoruje keydown — herné klávesy neprejdú.
// Po zatvorení panel vráti fokus hre, aby šípky a medzerník znova patrili jej.
(function (HL) {
  var DL = HL.dials = {};
  var KEY = DL.KEY = 'hlbina.tuning.v1';
  var root = null, open = false, filter = '', status = null, rows = {};
  // allowed: main.js po HL.platform.init volá DL.allow(HL.devTools) — na CrazyGames bez ?debug=1 false.
  // fromStore: kľúče, ktoré DL.init nastavil z uloženého ladenia (DL.allow(false) ich vráti na predvolené).
  var allowed = true, fromStore = [];

  function storage() {
    try {
      var s = window.localStorage; s.getItem(KEY);
      // Testovací odkaz: vlastné ladenie, nie to z verejného odkazu na tom istom origine (core/platform.js storeNs).
      var P = HL.platform;
      return P && P.nsStore ? P.nsStore(s, P.storeNs(window.location && window.location.href)) : s;
    } catch (e) { return null; }
  }
  function query() {
    if (HL.query) return HL.query;
    var q = {};
    try {
      location.search.replace(/^\?/, '').split('&').forEach(function (kv) {
        if (!kv) return;
        var i = kv.indexOf('=');
        q[decodeURIComponent(i < 0 ? kv : kv.slice(0, i))] = i < 0 ? '1' : decodeURIComponent(kv.slice(i + 1));
      });
    } catch (e) { /* bez location */ }
    return q;
  }

  // Uloží zmenené hodnoty; prázdny zoznam = záznam sa zmaže (čistý štart).
  DL.save = function () {
    var s = storage();
    if (!s) return false;
    try {
      var ch = HL.T.changed();
      if (Object.keys(ch).length) s.setItem(KEY, JSON.stringify(ch)); else s.removeItem(KEY);
      return true;
    } catch (e) { return false; }
  };

  // Pri štarte: načíta uložené hodnoty. Poškodený záznam hru nezastaví.
  DL.init = function () {
    var s = storage();
    if (s) {
      try {
        var raw = s.getItem(KEY);
        if (raw) {
          var obj = JSON.parse(raw);
          if (obj && typeof obj === 'object' && !Array.isArray(obj)) { HL.T.apply(obj); fromStore = Object.keys(obj); }
        }
      } catch (e) {
        if (typeof console !== 'undefined') console.warn('Ladenie: uložené hodnoty sa nedajú načítať (' + e.message + ')');
      }
    }
  };

  // Po HL.platform.init (main.js start): ok = HL.devTools. Panel je nástroj vývojára: na CrazyGames bez ?debug=1 sa
  // neotvorí žiadnou cestou (F2, Nastavenia, ?dials=1) a uložené ladenie z tohto prehliadača neplatí — hráč má čísla
  // z balíka (revízia 2026-10-04: tlačidlo v Nastaveniach panel na CrazyGames otváralo, klávesy nie).
  DL.allow = function (ok) {
    allowed = !!ok;
    if (!allowed) {
      if (open) DL.close();
      for (var i = 0; i < fromStore.length; i++) HL.T.reset(fromStore[i]);
      fromStore = [];
      return;
    }
    var q = query();
    if (q.dials === '1' || q.dials === 'true') DL.open();
  };
  DL.allowed = function () { return allowed; };

  DL.isOpen = function () { return open; };
  DL.toggle = function () { if (open) DL.close(); else DL.open(); };

  DL.open = function () {
    if (typeof document === 'undefined' || !allowed) return;
    if (!root) build();
    render();
    root.style.display = 'flex';
    open = true;
    var f = root.querySelector('.hl-dials-filter');
    if (f) try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); }
  };

  DL.close = function () {
    if (!root) { open = false; return; }
    root.style.display = 'none';
    open = false;
    // Fokus nesmie ostať v zatvorenom paneli (šípky by posúvali neviditeľný posuvník).
    var a = document.activeElement;
    if (a && root.contains(a) && a.blur) a.blur();
    var c = HL.view && HL.view.canvas;
    if (c && c.focus) try { c.focus({ preventScroll: true }); } catch (e) { c.focus(); }
  };

  // Nastaví hodnotu (orezanú na rozsah), uloží a obnoví riadok. Vracia skutočnú hodnotu.
  DL.set = function (key, v) {
    var o = {}; o[key] = Number(v);
    HL.T.apply(o);
    DL.save();
    refreshRow(key);
    return HL.T[key];
  };
  DL.reset = function (key) {
    HL.T.reset(key);
    DL.save();
    if (key) refreshRow(key); else render();
  };
  DL.exportJSON = function () { return JSON.stringify(HL.T.changed(), null, 2); };
  // Import: objekt {kľúč: číslo}. Neznáme kľúče a nečísla sa preskočia a spočítajú.
  DL.importJSON = function (text) {
    var obj = JSON.parse(text);
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('čakám objekt { "kľúč": číslo }');
    var ok = 0, skipped = [];
    var clean = {};
    for (var k in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
      if (!HL.T._meta[k] || !isFinite(Number(obj[k]))) { skipped.push(k); continue; }
      clean[k] = Number(obj[k]); ok++;
    }
    HL.T.apply(clean);
    DL.save();
    if (root) render();
    return { applied: ok, skipped: skipped };
  };

  // ------------------------------------------------------------------ DOM
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function fmt(v) { return String(v); }

  function build() {
    var P = HL.pal;
    var css = [
      '.hl-dials{position:fixed;top:0;right:0;bottom:0;width:min(380px,100vw);z-index:1000;display:none;flex-direction:column;',
      'background:' + P.rgba(P.ink, 0.96) + ';color:' + P.greyLight + ';font:12px/1.35 Consolas,Menlo,monospace;',
      'border-left:2px solid ' + P.slateDark + ';box-sizing:border-box}',
      '.hl-dials *{box-sizing:border-box}',
      '.hl-dials-head{padding:8px;border-bottom:1px solid ' + P.slateDark + ';display:flex;flex-wrap:wrap;gap:4px;align-items:center}',
      '.hl-dials-title{color:' + P.amber + ';font-weight:bold;flex:1 1 100%;margin-bottom:2px}',
      '.hl-dials button{background:' + P.slateDark + ';color:' + P.white + ';border:1px solid ' + P.slate + ';padding:3px 6px;font:inherit;cursor:pointer}',
      '.hl-dials button:hover{background:' + P.slate + '}',
      '.hl-dials input[type=number],.hl-dials input[type=search],.hl-dials textarea{background:' + P.navy + ';color:' + P.white + ';border:1px solid ' + P.slateDark + ';font:inherit}',
      '.hl-dials-filter{flex:1 1 100%;padding:3px 5px;margin-top:4px}',
      '.hl-dials-status{flex:1 1 100%;color:' + P.greenLight + ';min-height:1em}',
      '.hl-dials-body{overflow-y:auto;flex:1;padding:4px 8px 16px}',
      '.hl-dials details{margin:6px 0}',
      '.hl-dials summary{color:' + P.cyan + ';cursor:pointer;padding:2px 0}',
      '.hl-dials-row{padding:4px 0 4px 6px;border-left:2px solid transparent}',
      '.hl-dials-row.changed{border-left-color:' + P.amber + '}',
      '.hl-dials-label{display:block;color:' + P.greyLight + '}',
      '.hl-dials-key{color:' + P.slate + ';font-size:11px}',
      '.hl-dials-ctl{display:flex;gap:4px;align-items:center}',
      '.hl-dials-ctl input[type=range]{flex:1;min-width:0;accent-color:' + P.amber + '}',
      '.hl-dials-ctl input[type=number]{width:74px;padding:1px 3px}',
      '.hl-dials-imp{flex:1 1 100%;display:none;flex-direction:column;gap:4px}',
      '.hl-dials-imp textarea{height:90px;width:100%}',
    ].join('');
    var style = el('style');
    style.textContent = css;
    document.head.appendChild(style);

    root = el('div', 'hl-dials');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Ladenie');
    var head = el('div', 'hl-dials-head');
    head.appendChild(el('div', 'hl-dials-title', 'Ladenie (F2) — hodnoty sa ukladajú hneď'));
    var bReset = el('button', null, 'Resetovať všetko');
    bReset.onclick = function () { DL.reset(); say('Všetko vrátené na predvolené hodnoty.'); };
    var bExp = el('button', null, 'Export JSON');
    bExp.onclick = doExport;
    var bImp = el('button', null, 'Import JSON');
    var bClose = el('button', null, 'Zavrieť');
    bClose.onclick = function () { DL.close(); };
    head.appendChild(bReset); head.appendChild(bExp); head.appendChild(bImp); head.appendChild(bClose);

    var imp = el('div', 'hl-dials-imp');
    var ta = el('textarea');
    ta.placeholder = '{ "sinkBase": 12 }';
    var impRow = el('div', 'hl-dials-ctl');
    var bApply = el('button', null, 'Použiť');
    var bFile = el('button', null, 'Zo súboru…');
    var file = el('input');
    file.type = 'file'; file.accept = '.json,application/json'; file.style.display = 'none';
    impRow.appendChild(bApply); impRow.appendChild(bFile); impRow.appendChild(file);
    imp.appendChild(ta); imp.appendChild(impRow);
    bImp.onclick = function () { imp.style.display = imp.style.display === 'flex' ? 'none' : 'flex'; if (imp.style.display === 'flex') ta.focus(); };
    bApply.onclick = function () { doImport(ta.value); };
    bFile.onclick = function () { file.click(); };
    file.onchange = function () {
      var f = file.files && file.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () { ta.value = String(r.result); doImport(ta.value); };
      r.readAsText(f);
      file.value = '';
    };
    head.appendChild(imp);

    var fl = el('input', 'hl-dials-filter');
    fl.type = 'search';
    fl.placeholder = 'Hľadať (kľúč, popis, skupina)…';
    fl.oninput = function () { filter = fl.value.toLowerCase(); render(); };
    head.appendChild(fl);
    status = el('div', 'hl-dials-status');
    head.appendChild(status);

    var body = el('div', 'hl-dials-body');
    root.appendChild(head);
    root.appendChild(body);
    // Esc zavrie panel; klávesy z polí nesmú ísť ďalej do hry ani prehliadača.
    root.addEventListener('keydown', function (e) {
      if (e.code === 'Escape') { DL.close(); e.preventDefault(); }
      if (e.code !== 'F2' && e.code !== 'F3') e.stopPropagation();
    });
    document.body.appendChild(root);
  }

  function say(msg, bad) {
    if (!status) return;
    status.textContent = msg;
    status.style.color = bad ? HL.pal.red : HL.pal.greenLight;
  }

  function doExport() {
    var data = DL.exportJSON();
    var parts = [];
    try {
      var blob = new Blob([data], { type: 'application/json' });
      var a = el('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'hlbina-ladenie.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      parts.push('stiahnuté');
    } catch (e) { /* bez Blob */ }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(data).then(function () { say('Export: ' + parts.concat('skopírované do schránky').join(', ') + '.'); },
          function () { say('Export: ' + (parts.join(', ') || 'nič') + ' (schránka nedostupná).'); });
      }
    } catch (e) { /* schránka zakázaná */ }
    say('Export: ' + (parts.join(', ') || 'nič') + '.');
    DL.lastExport = data;
  }

  function doImport(text) {
    try {
      var r = DL.importJSON(text);
      say('Import: použitých ' + r.applied + (r.skipped.length ? ', preskočené: ' + r.skipped.join(', ') : '') + '.');
    } catch (e) {
      say('Import zlyhal: ' + e.message, true);
    }
  }

  function render() {
    var body = root.querySelector('.hl-dials-body');
    body.textContent = '';
    rows = {};
    var meta = HL.T._meta;
    var groups = {}, order = [];
    for (var k in meta) {
      var m = meta[k];
      var hay = (k + ' ' + m.label + ' ' + m.group).toLowerCase();
      if (filter && hay.indexOf(filter) < 0) continue;
      if (!groups[m.group]) { groups[m.group] = []; order.push(m.group); }
      groups[m.group].push(k);
    }
    order.forEach(function (g) {
      var det = el('details');
      det.open = true;
      det.appendChild(el('summary', null, g + ' (' + groups[g].length + ')'));
      groups[g].forEach(function (key) { det.appendChild(row(key)); });
      body.appendChild(det);
    });
    if (!order.length) body.appendChild(el('div', null, 'Nič nezodpovedá hľadaniu.'));
  }

  function row(key) {
    var m = HL.T._meta[key];
    var r = el('div', 'hl-dials-row');
    r.dataset.key = key;
    var lab = el('label', 'hl-dials-label');
    lab.appendChild(document.createTextNode(m.label + ' '));
    lab.appendChild(el('span', 'hl-dials-key', key));
    var ctl = el('div', 'hl-dials-ctl');
    var range = el('input');
    range.type = 'range'; range.min = m.min; range.max = m.max; range.step = m.step;
    range.setAttribute('aria-label', m.label);
    var num = el('input');
    num.type = 'number'; num.min = m.min; num.max = m.max; num.step = m.step;
    num.setAttribute('aria-label', m.label + ' (číslo)');
    var rst = el('button', null, '↺');
    rst.title = 'Predvolená: ' + fmt(m.def);
    range.oninput = function () { DL.set(key, range.value); };
    num.onchange = function () { if (num.value !== '' && isFinite(Number(num.value))) DL.set(key, num.value); else refreshRow(key); };
    rst.onclick = function () { DL.reset(key); };
    ctl.appendChild(range); ctl.appendChild(num); ctl.appendChild(rst);
    r.appendChild(lab); r.appendChild(ctl);
    rows[key] = { r: r, range: range, num: num };
    refreshRow(key);
    return r;
  }

  function refreshRow(key) {
    var x = rows[key];
    if (!x) return;
    var v = HL.T[key], m = HL.T._meta[key];
    x.range.value = v;
    x.num.value = fmt(v); // aj počas písania: po 'change' ukáže hodnotu orezanú na rozsah
    x.r.classList.toggle('changed', v !== m.def);
  }

  DL._root = function () { return root; };
})(globalThis.HL);
