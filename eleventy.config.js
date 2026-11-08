import fs from "node:fs";
import crypto from "node:crypto";

// Design-system CSS lives in four source files; it is published as one bundle at
// /assets/css/site.css by src/assets/css/site.11ty.js (see COMPONENTS.md).
const versioned = ["tokens", "base", "layout", "components"].map((f) => `src/assets/css/${f}.css`).concat("src/assets/js/site.js");
const assetVersion = () => {
  const h = crypto.createHash("sha1");
  for (const f of versioned) if (fs.existsSync(f)) h.update(fs.readFileSync(f));
  return h.digest("hex").slice(0, 8);
};

export default function (eleventyConfig) {
  // Copy published assets folder by folder. src/assets/img/source (full-size originals and
  // source videos) is git-ignored and must never be copied into _site. CSS is bundled, not copied.
  for (const dir of ["js", "fonts", "video", "img/brand", "img/salon"]) {
    eleventyConfig.addPassthroughCopy({ [`src/assets/${dir}`]: `assets/${dir}` });
  }
  eleventyConfig.ignores.add("src/assets/img/source/**");
  eleventyConfig.addWatchTarget("src/assets/");

  eleventyConfig.addGlobalData("assetVersion", assetVersion);
  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

  // ---- typography helpers ----
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  // Escape a heading and wrap its ampersand so it takes the Champagne treatment on dark surfaces.
  // Make every [[TODO: ...]] placeholder impossible to miss (escapes the rest).
  eleventyConfig.addFilter("todo", (s) => esc(s).replace(/\[\[TODO[^\]]*\]\]/g, (m) => `<span class="todo">${m}</span>`));
  eleventyConfig.addFilter("amp", (s) => esc(s).replace(/&amp;/g, '<span class="amp">&amp;</span>'));
  // { open: "10:00", close: "20:00" } -> "10:00–20:00" (en dash)
  eleventyConfig.addFilter("timeRange", (d) => (d && d.open ? `${d.open}–${d.close}` : "Closed"));
  // "20:00" -> "8pm", "09:30" -> "9:30am"
  eleventyConfig.addFilter("time12", (t) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    return `${h % 12 || 12}${m ? ":" + String(m).padStart(2, "0") : ""}${h < 12 ? "am" : "pm"}`;
  });
  // No-JS fallback for the live open status: "Tuesday to Saturday".
  eleventyConfig.addFilter("openDays", (days) => {
    const open = (days || []).filter((d) => d.open);
    return open.length ? `${open[0].label} to ${open[open.length - 1].label}` : "";
  });
  eleventyConfig.addFilter("mapsUrl", (address) =>
    "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address));
  // "2026-03" or "2026-03-14" -> "March 2026" (reviews are dated by month)
  eleventyConfig.addFilter("monthYear", (d) => {
    if (!d) return "";
    const date = new Date(String(d).length === 7 ? d + "-01" : d);
    return date.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "Europe/London" });
  });
  eleventyConfig.addFilter("pad2", (n) => String(n).padStart(2, "0"));
  eleventyConfig.addFilter("thousands", (n) => Number(n).toLocaleString("en-GB"));
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v).replace(/</g, "\\u003c"));
  // 75 -> "1 hr 15 min", 45 -> "45 min"
  eleventyConfig.addFilter("duration", (mins) => {
    if (!mins) return "";
    const h = Math.floor(mins / 60), m = mins % 60;
    return h ? `${h} hr${m ? " " + m + " min" : ""}` : `${m} min`;
  });

  // ---- services helpers (data from src/_data/services.json; never type prices by hand) ----
  const pub = (s) => s.pricePublic && s.price != null && !s.isPrescription;
  // Cheapest public, priced service on a treatment page: { price, mins, name } or null.
  eleventyConfig.addFilter("pageFrom", (services, slug) => {
    const list = (services || []).filter((s) => s.page === slug && pub(s));
    if (!list.length) return null;
    const s = list.reduce((a, b) => (b.price < a.price ? b : a));
    return { price: s.price, mins: s.durationMins, name: s.publicName };
  });
  // Every public, priced service on a treatment page, cheapest first: [{ price, mins, name }].
  eleventyConfig.addFilter("pageServices", (services, slug) =>
    (services || []).filter((s) => s.page === slug && pub(s)).sort((a, b) => a.price - b.price)
      .map((s) => ({ price: s.price, mins: s.durationMins, name: s.publicName })));
  // One public service by its exact public name: { price, mins, name } or null.
  eleventyConfig.addFilter("service", (services, name) => {
    const s = (services || []).find((x) => x.publicName === name && pub(x));
    return s ? { price: s.price, mins: s.durationMins, name: s.publicName } : null;
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html", "11ty.js"],
  };
}
