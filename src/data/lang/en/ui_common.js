// English — shared screen texts (ui/common.js, core/main.js, language picker, trip line). Keys ui.common.*
(function (HL) {
  HL.i18n.add('en', 'ui_common', {
    // save badge ( ' — ' = where a long text may split into alternating halves)
    'ui.common.save.nosave': 'Game is not saving',
    'ui.common.save.stale': 'Game is open in another tab — changes are not saved',
    'ui.common.moreBelow': '↓ more',
    // size tier tag (HL.ui.tierTag) — short, drawn as a tab above the fight panel
    'ui.common.tier.velky': 'BIG ONE',
    'ui.common.tier.trofejny': 'TROPHY',
    // language picker (title screen, Settings)
    'ui.common.lang.title': 'Language',
    'ui.common.lang.soon': 'soon',
    'ui.common.close': 'Close',
    // trip (HL.data.tripLine): "Trip: 3 dives · 5 fish · €120"
    'ui.common.tripLine': 'Trip: {dives} · {fish} · {value}',
    'ui.common.tripDives': { one: '{n} dive', other: '{n} dives' },
    'ui.common.tripFish': { one: '{n} fish', other: '{n} fish' },
    // phone held sideways (in the side margin, two lines)
    'ui.common.rotate1': 'Rotate phone',
    'ui.common.rotate2': 'to portrait',
    // default side panels (PC); control rows: keys / indented description
    'ui.common.panel.controls': 'Controls',
    'ui.common.panel.keysMove': 'A / D, mouse',
    'ui.common.panel.move': 'hook sideways',
    'ui.common.panel.keysSink': 'S, left button',
    'ui.common.panel.sink': 'sink',
    'ui.common.panel.keysTap': 'Space, click',
    'ui.common.panel.fight': 'fight a fish',
    'ui.common.panel.up': 'UP',
    'ui.common.panel.harpoon': 'harpoon',
    'ui.common.panel.pause': 'pause / back',
    'ui.common.panel.f2': 'F2 tuning',
    'ui.common.panel.f3': 'F3 debug info',
    'ui.common.panel.money': 'Money',
    'ui.common.panel.day': 'Day',
    'ui.common.panel.time': 'Time',
    'ui.common.panel.weather': 'Weather',
    'ui.common.panel.moon': 'Moon',
    // red bar at the bottom on a script error ({msg} = technical message, not translated)
    'ui.common.errorBar': 'ERROR: {msg}',
  });
})(globalThis.HL);
