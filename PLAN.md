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

### Step 2 — Rendering pipeline polish ✅

Demo: vanilla markdown rendered with GitHub parity + theme-aware polish.

- ✅ GFM (tables, task lists, strikethrough, autolinks) via Astro's default remark-gfm
- ✅ Shiki dual-theme syntax highlighting (github-light / github-dark)
- ✅ Heading anchors (`rehype-slug` + `rehype-autolink-headings`, hover-reveal `#`)
- ✅ Dark / light theme toggle (system-follow + manual, pre-paint script, `localStorage` persist)
- ✅ Readable typography (Inter + PingFang SC + JetBrains Mono, line-height 1.75)
- ✅ Table / blockquote / image / hr styling
- ✅ Mobile layout (sidebar becomes drawer)
- ✅ GitHub-style callouts via `remark-github-blockquote-alert` with custom color system
- ✅ Relative `.md` link rewriting to SPA routes (custom rehype plugin `src/lib/rehype-md-links.ts`)
- ✅ Image `loading="lazy"` + `decoding="async"` injected by the same plugin

### Step 3 — Hook up the real content repo at build time ✅

Demo: pushing to `dragonly/md` triggers a build that includes the real content.

**Decision: 3a — GitHub Actions w/ dual checkout.** Chose this over submodules (agent friction) and remote content loader (extra code, rate-limit exposure).

- ✅ `scripts/sync-content.sh` — clones `dragonly/md` (via SSH locally or PAT in CI), replaces `src/content/docs/`, filters out `.git`, `.github`, `README.md`, `AGENTS.md`
- ✅ `.github/workflows/deploy.yml` in `mdbook` — triggers on push, `repository_dispatch: content-updated`, or manual; installs deps, syncs content, builds, uploads artifact, and conditionally deploys to Cloudflare Pages (skipped if secrets absent)
- ✅ `.github/workflows/notify-mdbook.yml` in `dragonly/md` — on content push, dispatches `content-updated` to `dragonly/mdbook` (no-op if `MDBOOK_DISPATCH_TOKEN` secret not set)
- ✅ Local verification: `CONTENT_REPO_SSH=1 ./scripts/sync-content.sh && pnpm build` produces empty-but-valid site; fixtures restored via `git checkout` for dev
- ⚠️ Secrets to add manually (out-of-band):
  - `dragonly/mdbook` repo secret `CONTENT_REPO_TOKEN` — fine-grained PAT with contents:read on `dragonly/md`
  - `dragonly/md` repo secret `MDBOOK_DISPATCH_TOKEN` — fine-grained PAT with actions:write on `dragonly/mdbook`
  - (Step 4) `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` in `dragonly/mdbook`

### Step 4 — Cloudflare Pages deploy ✅

Demo: `https://mdbook-3vn.pages.dev` serves the latest content on every push.

- ✅ Cloudflare Pages project `mdbook` created via `wrangler pages project create`
- ✅ `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` set as `dragonly/mdbook` repo secrets
- ✅ `CONTENT_REPO_TOKEN` set (fine-grained PAT, contents:read on `dragonly/md`)
- ✅ `MDBOOK_DISPATCH_TOKEN` set in `dragonly/md` (PAT with actions:write on `dragonly/mdbook`)
- ✅ Cross-repo dispatch uses `workflow_dispatch` endpoint (not `repository_dispatch`) — needs only actions:write, not contents:write
- ✅ End-to-end smoke test: `notes/hello.md` pushed to content repo → rebuilt + live within ~90s — callouts, Shiki, pinned home section, external GitHub link all render correctly

### Step 5 — PAT login + live-preview fallback ✅

Demo: a doc created 5 seconds ago (not yet in the build) renders correctly with a `⚡ live preview` badge.

- ✅ `SettingsModal.astro` — `<dialog>`-based modal with PAT input, content-repo override, save/cancel/clear buttons, click-outside-to-close
- ✅ Settings button (gear icon) in topbar; `data-action="open-settings"` delegation opens it from anywhere
- ✅ PAT stored in `localStorage` under `mdbook:pat`; content-repo override under `mdbook:content-repo`
- ✅ 404 page runs `tryLive()` on load: derives `<path>.md` from URL, fetches `api.github.com/repos/<repo>/contents/<path>` with `Accept: application/vnd.github.raw`
- ✅ Client-side rendering via `marked` (GFM), with post-processors for GitHub callouts, relative `.md` link rewriting, and `loading="lazy"` on images — keeps visual parity with build-time output
- ✅ `⚡ live preview` badge on fallback-rendered pages + modified `<title>` suffix `(preview)`
- ✅ 401 / 403 → toast + auto-open settings modal
- ✅ Rate-limit remaining < 100 → toast warning
- ✅ Auto re-run after Settings save (`mdbook:settings-saved` event)

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
- **2026-04-28** — **Step 3a** (GitHub Actions dual checkout) chosen over submodule / remote loader. Workflow dispatch from content repo triggers frontend rebuild.
- **2026-04-28** — Build artifact deployed via `cloudflare/wrangler-action` from GitHub Actions, not via Cloudflare Pages' native git integration — lets us keep content-repo PAT in GitHub secrets rather than Cloudflare env.
- **2026-04-28** — Cross-repo trigger uses `workflow_dispatch` endpoint instead of `repository_dispatch` — the former needs only `actions:write` on the fine-grained PAT, the latter silently requires `contents:write`.
- **2026-04-28** — Site live at `https://mdbook-3vn.pages.dev`. End-to-end loop verified.
