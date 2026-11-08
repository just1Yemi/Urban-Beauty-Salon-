// Copies the self-hosted latin-subset woff2 fonts from @fontsource into src/assets/fonts.
// Usage: npm run fonts   (only needed after upgrading the @fontsource packages)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "src/assets/fonts");
const FONTS = { jost: [300, 400, 500], inter: [400, 500, 600] };
fs.mkdirSync(out, { recursive: true });
for (const [family, weights] of Object.entries(FONTS)) {
  for (const w of weights) {
    const file = `${family}-latin-${w}-normal.woff2`;
    fs.copyFileSync(path.join(root, "node_modules/@fontsource", family, "files", file), path.join(out, file));
  }
}
console.log("fonts copied to src/assets/fonts");
