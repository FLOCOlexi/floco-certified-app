/* FLOCO Certified — universal access (one password for every certifier).
   Prototype gate only; real per-user accounts come with a backend later. */
window.FLOCO_PASSWORD = "FLOCOFAM";
window.FLOCO_PROFILE = { company: "", location: "", role: "certified", email: "" };

window.FLOCOauth = {
  key: "floco_auth_v1",
  login: function (code) {
    if ((code || "").trim().toUpperCase() === window.FLOCO_PASSWORD) {
      localStorage.setItem(this.key, JSON.stringify(window.FLOCO_PROFILE));
      return window.FLOCO_PROFILE;
    }
    return null;
  },
  profile: function () {
    try { return JSON.parse(localStorage.getItem(this.key)); } catch (e) { return null; }
  },
  logout: function () {
    localStorage.removeItem(this.key);
    location.replace("login.html");
  }
};
