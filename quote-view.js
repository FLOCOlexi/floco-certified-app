/* Renders the quote the customer actually sees.
 *
 * Everything comes from the builder's own storage, so the installer never
 * retypes anything. Empty sections remove themselves rather than printing a
 * heading over nothing — a quote with a blank "Prep work" block looks careless,
 * and this document is the whole first impression.
 *
 * "Save as PDF" is the browser's own print dialogue. In a static app with no
 * build step that is the honest way to produce a real, shareable PDF, and on a
 * phone it lands straight in the share sheet.
 */
(function(){
  function j(k){ try { return JSON.parse(localStorage.getItem(k)) || null; } catch(e){ return null; } }

  /* A quote emailed to a customer arrives with the whole document packed into
     the link (see shareLink() in quotes.js), because the customer has none of
     the installer's storage. When that is present it wins; otherwise this is
     the installer previewing their own draft. */
  function fromLink(){
    var m = (location.hash || '').match(/[#&]q=([^&]+)/);
    if (!m) return null;
    try {
      var b = m[1].replace(/-/g,'+').replace(/_/g,'/');
      while (b.length % 4) b += '=';
      return JSON.parse(decodeURIComponent(escape(atob(b))));
    } catch (e) { return null; }
  }

  var shared = fromLink();
  var q, p, blends;
  if (shared) {
    q = shared.q || {};
    p = shared.p || {};
    blends = (shared.b || []).filter(function(b){ return (b.sqft||0) > 0; });
    /* The top bar is the installer's toolkit — "Back to edit" would drop a
       customer into the quote builder. They get a clean document and a way to
       save it, nothing else. */
    document.documentElement.classList.add('shared');
  } else {
    q = j('floco_quote') || {};
    p = j('floco_auth_v1') || {};
    blends = (j('floco_blends') || []).filter(function(b){ return (b.sqft||0) > 0; });
  }
  var esc = function(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  var set = function(id, html){ var el=document.getElementById(id); if(el) el.innerHTML = html; };
  var hide = function(id){ var el=document.getElementById(id); if(el) el.style.display='none'; };

  var co = (p.company || '').trim() || 'Your Company';
  set('vCo', esc(co));
  /* Their logo leads, with the company name underneath it. */
  var lg = shared ? '' : (localStorage.getItem('floco_logo') || '');
  var lgEl = document.getElementById('vLogo');
  if(lg && lgEl){ lgEl.src = lg; lgEl.className = 'logo has'; }
  /* Each item is nowrap so a phone number never breaks across two lines
     ("(407) / 555-0148" is how the header looked on a narrow screen). */
  var meta = [];
  if(p.location) meta.push(esc(p.location));
  if(p.phone) meta.push(esc(p.phone));
  if(p.email) meta.push(esc(p.email));
  set('vCoMeta', meta.map(function(m){
    return '<span style="white-space:nowrap">' + m + '</span>';
  }).join(' &nbsp;·&nbsp; '));

  set('vTitle', esc(q.qType || 'Rubber Surfacing') + ' Quote');
  set('vFor', esc(q.qName || '—'));
  set('vAddr', esc(q.qAddr || '—'));
  set('vDate', new Date().toLocaleDateString('en-US',{month:'long', day:'numeric', year:'numeric'}));

  /* ---- the number ---- */
  var sq = blends.reduce(function(a,b){ return a + (b.sqft||0); }, 0);
  var price = (q.qFlat > 0) ? q.qFlat : ((q.qRate > 0) ? q.qRate * sq : 0);
  if(price > 0){
    set('vPrice', '$' + price.toLocaleString('en-US',{minimumFractionDigits:2, maximumFractionDigits:2}));
    set('vSq', sq > 0 ? sq.toLocaleString() + ' sq ft of finished surface' : '');
  } else {
    set('vPrice', 'Price to follow');
    set('vSq', sq > 0 ? sq.toLocaleString() + ' sq ft measured' : '');
  }

  /* ---- areas ---- */
  if(blends.length){
    var rows = blends.map(function(b){
      return '<div class="r"><span class="n">' + esc(b.name||'Area') + '</span>'
           + '<span class="q">' + (b.sqft||0).toLocaleString() + ' sq ft</span></div>';
    }).join('');
    rows += '<div class="tot"><span>Total</span><span>' + sq.toLocaleString() + ' sq ft</span></div>';
    if(q.qPerim) rows += '<div class="r" style="border-bottom:0"><span class="n">Pool perimeter</span>'
                       + '<span class="q">' + esc(q.qPerim) + ' linear ft</span></div>';
    set('vAreas', rows);
  } else hide('secAreas');

  /* ---- prep ---- */
  var prep = [['Drainage', q.qDrain], ['Grinding', q.qGrind], ['Coping prep', q.qCopePrep],
              ['Concrete prep', q.qConc], ['Self-levelling', q.qLevel]]
    .filter(function(r){ return (r[1]||'').trim(); });
  if(prep.length){
    set('vPrep', prep.map(function(r){
      return '<div class="kv"><div class="l">' + esc(r[0]) + '</div><div class="v">' + esc(r[1]) + '</div></div>';
    }).join(''));
  } else hide('secPrep');

  /* ---- design choices ---- */
  var OPTIONS = {
    luminous:'Luminous addition — standard silver glitter',
    inlay:'One complimentary design inlay from existing molds',
    faux:'Faux coping, if you prefer',
    shading:'Shading, if you prefer',
    lighting:'LED lighting',
    mosaic:'Mosaic tiles — catalog available to review',
    riser:'Riser measurement / step faces'
  };
  var design = [];
  if(q.qRubber) design.push(['Rubber', q.qRubber]);
  if(q.qThick) design.push(['Thickness', q.qThick]);
  if(q.qBlend) design.push(['Colour blend', q.qBlend]);
  var on = q.opts || {};
  var picked = Object.keys(OPTIONS).filter(function(k){ return on[k]; }).map(function(k){ return OPTIONS[k]; });
  if(picked.length) design.push(['Additions', picked.join('<br>')]);
  if((q.qNotes||'').trim()) design.push(['Notes', esc(q.qNotes).replace(/\n/g,'<br>')]);
  if(design.length){
    set('vDesign', design.map(function(r){
      var val = (r[0]==='Additions' || r[0]==='Notes') ? r[1] : esc(r[1]);
      return '<div class="kv"><div class="l">' + esc(r[0]) + '</div><div class="v">' + val + '</div></div>';
    }).join(''));
  } else hide('secDesign');

  /* ---- signature + the independence line the terms require ---- */
  set('vRep', esc((p.repName||'').trim() || co));
  var rm = [];
  if(p.repName && co) rm.push(esc(co));
  rm.push('FLOCO Certified Installer');
  if(p.phone) rm.push(esc(p.phone));
  set('vRepMeta', rm.join(' &nbsp;·&nbsp; '));
  set('vIndep', esc(co) + ' is an independently owned and operated FLOCO Certified '
    + 'Specialist. Your agreement for this work is with ' + esc(co) + ', and payment is made to '
    + esc(co) + ' directly, not to FLOCO Decking Systems.');

  /* window.print() is the honest way to make a real PDF from a static app,
     but inside an INSTALLED iOS app there is no browser chrome to fall back
     on if the print sheet misbehaves, and the page can look frozen. So we
     say what is happening, and we never leave the screen without a way out. */
  /* A customer reading a shared quote has none of the installer's storage, so
     the Terms page would stamp a placeholder where the company name belongs.
     Carry the name across in the link. */
  if (shared) {
    var tc = document.querySelector('.tc');
    if (tc && (p.company || '').trim()) {
      try {
        tc.setAttribute('href', 'terms.html#co=' +
          btoa(unescape(encodeURIComponent(p.company.trim())))
            .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''));
      } catch (e) {}
    }
  }

  var btn = document.getElementById('toPdf');
  if(btn) btn.addEventListener('click', function(){
    var standalone = window.navigator.standalone === true ||
                     (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    try {
      window.print();
    } catch (e) {
      alert('Your device blocked the print sheet. Open this quote in Safari or '
          + 'Chrome and use Share \u2192 Print to save it as a PDF.');
      return;
    }
    if (standalone) {
      /* If the sheet never appears the person is left staring at the quote
         wondering whether it worked. One short nudge, then it clears itself. */
      setTimeout(function(){
        var t = document.createElement('div');
        t.textContent = 'No print sheet? Use Share \u2192 Print, or tap Home to go back.';
        t.style.cssText = 'position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:99;'
          + 'background:#0A1F35;color:#EAF0F3;border:1px solid rgba(198,166,98,.5);border-radius:12px;'
          + "padding:11px 15px;font-family:'Inter',sans-serif;font-size:12px;max-width:86%;text-align:center;"
          + 'box-shadow:0 10px 30px rgba(0,0,0,.5)';
        document.body.appendChild(t);
        setTimeout(function(){ t.remove(); }, 6000);
      }, 1200);
    }
  });
})();
