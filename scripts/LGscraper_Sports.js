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

// 2. RSS Feeds (BBC Sport, Yahoo Sports, Sky Sports)
async function fetchSportsRSS() {
    console.log("Fetching Viral Sports Data from RSS Feeds...");
    const results = [];
    const feeds = [
        { name: 'Yahoo Sports', url: 'https://sports.yahoo.com/rss/' },
        { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/rss.xml' },
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
                    text: item.contentSnippet || item.content || item.title || "",
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

    const rssData = await fetchSportsRSS();
    
    const combinedData = [...rssData];

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
