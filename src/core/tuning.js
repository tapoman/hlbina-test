// VŠETKY ladiace konštanty hry na jednom mieste, každá s rozsahom a popisom.
// Hodnoty tu sú ODHAD (dizajnový dokument: "ceny a čísla sa vyladia testovaním").
// Panel F2 (core/dials.js) z nich robí živé posuvníky a naladené hodnoty ukladá,
// takže ďalšia relácia ich nehádže znova.
//
// Použitie:  HL.T.sinkBase      (čítanie — vždy aktuálna hodnota)
//            HL.T.def('Skupina', 'kľúč', hodnota, min, max, krok, 'Popis')
// Ďalšie súbory si môžu pridať vlastné konštanty cez HL.T.def — panel ich zobrazí.
(function (HL) {
  var T = HL.T = {};
  var meta = {};
  var overrides = {};
  Object.defineProperty(T, '_meta', { value: meta, enumerable: false });

  Object.defineProperty(T, 'def', {
    enumerable: false,
    value: function (group, key, value, min, max, step, label) {
      HL.assert(typeof value === 'number' && isFinite(value), 'T.def ' + key + ' nie je číslo');
      HL.assert(min <= value && value <= max, 'T.def ' + key + ' mimo rozsahu');
      meta[key] = { group: group, def: value, min: min, max: max, step: step, label: label };
      T[key] = Object.prototype.hasOwnProperty.call(overrides, key) ? overrides[key] : value;
      return T[key];
    },
  });
  // Prepíše hodnoty (z localStorage alebo z testu). Neznáme kľúče si pamätá na neskôr.
  Object.defineProperty(T, 'apply', {
    enumerable: false,
    value: function (obj) {
      for (var k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        var v = Number(obj[k]);
        if (!isFinite(v)) continue;
        overrides[k] = v;
        if (meta[k]) T[k] = HL.util.clamp(v, meta[k].min, meta[k].max);
      }
    },
  });
  Object.defineProperty(T, 'reset', {
    enumerable: false,
    value: function (key) {
      var keys = key ? [key] : Object.keys(meta);
      for (var i = 0; i < keys.length; i++) { delete overrides[keys[i]]; T[keys[i]] = meta[keys[i]].def; }
    },
  });
  // Iba hodnoty, ktoré sa líšia od predvolených — to sa ukladá a exportuje.
  Object.defineProperty(T, 'changed', {
    enumerable: false,
    value: function () {
      var out = {};
      for (var k in meta) if (T[k] !== meta[k].def) out[k] = T[k];
      return out;
    },
  });

  var d = T.def;
  // ---------------------------------------------------------------- Ponor
  d('Ponor', 'sinkBase', 9, 1, 40, 0.5, 'Rýchlosť klesania pri hladine (m/s)');
  d('Ponor', 'sinkPerM', 0.02, 0, 0.1, 0.002, 'Zrýchlenie klesania s hĺbkou (za m)');
  d('Ponor', 'sinkMax', 45, 5, 120, 1, 'Najvyššia rýchlosť klesania (m/s)');
  d('Ponor', 'hookSpeedX', 80, 20, 200, 5, 'Rýchlosť háčika do strán, klávesnica (px/s)');
  d('Ponor', 'pointerFollow', 12, 2, 40, 1, 'Ako rýchlo háčik dobieha myš/prst');
  d('Ponor', 'ascendSec', 1.0, 0.3, 3, 0.1, 'Trvanie animácie HORE (s)');
  d('Ponor', 'pxPerM', 2, 0.5, 6, 0.25, 'Pixelov na meter hĺbky');
  d('Ponor', 'hookScreenY', 120, 60, 220, 2, 'Výška háčika na obrazovke (px od vrchu)');
  d('Ponor', 'minutesPerSec', 1, 0.25, 10, 0.25, 'Herné minúty za reálnu sekundu');
  d('Ponor', 'fishMax', 7, 1, 20, 1, 'Najviac rýb naraz okolo háčika');
  d('Ponor', 'fishSpawnPerSec', 0.9, 0.1, 5, 0.1, 'Nové ryby za sekundu');
  d('Ponor', 'biteRadius', 12, 4, 40, 1, 'Dosah záberu (px od háčika)');
  d('Ponor', 'attractRadius', 44, 10, 120, 1, 'Na akú vzdialenosť ryba zbadá návnadu (px)');
  d('Ponor', 'legendPerMin', 1.5, 0, 10, 0.1, 'Legenda: výskyty za minútu, keď platia podmienky');
  d('Ponor', 'biteCooldown', 2.0, 0.2, 10, 0.1, 'Ryba, čo nezahryzla, skúsi znova po (s)');
  d('Ponor', 'biteChanceMult', 1.0, 0.1, 5, 0.05, 'Globálny násobok šance na záber');
  d('Ponor', 'lightRadius', 34, 10, 90, 1, 'Polomer svetla háčika v tme (px)');
  d('Ponor', 'lightPerLighthouse', 12, 0, 40, 1, 'Svetlo navyše za úroveň Majáka (px)');

  // ---------------------------------------------------------------- Napätie
  d('Napätie', 'depthDiv', 250, 50, 1000, 10, 'Hĺbkový násobiteľ = 1 + hĺbka / X');
  d('Napätie', 'warn1', 0.70, 0.3, 0.95, 0.01, 'Škrípanie od (podiel pevnosti)');
  d('Napätie', 'warn2', 0.85, 0.3, 0.98, 0.01, 'Kmitanie a červená od');
  d('Napätie', 'warn3', 0.95, 0.3, 0.99, 0.01, 'Vysoký tón a trasenie od');
  d('Napätie', 'redSpikeFrac', 0.20, 0, 1, 0.01, 'Skok napätia pri ťuknutí v ŤAHÁ (× váha ryby)');
  d('Napätie', 'spikeDecaySec', 0.8, 0.1, 3, 0.05, 'Ako dlho doznieva skok napätia (s)');
  d('Napätie', 'pullRampSec', 0.12, 0, 1, 0.01, 'Nábeh ťahu ryby na začiatku fázy ŤAHÁ (s)');
  // Dokument 5.3: ťah = váha × sila ťahu, BEZ hĺbkového násobku (ten je len pri rybách
  // visiacich na vlasci). 0 = doslova podľa dokumentu; 1 = aj ťah a skoky sa násobia hĺbkou.
  d('Napätie', 'pullDepthScale', 0, 0, 1, 0.05, 'Ťah a skoky × hĺbkový násobok (0 = podľa dokumentu)');

  // ---------------------------------------------------------------- Boj
  d('Boj', 'progressStart', 0.30, 0.05, 0.9, 0.01, 'Postup na začiatku boja');
  d('Boj', 'progressPerTap', 0.10, 0.02, 0.5, 0.01, 'Postup za dobré ťuknutie (základ)');
  d('Boj', 'decayPerSec', 0.03, 0, 0.2, 0.005, 'Pokles postupu za sekundu (základ)');
  d('Boj', 'toleranceMs', 60, 0, 300, 5, 'Tolerancia rytmu, základ (ms)');
  d('Boj', 'phaseScale', 1.0, 0.4, 2.5, 0.05, 'Tempo rytmu (násobok dĺžky fáz)');
  d('Boj', 'tapCooldownMs', 70, 0, 300, 5, 'Najkratší odstup dvoch ťuknutí (ms)');

  // ---------------------------------------------------------------- Nebezpečenstvá
  d('Nebezpečenstvá', 'jellyTensionFrac', 0.15, 0, 0.6, 0.01, 'Medúza: napätie + podiel pevnosti');
  d('Nebezpečenstvá', 'jellySec', 3, 0.5, 10, 0.5, 'Medúza: trvanie (s)');
  d('Nebezpečenstvá', 'rockStrengthLoss', 0.10, 0, 0.5, 0.01, 'Skala: strata pevnosti vlasca');
  d('Nebezpečenstvá', 'currentForce', 26, 0, 120, 1, 'Sila prúdu pri búrke (px/s)');
  d('Nebezpečenstvá', 'sharkDelaySec', 6, 2, 20, 0.5, 'Žralok: čas do útoku (s)');
  d('Nebezpečenstvá', 'sharkPerMin', 0.6, 0, 5, 0.05, 'Žralok: výskyty za minútu v Súmraku+');
  d('Nebezpečenstvá', 'octopusPerMin', 0.45, 0, 5, 0.05, 'Chobotnica: výskyty za minútu v Polnoci+');
  d('Nebezpečenstvá', 'octopusLoadKg', 10, 1, 60, 1, 'Chobotnica: záťaž (kg pred hĺbkovým násobkom)');
  d('Nebezpečenstvá', 'octopusShakes', 6, 2, 20, 1, 'Chobotnica: potrebné trhnutia do strán');
  d('Nebezpečenstvá', 'eelStillSec', 5, 1, 15, 0.5, 'Tieňový úhor: max. státie na mieste (s)');
  d('Nebezpečenstvá', 'eelPerMin', 0.8, 0, 5, 0.05, 'Tieňový úhor: výskyty za minútu v Priepasti');

  // ---------------------------------------------------------------- Trh
  d('Trh', 'demandDrop', 0.05, 0, 0.3, 0.005, 'Pokles dopytu za predaný kus');
  d('Trh', 'demandMin', 0.4, 0.05, 1, 0.05, 'Najnižší dopyt');
  d('Trh', 'demandRecover', 0.10, 0, 1, 0.01, 'Obnova dopytu za deň (smerom k 1,0)');
  d('Trh', 'hotMin', 1.5, 1, 5, 0.1, 'Horúci dopyt: najmenej ×');
  d('Trh', 'hotMax', 2.5, 1, 6, 0.1, 'Horúci dopyt: najviac ×');
  d('Trh', 'stormPriceBonus', 0.20, 0, 1, 0.01, 'Búrka: ceny všetkých rýb +');
  d('Trh', 'priceScale', 1.0, 0.2, 5, 0.05, 'Globálny násobok cien rýb');
  d('Trh', 'costScale', 1.0, 0.2, 5, 0.05, 'Globálny násobok cien budov a vybavenia');
  d('Trh', 'aquariumPerSpecies', 3, 0, 50, 1, 'Akvárium L2: € za deň za vystavený druh');

  // ---------------------------------------------------------------- Svet
  d('Svet', 'weatherMinH', 4, 1, 24, 1, 'Počasie trvá najmenej (h)');
  d('Svet', 'weatherMaxH', 8, 1, 48, 1, 'Počasie trvá najviac (h)');
  d('Svet', 'introDives', 2, 0, 10, 1, 'Prvé ponory: vždy slnečno, bez horúceho dopytu');
  d('Svet', 'rainShallowBonus', 0.20, 0, 1, 0.01, 'Dážď: šanca na záber v Plytčine +');
  d('Svet', 'fogBonus', 0.15, 0, 1, 0.01, 'Hmla: šanca na záber tajomných druhov +');

  // ---------------------------------------------------------------- Nekonečná hlbina
  d('Nekonečná', 'endlessPerkEvery', 250, 50, 1000, 10, 'Vylepšenie každých (m)');
  d('Nekonečná', 'endlessDanger', 1.3, 0.5, 4, 0.05, 'Násobok výskytu predátorov');
})(globalThis.HL);
