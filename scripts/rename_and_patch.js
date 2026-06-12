import fs from 'fs';
import path from 'path';

console.log('Renaming wrangler.toml to wrangler.api.toml and patching scripts...');

const projectDir = process.cwd();
const tomlPath = path.join(projectDir, 'wrangler.toml');
const apiTomlPath = path.join(projectDir, 'wrangler.api.toml');

// 1. Rename wrangler.toml to wrangler.api.toml
if (fs.existsSync(tomlPath)) {
  fs.renameSync(tomlPath, apiTomlPath);
  console.log('✅ Renamed wrangler.toml -> wrangler.api.toml');
} else if (fs.existsSync(apiTomlPath)) {
  console.log('- wrangler.api.toml already renamed.');
} else {
  console.error('❌ Could not find wrangler.toml!');
}

// 2. Patch setup and ingestion scripts
const scriptsToPatch = [
  'setup_cloudflare_resources.js',
  'deploy_schemas.js',
  'seed_databases.js',
  'generate_editors.js',
  'add_published_column.js',
  'ingest_stealth.js'
];

scriptsToPatch.forEach(filename => {
  const scriptPath = path.join(projectDir, 'scripts', filename);
  if (!fs.existsSync(scriptPath)) {
    console.log(`- Script ${filename} not found, skipping.`);
    return;
  }

  let content = fs.readFileSync(scriptPath, 'utf8');

  // Replace wrangler.toml reference in setup_cloudflare_resources.js
  if (filename === 'setup_cloudflare_resources.js') {
    content = content.replace(/'wrangler\.toml'/g, "'wrangler.api.toml'");
    content = content.replace(/'Updating wrangler\.toml/g, "'Updating wrangler.api.toml");
  }

  // Replace runWrangler definition to inject config file
  const originalFunc = `function runWrangler(args) {
  const env = { ...process.env, PATH: \`C:\\\\Program Files\\\\nodejs;\${process.env.PATH}\` };
  const cmd = \`"\${wranglerPath}" \${args}\`;`;

  const patchedFunc = `function runWrangler(args) {
  const env = { ...process.env, PATH: \`C:\\\\Program Files\\\\nodejs;\${process.env.PATH}\` };
  // Inject config file flag
  const patchedArgs = args.replace('wrangler', 'wrangler -c wrangler.api.toml');
  const cmd = \`"\${wranglerPath}" \${patchedArgs}\`;`;

  if (content.includes(originalFunc)) {
    content = content.replace(originalFunc, patchedFunc);
    fs.writeFileSync(scriptPath, content, 'utf8');
    console.log(`✅ Patched ${filename}`);
  } else if (content.includes('patchedArgs = args.replace')) {
    console.log(`- ${filename} already patched.`);
  } else {
    console.warn(`⚠️ Could not patch runWrangler in ${filename} (pattern mismatch)`);
  }
});

console.log('🎉 Done!');
