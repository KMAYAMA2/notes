// Step 3: Find orphan notes — least connected entries
// Reusable: run with `node docs/plans/scripts/orphan-notes.cjs`
// Outputs: docs/plans/data/orphan-notes.json + console summary

const fs = require('fs');
const path = require('path');

const GRAPH_PATH = path.join(__dirname, '..', 'data', 'graph.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'orphan-notes.json');

const graph = JSON.parse(fs.readFileSync(GRAPH_PATH, 'utf-8'));
const entries = Object.entries(graph);

// --- Find orphans: 0 incoming AND 0-1 outgoing ---
const orphans = [];
const nearOrphans = []; // 0 incoming, 2-3 outgoing (could use more connections)
const noIncoming = []; // 0 incoming but many outgoing (one-way sinks)

for (const [slug, data] of entries) {
  const out = (data.out || []).length;
  const inn = (data.in || []).length;
  const total = out + inn;

  if (inn === 0 && out <= 1) {
    orphans.push({ slug, title: data.title, tags: data.tags || [], outCount: out, inCount: 0, total });
  } else if (inn === 0 && out <= 3) {
    nearOrphans.push({ slug, title: data.title, tags: data.tags || [], outCount: out, inCount: 0, total });
  } else if (inn === 0 && out > 3) {
    noIncoming.push({ slug, title: data.title, tags: data.tags || [], outCount: out, inCount: 0, total });
  }
}

// Section breakdown
function bySection(items) {
  const result = { notes: [], essays: [], people: [], other: [] };
  for (const item of items) {
    if (item.slug.startsWith('notes/')) result.notes.push(item);
    else if (item.slug.startsWith('essays/')) result.essays.push(item);
    else if (item.slug.startsWith('people/')) result.people.push(item);
    else result.other.push(item);
  }
  return result;
}

// --- Find islands: small disconnected clusters (2-3 notes that only link to each other) ---
const islands = [];
for (const [slug, data] of entries) {
  const out = data.out || [];
  const inn = data.in || [];
  const total = out.length + inn.length;
  // Small total connections AND all connections are to other low-connection nodes
  if (total >= 1 && total <= 3) {
    const neighbors = [...new Set([...out, ...inn])];
    const allNeighborsSmall = neighbors.every(n => {
      const nd = graph[n];
      if (!nd) return true; // dead link
      return ((nd.out || []).length + (nd.in || []).length) <= 5;
    });
    if (allNeighborsSmall) {
      islands.push({ slug, title: data.title, tags: data.tags || [], total, neighbors });
    }
  }
}

// --- Dead links: outgoing links that point to non-existent entries ---
const deadLinks = [];
for (const [slug, data] of entries) {
  for (const target of (data.out || [])) {
    if (!graph[target] && !target.startsWith('tags/')) {
      deadLinks.push({ from: slug, to: target });
    }
  }
}

const result = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalOrphans: orphans.length,
    totalNearOrphans: nearOrphans.length,
    totalNoIncoming: noIncoming.length,
    totalIslands: islands.length,
    totalDeadLinks: deadLinks.length,
  },
  orphans: bySection(orphans),
  nearOrphans: bySection(nearOrphans),
  noIncoming: bySection(noIncoming),
  islands: islands.slice(0, 50), // cap for readability
  deadLinks: deadLinks.slice(0, 50),
};

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));

// Console summary
console.log('=== ORPHAN NOTES ===\n');

console.log('--- Summary ---');
console.log(`  True orphans (0 in, 0-1 out): ${orphans.length}`);
console.log(`  Near-orphans (0 in, 2-3 out): ${nearOrphans.length}`);
console.log(`  No incoming (0 in, 4+ out):   ${noIncoming.length}`);
console.log(`  Island clusters (low-con):     ${islands.length}`);
console.log(`  Dead links (broken refs):      ${deadLinks.length}`);

const orphanSections = bySection(orphans);
console.log('\n--- True Orphans by Section ---');
console.log(`  Notes: ${orphanSections.notes.length}  |  Essays: ${orphanSections.essays.length}  |  People: ${orphanSections.people.length}  |  Other: ${orphanSections.other.length}`);

console.log('\n--- Orphan Notes ---');
for (const s of orphanSections.notes) {
  const tagStr = s.tags.length ? ` [${s.tags.join(', ')}]` : '';
  console.log(`  [${s.total}] ${s.slug} — "${s.title}"${tagStr}`);
}

console.log('\n--- Orphan Essays ---');
for (const s of orphanSections.essays) {
  console.log(`  [${s.total}] ${s.slug} — "${s.title}"`);
}

console.log('\n--- Orphan People ---');
for (const s of orphanSections.people) {
  console.log(`  [${s.total}] ${s.slug} — "${s.title}"`);
}

if (deadLinks.length > 0) {
  console.log('\n--- Dead Links (first 20) ---');
  for (const dl of deadLinks.slice(0, 20)) {
    console.log(`  ${dl.from} → ${dl.to} (NOT FOUND)`);
  }
}

if (noIncoming.length > 0) {
  console.log('\n--- No Incoming Links (has outgoing but nothing points to it, first 20) ---');
  for (const s of noIncoming.slice(0, 20)) {
    console.log(`  [out:${s.outCount}] ${s.slug} — "${s.title}"`);
  }
}

console.log(`\nSaved to ${OUTPUT_PATH}`);
