// npm run check: build, then compliance check, then link check.
// Prints failures only; exits non-zero if any step fails.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const steps = [
  ["build", [path.join(root, "node_modules/@11ty/eleventy/cmd.cjs"), "--quiet"]],
  ["compliance", [path.join(root, "scripts/compliance-check.js")]],
  ["links", [path.join(root, "scripts/link-check.js")]],
];
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
console.log("check passed: build, compliance, links");
