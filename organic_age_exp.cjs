const fs = require('fs');
const path = require('path');

const authorsDir = path.join(__dirname, 'src', 'content', 'authors');
const files = fs.readdirSync(authorsDir).filter(f => f.endsWith('.md'));

// Rastgele sayı üreteci
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Yaş havuzu oluştur (20% genç, 60% orta, 20% ileri)
let ages = [];
for(let i=0; i<20; i++) ages.push(randomInt(25, 30));
for(let i=0; i<60; i++) ages.push(randomInt(31, 49));
for(let i=0; i<20; i++) ages.push(randomInt(50, 60));

// Havuzu karıştır
for (let i = ages.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ages[i], ages[j]] = [ages[j], ages[i]];
}

files.forEach((file, index) => {
    let content = fs.readFileSync(path.join(authorsDir, file), 'utf-8');
    
    let age = ages[index];
    // İşe başlama yaşını daha organik yapmak için (20 ile 35 yaş arası başlama veya kariyer değiştirme)
    let maxExp = age - 20; // 20 yaşından önce profesyonel kariyere başlamış varsaymayalım
    let minExp = 1;        // Çok yeni kariyer değiştirmiş olabilir
    let exp = randomInt(Math.max(1, Math.floor(maxExp * 0.3)), maxExp); // Kariyerin 1/3'ünden azı olmasın, gerçekçi olsun ama yine de random olsun.
    
    // Age'i güncelle (zaten add_age.cjs ile eklemiştik, onu değiştiriyoruz)
    content = content.replace(/- \*\*Age\*\*: \d+/, `- **Age**: ${age}`);
    
    // Experience'i güncelle
    content = content.replace(/(Spent over |Over )(\d+)( years)/, `$1${exp}$3`);
    
    fs.writeFileSync(path.join(authorsDir, file), content);
});

console.log("Organic ages and experiences applied.");
