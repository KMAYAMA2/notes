---
title: "Global fallback flag silently downgrades all queries after first failure"
date: 2026-02-19
category: logic-errors
tags: [execSync, retry-logic, fallback, qmd, semantic-clusters, GPU, cold-start]
module: content-analysis
severity: medium
symptoms:
  - "semantic-clusters.cjs returns only 42 results instead of 164"
  - "First qmd query fails (GPU cold start / non-zero exit), all subsequent queries silently use BM25"
  - "Cross-cluster notes show 0 connections (slug case mismatch from BM25 output)"
  - "Console shows 'qmd query failed, falling back to qmd search...' only once, then all queries run as search"
root_cause: "Module-level `let useQueryMode = true` flag was set to `false` in the catch block of the first failed query. Since it was global, every subsequent call to `runQuery()` skipped `qmd query` entirely and went straight to `qmd search` (BM25). The first failure was likely a GPU cold start causing a non-zero exit code despite producing valid output on stdout."
resolution_summary: "Changed fallback from global flag to per-query loop. Each query now tries `qmd query` first, falls back to `qmd search` independently. Also added e.stdout parsing — if execSync throws but stdout contains parseable results, use them instead of discarding."
---

# Global Fallback Flag Silently Downgrades All Queries

## Problem

`semantic-clusters.cjs` runs 20 seed queries through `qmd query` (hybrid + LLM reranking). On the first run, the script returned only 42 unique notes via BM25 instead of 164 via hybrid+rerank. The quality difference is significant — BM25 misses vocabulary-independent semantic matches.

## Root Cause

The original retry logic used a **global mutable flag**:

```javascript
let useQueryMode = true; // module-level — shared across ALL calls

function runQuery(queryText) {
  const cmd = useQueryMode
    ? `qmd query "${queryText}" -c vault -n 10`
    : `qmd search "${queryText}" -c vault -n 10`;
  try {
    return execSync(cmd, ...);
  } catch (e) {
    if (useQueryMode) {
      useQueryMode = false;  // PERMANENTLY switches mode for ALL future calls
      return runQuery(queryText);
    }
  }
}
```

When query #1 failed (likely GPU cold start — `qmd query` completed reranking but exited non-zero), the flag flipped to `false` and queries #2-#20 all used BM25 without ever attempting `qmd query`.

### Why execSync throws on "successful" qmd query

`child_process.execSync` throws on **any non-zero exit code**. `qmd query` can exit non-zero even when it produces valid results on stdout — e.g., GPU warnings on stderr, or terminal progress escape sequences (`]9;4;3`) confusing the exit status. The stdout contains perfectly good results, but `execSync` throws them away inside the error object's `.stdout` property.

## Fix

Two changes:

### 1. Per-query fallback loop (not global flag)

```javascript
function runQuery(queryText) {
  for (const mode of ['query', 'search']) {
    const cmd = `qmd ${mode} "${queryText}" -c vault -n 10`;
    try {
      const output = execSync(cmd, { ... });
      return { slugs, scores, mode, error: null };
    } catch (e) {
      // Try next mode...
      if (mode === 'query') continue;
      return { slugs: [], scores: [], mode, error: e.message };
    }
  }
}
```

Each query independently tries `qmd query` first, then falls back to `qmd search`. A failure on query #1 doesn't affect query #2.

### 2. Parse stdout from failed execSync

```javascript
catch (e) {
  if (e.stdout) {
    const { slugs, scores } = parseQmdOutput(e.stdout.replace(/\r/g, ''));
    if (slugs.length > 0) {
      return { slugs, scores, mode, error: null };
    }
  }
  if (mode === 'query') continue;
}
```

Even if `qmd query` exits non-zero, the error object's `.stdout` may contain valid results. Parse it before falling back.

## Result

- **Before**: 42 results (all BM25), 11 cross-cluster notes, 3 emergent themes
- **After**: 164 results (all hybrid+rerank), 8 cross-cluster notes with correct connection counts

## Prevention

### The pattern to avoid

Never use a **module-level mutable flag** to control retry/fallback behavior across independent operations. Each operation should make its own fallback decision.

**Bad** — global state mutation in error handler:
```javascript
let flag = true;
function doThing() {
  if (flag) { try { A() } catch { flag = false; B() } }
  else { B() }
}
```

**Good** — per-call fallback:
```javascript
function doThing() {
  try { return A() }
  catch { return B() }
}
```

### execSync stdout recovery

When using `execSync` with CLI tools that may exit non-zero despite producing output, always check `e.stdout` in the catch block before declaring failure. This is especially common with:
- GPU-accelerated tools (cold start, driver warnings)
- Tools that write progress to stderr (which may affect exit code)
- Tools with verbose terminal escape sequences

## Cross-references

- `docs/solutions/integration-issues/qmd-search-modes-and-cuda-failure.md` — the underlying qmd CUDA/Vulkan issue
- `docs/plans/scripts/semantic-clusters.cjs` — the fixed script
- `docs/plans/data/semantic-clusters.json` — output data
