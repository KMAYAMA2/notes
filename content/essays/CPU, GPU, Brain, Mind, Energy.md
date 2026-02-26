---
date: 2026-02-15
---
Mind is not just abstract computation, but computation constrained by thermodynamics, architecture, and scaling laws. LLMs do not exhaust mind—they are a form of mind constrained by its own designs. Not all computation is equal.

Also computation doesn’t happen without power, for both mind and computers. So whatever is powering them (e.g., food, solar, nuclear) is also part of such computations.

Mind might be computation, but what’s the scope of computation?

What does GPU driver updates (e.g., NVIDIA’s GeForce) improving CPU performance tell us about the architecture of compute?
- claude’s answer (with the below GPU vs Brains piece as context):
	- **CPU overhead reduction**: Modern GPU drivers include optimizations that reduce how much the CPU has to do to _manage_ the GPU — things like reducing driver-side CPU calls, batching draw calls more efficiently, or offloading scheduling work. The CPU appears faster because it's being asked to do _less busy-work_ for the GPU.
	- **Better resource contention management**: Drivers can improve how GPU and CPU share system memory (RAM) and the PCIe bus, reducing bottlenecks that were throttling both.
	- **Game/app-specific optimizations**: Some driver updates include tuned profiles for specific software that restructure the GPU workload in ways that happen to free up CPU cycles. So the CPU itself isn't getting faster — the _system-level coordination_ between CPU, GPU, and memory is getting more efficient. **Is this related to the article's themes? Yes, actually quite directly:** The article's core argument is that hardware architecture — not just software algorithms — is the primary driver of how intelligent computation gets structured. The GPU/CPU driver story illustrates something similar:
	- The von Neumann bottleneck the article describes (memory separated from compute) is essentially the same bottleneck that causes CPU/GPU coordination to be so tricky. The PCIe bus is a kind of "memory bandwidth wall" between two processing units.
	- The fact that _software_ (a driver update) can partially paper over _hardware_ inefficiencies echoes the article's point that software adapts to hardware constraints rather than the other way around.
	- The trend toward co-locating memory and compute (Cerebras, neuromorphic chips) is analogous to why unified memory architectures (like Apple Silicon, which puts CPU, GPU, and RAM on the same die) show real performance gains — you're physically reducing the bottleneck. So your intuition is right: the driver update phenomenon is a small, everyday demonstration of the same principle — that the _interface_ between compute units and memory is often the real constraint, and efficiency gains often come from better managing that interface rather than raw speed improvements to any one component.

### from grok:
- CPUs (von Neumann architecture): Separate memory and processing, sequential execution, clock-driven. Great for logic and control, but they hit the "von Neumann bottleneck" on data movement. Brains don't have this; memory is computation (synapses store and process). This teaches us minds aren't purely serial symbol-crunchers—too slow and energy-inefficient for the brain's feats.
	- I.e., synapses are both GPUs and CPUs
- GPUs (massively parallel, matrix/tensor ops): Designed for the kinds of computations neural nets love (dot products, activations). They're why transformers exploded. But compare to brains: GPUs are still digital, discrete, clocked, with memory hierarchies. Brains are analog-ish, event-driven (spikes only when needed), with compute and memory fused everywhere, and insane energy efficiency (~20W for the whole thing vs. a data center for GPT-scale).
- A killer deep dive here is Beren Millidge's "GPUs vs Brains: Hardware and Architecture" ([2023 blog post](https://www.beren.io/2023-04-09-GPUs-vs-brains-hardware-and-architecture/)) #revisit 
	- He argues the differences between deep learning and biological intelligence aren't software quirks—they're hardware constraints. ==Brains evolved for sparse, local, low-power ops==; GPUs for dense parallel math. This is why DL looks "brain-like" in some ways (distributed reps, prediction) but alien in others (no real online learning, no true multimodality without hacks). Studying GPUs shows what minds aren't: they don't need our exact parallelism, but they do need tight memory-compute integration and perhaps continuous dynamics.
- This feeds into neuromorphic computing—hardware explicitly built to mimic brain architecture (e.g., IBM's TrueNorth, Intel's Loihi, or FPGA setups like SCALP). Researchers here aren't just chasing efficiency; they're testing CTM by asking: "What computation emerges when you build chips that act like neurons?" Early results: better for sparse, adaptive tasks; hints that consciousness or robust agency might require substrate-specific tricks (e.g., analog noise, physical constraints). Papers on this often frame it as "hardware that thinks like the brain" to understand cognition.

### from claude:
- **==Murray Shanahan==** (_Embodiment and the Inner Life_, and his more recent work on LLMs) is careful about what LLMs reveal vs. obscure about cognition.
- Putnam and Fodor said mind is substrate-independent (it's the computation, not the stuff). Searle pushed back with the Chinese Room, arguing the physical implementation matters. Penrose went further, claiming consciousness requires quantum processes in microtubules — i.e., the architecture is _everything_.
- **==Joscha Bach==** is probably closest to your wavelength. He argues mind _is_ computation, full stop, and takes the architectural constraints seriously as revealing something about what kinds of minds are possible.
- **Connectionism vs. classicism** (the Fodor/Pylyshyn vs. Smolensky debate from the 80s-90s) was exactly about whether parallel distributed processing (GPU-like) vs. serial symbol manipulation (CPU-like) better captures cognition. That debate is being relitigated now with transformers.
- **Chris Eliasmith** (Nengo, the Semantic Pointer Architecture) actually builds neural models on hardware and thinks carefully about how architectural constraints shape what computation—and therefore what cognition—is possible.
- The gap I see in the literature: very few people take the _specific engineering trade-offs_ of modern compute (memory bandwidth, attention as matrix multiplication, the fact that transformers are basically GPU-native architectures) and ask what that tells us philosophically about mind. Most philosophers of mind are hardware-agnostic, and most ML engineers don't care about philosophy of mind.

### from chatgpt:
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

### Beren Millidge's ["GPUs vs Brains: Hardware and Architecture"](https://www.beren.io/2023-04-09-GPUs-vs-brains-hardware-and-architecture/)
- Brains and modern deep learning (DL) systems share fundamental similarities
    - Both perform (amortized) Bayesian inference on flexible learning substrates
    - Similar representations emerge across both, from sensory processing to cognitive biases
    - Both rely on unsupervised predictive/autoregressive learning at a functional level
- The key argument: differences between brains and DL are driven by **hardware**, not software
    - It's not really about learning objectives, credit assignment (backprop vs. predictive coding), or neuron types
    - It's about the physical constraints of GPUs vs. biological neural networks
    - Successful ML techniques aren't arbitrary — they're adaptations of core intelligence principles to available hardware
- Brain hardware constraints shape its architecture
    - **Energy**: ~10–20W budget forces sparse firing, slow connections, and "dark neurons" (unused cells)
    - **Size/volume**: neurons are packed into a skull; more neurons = more space and more energy
    - **Continual, single-batch learning**: data arrives as a correlated stream, batch size is always 1
        - Requires mechanisms to prevent catastrophic forgetting (memory hierarchies, fast weights)
        - Each data point demands more computation to offset gradient noise
    - **Two-dimensionality**: analog computation is naturally 2D, making tensor/batch operations unnatural
        - Forces recurrence to handle time rather than treating it as a spatial dimension like transformers do
- GPU hardware constraints shape DL architecture
    - **Dense SIMD specialization**: GPUs are optimized for large, dense matrix multiplications
        - Real-world data is sparse and power-law distributed; brains adapt to this, GPUs don't
        - DL systems brute-force sparse problems with dense graphs — effective but computationally wasteful
    - **Memory bandwidth bottleneck** (von Neumann bottleneck): memory and compute are physically separated
        - Most DL computation is "shallow" — each weight is used in just a multiply-add, but must be fetched from memory
        - A H100 GPU has ~80GB RAM; the brain has ~1–10 trillion synapses all active simultaneously
        - This forces brain-scale models to span large GPU clusters even when raw FLOP counts are comparable
- The brain compensates cleverly where GPUs brute-force
    - Brain uses adaptive sparse connectivity; DL uses massive dense matrices
    - Brain uses recurrent iterative inference with few parameters; DL uses very deep architectures
    - Brain uses targeted attention to conserve computation; DL attends to everything by default
- Two paths forward to close the gap
    - **Neuromorphic computing**: co-locate memory and compute (like the brain does), reducing the von Neumann bottleneck — e.g., Cerebras chips, analog hardware
    - **Higher compute-density architectures**: design networks that do more computation per weight while keeping the von Neumann architecture, though this is more neglected and leads to more "alien" forms of intelligence