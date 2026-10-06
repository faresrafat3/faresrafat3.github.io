# AGENTS.md — the boot contract for faresrafat3.github.io

This repo is the services page. It is small on purpose: one page, one 404, one
image, one gate. Opening it? Read this file first.

## What this repo owns

| Path | What it is | May you touch it? |
|---|---|---|
| `index.html` | The services page — the only page here | Yes — keep the gate green |
| `404.html` | Branded not-found page | Yes |
| `og.png` | Social card (1200×630) | Yes — regenerate both meta and image together |
| `check-claims.mjs` | Gate: advertised test counts must be measured | Yes |
| `robots.txt`, `.nojekyll` | Pages config | Rarely |

## What this repo does NOT own

`/colony-kernel/` is served by the **colony-kernel repo's own `gh-pages`
branch**, not from here. A copy used to live in this repo and it was never
served — a project page outranks the user-site directory at the same path.
Keeping it was a trap: it looked authoritative, it drifted, and nobody could
tell which file a visitor was reading. Do not re-add it. The canonical source
is `~/Projects/colony-kernel/docs/site/index.html`, published by that repo's
`scripts/publish-site.sh`.

## The one command

```
node check-claims.mjs
```

Measures colony-kernel (vitest) and agent-handoff (pytest) as sibling
checkouts and refuses any line of `index.html` that states a count the named
project does not produce. A missing sibling or an unreadable test run exits 2:
never a silent pass. Clones must sit beside this repo, as `~/Projects/*`.

This page once advertised "67 offline tests" and "78 tests" while the projects
ran 117 and 82. Both numbers were true once and nothing noticed when they
stopped being true, because a number copied into a sales page is a copy of a
fact another repository owns.

## Rules

- `node check-claims.mjs` green before every push.
- Never restate a test count without naming the project it belongs to; never
  copy a number from a project page into this one.
- One home per fact. If a page belongs to another repo, publish it there.
- Artifacts in English; chat with the Owner in Arabic.
- Push everything. No force-push (R4 of the workspace contract).

## Publishing

GitHub Pages builds `main` automatically. There is no deploy script here —
commit, push, then read the live page back before claiming a change shipped.