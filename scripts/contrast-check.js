// Contrast check: every text/background pair in the tokens must meet WCAG AA (4.5:1),
// and Champagne may only colour text on dark surfaces (graphics such as icons and
// hairlines are allowed anywhere). Prints failures only. Exit 1 on any failure.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
const { computePairs } = await import(pathToFileURL(path.join(root, "scripts/palette-lib.js")).href);

const fails = [];
for (const p of computePairs()) {
  if (!p.forbidden && !p.pass) fails.push(`${p.fg} on ${p.bg}: ${p.ratio}:1 is below ${p.min}:1 (${p.use})`);
}

// Static scan: selectors that set color: var(--c-champagne)
const DARK = /\.on-dark|footer|\.menu|\.hero|\.section--dark/;
const GRAPHIC = /icon|mark|seal|rule|watermark|placeholder__icon/;
for (const f of ["base", "layout", "components"]) {
  const css = fs.readFileSync(`src/assets/css/${f}.css`, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/(^|;|\s)color:\s*var\(--c-champagne\)/.test(m[2])) continue;
    for (const sel of m[1].split(",").map((s) => s.trim())) {
      if (!DARK.test(sel) && !GRAPHIC.test(sel)) fails.push(`${f}.css: "${sel}" sets Champagne text outside a dark surface`);
    }
  }
}

if (fails.length) {
  console.error(`Contrast check FAILED: ${fails.length} problem(s)`);
  for (const x of fails) console.error("  " + x);
  process.exit(1);
}
console.log(`Contrast check passed (${computePairs().filter((p) => !p.forbidden).length} pairs AA or better)`);
