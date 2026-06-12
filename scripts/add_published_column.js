import { execSync } from 'child_process';

const isRemote = process.argv.includes('--remote');
console.log(`Starting schema migration: Adding published_at column (Target: ${isRemote ? 'REMOTE Production' : 'LOCAL Emulator'})...`);

const wranglerPath = 'C:\\Program Files\\nodejs\\npx.cmd';

function runWrangler(args) {
  const env = { ...process.env, PATH: `C:\\Program Files\\nodejs;${process.env.PATH}` };
  const cmd = `"${wranglerPath}" ${args}`;
  console.log(`Running: ${cmd}`);
  return execSync(cmd, { env, encoding: 'utf8' });
}

const specDbs = [
  'logiccompare-specs-electronics',
  'logiccompare-specs-home-kitchen',
  'logiccompare-specs-pet-care',
  'logiccompare-specs-baby-children',
  'logiccompare-specs-lifestyle-books'
];

const query = 'ALTER TABLE products ADD COLUMN published_at TIMESTAMP DEFAULT NULL;';
const queryIndex = 'CREATE INDEX IF NOT EXISTS idx_products_published ON products(published_at);';

const remoteFlag = isRemote ? '--remote' : '--local';

for (const db of specDbs) {
  console.log(`\nMigrating ${db}...`);
  try {
    // Add column
    runWrangler(`wrangler d1 execute ${db} ${remoteFlag} --command="${query}"`);
    console.log(`- Column added.`);
    
    // Add index
    runWrangler(`wrangler d1 execute ${db} ${remoteFlag} --command="${queryIndex}"`);
    console.log(`- Index created.`);
    
    console.log(`✅ Successfully migrated ${db}`);
  } catch (err) {
    // If it already exists, that's fine
    if (err.message.includes('duplicate column name')) {
      console.log(`- Column already exists, skipping.`);
    } else {
      console.error(`❌ Failed to migrate ${db}:`, err.message);
    }
  }
}

console.log('\n🎉 Migration completed successfully!');
