const g = require('../data/graph.json');

const notes = Object.keys(g).filter(k => k.startsWith('notes/'));
const cats = {};
for (const n of notes) {
  const m = g[n].title.match(/^(\d+)-/);
  if (!m) continue;
  const cat = m[1];
  if (!cats[cat]) cats[cat] = [];
  cats[cat].push({ slug: n, title: g[n].title, total: (g[n].out || []).length + (g[n].in || []).length });
}

console.log('=== CATEGORY THEMES (from top 3 notes each) ===');
for (const [cat, arr] of Object.entries(cats).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
  arr.sort((a, b) => b.total - a.total);
  console.log(cat + ' (' + arr.length + ' notes):');
  arr.slice(0, 3).forEach(n => console.log('  [' + n.total + '] ' + n.title));
}

console.log('\n=== CATEGORY DENSITY (avg connections per note) ===');
for (const [cat, arr] of Object.entries(cats).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
  const avg = arr.reduce((s, n) => s + n.total, 0) / arr.length;
  console.log(cat + ': ' + avg.toFixed(1) + ' avg connections (' + arr.length + ' notes)');
}

console.log('\n=== DEVELOP TAG DISTRIBUTION ===');
const devByCat = {};
for (const n of notes) {
  if ((g[n].tags || []).includes('develop')) {
    const m = g[n].title.match(/^(\d+)-/);
    if (m) devByCat[m[1]] = (devByCat[m[1]] || 0) + 1;
  }
}
for (const [cat, count] of Object.entries(devByCat).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
  console.log('  Cat ' + cat + ': ' + count + ' develop tags (' + Math.round(100 * count / cats[cat].length) + '%)');
}

console.log('\n=== ESSAY CONNECTION PATTERNS ===');
const essays = Object.keys(g).filter(k => k.startsWith('essays/'));
for (const e of essays) {
  const outNotes = (g[e].out || []).filter(o => o.startsWith('notes/')).length;
  const inNotes = (g[e].in || []).filter(i => i.startsWith('notes/')).length;
  const outPeople = (g[e].out || []).filter(o => o.startsWith('people/')).length;
  const inPeople = (g[e].in || []).filter(i => i.startsWith('people/')).length;
  console.log(g[e].title + ': out=' + outNotes + 'n+' + outPeople + 'p, in=' + inNotes + 'n+' + inPeople + 'p');
}

// Find notes that are semantically about "writing" based on title patterns
console.log('\n=== WRITING-RELATED NOTES (by title) ===');
const writingNotes = notes.filter(n => /writ|essay|prose|style|craft|draft|publish/i.test(g[n].title));
writingNotes.forEach(n => console.log('  [' + ((g[n].out||[]).length + (g[n].in||[]).length) + '] ' + g[n].title));
