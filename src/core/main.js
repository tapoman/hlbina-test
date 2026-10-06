// Štart, hlavná slučka, správca scén, zobrazenie a ladiace nástroje.
//
// Zobrazenie (dizajn 14.1): logická herná plocha 180×320 na výšku, celočíselne
// zväčšená (pixely ostanú ostré). Na širokej obrazovke pribudnú bočné panely
// (dizajn: "na PC s bočnými panelmi") a logické plátno má šírku W = 180 + 2×PANEL.
// Canvas má rozmery LOGICKÉ; zväčšuje ho CSS s image-rendering: pixelated.
//
// Scény: HL.scenes.def(meno, { enter(params), exit(), update(dt), draw(ctx),
//        drawPanel(ctx, 'L'|'R', w, h), probe(), gameplay() })  — všetko okrem draw je voliteľné.
//        gameplay() → true, kým sa naozaj hrá (CrazyGames gameplayStart/Stop, core/platform.js).
//        HL.go(meno, params) prepne scénu na začiatku ďalšieho kroku.
// Slučka: pevný krok 1/60 s (simulácia je deterministická), vykreslenie raz za snímok.
(function (HL) {
  var PW = 180, H = 320, PANEL = 110;
  var STEP = 1 / 60;

  var view = HL.view = { W: PW, H: H, PW: PW, playX: 0, panels: false, scale: 1, canvas: null, ctx: null };
  var dbg = HL.debug = { on: false, errors: [], colorErrors: [], steps: 0, frames: 0, fps: 0, timeScale: 1 };

  // ------------------------------------------------------------------ scény
  var registry = {};
  var current = null, currentName = null, pending = null;
  HL.scenes = {
    def: function (name, scene) { registry[name] = scene; },
    get: function (name) { return registry[name]; },
    names: function () { return Object.keys(registry); },
  };
  HL.go = function (name, params) {
    HL.assert(registry[name], 'neznáma scéna ' + name);
    pending = { name: name, params: params || {} };
  };
  Object.defineProperty(HL, 'scene', { get: function () { return currentName; } });

  function switchScene() {
    if (!pending) return;
    var p = pending; pending = null;
    if (current && current.exit) current.exit();
    current = registry[p.name]; currentName = p.name;
    if (HL.w && HL.w.reset) HL.w.reset();
    if (current.enter) current.enter(p.params);
  }

  // ------------------------------------------------------------------ parametre URL
  var Q = {};
  if (HL.isBrowser) {
    location.search.replace(/^\?/, '').split('&').forEach(function (kv) {
      if (!kv) return;
      var i = kv.indexOf('=');
      Q[decodeURIComponent(i < 0 ? kv : kv.slice(0, i))] = i < 0 ? '1' : decodeURIComponent(kv.slice(i + 1));
    });
  }
  HL.query = Q;

  // ------------------------------------------------------------------ strážca farieb
  // Neplatnú farbu (napr. 'rgba(NaN,0,0,1)') prehliadač TICHO ignoruje a kreslí
  // predchádzajúcou — scéna "len vyzerá tmavo" a nikde nie je chyba. Zachytíme to.
  function guardColors() {
    var proto = CanvasRenderingContext2D.prototype;
    ['fillStyle', 'strokeStyle'].forEach(function (prop) {
      var d = Object.getOwnPropertyDescriptor(proto, prop);
      if (!d || !d.set) return;
      Object.defineProperty(proto, prop, {
        configurable: true, enumerable: d.enumerable, get: d.get,
        set: function (v) {
          // Aj ne-reťazce: fillStyle = undefined/null/NaN prehliadač TICHO ignoruje rovnako (kreslí starou farbou).
          var bad = typeof v === 'string' ? (v.indexOf('NaN') >= 0 || v.indexOf('undefined') >= 0 || v === '')
            : (v === undefined || v === null || typeof v === 'number' || typeof v === 'boolean');
          if (bad) {
            v = String(v);
            if (dbg.colorErrors.length < 50) {
              dbg.colorErrors.push({ prop: prop, value: v, scene: currentName, stack: (new Error().stack || '').split('\n').slice(2, 4).join(' | ') });
              if (dbg.colorErrors.length === 1) console.error('Neplatná farba ' + prop + ' = ' + v);
            }
          }
          d.set.call(this, v);
        },
      });
    });
  }

  // ------------------------------------------------------------------ mobil (ladenie F2: skupina „Mobil")
  var T = HL.T;
  T.def('Mobil', 'phoneMaxShortPx', 540, 300, 1000, 10, 'Telefón = kratšia strana obrazovky najviac toľko CSS px (na šírku potom rada „Otoč telefón")');
  T.def('Mobil', 'rotateHintMaxCssPx', 2, 1, 4, 0.5, 'Rada „Otoč telefón": najväčší pixel rady v CSS px (menší, keď sa do okraja nezmestí)');
  T.def('Mobil', 'rotateHintFrameSec', 0.8, 0.2, 3, 0.1, 'Rada „Otoč telefón": ako dlho trvá jeden obrázok animácie (s)');
  T.def('Mobil', 'wakeRetrySec', 5, 1, 60, 1, 'Zákaz zhasnutia obrazovky: po zamietnutí skúsiť znova o (s)');
  T.def('Mobil', 'wakePollSec', 0.25, 0.05, 2, 0.05, 'Zákaz zhasnutia obrazovky: ako často sa kontroluje ponor/pauza (s)');

  // Bezpečné okraje (výrez, zaoblené rohy, domovská lišta) v CSS px. index.html ich dáva do premenných
  // --sat/--sar/--sab/--sal z env(safe-area-inset-*) a #safe ich má ako padding — čítať vypočítaný
  // padding je spoľahlivé aj tam, kde getPropertyValue vlastnej premennej vráti nevyhodnotený text.
  function safeInsets() {
    var el = document.getElementById('safe');
    var z = { top: 0, right: 0, bottom: 0, left: 0 };
    if (!el || !window.getComputedStyle) return z;
    var cs = getComputedStyle(el);
    function n(v) { v = parseFloat(v); return isFinite(v) && v > 0 ? v : 0; }
    return { top: n(cs.paddingTop), right: n(cs.paddingRight), bottom: n(cs.paddingBottom), left: n(cs.paddingLeft) };
  }

  // ------------------------------------------------------------------ rozloženie
  function layout() {
    var ww = window.innerWidth, wh = window.innerHeight;
    var ins = safeInsets();
    var pixelPerfect = !(HL.game && HL.game.settings && HL.game.settings.pixelPerfect === false);
    var dpr = window.devicePixelRatio || 1;
    var L = HL.viewLayout(ww, wh, dpr, pixelPerfect, ins, !!Q.nopanels);
    view.panels = L.panels;
    view.W = L.W;
    view.playX = view.panels ? PANEL : 0;
    var f = L.fit;
    view.scale = f.scale; view.dpr = dpr; view.devicePerPx = f.devicePerPx; view.exact = f.exact;
    view.inset = ins;
    if (view.canvas.width !== view.W) view.canvas.width = view.W;
    if (view.canvas.height !== H) view.canvas.height = H;
    var cs = view.canvas.style;
    cs.width = f.cssW + 'px';
    cs.height = f.cssH + 'px';
    // Poloha na celý pixel ZARIADENIA (flex centrovanie by pri nepárnom zvyšku dalo pol pixela).
    cs.position = 'absolute'; cs.left = f.left + 'px'; cs.top = f.top + 'px';
    view.ctx.imageSmoothingEnabled = false;
    layoutHint(ww, wh, ins, f, dpr);
  }

  // Rozloženie bez prehliadača (čistá funkcia): bočné panely v širokom okne + mierka (HL.viewFit). Volá ju layout()
  // a testy — tests/unit/crazygames.test.js meria čitateľnosť v rámoch CrazyGames touto istou cestou.
  HL.viewLayout = function (ww, wh, dpr, pixelPerfect, inset, nopanels) {
    var ins = inset || {};
    var aw = Math.max(1, ww - (ins.left || 0) - (ins.right || 0)), ah = Math.max(1, wh - (ins.top || 0) - (ins.bottom || 0));
    var wide = aw / ah >= (PW + 2 * PANEL) / H * 0.98;
    var panels = wide && !nopanels;
    var W = panels ? PW + 2 * PANEL : PW;
    return { panels: panels, W: W, H: H, fit: HL.viewFit(ww, wh, W, H, dpr, pixelPerfect, inset) };
  };

  // Mierka zobrazenia (dizajn 14.1: "celočíselne zväčšované, pixely ostanú ostré").
  // Celé číslo musí platiť v PIXELOCH ZARIADENIA, nie v CSS px: pri 125 % / 175 % škálovaní
  // Windows by 2 CSS px na logický pixel boli 2,5 / 3,5 px displeja a stĺpce by sa striedali
  // 2-3-2-3 (review #39) → mierka = floor(fit · dpr) / dpr. Keď sa nezmestí ani 1 px zariadenia
  // na logický pixel (okno menšie ako plocha), radšej zlomková mierka než orezaný HUD
  // a nedosiahnuteľné HORE (review #37). Čistá funkcia — overujú ju testy bez prehliadača.
  // inset (voliteľné) = bezpečné okraje v CSS px { top, right, bottom, left }: plocha sa zmestí
  // do okna MÍNUS okraje (nie pod výrez ani domovskú lištu); okraje sa zaokrúhlia DOVNÚTRA na celé
  // pixely zariadenia, takže roh ostane na celom pixeli. Bez inset je výsledok presne ako predtým.
  //   → { scale (CSS px na logický px), cssW, cssH, left, top (CSS px), devicePerPx, exact }
  HL.viewFit = function (ww, wh, W, Hh, dpr, pixelPerfect, inset) {
    dpr = dpr > 0 ? dpr : 1;
    var ins = inset || {};
    var aL = Math.ceil((ins.left || 0) * dpr - 1e-6), aT = Math.ceil((ins.top || 0) * dpr - 1e-6);
    var aR = ww * dpr - Math.ceil((ins.right || 0) * dpr - 1e-6), aB = wh * dpr - Math.ceil((ins.bottom || 0) * dpr - 1e-6);
    var areaW = Math.max(1, aR - aL), areaH = Math.max(1, aB - aT); // v pixeloch zariadenia
    var fit = Math.min(areaW / dpr / W, areaH / dpr / Hh);
    var k = Math.floor(fit * dpr + 1e-9); // celé pixely zariadenia na logický pixel
    var exact = !!pixelPerfect && k >= 1;
    var scale = exact ? k / dpr : Math.max(0.25, fit);
    var dev = exact ? k : scale * dpr;
    // ľavý horný roh na celý pixel zariadenia (počítané v pixeloch zariadenia, bez chyby delenia)
    var left = (aL + Math.max(0, Math.floor((areaW - W * dev) / 2))) / dpr;
    var top = (aT + Math.max(0, Math.floor((areaH - Hh * dev) / 2))) / dpr;
    return { scale: scale, cssW: W * dev / dpr, cssH: Hh * dev / dpr, left: left, top: top, devicePerPx: dev, exact: exact };
  };

  // ------------------------------------------------------------------ rada "Otoč telefón na výšku"
  // Hra je na výšku (dizajn 14.1). Telefón na šírku ju zmenší na ~1 CSS px na pixel a HORE má
  // potom ~20 CSS px — preto rada otočiť telefón. ZÁMERNE NEZAKRÝVA hru ani ju nezastaví: sedí
  // v prázdnych bočných okrajoch, dotyky prepúšťa (pointer-events: none) a hra beží ďalej.
  // Plné prekrytie by vrátilo review #37 (na telefóne na šírku sa nedalo stlačiť HORE uprostred
  // boja; stráži tools/fix_input_view.js). Desktop (jemný ukazovateľ) radu nikdy nedostane.
  // Telefón = hrubý ukazovateľ (prst) a kratšia strana obrazovky ≤ T.phoneMaxShortPx CSS px.
  var hint = { on: false, k: 0, reason: 'nie', els: null, frame: -1, card: null, rects: [] };
  HL.phoneLandscape = function (ww, wh, coarse, screenW, screenH, maxShort) {
    if (!(ww > wh) || !coarse) return false;
    var s = Math.min(screenW || ww, screenH || wh);
    return s <= maxShort;
  };
  // i18n-dev: hideHint (dôvod skrytia rady je pre harness/sondu, nie pre hráča)
  function hintLines() { return [HL.i18n.t('ui.common.rotate1'), HL.i18n.t('ui.common.rotate2')]; }
  function hintSize(compact) {
    var F = HL.font, tw = 0, HINT_LINES = hintLines();
    for (var i = 0; i < HINT_LINES.length; i++) tw = Math.max(tw, F.measure(HINT_LINES[i]));
    if (compact) return { w: 26, h: 26 };
    return { w: Math.max(tw, 22) + 10, h: 6 + 20 + 5 + 2 * F.lineStep() + 4 };
  }
  // Telefónik: na šírku (obrázok 0, šípka otáčania) → na výšku (obrázok 1, fajka).
  function drawPhone(ctx, x, y, w, h, landscape) {
    var D = HL.draw, P = HL.pal;
    D.rect(ctx, x + 1, y, w - 2, h, P.greyLight);
    D.rect(ctx, x, y + 1, w, h - 2, P.greyLight);
    if (landscape) {
      D.rect(ctx, x + 3, y + 1, w - 6, h - 2, P.blue);
      D.rect(ctx, x + 3, y + h - 3, w - 6, 2, P.blueDark);
      D.rect(ctx, x + 1, y + (h >> 1) - 1, 1, 2, P.slate);
    } else {
      D.rect(ctx, x + 1, y + 3, w - 2, h - 6, P.blue);
      D.rect(ctx, x + 1, y + h - 6, w - 2, 3, P.blueDark);
      D.rect(ctx, x + (w >> 1) - 1, y + 1, 2, 1, P.slate);
    }
  }
  function drawHintCard(ctx, w, h, frame, compact) {
    var D = HL.draw, P = HL.pal, F = HL.font;
    ctx.clearRect(0, 0, w, h);
    D.panel(ctx, 0, 0, w, h);
    var ix = Math.floor(w / 2), iy = compact ? 3 : 5;
    if (frame === 0) {
      drawPhone(ctx, ix - 8, iy + 8, 16, 10, true);
      // šípka otáčania v smere hodín nad telefónom
      D.rect(ctx, ix - 5, iy + 2, 8, 1, P.amber);
      D.rect(ctx, ix - 7, iy + 3, 2, 1, P.amber);
      D.rect(ctx, ix - 8, iy + 4, 1, 2, P.amber);
      D.rect(ctx, ix + 3, iy + 1, 1, 3, P.amber);
      D.rect(ctx, ix + 4, iy + 2, 1, 1, P.amber);
    } else {
      drawPhone(ctx, ix - 5, iy + 1, 10, 18, false);
      // fajka vpravo dole
      D.rect(ctx, ix + 6, iy + 13, 1, 1, P.greenLight);
      D.rect(ctx, ix + 7, iy + 14, 1, 1, P.greenLight);
      D.rect(ctx, ix + 8, iy + 13, 1, 1, P.greenLight);
      D.rect(ctx, ix + 9, iy + 12, 1, 1, P.greenLight);
      D.rect(ctx, ix + 10, iy + 11, 1, 1, P.greenLight);
    }
    if (compact) return;
    var ty = iy + 20 + 5, HINT_LINES = hintLines();
    F.draw(ctx, HINT_LINES[0], w / 2, ty, P.amber, { align: 'center', shadow: P.ink });
    F.draw(ctx, HINT_LINES[1], w / 2, ty + F.lineStep(), P.white, { align: 'center', shadow: P.ink });
  }
  function hintEls() {
    if (hint.els) return hint.els;
    hint.els = [];
    for (var i = 0; i < 2; i++) {
      var c = document.createElement('canvas');
      c.className = 'rot'; c.id = i ? 'rotR' : 'rotL';
      document.body.appendChild(c);
      hint.els.push(c);
    }
    return hint.els;
  }
  function hideHint(reason) {
    hint.on = false; hint.reason = reason; hint.k = 0; hint.rects = [];
    if (hint.els) for (var i = 0; i < hint.els.length; i++) hint.els[i].style.display = 'none';
  }
  function layoutHint(ww, wh, ins, f, dpr) {
    var coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    var scr = window.screen || {};
    if (!HL.phoneLandscape(ww, wh, coarse, scr.width, scr.height, T.phoneMaxShortPx)) return hideHint(coarse ? 'nie je telefón na šírku' : 'jemný ukazovateľ');
    // voľné okraje vedľa plátna (v pixeloch zariadenia), bez bezpečných okrajov
    var cL = f.left * dpr, cR = (f.left + f.cssW) * dpr;
    var mL = cL - Math.ceil(ins.left * dpr), mR = Math.floor((ww - ins.right) * dpr) - cR;
    var m = Math.min(mL, mR), pad = Math.ceil(4 * dpr);
    var kMin = Math.max(1, Math.round(dpr)), kMax = Math.max(kMin, Math.floor(T.rotateHintMaxCssPx * dpr));
    var compact = false, sz = hintSize(false);
    var k = Math.min(kMax, Math.floor((m - 2 * pad) / sz.w));
    if (k < kMin) { compact = true; sz = hintSize(true); k = Math.min(kMax, Math.floor((m - 2 * pad) / sz.w)); }
    if (k < kMin) return hideHint('okraj je úzky');
    var els = hintEls();
    var areaT = Math.ceil(ins.top * dpr), areaB = Math.floor((wh - ins.bottom) * dpr);
    var hDev = sz.h * k, wDev = sz.w * k;
    var top = areaT + Math.max(0, Math.floor((areaB - areaT - hDev) / 2));
    var lefts = [Math.ceil(ins.left * dpr) + Math.floor((mL - wDev) / 2), Math.ceil(cR) + Math.floor((mR - wDev) / 2)];
    hint.rects = [];
    for (var i = 0; i < 2; i++) {
      var c = els[i];
      c.setAttribute('aria-label', hintLines().join(' '));
      if (c.width !== sz.w) c.width = sz.w;
      if (c.height !== sz.h) c.height = sz.h;
      var s = c.style;
      s.width = (wDev / dpr) + 'px'; s.height = (hDev / dpr) + 'px';
      s.left = (lefts[i] / dpr) + 'px'; s.top = (top / dpr) + 'px';
      s.display = 'block';
      hint.rects.push({ x: lefts[i] / dpr, y: top / dpr, w: wDev / dpr, h: hDev / dpr });
    }
    hint.on = true; hint.k = k; hint.compact = compact; hint.reason = 'telefón na šírku'; // i18n-ok: sonda
    hint.card = sz; hint.frame = -1;
    drawHint(0);
  }
  function drawHint(t) {
    if (!hint.on || !hint.els) return;
    var frame = Math.floor(t / Math.max(0.05, T.rotateHintFrameSec)) % 2;
    if (frame === hint.frame) return;
    hint.frame = frame;
    for (var i = 0; i < hint.els.length; i++) {
      var ctx = hint.els[i].getContext('2d');
      ctx.imageSmoothingEnabled = false;
      drawHintCard(ctx, hint.card.w, hint.card.h, frame, hint.compact);
    }
  }

  // ------------------------------------------------------------------ obrazovka nezhasne počas ponoru
  // Screen Wake Lock: iba v scéne ponoru, nie v pauze ani so skrytou kartou; pri odchode sa uvoľní.
  // Prehliadač zámok sám zruší pri skrytí karty — po návrate do ponoru sa vyžiada znova.
  // Chýbajúce API (Firefox, starší iOS, http v sieti) = ticho nič; zamietnutie → nový pokus o T.wakeRetrySec.
  var wake = HL.wake = { supported: false, wanted: false, held: false, pending: false, error: null, requests: 0, releases: 0 };
  var wakeSentinel = null, wakeRetryAt = 0, wakePollAt = 0;
  function divePaused() {
    try { var p = current && current.probe ? current.probe() : null; return !!(p && p.paused); } catch (e) { return false; }
  }
  function updateWake(nowMs) {
    wake.supported = !!(typeof navigator !== 'undefined' && navigator.wakeLock && navigator.wakeLock.request);
    var want = currentName === 'dive' && !document.hidden && !divePaused();
    wake.wanted = want;
    if (!want && wakeSentinel) {
      var old = wakeSentinel; wakeSentinel = null; wake.held = false;
      try { old.release().catch(function () {}); } catch (e) { /* už uvoľnený */ }
    }
    if (!want || !wake.supported || wakeSentinel || wake.pending || nowMs < wakeRetryAt) return;
    wake.pending = true; wake.requests++;
    var pr;
    try { pr = navigator.wakeLock.request('screen'); } catch (e) { pr = Promise.reject(e); }
    pr.then(function (s) {
      wake.pending = false;
      s.addEventListener('release', function () { wake.releases++; if (wakeSentinel === s) { wakeSentinel = null; wake.held = false; } });
      if (!wake.wanted) { s.release().catch(function () {}); return; } // medzitým odišiel z ponoru
      wakeSentinel = s; wake.held = true; wake.error = null;
    }, function (e) {
      wake.pending = false; wake.error = String((e && e.name) || e);
      wakeRetryAt = now() + T.wakeRetrySec * 1000;
    });
  }
  function now() { return (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0; }

  // ------------------------------------------------------------------ celá obrazovka (Android, prvé ťuknutie)
  // Android Chrome v karte zaberá hore adresný riadok; prvé ťuknutie PRSTOM (pointerup = aktivácia
  // používateľom; pri pointerdown by prechod zrušil gesto) požiada o celú obrazovku — raz za načítanie.
  // Nie na iPhone (requestFullscreen tam pre stránku nie je), nie keď už beží ako aplikácia
  // (display-mode standalone/fullscreen), nie s ?nofs=1. Odmietnutie nič nerozbije.
  var fs = HL.fullscreen = { tried: false, result: null };
  function maybeFullscreen(e) {
    if (fs.tried || !e || e.pointerType === 'mouse' || Q.nofs) return;
    // CrazyGames: hra beží v ich iframe a celú obrazovku dáva ich vlastné tlačidlo — hra si ju nevypýta sama.
    if (HL.platform && HL.platform.name === 'crazygames') { fs.result = 'platforma'; return; } // i18n-ok: sonda
    if (!/Android/i.test((navigator && navigator.userAgent) || '')) return;
    var de = document.documentElement;
    if (!de || typeof de.requestFullscreen !== 'function' || document.fullscreenElement) return;
    var mm = window.matchMedia;
    if (mm && (mm('(display-mode: fullscreen)').matches || mm('(display-mode: standalone)').matches)) { fs.result = 'app'; return; }
    fs.tried = true;
    try {
      var p = de.requestFullscreen({ navigationUI: 'hide' });
      if (p && p.then) p.then(function () { fs.result = 'ok'; }, function (err) { fs.result = 'odmietnuté: ' + ((err && err.name) || err); }); // i18n-ok: sonda
      else fs.result = 'ok';
    } catch (err) { fs.result = 'chyba: ' + ((err && err.name) || err); } // i18n-ok: sonda
  }

  // ------------------------------------------------------------------ kreslenie
  function draw() {
    var ctx = view.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = HL.pal.ink;
    ctx.fillRect(0, 0, view.W, H);
    if (HL.w && HL.w.beginDraw) HL.w.beginDraw();

    if (view.panels) {
      drawPanel(ctx, 'L', 0);
      drawPanel(ctx, 'R', PANEL + PW);
    }
    ctx.save();
    ctx.translate(view.playX, 0);
    ctx.beginPath(); ctx.rect(0, 0, PW, H); ctx.clip();
    if (current) current.draw(ctx);
    if (HL.ui && HL.ui.drawOverlay) HL.ui.drawOverlay(ctx);
    ctx.restore();

    if (dbg.on) drawDebug(ctx);
    if (dbg.errors.length) drawErrorBar(ctx);
  }

  function drawPanel(ctx, side, x) {
    ctx.save();
    ctx.translate(x, 0);
    ctx.beginPath(); ctx.rect(0, 0, PANEL, H); ctx.clip();
    // Panel kreslí WIDGETY v súradniciach panela; widgets.js potrebuje vedieť posun,
    // aby zásahy myšou prepočítal. HL.w.pushOrigin/popOrigin to rieši.
    if (HL.w && HL.w.pushOrigin) HL.w.pushOrigin(x - view.playX, 0);
    if (current && current.drawPanel) current.drawPanel(ctx, side, PANEL, H);
    else defaultPanel(ctx, side);
    if (HL.w && HL.w.popOrigin) HL.w.popOrigin();
    ctx.restore();
  }

  // Bočný panel scén bez vlastného drawPanel (dedina, titulka …). HL.defaultPanel = pre testy (crazygames.test.js).
  HL.defaultPanel = function (ctx, side) { defaultPanel(ctx, side); };
  function defaultPanel(ctx, side) {
    HL.draw.panel(ctx, 2, 2, PANEL - 4, H - 4);
    var t = HL.i18n.t;
    if (side === 'L') {
      HL.font.draw(ctx, 'HLBINA', PANEL / 2, 10, HL.pal.cyan, { align: 'center', scale: 2 }); // i18n-ok: názov hry
      // Riadky s medzerou na začiatku sú odsadený popis klávesu nad nimi; mená kláves (W, H, Esc) sa neprekladajú.
      // Pauza: na CrazyGames „P" (Esc tam zatvára celú obrazovku — docs/CRAZYGAMES.md); F2/F3 len s nástrojmi vývojára.
      var lines = [t('ui.common.panel.controls'), '', t('ui.common.panel.keysMove'), ' ' + t('ui.common.panel.move'),
        t('ui.common.panel.keysSink'), ' ' + t('ui.common.panel.sink'), t('ui.common.panel.keysTap'), ' ' + t('ui.common.panel.fight'),
        'W', ' ' + t('ui.common.panel.up'), 'H', ' ' + t('ui.common.panel.harpoon'), HL.input.pauseKey(), ' ' + t('ui.common.panel.pause')];
      if (HL.devTools !== false) lines.push('', t('ui.common.panel.f2'), t('ui.common.panel.f3'));
      for (var i = 0; i < lines.length; i++) HL.font.draw(ctx, lines[i], 8, 34 + i * 10, i === 0 ? HL.pal.amber : HL.pal.greyLight);
    } else if (HL.game && HL.game.save) {
      var s = HL.game.save, e = HL.game.env();
      var rows = [
        [t('ui.common.panel.money'), HL.util.money(s.money)],
        [t('ui.common.panel.day'), String(e.day + 1)],
        [t('ui.common.panel.time'), HL.world.clockLabel(e.m)],
        [t('ui.common.panel.weather'), HL.world.weatherName(e.weather, e.m)],
        [t('ui.common.panel.moon'), HL.data.moonPhases[e.moon]],
      ];
      for (var j = 0; j < rows.length; j++) {
        HL.font.draw(ctx, rows[j][0], 8, 14 + j * 22, HL.pal.grey);
        HL.font.draw(ctx, rows[j][1], 8, 24 + j * 22, HL.pal.white);
      }
    }
  }

  function drawDebug(ctx) {
    var probe = current && current.probe ? current.probe() : null;
    // Ladiaci výpis F3 je pre vývojára — neprekladá sa.
    var txt = [
      'fps ' + dbg.fps + '  krok ' + dbg.steps + '  x' + dbg.timeScale, // i18n-ok: F3
      'scéna ' + currentName, // i18n-ok: F3
    ];
    if (probe) {
      for (var k in probe) {
        var v = probe[k];
        if (typeof v === 'object') continue;
        txt.push(k + ' ' + (typeof v === 'number' ? Math.round(v * 100) / 100 : v));
        if (txt.length > 22) break;
      }
    }
    ctx.fillStyle = HL.pal.rgba(HL.pal.ink, 0.75);
    ctx.fillRect(0, 0, 118, txt.length * 8 + 4);
    for (var i = 0; i < txt.length; i++) HL.font.draw(ctx, txt[i], 2, 2 + i * 8, HL.pal.greenLight, { small: true });
  }

  function drawErrorBar(ctx) {
    ctx.fillStyle = HL.pal.redDark;
    ctx.fillRect(0, H - 10, view.W, 10);
    HL.font.draw(ctx, HL.i18n.t('ui.common.errorBar', { msg: String(dbg.errors[dbg.errors.length - 1]).slice(0, 60) }), 2, H - 9, HL.pal.white, { small: true });
  }

  // ------------------------------------------------------------------ slučka
  var acc = 0, last = 0, fpsT = 0, fpsN = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    // Zmena DPR bez udalosti (emulácia v DevTools ju neohlási ani cez matchMedia) — lacná
    // kontrola raz za snímok, nech mierka v pixeloch zariadenia nikdy neostane stará.
    if ((window.devicePixelRatio || 1) !== view.dpr) onDpr();
    var dtReal = last ? Math.min(0.25, (t - last) / 1000) : STEP;
    last = t;
    fpsT += dtReal; fpsN++;
    if (fpsT >= 1) { dbg.fps = fpsN; fpsN = 0; fpsT = 0; }
    acc += dtReal * dbg.timeScale;
    var n = 0;
    while (acc >= STEP && n < 8 * dbg.timeScale) {
      step(STEP);
      acc -= STEP; n++;
    }
    if (n >= 8 * dbg.timeScale) acc = 0; // záseky: radšej spomaliť než dobiehať
    try { draw(); } catch (e) { report(e); }
    try {
      if (hint.on) drawHint(t / 1000);
      if (t >= wakePollAt) { wakePollAt = t + T.wakePollSec * 1000; updateWake(t); }
    } catch (e) { report(e); }
    dbg.frames++;
  }

  function step(dt) {
    try {
      switchScene();
      if (HL.w && HL.w.processInput) HL.w.processInput(dt);
      // Každé tlačidlo cvakne — jedno miesto namiesto volania v každej scéne.
      if (HL.w && HL.w.activatedIds && HL.w.activatedIds().length && HL.ui) HL.ui.sfx('ui_click');
      if (current && current.update) current.update(dt);
      // CrazyGames gameplayStart/Stop: „hrá sa" hlási scéna (scene.gameplay(), dnes len ponor bez pauzy, karty
      // a výsledku); každá iná scéna = nehrá sa. Platforma pošle SDK len ZMENU (docs/CRAZYGAMES.md).
      if (HL.platform) HL.platform.setGameplay(!!(current && current.gameplay && current.gameplay()));
      if (HL.ui && HL.ui.update) HL.ui.update(dt);
      if (HL.audio && HL.audio.update) HL.audio.update(dt);
    } catch (e) { report(e); }
    HL.input.endStep();
    dbg.steps++;
  }
  HL.step = step; // harness môže krokovať ručne (?manual=1)

  function report(e) {
    var msg = (e && e.message) || String(e);
    if (dbg.errors.length < 30) dbg.errors.push(msg);
    console.error(e);
  }

  function checkStale() {
    try { if (HL.game && HL.game.checkStale) HL.game.checkStale(); } catch (e) { report(e); }
  }

  // Zmena devicePixelRatio (lupa prehliadača, presun okna na iný monitor) nemusí poslať
  // 'resize' — mierka v pixeloch zariadenia by ostala stará. matchMedia na aktuálne dppx
  // sa ozve pri každej zmene; potom sa sleduje nová hodnota.
  var dprQuery = null;
  function onDpr() { layout(); watchDpr(); }
  function watchDpr() {
    if (!window.matchMedia) return;
    if (dprQuery) { if (dprQuery.removeEventListener) dprQuery.removeEventListener('change', onDpr); else if (dprQuery.removeListener) dprQuery.removeListener(onDpr); }
    dprQuery = window.matchMedia('(resolution: ' + (window.devicePixelRatio || 1) + 'dppx)');
    if (dprQuery.addEventListener) dprQuery.addEventListener('change', onDpr); else if (dprQuery.addListener) dprQuery.addListener(onDpr);
  }

  // ------------------------------------------------------------------ štart
  HL.boot = function () {
    var canvas = document.getElementById('game');
    view.canvas = canvas;
    view.ctx = canvas.getContext('2d', { alpha: false });
    guardColors();
    window.addEventListener('error', function (e) { report(e.error || e.message); });
    window.addEventListener('unhandledrejection', function (e) { report(e.reason); });

    // Naladené hodnoty z panela F2 musia platiť skôr, než sa čokoľvek nimi riadi.
    if (HL.dials && HL.dials.init) HL.dials.init();
    // Simulácia nesmie siahnuť na Date/Math.random/localStorage — dodáme jej to zvonku.
    var storage = null;
    try { storage = window.localStorage; storage.getItem('hlbina.probe'); } catch (e) { storage = null; }
    // Jazyky prehliadača (docs/I18N.md): prvé spustenie vyberie jazyk podľa nich; ?lang= má prednosť.
    var langs = [];
    try { langs = (navigator.languages && navigator.languages.length ? Array.prototype.slice.call(navigator.languages) : [navigator.language]).filter(Boolean); } catch (e) { langs = []; }
    // Atribút lang stránky ide za jazykom hry (čítačky obrazovky, preklad prehliadača).
    HL.i18n.onChange(function (code) { try { document.documentElement.lang = code; } catch (e) { /* bez dokumentu */ } });

    // Platforma (core/platform.js, docs/CRAZYGAMES.md): CrazyGames SDK v3, ak ho stránka načítala (len build
    // tools/build_crazygames.js), inak 'web'. Bez SDK je init hotový SYNCHRÓNNE a hra nabehne presne ako
    // predtým (dvojklik z file://, GitHub Pages, dist/Hlbina.html); s SDK HL.boot vráti Promise (čaká ho index.html).
    var sdk = null;
    try { sdk = (window.CrazyGames && window.CrazyGames.SDK) || null; } catch (e) { sdk = null; }
    HL.platform.loadingStart();
    var init = HL.platform.init({ sdk: sdk, local: storage, timeoutMs: Number(Q.cgtimeout) || 0 });
    if (HL.platform.ready) { start(canvas, langs); return; }
    return init.then(function () { start(canvas, langs); });
  };

  // Prvá scéna: ?scene z adresy (ladenie, harness), inak titulka. Na CrazyGames (Full launch: „land directly
  // in gameplay") hráč pristane rovno v dedine — uložená kariéra pokračuje, inak hrá tú novú, ktorú práve
  // vytvoril HL.game.init (dedina ukáže úvodný návod). Chyba načítania ide VŽDY na titulku (Obnoviť zálohu /
  // Začať odznova) — tam sa nič neprepíše. Titulka ostáva dostupná (Esc v dedine, Nastavenia → Vymazať).
  function firstScene() {
    if (Q.scene && registry[Q.scene]) return Q.scene;
    if (HL.platform.landInGameplay && !HL.game.loadError && registry.village) return 'village';
    return 'title';
  }

  function start(canvas, langs) {
    // Nástroje vývojára (panel F2, výpis F3, ich riadky v bočnom paneli a tlačidlo v Nastaveniach) sú na CrazyGames
    // len s ?debug=1. Pred HL.game.init: DL.allow(false) vráti uložené ladenie na predvolené skôr, než ho kariéra použije.
    HL.devTools = HL.platform.devTools(Q);
    if (HL.dials && HL.dials.allow) HL.dials.allow(HL.devTools);
    // Jazyk na CrazyGames: podľa ich SDK (systemInfo.locale), inak angličtina — nie podľa prehliadača (core/platform.js).
    langs = HL.platform.languages(langs);
    HL.game.init(Q, {
      entropy: ((Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0),
      storage: Q.nosave ? null : HL.platform.storage,
      month: new Date().getMonth(),
      languages: langs,
    });
    // CrazyGames muteAudio má prednosť pred zvukom v hre (aj živá zmena v ich nastaveniach).
    HL.platform.onMute(function (m) { if (HL.audio && HL.audio.setPlatformMute) HL.audio.setPlatformMute(m); });
    // Scenáre pre harness a ladenie (?demo=built, ?time=22, ?weather=storm, ...) — ui/scenario.js.
    if (HL.scenario && HL.scenario.apply) HL.scenario.apply(Q);
    layout();
    window.addEventListener('resize', layout);
    // Otočenie telefónu: niektoré prehliadače (iOS) hlásia nové rozmery až chvíľu po udalosti.
    window.addEventListener('orientationchange', function () { layout(); setTimeout(layout, 250); });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', layout);
    document.addEventListener('fullscreenchange', layout);
    watchDpr();
    HL.input.attach(canvas);
    canvas.addEventListener('pointerup', maybeFullscreen);

    window.addEventListener('keydown', function (e) {
      // CrazyGames: panel ladenia F2 a výpis F3 sú nástroje vývojára — hráč na portáli ich omylom neotvorí
      // (F2 by prepisoval čísla hry). ?debug=1 ich vráti aj tam (HL.devTools, start()).
      if (!HL.devTools) return;
      if (e.code === 'F3') { dbg.on = !dbg.on; e.preventDefault(); }
      if (e.code === 'F2' && HL.dials) { HL.dials.toggle(); e.preventDefault(); }
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && HL.game && HL.game.persist) HL.game.persist();
      else if (!document.hidden) checkStale(); // návrat do karty: nezapísala medzitým iná karta?
      try { wakeRetryAt = 0; updateWake(now()); } catch (e) { report(e); }
    });
    // Hra otvorená v DVOCH kartách: nečinná karta by pri skrytí prepísala postup z druhej
    // (review #30/#33). Iná karta zapísala → HL.game.checkStale() označí túto kartu za zastaranú
    // (prestane ukladať) a HL.ui.drawOverlay to hráčovi povie. Udalosť 'storage' chodí len
    // do OSTATNÝCH kariet; pri file:// ju niektoré prehliadače neposielajú — preto aj pri návrate.
    window.addEventListener('storage', checkStale);
    window.addEventListener('focus', checkStale);

    if (Q.debug) dbg.on = true;
    HL.go(firstScene(), Q);
    switchScene();
    if (!Q.manual) requestAnimationFrame(frame);
    else draw();
    HL.relayout = layout;
    HL.redraw = draw;
    HL.platform.loadingStop();
  }

  // Stav pre harness (tools/shot.js) a ladenie. Čísla, nie obrázky.
  if (HL.isBrowser) {
    window.HL_PROBE = function () {
      var sp = null;
      try { sp = current && current.probe ? current.probe() : null; } catch (e) { sp = { probeError: String(e) }; }
      return {
        ready: !!current, scene: currentName, steps: dbg.steps, frames: dbg.frames, fps: dbg.fps,
        errors: dbg.errors.slice(), colorErrors: dbg.colorErrors.slice(),
        view: { W: view.W, H: view.H, scale: view.scale, panels: view.panels, dpr: view.dpr, devicePerPx: view.devicePerPx, exact: view.exact,
          inset: view.inset || null, hint: { on: hint.on, k: hint.k, compact: !!hint.compact, reason: hint.reason, rects: hint.rects.slice() } },
        wake: { supported: wake.supported, wanted: wake.wanted, held: wake.held, pending: wake.pending, error: wake.error, requests: wake.requests, releases: wake.releases },
        fullscreen: { tried: fs.tried, result: fs.result },
        pwa: window.HL_PWA || null,
        platform: HL.platform ? HL.platform.probe() : null,
        saveBadge: HL.ui && HL.ui.saveProblem ? HL.ui.saveProblem() : null,
        widgets: HL.w && HL.w.list ? HL.w.list() : null,
        fontMissing: HL.font && HL.font.missing ? HL.font.missing.slice() : [],
        spriteMissing: HL.spr && HL.spr.missing ? HL.spr.missing.slice() : [],
        soundMissing: HL.audio && HL.audio.missing ? [].concat(HL.audio.missing) : [],
        scene_probe: sp,
        money: HL.game && HL.game.save ? HL.game.save.money : null,
      };
    };
  }
})(globalThis.HL);
