// Service worker Hlbiny — hra nabehne aj bez siete (po prvej návšteve cez https alebo localhost).
//
// Registruje ho LEN index.html, a to len na http(s) bez ?nosave/?manual (nikdy z file://, harness
// ostáva deterministický). Cez http na adrese v sieti (192.168.x.x) ho prehliadač nepovolí — nie je
// to bezpečný kontext; hra aj tak beží, len nie offline.
//
// Stratégia: verzovaná cache + PRECACHE všetkého, čo index.html načíta:
//   './', index.html, src/files.js, KAŽDÝ súbor zo src/files.js (ten istý zoznam ako prehliadač
//   a testy — importScripts nižšie), manifest.webmanifest a každá ikona z manifestu.
// SIEŤ NAJPRV, cache ako záloha: online vždy beží najnovšia verzia hry, offline tá posledná stiahnutá.
// (v1 dávala najprv cache a novú verziu až pri ĎALŠOM spustení — majiteľ po oprave boja stále hral
// starú verziu a búšením vytiahol každú rybu. Hra má ~1 MB, sieť najprv nič nestojí.)
// Po nasadení nového sw.js ho index.html pri výmene riadiaceho SW raz obnoví (controllerchange).
// VERSION zvýš, keď sa mení táto stratégia (activate zmaže staré 'hlbina-*').
// Overenie: tools/mobile_check.js (aj s vypnutým serverom).
var VERSION = 'v2';
var CACHE = 'hlbina-' + VERSION;
importScripts('src/files.js'); // → self.HL_FILES

function precacheList(manifest) {
  var list = ['./', 'index.html', 'src/files.js', 'manifest.webmanifest'];
  var add = function (u) { if (list.indexOf(u) < 0) list.push(u); };
  Object.keys(self.HL_FILES || {}).forEach(function (g) {
    (self.HL_FILES[g] || []).forEach(function (f) { add('src/' + f); });
  });
  ((manifest && manifest.icons) || []).forEach(function (i) { if (i && i.src) add(i.src); });
  return list;
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    fetch('manifest.webmanifest', { cache: 'reload' })
      .then(function (r) { return r.json(); })
      .then(function (manifest) {
        return caches.open(CACHE).then(function (cache) {
          // cache: 'reload' = obísť HTTP cache prehliadača; zlyhanie ktoréhokoľvek súboru = inštalácia zlyhá
          return cache.addAll(precacheList(manifest).map(function (u) { return new Request(u, { cache: 'reload' }); }));
        });
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k.indexOf('hlbina-') === 0 && k !== CACHE) return caches.delete(k);
        return null;
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Kľúč bez ?parametrov: index.html?seed=7 je ten istý súbor ako index.html.
  var key = url.origin + url.pathname;
  event.respondWith(caches.open(CACHE).then(function (cache) {
    return fetch(new Request(key, { cache: 'no-cache', credentials: 'same-origin' })).then(function (res) {
      if (res && res.ok && res.type === 'basic') { var copy = res.clone(); event.waitUntil(cache.put(key, copy)); }
      return res;
    }, function () {
      // offline (alebo sieť zlyhala): posledná stiahnutá verzia
      return cache.match(key).then(function (hit) { return hit || Response.error(); });
    });
  }));
});
