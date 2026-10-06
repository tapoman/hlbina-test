// English — Endless Deep mode menu (ui/endless.js). Keys ui.endless.*  Sentences 164 px (wrap), gear name 60–71 px,
// leaderboard header small font right-aligned (Depth ~50 px, Catch ~55 px, Day only ~34 px), lock text 106 px,
// button 168 px, side panel 94 px. {every} = "250 m" (HL.util.meters).
(function (HL) {
  HL.i18n.add('en', 'endless', {
    'ui.endless.title': 'Endless Deep',
    'ui.endless.subUnlocked': 'Lighthouse 3 · unlocked',
    'ui.endless.locked': 'Locked',
    'ui.endless.dive': 'DIVE',
    'ui.endless.descUnlocked': 'One long dive with fixed gear, no village, no market. Every {every}, pick 1 of 3 upgrades. Goal: the deepest dive and the richest catch.',
    'ui.endless.descLocked': 'One long dive with fixed gear, no village, no market. Every {every}, pick 1 of 3 upgrades.',
    // fixed gear (other names come from data)
    'ui.endless.gear': 'Fixed gear',
    'ui.endless.harpoons': 'Harpoon ×{n}',
    'ui.endless.baitMix': 'Bait mix',
    // leaderboard
    'ui.endless.board': 'Leaderboard · top 10',
    'ui.endless.boardEmpty': 'Empty so far. Your first dive goes here — depth and catch value.',
    'ui.endless.col.depth': 'Depth',
    'ui.endless.col.value': 'Catch',
    'ui.endless.col.day': 'Day',
    'ui.endless.rank': '{n}.',
    'ui.endless.boardNote': 'Saved on this device only. The web version has no global leaderboards (Steam, Game Center).',
    'ui.endless.boardNoteCg': 'The leaderboard is saved together with your progress.',
    'ui.endless.perksExample': 'Upgrades, for example',
    // locked
    'ui.endless.unlockBy': 'Unlocked by Lighthouse level 3.',
    'ui.endless.yourMajak': 'Your Lighthouse',
    'ui.endless.level': 'level {level} / 3',
    'ui.endless.majakAlso': 'Lighthouse level 3 also opens the Abyss in your career. For that you need to catch the Mist Lady.',
    // side panels (PC)
    'ui.endless.panel.perks': 'Upgrades',
    'ui.endless.panel.every': 'every {every}, 1 of 3',
    'ui.endless.panel.records': 'Records',
    'ui.endless.panel.deepest': 'Deepest',
    'ui.endless.panel.richest': 'Richest catch',
    'ui.endless.panel.entries': 'Entries',
    'ui.endless.panel.keyDive': 'S / Enter: dive',
    'ui.endless.panel.keyBack': 'Esc: back',
  });
})(globalThis.HL);
