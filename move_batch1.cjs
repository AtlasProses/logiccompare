const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const artifactsDir = 'C:\\Users\\MCKR-Asus\\.gemini\\antigravity\\brain\\1bd5908d-9e8a-4fd5-8480-789120cc0e78';
const destDir = path.join(__dirname, 'public', 'images', 'authors');

const files = fs.readdirSync(artifactsDir).filter(f => f.endsWith('.jpg') && !f.includes('valentina'));

async function processFiles() {
  for (const file of files) {
    const authorName = file.split('_').slice(0, 2).join('-').replace(/-\d+$/, '');
    const srcPath = path.join(artifactsDir, file);
    
    // special handling for names
    let finalName = authorName;
    if (authorName === 'amir-alfayed') finalName = 'amir-al-fayed';

    const destPath = path.join(destDir, `${finalName}.webp`);
    
    console.log(`Converting ${file} -> ${finalName}.webp`);
    try {
      await sharp(srcPath).webp().toFile(destPath);
      // fs.unlinkSync(srcPath);
    } catch(err) {
      console.error(err);
    }
  }
}
processFiles();
