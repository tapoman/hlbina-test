// Slovenčina — texty simulácie (sim/*.js). ZDROJ prekladu: iné jazyky prekladajú tieto kľúče
// (src/data/lang/<kód>/sim.js). Pravidlá: docs/I18N.md — {meno} = náhrada, { one, few, other } = tvary
// množného čísla (slovenčina: 1 / 2–4 / 0 a 5+), {n} = počet.
(function (HL) {
  HL.i18n.add('sk', 'sim', {
    // --- dedina: dôvody, prečo sa niečo nedá (Offer.reason, upgradeInfo.reason; kľúč je v reasonKey)
    'sim.village.needBuilding': 'Treba {building} na úrovni {level}',
    'sim.village.needLegend': 'Treba chytiť legendu {legend}',
    'sim.village.maxLevel': 'Najvyššia úroveň',
    'sim.village.noMoney': 'Nedostatok peňazí',
    'sim.village.notSold': 'Nepredáva sa',
    'sim.village.equipped': 'Nasadené',
    'sim.village.owned': 'Vlastníš',
    'sim.village.harpoonFull': 'Viac harpún neunesieš',
    'sim.village.goldSoldOut': 'Dnes už zlatú návnadu nemajú. Príď zajtra.',
    // jadrové jazero (docs/JAZERO.md): bez jazernej výbavy z Laboratória sa na jazero nedá
    'sim.village.needLakeLine': 'Treba jazerný vlasec z Laboratória',
    'sim.village.needLakeRod': 'Treba jazerný prút z Laboratória',
    // akuzatív budovy do vety "Treba {building} na úrovni {level}"
    'sim.village.acc.chatrc': 'Chatrč',
    'sim.village.acc.trhovisko': 'Trhovisko',
    'sim.village.acc.dielna': 'Dielňu',
    'sim.village.acc.navnadaren': 'Návnadáreň',
    'sim.village.acc.meteostanica': 'Meteostanicu',
    'sim.village.acc.majak': 'Maják',
    'sim.village.acc.krcma': 'Krčmu',
    'sim.village.acc.akvarium': 'Akvárium',
    'sim.village.acc.lodenica': 'Lodenicu',
    'sim.village.acc.laboratorium': 'Laboratórium',

    // --- úlohy v Krčme
    'sim.quest.catch': 'Chyť {what}',
    'sim.quest.catchCond': 'Chyť {what} {cond}',
    'sim.quest.depth': 'Ponor sa do hĺbky {depth} a vráť sa',
    'sim.quest.value': 'Vylov za jeden ponor úlovok za {money}',
    'sim.quest.count': 'Vynes z jedného ponoru aspoň {fish}',
    'sim.quest.countFish': { one: '{n} rybu', few: '{n} ryby', other: '{n} rýb' },
    // druh v úlohe (akuzatív): one = jeden kus BEZ čísla ("Chyť úhora"), few/other s číslom
    'sim.quest.fish.sardinka': { one: 'sardinku', few: '{n} sardinky', other: '{n} sardiniek' },
    'sim.quest.fish.okun': { one: 'morského okúňa', few: '{n} morské okúne', other: '{n} morských okúňov' },
    'sim.quest.fish.krab': { one: 'kraba', few: '{n} kraby', other: '{n} krabov' },
    'sim.quest.fish.platesa': { one: 'platesu', few: '{n} platesy', other: '{n} platies' },
    'sim.quest.fish.makrela': { one: 'makrelu', few: '{n} makrely', other: '{n} makriel' },
    'sim.quest.fish.pyskac': { one: 'pyskáča', few: '{n} pyskáče', other: '{n} pyskáčov' },
    'sim.quest.fish.papagajovka': { one: 'papagájovku', few: '{n} papagájovky', other: '{n} papagájoviek' },
    'sim.quest.fish.zubatica': { one: 'zubaticu', few: '{n} zubatice', other: '{n} zubatíc' },
    'sim.quest.fish.murena': { one: 'mureňu', few: '{n} murene', other: '{n} murén' },
    'sim.quest.fish.barakuda': { one: 'barakudu', few: '{n} barakudy', other: '{n} barakúd' },
    'sim.quest.fish.svetlonoska': { one: 'svetlonosku', few: '{n} svetlonosky', other: '{n} svetlonosiek' },
    'sim.quest.fish.treska': { one: 'tresku', few: '{n} tresky', other: '{n} tresiek' },
    'sim.quest.fish.uhor': { one: 'úhora', few: '{n} úhory', other: '{n} úhorov' },
    'sim.quest.fish.tuniak': { one: 'tuniaka', few: '{n} tuniaky', other: '{n} tuniakov' },
    'sim.quest.fish.mesacnica': { one: 'striebristú mesačnicu', few: '{n} striebristé mesačnice', other: '{n} striebristých mesačníc' },
    'sim.quest.fish.lampasnik': { one: 'hlbinára s lampášom', few: '{n} hlbinárov s lampášom', other: '{n} hlbinárov s lampášom' },
    'sim.quest.fish.pazravy': { one: 'pažravého úhora', few: '{n} pažravé úhory', other: '{n} pažravých úhorov' },
    'sim.quest.fish.raja': { one: 'hmlistú raju', few: '{n} hmlisté raje', other: '{n} hmlistých rají' },
    'sim.quest.fish.sklenena': { one: 'sklenenú rybu', few: '{n} sklenené ryby', other: '{n} sklenených rýb' },
    'sim.quest.fish.velkoustka': { one: 'veľkoústku', few: '{n} veľkoústky', other: '{n} veľkoústok' },
    'sim.quest.fish.latimeria': { one: 'latimériu', few: '{n} latimérie', other: '{n} latimérií' },
    'sim.quest.fish.sled': { one: 'sťahovavého sleďa', few: '{n} sťahovavé slede', other: '{n} sťahovavých sleďov' },
    'sim.quest.fish.tekvicovka': { one: 'tekvicovku', few: '{n} tekvicovky', other: '{n} tekvicoviek' },
    'sim.quest.fish.prizrak': { one: 'prízračnú rybu', few: '{n} prízračné ryby', other: '{n} prízračných rýb' },
    // podmienka úlohy ("Chyť 3 úhory v noci")
    'sim.quest.cond.morning': 'ráno',
    'sim.quest.cond.day': 'cez deň',
    'sim.quest.cond.evening': 'večer',
    'sim.quest.cond.night': 'v noci',
    'sim.quest.cond.sun': 'za slnečného počasia',
    'sim.quest.cond.cloudy': 'pod mrakmi',
    'sim.quest.cond.rain': 'v daždi',
    'sim.quest.cond.fog': 'v hmle',
    'sim.quest.cond.storm': 'počas búrky',
    'sim.quest.cond.fullmoon': 'pri splne',
    'sim.quest.cond.newmoon': 'pri nove',

    // --- stopy k legendám (Krčma L3)
    'sim.clue.caught': 'Chytená. Trofej patrí do Akvária.',
    'sim.clue.text': '{hint} Podmienky: {conds}. Pásmo: {zone}.',

    // --- svet
    'sim.world.day': 'Deň {n}',
    'sim.world.clear': 'Jasno',

    // --- kariéra a uloženie ({detail} = technická príčina, neprekladá sa)
    'sim.game.noStorage': 'Hra sa neukladá — niet odkiaľ obnoviť.',
    'sim.game.noBackup': 'Žiadna záloha sa nedá načítať.',
    'sim.game.stale': 'Hra je otvorená v inej karte — táto karta už neukladá. Načítaj stránku znova.',
    'sim.save.corrupt': 'Neuložené, stav hry je poškodený: {detail}',
    'sim.save.writeFailed': 'Uloženie zlyhalo: {detail}',
    'sim.save.unavailable': 'Úložisko nedostupné: {detail}',
    'sim.save.loadFailed': 'Uloženie sa nedá načítať: {detail}',
    'sim.save.settingsLoad': 'Nastavenia sa nedajú načítať: {detail}',
    'sim.save.settingsStore': 'Nastavenia sa nedajú uložiť: {detail}',
  });
})(globalThis.HL);
