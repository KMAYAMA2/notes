// Step 1: Map the vault — structural overview
// Reusable: run with `node docs/plans/scripts/vault-map.cjs`
// Outputs: docs/plans/data/vault-map.json + console summary

const fs = require('fs');
const path = require('path');

const GRAPH_PATH = path.join(__dirname, '..', 'data', 'graph.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'vault-map.json');

const graph = JSON.parse(fs.readFileSync(GRAPH_PATH, 'utf-8'));
const entries = Object.entries(graph);

// --- Section counts ---
const sections = { notes: [], essays: [], people: [], other: [] };
for (const [slug, data] of entries) {
  if (slug.startsWith('notes/')) sections.notes.push([slug, data]);
  else if (slug.startsWith('essays/')) sections.essays.push([slug, data]);
  else if (slug.startsWith('people/')) sections.people.push([slug, data]);
  else sections.other.push([slug, data]);
}

// --- Connection stats per entry ---
function connectionStats(items) {
  const stats = items.map(([slug, d]) => ({
    slug,
    title: d.title,
    tags: d.tags || [],
    outCount: (d.out || []).length,
    inCount: (d.in || []).length,
    totalConnections: (d.out || []).length + (d.in || []).length,
  }));
  stats.sort((a, b) => b.totalConnections - a.totalConnections);
  return stats;
}

const allStats = connectionStats(entries);
const noteStats = connectionStats(sections.notes);
const essayStats = connectionStats(sections.essays);
const peopleStats = connectionStats(sections.people);

// --- Aggregate stats ---
function aggregate(stats) {
  if (stats.length === 0) return null;
  const totals = stats.map(s => s.totalConnections);
  const sorted = [...totals].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  return {
    count: stats.length,
    avgConnections: +(sum / stats.length).toFixed(1),
    medianConnections: sorted[Math.floor(sorted.length / 2)],
    maxConnections: sorted[sorted.length - 1],
    minConnections: sorted[0],
    zeroCon: stats.filter(s => s.totalConnections === 0).length,
  };
}

// --- Tag distribution ---
const tagCounts = {};
for (const [, data] of entries) {
  for (const tag of (data.tags || [])) {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  }
}
const tagsSorted = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

// --- Connection histogram ---
const buckets = { '0': 0, '1-5': 0, '6-10': 0, '11-20': 0, '21-50': 0, '51+': 0 };
for (const s of allStats) {
  const c = s.totalConnections;
  if (c === 0) buckets['0']++;
  else if (c <= 5) buckets['1-5']++;
  else if (c <= 10) buckets['6-10']++;
  else if (c <= 20) buckets['11-20']++;
  else if (c <= 50) buckets['21-50']++;
  else buckets['51+']++;
}

// --- Category breakdown (by number prefix in notes) ---
const categories = {};
for (const [slug] of sections.notes) {
  const name = slug.replace('notes/', '');
  const match = name.match(/^(\d+)-/);
  const cat = match ? match[1] : 'unnumbered';
  if (!categories[cat]) categories[cat] = 0;
  categories[cat]++;
}
const catsSorted = Object.entries(categories).sort((a, b) => {
  const na = parseInt(a[0]), nb = parseInt(b[0]);
  if (isNaN(na) && isNaN(nb)) return 0;
  if (isNaN(na)) return 1;
  if (isNaN(nb)) return -1;
  return na - nb;
});

// --- Output ---
const result = {
  generatedAt: new Date().toISOString(),
  totals: {
    all: aggregate(allStats),
    notes: aggregate(noteStats),
    essays: aggregate(essayStats),
    people: aggregate(peopleStats),
  },
  connectionHistogram: buckets,
  tagDistribution: tagsSorted.slice(0, 30), // top 30 tags
  noteCategories: catsSorted,
  top20Overall: allStats.slice(0, 20).map(s => ({ slug: s.slug, title: s.title, total: s.totalConnections, out: s.outCount, in: s.inCount })),
  bottom20Overall: allStats.slice(-20).reverse().map(s => ({ slug: s.slug, title: s.title, total: s.totalConnections, out: s.outCount, in: s.inCount })),
};

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));

// Console summary
console.log('=== VAULT MAP ===\n');
console.log(`Total entries: ${entries.length}`);
console.log(`  Notes: ${sections.notes.length}  |  Essays: ${sections.essays.length}  |  People: ${sections.people.length}  |  Other: ${sections.other.length}\n`);

console.log('--- Connection Stats ---');
for (const [name, stats] of Object.entries(result.totals)) {
  if (!stats) continue;
  console.log(`  ${name}: avg ${stats.avgConnections}, median ${stats.medianConnections}, max ${stats.maxConnections}, min ${stats.minConnections}, zero-connection: ${stats.zeroCon}`);
}

console.log('\n--- Connection Histogram ---');
for (const [bucket, count] of Object.entries(buckets)) {
  const bar = '#'.repeat(Math.ceil(count / 10));
  console.log(`  ${bucket.padEnd(5)} : ${String(count).padStart(4)} ${bar}`);
}

console.log('\n--- Tag Distribution (top 15) ---');
for (const [tag, count] of tagsSorted.slice(0, 15)) {
  console.log(`  ${tag}: ${count}`);
}

console.log('\n--- Note Categories ---');
for (const [cat, count] of catsSorted) {
  console.log(`  Cat ${cat}: ${count} notes`);
}

console.log('\n--- Top 10 Most Connected ---');
for (const s of allStats.slice(0, 10)) {
  console.log(`  [${s.totalConnections}] ${s.slug} — "${s.title}"`);
}

console.log('\n--- Bottom 10 (least connected, non-zero) ---');
const nonZero = allStats.filter(s => s.totalConnections > 0);
for (const s of nonZero.slice(-10).reverse()) {
  console.log(`  [${s.totalConnections}] ${s.slug} — "${s.title}"`);
}

console.log(`\nSaved to ${OUTPUT_PATH}`);
