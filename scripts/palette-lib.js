// Colour tokens read from src/assets/css/tokens.css (the single source), plus every
// text/background pair the design system uses, with its WCAG contrast ratio.
// Used by src/_data/palette.js (style guide) and scripts/contrast-check.js (npm run check).
import fs from "node:fs";

export const PAIRS = [
  // [text, background, where it is used, minimum ratio (null = forbidden as text)]
  ["espresso", "ivory", "Body text and headings on Ivory", 4.5],
  ["espresso", "ivory-deep", "Text on the deep Ivory band and placeholders", 4.5],
  ["espresso", "white", "Text on White review cards", 4.5],
  ["text-soft", "ivory", "Secondary text and labels on Ivory", 4.5],
  ["text-soft", "ivory-deep", "Secondary text on the deep Ivory band", 4.5],
  ["text-soft", "white", "Secondary text on White cards", 4.5],
  ["text-soft", "ivory-shade", "Labels on photo placeholders", 4.5],
  ["ivory", "espresso", "Text on Espresso (footer, menu, buttons)", 4.5],
  ["ivory-soft", "espresso", "Secondary text on Espresso", 4.5],
  ["champagne", "espresso", "Champagne labels and ampersand on Espresso", 4.5],
  ["espresso", "champagne", "Button label on the Champagne hover fill", 4.5],
  ["ivory", "espresso-deep", "Text on the darkest Espresso", 4.5],
  ["champagne", "ivory", "Champagne text on Ivory: NOT ALLOWED (hairlines and icons only)", null],
  ["champagne", "white", "Champagne text on White: NOT ALLOWED", null],
];

const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
export const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

export function readTokens(file = "src/assets/css/tokens.css") {
  const css = fs.readFileSync(file, "utf8");
  return Object.fromEntries([...css.matchAll(/--c-([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2].toUpperCase()]));
}

export function computePairs(tokens = readTokens()) {
  return PAIRS.map(([fg, bg, use, min]) => {
    const r = ratio(tokens[fg], tokens[bg]);
    const level = r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA large" : "Fail";
    return { fg, bg, fgHex: tokens[fg], bgHex: tokens[bg], use, min, ratio: Math.round(r * 100) / 100, level, forbidden: min === null, pass: min === null ? true : r >= min };
  });
}

export function paletteData() {
  const tokens = readTokens();
  return { tokens, pairs: computePairs(tokens) };
}
