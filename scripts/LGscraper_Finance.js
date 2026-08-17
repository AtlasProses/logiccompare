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

async function fetchFinanceRssFeed(feedUrl, sourceName, maxLimit = 50, isTimeOut) {
    if (isTimeOut && isTimeOut()) return [];
    console.log(`[FINANCE_SCRAPER] Fetching RSS Feed (${sourceName}): ${feedUrl}...`);
    const results = [];
    try {
        const controller = new AbortController();
        const tId = setTimeout(() => controller.abort(), 12000);
        const res = await fetch(feedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*'
            },
            signal: controller.signal
        });
        clearTimeout(tId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const xmlText = await res.text();
        const dom = new JSDOM(xmlText, { contentType: "text/xml" });
        const items = dom.window.document.querySelectorAll('item, entry');

        let pool = readPool();
        let history = readHistory();

        for (const item of items) {
            if (isTimeOut && isTimeOut()) break;
            if (results.length >= maxLimit) break;

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
                console.log(`[+] Added to Finance pool [${results.length + 1}/${maxLimit}]: "${newArticle.title}" (${sourceName})`);
                results.push(newArticle);
            }
        }
    } catch (e) {
        console.warn(`[FINANCE RSS SKIP] ${sourceName}:`, e.message);
    }
    return results;
}

/**
 * CoinGecko Trending Search API (Captures viral macro trends & capital inflows)
 */
async function fetchCoinGeckoTrending(isTimeOut) {
    if (isTimeOut && isTimeOut()) return [];
    console.log(`[FINANCE_SCRAPER] Fetching CoinGecko Trending Markets API...`);
    const results = [];
    try {
        const controller = new AbortController();
        const tId = setTimeout(() => controller.abort(), 10000);
        const res = await fetch('https://api.coingecko.com/api/v3/search/trending', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'application/json'
            },
            signal: controller.signal
        });
        clearTimeout(tId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const coins = data.coins || [];

        let pool = readPool();
        let history = readHistory();

        for (const c of coins) {
            if (isTimeOut && isTimeOut()) break;
            const item = c.item;
            if (!item) continue;

            const id = `fin_cg_trend_${item.id}_${item.symbol?.toLowerCase()}`;
            const url = `https://www.coingecko.com/en/coins/${item.id}`;
            if (isDuplicate(pool, history, id, url)) continue;

            const marketCapRank = item.market_cap_rank || 'N/A';
            const priceBtc = item.price_btc ? item.price_btc.toFixed(8) : 'N/A';
            const score = item.score !== undefined ? item.score : 0;

            const title = `${item.name} (${item.symbol?.toUpperCase()}): Market Momentum & Valuation Analysis`;
            const analysisText = `<p>Comprehensive financial evaluation for <strong>${item.name} (${item.symbol?.toUpperCase()})</strong>. As of current market cycles, this digital asset holds market cap rank #${marketCapRank} with a trending score of ${score}. Key quantitative metrics highlight an active liquidity index against Bitcoin trading at ${priceBtc} BTC. Comparative valuation models indicate expanding liquidity depth across decentralized automated market makers (AMMs) and centralized derivative order books. Risk parameters include systemic beta volatility, token distribution unlock schedules, and cross-chain bridging collateral risks.</p>`;

            const newArticle = {
                id: id,
                source: 'CoinGecko Trending',
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
            console.log(`[+] Added to Finance pool: "${newArticle.title}" (CoinGecko Trending)`);
            results.push(newArticle);
        }
    } catch (e) {
        console.warn(`[COINGECKO TRENDING SKIP]:`, e.message);
    }
    return results;
}

export async function runFinanceScraper(targetCount = 200, isTimeOut) {
    console.log(`\n==================================================`);
    console.log(`🚀 Avcı Bot (Finance & Macro Markets) Başlatılıyor. Hedef: ${targetCount} Konu`);
    console.log(`==================================================\n`);

    const feeds = [
        { url: 'https://cointelegraph.com/rss', name: 'CoinTelegraph', limit: 40 },
        { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', name: 'CoinDesk', limit: 40 },
        { url: 'https://decrypt.co/feed', name: 'Decrypt', limit: 40 },
        { url: 'https://cryptobriefing.com/feed/', name: 'CryptoBriefing', limit: 30 },
        { url: 'https://cryptoslate.com/feed/', name: 'CryptoSlate', limit: 30 },
        { url: 'https://bitcoinmagazine.com/.rss/full/', name: 'Bitcoin Magazine', limit: 30 },
        { url: 'https://finance.yahoo.com/news/rssindex', name: 'Yahoo Finance Markets', limit: 40 },
        { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', name: 'MarketWatch Top', limit: 30 },
        { url: 'https://www.benzinga.com/feed', name: 'Benzinga Markets', limit: 30 },
        { url: 'https://www.investing.com/rss/news_25.rss', name: 'Investing.com Markets', limit: 30 }
    ];

    let totalAdded = 0;

    // 1. CoinGecko Trending
    if (!isTimeOut || !isTimeOut()) {
        const trendingAdded = await fetchCoinGeckoTrending(isTimeOut);
        totalAdded += trendingAdded.length;
    }

    // 2. High-Authority Financial RSS Feeds
    for (const feed of feeds) {
        if (isTimeOut && isTimeOut()) break;
        if (totalAdded >= targetCount) break;
        const added = await fetchFinanceRssFeed(feed.url, feed.name, feed.limit, isTimeOut);
        totalAdded += added.length;
    }

    try {
        updateState('finance', { items_added: totalAdded });
    } catch (e) {}

    console.log(`\n✅ Avcı Bot (Finance) tamamlandı. Bu turda ${totalAdded} yeni finans konusu eklendi.`);
}

if (process.argv[1]?.endsWith('LGscraper_Finance.js')) {
    const target = parseInt(process.argv[2], 10) || 100;
    runFinanceScraper(target).then(() => process.exit(0));
}
