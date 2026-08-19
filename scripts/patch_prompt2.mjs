import fs from 'fs';

let content = fs.readFileSync('scripts/category_prompt_builder.mjs', 'utf-8');

const failBlock = `    const fail = getRandomItem(personaDb?.negativeKnowledgeBank) || {
        painfulMistake: "Scaled connection pool to 800 under peak vector load, locking PostgreSQL WAL disk",
        battleScarLesson: "Implemented bounded in-memory queues with query-level multiplexing"
    };`;

const driftBlock = `    const drift = getRandomItem(personaDb?.cognitiveDriftBank) || {
        sideNote: "(by the way, if you're running this on Ubuntu 24.04 with systemd-resolved, make sure you disable the stub listener or your internal DNS will randomly drop 2% of queries)",
        metrics: { p99: "842.3 ms", memory: "1.84 GB", cost: "$14.22/day", socketWatts: "14.2 W", ioWait: "18.7%" }
    };`;

const errataBlock = `    const errata = (Math.random() < 0.25) ? (getRandomItem(personaDb?.errataBank) || {
        errataSnippet: "📌 **Update (3 days later):** After the 2.4.1 hotfix landed last night, the proxy bypass rule in section 3 started throwing 502 Bad Gateway. Line 14 needs \`Host\` instead of \`X-Forwarded-Host\`. Updated below for anyone running the latest build."
    }) : null;`;

content = content.replace(failBlock, '');
content = content.replace(driftBlock, '');
content = content.replace(errataBlock, '');

// Clean up extra newlines where we removed them
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

content = content.replace('switch (primaryCategory) {', `let fail = {};
    let drift = {};
    let errata = null;

    switch (primaryCategory) {`);

// 3. Inject category specific configs
const financeFind = `cliExample = \`# Fetch real-time order book liquidity depth:\\ncurl -s -H "Accept: application/json" "https://api.exchange.market/v1/depth?symbol=BTC-USD&limit=50" | jq '.bids[0:5]'\`;`;
const financeReplace = financeFind + `
            fail = { painfulMistake: "over-leveraged an automated yield farming vault during the 2022 de-peg event without setting dynamic slippage limits", battleScarLesson: "liquidity dries up exponentially faster than implied volatility suggests" };
            drift = { sideNote: "(pro tip: if you're querying the subgraphs via GraphQL under high volatility, use a dedicated RPC endpoint or Infura will throttle with 429)", metrics: { p99: "42.1% utilization", memory: "$14.2M volume", cost: "20.5 Gwei gas", socketWatts: "150% collateral ratio" } };
            errata = (Math.random() < 0.25) ? { errataSnippet: "📌 **Update (3 days later):** The liquidation penalty parameter on the vault contract was adjusted from 13% to 11.5% in governance proposal MIP-42. The tables below reflect the old epoch." } : null;`;
content = content.replace(financeFind, financeReplace);

const gamingFind = `cliExample = \`# Profile GPU shader compilation pipeline:\\nrenderdoccmd capture --opt-disasm --gpu-timing -o /tmp/trace.rdc /opt/games/bin/game_x64\`;`;
const gamingReplace = gamingFind + `
            fail = { painfulMistake: "relied on runtime shader compilation on DirectX 12 instead of pre-caching pipeline state objects", battleScarLesson: "stutter is inevitable unless you pre-warm the PSO cache" };
            drift = { sideNote: "(quick heads-up: if you're profiling on an OLED panel with G-Sync, lock framerate 3 FPS below refresh or you'll get tearing at the hardware level)", metrics: { p99: "18.4 ms frame time", memory: "4.12 GB VRAM", cost: "6.3 ms physics", socketWatts: "820W draw" } };
            errata = (Math.random() < 0.25) ? { errataSnippet: "📌 **Update (3 days later):** Patch 1.1.2 hotfix addressed the shader cache invalidation issue mentioned in section 2. VRAM footprint is down ~400MB." } : null;`;
content = content.replace(gamingFind, gamingReplace);

const sportsFind = `cliExample = \`# Extract telemetry speed traces via FastF1:\\npython3 -c "import fastf1; s=fastf1.get_session(2026, 'Monza', 'Q'); s.load(); print(s.laps.pick_fastest().get_telemetry()[['Speed', 'Throttle', 'Brake']].head())"\`;`;
const sportsReplace = sportsFind + `
            fail = { painfulMistake: "trusted raw GPS delta without filtering elevation changes at turn 4", battleScarLesson: "always cross-reference optical tracking with onboard gyro sensors" };
            drift = { sideNote: "(note: if you're parsing FastF1 speed traces on Python 3.12, make sure you enable feather caching or the API limits will throttle you during race weekends)", metrics: { p99: "312.4 km/h", memory: "1.84 G-force", cost: "0.24s delta", socketWatts: "118.4% engine mode" } };
            errata = (Math.random() < 0.25) ? { errataSnippet: "📌 **Update (3 days later):** The telemetry sensor calibration data from Free Practice 2 was revised for tire degradation, shifting the delta by 0.1s." } : null;`;
content = content.replace(sportsFind, sportsReplace);

const techFind = `cliExample = \`# Run p99 latency benchmark under 1,000 concurrent connections:\\npgbench -c 100 -j 8 -T 60 -P 5 -h localhost -U postgres db_benchmark\`;`;
const techReplace = techFind + `
            fail = { painfulMistake: "scaled connection pool to 800 under peak vector load, locking PostgreSQL WAL disk", battleScarLesson: "implemented bounded in-memory queues with query-level multiplexing" };
            drift = { sideNote: "(by the way, if you're running this on Ubuntu 24.04 with systemd-resolved, make sure you disable the stub listener or your internal DNS will randomly drop 2% of queries)", metrics: { p99: "842.3 ms", memory: "1.84 GB", cost: "$14.22/day", socketWatts: "14.2 W" } };
            errata = (Math.random() < 0.25) ? { errataSnippet: "📌 **Update (3 days later):** After the 2.4.1 hotfix landed last night, the proxy bypass rule in section 3 started throwing 502 Bad Gateway. Line 14 needs \\\`Host\\\` instead of \\\`X-Forwarded-Host\\\`. Updated below for anyone running the latest build." } : null;`;
content = content.replace(techFind, techReplace);

// 4. Update the 7 rules
const ruleFind = `7 NUCLEAR ANTI-AI RULES (MANDATORY):
1. COGNITIVE DRIFT: Include a brief parenthetical field warning: "\${drift.sideNote}".
2. NEGATIVE KNOWLEDGE: Confess a brief personal mistake you made in the past: "I once tried \${fail.painfulMistake}, which taught me that \${fail.battleScarLesson}."
3. DIRTY TELEMETRY: Use realistic unrounded metrics (\${drift.metrics.p99} p99 latency, \${drift.metrics.memory} RAM leak, \${drift.metrics.cost} cost delta).
4. CLI VERIFICATION: Provide this practical 1-line copyable verification command in section 1 or 2:
\`\`\`bash
\${cliExample}
\`\`\`
5. BURSTINESS: Vary sentence lengths dramatically (mix punchy 3-word sentences like "The fix is simple." with deep multi-clause architecture analysis).
6. STRICT CLICHE BANLIST: NEVER use "In conclusion", "To summarize", "In the fast-paced world of", "Delve into", "Tapestry", "Testament", "Revolutionary".
7. 4-STEP BLUEPRINT: Deliver (1) Raw Data Summary, (2) Comparison Matrix + Markdown Table, (3) Field Application, (4) Gotchas & Risks.`;

const ruleReplace = `7 NUCLEAR ANTI-AI RULES (MANDATORY):
WARNING: NEVER USE THE RULE NAMES ("Cognitive Drift", "Dirty Telemetry", "Negative Knowledge", "CLI Verification") AS MARKDOWN HEADINGS. Weave these elements naturally into your analytical paragraphs.
1. COGNITIVE DRIFT: Include a brief parenthetical field warning organically in a paragraph: "\${drift.sideNote}".
2. NEGATIVE KNOWLEDGE: Confess a brief personal mistake naturally in the prose: "I once tried \${fail.painfulMistake}, which taught me that \${fail.battleScarLesson}."
3. DIRTY TELEMETRY: Use realistic unrounded metrics in your text (\${drift.metrics.p99} p99 latency/utilization, \${drift.metrics.memory} memory/volume leak, \${drift.metrics.cost} cost delta).
4. CLI VERIFICATION: Provide this practical 1-line copyable verification command inside an early section organically:
\`\`\`bash
\${cliExample}
\`\`\`
5. BURSTINESS: Vary sentence lengths dramatically (mix punchy 3-word sentences like "The fix is simple." with deep multi-clause architecture analysis).
6. STRICT CLICHE BANLIST: NEVER use "In conclusion", "To summarize", "In the fast-paced world of", "Delve into", "Tapestry", "Testament", "Revolutionary".
7. 4-STEP BLUEPRINT: Deliver (1) Raw Data Summary, (2) Comparison Matrix + Markdown Table, (3) Field Application, (4) Gotchas & Risks. Ensure these are fluid sections, NOT strict robot headers.`;

content = content.replace(ruleFind, ruleReplace);

fs.writeFileSync('scripts/category_prompt_builder.mjs', content);
console.log("SUCCESS");
