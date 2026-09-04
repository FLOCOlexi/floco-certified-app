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
  /* Which blends this particular order covers. Mike's real orders often span
   * several jobs at once, so an installer needs to tick the ones going in.
   * Default is everything; the choice is remembered per device. */
  var PICKKEY = 'floco_order_pick';
  function ordPicked(){
    try { var v = JSON.parse(localStorage.getItem(PICKKEY)); return Array.isArray(v) ? v : null; } catch(e){ return null; }
  }
  function ordSetPicked(ids){ localStorage.setItem(PICKKEY, JSON.stringify(ids)); }

  function ordBlends(){
    try { var v = JSON.parse(localStorage.getItem('floco_blends')); return (v && v.length) ? v : []; } catch(e){ return []; }
  }
  /* THE ONE COPY OF THE SPLIT.
   * This was reimplemented here once, and a sweep of 1,600 blend/footage
   * combinations found it disagreeing with the Studio on 27 of them — the
   * screen would show one split and the email would send another. Same
   * algorithm, character for character, as bagsFor() in studio.js:
   * largest-remainder, then guarantee every colour at least one bag by taking
   * it off the biggest. Change one, change both.
   */
  function ordBags(sqft, cols){
    if (sqft <= 0 || !cols.length) return [];
    var total = Math.ceil(sqft / SQFT_PER_BAG), rows = [], i;
    var n = cols.length;
    for (i = 0; i < n; i++){
      var pct = (typeof cols[i].pct === 'number') ? cols[i].pct : Math.round(100 / n);
      var raw = total * pct / 100, fl = Math.floor(raw);
      rows.push({ bags: fl, rem: raw - fl });
    }
    var used = 0; for (i = 0; i < rows.length; i++) used += rows[i].bags;
    var spare = total - used;
    var order = rows.slice().sort(function(a,b){ return b.rem - a.rem; });
    var k = 0;
    while (spare > 0 && order.length){ order[k % order.length].bags += 1; spare--; k++; }
    for (i = 0; i < rows.length; i++){
      if (rows[i].bags < 1){
        rows[i].bags = 1;
        var big = rows[0];
        for (var j = 1; j < rows.length; j++) if (rows[j].bags > big.bags) big = rows[j];
        if (big !== rows[i] && big.bags > 1) big.bags -= 1;
      }
    }
    return rows.map(function(r){ return r.bags; });
  }

  function ordLines(){
    var picked = ordPicked();
    var list = ordBlends().filter(function(b){
      if (!(b.cols && b.cols.length && b.sqft > 0)) return false;
      return picked ? picked.indexOf(b.id) > -1 : true;
    });
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
    /* A rep can nudge a bag count in the Studio (FLOCO's own sheets do it).
     * The order has to send what they decided, not what the math proposed. */
    var ov = {};
    try { ov = JSON.parse(localStorage.getItem('floco_bag_override')) || {}; } catch(e){}
    totalBags = 0;
    order.forEach(function(c){
      if (Object.prototype.hasOwnProperty.call(ov, c)) roll[c].bags = ov[c];
      totalBags += roll[c].bags;
    });
    var lines = order.map(function(c){ return roll[c].code + '  ' + roll[c].n + '  ' + roll[c].bags + ' bags'; });
    lines.push('Pre-Mark 80  ' + buckets + ' buckets');
    return { lines: lines, sqft: totalSq, bags: totalBags, buckets: buckets, colors: order.length };
  }


  /* Everything on Mike's order sheet that a blend can't supply: extra bags of
   * a colour, more primer, buffings, binder. His sheet lists them as
   * item / quantity, so this does the same.
   * 🚫 No prices. Mike's sheet carries FLOCO's negotiated per-bag rates; a
   * partner's rates are their own, so the order asks for the total with
   * freight instead of quoting numbers that would be wrong. */
  var ARC_ITEMS = [
    ['RH31','Cream'],['RH30','Beige'],['RH32','Brown'],['RH41','Bright Yellow'],['RH40','Mustard'],
    ['RH50','Orange'],['RH01','Standard Red'],['RH02','Bright Red'],['RH90','Pink'],['RH21','Purple'],
    ['RH20','Standard Blue'],['RH22','Light Blue'],['RH23','Azure'],['RH26','Turquoise'],
    ['RH12','Dark Green'],['RH10','Standard Green'],['RH11','Bright Green'],
    ['RH65','Pale Grey'],['RH61','Light Grey'],['RH60','Dark Grey'],['RH70','Black']
  ];
  var ARC_OTHER = [
    ['PM80','Pre-Mark 80','buckets'],
    ['BUFF','Buffings','bags'],
    ['ALI80','Aliphatic 80 binder','pails']
  ];
  var XKEY = 'floco_order_extra', SHIPKEY = 'floco_order_ship';
  function ordExtras(){ try { var v=JSON.parse(localStorage.getItem(XKEY)); return Array.isArray(v)?v:[]; } catch(e){ return []; } }
  function ordSetExtras(v){ localStorage.setItem(XKEY, JSON.stringify(v)); }
  function ordShip(){ try { return JSON.parse(localStorage.getItem(SHIPKEY)) || {}; } catch(e){ return {}; } }
  function ordSetShip(v){ localStorage.setItem(SHIPKEY, JSON.stringify(v)); }

  function renderExtras(){
    var sel = document.getElementById('xSel'), host = document.getElementById('extraList');
    if (!sel || !host) return;
    if (!sel.options.length){
      var html = '<optgroup label="Rosehill TPV — bags">';
      ARC_ITEMS.forEach(function(c){ html += '<option value="'+c[0]+'|'+c[1]+'|bags">'+c[0]+'  '+c[1]+'</option>'; });
      html += '</optgroup><optgroup label="Everything else">';
      ARC_OTHER.forEach(function(c){ html += '<option value="'+c[0]+'|'+c[1]+'|'+c[2]+'">'+c[1]+'</option>'; });
      sel.innerHTML = html + '</optgroup>';
    }
    var list = ordExtras();
    host.innerHTML = list.length ? list.map(function(x,i){
      return '<div class="xrow"><span class="nm">' + (x.code === x.n ? x.n : x.code + '  ' + x.n) + '</span>'
        + '<span class="q">' + x.qty + ' ' + x.unit + '</span>'
        + '<span class="rm" data-x="' + i + '">&times;</span></div>';
    }).join('') : '';
    host.querySelectorAll('.rm').forEach(function(b){
      b.addEventListener('click', function(){
        var l = ordExtras(); l.splice(+b.getAttribute('data-x'),1); ordSetExtras(l); initOrdering();
      });
    });
  }

  function initShipFields(){
    var d = document.getElementById('ordDate'), pl = document.getElementById('ordPallets');
    var sh = ordShip();
    if (d && !d._fw){ d._fw = 1; d.value = sh.date || '';
      d.addEventListener('input', function(){ var v = ordShip(); v.date = d.value; ordSetShip(v); }); }
    if (pl && !pl._fw){ pl._fw = 1; pl.value = sh.pallets || '';
      pl.addEventListener('input', function(){ var v = ordShip(); v.pallets = pl.value; ordSetShip(v); }); }
    var add = document.getElementById('xAdd');
    if (add && !add._fw){ add._fw = 1;
      add.addEventListener('click', function(){
        var sel = document.getElementById('xSel'), q = document.getElementById('xQty');
        var parts = (sel.value||'').split('|'); var qty = Math.max(1, parseInt(q.value,10) || 1);
        if (parts.length < 3) return;
        var l = ordExtras();
        /* Same item twice just adds up, rather than listing it twice. */
        var hit = null;
        l.forEach(function(x){ if (x.code === parts[0] && x.unit === parts[2]) hit = x; });
        if (hit) hit.qty += qty; else l.push({ code:parts[0], n:parts[1], qty:qty, unit:parts[2] });
        ordSetExtras(l); q.value = 1; initOrdering();
        toast(parts[1] + ' added to the order');
      });
    }
  }

  function niceDate(iso){
    var b = (iso||'').split('-'); if (b.length !== 3) return iso;
    var M = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return M[+b[1]-1] + ' ' + (+b[2]) + ', ' + b[0];
  }
  var CHECK = '<svg viewBox="0 0 24 24"><path d="M4 12l6 6L20 6"/></svg>';
  function renderPicker(){
    var host = document.getElementById('pickList');
    if (!host) return;
    var all = ordBlends().filter(function(b){ return b.cols && b.cols.length && b.sqft > 0; });
    if (!all.length){
      host.innerHTML = '<div class="pickempty">No blends with square footage yet. Build them in the Design Studio and they show up here.</div>';
      return;
    }
    var picked = ordPicked();
    host.innerHTML = all.map(function(b){
      var on = picked ? picked.indexOf(b.id) > -1 : true;
      return '<div class="pick ' + (on ? 'on' : 'off') + '" data-id="' + b.id + '">'
        + '<span class="bx">' + CHECK + '</span>'
        + '<span class="nm">' + (b.name || 'Unnamed blend') + '</span>'
        + '<span class="sq">' + b.sqft + ' sq ft</span>'
        + '<span class="bg">' + Math.ceil(b.sqft / SQFT_PER_BAG) + '</span>'
        + '</div>';
    }).join('');
    host.querySelectorAll('.pick').forEach(function(row){
      row.addEventListener('click', function(){
        var ids = ordPicked();
        if (!ids) ids = all.map(function(b){ return b.id; });
        var id = row.getAttribute('data-id'), i = ids.indexOf(id);
        if (i > -1) { if (ids.length === 1) return; ids.splice(i,1); } else ids.push(id);
        ordSetPicked(ids);
        initOrdering();
      });
    });
  }

  function initOrdering(){
    var btn = document.getElementById('ordEmail');
    if (!btn) return;
    renderPicker();
    renderExtras();
    initShipFields();
    var data = ordLines();

    /* The calculator at the top of the page reflects the same selection —
     * it used to show a hard-coded 1,200 sq ft that was true for nobody. */
    var cs = document.getElementById('calcSq'), cb = document.getElementById('calcBags');
    if (cs) cs.textContent = data ? data.sqft.toLocaleString() : '—';
    if (cb) cb.textContent = data ? (data.bags + ' bags') : '—';

    var sum = document.getElementById('ordSummary');
    var nx = ordExtras().length;
    if (sum){
      if (data) sum.innerHTML = '<b>' + data.bags + ' bags</b> across ' + data.colors + ' colours &middot; <b>'
        + data.buckets + ' buckets</b> of Pre-Mark 80' + (nx ? ' &middot; <b>' + nx + '</b> extra item' + (nx===1?'':'s') : '')
        + '<br>' + data.sqft + ' sq ft total, already worked out.';
      else if (nx) sum.innerHTML = '<b>' + nx + '</b> extra item' + (nx===1?'':'s') + '. Tick a blend above to add its bag counts.';
    }

    /* initOrdering re-runs on every tick, and wire() only ever binds once —
     * so read the current selection at click time, not at bind time. */
    wire(btn, function(){
      var p = ordProfile();
      var data = ordLines();
      var sh = ordShip();
      var subject = 'New Order';
      var body = [
        'Kaylee,',
        '',
        'Here is a new order. Could you get this placed and let me know the total with freight, and I will get payment over to you.',
        '',
        /* No city prefilled — a partner ships to their own terminal or
         * warehouse, which is rarely where their profile says they are. */
        'Ship to: [ADDRESS]',
        'Requested delivery: ' + (sh.date ? niceDate(sh.date) : '[DATE]'),
        'Pallets: ' + (sh.pallets ? sh.pallets : '[HOW MANY]'),
        'Contact for this order: [YOUR NAME] · [YOUR PHONE]',
        ''
      ];
      if (data) body = body.concat(data.lines);
      var extras = ordExtras();
      if (extras.length) extras.forEach(function(x){
        body.push((x.code === x.n ? x.n : x.code + '  ' + x.n) + '  ' + x.qty + ' ' + x.unit);
      });
      if (!data && !extras.length) body = body.concat([
        'RH31  Cream  00 bags',
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
