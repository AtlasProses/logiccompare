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

// 1. Gaming Scraper: SteamSpy (Free API) for Top 100 Most Played Games
async function fetchSteamSpy() {
    console.log("Fetching SteamSpy Data (Target: Top 100 games by player count)...");
    const results = [];
    try {
        const url = `https://steamspy.com/api.php?request=top100in2weeks`;
        const res = await fetch(url);
        const data = await res.json();
        
        for (const [appId, game] of Object.entries(data).slice(0, 5)) {
            const steamUrl = `https://store.steampowered.com/app/${appId}`;
            if (isUrlProcessed(steamUrl)) continue;

            const fullText = await fetchFromJina(steamUrl);
            if (fullText) {
                results.push({
                    id: `steam_${appId}`,
                    source: `Steam`,
                    category: 'Gaming',
                    title: `${game.name} - Trending on Steam`,
                    url: steamUrl,
                    text: `Developer: ${game.developer}, Publisher: ${game.publisher}. Owners: ${game.owners}\n\n${fullText}`,
                    score: game.ccu, 
                    date: new Date().toISOString()
                });
            }
        }
    } catch (e) {
        console.error("SteamSpy Error:", e.message);
    }
    return results;
}

// 2. Elite Gaming News RSS (IGN, GameSpot)
async function fetchGamingRSS() {
    console.log("Fetching Elite Gaming News (IGN, GameSpot)...");
    const results = [];
    const feeds = [
        { name: 'IGN', url: 'https://feeds.feedburner.com/ign/news' },
        { name: 'GameSpot', url: 'https://www.gamespot.com/feeds/news/' }
    ];

    for (const feed of feeds) {
        try {
            const feedData = await parser.parseURL(feed.url);
            for (const item of feedData.items.slice(0, 5)) {
                const url = item.link;
                if (isUrlProcessed(url)) continue;

                const fullText = await fetchFromJina(url);
                if (fullText) {
                    results.push({
                        id: `rss_${Buffer.from(url).toString('base64').substring(0,15)}`,
                        source: feed.name,
                        category: 'Gaming',
                        title: item.title,
                        url: url,
                        text: fullText,
                        score: 7000, 
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
    console.log("🧟 Avcı Bot (Gaming) Başlatılıyor...");
    const pool = readPool();
    let initialCount = pool.length;

    const steamData = await fetchSteamSpy();
    const rssData = await fetchGamingRSS();

    const combinedData = [...steamData, ...rssData];

    for (const item of combinedData) {
        if (!isDuplicate(pool, item.id)) {
            pool.push(item);
        }
    }

    writePool(pool);
    console.log(`✅ Avcı Bot (Gaming) tamamlandı. Havuza ${pool.length - initialCount} yeni viral konu eklendi. Toplam havuz: ${pool.length}/${MAX_POOL_SIZE}`);
    process.exit(0);
}

runScraper();
