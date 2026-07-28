import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

// Fake User Agents for bypassing basic blocks
const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0"
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchCleanContent(url) {
    // Human-like delay (2 to 8 seconds)
    const delay = Math.floor(Math.random() * 6000) + 2000;
    console.log(`[ANTI-BAN] ${delay}ms bekleniyor...`);
    await sleep(delay);

    console.log(`[CLEAN_SCRAPER] Kazınıyor: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": getRandomUserAgent(),
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5"
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`[HTTP ERROR] ${response.status} - ${url}`);
            return null;
        }

        const html = await response.text();
        const doc = new JSDOM(html, { url });
        
        // ÖNEMLİ: Sayfadaki tüm linkleri (a etiketlerini) sil, sadece yazılarını bırak
        const document = doc.window.document;
        document.querySelectorAll('a').forEach(a => {
            const text = document.createTextNode(a.textContent);
            a.replaceWith(text);
        });

        const reader = new Readability(document);
        const article = reader.parse();

        if (article && article.textContent) {
            // Check word count to filter out weak articles
            const wordCount = article.textContent.split(/\s+/).length;
            if (wordCount < 400) {
                console.log(`[FILTER] Çok kısa içerik (${wordCount} kelime). Pas geçiliyor.`);
                return null;
            }
            return {
                title: article.title,
                text: article.content, // HTML (h1, h2, p) korundu, ancak <a> etiketleri temizlendi!
                excerpt: article.excerpt
            };
        }
        return null;

    } catch (e) {
        clearTimeout(timeoutId);
        console.error(`[CATCH ERROR] ${e.message} - ${url}`);
        return null;
    }
}
