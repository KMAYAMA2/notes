// Step 4: Semantic clusters — discover thematic groupings via qmd query
// Reusable: run with `node docs/plans/scripts/semantic-clusters.cjs`
// Outputs: docs/plans/data/semantic-clusters.json + console summary
// Requires: qmd with vault collection indexed, GPU (Vulkan) for reranking

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GRAPH_PATH = path.join(__dirname, '..', 'data', 'graph.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'semantic-clusters.json');

const graph = JSON.parse(fs.readFileSync(GRAPH_PATH, 'utf-8'));

// --- Build case-insensitive slug lookup (qmd returns lowercase paths) ---
const slugLookup = {};
for (const key of Object.keys(graph)) {
  slugLookup[key.toLowerCase()] = key;
}
function resolveSlug(rawSlug) {
  if (graph[rawSlug]) return rawSlug;
  return slugLookup[rawSlug.toLowerCase()] || rawSlug;
}

// --- Seed queries organized by group ---
const SEED_QUERIES = [
  // Pillar 1: Epistemology
  { group: 'Epistemology', query: 'conjecture refutation fallibilism Popper' },
  { group: 'Epistemology', query: 'calibration uncertainty prediction error' },
  { group: 'Epistemology', query: 'abduction guessing detective epistemology' },
  { group: 'Epistemology', query: 'explanation knowledge growth Deutsch' },
  // Pillar 2: Austrian econ
  { group: 'Austrian econ', query: 'human action praxeology Austrian economics' },
  { group: 'Austrian econ', query: 'wealth creation value investing capital' },
  { group: 'Austrian econ', query: 'optionality asymmetry irreversibility risk' },
  { group: 'Austrian econ', query: 'money monetary theory Mises Rothbard' },
  // Pillar 3: Language/mind
  { group: 'Language/mind', query: 'language consciousness symbol meaning' },
  { group: 'Language/mind', query: 'dark matter mind culture inexplicit' },
  { group: 'Language/mind', query: 'emicization perception culture lens' },
  // Cross-pillar themes
  { group: 'Cross-pillar', query: 'multiverse quantum physics implications' },
  { group: 'Cross-pillar', query: 'writing craft essay style prose' },
  { group: 'Cross-pillar', query: 'creativity constraints style art' },
  { group: 'Cross-pillar', query: 'contingency freedom digitization' },
  { group: 'Cross-pillar', query: 'mental models thinking tools heuristics' },
  { group: 'Cross-pillar', query: 'technology product creation ownership' },
  { group: 'Cross-pillar', query: 'incentives ownership community property' },
  { group: 'Cross-pillar', query: 'history narratives feedback learning' },
  { group: 'Cross-pillar', query: 'LLMs AI technology problem solving' },
];

// --- Run a single qmd query and parse results ---
function parseQmdOutput(output) {
  const slugs = [];
  const scores = [];
  const uriRegex = /qmd:\/\/vault\/(.+?\.md)(?::(\d+))?\s/g;
  let match;
  while ((match = uriRegex.exec(output)) !== null) {
    // Convert filepath to slug: strip .md, replace spaces with hyphens, resolve case
    const rawSlug = match[1].replace(/\.md$/, '').replace(/ /g, '-');
    const slug = resolveSlug(rawSlug);
    if (!slugs.includes(slug)) {
      slugs.push(slug);
      const scoreMatch = output.slice(match.index).match(/Score:\s+(\d+)%/);
      scores.push(scoreMatch ? parseInt(scoreMatch[1]) : null);
    }
  }
  return { slugs, scores };
}

function runQuery(queryText) {
  // Try qmd query (hybrid+rerank) first, fall back to qmd search per-query
  for (const mode of ['query', 'search']) {
    const cmd = `qmd ${mode} "${queryText}" -c vault -n 10`;
    try {
      const output = execSync(cmd, {
        encoding: 'utf-8',
        shell: true,
        maxBuffer: 2 * 1024 * 1024,
        timeout: 60000,
      }).replace(/\r/g, '');

      const { slugs, scores } = parseQmdOutput(output);
      return { slugs, scores, mode, error: null };
    } catch (e) {
      // qmd query can exit non-zero (GPU cold start, stderr warnings) — try parsing stdout anyway
      if (e.stdout) {
        const { slugs, scores } = parseQmdOutput(e.stdout.replace(/\r/g, ''));
        if (slugs.length > 0) {
          return { slugs, scores, mode, error: null };
        }
      }
      if (mode === 'query') continue; // fall through to search
      return { slugs: [], scores: [], mode, error: e.message };
    }
  }
}

// --- Run all queries ---
console.log('=== SEMANTIC CLUSTERS ===\n');
console.log(`Running ${SEED_QUERIES.length} queries (tries qmd query, falls back to search per-query)...\n`);

const queryResults = {};
const modeCounts = { query: 0, search: 0 };
for (let i = 0; i < SEED_QUERIES.length; i++) {
  const sq = SEED_QUERIES[i];
  process.stdout.write(`  [${i + 1}/${SEED_QUERIES.length}] "${sq.query}" ... `);
  const result = runQuery(sq.query);
  modeCounts[result.mode]++;
  queryResults[sq.query] = {
    group: sq.group,
    slugs: result.slugs,
    scores: result.scores,
    count: result.slugs.length,
    mode: result.mode,
    error: result.error,
  };
  const modeTag = result.mode === 'search' ? ' [BM25]' : '';
  console.log(`${result.slugs.length} results${modeTag}${result.error ? ' (ERROR: ' + result.error + ')' : ''}`);
}

// --- Build frequency map: slug → list of queries it appeared in ---
const freqMap = {};
for (const [query, data] of Object.entries(queryResults)) {
  for (const slug of data.slugs) {
    if (!freqMap[slug]) freqMap[slug] = [];
    freqMap[slug].push(query);
  }
}

// Cross-cluster notes: appearing in 3+ queries
const crossCluster = Object.entries(freqMap)
  .filter(([, queries]) => queries.length >= 3)
  .sort((a, b) => b[1].length - a[1].length)
  .map(([slug, queries]) => {
    const gd = graph[slug];
    return {
      slug,
      title: gd ? gd.title : slug,
      tags: gd ? (gd.tags || []) : [],
      connections: gd ? (gd.out || []).length + (gd.in || []).length : 0,
      queryCount: queries.length,
      queries,
    };
  });

// --- Query overlap matrix ---
const queryKeys = SEED_QUERIES.map(sq => sq.query);
const overlapMatrix = {};
for (let i = 0; i < queryKeys.length; i++) {
  for (let j = i + 1; j < queryKeys.length; j++) {
    const q1 = queryKeys[i];
    const q2 = queryKeys[j];
    const s1 = new Set(queryResults[q1].slugs);
    const s2 = new Set(queryResults[q2].slugs);
    const shared = [...s1].filter(s => s2.has(s));
    if (shared.length > 0) {
      const key = `${q1} ↔ ${q2}`;
      overlapMatrix[key] = {
        query1: q1,
        query2: q2,
        group1: queryResults[q1].group,
        group2: queryResults[q2].group,
        sharedCount: shared.length,
        sharedSlugs: shared,
      };
    }
  }
}

// Sort by shared count descending
const overlapSorted = Object.values(overlapMatrix).sort((a, b) => b.sharedCount - a.sharedCount);

// --- Emergent themes: groups of queries with 5+ shared notes ---
const emergentThemes = overlapSorted
  .filter(o => o.sharedCount >= 5)
  .map(o => ({
    query1: o.query1,
    query2: o.query2,
    groups: [o.group1, o.group2],
    sharedCount: o.sharedCount,
    sharedNotes: o.sharedSlugs.map(s => {
      const gd = graph[s];
      return { slug: s, title: gd ? gd.title : s };
    }),
  }));

// --- Enrich with graph data ---
function getSection(slug) {
  if (slug.startsWith('notes/')) return 'notes';
  if (slug.startsWith('essays/')) return 'essays';
  if (slug.startsWith('people/')) return 'people';
  return 'other';
}

// Section distribution of all results
const sectionDist = { notes: 0, essays: 0, people: 0, other: 0 };
for (const slug of Object.keys(freqMap)) {
  sectionDist[getSection(slug)]++;
}

// Unique slugs across all queries
const allSlugs = Object.keys(freqMap);

const result = {
  generatedAt: new Date().toISOString(),
  modeCounts,
  summary: {
    totalQueries: SEED_QUERIES.length,
    uniqueResults: allSlugs.length,
    crossClusterCount: crossCluster.length,
    emergentThemeCount: emergentThemes.length,
    sectionDistribution: sectionDist,
  },
  queryResults,
  crossCluster,
  overlapTop20: overlapSorted.slice(0, 20),
  emergentThemes,
};

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));

// --- Console summary ---
console.log(`\n--- Summary ---`);
console.log(`  Modes: ${modeCounts.query} via qmd query, ${modeCounts.search} via qmd search`);
console.log(`  Unique notes found: ${allSlugs.length}`);
console.log(`  Cross-cluster notes (3+ queries): ${crossCluster.length}`);
console.log(`  Emergent themes (5+ shared): ${emergentThemes.length}`);
console.log(`  Section distribution: ${Object.entries(sectionDist).map(([k, v]) => `${k}=${v}`).join(', ')}`);

console.log('\n--- Top Cross-Cluster Notes (bridge notes) ---');
for (const c of crossCluster.slice(0, 15)) {
  const tagStr = c.tags.length ? ` [${c.tags.join(', ')}]` : '';
  console.log(`  [${c.queryCount} queries, ${c.connections} connections] "${c.title}"${tagStr}`);
}

console.log('\n--- Highest Overlap Pairs ---');
for (const o of overlapSorted.slice(0, 10)) {
  console.log(`  [${o.sharedCount} shared] "${o.query1}" ↔ "${o.query2}"`);
}

if (emergentThemes.length > 0) {
  console.log('\n--- Emergent Themes ---');
  for (const t of emergentThemes) {
    console.log(`  [${t.sharedCount} shared] ${t.groups.join(' × ')}`);
    console.log(`    "${t.query1}" ↔ "${t.query2}"`);
    for (const n of t.sharedNotes.slice(0, 3)) {
      console.log(`      → "${n.title}"`);
    }
  }
}

console.log(`\nSaved to ${OUTPUT_PATH}`);
