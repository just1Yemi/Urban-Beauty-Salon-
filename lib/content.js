// Content model for hub, treatment and text pages (schema: CONTENT_GUIDE.md).
// Registers the "content" collection (validated on every build: errors stop the build,
// warnings are printed), the computed clean URLs, and the filters the layouts use.
// Data files are read here, not through the data cascade, because treatment front matter
// uses the field names `services` and `reviews` (lists of ids), which shadow the global data.
import fs from "node:fs";
import path from "node:path";

const DATA = "src/_data";
const TYPES = { "layouts/hub.njk": "hub", "layouts/treatment.njk": "treatment", "layouts/text.njk": "text", "layouts/trust.njk": "text" };
const BODY_SECTIONS = ["What it is", "Who it suits", "What to expect", "Aftercare"];
const TITLE_SUFFIX = " | The Urban Beauty Salon";
const TODO = /^\s*\[\[TODO[^\]]*\]\]\s*$/;

let cache = null;
const data = () => {
  if (!cache) {
    const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
    const services = read("services.json");
    cache = {
      services,
      byId: new Map(services.map((s) => [String(s.id), s])),
      sections: read("sections.json"),
      photos: read("photos.json"),
      people: read("practitioners.json").people ?? {},
      reviews: read("reviews.json").items ?? {},
    };
  }
  return cache;
};

const isPublic = (s) => s.pricePublic && s.price != null && !s.isPrescription;
export const slugify = (s) => String(s).toLowerCase().replace(/<[^>]+>/g, "").replace(/&amp;|&/g, " and ")
  .replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const typeOf = (d) => TYPES[d.layout] ?? null;
const slugOf = (d) => d.slug || d.page?.fileSlug;
const sectionOf = (key) => data().sections[key];
const pageOf = (slug) => {
  for (const key of data().sections.order) {
    const i = sectionOf(key).pages.findIndex((p) => p.slug === slug);
    if (i > -1) return { key, section: sectionOf(key), index: i, entry: sectionOf(key).pages[i] };
  }
  return null;
};

// Clean URLs: hub /<section>/, treatment /<section>/<slug>/, text page /<slug>/.
export function permalinkFor(d) {
  const type = typeOf(d);
  if (type === "hub") return `/${d.section}/`;
  if (type === "treatment") return `/${d.section}/${slugOf(d)}/`;
  return `/${slugOf(d)}/`;
}

// Everything a template shows about a page's services. ref: list of service ids (front matter)
// or a page slug (services.json page field, for cards of pages not built yet).
// Public prices only; prescription services show "Free consultation" and never a price;
// held-back prices (Profhilo, microneedling, fat dissolving) show "Price on consultation" until Yemi decides
// (the open decision is listed in BUILD_PLAN.md and the copy review documents, not on the page).
// Price lists use menuName (sentence case, no category prefix) when a service has one.
export function offer(ref) {
  const { services, byId } = data();
  const list = Array.isArray(ref) ? ref.filter((id) => typeof id !== "object").map((id) => byId.get(String(id))).filter(Boolean) : services.filter((s) => s.page === ref);
  // Add-ons, soak-offs, removals, repairs, infills and tests (excludeFromFrom in services.json, set by
  // scripts/import-services.js) stay in the price list but never set From £X, the card time or the range.
  const main = list.filter((s) => !s.excludeFromFrom);
  const pub = main.filter(isPublic);
  const cheapest = pub.reduce((a, b) => (!a || b.price < a.price ? b : a), null);
  const rx = list.filter((s) => s.isPrescription);
  const seen = new Set();
  const rows = [];
  for (const s of list) {
    const label = s.menuName || s.publicName;
    if (isPublic(s)) rows.push({ name: label, price: s.price, mins: s.durationMins });
    else if (s.isPrescription) {
      if (!seen.has(s.publicName)) rows.push({ name: s.publicName, note: "Free consultation" });
      seen.add(s.publicName);
    } else rows.push({ name: label, note: "Price on consultation", mins: s.durationMins });
  }
  const mins = main.filter((s) => !s.isPrescription && s.durationMins).map((s) => s.durationMins);
  const held = main.filter((s) => !s.isPrescription && !isPublic(s));
  const heldBack = !cheapest && rx.length === 0 && held.length > 0;
  return {
    from: cheapest ? cheapest.price : null,
    fromMins: cheapest ? cheapest.durationMins : (heldBack ? Math.min(...held.map((s) => s.durationMins).filter(Boolean)) : null),
    consultation: !cheapest && rx.length > 0,
    heldBack,
    rows,
    minMins: mins.length ? Math.min(...mins) : null,
    maxMins: mins.length ? Math.max(...mins) : null,
  };
}

// Card data for a planned page (built or not): name, url, photos, card line, offer.
function card(slug, built) {
  const p = pageOf(slug);
  if (!p) return null;
  const page = built.find((b) => typeOf(b.data) === "treatment" && slugOf(b.data) === slug);
  return {
    slug, name: p.entry.name, url: `/${p.key}/${slug}/`, photo: p.entry.photo || "", detail: p.entry.detail || "",
    text: p.entry.text || "", section: p.section.label, num: p.index + 1, built: Boolean(page),
    offer: offer(page ? page.data.services : slug),
  };
}

// Highlight [[TODO: ...]] placeholders in rendered HTML (Markdown bodies).
export const markTodos = (html) => String(html ?? "").replace(/\[\[TODO[^\]]*\]\]/g, (m) => `<span class="todo">${m}</span>`);

// Split rendered Markdown at each <h2> into sections with ids (for the contents list).
// Numbered lists become the numbered steps component (01, 02 with the thin line).
export function sectionsOf(html) {
  const parts = markTodos(html).split(/(?=<h2[\s>])/);
  const out = [];
  for (const part of parts) {
    const m = part.match(/^<h2[^>]*>([\s\S]*?)<\/h2>/);
    if (!m) { if (part.trim()) out.push({ id: "", label: "", html: part }); continue; }
    const label = m[1].replace(/<[^>]+>/g, "").trim();
    const id = slugify(label);
    const body = part.slice(m[0].length).replace(/<ol>([\s\S]*?)<\/ol>/g, (_, items) =>
      '<ol class="steps" data-stagger="120">' + items.replace(/<li>\s*(?:<p>)?\s*<strong>([\s\S]*?)<\/strong>\s*([\s\S]*?)\s*(?:<\/p>)?\s*<\/li>/g,
        (_m, t, rest) => `<li data-reveal><div><h3 class="h4">${t.replace(/[.:]\s*$/, "")}</h3><p>${rest}</p></div></li>`) + "</ol>");
    out.push({ id, label, html: body });
  }
  return out;
}

// ---- validation: run once per build over every page in src/content ----
function validate(items) {
  const { byId, sections, photos, people, reviews, services } = data();
  const errors = [];
  const warnings = [];
  const seen = { url: new Map(), title: new Map(), metaTitle: new Map(), metaDescription: new Map() };
  for (const it of items) {
    const d = it.data;
    const where = path.relative(process.cwd(), it.inputPath).split(path.sep).join("/");
    const err = (m) => errors.push(`${where}: ${m}`);
    const warn = (m) => warnings.push(`${where}: ${m}`);
    const type = typeOf(d);
    if (!type) { err(`layout must be one of ${Object.keys(TYPES).join(", ")}`); continue; }
    for (const f of ["title", "metaTitle", "metaDescription"]) if (!d[f]) err(`missing ${f}`);
    if (d.metaDescription && (d.metaDescription.length < 70 || d.metaDescription.length > 160)) warn(`metaDescription is ${d.metaDescription.length} characters (aim for 70 to 160)`);
    if (d.metaTitle && (d.metaTitle + TITLE_SUFFIX).length > 65) warn(`metaTitle plus "${TITLE_SUFFIX}" is ${(d.metaTitle + TITLE_SUFFIX).length} characters (aim for 65 at most)`);
    for (const k of Object.keys(seen)) {
      const v = k === "url" ? it.url : d[k];
      if (!v) continue;
      if (seen[k].has(v)) err(`${k} "${v}" is also used by ${seen[k].get(v)}`);
      else seen[k].set(v, where);
    }
    if (d.heroPhoto && !photos[d.heroPhoto] && !TODO.test(d.heroPhoto) && !/^panel(-light)?:/.test(d.heroPhoto)) err(`heroPhoto "${d.heroPhoto}" is not in photos.json (use a photos.json name or a [[TODO: ...]])`);
    if (type === "text") continue;

    const sec = sections[d.section];
    if (!sec || !sections.order.includes(d.section)) { err(`section must be one of ${sections.order.join(", ")}`); continue; }
    const folder = where.split("/").slice(-2, -1)[0];
    if (folder !== d.section) err(`file is in src/content/${folder}/ but section is "${d.section}"`);
    if (type === "hub") {
      if (it.page.fileSlug !== d.section) err("a hub page must be src/content/<section>/index.md");
      continue;
    }

    // treatment
    const slug = slugOf(d);
    if (!sec.pages.some((p) => p.slug === slug)) err(`slug "${slug}" is not a planned ${d.section} page in src/_data/sections.json`);
    if (d.slug && d.slug !== it.page.fileSlug) err(`slug "${d.slug}" must match the file name (${it.page.fileSlug}.md)`);
    if (!d.lead) err("missing lead");
    if (!d.bookLabel) err("missing bookLabel");
    else if (d.bookLabel.length > 24) warn(`bookLabel "${d.bookLabel}" is ${d.bookLabel.length} characters (22 to 24 at most)`);
    if (!d.heroPhoto) err("missing heroPhoto (a photos.json name or a [[TODO: ...]])");
    const allRx = Array.isArray(d.services) && d.services.length > 0 && d.services.every((id) => byId.get(String(id))?.isPrescription);
    if (!d.facts) err("missing facts");
    else if (!allRx && (!d.facts.resultsLast || !d.facts.downtime)) err("facts needs resultsLast and downtime (a [[TODO: ...]] is fine)");
    else if (allRx && (d.facts.resultsLast || d.facts.downtime)) err("a consultation-only page (every service is prescription) must not state results or downtime: use facts.format instead");
    // A field missing from front matter falls back to the global data of the same name
    // (services.json, reviews.json), so only a list of plain ids counts.
    const ids = (v) => (Array.isArray(v) && v.every((x) => typeof x !== "object") ? v : null);
    if (!ids(d.services) || !d.services.length) err("services must list at least one service id from services.json");
    else {
      for (const id of d.services) {
        const s = byId.get(String(id));
        if (!s) err(`service id ${id} is not in services.json`);
        else if (s.page !== slug) warn(`service ${id} (${s.publicName}) belongs to page "${s.page}" in services.json`);
      }
      const listed = new Set(d.services.map(String));
      // Prescription services left off a page on purpose (kept out of public view) are not reported.
      const missing = services.filter((s) => s.page === slug && !s.isPrescription && !listed.has(String(s.id)));
      if (missing.length) warn(`services.json has ${missing.length} more service(s) for "${slug}" not listed: ${missing.map((s) => s.id + " " + s.publicName).join("; ")}`);
    }
    if (d.practitioner && !TODO.test(d.practitioner) && !people[d.practitioner]) err(`practitioner "${d.practitioner}" is not in practitioners.json`);
    if (d.related != null && !ids(d.related)) err("related must be a list of page slugs");
    for (const r of ids(d.related) ?? []) if (!pageOf(r)) err(`related "${r}" is not a planned page in sections.json`);
    if (d.reviews != null && !Array.isArray(d.reviews) && !(d.reviews && d.reviews.items)) err("reviews must be a list of review ids (or [])");
    for (const r of ids(d.reviews) ?? []) if (!reviews[r]) err(`review "${r}" is not in reviews.json`);
    if (d.faqs != null && !Array.isArray(d.faqs)) err("faqs must be a list of { q, a }");
    for (const f of Array.isArray(d.faqs) ? d.faqs : []) if (!f || !f.q || !f.a) err("each faq needs q and a");
    const raw = fs.readFileSync(it.inputPath, "utf8").replace(/^---[\s\S]*?\n---/, "");
    const heads = [...raw.matchAll(/^##\s+(.+?)\s*$/gm)].map((m) => m[1]);
    const missingHeads = BODY_SECTIONS.filter((h) => !heads.includes(h));
    if (missingHeads.length) err(`body needs the headings: ${missingHeads.map((h) => "## " + h).join(", ")}`);
  }
  if (warnings.length) console.warn(`[content] ${warnings.length} warning(s):\n  ` + warnings.join("\n  "));
  if (errors.length) throw new Error(`[content] ${errors.length} error(s) in src/content (see CONTENT_GUIDE.md):\n  ` + errors.join("\n  "));
}

export function registerContent(eleventyConfig) {
  eleventyConfig.on("eleventy.before", () => { cache = null; });

  eleventyConfig.addCollection("content", (api) => {
    const items = api.getFilteredByGlob("src/content/**/*.md");
    validate(items);
    return items;
  });

  eleventyConfig.addFilter("offer", (ref) => offer(ref));
  eleventyConfig.addFilter("sectionInfo", (key) => sectionOf(key));
  eleventyConfig.addFilter("pageInfo", (slug) => pageOf(slug));
  // Hub cards: every planned page in the section, in site-map order.
  eleventyConfig.addFilter("sectionCards", (key, built) => (sectionOf(key)?.pages ?? []).map((p) => card(p.slug, built || [])));
  // Related cards from a list of slugs (any section).
  eleventyConfig.addFilter("relatedCards", (slugs, built) => (Array.isArray(slugs) ? slugs : []).map((s) => card(s, built || [])).filter(Boolean));
  eleventyConfig.addFilter("practitioner", (id) => data().people[id] ?? null);
  eleventyConfig.addFilter("reviewItems", (ids) => (Array.isArray(ids) ? ids : []).map((id) => data().reviews[id]).filter(Boolean));
  // "2026-11-08" -> "8 November 2026" (text pages: last updated)
  eleventyConfig.addFilter("dateLong", (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" }) : ""));
  eleventyConfig.addFilter("sectionsOf", sectionsOf);
  eleventyConfig.addFilter("markTodos", markTodos);
  // 60, 75 -> "60–75 min"; 60, 60 -> "1 hr"
  eleventyConfig.addFilter("minsRange", (o) => {
    if (!o || !o.minMins) return "";
    if (o.minMins === o.maxMins) return eleventyConfig.getFilter("duration")(o.minMins);
    return `${o.minMins}–${o.maxMins} min`;
  });
}
