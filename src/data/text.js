// Texty, ktoré nie sú viazané na konkrétnu obrazovku: tipy v Krčme, návod pre prvé ponory.
(function (HL) {
  HL.data.tips = [
    'Čím hlbšie si, tým viac ryba zaťaží vlasec. V 500 metroch váži trojnásobok.',
    'Keď s plným vlascom klesneš hlbšie, napätie rastie aj bez novej ryby.',
    'Ťukaj, keď ryba povolí. Ťuknutie počas ťahu vlasec len trhne.',
    'Kým bojuješ, hore nevyjdeš. Začať boj je záväzok.',
    'Veľkej ryby sa báť nemusíš. Horšie je bojovať s ňou, keď už máš vlasec plný.',
    'Každá predaná ryba zníži svoj dopyt. Skús inú hĺbku, iný čas, iné počasie.',
    'Za búrky chodí na more menej rybárov. Ceny idú hore, ale aj nebezpečenstvo.',
    'Medúza vlasec na chvíľu napne. Skala ho natrvalo oslabí, až kým nevyjdeš hore.',
    'Žralok si vždy vyberie tú najcennejšiu rybu. Harpúna z Dielne ho odoženie.',
    'Chobotnicu zo seba striasť trhaním háčika zo strany na stranu.',
    'V Priepasti nezostávaj stáť. Tieňový úhor čaká práve na to.',
    'Dážď láka ryby k hladine.',
    'Hmla vraj prináša tajomné druhy.',
    'Pri splne a pri nove sa ukazujú ryby, ktoré inak neuvidíš.',
    'Každý druh bojuje po svojom. Keď si zapamätáš jeho rytmus, ďalšieho chytíš ľahšie.',
    'Na svietiacu návnadu berú hlbinné ryby. Na červíka len drobné rybky v plytčine.',
    // jadrové jazero (docs/JAZERO.md) — od indexu HL.data.lakeTipFrom; Krčma ich hovorí až tomu, kto pozná
    // elektráreň (sim/village.js V.tips), takže hráč bez jazera počuje tie isté tipy v tie isté dni ako predtým
    'Za dedinou stojí stará elektráreň. Vraj v jej jazere plávajú ryby s dvoma hlavami.',
    'V jadrovom jazere nie sú žraloky ani chobotnice. Zato hrdzavé sudy áno.',
  ];

  HL.data.lakeTipFrom = 16;

  // Čo odomkne chytená legenda (reward.unlock v data/fish.js). JEDINÝ zdroj — predtým
  // ho mali 3 súbory v troch rôznych zneniach (village.js, results.js, encyclopedia.js).
  HL.data.unlockText = {
    dielna3: 'Dielňa môže postaviť úroveň 3 — oceľový vlasec',
    majak3: 'Maják môže postaviť úroveň 3 — Priepasť a Nekonečná hlbina',
    legendLine: 'Dielňa ponúka Legendárny vlasec',
    trophy: 'Trofej v Akváriu',
    ending: 'Strážca priepasti je chytený. Dedina oslavuje!',
  };

  // Návod pre prvé ponory (riziko 19: priveľa systémov naraz → postupne).
  HL.data.tutorial = {
    sink: 'Drž S / ľavé tlačidlo / prst a háčik klesá.',
    move: 'A / D alebo myš: háčik doľava a doprava.',
    bite: 'Ryba zahryzla! Ťukaj (medzerník / klik), keď svieti ZELENÁ.',
    red: 'Počas ČERVENEJ neťukaj. Vlasec by sa napol.',
    up: 'Stlač W alebo HORE a úlovok je v bezpečí.',
    tension: 'Oblúk hore ukazuje napätie. Keď prekročí pevnosť, vlasec praskne. ↓×2 = v tejto hĺbke váži každá ryba dvakrát viac.',
    // karta na hladine (prvý raz): ostávaš na mori, kým sám nepovieš PRÍSTAV
    again: 'Úlovok je v bezpečí. Drž S (alebo myš na vode) a ponoríš sa znova, alebo sa vráť do Prístavu.',
    againSnap: 'Výbava ostala, vlasec je nadviazaný. Drž S (alebo myš na vode) a ponoríš sa znova, alebo sa vráť do Prístavu.',
    againEmpty: 'Drž S (alebo myš na vode) a ponoríš sa znova, alebo sa vráť do Prístavu.',
  };
  // Tie isté rady pre dotykovú obrazovku ("A / D alebo myš" by na mobile nič nehovorilo).
  HL.data.tutorialTouch = {
    sink: 'Drž prst na mieste a háčik klesá.',
    move: 'Ťahaj prstom doľava a doprava — pri ťahaní do strán háčik neklesá.',
    bite: 'Ryba zahryzla! Ťukaj, keď svieti ZELENÁ.',
    up: 'Ťukni na HORE a úlovok je v bezpečí.',
    again: 'Úlovok je v bezpečí. Drž prst na vode a ponoríš sa znova, alebo sa vráť do Prístavu.',
    againSnap: 'Výbava ostala, vlasec je nadviazaný. Drž prst na vode a ponoríš sa znova, alebo sa vráť do Prístavu.',
    againEmpty: 'Drž prst na vode a ponoríš sa znova, alebo sa vráť do Prístavu.',
  };

  // Výlet = séria ponorov od vyplávania z Prístavu po návrat: riadok na karte na hladine (ui/dive.js)
  // a oznámenie po návrate (ui/village.js). t = { dives, fish, value }.
  // Text je v tabuľke (ui.common.trip…); tvary množného čísla podľa jazyka.
  HL.data.tripLine = function (t) {
    var L = HL.i18n, n = (t && t.dives) | 0, f = (t && t.fish) | 0;
    return L.t('ui.common.tripLine', {
      dives: L.plural(n, 'ui.common.tripDives'), fish: L.plural(f, 'ui.common.tripFish'), value: HL.util.money((t && t.value) || 0),
    });
  };

  // Preklad (docs/I18N.md): tip.<i>, tutorial.<kľúč>, tutorialTouch.<kľúč>, unlock.<kľúč>.
  HL.i18n.overlay(HL.data.tips, 'tip');
  HL.i18n.overlay(HL.data.tutorial, 'tutorial');
  HL.i18n.overlay(HL.data.tutorialTouch, 'tutorialTouch');
  HL.i18n.overlay(HL.data.unlockText, 'unlock');
})(globalThis.HL);
