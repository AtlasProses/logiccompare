const fs = require('fs');
const path = require('path');

const authorsDir = path.join(__dirname, 'src', 'content', 'authors');
const files = fs.readdirSync(authorsDir).filter(f => f.endsWith('.md'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(authorsDir, file), 'utf-8');
    
    // Yazarın deneyim yılını bul
    const expMatch = content.match(/(?:Spent over |Over )(\d+) years/);
    if(expMatch) {
        const exp = parseInt(expMatch[1]);
        // Yaş = Deneyim yılı + Ortalama işe başlama yaşı (22)
        const age = exp + 22;
        
        // Eğer dosyada daha önce Age satırı yoksa ekle
        if(!content.includes('- **Age**:')) {
            content = content.replace('- **Education**:', `- **Age**: ${age}\n- **Education**:`);
        } else {
             // Eğer varsa yaş numarasını güncelle
             content = content.replace(/- \*\*Age\*\*: \d+/, `- **Age**: ${age}`);
        }
        
        fs.writeFileSync(path.join(authorsDir, file), content);
    }
});

console.log("Ages added to all authors.");
