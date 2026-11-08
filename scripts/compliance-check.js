// Banned-terms check. Scans built HTML (text, title, meta, alt text, URLs, JSON-LD),
// built file paths (URLs), and source content for terms banned in CLAUDE.md.
// Prints file:line and the term for every hit. Exit 1 on any hit.
// Usage: node scripts/compliance-check.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteDir = path.join(root, "_site");
const srcDir = path.join(root, "src");

// Case-insensitive, word boundaries (so "secure" and "detox" do not trip "cure" and "tox").
const BANNED = [
  "botox", "botulinum", "toxins?", "tox", "hyaluronidase",
  "anti[\\s_-]*wrinkles?", "wrinkle[\\s_-]+injections?", "baby[\\s_-]+botox",
  "licen[cs]ed", "cures?", "cured", "guaranteed", "the[\\s_-]+best", "the[\\s_-]+only", "first[\\s_-]+in",
];
const RE = new RegExp("(?<![A-Za-z0-9])(" + BANNED.join("|") + ")(?![A-Za-z0-9])", "gi");

const allowFile = path.join(root, "scripts", "compliance-allowlist.json");
const allow = fs.existsSync(allowFile) ? JSON.parse(fs.readFileSync(allowFile, "utf8")).allow ?? [] : [];
const isAllowed = (rel, term) =>
  allow.some((a) => (a.file === "*" || rel === a.file) && a.term.toLowerCase() === term);

function walk(dir, filter, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, filter, out);
    else if (filter(p)) out.push(p);
  }
  return out;
}
const rel = (p) => path.relative(root, p).split(path.sep).join("/");

const hits = [];
let scanned = 0;

function scan(relPath, text, label) {
  scanned++;
  text.split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(RE)) {
      const term = m[1].toLowerCase().replace(/\s+/g, " ");
      if (isAllowed(relPath, term)) continue;
      const start = Math.max(0, m.index - 30);
      hits.push(`${relPath}:${i + 1}  [${label}]  "${term}"  ...${line.slice(start, m.index + m[0].length + 30).trim()}...`);
    }
  });
}

// 1. Built HTML: blank out <style> and non-JSON-LD <script> (code, not copy), scan everything
// else raw. Raw scanning covers visible text, title, meta, alt, aria labels, hrefs/src and
// JSON-LD. Newlines are preserved so line numbers still point at the right place.
const blank = (s) => s.replace(/[^\n]/g, " ");
if (fs.existsSync(siteDir)) {
  for (const f of walk(siteDir, (p) => p.endsWith(".html"))) {
    let html = fs.readFileSync(f, "utf8");
    html = html.replace(/<style\b[\s\S]*?<\/style>/gi, blank);
    html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (all, attrs, body) =>
      /application\/ld\+json/i.test(attrs) ? all : `<script${attrs}>` + blank(body) + "</script>");
    scan(rel(f), html, "html");
  }
  // 2. Every built file path is a URL: check them too.
  for (const f of walk(siteDir, () => true)) scan(rel(f), rel(f).replace(/^_site\//, "/"), "url");
}

// 3. Source copy and templates (not assets, not the services import output).
const SRC_EXT = /\.(md|njk|html|liquid|yml|yaml|json|txt)$/i;
for (const f of walk(srcDir, (p) => SRC_EXT.test(p) && !rel(p).startsWith("src/assets/") && rel(p) !== "src/_data/services.json")) {
  scan(rel(f), fs.readFileSync(f, "utf8"), "src");
}

// 4. services.json: rawName is internal Phorest wording and is allowed; every field that
// can reach the public site must be clean.
const svcFile = path.join(srcDir, "_data", "services.json");
if (fs.existsSync(svcFile)) {
  const services = JSON.parse(fs.readFileSync(svcFile, "utf8"));
  const text = services
    .map((s) => [s.cleanName, s.publicName, s.page, s.websiteSection, s.noteForYemi].filter(Boolean).join(" | "))
    .join("\n");
  scan("src/_data/services.json", text, "services:public-fields");
  for (const s of services) {
    if (s.isPrescription && s.pricePublic) hits.push(`src/_data/services.json  prescription service has pricePublic=true: ${s.id}`);
  }
}

if (hits.length) {
  console.error(`Compliance check FAILED: ${hits.length} hit(s)`);
  for (const h of hits) console.error("  " + h);
  process.exit(1);
}
console.log(`Compliance check passed (${scanned} files/paths scanned)`);
