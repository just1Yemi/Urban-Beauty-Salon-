// Clean URLs for every page in src/content (see CONTENT_GUIDE.md):
// hub /<section>/, treatment /<section>/<slug>/, text page /<slug>/.
import { permalinkFor } from "../../lib/content.js";

export default {
  eleventyComputed: {
    permalink: (data) => permalinkFor(data),
  },
};
