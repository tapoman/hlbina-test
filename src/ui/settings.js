// Nastavenia (obrazovka 15.8): hlasitosť, vibrácie, trasenie, ostré pixely, sezónna udalosť,
// kalibrácia oneskorenia rytmu (dizajn 16, riziko 19), ladenie F2 a vymazanie kariéry.
//
// Udalosť: hráč smie len Automaticky (podľa kalendára) alebo Žiadna (nálezy #4/#21/#35). Voľba
// sezóny z menu by zdvojnásobila ceny a pustila sezónne legendy celý rok (dizajn 12.3: udalosti
// patria mesiacom). Ľubovoľná udalosť ostáva len pre ladenie cez ?event= v adrese. Sim to stráži
// tiež (sanitizeSettings, resolveEvent) — UI ju len nesmie ponúkať ani ukazovať.
//
// Rozhodnutia:
// - Posuvníky ukazujú 0–100 (percentá), ukladajú sa ako 0–1 (§5 Settings). Hlasitosť platí hneď
//   (HL.audio.setVolumes), na disk sa zapíše až po pustení posuvníka — nie 60× za sekundu ťahania.
// - Kalibrácia meria v SIMULAČNOM čase (súčet dt), nie hodinami prehliadača: boj (sim/fight.js)
//   posudzuje ťuknutie v kroku, v ktorom ho spracoval, v čase f.t − latencyMs. Keď metronóm aj
//   ťuknutia merajú v tej istej mierke, navrhnuté oneskorenie platí presne pre boj.
//   Úder = krok najbližší k plánovanému času (odchýlka ≤ dt/2 ≈ 8 ms); ťuknutie sa porovná
//   s NAJBLIŽŠÍM úderom, takže aj ťuknutie pred úderom (predbiehanie) dá zápornú hodnotu.
//   Výsledok = MEDIÁN (jedno uletené ťuknutie ho nepokazí), zaokrúhlený na 5 ms, orezaný na
//   −150..250 ms. Ručné −10/+10 majú tie isté hranice, aby sa rozsah nedal obísť.
// - Počas kalibrácie je klávesová navigácia VYPNUTÁ: medzerník je ťuknutie, nie "stlač
//   tlačidlo s fokusom". Tlačidlá tam majú klávesy (Enter = použiť, R = znova, Esc = zrušiť).
// - Vymazanie kariéry má dve fázy: tlačidlo otvorí potvrdenie a "Vymazať" v ňom je na INOM
//   mieste a zapne sa až po chvíľke — dvojklik ani podržaný Enter kariéru nezmažú omylom.
// - Jazyk (docs/I18N.md): riadok 'Jazyk' navrchu sekcie Hra ukazuje jazyk VLASTNÝM menom a otvorí
//   zoznam všetkých jazykov (režim 'lang', HL.ui.langList); jazyk bez prekladu je sivý 'čoskoro'.
//   Zmena platí hneď a uloží sa (HL.game.setLang). Riadky pod ním sú o LANG_ROW_H nižšie.
(function (HL) {
  function t(k, p) { return HL.i18n.t(k, p); }
  function pctLabel(v) { return HL.util.pct(v / 100); }
  var T = HL.T;
  T.def('Kalibrácia', 'calBpm', 100, 60, 160, 1, 'Metronóm kalibrácie oneskorenia (údery za minútu)');
  T.def('Kalibrácia', 'calTaps', 12, 8, 24, 1, 'Koľko ťuknutí kalibrácia zbiera, potom skončí sama');
  T.def('Kalibrácia', 'calMinTaps', 8, 3, 24, 1, 'Od koľkých ťuknutí sa dá výsledok použiť');
  T.def('Kalibrácia', 'calSpreadWarnMs', 60, 10, 200, 5, 'Rozptyl ťuknutí (ms), nad ktorým kalibrácia radí skúsiť znova');
  T.def('Kalibrácia', 'calArmSec', 0.8, 0, 3, 0.1, 'Vymazanie kariéry: po koľkých s sa odomkne potvrdenie');

  var LAT_MIN = -150, LAT_MAX = 250;
  var EVENTS = ['auto', 'none'];
  function evLabel(e) { return t('ui.settings.event.' + e); }
  var BAR_Y = 290;
  var LANG_ROW_H = 17; // riadok Jazyk (výška prepínača 16 + 1) — o toľko sú nižšie riadky pod ním

  var S = { mode: 'main', back: 'title', t: 0, dirty: false, saves: 0, previewAt: 0, shakeT: 0, armT: 0, cal: null, lastApplied: null, touchOnly: false };

  function P(n) { return HL.pal[n]; }
  function set() { return HL.game.settings; }
  // Starý zápis ('winter' z čias, keď menu sezóny ponúkalo) platí ako Automaticky — tak ho číta aj sim.
  function eventSetting() { var e = set().event; return EVENTS.indexOf(e) >= 0 ? e : 'auto'; }

  // Tlačidlo „Ladenie (F2)": nie na čisto dotykovom zariadení a nie na CrazyGames bez ?debug=1 (HL.devTools,
  // main.js start) — tam je panel nástroj vývojára (revízia 2026-10-04: tlačidlo ho na portáli otváralo).
  function devButton() { return !S.touchOnly && HL.devTools !== false; }

  // Čisto dotykové zariadenie (mobil, tablet bez myši): posuvníky F2 sú nástroj na ladenie s myšou
  // a klávesnicou — na telefóne by tlačidlo viedlo do panela, ktorý sa prstom ovláda zle. Na PC ostáva
  // (majiteľ číselníky používa). Hybridný notebook s dotykovou obrazovkou má aj jemný ukazovateľ.
  function touchOnly() {
    try {
      if (typeof window === 'undefined' || !window.matchMedia) return false;
      return !window.matchMedia('(any-pointer: fine)').matches && window.matchMedia('(any-pointer: coarse)').matches;
    } catch (e) { return false; }
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function signed(ms) { return (ms > 0 ? '+' : ms < 0 ? '–' : '') + Math.abs(ms) + ' ms'; } // i18n-ok: jednotka ms je vo všetkých jazykoch

  function persist() {
    HL.game.persistSettings();
    S.dirty = false;
    S.saves++;
  }

  // ------------------------------------------------------------------ kalibrácia
  function period() { return 60 / T.calBpm; }
  function beatTime(k) { return period() * (k + 1); } // prvý úder po jednej perióde — čas sa pripraviť
  function calReset() {
    S.cal = { t: 0, beat: 0, pulseAt: -9, offsets: [], lastTap: -9, lastOff: null, lastOffAt: -9, done: false };
  }
  function median(a) {
    if (!a.length) return null;
    var s = a.slice().sort(function (x, y) { return x - y; });
    var m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  function calStats() {
    var c = S.cal, off = c ? c.offsets : [];
    var med = median(off);
    var mad = med == null ? null : median(off.map(function (o) { return Math.abs(o - med); }));
    var sug = med == null ? null : clamp(Math.round(med / 5) * 5, LAT_MIN, LAT_MAX);
    return { n: off.length, median: med, spread: mad, suggested: sug, ready: off.length >= T.calMinTaps };
  }
  function calTap() {
    var c = S.cal, p = period();
    if (c.t < beatTime(0) - p / 2) return;        // pred prvým úderom nie je čo merať
    if (c.t - c.lastTap < p * 0.4) return;        // dvojité ťuknutie do jedného úderu
    c.lastTap = c.t;
    var k = Math.max(0, Math.round(c.t / p - 1));
    var off = (c.t - beatTime(k)) * 1000;
    c.offsets.push(off);
    c.lastOff = off; c.lastOffAt = c.t;
    if (c.offsets.length >= T.calTaps) { c.done = true; HL.ui.sfx('quest'); }
  }
  function calUpdate(dt) {
    var c = S.cal, W = HL.w;
    if (HL.ui.backPressed() || W.clicked('cal_cancel')) { leaveCal(); return; }
    if (W.clicked('cal_again')) { calReset(); return; }
    if (W.clicked('cal_apply')) {
      var st = calStats();
      if (st.ready) {
        set().latencyMs = st.suggested;
        S.lastApplied = st.suggested;
        persist();
        HL.ui.toast(t('ui.settings.latencySet', { v: signed(st.suggested) }), 'good');
        leaveCal();
      }
      return;
    }
    if (c.done) return;
    c.t += dt;
    while (c.t >= beatTime(c.beat) - dt / 2) {
      HL.ui.sfx('phase_slack');
      c.pulseAt = c.t;
      c.beat++;
    }
    if (W.clicked('cal_pad')) calTap();
  }
  function enterCal() {
    S.mode = 'cal';
    calReset();
    HL.w.nav = false;
  }
  function leaveCal() {
    S.mode = 'main';
    HL.w.nav = true;
    HL.w.setFocus('cal_start');
  }

  // ------------------------------------------------------------------ hlavné nastavenia
  function cycleEvent(dir) {
    var s = set(), i = EVENTS.indexOf(eventSetting());
    s.event = EVENTS[(i + dir + EVENTS.length) % EVENTS.length];
    persist(); // persistSettings zároveň prepočíta HL.world.currentEvent
  }
  function mainUpdate(dt) {
    var W = HL.w, s = set();
    if (HL.ui.backPressed() || W.clicked('done')) { HL.go(S.back, {}); return; }
    if (W.clicked('tg_vib')) { s.vibration = !s.vibration; persist(); if (s.vibration && HL.audio.vibrate) HL.audio.vibrate(40); }
    if (W.clicked('tg_shake')) { s.shake = !s.shake; persist(); if (s.shake) S.shakeT = 0.35; }
    if (W.clicked('tg_pixel')) { s.pixelPerfect = !s.pixelPerfect; persist(); if (HL.relayout) HL.relayout(); }
    if (W.clicked('ev_prev')) cycleEvent(-1);
    if (W.clicked('ev_next')) cycleEvent(1);
    if (W.clicked('lat_minus')) { s.latencyMs = clamp((s.latencyMs || 0) - 10, LAT_MIN, LAT_MAX); persist(); }
    if (W.clicked('lat_plus')) { s.latencyMs = clamp((s.latencyMs || 0) + 10, LAT_MIN, LAT_MAX); persist(); }
    if (W.clicked('cal_start')) { enterCal(); return; }
    if (W.clicked('dials') && devButton() && HL.dials && HL.dials.toggle) HL.dials.toggle();
    if (W.clicked('wipe')) { S.mode = 'confirm'; S.armT = 0; W.setFocus('wipe_no'); }
    if (W.clicked('lang')) { S.mode = 'lang'; W.setFocus('lang_' + HL.i18n.lang); }
  }
  // Zoznam jazykov: výber platí hneď (a uloží sa), späť do nastavení; Esc / Hotovo bez zmeny.
  function langUpdate() {
    var W = HL.w, code = HL.ui.langPicked();
    if (code) { HL.ui.langApply(code); S.saves++; S.mode = 'main'; W.setFocus('lang'); return; }
    if (HL.ui.backPressed() || W.clicked('lang_done')) { S.mode = 'main'; W.setFocus('lang'); }
  }
  function confirmUpdate(dt) {
    var W = HL.w;
    S.armT += dt;
    if (HL.ui.backPressed() || W.clicked('wipe_no')) { S.mode = 'main'; W.setFocus('wipe'); return; }
    if (W.clicked('wipe_yes') && S.armT >= T.calArmSec) {
      HL.game.newCareer();
      HL.ui.toast(t('ui.settings.wiped'), 'info');
      HL.go('title', {});
    }
  }

  // ------------------------------------------------------------------ kreslenie
  // Riadok posuvníka: popis a hodnota BEŽNÝM písmom ako popisy prepínačov (vizuálny kritik, 2. kolo:
  // "Hudba/Zvuky drobným 5-px písmom, prepínače 7-px"). HL.w.slider (widgets.js) kreslí svoj popis vždy
  // drobným písmom, preto dostane prázdny popis ' ' a prázdnu hodnotu: ťukacia plocha ostáva 18 px
  // (s popisom), text nekreslí. Dráha je o 2 px nižšie, aby sa dotiahnutie 'y' v "Zvuky" nedotklo bežca.
  function sliderRow(ctx, id, y, value, label) {
    var F = HL.font;
    var v = HL.w.slider(ctx, id, 8, y + 2, 164, value, 0, 100, 5, ' ', { format: function () { return ''; } });
    F.draw(ctx, label, 10, y, P('greyLight'), { maxWidth: 110 });
    F.draw(ctx, pctLabel(v), 172, y, P('white'), { align: 'right' }); // hodnota po ťahu v TOMTO snímku
    return v;
  }

  function toggleRow(ctx, id, y, label, on) {
    var D = HL.draw, F = HL.font;
    var st = HL.w.hit(id, 6, y, 168, 16);
    if (st.hover) D.rect(ctx, 6, y, 168, 16, P('navy'));
    F.draw(ctx, label, 10, y + 3, P('greyLight'), { maxWidth: 110 });
    F.draw(ctx, on ? t('ui.settings.on') : t('ui.settings.off'), 140, y + 5, on ? P('greenLight') : P('grey'), { small: true, align: 'right' });
    // prepínač 26 × 12: zelená dráha s bežcom vpravo = zapnuté
    var sx = 144, sy = y + 2;
    D.rect(ctx, sx + 1, sy, 24, 12, P('ink')); D.rect(ctx, sx, sy + 1, 26, 10, P('ink'));
    D.rect(ctx, sx + 1, sy + 1, 24, 10, on ? P('green') : P('slateDark'));
    var kx = on ? sx + 14 : sx + 2;
    D.rect(ctx, kx, sy + 2, 10, 8, on ? P('white') : P('grey'));
    D.rect(ctx, kx, sy + 9, 10, 1, on ? P('greyLight') : P('slate'));
  }

  // Riadok Jazyk: popis vľavo, vpravo tlačidlo s menom jazyka VLASTNÝM písmom a so zemeguľou (rovnaký
  // rozsah x ako riadok Udalosť: 68..174), aby ho našiel aj hráč, ktorý po slovensky nečíta.
  function langRow(ctx, y) {
    var F = HL.font, info = HL.i18n.info(HL.i18n.lang) || HL.i18n.LANGS[0];
    F.draw(ctx, t('ui.settings.lang'), 10, y + 3, P('greyLight'), { maxWidth: 56 });
    HL.w.button(ctx, 'lang', 68, y, 106, 16, info.name + ' ▾', {});
    HL.ui.globe(ctx, 72, y + 4, P('cyan'));
  }

  function drawMain(ctx) {
    var F = HL.font, U = HL.ui, s = set(), dy = LANG_ROW_H;
    U.header(ctx, t('ui.settings.title'), { money: false });
    var shaking = S.shakeT > 0 && s.shake;
    if (shaking) { ctx.save(); ctx.translate(Math.round(Math.sin(S.t * 70) * 2), 0); }

    U.section(ctx, 6, 26, 168, t('ui.settings.sound'));
    var mv = sliderRow(ctx, 'music', 39, Math.round(s.musicVol * 100), t('ui.settings.music'));
    if (mv !== Math.round(s.musicVol * 100)) { s.musicVol = mv / 100; HL.audio.setVolumes(s.musicVol, s.sfxVol); S.dirty = true; }
    var sv = sliderRow(ctx, 'sfx', 60, Math.round(s.sfxVol * 100), t('ui.settings.sfx'));
    if (sv !== Math.round(s.sfxVol * 100)) { s.sfxVol = sv / 100; HL.audio.setVolumes(s.musicVol, s.sfxVol); S.dirty = true; S.previewAt = S.t + 0.15; }

    U.section(ctx, 6, 83, 168, t('ui.settings.game'));
    langRow(ctx, 97);
    toggleRow(ctx, 'tg_vib', 97 + dy, t('ui.settings.vibration'), s.vibration);
    toggleRow(ctx, 'tg_shake', 114 + dy, t('ui.settings.shake'), s.shake);
    toggleRow(ctx, 'tg_pixel', 131 + dy, t('ui.settings.pixel'), s.pixelPerfect);

    F.draw(ctx, t('ui.settings.event'), 10, 153 + dy, P('greyLight'));
    HL.w.button(ctx, 'ev_prev', 68, 150 + dy, 20, 16, '←', {});
    F.draw(ctx, evLabel(eventSetting()), 121, 153 + dy, P('white'), { align: 'center', maxWidth: 60 });
    HL.w.button(ctx, 'ev_next', 154, 150 + dy, 20, 16, '→', {});
    var cur = HL.world.currentEvent;
    var now = t('ui.settings.eventNow', { event: cur ? HL.world.eventName(cur) : t('ui.settings.eventNone') });
    // ?event= v adrese má prednosť — to je ladiaci nástroj, hráč ho nevidí (kritik to čítal ako uniknutý ladiaci text)
    if (HL.game.eventOverride != null && HL.debug && HL.debug.on) now += ' (z adresy)'; // i18n-ok: len s F3
    F.draw(ctx, now, 10, 168 + dy, cur ? P('pink') : P('greyLight'), { maxWidth: 164 });

    U.section(ctx, 6, 180 + dy, 168, t('ui.settings.rhythm'));
    F.draw(ctx, t('ui.settings.latency'), 10, 195 + dy, P('greyLight'), { maxWidth: 120 });
    F.draw(ctx, signed(s.latencyMs || 0), 172, 195 + dy, P('white'), { align: 'right' });
    HL.w.button(ctx, 'lat_minus', 8, 208 + dy, 32, 18, '–10', { disabled: (s.latencyMs || 0) <= LAT_MIN });
    HL.w.button(ctx, 'lat_plus', 44, 208 + dy, 32, 18, '+10', { disabled: (s.latencyMs || 0) >= LAT_MAX });
    HL.w.button(ctx, 'cal_start', 80, 208 + dy, 94, 18, t('ui.settings.calibrate'), {});

    U.section(ctx, 6, 231 + dy, 168, t('ui.settings.other'));
    if (devButton()) {
      HL.w.button(ctx, 'dials', 8, 245 + dy, 78, 18, t('ui.settings.dials'), {});
      HL.w.button(ctx, 'wipe', 90, 245 + dy, 84, 18, t('ui.settings.wipe'), { style: 'danger' });
    } else {
      // bez Ladenia (dotyk, CrazyGames): nebezpečné tlačidlo ostáva malé (nie cez celú šírku pod palcom), v strede
      HL.w.button(ctx, 'wipe', 48, 245 + dy, 84, 18, t('ui.settings.wipe'), { style: 'danger' });
    }
    // Pätička: medzi Iné a Hotovo (pod riadkom Jazyk ostal na ňu 1 riadok drobného písma).
    F.draw(ctx, t('ui.settings.footer'), 90, 245 + dy + 18 + 1, P('grey'), { small: true, align: 'center', maxWidth: 168 });

    if (shaking) ctx.restore();
    HL.w.button(ctx, 'done', 6, BAR_Y, 168, 26, t('ui.settings.done'), { style: 'primary' });
  }

  function drawLang(ctx) {
    HL.ui.header(ctx, t('ui.common.lang.title'), { money: false, sub: t('ui.settings.title') });
    HL.ui.globe(ctx, 164, 8, P('cyan'));
    HL.ui.langList(ctx, 14, 32, 152, { rowH: 22, gap: 5 });
    HL.w.button(ctx, 'lang_done', 6, BAR_Y, 168, 26, t('ui.settings.done'), { style: 'primary' });
  }

  function drawCal(ctx) {
    var D = HL.draw, F = HL.font, c = S.cal, st = calStats();
    HL.ui.header(ctx, t('ui.settings.cal.title'), { money: false, sub: t('ui.settings.title') });
    F.drawWrapped(ctx, t('ui.settings.cal.intro'), 8, 27, 164, P('greyLight'), {});

    // Plocha na ťukanie: celá stredná časť (veľký cieľ pre palec).
    var px = 6, py = 52, pw = 168, ph = 150;
    HL.w.hit('cal_pad', px, py, pw, ph, { hotkey: 'Space', nav: false });
    D.panel(ctx, px, py, pw, ph, 'dark');
    var pulse = c.done ? 0 : Math.max(0, 1 - (c.t - c.pulseAt) / 0.3);
    var cx = 90, cy = 112, r = 14 + Math.round(pulse * 8);
    D.circle(ctx, cx, cy, r + 3, P('navy'));
    D.circle(ctx, cx, cy, r, pulse > 0.55 ? P('amber') : pulse > 0.2 ? P('orange') : P('slateDark'));
    D.circle(ctx, cx, cy, r, pulse > 0.2 ? P('yellow') : P('slate'), false);
    // posledné ťuknutie: odchýlka pri kruhu, krátko
    if (c.lastOff != null && c.t - c.lastOffAt < 0.45 && !c.done) {
      F.draw(ctx, signed(Math.round(c.lastOff)), cx, cy + r + 6, P('cyan'), { align: 'center', shadow: P('ink') });
    }
    if (c.done) {
      D.circle(ctx, cx, cy, r, P('greenDark'));
      D.circle(ctx, cx, cy, r, P('greenLight'), false);
      F.draw(ctx, t('ui.settings.done'), cx, cy + r + 6, P('greenLight'), { align: 'center', shadow: P('ink') });
    } else F.draw(ctx, st.n ? t('ui.settings.cal.watch') : t('ui.settings.cal.tapHere'), cx, py + ph - 16, P('greyLight'), { align: 'center', maxWidth: pw - 8 });
    // body za ťuknutia
    var nT = T.calTaps, dw = 6, gap = 3, total = nT * dw + (nT - 1) * gap, dx0 = 90 - Math.floor(total / 2);
    for (var i = 0; i < nT; i++) {
      var filled = i < st.n;
      D.rect(ctx, dx0 + i * (dw + gap), py + 8, dw, 5, filled ? P('greenLight') : P('slateDark'));
    }

    // Os odchýlok −300..+300 ms: kde padajú ťuknutia voči úderu.
    var ax = 14, aw = 152, ay = 214, span = 300;
    function toX(ms) { return ax + Math.round((clamp(ms, -span, span) + span) / (2 * span) * (aw - 1)); }
    D.rect(ctx, ax, ay + 4, aw, 1, P('slateDark'));
    for (var m = -span; m <= span; m += 100) D.rect(ctx, toX(m), ay + 2, 1, 5, m === 0 ? P('white') : P('slate'));
    for (var k = 0; k < c.offsets.length; k++) D.rect(ctx, toX(c.offsets[k]), ay, 1, 9, P('cyan'));
    if (st.median != null) { D.rect(ctx, toX(st.median) - 1, ay - 2, 3, 13, P('yellow')); }
    F.draw(ctx, t('ui.settings.cal.early'), ax, ay + 11, P('grey'), { small: true });
    F.draw(ctx, t('ui.settings.cal.beat'), 90, ay + 11, P('grey'), { small: true, align: 'center' });
    F.draw(ctx, t('ui.settings.cal.late'), ax + aw, ay + 11, P('grey'), { small: true, align: 'right' });

    var y = 238;
    F.draw(ctx, t('ui.settings.cal.taps', { n: st.n, total: nT }), 8, y, P('white'));
    if (st.median != null) F.draw(ctx, t('ui.settings.cal.median', { v: signed(Math.round(st.median)) }), 172, y, P('yellow'), { align: 'right' });
    y += 12;
    if (st.ready) {
      F.draw(ctx, t('ui.settings.cal.suggest', { v: signed(st.suggested), now: signed(set().latencyMs || 0) }), 8, y, P('amber'), { maxWidth: 164 });
      y += 12;
      if (st.spread > T.calSpreadWarnMs) F.drawWrapped(ctx, t('ui.settings.cal.spreadWarn', { ms: Math.round(st.spread) }), 8, y, 164, P('pink'), {});
      else F.draw(ctx, t('ui.settings.cal.spread', { ms: Math.round(st.spread) }), 8, y, P('grey'), { small: true });
    } else {
      F.draw(ctx, t('ui.settings.cal.more', { taps: HL.i18n.plural(T.calMinTaps - st.n, 'ui.settings.cal.tapsLeft') }), 8, y, P('grey'), { maxWidth: 164 });
    }

    HL.w.button(ctx, 'cal_cancel', 6, BAR_Y, 50, 26, t('ui.settings.cancel'), {});
    HL.w.button(ctx, 'cal_again', 60, BAR_Y, 50, 26, t('ui.settings.again'), { hotkey: 'KeyR' });
    HL.w.button(ctx, 'cal_apply', 114, BAR_Y, 60, 26, t('ui.settings.apply'), { style: 'primary', disabled: !st.ready, hotkey: 'Enter' });
  }

  function drawConfirm(ctx) {
    var D = HL.draw, F = HL.font;
    HL.ui.header(ctx, t('ui.settings.title'), { money: false });
    // Stmavenie po rampe palety (čisté farby), nie šachovnica cez celú plochu (vizuálny kritik).
    if (D.shade) D.shade(ctx, 0, 22, 180, 298, 2); else D.rect(ctx, 0, 22, 180, 298, P('ink'));
    var msg = t('ui.settings.wipeText');
    var x = 10, w = 160, lines = F.wrap(msg, w - 16, {});
    var h = 28 + lines.length * 11 + 12 + 30, y = 80;
    D.panel(ctx, x, y, w, h);
    D.sprite(ctx, HL.spr.get('icon_warn'), x + 8, y + 8);
    F.draw(ctx, t('ui.settings.wipeTitle'), x + 24, y + 10, P('pink'), { maxWidth: w - 30 });
    for (var i = 0; i < lines.length; i++) F.draw(ctx, lines[i], x + 8, y + 28 + i * 11, P('greyLight'));
    var armed = S.armT >= T.calArmSec;
    HL.w.button(ctx, 'wipe_no', x + 8, y + h - 30, 70, 22, t('ui.settings.keep'), { autofocus: true });
    HL.w.button(ctx, 'wipe_yes', x + w - 78, y + h - 30, 70, 22, t('ui.settings.wipeYes'), { style: 'danger', disabled: !armed });
  }

  // ------------------------------------------------------------------ scéna
  HL.scenes.def('settings', {
    enter: function (p) {
      p = p || {};
      // späť do dediny, do Starej elektrárne (jadrové jazero) alebo na titulku — iný cieľ nie je
      S.back = p.back === 'village' || p.back === 'elektraren' ? p.back : 'title';
      S.mode = 'main'; S.t = 0; S.dirty = false; S.previewAt = 0; S.shakeT = 0; S.armT = 0; S.cal = null;
      S.touchOnly = touchOnly();
      HL.w.nav = true;
      // Posuvník nevie 'autofocus'; bez tohto by fokus padol na šípku späť a prvý Enter by odišiel.
      HL.w.setFocus('music');
      if (HL.music && HL.music.set) HL.music.set(S.back === 'title' ? 'title' : 'village');
    },
    exit: function () {
      if (S.dirty) persist();
      HL.w.nav = false;
    },
    update: function (dt) {
      S.t += dt;
      if (S.shakeT > 0) S.shakeT = Math.max(0, S.shakeT - dt);
      if (S.dirty && !HL.input.pointer.down) persist();
      if (S.previewAt && S.t >= S.previewAt) { S.previewAt = 0; HL.ui.sfx('coin'); }
      if (S.mode === 'cal') calUpdate(dt);
      else if (S.mode === 'confirm') confirmUpdate(dt);
      else if (S.mode === 'lang') langUpdate();
      else mainUpdate(dt);
    },
    draw: function (ctx) {
      // Plochá výplň, nie šachovnica cez celú plochu: drobné písmo a tenké čiary sa na nej
      // nerozpadajú (vizuálny kritik). Prechod pozadia tu nič nenesie.
      HL.draw.rect(ctx, 0, 0, 180, 320, P('ink'));
      if (S.mode === 'cal') drawCal(ctx);
      else if (S.mode === 'confirm') drawConfirm(ctx);
      else if (S.mode === 'lang') drawLang(ctx);
      else drawMain(ctx);
    },
    drawPanel: function (ctx, side, w, h) {
      var D = HL.draw, F = HL.font;
      D.panel(ctx, 2, 2, w - 4, h - 4);
      if (side === 'L') {
        F.draw(ctx, t('ui.settings.panel.controls'), 8, 8, P('amber'));
        // Mená kláves (Enter, R, Esc, F2) sa neprekladajú; medzerník áno.
        var rows = S.mode === 'cal'
          ? [[t('ui.settings.panel.space'), t('ui.settings.panel.tap')], ['Enter', t('ui.settings.panel.applySuggestion')], ['R', t('ui.settings.panel.again')], ['Esc', t('ui.settings.panel.cancel')]]
          : [['↑ ↓', t('ui.settings.panel.select')], ['← →', t('ui.settings.panel.slider')], ['Enter', t('ui.settings.panel.press')], ['Esc', t('ui.settings.panel.back')]].concat(HL.devTools !== false ? [['F2', t('ui.settings.panel.dials')]] : []);
        for (var i = 0; i < rows.length; i++) {
          F.draw(ctx, rows[i][0], 8, 24 + i * 22, P('white'));
          F.draw(ctx, rows[i][1], 8, 34 + i * 22, P('grey'), { small: true, maxWidth: w - 16 });
        }
        return;
      }
      F.draw(ctx, t('ui.settings.panel.latency'), 8, 8, P('amber'));
      var py = 24;
      py += F.drawWrapped(ctx, t('ui.settings.panel.latencyWhy'), 8, py, w - 16, P('white'), {}) + 8;
      py += F.drawWrapped(ctx, t('ui.settings.panel.latencySign'), 8, py, w - 16, P('greyLight'), {}) + 12;
      F.draw(ctx, t('ui.settings.panel.now'), 8, py, P('grey'), { small: true });
      F.draw(ctx, signed(set().latencyMs || 0), 8, py + 10, P('white'), { scale: 2 });
    },
    probe: function () {
      var s = set(), st = calStats();
      return {
        lang: HL.i18n.lang, langSetting: s.lang || null,
        mode: S.mode, back: S.back, focused: HL.w.focused(),
        musicVol: s.musicVol, sfxVol: s.sfxVol, vibration: s.vibration, shake: s.shake, pixelPerfect: s.pixelPerfect,
        event: s.event, eventShown: eventSetting(), eventOptions: EVENTS.slice(), touchOnly: S.touchOnly, eventActive: HL.world.currentEvent || null, eventOverride: HL.game.eventOverride,
        latencyMs: s.latencyMs, saves: S.saves, dirty: S.dirty, lastApplied: S.lastApplied,
        armed: S.mode === 'confirm' && S.armT >= T.calArmSec,
        cal: S.cal ? { t: S.cal.t, beats: S.cal.beat, taps: st.n, offsets: S.cal.offsets.map(function (o) { return Math.round(o * 10) / 10; }),
          median: st.median, spread: st.spread, suggested: st.suggested, ready: st.ready, done: S.cal.done, periodMs: Math.round(period() * 1000) } : null,
      };
    },
  });
})(globalThis.HL);
