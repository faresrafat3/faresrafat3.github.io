# faresrafat3.github.io

The public front door: one page that says what the work is, and a gate that
refuses to let the page lie about it.

## What the page claims

> I build the gate that decides whether an agent's work counts.

Regression suites, deterministic replay, escalation rules and audit trails
for AI agents. Open for contract.

## The gate that keeps it honest

```sh
node check-claims.mjs
```

This page once published "67 offline tests" for colony-kernel and "78" for
agent-handoff while the first ran 117 and the second 82. Both numbers were
true when they were written and nothing noticed when they stopped being
true. A sales page is the worst place for an unmeasured number — it is the
number a buyer trusts, and it is a copy of a fact owned by another
repository.

So `check-claims.mjs` measures the sibling projects the same way the monorepo
pattern already does, and **refuses any line that states a count its project
does not produce**. A missing sibling, unreadable output, or a stale number
is a failed gate, not a warning.

## Layout

| File | What it is |
|---|---|
| `index.html` | The page itself |
| `check-claims.mjs` | The gate — run it before every push |
| `404.html` · `robots.txt` · `og.png` | Standard site furniture |
| `.nojekyll` | Serve as-is |

## Rule

Never push a number to this page that `check-claims.mjs` has not confirmed
this session. The page is the one place a false number costs the most.
