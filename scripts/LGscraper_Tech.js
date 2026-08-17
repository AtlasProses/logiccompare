import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fetchCleanContent } from './clean_scraper.mjs';

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
    fs.writeFileSync(POOL_FILE, JSON.stringify(data, null, 2));
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

// 1. Fetch Official High-Authority Tech Engineering RSS Feeds
async function fetchTechRssFeed(feedUrl, sourceName, maxLimit = 20) {
    console.log(`[TECH_SCRAPER] Fetching RSS Feed (${sourceName}): ${feedUrl}...`);
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
            const id = `tech_rss_${sourceName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${urlHash}`;
            if (isDuplicate(pool, history, id, url)) continue;

            const content = await fetchCleanContent(url);
            if (content && content.wordCount >= 200) {
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
                history.push(url);
                writePool(pool);
                writeHistory(history);
                console.log(`[+] Added to Tech pool: "${newArticle.title}" (${sourceName})`);
                results.push(newArticle);
            }
        }
    } catch (e) {
        console.error(`[TECH RSS ERROR] ${sourceName}:`, e.message);
    }
    return results;
}

// 2. Fetch arXiv Computer Science, AI, Systems & Engineering Research
async function fetchArxivTechPapers(maxTotalLimit = 500) {
    console.log(`[TECH_SCRAPER] Fetching arXiv Deep AI, Systems, Security & Engineering Research...`);
    const subcats = [
        'cat:cs.AI', // Artificial Intelligence
        'cat:cs.SE', // Software Engineering
        'cat:cs.DC', // Distributed, Parallel, and Cluster Computing
        'cat:cs.CR', // Cryptography and Security
        'cat:cs.LG', // Machine Learning
        'cat:cs.DB', // Databases
        'cat:cs.CL', // Computation and Language (NLP/LLMs)
        'cat:cs.AR', // Hardware Architecture
        'cat:cs.PL'  // Programming Languages & Compilers
    ];
    
    let totalAdded = 0;
    const perCatLimit = Math.ceil(maxTotalLimit / subcats.length);

    for (const cat of subcats) {
        if (totalAdded >= maxTotalLimit) break;
        try {
            console.log(`[arXiv] Querying category: ${cat} (Limit: ${perCatLimit})...`);
            const url = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(cat)}&start=0&max_results=${perCatLimit}&sortBy=submittedDate&sortOrder=descending`;
            const res = await fetch(url, { headers: { 'User-Agent': 'LogicCompareBot/2.0' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const xmlText = await res.text();
            const dom = new JSDOM(xmlText, { contentType: "text/xml" });
            const entries = dom.window.document.querySelectorAll('entry');

            let pool = readPool();
            let history = readHistory();

            for (const entry of entries) {
                if (totalAdded >= maxTotalLimit) break;
                const idEl = entry.querySelector('id');
                const titleEl = entry.querySelector('title');
                const summaryEl = entry.querySelector('summary');
                const publishedEl = entry.querySelector('published');

                const paperUrl = idEl ? idEl.textContent.trim() : null;
                const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : 'Research Paper';
                const abstract = summaryEl ? summaryEl.textContent.replace(/\s+/g, ' ').trim() : '';
                const pubDate = parseSafeDate(publishedEl ? publishedEl.textContent : null);

                if (!paperUrl || abstract.length < 200) continue;

                const id = `tech_arxiv_${Buffer.from(paperUrl).toString('base64').substring(0, 16)}`;
                if (isDuplicate(pool, history, id, paperUrl)) continue;

                const newArticle = {
                    id: id,
                    source: `arXiv Research (${cat.replace('cat:cs.', '')})`,
                    category: 'Technology',
                    title: title,
                    url: paperUrl,
                    text: `<p><strong>Abstract & Technical Findings:</strong> ${abstract}</p>`,
                    date: pubDate
                };
                pool.push(newArticle);
                history.push(paperUrl);
                writePool(pool);
                writeHistory(history);
                totalAdded++;
                console.log(`[+] Added arXiv Paper [${totalAdded}/${maxTotalLimit}]: "${title.substring(0, 60)}..."`);
            }
        } catch (e) {
            console.error(`[ARXIV ERROR in ${cat}]:`, e.message);
        }
        await new Promise(r => setTimeout(r, 1000)); // Respect arXiv API rate limit
    }
    return totalAdded;
}

// 3. Fetch HackerNews Top Technical Stories Across 2025-2027 Trend Keywords
async function fetchHackerNewsTopTechnical(maxTotalLimit = 400) {
    console.log(`[TECH_SCRAPER] Fetching HackerNews 2025-2027 Elite Trend Stories...`);
    const trendKeywords = [
        'DeepSeek', 'Llama', 'Agent', 'vLLM', 'Rust', 'Kubernetes',
        'Postgres', 'Cloudflare', 'Compiler', 'WebAssembly', 'Vector',
        'Zero Trust', 'Benchmark', 'GPU', 'Next.js', 'Distributed',
        'TypeScript', 'Microservices', 'PyTorch', 'Concurrency'
    ];

    let totalAdded = 0;
    const perKeywordLimit = Math.max(10, Math.ceil(maxTotalLimit / trendKeywords.length));

    for (const kw of trendKeywords) {
        if (totalAdded >= maxTotalLimit) break;
        try {
            console.log(`[HN] Searching keyword: "${kw}"...`);
            const SIXTY_DAYS_AGO = Math.floor(Date.now() / 1000) - (120 * 24 * 60 * 60);
            const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(kw)}&tags=story&numericFilters=created_at_i>${SIXTY_DAYS_AGO},points>60&hitsPerPage=20`;
            const res = await fetch(url);
            if (!res.ok) continue;
            const data = await res.json();

            let pool = readPool();
            let history = readHistory();

            let addedForKw = 0;
            for (const item of (data.hits || [])) {
                if (addedForKw >= perKeywordLimit || totalAdded >= maxTotalLimit) break;
                const itemUrl = item.url;
                if (!itemUrl || itemUrl.includes('youtube.com') || itemUrl.includes('twitter.com') || itemUrl.includes('x.com')) continue;

                const id = `tech_hn_${item.objectID}`;
                if (isDuplicate(pool, history, id, itemUrl)) continue;

                const content = await fetchCleanContent(itemUrl);
                if (content && content.wordCount >= 200) {
                    const newArticle = {
                        id: id,
                        source: `HackerNews (${kw})`,
                        category: 'Technology',
                        title: content.title || item.title,
                        url: itemUrl,
                        text: content.text,
                        score: item.points,
                        date: parseSafeDate(item.created_at)
                    };
                    pool.push(newArticle);
                    history.push(itemUrl);
                    writePool(pool);
                    writeHistory(history);
                    totalAdded++;
                    addedForKw++;
                    console.log(`[+] Added HN Tech [${totalAdded}/${maxTotalLimit}]: "${newArticle.title}" (${item.points} pts)`);
                }
            }
        } catch (e) {
            console.error(`[HN ERROR for ${kw}]:`, e.message);
        }
    }
    return totalAdded;
}

export async function runTechScraper(targetCount = 1000) {
    console.log(`\n==================================================`);
    console.log(`🚀 Avcı Bot (Technology) Başlatılıyor. Hedef: ${targetCount} Konu`);
    console.log(`==================================================\n`);

    // 1. High Authority Engineering RSS Feeds
    const rssFeeds = [
        { url: 'https://devblogs.microsoft.com/feed/', name: 'Microsoft DevBlogs' },
        { url: 'https://blog.cloudflare.com/rss/', name: 'Cloudflare Engineering' },
        { url: 'https://aws.amazon.com/blogs/architecture/feed/', name: 'AWS Architecture' },
        { url: 'https://github.blog/feed/', name: 'GitHub Engineering' },
        { url: 'https://cloud.google.com/blog/topics/developers-practitioners/rss', name: 'Google Cloud Blog' },
        { url: 'https://feed.infoq.com/', name: 'InfoQ Architecture' },
        { url: 'https://netflixtechblog.com/feed', name: 'Netflix TechBlog' },
        { url: 'https://www.uber.com/en-US/blog/engineering/rss/', name: 'Uber Engineering' }
    ];

    for (const feed of rssFeeds) {
        await fetchTechRssFeed(feed.url, feed.name, 15);
    }

    // 2. arXiv Academic AI & CS Deep Research (Target: 50% of remainder)
    const arxivLimit = Math.floor(targetCount * 0.5);
    await fetchArxivTechPapers(arxivLimit);

    // 3. HackerNews 2025-2027 Trend Queries (Target: 40% of remainder)
    const hnLimit = Math.floor(targetCount * 0.4);
    await fetchHackerNewsTopTechnical(hnLimit);

    console.log(`\n✅ Avcı Bot (Technology) tamamlandı. Havuz güncellendi.`);
}

if (process.argv[1]?.endsWith('LGscraper_Tech.js')) {
    const target = parseInt(process.argv[2], 10) || 1000;
    runTechScraper(target).then(() => process.exit(0));
}
