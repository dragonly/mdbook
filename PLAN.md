# PLAN.md — mdbook Implementation Plan

Living document. Tracks what's done, what's next, and the scope for each release. Pairs with [`DESIGN.md`](./DESIGN.md) (why) — this file is the how + when.

Legend: ✅ done · 🚧 in progress · ⬜ todo · ❄️ deferred / out of scope

---

## v0.1 — Minimum Usable Loop

Goal: a private, statically-built, readable renderer for `dragonly/md`, auto-deployed on push, with a client-side live-preview fallback. Agents write via local `git`.

### Step 1 — Astro skeleton + local markdown rendering ✅

Demo: two-column layout rendering a fixture folder of markdown, no GitHub yet.

- ✅ `package.json`, `astro.config.mjs`, `tsconfig.json`
- ✅ Content collection defined (`src/content.config.ts`) with full frontmatter schema: `title / created / updated / tags / pinned / order / draft`
- ✅ Base layout with topbar + collapsible left file tree + right content
- ✅ Recursive `TreeItem.astro` for arbitrary-depth folders
- ✅ Home page (pinned + latest 10)
- ✅ Dynamic `[...slug].astro` doc page with title, meta row (updated / created / tags), "View on GitHub" external link
- ✅ Custom `404.astro`
- ✅ i18n scaffold (`src/i18n/`, English dictionary only, all UI strings via `t()`)
- ✅ Three fixture markdown files validating the pipeline
- ✅ `pnpm build` green, 5 static pages generated

### Step 2 — Rendering pipeline polish ✅ (core) / 🚧 (extras)

Demo: vanilla markdown rendered with GitHub parity + theme-aware polish.

- ✅ GFM (tables, task lists, strikethrough, autolinks) via Astro's default remark-gfm
- ✅ Shiki dual-theme syntax highlighting (github-light / github-dark)
- ✅ Heading anchors (`rehype-slug` + `rehype-autolink-headings`, hover-reveal `#`)
- ✅ Dark / light theme toggle (system-follow + manual, pre-paint script, `localStorage` persist)
- ✅ Readable typography (Inter + PingFang SC + JetBrains Mono, line-height 1.75)
- ✅ Table / blockquote / image / hr styling
- ✅ Mobile layout (sidebar becomes drawer)
- ⬜ GitHub-style callouts (`> [!NOTE]` etc.) — needs a remark plugin; base blockquote styling in place
- ⬜ Relative link rewriting (`./foo.md` → SPA route) — v0.1 must-have, not yet wired
- ⬜ Image lazy-load attribute on `<img>` (CSS hint present, HTML attr not yet)

### Step 3 — Hook up the real content repo at build time ⬜

Demo: pushing to `dragonly/md` triggers a build that includes the real content.

Decision needed (pick one):
- **3a — GitHub Actions w/ dual checkout (recommended)**: workflow checks out `dragonly/mdbook` into root and `dragonly/md` into `src/content/docs/`, then builds. Pros: no submodule ceremony, keeps content repo independent; Cons: requires a PAT secret with read access to private content repo.
- **3b — Git submodule**: add `dragonly/md` as a submodule at `src/content/docs/`. Pros: works identically locally and in CI; Cons: submodule friction, agents need to remember `--recurse-submodules`.
- **3c — Remote content loader at build time**: a custom Astro content loader that fetches via GitHub API. Pros: nothing on disk; Cons: more code, slower builds, API-rate-limit exposure.

Leaning **3a**. Creates a fine-grained PAT (contents:read on `dragonly/md`), stored as a Cloudflare / GitHub Actions secret.

Tasks:
- ⬜ Choose strategy (recommend 3a)
- ⬜ `.github/workflows/deploy.yml` in `mdbook`
- ⬜ PAT stored as repo secret `CONTENT_REPO_TOKEN`
- ⬜ Build script clears `src/content/docs/` fixtures, copies real content, then `astro build`
- ⬜ A webhook / `repository_dispatch` from `dragonly/md` pushes to trigger rebuild when content changes

### Step 4 — Cloudflare Pages deploy ⬜

Demo: `https://<project>.pages.dev` serves the latest content on every push.

- ⬜ Create Cloudflare Pages project pointing at `dragonly/mdbook`
- ⬜ Build command `pnpm build`, output `dist`
- ⬜ Wire `CONTENT_REPO_TOKEN` as a Pages env secret
- ⬜ Configure cross-repo trigger: `dragonly/md` push → `repository_dispatch` on `dragonly/mdbook` → Pages rebuild
- ⬜ Smoke test: push a new doc in `dragonly/md`, verify it appears on `*.pages.dev` within a minute

### Step 5 — PAT login + live-preview fallback ⬜

Demo: a doc created 5 seconds ago (not yet in the build) renders correctly with a `⚡ live preview` badge.

- ⬜ Settings panel (modal): enter GitHub PAT, stored in `localStorage` under a namespaced key, "clear token" button
- ⬜ On doc 404 (SPA route miss), client fetches `https://api.github.com/repos/dragonly/md/contents/<path>` with the PAT, base64-decodes, renders client-side
- ⬜ Client renderer reuses the same pipeline shape (GFM + Shiki + callouts) — use a compact bundle (marked + shiki web)
- ⬜ `⚡ live preview` badge on such pages, plus a note "cached build may not include this yet"
- ⬜ 401 / 403 → open PAT modal with deep link to GitHub token settings
- ⬜ Rate-limit remaining < 100 → toast warning

### Step 6 — Field-test agent write loop ⬜

Demo: pi and Claude Code both successfully write a doc into `dragonly/md` following `AGENTS.md` conventions and the site reflects it end-to-end.

- ⬜ Walk-through with pi
- ⬜ Walk-through with Claude Code
- ⬜ Fix any sharp edges in `AGENTS.md` rules

**v0.1 exit criteria:** I can ask an agent "note down X under memory/", the agent commits+pushes, and within ~1 minute the doc is live on `*.pages.dev`; I can read it on mobile in dark mode; I can click "View on GitHub" to see history.

---

## v0.2 — Readability & Search

- ⬜ Pagefind full-text search (build-time index, client-side)
- ⬜ Tag pages (`/tags/<tag>`) + tag chips on articles (chips already render; links pending)
- ⬜ Code block "copy" button
- ⬜ Image click-to-zoom (lightbox)
- ⬜ CJK locale (`zh-CN.json`) + language switcher
- ⬜ KaTeX math (opt-in via frontmatter flag or auto-detect)
- ⬜ Mermaid diagrams (opt-in)
- ⬜ GitHub-style callouts via proper remark plugin (promoted from v0.1 if not done)

---

## v1.0+ — Polish & Expansion

- ⬜ Thin MCP server for cloud agents (wraps GitHub Contents API)
- ⬜ Selective publish (`public: true` mirrors to a public repo/gist)
- ⬜ Backlinks
- ⬜ Custom domain
- ⬜ PWA / offline cache
- ⬜ Floating TOC on wide screens

---

## Non-goals (won't do before v1)

- ❄️ Web editor
- ❄️ Multi-user collab / realtime sync
- ❄️ Wikilink `[[...]]`
- ❄️ Self-hosted backend (search, auth, cache)
- ❄️ Comments
- ❄️ Account system (PAT is identity)
- ❄️ In-UI history viewer (external link to GitHub)
- ❄️ Code line numbers
- ❄️ Plugin/theme marketplace

---

## Decision log

- **2026-04-28** — Chose Astro SSG + client live-preview fallback over full SPA or pure SSG.
- **2026-04-28** — Chose Cloudflare Pages over Vercel / GitHub Pages (private source, CN speed).
- **2026-04-28** — PAT in `localStorage`; no OAuth, no backend.
- **2026-04-28** — Split repos: `dragonly/md` (private content) + `dragonly/mdbook` (public frontend).
- **2026-04-28** — Commit format `docs(<folder>): <filename> — <summary>`. Auto commit + push from agents.
- **2026-04-28** — i18n layer from day 1, English-only for v0.1.
- **2026-04-28** — Leaning toward Step 3a (GitHub Actions dual checkout) over submodule / remote loader. Final pick during Step 3.
