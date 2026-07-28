import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import { fetchFromJina, isUrlProcessed } from './jina_utils.js';

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

// 1. Hacker News Scraper
async function fetchHackerNews() {
    console.log("Fetching Hacker News (Target: > 1000 upvotes)...");
    const results = [];
    try {
        const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const storyIds = await res.json();
        
        for (const id of storyIds.slice(0, 50)) {
            const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            const item = await itemRes.json();
            
            if (item && item.score && item.score >= 500 && item.type === 'story') {
                const url = item.url || `https://news.ycombinator.com/item?id=${id}`;
                if (isUrlProcessed(url)) continue;

                const fullText = await fetchFromJina(url);
                if (fullText) {
                    results.push({
                        id: `hn_${id}`,
                        source: 'HackerNews',
                        category: 'Technology',
                        title: item.title,
                        url: url,
                        text: fullText,
                        score: item.score,
                        date: new Date(item.time * 1000).toISOString()
                    });
                }
            }
        }
    } catch (e) {
        console.error("Hacker News Error:", e.message);
    }
    return results;
}

// 2. Tech Giants RSS Scraper
async function fetchTechRSS() {
    console.log("Fetching Tech Giants RSS Feeds...");
    const results = [];
    const feeds = [
        { name: 'Apple Developer', url: 'https://developer.apple.com/news/rss/news.rss' },
        { name: 'Microsoft DevBlogs', url: 'https://devblogs.microsoft.com/feed/' },
        { name: 'Google Developers', url: 'https://developers.googleblog.com/feeds/posts/default?alt=rss' },
        { name: 'Docker Blog', url: 'https://www.docker.com/blog/feed/' },
        { name: 'GitHub Blog', url: 'https://github.blog/feed/' }
    ];

    for (const feed of feeds) {
        try {
            const feedData = await parser.parseURL(feed.url);
            for (const item of feedData.items.slice(0, 5)) { // Top 5 per feed to save time
                if (isUrlProcessed(item.link)) continue;

                const fullText = await fetchFromJina(item.link);
                if (fullText) {
                    results.push({
                        id: `rss_${Buffer.from(item.link).toString('base64').substring(0,15)}`,
                        source: feed.name,
                        category: 'Technology',
                        title: item.title,
                        url: item.link,
                        text: fullText,
                        score: 5000,
                        date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
                    });
                }
            }
        } catch (e) {
            console.error(`RSS Error (${feed.name}):`, e.message);
        }
    }
    return results;
}

// 3. arXiv (AI & Computer Science) Scraper
async function fetchArxiv() {
    console.log("Fetching arXiv (Computer Science & AI)...");
    const results = [];
    try {
        // Fetch 5 latest AI papers from arXiv API
        const url = 'http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=5';
        const res = await fetch(url);
        const xml = await res.text();
        
        // Very basic XML extraction for demo, ideally we parse XML properly
        // But rss-parser can handle Atom feeds!
        const parsedData = await parser.parseString(xml);
        
        for (const item of parsedData.items) {
            if (isUrlProcessed(item.link)) continue;

            const fullText = await fetchFromJina(item.link);
            if (fullText) {
                results.push({
                    id: `arxiv_${Buffer.from(item.link).toString('base64').substring(0,15)}`,
                    source: 'arXiv',
                    category: 'Technology',
                    title: item.title,
                    url: item.link,
                    text: fullText,
                    score: 9000,
                    date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
                });
            }
        }
    } catch (e) {
        console.error("arXiv Error:", e.message);
    }
    return results;
}

// 4. GitHub Trending Scraper
async function fetchGitHubTrending() {
    console.log("Fetching GitHub Trending...");
    const results = [];
    const url = "https://github.com/trending";
    
    if (isUrlProcessed(url)) return results;

    const fullText = await fetchFromJina(url);
    if (fullText) {
        results.push({
            id: `github_trending_${new Date().toISOString().split('T')[0]}`,
            source: 'GitHub',
            category: 'Technology',
            title: `GitHub Trending Repositories - ${new Date().toISOString().split('T')[0]}`,
            url: url,
            text: fullText,
            score: 10000,
            date: new Date().toISOString()
        });
    }
    return results;
}

async function runScraper() {
    console.log("🧟 Avcı Bot (Tech) Başlatılıyor...");
    const pool = readPool();
    let initialCount = pool.length;

    const s1 = await fetchGitHubTrending();
    const s2 = await fetchArxiv();
    const s3 = await fetchTechRSS();
    const s4 = await fetchHackerNews();

    const combinedData = [...s1, ...s2, ...s3, ...s4];

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
