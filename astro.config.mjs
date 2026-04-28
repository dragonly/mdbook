import { defineConfig } from "astro/config";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { remarkAlert } from "remark-github-blockquote-alert";
import { rehypeMdLinksAndImages } from "./src/lib/rehype-md-links";

// https://astro.build/config
export default defineConfig({
  site: "https://mdbook.pages.dev",
  markdown: {
    gfm: true,
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      wrap: true,
    },
    remarkPlugins: [remarkAlert],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: { className: ["heading-anchor"], ariaLabel: "Anchor" },
          content: { type: "text", value: "#" },
        },
      ],
      rehypeMdLinksAndImages,
    ],
  },
});
