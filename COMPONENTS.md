# Components and tokens (Stage 1 design system)

Read this instead of the CSS. Live examples of everything: `/styleguide/` (noindex, `sitemap: false`).

## How to use

- Content pages (hub, treatment, text) use `layouts/hub.njk`, `layouts/treatment.njk` and `layouts/text.njk`, driven by front matter in `src/content/` (schema: `CONTENT_GUIDE.md`). Other pages: `layout: layouts/base.njk`, `title`, `description` (or `metaTitle`, `metaDescription`). Options: `hero: true` (full-bleed hero first: header starts transparent with Ivory text, and `theme-color` starts Espresso, switching to Ivory on scroll), `progress: true` (1px Champagne reading-progress line), `closing: false` (drop "See you soon."), `noindex: true`, `bodyClass`.
- In any page or layout: `{% import "ui.njk" as ui with context %}` then `{{ ui.button("Book now", book=true) }}`. Macros read `site`, `photos`, `logos`, `icons` from `src/_data`.
- The base layout already renders: skip link, header (logo draw-in, nav, Book now), mobile menu, `<main>`, closing band, frosted mobile Book bar, footer, back-to-top, `#site-data` JSON, Speculation Rules, theme-color, favicons, manifest, print header.
- Facts come from data, never typed into templates: `site.json` (contact, hours, booking URL), `services.json` via filters, `photos.json`, `nav.json` (all header/menu/footer links). Content pages also use `sections.json` (site map, card names and photos), `practitioners.json` and `reviews.json` (both empty until Yemi supplies details). Data deep merge is off: front matter replaces global data of the same name (treatment `services` and `reviews` are lists of ids).
- Missing facts: write `[[TODO: what is needed]]`; pass text through `| todo | safe` (most macros already do) so it shows as a yellow mark.
- Booking: every Book button uses `book=true` (or `data-book` on a link). ONE setting, `site.booking.mode`, controls every button: see Booking below.
- New pages linked from nav/footer: when built, remove the URL from `scripts/link-pending.json`.

## Tokens (`src/assets/css/tokens.css`)

| Group | Tokens |
| --- | --- |
| Colour | `--c-espresso #3B302A`, `--c-champagne #C6A77D`, `--c-ivory #F6F1EA`, `--c-onyx #000`, `--c-white #FFF`. Tints: `--c-ivory-deep #EEE7DD` (alt band), `--c-ivory-shade #E6DFD5` (placeholders), `--c-text-soft #6A5E56` (secondary text on light), `--c-ivory-soft #C9C0B6` (secondary text on Espresso), `--c-espresso-deep #2E2520` |
| Roles | `--bg`, `--text`, `--text-soft`, `--line` (Champagne hairline), `--line-soft` (45% Champagne), `--ink-faint` (4% Espresso), `--grain` (noise texture) |
| Type | `--font-display` Jost, `--font-body` Inter. Sizes `--step--2` (11px) to `--step-6`: body `--step-0` 16-17, lead `--step-1`, h3 `--step-2`, h2 `--step-3`, h1 `--step-4`, display `--step-5`, closing line `--step-6`. Tracking `--track-display .08em`, `--track-h1 .12em`, `--track-h2 .16em`, `--track-h3 .18em`, `--track-label .22em`. `--measure 34em` (about 65 Inter characters a line; used by `p`, `.faq__a`, `.prose`) |
| Space (8px) | `--s-1` 8, `--s-2` 16, `--s-3` 24, `--s-4` 32, `--s-5` 48, `--s-6` 64, `--s-7` 96, `--s-8` 128, `--s-9` 160; `--gutter`; `--section-y` (64 phone, 96-160 desktop); `--wrap` 76rem; `--wrap-narrow` 46rem; `--header-h`, `--bookbar-h` 4.5rem |
| Shape | `--radius: 2px` (only radius). `--arch` for arched tops (portraits only) |
| Shadow | `--shadow-1` (cards, scrolled header), `--shadow-2` (cards over images). Espresso-tinted, never grey |
| Motion | `--ease-out`, `--ease-soft`, `--ease-in-out`, `--ease-wipe`; `--dur-1` 180ms, `--dur-2` 380ms, `--dur-3` 700ms, `--dur-4` 1200ms; `--rise` 14px. All motion is off under `prefers-reduced-motion` |
| Breakpoints | 40em (640), 48em (768), 64em (1024: desktop nav, Book bar hidden), 80em |

Contrast (checked by `npm run check`, listed in the style guide): every text pair is AA or better. **Champagne is never text on Ivory or White** (2.0:1); it may colour text only on Espresso (5.6:1), and hairlines, icons and decoration anywhere. Keep Champagne under 5% of any screen.

## Type and utility classes

`h1`-`h4` / `.h1`-`.h4` (Jost light uppercase, balanced), `.display`, `.lead`, `.small`, `.soft`, `.tnum` (tabular figures), `.eyebrow` (tracked caps label; Champagne on dark), `.caption`, `.pullquote` (hanging quote mark), `.prose` (text pages: spacing, Champagne underlined links), `.link` (underlined link), `.link-draw` (underline draws left to right on hover), `.visually-hidden`, `.todo`, `.on-dark` (Espresso surface: Ivory text, Champagne labels and `&`, light buttons), `.print-only`.
Typography rules: curly quotes and apostrophes (’), en dash in times `10:00–20:00`, phone as `01925 726 688`, headings via `| amp | safe` to get the ampersand span.

## Layout classes

`.wrap` (+ `.wrap--narrow`), `.section` (+ `--tight`, `--deep` Ivory-deep band, `--white`, `--dark`). On a `--deep` band set `style="--bg:var(--c-ivory-deep)"` so step circles match. `.stack`, `.stack-s`, `.stack-l`, `.team-grid` (add to a team `grid--3` on home and About: an incomplete last row is centred), `.grid` + `.grid--2` / `.grid--3` (max 3 per row; `--gap` to override), `.split` (7/5 editorial; `.split--flip`), `.overlap` > `.overlap__media` + `.overlap__card` (text card over image edge; `.overlap--flip`), `.btn-row`, `.pause` (full-width image pause; `.pause--band` for a short texture band).
Page templates (Stage 2): `.page-head` > `.page-head__grid` (7/5) > `.page-head__text` + `.page-head__media` (photo in `.frame`; 3:2 on phones, 4:5 from 1024px; CSS-only entrance, stagger with `--d`); `.treatment__layout` (sticky `toc` 14rem + `.treatment__body` of `.treatment__section`s); `.treatment__person`. Hubs reuse `.section-head__title` + `.section-head__word` for the faint section word behind the H1, `grid--3` of `tcard`s, and `overlap--flip` for "Not sure what to book?".
Reveals: `data-reveal` is for **below-the-fold content only** (it waits for site.js). Above-the-fold content (`.hero__content > *`, `.notfound .stack > *`) gets a CSS-only fade-and-rise on first paint (`ub-rise`; stagger with `style="--d:80ms"`), so the LCP never waits for JS. `data-reveal` (fade and 14px rise, once), `data-reveal="wipe"` (clip-path mask wipe; feature images, not the LCP hero), `data-stagger="110"` on a parent to stagger children, or `style="--d:120ms"`.

## Macros (`src/_includes/ui.njk`)

| Macro | Parameters | Rules |
| --- | --- | --- |
| `icon(name, cls, label)` | name from `src/_data/icons.js`: clock, calendar, moon, tag, phone, mail, pin, parking, instagram, facebook, arrow, arrow-up, external, plus, close, menu, copy, check, alert, star, user, shield, drop, chat | Decorative by default (aria-hidden); pass `label` only if the icon stands alone. Never add a generic icon set; new icons: 24 grid, stroke 1.25, butt caps, mitred |
| `logo(variant, draw, cls, label)` | primary, secondary, tertiary, icon | Always these SVGs. `draw=true` only once per page (header has it). `label` for a standalone logo, else aria-hidden |
| `seal(cls, id)` | unique `id` per seal on a page | Heritage seal; footer and About page |
| `button(label, href, style, book, size, arrow, sheen, cls)` | style `solid` / `outline`; `book=true` uses the booking setting (renders the new-tab link: `target="_blank"`, hidden " (opens in a new tab)", arrow turned to point out, a small one even with `arrow=false`; see Booking); `size="sm"`; `arrow=false`; `cls="btn--block"` full width | Two styles only. Specific labels ("Book a free consultation", never "Click here"), about 22 characters at most ("Book dermaplaning", not the full Phorest service name). Under 40em buttons in a `.btn-row` go full width and equal. `sheen` only on the main Book button (header and Book bar already) |
| `more(label, href)` | | Quiet tracked link with arrow ("Discover") |
| `eyebrow(text, num)` | num -> " · 01" | Section labels |
| `sectionHead(title, eyebrow, word, lead, level, align, id)` | `word` = faint oversized background word; `align="center"` | One per section; `word` sparingly (hub sections). The word is anchored to the eyebrow + heading (`.section-head__title`), never behind the lead |
| `rule(type)` | `line`, `short`, `icon` (UB circle divider) | 1px Champagne hairlines instead of bullets/boxes |
| `picture(name, sizes, ratio, cls, loading, priority, alt, position, zoom, portrait, portraitSizes)` (a `panel:` / `panel-light:` name draws `brandPanel`; inside `.frame` the white frame line is dropped so the panel’s own Champagne line shows) | name from `photos.json`; ratio `45` / `32` / `11` / `wide`; `priority=true` for the hero only; `alt=""` for decorative duplicates; `position` = object-position; `portrait` = a second crop for portrait screens (art direction, e.g. hero); prefer a dedicated crop over `zoom` | AVIF/WebP srcset, fixed width/height, blurred preview, lazy fade-in. Wrap in `<div class="frame">` for the thin inset frame, add `cls="arch"` for arched portraits, wrap in `.zoom` for 3% hover zoom. Unknown name renders a placeholder |
| `placeholder(label, ratio, cls)` | label `"[[TODO: photo of ...]]"` | For photos we do not have (exterior, people, aesthetics room). `cls="arch"` for portraits |
| `price(amount, from)` | amount from services.json | "From £58": tracked caps, small £, light numerals, never breaks |
| `pricelist(items)` | `[services \| service("Name"), ...]` or `services \| pageServices("slug")`, or `(ids \| offer).rows` (rows may be `{ name, note }`: "Free consultation" or a TODO in place of a price) | Dot leaders, hairline rows; short lists only |
| `facts(items, reveal)` | `[{icon, label, value}]` or `{icon, label, price}`; `reveal=false` above the fold (page heads) | Quick-facts strip under a treatment heading: Duration · Results last · Downtime · From £X. Unknown values: `[[TODO]]`. 2 x 2 by default; 4 across only when its container is 44rem or wider (container query: `.page-head__text` and `.facts-wrap` are size containers), so it stays 2 x 2 in the 7/5 page head. Values about 24 characters at most; number ranges never break at the dash |
| `tcard(title, href, photo, detail, eyebrow, text, from, mins, level, note)` | `detail` = second photo for hover cross-fade; `from`/`mins` from services; `note` in place of the price ("Free consultation") | Max 3 per row. Price and time show on hover/focus (always on touch). The body fills the card and the price/time line sits at its foot, so meta lines align across a row whatever the text length; every card in sections.json has a one-line `text` |
| `review(text, name, date)` | | First name + surname initial only; month and year; never reviews mentioning prescription medicines. Adds "Verified Phorest client". Caption is always three lines (name, date, verified) at the foot of the card, so the hairlines and names line up across a row |
| `stat(number, label)` | number from `site.reviews.count` | Counts up once; screen readers get the final number |
| `reviewsLink()` | none | "Read our Phorest reviews" link from `site.reviews.url` (not set yet: a `[[TODO]]` in local and preview builds, nothing in production). Shown beside the count wherever there are no review texts |
| `faq(items)` | `[{q, a}]` | details/summary; smooth height; "+" turns to "×" |
| `steps(items, level)` | `[{title, text}]` | 01, 02 numerals in circles linked by a thin line |
| `toc(items, label)` | `[{id, label}]` | Treatment pages: sticky on desktop, current section marked with a Champagne dot |
| `person(name, role, photo, text, label)` | `photo` from photos.json or empty for placeholder; `label` (default "Your practitioner"), `label=""` drops the eyebrow (home team grid) | "Your practitioner" mini card; never invent names or registrations. On treatment pages it shows only when `practitioner` is an id in practitioners.json (or, in local builds, a `[[TODO]]`); `practitioner: ""` hides it (beauty and facials: no individual named) |
| `hours(caption)` | | Hours table from site.json; today's row highlighted (Europe/London) |
| `openStatus()` | | Live "Open now · closes 8pm" / "Closed now · opens Tuesday 10am"; no-JS fallback "Open Tuesday to Saturday" |
| `address()` | | Tap the address to copy it, with a quiet "Copied" note (plain text without JS) |
| `field(name, label, type, required, autocomplete, options, hint, error, message, value, checked, idp)` | type `text` / `email` / `tel` / `textarea` / `select` / `checkbox`; `message` = error text shown on submit; `error` = static error state; `idp` = id prefix unique per form | Floating label on a 1px Text-soft line (3:1 for WCAG 1.4.11), 2px Espresso line on focus, error in Espresso with the alert icon via `aria-describedby`; "(optional)" marks optional fields |
| `contactForm(formName, demo, state, idp, action)` | `demo=true` = style guide (nothing sent); `state` `error` / `success` for static previews; `action` defaults to `/contact/#<idp>-sent` | Netlify Forms (`data-netlify`, `netlify-honeypot="bot-field"`, hidden `form-name`). site.js validates, posts by fetch and shows the calm success panel (`role=status`, focused); without JS Netlify returns to `action` and `:target` shows the panel. Reply time is a `[[TODO]]` |
| `map()` | none | Brand-coloured OpenStreetMap map: `scripts/make-map.js` renders `src/_includes/map.svg` (about 21 KB, inlined so street names use the page font) from cached OSM data in `scripts/data/osm-penketh.json`; `--refresh` fetches the Overpass API again. The salon sits at 50% across and 42% down, under the UB circle pin (Ivory disc with a Champagne ring so it shows on the Espresso map). The whole map links to Google Maps (no embed, no cookies); the required "© OpenStreetMap contributors" credit sits under it. Phones use a 5:4 frame. Marker position is the building on the north side of the precinct (approximate: points at the building, not a doorway) |

## Placeholders and production (final review, Stage 9)

- Local and preview builds show every `[[TODO]]` so Yemi can review. A production build (`env.production`) hides blocks that have no real data yet: the home review cards, the home team section (until `practitioners.json` has entries) and the Results block (no results data source yet), the treatment-page "Your practitioner" card, treatment review prompts (the count plus `reviewsLink()` stays) and the About team section. Templates use `showTodo = not env.production`.
- Launch gate: `npm run check:prod` (or `npm run check` with `ELEVENTY_ENV=production` / Netlify `CONTEXT=production`) builds for production and runs `scripts/todo-gate.js`, which fails if any `[[TODO` is left in `_site`. `/styleguide/` is not built in production (robots.txt no longer lists it).
- Hub and home "Not sure" blocks end with a quiet `more("How a consultation works", "/consultation/")` link. Trust pages take `bookCta` (label) to show a consultation button (contact form while `site.booking.consultationVia` is `"contact"`) beside an outline Book now in the page head.
- `.prose ul` (treatment, trust and text pages): max 38rem like the price list, no bullets, a 1px `--line-soft` rule above each item with `--s-1` padding, like the price list. `.hubs:last-child` has no bottom margin; a text page's body section starts straight under its page head.

## Trust pages and policies (Stages 7 and 8)

| Item | Use |
| --- | --- |
| `layouts/trust.njk` | Long-form trust pages in `src/content/trust/` (consultation, aftercare): text head (with an optional photo), sticky contents, `##` sections, optional `routes` (three "Not sure what to book?" links as `.hubs`), `urgent` (callout under the lead), `faqs`, `print: true` (Print button). Validated as a text page |
| `layouts/text.njk` | Policies in `src/content/policies/`. `draft: true` shows the "Draft, pending legal review" callout under the heading |
| `callout(title, body, ico, cls)` macro, `.callout` | Quiet boxed note: white, hairline with a Champagne top line, alert icon, Jost title. `callout--quiet` = flat. Urgent advice and draft notices only |
| `pcard(p)` macro, `.pcard` | Practitioner card (About): arched portrait placeholder, name, role, definition list (Registration with link to the register, Training, Insurance, Treatments). `p` is an entry of `practitioners.json` (fields name, role, photo, registration {body, number, url}, training, insurance, treatments); `{}` renders a placeholder card |
| `.contact`, `.contact__list` | Contact page: form (7) beside icon rows (5) |
| `.seal--lg` | Large heritage seal (About) |
| `.print-btn` | Print button, shown only with JS, hidden when printing |
| `src/about.njk`, `src/contact.njk` | Bespoke pages (copy and facts from `site.json`) |

Consultation-only pages (every service prescription): the treatment template drops Results last and Downtime (use `facts.format`), renames "Prices and times" to "Consultations", shows a general-reviews prompt, and points Book buttons to `/contact/` while `site.booking.consultationVia` is `"contact"` (launch gate: see BUILD_PLAN).
Held-back prices (Profhilo, microneedling, fat dissolving) show "Price on consultation" in lists, strips and cards; the open decision is listed in the review documents. Price lists use `menuName` (sentence case, no category prefix) from `services.json`.

## SEO (Stage 8)

`lib/seo.js`: JSON-LD built in `base.njk` by the `jsonld` filter (BeautySalon on /, /about/, /contact/; Service + Offer only on indexable treatment pages with a public, non-prescription price, never from rawName; BreadcrumbList; never aggregateRating or reviews). Open Graph and Twitter tags and canonical in `base.njk`; `noindex: true` removes them and the page from the sitemap. Share images: `npm run share-images` (Playwright + sharp, 1200 x 630 into `src/assets/img/share/`, one per indexable page; re-run after changing a page title or adding a page). `src/sitemap.xml.njk`, `src/robots.txt.njk`, `netlify.toml`. Plausible loads only when `ELEVENTY_ENV=production` or Netlify `CONTEXT=production` (`src/_data/env.js`). `npm run check` now ends with `scripts/seo-check.js`.

## Home page patterns (Stage 3)

Built in the same style as the signed-off components; used on `src/index.njk`.

| Class | Use |
| --- | --- |
| `.hubs` > `.hub` | Three section links (Aesthetics, Facials, Beauty): Champagne hairline on top, eyebrow, `h3` link stretched over the block (`.hub__link`), quiet "Discover" arrow. 3 across from 48em |
| `.igrid` | Instagram: a static grid of square salon photos (3 across, 6 from 64em) wrapped in links to the profile (`tabindex="-1"`, `aria-hidden`; one real Follow button below). No embed or third-party script |
| `.visit` (+ `.visit__cols`) | Hours, address, phone and directions line beside the map (5/7 from 64em) |
| `.map-fig` | Wrapper for the map and its credit line |

Home page data: `site.directions.short` / `.full` (directions lines, wording still for Yemi to confirm); card photos and lines for dermal fillers, lashes and brows, nails and pedicures and massage in `sections.json` (interim picks from the 14 salon photos). Featured treatments come from `relatedCards`, so prices always come from `services.json`.

## Photo crops (`scripts/process-photos.js`, one job each)

| Use | Photo |
| --- | --- |
| Hero | `hero-desk` (landscape) + `portrait="hero-desk-portrait"`, `portraitSizes="133vw"`: flowers, velvet desk, glitter wall; no monitor, ring light or leaflets |
| Texture band (`.pause--band`) | `velvet-band` (4:1, velvet only) |
| Image pause (`.pause`) | `polish-band` (2:1) |
| Accent | `pampas` (4:5, 480/960; `sizes="(min-width: 48em) 13rem, 100vw"`) |
| Desk landscape | `desk-flowers` (3:2: flowers, boxed skincare and the velvet desk; right of the monitor, below the ring light; a thin stand pole shows behind the flowers) |
| Flowers accent | `reception-flowers-products` (4:5, re-cropped below the ring light: flowers, gift voucher, products) |
| Treatment room | `treatment-room` only on `/aftercare/` ("clean and safe"): it reads clinical elsewhere. Aesthetics heroes and cards use the branded placeholder until the aesthetics room shoot |
| Never use | `reception-desk`, `reception-wide`, `reception-desk-detail` (monitor and ring light in frame); `product-shelf-serums` (legible third-party efficacy claims: never on any page); `relaxation-room-wide` (throws, tissue box) unless cropped tight |

## Booking (`site.json` booking, `site.js`)

- ONE setting: `booking.mode`. `"overlay"` (default, as agreed in CLAUDE.md): a click on any `[data-book]` opens Phorest's booking panel on the page (`OBWidget` from `booking.widgetScript`, subdomain `urbanbeautysalon`, opened with Phorest's documented `#onlinebookings` hash). Phones get the panel too while `overlayOnPhones` is true (Phorest's `force_slide_over`), otherwise the new tab. `"newTab"`: every Book button opens `booking.url` in a new tab.
- Markup is always the new-tab link (works without JS, and is the fallback if Phorest's script fails or takes over 6 s: the click then goes to the booking page). In overlay mode `site.js` removes `target` and the "(opens in a new tab)" note, so the arrow points right again.
- Speed: Phorest's script (45 KB) and its booking frame load only on intent (pointer over, focus or touch on a Book button), so no page pays for them up front and Lighthouse never loads them.
- Accessibility: the panel gets `role="dialog"` and a name, the frame a title, and Phorest's unlabelled header buttons get names. Focus moves into the panel; on close it returns to the Book button with the scroll position kept (Phorest clears the hash, which would otherwise jump to the top). Escape closes it while focus is on our page. Below 48em the page behind does not scroll.
- Styling: our CSS gives Phorest's frame header the palette (Ivory bar, Espresso controls, tracked caps). The booking pages inside are Phorest's: colours only, set in Phorest Manager > Settings > Online > Setup & Appearance (brand colour is currently #c4a7a1; Yemi to set Champagne #C6A77D or Espresso #3B302A).
- Tested on localhost (8 Nov 2026): the panel loads Phorest's booking app on desktop and in phone emulation, closes from Phorest's own close button, and focus and scroll return. Phorest's CORS and frame headers allow any domain, so nothing needs the live domain to load. Stage 10: make a test booking and cancel it on the live domain, on desktop and a real iPhone (Safari blocks third-party cookies inside frames). If booking fails inside the panel, set `overlayOnPhones: false` (phones only) or `mode: "newTab"`.

## Partials (`src/_includes/partials/`)

`header.njk` (fixed; transparent over a hero with JS, solid Ivory with shadow when scrolled and always without JS so Book now stays visible), `menu.njk` (full-screen Espresso dialog; no-JS fallback is a link to `#footer-nav`), `bookbar.njk` (frosted, under 1024px), `closing.njk` ("See you soon." + Book), `footer.njk` (secondary logo, seal, address, hours, contact, socials, policy links from `nav.json`, legal line with `companyNumber` and `registeredOffice` from site.json).

## Behaviour (`src/assets/js/site.js`, about 4 KB gzipped, no framework)

Booking (see Booking), lazy image fade, reveals, header state on scroll, reading progress (CSS scroll timeline, JS fallback), back-to-top (pages over 3 screens), mobile menu dialog, logo draw-in once per visit (sessionStorage), one Book-button sheen per visit, today's hours row and open status, count-up, copy address, FAQ animation, contents highlight. View Transitions (cross-fade) are CSS; Speculation Rules (prefetch on hover) are inline in the base layout. Everything works without JS.

## Pages and checks

- `/styleguide/`: every token and component; `/404.html`: branded not-found page.
- `npm run check`: build, contrast (`scripts/contrast-check.js`), banned words, links (pending pages listed, not failed). `npm run shots -- /path/`: screenshots at 360/768/1440, axe, overflow, weight. `npm run lh -- /path/ ...`: mobile Lighthouse (Playwright's Chromium, local server): four scores, timings and failing audits; exit 1 below Performance 95, Accessibility 100 or SEO 100. Both use `scripts/static-server.js`. The build also runs the content check (`lib/content.js`, see `CONTENT_GUIDE.md`).
- CSS is authored in four files and published as one minified `/assets/css/site.css` (`src/assets/css/site.11ty.js`). Fonts: `npm run fonts` re-copies the woff2 files from @fontsource.
- Print: header, footer, menus, buttons and images are hidden; text pages print cleanly with a small logo header.
