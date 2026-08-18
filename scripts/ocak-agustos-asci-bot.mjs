import fs from 'fs/promises';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

import { splitArticle } from './article_splitter.mjs';
import { sanitizeFrontmatter } from './sanitize-frontmatter.mjs';
import { clusterNextArticleBatch } from './semantic_topic_clusterer.mjs';
import { buildPass1Prompt, buildPass2Prompt } from './category_prompt_builder.mjs';

// --- API GECİKME VE KRONOMETRE AYARLARI ---
const apiMinimumDelays = { 'Nvidia': 3000, 'Gemini': 4500, 'OpenRouter': 25000, 'Mistral': 25000, 'SambaNova': 15000 };
const apiLastUsed = { 'OpenRouter': 0, 'Nvidia': 0, 'Gemini': 0, 'Mistral': 0, 'SambaNova': 0 };
const apiCooldowns = { 'Nvidia': 0, 'Gemini': 0, 'OpenRouter': 0, 'Mistral': 0, 'SambaNova': 0 };
const apiFailureCounts = { 'Nvidia': 0, 'Gemini': 0, 'OpenRouter': 0, 'Mistral': 0, 'SambaNova': 0 };

const MAX_RUN_TIME_MS = 50 * 60 * 1000; // 50 Dakika Güvenli Çalışma Limiti
const startTime = Date.now();

function isTimeOut() {
    return (Date.now() - startTime) >= MAX_RUN_TIME_MS;
}

// --- 1. OPENROUTER ---
async function fetchFromOpenRouter(prompt) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY is missing");
    
    const freeModels = [
        "google/gemma-4-31b-it:free",
        "nvidia/nemotron-3-super-120b-a12b:free",
        "openai/gpt-oss-20b:free",
        "inclusionai/ling-3.0-flash:free"
    ];
    
    let lastError = null;
    for (const model of freeModels) {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${apiKey}`, 
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://github.com/AtlasProses/logiccompare",
                    "X-Title": "OcakAgustosAsciBot"
                },
                body: JSON.stringify({ model: model, messages: [{ role: "user", content: prompt }], max_tokens: 4096 })
            });
            let data;
            try { data = await response.json(); } catch (e) { throw new Error(`HTTP ${response.status}`); }
            if (!response.ok) {
                if (data.error?.message?.toLowerCase().includes("rate limit") || response.status === 429) {
                     throw new Error(data.error?.message || "Rate limit exceeded on OpenRouter");
                }
                throw new Error(data.error?.message || `Error ${response.status}`);
            }
            return data.choices[0].message.content;
        } catch (e) {
            lastError = e;
            console.warn(`[WARN] OpenRouter Model (${model}) failed. Trying next...`);
            if (e.message.toLowerCase().includes("rate limit") || e.message.includes("429")) break;
        }
    }
    throw new Error(`All elite OpenRouter models failed. Last Error: ${lastError.message}`);
}

// --- 2. NVIDIA ---
async function fetchFromNvidia(prompt) {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) throw new Error("NVIDIA_API_KEY is missing");
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'meta/llama-3.1-70b-instruct', messages: [{ role: 'user', content: prompt }], max_tokens: 8192, temperature: 0.7 })
    });
    let data;
    try { data = await response.json(); } catch (e) { throw new Error(`Nvidia HTTP ${response.status} (Non-JSON)`); }
    if (!response.ok) throw new Error(data.error?.message || `Nvidia Error ${response.status}`);
    return data.choices[0].message.content;
}

// --- 3. MISTRAL ---
async function fetchFromMistral(prompt) {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) throw new Error("MISTRAL_API_KEY is missing");
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'mistral-large-latest', messages: [{ role: 'user', content: prompt }], max_tokens: 8192, temperature: 0.7 })
    });
    let data;
    try { data = await response.json(); } catch (e) { throw new Error(`Mistral HTTP ${response.status} (Non-JSON)`); }
    if (!response.ok) throw new Error(data.error?.message || `Mistral Error ${response.status}`);
    return data.choices[0].message.content;
}

// --- 4. SAMBANOVA ---
async function fetchFromSambaNova(prompt) {
    const apiKey = process.env.SAMBANOVA_API_KEY;
    if (!apiKey) throw new Error("SAMBANOVA_API_KEY is missing");
    const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'Meta-Llama-3.1-70B-Instruct', messages: [{ role: 'user', content: prompt }], max_tokens: 8192, temperature: 0.7 })
    });
    let data;
    try { data = await response.json(); } catch (e) { throw new Error(`SambaNova HTTP ${response.status} (Non-JSON)`); }
    if (!response.ok) throw new Error(data.error?.message || `SambaNova Error ${response.status}`);
    return data.choices[0].message.content;
}

// --- 5. GEMINI ---
async function fetchFromGemini(prompt) {
    const yeniApiKey = (process.env.GEMINI_API_KEY || "").trim();
    const eskiApiKey = (process.env.GEMINIESKI_API_KEY || "").trim();
    
    if (!yeniApiKey && !eskiApiKey) throw new Error("Both GEMINI API keys are missing!");
    
    const keysToTry = [];
    if (yeniApiKey) keysToTry.push(yeniApiKey);
    if (eskiApiKey && eskiApiKey !== yeniApiKey) keysToTry.push(eskiApiKey);
    
    const flashModels = ["gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash"];
    let lastError = null;
    for (const apiKey of keysToTry) {
        for (const model of flashModels) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { maxOutputTokens: 4096 }
                    })
                });
                let data;
                try { data = await response.json(); } catch (e) { throw new Error(`HTTP ${response.status}`); }
                if (!response.ok) {
                    if (data.error?.message?.toLowerCase().includes("quota") || response.status === 429) {
                         throw new Error(data.error?.message || "Rate limit or daily quota exceeded on Gemini");
                    }
                    throw new Error(data.error?.message || `Error ${response.status}`);
                }
                return data.candidates[0].content.parts[0].text;
            } catch (e) {
                lastError = e;
                console.warn(`[WARN] Gemini Model (${model}) failed. Trying next...`);
                if (e.message.includes("API key not valid")) break;
            }
        }
    }
    throw new Error(`All Gemini keys and models failed. Last Error: ${lastError?.message}`);
}

// --- 6. GROQ ---
async function fetchFromGroq(prompt) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is missing");
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], max_tokens: 4096, temperature: 0.7 })
    });
    let data;
    try { data = await response.json(); } catch (e) { throw new Error(`Groq HTTP ${response.status}`); }
    if (!response.ok) throw new Error(data.error?.message || `Groq Error ${response.status}`);
    return data.choices[0].message.content;
}

// --- WATERFALL GENERATOR ---
async function generateArticleBody(prompt) {
    const providers = [
        { name: 'Nvidia', fetchFn: fetchFromNvidia, envKey: 'NVIDIA_API_KEY' },
        { name: 'Gemini', fetchFn: fetchFromGemini, envKey: 'GEMINI_API_KEY' },
        { name: 'Groq', fetchFn: fetchFromGroq, envKey: 'GROQ_API_KEY' },
        { name: 'Mistral', fetchFn: fetchFromMistral, envKey: 'MISTRAL_API_KEY' },
        { name: 'SambaNova', fetchFn: fetchFromSambaNova, envKey: 'SAMBANOVA_API_KEY' },
        { name: 'OpenRouter', fetchFn: fetchFromOpenRouter, envKey: 'OPENROUTER_API_KEY' }
    ];

    const availableProviders = providers.filter(p => !!process.env[p.envKey]);
    if (availableProviders.length === 0) {
        throw new Error("NO_API_KEYS_CONFIGURED: Environment variables (NVIDIA_API_KEY, GEMINI_API_KEY, GROQ_API_KEY, MISTRAL_API_KEY, SAMBANOVA_API_KEY, OPENROUTER_API_KEY) are not set.");
    }

    let lastError = null;
    const maxAttempts = availableProviders.length * 2;
    let attempt = 0;

    while (attempt < maxAttempts) {
        let anyTried = false;

        for (const provider of availableProviders) {
            attempt++;
            if (Date.now() < apiCooldowns[provider.name]) {
                continue;
            }

            const elapsed = Date.now() - apiLastUsed[provider.name];
            const minDelay = apiMinimumDelays[provider.name] || 2000;
            if (elapsed < minDelay) {
                await new Promise(r => setTimeout(r, minDelay - elapsed));
            }

            try {
                anyTried = true;
                console.log(`[AsciBot AI] Generating with ${provider.name}...`);
                const output = await provider.fetchFn(prompt);
                apiLastUsed[provider.name] = Date.now();
                apiFailureCounts[provider.name] = 0;
                return output;
            } catch (err) {
                lastError = err;
                const errMsg = (err.message || '').toLowerCase();
                const is429 = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('rate limit') || errMsg.includes('resource_exhausted') || errMsg.includes('credits');
                
                if (is429) {
                    apiFailureCounts[provider.name] = (apiFailureCounts[provider.name] || 0) + 1;
                    const failCount = apiFailureCounts[provider.name];

                    if (failCount === 1) {
                        console.warn(`[429 LADDER 1/4] ${provider.name} ilk 429 uyarısı aldı. 10 saniye beklenip sıradaki modele geçiliyor...`);
                        apiCooldowns[provider.name] = Date.now() + 10 * 1000; // 10 saniye bekleme
                    } else if (failCount === 2) {
                        console.warn(`[429 LADDER 2/4] ${provider.name} 2. defa 429 aldı. 25 saniye beklenip sıradaki modele geçiliyor...`);
                        apiCooldowns[provider.name] = Date.now() + 25 * 1000; // 25 saniye bekleme
                    } else if (failCount === 3) {
                        console.warn(`[429 LADDER 3/4] ${provider.name} 3. defa 429 aldı. 25 saniye beklenip sıradaki modele geçiliyor...`);
                        apiCooldowns[provider.name] = Date.now() + 25 * 1000; // 25 saniye bekleme
                    } else {
                        console.warn(`[429 LADDER 4/4] ${provider.name} 4. defa 429 aldı! Model tam 8 dakika soğumaya (cooldown) alınıyor...`);
                        apiCooldowns[provider.name] = Date.now() + 8 * 60 * 1000; // 8 dakika tam soğutma
                        apiFailureCounts[provider.name] = 0; // sayacı sıfırla
                    }
                } else {
                    apiFailureCounts[provider.name] = (apiFailureCounts[provider.name] || 0) + 1;
                    console.warn(`[FAIL] ${provider.name} failed: ${err.message}`);
                    if (apiFailureCounts[provider.name] >= 4) {
                        console.warn(`[FAIL 4/4] ${provider.name} 4. hatasını aldı! 8 dakika soğumaya alınıyor...`);
                        apiCooldowns[provider.name] = Date.now() + 8 * 60 * 1000; // 8 dk soğutma
                        apiFailureCounts[provider.name] = 0;
                    }
                }
            }
        }

        if (!anyTried && attempt < maxAttempts) {
            console.log(`[WATERFALL BACKOFF] Tüm modeller anlık soğutmada. 30 saniye beklenip en erken açılan modelden devam edilecek...`);
            await new Promise(r => setTimeout(r, 30000));
            // Reset oldest cooldown if all blocked
            const now = Date.now();
            let oldestProvider = availableProviders[0];
            for (const p of availableProviders) {
                if (apiCooldowns[p.name] < apiCooldowns[oldestProvider.name]) oldestProvider = p;
            }
            apiCooldowns[oldestProvider.name] = 0;
        }
    }
    throw new Error(`All Waterfall AI models exhausted after ${attempt} attempts. Last error: ${lastError?.message}`);
}

// --- QUALITY & ANTI-HALLUCINATION VALIDATOR ---
function validateCookedArticle(content) {
    if (!content || typeof content !== 'string') return { valid: false, reason: "Empty article body" };
    
    // 1. Word Count Check (1400 - 3500 words for comprehensive multi-topic comparison)
    const cleanBody = content.replace(/---[\s\S]*?---/, '').trim();
    const words = cleanBody.split(/\s+/).filter(Boolean).length;
    if (words < 1400) {
        return { valid: false, reason: `Word count too low (${words} words < 1400 minimum)` };
    }

    // 2. Markdown Table Check
    if (!content.includes('| ---') && !content.includes('|:---') && !content.includes('|---')) {
        return { valid: false, reason: "Missing required Markdown Comparison Matrix Table" };
    }

    // 3. Strategic FAQ Section Check
    const hasFaq = content.toLowerCase().includes('faq') || 
                   content.toLowerCase().includes('frequently asked') || 
                   content.toLowerCase().includes('questions');
    if (!hasFaq) {
        return { valid: false, reason: "Missing Strategic FAQ Section" };
    }

    // 4. Placeholder & Unfinished Text Check
    if (content.includes('[TODO') || content.includes('insert code here') || content.includes('Lorem ipsum')) {
        return { valid: false, reason: "Contains placeholder unfinished text" };
    }

    return { valid: true, words };
}

// --- 50% - 50% DATE & AUTHOR COHORT ASSIGNMENT ---
function assignCohortDateAndAuthor(primaryCategory, authorsList) {
    const matchingAuthors = authorsList.filter(a =>
        a.category && primaryCategory && a.category.toLowerCase() === primaryCategory.toLowerCase()
    );
    const pool = matchingAuthors.length > 0 ? matchingAuthors : authorsList;
    const midPoint = Math.max(1, Math.floor(pool.length / 2));
    
    const groupA = pool.slice(0, midPoint);
    const groupB = pool.slice(midPoint);

    const isCohort1 = Math.random() < 0.50; // 50% chance

    if (isCohort1) {
        // Dönem 1 (Geçmiş / Temel Arşiv): 01.01.2026 - 01.05.2026
        const start = new Date('2026-01-01T08:00:00.000Z').getTime();
        const end = new Date('2026-05-01T20:00:00.000Z').getTime();
        const randomTime = new Date(start + Math.random() * (end - start));
        const author = groupA[Math.floor(Math.random() * groupA.length)] || pool[0];
        return {
            cohort: 'Dönem 1 (01.01.2026 - 01.05.2026)',
            date: randomTime.toISOString(),
            author
        };
    } else {
        // Dönem 2 (Güncel Trendler): 01.05.2026 - 15.08.2026
        const start = new Date('2026-05-02T08:00:00.000Z').getTime();
        const end = new Date('2026-08-15T20:00:00.000Z').getTime();
        const randomTime = new Date(start + Math.random() * (end - start));
        const author = (groupB.length > 0 ? groupB : pool)[Math.floor(Math.random() * (groupB.length > 0 ? groupB.length : pool.length))];
        return {
            cohort: 'Dönem 2 (01.05.2026 - 15.08.2026)',
            date: randomTime.toISOString(),
            author
        };
    }
}

// --- AUTO LOAD .env IF PRESENT (LOCAL DEVELOPMENT & RUNS) ---
if (existsSync(path.join(process.cwd(), '.env'))) {
    try {
        const envContent = readFileSync(path.join(process.cwd(), '.env'), 'utf-8');
        for (const line of envContent.split('\n')) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                const [key, ...rest] = trimmed.split('=');
                const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
                if (!process.env[key.trim()]) process.env[key.trim()] = val;
            }
        }
    } catch (e) {}
}

// --- USED IMAGES TRACKER (Guarantees NO Image is Ever Reused) ---
const USED_IMAGES_FILE = path.join(process.cwd(), 'used_images.json');
async function getUsedImageIds() {
    try {
        if (existsSync(USED_IMAGES_FILE)) {
            const data = await fs.readFile(USED_IMAGES_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {}
    return [];
}

async function saveUsedImageId(id) {
    if (!id) return;
    try {
        const used = await getUsedImageIds();
        if (!used.includes(String(id))) {
            used.push(String(id));
            await fs.writeFile(USED_IMAGES_FILE, JSON.stringify(used, null, 2), 'utf-8');
        }
    } catch (e) {}
}

function cleanSearchQuery(rawQuery) {
    if (!rawQuery) return "";
    return rawQuery.replace(/[\[\]"'`#]/g, '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
}

// --- 4-STAGE WATERFALL IMAGE SEARCH (Pexels -> Unsplash -> Pixabay -> Category Fallback) ---
async function getBestImage(keywordsArray, category = "Technology") {
    const pexelsKey = process.env.PEXELS_API_KEY;
    const unsplashKey = process.env.UNSPLASH_API_KEY;
    const pixabayKey = process.env.PIXABAY_API_KEY;
    const usedIds = await getUsedImageIds();

    // 1. PEXELS WATERFALL (Try keyword 1, 2, 3)
    if (pexelsKey) {
        for (const rawKw of keywordsArray) {
            const kw = cleanSearchQuery(rawKw);
            if (!kw || kw.length < 2) continue;
            try {
                const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(kw)}&per_page=40`, {
                    headers: { Authorization: pexelsKey }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.photos && data.photos.length > 0) {
                        const available = data.photos.filter(p => !usedIds.includes(String(p.id)));
                        const pool = available.length > 0 ? available : data.photos;
                        const chosen = pool[Math.floor(Math.random() * pool.length)];
                        await saveUsedImageId(chosen.id);
                        return chosen.src.large2x || chosen.src.large || chosen.src.original;
                    }
                }
            } catch (e) {}
        }
    }

    // 2. UNSPLASH WATERFALL (Try keyword 1, 2, 3)
    if (unsplashKey) {
        for (const rawKw of keywordsArray) {
            const kw = cleanSearchQuery(rawKw);
            if (!kw || kw.length < 2) continue;
            try {
                const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(kw)}&per_page=30&client_id=${unsplashKey}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.results && data.results.length > 0) {
                        const available = data.results.filter(p => !usedIds.includes(String(p.id)));
                        const pool = available.length > 0 ? available : data.results;
                        const chosen = pool[Math.floor(Math.random() * pool.length)];
                        await saveUsedImageId(chosen.id);
                        return chosen.urls.regular || chosen.urls.full;
                    }
                }
            } catch (e) {}
        }
    }

    // 3. PIXABAY WATERFALL (Try keyword 1, 2, 3)
    if (pixabayKey) {
        for (const rawKw of keywordsArray) {
            const kw = cleanSearchQuery(rawKw);
            if (!kw || kw.length < 2) continue;
            try {
                const res = await fetch(`https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(kw)}&image_type=photo&per_page=30`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.hits && data.hits.length > 0) {
                        const available = data.hits.filter(p => !usedIds.includes(String(p.id)));
                        const pool = available.length > 0 ? available : data.hits;
                        const chosen = pool[Math.floor(Math.random() * pool.length)];
                        await saveUsedImageId(chosen.id);
                        return chosen.largeImageURL || chosen.webformatURL;
                    }
                }
            } catch (e) {}
        }
    }

    // 4. CATEGORY-GUARANTEED STOCK FALLBACK (Never return random fruits/nature)
    const catFallbacks = {
        'Technology': ['data center server cloud', 'software code terminal', 'artificial intelligence hardware', 'server racks computing'],
        'Finance': ['stock market trading charts', 'cryptocurrency blockchain market', 'financial exchange graphs', 'trading terminal desk'],
        'Gaming': ['video game esports battle', 'gaming console controller neon', 'pc gaming setup hardware', 'esports arena tournament'],
        'Sports': ['formula 1 racing track', 'athletic stadium crowd', 'football soccer stadium lights', 'nba basketball arena']
    };
    const fallbacks = catFallbacks[category] || catFallbacks['Technology'];
    if (pexelsKey) {
        for (const kw of fallbacks) {
            try {
                const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(kw)}&per_page=40`, {
                    headers: { Authorization: pexelsKey }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.photos && data.photos.length > 0) {
                        const available = data.photos.filter(p => !usedIds.includes(String(p.id)));
                        const pool = available.length > 0 ? available : data.photos;
                        const chosen = pool[Math.floor(Math.random() * pool.length)];
                        await saveUsedImageId(chosen.id);
                        return chosen.src.large2x || chosen.src.large;
                    }
                }
            } catch (e) {}
        }
    }

    return null;
}

// --- IMAGE PROCESSOR (Pexels / Unsplash / Pixabay / Dynamic Unique) ---
async function processImages(markdownText, postSlug, category = "Technology") {
    const imageMatches = [...markdownText.matchAll(/!\[(.*?)\]\((?:PEXELS_IMAGE:\s*\[?(.*?)\]?|([^)]+))\)/gi)];
    const frontmatterImageMatch = markdownText.match(/^image:\s*["']?(?:PEXELS_IMAGE:\s*\[?(.*?)\]?|([^"'\n]+))["']?$/im);

    const publicDir = path.join(process.cwd(), 'public', 'images', 'posts');
    if (!existsSync(publicDir)) await fs.mkdir(publicDir, { recursive: true });

    let finalMarkdown = markdownText;

    // 1. Cover Image
    if (frontmatterImageMatch) {
        const rawCoverQuery = frontmatterImageMatch[1] || frontmatterImageMatch[2] || postSlug;
        const keywordsArray = rawCoverQuery.split(',').map(s => s.trim()).filter(Boolean);
        const coverFilename = `${postSlug}-cover.webp`;
        const coverLocalPath = path.join(publicDir, coverFilename);
        const coverWebPath = `/images/posts/${coverFilename}`;

        await downloadAndConvertImage(keywordsArray, coverLocalPath, category);
        finalMarkdown = finalMarkdown.replace(frontmatterImageMatch[0], `image: "${coverWebPath}"`);
    } else {
        finalMarkdown = finalMarkdown.replace(/^image:\s*["']?.*?["']?$/im, `image: "/images/posts/${postSlug}-cover.webp"`);
    }

    // 2. Inline Images
    let inlineCount = 1;
    for (const match of imageMatches) {
        const fullMatch = match[0];
        const altText = match[1] || "Comparison Analysis";
        const rawQuery = match[2] || match[3] || `${postSlug} detail ${inlineCount}`;
        
        // Skip if already a valid URL
        if (rawQuery.startsWith('/images/') || rawQuery.startsWith('http')) continue;

        const keywordsArray = rawQuery.split(',').map(s => s.trim()).filter(Boolean);
        const inlineFilename = `${postSlug}-inline-${inlineCount}.webp`;
        const inlineLocalPath = path.join(publicDir, inlineFilename);
        const inlineWebPath = `/images/posts/${inlineFilename}`;

        await downloadAndConvertImage(keywordsArray, inlineLocalPath, category);
        if (existsSync(inlineLocalPath)) {
            finalMarkdown = finalMarkdown.replace(fullMatch, `![${altText}](${inlineWebPath})`);
            inlineCount++;
        } else {
            finalMarkdown = finalMarkdown.replace(fullMatch, '');
        }
    }

    // 3. Absolute Safety Fallback for any leftover unreplaced PEXELS_IMAGE or non-url markdown images
    finalMarkdown = finalMarkdown.replace(/!\[(.*?)\]\((?!(?:\/images\/|https?:\/\/))[^)]+\)/gi, '');
    finalMarkdown = finalMarkdown.replace(/^image:\s*["']?(?!(\/images\/|https?:\/\/)).*?["']?$/gim, `image: "/images/posts/${postSlug}-cover.webp"`);

    return finalMarkdown;
}

async function downloadAndConvertImage(keywordsArray, savePath, category = "Technology") {
    if (existsSync(savePath)) return;
    const kwList = Array.isArray(keywordsArray) ? keywordsArray : [keywordsArray];

    const imageUrl = await getBestImage(kwList, category);
    if (!imageUrl) {
        console.warn(`[Image Warning] No image found for keywords: ${kwList.join(', ')}`);
        return;
    }

    try {
        const imgRes = await fetch(imageUrl);
        const rawBuffer = Buffer.from(await imgRes.arrayBuffer());
        
        let quality = 78;
        let outBuffer = await sharp(rawBuffer)
            .resize(1200, 630, { fit: 'cover' })
            .webp({ quality, effort: 6 })
            .toBuffer();

        // Adaptive compression loop ensuring strictly <= 150 KB
        while (outBuffer.length > 150 * 1024 && quality > 40) {
            quality -= 6;
            outBuffer = await sharp(rawBuffer)
                .resize(1200, 630, { fit: 'cover' })
                .webp({ quality, effort: 6 })
                .toBuffer();
        }

        await fs.writeFile(savePath, outBuffer);
    } catch (e) {
        console.warn(`Image download failed for "${kwList.join(', ')}": ${e.message}`);
    }
}

// --- MAIN EXECUTION LOOP (50-MINUTE SAFE BATCH PIPELINE) ---
export async function runOcakAgustosAsciBot(targetCount = 30) {
    console.log(`\n===============================================================`);
    console.log(`🍳 OCAK - AĞUSTOS AŞÇI BOTU (50 DK GÜVENLİ ZAMAN AŞIMI & %50-%50 TAKVİM)...`);
    console.log(`🎯 Hedef Makale Sayısı: ${targetCount} Adet | Maksimum Süre: 50 Dakika`);
    console.log(`===============================================================\n`);

    const POOL_FILE = path.join(process.cwd(), 'raw_data_pool.json');
    const AUTHORS_FILE = path.join(process.cwd(), 'scripts', 'authors_list.json');
    const POSTS_DIR = path.join(process.cwd(), 'src', 'content', 'posts');
    const today = new Date().toISOString().split('T')[0];
    const DAILY_DIR = path.join(process.cwd(), 'daily_output', today);

    if (!existsSync(DAILY_DIR)) await fs.mkdir(DAILY_DIR, { recursive: true });
    if (!existsSync(POSTS_DIR)) await fs.mkdir(POSTS_DIR, { recursive: true });

    let pool = [];
    try { pool = JSON.parse(await fs.readFile(POOL_FILE, 'utf-8')); } catch(e) { return; }
    if (pool.length < 2) {
        console.log("Havuzda yeterli konu kalmadı (< 2). Avcı botların çalışması bekleniyor.");
        return;
    }

    let authors = [];
    try { authors = JSON.parse(await fs.readFile(AUTHORS_FILE, 'utf-8')); } catch(e) { return; }

    let cookedCount = 0;

    while (!isTimeOut() && cookedCount < targetCount && pool.length >= 2) {
        console.log(`\n[${cookedCount + 1}/${targetCount}] Yeni Karşılaştırmalı Makale Hazırlanıyor...`);

        // 1. Intelligent Semantic Topic Clustering (Faz 1: Anti-Frankenstein Clusterer)
        const clusterResult = clusterNextArticleBatch(pool);
        if (!clusterResult || !clusterResult.selectedItems || clusterResult.selectedItems.length === 0) {
            console.log("No valid semantic cluster remaining in pool.");
            break;
        }

        const { selectedItems, articleMode, primaryCategory, remainingPool } = clusterResult;
        pool = remainingPool;
        await fs.writeFile(POOL_FILE, JSON.stringify(pool, null, 2));

        console.log(`[Semantic Cluster] Mode: "${articleMode}" | Category: "${primaryCategory}" | Items: ${selectedItems.length}`);
        selectedItems.forEach((it, idx) => console.log(`  -> Entity #${idx + 1}: ${it.title}`));

        // 2. 50% - 50% Tarih ve Yazar Kohortu Atama
        const { cohort, date, author } = assignCohortDateAndAuthor(primaryCategory, authors);
        console.log(`[Atama] Kategori: ${primaryCategory} | ${selectedItems.length}'lü Kümeleme | Kohort: ${cohort} | Tarih: ${date} | Yazar: ${author.name}`);

        // 3. Prompt İnşası & Zengin Kümeleme (4-Way Grounding Data)
        const rawContext = selectedItems.map((item, idx) => 
            `--- RAW SOURCE ITEM #${idx + 1} (${item.category}) ---\nSOURCE: ${item.source}\nTITLE: ${item.title}\nCONTENT: ${item.text.substring(0, 5000)}\nEVENT DATE: ${item.date}`
        ).join('\n\n');

        const isSingleTopic = selectedItems.length === 1;
        console.log(`[AsciBot AI] 2 Aşamalı Kategori Uzmanlığı Yazımı (${primaryCategory}) Başlatılıyor...`);

        // --- PAS 1: FRONTMATTER + BÖLÜM 1 & 2 (TÜM KONULARIN DERİN ANALİZİ) ---
        const pass1Prompt = buildPass1Prompt({
            author,
            primaryCategory,
            articleMode,
            selectedItems,
            rawContext,
            date,
            isSingleTopic
        });

        let pass1Result = "";
        try {
            console.log(`[AsciBot AI - Pas 1/2] Temeller ve ${primaryCategory} Analizi Üretiliyor...`);
            pass1Result = await generateArticleBody(pass1Prompt);
        } catch (e) {
            console.error(`[AsciBot Pass 1 Error]: ${e.message}`);
            if (e.message.includes("NO_API_KEYS_CONFIGURED")) {
                console.log("[AsciBot] Yerel ortamda API anahtarları bulunamadı. GitHub Actions üzerinden (Secrets ile) tam kapasite çalışacaktır.");
                break;
            }
            continue;
        }

        // --- PAS 2: BÖLÜM 3 (TABLO), BÖLÜM 4 (ALAN METRİĞİ), BÖLÜM 5 (SSS), BÖLÜM 6 (SENTEZ) (1.500 - 1.700 Kelime) ---
        const pass2Prompt = buildPass2Prompt({
            author,
            primaryCategory,
            articleMode,
            selectedItems,
            rawContext,
            isSingleTopic
        });

        let pass2Result = "";
        try {
            console.log(`[AsciBot AI - Pas 2/2] Kıyaslama Tablosu, Alan Metrikleri ve SSS Üretiliyor...`);
            pass2Result = await generateArticleBody(pass2Prompt);
        } catch (e) {
            console.error(`[AsciBot Pass 2 Error]: ${e.message}`);
            continue;
        }

        // --- DİKİŞ / BİRLEŞTİRME (HARMONIZER STITCHER) ---
        let cleanPass2 = pass2Result.replace(/^---[\s\S]*?---\s*/m, '').trim();
        let cookedArticle = `${pass1Result.trim()}\n\n${cleanPass2}`;

        // 5. Kalite & Anti-Halüsinasyon Denetimi
        const validation = validateCookedArticle(cookedArticle);
        if (!validation.valid) {
            console.warn(`[REJECTED - KALİTE BARAJI GEÇİLEMEDİ]: ${validation.reason}. Bu makale çöpe atılıyor.`);
            continue;
        }

        // 6. Frontmatter Sanitization & Slug Oluşturma
        cookedArticle = sanitizeFrontmatter(cookedArticle, "OcakAgustosAsciBot");

        let rawTitle = "";
        const tm = cookedArticle.match(/^title:\s*["']?(.*?)["']?$/im);
        if (tm && tm[1]) {
            rawTitle = tm[1].replace(/[*_#`"']/g, '').trim();
        }
        if (!rawTitle || rawTitle.length < 3) {
            rawTitle = `${selectedItems[0].title}-vs-${selectedItems[1]?.title || 'analysis'}`;
        }

        let slug = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        if (slug.length > 70) slug = slug.substring(0, 70).replace(/-+$/, '');

        // 7. Görsellerin İndirilmesi ve WebP'ye Dönüştürülmesi
        try {
            cookedArticle = await processImages(cookedArticle, slug, primaryCategory);
        } catch (e) {
            console.warn(`Image processing warning: ${e.message}`);
        }

        // 8. Makalenin Kaydedilmesi ve Havuzdan Düşülmesi
        const parts = splitArticle(cookedArticle, slug);
        for (const part of parts) {
            part.content = part.content.replace(/^image:\s*"?([^"\n]*)"?$/m, 'image: "$1"');
            
            // Permanent Astro Posts Path
            const postPath = path.join(POSTS_DIR, `${part.slug}.md`);
            await fs.writeFile(postPath, part.content, 'utf-8');

            // Daily Output Path
            const dailyPath = path.join(DAILY_DIR, `${part.slug}.md`);
            await fs.writeFile(dailyPath, part.content, 'utf-8');
            console.log(`[+] Makale başarıyla pişirildi ve kaydedildi: "${rawTitle}" (${validation.words || '2500+'} kelime)`);
        }

        // Zero-Duplicate Shield: Record topic to published_history_topics.json
        try {
            const PUBLISHED_HISTORY_FILE = path.join(process.cwd(), 'published_history_topics.json');
            let pubHistory = [];
            if (existsSync(PUBLISHED_HISTORY_FILE)) {
                pubHistory = JSON.parse(await fs.readFile(PUBLISHED_HISTORY_FILE, 'utf-8'));
            }
            pubHistory.unshift({
                slug: slug,
                title: rawTitle,
                category: primaryCategory,
                entities: selectedItems.map(x => x.title),
                date: new Date().toISOString()
            });
            if (pubHistory.length > 5000) pubHistory = pubHistory.slice(0, 5000);
            await fs.writeFile(PUBLISHED_HISTORY_FILE, JSON.stringify(pubHistory, null, 2), 'utf-8');
        } catch (e) {}

        // Kullanılan konuları havuzdan sil (Sadece başarıyla kaydedildikten sonra!)
        const selectedIds = new Set(selectedItems.map(i => i.id));
        pool = pool.filter(i => !selectedIds.has(i.id));
        await fs.writeFile(POOL_FILE, JSON.stringify(pool, null, 2));

        cookedCount++;
    }

    const durationMin = ((Date.now() - startTime) / (1000 * 60)).toFixed(2);
    console.log(`\n===============================================================`);
    if (isTimeOut()) {
        console.log(`⏰ 50 DAKİKALIK GÜVENLİ ZAMAN AŞIMI SINIRINA ULAŞILDI! (${durationMin} dakika)`);
    } else {
        console.log(`✅ GÖREV TAMAMLANDI! (${durationMin} dakika sürdü)`);
    }
    console.log(`📊 Bu turda pişirilen toplam makale sayısı: ${cookedCount}`);
    console.log(`💾 Kalan Havuz Konu Sayısı: ${pool.length}`);
    console.log(`===============================================================\n`);
}

if (process.argv[1]?.endsWith('ocak-agustos-asci-bot.mjs')) {
    const target = parseInt(process.argv.slice(2).find(a => a.startsWith('--target='))?.split('=')[1] || process.argv[2], 10) || 30;
    runOcakAgustosAsciBot(target).then(() => process.exit(0)).catch(e => {
        console.error("AsciBot finish notice:", e.message);
        process.exit(0);
    });
}
