const fs = require('fs');
const path = require('path');
const https = require('https');

const datasetPath = path.join(__dirname, 'authors_dataset.json');
const authors = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

// If a slug is provided via CLI argument, use it; otherwise, pick a random author
const slugArg = process.argv[2];
let author;
if (slugArg) {
    author = authors.find(a => {
        const generatedSlug = a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return generatedSlug === slugArg;
    });
} else {
    author = authors[Math.floor(Math.random() * authors.length)];
}

if (!author) {
    console.error("Author not found.");
    process.exit(1);
}

const slug = author.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const category = author.categories && author.categories.length > 0 ? author.categories[0] : "Tech";

// Fetch text content from Pollinations AI
function fetchText(prompt) {
    return new Promise((resolve, reject) => {
        const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', (err) => reject(err));
    });
}

async function generatePost() {
    console.log(`Generating post for author: ${author.name} (Category: ${category})`);
    
    // 1. Generate topic and title
    const topicPrompt = `Generate a catchy, SEO-friendly title and a short description (2 sentences max) for a blog post about an advanced, trendy topic in ${category}. Output ONLY valid JSON: {"title": "The Title", "description": "The description", "tags": ["tag1", "tag2", "tag3"]}. Do not include markdown code block syntax around the JSON.`;
    
    let topicJson;
    try {
        let topicResponse = await fetchText(topicPrompt);
        topicResponse = topicResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        topicJson = JSON.parse(topicResponse);
        // Normalize keys just in case the AI capitalized them
        if (!topicJson.title && topicJson.Title) topicJson.title = topicJson.Title;
        if (!topicJson.description && topicJson.Description) topicJson.description = topicJson.Description;
        if (!topicJson.tags && topicJson.Tags) topicJson.tags = topicJson.Tags;
        
        if (!topicJson.title) throw new Error("Title is missing from AI response");
    } catch (e) {
        console.error("Failed to parse topic JSON", e);
        // Fallback
        topicJson = {
            title: `The Future of ${category}: Trends to Watch`,
            description: `Explore the latest advancements and future predictions in ${category}. Discover what industry leaders are focusing on today.`,
            tags: [category.toLowerCase(), "trends", "future"]
        };
    }
    
    // 2. Generate content
    const contentPrompt = `Write a comprehensive, professional, highly engaging SEO-optimized blog article about "${topicJson.title}". 
The article should be around 600 words. 
Include an Introduction, at least 3 main sections with H2 headings, and a Conclusion.
Write in Markdown format. Do not include the main H1 title, just start with the Introduction.`;
    
    let content;
    try {
        content = await fetchText(contentPrompt);
    } catch(e) {
        content = "Error generating content. Please try again.";
    }
    
    // 3. Format Date
    const today = new Date().toISOString();
    
    // 4. Determine Post Slug
    const postSlug = String(topicJson.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // 5. Image path (we will generate images later, for now we will set a placeholder or dynamic path)
    const imagePath = `/images/posts/${postSlug}.webp`;
    
    // 6. Write MDX file
    const mdxContent = `---
title: "${topicJson.title.replace(/"/g, '\\"')}"
description: "${topicJson.description.replace(/"/g, '\\"')}"
pubDate: "${today}"
authors: ["${slug}"]
categories: ["${category}"]
tags: ${JSON.stringify(topicJson.tags)}
draft: false
image: "${imagePath}"
---

${content}
`;
    
    const postFilePath = path.join(__dirname, '..', 'src', 'content', 'posts', `${postSlug}.mdx`);
    fs.writeFileSync(postFilePath, mdxContent);
    console.log(`Successfully generated post: ${postFilePath}`);
    
    // Also save the thumbnail prompt somewhere so we can generate it
    const thumbnailPrompt = `A high quality, photorealistic, cinematic conceptual image representing ${topicJson.title}. No text in the image. Highly detailed, professional lighting, realistic.`;
    const thumbnailJsonPath = path.join(__dirname, 'thumbnails_to_generate.json');
    let thumbnails = [];
    if (fs.existsSync(thumbnailJsonPath)) {
        thumbnails = JSON.parse(fs.readFileSync(thumbnailJsonPath, 'utf8'));
    }
    thumbnails.push({
        postSlug: postSlug,
        prompt: thumbnailPrompt
    });
    fs.writeFileSync(thumbnailJsonPath, JSON.stringify(thumbnails, null, 2));
    console.log(`Thumbnail prompt added to thumbnails_to_generate.json`);
}

generatePost().catch(console.error);
