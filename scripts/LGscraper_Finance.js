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

// Finance Scraper: Reddit Top Posts (> 10,000 upvotes) for Viral Financial Events
async function fetchViralFinance() {
    console.log("Fetching Viral Finance Data (Target: > 10,000 upvotes)...");
    const results = [];
    const subreddits = ['wallstreetbets', 'CryptoCurrency', 'RealEstate', 'investing'];
    
    for (const sub of subreddits) {
        try {
            // Using top of all time/year to get the most viral events (GME squeeze, Crypto crashes, Real Estate bubbles)
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
        // Small delay to respect ratelimits
        await new Promise(r => setTimeout(r, 2000));
    }
    return results;
}

async function runScraper() {
    console.log("🧟 Avcı Bot (Finance) Başlatılıyor...");
    const pool = readPool();
    let initialCount = pool.length;

    const financeData = await fetchViralFinance();
    for (const item of financeData) {
        if (!isDuplicate(pool, item.id)) {
            pool.push(item);
        }
    }

    writePool(pool);
    console.log(`✅ Avcı Bot (Finance) tamamlandı. Havuza ${pool.length - initialCount} yeni viral konu eklendi. Toplam havuz: ${pool.length}/${MAX_POOL_SIZE}`);
}

runScraper();
