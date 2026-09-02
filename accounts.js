/* FLOCO Certified — accounts + auth (client-side prototype gate).
   NOTE: prototype only. Real per-user auth comes with a backend later. */
window.FLOCO_ACCOUNTS = [
  {
    code: "PROSURF2026",
    company: "Pro Surfacing Services",
    contact: "Marshall Johnson",
    location: "Central Florida",
    role: "certified",
    week: "Sept 28 – Oct 2, 2026"
  },
  {
    // Formerly "SprayRite USA" — Jeff & Nick are launching a new venture (name TBD).
    code: "JEFFNICK2026",
    company: "New Venture",
    contact: "Jeff & Nick",
    location: "Fort Worth, TX",
    role: "certified",
    week: "Sept 21 – 25, 2026"
  },
  {
    code: "FLOCOTEAM",
    company: "FLOCO — Team View",
    contact: "FLOCO Team",
    location: "Cape Coral, FL",
    role: "admin",
    week: ""
  }
];

window.FLOCOauth = {
  key: "floco_auth_v1",
  login: function (code) {
    var c = (code || "").trim().toUpperCase();
    var a = window.FLOCO_ACCOUNTS.filter(function (x) { return x.code === c; })[0];
    if (a) localStorage.setItem(this.key, JSON.stringify(a));
    return a || null;
  },
  profile: function () {
    try { return JSON.parse(localStorage.getItem(this.key)); } catch (e) { return null; }
  },
  logout: function () {
    localStorage.removeItem(this.key);
    location.replace("login.html");
  }
};
