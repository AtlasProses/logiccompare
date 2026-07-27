const fs = require('fs');
const path = require('path');

const authorsDir = path.join(__dirname, 'src', 'content', 'authors');
const files = fs.readdirSync(authorsDir).filter(f => f.endsWith('.md'));

let list = [];
for (const file of files) {
  const content = fs.readFileSync(path.join(authorsDir, file), 'utf8');
  
  // Check if image is Placeholder
  const imageMatch = content.match(/image:\s*["']?(Placeholder|.*placeholder\.webp)["']?/i);
  
  if (imageMatch) {
    const ageMatch = content.match(/\*\*Age\*\*:\s*(\d+)/);
    const age = ageMatch ? ageMatch[1] : 'Unknown';
    
    const titleMatch = content.match(/title:\s*["']?([^"'\n]+)["']?/);
    const title = titleMatch ? titleMatch[1] : '';
    
    const catMatch = content.match(/categories:\s*\[([^\]]+)\]/);
    const category = catMatch ? catMatch[1].replace(/["']/g, '').trim() : '';
    
    // Attempt to extract city from body text loosely if present, or just use general context
    let city = 'their city';
    const cityRegex = /(?:in|from|at)\s+([A-Z][a-zA-Z\s]+)(?:,|.)/;
    const cityMatch = content.match(cityRegex);
    // Actually the user provided cities in the previous table, maybe we can just find them in the text
    
    list.push({ file, title, age, category });
  }
}

console.log(JSON.stringify(list, null, 2));
