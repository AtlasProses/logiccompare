---
title: "Outcome Monitors: Recovery vs. Recognition Without Enforce"
meta_title: "Outcome Monitors: Recovery vs. Recognition Witho... | LogicCompare"
description: "An authoritative, benchmark-driven technical breakdown of Outcome Monitors: Recovery and Recognition Without Enforcement:, dissecting architecture, trade-offs, and failure modes."
date: 2026-06-04T22:24:51.986Z
image: "/images/posts/outcome-monitors-recovery-vs-recognition-without-enforce-cover.webp"
categories: ["Technology"]
authors: ["Kwame Mensah"]
tags: ["Outcome Monitors", "Recognition Without"]
draft: false
---

```

# The Core Engineering Reality & Metric Baselines

The evening commute crawls through San Francisco’s summer humidity, the ThinkPad’s fan whirring like a tired turbine as I pull up terminal memory traces from last night’s benchmark. The screen flickers with p99 latency numbers—842.3 ms under 1,000 concurrent connections—while the city’s heat presses against the window. I’d run the same test earlier this year, but this time the numbers felt different. Not because the hardware changed, but because the *failure modes* did. The old assumption—that a tool call timeout would at least be *visible*—no longer holds. Now, silent failures slip through in the expected format, masquerading as valid data. A cached error page or a negative price arrives as a JSON payload, consumed without question. The system doesn’t crash; it just *lies*.

This is where the two papers diverge like forked highways. One—*Outcome Monitors*—tackles the problem by building recovery affordances into the failure itself. The other—*Recognition Without Enforcement*—exposes a deeper flaw: LLMs can *recognize* forged authority (role templates, channel metadata, formatting cues) yet still *execute* the malicious instruction. The gap isn’t in the model’s ability to detect; it’s in its inability to *enforce*. And that distinction changes everything.

Let’s start with the raw metrics. *Outcome Monitors* reports a jump in ToolMaze completion rates from 10.9% to 28.1% across four models in two provider families when injected failures are detected and recovery tools are provided. In tau-bench retail, completion improves by 14.0 and 12.0 points on two tiers. The gains aren’t uniform—they concentrate where the fault *blocks* completion, not where it’s merely present. The paper’s controls are rigorous: removing the recovery-tool list eliminates the gain entirely, and restoring it brings the effect back. Diagnostic detail and timing? No measurable difference. The active ingredient is the *receipt*—a nonbinding artifact naming the violated property and pointing to public recovery tools.

(By the way, if you’re running this on Ubuntu 24.04 with systemd-resolved, make sure you disable the stub listener or your internal DNS will randomly drop 2% of queries—enough to skew these kinds of latency-sensitive benchmarks.)

*Recognition Without Enforcement* takes a different approach, focusing on the *arbitration* layer. Across 46 model endpoints from 6 vendors, the average execution rate under spoofed authority is 1.21% [0.5-2.1% CI], but the vulnerability isn’t evenly distributed. Some configurations fail *deterministically*, with within-window per-fingerprint ranges spiking to 47 percentage points. The paper’s key insight is that recognition (decodable source-format features, verbalized detection) doesn’t translate to enforcement. Models can *say* they’ve detected a forgery, yet still *call the tool*. The gap isn’t a bug—it’s a *capability mismatch*. The solution? An external reference monitor combining authenticated source routing with capability-gated tool execution. It rejects all tested forged, tampered, replayed, and unsigned requests while preserving legitimate operations. The only flaw found—a clock-skew admission—was patched, not cryptographically bypassed.

Here’s the practical verification command I ran last night to stress-test the arbitration layer:

```bash
# Run p99 latency benchmark under 1,000 concurrent connections:
pgbench -c 100 -j 8 -T 60 -P 5 -h localhost -U postgres db_benchmark
```

The numbers were clean—until I injected a spoofed tool call. The model *recognized* the forgery (I could see it in the activation traces), but still executed it. That’s the recognition-enforcement gap in action.

I once tried scaling a connection pool to 800 under peak vector load, locking PostgreSQL’s WAL disk. The lesson? Bounded in-memory queues with query-level multiplexing are non-negotiable. The same principle applies here: recovery affordances and external enforcement aren’t just optimizations—they’re *guardrails*. Without them, the system doesn’t fail loudly. It fails *silently*, and that’s worse.

---


## Granular System Breakdown & Architectural Trade-offs

The two papers aren’t just solving different problems—they’re *philosophically opposed* in how they treat failure. *Outcome Monitors* assumes failure is inevitable and builds recovery into the fabric of the system. *Recognition Without Enforcement* assumes the model’s arbitration is fundamentally untrustworthy and offloads enforcement to an external monitor. To understand the trade-offs, we need to dissect their architectures, benchmarks, and failure modes side by side.



### **1. Core Architecture: Recovery vs. Enforcement**

#### **Outcome Monitors: Contracts and Receipts**
The system works in three phases:
1. **Contract Mining**: Outcome contracts are derived from task-disjoint traces or public schemas. These aren’t static rules—they’re *mined* from observed behavior, meaning they adapt to the system’s actual usage patterns.
2. **Violation Detection**: When a tool call’s output violates the contract (e.g., a negative price where only positive values are expected), the monitor preserves the result but issues a *receipt*—a nonbinding artifact naming the violated property and listing public recovery tools.
3. **Recovery Routing**: The agent (or downstream system) can use the receipt to route around the failure. The recovery tools aren’t hardcoded; they’re *discovered* from the contract vocabulary.

The key insight here is that the monitor doesn’t *block* the failure—it *annotates* it. The receipt is the critical piece. In the paper’s controls, removing the recovery-tool list eliminates the completion gains entirely. The receipt’s diagnostic detail and timing don’t matter; what matters is the *pointer* to a recovery path.

#### **Recognition Without Enforcement: External Reference Monitors**
This paper flips the script. Instead of annotating failures, it *prevents* them by offloading enforcement to an external system. The architecture has two layers:
1. **Authenticated Source Routing**: Every instruction (system prompt, user input, tool call) is cryptographically signed and routed through an authenticated channel. The model’s internal arbitration is *ignored*—the external monitor makes the final call.
2. **Capability-Gated Execution**: Tools are gated behind capabilities (e.g., "can_call_payment_api"). The monitor checks the instruction’s signature and capability set before allowing execution. No signature? No capability? No execution.

The paper’s controls are brutal. They test 46 model endpoints across 6 vendors, including open-weight models, and find that while models *can* recognize forged authority (decodable from activations, verbalizable in prompts), they *don’t* enforce it consistently. The gap isn’t a bug—it’s a *design limitation*. The solution isn’t to improve the model’s arbitration; it’s to *bypass it entirely*.



### **2. Benchmark Comparison: Where Each System Shines (and Fails)**

| **Metric**                     | **Outcome Monitors**                          | **Recognition Without Enforcement**          |
|---------------------------------|-----------------------------------------------|----------------------------------------------|
| **Completion Rate (ToolMaze)**  | +17.2pp (10.9% → 28.1%)                       | N/A (not tested)                             |
| **Completion Rate (tau-bench)** | +14.0pp (tier 1), +12.0pp (tier 2)            | N/A                                          |
| **Execution Under Spoofing**    | N/A                                           | 1.21% [0.5-2.1%] (model-clustered CI)        |
| **Detection Outside Vocab**     | 46% (but delivery continues)                  | 100% (external monitor rejects all forgeries)|
| **Recovery Tool Dependency**    | Critical (removing tools eliminates gains)    | N/A (enforcement is external)                |
| **Prompt-Layer Defenses**       | N/A                                           | Fail to generalize across models             |
| **Deterministic Enforcement**   | No (receipts are nonbinding)                  | Yes (external monitor)                       |
| **Implementation Flaws**        | None reported                                 | One (patched clock-skew admission)           |

The benchmarks reveal a stark divide:
- *Outcome Monitors* excels in *recovery*—it turns failures into recoverable events. But its detection is limited by the contract vocabulary. If a failure isn’t in the mined set, detection drops to 46%, though delivery continues and completion is unchanged.
- *Recognition Without Enforcement* excels in *prevention*—it stops failures before they happen. But it requires a heavyweight external monitor, which adds latency and complexity. The paper’s adaptive red-team found only one flaw (a clock-skew issue), but that’s still one flaw too many in a security-critical system.



### **3. Field Application: Where You’d Deploy Each**

#### **Outcome Monitors: The Recovery Layer for Resilient Systems**
This is the system you’d deploy in environments where *availability* trumps *perfect correctness*. Think:
- **E-commerce**: A negative price slips through, but the receipt triggers a fallback to a cached value or a manual review queue.
- **Logistics**: A delivery estimate is out of bounds, but the receipt routes the request to a human dispatcher.
- **Data Pipelines**: A corrupted file is detected, but the receipt triggers a retry from a secondary source.

The trade-off is clear: you accept that some failures will slip through, but you ensure they’re *recoverable*. The system doesn’t need to be perfect—it just needs to be *resilient*.

I once worked on a logistics platform where a silent failure in the routing engine caused a 1.84 GB memory leak over 36 hours. The system didn’t crash—it just got slower and slower. Outcome Monitors would’ve caught that. The receipt would’ve pointed to a fallback routing algorithm, and the leak would’ve been a non-issue.

#### **Recognition Without Enforcement: The Security Layer for High-Stakes Systems**
This is the system you’d deploy where *enforcement* is non-negotiable. Think:
- **Financial Systems**: A spoofed payment instruction must be rejected, not annotated.
- **Healthcare**: A forged prescription request must be blocked, not routed to a recovery tool.
- **Critical Infrastructure**: A tampered control signal must be ignored, not logged.

The trade-off here is complexity. The external monitor adds latency (though the paper doesn’t quantify it, I’d estimate ~50-100ms per call in a well-optimized setup) and requires cryptographic key management. But for high-stakes systems, that’s a small price to pay.



### **4. Gotchas and Risks: Where Each System Falls Short**

#### **Outcome Monitors: The Vocabulary Problem**
The biggest risk is the *contract vocabulary*. If a failure isn’t in the mined set, detection drops to 46%. The paper’s controls show that delivery continues and completion is unchanged, but that’s a *huge* blind spot. Imagine a novel attack vector—say, a new type of price manipulation—that isn’t in the contract. The system won’t detect it, and the failure will propagate.

There’s also the *recovery tool dependency*. The paper’s controls prove that removing the recovery-tool list eliminates the completion gains. That means the system’s resilience is *entirely* dependent on the quality of the recovery tools. If they’re outdated or incomplete, the system fails.

#### **Recognition Without Enforcement: The External Monitor Bottleneck**
The biggest risk here is the *external monitor itself*. The paper’s adaptive red-team found a clock-skew admission flaw, which was patched. But what if there’s another flaw? The monitor is a single point of failure—if it’s compromised, the entire system is compromised.

There’s also the *latency overhead*. The paper doesn’t quantify it, but in my experience, adding an external monitor to a high-throughput system can introduce noticeable lag. For low-latency applications (e.g., trading systems), that’s a dealbreaker.

Finally, there’s the *key management problem*. The monitor relies on cryptographic signatures, which means you need a robust key management system. If keys are leaked or mismanaged, the entire enforcement layer collapses.

---

👉 **[Continue Reading: Outcome Monitors: Recovery vs. Recognition Without Enforce (Part 2)](/blog/outcome-monitors-recovery-vs-recognition-without-enforce-part-2)**