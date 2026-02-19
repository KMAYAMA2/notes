# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quartz is a static site generator for publishing digital gardens and notes as websites. It transforms Markdown files (with Obsidian-flavored support) into a static HTML site with features like full-text search, graph visualization, backlinks, and table of contents.

## Common Commands

```bash
# Build and serve locally with hot reload
npx quartz build --serve

# Build for production
npx quartz build

# Type checking and formatting
npm run check           # TypeScript check + Prettier check
npm run format          # Auto-format with Prettier

# Run tests
npm run test            # Runs path.test.ts and depgraph.test.ts

# Build docs (from docs/ directory)
npm run docs
```

## Architecture

### Build Pipeline

The build process flows through three plugin types in sequence:

1. **Transformers** (`quartz/plugins/transformers/`) - Process Markdown through unified.js pipeline:

   - `textTransform()` - Raw text preprocessing
   - `markdownPlugins()` - MDAST (remark) transformations
   - `htmlPlugins()` - HAST (rehype) transformations

2. **Filters** (`quartz/plugins/filters/`) - Determine which content gets published (e.g., `RemoveDrafts`)

3. **Emitters** (`quartz/plugins/emitters/`) - Generate output files (HTML pages, search index, sitemap, RSS)

### Key Entry Points

| File                               | Purpose                              |
| ---------------------------------- | ------------------------------------ |
| `quartz/bootstrap-cli.mjs`         | CLI entry point                      |
| `quartz/build.ts`                  | Build orchestration and watch mode   |
| `quartz/processors/parse.ts`       | Markdown parsing with worker threads |
| `quartz/components/renderPage.tsx` | Page HTML generation                 |

### Configuration Files

- `quartz.config.ts` - Main configuration: page title, theme colors, enabled plugins
- `quartz.layout.ts` - Page layout: which components appear in left/right sidebars, header, footer

### Slug Type System

Quartz uses branded types for path handling (`quartz/util/path.ts`):

- `FilePath` - Absolute filesystem paths with extensions
- `FullSlug` - URL-style paths without leading slash or extension (e.g., `notes/example`)
- `SimpleSlug` - Folder-like paths for navigation
- `RelativeURL` - For href/src attributes

### Component Architecture

UI components in `quartz/components/` are Preact-based with:

- `css` property for component-scoped styles
- `beforeDOMLoaded` / `afterDOMLoaded` for client-side scripts
- Props include `fileData` (current page), `allFiles` (all processed content), `tree` (HAST)

### Content Processing

Content lives in `content/` directory. The Markdown pipeline:

1. Parse with remark (MDAST)
2. Transform with plugins (frontmatter, wikilinks, callouts, etc.)
3. Convert to HTML AST with rehype (HAST)
4. Render to static HTML with Preact

### Incremental Builds

`quartz/depgraph.ts` tracks dependencies between source files and outputs for fast rebuilds in watch mode.

## Vault Analysis Tooling

Reusable scripts for analyzing the content vault live in `docs/plans/scripts/`. Their outputs go to `docs/plans/data/`.

### When to rerun

After content changes (new/renamed/deleted notes, added links), the analysis data goes stale. The refresh sequence:

1. **Rebuild graph.json** — run `npx quartz build` first (produces `public/static/contentIndex.json`), then:
   ```bash
   node docs/plans/scripts/build-graph.cjs
   ```

2. **Rerun analysis scripts** (all independent, can run in parallel):
   ```bash
   node docs/plans/scripts/vault-map.cjs     # Step 1: structural overview → data/vault-map.json
   node docs/plans/scripts/hub-notes.cjs     # Step 2: most connected → data/hub-notes.json
   node docs/plans/scripts/orphan-notes.cjs  # Step 3: least connected → data/orphan-notes.json
   node docs/plans/scripts/writing-patterns.cjs   # Step 5: markdown structure analysis → data/writing-patterns.json
   node docs/plans/scripts/interest-timeline.cjs  # Step 6: git-based activity timeline → data/interest-timeline.json
   ```

3. **Re-embed for qmd** (only if using semantic search):
   ```bash
   qmd embed   # incremental — only new/changed files
   ```

4. **Rerun semantic clusters** (requires qmd index, uses GPU):
   ```bash
   node docs/plans/scripts/semantic-clusters.cjs  # Step 4: thematic groupings → data/semantic-clusters.json (~60-90s)
   ```

5. **Regenerate vault report** (after all analysis scripts are up to date):
   ```bash
   node docs/plans/scripts/vault-report.cjs  # Step 7: synthesized report → data/vault-report.md (<3s)
   ```

### What each script does

| Script | Input | Output | Purpose |
|--------|-------|--------|---------|
| `vault-map.cjs` | graph.json | vault-map.json | Counts, tag distribution, connection histogram, top/bottom 20 |
| `hub-notes.cjs` | graph.json | hub-notes.json | Top 30 notes/people, all essays ranked, top 3 per category |
| `orphan-notes.cjs` | graph.json | orphan-notes.json | True orphans, near-orphans, dead links, island clusters |
| `semantic-clusters.cjs` | graph.json + qmd index | semantic-clusters.json | Thematic groupings via 20 seed queries, cross-cluster bridges, overlap matrix |
| `writing-patterns.cjs` | graph.json + hub/orphan JSON + content/*.md | writing-patterns.json | Markdown structure (words, bullets, prose, wikilinks) by tier and section |
| `interest-timeline.cjs` | graph.json + git log | interest-timeline.json | Activity in 4 time windows, category drift, essay chronology |
| `vault-report.cjs` | all 7 JSON data files | vault-report.md | Synthesized actionable report: clusters, hubs, orphans, connection suggestions, writing insights, drift |

### Key data files

| File | What it is |
|------|-----------|
| `docs/plans/data/graph.json` | Link skeleton: slug → {title, tags, out[], in[]} for all 1,856 entries |
| `docs/plans/data/vault-map.json` | Structural stats (rerun vault-map.cjs to refresh) |
| `docs/plans/data/hub-notes.json` | Hub rankings (rerun hub-notes.cjs to refresh) |
| `docs/plans/data/orphan-notes.json` | Orphan/dead-link data (rerun orphan-notes.cjs to refresh) |
| `docs/plans/data/semantic-clusters.json` | Thematic groupings, bridge notes, query overlaps (rerun semantic-clusters.cjs to refresh) |
| `docs/plans/data/writing-patterns.json` | Markdown structure stats by tier/section (rerun writing-patterns.cjs to refresh) |
| `docs/plans/data/interest-timeline.json` | Git activity timeline, category drift (rerun interest-timeline.cjs to refresh) |
| `docs/plans/data/vault-report.md` | Synthesized actionable report (rerun vault-report.cjs to refresh) |
| `docs/plans/data/analysis-results.md` | A/B/C/D testing results from Phase 2 (static reference) |
| `docs/plans/phase2-plan.md` | Full Phase 2 plan with qmd instructions and progress log |

## Answering Questions About Vault Content

When the user asks about their notes, essays, or people pages:

1. **Start with vault-report.md** — `docs/plans/data/vault-report.md` is the synthesized overview. Read it first for structural questions.
2. **Structural queries** — use the JSON data files directly:
   - "Most connected notes?" → hub-notes.json
   - "What's orphaned?" → orphan-notes.json
   - "What themes exist?" → semantic-clusters.json
   - "What have I been writing about recently?" → interest-timeline.json
   - "How do I write?" → writing-patterns.json
   - "How is the vault structured?" → vault-map.json
   - "How are notes linked?" → graph.json
3. **Semantic search** — use qmd for finding specific content by meaning:
   - `qmd query "your question" -c vault -n 10` (best mode: hybrid+rerank, uses GPU)
   - `qmd search "keyword" -c vault -n 10` (BM25 keyword fallback, fast)
   - `qmd vsearch "query" -c vault -n 10` (vector semantic only)
   - `qmd get qmd://vault/path/to/file.md` (retrieve a specific note by path)
   - `qmd status` / `qmd ls vault` (check index health / list indexed files)
4. **Reading actual note content** — read markdown files from `content/` directory (e.g., `content/notes/...`, `content/essays/...`, `content/people/...`)

Prefer pre-computed data (steps 1-2) over live search (step 3) when the question is about structure, connections, or patterns. Use qmd when the user asks about specific topics or wants to find notes by meaning.

### Updating the /now page

When the user asks to update their /now page (`content/now.md`):

1. Read `docs/plans/data/interest-timeline.json` for recent activity (last 30 days)
2. Read `docs/plans/data/hub-notes.json` for current hub people
3. Use `qmd query` to understand what recent notes are actually about
4. Read the current `content/now.md` to understand the existing format
5. Draft updated sections preserving the existing structure:
   - "Things I'm excited about" — infer from rising categories + recent activity
   - "People I'm taking seriously" — cross-reference hub people with recent activity
   - "Essays I'm thinking about" — check which essay ideas from the list have been written
6. Present the draft to the user for approval before writing to `content/now.md`

Important: Never auto-update content/now.md. Always show the draft first.
The /now page is personal voice — write in Kento's style, not generic AI prose.

## This Instance's Customizations

- Content sections: `essays/`, `notes/`, `people/`
- Custom RecentNotes widgets for each section in sidebar
- Graph visualization depth set to 2 hops
- Purple color scheme for links in light mode
- Git-based date tracking enabled (`priority: ["frontmatter", "git", "filesystem"]`)

## When interacting with this repo

- Do not touch /content, unless instructed to do so
- After completing a meaningful unit of work (e.g., finishing a plan execution, addressing review comments, implementing a feature), ask: "Want me to commit these changes?" Don't ask for trivial single-file edits or exploratory changes.
- Use .claude/settings.local.json where appropriate (if you need more specific instructions, let me know)

## Future ideas

- **Push notifications**: Summarize changes on push → email, tweet, or message in a specified medium
- **UI themes**: Additional themes beyond light/dark (terminal-style, orange-neon) with theme toggle
