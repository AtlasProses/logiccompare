import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fetchCleanContent, redactSecrets } from './clean_scraper.mjs';

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

async function fetchGamingRssFeed(feedUrl, sourceName, maxLimit = 50) {
    console.log(`[GAMING_SCRAPER] Fetching RSS Feed (${sourceName}): ${feedUrl}...`);
    const results = [];
    try {
        const res = await fetch(feedUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const xmlText = await res.text();
        const dom = new JSDOM(xmlText, { contentType: "text/xml" });
        const items = dom.window.document.querySelectorAll('item, entry');

        let pool = readPool();
        let history = readHistory();

        for (const item of items) {
            if (results.length >= maxLimit) break;

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
            if (content && content.wordCount >= 200) {
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
                console.log(`[+] Added to Gaming pool [${results.length + 1}/${maxLimit}]: "${newArticle.title}" (${sourceName})`);
                results.push(newArticle);
            }
        }
    } catch (e) {
        console.error(`[GAMING RSS ERROR] ${sourceName}:`, e.message);
    }
    return results;
}

export async function runGamingScraper(targetCount = 300) {
    console.log(`\n==================================================`);
    console.log(`🚀 Avcı Bot (Gaming & Tech Hardware) Başlatılıyor. Hedef: ${targetCount} Konu`);
    console.log(`==================================================\n`);

    const feeds = [
        { url: 'https://www.pcgamer.com/rss/', name: 'PC Gamer', limit: 60 },
        { url: 'https://www.rockpapershotgun.com/feed', name: 'Rock Paper Shotgun', limit: 60 },
        { url: 'https://www.eurogamer.net/feed', name: 'Eurogamer', limit: 50 },
        { url: 'https://feeds.feedburner.com/ign/pc-articles', name: 'IGN PC', limit: 50 },
        { url: 'https://wccftech.com/feed/', name: 'Wccftech Gaming', limit: 40 },
        { url: 'https://www.tomshardware.com/feeds/category/pc-gaming', name: "Tom's Hardware PC Gaming", limit: 40 }
    ];

    for (const feed of feeds) {
        await fetchGamingRssFeed(feed.url, feed.name, feed.limit);
    }

    console.log(`\n✅ Avcı Bot (Gaming) tamamlandı. Havuz güncellendi.`);
}

if (process.argv[1]?.endsWith('LGscraper_Gaming.js')) {
    const target = parseInt(process.argv[2], 10) || 300;
    runGamingScraper(target).then(() => process.exit(0));
}
