/* FLOCO Certified — Marketing Vault.
 *
 * Everything on this screen used to be a picture of a video: painted-on play
 * and download buttons that answered with a "coming soon" toast. Now the
 * screen is rendered from library.js, and every control is a real link.
 *
 * If the Drive folder has not been set yet, we say so plainly instead of
 * showing buttons that go nowhere. A visible "not linked yet" beats a button
 * that lies.
 */
(function () {
  'use strict';

  var L = window.FLOCO_LIBRARY;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var PLAY = '<svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></svg>';
  var DOWN = '<svg viewBox="0 0 24 24"><path d="M12 3v12M7 11l5 5 5-5M5 21h14"/></svg>';

  function heroHtml(v) {
    return '' +
      '<a class="feat" href="' + esc(L.watchUrl(v)) + '" target="_blank" rel="noopener">' +
        '<img src="' + esc(v.poster) + '" alt="">' +
        '<div class="ov"></div>' +
        '<div class="tagd">Show at every measure</div>' +
        '<div class="play">' + PLAY + '</div>' +
        '<div class="cap"><div class="h">' + esc(v.title) + ' 🎬</div>' +
          '<div class="p">' + esc(v.note) + '</div></div>' +
      '</a>' +
      '<a class="getbtn" href="' + esc(L.downloadUrl(v)) + '" target="_blank" rel="noopener">' +
        DOWN + '<span>Download ' + esc(v.title) + '</span></a>';
  }

  function clipHtml(v) {
    return '' +
      '<div class="clip">' +
        '<a class="hit" href="' + esc(L.watchUrl(v)) + '" target="_blank" rel="noopener" aria-label="Play ' + esc(v.title) + '">' +
          '<img src="' + esc(v.poster) + '" alt="">' +
          '<div class="g"></div>' +
          '<div class="pl">' + PLAY + '</div>' +
          '<div class="nm">' + esc(v.title) + '</div>' +
        '</a>' +
        '<a class="dl" href="' + esc(L.downloadUrl(v)) + '" target="_blank" rel="noopener" aria-label="Download ' + esc(v.title) + '">' + DOWN + '</a>' +
      '</div>';
  }

  function notLinked() {
    return '<div class="nolink">' +
      '<div class="h">Video library not linked yet</div>' +
      '<div class="p">Drop the Google Drive folder link into <b>library.js</b> ' +
      '(<code>DRIVE_FOLDER</code>) and every video on this screen goes live. ' +
      'Share the folder as <b>Anyone with the link · Viewer</b>.</div></div>';
  }

  function render() {
    if (!L) return;
    var hero  = L.videos.filter(function (v) { return v.hero; })[0];
    var rest  = L.videos.filter(function (v) { return !v.hero; });

    var h = document.getElementById('vaultHero');
    var r = document.getElementById('vaultClips');
    var d = document.getElementById('vaultDrive');

    var live = L.linked();
    /* Set both states explicitly. Only hiding on the unlinked branch left the
       section stuck off if render() ever ran twice. */
    if (r) r.closest('.sec').style.display = live ? '' : 'none';
    if (d) d.style.display = live ? '' : 'none';
    /* Never leave a visible href="#" behind - that is a dead link. */
    var all = document.getElementById('vaultSeeAll');
    if (all) all.style.display = live ? '' : 'none';

    if (!live) {
      if (h) h.innerHTML = notLinked();
      return;
    }

    if (h && hero) h.innerHTML = heroHtml(hero);
    if (r) r.innerHTML = rest.map(clipHtml).join('');
    if (d) d.setAttribute('href', L.folder());
    if (all) all.setAttribute('href', L.folder());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else { render(); }
})();
