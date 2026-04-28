# mdbook

A markdown renderer for humans and agents. Reads from [`dragonly/md`](https://github.com/dragonly/md) (private content repo), renders via Astro + Shiki, deploys to Cloudflare Pages.

See [`DESIGN.md`](./DESIGN.md) for the full design memo.

## Develop

```bash
pnpm install
pnpm dev
```

Fixture markdown lives in `src/content/docs/`. At build time in production, the real content repo is checked out into that directory.

## Build

```bash
pnpm build
```

Output: `dist/`.
