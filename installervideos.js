/* installervideos.js — the ready-to-post reel set for one certified company.
 *
 * Vuba hands its installers generic clips. We hand each company reels that end
 * on their own logo, which is the whole reason these are worth posting. That
 * means a set belongs to a company, so this file maps company -> set and the
 * page shows nothing at all to anyone else.
 *
 * ⚠️ Same honest limit as accounts.js: this is presentation, not security. The
 * file is readable in page source. Fine here — these are marketing reels meant
 * to be posted publicly. Never key anything confidential off this.
 *
 * Adding a company: re-render endcard.html with their name and logo, drop the
 * mp4s and poster JPGs under assets/videos/<slug>/, add one entry below.
 */
(function () {
  var SETS = {
    "pro surfacing": {
      dir: "assets/videos/pro-surfacing",
      reels: [
        { f: "01-asmr",           n: "The Mix",         d: "0:17",
          s: "Colour going down. Stops the scroll." },
        { f: "02-before-after",   n: "Before &amp; After", d: "0:16",
          s: "Six real pairs. Your proof reel." },
        { f: "03-right-over-it",  n: "Right Over It",   d: "0:16",
          s: "Answers the cracked-concrete question." }
      ]
    }
  };

  function companyKey() {
    try {
      var p = (window.FLOCOauth && FLOCOauth.profile()) || {};
      return (p.company || '').trim().toLowerCase();
    } catch (e) { return ''; }
  }

  function render() {
    var set = SETS[companyKey()];
    var wrap = document.getElementById('vidWrap');
    var grid = document.getElementById('vidGrid');
    if (!set || !wrap || !grid) return;

    grid.innerHTML = set.reels.map(function (r) {
      return '<a class="vid" href="' + set.dir + '/' + r.f + '.mp4" download>' +
        '<div class="vth">' +
          '<img src="' + set.dir + '/' + r.f + '.jpg" alt="">' +
          '<div class="pl"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>' +
          '<div class="vln">' + r.d + '</div>' +
        '</div>' +
        '<div class="dn">' + r.n + '</div>' +
        '<div class="du">' + r.s + '</div>' +
      '</a>';
    }).join('');
    wrap.hidden = false;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else { render(); }
})();
