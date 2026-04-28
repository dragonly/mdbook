/**
 * rehype plugin: rewrite relative `.md` / `.md#hash` links to SPA routes,
 * and add `loading="lazy"` / `decoding="async"` to <img>.
 *
 * Leaves absolute URLs and non-markdown links untouched.
 */
import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";

export function rehypeMdLinksAndImages() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "a" && node.properties && typeof node.properties.href === "string") {
        const href = node.properties.href;
        // Skip absolute URLs, anchors, mailto, etc.
        if (/^(https?:|mailto:|tel:|#|\/)/.test(href)) return;
        // Only rewrite paths ending in .md (optionally with #fragment or ?query)
        const m = href.match(/^(.*?)\.md(#[^?]*)?(\?.*)?$/);
        if (m) {
          const [, path, hash = "", query = ""] = m;
          // Ensure trailing slash (matches Astro default page output) and leading ./
          const cleaned = path.replace(/^\.\//, "");
          node.properties.href = `${cleaned}/${query}${hash}`;
        }
      }
      if (node.tagName === "img" && node.properties) {
        if (!node.properties.loading) node.properties.loading = "lazy";
        if (!node.properties.decoding) node.properties.decoding = "async";
      }
    });
  };
}
