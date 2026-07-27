const fs = require('fs');
const path = require('path');

const datasetPath = path.join(__dirname, 'authors_dataset.json');
const outputPath = 'C:\\Users\\MCKR-Asus\\.gemini\\antigravity\\brain\\9b0f7937-9ee1-43c6-89c4-bf14c7447a42\\image_preview_report.md';

const authors = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

let markdown = `# Author Image Preview Report\n\n`;
markdown += `Lütfen aşağıdaki tablodaki yazarların resim eşleşmelerini kontrol edin. Resimler Pollinations.ai tarafından tamamen ücretsiz ve anında üretildiği için ilk yüklemede 3-5 saniye sürebilir.\n\n`;
markdown += `| ID | Name & Profile | Generated Background / Prompt | Image Preview |\n`;
markdown += `|---|---|---|---|\n`;

authors.forEach(author => {
    // Generate context-aware prompt
    const prompt = `A highly realistic professional portrait of a ${author.age} year old ${author.gender} from ${author.country}. They are an expert in ${author.subCategory}. Background features: ${author.hobbies}. High quality, detailed facial features, cinematic lighting, diverse ethnicity.`;
    
    // Pollinations URL
    const encodedPrompt = encodeURIComponent(prompt);
    // Add seed for consistency so it doesn't change every time we load the page
    const seed = author.id * 1024;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=300&height=300&nologo=true&seed=${seed}`;

    markdown += `| ${author.id} | **${author.name}**<br>*${author.subCategory}*<br>${author.country} | *${author.hobbies}* | <img src="${imageUrl}" width="150" height="150" alt="${author.name}" /> |\n`;
});

fs.writeFileSync(outputPath, markdown, 'utf-8');
console.log(`Preview report generated at ${outputPath}`);
