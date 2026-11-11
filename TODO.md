# The Urban Beauty Salon: what is left before launch

Updated by hand on 11 Nov 2026 after Yemi's decisions (see BUILD_PLAN.md, Stage log "Launch content"). `npm run check:prod` now passes: the production build has **no** `[[TODO]]` placeholders. Local and preview builds still show a few review prompts on treatment pages and the Phorest reviews link prompt on purpose (hidden in production). `npm run todo` regenerates this file from a local build; it would list only those prompts, so keep the open items below when you run it.

## 1. Still open (needs Yemi or a third party)

### Launch gates

- [ ] **Phorest clean-up:** rename the 11 toxin services and the filler dissolving services, remove their prices and any Special offers. The lines and wrinkles consultation and fat dissolving pages are off the site, but Phorest's booking panel (opened by every Book button) still lists whatever is live in Phorest: hide those services from online booking until they return.
- [ ] **Phorest email change** (account and booking emails to the new domain addresses).
- [ ] **Create the free filler review consultation as a Phorest service** (the dermal fillers page offers it).
- [ ] **Solicitor review of the four policies** (privacy, cookies, cancellation policy, booking terms). The "Draft, pending legal review" label was removed on Yemi's instruction (11 Nov 2026); the wording is standard and plain-English but has not been reviewed by a solicitor.
- [ ] **Team consent:** each team member (Rachel, Jill, Joanne, Isla, Rania) to confirm consent to their name, photo and details on the site; Rania to sign off her copy, treatment list and insurance.

### Off the site until resolved

- [ ] **Lines and wrinkles consultation:** needs an independent prescriber (name, profession, registration). Rania Alrayas is a GDC Dental Care Professional and is not a prescriber. File kept: `src/content/aesthetics/lines-and-wrinkles-consultation.md` (`permalink: false`); restore steps are in its front-matter comment.
- [ ] **Fat dissolving:** needs the product confirmed (and an independent prescriber if it is a prescription medicine). File kept: `src/content/aesthetics/fat-dissolving.md` (`permalink: false`).

### Content and photos

- [ ] **Professional photo shoot:** aesthetics room (all aesthetics heroes and cards use the branded panel), Rania's portrait, exterior, people and treatments in progress, and card photos for treatments for men, waxing, Little Miss Urban, body and tanning.
- [ ] **Shop window lettering** (physical signage to match the brand).
- [ ] Practitioner sign-off on the general wording used where specifics were not supplied (COMCIT, glycolic peel, Crystal Clear, CACI and dermaplaning make-up advice, signature back and body, Shrinking Violet, CACI Bum Lift, Little Miss Urban, gentleman's manicure and pedicure, hair filler). Add specifics later only from the practitioner.
- [ ] Phorest public reviews link (`site.reviews.url`): the "Read our Phorest reviews" link appears once it is set.
- [ ] Real Phorest reviews for treatment pages that have none (reviews.json; first name and surname initial; none naming Macey or Daisy, none about medicines).
- [ ] Profhilo, microneedling and skin booster price decision (currently "Price on consultation").
- [ ] Service name questions in `scripts/services-review.md`; Phorest booking colours (optional).
- [ ] Confirm the map marker, `priceRange` ("££") and geo point (kept as is).

### Hidden rather than answered (no facts supplied)

- Home: average rating and Google rating line removed; home review cards show the three real reviews already in reviews.json.
- About: no quote from Yemi. The salon story is a short factual paragraph (open since 2011, Rachel since it opened, Rania for aesthetics, 6,736 Phorest reviews since 2016).
- Treatment pages for beauty and facials: no "Your practitioner" card (no individual named).
- ICO number: not shown (Yemi's choice); `site.icoNumber` stays a TODO in data only and is never rendered.

## 2. Done on 11 Nov 2026 (Yemi's decisions)

- [x] Established year 2013 changed to 2011 (site.json, CLAUDE.md, seal, schema, share images regenerated).
- [x] Jill Taylor: "Over 25 years in the beauty industry".
- [x] Lines and wrinkles consultation and fat dissolving taken off the site (cards, links, sitemap, share image, review docs).
- [x] Hair filler described generically; no product named.
- [x] Free filler review consultation sentence kept; 1ml filler row reads "Dermal filler, 1ml, used where your practitioner recommends".
- [x] Aftercare: contact during opening hours, no out-of-hours route; complications escalation and complaints procedure (acknowledge within 2 working days, aim to resolve within 14 days); emergency 999 and A&E lines kept.
- [x] Visits: step-free entrance, guests wait in reception, patch tests at least 48 hours before, consultation form at the salon, aesthetics for adults 18 and over.
- [x] Policies: draft labels removed; retention (treatment records 8 years after the last treatment, enquiries 12 months, photos only with written consent and kept with the record), Phorest as processor, international transfers, Phorest cookies, online change or cancel wording, consumer-rights line.
- [x] Practitioner-only details rewritten as general wording (facials and beauty).
- [x] `npm run check` now starts from an empty `_site`, so stale pages never reach the checks.

## 3. Open technical notes (not placeholders)

- Add a Content-Security-Policy after the live Phorest test (inline scripts and Phorest frames need allowing).
- Netlify installs devDependencies (Playwright, Lighthouse, ffmpeg-static): consider moving them or setting a build flag at Stage 10.
- A Plausible account must exist for theurbanbeautysalon.co.uk before the script reports anything.
- Keyboard use inside Phorest's booking panel cannot be tested from outside the frame: check on the live domain (Tab into the panel, Shift+Tab back to "Close booking"; Escape does not reach the page while focus is inside Phorest's frame).
- Safari blocks third-party cookies in frames: test booking in the panel on a real iPhone; if it fails, set `site.booking.overlayOnPhones` or `mode` (see COMPONENTS.md).
- Fat dissolving and the lines and wrinkles consultation are off the site (`permalink: false`) until the product and an independent prescriber are confirmed.
- Excessive sweating and teeth grinding consultations are removed from the site; restore only with prescriber sign-off.

## 4. Launch checklist

From the website plan. Ticked means done and checked here; the note says how.

- [ ] Phorest service names cleaned up (Yemi: launch gate above)
- [ ] Anti-wrinkle wording approved by the prescriber (the site never names the medicine; sign-off still needed)
- [ ] All Phase 1 pages complete with real photos and copy (all 31 pages are built with drafted copy; the placeholders above remain)
- [ ] Tested on iPhone, Android, tablet and desktop (emulated at 360, 768 and 1440px with no overflow and no axe violations; keyboard pass done; real devices at Stage 10)
- [ ] Every Book Now button opens the right booking panel (works locally in desktop and phone emulation; confirm on the live domain)
- [ ] Test booking made and cancelled (Stage 10, on the live domain)
- [ ] Contact form delivers to hello@ (needs a Netlify deploy: Stage 10)
- [x] All links and phone numbers work (every internal link, asset and #fragment, plus mailto and tel format, checked by `npm run check`; the Phorest, Instagram, Facebook and Google Maps links returned 200 on 8 Nov 2026)
- [x] Page titles and descriptions written for every page (unique, length-checked, 31 indexable pages)
- [x] Schema markup added and checked (BeautySalon, Service, BreadcrumbList: required fields and structure checked by `npm run check`; run Google's Rich Results Test once live)
- [ ] Privacy, cookie, cancellation and booking terms pages live (built, draft labels removed 11 Nov 2026; solicitor review still open)
- [x] Cookie banner works before analytics loads (no banner by decision: Plausible sets no cookies and loads in production builds only; the cookie policy still needs Phorest's cookies listed)
- [ ] Domain points to the host; HTTPS active on www and non-www (Stage 10; `netlify.toml` already redirects www to the apex)
- [ ] Email still sends and receives after DNS changes (Stage 10; never touch MX, SPF, DKIM or DMARC)
- [ ] Search Console verified and sitemap submitted (Stage 10; sitemap.xml and robots.txt are ready)
- [ ] Google Business Profile updated with the new site and booking link (Stage 10)

### Quality bar (Stage 9 results, 8 Nov 2026)

- [x] `npm run check`: build, contrast (13 pairs), compliance (banned words in pages, URLs, titles, alt text, schema), links, SEO and JSON-LD structure
- [x] `npm run shots` on all 33 pages at 360, 768 and 1440px: no horizontal overflow, no axe violations, every page under 1 MB
- [x] Lighthouse mobile on every public page: Performance 100 (contact 98), Accessibility 100, Best Practices 100, SEO 100. The 404 page and fat dissolving score SEO 63 and 66 only because they are deliberately `noindex`
- [x] `npm run keyboard`: skip link, tab order, visible focus, menu (open, trap, Escape, focus return), FAQ (Enter and Space), contact form validation, Book buttons, on home, a treatment page and contact at desktop and phone widths
