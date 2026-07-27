const fs = require('fs');
const path = require('path');

const authorsDir = path.join(__dirname, 'src', 'content', 'authors');
const files = fs.readdirSync(authorsDir).filter(f => f.endsWith('.md'));

let results = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(authorsDir, file), 'utf-8');
  
  const titleMatch = content.match(/title:\s*"(.*?)"/);
  const title = titleMatch ? titleMatch[1] : 'Unknown';
  
  const imageMatch = content.match(/image:\s*"(.*?)"/);
  const image = imageMatch ? imageMatch[1] : 'Unknown';
  
  const locMatch = content.match(/journey in (.*?),/);
  const location = locMatch ? locMatch[1] : 'Unknown';
  
  const expMatch = content.match(/(?:Spent over |Over )(\d+) years/);
  const exp = expMatch ? expMatch[1] : 'Unknown';

  const ageMatch = content.match(/- \*\*Age\*\*: (\d+)/);
  const age = ageMatch ? ageMatch[1] : 'Unknown';
  
  const profMatch = content.match(/focused on (.*?)\./);
  const profession = profMatch ? profMatch[1] : 'Unknown';
  
  results.push({ file, title, image, location, exp, profession, age });
});

let mdTable = "# Güncellenmiş Son Yazar Listesi\n\n";
mdTable += "Aşağıda sisteme başarıyla kaydedilmiş 100 yazarın son hali yer almaktadır. Yazarların net yaşları (yaş skalasına uygun olarak) eklendi.\n\n";
mdTable += "| Dosya Adı | Yazar Adı | Meslek | Şehir | Yaş | Deneyim Yılı | Görsel |\n";
mdTable += "|---|---|---|---|---|---|---|\n";

results.forEach(r => {
  mdTable += `| ${r.file} | **${r.title}** | ${r.profession} | ${r.location} | **${r.age}** | ${r.exp} | ${r.image.includes('placeholder') ? 'Placeholder' : r.image} |\n`;
});

const artifactDir = 'C:\\Users\\MCKR-Asus\\.gemini\\antigravity\\brain\\1bd5908d-9e8a-4fd5-8480-789120cc0e78';
fs.writeFileSync(path.join(artifactDir, 'final_author_list.md'), mdTable);

console.log("Successfully generated final list artifact with ages.");
