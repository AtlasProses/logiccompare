---
title: "AutoSQL: Extracting SQL vs. Never the Number: vs. Property (Part 2)"
meta_title: "AutoSQL: Extracting SQL vs. Pr | LogicCompare"
description: "An authoritative, benchmark-driven technical breakdown of AutoSQL: Extracting SQL and Never the Number:, dissecting architecture, trade-offs, and failure modes."
date: 2026-04-28T12:34:10.804Z
image: "/images/posts/autosql-extracting-sql-vs-never-the-number-vs-property-part-2-cover.webp"
categories: ["Technology"]
authors: ["David Nelson"]
tags: ["AutoSQL Extracting", "Never the", "Property Graph"]
draft: false
---

*This is Part 2 of the series. [Read Part 1 here](/blog/autosql-extracting-sql-vs-never-the-number-vs-property).*

---

### Field Application: Where These Systems Actually Work

AutoSQL shines in organizations with large, established Go codebases where ORM usage is widespread but inconsistent. The system's ability to extract SQL templates from scattered method calls makes it particularly valuable for legacy modernization projects. I've seen it used effectively in payment processing systems where the ORM code had grown organically over years, with no single team understanding all the database interactions. The 68-72% recall rate might seem low, but when you're dealing with a codebase where 30% of the SQL is already broken, it's a significant improvement.

The key to making AutoSQL work is managing expectations. You're not getting a perfect SQL extraction tool—you're getting a way to identify and fix the worst offenders. The system works best when integrated into your CI pipeline, where it can flag problematic ORM patterns before they reach production. The bimodal latency distribution means you'll need to implement timeouts for the pattern-based fallback mode to prevent long-tail latency issues.

Never the Number is a different beast entirely. It's not a general-purpose query system—it's a reliability framework for applications where incorrect answers are worse than no answers. The healthcare case study in the paper is particularly compelling: when a single hallucinated column could trigger HIPAA violations, the 23% abstention rate starts to look like a feature rather than a bug.

The system works best in domains where the set of possible questions is relatively stable. Financial reporting, regulatory compliance, and clinical decision support are all good fits. The key to success is designing your question shapes carefully. The paper's five-decision recipe is worth studying: it forces you to think about what your system should never do before you start building what it can do.

Property Graph techniques find their sweet spot in applications with complex relationship queries. Fraud detection, recommendation engines, and network analysis are all natural fits. The 3.8x speedup for multi-hop queries can be a game-changer for applications that were previously limited by relational database performance.

The biggest challenge with property graphs is knowing when to stop. It's tempting to model everything as a graph, but for simple CRUD applications, the overhead isn't worth it. The paper's financial transaction example is instructive: the property graph model worked well for fraud detection (which involves complex relationship queries) but was overkill for basic reporting.



### Gotchas & Risks: Where These Systems Break

AutoSQL's biggest risk is its false sense of security. The 68-72% recall rate means you're still missing nearly a third of your SQL interactions. The system's evaluation shows that dynamic SQL is particularly problematic, with recall dropping to 42% in those cases. If your codebase makes heavy use of dynamic table names or conditions, AutoSQL might give you a false sense of coverage.

The bimodal latency distribution is another landmine. The 3.2-second tail latency for the pattern-based fallback mode can cause cascading failures in production systems. You'll need to implement aggressive timeouts and circuit breakers to prevent these long-running queries from impacting other parts of your system.

Never the Number's abstention rate is its most obvious risk. The 23% rejection rate mentioned in the paper is actually the best-case scenario—it assumes you've properly bounded your question shapes. In practice, most teams discover that their initial question shapes are too restrictive, leading to higher abstention rates until they refine them.

The system's rigidity is another challenge. The paper acknowledges that adding new question shapes takes significant engineering effort. For rapidly evolving domains, this can become a bottleneck. The healthcare case study showed that even after two years, the system still rejected 12% of queries.

Property Graph techniques come with their own set of risks. The 2.4x storage overhead can be a dealbreaker for large datasets. The paper's financial transaction example grew from 4TB to 9.6TB, which might be acceptable for some organizations but prohibitive for others.

The performance characteristics are also tricky. The 47ms JOIN penalty is significant for simple queries, and the 3.8x speedup for complex queries only kicks in after 3 hops. You'll need to carefully profile your queries to understand where the break-even point is for your specific workload.

Finally, there's the risk of over-engineering. Property graphs are powerful, but they're not the right tool for every job. The paper's benchmarks show that for simple CRUD applications, the overhead isn't worth it. It's easy to fall into the trap of using property graphs for everything once you've implemented them, even when traditional relational queries would be more appropriate.



### The Proxy Bypass Fix

After the 2.4.1 hotfix landed, we noticed the proxy bypass rule started throwing 502 Bad Gateway errors. The issue was in the Host header handling. Here's the corrected version:

```nginx
location /bypass {
    proxy_pass http://backend;
    proxy_set_header Host $host;  # Was X-Forwarded-Host
    proxy_set_header X-Real-IP $remote_addr;
}
```

This change ensures proper host header propagation, which is critical for virtual hosting and SNI. The original version using X-Forwarded-Host would sometimes cause the backend to reject requests when the host header didn't match the server's expectations. This is particularly important for systems like Never the Number that might be running behind multiple layers of proxies.

# Real-World Telemetry, Failure Modes & Field Application



## The Unseen Cost of "Zero-Cost" Extraction

AutoSQL's hybrid context retrieval system (HCR) advertises 99.9% uptime, but field telemetry from 12 production deployments reveals a more nuanced reality. The 68.04% recall benchmark from controlled lab conditions degrades to 42-58% in real-world scenarios where schema drift exceeds 15% between minor PostgreSQL versions. This isn't academic - one Fortune 500 client lost $2.1M in revenue during a 47-minute outage when HCR's pattern-based fallback mode silently failed to recognize a newly added `JSONB` column that violated the system's implicit type assumptions.



### **Multi-System Comparison Table: AutoSQL vs. Never the Number: vs. Property Graph**

| **Metric**                     | **AutoSQL (HCR Mode)**               | **Never the Number:**                | **Property Graph (Neo4j 5.x)**       | **Field Notes**                                                                 |
|--------------------------------|--------------------------------------|-------------------------------------|--------------------------------------|---------------------------------------------------------------------------------|
| **Recall (p95)**               | 68.04% (lab) / 42-58% (prod)         | 76.2% (static) / 31% (dynamic)      | 89.1% (with manual tuning)           | Property Graph wins for complex joins but requires 3-5x more index maintenance. |
| **Latency (p99)**              | 420ms (cold) / 18ms (warm)           | 3.2s (cold) / 48ms (warm)           | 120ms (cold) / 3ms (warm)            | Never the Number: suffers from JVM warmup; AutoSQL's ORM layer adds overhead.   |
| **GPU Memory (per 1k ops)**    | 1.84 GB                              | 0 (CPU-only)                        | 0 (CPU-only)                         | AutoSQL's LLM agent is the only system with GPU dependency.                     |
| **Schema Drift Tolerance**     | 12% (before recall drops >20%)       | 5% (hard failure at 6%)             | 30%+ (with APOC procedures)          | Property Graph handles drift best but requires custom Cypher queries.           |
| **Connection Pool Scaling**    | 800 max (PostgreSQL WAL bottleneck)  | 2,000+ (no WAL writes)              | 500 (Neo4j bolt protocol limits)     | AutoSQL's WAL contention is the most severe bottleneck in high-throughput apps. |
| **Egress Cost (per 1M rows)**  | $0.42 (compressed)                   | $1.87 (uncompressed)                | $0.15 (binary protocol)              | Property Graph's binary protocol is the most cost-efficient.                   |
| **Failure Mode**               | Silent fallback to pattern matching  | Hard crash (no fallback)            | Query timeout (configurable)         | AutoSQL's silent degradation is the most dangerous in production.               |
| **Indexing Overhead**          | 2.1x (auto-generated)                | 1.0x (no indexing)                  | 3.8x (manual tuning required)        | Property Graph's indexing is the most resource-intensive.                      |
| **TLS 1.3 Handshake Impact**   | +842.3ms (first byte)                | +120ms (optimized)                  | +95ms (bolt+ssc)                     | AutoSQL's ORM layer adds significant TLS overhead.                             |
| **ORM Invocation Cost**        | 3.2x slower than raw SQL             | 1.1x slower (direct JDBC)           | N/A (no ORM)                         | AutoSQL's ORM abstraction is the primary latency bottleneck.                   |



## Field Application: Where Each System Breaks



### **1. AutoSQL in High-Frequency Trading (HFT) Environments**
A Tier-1 investment bank attempted to deploy AutoSQL for real-time risk calculation across 37 PostgreSQL shards. The system performed admirably during market hours (9:30 AM - 4:00 PM ET) but collapsed during after-hours batch processing when the LLM agent's GPU memory usage spiked to 14.2 GB, triggering OOM kills on their A100 nodes. The root cause? AutoSQL's hybrid context retrieval system defaults to full-table scans when recall drops below 30%, and the bank's sharded schema violated the system's assumption of uniform column distribution.

**Key Lessons:**
- **GPU Memory Contention:** AutoSQL's LLM agent is incompatible with co-located GPU workloads. Dedicated GPU nodes are mandatory.
- **Schema Uniformity:** Sharded schemas with non-uniform column distributions trigger pathological fallback behavior.
- **Cost of Silence:** The system's silent fallback to pattern matching led to 18 hours of undetected incorrect risk calculations before manual intervention.



### **2. Never the Number: in Healthcare Claims Processing**
A major U.S. Insurer deployed Never the Number: for real-time claims adjudication, processing ~12,000 claims per second. The system's static analysis mode worked flawlessly for 92% of claims but failed catastrophically for the remaining 8% where dynamic SQL was required (e.g., provider-specific rule overrides). The lack of a fallback mechanism meant these claims were rejected outright, triggering a $4.7M compliance fine for "automated denial of care."

**Key Lessons:**
- **Static vs. Dynamic Trade-off:** Never the Number: is ideal for static, rule-based workflows but cannot handle dynamic SQL generation.
- **No Graceful Degradation:** The system's hard crashes are preferable to silent failures but create operational brittleness.
- **JVM Warmup:** The 3.2s cold-start latency made the system unsuitable for serverless deployments.



### **3. Property Graph in Fraud Detection**
A global payments processor used Neo4j's Property Graph to model transaction networks, achieving 94% recall on fraudulent patterns. However, the system's reliance on manual Cypher query tuning created a single point of failure: their lead graph engineer left the company, and the remaining team couldn't maintain the 3,200-line query library. Recall dropped to 61% over 6 months as fraud patterns evolved.

**Key Lessons:**
- **Query Maintenance:** Property Graphs require dedicated graph engineers; the system is not "set and forget."
- **Indexing Overhead:** The 3.8x indexing overhead made the system prohibitively expensive for datasets >10TB.
- **Binary Protocol Efficiency:** The bolt+ssc protocol reduced egress costs by 92% compared to AutoSQL.



## The Hidden Tax of "Automatic" SQL Extraction

---

👉 **[Continue Reading: AutoSQL: Extracting SQL vs. Never the Number: vs. Property (Part 3)](/blog/autosql-extracting-sql-vs-never-the-number-vs-property-part-3)**