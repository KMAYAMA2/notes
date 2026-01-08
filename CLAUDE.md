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

## This Instance's Customizations

- Content sections: `essays/`, `notes/`, `people/`
- Custom RecentNotes widgets for each section in sidebar
- Graph visualization depth set to 2 hops
- Purple color scheme for links in light mode
- Git-based date tracking enabled (`priority: ["frontmatter", "git", "filesystem"]`)

## When interacting with this repo

- The following KIP section is primarily about changes I want you to implement
- Do not touch /content, unless instructed to do so
- After you addressed and implemented KIP, move corresponding KIP item to KIP already implemented section
  - Please append them with corresponding item numbers, to already existing items
    - And summarize what chages were made, along with the date the changes were implemented in yyyymmdd format, in parentheses
  - Modify the other KIP item numbers, so KIP item numbers are always in order
  - Make sure both KIP and KIP already implemented items do not have overlapped item number, respectively
  - If item number is referred to within other items, make sure to correspond the item number in the latter as well

## KIP (kenti improvement proposals)

1. /now page
   a. AI-generated interest summary: can Claude summarize my latest interest based on my recent commits, and can /now page include a text which reads something like the following: "Claude says my recent interest has been xxx and yyy etc"? And maybe add ChatGPT to do the same. This is contingent with the token usage when evoking Claude and ChatGPT wouldn't be that consuming. specifically, what if it only looks at the changes committed at that time (i.e., minimal change)?

2. /content layout
   a. when rendered on the web, bullet-pointed sentences following non-bullet-pointed sentence ending with ":" start off with bit too much spacing in between to my liking. I prefer the local Obsidian spacing layout (put simply, I generally prefer how the text appears in local Obsidian vaults over how it appears on the web - but this will be addressed in other item). we did this but it didn't work, i think we really have to narrow down which text format conditions (is it for headers, paragraph, or plain context, etc) before doing this. take note of that.

3. /index page
   a. inside the text, can you render how many notes, people, and essays exist (e.g., "see my 1,900 notes" "see my 55 people" "see my 10 essays")?
   b. can you also include /essays?
   c. render link to /now page

4. /rank page (or if you have better name, suggest me, and depending on the doability it can wait)
   a. can you hack this page which does the following:

   - for each note, it checks how many connection it has with other notes and people (maybe separate notes-connection from people-connection - we can revisit this later)
   - and by default, renders notes in the order so that notes with more connections appears on top
   - but you user can toggle the order so that less connected notes can appear on top, if requested
   - and also do the same for people (so users can check how many connections there are for notes, or people, or even essays, but the ranking should not mix them up... do you know what I mean? happy to elaborate this)

   b. if achieving 4-a comes with updating each note and people (e.g., if each conent has to embody the data related to connection counts) and if that counts as updating the note, then that'd mean all the notes will be "modified" at once. I don't like that, since my /notes link renders notes by dates modified. Any workaround? if none, let's not do this yet.

5. email, tweet, message
   a. when I push commit (am I using the words correctly?), can you summarize the changes, and send email, or tweet, or message in whatever medium I specify? happy to brainstorm this together. and this one is not urgent, so can wait.

6. UI layout design in general
   a. prepare multiple UI themes, and use Light/Dark mode to toggle between chosen 2 themes
   b. keep the current Light/Dark mode scripts
   c. but create few more: terminal-like looking theme; and orange-neon theme

7. localize CLAUDE.md
   a. since there is no point committing CLAUDE.md to remote repo, can we localize the file (assuming doing so does not affect my workflow with Claude whatsoever)
   - **Deferred**: Using `claude.local.md` (git-ignored) would work, but KIP history wouldn't sync across machines. Keeping in committed CLAUDE.md for now.

## KIP already implemented

1. /now page
   a. Created `/content/now.md` template with sections for current work, reading, thinking, and recent explorations. User can edit manually. (20260108)
