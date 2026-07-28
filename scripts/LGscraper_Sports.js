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

// RSS Feeds (BBC Sport, Yahoo Sports, Sky Sports)
async function fetchSportsRSS() {
    console.log("Fetching Viral Sports Data from Elite RSS Feeds...");
    const results = [];
    const feeds = [
        { name: 'Yahoo Sports', url: 'https://sports.yahoo.com/rss/' },
        { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/rss.xml' },
        { name: 'SkySports News', url: 'https://www.skysports.com/rss/12040' }
    ];

    for (const feed of feeds) {
        try {
            const feedData = await parser.parseURL(feed.url);
            for (const item of feedData.items.slice(0, 5)) { // Top 5 per feed to save time
                const url = item.link;
                if (isUrlProcessed(url)) continue;

                const fullText = await fetchFromJina(url);
                if (fullText) {
                    results.push({
                        id: `rss_${Buffer.from(url).toString('base64').substring(0,15)}`,
                        source: feed.name,
                        category: 'Sports',
                        title: item.title,
                        url: url,
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

async function runScraper() {
    console.log("🧟 Avcı Bot (Sports) Başlatılıyor...");
    const pool = readPool();
    let initialCount = pool.length;

    const rssData = await fetchSportsRSS();
    
    for (const item of rssData) {
        if (!isDuplicate(pool, item.id)) {
            pool.push(item);
        }
    }

    writePool(pool);
    console.log(`✅ Avcı Bot (Sports) tamamlandı. Havuza ${pool.length - initialCount} yeni viral konu eklendi. Toplam havuz: ${pool.length}/${MAX_POOL_SIZE}`);
    process.exit(0);
}

runScraper();
