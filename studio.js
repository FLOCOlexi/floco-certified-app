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
      return '<div class="ph'+saved+'" data-id="'+id+'" data-file="'+f+'">'
        + '<img src="'+G+f+'.jpg" loading="lazy">'
        + '<div class="heart"><svg viewBox="0 0 24 24"><path d="M12 21s-7-4.35-9.5-8.5C1 9.5 2.5 6 6 6c2 0 3.2 1.2 6 4 2.8-2.8 4-4 6-4 3.5 0 5 3.5 3.5 6.5C19 16.65 12 21 12 21z"/></svg></div></div>';
    }).join('');
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


  /* ================= BASE BLENDS =================================
   * Katie's eight, mixed and photographed for real. A starting point, never a
   * rule — "Build from scratch" is always one tap away. Mirror of
   * floco-studio/src/lib/baseBlends.ts; keep the two in sync.
   * Photos are deep crops into the granules so the sample bag disappears.
   * ============================================================== */
  var BASES = [
    {id:'base-01', label:'Base 01', ch:'Pale grey & cream', fp:'02', cp:'01',
      f:[{code:'RH65',pct:45},{code:'RH31',pct:40},{code:'RH61',pct:10},{code:'RH60',pct:5}],
      c:[{code:'RH60',pct:60},{code:'RH31',pct:15},{code:'RH65',pct:15},{code:'RH70',pct:10}]},
    /* Floor and companion were SWAPPED on 2026-09-04. Katie's two bags for this
     * pair carried no floor/coping label so it was inferred "darker = coping";
     * the real installed photo shows the opposite — the deck is the near-black
     * mix, the lighter grey is the band round the pool. */
    {id:'base-02', label:'Base 02', nm:'The Bachelor', ch:'Greys & black', fp:'03', cp:'04', inst:'base-02',
      f:[{code:'RH70',pct:70},{code:'RH60',pct:15},{code:'RH61',pct:15}],
      c:[{code:'RH61',pct:40},{code:'RH60',pct:40},{code:'RH65',pct:20}]},
    {id:'base-03', label:'Base 03', ch:'Cream & brown', fp:'05', cp:'06',
      f:[{code:'RH31',pct:70},{code:'RH32',pct:15},{code:'RH30',pct:15}],
      c:[{code:'RH32',pct:80},{code:'RH30',pct:10},{code:'RH31',pct:10}]},
    {id:'base-04', label:'Base 04', ch:'Cream & dark grey', fp:'08', cp:'07',
      f:[{code:'RH31',pct:45},{code:'RH65',pct:40},{code:'RH60',pct:15}],
      c:[{code:'RH60',pct:70},{code:'RH65',pct:20},{code:'RH31',pct:10}]},
    /* The installed shot argues for "companion" over "coping blend": the same
     * darker mix runs the band round the pool AND the mermaid inlay. */
    {id:'base-05', label:'Base 05', nm:'Sanibel', ch:'Cream, turquoise & green', fp:'10', cp:'09', inst:'base-05',
      f:[{code:'RH31',pct:50},{code:'RH65',pct:30},{code:'RH26',pct:10},{code:'RH12',pct:10}],
      c:[{code:'RH12',pct:50},{code:'RH26',pct:30},{code:'RH70',pct:20}]},
    {id:'base-06', label:'Base 06', ch:'Warm greige & earth', fp:'12', cp:'11',
      /* RH32 — Katie's label read RH35, which does not exist; she confirmed the
       * correction herself on 2026-09-04. */
      f:[{code:'RH30',pct:30},{code:'RH32',pct:25},{code:'RH60',pct:20},{code:'RH65',pct:15},{code:'RH31',pct:10}],
      c:[{code:'RH60',pct:30},{code:'RH70',pct:30},{code:'RH32',pct:30},{code:'RH30',pct:10}]},
    {id:'base-07', label:'Base 07', ch:'Light sand & beige', fp:'13', cp:'14',
      f:[{code:'RH31',pct:50},{code:'RH30',pct:30},{code:'RH65',pct:10},{code:'RH61',pct:10}],
      c:[{code:'RH30',pct:45},{code:'RH31',pct:25},{code:'RH61',pct:20},{code:'RH65',pct:10}]},
    {id:'base-08', label:'Base 08', ch:'Cream & coastal blue', fp:'15', cp:'16',
      f:[{code:'RH31',pct:80},{code:'RH30',pct:10},{code:'RH65',pct:5},{code:'RH20',pct:5}],
      c:[{code:'RH31',pct:65},{code:'RH20',pct:20},{code:'RH30',pct:10},{code:'RH65',pct:5}]}
  ];
  function blendPhoto(f){ return 'assets/photos/blends/' + f + '.jpg'; }
  /* A real finished job in this blend, or null. Only bases we can actually
   * verify get one — never a lookalike borrowed from the gallery. */
  function installedPhoto(b){ return b.inst ? 'assets/photos/blends/installed/' + b.inst + '.jpg' : null; }
  function colByCode(code){ for(var i=0;i<COLORS.length;i++) if(COLORS[i].code===code) return COLORS[i]; return null; }
  /* Turn a base recipe into blend colours, carrying the real percentages. */
  function hydrate(parts){
    var out=[]; for(var i=0;i<parts.length;i++){ var c=colByCode(parts[i].code);
      if(c) out.push({code:c.code,n:c.n,c:c.c,pct:parts[i].pct}); } return out;
  }
  function recipeText(parts){
    return parts.map(function(p){ var c=colByCode(p.code); return p.pct+'% '+(c?c.n:p.code); }).join(' · ');
  }

  /* ================= NAMED BLENDS ================================
   * A job is rarely one blend. The floor gets one, the coping usually gets a
   * companion, and a front porch might get a third. Each carries its own name
   * so the crew knows what goes where, and its own square footage so the bag
   * count is per blend rather than one lump.
   * Migrates the old single-blend key on first run.
   * ============================================================== */
  var BLKEY = 'floco_blends', OLDKEY = 'floco_blend', OLDSQ = 'floco_sqft';
  function uid(){ return 'b' + Math.random().toString(36).slice(2,8); }
  function blends(){
    try{ var v=JSON.parse(localStorage.getItem(BLKEY)); if(v && v.length) return v; }catch(e){}
    try{
      var old=JSON.parse(localStorage.getItem(OLDKEY));
      if(old && old.length){
        var sq=parseFloat(localStorage.getItem(OLDSQ)||'0')||0;
        var m=[{id:uid(), name:'Floor blend', cols:old, sqft:sq}];
        localStorage.setItem(BLKEY, JSON.stringify(m)); return m;
      }
    }catch(e){}
    return [];
  }
  function saveBlends(v){ localStorage.setItem(BLKEY, JSON.stringify(v)); }
  function pcts(n){ var base=Math.floor(100/n), out=[]; for(var i=0;i<n;i++) out.push(i===0?100-base*(n-1):base); return out; }
  /* Percentages a blend actually carries. A base recipe brings real ratios
   * (70/15/15) and those must survive — an even split would quietly turn it
   * into a different colour. Hand-built colours with no pct fall back. */
  function blendPcts(cols){
    var all = cols.length>0 && cols.every(function(c){ return typeof c.pct==='number' && c.pct>0; });
    if(all) return cols.map(function(c){ return c.pct; });
    return pcts(cols.length);
  }
  function totalPct(cols){ return blendPcts(cols).reduce(function(a,b){return a+b;},0); }

  /* ---- the rough blend preview -------------------------------------
   * Flat chips scattered by ratio. It reads closer to epoxy flake than to
   * real rubber, and that is fine and labelled: its job is to answer "roughly
   * what colour is this mixture", not to show texture. The disclaimer under it
   * says so out loud so nobody sells off it. */
  function previewInto(cv, cols){
    if(!cv || !cv.getContext) return;
    var S=cv.width=cv.height=104, x=cv.getContext('2d');
    var p=blendPcts(cols), bag=[];
    for(var i=0;i<cols.length;i++){ var n=Math.max(1,Math.round(p[i]*10)); for(var k=0;k<n;k++) bag.push(cols[i].c); }
    if(!bag.length){ x.clearRect(0,0,S,S); return; }
    /* seeded so a blend always renders the same and never shimmers */
    var seed=0; for(var q=0;q<cols.length;q++) seed+=(cols[q].code||'').charCodeAt(2)*(p[q]+3);
    var st=(seed>>>0)||7; function R(){ st^=st<<13; st^=st>>>17; st^=st<<5; return ((st>>>0)%100000)/100000; }
    x.fillStyle=bag[0]; x.fillRect(0,0,S,S);
    for(var j=0;j<1500;j++){
      var cx=R()*S, cy=R()*S, r=S*0.026+R()*S*0.022, rot=R()*6.2832, v=5+Math.floor(R()*3);
      x.fillStyle=bag[Math.floor(R()*bag.length)];
      x.beginPath();
      for(var t=0;t<v;t++){ var a=rot+t/v*6.2832, rr=r*(0.72+R()*0.5);
        t? x.lineTo(cx+Math.cos(a)*rr, cy+Math.sin(a)*rr) : x.moveTo(cx+Math.cos(a)*rr, cy+Math.sin(a)*rr); }
      x.closePath(); x.fill();
    }
  }


  /* ================= JOB DETAILS =================================
   * The fields from FLOCO's real design sheet that a blend can't carry:
   * coping measurements and cut, step risers, glitter, the inlay
   * description, and notes for the crew.
   *
   * Folded away behind one header on purpose. Lexi: "without making it too
   * many steps and too busy." An installer who doesn't need it never opens
   * it; the header summarises what's filled in so nothing hides silently.
   * ============================================================== */
  var JDKEY = 'floco_job_details';
  var JD_FIELDS = ['jdCopeLf','jdCopeW','jdCut','jdSchluter','jdFaux','jdEdge',
                   'jdStepW','jdStepH','jdStepN','jdGlitter','jdMosaic','jdInlay','jdNotes'];
  function jobDetails(){ try { return JSON.parse(localStorage.getItem(JDKEY)) || {}; } catch(e){ return {}; } }
  function saveJobDetails(v){ localStorage.setItem(JDKEY, JSON.stringify(v)); }

  function jdSummaryText(){
    var d = jobDetails(), bits = [];
    if (d.jdCopeLf && d.jdCopeW) bits.push('coping ' + d.jdCopeLf + 'ft × ' + d.jdCopeW + 'in');
    else if (d.jdCut) bits.push('coping cut ' + d.jdCut);
    if (d.jdStepW && d.jdStepH) bits.push((d.jdStepN || 1) + ' step' + ((d.jdStepN||1) == 1 ? '' : 's'));
    if (d.jdGlitter) bits.push('glitter');
    if (d.jdMosaic) bits.push('mosaic');
    if (d.jdInlay) bits.push('inlay');
    if (d.jdNotes) bits.push('notes');
    return bits.length ? bits.join(' · ') : 'Coping, steps, glitter, inlay & notes';
  }

  function initJobDetails(){
    var card = document.getElementById('jobDetails'); if (!card) return;
    var d = jobDetails();
    JD_FIELDS.forEach(function(id){
      var el = document.getElementById(id); if (!el) return;
      if (d[id] !== undefined) el.value = d[id];
      el.addEventListener('input', function(){
        var v = jobDetails(); v[id] = el.value; saveJobDetails(v);
        document.getElementById('jdSummary').textContent = jdSummaryText();
      });
      el.addEventListener('change', function(){
        var v = jobDetails(); v[id] = el.value; saveJobDetails(v);
        document.getElementById('jdSummary').textContent = jdSummaryText();
      });
    });
    document.getElementById('jdSummary').textContent = jdSummaryText();
    document.getElementById('jdToggle').addEventListener('click', function(){
      card.classList.toggle('open');
    });
  }

  function renderBases(){
    var el=document.getElementById('bases'); if(!el) return;
    el.innerHTML = BASES.map(function(b){
      var hero = installedPhoto(b);
      return '<div class="basecard'+(hero?' hashero':'')+'">'
        + (hero ? '<img class="basehero" data-base="'+b.id+'" data-side="f" src="'+hero+'" alt="A finished FLOCO job in '+(b.nm||b.label)+'" loading="lazy">' : '')
        + '<div class="basebody">'
        + '<div class="basetop">'
        +   '<img class="basecirc" data-base="'+b.id+'" data-side="f" src="'+blendPhoto(b.fp)+'" alt="'+b.ch+'" loading="lazy">'
        +   '<img class="basecomp" data-base="'+b.id+'" data-side="c" src="'+blendPhoto(b.cp)+'" alt="companion" loading="lazy">'
        + '</div>'
        + '<div class="no">'+b.label+'</div>'
        + '<div class="ch">'+(b.nm||b.ch)+'</div>'
        + (b.nm ? '<div class="sub">'+b.ch+'</div>' : '')
        + '<div class="rc">'+recipeText(b.f)+'</div>'
        + '<div class="cmp">Optional companion &nbsp;'+recipeText(b.c)+'</div>'
      + '</div></div>';
    }).join('');
    el.querySelectorAll('img[data-base]').forEach(function(img){
      img.addEventListener('click', function(){
        var b=null, id=img.getAttribute('data-base');
        for(var i=0;i<BASES.length;i++) if(BASES[i].id===id) b=BASES[i];
        if(!b) return;
        var side=img.getAttribute('data-side');
        var list=blends();
        var nm = side==='c' ? 'Companion blend' : (list.length ? 'Blend '+(list.length+1) : 'Floor blend');
        list.push({ id:uid(), name:nm, cols:hydrate(side==='c'?b.c:b.f), sqft:0, base:b.id });
        saveBlends(list); renderBlends();
        toast(b.label+' added as "'+nm+'"');
        var t=document.getElementById('blends'); if(t) t.scrollIntoView({behavior:'smooth',block:'start'});
      });
    });
  }

  function renderBlends(){
    var el=document.getElementById('blends'); if(!el) return;
    var list=blends();
    if(!list.length){
      el.innerHTML='<div class="bempty">No blends yet. Tap a base above to drop one in, or add one and build it from scratch.</div>';
      renderMaterials(); return;
    }
    el.innerHTML = list.map(function(bl, bi){
      var p=blendPcts(bl.cols), tot=p.reduce(function(a,b){return a+b;},0);
      var rows = bl.cols.map(function(col,i){
        return '<div class="pctline">'
          + swatchHtml(col,28)
          + '<div class="nm">'+col.n+'<i>'+(col.code||'')+'</i></div>'
          + '<div class="step" data-b="'+bi+'" data-i="'+i+'" data-d="-1">&minus;</div>'
          + '<div class="pnum">'+p[i]+'%</div>'
          + '<div class="step" data-b="'+bi+'" data-i="'+i+'" data-d="1">+</div>'
          + '<div class="prm" data-rm="'+bi+'" data-i="'+i+'">&times;</div>'
        + '</div>';
      }).join('');
      var empty = bl.cols.length === 0;
      return '<div class="blendcard">'
        + '<div class="bnrow">'
        +   '<canvas class="bprev" data-prev="'+bi+'"></canvas>'
        +   '<input class="bname" data-nm="'+bi+'" value="'+(bl.name||'').replace(/"/g,'&quot;')+'" placeholder="Name this blend">'
        +   '<div class="bdel" data-del="'+bi+'">&times;</div>'
        + '</div>'
        + (empty ? '<div class="bempty2">Empty — add colours to start this blend.</div>' : rows)
        + (empty ? '' : '<div class="btot"><span class="l">Total</span><span><span class="v '+(tot===100?'ok':'off')+'">'+tot+'%</span>'
        +   (tot!==100 ? '<span class="bfix" data-bal="'+bi+'">balance to 100</span>' : '')
        + '</span></div>')
        + (empty ? '' : '<div class="bclear" data-clr="'+bi+'">Clear all colours</div>')
        + (bl.cols.length<6 ? '<div class="baddc" data-add="'+bi+'">+ Add a color</div>' : '')
        + '<div class="bsq"><span class="cap">Square feet</span><input type="number" inputmode="numeric" min="0" placeholder="0" data-sq="'+bi+'" value="'+(bl.sqft||'')+'"></div>'
      + '</div>';
    }).join('');

    list.forEach(function(bl,bi){ previewInto(el.querySelector('canvas[data-prev="'+bi+'"]'), bl.cols); });

    el.querySelectorAll('.step').forEach(function(btn){
      btn.addEventListener('click', function(){
        var L=blends(), bi=+btn.getAttribute('data-b'), i=+btn.getAttribute('data-i'), d=+btn.getAttribute('data-d');
        var p=blendPcts(L[bi].cols);
        for(var k=0;k<L[bi].cols.length;k++) L[bi].cols[k].pct=p[k];
        L[bi].cols[i].pct=Math.max(0,Math.min(100,L[bi].cols[i].pct + d*5));
        saveBlends(L); renderBlends();
      });
    });
    el.querySelectorAll('.bfix').forEach(function(b){
      b.addEventListener('click', function(){
        var L=blends(), bi=+b.getAttribute('data-bal'), p=blendPcts(L[bi].cols);
        var tot=p.reduce(function(a,x){return a+x;},0), diff=100-tot;
        /* Put the difference on the biggest colour — it distorts the look least. */
        var big=0; for(var k=1;k<p.length;k++) if(p[k]>p[big]) big=k;
        for(var k2=0;k2<L[bi].cols.length;k2++) L[bi].cols[k2].pct=p[k2];
        L[bi].cols[big].pct=Math.max(0,p[big]+diff);
        saveBlends(L); renderBlends();
      });
    });
    el.querySelectorAll('.prm').forEach(function(b){
      b.addEventListener('click', function(){
        var L=blends(), bi=+b.getAttribute('data-rm'), i=+b.getAttribute('data-i');
        /* A blend is allowed to go completely empty — clearing it out and
         * starting again is a normal thing to want, and nobody is going to
         * leave it that way. No undo though, and this sits beside the +
         * stepper, so ask first. */
        if(!confirm('Remove '+L[bi].cols[i].n+' from "'+(L[bi].name||'this blend')+'"?')) return;
        var p=blendPcts(L[bi].cols);
        for(var k=0;k<L[bi].cols.length;k++) L[bi].cols[k].pct=p[k];
        L[bi].cols.splice(i,1); saveBlends(L); renderBlends();
      });
    });
    el.querySelectorAll('.bclear').forEach(function(b){
      b.addEventListener('click', function(){
        var L=blends(), bi=+b.getAttribute('data-clr');
        if(!confirm('Clear every colour out of "'+(L[bi].name||'this blend')+'" and start again?')) return;
        L[bi].cols=[]; saveBlends(L); renderBlends();
      });
    });
    el.querySelectorAll('.bdel').forEach(function(b){
      b.addEventListener('click', function(){
        var L=blends(), bi=+b.getAttribute('data-del');
        L.splice(bi,1); saveBlends(L); renderBlends();
      });
    });
    el.querySelectorAll('.baddc').forEach(function(b){
      b.addEventListener('click', function(){ openPalette(+b.getAttribute('data-add')); });
    });
    el.querySelectorAll('.bname').forEach(function(inp){
      inp.addEventListener('input', function(){
        var L=blends(); L[+inp.getAttribute('data-nm')].name=inp.value; saveBlends(L);
      });
    });
    el.querySelectorAll('input[data-sq]').forEach(function(inp){
      inp.addEventListener('input', function(){
        var L=blends(); L[+inp.getAttribute('data-sq')].sqft=Math.max(0,parseFloat(inp.value)||0);
        saveBlends(L); renderMaterials();
      });
    });
    renderMaterials();
  }

  var paletteTarget = 0;
  function openPalette(bi){ paletteTarget = bi||0; renderPalette(); document.getElementById('palette').classList.add('open'); document.getElementById('scrim').classList.add('open'); }
  function closePalette(){ var s=document.getElementById('palette'); if(s)s.classList.remove('open'); var sc=document.getElementById('scrim'); if(sc)sc.classList.remove('open'); }
  function renderPalette(){
    var el=document.getElementById('paletteGrid'); if(!el) return;
    var L=blends(), cur=L[paletteTarget];
    var names=(cur?cur.cols:[]).map(function(x){return x.n;});
    el.innerHTML=COLORS.map(function(col){
      var dim=names.indexOf(col.n)>=0?' dim':'';
      return '<div class="pcol'+dim+'" data-code="'+(col.code||'')+'" data-n="'+col.n+'" data-c="'+col.c+'">'+swatchHtml(col,44)+'<div class="nm"><span style="display:block;font-size:8.5px;font-weight:800;opacity:.6;letter-spacing:.03em">'+(col.code||'')+'</span>'+col.n+'</div></div>';
    }).join('');
    el.querySelectorAll('.pcol').forEach(function(pc){ pc.addEventListener('click', function(){
      var L=blends(), bl=L[paletteTarget]; if(!bl) return;
      if(bl.cols.length>=6){ toast('A blend holds up to 6 colors — remove one first'); return; }
      /* Freeze the current ratios before adding, so an even-split blend does
       * not silently re-divide when a new colour joins it. */
      var p=blendPcts(bl.cols); for(var k=0;k<bl.cols.length;k++) bl.cols[k].pct=p[k];
      bl.cols.push({code:pc.getAttribute('data-code'),n:pc.getAttribute('data-n'),c:pc.getAttribute('data-c'),pct:5});
      saveBlends(L); renderBlends(); renderPalette(); toast(pc.getAttribute('data-n')+' added');
    }); });
  }

  // ---- materials calculator ----
  // Same method as the manual and floco-studio's specSheet.ts. Verified
  // against a real 742 sq ft job: 40/40/20 gives 15 / 15 / 8 bags + 6 buckets.
  // Cover the area FIRST, then split by percentage. Never work out each
  // colour's square footage and round each up, that over-orders every colour.
  var SQFT_PER_BAG = 20, SQFT_PER_BUCKET = 125;
  /* Glitter: 1 oz per mixing bucket, and a bag of granule makes two buckets,
   * so 2 oz per bag. Checks against Lexi's own example — 40 bags → 80 oz. */
  var GLITTER_OZ_PER_BAG = 2;
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


  /* ================= HAND-ADJUSTED BAG COUNTS ===================
   * FLOCO's own sheets get nudged. On Bill's 589 sq ft job the split came out
   * 14/5/5/1 and the sheet went out as 13/5/5/2 — a bag moved to the blue,
   * because one bag of a 5% accent is thin on a real floor.
   *
   * So the math proposes and the rep decides. An override is remembered per
   * colour, shown as edited, and can be dropped back to the calculated number.
   * ============================================================== */
  var OVKEY = 'floco_bag_override';
  function bagOverrides(){ try { return JSON.parse(localStorage.getItem(OVKEY)) || {}; } catch(e){ return {}; } }
  function setBagOverride(code, n){
    var o = bagOverrides();
    if (n === null) delete o[code]; else o[code] = n;
    localStorage.setItem(OVKEY, JSON.stringify(o));
  }
  function clearBagOverrides(){ localStorage.removeItem(OVKEY); }

  function renderMaterials(){
    var out = document.getElementById('matout'); if (!out) return;
    var list = blends();
    var priced = list.filter(function(bl){ return bl.sqft > 0 && bl.cols.length; });
    if (!priced.length){
      out.innerHTML = '<div class="matempty">Add the square feet to each blend above and the bag count works itself out.</div>';
      return;
    }

    /* Each blend is costed on its own square footage, then rolled up by colour
     * — one order for the whole job, but the split stays honest per blend. */
    var byCode = {}, order = [], grand = 0, totalSq = 0, warn = [];
    priced.forEach(function(bl){
      var p = blendPcts(bl.cols), tot = p.reduce(function(x,y){return x+y;},0);
      if (tot !== 100) warn.push('"' + (bl.name||'Unnamed blend') + '" adds up to ' + tot + '%, not 100%.');
      var rows = bagsFor(bl.sqft, bl.cols, p), sum = 0;
      rows.forEach(function(r){
        if (!byCode[r.code]){ byCode[r.code] = {code:r.code, n:r.n, c:r.c, bags:0}; order.push(r.code); }
        byCode[r.code].bags += r.bags; sum += r.bags;
      });
      grand += sum; totalSq += bl.sqft;
      var need = coverageBags(bl.sqft);
      if (sum > need) warn.push('"' + (bl.name||'Unnamed blend') + '" only needs ' + need + ' bag' + (need===1?'':'s')
        + ' to cover, but takes ' + sum + ' because every colour needs at least one. Consider fewer colours here.');
    });
    var buckets = Math.ceil(totalSq / SQFT_PER_BUCKET);

    /* Two clearly separated parts. The first pass stacked every blend heading
     * and then printed one merged colour list underneath, so the combined bag
     * counts read as if they belonged to the last blend named. They don't. */
    var html = '<div class="matgrp">Each blend on its own</div>';
    html += priced.map(function(bl){
      return '<div class="matblend">'
        + '<span class="bn">' + (bl.name || 'Unnamed blend') + '</span>'
        + '<span class="bs">' + bl.sqft + ' sq ft</span>'
        + '<span class="bb">' + coverageBags(bl.sqft) + '<i>bags</i></span>'
        + '</div>';
    }).join('');

    var ov = bagOverrides(), edited = false;
    var shownTotal = order.reduce(function(a,c){
      return a + (Object.prototype.hasOwnProperty.call(ov, c) ? ov[c] : byCode[c].bags);
    }, 0);
    html += '<div class="matgrp top">What to order &middot; all blends combined<span class="hint">tap a number to change it</span></div>';
    html += order.map(function(code){
      var r = byCode[code];
      var has = Object.prototype.hasOwnProperty.call(ov, code);
      var shown = has ? ov[code] : r.bags;
      if (has && ov[code] !== r.bags) edited = true;
      return '<div class="matline' + (has && ov[code] !== r.bags ? ' ed' : '') + '">'
        + swatchHtml({n:r.n,c:r.c,code:r.code}, 30)
        + '<div class="code">' + r.code + '</div><div class="nm">' + r.n
        + (has && ov[code] !== r.bags ? '<i class="was">math said ' + r.bags + '</i>' : '') + '</div>'
        + '<div class="bags tap" data-bagcode="' + code + '" data-calc="' + r.bags + '">' + shown + '<i>bags</i></div></div>';
    }).join('');
    html += '<div class="matline"><span class="chip" style="width:30px;height:30px;background:#F4F1EA"></span>'
      + '<div class="code">PM80</div><div class="nm">Pre-Mark 80 binder</div>'
      + '<div class="bags">' + buckets + '<i>pails</i></div></div>';
    /* Glitter only appears when the job is actually getting it. */
    var jdG = (jobDetails().jdGlitter || '');
    if (jdG){
      var oz = shownTotal * GLITTER_OZ_PER_BAG;
      html += '<div class="matline"><span class="chip" style="width:30px;height:30px;background:#DCD6C6"></span>'
        + '<div class="code">GLIT</div><div class="nm">Glitter<i class="was">' + jdG + ' &middot; 2 oz per bag</i></div>'
        + '<div class="bags">' + oz + '<i>oz</i></div></div>';
    }
    html += '<div class="mattot">' + shownTotal + ' bags &middot; ' + buckets + ' pails &middot; ' + totalSq + ' sq ft</div>';
    if (edited) html += '<div class="matedit">Bag counts edited by hand. <span id="matReset">Put them back to the calculated numbers</span></div>';
    html += '<div class="matwork">Each blend is worked out on its own footage &mdash; <b>sq ft &divide; '
      + SQFT_PER_BAG + ' per bag</b>, split by percentage with the spare bag going to the biggest leftover &mdash; '
      + 'then the colours are added together into the order above. Binder is total sq ft &divide; ' + SQFT_PER_BUCKET + ' per 5-gallon pail.</div>';
    warn.forEach(function(w){ html += '<div class="matwarn">' + w + '</div>'; });
    out.innerHTML = html;

    out.querySelectorAll('.bags.tap').forEach(function(el){
      el.addEventListener('click', function(){
        var code = el.getAttribute('data-bagcode');
        var calc = +el.getAttribute('data-calc');
        var cur  = Object.prototype.hasOwnProperty.call(bagOverrides(), code) ? bagOverrides()[code] : calc;
        var v = prompt('How many bags of ' + code + '?\n\nThe math works it out as ' + calc + '.', cur);
        if (v === null) return;
        v = parseInt(v, 10);
        if (!isFinite(v) || v < 0) { toast('Enter a whole number'); return; }
        setBagOverride(code, v === calc ? null : v);
        renderMaterials();
      });
    });
    var rs = document.getElementById('matReset');
    if (rs) rs.addEventListener('click', function(){ clearBagOverrides(); renderMaterials(); });
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


    renderBases(); renderBlends(); initJobDetails();
    var ab=document.getElementById('addBlend');
    if(ab) ab.addEventListener('click', function(){
      var L=blends();
      L.push({ id:uid(), name: L.length? 'Blend '+(L.length+1) : 'Floor blend',
               cols:[{code:'RH31',n:'Cream',c:'#CCC6B4',pct:100}], sqft:0 });
      saveBlends(L); renderBlends();
    }); renderVibes(); renderGallery(); renderInlays(); renderCoping(); renderBoard();
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
      /* Every named blend, each with its own footage and bag split, then one
       * rolled-up order — the same shape the materials panel shows. */
      var list = blends().filter(function(x){ return x.cols.length; });
      var roll = {}, order = [], grand = 0, totalSq = 0;
      list.forEach(function(bln){
        var bp = blendPcts(bln.cols);
        lines.push('— ' + (bln.name || 'BLEND').toUpperCase() + ' —');
        lines.push(bln.cols.map(function(c,i){ return bp[i] + '% ' + (c.code?c.code+' ':'') + c.n; }).join('  ·  '));
        if (bln.sqft > 0){
          lines.push(bln.sqft + ' sq ft');
          var rr = bagsFor(bln.sqft, bln.cols, bp);
          rr.forEach(function(r){
            if (!roll[r.code]){ roll[r.code] = {code:r.code,n:r.n,bags:0}; order.push(r.code); }
            roll[r.code].bags += r.bags; grand += r.bags;
          });
          totalSq += bln.sqft;
        }
        lines.push('');
      });
      if (totalSq > 0){
        lines.push('— MATERIALS FOR THE JOB (' + totalSq + ' SQ FT) —');
        lines = lines.concat(order.map(function(c){ return roll[c].code + '  ' + roll[c].n + '  ' + roll[c].bags + ' bags'; }));
        lines.push('Pre-mark 80  ' + Math.ceil(totalSq / SQFT_PER_BUCKET) + ' buckets');
        lines.push('Total ' + grand + ' bags');
        lines.push('');
      }
      var jd = jobDetails();
      var jdl = [];
      if (jd.jdCopeLf || jd.jdCopeW || jd.jdCut || jd.jdSchluter || jd.jdFaux || jd.jdEdge){
        jdl.push('— COPING & EDGES —');
        if (jd.jdCopeLf || jd.jdCopeW) jdl.push('Measurements: ' + (jd.jdCopeLf||'?') + ' linear ft × ' + (jd.jdCopeW||'?') + ' in wide');
        if (jd.jdCut) jdl.push('Coping cut #' + jd.jdCut);
        if (jd.jdFaux) jdl.push('Faux coping: ' + jd.jdFaux + (jd.jdEdge ? ', ' + jd.jdEdge + ' in from the edge' : ''));
        else if (jd.jdEdge) jdl.push('Distance from edge: ' + jd.jdEdge + ' in');
        if (jd.jdSchluter) jdl.push('Schluter bracket: ' + jd.jdSchluter);
        jdl.push('');
      }
      if (jd.jdStepW || jd.jdStepH){
        jdl.push('— STEP FACES & RISERS —');
        jdl.push((jd.jdStepN ? jd.jdStepN + ' × ' : '') + (jd.jdStepW||'?') + ' in wide × ' + (jd.jdStepH||'?') + ' in high');
        jdl.push('');
      }
      if (jd.jdGlitter || jd.jdMosaic || jd.jdInlay){
        jdl.push('— ADDITIONS —');
        if (jd.jdGlitter) jdl.push('Glitter: ' + jd.jdGlitter);
        if (jd.jdMosaic) jdl.push('Mosaic tiles: ' + jd.jdMosaic);
        if (jd.jdInlay) jdl.push('Inlay: ' + jd.jdInlay);
        jdl.push('');
      }
      if (jd.jdNotes){ jdl.push('— NOTES —'); jdl.push(jd.jdNotes); jdl.push(''); }
      lines = lines.concat(jdl);
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
