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
async function fetchViralFinanceReddit() {
    console.log("Fetching Viral Finance Data from Reddit (Target: > 2,000 upvotes, This Month)...");
    const results = [];
    const subreddits = ['wallstreetbets', 'CryptoCurrency', 'RealEstate', 'investing', 'AirBnB'];
    
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
                            category: 'Finance',
                            title: item.title,
                            url: `https://www.reddit.com${item.permalink}`,
                            text: item.selftext || "",
                            score: item.score,
                            date: new Date(item.created_utc * 1000).toISOString()
                        });
                        count++;
                    }
                }
                console.log(`Found ${count} viral finance topics in r/${sub}.`);
            }
        } catch (e) {
            console.error(`Finance Error (r/${sub}):`, e.message);
        }
        await new Promise(r => setTimeout(r, 2000));
    }
    return results;
}

// 2. RSS Feeds (Google Trends, Zillow, etc.)
async function fetchFinanceRSS() {
    console.log("Fetching Viral Finance Data from RSS Feeds...");
    const results = [];
    const feeds = [
        { name: 'Google Trends (Business)', url: 'https://trends.google.com/trending/rss?geo=US' }
    ];

    for (const feed of feeds) {
        try {
            const feedData = await parser.parseURL(feed.url);
            let count = 0;
            for (const item of feedData.items) {
                // If it's Google Trends, filter for finance/business keywords just in case, or just take them all if we assume it's general trends
                results.push({
                    id: `rss_${Buffer.from(item.link || item.title).toString('base64').substring(0,15)}`,
                    source: feed.name,
                    category: 'Finance',
                    title: item.title,
                    url: item.link,
                    text: item.contentSnippet || item.content || "",
                    score: 5000, // RSS items are considered highly viral
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
    console.log("🧟 Avcı Bot (Finance / Real Estate) Başlatılıyor...");
    const pool = readPool();
    let initialCount = pool.length;

    const redditData = await fetchViralFinanceReddit();
    const rssData = await fetchFinanceRSS();
    
    const combinedData = [...redditData, ...rssData];

    for (const item of combinedData) {
        if (!isDuplicate(pool, item.id)) {
            pool.push(item);
        }
    }

    writePool(pool);
    console.log(`✅ Avcı Bot (Finance) tamamlandı. Havuza ${pool.length - initialCount} yeni viral konu eklendi. Toplam havuz: ${pool.length}/${MAX_POOL_SIZE}`);
    process.exit(0);
}

runScraper();
