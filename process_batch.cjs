const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const artifactsDir = 'C:\\Users\\MCKR-Asus\\.gemini\\antigravity\\brain\\1bd5908d-9e8a-4fd5-8480-789120cc0e78';
const destDir = path.join(__dirname, 'public', 'images', 'authors');
const authorsDir = path.join(__dirname, 'src', 'content', 'authors');

const files = fs.readdirSync(artifactsDir).filter(f => f.endsWith('.jpg') && !f.includes('valentina') && !f.includes('portrait'));

async function processFiles() {
  for (const file of files) {
    const authorName = file.split('_').slice(0, 2).join('-').replace(/-\d+$/, '');
    
    // special handling for names if needed
    let finalName = authorName;
    if (authorName === 'amir-alfayed') finalName = 'amir-al-fayed';

    const srcPath = path.join(artifactsDir, file);
    const destPath = path.join(destDir, `${finalName}.webp`);
    
    // Check if webp already exists and is not recent (we don't want to re-process older successful ones if we don't have to, but since we overwrite it's fine)
    try {
      console.log(`Converting ${file} -> ${finalName}.webp`);
      await sharp(srcPath).webp().toFile(destPath);
      
      // Now update the markdown file
      const mdPath = path.join(authorsDir, `${finalName}.md`);
      if (fs.existsSync(mdPath)) {
        let content = fs.readFileSync(mdPath, 'utf8');
        content = content.replace(/image:\s*["']?(Placeholder|.*placeholder\.webp)["']?/i, `image: "/images/authors/${finalName}.webp"`);
        fs.writeFileSync(mdPath, content, 'utf8');
        console.log(`Updated MD for ${finalName}`);
      }
      
      // Clean up the jpg so it's not processed next batch
      fs.unlinkSync(srcPath);
    } catch(err) {
      console.error(err);
    }
  }
}
processFiles();
