// English — village scene (ui/village.js). Keys ui.village.*  Side panels 94 px (small font ≈ 4 px/char, wraps),
// building tag up to ~170 px, main button SET SAIL 104 px (caps 6 px/char), tutorial 146 px per line (wraps).
(function (HL) {
  HL.i18n.add('en', 'village', {
    'ui.village.toSea': 'SET SAIL',
    // tap on time/weather in the header (toast): {period} = part of day, {weather}/{next} = weather in lower case
    'ui.village.hud.now': '{period}, {weather}',
    'ui.village.hud.forecast': '{period}, {weather}. At {time}: {next}',
    'ui.village.hud.noForecast': '{period}, {weather}. Forecasts need a Weather Station.',
    // tag above a building (cursor/focus); {money} = price, {level} = level
    'ui.village.tag.build': 'Build: {money}',
    'ui.village.tag.level': 'Level {level} · next {money}',
    'ui.village.tag.done': 'Level 3 · complete',
    'ui.village.tag.sell': { one: 'Sell {n} fish', other: 'Sell {n} fish' },
    'ui.village.tag.sellNone': 'Sell fish',
    // forecast segment (also on the Weather Station screen): {from}–{to} = hours 06:00–09:00, {n} = day number
    'ui.village.seg.today': '{from}–{to}',
    'ui.village.seg.tomorrow': 'tomorrow {from}–{to}',
    'ui.village.seg.later': 'day {n} {from}–{to}',
    // first-visit tutorial
    'ui.village.tut.title': 'Welcome to Hlbina',
    'ui.village.tut.text': 'Turn a ruined hut into a fishing village. SET SAIL, catch fish and sell them at the Market. Put your earnings into buildings; each one unlocks something new.',
    'ui.village.tut.warn': 'Careful: every fish and every meter of depth strains the line. If it snaps, your catch is gone.',
    'ui.village.tut.ok': 'Got it',
    // side panels (PC): left forecast and moon, right demand, storage, quests
    'ui.village.panel.forecast': 'Forecast',
    'ui.village.panel.noMeteo': 'Build a Weather Station to see what weather is coming.',
    'ui.village.panel.hours': 'next {h}\u00a0h',
    'ui.village.panel.intro': 'First dives: calm sea and sunshine.',
    'ui.village.panel.moon': 'Moon',
    'ui.village.panel.today': 'Today',
    'ui.village.panel.tomorrow': 'Tomorrow',
    'ui.village.panel.dayAfter': 'Day after',
    'ui.village.panel.noMoon': 'Weather Station level 3 shows moon phases.',
    'ui.village.panel.hot': 'Hot demand',
    'ui.village.panel.hotNone': 'Nothing special today.',
    'ui.village.panel.hotMult': '×{mult}',
    'ui.village.panel.storage': 'Storage',
    // {got} fish out of capacity {n}; form follows the capacity ("3 / 5 fish")
    'ui.village.panel.storageCount': { one: '{got} / {n} fish', other: '{got} / {n} fish' },
    'ui.village.panel.sellHint': 'Sell them at the Market.',
    'ui.village.panel.quests': 'Quests',
    'ui.village.panel.questsLocked': 'Fishers at the Tavern give quests from level 2.',
    // signpost to the Old Power Plant (Nuclear Lake, docs/JAZERO.md); toLake = main button 104 px like SET SAIL
    'ui.village.plant.name': 'Old Power Plant',
    'ui.village.plant.sub': 'Nuclear Lake',
    'ui.village.plant.toLake': 'TO THE LAKE',
    'ui.village.plant.intro': 'Build the Shipyard, buy a lake line and rod at the Laboratory, then go TO THE LAKE.',
    'ui.village.plant.zones': 'Lake zones',
    'ui.village.plant.reach': 'Lake reach',
    'ui.village.plant.fish': 'Lake fish',
  });
})(globalThis.HL);
