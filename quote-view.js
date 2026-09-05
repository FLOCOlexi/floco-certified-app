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
  var q = j('floco_quote') || {};
  var p = j('floco_auth_v1') || {};
  var blends = (j('floco_blends') || []).filter(function(b){ return (b.sqft||0) > 0; });
  var esc = function(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  var set = function(id, html){ var el=document.getElementById(id); if(el) el.innerHTML = html; };
  var hide = function(id){ var el=document.getElementById(id); if(el) el.style.display='none'; };

  var co = (p.company || '').trim() || 'Your Company';
  set('vCo', esc(co));
  /* Their logo leads, with the company name underneath it. */
  var lg = localStorage.getItem('floco_logo') || '';
  var lgEl = document.getElementById('vLogo');
  if(lg && lgEl){ lgEl.src = lg; lgEl.className = 'logo has'; }
  var meta = [];
  if(p.location) meta.push(esc(p.location));
  if(p.phone) meta.push(esc(p.phone));
  if(p.email) meta.push(esc(p.email));
  set('vCoMeta', meta.join(' &nbsp;·&nbsp; '));

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

  var btn = document.getElementById('toPdf');
  if(btn) btn.addEventListener('click', function(){ window.print(); });
})();
