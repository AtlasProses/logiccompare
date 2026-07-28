import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

function splitArticle(text, slug) {
  return [{ slug: slug, content: text }]; // Basit versiyon, tümünü tek bir dosyaya basar
}


// AI APIs
async function fetchFromMistral(prompt, model = 'mistral-small-latest') {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: model, messages: [{ role: 'user', content: prompt }] })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Mistral API Error`);
  return data.choices[0].message.content;
}

async function fetchFromCerebras(prompt, model = 'gemma-4-31b') {
  const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: model, messages: [{ role: 'user', content: prompt }] })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Cerebras API Error`);
  return data.choices[0].message.content;
}

async function fetchFromGroq(prompt, model = "llama-3.3-70b-versatile") {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: model, messages: [{ role: "user", content: prompt }], max_tokens: 4096 })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Groq API Error`);
  return data.choices[0].message.content;
}

async function fetchFromSambaNova(prompt) {
  const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.SAMBANOVA_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'Meta-Llama-3.3-70B-Instruct', messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 4096 })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`SambaNova API Error`);
  return data.choices[0].message.content;
}

async function fetchFromNvidia(prompt, model = 'meta/llama-3.1-70b-instruct') {
  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: model, messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 4096 })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Nvidia API Error`);
  return data.choices[0].message.content;
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

TASK: Write an extremely detailed, highly factual, technical, and authoritative article based on the following raw viral data.

RAW VIRAL DATA (Core Factual Basis):
"""
${rawContext}
"""

STRICT ANTI-FLUFF & EXACT DATA POLICY (CRITICAL):
1. ZERO PR/MARKETER SPEAK: You must write like a top-tier expert. Do NOT stretch concise facts into 200 lines of fluff. If the data is concise, your explanation must be dense, analytical, and 100% data-driven. Do NOT repeat yourself to increase word count.
2. ABSTRACT-DRIVEN SYNTHESIS: The raw data contains abstracts or direct reports. You must synthesize the exact facts, statistics, and conclusions from them. Do NOT hallucinate or invent data.

HIERARCHICAL TREE STRUCTURE (CRITICAL):
Your article must strictly follow a logical tree structure (main topics -> subtopics). EVERY single heading and subheading must be packed with 100% accurate, dense facts derived from the raw data. No generic filler paragraphs are allowed under any heading.

ANTI-NONSENSE GUARDRAIL (CRITICAL):
If you were provided multiple items from different domains, you MUST NOT force a nonsensical connection. If they share a logical connection, synthesize them creatively. If not, ignore the secondary item and focus solely on the primary item.

TIME ANOMALY PREVENTION (CRITICAL):
The events in the raw data happened around ${eventDate.toISOString()}. You must write from a perspective that acknowledges this date. Your article will be published shortly after this date.

STRICT INTERNAL LINKING (CRITICAL):
You may ONLY use the following EXACT URLs for internal links. DO NOT hallucinate, invent, or use any other URLs. If you cannot fit them naturally, DO NOT use any links.
Allowed URLs:
${internalLinks.join('\n')}

MATHEMATICAL WORD COUNT TEMPLATE:
Aim for a comprehensive article (1000-2000 words), but PRIORITIZE DENSITY OVER LENGTH. Never add fluff just to reach a word count.
Structure:
1. Creative Intro (~150 words). No "Introduction" heading.
2. 4-5 main sections with descriptive subheadings (following the tree structure). No numbers.
3. 1 Markdown Code Block or Comparison Table (~150 words). Must be inside markdown fences.
4. Closing summary (~150 words). No "Conclusion" heading.

IMAGES:
Embed at least 3 images under different subheadings using exact format:
![Image Description](PEXELS_IMAGE: [3 english search terms])

RULES:
1. Output valid Markdown starting with Frontmatter.
2. DO NOT hallucinate links or images outside of PEXELS_IMAGE tags.

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
[Body of the article...]
`;

  // 5. Execute Waterfall
  let textResponse = "";
  let success = false;
  const masterWaterfall = [
    { provider: 'groq', models: ['llama-3.3-70b-versatile'] },
    { provider: 'cerebras', models: ['gemma-4-31b'] },
    { provider: 'nvidia', models: ['meta/llama-3.1-70b-instruct'] },
    { provider: 'sambanova', models: ['sambanova-llama-3.3-70b-instruct'] },
    { provider: 'mistral', models: ['mistral-small-latest'] }
  ];

  for (const stage of masterWaterfall) {
    if (success) break;
    for (const model of stage.models) {
      console.log(`[URETIM] ${stage.provider.toUpperCase()} (${model}) deneniyor...`);
      try {
        if (stage.provider === 'nvidia') textResponse = await fetchFromNvidia(articlePrompt, model);
        else if (stage.provider === 'mistral') textResponse = await fetchFromMistral(articlePrompt, model);
        else if (stage.provider === 'cerebras') textResponse = await fetchFromCerebras(articlePrompt, model);
        else if (stage.provider === 'groq') textResponse = await fetchFromGroq(articlePrompt, model);
        else if (stage.provider === 'sambanova') textResponse = await fetchFromSambaNova(articlePrompt);

        if (textResponse && textResponse.includes('---')) {
          success = true; break;
        }
      } catch (e) { console.log(`[HATA] ${model} basarisiz:`, e.message); }
    }
  }

  if (!success) { console.error('Tüm modeller tükendi!'); process.exit(1); }

  // 6. Post-processing & Validation
  const tm = textResponse.match(/^title:\s*["']?(.*?)["']?$/im);
  if (!tm) { console.error('Başlık bulunamadı.'); process.exit(1); }
  
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
    console.log(`Makale kaydedildi (Garson icin): ${filePath}`);
  }
}

runAsciBot();
