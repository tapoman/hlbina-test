// Slovenčina — scéna PONOR (ui/dive.js) vrátane karty na hladine a bočných panelov. ZDROJ prekladu
// (docs/I18N.md). Kľúče ui.dive.*  Text je ZNAK PO ZNAKU ten, ktorý bol predtým v kóde (− je U+2212,
// – je U+2013, — je U+2014, … je U+2026) — slovenská hra musí ostať pixel po pixeli rovnaká.
// Šírka (logické px; normálne písmo ≈ 5 px/znak, drobné ≈ 4 px): tlačidlo HORE a ovládač boja 64 px
// (HORE s ikonou), HARPÚNA 66 px, nápis (banner) 168 px vo dvojnásobnej veľkosti (dlhší sa zmenší),
// riadok karty na hladine 156 px (zalomí sa), bočné panely ~94 px, štítok napätia pod oblúkom 62 px.
(function (HL) {
  HL.i18n.add('sk', 'dive', {
    // --- spodná lišta, horná lišta, ovládač boja
    'ui.dive.up': 'HORE',
    'ui.dive.catchLabel': 'Úlovok',
    'ui.dive.fishCount': { one: '{n} ryba', few: '{n} ryby', other: '{n} rýb' },
    'ui.dive.count': '×{count}',                        // počet návnad / harpún na lište
    'ui.dive.baitMixShort': 'Zmes',                     // neobmedzená návnada bez mena (lišta, 36 px)
    'ui.dive.mult': '×{v}',                             // hĺbkový násobok napätia (↓×1,1)
    'ui.dive.loadKg': '{total} / {strength} kg',        // záťaž / pevnosť vlasca
    'ui.dive.pad.tap': 'ŤUKAJ!',
    'ui.dive.pad.wait': 'ČAKAJ',
    'ui.dive.harpoon': 'HARPÚNA',
    // bonus za veľký úlovok (sim/game.js haulBonus): lišta NAMIESTO „Úlovok" pár rýb pred prvým stupňom,
    // drobné písmo, najviac 54 px; {next} = od koľkých rýb (celé číslo). Stupeň sám je štítok „+10 %" (číslo, bez textu).
    'ui.dive.haulHint': 'Bonus od {next}',

    // --- nápisy (banner) a texty pri háčiku
    'ui.dive.banner.caught': 'CHYTENÁ!',
    'ui.dive.banner.legendCaught': 'LEGENDA!',
    'ui.dive.banner.legend': 'LEGENDA',
    'ui.dive.banner.bossPhase': 'FÁZA {phase}/3',
    'ui.dive.banner.bossPhaseSub': '{name} mení rytmus',
    'ui.dive.banner.knot': 'ZÁCHRANNÝ UZOL',
    'ui.dive.banner.knotSub': 'Vlasec vydržal, stratené: {fish}',
    // bonusový ponor: ryba v boji ušla a vzala všetko na udici (sim/dive.js 'haulLost')
    'ui.dive.banner.haulLost': 'ÚLOVOK JE PREČ',
    'ui.dive.banner.haulLostSub': 'Ryba ušla a vzala so sebou {fish}',
    'ui.dive.banner.safe': 'V BEZPEČÍ',
    'ui.dive.banner.up': 'SI HORE',
    'ui.dive.banner.safeSub': 'Úlovok {money} · {fish}',
    'ui.dive.banner.noCatch': 'Bez úlovku',
    'ui.dive.banner.zoneSub': '{from}–{to} · {desc}',  // rozsah pásma (from bez jednotky) a opis
    'ui.dive.banner.zoneSubOpen': 'od {from} · {desc}', // pásmo bez dna (Nekonečná hlbina)
    'ui.dive.fx.fightsBack': 'Bráni sa! −{pct}',
    'ui.dive.fx.escaped': 'Unikla!',
    'ui.dive.fx.legendLeft': '{name} odplávala',
    'ui.dive.fx.legendUnknown': 'Legenda',
    'ui.dive.fx.jelly': 'Medúza!',
    'ui.dive.fx.rockBlocked': 'Skala',
    'ui.dive.fx.rock': 'Skala! −{pct}',
    'ui.dive.fx.barrel': 'Sud! −{pct}',          // jadrové jazero: prekážka = hrdzavý sud
    'ui.dive.fx.barrelBlocked': 'Sud',
    'ui.dive.fx.sharkAte': 'Žralok zjedol: {name}',
    'ui.dive.fx.harpoonHit': 'Zásah!',
    'ui.dive.fx.baitOut': 'Došla návnada!',
    'ui.dive.fx.upBlocked': 'Počas boja sa hore nedá',
    'ui.dive.fx.lineEnd': 'Koniec vlasca: {depth}',
    'ui.dive.fx.weather': 'Počasie: {weather}',

    // --- značky nad svetom (žralok, chobotnica, úhor)
    'ui.dive.shark': 'ŽRALOK',
    'ui.dive.octopus.title': 'CHOBOTNICA!',
    'ui.dive.octopus.warn': 'chytí sa o {sec} s · HORE = uniknúť',
    'ui.dive.octopus.shake': 'TRHAJ DO STRÁN!',
    'ui.dive.eel.move': 'HÝB SA!',

    // --- panel boja
    'ui.dive.fight.rhythm': 'Rytmus: {name}',
    'ui.dive.fight.rhythmBoss': 'Rytmus: {name} · Fáza {phase}/{of}',
    'ui.dive.fight.rhythmUnknown': 'neznámy',
    'ui.dive.fight.pull': 'ŤAHÁ',
    'ui.dive.fight.slack': 'POVOLÍ',
    'ui.dive.fight.hooked': 'Zaseknutie',
    'ui.dive.fight.risk': 'Po zaseknutí až {after} / {strength} kg',
    'ui.dive.fight.riskSnap': 'Po zaseknutí až {after} / {strength} kg — praskne!',

    // --- prasknutie, vylepšenie (Nekonečná hlbina), pauza
    'ui.dive.snap.title': 'PRASKOL!',
    'ui.dive.snap.eel': 'Tieňový úhor prekusol vlasec',
    'ui.dive.snap.tension': 'Vlasec nevydržal napätie',
    'ui.dive.snap.nothing': 'Na vlasci nič nebolo',
    'ui.dive.lost': 'Stratené: {what}',
    'ui.dive.perk.title': 'VYLEPŠENIE',
    'ui.dive.perk.sub': 'Hĺbka {depth} · vyber jedno (1, 2, 3)',
    'ui.dive.pause.title': 'PAUZA',
    'ui.dive.pause.resume': 'Pokračovať',
    'ui.dive.pause.soundOn': 'Zvuk: zapnutý',
    'ui.dive.pause.soundOff': 'Zvuk: vypnutý',
    'ui.dive.pause.surface': 'Vyplávať (HORE)',
    'ui.dive.pause.hint': 'Esc alebo P = pokračovať',
    'ui.dive.pause.noSurface': 'Počas boja sa vyplávať nedá',

    // --- ľavý bočný panel (ponor aj hladina): hĺbka a ovládanie. Mená kláves (W, H, Esc, Enter, N) sú v kóde.
    'ui.dive.side.depth': 'HĹBKA',
    'ui.dive.side.line': 'Vlasec: {depth}',
    'ui.dive.side.lineEndless': 'Vlasec: bez konca',
    'ui.dive.side.deepest': 'Najhlbšie: {depth}',
    'ui.dive.help.title': 'Ovládanie',
    'ui.dive.help.moveKeys': 'A/D, myš',
    'ui.dive.help.move': 'do strán',
    'ui.dive.help.sinkKeys': 'S, ľavé tl.',
    'ui.dive.help.sink': 'klesanie',
    'ui.dive.help.tapKeys': 'Medzerník',
    'ui.dive.help.tap': 'boj',
    'ui.dive.help.up': 'HORE',
    'ui.dive.help.harpoon': 'harpúna',
    'ui.dive.help.pause': 'pauza',
    'ui.dive.help.again': 'znova dole',
    'ui.dive.help.dive': 'ponoriť sa',
    'ui.dive.help.bait': 'návnada',
    'ui.dive.help.harbour': 'Prístav',
    'ui.dive.help.shore': 'Breh',

    // --- pravý bočný panel: úlovok, napätie, predpoveď, pásmo, návnada
    'ui.dive.side.catch': 'ÚLOVOK',
    'ui.dive.side.lost': 'STRATENÉ',
    'ui.dive.side.nothingYet': 'Zatiaľ nič',
    'ui.dive.side.more': '+ ďalšie: {count}',
    'ui.dive.side.total': 'Spolu',
    'ui.dive.side.tension': 'NAPÄTIE',
    'ui.dive.side.depthMult': 'hĺbka {mult}',
    'ui.dive.part.fish': 'ryby na vlasci',
    'ui.dive.part.fight': 'ťah ryby',
    'ui.dive.part.spikes': 'zlé ťuky',
    'ui.dive.part.jelly': 'medúza',
    'ui.dive.part.octopus': 'chobotnica',
    'ui.dive.part.hazard': 'búrka',
    'ui.dive.forecast.title': 'Predpoveď',
    'ui.dive.forecast.now': 'teraz',
    'ui.dive.forecast.from': 'od {time}',
    'ui.dive.zone.title': 'V PÁSME',
    'ui.dive.zone.bait': 'návnada',
    'ui.dive.zone.ideal': 'ideálna',
    'ui.dive.zone.ok': 'berie',
    'ui.dive.zone.no': 'nie',
    'ui.dive.zone.bites': 'Berú na: {baits}',          // mená návnad malými písmenami (slovenská veta)
    'ui.dive.zone.legend': 'Legenda: {name}',
    'ui.dive.zone.hazards': 'Hrozí',
    'ui.dive.side.baitMix': 'Zmes návnad',
    'ui.dive.side.baitLeft': 'zostáva {count}',
    'ui.dive.side.baitUnlimited': 'neobmedzene',
    'ui.dive.side.harpoons': 'Harpúny: {count}',
    'ui.dive.side.lineKg': 'Vlasec: {kg}',
    'ui.dive.side.lineKgDamaged': 'Vlasec: {kg}, poškodený',
    'ui.dive.side.shed': 'Chatrč',

    // --- karta na hladine (riadok 156 px, zalomí sa; číslo sa od jednotky neodtrhne)
    'ui.dive.card.again': 'PONORIŤ SA ZNOVA',          // tlačidlo 112 px
    'ui.dive.card.harbour': 'PRÍSTAV',                  // tlačidlo 52 px
    'ui.dive.card.shore': 'BREH',                       // jadrové jazero: späť do Starej elektrárne (52 px)
    // Slovo, ktoré sa na čipe vynechá z konca mena návnady („Svietiaca návnada" → „Svietiaca", čip už
    // hovorí „Návnada:"). Jazyk bez takého slova: prázdny text ''.
    'ui.dive.card.baitNoun': 'návnada',
    'ui.dive.card.bait': 'Návnada: {name}',
    'ui.dive.card.baitCount': 'Návnada: {name} ×{count}',
    'ui.dive.card.noCatch': 'bez úlovku',
    'ui.dive.card.causeEel': 'Tieňový úhor prekusol vlasec.',
    'ui.dive.card.causeTension': 'Vlasec nevydržal napätie.',
    'ui.dive.card.baitLost': '{count}× {name}',         // stratené návnady (meno malými písmenami)
    'ui.dive.card.nothing': 'Na vlasci nič nebolo.',
    'ui.dive.card.stored': 'V Chatrči {count} / {cap}',
    'ui.dive.card.sold': { one: '{n} predaná za {money}', few: '{n} predané za {money}', other: '{n} predaných za {money}' },
    'ui.dive.card.soldFull': { one: 'Chatrč je plná · {n} predaná za {money}', few: 'Chatrč je plná · {n} predané za {money}', other: 'Chatrč je plná · {n} predaných za {money}' },
    'ui.dive.card.tryElse': 'Skús inú hĺbku, čas alebo návnadu.',
    // bonus za veľký úlovok, už vyplatený: {n} = rýb, {pct} = "10 %", {money} = "4 €" (najlepšie 1 riadok 156 px)
    'ui.dive.card.haul': { one: 'Bonus za {n} rybu: +{pct} → +{money}', few: 'Bonus za {n} ryby: +{pct} → +{money}', other: 'Bonus za {n} rýb: +{pct} → +{money}' },
    'ui.dive.card.baitRanOut': 'Došla návnada {from} → teraz {to}.',
    'ui.dive.card.rewardGold': { one: '+{n} zlatá', few: '+{n} zlatá', other: '+{n} zlatá' },
    'ui.dive.card.moreBadges': '… a ďalšie: {count}',
    // odznaky karty: štítok (drobné písmo na farbe) + text za ním
    'ui.dive.badge.quest': 'ÚLOHA',
    'ui.dive.badge.legend': 'LEGENDA',
    'ui.dive.badge.newSpecies': 'NOVÝ DRUH',
    'ui.dive.badge.record': 'REKORD',
    'ui.dive.badge.contest': 'SÚŤAŽ',
    'ui.dive.badge.contestWon': 'vyhral si! {name} {kg} · +{money}',
    'ui.dive.badge.contestProgress': 'tvoja {best} / cieľ {target}',
    'ui.dive.badge.prize': 'VÝHRA',
    'ui.dive.badge.prizeText': 'zo súťaže +{money} na účte',
    'ui.dive.badge.shark': 'ŽRALOK',
    'ui.dive.badge.sharkText': 'zjedol: {list}',
    'ui.dive.badge.knot': 'UZOL',
    'ui.dive.badge.knotText': 'stratené: {list}',
    'ui.dive.badge.day': 'NOVÝ DEŇ',
    'ui.dive.badge.dayText': 'trh sa pohol',
    'ui.dive.badge.dayIncome': 'trh sa pohol · Akvárium +{money}',
    // bočný panel na hladine: výlet
    'ui.dive.trip.title': 'VÝLET',
    'ui.dive.trip.dives': 'Ponory',
    'ui.dive.trip.fish': 'Ulovené ryby',
    'ui.dive.trip.value': 'Hodnota',
    'ui.dive.trip.snaps': 'Prasknutia',
    'ui.dive.trip.timeStops': 'Kým si na hladine, čas stojí.',
  });
})(globalThis.HL);
