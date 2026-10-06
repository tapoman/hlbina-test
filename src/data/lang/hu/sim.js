// Preklad hu / sim — texty simulácie (sim/*.js). Kľúče = src/data/lang/sk/sim.js. Szójegyzék: hu/data.js.
// Maďarčina: po číslovke jednotné číslo („3 angolnát“) — tvary one/other sa líšia len tým, že one je bez čísla.
(function (HL) {
  HL.i18n.add('hu', 'sim', {
    // --- falu: miért nem lehet valamit (reasonKey)
    'sim.village.needBuilding': 'Kell: {building} ({level}. szint)',
    'sim.village.needLegend': 'Előbb fogd ki: {legend}',
    'sim.village.maxLevel': 'Legmagasabb szint',
    'sim.village.noMoney': 'Nincs elég pénz',
    'sim.village.notSold': 'Nem kapható',
    'sim.village.equipped': 'Felvéve',
    'sim.village.owned': 'Megvan',
    'sim.village.harpoonFull': 'Több szigonyt nem bírsz el',
    'sim.village.goldSoldOut': 'Ma már nincs aranycsali. Gyere vissza holnap.',
    // Atomtó (docs/JAZERO.md): tavi felszerelés nélkül nem lehet a tóra menni (ugyanaz a „Kell:“ forma)
    'sim.village.needLakeLine': 'Kell: tavi zsinór a Laboratóriumból',
    'sim.village.needLakeRod': 'Kell: tavi bot a Laboratóriumból',
    // épület neve a „Kell: {building} ({level}. szint)“ mondatban (magyarul alanyeset)
    'sim.village.acc.chatrc': 'Kunyhó',
    'sim.village.acc.trhovisko': 'Piac',
    'sim.village.acc.dielna': 'Műhely',
    'sim.village.acc.navnadaren': 'Csalibolt',
    'sim.village.acc.meteostanica': 'Meteoállomás',
    'sim.village.acc.majak': 'Világítótorony',
    'sim.village.acc.krcma': 'Kocsma',
    'sim.village.acc.akvarium': 'Akvárium',
    'sim.village.acc.lodenica': 'Hajóműhely',
    'sim.village.acc.laboratorium': 'Laboratórium',

    // --- feladatok a Kocsmában
    'sim.quest.catch': 'Fogj {what}',
    'sim.quest.catchCond': 'Fogj {what} {cond}',
    'sim.quest.depth': 'Merülj le {depth} mélyre, és térj vissza',
    'sim.quest.value': 'Hozz fel egy merülésből {money} értékű zsákmányt',
    'sim.quest.count': 'Hozz fel egy merülésből legalább {fish}',
    'sim.quest.countFish': { one: '{n} halat', other: '{n} halat' },
    // faj a feladatban (tárgyeset): one = egy darab szám nélkül („Fogj egy angolnát“), other számmal
    'sim.quest.fish.sardinka': { one: 'egy szardíniát', other: '{n} szardíniát' },
    'sim.quest.fish.okun': { one: 'egy tengeri sügért', other: '{n} tengeri sügért' },
    'sim.quest.fish.krab': { one: 'egy rákot', other: '{n} rákot' },
    'sim.quest.fish.platesa': { one: 'egy lepényhalat', other: '{n} lepényhalat' },
    'sim.quest.fish.makrela': { one: 'egy makrélát', other: '{n} makrélát' },
    'sim.quest.fish.pyskac': { one: 'egy ajakoshalat', other: '{n} ajakoshalat' },
    'sim.quest.fish.papagajovka': { one: 'egy papagájhalat', other: '{n} papagájhalat' },
    'sim.quest.fish.zubatica': { one: 'egy fogashalat', other: '{n} fogashalat' },
    'sim.quest.fish.murena': { one: 'egy murénát', other: '{n} murénát' },
    'sim.quest.fish.barakuda': { one: 'egy barrakudát', other: '{n} barrakudát' },
    'sim.quest.fish.svetlonoska': { one: 'egy lámpáshalat', other: '{n} lámpáshalat' },
    'sim.quest.fish.treska': { one: 'egy tőkehalat', other: '{n} tőkehalat' },
    'sim.quest.fish.uhor': { one: 'egy angolnát', other: '{n} angolnát' },
    'sim.quest.fish.tuniak': { one: 'egy tonhalat', other: '{n} tonhalat' },
    'sim.quest.fish.mesacnica': { one: 'egy ezüst holdhalat', other: '{n} ezüst holdhalat' },
    'sim.quest.fish.lampasnik': { one: 'egy lámpás ördöghalat', other: '{n} lámpás ördöghalat' },
    'sim.quest.fish.pazravy': { one: 'egy falánk angolnát', other: '{n} falánk angolnát' },
    'sim.quest.fish.raja': { one: 'egy ködös ráját', other: '{n} ködös ráját' },
    'sim.quest.fish.sklenena': { one: 'egy üveghalat', other: '{n} üveghalat' },
    'sim.quest.fish.velkoustka': { one: 'egy nagyszájú halat', other: '{n} nagyszájú halat' },
    'sim.quest.fish.latimeria': { one: 'egy bojtosúszós halat', other: '{n} bojtosúszós halat' },
    'sim.quest.fish.sled': { one: 'egy vándorheringet', other: '{n} vándorheringet' },
    'sim.quest.fish.tekvicovka': { one: 'egy tökhalat', other: '{n} tökhalat' },
    'sim.quest.fish.prizrak': { one: 'egy kísértethalat', other: '{n} kísértethalat' },
    // a feladat feltétele („Fogj 3 angolnát éjjel“)
    'sim.quest.cond.morning': 'reggel',
    'sim.quest.cond.day': 'napközben',
    'sim.quest.cond.evening': 'este',
    'sim.quest.cond.night': 'éjjel',
    'sim.quest.cond.sun': 'napsütésben',
    'sim.quest.cond.cloudy': 'felhős időben',
    'sim.quest.cond.rain': 'esőben',
    'sim.quest.cond.fog': 'ködben',
    'sim.quest.cond.storm': 'viharban',
    'sim.quest.cond.fullmoon': 'teliholdkor',
    'sim.quest.cond.newmoon': 'újholdkor',

    // --- legendák nyomai (Kocsma 3)
    'sim.clue.caught': 'Kifogva. A trófea az Akváriumba való.',
    'sim.clue.text': '{hint} Feltételek: {conds}. Zóna: {zone}.',

    // --- világ
    'sim.world.day': '{n}. nap',
    'sim.world.clear': 'Derült',

    // --- karrier és mentés ({detail} = technikai ok, nem fordítjuk)
    'sim.game.noStorage': 'A mentés nem elérhető — nincs honnan visszaállítani.',
    'sim.game.noBackup': 'Egyik biztonsági mentés sem tölthető be.',
    'sim.game.stale': 'A játék egy másik lapon is nyitva — ez a lap már nem ment. Töltsd újra az oldalt.',
    'sim.save.corrupt': 'Nincs mentve, a játékállapot sérült: {detail}',
    'sim.save.writeFailed': 'A mentés nem sikerült: {detail}',
    'sim.save.unavailable': 'A tárhely nem elérhető: {detail}',
    'sim.save.loadFailed': 'A mentés nem tölthető be: {detail}',
    'sim.save.settingsLoad': 'A beállítások nem tölthetők be: {detail}',
    'sim.save.settingsStore': 'A beállítások nem menthetők: {detail}',
  });
})(globalThis.HL);
