import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const isRemote = process.argv.includes('--remote');
console.log(`Starting 100 Virtual Editors generation (Target: ${isRemote ? 'REMOTE Production' : 'LOCAL Emulator'})...`);

const wranglerPath = 'C:\\Program Files\\nodejs\\npx.cmd';

function runWrangler(args) {
  const env = { ...process.env, PATH: `C:\\Program Files\\nodejs;${process.env.PATH}` };
  // Inject config file flag
  const patchedArgs = args.replace('wrangler', 'wrangler -c wrangler.api.toml');
  const cmd = `"${wranglerPath}" ${patchedArgs}`;
  console.log(`Running: ${cmd}`);
  return execSync(cmd, { env, encoding: 'utf8' });
}

const firstNames = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Oliver", "Sophia", "Elijah", "Isabella", "James",
  "Mia", "Benjamin", "Charlotte", "Lucas", "Amelia", "Mason", "Harper", "Ethan", "Evelyn", "Alexander",
  "Ahmet", "Mehmet", "Ayşe", "Fatma", "Mustafa", "Emine", "Ali", "Zeynep", "Hüseyin", "Elif",
  "John", "Sarah", "Michael", "David", "Robert", "Linda", "William", "Elizabeth", "Richard", "Barbara"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Yıldız", "Yıldırım", "Öztürk", "Aydın", "Özdemir",
  "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Young", "Allen"
];

const roles = ['Chief', 'Super', 'Senior', 'General'];

const niches = [
  { category: 'electronics', keywords: ['tech', 'hardware', 'mobile', 'gadgets', 'computers'] },
  { category: 'home-kitchen', keywords: ['home appliances', 'coffee enthusiast', 'smart home', 'kitchen master'] },
  { category: 'pet-care', keywords: ['veterinary assistant', 'pet trainer', 'dog lover', 'cat behaviors'] },
  { category: 'baby-children', keywords: ['parenting expert', 'child educator', 'pediatric nurse', 'baby gear critic'] },
  { category: 'lifestyle-books', keywords: ['literature critic', 'fitness coach', 'bookworm', 'wellbeing advisor'] }
];

function generateEditors() {
  const editors = [];
  const usedNames = new Set();

  for (let i = 1; i <= 100; i++) {
    let firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    let lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    let fullName = `${firstName} ${lastName}`;
    
    // Ensure uniqueness
    while (usedNames.has(fullName)) {
      firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      fullName = `${firstName} ${lastName}`;
    }
    usedNames.add(fullName);

    const role = roles[Math.floor(Math.random() * roles.length)];
    const niche = niches[i % niches.length];
    const keyword = niche.keywords[Math.floor(Math.random() * niche.keywords.length)];
    
    const bio = `${role} Editor specializing in ${niche.category}. Focused on ${keyword} analysis, reviews, and specifications auditing.`;
    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName)}`;

    editors.push({
      id: `ed-${1000 + i}`,
      name: fullName,
      role: role,
      avatar_url: avatarUrl,
      bio: bio
    });
  }

  return editors;
}

const editors = generateEditors();

let sql = `-- Seeding 100 Virtual Editors into core\n`;
for (const e of editors) {
  sql += `INSERT OR IGNORE INTO editors (id, name, role, avatar_url, bio) VALUES ('${e.id}', '${e.name.replace(/'/g, "''")}', '${e.role}', '${e.avatar_url}', '${e.bio.replace(/'/g, "''")}');\n`;
}

try {
  const tempSqlDir = path.join(process.cwd(), 'temp_editors_sql');
  if (!fs.existsSync(tempSqlDir)) {
    fs.mkdirSync(tempSqlDir);
  }

  const tempFile = path.join(tempSqlDir, 'editors.sql');
  fs.writeFileSync(tempFile, sql.trim(), 'utf8');

  console.log(`\nInserting 100 Virtual Editors into logiccompare-core...`);
  const remoteFlag = isRemote ? '--remote' : '--local';
  runWrangler(`wrangler d1 execute logiccompare-core ${remoteFlag} --file="${tempFile}"`);
  console.log(`✅ Successfully generated and seeded 100 Virtual Editors!`);

  // Cleanup
  fs.rmSync(tempSqlDir, { recursive: true, force: true });
} catch (err) {
  console.error('\n❌ Generation failed:', err.message);
  process.exit(1);
}
