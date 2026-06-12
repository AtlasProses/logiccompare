import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const isRemote = process.argv.includes('--remote');
console.log(`Starting database seeding (Target: ${isRemote ? 'REMOTE Production' : 'LOCAL Emulator'})...`);

const wranglerPath = 'C:\\Program Files\\nodejs\\npx.cmd';

function runWrangler(args) {
  const env = { ...process.env, PATH: `C:\\Program Files\\nodejs;${process.env.PATH}` };
  // Inject config file flag
  const patchedArgs = args.replace('wrangler', 'wrangler -c wrangler.api.toml');
  const cmd = `"${wranglerPath}" ${patchedArgs}`;
  console.log(`Running: ${cmd}`);
  return execSync(cmd, { env, encoding: 'utf8' });
}

const mockData = {
  brands: [
    { id: "apple", name: "Apple" },
    { id: "samsung", name: "Samsung" },
    { id: "xiaomi", name: "Xiaomi" },
    { id: "dyson", name: "Dyson" },
    { id: "sage", name: "Sage/Breville" },
    { id: "purina", name: "Purina" },
    { id: "philips", name: "Philips" },
    { id: "gimcat", name: "GimCat" },
    { id: "catit", name: "Catit" },
    { id: "bugaboo", name: "Bugaboo" },
    { id: "britax-romer", name: "Britax Römer" },
    { id: "panama-yayincilik", name: "Panama Yayıncılık" },
    { id: "altin-kitaplar", name: "Altın Kitaplar" },
    { id: "roborock", name: "Roborock" },
    { id: "delonghi", name: "DeLonghi" },
    { id: "dell", name: "Dell" }
  ],
  categories: [
    { id: "electronics", name: "Electronics", parent_id: null },
    { id: "smartphones", name: "Smartphones", parent_id: "electronics" },
    { id: "laptops", name: "Laptops", parent_id: "electronics" },
    { id: "home-kitchen", name: "Home & Kitchen", parent_id: null },
    { id: "appliances", name: "Appliances", parent_id: "home-kitchen" },
    { id: "coffee-gear", name: "Coffee Gear", parent_id: "home-kitchen" },
    { id: "pet-care", name: "Pet Care", parent_id: null },
    { id: "smart-feeders", name: "Smart Feeders", parent_id: "pet-care" },
    { id: "pet-food", name: "Pet Food", parent_id: "pet-care" },
    { id: "pet-fountains", name: "Pet Fountains", parent_id: "pet-care" },
    { id: "pet-pastes", name: "Pet Pastes", parent_id: "pet-care" },
    { id: "pet-toys", name: "Pet Toys", parent_id: "pet-care" },
    { id: "baby-children", name: "Baby & Children", parent_id: null },
    { id: "baby-monitors", name: "Baby Monitors", parent_id: "baby-children" },
    { id: "strollers", name: "Strollers", parent_id: "baby-children" },
    { id: "car-seats", name: "Car Seats", parent_id: "baby-children" },
    { id: "baby-toys", name: "Children Toys", parent_id: "baby-children" },
    { id: "lifestyle-books", name: "Books & Lifestyle", parent_id: null },
    { id: "books-novels", name: "Novels & Literature", parent_id: "lifestyle-books" },
    { id: "books-finance", name: "Personal Finance", parent_id: "lifestyle-books" }
  ],
  editors: [
    { id: "ed-admin", name: "Marcus Aurelius", role: "Chief", avatar_url: "https://avatar.vercel.sh/marcus", bio: "Chief Editor of LogicCompare. Obsessed with data-driven hardware choices." },
    { id: "ed-tech", name: "Alice Zhang", role: "Super", avatar_url: "https://avatar.vercel.sh/alice", bio: "Super Editor for Electronics. Former hardware designer." },
    { id: "ed-home", name: "John Doe", role: "Super", avatar_url: "https://avatar.vercel.sh/john", bio: "Super Editor for Home & Kitchen. Loves reviewing espresso machines." },
    { id: "ed-pets", name: "Sarah Connor", role: "Senior", avatar_url: "https://avatar.vercel.sh/sarah", bio: "Senior Editor for Pet Care. Dedicated cat shelter volunteer." }
  ],
  products: [
    {
      id: "iphone-15-pro-max",
      name: "iPhone 15 Pro Max",
      brand_id: "apple",
      category_id: "smartphones",
      avg_user_score: 4.7,
      avg_editor_score: 4.8,
      specs: { "Display": "6.7-inch OLED", "Processor": "A17 Pro", "Battery": "4441 mAh", "RAM": "8 GB", "OS": "iOS 17", "Launch Date": "2023-09-12", "Release Date": "2023-09-22", "Series": "Pro Series" },
      offers: [{ store: "Amazon", price: 1199.00, url: "https://amzn.to/example-iphone" }],
      reviews: [{ id: "rev-ip-1", author: "Marcus Aurelius", type: "editor", rating: 5, content: "A17 Pro chipset sets a new benchmark for mobile processors.", date: "2026-01-15" }],
      shard: "logiccompare-specs-electronics"
    },
    {
      id: "galaxy-s24-ultra",
      name: "Galaxy S24 Ultra",
      brand_id: "samsung",
      category_id: "smartphones",
      avg_user_score: 4.8,
      avg_editor_score: 4.9,
      specs: { "Display": "6.8-inch AMOLED", "Processor": "Snapdragon 8 Gen 3", "Battery": "5000 mAh", "RAM": "12 GB", "OS": "Android 14", "Launch Date": "2024-01-17", "Release Date": "2024-01-31", "Series": "Galaxy S Series" },
      offers: [{ store: "Amazon", price: 1299.00, url: "https://amzn.to/example-galaxy" }],
      reviews: [{ id: "rev-s24-1", author: "Alice Zhang", type: "editor", rating: 5, content: "Galaxy AI features are helpful and screens are anti-reflective.", date: "2026-01-20" }],
      shard: "logiccompare-specs-electronics"
    },
    {
      id: "sage-barista-express",
      name: "Barista Express Espresso Machine",
      brand_id: "sage",
      category_id: "coffee-gear",
      avg_user_score: 4.6,
      avg_editor_score: 4.7,
      specs: { "Type": "Semi-Automatic", "Pressure": "15 Bar", "Water Tank": "2.0L", "Grinder": "Integrated Burr", "Heating System": "ThermoCoil" },
      offers: [{ store: "Amazon", price: 699.95, url: "https://amzn.to/example-sage" }],
      reviews: [{ id: "rev-sage-1", author: "John Doe", type: "editor", rating: 5, content: "The gold standard for home espresso beginners. Excellent PID controller.", date: "2026-02-10" }],
      shard: "logiccompare-specs-home-kitchen"
    },
    {
      id: "dyson-v15-detect",
      name: "V15 Detect Cordless Vacuum",
      brand_id: "dyson",
      category_id: "appliances",
      avg_user_score: 4.7,
      avg_editor_score: 4.5,
      specs: { "Suction Power": "240 AW", "Run Time": "60 mins", "Bin Volume": "0.76 L", "Filtration": "5-stage", "Weight": "3.1 kg" },
      offers: [{ store: "Amazon", price: 599.99, url: "https://amzn.to/example-dyson" }],
      reviews: [{ id: "rev-d15-1", author: "John Doe", type: "editor", rating: 5, content: "Laser dust detection makes invisible dust clearly visible.", date: "2026-01-05" }],
      shard: "logiccompare-specs-home-kitchen"
    },
    {
      id: "xiaomi-smart-pet-feeder",
      name: "Smart Pet Feeder",
      brand_id: "xiaomi",
      category_id: "smart-feeders",
      avg_user_score: 4.5,
      avg_editor_score: 4.4,
      specs: { "Capacity": "3.6 L", "Material": "Stainless Steel", "Connectivity": "Wi-Fi 2.4GHz", "Dimensions": "31.1 x 18.0 x 38.7 cm", "Weight": "3 kg" },
      offers: [{ store: "Amazon", price: 99.99, url: "https://amzn.to/example-petfeeder" }],
      reviews: [{ id: "rev-pf-1", author: "Sarah Connor", type: "editor", rating: 4, content: "Very reliable dispensing mechanism that doesn't jam.", date: "2026-01-20" }],
      shard: "logiccompare-specs-pet-care"
    },
    {
      id: "philips-avent-video-monitor",
      name: "Avent Smart Baby Monitor",
      brand_id: "philips",
      category_id: "baby-monitors",
      avg_user_score: 4.4,
      avg_editor_score: 4.3,
      specs: { "Display": "5-inch LCD", "Battery": "12 Hours", "Main Camera": "HD Night Vision", "Weight": "380 g" },
      offers: [{ store: "Amazon", price: 149.99, url: "https://amzn.to/example-babymonitor" }],
      reviews: [{ id: "rev-pa-1", author: "Marcus Aurelius", type: "editor", rating: 4, content: "Highly secure FHSS connection with clear audio/video output.", date: "2026-01-30" }],
      shard: "logiccompare-specs-baby-children"
    },
    {
      id: "babilin-en-zengin-adami",
      name: "Babil'in En Zengin Adamı",
      brand_id: "panama-yayincilik",
      category_id: "books-finance",
      avg_user_score: 4.9,
      avg_editor_score: 4.8,
      specs: { "Author": "George S. Clason", "Publisher": "Panama Yayıncılık", "Translator": "Selin Ceyhan", "ISBN": "9786052243452", "Edition": "45. Baskı", "Pages": "160 Sayfa", "Binding": "Karton Kapak", "Paper": "2. Hamur", "Dimensions": "13.5 x 21 cm" },
      offers: [{ store: "Amazon", price: 4.50, url: "https://amzn.to/example-babil" }],
      reviews: [{ id: "rev-babil-1", author: "Marcus Aurelius", type: "editor", rating: 5, content: "A timeless masterpiece on wealth building.", date: "2026-01-10" }],
      shard: "logiccompare-specs-lifestyle-books"
    }
  ]
};

// 1. Generate Core SQL
let coreSql = `-- Seeding logiccompare-core\n`;
for (const b of mockData.brands) {
  coreSql += `INSERT OR IGNORE INTO brands (id, name) VALUES ('${b.id}', '${b.name.replace(/'/g, "''")}');\n`;
}
for (const c of mockData.categories) {
  const parent = c.parent_id ? `'${c.parent_id}'` : `NULL`;
  coreSql += `INSERT OR IGNORE INTO categories (id, name, parent_id) VALUES ('${c.id}', '${c.name.replace(/'/g, "''")}', ${parent});\n`;
}
for (const e of mockData.editors) {
  coreSql += `INSERT OR IGNORE INTO editors (id, name, role, avatar_url, bio) VALUES ('${e.id}', '${e.name.replace(/'/g, "''")}', '${e.role}', '${e.avatar_url}', '${e.bio.replace(/'/g, "''")}');\n`;
}
// Add guest user for user reviews foreign key compatibility
coreSql += `INSERT OR IGNORE INTO users (id, email, username) VALUES ('usr-guest', 'guest@logiccompare.com', 'GuestUser');\n`;

// 2. Generate Shards SQL
const shardSqls = {
  'logiccompare-specs-electronics': `-- Seeding electronics specs\n`,
  'logiccompare-specs-home-kitchen': `-- Seeding home-kitchen specs\n`,
  'logiccompare-specs-pet-care': `-- Seeding pet-care specs\n`,
  'logiccompare-specs-baby-children': `-- Seeding baby-children specs\n`,
  'logiccompare-specs-lifestyle-books': `-- Seeding lifestyle-books specs\n`,
  'logiccompare-comments-tech': `-- Seeding tech comments\n`,
  'logiccompare-comments-home-pets': `-- Seeding home-pets comments\n`,
  'logiccompare-comments-lifestyle': `-- Seeding lifestyle comments\n`
};

for (const p of mockData.products) {
  const specsJson = JSON.stringify(p.specs).replace(/'/g, "''");
  let sql = `INSERT OR IGNORE INTO products (id, name, brand_id, category_id, specs_json, avg_user_score, avg_editor_score) VALUES ('${p.id}', '${p.name.replace(/'/g, "''")}', '${p.brand_id}', '${p.category_id}', '${specsJson}', ${p.avg_user_score}, ${p.avg_editor_score});\n`;
  
  for (const o of p.offers) {
    sql += `INSERT OR IGNORE INTO offers (product_id, store_name, price, affiliate_url) VALUES ('${p.id}', '${o.store}', ${o.price}, '${o.url}');\n`;
  }
  shardSqls[p.shard] += sql;

  if (p.reviews) {
    let commentShard = 'logiccompare-comments-tech';
    if (p.shard === 'logiccompare-specs-home-kitchen' || p.shard === 'logiccompare-specs-pet-care' || p.shard === 'logiccompare-specs-baby-children') {
      commentShard = 'logiccompare-comments-home-pets';
    } else if (p.shard === 'logiccompare-specs-lifestyle-books') {
      commentShard = 'logiccompare-comments-lifestyle';
    }

    let reviewSql = '';
    for (const r of p.reviews) {
      if (r.type === 'editor') {
        reviewSql += `INSERT OR IGNORE INTO editor_reviews (product_id, editor_id, rating, content, created_at) VALUES ('${p.id}', 'ed-admin', ${r.rating}, '${r.content.replace(/'/g, "''")}', '${r.date}');\n`;
      } else {
        reviewSql += `INSERT OR IGNORE INTO user_reviews (id, product_id, user_id, rating, content, created_at) VALUES ('${r.id}', '${p.id}', 'usr-guest', ${r.rating}, '${r.content.replace(/'/g, "''")}', '${r.date}');\n`;
      }
    }
    shardSqls[commentShard] += reviewSql;
  }
}

try {
  const tempSqlDir = path.join(process.cwd(), 'temp_seed_sql');
  if (!fs.existsSync(tempSqlDir)) {
    fs.mkdirSync(tempSqlDir);
  }

  const remoteFlag = isRemote ? '--remote' : '--local';

  // Seed Core
  const coreFile = path.join(tempSqlDir, 'logiccompare-core.sql');
  fs.writeFileSync(coreFile, coreSql.trim(), 'utf8');
  console.log(`\nSeeding logiccompare-core...`);
  runWrangler(`wrangler d1 execute logiccompare-core ${remoteFlag} --file="${coreFile}"`);
  console.log(`✅ Seeded logiccompare-core successfully.`);

  // Seed Specs Shards & Comments Shards
  for (const shard of Object.keys(shardSqls)) {
    const shardFile = path.join(tempSqlDir, `${shard}.sql`);
    fs.writeFileSync(shardFile, shardSqls[shard].trim(), 'utf8');
    
    const lineCount = shardSqls[shard].split('\n').filter(line => line.trim().startsWith('INSERT')).length;
    if (lineCount === 0) {
      console.log(`- Skipping shard ${shard} (no inserts registered).`);
      continue;
    }
    
    console.log(`\nSeeding ${shard}...`);
    runWrangler(`wrangler d1 execute ${shard} ${remoteFlag} --file="${shardFile}"`);
    console.log(`✅ Seeded ${shard} successfully.`);
  }

  // Cleanup
  fs.rmSync(tempSqlDir, { recursive: true, force: true });
  console.log('\n🎉 Seeding completed successfully!');

} catch (err) {
  console.error('\n❌ Seeding failed:', err.message);
  process.exit(1);
}
