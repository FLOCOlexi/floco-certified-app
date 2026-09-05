/* FLOCO Certified — sign in with your email and the shared program password.
 *
 * The email is what makes the app THEIRS. When we already know a certified
 * company, signing in fills their name, their contact details and their town
 * straight into every quote and terms page — they never type it. When we do
 * not know the address yet, they still get in and fill it in themselves, which
 * is the right behaviour for a company still deciding what to launch under.
 *
 * ⚠️ HONEST LIMIT: the password below is shared by every certified company and
 * this file is readable by anyone who opens the page source. It is a front
 * door, not a lock. Nothing confidential belongs behind it. A company's own
 * customers, quotes and photos never leave their device, which is the part
 * that actually matters. Real per-company accounts need a backend.
 */
window.FLOCO_PASSWORD = "FLOCOFAM";

/* Certified companies we already know. Key is the sign-in email, lowercased.
   Add a company here and their next sign-in fills itself in.
   Logos are uploaded once on the company's own device, under Quotes. */
window.FLOCO_COMPANIES = {
  "marshall@honeydosllc.com": {
    company:  "Pro Surfacing Services",
    repName:  "Marshall E. Johnson Sr.",
    location: "Central Florida",
    phone:    "",
    email:    "marshall@honeydosllc.com"
  }
};

window.FLOCOauth = {
  key: "floco_auth_v1",
  /* What a company has corrected about itself, kept per email and kept across
     sign-outs. Our directory is a starting guess; their own edits outrank it
     forever, or they would have to retype their letterhead every sign-in. */
  editsKey: "floco_company_v1",

  edits: function () {
    try { return JSON.parse(localStorage.getItem(this.editsKey)) || {}; } catch (e) { return {}; }
  },

  /* Called whenever a company edits its own details. */
  remember: function (p) {
    var em = ((p && p.email) || "").trim().toLowerCase();
    if (!em) return;
    var all = this.edits();
    all[em] = { company: p.company || "", location: p.location || "",
                phone: p.phone || "", repName: p.repName || "" };
    try { localStorage.setItem(this.editsKey, JSON.stringify(all)); } catch (e) {}
  },

  login: function (email, code) {
    email = (email || "").trim().toLowerCase();
    if ((code || "").trim().toUpperCase() !== window.FLOCO_PASSWORD) return null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;

    var known = window.FLOCO_COMPANIES[email] || {};
    var mine  = this.edits()[email] || {};      /* their own corrections win */
    var pick  = function (k) { return mine[k] || known[k] || ""; };

    var p = { company: pick("company"), location: pick("location"), role: "certified",
              email: email, phone: pick("phone"), repName: pick("repName") };

    localStorage.setItem(this.key, JSON.stringify(p));
    return p;
  },

  profile: function () {
    try { return JSON.parse(localStorage.getItem(this.key)); } catch (e) { return null; }
  },

  logout: function () {
    /* Only the sign-in identity is cleared. Their quotes, jobs, logo, and the
       company details they corrected all stay on the device — signing out is
       not the same as starting over. */
    localStorage.removeItem(this.key);
    location.replace("login.html");
  }
};
