// Čeština — texty simulácie (sim/*.js). Kľúče = src/data/lang/sk/sim.js; glosár v data.js.
// Množné číslo cs: one (1) / few (2–4) / other (0, 5+).
(function (HL) {
  HL.i18n.add('cs', 'sim', {
    // --- vesnice: důvody, proč něco nejde
    'sim.village.needBuilding': 'Chce to {building} na úrovni {level}',
    'sim.village.needLegend': 'Chce to chytit legendu {legend}',
    'sim.village.maxLevel': 'Nejvyšší úroveň',
    'sim.village.noMoney': 'Nedostatek peněz',
    'sim.village.notSold': 'Neprodává se',
    'sim.village.equipped': 'Nasazeno',
    'sim.village.owned': 'Vlastníš',
    'sim.village.harpoonFull': 'Víc harpun neuneseš',
    'sim.village.goldSoldOut': 'Dnes už zlatou návnadu nemají. Přijď zítra.',
    // jaderné jezero (docs/JAZERO.md): bez jezerní výbavy z Laboratoře se na jezero nedá
    'sim.village.needLakeLine': 'Chce to jezerní vlasec z Laboratoře',
    'sim.village.needLakeRod': 'Chce to jezerní prut z Laboratoře',
    // akuzativ budovy do věty "Chce to {building} na úrovni {level}"
    'sim.village.acc.chatrc': 'Chatrč',
    'sim.village.acc.trhovisko': 'Tržiště',
    'sim.village.acc.dielna': 'Dílnu',
    'sim.village.acc.navnadaren': 'Návnadárnu',
    'sim.village.acc.meteostanica': 'Meteostanici',
    'sim.village.acc.majak': 'Maják',
    'sim.village.acc.krcma': 'Hospodu',
    'sim.village.acc.akvarium': 'Akvárium',
    'sim.village.acc.lodenica': 'Loděnici',
    'sim.village.acc.laboratorium': 'Laboratoř',

    // --- úkoly v Hospodě
    'sim.quest.catch': 'Chyť {what}',
    'sim.quest.catchCond': 'Chyť {what} {cond}',
    'sim.quest.depth': 'Ponoř se do hloubky {depth} a vrať se',
    'sim.quest.value': 'Vylov za jeden ponor úlovek za {money}',
    'sim.quest.count': 'Vynes z jednoho ponoru aspoň {fish}',
    'sim.quest.countFish': { one: '{n} rybu', few: '{n} ryby', other: '{n} ryb' },
    // druh v úkolu (akuzativ): one = jeden kus BEZ čísla ("Chyť úhoře"), few/other s číslem
    'sim.quest.fish.sardinka': { one: 'sardinku', few: '{n} sardinky', other: '{n} sardinek' },
    'sim.quest.fish.okun': { one: 'mořského okouna', few: '{n} mořské okouny', other: '{n} mořských okounů' },
    'sim.quest.fish.krab': { one: 'kraba', few: '{n} kraby', other: '{n} krabů' },
    'sim.quest.fish.platesa': { one: 'platýse', few: '{n} platýse', other: '{n} platýsů' },
    'sim.quest.fish.makrela': { one: 'makrelu', few: '{n} makrely', other: '{n} makrel' },
    'sim.quest.fish.pyskac': { one: 'pyskouna', few: '{n} pyskouny', other: '{n} pyskounů' },
    'sim.quest.fish.papagajovka': { one: 'ploskozubce', few: '{n} ploskozubce', other: '{n} ploskozubců' },
    'sim.quest.fish.zubatica': { one: 'pražmu', few: '{n} pražmy', other: '{n} pražem' },
    'sim.quest.fish.murena': { one: 'murénu', few: '{n} murény', other: '{n} murén' },
    'sim.quest.fish.barakuda': { one: 'barakudu', few: '{n} barakudy', other: '{n} barakud' },
    'sim.quest.fish.svetlonoska': { one: 'lampovníka', few: '{n} lampovníky', other: '{n} lampovníků' },
    'sim.quest.fish.treska': { one: 'tresku', few: '{n} tresky', other: '{n} tresek' },
    'sim.quest.fish.uhor': { one: 'úhoře', few: '{n} úhoře', other: '{n} úhořů' },
    'sim.quest.fish.tuniak': { one: 'tuňáka', few: '{n} tuňáky', other: '{n} tuňáků' },
    'sim.quest.fish.mesacnica': { one: 'stříbrného měsíčníka', few: '{n} stříbrné měsíčníky', other: '{n} stříbrných měsíčníků' },
    'sim.quest.fish.lampasnik': { one: 'ďasa s lucernou', few: '{n} ďasy s lucernou', other: '{n} ďasů s lucernou' },
    'sim.quest.fish.pazravy': { one: 'žravého úhoře', few: '{n} žravé úhoře', other: '{n} žravých úhořů' },
    'sim.quest.fish.raja': { one: 'mlžného rejnoka', few: '{n} mlžné rejnoky', other: '{n} mlžných rejnoků' },
    'sim.quest.fish.sklenena': { one: 'skleněnou rybu', few: '{n} skleněné ryby', other: '{n} skleněných ryb' },
    'sim.quest.fish.velkoustka': { one: 'hltouna', few: '{n} hltouny', other: '{n} hltounů' },
    'sim.quest.fish.latimeria': { one: 'latimérii', few: '{n} latimérie', other: '{n} latimérií' },
    'sim.quest.fish.sled': { one: 'tažného sledě', few: '{n} tažné sledě', other: '{n} tažných sleďů' },
    'sim.quest.fish.tekvicovka': { one: 'dýňovku', few: '{n} dýňovky', other: '{n} dýňovek' },
    'sim.quest.fish.prizrak': { one: 'přízračnou rybu', few: '{n} přízračné ryby', other: '{n} přízračných ryb' },
    // podmínka úkolu ("Chyť 3 úhoře v noci")
    'sim.quest.cond.morning': 'ráno',
    'sim.quest.cond.day': 'přes den',
    'sim.quest.cond.evening': 'večer',
    'sim.quest.cond.night': 'v noci',
    'sim.quest.cond.sun': 'za slunečného počasí',
    'sim.quest.cond.cloudy': 'pod mraky',
    'sim.quest.cond.rain': 'v dešti',
    'sim.quest.cond.fog': 'v mlze',
    'sim.quest.cond.storm': 'během bouřky',
    'sim.quest.cond.fullmoon': 'za úplňku',
    'sim.quest.cond.newmoon': 'za novu',

    // --- stopy k legendám (Hospoda L3)
    'sim.clue.caught': 'Chycena. Trofej patří do Akvária.',
    'sim.clue.text': '{hint} Podmínky: {conds}. Pásmo: {zone}.',

    // --- svět
    'sim.world.day': 'Den {n}',
    'sim.world.clear': 'Jasno',

    // --- kariéra a ukládání ({detail} = technická příčina, nepřekládá se)
    'sim.game.noStorage': 'Hra se neukládá — není odkud obnovit.',
    'sim.game.noBackup': 'Žádnou zálohu nelze načíst.',
    'sim.game.stale': 'Hra je otevřená v jiné kartě — tato karta už neukládá. Načti stránku znovu.',
    'sim.save.corrupt': 'Neuloženo, stav hry je poškozený: {detail}',
    'sim.save.writeFailed': 'Uložení selhalo: {detail}',
    'sim.save.unavailable': 'Úložiště nedostupné: {detail}',
    'sim.save.loadFailed': 'Uloženou hru nelze načíst: {detail}',
    'sim.save.settingsLoad': 'Nastavení nelze načíst: {detail}',
    'sim.save.settingsStore': 'Nastavení nelze uložit: {detail}',
  });
})(globalThis.HL);
