const fs = require('fs');
const path = require('path');

const authorsDir = path.join(__dirname, 'src', 'content', 'authors');
const files = fs.readdirSync(authorsDir).filter(f => f.endsWith('.md'));

// Shuffle array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Generate age pool
let agePool = [];
for(let i=0; i<20; i++) agePool.push(Math.floor(Math.random() * (8 - 3 + 1)) + 3); // 3-8 years
for(let i=0; i<60; i++) agePool.push(Math.floor(Math.random() * (28 - 9 + 1)) + 9); // 9-28 years
for(let i=0; i<20; i++) agePool.push(Math.floor(Math.random() * (40 - 29 + 1)) + 29); // 29-40 years
shuffle(agePool);

files.forEach((file, index) => {
    let content = fs.readFileSync(path.join(authorsDir, file), 'utf-8');
    let newExp = agePool[index];
    
    // Replace the experience number
    content = content.replace(/(Spent over |Over )(\d+)( years)/, `$1${newExp}$3`);
    
    fs.writeFileSync(path.join(authorsDir, file), content);
});

console.log("Experience fixed for all authors.");
