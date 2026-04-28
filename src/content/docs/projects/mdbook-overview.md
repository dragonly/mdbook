---
title: mdbook — Overview
created: 2026-04-28
updated: 2026-04-28
tags: [mdbook, design]
---

# mdbook overview

A thin, beautiful renderer for a GitHub-backed markdown library. Read by humans, written by agents.

## Principles

1. **GitHub is the backend.** No self-hosted server.
2. **Vanilla markdown.** No custom DSL; what GitHub renders is what we render (plus visual polish).
3. **Static first.** Built with Astro, deployed to Cloudflare Pages.
4. **Live preview fallback.** Just-pushed docs appear via a client-side GitHub API fetch while the build runs.

See [`DESIGN.md`](https://github.com/dragonly/mdbook/blob/main/DESIGN.md) in this repo for the full design memo.
