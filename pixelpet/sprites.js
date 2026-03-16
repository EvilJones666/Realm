/* sprites.js — PIXELPET sprite sheet loader
 * Plain <script> tag, no modules, no dependencies.
 * Preloads all PNGs from /sprites/ folder.
 * Exposes: getSprite(name) → HTMLImageElement | null
 * Emits 'sprites:ready' on window when all attempts complete.
 * Falls back gracefully — missing images simply return null,
 * leaving the canvas grid system to render instead.
 */
(function () {
  var SPRITE_NAMES = [
    'egg',
    'baby_a', 'baby_b',
    'child_a', 'child_b',
    'teen_a', 'teen_b',
    'adult_a', 'adult_b',
    'sleeping', 'sick', 'dead',
    'happy', 'hungry', 'play', 'feed'
  ];

  var _cache = {};
  var _done = 0;
  var _total = SPRITE_NAMES.length;

  function _check() {
    _done++;
    if (_done >= _total) {
      window.dispatchEvent(new CustomEvent('sprites:ready', {
        detail: { loaded: Object.keys(_cache).length, total: _total }
      }));
    }
  }

  function _preload() {
    SPRITE_NAMES.forEach(function (name) {
      var img = new Image();
      img.onload = function () {
        _cache[name] = img;
        _check();
      };
      img.onerror = function () {
        /* Image not found — fallback will be used for this sprite */
        _check();
      };
      img.src = '/sprites/' + name + '.png';
    });
  }

  /**
   * Returns the preloaded HTMLImageElement for the given sprite name,
   * or null if the image has not loaded / does not exist.
   * @param {string} name — one of the SPRITE_NAMES values
   * @returns {HTMLImageElement|null}
   */
  window.getSprite = function (name) {
    return _cache[name] || null;
  };

  _preload();
})();
