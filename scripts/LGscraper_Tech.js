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
    console.log("Fetching Hacker News Viral Hits (JAN 2020 TEST, Points > 1000)...");
    const results = [];
    try {
        // Algolia API for HN: >1000 points, between Jan 1 2020 and Jan 31 2020
        const res = await fetch('https://hn.algolia.com/api/v1/search?query=&tags=story&numericFilters=created_at_i>1577836800,created_at_i<1580515200,points>1000&hitsPerPage=20');
        const data = await res.json();
        
        for (const item of data.hits) {
            if (results.length >= 10) break; // Sadece 10 test verisi

            const url = item.url;
            if (!url) continue;

            const pool = readPool(); // Read fresh in case of parallel execution
            const id = `tech_hn_jan2020_${item.objectID}`;
            if (isDuplicate(pool, id)) continue;

            const content = await fetchCleanContent(url);
            if (content) {
                const newArticle = {
                    id: id,
                    source: 'HackerNews_Jan2020_Viral',
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
