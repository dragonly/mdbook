# mdbook

A markdown renderer for humans and agents. Reads from [`dragonly/md`](https://github.com/dragonly/md) (private content repo), renders via Astro + Shiki, deploys to Cloudflare Pages.

See [`DESIGN.md`](./DESIGN.md) for the full design memo.

## Develop

```bash
pnpm install
pnpm dev
```

Fixture markdown lives in `src/content/docs/`. To render against the real content repo locally:

```bash
CONTENT_REPO_SSH=1 ./scripts/sync-content.sh
pnpm build
```

(Restore fixtures with `git checkout src/content/docs/`.)

## Build

```bash
pnpm build
```

Output: `dist/`.

## Deploy

CI is wired via `.github/workflows/deploy.yml`. Required secrets on `dragonly/mdbook`:

| Secret | Purpose |
|---|---|
| `CONTENT_REPO_TOKEN` | Fine-grained PAT, contents:read on `dragonly/md` |
| `CLOUDFLARE_API_TOKEN` | CF Pages — Edit permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

The workflow triggers on push, `repository_dispatch: content-updated`, or manual. A companion workflow in `dragonly/md` fires the dispatch on every content push (needs `MDBOOK_DISPATCH_TOKEN` there — a PAT with `actions:write` on `dragonly/mdbook`)./n
