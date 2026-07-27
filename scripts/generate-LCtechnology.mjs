import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import matter from 'gray-matter';
import { splitArticle } from './article_splitter.mjs';

async function fetchFromMistral(prompt, model = 'mistral-small-latest') {
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error('MISTRAL_API_KEY bulunamadi!');
  }
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Mistral API Hatasi: ${JSON.stringify(data)}`);
  }
  return data.choices[0].message.content;
}

async function fetchFromCerebras(prompt, model = 'gemma-4-31b') {
  if (!process.env.CEREBRAS_API_KEY) {
    throw new Error('CEREBRAS_API_KEY bulunamadi!');
  }
  const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Cerebras API Hatasi: ${JSON.stringify(data)}`);
  }
  return data.choices[0].message.content;
}

async function fetchFromGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY eksik");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Groq Error");
  return data.choices[0].message.content;
}

async function fetchFromSambaNova(prompt) {
  const url = 'https://api.sambanova.ai/v1/chat/completions';
  const apiKey = process.env.SAMBANOVA_API_KEY;
  if (!apiKey) throw new Error("SAMBANOVA_API_KEY is missing");
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'Meta-Llama-3.3-70B-Instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096
    })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`SambaNova API Error: ${response.status} - ${errText}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

async function fetchFromNvidia(prompt) {
  const url = 'https://integrate.api.nvidia.com/v1/chat/completions';
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_API_KEY is missing");
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'meta/llama-3.1-70b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096
    })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`NVIDIA API Error: ${response.status} - ${errText}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

async function fetchArxivData(topic) {
  try {
    const cleanTopic = topic.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/ +/g, '+');
    const url = `http://export.arxiv.org/api/query?search_query=all:${cleanTopic}&start=0&max_results=2&sortBy=submittedDate&sortOrder=descending`;
    const res = await fetch(url, { headers: { 'User-Agent': 'PlateAndProseBot/5.0' } });
    if (!res.ok) return null;
    const xml = await res.text();
    const summaries = [...xml.matchAll(/<summary>([\s\S]*?)<\/summary>/g)].map(m => m[1].trim().replace(/\n/g, ' '));
    const titles = [...xml.matchAll(/<title>([\s\S]*?)<\/title>/g)].map(m => m[1].trim().replace(/\n/g, ' '));
    
    let abstractText = "";
    if (summaries.length > 0) {
      abstractText = "ArXiv Papers on the topic:\n";
      for (let i = 0; i < summaries.length; i++) {
        abstractText += `Title: ${titles[i+1] || "Paper"}\nAbstract: ${summaries[i]}\n\n`;
      }
      return abstractText;
    }
  } catch(e) {
    console.error("ArXiv fetch failed:", e.message);
  }
  return null;
}

const categories = {
  'Technology': [
    { name: 'Alexander Vance', nationality: 'American' },
    { name: 'Lukas Richter', nationality: 'German' },
    { name: 'Eleanor Sterling', nationality: 'British' },
    { name: 'Kaan Demir', nationality: 'Turkish' },
    { name: 'Claire Beaufort', nationality: 'French' },
    { name: 'Elena Rostova', nationality: 'Russian' },
    { name: 'Hiroshi Tanaka', nationality: 'Japanese' },
    { name: 'Kerem Talu', nationality: 'Turkish' },
    { name: 'Amara Singh', nationality: 'Indian' },
    { name: 'Amara Okafor', nationality: 'Nigerian' },
    { name: 'Julian Thorne', nationality: 'British' },
    { name: 'Sofia Morales', nationality: 'Spanish' },
    { name: 'Omar Al-Hassan', nationality: 'Emirati' },
    { name: 'Li Wei', nationality: 'Chinese' },
    { name: 'Tariq Al-Fayed', nationality: 'Egyptian' },
    { name: 'Anya Petrovna', nationality: 'Russian' },
    { name: 'David O\'Connor', nationality: 'Irish' },
    { name: 'Zeynep Kaya', nationality: 'Turkish' },
    { name: 'Benjamin Hayes', nationality: 'American' },
    { name: 'Aisha Rahman', nationality: 'Pakistani' },
    { name: 'Lucas Moreau', nationality: 'French' },
    { name: 'Nandini Patel', nationality: 'Indian' },
    { name: 'Thomas Wright', nationality: 'Australian' },
    { name: 'Isabella Rossi', nationality: 'Italian' },
    { name: 'Kenji Sato', nationality: 'Japanese' }
  ]
};

const SCHEDULE_FILE = path.join(process.cwd(), 'technology-schedule.json');
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'posts');
const POSTS_DIR = path.join(process.cwd(), 'src', 'content', 'posts');

async function getAllTitles() {
  let files = [];
  try {
    files = await fs.readdir(POSTS_DIR);
  } catch (e) {
    return [];
  }
  const titles = [];
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    try {
      const content = await fs.readFile(path.join(POSTS_DIR, file), 'utf-8');
      const titleMatch = content.match(/^title:\s*["']?(.*?)["']?$/m);
      if (titleMatch && titleMatch[1]) {
        titles.push(titleMatch[1]);
      }
    } catch(e) {}
  }
  return titles;
}

async function getAuthorLastPostDates() {
  let files = [];
  try {
    files = await fs.readdir(POSTS_DIR);
  } catch (e) {
    return {};
  }
  
  const authorDates = {};
  for (const cat in categories) {
    for (const author of categories[cat]) {
      authorDates[author.name] = 0;
    }
  }

  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    try {
      const content = await fs.readFile(path.join(POSTS_DIR, file), 'utf-8');
      let fileDate = 0;
      const dateMatch = content.match(/date:\s*(.+)/);
      if (dateMatch) fileDate = new Date(dateMatch[1]).getTime();
      
      const authorMatch = content.match(/authors:\s*\[\"?([^\"]+)\"?\]/);
      let authorList = [];
      if (authorMatch) authorList.push(authorMatch[1]);
      else {
        const arrayMatch = content.match(/authors:\s*\n\s*-\s*\"?([^\"]+)\"?/);
        if (arrayMatch) authorList.push(arrayMatch[1]);
      }

      for (const a of authorList) {
        if (authorDates[a] !== undefined && fileDate > authorDates[a]) {
          authorDates[a] = fileDate;
        }
      }
    } catch (err) {}
  }
  return authorDates;
}

function generateRandomTime() {
  const h = Math.floor(Math.random() * 24); // 00:00 - 23:59
  const m = Math.floor(Math.random() * 60);
  return { h, m, string: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}` };
}

async function getOrInitSchedule() {
  let scheduleData = { tasks: [] };
  try {
    scheduleData = JSON.parse(await fs.readFile(SCHEDULE_FILE, 'utf-8'));
  } catch (e) {}

  const unpub = (scheduleData.tasks || []).filter(t => !t.published);
  if (unpub.length > 0) return scheduleData;

  console.log("Takvim bos veya tum yazilar yayinlanmis. Yeni 40 konu uretiliyor (Technology)...");
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY bulunamadi!');
    process.exit(1);
  }
  const genAI = new GoogleGenerativeAI(apiKey);

  const authorDates = await getAuthorLastPostDates();
  
  let flatAuthors = [];
  for (const cat in categories) {
    for (const a of categories[cat]) {
      flatAuthors.push({ ...a, category: cat, lastPost: authorDates[a.name] || 0 });
    }
  }

  const plannedSlots = []; 
  let simulatedTime = Date.now();
  
  for (let i = 0; i < 40; i++) {
    flatAuthors.sort((a, b) => a.lastPost - b.lastPost);
    
    // Rastgele secim: En uzun suredir bekleyen 5 yazar arasindan kura cek
    const candidatePool = flatAuthors.slice(0, 5);
    const author = candidatePool[Math.floor(Math.random() * candidatePool.length)];
    
    const dayOffset = Math.floor(i / 5); 
    plannedSlots.push({ author: { ...author }, dayOffset });
    
    // Sira listesinden dusmesi icin tarihini 1 gun ileri at
    author.lastPost += 86400000; 
  }

  const allTitles = await getAllTitles();
  const existingContext = allTitles.join(', ');
  
  const prompt = `
You are a master content strategist for a global elite tech blog.
We need EXACTLY 40 NEW, highly popular, highly searchable, 100% REAL tech topics.
We specifically need EXACTLY 40 topics for the "Technology" category.

IMPORTANT DUPLICATE CHECK: Do NOT use ANY topics similar, identical, or semantically close to these existing ones in our database:
[${existingContext}]

SERIALIZATION ALGORITHM (Part 01, Part 02):
If a topic is exceptionally broad and would require over 5000 words (e.g., 'The Complete Guide to Kubernetes and Edge AI'), you MUST automatically split it into serialized parts.
For example: 
'Kubernetes and Edge AI - Part 01: Cluster Setup'
'Kubernetes and Edge AI - Part 02: Model Deployment'
Output each part as a completely separate topic in the JSON array.

Output format MUST be valid JSON (Array of objects) EXACTLY like this:
[
  { "category": "Technology", "topic": "Exact specific title for this tech topic" }
]
Make sure there are EXACTLY 40 items total.
Output ONLY JSON, no markdown formatting. Do not wrap with \`\`\`.
`;

  let newTopics = [];
  let resultText = "";
  let successJSON = false;
  
  const fallbackModelsJSON = [
    'groq-llama-3.3-70b-versatile',
    'sambanova-llama-3.3-70b-instruct',
    'cerebras-gemma-4-31b',
    'mistral-small-latest',
    'gemini-2.5-flash',
    'gemini-3.1-flash-lite'
  ];

  for (const modelName of fallbackModelsJSON) {
    console.log(`[JSON URETIMI] ${modelName} deneniyor...`);
    try {
      if (modelName.includes('mistral')) {
        resultText = await fetchFromMistral(prompt, modelName);
      } else if (modelName.startsWith('cerebras-')) {
        resultText = await fetchFromCerebras(prompt, modelName.replace('cerebras-', ''));
      } else if (modelName.startsWith('sambanova-')) {
        resultText = await fetchFromSambaNova(prompt);
      } else if (modelName.startsWith('groq-')) {
        resultText = await fetchFromGroq(prompt);
      } else {
        const activeModel = genAI.getGenerativeModel({ model: modelName });
        const result = await activeModel.generateContent(prompt);
        resultText = result.response.text();
      }
      successJSON = true;
      console.log(`[BASARILI] JSON konulari ${modelName} ile uretildi!`);
      break;
    } catch (error) {
      console.warn(`[UYARI] JSON - ${modelName} basarisiz: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  if (!successJSON) {
    console.error("Yapay zeka yeni konulari (JSON) uretemedi. Tum modeller tukendi.");
    process.exit(1);
  }

  try {
    let text = resultText.trim();
    const lastBackticksSchedule = text.lastIndexOf('\`\`\`');
    if (lastBackticksSchedule > 10) {
      text = text.substring(0, lastBackticksSchedule);
    }
    text = text.replace(/\`\`\`[a-zA-Z]*\n?/g, '').replace(/\`\`\`/g, '').trim();
    newTopics = JSON.parse(text);
  } catch(e) {
    console.error("Yapay zeka yeni konulari (JSON) parse edemedi", e);
    process.exit(1);
  }

  const tasks = [];
  
  for (const slot of plannedSlots) {
     const topicIndex = newTopics.findIndex(t => t.category === slot.author.category);
     let topicTitle = "Generic Technology Topic"; 
     if (topicIndex !== -1) {
       topicTitle = newTopics[topicIndex].topic;
       newTopics.splice(topicIndex, 1);
     } else {
       if (newTopics.length > 0) {
           topicTitle = newTopics[0].topic;
           newTopics.splice(0, 1);
       }
     }
     
     const dateObj = new Date();
     dateObj.setDate(dateObj.getDate() + slot.dayOffset);
     const dateStr = dateObj.toISOString().split('T')[0];
     
     const time = generateRandomTime();
     
     tasks.push({
       dateStr,
       h: time.h,
       m: time.m,
       string: time.string,
       published: false,
       author: {
         name: slot.author.name,
         nationality: slot.author.nationality,
         category: slot.author.category
       },
       wikiTitle: topicTitle
     });
  }
  
  tasks.sort((a, b) => {
      if (a.dateStr === b.dateStr) return (a.h * 60 + a.m) - (b.h * 60 + b.m);
      return a.dateStr.localeCompare(b.dateStr);
  });
  
  scheduleData = { tasks };
  await fs.writeFile(SCHEDULE_FILE, JSON.stringify(scheduleData, null, 2));
  console.log(`Basariyla 40 yeni essiz Technology konusu eklendi!`);
  
  return scheduleData;
}

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const USED_IMAGES_FILE = path.join(process.cwd(), 'used_pexels_images_tech.json');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getUsedImageIds() {
  try {
    const data = await fs.readFile(USED_IMAGES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch(e) {
    return [];
  }
}

async function saveUsedImageId(id) {
  const ids = await getUsedImageIds();
  if(!ids.includes(id)) {
    ids.push(id);
    await fs.writeFile(USED_IMAGES_FILE, JSON.stringify(ids));
  }
}

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;

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


async function downloadAndOptimizeImage(url, slug, index, category) {
  const destName = index === 0 ? `${slug}-cover-tech.webp` : `${slug}-inline-tech-${index}.webp`;
  const destPath = path.join(IMAGES_DIR, destName);
  try {
    console.log(`Downloading image for ${slug}...`);
    const res = await fetch(url, { headers: { 'User-Agent': 'PlateAndProseBot/5.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    await sharp(buffer).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 80 }).toFile(destPath);
    return `/images/posts/${destName}`;
  } catch (err) {
    console.log("Image download failed:", err.message);
    return '/images/posts/fallback-tech.png';
  }
}

async function processPexelsImages(text, slug, category) {
  const regex = /(?:PEXELS|UNSPLASH|PIXABAY)_IMAGE:\s*\[?([^\]\n"'\)]+)\]?/g;
  const matches = [...text.matchAll(regex)];
  
  let newText = text;
  let index = 0;
  for (const match of matches) {
    const keywordsArray = match[1].split(',').map(k => k.trim());
    const imageUrl = await getBestImage(keywordsArray);
    const localImagePath = await downloadAndOptimizeImage(imageUrl, slug, index, category);
    
    if (index === 0) {
      newText = newText.replace(match[0], localImagePath);
    } else {
      newText = newText.replace(match[0], localImagePath);
      const pathEscaped = localImagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const garbagePrefixes = '(?:(?:Date|image|url|pexels|resim|görsel|kapak|link|Image|URL)[:\\-\\s*]*)*';
      const regexToWrap = new RegExp(`${garbagePrefixes}(?<!\\()${pathEscaped}`, 'gi');
      newText = newText.replace(regexToWrap, `![](${localImagePath})`);
    }
    
    index++;
    await sleep(10000); // SPAM ONLEME: Her resim arasinda 10 saniye bekle
  }
  return newText;
}



async function fetchFromPollinations(prompt) {
  const apiKey = process.env.POLLINATIONS_API_KEY || 'sk_UHNCVAMLmn4SWx6T1ao6FmZwRAiFBscZ';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min timeout for full article
  
  try {
    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: prompt }
        ],
        model: 'openai'
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content;
    } else {
      const textResult = await response.text();
      throw new Error(`Pollinations HTTP ${response.status}: ${textResult}`);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function checkAndRun() {
  const scheduleData = await getOrInitSchedule();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentTotalM = now.getUTCHours() * 60 + now.getUTCMinutes();

  const pendingTask = scheduleData.tasks.find(t => {
    if (t.published) return false;
    if (t.dateStr < todayStr) return true;
    if (t.dateStr === todayStr && (t.h * 60 + t.m) <= currentTotalM) return true;
    return false;
  });

  if (!pendingTask) {
    console.log('Technology: Su an icin bekleyen bir makale yayini yok. Uyumaya devam ediliyor...');
    process.exit(0);
  }

  console.log(`Technology Zamani gelen is: ${pendingTask.dateStr} ${pendingTask.string} | Yazar: ${pendingTask.author.name} | Konu: ${pendingTask.wikiTitle}`);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY bulunamadi!');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  let arxivText = await fetchArxivData(pendingTask.wikiTitle);
  if (!arxivText || arxivText.length < 100) {
    arxivText = "Recent arXiv data not available. Please use your internal knowledge (e.g. arXiv papers, GitHub repos) to write a highly factual, real-world analysis on this exact topic.";
  }

  const publishDate = new Date();

  
  

const articlePrompt = `
You are a highly acclaimed senior software engineer, AI researcher, and elite tech blogger. Your name is "${pendingTask.author.name}".
Your native language and the ONLY language you will use to write this article is "English".
Category: "${pendingTask.author.category}". Topic: "${pendingTask.wikiTitle}".

TASK: Write an extremely detailed, highly factual, technical, and authoritative article on the topic. 
CRITICAL DATA SOURCING: Do NOT invent facts. Use the following arXiv academic paper data as your core factual basis, and combine it with your extensive internal knowledge of GitHub trending repositories and TechCrunch/Y Combinator data to write deeply technical analyses.

arXiv ACADEMIC DATA:
"""
${arxivText.substring(0, 5000)}
"""

CODE BLOCKS REQUIREMENT:
Since this is a Technology article, you MUST include functional, real-world Code Blocks (e.g., Docker Compose files, Python scripts, YAML configurations, or Bash deployment commands) inside the article to demonstrate concepts.

MATHEMATICAL WORD COUNT TEMPLATE (STRICT):
You must write EXACTLY between 2000 and 2500 words. You will follow this exact structure:
1. Write a creative, engaging introductory section (~250 words). CRITICAL: NEVER use the words "Introduction" or "Hook" as a heading. Use a highly creative topic-specific heading instead.
2. Write exactly 5 sections with descriptive subheadings (e.g., "## Secure Design Principles"). Do NOT use words like "H2", "Heading", "Conclusion", or numbers in the subheadings.
3. 1 Markdown Code Block or Comparison Table (~150 words).
4. Write a closing summary section (~200 words). CRITICAL: NEVER use the words "Conclusion" or "Sign-off" as a heading. Use a creative closing heading.

IMAGES:
Within the body of the article, you MUST embed at least 3 or 4 images under different subheadings. Use Markdown format:
![Image Description](PEXELS_IMAGE: [3 different alternative terms])


RULES:
1. GENERATE THE FRONTMATTER EXACTLY AS REQUESTED BELOW.
2. At the very bottom, include 5-7 highly relevant, high-traffic global SEO hashtags (e.g., #AI, #Cybersecurity, #DevOps, etc.) to maximize visibility.
3. CRITICAL RULE: DO NOT generate, hallucinate, or insert any real image URLs (like Unsplash, Pixabay, or external links) into the article. You must ONLY use the 'PEXELS_IMAGE: [term]' format for images. NEVER put PEXELS_IMAGE tags inside code blocks (YAML, Docker, Python). Only put them as regular markdown images in the text body. Do not invent links!
4. CRITICAL RULE: DO NOT include any Chain-of-Thought, brainstorming, or Drafts. Start your output IMMEDIATELY with "---" and the title.


    DO NOT wrap the entire response in a markdown block. 
    CRITICAL RULE FOR CODE BLOCKS: EVERY single piece of code (HTML, Python, YAML, C#, Docker, etc.) MUST be strictly wrapped in standard markdown code fences (e.g., \`\`\`python, \`\`\`yaml, \`\`\`html). YOU MUST NOT leave any raw code or markup as plain text, or you will break the site rendering.
    CRITICAL WARNING: NEVER put the PEXELS_IMAGE tags inside these code fences! Images must ALWAYS remain outside code blocks as regular text.
    
---
title: "[Highly Unique and Intriguing Title]"
meta_title: "[Short SEO Title]"
description: "[1-2 sentence striking description]"
date: ${publishDate.toISOString()}
image: "PEXELS_IMAGE: [Cover image English search terms]"
categories: ["${pendingTask.author.category}"]
authors: ["${pendingTask.author.name}"]
tags: ["[tag1]", "[tag2]", "[tag3]"]
draft: false
---
[Body of the article following the mathematical template exactly. Minimum 2000 words. Embed at least 3 PEXELS_IMAGE blocks inside. Include real Code Blocks (Python, YAML, etc.).]

* * *

[Hashtags here]
  `;

  try {

    let success = false;
    let processedText = "";
    let usedModelName = "";

    const masterWaterfall = [
        { provider: 'nvidia', models: ['meta/llama-3.3-70b-instruct', 'meta/llama-3.1-405b-instruct'] },
        { provider: 'mistral', models: ['mistral-small-latest'] },
        { provider: 'cerebras', models: ['gemma-4-31b'] },
        { provider: 'groq', models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'] },
        { provider: 'sambanova', models: ['sambanova-llama-3.3-70b-instruct'] }
    ];

    for (const stage of masterWaterfall) {
        if (success) break;
        for (const model of stage.models) {
            console.log(`[ICERIK URETIMI] ${stage.provider.toUpperCase()} (${model}) deneniyor...`);
            try {
                let textResponse = "";
                if (stage.provider === 'nvidia') {
                    textResponse = await fetchFromNvidia(articlePrompt, model);
                } else if (stage.provider === 'mistral') {
                    textResponse = await fetchFromMistral(articlePrompt, model);
                } else if (stage.provider === 'cerebras') {
                    textResponse = await fetchFromCerebras(articlePrompt, model);
                } else if (stage.provider === 'groq') {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    textResponse = await fetchFromGroq(articlePrompt, model);
                } else if (stage.provider === 'sambanova') {
                    textResponse = await fetchFromSambaNova(articlePrompt);
                }

                if (textResponse) {
                    // Ensure the frontmatter is closed properly before sanitization to prevent YAML code blocks from confusing it.
                    let endMatch = textResponse.match(/(draft:\s*(?:true|false)\s*)/i);
                    if (!endMatch) {
                        endMatch = textResponse.match(/(tags:\s*\[.*?\]\s*)/i);
                    }
                    
                    if (endMatch) {
                        const afterMatch = textResponse.substring(endMatch.index + endMatch[0].length);
                        // If there is no --- immediately following, we insert it ourselves.
                        if (!/^\s*---/m.test(afterMatch.substring(0, 100))) {
                            textResponse = textResponse.substring(0, endMatch.index + endMatch[0].length) + '\n---\n' + afterMatch.replace(/^\s*/, '');
                        }
                    }

                    const { sanitizeFrontmatter } = await import('./sanitize-frontmatter.mjs');
                    processedText = sanitizeFrontmatter(textResponse, model);
                    
                    processedText = processedText.replace(/^tags:\s*(\[.*?\])\]+/gm, 'tags: $1');
                    const tm = processedText.match(/^title:\s*["']?(.*?)["']?$/im);
                    
                    if (!tm) {
                        console.log(`[UYARI] Model baslik uretmedi veya format bozuk.`);
                        throw new Error('Baslik bulunamadi, uretilen icerik formati hatali.');
                    }

                    usedModelName = `${stage.provider}-${model}`;
                    success = true;
                    console.log(`[BASARILI] Icerik ${usedModelName} ile uretildi!`);
                    break;
                }
            } catch (e) {
                console.log(`[HATA] ${stage.provider.toUpperCase()} modeli ${model} basarisiz:`, e.message);
                if (e.message.includes('429')) {
                    console.log(`[LIMIT] 429 hatasi, kisa bekleme yapiliyor...`);
                    await new Promise(resolve => setTimeout(resolve, 15000));
                }
            }
        }
    }

    if (!success) {
        console.error(`[KRITIK HATA] Tum ana ve yedek modeller tukendi. Icerik uretilemedi!`);
        process.exit(1);
    }

    let text = processedText;

    const titleMatch = text.match(/^title:\s*["']?(.*?)["']?$/im);
    let rawTitle = titleMatch[1];
    let slug = rawTitle
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    text = await processPexelsImages(text, slug, pendingTask.author.category);

    const parts = splitArticle(text, slug);
    for (const part of parts) {
      const filePath = path.join(POSTS_DIR, `${part.slug}.md`);
      part.content = part.content.replace(/^image:\s*"?([^"\n]*)"?$/m, 'image: "$1"');
      await fs.writeFile(filePath, part.content, 'utf-8');
      console.log(`Makale basariyla olusturuldu: ${filePath}`);
    }

    pendingTask.published = true;
    await fs.writeFile(SCHEDULE_FILE, JSON.stringify(scheduleData, null, 2));
    
  } catch (error) {
    console.error('Icerik olusturulurken genel hata olustu:', error);
    process.exit(1);
  }
}

checkAndRun();
