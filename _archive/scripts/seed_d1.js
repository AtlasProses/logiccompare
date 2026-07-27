/**
 * LogicCompare D1 Seeding Script
 * Generates seed.sql with comprehensive mock categories, brands, editors, and products.
 */

import fs from 'fs';
import path from 'path';

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
      ]
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
      ]
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
      ]
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
      ]
    }
  ]
};

function generateSql() {
  let sql = `-- Generated Seeding SQL for LogicCompare D1\n\n`;

  // 1. Brands
  sql += `-- Seeding Brands\n`;
  for (const b of mockData.brands) {
    sql += `INSERT OR IGNORE INTO brands (id, name) VALUES ('${b.id}', '${b.name.replace(/'/g, "''")}');\n`;
  }
  sql += `\n`;

  // 2. Categories
  sql += `-- Seeding Categories\n`;
  for (const c of mockData.categories) {
    const parent = c.parent_id ? `'${c.parent_id}'` : `NULL`;
    sql += `INSERT OR IGNORE INTO categories (id, name, parent_id) VALUES ('${c.id}', '${c.name.replace(/'/g, "''")}', ${parent});\n`;
  }
  sql += `\n`;

  // 3. Editors
  sql += `-- Seeding Editors\n`;
  for (const e of mockData.editors) {
    sql += `INSERT OR IGNORE INTO editors (id, name, role, avatar_url, bio) VALUES ('${e.id}', '${e.name.replace(/'/g, "''")}', '${e.role}', '${e.avatar_url}', '${e.bio.replace(/'/g, "''")}');\n`;
  }
  sql += `\n`;

  // 4. Products & Specs & Offers
  sql += `-- Seeding Products, Specs, and Offers\n`;
  for (const p of mockData.products) {
    const specsJson = JSON.stringify(p.specs).replace(/'/g, "''");
    sql += `INSERT OR IGNORE INTO products (id, name, brand_id, category_id, specs_json, avg_user_score, avg_editor_score) VALUES ('${p.id}', '${p.name.replace(/'/g, "''")}', '${p.brand_id}', '${p.category_id}', '${specsJson}', ${p.avg_user_score}, ${p.avg_editor_score});\n`;
    
    // Seed price offers
    for (const o of p.offers) {
      sql += `INSERT OR IGNORE INTO offers (product_id, store_name, price, affiliate_url) VALUES ('${p.id}', '${o.store}', ${o.price}, '${o.url}');\n`;
    }
  }

  return sql;
}

const seedSql = generateSql();
const seedFilePath = path.join(process.cwd(), 'seed.sql');

fs.writeFileSync(seedFilePath, seedSql);
console.log('✅ seed.sql containing initial databases created successfully.');
console.log('Execute this command to populate your local D1 database:');
console.log('\x1b[36m%s\x1b[0m', 'npx wrangler d1 execute logiccompare-db --local --file=./seed.sql');
