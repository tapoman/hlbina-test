// English — simulation texts (sim/*.js). Same keys as src/data/lang/sk/sim.js; glossary in en/data.js.
// Plural keys: en uses { one, other }. sim.quest.fish.<id>: `one` is a single fish WITHOUT a number ("Catch an eel").
(function (HL) {
  HL.i18n.add('en', 'sim', {
    // --- village: why something can't be done (Offer.reason, upgradeInfo.reason; the key is in reasonKey)
    'sim.village.needBuilding': 'Needs {building} level {level}',
    'sim.village.needLegend': 'Catch the legend {legend} first',
    'sim.village.maxLevel': 'Max level',
    'sim.village.noMoney': 'Not enough money',
    'sim.village.notSold': 'Not for sale',
    'sim.village.equipped': 'Equipped',
    'sim.village.owned': 'Owned',
    'sim.village.harpoonFull': "Can't carry more harpoons",
    'sim.village.goldSoldOut': 'No golden bait left today. Come back tomorrow.',
    // Nuclear Lake (docs/JAZERO.md): no lake gear from the Laboratory = no trip to the lake
    'sim.village.needLakeLine': 'Needs a lake line from the Laboratory',
    'sim.village.needLakeRod': 'Needs a lake rod from the Laboratory',
    // building name inside "Needs {building} level {level}"
    'sim.village.acc.chatrc': 'Hut',
    'sim.village.acc.trhovisko': 'Market',
    'sim.village.acc.dielna': 'Workshop',
    'sim.village.acc.navnadaren': 'Bait Shop',
    'sim.village.acc.meteostanica': 'Weather Station',
    'sim.village.acc.majak': 'Lighthouse',
    'sim.village.acc.krcma': 'Tavern',
    'sim.village.acc.akvarium': 'Aquarium',
    'sim.village.acc.lodenica': 'Shipyard',
    'sim.village.acc.laboratorium': 'Laboratory',

    // --- Tavern quests
    'sim.quest.catch': 'Catch {what}',
    'sim.quest.catchCond': 'Catch {what} {cond}',
    'sim.quest.depth': 'Dive to {depth} and come back',
    'sim.quest.value': 'Land a catch worth {money} in one dive',
    'sim.quest.count': 'Bring back at least {fish} from one dive',
    'sim.quest.countFish': { one: '{n} fish', other: '{n} fish' },
    'sim.quest.fish.sardinka': { one: 'a sardine', other: '{n} sardines' },
    'sim.quest.fish.okun': { one: 'a sea bass', other: '{n} sea bass' },
    'sim.quest.fish.krab': { one: 'a crab', other: '{n} crabs' },
    'sim.quest.fish.platesa': { one: 'a flounder', other: '{n} flounder' },
    'sim.quest.fish.makrela': { one: 'a mackerel', other: '{n} mackerel' },
    'sim.quest.fish.pyskac': { one: 'a wrasse', other: '{n} wrasse' },
    'sim.quest.fish.papagajovka': { one: 'a parrotfish', other: '{n} parrotfish' },
    'sim.quest.fish.zubatica': { one: 'a sea bream', other: '{n} sea bream' },
    'sim.quest.fish.murena': { one: 'a moray eel', other: '{n} moray eels' },
    'sim.quest.fish.barakuda': { one: 'a barracuda', other: '{n} barracudas' },
    'sim.quest.fish.svetlonoska': { one: 'a lanternfish', other: '{n} lanternfish' },
    'sim.quest.fish.treska': { one: 'a cod', other: '{n} cod' },
    'sim.quest.fish.uhor': { one: 'an eel', other: '{n} eels' },
    'sim.quest.fish.tuniak': { one: 'a tuna', other: '{n} tuna' },
    'sim.quest.fish.mesacnica': { one: 'a silver moonfish', other: '{n} silver moonfish' },
    'sim.quest.fish.lampasnik': { one: 'an anglerfish', other: '{n} anglerfish' },
    'sim.quest.fish.pazravy': { one: 'a gulper eel', other: '{n} gulper eels' },
    'sim.quest.fish.raja': { one: 'a mist ray', other: '{n} mist rays' },
    'sim.quest.fish.sklenena': { one: 'a glassfish', other: '{n} glassfish' },
    'sim.quest.fish.velkoustka': { one: 'a swallower', other: '{n} swallowers' },
    'sim.quest.fish.latimeria': { one: 'a coelacanth', other: '{n} coelacanths' },
    'sim.quest.fish.sled': { one: 'a herring', other: '{n} herring' },
    'sim.quest.fish.tekvicovka': { one: 'a pumpkinfish', other: '{n} pumpkinfish' },
    'sim.quest.fish.prizrak': { one: 'a ghostfish', other: '{n} ghostfish' },
    // quest condition ("Catch 3 eels at night")
    'sim.quest.cond.morning': 'in the morning',
    'sim.quest.cond.day': 'during the day',
    'sim.quest.cond.evening': 'in the evening',
    'sim.quest.cond.night': 'at night',
    'sim.quest.cond.sun': 'in sunny weather',
    'sim.quest.cond.cloudy': 'under clouds',
    'sim.quest.cond.rain': 'in the rain',
    'sim.quest.cond.fog': 'in fog',
    'sim.quest.cond.storm': 'during a storm',
    'sim.quest.cond.fullmoon': 'at full moon',
    'sim.quest.cond.newmoon': 'at new moon',

    // --- legend clues (Tavern L3)
    'sim.clue.caught': 'Caught. Its trophy belongs in the Aquarium.',
    'sim.clue.text': '{hint} Conditions: {conds}. Zone: {zone}.',

    // --- world
    'sim.world.day': 'Day {n}',
    'sim.world.clear': 'Clear',

    // --- career and saving ({detail} = technical cause, not translated)
    'sim.game.noStorage': "The game isn't saving — nothing to restore from.",
    'sim.game.noBackup': 'No backup can be loaded.',
    'sim.game.stale': 'The game is open in another tab — this tab no longer saves. Reload the page.',
    'sim.save.corrupt': 'Not saved, the game state is damaged: {detail}',
    'sim.save.writeFailed': 'Saving failed: {detail}',
    'sim.save.unavailable': 'Storage unavailable: {detail}',
    'sim.save.loadFailed': "The save can't be loaded: {detail}",
    'sim.save.settingsLoad': "Settings can't be loaded: {detail}",
    'sim.save.settingsStore': "Settings can't be saved: {detail}",
  });
})(globalThis.HL);
