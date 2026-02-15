---
date: 2026-02-15
---
Mind is not just abstract computation, but computation constrained by thermodynamics, architecture, and scaling laws. LLMs do not exhaust mind—they are a form of mind constrained by its own designs. Not all computation is equal.

Also computation doesn’t happen without power, for both mind and computers. So whatever is powering them (e.g., food, solar, nuclear) is also part of such computations.

Mind might be computation, but what’s the scope of computation?

from grok:
- CPUs (von Neumann architecture): Separate memory and processing, sequential execution, clock-driven. Great for logic and control, but they hit the "von Neumann bottleneck" on data movement. Brains don't have this; memory is computation (synapses store and process). This teaches us minds aren't purely serial symbol-crunchers—too slow and energy-inefficient for the brain's feats.
	- I.e., synapses are both GPUs and CPUs
- GPUs (massively parallel, matrix/tensor ops): Designed for the kinds of computations neural nets love (dot products, activations). They're why transformers exploded. But compare to brains: GPUs are still digital, discrete, clocked, with memory hierarchies. Brains are analog-ish, event-driven (spikes only when needed), with compute and memory fused everywhere, and insane energy efficiency (~20W for the whole thing vs. a data center for GPT-scale).
- A killer deep dive here is Beren Millidge's "GPUs vs Brains: Hardware and Architecture" ([2023 blog post](https://www.beren.io/2023-04-09-GPUs-vs-brains-hardware-and-architecture/)) #revisit 
	- He argues the differences between deep learning and biological intelligence aren't software quirks—they're hardware constraints. ==Brains evolved for sparse, local, low-power ops==; GPUs for dense parallel math. This is why DL looks "brain-like" in some ways (distributed reps, prediction) but alien in others (no real online learning, no true multimodality without hacks). Studying GPUs shows what minds aren't: they don't need our exact parallelism, but they do need tight memory-compute integration and perhaps continuous dynamics.
- This feeds into neuromorphic computing—hardware explicitly built to mimic brain architecture (e.g., IBM's TrueNorth, Intel's Loihi, or FPGA setups like SCALP). Researchers here aren't just chasing efficiency; they're testing CTM by asking: "What computation emerges when you build chips that act like neurons?" Early results: better for sparse, adaptive tasks; hints that consciousness or robust agency might require substrate-specific tricks (e.g., analog noise, physical constraints). Papers on this often frame it as "hardware that thinks like the brain" to understand cognition.

from claude:
- **==Murray Shanahan==** (_Embodiment and the Inner Life_, and his more recent work on LLMs) is careful about what LLMs reveal vs. obscure about cognition.
- Putnam and Fodor said mind is substrate-independent (it's the computation, not the stuff). Searle pushed back with the Chinese Room, arguing the physical implementation matters. Penrose went further, claiming consciousness requires quantum processes in microtubules — i.e., the architecture is _everything_.
- **==Joscha Bach==** is probably closest to your wavelength. He argues mind _is_ computation, full stop, and takes the architectural constraints seriously as revealing something about what kinds of minds are possible.
- **Connectionism vs. classicism** (the Fodor/Pylyshyn vs. Smolensky debate from the 80s-90s) was exactly about whether parallel distributed processing (GPU-like) vs. serial symbol manipulation (CPU-like) better captures cognition. That debate is being relitigated now with transformers.
- **Chris Eliasmith** (Nengo, the Semantic Pointer Architecture) actually builds neural models on hardware and thinks carefully about how architectural constraints shape what computation—and therefore what cognition—is possible.
- The gap I see in the literature: very few people take the _specific engineering trade-offs_ of modern compute (memory bandwidth, attention as matrix multiplication, the fact that transformers are basically GPU-native architectures) and ask what that tells us philosophically about mind. Most philosophers of mind are hardware-agnostic, and most ML engineers don't care about philosophy of mind.

from chatgpt:
- Substrate-independent arguments (both strong and weak)
	- David Deutsch argues that the brain is a physical system performing computations, and that computation is substrate-independent. In this view:
		- Mind = a certain kind of physical information-processing
		- Architecture matters only insofar as it implements universal computation
		- LLMs are partial instantiations of cognitive processes
	- Hilary Putnam—early proponent of functionalism: mental states are functional states, not biological ones.
	- Daniel Dennett treats mind as a “virtual machine” implemented by the brain’s hardware. Architecture matters, but only at the level of enabling higher-order patterns.
- Architecture matters arguments
	- David Chalmers explores whether computational structure alone is sufficient for consciousness. Raises questions about: Is correct computation enough?; Does physical implementation matter beyond formal structure?
	- John Searle argues computation alone is insufficient (Chinese Room). The physical substrate supposedly matters in a non-computational way.
	- Terrence Deacon would reject “mind = computation” as too thin, and would say CPU/GPU architecture misses something essential about biological organization. He emphasizes:
		- Constraint hierarchies
		- Teleodynamics
		- The emergence of absence-based causation
			- <> counterfactual
- LLMs as experimental philosophy of mind
	- Joscha Bach argues mind is an internal generative model. LLMs approximate aspects of world modeling, language grounding, and self-modeling (partially)
	- Michael Levin explores cognition as scale-independent problem solving. Would interpret LLMs as non-biological cognitive agents with limited embodiment.
- Architecture-level analysis
	- ==Karl Friston==
		- Free Energy Principle: biological minds are prediction machines embedded in thermodynamics. This links computation to physics, not just logic.
	- ==Rolf Landauer==
		- Landauer’s principle: computation has thermodynamic cost. Mind, if computational, is physically constrained.