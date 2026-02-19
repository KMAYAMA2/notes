// Step 7: Actionable Outputs — synthesize all analysis into one markdown report
// Reusable: run with `node docs/plans/scripts/vault-report.cjs`
// Outputs: docs/plans/data/vault-report.md + console summary

const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'data');
const load = (name) => JSON.parse(fs.readFileSync(path.join(DATA, name), 'utf-8'));

const graph = load('graph.json');
const vaultMap = load('vault-map.json');
const hubNotes = load('hub-notes.json');
const orphanNotes = load('orphan-notes.json');
const clusters = load('semantic-clusters.json');
const writing = load('writing-patterns.json');
const timeline = load('interest-timeline.json');

// --- Helpers ---
function titleFor(slug) {
  if (graph[slug]) return graph[slug].title || slug;
  return slug;
}

function truncTitle(title, max) {
  if (!max) max = 80;
  if (title.length <= max) return title;
  return title.slice(0, max - 3) + '...';
}

function mdLink(slug) {
  return '[' + truncTitle(titleFor(slug)) + '](/' + slug + ')';
}

// --- Build markdown ---
const lines = [];
function h1(text) { lines.push('# ' + text, ''); }
function h2(text) { lines.push('## ' + text, ''); }
function h3(text) { lines.push('### ' + text, ''); }
function p(text) { lines.push(text, ''); }
function bullet(text) { lines.push('- ' + text); }
function blank() { lines.push(''); }
function table(headers, rows) {
  lines.push('| ' + headers.join(' | ') + ' |');
  lines.push('| ' + headers.map(() => '---').join(' | ') + ' |');
  for (const row of rows) {
    lines.push('| ' + row.join(' | ') + ' |');
  }
  lines.push('');
}

// ====================================================================
// Section 1: Thematic Cluster Map
// ====================================================================
h1('Vault Report');
p('Generated: ' + new Date().toISOString().slice(0, 10));
p('Synthesized from 7 analysis datasets covering ' + Object.keys(graph).length + ' vault entries.');

h2('1. Thematic Cluster Map');

// Pillars from vault-map categories
const categoryMap = Object.fromEntries(vaultMap.noteCategories || []);
const pillars = [
  { name: 'Epistemology', cats: ['1'], group: 'Epistemology' },
  { name: 'Austrian Economics', cats: ['13', '11', '3'], group: 'Austrian econ' },
  { name: 'Language & Mind', cats: ['10', '2'], group: 'Language/mind' },
];

h3('Three Pillars');
for (const pillar of pillars) {
  const count = pillar.cats.reduce((s, c) => s + (categoryMap[c] || 0), 0);
  bullet('**' + pillar.name + '**: ' + count + ' notes (categories ' + pillar.cats.join(', ') + ')');
}
blank();

// Query results — top 3 per seed query
h3('Seed Queries (Top 3 Results Each)');

const queryResults = clusters.queryResults || {};
const queryKeys = Object.keys(queryResults);

for (const query of queryKeys) {
  const qr = queryResults[query];
  const top3 = (qr.slugs || []).slice(0, 3);
  bullet('**' + query + '** (' + qr.group + ')');
  for (const slug of top3) {
    lines.push('  - ' + mdLink(slug));
  }
}
blank();

// Cross-cluster bridge notes
h3('Cross-Cluster Bridge Notes');
p('Notes appearing in 3+ seed queries — conceptual connectors across themes:');

const crossCluster = clusters.crossCluster || [];
table(
  ['Note', 'Connections', 'Queries', 'Query Themes'],
  crossCluster.map(n => [
    mdLink(n.slug),
    String(n.connections),
    String(n.queryCount),
    (n.queries || []).slice(0, 3).join('; ') + (n.queries.length > 3 ? '; ...' : '')
  ])
);

// Query overlap pairs
h3('Top 10 Query Overlap Pairs');
p('Queries sharing the most results — reveals hidden thematic connections:');

const overlaps = (clusters.overlapTop20 || []).slice(0, 10);
table(
  ['Query 1', 'Query 2', 'Groups', 'Shared'],
  overlaps.map(o => [
    o.query1,
    o.query2,
    o.group1 + ' / ' + o.group2,
    String(o.sharedCount)
  ])
);

// ====================================================================
// Section 2: Hub Profile
// ====================================================================
h2('2. Hub Profile');

// Build a lookup of writing-pattern samples by slug
const sampleMap = {};
for (const s of (writing.samples || [])) {
  sampleMap[s.slug] = s;
}

// Top 20 hub notes
h3('Top 20 Hub Notes');

const top20 = (hubNotes.topNotes || []).slice(0, 20);
table(
  ['Rank', 'Note', 'Total', 'In', 'Out', 'Cat', 'Words', 'Bullet%', 'Type'],
  top20.map((n, i) => {
    const ws = sampleMap[n.slug];
    const words = ws ? String(ws.wordCount) : '-';
    const bRatio = ws ? (ws.bulletRatio * 100).toFixed(0) + '%' : '-';
    // Classify: high bullet ratio + many wikilinks = "index", else "essay-like"
    const noteType = ws
      ? (ws.bulletRatio >= 0.7 && ws.wikilinkCount >= 15 ? 'index' : 'essay-like')
      : '-';
    return [
      String(i + 1),
      mdLink(n.slug),
      String(n.total),
      String(n.inCount),
      String(n.outCount),
      n.category || '-',
      words,
      bRatio,
      noteType
    ];
  })
);

// Top 10 hub people
h3('Top 10 Hub People');
const topPeople = (hubNotes.topPeople || []).slice(0, 10);
table(
  ['Person', 'Total', 'In', 'Out'],
  topPeople.map(n => [
    mdLink(n.slug),
    String(n.total),
    String(n.inCount),
    String(n.outCount)
  ])
);

// Category breakdown: top 3 per category
h3('Top 3 Notes Per Category');
const topPerCat = hubNotes.topPerCategory || {};
for (const [cat, notes] of Object.entries(topPerCat)) {
  bullet('**Category ' + cat + '**');
  for (const n of notes.slice(0, 3)) {
    lines.push('  - ' + mdLink(n.slug) + ' (' + n.total + ' connections)');
  }
}
blank();

// Hub type insight
h3('Hub Type Insight');
const hubSamples = (writing.samples || []).filter(s => s.tier === 'hub');
const indexHubs = hubSamples.filter(s => s.bulletRatio >= 0.7 && s.wikilinkCount >= 15);
const essayHubs = hubSamples.filter(s => s.bulletRatio < 0.7 || s.wikilinkCount < 15);
p('Of ' + hubSamples.length + ' sampled hub notes:');
bullet('**' + indexHubs.length + ' "index" hubs** (bullet ratio >= 70%, 15+ wikilinks) — primarily link-collection notes');
bullet('**' + essayHubs.length + ' "essay-like" hubs** (lower bullet ratio or fewer links) — more prose-oriented');
blank();

// ====================================================================
// Section 3: Orphan Rescue List
// ====================================================================
h2('3. Orphan Rescue List');

// Collect all orphans and near-orphans
const allOrphans = [];
for (const section of ['notes', 'essays', 'people', 'other']) {
  for (const o of (orphanNotes.orphans[section] || [])) {
    allOrphans.push({ ...o, section, type: 'orphan' });
  }
}
const allNearOrphans = [];
for (const section of ['notes', 'essays', 'people', 'other']) {
  for (const o of (orphanNotes.nearOrphans[section] || [])) {
    allNearOrphans.push({ ...o, section, type: 'near-orphan' });
  }
}

// For each orphan, check semantic cluster membership
function findQueryMembership(slug) {
  const memberships = [];
  for (const [query, qr] of Object.entries(queryResults)) {
    if ((qr.slugs || []).includes(slug)) {
      memberships.push({ query, group: qr.group });
    }
  }
  return memberships;
}

h3('True Orphans (' + allOrphans.length + ')');
p('Notes with only 1 connection (typically just a tag link):');
for (const o of allOrphans) {
  const membership = findQueryMembership(o.slug);
  const suggestion = membership.length > 0
    ? ' — **Suggested theme**: ' + membership[0].group + ' ("' + membership[0].query + '")'
    : ' — No semantic cluster match';
  bullet(mdLink(o.slug) + ' [' + o.section + '] (total: ' + o.total + ')' + suggestion);
}
blank();

h3('Near-Orphans (' + allNearOrphans.length + ')');
p('Notes with only 2 connections:');
for (const o of allNearOrphans) {
  const membership = findQueryMembership(o.slug);
  const suggestion = membership.length > 0
    ? ' — **Suggested theme**: ' + membership[0].group + ' ("' + membership[0].query + '")'
    : ' — No semantic cluster match';
  bullet(mdLink(o.slug) + ' [' + o.section + '] (total: ' + o.total + ')' + suggestion);
}
blank();

// Dead links
const deadLinks = orphanNotes.deadLinks || [];
h3('Dead Links (' + deadLinks.length + ')');
p('Broken wikilink references — concrete fixable items:');
table(
  ['From', 'Broken Link Target'],
  deadLinks.map(d => [
    mdLink(d.from),
    truncTitle(d.to, 60)
  ])
);

// Islands
const islands = orphanNotes.islands || [];
h3('Island Clusters (' + islands.length + ')');
p('Small groups of notes only connected to each other:');
for (const island of islands.slice(0, 15)) {
  bullet(mdLink(island.slug) + ' (total: ' + island.total + ') — neighbors: ' +
    (island.neighbors || []).map(n => truncTitle(titleFor(n), 40)).join(', '));
}
if (islands.length > 15) {
  p('_...and ' + (islands.length - 15) + ' more island nodes._');
}

// ====================================================================
// Section 4: Connection Suggestions
// ====================================================================
h2('4. Connection Suggestions');
p('Notes that share a semantic theme but have no direct link in the graph:');

// Build adjacency set for fast lookup
const adjacency = new Set();
for (const [slug, data] of Object.entries(graph)) {
  for (const target of (data.out || [])) {
    adjacency.add(slug + '|' + target);
    adjacency.add(target + '|' + slug);
  }
}

function areLinked(a, b) {
  return adjacency.has(a + '|' + b);
}

// For each query's result set, find unlinked pairs
const pairCounts = {}; // "slugA|slugB" -> { slugA, slugB, count, queries[] }
let totalPairsChecked = 0;

for (const [query, qr] of Object.entries(queryResults)) {
  const slugs = (qr.slugs || []).filter(s => graph[s]); // only slugs in graph
  for (let i = 0; i < slugs.length; i++) {
    for (let j = i + 1; j < slugs.length; j++) {
      totalPairsChecked++;
      if (!areLinked(slugs[i], slugs[j])) {
        const key = [slugs[i], slugs[j]].sort().join('|');
        if (!pairCounts[key]) {
          pairCounts[key] = { slugA: slugs[i], slugB: slugs[j], count: 0, queries: [] };
        }
        pairCounts[key].count++;
        if (!pairCounts[key].queries.includes(query)) {
          pairCounts[key].queries.push(query);
        }
      }
    }
  }
}

// Rank by co-occurrence count, take top 30
const suggestions = Object.values(pairCounts)
  .sort((a, b) => b.count - a.count)
  .slice(0, 30);

p('Checked ' + totalPairsChecked + ' pairs across ' + queryKeys.length + ' queries. Found ' +
  Object.keys(pairCounts).length + ' unlinked pairs.');
blank();

table(
  ['#', 'Note A', 'Note B', 'Co-appearances', 'Shared Theme(s)'],
  suggestions.map((s, i) => [
    String(i + 1),
    mdLink(s.slugA),
    mdLink(s.slugB),
    String(s.count),
    s.queries.slice(0, 2).join('; ') + (s.queries.length > 2 ? '; ...' : '')
  ])
);

// ====================================================================
// Section 5: Writing Insights
// ====================================================================
h2('5. Writing Insights');

// Tier comparison
h3('Tier Comparison');
const hubTier = writing.byTier.hub;
const essayTier = writing.byTier.essay;
const medTier = writing.byTier.medium;

table(
  ['Metric', 'Hub Notes (n=' + hubTier.count + ')', 'Essays (n=' + essayTier.count + ')', 'Medium Notes (n=' + medTier.count + ')'],
  [
    ['Avg words', String(hubTier.wordCount.mean), String(essayTier.wordCount.mean), String(medTier.wordCount.mean)],
    ['Avg bullet ratio', String(hubTier.bulletRatio.mean), String(essayTier.bulletRatio.mean), String(medTier.bulletRatio.mean)],
    ['Avg wikilinks', String(hubTier.wikilinkCount.mean), String(essayTier.wikilinkCount.mean), String(medTier.wikilinkCount.mean)],
    ['Avg headers', String(hubTier.headerCount.mean), String(essayTier.headerCount.mean), String(medTier.headerCount.mean)],
    ['Avg questions', String(hubTier.questionCount.mean), String(essayTier.questionCount.mean), String(medTier.questionCount.mean)],
  ]
);

// Style outliers
h3('Style Outliers');
const essaySamples = (writing.samples || []).filter(s => s.section === 'essays');
const allBulletEssays = essaySamples.filter(s => s.bulletRatio >= 0.9);
const allProseEssays = essaySamples.filter(s => s.bulletRatio === 0 || (s.bulletLineCount === 0 && s.proseLineCount > 0));

if (allBulletEssays.length > 0) {
  p('**All-bullet essays** (bullet ratio >= 90%):');
  for (const e of allBulletEssays) {
    bullet(mdLink(e.slug) + ' (bullet ratio: ' + (e.bulletRatio * 100).toFixed(0) + '%, ' + e.wordCount + ' words)');
  }
  blank();
}

if (allProseEssays.length > 0) {
  p('**All-prose essays** (no bullets):');
  for (const e of allProseEssays) {
    bullet(mdLink(e.slug) + ' (' + e.wordCount + ' words, ' + e.proseLineCount + ' prose lines)');
  }
  blank();
}

// Japanese content
h3('Japanese Content');
const jpCount = writing.summary.japaneseNotes;
const totalSampled = writing.summary.totalAnalyzed;
p(jpCount + ' of ' + totalSampled + ' sampled notes contain Japanese text. This affects word count reliability for cross-note comparisons.');
blank();

// People pages variance
h3('People Pages Variance');
const peopleTier = writing.byTier.people;
if (peopleTier) {
  p('People pages range from ' + peopleTier.wordCount.min + ' to ' + peopleTier.wordCount.max +
    ' words (mean: ' + peopleTier.wordCount.mean.toFixed(0) + ', median: ' + peopleTier.wordCount.median + ').');
  p('The extreme range suggests some people pages are comprehensive study notes while others are placeholders.');
}
blank();

// ====================================================================
// Section 6: Interest Drift
// ====================================================================
h2('6. Interest Drift');

const drift = timeline.drift || [];

// Rising categories
h3('Rising Categories');
const rising = drift.filter(d => d.direction === 'rising');
if (rising.length > 0) {
  for (const r of rising) {
    bullet('**Category ' + r.category + ' (' + r.theme + ')**: ' + r.recent + ' recent / ' + r.historical + ' historical — **rising**');
  }
} else {
  p('No categories currently rising.');
}
blank();

// Falling categories (biggest drops)
h3('Biggest Falling Categories');
const falling = drift.filter(d => d.direction === 'falling')
  .map(d => ({ ...d, dropRatio: d.historical > 0 ? (d.historical - d.recent) / d.historical : 0 }))
  .sort((a, b) => b.dropRatio - a.dropRatio);

table(
  ['Category', 'Theme', 'Recent', 'Historical', 'Drop %'],
  falling.slice(0, 8).map(d => [
    d.category,
    d.theme,
    String(d.recent),
    String(d.historical),
    (d.dropRatio * 100).toFixed(0) + '%'
  ])
);

// Essay chronology
h3('Essay Chronology');
const essays = timeline.essayTimeline || [];
table(
  ['Date', 'Essay'],
  essays.map(e => [
    e.date || 'unknown',
    mdLink(e.slug)
  ])
);

// Recent activity snapshot
h3('Recent Activity Snapshot (Last 30 Days)');
const recentWindow = timeline.windows.recent;
const recentFiles = recentWindow ? recentWindow.files || [] : [];
p(recentFiles.length + ' files modified in the last 30 days.');

if (recentFiles.length > 0) {
  // Count by category
  const catCounts = {};
  for (const f of recentFiles) {
    const cat = f.category || 'other';
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  }
  const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  p('By category:');
  for (const [cat, count] of sortedCats.slice(0, 8)) {
    bullet('Category ' + cat + ': ' + count + ' files');
  }
}
blank();

// ====================================================================
// Write output
// ====================================================================
const output = lines.join('\n');
fs.writeFileSync(path.join(DATA, 'vault-report.md'), output, 'utf-8');

// Console summary
console.log('=== Vault Report Generated ===');
console.log('Section 1: Thematic Cluster Map — ' + queryKeys.length + ' queries, ' + crossCluster.length + ' bridge notes');
console.log('Section 2: Hub Profile — ' + top20.length + ' hub notes, ' + topPeople.length + ' hub people');
console.log('Section 3: Orphan Rescue — ' + allOrphans.length + ' orphans, ' + allNearOrphans.length + ' near-orphans, ' + deadLinks.length + ' dead links, ' + islands.length + ' islands');
console.log('Section 4: Connection Suggestions — ' + suggestions.length + ' suggestions from ' + totalPairsChecked + ' pair checks');
console.log('Section 5: Writing Insights — ' + totalSampled + ' samples, ' + jpCount + ' with Japanese');
console.log('Section 6: Interest Drift — ' + rising.length + ' rising, ' + falling.length + ' falling categories, ' + essays.length + ' essays');
console.log('Output: docs/plans/data/vault-report.md');
