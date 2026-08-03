import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

import { splitArticle } from './article_splitter.mjs';


// --- API GECİKME VE KRONOMETRE AYARLARI ---
const apiMinimumDelays = { 'Nvidia': 3000, 'Gemini': 4500, 'OpenRouter': 25000, 'Mistral': 25000, 'SambaNova': 15000 };
const apiLastUsed = { 'OpenRouter': 0, 'Nvidia': 0, 'Gemini': 0, 'Mistral': 0, 'SambaNova': 0 };
const apiCooldowns = { 'Nvidia': 0, 'Gemini': 0, 'OpenRouter': 0, 'Mistral': 0, 'SambaNova': 0 };
const apiFailureCounts = { 'Nvidia': 0, 'Gemini': 0, 'OpenRouter': 0, 'Mistral': 0, 'SambaNova': 0 };

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
                    "X-Title": "AsciBot"
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
            console.warn(`[WARN] OpenRouter Model (${model}) failed. Trying the next elite model...`);
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
        body: JSON.stringify({ model: 'meta/llama-3.1-70b-instruct', messages: [{ role: 'user', content: prompt }], max_tokens: 4096, temperature: 0.7 })
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
    
    const activeModels = ["open-mistral-nemo", "mistral-small-latest", "open-mixtral-8x7b"];
    let lastError = null;
    for (const model of activeModels) {
        try {
            const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({ model: model, messages: [{ role: "user", content: prompt }], max_tokens: 4096 })
            });
            let data;
            try { data = await response.json(); } catch (e) { throw new Error(`HTTP ${response.status}`); }
            if (!response.ok) {
                if (data.error?.message?.toLowerCase().includes("rate limit") || response.status === 429) {
                     throw new Error(data.error?.message || "Rate limit exceeded on Mistral");
                }
                throw new Error(data.error?.message || `Error ${response.status}`);
            }
            return data.choices[0].message.content;
        } catch (e) {
            lastError = e;
            console.warn(`[WARN] Mistral Model (${model}) failed. Trying the next model...`);
            if (e.message.toLowerCase().includes("rate limit") || e.message.includes("429")) break;
        }
    }
    throw new Error(`All Mistral models failed. Last Error: ${lastError.message}`);
}

// --- 4. SAMBANOVA ---
async function fetchFromSambaNova(prompt) {
    const apiKey = process.env.SAMBANOVA_API_KEY;
    if (!apiKey) throw new Error("SAMBANOVA_API_KEY is missing");
    
    const activeModels = ["Meta-Llama-3.3-70B-Instruct", "Llama-4-Maverick-17B-128E-Instruct", "DeepSeek-V3-0324", "Qwen3-32B"];
    let lastError = null;
    for (const model of activeModels) {
        try {
            const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: model, messages: [{ role: 'user', content: prompt }], max_tokens: 4096, temperature: 0.7 })
            });
            let data;
            try { data = await response.json(); } catch (e) { throw new Error(`HTTP ${response.status}`); }
            if (!response.ok) {
                if (data.error?.message?.toLowerCase().includes("rate limit") || response.status === 429) {
                     throw new Error(data.error?.message || "Rate limit exceeded on SambaNova");
                }
                throw new Error(data.error?.message || `Error ${response.status}`);
            }
            return data.choices[0].message.content;
        } catch (e) {
            lastError = e;
            console.warn(`[WARN] SambaNova Model (${model}) failed. Trying the next model...`);
            if (e.message.toLowerCase().includes("rate limit") || e.message.includes("429")) break;
        }
    }
    throw new Error(`All SambaNova models failed. Last Error: ${lastError.message}`);
}

// --- 5. GEMINI ---
async function fetchFromGemini(prompt) {
    const yeniApiKey = (process.env.GEMINI_API_KEY || "").trim();
    const eskiApiKey = (process.env.GEMINIESKI_API_KEY || "").trim();
    
    if (!yeniApiKey && !eskiApiKey) throw new Error("Both GEMINI API keys are missing!");
    
    const keysToTry = [];
    if (yeniApiKey) keysToTry.push(yeniApiKey);
    if (eskiApiKey && eskiApiKey !== yeniApiKey) keysToTry.push(eskiApiKey);
    
    const flashModels = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.6-flash", "gemini-2.5-flash-lite"];
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
                console.warn(`[WARN] Gemini Model (${model}) failed with a key. Trying the next option...`);
                if (e.message.includes("API key not valid")) break;
            }
        }
    }
    throw new Error(`All Gemini keys and models failed. Last Error: ${lastError.message}`);
}

// --- ANA ŞELALE DÖNGÜSÜ ---
async function generateArticleBody(prompt, apiIndex = 0) {
    const apis = [
        { name: 'Nvidia', fn: fetchFromNvidia },
        { name: 'Gemini', fn: fetchFromGemini },
        { name: 'Mistral', fn: fetchFromMistral },
        { name: 'SambaNova', fn: fetchFromSambaNova },
        { name: 'OpenRouter', fn: fetchFromOpenRouter }
    ];
    
    let currentIdx = apiIndex % apis.length;
    let attemptedCount = 0;
    
    while (attemptedCount < apis.length) {
        const api = apis[currentIdx];
        if (Date.now() < apiCooldowns[api.name]) {
            console.error(`[!] ${api.name} is on 15-min cooldown. Skipping to next...`);
            currentIdx = (currentIdx + 1) % apis.length;
            attemptedCount++;
            continue;
        }
        if (Date.now() - apiLastUsed[api.name] < apiMinimumDelays[api.name]) {
            console.error(`[!] ${api.name} rate limit delay not met. Skipping to next...`);
            currentIdx = (currentIdx + 1) % apis.length;
            attemptedCount++;
            continue;
        }
        console.error(`[AI] Attempting ${api.name}...`);
        try {
            apiLastUsed[api.name] = Date.now(); 
            const response = await api.fn(prompt);
            apiFailureCounts[api.name] = 0;
            return response;
        } catch (error) {
            console.error(`[WARN] ${api.name} failed: ${error.message}`);
            apiFailureCounts[api.name]++;
            if (apiFailureCounts[api.name] >= 3) {
                console.error(`[CRITICAL] ${api.name} failed 3 times! Putting on 15-minute cooldown.`);
                apiCooldowns[api.name] = Date.now() + 15 * 60 * 1000; 
                apiFailureCounts[api.name] = 0; 
            }
            currentIdx = (currentIdx + 1) % apis.length;
            attemptedCount++;
        }
    }
    throw new Error("All AI services (APIs) are exhausted or rate limited.");
}

// Image Utilities
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;
const USED_IMAGES_FILE = path.join(process.cwd(), 'used_images.json');
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'posts');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getUsedImageIds() {
  try { return JSON.parse(await fs.readFile(USED_IMAGES_FILE, 'utf-8')); } catch(e) { return []; }
}

async function saveUsedImageId(id) {
  const ids = await getUsedImageIds();
  if(!ids.includes(id)) { ids.push(id); await fs.writeFile(USED_IMAGES_FILE, JSON.stringify(ids)); }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function fetchPixabayWithDynamic(keyword) {
  const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(keyword)}&per_page=100&image_type=photo`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Pixabay API Error: ${res.status}`);
    const data = await res.json();
    if (data.hits && data.hits.length > 0) {
      const usedIds = await getUsedImageIds();
      shuffleArray(data.hits);
      let selectedPhoto = data.hits.find(p => !usedIds.includes(p.id.toString()));
      if (selectedPhoto) {
        await saveUsedImageId(selectedPhoto.id.toString());
        return selectedPhoto.largeImageURL;
      }
    }
  } catch (e) {
    console.log(`Pixabay fetch failed:`, e.message);
  }
  return null;
}

async function fetchUnsplashWithDynamic(keyword) {
  const url = `https://api.unsplash.com/search/photos?client_id=${UNSPLASH_API_KEY}&query=${encodeURIComponent(keyword)}&per_page=30`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Unsplash API Error: ${res.status}`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const usedIds = await getUsedImageIds();
      shuffleArray(data.results);
      let selectedPhoto = data.results.find(p => !usedIds.includes(p.id));
      if (selectedPhoto) {
        await saveUsedImageId(selectedPhoto.id);
        return selectedPhoto.urls.regular;
      }
    }
  } catch (e) {
    console.log(`Unsplash fetch failed:`, e.message);
  }
  return null;
}

async function fetchPexelsWithDynamic(keyword) {
  for (let per_page = 20; per_page <= 80; per_page += 20) {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=${per_page}`;
    try {
      const res = await fetch(url, { headers: { 'Authorization': PEXELS_API_KEY } });
      if (res.status === 429) {
        console.warn(`[Pexels] 429 Too Many Requests. Skipping Pexels...`);
        return 'RATE_LIMIT'; 
      }
      if (!res.ok) throw new Error(`Pexels API Error: ${res.status}`);
      const data = await res.json();
      if (data.photos && data.photos.length > 0) {
        const usedIds = await getUsedImageIds();
        shuffleArray(data.photos);
        let selectedPhoto = data.photos.find(p => !usedIds.includes(p.id.toString()));
        if (selectedPhoto) {
          await saveUsedImageId(selectedPhoto.id.toString());
          return selectedPhoto.src.large2x || selectedPhoto.src.original;
        }
      }
    } catch (e) {
      console.log(`Pexels fetch failed (${per_page}):`, e.message);
      await sleep(1000);
    }
  }
  return null;
}

async function getBestImage(keywordsArray) {
  let pexelsRateLimited = false;
  for (const keyword of keywordsArray) {
    if (!keyword) continue;
    console.log(`Trying Pexels with dynamic search for: "${keyword}"`);
    const pexelsUrl = await fetchPexelsWithDynamic(keyword);
    if (pexelsUrl === 'RATE_LIMIT') { pexelsRateLimited = true; break; }
    if (pexelsUrl) return pexelsUrl;
  }

  console.log(`Pexels exhausted for all keywords. Trying Unsplash...`);
  for (const keyword of keywordsArray) {
    if (!keyword) continue;
    console.log(`Trying Unsplash for: "${keyword}"`);
    const unsplashUrl = await fetchUnsplashWithDynamic(keyword);
    if (unsplashUrl) return unsplashUrl;
  }

  console.log(`Unsplash exhausted. Trying Pixabay...`);
  for (const keyword of keywordsArray) {
    if (!keyword) continue;
    console.log(`Trying Pixabay for: "${keyword}"`);
    const pixabayUrl = await fetchPixabayWithDynamic(keyword);
    if (pixabayUrl) return pixabayUrl;
  }

  return `https://picsum.photos/1200/800?random=${Math.random()}`;
}

async function downloadAndOptimizeImage(url, slug, index) {
  const destName = index === 0 ? `${slug}-cover.webp` : `${slug}-inline-${index}.webp`;
  const destPath = path.join(IMAGES_DIR, destName);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'AsciBot/1.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    await sharp(buffer).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 80 }).toFile(destPath);
    return `/images/posts/${destName}`;
  } catch (err) { return '/images/posts/fallback.png'; }
}

async function processImages(text, slug) {
  const regex = /(?:PEXELS|UNSPLASH|PIXABAY)_IMAGE:\s*\[?([^\]\n"'\)]+)\]?/g;
  const matches = [...text.matchAll(regex)];
  let newText = text;
  let index = 0;
  for (const match of matches) {
    const keywordsArray = match[1].split(',').map(k => k.trim());
    const imageUrl = await getBestImage(keywordsArray);
    const localImagePath = await downloadAndOptimizeImage(imageUrl, slug, index);
    if (index === 0) newText = newText.replace(match[0], localImagePath);
    else newText = newText.replace(match[0], `![](${localImagePath})`);
    index++;
    await sleep(2000);
  }
  return newText;
}

// AsciBot Core Logic
async function runAsciBot() {
  const POOL_FILE = path.join(process.cwd(), 'raw_data_pool.json');
  const AUTHORS_FILE = path.join(process.cwd(), 'scripts', 'authors_list.json');
  const PUBLISHED_HISTORY_FILE = path.join(process.cwd(), 'published_history_topics.json');
  
  // 1. Read Pool
  let pool = [];
  try { pool = JSON.parse(await fs.readFile(POOL_FILE, 'utf-8')); } catch(e) { console.log("Pool empty."); process.exit(0); }
  if (pool.length === 0) { console.log("Pool empty."); process.exit(0); }

  // Always perform multi-item synthesis and comparison (2 or 3 items)
  const numItems = pool.length >= 3 ? (Math.random() < 0.5 ? 3 : 2) : Math.min(pool.length, 2);
  
  // Grab items (FIFO)
  const selectedItems = pool.splice(0, numItems);
  await fs.writeFile(POOL_FILE, JSON.stringify(pool, null, 2));

  // Determine Primary Category & Event Date
  const primaryCategory = selectedItems[0].category;
  const eventDate = new Date(selectedItems[0].date); // Ensure Time Anomaly Prevention
  
  // 2. Select Author
  const authors = JSON.parse(await fs.readFile(AUTHORS_FILE, 'utf-8'));
  const categoryAuthors = authors.filter(a => a.category === primaryCategory);
  const author = categoryAuthors[Math.floor(Math.random() * categoryAuthors.length)] || authors[0];

  // 3. Prepare Internal Links
  let internalLinks = [];
  try { internalLinks = JSON.parse(await fs.readFile(PUBLISHED_HISTORY_FILE, 'utf-8')).slice(0, 3); } catch(e) {
      internalLinks = ["/posts/future-of-ai", "/posts/economic-trends-2024", "/posts/gaming-evolution"];
  }

  // 4. Construct Strict Comparison & Synthesis Prompt
  let rawContext = selectedItems.map((item, idx) => `--- RAW SOURCE ITEM #${idx + 1} ---\nSOURCE: ${item.source}\nTITLE: ${item.title}\nCONTENT: ${item.text.substring(0, 4000)}\nEVENT DATE: ${item.date}`).join('\n\n');
  
  const articlePrompt = `
You are a world-class Systems Architect, Senior Technical Analyst, and Elite Technical Writer for "LogicCompare". Your name is "${author.name}".
Your native language and the ONLY language you will use to write this article is "English".
Category: "${author.category}". Specialty: "${author.specialty}".

MISSION & CORE IDENTITY (LOGICCOMPARE ENGINE):
You do NOT write superficial news summaries or tabloid clickbait. Your sole mission is to perform DEEP COMPARATIVE ANALYSIS, HARMONIZED SYNTHESIS, and HIGH-SIGNAL TECHNICAL BENCHMARKING based on the raw input data.

RAW DATA SOURCES FOR HARMONIZATION & COMPARISON (100% FACTUAL):
"""
${rawContext}
"""

LOGICCOMPARE MANDATORY STRUCTURAL REQUIREMENTS:
1. MULTI-SOURCE HARMONIZATION: You must synthesize and harmonize all provided source items into a unified, deeply analytical comparative article. Contrast the concepts, architectures, strategies, or trends presented in each source item.
2. MANDATORY COMPARISON MATRIX / TABLE: You MUST include at least ONE comprehensive Markdown Comparison Table (e.g. Feature Comparison Matrix, Architectural Trade-offs, Pros vs Cons, or Performance Benchmark Table).
3. DYNAMIC CATEGORY SPECIALIZATION:
   - If Category is "Technology": Include real, executable Code Blocks (e.g., Python scripts, YAML, CLI commands) and deep architectural comparison.
   - If Category is "Gaming": Include PC/Console System Requirements matrix, Metacritic benchmark comparisons, and technical performance analysis.
   - If Category is "Finance": Include a Market Sentiment & Impact Comparison table (Bullish vs Bearish indicators, short-term vs long-term trajectory analysis).
4. MATHEMATICAL LENGTH TEMPLATE (STRICT):
   - You MUST write a massive, authoritative, long-form masterwork between 2500 and 5000 words.
   - Introductory Section (~300 words) contrasting the core themes. Do NOT use the heading "Introduction".
   - Exactly 5 to 6 deeply analytical sections with clear comparative headings (e.g., "## Architectural Trade-Offs & Benchmarks").
   - Closing Synthesized Outlook (~250 words). Do NOT use the heading "Conclusion".

TIME ANOMALY PREVENTION (CRITICAL):
The events happened around ${eventDate.toISOString()}. Acknowledge this context naturally.

STRICT INTERNAL LINKING:
Allowed URLs:
${internalLinks.join('\n')}

IMAGES:
Embed at least 3 or 4 Markdown images under different section headings using ONLY this format:
![Image Description](PEXELS_IMAGE: [3 relevant English search terms])

RULES:
1. GENERATE THE FRONTMATTER EXACTLY AS REQUESTED BELOW.
2. At the bottom, include 5-7 relevant SEO hashtags.
3. DO NOT insert real image URLs. ONLY use 'PEXELS_IMAGE: [terms]' format.
4. DO NOT include any Chain-of-Thought or Drafts. Start IMMEDIATELY with "---".
5. Wrap all code in standard code fences.

---
title: "[Authoritative Comparative & Analytical Title]"
meta_title: "[Short Comparative SEO Title]"
description: "[1-2 sentence striking comparative summary]"
date: ${new Date(eventDate.getTime() + 86400000).toISOString()}
image: "PEXELS_IMAGE: [Cover image English search terms]"
categories: ["${author.category}"]
authors: ["${author.name}"]
tags: ["[tag1]", "[tag2]", "[tag3]"]
draft: false
---
[Body of the article following the LogicCompare template. Minimum 2500 words. Include Comparison Table, Code/Benchmark blocks, and embedded PEXELS_IMAGE blocks.]


* * *

[Hashtags here]
`;

  // 5. Execute Waterfall
  let textResponse = "";
  try {
    textResponse = await generateArticleBody(articlePrompt);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  // 6. Post-processing & Validation
  // 6. Post-processing & Validation
  const { sanitizeFrontmatter } = await import('./sanitize-frontmatter.mjs');
  textResponse = sanitizeFrontmatter(textResponse, "AsciBot");

  const tm = textResponse.match(/^title:\s*["']?(.*?)["']?$/im);
  if (!tm) { console.error('Title not found. Frontmatter parsing failed.'); process.exit(1); }
  
  let slug = tm[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  textResponse = await processImages(textResponse, slug);

  // 7. Save to Posts and Daily Output
  const today = new Date().toISOString().split('T')[0];
  const DAILY_DIR = path.join(process.cwd(), 'daily_output', today);
  const POSTS_DIR = path.join(process.cwd(), 'src', 'content', 'posts');
  
  if (!existsSync(DAILY_DIR)) await fs.mkdir(DAILY_DIR, { recursive: true });
  if (!existsSync(POSTS_DIR)) await fs.mkdir(POSTS_DIR, { recursive: true });

  const parts = splitArticle(textResponse, slug);
  for (const part of parts) {
    part.content = part.content.replace(/^image:\s*"?([^"\n]*)"?$/m, 'image: "$1"');
    
    // Save to src/content/posts/ (Permanent storage for Astro static site & GitHub)
    const postPath = path.join(POSTS_DIR, `${part.slug}.md`);
    await fs.writeFile(postPath, part.content, 'utf-8');
    console.log(`[+] Article saved to permanent blog path: ${postPath}`);

    // Save to daily_output/ (For Garson Bot processing)
    const filePath = path.join(DAILY_DIR, `${part.slug}.md`);
    await fs.writeFile(filePath, part.content, 'utf-8');
    console.log(`[+] Article saved to daily output: ${filePath}`);
  }
}

runAsciBot();
