/* Reel overlays that are actually files.
 *
 * These three tiles used to be decorative divs with a dashed border and no
 * link on them, so "transparent overlays" was a promise the app never kept.
 *
 * They are drawn here at 1080x1920 on a transparent canvas and downloaded as
 * real PNGs that drop straight onto a vertical video. They are also built from
 * the installer's OWN company name, because a lower-third that says FLOCO
 * instead of their name is no use to anybody.
 */
(function () {
  var W = 1080, H = 1920;

  function profile() {
    try { return JSON.parse(localStorage.getItem('floco_auth_v1')) || {}; } catch (e) { return {}; }
  }
  function load(src) {
    return new Promise(function (res, rej) {
      var i = new Image(); i.onload = function () { res(i); };
      i.onerror = function () { rej(new Error(src)); }; i.src = src;
    });
  }
  function ctx2d() {
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    return { c: c, x: c.getContext('2d') };
  }
  function grab(c, name) {
    c.toBlob(function (b) {
      var u = URL.createObjectURL(b), a = document.createElement('a');
      a.href = u; a.download = name; document.body.appendChild(a); a.click();
      a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
    }, 'image/png');
  }
  /* A soft shadow behind anything sitting over unknown footage, or a white
     logo lands on a white pool deck and disappears. */
  function shadow(x, on) {
    x.shadowColor = on ? 'rgba(0,0,0,.55)' : 'transparent';
    x.shadowBlur = on ? 24 : 0; x.shadowOffsetY = on ? 4 : 0;
  }

  /* Company names vary wildly in length. "Pro Surfacing Services" ran off the
     right edge of the frame at a fixed size, so the type shrinks to fit and
     never clips. */
  function fitFont(x, text, weight, px, maxW, family) {
    var size = px;
    do {
      x.font = weight + ' ' + size + 'px ' + family;
      if (x.measureText(text).width <= maxW) break;
      size -= 2;
    } while (size > 22);
    return size;
  }

  function star(x, cx, cy, r, fill) {
    x.beginPath();
    for (var i = 0; i < 10; i++) {
      var rad = (i % 2 === 0) ? r : r * 0.45, a = Math.PI / 5 * i - Math.PI / 2;
      x[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
    }
    x.closePath(); x.fillStyle = fill; x.fill();
  }

  var BUILD = {
    'lower-third': function (p) {
      return load('assets/img/floco-logo-white.png').then(function (logo) {
        var o = ctx2d(), x = o.x;
        var co = (p.company || '').trim() || 'Your Company';
        var baseY = 1560;
        shadow(x, true);
        var lw = 190, lh = 190;
        x.drawImage(logo, 70, baseY - 96, lw, lh);
        x.fillStyle = '#3BBFB8';
        x.fillRect(70 + lw + 34, baseY - 78, 5, 152);
        shadow(x, true);
        x.textBaseline = 'alphabetic';
        var textX = 70 + lw + 74, avail = W - textX - 70;
        x.fillStyle = '#FFFFFF';
        var nameSize = fitFont(x, co, '900', 74, avail, 'Nunito, sans-serif');
        x.fillText(co, textX, baseY + 6);
        /* The kicker has to stay subordinate. On a long company name the name
           shrinks a long way, and a fixed-size kicker ends up competing with it. */
        x.fillStyle = '#E4CB8E';
        var t = 'F L O C O   C E R T I F I E D   S P E C I A L I S T';
        fitFont(x, t, '600', Math.min(31, Math.round(nameSize * 0.42)), avail, 'Inter, sans-serif');
        x.fillText(t, textX + 2, baseY + 62);
        shadow(x, false);
        return o.c;
      });
    },
    'badge': function () {
      return load('assets/img/certified-badge.png').then(function (b) {
        var o = ctx2d(), x = o.x;
        var w = 340, h = Math.round(340 * b.height / b.width);
        shadow(x, true);
        x.drawImage(b, W - w - 60, 120, w, h);
        shadow(x, false);
        return o.c;
      });
    },
    'stars': function (p) {
      var o = ctx2d(), x = o.x;
      var co = (p.company || '').trim() || 'Your Company';
      var cy = 1640, n = 5, r = 46, gap = 116;
      var startX = W / 2 - ((n - 1) * gap) / 2;
      shadow(x, true);
      for (var i = 0; i < n; i++) star(x, startX + i * gap, cy, r, '#3BBFB8');
      x.textAlign = 'center';
      x.fillStyle = '#FFFFFF';
      fitFont(x, co, '900', 52, W - 160, 'Nunito, sans-serif');
      x.fillText(co, W / 2, cy + 130);
      shadow(x, false);
      x.textAlign = 'left';
      return Promise.resolve(o.c);
    }
  };

  var NAMES = {
    'lower-third': 'FLOCO-overlay-lower-third.png',
    'badge':       'FLOCO-overlay-certified-badge.png',
    'stars':       'FLOCO-overlay-five-star.png'
  };

  function run(kind, tile) {
    var was = tile.getAttribute('data-was') || tile.querySelector('.lg').textContent;
    tile.setAttribute('data-was', was);
    tile.querySelector('.lg').textContent = 'Building…';
    /* Canvas draws with whatever fonts are ready, so wait or it silently
       falls back to a system face and the overlay looks wrong. */
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve())
      .then(function () { return BUILD[kind](profile()); })
      .then(function (c) { grab(c, NAMES[kind]); tile.querySelector('.lg').textContent = 'Saved ✓';
        setTimeout(function () { tile.querySelector('.lg').textContent = was; }, 1800); })
      .catch(function () { tile.querySelector('.lg').textContent = 'Could not build'; 
        setTimeout(function () { tile.querySelector('.lg').textContent = was; }, 2200); });
  }

  /* Bound straight to the tiles rather than delegated from document, because
     app.js's wire() calls stopPropagation() on clicks and a delegated listener
     never hears them. */
  function bind() {
    document.querySelectorAll('.ov-tile[data-ov]').forEach(function (t) {
      if (t.getAttribute('data-bound')) return;
      t.setAttribute('data-bound', '1');
      t.addEventListener('click', function () { run(t.getAttribute('data-ov'), t); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
