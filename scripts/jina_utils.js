import fs from 'fs';
import path from 'path';

const HISTORY_FILE = path.join(process.cwd(), 'scraped_history.json');

// Fake User Agents
const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1"
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function getHistory() {
    if (fs.existsSync(HISTORY_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
        } catch (e) {
            return [];
        }
    }
    return [];
}

function addToHistory(url) {
    const history = getHistory();
    if (!history.includes(url)) {
        history.push(url);
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    }
}

function isUrlProcessed(url) {
    const history = getHistory();
    return history.includes(url);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchFromJina(url) {
    // Check history first! (Optimization)
    if (isUrlProcessed(url)) {
        console.log(`[SKIP] URL already processed in history: ${url}`);
        return null;
    }

    // Random sleep between 2.000 and 12.000 ms (Human-like behavior)
    const delay = Math.floor(Math.random() * (12000 - 2000 + 1)) + 2000;
    console.log(`[ANTI-BAN] Sleeping for ${delay}ms before fetching...`);
    await sleep(delay);

    console.log(`[JINA] Fetching: ${url}`);
    
    // Timeout Promise (20 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
        const jinaUrl = `https://r.jina.ai/${url}`;
        const headers = {
            "User-Agent": getRandomUserAgent(),
            "Accept-Language": "en-US,en;q=0.9"
        };
        
        if (process.env.JINA_API_KEY) {
            headers["Authorization"] = `Bearer ${process.env.JINA_API_KEY}`;
        }

        const response = await fetch(jinaUrl, {
            headers: headers,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`[JINA ERROR] HTTP ${response.status} for ${url}`);
            return null; // Don't throw, just skip
        }

        const text = await response.text();
        
        // Filter out empty or paywalled articles (e.g., less than 400 characters)
        if (text.length < 400) {
            console.log(`[FILTER] Article too short or paywalled, skipping.`);
            return null;
        }

        // Add to history ONLY if successful
        addToHistory(url);
        return text;

    } catch (e) {
        clearTimeout(timeoutId);
        if (e.name === 'AbortError') {
            console.error(`[TIMEOUT] Jina request timed out after 20s for ${url}`);
        } else {
            console.error(`[JINA CATCH] ${e.message} for ${url}`);
        }
        return null; // Return null instead of crashing to prevent loops
    }
}

export { fetchFromJina, isUrlProcessed };
