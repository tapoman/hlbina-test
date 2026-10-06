// Scéna PONOR — srdce hry (dizajn 3, 4, 5, 6, 9, 12.2, 14, 15.3, 15.4; ARCHITECTURE.md §4, §12, §16).
//
// Scéna NESIMULUJE. Každý krok zloží DiveInput z HL.input, zavolá HL.dive.update a na udalosti
// (d.events) odpovie zvukom, vibráciou, efektmi a nápismi. Kreslí iba to, čo je v stave ponoru —
// nič si "nedomýšľa", aby obraz a simulácia nikdy nehovorili o inom svete.
//
// Tok: enter → HL.game.startDive (JEDINÉ volajúce miesto v hre) → … → d.state 'over' →
//      HL.game.finishDive(d) PRESNE RAZ → krátka chvíľa na dojem → KARTA NA HLADINE (tá istá scéna):
//      PONORIŤ SA ZNOVA / podržanie S alebo prsta na vode → ďalší startDive v tej istej scéne,
//      PRÍSTAV → HL.go('village', { trip }) (dedina ukáže súhrn výletu).
//      Do výsledkov (HL.go('results', { summary, trip })) ide len odomknutie legendy (aj KONIEC hry —
//      výsledok má panel konca) a Nekonečná hlbina (výsledok → späť do Nekonečnej).
//      Majiteľ (2026-09-26): "háčik ide len dole je super, ale keď stlačíš HORE, nech to nedáva rovno
//      trh, dedina a zase" — hráč ostáva na mori, kým sám nepovie PRÍSTAV.
//
// Výlet = séria ponorov od vstupu do scény (z Prípravy) po PRÍSTAV: počet ponorov, rýb a hodnota
// (summary.value) — riadok na karte a oznámenie v Prístave.
//
// Harness (iba keď hra štartuje priamo v tejto scéne z adresy ?scene=dive, a iba pre PRVÝ ponor —
// ďalší ponor tej istej relácie z Prípravy je už obyčajná hra):
//   ?depth=N  ?demo=catch|heavy     HL.scenario.dive hneď po startDive; pri ?depth > 0 nasadí
//                                   T.divePopulate rýb do viditeľného pásu (prepopulate)
//   ?populate=0                     bez nasadenia (test, ktorý potrebuje prázdne more)
//   ?fight=<druh>                   ryba sa objaví pri háčiku a záber prejde SKUTOČNOU cestou simulácie
//   ?tier=trofejny|velky|bezny|maly  s ?fight: veľkosť toho kusu natvrdo (štítok TROFEJ! v paneli boja)
//   ?bait=<id>  ?mode=endless        návnada a režim
//   ?bot=1                          scéna sa hrá sama s ľudskými obmedzeniami (platí pre všetky ponory;
//                                   na karte na hladine robot nič nestláča — to je na hráčovi/teste)
//   ?surface=1 | ?surface=snap      fotka karty na hladine: hneď HORE (skutočný výstup simulácie),
//                                   resp. medúza pri háčiku (s ?demo=heavy = skutočné prasknutie)
//
// ROZHODNUTIA:
// - Myš ovláda háčik iba vtedy, keď je nad vodou a pohla sa za posledných T.diveMouseIdleSec
//   (alebo je tlačidlo dole). Inak by myš odložená bokom držala háčik na mieste a A/D by
//   "nefungovalo". Dotyk ovláda háčik len kým je prst na skle (dizajn 3).
// - Stlačenie, ktoré zjedlo tlačidlo UI (HORE, pauza, harpúna), nie je až do pustenia ani klesaním,
//   ani ťuknutím do rytmu — inak by podržané tlačidlo pauzy ponáralo háčik.
// - HUD (oblúk, hĺbkomer, lišty) sa kreslí BEZ trasenia obrazovky: trasie sa svet, nie prístroje.
//   Pri trasení by sa navyše rozišli nakreslené tlačidlá s ich klikateľnou plochou.
// - Farba vlasca pri napätí sa kreslí aj NAD tmou: v Polnoci by hráč inak nevidel, že vlasec
//   červenie (dizajn 19: žiadne prasknutie bez varovania). Ostatné sa v tme stratí, ako má.
// - Panel boja ukazuje iba AKTUÁLNU fázu (svetielka + palec). Nikdy f.next, timeline(f, true) ani
//   dĺžku fázy — pri falošnej pauze by prezradili, že je falošná (§16). Pás histórie rytmu je preč
//   (kritik kolo 2: tretí, nepomenovaný ukazovateľ). Zelená = "ťukaj teraz", nič iné v ponore.
// - Tma: nízka a stredná = farba vody posunutá po rampe palety (pásy, nie bodky); skutočná tma
//   (T.diveInkFrom) = plný atrament mimo dohľadu, dithering len na okraji svetiel (kritik D9).
// - Paralaxa sú hotové dlaždice (kreslia sa raz), stmavené kópie a kotúče svetla sú z cache; za
//   snímok ide iba pár desiatok drawImage/fillRect — telefón má 16 ms.
(function (HL) {
  var T = HL.T, U = HL.util;
  var P = HL.pal, D = HL.draw, F = HL.font;
  var PW = 180, H = 320;

  // Rozloženie HUD (logické px hernej plochy 180×320).
  var TOP_H = 18;                                   // horná lišta: pauza, pásmo, čas a počasie
  var BAR_Y = 286;                                  // spodná lišta: návnada, HORE, úlovok (dizajn 15.3)
  var UP_BTN = { x: 58, y: 289, w: 64, h: 29 };     // HORE — veľké, pre palec
  var HARP_BTN = { x: 112, y: 254, w: 66, h: 28 };
  var ARC = { x: 90, y: 30, r: 22, t: 5 };          // oblúk napätia (dizajn 4.2, 15.3)
  var GAUGE = { x: 3, y: 48, h: 196 };              // hĺbkomer vľavo
  // Návod: JEDEN pás nad spodnou lištou (v boji nad panelom boja). Hore zakrýval slnko, oblúk
  // napätia a stĺpec úlovku (kritik vzhľadu) — dole je pod háčikom voľná voda.
  var HINT = { x: 12, w: 156 };
  var FP = { x: 4, y: 202, w: 172, h: 80 };         // panel boja (dizajn 15.4), tesne nad spodnou lištou
  var BANNER_H = 30;
  var BOAT_X = 62;                                  // loď; špička prúta je nad štartom háčika
  // Farby pásiem: hĺbkomer (tmavnú s hĺbkou) a TEXT (musí byť čitateľný na atramente — purpurová
  // a slivková na ňom zanikli, na fotke Polnoci a Priepasti sa nedal prečítať názov pásma).
  var ZONE_COL = { plytcina: 'cyan', utesy: 'greenLight', sumrak: 'blue', polnoc: 'purple', priepast: 'redDark', nekonecna: 'magenta',
    chladiace: 'green', hala: 'rust', sachta: 'blue' };
  var ZONE_TEXT = { plytcina: 'cyan', utesy: 'greenLight', sumrak: 'blue', polnoc: 'pinkPurple', priepast: 'pink', nekonecna: 'magenta',
    chladiace: 'greenLight', hala: 'amber', sachta: 'cyan' };
  // Lovné miesto ponoru (docs/JAZERO.md): d.location — more alebo jadrové jazero.
  function isLake(d) { return !!d && HL.world.isLake(d.location); }

  var d_ = T.def;
  d_('Ponor UI', 'diveMouseIdleSec', 1.5, 0.2, 6, 0.1, 'Myš ovláda háčik ešte X s po poslednom pohybe');
  d_('Ponor UI', 'diveOutroSec', 1.1, 0, 3, 0.1, 'Po konci ponoru: chvíľa pred výsledkom (s)');
  d_('Ponor UI', 'diveBannerSec', 2.2, 0.5, 6, 0.1, 'Nápis pásma / legendy: trvanie (s)');
  d_('Ponor UI', 'diveHintSec', 5.5, 1, 15, 0.5, 'Nápoveda návodu: najdlhšie trvanie (s)');
  d_('Ponor UI', 'diveNightDark', 0.55, 0, 1, 0.05, 'Noc: o koľko je plytká voda tmavšia (podiel zvyšku)');
  // Búrka a Halloween NIE sú tma (viditeľnosť okolo svetla háčika), ale nálada vody: voda sa posunie
  // o celé stupne palety (HL.pal.darker). Predtým pridávali tmu a tá v plytčine nakreslila po celej
  // svetlej vode riedku mriežku atramentových bodiek (kritik D9) — šum, nie búrka.
  d_('Ponor UI', 'diveStormSeaSteps', 1, 0, 3, 1, 'Búrka: voda o X stupňov palety tmavšia');
  d_('Ponor UI', 'diveRainSeaSteps', 0, 0, 3, 1, 'Dážď a hmla: voda o X stupňov palety tmavšia');
  d_('Ponor UI', 'diveEventSeaSteps', 1, 0, 3, 1, 'Halloween: voda o X stupňov palety tmavšia');
  // Veľké tlačidlo pre palec je počas boja OVLÁDAČ BOJA (ťuk = ťuknutie do rytmu). Po boji sa znova
  // stáva HORE — ťuk, ktorý ešte patril do rytmu, by inak ukončil ponor. Preto chvíľu zamknuté.
  d_('Ponor UI', 'diveUpArmSec', 0.6, 0, 2, 0.05, 'Po boji: HORE je X s zamknuté (dobiehajúce ťuknutia do rytmu nevyplávajú)');
  // Dizajn 3: na dotyku "ťahanie = do strán, držanie = klesanie". Doslova (každý dotyk klesá) by hráč
  // na mobile nemohol smerovať bez klesania, kým myš a A/D smerujú zadarmo (review #13/#34) — a hĺbka
  // násobí napätie všetkého na vlasci. Výklad: prst, ktorý sa hýbe do strán, smeruje; stojaci klesá.
  d_('Ponor UI', 'touchSinkSlopPx', 40, 0, 300, 5, 'Dotyk: prst ťahaný do strán rýchlejšie ako X px/s háčik len smeruje (neklesá); 0 = každý dotyk klesá');
  d_('Ponor UI', 'touchSinkSmoothSec', 0.06, 0.02, 0.6, 0.01, 'Dotyk: vyhladenie rýchlosti prsta pre klesanie (s)');
  d_('Ponor UI', 'diveEdgeWarnPx', 48, 0, 160, 4, 'Nebezpečenstvo do X px za okrajom obrazovky: výstražná šípka na okraji');
  d_('Ponor UI', 'diveHangMax', 4, 1, 8, 1, 'Koľko rýb na vlasci kresliť visieť pod háčikom (ďalšie ako +N)');
  d_('Ponor UI', 'diveDangerPx', 70, 10, 200, 5, 'Výkričník nad rybou: bližšie ako X px od háčika');
  d_('Ponor UI', 'diveThrashPx', 9, 0, 30, 1, 'Boj: ako ďaleko ryba trhá od háčika (px)');
  d_('Ponor UI', 'diveTierGlintSec', 1.4, 0, 4, 0.1, 'Boj: odlesk štítku TROFEJ! prejde každých X s (0 = bez odlesku)');
  d_('Ponor UI', 'diveFogMaxM', 260, 20, 1500, 10, 'Hmla: pásy nad hladinou vidno, kým je háčik plytšie ako X m');
  d_('Podmorie', 'diveFogWater', 1, 0, 1, 1, 'Hmla: zakalená sivomodrá voda (1) alebo bežná modrá (0)');
  // Kritik kolo 2 (D9): prechody farieb sú PÁSY po rampe palety, nie riedke bodky Bayerovej mriežky —
  // tie na 1× vyzerali ako špina/sieťka cez celú vodu a oblohu. Bodky ostali len na okraji kužeľa svetla.
  d_('Ponor UI', 'diveBandPx', 6, 2, 16, 1, 'Prechod farieb (voda, obloha): výška bloku pruhov (px)');
  d_('Ponor UI', 'diveBandZonePx', 18, 0, 120, 2, 'Voda: výška pásma s pruhmi na prechode dvoch farieb (px); 0 = ostrá hrana');
  d_('Ponor UI', 'diveSkyZonePx', 36, 0, 122, 2, 'Obloha: výška pásma s pruhmi medzi hornou a dolnou farbou (px)');
  d_('Ponor UI', 'diveDarkWater', 1, 0, 1, 0.05, 'Tma hĺbky posúva farbu vody po rampe palety (podiel cesty k atramentu)');
  d_('Ponor UI', 'diveInkFrom', 0.8, 0.3, 1, 0.02, 'Od tejto tmy (0–1) skrýva tma ryby a nebezpečenstvá mimo dohľadu a svetiel');
  d_('Jazero', 'diveCoreGlow', 30, 0, 80, 1, 'Jazero: výška žiary jadra nad nádobou (px, 0 = bez)');
  // Jadro ako ZDROJ svetla (slepý kritik kolo 2: PJ2, J7 4,5 — doska, ktorá nič neosvetľuje). Ten istý mechanizmus ako
  // svetlo háčika: kotúč svetlejšej vody pred diaľkou a blízka stena (aj dno) v ňom o X stupňov svetlejšia. ODHAD.
  d_('Jazero', 'diveCoreLightR', 64, 0, 140, 2, 'Jazero: polomer svetla jadra (px, 0 = jadro nesvieti)');
  // Kolá kritika sa tu nezhodli (kolo 0: svetlá misa pod háčikom = chyba; kolo 3: misa = svetlo dopadá na dno,
  // svetlina 0,6 R vo vode = kupola, stena +2 stupne = biely klin ťahá oko) → predvolené podľa kola 3, ostatné ladí majiteľ.
  d_('Jazero', 'diveCoreLightWater', 0, 0, 1, 0.05, 'Jazero: svetlina vo vode okolo jadra ako podiel polomeru (0 = len steny a dno)');
  d_('Jazero', 'diveCoreLightCore', 0, 0, 1, 0.05, 'Jazero: vnútorný jasnejší kotúč vo vode ako podiel polomeru (0 = bez)');
  d_('Jazero', 'diveCoreLightLit', 1, 0, 3, 1, 'Jazero: o koľko stupňov svetlejšia je stena a dno vo svetle jadra');
  d_('Jazero', 'diveCoreLightFloorPx', 12, 0, 80, 2, 'Jazero: ako hlboko pod vrch dna (do rezu betónu) siaha svetlo jadra (px)');
  d_('Jazero', 'diveCoreLightBlue', 0, 0, 1, 1, 'Jazero: farba svetliny vo vode (0 = o stupeň svetlejšia voda jazera ako pri háčiku, 1 = modrá)');
  d_('Jazero', 'diveCoreLightFlicker', 0.05, 0, 0.3, 0.01, 'Jazero: chvenie polomeru svetla jadra (podiel)');
  d_('Podmorie', 'seaShow', 1, 0, 1, 1, 'Podmorie (skaly, rastliny, orientačné body): 1 = áno, 0 = len voda (porovnanie, sondy farby vody)');
  d_('Podmorie', 'diveDeepWater', 3, 1, 4, 1, 'Najtmavšia farba vody na rampe mora (3 = tmavomodrá navy, 4 = atrament ako steny)');
  d_('Ponor UI', 'diveSeeFarPx', 150, 40, 320, 5, 'Na prahu tmy: dohľad okolo háčika (px); s hĺbkou sa zúži na kužeľ svetla');
  d_('Ponor UI', 'diveConeEdgePx', 3, 0, 12, 1, 'Okraj kužeľa svetla a dohľadu: šírka ditheringu (px) — jediné miesto s bodkami');
  d_('Ponor UI', 'diveLampCore', 0.55, 0.2, 0.9, 0.05, 'Kužeľ svetla: podiel polomeru so svetlejším jadrom (o 2 stupne rampy)');
  d_('Ponor UI', 'diveLampFrom', 0.25, 0, 1, 0.05, 'Kužeľ svetla háčika je vidno od tejto tmy (0–1); cez deň nie');
  d_('Podmorie', 'diveLampDusk', 0.6, 0.2, 1, 0.05, 'Svetlo háčika v šere (pred tmou): podiel polomeru, bez jadra');
  d_('Podmorie', 'diveLampBright', 2, 1, 3, 1, 'Svetlo háčika v tme: najsvetlejšia farba (1 = modrá, 2 = tmavomodrá, 3 = navy)');
  d_('Ponor UI', 'diveSurfGlowM', 12, 0, 40, 1, 'Cez deň: pás svetla pod hladinou do hĺbky (m) — kolo 0: 16 m tyrkysovej splývalo s oblohou');
  d_('Podmorie', 'seaGlowCol', 1, 0, 2, 1, 'Pás svetla pod hladinou: farba (0 = tyrkysová, 1 = sivý opar, 2 = svetlosivá)');
  d_('Podmorie', 'seaSkyHaze', 1, 0, 1, 1, 'Obloha cez deň: obzor svetlosivý opar (1) alebo tyrkysový (0)');
  d_('Ponor UI', 'diveShaftW', 2, 0.5, 8, 0.5, 'Slnečné lúče: polovičná šírka pri hladine (px)');
  d_('Podmorie', 'seaShaftBot', 7, 0.5, 20, 0.5, 'Slnečné lúče: polovičná šírka na konci (px) — lúč sa do hĺbky rozširuje');
  d_('Podmorie', 'seaShaftLen', 140, 30, 260, 5, 'Slnečné lúče: dĺžka (px)');
  d_('Podmorie', 'seaShaftFade', 0.55, 0.05, 1, 0.05, 'Slnečné lúče: v akej časti dĺžky sú najširšie (potom sa zúžia do stratena)');
  d_('Podmorie', 'seaShaftCol', 1, 0, 2, 1, 'Slnečné lúče: farba (0 = tyrkysová, 1 = sivá — tlmený opar, 2 = svetlosivá)');
  d_('Podmorie', 'seaShaftN', 3, 0, 6, 1, 'Slnečné lúče: počet');
  d_('Ponor UI', 'diveLineEdgeM', 60, 0, 200, 5, 'Vlasec: tmavý lem 1 px cez svetlú vodu do hĺbky (m) — kritik D4');
  // Kritik D6 (Polnoc = prázdna čierna plocha): harness ?depth=N teleportuje háčik do prázdneho mora,
  // ryby by priplávali až od okraja. A tma dostane život, ktorý dizajn sľubuje (planktón, siluety v diaľke).
  d_('Ponor UI', 'divePopulate', 4, 0, 7, 1, 'Harness ?depth=N: rýb nasadených do viditeľného pásu na štarte (0 = nič, ?populate=0 tiež)');
  d_('Ponor UI', 'diveGlints', 28, 0, 80, 2, 'Tma: žiariacich čiastočiek planktónu na obrazovke');
  d_('Ponor UI', 'diveFarLife', 2, 0, 6, 1, 'Tma: vzdialených svietiacich siluet v zadnej paralaxe (na výšku obrazovky)');
  // Karta na hladine: vstup až po chvíli — ťuky, ktoré ešte patrili výstupu (HORE, netrpezlivé
  // ťukanie), ju nesmú odkliknúť. Podržanie S / prsta (myši) na vode = ďalší ponor; krátky ťuk nie.
  d_('Ponor UI', 'diveAgainArmSec', 0.4, 0, 2, 0.05, 'Karta na hladine: tlačidlá a podržanie platia až po X s');
  d_('Ponor UI', 'diveAgainHoldSec', 0.2, 0, 1.5, 0.05, 'Karta na hladine: podržanie S / prsta na vode X s = ponor znova');
  d_('Ponor UI', 'diveSurfWaterY', 96, 60, 140, 2, 'Karta na hladine: hladina X px od vrchu obrazovky');
  d_('Ponor UI', 'diveCardFish', 6, 3, 6, 1, 'Karta na hladine: najviac rýb ako obrázky (ďalšie ako +N)');
  d_('Ponor UI', 'botReactionSec', 0.16, 0.05, 0.5, 0.01, 'Robot (?bot=1): reakcia na zelenú (s)');
  d_('Ponor UI', 'botUpRatio', 0.7, 0.2, 1, 0.05, 'Robot: ide HORE pri napätí nad (podiel pevnosti)');
  d_('Ponor UI', 'botMaxSec', 40, 5, 300, 5, 'Robot: najdlhší ponor (s), potom HORE');

  var S = null;               // stav scény (vzniká v enter, nový pri každom ponore znova)
  var queryUsed = false;      // harness parametre z adresy platia len pre prvý ponor
  var trip = null;            // výlet: { dives, fish, value, snaps } od vstupu do scény po PRÍSTAV (kariéra)

  // ------------------------------------------------------------------ pomôcky
  function sfx(name, o) { if (S && S.silent) return; HL.ui.sfx(name, o); }
  // Vibrácia až po prvom geste hráča: prehliadač ju inak zablokuje a zapíše chybu do konzoly
  // (stáva sa pri ponore spustenom rovno z adresy, napr. ?fight=).
  function vib(p) {
    if (S && S.silent) return;
    try {
      var ua = typeof navigator !== 'undefined' && navigator.userActivation;
      if (ua && !ua.hasBeenActive) return;
      if (HL.audio && HL.audio.vibrate) HL.audio.vibrate(p);
    } catch (e) { /* vibrácia nesmie zhodiť hru */ }
  }
  function r2(v) { return Math.round(v * 100) / 100; }
  // Text pre hráča (docs/I18N.md): kľúče ui.dive.* v src/data/lang/<jazyk>/dive.js. Premennú t nezatieňovať.
  function t(k, p) { return HL.i18n.t(k, p); }
  function tp(n, k, p) { return HL.i18n.plural(n, k, p); }
  // "38,5" — ako U.kg, ale bez jednotky (desatinná čiarka/bodka jazyka, desatiny len pod 10 kg).
  function num(v) { v = Math.max(0, v); return U.num(v < 10 ? Math.round(v * 10) / 10 : Math.round(v)); }
  function mult(v) { return t('ui.dive.mult', { v: U.num(Math.round(v * 10) / 10, 1) }); }
  // "Slnečno" o polnoci je nezmysel: jasná noc má len mesiac.
  function clearNight(env) { return env.period === 'night' && env.weather === 'sun'; }
  function weatherLabel(env) { return HL.world.weatherName(env.weather, env.m); }
  function fishWord(n) { return tp(n, 'ui.dive.fishCount'); }
  function blink(hz) { return Math.floor(S.t * hz * 2) % 2 === 0; }

  var spIdx = null;
  function species(id) {
    if (!spIdx) spIdx = U.byId(HL.data.allFish.concat(HL.data.allLegends));
    return spIdx[id] || null;
  }
  var fsCache = {};
  function fishSize(id) { return fsCache[id] || (fsCache[id] = HL.spr.fishSize(id)); }

  // Cena kusu tou istou funkciou ako ponor (búrka cestou mení cenu); po skončení ponoru cez trh.
  function priceOf(item) {
    var cur = HL.game.current;
    try {
      if (cur && S && cur.state === S.d && cur.opts && cur.opts.priceFn) return cur.opts.priceFn(item);
      return HL.game.priceOf(item);
    } catch (e) { return 0; }
  }

  // Stály pseudonáhodný šum bez stavu (dekor, sneh) — dva snímky toho istého sveta vyzerajú rovnako.
  function h01(a, b) { return HL.hash(a | 0, b | 0, 4099) / 4294967296; }

  function camPx(d) { return Math.round(HL.dive.cameraTop(d) * T.pxPerM); }
  function sy(d, depth) { return depth * T.pxPerM - S.cam; }

  // Tma podľa pásma: lineárne medzi začiatkami pásiem (Plytčina 0 → Priepasť 1, data/world.js light).
  function zoneLight(depth, endless, loc) {
    var Z = HL.world.location(loc).zones, pts = [];
    for (var i = 0; i < Z.length; i++) if (!Z[i].endlessOnly || endless) pts.push(Z[i]);
    if (!(depth > 0)) return pts[0].light;
    for (var k = 0; k < pts.length - 1; k++) {
      if (depth < pts[k + 1].from) return U.lerp(pts[k].light, pts[k + 1].light, (depth - pts[k].from) / (pts[k + 1].from - pts[k].from));
    }
    return pts[pts.length - 1].light;
  }

  // Tma v danej hĺbke (0 = svetlo, 1 = tma). Voda sama tmavne s hĺbkou (HL.pal.seaAt); tma navyše
  // posúva farbu každého riadku vody po rampe k atramentu (seaQ) a od T.diveInkFrom skrýva všetko
  // mimo dohľadu (drawInk). Počasie a Halloween sem nepatria — tie posúvajú farbu vody (seaSteps).
  function darkAt(depth, env, endless, loc) {
    var lv = zoneLight(depth, endless, loc);
    // Noc stmaví hlavne plytkú vodu — hlbina je tmavá vždy (dizajn 14.1).
    if (env.period === 'night') lv += (1 - lv) * T.diveNightDark;
    else if (env.period === 'evening' || env.period === 'morning') lv += (1 - lv) * T.diveNightDark * 0.25;
    return U.clamp01((lv - 0.2) / 0.8);
  }
  // Blesk osvetlí hlbinu (dizajn 14.1): násobok tmy počas záblesku.
  function boltK() { return S.bolt > 0 ? ((Math.floor(S.bolt * 30) % 3 === 0) ? 0.55 : 0.2) : 1; }
  function darknessLevel(d) { return darkAt(d.hook.depth, d.env, d.mode === 'endless', d.location) * boltK(); }

  // ------------------------------------------------------------------ výber návnady (?scene=dive bez Prípravy)
  // "Najlepšia" = tá, ktorú by v pásme štartovej hĺbky brali najcennejšie ryby. Zlatá sa nevyberá sama:
  // je vzácna a patrí na legendy — o tej rozhoduje hráč v Príprave.
  function bestBait(depth, loc) {
    var save = HL.game.save, z = HL.world.zoneAt(Number(depth) || 0, false, loc), list = HL.world.location(loc).fish;
    var best = 'worm', bestScore = -1;
    HL.data.baits.forEach(function (b) {
      if (b.id === 'gold') return;
      if (!b.infinite && !((save.baits[b.id] || 0) > 0)) return;
      var s = 0;
      list.forEach(function (f) {
        if (f.event || f.zone !== z.id) return;
        var m = HL.dive.baitMatch(b.id, f);
        s += f.chance * f.price * (m === 'ideal' ? 1.5 : m === 'ok' ? 1 : 0.2);
      });
      if (s > bestScore) { bestScore = s; best = b.id; }
    });
    return best;
  }
  function usableBait(id) {
    var b = U.byId(HL.data.baits)[id];
    if (!b) return false;
    return b.infinite || (HL.game.save.baits[id] || 0) > 0;
  }

  // ------------------------------------------------------------------ podmorie
  // Krajina za vodou (vzdialené útesy, stredné skaly, blízke steny, rastliny) je v gfx/seascape.js (HL.sea):
  // každý kus skaly má stupeň tmy podľa dennej farby vody vo svojej hĺbke, noc a búrka posunú celý snímok (seaDk).
  var RAMP = ['cyan', 'blue', 'blueDark', 'navy', 'ink'];
  // Hmla: zakalená voda — tá istá poloha na rampe, ale sivomodré farby (nálada hmlistého jazera). Kolo 0
  // kreslilo hmlu ako mriežku bodiek cez vodu, steny aj ryby (P1); pásy z riadkov v3 pôsobili ako pokazená
  // obrazovka. Pod vodou teda nič neprekrýva ryby — mení sa farba vody; pásy hmly sú len nad hladinou.
  var FOG_RAMP = ['greyLight', 'grey', 'slate', 'navy', 'ink'];
  // Jadrové jazero: teplá zelená voda → tmavá tyrkysová šachta (HL.pal.lakeAt, gfx/seascape_lake.js qStops);
  // tie isté polohy 0–4 ako more (0 = odlesk pri hladine, 1 = voda pri hladine, 3 = najtmavšia voda nad atramentom).
  var LAKE_RAMP = ['greenLight', 'green', 'greenDark', 'tealDark', 'ink'];
  function rampOf(loc) { return HL.world.isLake(loc) ? LAKE_RAMP : RAMP; }
  function waterRamp(env, loc) { return env.weather === 'fog' && T.diveFogWater >= 1 ? FOG_RAMP : rampOf(loc); }
  // Stmavenie po rampe palety: HL.pal.darker (presné pre všetkých 32 farieb); pre staršiu paletu
  // bez neho vlastná rampa mora (farby vody sú vždy na nej).
  function darker(hex, steps) {
    if (!(steps > 0)) return hex;
    if (P.darker) return P.darker(hex, steps);
    for (var i = 0; i < RAMP.length; i++) if (P[RAMP[i]] === hex) return P[RAMP[Math.min(RAMP.length - 1, i + steps)]];
    return P.ink;
  }
  // O koľko stupňov palety je voda tmavšia pre náladu (búrka, dážď/hmla, Halloween) — nie tma.
  function seaSteps(env) {
    var k = 0;
    if (env.weather === 'storm') k += T.diveStormSeaSteps;
    else if (env.weather === 'rain' || env.weather === 'fog') k += T.diveRainSeaSteps;
    if (env.event === 'halloween') k += T.diveEventSeaSteps;
    return Math.max(0, Math.round(k));
  }
  // Slnečné lúče v Plytčine: PLNÝ šikmý klin, ktorý sa do hĺbky rozširuje a od T.seaShaftFade sa zúži do
  // stratena. Kolo 0: tvrdé 1–2 px tyrkysové čiary s jasom takmer ako vlasec (K7, K4); v3 rednutie v pruhoch
  // vyzeralo ako rebrík → teraz širší tlmený opar bez pruhov (farba = posuvník).
  var SHAFT_COL = ['cyan', 'grey', 'greyLight'];
  function shaftKey() { return [T.diveShaftW, T.seaShaftBot, T.seaShaftLen, T.seaShaftFade, T.seaShaftCol, T.diveBandPx].join(','); }
  function shaftTile() {
    var len = Math.max(10, Math.round(T.seaShaftLen)), w0 = T.diveShaftW, w1 = T.seaShaftBot, slant = 0.3, m = Math.max(w0, w1) + 2;
    var w = Math.ceil(len * slant + 2 * m), c = D.canvas(w, len);
    if (!c) return null;
    var x = c.getContext('2d'), fade0 = T.seaShaftFade * len;
    x.fillStyle = P[SHAFT_COL[Math.round(T.seaShaftCol)] || 'grey'];
    for (var y = 0; y < len; y++) {
      var hw = y < fade0 ? w0 + (w1 - w0) * (y / Math.max(1, fade0)) : w1 * (1 - (y - fade0) / Math.max(1, len - fade0)), mid = m + y * slant;
      var a = Math.round(mid - hw), b = Math.round(mid + hw);
      if (b > a) x.fillRect(a, y, b - a, 1);
    }
    return { c: c, w: w, h: len, key: shaftKey() };
  }
  var tiles = null;
  function ensureTiles() {
    if (tiles && tiles.shaft && tiles.shaft.key === shaftKey()) return tiles;
    tiles = { shaft: shaftTile() };
    return tiles;
  }

  // ------------------------------------------------------------------ rampa mora a pásy (kritik D9)
  // Poloha na rampe mora: 0 tyrkys, 1 modrá, 2 tmavomodrá, 3 navy, 4 atrament. Farba riadku vody =
  // rampa[poloha] + tma hĺbky (podiel cesty k atramentu) + nálada počasia (celé stupne).
  var RIDX = {};
  function rampIdx(hex, loc) {
    var R = rampOf(loc), key = R === RAMP ? 'more' : 'jadro', ix = RIDX[key];
    if (!ix) { ix = RIDX[key] = {}; for (var i = 0; i < R.length; i++) ix[P[R[i]]] = i; }
    return ix[hex] != null ? ix[hex] : R.length - 1;
  }
  function seaPos(depth, loc) {
    var s = P.waterAt ? P.waterAt(loc, depth) : P.seaAt(depth), a = rampIdx(s.a, loc), b = rampIdx(s.b, loc);
    return a + (b - a) * s.t;
  }
  // Voda nikdy nie je tmavšia ako T.diveDeepWater (3 = navy): atrament patrí blízkym siluetám a tme mimo
  // svetla (drawInk). Kritik kolo 0: od Polnoci bola voda atrament ako steny → 89–95 % plochy jedna hodnota;
  // vzor má tmavú vodu o stupeň nad čiernou a čiernu nechá siluetám (dve až tri roviny hodnôt).
  // Farba vody (poloha na rampe): DENNÁ farba pásma (HL.sea.qDay — Súmrak tmavomodrý, Polnoc navy, Priepasť čierna;
  // kritik kolo 1, K6) + tma navyše oproti dňu (noc, večer; blesk ju zoberie) + nálada počasia. Nad Priepasťou
  // (T.seaInkFromM) nikdy tmavšia ako T.diveDeepWater.
  var DAY_ENV = { period: 'day', weather: 'sun' };
  function qDayOf(depth, loc) { return HL.sea ? HL.sea.qDay(depth, loc) : seaPos(depth, loc); }
  function seaQ(d, depth, shift, bk) {
    var top = RAMP.length - 1, endless = d.mode === 'endless', loc = d.location, base = qDayOf(depth, loc);
    var extra = Math.max(0, darkAt(depth, d.env, endless, loc) - darkAt(depth, DAY_ENV, endless, loc)) * bk * T.diveDarkWater;
    var cap = depth < T.seaInkFromM ? Math.max(1, Math.round(T.diveDeepWater)) : top;
    return Math.min(cap, top, base + extra * (top - base) + shift);
  }
  // O koľko stupňov je podmorie celého snímku tmavšie ako jeho denná farba (noc, búrka, Halloween) — meria sa
  // v hĺbke háčika, platí pre celý snímok (kusy skál majú vlastný stupeň podľa hĺbky, HL.sea kmap).
  function seaDk(d) {
    var dep = Math.max(0, d.hook.depth), endless = d.mode === 'endless';
    var cap = dep < T.seaInkFromM ? Math.max(1, Math.round(T.diveDeepWater)) : RAMP.length - 1;
    var qd = Math.min(cap, qDayOf(dep, d.location)), qe = seaQ(d, dep, seaSteps(d.env), boltK());
    return Math.max(0, Math.round(qe) - Math.round(qd));
  }
  // Pruhový prechod (16-bitová obloha): v bloku T.diveBandPx riadkov je spodných round(g × blok)
  // riadkov farby B. wy = riadok vo SVETE (alebo v oblohe) — pásy pri posune kamery stoja.
  function bandOn(wy, g) {
    if (!(g > 0)) return false;
    if (g >= 1) return true;
    var P0 = Math.max(2, Math.round(T.diveBandPx)), k = Math.round(g * P0);
    return (((Math.floor(wy) % P0) + P0) % P0) >= P0 - k;
  }
  // Zvislý prechod colA → colB: plocha A, pásmo pruhov výšky zone v strede, plocha B.
  function bandGradient(ctx, x, y, w, h, colA, colB, zone) {
    x = Math.round(x); y = Math.round(y);
    var runY = 0, runC = null;
    for (var r = 0; r <= h; r++) {
      var c = null;
      if (r < h) {
        var g = zone > 0 ? U.clamp01((r + 0.5 - (h - zone) / 2) / zone) : (r >= h / 2 ? 1 : 0);
        c = bandOn(r, g) ? colB : colA;
      }
      if (c !== runC) {
        if (runC) D.rect(ctx, x, y + runY, w, r - runY, runC);
        runY = r; runC = c;
      }
    }
  }

  // Morský sneh: pomaly klesajúce čiastočky, pevne vo svete — pri klesaní prúdia nahor (pocit pohybu).
  var SNOW = [];
  for (var si = 0; si < 46; si++) SNOW.push({ x: h01(si, 1) * PW, y: h01(si, 2) * 340, v: 2 + h01(si, 3) * 5, ph: h01(si, 4) * 6.28, c: si % 4 ? 'grey' : 'greyLight', glow: si % 3 === 0 });
  // Žiariaci planktón v tme (kritik D6): čiastočky rôznej veľkosti, ktoré pomaly driftujú a trblietajú
  // sa — krížik pri vrchole, bodka inak. Farby BEZ zelenej: zelená je v ponore len "ťukaj teraz" (D3).
  var GLINT = [], GLINT_COL = ['cyan', 'cyan', 'blue', 'pinkPurple', 'cyan', 'blue', 'white'];
  for (var gi = 0; gi < 80; gi++) {
    GLINT.push({ x: h01(gi, 61) * PW, y: h01(gi, 62) * 360, v: -1.5 + h01(gi, 63) * 4, ph: h01(gi, 64) * 6.28,
      w: 0.6 + h01(gi, 65) * 1.6, big: h01(gi, 66) < 0.3, c: GLINT_COL[gi % GLINT_COL.length] });
  }

  // ------------------------------------------------------------------ stav scény
  function newState(d, mode, direct, Q) {
    var fxSeed = HL.hash(HL.game.save.seed, 'divefx', HL.game.save.stats.dives);
    var st = {
      d: d, mode: mode, direct: direct, t: 0, cam: 0, surfY: 0, bg: null, lampMask: null, populated: 0,
      fx: HL.fx.create({ seed: fxSeed, w: PW, h: H }),
      paused: false, pauseAt: 0, prevVol: null,
      // prsty podľa pointerId: 'play' (dopadol do vody → klesanie/smer), 'ui' (zjedlo ho tlačidlo),
      // 'hud' (dopadol na lištu mimo tlačidla — ani klesanie, ani smer, review #12)
      fingers: {}, ctlId: null, ctlX: 0, fvx: 0, ptrMoveT: -99,
      lastFightT: -99,        // S.t posledného kroku v boji (poistka HORE po boji)
      silent: false,          // dobiehanie po skrytí karty: bez zvuku a vibrácií
      lay: null,              // rozloženie tohto snímku pre sondu (nápoveda, nápis, visiace ryby...)
      pickWidget: false,
      forceBite: 0,
      banners: [],
      hint: null, hintT: 0, hintQueue: [], hintX0: 90, tutorial: mode === 'career',
      snap: null, snapCause: null, surfT: -1, bolt: 0, boltX: 90,
      thr: { x: 0, y: 0 }, fightSide: 1, sharkBit: false, perkDepth: 0,
      prevDepth: d.hook.depth, ascV: 0,
      summary: null, outro: 0, left: false,
      vis: { fish: 0, danger: 0, risk: 0, dark: 0, edge: 0, octo: null, thumb: null, haul: null },
      hang: null,             // visiace ryby z posledného snímku (drawRig)
      drawMs: 0, stepMs: 0,
      bot: null,
      surf: null,             // karta na hladine po konci ponoru (openSurface), inak null
      autoSurface: null,      // harness ?surface=1|snap
      baitBefore: d.bait.count, // nesené návnady pred krokom (prasknutie ich zoberie — karta povie koľko)
    };
    return st;
  }

  // ------------------------------------------------------------------ vstup (§4 + §12)
  // Herná plocha pre klesanie a smer = voda MEDZI lištami. Stlačenie na hornej/spodnej lište mimo
  // tlačidla (ikona návnady, úlovok, meno pásma, tesne vedľa HORE) nie je klesanie ani ťah (review #12).
  function inWaterArea(x, y) { return x >= 0 && x < PW && y >= TOP_H && y < BAR_Y; }

  // Každý prst sa zaradí PRI DOPADE a patrí tam, kým sa nezdvihne. Predtým bol stav jeden pre všetky
  // prsty: druhý prst na tlačidle (harpúna) vypol klesanie palca, kým sa nezdvihli VŠETKY prsty
  // (review #31, časť ponoru). Smer a klesanie riadi NAJSTARŠÍ prst z vody (najmenšie n).
  function trackPointer() {
    var I = HL.input, p = I.pointer, ptrs = I.pointers;
    var inside = p.x >= 0 && p.x < PW && p.y >= 0 && p.y < H;
    if (p.pressed) {
      var id = p.lastId != null ? p.lastId : 1;
      S.fingers[id] = I.consumed ? 'ui' : inWaterArea(p.x, p.y) ? 'play' : 'hud';
    }
    if (ptrs) { for (var k in S.fingers) if (!ptrs[k]) delete S.fingers[k]; }
    else if (!p.down) S.fingers = {};       // starý vstup bez pointerId: jeden ukazovateľ
    if (p.moved && !p.touch) S.ptrMoveT = S.t;
    return inside;
  }
  // Prst, ktorý riadi háčik: { id, x, touch } alebo null.
  function controlFinger() {
    var I = HL.input, ptrs = I.pointers, best = null;
    if (!ptrs) {
      var p = I.pointer;
      return p.down && S.fingers[p.lastId != null ? p.lastId : 1] === 'play' ? { id: 1, x: p.x, touch: p.touch } : null;
    }
    for (var k in S.fingers) {
      var e = ptrs[k];
      if (S.fingers[k] === 'play' && e && (!best || e.n < best.n)) best = e;
    }
    return best ? { id: best.id, x: best.x, touch: best.touch } : null;
  }
  // Rýchlosť prsta do strán (px/s), vyhladená — jednotlivé kroky bez udalosti pohybu (dva kroky
  // v jednom snímku) by inak striedali "stojí" a "letí".
  function trackFingerSpeed(c, dt) {
    if (!c || c.id !== S.ctlId) { S.ctlId = c ? c.id : null; S.ctlX = c ? c.x : 0; S.fvx = 0; return; }
    var inst = dt > 0 ? Math.abs(c.x - S.ctlX) / dt : 0;
    S.fvx += (inst - S.fvx) * Math.min(1, dt / Math.max(1e-3, T.touchSinkSmoothSec));
    S.ctlX = c.x;
  }
  // Tlačidlo pre palec ukazuje HORE až po poistke po boji (T.diveUpArmSec).
  function upLocked(d) { return d.state !== 'dive' || S.t - S.lastFightT < T.diveUpArmSec; }

  function readInput(d, dt) {
    var I = HL.input, p = I.pointer;
    var inside = trackPointer();
    var inp = { moveX: 0, targetX: null, sink: false, tap: false, up: false, harpoon: false, perkPick: null };
    inp.moveX = (I.action('right') ? 1 : 0) - (I.action('left') ? 1 : 0);
    var c = controlFinger(), held = !!c;
    trackFingerSpeed(c, dt);
    if (!inp.moveX) {
      // Myš: nad vodou a pohla sa nedávno (alebo drží tlačidlo). Dotyk: iba kým je prst dole.
      if (held) inp.targetX = U.clamp(c.x, 0, PW);
      else if (!p.touch && inWaterArea(p.x, p.y) && S.t - S.ptrMoveT < T.diveMouseIdleSec) inp.targetX = U.clamp(p.x, 0, PW);
    }
    // Myš drží = klesá (dizajn 3, PC). Prst: klesá, iba kým sa do strán nehýbe rýchlejšie ako slop.
    var fingerSinks = held && (!c.touch || !(T.touchSinkSlopPx > 0) || S.fvx < T.touchSinkSlopPx);
    inp.sink = I.action('sink') || fingerSinks;
    // Boj: KAŽDÉ nové stlačenie v hernej ploche, ktoré nezjedlo tlačidlo (pauza, harpúna), je ťuknutie —
    // aj na veľkom tlačidle pre palec: to je počas boja ovládač boja, nie zamknuté HORE (review #11/#32).
    if (d.state === 'fight') inp.tap = I.actionPressed('tap') || (p.pressed && !I.consumed && inside);
    inp.up = I.actionPressed('up') || HL.w.clicked('up');
    inp.harpoon = I.actionPressed('harpoon') || HL.w.clicked('harpoon');
    S.pickWidget = false;
    for (var k = 0; k < 3; k++) {
      if (HL.w.clicked('perk' + k)) { inp.perkPick = k; S.pickWidget = true; }
      else if (inp.perkPick == null && (I.pressed('Digit' + (k + 1)) || I.pressed('Numpad' + (k + 1)))) inp.perkPick = k;
    }
    return inp;
  }

  // ------------------------------------------------------------------ robot (?bot=1)
  // Hrá s ľudskými obmedzeniami: na zelenú reaguje až po T.botReactionSec (falošný záblesk kratší než
  // reakcia teda netrafí — ako človek), potom ťuká v takte, HORE pri napätí nad T.botUpRatio.
  function makeBot(d) {
    var target = { worm: 30, shell: 110, squid: 320, glow: 800, gold: 120, mix: 560 }[d.bait.id] || 40;
    target = Math.max(target, d.hook.depth + 5);
    if (isFinite(d.line.maxDepth)) target = Math.min(target, d.line.maxDepth - 3);
    return { rng: new HL.RNG(HL.hash(HL.game.save.seed, 'bot', HL.game.save.stats.dives)), target: target,
      seenN: -1, tapAt: Infinity, t: 0, perkT: 0, maxFish: 3, sweep: 1, sweepT: 0 };
  }
  function botInput(d, inp, dt) {
    var B = S.bot, f = d.fight;
    inp.moveX = 0; inp.targetX = null; inp.sink = false; inp.tap = false;
    if (d.state === 'perk') {
      B.perkT += dt;
      if (B.perkT > 0.6) { inp.perkPick = B.rng.int(0, 2); B.perkT = 0; }
      return;
    }
    if (d.state === 'fight') {
      if (f.phase === 'slack') {
        if (B.seenN !== f.phaseN) { B.seenN = f.phaseN; B.tapAt = S.t + T.botReactionSec + B.rng.range(-0.03, 0.04); }
        if (S.t >= B.tapAt) { inp.tap = true; B.tapAt = S.t + (f.beatSec || T.tapBeatSec) + 0.02 + B.rng.range(0, 0.06); }
      } else { B.tapAt = Infinity; B.seenN = f.phaseN; }
      if (d.shark && d.shark.phase === 'warn' && d.harpoons > 0 && d.shark.t > 1) inp.harpoon = true;
      return;
    }
    if (d.state !== 'dive') return;
    B.t += dt;
    var shark = d.shark && d.shark.phase === 'warn';
    if (d.tension.ratio > T.botUpRatio || (shark && d.harpoons <= 0) || d.onLine.length >= B.maxFish || B.t > T.botMaxSec) { inp.up = true; return; }
    if (shark && d.harpoons > 0 && d.shark.t > 1) inp.harpoon = true;
    if (d.hook.depth < B.target) inp.sink = true;
    // trhanie strasie len PRICHYTENÚ chobotnicu (vo fáze 'warn' sa blíži a trhanie sa nepočíta)
    if ((d.octopus && d.octopus.attached) || d.shadowEel) { inp.moveX = Math.floor(S.t * 4) % 2 ? 1 : -1; return; }
    // k najbližšej rybe v dosahu zraku, inak pomalé prečesávanie
    var best = null, bd = 1e9;
    for (var i = 0; i < d.fish.length; i++) {
      var q = d.fish[i], dy = Math.abs(q.depth - d.hook.depth) * T.pxPerM;
      if (dy > 40) continue;
      var dd = Math.abs(q.x - d.hook.x) + dy;
      if (dd < bd) { bd = dd; best = q; }
    }
    if (best && Math.abs(best.x - d.hook.x) > 4) inp.moveX = best.x > d.hook.x ? 0.7 : -0.7;
    else if (!best) {
      B.sweepT += dt;
      if (B.sweepT > 2.5 || d.hook.x < 20 || d.hook.x > PW - 20) { B.sweepT = 0; B.sweep = d.hook.x < PW / 2 ? 1 : -1; }
      inp.moveX = 0.5 * B.sweep;
    }
  }

  // ------------------------------------------------------------------ udalosti → zvuk, efekty, nápisy (§16)
  function hookPos(d) { return { x: d.hook.x, y: sy(d, d.hook.depth) }; }
  // Hudba po boji/odchode legendy sa odvodí zo SVETA, nie z histórie udalostí: kým legenda pláva
  // na obrazovke, hrá jej téma (predtým ju koniec iného boja prepol na 'dive' a odchod legendy
  // ju nechal hrať navždy — review #15).
  function legendAround(d) {
    for (var i = 0; i < d.fish.length; i++) if (d.fish[i].legend) return true;
    return false;
  }
  function musicBack(d) {
    if (d && d.fight) return; // počas boja hrá hudba boja (legendy jej vlastná)
    HL.music.set(d && legendAround(d) ? 'legend' : S.mode === 'endless' ? 'endless' : 'dive');
  }
  function banner(title, sub, color) {
    S.banners.push({ title: title, sub: sub || '', color: color || P.cyan, t: 0 });
    if (S.banners.length > 3) S.banners.shift();
  }

  function handleEvents(d, ev) {
    var hp = hookPos(d), fx = S.fx;
    for (var i = 0; i < ev.length; i++) {
      var e = ev[i];
      switch (e.type) {
        case 'bite':
          sfx('bite'); vib(30);
          fx.emit('bubbles', hp.x, hp.y + 6, { n: 8 });
          S.fightSide = d.hook.x < PW / 2 ? 1 : -1; // ryba ťahá k voľnejšej strane
          S.thr.x = 0; S.thr.y = 0;
          break;
        case 'fightStart':
          HL.music.set(e.legend ? 'legend' : 'fight');
          queueHint('bite');
          break;
        case 'phase': sfx(e.kind === 'slack' ? 'phase_slack' : 'phase_pull'); break;
        case 'tapGood':
          sfx('tap_good'); vib(15);
          fx.emit('sparkGood', hp.x + S.thr.x, hp.y + S.thr.y);
          break;
        case 'tapBad': {
          sfx('tap_bad'); vib(15);
          fx.emit('sparkBad', hp.x + S.thr.x, hp.y + S.thr.y);
          fx.shake(2, 0.18);
          queueHint('red');
          // Ryba sa bráni (T.badTapProgress): viditeľná strata postupu pri rybe aj na lište.
          var lf = d.fight && d.fight.flash;
          if (lf && lf.kind === 'bad' && lf.loss > 0.001) {
            fx.text(hp.x + S.thr.x, hp.y + S.thr.y - 12, t('ui.dive.fx.fightsBack', { pct: U.pct(lf.loss) }), P.orange);
            S.lossAt = S.t; S.lossFrom = Math.min(1, d.fight.progress + lf.loss);
          }
          break;
        }
        case 'landed': {
          sfx('landed'); musicBack(d);
          var sp = species(e.id), item = { id: e.id, w: e.w };
          fx.emit('scales', hp.x, hp.y, { n: 12 });
          fx.text(hp.x, hp.y - 18, '+' + U.money(priceOf(item)), P.yellow);
          banner(e.legend ? t('ui.dive.banner.legendCaught') : t('ui.dive.banner.caught'), (sp ? sp.name : e.id) + ' · ' + U.kg(e.w), e.legend ? P.yellow : P.greenLight);
          queueHint('up'); queueHint('tension');
          // CrazyGames happytime („use sparingly"): chytená legenda vždy, trofejný kus najviac raz za ponor.
          if (HL.platform && (e.legend || (e.tier === 'trofejny' && !S.happyTrophy))) {
            if (!e.legend) S.happyTrophy = true;
            HL.platform.happytime();
          }
          break;
        }
        case 'escaped':
          sfx('escape'); musicBack(d);
          fx.text(hp.x, hp.y - 16, t('ui.dive.fx.escaped'), P.orange);
          break;
        case 'haulLost':
          // bonusový ponor: ryba ušla a vzala všetko na udici (sim/dive.js) — ako uzol, len prísnejšie
          vib([60, 30, 90]); fx.shake(4, 0.4);
          banner(t('ui.dive.banner.haulLost'), t('ui.dive.banner.haulLostSub', { fish: fishWord(e.lost) }), P.red);
          break;
        case 'bossPhase':
          sfx('legend');
          banner(t('ui.dive.banner.bossPhase', { phase: e.n + 1 }), d.fight ? t('ui.dive.banner.bossPhaseSub', { name: d.fight.species.name }) : '', P.yellow);
          fx.shake(2, 0.3);
          break;
        case 'legendAppear': {
          sfx('legend'); HL.music.set('legend');
          var L = species(e.id);
          banner(t('ui.dive.banner.legend'), L ? L.name : e.id, P.yellow);
          break;
        }
        case 'legendLeave': {
          musicBack(d);
          var LL = species(e.id);
          fx.text(90, TOP_H + 58, t('ui.dive.fx.legendLeft', { name: LL ? LL.name : t('ui.dive.fx.legendUnknown') }), P.greyLight);
          break;
        }
        case 'eelBite':
          S.snapCause = 'eel';
          break;
        case 'snap':
          // Ping hrá snapSilence sám — NEvolať aj 'snap' (§16).
          if (HL.audio && HL.audio.snapSilence) HL.audio.snapSilence(1.5);
          vib([80, 40, 120]);
          S.snap = { t: S.t, x: hp.x, y: hp.y, cause: S.snapCause || e.cause, lost: e.lost || 0, baitLost: S.baitBefore };
          fx.flash(P.white, 0.45);
          fx.emit('snapBurst', hp.x, hp.y - 20);
          fx.shake(5, 0.5);
          S.hint = null; S.hintQueue.length = 0; S.banners.length = 0;
          break;
        case 'knot':
          sfx('rock'); fx.shake(3, 0.3);
          banner(t('ui.dive.banner.knot'), t('ui.dive.banner.knotSub', { fish: fishWord(e.dropped) }), P.amber);
          break;
        case 'jelly': sfx('jelly'); fx.text(hp.x, hp.y - 14, t('ui.dive.fx.jelly'), P.pink); break;
        case 'rock':
          sfx('rock'); fx.shake(2, 0.2);
          // v jadrovom jazere je prekážka hrdzavý sud (docs/JAZERO.md), nie skala
          var rk = isLake(d) ? 'barrel' : 'rock';
          fx.text(hp.x, hp.y - 14, e.blocked ? t('ui.dive.fx.' + rk + 'Blocked') : t('ui.dive.fx.' + rk, { pct: U.pct(e.loss) }), e.blocked ? P.greyLight : P.orange);
          break;
        case 'yank': sfx('rock'); fx.shake(3, 0.25); break;
        case 'sharkWarn': sfx('shark_warn'); vib([40, 60, 40]); S.sharkBit = false; break;
        case 'sharkEat': {
          sfx('escape'); fx.shake(4, 0.35); S.sharkBit = true;
          var ss = species(e.id);
          fx.text(hp.x, hp.y - 20, t('ui.dive.fx.sharkAte', { name: ss ? ss.name : e.id }), P.red);
          break;
        }
        case 'harpoonHit': sfx('harpoon'); fx.text(hp.x, hp.y - 20, t('ui.dive.fx.harpoonHit'), P.greenLight); fx.shake(2, 0.2); break;
        // Chobotnica sa najprv blíži (sim: T.octopusWarnSec bez záťaže) — výstražný tón a chvenie,
        // nech hráč stihne HORE skôr, než sa chytí (dizajn 19: žiadne nefér prasknutie bez varovania).
        case 'octopusWarn': sfx('shark_warn', { pitch: 1.35, pan: e.x > PW / 2 ? 0.6 : -0.6 }); vib([30, 50, 30]); break;
        case 'octopusGrab': sfx('octopus'); fx.emit('ink', hp.x, hp.y - 8, { n: 8 }); break;
        case 'octopusShake': fx.emit('ink', hp.x, hp.y - 8, { n: 2 }); break;
        case 'octopusOff': sfx('octopus_off'); fx.emit('ink', hp.x, hp.y - 8, { n: 14 }); break;
        case 'eelWarn': sfx('eel'); break;
        case 'lightning':
          sfx('thunder');
          S.bolt = e.strong ? 0.5 : 0.35;
          S.boltX = 30 + h01(Math.floor(S.t * 10), 9) * 120;
          fx.flash(P.white, e.strong ? 0.3 : 0.18);
          break;
        case 'ascend':
          sfx('ascend');
          // Pri výstupe už návod ani nápis pásma nemá čo hovoriť — nech nezakrývajú úlovok.
          S.hint = null; S.hintQueue.length = 0; S.banners.length = 0;
          break;
        case 'surfaced': {
          sfx('surface'); sfx('splash');
          S.surfT = S.t;
          fx.emit('splash', hp.x, hp.y);
          var nOn = d.onLine.length;
          S.banners.length = 0;
          banner(nOn ? t('ui.dive.banner.safe') : t('ui.dive.banner.up'),
            nOn ? t('ui.dive.banner.safeSub', { money: U.money(HL.dive.value(d)), fish: fishWord(nOn) }) : t('ui.dive.banner.noCatch'), P.greenLight);
          break;
        }
        case 'baitOut': sfx('error'); fx.text(hp.x, hp.y - 22, t('ui.dive.fx.baitOut'), P.orange); break;
        // (text NAD panelom boja — pri BAR_Y − 14 ho panel boja celý zakryl a hráč ho nikdy nevidel)
        case 'upBlocked': sfx('error'); fx.text(90, FP.y - 12, t('ui.dive.fx.upBlocked'), P.orange); break;
        case 'maxDepth': sfx('error'); fx.text(hp.x, hp.y + 22, t('ui.dive.fx.lineEnd', { depth: U.meters(e.depth) }), P.orange); break;
        case 'perkOffer': sfx('perk'); S.perkDepth = e.depth; HL.w.nav = true; HL.w.setFocus('perk0'); break;
        case 'perkTaken':
          // ui_click pri kliku zahrá main.js; klávesy 1/2/3 nie sú widget, tie cvaknú tu
          if (!S.pickWidget) sfx('ui_click');
          HL.w.nav = false;
          // Dlhý názov (Záchranný uzol: … 298 px) sa zalomí — jeden plávajúci text by bol orezaný na oboch krajoch.
          var pkl = F.measure(HL.endless.perkName(e.id)) <= PW - 8 ? [HL.endless.perkName(e.id)] : F.wrap(nbsp(HL.endless.perkName(e.id)), PW - 8);
          for (var pki = 0; pki < pkl.length; pki++) fx.text(90, 110 + pki * 11, pkl[pki], P.cyan);
          break;
        case 'zone': {
          var z = HL.world.zoneAt(d.hook.depth, d.mode === 'endless', d.location);
          // rozsah bez jednotky pri prvom čísle ("50–200 m"); U.num = U.meters bez " m"
          var sub = isFinite(z.to) ? t('ui.dive.banner.zoneSub', { from: U.num(Math.round(z.from)), to: U.meters(z.to), desc: z.desc })
            : t('ui.dive.banner.zoneSubOpen', { from: U.meters(z.from), desc: z.desc });
          banner(z.name.toUpperCase(), sub, P[ZONE_TEXT[z.id] || 'cyan']);
          break;
        }
        case 'warn':
          if (e.level > e.prev && e.level >= 2) vib(e.level >= 3 ? [30, 30, 30] : 20);
          if (e.level >= 1) queueHint('tension');
          break;
        case 'weather': fx.text(90, 60, t('ui.dive.fx.weather', { weather: HL.world.weatherName(e.id, d.clock) }), P.greyLight); break;
        default: break;
      }
    }
  }

  // ------------------------------------------------------------------ návod (riziko 19: postupne)
  function seenMap() {
    var s = HL.game.save;
    if (!s.tutorial || typeof s.tutorial !== 'object') s.tutorial = { seen: {} };
    if (!s.tutorial.seen) s.tutorial.seen = {};
    return s.tutorial.seen;
  }
  function queueHint(key) {
    if (!S || !S.tutorial || !HL.data.tutorial[key]) return;
    if (seenMap()[key] || S.hint === key || S.hintQueue.indexOf(key) >= 0) return;
    S.hintQueue.push(key);
  }
  // Nápoveda zmizne, keď ju hráč splnil (a aspoň chvíľu ju videl), alebo po T.diveHintSec.
  function hintDone(d, key, sec) {
    if (sec > T.diveHintSec) return true;
    if (sec < 1.6) return false;
    if (key === 'sink') return d.hook.depth > 12;
    if (key === 'move') return Math.abs(d.hook.x - S.hintX0) > 24;
    if (key === 'bite') return !!(d.fight && d.fight.taps.good > 0) || !d.fight;
    if (key === 'red') return sec > 3.2;
    if (key === 'up') return d.state === 'ascend';
    return false;
  }
  function isFightHint(k) { return k === 'bite' || k === 'red'; }
  // Počas boja idú nápovedy k boju PRED ostatné (predtým čakala 'bite' za 'sink' a pri prvom boji
  // sa neukázala vôbec — odhalila to fotka boja s legendou). Mimo boja sa nápoveda k boju zahodí
  // (neoznačí sa ako videná, ukáže sa pri ďalšom boji) — po boji by hovorila o niečom, čo už nie je.
  function updateHints(d, dt) {
    var fighting = d.state === 'fight';
    if (S.hint) {
      S.hintT += dt;
      var preempt = fighting && !isFightHint(S.hint) && S.hintQueue.some(isFightHint);
      if (preempt || hintDone(d, S.hint, S.hintT)) S.hint = null;
    }
    if (!fighting) S.hintQueue = S.hintQueue.filter(function (k) { return !isFightHint(k); });
    if (!S.hint && S.hintQueue.length) {
      var i = 0;
      if (fighting) { i = S.hintQueue.findIndex(isFightHint); if (i < 0) return; }
      var k = S.hintQueue.splice(i, 1)[0];
      S.hint = k; S.hintT = 0; S.hintX0 = d.hook.x;
      seenMap()[k] = true; // uloží sa s koncom ponoru (finishDive → persist)
    }
  }

  // ------------------------------------------------------------------ harness ?fight=<druh>
  // Ryba vznikne pri háčiku cez HL.dive.spawn (tá istá funkcia ako prirodzený výskyt) a záber sa
  // hodí v HL.dive.update ako v hre. Iba šanca je na pár krokov istá, aby bola fotka opakovateľná.
  // ?tier=trofejny|velky|bezny|maly = veľkosť kusu natvrdo (fotka štítku v paneli boja); neznáma sa ignoruje.
  function plantFight(d, id, tier) {
    if (!species(id) || d.state !== 'dive') return false;
    var tr = tier && HL.specimen.tier(tier) ? tier : undefined;
    HL.dive.spawn(d, 'fish', { id: id, x: d.hook.x, depth: d.hook.depth, single: true, tier: tr });
    S.forceBite = 30;
    handleEvents(d, d.events.slice()); // legendAppear zo spawnu (prišla mimo update)
    return true;
  }

  // Harness ?depth=N teleportuje háčik do mora bez rýb — prirodzené ryby vznikajú len za okrajom a
  // priplávajú za niekoľko sekúnd, takže fotka Polnoci bola prázdna čierna plocha (kritik D6).
  // Nasadí T.divePopulate rýb do VIDITEĽNÉHO pásu cez HL.dive.spawn (tá istá cesta ako prirodzený
  // výskyt; druhy podľa tých istých pravidiel: rozsah hĺbok, podmienky, udalosť). Iba vo viditeľnom
  // páse (pod oblúkom, nad pásom návodu — nie pod HUD) a zvislo ďalej od háčika, než kam siaha to,
  // čo by ryba sama spravila: návnada jej nechutí → mimo dosahu záberu; chutí → mimo dosahu lákania;
  // pretrhla by vlasec → mimo dosahu výkričníka. Ryby plávajú vodorovne (vlnenie ±1,5 m), takže samy
  // nezaberú ani nevyrobia "!" — testy a fotky ostanú o tom, čo skúšajú. Iba harness. → počet rýb
  function prepopulate(d) {
    var n = Math.round(T.divePopulate), ppm = T.pxPerM;
    if (!(n > 0) || d.state !== 'dive') return 0;
    var endless = d.mode === 'endless', cam = HL.dive.cameraTop(d);
    var top = Math.max(0.5, cam + (TOP_H + 28) / ppm), bot = cam + (BAR_Y - 60) / ppm;
    var tn = d.tension || { total: 0, strength: Infinity }, dm = tn.depthMult || 1;
    var gapOf = function (sp) {
      var px = HL.dive.baitMatch(d.bait.id, sp) === 'bad' ? T.biteRadius + 12 : T.attractRadius + 12;
      // najťažší možný kus (trofejný, sim/specimen.js) — predtým × 1,25 (starý rozptyl váhy)
      var rk = fishRisk(sp, sp.lineKg || sp.weight * HL.specimen.maxMult(), dm);
      if (Math.max(rk.hang, rk.pull) + (tn.total || 0) > tn.strength) px = Math.max(px, T.diveDangerPx + 12);
      return px / ppm;
    };
    var cands = HL.world.location(d.location).fish.filter(function (sp) {
      if (sp.event && sp.event !== d.env.event) return false;
      var lo = sp.depth[0], hi = endless && sp.zone === 'priepast' ? Infinity : sp.depth[1];
      if (hi < top || lo > bot) return false;
      return HL.world.matches(sp, d.env);
    });
    if (!cands.length) return 0;
    var r = HL.rngFor(HL.game.save.seed, 'divepop', Math.round(d.hook.depth), HL.game.save.stats.dives);
    var placed = 0;
    for (var k = 0; k < n * 4 && placed < n; k++) {
      var sp = r.pick(cands);
      var lo2 = Math.max(top, sp.depth[0]), hi2 = Math.min(bot, endless && sp.zone === 'priepast' ? Infinity : sp.depth[1]);
      if (!(hi2 > lo2)) continue;
      var dep = r.range(lo2, hi2);
      if (Math.abs(dep - d.hook.depth) < gapOf(sp)) continue;
      HL.dive.spawn(d, 'fish', { id: sp.id, x: r.range(16, PW - 16), depth: dep, dir: r.sign(), single: true });
      placed++;
    }
    return placed;
  }

  function stepSim(d, dt, inp) {
    var boost = S.forceBite > 0 && d.state === 'dive';
    var old = T.biteChanceMult;
    if (boost) T.biteChanceMult = 1e6;
    var ev;
    try { ev = HL.dive.update(d, dt, inp); }
    finally { if (boost) T.biteChanceMult = old; }
    if (boost) S.forceBite = d.state === 'fight' ? 0 : S.forceBite - 1;
    return ev;
  }

  // ------------------------------------------------------------------ pauza
  // auto = pauza pre stratu fokusu / skrytú kartu (nie voľba hráča). CrazyGames: pri strate fokusu sa
  // gameplayStop NEvolá („we handle this on our side") — gameplay() ju preto za prestávku nepovažuje.
  function setPaused(on, auto) {
    S.paused = on;
    S.pauseAuto = !!(on && auto);
    HL.w.nav = on || (S.d.state === 'perk');
    if (on) { S.pauseAt = S.t; HL.w.setFocus('p_resume'); if (HL.audio.creak) HL.audio.creak(0); if (HL.audio.reel) HL.audio.reel(0); }
  }
  function soundOn() {
    var s = HL.game.settings;
    return !(s && s.musicVol === 0 && s.sfxVol === 0);
  }
  function toggleSound() {
    var s = HL.game.settings;
    if (!s) return;
    if (soundOn()) {
      S.prevVol = { m: s.musicVol, s: s.sfxVol };
      s.musicVol = 0; s.sfxVol = 0;
    } else {
      var def = HL.save.defaultSettings();
      var pv = S.prevVol || { m: def.musicVol, s: def.sfxVol };
      s.musicVol = pv.m || def.musicVol; s.sfxVol = pv.s || def.sfxVol;
    }
    if (HL.audio && HL.audio.setVolumes) HL.audio.setVolumes(s.musicVol, s.sfxVol);
    if (HL.game.persistSettings) HL.game.persistSettings(); else HL.game.persist();
  }
  function updatePaused(d) {
    trackPointer();
    HL.audio.creak(0); if (HL.audio.reel) HL.audio.reel(0);
    var I = HL.input;
    // To isté tlačidlo "II" pauzu aj zruší (na dotyku ho hráč nájde tam, kde ju zapol).
    if (HL.w.clicked('p_resume') || HL.w.clicked('pause') || (S.t - S.pauseAt > 0.05 && (I.actionPressed('pause') || I.actionPressed('back')))) { setPaused(false); return; }
    if (HL.w.clicked('p_sound')) toggleSound();
    if (HL.w.clicked('p_up') && d.state === 'dive') {
      setPaused(false);
      handleEvents(d, stepSim(d, 1 / 60, { up: true }));
    }
  }

  // ------------------------------------------------------------------ scéna
  HL.scenes.def('dive', {
    enter: function (params) {
      params = params || {};
      var Q = HL.query || {};
      var direct = !queryUsed && Q.scene === 'dive';
      if (direct) queryUsed = true;
      var mode = params.mode === 'endless' ? 'endless' : 'career';
      // jadrové jazero (docs/JAZERO.md): z Prípravy params.location, z adresy ?loc=jadro (scenár pripraví výbavu)
      var loc = mode === 'career' && HL.world.isLake(params.location || (direct ? Q.loc : null)) ? (params.location || Q.loc) : 'more';
      if (HL.world.isLake(loc) && !HL.game.lakeAccess().ok) loc = 'more';
      var bait = null;
      if (mode === 'career') {
        bait = params.bait && usableBait(params.bait) ? params.bait : null;
        if (!bait && direct && Q.bait && usableBait(Q.bait)) bait = Q.bait;
        if (!bait) bait = bestBait(direct ? Q.depth : 0, loc);
      }
      // Nový výlet: scéna sa otvára z Prípravy (alebo z adresy). Ďalšie ponory výletu idú cez kartu
      // na hladine (diveAgain) a enter už nevolajú.
      trip = mode === 'career' ? { dives: 0, fish: 0, value: 0, snaps: 0 } : null;
      // bonusový ponor: z Prípravy params.haul, z adresy ?haul=1 (ladenie, harness)
      var haul = mode === 'career' && !!(params.haul || (direct && Q.haul && Q.haul !== '0'));
      var d = HL.game.startDive({ bait: bait || 'worm', mode: mode, location: loc, haul: haul });
      sfx('splash'); // háčik dopadne do vody — aj pri prvom ponore výletu (ďalšie ho hrajú v diveAgain)
      if (direct && HL.scenario && HL.scenario.dive) {
        HL.scenario.dive(d, Q);
        HL.dive.refresh(d);
      }
      S = newState(d, mode, direct, Q);
      if (direct && Number(Q.depth) > 0 && Q.populate !== '0') S.populated = prepopulate(d);
      if (Q.bot === '1' || Q.bot === 'true') S.bot = makeBot(d);
      if (direct && Q.surface) S.autoSurface = String(Q.surface);
      beginDive(d, null);
      if (direct && Q.fight) plantFight(d, Q.fight, Q.tier);
    },

    exit: function () {
      if (HL.audio && HL.audio.creak) HL.audio.creak(0); if (HL.audio && HL.audio.reel) HL.audio.reel(0);
      HL.w.nav = false;
      if (S) S.left = true;
    },

    // CrazyGames (core/platform.js, main.js step): hrá sa = ponor beží alebo je pauznutý len stratou fokusu.
    // Nie: pauza hráčom, koniec ponoru (S.summary, aj výsledok), karta na hladine (S.surf). Ďalší ponor
    // z karty (diveAgain) a návrat z pauzy = znova hrá. Výber perku ostáva hrou (voľba uprostred ponoru).
    gameplay: function () {
      return !!S && !S.left && !S.surf && !S.summary && !(S.paused && !S.pauseAuto);
    },

    update: function (dt) {
      if (!S) return;
      var d = S.d, I = HL.input;
      var t0 = typeof performance !== 'undefined' ? performance.now() : 0;
      S.t += dt;

      if (S.surf) { updateSurface(dt); return; }
      if (S.paused) { updatePaused(d); return; }
      if (!S.summary && (I.actionPressed('pause') || I.actionPressed('back') || HL.w.clicked('pause'))) {
        trackPointer();
        setPaused(true);
        return;
      }

      if (!S.summary) {
        var inp = readInput(d, dt);
        if (S.bot) botInput(d, inp, dt);
        if (S.autoSurface) autoSurface(d, inp);
        S.prevDepth = d.hook.depth;
        S.baitBefore = d.bait.count;
        var wasFight = d.state === 'fight';
        handleEvents(d, stepSim(d, dt, inp));
        if (wasFight || d.state === 'fight') S.lastFightT = S.t;
        updateHints(d, dt);
        if (d.state === 'perk') HL.w.nav = true;
      } else trackPointer();

      // Kamera nasleduje háčik (sim ho drží na T.hookScreenY); zaokrúhlená, aby svet neplával o pol pixela.
      S.cam = camPx(d);
      S.ascV = dt > 0 ? (S.prevDepth - d.hook.depth) / dt : 0;
      if (d.state === 'ascend') {
        var hp = hookPos(d);
        S.fx.emit('bubbles', hp.x + (h01(Math.floor(S.t * 60), 3) - 0.5) * 6, hp.y + 8, { n: 2, dy: Math.min(420, S.ascV * T.pxPerM) });
      }
      if (d.fight) thrash(d, dt);

      var live = d.state === 'dive' || d.state === 'fight';
      HL.audio.creak(live ? d.tension.ratio : 0);
      // Navijak: klesanie je hlavná akcia hry a bolo úplne tiché (majiteľ: "pridaj zvuky").
      if (HL.audio.reel) HL.audio.reel(d.state === 'dive' && d.hook.sinking ? U.clamp01(d.hook.vy / Math.max(1, T.sinkMax)) * 0.7 + 0.3 : 0);
      HL.music.setDepth(Math.max(0, d.hook.depth));
      if (live && d.tension.level >= 3) S.fx.shake(1.6, 0.12); // dizajn 4.2: pri 95 % sa obrazovka trasie
      S.bolt = Math.max(0, S.bolt - dt);
      S.fx.update(dt);
      if (S.banners.length) {
        S.banners[0].t += dt;
        if (S.banners[0].t > T.diveBannerSec) S.banners.shift();
      }

      if (d.state === 'over') finishOnce(d);
      if (S.summary && !S.left) {
        S.outro += dt;
        if (S.outro >= T.diveOutroSec) {
          if (toResults(S.summary)) {
            // Legenda (aj koniec hry) a Nekonečná hlbina majú vlastnú obrazovku výsledku. Výlet tým
            // končí (z výsledku sa ide na trh / do dediny / späť do Nekonečnej).
            S.left = true;
            var tc = tripCopy();
            trip = null;
            HL.go('results', { summary: S.summary, trip: tc });
          } else openSurface();
        }
      }
      if (t0) S.stepMs = S.stepMs * 0.9 + (performance.now() - t0) * 0.1;
    },

    draw: function (ctx) {
      if (!S) return;
      var t0 = typeof performance !== 'undefined' ? performance.now() : 0;
      if (S.surf) drawSurfaceScene(ctx); else drawScene(ctx, S.d);
      if (t0) S.drawMs = S.drawMs * 0.9 + (performance.now() - t0) * 0.1;
    },

    drawPanel: function (ctx, side, w, h) {
      if (!S) return;
      if (S.surf) { if (side === 'L') panelLeftSurface(ctx, w, h); else panelRightSurface(ctx, w, h); return; }
      if (side === 'L') panelLeft(ctx, S.d, w, h); else panelRight(ctx, S.d, w, h);
    },

    probe: function () {
      if (!S) return { ready: false };
      var d = S.d, tn = d.tension, f = d.fight;
      return {
        mode: d.mode, location: d.location, state: d.state, t: r2(d.t), core: !!S.vis.core,
        coreLight: S.coreMask ? { r: Math.round(S.coreMask.mask.width / 2), up: S.coreMask.up, lit: !!(S.vis.sea && S.vis.sea.coreLit), clipY: S.coreMask.clipY } : null,
        lampClipY: S.lampMask ? (S.lampMask.clipY == null ? null : S.lampMask.clipY) : undefined,
        depth: r2(d.hook.depth), hookX: r2(d.hook.x), cameraTop: r2(HL.dive.cameraTop(d)),
        maxDepth: isFinite(d.line.maxDepth) ? d.line.maxDepth : -1,
        zone: d.zone, bait: d.bait.id, baitCount: isFinite(d.bait.count) ? d.bait.count : -1, harpoons: d.harpoons,
        tension: { ratio: Math.round(tn.ratio * 1000) / 1000, total: r2(tn.total), strength: r2(tn.strength), level: tn.level },
        onLine: d.onLine.length, value: Math.round(HL.dive.value(d)),
        fishVisible: S.vis.fish, dangerMarks: S.vis.danger, riskMarks: S.vis.risk,
        // phaseLeft je len pre harness (aby test ťukal do fázy, ktorá ešte chvíľu potrvá) — NEkreslí sa
        fight: f ? { species: f.species.id, phase: f.phase, progress: Math.round(f.progress * 1000) / 1000, bossPhase: f.bossPhase,
          good: f.taps.good, bad: f.taps.bad, legend: !!f.legend, phaseT: r2(f.phaseT), phaseLeft: r2(f.phaseDur - f.phaseT),
          riskKg: r2(fightRiskKg(d)), difficulty: r2(f.difficulty), novice: !!f.novice,
          dots: HL.ui.diffDots(f.difficulty), tier: d.fightFish ? d.fightFish.tier || null : null } : null,
        darkness: r2(S.vis.dark), lightR: d.light,
        shark: d.shark ? { phase: d.shark.phase, t: r2(d.shark.t), side: d.shark.side } : null,
        octopus: d.octopus ? { phase: d.octopus.phase || (d.octopus.attached ? 'attached' : 'warn'), attached: !!d.octopus.attached, shakes: d.octopus.shakes, load: r2(d.octopus.load != null ? d.octopus.load : 1) } : null,
        octoText: S.vis.octo,
        eel: d.shadowEel ? { still: r2(d.shadowEel.still || 0) } : null,
        paused: S.paused, hint: S.hint, perkOffer: d.perkOffer ? d.perkOffer.slice() : null,
        banner: S.banners.length ? S.banners[0].title : null,
        snap: !!S.snap, finished: !!S.summary, outcome: d.result ? d.result.outcome : null,
        upEnabled: d.state === 'dive' && !S.paused && !upLocked(d),
        thumb: S.vis.thumb, layout: S.lay, haul: S.vis.haul,
        music: HL.music && HL.music.mode ? HL.music.mode() : null,
        input: { fingerSpeed: Math.round(S.fvx), control: S.ctlId },
        stats: { fights: d.stats.fights, landed: d.stats.landed, escaped: d.stats.escaped, goodTaps: d.stats.goodTaps, badTaps: d.stats.badTaps },
        drawMs: r2(S.drawMs), stepMs: r2(S.stepMs), bot: !!S.bot, fxParticles: S.fx.count(),
        populated: S.populated, life: S.vis.life || null,
        // podmorie (gfx/seascape.js): rastliny, chaluhy, orientačné body na obrazovke, stupne tmy k, stena v svetle
        sea: S.vis.sea || null, bgSnapshot: !!S.bg,
        // farba vody v hĺbke háčika (poloha na rampe a meno farby) — sondy svetla porovnávajú voči nej
        water: (function () { var q = seaQ(d, Math.max(0, d.hook.depth), seaSteps(d.env), boltK()), RP = waterRamp(d.env, d.location); return { q: r2(q), color: RP[Math.round(q)] }; })(),
        // karta na hladine: surface = karta je hore (ponor skončil, scéna ostáva 'dive'); trip = výlet
        surface: !!S.surf, trip: tripCopy(),
        selectedBait: S.surf ? S.surf.bait : null,
        cardButtons: S.surf && S.surf.lay ? S.surf.lay.buttons.slice() : null,
        card: S.surf ? surfaceProbe(S.surf) : null,
      };
    },
  });

  // finishDive PRESNE RAZ (stráž: S.summary) — z update aj z dobehnutia pri skrytí karty.
  // Kariérny ponor sa pripíše do výletu (aj prasknutý: ponor, 0 rýb, 0 €).
  function finishOnce(d) {
    if (S.summary || d.state !== 'over') return false;
    S.summary = HL.game.finishDive(d);
    S.outro = 0;
    if (trip && S.mode === 'career') {
      var r = S.summary.result;
      trip.dives++;
      trip.fish += r.outcome === 'surfaced' ? r.catch.length : 0;
      trip.value += U.isNum(S.summary.value) ? S.summary.value : 0;
      if (r.outcome === 'snapped') trip.snaps++;
    }
    return true;
  }
  function tripCopy() { return trip ? { dives: trip.dives, fish: trip.fish, value: r2(trip.value), snaps: trip.snaps } : null; }
  // Na kartu nie: odomknutie legendy (aj koniec hry) a Nekonečná hlbina — tie majú obrazovku výsledku.
  function toResults(sum) {
    return !!sum && (sum.result.mode === 'endless' || !!(sum.unlocks && sum.unlocks.length));
  }

  // Spoločný začiatok ponoru: prvý (enter) aj ďalší z karty na hladine (diveAgain).
  // held = prsty, ktoré ponor spustili podržaním na vode — tie klesajú hneď (háčik ide len dole);
  // ostatné stlačenia (tlačidlo Prípravy, PONORIŤ SA ZNOVA) klesaním nie sú, kým sa nezdvihnú.
  function beginDive(d, held) {
    S.cam = camPx(d);
    var ptrs = HL.input.pointers;
    if (ptrs) { for (var pk in ptrs) S.fingers[pk] = held && held[pk] ? 'play' : 'ui'; }
    else if (HL.input.pointer.down) S.fingers[HL.input.pointer.lastId != null ? HL.input.pointer.lastId : 1] = 'ui';
    HL.w.nav = false;
    // Hudba a more pokračujú (music.set toho istého režimu nič nepreruší).
    HL.music.set(S.mode === 'endless' ? 'endless' : 'dive');
    if (HL.music.setLocation) HL.music.setLocation(d.location); // jazero: nálada pásiem jazera (audio/music.js)
    HL.music.setDepth(d.hook.depth);
    HL.audio.ambience('sea');
    queueHint('sink'); queueHint('move');
  }

  // Harness ?surface=1|snap: ten istý vstup, aký by dal hráč (HORE), resp. medúza cez HL.dive.spawn.
  function autoSurface(d, inp) {
    if (d.state !== 'dive') { S.autoSurface = null; return; }
    if (S.autoSurface === 'snap') {
      if (!d.jellyHits.length) HL.dive.spawn(d, 'jelly', { x: d.hook.x, depth: d.hook.depth, vx: 0 });
    } else inp.up = true;
  }
  // Výstup (HORE) a prasknutie majú výsledok už rozhodnutý — len animácia beží. Keď sa karta skryje
  // uprostred nich, main.js hneď uloží hru; bez tohto by uložil save BEZ vyneseného úlovku (štart
  // ponoru už návnadu odpočítal) a zabitá karta (prepnutie aplikácie na mobile) by o úlovok prišla,
  // hoci ho dizajn 6 volá "v bezpečí" (review #8). Dobehne sa bez zvuku a vstupu, deterministicky.
  function settleForHide() {
    if (!S || S.summary) return false;
    var d = S.d;
    if (d.state !== 'ascend' && d.state !== 'snapped') return false;
    var guard = Math.ceil((T.ascendSec + T.snapSec + 1) * 60) + 10;
    S.silent = true;
    try {
      while (d.state !== 'over' && guard-- > 0) {
        S.t += 1 / 60;
        handleEvents(d, stepSim(d, 1 / 60, null));
      }
    } finally { S.silent = false; }
    S.cam = camPx(d);
    if (S.paused) { S.paused = false; HL.w.nav = false; }
    return finishOnce(d);
  }

  if (HL.isBrowser && typeof document !== 'undefined' && document.addEventListener) {
    // Tento poslucháč sa registruje pri načítaní skriptu, main.js až v HL.boot — beží teda PRED
    // uložením v main.js (to je podmienka opravy #8).
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden || HL.scene !== 'dive' || !S || S.summary) return;
      if (settleForHide()) return;
      // Skrytá karta = pauza (sim by inak po návrate dobehol 0,25 s naraz a hráč by prišiel o rybu).
      if (!S.paused) setPaused(true, true);
    });
  }
  // Okno stratilo fokus (iná aplikácia navrchu, hra ostáva vidno): input.js pustí všetky klávesy
  // a prsty, sim by bežal bez hráča (review #14). Pauza, rovnako ako pri skrytej karte.
  if (HL.isBrowser && typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('blur', function () {
      if (HL.scene === 'dive' && S && !S.summary && !S.paused) setPaused(true, true);
    });
  }

  // Ryba v boji: vo fáze ŤAHÁ trhá preč od háčika, pri POVOLÍ sa nechá pritiahnuť (dizajn 5.3).
  function thrash(d, dt) {
    var f = d.fight, side = S.fightSide, big = f.legend ? 1.6 : 1, a = T.diveThrashPx * big, tx, ty;
    if (f.phase === 'pull') { tx = side * (a + 4 * Math.sin(S.t * 11)); ty = a * 0.9 + 3 * Math.sin(S.t * 17); }
    else { tx = side * 3 * Math.sin(S.t * 2.5); ty = 4 + Math.sin(S.t * 3); }
    // Zlé ťuknutie = ryba sa prudko vzoprie (a berie postup) — trhne ďaleko od háčika a dozneje.
    if (f.flash && f.flash.kind === 'bad' && f.t - f.flash.t < 0.35) { var k = 1 - (f.t - f.flash.t) / 0.35; tx += side * 12 * k; ty += 7 * k; }
    S.thr.x = U.damp(S.thr.x, tx, 14, dt);
    S.thr.y = U.damp(S.thr.y, ty, 14, dt);
  }

  // ================================================================== kreslenie
  function lineTop(d) {
    // Vlasec ide zo špičky prútu na lodi; keď je hladina mimo obrazovky, zhora (bod mimo plochy).
    return { x: BOAT_X + 36, y: sy(d, 0) - 22 };
  }
  function lineEnd(d) {
    var hp = hookPos(d);
    if (d.fight) return { x: hp.x + S.thr.x, y: hp.y + S.thr.y };
    return hp;
  }
  function lineCol(level) { return level >= 2 ? P.red : level === 1 ? P.amber : P.greyLight; }

  // Pixelový vlasec; od warn2 kmitá do strán a amplitúda rastie s napätím (dizajn 4.2). Od warn3
  // je dvojitý a bliká bielo-červeno — posledný stupeň musí byť na pohľad iný než warn2 (kritik TOP-2).
  function drawLine(ctx, a, b, level, ratio, force) {
    var x0 = a.x, y0 = a.y, x1 = b.x, y1 = b.y;
    if (y1 < -2) return;
    if (y0 < -2) { var k = (-2 - y0) / (y1 - y0); x0 += (x1 - x0) * k; y0 = -2; }
    var c = force || (level >= 3 && blink(7) ? P.white : lineCol(level)), thick = level >= 3;
    var amp = level >= 2 ? 0.8 + U.clamp01((ratio - T.warn2) / Math.max(0.01, 1 - T.warn2)) * 3 + (level >= 3 ? 1 : 0) : 0;
    if (amp <= 0) { D.pline(ctx, x0, y0, x1, y1, c); return; }
    var N = 12, px = x0, py = y0;
    for (var i = 1; i <= N; i++) {
      var q = i / N;
      var w = Math.sin(q * Math.PI) * amp * Math.sin(S.t * 55 + q * 9);
      var nx = x0 + (x1 - x0) * q + (i < N ? w : 0), ny = y0 + (y1 - y0) * q;
      D.pline(ctx, px, py, nx, ny, c);
      if (thick) D.pline(ctx, px + 1, py, nx + 1, ny, !force && level >= 3 && c === P.white ? P.red : c);
      px = nx; py = ny;
    }
  }
  // Cez svetlú dennú vodu (pás pod hladinou, lúče) mal svetlosivý vlasec proti tyrkysovej rozdiel jasu
  // len ~24 (kritik D4) — dostane 1-px tmavý lem vpravo, ten istý tvar aj kmitanie ako vlasec.
  function drawLineEdge(ctx, d, a, b, tn) {
    if (d.env.period === 'night' || !(T.diveLineEdgeM > 0)) return;
    var s0 = Math.max(0, Math.round(sy(d, 0)) + 1), s1 = Math.min(H, Math.round(sy(d, T.diveLineEdgeM)));
    if (s1 <= s0) return;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, s0, PW, s1 - s0); ctx.clip();
    drawLine(ctx, { x: a.x + 1, y: a.y }, { x: b.x + 1, y: b.y }, tn.level, tn.ratio, P.navy);
    ctx.restore();
  }

  // ------------------------------------------------------------------ riziko ryby (JEDEN vzorec)
  // Záťaž, ktorú ryba pridá po zaseknutí: väčšie z (ťah v najsilnejšej fáze boja, visenie na vlasci).
  // Ťah legendy vo fáze 2/3 je × pullMult — HL.fight.peakPullKg (sim). Výkričník aj panel boja
  // predtým počítali lineKg × pull, legenda bez značky potom vlasec pretrhla (review #9).
  function peakPull(sp, lineKg) {
    if (HL.fight && HL.fight.peakPullKg) return HL.fight.peakPullKg(sp, lineKg);
    var m = 1, ph = sp.phases || [];
    for (var i = 0; i < ph.length; i++) m = Math.max(m, ph[i].pullMult || 1);
    return lineKg * sp.pull * m;
  }
  // Ťah a skoky násobí hĺbka len podielom T.pullDepthScale (sim/tension.js) — tu rovnako.
  function pullScale(dm) { return 1 + (dm - 1) * T.pullDepthScale; }
  function fishRisk(sp, lineKg, dm) {
    return { hang: lineKg * dm, pull: sp ? peakPull(sp, lineKg) * pullScale(dm) : 0 };
  }
  // Panel boja: čo je na vlasci okrem bojujúcej ryby + jej najhorší prípad.
  function fightRiskKg(d) {
    var ff = d.fightFish, f = d.fight;
    if (!ff || !f) return 0;
    var tn = d.tension, pr = tn.parts || {}, dm = tn.depthMult || 1;
    var base = (pr.fish || 0) + (pr.octopus || 0) + (pr.jelly || 0) + (pr.hazard || 0);
    var r = fishRisk(f.species, ff.lineKg != null ? ff.lineKg : f.lineKg, dm);
    return base + Math.max(r.hang, r.pull);
  }
  function lineXAt(a, b, y) {
    if (Math.abs(b.y - a.y) < 1e-6) return b.x;
    return a.x + (b.x - a.x) * (y - a.y) / (b.y - a.y);
  }

  function skyColors(env) {
    var p = env.period, w = env.weather;
    if (p === 'night') return w === 'storm' || w === 'rain' ? [P.ink, P.slateDark] : [P.ink, P.navy];
    if (w === 'storm') return [P.slateDark, P.slate];
    if (w === 'rain') return [P.slate, P.grey];
    if (w === 'fog') return [P.grey, P.greyLight];
    if (p === 'morning') return w === 'cloudy' ? [P.slate, P.pink] : [P.blue, P.pink];
    if (p === 'evening') return w === 'cloudy' ? [P.purple, P.clay] : [P.purple, P.orange];
    return w === 'cloudy' ? [P.grey, P.greyLight] : [P.blue, T.seaSkyHaze >= 1 ? P.greyLight : P.cyan];
  }

  function drawSky(ctx, d, surf) {
    if (surf <= 0) return;
    var env = d.env, cols = skyColors(env), top = surf - 122;
    // pásy, nie Bayerove bodky (kritik D9: ružová obloha so 16 % modrých bodiek, búrka 22 %)
    bandGradient(ctx, 0, top, PW, 122, cols[0], cols[1], Math.max(0, T.diveSkyZonePx));
    var mod = env.minuteOfDay / 60;
    if (env.period === 'night') {
      for (var i = 0; i < 28; i++) {
        var x = Math.floor(h01(i, 21) * PW), y = top + Math.floor(h01(i, 22) * 90);
        if (y < surf - 4 && (i % 5 || blink(0.5 + h01(i, 23)))) D.px(ctx, x, y, i % 3 ? P.greyLight : P.white);
      }
      var mh = mod >= 21 ? mod - 21 : mod + 3; // 21:00 → 0, 05:00 → 8
      var mx = 20 + mh / 8 * 130, my = surf - 20 - Math.sin(Math.PI * mh / 8) * 70;
      D.sprite(ctx, HL.spr.get('moon_' + env.moon), mx, my);
    } else if (env.weather === 'sun' || env.weather === 'cloudy') {
      var k = U.clamp01((mod - 6) / 14);
      var sx = 34 + k * 112, syy = surf - 14 - Math.sin(Math.PI * k) * 78; // mimo hĺbkomeru a stĺpca úlovku
      D.circle(ctx, sx, syy, 7, P.amber);
      D.circle(ctx, sx, syy, 6, P.yellow);
      D.circle(ctx, sx - 2, syy - 2, 2, P.white);
    }
    // jadrové jazero: na obzore chladiace veže a reaktor (tá istá kulisa ako obrazovka elektrárne)
    if (isLake(d) && HL.plantArt) HL.plantArt.backdrop(ctx, env, S.t, surf, true); // v noci rovno stmavená (ponor nemá nightShade)
    if (env.weather !== 'sun') {
      // mraky: pár "vankúšov" z kruhov, pomaly sa unášajú
      var cc = env.weather === 'storm' ? [P.slateDark, P.slate] : env.period === 'night' ? [P.navy, P.slateDark] : [P.grey, P.greyLight];
      for (var c = 0; c < 4; c++) {
        var cx = ((h01(c, 31) * 260 + S.t * (3 + c)) % 260) - 40, cy = top + 22 + h01(c, 32) * 50;
        if (cy > surf - 8) continue;
        D.circle(ctx, cx, cy + 3, 8, cc[0]); D.circle(ctx, cx + 11, cy + 3, 7, cc[0]); D.circle(ctx, cx - 10, cy + 4, 6, cc[0]);
        D.circle(ctx, cx, cy, 7, cc[1]); D.circle(ctx, cx + 10, cy + 1, 6, cc[1]); D.circle(ctx, cx - 9, cy + 2, 5, cc[1]);
      }
    }
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, PW, Math.max(0, surf)); ctx.clip();
    if (env.weather === 'rain' || env.weather === 'storm') HL.fx.rain(ctx, S.t, env.weather === 'storm' ? 1 : 0.6, PW, surf);
    if (env.event === 'winter') HL.fx.snow(ctx, S.t, 0.6, PW, surf);
    if (S.bolt > 0 && surf > 20) {
      // blesk: lomená čiara z oblakov k obzoru
      var bx = S.boltX, by = Math.max(0, top + 10);
      for (var j = 0; j < 7 && by < surf - 2; j++) {
        var nx = bx + (h01(j, Math.floor(S.boltX)) - 0.5) * 16, ny = by + (surf - by) / (7 - j);
        D.pline(ctx, bx, by, nx, ny, j % 2 ? P.yellow : P.white);
        bx = nx; by = ny;
      }
    }
    ctx.restore();
  }

  // Voda: každý riadok obrazovky má farbu svojej hĺbky — rampa mora (HL.pal.seaAt) posunutá tmou
  // hĺbky a náladou počasia (seaQ). Medzi dvoma farbami rampy PLOCHA a len v úzkom pásme okolo stredu
  // prechodu vodorovné pruhy (bandOn), pevne vo svete. Predtým Bayerov dithering + atramentová mriežka
  // tmy cez celý stĺpec vody (kritik D9: "mesh", "50 % šachovnica"). Riadky rovnakej farby = 1 fillRect.
  function drawWater(ctx, d, y0) {
    var ppm = T.pxPerM, cam = S.cam, shift = seaSteps(d.env), bk = boltK(), top = RAMP.length - 1, RP = waterRamp(d.env, d.location);
    var zone = Math.max(0, T.diveBandZonePx);
    var prevQ = seaQ(d, (cam + y0 - 0.5) / ppm, shift, bk);
    var runY = y0, runC = null;
    for (var y = y0; y <= H; y++) {
      var c = null;
      if (y < H) {
        var wy = cam + y, dep = (wy + 0.5) / ppm, q = seaQ(d, dep, shift, bk), dq = Math.abs(q - prevQ);
        prevQ = q;
        var i = Math.min(top - 1, Math.floor(q)), f = q - i;
        // šírka pásma pruhov v jednotkách rampy: zone riadkov × zmena na riadok
        var span = zone * dq, g = span > 1e-9 ? U.clamp01((f - 0.5) / span + 0.5) : (f >= 0.5 ? 1 : 0);
        var ca = P[RP[i]], cb = P[RP[i + 1]];
        c = bandOn(wy, g) ? cb : ca;
      }
      if (c !== runC) {
        if (runC) D.rect(ctx, 0, runY, PW, y - runY, runC);
        runY = y; runC = c;
      }
    }
    // Pod hladinou svetlejší pás (slnko preniká) — pruhy, ktoré s hĺbkou rednú (farba T.seaGlowCol: sivý opar, voda
    // k hladine svetlie ako vo vzore ref_06). Iba cez deň a nie cez tmavšiu vodu búrky ani hmly.
    if (d.env.period !== 'night' && !shift && RP === rampOf(d.location) && T.diveSurfGlowM > 0) {
      var lim = Math.min(H, Math.round(T.diveSurfGlowM * ppm - cam));
      runY = y0; runC = null;
      for (var yy = y0; yy <= lim; yy++) {
        var on = yy < lim && bandOn(cam + yy, 0.5 * (1 - ((cam + yy) / ppm) / T.diveSurfGlowM));
        if (on !== runC) {
          if (runC) D.rect(ctx, 0, runY, PW, yy - runY, P[SHAFT_COL[Math.round(T.seaGlowCol)] || 'grey']);
          runY = yy; runC = on;
        }
      }
    }
  }

  // Kotúč farby s ditherovaným okrajom šírky edge (alebo diera, keď color = null — maska pre
  // destination-out). Fáza Bayerovej mriežky podľa polohy na obrazovke → okraj sa pri pohybe nemrví.
  var discs = {}, discN = 0;
  function disc(R, edge, color, phx, phy) {
    R = Math.max(1, Math.round(R)); edge = Math.max(0, Math.min(R, Math.round(edge)));
    var key = R + ':' + edge + ':' + (color || 'hole') + ':' + phx + ':' + phy;
    if (discs[key]) return discs[key];
    if (++discN > 400) { discs = {}; discN = 1; }
    var size = 2 * R + 1, c = D.canvas(size, size);
    if (!c) return null;
    var x = c.getContext('2d'), img = x.createImageData(size, size), px = img.data;
    var rgb = color ? parseInt(color.slice(1), 16) : 0;
    for (var j = 0; j < size; j++) {
      for (var i = 0; i < size; i++) {
        var dist = Math.sqrt((i - R) * (i - R) + (j - R) * (j - R));
        var a = dist <= R - edge ? 1 : dist >= R ? 0 : (R - dist) / Math.max(1, edge);
        if (!(a > 0) || D.bayer(phx + i, phy + j) >= Math.round(a * 16)) continue;
        var o = (j * size + i) * 4;
        px[o] = rgb >> 16; px[o + 1] = (rgb >> 8) & 255; px[o + 2] = rgb & 255; px[o + 3] = 255;
      }
    }
    x.putImageData(img, 0, 0);
    return (discs[key] = c);
  }
  function drawDisc(ctx, cx, cy, R, edge, color) {
    var x0 = Math.round(cx) - Math.round(R), y0 = Math.round(cy) - Math.round(R);
    var c = disc(R, edge, color, x0 & 3, y0 & 3);
    if (c) ctx.drawImage(c, x0, y0);
  }
  // Kužeľ svetla háčika: voda v ňom je o 1 (okraj) a 2 (jadro) stupne rampy SVETLEJŠIA ako voda
  // okolo — ploché kruhy, dithering len na ich okraji. Kreslí sa pod paralaxu (skaly = siluety vo svetle).
  // Svieti len v TME (T.diveLampFrom, ako pred opravou): cez deň v búrke je voda tmavšia náladou, nie
  // tmou — modrý reflektor v 15 m bol chyba. V Priepasti je voda atrament aj bez tmy a svetlo tam
  // MUSÍ byť vidno (kontrola v tools/fix_dive_ui.js skupina 'lamp').
  // Vráti masku vonkajšieho kotúča { mask, mx, my } — v nej HL.sea.drawLit ukáže blízku stenu svetlejšiu.
  function drawLamp(ctx, d, end, y0) {
    if (!(darknessLevel(d) > T.diveLampFrom)) return null;
    var dep = Math.max(0, d.hook.depth), q = seaQ(d, dep, seaSteps(d.env), boltK());
    var water = Math.round(q), outer = Math.max(1, Math.round(q - 1)), core = Math.max(1, Math.round(q - 2));
    if (outer >= water) return null;
    var R = Math.round(d.light || T.lightRadius), e = T.diveConeEdgePx, cy = end.y + 7;
    // V šere (Súmrak, noc v plytčine — tma pod T.diveInkFrom) je voda ešte modrá a celý kotúč bol najväčší jasný
    // tvar v zábere (v5: plochý svetlomodrý kruh 68 px). Tam len menšia žiara bez jadra; plné svetlo v tme.
    if (darknessLevel(d) < T.diveInkFrom) { R = Math.max(4, Math.round(R * T.diveLampDusk)); core = outer; }
    else { outer = Math.max(Math.round(T.diveLampBright), outer); core = Math.max(Math.round(T.diveLampBright), core); }
    if (outer >= water) return null;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, y0, PW, H - y0); ctx.clip();
    var RP = waterRamp(d.env, d.location);
    drawDisc(ctx, end.x, cy, R, e, P[RP[outer]]);
    if (core < outer) drawDisc(ctx, end.x, cy, R * T.diveLampCore, e, P[RP[core]]);
    ctx.restore();
    var mx = Math.round(end.x) - R, my = Math.round(cy) - R;
    return { mask: disc(R, e, P[RP[outer]], mx & 3, my & 3), mx: mx, my: my };
  }
  // Skutočná tma (od T.diveInkFrom): atrament PLNE mimo dohľadu a svetiel, dithering iba na ich
  // okraji (T.diveConeEdgePx). Dohľad sa na prahu začína široký (T.diveSeeFarPx) a s hĺbkou sa zužuje
  // na kužeľ svetla háčika — tma sa zaťahuje okolo hráča, nikdy riedka mriežka cez celú vodu.
  var inkBuf = { c: null, x: null };
  function drawInk(ctx, d, y0, lvl, lights, lamp) {
    var thr = T.diveInkFrom;
    if (!(lvl >= thr) || y0 >= H) return false;
    var k = U.clamp01((lvl - thr) / Math.max(0.01, 1 - thr));
    lamp.r = Math.max(lamp.r, U.lerp(T.diveSeeFarPx, lamp.r, k));
    if (!inkBuf.c) { inkBuf.c = D.canvas(PW, H); if (!inkBuf.c) return false; inkBuf.x = inkBuf.c.getContext('2d'); }
    var b = inkBuf.x;
    // Tma mimo svetla skrýva ryby a nebezpečenstvá, NIE krajinu: vrstva je snímka pozadia z tohto snímku
    // (voda + podmorie, pred rybami — S.bg). Bez snímky (iný cieľ kreslenia) plný atrament ako predtým.
    b.globalCompositeOperation = 'copy';
    if (S.bg) b.drawImage(S.bg, 0, 0);
    else { b.fillStyle = P.ink; b.fillRect(0, 0, PW, H); }
    b.globalCompositeOperation = 'destination-out';
    for (var i = 0; i < lights.length; i++) {
      var L = lights[i], R = Math.round(L.r);
      if (!(R > 0) || L.x + R < 0 || L.y + R < 0 || L.x - R >= PW || L.y - R >= H) continue;
      drawDisc(b, L.x, L.y, R, Math.min(T.diveConeEdgePx, Math.floor(R / 3)), null);
    }
    // vzdialené siluety len NA atramente (source-atop): nikdy cez osvetlenú vodu a ryby v nej
    b.globalCompositeOperation = 'source-atop';
    S.vis.far = drawFarLife(b, d, y0, lvl);
    b.globalCompositeOperation = 'source-over';
    ctx.save();
    ctx.beginPath(); ctx.rect(0, y0, PW, H - y0); ctx.clip();
    ctx.drawImage(inkBuf.c, 0, 0);
    ctx.restore();
    return true;
  }

  // Podmorie (gfx/seascape.js), zozadu dopredu: vzdialené útesy, stredné skaly s chaluhami a vrakom →
  // svetlo háčika (PRED diaľkou: skaly v diaľke ho nesmú odhryznúť — v1 ho rezali na kosáky) → slnečné lúče →
  // blízke steny s rastlinami, kostrou a dnom → tá istá stena v kuželi svetla svetlejšia (HL.sea.drawLit).
  function seaView(d, y0) {
    return { cam: S.cam, y0: y0, dk: seaDk(d), t: S.t, endless: d.mode === 'endless', fog: waterRamp(d.env, d.location) === FOG_RAMP, loc: d.location };
  }
  function drawParallax(ctx, d, surf, end) {
    var y0 = Math.max(0, Math.ceil(surf));
    if (y0 >= H) return;
    var tl = ensureTiles(), v = seaView(d, y0), sea = !!HL.sea && T.seaShow >= 1;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, y0, PW, H - y0); ctx.clip();
    var info = sea ? HL.sea.drawBack(ctx, v) : null;
    S.lampMask = drawLamp(ctx, d, end, y0);
    S.coreMask = drawCoreLight(ctx, d, y0);
    // slnečné lúče v plytkej vode (za blízkymi stenami)
    var nS = Math.round(T.seaShaftN);
    if (tl.shaft && nS > 0 && surf > -tl.shaft.h && d.env.period !== 'night' && d.env.weather !== 'storm' && d.env.weather !== 'fog') {
      for (var i = 0; i < nS; i++) ctx.drawImage(tl.shaft.c, Math.round(10 + (i + 0.3) * 156 / nS - tl.shaft.w * 0.3 + Math.sin(S.t * 0.25 + i * 2) * 5), Math.round(surf));
    }
    if (sea) {
      HL.sea.drawNear(ctx, v, info);
      info.lit = HL.sea.drawLit(ctx, v, S.lampMask);
      if (S.coreMask) info.coreLit = HL.sea.drawLit(ctx, v, S.coreMask);
    }
    ctx.restore();
    S.vis.sea = info;
  }

  // Snímka pozadia (voda, podmorie, svetlo háčika) pred rybami — z nej je tma mimo svetla (drawInk).
  function snapshotBg(ctx) {
    if (!ctx.getTransform) return null;
    if (!S.bgBuf) { var c = D.canvas(PW, H); if (!c) return null; S.bgBuf = { c: c, x: c.getContext('2d') }; S.bgBuf.x.imageSmoothingEnabled = false; }
    var m = ctx.getTransform();
    S.bgBuf.x.globalCompositeOperation = 'copy';
    S.bgBuf.x.drawImage(ctx.canvas, Math.round(m.e), Math.round(m.f), Math.round(PW * m.a), Math.round(H * m.d), 0, 0, PW, H);
    S.bgBuf.x.globalCompositeOperation = 'source-over';
    return S.bgBuf.c;
  }

  function drawSnowParticles(ctx, d, y0) {
    var hN = 340, shift = seaSteps(d.env), bk = boltK();
    for (var i = 0; i < SNOW.length; i++) {
      var p = SNOW[i];
      var x = Math.round((((p.x + Math.sin(S.t * 0.4 + p.ph) * 3) % PW) + PW) % PW);
      var y = Math.round((((p.y + S.t * p.v - S.cam) % hN) + hN) % hN) - 10;
      if (y < y0 || y >= H) continue;
      // v tmavšej vode sú čiastočky tlmenejšie (modrá 0, tmavomodrá a navy o 1, čierna o 2 stupne)
      var dep = (S.cam + y) / T.pxPerM, k = Math.min(2, Math.max(0, Math.round((seaQ(d, dep, shift, bk) - 1) * 0.6)));
      D.px(ctx, x, y, darker(P[p.c], k));
    }
  }
  // Život v tme (kritik D6: Polnoc bola prázdna čierna plocha, dizajn 14.1 sľubuje svietiace ryby a
  // planktón). Kreslí sa NAD atramentom. Sila rastie od (T.diveInkFrom − 0,2) po prah — v Súmraku nič.
  function lifeK(lvl) { return U.clamp01((lvl - (T.diveInkFrom - 0.2)) / 0.2); }
  // Planktón: trblietavé čiastočky rôznej veľkosti, driftujú pomalšie než svet (paralaxa 0,6).
  function drawGlints(ctx, d, y0, lvl) {
    var n = Math.min(GLINT.length, Math.round(T.diveGlints * lifeK(lvl)));
    var hN = H + 40, shown = 0;
    for (var i = 0; i < n; i++) {
      var p = GLINT[i];
      var y = Math.round((((p.y - S.cam * 0.6 + S.t * p.v) % hN) + hN) % hN) - 20;
      if (y < y0 + 1 || y >= BAR_Y - 1) continue;
      var x = Math.round((((p.x + Math.sin(S.t * 0.25 + p.ph) * 6) % PW) + PW) % PW);
      var b = 0.5 + 0.5 * Math.sin(S.t * p.w + p.ph);   // trblietanie 0..1
      if (b < 0.18) continue;                             // chvíľu nesvieti
      var c = P[p.c];
      if (b < 0.45) c = darker(c, 1);
      if (p.big && b > 0.82) {                            // vrchol: krížik s tlmenými ramenami
        var arm = darker(c, 1);
        D.px(ctx, x - 1, y, arm); D.px(ctx, x + 1, y, arm); D.px(ctx, x, y - 1, arm); D.px(ctx, x, y + 1, arm);
        D.px(ctx, x, y, P.white);
      } else if (p.big) {
        D.rect(ctx, x, y, 2, 1, c);
      } else D.px(ctx, x, y, c);
      shown++;
    }
    return shown;
  }
  // Vzdialené svietiace siluety: tiene veľkých hlbinných rýb v zadnej paralaxe (posun 0,25), telo
  // navy (v diaľke), svietiace body tlmené jednou farbou — ryba, ktorú nechytíš, ale vieš, že tam je.
  // Nie legendy (tie majú vlastnú hudbu a nápis) a nie ryby hernej vrstvy (tie svietia plnou farbou).
  var FAR_IDS = {}, farTint = {};
  function farIds(loc) {
    var key = HL.world.isLake(loc) ? loc : 'more';
    if (FAR_IDS[key]) return FAR_IDS[key];
    var ids = FAR_IDS[key] = [];
    HL.world.location(key).fish.forEach(function (f) { if (f.glow && !f.event && f.size >= 32 && HL.spr.glowMask(f.id, 0)) ids.push(f.id); });
    return ids;
  }
  function tintedGlow(id, frame, color) {
    var key = id + ':' + frame + ':' + color;
    if (farTint[key]) return farTint[key];
    var gm = HL.spr.glowMask(id, frame);
    if (!gm) return null;
    var c = D.canvas(gm.width, gm.height);
    if (!c) return null;
    var x = c.getContext('2d');
    x.drawImage(gm, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = color;
    x.fillRect(0, 0, c.width, c.height);
    return (farTint[key] = c);
  }
  function drawFarLife(ctx, d, y0, lvl) {
    var ids = farIds(d.location), n = Math.round(T.diveFarLife);
    if (!ids.length || !(n > 0) || lifeK(lvl) < 1) return 0;
    var period = H + 120, off = S.cam * 0.25, shown = 0;
    // n siluet na výšku obrazovky, rozostúpené v "diaľke"; vodorovne pomaly plávajú a vracajú sa
    for (var k0 = Math.floor(off / period) * n - n, k = k0; k < k0 + 3 * n; k++) {
      var y = Math.round(k * period / n + h01(k, 71) * 60 - off);
      if (y < y0 - 40 || y > BAR_Y) continue;
      var id = ids[Math.floor(h01(k, 72) * ids.length)], dir = h01(k, 73) < 0.5 ? -1 : 1;
      var sz = fishSize(id), span = PW + sz.w * 2 + 60, v = 3 + h01(k, 74) * 4;
      var x = Math.round(((((h01(k, 75) * span + dir * S.t * v) % span) + span) % span) - sz.w - 30);
      var fr = Math.floor(S.t * 2 + k) % 2;
      // lem navy: čierne telo splývalo s čiernymi stenami (kritik kolo 1, l04/g04) — na stene je vidno lem, na
      // tmavomodrej vode telo
      var dep = (S.cam + y + sz.h / 2) / T.pxPerM;
      if (Math.round(seaQ(d, dep, seaSteps(d.env), boltK())) < RAMP.length - 1) {
        var rim = HL.spr.silhouette(id, fr, 'navy');
        for (var q = 0; q < 4; q++) D.sprite(ctx, rim, x + (q === 0 ? -1 : q === 1 ? 1 : 0), y + (q === 2 ? -1 : q === 3 ? 1 : 0), { flip: dir < 0 });
      }
      D.sprite(ctx, HL.spr.silhouette(id, fr, 'ink'), x, y, { flip: dir < 0 });
      var g = tintedGlow(id, fr, h01(k, 76) < 0.5 ? P.blue : P.pinkPurple);
      if (g) D.sprite(ctx, g, x, y, { flip: dir < 0 });
      shown++;
    }
    return shown;
  }

  function drawSurface(ctx, d, surf) {
    if (surf < -30 || surf > H + 4) return;
    var env = d.env, cols = skyColors(env), winter = env.event === 'winter', lk = isLake(d);
    // jazero: vlny v zelenej vode, hrebeň svetlosivá pena (more: modrá a tyrkysová). NIE greenLight — v ponore patrí
    // len boju („ťukaj teraz", ART_SPEC §3; revízia 2026-10-02: 131 px greenLight v riadkoch hladiny).
    var wv = lk ? P.green : P.blue, crest = lk ? P.greyLight : P.cyan;
    if (!winter) {
      for (var x = 0; x < PW; x += 2) {
        var h = Math.round(Math.sin(x * 0.12 + S.t * 2.2) * 1.2 + Math.sin(x * 0.05 - S.t * 1.3) * (env.weather === 'storm' ? 2 : 1));
        if (h < 0) D.rect(ctx, x, surf + h, 2, -h, wv);
        else if (h > 0) D.rect(ctx, x, surf, 2, h, cols[1]);
        D.rect(ctx, x, surf + h, 2, 1, (x + Math.floor(S.t * 8)) % 14 < 2 ? P.white : crest);
      }
    }
    // loď s prútom
    var bob = Math.round(Math.sin(S.t * 1.7) * (env.weather === 'storm' ? 2 : 1));
    var boat = HL.spr.get('boat_small');
    D.sprite(ctx, boat, BOAT_X, surf - boat.height + 4 + bob);
    var tip = lineTop(d);
    D.pline(ctx, BOAT_X + 16, surf - 6 + bob, tip.x, tip.y + bob, P.wood);
    D.pline(ctx, BOAT_X + 17, surf - 6 + bob, tip.x + 1, tip.y + bob, P.woodLight);
    if (winter) {
      // zamrznutá hladina (Zimný lov): ľad s dierou, kade ide vlasec
      var hole = Math.round(lineXAt(tip, lineEnd(d), surf + 1));
      D.rect(ctx, 0, surf - 1, PW, 4, P.greyLight);
      D.rect(ctx, 0, surf - 1, PW, 1, P.white);
      for (var c = 8; c < PW; c += 23) D.rect(ctx, c, surf, 1, 3, P.grey);
      D.rect(ctx, hole - 5, surf - 1, 10, 4, wv);   // v diere je voda miesta (jazero zelené, revízia 2026-10-02)
    }
  }

  // Ryba sa kreslí tak, aby jej ÚSTA boli na polohe zo simulácie (tam, kam patrí háčik).
  function fishRect(id, mx, my, dir) {
    var fs = fishSize(id), flip = dir < 0;
    var x = flip ? mx - (fs.w - 1 - fs.mouth.x) : mx - fs.mouth.x;
    return { x: Math.round(x), y: Math.round(my - fs.mouth.y), w: fs.w, h: fs.h, flip: flip };
  }

  // Nebezpečenstvá vo svete (skaly, medúzy, žralok v útoku). Volá sa dvakrát: vo svete a znova
  // orezané na pás nápisu — nápis (pásmo, legenda) je POD nebezpečenstvami, nie cez ne (kritik).
  function drawHazards(ctx, d, lights, withShark) {
    var hp = hookPos(d);
    for (var i = 0; i < d.rocks.length; i++) {
      // v jazere sú prekážky hrdzavé sudy (ten istý zásah do vlasca, iný obrázok — docs/JAZERO.md)
      var rk = d.rocks[i], img = HL.spr.get((isLake(d) ? 'barrel_' : 'rock_') + rk.size);
      var ry = sy(d, rk.depth);
      if (ry < -30 || ry > H + 30) continue;
      D.sprite(ctx, img, rk.x - img.width / 2, ry - img.height / 2);
    }
    // medúzy — vlastná slabá žiara, v tme by boli nefér neviditeľné
    for (var j = 0; j < d.jellies.length; j++) {
      var je = d.jellies[j], jy = sy(d, je.depth);
      if (jy < -20 || jy > H + 20) continue;
      var ji = HL.spr.get('jelly', Math.floor(S.t * 3 + je.uid) % 2);
      D.sprite(ctx, ji, je.x - ji.width / 2, jy - ji.height / 2);
      if (lights) lights.push({ x: je.x, y: jy, r: 9 });
    }
    if (withShark) drawShark(ctx, d, hp);
  }

  function drawEntities(ctx, d, glows, lights, marks) {
    var hp = hookPos(d);
    drawHazards(ctx, d, lights, false);
    // ryby
    var vis = 0, danger = 0, risk = 0;
    var dm = HL.tension.depthMult(Math.max(0, d.hook.depth), HL.tension.depthDiv(d));
    var total = d.tension.total, strength = d.tension.strength;
    for (var k = 0; k < d.fish.length; k++) {
      var f = d.fish[k], fy = sy(d, f.depth);
      var fr = fishRect(f.id, f.x, fy, f.dir);
      if (fr.x > PW || fr.x + fr.w < 0 || fr.y > H || fr.y + fr.h < 0) continue;
      vis++;
      var frame = Math.floor(S.t * (f.state === 'flee' ? 9 : 5) + f.uid * 0.37) % 2;
      D.sprite(ctx, HL.spr.fish(f.id, frame), fr.x, fr.y, { flip: fr.flip });
      if (f.glow || f.legend) {
        var gm = HL.spr.glowMask(f.id, frame);
        if (gm) { glows.push({ img: gm, x: fr.x, y: fr.y, flip: fr.flip }); lights.push({ x: fr.x + fr.w / 2, y: fr.y + fr.h / 2, r: Math.min(16, 6 + fr.w / 5) }); }
      }
      // Výkričník: táto ryba by po zaseknutí pretrhla vlasec (dizajn 19 — žiadne nefér prasknutia).
      var dist = Math.sqrt((f.x - hp.x) * (f.x - hp.x) + (fy - hp.y) * (fy - hp.y));
      if (dist < T.diveDangerPx && d.state === 'dive') {
        // červená = po zaseknutí vlasec isto nevydrží; jantárová = môže prasknúť v boji (ťah fázy 3)
        var rk = fishRisk(species(f.id), f.lineKg, dm);
        if (rk.hang + total > strength) { danger++; marks.push({ x: fr.x + fr.w / 2, y: fr.y - 3, kind: 'red' }); }
        else if (rk.pull + total > strength) { risk++; marks.push({ x: fr.x + fr.w / 2, y: fr.y - 3, kind: 'amber' }); }
      }
    }
    S.vis.fish = vis; S.vis.danger = danger; S.vis.risk = risk;
    // tieňový úhor: silueta, svietia len oči
    if (d.shadowEel) {
      var e = d.shadowEel, ey = sy(d, e.depth), efr = Math.floor(S.t * 3) % 2;
      var es = HL.spr.silhouette('shadow_eel', efr, 'ink'), eflip = e.x > hp.x;
      D.sprite(ctx, es, e.x - es.width / 2, ey - es.height / 2, { flip: eflip });
      var eg = HL.spr.glowMask('shadow_eel', efr);
      if (eg) glows.push({ img: eg, x: Math.round(e.x - es.width / 2), y: Math.round(ey - es.height / 2), flip: eflip });
    }
    drawShark(ctx, d, hp); // žralok v útoku NAD rybami
  }

  function drawShark(ctx, d, hp) {
    var s = d.shark;
    if (!s) return;
    var sz = HL.spr.size('shark'), fr = Math.floor(S.t * 4) % 2;
    var y = hp.y + s.y - sz.h / 2, side = s.side < 0 ? -1 : 1;
    var edge = side < 0 ? -sz.w + 16 : PW - 16;
    if (s.phase === 'warn') {
      return; // silueta pri varovaní sa kreslí až NAD tmou (drawMarkers) — v Súmraku by inak nebola vidieť
    } else if (s.phase === 'attack') {
      var k = U.clamp01(s.t / 0.35);
      D.sprite(ctx, HL.spr.get('shark', fr), U.lerp(edge, hp.x - sz.w / 2, k), U.lerp(y, hp.y - sz.h / 2, k), { flip: side > 0 });
    } else {
      var k2 = U.clamp01(s.t / T.sharkLeaveSec);
      var from = S.sharkBit ? hp.x - sz.w / 2 : edge, to = side < 0 ? -sz.w - 10 : PW + 10;
      var yy = S.sharkBit ? U.lerp(hp.y - sz.h / 2, y, k2) : y;
      D.sprite(ctx, HL.spr.get('shark', fr), U.lerp(from, to, k2), yy, { flip: side < 0 });
    }
  }

  // Ryba visiaca za ústa: sprite otočený o 90° (ústa hore) v SKUTOČNEJ veľkosti. Predtým úlovok
  // na vlasci kreslili náhľady 12 × 8 px — na fotke 2–3 px škvrny, nebolo vidno, čo na vlasci visí.
  var hangCache = {};
  function hangSprite(id, frame) {
    var key = id + ':' + frame;
    if (hangCache[key]) return hangCache[key];
    var img = HL.spr.fish(id, frame), fs = fishSize(id);
    var c = D.canvas(img.height, img.width);
    if (!c) return null;
    var x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.translate(0, img.width); x.rotate(-Math.PI / 2); x.drawImage(img, 0, 0);
    // bod úst (mx, my) sa otočením dostane na (my, šírka − 1 − mx)
    var m = fs.mouth || { x: img.width - 1, y: Math.floor(img.height / 2) };
    return (hangCache[key] = { c: c, mx: m.y, my: img.width - 1 - m.x });
  }
  // Rozloženie visiacich rýb: najnovšia v strede pod háčikom, ďalšie striedavo vľavo a vpravo.
  function hangLayout(d, end) {
    var n = d.onLine.length, k = Math.min(n, Math.max(1, T.diveHangMax)), out = [];
    var hook = HL.spr.get('hook'), an = HL.spr.meta('hook').anchor || [5, 0];
    var my = Math.round(end.y - an[1] + (hook ? hook.height : 10) + 2); // ústa ryby tesne pod ohybom háčika
    var left = 0, right = 0;
    for (var i = 0; i < k; i++) {
      var it = d.onLine[n - 1 - i], hs = hangSprite(it.id, Math.floor(S.t * 2 + i * 0.7) % 2);
      if (!hs) break;
      var w = hs.c.width, cx;
      if (i === 0) { cx = 0; left = -Math.ceil(w / 2); right = Math.floor(w / 2); }
      else if (i % 2) { cx = left - 1 - Math.floor(w / 2); left = cx - Math.ceil(w / 2); }
      else { cx = right + 1 + Math.ceil(w / 2); right = cx + Math.floor(w / 2); }
      var sway = Math.round(Math.sin(S.t * 1.7 + i) * 0.6);
      var x = Math.round(end.x + cx + sway - hs.mx), y = my - hs.my;
      out.push({ id: it.id, x: x, y: y, w: w, h: hs.c.height, img: hs.c, mouthX: x + hs.mx, mouthY: my });
    }
    return { list: out, more: n - out.length, topY: my };
  }

  // Vlasec, ryby na ňom, bojujúca ryba, háčik. (Chobotnica sa kreslí nad tmou v drawMarkers.)
  function drawRig(ctx, d, glows, lights) {
    S.hang = null;
    if (d.state === 'snapped' || (S.snap && d.state === 'over')) { drawSnapRig(ctx, d); return; }
    var top = lineTop(d), end = lineEnd(d), tn = d.tension;
    drawLineEdge(ctx, d, top, end, tn);
    drawLine(ctx, top, end, tn.level, tn.ratio);
    // úlovok visí pod háčikom (kritik: v skutočnej veľkosti, najviac T.diveHangMax, ďalšie ako +N)
    var hl = S.hang = hangLayout(d, end);
    var lc = lineCol(tn.level);
    for (var i = 0; i < hl.list.length; i++) {
      var h = hl.list[i];
      D.pline(ctx, end.x, hl.topY - 3, h.mouthX, h.mouthY, lc); // krátky nadväzec od háčika k ústam
      D.sprite(ctx, h.img, h.x, h.y);
      // ryby pri háčiku osvetľuje jeho svetlo — v Polnoci by inak z nich ostali bodky tmy
      if (lights) lights.push({ x: h.x + h.w / 2, y: h.y + h.h / 2, r: Math.ceil(Math.max(h.w, h.h) / 2) + 3 });
    }
    if (d.fight && d.fightFish) {
      var ff = d.fightFish, f = d.fight;
      var dir = f.phase === 'pull' ? S.fightSide : -S.fightSide;
      var fr = fishRect(ff.id, end.x, end.y, dir), frame = Math.floor(S.t * (f.phase === 'pull' ? 12 : 4)) % 2;
      D.sprite(ctx, HL.spr.fish(ff.id, frame), fr.x, fr.y, { flip: fr.flip });
      var gm = HL.spr.glowMask(ff.id, frame);
      if (gm) glows.push({ img: gm, x: fr.x, y: fr.y, flip: fr.flip });
    }
    var hook = HL.spr.get('hook'), an = HL.spr.meta('hook').anchor || [5, 0];
    D.sprite(ctx, hook, end.x - an[0], end.y - an[1]);
  }

  // Prasknutie: horný kus vlasca vyšľahne nahor a vlní sa, háčik s kúskom vlasca padá (dizajn 14.2).
  function drawSnapRig(ctx, d) {
    var sn = S.snap;
    if (!sn) return;
    var k = S.t - sn.t, top = lineTop(d);
    var bx = sn.x, by = sn.y - Math.min(400, k * k * 900);
    var px = top.x, py = Math.max(-2, top.y);
    if (top.y < -2 && by > -2) { var kk = (-2 - top.y) / (by - top.y); px = top.x + (bx - top.x) * kk; }
    var N = 10, lx = px, ly = py;
    for (var i = 1; i <= N; i++) {
      var q = i / N, w = Math.sin(q * Math.PI * 2 + k * 30) * 6 * q;
      var nx = px + (bx - px) * q + w, ny = py + (by - py) * q;
      if (ny > -2 || ly > -2) D.pline(ctx, lx, ly, nx, ny, P.greyLight);
      lx = nx; ly = ny;
    }
    var hy = sn.y + k * 26, hx = sn.x + Math.sin(k * 5) * 4;
    D.pline(ctx, hx, hy, hx + Math.sin(k * 9) * 3, hy - 9, P.greyLight);
    var hook = HL.spr.get('hook'), an = HL.spr.meta('hook').anchor || [5, 0];
    D.sprite(ctx, hook, hx - an[0], hy - an[1]);
    // stratené ryby padajú do hĺbky — tie isté visiace sprity ako pred prasknutím, nie náhľady
    var lost = d.lost, n = 0;
    for (var j = lost.length - 1; j >= 0 && n < Math.max(1, T.diveHangMax); j--) {
      if (lost[j].cause !== 'snap') continue;
      var hs = hangSprite(lost[j].id, 0);
      if (hs) D.sprite(ctx, hs.c, Math.round(sn.x - hs.mx + (n % 2 ? 1 : -1) * (4 + n * 6) * (0.5 + k * 2)), Math.round(sn.y + 10 + k * (30 + n * 6)), { flip: n % 2 === 1 });
      n++;
    }
  }

  // Bočné prúdy v búrke (dizajn 7.3): čiarky pod vodou tečú v smere prúdu.
  function drawCurrent(ctx, d, y0) {
    var f = d.current ? d.current.force : 0;
    if (Math.abs(f) < 2) return;
    var n = Math.min(24, Math.round(Math.abs(f) * 0.8)), W2 = PW + 40;
    for (var i = 0; i < n; i++) {
      var len = 5 + Math.floor(h01(i, 51) * 8);
      var x = Math.round((((h01(i, 52) * W2 + S.t * f * (2 + h01(i, 53))) % W2) + W2) % W2) - 20;
      var y = Math.round(y0 + h01(i, 54) * (H - y0));
      D.rect(ctx, f > 0 ? x : x - len, y, len, 1, i % 3 ? P.blue : P.cyan);
    }
  }

  // Žiara jadra (jadrové jazero, dno 800 m, docs/JAZERO.md): Čerenkovova modrá nad nádobou s palivovými tyčami.
  // Je súčasť POZADIA (pred snímkou S.bg), takže tma mimo svetla ju neskryje, a jadro je svetlo — ryby pri ňom vidno.
  // Svetlo STÚPA v lúčoch nad medzerami medzi tyčami (tyrkysová → modrá → tmavomodrá), dĺžka každého lúča sa
  // pomaly mení (trblietanie). Plný vejár z pásov (v1) pôsobil ako modrá kupola na nádobe.
  // Svetlo jadra: stred nad nádobou, polomer z posuvníka (s chvením). null = nie je jazero / jadro mimo obrazovky.
  function coreLightGeom(d) {
    if (!isLake(d) || !HL.sea || !HL.sea.worldDef || !(T.diveCoreLightR > 0)) return null;
    var core = HL.sea.worldDef('jadro').core;
    if (!core) return null;
    var top = Math.round(sy(d, HL.data.LAKE_FLOOR)) - 3 - core.h;
    var R = Math.round(T.diveCoreLightR * (1 + T.diveCoreLightFlicker * Math.sin(S.t * 2.3) * Math.sin(S.t * 0.7 + 1)));
    if (top - R > H || top + R < 0) return null;
    return { x: Math.round((core.x0 + core.x1) / 2), y: top, r: R };
  }
  // Kotúč svetla jadra vo vode (pred diaľkou, za blízkymi stenami — ako svetlo háčika) a maska pre stenu vo svetle.
  function drawCoreLight(ctx, d, y0) {
    var g = coreLightGeom(d);
    if (!g) return null;
    var RP = waterRamp(d.env, d.location), q = Math.round(seaQ(d, HL.data.LAKE_FLOOR - 10, seaSteps(d.env), boltK()));
    var outerC, innerC;
    if (T.diveCoreLightBlue >= 1) { outerC = P.blueDark; innerC = P.blue; }
    else { outerC = P[RP[Math.max(1, q - 1)]]; innerC = P[RP[Math.max(1, q - 2)]]; }
    var e = T.diveConeEdgePx;
    // svetlo nejde pod vrch betónového dna: v reze je dno plná hmota (svetlo pod ním = misa, nie svetlo)
    var floorY = Math.round(sy(d, HL.data.LAKE_FLOOR)) - 4, yb = Math.min(H, floorY);   // vrch betónu dna
    if (yb > y0 && T.diveCoreLightWater > 0) {
      ctx.save();
      ctx.beginPath(); ctx.rect(0, y0, PW, yb - y0); ctx.clip();
      drawDisc(ctx, g.x, g.y, g.r * T.diveCoreLightWater, e, outerC);
      if (T.diveCoreLightCore > 0) drawDisc(ctx, g.x, g.y, g.r * T.diveCoreLightCore, e, innerC);
      ctx.restore();
    }
    var mx = g.x - g.r, my = g.y - g.r;
    return { mask: disc(g.r, e, outerC, mx & 3, my & 3), mx: mx, my: my, up: Math.round(T.diveCoreLightLit), clipY: floorY + Math.round(T.diveCoreLightFloorPx) };
  }

  function drawCoreGlow(ctx, d) {
    if (!isLake(d) || !HL.sea || !HL.sea.worldDef || T.diveCoreGlow <= 0) return null;
    var core = HL.sea.worldDef('jadro').core;
    if (!core) return null;
    var bottom = Math.round(sy(d, HL.data.LAKE_FLOOR)) - 3, top = bottom - core.h;
    var reach = Math.round(T.diveCoreGlow);
    if (top - reach > H || bottom < 0) return null;
    var cx = (core.x0 + core.x1) / 2, half = (core.x1 - core.x0) / 2 - 3;
    D.rect(ctx, core.x0 + 3, top - 1, core.x1 - core.x0 - 6, 1, P.blueDark);   // tenký lem svetla nad nádobou
    for (var gx = core.x0 + 3; gx < core.x1 - 3; gx++) {
      var gc = (gx - core.x0 - 3) % 5;
      if (gc < 2) continue;                                                     // nad tyčou lúč nie je
      var len = Math.round(reach * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(S.t * (1.1 + 0.13 * (gx % 7)) + gx * 0.9))) * (gc === 3 ? 1 : 0.6));
      for (var r = 1; r <= len; r++) {
        var y = top - 1 - r;
        if (y < 0 || y >= H) continue;
        var u = r / Math.max(1, len);
        D.px(ctx, gx, y, u < 0.18 ? P.cyan : u < 0.5 ? P.blue : P.blueDark);
      }
    }
    // voda medzi tyčami svieti (vo vrstve dna je stmavená ako všetko v šachte)
    for (var x = core.x0 + 3; x < core.x1 - 3; x++) {
      var col = (x - core.x0 - 3) % 5;
      if (col >= 2) D.rect(ctx, x, top + 5, 1, Math.max(0, core.h - 5), col === 3 ? P.cyan : P.blue);
    }
    // dohľad v tme = celé svetlo jadra (ryby v ňom vidno), aspoň nádoba so žiarou
    var g = coreLightGeom(d);
    return { x: cx, y: top - 4, r: Math.max(Math.round(half + reach * 0.6), g ? g.r : 0) };
  }

  function drawWorld(ctx, d) {
    var surf = Math.round(sy(d, 0));
    S.surfY = surf;
    var y0 = Math.max(0, surf);
    var lvl = darknessLevel(d);
    S.vis.dark = lvl;
    var hp = hookPos(d), end = lineEnd(d);
    drawSky(ctx, d, surf);
    // hmla ako vrstvy (dizajn 14.1): pásy len nad hladinou a ZA loďkou s prútom (kolo 1: pás prechádzal cez prút);
    // pod vodou je hmla zakalená farba vody (waterRamp)
    if (d.env.weather === 'fog' && surf > TOP_H) {
      var dens = 0.75 * U.clamp01(1 - Math.max(0, d.hook.depth - 20) / T.diveFogMaxM);
      if (dens > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, PW, surf); ctx.clip();
        HL.fx.fog(ctx, S.t, dens, PW, surf, P.greyLight, P.white);
        ctx.restore();
      }
    }
    S.lampMask = null;
    if (y0 < H) drawWater(ctx, d, y0);
    drawParallax(ctx, d, surf, end);
    var coreLight = drawCoreGlow(ctx, d);
    S.vis.core = !!coreLight;
    S.bg = lvl >= T.diveInkFrom && y0 < H ? snapshotBg(ctx) : null;
    drawSnowParticles(ctx, d, y0);
    var glows = [], lights = [], marks = [];
    drawEntities(ctx, d, glows, lights, marks);
    drawRig(ctx, d, glows, lights);
    drawSurface(ctx, d, surf);
    if (d.env.weather === 'storm') drawCurrent(ctx, d, y0);

    // Skutočná tma len pod hladinou (obloha má vlastné farby noci). Nižšia tma je farba vody (seaQ).
    var lamp = { x: end.x, y: end.y + 7, r: d.light || T.lightRadius };
    lights.push(lamp);
    if (coreLight) lights.push(coreLight);
    S.vis.far = 0;
    var inked = drawInk(ctx, d, y0, lvl, lights, lamp);
    // nad tmou: planktón, svietiace časti rýb a varovná farba vlasca
    S.vis.life = { glints: lifeK(lvl) > 0 ? drawGlints(ctx, d, y0, lvl) : 0, far: S.vis.far, ink: inked };
    for (var g = 0; g < glows.length; g++) D.sprite(ctx, glows[g].img, glows[g].x, glows[g].y, { flip: glows[g].flip });
    if (inked && d.tension.level >= 1 && (d.state === 'dive' || d.state === 'fight')) drawLine(ctx, lineTop(d), end, d.tension.level, d.tension.ratio);
    return { marks: marks, hp: hp };
  }

  // Šípka na okraji hernej plochy k nebezpečenstvu, ktoré ešte nie je vidno (kritik: medúza či
  // chobotnica vplávala z okraja bez varovania). side −1 = ľavý okraj, 1 = pravý, 2 = spodný (nad lištou).
  function edgeArrow(ctx, side, pos, color) {
    S.vis.edge++;
    // bliká farbou (nie zmiznutím) — varovanie, ktoré polovicu času nevidno, je polovičné
    if (blink(3)) color = P.white;
    var r, w;
    if (side === 2) {
      // nad pásom návodu, ak by ho pás (kreslí sa neskôr, ako HUD) zakryl
      var x = Math.round(U.clamp(pos, 5, PW - 6)), hb = S.lay && S.lay.hint;
      var yb = (hb && x >= hb.x - 5 && x <= hb.x + hb.w + 5 ? hb.y : BAR_Y) - 2;
      D.rect(ctx, x - 4, yb - 5, 9, 5, P.ink);
      for (r = 0; r < 4; r++) { w = 7 - 2 * r; D.rect(ctx, x - (w >> 1), yb - 4 + r, w, 1, color); }
      return;
    }
    var y = Math.round(U.clamp(pos, TOP_H + 6, BAR_Y - 7)), x0 = side < 0 ? 1 : PW - 6;
    D.rect(ctx, x0 - (side < 0 ? 1 : 0), y - 4, 6, 9, P.ink);
    for (r = -3; r <= 3; r++) {
      w = 4 - Math.abs(r);
      D.rect(ctx, side < 0 ? x0 + Math.abs(r) : x0 + 5 - Math.abs(r) - w, y + r, w, 1, color);
    }
  }
  // Nebezpečenstvá tesne za okrajom, ktoré sa blížia: medúza plávajúca dovnútra (bok), skala pod
  // klesajúcim háčikom (spodok). Chobotnica si šípku kreslí sama (drawMarkers).
  function drawEdgeWarnings(ctx, d) {
    if (!(d.state === 'dive' || d.state === 'fight')) return;
    var M = T.diveEdgeWarnPx;
    if (!(M > 0)) return;
    for (var j = 0; j < d.jellies.length; j++) {
      var je = d.jellies[j], jy = sy(d, je.depth);
      if (jy < TOP_H + 4 || jy > BAR_Y - 4) continue;
      if (je.x < 0 && je.x > -M && je.vx > 0) edgeArrow(ctx, -1, jy, P.pink);
      else if (je.x >= PW && je.x < PW + M && je.vx < 0) edgeArrow(ctx, 1, jy, P.pink);
    }
    if (d.hook.sinking) {
      for (var i = 0; i < d.rocks.length; i++) {
        var rk = d.rocks[i], top = sy(d, rk.depth) - rk.h / 2;
        if (top >= BAR_Y && top < BAR_Y + M) edgeArrow(ctx, 2, rk.x, P.orange);
      }
    }
  }

  // Značky nad svetom (vidno ich aj v tme): výkričníky, žralok, úhor, chobotnica.
  function drawMarkers(ctx, d, info) {
    S.vis.edge = 0;
    var hp = info.hp;
    for (var i = 0; i < info.marks.length; i++) {
      var m = info.marks[i], x = Math.round(m.x), y = Math.round(m.y) - 10;
      if (y < TOP_H + 2 || y > BAR_Y - 12) continue;
      var bg = m.kind === 'red' ? P.red : P.amber;
      D.rect(ctx, x - 3, y, 7, 10, P.ink);
      D.rect(ctx, x - 2, y + 1, 5, 8, bg);
      D.rect(ctx, x, y + 2, 1, 4, m.kind === 'red' ? P.white : P.ink);
      D.rect(ctx, x, y + 7, 1, 1, m.kind === 'red' ? P.white : P.ink);
    }
    var s = d.shark;
    if (s && s.phase === 'warn') {
      // Dizajn 9.2: na okraji sa objaví jeho silueta s výstražnou ikonou. Silueta bridlicová, nad tmou,
      // vykukuje o 18–24 px; odpočet a ikona pod stĺpcom úlovku, aby sa neprekrývali.
      var side = s.side < 0 ? -1 : 1, sz = HL.spr.size('shark'), sfr = Math.floor(S.t * 4) % 2;
      var peek = 21 + Math.round(Math.sin(S.t * 3) * 3);
      var sx = side < 0 ? peek - sz.w : PW - peek, sy0 = Math.round(hp.y + s.y - sz.h / 2);
      D.sprite(ctx, HL.spr.silhouette('shark', sfr, 'slate'), sx, sy0, { flip: side > 0 });
      var minY = side > 0 ? Math.max(TOP_H + 26, catchBottom(d) + 6) : TOP_H + 26;
      var maxY = S.lay && S.lay.hint ? Math.min(BAR_Y - 40, S.lay.hint.y - 24) : BAR_Y - 40; // nad pás návodu
      var wy = Math.round(U.clamp(hp.y + s.y - 20, minY, Math.max(minY, maxY)));
      var ix = side < 0 ? 4 : PW - 15;
      if (blink(3)) D.sprite(ctx, HL.spr.get('icon_warn'), ix, wy);
      var left = Math.max(0, Math.ceil((s.delay || T.sharkDelaySec) - s.t));
      F.draw(ctx, String(left), side < 0 ? 18 : PW - 18, wy - 3, P.red, { scale: 2, shadow: P.ink, align: side < 0 ? 'left' : 'right' });
      F.draw(ctx, t('ui.dive.shark'), side < 0 ? 4 : PW - 4, wy + 13, P.white, { small: true, shadow: P.ink, align: side < 0 ? 'left' : 'right' });
    }
    S.vis.octo = null;
    if (d.octopus) {
      // Chobotnica NAD tmou: v Polnoci by blížiaca sa (a aj prichytená) zanikla v bodkách tmy —
      // varovanie, ktoré nevidno, nie je varovanie (dizajn 19).
      var o = d.octopus, oi = HL.spr.get('octopus', Math.floor(S.t * 6) % 2);
      var ocy = sy(d, o.depth), warn = !o.attached;
      var jit = warn ? 0 : Math.round(Math.sin(S.t * 40) * (1 + o.shakes * 0.4));
      D.sprite(ctx, oi, Math.round(o.x - oi.width / 2) + jit, Math.round(ocy - oi.height / 2 - 4));
      var oy = U.clamp(Math.round(Math.min(ocy, hp.y) - 40), TOP_H + 24, BAR_Y - 60);
      if (warn) {
        // blíži sa: kde (šípka pri okraji, kým je mimo obrazovky), kedy sa chytí a čo pomôže (HORE)
        if (o.x < 0 || o.x >= PW) edgeArrow(ctx, o.x < 0 ? -1 : 1, ocy, P.red);
        var tLeft = Math.max(0, T.octopusWarnSec - (o.warnT != null ? o.warnT : o.t));
        F.draw(ctx, t('ui.dive.octopus.title'), 90, oy, blink(3) ? P.red : P.white, { align: 'center', shadow: P.ink });
        F.draw(ctx, t('ui.dive.octopus.warn', { sec: Math.max(1, Math.ceil(tLeft)) }), 90, oy + 11, P.greyLight, { align: 'center', small: true, shadow: P.ink, maxWidth: PW - 8 });
        S.vis.octo = 'warn';
      } else {
        F.draw(ctx, t('ui.dive.octopus.shake'), 90, oy, blink(2) ? P.yellow : P.white, { align: 'center', shadow: P.ink });
        F.draw(ctx, o.shakes + ' / ' + T.octopusShakes, 90, oy + 11, P.greyLight, { align: 'center', small: true, shadow: P.ink });
        S.vis.octo = 'shake';
      }
    }
    drawEdgeWarnings(ctx, d);
    // počet ďalších rýb na vlasci, ktoré sa pod háčik nezmestili
    if (S.hang && S.hang.more > 0 && S.hang.list.length) {
      var hr = 0;
      for (var hi = 0; hi < S.hang.list.length; hi++) hr = Math.max(hr, S.hang.list[hi].x + S.hang.list[hi].w);
      F.draw(ctx, '+' + S.hang.more, Math.min(PW - 16, hr + 3), S.hang.topY + 2, P.white, { small: true, shadow: P.ink });
    }
    if (d.shadowEel && d.state === 'dive') {
      var st = d.shadowEel.still || 0;
      if (st > 1.2) {
        var fr = U.clamp01(st / T.eelStillSec);
        if (blink(1 + fr * 5)) F.draw(ctx, t('ui.dive.eel.move'), 90, hp.y + 26, P.red, { align: 'center', scale: 2, shadow: P.ink });
        D.bar(ctx, 60, hp.y + 50, 60, 5, fr, P.red, P.navy, P.ink);
      }
    }
  }

  // ------------------------------------------------------------------ HUD (dizajn 15.3)
  // Bezpečné napätie je TYRKYSOVÉ, nie zelené: zelená je v ponore výhradne "ťukaj teraz" (kontrolka
  // a palec v boji). Zelený oblúk počas ŤAHÁ hovoril opak červeného tlačidla (kritik D3).
  function arcColor(level) {
    if (level >= 3) return blink(4) ? P.red : P.white;
    return level === 2 ? P.red : level === 1 ? P.yellow : P.cyan;
  }
  function drawTop(ctx, d) {
    // počas výstupu sim napätie neprepočítava — oblúk by ukazoval násobok z hĺbky, kde už háčik nie je
    var env = d.env, tn = (d.state === 'ascend' || d.state === 'over') ? HL.tension.compute(d) : d.tension;
    D.rect(ctx, 0, 0, PW, TOP_H, P.ink);
    D.rect(ctx, 0, TOP_H, PW, 1, P.slateDark);
    // hrb pod oblúkom napätia + štítok s hodnotou
    ctx.save();
    ctx.beginPath(); ctx.rect(0, TOP_H, PW, ARC.y - TOP_H + 1); ctx.clip();
    D.circle(ctx, ARC.x, ARC.y, ARC.r + 4, P.slateDark);
    D.circle(ctx, ARC.x, ARC.y, ARC.r + 3, P.ink);
    ctx.restore();
    D.rect(ctx, ARC.x - 33, ARC.y, 66, 12, P.slateDark);
    D.rect(ctx, ARC.x - 32, ARC.y, 64, 11, P.ink);
    // Oblúk: podklad s PEVNÝMI pásmami (od warn1 jantárové, od warn2 červené), výplň podľa napätia
    // a zárezy prahov. Pásma sú vidno aj pri prázdnom vlasci — hráč vie, kde začína nebezpečenstvo,
    // skôr než k nemu výplň dorastie (kritik TOP-2: predtým bol oblúk sivý až do prasknutia).
    // Kritik D7 (napätie 90 %): zvyšok oblúka bol tmavočervený hneď vedľa červenej výplne. Prázdna
    // dráha je teraz navy a pásma prahov len 2-px VONKAJŠÍ lem — výplň (celá hrúbka) sa od zvyšku
    // líši pri každom napätí a pásma vidno aj pri prázdnom vlasci.
    var A0 = Math.PI, RIM = 2;
    D.arc(ctx, ARC.x, ARC.y, ARC.r, A0, 2 * Math.PI, ARC.t, P.navy);
    D.arc(ctx, ARC.x, ARC.y, ARC.r, A0, A0 + T.warn1 * Math.PI, RIM, P.slateDark);
    D.arc(ctx, ARC.x, ARC.y, ARC.r, A0 + T.warn1 * Math.PI, A0 + T.warn2 * Math.PI, RIM, P.rust);
    D.arc(ctx, ARC.x, ARC.y, ARC.r, A0 + T.warn2 * Math.PI, 2 * Math.PI, RIM, P.redDark);
    var frac = U.clamp01(tn.ratio);
    if (frac > 0.005) D.arc(ctx, ARC.x, ARC.y, ARC.r, A0, A0 + frac * Math.PI, ARC.t, arcColor(tn.level));
    [T.warn1, T.warn2, T.warn3].forEach(function (w, i) {
      var a = A0 + w * Math.PI, ca = Math.cos(a), sa = Math.sin(a);
      // zárez cez celú hrúbku oblúka (atrament) a ryska von z neho vo farbe prahu
      for (var rr = ARC.r - ARC.t + 0.5; rr <= ARC.r + 3; rr += 0.5) {
        D.px(ctx, Math.round(ARC.x + ca * rr), Math.round(ARC.y + sa * rr), rr <= ARC.r ? P.ink : i === 0 ? P.amber : i === 1 ? P.red : P.white);
      }
    });
    // '↓×1,1' = hĺbkový násobok (šípka = hĺbka; slovo by sa do oblúka nezmestilo — vysvetľuje ho rada 'tension').
    F.draw(ctx, '↓' + mult(tn.depthMult || 1), ARC.x, ARC.y - 9, P.grey, { small: true, align: 'center' });
    var lab = t('ui.dive.loadKg', { total: num(tn.total), strength: num(tn.strength) });
    // Číslo ostáva svetlé aj v červenom stave: červený text na tmavom mal 4,3:1 — červenú nesie oblúk, vlasec a rám.
    F.draw(ctx, lab, ARC.x, ARC.y + 2, tn.level >= 1 ? P.yellow : P.white, { small: true, align: 'center', maxWidth: 62 });

    // pauza + pásmo vľavo
    HL.w.button(ctx, 'pause', 2, 2, 18, 14, 'II', { small: true, nav: false }); // i18n-ok: znak pauzy
    var z = HL.world.zoneAt(d.hook.depth, d.mode === 'endless', d.location);
    // krátke meno pásma (jazero: Jazero/Hala/Šachta — celé meno sa do lišty nezmestí, ukáže ho nápis pásma)
    F.draw(ctx, z.short || z.name, 23, 6, P[ZONE_TEXT[z.id] || 'grey'], { small: true, maxWidth: ARC.x - 30 - 23 });
    // čas, počasie, mesiac vpravo
    var clock = HL.world.clockLabel(d.clock);
    var cw = F.measure(clock);
    F.draw(ctx, clock, PW - 3 - cw, 4, P.white);
    var wx = PW - 3 - cw - 14;
    if (!clearNight(env)) { D.sprite(ctx, HL.spr.get('icon_' + env.weather), wx, 3); wx -= 14; }
    if (env.period === 'night') D.sprite(ctx, HL.spr.get('moon_' + env.moon), wx, 3);
  }

  function gaugeScale(d) {
    if (d.mode === 'endless') return Math.max(1500, Math.ceil((d.hook.depth * 1.4 + 1) / 500) * 500);
    return HL.world.location(d.location).floor;
  }
  function gY(depth, scale, y0, h) { return y0 + Math.round(Math.sqrt(U.clamp01(depth / scale)) * h); }

  // Hĺbkomer: odmocninová mierka, aby boli vidno všetky pásma (Plytčina je 50 m z 3 000).
  function drawGaugeBar(ctx, d, x, y0, h, wide) {
    var scale = gaugeScale(d), Z = HL.world.location(d.location).zones, bw = wide ? 7 : 5;
    D.rect(ctx, x - 1, y0 - 1, bw + 2, h + 2, P.ink);
    for (var i = 0; i < Z.length; i++) {
      if (Z[i].endlessOnly && d.mode !== 'endless') continue;
      if (Z[i].from >= scale) continue;
      var a = gY(Z[i].from, scale, y0, h), b = gY(Math.min(Z[i].to, scale), scale, y0, h);
      D.rect(ctx, x, a, bw, b - a, P[ZONE_COL[Z[i].id]]);
      if (i) D.rect(ctx, x, a, bw, 1, P.ink);
    }
    var md = d.line.maxDepth;
    if (isFinite(md) && md < scale) {
      var ym = gY(md, scale, y0, h);
      D.dither(ctx, x, ym, bw, y0 + h - ym, P.ink, 0.75);
      D.rect(ctx, x - 1, ym, bw + 2, 1, P.red);
    }
    if (d.maxDepthReached > 0) D.rect(ctx, x, gY(d.maxDepthReached, scale, y0, h), bw, 1, P.white);
    var yc = gY(Math.max(0, d.hook.depth), scale, y0, h);
    D.rect(ctx, x - 1, yc - 1, bw + 2, 3, P.ink);
    D.rect(ctx, x, yc, bw, 1, P.yellow);
    return yc;
  }

  function drawGauge(ctx, d) {
    var yc = drawGaugeBar(ctx, d, GAUGE.x, GAUGE.y, GAUGE.h, false);
    var txt = U.meters(Math.max(0, d.hook.depth));
    var tw = F.measure(txt, { small: true });
    var ly = U.clamp(yc - 4, GAUGE.y - 4, GAUGE.y + GAUGE.h - 4);
    D.rect(ctx, GAUGE.x + 6, ly - 1, tw + 4, 9, P.ink);
    F.draw(ctx, txt, GAUGE.x + 8, ly, P.yellow, { small: true });
  }

  function mostValuable(d) {
    var best = null, bv = -Infinity;
    for (var i = 0; i < d.onLine.length; i++) { var v = priceOf(d.onLine[i]); if (v > bv) { bv = v; best = d.onLine[i]; } }
    return best;
  }
  // Spodný okraj stĺpca úlovku (varovanie pred žralokom sa kreslí pod neho).
  function catchBottom(d) {
    var n = d.onLine.length;
    return n ? 46 + Math.min(n, 8) * 11 + 2 + (n > 8 ? 9 : 0) : 0;
  }
  function drawCatchColumn(ctx, d) {
    var n = d.onLine.length;
    if (!n) return;
    var rows = Math.min(n, 8), x = 158, y0 = 46, rh = 11, extra = n > 8 ? 9 : 0;
    // žralok vo varovaní: rámik okolo ryby, ktorú zje (vždy tá najcennejšia — dizajn 9.2)
    var eat = d.shark && d.shark.phase === 'warn' ? mostValuable(d) : null;
    D.rect(ctx, x, y0 - 2, 21, rows * rh + 3 + extra, P.slateDark);
    D.rect(ctx, x + 1, y0 - 1, 19, rows * rh + 1 + extra, P.ink);
    for (var i = 0; i < rows; i++) {
      var it = d.onLine[n - 1 - i], th = HL.ui.thumb(it.id, 16, 9);
      var yy = y0 + i * rh;
      if (it === eat && blink(3)) D.rect(ctx, x + 1, yy - 1, 19, rh, P.redDark);
      D.sprite(ctx, th, x + 10 - Math.floor(th.width / 2), yy + 4 - Math.floor(th.height / 2));
    }
    if (n > 8) F.draw(ctx, '+' + (n - 8), x + 10, y0 + rows * rh, P.greyLight, { small: true, align: 'center' });
  }

  function drawBottom(ctx, d, interactive) {
    D.rect(ctx, 0, BAR_Y, PW, H - BAR_Y, P.ink);
    D.rect(ctx, 0, BAR_Y, PW, 1, P.slateDark);
    // návnada a harpúny
    D.sprite(ctx, HL.spr.get('bait_' + d.bait.id), 5, BAR_Y + 4);
    // neobmedzená návnada (červík, zmes) nemá počet — v písme nie je ∞, tak aspoň jej meno
    var bd = U.byId(HL.data.baits)[d.bait.id];
    if (isFinite(d.bait.count)) F.draw(ctx, t('ui.dive.count', { count: d.bait.count }), 19, BAR_Y + 7, d.bait.count > 0 ? P.white : P.red, { small: true });
    else F.draw(ctx, bd ? bd.name : t('ui.dive.baitMixShort'), 19, BAR_Y + 7, P.greyLight, { small: true, maxWidth: 36 });
    D.sprite(ctx, HL.spr.get('harpoon'), 3, BAR_Y + 20);
    F.draw(ctx, t('ui.dive.count', { count: d.harpoons }), 27, BAR_Y + 20, d.harpoons > 0 ? P.white : P.slate, { small: true });
    // Veľké tlačidlo pre palec: mimo boja HORE, počas boja OVLÁDAČ BOJA (review #11/#32, kritik TOP-1).
    // V boji NIE JE widget — stlačenie teda nezje vrstva tlačidiel a readInput ho počíta ako ťuknutie
    // do rytmu (predtým zamknuté HORE s nápisom BOJ ťuk zahodilo a sim hlásil 'upBlocked').
    if (d.state === 'fight' && d.fight) {
      drawFightPad(ctx, d, !interactive);
    } else if (interactive) {
      var locked = upLocked(d);
      var upLab = t('ui.dive.up');
      HL.w.button(ctx, 'up', UP_BTN.x, UP_BTN.y, UP_BTN.w, UP_BTN.h, upLab,
        { style: 'primary', disabled: locked, icon: 'icon_up', nav: false });
      S.vis.thumb = { mode: locked ? 'locked' : 'up', label: upLab };
    } else {
      D.rect(ctx, UP_BTN.x + 1, UP_BTN.y, UP_BTN.w - 2, UP_BTN.h, P.slateDark);
      var offLab = t('ui.dive.up');
      F.draw(ctx, offLab, UP_BTN.x + UP_BTN.w / 2, UP_BTN.y + 9, P.slate, { align: 'center' });
      S.vis.thumb = { mode: 'off', label: offLab };
    }
    // úlovok (riadok nápisu nesie aj bonus za veľký úlovok — drawCatchLabel)
    var n = d.onLine.length;
    drawCatchLabel(ctx, d, n);
    F.draw(ctx, U.money(HL.dive.value(d)), 177, BAR_Y + 12, n ? P.yellow : P.slate, { align: 'right', maxWidth: 52 });
    F.draw(ctx, fishWord(n), 177, BAR_Y + 24, P.greyLight, { small: true, align: 'right', maxWidth: 52 });
  }

  // Bonus za veľký úlovok (HL.game.haulBonus, sim/game.js) v riadku nápisu Úlovok nad hodnotou úlovku. Len v BONUSOVOM
  // ponore (d.haul — hráč ho zapol v Príprave; útek ryby tam vezme všetko), vypláca sa pri vynorení:
  // - od prvého stupňa jantárový štítok „+10 %" VĽAVO od nápisu; keď sa vedľa nezmestí (dlhý nápis jazyka, posuvník
  //   nad 99 %), nápis nahradí — štítok nesiahne pod tlačidlo HORE (pravý stĺpec lišty je CATCH_L … CATCH_R),
  // - pred prvým stupňom nápoveda „Bonus od 10" NAMIESTO nápisu (vedľa sa nezmestí v žiadnom jazyku) — len kým ho nesená
  //   návnada ešte dosiahne (každý boj zje kus; revízia 2026-10-04: sľubovala bonus, keď už nebolo čím loviť).
  // Bez bonusu je riadok presne ten istý ako predtým. Hodnota a počet rýb pod ním ostávajú. S.vis.haul = čo sa nakreslilo.
  var CATCH_R = 177, CATCH_L = UP_BTN.x + UP_BTN.w + 1;
  function haulHud(d, n) {
    if (!d.haul || d.mode !== 'career' || !HL.game.haulBonus) return null;
    var hb = HL.game.haulBonus(n), bait = d.bait ? d.bait.count : 0;
    if (hb.level >= 1 && hb.pct > 0) return { kind: 'badge', level: hb.level, text: '+' + U.pct(hb.pct) };
    if (hb.level === 0 && hb.next != null && (!isFinite(bait) || n + bait >= hb.next)) return { kind: 'hint', level: 0, next: hb.next, text: t('ui.dive.haulHint', { next: hb.next }) };
    return null;
  }
  function drawCatchLabel(ctx, d, n) {
    var sm = { small: true }, y = BAR_Y + 4, lab = t('ui.dive.catchLabel'), hs = haulHud(d, n), labOn = true;
    if (hs && hs.kind === 'badge') {
      var bw = F.measure(hs.text, sm) + 4, bx = CATCH_R - F.measure(lab, sm) - 2 - bw;
      if (bx < CATCH_L) { bx = CATCH_R - bw; labOn = false; }
      D.rect(ctx, bx, y, bw, 8, P.amber);
      F.draw(ctx, hs.text, bx + 2, y, P.ink, sm);
      hs.x = bx; hs.w = bw;
    } else if (hs) {
      labOn = false;
      F.draw(ctx, hs.text, CATCH_R, y, P.amber, { small: true, align: 'right', maxWidth: CATCH_R - CATCH_L });
    }
    if (labOn) F.draw(ctx, lab, CATCH_R, y, P.grey, { small: true, align: 'right' });
    if (hs) hs.label = labOn;
    S.vis.haul = hs;
  }

  // Ovládač boja na mieste HORE: zelený "ŤUKAJ!" keď ryba povolí, červený "ČAKAJ" keď ťahá.
  // Kreslí sa ako tlačidlo (je to to, čo sa stláča), stlačený prst ho vtlačí, dobré/zlé ťuknutie
  // blikne rámom. Farbu fázy nesie on — ukazovateľ v paneli boja je už len kontrolka.
  function drawFightPad(ctx, d, dim) {
    var f = d.fight, b = UP_BTN, slack = f.phase === 'slack';
    var label = slack ? t('ui.dive.pad.tap') : t('ui.dive.pad.wait');
    var fl = f.flash && f.t - f.flash.t < 0.14 ? f.flash.kind : null;
    var st = dim ? { fill: P.slateDark, shade: P.navy, hl: P.slateDark, text: P.slate }
      : slack ? { fill: P.greenLight, shade: P.green, hl: P.white, text: P.ink }
      : { fill: P.red, shade: P.redDark, hl: P.pink, text: P.white, shadow: P.redDark };
    var down = false, ptrs = HL.input.pointers || {};
    for (var k in ptrs) { var e = ptrs[k]; if (e.x >= b.x && e.x < b.x + b.w && e.y >= b.y && e.y < b.y + b.h) down = true; }
    var edge = fl === 'good' ? P.white : fl === 'bad' ? P.magenta : P.ink;
    D.rect(ctx, b.x + 1, b.y, b.w - 2, b.h, edge);
    D.rect(ctx, b.x, b.y + 1, b.w, b.h - 2, edge);
    if (down && !dim) {
      D.rect(ctx, b.x + 1, b.y + 1, b.w - 2, 1, st.shade);
      D.rect(ctx, b.x + 1, b.y + 2, b.w - 2, b.h - 3, st.shade);
    } else {
      D.rect(ctx, b.x + 1, b.y + 1, b.w - 2, b.h - 2, st.shade);
      D.rect(ctx, b.x + 1, b.y + 1, b.w - 2, b.h - 3, st.fill);
      D.rect(ctx, b.x + 2, b.y + 1, b.w - 4, 1, st.hl);
    }
    F.draw(ctx, label, b.x + b.w / 2, b.y + Math.floor((b.h - 2) / 2) - 5 + (down ? 1 : 0), st.text, { align: 'center', shadow: st.shadow });
    S.vis.thumb = { mode: 'fight', label: label };
  }

  function drawHarpoonButton(ctx, d) {
    var r = harpoonRect(d);
    if (r) HL.w.button(ctx, 'harpoon', r.x, r.y, r.w, r.h, t('ui.dive.harpoon'), { style: 'danger', nav: false });
  }

  // t(key) s jedným zástupným menom skráteným výpustkou tak, aby sa celý text zmestil do maxW —
  // zvyšok vety (čísla, fáza) ostane celý. Keď sa text zmestí, je to presne t(key, …).
  function fitParam(key, name, value, params, maxW, opts) {
    var p = {}, k;
    for (k in params) p[k] = params[k];
    p[name] = value;
    var full = t(key, p);
    if (F.measure(full, opts) <= maxW) return full;
    F.fit(full, maxW, opts); // len záznam do HL.font.truncated — skrátenie ostane viditeľné pre lang_check
    var chars = Array.from(String(value));
    while (chars.length > 1) {
      chars.pop();
      while (chars.length > 1 && /[\s:·,]$/.test(chars[chars.length - 1])) chars.pop();
      p[name] = chars.join('') + '…';
      var s = t(key, p);
      if (F.measure(s, opts) <= maxW) return s;
    }
    return full; // ani 1 znak mena sa nezmestí — skráti sa celý riadok (maxWidth pri kreslení)
  }

  // ------------------------------------------------------------------ boj (dizajn 5.3, 15.4)
  function drawFight(ctx, d) {
    var f = d.fight, ff = d.fightFish;
    if (!f || !ff) return;
    var save = HL.game.save, sp = f.species;
    D.panel(ctx, FP.x, FP.y, FP.w, FP.h, 'dark');
    F.draw(ctx, sp.name + '  ' + U.kg(ff.w), 90, FP.y + 3, f.legend ? P.yellow : P.white, { align: 'center', maxWidth: FP.w - 10 });
    // Názov rytmu až keď druh pozná (dizajn 5.4: "pri ďalšom stretnutí ho spozná").
    var known = !!((save.encyclopedia && save.encyclopedia[sp.id]) || (save.legends && save.legends[sp.id]));
    var rn = known ? f.rhythmName : t('ui.dive.fight.rhythmUnknown');
    // Obtiažnosť boja (sim/fight.js: hĺbka, vzácnosť, váha kusu) = 1–5 bodiek vpravo v riadku rytmu.
    // Text rytmu je vycentrovaný a nesmie do nich vbehnúť (maxWidth z oboch strán).
    var dots = HL.ui.diffDots(f.difficulty), dw = 5 * 3 + 4, lhSub = F.lineHeight({ small: true });
    var subW = FP.w - 10 - 2 * (dw + 3);
    // Legenda: keď sa riadok nezmestí, skráti sa NÁZOV rytmu, fáza ostane celá (výpustka celého riadka
    // brala práve "Fáza 1/3" — v slovenčine pri 8 z 15 rytmov, v nemčine pri 6).
    var sub = f.legend ? fitParam('ui.dive.fight.rhythmBoss', 'name', rn, { phase: f.bossPhase + 1, of: f.bossPhases || 3 }, subW, { small: true })
      : t('ui.dive.fight.rhythm', { name: rn });
    F.draw(ctx, sub, 90, FP.y + 15, P.grey, { small: true, align: 'center', maxWidth: subW });
    var dx0 = FP.x + FP.w - 5 - dw, dy0 = FP.y + 15 + Math.max(0, Math.floor((lhSub - 3) / 2));
    for (var di = 0; di < 5; di++) D.rect(ctx, dx0 + di * 4, dy0, 3, 3, di < dots ? (dots >= 4 ? P.orange : P.amber) : P.slateDark);
    if (S.lay) S.lay.diff = { dots: dots, x: dx0, y: dy0, w: dw, h: 3 };

    // Kontrolka fázy: stav ryby (ŤAHÁ / POVOLÍ) a rad svetielok vo farbe fázy. Zámerne bez plastického
    // okraja a bez rozkazu — veľký zelený/červený obdĺžnik s "ŤUKAJ!" vyzeral ako druhé tlačidlo
    // (kritik TOP-1); stláča sa tlačidlo pre palec dole, to nesie "ŤUKAJ!" / "ČAKAJ".
    // Kritik kolo 2 (D3): návod "Ťukaj, keď svieti ZELENÁ" sedel na tri zelené veci. Zelenú teraz nesú
    // IBA svetielka a palec, obe v tej istej chvíli; menovka je biela, pás histórie rytmu je preč
    // (bol to tretí, nepomenovaný ukazovateľ — D7) a bezpečné napätie na oblúku je tyrkysové.
    var ix = FP.x + 4, iy = FP.y + 24, iw = FP.w - 8, ih = 13, pull = f.phase === 'pull';
    var fl = f.flash && f.t - f.flash.t < 0.14 ? f.flash.kind : null;
    var lamp = fl === 'good' ? P.white : fl === 'bad' ? P.magenta : pull ? P.red : P.greenLight;
    var lab = pull ? t('ui.dive.fight.pull') : t('ui.dive.fight.slack'), sm = { small: true };
    D.rect(ctx, ix, iy, iw, ih, P.ink);
    F.draw(ctx, lab, ix + 3, iy + 3, P.white, sm);
    var lx0 = ix + 3 + Math.max(F.measure(t('ui.dive.fight.pull'), sm), F.measure(t('ui.dive.fight.slack'), sm)) + 5;
    for (var lx = lx0; lx + 4 <= ix + iw - 2; lx += 6) D.rect(ctx, lx, iy + 3, 4, ih - 6, lamp);
    var meters = [{ id: 'lamps', label: lab, x: ix, y: iy, w: iw, h: ih, labelY: iy + 3 }];

    // Postup chytania: menovka "Zaseknutie" a percentá v JEDNOM riadku NAD lištou (predtým "27 %"
    // viselo medzi dvoma lištami a nebolo jasné, ku ktorej patrí). Značky fáz legendy na lište.
    var lhR = F.lineHeight(), lhS = F.lineHeight(sm), py = iy + ih + 4, low = f.progress < 0.15;
    var pct = U.pct(f.progress), hookLab = t('ui.dive.fight.hooked');
    F.draw(ctx, hookLab, ix, py + (lhR - lhS), P.greyLight, sm);
    F.draw(ctx, pct, ix + iw, py, low ? P.red : P.amber, { align: 'right' });
    var by = py + lhR + 2, bh = 8;
    D.bar(ctx, ix, by, iw, bh, f.progress, low && blink(3) ? P.red : P.amber, P.navy, P.ink);
    // Stratený kus postupu po zlom ťuknutí svieti chvíľu červeno (od starej hodnoty po novú).
    if (S.lossAt != null && S.t - S.lossAt < 0.6 && S.lossFrom > f.progress) {
      var lx0 = ix + 1 + Math.round(f.progress * (iw - 2)), lx1 = ix + 1 + Math.round(S.lossFrom * (iw - 2));
      if (lx1 > lx0) D.rect(ctx, lx0, by + 1, lx1 - lx0, bh - 2, P.red);
    }
    for (var m = 0; m < (f.bossMarks || []).length; m++) {
      var mx = ix + 1 + Math.round(f.bossMarks[m] * (iw - 2));
      D.rect(ctx, mx, by - 1, 1, bh + 2, P.white);
    }
    meters.push({ id: 'progress', label: hookLab, x: ix, y: by, w: iw, h: bh, labelY: py,
      pct: { text: pct, y: py, right: ix + iw } });
    if (S.lay) { S.lay.meters = meters; S.lay.lamps = { x: ix, y: iy, w: iw, h: ih }; }

    // Čo táto ryba s vlascom najhoršie spraví: ťah v najsilnejšej fáze boja alebo visenie na vlasci
    // (dizajn 4; review #9 — predtým len visenie, legenda vo fáze 3 potom "bezpečne" pretrhla vlasec).
    var tn = d.tension, after = fightRiskKg(d), bad = after > tn.strength;
    var txt = t(bad ? 'ui.dive.fight.riskSnap' : 'ui.dive.fight.risk', { after: num(after), strength: num(tn.strength) });
    F.draw(ctx, txt, 90, by + bh + 4, bad ? (blink(2) ? P.red : P.orange) : P.greyLight, { small: true, align: 'center', maxWidth: FP.w - 8 });
  }

  // Štítok veľkosti kusu (veľký / trofejný) ako záložka na hornej hrane panela boja, vľavo (vpravo
  // býva tlačidlo harpúny). Trofej má odlesk: biely šikmý pás 2 px prejde štítkom každých
  // T.diveTierGlintSec — pohyb, nie ďalšia farba (len HL.pal). Malý a bežný kus štítok nemá.
  function drawTierBadge(ctx, tier) {
    var tg = HL.ui.tierTag(tier);
    if (!tg) { if (S.lay) S.lay.tier = null; return; }
    var label = tier === 'trofejny' ? tg[0] + '!' : tg[0], sm = { small: true };
    var w = F.measure(label, sm) + 6, h = 9, x = FP.x + 6, y = FP.y - 5;
    D.rect(ctx, x - 1, y - 1, w + 2, h + 2, P.ink);
    D.rect(ctx, x, y, w, h, P[tg[1]]);
    if (tier === 'trofejny' && T.diveTierGlintSec > 0) {
      var ph = (S.t % T.diveTierGlintSec) / T.diveTierGlintSec, bx = x - h + Math.round(ph * (w + 2 * h));
      for (var yy = 0; yy < h; yy++) {
        var gx = bx + (h - 1 - yy);                      // šikmo: hore vpravo, dole vľavo
        for (var k = 0; k < 2; k++) if (gx + k >= x && gx + k < x + w) D.rect(ctx, gx + k, y + yy, 1, 1, P.white);
      }
    }
    F.draw(ctx, label, x + 3, y + 1, P[tg[2]], sm);
    if (S.lay) S.lay.tier = { tier: tier, label: label, x: x, y: y, w: w, h: h };
  }

  // Na dotykovej obrazovke by "A / D alebo myš" nič nehovorilo — texty pre prst sú v data/text.js.
  var TOUCH_HINT = HL.data.tutorialTouch;
  function touchUi() {
    if (HL.input.pointer.touch) return true;
    try { return !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches); } catch (e) { return false; }
  }
  function hintText(key) { return (touchUi() && TOUCH_HINT[key]) || HL.data.tutorial[key]; }

  function harpoonRect(d) {
    if (!(d.shark && d.shark.phase === 'warn' && d.harpoons > 0)) return null;
    if (!(d.state === 'dive' || d.state === 'fight')) return null;
    return { x: HARP_BTN.x, y: d.state === 'fight' ? FP.y - HARP_BTN.h - 4 : HARP_BTN.y, w: HARP_BTN.w, h: HARP_BTN.h };
  }
  // Pás návodu: nad spodnou lištou, v boji nad panelom boja; keď svieti HARPÚNA, vľavo vedľa nej.
  function hintRect(d) {
    if (!S.hint) return null;
    var bottom = (d.state === 'fight' ? FP.y : BAR_Y) - 2, x = HINT.x, w = HINT.w;
    // štítok TROFEJ! / VEĽKÝ KUS trčí z hornej hrany panela boja o 6 px — návod ide nad neho
    if (d.state === 'fight' && d.fightFish && HL.ui.tierTag(d.fightFish.tier)) bottom -= 6;
    var hb = harpoonRect(d);
    if (hb) { w = Math.min(w, hb.x - 3 - x); bottom = Math.min(bottom, hb.y + hb.h); }
    var lines = F.wrap(hintText(S.hint), w - 10), h = lines.length * 11 + 6;
    return { x: x, y: bottom - h, w: w, h: h, lines: lines };
  }
  function drawHint(ctx, r) {
    if (!r) return;
    D.panel(ctx, r.x, r.y, r.w, r.h, 'dark');
    D.rect(ctx, r.x + 1, r.y + 1, 2, r.h - 2, P.amber);
    for (var i = 0; i < r.lines.length; i++) F.draw(ctx, r.lines[i], r.x + 6, r.y + 3 + i * 11, P.white);
  }

  // Nápis (pásmo, legenda, chytená) nesmie zakryť háčik ani ryby na ňom: mimo boja pod nimi,
  // v boji hore pod oblúkom (dole je panel boja), a vždy nad pásom návodu.
  function bannerRect(d) {
    if (!S.banners[0]) return null;
    var hy = Math.round(hookPos(d).y), y;
    if (d.state === 'fight') {
      y = TOP_H + 28;
      if (y + BANNER_H > hy - 26) y = FP.y - BANNER_H - 2;
    } else {
      var limit = (S.lay && S.lay.hint ? S.lay.hint.y : BAR_Y) - 2 - BANNER_H;
      y = Math.max(TOP_H + 28, Math.min(limit, hy + 80));
    }
    return { x: 0, y: y, w: PW, h: BANNER_H };
  }
  function drawBanner(ctx, d, r) {
    var b = S.banners[0];
    if (!b || !r) return false;
    var k = U.clamp01(b.t / 0.1), out = U.clamp01((T.diveBannerSec - b.t) / 0.12);
    var w = Math.round(PW * Math.min(k, out));
    if (w < 4) return false;
    var y = r.y, h = r.h, x = Math.round((PW - w) / 2);
    D.rect(ctx, x, y, w, h, P.ink);
    D.rect(ctx, x, y, w, 1, b.color);
    D.rect(ctx, x, y + h - 1, w, 1, b.color);
    if (w < PW - 8) return true;
    var big = F.measure(b.title, { scale: 2 }) <= PW - 12;
    F.draw(ctx, b.title, 90, y + (big ? 0 : 5), b.color, { align: 'center', scale: big ? 2 : 1, maxWidth: PW - 12 });
    if (b.sub) F.draw(ctx, b.sub, 90, y + 21, P.greyLight, { align: 'center', small: true, maxWidth: PW - 10 });
    return true;
  }
  // Nebezpečenstvá, ktoré pás nápisu prekryl, sa nakreslia znova (orezané na pás) — medúza v páse
  // nápisu musí byť vidno, nápis je len informácia (kritik: nápis POD nebezpečenstvami).
  function redrawHazardsIn(ctx, d, r, off) {
    ctx.save();
    ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
    ctx.translate(off.x, off.y);
    drawHazards(ctx, d, null, true);
    ctx.restore();
  }

  function drawSnapText(ctx, d) {
    if (!S.snap) return;
    var k = S.t - S.snap.t;
    var jx = k < 0.6 ? Math.round(Math.sin(k * 70) * 2) : 0;
    // pás pod nápisom: záblesk a tma okolo písmen robili z ťahov šum (fotka prasknutia)
    D.rect(ctx, 0, 112, PW, 64, P.ink);
    D.rect(ctx, 0, 112, PW, 1, P.red);
    D.rect(ctx, 0, 175, PW, 1, P.red);
    F.draw(ctx, t('ui.dive.snap.title'), 90 + jx, 116, P.red, { align: 'center', scale: 3, shadow: P.redDark });
    var lost = 0;
    for (var i = 0; i < d.lost.length; i++) if (d.lost[i].cause === 'snap') lost++;
    var sub = S.snap.cause === 'eel' ? t('ui.dive.snap.eel') : t('ui.dive.snap.tension');
    F.draw(ctx, sub, 90, 154, P.white, { align: 'center', shadow: P.ink, maxWidth: PW - 8 });
    F.draw(ctx, lost ? t('ui.dive.lost', { what: fishWord(lost) }) : t('ui.dive.snap.nothing'), 90, 166, P.greyLight, { align: 'center', small: true, shadow: P.ink });
  }

  // Okraje hernej plochy stupňujú varovanie (kritik TOP-2: warn2 a warn3 musia byť na pohľad iné):
  // od warn2 stály tenký červený rám, od warn3 (dizajn 4.2: 95 %) hrubší rám blikajúci s bielou
  // a pulzujúci červený lem.
  function drawEdges(ctx, d) {
    var tn = d.tension;
    if (!(d.state === 'dive' || d.state === 'fight') || tn.level < 2) return;
    var y0 = TOP_H + 1, h = BAR_Y - TOP_H - 1;
    if (tn.level >= 3) {
      var lv = 0.3 + 0.25 * Math.sin(S.t * 12);
      D.dither(ctx, 0, y0, 6, h, P.red, lv);
      D.dither(ctx, PW - 6, y0, 6, h, P.red, lv);
      D.dither(ctx, 6, y0, PW - 12, 4, P.red, lv);
      D.dither(ctx, 6, BAR_Y - 4, PW - 12, 4, P.red, lv);
    }
    var th = tn.level >= 3 ? 2 : 1, c = tn.level >= 3 && blink(5) ? P.white : P.red;
    D.rect(ctx, 0, y0, th, h, c);
    D.rect(ctx, PW - th, y0, th, h, c);
    D.rect(ctx, 0, y0, PW, th, c);
    D.rect(ctx, 0, BAR_Y - th, PW, th, c);
  }

  function drawPerk(ctx, d) {
    if (d.state !== 'perk' || !d.perkOffer) return;
    // blokuje kliky do sveta a spodnej lišty; horná lišta (pauza) ostáva živá
    HL.w.hit('perk_block', 0, TOP_H + 1, PW, H - TOP_H - 1, { nav: false });
    F.draw(ctx, t('ui.dive.perk.title'), 90, 62, P.cyan, { align: 'center', scale: 2, shadow: P.ink });
    F.draw(ctx, t('ui.dive.perk.sub', { depth: U.meters(S.perkDepth || d.hook.depth) }), 90, 88, P.greyLight, { align: 'center', small: true, maxWidth: PW - 8 });
    for (var k = 0; k < d.perkOffer.length && k < 3; k++) {
      var y = 102 + k * 52;
      HL.w.button(ctx, 'perk' + k, 10, y, 160, 46, '', { style: 'normal', autofocus: k === 0 });
      D.rect(ctx, 16, y + 16, 14, 14, P.amber);
      F.draw(ctx, String(k + 1), 23, y + 17, P.ink, { align: 'center' });
      var lines = F.wrap(nbsp(HL.endless.perkName(d.perkOffer[k])), 128).slice(0, 3);
      var ty = y + Math.round((44 - lines.length * 11) / 2);
      for (var i = 0; i < lines.length; i++) F.draw(ctx, lines[i], 36, ty + i * 11, P.white, { shadow: P.ink });
    }
  }

  function drawPause(ctx, d) {
    if (!S.paused) return;
    HL.w.hit('pause_block', 0, TOP_H + 1, PW, H - TOP_H - 1, { nav: false });
    D.panel(ctx, 18, 80, 144, 156);
    F.draw(ctx, t('ui.dive.pause.title'), 90, 88, P.white, { align: 'center', scale: 2, shadow: P.ink });
    HL.w.button(ctx, 'p_resume', 30, 116, 120, 28, t('ui.dive.pause.resume'), { style: 'primary', autofocus: true });
    HL.w.button(ctx, 'p_sound', 30, 150, 120, 24, soundOn() ? t('ui.dive.pause.soundOn') : t('ui.dive.pause.soundOff'));
    var canUp = d.state === 'dive';
    HL.w.button(ctx, 'p_up', 30, 180, 120, 24, t('ui.dive.pause.surface'), { disabled: !canUp });
    F.draw(ctx, canUp ? t('ui.dive.pause.hint') : t('ui.dive.pause.noSurface'), 90, 214, P.grey, { small: true, align: 'center', maxWidth: 136 });
  }

  // Stmavený svet pod pauzou/vylepšením sa počíta RAZ a ďalšie snímky ho len kopírujú: HL.draw.shade
  // číta pixely z plátna (getImageData) a každý snímok to stálo 3–5 ms aj na stolnom CPU.
  var DIM_Y = TOP_H + 1, DIM_H = BAR_Y - TOP_H - 1;
  function dimKey(d) { return S.paused ? 'p' + S.pauseAt : d.state === 'perk' ? 'k' + S.perkDepth : null; }
  function captureDim(ctx, key) {
    var c = D.canvas(PW, DIM_H);
    if (!c || !ctx.getTransform) return null;
    var m = ctx.getTransform(), cx = c.getContext('2d');
    cx.imageSmoothingEnabled = false;
    cx.drawImage(ctx.canvas, Math.round(m.e), Math.round(m.f + DIM_Y * m.d), Math.round(PW * m.a), Math.round(DIM_H * m.d), 0, 0, PW, DIM_H);
    return { key: key, c: c };
  }

  function drawScene(ctx, d) {
    S.cam = camPx(d);
    var overlay = S.paused || d.state === 'perk', dk = overlay ? dimKey(d) : null;
    if (overlay && S.dim && S.dim.key === dk) {
      ctx.drawImage(S.dim.c, 0, DIM_Y);
      drawHud(ctx, d, true, null);
      return;
    }
    var off = S.fx.offset();
    ctx.save();
    ctx.translate(off.x, off.y);
    var info = drawWorld(ctx, d);
    S.fx.draw(ctx, PW, H);
    ctx.restore();
    // Rozloženie snímku (aj pre sondu): návod, nápis a visiace ryby tak, aby sa neprekrývali.
    var hang = S.hang ? S.hang.list : [];
    var lay = S.lay = {
      hookY: Math.round(info.hp.y), hint: null, banner: null,
      fightPanel: d.state === 'fight' ? { x: FP.x, y: FP.y, w: FP.w, h: FP.h } : null,
      hang: hang.map(function (q) { return { id: q.id, x: q.x, y: q.y, w: q.w, h: q.h }; }),
      hangMore: S.hang ? S.hang.more : 0, edgeMarks: 0,
    };
    var hr = !overlay ? hintRect(d) : null;
    if (hr) lay.hint = { x: hr.x, y: hr.y, w: hr.w, h: hr.h };
    lay.banner = bannerRect(d);
    // Nápis sveta (pásmo, legenda) je POD nebezpečenstvami, varovným rámom a značkami, a POD
    // prístrojmi — hĺbkomer ho nesmie stratiť. Nebezpečenstvá, ktoré pás prekryl, sa v ňom nakreslia znova.
    if (lay.banner && drawBanner(ctx, d, lay.banner)) redrawHazardsIn(ctx, d, lay.banner, off);
    else lay.banner = null;
    drawEdges(ctx, d);
    drawMarkers(ctx, d, info);
    lay.edgeMarks = S.vis.edge;
    if (d.state === 'snapped' || (S.snap && S.summary)) drawSnapText(ctx, d);
    // Stmavenie pod pauzou/vylepšením len na svet — posunom po rampách palety (HL.draw.shade), nie
    // šachovnicou: tá cez text HUD robila z písmen šum a na 1× vyzerala ako špinavá mriežka.
    S.dim = null;
    if (overlay) {
      if (D.shade) { D.shade(ctx, 0, DIM_Y, PW, DIM_H, 3); S.dim = captureDim(ctx, dk); }
      else D.dither(ctx, 0, DIM_Y, PW, DIM_H, P.ink, 0.8125);
    }
    drawHud(ctx, d, overlay, hr);
  }
  function drawHud(ctx, d, overlay, hr) {
    drawTop(ctx, d);
    drawGauge(ctx, d);
    drawCatchColumn(ctx, d);
    drawBottom(ctx, d, !overlay);
    if (!overlay) drawHarpoonButton(ctx, d);
    if (d.state === 'fight') drawFight(ctx, d);
    if (!overlay) drawHint(ctx, hr);
    // štítok veľkosti kusu až nad návodom (inak by ho pás návodu prekryl — prvé ponory = nováčik)
    if (d.state === 'fight' && d.fight) drawTierBadge(ctx, d.fightFish && d.fightFish.tier);
    drawPerk(ctx, d);
    drawPause(ctx, d);
  }

  // ------------------------------------------------------------------ bočné panely (široká obrazovka)
  function panelLeft(ctx, d, w, h) {
    D.panel(ctx, 2, 2, w - 4, h - 4);
    var cx = Math.round(w / 2);
    F.draw(ctx, t('ui.dive.side.depth'), cx, 8, P.amber, { align: 'center' });
    F.draw(ctx, U.meters(Math.max(0, d.hook.depth)), cx, 20, P.white, { align: 'center', scale: 2, maxWidth: w - 10 });
    var z = HL.world.zoneAt(d.hook.depth, d.mode === 'endless', d.location);
    F.draw(ctx, z.name, cx, 45, P[ZONE_TEXT[z.id] || 'cyan'], { align: 'center', maxWidth: w - 12 });
    F.drawWrapped(ctx, z.desc, 8, 58, w - 16, P.grey, { small: true });
    // veľký hĺbkomer s menami pásiem
    var gy = 86, gh = 138, scale = gaugeScale(d), Z = HL.world.location(d.location).zones;
    drawGaugeBar(ctx, d, 10, gy, gh, true);
    for (var i = 0; i < Z.length; i++) {
      if ((Z[i].endlessOnly && d.mode !== 'endless') || Z[i].from >= scale) continue;
      var y = gY(Z[i].from, scale, gy, gh);
      F.draw(ctx, Z[i].name, 22, Math.min(y, gy + gh - 8), Z[i].id === z.id ? P.white : P.slate, { small: true, maxWidth: w - 28 });
    }
    var md = d.line.maxDepth;
    F.draw(ctx, isFinite(md) ? t('ui.dive.side.line', { depth: U.meters(md) }) : t('ui.dive.side.lineEndless'), 8, 230, P.pink, { small: true, maxWidth: w - 14 });
    F.draw(ctx, t('ui.dive.side.deepest', { depth: U.meters(d.maxDepthReached) }), 8, 239, P.greyLight, { small: true, maxWidth: w - 14 });
    var help = [
      [t('ui.dive.help.moveKeys'), t('ui.dive.help.move')], [t('ui.dive.help.sinkKeys'), t('ui.dive.help.sink')],
      [t('ui.dive.help.tapKeys'), t('ui.dive.help.tap')], ['W', t('ui.dive.help.up')], ['H', t('ui.dive.help.harpoon')],
      [HL.input.pauseKey(true), t('ui.dive.help.pause')], // mená kláves sa neprekladajú; na CrazyGames len P (core/input.js)
    ];
    F.draw(ctx, t('ui.dive.help.title'), 8, 252, P.amber, { small: true });
    for (var k = 0; k < help.length; k++) {
      F.draw(ctx, help[k][0], 8, 262 + k * 8.5, P.white, { small: true });
      F.draw(ctx, help[k][1], w - 8, 262 + k * 8.5, P.grey, { small: true, align: 'right' });
    }
  }

  // Vodorovná lišta napätia s tými istými pevnými pásmami a zárezmi ako oblúk (bočný panel).
  // Rovnaký jazyk ako oblúk: prázdna dráha navy, pásma prahov len 2-px spodný lem, výplň celá výška.
  function drawTensionBar(ctx, x, y, w, h, ratio, level) {
    D.rect(ctx, x - 1, y - 1, w + 2, h + 2, P.ink);
    var a = Math.round(w * T.warn1), b = Math.round(w * T.warn2), rim = 2;
    D.rect(ctx, x, y, w, h, P.navy);
    D.rect(ctx, x, y + h - rim, a, rim, P.slateDark);
    D.rect(ctx, x + a, y + h - rim, b - a, rim, P.rust);
    D.rect(ctx, x + b, y + h - rim, w - b, rim, P.redDark);
    var f = Math.round(w * U.clamp01(ratio));
    if (f > 0) D.rect(ctx, x, y, f, h, arcColor(level));
    [T.warn1, T.warn2, T.warn3].forEach(function (k, i) {
      D.rect(ctx, x + Math.round(w * k), y - 2, 1, h + 4, i === 0 ? P.amber : i === 1 ? P.red : P.white);
    });
  }
  // Zložky napätia v poradí zobrazenia (pri rovnakej záťaži rozhoduje toto poradie); meno až pri kreslení.
  var PARTS = ['fish', 'fight', 'spikes', 'jelly', 'octopus', 'hazard'];
  function partName(k) {
    return { fish: t('ui.dive.part.fish'), fight: t('ui.dive.part.fight'), spikes: t('ui.dive.part.spikes'), jelly: t('ui.dive.part.jelly'),
      octopus: t('ui.dive.part.octopus'), hazard: t('ui.dive.part.hazard') }[k];
  }

  // Pravý panel pod počasím bol z polovice prázdny (kritik D6, Polnoc na desktope). Čo žije v pásme
  // háčika a či na to berie nasadená návnada, čo tu hrozí a či tu býva legenda — podľa toho sa hráč
  // rozhoduje, či klesnúť. Nepoznaný druh = tieň a "???" (ako v encyklopédii). → y pod poslednou položkou
  function zoneInfo(d) {
    var endless = d.mode === 'endless', loc = HL.world.location(d.location), z = HL.world.zoneAt(Math.max(0, d.hook.depth), endless, d.location);
    var inZone = function (sp) { return sp.zone === z.id || (endless && z.id === 'nekonecna' && sp.zone === 'priepast'); };
    var fish = loc.fish.filter(function (sp) { return inZone(sp) && (!sp.event || sp.event === d.env.event); });
    fish.sort(function (a, b) { return (HL.world.matches(b, d.env) ? 1 : 0) - (HL.world.matches(a, d.env) ? 1 : 0) || b.price - a.price; });
    var legends = endless ? [] : loc.legends.filter(function (sp) { return inZone(sp) && (!sp.event || sp.event === d.env.event); });
    var dep = Math.max(0, d.hook.depth), hz = [], Hd = loc.hazards || {}, Pd = loc.predators || {};
    for (var hk in Hd) {
      var hv = Hd[hk];
      if (hv.weather ? hv.weather === d.env.weather : dep >= hv.from && dep <= hv.to) hz.push(hv.name);
    }
    for (var pk in Pd) if (dep >= Pd[pk].from) hz.push(Pd[pk].name);
    return { zone: z, fish: fish, legends: legends, hazards: hz };
  }
  function drawZoneInfo(ctx, d, x, y, w, maxY) {
    var zi = zoneInfo(d), save = HL.game.save, sm = { small: true }, enc = save.encyclopedia || {};
    D.rect(ctx, x, y - 6, w, 1, P.slateDark);
    F.draw(ctx, t('ui.dive.zone.title'), x, y, P.amber, sm);
    F.draw(ctx, t('ui.dive.zone.bait'), x + w, y, P.grey, { small: true, align: 'right' });
    y += 10;
    // Na čo tu berú (ideálna = 2 body, dobrá = 1 za druh pásma) — keď nasadená návnada nesedí,
    // hráč hneď vie, s čím sem prísť nabudúce. Počíta sa VOPRED, lebo zoznam rýb (pružná časť) musí nechať
    // miesto aj pre "Berú na" (aspoň 1 riadok): rezerva bola len na legendu a 1 riadok "Hrozí", "Berú na"
    // ju zjedlo a "Hrozí" v plnom paneli chýbalo celé (sk Súmrak) alebo prišlo o 2. riadok (en, hu).
    var score = [];
    HL.data.baits.forEach(function (b) {
      if (b.id === 'mix' || b.id === 'gold') return;   // zlatá patrí na legendy (ako bestBait)
      var s = 0;
      zi.fish.forEach(function (sp) { var mm = HL.dive.baitMatch(b.id, sp); s += mm === 'ideal' ? 2 : mm === 'ok' ? 1 : 0; });
      if (s > 0) score.push({ name: b.name, s: s, cur: b.id === d.bait.id });
    });
    score.sort(function (a, b) { return b.s - a.s; });
    var bestTxt = score.length ? t('ui.dive.zone.bites', { baits: score.slice(0, 2).map(function (q) { return HL.i18n.lower(q.name); }).join(', ') }) : '';
    var bl = score.length ? F.wrap(bestTxt, w, sm).slice(0, 2) : [];
    var hzLines = zi.hazards.length ? F.wrap(HL.i18n.lower(zi.hazards.join(', ')), w, sm) : [];
    // "Hrozí" dostane miesto na CELÝ zoznam (najviac 3 riadky): predátori idú na koniec zoznamu, takže
    // rezerva na 1 riadok skracovala práve žraloka ("medúza, ostrá skala, …" — lang_check, všetky jazyky).
    // Kratší je radšej zoznam rýb (pružná časť nad tým).
    var hzN = Math.min(hzLines.length, 3);
    var after = (hzN ? 12 + hzN * 8 : 0) + (zi.legends.length ? 10 : 0);   // legenda + "Hrozí" so všetkými riadkami
    var rh = 11, need = after + (bl.length ? 10 : 0);
    for (var i = 0; i < zi.fish.length && y + rh <= maxY - need; i++) {
      var sp = zi.fish[i], known = !!(enc[sp.id] && enc[sp.id].n > 0), can = HL.world.matches(sp, d.env);
      var th = known ? HL.ui.thumb(sp.id, 14, 8) : HL.ui.fit(HL.spr.silhouette(sp.id, 0, 'slate'), 'sil:' + sp.id, 14, 8);
      var m = HL.dive.baitMatch(d.bait.id, sp), ml = m === 'ideal' ? t('ui.dive.zone.ideal') : m === 'ok' ? t('ui.dive.zone.ok') : t('ui.dive.zone.no');
      // meno zalomené na najviac 2 riadky (orezané "Hlbinár s…" by bola ďalšia chyba D2)
      var nl = F.wrap(known ? sp.name : '???', w - 17 - F.measure(ml, sm) - 4, sm).slice(0, 2), rowH = Math.max(rh, nl.length * 8 + 3);
      if (y + rowH > maxY - need) break;
      if (th) D.sprite(ctx, th, x + 7 - Math.floor(th.width / 2), y + 3 - Math.floor(th.height / 2));
      for (var ni = 0; ni < nl.length; ni++) F.draw(ctx, nl[ni], x + 17, y + ni * 8, can ? P.white : P.slate, sm);
      F.draw(ctx, ml, x + w, y, m === 'ideal' ? P.yellow : m === 'ok' ? P.greyLight : P.slate, { small: true, align: 'right' });
      y += rowH;
    }
    if (score.length && y + 10 <= maxY) {
      // zalomené, nie orezané "…" (fotka: "Berú na: svietiaca návna…")
      if (y + bl.length * 8 + 2 > maxY - after) bl = F.wrap(t('ui.dive.zone.bites', { baits: HL.i18n.lower(score[0].name) }), w, sm).slice(0, 1);
      for (var bi = 0; bi < bl.length; bi++) F.draw(ctx, bl[bi], x, y + 1 + bi * 8, score[0].cur ? P.greyLight : P.yellow, sm);
      y += 2 + bl.length * 8;
    }
    if (zi.legends.length && y + 10 <= maxY) {
      var lg = zi.legends[0], got = !!(save.legends && save.legends[lg.id]) || !!(enc[lg.id] && enc[lg.id].n > 0);
      F.draw(ctx, t('ui.dive.zone.legend', { name: got ? lg.name : '???' }), x, y + 1, P.yellow, { small: true, maxWidth: w });
      y += 10;
    }
    if (zi.hazards.length && y + 18 <= maxY) {
      F.draw(ctx, t('ui.dive.zone.hazards'), x, y + 2, P.amber, sm);
      var fitN = Math.max(1, Math.floor((maxY - y - 11) / 8)), lines = hzLines.slice(0, fitN);
      // Keď sa celý zoznam nezmestí, posledný riadok končí celými položkami a " …" (nie ticho useknutý
      // "…, ostrá skala," ani "žr…"); F.fit len zapíše skrátenie do HL.font.truncated (lang_check ho vidí).
      if (hzLines.length > fitN) {
        F.fit(lines[fitN - 1] + ' ' + hzLines[fitN], w, sm);
        var last = lines[fitN - 1].replace(/,?\s*$/, ',');
        while (F.measure(last + ' …', sm) > w && last.lastIndexOf(',', last.length - 2) > 0) last = last.slice(0, last.lastIndexOf(',', last.length - 2) + 1);
        lines[fitN - 1] = F.measure(last + ' …', sm) <= w ? last + ' …' : F.fit(last, w, sm);
      }
      for (var k = 0; k < lines.length; k++) F.draw(ctx, lines[k], x, y + 11 + k * 8, P.greyLight, sm);
      y += 11 + lines.length * 8;
    }
    return y;
  }

  function panelRight(ctx, d, w, h) {
    D.panel(ctx, 2, 2, w - 4, h - 4);
    F.draw(ctx, t('ui.dive.side.catch'), 8, 8, P.amber);
    var n = d.onLine.length, y = 22, rows = Math.min(n, 4);
    if (!n) { F.draw(ctx, t('ui.dive.side.nothingYet'), 8, y, P.slate, { small: true }); y += 11; }
    for (var i = 0; i < rows; i++) {
      var it = d.onLine[n - 1 - i], sp = species(it.id), th = HL.ui.thumb(it.id, 16, 10);
      D.sprite(ctx, th, 16 - Math.floor(th.width / 2), y + 5 - Math.floor(th.height / 2));
      F.draw(ctx, sp ? sp.name : it.id, 28, y, P.white, { small: true, maxWidth: w - 36 });
      F.draw(ctx, U.kg(it.w), 28, y + 8, P.grey, { small: true });
      F.draw(ctx, U.money(priceOf(it)), w - 8, y + 8, P.yellow, { small: true, align: 'right' });
      y += 18;
    }
    if (n > rows) { F.draw(ctx, t('ui.dive.side.more', { count: n - rows }), 8, y, P.grey, { small: true }); y += 9; }
    D.rect(ctx, 8, y + 1, w - 16, 1, P.slateDark);
    F.draw(ctx, t('ui.dive.side.total'), 8, y + 5, P.greyLight, { small: true });
    F.draw(ctx, U.money(HL.dive.value(d)), w - 8, y + 4, P.yellow, { align: 'right' });
    y += 24;
    D.rect(ctx, 8, y - 6, w - 16, 1, P.slateDark);

    // NAPÄTIE: to isté, čo oblúk, ale s číslami a z čoho sa skladá — na širokej obrazovke bola
    // polovica panelu prázdna, kým hráč hľadal kilogramy v malom štítku pod oblúkom (kritik).
    var tn = (d.state === 'ascend' || d.state === 'over') ? HL.tension.compute(d) : d.tension;
    // číslo svetlé (žltá od warn1) — červenú nesie pás pod ním; červený text na tmavom mal len 4,3:1
    var pct = U.pct(U.clamp01(tn.ratio)), tc = tn.level >= 1 ? P.yellow : P.cyan;
    F.draw(ctx, t('ui.dive.side.tension'), 8, y, P.amber);
    F.draw(ctx, pct, w - 8, y, tc, { align: 'right' });
    drawTensionBar(ctx, 9, y + 12, w - 18, 6, tn.ratio, tn.level);
    F.draw(ctx, t('ui.dive.loadKg', { total: num(tn.total), strength: num(tn.strength) }), 8, y + 22, tn.level >= 1 ? P.yellow : P.white, { small: true, maxWidth: w - 44 });
    F.draw(ctx, t('ui.dive.side.depthMult', { mult: mult(tn.depthMult || 1) }), w - 8, y + 22, P.grey, { small: true, align: 'right' });
    var parts = [], pr = tn.parts || {};
    for (var pi = 0; pi < PARTS.length; pi++) { var pk = PARTS[pi]; if ((pr[pk] || 0) > 0.05) parts.push([pk, pr[pk]]); }
    parts.sort(function (a, b) { return b[1] - a[1]; });
    for (var q = 0; q < Math.min(3, parts.length); q++) {
      F.draw(ctx, partName(parts[q][0]), 8, y + 31 + q * 9, P.grey, { small: true, maxWidth: w - 44 });
      F.draw(ctx, U.kg(Math.max(0, parts[q][1])), w - 8, y + 31 + q * 9, P.greyLight, { small: true, align: 'right' });
    }
    y += 36 + Math.min(3, parts.length) * 9;
    D.rect(ctx, 8, y - 6, w - 16, 1, P.slateDark);

    var env = d.env;
    F.draw(ctx, HL.world.dayLabel(d.clock) + ' · ' + HL.world.clockLabel(d.clock), 8, y, P.white, { small: true, maxWidth: w - 14 });
    D.sprite(ctx, HL.spr.get(HL.world.weatherIcon(env.weather, env.m)), 8, y + 10);
    F.draw(ctx, weatherLabel(env), 24, y + 13, P.greyLight, { small: true, maxWidth: w - 30 });
    D.sprite(ctx, HL.spr.get('moon_' + env.moon), 8, y + 25);
    F.draw(ctx, HL.data.moonPhases[env.moon], 24, y + 28, P.greyLight, { small: true, maxWidth: w - 30 });
    y += 42;
    if (d.mode === 'career' && HL.village.level(HL.game.save, 'meteostanica') >= 1) {
      var fc = HL.village.forecast(HL.game.save, HL.world.env(HL.game.save, d.clock));
      F.draw(ctx, t('ui.dive.forecast.title'), 8, y, P.amber, { small: true });
      var segs = (fc.segments || []).slice(0, 3);
      for (var s = 0; s < segs.length; s++) {
        F.draw(ctx, (s ? t('ui.dive.forecast.from', { time: HL.world.clockLabel(segs[s].from) }) : t('ui.dive.forecast.now')), 8, y + 9 + s * 9, P.grey, { small: true });
        F.draw(ctx, HL.world.weatherName(segs[s].weather, segs[s].from), w - 8, y + 9 + s * 9, P.white, { small: true, align: 'right' });
      }
      y += 12 + segs.length * 9;
    }
    if (h - 54 - y >= 24) y = drawZoneInfo(ctx, d, 8, y + 4, w - 16, h - 54);
    y = Math.max(y + 4, h - 50);
    var bd = U.byId(HL.data.baits)[d.bait.id];
    D.sprite(ctx, HL.spr.get('bait_' + d.bait.id), 8, y);
    F.draw(ctx, bd ? bd.name : t('ui.dive.side.baitMix'), 24, y + 1, P.white, { small: true, maxWidth: w - 30 });
    F.draw(ctx, isFinite(d.bait.count) ? t('ui.dive.side.baitLeft', { count: d.bait.count }) : t('ui.dive.side.baitUnlimited'), 24, y + 9, P.grey, { small: true, maxWidth: w - 30 });
    F.draw(ctx, t('ui.dive.side.harpoons', { count: d.harpoons }), 8, y + 22, d.harpoons ? P.white : P.slate, { small: true });
    var lineTxt = t(d.line.damage > 0 ? 'ui.dive.side.lineKgDamaged' : 'ui.dive.side.lineKg', { kg: U.kg(Math.max(0, d.line.strength)) });
    F.draw(ctx, lineTxt, 8, y + 31, d.line.damage > 0 ? P.orange : P.greyLight, { small: true, maxWidth: w - 14 });
  }

  // ================================================================== karta na hladine
  // Po konci kariérneho ponoru (vyplával aj prasklo) scéna NEODCHÁDZA: kamera sa vráti k hladine,
  // háčik visí na špičke prúta a karta povie, čo sa stalo a kam išiel úlovok (finishDive ho už
  // uložil do Chatrče a nadbytok predal). Ďalej: PONORIŤ SA ZNOVA (alebo podržať S / prst na vode —
  // háčik ide len dole) s návnadou z čipu, alebo PRÍSTAV (dedina a súhrn výletu).
  // Rozloženie (logické px): hladina T.diveSurfWaterY, karta pod ňou po čip návnady (SURF_CHIP_Y),
  // spodná lišta: PONORIŤ SA ZNOVA (palec) + PRÍSTAV.
  var SURF_CHIP_Y = 254, SURF_CHIP_H = 26;
  var CARD_X = 6, CARD_W = 168, CARD_IN = CARD_W - 12;
  var AGAIN_BTN = { x: 6, y: 289, w: 112, h: 29 }, HARBOUR_BTN = { x: 122, y: 289, w: 52, h: 29 };

  function baitData(id) { return U.byId(HL.data.baits)[id] || null; }
  // "Svietiaca návnada" → "Svietiaca" (čip už hovorí "Návnada:"; fotka: "Návnada: Svietiaca návnada ×20").
  // Vynechané slovo je v tabuľke jazyka (ui.dive.card.baitNoun; prázdne = nič sa nevynecháva).
  function baitName(id) {
    var b = baitData(id);
    if (!b) return String(id);
    var noun = t('ui.dive.card.baitNoun'), suf = noun ? ' ' + noun : '';
    return suf && b.name.slice(-suf.length) === suf ? b.name.slice(0, -suf.length) : b.name;
  }
  // Návnady, ktoré hráč má: červík vždy, ostatné so zásobou > 0 (tak ako karty v Príprave).
  function ownedBaits() {
    var s = HL.game.save;
    return HL.data.baits.filter(function (b) { return b.infinite || (s.baits[b.id] || 0) > 0; }).map(function (b) { return b.id; });
  }
  // Ďalšia vlastnená návnada za `from` v poradí HL.data.baits, dokola (červík je vždy).
  function nextBait(from) {
    var own = ownedBaits(), order = HL.data.baits.map(function (b) { return b.id; });
    var i0 = order.indexOf(from), n = order.length;
    for (var k = 1; k <= n; k++) {
      var id = order[(i0 + k + n) % n];
      if (own.indexOf(id) >= 0) return id;
    }
    return 'worm';
  }
  // Čip "Návnada: …": jazyky s podstatným menom VPREDU (es "Cebo luminoso", fr "Appât lumineux") by
  // písali "Cebo: Cebo luminoso" — tu sa vynechá aj slovo na začiatku ("Cebo: luminoso"). Len čip;
  // veta o došlej návnade (baitName) meno nechá celé.
  function chipName(id) {
    var name = baitName(id), noun = t('ui.dive.card.baitNoun');
    if (noun && name.length > noun.length + 1 && name.slice(0, noun.length + 1).toLocaleLowerCase() === (noun + ' ').toLocaleLowerCase()) return name.slice(noun.length + 1);
    return name;
  }
  function baitLabel(id) {
    var b = baitData(id);
    return b && b.infinite ? t('ui.dive.card.bait', { name: chipName(id) })
      : t('ui.dive.card.baitCount', { name: chipName(id), count: HL.game.save.baits[id] || 0 });
  }

  function openSurface() {
    var sum = S.summary, res = sum.result, prev = res.baitId || S.d.bait.id;
    // Došla návnada tohto ponoru → sama sa nasadí ďalšia vlastnená a karta to povie.
    var bait = ownedBaits().indexOf(prev) >= 0 ? prev : nextBait(prev);
    S.surf = {
      sum: sum, t: 0, hold: 0, keyArmed: false, fresh: {}, bait: bait,
      ran: bait !== prev ? { from: prev, to: bait } : null,
      snap: S.snap ? { cause: S.snap.cause, baitLost: S.snap.baitLost } : null,
      cam: S.cam, hint: null, lay: null,
    };
    S.snap = null; S.banners.length = 0; S.hint = null; S.hintQueue.length = 0; S.vis.haul = null;
    S.paused = false;
    HL.w.nav = false;
    if (HL.audio.creak) HL.audio.creak(0); if (HL.audio.reel) HL.audio.reel(0);
    HL.music.setDepth(0);
    // Prvý raz: ako pokračovať (pamätá sa v save.tutorial.seen, ako ostatné rady). Rada hovorí o PRÍSTAVE — na jazere
    // je tlačidlo BREH, preto sa tam neukáže (prvá hladina hráča je vždy na mori; jazero sa otvára až Lodenicou).
    // Neuvidená rada počká na najbližšiu hladinu na mori (prekladatelia 2026-10-02: „vráť sa do Prístavu" pri BREH).
    var seen = seenMap();
    if (!seen.again && !isLake(res)) {
      // "Úlovok je v bezpečí" len keď nejaký je (prasknutie a prázdny ponor majú vlastné znenie)
      S.surf.hint = res.outcome === 'snapped' ? 'againSnap' : res.catch.length ? 'again' : 'againEmpty';
      // Povinné riadky karty neustúpia (odznaky áno): keby karta siahla cez pás rady, rada počká na ďalšiu hladinu (ako
      // pri jazere). Zmerané 2026-10-04 (haul_ui.test.js): 12 rýb s bonusom za veľký úlovok hu/es/fr o 6 px, a už predtým
      // prasknutie s 3 rybami na prvej hladine hu/fr o 6 px.
      if (cardFitsHint(S.surf)) {
        seen.again = true;
        HL.game.persist();
      } else S.surf.hint = null;
    }
    if (sum.quests && sum.quests.length) sfx('quest');
    else if (sum.sold && sum.sold.total > 0) sfx('coin');
  }

  function updateSurface(dt) {
    var sf = S.surf, I = HL.input, p = I.pointer;
    sf.t += dt;
    var armed = sf.t >= T.diveAgainArmSec;
    var pid = p.pressed ? (p.lastId != null ? p.lastId : 1) : null;
    trackPointer();
    // Podržanie platí len pre stlačenie, ktoré ZAČALO po zobrazení karty a mimo tlačidiel: prst
    // alebo S držané ešte z ponoru kartu nepreskočia.
    if (pid != null && armed && S.fingers[pid] === 'play') sf.fresh[pid] = true;
    for (var k in sf.fresh) if (!(I.pointers && I.pointers[k])) delete sf.fresh[k];
    if (armed && I.actionPressed('sink')) sf.keyArmed = true;
    if (!I.action('sink')) sf.keyArmed = false;
    var fingers = Object.keys(sf.fresh).length > 0;
    sf.hold = sf.keyArmed || fingers ? sf.hold + dt : 0;
    // kamera k hladine (po prasknutí z hĺbky skokom, po výstupe plynulo)
    var target = -Math.round(T.diveSurfWaterY);
    sf.cam = Math.abs(sf.cam - target) > 240 ? target : U.damp(sf.cam, target, 12, dt);
    if (Math.abs(sf.cam - target) < 0.5) sf.cam = target;
    S.fx.update(dt);
    if (HL.audio.creak) HL.audio.creak(0); if (HL.audio.reel) HL.audio.reel(0);
    if (!armed) return;
    if (HL.w.clicked('s_bait')) { sf.bait = nextBait(sf.bait); sf.ran = null; }
    if (HL.w.clicked('s_again') || sf.hold >= T.diveAgainHoldSec) { diveAgain(sf.bait, fingers ? sf.fresh : null); return; }
    if (HL.w.clicked('s_harbour') || I.actionPressed('back')) goHarbour();
  }

  // Ďalší ponor výletu v tej istej scéne: nový DiveState (sim), nový stav UI (fx, nápisy, rady,
  // pauza, robot), hudba a more bežia ďalej. Čas plynie tak, ako ho posunul finishDive.
  function diveAgain(bait, held) {
    var prev = S, save = HL.game.save;
    if (!usableBait(bait)) bait = 'worm';
    if (save.tutorial && typeof save.tutorial === 'object') save.tutorial.lastBait = bait; // Príprava ju ponúkne nabudúce
    var d = HL.game.startDive({ bait: bait, mode: 'career', location: prev.d ? prev.d.location : 'more', haul: !!(prev.d && prev.d.haul) });
    S = newState(d, 'career', false, null);
    if (prev.bot) S.bot = makeBot(d);
    beginDive(d, held);
    sfx('splash');
    return d;
  }

  // Prístav (more) → dedina; breh jadrového jazera → Stará elektráreň.
  function goHarbour() {
    var home = isLake(S.d) ? 'elektraren' : 'village';
    S.left = true;
    var tc = tripCopy();
    trip = null;
    HL.go(home, { trip: tc });
  }

  function surfaceProbe(sf) {
    var res = sf.sum.result, L = sf.lay || {};
    return {
      outcome: res.outcome, value: sf.sum.value, armed: sf.t >= T.diveAgainArmSec, hold: r2(sf.hold),
      hint: sf.hint, baitNote: sf.ran ? sf.ran.from + '>' + sf.ran.to : null,
      headline: L.headline || null, fishShown: L.fishShown || 0, fishMore: L.fishMore || 0,
      rows: L.rows ? L.rows.slice() : [], rowsHidden: L.rowsHidden || 0, box: L.card || null,
      texts: L.texts ? L.texts.slice() : [], hintBox: L.hint || null, camera: Math.round(sf.cam),
      buttons: L.buttons ? L.buttons.map(function (b) { return { id: b.id, label: b.label }; }) : [],
      surfY: S.surfY,
    };
  }

  // Pohľad na svet pri hladine: ten istý ponor (obloha, voda, ryby pri hladine, loď), len háčik visí
  // na špičke prúta, na vlasci nič nie je a napätie je nulové. Object.create — DiveState sa nemení.
  function surfView(d) {
    var v = Object.create(d), sf = S.surf;
    var k = T.diveAgainHoldSec > 0 ? U.clamp01(sf.hold / T.diveAgainHoldSec) : 0;
    v.hook = { x: BOAT_X + 36, depth: (-13 + k * 12) / T.pxPerM, vy: 0, still: 0, sinking: false };
    v.onLine = []; v.fight = null; v.fightFish = null;
    v.octopus = null; v.shadowEel = null; v.shark = null; v.jellyHits = [];
    v.tension = { total: 0, strength: d.line.strength, ratio: 0, level: 0, parts: {}, depthMult: 1 };
    v.state = 'over';
    v.env = HL.game.env();
    return v;
  }

  function drawSurfaceScene(ctx) {
    var sf = S.surf, v = surfView(S.d), off = S.fx.offset();
    S.cam = Math.round(sf.cam);
    ctx.save();
    ctx.translate(off.x, off.y);
    drawWorld(ctx, v);
    S.fx.draw(ctx, PW, H);
    ctx.restore();
    S.lay = null;
    drawSurfTop(ctx, v.env);
    drawCard(ctx, sf);
  }

  // Horná lišta na hladine: peniaze (úlovok mohol byť predaný), deň, čas a počasie.
  function drawSurfTop(ctx, env) {
    D.rect(ctx, 0, 0, PW, TOP_H, P.ink);
    D.rect(ctx, 0, TOP_H, PW, 1, P.slateDark);
    F.draw(ctx, U.money(Math.floor(HL.game.save.money + 1e-9)), 4, 4, P.yellow, { shadow: P.plum });
    var clock = HL.world.clockLabel(env.m), cw = F.measure(clock);
    F.draw(ctx, clock, PW - 3 - cw, 4, P.white);
    var wx = PW - 3 - cw - 14;
    if (!clearNight(env)) { D.sprite(ctx, HL.spr.get('icon_' + env.weather), wx, 3); wx -= 14; }
    if (env.period === 'night') { D.sprite(ctx, HL.spr.get('moon_' + env.moon), wx, 3); wx -= 14; }
    F.draw(ctx, HL.world.dayLabel(env.m), wx + 10, 6, P.greyLight, { small: true, align: 'right' });
  }

  // Číslo sa pri zalomení neodtrhne od jednotky ("14 | €").
  // (\p{L} = písmeno každého jazyka; pre slovenčinu to isté ako pôvodný zoznam A–Z + á…ž)
  function nbsp(s) { return String(s).replace(/(\d) (?=[0-9€%\p{L}])/gu, '$1\u00a0'); }
  function textRow(key, text, color, keep, small) {
    var o = small ? { small: true } : {}, lh = small ? 8 : 11, lines = F.wrap(nbsp(text), CARD_IN, o);
    return { key: key, keep: keep, text: text, h: lines.length * lh + 2,
      draw: function (ctx, x, y) { for (var i = 0; i < lines.length; i++) F.draw(ctx, lines[i], x, y + i * lh, color, o); } };
  }
  // Odznak: štítok + text. Text, ktorý sa do riadka nezmestí, sa zalomí na 2. riadok (predtým výpustka
  // zjedla práve odmenu úlohy "+50 €" — v každom jazyku vrátane slovenčiny); až 2. riadok sa skracuje.
  // Jednoriadkový odznak je presne ten istý ako predtým (h 10, text z toho istého miesta).
  var BADGE_LINES = 2;
  function badgeRow(key, label, bg, fg, text) {
    var sm = { small: true }, tw = F.measure(label, sm) + 4, room = CARD_IN - tw - 3;
    var lines = F.measure(text, sm) <= room ? [text] : F.wrap(nbsp(text), room, sm);
    if (lines.length > BADGE_LINES) lines = lines.slice(0, BADGE_LINES - 1).concat([lines.slice(BADGE_LINES - 1).join(' ')]);
    var step = F.lineStep(sm);
    return { key: key, text: label + ' ' + text, h: 10 + (lines.length - 1) * step, lines: lines.length, draw: function (ctx, x, y, w) {
      D.rect(ctx, x, y, tw, 8, P[bg]);
      F.draw(ctx, label, x + 2, y, P[fg], sm);
      for (var i = 0; i < lines.length; i++) F.draw(ctx, lines[i], x + tw + 3, y + i * step, P.greyLight, { small: true, maxWidth: w - tw - 3 });
    } };
  }

  // Riadky karty: povinné (nadpis, ryby, kam išli, výlet) a odznaky, kým sa zmestia.
  function cardRows(sf) {
    var sum = sf.sum, res = sum.result, save = HL.game.save, rows = [], badges = [];
    var snapped = res.outcome === 'snapped';
    var nm = function (id) { var s = species(id); return s ? s.name : id; };
    var head = snapped ? t('ui.dive.snap.title') : res.catch.length ? t('ui.dive.banner.safe') : t('ui.dive.banner.up');
    var headCol = snapped ? P.red : P.greenLight, val = !snapped && res.catch.length ? '+' + U.money(sum.value) : null;
    rows.push({ key: 'head', keep: true, h: 20, text: head + (val ? ' ' + val : ''), draw: function (ctx, x, y, w) {
      var hw = F.draw(ctx, head, x, y, headCol, { scale: 2, shadow: snapped ? P.redDark : P.ink });
      if (val) {
        var big = hw + 8 + F.measure(val, { scale: 2 }) <= w;
        F.draw(ctx, val, x + w, big ? y : y + 5, P.yellow, { align: 'right', scale: big ? 2 : 1, shadow: P.plum });
      } else if (!snapped) F.draw(ctx, t('ui.dive.card.noCatch'), x + w, y + 5, P.grey, { align: 'right' });
    } });
    if (snapped) rows.push(textRow('cause', sf.snap && sf.snap.cause === 'eel' ? t('ui.dive.card.causeEel') : t('ui.dive.card.causeTension'), P.white, true));
    // ryby tohto ponoru (po prasknutí stratené — tiene na tmavých dlaždiciach, ako vo výsledku)
    var list = snapped ? res.lost.filter(function (l) { return l.cause === 'snap'; }) : res.catch;
    var max = Math.max(3, Math.round(T.diveCardFish)), n = list.length, show = n <= max ? n : max - 1;
    if (n) rows.push({ key: 'fish', keep: true, h: 21, show: show, more: n - show, text: list.map(function (c) { return c.id; }).join(','), draw: function (ctx, x, y) {
      for (var i = 0; i < show; i++) HL.ui.fishTile(ctx, list[i].id, x + i * 26, y, 24, 17, { dark: snapped });
      if (n > show) F.draw(ctx, '+' + (n - show), x + show * 26 + 2, y + 4, P.white);
    } });
    if (snapped) {
      var parts = [], bd = baitData(res.baitId), bl = sf.snap ? sf.snap.baitLost : null;
      if (n) parts.push(fishWord(n));
      if (bd && bd.infinite) parts.push(HL.i18n.lower(bd.name));
      else if (bl > 0 && isFinite(bl)) parts.push(t('ui.dive.card.baitLost', { count: bl, name: bd ? HL.i18n.lower(bd.name) : res.baitId }));
      rows.push(textRow('lost', parts.length ? t('ui.dive.lost', { what: parts.join(', ') }) : t('ui.dive.card.nothing'), P.greyLight, true));
    } else if (n) {
      var nSt = (sum.stored || []).length, nSo = sum.sold ? sum.sold.lines.length : 0, where = [];
      if (nSt) where.push(t('ui.dive.card.stored', { count: save.storage.length, cap: HL.village.storageCap(save) }));
      if (nSo) where.push(tp(nSo, nSt ? 'ui.dive.card.sold' : 'ui.dive.card.soldFull', { money: U.money(sum.sold.total) }));
      rows.push(textRow('where', where.join(' · '), P.white, true));
    } else rows.push(textRow('where', t('ui.dive.card.tryElse'), P.greyLight, true));
    // Bonus za veľký úlovok (summary.haul, sim/game.js finishDive) je už v peniazoch — povinný riadok pod tým, kam išiel
    // úlovok (odznak by pri plnej karte ustúpil). Vety bežným písmom; dlhší jazyk sa zalomí, číslo sa od jednotky neodtrhne.
    var hl = sum.haul;
    if (hl) rows.push(textRow('haul', tp(hl.n, 'ui.dive.card.haul', { pct: U.pct(hl.pct), money: U.money(hl.money) }), P.amber, true));
    // Došlá návnada sa vymenila sama — celá veta (odznak ju orezal: "Svietiaca návn…")
    if (sf.ran) rows.push(textRow('baitOut', t('ui.dive.card.baitRanOut', { from: baitName(sf.ran.from), to: baitName(sf.ran.to) }), P.amber, true));

    // odznaky v poradí dôležitosti
    (sum.quests || []).forEach(function (q) {
      var rew = [];
      if (q.reward && q.reward.money) rew.push('+' + U.money(q.reward.money));
      if (q.reward && q.reward.gold) rew.push(tp(q.reward.gold, 'ui.dive.card.rewardGold'));
      badges.push(badgeRow('quest', t('ui.dive.badge.quest'), 'greenLight', 'ink', q.text + (rew.length ? ' ' + rew.join(' ') : '')));
    });
    var legends = res.catch.filter(function (c) { return c.legend; });
    if (legends.length && !snapped) badges.push(badgeRow('legend', t('ui.dive.badge.legend'), 'yellow', 'ink', legends.map(function (c) { return nm(c.id); }).join(', ')));
    if ((sum.newSpecies || []).length) badges.push(badgeRow('new', t('ui.dive.badge.newSpecies'), 'cyan', 'ink', sum.newSpecies.map(nm).join(', ')));
    if ((sum.records || []).length) {
      var heavy = {};
      res.catch.forEach(function (c) { if (!heavy[c.id] || c.w > heavy[c.id].w) heavy[c.id] = c; });
      badges.push(badgeRow('record', t('ui.dive.badge.record'), 'amber', 'ink', sum.records.map(function (id) { return nm(id) + (heavy[id] ? ' ' + U.kg(heavy[id].w) : ''); }).join(', ')));
    }
    // Veľkosť kusu (sim/specimen.js): trofeje a veľké kusy tohto ponoru (za NOVÝ DRUH a REKORD — tie sú pre postup dôležitejšie) — štítok z HL.ui.tierTag.
    if (!snapped) ['trofejny', 'velky'].forEach(function (tier) {
      var big = res.catch.filter(function (c) { return c.tier === tier; }), tg = HL.ui.tierTag(tier);
      if (big.length && tg) badges.push(badgeRow(tier, tg[0], tg[1], tg[2], big.map(function (c) { return nm(c.id) + ' ' + U.kg(c.w); }).join(', ')));
    });
    var V = HL.village;
    if (V && typeof V.contest === 'function') {
      var c = V.contest(save, HL.game.env()), won = sum.contest && sum.contest.won ? sum.contest : null, prize = sum.prize > 0 ? sum.prize : 0;
      if (won) badges.push(badgeRow('contest', t('ui.dive.badge.contest'), 'yellow', 'ink', t('ui.dive.badge.contestWon', { name: nm(won.id), kg: U.kg(won.kg), money: U.money(won.prize) })));
      else if (c.active) badges.push(badgeRow('contest', t('ui.dive.badge.contest'), 'yellow', 'ink', t('ui.dive.badge.contestProgress', { best: c.bestKg > 0 ? U.kg(c.bestKg) : '—', target: U.kg(c.targetKg) })));
      if (prize && !(won && won.paid)) badges.push(badgeRow('prize', t('ui.dive.badge.prize'), 'yellow', 'ink', t('ui.dive.badge.prizeText', { money: U.money(prize) })));
    }
    var shark = res.lost.filter(function (l) { return l.cause === 'shark'; }), knot = res.lost.filter(function (l) { return l.cause === 'knot'; });
    if (shark.length) badges.push(badgeRow('shark', t('ui.dive.badge.shark'), 'redDark', 'white', t('ui.dive.badge.sharkText', { list: shark.map(function (l) { return nm(l.id); }).join(', ') })));
    if (knot.length) badges.push(badgeRow('knot', t('ui.dive.badge.knot'), 'slate', 'white', t('ui.dive.badge.knotText', { list: knot.map(function (l) { return nm(l.id); }).join(', ') })));
    if (sum.days > 0) badges.push(badgeRow('day', t('ui.dive.badge.day'), 'slate', 'white', sum.income > 0 ? t('ui.dive.badge.dayIncome', { money: U.money(sum.income) }) : t('ui.dive.badge.dayText')));

    var tripRow = textRow('trip', HL.data.tripLine(trip || { dives: 0, fish: 0, value: 0 }), P.greyLight, true);
    tripRow.h += 4; // čiara nad riadkom
    var inner = tripRow.draw;
    tripRow.draw = function (ctx, x, y, w) { D.rect(ctx, x, y, w, 1, P.slateDark); inner(ctx, x, y + 4); };
    return { rows: rows, badges: badges, trip: tripRow, headCol: headCol, head: head, show: n ? show : 0, more: n ? n - show : 0 };
  }

  function surfHintRect(sf, bottom) {
    if (!sf.hint) return null;
    var lines = F.wrap(hintText(sf.hint), CARD_W - 10), h = lines.length * 11 + 6;
    return { x: CARD_X, y: bottom - h, w: CARD_W, h: h, lines: lines };
  }
  // Zmestia sa povinné riadky karty (bez odznakov) nad pás rady? To isté počítanie ako drawCard (room >= 0).
  function cardFitsHint(sf) {
    var hr = surfHintRect(sf, SURF_CHIP_Y - 4);
    if (!hr) return true;
    var R = cardRows(sf), used = 8 + R.trip.h;
    R.rows.forEach(function (r) { used += r.h; });
    return Math.round(T.diveSurfWaterY) + 7 + used <= hr.y - 4;
  }

  function drawCard(ctx, sf) {
    var armed = sf.t >= T.diveAgainArmSec;
    var k = T.diveAgainArmSec > 0 ? U.clamp01(sf.t / T.diveAgainArmSec) : 1;
    var slide = Math.round((1 - k) * (1 - k) * 16);   // karta vkĺzne zdola (bez priehľadnosti)
    var top = Math.round(T.diveSurfWaterY) + 7;
    var hr = surfHintRect(sf, SURF_CHIP_Y - 4);
    var bottom = (hr ? hr.y : SURF_CHIP_Y) - 4;
    var R = cardRows(sf), rows = R.rows.slice(), used = 8 + R.trip.h;
    rows.forEach(function (r) { used += r.h; });
    // odznaky, kým sa zmestia; keď nie všetky, riadok "… a ďalšie: N" (10 px) — keď sa už nezmestí,
    // ustúpi mu posledný odznak (jednoriadkový odznak má 10 px, zalomený na 2 riadky 20 px)
    var fit = 0, room = bottom - top - used, bh = 0;
    while (fit < R.badges.length && bh + R.badges[fit].h <= room) bh += R.badges[fit++].h;
    var hidden = R.badges.length - fit;
    if (hidden > 0 && fit > 0 && bh + 10 > room) { bh -= R.badges[--fit].h; hidden++; }
    for (var b = 0; b < fit; b++) rows.push(R.badges[b]);
    if (hidden > 0 && bh + 10 <= room) {
      var moreTxt = t('ui.dive.card.moreBadges', { count: hidden });
      rows.push({ key: 'more', h: 10, text: moreTxt, draw: function (ctx, x, y) { F.draw(ctx, moreTxt, x, y, P.grey, { small: true }); } });
    }
    rows.push(R.trip);
    var h = 8, i;
    for (i = 0; i < rows.length; i++) h += rows[i].h;
    var y = top + slide, x = CARD_X + 6;
    D.panel(ctx, CARD_X, y, CARD_W, h, 'dark');
    D.rect(ctx, CARD_X + 2, y + 1, CARD_W - 4, 2, R.headCol);   // pás farby výsledku
    var yy = y + 5;
    for (i = 0; i < rows.length; i++) { rows[i].draw(ctx, x, yy, CARD_IN); yy += rows[i].h; }
    var L = sf.lay = {
      card: { x: CARD_X, y: y, w: CARD_W, h: h }, headline: R.head, fishShown: R.show, fishMore: R.more,
      rows: rows.map(function (r) { return r.key; }), rowsHidden: hidden, texts: rows.map(function (r) { return r.text || ''; }),
      hint: hr ? { x: hr.x, y: hr.y, w: hr.w, h: hr.h } : null, buttons: [],
    };
    if (hr) drawHint(ctx, hr);
    // spodná lišta (palec): PONORIŤ SA ZNOVA + PRÍSTAV; nad ňou čip návnady. Tlačidlá až po poistke
    // T.diveAgainArmSec — ťuk, ktorý ešte patril výstupu, na ne nedopadne (a pustenie ho nestlačí).
    D.rect(ctx, 0, BAR_Y, PW, H - BAR_Y, P.ink);
    D.rect(ctx, 0, BAR_Y, PW, 1, P.slateDark);
    if (!armed) return;
    var lab = baitLabel(sf.bait), againLab = t('ui.dive.card.again'), harbourLab = t(isLake(S.d) ? 'ui.dive.card.shore' : 'ui.dive.card.harbour');
    HL.w.button(ctx, 's_bait', CARD_X, SURF_CHIP_Y, CARD_W, SURF_CHIP_H, lab, { icon: 'bait_' + sf.bait, hotkey: 'KeyN', nav: false });
    HL.w.button(ctx, 's_again', AGAIN_BTN.x, AGAIN_BTN.y, AGAIN_BTN.w, AGAIN_BTN.h, againLab,
      { style: 'primary', hotkey: ['Enter', 'NumpadEnter', 'Space'], nav: false });
    HL.w.button(ctx, 's_harbour', HARBOUR_BTN.x, HARBOUR_BTN.y, HARBOUR_BTN.w, HARBOUR_BTN.h, harbourLab, { nav: false });
    // podržanie (S / prst na vode) plní pás nad tlačidlom — ponor príde, keď je plný
    var hk = T.diveAgainHoldSec > 0 ? U.clamp01(sf.hold / T.diveAgainHoldSec) : 0;
    if (hk > 0) D.rect(ctx, AGAIN_BTN.x, BAR_Y + 1, Math.round(AGAIN_BTN.w * hk), 2, P.yellow);
    L.buttons = [
      { id: 's_bait', x: CARD_X, y: SURF_CHIP_Y, w: CARD_W, h: SURF_CHIP_H, label: lab },
      { id: 's_again', x: AGAIN_BTN.x, y: AGAIN_BTN.y, w: AGAIN_BTN.w, h: AGAIN_BTN.h, label: againLab },
      { id: 's_harbour', x: HARBOUR_BTN.x, y: HARBOUR_BTN.y, w: HARBOUR_BTN.w, h: HARBOUR_BTN.h, label: harbourLab },
    ];
  }

  // ------------------------------------------------------------------ bočné panely na hladine (PC)
  function panelLeftSurface(ctx, w, h) {
    D.panel(ctx, 2, 2, w - 4, h - 4);
    var tr = trip || { dives: 0, fish: 0, value: 0, snaps: 0 }, y = 8, sm = { small: true };
    F.draw(ctx, t('ui.dive.trip.title'), 8, y, P.amber);
    y += 14;
    var rows = [[t('ui.dive.trip.dives'), String(tr.dives)], [t('ui.dive.trip.fish'), String(tr.fish)], [t('ui.dive.trip.value'), U.money(tr.value)],
      [t('ui.dive.trip.snaps'), String(tr.snaps)]];
    for (var i = 0; i < rows.length; i++) {
      F.draw(ctx, rows[i][0], 8, y + 2, P.grey, sm);
      F.draw(ctx, rows[i][1], w - 8, y, P.white, { align: 'right' });
      D.rect(ctx, 8, y + 12, w - 16, 1, P.navy);
      y += 15;
    }
    y += 4;
    F.drawWrapped(ctx, t('ui.dive.trip.timeStops'), 8, y, w - 16, P.greyLight, sm);
    var help = [[t('ui.dive.help.sinkKeys'), t('ui.dive.help.again')], ['Enter', t('ui.dive.help.dive')], ['N', t('ui.dive.help.bait')],
      ['Esc', t(isLake(S.d) ? 'ui.dive.help.shore' : 'ui.dive.help.harbour')]];
    var hy = 252;
    F.draw(ctx, t('ui.dive.help.title'), 8, hy, P.amber, sm);
    hy += 10;
    for (var k = 0; k < help.length; k++) {
      F.draw(ctx, help[k][0], 8, hy, P.white, sm);
      // kláves a akcia sa nesmú prekryť (fotka: "Enter, medzeraponoriť sa") — inak akcia pod kláves
      if (F.measure(help[k][0], sm) + F.measure(help[k][1], sm) + 6 > w - 16) hy += 8;
      F.draw(ctx, help[k][1], w - 8, hy, P.grey, { small: true, align: 'right' });
      hy += 9;
    }
  }

  function panelRightSurface(ctx, w, h) {
    D.panel(ctx, 2, 2, w - 4, h - 4);
    var sf = S.surf, sum = sf.sum, res = sum.result, save = HL.game.save, snapped = res.outcome === 'snapped', sm = { small: true };
    var list = snapped ? res.lost.filter(function (l) { return l.cause === 'snap'; }) : res.catch;
    F.draw(ctx, snapped ? t('ui.dive.side.lost') : t('ui.dive.side.catch'), 8, 8, snapped ? P.red : P.amber);
    // ceny riadkov z toho istého zdroja ako nadpis karty: náhľad predaja uloženého + predaj nadbytku
    var prev = (sum.storedPreview && sum.storedPreview.lines) || [], sold = (sum.sold && sum.sold.lines) || [];
    var stored = sum.stored || [], pi = 0, si = 0, y = 22, rows = Math.min(list.length, 7);
    if (!list.length) { F.draw(ctx, snapped ? t('ui.dive.snap.nothing') : t('ui.dive.banner.noCatch'), 8, y, P.slate, sm); y += 11; }
    for (var i = 0; i < list.length; i++) {
      var it = list[i], price = null;
      if (!snapped) {
        if (stored.indexOf(it) >= 0) { price = prev[pi] ? prev[pi].price : null; pi++; }
        else { price = sold[si] ? sold[si].price : null; si++; }
      }
      if (i >= rows) continue;
      var sp = species(it.id), th = HL.ui.thumb(it.id, 16, 10);
      D.sprite(ctx, th, 16 - Math.floor(th.width / 2), y + 5 - Math.floor(th.height / 2));
      F.draw(ctx, sp ? sp.name : it.id, 28, y, snapped ? P.grey : P.white, { small: true, maxWidth: w - 36 });
      F.draw(ctx, U.kg(it.w), 28, y + 8, P.grey, sm);
      if (price != null) F.draw(ctx, U.money(price), w - 8, y + 8, stored.indexOf(it) >= 0 ? P.yellow : P.greyLight, { small: true, align: 'right' });
      y += 18;
    }
    if (list.length > rows) { F.draw(ctx, t('ui.dive.side.more', { count: list.length - rows }), 8, y, P.grey, sm); y += 9; }
    D.rect(ctx, 8, y + 1, w - 16, 1, P.slateDark);
    if (!snapped) {
      F.draw(ctx, t('ui.dive.side.total'), 8, y + 5, P.greyLight, sm);
      F.draw(ctx, U.money(sum.value), w - 8, y + 4, P.yellow, { align: 'right' });
      y += 18;
    } else y += 6;
    F.draw(ctx, t('ui.dive.side.shed'), 8, y + 2, P.grey, sm);
    F.draw(ctx, save.storage.length + ' / ' + HL.village.storageCap(save), w - 8, y, P.white, { align: 'right' });
    y += 20;
    var env = HL.game.env();
    D.rect(ctx, 8, y - 6, w - 16, 1, P.slateDark);
    F.draw(ctx, HL.world.dayLabel(env.m) + ' · ' + HL.world.clockLabel(env.m), 8, y, P.white, { small: true, maxWidth: w - 14 });
    D.sprite(ctx, HL.spr.get(HL.world.weatherIcon(env.weather, env.m)), 8, y + 10);
    F.draw(ctx, weatherLabel(env), 24, y + 13, P.greyLight, { small: true, maxWidth: w - 30 });
    D.sprite(ctx, HL.spr.get('moon_' + env.moon), 8, y + 25);
    F.draw(ctx, HL.data.moonPhases[env.moon], 24, y + 28, P.greyLight, { small: true, maxWidth: w - 30 });
    y += 42;
    if (HL.village.level(save, 'meteostanica') >= 1) {
      var fc = HL.village.forecast(save, env), segs = (fc.segments || []).slice(0, 3);
      F.draw(ctx, t('ui.dive.forecast.title'), 8, y, P.amber, sm);
      for (var s = 0; s < segs.length; s++) {
        F.draw(ctx, (s ? t('ui.dive.forecast.from', { time: HL.world.clockLabel(segs[s].from) }) : t('ui.dive.forecast.now')), 8, y + 9 + s * 9, P.grey, sm);
        F.draw(ctx, HL.world.weatherName(segs[s].weather, segs[s].from), w - 8, y + 9 + s * 9, P.white, { small: true, align: 'right' });
      }
    }
  }
})(globalThis.HL);
