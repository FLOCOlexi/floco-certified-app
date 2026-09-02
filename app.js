/* FLOCO Certified app — navigation, personalization, PWA */
(function () {
  var nav = {
    'Home': 'home.html', 'Studio': 'studio.html', 'Vault': 'vault.html',
    'My Brand': 'mybrand.html', 'Support': 'support.html'
  };
  var tiles = {
    'The Playbook': 'playbook.html', 'Design Studio': 'studio.html',
    'Marketing Vault': 'vault.html', 'Inlay Cut Files': 'inlays.html',
    'Materials': 'materials.html', 'Cleaning Division': 'cleaning.html',
    'My Brand': 'mybrand.html', 'Support': 'support.html'
  };
  function go(url) { if (url) location.href = url; }
  function txt(el) { return el ? el.textContent.trim() : ''; }
  function profile() { try { return (window.FLOCOauth && FLOCOauth.profile()) || null; } catch (e) { return null; } }

  document.addEventListener('DOMContentLoaded', function () {
    var p = profile();

    // personalize the greeting to the signed-in company
    if (p) {
      var co = document.querySelector('.greet .co');
      if (co) co.textContent = p.company;
      var chip = document.querySelector('.greet .chip');
      if (chip) chip.innerHTML = 'FLOCO Certified <b>·</b> ' + p.location;
    }

    // bottom nav
    document.querySelectorAll('.nav .item').forEach(function (it) {
      var label = txt(it.querySelector('.l'));
      if (nav[label]) it.addEventListener('click', function () { go(nav[label]); });
    });
    // home tiles
    document.querySelectorAll('.tile').forEach(function (t) {
      var nm = txt(t.querySelector('.nm'));
      if (tiles[nm]) t.addEventListener('click', function () { go(tiles[nm]); });
    });
    // back buttons
    document.querySelectorAll('.back, .top .back').forEach(function (b) {
      b.style.cursor = 'pointer';
      b.addEventListener('click', function () {
        if (history.length > 1) history.back(); else go('home.html');
      });
    });
    // explicit links + logout hooks
    document.querySelectorAll('[data-link]').forEach(function (el) {
      el.addEventListener('click', function () { go(el.getAttribute('data-link')); });
    });
    document.querySelectorAll('[data-action="logout"]').forEach(function (el) {
      el.addEventListener('click', function () { if (window.FLOCOauth) FLOCOauth.logout(); });
    });

    // add a subtle "Sign out" chip on the home greeting
    var greet = document.querySelector('.greet');
    if (greet && !document.querySelector('.floco-signout')) {
      var a = document.createElement('div');
      a.className = 'floco-signout';
      a.textContent = (p && p.role === 'admin') ? 'FLOCO Team View · Switch' : 'Sign out';
      a.style.cssText = 'display:inline-block;margin-top:10px;margin-left:8px;font-family:Inter,sans-serif;font-weight:600;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#8DA2B5;border:1px solid rgba(255,255,255,.14);border-radius:30px;padding:5px 12px;cursor:pointer;';
      a.addEventListener('click', function () { if (window.FLOCOauth) FLOCOauth.logout(); });
      greet.appendChild(a);
    }
  });

  // service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
