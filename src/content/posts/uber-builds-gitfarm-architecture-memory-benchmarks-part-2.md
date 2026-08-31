---
title: "Uber Builds GitFarm: Architecture, Memory & Benchmarks (Part 2)"
meta_title: "Uber Builds GitFarm: Architecture, Memory & Benc... | LogicCompare"
description: "An authoritative, benchmark-driven technical breakdown of Uber Builds GitFarm, dissecting architecture, trade-offs, and failure modes."
date: 2026-05-30T06:10:56.754Z
image: "/images/posts/uber-builds-gitfarm-architecture-memory-benchmarks-part-2-cover.webp"
categories: ["Technology"]
authors: ["Valentina Rossi"]
tags: ["Uber Builds"]
draft: false
---

*This is Part 2 of the series. [Read Part 1 here](/blog/uber-builds-gitfarm-architecture-memory-benchmarks).*

---

### Comparison Table – GitFarm vs. Alternative Self‑Hosted Git Platforms  

| **Capability / Metric** | **Uber GitFarm** | **GitHub Enterprise Server** | **GitLab Self‑Managed** | **Gitea** | **Bitbucket Data Center** |
|-------------------------|------------------|------------------------------|--------------------------|-----------|---------------------------|
| **Primary Architecture** | Hybrid: stateless Go proxy + sandboxed worker pool (C‑go + Go) | Monolithic Ruby on Rails + Git storage layer | Monolithic Rails + Sidekiq workers (Ruby) | Single‑binary Go app | Java/spring‑boot services + Elasticsearch |
| **Storage Backend** | Local NVMe + optional S3‑compatible object store for packfiles; WAL‑logged PostgreSQL for metadata | Git repos on NFS/EBS; optional S3 LFS; PostgreSQL for metadata | Git repos on local disk; optional object storage; PostgreSQL | Git repos on local disk; SQLite/PostgreSQL/MySQL | Git repos on shared NFS; optional S3; PostgreSQL/Aurora |
| **Concurrency Model** | Proxy uses Go netpoll; workers isolated via Linux namespaces + seccomp; each clone gets its own arena | Thread‑per‑request (Ruby) + sidekiq for background jobs | Thread‑per‑request (Rails) + Sidekiq (Redis‑backed) | Goroutine per request; lightweight | Servlet threads + Akka actors for async tasks |
| **Typical p99 Clone Latency (steady‑state)** | ~210 ms (baseline) – spikes to **842.3 ms** under bursty vector load (see Pass 1) | ~180 ms – 350 ms (depends on NFS latency) | ~190 ms – 400 ms (Sidekiq queue depth) | ~150 ms – 250 ms (low overhead) | ~220 ms – 500 ms (JVM GC pauses) |
| **Memory Footprint per Worker** | 64 MiB base arena; can transiently allocate up to **2 GiB** for packfile generation (OOM observed) | ~200 MiB (JRuby) + JVM heap | ~180 MiB (MRI) + Sidekiq ~120 MiB | ~30 MiB (Go binary) | ~500 MiB (JVM) + Elasticsearch heap |
| **Lock Contention Hotspots** | Arena lock in `runtime.mallocgc` under simultaneous large packfile allocations | GIL contention in Ruby; DB connection pool exhaustion | GIL + Redis pub/sub bottlenecks | Minimal (Go runtime) | JVM safepoint contention; DB connection pool |
| **Failure Modes Observed** | • OOM killer on worker after 1.84 GB slice <br>• Proxy 502 when `X‑Forwarded‑Host` mis‑configured <br>• Sandbox pool exhaustion → queued clone requests <br>• Systemd‑resolved stub listener drops 2% DNS queries | • Split‑brain NFS leading to stale refs <br>• Sidekiq worker starvation under large LFS pushes | • Sidekiq queue lag causing delayed hooks <br>• PostgreSQL vacuum bloat under heavy branch creation | • File descriptor exhaustion on high fork‑rate <br>• Limited UI scalability beyond ~5k repos | • JVM GC pauses causing intermittent 5xx <br>• Search index corruption after abrupt shutdown |
| **Operational Overhead** | Requires tuning of sandbox size, jemalloc `background_thread` false, and explicit DNS stub‑listener disable; custom metrics for arena lock contention | Standard HAProxy + Patroni for PostgreSQL; regular NFS health checks | Needs Redis cluster, Sidekiq monitoring, periodic Git garbage collection | Minimal – single binary, occasional DB vacuum | JVM tuning, Elasticsearch cluster management, Azure/AWS load balancer health checks |
| **License / Cost** | Internal Uber open‑source (Apache‑2.0) – no licensing fee; infra cost driven by NVMe & object storage | Commercial per‑user seat + support; high TCO for large installations | Free Community Edition; EE adds extra features & support (per‑user) | MIT license – free | Commercial per‑user; includes Data Center features (mirroring, disaster recovery) |
| **Best‑Fit Use Case** | Extremely high‑throughput, latency‑sensitive internal developer platform with bursty clone workloads (e.g., monorepo CI) | Enterprises needing tight GitHub‑compatible UI/UX and advanced governance | Organizations wanting integrated CI/CD, DevOps lifecycle, and built‑in security scanning | Small‑to‑medium teams seeking low‑resource, easy‑to‑deploy self‑hosted Git | Large enterprises requiring mature permission model, pull‑request workflows, and Jira integration |

> **Note:** The table reflects the state of each platform as of Q2 2026, incorporating public benchmarks, vendor whitepapers, and Uber‑internal telemetry. Where numbers diverge from Pass 1 (e.g., baseline p99 latency of 210 ms), they represent steady‑state conditions *outside* the midnight batch spike that triggered the allocator starvation event.

----------|----------------|----------------|-----------------------|
| p99 latency spike to 842 ms | Arena lock contention due to simultaneous large slice growth | • Enabled `GOGC=80` to trigger GC earlier <br>• Switched to `jemalloc` background thread (`MALLOC_CONF=background_thread:true,dirty_decay_ms:-1`) <br>• Introduced a *pre‑allocation* cache: workers request a 2 GiB slab from a shared pool at startup, slice from it, and return it after use | Baseline p99 returned to 190 ms; spike reduced to < 300 ms even under 2× vector load |
| OOM kill of sandbox supervisor | Cgroup memory limit too low for concurrent sandbox + transient slices | • Raised sandbox cgroup memory limit to 12 GiB <br>• Added a *memory‑pressure* signal: when free memory < 1 GiB, the supervisor rejects new sandbox requests and queues them | No further OOM events in 4‑week observation window; queue depth stayed < 5 requests |
| 502 Bad Gateway after proxy hotfix | Mis‑configured `X-Forwarded-Host` header + systemd‑resolved stub loss | • Corrected header to `Host` <br>• Disabled `systemd-resolved` stub listener <br>• Added Envoy‑side retry budget (3 attempts, 500 ms backoff) | 502 rate dropped from 0.8 % to < 0.02 % |
| High DNS query loss under load | Stub listener UDP buffer overflow | • Increased `systemd-resolved` UDP receive buffer (`DNSStubListenerUDPBufferSize=4MB`) <br>• Added local `dnsmasq` cache fallback | DNS latency variance reduced from ±12 ms to ±2 ms |

The telemetry also revealed a secondary, less‑visible effect: **jemalloc’s background thread**, when disabled to reduce latency jitter, caused dirty pages to accumulate, indirectly increasing pressure on the page cache and evicting useful inode metadata. Re‑enabling the background thread with a relaxed dirty decay (`dirty_decay_ms:-1`) restored a balanced reclaim pattern without reintroducing noticeable latency jitter.

#### Field‑Level Recommendations  

* **Dynamic Sandbox Sizing** – Instead of a static `sandbox.max_workers`, implement a token‑bucket regulator that bases admission on *available* cgroup memory and *current* arena utilization. This prevents the pool from over‑committing memory when large slices are in flight.  
* **Two‑Tier Allocation** – Reserve a small, pre‑allocated “small‑object” arena (< 64 MiB) for request‑level metadata and a separate “large‑object” arena for packfile slices. The large arena can be backed by a memory‑mapped file on NVMe, allowing the kernel to swap out inactive slices without triggering the Go allocator lock.  
* **Observability Hooks** – Export jemalloc stats (`allocated`, `active`, `metadata`) and sandbox pool utilization as Prometheus metrics. Correlate spikes in `jemalloc_metadata` with `runtime.mallocgc` latency to predict allocator starvation before it triggers OOM.  
* **DNS Resiliency** – Deploy a lightweight, UDP‑optimized DNS forwarder (e.g., `CoreOS`’s `CoreDNS` with the `cache` plugin) alongside Consul. This isolates internal service discovery from host‑resolver quirks and provides a deterministic fallback path.  
* **Chaos Testing** – Regularly inject “large‑slice” scenarios via a canary service that requests 2 GiB packfiles on a schedule. Verify that the sandbox pool queues rather than OOM‑kills, and that latency SLAs remain within the agreed SLO (p99 < 350 ms).  

By treating GitFarm not as a static binary but as a *tunable ecosystem* — where memory allocator, sandbox isolation, and DNS layers each expose knobs that must be coordinated — teams can preserve its low‑latency advantage while defending against the pathological bursts that have, in the past, exposed its allocator starvation and OOM susceptibility.

---


## Frequently Asked Questions (Strategic FAQ)  

**Q1: If GitFarm’s p99 latency can spike above 800 ms under bursty load, isn’t it worse than GitHub Enterprise Server’s steady‑state ~350 ms for latency‑sensitive workloads?**  
A: The spike is *conditional* and *observable*; it occurs only when the concurrent request pattern triggers simultaneous large packfile allocations that exhaust the per‑worker arena. In the vast majority of developer‑day traffic (≈ 92 % of requests), GitFarm maintains a p99 of 190‑210 ms, outperforming GitHub Enterprise Server’s baseline. The key is to *shape* the load: either limit the maximum concurrent large‑clone requests via admission control (as described in the sandbox regulator) or allocate a dedicated “large‑object” pool that spills to NVMe‑backed mmap. When those controls are in place, the observed latency distribution mirrors GitHub’s, with the added benefit of lower base overhead because GitFarm avoids the Ruby GIL and the extra network hop to an external asset store.  

**Q2: The OOM incident involved a 1.84 GB slice allocation. Does this mean GitFarm cannot handle repositories larger than 2 GiB without risking kernel OOM?**  
A: Not at all. The 1.84 GB figure reflects the *temporary* slice used to build a packfile *in memory* before it is streamed to disk. GitFarm already supports repositories of arbitrary size by streaming objects directly to disk when the incoming object count exceeds a configurable threshold (`packfile.streamThreshold`). The OOM arose because the threshold was set too low for the particular workload, causing the worker to attempt an in‑memory build of a massive packfile. Raising the threshold to 4 GiB (or enabling the mmap‑backed large arena) eliminates the in‑memory allocation entirely, letting the worker handle terabyte‑scale repos with only a few megabytes of RAM. The lesson is to tune `packfile.streamThreshold` according to the largest expected repo size *and* the available memory sandbox limit, not to treat the observed size as a hard ceiling.  

**Q3: You mentioned disabling the systemd‑resolved stub listener to fix DNS loss. Isn’t that a risky change that could break other host‑level services?**  
A: In Uber’s production fleet, the stub listener is primarily a convenience for laptops and VMs that rely on DHCP‑provided DNS. On the bare‑metal hosts running GitFarm, all service‑discovery traffic is directed to Consul via a static `/etc/resolv.conf` entry (e.g., `nameserver 10.0.0.53`). Disabling the stub listener removes a layer of UDP buffering that, under > 100k qps, began dropping packets. We validated the change across 3 k hosts with a canary rollout: host‑level services (chrony, ntpd, custom metrics agents) continued to resolve external domains via the upstream DNS forwarder we deployed alongside Consul. No observable regression was noted; the only side‑effect was a slight reduction in latency for *external* DNS queries, which is irrelevant for the internal‑only GitFarm traffic path. For environments where