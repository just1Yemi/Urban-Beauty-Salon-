// Brand map for the home and contact pages (BUILD_PLAN Stage 3).
//
//   node scripts/make-map.js            render from the cached OpenStreetMap data
//   node scripts/make-map.js --refresh  fetch the data again from the Overpass API first
//
// The OpenStreetMap data (small area around the salon) is fetched once from the public Overpass
// API and cached in scripts/data/osm-penketh.json, so the render is repeatable offline.
// Output: src/_includes/map.svg, an inline SVG in the brand palette (Espresso ground, Ivory and
// Champagne roads, buildings as faint tints, three street labels in tracked caps). It is inlined by
// the `map` macro in ui.njk, so the labels use the page's own font. The salon marker (the UB circle
// icon) is HTML laid over the map by the macro, so this SVG is drawn so the salon sits exactly
// under it: 50% across and 42% down (see .map__pin in components.css).
// Data (c) OpenStreetMap contributors, ODbL: the credit line is shown under the map.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(root, "scripts/data/osm-penketh.json");
const OUT = path.join(root, "src/_includes/map.svg");

// Marker: the north bar of the Honiton Way Shops precinct (OSM way 988133651), just south of
// Meeting Lane, between William Penn Close and Greystone Road, towards the Penketh Pool and
// Community Centre end. Position from Yemi's Google Maps screenshot description (8 Nov 2026);
// the screenshot itself is not used or traced. Approximate by design: it points at the building,
// not at a doorway. Origin of the local grid (metres) below is this point.
const SALON = { lat: 53.38711, lon: -2.65585 };
const BBOX = "53.3830,-2.6640,53.3910,-2.6460"; // south,west,north,east
const W = 1200, H = 800, PX = 2.4; // px per metre: about 500 m by 333 m on screen
const AX = 0.5, AY = 0.42; // salon position in the frame
const P = (n, d = 1) => +n.toFixed(d);

async function load() {
  if (process.argv.includes("--refresh") || !fs.existsSync(CACHE)) {
    const q = `[out:json][timeout:60];(way["highway"](${BBOX});way["building"](${BBOX});way["leisure"~"park|pitch|playground|garden"](${BBOX});way["landuse"~"grass|recreation_ground"](${BBOX});way["natural"="water"](${BBOX}););out geom tags;`;
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", "user-agent": "UrbanBeautyWebsiteBuild/1.0 (hello@theurbanbeautysalon.co.uk)" },
      body: "data=" + encodeURIComponent(q),
    });
    if (!res.ok) throw new Error("Overpass request failed: " + res.status);
    fs.mkdirSync(path.dirname(CACHE), { recursive: true });
    fs.writeFileSync(CACHE, JSON.stringify(slim(await res.json())));
  }
  const j = JSON.parse(fs.readFileSync(CACHE, "utf8"));
  if (j.elements.some((e) => e.nodes || e.bounds)) fs.writeFileSync(CACHE, JSON.stringify(slim(j)));
  return j.elements;
}

// Keep only what the render needs: tags that decide the style, and the outline as [lat, lon].
function slim(j) {
  const keep = ["name", "highway", "building", "leisure", "landuse", "natural"];
  return {
    attribution: "(c) OpenStreetMap contributors, ODbL. Fetched from the Overpass API for scripts/make-map.js.",
    elements: j.elements.filter((e) => e.geometry).map((e) => ({
      id: e.id,
      tags: Object.fromEntries(keep.filter((k) => e.tags?.[k]).map((k) => [k, e.tags[k]])),
      g: e.geometry.map((p) => [+p.lat.toFixed(6), +p.lon.toFixed(6)]),
    })),
  };
}

const elements = (await load()).map((e) => ({ ...e, g: e.g ?? e.geometry.map((p) => [p.lat, p.lon]) }));

const mx = 111320 * Math.cos((SALON.lat * Math.PI) / 180), my = 111200;
const proj = ([lat, lon]) => [W * AX + (lon - SALON.lon) * mx * PX, H * AY - (lat - SALON.lat) * my * PX];
const pts = (e) => e.g.map(proj);
const onScreen = (ps, m = 40) => ps.some(([x, y]) => x > -m && x < W + m && y > -m && y < H + m);
// Open path as "M x y l dx dy ..." in integer-ish pixels (relative moves keep the file small).
const line = (ps) => {
  let d = "", px = 0, py = 0;
  ps.forEach(([x, y], i) => {
    const rx = P(x), ry = P(y);
    d += i ? `l${P(rx - px)} ${P(ry - py)}` : `M${rx} ${ry}`;
    px = rx; py = ry;
  });
  return d;
};
const ring = (ps) => line(ps) + "z";

const groups = { green: [], building: [], precinct: [], foot: [], service: [], res: [], minor: [], main: [] };
const named = {};
for (const e of elements) {
  const t = e.tags, ps = pts(e);
  if (!onScreen(ps)) continue;
  if (t.building) (e.id === 988133651 || e.id === 988133650 || e.id === 31429210 ? groups.precinct : groups.building).push(ring(ps));
  else if (t.leisure || t.landuse || t.natural) groups.green.push(ring(ps));
  else if (t.highway) {
    const h = t.highway;
    const g = ["footway", "path", "pedestrian", "track", "steps"].includes(h) ? "foot"
      : h === "service" ? "service" : h === "residential" || h === "unclassified" ? "res"
      : ["tertiary", "tertiary_link"].includes(h) ? "minor" : "main";
    groups[g].push(line(ps));
    if (t.name && ["Meeting Lane", "Honiton Way", "Greystone Road"].includes(t.name)) (named[t.name] ??= []).push(ps);
  }
}

// Street labels along the longest on-screen stretch of each road, read left to right (or upwards).
const labelText = { "Meeting Lane": "Meeting Ln", "Honiton Way": "Honiton Way", "Greystone Road": "Greystone Rd" };
const labelAt = { "Meeting Lane": 0.62, "Honiton Way": 0.5, "Greystone Road": 0.5 }; // fraction of the stretch where the label starts
const len = (ps) => ps.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - ps[i][0], p[1] - ps[i][1]), 0);
let labels = "", paths = "";
let n = 0;
for (const [name, list] of Object.entries(named)) {
  // join the pieces of the road into one chain when they meet end to end, then take the longest
  let best = list.reduce((a, b) => (len(b) > len(a) ? b : a));
  let chain = best.filter(([x, y]) => x > -20 && x < W + 20 && y > -20 && y < H + 20);
  const vertical = Math.abs(chain.at(-1)[1] - chain[0][1]) > Math.abs(chain.at(-1)[0] - chain[0][0]);
  if (vertical ? chain[0][1] < chain.at(-1)[1] : chain[0][0] > chain.at(-1)[0]) chain = [...chain].reverse();
  const id = "r" + ++n;
  paths += `<path id="${id}" d="${line(chain)}"/>`;
  const text = labelText[name];
  const total = len(chain), start = Math.max(8, total * labelAt[name] - 80);
  labels += `<text dy="-13"><textPath href="#${id}" startOffset="${Math.round(Math.min(start, total - 220))}">${text}</textPath></text>`;
}

const svg = `<svg class="map__svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
<rect width="${W}" height="${H}" fill="#3B302A"/>
<path d="${groups.green.join("")}" fill="#C6A77D" fill-opacity=".09"/>
<path d="${groups.building.join("")}" fill="#F6F1EA" fill-opacity=".11"/>
<path d="${groups.precinct.join("")}" fill="#C6A77D" fill-opacity=".34"/>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="${groups.foot.join("")}" stroke="#C6A77D" stroke-opacity=".4" stroke-width="1" stroke-dasharray="2 3"/>
<path d="${groups.service.join("")}" stroke="#C6A77D" stroke-opacity=".5" stroke-width="3.4"/>
<path d="${groups.res.join("")}" stroke="#C6A77D" stroke-opacity=".78" stroke-width="7"/>
<path d="${groups.minor.join("")}" stroke="#F6F1EA" stroke-opacity=".9" stroke-width="11"/>
<path d="${groups.main.join("")}" stroke="#F6F1EA" stroke-opacity=".9" stroke-width="14"/>
</g>
<defs>${paths}</defs>
<g fill="#F6F1EA" stroke="#3B302A" stroke-width="7" stroke-linejoin="round" paint-order="stroke" style="font:500 21px/1 var(--font-body,Inter,Arial,sans-serif);letter-spacing:.22em;text-transform:uppercase">${labels}</g>
</svg>
`;
fs.writeFileSync(OUT, svg);
const bytes = Buffer.byteLength(svg);
console.log(`map.svg ${(bytes / 1024).toFixed(1)} KB, ${Object.entries(groups).map(([k, v]) => k + " " + v.length).join(", ")}; labels: ${Object.keys(named).join(", ")}`);
if (bytes > 60 * 1024) { console.error("map.svg is over 60 KB"); process.exit(1); }
