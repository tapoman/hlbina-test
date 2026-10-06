// Vstup: klávesnica, myš, dotyk. Súradnice ukazovateľa sú v LOGICKÝCH pixeloch
// hernej plochy (0..HL.view.PW × 0..HL.view.H), nie v pixeloch obrazovky.
//
// Hrany (pressed/released) platia presne jeden simulačný krok: main.js volá
// HL.input.endStep() po každom update. Keď v jednom snímku prebehne viac krokov,
// hrana sa doručí PRVÉMU z nich (nestratí sa ani nezdvojí).
//
// UI tlačidlá "zjedia" klik cez HL.input.consume(): scéna ponoru potom vie, že
// klik na tlačidlo HORE nemá byť zároveň ťuknutím do rytmu.
//
// VIAC PRSTOV (review #10/#31): každý ukazovateľ sa sleduje podľa pointerId. Predtým
// bol ukazovateľ jeden boolean — druhý prst, ktorý dopadol, kým prvý držal, NEBOL hranou
// (stratené ťuknutia do rytmu pri hre dvoma palcami alebo s palcom opretým o displej)
// a prvý zdvihnutý prst zrušil "down" aj tomu, ktorý ešte držal.
//   pointer.pressed  = v tomto kroku dopadol NOVÝ prst (každý, nie len prvý)
//   pointer.released = v tomto kroku sa nejaký prst zdvihol
//   pointer.down     = je dole aspoň jeden prst
//   pointer.x/y      = najnovšie stlačený prst, ktorý ešte drží (po jeho zdvihnutí
//                      preskočí na ďalší najnovší držiaci; bez prstov sleduje myš)
//   pointer.id       = pointerId prsta, ktorý x/y práve sleduje (null = žiadny)
//   pointer.lastId   = pointerId naposledy STLAČENÉHO prsta — platí aj vtedy, keď sa zdvihol
//                      v tom istom kroku (rýchly klik: dole aj hore medzi dvoma krokmi)
//   pointer.count    = koľko prstov drží
//   HL.input.pointers = { pointerId: { id, x, y, x0, y0, touch, n } } — všetky držiace prsty
//                      (n = poradie stlačenia; najmenšie n = prvý prst, napr. na smerovanie háčika)
//   HL.input.lifted   = [{ id, x, y, cancel, touch }] — prsty zdvihnuté v tomto kroku
//                      (widgety podľa toho dokončia gesto TOHO prsta, ktorý ho začal)
(function (HL) {
  var I = HL.input = {
    down: {},          // code -> true, kým je kláves dole
    pressedK: {},      // code -> true v kroku stlačenia
    releasedK: {},
    pointer: { x: -1, y: -1, down: false, pressed: false, released: false, inside: false, touch: false, moved: false, id: null, lastId: null, count: 0 },
    pointers: {},      // pointerId -> aktívny prst (pozri hlavičku)
    lifted: [],        // prsty zdvihnuté v tomto kroku
    consumed: false,   // klik v tomto kroku už spracovalo UI
    lastTapTime: 0,    // performance.now() posledného ťuknutia (medzerník/klik/dotyk) — pre rytmus
    anyKeyThisStep: false,
    usingKeyboard: false, // posledný vstup bol klávesnica → UI kreslí fokus
  };
  var seq = 0; // poradie stlačení (kto je "najnovší" prst)

  I.isDown = function (code) { return !!I.down[code]; };
  I.pressed = function (code) { return !!I.pressedK[code]; };
  I.released = function (code) { return !!I.releasedK[code]; };
  I.anyDown = function (codes) { for (var i = 0; i < codes.length; i++) if (I.down[codes[i]]) return true; return false; };
  I.anyPressed = function (codes) { for (var i = 0; i < codes.length; i++) if (I.pressedK[codes[i]]) return true; return false; };
  I.consume = function () { I.consumed = true; };

  // Mapovanie akcií (dizajn 3). Kódy sú KeyboardEvent.code, takže fungujú aj pri SK rozložení.
  I.KEYS = {
    left: ['KeyA', 'ArrowLeft'],
    right: ['KeyD', 'ArrowRight'],
    sink: ['KeyS', 'ArrowDown'],
    up: ['KeyW', 'ArrowUp'],
    tap: ['Space'],
    harpoon: ['KeyH'],
    confirm: ['Enter', 'NumpadEnter', 'Space'],
    back: ['Escape', 'Backspace'],
    pause: ['Escape', 'KeyP'],
  };
  // Meno klávesu pauzy pre nápovedy. Na CrazyGames „P": Esc tam zatvára ich celú obrazovku (prehliadač ho hre
  // nepošle) — docs.crazygames.com odporúča Esc nepoužívať. Esc pauzu robí ďalej všade. both = „Esc, P" na webe.
  I.pauseKey = function (both) {
    if (HL.platform && HL.platform.name === 'crazygames') return 'P';
    return both ? 'Esc, P' : 'Esc';
  };
  I.action = function (name) { return I.anyDown(I.KEYS[name]); };
  I.actionPressed = function (name) { return I.anyPressed(I.KEYS[name]); };

  I.endStep = function () {
    I.pressedK = {};
    I.releasedK = {};
    I.pointer.pressed = false;
    I.pointer.released = false;
    I.pointer.moved = false;
    I.lifted = [];
    I.consumed = false;
    I.anyKeyThisStep = false;
  };

  // Vstup zvonku (autopilot, testy, harness) — rovnaká cesta ako skutočné udalosti.
  // { type:'pointer', x, y, down, touch, id?, cancel? }: bez id = 1 (ako myš v prehliadači).
  I.inject = function (ev) {
    if (ev.type === 'keydown') onKey(ev.code, true);
    else if (ev.type === 'keyup') onKey(ev.code, false);
    else if (ev.type === 'pointer') onPointer(ev.x, ev.y, ev.down, !!ev.touch, ev.id, !!ev.cancel);
  };

  function onKey(code, isDown) {
    if (isDown) {
      if (!I.down[code]) {
        I.pressedK[code] = true;
        if (code === 'Space') I.lastTapTime = now();
      }
      I.down[code] = true;
      I.anyKeyThisStep = true;
      I.usingKeyboard = true;
    } else {
      if (I.down[code]) I.releasedK[code] = true;
      delete I.down[code];
    }
  }

  function count() { var n = 0; for (var k in I.pointers) n++; return n; }
  // Najnovšie stlačený prst, ktorý ešte drží (null = žiadny).
  function newest() {
    var best = null;
    for (var k in I.pointers) if (!best || I.pointers[k].n > best.n) best = I.pointers[k];
    return best;
  }
  function follow(x, y, touch) {
    var p = I.pointer;
    if (x !== p.x || y !== p.y) p.moved = true;
    p.x = x; p.y = y; p.touch = touch;
    p.inside = x >= 0 && y >= 0 && x < HL.view.PW && y < HL.view.H;
  }

  // isDown: true = stlačenie/drží, false = pustenie, undefined = pohyb.
  function onPointer(x, y, isDown, touch, id, cancel) {
    if (id == null) id = 1;
    var p = I.pointer, e = I.pointers[id];
    if (isDown === true) {
      if (!e) {
        // NOVÝ prst = hrana, aj keď iný prst už drží
        I.pointers[id] = { id: id, x: x, y: y, x0: x, y0: y, touch: touch, n: ++seq };
        p.pressed = true; I.lastTapTime = now();
        I.usingKeyboard = false;
        p.id = id; p.lastId = id;
        follow(x, y, touch);
      } else {
        e.x = x; e.y = y;
        if (p.id === id) follow(x, y, touch);
      }
    } else if (isDown === false) {
      if (e) {
        delete I.pointers[id];
        I.lifted.push({ id: id, x: x, y: y, cancel: !!cancel, touch: e.touch });
        p.released = true;
        I.usingKeyboard = false;
        if (p.id === id) {
          var nx = newest();
          if (nx) { p.id = nx.id; follow(nx.x, nx.y, nx.touch); } // x/y sa vráti k prstu, ktorý ešte drží
          else { p.id = null; follow(x, y, touch); }
        }
      } else if (!count()) {
        follow(x, y, touch); // pustenie bez stlačenia na plátne (tlačidlo stlačené mimo) — len poloha
      }
    } else {
      if (e) {
        e.x = x; e.y = y;
        if (p.id === id) follow(x, y, touch);
      } else if (!count()) {
        follow(x, y, touch); // myš bez tlačidla: hover
      }
    }
    p.count = count();
    p.down = p.count > 0;
  }

  // Všetky prsty preč naraz (okno stratilo fokus): gestá sa ZRUŠIA, nič sa neaktivuje.
  I.liftAll = function () {
    for (var k in I.pointers) {
      var e = I.pointers[k];
      I.lifted.push({ id: e.id, x: e.x, y: e.y, cancel: true, touch: e.touch });
    }
    if (I.pointer.down) I.pointer.released = true;
    I.pointers = {};
    I.pointer.down = false; I.pointer.count = 0; I.pointer.id = null;
  };

  function now() { return (typeof performance !== 'undefined') ? performance.now() : Date.now(); }

  // Prepočet z pixelov stránky na logické pixely hernej plochy.
  function toLogical(clientX, clientY) {
    var v = HL.view;
    var r = v.canvas.getBoundingClientRect();
    var x = (clientX - r.left) / r.width * v.W - v.playX;
    var y = (clientY - r.top) / r.height * v.H;
    return { x: x, y: y };
  }

  I.attach = function (canvas) {
    window.addEventListener('keydown', function (e) {
      if (e.code === 'F2' || e.code === 'F3' || e.code === 'F4') return; // debug klávesy rieši main/dials
      if (HL.dials && HL.dials.isOpen && HL.dials.isOpen()) return;
      // Medzerník a šípky by posúvali stránku.
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace'].indexOf(e.code) >= 0) e.preventDefault();
      if (e.repeat) return;
      onKey(e.code, true);
    });
    window.addEventListener('keyup', function (e) { onKey(e.code, false); });
    window.addEventListener('blur', function () {
      for (var k in I.down) I.releasedK[k] = true;
      I.down = {};
      I.liftAll();
    });

    canvas.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* staršie prehliadače */ }
      var p = toLogical(e.clientX, e.clientY);
      onPointer(p.x, p.y, true, e.pointerType === 'touch', e.pointerId, false);
      if (HL.audio && HL.audio.unlock) HL.audio.unlock();
    });
    canvas.addEventListener('pointermove', function (e) {
      var p = toLogical(e.clientX, e.clientY);
      onPointer(p.x, p.y, undefined, e.pointerType === 'touch', e.pointerId, false);
    });
    canvas.addEventListener('pointerup', function (e) {
      var p = toLogical(e.clientX, e.clientY);
      onPointer(p.x, p.y, false, e.pointerType === 'touch', e.pointerId, false);
      unlockAudio();
    });
    // Zrušený dotyk (systém si gesto vzal) nie je ťuknutie: prst sa zdvihne, ale nič neaktivuje.
    canvas.addEventListener('pointercancel', function (e) {
      var p = toLogical(e.clientX, e.clientY);
      onPointer(p.x, p.y, false, e.pointerType === 'touch', e.pointerId, true);
    });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    window.addEventListener('keydown', function () { if (HL.audio && HL.audio.unlock) HL.audio.unlock(); }, { once: false });
    // iOS Safari obnoví AudioContext (stav 'suspended' aj 'interrupted' po hovore/zamknutí) LEN vnútri gesta
    // touchend alebo click — pointerdown mu nestačí (požiadavka CrazyGames, docs/CRAZYGAMES.md). Aj ťuk
    // do čierneho okraja vedľa hry je gesto, preto na celom dokumente. unlock je idempotentný.
    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('touchend', unlockAudio, { passive: true });
      document.addEventListener('click', unlockAudio, { passive: true });
    }
    guardPage();
  };
  function unlockAudio() { if (HL.audio && HL.audio.unlock) HL.audio.unlock(); }

  // Telefón: stránka sa nesmie priblížiť (štipnutie, dvojťuk), posúvať ani ponúkať menu dlhého
  // stlačenia / výber textu. CSS (index.html) má touch-action: none, overscroll-behavior: none
  // a -webkit-touch-callout: none; Safari na iOS štipnutie aj tak pustí cez gesture* udalosti
  // (user-scalable=no ignoruje) — tie sa tu zastavia. Polia formulárov (panel F2) ostanú funkčné.
  function isField(t) { return !!(t && t.closest && t.closest('input, textarea, select, [contenteditable]')); }
  function guardPage() {
    if (typeof document === 'undefined' || !document.addEventListener) return;
    var stop = function (e) { if (!isField(e.target)) e.preventDefault(); };
    ['gesturestart', 'gesturechange', 'gestureend', 'dblclick', 'contextmenu', 'selectstart', 'dragstart'].forEach(function (t) {
      document.addEventListener(t, stop, { passive: false });
    });
    // viac prstov mimo plátna (napr. v okraji vedľa hry) = štipnutie stránky
    document.addEventListener('touchmove', function (e) { if (e.touches && e.touches.length > 1 && !isField(e.target)) e.preventDefault(); }, { passive: false });
  }
})(globalThis.HL);
