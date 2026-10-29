/* Landgasthof Ostermünchen – ersetzt die nötigen STRATO-Skripte (Karte, Tageskarte). */
(function () {
  'use strict';

  // Google-Karte erst nach Zustimmung laden (wie im STRATO-Original)
  function loadMap(blocker) {
    var holder = blocker.parentElement;
    var map = holder && holder.querySelector('.map-root[data-src]');
    if (!map) return;
    var frame = document.createElement('iframe');
    frame.src = map.getAttribute('data-src');
    frame.title = map.getAttribute('data-title') || 'Karte';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    frame.style.cssText = 'border:0;width:100%;height:100%;min-height:400px;display:block';
    map.innerHTML = '';
    map.appendChild(frame);
    map.style.display = 'block';
    blocker.style.display = 'none';
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.accept-consent-maps');
    if (!btn) return;
    e.preventDefault();
    var blocker = btn.closest('.module-blocker-root');
    if (blocker) loadMap(blocker);
  });

  // Tageskarte: Seitenverhältnis an das aktuelle Bild anpassen
  function fitTageskarte(img) {
    if (!img.naturalWidth) return;
    var wrap = img.closest('.image-wrapper');
    if (wrap) wrap.style.paddingBottom = (img.naturalHeight / img.naturalWidth * 100) + '%';
  }
  Array.prototype.forEach.call(document.querySelectorAll('img.tageskarte-bild'), function (img) {
    if (img.complete) fitTageskarte(img);
    img.addEventListener('load', function () { fitTageskarte(img); });
  });

  // Mobiles Menü nach Klick auf einen Eintrag schließen
  Array.prototype.forEach.call(document.querySelectorAll('.navigation-list a'), function (a) {
    a.addEventListener('click', function () {
      var t = document.getElementById('menuToggleTrigger');
      if (t) t.checked = false;
    });
  });
})();
