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

// RSS Feeds (Yahoo Finance, CoinDesk, CoinTelegraph, Reuters, Bloomberg alternative, etc.)
async function fetchFinanceRSS() {
    console.log("Fetching Viral Finance, Crypto, and Real Estate Data from Elite RSS Feeds...");
    const results = [];
    const feeds = [
        { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex' },
        { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
        { name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss' },
        { name: 'Investing.com', url: 'https://www.investing.com/rss/news_25.rss' },
        { name: 'Reuters Finance', url: 'https://www.reutersagency.com/feed/?best-topics=business-finance' },
        { name: 'CNBC Finance', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664' } // Top-tier alternative to Bloomberg
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
                        category: 'Finance',
                        title: item.title,
                        url: url,
                        text: fullText,
                        score: 8000, 
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
    console.log("🧟 Avcı Bot (Finance) Başlatılıyor...");
    const pool = readPool();
    let initialCount = pool.length;

    const rssData = await fetchFinanceRSS();
    
    for (const item of rssData) {
        if (!isDuplicate(pool, item.id)) {
            pool.push(item);
        }
    }

    writePool(pool);
    console.log(`✅ Avcı Bot (Finance) tamamlandı. Havuza ${pool.length - initialCount} yeni viral konu eklendi. Toplam havuz: ${pool.length}/${MAX_POOL_SIZE}`);
    process.exit(0);
}

runScraper();
