// Build graph.json from contentIndex.json
// Reusable: run with `node docs/plans/scripts/build-graph.cjs`
// Prerequisite: run `npx quartz build` first to generate public/static/contentIndex.json
// Outputs: docs/plans/data/graph.json

const fs = require('fs');
const path = require('path');

const CONTENT_INDEX_PATH = path.join(__dirname, '..', '..', '..', 'public', 'static', 'contentIndex.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'graph.json');

if (!fs.existsSync(CONTENT_INDEX_PATH)) {
  console.error(`ERROR: ${CONTENT_INDEX_PATH} not found.`);
  console.error('Run `npx quartz build` first to generate contentIndex.json.');
  process.exit(1);
}

const raw = fs.readFileSync(CONTENT_INDEX_PATH, 'utf-8');
const contentIndex = JSON.parse(raw);

// Phase 1: Extract slug, title, tags, outgoing links
const graph = {};
for (const [slug, data] of Object.entries(contentIndex)) {
  graph[slug] = {
    title: data.title || slug,
    tags: data.tags || [],
    out: (data.links || []).filter(l => l !== slug), // exclude self-links
    in: [],
  };
}

// Phase 2: Compute incoming links by reversing outgoing
for (const [slug, data] of Object.entries(graph)) {
  for (const target of data.out) {
    if (graph[target]) {
      graph[target].in.push(slug);
    }
  }
}

// Deduplicate incoming links
for (const data of Object.values(graph)) {
  data.in = [...new Set(data.in)];
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(graph, null, 2));

const totalEntries = Object.keys(graph).length;
const totalOut = Object.values(graph).reduce((s, d) => s + d.out.length, 0);
const totalIn = Object.values(graph).reduce((s, d) => s + d.in.length, 0);

console.log(`graph.json built: ${totalEntries} entries, ${totalOut} outgoing links, ${totalIn} incoming links`);
console.log(`Saved to ${OUTPUT_PATH}`);
