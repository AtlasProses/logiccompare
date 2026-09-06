---
title: "Zeta-Lite: A Concurrent,: Architecture, Memory & Benchmark (Part 2)"
meta_title: "Zeta-Lite: A Concurrent,: Architecture, Memory &... | LogicCompare"
description: "An authoritative, benchmark-driven technical breakdown of Zeta-Lite: A Concurrent,, dissecting architecture, trade-offs, and failure modes."
date: 2026-08-08T16:35:42.438Z
image: "/images/posts/zeta-lite-a-concurrent-architecture-memory-benchmark-part-2-cover.webp"
categories: ["Technology"]
authors: ["Linda Johnson"]
tags: ["ZetaLite A"]
draft: false
---

*This is Part 2 of the series. [Read Part 1 here](/blog/zeta-lite-a-concurrent-architecture-memory-benchmark).*

---

### 3.2 Failure‑Mode Taxonomy  

| Failure Category | Trigger | Observable Symptom | Mitigation (Zeta‑Lite) | Mitigation (Competitors) |
|---|---|---|---|---|
| **Memory‑pressure OOM** | Device RAM < 4 GB + concurrent queries > 2 k | Page becomes unresponsive; WASM trap “out of memory” | • Enforce per‑instance memory ceiling via `WebAssembly.Memory.grow` guard <br>• Spill overflow rows to IndexedDB when RSS > 1.6 GB <br>• Expose `zetaLite.setMemoryLimit(mb)` API | • SQLite‑WASM: rely on OS swap (often unavailable on mobile) <br>• AlaSQL: manual chunking; no built‑in spill <br>• IndexedDB+SQL.js: automatic spill but higher latency |
| **WASM Trap (integer overflow / divide‑by‑zero)** | Malformed user‑generated SQL (e.g., `1/0`) | Sudden termination of the worker thread; error propagated to main thread | • Sandboxed worker isolates trap; main thread receives `ErrorEvent` with `wasm-trap` type <br>• Automatic restart of worker with fresh instance (< 50 ms) | • SQLite‑WASM: similar trap but longer restart due to larger module <br>• AlaSQL: JS throws; can be caught but may corrupt internal state <br>• IndexedDB+SQL.js: JS exception; easier to catch but still may leave transaction half‑committed |
| **Index‑build stall** | Concurrent DDL + heavy DML on same table | UI freezes; query latency spikes to > 2 s | • Separate DDL worker pool (max 2 threads) <br>• Priority queue: DDL yields to DML after 50 ms slice <br>• Metrics expose `ddlQueueLength` | • SQLite‑WASM: single‑threaded index build; blocks all queries <br>• AlaSQL: incremental index updates but suffers from GC pauses <br>• IndexedDB+SQL.js: transaction‑level locking; can cause deadlocks under high write concurrency |
| **Network‑fetch race (module reload)** | Service‑worker updates while long‑running query active | `NetworkError` on instantiate; query aborts | • Dual‑cache strategy: keep previous module alive until new instantiate succeeds <br>• Version‑handshake via `postMessage` to worker | • SQLite‑WASM: similar approach but larger module increases chance of race <br>• AlaSQL/JS: no fetch; but bundle updates require full page reload |
| **Garbage‑collection spikes** | Burst of ad‑hoc JSON‑to‑row conversions | GC pause > 120 ms observed in Chrome DevTools | • Pre‑allocate row buffers in WASM linear memory <br>• Reuse buffer pool via `zetaLite.getRowBuffer()` | • SQLite‑WASM: less control over JS‑side allocations <br>• AlaSQL: high allocation rate; mitigated by object pooling libraries <br>• IndexedDB+SQL.js: depends on IDB object store implementation |



### 3.3 Field Application Narratives  

#### 3.3.1 Financial‑Tech Real‑Time Risk Engine  

A mid‑size trading firm deployed Zeta‑Lite inside a Chrome‑based trading desk to evaluate VAR (Value‑at‑Risk) models on‑the‑fly. The engine held a 12 million‑row time‑series table (price, volume, volatility) with secondary indexes on timestamp and instrument‑id.  

* **Throughput:** Sustained point‑reads averaged 298 k ops/s, easily feeding the 150 k‑tick‑per‑second market data feed.  
* **Latency:** p99 query latency stayed under 900 ms even during a volatility spike that pushed concurrent queries to 2.3 k. The built‑in memory‑guard spilled overflow rows to IndexedDB, preventing OOM on 8 GB RAM machines.  
* **Operational note:** The firm’s DevOps team used the `zetaLite.setMemoryLimit(1500)` API to cap each trader’s worker at 1.5 GB, guaranteeing that a rogue query could not destabilize the whole desk. Failover to a fresh worker took < 45 ms after a trap, invisible to the trader’s UI.  

Contrast this with a pilot using SQLite‑WASM: the same workload triggered frequent OOM events on 4 GB laptops, forcing the team to lower the concurrency ceiling to 800 queries, which degraded risk‑model refresh rates by 35 %.  

#### 3.3.2 Ad‑Tech Click‑Attribution Pipeline  

An ad‑network needed to join click logs (≈ 9 M rows) with impression metadata (≈ 7 M rows) in real time to compute attribution windows. They chose Zeta‑Lite for its deterministic memory footprint and low GC jitter.  

* **Mixed workload:** 70 % reads (lookup of impression ID) and 30 % writes (increment click count). Throughput remained flat at ~ 260 k ops/s over a 48‑hour soak test.  
* **Failure mode observed:** A buggy partner supplied malformed UUIDs that caused a divide‑by‑zero in a custom UDF. The trap was isolated to the worker; the main thread logged the error, restarted the worker, and continued processing without losing any clicks (thanks to the write‑ahead log persisted to IndexedDB).  
* **Operational advantage:** Because the module size is under 3 MB, the CDN edge cache delivered it in < 30 ms on average, and the service‑worker stale‑while‑revalidate pattern ensured zero downtime during weekly updates.  

When the same pipeline was prototyped with AlaSQL, the JS‑only engine exhibited noticeable GC pauses (up to 180 ms) during peak write bursts, causing occasional missed clicks in the attribution window. The team ultimately abandoned AlaSQL for this use‑case due to unpredictability in sub‑second latency SLAs.  

#### 3.3.3 IoT Telemetry Dashboard  

A smart‑city project streamed sensor readings (temperature, humidity, pressure) from 150 k devices into a browser‑based ops console. The console needed to roll‑up 5‑minute aggregates and display heat‑maps.  

* **Data size:** 10 million rows after aggregation, stored with column‑wise compression inside Zeta‑Lite’s linear memory.  
* **Performance:** Point‑reads for aggregate queries hovered at 310 k ops/s; p99 latency remained under 850 ms even when the dashboard refreshed every 10 seconds for 200 concurrent users.  
* **Observed issue:** On low‑end Android tablets (2 GB RAM), the initial module load caused a brief UI freeze (~ 120 ms) due to WASM compilation. The team mitigated this by pre‑warming a shared worker during the splash screen, shifting the cost off the main thread.  

The alternative IndexedDB + SQL.js approach required a separate transaction per aggregate, inflating latency to > 1.4 s p99 and causing frequent quota‑exceeded errors on devices with limited storage.  



### 3.4 Takeaways from Telemetry  

* **Memory is the dominant gating factor** – Zeta‑Lite’s 1.84 GB RSS for a 10 M‑row indexed dataset is ~ 20 % lower than SQLite‑WASM and ~ 40 % lower than AlaSQL, making it viable on modest laptops and even some tablets when a spill‑to‑IndexedDB guard is active.  
* **Deterministic latency** – The combination of a bounded linear memory pool, low GC pressure, and worker‑isolated traps yields p99 latency that stays within a tight band (± 50 ms) across load variations, a property not observed in the JS‑only competitors.  
* **Operational knobs matter** – Exposable APIs for memory limit, worker recycling, and DDL priority allow SRE teams to shape behavior to the host’s constraints, something the competition either lacks or provides only via opaque compile‑time flags.  
* **Failure isolation** – WASM traps are contained to the offending worker; a restart does not corrupt in‑flight transactions because the engine writes a write‑ahead log to IndexedDB before committing. This yields a measurable reduction in end‑to‑end error rates (0.12 % vs 0.35 % OOM for SQLite‑WASM).  

---


## Frequently Asked Questions (Strategic FAQ)  

**Q1: *If I need sub‑50 ms read latency for a cache‑lookup workload, is Zeta‑Lite still the right choice, given its reported p99 of ~ 842 ms?*  

A: The 842 ms p99 figure reflects a **mixed read/write** workload under a **simulated 1 k concurrent user** load, where writes trigger index maintenance and occasional memory‑guard spills. Pure point‑read latency (no writes, hot dataset fully resident) measured in our lab sits at **≈ 12 ms p50** and **≈ 28 ms p99** (see Section 3.1 table). If your SLA is strictly read‑only and you can keep the working set within the engine’s linear memory (≈ 1.6 GB for 10 M rows), you will comfortably meet sub‑50 ms targets. Introducing writes will inevitably raise latency due to index‑update costs and possible spill‑to‑IndexedDB, so evaluate your write ratio before committing.  

**Q2: *How does Zeta‑Lite’s memory footprint compare to running the same dataset in a traditional server‑side SQLite instance, and what are the cost implications?*  

A: A server‑side SQLite process holding the same 10 M‑row indexed dataset typically consumes **≈ 2.3 GB RSS** (page cache + journal) on a Linux box, plus overhead for the OS and any connection‑pooling frameworks. Zeta‑Lite’s **1.84 GB RSS** is therefore **≈ 20 % lower**. In a container‑ised environment (e.g., Kubernetes), this translates to a **≈ 0.4 GB RAM saving per pod**. At a typical cloud rate of **$0.0045/GB‑hour**, a fleet of 200 pods would save roughly **$0.72 per hour** (~ $6,300 annually) purely from memory reduction. Moreover, because Zeta‑Lite runs in the browser, you eliminate the need for a dedicated backend VM for ad‑hoc analytical queries, further reducing operational spend.  

**Q3: *The cold‑start time is listed as 112 ms. How does this affect user experience in a SPA where the engine is loaded lazily after a user clicks “Explore Data”?*  

A: The 112 ms figure includes **network fetch (≈ 30 ms on a warm CDN), WASM compilation (≈ 55 ms), and module instantiation (≈ 27 ms)**. In a single‑page application, you can hide this latency by:  

1. **Prefetching** the module during idle time (e.g., after login) using `<link rel="prefetch" href="zeta-lite.wasm">`.  
2. **Initializing a shared Web Worker** in a hidden iframe or service worker so that the heavy compile step occurs off the main thread.  
3. **Showing a skeleton UI** while the worker spins up; our field tests showed that users perceived the delay as < 50 ms when a skeleton was present, well within acceptable thresholds for exploratory UI.  

If you cannot prefetch, the worst‑case perceived latency will be roughly the full 112 ms, which is still below the typical 150 ms threshold for “