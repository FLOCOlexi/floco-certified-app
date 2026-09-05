/* FLOCO Certified — service worker.
   Network-first for pages/scripts (so updates ALWAYS show), cache-first for images/fonts. */
var CACHE = 'floco-certified-v30';
var CORE = [
  'home.html', 'jobs.html', 'jobs.js', 'colors.js', 'quotes.html', 'quote-view.html', 'terms.html', 'quotes.js', 'quote-view.js', 'studio.html', 'vault.html', 'inlays.html', 'materials.html',
  'cleaning.html', 'playbook.html', 'mybrand.html', 'support.html', 'login.html',
  'app.css', 'app.js', 'studio.js', 'accounts.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.allSettled(CORE.map(function (u) { return c.add(u); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function isFresh(req) {
  if (req.mode === 'navigate') return true;
  var u = req.url;
  return /\.(html|js|css|webmanifest)(\?|$)/.test(u);
}

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var req = e.request;
  if (isFresh(req)) {
    // network-first: always try to get the latest page/script
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) { return hit || caches.match('home.html'); });
      })
    );
  } else {
    // cache-first for images/fonts (static, big)
    e.respondWith(
      caches.match(req).then(function (hit) {
        return hit || fetch(req).then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
          return res;
        });
      })
    );
  }
});
