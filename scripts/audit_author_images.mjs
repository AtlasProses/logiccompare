import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

async function main() {
    const authorsDir = path.join(process.cwd(), 'src', 'content', 'authors');
    const files = await fs.readdir(authorsDir);

    console.log(`\n======================================================`);
    console.log(`🔍 AUDITING ALL AUTHORS FOR MISSING IMAGES...`);
    console.log(`======================================================`);

    const missingAuthorImages = [];

    for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const filePath = path.join(authorsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');

        // Extract image
        const imgMatch = content.match(/^image:\s*["']?(.*?)["']?$/m);
        const imgPath = imgMatch ? imgMatch[1].trim() : null;

        // Extract category
        const catMatch = content.match(/^categories:\s*\[(.*?)\]/m);
        const cat = catMatch ? catMatch[1].replace(/['"]/g, '').trim() : 'Unknown';

        let imageExists = false;
        if (imgPath) {
            if (imgPath.startsWith('/')) {
                const fullImgPath = path.join(process.cwd(), 'public', imgPath.substring(1));
                imageExists = existsSync(fullImgPath);
            } else if (imgPath.startsWith('http')) {
                imageExists = true;
            }
        }

        if (!imageExists) {
            missingAuthorImages.push({ file, cat, imgPath });
        }
    }

    console.log(`- Total Authors Found: ${files.length}`);
    console.log(`- Total Missing Author Images: ${missingAuthorImages.length}`);
    
    if (missingAuthorImages.length > 0) {
        console.log(`\nMissing Author Images (First 15):`);
        missingAuthorImages.slice(0, 15).forEach((m, idx) => {
            console.log(`[${idx + 1}] ${m.file} (${m.cat}) -> Image: "${m.imgPath}"`);
        });
    }
}

main();
