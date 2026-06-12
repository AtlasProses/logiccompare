import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const isRemote = process.argv.includes('--remote');
console.log(`Starting schema deployment (Target: ${isRemote ? 'REMOTE Production' : 'LOCAL Emulator'})...`);

const wranglerPath = 'C:\\Program Files\\nodejs\\npx.cmd';

function runWrangler(args) {
  const env = { ...process.env, PATH: `C:\\Program Files\\nodejs;${process.env.PATH}` };
  const cmd = `"${wranglerPath}" ${args}`;
  console.log(`Running: ${cmd}`);
  return execSync(cmd, { env, encoding: 'utf8' });
}

// 1. Schemas definitions
const schemas = {
  core: `
    CREATE TABLE IF NOT EXISTS brands (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT,
        FOREIGN KEY(parent_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS editors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT CHECK(role IN ('Chief', 'Super', 'Senior', 'General')),
        avatar_url TEXT,
        bio TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  specs: `
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        brand_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        specs_json TEXT NOT NULL,
        views INTEGER DEFAULT 0,
        avg_user_score REAL DEFAULT 0.0,
        avg_editor_score REAL DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS offers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL,
        store_name TEXT CHECK(store_name IN ('Amazon', 'Temu', 'AliExpress')),
        price REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        affiliate_url TEXT NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_products_views ON products(views DESC);
    CREATE INDEX IF NOT EXISTS idx_products_lookup ON products(category_id, brand_id);
    CREATE INDEX IF NOT EXISTS idx_offers_product ON offers(product_id);
  `,
  comments: `
    CREATE TABLE IF NOT EXISTS editor_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL,
        editor_id TEXT NOT NULL,
        rating INTEGER CHECK(rating BETWEEN 1 AND 5),
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_reviews (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        rating INTEGER CHECK(rating BETWEEN 1 AND 5),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS review_reactions (
        review_id TEXT NOT NULL,
        visitor_hash TEXT NOT NULL,
        reaction_type TEXT CHECK(reaction_type IN ('like', 'dislike', 'heart', 'favorite')),
        PRIMARY KEY(review_id, visitor_hash, reaction_type)
    );

    CREATE INDEX IF NOT EXISTS idx_user_reviews_product ON user_reviews(product_id);
    CREATE INDEX IF NOT EXISTS idx_reactions_lookup ON review_reactions(review_id);
  `
};

// 2. Database assignments
const deployments = [
  { db: 'logiccompare-core', schema: schemas.core },
  { db: 'logiccompare-specs-electronics', schema: schemas.specs },
  { db: 'logiccompare-specs-home-kitchen', schema: schemas.specs },
  { db: 'logiccompare-specs-pet-care', schema: schemas.specs },
  { db: 'logiccompare-specs-baby-children', schema: schemas.specs },
  { db: 'logiccompare-specs-lifestyle-books', schema: schemas.specs },
  { db: 'logiccompare-comments-tech', schema: schemas.comments },
  { db: 'logiccompare-comments-home-pets', schema: schemas.comments },
  { db: 'logiccompare-comments-lifestyle', schema: schemas.comments }
];

try {
  const tempSqlDir = path.join(process.cwd(), 'temp_sql');
  if (!fs.existsSync(tempSqlDir)) {
    fs.mkdirSync(tempSqlDir);
  }

  for (const dep of deployments) {
    const tempFile = path.join(tempSqlDir, `${dep.db}.sql`);
    fs.writeFileSync(tempFile, dep.schema.trim(), 'utf8');
    
    console.log(`\nDeploying schema to ${dep.db}...`);
    const remoteFlag = isRemote ? '--remote' : '--local';
    
    runWrangler(`wrangler d1 execute ${dep.db} ${remoteFlag} --file="${tempFile}"`);
    console.log(`✅ Successfully deployed schema to ${dep.db}`);
  }

  // Cleanup temp sql files
  fs.rmSync(tempSqlDir, { recursive: true, force: true });
  console.log('\n🎉 All database schemas deployed successfully!');
  
} catch (err) {
  console.error('\n❌ Deployment failed:', err.message);
  process.exit(1);
}
