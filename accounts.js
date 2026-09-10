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
/* Every FLOCO teammate shares the same company details, so build the record
   from just a name and a role rather than repeating the address twelve times. */
function fam(name, role) {
  return { company: "FLOCO Decking Systems", repName: name, title: role,
           location: "Southwest Florida", phone: "", family: true };
}

window.FLOCO_COMPANIES = {
  /* ── THE FLOCO FAMILY ──────────────────────────────────────────────────
     FLOCO's own team. Anyone can already sign in with any email, so this is
     not about granting access. It is about being RECOGNISED: without an entry
     here, Brett signing in would be treated as an unknown certified company
     and the app would put a blank letterhead on his quotes. With one, the app
     knows he is FLOCO.
     role:"family" also unlocks the family-only bits of the app (see below).
     To add someone, copy a line. Nothing else needs changing. */
  "lexi@flocodeckingsystems.com":    fam("Lexi Rivera",     "Owner"),
  "brett@flocodeckingsystems.com":   fam("Brett Aarnes",    "Owner · Sales & Operations"),
  "kelly@flocodeckingsystems.com":   fam("Kelly",           "Owner"),
  "adamh@flocodeckingsystems.com":   fam("Adam Hodges",     "Head of Operations"),
  "tyler@flocodeckingsystems.com":   fam("Tyler",           "Head of Cleaning & Maintenance"),
  "katie@flocodeckingsystems.com":   fam("Katie",           "Sales Manager"),
  "bill@flocodeckingsystems.com":    fam("Bill",            "Sales"),
  "stacy@flocodeckingsystems.com":   fam("Stacy",           "Sales"),
  "layton@flocodeckingsystems.com":  fam("Layton",          "Sales"),
  "cristalh@flocodeckingsystems.com":fam("Cristal Hodges",  "Colour Blend Design"),
  "sami@flocodeckingsystems.com":    fam("Sami Sposato",    "Client Care"),
  "alysoni@flocodeckingsystems.com": fam("Alyson Innocenti","Client Care"),
  /* ⚠️ Luis is missing because we do not have his address on file. Add the
     line the moment we do; until then he can still sign in, he just will not
     be recognised as family. */


  /* ── DEMO ACCOUNTS (for video / screen recordings / showing the app off) ──
     Password is the same FLOCOFAM. Two flavours so you can film both and pick
     in the edit. Neither one shows a real certified company's details.
       1. demo@     -> "YOUR COMPANY HERE"  (viewer projects themselves into it)
       2. showcase@ -> a neutral demo company, so the app looks lived-in
     To rename either, just edit the `company` line. Nothing else depends on it. */
  "demo@flocodeckingsystems.com": {
    company:  "YOUR COMPANY HERE",
    repName:  "Your Name",
    location: "Your Market",
    phone:    "",
    email:    "demo@flocodeckingsystems.com"
  },
  "showcase@flocodeckingsystems.com": {
    company:  "Certified Surfacing Co.",
    repName:  "Certified Specialist",
    location: "Your Market",
    phone:    "",
    email:    "showcase@flocodeckingsystems.com"
  },

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

    /* FLOCO's own team get role "family". Everyone else is a certified
       company, including addresses we have never seen before. */
    var isFam = !!known.family;
    var p = { company: pick("company"), location: pick("location"),
              role: isFam ? "family" : "certified", family: isFam,
              title: known.title || "",
              email: email, phone: pick("phone"), repName: pick("repName") };

    localStorage.setItem(this.key, JSON.stringify(p));
    return p;
  },

  /* Is the person signed in one of ours? Used to show the family-only
     shelf in the Vault and to label the header. */
  isFamily: function () {
    var p = this.profile();
    return !!(p && p.family);
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
