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

    // personalize the greeting only if a company profile is set (universal login leaves it generic)
    if (p && p.company) {
      var co = document.querySelector('.greet .co');
      if (co) co.textContent = p.company;
      var chip = document.querySelector('.greet .chip');
      if (chip && p.location) chip.innerHTML = 'FLOCO Certified <b>·</b> ' + p.location;
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
      a.textContent = 'Sign out';
      a.style.cssText = 'display:inline-block;margin-top:10px;margin-left:8px;font-family:Inter,sans-serif;font-weight:600;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#8DA2B5;border:1px solid rgba(255,255,255,.14);border-radius:30px;padding:5px 12px;cursor:pointer;';
      a.addEventListener('click', function () { if (window.FLOCOauth) FLOCOauth.logout(); });
      greet.appendChild(a);
    }

    wireButtons();
  });

  // ---- shared toast + universal button wiring (make every button respond) ----
  function ensureToast() {
    var t = document.getElementById('appToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'appToast';
      t.style.cssText = 'position:fixed;left:50%;bottom:104px;transform:translateX(-50%) translateY(18px);opacity:0;pointer-events:none;background:#3BBFB8;color:#052018;font-family:Nunito,\'Nunito\',sans-serif;font-weight:900;font-size:12.5px;line-height:1.35;padding:12px 18px;border-radius:30px;box-shadow:0 12px 28px rgba(0,0,0,.45);transition:opacity .26s,transform .26s;z-index:400;max-width:290px;text-align:center;';
      document.body.appendChild(t);
    }
    return t;
  }
  function toast(msg) {
    var t = ensureToast();
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(t._t);
    t._t = setTimeout(function () {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%) translateY(18px)';
    }, 2100);
  }
  var TEL = 'tel:+12394268045';
  var MAIL = 'hello@flocodeckingsystems.com';
  function wire(el, fn) {
    if (!el || el._fw) return;
    el._fw = 1;
    el.style.cursor = 'pointer';
    el.addEventListener('click', function (ev) { ev.stopPropagation(); fn(ev); });
  }
  function copy(text, note) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { toast(note || 'Copied!'); }, function () { toast(note || 'Copied!'); });
      } else {
        var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta);
        ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta);
        toast(note || 'Copied!');
      }
    } catch (e) { toast(note || 'Copied!'); }
  }
  function wireButtons() {
    // studio.js owns the Studio screen's interactions — don't double-wire it
    if (document.getElementById('vibes')) return;

    // Support: real Call / Email
    document.querySelectorAll('.act').forEach(function (el) {
      var label = txt(el.querySelector('.t')).toLowerCase();
      if (label.indexOf('call') > -1 || label.indexOf('text') > -1) wire(el, function () { location.href = TEL; });
      else if (label.indexOf('email') > -1) wire(el, function () { location.href = 'mailto:' + MAIL + '?subject=FLOCO%20Certified%20%E2%80%94%20Support'; });
    });

    // My Brand: badge/asset cards + Download Lockup button + email signature copy
    document.querySelectorAll('.ba').forEach(function (el) {
      var nm = txt(el.querySelector('.nm')).toLowerCase();
      if (nm.indexOf('signature') > -1) {
        wire(el, function () {
          copy('Your Name\nFLOCO Certified Installer  |  Rubber Surfacing Experts\n' + MAIL + '  |  flocodeckingsystems.com', 'Signature copied — swap in your details');
        });
      } else {
        wire(el, function () { toast('Brand asset delivery coming soon 🦩'); });
      }
    });
    document.querySelectorAll('.btn').forEach(function (el) {
      var t = txt(el).toLowerCase();
      if (t.indexOf('download') > -1 || t.indexOf('lockup') > -1) wire(el, function () { toast('Brand asset delivery coming soon 🦩'); });
    });

    // Downloads (vault clips, inlay cut files, brand icons) → friendly notice
    document.querySelectorAll('.dl').forEach(function (el) {
      wire(el, function () { toast('Download opens here soon 🦩'); });
    });
    // Vault play buttons + overlay tiles
    document.querySelectorAll('.pl, .play').forEach(function (el) {
      wire(el, function () { toast('Video plays here soon 🦩'); });
    });
    document.querySelectorAll('.ov-tile').forEach(function (el) {
      wire(el, function () { toast('Overlay coming soon 🦩'); });
    });
    // "See all" links
    document.querySelectorAll('.e, .more').forEach(function (el) {
      wire(el, function () { toast('Full library coming soon 🦩'); });
    });

    // Materials "Order" + Cleaning "Order the FLOCO cleaner" (by exact leaf text)
    var all = document.querySelectorAll('div, button, span, a');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.children.length > 1) continue;
      var t = (el.textContent || '').trim();
      if (t === 'Order' || t === 'Ordering') {
        wire(el, function () { toast('Your American Recycling rep connects here soon 🦩'); });
      } else if (/^Order the FLOCO cleaner/i.test(t)) {
        wire(el, function () { location.href = 'mailto:' + MAIL + '?subject=FLOCO%20Cleaner%20Order'; });
      }
    }
  }

  // service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
