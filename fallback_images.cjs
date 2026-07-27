const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const authorsDir = path.join(__dirname, 'src', 'content', 'authors');
const destDir = path.join(__dirname, 'public', 'images', 'authors');

const files = fs.readdirSync(authorsDir).filter(f => f.endsWith('.md'));

const femaleNames = ['lisa', 'margaret', 'nancy', 'sandra', 'sarah', 'susan'];

let menCounter = 10;
let womenCounter = 10;

async function processFallback() {
  for (const file of files) {
    const mdPath = path.join(authorsDir, file);
    let content = fs.readFileSync(mdPath, 'utf8');
    
    // Check if image is Placeholder
    const imageMatch = content.match(/image:\s*["']?(Placeholder|.*placeholder\.webp)["']?/i);
    
    if (imageMatch) {
      const baseName = file.replace('.md', '');
      const firstName = baseName.split('-')[0];
      
      const isFemale = femaleNames.includes(firstName.toLowerCase());
      
      let imgUrl = '';
      if (isFemale) {
        imgUrl = `https://randomuser.me/api/portraits/women/${womenCounter++}.jpg`;
      } else {
        imgUrl = `https://randomuser.me/api/portraits/men/${menCounter++}.jpg`;
      }
      
      const destPath = path.join(destDir, `${baseName}.webp`);
      
      console.log(`Fetching ${imgUrl} for ${baseName}`);
      
      await new Promise((resolve, reject) => {
        https.get(imgUrl, (res) => {
          if (res.statusCode !== 200) {
             console.error(`Failed to fetch ${imgUrl}`);
             resolve();
             return;
          }
          
          const chunks = [];
          res.on('data', chunk => chunks.push(chunk));
          res.on('end', async () => {
             const buffer = Buffer.concat(chunks);
             try {
                await sharp(buffer).webp().toFile(destPath);
                
                content = content.replace(/image:\s*["']?(Placeholder|.*placeholder\.webp)["']?/i, `image: "/images/authors/${baseName}.webp"`);
                fs.writeFileSync(mdPath, content, 'utf8');
                console.log(`Updated MD for ${baseName}`);
                resolve();
             } catch(e) {
                console.error(e);
                resolve();
             }
          });
        }).on('error', reject);
      });
    }
  }
}

processFallback().then(() => console.log('Done fallback')).catch(console.error);
