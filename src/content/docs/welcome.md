---
title: Welcome to mdbook
created: 2026-04-28
updated: 2026-04-28
pinned: true
tags: [meta, intro]
order: 1
---

# Welcome

This is a **fixture document** shipped with the `mdbook` frontend for local development. Once wired to `dragonly/md` at build time, these fixtures disappear.

> [!NOTE]
> Markdown here stays vanilla. The UI renders what GitHub renders — nothing more.

## What you're looking at

- Two-column layout with a collapsible file tree
- Dark / light theme that follows your system and can be toggled
- Syntax-highlighted code blocks via **Shiki**
- Heading anchors (hover a heading to see)
- GFM tables, task lists, strikethrough

## Code

```ts
// A tiny example the renderer will highlight.
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

console.log(greet("agent"));
```

```python
def fib(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

## Tables

| Field     | Required | Notes                          |
| --------- | -------- | ------------------------------ |
| `title`   | no       | Defaults to filename           |
| `created` | yes      | Set once at creation           |
| `updated` | yes      | Bump on every edit             |
| `tags`    | no       | Array of strings               |

## Tasks

- [x] Initialize repo
- [x] Render markdown
- [ ] Ship v0.1

## Links

- Internal: [a nested example](./projects/mdbook-overview.md)
- External: [Astro docs](https://docs.astro.build)

---

Inline `code` looks like this. **Bold**, *italic*, ~~strikethrough~~, and a footnote-style reference all render cleanly.
