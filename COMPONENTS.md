# Components and tokens (Stage 1 design system)

Read this instead of the CSS. Live examples of everything: `/styleguide/` (noindex, `sitemap: false`).

## How to use

- Page front matter: `layout: layouts/base.njk`, `title`, `description`. Options: `hero: true` (full-bleed hero first: header starts transparent with Ivory text, and `theme-color` starts Espresso, switching to Ivory on scroll), `progress: true` (1px Champagne reading-progress line), `closing: false` (drop "See you soon."), `noindex: true`, `bodyClass`.
- In any page or layout: `{% import "ui.njk" as ui with context %}` then `{{ ui.button("Book now", book=true) }}`. Macros read `site`, `photos`, `logos`, `icons` from `src/_data`.
- The base layout already renders: skip link, header (logo draw-in, nav, Book now), mobile menu, `<main>`, closing band, frosted mobile Book bar, footer, back-to-top, `#site-data` JSON, Speculation Rules, theme-color, favicons, manifest, print header.
- Facts come from data, never typed into templates: `site.json` (contact, hours, booking URL), `services.json` via filters, `photos.json`, `nav.json` (all header/menu/footer links).
- Missing facts: write `[[TODO: what is needed]]`; pass text through `| todo | safe` (most macros already do) so it shows as a yellow mark.
- Booking: every Book button uses `book=true` (or `data-book` on a link). `site.js` sets every `[data-book]` href from the ONE setting `site.booking.url`. Stage 2 hooks the Phorest widget there.
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

`.wrap` (+ `.wrap--narrow`), `.section` (+ `--tight`, `--deep` Ivory-deep band, `--white`, `--dark`). On a `--deep` band set `style="--bg:var(--c-ivory-deep)"` so step circles match. `.stack`, `.stack-s`, `.stack-l`, `.grid` + `.grid--2` / `.grid--3` (max 3 per row; `--gap` to override), `.split` (7/5 editorial; `.split--flip`), `.overlap` > `.overlap__media` + `.overlap__card` (text card over image edge; `.overlap--flip`), `.btn-row`, `.pause` (full-width image pause; `.pause--band` for a short texture band).
Reveals: `data-reveal` is for **below-the-fold content only** (it waits for site.js). Above-the-fold content (`.hero__content > *`, `.notfound .stack > *`) gets a CSS-only fade-and-rise on first paint (`ub-rise`; stagger with `style="--d:80ms"`), so the LCP never waits for JS. `data-reveal` (fade and 14px rise, once), `data-reveal="wipe"` (clip-path mask wipe; feature images, not the LCP hero), `data-stagger="110"` on a parent to stagger children, or `style="--d:120ms"`.

## Macros (`src/_includes/ui.njk`)

| Macro | Parameters | Rules |
| --- | --- | --- |
| `icon(name, cls, label)` | name from `src/_data/icons.js`: clock, calendar, moon, tag, phone, mail, pin, parking, instagram, facebook, arrow, arrow-up, external, plus, close, menu, copy, check, alert, star, user, shield, drop, chat | Decorative by default (aria-hidden); pass `label` only if the icon stands alone. Never add a generic icon set; new icons: 24 grid, stroke 1.25, butt caps, mitred |
| `logo(variant, draw, cls, label)` | primary, secondary, tertiary, icon | Always these SVGs. `draw=true` only once per page (header has it). `label` for a standalone logo, else aria-hidden |
| `seal(cls, id)` | unique `id` per seal on a page | Heritage seal; footer and About page |
| `button(label, href, style, book, size, arrow, sheen, cls)` | style `solid` / `outline`; `book=true` uses the booking setting; `size="sm"`; `arrow=false`; `cls="btn--block"` full width | Two styles only. Specific labels ("Book a free consultation", never "Click here"), about 22 characters at most ("Book dermaplaning", not the full Phorest service name). Under 40em buttons in a `.btn-row` go full width and equal. `sheen` only on the main Book button (header and Book bar already) |
| `more(label, href)` | | Quiet tracked link with arrow ("Discover") |
| `eyebrow(text, num)` | num -> " · 01" | Section labels |
| `sectionHead(title, eyebrow, word, lead, level, align, id)` | `word` = faint oversized background word; `align="center"` | One per section; `word` sparingly (hub sections). The word is anchored to the eyebrow + heading (`.section-head__title`), never behind the lead |
| `rule(type)` | `line`, `short`, `icon` (UB circle divider) | 1px Champagne hairlines instead of bullets/boxes |
| `picture(name, sizes, ratio, cls, loading, priority, alt, position, zoom, portrait, portraitSizes)` | name from `photos.json`; ratio `45` / `32` / `11` / `wide`; `priority=true` for the hero only; `alt=""` for decorative duplicates; `position` = object-position; `portrait` = a second crop for portrait screens (art direction, e.g. hero); prefer a dedicated crop over `zoom` | AVIF/WebP srcset, fixed width/height, blurred preview, lazy fade-in. Wrap in `<div class="frame">` for the thin inset frame, add `cls="arch"` for arched portraits, wrap in `.zoom` for 3% hover zoom. Unknown name renders a placeholder |
| `placeholder(label, ratio, cls)` | label `"[[TODO: photo of ...]]"` | For photos we do not have (exterior, people, aesthetics room). `cls="arch"` for portraits |
| `price(amount, from)` | amount from services.json | "From £58": tracked caps, small £, light numerals, never breaks |
| `pricelist(items)` | `[services \| service("Name"), ...]` or `services \| pageServices("slug")` | Dot leaders, hairline rows; short lists only |
| `facts(items)` | `[{icon, label, value}]` or `{icon, label, price}` | Quick-facts strip under a treatment heading: Duration · Results last · Downtime · From £X. Unknown values: `[[TODO]]` |
| `tcard(title, href, photo, detail, eyebrow, text, from, mins, level)` | `detail` = second photo for hover cross-fade; `from`/`mins` from services | Max 3 per row. Price and time show on hover/focus (always on touch) |
| `review(text, name, date)` | | First name + surname initial only; month and year; never reviews mentioning prescription medicines. Adds "Verified Phorest client" |
| `stat(number, label)` | number from `site.reviews.count` | Counts up once; screen readers get the final number |
| `faq(items)` | `[{q, a}]` | details/summary; smooth height; "+" turns to "×" |
| `steps(items, level)` | `[{title, text}]` | 01, 02 numerals in circles linked by a thin line |
| `toc(items, label)` | `[{id, label}]` | Treatment pages: sticky on desktop, current section marked with a Champagne dot |
| `person(name, role, photo, text)` | `photo` from photos.json or empty for placeholder | "Your practitioner" mini card; never invent names or registrations |
| `hours(caption)` | | Hours table from site.json; today's row highlighted (Europe/London) |
| `openStatus()` | | Live "Open now · closes 8pm" / "Closed now · opens Tuesday 10am"; no-JS fallback "Open Tuesday to Saturday" |
| `address()` | | Tap the address to copy it, with a quiet "Copied" note (plain text without JS) |
| `field(name, label, type, required, autocomplete, options, hint, error, message, value, checked, idp)` | type `text` / `email` / `tel` / `textarea` / `select` / `checkbox`; `message` = error text shown on submit; `error` = static error state; `idp` = id prefix unique per form | Floating label on a 1px Text-soft line (3:1 for WCAG 1.4.11), 2px Espresso line on focus, error in Espresso with the alert icon via `aria-describedby`; "(optional)" marks optional fields |
| `contactForm(formName, demo, state, idp, action)` | `demo=true` = style guide (nothing sent); `state` `error` / `success` for static previews; `action` defaults to `/contact/#<idp>-sent` | Netlify Forms (`data-netlify`, `netlify-honeypot="bot-field"`, hidden `form-name`). site.js validates, posts by fetch and shows the calm success panel (`role=status`, focused); without JS Netlify returns to `action` and `:target` shows the panel. Reply time is a `[[TODO]]` |
| `map(image)` | `image` = path of the static map image when it exists | Links to Google Maps (no embed, no cookies). `[[TODO]]`: brand-coloured static map image |

## Photo crops (`scripts/process-photos.js`, one job each)

| Use | Photo |
| --- | --- |
| Hero | `hero-desk` (landscape) + `portrait="hero-desk-portrait"`, `portraitSizes="133vw"`: flowers, velvet desk, glitter wall; no monitor, ring light or leaflets |
| Texture band (`.pause--band`) | `velvet-band` (4:1, velvet only) |
| Image pause (`.pause`) | `polish-band` (2:1) |
| Accent | `pampas` (4:5, 480/960; `sizes="(min-width: 48em) 13rem, 100vw"`) |
| Treatment room | `treatment-room` (3:2, basin and couch head only) for feature images; cards use product shelves |
| Avoid in new layouts | `reception-desk`, `reception-desk-detail`, `relaxation-room-wide` (monitor, leaflets, throws, tissue box in frame) unless cropped tight |

## Partials (`src/_includes/partials/`)

`header.njk` (fixed; transparent over a hero with JS, solid Ivory with shadow when scrolled and always without JS so Book now stays visible), `menu.njk` (full-screen Espresso dialog; no-JS fallback is a link to `#footer-nav`), `bookbar.njk` (frosted, under 1024px), `closing.njk` ("See you soon." + Book), `footer.njk` (secondary logo, seal, address, hours, contact, socials, policy links from `nav.json`, legal line with `companyNumber` and `registeredOffice` from site.json).

## Behaviour (`src/assets/js/site.js`, about 4 KB gzipped, no framework)

Booking URL injection, lazy image fade, reveals, header state on scroll, reading progress (CSS scroll timeline, JS fallback), back-to-top (pages over 3 screens), mobile menu dialog, logo draw-in once per visit (sessionStorage), one Book-button sheen per visit, today's hours row and open status, count-up, copy address, FAQ animation, contents highlight. View Transitions (cross-fade) are CSS; Speculation Rules (prefetch on hover) are inline in the base layout. Everything works without JS.

## Pages and checks

- `/styleguide/`: every token and component; `/404.html`: branded not-found page.
- `npm run check`: build, contrast (`scripts/contrast-check.js`), banned words, links (pending pages listed, not failed). `npm run shots -- /path/`: screenshots at 360/768/1440, axe, overflow, weight.
- CSS is authored in four files and published as one minified `/assets/css/site.css` (`src/assets/css/site.11ty.js`). Fonts: `npm run fonts` re-copies the woff2 files from @fontsource.
- Print: header, footer, menus, buttons and images are hidden; text pages print cleanly with a small logo header.
