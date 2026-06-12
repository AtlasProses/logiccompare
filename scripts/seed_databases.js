import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const isRemote = process.argv.includes('--remote');
console.log(`Starting database seeding (Target: ${isRemote ? 'REMOTE Production' : 'LOCAL Emulator'})...`);

const wranglerPath = 'C:\\Program Files\\nodejs\\npx.cmd';

function runWrangler(args) {
  const env = { ...process.env, PATH: `C:\\Program Files\\nodejs;${process.env.PATH}` };
  const cmd = `"${wranglerPath}" ${args}`;
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
    { id: "philips", name: "Philips" }
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
    { id: "baby-children", name: "Baby & Children", parent_id: null },
    { id: "baby-monitors", name: "Baby Monitors", parent_id: "baby-children" }
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
      specs: { "Display": "6.7-inch OLED", "Processor": "A17 Pro", "Battery": "4441 mAh", "RAM": "8 GB", "OS": "iOS 17" },
      offers: [
        { store: "Amazon", price: 1199.00, url: "https://amzn.to/example-iphone" },
        { store: "AliExpress", price: 1150.00, url: "https://aliexpress.com/example-iphone" }
      ],
      shard: "logiccompare-specs-electronics"
    },
    {
      id: "galaxy-s24-ultra",
      name: "Galaxy S24 Ultra",
      brand_id: "samsung",
      category_id: "smartphones",
      avg_user_score: 4.8,
      avg_editor_score: 4.9,
      specs: { "Display": "6.8-inch AMOLED", "Processor": "Snapdragon 8 Gen 3", "Battery": "5000 mAh", "RAM": "12 GB", "OS": "Android 14" },
      offers: [
        { store: "Amazon", price: 1299.00, url: "https://amzn.to/example-galaxy" },
        { store: "Temu", price: 1250.00, url: "https://temu.com/example-galaxy" }
      ],
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
      offers: [
        { store: "Amazon", price: 699.95, url: "https://amzn.to/example-sage" }
      ],
      shard: "logiccompare-specs-home-kitchen"
    },
    {
      id: "dyson-airwrap-multistyler",
      name: "Airwrap Multi-Styler Complete",
      brand_id: "dyson",
      category_id: "appliances",
      avg_user_score: 4.7,
      avg_editor_score: 4.5,
      specs: { "Power": "1300W", "Speed Settings": "3", "Heat Settings": "3", "Airflow": "13.5 l/s", "Weight": "660g" },
      offers: [
        { store: "Amazon", price: 599.99, url: "https://amzn.to/example-dyson" }
      ],
      shard: "logiccompare-specs-home-kitchen"
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

// 2. Generate Shards SQL
const shardSqls = {
  'logiccompare-specs-electronics': `-- Seeding electronics specs\n`,
  'logiccompare-specs-home-kitchen': `-- Seeding home-kitchen specs\n`,
  'logiccompare-specs-pet-care': `-- Seeding pet-care specs\n`,
  'logiccompare-specs-baby-children': `-- Seeding baby-children specs\n`,
  'logiccompare-specs-lifestyle-books': `-- Seeding lifestyle-books specs\n`
};

for (const p of mockData.products) {
  const specsJson = JSON.stringify(p.specs).replace(/'/g, "''");
  let sql = `INSERT OR IGNORE INTO products (id, name, brand_id, category_id, specs_json, avg_user_score, avg_editor_score) VALUES ('${p.id}', '${p.name.replace(/'/g, "''")}', '${p.brand_id}', '${p.category_id}', '${specsJson}', ${p.avg_user_score}, ${p.avg_editor_score});\n`;
  
  for (const o of p.offers) {
    sql += `INSERT OR IGNORE INTO offers (product_id, store_name, price, affiliate_url) VALUES ('${p.id}', '${o.store}', ${o.price}, '${o.url}');\n`;
  }
  
  shardSqls[p.shard] += sql;
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

  // Seed Specs Shards
  for (const shard of Object.keys(shardSqls)) {
    const shardFile = path.join(tempSqlDir, `${shard}.sql`);
    fs.writeFileSync(shardFile, shardSqls[shard].trim(), 'utf8');
    
    // Check if there are inserts to perform (beyond comment lines)
    const lineCount = shardSqls[shard].split('\n').filter(line => line.trim().startsWith('INSERT')).length;
    if (lineCount === 0) {
      console.log(`- Skipping shard ${shard} (no mock products registered).`);
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
