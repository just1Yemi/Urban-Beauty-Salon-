// npm run keyboard: keyboard-only pass on home, a treatment page and contact.
// Checks: skip link, tab order reaches every interactive control with a visible focus ring,
// menu opens with Enter, traps focus, closes with Escape and returns focus, FAQ accordion
// toggles with Enter and Space, contact form validates and is operable, Book buttons are reachable
// and labelled. Prints problems only; exit 1 on any.
import { chromium } from "playwright";
import { startServer } from "./static-server.js";

const server = await startServer();
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const problems = [];
const note = (m) => problems.push(m);

async function tabAll(page, max = 140) {
  const seen = [];
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const name = (el.getAttribute("aria-label") || el.innerText || el.getAttribute("title") || el.getAttribute("name") || "").trim().replace(/\s+/g, " ").slice(0, 40);
      const hasRing = (n) => { const c = getComputedStyle(n); return (c.outlineStyle !== "none" && parseFloat(c.outlineWidth) > 0) || c.boxShadow !== "none"; };
      // Cards draw their ring on the parent (:has(:focus-visible)); accept a ring on the element or up to 3 ancestors.
      let ring = false; for (let n = el, k = 0; n && k < 4 && !ring; n = n.parentElement, k++) ring = hasRing(n);
      const bar = document.querySelector(".bookbar");
      const barTop = bar && getComputedStyle(bar).display !== "none" ? bar.getBoundingClientRect().top : innerHeight;
      return { tag: el.tagName.toLowerCase(), name, ring, hidden: r.width === 0 || r.height === 0, underBar: r.bottom > barTop + 1 && r.top < innerHeight && barTop < innerHeight, id: el.id };
    });
    if (!info) { if (seen.length > 5) break; continue; }
    if (seen.length && seen[0].id && seen[0].id === info.id && seen[0].name === info.name && i > 3) break; // wrapped
    seen.push(info);
  }
  return seen;
}

for (const [label, url, vp] of [
  ["home desktop", "/", { width: 1280, height: 800 }],
  ["home mobile", "/", { width: 390, height: 800 }],
  ["treatment desktop", "/facials/dermaplaning/", { width: 1280, height: 800 }],
  ["treatment mobile", "/facials/dermaplaning/", { width: 390, height: 800 }],
  ["contact desktop", "/contact/", { width: 1280, height: 800 }],
  ["contact mobile", "/contact/", { width: 390, height: 800 }],
]) {
  const ctx = await browser.newContext({ viewport: vp, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(base + url, { waitUntil: "load" });
  await page.waitForTimeout(500);

  // 1. Tab order and focus visibility
  const seen = await tabAll(page);
  if (seen.length < 8) note(`${label}: only ${seen.length} tab stops`);
  const first = seen[0];
  if (!first || !/skip/i.test(first.name)) note(`${label}: first tab stop is "${first?.name}", expected the skip link`);
  for (const s of seen) {
    if (s.hidden) note(`${label}: focus landed on a zero-size element (${s.tag} "${s.name}")`);
    if (!s.ring) note(`${label}: no visible focus ring on ${s.tag} "${s.name}"`);
    if (!s.name && s.tag !== "input") note(`${label}: unnamed focus stop (${s.tag})`);
  }

  // 2. Menu
  const menuBtn = page.locator("button[data-menu-open]");
  if (await menuBtn.isVisible()) {
    await menuBtn.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    const open = await page.evaluate(() => document.getElementById("menu")?.open);
    if (!open) note(`${label}: Enter on Menu did not open it`);
    else {
      const inside = await page.evaluate(() => document.getElementById("menu").contains(document.activeElement));
      if (!inside) note(`${label}: focus not inside the open menu`);
      // trap: a modal dialog may pass focus to the browser UI for one step (body), but must never reach the page behind it
      let escaped = false;
      for (let i = 0; i < 30; i++) {
        await page.keyboard.press("Tab");
        const where = await page.evaluate(() => { const a = document.activeElement; return a === document.body ? "browser" : document.getElementById("menu").contains(a) ? "menu" : "page"; });
        if (where === "page") { escaped = true; break; }
      }
      if (escaped) note(`${label}: focus escaped the open menu to the page behind it`);
      await page.locator("[data-menu-close]").focus();
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
      if (await page.evaluate(() => document.getElementById("menu").open)) note(`${label}: Escape did not close the menu`);
      else {
        const back = await page.evaluate(() => document.activeElement?.matches("[data-menu-open]"));
        if (!back) note(`${label}: focus did not return to the Menu button`);
      }
    }
  }

  // 3. FAQ accordion
  const q = page.locator("summary.faq__q").first();
  if (await q.count()) {
    await q.focus();
    const was = await q.evaluate((s) => s.parentElement.open);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(900);
    const after = await q.evaluate((s) => s.parentElement.open);
    if (after === was) note(`${label}: Enter did not toggle the first FAQ`);
    await page.keyboard.press("Space");
    await page.waitForTimeout(900);
    const after2 = await q.evaluate((s) => s.parentElement.open);
    if (after2 !== was) note(`${label}: Space did not toggle the first FAQ back`);
  }

  // 4. Book buttons: reachable, named, real links
  const books = await page.$$eval("a[data-book], a.btn--book, a[href*='phorest']", (els) => els.map((e) => ({ name: (e.getAttribute("aria-label") || e.innerText || "").trim().replace(/\s+/g, " "), tab: e.tabIndex, href: e.getAttribute("href") })));
  if (!books.length) note(`${label}: no Book links found`);
  for (const b of books) { if (!b.name) note(`${label}: unnamed Book link ${b.href}`); if (b.tab < 0) note(`${label}: Book link not focusable ${b.href}`); }

  // 5. Contact form
  if (url === "/contact/") {
    const form = page.locator("form[data-form]");
    await form.locator("input[name=name], input:not([type=hidden]):not([tabindex='-1'])").first().focus();
    await page.keyboard.press("Tab"); // move on to confirm order works
    const submit = form.locator("button[type=submit]");
    await submit.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(700);
    const invalid = await form.locator("[aria-invalid=true]").count();
    if (!invalid) note(`${label}: empty submit shows no invalid fields`);
    const focusedInvalid = await page.evaluate(() => document.activeElement?.getAttribute("aria-invalid") === "true");
    if (!focusedInvalid) note(`${label}: focus not moved to the first invalid field after submit`);
    const unlabeled = await form.locator("input:not([type=hidden]):not([tabindex='-1']), textarea, select").evaluateAll((els) => els.filter((e) => !(e.labels && e.labels.length) && !e.getAttribute("aria-label")).map((e) => e.name));
    if (unlabeled.length) note(`${label}: unlabeled fields ${unlabeled.join(",")}`);
  }
  await ctx.close();
}
await browser.close();
server.close();
if (problems.length) { console.error("keyboard problems:\n- " + [...new Set(problems)].join("\n- ")); process.exit(1); }
console.log("keyboard: all checks pass (6 page/viewport combinations)");
