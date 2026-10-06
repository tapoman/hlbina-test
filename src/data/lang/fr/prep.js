// Français — préparation de la plongée (ui/prep.js). Clés ui.prep.* — glossaire en tête de fr/data.js.
// Largeurs : étiquette de matériel à droite en petite police (~60 px), phrase sous la ligne 156 px, titre de
// section 168 px, panneau latéral 94 px (retour à la ligne). {n} = nombre (pluriel), le reste déjà formaté.
(function (HL) {
  HL.i18n.add('fr', 'prep', {
    'ui.prep.title': 'Préparation',
    'ui.prep.dive': 'PLONGER',
    'ui.prep.haul': 'PRIME',
    'ui.prep.haulToast': 'Prime : dès {from} poissons +{pct}. Si un poisson s’échappe pendant le combat, tu perds tous les poissons de la ligne !',
    // sections de la liste
    'ui.prep.bait': 'Appât',
    'ui.prep.gear': 'Matériel',
    'ui.prep.reach': 'Portée de la ligne',
    'ui.prep.hot': 'Demandé au marché',
    'ui.prep.hotNone': 'Rien de spécial aujourd’hui.',
    'ui.prep.hotMult': '★ ×{mult}',
    // conditions et prévisions (les lignes de jours ont 34 px de petite police pour l’étiquette)
    'ui.prep.noForecast': 'Prévisions via la Station météo.',       // 158 px au plus (140 px)
    // une ligne de 158 px (encadré) ET 2 lignes de 94 px (panneau PC, dessiné à h − 34) : 137 px
    'ui.prep.introSun': 'Au début, il fait toujours beau.',
    'ui.prep.today': 'auj.',
    'ui.prep.tomorrow': 'demain',
    'ui.prep.dayAfter': 'ap.-dem.',
    // prévisions des poissons (section sous la météo, 168 px) : heure en police normale, à droite en petite moment · météo ;
    // ligne de poisson = nom + profondeur ; fishShow / fishHide = ligne replier/déplier (l’UI ajoute « ▸ » / « ▴ »,
    // 157 px au plus — « Heures suivantes (28 changements) » = 157 sans la flèche)
    'ui.prep.fish': 'Ce qui mord et quand',
    'ui.prep.fishNow': 'maintenant',
    'ui.prep.fishTomorrow': 'demain {time}',
    'ui.prep.fishDayAfter': 'après-demain {time}',
    'ui.prep.fishDay': 'jour {n}, {time}',
    'ui.prep.fishCond': '{period} · {weather}',
    'ui.prep.fishNone': 'que des poissons communs',
    'ui.prep.fishShow': { one: 'Plus tard ({n} changement)', other: 'Plus tard ({n} changements)' },
    'ui.prep.fishHide': 'Masquer les prévisions',
    // carte d’appât : combien de pièces le joueur emporte
    'ui.prep.carry': { one: 'tu prends {n}', other: 'tu prends {n}' },
    'ui.prep.unlimited': 'sans limite',
    // matériel ({ms} = millisecondes de tolérance, {pct} = « 60 % »)
    'ui.prep.noFloor': 'sans fond',
    'ui.prep.limitLighthouse': 'Plus bas, il faut le Phare 3.',
    'ui.prep.limitFloor': 'Elle atteint le fond de la mer.',
    // lac : une ligne de 148 px (« Plus bas, il faut un meilleur Chantier naval. » = 194 px) ; limitCore 150 px
    'ui.prep.limitShipyard': 'Plus bas, améliore le Chantier.',
    'ui.prep.limitCore': 'Elle atteint le cœur du réacteur.',
    'ui.prep.rodTolerance': 'rythme +{ms} ms',
    'ui.prep.rodBasic': 'de base',
    'ui.prep.hookEscape': 'fuite –{pct}',
    'ui.prep.hookBasic': 'de base',
    'ui.prep.harpoons': 'Harpons',
    'ui.prep.harpoonCount': { one: '{n} harpon', other: '{n} harpons' },
    'ui.prep.harpoonNone': 'aucun',
    'ui.prep.harpoonLocked': 'dès Atelier 2',
    'ui.prep.storage': 'Cabane',
    'ui.prep.storageFull': 'pleine — prise vendue aussitôt',
    // {stored} = poissons dans la Cabane, {n} = capacité (forme selon la capacité)
    'ui.prep.storageCount': { one: '{stored} / {n} poisson', other: '{stored} / {n} poissons' },
    // panneaux latéraux (PC)
    'ui.prep.panel.weather': 'Météo',
    'ui.prep.panel.weatherHint': 'La Station météo montre le temps qui vient. Certains poissons ne mordent que sous la pluie, dans la brume ou par orage.',
    'ui.prep.panel.now': 'maintenant',
    'ui.prep.panel.dayTime': '{day}, {time}',
    'ui.prep.panel.reach': 'Portée',
    'ui.prep.panel.depthRule': 'Plus tu descends, plus un poisson pèse sur la ligne : à 500 mètres, trois fois plus.',
    'ui.prep.panel.keyDive': 'Enter  plonger',
    'ui.prep.panel.keyBack': 'Esc  retour au village',
    'ui.prep.panel.keyBackPlant': 'Esc  retour à la centrale',
  });
})(globalThis.HL);
