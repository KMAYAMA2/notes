// Step 2: Find hub notes — most connected entries per section
// Reusable: run with `node docs/plans/scripts/hub-notes.cjs`
// Outputs: docs/plans/data/hub-notes.json + console summary

const fs = require('fs');
const path = require('path');

const GRAPH_PATH = path.join(__dirname, '..', 'data', 'graph.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'hub-notes.json');

const graph = JSON.parse(fs.readFileSync(GRAPH_PATH, 'utf-8'));
const entries = Object.entries(graph);

// --- Build ranked list per section ---
function ranked(items) {
  return items.map(([slug, d]) => {
    const out = d.out || [];
    const inn = d.in || [];
    // Count cross-section links
    const outSections = {};
    for (const link of out) {
      const sec = link.split('/')[0];
      outSections[sec] = (outSections[sec] || 0) + 1;
    }
    const inSections = {};
    for (const link of inn) {
      const sec = link.split('/')[0];
      inSections[sec] = (inSections[sec] || 0) + 1;
    }
    return {
      slug,
      title: d.title,
      tags: d.tags || [],
      outCount: out.length,
      inCount: inn.length,
      total: out.length + inn.length,
      outSections,
      inSections,
      // For notes: extract category number
      category: slug.startsWith('notes/') ? (slug.replace('notes/', '').match(/^(\d+)-/) || [])[1] || 'unnumbered' : null,
    };
  }).sort((a, b) => b.total - a.total);
}

const sections = { notes: [], essays: [], people: [] };
for (const [slug, data] of entries) {
  if (slug.startsWith('notes/')) sections.notes.push([slug, data]);
  else if (slug.startsWith('essays/')) sections.essays.push([slug, data]);
  else if (slug.startsWith('people/')) sections.people.push([slug, data]);
}

const result = {
  generatedAt: new Date().toISOString(),
  topNotes: ranked(sections.notes).slice(0, 30),
  topEssays: ranked(sections.essays).slice(0, 14), // all 14 essays
  topPeople: ranked(sections.people).slice(0, 30),
};

// --- Category hubs: top 3 per category ---
const byCat = {};
for (const entry of ranked(sections.notes)) {
  const cat = entry.category;
  if (!byCat[cat]) byCat[cat] = [];
  if (byCat[cat].length < 3) byCat[cat].push(entry);
}
result.topPerCategory = byCat;

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));

// Console summary
console.log('=== HUB NOTES ===\n');

console.log('--- Top 20 Notes ---');
for (const s of result.topNotes.slice(0, 20)) {
  const tagStr = s.tags.length ? ` [${s.tags.join(', ')}]` : '';
  console.log(`  [${s.total}] (out:${s.outCount} in:${s.inCount}) Cat${s.category} — "${s.title}"${tagStr}`);
}

console.log('\n--- All Essays (ranked) ---');
for (const s of result.topEssays) {
  console.log(`  [${s.total}] (out:${s.outCount} in:${s.inCount}) — "${s.title}"`);
}

console.log('\n--- Top 20 People ---');
for (const s of result.topPeople.slice(0, 20)) {
  console.log(`  [${s.total}] (out:${s.outCount} in:${s.inCount}) — "${s.title}"`);
}

console.log('\n--- Top 3 Per Category ---');
for (const [cat, items] of Object.entries(byCat).sort((a, b) => {
  const na = parseInt(a[0]), nb = parseInt(b[0]);
  if (isNaN(na)) return 1; if (isNaN(nb)) return -1; return na - nb;
})) {
  console.log(`  Cat ${cat}:`);
  for (const s of items) {
    console.log(`    [${s.total}] "${s.title}"`);
  }
}

console.log(`\nSaved to ${OUTPUT_PATH}`);
