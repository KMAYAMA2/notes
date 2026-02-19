// Step 5: Writing patterns — analyze markdown structure across strata
// Reusable: run with `node docs/plans/scripts/writing-patterns.cjs`
// Outputs: docs/plans/data/writing-patterns.json + console summary

const fs = require('fs');
const path = require('path');

const GRAPH_PATH = path.join(__dirname, '..', 'data', 'graph.json');
const HUB_PATH = path.join(__dirname, '..', 'data', 'hub-notes.json');
const ORPHAN_PATH = path.join(__dirname, '..', 'data', 'orphan-notes.json');
const CONTENT_DIR = path.join(__dirname, '..', '..', '..', 'content');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'writing-patterns.json');

const graph = JSON.parse(fs.readFileSync(GRAPH_PATH, 'utf-8'));
const hubs = JSON.parse(fs.readFileSync(HUB_PATH, 'utf-8'));
const orphans = JSON.parse(fs.readFileSync(ORPHAN_PATH, 'utf-8'));

// --- Build slug → filepath map by walking content/ ---
function buildFileMap(dir, prefix) {
  const map = {};
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const rel = prefix ? prefix + '/' + entry.name : entry.name;
    if (entry.isDirectory()) {
      Object.assign(map, buildFileMap(fullPath, rel));
    } else if (entry.name.endsWith('.md')) {
      // slug: strip .md, replace spaces with hyphens
      const slug = rel.replace(/\.md$/, '').replace(/ /g, '-');
      map[slug] = fullPath;
    }
  }
  return map;
}

const fileMap = buildFileMap(CONTENT_DIR, '');

// --- Analyze a single markdown file ---
function analyzeFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');

  // Strip frontmatter
  const content = raw.replace(/^---[\s\S]*?---\n/, '');
  const lines = content.split('\n');
  const nonEmpty = lines.filter(l => l.trim().length > 0);

  let headerCount = 0;
  let bulletLineCount = 0;
  let blockquoteCount = 0;
  let proseLineCount = 0;

  for (const line of nonEmpty) {
    const trimmed = line.trim();
    if (/^#{1,6}\s/.test(trimmed)) {
      headerCount++;
    } else if (/^[-*]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed) || /^\t[-*]\s/.test(line) || /^\t\d+\.\s/.test(line)) {
      bulletLineCount++;
    } else if (/^>/.test(trimmed)) {
      blockquoteCount++;
    } else {
      proseLineCount++;
    }
  }

  // Strip wikilink syntax and frontmatter for word count
  const cleanText = content
    .replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1') // wikilinks
    .replace(/!\[.*?\]\(.*?\)/g, '')                  // images
    .replace(/\[.*?\]\(.*?\)/g, '')                   // links
    .replace(/```[\s\S]*?```/g, '')                   // code blocks
    .replace(/`[^`]+`/g, '');                         // inline code

  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Wikilink count
  const wikilinkMatches = content.match(/\[\[([^\]]+)\]\]/g);
  const wikilinkCount = wikilinkMatches ? wikilinkMatches.length : 0;

  // Question count (sentences ending with ?)
  const questionMatches = content.match(/\?(?:\s|$)/g);
  const questionCount = questionMatches ? questionMatches.length : 0;

  // Statement count (sentences ending with . or other terminal)
  const statementMatches = content.match(/[.!](?:\s|$)/g);
  const statementCount = statementMatches ? statementMatches.length : 0;

  // Japanese detection
  const hasJapanese = /[\u3000-\u9fff]/.test(content);

  const bulletRatio = (bulletLineCount + proseLineCount) > 0
    ? +(bulletLineCount / (bulletLineCount + proseLineCount)).toFixed(3) : 0;
  const questionRatio = (questionCount + statementCount) > 0
    ? +(questionCount / (questionCount + statementCount)).toFixed(3) : 0;

  return {
    wordCount,
    lineCount: nonEmpty.length,
    headerCount,
    bulletLineCount,
    proseLineCount,
    blockquoteCount,
    wikilinkCount,
    questionCount,
    bulletRatio,
    questionRatio,
    hasJapanese,
  };
}

// --- Sample selection ---
function getSection(slug) {
  if (slug.startsWith('notes/')) return 'notes';
  if (slug.startsWith('essays/')) return 'essays';
  if (slug.startsWith('people/')) return 'people';
  return 'other';
}

function totalConnections(slug) {
  const d = graph[slug];
  if (!d) return 0;
  return (d.out || []).length + (d.in || []).length;
}

// Hub notes: top 20 from hub-notes.json
const hubSlugs = hubs.topNotes.slice(0, 20).map(n => n.slug);

// Medium notes: every-Nth from entries with 11-20 total connections
const mediumCandidates = Object.keys(graph)
  .filter(s => s.startsWith('notes/'))
  .filter(s => { const t = totalConnections(s); return t >= 11 && t <= 20; })
  .sort();
const mediumStep = Math.max(1, Math.floor(mediumCandidates.length / 20));
const mediumSlugs = mediumCandidates.filter((_, i) => i % mediumStep === 0).slice(0, 20);

// Orphan notes: from orphan-notes.json
const orphanSlugs = [
  ...(orphans.orphans.notes || []).map(o => o.slug),
  ...(orphans.nearOrphans.notes || []).map(o => o.slug),
].slice(0, 20);

// All essays: complete census
const essaySlugs = Object.keys(graph).filter(s => s.startsWith('essays/'));

// People: top 5 hubs + 5 medium + 5 low-connection
const peopleSorted = Object.keys(graph)
  .filter(s => s.startsWith('people/'))
  .map(s => ({ slug: s, total: totalConnections(s) }))
  .sort((a, b) => b.total - a.total);
const peopleHubs = peopleSorted.slice(0, 5).map(p => p.slug);
const peopleMid = peopleSorted.filter(p => p.total >= 5 && p.total <= 15).slice(0, 5).map(p => p.slug);
const peopleLow = peopleSorted.filter(p => p.total <= 4).slice(0, 5).map(p => p.slug);
const peopleSlugs = [...new Set([...peopleHubs, ...peopleMid, ...peopleLow])];

// --- Analyze each sample ---
function analyzeSample(slugs, label) {
  const results = [];
  let unresolved = 0;
  for (const slug of slugs) {
    const filePath = fileMap[slug];
    if (!filePath || !fs.existsSync(filePath)) {
      unresolved++;
      continue;
    }
    const stats = analyzeFile(filePath);
    const gd = graph[slug];
    results.push({
      slug,
      title: gd ? gd.title : slug,
      section: getSection(slug),
      tier: label,
      connections: totalConnections(slug),
      ...stats,
    });
  }
  if (unresolved > 0) {
    console.log(`  [${label}] Skipped ${unresolved} unresolved slugs`);
  }
  return results;
}

const allSamples = [
  ...analyzeSample(hubSlugs, 'hub'),
  ...analyzeSample(mediumSlugs, 'medium'),
  ...analyzeSample(orphanSlugs, 'orphan'),
  ...analyzeSample(essaySlugs, 'essay'),
  ...analyzeSample(peopleSlugs, 'people'),
];

// --- Aggregate stats ---
function aggregate(items) {
  if (items.length === 0) return null;
  const fields = ['wordCount', 'lineCount', 'headerCount', 'bulletLineCount', 'proseLineCount',
    'blockquoteCount', 'wikilinkCount', 'questionCount', 'bulletRatio', 'questionRatio'];
  const agg = { count: items.length };
  for (const f of fields) {
    const vals = items.map(i => i[f]).sort((a, b) => a - b);
    const sum = vals.reduce((a, b) => a + b, 0);
    agg[f] = {
      mean: +(sum / vals.length).toFixed(1),
      median: vals[Math.floor(vals.length / 2)],
      min: vals[0],
      max: vals[vals.length - 1],
    };
  }
  return agg;
}

// By tier
const byTier = {};
for (const tier of ['hub', 'medium', 'orphan', 'essay', 'people']) {
  byTier[tier] = aggregate(allSamples.filter(s => s.tier === tier));
}

// By section
const bySection = {};
for (const sec of ['notes', 'essays', 'people']) {
  bySection[sec] = aggregate(allSamples.filter(s => s.section === sec));
}

// Outliers
const sorted = (field) => [...allSamples].sort((a, b) => b[field] - a[field]);
const outliers = {
  longestByWords: sorted('wordCount').slice(0, 5).map(s => ({ slug: s.slug, title: s.title, wordCount: s.wordCount, tier: s.tier })),
  shortestByWords: sorted('wordCount').slice(-5).reverse().map(s => ({ slug: s.slug, title: s.title, wordCount: s.wordCount, tier: s.tier })),
  mostBulleted: sorted('bulletRatio').slice(0, 5).map(s => ({ slug: s.slug, title: s.title, bulletRatio: s.bulletRatio, tier: s.tier })),
  mostProse: sorted('bulletRatio').slice(-5).reverse().map(s => ({ slug: s.slug, title: s.title, bulletRatio: s.bulletRatio, tier: s.tier })),
  mostWikilinks: sorted('wikilinkCount').slice(0, 5).map(s => ({ slug: s.slug, title: s.title, wikilinkCount: s.wikilinkCount, tier: s.tier })),
  mostQuestions: sorted('questionRatio').slice(0, 5).map(s => ({ slug: s.slug, title: s.title, questionRatio: s.questionRatio, questionCount: s.questionCount, tier: s.tier })),
};

// Japanese note count
const japaneseCount = allSamples.filter(s => s.hasJapanese).length;

const result = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalAnalyzed: allSamples.length,
    japaneseNotes: japaneseCount,
  },
  byTier,
  bySection,
  outliers,
  samples: allSamples,
};

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));

// --- Console summary ---
console.log('=== WRITING PATTERNS ===\n');
console.log(`Analyzed ${allSamples.length} files (${japaneseCount} contain Japanese)\n`);

console.log('--- By Tier (mean values) ---');
for (const [tier, agg] of Object.entries(byTier)) {
  if (!agg) continue;
  console.log(`  ${tier} (n=${agg.count}): ${agg.wordCount.mean} words, ${agg.wikilinkCount.mean} wikilinks, bullet ratio ${agg.bulletRatio.mean}, question ratio ${agg.questionRatio.mean}`);
}

console.log('\n--- By Section (mean values) ---');
for (const [sec, agg] of Object.entries(bySection)) {
  if (!agg) continue;
  console.log(`  ${sec} (n=${agg.count}): ${agg.wordCount.mean} words, ${agg.wikilinkCount.mean} wikilinks, bullet ratio ${agg.bulletRatio.mean}`);
}

console.log('\n--- Outliers ---');
console.log('Longest by words:');
for (const s of outliers.longestByWords) {
  console.log(`  [${s.wordCount}w] ${s.tier} — "${s.title}"`);
}
console.log('Shortest by words:');
for (const s of outliers.shortestByWords) {
  console.log(`  [${s.wordCount}w] ${s.tier} — "${s.title}"`);
}
console.log('Most bulleted:');
for (const s of outliers.mostBulleted) {
  console.log(`  [${(s.bulletRatio * 100).toFixed(0)}%] ${s.tier} — "${s.title}"`);
}
console.log('Most prose-heavy:');
for (const s of outliers.mostProse) {
  console.log(`  [${((1 - s.bulletRatio) * 100).toFixed(0)}%] ${s.tier} — "${s.title}"`);
}

console.log(`\nSaved to ${OUTPUT_PATH}`);
