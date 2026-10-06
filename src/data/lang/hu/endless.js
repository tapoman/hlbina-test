// Preklad hu / endless — Nekonečná hlbina (ui/endless.js). Kľúče = src/data/lang/sk/endless.js. Szójegyzék: hu/data.js.
// Szélességek: mondatok 164 px (tördel), felszerelés neve 60–71 px, ranglista fejléce apróval jobbra zárva
// (Mélység ~50 px, Zsákmány ~55 px, Nap ~34 px), szöveg a lakatnál 106 px, gomb 168 px, oldalsó panel 94 px.
// {every} = "250 m" (HL.util.meters) — rag nélkül használjuk („minden {every} után“).
(function (HL) {
  HL.i18n.add('hu', 'endless', {
    'ui.endless.title': 'Végtelen mélység',
    'ui.endless.subUnlocked': 'Világítótorony 3 · nyitva',
    'ui.endless.locked': 'Zárva',
    'ui.endless.dive': 'MERÜLÉS',
    'ui.endless.descUnlocked': 'Egyetlen hosszú merülés falu és piac nélkül, rögzített felszereléssel. Minden {every} után 1 fejlesztést választasz 3 közül. Cél: minél mélyebbre, minél értékesebb zsákmánnyal.',
    'ui.endless.descLocked': 'Egyetlen hosszú merülés falu és piac nélkül, rögzített felszereléssel. Minden {every} után 1 fejlesztést választasz 3 közül.',
    // rögzített felszerelés (a többi név az adatokból)
    'ui.endless.gear': 'Rögzített felszerelés',
    'ui.endless.harpoons': 'Szigony ×{n}',
    'ui.endless.baitMix': 'Vegyes csali',
    // ranglista
    'ui.endless.board': 'Ranglista · top 10',
    'ui.endless.boardEmpty': 'Még üres. Az első merülés ide kerül — a mélység és a zsákmány értéke is.',
    'ui.endless.col.depth': 'Mélység',
    'ui.endless.col.value': 'Zsákmány',
    'ui.endless.col.day': 'Nap',
    'ui.endless.rank': '{n}.',
    'ui.endless.boardNote': 'A ranglista csak ezen az eszközön van. Világranglistát (Steam, Game Center) a webes változat nem kínál.',
    'ui.endless.boardNoteCg': 'A ranglista a haladásoddal együtt mentődik.',
    'ui.endless.perksExample': 'Fejlesztések, például',
    // zárva
    // a lakat melletti doboz 106 px széles és 2 sorra van hely (alatta a „Világítótornyod“ címke)
    'ui.endless.unlockBy': 'Nyitja: 3. szintű Világítótorony',
    'ui.endless.yourMajak': 'Világítótornyod',
    'ui.endless.level': 'szint: {level} / 3',
    'ui.endless.majakAlso': 'A 3. szintű Világítótorony a karrierben a Szakadékot is megnyitja. Ehhez ki kell fogni a Ködös hölgyet.',
    // oldalsó panelek (PC)
    'ui.endless.panel.perks': 'Fejlesztések',
    // {every} = "250 m" → „250 m-enként“ (méterenként — a rag nem függ a számtól); panel 94 px apróval
    'ui.endless.panel.every': '{every}-enként, 1 a 3-ból',
    'ui.endless.panel.records': 'Rekordok',
    'ui.endless.panel.deepest': 'Legmélyebb',
    'ui.endless.panel.richest': 'Legértékesebb fogás',
    'ui.endless.panel.entries': 'Bejegyzések',
    'ui.endless.panel.keyDive': 'S / Enter: merülés',
    'ui.endless.panel.keyBack': 'Esc: vissza',
  });
})(globalThis.HL);
