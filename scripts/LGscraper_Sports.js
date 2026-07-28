import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';

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

// 1. Reddit Top Posts (Score >= 2000, t=month)
async function fetchViralSportsReddit() {
    console.log("Fetching Viral Sports Data from Reddit (Target: > 2,000 upvotes, This Month)...");
    const results = [];
    const subreddits = ['sports', 'soccer', 'nba', 'formula1'];
    
    for (const sub of subreddits) {
        try {
            const url = `https://www.reddit.com/r/${sub}/top.json?t=month&limit=30`;
            const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 LogicCompareBot/2.0' }});
            const data = await res.json();
            
            if (data.data && data.data.children) {
                let count = 0;
                for (const post of data.data.children) {
                    const item = post.data;
                    if (item.score >= 2000) { // Lowered from 10000 to 2000
                        results.push({
                            id: `reddit_${item.id}`,
                            source: `Reddit (r/${sub})`,
                            category: 'Sports',
                            title: item.title,
                            url: `https://www.reddit.com${item.permalink}`,
                            text: item.selftext || "",
                            score: item.score,
                            date: new Date(item.created_utc * 1000).toISOString()
                        });
                        count++;
                    }
                }
                console.log(`Found ${count} viral sports topics in r/${sub}.`);
            }
        } catch (e) {
            console.error(`Sports Error (r/${sub}):`, e.message);
        }
        await new Promise(r => setTimeout(r, 2000));
    }
    return results;
}

// 2. RSS Feeds (ESPN, SkySports, Google Trends)
async function fetchSportsRSS() {
    console.log("Fetching Viral Sports Data from RSS Feeds...");
    const results = [];
    const feeds = [
        { name: 'ESPN Top News', url: 'https://www.espn.com/espn/rss/news' },
        { name: 'SkySports News', url: 'https://www.skysports.com/rss/12040' }
    ];

    for (const feed of feeds) {
        try {
            const feedData = await parser.parseURL(feed.url);
            let count = 0;
            for (const item of feedData.items) {
                results.push({
                    id: `rss_${Buffer.from(item.link || item.title).toString('base64').substring(0,15)}`,
                    source: feed.name,
                    category: 'Sports',
                    title: item.title,
                    url: item.link,
                    text: item.contentSnippet || item.content || "",
                    score: 5000, 
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

async function runScraper() {
    console.log("🧟 Avcı Bot (Sports) Başlatılıyor...");
    const pool = readPool();
    let initialCount = pool.length;

    const redditData = await fetchViralSportsReddit();
    const rssData = await fetchSportsRSS();
    
    const combinedData = [...redditData, ...rssData];

    for (const item of combinedData) {
        if (!isDuplicate(pool, item.id)) {
            pool.push(item);
        }
    }

    writePool(pool);
    console.log(`✅ Avcı Bot (Sports) tamamlandı. Havuza ${pool.length - initialCount} yeni viral konu eklendi. Toplam havuz: ${pool.length}/${MAX_POOL_SIZE}`);
    process.exit(0);
}

runScraper();
