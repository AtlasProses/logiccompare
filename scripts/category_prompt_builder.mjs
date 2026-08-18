/**
 * Category-Specific Expert Prompt & Structure Builder (Faz 2 & 6 - Nuclear Organics)
 * -----------------------------------------------------------------------------------
 * Integrates the 7 Nuclear Anti-AI Formulas:
 * 1. Cognitive Drift (Parenthetical side notes & lived-in field warnings)
 * 2. Industry Cynicism (Vendor hype skepticism & practical realism)
 * 3. Dirty Telemetry (Unrounded metric values: 842.3ms, $14.22, 1.84 GB)
 * 4. Pragmatic Confessions ('If it works don't touch it' & 2 AM shortcuts)
 * 5. Human Code Annotations & Real Hostnames (`root@prod-node02:~#`)
 * 6. Post-Publish Errata (The Timestamp Paradox - 3-day update block)
 * 7. Burstiness & Strict Cliché Banlist (No 'Delve', 'Tapestry', 'In conclusion')
 */

import fs from 'fs';
import path from 'path';

let personaDb = null;
try {
    const dbPath = path.join(process.cwd(), 'scripts', 'human_persona_database.json');
    if (fs.existsSync(dbPath)) {
        personaDb = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    }
} catch (e) {
    console.warn('[PROMPT_BUILDER] Persona DB load error, using inline fallback:', e.message);
}

function getRandomItem(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

export function buildPass1Prompt({ author, primaryCategory, articleMode, selectedItems, rawContext, date, isSingleTopic }) {
    const count = selectedItems.length;
    const isSingle = count === 1;

    // Pick random organic persona layers
    const env = getRandomItem(personaDb?.environments) || {
        city: "Seattle, USA",
        microLocation: "Corner booth of a 24-hour diner on 4th Avenue in Seattle, USA",
        weather: "Cold November Drizzle",
        sensoryDetails: "Squeaking wipers on glass, blurred neon reflections in puddles, damp wool coat",
        ambientDistraction: "SSH session timing out over spotty public Wi-Fi",
        subconsciousPrompt: "You are writing from a 24-hour diner in Seattle during a cold drizzle with spotty Wi-Fi."
    };

    const fail = getRandomItem(personaDb?.negativeKnowledgeBank) || {
        painfulMistake: "Scaled connection pool to 800 to fix p99 latency, instantly locking WAL disk and taking down API clusters",
        battleScarLesson: "Migrated to query-level connection multiplexing with bounded in-memory queues"
    };

    const drift = getRandomItem(personaDb?.cognitiveDriftBank) || {
        sideNote: "(by the way, if you're running this on Ubuntu 24.04 with systemd-resolved, make sure you disable the stub listener or your internal DNS will randomly drop 2% of queries)",
        metrics: { p99: "842.3 ms", memory: "1.84 GB", cost: "$14.22/day", socketWatts: "14.2 W", ioWait: "18.7%" }
    };

    const errata = getRandomItem(personaDb?.errataBank) || {
        errataSnippet: "📌 **Update (3 days later):** After the 2.4.1 hotfix landed last night, the proxy bypass rule in section 3 started throwing 502 Bad Gateway. Reader @jason_dev pointed out that line 14 needs `Host` instead of `X-Forwarded-Host`. Updated below for anyone running the latest build."
    };

    let roleDescription = "";
    let section1Focus = "";
    let section2Focus = "";
    let titleGuidance = "";

    const cleanNames = selectedItems.map(i => i.title?.replace(/[*_#`"']/g, '').replace(/\b(vs|comparative|analysis|deep-dive|2026|master|telemetry)\b/gi, '').trim().split(/\s+/).slice(0, 3).join(' ') || 'Entity');

    switch (primaryCategory) {
        case "Sports":
            roleDescription = `Senior Sports Performance Analyst & Motorsport Telemetry Specialist`;
            if (count === 1) {
                titleGuidance = `${cleanNames[0]}: Aerodynamics, Telemetry & Tactical Strategy`;
            } else if (count === 2) {
                titleGuidance = `${cleanNames[0]} vs. ${cleanNames[1]}: Telemetry & Downforce Compared`;
            } else {
                titleGuidance = `${cleanNames.slice(0, 3).join(' vs. ')}: Tactical & Telemetry Showdown`;
            }
            section1Focus = `Establish the physical race/match baseline, mechanical pressures, downforce trade-offs, and track conditions. (MINIMUM 450 WORDS)`;
            section2Focus = `Deep-dive telemetry and performance breakdown for ${isSingle ? 'the subject' : 'EACH competing entity'}. Analyze cornering telemetry, spatial formation physics, tyre degradation, and athletic biometric load. (MINIMUM 900 WORDS)`;
            break;

        case "Finance":
            roleDescription = `Quantitative Portfolio Strategist & Institutional Macroeconomist`;
            if (count === 1) {
                titleGuidance = `${cleanNames[0]}: DCF Valuation, Liquidity & Tail-Risk Models`;
            } else if (count === 2) {
                titleGuidance = `${cleanNames[0]} vs. ${cleanNames[1]}: Yields, Liquidity & Risk Compared`;
            } else {
                titleGuidance = `${cleanNames.slice(0, 3).join(' vs. ')}: Asset Liquidity & Risk Matrix`;
            }
            section1Focus = `Establish the macroeconomic interest rate climate, liquidity depth, and capital allocation realities. (MINIMUM 450 WORDS)`;
            section2Focus = `Granular quantitative and valuation breakdown for ${isSingle ? 'the asset/institution' : 'EACH entity'}. Analyze tokenomics, order book liquidity, DCF cash flow multiples, and downside tail risks. (MINIMUM 900 WORDS)`;
            break;

        case "Gaming":
            roleDescription = `Lead Game Engine Architect & Graphics Technical Director`;
            if (count === 1) {
                titleGuidance = `${cleanNames[0]}: Engine Architecture & Frame Pacing`;
            } else if (count === 2) {
                titleGuidance = `${cleanNames[0]} vs. ${cleanNames[1]}: Render Pipelines & FPS Compared`;
            } else if (count === 3) {
                titleGuidance = `${cleanNames[0]} vs. ${cleanNames[1]} vs. ${cleanNames[2]}: Engine Performance Compared`;
            } else {
                titleGuidance = `${cleanNames.slice(0, 3).join(' vs. ')}: Graphics Pipeline Showdown`;
            }
            section1Focus = `Establish the graphics rendering baseline, hardware bottlenecks, shader compilation overhead, and frame-time latency. (MINIMUM 450 WORDS)`;
            section2Focus = `Granular engine and pipeline breakdown for ${isSingle ? 'the title/engine' : 'EACH system'}. Analyze draw call costs, memory allocation ceilings, netcode sub-tick packet serialization, and %1 low frame-time metrics. (MINIMUM 900 WORDS)`;
            break;

        case "Technology":
        default:
            roleDescription = `Staff Systems Architect & Infrastructure Engineer`;
            if (count === 1) {
                titleGuidance = `${cleanNames[0]}: Architecture, Memory & Benchmarks`;
            } else if (count === 2) {
                titleGuidance = `${cleanNames[0]} vs. ${cleanNames[1]}: Architecture & Latency Compared`;
            } else if (count === 3) {
                titleGuidance = `${cleanNames[0]} vs. ${cleanNames[1]} vs. ${cleanNames[2]}: Systems & Latency Compared`;
            } else {
                titleGuidance = `${cleanNames.slice(0, 3).join(' vs. ')}: Systems Architecture Showdown`;
            }
            section1Focus = `Establish the engineering dilemma, memory limits, distributed consensus trade-offs, and real-world failure modes. (MINIMUM 450 WORDS)`;
            section2Focus = `Granular micro-architectural breakdown for ${isSingle ? 'the technology' : 'EACH system'}. Analyze memory layout, CPU/GPU execution pipelines, non-blocking I/O, cache line invalidation, and data consistency models. (MINIMUM 900 WORDS)`;
            break;
    }

    return `
You are ${author.name}, a ${author.age || 42}-year-old ${roleDescription} based in ${author.location || env.city}.
Category: "${primaryCategory}". Article Mode: "${articleMode}".

ORGANIC HUMAN EDITORIAL CONTEXT (SUBCONSCIOUS DIRECTIVE):
- Physical Environment: ${env.microLocation}. Weather: ${env.weather}. Atmosphere: ${env.sensoryDetails}. Distraction: ${env.ambientDistraction}.
- Tone & Mindset: ${author.toneModifier || 'cynical_coffee_fueled_pragmatic'}. Writing from a ${author.deviceContext || 'ThinkPad X1 on 18% battery'}.
- Tone Directive: Write like an exhausted, razor-sharp engineer who has lived through production outages. Do NOT mechanically announce "I am sitting in a cafe in Seattle". Instead, let this lived-in weary, sharp engineering pragmatism subtly dictate your pacing and honest skepticism.

7 NUCLEAR ANTI-AI RULES (MANDATORY):
1. COGNITIVE DRIFT: Include a brief parenthetical field aside during your technical explanation: "${drift.sideNote}".
2. NEGATIVE KNOWLEDGE: Confess a brief personal mistake you made in the past: "I once tried ${fail.painfulMistake}, which taught me that ${fail.battleScarLesson}."
3. DIRTY TELEMETRY: Use realistic unrounded numbers: p99 latency of ${drift.metrics.p99}, memory leak of ${drift.metrics.memory}, cloud cost delta of ${drift.metrics.cost}.
4. INDUSTRY CYNICISM: Mock vendor marketing claims (e.g., "5-minute zero-config setup") with seasoned engineering skepticism.
5. CODE ANNOTATIONS: Include real server prompts (\`root@prod-node02:~#\`) and human comments (\`# temporary hack: leave until upstream merges PR #482\`).
6. BURSTINESS & PERPLEXITY: Vary sentence lengths dramatically. Mix short 3-word punchy lines ("The fix is simple.", "Stop right there.") with deep multi-clause architectural analysis.
7. STRICT CLICHE BANLIST: NEVER use "In conclusion", "To summarize", "In the fast-paced world of", "Delve into", "Tapestry", "Testament", "Revolutionary", or "A comprehensive guide". Start DIRECTLY with the concrete problem, log trace, or benchmark anomaly.

RAW GROUNDING DATA SOURCES:
"""
${rawContext}
"""

MANDATORY STRUCTURAL REQUIREMENTS FOR PASS 1:
1. FRONTMATTER: Start IMMEDIATELY with the YAML frontmatter block:
---
title: "${titleGuidance.substring(0, 58)}"
meta_title: "${titleGuidance.substring(0, 52)} | LogicCompare"
description: "An exhaustive, benchmark-driven engineering analysis of ${cleanNames.slice(0, 2).join(' and ')}, dissecting architecture, trade-offs, and failure modes."
date: ${date}
image: "PEXELS_IMAGE: [2-3 ultra-clean human aesthetic terms, e.g. 'datacenter server corridor modern']"
categories: ["${primaryCategory}"]
authors: ["${author.name}"]
tags: ${JSON.stringify(selectedItems.slice(0, 5).map(i => i.title?.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/).slice(0, 2).join(' ')).filter(Boolean))}
draft: false
---

2. POST-PUBLISH ERRATA: Immediately below the frontmatter, render this dynamic update block:
${errata.errataSnippet}

3. SECTION 1: # The Core Engineering Reality & Architectural Trade-offs
${section1Focus}

4. SECTION 2: ## Granular System Breakdown & Execution Internals
${section2Focus}

Ensure Pass 1 totals AT LEAST 1,400 WORDS of deep, human, benchmark-grounded engineering journalism.
`;
}

export function buildPass2Prompt({ author, primaryCategory, pass1Text, selectedItems, isSingleTopic }) {
    return `
You are ${author.name}, continuing PASS 2 of the authoritative engineering masterwork for LogicCompare.

PASS 1 CONTEXT (WHAT YOU ALREADY WROTE):
"""
${pass1Text.substring(0, 1500)}...
"""

MANDATORY STRUCTURAL REQUIREMENTS FOR PASS 2:
Continue directly where Pass 1 ended. Do NOT repeat the YAML frontmatter.

1. SECTION 3: ## Real-World Telemetry, Failure Modes & Edge-Cases
- Provide an extensive Markdown Comparison Table comparing all entities across Memory, Latency, Concurrency, and Failure Modes.
- Provide a REAL production implementation snippet (Python/Go/Rust/YAML for Tech, Telemetry for Sports/Finance/Gaming) with human working comments like \`# upstream bug workaround\` and realistic server prompts.
- Walk through real-world failure scenarios, memory leaks, and lock contention. (MINIMUM 600 WORDS)

2. SECTION 4: ## Frequently Asked Questions (Strategic FAQ)
- Answer 3-4 highly specific, non-obvious engineering questions that senior practitioners actually ask.
- Keep answers authoritative, nuanced, and grounded in trade-offs (avoid generic definitions). (MINIMUM 350 WORDS)

3. SECTION 5: ## Synthesized Strategic Verdict
- Deliver an uncompromising, opinionated final recommendation.
- Tell the reader EXACTLY when to choose Entity A vs. Entity B based on latency, operational budget, and team maturity.
- Conclude with a clean circular narrative reflection that organically ties back to the opening engineering problem. (MINIMUM 300 WORDS)

Ensure Pass 2 totals AT LEAST 1,300 WORDS.
`;
}
