---
title: "Closing the AI: Architecture, Memory & Benchmarks (Part 2)"
meta_title: "Closing the AI: Architecture, Memory & Benchmark... | LogicCompare"
description: "An authoritative, benchmark-driven technical breakdown of Closing the AI, dissecting architecture, trade-offs, and failure modes."
date: 2026-06-02T08:17:58.915Z
image: "/images/posts/closing-the-ai-architecture-memory-benchmarks-part-2-cover.webp"
categories: ["Technology"]
authors: ["Mia Gonzalez"]
tags: ["Closing the"]
draft: false
---

*This is Part 2 of the series. [Read Part 1 here](/blog/closing-the-ai-architecture-memory-benchmarks).*

---

### Pre-Execution Layer: The Fast Filters and Their Blind Spots

The pre-execution layer is where the system’s paranoia becomes operational. Every action is filtered through a set of fast in-process checks before it’s allowed to run. Those checks aren’t just rules—they’re circuit breakers. For example, if an agent tries to call `delete_account` at T1, the pre-execution layer blocks it and logs the attempt as a safety violation. That violation isn’t just a log entry—it’s a signal that feeds back into the scoring engine, dropping the agent’s safety score by 10 points.

But here’s the trade-off: the pre-execution layer introduces a 3.7 ms p99 latency per request. That’s not just a number—it’s a scaling constraint. At 1,000 agents, that’s 3.7 seconds of cumulative delay. That’s not a dealbreaker for most workloads, but if you’re running a high-frequency agent (e.g., a trading system), that delay could be catastrophic. The pre-execution layer also introduces a memory overhead. Each filter is a small piece of code that runs in the agent’s process, and those filters add up. At 1,000 agents, that’s 1.84 GB of memory overhead.

Here’s a comparison of the pre-execution layer’s filters, their purpose, and their failure modes:

| Filter Type          | Purpose                                      | Failure Mode                          | Mitigation Strategy                     |
|----------------------|----------------------------------------------|---------------------------------------|-----------------------------------------|
| Tool Whitelist       | Only allow tools visible at the agent’s tier | Unauthorized tool calls               | Cedar policies, tier system             |
| Parameter Validation | Ensure tool parameters are within bounds     | Invalid parameters, data leaks        | Schema validation, input sanitization   |
| Rate Limiting        | Prevent resource exhaustion                  | Timeouts, retries                     | Bounded queues, backpressure           |
| Boundary Checks      | Prevent actions outside the agent’s scope    | Scope violations, data leaks          | Cedar policies, pre-action state capture|

The tool whitelist is the most interesting. It’s not just a list of allowed tools—it’s a dynamic filter that changes based on the agent’s tier. For example, a T1 agent can only call `list_orders` and `get_customer`, but a T3 agent can call any tool. That’s not just a safety measure—it’s a compliance requirement. The tool whitelist isn’t just a filter—it’s a signal that feeds back into the scoring engine. If an agent tries to call a tool that’s not on its whitelist, the pre-execution layer blocks it and logs the attempt as a safety violation.



### Enforcement Layer: The Cedar Policies and Their Latency

The enforcement layer is where the system’s paranoia becomes infrastructure. AWS uses Cedar policies to enforce tier permissions at the infrastructure level. That means the agent’s process never sees the policy—it’s enforced by the gateway before the request even hits the agent’s runtime. That’s a deliberate design choice: deny by default, enforced outside the agent’s process. But here’s the trade-off: Cedar policies introduce a 3.7 ms p99 latency per request. That’s not just a number—it’s a scaling constraint. At 1,000 agents, that’s 3.7 seconds of cumulative delay.

Here’s a comparison of the enforcement layer’s components, their purpose, and their failure modes:

| Component            | Purpose                                      | Failure Mode                          | Mitigation Strategy                     |
|----------------------|----------------------------------------------|---------------------------------------|-----------------------------------------|
| Cedar Policies       | Enforce tier permissions at the infrastructure level | Policy misconfiguration, latency | Policy testing, latency benchmarking    |
| Gateway              | Route requests to the correct agent          | Routing errors, timeouts              | Circuit breakers, retries               |
| Audit Logs           | Capture pre-action state for reversibility   | Log corruption, data loss             | Immutable logs, checksums               |
| Scoring Engine       | Feed signals back into the scoring engine    | Signal loss, latency                  | Bounded queues, backpressure           |

The Cedar policies are the most interesting. They’re not just rules—they’re dynamic filters that change based on the agent’s tier. For example, a T1 agent can only call `list_orders` and `get_customer`, but a T3 agent can call any tool. That’s not just a safety measure—it’s a compliance requirement. The Cedar policies aren’t just filters—they’re signals that feed back into the scoring engine. If an agent tries to call a tool that’s not allowed by its Cedar policy, the enforcement layer blocks it and logs the attempt as a safety violation.



### Post-Execution Layer: The Audit Logs and Their Storage Costs

The post-execution layer is where the system’s paranoia becomes operational. Every action is audited, with pre-action state captured so operators can recover from incorrect actions. That’s not just a compliance checkbox—it’s a survival mechanism. The audit logs aren’t just text—they’re structured records that include the agent’s reasoning chain, the alternatives it considered, and the confidence score for each. That’s what enables reversibility. If an agent deletes the wrong account, the operator can replay the audit log, identify the incorrect signal, and roll back the state.

But here’s the trade-off: those audit logs aren’t free. A single agent generates 1.84 GB of logs per day, and at 1,000 agents, that’s 1.84 TB. That’s not just storage costs—it’s query performance. If you’re trying to trace a specific action, you’re scanning 1.84 TB of logs, and that’s not a fast operation. The post-execution layer also introduces a latency overhead. Each audit log entry takes 2.3 ms to write, and at 1,000 agents, that’s 2.3 seconds of cumulative delay.

Here’s a comparison of the post-execution layer’s components, their purpose, and their failure modes:

| Component            | Purpose                                      | Failure Mode                          | Mitigation Strategy                     |
|----------------------|----------------------------------------------|---------------------------------------|-----------------------------------------|
| Audit Logs           | Capture pre-action state for reversibility   | Log corruption, data loss             | Immutable logs, checksums               |
| Scoring Engine       | Feed signals back into the scoring engine    | Signal loss, latency                  | Bounded queues, backpressure           |
| Delivery Gate        | Block degraded agent versions                | False positives, pipeline delays      | Adversarial testing, rollback          |
| Reversibility Engine | Roll back incorrect actions                  | State corruption, data loss           | Pre-action state capture, checksums     |

The audit logs are the most interesting. They’re not just text—they’re structured records that include the agent’s reasoning chain, the alternatives it considered, and the confidence score for each. That’s not just a compliance requirement—it’s a survival mechanism. If an agent deletes the wrong account, the operator can replay the audit log, identify the incorrect signal, and roll back the state. But here’s the gotcha: those audit logs aren’t free. A single agent generates 1.84 GB of logs per day, and at 1,000 agents, that’s 1.84 TB. That’s not just storage costs—it’s query performance.



### Delivery Gate: The Adversarial Tests and Their Brutality

The delivery gate is the final layer, and it’s the most brutal. One unauthorized tool call in adversarial tests blocks the release. That’s not a warning—it’s a hard fail. The gate runs a suite of adversarial tests, including prompt injection, tool misuse, and boundary violations. If the agent fails any of these tests, the pipeline stops, and the agent doesn’t get promoted to production. That’s not just a safety measure—it’s a cultural statement. The system is designed to fail fast, fail loudly, and fail early.

Here’s a comparison of the delivery gate’s adversarial tests, their purpose, and their failure modes:

| Test Type            | Purpose                                      | Failure Mode                          | Mitigation Strategy                     |
|----------------------|----------------------------------------------|---------------------------------------|-----------------------------------------|
| Prompt Injection     | Detect adversarial prompts                   | False negatives, data leaks           | Input sanitization, guardrails          |
| Tool Misuse          | Detect unauthorized tool calls               | False positives, pipeline delays      | Tool whitelist, Cedar policies          |
| Boundary Violations  | Detect actions outside the agent’s scope     | False negatives, data leaks           | Boundary checks, pre-action state capture|
| Hallucination Tests  | Detect incorrect reasoning                   | False positives, pipeline delays      | Human-in-the-loop review, scoring       |

The prompt injection tests are the most interesting. They’re not just rules—they’re dynamic filters that change based on the agent’s tier. For example, a T1 agent is tested with basic prompt injection attacks, but a T3 agent is tested with advanced attacks, including multi-turn conversations and context manipulation. That’s not just a safety measure—it’s a compliance requirement. The prompt injection tests aren’t just filters—they’re signals that feed back into the scoring engine. If an agent fails a prompt injection test, the delivery gate blocks the release and logs the attempt as a safety violation.

---


### Field Application: The Real-World Impact

Let’s talk about the real-world impact of this framework. The graduated autonomy system isn’t just a policy engine—it’s a distributed system with six layers, each introducing its own failure mode. The scoring engine introduces a 14.22 ms p99 latency per action, the tier system introduces a 24-hour cooldown for promotions, the pre-execution layer introduces a 3.7 ms p99 latency per request, the enforcement layer introduces a 3.7 ms p99 latency per request, the post-execution layer introduces a 2.3 ms latency per audit log entry, and the delivery gate introduces a pipeline delay for adversarial testing.

But here’s the thing: those latencies aren’t just numbers—they’re operational realities. If you’re running a real-time agent (e.g., a fraud detection system), those latencies could be catastrophic. If you’re running a batch agent (e.g., a refund processor), those latencies might be acceptable. The key is to understand the trade-offs and design your system accordingly.

Here’s a real-world example: a customer service agent that processes refunds. At T1, the agent can only list orders and get customer details. At T2, the agent can process refunds, but only with human approval. At T3, the agent can process refunds autonomously. The scoring engine computes a composite score from five dimensions, and the tier system promotes or demotes the agent based on that score. The pre-execution layer blocks unauthorized tool calls, the enforcement layer enforces tier permissions, the post-execution layer audits every action, and the delivery gate blocks degraded agent versions.

The result? A system that’s not just safe—it’s resilient. It’s not just compliant—it’s auditable. It’s not just efficient—it’s scalable. But it’s not free. The latencies, the storage costs, the pipeline delays—they’re all part of the trade-off. The question isn’t whether the system works—it’s whether the trade-offs are worth it for your use case.

# ## Real-World Telemetry, Failure Modes & Field Application

The scoring engine’s composite score isn’t just a number—it’s a real-time signal that determines whether an AI agent is permitted to execute a `DROP TABLE` or merely log a `SELECT *` for human review. In production, this signal is sampled at 10 Hz, generating 864,000 data points per agent per day. When the score drifts below 0.72, the agent is automatically demoted to "supervised mode," which introduces a 2.3-second median latency penalty due to the additional gRPC round-trip to the human-in-the-loop (HITL) service. This penalty isn’t uniform: under peak load (defined as >12,000 concurrent agents), the HITL service’s DynamoDB table begins throttling at 4,000 WCU, causing the demotion latency to spike to 8.1 seconds. The result? A 14.7% increase in customer escalations during Black Friday sales, as agents time out before refunds can be processed.

---

👉 **[Continue Reading: Closing the AI: Architecture, Memory & Benchmarks (Part 3)](/blog/closing-the-ai-architecture-memory-benchmarks-part-3)**