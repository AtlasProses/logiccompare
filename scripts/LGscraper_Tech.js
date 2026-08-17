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

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// İnsan Benzeri Rastgele Gecikme (15 sn ile 35 sn arası dinamik bekleme)
const humanRandomSleep = async (minSec = 15, maxSec = 32) => {
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
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' },
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
            if (content && content.wordCount >= 160) {
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
        console.warn(`[TECH RSS SKIP] ${sourceName}:`, e.message);
    }
    return results;
}

// 2. Dev.to Top Technical Articles API (Garantili Yüksek Kalite Teknik Makaleler)
async function fetchDevToArticles(maxLimit = 100, isTimeOut) {
    console.log(`[TECH_SCRAPER] Fetching Dev.to Top Technical Articles (AI, Architecture, Rust, DevOps)...`);
    const tags = ['ai', 'machinelearning', 'architecture', 'rust', 'devops', 'webdev', 'database'];
    let totalAdded = 0;

    for (const tag of tags) {
        if (isTimeOut && isTimeOut()) break;
        if (totalAdded >= maxLimit) break;

        try {
            console.log(`[Dev.to] Fetching top articles for tag: "${tag}"...`);
            const url = `https://dev.to/api/articles?tag=${tag}&top=180&per_page=20`;
            const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            if (!res.ok) continue;
            const articles = await res.json();

            let pool = readPool();
            let history = readHistory();

            for (const item of articles) {
                if (isTimeOut && isTimeOut()) break;
                if (totalAdded >= maxLimit) break;
                if (!item.url || item.comments_count < 1) continue;

                const id = `tech_devto_${item.id}`;
                if (isDuplicate(pool, history, id, item.url)) continue;

                const content = await fetchCleanContent(item.url);
                if (content && content.wordCount >= 180) {
                    const newArticle = {
                        id: id,
                        source: `Dev.to (${tag})`,
                        category: 'Technology',
                        title: content.title || item.title,
                        url: item.url,
                        text: content.text,
                        score: item.positive_reactions_count || 50,
                        date: parseSafeDate(item.published_at)
                    };
                    pool.push(newArticle);
                    history.push(item.url);
                    writePool(pool);
                    writeHistory(history);
                    totalAdded++;
                    console.log(`[+] Added Dev.to [${totalAdded}/${maxLimit}]: "${newArticle.title}"`);
                }
            }
        } catch (e) {
            console.warn(`[Dev.to Error for ${tag}]:`, e.message);
        }
    }
    return totalAdded;
}

// 3. arXiv AI & Computer Science Research (15-35 sn İnsan Gecikmesi + HTTPS + Toplu Paketler)
async function fetchArxivTechPapers(maxTotalLimit = 400, isTimeOut) {
    console.log(`[TECH_SCRAPER] Fetching arXiv AI & Systems (İnsan Taklitli 15-30s Gecikme ile)...`);
    
    // Kategorileri tek tek bombalamak yerine gruplandırıp 50'şerlik toplu paketlerle çekiyoruz
    const queryGroups = [
        { name: 'AI & Machine Learning', query: 'cat:cs.AI+OR+cat:cs.LG' },
        { name: 'Software & Distributed Systems', query: 'cat:cs.SE+OR+cat:cs.DC' },
        { name: 'NLP & Large Language Models', query: 'cat:cs.CL+OR+cat:cs.NE' },
        { name: 'Security & Cryptography', query: 'cat:cs.CR+OR+cat:cs.DB' },
        { name: 'Hardware & Compilers', query: 'cat:cs.AR+OR+cat:cs.PL' }
    ];

    let totalAdded = 0;
    const perGroupTarget = Math.ceil(maxTotalLimit / queryGroups.length);

    for (const group of queryGroups) {
        if (isTimeOut && isTimeOut()) {
            console.log(`[TIME_LIMIT] 50 dakika sınırına gelindi. arXiv güvenle sonlandırılıyor.`);
            break;
        }
        if (totalAdded >= maxTotalLimit) break;

        let offset = 0;
        let groupAdded = 0;
        const maxOffset = 500;
        const pageSize = 50;

        console.log(`\n======================================================`);
        console.log(`[arXiv Grubu] ${group.name} Taranıyor (Hedef: ${perGroupTarget} makale)...`);
        console.log(`======================================================`);

        while (offset <= maxOffset && groupAdded < perGroupTarget && totalAdded < maxTotalLimit) {
            if (isTimeOut && isTimeOut()) break;

            try {
                // HTTPS + temiz parametre
                const url = `https://export.arxiv.org/api/query?search_query=${group.query}&start=${offset}&max_results=${pageSize}&sortBy=submittedDate&sortOrder=descending`;
                console.log(`[arXiv] İstek gönderiliyor (Offset: ${offset})...`);

                const controller = new AbortController();
                const tId = setTimeout(() => controller.abort(), 20000);
                const res = await fetch(url, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LogicCompareResearch/3.0' },
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
                    console.log(`[arXiv] Offset ${offset} için sonuç yok.`);
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

                    if (!paperUrl || abstract.length < 180) continue;

                    const id = `tech_arxiv_${Buffer.from(paperUrl).toString('base64').substring(0, 16)}`;
                    if (isDuplicate(pool, history, id, paperUrl)) continue;

                    const newArticle = {
                        id: id,
                        source: `arXiv Research (${group.name})`,
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
                    groupAdded++;
                    batchAdded++;
                    console.log(`[+] Added arXiv Paper [Toplam: ${totalAdded}/${maxTotalLimit}]: "${title.substring(0, 55)}..."`);
                }

                console.log(`-> [arXiv Offset ${offset}] ${batchAdded} yeni altın makale eklendi.`);
                offset += pageSize;

                // İnsan taklidi: 15 ile 32 saniye arası rastgele bekle
                await humanRandomSleep(15, 32);

            } catch (e) {
                console.warn(`[arXiv Hatası]:`, e.message);
                break;
            }
        }
    }
    return totalAdded;
}

// 4. HackerNews Top Technical Stories (2025-2027 Trend Keywords)
async function fetchHackerNewsTopTechnical(maxTotalLimit = 300, isTimeOut) {
    console.log(`[TECH_SCRAPER] Fetching HackerNews 2025-2027 Trend Stories...`);
    const trendKeywords = [
        'DeepSeek', 'Llama', 'Agent', 'vLLM', 'Rust', 'Kubernetes',
        'Postgres', 'Cloudflare', 'Compiler', 'WebAssembly', 'Vector',
        'Zero Trust', 'Benchmark', 'GPU', 'Next.js', 'Distributed',
        'TypeScript', 'Microservices', 'PyTorch', 'Concurrency'
    ];

    let totalAdded = 0;
    const perKeywordLimit = Math.max(10, Math.ceil(maxTotalLimit / trendKeywords.length));

    for (const kw of trendKeywords) {
        if (isTimeOut && isTimeOut()) break;
        if (totalAdded >= maxTotalLimit) break;

        try {
            console.log(`[HN] Searching "${kw}"...`);
            const SIXTY_DAYS_AGO = Math.floor(Date.now() / 1000) - (180 * 24 * 60 * 60);
            const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(kw)}&tags=story&numericFilters=created_at_i>${SIXTY_DAYS_AGO},points>40&hitsPerPage=25`;
            
            const controller = new AbortController();
            const tId = setTimeout(() => controller.abort(), 12000);
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(tId);

            if (!res.ok) continue;
            const data = await res.json();

            let pool = readPool();
            let history = readHistory();
            let addedForKw = 0;

            for (const item of (data.hits || [])) {
                if (isTimeOut && isTimeOut()) break;
                if (addedForKw >= perKeywordLimit || totalAdded >= maxTotalLimit) break;
                const itemUrl = item.url;
                if (!itemUrl || itemUrl.includes('youtube.com') || itemUrl.includes('twitter.com') || itemUrl.includes('x.com')) continue;

                const id = `tech_hn_${item.objectID}`;
                if (isDuplicate(pool, history, id, itemUrl)) continue;

                const content = await fetchCleanContent(itemUrl);
                if (content && content.wordCount >= 160) {
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
            console.warn(`[HN SKIP for ${kw}]:`, e.message);
        }
    }
    return totalAdded;
}

export async function runTechScraper(targetCount = 1000, isTimeOut) {
    console.log(`\n==================================================`);
    console.log(`🚀 Avcı Bot (Technology) Başlatılıyor. Hedef: ${targetCount} Konu`);
    console.log(`==================================================\n`);

    // 1. Resmi Otoriter RSS'ler
    const rssFeeds = [
        { url: 'https://devblogs.microsoft.com/feed/', name: 'Microsoft DevBlogs' },
        { url: 'https://blog.cloudflare.com/rss/', name: 'Cloudflare Engineering' },
        { url: 'https://aws.amazon.com/blogs/architecture/feed/', name: 'AWS Architecture' },
        { url: 'https://github.blog/feed/', name: 'GitHub Engineering' },
        { url: 'https://feed.infoq.com/', name: 'InfoQ Architecture' },
        { url: 'https://netflixtechblog.com/feed', name: 'Netflix TechBlog' },
        { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', name: 'Ars Technica' }
    ];

    for (const feed of rssFeeds) {
        if (isTimeOut && isTimeOut()) break;
        await fetchTechRssFeed(feed.url, feed.name, 15, isTimeOut);
    }

    // 2. Dev.to Top Articles (Garantili Teknik Makaleler)
    if (!isTimeOut || !isTimeOut()) {
        await fetchDevToArticles(100, isTimeOut);
    }

    // 3. arXiv (15-35s İnsan Taklitli Gecikmeli)
    if (!isTimeOut || !isTimeOut()) {
        const arxivLimit = Math.floor(targetCount * 0.45);
        await fetchArxivTechPapers(arxivLimit, isTimeOut);
    }

    // 4. HackerNews Trendleri
    if (!isTimeOut || !isTimeOut()) {
        const hnLimit = Math.floor(targetCount * 0.35);
        await fetchHackerNewsTopTechnical(hnLimit, isTimeOut);
    }

    console.log(`\n✅ Avcı Bot (Technology) tamamlandı. Havuz güncellendi.`);
}

if (process.argv[1]?.endsWith('LGscraper_Tech.js')) {
    const target = parseInt(process.argv[2], 10) || 1000;
    runTechScraper(target).then(() => process.exit(0));
}
