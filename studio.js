/* FLOCO Certified — Design Studio (vibes → gallery → inlays → board → send) */
(function () {
  var G = 'assets/photos/gallery/', I = 'assets/photos/inlays/';

  var VIBES = [
    { key: 'warm-tans',      name: 'Warm Tans',     desc: 'Warm, earthy, sandy',   hero: 'warm-tans-02-lakefront-pool.jpg' },
    { key: 'cool-greys',     name: 'Cool Greys',    desc: 'Clean & modern',        hero: 'cool-greys-03-curved-pool.jpg' },
    { key: 'beach-vibes',    name: 'Beach Vibes',   desc: 'Coastal & breezy',      hero: 'beach-vibes-04-poolside-landscape.jpg' },
    { key: 'bold-color',     name: 'Bold Color',    desc: 'Statement & fun',       hero: 'bold-color-05-butterfly-blue.jpg' },
    { key: 'bright-airy',    name: 'Bright & Airy', desc: 'Light & fresh',         hero: 'bright-airy-01-white-sand-pool.jpg' },
    { key: 'deep-moody',     name: 'Deep & Moody',  desc: 'Rich & dramatic',       hero: 'deep-moody-04-navy-edge.jpg' },
    { key: 'earthy-organic', name: 'Earthy Organic',desc: 'Natural & grounded',    hero: 'earthy-organic-02-terracotta-lanai.jpg' },
    { key: 'layered-blend',  name: 'Layered Blend', desc: 'Multi-tone & zoned',    hero: 'layered-blend-02-teal-tile-modern.jpg' }
  ];

  var GALLERY = [
    'warm-tans-01-lakeview-lanai','warm-tans-02-lakefront-pool','warm-tans-03-meadow-lanai','warm-tans-04-canal-lanai','warm-tans-05-mermaid-patio','warm-tans-06-lake-pool','warm-tans-07-rose-sun-lounge','warm-tans-08-pool-life',
    'cool-greys-01-screened-pool','cool-greys-02-modern-lanai','cool-greys-03-curved-pool','cool-greys-04-tile-edge-spa','cool-greys-05-compass-deck','cool-greys-06-spa-stairs','cool-greys-07-screened-rectangle','cool-greys-08-butterfly-grey','cool-greys-09-poolside-grey','cool-greys-10-compass-sunset',
    'beach-vibes-01-canal-dolphin','beach-vibes-02-waterfront-flag','beach-vibes-03-gazebo-lake','beach-vibes-04-poolside-landscape','beach-vibes-05-lake-screened',
    'bold-color-01-charcoal-stars','bold-color-02-koi-inlay','bold-color-03-flamingo-grey','bold-color-04-anchor-canal','bold-color-05-butterfly-blue','bold-color-06-red-turtle','bold-color-07-anchor-slate','bold-color-08-blue-tile-spa',
    'bright-airy-01-white-sand-pool','bright-airy-02-blue-white-deck','bright-airy-03-lake-lanai','bright-airy-04-mermaid-white','bright-airy-05-clean-grey-patio',
    'deep-moody-01-charcoal-stars','deep-moody-02-sunburst-charcoal','deep-moody-03-turtle-charcoal','deep-moody-04-navy-edge','deep-moody-05-charcoal-detail',
    'earthy-organic-01-jungle-screened','earthy-organic-02-terracotta-lanai','earthy-organic-03-earthy-close','earthy-organic-04-warm-earthy','earthy-organic-05-warm-sun-inlay',
    'layered-blend-01-sunflower-zone','layered-blend-02-teal-tile-modern','layered-blend-03-navy-teal-dual','layered-blend-04-multi-tone-detail','layered-blend-05-mermaid-layered'
  ];

  var INLAYS = [
    'sun','sea-turtle','compass','anchor','mermaid','dolphin','palm-tree','flamingo',
    'pineapple','manatee','butterfly','crab','seahorse','heron','pelican','seal',
    'american-flag','bear-paws','custom-logo','custom-phrase'
  ];
  function title(slug){ return slug.split('-').map(function(w){ return w.charAt(0).toUpperCase()+w.slice(1); }).join(' '); }
  function vibeName(key){ for (var i=0;i<VIBES.length;i++) if (VIBES[i].key===key) return VIBES[i].name; return key; }
  function vibeOf(file){ for (var i=0;i<VIBES.length;i++) if (file.indexOf(VIBES[i].key+'-')===0) return VIBES[i].key; return ''; }

  // ---- board state (localStorage) ----
  var BKEY = 'floco_board';
  function board(){ try { return JSON.parse(localStorage.getItem(BKEY)) || []; } catch(e){ return []; } }
  function saveBoard(b){ localStorage.setItem(BKEY, JSON.stringify(b)); }
  function inBoard(id){ return board().some(function(x){ return x.id===id; }); }
  function toggle(item){
    var b = board(), i = -1;
    for (var k=0;k<b.length;k++) if (b[k].id===item.id) i=k;
    var added;
    if (i>=0){ b.splice(i,1); added=false; } else { b.push(item); added=true; }
    saveBoard(b); return added;
  }

  var state = { vibe: null, showAll: false };

  function toast(msg){
    var t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(function(){ t.classList.remove('show'); }, 1900);
  }

  // ---- renderers ----
  function renderVibes(){
    var el = document.getElementById('vibes'); if (!el) return;
    el.innerHTML = VIBES.map(function(v){
      var sel = state.vibe===v.key ? ' sel' : '';
      return '<div class="vibe'+sel+'" data-vibe="'+v.key+'">'
        + '<img src="'+G+v.hero+'" loading="lazy">'
        + '<div class="ov"></div><div class="nm">'+v.name+'</div><div class="ds" style="bottom:-2px">'+v.desc+'</div></div>';
    }).join('');
    el.querySelectorAll('.vibe').forEach(function(c){
      c.addEventListener('click', function(){
        var k = c.getAttribute('data-vibe');
        state.vibe = (state.vibe===k) ? null : k;
        state.showAll = false;
        // save vibe direction to the board
        if (state.vibe){ toggleVibeSave(k, true); }
        renderVibes(); renderGallery();
      });
    });
  }
  function toggleVibeSave(key, on){
    var v = VIBES.filter(function(x){ return x.key===key; })[0];
    var item = { type:'vibe', id:'vibe:'+key, title:v.name, img:G+v.hero };
    if (on && !inBoard(item.id)){ toggle(item); toast('Saved “'+v.name+'” to the board'); renderBoard(); }
  }

  function galleryList(){
    if (state.vibe) return GALLERY.filter(function(f){ return vibeOf(f)===state.vibe; });
    if (state.showAll) return GALLERY;
    // default curated mix (2 per vibe-ish, 10)
    return ['warm-tans-02-lakefront-pool','cool-greys-03-curved-pool','bright-airy-01-white-sand-pool','bold-color-05-butterfly-blue','beach-vibes-04-poolside-landscape','deep-moody-04-navy-edge','layered-blend-02-teal-tile-modern','earthy-organic-02-terracotta-lanai','warm-tans-08-pool-life','cool-greys-05-compass-deck'];
  }
  function renderGallery(){
    var el = document.getElementById('gallery'); if (!el) return;
    el.innerHTML = galleryList().map(function(f){
      var id = 'photo:'+f, saved = inBoard(id) ? ' saved' : '';
      var hasBlend = blendForPhoto(f) ? '<div class="useblend" data-blend="'+f+'">Use this blend</div>' : '';
      return '<div class="ph'+saved+'" data-id="'+id+'" data-file="'+f+'">'
        + '<img src="'+G+f+'.jpg" loading="lazy">'
        + hasBlend
        + '<div class="heart"><svg viewBox="0 0 24 24"><path d="M12 21s-7-4.35-9.5-8.5C1 9.5 2.5 6 6 6c2 0 3.2 1.2 6 4 2.8-2.8 4-4 6-4 3.5 0 5 3.5 3.5 6.5C19 16.65 12 21 12 21z"/></svg></div></div>';
    }).join('');
    el.querySelectorAll('.useblend').forEach(function(b){
      b.addEventListener('click', function(ev){
        ev.stopPropagation();
        var f = b.getAttribute('data-blend');
        toast(applyPhotoBlend(f) ? 'Blend loaded into your builder 🎨' : 'No recipe saved for that one yet');
      });
    });
    el.querySelectorAll('.ph').forEach(function(p){
      p.addEventListener('click', function(){
        var f = p.getAttribute('data-file');
        var item = { type:'photo', id:'photo:'+f, title:vibeName(vibeOf(f)), img:G+f+'.jpg' };
        var added = toggle(item); p.classList.toggle('saved', added);
        toast(added ? 'Added to the board' : 'Removed from the board'); renderBoard();
      });
    });
  }

  function renderInlays(){
    var el = document.getElementById('inlays'); if (!el) return;
    el.innerHTML = INLAYS.map(function(s){
      var id = 'inlay:'+s, sel = inBoard(id) ? ' sel' : '';
      return '<div class="inlay'+sel+'" data-id="'+id+'" data-slug="'+s+'">'
        + '<img src="'+I+s+'.jpg" loading="lazy"><div class="g"></div><div class="nm">'+title(s)+'</div></div>';
    }).join('');
    el.querySelectorAll('.inlay').forEach(function(c){
      c.addEventListener('click', function(){
        var s = c.getAttribute('data-slug');
        var item = { type:'inlay', id:'inlay:'+s, title:title(s)+' inlay', img:I+s+'.jpg' };
        var added = toggle(item); c.classList.toggle('sel', added);
        toast(added ? title(s)+' inlay added' : 'Removed'); renderBoard();
      });
    });
  }

  function renderBoard(){
    var b = board();
    var meta = document.getElementById('boardMeta');
    var strip = document.getElementById('boardStrip');
    if (!meta || !strip) return;
    var vibes = b.filter(function(x){return x.type==='vibe';}).length;
    meta.innerHTML = '<b>'+b.length+'</b> saves';
    if (!b.length){
      strip.innerHTML = '<div class="empty">Nothing saved yet — tap the hearts below to build the board.</div>';
    } else {
      strip.innerHTML = b.slice().reverse().map(function(x){
        return '<div class="th" style="background-image:url('+"'"+x.img+"'"+')"></div>';
      }).join('');
    }
  }

  // ---- custom blend ----
  // ⚠️ PLACEHOLDER palette — swap for Lexi's real color list (the American Recycling colors) when it arrives.
  // Genuine Rosehill TPV color range (via American Recycling) — code, name, sampled hex
  var COLORS = [
    {code:'RH31',n:'Cream',c:'#CCC6B4'},{code:'RH30',n:'Beige',c:'#F0B68F'},{code:'RH41',n:'Bright Yellow',c:'#E6D039'},{code:'RH40',n:'Mustard',c:'#E79B3A'},
    {code:'RH50',n:'Orange',c:'#EB6A3C'},{code:'RH01',n:'Standard Red',c:'#D65F54'},{code:'RH02',n:'Bright Red',c:'#E33F50'},{code:'RH90',n:'Funky Pink',c:'#E55891'},
    {code:'RH21',n:'Purple',c:'#4B539C'},{code:'RH20',n:'Standard Blue',c:'#1888C3'},{code:'RH22',n:'Light Blue',c:'#18A6D7'},{code:'RH23',n:'Azure',c:'#17ABCA'},
    {code:'RH26',n:'Turquoise',c:'#36B4BB'},{code:'RH12',n:'Dark Green',c:'#34A385'},{code:'RH10',n:'Standard Green',c:'#78B279'},{code:'RH11',n:'Bright Green',c:'#32A961'},
    {code:'RH32',n:'Brown',c:'#AF7462'},{code:'RH70',n:'Black',c:'#3D4242'},{code:'RH60',n:'Dark Grey',c:'#62686A'},{code:'RH61',n:'Light Grey',c:'#777E82'},
    {code:'RH65',n:'Pale Grey',c:'#C0C5C0'}
  ];
  // Real granule photos, cropped from Rosehill's official TPV Color Range
  // sheet. A flat hex is a lie about a product made of irregular coloured
  // granules, so the swatch is the actual material. The hex stays underneath
  // as the load/fallback colour.
  function chip(code){ return 'assets/photos/colors/' + code + '.jpg'; }
  function swatchHtml(col, px){
    return '<span class="chip" style="width:'+px+'px;height:'+px+'px;background:'+col.c+'">'
      + '<img src="'+chip(col.code)+'" alt="" loading="lazy">'
      + '</span>';
  }


  // ---- photo -> blend recipes ----
  // When a customer points at a pool and says "I want that exact blend," the
  // rep taps the photo and the recipe loads straight into the blend builder.
  //
  // AWAITING DATA (Katie, emailed 2026-09-03). A photo with an empty array is
  // simply not offered: a guessed blend would put the wrong material on a real
  // pool. Fill in real RH codes totalling 100 and the photo turns on by itself.
  // Mirror of floco-studio/src/lib/photoBlends.ts — keep the two in sync.
  var PHOTO_BLENDS = {
    'warm-tans-02-lakefront-pool':        [],
    'warm-tans-08-pool-life':             [],
    'cool-greys-03-curved-pool':          [],
    'cool-greys-04-tile-edge-spa':        [],
    'bright-airy-01-white-sand-pool':     [],
    'bright-airy-05-clean-grey-patio':    [],
    'beach-vibes-04-poolside-landscape':  [],
    'earthy-organic-02-terracotta-lanai': [],
    'earthy-organic-04-warm-earthy':      [],
    'deep-moody-04-navy-edge':            [],
    'layered-blend-03-navy-teal-dual':    [],
    'layered-blend-02-teal-tile-modern':  []
  };
  function blendForPhoto(file){
    var b = PHOTO_BLENDS[file];
    return (b && b.length) ? b : null;
  }
  // Load a photo's recipe into the blend builder, replacing what is there.
  function applyPhotoBlend(file){
    var recipe = blendForPhoto(file); if (!recipe) return false;
    var out = [];
    for (var i=0;i<recipe.length;i++){
      var col = null;
      for (var j=0;j<COLORS.length;j++) if (COLORS[j].code===recipe[i].code) col=COLORS[j];
      if (col) out.push({ code:col.code, n:col.n, c:col.c, pct:recipe[i].pct });
    }
    if (!out.length) return false;
    saveBlend(out); renderBlend();
    return true;
  }

  var BLKEY = 'floco_blend';
  function blend(){ try{ var b=JSON.parse(localStorage.getItem(BLKEY)); return (b&&b.length)?b:[{code:'RH31',n:'Cream',c:'#CCC6B4'},{code:'RH32',n:'Brown',c:'#AF7462'},{code:'RH61',n:'Light Grey',c:'#777E82'}]; }catch(e){ return [{code:'RH31',n:'Cream',c:'#CCC6B4'}]; } }
  function saveBlend(b){ localStorage.setItem(BLKEY, JSON.stringify(b)); }
  // Even split across n colours, remainder onto the first.
  function pcts(n){ var base=Math.floor(100/n), out=[]; for(var i=0;i<n;i++) out.push(i===0?100-base*(n-1):base); return out; }
  // Percentages for a blend. A recipe loaded from a photo carries its own
  // ratios (40/40/20), and those must survive: an even split would quietly
  // turn a real blend into a different colour. Hand-built blends have no pct
  // stored, so they keep falling back to the even split.
  function blendPcts(b){
    var hasAll = b.length > 0 && b.every(function(c){ return typeof c.pct === 'number' && c.pct > 0; });
    return hasAll ? b.map(function(c){ return c.pct; }) : pcts(b.length);
  }
  function renderBlend(){
    var el=document.getElementById('blend'); if(!el) return;
    var b=blend(), p=blendPcts(b);
    var html=b.map(function(col,i){
      return '<div class="bcol" data-i="'+i+'"><div class="x">&times;</div>'+swatchHtml(col,38)+'<div class="nm">'+col.n+(col.code?' <span style="opacity:.55;font-weight:800">'+col.code+'</span>':'')+'</div><div class="pct">'+p[i]+'%</div></div>';
    }).join('');
    if(b.length<4) html+='<div class="badd" id="badd"><div class="plus">+</div><div class="t">Add</div></div>';
    el.innerHTML=html;
    el.querySelectorAll('.bcol').forEach(function(c){ c.addEventListener('click', function(){ var i=+c.getAttribute('data-i'); var bb=blend(); if(bb.length>1){ bb.splice(i,1); bb.forEach(function(x){ delete x.pct; }); saveBlend(bb); renderBlend(); } else { toast('Keep at least one color'); } }); });
    var add=document.getElementById('badd'); if(add) add.addEventListener('click', openPalette);
    renderMaterials();
  }
  function openPalette(){ renderPalette(); document.getElementById('palette').classList.add('open'); document.getElementById('scrim').classList.add('open'); }
  function closePalette(){ var s=document.getElementById('palette'); if(s)s.classList.remove('open'); var sc=document.getElementById('scrim'); if(sc)sc.classList.remove('open'); }
  function renderPalette(){
    var el=document.getElementById('paletteGrid'); if(!el) return;
    var names=blend().map(function(x){return x.n;});
    el.innerHTML=COLORS.map(function(col){
      var dim=names.indexOf(col.n)>=0?' dim':'';
      return '<div class="pcol'+dim+'" data-code="'+(col.code||'')+'" data-n="'+col.n+'" data-c="'+col.c+'">'+swatchHtml(col,44)+'<div class="nm"><span style="display:block;font-size:8.5px;font-weight:800;opacity:.6;letter-spacing:.03em">'+(col.code||'')+'</span>'+col.n+'</div></div>';
    }).join('');
    el.querySelectorAll('.pcol').forEach(function(pc){ pc.addEventListener('click', function(){ var bb=blend(); if(bb.length>=4){ toast('A blend holds up to 4 colors — remove one first'); return; } bb.push({code:pc.getAttribute('data-code'),n:pc.getAttribute('data-n'),c:pc.getAttribute('data-c')}); saveBlend(bb); renderBlend(); renderPalette(); toast(pc.getAttribute('data-n')+' added'); }); });
  }

  // ---- materials calculator ----
  // Same method as the manual and floco-studio's specSheet.ts. Verified
  // against a real 742 sq ft job: 40/40/20 gives 15 / 15 / 8 bags + 6 buckets.
  // Cover the area FIRST, then split by percentage. Never work out each
  // colour's square footage and round each up, that over-orders every colour.
  var SQFT_PER_BAG = 20, SQFT_PER_BUCKET = 125;
  var SQKEY = 'floco_sqft';
  function sqft(){ var v = parseFloat(localStorage.getItem(SQKEY)); return isFinite(v) && v > 0 ? v : 0; }
  function coverageBags(a){ return a > 0 ? Math.ceil(a / SQFT_PER_BAG) : 0; }

  function bagsFor(area, cols, pct){
    if (area <= 0 || !cols.length) return [];
    var total = coverageBags(area), rows = [], i;
    for (i = 0; i < cols.length; i++){
      var raw = total * pct[i] / 100, fl = Math.floor(raw);
      rows.push({ code: cols[i].code, n: cols[i].n, c: cols[i].c, bags: fl, rem: raw - fl });
    }
    // hand out the spare bags largest-remainder first
    var used = 0; for (i = 0; i < rows.length; i++) used += rows[i].bags;
    var spare = total - used;
    var order = rows.slice().sort(function(a,b){ return b.rem - a.rem; });
    var k = 0;
    while (spare > 0 && order.length){ order[k % order.length].bags += 1; spare--; k++; }
    // every colour in the blend needs at least one bag or it is not in the blend
    for (i = 0; i < rows.length; i++){
      if (rows[i].bags < 1){
        rows[i].bags = 1;
        var big = rows[0];
        for (var j = 1; j < rows.length; j++) if (rows[j].bags > big.bags) big = rows[j];
        if (big !== rows[i] && big.bags > 1) big.bags -= 1;
      }
    }
    return rows;
  }

  function renderMaterials(){
    var out = document.getElementById('matout'); if (!out) return;
    var area = sqft(), b = blend(), p = blendPcts(b);
    if (area <= 0){
      out.innerHTML = '<div class="matempty">Enter the square footage and the bag count works itself out from the blend above.</div>';
      return;
    }
    var rows = bagsFor(area, b, p);
    var total = 0; for (var i = 0; i < rows.length; i++) total += rows[i].bags;
    var buckets = Math.ceil(area / SQFT_PER_BUCKET);
    var needed = coverageBags(area);
    var html = rows.map(function(r){
      return '<div class="matline">' + swatchHtml({n:r.n,c:r.c,code:r.code}, 30)
        + '<div class="code">' + r.code + '</div><div class="nm">' + r.n + '</div>'
        + '<div class="bags">' + r.bags + '<i>bags</i></div></div>';
    }).join('');
    html += '<div class="matline"><span class="chip" style="width:30px;height:30px;background:#F4F1EA"></span>'
      + '<div class="code">PM80</div><div class="nm">Pre-mark 80 primer</div>'
      + '<div class="bags">' + buckets + '<i>buckets</i></div></div>';
    html += '<div class="mattot">' + total + ' bags &middot; ' + buckets + ' buckets &middot; ' + area + ' sq ft</div>';
    html += '<div class="matwork">Worked out as <b>' + area + ' &divide; ' + SQFT_PER_BAG + ' sq ft per bag = ' + needed
      + ' bags</b>, split across the blend by percentage, with the spare bag going to the biggest leftover. '
      + 'Primer is ' + area + ' &divide; ' + SQFT_PER_BUCKET + ' sq ft per bucket.</div>';
    if (total > needed){
      html += '<div class="matwarn">This area only needs ' + needed + ' bag' + (needed === 1 ? '' : 's')
        + ' to cover, but a ' + b.length + '-colour blend needs ' + total
        + ' because every colour takes at least one bag. Consider fewer colours on a small area.</div>';
    }
    out.innerHTML = html;
  }

  // ---- coping & edges ----
  var C = 'assets/photos/coping/';
  var CUTS = [
    { slug:'bullnose',   name:'Bullnose',   img:'bullnose.jpg' },
    { slug:'cantilever', name:'Cantilever', img:'cantilever-1.jpg' },
    { slug:'tile-edge',  name:'Tile Edge',  img:'tile-edge.jpg' }
  ];
  var CSTYLES = ['style-01','style-02','style-03','style-04','style-05','style-06','style-07','style-08'];
  function renderCoping(){
    var cutsEl = document.getElementById('cuts');
    if (cutsEl){
      cutsEl.innerHTML = CUTS.map(function(k){
        var id='cut:'+k.slug, sel=inBoard(id)?' sel':'';
        return '<div class="cut'+sel+'" data-slug="'+k.slug+'"><img src="'+C+k.img+'" loading="lazy"><div class="nm">'+k.name+'</div></div>';
      }).join('');
      cutsEl.querySelectorAll('.cut').forEach(function(c){ c.addEventListener('click', function(){
        var k = CUTS.filter(function(x){return x.slug===c.getAttribute('data-slug');})[0];
        var added = toggle({type:'cut', id:'cut:'+k.slug, title:k.name+' edge', img:C+k.img});
        c.classList.toggle('sel', added); toast(added? k.name+' edge saved':'Removed'); renderBoard();
      }); });
    }
    var stEl = document.getElementById('copingStyles');
    if (stEl){
      stEl.innerHTML = CSTYLES.map(function(s){
        var id='coping:'+s, sel=inBoard(id)?' sel':'';
        return '<div class="cstyle'+sel+'" data-s="'+s+'"><img src="'+C+s+'.jpg" loading="lazy"></div>';
      }).join('');
      stEl.querySelectorAll('.cstyle').forEach(function(c){ c.addEventListener('click', function(){
        var s=c.getAttribute('data-s');
        var added = toggle({type:'coping', id:'coping:'+s, title:'Coping style', img:C+s+'.jpg'});
        c.classList.toggle('sel', added); toast(added?'Coping style saved':'Removed'); renderBoard();
      }); });
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    // installer email — remember what they type (universal login has no per-user email)
    var p = (window.FLOCOauth && FLOCOauth.profile && FLOCOauth.profile()) || null;
    var ie = document.getElementById('installerEmail');
    if (ie) {
      ie.value = localStorage.getItem('floco_installer_email') || (p && p.email) || '';
      ie.addEventListener('input', function(){ localStorage.setItem('floco_installer_email', ie.value); });
    }

    var sq = document.getElementById('sqft');
    if (sq){
      var saved = sqft(); if (saved) sq.value = saved;
      sq.addEventListener('input', function(){
        localStorage.setItem(SQKEY, sq.value);
        renderMaterials();
      });
    }

    renderBlend(); renderVibes(); renderGallery(); renderInlays(); renderCoping(); renderBoard();
    var pc = document.getElementById('paletteClose'); if (pc) pc.addEventListener('click', closePalette);
    var scr = document.getElementById('scrim'); if (scr) scr.addEventListener('click', closePalette);

    var more = document.getElementById('galMore');
    if (more) more.addEventListener('click', function(){
      state.vibe = null; state.showAll = !state.showAll;
      more.textContent = state.showAll ? 'Show less' : 'Show all';
      renderGallery();
    });

    var send = document.getElementById('sendBtn');
    if (send) send.addEventListener('click', function(){
      var cust = ((document.getElementById('custEmail')||{}).value || '').trim();
      var inst = ((document.getElementById('installerEmail')||{}).value || '').trim();
      var b = board();
      if (!b.length){ toast('Save a few designs first 🎨'); return; }
      if (!/.+@.+\..+/.test(cust)){ toast('Add your customer’s email to send'); return; }

      // build the board summary
      var lines = [];
      var bl = blend(), bp = blendPcts(bl);
      lines.push('— CUSTOM BLEND —');
      lines.push(bl.map(function(c,i){ return bp[i] + '% ' + (c.code?c.code+' ':'') + c.n; }).join('  ·  '));
      var area = sqft();
      if (area > 0){
        var mrows = bagsFor(area, bl, bp), mtot = 0;
        for (var mi = 0; mi < mrows.length; mi++) mtot += mrows[mi].bags;
        lines.push('— MATERIALS (' + area + ' SQ FT) —');
        lines = lines.concat(mrows.map(function(r){ return r.code + '  ' + r.n + '  ' + r.bags + ' bags'; }));
        lines.push('Pre-mark 80  ' + Math.ceil(area / SQFT_PER_BUCKET) + ' buckets');
        lines.push('Total ' + mtot + ' bags');
        lines.push('');
      }
      lines.push('');
      function group(type){ return b.filter(function(x){ return x.type===type; }).map(function(x){ return '• ' + x.title; }); }
      var vibes = group('vibe'), photos = group('gallery'), inlays = group('inlay'), coping = b.filter(function(x){ return x.type==='coping'||x.type==='cut'; }).map(function(x){ return '• ' + x.title; });
      if (vibes.length){ lines.push('— THE VIBE —'); lines = lines.concat(vibes, ['']); }
      if (photos.length){ lines.push('— SAVED LOOKS ('+photos.length+') —'); lines = lines.concat(photos, ['']); }
      if (inlays.length){ lines.push('— INLAYS —'); lines = lines.concat(inlays, ['']); }
      if (coping.length){ lines.push('— COPING & EDGES —'); lines = lines.concat(coping, ['']); }
      lines.push('Built in the FLOCO Certified Design Studio.');
      lines.push('Questions? Just reply here or call (239) 426-8045.');

      var subject = 'Your FLOCO Design Board 🎨';
      var body = 'Hi! Here’s the design board we put together for your FLOCO rubber surfacing project.\n\n' + lines.join('\n');
      var url = 'mailto:' + encodeURIComponent(cust)
        + '?cc=' + encodeURIComponent(inst)
        + '&bcc=' + encodeURIComponent('studio@flocodeckingsystems.com')
        + '&subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      toast('Opening your email to send ✓');
      send.querySelector('span').textContent = 'Sent ✓';
      setTimeout(function(){ send.querySelector('span').textContent = 'Send to Both'; }, 2600);
      window.location.href = url;
    });
  });
})();
