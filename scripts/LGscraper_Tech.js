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

async function fetchHackerNewsTopViral() {
    console.log("Fetching Hacker News Viral Hits (Güncel 2026 Verileri, Points > 300)...");
    const results = [];
    try {
        // Son 2 aylık (yaklaşık 60 gün) çok popüler olan HN postlarını çeker. Temmuz 2026 hedeflidir.
        const SIXTY_DAYS_AGO = Math.floor(Date.now() / 1000) - (60 * 24 * 60 * 60);
        const res = await fetch(`https://hn.algolia.com/api/v1/search?query=&tags=story&numericFilters=created_at_i>${SIXTY_DAYS_AGO},points>300&hitsPerPage=20`);
        const data = await res.json();
        
        for (const item of data.hits) {
            if (results.length >= 10) break; // Her çalışmada 10 güncel veri çekilir

            const url = item.url;
            if (!url) continue;

            const pool = readPool(); // Read fresh in case of parallel execution
            const id = `tech_hn_2026_${item.objectID}`;
            if (isDuplicate(pool, id)) continue;

            const content = await fetchCleanContent(url);
            if (content) {
                const newArticle = {
                    id: id,
                    source: 'HackerNews_2026_Viral',
                    category: 'Technology',
                    title: content.title || item.title,
                    url: url,
                    text: content.text,
                    score: item.points,
                    date: item.created_at || new Date().toISOString()
                };
                pool.push(newArticle);
                writePool(pool);
                console.log(`[+] Added to pool: ${newArticle.title} (${newArticle.score} points)`);
                results.push(newArticle);
            }
        }
    } catch (e) {
        console.error("Hacker News Viral Error:", e.message);
    }
    return results;
}

async function runScraper() {
    console.log("🧟 Avcı Bot (Tech - Viral) Başlatılıyor...");
    await fetchHackerNewsTopViral();
    console.log("✅ Avcı Bot (Tech) tamamlandı.");
    process.exit(0);
}

runScraper();
