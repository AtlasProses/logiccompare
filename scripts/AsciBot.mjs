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
                body: JSON.stringify({ model: model, messages: [{ role: "user", content: prompt }], max_tokens: 8192 })
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
    
    const activeModels = ["open-mistral-nemo", "mistral-small-latest", "open-mixtral-8x7b"];
    let lastError = null;
    for (const model of activeModels) {
        try {
            const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({ model: model, messages: [{ role: "user", content: prompt }], max_tokens: 8192 })
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
                body: JSON.stringify({ model: model, messages: [{ role: 'user', content: prompt }], max_tokens: 8192, temperature: 0.7 })
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
                        generationConfig: { maxOutputTokens: 8192 }
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

async function getBestImage(keywordsArray) {
  for (const keyword of keywordsArray) {
    if (!keyword) continue;
    try {
      const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=40`, { headers: { 'Authorization': PEXELS_API_KEY } });
      if (res.ok) {
        const data = await res.json();
        if (data.photos && data.photos.length > 0) {
          const usedIds = await getUsedImageIds();
          shuffleArray(data.photos);
          let photo = data.photos.find(p => !usedIds.includes(p.id.toString()));
          if (photo) { await saveUsedImageId(photo.id.toString()); return photo.src.large2x || photo.src.original; }
        }
      }
    } catch(e) {}
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

  // Determine synthesis (10% chance cross-domain if we have >1 item)
  const isSynthesis = Math.random() < 0.1 && pool.length > 1;
  const numItems = isSynthesis ? 2 : 1;
  
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

  // 4. Construct Strict Prompt
  let rawContext = selectedItems.map(item => `SOURCE: ${item.source}\nTITLE: ${item.title}\nCONTENT: ${item.text.substring(0, 3000)}\nEVENT DATE: ${item.date}`).join('\n\n---NEXT ITEM---\n\n');
  const articlePrompt = `
You are a highly acclaimed senior expert and elite blogger. Your name is "${author.name}".
Your native language and the ONLY language you will use to write this article is "English".
Category: "${author.category}". Specialty: "${author.specialty}".

TASK: Write an extremely detailed, highly factual, technical, and authoritative deep-dive article based on the following raw viral data.

RAW VIRAL DATA (Core Factual Basis):
"""
${rawContext}
"""

STRICT ANTI-FLUFF & EXACT DATA POLICY (CRITICAL):
1. ZERO PR/MARKETER SPEAK: You must write like a top-tier expert. Do NOT stretch concise facts into fluff. Your explanation must be dense, analytical, and 100% data-driven.
2. EXPANSION THROUGH INTERNAL KNOWLEDGE: The raw data might be brief. You MUST expand it massively (target 2000-3000 words) by relying on your deep internal knowledge. Do this by comparing it to historical versions, rival products, similar industry events, and deep-dive technical/market mechanics.

DOMAIN-SPECIFIC EXPERT ANALYSIS (CRITICAL):
You are required to augment the raw data with your internal expert knowledge based on the article's category:
1. TECHNOLOGY/SOFTWARE: Compare the new version/product with older versions (e.g. v1.5 vs v0.1). What are the revolutionary improvements? Compare it with rival alternatives. Include technical architecture deep-dives and, if relevant, code snippets (e.g. YAML, Python) illustrating how it works.
2. FINANCE & CRYPTO: Provide an expert market analysis concluding how this news will impact the market. Compare it to historical market crashes/bull runs. Analyze macroeconomic factors, competing assets, and project future trends with deep financial terminology.
3. GAMING & HARDWARE: If the topic is a game, you MUST compare it to its closest rivals (e.g. if it's an open-world game, compare it to GTA; if it's racing, compare to Forza). Append its Minimum and Recommended System Requirements (OS, RAM, GPU, CPU) in a Markdown table. Compare platform performance (PS5 vs Xbox Series X). Always try to include its Metacritic score (or estimated critical reception) and known chronic bugs with solutions.

HIERARCHICAL TREE STRUCTURE (CRITICAL):
Your article must strictly follow a logical tree structure (main topics -> subtopics). EVERY single heading and subheading must be packed with 100% accurate, dense facts derived from the raw data and your expert knowledge. Include tables, code blocks, or lists where appropriate to enrich the content.

TIME ANOMALY PREVENTION (CRITICAL):
The events in the raw data happened around ${eventDate.toISOString()}. You must write from a perspective that acknowledges this date. Your article will be published shortly after this date.

STRICT INTERNAL LINKING (CRITICAL):
You may ONLY use the following EXACT URLs for internal links. DO NOT hallucinate, invent, or use any other URLs. If you cannot fit them naturally, DO NOT use any links.
Allowed URLs:
${internalLinks.join('\n')}

SERIALIZATION & LONG-FORM GENERATION RULE (CRITICAL):
Using the provided raw data summaries and your vast internal knowledge, write an encyclopedic and comprehensive article. YOUR TARGET IS AT LEAST 2000 WORDS. Do not write short 500-word summaries. 
If the topic naturally demands immense depth (exceeding 3000 words), you MUST automatically structure it into serialized parts (e.g. Part 01, Part 02) utilizing high-quality descriptive subheadings.

IMAGES:
Embed at least 3-5 images under different subheadings using exact format:
![Image Description](PEXELS_IMAGE: [3 english search terms])
Do NOT put PEXELS_IMAGE tags inside markdown code blocks or tables.

RULES:
1. Output valid Markdown starting with Frontmatter.
2. DO NOT hallucinate links or images outside of PEXELS_IMAGE tags.
3. NEVER wrap the entire response in a markdown code block. Start immediately with ---

---
title: "[Highly Unique Title]"
meta_title: "[Short SEO Title]"
description: "[1-2 sentence description]"
date: ${new Date(eventDate.getTime() + 86400000).toISOString()}
image: "PEXELS_IMAGE: [Cover image search terms]"
categories: ["${author.category}"]
authors: ["${author.name}"]
tags: ["[tag1]", "[tag2]", "[tag3]"]
draft: false
---
[Body of the extremely detailed, long-form expert article...]
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

  // 7. Save to Daily Output (For Garson Bot)
  const today = new Date().toISOString().split('T')[0];
  const DAILY_DIR = path.join(process.cwd(), 'daily_output', today);
  if (!existsSync(DAILY_DIR)) await fs.mkdir(DAILY_DIR, { recursive: true });

  const parts = splitArticle(textResponse, slug);
  for (const part of parts) {
    const filePath = path.join(DAILY_DIR, `${part.slug}.md`);
    part.content = part.content.replace(/^image:\s*"?([^"\n]*)"?$/m, 'image: "$1"');
    await fs.writeFile(filePath, part.content, 'utf-8');
    console.log(`Article saved (for Garson): ${filePath}`);
  }
}

runAsciBot();
