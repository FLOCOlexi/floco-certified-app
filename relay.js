/* FLOCO Certified — delivery relay.
 *
 * The app is a static site: it has no server, so on its own the only thing a
 * page can do is hand a draft to the installer's mail app and hope they press
 * send. That is how design boards went missing, and why FLOCO never got a copy.
 *
 * With a relay URL configured we POST the message to a Zapier Catch Hook and a
 * real email goes out server-side, from a real FLOCO address, with FLOCO
 * copied in.
 *
 * The mailto NEVER goes away. Installers work on job sites with bad signal, and
 * a board that fails to send is worse than a board that opens in Mail. Any
 * failure, any timeout, no relay configured at all, and we fall straight back
 * to the old behaviour. The relay is an upgrade, never a dependency.
 */
(function (w) {
  'use strict';

  /* Paste the Zapier Catch Hook URL here. Empty = mailto, exactly as before. */
  var RELAY_URL = '';

  /* Job sites have terrible signal. Six seconds, then stop waiting and open
   * their mail app instead of leaving them staring at a spinner. */
  var TIMEOUT_MS = 6000;

  /* Every board is copied here, so a job that was designed is never invisible
   * to FLOCO just because an installer closed their mail app. */
  var FLOCO_COPY = 'hello@flocodeckingsystems.com';

  function configured() { return !!RELAY_URL; }

  /**
   * deliver(payload, mailtoUrl, done)
   *   payload   — { to, cc, subject, body, company, repName, kind }
   *   mailtoUrl — the existing mailto: URL, used as the fallback
   *   done(how) — 'relay' if it really sent, 'mail' if their mail app opened
   */
  function deliver(payload, mailtoUrl, done) {
    var finished = false;
    function finish(how) {
      if (finished) return;
      finished = true;
      if (how === 'mail') w.location.href = mailtoUrl;
      if (typeof done === 'function') done(how);
    }

    if (!configured()) { finish('mail'); return; }

    var timer = setTimeout(function () { finish('mail'); }, TIMEOUT_MS);

    payload.bcc = FLOCO_COPY;
    payload.sentAt = new Date().toISOString();

    fetch(RELAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      clearTimeout(timer);
      /* Zapier answers 200 with {"status":"success"}. Anything else and we
       * would rather open their mail app than claim a send that did not
       * happen. */
      finish(res && res.ok ? 'relay' : 'mail');
    }).catch(function () {
      clearTimeout(timer);
      finish('mail');
    });
  }

  w.FLOCOrelay = { deliver: deliver, configured: configured, copyTo: FLOCO_COPY };
})(window);
