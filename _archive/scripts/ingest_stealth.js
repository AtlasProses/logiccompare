import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const isRemote = process.argv.includes('--remote');
console.log(`🚀 Starting Ingest Stealth Bot (Target: ${isRemote ? 'REMOTE Production' : 'LOCAL Emulator'})...`);

const wranglerPath = 'C:\\Program Files\\nodejs\\npx.cmd';

function runWrangler(args) {
  const env = { ...process.env, PATH: `C:\\Program Files\\nodejs;${process.env.PATH}` };
  // Inject config file flag
  const patchedArgs = args.replace('wrangler', 'wrangler -c wrangler.api.toml');
  const cmd = `"${wranglerPath}" ${patchedArgs}`;
  console.log(`Running: ${cmd}`);
  return execSync(cmd, { env, encoding: 'utf8' });
}

/*
// ==========================================
// PLAYWRIGHT STEALTH & PROXY BOILERPLATE
// (Uncomment this section when ready to run real scrapers with rotating residential proxies)
// ==========================================
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
chromium.use(StealthPlugin());

async function scrapeRealProduct(url) {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ],
    // Proxy configuration (Residential proxy pool example)
    proxy: {
      server: 'http://proxy.example-residential-pool.com:8000',
      username: 'my-proxy-username',
      password: 'my-proxy-password'
    }
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();
  
  // Random human delays (Jitter)
  await page.waitForTimeout(Math.random() * 5000 + 2000);
  
  console.log(`Navigating to target url: ${url}`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  
  // Scraper extraction logic here...
  await browser.close();
}
*/

// ==========================================
// 1. DYNAMIC NATURAL LANGUAGE GENERATOR (ANTI-BOT REVIEW ENGINE)
// ==========================================
const reviewTemplates = {
  positive: [
    "I was skeptical at first, but after using [PRODUCT] for a week, it completely exceeded my expectations. The build quality feels extremely premium.",
    "This is arguably the best purchase I've made this year. [PRODUCT] delivers exactly what it promises. Clean design, solid materials.",
    "Highly recommended! The performance of [PRODUCT] is top-tier. I noticed an immediate difference in efficiency compared to my older setup.",
    "Absolutely loving [PRODUCT]. It's worth every single penny. Easy to set up, intuitive interface, and runs perfectly silent."
  ],
  neutral: [
    "Overall, [PRODUCT] is decent for the price. It has a few minor design flaws but nothing major that would prevent me from recommending it.",
    "It does the job well. The build is average, and while [PRODUCT] performs stably, it doesn't offer anything revolutionary compared to competitors.",
    "Good, but could be better. The specifications of [PRODUCT] are exactly as described, though the battery life/efficiency is just average."
  ],
  negative: [
    "Disappointing purchase. [PRODUCT] looks good on paper, but the actual user experience is laggy/clunky. Build feels plasticky.",
    "Expected much more for this price point. [PRODUCT] has stability issues under heavy use. Will probably return it.",
    "Not worth the premium price tag. There are cheaper alternatives that perform better than [PRODUCT]. Build quality is lacking."
  ]
};

function generateNaturalReview(productName, rating) {
  let list = reviewTemplates.neutral;
  if (rating >= 4) list = reviewTemplates.positive;
  if (rating <= 2) list = reviewTemplates.negative;

  const rawTemplate = list[Math.floor(Math.random() * list.length)];
  return rawTemplate.replace(/\[PRODUCT\]/g, productName);
}

// ==========================================
// 2. MOCK INGESTION DATA PIPELINE (NEW BATCH OF PRODUCTS)
// ==========================================
const scrapedBatch = [
  // Shard: Electronics
  {
    id: "macbook-air-m3",
    name: "MacBook Air 13\" M3",
    brand_id: "apple",
    category_id: "laptops",
    specs: { "CPU": "Apple M3 (8-core)", "GPU": "10-core GPU", "RAM": "16 GB Unified", "Storage": "512 GB SSD", "Display": "13.6-inch Liquid Retina" },
    offers: [
      { store: "Amazon", price: 1299.00, url: "https://amzn.to/example-macbook" },
      { store: "AliExpress", price: 1270.00, url: "https://aliexpress.com/example-macbook" }
    ],
    shard: "logiccompare-specs-electronics",
    commentShard: "logiccompare-comments-tech"
  },
  {
    id: "xiaomi-14-ultra",
    name: "Xiaomi 14 Ultra",
    brand_id: "xiaomi",
    category_id: "smartphones",
    specs: { "Display": "6.73-inch AMOLED", "Processor": "Snapdragon 8 Gen 3", "Camera": "50MP Quad Leica", "Battery": "5000 mAh", "OS": "HyperOS (Android 14)" },
    offers: [
      { store: "Amazon", price: 999.00, url: "https://amzn.to/example-xiaomi" },
      { store: "AliExpress", price: 920.00, url: "https://aliexpress.com/example-xiaomi" }
    ],
    shard: "logiccompare-specs-electronics",
    commentShard: "logiccompare-comments-tech"
  },
  // Shard: Home & Kitchen
  {
    id: "dyson-v15-detect",
    name: "V15 Detect Cordless Vacuum",
    brand_id: "dyson",
    category_id: "appliances",
    specs: { "Suction Power": "240 AW", "Run Time": "Up to 60 min", "Weight": "3.1 kg", "Bin Volume": "0.76 L", "Filtration": "Whole-machine HEPA" },
    offers: [
      { store: "Amazon", price: 749.99, url: "https://amzn.to/example-dyson-v15" }
    ],
    shard: "logiccompare-specs-home-kitchen",
    commentShard: "logiccompare-comments-home-pets"
  },
  // Shard: Pet Care
  {
    id: "xiaomi-smart-pet-feeder",
    name: "Smart Pet Feeder",
    brand_id: "xiaomi",
    category_id: "smart-feeders",
    specs: { "Capacity": "3.6L", "Material": "304 Stainless Steel", "Connectivity": "Wi-Fi (Xiaomi Home App)", "Power": "6W (with battery backup)" },
    offers: [
      { store: "Amazon", price: 89.99, url: "https://amzn.to/example-feeder" },
      { store: "AliExpress", price: 75.00, url: "https://aliexpress.com/example-feeder" }
    ],
    shard: "logiccompare-specs-pet-care",
    commentShard: "logiccompare-comments-home-pets"
  }
];

// ==========================================
// 3. RETRIEVE VIRTUAL EDITORS FROM CORE
// ==========================================
console.log("Fetching editor list from core database...");
let editors = [];
try {
  const remoteFlag = isRemote ? '--remote' : '--local';
  const editorsJson = runWrangler(`wrangler d1 execute logiccompare-core ${remoteFlag} --command="SELECT id FROM editors;" --json`);
  const parsed = JSON.parse(editorsJson);
  editors = parsed[0]?.results || [];
  console.log(`Found ${editors.length} virtual editors available.`);
} catch (err) {
  console.error("Failed to fetch editors list. Falling back to default editor pool.");
  editors = [{ id: "ed-admin" }, { id: "ed-tech" }, { id: "ed-home" }, { id: "ed-pets" }];
}

// ==========================================
// 4. RANDOMIZED DRIP-FEED PUBLISHING TIMESTAMPS
// ==========================================
function getRandomFutureTimestamp(dayOffset) {
  const date = new Date();
  // Add day offset
  date.setDate(date.getDate() + dayOffset);
  // Randomize hour (09:00 - 22:00) and minutes
  const randomHour = Math.floor(Math.random() * 13) + 9;
  const randomMin = Math.floor(Math.random() * 60);
  date.setHours(randomHour, randomMin, 0, 0);
  
  // Return SQLite compatible format: YYYY-MM-DD HH:MM:SS
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// ==========================================
// 5. INGESTION PROCESSOR
// ==========================================
const tempSqlDir = path.join(process.cwd(), 'temp_ingest_sql');
if (!fs.existsSync(tempSqlDir)) {
  fs.mkdirSync(tempSqlDir);
}

try {
  const remoteFlag = isRemote ? '--remote' : '--local';

  // Group queries by D1 shard
  const shardQueries = {};

  scrapedBatch.forEach((prod, index) => {
    // 1. Assign randomized published_at timestamp (spread over the next 1 to 4 days)
    const publishedAt = getRandomFutureTimestamp(index + 1);
    
    // 2. Select a random editor from our 100 editors pool
    const assignedEditor = editors[Math.floor(Math.random() * editors.length)]?.id || "ed-admin";

    // 3. Ratings (Randomized premium review metrics)
    const userRating = (Math.random() * 1.5 + 3.5).toFixed(1); // 3.5 - 5.0
    const editorRating = (Math.random() * 1.0 + 4.0).toFixed(1); // 4.0 - 5.0
    
    const specsJson = JSON.stringify(prod.specs).replace(/'/g, "''");

    // Product Insert (Specs Shard)
    if (!shardQueries[prod.shard]) shardQueries[prod.shard] = '';
    shardQueries[prod.shard] += `INSERT OR IGNORE INTO products (id, name, brand_id, category_id, specs_json, avg_user_score, avg_editor_score, published_at) VALUES ('${prod.id}', '${prod.name.replace(/'/g, "''")}', '${prod.brand_id}', '${prod.category_id}', '${specsJson}', ${userRating}, ${editorRating}, '${publishedAt}');\n`;

    // Offers Insert (Specs Shard)
    for (const o of prod.offers) {
      shardQueries[prod.shard] += `INSERT OR IGNORE INTO offers (product_id, store_name, price, affiliate_url) VALUES ('${prod.id}', '${o.store}', ${o.price}, '${o.url}');\n`;
    }

    // Editor Review Insert (Comments Shard)
    const reviewContent = generateNaturalReview(prod.name, Math.round(editorRating));
    if (!shardQueries[prod.commentShard]) shardQueries[prod.commentShard] = '';
    shardQueries[prod.commentShard] += `INSERT OR IGNORE INTO editor_reviews (product_id, editor_id, rating, content) VALUES ('${prod.id}', '${assignedEditor}', ${Math.round(editorRating)}, '${reviewContent.replace(/'/g, "''")}');\n`;

    console.log(`Ingesting product: ${prod.name} -> Scheduled to publish on Edge at: ${publishedAt} (Editor: ${assignedEditor})`);
  });

  // Execute all SQL queries on respective databases
  for (const dbName of Object.keys(shardQueries)) {
    const tempFile = path.join(tempSqlDir, `${dbName}.sql`);
    fs.writeFileSync(tempFile, shardQueries[dbName].trim(), 'utf8');

    console.log(`\nExecuting ingestion batch on: ${dbName}...`);
    runWrangler(`wrangler d1 execute ${dbName} ${remoteFlag} --file="${tempFile}"`);
    console.log(`✅ Successfully updated ${dbName}`);
  }

  console.log('\n🎉 Ingestion cycle complete! Products are staged under different schedule timestamps.');

} catch (err) {
  console.error('\n❌ Ingestion cycle failed:', err.message);
} finally {
  // Cleanup temp files
  fs.rmSync(tempSqlDir, { recursive: true, force: true });
}
