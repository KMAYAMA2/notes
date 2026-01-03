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

| File | Purpose |
|------|---------|
| `quartz/bootstrap-cli.mjs` | CLI entry point |
| `quartz/build.ts` | Build orchestration and watch mode |
| `quartz/processors/parse.ts` | Markdown parsing with worker threads |
| `quartz/components/renderPage.tsx` | Page HTML generation |

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

## This Instance's Customizations

- Content sections: `essays/`, `notes/`, `people/`
- Custom RecentNotes widgets for each section in sidebar
- Graph visualization depth set to 2 hops
- Purple color scheme for links in light mode
- Git-based date tracking enabled (`priority: ["frontmatter", "git", "filesystem"]`)
