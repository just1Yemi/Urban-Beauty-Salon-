// Processes the selected salon photos: crop, straighten, one warm grade,
// AVIF + WebP at responsive widths, plus a tiny blurred preview in src/_data/photos.json.
//
//   node scripts/process-photos.js            process every photo
//   node scripts/process-photos.js --sheet    also write screenshots/photos-contact.jpg (before/after pairs)
//   node scripts/process-photos.js --only=reception-desk,polish-wall
//
// Originals live in src/assets/img/source/ (git-ignored). Outputs go to src/assets/img/salon/.
// Crop boxes are fractions of the EXIF-oriented image: x, y (top-left) and w (width); the
// height follows from the ratio. `rotate` is a small straightening angle in degrees
// (positive = clockwise). If a rotation would expose empty corners the crop zooms in slightly.

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

sharp.cache(false);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src/assets/img/source");
const OUT = path.join(ROOT, "src/assets/img/salon");
const DATA = path.join(ROOT, "src/_data/photos.json");
const SHEET = path.join(ROOT, "screenshots/photos-contact.jpg");

const RATIOS = { "4:5": 4 / 5, "3:2": 3 / 2, "2:3": 2 / 3, "2:1": 2, "4:1": 4 };
const BASE_WIDTHS = [480, 960, 1600];
const HERO_WIDTH = 2400;

// One grade for every photo: gentle warmth, slightly lifted shadows, modest saturation.
const GRADE = {
  gain: [1.0, 0.985, 0.95],
  offset: [6, 5, 4],
  saturation: 1.05,
};

const PHOTOS = [
  {
    name: "reception-desk",
    source: "20260309_140735.jpg",
    ratio: "3:2",
    crop: { x: 0, y: 0.3, w: 1 },
    rotate: 0,
    use: "hero",
    hero: true,
    alt: "The reception desk, curved and covered in grey crushed velvet, with pampas grass in a white vase, a monitor, a ring light and printed leaflets in front of a glittered wall.",
  },
  {
    name: "reception-wide",
    source: "20260309_140653.jpg",
    ratio: "3:2",
    crop: { x: 0.05, y: 0.27, w: 0.95 },
    rotate: 0,
    use: "hero",
    hero: true,
    alt: "The reception area: a curved crushed-velvet desk in front of a glittered wall, with a ceiling-mounted oval light above.",
  },
  {
    name: "reception-desk-detail",
    source: "20260309_140817.jpg",
    ratio: "4:5",
    crop: { x: 0, y: 0.02, w: 0.85 },
    rotate: 0,
    use: "detail",
    alt: "Close view of the reception desk: tufted grey crushed velvet, pampas grass in a white vase, a monitor and leaflet stands against a glittered wall.",
  },
  {
    name: "reception-flowers-products",
    source: "20260309_140747.jpg",
    ratio: "4:5",
    // Starts below the ring light (top left of the frame) so no ring light or stand shows (final review, Stage 9).
    crop: { x: 0.03, y: 0.3, w: 0.7 },
    rotate: 0,
    use: "accent",
    alt: "Pale pink and white flowers in a glass vase beside boxed skincare products on the reception desk.",
  },
  {
    name: "polish-wall",
    source: "20260309_140446.jpg",
    ratio: "4:5",
    crop: { x: 0, y: 0.03, w: 1 },
    rotate: 0,
    use: "accent",
    alt: "Rows of gel nail polish bottles in a wall-mounted white ornate frame, arranged by colour.",
  },
  {
    name: "nail-stations",
    source: "20260309_140722.jpg",
    ratio: "3:2",
    crop: { x: 0, y: 0.24, w: 1 },
    rotate: 0,
    use: "room",
    hero: true,
    alt: "The nail area: white manicure desks with grey chairs, framed prints on the wall and a grey floor.",
  },
  {
    // Tight to the basin and couch head: leaves out the sockets, cables, radiator and wax heater.
    name: "treatment-room",
    source: "20260309_141501.jpg",
    ratio: "3:2",
    crop: { x: 0.4, y: 0.215, w: 0.56 },
    rotate: 0,
    use: "room",
    alt: "A treatment room: a white basin on a dark worktop above wood cabinets, the head of a couch dressed in white paper roll, and a magnifying lamp over a trolley of skincare products.",
  },
  {
    name: "relaxation-room",
    source: "20260309_141551.jpg",
    ratio: "4:5",
    crop: { x: 0, y: 0.05, w: 1 },
    rotate: 1.7,
    use: "room",
    alt: "The relaxation room: a grey sofa with silver cushions, a low dark table with a plant, a framed mirror on a dark feature wall and a light wood floor.",
  },
  {
    name: "relaxation-room-wide",
    source: "20260309_141603.jpg",
    ratio: "3:2",
    crop: { x: 0, y: 0.26, w: 1 },
    rotate: 1.7,
    use: "room",
    hero: true,
    alt: "The relaxation room from the doorway: two grey sofas either side of a low table with a plant, a mirror on the dark wall and a light wood floor.",
  },
  // ---- Art-directed crops (reviewer, Stage 1): one job each, no monitor, ring light or leaflets ----
  {
    name: "hero-desk",
    source: "20260309_140735.jpg",
    ratio: "3:2",
    crop: { x: 0.612, y: 0.447, w: 0.388 },
    rotate: 0,
    use: "hero (landscape screens)",
    hero: true,
    alt: "Pale pink and white flowers in glass vases and boxed skincare on the reception desk, with tufted grey crushed velvet below and a glittered wall behind.",
  },
  {
    name: "hero-desk-portrait",
    source: "20260309_140735.jpg",
    ratio: "2:3",
    crop: { x: 0.612, y: 0.43, w: 0.388 },
    rotate: 0,
    use: "hero (portrait screens)",
    widths: [480, 960, 1600],
    alt: "Pale pink and white flowers and boxed skincare on the reception desk, with tufted grey crushed velvet below and a glittered wall behind.",
  },
  {
    // Final review (Stage 9): a clean landscape of the desk for "Not sure" blocks, cards and heroes; starts right of
    // the monitor and remote and below the ring light.
    name: "desk-flowers",
    source: "20260309_140735.jpg",
    ratio: "3:2",
    crop: { x: 0.44, y: 0.475, w: 0.56 },
    rotate: 0,
    use: "detail",
    alt: "Pale pink and white flowers and boxed skincare on the curved crushed-velvet reception desk, in front of the glittered wall.",
  },
  {
    name: "velvet-band",
    source: "20260309_140735.jpg",
    ratio: "4:1",
    crop: { x: 0.12, y: 0.62, w: 0.76 },
    rotate: 0,
    use: "texture band",
    hero: true,
    alt: "Tufted grey crushed velvet on the front of the reception desk.",
  },
  {
    name: "polish-band",
    source: "20260309_140446.jpg",
    ratio: "2:1",
    crop: { x: 0, y: 0.22, w: 1 },
    rotate: 0,
    use: "image pause",
    hero: true,
    alt: "Rows of gel nail polish bottles in white ornate frames, arranged by colour.",
  },
  {
    name: "pampas",
    source: "20260309_140817.jpg",
    ratio: "4:5",
    crop: { x: 0, y: 0.1, w: 0.4 },
    rotate: 0,
    use: "accent",
    widths: [480, 960],
    alt: "Pampas grass plumes in front of the glittered reception wall.",
  },
  {
    name: "lash-print",
    source: "20260309_141140.jpg",
    ratio: "4:5",
    crop: { x: 0.14, y: 0.17, w: 0.7 },
    rotate: 0,
    use: "detail",
    alt: "A framed print of closed eyes with long lashes on a grey wall, in a white ornate frame.",
  },
  {
    name: "product-shelf-skincare",
    source: "20260309_142022.jpg",
    ratio: "3:2",
    crop: { x: 0.05, y: 0.06, w: 0.9 },
    rotate: 0,
    use: "detail",
    alt: "A white shelf of boxed skincare products in black and white packaging.",
  },
  {
    name: "product-shelf-serums",
    source: "20260309_142026.jpg",
    ratio: "3:2",
    crop: { x: 0.05, y: 0.06, w: 0.9 },
    rotate: 0,
    use: "detail",
    alt: "A white shelf of skincare boxes, a white tub and gold-coloured product cartons.",
  },
  {
    name: "product-shelf-mixed",
    source: "20260309_142031.jpg",
    ratio: "3:2",
    crop: { x: 0.05, y: 0.06, w: 0.9 },
    rotate: 0,
    use: "detail",
    alt: "A white shelf with nail treatment vials, tan mousse and lotion bottles and boxed beauty products.",
  },
  {
    name: "product-shelf-nail-care",
    source: "20260309_142035.jpg",
    ratio: "3:2",
    crop: { x: 0.05, y: 0.06, w: 0.9 },
    rotate: 0,
    use: "detail",
    alt: "A white shelf with small bottles of nail oil, boxed nail products and a pink manicure set.",
  },
];

function rad(deg) {
  return (deg * Math.PI) / 180;
}

// Rotate vector (x, y) clockwise on screen (y down) by deg.
function rot(x, y, deg) {
  const t = rad(deg);
  return [x * Math.cos(t) - y * Math.sin(t), x * Math.sin(t) + y * Math.cos(t)];
}

// Resolve the crop box in oriented-image pixels, zooming in if rotation would expose corners.
function resolveBox(photo, W, H) {
  const aspect = RATIOS[photo.ratio];
  const deg = photo.rotate || 0;
  let { x, y, w } = photo.crop;
  const cx0 = (x + w / 2) * W;
  const hFrac = (ww) => (ww * W) / (H * aspect);
  let cw, ch, cx, cy;
  for (let i = 0; i < 80; i++) {
    cw = w * W;
    ch = hFrac(w) * H;
    cx = Math.min(Math.max(cx0, cw / 2), W - cw / 2);
    cy = Math.min(Math.max((y + hFrac(photo.crop.w) / 2) * H, ch / 2), H - ch / 2);
    if (ch > H) {
      w *= 0.99;
      continue;
    }
    if (!deg) break;
    // Rotated crop centre, then check each box corner maps back inside the original.
    const [px, py] = rot(cx - W / 2, cy - H / 2, deg);
    let ok = true;
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        const [qx, qy] = rot(px + (sx * cw) / 2, py + (sy * ch) / 2, -deg);
        const ox = qx + W / 2;
        const oy = qy + H / 2;
        if (ox < 0 || ox > W || oy < 0 || oy > H) ok = false;
      }
    }
    if (ok) break;
    w *= 0.99;
  }
  return { cw, ch, cx, cy, deg, aspect };
}

async function gradeAndCut(photo) {
  const file = path.join(SRC, photo.source);
  const meta = await sharp(file, { limitInputPixels: false }).metadata();
  const swap = (meta.orientation || 1) >= 5;
  const W = swap ? meta.height : meta.width;
  const H = swap ? meta.width : meta.height;
  const box = resolveBox(photo, W, H);
  const maxOut = photo.widths ? Math.max(...photo.widths) : photo.hero ? HERO_WIDTH : BASE_WIDTHS[BASE_WIDTHS.length - 1];
  const s = Math.min(1, maxOut / box.cw);
  const Ws = Math.round(W * s);
  const Hs = Math.round(H * s);

  // Oriented working copy at just enough resolution for the largest output.
  let work = await sharp(file, { limitInputPixels: false })
    .rotate()
    .resize(Ws, Hs, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let buf = work.data;
  let info = work.info;
  let cxs = box.cx * s;
  let cys = box.cy * s;
  const cws = box.cw * s;
  const chs = box.ch * s;

  if (box.deg) {
    const r = await sharp(buf, { raw: { width: info.width, height: info.height, channels: info.channels } })
      .rotate(box.deg, { background: "#7a7570" })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const [vx, vy] = rot(cxs - Ws / 2, cys - Hs / 2, box.deg);
    cxs = r.info.width / 2 + vx;
    cys = r.info.height / 2 + vy;
    buf = r.data;
    info = r.info;
  }

  const outW = Math.round(cws);
  const outH = Math.round(outW / box.aspect);
  let left = Math.round(cxs - outW / 2);
  let top = Math.round(cys - outH / 2);
  left = Math.max(0, Math.min(left, info.width - outW));
  top = Math.max(0, Math.min(top, info.height - outH));

  const graded = await sharp(buf, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .extract({ left, top, width: outW, height: outH })
    .linear(GRADE.gain, GRADE.offset)
    .modulate({ saturation: GRADE.saturation })
    .png({ compressionLevel: 1 })
    .toBuffer();

  return { graded, outW, outH, srcW: W, srcH: H, box, scale: s };
}

async function main() {
  const args = process.argv.slice(2);
  const wantSheet = args.includes("--sheet");
  const onlyArg = args.find((a) => a.startsWith("--only="));
  const only = onlyArg ? onlyArg.slice(7).split(",") : null;

  fs.mkdirSync(OUT, { recursive: true });
  let existing = {};
  try {
    existing = JSON.parse(fs.readFileSync(DATA, "utf8"));
  } catch {}
  const result = {};
  const pairs = [];

  for (const photo of PHOTOS) {
    if (only && !only.includes(photo.name)) {
      if (existing[photo.name]) result[photo.name] = existing[photo.name];
      continue;
    }
    const t0 = Date.now();
    const { graded, outW, outH, srcW, srcH, box, scale } = await gradeAndCut(photo);
    const aspect = RATIOS[photo.ratio];
    const widths = (photo.widths || [...BASE_WIDTHS, ...(photo.hero ? [HERO_WIDTH] : [])]).filter((w) => w <= outW * 1.02);
    const made = [];
    for (const w of widths) {
      const h = Math.round(w / aspect);
      const resized = () => sharp(graded).resize(w, h, { fit: "fill", kernel: "lanczos3" }).sharpen({ sigma: 0.5 });
      await resized().avif({ quality: 52, effort: 4 }).toFile(path.join(OUT, `${photo.name}-${w}.avif`));
      await resized().webp({ quality: 76, effort: 5 }).toFile(path.join(OUT, `${photo.name}-${w}.webp`));
      made.push(w);
    }
    // Remove stale sizes from earlier runs.
    for (const f of fs.readdirSync(OUT)) {
      const m = f.match(new RegExp(`^${photo.name}-(\\d+)\\.(avif|webp)$`));
      if (m && !made.includes(Number(m[1]))) fs.unlinkSync(path.join(OUT, f));
    }
    const top = made[made.length - 1];
    const prev = await sharp(graded)
      .resize(24, Math.round(24 / aspect), { fit: "fill" })
      .blur(1)
      .webp({ quality: 45 })
      .toBuffer();
    result[photo.name] = {
      name: photo.name,
      alt: photo.alt,
      use: photo.use,
      ratio: photo.ratio,
      width: top,
      height: Math.round(top / aspect),
      widths: made,
      formats: ["avif", "webp"],
      path: `/assets/img/salon/${photo.name}`,
      preview: `data:image/webp;base64,${prev.toString("base64")}`,
    };
    if (wantSheet) pairs.push({ photo, box, srcW, srcH });
    const sz = fs.statSync(path.join(OUT, `${photo.name}-${made.filter((w) => w <= 1600).pop()}.avif`)).size;
    console.log(
      `${photo.name}: ${made.join("/")} px, crop ${Math.round(box.cw)}px wide (work x${scale.toFixed(2)}), ` +
        `1600 avif ${(sz / 1024).toFixed(0)} KB, ${Date.now() - t0} ms`
    );
  }

  // Keep the file in the order of the PHOTOS list.
  const ordered = {};
  for (const p of PHOTOS) if (result[p.name]) ordered[p.name] = result[p.name];
  fs.writeFileSync(DATA, JSON.stringify(ordered, null, 2) + "\n");

  if (wantSheet) await contactSheet(pairs);
}

// One downscaled sheet: for each photo the source (with the crop box drawn) beside the result.
async function contactSheet(pairs) {
  const CW = 230; // each image cell width
  const CH = 290;
  const GAP = 4;
  const LH = 16;
  const pairsPerRow = 4;
  const rows = Math.ceil(pairs.length / pairsPerRow);
  const cellW = CW * 2 + GAP * 3;
  const cellH = CH + LH + GAP;
  const comps = [];
  for (let i = 0; i < pairs.length; i++) {
    const { photo, box, srcW, srcH } = pairs[i];
    const ox = (i % pairsPerRow) * cellW;
    const oy = Math.floor(i / pairsPerRow) * cellH;
    const sw = srcW / 1; // oriented dims
    const before = await sharp(path.join(SRC, photo.source), { limitInputPixels: false })
      .rotate()
      .resize(CW, CH, { fit: "inside" })
      .toBuffer({ resolveWithObject: true });
    const k = before.info.width / sw;
    const rx = (box.cx - box.cw / 2) * k;
    const ry = (box.cy - box.ch / 2) * k;
    const rect = `<svg width="${before.info.width}" height="${before.info.height}" xmlns="http://www.w3.org/2000/svg"><rect x="${rx}" y="${ry}" width="${box.cw * k}" height="${box.ch * k}" fill="none" stroke="#ff2d55" stroke-width="2"/></svg>`;
    const b = await sharp(before.data).composite([{ input: Buffer.from(rect) }]).png().toBuffer();
    const after = await sharp(path.join(OUT, `${photo.name}-480.webp`)).resize(CW, CH, { fit: "inside" }).png().toBuffer();
    // vertical guide lines on the result to judge straightness
    const ai = await sharp(after).metadata();
    let g = "";
    for (let j = 1; j < 10; j++) g += `<line x1="${(ai.width * j) / 10}" y1="0" x2="${(ai.width * j) / 10}" y2="${ai.height}" stroke="rgba(255,255,0,0.3)"/>`;
    const a = await sharp(after)
      .composite([{ input: Buffer.from(`<svg width="${ai.width}" height="${ai.height}" xmlns="http://www.w3.org/2000/svg">${g}</svg>`) }])
      .png()
      .toBuffer();
    comps.push({ input: b, left: ox + GAP, top: oy + LH });
    comps.push({ input: a, left: ox + GAP * 2 + CW, top: oy + LH });
    comps.push({
      input: Buffer.from(
        `<svg width="${cellW}" height="${LH}" xmlns="http://www.w3.org/2000/svg"><text x="${GAP}" y="12" font-size="12" font-family="Arial" fill="#fff">${photo.name} (${photo.ratio}, rot ${photo.rotate || 0})</text></svg>`
      ),
      left: ox,
      top: oy,
    });
  }
  fs.mkdirSync(path.dirname(SHEET), { recursive: true });
  await sharp({ create: { width: cellW * pairsPerRow, height: cellH * rows, channels: 3, background: "#333" } })
    .composite(comps)
    .jpeg({ quality: 70 })
    .toFile(SHEET);
  console.log(`Contact sheet: ${SHEET}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
