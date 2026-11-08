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

  /* ---- Booking: ONE setting (site.json booking: url + mode), injected as #site-data ----
     Every [data-book] link is the Phorest booking page in a new tab (also the no-JS default).
     mode "overlay": Phorest's booking panel slides in on this page instead (desktop, and phones
     when booking.phones). Phorest's script loads only on intent (pointer over, focus or touch
     on a Book button), so pages stay fast. If the panel cannot load, the click still reaches
     the booking page. */
  const B = data.booking && typeof data.booking === "object" ? data.booking : { url: data.booking };
  const phoneUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent); // Phorest's own test
  const overlay = B.mode === "overlay" && B.script && B.subdomain && (!phoneUA || B.phones);
  $$("[data-book]").forEach((a) => {
    if (B.url) a.href = B.url;
    const note = a.querySelector("[data-book-note]");
    if (overlay) { a.removeAttribute("target"); if (note) note.remove(); return; }
    a.target = "_blank";
    a.rel = "noopener";
    if (!note) a.insertAdjacentHTML("beforeend", '<span class="visually-hidden" data-book-note> (opens in a new tab)</span>');
  });
  if (overlay) {
    const HASH = "#onlinebookings"; // Phorest's documented trigger: the widget opens and closes on this hash
    const panel = () => d.querySelector(".ob-widget-container");
    const isOpen = () => { const p = panel(); return Boolean(p && p.classList.contains("slide-in")); };
    let ready = null;
    let back = null; // { el, y }: where to return focus and scroll when the panel closes
    const polish = (p) => { // names for Phorest's unlabelled controls; the frame gets the palette in CSS
      p.setAttribute("role", "dialog");
      p.setAttribute("aria-label", "Book online");
      const f = p.querySelector("iframe");
      if (f) f.title = "Online booking";
      [["close__cross", "Close booking"], ["back__arrow", "Back"]].forEach(([k, label]) => {
        const b = p.querySelector(".ob-widget-container__header__" + k);
        if (b) { b.type = "button"; b.setAttribute("aria-label", label); }
      });
    };
    const load = () => ready || (ready = new Promise((resolve, reject) => {
      const s = d.createElement("script");
      s.src = B.script;
      s.async = true;
      s.onerror = reject;
      s.onload = () => {
        try { window.widget = new window.OBWidget(B.subdomain, { hide_widget_button: true, force_slide_over: Boolean(B.phones) }); } catch (e) { reject(e); return; }
        const t0 = Date.now();
        (function wait() { // the widget builds its panel after fetching the salon's settings
          const p = panel();
          if (p) { polish(p); resolve(p); } else if (Date.now() - t0 > 8000) reject(new Error("Phorest panel timeout")); else setTimeout(wait, 50);
        })();
      };
      d.head.appendChild(s);
    }));
    const open = () => {
      if (location.hash === HASH) history.replaceState(null, "", location.pathname + location.search);
      location.hash = HASH;
      html.classList.add("is-booking");
      setTimeout(() => {
        const p = panel();
        if (!p) return;
        const x = p.querySelector(".ob-widget-container__header__close__cross");
        const target = x && x.offsetParent !== null ? x : p.querySelector("iframe");
        if (target) target.focus({ preventScroll: true });
      }, reduce.matches ? 50 : 500);
    };
    window.addEventListener("hashchange", () => {
      if (location.hash === HASH) return;
      // Phorest clears the hash on close, which would jump to the top: stay put and return focus.
      html.classList.remove("is-booking");
      if (!back) return;
      const { el, y } = back;
      back = null;
      window.scrollTo({ top: y, behavior: "instant" });
      // Return focus to the Book button. Phorest reloads its hidden frame after closing, which
      // can pull focus back into it: for a few seconds, take focus back if that happens.
      const refocus = () => setTimeout(() => { if (!isOpen()) el.focus({ preventScroll: true }); }, 0);
      refocus();
      window.addEventListener("blur", refocus);
      setTimeout(() => window.removeEventListener("blur", refocus), 4000);
    });
    const warm = (e) => { if (e.target.closest && e.target.closest("[data-book]")) load().catch(() => {}); };
    ["pointerover", "focusin", "touchstart"].forEach((t) => d.addEventListener(t, warm, { passive: true }));
    d.addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest("[data-book]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const m = d.getElementById("menu");
      const inMenu = m && m.open && m.contains(a);
      if (inMenu) m.close(); // a modal dialog would sit above the panel
      back = { el: inMenu ? d.querySelector("[data-menu-open]") : a, y: window.scrollY };
      let settled = false;
      const leave = () => { if (!settled) { settled = true; location.assign(B.url); } };
      const timer = setTimeout(leave, 6000);
      load().then(() => { if (settled) return; settled = true; clearTimeout(timer); open(); }, () => { clearTimeout(timer); leave(); });
    });
    d.addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen()) location.hash = ""; });
    if (location.hash === HASH) load().catch(() => {}); // e.g. a QR code link to /#onlinebookings
  }

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
  const themeMeta = d.querySelector("meta[data-hero-theme]");
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = html.scrollHeight - vh;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (themeMeta) themeMeta.content = y > 8 ? "#F6F1EA" : "#3B302A"; // phone browser bar follows the header
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

  /* ---- Contact form: friendly validation, Netlify submit by fetch, calm success panel ----
     Without JS the browser posts to Netlify, which returns to the action URL (#...-sent). */
  $$("form[data-form]").forEach((form) => {
    const wrap = form.closest(".form-wrap");
    const success = wrap && wrap.querySelector("[data-form-success]");
    const fail = form.querySelector("[data-form-fail]");
    const fields = $$(".field__input, .check input", form);
    const show = (el, bad) => {
      const box = el.closest(".field");
      const err = box && box.querySelector(".field__error");
      if (!box || !err) return;
      box.classList.toggle("is-invalid", bad);
      err.hidden = !bad;
      if (bad) { err.querySelector("span").textContent = el.dataset.error || el.validationMessage; el.setAttribute("aria-invalid", "true"); }
      else el.removeAttribute("aria-invalid");
    };
    fields.forEach((el) => {
      const recheck = () => { if (el.getAttribute("aria-invalid")) show(el, !el.checkValidity()); };
      el.addEventListener("input", recheck);
      el.addEventListener("change", recheck);
      el.addEventListener("blur", () => { if (el.value && el.type !== "checkbox") show(el, !el.checkValidity()); });
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (fail) fail.hidden = true;
      const bad = fields.filter((el) => !el.checkValidity());
      fields.forEach((el) => show(el, bad.includes(el)));
      if (bad.length) { bad[0].focus(); return; }
      const btn = form.querySelector("[type=submit]");
      if (btn) btn.disabled = true;
      let ok = form.hasAttribute("data-demo");
      if (!ok) {
        try {
          const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(new FormData(form)).toString() });
          ok = res.ok;
        } catch (err) { ok = false; }
      }
      if (btn) btn.disabled = false;
      if (ok && success) {
        form.hidden = true;
        success.classList.add("is-shown");
        success.focus();
      } else if (fail) fail.hidden = false;
    });
  });

  /* ---- Print button (aftercare page; hidden without JS and in print) ---- */
  $$("[data-print]").forEach((b) => b.addEventListener("click", () => window.print()));

  /* ---- Style guide only: replay the logo draw-in ---- */
  $$("[data-replay-logo]").forEach((b) => b.addEventListener("click", () => {
    html.classList.remove("logo-seen");
    void html.offsetWidth;
    setTimeout(() => html.classList.add("logo-seen"), 1800);
  }));
})();
