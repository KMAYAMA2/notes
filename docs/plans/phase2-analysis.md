# Phase 2 Analysis: A/B/C/D Testing Plan

## Context

Phase 1 complete: qmd indexed 1,772 files / 2,529 chunks. graph.json built with link skeleton.

Key realization: "piece 2" (the qmd + graph tool) doesn't need to be a program. Claude already has qmd via CLI and graph.json via file reads. The "tool" is just instructions for how to combine them.

## Questions

1. **What's his focus?** — What topics keep coming back? What does he orbit around?
2. **What's unique about him?** — What combinations of interests or perspectives are unusual?
3. **What are his strengths and weaknesses?** — Where is his thinking deep vs shallow?
4. **How can he improve his writing?** — What patterns hold him back? What works well?

## Methods

| Method | Tools | What it sees |
|--------|-------|-------------|
| **A. qmd + links** | `qmd search/vsearch/query` + graph.json | Meaning + explicit structure |
| **B. Links only** | graph.json (Node scripts) | What Kento consciously connected |
| **C. qmd only** | `qmd search/vsearch` | Hidden similarities, regardless of links |
| **D. Claude only** | Read ~20-30 random files | Baseline — what's obvious from raw text |

## How to use the tools

### qmd CLI
```bash
# BM25 keyword search (fast, no GPU)
qmd search "epistemology" -c vault -n 10

# Vector/semantic search (uses embeddings)
qmd vsearch "what drives decision making" -c vault -n 10

# Hybrid search with LLM reranking (best quality, needs model)
qmd query "core intellectual interests" -c vault -n 10

# Retrieve specific document
qmd get qmd://vault/notes/some-note.md

# Retrieve multiple docs (glob or comma-separated)
qmd multi-get "essays/*.md"

# Output formats: --json, --csv, --md, --xml, --full (full content)
```

### graph.json
```bash
# Run Node one-liners against graph.json
node -e "const g = require('./docs/plans/data/graph.json'); ..."

# Key structure: { [slug]: { title, tags, out: [slugs], in: [slugs] } }
# out = outgoing links, in = incoming links (backlinks)
```

## Hypothesis

A (combined) should be strictly better than B, C, or D alone. The comparison shows where each tool adds unique value and where it doesn't matter.

## Output

Results written to `docs/plans/data/analysis-results.md`.
