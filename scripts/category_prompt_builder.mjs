/**
 * Category-Specific Expert Prompt & Structure Builder (Faz 2)
 * -------------------------------------------------------------
 * Eliminates one-size-fits-all prompts.
 * Generates tailored, domain-accurate prompts for:
 * 1. Technology (Systems Architect, Code Blocks, K8s, Benchmarks)
 * 2. Sports (Tactical, Athletic Load, F1 Telemetry, NO FAKE CODE)
 * 3. Finance (DCF Models, Liquidity, Tokenomics, Risk Matrices)
 * 4. Gaming (Engine Architecture, FPS Frame Pacing, GPU/CPU scaling)
 */

export function buildPass1Prompt({ author, primaryCategory, articleMode, selectedItems, rawContext, date, isSingleTopic }) {
    const count = selectedItems.length;
    const isSingle = count === 1;

    let roleDescription = "";
    let section1Focus = "";
    let section2Focus = "";
    let titleGuidance = "";

    const entityNames = selectedItems.map(i => i.title?.replace(/[*_#`"']/g, '').substring(0, 30).trim() || 'Entity');

    switch (primaryCategory) {
        case "Sports":
            roleDescription = `Senior Sports Performance Analyst, Tactical Strategist, and Motorsport Telemetry Expert for "LogicCompare"`;
            if (count === 1) {
                titleGuidance = `[Direct High-Intent Sports Analysis Title: e.g. '${entityNames[0]}: Tactical Strategy, Biometric Load, and Season Outlook']`;
            } else if (count === 2) {
                titleGuidance = `[Natural Sports Comparison: e.g. '${entityNames[0]} vs. ${entityNames[1]}: Downforce, Top Speed, and Tactical Strategy Compared']`;
            } else {
                titleGuidance = `[Multi-Entity Sports Comparison: e.g. '${entityNames.join(' vs. ')}: Championship Performance & Tactical Matrix']`;
            }
            section1Focus = `Establish the competitive athletic landscape, tactical season context, championship pressures, and high-performance physical/mechanical baselines. (MINIMUM 450 WORDS)`;
            section2Focus = `Deep-dive tactical and performance breakdown for ${isSingle ? 'the subject' : 'EACH competing entity'}. Analyze tactical formations, athletic biometric load, aerodynamic/telemetry deltas (for racing), pit/game strategy, and rulebook constraints citing facts from the source text. (MINIMUM 900 WORDS)`;
            break;

        case "Finance":
            roleDescription = `Senior Quantitative Analyst, Institutional Asset Strategist, and Macroeconomist for "LogicCompare"`;
            if (count === 1) {
                titleGuidance = `[Institutional Valuation Title: e.g. '${entityNames[0]}: DCF Valuation, Liquidity Depth, and Risk Models']`;
            } else if (count === 2) {
                titleGuidance = `[High-Intent Financial Comparison: e.g. '${entityNames[0]} vs. ${entityNames[1]}: Yields, Liquidity, and Risk Profiles Compared']`;
            } else {
                titleGuidance = `[Multi-Asset Financial Comparison: e.g. '${entityNames.join(' vs. ')}: Asset Class Liquidity & Risk Matrix']`;
            }
            section1Focus = `Establish the macroeconomic climate, interest rate/monetary liquidity backdrop, institutional flow dynamics, and capital market risks. (MINIMUM 450 WORDS)`;
            section2Focus = `Granular quantitative and valuation breakdown for ${isSingle ? 'the asset/institution' : 'EACH entity'}. Analyze tokenomics, order book liquidity depth, DCF cash flow multiples, CAGR projections, regulatory compliance, and downside tail risks. (MINIMUM 900 WORDS)`;
            break;

        case "Gaming":
            roleDescription = `Lead Game Engine Architect, Graphics Technical Director, and Esports Meta Analyst for "LogicCompare"`;
            if (count === 1) {
                titleGuidance = `[Deep Gaming Architecture Title: e.g. '${entityNames[0]}: Engine Performance, Frame Pacing, and Physics Pipeline']`;
            } else if (count === 2) {
                titleGuidance = `[Direct Gaming Tech Comparison: e.g. '${entityNames[0]} vs. ${entityNames[1]}: Rendering Pipelines, Draw Calls, and Frame Pacing Compared']`;
            } else if (count === 3) {
                titleGuidance = `[Tri-Matrix Gaming Tech Comparison: e.g. '${entityNames[0]} vs. ${entityNames[1]} vs. ${entityNames[2]}: Game Engine Architecture & Performance Compared']`;
            } else {
                titleGuidance = `[Multi-Game Tech Comparison: e.g. '${entityNames.join(' vs. ')}: Graphics Pipeline & Hardware Matrix']`;
            }
            section1Focus = `Establish the gaming ecosystem backdrop, graphics pipeline generation shifts, gameplay meta dynamics, and hardware optimization targets. (MINIMUM 450 WORDS)`;
            section2Focus = `Granular technical and gameplay breakdown for ${isSingle ? 'the title/engine' : 'EACH game/system'}. Analyze graphics rendering passes, frame-time latency, netcode tick rates, shader compilation bottlenecks, memory budgets, and core gameplay mechanics. (MINIMUM 900 WORDS)`;
            break;

        case "Technology":
        default:
            roleDescription = `World-Class Systems Architect, Principal Infrastructure Engineer, and Elite Technical Analyst for "LogicCompare"`;
            if (count === 1) {
                titleGuidance = `[Exhaustive Systems Architecture Title: e.g. '${entityNames[0]}: Architecture, Memory Layout, and High-Throughput Benchmarks']`;
            } else if (count === 2) {
                titleGuidance = `[High-Intent Technical Comparison: e.g. '${entityNames[0]} vs. ${entityNames[1]}: Architecture, Latency, and Memory Footprint Compared']`;
            } else if (count === 3) {
                titleGuidance = `[Tri-Matrix Technical Comparison: e.g. '${entityNames[0]} vs. ${entityNames[1]} vs. ${entityNames[2]}: Ecosystem Architecture & Scalability Compared']`;
            } else {
                titleGuidance = `[Quad-Matrix Benchmark: e.g. '${entityNames[0]} vs. ${entityNames[1]} vs. ${entityNames[2]} vs. ${entityNames[3]}: Comprehensive Architecture & Performance Matrix']`;
            }
            section1Focus = `Establish the overarching engineering problem space, distributed systems paradigms, cloud scale challenges, and macroeconomic infrastructure trade-offs. (MINIMUM 450 WORDS)`;
            section2Focus = `Granular micro-architectural breakdown for ${isSingle ? 'the technology' : 'EACH system'}. Analyze memory layout, CPU/GPU compute execution pipelines, concurrency models, I/O throughput, caching tiers, and data consistency models citing facts from the source text. (MINIMUM 900 WORDS)`;
            break;
    }

    return `
You are the ${roleDescription}. Your name is "${author.name}".
Your native language and the ONLY language you will use to write this article is "English".
Category: "${primaryCategory}". Specialty: "${author.specialty}". Article Mode: "${articleMode}".

MISSION (PASS 1 - FOUNDATIONS & DEEP SYSTEMIC BREAKDOWN):
You are writing PART 1 of an exhaustive, authoritative 2-part masterwork.
${isSingle ? 'Perform an EXHAUSTIVE, MONOGRAPHIC DEEP DIVE on the provided subject.' : `Perform an UNCOMPROMISING COMPARATIVE ANALYSIS contrasting ALL ${selectedItems.length} entities.`}

RAW GROUNDING DATA SOURCES:
"""
${rawContext}
"""

MANDATORY STRUCTURAL REQUIREMENTS FOR PASS 1:
1. FRONTMATTER: Start IMMEDIATELY with the YAML frontmatter block:
---
title: "${titleGuidance}"
meta_title: "[Ultra-High CTR Title Under 58 Chars: e.g. 'A vs B: Key Trade-offs | LogicCompare']"
description: "[High Search-Intent Active Summary: e.g. 'Compare A and B across performance benchmarks, architectural trade-offs, and production metrics.']"
date: ${date}
image: "PEXELS_IMAGE: [3 comma-separated short concrete visual English search terms matching ${primaryCategory}]"
categories: ["${primaryCategory}"]
authors: ["${author.name}"]
tags: ["[tag1]", "[tag2]", "[tag3]", "[tag4]"]
draft: false
---

TITLE WRITING RULES:
- NEVER use generic robotic phrases like "Comparative Analysis of", "A Tri-Matrix Study of", "A Quad-Matrix Breakdown".
- Instead, use conversational, high-volume search query structures that users search on Google (e.g. "[Entity A] vs. [Entity B]: [Dimension 1], [Dimension 2], and [Dimension 3] Compared" or "[Topic]: [Key Aspect] & [Outlook]").

2. SECTION 1: STRATEGIC CONTEXT & ${primaryCategory.toUpperCase()} BASELINE (MINIMUM 450 WORDS)
   - Do NOT use the heading "Introduction".
   - ${section1Focus}
   - Embed 1 image: ![Context](PEXELS_IMAGE: [3 relevant search terms])

3. SECTION 2: GRANULAR ${isSingle ? 'SYSTEMIC & ARCHITECTURAL' : 'MULTI-WAY'} BREAKDOWN (MINIMUM 900 WORDS)
   - ${section2Focus}
${selectedItems.map((item, idx) => `     * ### Entity #${idx + 1} Deep Breakdown: ${item.title}`).join('\n')}
   - Embed 1 image: ![Analysis](PEXELS_IMAGE: [3 relevant search terms])

TOTAL OUTPUT FOR PASS 1: MINIMUM 1,300 WORDS. DO NOT WRITE FAQS OR CONCLUSION YET. START DIRECTLY WITH '---'.
`;
}

export function buildPass2Prompt({ author, primaryCategory, articleMode, selectedItems, rawContext, isSingleTopic }) {
    const isSingle = selectedItems.length === 1;

    let section3Title = "";
    let section3Requirements = "";
    let section4Title = "";
    let section4Requirements = "";
    let faqGuidance = "";

    switch (primaryCategory) {
        case "Sports":
            section3Title = "## Comprehensive Performance Matrix & Strategic Trade-offs";
            section3Requirements = `Must include an exhaustive Markdown Comparison Table (Athletic Load / Telemetry Speed / Budget Cap / Strategy Agility / Risk-to-Reward / Pros / Cons). Provide in-depth commentary analyzing why certain tactical setups outperform others. (MINIMUM 450 WORDS)`;
            section4Title = "## Tactical Playbooks, Telemetry Telemetry & Load Management Runbooks";
            section4Requirements = `
CRITICAL RULE FOR SPORTS: DO NOT WRITE PYTHON OR TYPESCRIPT SOFTWARE CODE BLOCKS.
Instead, provide:
- Granular Aerodynamic Telemetry Deltas & Downforce Parameters (for Motorsport) OR Tactical Formation Schemes & Passing Network Metrics (for Football/Soccer) OR Playoff Minute Distributions & Biometric Recovery Schedules (for Basketball).
- Detailed operational contingency playbooks, weather adjustments, injury recovery protocols, and tactical edge-case handling. (MINIMUM 750 WORDS)`;
            faqGuidance = `5 exhaustive Q&A pairs answering real-world tactical and athletic performance questions searchers actually ask.`;
            break;

        case "Finance":
            section3Title = "## Quantitative Benchmark Matrix & Risk-Adjusted Returns";
            section3Requirements = `Must include a multi-dimensional Markdown Financial Matrix (Liquidity Depth / Volatility Beta / Sharpe Ratio / DCF Multiple / Regulatory Exposure / Pros / Cons). Explain capital efficiency trade-offs. (MINIMUM 450 WORDS)`;
            section4Title = "## Institutional DCF Models, Sensitivity Tables & Liquidity Stress Tests";
            section4Requirements = `
Provide concrete Quantitative DCF Models, Markdown Sensitivity Matrices (Interest Rate vs. Terminal Growth Rate), Tokenomic Emission Calculations, or Stress-Test Scenario Runbooks.
- Explain downside risk mitigation, liquidity drain hedging, and regulatory compliance edge-cases. (MINIMUM 750 WORDS)`;
            faqGuidance = `5 exhaustive Q&A pairs answering investor, trader, and regulatory compliance queries.`;
            break;

        case "Gaming":
            section3Title = "## Engine Benchmark Matrix & Hardware Scalability Trade-offs";
            section3Requirements = `Must include a detailed Markdown Performance Table (1% Low FPS / VRAM Allocation / Draw Calls per Frame / Shader Stutter Index / Modding Modularity / Pros / Cons). (MINIMUM 450 WORDS)`;
            section4Title = "## Hardware Telemetry, Engine Pipeline Optimization & Netcode Hardening";
            section4Requirements = `
Provide granular hardware configuration tuning parameters, Engine rendering pipeline profiling metrics, Frame-Generation latency comparisons, or Server Tick-Rate synchronization telemetry.
- Explain memory leak mitigation, shader pre-compilation strategies, and platform-specific crash recovery runbooks. (MINIMUM 750 WORDS)`;
            faqGuidance = `5 exhaustive Q&A pairs answering PC/console hardware performance and gameplay meta queries.`;
            break;

        case "Technology":
        default:
            section3Title = "## Comprehensive Benchmark Matrix & Architectural Trade-offs";
            section3Requirements = `Must include a multi-column Markdown Comparison Matrix (Throughput / Latency / Memory Footprint / Fault-Tolerance / Security Model / Developer Ergonomics / Pros / Cons). (MINIMUM 450 WORDS)`;
            section4Title = "## Real-World Implementation, Production Code & Hardening";
            section4Requirements = `
Provide concrete, production-ready Code Blocks (Python, TypeScript, Rust, Go, or K8s/YAML configs) illustrating actual implementation, connection pooling, or distributed data flow.
- Include failure modes, disaster recovery runbooks, zero-trust security hardening, and edge-case handling. (MINIMUM 750 WORDS)`;
            faqGuidance = `5 exhaustive Q&A pairs answering developer, devops, and software architect queries.`;
            break;
    }

    return `
You are the elite author "${author.name}" continuing the LogicCompare ${primaryCategory} masterwork.
Category: "${primaryCategory}". Language: English ONLY.

You have already written Part 1. Now write Part 2 (the final analytical section).

RAW GROUNDING DATA:
"""
${rawContext}
"""

MANDATORY STRUCTURAL REQUIREMENTS FOR PASS 2:
DO NOT REPEAT FRONTMATTER. DO NOT REPEAT SECTION 1 OR 2. START DIRECTLY WITH SECTION 3:

1. SECTION 3: ${section3Title}
   - ${section3Requirements}

2. SECTION 4: ${section4Title}
   - ${section4Requirements}
   - Embed 1 image: ![Implementation](PEXELS_IMAGE: [3 relevant search terms for ${primaryCategory}])

3. SECTION 5: ## Frequently Asked Questions & Strategic FAQ (MINIMUM 450 WORDS)
   - Must use heading "## Frequently Asked Questions & Strategic FAQ".
   - Include exactly 5 exhaustive Q&A pairs (### Question?) ${faqGuidance}

4. SECTION 6: ## Synthesized Strategic Verdict (MINIMUM 200 WORDS)
   - Do NOT use the heading "Conclusion". Provide an authoritative, actionable verdict.

TOTAL OUTPUT FOR PASS 2: MINIMUM 1,500 WORDS. DO NOT INCLUDE FRONTMATTER. START DIRECTLY WITH '${section3Title}'.
`;
}
