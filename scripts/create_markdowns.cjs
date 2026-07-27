const fs = require('fs');
const path = require('path');

const datasetPath = path.join(__dirname, 'authors_dataset.json');
const authors = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

const authorsDir = path.join(__dirname, '..', 'src', 'content', 'authors');
if (!fs.existsSync(authorsDir)) {
    fs.mkdirSync(authorsDir, { recursive: true });
}

// Copy the 4 generated sample images to public/images/authors
const publicImgDir = path.join(__dirname, '..', 'public', 'images', 'authors');
if (!fs.existsSync(publicImgDir)) {
    fs.mkdirSync(publicImgDir, { recursive: true });
}

const artifactDir = 'C:\\Users\\MCKR-Asus\\.gemini\\antigravity\\brain\\9b0f7937-9ee1-43c6-89c4-bf14c7447a42';
const samples = [
    'sample_dynamic_1_1784987681479.jpg',
    'sample_dynamic_2_1784987691572.jpg',
    'sample_dynamic_3_1784987700420.jpg',
    'sample_dynamic_4_1784987709160.jpg'
];

// Copy them over
samples.forEach((sample, i) => {
    const src = path.join(artifactDir, sample);
    if(fs.existsSync(src)) {
        const ext = path.extname(sample);
        // Map first 4 authors
        if (authors[i]) {
            const authorSlug = authors[i].name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const dest = path.join(publicImgDir, `${authorSlug}${ext}`);
            fs.copyFileSync(src, dest);
            console.log(`Copied sample ${sample} to ${authorSlug}${ext}`);
        }
    }
});

// Generate Markdown files
authors.forEach((author, i) => {
    const slug = author.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Assign the actual image path if we have it, else a placeholder
    let imagePath = '';
    if (i < 4) {
        imagePath = `/images/authors/${slug}.webp`;
    } else {
        imagePath = `/images/authors/${slug}.webp`; // Placeholder for now, we will generate them later
    }

    const mdContent = `---
title: "${author.name}"
image: "${imagePath}"
description: "${author.tagline}"
categories: ["${author.category}"]
---

${author.bio}

- **Specialties**: ${author.specialties}
- **Education**: ${author.education}
- **Experience**: ${author.workExperience}
- **Languages**: ${author.languages}
- **Hobbies**: ${author.hobbies}
`;

    const filepath = path.join(authorsDir, `${slug}.md`);
    fs.writeFileSync(filepath, mdContent, 'utf8');
});

console.log(`Created ${authors.length} markdown files in src/content/authors/`);
