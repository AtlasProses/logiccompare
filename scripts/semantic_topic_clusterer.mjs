import fs from 'fs';
import path from 'path';

/**
 * Semantic Topic Clusterer (Faz 1 & Karar 1 Revize)
 * -------------------------------------------------------------
 * Eliminates "Frankenstein" topic mashups completely.
 * Zero-Duplicate Shield: Prevents re-cooking previously published topics.
 */

const MICRO_TAXONOMY = {
    Technology: [
        { id: 'ai_llm_inference', keywords: ['llm', 'deepseek', 'llama', 'openai', 'gpt', 'inference', 'vllm', 'ollama', 'sglang', 'tensorrt', 'agent', 'prompt', 'rag', 'embedding', 'transformer', 'anthropic', 'claude', 'gemini'] },
        { id: 'databases_storage', keywords: ['database', 'postgres', 'postgresql', 'duckdb', 'mysql', 'mariadb', 'sqlite', 'redis', 'vector', 'pg_rust', 'distributed graph', 'kvarn', 'storage', 'query', 'sql', 'nosql', 'olap', 'oltp'] },
        { id: 'cloud_infrastructure', keywords: ['kubernetes', 'docker', 'cloud', 'aws', 'cloudflare', 'serverless', 'container', 'ci/cd', 'devops', 'infrastructure', 'oxide', 'edge', 'wasm', 'webassembly', 'linux', 'kernel'] },
        { id: 'programming_compilers', keywords: ['rust', 'python', 'typescript', 'golang', 'javascript', 'compiler', 'llvm', 'syntax', 'framework', 'runtime', 'bun', 'node', 'c++', 'zig'] },
        { id: 'frontend_frameworks', keywords: ['react', 'next.js', 'astro', 'vue', 'svelte', 'tailwind', 'css', 'shadcn', 'ui', 'components', 'frontend', 'dom'] },
        { id: 'cybersecurity_auth', keywords: ['security', 'vulnerability', 'cve', 'malware', 'zero trust', 'mcp', 'firewall', 'breach', 'encryption', 'auth', 'clerk', 'oauth', 'jwt'] }
    ],
    Finance: [
        { id: 'crypto_defi', keywords: ['bitcoin', 'btc', 'crypto', 'ethereum', 'solana', 'defi', 'stablecoin', 'token', 'blockchain', 'hyperliquid', 'derivatives', 'mining', 'wallet', 'etf', 'usd1'] },
        { id: 'macro_economy', keywords: ['inflation', 'interest rates', 'fed', 'treasury', 'yield', 'gdp', 'central bank', 'currency', 'liquidity', 'tariff', 'economic', 'bonds'] },
        { id: 'stock_markets_ipo', keywords: ['ipo', 'stocks', 'nasdaq', 'nyse', 'valuation', 'etf', 'earnings', 'sec', 'shares', 'private equity', 'unitree', 'dcf'] }
    ],
    Gaming: [
        { id: 'game_engines_graphics', keywords: ['unreal engine', 'unity', 'godot', 'graphics', 'ray tracing', 'fps', 'gpu', 'cpu', 'netcode', 'shader', 'performance', 'modding', 'hardware', 'nanite', 'dlss'] },
        { id: 'competitive_esports', keywords: ['cs2', 'counter-strike', 'dota 2', 'valorant', 'apex legends', 'tournament', 'esports', 'ranked', 'meta', 'balance patch'] },
        { id: 'rpg_action_games', keywords: ['elden ring', 'witcher', 'cyberpunk', 'hades', 'black myth', 'wukong', 'gta 6', 'helldivers', 'rust', 'gameplay', 'quest'] }
    ],
    Sports: [
        { id: 'motorsport_f1_indycar', keywords: ['f1', 'formula 1', 'verstappen', 'indycar', 'tsunoda', 'grand prix', 'red bull', 'ferrari', 'mclaren', 'honda', 'aerodynamics', 'pit stop', 'lap time', 'downforce'] },
        { id: 'football_soccer', keywords: ['football', 'soccer', 'premier league', 'chelsea', 'manchester city', 'leeds', 'cardiff', 'fifa', 'sterling', 'tactics', 'transfer', 'champions league'] },
        { id: 'basketball_nba', keywords: ['nba', 'knicks', 'lakers', 'celtics', 'playoffs', 'points', 'rebounds', 'towns', 'brunson', 'rotations'] },
        { id: 'athletics_olympics', keywords: ['olympics', 'sprint', 'athletics', '100m', 'marathon', 'medal', 'record', 'track and field', 'runner', 'biomechanics'] }
    ]
};

// Probability target distributions by category
const CATEGORY_DISTRIBUTIONS = {
    Technology: { single: 0.35, pair: 0.40, trio: 0.18, quad: 0.07 },
    Gaming:     { single: 0.40, pair: 0.45, trio: 0.15, quad: 0.00 },
    Finance:    { single: 0.80, pair: 0.20, trio: 0.00, quad: 0.00 },
    Sports:     { single: 0.85, pair: 0.15, trio: 0.00, quad: 0.00 }
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

export function detectMicroTaxonomy(item) {
    const category = item.category || 'Technology';
    const taxonomies = MICRO_TAXONOMY[category] || MICRO_TAXONOMY.Technology;
    const combinedText = `${item.title || ''} ${item.text || ''}`.toLowerCase();
    
    let bestTaxonomy = 'general_' + category.toLowerCase();
    let maxMatchCount = 0;

    for (const sub of taxonomies) {
        let matchCount = 0;
        for (const kw of sub.keywords) {
            if (combinedText.includes(kw)) {
                matchCount += (item.title?.toLowerCase().includes(kw) ? 3 : 1);
            }
        }
        if (matchCount > maxMatchCount) {
            maxMatchCount = matchCount;
            bestTaxonomy = sub.id;
        }
    }

    return { subDomain: bestTaxonomy, score: maxMatchCount };
}

export function calculateSimilarity(itemA, itemB) {
    if (itemA.category !== itemB.category) return 0;
    
    const subA = detectMicroTaxonomy(itemA);
    const subB = detectMicroTaxonomy(itemB);
    
    // Strict barrier: If different micro-taxonomies, incompatible
    if (subA.subDomain !== subB.subDomain) return 0;

    const tokensA = tokenize(`${itemA.title} ${itemA.text?.substring(0, 1000)}`);
    const tokensB = tokenize(`${itemB.title} ${itemB.text?.substring(0, 1000)}`);

    let intersection = 0;
    for (const t of tokensA) {
        if (tokensB.has(t)) intersection++;
    }
    const union = new Set([...tokensA, ...tokensB]).size;
    const jaccard = union > 0 ? (intersection / union) : 0;

    return 0.5 + (jaccard * 0.5);
}

function determineTargetMode(category) {
    const dist = CATEGORY_DISTRIBUTIONS[category] || CATEGORY_DISTRIBUTIONS.Technology;
    const r = Math.random();
    
    if (r < dist.single) return 1;
    if (r < dist.single + dist.pair) return 2;
    if (r < dist.single + dist.pair + dist.trio) return 3;
    return 4;
}

function getPublishedTopics() {
    const PUBLISHED_HISTORY_FILE = path.join(process.cwd(), 'published_history_topics.json');
    if (fs.existsSync(PUBLISHED_HISTORY_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(PUBLISHED_HISTORY_FILE, 'utf8'));
            if (Array.isArray(data)) return data;
        } catch (e) {}
    }
    return [];
}

/**
 * Main Clustering Function with Micro-Taxonomy & No-Force Graceful Degradation
 * @param {Array} pool - The raw data pool
 * @returns {Object} { selectedItems, articleMode, primaryCategory, remainingPool, isSingleTopic, entityCount }
 */
export function clusterNextArticleBatch(pool) {
    if (!pool || pool.length === 0) return null;

    const publishedHistory = getPublishedTopics();
    const publishedTitles = new Set(publishedHistory.map(p => (p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')));

    // Filter out items that have already been published
    const freshPool = pool.filter(item => {
        const itemClean = (item.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return itemClean.length > 5 && !publishedTitles.has(itemClean);
    });

    const activePool = freshPool.length > 0 ? freshPool : pool;

    const categories = ['Technology', 'Finance', 'Gaming', 'Sports'];
    const poolByCategory = {};
    for (const cat of categories) {
        poolByCategory[cat] = activePool.filter(i => (i.category || 'Technology') === cat);
    }

    const availableCategories = categories.filter(cat => (poolByCategory[cat]?.length || 0) > 0);
    if (availableCategories.length === 0) return null;
    
    const primaryCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    const categoryPool = poolByCategory[primaryCategory];

    // Determine target size based on probabilistic distribution
    const desiredSize = determineTargetMode(primaryCategory);

    // If target is 1 (Single Deep Dive), pick the richest item
    if (desiredSize === 1 || categoryPool.length < 2) {
        categoryPool.sort((a, b) => (b.text?.length || 0) - (a.text?.length || 0));
        const singleItem = categoryPool[0];
        const remainingPool = pool.filter(x => x.id !== singleItem.id);
        return {
            selectedItems: [singleItem],
            articleMode: 'Single-Topic Exhaustive Deep Dive & Benchmark Analysis',
            primaryCategory,
            remainingPool,
            isSingleTopic: true,
            entityCount: 1
        };
    }

    // Try finding clusters matching desiredSize (4, 3, or 2)
    for (let i = 0; i < categoryPool.length; i++) {
        const itemA = categoryPool[i];
        const candidates = [];

        for (let j = 0; j < categoryPool.length; j++) {
            if (i === j) continue;
            const itemB = categoryPool[j];
            const sim = calculateSimilarity(itemA, itemB);
            if (sim >= 0.50) {
                candidates.push({ item: itemB, sim });
            }
        }

        candidates.sort((a, b) => b.sim - a.sim);

        // Try Quad if requested and enough high-similarity candidates exist
        if (desiredSize === 4 && candidates.length >= 3 && candidates[2].sim >= 0.52) {
            const selectedItems = [itemA, candidates[0].item, candidates[1].item, candidates[2].item];
            const selectedIds = new Set(selectedItems.map(x => x.id));
            const remainingPool = pool.filter(x => !selectedIds.has(x.id));
            return {
                selectedItems,
                articleMode: '4-Way Quad-Matrix Ecosystem Benchmark (A vs B vs C vs D)',
                primaryCategory,
                remainingPool,
                isSingleTopic: false,
                entityCount: 4
            };
        }

        // Try Trio if requested (or fallback from Quad)
        if ((desiredSize === 3 || desiredSize === 4) && candidates.length >= 2 && candidates[1].sim >= 0.52) {
            const selectedItems = [itemA, candidates[0].item, candidates[1].item];
            const selectedIds = new Set(selectedItems.map(x => x.id));
            const remainingPool = pool.filter(x => !selectedIds.has(x.id));
            return {
                selectedItems,
                articleMode: '3-Way Tri-Matrix Ecosystem Benchmark (A vs B vs C)',
                primaryCategory,
                remainingPool,
                isSingleTopic: false,
                entityCount: 3
            };
        }

        // Try Pair (or fallback from Trio/Quad)
        if (candidates.length >= 1) {
            const selectedItems = [itemA, candidates[0].item];
            const selectedIds = new Set(selectedItems.map(x => x.id));
            const remainingPool = pool.filter(x => !selectedIds.has(x.id));
            return {
                selectedItems,
                articleMode: 'Head-to-Head Comparative Synthesis (A vs B)',
                primaryCategory,
                remainingPool,
                isSingleTopic: false,
                entityCount: 2
            };
        }
    }

    // No natural pair found -> Clean fallback to Single Deep Dive
    categoryPool.sort((a, b) => (b.text?.length || 0) - (a.text?.length || 0));
    const singleItem = categoryPool[0];
    const remainingPool = pool.filter(x => x.id !== singleItem.id);
    return {
        selectedItems: [singleItem],
        articleMode: 'Single-Topic Exhaustive Deep Dive & Benchmark Analysis',
        primaryCategory,
        remainingPool,
        isSingleTopic: true,
        entityCount: 1
    };
}
