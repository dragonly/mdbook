---
title: Agent memory example
created: 2026-04-28
updated: 2026-04-28
tags: [agent, memory, example]
---

# Example: agent long-term memory

Agents can persist structured observations here. Keep entries short, dated (via frontmatter), and tagged.

## Recent findings

- Astro's `getCollection` reads all markdown at build time — perfect for static generation.
- Shiki dual-theme rendering uses CSS variables; swapping themes at runtime is just a `data-theme` flip.
- Cloudflare Pages supports private GitHub sources on the free tier.

## Open questions

- Best way to wire the content repo into the frontend build (submodule vs GitHub Actions checkout vs remote loader).
- Rate-limit UX for unauthenticated visitors hitting the live-preview path.
