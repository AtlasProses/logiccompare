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

// --- 1. COINGECKO TOP 100 CRYPTO MARKETS & TRENDING API ---
async function fetchCoinGeckoTop100Markets(maxTotalLimit = 60, isTimeOut) {
    console.log(`[FINANCE_SCRAPER] Fetching CoinGecko Top 100 Quantitative Markets API...`);
    let totalAdded = 0;
    try {
        const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h,7d,30d';
        const controller = new AbortController();
        const tId = setTimeout(() => controller.abort(), 12000);
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LogicCompareFinancial/3.0',
                'Accept': 'application/json'
            },
            signal: controller.signal
        });
        clearTimeout(tId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const coins = await res.json();
        if (!Array.isArray(coins)) return 0;

        let pool = readPool();
        let history = readHistory();

        for (const coin of coins) {
            if (isTimeOut && isTimeOut()) break;
            if (totalAdded >= maxTotalLimit) break;

            const id = `fin_cg_top100_${coin.id}`;
            const url = `https://www.coingecko.com/en/coins/${coin.id}`;
            if (isDuplicate(pool, history, id, url)) continue;

            const rank = coin.market_cap_rank || 'N/A';
            const price = coin.current_price !== undefined ? `$${coin.current_price.toLocaleString()}` : 'N/A';
            const mcap = coin.market_cap !== undefined ? `$${(coin.market_cap / 1e9).toFixed(2)} Billion` : 'N/A';
            const volume24h = coin.total_volume !== undefined ? `$${(coin.total_volume / 1e6).toFixed(2)} Million` : 'N/A';
            const change24h = coin.price_change_percentage_24h !== undefined ? `${coin.price_change_percentage_24h.toFixed(2)}%` : '0%';
            const ath = coin.ath !== undefined ? `$${coin.ath.toLocaleString()}` : 'N/A';
            const athChange = coin.ath_change_percentage !== undefined ? `${coin.ath_change_percentage.toFixed(2)}%` : 'N/A';

            const title = `${coin.name} (${coin.symbol?.toUpperCase()}): 2026 Institutional Liquidity, Valuation & Macro Trajectory Analysis`;
            const analysisText = `<p>Comprehensive quantitative valuation report for <strong>${coin.name} (${coin.symbol?.toUpperCase()})</strong>. Holding Global Market Cap Rank #${rank} with a circulating market capitalization of ${mcap} and 24-hour global trading volume of ${volume24h}. Current spot exchange rate trades at ${price} with a 24-hour momentum shift of ${change24h}. Key systemic risk and upside metrics reflect an All-Time High baseline of ${ath} (${athChange} draw-down). Quantitative models evaluate automated market maker (AMM) depth, institutional custody inflows, Layer-1/Layer-2 transaction throughput, and macroeconomic correlation with global liquidity cycles.</p>`;

            const newArticle = {
                id: id,
                source: 'CoinGecko Institutional Markets',
                category: 'Finance',
                title: title,
                url: url,
                text: analysisText,
                date: new Date().toISOString()
            };

            pool.push(newArticle);
            history.push(url);
            writePool(pool);
            writeHistory(history);
            totalAdded++;
            console.log(`[+] Added CoinGecko Top 100 [${totalAdded}/${maxTotalLimit}]: "${newArticle.title}"`);
        }
    } catch (e) {
        console.warn(`[CoinGecko Top 100 Skip]:`, e.message);
    }
    return totalAdded;
}

// --- 2. REDDIT 2026 WALLSTREET & CRYPTO YEARLY TOP ARCHIVES (t=year) ---
async function fetchReddit2026FinanceArchives(maxTotalLimit = 60, isTimeOut) {
    console.log(`[FINANCE_SCRAPER] Fetching Reddit 2026 Yearly Top Due Diligence & Market Analyses (t=year)...`);
    const subreddits = ['stocks', 'investing', 'CryptoCurrency', 'wallstreetbets'];
    let totalAdded = 0;
    const perSubLimit = Math.ceil(maxTotalLimit / subreddits.length);

    for (const sub of subreddits) {
        if (isTimeOut && isTimeOut()) break;
        if (totalAdded >= maxTotalLimit) break;

        try {
            console.log(`[Reddit] Fetching r/${sub} top 2026 financial archives...`);
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
                if (!post || post.ups < 100) continue;

                const postUrl = post.url_overridden_by_dest || `https://reddit.com${post.permalink}`;
                const id = `red_fin_${post.id}`;
                if (isDuplicate(pool, history, id, postUrl)) continue;

                const postDate = new Date(post.created_utc * 1000).toISOString();

                // Eğer post içinde uzun Due Diligence metni varsa
                if (post.selftext && post.selftext.length > 500) {
                    const cleanText = post.selftext.replace(/[*_#`]/g, '').trim();
                    const words = cleanText.split(/\s+/).filter(Boolean).length;
                    if (words >= 150) {
                        const newArticle = {
                            id: id,
                            source: `Reddit r/${sub}`,
                            category: 'Finance',
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
                        console.log(`[+] Added Reddit Finance [${totalAdded}/${maxTotalLimit}]: "${newArticle.title}" (${post.ups} ups)`);
                    }
                } else if (postUrl.startsWith('http') && !postUrl.includes('reddit.com') && !postUrl.includes('i.redd.it') && !postUrl.includes('v.redd.it')) {
                    const content = await fetchCleanContent(postUrl);
                    if (content && content.wordCount >= 160) {
                        const newArticle = {
                            id: id,
                            source: `Reddit Curated (${sub})`,
                            category: 'Finance',
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
                        console.log(`[+] Added Reddit Link Finance [${totalAdded}/${maxTotalLimit}]: "${newArticle.title}"`);
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

// --- 3. SAYFALAMALI 2026 KÜRESEL FİNANS & KRİPTO MEDYASI ARŞİV AKIŞLARI ---
async function fetchPaginatedFinanceRssFeed(feedBaseUrl, sourceName, maxPages = 5, perPageLimit = 15, isTimeOut) {
    if (isTimeOut && isTimeOut()) return [];
    console.log(`[FINANCE_SCRAPER] Fetching Paginated RSS Feed (${sourceName}) across ${maxPages} historical pages...`);
    const results = [];

    for (let page = 1; page <= maxPages; page++) {
        if (isTimeOut && isTimeOut()) break;

        const pageUrl = feedBaseUrl.includes('?') 
            ? `${feedBaseUrl}&page=${page}&paged=${page}` 
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
                const id = `fin_rss_${sourceName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${urlHash}`;
                if (isDuplicate(pool, history, id, url)) continue;

                const content = await fetchCleanContent(url);
                if (content && content.wordCount >= 160) {
                    const newArticle = {
                        id: id,
                        source: sourceName,
                        category: 'Finance',
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
                    console.log(`[+] Added Finance [P.${page}]: "${newArticle.title}" (${sourceName})`);
                }
            }
        } catch (e) {
            console.warn(`[FINANCE RSS PAGE ${page} SKIP] ${sourceName}:`, e.message);
            break;
        }
    }
    return results;
}

export async function runFinanceScraper(targetCount = 200, isTimeOut) {
    console.log(`\n==================================================`);
    console.log(`🚀 Avcı Bot (Finance 2026 Arşivleri & Top 100 API) Başlatılıyor. Hedef: ${targetCount} Konu`);
    console.log(`==================================================\n`);

    let totalAdded = 0;

    // 1. CoinGecko Top 100 Cryptocurrencies Quantitative Markets API
    if (!isTimeOut || !isTimeOut()) {
        const cgAdded = await fetchCoinGeckoTop100Markets(Math.floor(targetCount * 0.40), isTimeOut);
        totalAdded += cgAdded;
    }

    // 2. Reddit 2026 Yearly Financial Due Diligence Top Archives
    if (!isTimeOut || !isTimeOut()) {
        const redditAdded = await fetchReddit2026FinanceArchives(Math.floor(targetCount * 0.35), isTimeOut);
        totalAdded += redditAdded;
    }

    // 3. Sayfalamalı 2026 Finans, Kripto ve Borsa Akışları
    const paginatedFeeds = [
        { url: 'https://decrypt.co/feed', name: 'Decrypt', pages: 8 },
        { url: 'https://cryptobriefing.com/feed/', name: 'CryptoBriefing', pages: 8 },
        { url: 'https://cryptoslate.com/feed/', name: 'CryptoSlate', pages: 8 },
        { url: 'https://bitcoinmagazine.com/.rss/full/', name: 'Bitcoin Magazine', pages: 6 },
        { url: 'https://cointelegraph.com/rss', name: 'CoinTelegraph', pages: 6 },
        { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', name: 'MarketWatch Top', pages: 6 },
        { url: 'https://www.benzinga.com/feed', name: 'Benzinga Markets', pages: 6 }
    ];

    for (const feed of paginatedFeeds) {
        if (isTimeOut && isTimeOut()) break;
        if (totalAdded >= targetCount) break;
        const added = await fetchPaginatedFinanceRssFeed(feed.url, feed.name, feed.pages, 15, isTimeOut);
        totalAdded += added.length;
    }

    try {
        updateState('finance', { items_added: totalAdded });
    } catch (e) {}

    console.log(`\n✅ Avcı Bot (Finance) tamamlandı. Bu turda ${totalAdded} yeni 2026 finans konusu eklendi.`);
}

if (process.argv[1]?.endsWith('LGscraper_Finance.js')) {
    const target = parseInt(process.argv[2], 10) || 50;
    runFinanceScraper(target).then(() => process.exit(0));
}
