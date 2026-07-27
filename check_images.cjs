const fs = require('fs');
const path = require('path');

const authorsDir = path.join(__dirname, 'src', 'content', 'authors');
const imagesDir = path.join(__dirname, 'public', 'images', 'authors');

const files = fs.readdirSync(authorsDir).filter(f => f.endsWith('.md'));

let list = [];
for (const file of files) {
  const content = fs.readFileSync(path.join(authorsDir, file), 'utf8');
  const imageMatch = content.match(/image:\s*["']?([^"'\n]+)["']?/);
  const image = imageMatch ? imageMatch[1] : '';
  
  if (image && image !== '/images/authors/placeholder.webp' && image !== 'Placeholder') {
    const ageMatch = content.match(/\*\*Age\*\*:\s*(\d+)/);
    const age = ageMatch ? ageMatch[1] : 'Unknown';
    const titleMatch = content.match(/title:\s*["']?([^"'\n]+)["']?/);
    const title = titleMatch ? titleMatch[1] : '';
    
    list.push({ file, title, age, image });
  }
}

console.log(JSON.stringify(list, null, 2));
