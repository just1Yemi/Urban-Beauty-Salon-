// SEO helpers (Stage 8): JSON-LD (BeautySalon, Service, BreadcrumbList), the share image path, the sitemap list.
// Compliance rules (CLAUDE.md, review finding):
//  - Service entries are built from page titles only (the public names), never from rawName.
//  - A page gets a Service only when it is indexable and has at least one public, non-prescription
//    price. Prescription services (and held-back prices) never reach Offer or price output.
//  - No aggregateRating or review markup: Google ignores it for a business's own reviews and it
//    risks a manual action.
import fs from "node:fs";
import { offer } from "./content.js";

const SERVICES = () => JSON.parse(fs.readFileSync("src/_data/services.json", "utf8"));
const abs = (site, p) => site.url + p;

// "/aesthetics/dermal-fillers/" -> "aesthetics-dermal-fillers"; "/" -> "home"
export const shareSlug = (url) => (String(url || "/").replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9]+/g, "-") || "home");

export function salonNode(site) {
  const dayName = { monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday" };
  return {
    "@type": "BeautySalon",
    "@id": abs(site, "/#salon"),
    name: site.tradingName,
    legalName: site.legalName,
    url: site.url + "/",
    telephone: site.phone.tel,
    email: site.email.general,
    foundingDate: String(site.established),
    image: abs(site, `/assets/img/share/home.jpg`),
    logo: abs(site, "/assets/img/brand/icons/urban-beauty-icon-512-white-bg.png"),
    priceRange: site.schema?.priceRange,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.line1,
      addressLocality: site.address.locality,
      addressRegion: site.address.town,
      postalCode: site.address.postcode,
      addressCountry: site.address.country,
    },
    ...(site.geo ? { geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lon } } : {}),
    hasMap: site.address.oneLine ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(site.address.oneLine) : undefined,
    openingHoursSpecification: site.hours.days.filter((d) => d.open).map((d) => ({
      "@type": "OpeningHoursSpecification", dayOfWeek: dayName[d.day], opens: d.open, closes: d.close,
    })),
    amenityFeature: [{ "@type": "LocationFeatureSpecification", name: "Free parking", value: true }],
    currenciesAccepted: "GBP",
    sameAs: [site.social.instagram, site.social.facebook],
  };
}

function serviceNode(site, ctx) {
  // Indexable treatment pages with a public, non-prescription price only.
  if (ctx.layout !== "layouts/treatment.njk" || ctx.noindex) return null;
  const byId = new Map(SERVICES().map((s) => [String(s.id), s]));
  const list = (Array.isArray(ctx.services) ? ctx.services : []).map((id) => byId.get(String(id))).filter(Boolean);
  if (list.some((s) => s.isPrescription)) return null; // a page that mentions a prescription service gets no Service
  const o = offer(ctx.services);
  if (!o.from) return null;
  return {
    "@type": "Service",
    "@id": abs(site, ctx.page.url) + "#service",
    name: ctx.title,
    serviceType: ctx.title,
    url: abs(site, ctx.page.url),
    description: ctx.metaDescription,
    provider: { "@id": abs(site, "/#salon") },
    areaServed: [{ "@type": "Place", name: site.address.locality }, { "@type": "Place", name: site.address.town }],
    offers: {
      "@type": "Offer",
      priceCurrency: "GBP",
      priceSpecification: { "@type": "PriceSpecification", minPrice: o.from, priceCurrency: "GBP" },
      url: abs(site, ctx.page.url),
    },
  };
}

function breadcrumbs(site, ctx) {
  const url = ctx.page.url;
  if (!url || url === "/") return null;
  const items = [{ name: "Home", url: "/" }];
  const sections = JSON.parse(fs.readFileSync("src/_data/sections.json", "utf8"));
  if (ctx.layout === "layouts/treatment.njk" && sections[ctx.section]) items.push({ name: sections[ctx.section].label, url: sections[ctx.section].url });
  items.push({ name: ctx.title, url });
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(site, it.url) })),
  };
}

export function graphFor(ctx) {
  const site = ctx.site;
  if (ctx.noindex || !ctx.page?.url) return null;
  const nodes = [];
  const full = ["/", "/contact/", "/about/"].includes(ctx.page.url);
  if (full) nodes.push(salonNode(site));
  const svc = serviceNode(site, ctx);
  if (svc) nodes.push(svc);
  const bc = breadcrumbs(site, ctx);
  if (bc) nodes.push(bc);
  if (!nodes.length) return null;
  return { "@context": "https://schema.org", "@graph": nodes };
}

const clean = (o) => JSON.parse(JSON.stringify(o)); // drops undefined

export function registerSeo(eleventyConfig) {
  eleventyConfig.addFilter("shareSlug", shareSlug);
  // {{ "" | jsonld | safe }}: the page's JSON-LD script, or nothing.
  eleventyConfig.addFilter("jsonld", function () {
    const g = graphFor(this.ctx);
    if (!g) return "";
    const json = JSON.stringify(clean(g)).replace(/</g, "\\u003c");
    return `<script type="application/ld+json">${json}</script>`;
  });
}
