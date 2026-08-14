import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
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

async function fetchSportsRssFeed(feedUrl, sourceName, maxLimit = 3) {
    console.log(`[SPORTS_SCRAPER] Fetching RSS Feed (${sourceName}): ${feedUrl}...`);
    const results = [];
    try {
        const res = await fetch(feedUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const xmlText = await res.text();
        const dom = new JSDOM(xmlText, { contentType: "text/xml" });
        const items = dom.window.document.querySelectorAll('item');

        for (const item of items) {
            if (results.length >= maxLimit) break;

            const linkEl = item.querySelector('link');
            const titleEl = item.querySelector('title');
            const pubDateEl = item.querySelector('pubDate');

            const url = linkEl ? linkEl.textContent.trim() : null;
            const rssTitle = titleEl ? titleEl.textContent.trim() : '';
            let pubDate = new Date().toISOString();
            if (pubDateEl && pubDateEl.textContent) {
                const parsed = new Date(pubDateEl.textContent);
                if (!isNaN(parsed.getTime())) pubDate = parsed.toISOString();
            }

            if (!url) continue;

            const pool = readPool();
            const urlHash = Buffer.from(url).toString('base64').substring(0, 16);
            const id = `spo_rss_${sourceName.toLowerCase()}_${urlHash}`;
            if (isDuplicate(pool, id)) continue;

            const content = await fetchCleanContent(url);
            if (content) {
                const newArticle = {
                    id: id,
                    source: sourceName,
                    category: 'Sports',
                    title: content.title || rssTitle,
                    url: url,
                    text: content.text,
                    date: pubDate
                };
                pool.push(newArticle);
                writePool(pool);
                console.log(`[+] Added to Sports pool: "${newArticle.title}" (${sourceName})`);
                results.push(newArticle);
            }
        }
    } catch (e) {
        console.error(`[SPORTS RSS ERROR] ${sourceName}:`, e.message);
    }
    return results;
}

async function runScraper() {
    console.log("🧟 Avcı Bot (Sports) Başlatılıyor...");
    await fetchSportsRssFeed('http://feeds.bbci.co.uk/sport/rss.xml', 'BBC Sport', 3);
    await fetchSportsRssFeed('https://www.skysports.com/rss/12040', 'Sky Sports', 3);
    console.log("✅ Avcı Bot (Sports) tamamlandı.");
    process.exit(0);
}

runScraper();


