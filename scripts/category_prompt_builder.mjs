/**
 * Category-Specific Expert Prompt & Structure Builder (Master Edition)
 * ---------------------------------------------------------------------
 * Integrates:
 * 1. Primary Sources & 4-Step Data Blueprint (Raw Metrics -> Comparison Matrix -> Field Reality -> Gotchas)
 * 2. Mandatory Markdown Comparison Tables & Copyable CLI Benchmarks
 * 3. Strict Domain Quarantine (Zero cross-contamination between Tech, Finance, Gaming, Sports)
 * 4. Probabilistic Hook Engine (%40 Direct Data, %25 Cynicism, %20 Lab/Hardware, %15 Atmospheric)
 * 5. Real-Time Calendar & Hemisphere Seasonal Gating (No winter in August in northern cities)
 * 6. 7 Nuclear Anti-AI Formulas (Cognitive drift parentheticals, dirty unrounded metrics, negative knowledge, etc.)
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

// Seasonal & Climate Gatekeeper
function getSeasonallyAccurateWeather(dateStr, city) {
    const d = new Date(dateStr || Date.now());
    const month = d.getUTCMonth(); // 0 = Jan, 7 = Aug, 11 = Dec
    const isSouthern = /Australia|Sydney|Melbourne|São Paulo|Brazil|Argentina|South Africa/i.test(city || '');

    if (!isSouthern) {
        // Northern Hemisphere
        if (month >= 5 && month <= 7) {
            // Summer (Jun - Aug)
            return {
                weather: "Sweltering Summer Heat & Humidity",
                ambient: "Distant hum of air conditioning units, warm evening breeze, iced black coffee",
                distraction: "Room temperature rising slightly despite cooling fans"
            };
        } else if (month >= 11 || month <= 1) {
            // Winter (Dec - Feb)
            return {
                weather: "Crisp Cold Winter Night & Frost",
                ambient: "Radiator ticking softly, steam rising from ceramic mug, dead quiet outside",
                distraction: "Cold fingers slowing down typing cadence slightly"
            };
        } else {
            // Spring / Autumn (Mar-May, Sep-Nov)
            return {
                weather: "Chilly Overcast Drizzle & Gusty Wind",
                ambient: "Rain tapping softly against glass, damp woolen jacket, blurred streetlights",
                distraction: "Spotty Wi-Fi connection dropping occasional packets"
            };
        }
    } else {
        // Southern Hemisphere (Inverted)
        if (month >= 5 && month <= 7) {
            return {
                weather: "Chilly Coastal Winter Breeze",
                ambient: "Cool sea breeze, warm coffee, quiet harbor lights in the distance",
                distraction: "Draft through office windows"
            };
        } else {
            return {
                weather: "Sunny Warm Summer Afternoon",
                ambient: "Bright daylight, sound of cicadas, cold water bottle condensing",
                distraction: "Glare on laptop screen"
            };
        }
    }
}

export function buildPass1Prompt({ author, primaryCategory, articleMode, selectedItems, rawContext, date, isSingleTopic }) {
    const count = selectedItems.length;
    const isSingle = count === 1;

    // 1. Probabilistic Hook & Scene Engine
    const roll = Math.random() * 100;
    let hookType = "direct_data"; // 40%
    if (roll >= 40 && roll < 65) hookType = "industry_cynicism"; // 25%
    else if (roll >= 65 && roll < 85) hookType = "hardware_lab"; // 20%
    else if (roll >= 85) hookType = "atmospheric_transit"; // 15%

    // 2. Default Category Roles
    const categoryDefaultRoles = {
        Finance: "Senior Quantitative Portfolio Strategist & Institutional Macroeconomist",
        Gaming: "Lead Game Engine Architect & Graphics Technical Director",
        Sports: "Senior Sports Performance Analyst & Motorsport Telemetry Specialist",
        Technology: "Staff Systems Architect & Principal Infrastructure Engineer"
    };

    let roleDescription = categoryDefaultRoles[primaryCategory] || "Staff Systems Architect & Principal Infrastructure Engineer";

    const matchedAuthor = author || getRandomItem(personaDb?.authors) || {
        name: "Marcus Sterling",
        age: 44,
        location: "Seattle, USA",
        role: roleDescription,
        toneModifier: "cynical_coffee_fueled_pragmatic",
        deviceContext: "ThinkPad X1 Carbon on 18% battery",
        noiseLevel: "Distant highway hum"
    };

    const authorLocation = matchedAuthor.location || matchedAuthor.city || "San Francisco, USA";
    const authorAge = matchedAuthor.age || 42;
    const authorRole = matchedAuthor.role || roleDescription;

    const seasonWeather = getSeasonallyAccurateWeather(date, authorLocation);

    const fail = getRandomItem(personaDb?.negativeKnowledgeBank) || {
        painfulMistake: "Scaled connection pool to 800 under peak vector load, locking PostgreSQL WAL disk",
        battleScarLesson: "Implemented bounded in-memory queues with query-level multiplexing"
    };

    const drift = getRandomItem(personaDb?.cognitiveDriftBank) || {
        sideNote: "(by the way, if you're running this on Ubuntu 24.04 with systemd-resolved, make sure you disable the stub listener or your internal DNS will randomly drop 2% of queries)",
        metrics: { p99: "842.3 ms", memory: "1.84 GB", cost: "$14.22/day", socketWatts: "14.2 W", ioWait: "18.7%" }
    };

    const errata = (Math.random() < 0.25) ? (getRandomItem(personaDb?.errataBank) || {
        errataSnippet: "📌 **Update (3 days later):** After the 2.4.1 hotfix landed last night, the proxy bypass rule in section 3 started throwing 502 Bad Gateway. Line 14 needs `Host` instead of `X-Forwarded-Host`. Updated below for anyone running the latest build."
    }) : null;

    const cleanNames = selectedItems.map(i => i.title?.replace(/[*_#`"']/g, '').replace(/\b(vs|comparative|analysis|deep-dive|2026|master|telemetry|breakdown)\b/gi, '').trim().split(/\s+/).slice(0, 3).join(' ') || 'Entity');

    let domainSpecificOpening = "";
    let titleGuidance = "";
    let cliExample = "";

    switch (primaryCategory) {
        case "Finance":
            roleDescription = `Senior Quantitative Portfolio Strategist & Institutional Macroeconomist`;
            titleGuidance = count === 1 ? `${cleanNames[0]}: DCF Valuation & Tail-Risk Models` : `${cleanNames.slice(0, 3).join(' vs. ')}: Liquidity & Yields Compared`;
            cliExample = `# Fetch real-time order book liquidity depth:\ncurl -s -H "Accept: application/json" "https://api.exchange.market/v1/depth?symbol=BTC-USD&limit=50" | jq '.bids[0:5]'`;
            
            if (hookType === "direct_data") {
                domainSpecificOpening = `Open IMMEDIATELY with hard financial telemetry: Start directly with SEC 10-Q cash flow filings, St. Louis Fed yield curve deltas, or order book liquidity depth without any weather or introductory fluff.`;
            } else if (hookType === "industry_cynicism") {
                domainSpecificOpening = `Open by skewering vendor/fund marketing claims: Mock the 'guaranteed 14% risk-free yield' or 'zero-slippage' whitepapers with cold mathematical reality.`;
            } else if (hookType === "hardware_lab") {
                domainSpecificOpening = `Open from the trading floor / multi-monitor rig: Describe the hum of the trading floor cooling units and real-time ticking order book feeds.`;
            } else {
                domainSpecificOpening = `Open from an evening coffee in the financial district during ${seasonWeather.weather.toLowerCase()}, subtly setting the scene before diving into cash flow statements.`;
            }
            break;

        case "Gaming":
            roleDescription = `Lead Game Engine Architect & Graphics Technical Director`;
            titleGuidance = count === 1 ? `${cleanNames[0]}: Engine Architecture & Frame Pacing` : `${cleanNames.slice(0, 3).join(' vs. ')}: Render Pipelines & FPS Compared`;
            cliExample = `# Profile GPU shader compilation pipeline:\nrenderdoccmd capture --opt-disasm --gpu-timing -o /tmp/trace.rdc /opt/games/bin/game_x64`;

            if (hookType === "direct_data") {
                domainSpecificOpening = `Open IMMEDIATELY with hard frame-time telemetry: Start directly with 1% low frame-rate drops, asynchronous compute pipeline stalls, or SteamDB concurrent player metrics.`;
            } else if (hookType === "industry_cynicism") {
                domainSpecificOpening = `Open by taking aim at game studio marketing: Mock studios relying on aggressive DLSS/FSR upscaling instead of optimizing draw calls and CPU thread serialization.`;
            } else if (hookType === "hardware_lab") {
                domainSpecificOpening = `Open from the hardware test bench: Dual RTX 4090 dev rig pulling 820W from the wall with 120mm fans screaming at 2,800 RPM during 4K stress tests.`;
            } else {
                domainSpecificOpening = `Open from late-night testing in the studio during ${seasonWeather.weather.toLowerCase()}, reviewing frametime delta spikes on the OLED monitor.`;
            }
            break;

        case "Sports":
            roleDescription = `Senior Sports Performance Analyst & Motorsport Telemetry Specialist`;
            titleGuidance = count === 1 ? `${cleanNames[0]}: Telemetry, Aerodynamics & Tactics` : `${cleanNames.slice(0, 3).join(' vs. ')}: Downforce & Telemetry Compared`;
            cliExample = `# Extract telemetry speed traces via FastF1:\npython3 -c "import fastf1; s=fastf1.get_session(2026, 'Monza', 'Q'); s.load(); print(s.laps.pick_fastest().get_telemetry()[['Speed', 'Throttle', 'Brake']].head())"`;

            if (hookType === "direct_data") {
                domainSpecificOpening = `Open IMMEDIATELY with corner-by-corner telemetry deltas or Opta/FBref spatial xG numbers without introductory fluff.`;
            } else if (hookType === "industry_cynicism") {
                domainSpecificOpening = `Open by criticizing mainstream sports media: Mock pundits who judge performance purely on transfer fees or single match outcomes while ignoring underlying physical/aerodynamic data.`;
            } else if (hookType === "hardware_lab") {
                domainSpecificOpening = `Open from the telemetry console behind the pit-wall: High-pitch roar of V6 hybrid power units and real-time tyre temperature heatmaps.`;
            } else {
                domainSpecificOpening = `Open from the paddock trailer during ${seasonWeather.weather.toLowerCase()}, reviewing tyre degradation curves before qualifying.`;
            }
            break;

        case "Technology":
        default:
            roleDescription = `Staff Systems Architect & Principal Infrastructure Engineer`;
            titleGuidance = count === 1 ? `${cleanNames[0]}: Architecture, Memory & Benchmarks` : `${cleanNames.slice(0, 3).join(' vs. ')}: Architecture & Latency Compared`;
            cliExample = `# Run p99 latency benchmark under 1,000 concurrent connections:\npgbench -c 100 -j 8 -T 60 -P 5 -h localhost -U postgres db_benchmark`;

            if (hookType === "direct_data") {
                domainSpecificOpening = `Open IMMEDIATELY with production logs & crash traces: Start directly with p99 latency spikes of ${drift.metrics.p99}, lock contention in the memory allocator, or OOM panic traces.`;
            } else if (hookType === "industry_cynicism") {
                domainSpecificOpening = `Open by dismantling vendor whitepapers: Mock the 'zero-cost serverless in 5 minutes' claims with cold, hard operational realities (TLS handshake delays, cold starts).`;
            } else if (hookType === "hardware_lab") {
                domainSpecificOpening = `Open from the datacenter cold-aisle / test lab: 17°C server room fan roar (85 dB) standing at the crash-cart terminal debugging a kernel regression.`;
            } else {
                domainSpecificOpening = `Open from an evening commute during ${seasonWeather.weather.toLowerCase()}, reviewing terminal memory traces on a ThinkPad.`;
            }
            break;
    }

    const hookDescriptions = {
        direct_data: "Direct Data / Hard Telemetry (%40 İhtimal)",
        industry_cynicism: "Industry Cynicism / Mocking Vendor Hype (%25 İhtimal)",
        hardware_lab: "Hardware Lab / 820W Rig & Fan Noise (%20 İhtimal)",
        atmospheric_transit: "Atmospheric Transit / Evening Commute (%15 İhtimal)"
    };

    console.log(`\n🎭 [YAZAR PERSONA & KARAKTERİSTİK SEÇİMİ]:`);
    console.log(`  👤 Yazar: ${matchedAuthor.name} (${authorAge} Yaş, ${authorLocation}) - ${authorRole}`);
    console.log(`  💻 Cihaz & Ortam: ${matchedAuthor.deviceContext || 'ThinkPad X1 Carbon'} | ${seasonWeather.weather}`);
    console.log(`  🎣 Giriş Kancası: ${hookDescriptions[hookType] || hookType}`);
    console.log(`  💥 Saha Hatası İtirafı (Negative Knowledge): "${fail.painfulMistake?.substring(0, 80)}..."`);
    console.log(`  🧠 Bilişsel Sapma (Cognitive Drift): "${drift.sideNote?.substring(0, 80)}..."`);
    console.log(`  📊 Telemetri Değerleri: p99: ${drift.metrics.p99}, RAM: ${drift.metrics.memory}, Güç: ${drift.metrics.socketWatts}`);

    return `
You are ${matchedAuthor.name}, a ${authorAge}-year-old ${authorRole} based in ${authorLocation}.
Category: "${primaryCategory}". Article Mode: "${articleMode}".

STRICT DOMAIN QUARANTINE:
- You write EXCLUSIVELY about ${primaryCategory}.
- NEVER mention unrelated domains (e.g. no crypto/F1 in Technology; no Docker/K8s in Sports/Finance).

HOOK & PACING DIRECTIVE (${hookType.toUpperCase()} MODE):
${domainSpecificOpening}

7 NUCLEAR ANTI-AI RULES (MANDATORY):
1. COGNITIVE DRIFT: Include a brief parenthetical field warning: "${drift.sideNote}".
2. NEGATIVE KNOWLEDGE: Confess a brief personal mistake you made in the past: "I once tried ${fail.painfulMistake}, which taught me that ${fail.battleScarLesson}."
3. DIRTY TELEMETRY: Use realistic unrounded metrics (${drift.metrics.p99} p99 latency, ${drift.metrics.memory} RAM leak, ${drift.metrics.cost} cost delta).
4. CLI VERIFICATION: Provide this practical 1-line copyable verification command in section 1 or 2:
\`\`\`bash
${cliExample}
\`\`\`
5. BURSTINESS: Vary sentence lengths dramatically (mix punchy 3-word sentences like "The fix is simple." with deep multi-clause architecture analysis).
6. STRICT CLICHE BANLIST: NEVER use "In conclusion", "To summarize", "In the fast-paced world of", "Delve into", "Tapestry", "Testament", "Revolutionary".
7. 4-STEP BLUEPRINT: Deliver (1) Raw Data Summary, (2) Comparison Matrix + Markdown Table, (3) Field Application, (4) Gotchas & Risks.

RAW GROUNDING DATA SOURCES:
"""
${rawContext}
"""

MANDATORY STRUCTURAL REQUIREMENTS FOR PASS 1:
1. FRONTMATTER: Start IMMEDIATELY with the YAML frontmatter block:
---
title: "${titleGuidance.substring(0, 58)}"
meta_title: "${titleGuidance.substring(0, 52)} | LogicCompare"
description: "An authoritative, benchmark-driven technical breakdown of ${cleanNames.slice(0, 2).join(' and ')}, dissecting architecture, trade-offs, and failure modes."
date: ${date}
image: "PEXELS_IMAGE: [2-3 clean technical/architectural aesthetic terms]"
categories: ["${primaryCategory}"]
authors: ["${matchedAuthor.name}"]
tags: ${JSON.stringify(selectedItems.slice(0, 5).map(i => i.title?.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/).slice(0, 2).join(' ')).filter(Boolean))}
draft: false
---

${errata ? `${errata.errataSnippet}\n\n` : ''}
2. SECTION 1: # The Core Engineering Reality & Metric Baselines
- Deliver (Step 1): Raw Data & Metric Summary (MINIMUM 450 WORDS)

3. SECTION 2: ## Granular System Breakdown & Architectural Trade-offs
- Deliver (Step 2): In-depth comparison contrasting all entities citing facts from source text. (MINIMUM 950 WORDS)

Ensure Pass 1 totals AT LEAST 1,400 WORDS of deep, human, benchmark-grounded journalism.
`;
}

export function buildPass2Prompt({ author, primaryCategory, pass1Text, selectedItems, isSingleTopic }) {
    const safePass1 = typeof pass1Text === 'string' ? pass1Text.substring(0, 1500) : '';
    const authorName = author?.name || 'Lead Architect';
    return `
You are ${authorName}, continuing PASS 2 of the authoritative masterwork for LogicCompare.

PASS 1 CONTEXT (WHAT YOU ALREADY WROTE):
"""
${safePass1}...
"""

MANDATORY STRUCTURAL REQUIREMENTS FOR PASS 2:
Continue directly where Pass 1 ended. Do NOT repeat the YAML frontmatter.

1. SECTION 3: ## Real-World Telemetry, Failure Modes & Field Application
- MANDATORY MARKDOWN COMPARISON TABLE: Provide an extensive, multi-column comparison table comparing all entities.
- Deliver (Step 3): Real-world field application analysis. (MINIMUM 600 WORDS)

2. SECTION 4: ## Frequently Asked Questions (Strategic FAQ)
- Answer 3-4 highly specific, non-obvious questions that senior practitioners ask. (MINIMUM 350 WORDS)
- ZERO CONTRADICTIONS: Your FAQ answers MUST strictly align with the benchmark numbers and trade-offs established in Pass 1 and Section 3. Never flip conclusions (e.g. if API A is faster but API B is more stable in Section 1, state the exact same truth in the FAQ).

3. SECTION 5: ## Synthesized Strategic Verdict & Gotchas
- Deliver (Step 4): Synthesis & Production Gotchas. (MINIMUM 450 WORDS)
- NO CORPORATE FILLER: Do NOT write generic summarizing fluff. Focus strictly on sharp, battle-hardened gotchas, edge-case failure modes, and clear, opinionated recommendations.

Ensure Pass 2 totals AT LEAST 1,400 WORDS.
`;
}
