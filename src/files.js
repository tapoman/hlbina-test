// Poradie načítania VŠETKÝCH zdrojových súborov. Jediný zdroj pravdy:
// index.html ich podľa tohto zoznamu pripája v prehliadači a tests/load.js
// načíta skupiny core/data/sim do Node (bez DOM). Nový súbor = nový riadok tu.
(function (root) {
  // Jazyky s prekladom (docs/I18N.md). Nový jazyk = jeden riadok tu (kód z HL.i18n.LANGS v core/i18n.js)
  // a súbory src/data/lang/<kód>/<oblasť>.js pre KAŽDÚ oblasť nižšie. Slovenčina je zdroj a musí byť prvá.
  var LANGS = ['sk', 'cs', 'en', 'de', 'pl', 'hu', 'es', 'fr'];
  var AREAS = ['data', 'sim', 'ui_common', 'title', 'village', 'building', 'prep', 'dive', 'results', 'market', 'encyclopedia', 'settings', 'endless'];
  var lang = [];
  LANGS.forEach(function (code) { AREAS.forEach(function (a) { lang.push('data/lang/' + code + '/' + a + '.js'); }); });

  root.HL_FILES = {
    core: ['core/ns.js', 'core/rng.js', 'core/util.js', 'core/i18n.js', 'core/tuning.js', 'core/platform.js'],
    data: ['data/fish.js', 'data/gear.js', 'data/buildings.js', 'data/world.js', 'data/text.js'].concat(lang),
    sim: [
      'sim/world.js', 'sim/market.js', 'sim/save.js', 'sim/village.js',
      'sim/tension.js', 'sim/rhythm.js', 'sim/specimen.js', 'sim/fight.js', 'sim/dive.js', 'sim/endless.js',
      'sim/game.js',
    ],
    // sprites_lake_*.js pridávajú sprity jadrového jazera cez HL.spr.kit — musia ísť za sprites.js.
    gfx: ['gfx/palette.js', 'gfx/font.js', 'gfx/draw.js', 'gfx/sprites.js', 'gfx/sprites_lake_fish.js', 'gfx/sprites_lake.js', 'gfx/fx.js', 'gfx/seascape.js', 'gfx/seascape_lake.js'],
    audio: ['audio/audio.js', 'audio/music.js'],
    ui: [
      // main.js definuje HL.scenes, ktoré scény volajú UŽ PRI NAČÍTANÍ — musí ísť pred nimi.
      // Samotný štart (HL.boot) beží až po načítaní všetkého.
      'core/input.js', 'core/main.js', 'gfx/widgets.js', 'ui/scenario.js', 'ui/common.js',
      'ui/title.js', 'ui/village.js', 'ui/building.js', 'ui/elektraren.js', 'ui/prep.js', 'ui/dive.js',
      'ui/results.js', 'ui/market.js', 'ui/encyclopedia.js', 'ui/settings.js', 'ui/endless.js',
      'core/dials.js',
    ],
  };
  root.HL_LANGS = LANGS.slice();
  root.HL_LANG_AREAS = AREAS.slice();
  // Skupiny, ktoré nesmú siahnuť na DOM ani canvas — bežia aj v Node.
  root.HL_HEADLESS = ['core', 'data', 'sim'];
})(typeof globalThis !== 'undefined' ? globalThis : window);
