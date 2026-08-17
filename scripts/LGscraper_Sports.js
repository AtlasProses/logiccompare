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

// --- 1. REDDIT 2026 SPORTS, F1 & NBA YEARLY TOP ARCHIVES (t=year) ---
async function fetchReddit2026SportsArchives(maxTotalLimit = 60, isTimeOut) {
    console.log(`[SPORTS_SCRAPER] Fetching Reddit 2026 Yearly Top Tactical & Telemetry Analyses (t=year)...`);
    const subreddits = ['soccer', 'formula1', 'nba', 'tennis', 'MMA'];
    let totalAdded = 0;
    const perSubLimit = Math.ceil(maxTotalLimit / subreddits.length);

    for (const sub of subreddits) {
        if (isTimeOut && isTimeOut()) break;
        if (totalAdded >= maxTotalLimit) break;

        try {
            console.log(`[Reddit] Fetching r/${sub} top 2026 sports archives...`);
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
                const id = `red_spo_${post.id}`;
                if (isDuplicate(pool, history, id, postUrl)) continue;

                const postDate = new Date(post.created_utc * 1000).toISOString();

                // Eğer post içinde uzun taktiksel analiz metni varsa
                if (post.selftext && post.selftext.length > 500) {
                    const cleanText = post.selftext.replace(/[*_#`]/g, '').trim();
                    const words = cleanText.split(/\s+/).filter(Boolean).length;
                    if (words >= 150) {
                        const newArticle = {
                            id: id,
                            source: `Reddit r/${sub}`,
                            category: 'Sports',
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
                        console.log(`[+] Added Reddit Sports [${totalAdded}/${maxTotalLimit}]: "${newArticle.title}" (${post.ups} ups)`);
                    }
                } else if (postUrl.startsWith('http') && !postUrl.includes('reddit.com') && !postUrl.includes('i.redd.it') && !postUrl.includes('v.redd.it')) {
                    const content = await fetchCleanContent(postUrl);
                    if (content && content.wordCount >= 160) {
                        const newArticle = {
                            id: id,
                            source: `Reddit Curated (${sub})`,
                            category: 'Sports',
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
                        console.log(`[+] Added Reddit Link Sports [${totalAdded}/${maxTotalLimit}]: "${newArticle.title}"`);
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

// --- 2. SAYFALAMALI 2026 KÜRESEL SPOR & F1 ARŞİV AKIŞLARI ---
async function fetchPaginatedSportsRssFeed(feedBaseUrl, sourceName, maxPages = 5, perPageLimit = 15, isTimeOut) {
    if (isTimeOut && isTimeOut()) return [];
    console.log(`[SPORTS_SCRAPER] Fetching Paginated RSS Feed (${sourceName}) across ${maxPages} historical pages...`);
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
                const id = `spo_rss_${sourceName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${urlHash}`;
                if (isDuplicate(pool, history, id, url)) continue;

                const content = await fetchCleanContent(url);
                if (content && content.wordCount >= 160) {
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
                    history.push(url);
                    writePool(pool);
                    writeHistory(history);
                    pageAdded++;
                    results.push(newArticle);
                    console.log(`[+] Added Sports [P.${page}]: "${newArticle.title}" (${sourceName})`);
                }
            }
        } catch (e) {
            console.warn(`[SPORTS RSS PAGE ${page} SKIP] ${sourceName}:`, e.message);
            break;
        }
    }
    return results;
}

export async function runSportsScraper(targetCount = 150, isTimeOut) {
    console.log(`\n==================================================`);
    console.log(`🚀 Avcı Bot (Sports 2026 Arşivleri & Çoklu Branş) Başlatılıyor. Hedef: ${targetCount} Konu`);
    console.log(`==================================================\n`);

    let totalAdded = 0;

    // 1. Reddit 2026 Yearly Sports Top Archives (Taktik, Telemetri, Maç Raporları)
    if (!isTimeOut || !isTimeOut()) {
        const redditAdded = await fetchReddit2026SportsArchives(Math.floor(targetCount * 0.40), isTimeOut);
        totalAdded += redditAdded;
    }

    // 2. Sayfalamalı 2026 Spor, Futbol ve F1 Akışları
    const paginatedFeeds = [
        { url: 'https://www.theguardian.com/football/rss', name: 'The Guardian Football', pages: 8 },
        { url: 'https://www.theguardian.com/sport/rss', name: 'The Guardian Sport', pages: 8 },
        { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml', name: 'BBC Sport Football', pages: 5 },
        { url: 'https://feeds.bbci.co.uk/sport/formula1/rss.xml', name: 'BBC Sport F1', pages: 5 },
        { url: 'https://www.motorsport.com/rss/f1/news/', name: 'Motorsport F1', pages: 6 },
        { url: 'https://www.autosport.com/rss/f1/news/', name: 'Autosport F1', pages: 6 },
        { url: 'https://www.formula1.com/content/fom-website/en/latest/all.xml', name: 'Formula 1 Official', pages: 5 },
        { url: 'https://www.espn.com/espn/rss/f1/news', name: 'ESPN F1', pages: 4 },
        { url: 'https://www.espn.com/espn/rss/nba/news', name: 'ESPN NBA', pages: 4 },
        { url: 'https://www.espn.com/espn/rss/soccer/news', name: 'ESPN Soccer', pages: 4 }
    ];

    for (const feed of paginatedFeeds) {
        if (isTimeOut && isTimeOut()) break;
        if (totalAdded >= targetCount) break;
        const added = await fetchPaginatedSportsRssFeed(feed.url, feed.name, feed.pages, 15, isTimeOut);
        totalAdded += added.length;
    }

    try {
        updateState('sports', { items_added: totalAdded });
    } catch (e) {}

    console.log(`\n✅ Avcı Bot (Sports) tamamlandı. Bu turda ${totalAdded} yeni 2026 spor konusu eklendi.`);
}

if (process.argv[1]?.endsWith('LGscraper_Sports.js')) {
    const target = parseInt(process.argv[2], 10) || 50;
    runSportsScraper(target).then(() => process.exit(0));
}
