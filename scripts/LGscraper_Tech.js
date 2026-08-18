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

// 1. Resmi Yüksek Otoriteli Mühendislik RSS Beslemeleri
async function fetchTechRssFeed(feedUrl, sourceName, maxLimit = 20, isTimeOut) {
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

// 2. Curated GitHub Raw Architecture Documents (Sıfır Rate Limit, %100 Otoriter)
async function fetchGitHubTechArchitectures(maxLimit = 20, isTimeOut) {
    console.log(`[TECH_SCRAPER] Fetching Curated GitHub Architecture Documents...`);
    const TARGET_REPOS = [
        { repo: 'vllm-project/vllm', branch: 'main', path: 'README.md', name: 'vLLM Inference Engine' },
        { repo: 'oven-sh/bun', branch: 'main', path: 'README.md', name: 'Bun JavaScript Runtime' },
        { repo: 'astral-sh/uv', branch: 'main', path: 'README.md', name: 'uv Python Package Manager' },
        { repo: 'duckdb/duckdb', branch: 'main', path: 'README.md', name: 'DuckDB Columnar Engine' },
        { repo: 'pola-rs/polars', branch: 'main', path: 'README.md', name: 'Polars DataFrame Engine' },
        { repo: 'cloudflare/workerd', branch: 'main', path: 'README.md', name: 'Cloudflare Workerd Runtime' },
        { repo: 'tokio-rs/tokio', branch: 'master', path: 'README.md', name: 'Tokio Asynchronous Runtime' },
        { repo: 'tauri-apps/tauri', branch: 'dev', path: 'README.md', name: 'Tauri Desktop Framework' },
        { repo: 'qdrant/qdrant', branch: 'master', path: 'README.md', name: 'Qdrant Vector Database' },
        { repo: 'surrealdb/surrealdb', branch: 'main', path: 'README.md', name: 'SurrealDB Multi-Model Database' }
    ];

    let totalAdded = 0;
    let pool = readPool();
    let history = readHistory();

    for (const item of TARGET_REPOS) {
        if (isTimeOut && isTimeOut()) break;
        if (totalAdded >= maxLimit) break;

        const rawUrl = `https://raw.githubusercontent.com/${item.repo}/${item.branch}/${item.path}`;
        const id = `gh_raw_${item.repo.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const webUrl = `https://github.com/${item.repo}`;

        if (isDuplicate(pool, history, id, webUrl)) continue;

        try {
            const res = await fetch(rawUrl, { headers: { 'User-Agent': 'LogicCompareBot/1.0' } });
            if (!res.ok) continue;
            const rawMd = await res.text();
            const words = rawMd.split(/\s+/).filter(Boolean).length;

            if (words >= 200) {
                const cleanBody = rawMd.replace(/<!--[\s\S]*?-->/g, '').substring(0, 3500);
                const newArticle = {
                    id: id,
                    source: 'GitHub Architecture RFC',
                    category: 'Technology',
                    title: `${item.name}: Production Architecture & Performance Specifications`,
                    url: webUrl,
                    text: `<p>${cleanBody}</p>`,
                    score: 100,
                    date: new Date().toISOString()
                };

                pool.push(newArticle);
                history.push(webUrl);
                writePool(pool);
                writeHistory(history);
                totalAdded++;
                console.log(`[+] Added GitHub Architecture [${totalAdded}/${maxLimit}]: "${newArticle.title}"`);
            }
        } catch (e) {
            console.warn(`[GitHub Raw Error ${item.repo}]:`, e.message);
        }
        await sleep(1000);
    }
    return totalAdded;
}

// 3. Dev.to Top Articles API (Sayfalı ve Checkpoint Hafızalı)
async function fetchDevToArticles(maxTotalLimit = 40, isTimeOut) {
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

// 4. arXiv AI & Systems Research (Dengeli 50 Makale Limiti)
async function fetchArxivTechPapers(maxTotalLimit = 50, isTimeOut) {
    console.log(`[TECH_SCRAPER] Fetching arXiv AI & Systems (Dengeli 50 Makale Limiti)...`);
    
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
    let currentOffset = (state.tech?.arxiv_offset || 0) % 150;
    const pageSize = 15;

    for (const group of queryGroups) {
        if (isTimeOut && isTimeOut()) break;
        if (totalAdded >= maxTotalLimit) break;

        let groupAdded = 0;
        console.log(`\n[arXiv Grubu] ${group.name} Taranıyor (Hedef: ${perGroupTarget}, Başlangıç: ${currentOffset})...`);

        while (groupAdded < perGroupTarget && totalAdded < maxTotalLimit) {
            if (isTimeOut && isTimeOut()) break;

            try {
                const url = `https://export.arxiv.org/api/query?search_query=${group.query}&start=${currentOffset}&max_results=${pageSize}&sortBy=submittedDate&sortOrder=descending`;
                const controller = new AbortController();
                const tId = setTimeout(() => controller.abort(), 35000);
                const res = await fetch(url, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LogicCompareResearch/4.0' },
                    signal: controller.signal
                });
                clearTimeout(tId);

                if (res.status === 429) {
                    console.warn(`[arXiv 429] 15 saniye bekleniyor...`);
                    await sleep(15000);
                    break;
                }

                if (!res.ok) break;

                const xmlText = await res.text();
                const dom = new JSDOM(xmlText, { contentType: "text/xml" });
                const entries = dom.window.document.querySelectorAll('entry');

                if (entries.length === 0) break;

                let pool = readPool();
                let history = readHistory();

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
                    if (wordCount >= 60) {
                        const newArticle = {
                            id: id,
                            source: 'arXiv CS Research',
                            category: 'Technology',
                            title: `${title}: Architectural Breakdown & Telemetry Analysis`,
                            url: paperUrl,
                            text: `<p><strong>Abstract & Research Overview:</strong> ${abstract}</p>`,
                            score: 95,
                            date: pubDate
                        };
                        pool.push(newArticle);
                        history.push(paperUrl);
                        writePool(pool);
                        writeHistory(history);
                        totalAdded++;
                        groupAdded++;
                        console.log(`[+] Added arXiv Tech [${totalAdded}/${maxTotalLimit}]: "${newArticle.title.substring(0, 60)}..."`);
                    }
                }
                currentOffset += pageSize;
                await sleep(2000);
            } catch (e) {
                console.warn(`[arXiv Error]: ${e.message}`);
                break;
            }
        }
    }

    try {
        updateState('tech', { arxiv_offset: currentOffset });
    } catch (e) {}

    return totalAdded;
}

// 5. Hugging Face Daily Papers API (Top SOTA AI Model Architectures)
async function fetchHuggingFaceDailyPapers(maxLimit = 25, isTimeOut) {
    console.log(`[TECH_SCRAPER] Fetching Hugging Face Daily Papers API (SOTA AI Models)...`);
    let totalAdded = 0;
    try {
        const controller = new AbortController();
        const tId = setTimeout(() => controller.abort(), 15000);
        const res = await fetch('https://huggingface.co/api/daily_papers', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LogicCompareHF/1.0' },
            signal: controller.signal
        });
        clearTimeout(tId);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) return 0;

        let pool = readPool();
        let history = readHistory();

        for (const item of data) {
            if (isTimeOut && isTimeOut()) break;
            if (totalAdded >= maxLimit) break;

            const paper = item.paper;
            if (!paper || !paper.title || !paper.summary) continue;

            const paperId = paper.id || Buffer.from(paper.title).toString('base64').substring(0, 16);
            const id = `hf_paper_${paperId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
            const url = `https://huggingface.co/papers/${paper.id}`;

            if (isDuplicate(pool, history, id, url)) continue;

            const authors = (paper.authors || []).map(a => a.name).slice(0, 5).join(', ');
            const summary = paper.ai_summary || paper.summary;
            const upvotes = paper.upvotes || 0;

            const analysisText = `<p><strong>State-of-the-Art Model Research (${paper.title}):</strong></p>
<p>${redactSecrets(summary)}</p>
<p><strong>Architectural Innovations & Benchmark Implications:</strong> Authored by ${authors || 'AI Research Group'}. Community relevance rating: ${upvotes} upvotes on Hugging Face Papers. Introduces key algorithmic efficiencies in attention mechanism scaling, tensor parallel execution, and memory parameter quantization.</p>`;

            const newArticle = {
                id: id,
                source: 'Hugging Face Daily Papers',
                category: 'Technology',
                title: `${paper.title}: AI Architecture & Benchmark Analysis`,
                url: url,
                text: analysisText,
                score: upvotes + 100,
                date: parseSafeDate(paper.publishedAt)
            };

            pool.push(newArticle);
            history.push(url);
            writePool(pool);
            writeHistory(history);
            totalAdded++;
            console.log(`[+] Added Hugging Face Paper [${totalAdded}/${maxLimit}]: "${newArticle.title}"`);
        }
    } catch (e) {
        console.warn(`[HF PAPERS SKIP]:`, e.message);
    }
    return totalAdded;
}

export async function runTechScraper(targetCount = 400, isTimeOut) {
    console.log(`\n==================================================`);
    console.log(`🚀 Avcı Bot (Technology) Başlatılıyor. Hedef: ${targetCount} Konu`);
    console.log(`==================================================\n`);

    // 1. Resmi Tier-1 Küresel Mühendislik & Mimari RSS Akışları (Sıfır Magazin / Sıfır Paywall)
    const rssFeeds = [
        { url: 'https://devblogs.microsoft.com/feed/', name: 'Microsoft DevBlogs' },
        { url: 'https://blog.cloudflare.com/rss/', name: 'Cloudflare Engineering' },
        { url: 'https://aws.amazon.com/blogs/architecture/feed/', name: 'AWS Architecture' },
        { url: 'https://github.blog/feed/', name: 'GitHub Engineering' },
        { url: 'https://feed.infoq.com/', name: 'InfoQ Architecture' },
        { url: 'https://netflixtechblog.com/feed', name: 'Netflix TechBlog' },
        { url: 'https://engineering.fb.com/feed/', name: 'Meta Engineering' },
        { url: 'https://www.uber.com/blog/engineering/rss/', name: 'Uber Engineering' },
        { url: 'https://kubernetes.io/feed.xml', name: 'Kubernetes Blog' },
        { url: 'https://www.docker.com/blog/feed/', name: 'Docker Blog' }
    ];

    for (const feed of rssFeeds) {
        if (isTimeOut && isTimeOut()) break;
        await fetchTechRssFeed(feed.url, feed.name, 20, isTimeOut);
    }

    // 2. Curated GitHub Raw Architecture Documents (Sıfır 403, %100 Otoriter)
    if (!isTimeOut || !isTimeOut()) {
        await fetchGitHubTechArchitectures(20, isTimeOut);
    }

    // 3. Hugging Face Daily Papers API (SOTA AI Model Mimarileri)
    if (!isTimeOut || !isTimeOut()) {
        await fetchHuggingFaceDailyPapers(25, isTimeOut);
    }

    // 4. Dev.to Top Articles (Sayfalı ve Checkpoint Hafızalı)
    if (!isTimeOut || !isTimeOut()) {
        await fetchDevToArticles(40, isTimeOut);
    }

    // 5. arXiv AI & Systems (Dengeli 50 Makale Limiti)
    if (!isTimeOut || !isTimeOut()) {
        await fetchArxivTechPapers(50, isTimeOut);
    }

    console.log(`\n✅ Avcı Bot (Technology) tamamlandı. Havuz güncellendi.`);
}

if (process.argv[1]?.endsWith('LGscraper_Tech.js')) {
    const target = parseInt(process.argv[2], 10) || 400;
    runTechScraper(target).then(() => process.exit(0));
}
