import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

async function main() {
    const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
    const files = await fs.readdir(postsDir);

    console.log(`\n======================================================`);
    console.log(`🔍 AUDITING ALL POSTS FOR CATEGORIES & MISSING IMAGES...`);
    console.log(`======================================================`);

    const missingImages = [];
    const existingPosts = [];

    for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const filePath = path.join(postsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');

        // Extract image
        const imgMatch = content.match(/^image:\s*["']?(.*?)["']?$/m);
        const imgPath = imgMatch ? imgMatch[1].trim() : null;

        // Extract category
        const catMatch = content.match(/^categories:\s*\[(.*?)\]/m);
        const cat = catMatch ? catMatch[1].replace(/['"]/g, '').trim() : 'Unknown';

        // Check if image exists locally
        let imageExists = false;
        if (imgPath) {
            if (imgPath.startsWith('/')) {
                const fullImgPath = path.join(process.cwd(), 'public', imgPath.substring(1));
                imageExists = existsSync(fullImgPath);
            } else if (imgPath.startsWith('http')) {
                imageExists = true;
            } else if (imgPath.startsWith('PEXELS_IMAGE:')) {
                imageExists = false; // needs processing
            }
        }

        existingPosts.push({ file, cat, imgPath, imageExists });

        if (!imageExists) {
            missingImages.push({ file, cat, imgPath });
        }
    }

    console.log(`- Total Posts Found: ${existingPosts.length}`);
    console.log(`- Total Missing/Broken Images: ${missingImages.length}`);
    
    console.log(`\nBroken Images Breakdown:`);
    missingImages.forEach((m, idx) => {
        console.log(`[${idx + 1}] ${m.file} (${m.cat}) -> Image: "${m.imgPath}"`);
    });
}

main();
