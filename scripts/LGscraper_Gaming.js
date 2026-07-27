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

// Gaming Scraper: SteamSpy (Free API) for Top 100 Most Played Games (> 1M players)
async function fetchSteamSpy() {
    console.log("Fetching SteamSpy Data (Target: Top 100 games by player count)...");
    const results = [];
    try {
        const url = `https://steamspy.com/api.php?request=top100in2weeks`;
        const res = await fetch(url);
        const data = await res.json();
        
        let count = 0;
        for (const [appId, game] of Object.entries(data)) {
            // SteamSpy returns owners as a string range e.g., "50,000,000 .. 100,000,000"
            // If it's in the top 100 in 2 weeks, it's definitely highly active.
            results.push({
                id: `steam_${appId}`,
                source: `Steam`,
                category: 'Gaming',
                title: game.name,
                url: `https://store.steampowered.com/app/${appId}`,
                text: `Developer: ${game.developer}, Publisher: ${game.publisher}. Owners: ${game.owners}`,
                score: game.ccu, // Peak concurrent users yesterday
                date: new Date().toISOString() // Current data timestamp
            });
            count++;
        }
        console.log(`Found ${count} highly active games via SteamSpy.`);
    } catch (e) {
        console.error("SteamSpy Error:", e.message);
    }
    return results;
}

// Gaming Scraper: RAWG API for Upcoming and Top Series (GTA, FIFA, etc.)
async function fetchRAWG() {
    console.log("Fetching RAWG Data (Target: Series and Highly Anticipated Games)...");
    const results = [];
    const apiKey = process.env.RAWG_API_KEY;
    if (!apiKey) {
        console.warn("No RAWG_API_KEY found, skipping RAWG.");
        return results;
    }
    
    try {
        // Fetch top rated games of 2020-2026
        const url = `https://api.rawg.io/api/games?key=${apiKey}&dates=2020-01-01,2026-12-31&ordering=-added&page_size=40`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.results) {
            let count = 0;
            for (const game of data.results) {
                // Ensure high added count as a proxy for "viral" (e.g., > 10000 users have it)
                if (game.added >= 1000) {
                    results.push({
                        id: `rawg_${game.id}`,
                        source: `RAWG`,
                        category: 'Gaming',
                        title: game.name,
                        url: `https://rawg.io/games/${game.slug}`,
                        text: `Released: ${game.released}, Rating: ${game.rating}/${game.rating_top}`,
                        score: game.added,
                        date: game.released ? `${game.released}T00:00:00.000Z` : new Date().toISOString()
                    });
                    count++;
                }
            }
            console.log(`Found ${count} highly anticipated/viral games via RAWG.`);
        }
    } catch (e) {
        console.error("RAWG Error:", e.message);
    }
    return results;
}

async function runScraper() {
    console.log("🧟 Avcı Bot (Gaming) Başlatılıyor...");
    const pool = readPool();
    let initialCount = pool.length;

    const steamData = await fetchSteamSpy();
    for (const item of steamData) {
        if (!isDuplicate(pool, item.id)) {
            pool.push(item);
        }
    }

    const rawgData = await fetchRAWG();
    for (const item of rawgData) {
        if (!isDuplicate(pool, item.id)) {
            pool.push(item);
        }
    }

    writePool(pool);
    console.log(`✅ Avcı Bot (Gaming) tamamlandı. Havuza ${pool.length - initialCount} yeni viral konu eklendi. Toplam havuz: ${pool.length}/${MAX_POOL_SIZE}`);
}

runScraper();
