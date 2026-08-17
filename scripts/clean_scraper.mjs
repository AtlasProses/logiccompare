import { Readability } from '@mozilla/readability';
import { JSDOM, VirtualConsole } from 'jsdom';

const virtualConsole = new VirtualConsole();
virtualConsole.on("error", () => {});
virtualConsole.on("warn", () => {});

// Realistic Multi-Platform User Agent Pool
const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:129.0) Gecko/20100101 Firefox/129.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Redacts secrets, tokens, and private API keys before writing to pool
 */
export function redactSecrets(content) {
    if (!content || typeof content !== 'string') return content;
    return content
        // Hugging Face Tokens (hf_...)
        .replace(/\bhf_[a-zA-Z0-9]{30,}\b/g, 'hf_SAMPLE_REDACTED_TOKEN')
        // OpenAI / Anthropic API Keys (sk-..., sk-ant-...)
        .replace(/\bsk-(?:ant-)?[a-zA-Z0-9_-]{20,}\b/g, 'sk-SAMPLE_REDACTED_KEY')
        // GitHub Personal Access Tokens (ghp_..., gho_..., github_pat_...)
        .replace(/\b(?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36}\b/g, 'ghp_SAMPLE_REDACTED_TOKEN')
        .replace(/\bgithub_pat_[a-zA-Z0-9_]{50,}\b/g, 'github_pat_SAMPLE_REDACTED_TOKEN')
        // AWS Access Key ID (AKIA...)
        .replace(/\bAKIA[0-9A-Z]{16}\b/g, 'AKIA_SAMPLE_REDACTED_KEY')
        // Google Cloud API Keys (AIza...)
        .replace(/\bAIza[0-9A-Za-z_-]{35}\b/g, 'AIza_SAMPLE_REDACTED_KEY')
        // Slack / Discord Tokens & Webhooks
        .replace(/\bxox[baprs]-[0-9a-zA-Z]{10,48}\b/g, 'xoxb-SAMPLE_REDACTED_TOKEN')
        .replace(/https:\/\/(?:hooks\.slack\.com\/services|discord\.com\/api\/webhooks)\/[^\s"']+/g, 'https://hooks.slack.com/services/REDACTED')
        // Private Keys
        .replace(/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g, '[REDACTED_PRIVATE_KEY]');
}

/**
 * Sanitizes and formats clean article titles without clickbait junk
 */
export function sanitizeTitle(rawTitle) {
    if (!rawTitle) return "Untitled Technical Report";
    let cleaned = rawTitle
        .replace(/[*_#`"']/g, '') // Strip markdown formatting and quotes
        .replace(/\s*[-|–—:]\s*(9to5Mac|CoinDesk|CoinTelegraph|BBC Sport|PC Gamer|GameSpot|Hacker News|ArXiv|Blog|Wccftech|Eurogamer|IGN|Decrypt|Polygon|GamesRadar|The Guardian|Sky Sports|TechCrunch|The Verge|Yahoo Finance|MarketWatch).*$/i, '') // Strip site brand suffixes
        .replace(/\s+/g, ' ')
        .trim();
    return redactSecrets(cleaned);
}

/**
 * Purges boilerplate, ad text, and low-quality spam from text
 */
function cleanBoilerplate(text) {
    if (!text) return "";
    return text
        .replace(/Subscribe to our newsletter.*?(\n|$)/gi, '')
        .replace(/Sign up for.*?(\n|$)/gi, '')
        .replace(/Follow us on (Twitter|X|Telegram|YouTube|Facebook).*?(\n|$)/gi, '')
        .replace(/All rights reserved.*?(\n|$)/gi, '')
        .replace(/Click here to read more.*?(\n|$)/gi, '')
        .replace(/Disclaimer:.*?(financial advice|not an endorsement).*?(\n|$)/gi, '')
        .trim();
}

/**
 * Fetches and deeply sanitizes web content (HTML -> Clean, Structured Content)
 */
export async function fetchCleanContent(url) {
    const delay = Math.floor(Math.random() * 2000) + 1200;
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
                "Sec-Ch-Ua": '"Chromium";v="128", "Google Chrome";v="128"',
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
        const doc = new JSDOM(html, { url, virtualConsole });
        const document = doc.window.document;

        // --- 1. SPECIAL DOMAIN PARSERS ---
        // arXiv Parser
        if (url.includes('arxiv.org')) {
            const titleEl = document.querySelector('h1.title');
            const abstractEl = document.querySelector('blockquote.abstract');
            if (titleEl && abstractEl) {
                const cleanTitle = sanitizeTitle(titleEl.textContent.replace(/^Title:/i, '').trim());
                const cleanText = redactSecrets(cleanBoilerplate(abstractEl.textContent.replace(/^Abstract:/i, '').trim()));
                console.log(`[+] [arXiv Parser] Extracted: "${cleanTitle}"`);
                return {
                    title: cleanTitle,
                    text: `<p>${cleanText}</p>`,
                    excerpt: cleanText.substring(0, 200),
                    wordCount: cleanText.split(/\s+/).filter(Boolean).length
                };
            }
        }

        // --- 2. DEEP GARBAGE & AD PURGING ---
        const garbageSelectors = [
            'script', 'style', 'noscript', 'iframe', 'svg', 'nav', 'header', 'footer', 'aside',
            'form', 'button', 'input', 'select', 'textarea',
            '.sidebar', '.comments', '.comment-list', '.ad', '.advertisement', '.social-share',
            '#comments', '#nav', '#header', '#footer', '[role="banner"]', '[role="navigation"]',
            '.cookie-banner', '.newsletter-signup', '.popup', '.outbrain', '.taboola',
            '.sponsored', '.promo', '.affiliate', '.ad-container', '.ad-wrapper',
            '[class*="sponsor"]', '[class*="advert"]', '[class*="cookie"]', '[class*="popup"]',
            '[id*="sponsor"]', '[id*="advert"]', '[id*="cookie"]', '[id*="popup"]'
        ];
        garbageSelectors.forEach(sel => {
            try {
                document.querySelectorAll(sel).forEach(el => el.remove());
            } catch (e) {}
        });

        // Strip <a> tags keeping their text content
        document.querySelectorAll('a').forEach(a => {
            const text = document.createTextNode(a.textContent || '');
            a.replaceWith(text);
        });

        // --- 3. TITLE EXTRACTION ---
        const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
        const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.content;
        const h1Title = document.querySelector('h1')?.textContent?.trim();
        const docTitle = document.title?.trim();

        let extractedTitle = sanitizeTitle(ogTitle || twitterTitle || h1Title || docTitle || 'Untitled Technical Report');

        // --- 4. BODY / TEXT EXTRACTION ---
        let extractedContent = null;
        
        try {
            const reader = new Readability(document.cloneNode(true));
            const article = reader.parse();
            if (article && article.content) {
                extractedContent = article.content;
                if (!extractedTitle || extractedTitle === 'Untitled Technical Report') {
                    extractedTitle = sanitizeTitle(article.title);
                }
            }
        } catch (e) {
            console.warn(`[READABILITY WARN] Failed: ${e.message}`);
        }

        // Fallback: Custom Container / Paragraph Collector
        if (!extractedContent || extractedContent.replace(/<[^>]+>/g, '').split(/\s+/).length < 140) {
            const containerSelectors = [
                'article', 'main', '[role="main"]', '.content', '.post-content',
                '.entry-content', '.article-body', '.article-content', '.story-body', '.body-content'
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

        // --- 5. CLEANING HTML, STRIPPING INLINE TAGS, REDACTING SECRETS ---
        const cleanDom = new JSDOM(extractedContent, { virtualConsole });
        const cleanDoc = cleanDom.window.document;
        
        // Remove empty or junk inline tags (span, div, b, i, strong, em attributes)
        cleanDoc.querySelectorAll('span, div, font, center').forEach(el => {
            const text = el.textContent ? el.textContent.trim() : '';
            if (!text) {
                el.remove();
            } else {
                el.replaceWith(cleanDoc.createTextNode(text + " "));
            }
        });

        // Strip all attributes (classes, ids, inline styles) from surviving semantic elements
        const elements = cleanDoc.getElementsByTagName('*');
        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            while (el.attributes.length > 0) {
                el.removeAttribute(el.attributes[0].name);
            }
        }

        const rawText = cleanBoilerplate(cleanDoc.body.textContent || '');
        const wordCount = rawText.trim().split(/\s+/).filter(Boolean).length;

        // Minimum 160 words of actual technical / analytical content required
        if (wordCount < 160) {
            console.log(`[FILTER] Content too short (${wordCount} words < 160 limit). Skipping: ${url}`);
            return null;
        }

        const sanitizedHtml = redactSecrets(cleanDoc.body.innerHTML.trim());
        const sanitizedExcerpt = redactSecrets(rawText.trim().substring(0, 220));

        console.log(`[SUCCESS] Extracted "${extractedTitle}" (${wordCount} words)`);
        return {
            title: extractedTitle,
            text: sanitizedHtml,
            excerpt: sanitizedExcerpt,
            wordCount: wordCount
        };

    } catch (e) {
        clearTimeout(timeoutId);
        console.error(`[CATCH ERROR] ${e.message} - ${url}`);
        return null;
    }
}
