// Príprava na ponor (dizajn 2 slučka, 5.1 návnada, 15.2 obrazovka Príprava).
//
// Čo tu hráč rozhoduje: KTORÚ návnadu nesie (jediná voľba pred ponorom — určuje, ktoré ryby
// prídu). Všetko ostatné je informácia na rozhodnutie: výbava (kam až smie klesnúť), čas,
// počasie, mesiac, predpoveď z Meteostanice a čo dnes trh chce. Ponor samotný spúšťa scéna
// 'dive' (HL.game.startDive má jediné volajúce miesto) — my jej len odovzdáme návnadu.
//
// Rozhodnutia:
// - Karty návnad sú "rádiové tlačidlá": klik/ťuk vyberie, a pri klávesnici vyberie už
//   PRESUN fokusu šípkami. Enter je skratka PONORIŤ SA, takže "šípkami vyber, Enterom choď"
//   funguje bez toho, aby Enter na karte najprv len vyberal a hráč musel stláčať dvakrát.
//   Keď je fokus na šípke späť, Enter platí pre ňu (inak by Enter na "späť" hráča ponoril).
// - Posledná voľba sa pamätá v save.tutorial.lastBait (prežije aj zavretie karty). Keď
//   návnada medzičasom došla, spadne sa na červíka — nikdy nie na kartu, ktorá neexistuje.
// - Pri návnade sa zobrazia drobné rybky, ktoré ju berú ako IDEÁLNU: známe druhy farebne,
//   neznáme ako tieň. Hráč tak vidí, čo návnada priláka, aj keď to ešte nechytil.
// - Celý obsah je v jednom posúvanom zozname: s piatimi návnadami a Meteostanicou L3 sa
//   na 180×320 nezmestí, a hlavné tlačidlo musí ostať vždy na tom istom mieste dole.
// - Vzhľad (vizuálny kritik): plné plochy, žiadna šachovnica (obsah mal 57 % vysokofrekvenčných
//   pixelov). "Zatemnené" (čo Meteostanica nevidí, kam vlasec nesiahne) = farba o kroky rampy
//   palety tmavšia (HL.pal.darker), nie prekrytie šachovnicou. Vety bežným písmom, drobné len
//   na štítky a čísla.
// - Preklad (docs/I18N.md): texty sú v src/data/lang/<kód>/prep.js (kľúče ui.prep.*), počítajú sa pri
//   kreslení. Mená návnad, výbavy, pásiem a počasia sú dáta prekladané na mieste (HL.i18n.overlay).
// - Lovné miesto (docs/JAZERO.md): enter({ location: 'jadro', back: 'elektraren' }) pripraví ponor v jadrovom
//   jazere — jazerný vlasec a prút, pásma jazera, ryby jazera pri návnadách, dosah podľa Lodenice; horúci
//   dopyt (len morské ryby) a harpúny (v jazere nie sú žraloky) sa tam neukazujú. Späť ide tam, odkiaľ hráč prišiel.
// - Predpoveď rýb (majiteľ 2026-10-04: „v danú hodinu v danej hĺbke sú dané ryby", docs/ARCHITECTURE.md §24): sekcia
//   „Čo kedy berie" HNEĎ pod počasím, nad návnadami. Dáta = HL.village.fishForecast (ten istý dosah ako predpoveď
//   počasia, Meteostanica 0/6/24/72 h; nechytené legendy len s Krčmou 3, dosah háčika ako ponor). Blok = hlavička
//   (ikona počasia, čas „teraz" / „17:00" / „zajtra 05:00" / „pozajtra 05:00" / „deň 7, 05:00", vpravo drobným
//   „obdobie · počasie" na ZAČIATKU bloku) a riadok na každý druh: meno bežným písmom, vpravo hĺbka drobným.
//   Nechytený druh = „?" (ako encyklopédia), legenda „★ " žltá, druh, na ktorý háčik nedosiahne, sivý (aj legenda).
//   Blok bez druhov s podmienkou = „len bežné ryby" (tie berú stále). Hlavička (revízia 2026-10-04): kúsky bloku
//   s rôznym počasím = len obdobie, bez ikony počasia; nov/spln v celom bloku = sprite mesiaca vpravo hore (blok
//   rozdelený o polnoci ukáže prečo); čo sa nezmestí do riadku, ide drobným na druhý riadok (nič sa neskracuje).
// - ZBALENÁ predvolene (revízia 2026-10-04, major 3: pri Meteostanici 2–3 boli karty návnad 385–544 px dole, pod
//   ohybom vo všetkých 160 meraných stavoch): ukáže sa len blok TERAZ a pod ním riadok „Ďalšie hodiny (N zmien) ▸"
//   (HL.w.hit 'fish_more', šípkami ako karty; Enter na ňom ho prepne a NEponorí — ako šípka späť). Rozbalená =
//   VŠETKY bloky po koniec dosahu Meteostanice a riadok „Skryť predpoveď ▴" (pri zbalení ostane riadok pod prstom).
//   Bez Meteostanice (dosah 0) alebo keď sa v dosahu nič nemení (1 blok) riadok nie je. Stav je len v scéne
//   (st.fishOpen) — každý vstup do Prípravy začne zbalený.
(function (HL) {
  function t(k, p) { return HL.i18n.t(k, p); }
  function tp(n, k, p) { return HL.i18n.plural(n, k, p); }
  var W = 180, M = 6, LIST_Y = 22, LIST_H = 262, BAR_Y = 284;
  var HAUL_W = 46; // prepínač bonusového ponoru vedľa PONORIŤ SA
  // Malý vypínač v spodnej časti prepínača (ako v Nastaveniach: zelená dráha a bežec vpravo = zapnuté).
  function haulSwitch(ctx, x, y, on) {
    var D = HL.draw, sx = x + Math.floor((HAUL_W - 18) / 2), sy = y + 18;
    D.rect(ctx, sx, sy, 18, 6, P().ink);
    D.rect(ctx, sx + 1, sy + 1, 16, 4, on ? P().green : P().slateDark);
    D.rect(ctx, on ? sx + 10 : sx + 1, sy + 1, 7, 4, on ? P().white : P().grey);
  }
  var CARD_H = 28, CARD_GAP = 3, ROW = 14;
  // Predpoveď rýb: hlavička bloku 13 px (ikona 12 px), s druhým riadkom drobným 22 px; riadok druhu 12 px (bežné písmo
  // 11 + 1 — diakritika sa nelepí k riadku nad ňou, F.lineStep), medzera medzi blokmi 3 px. Čas aj mená začínajú za
  // ikonou (FISH_X). Sprite mesiaca (12 px + 2 medzera) vpravo hore. Riadok zbaliť/rozbaliť 16 px (cieľ ≥ 16 × 14).
  var FISH_HEAD = 13, FISH_HEAD2 = 22, FISH_ROW = 12, FISH_GAP = 3, FISH_X = M + 16, FISH_R = W - M - 2, MOON_W = 14;
  var FISH_TOGGLE_H = 16;

  var st = { sel: 'worm', cards: [], layout: null, t: 0, lastFocus: null, loc: 'more', back: 'village', fishOpen: false };
  function lake() { return HL.world.isLake(st.loc); }

  function P() { return HL.pal; }
  function F() { return HL.font; }
  function save() { return HL.game.save; }

  var byId = null;
  function species(id) {
    if (!byId) byId = HL.util.byId(HL.data.allFish.concat(HL.data.allLegends));
    return byId[id];
  }
  function baitData(id) { return HL.util.byId(HL.data.baits)[id]; }
  // Číslo sa pri zalomení neodtrhne od jednotky ("1 | 500 m") — nezlomiteľná medzera.
  // \p{L} = písmeno každého jazyka (zoznam len so slovenskou diakritikou lámal pl "3 | żarłoczne").
  function nb(s) { return String(s).replace(/(\d) (?=[0-9€%\p{L}])/gu, '$1\u00a0'); }

  // Zmenšený tieň druhu: spoločné HL.ui.silhouette (celočíselné zmenšenie + pravidlo hrúbky tela).
  function silThumb(id, maxW, maxH, color) { return HL.ui.silhouette(id, maxW, maxH, color); }

  function known(id) {
    var e = save().encyclopedia[id];
    return !!(e && e.n > 0);
  }

  // Farba o 'steps' krokov rampy palety tmavšia (paleta ostáva presná, žiadne miešanie).
  // Keď by z farby ostal čistý atrament (na atramentovom podklade neviditeľný), stačí o krok menej.
  function darker(c, steps) {
    if (!HL.pal.darker) return HL.pal.navy;
    var d = HL.pal.darker(c, steps);
    return d === HL.pal.ink && steps > 1 ? HL.pal.darker(c, steps - 1) : d;
  }

  // Druhy, ktoré návnadu berú ako ideálnu. Sezónne len počas svojej udalosti (inak by karta
  // sľubovala rybu, ktorá dnes v mori nie je).
  function idealFor(baitId) {
    var ev = HL.world.currentEvent;
    return HL.world.location(st.loc).fish.filter(function (f) {
      if (f.event && f.event !== ev) return false;
      return f.bait.ideal.indexOf(baitId) >= 0;
    }).map(function (f) { return f.id; });
  }

  // Opis návnady podľa miesta: v jazere lakeDesc, ak ho návnada má (morský opis spomína pásma mora).
  function baitDesc(b) { return lake() && b.lakeDesc ? b.lakeDesc : b.desc; }

  // Karty: červík vždy, ostatné len keď ich hráč má (zlatá tiež — je to bežná položka zásoby).
  function buildCards() {
    var s = save(), out = [];
    HL.data.baits.forEach(function (b) {
      var stock = b.infinite ? Infinity : (s.baits[b.id] || 0);
      if (!b.infinite && !(stock > 0)) return;
      out.push({
        id: b.id, name: b.name, desc: baitDesc(b), stock: stock,
        carry: b.infinite ? Infinity : Math.min(stock, HL.game.baitCarry(st.haul)), // bonusový ponor nesie viac
        ideal: b.id === 'gold' ? [] : idealFor(b.id),
      });
    });
    return out;
  }

  function hasCard(id) { return st.cards.some(function (c) { return c.id === id; }); }

  function choose(id) {
    if (!hasCard(id) || st.sel === id) return;
    st.sel = id;
  }

  // ------------------------------------------------------------------ údaje pre obrazovku
  function gearInfo() {
    var s = save(), D = HL.data, u = HL.util, lk = lake();
    var line = lk ? u.byId(D.lakeLines)[s.gear.lakeLine] || D.lakeLines[0] : u.byId(D.lines)[s.gear.line] || D.lines[0];
    var rod = lk ? u.byId(D.lakeRods)[s.gear.lakeRod] || D.lakeRods[0] : u.byId(D.rods)[s.gear.rod] || D.rods[0];
    var hook = u.byId(D.hooks)[s.gear.hook] || D.hooks[0];
    var maxD = HL.village.maxDepth(s, st.loc);
    // Prečo je dosah taký, aký je: hráč musí vedieť, či pomôže lepší vlasec, alebo Maják (v jazere Lodenica).
    var limit = 'line';
    if (lk) { if (maxD < line.maxDepth) limit = maxD < D.LAKE_FLOOR ? 'shipyard' : 'floor'; }
    else if (maxD < line.maxDepth) limit = HL.village.level(s, 'majak') < 3 && maxD <= 1500 ? 'lighthouse' : 'floor';
    return { line: line, rod: rod, hook: hook, maxDepth: maxD, limit: limit, harpoons: s.gear.harpoons || 0,
      stored: s.storage.length, cap: HL.village.storageCap(s) };
  }

  // ------------------------------------------------------------------ rozloženie obsahu
  // Výšky sa rátajú PRED kreslením, aby zoznam poznal výšku obsahu už v prvom snímku.
  function computeLayout() {
    var env = HL.game.env();
    var f = HL.village.forecast(save(), env);
    var g = gearInfo();
    var hot = lake() ? [] : HL.market.hot(save());
    var L = { env: env, f: f, g: g, hot: hot };
    var y = LIST_Y + 4;
    L.cond = y;
    L.rows = forecastRows(f, env);
    L.condH = 24 + (L.rows.length ? L.rows.length * 15 : 12) + (f.intro && f.hours ? 12 : 0) + (HL.world.currentEvent ? 10 : 0) + 2;
    y += L.condH + 5;
    // predpoveď rýb hneď pod počasím: nadpis, blok TERAZ (zbalená) alebo všetky bloky (rozbalená), riadok zbaliť/rozbaliť
    var ff = L.ff = HL.village.fishForecast(save(), st.loc, env);
    L.fishChanges = ff.hours > 0 ? ff.blocks.length - 1 : 0; // koľkokrát sa ryby v dosahu Meteostanice ešte zmenia
    L.fishBlocks = st.fishOpen && L.fishChanges ? ff.blocks : ff.blocks.slice(0, 1);
    L.fishHead = y; y += 14;
    L.fishY = []; L.fishH = []; L.fishHeads = [];
    for (var i = 0; i < L.fishBlocks.length; i++) {
      var hd = fishHeadOf(L.fishBlocks[i], i, env);
      L.fishHeads.push(hd);
      L.fishY.push(y);
      L.fishH.push(hd.h + Math.max(1, L.fishBlocks[i].fish.length) * FISH_ROW);
      y += L.fishH[i] + FISH_GAP;
    }
    L.fishToggleY = null;
    if (L.fishChanges) { L.fishToggleY = y; y += FISH_TOGGLE_H; }
    L.fishEnd = y;
    y += 2;
    L.baitHead = y; y += 14;
    L.cards = y; y += st.cards.length * (CARD_H + CARD_GAP);
    y += 4;
    L.gearHead = y; y += 14;
    L.gear = y; y += (lake() ? 4 : 5) * ROW + (g.limit !== 'line' ? 12 : 0);
    y += 5;
    L.reachHead = y; y += 14;
    L.reachY = y; y += 26;
    if (!lake()) {
      L.hotHead = y; y += 14;
      L.hotY = y; y += hot.length ? hot.length * ROW : 12;
    }
    y += 6;
    L.contentH = y - LIST_Y;
    return L;
  }

  // ------------------------------------------------------------------ kreslenie častí
  // Predpoveď po dňoch: jeden riadok = jeden kalendárny deň na osi 0–24 h, takže
  // "zajtra ráno prší" sa dá prečítať priamo (72 h v jednom páse by mali úseky po 9 px
  // a ikony by sa nezmestili). Čo Meteostanica nevidí, je zatemnené.
  function forecastRows(f, env) {
    var rows = [];
    if (!f.hours) return rows;
    var end = env.m + f.hours * 60;
    for (var k = 0; k < 3; k++) {
      var ds = (env.day + k) * 1440;
      if (ds >= end) break;
      rows.push({ k: k, dayStart: ds, from: Math.max(ds, env.m), to: Math.min(ds + 1440, end) });
    }
    return rows;
  }

  var WCOL = { sun: 'amber', cloudy: 'grey', rain: 'blue', fog: 'greyLight', storm: 'purple' };
  // Plná tmavá výplň úseku (ikona na nej svieti, počasie nesie čiara dole vo WCOL). Posun po rampe
  // o 2 kroky dal slnku hrdzavú (rust) — príliš hlasnú vedľa ikon; tmavé tóny rámp sú pokojnejšie.
  var WDARK = { sun: 'wood', cloudy: 'slateDark', rain: 'blueDark', fog: 'slateDark', storm: 'plum' };
  // Riadok predpovede: 0 = dnes, 1 = zajtra, 2 = pozajtra.
  function dayName(k) { return k === 0 ? t('ui.prep.today') : k === 1 ? t('ui.prep.tomorrow') : t('ui.prep.dayAfter'); }

  function drawForecastRow(ctx, x, y, w, row, segs, env, moon) {
    var P_ = P(), F_ = F(), D = HL.draw;
    // maxWidth: pridlhý názov dňa by lišta (x + 34) ticho prekreslila — takto ho skráti výpustka a lang_check ho nahlási
    F_.draw(ctx, dayName(row.k), x, y + 3, row.k ? P_.greyLight : P_.white, { small: true, maxWidth: 32 });
    var sx = x + 34, sw = w - 34 - (moon != null ? 16 : 0);
    var px = function (m) { return sx + Math.round((m - row.dayStart) / 1440 * sw); };
    D.rect(ctx, sx, y, sw, 13, P_.ink);
    for (var i = 0; i < segs.length; i++) {
      var a = Math.max(segs[i].from, row.from), b = Math.min(segs[i].to, row.to);
      if (b <= a) continue;
      var x0 = px(a), x1 = px(b), wc = P_[WCOL[segs[i].weather]] || P_.grey;
      // úsek = tmavý odtieň farby počasia (plná plocha), dole čiara v plnej farbe
      D.rect(ctx, x0, y + 1, Math.max(1, x1 - x0), 11, P_[WDARK[segs[i].weather]] || darker(wc, 2));
      D.rect(ctx, x0, y + 11, Math.max(1, x1 - x0), 1, wc);
      if (x0 > sx + 1) D.rect(ctx, x0, y + 1, 1, 11, P_.ink);
      if (x1 - x0 >= 13) HL.draw.sprite(ctx, HL.spr.get(HL.world.weatherIcon(segs[i].weather, segs[i].from)), Math.round((x0 + x1) / 2) - 6, y);
    }
    // čo Meteostanica nevidí (minulosť dneška, koniec dosahu) = plná tmavá plocha
    if (row.from > row.dayStart) D.rect(ctx, sx, y, px(row.from) - sx, 13, P_.navy);
    if (row.to < row.dayStart + 1440) D.rect(ctx, px(row.to), y, sx + sw - px(row.to), 13, P_.navy);
    // ryhy 6, 12, 18 h a značka "teraz"
    for (var hh = 6; hh < 24; hh += 6) D.rect(ctx, px(row.dayStart + hh * 60), y + 12, 1, 2, P_.slate);
    if (row.k === 0) D.rect(ctx, px(env.m), y - 1, 1, 15, P_.yellow);
    if (moon != null) HL.draw.sprite(ctx, HL.spr.get('moon_' + moon), x + w - 12, y);
  }

  function drawConditions(ctx, L) {
    var P_ = P(), F_ = F(), D = HL.draw, env = L.env, f = L.f;
    var x = M, y = L.cond, w = W - 2 * M;
    D.panel(ctx, x, y, w, L.condH, 'dark');
    // riadok 1: počasie a mesiac TERAZ
    HL.draw.sprite(ctx, HL.spr.get(HL.world.weatherIcon(env.weather, env.m)), x + 5, y + 5);
    var wn = F_.draw(ctx, HL.world.weatherName(env.weather, env.m), x + 20, y + 5, P_.white, { maxWidth: 60 });
    // Mesiac na x + 84, meno drobným do pravého okraja (w − 103 = 65 px). Dlhšie meno sa skracovalo výpustkou
    // („Dorastajúci mesiac" 68 px, de „Zunehmender Mond" 67, pl „Przybywający księżyc" 77 — 2026-10-04, test predpovede
    // rýb): posunie sa doľava o to, čo chýba, najviac po meno počasia + 4 px. Meno, ktoré sa zmestí, ostáva na mieste.
    var mn = HL.world.moonName(env.moon), mx = x + 84 - Math.max(0, Math.min(F_.measure(mn, { small: true }) - (w - 103), 60 - wn));
    HL.draw.sprite(ctx, HL.spr.get('moon_' + env.moon), mx, y + 5);
    F_.draw(ctx, mn, mx + 15, y + 8, P_.greyLight, { small: true, maxWidth: x + w - 4 - (mx + 15) });
    var ry = y + 22;
    if (!L.rows.length) {
      F_.draw(ctx, t('ui.prep.noForecast'), x + 5, ry, P_.greyLight, { maxWidth: w - 10 });
      ry += 12;
    } else {
      for (var i = 0; i < L.rows.length; i++) {
        drawForecastRow(ctx, x + 5, ry, w - 10, L.rows[i], f.segments, env, f.moon ? f.moon[L.rows[i].k] : null);
        ry += 15;
      }
      if (f.intro) { F_.draw(ctx, t('ui.prep.introSun'), x + 5, ry, P_.amber, { maxWidth: w - 10 }); ry += 12; }
    }
    if (HL.world.currentEvent) {
      F_.draw(ctx, '★ ' + HL.world.eventName(HL.world.currentEvent), x + 5, ry, P_.yellow, { small: true, maxWidth: w - 10 });
    }
  }

  // ------------------------------------------------------------------ predpoveď rýb
  // Kedy blok začína: prvý = „teraz", dnes len hodiny, potom celé slová „zajtra 05:00", „pozajtra 05:00" a od 3. dňa
  // (Meteostanica 3 = 72 h) „deň 7, 05:00" — vlastné kľúče, nie 32-px skratky z riadkov počasia (en „+2 days",
  // de „in 2 T.", fr „ap.-dem."); revízia 2026-10-04.
  function fishWhen(b, i, env) {
    if (i === 0) return t('ui.prep.fishNow');
    var k = HL.world.day(b.from) - env.day, time = HL.world.clockLabel(b.from);
    if (k <= 0) return time;
    if (k === 1) return t('ui.prep.fishTomorrow', { time: time });
    if (k === 2) return t('ui.prep.fishDayAfter', { time: time });
    return t('ui.prep.fishDay', { n: HL.world.day(b.from) + 1, time: time });
  }
  // Hodnota, ktorú majú VŠETKY kúsky bloku (zlúčený blok môže mať kúsky s iným počasím či mesiacom), inak null.
  function sameInBlock(b, key) {
    var parts = b.parts && b.parts.length ? b.parts : [b], v = parts[0][key];
    for (var i = 1; i < parts.length; i++) if (parts[i][key] !== v) return null;
    return v;
  }
  // Hlavička bloku: čas vľavo; vpravo drobným „obdobie · počasie" (počasie len keď je v celom bloku rovnaké — inak by
  // meno aj ikona platili len pre prvý kúsok), sprite mesiaca vpravo hore pri nove/splne v celom bloku (za jasnej noci
  // ho už ukazuje ikona počasia — dvakrát nie). Čo sa do riadku nezmestí, ide drobným na druhý riadok (h = 22).
  function fishHeadOf(b, i, env) {
    var F_ = F(), w = sameInBlock(b, 'weather'), mo = sameInBlock(b, 'moon');
    var icon = w != null ? HL.world.weatherIcon(w, b.from) : null;
    var moon = (mo === 0 || mo === 4) && icon !== 'moon_' + mo ? 'moon_' + mo : null;
    var when = fishWhen(b, i, env);
    var cond = w != null ? t('ui.prep.fishCond', { period: HL.world.periodName(b.period), weather: HL.world.weatherName(w, b.from) })
      : HL.world.periodName(b.period);
    var ww = F_.measure(when), cw = F_.measure(cond, { small: true });
    var two = ww + 6 + (moon ? MOON_W : 0) + cw > FISH_R - FISH_X;
    return { when: when, ww: ww, icon: icon, moon: moon, cond: cond, two: two, h: two ? FISH_HEAD2 : FISH_HEAD };
  }
  // Meno druhu: nechytený „?" (meno s časom by prezradilo podmienky, ktoré encyklopédia skrýva), legenda s hviezdou.
  function fishLabel(f) {
    var sp = species(f.id), name = f.known && sp ? sp.name : '?';
    return f.legend ? '★ ' + name : name;
  }
  // Sivá = hlbšie, než siahne vlasec (má prednosť), žltá = legenda, biela = známy druh, svetlosivá = „?".
  function fishColor(f) {
    var P_ = P();
    return !f.reachable ? P_.grey : f.legend ? P_.yellow : f.known ? P_.white : P_.greyLight;
  }
  // „80–190 m" ako encyklopédia (prvé číslo bez jednotky, formát čísla jazyka).
  function fishDepth(f) { return t('ui.encyclopedia.depthRange', { from: HL.util.num(Math.round(f.depth[0])), to: HL.util.meters(f.depth[1]) }); }

  function drawFishBlock(ctx, L, i) {
    var P_ = P(), F_ = F(), b = L.fishBlocks[i], y = L.fishY[i], hd = L.fishHeads[i];
    if (hd.icon) HL.draw.sprite(ctx, HL.spr.get(hd.icon), M + 1, y);
    F_.draw(ctx, hd.when, FISH_X, y + 1, i === 0 ? P_.yellow : P_.white, { maxWidth: FISH_R - FISH_X });
    if (hd.moon) HL.draw.sprite(ctx, HL.spr.get(hd.moon), FISH_R - 12, y);
    // obdobie (a počasie) na ZAČIATKU bloku — zlúčený blok môže trvať dlhšie, ryby sú v ňom tie isté
    var cr = hd.two ? FISH_R : FISH_R - (hd.moon ? MOON_W : 0);
    F_.draw(ctx, hd.cond, cr, hd.two ? y + 12 : y + 3, P_.greyLight, { small: true, align: 'right', maxWidth: hd.two ? FISH_R - FISH_X : cr - FISH_X - hd.ww - 6 });
    var ry = y + hd.h;
    if (!b.fish.length) { F_.draw(ctx, t('ui.prep.fishNone'), FISH_X, ry, P_.grey, { maxWidth: FISH_R - FISH_X }); return; }
    for (var k = 0; k < b.fish.length; k++, ry += FISH_ROW) {
      var f = b.fish[k], dl = fishDepth(f), dw = F_.measure(dl, { small: true });
      F_.draw(ctx, fishLabel(f), FISH_X, ry, fishColor(f), { maxWidth: FISH_R - FISH_X - dw - 4 });
      F_.draw(ctx, dl, FISH_R, ry + 2, f.reachable ? P_.greyLight : P_.grey, { small: true, align: 'right' });
    }
  }

  // Riadok zbaliť/rozbaliť: rám ako karta návnady (dá sa naň ťuknúť), text bežným písmom vľavo, šípka na konci. Pod myšou
  // svetlejší (ako karta); fokus klávesnice ukáže žltý rámik HL.w.hit — po kliknutí myšou fokus na riadku ostáva a
  // zvýraznenie podľa fokusu by vyzeralo ako zaseknuté „pod myšou".
  function fishToggleLabel(L) {
    return st.fishOpen ? t('ui.prep.fishHide') + ' ▴' : tp(L.fishChanges, 'ui.prep.fishShow') + ' ▸';
  }
  function drawFishToggle(ctx, L) {
    var P_ = P(), D = HL.draw, x = M, y = L.fishToggleY, w = W - 2 * M, h = FISH_TOGGLE_H;
    var st0 = HL.w.hit('fish_more', x, y, w, h);
    D.rect(ctx, x + 1, y, w - 2, h, P_.ink);
    D.rect(ctx, x, y + 1, w, h - 2, P_.ink);
    D.rect(ctx, x + 1, y + 1, w - 2, h - 2, st0.hover ? P_.slate : P_.slateDark);
    D.rect(ctx, x + 2, y + 2, w - 4, h - 4, P_.navy);
    F().draw(ctx, fishToggleLabel(L), x + 6, y + 3, st0.hover ? P_.white : P_.greyLight, { maxWidth: w - 11 });
  }
  function toggleFish() {
    var before = st.layout ? st.layout.fishToggleY : null;
    st.fishOpen = !st.fishOpen;
    st.layout = computeLayout();
    // Zbalenie: bloky NAD riadkom zmiznú — zoznam sa posunie o toľko, aby riadok ostal pod prstom (myš aj klávesnica).
    // Rozbalenie: posun ostáva (nové bloky sú hneď pod blokom TERAZ, riadok ide dole za ne).
    var after = st.layout.fishToggleY, sc = HL.w.scrollOf('prep_list');
    if (!st.fishOpen && before != null && after != null && sc) HL.w.setScroll('prep_list', sc.y - (before - after));
  }

  function drawCard(ctx, c, y) {
    var P_ = P(), F_ = F(), D = HL.draw;
    var x = M, w = W - 2 * M, sel = st.sel === c.id;
    var h = HL.w.hit('bait_' + c.id, x, y, w, CARD_H);
    // rám: vybraná = jantárová, pod myšou = svetlejšia
    D.rect(ctx, x + 1, y, w - 2, CARD_H, P_.ink);
    D.rect(ctx, x, y + 1, w, CARD_H - 2, P_.ink);
    D.rect(ctx, x + 1, y + 1, w - 2, CARD_H - 2, sel ? P_.amber : h.hover ? P_.slate : P_.slateDark);
    D.rect(ctx, x + 2, y + 2, w - 4, CARD_H - 4, sel ? P_.plum : P_.navy);
    // "zvolené" nesie aj TVAR (pásik vľavo), nie len farbu rámu
    if (sel) D.rect(ctx, x + 2, y + 2, 2, CARD_H - 4, P_.amber);
    var icon = HL.spr.get('bait_' + c.id);
    HL.draw.sprite(ctx, icon, x + 7, y + Math.floor((CARD_H - icon.height) / 2));
    var carry = isFinite(c.carry) ? tp(c.carry, 'ui.prep.carry') : t('ui.prep.unlimited');
    var cw = F_.measure(carry, { small: true });
    F_.draw(ctx, c.name, x + 23, y + 3, sel ? P_.yellow : P_.white, { maxWidth: w - 23 - cw - 8 });
    F_.draw(ctx, carry, x + w - 5, y + 5, sel ? P_.sandLight : P_.greyLight, { small: true, align: 'right' });
    // čo priláka: text + rybky vpravo (známe farebne, neznáme ako tieň)
    var ids = c.ideal.slice(0, 4), imgs = [], tw = 0;
    for (var i = 0; i < ids.length; i++) {
      var img = known(ids[i]) ? HL.ui.fishThumb(ids[i], 16, 9) : silThumb(ids[i], 16, 9, 'slate');
      imgs.push(img); tw += img.width + 2;
    }
    // Text má prednosť pred rybkami: radšej o rybku menej než useknutý popis.
    while (imgs.length > 1 && F_.measure(c.desc, { small: true }) > w - 23 - tw - 6) tw -= imgs.pop().width + 2;
    F_.draw(ctx, c.desc, x + 23, y + 17, P_.greyLight, { small: true, maxWidth: w - 23 - tw - 6 });
    var tx = x + w - 4;
    for (var j = imgs.length - 1; j >= 0; j--) {
      tx -= imgs[j].width;
      HL.draw.sprite(ctx, imgs[j], tx, y + 24 - imgs[j].height);
      tx -= 2;
    }
  }

  function gearRow(ctx, y, iconName, name, stat, statCol) {
    var P_ = P(), F_ = F();
    var ic = iconName ? HL.spr.get(iconName) : null;
    if (ic && ic.width > 14) {
      // Široký sprite (harpúna 22 px) by prekryl text: ukáže sa len hrot, 1:1, bez zmenšenia.
      ctx.drawImage(ic, ic.width - 12, 0, 12, ic.height, M + 2, y + Math.floor((12 - ic.height) / 2), 12, ic.height);
    } else if (ic) HL.draw.sprite(ctx, ic, M + 2 + Math.floor((12 - ic.width) / 2), y + Math.floor((12 - ic.height) / 2));
    var sw = F_.measure(stat, { small: true });
    F_.draw(ctx, name, M + 18, y + 1, P_.white, { maxWidth: W - 2 * M - 22 - sw - 4 });
    F_.draw(ctx, stat, W - M - 2, y + 3, statCol || P_.greyLight, { small: true, align: 'right' });
  }

  // Každý riadok výbavy je blok zoznamu: pri spodnej lište buď celý, alebo vôbec (cut, D2).
  function drawGear(ctx, L, cut) {
    var P_ = P(), F_ = F(), u = HL.util, g = L.g, y = L.gear;
    if (!cut.fits(y, y + 12)) return;
    gearRow(ctx, y, 'line_' + g.line.id, g.line.name, u.kg(g.line.strength) + ' · ' + (isFinite(g.maxDepth) ? u.meters(g.maxDepth) : t('ui.prep.noFloor')));
    y += ROW;
    if (g.limit !== 'line' && !cut.fits(y - 2, y + 9)) return;
    if (g.limit === 'lighthouse') {
      // hĺbka je v riadku vlasca hneď nad tým — veta bežným písmom sa tak zmestí bez skrátenia
      F_.draw(ctx, t('ui.prep.limitLighthouse'), M + 18, y - 2, P_.amber, { maxWidth: W - 2 * M - 20 });
      y += 12;
    } else if (g.limit === 'shipyard') {
      F_.draw(ctx, t('ui.prep.limitShipyard'), M + 18, y - 2, P_.amber, { maxWidth: W - 2 * M - 20 });
      y += 12;
    } else if (g.limit === 'floor') {
      F_.draw(ctx, t(lake() ? 'ui.prep.limitCore' : 'ui.prep.limitFloor'), M + 18, y - 2, P_.greyLight);
      y += 12;
    }
    if (!cut.fits(y, y + 12)) return;
    gearRow(ctx, y, 'rod_' + g.rod.id, g.rod.name, g.rod.toleranceMs ? t('ui.prep.rodTolerance', { ms: g.rod.toleranceMs }) : t('ui.prep.rodBasic'));
    y += ROW;
    if (!cut.fits(y, y + 12)) return;
    gearRow(ctx, y, 'hook_' + g.hook.id, g.hook.name, g.hook.decayMult < 1 ? t('ui.prep.hookEscape', { pct: u.pct(1 - g.hook.decayMult) }) : t('ui.prep.hookBasic'));
    y += ROW;
    if (!cut.fits(y, y + 12)) return;
    if (lake()) { drawStorage(ctx, y, g); return; } // v jazere nie sú žraloky — harpúny tam nemajú význam
    var harp = g.harpoons > 0 ? tp(g.harpoons, 'ui.prep.harpoonCount') : (HL.village.level(save(), 'dielna') >= 2 ? t('ui.prep.harpoonNone') : t('ui.prep.harpoonLocked'));
    gearRow(ctx, y, 'harpoon', t('ui.prep.harpoons'), harp, g.harpoons > 0 ? P_.greyLight : P_.grey);
    y += ROW;
    if (!cut.fits(y, y + 12)) return;
    drawStorage(ctx, y, g);
  }
  function drawStorage(ctx, y, g) {
    var P_ = P(), full = g.stored >= g.cap;
    gearRow(ctx, y, 'icon_fish', t('ui.prep.storage'), full ? t('ui.prep.storageFull') : tp(g.cap, 'ui.prep.storageCount', { stored: g.stored }), full ? P_.amber : P_.greyLight);
  }

  // Dosah vlasca na mape pásiem: pásma rovnako široké (lineárna mierka by Plytčinu
  // stlačila na 3 px), značka v rámci pásma úmerne. Za značkou je more zatemnené — hráč
  // vidí, ČO mu chýba, a pri Priepasti aj prečo (zámok = Maják 3).
  function drawReach(ctx, L) {
    var P_ = P(), F_ = F(), D = HL.draw, loc = HL.world.location(st.loc);
    var zones = loc.zones.filter(function (z) { return !z.endlessOnly; });
    var x = M, y = L.reachY, w = W - 2 * M, n = zones.length, maxD = L.g.maxDepth;
    D.rect(ctx, x - 1, y - 1, w + 2, 12, P_.ink);
    var markX = null;
    for (var i = 0; i < n; i++) {
      var z = zones[i], x0 = x + Math.round(i * w / n), x1 = x + Math.round((i + 1) * w / n);
      var segW = x1 - x0 - (i < n - 1 ? 1 : 0);
      var to = Math.min(z.to, loc.floor);
      var sea = P_.waterAt(st.loc, (z.from + to) / 2);
      var zc = sea.a === P_.ink ? P_.navy : sea.a, dark = darker(zc, 2);
      D.rect(ctx, x0, y, segW, 10, zc);
      // kam vlasec nesiahne = tá istá voda o 2 kroky rampy tmavšia (plná plocha, nie šachovnica)
      if (maxD <= z.from) D.rect(ctx, x0, y, segW, 10, dark);
      else if (maxD >= to) markX = x0 + segW - 1;
      else {
        var cut = x0 + Math.round((maxD - z.from) / (to - z.from) * segW);
        D.rect(ctx, cut, y, x0 + segW - cut, 10, dark);
        markX = cut;
      }
      if ((z.needLighthouse && HL.village.level(save(), 'majak') < z.needLighthouse) ||
        (z.needShipyard && HL.village.level(save(), 'lodenica') < z.needShipyard)) {
        var lock = HL.spr.get('icon_lock');
        HL.draw.sprite(ctx, lock, x0 + Math.floor((segW - lock.width) / 2), y - 1);
      }
      var reach = maxD > z.from;
      // Vizuálny kritik (2. kolo, D1): nedosiahnuté pásmo slate na navy malo 2,52:1 → sivá 4,93:1
      // (stále tmavšia než dosiahnuté greyLight, takže rozdiel "sem nesiahneš" ostáva).
      // dlhé meno pásma (jazero: „Chladiace jazero") sa do úseku nezmestí — krátke meno (Jazero/Hala/Šachta)
      var zn = z.short && F_.measure(z.name, { small: true }) > segW + 2 ? z.short : z.name;
      F_.draw(ctx, zn, x0 + Math.floor(segW / 2), y + 13, reach ? P_.greyLight : P_.grey, { small: true, align: 'center', maxWidth: segW + 2 });
    }
    if (markX == null) markX = x + w - 1;
    D.rect(ctx, markX, y - 3, 1, 14, P_.amber);
    D.rect(ctx, markX - 1, y - 3, 3, 1, P_.amber);
  }

  function drawHot(ctx, L, cut) {
    var P_ = P(), F_ = F(), y = L.hotY, hot = L.hot;
    if (!hot.length) {
      F_.draw(ctx, t('ui.prep.hotNone'), M + 2, y + 1, P_.greyLight);
      return;
    }
    for (var i = 0; i < hot.length; i++) {
      if (!cut.fits(y - 1, y + 12)) return;
      var sp = species(hot[i].id);
      // ryba na papierovej dlaždici (tmavý obrys na navy nebolo vidno — ten istý jazyk ako Trhovisko)
      HL.ui.fishTile(ctx, hot[i].id, M, y - 1, 20, 13, { dark: !known(hot[i].id) });
      var mult = t('ui.prep.hotMult', { mult: HL.util.num(hot[i].mult) });
      var mw = F_.measure(mult, { small: true });
      F_.draw(ctx, sp ? sp.name : hot[i].id, M + 22, y + 1, P_.white, { maxWidth: W - 2 * M - 28 - mw });
      F_.draw(ctx, mult, W - M - 2, y + 3, P_.yellow, { small: true, align: 'right' });
      y += ROW;
    }
  }

  // ------------------------------------------------------------------ bočné panely (PC)
  function drawPanel(ctx, side, w, h) {
    var P_ = P(), F_ = F();
    HL.draw.panel(ctx, 2, 2, w - 4, h - 4, 'dark');
    var L = st.layout || computeLayout();
    if (side === 'L') {
      F_.draw(ctx, t('ui.prep.panel.weather'), 8, 8, P_.amber);
      var f = L.f, env = L.env;
      if (!f.hours) {
        F_.drawWrapped(ctx, t('ui.prep.panel.weatherHint'), 8, 24, w - 16, P_.white, {});
        return;
      }
      var y = 24, segs = f.segments;
      for (var i = 0; i < segs.length && y < h - 30; i++) {
        var from = Math.max(segs[i].from, env.m);
        HL.draw.sprite(ctx, HL.spr.get(HL.world.weatherIcon(segs[i].weather, segs[i].from)), 8, y);
        var when = i === 0 ? t('ui.prep.panel.now')
          : HL.world.day(from) !== env.day ? t('ui.prep.panel.dayTime', { day: HL.world.dayLabel(from), time: HL.world.clockLabel(from) })
            : HL.world.clockLabel(from);
        F_.draw(ctx, when, 24, y, P_.white, { small: true, maxWidth: w - 30 });
        F_.draw(ctx, HL.world.weatherName(segs[i].weather, segs[i].from), 24, y + 8, P_.greyLight, { small: true, maxWidth: w - 30 });
        y += 20;
      }
      if (f.intro) F_.drawWrapped(ctx, t('ui.prep.introSun'), 8, h - 34, w - 16, P_.greyLight, {});
    } else {
      // vety bežným písmom, pozície za sebou (dĺžka textu určuje, kde začne ďalší)
      F_.draw(ctx, t('ui.prep.bait'), 8, 8, P_.amber);
      var b = baitData(st.sel), ry = 24;
      if (b) {
        HL.draw.sprite(ctx, HL.spr.get('bait_' + b.id), 8, ry);
        ry += Math.max(14, F_.drawWrapped(ctx, b.name, 24, ry + 2, w - 32, P_.white, {}) + 4);
        ry += F_.drawWrapped(ctx, baitDesc(b) + '.', 8, ry, w - 16, P_.greyLight, {}) + 8;
      }
      var g = L.g;
      ry = Math.max(ry, 74);
      F_.draw(ctx, t('ui.prep.panel.reach'), 8, ry, P_.amber);
      F_.draw(ctx, isFinite(g.maxDepth) ? HL.util.meters(g.maxDepth) : t('ui.prep.noFloor'), 8, ry + 14, P_.white);
      var zones = HL.world.location(st.loc).zones.filter(function (z) { return !z.endlessOnly && z.from < g.maxDepth; }).map(function (z) { return z.name; });
      ry += 28 + F_.drawWrapped(ctx, zones.join(', '), 8, ry + 28, w - 16, P_.greyLight, { small: true }) + 8;
      F_.drawWrapped(ctx, nb(t('ui.prep.panel.depthRule')), 8, ry, w - 16, P_.greyLight, {});
      F_.draw(ctx, t('ui.prep.panel.keyDive'), 8, h - 30, P_.greyLight, { small: true });
      F_.draw(ctx, t(st.back === 'elektraren' ? 'ui.prep.panel.keyBackPlant' : 'ui.prep.panel.keyBack'), 8, h - 20, P_.greyLight, { small: true });
    }
  }

  // ------------------------------------------------------------------ scéna
  HL.scenes.def('prep', {
    enter: function (p) {
      p = p || {};
      HL.w.nav = true;
      st.t = 0;
      // z adresy (?scene=prep&loc=jadro, harness): jazero len keď sa naň dá ísť (scenár dá výbavu)
      var Q = HL.query || {}, want = p.location || (Q.scene === 'prep' ? Q.loc : null);
      st.loc = HL.world.isLake(want) && HL.village.lakeAccess(save()).ok ? want : 'more';
      st.back = p.back || (lake() ? 'elektraren' : 'village');
      var s = save();
      // Bonusový ponor (majiteľ 2026-10-04): posledná voľba hráča (ako návnada) v save.tutorial.haul — PRED kartami,
      // tie ukazujú nesenú návnadu podľa režimu (HL.game.baitCarry).
      st.haul = !!(s.tutorial && s.tutorial.haul);
      st.cards = buildCards();
      var want = p.bait || (s.tutorial && s.tutorial.lastBait) || 'worm';
      st.sel = hasCard(want) ? want : 'worm';
      st.fishOpen = false; // predpoveď rýb vždy začne zbalená (stav je len v scéne)
      st.layout = computeLayout();
      // Fokus začína na hlavnom tlačidle: Enter hneď ponorí, šípka hore ide na návnady.
      HL.w.setFocus('dive');
      st.lastFocus = 'dive';
      if (HL.music) HL.music.set('village');
      if (HL.audio) HL.audio.ambience('village');
    },
    exit: function () { HL.w.nav = false; },

    update: function (dt) {
      st.t += dt;
      var I = HL.input;
      var enter = I.pressed('Enter') || I.pressed('NumpadEnter');
      var foc = HL.w.focused();
      // Enter pri fokuse na šípke späť = späť; inak Enter = ponor (skratka tlačidla).
      if (HL.ui.backPressed() && (!enter || foc === 'back')) { HL.go(st.back); return; }
      for (var i = 0; i < st.cards.length; i++) {
        if (HL.w.clicked('bait_' + st.cards[i].id)) choose(st.cards[i].id);
      }
      // Klávesnica: presun fokusu na kartu = výber (rádiové tlačidlá).
      if (foc !== st.lastFocus) {
        st.lastFocus = foc;
        if (I.usingKeyboard && foc && foc.indexOf('bait_') === 0) choose(foc.slice(5));
      }
      var hauled = HL.w.clicked('haul');
      if (hauled) {
        st.haul = !st.haul;
        st.cards = buildCards(); // nesená návnada sa mení s režimom (G.baitCarry)
        var sh = save();
        sh.tutorial.haul = st.haul;
        HL.game.persist();
        // Pri zapnutí pravidlo slovami: odmena aj cena (útek ryby vezme všetko na udici).
        if (st.haul) {
          var from = Math.round(HL.T.haulBonusFrom), hb = HL.game.haulBonus(from);
          HL.ui.toast(t('ui.prep.haulToast', { from: from, pct: HL.util.pct(hb.pct) }), 'info', 5);
        }
        // Myš/dotyk: fokus späť na PONORIŤ SA — ďalší Enter (bočný panel: „Enter ponoriť sa") ponorí a voľbu nevráti.
        if (!I.usingKeyboard) HL.w.setFocus('dive');
      }
      // Predpoveď rýb zbaliť/rozbaliť (po kliknutí myšou fokus späť na PONORIŤ SA, ako pri prepínači bonusu).
      var toggled = HL.w.clicked('fish_more');
      if (toggled) { toggleFish(); if (!I.usingKeyboard) HL.w.setFocus('dive'); }
      // Enter pri fokuse na PREPÍNAČI (bonus, predpoveď) platí preň: navKeys ho aktivuje spolu so skratkou Enter tlačidla
      // PONORIŤ SA — hráč, ktorý prepína, sa nesmie ponoriť (revízia 2026-10-04: Enter na BONUS zapol bonus a ponoril).
      if (HL.w.clicked('dive') && !((toggled || hauled) && enter)) {
        var s = save();
        s.tutorial.lastBait = st.sel;
        HL.game.persist();
        HL.go('dive', { mode: 'career', bait: st.sel, location: st.loc, haul: st.haul });
      }
    },

    draw: function (ctx) {
      var P_ = P(), D = HL.draw;
      D.rect(ctx, 0, 0, W, 320, P_.navy); // plná plocha, nie šachovnica (vizuálny kritik)
      var L = st.layout = computeLayout();
      var sy = HL.w.beginScroll(ctx, 'prep_list', 0, LIST_Y, W, LIST_H, L.contentH);
      // Zoznam končí celým blokom (vizuálny kritik, 2. kolo, D2); nadpis sekcie ide s prvým riadkom.
      var cut = HL.ui.listCut(LIST_Y, LIST_H, sy);
      if (cut.fits(L.cond, L.cond + L.condH)) drawConditions(ctx, L);
      // predpoveď rýb: nadpis s prvým blokom, každý blok celý alebo vôbec (bez blokov by fits(…, NaN) skryl celý zvyšok zoznamu)
      if (L.fishBlocks.length && cut.fits(L.fishHead, L.fishY[0] + L.fishH[0])) HL.ui.section(ctx, M, L.fishHead, W - 2 * M, t('ui.prep.fish'));
      for (var fi = 0; fi < L.fishBlocks.length; fi++) {
        if (cut.fits(L.fishY[fi], L.fishY[fi] + L.fishH[fi])) drawFishBlock(ctx, L, fi);
      }
      // Riadok zbaliť/rozbaliť. Pod výrezom ako karta: cut.ghost — šípkou sa naň dá dostať a drží fokus, keď riadok po
      // rozbalení Enterom odíde dole (bez neho fokus preskočil na iný prvok zoznamu a Medzerník predpoveď nezbalil).
      if (L.fishToggleY != null) {
        if (cut.fits(L.fishToggleY, L.fishToggleY + FISH_TOGGLE_H)) drawFishToggle(ctx, L);
        else cut.ghost('fish_more', M, L.fishToggleY, W - 2 * M, FISH_TOGGLE_H);
      }
      if (cut.fits(L.baitHead, L.cards + CARD_H)) HL.ui.section(ctx, M, L.baitHead, W - 2 * M, t('ui.prep.bait'));
      for (var i = 0; i < st.cards.length; i++) {
        var cy = L.cards + i * (CARD_H + CARD_GAP);
        if (cut.fits(cy, cy + CARD_H)) drawCard(ctx, st.cards[i], cy);
        else cut.ghost('bait_' + st.cards[i].id, M, cy, W - 2 * M, CARD_H); // šípkou sa dá doň dostať
      }
      if (cut.fits(L.gearHead, L.gear + 12)) HL.ui.section(ctx, M, L.gearHead, W - 2 * M, t('ui.prep.gear'));
      drawGear(ctx, L, cut);
      if (cut.fits(L.reachHead, L.reachY + 21)) {
        HL.ui.section(ctx, M, L.reachHead, W - 2 * M, t('ui.prep.reach'));
        drawReach(ctx, L);
      }
      if (!lake() && cut.fits(L.hotHead, L.hotY + 12)) {
        HL.ui.section(ctx, M, L.hotHead, W - 2 * M, t('ui.prep.hot'));
        drawHot(ctx, L, cut);
      }
      HL.w.endScroll(ctx);
      HL.ui.moreBelow(ctx, cut, 0, W);
      st.hidden = cut.hidden;
      // spodná lišta: vždy na tom istom mieste, pod palcom
      D.rect(ctx, 0, BAR_Y, W, 320 - BAR_Y, P_.ink);
      D.rect(ctx, 0, BAR_Y, W, 1, P_.slateDark);
      // Bonusový ponor: prepínač vedľa PONORIŤ SA (zapnutý = červený, riziko) s malým vypínačom pod nápisom.
      HL.w.button(ctx, 'dive', M, BAR_Y + 5, W - 2 * M - HAUL_W - 4, 28, t('ui.prep.dive'), { style: 'primary', hotkey: 'Enter' });
      var hs = HL.w.button(ctx, 'haul', W - M - HAUL_W, BAR_Y + 5, HAUL_W, 28, t('ui.prep.haul'), { style: st.haul ? 'danger' : 'normal', small: true });
      haulSwitch(ctx, W - M - HAUL_W, BAR_Y + 5 + (hs && hs.down ? 1 : 0), st.haul);
      HL.ui.header(ctx, lake() ? HL.world.locationName(st.loc) : t('ui.prep.title'), { sub: HL.world.dayLabel(L.env.m) + ' · ' + HL.world.clockLabel(L.env.m) + ' · ' + HL.world.periodName(L.env.period) });
    },

    drawPanel: drawPanel,

    probe: function () {
      var L = st.layout || computeLayout();
      var g = L.g, sc = HL.w.scrollOf('prep_list');
      var card = st.cards.filter(function (x) { return x.id === st.sel; })[0];
      return {
        location: st.loc, back: st.back,
        baits: st.cards.map(function (c) { return c.id; }),
        selected: st.sel, haul: !!st.haul,
        carry: card ? (isFinite(card.carry) ? card.carry : -1) : 0,
        lineStrength: g.line.strength,
        maxDepth: isFinite(g.maxDepth) ? g.maxDepth : -1,
        depthLimit: g.limit,
        harpoons: g.harpoons,
        stored: g.stored, storageCap: g.cap,
        forecastHours: L.f.hours,
        forecastSegments: (L.f.segments || []).length,
        moonForecast: L.f.moon ? L.f.moon.length : 0,
        weather: L.env.weather, period: L.env.period, moon: L.env.moon,
        hot: L.hot.map(function (h) { return h.id; }),
        // predpoveď rýb: rozbalená?, brána legiend (Krčma 3), bloky v predpovedi / ukázané (druhy v každom, mesiac
        // v hlavičke, hlavičky na 2 riadky), počet zmien v riadku zbaliť/rozbaliť a jeho y (null = riadok nie je);
        // y v súradniciach zoznamu (pri posune 0 = obrazovka; ohyb zoznamu = 284)
        fishOpen: !!st.fishOpen, fishClues: !!L.ff.clues, fishTotal: L.ff.blocks.length, fishChanges: L.fishChanges,
        fishBlocks: L.fishBlocks.length,
        fishIds: L.fishBlocks.map(function (b) { return b.fish.map(function (f) { return f.id; }); }),
        fishMoons: L.fishHeads.map(function (h) { return h.moon; }),
        fishTwoLine: L.fishHeads.filter(function (h) { return h.two; }).length,
        fishYs: L.fishY.slice(), fishHeadH: L.fishHeads.map(function (h) { return h.h; }),
        fishToggleY: L.fishToggleY, fishTop: L.fishHead, fishEnd: L.fishEnd, baitHead: L.baitHead, cardsTop: L.cards,
        contentH: L.contentH, scrollMax: sc ? sc.max : 0, hidden: st.hidden || 0,
        focus: HL.w.focused(),
      };
    },
  });
})(globalThis.HL);
