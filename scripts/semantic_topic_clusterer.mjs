/**
 * Semantic Topic Clusterer (Faz 1)
 * -------------------------------------------------------------
 * Eliminates "Frankenstein" topic mashups.
 * Analyzes raw data pool items and clusters them by:
 * 1. Sub-domain taxonomy & keyword similarity (Natural A vs B or A vs B vs C)
 * 2. Or single-subject deep dive when no natural comparative peer exists.
 */

// Sub-domain taxonomy mapping for high-precision semantic grouping
const SUB_DOMAIN_TAXONOMY = {
    Technology: [
        { id: 'ai_llm', keywords: ['llm', 'deepseek', 'llama', 'openai', 'gpt', 'model', 'inference', 'vllm', 'agent', 'prompt', 'rag', 'embedding', 'transformer', 'neural', 'anthropic', 'claude', 'gemini'] },
        { id: 'cloud_devops', keywords: ['kubernetes', 'docker', 'cloud', 'aws', 'cloudflare', 'serverless', 'container', 'ci/cd', 'devops', 'infrastructure', 'oxide', 'edge', 'wasm', 'webassembly'] },
        { id: 'databases', keywords: ['database', 'postgres', 'postgresql', 'sql', 'nosql', 'redis', 'vector', 'pg_rust', 'distributed graph', 'kvarn', 'storage', 'query'] },
        { id: 'programming_languages', keywords: ['rust', 'python', 'typescript', 'golang', 'javascript', 'compiler', 'syntax', 'framework', 'runtime', 'bun', 'node'] },
        { id: 'cybersecurity', keywords: ['security', 'vulnerability', 'cve', 'malware', 'zero trust', 'mcp', 'firewall', 'breach', 'encryption', 'auth', 'clerk'] }
    ],
    Finance: [
        { id: 'crypto_defi', keywords: ['bitcoin', 'btc', 'crypto', 'ethereum', 'solana', 'defi', 'stablecoin', 'token', 'blockchain', 'hyperliquid', 'derivatives', 'mining', 'wallet'] },
        { id: 'macro_economy', keywords: ['inflation', 'interest rates', 'fed', 'treasury', 'yield', 'gdp', 'central bank', 'currency', 'liquidity', 'tariff', 'economic'] },
        { id: 'stock_markets_ipo', keywords: ['ipo', 'stocks', 'nasdaq', 'nyse', 'valuation', 'etf', 'earnings', 'sec', 'shares', 'private equity', 'unitree'] }
    ],
    Gaming: [
        { id: 'game_tech_engines', keywords: ['unreal engine', 'unity', 'graphics', 'ray tracing', 'fps', 'gpu', 'cpu', 'netcode', 'shader', 'performance', 'modding', 'hardware'] },
        { id: 'competitive_esports', keywords: ['cs2', 'counter-strike', 'dota 2', 'apex legends', 'tournament', 'esports', 'ranked', 'meta', 'balance patch'] },
        { id: 'rpg_action_games', keywords: ['elden ring', 'witcher', 'cyberpunk', 'hades', 'black myth', 'wukong', 'gta 6', 'helldivers', 'rust', 'gameplay', 'quest'] }
    ],
    Sports: [
        { id: 'motorsport', keywords: ['f1', 'formula 1', 'verstappen', 'indycar', 'tsunoda', 'grand prix', 'red bull', 'ferrari', 'mclaren', 'honda', 'aerodynamics', 'pit stop', 'lap time'] },
        { id: 'football_soccer', keywords: ['football', 'soccer', 'premier league', 'chelsea', 'manchester city', 'leeds', 'cardiff', 'fifa', 'sterling', 'tactics', 'transfer'] },
        { id: 'basketball', keywords: ['nba', 'knicks', 'lakers', 'celtics', 'playoffs', 'points', 'rebounds', 'towns', 'brunson', 'rotations'] },
        { id: 'athletics_olympics', keywords: ['olympics', 'sprint', 'athletics', '100m', 'marathon', 'medal', 'record', 'track and field', 'runner', 'biomechanics'] }
    ]
};

function tokenize(text) {
    if (!text) return new Set();
    return new Set(
        text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2)
    );
}

function detectSubDomain(item) {
    const category = item.category || 'Technology';
    const taxonomies = SUB_DOMAIN_TAXONOMY[category] || SUB_DOMAIN_TAXONOMY.Technology;
    const combinedText = `${item.title || ''} ${item.text || ''}`.toLowerCase();
    
    let bestSubDomain = 'general_' + category.toLowerCase();
    let maxMatchCount = 0;

    for (const sub of taxonomies) {
        let matchCount = 0;
        for (const kw of sub.keywords) {
            if (combinedText.includes(kw)) {
                matchCount += (item.title.toLowerCase().includes(kw) ? 3 : 1);
            }
        }
        if (matchCount > maxMatchCount) {
            maxMatchCount = matchCount;
            bestSubDomain = sub.id;
        }
    }

    return { subDomain: bestSubDomain, score: maxMatchCount };
}

function calculateSimilarity(itemA, itemB) {
    if (itemA.category !== itemB.category) return 0;
    
    const subA = detectSubDomain(itemA);
    const subB = detectSubDomain(itemB);
    
    // If different sub-domains, zero compatibility (prevents Knicks + F1 mashups)
    if (subA.subDomain !== subB.subDomain) return 0;

    const tokensA = tokenize(`${itemA.title} ${itemA.text?.substring(0, 1000)}`);
    const tokensB = tokenize(`${itemB.title} ${itemB.text?.substring(0, 1000)}`);

    let intersection = 0;
    for (const t of tokensA) {
        if (tokensB.has(t)) intersection++;
    }
    const union = new Set([...tokensA, ...tokensB]).size;
    const jaccard = union > 0 ? (intersection / union) : 0;

    // Bonus for sharing exact sub-domain
    return 0.5 + (jaccard * 0.5);
}

/**
 * Main Clustering Function
 * @param {Array} pool - The raw data pool
 * @returns {Object} { selectedItems, articleMode, primaryCategory, remainingPool }
 */
export function clusterNextArticleBatch(pool) {
    if (!pool || pool.length === 0) return null;

    // Categorize pool
    const categories = ['Technology', 'Finance', 'Gaming', 'Sports'];
    const poolByCategory = {};
    for (const cat of categories) {
        poolByCategory[cat] = pool.filter(i => (i.category || 'Technology') === cat);
    }

    // Pick category with most items or random available
    const availableCategories = categories.filter(cat => (poolByCategory[cat]?.length || 0) > 0);
    if (availableCategories.length === 0) return null;
    
    const primaryCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    const categoryPool = poolByCategory[primaryCategory];

    // Try finding 2 or 3 items that share the exact same sub-domain
    for (let i = 0; i < categoryPool.length; i++) {
        const itemA = categoryPool[i];
        const candidates = [];

        for (let j = i + 1; j < categoryPool.length; j++) {
            const itemB = categoryPool[j];
            const sim = calculateSimilarity(itemA, itemB);
            if (sim >= 0.50) {
                candidates.push({ item: itemB, sim });
            }
        }

        // Mode: Natural 2-Entity Head-to-Head
        if (candidates.length >= 1) {
            candidates.sort((a, b) => b.sim - a.sim);
            
            // Check for 3-way if high similarity
            if (candidates.length >= 2 && candidates[1].sim >= 0.55 && Math.random() < 0.25) {
                const selectedItems = [itemA, candidates[0].item, candidates[1].item];
                const selectedIds = new Set(selectedItems.map(x => x.id));
                const remainingPool = pool.filter(x => !selectedIds.has(x.id));
                return {
                    selectedItems,
                    articleMode: '3-Way Tri-Matrix Ecosystem Benchmark (A vs B vs C)',
                    primaryCategory,
                    remainingPool,
                    isSingleTopic: false
                };
            }

            const selectedItems = [itemA, candidates[0].item];
            const selectedIds = new Set(selectedItems.map(x => x.id));
            const remainingPool = pool.filter(x => !selectedIds.has(x.id));
            return {
                selectedItems,
                articleMode: 'Head-to-Head Comparative Synthesis (A vs B)',
                primaryCategory,
                remainingPool,
                isSingleTopic: false
            };
        }
    }

    // If no natural pairing exists in pool: SINGLE-TOPIC DEEP DIVE (60% standard)
    // Select the richest item (longest text/deepest context)
    categoryPool.sort((a, b) => (b.text?.length || 0) - (a.text?.length || 0));
    const singleItem = categoryPool[0];
    const remainingPool = pool.filter(x => x.id !== singleItem.id);

    return {
        selectedItems: [singleItem],
        articleMode: 'Single-Subject Exhaustive Deep Dive & Benchmark Analysis',
        primaryCategory,
        remainingPool,
        isSingleTopic: true
    };
}
