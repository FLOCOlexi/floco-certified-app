/* The 30-day content calendar.
 *
 * This card used to sit on the Vault page and do nothing at all, which is
 * worse than not having it.
 *
 * The thing that actually matters here is the MIX. An installer's instinct is
 * to post finished decks, over and over, and a feed of nothing but finished
 * decks reads as a catalogue and gets scrolled past. Five kinds of post each
 * do a different job, so the thirty days below are ordered to balance them and
 * to never repeat a type two days running.
 */
(function () {
  var KEY = 'floco_cal_done';
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };

  var TYPES = {
    teach:    { n: 'Teach',           c: '#3BBFB8', w: 'Answer what people already google. This is how you become the expert in your market instead of another contractor.' },
    ba:       { n: 'Before & after',  c: '#E4CB8E', w: 'The proof, and the best performer you have. Nobody scrolls past a surface they cannot believe is the same one.' },
    customer: { n: 'Customers',       c: '#F0B68F', w: 'Their words beat yours every time. A real reaction is worth more than anything you can say about yourself.' },
    team:     { n: 'Your team',       c: '#8FD3E8', w: 'Faces are what make you the local company rather than a logo. People hire people they have already seen.' },
    behind:   { n: 'Behind the scenes', c: '#B49AE0', w: 'The craft: mixing, troweling, blends being made. This is what quietly justifies your price.' }
  };

  /* Ordered so no type ever lands twice in a row. */
  var DAYS = [
    ['team',    'Say hello properly',            'Thirty seconds, one take, no script. Who you are, your company, the town you serve, and why you got into this.'],
    ['ba',      'Your best job, side by side',   'Before on the left, after on the right. Hold three seconds on each. No music needed.'],
    ['teach',   'What rubber surfacing actually is', 'Not a coating and not paint. Half an inch thick, hand-troweled, poured on site. Say it in your own words.'],
    ['behind',  'The mixing station',            'Film the poly going in, the two-minute mix, and the pour. People have never seen this and they will watch all of it.'],
    ['customer','The reveal',                    'Film their face the first time they walk on it barefoot. Ask first, then just keep the camera up.'],
    ['teach',   'Cooler than concrete, proven',  'Point an infrared thermometer at the concrete, then at the rubber, same sun, same minute. Show both numbers.'],
    ['ba',      'The worst surface you have fixed', 'Cracked, stained, genuinely unsafe. Then the after. The bigger the gap, the better it travels.'],

    ['behind',  'One bag, one blend',            'Pour a bag out on a board and show the colours that went into it. Name them.'],
    ['team',    'Meet the crew',                 'Every person, their name, what they do, and one thing they are genuinely good at.'],
    ['teach',   'Slip resistance, wet',          'Pour a bucket of water on it and walk across barefoot. Film your own feet. That is the whole post.'],
    ['ba',      'Pool coping, close up',         'The band round the pool before, and the same band after. Close and slow.'],
    ['customer','Ask them one question',         '"What made you finally do it?" Then be quiet and let them answer. Do not edit their pause out.'],
    ['teach',   'Why TPV and not EPDM',          'Holds its colour, stays flexible instead of going brittle, far less powder. Keep it plain.'],
    ['behind',  'The trowel',                    'Close, slow, no talking. Just the finish going down. Let the craft carry it.'],

    ['ba',      'Same pool, a year later',       'Go back to a job you did last year and shoot it as it is now. Nothing proves durability like time.'],
    ['team',    'A day in the life',             'Truck loading at six through clean-up at four, cut to fifteen seconds.'],
    ['teach',   'What prep actually looks like', 'The drainage fix nobody ever sees and nobody else does. This is the post that explains your price.'],
    ['behind',  'A blend made in front of the customer', 'The tablespoon method on camera. One tablespoon is ten percent of the batch.'],
    ['customer','Their words, your caption',     'Screenshot a text message or a review and post it plain. No graphic, no border.'],
    ['ba',      'A lanai, not a pool deck',      'Different space entirely. Shows people you do more than the one thing.'],
    ['teach',   'Can you put it over pavers?',   'Answer a real question somebody actually asked you this week. Use their wording.'],

    ['behind',  'An inlay going in',             'Mold set into the wet floor, the void filled, then the reveal. Three shots.'],
    ['team',    'Why we are certified',          'What the badge means, in your own words. Trained, tested, and using genuine material.'],
    ['ba',      'Steps and edges',               'Exactly where cheap installs fail first. Show yours, close up, and say why they last.'],
    ['customer','The family actually using it',  'Kids, dogs, bare feet. Ask permission first and honour a no.'],
    ['teach',   'How to look after it',          'Rinse it, sweep it, and when to call you for a UV coat. Useful beats clever.'],
    ['ba',      'Playground or commercial',      'Proves you are not only a pool deck company. Opens a completely different customer.'],
    ['behind',  'Lighting after dark',           'The same space by day and then lit at night. Almost impossible to describe and almost impossible to refuse.'],
    ['teach',   'What it costs, honestly',       'Talk about what goes into the price without quoting a number. Honesty sells better than a discount.'],
    ['team',    'Thank the people who hired you','Name your town and thank this month’s customers by first name. Do this one every month.']
  ];

  function done() { try { var v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }

  function renderMix() {
    var counts = {};
    DAYS.forEach(function (d) { counts[d[0]] = (counts[d[0]] || 0) + 1; });
    $('mixList').innerHTML = Object.keys(TYPES).map(function (k) {
      var t = TYPES[k];
      return '<div class="m"><span class="dot" style="background:' + t.c + '"></span><div>'
        + '<span class="mt">' + esc(t.n) + '</span> '
        + '<span class="mc">' + counts[k] + ' this month</span>'
        + '<div class="mw">' + esc(t.w) + '</div></div></div>';
    }).join('');
  }

  function render() {
    var d = done();
    var html = '';
    DAYS.forEach(function (row, i) {
      if (i % 10 === 0) html += '<div class="wk">Days ' + (i + 1) + ' to ' + (i + 10) + '</div>';
      var t = TYPES[row[0]];
      var on = d.indexOf(i) > -1;
      html += '<div class="day' + (on ? ' done' : '') + '" data-i="' + i + '">'
        + '<div class="num">' + (i + 1) + '</div>'
        + '<div class="bd">'
        +   '<span class="chip" style="background:' + t.c + '22;color:' + t.c + '">' + esc(t.n) + '</span>'
        +   '<div class="t">' + esc(row[1]) + '</div>'
        +   '<div class="s">' + esc(row[2]) + '</div>'
        + '</div>'
        + '<div class="tick"><svg viewBox="0 0 24 24"><path d="M4 12l6 6L20 6"/></svg></div>'
        + '</div>';
    });
    $('days').innerHTML = html;
    $('pN').textContent = d.length;
    $('pX').textContent = d.length === 30
      ? 'A full month posted. Start it again, with this month’s jobs.'
      : 'of 30 posted. Tap a day when it goes out.';
    $('foot').textContent = 'Ticks are saved on this device only. Nothing posts automatically, '
      + 'and nothing here is scheduled for you: you shoot it and you post it.';
  }

  document.addEventListener('click', function (e) {
    var row = e.target.closest ? e.target.closest('.day') : null;
    if (row) {
      var i = +row.getAttribute('data-i'), d = done(), at = d.indexOf(i);
      if (at > -1) d.splice(at, 1); else d.push(i);
      save(d); render();
      return;
    }
    if (e.target.id === 'pReset') {
      if (!done().length) return;
      if (!confirm('Clear all thirty ticks and start the month again?')) return;
      save([]); render();
    }
  });

  renderMix();
  render();
})();
