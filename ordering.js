/* FLOCO Certified — "order it" flows.
 *
 * Two vendors the installer orders from directly, not through FLOCO:
 *   decals  → icustom4u@hotmail.com   (print/decal guy, already holds every FLOCO file)
 *   inlays  → designs@wrap-tek.com    (Jesse Taylor at Wrap-Tek, office 239-221-9727)
 *
 * Same no-backend pattern as the Studio's Send button: build a pre-filled
 * mailto: and hand it to their mail app. The installer still presses send, so
 * the order is theirs, from their address, and the vendor can just reply. No
 * server, nothing to go down on a job site, and no FLOCO address in the middle
 * of a conversation about someone else's order.
 *
 * The body is deliberately a FORM with blank lines rather than prose. A vendor
 * reading twenty of these wants the same four fields in the same order every
 * time, and an installer typing one-handed in a truck wants to fill gaps, not
 * compose.
 */
(function (w) {
  'use strict';

  /* Their company name personalises the email so the vendor knows who is
     asking without opening the signature. Blank is normal — a company can be
     signed in before it has set its details — and "my company" keeps the
     sentence grammatical rather than leaving a hole in it. */
  function company() {
    var p;
    try { p = (w.FLOCOauth && w.FLOCOauth.profile && w.FLOCOauth.profile()) || {}; }
    catch (e) { p = {}; }
    return ((p.company || '').trim()) || 'my company';
  }

  /* Sizes our print guy actually runs. A picker rather than a free-text box
     because "how big?" is the question that otherwise comes back by text two
     days later and holds up the order. */
  var SIZES = ['6"', '12"', '18"', '24"', '36"', '48"'];
  var DEFAULT_SIZE = '12"';

  /* Build the picker from the decal cards already on the page, so a decal
     added to the grid later turns up here on its own and the two can never
     disagree about what is on offer. */
  function buildPicker() {
    var list = document.getElementById('ordList');
    if (!list) return;
    var cards = document.querySelectorAll('.decgrid .dec');
    if (!cards.length) { list.remove(); return; }

    /* Build once. Without this, anything that evaluates this file a second
       time — a stale service worker serving two versions, a page that includes
       the script twice — appends a SECOND copy of every row, and the installer
       gets a list with each decal on it twice. Clearing is better than an
       early return: it also makes a deliberate rebuild safe. */
    list.innerHTML = '';

    Array.prototype.forEach.call(cards, function (card) {
      var img = card.querySelector('img');
      var nameEl = card.querySelector('.dn');
      var name = (nameEl && nameEl.textContent || '').trim();
      var href = card.getAttribute('href') || '';
      if (!name) return;

      var row = document.createElement('div');
      row.className = 'ordrow';
      row.dataset.name = name;
      row.dataset.file = href;
      row.dataset.qty = '0';

      var th = document.createElement('div');
      th.className = 'th';
      if (img) th.style.backgroundImage = 'url("' + (img.getAttribute('src') || '') + '")';

      var mid = document.createElement('div');
      mid.className = 'mid';
      var nm = document.createElement('div');
      nm.className = 'nm';
      nm.textContent = name;
      var sel = document.createElement('select');
      SIZES.forEach(function (sz) {
        var o = document.createElement('option');
        o.value = sz; o.textContent = sz;
        if (sz === DEFAULT_SIZE) o.selected = true;
        sel.appendChild(o);
      });
      sel.setAttribute('aria-label', 'Size for ' + name);
      mid.appendChild(nm); mid.appendChild(sel);

      var qty = document.createElement('div');
      qty.className = 'qty';
      var minus = document.createElement('button');
      minus.type = 'button'; minus.className = 'qb'; minus.textContent = '\u2212';
      minus.setAttribute('aria-label', 'One fewer ' + name);
      var n = document.createElement('span');
      n.className = 'qn'; n.textContent = '0';
      var plus = document.createElement('button');
      plus.type = 'button'; plus.className = 'qb'; plus.textContent = '+';
      plus.setAttribute('aria-label', 'One more ' + name);

      function step(by) {
        var v = Math.max(0, Math.min(999, (parseInt(row.dataset.qty, 10) || 0) + by));
        row.dataset.qty = String(v);
        n.textContent = String(v);
        row.classList.toggle('on', v > 0);
      }
      minus.addEventListener('click', function () { step(-1); });
      plus.addEventListener('click', function () { step(1); });

      qty.appendChild(minus); qty.appendChild(n); qty.appendChild(plus);
      row.appendChild(th); row.appendChild(mid); row.appendChild(qty);
      list.appendChild(row);
    });
  }

  /* Absolute, because the email leaves the device and a relative path means
     nothing in our print guy's inbox. */
  function absolute(path) {
    if (!path) return '';
    if (/^https?:/i.test(path)) return path;
    var base = w.location.origin + w.location.pathname.replace(/\/[^/]*$/, '/');
    return base + path.replace(/^\.?\//, '');
  }

  /* What they picked, as order lines. Empty means they did not use the picker
     and the email falls back to a blank form they can fill in by hand — the
     button must never do nothing. */
  function picked() {
    var out = [];
    Array.prototype.forEach.call(document.querySelectorAll('.ordrow'), function (row) {
      var q = parseInt(row.dataset.qty, 10) || 0;
      if (q < 1) return;
      var sel = row.querySelector('select');
      out.push({
        name: row.dataset.name,
        size: sel ? sel.value : '',
        qty: q,
        url: absolute(row.dataset.file)
      });
    });
    return out;
  }

  function open(to, subject, body) {
    w.location.href = 'mailto:' + encodeURIComponent(to)
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(body);
  }

  w.FLOCOorder = {
    decals: function () {
      var co = company();
      var rows = picked();
      var lines;

      if (rows.length) {
        /* A mailto body is plain text and cannot carry a picture, so every
           line gets a link to the exact artwork instead. He has all the files
           already — the link is so there is no doubt WHICH one. */
        lines = rows.map(function (r) {
          return r.name + ' — ' + r.size + ' — qty ' + r.qty
            + (r.url ? '\n    artwork: ' + r.url : '');
        }).join('\n\n');
      } else {
        /* Picker untouched. Send the blank form rather than an empty order —
           the button must never appear to do nothing. */
        lines = 'Design — Size — Quantity\n'
              + 'Design — Size — Quantity\n'
              + 'Design — Size — Quantity';
      }

      open('icustom4u@hotmail.com',
        'FLOCO decal order — ' + co,
        'Hi! This is ' + co + ', a FLOCO Certified Specialist. '
        + "We'd like to order the following (you have all the files):\n\n"
        + lines + '\n\n'
        + 'Ship to:\n\n'
        + 'Thank you!');
    },

    inlay: function () {
      var co = company();
      open('designs@wrap-tek.com',
        'FLOCO custom inlay order — ' + co,
        'Hi Jesse! This is ' + co + ', a FLOCO Certified Specialist. '
        + "We'd like a custom design inlay:\n\n"
        + 'Design/description:\n'
        + 'Colors:\n'
        + 'Size (inches):\n'
        + 'Quantity:\n'
        + 'Needed by:\n\n'
        + 'Thank you!');
    }
  };

  /* Bind by id rather than an inline onclick, so the markup stays free of
     behaviour and both pages wire up the same way. Loaded with `defer`, so the
     DOM is parsed by the time this runs; the belt-and-braces listener covers a
     page that ever loads it without defer. */
  function bind() {
    buildPicker();
    var map = { ordDecals: w.FLOCOorder.decals, ordInlay: w.FLOCOorder.inlay };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el && !el.__floco) { el.__floco = 1; el.addEventListener('click', map[id]); }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})(window);
