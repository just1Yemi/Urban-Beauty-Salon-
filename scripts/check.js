// npm run check: build, then contrast check, compliance check, then link check.
// A production build (ELEVENTY_ENV=production, Netlify CONTEXT=production, or `npm run check:prod`) also runs the
// launch gate: no [[TODO]] placeholder may be left in _site.
// Prints failures only; exits non-zero if any step fails.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const steps = [
  ["build", [path.join(root, "node_modules/@11ty/eleventy/cmd.cjs"), "--quiet"]],
  ["contrast", [path.join(root, "scripts/contrast-check.js")]],
  ["compliance", [path.join(root, "scripts/compliance-check.js")]],
  ["links", [path.join(root, "scripts/link-check.js")]],
  ["seo", [path.join(root, "scripts/seo-check.js")]],
];
if (process.argv.includes("--production")) process.env.ELEVENTY_ENV = "production";
const production = process.env.CONTEXT === "production" || process.env.ELEVENTY_ENV === "production";
if (production) steps.push(["todo-gate", [path.join(root, "scripts/todo-gate.js")]]);
// Start from an empty _site, so pages taken off the site (permalink: false) or the dev-only style guide
// left over from an earlier build are never checked or reported.
fs.rmSync(path.join(root, "_site"), { recursive: true, force: true });
let failed = false;
for (const [name, args] of steps) {
  const r = spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
  if (r.status !== 0) {
    failed = true;
    console.error(`\nFAILED: ${name}`);
    const out = ((r.stdout || "") + (r.stderr || "")).trim();
    if (out) console.error(out.split("\n").slice(0, 60).join("\n"));
    break; // later steps depend on earlier ones
  }
}
if (failed) process.exit(1);
console.log(`check passed: build, contrast, compliance, links, seo${production ? ", todo-gate (production)" : ""}`);
