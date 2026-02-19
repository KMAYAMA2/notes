/**
 * graph-builder.js
 *
 * Reads public/static/contentIndex.json (huge, has full content)
 * Outputs docs/plans/data/graph.json (small, just the link skeleton)
 *
 * Usage: node docs/plans/scripts/graph-builder.js
 * Run from quartz root.
 */

const fs = require("fs")
const path = require("path")

const INPUT = path.join(__dirname, "..", "..", "..", "public", "static", "contentIndex.json")
const OUTPUT_DIR = path.join(__dirname, "..", "data")
const OUTPUT = path.join(OUTPUT_DIR, "graph.json")

const raw = JSON.parse(fs.readFileSync(INPUT, "utf8"))
const slugs = Object.keys(raw)

// Build outgoing map and collect metadata
const graph = {}
for (const slug of slugs) {
  const entry = raw[slug]
  graph[slug] = {
    title: entry.title,
    tags: entry.tags || [],
    out: (entry.links || []).map((l) => l.replace(/\/$/, "")),
    in: [],
  }
}

// Compute incoming links by reversing outgoing
for (const slug of slugs) {
  for (const target of graph[slug].out) {
    if (graph[target]) {
      graph[target].in.push(slug)
    }
  }
}

// Write output
fs.mkdirSync(OUTPUT_DIR, { recursive: true })
fs.writeFileSync(OUTPUT, JSON.stringify(graph, null, 2))

// Stats
const notes = slugs.filter((s) => s.startsWith("notes/"))
const essays = slugs.filter((s) => s.startsWith("essays/"))
const people = slugs.filter((s) => s.startsWith("people/"))
const other = slugs.filter(
  (s) => !s.startsWith("notes/") && !s.startsWith("essays/") && !s.startsWith("people/"),
)

const totalOut = slugs.reduce((sum, s) => sum + graph[s].out.length, 0)
const totalIn = slugs.reduce((sum, s) => sum + graph[s].in.length, 0)
const orphans = slugs.filter((s) => graph[s].in.length === 0 && graph[s].out.length <= 1)
const isolated = slugs.filter((s) => graph[s].in.length === 0 && graph[s].out.length === 0)

console.log(`Done. Wrote ${OUTPUT}`)
console.log()
console.log(`=== Vault ===`)
console.log(`Total: ${slugs.length} (notes: ${notes.length}, essays: ${essays.length}, people: ${people.length}, other: ${other.length})`)
console.log(`Links: ${totalOut} outgoing, ${totalIn} incoming`)
console.log(`Avg outgoing per file: ${(totalOut / slugs.length).toFixed(1)}`)
console.log(`Avg incoming per file: ${(totalIn / slugs.length).toFixed(1)}`)
console.log(`Orphans (0 in, 0-1 out): ${orphans.length}`)
console.log(`Fully isolated (0 in, 0 out): ${isolated.length}`)

// Top 10 most connected
const ranked = slugs
  .map((s) => ({ slug: s, total: graph[s].in.length + graph[s].out.length }))
  .sort((a, b) => b.total - a.total)

console.log()
console.log(`=== Top 10 most connected ===`)
for (const r of ranked.slice(0, 10)) {
  const g = graph[r.slug]
  console.log(`  [${r.total}] (out:${g.out.length} in:${g.in.length}) ${g.title}`)
}
