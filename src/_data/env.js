// production is true only for the live deploy (Netlify sets CONTEXT=production) or when ELEVENTY_ENV=production.
// Plausible analytics loads only then, so local builds and deploy previews never count visits.
export default {
  production: process.env.CONTEXT === "production" || process.env.ELEVENTY_ENV === "production",
};
