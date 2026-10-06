// Français — scène du village (ui/village.js). Clés ui.village.* — glossaire en tête de fr/data.js.
// Largeurs : panneaux latéraux 94 px (petite police ≈ 4 px/car., retour à la ligne), étiquette de bâtiment
// ~170 px, bouton EN MER 104 px (capitales 6 px/car.), tutoriel 146 px par ligne (retour à la ligne).
(function (HL) {
  HL.i18n.add('fr', 'village', {
    'ui.village.toSea': 'EN MER',
    // tap sur l’heure/la météo dans l’en-tête (toast) : {period} = moment, {weather}/{next} = météo en minuscules
    'ui.village.hud.now': '{period}, {weather}',
    'ui.village.hud.forecast': '{period}, {weather}. À {time} : {next}',
    'ui.village.hud.noForecast': '{period}, {weather}. La Station météo donne les prévisions.',
    // étiquette au-dessus du bâtiment (curseur/focus) ; {money} = prix, {level} = niveau
    'ui.village.tag.build': 'Construire : {money}',
    'ui.village.tag.level': 'Niveau {level} · suivant {money}',
    'ui.village.tag.done': 'Niveau 3 · terminé',
    'ui.village.tag.sell': { one: 'Vendre {n} poisson', other: 'Vendre {n} poissons' },
    'ui.village.tag.sellNone': 'Vente de poissons',
    // tranche de prévision (aussi l’écran de la Station météo) : {from}–{to} = heures, {n} = numéro du jour
    'ui.village.seg.today': '{from}–{to}',
    'ui.village.seg.tomorrow': 'demain {from}–{to}',
    'ui.village.seg.later': 'jour {n} {from}–{to}',
    // tutoriel de la première visite
    'ui.village.tut.title': 'Bienvenue à Hlbina',
    'ui.village.tut.text': 'D’une cabane en ruine, tu feras un village de pêcheurs. Pars EN MER, attrape des poissons et vends-les au Marché. Avec l’argent gagné, construis des bâtiments — chacun débloque du nouveau.',
    'ui.village.tut.warn': 'Attention : chaque poisson et chaque mètre de profondeur tendent la ligne. Si elle casse, la prise est perdue.',
    'ui.village.tut.ok': 'Compris',
    // panneaux latéraux (PC) : à gauche prévisions et lune, à droite demande, stockage, quêtes
    'ui.village.panel.forecast': 'Prévisions',
    'ui.village.panel.noMeteo': 'Construis la Station météo pour voir le temps qui vient.',
    'ui.village.panel.hours': 'sur {h} h',
    'ui.village.panel.intro': 'Premières plongées : mer calme et soleil.',
    'ui.village.panel.moon': 'Lune',
    'ui.village.panel.today': 'Aujourd’hui',
    'ui.village.panel.tomorrow': 'Demain',
    'ui.village.panel.dayAfter': 'Après-demain',
    'ui.village.panel.noMoon': 'La Station météo niveau 3 montre les phases de la lune.',
    'ui.village.panel.hot': 'Forte demande',
    // une seule ligne : ui/village.js avance de 12 px fixes après ce texte (2 lignes = collé au titre suivant)
    'ui.village.panel.hotNone': 'Rien de spécial.',
    'ui.village.panel.hotMult': '×{mult}',
    'ui.village.panel.storage': 'Stockage',
    // {got} poissons sur une capacité de {n} ; forme selon la capacité (« 3 / 5 poissons »)
    'ui.village.panel.storageCount': { one: '{got} / {n} poisson', other: '{got} / {n} poissons' },
    'ui.village.panel.sellHint': 'Vends-les au Marché.',
    'ui.village.panel.quests': 'Quêtes',
    'ui.village.panel.questsLocked': 'Les pêcheurs de la Taverne donnent des quêtes dès le niveau 2.',
    // panneau indicateur vers la Vieille centrale (lac nucléaire, docs/JAZERO.md) ; bouton SUR LE LAC 104 px
    'ui.village.plant.name': 'Vieille centrale',
    'ui.village.plant.sub': 'Lac nucléaire',
    'ui.village.plant.toLake': 'SUR LE LAC',
    // toast de la première visite (150 px par ligne : 3 lignes, comme le sk)
    'ui.village.plant.intro': 'Construis le Chantier naval, équipe-toi pour le lac au Laboratoire, puis SUR LE LAC !',
    'ui.village.plant.zones': 'Zones du lac',
    'ui.village.plant.reach': 'Portée dans le lac',
    'ui.village.plant.fish': 'Poissons du lac',
  });
})(globalThis.HL);
