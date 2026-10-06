// English — dive preparation (ui/prep.js). Keys ui.prep.*  Gear tag on the right in small font (~60 px), sentence
// under the line 156 px, section title 168 px, side panel 94 px (wraps). {n} = count; other values come formatted.
(function (HL) {
  HL.i18n.add('en', 'prep', {
    'ui.prep.title': 'Preparation',
    'ui.prep.dive': 'DIVE',
    'ui.prep.haul': 'BONUS',
    'ui.prep.haulToast': 'Bonus: {from}+ fish = +{pct}. If a fish escapes the fight, you lose every fish on the line!',
    // list sections
    'ui.prep.bait': 'Bait',
    'ui.prep.gear': 'Gear',
    'ui.prep.reach': 'Line reach',
    'ui.prep.hot': 'In demand at the market today',
    'ui.prep.hotNone': 'Nothing special today.',
    'ui.prep.hotMult': '★ ×{mult}',
    // conditions and forecast (day rows have 34 px of small font for the label)
    'ui.prep.noForecast': 'Forecasts need a Weather Station.',
    'ui.prep.introSun': 'The first dives are always sunny.',
    'ui.prep.today': 'today',
    'ui.prep.tomorrow': '+1 day',
    'ui.prep.dayAfter': '+2 days',
    // fish forecast (section under the weather, 168 px): time in normal font, period · weather small on the right;
    // fish row = name + depth. fishNone = only the fish that always bite; fishShow / fishHide = the collapse/expand row
    // (the UI adds " ▸" / " ▴", at most 157 px; "day after tomorrow" would push the header onto two lines)
    'ui.prep.fish': 'What bites when',
    'ui.prep.fishNow': 'now',
    'ui.prep.fishTomorrow': 'tomorrow {time}',
    'ui.prep.fishDayAfter': 'in 2 days, {time}',
    'ui.prep.fishDay': 'day {n}, {time}',
    'ui.prep.fishCond': '{period} · {weather}',
    'ui.prep.fishNone': 'only common fish',
    'ui.prep.fishShow': { one: 'Next hours ({n} change)', other: 'Next hours ({n} changes)' },
    'ui.prep.fishHide': 'Hide forecast',
    // bait card: how many the player takes on the dive
    'ui.prep.carry': { one: 'taking {n}', other: 'taking {n}' },
    'ui.prep.unlimited': 'unlimited',
    // gear ({ms} = tolerance in milliseconds, {pct} = "60%")
    'ui.prep.noFloor': 'bottomless',
    'ui.prep.limitLighthouse': 'Deeper only with Lighthouse 3.',
    'ui.prep.limitFloor': 'Reaches the seabed.',
    // Nuclear Lake: same sentence slot as limitLighthouse (148 px, normal font)
    'ui.prep.limitShipyard': 'Deeper with a better Shipyard.',
    'ui.prep.limitCore': 'Reaches the core.',
    'ui.prep.rodTolerance': 'rhythm +{ms}\u00a0ms',
    'ui.prep.rodBasic': 'basic',
    'ui.prep.hookEscape': 'escape –{pct}',
    'ui.prep.hookBasic': 'basic',
    'ui.prep.harpoons': 'Harpoons',
    'ui.prep.harpoonCount': { one: '×{n}', other: '×{n}' },
    'ui.prep.harpoonNone': 'none',
    'ui.prep.harpoonLocked': 'Workshop 2',
    'ui.prep.storage': 'Hut',
    'ui.prep.storageFull': 'full — catch sells at once',
    // {stored} = fish in the Hut, {n} = capacity (form follows the capacity)
    'ui.prep.storageCount': { one: '{stored} / {n} fish', other: '{stored} / {n} fish' },
    // side panels (PC)
    'ui.prep.panel.weather': 'Weather',
    'ui.prep.panel.weatherHint': 'The Weather Station shows what weather is coming. Some fish only bite in rain, fog or a storm.',
    'ui.prep.panel.now': 'now',
    'ui.prep.panel.dayTime': '{day}, {time}',
    'ui.prep.panel.reach': 'Reach',
    'ui.prep.panel.depthRule': 'The deeper you are, the heavier a fish on the line: three times as heavy at 500\u00a0meters.',
    'ui.prep.panel.keyDive': 'Enter  dive',
    'ui.prep.panel.keyBack': 'Esc  back to village',
    'ui.prep.panel.keyBackPlant': 'Esc  back to power plant',
  });
})(globalThis.HL);
