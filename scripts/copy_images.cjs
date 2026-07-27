const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\MCKR-Asus\\.gemini\\antigravity\\brain\\ef5253c2-24e2-480f-b4d5-add21849cf48';
const destDir = 'C:\\Users\\MCKR-Asus\\.gemini\\antigravity\\scratch\\logiccompare\\public\\images\\authors';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const mapping = {
  'nguyen_thi_mai': 'nguyen-thi-mai.jpg',
  'anjali_desai': 'anjali-desai.jpg',
  'rahul_sharma': 'rahul-sharma.jpg',
  'aisha_rahman': 'aisha-rahman.jpg',
  'omar_al_hassan': 'omar-al-hassan.jpg',
  'kwame_osei': 'kwame-osei.jpg',
  'amara_ndiaye': 'amara-ndiaye.jpg',
  'zola_ndlovu': 'zola-ndlovu.jpg',
  'kaan_demir': 'kaan-demir.jpg',
  'zeynep_kaya': 'zeynep-kaya.jpg'
};

const files = fs.readdirSync(srcDir);
for (const [prefix, destName] of Object.entries(mapping)) {
  const file = files.find(f => f.startsWith(prefix) && f.endsWith('.jpg'));
  if (file) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, destName);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} -> ${destName}`);
  } else {
    console.error(`NOT FOUND: ${prefix}`);
  }
}
