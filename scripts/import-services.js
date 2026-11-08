// Converts the Phorest services export into src/_data/services.json and
// scripts/services-review.md (for Yemi to approve cleaned names).
// Usage: node scripts/import-services.js [path/to/services.csv]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const csvPath = process.argv[2] || "C:\\Users\\olaye\\Downloads\\services.csv";
const EXPECTED = 157;

// ---------- CSV ----------
function parseCsv(text) {
  text = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows;
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), r[i] ?? ""])));
}

// ---------- Naming ----------
const norm = (s) => s.replace(/\s+/g, " ").trim().toLowerCase();

const ACRONYMS = { caci: "CACI", comcit: "COMCIT", lvl: "LVL", biab: "BIAB", mda: "MDA", prp: "PRP", rrs: "RRS", hb: "HB", plla: "PLLA", caha: "CaHA", x: "X" };
const SMALL = new Set(["and", "of", "to", "with", "for", "the", "a", "in", "on", "weeks", "week"]);

function titleCase(raw) {
  let s = raw.replace(/\s+/g, " ").trim().toLowerCase();
  const fixes = [
    [/\binc\b\.?/g, "including"],
    [/micro dermabrasion/g, "microdermabrasion"],
    [/\bmasage\b/g, "massage"],
    [/\bmens\b/g, "men's"],
    [/must of been/g, "must have been"],
    [/\bunder arm\b/g, "underarm"],
    [/\b1\/2 leg\b/g, "half leg"],
    [/\b20min\b/g, "20 minute"],
    [/anti ageing/g, "anti-ageing"],
    [/non surgical/g, "non-surgical"],
    [/(\w)- /g, "$1 - "],
    [/\/ /g, "/"],
  ];
  for (const [re, rep] of fixes) s = s.replace(re, rep);
  let first = true;
  s = s.replace(/[a-z0-9']+/g, (w, offset) => {
    const prev = s[offset - 1];
    const out = ACRONYMS[w] ??
      (!first && !(prev === "(" && w === "with") && SMALL.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1));
    first = false;
    return out;
  });
  return s;
}

// Explicit cleaned names where rules are not enough. Keys are normalised raw names.
// note = a question or caveat for Yemi.
const OVERRIDES = {
  // Biostimulators
  "biostimulator: radiess (caha)": { clean: "Biostimulator: Radiesse (CaHA)" },
  "biostimulator: sculptra (plla)": { clean: "Biostimulator: Sculptra (PLLA)" },
  // Dermal filler
  "derma filler: 1ml": { clean: "Dermal Filler: 1ml" },
  "derma filler: chin filler/mid face enhancement": { clean: "Dermal Filler: Chin & Mid Face Enhancement" },
  "derma filler: dissolving & refill": { clean: "Dermal Filler: Dissolving & Refill" },
  "derma filler: filler dissolving": { clean: "Dermal Filler: Filler Dissolving" },
  "derma filler: jaw lines 2mlsl": { clean: "Dermal Filler: Jawline 2ml", note: "Phorest says '2MLSL'. Assumed this means 2ml. Please confirm." },
  "derma filler: jaw lines 1ml": { clean: "Dermal Filler: Jawline 1ml" },
  "derma filler: lip filler 0.5ml": { clean: "Dermal Filler: Lip Filler 0.5ml" },
  "derma filler: marionate line": { clean: "Dermal Filler: Marionette Lines" },
  "derma filler: nasolabial fold (smile line)": { clean: "Dermal Filler: Nasolabial Folds (Smile Lines)" },
  "derma filler: tear trough for refresged youth eye": { clean: "Dermal Filler: Tear Trough for Refreshed Eyes" },
  "derma filler: upper lip lines (smoker lines)": { clean: "Dermal Filler: Upper Lip Lines", note: "Dropped '(smoker lines)' from the name as it can read as judgemental. Confirm you are happy." },
  "dermo filler: chin enhancement": { clean: "Dermal Filler: Chin Enhancement", note: "Looks similar to 'Chin & Mid Face Enhancement' (£180 vs 160). Are these two different treatments?" },
  // Fat dissolving
  "fat dissolving: body one area": { clean: "Fat Dissolving: Body, One Area" },
  "fat dissolving: face one area": { clean: "Fat Dissolving: Face, One Area" },
  // Hair
  "hair treatment: hair filler": { clean: "Hair Treatment: Hair Filler", note: "Unclear what product 'hair filler' is. Please confirm the product and what it is called." },
  "hair treatment: plinest hair": { clean: "Hair Treatment: Plinest Hair" },
  "hair treatment: prp hair one session": { clean: "Hair Treatment: PRP, One Session", note: "Cosmetic PRP is in the government's high-risk licensing consultation (closes 13 Jan 2027). Confirm wording before launch." },
  "hair treatment: three session": { clean: "Hair Treatment: PRP, Three Sessions", note: "Phorest says only 'three session'. Assumed this is PRP (£300 = 3 x £100). Please confirm." },
  // Microneedling
  "micro needling: acne scare": { clean: "Microneedling: Acne Scars" },
  "micro needling: hydration/glow": { clean: "Microneedling: Hydration & Glow" },
  "micro needling: pigmentation": { clean: "Microneedling: Pigmentation" },
  // Polynucleotides
  "newest (polynuclotide and hyaluronic acid)": { clean: "Newest: Polynucleotide & Hyaluronic Acid", note: "'Newest' looks like a product name. Please confirm the correct brand name and spelling." },
  "polynuclotide: plinest eye": { clean: "Polynucleotide: Plinest Eye" },
  "polynuclotide: plinest fast": { clean: "Polynucleotide: Plinest Fast" },
  "polynuclotide: rejuran hb": { clean: "Polynucleotide: Rejuran HB" },
  "polynuclotide: rejuran healer": { clean: "Polynucleotide: Rejuran Healer" },
  "polynuclotide: rejuran s": { clean: "Polynucleotide: Rejuran S" },
  "polynuclotide: vitaran eye": { clean: "Polynucleotide: Vitaran Eye" },
  "polynuclotide: vitaran face": { clean: "Polynucleotide: Vitaran Face" },
  // Skin boosters
  "skin booster: juvederm volite": { clean: "Skin Booster: Juvederm Volite" },
  "skin booster: profhilo": { clean: "Skin Booster: Profhilo" },
  "skin booster: rrs hyalift": { clean: "Skin Booster: RRS Hyalift", note: "Confirm spelling of 'Hyalift'." },
  "skin booster: rrs long lasting": { clean: "Skin Booster: RRS Long Lasting" },
  "skin booster: seventy hyal": { clean: "Skin Booster: Seventy Hyal", note: "Confirm spelling of 'Seventy Hyal'." },
  "skin booster:jalupro super hydro": { clean: "Skin Booster: Jalupro Super Hydro" },
  // Prescription services: neutral names only (never the medicine or a euphemism)
  "anti wrinkles injection - 1 area": { clean: "Lines and Wrinkles Consultation: 1 Area" },
  "anti wrinkles injection - 2 areas": { clean: "Lines and Wrinkles Consultation: 2 Areas" },
  "anti wrinkles injection - 3 areas": { clean: "Lines and Wrinkles Consultation: 3 Areas" },
  "anti wrinkles injection: brow lift": { clean: "Lines and Wrinkles Consultation: Brow" },
  "anti wrinkles injection: bunny lines": { clean: "Lines and Wrinkles Consultation: Bunny Lines" },
  "anti wrinkles injection: gummy smile": { clean: "Lines and Wrinkles Consultation: Gummy Smile" },
  "anti wrinkles injection: lip flip": { clean: "Lines and Wrinkles Consultation: Lip Flip" },
  "anti wrinkles injection: nefertiti neck lift": { clean: "Lines and Wrinkles Consultation: Neck" },
  "anti wrinkles injection: nose slimming": { clean: "Lines and Wrinkles Consultation: Nose" },
  "hyperhidrosis (excessive sweating)": { clean: "Excessive Sweating Consultation", publicName: "Excessive sweating consultation" },
  "teeth grinding (bruxism)": { clean: "Teeth Grinding Consultation", publicName: "Teeth grinding consultation" },
  // Others
  "foot leg & ankle massage": { clean: "Foot, Leg & Ankle Massage" },
  "20min face chest and scalp massage": { clean: "20 Minute Face, Chest & Scalp Massage" },
  "back wax (male)": { clean: "Back Wax (Male)", note: "Same price and length as 'Men's Back Wax'. Merge into one in Phorest?" },
  "mens back wax": { clean: "Men's Back Wax", note: "Same price and length as 'Back Wax (Male)'. Merge into one in Phorest?" },
  "mens brow wax": { clean: "Men's Brow Wax", note: "Same price and length as 'Eyebrow Wax'. Keep separate for the Men page?" },
  "eyebrow wax": { clean: "Eyebrow Wax" },
  "lvl- length volume & lift including eyebrow wax & tint": { clean: "LVL (Length, Volume & Lift) Including Eyebrow Wax & Tint" },
  "lvl - length volume & lift": { clean: "LVL (Length, Volume & Lift)" },
  "caci bum lift": { clean: "CACI Bum Lift", note: "Sits in Phorest's Body category. Placed on the Body and Tanning page, not the CACI facials page. Confirm." },
  "signature back treatment": { clean: "Signature Back Treatment", note: "Unclear whether this is a massage or a skin treatment. Placed on Body and Tanning. Please confirm what it involves." },
  "signature body treatment": { clean: "Signature Body Treatment", note: "Please confirm what this involves (for page copy)." },
  "shrinking violet wrap": { clean: "Shrinking Violet Wrap", note: "'Inch loss' claims are not allowed on the site. Page copy will describe the wrap without result claims." },
  "full body masage (inc. face & scalp)": { clean: "Full Body Massage (Including Face & Scalp)" },
  "add 25 minute back massage to any facial": { clean: "Add 25 Minute Back Massage to Any Facial" },
};

const PRESCRIPTION = /^(anti wrinkles injection|hyperhidrosis|teeth grinding)/;

// ---------- Section and page mapping (Services and pricing table in the website plan) ----------
const CATEGORY_MAP = {
  "caci ultimate results driven facials": ["Facials", "Facials", "caci"],
  "comcit advanced facial rejuvenation": ["Facials", "Facials", "comcit"],
  "crystal clear facial treatments": ["Facials", "Facials", "crystal-clear"],
  "derma plane facials": ["Facials", "Facials", "dermaplaning"],
  "glycolic facial peels": ["Facials", "Facials", "glycolic-peel"],
  "eyes - lashes & brows": ["Beauty", "Beauty: Lashes and Brows", "lashes-and-brows"],
  "fingers": ["Beauty", "Beauty: Nails", "nails-and-pedicures"],
  "feet": ["Beauty", "Beauty: Pedicures", "nails-and-pedicures"],
  "little miss urban (age 4-12)": ["Beauty", "Beauty: Little Miss Urban", "little-miss-urban"],
  "hair removal": ["Beauty", "Beauty: Waxing", "waxing"],
  "men": ["Beauty", "Beauty: Men", "men"],
  "tanning": ["Beauty", "Beauty: Tanning", "body-and-tanning"],
  "shrinking violet inch loss body wrap": ["Beauty", "Beauty: Body", "body-and-tanning"],
};

function aestheticsPage(n) {
  if (PRESCRIPTION.test(n)) return "lines-and-wrinkles-consultation";
  if (/^(derma|dermo) filler/.test(n)) return "dermal-fillers";
  if (n.startsWith("skin booster")) return "skin-boosters";
  if (n.startsWith("polynuclotide") || n.startsWith("newest")) return "polynucleotides";
  if (n.startsWith("biostimulator")) return "biostimulators";
  if (n.startsWith("micro needling")) return "microneedling";
  if (n.startsWith("fat dissolving")) return "fat-dissolving";
  if (n.startsWith("hair treatment")) return "hair-loss";
  return null;
}

function mapSection(category, n) {
  const c = norm(category);
  if (c === "aesthetics") {
    const page = aestheticsPage(n);
    return { section: "Aesthetics", websiteSection: "Aesthetics", page };
  }
  if (c === "body") {
    const bodyTreatment = /exfoliation|signature|bum lift/.test(n);
    return bodyTreatment
      ? { section: "Beauty", websiteSection: "Beauty: Body", page: "body-and-tanning" }
      : { section: "Beauty", websiteSection: "Beauty: Massage and Body", page: "massage" };
  }
  const m = CATEGORY_MAP[c];
  if (!m) return { section: null, websiteSection: null, page: null };
  return { section: m[0], websiteSection: m[1], page: m[2] };
}

// ---------- Build ----------
const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
const unmapped = [];

const services = rows.map((r) => {
  const rawName = r.service_name;
  const n = norm(rawName);
  const ov = OVERRIDES[n];
  const cleanName = ov?.clean ?? titleCase(rawName);
  const isPrescription = PRESCRIPTION.test(n);
  const { section, websiteSection, page } = mapSection(r.category_name, n);
  if (!page) unmapped.push(rawName);

  let priceHoldReason = null;
  if (isPrescription) priceHoldReason = "Prescription service: consultation only, no price on the site";
  else if (/profhilo/.test(n)) priceHoldReason = "Profhilo: pending Yemi's price decision";
  else if (/^micro needling/.test(n)) priceHoldReason = "Microneedling: pending Yemi's price decision";
  else if (/^fat dissolving/.test(n)) priceHoldReason = "Fat dissolving: pending Yemi's price decision";

  const publicName = isPrescription
    ? ov?.publicName ?? "Lines and wrinkles consultation"
    : cleanName;

  const note = ov?.note ?? null;
  const entry = {
    id: r.service_id,
    rawName,
    cleanName,
    publicName,
    phorestCategory: r.category_name,
    section,
    websiteSection,
    page,
    durationMins: Number.parseInt(r.duration, 10),
    gapMins: Number.parseInt(r.gap_time, 10) || 0,
    price: Number.parseFloat(r.price),
    isPrescription,
    pricePublic: priceHoldReason === null,
    priceHoldReason,
    // isMinor: small add-ons, repairs, soak-offs and removals (exclude when working out "From" prices)
    isMinor: /^addb\b|repair|soak off|removal/i.test(cleanName) || undefined,
  };
  if (!entry.isMinor) delete entry.isMinor;
  if (note) entry.noteForYemi = note;
  return entry;
});

// Safety: no toxin wording may reach a public-facing name
const BANNED = /\b(botox|botulinum|toxin|tox|anti[\s-]?wrinkles?|injections?)\b/i;
const leaks = services.filter((s) => BANNED.test(s.cleanName) || BANNED.test(s.publicName));
if (leaks.length) {
  console.error("FAIL: banned wording in cleanName/publicName:", leaks.map((s) => s.rawName));
  process.exit(1);
}
if (unmapped.length) {
  console.error("FAIL: no page mapping for:", unmapped);
  process.exit(1);
}

const dupIds = services.length - new Set(services.map((s) => s.id)).size;
if (dupIds) { console.error("FAIL: duplicate service ids"); process.exit(1); }

fs.writeFileSync(path.join(root, "src/_data/services.json"), JSON.stringify(services, null, 2) + "\n");

// ---------- Review table for Yemi ----------
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|");
const hidden = services.filter((s) => !s.pricePublic);
const withNotes = services.filter((s) => s.noteForYemi);
const lines = [];
lines.push("# Services review for Yemi");
lines.push("");
lines.push(`Generated by \`scripts/import-services.js\` from the Phorest export (${services.length} services). Please approve or correct the cleaned names, the page each service sits on, and which prices are public.`);
lines.push("");
lines.push("- **Prescription services** (anti-wrinkle, hyperhidrosis, teeth grinding) get a neutral name, no price and no offers on the site. The public name is shown in the table. The Phorest names still need changing in Phorest (see the Phorest clean-up item in BUILD_PLAN.md).");
lines.push("- **pricePublic = no** also covers Profhilo, microneedling and fat dissolving, held back until you decide.");
lines.push("- Spelling and capitals fixed; brand names kept correctly cased.");
lines.push("");
lines.push(`## Summary`);
lines.push("");
lines.push(`- Services: ${services.length}`);
lines.push(`- Prescription (no price, neutral name): ${services.filter((s) => s.isPrescription).length}`);
lines.push(`- Price held back pending your decision: ${hidden.filter((s) => !s.isPrescription).length}`);
lines.push(`- Total not public: ${hidden.length}`);
lines.push("");
lines.push("## Questions for Yemi");
lines.push("");
for (const s of withNotes) lines.push(`- **${esc(s.cleanName)}** (Phorest: "${esc(s.rawName.trim())}"): ${esc(s.noteForYemi)}`);
lines.push("");
lines.push("## All services");
lines.push("");
lines.push("| Phorest name (rawName) | Cleaned name | Public name (if different) | Section | Page | Price public? |");
lines.push("| --- | --- | --- | --- | --- | --- |");
for (const s of services) {
  lines.push(
    `| ${esc(s.rawName.trim())} | ${esc(s.cleanName)} | ${s.publicName !== s.cleanName ? esc(s.publicName) : ""} | ${esc(s.websiteSection)} | ${esc(s.page)} | ${s.pricePublic ? "yes" : "no"} |`
  );
}
fs.writeFileSync(path.join(root, "scripts/services-review.md"), lines.join("\n") + "\n");

const count = services.length;
console.log(`Imported ${count} services. Not public: ${hidden.length}. Notes for Yemi: ${withNotes.length}.`);
if (count !== EXPECTED) {
  console.error(`FAIL: expected ${EXPECTED} services, got ${count}`);
  process.exit(1);
}
