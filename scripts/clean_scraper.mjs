import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

// Realistic User Agent Pool
const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/605.1.15"
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchCleanContent(url) {
    const delay = Math.floor(Math.random() * 5000) + 2000;
    console.log(`[ANTI-BAN] ${delay}ms delay...`);
    await sleep(delay);

    console.log(`[CLEAN_SCRAPER] Fetching: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": getRandomUserAgent(),
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124"',
                "Sec-Ch-Ua-Mobile": "?0",
                "Sec-Ch-Ua-Platform": '"Windows"',
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
                "Upgrade-Insecure-Requests": "1"
            },
            redirect: "follow",
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`[HTTP ERROR] ${response.status} - ${url}`);
            return null;
        }

        const html = await response.text();
        const doc = new JSDOM(html, { url });
        const document = doc.window.document;

        // --- 1. SPECIAL DOMAIN PARSERS ---
        // arXiv Parser
        if (url.includes('arxiv.org')) {
            const titleEl = document.querySelector('h1.title');
            const abstractEl = document.querySelector('blockquote.abstract');
            if (titleEl && abstractEl) {
                const cleanTitle = titleEl.textContent.replace(/^Title:/i, '').trim();
                const cleanText = abstractEl.textContent.replace(/^Abstract:/i, '').trim();
                console.log(`[+] [arXiv Parser] Clean title and abstract extracted.`);
                return {
                    title: cleanTitle,
                    text: `<p>${cleanText}</p>`,
                    excerpt: cleanText.substring(0, 200)
                };
            }
        }

        // --- 2. GARBAGE PURGING (Remove Menus, Footers, Ads, Scripts, Comments) ---
        const garbageSelectors = [
            'script', 'style', 'noscript', 'iframe', 'svg', 'nav', 'header', 'footer', 'aside',
            '.sidebar', '.comments', '.comment-list', '.ad', '.advertisement', '.social-share',
            '#comments', '#nav', '#header', '#footer', '[role="banner"]', '[role="navigation"]'
        ];
        garbageSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.remove());
        });

        // Strip <a> tags keeping text content
        document.querySelectorAll('a').forEach(a => {
            const text = document.createTextNode(a.textContent);
            a.replaceWith(text);
        });

        // --- 3. TITLE EXTRACTION ---
        let extractedTitle = null;
        const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
        const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.content;
        const h1Title = document.querySelector('h1')?.textContent?.trim();
        const docTitle = document.title?.trim();

        extractedTitle = ogTitle || twitterTitle || h1Title || docTitle || 'Untitled Article';

        // --- 4. BODY / TEXT EXTRACTION (Readability with Fallback) ---
        let extractedContent = null;
        
        try {
            const reader = new Readability(document.cloneNode(true));
            const article = reader.parse();
            if (article && article.content) {
                extractedContent = article.content;
                if (!extractedTitle || extractedTitle === 'Untitled Article') {
                    extractedTitle = article.title;
                }
            }
        } catch (e) {
            console.warn(`[READABILITY WARN] Failed: ${e.message}`);
        }

        // Fallback: Custom Container / Paragraph Collector if Readability failed or returned weak content
        if (!extractedContent || extractedContent.replace(/<[^>]+>/g, '').split(/\s+/).length < 120) {
            console.log(`[FALLBACK] Readability insufficient. Using DOM container fallback...`);
            const containerSelectors = [
                'article', 'main', '[role="main"]', '.content', '.post-content',
                '.entry-content', '.article-body', '.article-content', '.story-body'
            ];
            
            let containerNode = null;
            for (const sel of containerSelectors) {
                const node = document.querySelector(sel);
                if (node && node.textContent.trim().length > 300) {
                    containerNode = node;
                    break;
                }
            }

            if (containerNode) {
                extractedContent = containerNode.innerHTML;
            } else {
                // Last resort: collect all <p> tags
                const paragraphs = Array.from(document.querySelectorAll('p'))
                    .map(p => p.textContent.trim())
                    .filter(t => t.length > 40);
                if (paragraphs.length > 0) {
                    extractedContent = paragraphs.map(t => `<p>${t}</p>`).join('\n');
                }
            }
        }

        if (!extractedContent) {
            console.error(`[EXTRACT ERROR] No content could be extracted from: ${url}`);
            return null;
        }

        // --- 5. CLEANING HTML & CHECKING WORD COUNT ---
        const cleanDom = new JSDOM(extractedContent);
        const cleanDoc = cleanDom.window.document;
        
        // Strip attributes (class, id, style)
        const elements = cleanDoc.getElementsByTagName('*');
        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            while (el.attributes.length > 0) {
                el.removeAttribute(el.attributes[0].name);
            }
        }

        const rawText = cleanDoc.body.textContent || '';
        const wordCount = rawText.trim().split(/\s+/).filter(Boolean).length;

        if (wordCount < 120) {
            console.log(`[FILTER] Content too short (${wordCount} words). Skipping: ${url}`);
            return null;
        }

        console.log(`[SUCCESS] Extracted "${extractedTitle}" (${wordCount} words)`);
        return {
            title: extractedTitle.replace(/\s+/g, ' ').trim(),
            text: cleanDoc.body.innerHTML.trim(),
            excerpt: rawText.trim().substring(0, 200)
        };

    } catch (e) {
        clearTimeout(timeoutId);
        console.error(`[CATCH ERROR] ${e.message} - ${url}`);
        return null;
    }
}

