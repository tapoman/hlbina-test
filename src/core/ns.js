// Menný priestor celej hry. Každý súbor je klasický <script> (funguje aj z file://)
// a zapisuje sa do globálneho HL. V Node ho načíta tests/load.js cez vm.
(function (root) {
  var HL = root.HL = root.HL || {};
  HL.VERSION = '0.1.0';
  HL.data = HL.data || {};
  HL.isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

  // Chyba v dátach alebo v stave má spadnúť nahlas, nie sa ticho premeniť na NaN.
  HL.assert = function (cond, msg) {
    if (!cond) throw new Error('HL.assert: ' + msg);
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
