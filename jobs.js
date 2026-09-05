/* My Jobs — the log of every surface this company has laid.
 *
 * WHY IT EXISTS
 * Three problems, one page:
 *   1. Nobody remembers which blend went on which pool six months later.
 *      A photo saved against the blend answers that forever, and it is how
 *      each company builds a portfolio of THEIR work rather than ours.
 *   2. Every installed job is a reseal in a year or two. Without a list,
 *      that revenue is simply forgotten.
 *   3. The quote and the design already exist in this app. Saving them
 *      together at the end means one job carries through from first
 *      measurement to finished photo.
 *
 * WHERE THE DATA COMES FROM
 * Saving a job snapshots what is currently open — the quote and the areas
 * from the Design Studio — into an independent record. It is a SNAPSHOT on
 * purpose: starting the next customer must never rewrite the last one.
 *
 * STORAGE
 * localStorage, like the rest of the app, which is roughly 5 MB. Photos are
 * the only thing here big enough to matter, so they are downscaled hard
 * before saving and a quota failure is reported honestly instead of
 * silently losing someone's photo.
 */
(function () {
  var KEY = 'floco_jobs';
  var MAX_SHOT = 1000;        // px on the long edge — plenty for a phone screen
  var SHOT_Q   = 0.72;        // JPEG quality; below this the granule texture muddies
  var RESEAL_MONTHS = 18;     // when to surface a job for a UV coat conversation

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };
  function jparse(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function jobs() { return jparse(KEY) || []; }

  /* Every write goes through here. localStorage throws when it is full, and
     the only useful thing to do is tell them which photo did not fit. */
  function save(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      alert('Your phone ran out of storage for this app, so that last change was not saved.\n\n'
          + 'Photos take the most room. Delete a few photos from older jobs and try again.');
      return false;
    }
  }

  function colByCode(code) {
    var C = window.FLOCO_COLORS || [];
    for (var i = 0; i < C.length; i++) if (C[i].code === code) return C[i];
    return null;
  }

  /* ---------------------------------------------------------------- */
  /* Saving the job that is currently open                             */
  /* ---------------------------------------------------------------- */
  function currentJob() {
    var q = jparse('floco_quote') || {};
    var areas = (jparse('floco_blends') || []).map(function (b) {
      return { name: b.name || 'Area', sqft: b.sqft || 0, cols: (b.cols || []).slice() };
    });
    var sqft = areas.reduce(function (a, b) { return a + (b.sqft || 0); }, 0);
    var price = (q.qFlat > 0) ? q.qFlat : ((q.qRate > 0) ? q.qRate * sqft : 0);
    return {
      name:  (q.qName || '').trim(),
      addr:  (q.qAddr || '').trim(),
      type:  q.qType || '',
      areas: areas, sqft: sqft, price: price
    };
  }

  function saveCurrent() {
    var c = currentJob();
    if (!c.name && !c.sqft) {
      alert('There is nothing open to save yet.\n\n'
          + 'Start a quote or a design first, then come back and save it here as a job.');
      return;
    }
    var name = prompt('Save this job under which customer name?', c.name || '');
    if (name === null) return;                       // they backed out
    name = name.trim();
    if (!name) { alert('A job needs a customer name so you can find it later.'); return; }

    var list = jobs();
    list.unshift({
      id: 'j' + Math.random().toString(36).slice(2, 9),
      name: name, addr: c.addr, type: c.type,
      areas: c.areas, sqft: c.sqft, price: c.price,
      status: 'quoted',
      date: '',                                      // filled in when marked installed
      shots: [],
      created: new Date().toISOString().slice(0, 10)
    });
    if (save(list)) { render(); }
  }

  /* ---------------------------------------------------------------- */
  /* Photos                                                            */
  /* ---------------------------------------------------------------- */
  var pendingId = null;

  /* Phone photos are 3-4 MB each. Straight into localStorage they would fill
     it after two jobs, so every photo is redrawn small before it is stored. */
  function shrink(file, cb) {
    var r = new FileReader();
    r.onload = function () {
      var img = new Image();
      img.onload = function () {
        var w = img.width, h = img.height, s = Math.min(1, MAX_SHOT / Math.max(w, h));
        var cv = document.createElement('canvas');
        cv.width = Math.round(w * s); cv.height = Math.round(h * s);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        cb(cv.toDataURL('image/jpeg', SHOT_Q));
      };
      img.onerror = function () { cb(null); };
      img.src = r.result;
    };
    r.onerror = function () { cb(null); };
    r.readAsDataURL(file);
  }

  function addShots(files) {
    var list = jobs(), job = null;
    for (var i = 0; i < list.length; i++) if (list[i].id === pendingId) job = list[i];
    if (!job) return;
    var left = files.length;
    for (var k = 0; k < files.length; k++) {
      shrink(files[k], function (data) {
        if (data) { job.shots = job.shots || []; job.shots.push(data); }
        if (--left === 0) { save(list); render(); }
      });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Rendering                                                         */
  /* ---------------------------------------------------------------- */
  var LABEL = { quoted: 'Quoted', scheduled: 'Scheduled', installed: 'Installed' };
  var NEXT  = { quoted: 'scheduled', scheduled: 'installed', installed: 'quoted' };

  function niceDate(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T00:00:00');
    return isNaN(d) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function monthsSince(iso) {
    if (!iso) return 0;
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return 0;
    return (new Date() - d) / (1000 * 60 * 60 * 24 * 30.44);
  }

  function blendChips(areas) {
    var seen = {}, out = [];
    (areas || []).forEach(function (a) {
      (a.cols || []).forEach(function (c) {
        if (seen[c.code]) return;
        seen[c.code] = 1;
        var col = colByCode(c.code);
        out.push('<i style="display:inline-block;width:11px;height:11px;border-radius:50%;'
               + 'vertical-align:-1px;margin-right:4px;background:' + (col ? col.c : '#888') + '"></i>');
      });
    });
    return out.join('');
  }

  function card(j) {
    var hero = (j.shots && j.shots.length)
      ? '<img class="hero" src="' + j.shots[0] + '" alt="">' : '';

    var meta = [];
    if (j.sqft)  meta.push('<div><b>' + j.sqft.toLocaleString() + '</b> sq ft</div>');
    if (j.price) meta.push('<div><b>$' + Math.round(j.price).toLocaleString() + '</b></div>');
    if (j.date)  meta.push('<div>Installed <b>' + esc(niceDate(j.date)) + '</b></div>');
    var chips = blendChips(j.areas);
    if (chips) meta.push('<div>' + chips + '</div>');

    var strip = '';
    if (j.shots && j.shots.length > 1) {
      strip = '<div class="shots">' + j.shots.slice(1).map(function (s, i) {
        return '<img src="' + s + '" data-shot="' + j.id + ':' + (i + 1) + '" alt="">';
      }).join('') + '</div>';
    }

    return '<div class="job">' + hero + '<div class="b">'
      + '<div class="r1"><div class="nm">' + esc(j.name) + '</div>'
      + '<div class="st ' + j.status + '" data-cycle="' + j.id + '">' + LABEL[j.status] + '</div></div>'
      + (j.addr ? '<div class="ad">' + esc(j.addr) + '</div>' : '')
      + (meta.length ? '<div class="meta">' + meta.join('') + '</div>' : '')
      + strip
      + '<div class="acts">'
      +   '<div class="a" data-shot-add="' + j.id + '">Add photo</div>'
      +   '<div class="a" data-note="' + j.id + '">Blend note</div>'
      +   '<div class="a rm" data-del="' + j.id + '" aria-label="Delete job">'
      +     '<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></div>'
      + '</div>'
      + (j.note ? '<div class="ad" style="margin-top:9px">' + esc(j.note) + '</div>' : '')
      + '</div></div>';
  }

  function render() {
    var list = jobs();

    $('sJobs').textContent  = list.length;
    /* Only installed jobs count as surface laid — a quote is not a floor. */
    $('sSq').textContent    = list.filter(function (j) { return j.status === 'installed'; })
                                  .reduce(function (a, j) { return a + (j.sqft || 0); }, 0).toLocaleString();
    $('sShots').textContent = list.reduce(function (a, j) { return a + ((j.shots || []).length); }, 0);

    var c = currentJob();
    $('saveHint').textContent = (c.name || c.sqft)
      ? 'Right now that is ' + (c.name || 'an unnamed customer')
        + (c.sqft ? ' · ' + c.sqft.toLocaleString() + ' sq ft' : '') + '.'
      : 'Nothing open yet. Start a quote or a design first.';

    /* Who is due a UV coat. This is the quiet money in the app. */
    var due = list.filter(function (j) {
      return j.status === 'installed' && monthsSince(j.date) >= RESEAL_MONTHS;
    });
    $('dueBox').innerHTML = due.length
      ? '<div class="due"><div class="t">' + due.length + ' job'
        + (due.length === 1 ? '' : 's') + ' due a UV coat</div>'
        + '<div class="s">' + due.map(function (j) { return esc(j.name); }).join(', ')
        + ' — installed over ' + RESEAL_MONTHS + ' months ago. A resealed surface keeps its colour, '
        + 'and this is the easiest call you will make all week.</div></div>'
      : '';

    $('jobList').innerHTML = list.length
      ? list.map(card).join('')
      : '<div class="empty"><div class="k">nothing logged yet</div>'
        + '<div class="p">Finish a quote or a design, then tap <b>Save the job you’re working on</b> '
        + 'above. Add a photo when it is installed and you will never have to guess which blend '
        + 'went where.</div></div>';

    var used = Math.round((JSON.stringify(list).length / 1048576) * 10) / 10;
    $('storeNote').textContent = list.length
      ? 'Saved on this device only, using about ' + used + ' MB. Photos are shrunk to save room. '
        + 'They are not backed up anywhere, so keep your originals in your phone’s camera roll too.'
      : '';
  }

  /* ---------------------------------------------------------------- */
  /* Wiring                                                            */
  /* ---------------------------------------------------------------- */
  function byId(id) { var l = jobs(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-cycle],[data-del],[data-shot-add],[data-note],[data-shot]') : null;
    if (!t) return;

    var id;
    if ((id = t.getAttribute('data-cycle'))) {
      var list = jobs();
      for (var i = 0; i < list.length; i++) if (list[i].id === id) {
        list[i].status = NEXT[list[i].status] || 'quoted';
        /* Stamp the install date the moment it is marked installed — that
           date is what the reseal reminder counts from. */
        if (list[i].status === 'installed' && !list[i].date) {
          list[i].date = new Date().toISOString().slice(0, 10);
        }
      }
      if (save(list)) render();
      return;
    }

    if ((id = t.getAttribute('data-shot-add'))) {
      pendingId = id;
      $('shotFile').value = '';
      $('shotFile').click();
      return;
    }

    if ((id = t.getAttribute('data-note'))) {
      var j = byId(id); if (!j) return;
      var n = prompt('A note about this blend — what went down, and anything you’d want to remember next time.', j.note || '');
      if (n === null) return;
      var l2 = jobs();
      for (var k = 0; k < l2.length; k++) if (l2[k].id === id) l2[k].note = n.trim();
      if (save(l2)) render();
      return;
    }

    if ((id = t.getAttribute('data-del'))) {
      var jj = byId(id); if (!jj) return;
      if (!confirm('Delete ' + jj.name + ' and its photos?\n\nThis cannot be undone.')) return;
      if (save(jobs().filter(function (x) { return x.id !== id; }))) render();
      return;
    }

    /* Tapping a thumbnail offers to remove that one photo. */
    var s = t.getAttribute('data-shot');
    if (s) {
      var parts = s.split(':'), jid = parts[0], idx = parseInt(parts[1], 10);
      if (!confirm('Remove this photo?')) return;
      var l3 = jobs();
      for (var m = 0; m < l3.length; m++) if (l3[m].id === jid) l3[m].shots.splice(idx, 1);
      if (save(l3)) render();
    }
  });

  $('saveJob').addEventListener('click', saveCurrent);
  $('shotFile').addEventListener('change', function () {
    if (this.files && this.files.length) addShots(this.files);
  });

  render();
})();
