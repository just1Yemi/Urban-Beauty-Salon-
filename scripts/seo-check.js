// SEO and structured-data check over the built site (_site). Prints failures only; exit 1 on any.
// Every indexable page: unique <title> (65 characters at most, 70 allowed for the brand suffix), unique description of 70 to 160
// characters, canonical on the production domain, Open Graph and Twitter tags, a share image that exists, valid JSON-LD.
// JSON-LD rules (CLAUDE.md and the aesthetics review): no aggregateRating or Review markup; Service and Offer only on pages
// with a public, non-prescription price; no prescription service, rawName or held-back price in any JSON-LD.
// Sitemap lists exactly the indexable pages (no /styleguide/, no 404, no noindex page). robots.txt points at the sitemap.
// Usage: node scripts/seo-check.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteDir = path.join(root, "_site");
const site = JSON.parse(fs.readFileSync(path.join(root, "src/_data/site.json"), "utf8"));
const services = JSON.parse(fs.readFileSync(path.join(root, "src/_data/services.json"), "utf8"));
const problems = [];
const bad = (where, msg) => problems.push(`${where}: ${msg}`);

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
};
const urlOf = (f) => "/" + path.relative(siteDir, f).split(path.sep).join("/").replace(/index\.html$/, "");
const attr = (html, re) => (html.match(re) || [])[1];
const unesc = (s) => String(s ?? "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'");

if (!fs.existsSync(siteDir)) { console.error("seo-check: _site not found. Run npm run build first."); process.exit(1); }

const titles = new Map(), descs = new Map();
const indexable = [];
const rx = services.filter((s) => s.isPrescription);
const held = services.filter((s) => !s.isPrescription && !s.pricePublic);

for (const f of walk(siteDir)) {
  const html = fs.readFileSync(f, "utf8");
  const url = urlOf(f);
  const noindex = /<meta name="robots" content="noindex/i.test(html);
  if (noindex) {
    if (url === "/404.html" || url === "/styleguide/") continue;
    if (/rel="canonical"|og:title/.test(html)) bad(url, "noindex page should not carry canonical or Open Graph tags");
    continue;
  }
  indexable.push(url);
  const title = unesc(attr(html, /<title>([^<]*)<\/title>/));
  const desc = unesc(attr(html, /<meta name="description" content="([^"]*)"/));
  if (!title) bad(url, "missing <title>");
  else {
    if (title.length > 70) bad(url, `title is ${title.length} characters: ${title}`);
    if (titles.has(title)) bad(url, `title "${title}" also used by ${titles.get(title)}`); else titles.set(title, url);
  }
  if (!desc) bad(url, "missing meta description");
  else {
    if (desc.length < 70 || desc.length > 160) bad(url, `description is ${desc.length} characters`);
    if (descs.has(desc)) bad(url, `description also used by ${descs.get(desc)}`); else descs.set(desc, url);
  }
  const canon = attr(html, /<link rel="canonical" href="([^"]*)"/);
  if (canon !== site.url + url) bad(url, `canonical is ${canon}, expected ${site.url + url}`);
  for (const p of ["og:title", "og:description", "og:url", "og:image", "og:type"]) if (!html.includes(`property="${p}"`)) bad(url, `missing ${p}`);
  for (const n of ["twitter:card", "twitter:image"]) if (!html.includes(`name="${n}"`)) bad(url, `missing ${n}`);
  const img = attr(html, /property="og:image" content="([^"]*)"/);
  if (img) {
    if (!img.startsWith(site.url + "/")) bad(url, `og:image is not on ${site.url}`);
    else if (!fs.existsSync(path.join(siteDir, img.slice(site.url.length)))) bad(url, `share image missing: ${img.slice(site.url.length)} (run npm run share-images)`);
  }
  if (!/<h1[\s>]/.test(html)) bad(url, "no <h1>");

  // JSON-LD
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  for (const b of blocks) {
    let j;
    try { j = JSON.parse(b); } catch (e) { bad(url, "JSON-LD does not parse"); continue; }
    const nodes = j["@graph"] ?? [j];
    if (/aggregateRating|"Review"|"reviewRating"|"review"/.test(b)) bad(url, "JSON-LD must not carry aggregateRating or review markup");
    for (const s of rx) if (b.includes(s.rawName.trim()) || b.includes(String(s.id))) bad(url, `JSON-LD contains prescription service ${s.id}`);
    if (j["@context"] !== "https://schema.org") bad(url, "JSON-LD @context must be https://schema.org");
    const need = (n, keys, what) => { for (const k of keys) if (n[k] == null || n[k] === "" || (Array.isArray(n[k]) && !n[k].length)) bad(url, `${what} missing required field ${k}`); };
    const isUrl = (v) => typeof v === "string" && /^https:\/\/[^\s]+$/.test(v);
    for (const n of nodes) {
      // Structure and required fields (schema.org / Google rich-result requirements)
      if (n["@type"] === "BeautySalon") {
        need(n, ["@id", "name", "url", "telephone", "address", "image", "openingHoursSpecification"], "BeautySalon");
        if (n.address) need(n.address, ["streetAddress", "addressLocality", "postalCode", "addressCountry"], "BeautySalon address");
        if (n.geo && (typeof n.geo.latitude !== "number" || typeof n.geo.longitude !== "number")) bad(url, "BeautySalon geo needs numeric latitude and longitude");
        for (const h of n.openingHoursSpecification || []) {
          need(h, ["dayOfWeek", "opens", "closes"], "OpeningHoursSpecification");
          if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(h.opens) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(h.closes) || h.opens >= h.closes) bad(url, `bad opening hours ${h.dayOfWeek} ${h.opens}-${h.closes}`);
          if (!["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].includes(h.dayOfWeek)) bad(url, `bad dayOfWeek ${h.dayOfWeek}`);
        }
        for (const k of ["url", "image", "logo", "hasMap"]) if (n[k] && !isUrl(n[k])) bad(url, `BeautySalon ${k} is not an absolute https URL`);
        for (const u of n.sameAs || []) if (!isUrl(u)) bad(url, `sameAs is not an absolute https URL: ${u}`);
        if (!/^\+\d{10,14}$/.test(n.telephone || "")) bad(url, "BeautySalon telephone should be E.164 (+44...)");
      }
      if (n["@type"] === "Service") {
        need(n, ["@id", "name", "url", "provider", "offers"], "Service");
        if (n.provider && n.provider["@id"] !== site.url + "/#salon") bad(url, "Service provider does not reference the salon @id");
        if (n.offers) {
          need(n.offers, ["priceCurrency", "priceSpecification"], "Offer");
          if (n.offers.priceSpecification) need(n.offers.priceSpecification, ["minPrice", "priceCurrency"], "PriceSpecification");
        }
      }
      if (n["@type"] === "BreadcrumbList") {
        const items = n.itemListElement || [];
        if (items.length < 2) bad(url, "BreadcrumbList needs at least 2 items");
        items.forEach((it, i) => {
          need(it, ["position", "name", "item"], "ListItem");
          if (it.position !== i + 1) bad(url, `BreadcrumbList position ${it.position} out of sequence`);
          if (!isUrl(it.item)) bad(url, "BreadcrumbList item is not an absolute https URL");
          else if (!fs.existsSync(path.join(siteDir, it.item.slice(site.url.length), "index.html"))) bad(url, `BreadcrumbList points at a page that does not exist: ${it.item}`);
        });
        if (items.length && items[items.length - 1].item !== site.url + url) bad(url, "last breadcrumb is not the page itself");
      }
      if (n["@type"] === "Service" || n.offers) {
        const price = n.offers?.priceSpecification?.minPrice;
        const match = services.filter((s) => s.pricePublic && !s.isPrescription && s.price === price);
        if (price == null || !match.length) bad(url, "Service/Offer price does not match a public, non-prescription service price");
        if (url.startsWith("/aesthetics/lines-and-wrinkles")) bad(url, "consultation-only page must not have a Service or Offer");
      }
    }
  }
  const isFull = ["/", "/about/", "/contact/"].includes(url);
  if (isFull && !blocks.some((b) => b.includes('"BeautySalon"'))) bad(url, "missing BeautySalon JSON-LD");
  for (const s of held) if (blocks.some((b) => b.includes(String(s.id)))) bad(url, `JSON-LD contains held-back service ${s.id}`);
}

// sitemap
const smPath = path.join(siteDir, "sitemap.xml");
if (!fs.existsSync(smPath)) bad("sitemap.xml", "missing");
else {
  const xml = fs.readFileSync(smPath, "utf8");
  if (!xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>') || !xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">') || !xml.trim().endsWith("</urlset>")) bad("sitemap.xml", "not a well-formed urlset");
  if ((xml.match(/<url>/g) || []).length !== (xml.match(/<\/url>/g) || []).length) bad("sitemap.xml", "unbalanced <url> tags");
  const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1].replace(site.url, ""));
  if (new Set(locs).size !== locs.length) bad("sitemap.xml", "duplicate <loc> entries");
  for (const u of locs) if (!fs.existsSync(path.join(siteDir, u, "index.html"))) bad("sitemap.xml", `lists a page that is not built: ${u}`);
  for (const u of indexable) if (!locs.includes(u)) bad("sitemap.xml", `missing ${u}`);
  for (const u of locs) if (!indexable.includes(u)) bad("sitemap.xml", `lists a page that is not indexable: ${u}`);
  for (const u of locs) if (/styleguide|404/.test(u)) bad("sitemap.xml", `must not list ${u}`);
}
const rb = path.join(siteDir, "robots.txt");
if (!fs.existsSync(rb) || !fs.readFileSync(rb, "utf8").includes(`Sitemap: ${site.url}/sitemap.xml`)) bad("robots.txt", "missing or no Sitemap line");
const nt = path.join(root, "netlify.toml");
if (!fs.existsSync(nt)) bad("netlify.toml", "missing");
else {
  const t = fs.readFileSync(nt, "utf8");
  for (const need of ["command", "publish", "www.theurbanbeautysalon.co.uk", "X-Content-Type-Options", "immutable"]) if (!t.includes(need)) bad("netlify.toml", `missing ${need}`);
}

if (problems.length) {
  console.error(`SEO check FAILED: ${problems.length} problem(s)`);
  for (const p of problems.slice(0, 80)) console.error("  " + p);
  process.exit(1);
}
console.log(`SEO check passed (${indexable.length} indexable pages)`);
