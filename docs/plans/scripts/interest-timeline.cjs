// Step 6: Interest timeline — track category activity across time windows
// Reusable: run with `node docs/plans/scripts/interest-timeline.cjs`
// Outputs: docs/plans/data/interest-timeline.json + console summary

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GRAPH_PATH = path.join(__dirname, '..', 'data', 'graph.json');
const CONTENT_DIR = path.join(__dirname, '..', '..', '..', 'content');
const REPO_ROOT = path.join(__dirname, '..', '..', '..');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'interest-timeline.json');

const graph = JSON.parse(fs.readFileSync(GRAPH_PATH, 'utf-8'));

// --- Category theme lookup ---
const CATEGORY_THEMES = {
  '1': 'Epistemology/fallibilism',
  '2': 'Information/mental models',
  '3': 'Thinking/creativity',
  '4': 'History/narratives',
  '5': 'Knowledge/reality/economics',
  '6': 'Ownership/property',
  '7': 'Technology/creation',
  '8': 'Computing/LLMs',
  '9': 'Communication/writing',
  '10': 'Language/consciousness',
  '11': 'Returns/utility',
  '12': 'Contingency/freedom',
  '13': 'Economics/praxeology',
};

// --- Time windows (from 2026-02-19) ---
const REF_DATE = new Date('2026-02-19');
function dateStr(d) { return d.toISOString().split('T')[0]; }
function daysAgo(n) {
  const d = new Date(REF_DATE);
  d.setDate(d.getDate() - n);
  return d;
}

const WINDOWS = [
  { name: 'recent',     after: daysAgo(30),  before: REF_DATE,     label: 'Last 30 days' },
  { name: 'midterm',    after: daysAgo(90),  before: daysAgo(30),  label: '31-90 days ago' },
  { name: 'historical', after: daysAgo(365), before: daysAgo(90),  label: '91-365 days ago' },
  { name: 'archive',    after: daysAgo(3650),before: daysAgo(365), label: '365+ days ago' },
];

// --- Helper: slug from filepath ---
function fileToSlug(filepath) {
  // filepath like "content/notes/1-2f1-something.md"
  let rel = filepath.replace(/\\/g, '/');
  if (rel.startsWith('content/')) rel = rel.slice('content/'.length);
  return rel.replace(/\.md$/, '').replace(/ /g, '-');
}

function getSection(slug) {
  if (slug.startsWith('notes/')) return 'notes';
  if (slug.startsWith('essays/')) return 'essays';
  if (slug.startsWith('people/')) return 'people';
  return 'other';
}

function getCategory(slug) {
  if (!slug.startsWith('notes/')) return null;
  const name = slug.replace('notes/', '');
  const match = name.match(/^(\d+)-/);
  return match ? match[1] : 'unnumbered';
}

// --- Run git log for each window ---
function getFilesInWindow(window) {
  const cmd = `git log --name-only --diff-filter=AM --pretty=format:"---COMMIT--- %ai" --after="${dateStr(window.after)}" --before="${dateStr(window.before)}" -- "content/"`;
  try {
    const output = execSync(cmd, {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
      shell: true,
      maxBuffer: 4 * 1024 * 1024,
    }).replace(/\r/g, '');

    const files = new Set();
    for (const line of output.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('---COMMIT---')) continue;
      if (trimmed.endsWith('.md')) {
        files.add(trimmed);
      }
    }
    return [...files];
  } catch (e) {
    console.log(`  Warning: git log failed for ${window.name}: ${e.message}`);
    return [];
  }
}

const windowResults = {};
for (const w of WINDOWS) {
  const files = getFilesInWindow(w);
  const entries = files.map(f => {
    const slug = fileToSlug(f);
    const gd = graph[slug];
    return {
      slug,
      title: gd ? gd.title : slug,
      section: getSection(slug),
      category: getCategory(slug),
      tags: gd ? (gd.tags || []) : [],
      graphData: gd ? true : null,
    };
  });
  windowResults[w.name] = entries;
}

// --- Aggregate by section, category, and tags per window ---
function aggregateWindow(entries) {
  const bySection = {};
  const byCategory = {};
  const byTag = {};

  for (const e of entries) {
    bySection[e.section] = (bySection[e.section] || 0) + 1;
    if (e.category) {
      byCategory[e.category] = (byCategory[e.category] || 0) + 1;
    }
    for (const tag of e.tags) {
      byTag[tag] = (byTag[tag] || 0) + 1;
    }
  }

  return {
    totalFiles: entries.length,
    bySection,
    byCategory,
    topTags: Object.entries(byTag).sort((a, b) => b[1] - a[1]).slice(0, 15),
  };
}

const aggregated = {};
for (const [name, entries] of Object.entries(windowResults)) {
  aggregated[name] = aggregateWindow(entries);
}

// --- Compute drift: recent vs historical ---
const drift = [];
const recentCats = aggregated.recent ? aggregated.recent.byCategory : {};
const histCats = aggregated.historical ? aggregated.historical.byCategory : {};
const allCatKeys = new Set([...Object.keys(recentCats), ...Object.keys(histCats)]);
for (const cat of [...allCatKeys].sort((a, b) => parseInt(a) - parseInt(b))) {
  const r = recentCats[cat] || 0;
  const h = histCats[cat] || 0;
  const direction = r > h ? 'rising' : r < h ? 'falling' : 'stable';
  drift.push({
    category: cat,
    theme: CATEGORY_THEMES[cat] || 'unknown',
    recent: r,
    historical: h,
    direction,
  });
}

// --- Essay timeline from frontmatter dates ---
const essayTimeline = [];
const essayDir = path.join(CONTENT_DIR, 'essays');
if (fs.existsSync(essayDir)) {
  for (const file of fs.readdirSync(essayDir)) {
    if (!file.endsWith('.md')) continue;
    const raw = fs.readFileSync(path.join(essayDir, file), 'utf-8');
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    let date = null;
    if (fmMatch) {
      const dateMatch = fmMatch[1].match(/date:\s*(.+)/);
      if (dateMatch) date = dateMatch[1].trim().replace(/['"]/g, '');
    }
    const slug = 'essays/' + file.replace(/\.md$/, '').replace(/ /g, '-');
    const gd = graph[slug];
    essayTimeline.push({
      slug,
      title: gd ? gd.title : file.replace(/\.md$/, ''),
      date,
    });
  }
  essayTimeline.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
  });
}

const result = {
  generatedAt: new Date().toISOString(),
  referenceDate: dateStr(REF_DATE),
  windows: {},
  aggregated,
  drift,
  essayTimeline,
};

// Include file lists per window (capped for readability)
for (const w of WINDOWS) {
  result.windows[w.name] = {
    label: w.label,
    after: dateStr(w.after),
    before: dateStr(w.before),
    files: windowResults[w.name].slice(0, 100),
    totalFiles: windowResults[w.name].length,
  };
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));

// --- Console summary ---
console.log('=== INTEREST TIMELINE ===\n');

for (const w of WINDOWS) {
  const agg = aggregated[w.name];
  console.log(`--- ${w.label} (${w.name}) ---`);
  console.log(`  Files modified: ${agg.totalFiles}`);
  if (agg.totalFiles > 0) {
    console.log(`  Sections: ${Object.entries(agg.bySection).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    const cats = Object.entries(agg.byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, v]) => `Cat${k}(${CATEGORY_THEMES[k] || '?'})=${v}`);
    if (cats.length) console.log(`  Top categories: ${cats.join(', ')}`);
  }
  console.log('');
}

console.log('--- Category Drift (recent vs historical) ---');
for (const d of drift) {
  const arrow = d.direction === 'rising' ? '↑' : d.direction === 'falling' ? '↓' : '→';
  console.log(`  Cat ${d.category} (${d.theme}): ${d.historical} → ${d.recent} ${arrow} ${d.direction}`);
}

if (essayTimeline.length > 0) {
  console.log('\n--- Essay Timeline ---');
  for (const e of essayTimeline) {
    console.log(`  ${e.date || 'no date'} — "${e.title}"`);
  }
}

console.log(`\nSaved to ${OUTPUT_PATH}`);
