const fs = require('fs');
const path = require('path');

const authorsDir = path.join(__dirname, 'src', 'content', 'authors');
const authors = [
  'lisa-rivera', 'margaret-jackson', 'mark-martin', 'matthew-lewis', 'michael-morris',
  'nancy-hall', 'nathan-taylor', 'patrick-carter', 'paul-king', 'peter-cruz',
  'raymond-garcia', 'richard-wright', 'robert-morgan', 'ronald-roberts', 'ryan-turner',
  'samuel-rodriguez', 'sandra-green', 'sarah-peterson', 'scott-cook', 'stephen-white',
  'steven-miller', 'susan-reed', 'thomas-lee', 'timothy-nguyen', 'tyler-mitchell',
  'walter-wilson', 'william-howard', 'zachary-flores'
];

const list = [];
for (const author of authors) {
  const mdPath = path.join(authorsDir, `${author}.md`);
  if (!fs.existsSync(mdPath)) continue;
  
  const content = fs.readFileSync(mdPath, 'utf8');
  
  const ageMatch = content.match(/\*\*Age\*\*:\s*(\d+)/);
  const age = ageMatch ? ageMatch[1] : 'Unknown';
  
  const titleMatch = content.match(/title:\s*["']?([^"'\n]+)["']?/);
  const title = titleMatch ? titleMatch[1] : author;
  
  const catMatch = content.match(/categories:\s*\[([^\]]+)\]/);
  const category = catMatch ? catMatch[1].replace(/["']/g, '').trim() : '';

  list.push({ author, title, age, category });
}

console.log(JSON.stringify(list, null, 2));
