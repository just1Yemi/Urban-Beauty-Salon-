// npm run share-images: one branded share image (1200 x 630 JPEG) per indexable page, for WhatsApp, Instagram, Facebook and
// search previews. Output: src/assets/img/share/<page-slug>.jpg (committed; Eleventy copies the folder). The slug rule is
// shareSlug() in lib/seo.js ("/aesthetics/dermal-fillers/" -> "aesthetics-dermal-fillers", "/" -> "home").
// Template: Espresso ground with grain, Ivory tertiary logo, Champagne eyebrow and hairline, the page title in Jost light
// uppercase, and the UB circle as a faint watermark. Text is set in Chromium (Playwright) with the self-hosted Jost and
// Inter, then sharp compresses to JPEG. Pages marked noindex or sitemap: false get no image.
// Run after changing a page title: node scripts/make-share-images.js [--only /about/]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";
import matter from "gray-matter";
import { permalinkFor } from "../lib/content.js";
import { shareSlug } from "../lib/seo.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "src/assets/img/share");
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

const read = (p) => fs.readFileSync(path.join(root, p));
const b64 = (p) => read(p).toString("base64");
const site = JSON.parse(read("src/_data/site.json"));
const sections = JSON.parse(read("src/_data/sections.json"));
const svg = (name) => read(`src/assets/img/brand/${name}.svg`).toString("utf8");

// ---- page list ----
const walk = (dir, ext, out = []) => {
  for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(p, ext, out);
    else if (e.name.endsWith(ext)) out.push(p);
  }
  return out;
};
const pages = [];
for (const f of walk("src/content", ".md")) {
  const { data } = matter(read(f).toString("utf8"));
  if (data.noindex || data.sitemap === false) continue;
  const slug = data.slug || path.basename(f, ".md");
  const url = permalinkFor({ ...data, slug, page: { fileSlug: slug } });
  const sec = sections[data.section]?.label;
  pages.push({ url, title: data.title, eyebrow: sec ? (data.layout.includes("hub") ? "Treatments" : sec) : data.eyebrow || "The Urban Beauty Salon" });
}
for (const f of ["src/index.njk", "src/about.njk", "src/contact.njk"]) {
  const { data } = matter(read(f).toString("utf8"));
  if (data.noindex || data.sitemap === false) continue;
  const url = f.endsWith("index.njk") ? "/" : `/${path.basename(f, ".njk")}/`;
  pages.push({ url, title: url === "/" ? "Aesthetics & beauty in Warrington" : data.title, eyebrow: url === "/" ? site.tradingName : "The Urban Beauty Salon" });
}

// ---- template ----
const font = (file, weight) => `@font-face{font-family:"J";font-weight:${weight};src:url(data:font/woff2;base64,${b64(`src/assets/fonts/${file}`)}) format("woff2")}`;
const fontInter = `@font-face{font-family:"I";font-weight:400;src:url(data:font/woff2;base64,${b64("src/assets/fonts/inter-latin-400-normal.woff2")}) format("woff2")}`;
const logo = svg("urban-beauty-tertiary-ivory");
const icon = svg("urban-beauty-icon-ivory");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const html = (p) => {
  const n = p.title.length;
  const size = n <= 22 ? 84 : n <= 36 ? 68 : 56;
  return `<!doctype html><meta charset="utf-8"><style>
${font("jost-latin-300-normal.woff2", 300)}${font("jost-latin-400-normal.woff2", 400)}${fontInter}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;position:relative;overflow:hidden;background:#3B302A;color:#F6F1EA;font-family:"I",Arial,sans-serif}
.mark{position:absolute;right:-90px;top:50%;width:560px;transform:translateY(-50%);opacity:.07}
.mark svg,.logo svg{width:100%;height:auto;display:block}
.logo{position:absolute;left:88px;top:72px;width:210px}
.inner{position:absolute;left:88px;right:88px;top:178px}
.eyebrow{font:400 22px/1 "J";letter-spacing:.22em;text-transform:uppercase;color:#C6A77D}
h1{margin-top:28px;max-width:900px;font:300 ${size}px/1.12 "J";letter-spacing:.1em;text-transform:uppercase;text-wrap:balance}
.foot{position:absolute;left:88px;right:88px;bottom:64px;padding-top:26px;border-top:1px solid #C6A77D;display:flex;justify-content:space-between;font:400 19px/1 "J";letter-spacing:.2em;text-transform:uppercase;color:#C9C0B6}
</style><div class="mark">${icon}</div><div class="logo">${logo}</div>
<div class="inner"><p class="eyebrow">${esc(p.eyebrow)}</p><h1>${esc(p.title)}</h1></div>
<div class="foot"><span>Penketh · Warrington · Est. ${site.established}</span><span>${esc(site.domain)}</span></div>`;
};

fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
let made = 0;
const keep = new Set();
for (const p of pages) {
  if (only && p.url !== only) continue;
  const slug = shareSlug(p.url);
  keep.add(`${slug}.jpg`);
  await page.setContent(html(p), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: "png" });
  await sharp(png).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(outDir, `${slug}.jpg`));
  made++;
}
await browser.close();
// remove images for pages that no longer exist (full runs only)
if (!only) for (const f of fs.readdirSync(outDir)) if (f.endsWith(".jpg") && !keep.has(f)) fs.unlinkSync(path.join(outDir, f));
console.log(`share images: ${made} written to src/assets/img/share/`);
