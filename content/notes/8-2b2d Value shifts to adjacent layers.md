And we create such layers [[13-1a3a2g The specialization process continues indefinitely |indefinitely]]

Previous
- [[8-2b2b Key moment is when people (e.g., devs) don't have to worry about the infrastructure (e.g., platform risks including high take rates)]]

Next:
- [[8-4b3 AI could one-box the entire internet]]
	- [[8-2b2e Humans really care about other humans]]

Related:
- [[2-1c1a4 'Commoditize your complement' tactic]]

---
E.g., 
- [SemiAnalysis on the evolution of CPUs](https://newsletter.semianalysis.com/p/cpus-are-back-the-datacenter-cpu) (20260210)
	- **The demand story flipped.** Everyone assumed CPUs would just slowly consolidate while GPUs ate the datacenter. Instead, RL environments need massive parallel CPU clusters for code compilation/verification/simulation, and agentic inference is generating internet traffic far beyond what humans produce. AI labs are now _scrambling_ for CPUs and competing with cloud providers for supply. Intel is raising prices and redirecting wafers from PC to server. This isn't a blip—<u>the CPU-to-GPU power ratio may actually increase with future GPU generations</u>.
	- **Intel squandered the GPU era.** While everyone was distracted by GPUs, Intel needed to use that time to get its CPU house in order. Instead, it made a series of compounding mistakes: Sapphire Rapids was years late, Sierra Forest E-cores saw limited adoption, Clearwater Forest is underwhelming (17% faster at much higher cost), Diamond Rapids ships without SMT (a decision traced back to Spectre/Meltdown panic), and they cancelled the mainstream 8-channel platform entirely. <u>They're now facing a demand surge they can't fully capitalize on</u>.
	- **AMD and the hyperscalers own the future.** AMD's modular chiplet strategy—once mocked by Intel—turned out to be the right architecture. Venice at 256 cores on 2nm with 2.67x the memory bandwidth of Turin will widen an already large lead. Meanwhile, every major hyperscaler (AWS, Microsoft, Google, Meta) now has their own ARM CPU, and ARM itself is becoming a chip vendor competing with its own licensees. <u>The x86 duopoly is effectively over for cloud—Intel's traditional enterprise stronghold is now AMD's for the taking</u>.
		- x86’s pie in the CPU world is shrinking (maybe <u>AMD is similar to Shift4</u> in the payment industry)—but the CPU pie is growing because of demand surge 
	- **NVIDIA quietly built a full-stack CPU play** but stumbled on Grace's branch prediction bottleneck, which is actively slowing GB200/GB300 AI workloads. Vera with the custom Olympus core is the fix, but it reveals that even NVIDIA can't just grab off-the-shelf ARM cores and call it done.
	- **Geopolitics matters.** Huawei lost 5 years to US sanctions but is rebuilding on SMIC, and by 2028 could own a significant chunk of China's datacenter CPU market—a market that's increasingly walled off from Western vendors.