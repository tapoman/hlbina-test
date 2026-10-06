// Tlačidlá a ovládacie prvky v štýle "okamžitého režimu".
//
// Prvok sa DEKLARUJE pri kreslení (button/hit/slider zaregistrujú svoj obdĺžnik)
// a AKTIVUJE v nasledujúcom simulačnom kroku: processInput() porovná stlačenie
// ukazovateľa s obdĺžnikmi z posledného snímku a scéna sa v update() spýta
// clicked(id).
//
// KEDY sa tlačidlo aktivuje:
//   - MYŠ mimo zoznamu: pri STLAČENÍ — hra má byť svižná.
//   - DOTYK mimo zoznamu: pri PUSTENÍ, ak prst ostal v tlačidle a nepohol sa o viac ako
//     T.uiScrollSlop px (review #20). Pri stlačení by švih, ktorý náhodou začal na
//     'Predať všetko', predal celú Chatrč — a prst nemal ako akciu zrušiť zosunutím.
//   - Vo vnútri beginScroll (myš aj dotyk): pri PUSTENÍ v tlačidle a s pohybom ≤ slop,
//     inak by každé posúvanie zoznamu na mobile stláčalo tlačidlá pod prstom.
//   - Stlačenie, ktoré ZASTAVÍ rozbehnutý zoznam (po švihnutí), nič neaktivuje (review #19).
//   - Po aktivácii ukazovateľom sa ďalšia aktivácia ukazovateľom na TOM ISTOM mieste
//     (do T.uiClickGuardPx) ignoruje T.uiClickGuardSec — dvojklik tak nekúpi dve úrovne
//     budovy ani nepredá aj ďalší druh, ktorý sa po predaji posunul pod kurzor (review #18/#29),
//     a to ani cez prepnutie scény. Klávesnice sa to netýka. Okruh (nie celá obrazovka),
//     aby rýchly úmyselný klik na INÉ tlačidlo neprepadol.
// Gesto patrí prstu, ktorý ho začal (HL.input.pointers/lifted) — druhý prst ho neukončí.
//
// Klik na prvok zavolá HL.input.consume(): scéna ponoru tak vie, že klik na HORE
// nebol zároveň ťuknutím do rytmu.
//
// Klávesnica: keď prvok s fokusom zmizne (kúpený, predaný), fokus prejde na najbližší
// prvok v tom istom zozname / na tom istom mieste, inak sa zruší — NIKDY nepadne na prvý
// prvok obrazovky (v Dielni a na Trhovisku je to drahé Vylepšiť; review #17).
//
// Súradnice: všetko sa registruje v súradniciach hernej plochy (ako HL.input.pointer).
// Bočné panely a zoznamy posúvajú počiatok cez pushOrigin/popOrigin.
(function (HL) {
  var W = HL.w = {};
  var T = HL.T;

  T.def('UI', 'uiScrollSlop', 6, 0, 30, 1, 'Zoznam: o koľko px sa smie prst pohnúť, aby to bolo ťuknutie (nie posun)');
  T.def('UI', 'uiScrollFriction', 0.9, 0, 0.99, 0.01, 'Zoznam: doznievanie posunu po pustení (0 = hneď stojí)');
  T.def('UI', 'uiWheelScale', 1, 0.1, 5, 0.1, 'Zoznam: rýchlosť kolieska myši');
  T.def('UI', 'uiFlingStop', 0.5, 0, 5, 0.1, 'Zoznam: nad akou rýchlosťou (px/krok) ťuk len zastaví rozbehnutý zoznam a nič nestlačí');
  T.def('UI', 'uiClickGuardSec', 0.3, 0, 1, 0.05, 'Dvojklik: ako dlho po aktivácii myšou/prstom sa ďalšia na tom istom mieste ignoruje (s)');
  T.def('UI', 'uiClickGuardPx', 12, 0, 400, 1, 'Dvojklik: okruh (logické px) okolo posledného kliku, v ktorom platí poistka (400 = celá obrazovka)');

  W.nav = false;                 // scéna zapne klávesovú navigáciu (šípky, Tab, Enter)

  var items = [];                // prvky z posledného snímku
  var scrolls = [];              // výrezy zoznamov z posledného snímku
  var activated = {};            // id -> true v tomto kroku
  var focusId = null;
  var ox = 0, oy = 0, originStack = [];
  var clipStack = [], scrollStack = [];
  var sstate = {};               // id zoznamu -> { y, max, v }
  var press = null;              // rozpracované gesto vo vnútri zoznamu
  var sliderDrag = null;         // id ťahaného posuvníka
  var sliderDelta = {};          // id -> kroky z klávesnice, uplatnia sa pri kreslení
  var wheelAcc = 0, wheelCanvas = null, tabGuard = false;
  var ctxLast = null;
  // Poistka proti dvojkliku: zostávajúci čas a miesto poslednej aktivácie ukazovateľom.
  // Scéna ju NEMAŽE (W.reset) — druhý klik dvojkliku by inak stlačil tlačidlo novej scény.
  var guard = { t: 0, x: 0, y: 0 };
  var blocked = [];              // id, ktoré poistka v tomto kroku zahodila (pre harness)
  // Fokus: posledný známy obdĺžnik prvku s fokusom (aby sa po jeho zmiznutí dal nájsť
  // najbližší sused) a či už v tejto scéne fokus niekde bol (štart scény ≠ strata fokusu).
  var focusRect = null, focusStarted = false;

  // ------------------------------------------------------------------ životný cyklus
  W.beginDraw = function () {
    items = []; scrolls = [];
    ox = 0; oy = 0; originStack = []; clipStack = []; scrollStack = [];
    ctxLast = null;
  };
  W.reset = function () {
    W.beginDraw();
    activated = {}; focusId = null; press = null; sliderDrag = null; sliderDelta = {}; sstate = {}; wheelAcc = 0;
    focusRect = null; focusStarted = false; blocked = [];
  };
  // Testy a harness: zruší poistku proti dvojkliku (hra ju sama nikdy nemaže).
  W.clearGuard = function () { guard.t = 0; };
  W.pushOrigin = function (x, y) { originStack.push([ox, oy]); ox += x; oy += y; };
  W.popOrigin = function () { var o = originStack.pop(); if (o) { ox = o[0]; oy = o[1]; } };

  function curClip() { return clipStack.length ? clipStack[clipStack.length - 1] : null; }
  function register(id, x, y, w, h, kind, opts) {
    var it = {
      id: id, x: x + ox, y: y + oy, w: w, h: h, kind: kind,
      disabled: !!(opts && opts.disabled),
      hotkey: opts && opts.hotkey || null,
      nav: !(opts && opts.nav === false),
      autofocus: !!(opts && opts.autofocus),
      scroll: scrollStack.length ? scrollStack[scrollStack.length - 1].id : null,
      clip: curClip(),
    };
    items.push(it);
    return it;
  }
  function inRect(r, x, y) { return x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h; }
  function over(it, x, y) { return inRect(it, x, y) && (!it.clip || inRect(it.clip, x, y)); }
  function find(id) { for (var i = items.length - 1; i >= 0; i--) if (items[i].id === id) return items[i]; return null; }
  function topAt(x, y) { for (var i = items.length - 1; i >= 0; i--) if (over(items[i], x, y)) return items[i]; return null; }
  function scrollAt(x, y) { for (var i = scrolls.length - 1; i >= 0; i--) if (inRect(scrolls[i], x, y)) return scrolls[i]; return null; }

  function ptr() { return HL.input && HL.input.pointer; }
  // Stav prvku pre kreslenie: hover (nie pri dotyku bez prsta), stlačený, fokus.
  function stateOf(it) {
    var p = ptr();
    var hover = !!p && !it.disabled && over(it, p.x, p.y) && !(p.touch && !p.down);
    var down = hover && p.down && (!press || press.id === it.id || press.id == null) && !(press && press.dragging);
    var focus = W.nav && focusId === it.id;
    return { hover: hover, down: down, focus: focus, ring: focus && !!(HL.input && HL.input.usingKeyboard) };
  }

  // ------------------------------------------------------------------ vstup (každý krok)
  function lazyAttach() {
    var v = HL.view;
    if (v && v.canvas && v.canvas.addEventListener && wheelCanvas !== v.canvas) {
      wheelCanvas = v.canvas;
      v.canvas.addEventListener('wheel', function (e) {
        if (!scrolls.length) return;
        e.preventDefault();
        var d = e.deltaY;
        if (e.deltaMode === 1) d *= 12; else if (e.deltaMode === 2) d *= 200; else d /= (HL.view.scale || 1);
        wheelAcc += d * T.uiWheelScale;
      }, { passive: false });
    }
    // Tab by inak presunul fokus prehliadača preč z hry a klávesy by prestali chodiť.
    if (!tabGuard && typeof window !== 'undefined' && window.addEventListener) {
      tabGuard = true;
      window.addEventListener('keydown', function (e) {
        if (e.code === 'Tab' && W.nav && !(HL.dials && HL.dials.isOpen && HL.dials.isOpen())) e.preventDefault();
      });
    }
  }
  // Koliesko z iného zdroja (harness, test): posun v logických px.
  W.wheel = function (dy) { wheelAcc += dy; };

  function clampScroll(st) { st.y = Math.max(0, Math.min(st.max, st.y)); }

  // Aktivácia ukazovateľom cez poistku proti dvojkliku. Vracia, či prešla.
  function pointerActivate(id, x, y) {
    if (guard.t > 0) {
      var dx = x - guard.x, dy = y - guard.y;
      if (dx * dx + dy * dy <= T.uiClickGuardPx * T.uiClickGuardPx) { blocked.push(id); return false; }
    }
    activated[id] = true;
    guard.t = T.uiClickGuardSec; guard.x = x; guard.y = y;
    return true;
  }
  function liftedOf(I, pid) {
    var L = I.lifted || [];
    for (var i = 0; i < L.length; i++) if (L[i].id === pid) return L[i];
    return null;
  }

  // dt = dĺžka kroku (main.js posiela 1/60); bez neho sa počíta s 1/60.
  W.processInput = function (dt) {
    activated = {}; blocked = [];
    var I = HL.input;
    if (!I) return;
    lazyAttach();
    if (guard.t > 0) guard.t -= dt > 0 ? dt : 1 / 60;
    var p = I.pointer;
    var slop = T.uiScrollSlop;

    if (p.pressed) {
      var it = topAt(p.x, p.y);
      var sc = scrollAt(p.x, p.y);
      // Prst gesta: lastId, nie id — pri rýchlom kliku (dole aj hore v jednom kroku) je id už null
      // a gesto by sa stratilo (klik v zozname by nič nestlačil).
      var pid = p.lastId != null ? p.lastId : p.id;
      press = null; // nový prst preberá gesto (starý už nič nedokončí)
      if (sc) {
        var st0 = sstate[sc.id];
        // Ťuk do rozbehnutého zoznamu ho iba zastaví — tlačidlo pod prstom sa nestlačí (#19).
        var flinging = !!st0 && Math.abs(st0.v) > T.uiFlingStop;
        press = { scroll: sc.id, id: !flinging && it && it.scroll === sc.id && !it.disabled && it.kind !== 'slider' ? it.id : null,
          pid: pid, x0: p.x, y0: p.y, maxMove: 0, dragging: false, yStart: 0, sStart: 0 };
        if (st0) st0.v = 0;
        I.consume();
      }
      if (it) {
        I.consume();
        if (!it.disabled) {
          if (W.nav && it.nav) { focusId = it.id; focusStarted = true; }
          if (it.kind === 'slider') sliderDrag = it.id;
          else if (!it.scroll) {
            // dotyk: až pri pustení v tlačidle (#20); myš: hneď
            if (p.touch) press = { scroll: null, id: it.id, pid: pid, x0: p.x, y0: p.y, maxMove: 0, dragging: false };
            else pointerActivate(it.id, p.x, p.y);
          }
        }
      }
    }
    // Gesto sleduje SVOJ prst, nie posledný (druhý prst ho nesmie posunúť ani ukončiť).
    var gp = press ? (I.pointers ? I.pointers[press.pid] : (p.down ? p : null)) : null;
    var up = press ? liftedOf(I, press.pid) : null;
    if (press && !sliderDrag && (gp || up)) {
      var cx = gp ? gp.x : up.x, cy = gp ? gp.y : up.y;
      var mv = Math.sqrt((cx - press.x0) * (cx - press.x0) + (cy - press.y0) * (cy - press.y0));
      if (mv > press.maxMove) press.maxMove = mv;
      var st = press.scroll ? sstate[press.scroll] : null;
      if (!press.dragging && press.maxMove > slop) {
        if (press.scroll) {
          press.dragging = true;                             // posun zoznamu
          press.yStart = cy; press.sStart = st ? st.y : 0;   // bez skoku o prah
        }
        press.id = null;                                     // ťuknutie sa ruší
      }
      if (press.dragging && st && gp) {
        var ny = press.sStart - (cy - press.yStart);
        st.v = ny - st.y;
        st.y = ny; clampScroll(st);
      }
    }
    if (press && up) {
      if (!up.cancel && !press.dragging && press.id != null && press.maxMove <= slop) {
        var target = find(press.id);
        // pustenie mimo tlačidla (prst sa zosunul) = zrušené
        if (target && !target.disabled && over(target, up.x, up.y)) pointerActivate(press.id, up.x, up.y);
        I.consume();
      }
      press = null;
    }
    if (p.released) sliderDrag = null;
    if (!p.down) { if (sliderDrag) sliderDrag = null; if (press) press = null; }
    if (press && I.pointers && !I.pointers[press.pid]) press = null; // prst zmizol bez pustenia

    // Doznievanie posunu po pustení.
    for (var sid in sstate) {
      var s = sstate[sid];
      if (press && press.scroll === sid) continue;
      if (Math.abs(s.v) > 0.05) {
        s.y += s.v; s.v *= T.uiScrollFriction;
        var before = s.y; clampScroll(s);
        if (s.y !== before) s.v = 0;
      } else s.v = 0;
    }

    if (wheelAcc) {
      var ws = scrollAt(p.x, p.y) || (scrolls.length === 1 ? scrolls[0] : null);
      if (ws && sstate[ws.id]) { sstate[ws.id].y += wheelAcc; sstate[ws.id].v = 0; clampScroll(sstate[ws.id]); }
      wheelAcc = 0;
    }

    // Klávesové skratky platia vždy (aj bez navigácie): napr. W = HORE.
    for (var i = 0; i < items.length; i++) {
      var h = items[i].hotkey;
      if (!h || items[i].disabled) continue;
      if (typeof h === 'string' ? I.pressed(h) : I.anyPressed(h)) activated[items[i].id] = true;
    }
    if (W.nav) navKeys(I);
  };

  // ------------------------------------------------------------------ klávesová navigácia
  function navList() { return items.filter(function (it) { return it.nav && !it.disabled; }); }
  function center(it) {
    // stred VIDITEĽNEJ časti (prvok v zozname môže byť čiastočne odrezaný)
    return { x: it.x + it.w / 2, y: it.y + it.h / 2 };
  }
  // Najbližší prvok v smere: hlavná vzdialenosť + 2× bočná odchýlka (preferuje zarovnané).
  function nearest(cur, dir, list) {
    var a = center(cur), best = null, bs = Infinity;
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      if (it === cur) continue;
      var b = center(it), dx = b.x - a.x, dy = b.y - a.y, main, cross;
      if (dir === 'right') { main = dx; cross = dy; } else if (dir === 'left') { main = -dx; cross = dy; }
      else if (dir === 'down') { main = dy; cross = dx; } else { main = -dy; cross = dx; }
      if (main < 1) continue;
      var score = main + 2 * Math.abs(cross);
      if (score < bs) { bs = score; best = it; }
    }
    return best;
  }
  // Prvok v zozname posunie do výrezu, aby fokus nezmizol mimo obrazovky.
  function reveal(it) {
    if (!it.scroll || !it.clip) return;
    var st = sstate[it.scroll];
    if (!st) return;
    if (it.y < it.clip.y) st.y -= it.clip.y - it.y;
    else if (it.y + it.h > it.clip.y + it.clip.h) st.y += it.y + it.h - (it.clip.y + it.clip.h);
    st.v = 0;
    clampScroll(st);
  }
  function autofocusOr(list) {
    for (var k = 0; k < list.length; k++) if (list[k].autofocus) return list[k];
    return list[0];
  }
  function dist2(it, r) {
    var a = center(it), bx = r.x + r.w / 2, by = r.y + r.h / 2;
    return (a.x - bx) * (a.x - bx) + (a.y - by) * (a.y - by);
  }
  // Kam s fokusom, keď jeho prvok zmizol: najbližší prvok v TOM ISTOM zozname, inak prvok
  // presne na tom mieste (napr. riadok, ktorý sa posunul na miesto predaného), inak nikto.
  function survivor(r, list) {
    var best = null, bd = Infinity, i;
    if (r.scroll != null) {
      for (i = 0; i < list.length; i++) {
        if (list[i].scroll !== r.scroll) continue;
        var d = dist2(list[i], r);
        if (d < bd) { bd = d; best = list[i]; }
      }
      if (best) return best;
    }
    var cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    for (i = 0; i < list.length; i++) if (over(list[i], cx, cy)) return list[i];
    return null;
  }
  function closestTo(r, list) {
    var best = list[0], bd = Infinity;
    for (var i = 0; i < list.length; i++) { var d = dist2(list[i], r); if (d < bd) { bd = d; best = list[i]; } }
    return best;
  }
  function remember(it) { focusRect = { id: it.id, x: it.x, y: it.y, w: it.w, h: it.h, scroll: it.scroll }; }

  function navKeys(I) {
    var list = navList();
    if (!list.length) return;
    var cur = focusId != null ? find(focusId) : null;
    var jumped = false;
    if (!cur) {
      if (focusId != null && focusRect && focusRect.id === focusId) {
        // Prvok s fokusom zmizol (kúpený, predaný). Prvý prvok obrazovky by bol v Dielni
        // a na Trhovisku drahé Vylepšiť — ďalší Enter by minul 600 €. Radšej sused alebo nič.
        cur = survivor(focusRect, list);
        focusId = cur ? cur.id : null;
        jumped = true;
        if (cur && I.usingKeyboard) reveal(cur);
      } else if (!focusStarted) {
        cur = autofocusOr(list); // štart scény: prednastavené tlačidlo alebo prvé
        focusId = cur.id;
      }
      // inak fokus čaká: zrušený (po strate), alebo setFocus na prvok, ktorý ešte nie je nakreslený
    }
    var dir = I.pressed('ArrowUp') ? 'up' : I.pressed('ArrowDown') ? 'down' : I.pressed('ArrowLeft') ? 'left' : I.pressed('ArrowRight') ? 'right' : null;
    var tab = I.pressed('Tab');
    if (!cur) {
      // Bez fokusu šípka/Tab fokus iba UKÁŽE (pri mieste, kde naposledy bol); Enter nerobí nič.
      if (dir || tab) {
        cur = focusRect ? closestTo(focusRect, list) : autofocusOr(list);
        focusId = cur.id; focusStarted = true; reveal(cur); remember(cur);
      }
      return;
    }
    focusStarted = true;
    if (cur.kind === 'slider' && !cur.disabled && (dir === 'left' || dir === 'right')) {
      sliderDelta[cur.id] = (sliderDelta[cur.id] || 0) + (dir === 'left' ? -1 : 1);
      dir = null;
    }
    if (dir) {
      var nx = nearest(cur, dir, list);
      if (nx) { focusId = nx.id; cur = nx; reveal(nx); }
    }
    if (tab) {
      var back = I.isDown('ShiftLeft') || I.isDown('ShiftRight');
      var idx = list.indexOf(cur);
      var nt = list[((idx < 0 ? 0 : idx) + (back ? -1 : 1) + list.length) % list.length];
      focusId = nt.id; cur = nt; reveal(nt);
    }
    remember(cur);
    // V kroku, keď fokus preskočil na suseda, sa Enter zahodí — patril zmiznutému prvku.
    if (!jumped && (I.pressed('Enter') || I.pressed('NumpadEnter') || I.pressed('Space')) && !cur.disabled && cur.kind !== 'slider') {
      activated[cur.id] = true;
    }
  }

  // ------------------------------------------------------------------ dotazy
  W.clicked = function (id) { return activated[id] === true; };
  // Čo sa aktivovalo v tomto kroku (main.js podľa toho zahrá cvaknutie).
  W.activatedIds = function () { return Object.keys(activated); };
  W.focused = function () { return focusId; };
  W.setFocus = function (id) { focusId = id; };
  W.scrollOf = function (id) { var s = sstate[id]; return s ? { y: s.y, max: s.max } : null; };
  W.setScroll = function (id, y) { var s = sstate[id]; if (s) { s.y = y; s.v = 0; clampScroll(s); } };
  W.gesture = function () { return press ? { scroll: press.scroll, id: press.id, pid: press.pid, maxMove: press.maxMove, dragging: press.dragging } : null; };
  // Harness: čo poistka proti dvojkliku zahodila v tomto kroku a koľko jej ešte ostáva.
  W.blockedIds = function () { return blocked.slice(); };
  W.guardLeft = function () { return Math.max(0, guard.t); };
  W.list = function () {
    return items.map(function (it) {
      var vis = it;
      if (it.clip) {
        var x0 = Math.max(it.x, it.clip.x), y0 = Math.max(it.y, it.clip.y);
        var x1 = Math.min(it.x + it.w, it.clip.x + it.clip.w), y1 = Math.min(it.y + it.h, it.clip.y + it.clip.h);
        vis = x1 > x0 && y1 > y0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
      }
      return { id: it.id, x: it.x, y: it.y, w: it.w, h: it.h, disabled: it.disabled, kind: it.kind, scroll: it.scroll,
        visible: vis ? { x: vis.x, y: vis.y, w: vis.w, h: vis.h } : null };
    });
  };

  // ------------------------------------------------------------------ vzhľad
  var STYLES = {
    primary: { fill: 'amber', hover: 'yellow', down: 'orange', hl: 'yellow', shade: 'orange', text: 'ink', shadow: null },
    normal:  { fill: 'slate', hover: 'grey', down: 'slateDark', hl: 'grey', shade: 'slateDark', text: 'white', shadow: 'ink' },
    danger:  { fill: 'red', hover: 'pink', down: 'redDark', hl: 'pink', shade: 'redDark', text: 'white', shadow: 'redDark' },
    // text 'grey' na slateDark = 3,39:1 (predtým 'slate' 1,73:1 — zamknuté tlačidlo sa nedalo prečítať;
    // týka sa všetkých ~27 miest s disabled:, preto oprava tu a nie v scénach)
    disabled: { fill: 'slateDark', hover: 'slateDark', down: 'slateDark', hl: 'slateDark', shade: 'navy', text: 'grey', shadow: null },
  };
  function P(n) { return HL.pal[n]; }

  function focusRing(ctx, x, y, w, h) {
    var D = HL.draw;
    D.rect(ctx, x, y - 2, w, 1, P('yellow'));
    D.rect(ctx, x, y + h + 1, w, 1, P('yellow'));
    D.rect(ctx, x - 2, y, 1, h, P('yellow'));
    D.rect(ctx, x + w + 1, y, 1, h, P('yellow'));
    D.rect(ctx, x - 1, y - 1, 1, 1, P('yellow'));
    D.rect(ctx, x + w, y - 1, 1, 1, P('yellow'));
    D.rect(ctx, x - 1, y + h, 1, 1, P('yellow'));
    D.rect(ctx, x + w, y + h, 1, 1, P('yellow'));
  }

  function iconOf(name) {
    if (!name || !HL.spr || !HL.spr.get) return null; // sprity sa môžu ešte len písať
    try { return HL.spr.get(name) || null; } catch (e) { return null; }
  }

  W.button = function (ctx, id, x, y, w, h, label, opts) {
    opts = opts || {};
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    ctxLast = ctx;
    var it = register(id, x, y, w, h, 'button', opts);
    var st = stateOf(it);
    var D = HL.draw, F = HL.font;
    var style = opts.disabled ? 'disabled' : (opts.style || 'normal');
    var fopts = { small: !!opts.small };
    var dy = st.down ? 1 : 0;
    var textColor;
    if (style === 'ghost') {
      if (st.hover || st.down) D.frame(ctx, x, y, w, h, P('slate'));
      textColor = st.down ? P('grey') : st.hover ? P('white') : P('greyLight');
      fopts.shadow = P('ink');
    } else {
      var S = STYLES[style] || STYLES.normal;
      D.rect(ctx, x + 1, y, w - 2, h, P('ink'));
      D.rect(ctx, x, y + 1, w, h - 2, P('ink'));
      if (st.down) {
        D.rect(ctx, x + 1, y + 1, w - 2, 1, P(S.shade));
        D.rect(ctx, x + 1, y + 2, w - 2, h - 3, P(S.down));
      } else {
        D.rect(ctx, x + 1, y + 1, w - 2, h - 2, P(S.shade));
        D.rect(ctx, x + 1, y + 1, w - 2, h - 3, P(st.hover ? S.hover : S.fill));
        D.rect(ctx, x + 2, y + 1, w - 4, 1, P(S.hl));
      }
      textColor = P(S.text);
      if (S.shadow) fopts.shadow = P(S.shadow);
    }
    // Obsah: [ikona][medzera][text], vycentrované; text sa skráti výpustkou.
    var icon = iconOf(opts.icon);
    var iw = icon ? icon.width + 3 : 0;
    var capMid = opts.small ? 4 : 5; // stred verzálok v bunke písma (riadky 2–8, resp. 2–6)
    fopts.maxWidth = Math.max(0, w - 6 - iw);
    var text = label == null ? '' : String(label);
    var tw = text ? F.measure(F.fit(text, fopts.maxWidth, fopts), fopts) : 0;
    var cx = x + Math.floor((w - (iw + tw)) / 2);
    var midY = y + Math.floor((h - 2) / 2) + dy;
    if (icon) D.sprite(ctx, icon, cx, midY - Math.floor(icon.height / 2));
    if (text) F.draw(ctx, text, cx + iw, midY - capMid, textColor, fopts);
    if (st.ring) focusRing(ctx, x, y, w, h);
    return { hover: st.hover, focus: st.focus, down: st.down };
  };

  W.hit = function (id, x, y, w, h, opts) {
    var it = register(id, Math.round(x), Math.round(y), Math.round(w), Math.round(h), 'hit', opts || {});
    var st = stateOf(it);
    var ctx = ctxLast || (HL.view && HL.view.ctx);
    if (st.ring && ctx) focusRing(ctx, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    return { hover: st.hover, focus: st.focus, down: st.down };
  };

  function decimals(step) {
    var s = String(step);
    var i = s.indexOf('.');
    return i < 0 ? 0 : s.length - i - 1;
  }
  function quantize(v, min, max, step) {
    if (step > 0) v = min + Math.round((v - min) / step) * step;
    v = Math.max(min, Math.min(max, v));
    return step > 0 ? Number(v.toFixed(decimals(step))) : v;
  }
  W.quantize = quantize;

  // Posuvník: popis a hodnota nad dráhou (malé písmo), dráha 8 px. Ťahanie myšou/prstom,
  // šípky doľava/doprava pri fokuse. Vracia novú hodnotu (volajúci si ju uloží).
  // opts (voliteľné): { format(value) → text, autofocus, disabled, hotkey } — napr. hlasitosť '60 %'.
  W.slider = function (ctx, id, x, y, w, value, min, max, step, label, opts) {
    opts = opts || {};
    x = Math.round(x); y = Math.round(y); w = Math.round(w);
    ctxLast = ctx;
    var D = HL.draw, F = HL.font;
    var hasLabel = label != null && label !== '';
    var h = hasLabel ? 18 : 9;
    var it = register(id, x, y, w, h, 'slider', { autofocus: opts.autofocus, disabled: opts.disabled, hotkey: opts.hotkey });
    var p = ptr();
    if (sliderDrag === id && p && p.down) {
      var frac = (p.x - it.x) / Math.max(1, w - 1);
      value = min + frac * (max - min);
    }
    if (sliderDelta[id]) { value = Number(value) + sliderDelta[id] * (step || (max - min) / 20); delete sliderDelta[id]; }
    value = quantize(Number(value), min, max, step);
    var st = stateOf(it);
    var s = opts.format ? String(opts.format(value)) : String(value).replace('.', HL.util.dec ? HL.util.dec() : ','); // desatinná čiarka/bodka jazyka
    if (hasLabel) {
      var vw = F.measure(s, { small: true });
      F.draw(ctx, label, x, y + 1, P('greyLight'), { small: true, maxWidth: w - vw - 4 });
      F.draw(ctx, s, x + w, y + 1, P('white'), { small: true, align: 'right' });
    }
    var ty = y + (hasLabel ? 10 : 1);
    var kx = x + Math.round((max > min ? (value - min) / (max - min) : 0) * (w - 1));
    D.rect(ctx, x, ty + 2, w, 4, P('ink'));
    D.rect(ctx, x + 1, ty + 3, w - 2, 2, P('slateDark'));
    D.rect(ctx, x + 1, ty + 3, kx - x, 2, P('amber'));
    D.rect(ctx, kx - 2, ty, 5, 8, P('ink'));
    D.rect(ctx, kx - 1, ty + 1, 3, 6, sliderDrag === id || st.hover ? P('white') : P('greyLight'));
    if (st.ring) focusRing(ctx, x, y, w, h);
    return value;
  };

  // Zoznam s posúvaním: orez + posun; prvky vnútri sa registrujú posunuté a orezané.
  W.beginScroll = function (ctx, id, x, y, w, h, contentH) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    ctxLast = ctx;
    lazyAttach();
    var st = sstate[id] || (sstate[id] = { y: 0, max: 0, v: 0 });
    st.max = Math.max(0, Math.round(contentH - h));
    clampScroll(st);
    var vr = { x: x + ox, y: y + oy, w: w, h: h, id: id };
    var parent = curClip();
    if (parent) { // vnorený výrez = prienik s rodičom
      var x0 = Math.max(vr.x, parent.x), y0 = Math.max(vr.y, parent.y);
      var x1 = Math.min(vr.x + w, parent.x + parent.w), y1 = Math.min(vr.y + h, parent.y + parent.h);
      vr = { x: x0, y: y0, w: Math.max(0, x1 - x0), h: Math.max(0, y1 - y0), id: id };
    }
    scrolls.push(vr);
    var sy = Math.round(st.y);
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.translate(0, -sy);
    scrollStack.push({ id: id, x: x, y: y, w: w, h: h, contentH: contentH });
    clipStack.push(vr);
    W.pushOrigin(0, -sy);
    return sy;
  };

  W.endScroll = function (ctx) {
    var f = scrollStack.pop();
    if (!f) return;
    W.popOrigin();
    clipStack.pop();
    ctx.restore();
    var st = sstate[f.id];
    if (st && st.max > 0) {
      var D = HL.draw;
      var th = Math.max(6, Math.round(f.h * f.h / Math.max(f.h, f.contentH)));
      var ty = f.y + Math.round((f.h - th) * st.y / st.max);
      D.rect(ctx, f.x + f.w - 2, f.y, 2, f.h, P('navy'));
      D.rect(ctx, f.x + f.w - 2, ty, 2, th, press && press.dragging && press.scroll === f.id ? P('greyLight') : P('slate'));
    }
  };
})(globalThis.HL);
