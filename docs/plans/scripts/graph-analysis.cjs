const g = require('../data/graph.json');
const notes = Object.keys(g).filter(k => k.startsWith('notes/'));

// Analyze the numbering system
const topLevel = {};
for (const n of notes) {
  const title = g[n].title;
  const match = title.match(/^(\d+)-/);
  if (match) {
    const num = match[1];
    topLevel[num] = (topLevel[num] || 0) + 1;
  }
}
console.log('=== NOTE NUMBERING SYSTEM ===');
Object.entries(topLevel).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([num, count]) => {
  const catNotes = notes.filter(n => g[n].title.match(new RegExp('^' + num + '-')));
  const top = catNotes.map(n => ({ slug: n, title: g[n].title, total: (g[n].out || []).length + (g[n].in || []).length })).sort((a, b) => b.total - a.total)[0];
  console.log(num + ': ' + count + ' notes (top: "' + (top ? top.title : 'none') + '")');
});

// Cross-category linking patterns
console.log('\n=== CROSS-CATEGORY LINKS ===');
const crossLinks = {};
for (const n of notes) {
  const myNum = g[n].title.match(/^(\d+)-/);
  if (!myNum) continue;
  const myCategory = myNum[1];
  for (const out of (g[n].out || [])) {
    if (!out.startsWith('notes/')) continue;
    const target = g[out];
    if (!target) continue;
    const targetNum = target.title.match(/^(\d+)-/);
    if (!targetNum) continue;
    const targetCat = targetNum[1];
    if (myCategory !== targetCat) {
      const key = myCategory + '->' + targetCat;
      crossLinks[key] = (crossLinks[key] || 0) + 1;
    }
  }
}
Object.entries(crossLinks).sort((a, b) => b[1] - a[1]).slice(0, 25).forEach(([k, v]) => console.log('  ' + v + ' links: ' + k));

// People connection analysis
console.log('\n=== PEOPLE -> NOTE CATEGORY CONNECTIONS ===');
const people = Object.keys(g).filter(k => k.startsWith('people/'));
for (const p of people.sort((a, b) => ((g[b].out || []).length + (g[b].in || []).length) - ((g[a].out || []).length + (g[a].in || []).length)).slice(0, 10)) {
  const outCats = {};
  for (const out of (g[p].out || [])) {
    if (out.startsWith('notes/')) {
      const m = g[out] && g[out].title.match(/^(\d+)-/);
      if (m) outCats[m[1]] = (outCats[m[1]] || 0) + 1;
    }
  }
  console.log(g[p].title + ': ' + JSON.stringify(outCats));
}

// Notes that link to most different people
console.log('\n=== NOTES LINKED TO MOST PEOPLE ===');
const notesPeopleLinks = notes.map(n => {
  const peopleLinked = [...(g[n].out || []), ...(g[n].in || [])].filter(l => l.startsWith('people/'));
  return { slug: n, title: g[n].title, peopleCount: new Set(peopleLinked).size };
}).sort((a, b) => b.peopleCount - a.peopleCount);
notesPeopleLinks.slice(0, 15).forEach(n => console.log('  [' + n.peopleCount + ' people] ' + n.title));

// Find strongly connected clusters (notes that share many neighbors)
console.log('\n=== TAG CO-OCCURRENCE ===');
const tagPairs = {};
for (const k of Object.keys(g)) {
  const tags = g[k].tags || [];
  for (let i = 0; i < tags.length; i++) {
    for (let j = i + 1; j < tags.length; j++) {
      const pair = [tags[i], tags[j]].sort().join(' + ');
      tagPairs[pair] = (tagPairs[pair] || 0) + 1;
    }
  }
}
Object.entries(tagPairs).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([pair, count]) => console.log('  ' + count + ': ' + pair));
