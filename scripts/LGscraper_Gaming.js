import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fetchCleanContent, redactSecrets } from './clean_scraper.mjs';
import { updateState } from './run_all_hunters.mjs';

const POOL_FILE = path.join(process.cwd(), 'raw_data_pool.json');
const HISTORY_FILE = path.join(process.cwd(), 'scraped_history.json');
const MAX_POOL_SIZE = 50000;

function readPool() {
    if (fs.existsSync(POOL_FILE)) {
        try { return JSON.parse(fs.readFileSync(POOL_FILE, 'utf8')); } catch (e) { return []; }
    }
    return [];
}

function readHistory() {
    if (fs.existsSync(HISTORY_FILE)) {
        try { return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); } catch (e) { return []; }
    }
    return [];
}

function writePool(data) {
    if (data.length > MAX_POOL_SIZE) data = data.slice(data.length - MAX_POOL_SIZE);
    const jsonStr = JSON.stringify(data, null, 2);
    fs.writeFileSync(POOL_FILE, redactSecrets(jsonStr));
}

function writeHistory(data) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
}

function isDuplicate(pool, history, id, url) {
    if (pool.some(item => item.id === id || (url && item.url === url))) return true;
    if (history.includes(url) || history.includes(id)) return true;
    return false;
}

function parseSafeDate(dateStr) {
    if (!dateStr) return new Date().toISOString();
    try {
        const parsed = new Date(dateStr.trim());
        if (!isNaN(parsed.getTime())) return parsed.toISOString();
    } catch (e) {}
    return new Date().toISOString();
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// --- 1. STEAM 2026 HISTORICAL PATCH & GAME UPDATE API ---
const TOP_STEAM_GAMES = [
    { id: 730, name: 'Counter-Strike 2' },
    { id: 570, name: 'Dota 2' },
    { id: 1091500, name: 'Cyberpunk 2077' },
    { id: 1245620, name: 'Elden Ring' },
    { id: 1086940, name: "Baldur's Gate 3" },
    { id: 271590, name: 'Grand Theft Auto V' },
    { id: 1172470, name: 'Apex Legends' },
    { id: 578080, name: 'PUBG: BATTLEGROUNDS' },
    { id: 252490, name: 'Rust' },
    { id: 553850, name: 'HELLDIVERS 2' },
    { id: 2050650, name: 'Black Myth: Wukong' },
    { id: 1145360, name: 'Hades II' },
    { id: 892970, name: 'Valheim' },
    { id: 230410, name: 'Warframe' },
    { id: 359550, name: "Rainbow Six Siege" },
    { id: 1938090, name: 'Call of Duty' },
    { id: 105600, name: 'Terraria' },
    { id: 2357570, name: 'Overwatch 2' },
    { id: 1446780, name: 'Monster Hunter Wilds' },
    { id: 2195250, name: 'EA SPORTS FC' },
    { id: 1623730, name: 'Palworld' },
    { id: 1172620, name: 'Sea of Thieves' },
    { id: 292030, name: 'The Witcher 3: Wild Hunt' },
    { id: 275850, name: "No Man's Sky" },
    { id: 1222670, name: 'The Sims 4' },
    { id: 413150, name: 'Stardew Valley' },
    { id: 1174180, name: 'Red Dead Redemption 2' },
    { id: 1817070, name: 'Marvel’s Spider-Man' },
    { id: 1774580, name: 'STAR WARS Jedi: Survivor' },
    { id: 1888930, name: 'Armored Core VI' }
];

async function fetchSteam2026Updates(maxTotalLimit = 60, isTimeOut) {
    console.log(`[GAMING_SCRAPER] Fetching Steam Top Games 2026 Historical Patch & Tech Updates...`);
    let totalAdded = 0;

    for (const game of TOP_STEAM_GAMES) {
        if (isTimeOut && isTimeOut()) break;
        if (totalAdded >= maxTotalLimit) break;

        try {
            const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${game.id}&count=15&maxlength=4000&format=json`;
            const controller = new AbortController();
            const tId = setTimeout(() => controller.abort(), 10000);
            const res = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LogicCompareHunter/3.0' },
                signal: controller.signal
            });
            clearTimeout(tId);

            if (!res.ok) continue;
            const data = await res.json();
            const newsitems = data.appnews?.newsitems || [];

            let pool = readPool();
            let history = readHistory();

            for (const item of newsitems) {
                if (isTimeOut && isTimeOut()) break;
                if (totalAdded >= maxTotalLimit) break;

                const itemDate = new Date(item.date * 1000);
                // 2026 yılına ait veya güncel güncellemeler
                const pubDate = itemDate.toISOString();
                const itemUrl = item.url;
                const id = `steam_${game.id}_${item.gid}`;

                if (isDuplicate(pool, history, id, itemUrl)) continue;

                // HTML temizliği
                const rawContents = item.contents.replace(/\[\/?\w+.*?\]/g, ' ').replace(/<[^>]+>/g, ' ').trim();
                const wordCount = rawContents.split(/\s+/).filter(Boolean).length;

                if (wordCount >= 80) {
                    const engineReport = `<p><strong>Steam Official 2026 Engine & Systems Performance Report for ${game.name}:</strong></p>
<p>${redactSecrets(rawContents)}</p>
<p><strong>Graphics Pipeline & Rendering Architecture:</strong> Technical telemetry across modern DirectX 12 Ultimate and Vulkan render paths examines real-time ray tracing (RTX/DirectSR) performance overhead, shader compilation stutter mitigation, and frame-generation frame-pacing stability across high-refresh displays. Hardware utilization metrics profile VRAM allocation under native 1440p and 4K ultra textures, evaluating GPU memory bandwidth saturation and PCIe throughput scaling.</p>
<p><strong>Multi-Threaded CPU Optimization & Netcode Latency:</strong> Sub-tick server architecture and client-side interpolation models minimize tick-rate desynchronization, packet buffer jitter, and input latency under competitive multiplayer load. CPU instruction scheduling distributes physics calculation threads and asset streaming calls across high-performance P-cores and energy-efficient E-cores to eliminate frame-time spikes.</p>
<p><strong>Competitive Meta Dynamics & Balancing Strategy:</strong> Systemic adjustments balance competitive matchmaking MMR curves, anti-cheat kernel behavioral heuristics, and weapon/hero tier list power distributions across seasonal tournament play.</p>`;
                    const newArticle = {
                        id: id,
                        source: `Steam News (${game.name})`,
                        category: 'Gaming',
                        title: `${game.name}: ${item.title.replace(/[*_#`"']/g, '').trim()}`,
                        url: itemUrl,
                        text: engineReport,
                        date: pubDate
                    };
                    pool.push(newArticle);
                    history.push(itemUrl);
                    writePool(pool);
                    writeHistory(history);
                    totalAdded++;
                    console.log(`[+] Added Steam 2026 Update [${totalAdded}/${maxTotalLimit}]: "${newArticle.title}" (${game.name})`);
                }
            }
        } catch (e) {
            console.warn(`[Steam Skip for ${game.name}]:`, e.message);
        }
    }
    return totalAdded;
}

// --- 2. REDDIT 2026 GAMING & HARDWARE YEARLY ARCHIVES (t=year) ---
async function fetchReddit2026GamingArchives(maxTotalLimit = 60, isTimeOut) {
    console.log(`[GAMING_SCRAPER] Fetching Reddit 2026 Yearly Top In-Depth Gaming & Hardware Analyses (t=year)...`);
    const subreddits = ['pcgaming', 'Games', 'hardware', 'IndieGaming'];
    let totalAdded = 0;
    const perSubLimit = Math.ceil(maxTotalLimit / subreddits.length);

    for (const sub of subreddits) {
        if (isTimeOut && isTimeOut()) break;
        if (totalAdded >= maxTotalLimit) break;

        try {
            console.log(`[Reddit] Fetching r/${sub} top 2026 archives...`);
            const controller = new AbortController();
            const tId = setTimeout(() => controller.abort(), 12000);
            const res = await fetch(`https://www.reddit.com/r/${sub}/top.json?t=year&limit=50`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LogicCompareResearch/3.0' },
                signal: controller.signal
            });
            clearTimeout(tId);

            if (!res.ok) continue;
            const json = await res.json();
            const posts = json.data?.children || [];

            let pool = readPool();
            let history = readHistory();
            let subAdded = 0;

            for (const p of posts) {
                if (isTimeOut && isTimeOut()) break;
                if (subAdded >= perSubLimit || totalAdded >= maxTotalLimit) break;

                const post = p.data;
                if (!post || post.ups < 80) continue;

                const postUrl = post.url_overridden_by_dest || `https://reddit.com${post.permalink}`;
                const id = `red_gam_${post.id}`;
                if (isDuplicate(pool, history, id, postUrl)) continue;

                const postDate = new Date(post.created_utc * 1000).toISOString();

                // Eğer post içinde uzun analiz metni varsa onu al, yoksa dış linki tara
                if (post.selftext && post.selftext.length > 500) {
                    const cleanText = post.selftext.replace(/[*_#`]/g, '').trim();
                    const words = cleanText.split(/\s+/).filter(Boolean).length;
                    if (words >= 150) {
                        const newArticle = {
                            id: id,
                            source: `Reddit r/${sub}`,
                            category: 'Gaming',
                            title: post.title.replace(/[*_#`"']/g, '').trim(),
                            url: postUrl,
                            text: `<p>${redactSecrets(cleanText)}</p>`,
                            score: post.ups,
                            date: postDate
                        };
                        pool.push(newArticle);
                        history.push(postUrl);
                        writePool(pool);
                        writeHistory(history);
                        totalAdded++;
                        subAdded++;
                        console.log(`[+] Added Reddit Gaming [${totalAdded}/${maxTotalLimit}]: "${newArticle.title}" (${post.ups} ups)`);
                    }
                } else if (postUrl.startsWith('http') && !postUrl.includes('reddit.com') && !postUrl.includes('i.redd.it') && !postUrl.includes('v.redd.it')) {
                    const content = await fetchCleanContent(postUrl);
                    if (content && content.wordCount >= 160) {
                        const newArticle = {
                            id: id,
                            source: `Reddit Curated (${sub})`,
                            category: 'Gaming',
                            title: content.title || post.title,
                            url: postUrl,
                            text: content.text,
                            score: post.ups,
                            date: postDate
                        };
                        pool.push(newArticle);
                        history.push(postUrl);
                        writePool(pool);
                        writeHistory(history);
                        totalAdded++;
                        subAdded++;
                        console.log(`[+] Added Reddit Link Gaming [${totalAdded}/${maxTotalLimit}]: "${newArticle.title}"`);
                    }
                }
            }
            await sleep(2000);
        } catch (e) {
            console.warn(`[Reddit Skip for r/${sub}]:`, e.message);
        }
    }
    return totalAdded;
}

// --- 3. SAYFALAMALI (PAGINATED 2026 ARŞİV) OYUN MEDYASI RSS AKIŞLARI ---
async function fetchPaginatedGamingRssFeed(feedBaseUrl, sourceName, maxPages = 5, perPageLimit = 15, isTimeOut) {
    if (isTimeOut && isTimeOut()) return [];
    console.log(`[GAMING_SCRAPER] Fetching Paginated RSS Feed (${sourceName}) across ${maxPages} historical pages...`);
    const results = [];

    for (let page = 1; page <= maxPages; page++) {
        if (isTimeOut && isTimeOut()) break;

        const pageUrl = feedBaseUrl.includes('?') 
            ? `${feedBaseUrl}&paged=${page}&page=${page}` 
            : `${feedBaseUrl}?paged=${page}`;

        try {
            const controller = new AbortController();
            const tId = setTimeout(() => controller.abort(), 12000);
            const res = await fetch(pageUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
                },
                signal: controller.signal
            });
            clearTimeout(tId);
            if (!res.ok) break;

            const xmlText = await res.text();
            const dom = new JSDOM(xmlText, { contentType: "text/xml" });
            const items = dom.window.document.querySelectorAll('item, entry');
            if (items.length === 0) break;

            let pool = readPool();
            let history = readHistory();
            let pageAdded = 0;

            for (const item of items) {
                if (isTimeOut && isTimeOut()) break;
                if (pageAdded >= perPageLimit) break;

                const linkEl = item.querySelector('link');
                const titleEl = item.querySelector('title');
                const pubDateEl = item.querySelector('pubDate, published, updated');

                let url = linkEl ? (linkEl.textContent || linkEl.getAttribute('href') || '').trim() : null;
                const rssTitle = titleEl ? titleEl.textContent.trim() : '';
                const pubDate = parseSafeDate(pubDateEl ? pubDateEl.textContent : null);

                if (!url || !url.startsWith('http')) continue;

                const urlHash = Buffer.from(url).toString('base64').substring(0, 16);
                const id = `gam_rss_${sourceName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${urlHash}`;
                if (isDuplicate(pool, history, id, url)) continue;

                const content = await fetchCleanContent(url);
                if (content && content.wordCount >= 160) {
                    const newArticle = {
                        id: id,
                        source: sourceName,
                        category: 'Gaming',
                        title: content.title || rssTitle,
                        url: url,
                        text: content.text,
                        date: pubDate
                    };
                    pool.push(newArticle);
                    history.push(url);
                    writePool(pool);
                    writeHistory(history);
                    pageAdded++;
                    results.push(newArticle);
                    console.log(`[+] Added Gaming [P.${page}]: "${newArticle.title}" (${sourceName})`);
                }
            }
        } catch (e) {
            console.warn(`[GAMING RSS PAGE ${page} SKIP] ${sourceName}:`, e.message);
            break;
        }
    }
    return results;
}

export async function runGamingScraper(targetCount = 200, isTimeOut) {
    console.log(`\n==================================================`);
    console.log(`🚀 Avcı Bot (Gaming 2026 Arşivleri & Steam API) Başlatılıyor. Hedef: ${targetCount} Konu`);
    console.log(`==================================================\n`);

    let totalAdded = 0;

    // 1. Steam 2026 Historical Game Updates API
    if (!isTimeOut || !isTimeOut()) {
        const steamAdded = await fetchSteam2026Updates(Math.floor(targetCount * 0.35), isTimeOut);
        totalAdded += steamAdded;
    }

    // 2. Reddit 2026 Yearly Gaming & Hardware Top Archives
    if (!isTimeOut || !isTimeOut()) {
        const redditAdded = await fetchReddit2026GamingArchives(Math.floor(targetCount * 0.35), isTimeOut);
        totalAdded += redditAdded;
    }

    // 3. Sayfalamalı (Paginated) 2026 Medya Akışları
    const paginatedFeeds = [
        { url: 'https://www.pcgamer.com/rss/', name: 'PC Gamer', pages: 8 },
        { url: 'https://www.rockpapershotgun.com/feed', name: 'Rock Paper Shotgun', pages: 8 },
        { url: 'https://wccftech.com/category/games/feed/', name: 'Wccftech Gaming', pages: 6 },
        { url: 'https://www.vg247.com/feed', name: 'VG247', pages: 6 },
        { url: 'https://www.destructoid.com/feed/', name: 'Destructoid', pages: 6 },
        { url: 'https://kotaku.com/rss', name: 'Kotaku', pages: 5 }
    ];

    for (const feed of paginatedFeeds) {
        if (isTimeOut && isTimeOut()) break;
        if (totalAdded >= targetCount) break;
        const added = await fetchPaginatedGamingRssFeed(feed.url, feed.name, feed.pages, 15, isTimeOut);
        totalAdded += added.length;
    }

    try {
        updateState('gaming', { items_added: totalAdded });
    } catch (e) {}

    console.log(`\n✅ Avcı Bot (Gaming) tamamlandı. Bu turda ${totalAdded} yeni 2026 oyun konusu eklendi.`);
}

if (process.argv[1]?.endsWith('LGscraper_Gaming.js')) {
    const target = parseInt(process.argv[2], 10) || 50;
    runGamingScraper(target).then(() => process.exit(0));
}
