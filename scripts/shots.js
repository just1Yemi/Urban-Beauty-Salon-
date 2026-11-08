// npm run shots -- / /aesthetics/ [--dir screenshots] [--base http://localhost:8080] [--no-axe]
// Serves _site locally (or uses --base), then for each URL path:
//   - full-page screenshots at 360, 768 and 1440 wide (screenshots/<slug>-<width>.png)
//   - ONE downscaled contact-sheet JPEG with the three widths side by side (screenshots/<slug>-sheet.jpg)
//   - checks for horizontal overflow at 360px, axe-core violations, and page weight
// Prints problems only. Exit 1 if any page has a problem. Run `npm run build` first.
// Motion is set to reduced so reveal animations do not hide content in the screenshots.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteDir = path.join(root, "_site");
const WIDTHS = [360, 768, 1440];
const SHEET_MAX_W = 2000;
const SHEET_MAX_H = 6000;
const GAP = 24;
const WEIGHT_LIMIT = 1_000_000; // quality bar: under 1 MB per page

// ---- args ----
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  if (i === -1) return def;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const outDir = path.resolve(root, opt("--dir", "screenshots"));
let base = opt("--base", null);
const noAxe = args.includes("--no-axe");
// Git Bash rewrites a leading "/" into "C:/Program Files/Git/": undo that.
const paths = args.filter((a) => !a.startsWith("--")).map((a) => a.replace(/^[A-Za-z]:[\/]Program Files[\/]Git[\/]?/, "/"));
if (!paths.length) paths.push("/");

// ---- tiny static server for _site (pretty URLs, like Netlify) ----
const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".avif": "image/avif", ".woff2": "font/woff2", ".woff": "font/woff", ".mp4": "video/mp4", ".webm": "video/webm",
  ".ico": "image/x-icon", ".txt": "text/plain", ".xml": "application/xml", ".webmanifest": "application/manifest+json",
};
function startServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const p = urlPath.replace(/^\/+/, "");
    const candidates = p === "" || p.endsWith("/") ? [p + "index.html"] : [p, p + ".html", p + "/index.html"];
    for (const c of candidates) {
      const f = path.resolve(siteDir, c);
      if (!f.startsWith(siteDir)) break;
      if (fs.existsSync(f) && fs.statSync(f).isFile()) {
        const buf = fs.readFileSync(f);
        res.writeHead(200, { "Content-Type": MIME[path.extname(f).toLowerCase()] ?? "application/octet-stream", "Content-Length": buf.length });
        return res.end(buf);
      }
    }
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

const slugOf = (p) => (p.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9]+/g, "-") || "home");

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = Math.max(300, window.innerHeight - 100);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(400); // let scroll-driven header state and SVG repaints settle
}

async function contactSheet(shots, file) {
  const metas = await Promise.all(shots.map((s) => sharp(s).metadata()));
  const totalW = metas.reduce((a, m) => a + m.width, 0) + GAP * (metas.length - 1);
  const maxH = Math.max(...metas.map((m) => m.height));
  const scale = Math.min(1, SHEET_MAX_W / totalW, SHEET_MAX_H / maxH);
  const scaled = await Promise.all(
    shots.map(async (s, i) => {
      const w = Math.max(1, Math.round(metas[i].width * scale));
      const buf = await sharp(s).resize({ width: w }).png().toBuffer();
      const m = await sharp(buf).metadata();
      return { buf, w: m.width, h: m.height };
    })
  );
  const W = scaled.reduce((a, s) => a + s.w, 0) + Math.round(GAP * scale) * (scaled.length - 1);
  const H = Math.max(...scaled.map((s) => s.h));
  let x = 0;
  const composites = scaled.map((s) => {
    const c = { input: s.buf, left: x, top: 0 };
    x += s.w + Math.round(GAP * scale);
    return c;
  });
  await sharp({ create: { width: W, height: H, channels: 3, background: "#cfc8bd" } })
    .composite(composites)
    .jpeg({ quality: 80 })
    .toFile(file);
  return { width: W, height: H };
}

// ---- main ----
let server;
if (!base) {
  if (!fs.existsSync(siteDir)) {
    console.error("shots: _site not found. Run npm run build first.");
    process.exit(1);
  }
  server = await startServer();
  base = `http://127.0.0.1:${server.address().port}`;
}
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const problems = [];
const sheets = [];

for (const p of paths) {
  const slug = slugOf(p);
  const url = new URL(p, base).href;
  const shots = [];
  const pageProblems = [];
  const axeSeen = new Map();

  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    let bytes = 0;
    const failedReqs = [];
    if (width === 360) {
      page.on("response", (r) => {
        bytes += Number(r.headers()["content-length"] ?? 0);
        if (r.status() >= 400) failedReqs.push(`${r.status()} ${r.url().replace(base, "")}`);
      });
    }
    const resp = await page.goto(url, { waitUntil: "load" }).catch((e) => ({ error: e }));
    if (!resp || resp.error || resp.status() >= 400) {
      pageProblems.push(`page did not load (${resp?.error?.message ?? resp?.status?.()})`);
      await context.close();
      break;
    }
    await scrollThrough(page);

    if (width === 360) {
      const overflow = await page.evaluate(() => {
        const de = document.documentElement;
        if (de.scrollWidth <= de.clientWidth) return null;
        const offenders = [...document.querySelectorAll("body *")]
          .filter((el) => el.getBoundingClientRect().right > de.clientWidth + 1)
          .slice(0, 5)
          .map((el) => el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : ""));
        return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, offenders };
      });
      if (overflow) pageProblems.push(`horizontal overflow at 360px: scrollWidth ${overflow.scrollWidth} > ${overflow.clientWidth}; e.g. ${overflow.offenders.join(", ")}`);
      if (bytes > WEIGHT_LIMIT) pageProblems.push(`page weight ${(bytes / 1024).toFixed(0)} KB exceeds 1 MB`);
      for (const f of failedReqs) pageProblems.push(`failed request: ${f}`);
    }

    if (!noAxe && width !== 768) {
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]).analyze();
      for (const v of r.violations) {
        const key = v.id;
        const targets = v.nodes.map((n) => n.target.join(" ")).slice(0, 3);
        if (!axeSeen.has(key)) axeSeen.set(key, { v, widths: [width], targets });
        else axeSeen.get(key).widths.push(width);
      }
    }

    const png = await page.screenshot({ fullPage: true, type: "png" });
    fs.writeFileSync(path.join(outDir, `${slug}-${width}.png`), png);
    shots.push(png);
    await context.close();
  }

  for (const { v, widths, targets } of axeSeen.values()) {
    pageProblems.push(`axe ${v.impact ?? "n/a"}: ${v.id} x${v.nodes.length} at ${widths.join("/")}px  ${v.help}  [${targets.join(" | ")}]`);
  }

  if (shots.length === WIDTHS.length) {
    const sheetFile = path.join(outDir, `${slug}-sheet.jpg`);
    const size = await contactSheet(shots, sheetFile);
    sheets.push(`${path.relative(root, sheetFile)} (${size.width}x${size.height})`);
  }
  if (pageProblems.length) problems.push({ path: p, items: pageProblems });
}

await browser.close();
server?.closeAllConnections?.();
server?.close();

for (const pr of problems) {
  console.error(`\n${pr.path}`);
  for (const i of pr.items) console.error("  - " + i);
}
console.log(`\nContact sheets:\n  ${sheets.join("\n  ") || "(none)"}`);
if (problems.length) {
  console.error(`\nshots: ${problems.length} page(s) with problems`);
  process.exit(1);
}
console.log("shots: no overflow, no axe violations, weight OK");
