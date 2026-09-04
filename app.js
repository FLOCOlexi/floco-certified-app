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
        wire(el, function () {
          var b = document.getElementById('ordEmail');
          if (b) { b.scrollIntoView({behavior:'smooth', block:'center'}); b.click(); }
          else toast('Open Materials to start an order 🦩');
        });
      } else if (/^Order the FLOCO cleaner/i.test(t)) {
        wire(el, function () { location.href = 'mailto:' + MAIL + '?subject=FLOCO%20Cleaner%20Order'; });
      }
    }
  }


  /* ==================================================================
   * ORDERING FROM AMERICAN RECYCLING
   *
   * Modelled on how FLOCO actually orders today: Mike Weidman → **Kaylee
   * Arellano**, FLOCO's rep at American Recycling. A PO number in the
   * subject, a short note, then the quantities as a plain list.
   *
   * Three things are added deliberately, because the real threads show they
   * are what causes a round of back-and-forth every time:
   *   - a named contact WITH a phone number ("I see you placed the order,
   *     but did not provide a phone number. Should I use Brett?")
   *   - an explicit ship-to and a requested delivery date
   *   - a PO number, which is how ARC tracks the order on their side
   *
   * 🚫 No prices. FLOCO's per-bag rates are negotiated and are not a
   * partner's rates — quoting them here would be wrong twice over. The
   * partner asks for the total with freight, same as FLOCO does.
   *
   * The bag counts come from the installer's own Design Studio blends, so
   * the numbers are already done. Nothing is sent automatically — this
   * only opens their mail app with a draft they check and send.
   * ================================================================== */
  var ARC_EMAIL = 'Kaylee.Arellano@americanrecycling.com';
  var ARC_TEL   = '+19897255100';
  var SQFT_PER_BAG = 20, SQFT_PER_BUCKET = 125;

  function ordProfile(){
    try { return JSON.parse(localStorage.getItem('floco_auth_v1')) || {}; } catch(e){ return {}; }
  }
  function ordBlends(){
    try { var v = JSON.parse(localStorage.getItem('floco_blends')); return (v && v.length) ? v : []; } catch(e){ return []; }
  }
  /* Same largest-remainder split the Studio and the manual use, so the
   * order can never disagree with what the app showed on screen. */
  function ordBags(sqft, cols){
    var total = Math.ceil(sqft / SQFT_PER_BAG), n = cols.length;
    var pct = cols.map(function(c){ return typeof c.pct === 'number' ? c.pct : Math.round(100/n); });
    var raw = pct.map(function(p){ return total * p / 100; });
    var out = raw.map(function(r){ return Math.max(1, Math.floor(r)); });
    var used = out.reduce(function(a,b){ return a+b; }, 0);
    var order = raw.map(function(r,i){ return [r - Math.floor(r), i]; }).sort(function(a,b){ return b[0]-a[0]; });
    var k = 0;
    while (used < total && order.length) { out[order[k % order.length][1]]++; used++; k++; }
    return out;
  }

  /* One flat list, rolled up across every blend — which is exactly how Mike's
   * real orders read. American Recycling does not care which job a bag is for;
   * they care about the code and the count. Blend names stay out of it. */
  function ordLines(){
    var list = ordBlends().filter(function(b){ return b.cols && b.cols.length && b.sqft > 0; });
    if (!list.length) return null;
    var roll = {}, order = [], totalSq = 0, totalBags = 0;
    list.forEach(function(b){
      var bags = ordBags(b.sqft, b.cols);
      b.cols.forEach(function(c,i){
        if (!roll[c.code]) { roll[c.code] = { code:c.code, n:c.n, bags:0 }; order.push(c.code); }
        roll[c.code].bags += bags[i];
        totalBags += bags[i];
      });
      totalSq += b.sqft;
    });
    var buckets = Math.ceil(totalSq / SQFT_PER_BUCKET);
    var lines = order.map(function(c){ return roll[c].code + '  ' + roll[c].n + '  ' + roll[c].bags + ' bags'; });
    lines.push('Pre-Mark 80  ' + buckets + ' buckets');
    return { lines: lines, sqft: totalSq, bags: totalBags, buckets: buckets, colors: order.length };
  }

  function initOrdering(){
    var btn = document.getElementById('ordEmail');
    if (!btn) return;
    var data = ordLines();

    var sum = document.getElementById('ordSummary');
    if (sum && data){
      sum.innerHTML = '<b>' + data.bags + ' bags</b> across ' + data.colors + ' colours &middot; <b>'
        + data.buckets + ' buckets</b> of Pre-Mark 80<br>' + data.sqft + ' sq ft total, already worked out.';
    }

    wire(btn, function(){
      var p = ordProfile();
      var subject = 'New Order';
      var body = [
        'Kaylee,',
        '',
        'Here is a new order. Could you get this placed and let me know the total with freight, and I will get payment over to you.',
        '',
        /* No city prefilled — a partner ships to their own terminal or
         * warehouse, which is rarely where their profile says they are. */
        'Ship to: [ADDRESS]',
        'Requested delivery: [DATE]',
        'Contact for this order: [YOUR NAME] · [YOUR PHONE]',
        ''
      ];
      if (data) body = body.concat(data.lines);
      else body = body.concat([
        'RH31  Cream  00 bags',
        'RH65  Pale Grey  00 bags',
        'Pre-Mark 80  0 buckets'
      ]);
      body.push('');
      body.push('Thank you!');
      body.push('');
      body.push('[YOUR NAME]');
      body.push('FLOCO Certified Installer');
      /* Their own company reads under the certification, not instead of it —
       * the certification is the part that means something to the supplier. */
      if (p.company) body.push(p.company);

      var href = 'mailto:' + ARC_EMAIL + '?subject=' + encodeURIComponent(subject)
               + '&body=' + encodeURIComponent(body.join('\r\n'));
      if (href.length > 1900) toast('Big order — check nothing was cut off before sending');
      location.href = href;
    });

    var call = document.getElementById('ordCall');
    if (call) wire(call, function(){ location.href = 'tel:' + ARC_TEL; });
  }
  /* app.js is deferred so the DOM is normally parsed by now, but guard it
   * anyway — this page is also opened straight from the home tiles. */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initOrdering);
  else initOrdering();

  // service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
