// Offline link check over _site: internal links, assets, #fragments, mailto and tel format.
// External (http/https to other hosts) links are not fetched. Exit 1 on any failure.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteDir = path.join(root, "_site");
if (!fs.existsSync(siteDir)) {
  console.error("Link check: _site not found. Run npm run build first.");
  process.exit(1);
}

const site = JSON.parse(fs.readFileSync(path.join(root, "src/_data/site.json"), "utf8"));
const origin = new URL(site.url).origin;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const files = walk(siteDir);
const htmlFiles = files.filter((f) => f.endsWith(".html"));
const relSite = (p) => path.relative(siteDir, p).split(path.sep).join("/");
const fileSet = new Set(files.map(relSite));

const idCache = new Map();
function idsOf(relPath) {
  if (!idCache.has(relPath)) {
    const html = fs.readFileSync(path.join(siteDir, relPath), "utf8");
    idCache.set(relPath, new Set([...html.matchAll(/\b(?:id|name)\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1])));
  }
  return idCache.get(relPath);
}

// Resolve a URL path (no query or hash) to a built file, using Netlify-style pretty URLs.
function resolveTarget(urlPath) {
  const p = decodeURIComponent(urlPath).replace(/^\/+/, "");
  const candidates = p === "" || p.endsWith("/") ? [p + "index.html"] : [p, p + ".html", p + "/index.html"];
  return candidates.find((c) => fileSet.has(c)) ?? null;
}

const failures = [];
let checked = 0;
const ATTR = /\b(href|src|poster|data-src|action)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;

for (const f of htmlFiles) {
  const pageRel = relSite(f);
  const pageUrl = "/" + pageRel.replace(/index\.html$/, "");
  const html = fs.readFileSync(f, "utf8").replace(/<(script|style)\b(?![^>]*ld\+json)[\s\S]*?<\/\1>/gi, "");
  const urls = [];
  for (const m of html.matchAll(ATTR)) urls.push(m[2] ?? m[3]);
  for (const m of html.matchAll(/\bsrcset\s*=\s*"([^"]*)"/gi)) {
    for (const part of m[1].split(",")) urls.push(part.trim().split(/\s+/)[0]);
  }
  for (let raw of urls) {
    raw = raw.trim();
    checked++;
    const fail = (why) => failures.push(`${pageRel}: ${why}  (${raw || "empty"})`);
    if (raw === "") { fail("empty link"); continue; }
    if (/^(javascript:|data:|blob:)/i.test(raw)) continue;
    if (/^mailto:/i.test(raw)) {
      const addr = raw.slice(7).split("?")[0];
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) fail("bad mailto");
      continue;
    }
    if (/^tel:/i.test(raw)) {
      if (!/^tel:\+?\d{10,15}$/.test(raw)) fail("bad tel (digits only, e.g. +441925726688)");
      continue;
    }
    let u;
    try { u = new URL(raw, origin + pageUrl); } catch { fail("unparseable URL"); continue; }
    if (u.protocol !== "http:" && u.protocol !== "https:") continue;
    if (u.origin !== origin) continue; // external: not fetched
    const target = u.pathname === pageUrl ? pageRel : resolveTarget(u.pathname);
    if (!target) { fail("missing target"); continue; }
    if (u.hash.length > 1 && target.endsWith(".html")) {
      const id = decodeURIComponent(u.hash.slice(1));
      if (!idsOf(target).has(id)) fail(`missing #${id} in ${target}`);
    }
  }
}

if (failures.length) {
  console.error(`Link check FAILED: ${failures.length} problem(s)`);
  for (const f of failures) console.error("  " + f);
  process.exit(1);
}
console.log(`Link check passed (${htmlFiles.length} pages, ${checked} links)`);
