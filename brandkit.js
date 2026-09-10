/* FLOCO Certified — My Brand actions.
 *
 * These used to be six cards that all raised "coming soon". Three of them are
 * now plain <a download> links to real files in the repo. The three left here
 * are the ones that cannot be a static file, because they carry the signed-in
 * company's own name:
 *
 *   lockup     — a PNG of "<their company> · a FLOCO Certified Specialist",
 *                drawn on a canvas at 2000x1100 so it is usable in print.
 *   embed      — the HTML snippet for the badge on their own website.
 *   signature  — their email signature, copied to the clipboard.
 *
 * Same approach as overlays.js: generate on the device, never on a server, so
 * nothing about a company's branding has to leave their phone.
 */
(function () {
  'use strict';

  function profile() {
    try { return (window.FLOCOauth && FLOCOauth.profile()) || {}; } catch (e) { return {}; }
  }
  function companyName() {
    var p = profile();
    return (p.company || '').trim() || 'Your Company';
  }
  function toast(msg) {
    if (window.FLOCOtoast) return window.FLOCOtoast(msg);
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:104px;transform:translateX(-50%);z-index:9999;' +
      'background:#0A1F35;color:#EAF0F3;border:1px solid rgba(198,166,98,.5);border-radius:12px;' +
      "padding:11px 16px;font-family:'Inter',sans-serif;font-size:12.5px;max-width:82%;text-align:center;" +
      'box-shadow:0 10px 30px rgba(0,0,0,.45)';
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }

  function save(canvas, filename) {
    canvas.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }, 'image/png');
  }

  /* Long company names have to shrink rather than run off the canvas. */
  function fitFont(ctx, text, weight, maxWidth, startPx) {
    var px = startPx;
    do {
      ctx.font = weight + ' ' + px + "px 'Nunito', 'Helvetica Neue', Arial, sans-serif";
      if (ctx.measureText(text).width <= maxWidth) break;
      px -= 4;
    } while (px > 24);
    return px;
  }

  function buildLockup() {
    var W = 2000, H = 1100, co = companyName();
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var x = c.getContext('2d');

    var g = x.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#0E2A47'); g.addColorStop(1, '#081625');
    x.fillStyle = g; x.fillRect(0, 0, W, H);

    var badge = new Image();
    badge.onload = badge.onerror = function () {
      if (badge.width) {
        var bh = 420, bw = badge.width * (bh / badge.height);
        x.drawImage(badge, (W - bw) / 2, 120, bw, bh);
      }
      x.textAlign = 'center';

      x.fillStyle = '#FFFFFF';
      var px = fitFont(x, co, '900', W - 260, 128);
      x.fillText(co, W / 2, 700 + (128 - px) * 0.3);

      x.fillStyle = '#C6A662';
      x.fillRect(W / 2 - 90, 760, 180, 4);

      x.fillStyle = '#E4CB8E';
      x.font = "600 46px 'Inter', 'Helvetica Neue', Arial, sans-serif";
      x.fillText('a FLOCO Certified Specialist', W / 2, 850);

      x.fillStyle = 'rgba(199,210,220,.72)';
      x.font = "400 34px 'Inter', 'Helvetica Neue', Arial, sans-serif";
      x.fillText('Rubber Surfacing Experts', W / 2, 920);

      save(c, co.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '-FLOCO-Lockup.png');
      toast('Lockup saved — 2000 × 1100, print ready');
    };
    badge.src = 'assets/img/certified-badge.png';
  }

  function copyText(text, note) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:-2000px;left:-2000px';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      ta.remove(); toast(note);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(note); }, fallback);
    } else { fallback(); }
  }

  var ACTIONS = {
    lockup: buildLockup,
    embed: function () {
      var co = companyName();
      copyText(
        '<!-- FLOCO Certified badge -->\n' +
        '<a href="https://flocodeckingsystems.com" target="_blank" rel="noopener"\n' +
        '   style="display:inline-block;text-decoration:none;font-family:Inter,Arial,sans-serif">\n' +
        '  <img src="https://flocolexi.github.io/floco-certified-app/assets/img/certified-badge.png"\n' +
        '       alt="' + co + ' is a FLOCO Certified Specialist" width="180" style="display:block">\n' +
        '</a>',
        'Embed code copied — paste into your site'
      );
    },
    signature: function () {
      var p = profile(), co = companyName();
      copyText(
        (p.repName || 'Your Name') + '\n' + co + '\n' +
        'FLOCO Certified Specialist  |  Rubber Surfacing Experts\n' +
        (p.email || '') + (p.phone ? '  |  ' + p.phone : ''),
        'Signature copied'
      );
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    /* The lockup preview carries their name, not a placeholder. */
    var co = document.getElementById('lockCo');
    if (co) co.textContent = companyName();

    document.querySelectorAll('[data-brand]').forEach(function (el) {
      var fn = ACTIONS[el.getAttribute('data-brand')];
      if (!fn) return;
      el.addEventListener('click', function (ev) {
        ev.preventDefault(); ev.stopPropagation(); fn();
      });
    });
  });
})();
