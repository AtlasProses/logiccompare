import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fetchCleanContent, redactSecrets } from './clean_scraper.mjs';
import { readState, updateState } from './run_all_hunters.mjs';

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

// İnsan Benzeri Rastgele Gecikme (15 sn ile 32 sn arası dinamik bekleme)
const humanRandomSleep = async (minSec = 15, maxSec = 30) => {
    const sec = Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec;
    console.log(`[İNSAN TAKLİDİ] arXiv ve sunucu limitlerine karşı ${sec} saniye doğal bekleme yapılıyor...`);
    await sleep(sec * 1000);
};

// 1. Resmi Yüksek Otoriteli RSS Beslemeleri
async function fetchTechRssFeed(feedUrl, sourceName, maxLimit = 25, isTimeOut) {
    if (isTimeOut && isTimeOut()) return [];
    console.log(`[TECH_SCRAPER] Fetching RSS Feed (${sourceName}): ${feedUrl}...`);
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
            const id = `tech_rss_${sourceName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${urlHash}`;
            if (isDuplicate(pool, history, id, url)) continue;

            const content = await fetchCleanContent(url);
            if (content && content.wordCount >= 450) {
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
                console.log(`[+] Added to Tech pool [${results.length + 1}/${maxLimit}]: "${newArticle.title}" (${content.wordCount} words - ${sourceName})`);
                results.push(newArticle);
            }
        }
    } catch (e) {
        console.warn(`[TECH RSS SKIP] ${sourceName}:`, e.message);
    }
    return results;
}

// 2. Dev.to Top Articles API (Sayfalamalı ve Checkpoint Hafızalı)
async function fetchDevToArticles(maxTotalLimit = 60, isTimeOut) {
    console.log(`[TECH_SCRAPER] Fetching Dev.to Top Technical Articles (Checkpoint Destekli)...`);
    const tags = ['ai', 'machinelearning', 'architecture', 'rust', 'devops', 'webdev', 'database'];
    let totalAdded = 0;
    const perTagLimit = Math.ceil(maxTotalLimit / tags.length);

    const state = readState();
    const currentPage = state.tech?.devto_page || 1;

    for (const tag of tags) {
        if (isTimeOut && isTimeOut()) break;
        if (totalAdded >= maxTotalLimit) break;

        try {
            console.log(`[Dev.to] Fetching page ${currentPage} for tag: "${tag}"...`);
            const controller = new AbortController();
            const tId = setTimeout(() => controller.abort(), 12000);
            const res = await fetch(`https://dev.to/api/articles?tag=${tag}&top=7&page=${currentPage}&per_page=15`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LogicCompareHunter/3.0' },
                signal: controller.signal
            });
            clearTimeout(tId);

            if (!res.ok) continue;
            const articles = await res.json();
            if (!Array.isArray(articles)) continue;

            let pool = readPool();
            let history = readHistory();
            let tagAdded = 0;

            for (const article of articles) {
                if (isTimeOut && isTimeOut()) break;
                if (tagAdded >= perTagLimit || totalAdded >= maxTotalLimit) break;

                const url = article.url;
                if (!url) continue;

                const id = `devto_${article.id}`;
                if (isDuplicate(pool, history, id, url)) continue;

                const rawBody = article.body_markdown || article.description || '';
                const wordCount = rawBody.split(/\s+/).filter(Boolean).length;

                if (wordCount >= 160) {
                    const newArticle = {
                        id: id,
                        source: 'Dev.to Technical',
                        category: 'Technology',
                        title: article.title,
                        url: url,
                        text: `<p>${redactSecrets(rawBody.replace(/[*#`]/g, '').trim())}</p>`,
                        score: (article.public_reactions_count || 0) + (article.comments_count || 0),
                        date: parseSafeDate(article.published_at)
                    };
                    pool.push(newArticle);
                    history.push(url);
                    writePool(pool);
                    writeHistory(history);
                    totalAdded++;
                    tagAdded++;
                    console.log(`[+] Added Dev.to [${totalAdded}/${maxTotalLimit}]: "${newArticle.title}" (${tag})`);
                }
            }
        } catch (e) {
            console.warn(`[Dev.to Error for ${tag}]:`, e.message);
        }
    }

    try {
        updateState('tech', { devto_page: currentPage >= 10 ? 1 : currentPage + 1 });
    } catch (e) {}

    return totalAdded;
}

// 3. arXiv AI & Systems Research (Ofset Hafızalı & İnsan Taklitli)
async function fetchArxivTechPapers(maxTotalLimit = 300, isTimeOut) {
    console.log(`[TECH_SCRAPER] Fetching arXiv AI & Systems (İnsan Taklitli 15-30s Gecikme ile)...`);
    
    const queryGroups = [
        { name: 'AI & Machine Learning', query: 'cat:cs.AI+OR+cat:cs.LG' },
        { name: 'Software & Distributed Systems', query: 'cat:cs.SE+OR+cat:cs.DC' },
        { name: 'NLP & Large Language Models', query: 'cat:cs.CL+OR+cat:cs.NE' },
        { name: 'Security & Cryptography', query: 'cat:cs.CR+OR+cat:cs.DB' },
        { name: 'Hardware & Compilers', query: 'cat:cs.AR+OR+cat:cs.PL' }
    ];

    let totalAdded = 0;
    const perGroupTarget = Math.ceil(maxTotalLimit / queryGroups.length);

    const state = readState();
    let currentOffset = state.tech?.arxiv_offset || 0;
    const pageSize = 50;

    for (const group of queryGroups) {
        if (isTimeOut && isTimeOut()) {
            console.log(`[TIME_LIMIT] 50 dakika sınırına gelindi. arXiv güvenle sonlandırılıyor.`);
            break;
        }
        if (totalAdded >= maxTotalLimit) break;

        let groupAdded = 0;
        console.log(`\n======================================================`);
        console.log(`[arXiv Grubu] ${group.name} Taranıyor (Hedef: ${perGroupTarget} makale, Başlangıç Ofset: ${currentOffset})...`);
        console.log(`======================================================`);

        while (groupAdded < perGroupTarget && totalAdded < maxTotalLimit) {
            if (isTimeOut && isTimeOut()) break;

            try {
                const url = `https://export.arxiv.org/api/query?search_query=${group.query}&start=${currentOffset}&max_results=${pageSize}&sortBy=submittedDate&sortOrder=descending`;
                console.log(`[arXiv] İstek gönderiliyor (Offset: ${currentOffset})...`);

                const controller = new AbortController();
                const tId = setTimeout(() => controller.abort(), 35000);
                const res = await fetch(url, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LogicCompareResearch/4.0' },
                    signal: controller.signal
                });
                clearTimeout(tId);

                if (res.status === 429) {
                    console.warn(`[arXiv 429 RATE LIMIT] 45 saniye mola veriliyor...`);
                    await sleep(45000);
                    break;
                }

                if (!res.ok) {
                    console.warn(`[arXiv HTTP ${res.status}] Bu grup atlanıyor.`);
                    break;
                }

                const xmlText = await res.text();
                const dom = new JSDOM(xmlText, { contentType: "text/xml" });
                const entries = dom.window.document.querySelectorAll('entry');

                if (entries.length === 0) {
                    console.log(`[arXiv] Offset ${currentOffset} için sonuç yok.`);
                    break;
                }

                let pool = readPool();
                let history = readHistory();
                let batchAdded = 0;

                for (const entry of entries) {
                    if (isTimeOut && isTimeOut()) break;
                    if (groupAdded >= perGroupTarget || totalAdded >= maxTotalLimit) break;

                    const idEl = entry.querySelector('id');
                    const titleEl = entry.querySelector('title');
                    const summaryEl = entry.querySelector('summary');
                    const publishedEl = entry.querySelector('published');

                    const paperUrl = idEl ? idEl.textContent.trim() : null;
                    const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : 'Research Paper';
                    const abstract = summaryEl ? summaryEl.textContent.replace(/\s+/g, ' ').trim() : '';
                    const pubDate = parseSafeDate(publishedEl ? publishedEl.textContent : null);

                    if (!paperUrl) continue;

                    const arxivIdMatch = paperUrl.match(/abs\/(.+)$/);
                    const arxivId = arxivIdMatch ? arxivIdMatch[1] : Buffer.from(paperUrl).toString('base64').substring(0, 16);
                    const id = `arxiv_${arxivId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

                    if (isDuplicate(pool, history, id, paperUrl)) continue;

                    const wordCount = abstract.split(/\s+/).filter(Boolean).length;
                    if (wordCount >= 70) {
                        const newArticle = {
                            id: id,
                            source: 'arXiv CS Research',
                            category: 'Technology',
                            title: title,
                            url: paperUrl,
                            text: `<p><strong>Abstract:</strong> ${redactSecrets(abstract)}</p>`,
                            date: pubDate
                        };
                        pool.push(newArticle);
                        history.push(paperUrl);
                        writePool(pool);
                        writeHistory(history);
                        totalAdded++;
                        groupAdded++;
                        batchAdded++;
                        console.log(`[+] Added arXiv Tech [${totalAdded}/${maxTotalLimit}]: "${title.substring(0, 60)}..."`);
                    }
                }

                console.log(`-> [arXiv Offset ${currentOffset}] ${batchAdded} yeni altın makale eklendi.`);
                currentOffset += pageSize;
                updateState('tech', { arxiv_offset: currentOffset });

                if (groupAdded < perGroupTarget && totalAdded < maxTotalLimit) {
                    await humanRandomSleep(15, 28);
                }

            } catch (err) {
                console.warn(`[arXiv Hatası]:`, err.message);
                break;
            }
        }
    }

    return totalAdded;
}

// 4. Hacker News Top Stories
async function fetchHackerNewsTopTechnical(maxTotalLimit = 50, isTimeOut) {
    console.log(`[TECH_SCRAPER] Fetching Hacker News Top Stories (+80 Karma)...`);
    const keywords = ['AI', 'LLM', 'compiler', 'database', 'Rust', 'Linux', 'architecture'];
    let totalAdded = 0;
    const perKwLimit = Math.ceil(maxTotalLimit / keywords.length);

    for (const kw of keywords) {
        if (isTimeOut && isTimeOut()) break;
        if (totalAdded >= maxTotalLimit) break;

        try {
            const controller = new AbortController();
            const tId = setTimeout(() => controller.abort(), 12000);
            const res = await fetch(`https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(kw)}&tags=story&numericFilters=points>80&hitsPerPage=20`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LogicCompareHN/3.0' },
                signal: controller.signal
            });
            clearTimeout(tId);

            if (!res.ok) continue;
            const data = await res.json();
            const hits = data.hits || [];

            let pool = readPool();
            let history = readHistory();
            let addedForKw = 0;

            for (const item of hits) {
                if (isTimeOut && isTimeOut()) break;
                if (addedForKw >= perKwLimit || totalAdded >= maxTotalLimit) break;

                const itemUrl = item.url;
                if (!itemUrl || !itemUrl.startsWith('http')) continue;

                const id = `hn_${item.objectID}`;
                if (isDuplicate(pool, history, id, itemUrl)) continue;

                const content = await fetchCleanContent(itemUrl);
                if (content && content.wordCount >= 160) {
                    const newArticle = {
                        id: id,
                        source: 'HackerNews Algolia',
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
            console.warn(`[HN SKIP for ${kw}]:`, e.message);
        }
    }
    return totalAdded;
}

export async function runTechScraper(targetCount = 400, isTimeOut) {
    console.log(`\n==================================================`);
    console.log(`🚀 Avcı Bot (Technology) Başlatılıyor. Hedef: ${targetCount} Konu`);
    console.log(`==================================================\n`);

    // 1. Resmi Tier-1 Küresel Teknoloji RSS Akışları
    const rssFeeds = [
        { url: 'https://devblogs.microsoft.com/feed/', name: 'Microsoft DevBlogs' },
        { url: 'https://blog.cloudflare.com/rss/', name: 'Cloudflare Engineering' },
        { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', name: 'Ars Technica' },
        { url: 'https://techcrunch.com/feed/', name: 'TechCrunch' },
        { url: 'https://www.theverge.com/rss/index.xml', name: 'The Verge' },
        { url: 'https://venturebeat.com/category/ai/feed/', name: 'VentureBeat AI' },
        { url: 'https://www.engadget.com/rss.xml', name: 'Engadget' },
        { url: 'https://aws.amazon.com/blogs/architecture/feed/', name: 'AWS Architecture' },
        { url: 'https://github.blog/feed/', name: 'GitHub Engineering' },
        { url: 'https://feed.infoq.com/', name: 'InfoQ Architecture' },
        { url: 'https://netflixtechblog.com/feed', name: 'Netflix TechBlog' }
    ];

    for (const feed of rssFeeds) {
        if (isTimeOut && isTimeOut()) break;
        await fetchTechRssFeed(feed.url, feed.name, 15, isTimeOut);
    }

    // 2. Dev.to Top Articles (Sayfalı ve Checkpoint Hafızalı)
    if (!isTimeOut || !isTimeOut()) {
        await fetchDevToArticles(60, isTimeOut);
    }

    // 3. arXiv (15-30s İnsan Taklitli Gecikmeli & Ofset Hafızalı)
    if (!isTimeOut || !isTimeOut()) {
        const arxivLimit = Math.floor(targetCount * 0.45);
        await fetchArxivTechPapers(arxivLimit, isTimeOut);
    }

    // 4. HackerNews Trendleri
    if (!isTimeOut || !isTimeOut()) {
        const hnLimit = Math.floor(targetCount * 0.25);
        await fetchHackerNewsTopTechnical(hnLimit, isTimeOut);
    }

    console.log(`\n✅ Avcı Bot (Technology) tamamlandı. Havuz güncellendi.`);
}

if (process.argv[1]?.endsWith('LGscraper_Tech.js')) {
    const target = parseInt(process.argv[2], 10) || 400;
    runTechScraper(target).then(() => process.exit(0));
}
