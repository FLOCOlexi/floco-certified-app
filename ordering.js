/* FLOCO Certified — "order it" flows.
 *
 * Two vendors the installer orders from directly, not through FLOCO:
 *   decals  → icustom4u@hotmail.com   (print/decal guy, already holds every FLOCO file)
 *   inlays  → designs@wrap-tek.com    (Jesse Taylor at Wrap-Tek, office 239-221-9727)
 *
 * Same no-backend pattern as the Studio's Send button: build a pre-filled
 * mailto: and hand it to their mail app. The installer still presses send, so
 * the order is theirs, from their address, and the vendor can just reply. No
 * server, nothing to go down on a job site, and no FLOCO address in the middle
 * of a conversation about someone else's order.
 *
 * The body is deliberately a FORM with blank lines rather than prose. A vendor
 * reading twenty of these wants the same four fields in the same order every
 * time, and an installer typing one-handed in a truck wants to fill gaps, not
 * compose.
 */
(function (w) {
  'use strict';

  /* Their company name personalises the email so the vendor knows who is
     asking without opening the signature. Blank is normal — a company can be
     signed in before it has set its details — and "my company" keeps the
     sentence grammatical rather than leaving a hole in it. */
  function company() {
    var p;
    try { p = (w.FLOCOauth && w.FLOCOauth.profile && w.FLOCOauth.profile()) || {}; }
    catch (e) { p = {}; }
    return ((p.company || '').trim()) || 'my company';
  }

  function open(to, subject, body) {
    w.location.href = 'mailto:' + encodeURIComponent(to)
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(body);
  }

  w.FLOCOorder = {
    decals: function () {
      var co = company();
      open('icustom4u@hotmail.com',
        'FLOCO decal order — ' + co,
        'Hi! This is ' + co + ', a FLOCO Certified Specialist. '
        + "We'd like to order the following (you have all the files):\n\n"
        + 'Design — Size — Quantity\n'
        + 'Design — Size — Quantity\n'
        + 'Design — Size — Quantity\n\n'
        + 'Ship to:\n\n'
        + 'Thank you!');
    },

    inlay: function () {
      var co = company();
      open('designs@wrap-tek.com',
        'FLOCO custom inlay order — ' + co,
        'Hi Jesse! This is ' + co + ', a FLOCO Certified Specialist. '
        + "We'd like a custom design inlay:\n\n"
        + 'Design/description:\n'
        + 'Colors:\n'
        + 'Size (inches):\n'
        + 'Quantity:\n'
        + 'Needed by:\n\n'
        + 'Thank you!');
    }
  };

  /* Bind by id rather than an inline onclick, so the markup stays free of
     behaviour and both pages wire up the same way. Loaded with `defer`, so the
     DOM is parsed by the time this runs; the belt-and-braces listener covers a
     page that ever loads it without defer. */
  function bind() {
    var map = { ordDecals: w.FLOCOorder.decals, ordInlay: w.FLOCOorder.inlay };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el && !el.__floco) { el.__floco = 1; el.addEventListener('click', map[id]); }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})(window);
