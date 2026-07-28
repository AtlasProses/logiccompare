import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';

// Utilities
const POOL_FILE = path.join(process.cwd(), 'raw_data_pool.json');
const MAX_POOL_SIZE = 50000;
const parser = new Parser();

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
        const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const storyIds = await res.json();
        
        let count = 0;
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

// 2. Tech Giants RSS Scraper
async function fetchTechRSS() {
    console.log("Fetching Viral Tech Data from Tech Giants RSS Feeds...");
    const results = [];
    const feeds = [
        { name: 'Apple Developer News', url: 'https://developer.apple.com/news/rss/news.rss' },
        { name: 'Microsoft DevBlogs', url: 'https://devblogs.microsoft.com/feed/' },
        { name: 'Google Developers', url: 'https://developers.googleblog.com/feeds/posts/default?alt=rss' },
        { name: 'Docker Blog', url: 'https://www.docker.com/blog/feed/' },
        { name: 'GitHub Blog', url: 'https://github.blog/feed/' }
    ];

    for (const feed of feeds) {
        try {
            const feedData = await parser.parseURL(feed.url);
            let count = 0;
            for (const item of feedData.items) {
                results.push({
                    id: `rss_${Buffer.from(item.link || item.title).toString('base64').substring(0,15)}`,
                    source: feed.name,
                    category: 'Technology',
                    title: item.title,
                    url: item.link,
                    text: item.contentSnippet || item.content || "",
                    score: 5000, // Tech Giant official news is inherently viral
                    date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
                });
                count++;
            }
            console.log(`Found ${count} topics in ${feed.name}.`);
        } catch (e) {
            console.error(`RSS Error (${feed.name}):`, e.message);
        }
    }
    return results;
}

// 3. Semantic Scholar Scraper (> 1000 citations)
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
        const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=100&year=2020-&fields=title,url,abstract,citationCount,year`;
        
        const res = await fetch(url, { headers: { 'x-api-key': apiKey } });
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
                        date: `${paper.year}-01-01T00:00:00.000Z`
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
    const rssData = await fetchTechRSS();
    const s2Data = await fetchSemanticScholar();

    const combinedData = [...hnData, ...rssData, ...s2Data];

    for (const item of combinedData) {
        if (!isDuplicate(pool, item.id)) {
            pool.push(item);
        }
    }

    writePool(pool);
    console.log(`✅ Avcı Bot (Tech) tamamlandı. Havuza ${pool.length - initialCount} yeni viral konu eklendi. Toplam havuz: ${pool.length}/${MAX_POOL_SIZE}`);
    process.exit(0);
}

runScraper();
