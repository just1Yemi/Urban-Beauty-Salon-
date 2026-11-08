export default function (eleventyConfig) {
  // Copy published assets folder by folder. src/assets/img/source (full-size originals and
  // source videos) is git-ignored and must never be copied into _site.
  for (const dir of ["css", "js", "fonts", "video", "img/brand", "img/salon"]) {
    eleventyConfig.addPassthroughCopy({ [`src/assets/${dir}`]: `assets/${dir}` });
  }
  eleventyConfig.ignores.add("src/assets/img/source/**");
  eleventyConfig.addWatchTarget("src/assets/");

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"],
  };
}
