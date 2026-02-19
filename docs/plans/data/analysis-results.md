# Phase 2 Analysis Results: A/B/C/D Testing

**Date**: 2026-02-18
**Vault**: 1,856 entries (1,786 notes, 54 people, 14 essays)
**Tools**: qmd v1.0.6 (BM25 keyword + vsearch vector semantic + query hybrid+reranking), graph.json (link skeleton)
**Update**: `qmd query` now works after patching llm.js to prefer Vulkan over CUDA. Results added below.

---

## Question 1: What's his focus?

### Method A (qmd + links)

The vault is organized into 13 numbered categories that reveal a deliberate intellectual architecture:

| Cat | Notes | Theme | Avg Connections |
|-----|-------|-------|-----------------|
| 1 | 293 | Epistemology, fallibilism, calibration | 11.8 |
| 2 | 170 | Information, mental models, thinking tools | 17.9 |
| 3 | 161 | Thinking, creativity, style, constraints | 15.2 |
| 4 | 88 | History, narratives, feedback | 11.6 |
| 5 | 168 | Knowledge, reality, measurement, economics | 16.0 |
| 6 | 79 | Ownership, property, community | 11.8 |
| 7 | 100 | Technology, creation, products | 13.5 |
| 8 | 92 | Computing, platforms, web3, LLMs | 11.2 |
| 9 | 143 | Communication, writing, entrepreneurship | 13.7 |
| 10 | 168 | Language, consciousness, culture, mind | 13.0 |
| 11 | 18 | Returns, utility, specialization | 14.1 |
| 12 | 26 | Contingency, freedom, networks | 18.0 |
| 13 | 188 | Economics, human action, praxeology | 12.1 |

The cross-category link data reveals the **core nexus**: categories 1↔10 (epistemology ↔ language/consciousness, 325 bidirectional links) and 2↔5 (information/models ↔ knowledge/economics, 319 links). These are not separate interests — they form a unified system where epistemology explains how knowledge grows, language explains how it's represented, and economics explains how it's acted upon.

Top people confirm this: **Warren Buffett** (554 connections across ALL 13 categories), **Ludwig Lachmann** (146), **Sherlock Holmes** (140), **David Deutsch** (125), **Daniel Everett** (117). Buffett is used as a universal lens; Deutsch supplies the epistemology; Everett supplies the linguistics; Lachmann/Rothbard supply the economics; Holmes models the reasoning process.

qmd semantic search surfaces the content that links miss: extensive reading notes on *The Fabric of Reality*, *How Language Began*, *Human Action*, *The Dao of Capital*, plus deep investment memos for Buffett, Burry, and Li Lu.

**Combined answer**: He orbits three gravitational centers — Popperian epistemology (how knowledge grows), Austrian economics (how humans act under uncertainty), and the philosophy of language/consciousness (how meaning is created). These are not separate interests but a single project: understanding reality through the lens of conjectural, fallible, creative knowledge.

### Method B (Links only)

Graph data alone shows: 1,786 notes in 13 categories with dense cross-linking (avg 14 connections, median 10). Heaviest bridges: 2→5 (200 links), 1→10 (166), 10→1 (159). Tags: "develop" (476), "revisit" (206). Top people: Buffett, Lachmann, Holmes, Deutsch, Everett.

**Limitation**: Links show *that* things connect but not *why*. The numbering system (1-, 2-, 5-...) is opaque without reading content. "Category 2" could mean anything until you see the actual notes.

### Method C (qmd only)

**BM25 keyword search**: "epistemology Popper" returns *The Fabric of Reality* notes, Popperian epistemology chains, and the conjecture/refutation framework. "investing economics Austrian" returns Rothbard memos, Lachmann's capital theory, Dao of Capital notes. "consciousness language meaning symbol" returns *How Language Began*, symbol theory notes, and the Turing principle chain.

**vsearch (vector semantic search)**: Asking "what are his main intellectual interests and focus areas" surfaced a *different layer* — the practical/applied one: Amara's law, calibration, Buffett's decision-making frameworks. BM25 finds notes that use the exact words you searched for; vsearch finds notes that are *about the same thing* in different vocabulary. For Q1, vsearch revealed that beneath the three philosophical pillars there's a pragmatic "how to actually apply this" layer that keyword search misses because it uses concrete language (calibration, margin of safety) rather than abstract labels (epistemology, praxeology).

**Limitation**: qmd reveals content clusters but not their structural relationships. It can't tell you that categories 1 and 10 are the most cross-linked, or that Buffett connects to all 13 categories. It finds *similar* notes but not *deliberately connected* ones.

**qmd query (hybrid + LLM reranking)**: "what topics and themes keep coming back, what is the focus and recurring interest" — expanded into 25 sub-queries, searched, then reranked 40 chunks. Top result (88%): "Chasing growth = Keep redefining the problems to be solved" — a growth/focus framework note. Also surfaced the /now page (current interests), "Time will tell because time can de-contextualize seeming necessities" (history/epistemology), and Lachmann's capital structure theory. The reranker added clear value by scoring the most relevant results 88% and sharply dropping to 33-50% for secondary hits, creating a much cleaner separation than BM25 or vsearch alone. The results emphasize the **action-oriented** layer of focus — not just "what topics" but "how he revisits and redefines them."

### Method D (Claude only — 30 random files)

From raw files: "Kenti orbits around three gravitational centers that he is actively trying to unify into a single framework." Identified the same three pillars: Popperian epistemology, Austrian economics/praxeology, and philosophy of mind/culture/information. Also identified the practical "how to live and work well" thread (structured procrastination, not keeping a schedule, the Fun Criterion).

**Limitation**: The random sample correctly identified the pillars but couldn't quantify them. Method D couldn't see that Cat 2 (information/mental models) has the highest connection density (17.9 avg), or that Cat 12 (contingency/freedom) is even denser (18.0 avg) despite having only 26 notes — suggesting a small but deeply worked cluster.

### Where methods agreed vs diverged

**All four agree**: Epistemology, Austrian economics, and language/consciousness are the core triad. All four identified Popper, Deutsch, Buffett, and Lachmann as central figures.

**A uniquely showed**: The precise cross-category link densities and the structural importance of category 12 (contingency/freedom) as the densest cluster despite being small. Also that Buffett functions as a *universal connector* (links to all 13 categories) rather than just an investing figure.

**C uniquely showed**: Two layers. BM25 showed the depth of engagement with specific books — extensive notes on *Fabric of Reality*, *How Language Began*, *Human Action* — showing this isn't casual interest but serious study. vsearch showed the practical/applied layer beneath the pillars — how abstract philosophy gets translated into concrete decision-making tools.

**D uniquely showed**: The practical life-philosophy layer woven through everything (how to live, work, procrastinate, create). This is less visible in search results or link graphs because it's distributed across many notes rather than clustered.

---

## Question 2: What's unique about him?

### Method A (qmd + links)

The graph structure reveals something remarkable: **Warren Buffett is the most connected entity in the vault by 4x** (554 connections vs. next at 146). Buffett links to categories spanning epistemology, information theory, creativity, language, economics, technology — literally everything. This is not an investing vault with some philosophy bolted on. It's an epistemology vault where Buffett is used as the primary case study of applied Popperian thinking in the real world.

The qmd content confirms: investment memos (2,700+ lines for Buffett alone) are structured as epistemological exercises — connecting "margin of safety is about payoff" to fallibilism, "bounded commitment" to irreversibility theory, "doing something simple doesn't get attention" to Brandolini's law. He's reverse-engineering investing wisdom through the lens of knowledge theory.

The people→category connections show unique bridges:
- **David Deutsch** links heavily to Cat 1 (epistemology) and Cat 10 (language) — expected
- **Daniel Everett** links to Cat 10 (32 links) and Cat 1 (31 links) — connecting linguistics to epistemology
- **Sherlock Holmes** links to Cat 2 (25 - information), Cat 3 (14 - thinking) — used as a reasoning model

No one else builds a system where a physicist-philosopher (Deutsch), a linguist (Everett), a detective (Holmes), and an investor (Buffett) are the pillars of one coherent worldview.

### Method B (Links only)

The numbering system itself is unique — a Luhmannian Zettelkasten with 13 top-level branches and deep nesting (slugs like 5-1b1a1c4). The density of cross-links (avg 14 per note, only 36 orphans out of 1,856) shows someone who thinks primarily in connections. Japanese text appears in note titles ("情報とは差異", "テーマはひとつでは多すぎる") suggesting bilingual conceptual thinking.

### Method C (qmd only)

**BM25**: Surfaces the original synthesis notes: "The multiverse implies human action — the laws of physics dictate that humans act" connects quantum physics to Mises. "Regime-switching model implemented Popperian epistemology to trade financial derivatives" connects philosophy to finance. "How Popper would use LLMs" connects epistemology to AI. These aren't summaries — they're genuine cross-disciplinary claims.

**vsearch**: Asking "what makes this person unique unusual combination of perspectives" surfaced a meta-awareness layer: notes about *connecting ideas themselves* (specific knowledge, emicization, the act of bridging domains). vsearch found notes about the *process* of synthesis, not just the products of it — suggesting he doesn't just combine fields, he thinks explicitly about what it means to combine fields.

**qmd query (hybrid + LLM reranking)**: "what unique combinations of interests or perspectives are unusual, what makes this thinking distinctive" — top result (88%): "Because minds never hold precisely the same idea, 'having everyone on the same page' is epistemological impossibility." The reranker surfaced a strongly **epistemological** thread on uniqueness: don't let conceptions constrain the mind, reading originals shouldn't be the default, connecting/relating ideas is a way of creating knowledge, the difference between incorporating the unconscious vs. indulging in it. The distinctive finding vs. BM25/vsearch: the reranker elevated notes about the *impossibility of shared understanding* and the *necessity of individual knowledge creation* — the philosophical foundation for why his cross-disciplinary synthesis approach is necessary, not just interesting.

### Method D (Claude only)

"The most unusual thing about Kenti is the systematic attempt to unify David Deutsch's epistemology, Austrian economics, and Eastern philosophy into a single coherent framework. This is genuinely rare." Also noted: Japanese phrases carry conceptual weight the English equivalents don't capture. Pop culture (Elden Ring, Naruto) and video games are treated as philosophical laboratories, not casual analogies.

### Combined answer

What makes him unique is not any single interest but the **systematic, deliberate unification** of domains that virtually no one else combines: Popperian epistemology + Austrian economics + philosophy of language + investing practice + Japanese intellectual culture + pop culture as philosophy. The vault's architecture (13-category numbering, 14 avg cross-links, bilingual titles) is itself an expression of this: it's a machine for synthesizing across domains.

---

## Question 3: What are his strengths and weaknesses?

### Method A (qmd + links)

**Strengths identified by graph structure**:
- Categories 2 (mental models, 17.9 avg connections) and 12 (contingency/freedom, 18.0 avg) are the densest — his thinking is deepest where he builds abstract frameworks and explores philosophical implications
- 55+ writing-related notes show deep meta-awareness of the craft
- Only 36 orphans out of 1,856 — extremely low isolation rate
- Cross-category linking is heaviest in 1↔10 and 2↔5 — the connections between epistemology/language and information/economics are thoroughly worked

**Weaknesses identified by graph structure**:
- 14 essays vs 1,786 notes — **conversion rate from notes to essays is < 1%**
- 476 notes tagged "develop" (26% of vault) and 206 tagged "revisit" — vast unfinished territory
- Categories 8 (computing/platforms, 11.2 avg connections) and 4 (history/narratives, 11.6) are the sparsest — thinking about practical technology and historical application is thinnest
- Cat 10 (language/consciousness) has the highest develop-tag rate (40%) — suggesting the language/mind pillar is the least developed despite being a core interest
- Essay connection patterns are highly uneven: "How Popper would use LLMs" (27 outgoing note links) vs "Money - Days of Future Past" (0 links) — some essays are deeply embedded in the vault, others are disconnected islands

**qmd content confirms**:
- Austrian economics notes lean toward quotation and summary (Rothbard memos, Mises highlights) rather than original argument
- Epistemology notes contain more original synthesis (connecting Popper to LLMs, to investing, to games)
- Investment memos are extremely detailed but primarily extractive (highlights + cross-references) rather than argumentative

### Method B (Links only)

Strengths: Dense, well-connected. Weaknesses: Can't see content quality — a note with 50 links could be profound or superficial. The "develop" tag distribution suggests Cat 6 (ownership, 41% develop) and Cat 10 (consciousness, 40% develop) are the areas most in need of development.

### Method C (qmd only)

**BM25**: Strengths: Deep engagement with primary sources (full book notes for Deutsch, Rothbard, Everett, Lachmann). The writing-theory notes ("A good essay = importance + novelty + correctness + strength", "Write each sentence like you are talking to a friend") show sophisticated understanding of craft. Weaknesses: Search for "writing improvement" and "essay craft" initially returned no BM25 results — suggesting the vocabulary for writing about writing is scattered rather than consistent.

**vsearch**: Asking "strengths and weaknesses depth of thinking shallow gaps" surfaced practical reasoning tools: weakest-link thinking, skepticism, negotiation. This revealed a strength that BM25 and graph analysis both missed — a practical reasoning toolkit that doesn't use the vocabulary of "strength" or "deep thinking" but is clearly about applied intellectual rigor. The writing notes are dispersed across categories 3, 4, 9, and unnumbered entries rather than concentrated.

**qmd query (hybrid + LLM reranking)**: "where is the thinking deep versus shallow, what are intellectual strengths and weaknesses and gaps" — top result (88%): "Most books about thinking focus on being more rational when the fundamental problem is not knowing what problems to exercise judgement." This is a meta-insight about *the vault's own strength*: the thinking is deepest at **problem-framing** rather than problem-solving. The reranker also elevated "Multidisciplinary thinking is the most realistic thinking" (50%), "First-conclusion bias — separate problem-defining from problem-solving" (38%), and notes on hidden assumptions and negotiation. What the reranker uniquely adds: it correctly identified that the vault's intellectual center of gravity is *meta-cognitive* — thinking about how to think, rather than conclusions about specific topics. The 88% → 33% score drop cleanly separates the core insight from supporting material.

### Method D (Claude only)

"His thinking is deepest at the meta-level of epistemology and its application to how one should live and work." The Elden Ring essay demonstrates original thinking; Austrian economics notes tend toward quotation without independent argument. The "CPU, GPU, Brain, Mind, Energy" essay is ambitious but reads as a research brainstorm. Geopolitical notes in "Not fighting can win you the battle" are "the weakest content in the sample — asserted without argument or evidence."

### Combined answer

**Strengths**: (1) Deep epistemological framework consistently applied across domains. (2) Extremely well-connected vault with low isolation. (3) Original cross-disciplinary synthesis (Popper + investing, multiverse + praxeology). (4) Sophisticated meta-awareness of writing as a craft. (5) Best essays (Elden Ring, Unreasonably Reasonable, Problem-Solving Artist) are distinctive, clear, and genuinely thought-provoking.

**Weaknesses**: (1) Massive gap between notes (1,786) and essays (14) — the conversion pipeline is bottlenecked. (2) Austrian economics material leans extractive (quotes + cross-refs) rather than argumentative. (3) Language/consciousness pillar (Cat 10) is 40% undeveloped despite being a core interest. (4) Some content (geopolitical notes) lacks the critical rigor applied elsewhere. (5) Many essay seeds exist ("Gresham's Law and AI", "Moat Digitized") but remain at zero or one connection — unstarted.

---

## Question 4: How can he improve his writing?

### Method A (qmd + links)

The graph reveals a **structural bottleneck**: the vault contains 55+ notes *about* writing (the theory of writing) and 14 actual essays. The theory is rich:
- "Writing generates ideas" (9-4b)
- "A real essay starts with a question, not a position" (1-1a5a)
- "Good writing happens at the edge of explicit-inexplicit" (1-1a5a2)
- "Write what you usually don't say. For essays, write what you wouldn't dare say." (1-1a5a2)
- "The essence of writing is rewriting" (unnumbered)
- "A good essay = importance + novelty + correctness + strength" (9-4d)

But essay output is low, and the essays that exist are unevenly connected: "How Popper would use LLMs" is deeply embedded (27 outgoing links, 8 incoming), while 5 essays have zero outgoing links and read as standalone pieces disconnected from the vault.

qmd search for writing improvement surfaced notes like "Write a bad version 1.0 as fast as you can" (9-4b3a) and "Write each sentence like you are talking to a friend" (9-4b3e4) — he already has the theory. The gap is execution.

**What the combined tools uniquely show**: The `#develop` tags are a map of his most interesting unfinished thinking. 476 notes tagged "develop" = 476 potential essay seeds. The most connected develop-tagged notes are the strongest candidates for essays because they already have the link scaffolding that essays need.

### Method B (Links only)

14 essays. 5 have zero outgoing links (disconnected). 3 have zero incoming links (no other notes reference them). Only "How Popper would use LLMs" and "Become A Problem-Solving Artist" are fully integrated into the vault. This suggests a pattern: essays written *from* the note system succeed; essays written *beside* it don't.

### Method C (qmd only)

**BM25**: Search for "writing improvement" and "essay craft" returned **zero results** — the most striking failure of keyword search in the entire test. The writing theory exists but doesn't use the words "writing improvement" or "essay craft."

**vsearch**: Asking "how to improve writing craft and become a better essayist" found a **rich cluster that BM25 completely missed**: William Zinsser's *On Writing Well* notes, storytelling theory, narrative structure, the craft of simplicity, writing as rewriting. This was the single strongest demonstration of vsearch's value in the entire A/B/C/D test — the vault has substantial writing craft material, but it lives under vocabulary like "simplicity," "clarity," "rewriting," "storytelling" rather than "writing improvement." Only semantic similarity can bridge that gap.

The writing theory notes are sophisticated but scattered across categories 1, 3, 4, 9, and unnumbered. There's no single "how to write" hub — the ideas are distributed. vsearch can find them semantically, but a reader browsing the vault wouldn't discover them as a coherent framework.

**qmd query (hybrid + LLM reranking)**: "how to improve writing, what patterns hold back the writing and what works well in essays" — the richest result set of all four questions. Top result (88%): "A good essay = importance + novelty + correctness + strength" — the vault's own essay framework. Then: "How to write" (50%), "Good storytelling is about taking readers to something slightly in advance" (44%), "Why write" (41%), "Someone who never writes has no fully formed ideas" (38%), Everett's *How Language Began* on stories (38%), "Writing generates ideas" (37%), PG's 50-reread method (35%), Zinsser (34%), "Concise explanations accelerate" (34%). The reranker's key contribution: it correctly placed **framework-level** notes (what makes a good essay, why write at all) above **technique-level** notes (how to write concisely, Zinsser's Occam's razor). This mirrors the vault's own intellectual style — theory-first, then practice. The score gradient (88% → 34%) is the most informative of all four questions, cleanly ranking from philosophy of writing → craft of writing → specific techniques.

### Method D (Claude only)

Three specific patterns identified:
1. **Over-reliance on cross-references as a substitute for argument** — many notes are a title-claim + link list with zero explanation. The notes that work best contain at least one sentence of original commentary.
2. **Unfinished scaffolding left visible** — `#revisit`, `#develop`, `#challenge` tags, `==highlighted==` internal thinking, "from grok/claude/chatgpt" attributions. The gap between best essays and note stubs is enormous.
3. **Letting quotations do the talking** — people pages heavy with quotes but light on framing. Pages with original framing (Carlo Cipolla's expanded typology, Will Guidara's contextualized quotes) work; pages without it are someone else's thinking in his vault.

**Concrete recommendation from Method D**: "His improvement path is not to write differently but to write more essays like his best ones — taking the strongest connections from his note system and forcing himself to articulate the reasoning that connects them, rather than leaving the connections as bare links."

### Combined answer

1. **Write essays from the vault, not beside it.** His best essays ("How Popper would use LLMs" — 27 links, "Become A Problem-Solving Artist" — 12 links) are deeply embedded in the note system. His weakest ("Gresham's Law and AI" — 0 links, "Money - Days of Future Past" — 0 links) are disconnected. The note system is the creative engine; essays that use it succeed.

2. **Convert develop-tagged hub notes into essays.** The 476 `#develop` notes are the raw material. The most connected ones already have the scaffolding: an idea at the center, related notes around it, and people/books as supporting evidence. The missing step is the paragraph of original argument that transforms links into prose.

3. **Add one sentence of original commentary to every note.** The notes that work are the ones with even a single sentence beyond the link list. "The multiverse implies human action" is a bold claim that could be a paragraph or an essay. Most notes stop at the claim + links.

4. **Consolidate the writing theory.** 55+ notes about writing are scattered across 5+ categories. These could be synthesized into a manifesto or essay that crystallizes his approach — which would itself be an exercise in the conversion pipeline he needs to build.

---

## Tool Assessment: What each method uniquely contributed

| Method | Unique contribution | Missed |
|--------|-------------------|--------|
| **A (qmd + links)** | Full picture: content depth + structural context. Found that Cat 12 is densest despite being small. Connected "develop" tag rates to category weaknesses. | Nothing major — it's the combination |
| **B (Links only)** | Structural facts: connection counts, cross-category bridges, orphans, tag distribution. Quantified the note→essay bottleneck (1786:14). | Content quality, thematic depth, original vs extracted material |
| **C (qmd only)** | Content depth via three channels — BM25 for known-vocabulary, vsearch for concept-level discovery, query for ranked relevance with clean score gradients. query's reranker correctly prioritized framework-level notes over technique-level ones. | Structural relationships, connection patterns, deliberate architecture |
| **D (Claude only)** | Writing quality assessment: identified over-reliance on links, unfinished scaffolding, quote-heavy pages. Best at evaluating *how well* ideas are expressed. | Scale, quantification, structural patterns across 1,856 entries |

### BM25 vs vsearch vs query: What each search mode uniquely adds

The original Method C used only BM25 (keyword matching). After re-running with vsearch (vector semantic) and then query (hybrid + LLM reranking), the three modes showed complementary strengths:

| Question | BM25 found | vsearch found | query (hybrid+rerank) found | Delta |
|----------|-----------|--------------|---------------------------|-------|
| Q1 (focus) | Core pillars via exact terms | Practical/applied layer (Amara's law, calibration) | Action-oriented layer — growth, redefining problems, revisiting fundamentals | Three distinct layers |
| Q2 (uniqueness) | Synthesis claims in their own words | Meta-awareness of synthesis as a process | Philosophical foundation — why individual knowledge creation is necessary | Deepening |
| Q3 (strengths) | Book engagement, writing theory | Practical reasoning toolkit (weakest-link, skepticism) | Meta-cognitive center — problem-framing > problem-solving | Additive |
| Q4 (writing) | **Zero results** | William Zinsser, storytelling theory, narrative structure | Correctly ranked framework (88%) above technique (34%) — clean gradient | **Dramatic** on all fronts |

**What BM25 does**: Finds notes using the exact vocabulary you search with. Fast, deterministic. Fails when the vault uses different words for the same concepts.

**What vsearch adds**: Finds notes by *meaning* regardless of vocabulary. Essential for a vault with idiosyncratic terminology. The Q4 writing case was the strongest demonstration — BM25 found nothing, vsearch found the entire craft cluster.

**What query (hybrid+rerank) adds**: Combines BM25 + vector search, then uses a 0.6B LLM reranker to score results by true relevance. The key contribution is **clean score gradients** — the reranker reliably puts the most relevant results at 88% and drops secondary material to 33-50%, creating an unambiguous ranking. It also correctly distinguishes framework-level notes (theory, philosophy) from technique-level notes (practical tips), which neither BM25 nor vsearch can do alone. On Q4, the reranker placed "A good essay = importance + novelty + correctness + strength" at 88% and "Concise explanations accelerate" at 34% — correctly identifying the former as the higher-level insight.

### Verdict

**The hypothesis held: A (combined) is strictly better than B, C, or D alone.**

But the margin varies by question:
- **Q1 (focus)**: All four methods converge. The baseline (D) was nearly as good as A for identifying core themes — because the themes are so dominant that 30 random files suffice. vsearch adds the practical/applied layer that keyword search misses.
- **Q2 (uniqueness)**: A adds the most. Only the combination reveals Buffett's 4x dominance as universal connector, or the precise cross-category link patterns that show deliberate synthesis. vsearch adds the meta-awareness dimension.
- **Q3 (strengths/weaknesses)**: A is significantly better. B shows structural weaknesses (develop-tag rates, sparse categories) that C and D can't see. C shows content weaknesses (extractive vs. original) that B can't see. vsearch surfaces the practical reasoning toolkit. D shows writing quality issues. Only A combines all four.
- **Q4 (writing improvement)**: D was strongest for actionable advice (concrete writing patterns). But **vsearch was essential for discovery** — it found the entire writing craft cluster that BM25 missed. And **query's reranking was the most informative here** — the 88% → 34% gradient cleanly ranked from philosophy of writing → craft → technique, mirroring the vault's own intellectual style. A (combined) is the clear winner.

**Key insight**: qmd's unique value comes in three layers — BM25 finds content using the author's exact vocabulary, vsearch finds content by meaning regardless of vocabulary, and query's reranker adds intelligent relevance scoring that distinguishes framework-level insights from technique-level details. Graph's unique value is showing structural patterns invisible at the file level (connection density, cross-category bridges, bottlenecks). Claude's unique value is qualitative judgment (is this writing good? is this argument original? is this quote doing the author's thinking for them?). The best analysis uses all of these. vsearch is the critical differentiator that makes qmd more than "fancy grep," and query's reranker is what makes the results actionable by ranking them meaningfully.
