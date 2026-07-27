const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\MCKR-Asus\\.gemini\\antigravity\\brain\\77214e77-f26a-4640-873c-aa148b8a25f1';
const destDir = 'C:\\Users\\MCKR-Asus\\.gemini\\antigravity\\scratch\\logiccompare\\public\\images\\authors';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const mappings = [
  { prefix: 'michael_brown', slug: 'michael-brown' },
  { prefix: 'felix_m_ller', slug: 'felix-m-ller' },
  { prefix: 'camille_dubois', slug: 'camille-dubois' },
  { prefix: 'marco_conti', slug: 'marco-conti' },
  { prefix: 'beatriz_costa', slug: 'beatriz-costa' },
  { prefix: 'anna_kowalska', slug: 'anna-kowalska' },
  { prefix: 'diego_lopez', slug: 'diego-lopez' },
  { prefix: 'elena_volkova', slug: 'elena-volkova' },
  { prefix: 'hiroshi_tanaka', slug: 'hiroshi-tanaka' },
  { prefix: 'li_wei', slug: 'li-wei' }
];

const files = fs.readdirSync(srcDir);

mappings.forEach(m => {
  const match = files.find(f => f.startsWith(m.prefix) && f.endsWith('.jpg'));
  if (match) {
    const srcPath = path.join(srcDir, match);
    
    // Copy 1: original filename
    fs.copyFileSync(srcPath, path.join(destDir, match));
    
    // Copy 2: slug filename with .jpg
    fs.copyFileSync(srcPath, path.join(destDir, `${m.slug}.jpg`));
    
    // Copy 3: slug filename with underscores
    fs.copyFileSync(srcPath, path.join(destDir, `${m.prefix}.jpg`));
    
    console.log(`Copied ${match} -> ${m.slug}.jpg & ${m.prefix}.jpg`);
  } else {
    console.error(`File starting with ${m.prefix} not found!`);
  }
});
