import fs from 'fs';
import path from 'path';
import { fetchCleanContent } from './clean_scraper.mjs';

const POOL_FILE = path.join(process.cwd(), 'raw_data_pool.json');
const MAX_POOL_SIZE = 50000;

function readPool() {
    if (fs.existsSync(POOL_FILE)) {
        try { return JSON.parse(fs.readFileSync(POOL_FILE, 'utf8')); } catch (e) { return []; }
    }
    return [];
}

function writePool(data) {
    if (data.length > MAX_POOL_SIZE) data = data.slice(data.length - MAX_POOL_SIZE);
    fs.writeFileSync(POOL_FILE, JSON.stringify(data, null, 2));
}

function isDuplicate(pool, id) {
    return pool.some(item => item.id === id);
}

async function fetchRedditViral(subreddit, maxLimit) {
    console.log(`Fetching Reddit /r/${subreddit} Viral Hits...`);
    const results = [];
    try {
        const res = await fetch(`https://www.reddit.com/r/${subreddit}/top.json?t=all&limit=25`);
        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        
        for (const child of data.data.children) {
            if (results.length >= maxLimit) break;

            const item = child.data;
            const url = item.url;
            if (!url || url.includes('reddit.com') || url.includes('v.redd.it') || url.includes('i.redd.it')) continue;

            const pool = readPool();
            const id = `spo_reddit_2026_${item.id}`;
            if (isDuplicate(pool, id)) continue;

            const content = await fetchCleanContent(url);
            if (content) {
                const newArticle = {
                    id: id,
                    source: `Reddit_${subreddit}_2026`,
                    category: 'Sports',
                    title: content.title || item.title,
                    url: url,
                    text: content.text,
                    score: item.ups,
                    date: new Date(item.created_utc * 1000).toISOString()
                };
                pool.push(newArticle);
                writePool(pool);
                console.log(`[+] Added to pool: ${newArticle.title} (${newArticle.score} upvotes)`);
                results.push(newArticle);
            }
        }
    } catch (e) {
        console.error(`Reddit ${subreddit} Viral Error:`, e.message);
    }
    return results;
}

async function runScraper() {
    console.log("🧟 Avcı Bot (Sports) Başlatılıyor...");
    await fetchRedditViral('sports', 4);
    await fetchRedditViral('nba', 3);
    await fetchRedditViral('soccer', 3);
    console.log("✅ Avcı Bot (Sports) tamamlandı.");
    process.exit(0);
}

runScraper();
