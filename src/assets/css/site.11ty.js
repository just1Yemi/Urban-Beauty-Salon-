// Publishes the design-system CSS as ONE small file: /assets/css/site.css
// Sources (edit these, never the output): tokens.css, base.css, layout.css, components.css
import fs from "node:fs";

const FILES = ["tokens", "base", "layout", "components"];

export const data = { permalink: "/assets/css/site.css", eleventyExcludeFromCollections: true };

export function render() {
  return FILES.map((f) => fs.readFileSync(`src/assets/css/${f}.css`, "utf8"))
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{};])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}
