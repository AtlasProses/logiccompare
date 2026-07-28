import fs from 'fs';
import path from 'path';

const POOL_FILE = path.join(process.cwd(), 'raw_data_pool.json');

const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
];
const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

async function fetchFromJina(url) {
    try {
        const jinaUrl = `https://r.jina.ai/${url}`;
        const headers = {
            "User-Agent": getRandomUserAgent(),
            "Accept-Language": "en-US,en;q=0.9"
        };
        const res = await fetch(jinaUrl, { headers });
        if (!res.ok) return null;
        
        let text = await res.text();
        
        // Temizleme: Markdown linklerini düz metne çevir, resimleri sil
        text = text.replace(/!\[.*?\]\(.*?\)/g, ''); // resimler
        text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // linkler
        
        return text;
    } catch (e) {
        return null;
    }
}

async function fetchHN() {
    try {
        console.log("Fetching top HackerNews...");
        const url = "https://hn.algolia.com/api/v1/search?tags=story&numericFilters=points>2000&hitsPerPage=10"; 
        const res = await fetch(url);
        const data = await res.json();
        return data.hits
            .filter(h => h.url && !h.url.includes("youtube.com") && !h.url.includes("github.com"))
            .slice(0, 10)
            .map(h => ({ title: h.title, url: h.url, category: "Technology" }));
    } catch(e) {
        console.error("HN Fetch Error:", e.message);
        return [];
    }
}

async function fetchReddit(subreddit, category) {
    try {
        console.log(`Fetching top ${subreddit} of ALL TIME...`);
        const url = `https://www.reddit.com/r/${subreddit}/top/.json?t=all&limit=20`;
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        const data = await res.json();
        return data.data.children
            .filter(c => !c.data.is_self && c.data.url && !c.data.url.includes("reddit.com") && !c.data.url.includes("v.redd.it") && !c.data.url.includes("i.redd.it"))
            .slice(0, 10)
            .map(c => ({ title: c.data.title, url: c.data.url, category }));
    } catch(e) {
        console.error(`Reddit ${subreddit} Fetch Error:`, e.message);
        return [];
    }
}

async function run() {
    let pool = [];
    if (fs.existsSync(POOL_FILE)) {
        pool = JSON.parse(fs.readFileSync(POOL_FILE, 'utf-8'));
    }

    // 1. Viral Linkleri Topla
    const hn = await fetchHN();
    const tech = await fetchReddit("technology", "Technology");
    const wsb = await fetchReddit("wallstreetbets", "Finance");
    const nfl = await fetchReddit("nfl", "Sports");
    const gaming = await fetchReddit("gaming", "Gaming");
    
    let allLinks = [...hn, ...tech, ...wsb, ...nfl, ...gaming].slice(0, 50);

    console.log(`\nFound ${allLinks.length} hit links to process. Sending to Jina...\n`);

    // 2. Metinleri Jina'dan Çek
    let successCount = 0;
    for (const link of allLinks) {
        console.log(`[${link.category}] Processing: ${link.title.substring(0, 50)}...`);
        const text = await fetchFromJina(link.url);
        
        if (text) {
            const wordCount = text.split(/\s+/).length;
            if (wordCount > 250) {
                // Kalite Filtresi
                if (text.includes("You may also like") || text.includes("Javascript is disabled") || text.includes("Access denied")) {
                    console.log("   -> ❌ Rejected: Found junk keywords or 403 block");
                    continue;
                }
                
                pool.push({
                    id: "viral_" + Buffer.from(link.url).toString('base64').substring(0,10),
                    source: "Viral Hit Dataset",
                    category: link.category,
                    title: link.title,
                    url: link.url,
                    text: text
                });
                successCount++;
                console.log(`   -> ✅ Success! (Words: ${wordCount})`);
            } else {
                console.log(`   -> ❌ Rejected: Too short (${wordCount} words). Probably a table or image-only page.`);
            }
        } else {
            console.log("   -> ❌ Failed: Jina could not fetch (Timeout or 403).");
        }
        
        // Rate limit: 2 sn bekle
        await new Promise(r => setTimeout(r, 2000));
        
        // Sadece ilk 10 başarılı çekimi hedefliyorsak ve deneme uzarsa break yapılabilir.
        // Biz burada havuzdaki sayıyı umursamadan her kategori için deneyelim.
    }

    fs.writeFileSync(POOL_FILE, JSON.stringify(pool, null, 2));
    console.log(`\n🎉 Done! Pool now has ${pool.length} hit articles.`);
}

run();
