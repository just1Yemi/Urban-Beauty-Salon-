// Team portraits: realistic retouching only (crop, exposure, one shared warm grade, un-mirror).
// No changes to faces, features or expressions.
//
//   node scripts/process-team.js          process all portraits and update src/_data/photos.json
//   node scripts/process-team.js --sheet  also write screenshots/team-contact.jpg (before/after)
//
// Originals are copied from Downloads into src/assets/img/source/team/ (git-ignored) so the
// script can be re-run. Crop boxes are in pixels of the EXIF-oriented original, ratio 4:5.

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

sharp.cache(false);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOWNLOADS = "C:/Users/olaye/Downloads";
const SRC = path.join(ROOT, "src/assets/img/source/team");
const OUT = path.join(ROOT, "src/assets/img/team");
const DATA = path.join(ROOT, "src/_data/photos.json");
const SHEET = path.join(ROOT, "screenshots/team-contact.jpg");
const WIDTHS = [240, 480, 960];
const OUT_H = 1200; // working size before resizing to the published widths (4:5 -> 960 x 1200)

// Shared grade, a touch gentler than the salon photos so skin stays natural.
const GRADE = { gain: [1.0, 0.985, 0.955], offset: [5, 4, 3], saturation: 0.97 };
const TARGET_LUMA = 124; // every portrait is brought towards the same overall brightness

const TEAM = [
  { name: "team-rachel", file: "Rachel.jpg", crop: { x: 120, y: 62, w: 680 }, alt: "Portrait of Rachel Crookes, Salon Manager and Beauty Therapist." },
  { name: "team-jill", file: "Jill.png", crop: { x: 100, y: 0, w: 400 }, alt: "Portrait of Jill Taylor, Beauty Therapist." },
  // The original is a collage-app export: crop inside the photo, clear of the blurred border and watermark.
  { name: "team-joanne", file: "Joanne.jpg", crop: { x: 80, y: 450, w: 760 }, alt: "Portrait of Joanne Prior, Beauty Therapist." },
  // Front-camera selfie: flip so it reads the right way round.
  { name: "team-isla", file: "Isla.jpg", crop: { x: 716, y: 40, w: 840 }, flip: true, alt: "Portrait of Isla Duffy, Beauty Therapist." },
];

fs.mkdirSync(SRC, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const makeSheet = process.argv.includes("--sheet");
const pairs = [];
const data = JSON.parse(fs.readFileSync(DATA, "utf8"));

for (const t of TEAM) {
  const local = path.join(SRC, t.file);
  if (!fs.existsSync(local)) fs.copyFileSync(path.join(DOWNLOADS, t.file), local);

  const oriented = await sharp(local).rotate().toBuffer();
  const meta = await sharp(oriented).metadata();
  const h = Math.round(t.crop.w * 5 / 4);
  const box = {
    left: Math.max(0, t.crop.x),
    top: Math.max(0, t.crop.y),
    width: Math.min(t.crop.w, meta.width - t.crop.x),
    height: Math.min(h, meta.height - t.crop.y),
  };

  let img = sharp(oriented).extract(box);
  if (t.flip) img = img.flop();
  const cropped = await img.resize({ width: 960, height: OUT_H, fit: "cover", kernel: "lanczos3" }).toBuffer();

  // Exposure: nudge mean brightness towards the shared target (kept within a natural range).
  const stats = await sharp(cropped).stats();
  const luma = 0.2126 * stats.channels[0].mean + 0.7152 * stats.channels[1].mean + 0.0722 * stats.channels[2].mean;
  const brightness = Math.min(1.08, Math.max(0.92, TARGET_LUMA / luma));

  const graded = await sharp(cropped)
    .modulate({ brightness, saturation: GRADE.saturation })
    .linear(GRADE.gain, GRADE.offset)
    .sharpen({ sigma: 0.6 })
    .toBuffer();

  for (const w of WIDTHS) {
    const hh = Math.round(w * 5 / 4);
    const base = path.join(OUT, `${t.name}-${w}`);
    await sharp(graded).resize(w, hh).avif({ quality: 55, effort: 6 }).toFile(`${base}.avif`);
    await sharp(graded).resize(w, hh).webp({ quality: 78 }).toFile(`${base}.webp`);
  }
  const prev = await sharp(graded).resize(20, 25).blur(1).webp({ quality: 40 }).toBuffer();

  data[t.name] = {
    name: t.name,
    alt: t.alt,
    use: "portrait",
    ratio: "4:5",
    width: 960,
    height: 1200,
    widths: WIDTHS,
    formats: ["avif", "webp"],
    path: `/assets/img/team/${t.name}`,
    preview: `data:image/webp;base64,${prev.toString("base64")}`,
  };
  console.log(`${t.name}: crop ${box.width}x${box.height}${t.flip ? ", flipped" : ""}, brightness x${brightness.toFixed(2)}`);

  if (makeSheet) {
    const before = await sharp(oriented).resize(400, 500, { fit: "contain", background: "#ffffff" }).toBuffer();
    const after = await sharp(graded).resize(400, 500).toBuffer();
    pairs.push(before, after);
  }
}

fs.writeFileSync(DATA, JSON.stringify(data, null, 2) + "\n");

if (makeSheet) {
  fs.mkdirSync(path.dirname(SHEET), { recursive: true });
  const cols = 4;
  const rows = Math.ceil(pairs.length / cols);
  await sharp({ create: { width: cols * 400, height: rows * 500, channels: 3, background: "#ffffff" } })
    .composite(pairs.map((input, i) => ({ input, left: (i % cols) * 400, top: Math.floor(i / cols) * 500 })))
    .jpeg({ quality: 80 })
    .toFile(SHEET);
  console.log(`sheet: ${SHEET}`);
}
