---
title: "qmd search modes: BM25, vsearch, and query (CUDA failure)"
date: 2026-02-18
category: integration-issues
tags: [qmd, semantic-search, vsearch, BM25, CUDA, vector-search, LLM-reranking, vault-analysis]
module: content-analysis
severity: medium
symptoms:
  - "qmd search works (BM25 keyword matching)"
  - "qmd vsearch works (vector semantic search)"
  - "qmd query fails with CUDA error at ggml-cuda.cu:96"
  - "vsearch triggers 1.28GB model download on first use"
root_cause: "qmd's ensureLlama() in llm.js prefers CUDA over Vulkan. getLlama({gpu:'cuda'}) succeeds but ggml-cuda.cu:96 crashes during model loading. The CPU fallback catch block only catches getLlama() failures, not later model/context crashes."
resolution_summary: "Patch qmd's dist/llm.js to change GPU preference from CUDA > Vulkan to Vulkan > CUDA (one-line change). Or force gpu:false for CPU-only. Prebuilt Vulkan binary exists at @node-llama-cpp/win-x64-vulkan. Workaround: use search + vsearch separately."
---

# qmd Search Modes: How to Run Each, and Why `query` Fails

## Overview

qmd v1.0.6 has three search modes with increasing sophistication:

| Mode | Command | What it does | Status |
|------|---------|-------------|--------|
| **BM25** | `qmd search "query" -c vault` | Keyword matching (like fancy grep) | WORKS |
| **vsearch** | `qmd vsearch "query" -c vault` | Vector semantic similarity | WORKS |
| **query** | `qmd query "query" -c vault` | Hybrid (BM25 + vector) + LLM reranking | WORKS (after Vulkan patch) |

## How to Run Each Mode

### BM25 keyword search

```bash
qmd search "epistemology Popper" -c vault -n 10
```

Finds notes containing or closely matching these exact words. Fast, deterministic. Good for finding notes when you know the vocabulary used.

**Add `-n N`** to control result count (default varies). Results include file path, title, and a relevance score.

### vsearch (vector semantic search)

```bash
qmd vsearch "how to improve writing craft and become a better essayist" -c vault -n 10
```

Finds notes that are *about the same thing* regardless of vocabulary. Uses the embedding model (embeddinggemma-300M) to compare meaning, not words.

**This is qmd's killer feature.** In testing, BM25 returned zero results for "writing improvement" queries, while vsearch found William Zinsser notes, storytelling theory, narrative structure — a rich cluster using vocabulary like "simplicity," "clarity," "rewriting" instead of "writing improvement."

**First-run note**: vsearch triggers a ~1.28GB model download (query expansion model, 1.7B GGUF) on first use. Takes a few minutes at ~2-3MB/s. Subsequent runs are instant.

### query (hybrid + LLM reranking) — FIXED (Vulkan patch)

```bash
qmd query "best ideas about essay writing" -c vault -n 10
```

Combines BM25 + vector search + uses a 0.6B reranking model to sort results by relevance. Should be the best mode.

**Fails with**:
```
CUDA error at ggml-cuda.cu:96
```

Same root cause as the embedding CUDA issue — the reranking model runs through node-llama-cpp which crashes on our CUDA setup (driver 591.86 + Toolkit 13.1).

## Root Cause Analysis (Source Code)

The crash path in `qmd/dist/llm.js`:

1. **`ensureLlama()` (line ~245)** detects GPU types via `getLlamaGpuTypes()`, then picks `["cuda", "metal", "vulkan"].find(...)` — CUDA wins because CUDA Toolkit 13.1 is installed.
2. **`getLlama({ gpu: "cuda" })` succeeds** — it loads the CUDA binary and initializes the backend. No error here.
3. **`llama.loadModel({ modelPath })` or `model.createRankingContext()` crashes** — the actual CUDA kernel at `ggml-cuda.cu:96` fails when executing GPU operations.
4. **The catch block doesn't help** — it only catches `getLlama()` failures, not later model/context crashes:

```javascript
// qmd/dist/llm.js ensureLlama() — the problematic preference order
const preferred = ["cuda", "metal", "vulkan"].find(g => gpuTypes.includes(g));
// FIX: change to ["vulkan", "metal", "cuda"] or just use "vulkan"
```

## Fix: Patch GPU Preference Order

Edit `qmd/dist/llm.js` line ~253 to prefer Vulkan over CUDA:

```javascript
// BEFORE (crashes):
const preferred = ["cuda", "metal", "vulkan"].find(g => gpuTypes.includes(g));

// AFTER (should work — prebuilt Vulkan binary exists):
const preferred = ["vulkan", "metal", "cuda"].find(g => gpuTypes.includes(g));
```

**File location**: `C:\Users\Kento\AppData\Roaming\nvm\v25.5.0\node_modules\@tobilu\qmd\dist\llm.js`

**Verified working**: Tested 2026-02-18. `qmd status` shows `GPU: vulkan (offloading: yes)` and `qmd query` successfully expands queries, searches, and reranks with Vulkan GPU acceleration.

**Alternative**: Force CPU with `const preferred = undefined;` (slower but guaranteed to work).

**Caveat**: This patch gets overwritten on `npm install -g @tobilu/qmd` updates. Re-apply after upgrades.

## Attempted Fixes That Did NOT Work

| Attempt | Why it failed |
|---------|--------------|
| `NODE_LLAMA_CPP_GPU=false` | Only affects `qmd embed` compilation, not query runtime |
| Rebuild from source with CUDA | Same ggml-cuda.cu:96 crash — the CUDA driver/toolkit combo is fundamentally broken |
| `CUDA_VISIBLE_DEVICES=""` | CUDA binary crashes at initialization before checking devices |
| `--gpu false` local build | Built OK, but node-llama-cpp prefers the CUDA prebuilt at `@node-llama-cpp/win-x64-cuda` |
| Delete CUDA prebuilt packages | Auto-rebuilds from source WITH CUDA (auto-detects CUDA Toolkit 13.1) |
| Vulkan source build | cmake fails at vulkan-shaders-gen step |

## node-llama-cpp Binary Selection Order

1. Prebuilt packages at `node_modules/@node-llama-cpp/win-x64-{cuda,vulkan,etc}`
2. Local builds at `node_modules/node-llama-cpp/llama/localBuilds/win-x64-{cuda,vulkan,etc}`
3. Auto-build from source with detected GPU type

Since CUDA Toolkit is always detected, CPU-only local builds are never selected.

## When to Use Which

| Use case | Mode | Why |
|----------|------|-----|
| Find notes using specific terms | `search` (BM25) | Exact vocabulary match |
| Find notes about a *concept* | `vsearch` | Meaning-based, vocabulary-independent |
| Explore what the vault says about a topic | Both: `search` then `vsearch` | BM25 finds the obvious; vsearch finds the hidden |
| Get the absolute best results | `query` | Hybrid + LLM reranking (requires Vulkan patch) |

**Recommended workflow**: Run both `search` and `vsearch` for the same query. They return different results — BM25 finds notes that use your words, vsearch finds notes that share your meaning. Together they approximate what `query` would do.

## Other Useful qmd Commands

```bash
# Check index status
qmd status

# Retrieve a specific document by path
qmd get qmd://vault/notes/some-note.md

# List all files in collection
qmd ls vault

# Re-embed after content changes (force CPU)
set NODE_LLAMA_CPP_GPU=false
qmd embed

# Force full re-embed
qmd embed -f
```

## Key Findings from A/B/C/D Testing

vsearch vs BM25 was tested across 4 questions during Phase 2 vault analysis:

- **Q1 (focus)**: BM25 found core pillars by name; vsearch found the practical/applied layer underneath
- **Q2 (uniqueness)**: BM25 found synthesis claims; vsearch found meta-awareness of synthesis as a process
- **Q3 (strengths)**: BM25 found book engagement; vsearch found the practical reasoning toolkit
- **Q4 (writing)**: BM25 returned **zero results**; vsearch found Zinsser, storytelling, narrative structure

**Conclusion**: For a vault where ideas are expressed in idiosyncratic vocabulary, vsearch is essential. BM25 alone is "fancy grep." The two modes are complementary, not redundant.

## Node.js `-e` Gotcha on Windows

When running `node -e "..."` from bash on Windows, `!` characters in code get escaped as `\!` which breaks Node's parser. Write `.cjs` files instead:

```bash
# BAD — breaks on Windows bash
node -e "if (!x) console.log('no')"

# GOOD — write a script
echo 'if (!x) console.log("no")' > /tmp/check.cjs && node /tmp/check.cjs
```

For graph.json analysis, use the scripts in `docs/plans/scripts/` (graph-analysis.cjs, method-a-analysis.cjs).

## Prevention / Future Notes

1. **After patching llm.js**: Re-apply the Vulkan preference patch after any `npm install -g @tobilu/qmd` update. Consider filing a qmd GitHub issue requesting a `--gpu` flag or `QMD_GPU` env var.
2. **vsearch model download**: Only happens once. If it fails mid-download, delete `~/.cache/qmd/` models and retry.
3. **MCP vs CLI**: qmd has an MCP server mode (`qmd mcp`) configured in `~/.claude/settings.local.json`. If MCP tools are available in session, prefer those. If not, CLI works identically.
4. **System info**: Driver 591.86, CUDA Toolkit 13.1, RTX 4070 Ti 12GB, Vulkan SDK 1.4.341.1, node-llama-cpp 3.15.1 (llama.cpp b7836).

## Cross-references

- Prior solution: `docs/solutions/build-errors/qmd-embedding-windows-gpu.md` — the CUDA embedding issue (same root cause)
- Analysis results: `docs/plans/data/analysis-results.md` — full A/B/C/D comparison with BM25 vs vsearch table
- Phase 2 plan: `docs/plans/phase2-plan.md` — tool instructions and workflow
- qmd GitHub: https://github.com/tobi/qmd
