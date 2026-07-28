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

// Reddit block removed (blocked by 429 errors).

// 2. RSS Feeds (Yahoo Finance, CoinDesk, CoinTelegraph, Redfin, etc.)
async function fetchFinanceRSS() {
    console.log("Fetching Viral Finance, Crypto, and Real Estate Data from RSS Feeds...");
    const results = [];
    const feeds = [
        { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex' },
        { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
        { name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss' },
        { name: 'Investing.com', url: 'https://www.investing.com/rss/news_25.rss' }
    ];

    for (const feed of feeds) {
        try {
            const feedData = await parser.parseURL(feed.url);
            let count = 0;
            for (const item of feedData.items) {
                results.push({
                    id: `rss_${Buffer.from(item.link || item.title).toString('base64').substring(0,15)}`,
                    source: feed.name,
                    category: 'Finance',
                    title: item.title,
                    url: item.link,
                    text: item.contentSnippet || item.content || item.title || "",
                    score: 5000, // RSS items are considered highly viral/authoritative
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

    const rssData = await fetchFinanceRSS();
    
    const combinedData = [...rssData];

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
