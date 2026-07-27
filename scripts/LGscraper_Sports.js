import fs from 'fs';
import path from 'path';

const POOL_FILE = path.join(process.cwd(), 'raw_data_pool.json');
const MAX_POOL_SIZE = 50000;

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

// Sports Scraper: Reddit Top Posts (> 10,000 upvotes) for Viral Sports Events
async function fetchViralSports() {
    console.log("Fetching Viral Sports Data (Target: > 10,000 upvotes)...");
    const results = [];
    const subreddits = ['sports', 'soccer', 'nba', 'formula1'];
    
    for (const sub of subreddits) {
        try {
            const url = `https://www.reddit.com/r/${sub}/top.json?t=all&limit=25`;
            const res = await fetch(url, { headers: { 'User-Agent': 'LogicCompareBot/1.0' }});
            const data = await res.json();
            
            if (data.data && data.data.children) {
                let count = 0;
                for (const post of data.data.children) {
                    const item = post.data;
                    if (item.score >= 10000) {
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

async function runScraper() {
    console.log("🧟 Avcı Bot (Sports) Başlatılıyor...");
    const pool = readPool();
    let initialCount = pool.length;

    const sportsData = await fetchViralSports();
    for (const item of sportsData) {
        if (!isDuplicate(pool, item.id)) {
            pool.push(item);
        }
    }

    writePool(pool);
    console.log(`✅ Avcı Bot (Sports) tamamlandı. Havuza ${pool.length - initialCount} yeni viral konu eklendi. Toplam havuz: ${pool.length}/${MAX_POOL_SIZE}`);
}

runScraper();
