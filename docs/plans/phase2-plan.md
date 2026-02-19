# Phase 2: Vault Analysis Plan

## Status: A/B/C/D TESTING COMPLETE — READY FOR STEPS 1-7

Phase 1 complete — qmd indexed 1,772 files / 2,529 chunks. contentIndex.json available.

## Why

The vault is a mirror of how Kento thinks. The point of this analysis is to answer:

1. **What's his focus?** — What topics keep coming back? What does he orbit around?
2. **What's unique about him?** — What combinations of interests or perspectives are unusual?
3. **What are his strengths and weaknesses?** — Where is his thinking deep vs shallow? Where are the gaps?
4. **How can he improve his writing?** — What patterns hold him back? What works well?

KIPs (#1a /now page, #2 /rank page) are secondary outputs — useful, but not the point.

## Architecture

Two pieces to build:

1. **graph-builder.js** — Parses contentIndex.json, strips content, computes incoming links, outputs `graph.json`. Lightweight: just slug, title, tags, outgoing links, incoming links. No content — qmd handles that.

2. **Instructions for combining qmd + graph.json** — No program needed. Claude has qmd via CLI and graph.json via file reads. The "tool" is just instructions:

   **Semantic search** (content questions):
   ```bash
   qmd search "query" -c vault -n 10    # BM25 keyword
   qmd vsearch "query" -c vault -n 10   # vector similarity
   qmd query "query" -c vault -n 10     # hybrid + LLM reranking (best)
   ```

   **Graph lookups** (connection questions):
   ```bash
   # Lookup a slug's connections in graph.json
   node -e "const g = require('./docs/plans/data/graph.json'); const e = g['notes/some-slug']; console.log('out:', e.out, 'in:', e.in)"
   ```

   **Global graph analysis** (structural questions):
   ```bash
   # Node one-liners against graph.json for hubs, orphans, clusters
   node -e "const g = require('./docs/plans/data/graph.json'); /* analysis */ "
   ```

   **Combined workflow**: Use qmd to find relevant notes by meaning, then look up their graph.json entries to see what they connect to. Or start from graph hubs and use qmd to understand what makes them central.

Why this split works: qmd already indexes all content (keyword + semantic). So graph.json doesn't need content — it just needs the skeleton. qmd answers "what is this note about?" and the graph answers "what does it connect to?"

## Approach: A/B/C/D comparison

Answer the four questions above using four methods, then compare:

| Method | What it uses | What it sees |
|--------|-------------|-------------|
| **A. qmd + links** | Semantic search + contentIndex.json graph | Meaning + explicit structure |
| **B. Links only** | contentIndex.json graph | What Kento consciously connected |
| **C. qmd only** | Semantic search | Hidden similarities, regardless of links |
| **D. Claude only** | No tools, just reading files | Baseline — what's obvious from raw text |

The hypothesis: A (combined) should be strictly better than B, C, or D alone. The comparison shows where each tool adds unique value and where it doesn't matter.

## How

Deep analysis of ~1,840 markdown files using two complementary tools:
- **qmd** — semantic search (vector + BM25 keyword + LLM re-ranking)
- **contentIndex.json** — link graph data (connections, hubs, orphans, clusters)

## Tools Available

| Tool | Status | What it does |
|------|--------|-------------|
| `qmd search "query" -c vault` | READY | Semantic search across 1,772 files |
| `qmd get qmd://vault/path/to/file.md` | READY | Retrieve a specific document |
| `qmd ls vault` | READY | List all files in collection |
| `public/static/contentIndex.json` | READY | Link graph: `{ [slug]: { title, links[], tags[], content } }` |

## Steps

### Step 1: Map the vault (structural overview)

**Goal**: Understand the shape of the vault — what's in it, how it's organized, how connected it is.

**Actions**:
- Parse `contentIndex.json` to extract:
  - Total notes, essays, people counts (by path prefix)
  - Outgoing link counts per file
  - Incoming link counts (reverse the outgoing links)
  - Tag distribution
- Produce a summary: "Your vault has X notes, Y essays, Z people. Average N links per note. Top 10 most connected. Bottom 10 least connected."

**Tools**: contentIndex.json (parse with Node.js script)

### Step 2: Find hub notes (most connected)

**Goal**: Identify the notes that are central to your thinking — the ones everything else connects to.

**Actions**:
- Rank all files by total connections (outgoing + incoming links)
- Separate rankings for notes/, essays/, people/
- For top 10 in each category, use qmd to pull their content and summarize what makes them hubs

**Tools**: contentIndex.json for link counts, qmd for content retrieval

### Step 3: Find orphan notes (least connected)

**Goal**: Surface notes that exist in isolation — candidates for linking or expanding.

**Actions**:
- Find files with 0 incoming links AND 0-1 outgoing links
- Use qmd semantic search to find notes that *should* be connected (similar content but no links between them)
- Suggest specific links to add

**Tools**: contentIndex.json for link counts, qmd for semantic similarity

### Step 4: Discover semantic clusters

**Goal**: Find thematic groups that cut across your folder structure (notes that are about the same topic but aren't linked to each other).

**Actions**:
- Pick ~20 seed queries representing potential themes (e.g., "epistemology", "decision making", "wealth creation", "consciousness", "evolution", "technology diffusion")
- For each query, use qmd search to get top 10 results
- Map overlaps: which notes appear in multiple clusters?
- Identify emergent themes the user might not have named yet

**Tools**: qmd (semantic search)

### Step 5: Analyze writing patterns

**Goal**: Understand how the user writes — note length, structure, style.

**Actions**:
- Sample ~50 notes across different connection levels (hubs, medium, orphans)
- Analyze: average length, use of headers, bullet points vs prose, question-driven vs statement-driven
- Compare essays/ vs notes/ vs people/ — different writing styles?

**Tools**: qmd for retrieval, direct file reads for analysis

### Step 6: Interest timeline (ties into KIP #1a)

**Goal**: Map what topics the user has been writing about recently vs historically.

**Actions**:
- Use git log to get recently modified files
- Use qmd to semantically categorize them
- Produce a summary: "Recent interest: X, Y, Z. Historical focus: A, B, C."
- This feeds directly into the /now page AI-generated interest summary (KIP #1a)

**Tools**: git log, qmd, direct file reads

### Step 7: Generate actionable outputs

**Goal**: Turn analysis into concrete improvements.

**Outputs**:
- **Connection suggestions**: "Note A and Note B are semantically similar but not linked — consider adding a link"
- **Cluster map**: Visual or text summary of the ~10-15 major themes in the vault
- **Hub profile**: What the top 20 hub notes reveal about core interests
- **Orphan rescue list**: Notes worth connecting or expanding
- **KIP #2 data**: Connection counts ready for the /rank page
- **KIP #1a draft**: AI-generated interest summary for /now page

## Key Files

- `quartz/plugins/emitters/contentIndex.ts` — builds contentIndex.json
- `public/static/contentIndex.json` — the built link graph (1.3M+ tokens, must parse with script)
- `quartz/plugins/transformers/ofm.ts` — wikilink regex
- `quartz/plugins/transformers/links.ts` — CrawlLinks
- `quartz/components/Backlinks.tsx` — incoming links

## Embedding Workflow (for future content updates)

When content changes, re-embed from VS Developer Command Prompt:
```cmd
set PATH=C:\Program Files\Git\bin;C:\Program Files\CMake\bin;%PATH%
set NODE_LLAMA_CPP_GPU=false
cd "C:\Program Files\nodejs\node_modules\@tobilu\qmd"
qmd embed
```
Only new/changed files get embedded (~seconds). Use `qmd embed -f` to force full re-embed.

## Relationship to KIPs

- **KIP #1a** (/now page): Step 6 feeds the AI-generated interest summary.
- **KIP #2** (/rank page): Separate build. graph.json is for Phase 2 analysis only — /rank page will use Quartz's existing data pipeline (contentIndex.json already has outgoing links, incoming links can be computed at build time). No dependency between the two.

## Progress Log

- 2026-02-18: Phase 1 complete. 1,772 files / 2,529 chunks embedded on CPU.
- 2026-02-18: Phase 2 plan created in `docs/plans/phase2-plan.md`.
- 2026-02-18: Replaced TBD tool spec with CLI instructions. graph.json built. A/B/C/D testing started.
- 2026-02-18: A/B/C/D testing COMPLETE. Results in `docs/plans/data/analysis-results.md`. Hypothesis confirmed: combined method (A) is strictly better, but margin varies by question type.
