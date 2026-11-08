// Inline-ready logo data, read from the logo pack SVGs in src/assets/img/brand/ (never redrawn).
// For each variant: { viewBox, w, h, inner, mask }.
//   inner: the logo's own paths, unchanged (colour comes from currentColor).
//   mask:  centre-lines of every stroke, used ONLY during the once-per-session draw-in;
//          they trace the letters in, then the mask is removed and the exact logo remains.
import fs from "node:fs";

const DIR = "src/assets/img/brand";
const num = (s) => s.match(/-?\d*\.?\d+/g).map(Number);
const f = (n) => +n.toFixed(2);

function centreLine(d, attrs) {
  // Stroked path: reuse it, wider so the mask covers the stroke fully.
  const sw = attrs.match(/stroke-width="([\d.]+)"/);
  if (sw) return { d, w: +sw[1] * 2.2 };
  // Rectangle "MxyHxVyHxZ": a bar; trace along its long side.
  let m = d.match(/^M(-?[\d.]+) (-?[\d.]+)H(-?[\d.]+)V(-?[\d.]+)H(-?[\d.]+)Z$/);
  if (m) {
    const [x0, y0, x1, y1] = [+m[1], +m[2], +m[3], +m[4]];
    const w = Math.abs(x1 - x0), h = Math.abs(y1 - y0);
    return h >= w
      ? { d: `M${f((x0 + x1) / 2)} ${f(y0)}V${f(y1)}`, w: w * 2.4 }
      : { d: `M${f(x0)} ${f((y0 + y1) / 2)}H${f(x1)}`, w: h * 2.4 };
  }
  // Polygon of straight segments: 4 points = slanted bar, 6 points = the open "Λ" A.
  if (/^M[\d.\s-]+(L[\d.\s-]+)+Z$/.test(d)) {
    const n = num(d), p = [];
    for (let i = 0; i < n.length; i += 2) p.push([n[i], n[i + 1]]);
    const mid = (a, b) => [f((a[0] + b[0]) / 2), f((a[1] + b[1]) / 2)];
    const thick = Math.hypot(p[0][0] - p[p.length - 1][0], p[0][1] - p[p.length - 1][1]);
    let pts;
    if (p.length === 4) pts = [mid(p[0], p[1]), mid(p[2], p[3])];
    else if (p.length === 6) pts = [mid(p[0], p[5]), mid(p[1], p[4]), mid(p[2], p[3])];
    if (pts) return { d: "M" + pts.map((q) => q.join(" ")).join("L"), w: Math.max(thick, Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1])) * 2.4 };
  }
  throw new Error("logos.js: unrecognised logo path " + d);
}

function load(name) {
  const svg = fs.readFileSync(`${DIR}/urban-beauty-${name}-espresso.svg`, "utf8");
  const viewBox = svg.match(/viewBox="([^"]+)"/)[1];
  const [, , w, h] = viewBox.split(/\s+/).map(Number);
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/<title>[\s\S]*?<\/title>/, "");
  let i = 0;
  const mask = inner.replace(/<path d="([^"]+)"([^>]*)\/>/g, (all, d, attrs) => {
    const c = centreLine(d, attrs);
    return `<path d="${c.d}" stroke-width="${f(c.w)}" pathLength="1" style="--i:${i++}"/>`;
  });
  return { viewBox, w, h, inner, mask, strokes: i };
}

export default function () {
  const out = {};
  for (const name of ["primary", "secondary", "tertiary", "icon"]) out[name] = load(name);
  return out;
}
