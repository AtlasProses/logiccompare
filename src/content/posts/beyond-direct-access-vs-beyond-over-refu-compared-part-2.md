---
title: "Beyond Direct Access: vs. Beyond Over-Refu Compared (Part 2)"
meta_title: "Beyond Direct Access: vs. Beyond Over-Refu Compa... | LogicCompare"
description: "An authoritative, benchmark-driven technical breakdown of Beyond Direct Access and Beyond Over-Refusal, dissecting architecture, trade-offs, and failure modes in LLM agent security."
date: 2026-08-10T19:53:39.576Z
image: "/images/posts/beyond-direct-access-vs-beyond-over-refu-compared-part-2-cover.webp"
categories: ["Technology"]
authors: ["Kofi Addo"]
tags: ["Beyond Direct", "Beyond OverRefusal"]
draft: false
---

*This is Part 2 of the series. [Read Part 1 here](/blog/beyond-direct-access-vs-beyond-over-refu-compared).*

---

### Field Application Analysis (≥ 600 words)  

In production environments, the raw numbers from OpenClaw translate into observable service‑level impacts that security teams must weigh against operational constraints.  

**Latency Sensitivity**  
For latency‑critical services—such as real‑time code‑completion assistants or interactive trading bots—the 15 % latency increase introduced by BDA (≈ 500 ms added to a 3.2 s cold start) can be the difference between meeting a 2‑second SLA and breaching it. Field telemetry from a Fortune 500 fintech deployment showed that, after enabling BDA, the 99th‑percentile response time rose from 1.9 s to 2.4 s, triggering automatic scaling events that increased node count by 18 % and raised cloud spend by ≈ $12 k/month. In contrast, BOR’s 30 % latency penalty pushed the same metric to 2.9 s, causing a noticeable dip in user satisfaction scores (‑0.12 NPS) and prompting the team to revert to BDA after a two‑week A/B test.  

**Memory Pressure**  
The baseline agent already consumes 1.84 GB of resident memory, largely due to the latent instruction manifold that stores cached tool‑call embeddings. BDA adds a lightweight eBPF‑based monitor that hooks into the agent’s gRPC proxy, consuming an additional ~180 MB. This bump is usually absorbed by existing memory headroom in Kubernetes pods configured with a 2 GiB limit. BOR, however, requires a separate refusal‑reasoning module that keeps a running hash‑map of recently seen prompts; in high‑traffic scenarios ( > 5 k rps ) this structure can grow to 400 MB, pushing total usage beyond 2.2 GB and triggering OOM kills unless the pod limits are raised. Operators reported that, after raising limits to 2.5 GB, node utilization rose from 65 % to 78 %, reducing the headroom for bursty workloads.  

**Detection Efficacy vs. False Positives**  
BDA’s resource‑monitoring approach yields a high detection rate (92 %) because it looks for anomalous CPU cycles and memory spikes that are hallmarks of resource‑hijacking loops. However, legitimate bursts—such as a user triggering a massive data‑export tool that legitimately consumes CPU—can trigger false positives. In a SaaS customer‑support bot, false positives accounted for 4.1 % of all alerts, leading to unnecessary throttling of genuine workflows. Operators mitigated this by implementing a dynamic threshold that scales with recent legitimate traffic volume, cutting false positives to 2.3 % while retaining an 88 % detection rate.  

BOR’s refusal‑centric design yields fewer false positives (2.8 %) because it only flags when the model’s internal refusal logits cross a calibrated threshold *and* a tool call is attempted. The downside is that sophisticated attackers can craft prompts that avoid triggering refusal logits while still hijacking resources (e.g., by nesting tool calls inside a benign‑looking summarization step). In a red‑team exercise, BOR missed 12 % of stealthy hijacking attempts that used chain‑of‑thought reasoning to stay below the refusal threshold.  

**Throughput and Scalability**  
Throughput numbers reveal the cost of defensive overhead. At a steady 10 k rps mixed load, Baseline sustained ~310 req/s of legitimate work after accounting for attack traffic; BDA dropped to ~260 req/s (‑16 %); BOR fell further to ~230 req/s (‑26 %). The reduction is primarily due to extra serialization steps in the monitoring shim (BDA) and the additional refusal‑evaluation pass (BOR). In an autoscaling group targeting 80 % CPU utilization, the baseline needed 32 nodes to handle peak load; BDA required 38 nodes (+19 %); BOR needed 44 nodes (+38 %).  

**Operational Complexity**  
Deployment complexity reflects the integration effort. BDA can be rolled out as a sidecar container that intercepts gRPC streams, requiring only a modest Helm chart update and a Prometheus alert rule. BOR demands a custom model wrapper that injects refusal‑logit extraction and a accompanying policy engine, which often necessitates retraining the base model with a refusal‑aware loss function or loading an adapter. Teams reported that BDA took ~2 person‑weeks to move from staging to prod, while BOR required ~5 person‑weeks due to the need for validation suites that ensure refusal thresholds do not degrade generative quality.  

**Adaptive Attack Resilience**  
When subjected to adaptive adversaries who iteratively probe the defense, BDA’s robustness score of 4 reflects its ability to detect new hijacking patterns via anomaly detection, though low‑frequency, high‑amplitude spikes can evade thresholds if the monitoring window is too large. BOR’s score of 3 indicates that once an attacker discovers a prompt formulation that keeps refusal logits low, the defense offers little additional protection beyond baseline monitoring. In practice, the most resilient deployments combine both: a BDA shim for catch‑all resource anomaly detection, layered with BOR’s refusal logic to curb low‑resource, high‑semantic abuse.  

**Bottom‑Line Field Guidance**  
- If latency SLAs are tight (< 2 s p99) and memory headroom exists, adopt BDA with dynamic thresholds.  
- If false‑positive fatigue is a primary concern and you can tolerate ~30 % latency growth, BOR is preferable.  
- For high‑value assets (e.g., financial trading agents), run both in tandem, adjusting the BDA sampling rate to 100 ms windows and tightening BOR refusal thresholds based on continuous red‑team feedback.  

---


## ## Frequently Asked Questions (Strategic FAQ)  

**Q1: *Why does BDA show a higher detection rate but also a higher false‑positive rate compared to BOR, given that both rely on observable telemetry?*  
BDA’s detection mechanism watches for deviations in raw resource consumption (CPU cycles, memory allocation, network egress). Any legitimate workload that spikes those metrics—such as a user‑initiated video‑rendering tool or a large‑scale data export—will appear anomalous, leading to false positives. BOR, by contrast, only raises an alert when the model’s internal refusal logits exceed a calibrated threshold *and* a tool call follows. This two‑step gating filters out many benign spikes that do not trigger the model’s refusal circuitry, thus lowering false positives. However, sophisticated attackers can craft prompts that keep refusal logits low while still consuming resources (e.g., by using a chain of harmless‑looking tool calls that each consume a small slice of CPU). Those attacks slip past BOR’s refusal check but are still caught by BDA’s resource anomaly detection, explaining BDA’s superior detection rate despite its higher false‑positive baseline.  

**Q2: *In the table, BOR’s memory footprint is listed as 2.21 GB (+20 % over baseline). Does this mean the refusal module duplicates the latent instruction manifold, or is it an additive structure?*  
The 2.21 GB figure reflects the baseline manifold (1.84 GB) plus an auxiliary refusal‑reasoning cache that stores recent prompt embeddings and their associated refusal logits. This cache is **additive**, not a duplicate; it does not store a second copy of the full manifold. The cache size grows with the number of distinct prompts observed in a sliding window (default 10 k entries). In high‑traffic scenarios, the cache can approach 400 MB, which is why the total exceeds 2 GB. Importantly, the cache is periodically pruned using an LRU policy, so the memory impact plateaus rather than growing linearly with request volume.  

**Q3: *If I enable both BDA and BOR, does the latency penalty simply add (≈ 45 %), or are there interactions that could make it worse or better?*  
The combined latency is **sub‑additive** in practice. Baseline cold‑start latency is 3.2 s. Adding BDA alone yields ~3.68 s (+15 %). Adding BOR alone yields ~4.16 s (+30 %). When both are enabled, measurements show a cold‑start latency of ~4.0 s, which is roughly **+25 %** over baseline—not the sum of 45 %. The reason is that both defenses share some instrumentation overhead: the BDA shim already intercepts the gRPC stream, and BOR’s refusal‑logit extraction can piggyback on the same interception point, avoiding a second round‑trip through the proxy. However, the refusal module still adds its own evaluation step (~8 ms per request), so the net gain is not zero. In steady‑state throughput tests, the combined configuration achieved ~240 req/s (‑23 % vs baseline), which is better than the naïve additive estimate (‑45 %).  

**Q4: *Given the numbers, is there a scenario where sticking with the baseline (no defense) is the rational choice?*  
Yes—when the threat model is limited to **low‑volume, high‑benign‑traffic** environments where the cost of a successful hijacking or indirect injection is negligible compared to the SLA impact of added latency and memory. For example, an internal HR chatbot that only answers policy questions, runs on a dedicated VM with 4 GB RAM, and has a strict 500 ms p99 latency requirement cannot afford any extra overhead. In such a case, the organization might accept the risk and rely on procedural controls (e.g., network segmentation, strict IAM roles) rather than runtime defenses. The baseline’s 0 % detection rate is then mitigated by environmental hardening rather than telemetry‑based controls.  

---


## ## Synthesized Strategic Verdict & Gotchas  

**Strategic Verdict**  
The data make it clear that *Beyond Direct Access* and *Beyond Over‑Refusal* are not interchangeable drop‑in replacements; they occupy distinct points on the latency‑memory‑detection‑complexity frontier. BDA offers the best **detection‑to‑overhead ratio** for spotting resource‑hijacking campaigns, delivering a 92 % catch rate with a modest