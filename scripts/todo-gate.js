// Launch gate: fails if any [[TODO placeholder is left in the built site (_site).
// Run by `npm run check` for a production build (ELEVENTY_ENV=production or Netlify CONTEXT=production),
// and by `npm run check:prod`. Local and preview builds show placeholders on purpose, for review.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const site = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."), "_site");
const hits = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(html|xml|txt|json|webmanifest)$/.test(e.name)) {
      const n = (fs.readFileSync(p, "utf8").match(/\[\[TODO/g) || []).length;
      if (n) hits.push([path.relative(site, p).split(path.sep).join("/"), n]);
    }
  }
};
walk(site);
if (hits.length) {
  const total = hits.reduce((a, [, n]) => a + n, 0);
  console.error(`todo-gate: ${total} [[TODO]] placeholder(s) on ${hits.length} file(s); a production build must have none (see TODO.md):`);
  for (const [f, n] of hits.slice(0, 40)) console.error(`  ${f}: ${n}`);
  if (hits.length > 40) console.error(`  ...and ${hits.length - 40} more`);
  process.exit(1);
}
console.log("todo-gate: no placeholders");
