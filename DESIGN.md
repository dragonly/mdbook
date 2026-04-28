# mdbook — Design Memo

A markdown documentation service optimized for both humans and agents. GitHub is the backend; the UI is a thin, beautiful renderer.

## 1. Positioning

- **Users**: single user (me), private-first, with selective public sharing as a future feature.
- **Agents**: local coding agents (pi, Claude Code, Cursor) are primary — they read/write via `git`. Cloud agents are secondary — supported later via a thin MCP server over GitHub REST API.
- **Content type**: hybrid of personal knowledge base + agent long-term memory.
- **Principle**: markdown stays vanilla. No custom DSL (no wikilinks, no custom directives). Rendering only enhances readability; it never introduces syntax GitHub can't render.

## 2. Storage

- **Content repo**: `git@github.com-personal:dragonly/md` (private).
- **Frontend repo**: `git@github.com-personal:dragonly/mdbook` (can be public).
- **Single repo** for all content; folders organize, not repos.
- **Default folder convention** (non-enforced):
  - `notes/` — general notes
  - `projects/` — project docs
  - `memory/` — agent long-term memory
  - `attachments/<year>/<month>/` — images & media
- **File naming**: free-form, kebab-case encouraged, CJK allowed. Path = identity (no slug/id field).
- **Frontmatter** (minimal YAML):
  ```yaml
  title: optional (defaults to filename)
  created: ISO date (written once at creation)
  updated: ISO date (agents must bump on every edit)
  tags: [list]
  pinned: bool (show on home)
  order: number (manual sort in tree)
  draft: bool (hidden from UI and search)
  ```

## 3. Read / Write Paths

- **Agent writes**: preferred path is local `git clone` → edit files → `git commit` → `git push`. Cloud agents use GitHub Contents API (future MCP server).
- **UI reads**: static site (Astro SSG) built from the content repo at build time; plus a client-side live-preview fallback that fetches via GitHub API when a path isn't in the build (handles "just pushed, build still running").
- **No self-hosted backend.** GitHub is the backend.

## 4. Frontend Stack

- **Framework**: Astro (SSG) + client-side live-preview fallback.
- **Markdown**: `remark` + `rehype` (unified ecosystem), GFM enabled.
- **Syntax highlighting**: Shiki (VSCode-parity, build-time).
- **Search** (v0.2): Pagefind (static index, client-side).
- **Fonts**:
  - Body EN: Inter / `-apple-system`
  - Body CJK: `PingFang SC` / `Noto Sans SC`
  - Mono: JetBrains Mono / `ui-monospace`
  - Line-height 1.7–1.8, generous paragraph spacing, CJK/EN mixed spacing.
- **Themes**: light + dark, follow system + manual toggle, Shiki theme synced.
- **Layout**: two-column. Left collapsible file tree (mobile: drawer), right content. TOC inline at top of article (collapsible), not a third column.
- **i18n**: all UI strings through an i18n layer from day 1. v0.1 ships English only; CJK locale added in v0.2. No language switcher until a second locale exists.
- **Editing**: read-only UI. All editing happens in local editors (VSCode / Obsidian) and is pushed via git. A "open in GitHub.dev" external link is acceptable.

## 5. Rendering Feature List

### v0.1 (must have)
- GFM (tables, task lists, strikethrough, autolinks)
- Shiki code highlighting
- GitHub-style callouts (`> [!NOTE]`, `[!WARNING]`, …)
- Heading anchors
- Relative link rewriting (`./foo.md` → SPA route)
- Image rendering with lazy load
- Dark/light theme
- Frontmatter parsing

### v0.2 (should have)
- Pagefind full-text search
- Tag pages (`/tags/<tag>`) + tag chips on articles
- Code block "copy" button
- Heading hover `#` link affordance
- Image click-to-zoom (lightbox)
- CJK locale
- KaTeX (opt-in)
- Mermaid (opt-in)

### v1.0+ (nice to have)
- MCP server for cloud agents
- Selective publish (`public: true` → mirror to public repo/gist)
- Backlinks
- Custom domain
- PWA / offline cache
- Floating TOC

### Non-goals (won't build pre-v1)
- Web editor
- Multi-user collab / realtime sync
- Wikilink `[[...]]`
- Self-hosted backend (search, auth, cache)
- Comments
- Account system (PAT is identity)
- In-UI history viewer (external link to GitHub)
- Code line numbers
- Plugin/theme marketplace

## 6. Deployment & Hosting

- **Host**: Cloudflare Pages (free, supports private source, fast in CN, easy custom domain).
- **Trigger**: GitHub Actions on push to `main` of the content repo → rebuild & deploy.
- **Domain**: `*.pages.dev` for v0.1; custom domain post-v1.
- **No scheduled rebuilds.**

## 7. Auth Model

- Content repo is **private**.
- UI prompts for a **fine-grained GitHub PAT** (scope: contents:read on the content repo only) on first visit. Stored in `localStorage`.
- Frontend calls `api.github.com` directly with the PAT for live-preview fallback. No OAuth, no backend middleman.
- "Clear token" button in settings. README documents the security model explicitly.
- PAT invalid → modal + deep link to GitHub token settings.
- Rate limit: no always-on quota display; toast warning when remaining < 100.

## 8. Agent Workflow Conventions

Codified in `AGENTS.md` at the root of the content repo.

- **Auto commit + push** after every write (no manual review in memory scenarios; git history is the review surface).
- **Commit message**: `docs(<folder>): <filename> — <one-line summary>`
  - e.g. `docs(memory): project-foo — add deployment notes`
- **Frontmatter**:
  - `created` written once on file creation.
  - `updated` bumped to current ISO date on every edit.
- **Folder defaults** per type of content (see §2).
- **Images**: commit alongside the markdown under `attachments/<year>/<month>/`. Compress if > 2 MB. No LFS.

## 9. UX Details

- **Home page**: latest 10 updated docs + pinned docs. Not the repo README.
- **File tree**: alphabetical with directories first; respects `order` frontmatter; hides `draft: true`, `_`-prefixed paths, and repo-management files (`.github/`, `README.md`, `AGENTS.md`, `DESIGN.md` optional). Hover shows `updated`.
- **404**: custom page with search, home link, and a "just created? build may be running" hint.
- **Live preview**: when SPA route misses the build, fetch raw markdown via GitHub API, render client-side with the same pipeline, and show a small `⚡ live preview` badge.
- **History**: "View on GitHub" external link per document, pointing at `/commits/main/<path>`.
- **Big files**: no special handling in v0.1.

## 10. Implementation Order

Each step yields a demo-able artifact.

1. **Astro skeleton + local md rendering** — two-column layout rendering a fixture folder of markdown files, no GitHub yet.
2. **Rendering pipeline** — GFM + Shiki + callouts + relative-link rewriting + light/dark theme + frontmatter parsing.
3. **GitHub integration at build time** — Action checks out both `dragonly/mdbook` and `dragonly/md`, builds combined.
4. **Cloudflare Pages deploy** — push-to-deploy wired up end-to-end.
5. **PAT login + live-preview fallback** — v0.1 feature-complete.
6. **Write `AGENTS.md` in content repo + field-test agent write loop** — with pi and Claude Code.
7. Enter v0.2 scope.

## 11. Repos Summary

| Repo | Visibility | Purpose |
|---|---|---|
| `git@github.com-personal:dragonly/mdbook` | public (OK) | Astro frontend, deploy pipeline, this design memo |
| `git@github.com-personal:dragonly/md` | private | Markdown content + `AGENTS.md` conventions |
