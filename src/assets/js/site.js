/* The Urban Beauty Salon: small progressive enhancements. No framework.
   Every feature is optional: without this file the site still works (links, details,
   footer navigation, static hours). Motion respects prefers-reduced-motion.
   View Transitions (CSS @view-transition) and Speculation Rules (inline JSON in the
   base layout) need no script. */
(() => {
  "use strict";
  const d = document;
  const html = d.documentElement;
  const $$ = (sel, root = d) => Array.from(root.querySelectorAll(sel));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const store = {
    get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  };
  let data = {};
  try { data = JSON.parse(d.getElementById("site-data").textContent); } catch (e) { /* no data */ }

  /* ---- Booking: ONE setting (site.json booking.url, injected as #site-data) ---- */
  if (data.booking) $$("[data-book]").forEach((a) => { a.href = data.booking; });

  /* ---- Lazy images: fade in over the blurred colour preview ---- */
  $$(".pic img[loading='lazy']").forEach((img) => {
    if (img.complete && img.naturalWidth) return;
    img.classList.add("is-loading");
    const done = () => img.classList.remove("is-loading");
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });

  /* ---- Reveals: fade-and-rise / mask wipe, staggered, once ---- */
  html.classList.add("reveal-on");
  const revealEls = $$("[data-reveal]");
  if (reduce.matches || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    // Stagger siblings that enter together: [data-stagger] on a parent sets --d per child.
    $$("[data-stagger]").forEach((p) => {
      const step = Number(p.dataset.stagger) || 90;
      $$(":scope > [data-reveal]", p).forEach((el, i) => el.style.setProperty("--d", i * step + "ms"));
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---- Header: transparent at the top, Ivory with a soft shadow once scrolled ---- */
  const header = d.querySelector(".site-header");
  const toTop = d.querySelector("[data-to-top]");
  const progress = d.querySelector("[data-progress]");
  const needsJsProgress = progress && !(window.CSS && CSS.supports("animation-timeline: scroll()"));
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = html.scrollHeight - vh;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (toTop) toTop.classList.toggle("is-shown", html.scrollHeight > vh * 3 && y > vh * 1.5);
    if (needsJsProgress) progress.style.setProperty("--p", max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---- Back to top: smooth (CSS), then move focus to the top of the page ---- */
  if (toTop) toTop.addEventListener("click", () => { const t = d.getElementById("top"); if (t) t.focus({ preventScroll: true }); });

  /* ---- Mobile menu: full-screen <dialog>; the no-JS fallback is a link to the footer nav ---- */
  const menu = d.getElementById("menu");
  const openBtn = d.querySelector("[data-menu-open]");
  const fallback = d.querySelector("[data-menu-fallback]");
  if (menu && openBtn && typeof menu.showModal === "function") {
    openBtn.hidden = false;
    if (fallback) fallback.hidden = true;
    openBtn.addEventListener("click", () => { menu.showModal(); openBtn.setAttribute("aria-expanded", "true"); });
    menu.addEventListener("close", () => openBtn.setAttribute("aria-expanded", "false"));
    $$("[data-menu-close]", menu).forEach((b) => b.addEventListener("click", () => menu.close()));
    menu.addEventListener("click", (e) => { if (e.target.closest("a[href^='#']")) menu.close(); });
    matchMedia("(min-width: 64em)").addEventListener("change", (e) => { if (e.matches && menu.open) menu.close(); });
  }

  /* ---- Logo draw-in: once per visit (the head script adds .logo-seen on later pages) ---- */
  const drawn = d.querySelector(".logo--draw");
  if (drawn && !html.classList.contains("logo-seen")) {
    store.set("ub-logo", "1");
    setTimeout(() => html.classList.add("logo-seen"), reduce.matches ? 0 : 1800);
  }

  /* ---- One soft Champagne sheen across the main Book button, once per visit ---- */
  if (!reduce.matches && !store.get("ub-sheen")) {
    const btn = $$("[data-sheen]").find((b) => b.offsetParent !== null);
    if (btn) setTimeout(() => { btn.classList.add("is-sheen"); store.set("ub-sheen", "1"); }, 3200);
  }

  /* ---- Opening hours: today's row and live "Open now · closes 8pm" (Europe/London) ---- */
  const days = data.hours || [];
  if (days.length) {
    const fmt12 = (t) => { const [h, m] = t.split(":").map(Number); return (h % 12 || 12) + (m ? ":" + String(m).padStart(2, "0") : "") + (h < 12 ? "am" : "pm"); };
    const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: data.timezone || "Europe/London", weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
    const part = (t) => (parts.find((p) => p.type === t) || {}).value;
    const todayName = (part("weekday") || "").toLowerCase();
    const now = Number(part("hour")) * 60 + Number(part("minute"));
    const idx = days.findIndex((x) => x.day === todayName);

    $$("[data-hours] tr[data-day]").forEach((tr) => {
      if (tr.dataset.day !== todayName) return;
      tr.classList.add("is-today");
      const th = tr.querySelector("th");
      if (th) th.insertAdjacentHTML("beforeend", '<span class="visually-hidden"> (today)</span>');
    });

    let text = "";
    let state = "closed";
    const today = days[idx];
    if (today && today.open && now >= toMin(today.open) && now < toMin(today.close)) {
      text = "Open now · closes " + fmt12(today.close);
      state = "open";
    } else if (today && today.open && now < toMin(today.open)) {
      text = "Closed now · opens " + fmt12(today.open);
    } else if (idx > -1) {
      for (let i = 1; i <= 7; i++) {
        const next = days[(idx + i) % 7];
        if (next.open) { text = "Closed now · opens " + (i === 1 ? "tomorrow" : next.label) + " " + fmt12(next.open); break; }
      }
    }
    if (text) $$("[data-open-status]").forEach((el) => { el.textContent = text; el.dataset.state = state; });
  }

  /* ---- Count-up (review count), once, when it comes into view ---- */
  const counters = $$("[data-count]");
  if (counters.length && !reduce.matches && "IntersectionObserver" in window) {
    const run = (el) => {
      const target = Number(el.dataset.count);
      const t0 = performance.now();
      const dur = 1800;
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - k, 4);
        el.textContent = Math.round(target * eased).toLocaleString("en-GB");
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ---- Tap the address to copy it, with a quiet "Copied" note ---- */
  $$("[data-copy]").forEach((addr) => {
    const value = addr.dataset.copy;
    const btn = d.createElement("button");
    btn.type = "button";
    btn.className = "addr__copy";
    btn.innerHTML = addr.innerHTML + '<span class="addr__hint" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25"><path d="M8.5 8.5h11v11h-11z"/><path d="M15.5 8.5v-4h-11v11h4"/></svg>Copy address</span><span class="visually-hidden">, copy address</span>';
    const note = d.createElement("span");
    note.className = "addr__note";
    note.setAttribute("role", "status");
    addr.replaceChildren(btn, note);
    let timer;
    btn.addEventListener("click", async () => {
      let ok = false;
      try { await navigator.clipboard.writeText(value); ok = true; } catch (e) {
        const ta = d.createElement("textarea");
        ta.value = value; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        d.body.appendChild(ta); ta.select();
        try { ok = d.execCommand("copy"); } catch (e2) { ok = false; }
        ta.remove();
      }
      note.textContent = ok ? "Copied" : value;
      note.classList.add("is-shown");
      clearTimeout(timer);
      timer = setTimeout(() => { note.classList.remove("is-shown"); }, 2400);
    });
  });

  /* ---- FAQ accordion: smooth height on open and close; "+" turns to "×" in CSS ---- */
  $$("details[data-accordion]").forEach((det) => {
    const sum = det.querySelector("summary");
    const body = det.querySelector(".faq__a");
    if (!sum || !body || !body.animate) return;
    sum.addEventListener("click", (e) => {
      if (reduce.matches) return;
      e.preventDefault();
      if (det.dataset.busy) return;
      const opening = !det.open;
      det.dataset.busy = "1";
      if (opening) det.open = true;
      det.dataset.state = opening ? "opening" : "closing";
      const h = body.scrollHeight;
      const anim = body.animate(
        { height: opening ? ["0px", h + "px"] : [h + "px", "0px"], opacity: opening ? [0, 1] : [1, 0] },
        { duration: Math.min(560, 260 + h * 0.6), easing: "cubic-bezier(.22,.61,.36,1)" }
      );
      anim.onfinish = anim.oncancel = () => {
        if (!opening) det.open = false;
        delete det.dataset.busy;
        delete det.dataset.state;
      };
    });
  });

  /* ---- In-page contents: highlight the section in view ---- */
  const tocLinks = $$("[data-toc] a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    const map = new Map();
    tocLinks.forEach((a) => { const t = d.getElementById(decodeURIComponent(a.hash.slice(1))); if (t) map.set(t, a); });
    const setCurrent = (a) => tocLinks.forEach((l) => (l === a ? l.setAttribute("aria-current", "true") : l.removeAttribute("aria-current")));
    const tio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setCurrent(map.get(e.target)); });
    }, { rootMargin: "-30% 0px -60% 0px" });
    map.forEach((_, t) => tio.observe(t));
  }

  /* ---- Style guide only: replay the logo draw-in ---- */
  $$("[data-replay-logo]").forEach((b) => b.addEventListener("click", () => {
    html.classList.remove("logo-seen");
    void html.offsetWidth;
    setTimeout(() => html.classList.add("logo-seen"), 1800);
  }));
})();
