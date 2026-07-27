import fs from 'fs';
import path from 'path';

// Utilities
const POOL_FILE = path.join(process.cwd(), 'raw_data_pool.json');
const MAX_POOL_SIZE = 50000;

function readPool() {
    if (fs.existsSync(POOL_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(POOL_FILE, 'utf8'));
        } catch (e) {
            return [];
        }
    }
    return [];
}

function writePool(data) {
    if (data.length > MAX_POOL_SIZE) {
        // FIFO: keep the newest, remove oldest
        data = data.slice(data.length - MAX_POOL_SIZE);
    }
    fs.writeFileSync(POOL_FILE, JSON.stringify(data, null, 2));
}

function isDuplicate(pool, id) {
    return pool.some(item => item.id === id);
}

// 1. Hacker News Scraper (> 1000 upvotes)
async function fetchHackerNews() {
    console.log("Fetching Hacker News (Target: > 1000 upvotes)...");
    const results = [];
    try {
        // Get top 500 stories
        const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const storyIds = await res.json();
        
        let count = 0;
        // Limit to 80% or reasonable chunk to prevent rate limits
        for (const id of storyIds.slice(0, 100)) {
            const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            const item = await itemRes.json();
            
            if (item && item.score && item.score >= 1000 && item.type === 'story') {
                results.push({
                    id: `hn_${id}`,
                    source: 'HackerNews',
                    category: 'Technology',
                    title: item.title,
                    url: item.url || `https://news.ycombinator.com/item?id=${id}`,
                    text: item.text || "",
                    score: item.score,
                    date: new Date(item.time * 1000).toISOString()
                });
                count++;
            }
        }
        console.log(`Found ${count} HN stories with > 1000 upvotes in the top 100.`);
    } catch (e) {
        console.error("Hacker News Error:", e.message);
    }
    return results;
}

// 2. Semantic Scholar Scraper (> 1000 citations)
async function fetchSemanticScholar() {
    console.log("Fetching Semantic Scholar (Target: > 1000 citations)...");
    const results = [];
    const apiKey = process.env.S2_API_KEY;
    
    if (!apiKey) {
        console.warn("No S2_API_KEY found, skipping Semantic Scholar.");
        return results;
    }

    try {
        const query = "artificial intelligence OR machine learning OR cybersecurity OR saas";
        // Query papers from 2020 onwards
        const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=100&year=2020-&fields=title,url,abstract,citationCount,year`;
        
        const res = await fetch(url, {
            headers: {
                'x-api-key': apiKey
            }
        });
        const data = await res.json();
        
        if (data.data) {
            let count = 0;
            for (const paper of data.data) {
                if (paper.citationCount >= 1000) {
                    results.push({
                        id: `s2_${paper.paperId}`,
                        source: 'SemanticScholar',
                        category: 'Technology',
                        title: paper.title,
                        url: paper.url,
                        text: paper.abstract || "",
                        score: paper.citationCount,
                        date: `${paper.year}-01-01T00:00:00.000Z` // Approx date
                    });
                    count++;
                }
            }
            console.log(`Found ${count} Semantic Scholar papers with > 1000 citations.`);
        }
    } catch (e) {
        console.error("Semantic Scholar Error:", e.message);
    }
    return results;
}

async function runScraper() {
    console.log("🧟 Avcı Bot (Tech) Başlatılıyor...");
    const pool = readPool();
    let initialCount = pool.length;

    const hnData = await fetchHackerNews();
    for (const item of hnData) {
        if (!isDuplicate(pool, item.id)) {
            pool.push(item);
        }
    }

    const s2Data = await fetchSemanticScholar();
    for (const item of s2Data) {
        if (!isDuplicate(pool, item.id)) {
            pool.push(item);
        }
    }

    writePool(pool);
    console.log(`✅ Avcı Bot (Tech) tamamlandı. Havuza ${pool.length - initialCount} yeni viral konu eklendi. Toplam havuz: ${pool.length}/${MAX_POOL_SIZE}`);
}

runScraper();
