// npm run lh -- /facials/dermaplaning/ /facials/ [--base http://localhost:8080] [--json dir]
// Mobile Lighthouse (default mobile config: Moto G emulation, simulated slow 4G) on each path,
// served from _site by the local static server (or --base). Uses Playwright's Chromium.
// Prints the four category scores, key timings and every failing audit (cache and compression
// findings come from the local server: Netlify sets those headers in production).
// Exit 1 if a page misses the quality bar: Performance 95+, Accessibility 100, SEO 100.
// Run `npm run build` first.
import fs from "node:fs";
import path from "node:path";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import { chromium } from "playwright";
import { startServer, siteDir, root } from "./static-server.js";

const BAR = { performance: 95, accessibility: 100, seo: 100 };
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); if (i === -1) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
let base = opt("--base");
const jsonDir = opt("--json");
// Git Bash rewrites a leading "/" into "C:/Program Files/Git/": undo that.
const paths = args.filter((a) => !a.startsWith("--")).map((a) => a.replace(/^[A-Za-z]:[\/]Program Files[\/]Git[\/]?/, "/"));
if (!paths.length) paths.push("/");

let server;
if (!base) {
  if (!fs.existsSync(siteDir)) { console.error("lh: _site not found. Run npm run build first."); process.exit(1); }
  server = await startServer();
  base = `http://127.0.0.1:${server.address().port}`;
}

// A fresh browser per page, so one page's work never shows up in the next page's trace.
const launch = () => chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ["--headless=new", "--no-first-run", "--disable-gpu"] });
const kill = async (c) => { try { await c.kill(); } catch { /* Windows may keep the temp profile locked */ } };
let failed = 0;
try {
  for (const p of paths) {
    const url = new URL(p, base).href;
    const chrome = await launch();
    let lhr;
    try {
      ({ lhr } = await lighthouse(url, { port: chrome.port, output: "json", logLevel: "error", onlyCategories: ["performance", "accessibility", "best-practices", "seo"] }));
    } finally { await kill(chrome); }
    if (jsonDir) {
      fs.mkdirSync(path.resolve(root, jsonDir), { recursive: true });
      fs.writeFileSync(path.resolve(root, jsonDir, (p.replace(/^\/+|\/+$/g, "").replace(/[^a-z0-9]+/gi, "-") || "home") + ".json"), JSON.stringify(lhr));
    }
    const score = (k) => Math.round((lhr.categories[k]?.score ?? 0) * 100);
    const scores = { performance: score("performance"), accessibility: score("accessibility"), "best-practices": score("best-practices"), seo: score("seo") };
    const misses = Object.entries(BAR).filter(([k, min]) => scores[k] < min);
    const a = lhr.audits;
    const t = (id) => a[id]?.displayValue ?? "n/a";
    console.log(`\n${p}  Performance ${scores.performance} · Accessibility ${scores.accessibility} · Best practices ${scores["best-practices"]} · SEO ${scores.seo}`);
    console.log(`  LCP ${t("largest-contentful-paint")} · FCP ${t("first-contentful-paint")} · TBT ${t("total-blocking-time")} · CLS ${t("cumulative-layout-shift")} · Speed index ${t("speed-index")} · Weight ${t("total-byte-weight")}`);
    const ids = new Set(Object.values(lhr.categories).flatMap((c) => c.auditRefs.map((r) => r.id)));
    const failing = [...ids].map((id) => a[id]).filter((au) => au && au.score !== null && au.score < 0.9 && !["informative", "notApplicable", "manual"].includes(au.scoreDisplayMode));
    for (const au of failing) console.log(`  - ${au.id}: ${au.title}${au.displayValue ? " (" + au.displayValue + ")" : ""}`);
    if (lhr.runWarnings?.length) for (const w of lhr.runWarnings) console.log(`  ! ${w.replace(/\s+/g, " ").slice(0, 200)}`);
    if (misses.length) { failed++; console.log(`  BELOW THE BAR: ${misses.map(([k, min]) => `${k} ${scores[k]} < ${min}`).join(", ")}`); }
  }
} finally {
  server?.closeAllConnections?.();
  server?.close();
}
if (failed) { console.error(`\nlh: ${failed} page(s) below the quality bar`); process.exit(1); }
console.log("\nlh: every page meets the quality bar");
