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

// 1. Fetch Official High-Authority Tech Engineering RSS Feeds
async function fetchTechRssFeed(feedUrl, sourceName, maxLimit = 3) {
    console.log(`[TECH_SCRAPER] Fetching RSS Feed (${sourceName}): ${feedUrl}...`);
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
            const pubDate = pubDateEl ? new Date(pubDateEl.textContent).toISOString() : new Date().toISOString();

            if (!url) continue;

            const pool = readPool();
            const urlHash = Buffer.from(url).toString('base64').substring(0, 16);
            const id = `tech_rss_${sourceName.toLowerCase()}_${urlHash}`;
            if (isDuplicate(pool, id)) continue;

            const content = await fetchCleanContent(url);
            if (content) {
                const newArticle = {
                    id: id,
                    source: sourceName,
                    category: 'Technology',
                    title: content.title || rssTitle,
                    url: url,
                    text: content.text,
                    date: pubDate
                };
                pool.push(newArticle);
                writePool(pool);
                console.log(`[+] Added to Tech pool: "${newArticle.title}" (${sourceName})`);
                results.push(newArticle);
            }
        }
    } catch (e) {
        console.error(`[TECH RSS ERROR] ${sourceName}:`, e.message);
    }
    return results;
}

// 2. Fetch arXiv Computer Science & AI Research
async function fetchArxivTechPapers(maxLimit = 3) {
    console.log(`[TECH_SCRAPER] Fetching arXiv AI & Systems Research...`);
    const results = [];
    try {
        const url = `http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.SE+OR+cat:cs.DC+OR+cat:cs.LG&start=0&max_results=${maxLimit}&sortBy=submittedDate&sortOrder=descending`;
        const res = await fetch(url, { headers: { 'User-Agent': 'LogicCompareBot/2.0' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const xmlText = await res.text();
        const dom = new JSDOM(xmlText, { contentType: "text/xml" });
        const entries = dom.window.document.querySelectorAll('entry');

        for (const entry of entries) {
            const idEl = entry.querySelector('id');
            const titleEl = entry.querySelector('title');
            const summaryEl = entry.querySelector('summary');
            const publishedEl = entry.querySelector('published');

            const paperUrl = idEl ? idEl.textContent.trim() : null;
            const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : 'Research Paper';
            const abstract = summaryEl ? summaryEl.textContent.replace(/\s+/g, ' ').trim() : '';
            const pubDate = publishedEl ? new Date(publishedEl.textContent).toISOString() : new Date().toISOString();

            if (!paperUrl || abstract.length < 150) continue;

            const pool = readPool();
            const id = `tech_arxiv_${Buffer.from(paperUrl).toString('base64').substring(0, 16)}`;
            if (isDuplicate(pool, id)) continue;

            const newArticle = {
                id: id,
                source: 'arXiv Research Paper',
                category: 'Technology',
                title: title,
                url: paperUrl,
                text: `<p><strong>Abstract:</strong> ${abstract}</p>`,
                date: pubDate
            };
            pool.push(newArticle);
            writePool(pool);
            console.log(`[+] Added to Tech pool: "${newArticle.title}" (arXiv)`);
            results.push(newArticle);
        }
    } catch (e) {
        console.error(`[ARXIV ERROR]:`, e.message);
    }
    return results;
}

// 3. Fetch HackerNews Top Technical Stories (Strict Tech Filter)
async function fetchHackerNewsTopTechnical(maxLimit = 4) {
    console.log(`[TECH_SCRAPER] Fetching Hacker News Filtered Tech Architecture & Systems Hits...`);
    const results = [];
    const keywords = ['AI', 'LLM', 'database', 'Rust', 'Python', 'benchmark', 'Kubernetes', 'compiler', 'cloud'];
    const query = keywords[Math.floor(Math.random() * keywords.length)];

    try {
        const SIXTY_DAYS_AGO = Math.floor(Date.now() / 1000) - (60 * 24 * 60 * 60);
        const res = await fetch(`https://hn.algolia.com/api/v1/search?query=${query}&tags=story&numericFilters=created_at_i>${SIXTY_DAYS_AGO},points>120&hitsPerPage=10`);
        const data = await res.json();
        
        for (const item of data.hits) {
            if (results.length >= maxLimit) break;
            const url = item.url;
            if (!url) continue;

            const pool = readPool();
            const id = `tech_hn_${item.objectID}`;
            if (isDuplicate(pool, id)) continue;

            const content = await fetchCleanContent(url);
            if (content) {
                const newArticle = {
                    id: id,
                    source: 'HackerNews_Technical',
                    category: 'Technology',
                    title: content.title || item.title,
                    url: url,
                    text: content.text,
                    score: item.points,
                    date: item.created_at || new Date().toISOString()
                };
                pool.push(newArticle);
                writePool(pool);
                console.log(`[+] Added to Tech pool: "${newArticle.title}" (${newArticle.score} pts)`);
                results.push(newArticle);
            }
        }
    } catch (e) {
        console.error("[HN ERROR]:", e.message);
    }
    return results;
}

async function runScraper() {
    console.log("🧟 Avcı Bot (Technology - Otoriter ve Teknik) Başlatılıyor...");
    await fetchTechRssFeed('https://devblogs.microsoft.com/feed/', 'Microsoft DevBlogs', 3);
    await fetchTechRssFeed('https://blog.cloudflare.com/rss/', 'Cloudflare Engineering', 3);
    await fetchArxivTechPapers(3);
    await fetchHackerNewsTopTechnical(3);
    console.log("✅ Avcı Bot (Technology) tamamlandı.");
    process.exit(0);
}

runScraper();

