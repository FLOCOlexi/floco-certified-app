/* FLOCO Certified — the quote builder.
 *
 * WHY THIS SHAPE
 * --------------
 * A real FLOCO estimate in Housecall Pro is ONE line item whose *description*
 * carries the whole scope: rep contact, project type, areas, total sq ft, pool
 * perimeter, prep work, design choices and additions. So this page's job is to
 * collect exactly those fields and render them beautifully — not to model a
 * complicated invoice.
 *
 * ONE JOB, TWO MOMENTS. The areas measured here ARE the blends the rep designs
 * later, so they share `floco_blends` — name and square footage now, colours at
 * the design meeting. Nobody types a measurement twice.
 *
 * 🚫 The app does not set price. The manual tells partners to set rates for
 * their own market, so they enter their own $/sq ft or a flat total.
 */
(function(){
  var QKEY = 'floco_quote', BKEY = 'floco_blends';

  function quote(){ try { return JSON.parse(localStorage.getItem(QKEY)) || {}; } catch(e){ return {}; } }
  function saveQuote(q){ localStorage.setItem(QKEY, JSON.stringify(q)); }
  function blends(){ try { var v=JSON.parse(localStorage.getItem(BKEY)); return Array.isArray(v)?v:[]; } catch(e){ return []; } }
  function saveBlends(v){ localStorage.setItem(BKEY, JSON.stringify(v)); }
  function uid(){ return 'b' + Math.random().toString(36).slice(2,8); }
  function money(n){
    if(!isFinite(n) || n<=0) return '';
    return '$' + n.toLocaleString('en-US',{minimumFractionDigits:2, maximumFractionDigits:2});
  }

  /* ---- the areas double as the blends ---------------------------------- */
  var CHECK = '<svg viewBox="0 0 24 24"><path d="M4 12l6 6L20 6"/></svg>';

  function renderAreas(){
    var host = document.getElementById('qAreas'); if(!host) return;
    var list = blends();
    if(!list.length){
      list = [{ id:uid(), name:'Pool deck', cols:[], sqft:0 }];
      saveBlends(list);
    }
    host.innerHTML = list.map(function(b,i){
      return '<div class="arow">'
        + '<input class="an" data-an="'+i+'" value="'+(b.name||'').replace(/"/g,'&quot;')+'" placeholder="Area name">'
        + '<input class="aq" data-aq="'+i+'" type="number" inputmode="decimal" min="0" value="'+(b.sqft||'')+'" placeholder="sq ft">'
        + (list.length>1 ? '<span class="rm" data-arm="'+i+'">&times;</span>' : '<span class="rm" style="opacity:.25">&times;</span>')
        + '</div>';
    }).join('');
    host.querySelectorAll('input[data-an]').forEach(function(el){
      el.addEventListener('input', function(){ var L=blends(); L[+el.getAttribute('data-an')].name=el.value; saveBlends(L); });
    });
    host.querySelectorAll('input[data-aq]').forEach(function(el){
      el.addEventListener('input', function(){
        var L=blends(); L[+el.getAttribute('data-aq')].sqft=Math.max(0,parseFloat(el.value)||0);
        saveBlends(L); refreshTotals();
      });
    });
    host.querySelectorAll('[data-arm]').forEach(function(el){
      el.addEventListener('click', function(){
        var L=blends(); if(L.length<2) return;
        L.splice(+el.getAttribute('data-arm'),1); saveBlends(L); renderAreas(); refreshTotals();
      });
    });
    refreshTotals();
  }

  function totalSq(){ return blends().reduce(function(a,b){ return a + (b.sqft||0); }, 0); }

  function refreshTotals(){
    var sq = totalSq();
    var t = document.getElementById('qTotal');
    if(t) t.textContent = sq > 0 ? sq.toLocaleString() + ' sq ft' : '—';
    var q = quote();
    var price = q.qFlat > 0 ? q.qFlat : (q.qRate > 0 ? q.qRate * sq : 0);
    var p = document.getElementById('qPrice');
    if(p) p.textContent = price > 0 ? money(price) : '—';
  }

  /* ---- the optional additions, straight off the real quote sheet -------- */
  var OPTIONS = [
    ['luminous',  'Luminous addition — standard silver glitter'],
    ['inlay',     'One complimentary design inlay from existing molds'],
    ['faux',      'Faux coping, if you prefer'],
    ['shading',   'Shading, if you prefer'],
    ['lighting',  'LED lighting'],
    ['mosaic',    'Mosaic tiles — catalog available to review'],
    ['riser',     'Riser measurement / step faces']
  ];
  function renderOptions(){
    var host = document.getElementById('qOpts'); if(!host) return;
    var q = quote(); var on = q.opts || {};
    host.innerHTML = OPTIONS.map(function(o){
      return '<div class="chk '+(on[o[0]]?'on':'off')+'" data-opt="'+o[0]+'">'
        + '<span class="bx">'+CHECK+'</span><span class="nm">'+o[1]+'</span></div>';
    }).join('');
    host.querySelectorAll('[data-opt]').forEach(function(row){
      row.addEventListener('click', function(){
        var qq = quote(); qq.opts = qq.opts || {};
        var k = row.getAttribute('data-opt');
        qq.opts[k] = !qq.opts[k]; saveQuote(qq); renderOptions();
      });
    });
  }

  /* ---- plain fields ----------------------------------------------------- */
  var FIELDS = ['qName','qAddr','qPhone','qEmail','qType','qPerim','qDrain','qGrind',
                'qCopePrep','qConc','qLevel','qRubber','qThick','qBlend','qNotes','qRate','qFlat'];
  function bindFields(){
    var q = quote();
    FIELDS.forEach(function(id){
      var el = document.getElementById(id); if(!el) return;
      if(q[id] !== undefined && q[id] !== '') el.value = q[id];
      var handler = function(){
        var qq = quote();
        qq[id] = (id === 'qRate' || id === 'qFlat') ? (parseFloat(el.value) || 0) : el.value;
        saveQuote(qq); refreshTotals();
      };
      el.addEventListener('input', handler);
      el.addEventListener('change', handler);
    });
  }

  /* ---- send ------------------------------------------------------------- */
  function sendQuote(){
    var q = quote(), p = {};
    try { p = JSON.parse(localStorage.getItem('floco_auth_v1')) || {}; } catch(e){}
    var to = (q.qEmail || '').trim();
    if(!/.+@.+\..+/.test(to)){ alert("Add the customer's email first."); return; }
    var sq = totalSq();
    var price = q.qFlat > 0 ? q.qFlat : (q.qRate > 0 ? q.qRate * sq : 0);
    var co = (p.company || 'our company').trim();

    var L = [];
    L.push('Hi ' + ((q.qName||'').split(' ')[0] || 'there') + ',');
    L.push('');
    L.push('Thank you for having us out. Here is your quote for rubber surfacing at '
           + (q.qAddr || 'your property') + '.');
    L.push('');
    if(sq > 0) L.push('Total area: ' + sq.toLocaleString() + ' sq ft');
    blends().filter(function(b){ return b.sqft>0; }).forEach(function(b){
      L.push('   ' + (b.name||'Area') + ': ' + b.sqft.toLocaleString() + ' sq ft');
    });
    if(q.qPerim) L.push('Pool perimeter: ' + q.qPerim + ' linear feet');
    L.push('');
    if(price > 0){ L.push('YOUR PRICE: ' + money(price)); L.push(''); }
    L.push('This includes existing surface prep, installation of the rubber surface, and full site');
    L.push('clean up on completion. No surprise fees and no add-ons later.');
    L.push('');
    var on = q.opts || {}, picked = OPTIONS.filter(function(o){ return on[o[0]]; });
    if(picked.length){
      L.push("WHAT'S INCLUDED IN YOUR DESIGN");
      picked.forEach(function(o){ L.push('   ' + o[1]); });
      L.push('');
    }
    L.push('The full quote with every detail is attached, and our terms are here:');
    L.push(location.origin + location.pathname.replace(/[^/]*$/, '') + 'terms.html');
    L.push('');
    L.push('Any questions at all, just reply or give me a call.');
    L.push('');
    L.push((p.repName || '').trim() || '[YOUR NAME]');
    L.push(co);
    L.push('FLOCO Certified Installer');

    location.href = 'mailto:' + encodeURIComponent(to)
      + '?subject=' + encodeURIComponent('Your rubber surfacing quote' + (q.qName ? ' — ' + q.qName : ''))
      + '&body=' + encodeURIComponent(L.join('\r\n'));
  }


  /* ---- their company: name, contact and LOGO --------------------------
   * The universal FLOCOFAM login leaves the profile blank, so without this
   * every installer's quote would go out reading "Your Company". Set once,
   * used by the quote, the print view and the terms page.
   *
   * The logo is stored as a data URL, downscaled to 420px on its longest side
   * first — localStorage is small and a phone photo of a sign would blow it. */
  var LOGOKEY = 'floco_logo';
  function profile(){ try { return JSON.parse(localStorage.getItem('floco_auth_v1')) || {}; } catch(e){ return {}; } }
  function saveProfile(v){ localStorage.setItem('floco_auth_v1', JSON.stringify(v)); }
  function logo(){ return localStorage.getItem(LOGOKEY) || ''; }

  function paintLogo(){
    var box = document.getElementById('qLogoBox'), img = document.getElementById('qLogoImg');
    if(!box || !img) return;
    var d = logo();
    if(d){ img.src = d; box.classList.add('has'); } else { img.removeAttribute('src'); box.classList.remove('has'); }
  }

  function shrink(file, cb){
    var r = new FileReader();
    r.onload = function(){
      var im = new Image();
      im.onload = function(){
        var max = 420, w = im.width, h = im.height;
        if(w > max || h > max){ var k = max / Math.max(w,h); w = Math.round(w*k); h = Math.round(h*k); }
        var c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(im, 0, 0, w, h);
        /* PNG keeps a transparent background, which most logos need. */
        cb(c.toDataURL('image/png'));
      };
      im.onerror = function(){ alert("That image could not be read. Try a PNG or JPG."); };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  }

  var PFIELDS = { pCompany:'company', pRepName:'repName', pPhone:'phone', pEmail:'email', pLocation:'location' };
  function bindProfile(){
    var pr = profile();
    Object.keys(PFIELDS).forEach(function(id){
      var el = document.getElementById(id); if(!el) return;
      var key = PFIELDS[id];
      if(pr[key]) el.value = pr[key];
      el.addEventListener('input', function(){ var v = profile(); v[key] = el.value; saveProfile(v); });
    });
    var f = document.getElementById('qLogoFile');
    if(f) f.addEventListener('change', function(){
      var file = f.files && f.files[0]; if(!file) return;
      shrink(file, function(dataUrl){
        try { localStorage.setItem(LOGOKEY, dataUrl); }
        catch(e){ alert('That logo is too large to store. Try a smaller image.'); return; }
        paintLogo();
      });
      f.value = '';
    });
    var c = document.getElementById('qLogoClear');
    if(c) c.addEventListener('click', function(){ localStorage.removeItem(LOGOKEY); paintLogo(); });
    paintLogo();
  }

  function boot(){
    bindProfile(); renderAreas(); renderOptions(); bindFields(); refreshTotals();
    var s = document.getElementById('qSend'); if(s) s.addEventListener('click', sendQuote);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
