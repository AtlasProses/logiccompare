import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const resources = {
  // Already created manually
  'logiccompare-core': 'f04789b5-9355-4ca0-8133-703270deb9eb',
  
  // Shards to create
  'logiccompare-specs-electronics': '',
  'logiccompare-specs-home-kitchen': '',
  'logiccompare-specs-pet-care': '',
  'logiccompare-specs-baby-children': '',
  'logiccompare-specs-lifestyle-books': '',
  'logiccompare-comments-tech': '',
  'logiccompare-comments-home-pets': '',
  'logiccompare-comments-lifestyle': ''
};

const kvNamespace = 'LOGIC_KV';
let kvId = '';

const wranglerPath = 'C:\\Program Files\\nodejs\\npx.cmd';

function runWrangler(args) {
  // Ensure Node path is in the environment
  const env = { ...process.env, PATH: `C:\\Program Files\\nodejs;${process.env.PATH}` };
  const cmd = `"${wranglerPath}" ${args}`;
  console.log(`Running: ${cmd}`);
  return execSync(cmd, { env, encoding: 'utf8' });
}

try {
  // 1. Create D1 Shards
  for (const name of Object.keys(resources)) {
    if (resources[name]) {
      console.log(`- ${name} already has ID: ${resources[name]}`);
      continue;
    }
    
    console.log(`Creating D1 database: ${name}...`);
    try {
      const output = runWrangler(`wrangler d1 create ${name}`);
      const idMatch = output.match(/database_id\s*=\s*"([^"]+)"/);
      if (idMatch && idMatch[1]) {
        resources[name] = idMatch[1];
        console.log(`✅ Created ${name} with ID: ${resources[name]}`);
      } else {
        throw new Error(`Could not parse database_id from output: ${output}`);
      }
    } catch (err) {
      console.error(`❌ Failed to create ${name}:`, err.message);
      // Fallback: Check if it already exists, wrangler list can show it
      console.log(`Checking existing databases list...`);
      const listOutput = runWrangler(`wrangler d1 list`);
      // Output format is JSON array or table. Let's try parsing it as JSON or regex search
      const regex = new RegExp(`│\\s*${name}\\s*│\\s*([a-f0-9-]+)\\s*│`, 'i');
      const match = listOutput.match(regex);
      if (match && match[1]) {
        resources[name] = match[1];
        console.log(`✅ Found existing database ${name} with ID: ${resources[name]}`);
      } else {
        throw err;
      }
    }
  }

  // 2. Create KV Namespace
  console.log(`Creating KV namespace: ${kvNamespace}...`);
  try {
    const output = runWrangler(`wrangler kv:namespace create ${kvNamespace}`);
    // Output format: { binding = "LOGIC_KV", id = "some-id" } or similar
    const idMatch = output.match(/id\s*=\s*"([^"]+)"/);
    if (idMatch && idMatch[1]) {
      kvId = idMatch[1];
      console.log(`✅ Created KV namespace ${kvNamespace} with ID: ${kvId}`);
    } else {
      throw new Error(`Could not parse KV id from output: ${output}`);
    }
  } catch (err) {
    console.error(`❌ Failed to create KV namespace:`, err.message);
    // Fallback: Check list
    console.log(`Checking existing KV namespaces...`);
    const listOutput = runWrangler(`wrangler kv:namespace list`);
    try {
      const kvList = JSON.parse(listOutput);
      const kvEntry = kvList.find(kv => kv.title === `logiccompare-api-${kvNamespace}`);
      if (kvEntry && kvEntry.id) {
        kvId = kvEntry.id;
        console.log(`✅ Found existing KV namespace ${kvNamespace} with ID: ${kvId}`);
      } else {
        throw err;
      }
    } catch (jsonErr) {
      // Regex fallback if JSON parse fails
      const regex = new RegExp(`"title":\\s*"[^"]*${kvNamespace}"[\\s\\S]*?"id":\\s*"([^"]+)"`, 'i');
      const match = listOutput.match(regex);
      if (match && match[1]) {
        kvId = match[1];
        console.log(`✅ Found existing KV namespace ${kvNamespace} with ID: ${kvId}`);
      } else {
        throw err;
      }
    }
  }

  // 3. Update wrangler.toml
  console.log('Updating wrangler.toml with generated IDs...');
  const tomlPath = path.join(process.cwd(), 'wrangler.toml');
  let tomlContent = fs.readFileSync(tomlPath, 'utf8');

  // Replace database IDs
  tomlContent = tomlContent.replace(/database_id\s*=\s*"core-db-placeholder-id"/, `database_id = "${resources['logiccompare-core']}"`);
  tomlContent = tomlContent.replace(/database_id\s*=\s*"specs-electronics-placeholder-id"/, `database_id = "${resources['logiccompare-specs-electronics']}"`);
  tomlContent = tomlContent.replace(/database_id\s*=\s*"specs-home-kitchen-placeholder-id"/, `database_id = "${resources['logiccompare-specs-home-kitchen']}"`);
  tomlContent = tomlContent.replace(/database_id\s*=\s*"specs-pet-care-placeholder-id"/, `database_id = "${resources['logiccompare-specs-pet-care']}"`);
  tomlContent = tomlContent.replace(/database_id\s*=\s*"specs-baby-children-placeholder-id"/, `database_id = "${resources['logiccompare-specs-baby-children']}"`);
  tomlContent = tomlContent.replace(/database_id\s*=\s*"specs-lifestyle-books-placeholder-id"/, `database_id = "${resources['logiccompare-specs-lifestyle-books']}"`);
  
  tomlContent = tomlContent.replace(/database_id\s*=\s*"comments-tech-placeholder-id"/, `database_id = "${resources['logiccompare-comments-tech']}"`);
  tomlContent = tomlContent.replace(/database_id\s*=\s*"comments-home-pets-placeholder-id"/, `database_id = "${resources['logiccompare-comments-home-pets']}"`);
  tomlContent = tomlContent.replace(/database_id\s*=\s*"comments-lifestyle-placeholder-id"/, `database_id = "${resources['logiccompare-comments-lifestyle']}"`);

  // Replace KV Namespace ID
  tomlContent = tomlContent.replace(/id\s*=\s*"kv-placeholder-id"/, `id = "${kvId}"`);

  fs.writeFileSync(tomlPath, tomlContent, 'utf8');
  console.log('🎉 wrangler.toml successfully updated!');
  
  console.log('\n--- SUMMARY ---');
  console.log(JSON.stringify({ D1: resources, KV: kvId }, null, 2));

} catch (globalErr) {
  console.error('💥 Script failed:', globalErr);
  process.exit(1);
}
