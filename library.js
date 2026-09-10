/* FLOCO Certified — the video library.
 * ---------------------------------------------------------------------------
 * EDIT THIS FILE TO ADD A VIDEO. Nothing else needs to change.
 *
 * Why the videos live on Google Drive and not in the app: the finished reels
 * run 40–80 MB each. Bundling them would bloat the install, blow past what a
 * phone should cache offline, and mean a re-deploy every time a new one is
 * cut. A Drive folder is one link, always current, and downloads properly on
 * both iPhone and Android.
 *
 *   DRIVE_FOLDER  the "everything in one place" link. Share it as
 *                 "Anyone with the link — Viewer" or partners will hit a
 *                 request-access wall. Leave it "" and the app hides the
 *                 library section rather than showing a dead button.
 *
 *   videos[]      title  – what it is
 *                 note   – when to use it
 *                 poster – a still from assets/img or assets/photos
 *                 file   – a Drive FILE id, for a direct download link.
 *                          Get it from the sharing URL:
 *                          drive.google.com/file/d/<THIS PART>/view
 *                          Leave it "" and the card opens the folder instead.
 */
window.FLOCO_LIBRARY = {

  /* The URL Lexi sent had "/u/1/" in it, which means "the SECOND Google
     account signed in on THIS browser". On a partner's phone that resolves
     to THEIR second account, not ours, so it is stripped here.
     The id starts 0A, which makes this a SHARED DRIVE rather than an
     ordinary folder — see the sharing note in the app's README. */
  DRIVE_FOLDER: "https://drive.google.com/drive/folders/0AOUi9Jkayf7KUk9PVA",

  videos: [
    { title: "The FLOCO Story",
      note:  "Play it while you measure. It explains the product, the process and the craft, so the customer already gets it before you quote.",
      poster: "assets/img/cover.jpg",
      file:  "",
      hero:  true },

    { title: "Before / After reel",
      note:  "The tear-out to the reveal. The single best-performing thing you can post.",
      poster: "assets/img/detail-charcoal.jpg",
      file:  "" },

    { title: "Pool deck reveal",
      note:  "A finished pool surround, start to finish.",
      poster: "assets/img/home.jpg",
      file:  "" },

    { title: "Why FLOCO",
      note:  "The short version of what makes a FLOCO surface different.",
      poster: "assets/img/commercial.jpg",
      file:  "" }
  ],

  /* ---- helpers used by vault.js -------------------------------------- */

  folder: function () { return (this.DRIVE_FOLDER || "").trim(); },
  linked: function () { return this.folder() !== ""; },

  /* A file id gives a real download link. Without one we fall back to the
     folder, so a card is never a dead end. */
  watchUrl: function (v) {
    if (v.file) return "https://drive.google.com/file/d/" + v.file + "/view";
    return this.folder();
  },
  downloadUrl: function (v) {
    if (v.file) return "https://drive.google.com/uc?export=download&id=" + v.file;
    return this.folder();
  }
};
