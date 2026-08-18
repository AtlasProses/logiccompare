import fs from 'fs/promises';
import path from 'path';

async function main() {
    const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'posts');

    const files = await fs.readdir(postsDir);
    let keptTech = 0;
    let deletedNonTech = 0;
    let deletedImages = 0;

    console.log(`\n======================================================`);
    console.log(`🧹 PURGING NON-TECHNOLOGY POSTS & ORPHAN IMAGES...`);
    console.log(`======================================================`);

    for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const filePath = path.join(postsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');

        // Check category in frontmatter
        const catMatch = content.match(/categories:\s*\[(.*?)\]/);
        const rawCat = catMatch ? catMatch[1].replace(/['"]/g, '').trim() : '';

        const isTech = rawCat.toLowerCase().includes('technology');

        if (isTech) {
            keptTech++;
        } else {
            console.log(`[-] Deleting non-tech post [${rawCat}]: ${file}`);
            await fs.unlink(filePath);
            deletedNonTech++;

            // Check associated images
            const imgMatch = content.match(/image:\s*["']\/images\/posts\/(.*?)["']/);
            if (imgMatch) {
                const imgName = imgMatch[1];
                const imgPath = path.join(imagesDir, imgName);
                try {
                    await fs.unlink(imgPath);
                    console.log(`    [-] Deleted cover image: ${imgName}`);
                    deletedImages++;
                } catch (e) {
                    // Image might not exist or already cleaned
                }
            }
        }
    }

    console.log(`\n======================================================`);
    console.log(`✅ CLEANUP SUMMARY:`);
    console.log(`- Kept Pure Technology Posts: ${keptTech}`);
    console.log(`- Deleted Non-Tech Posts: ${deletedNonTech}`);
    console.log(`- Deleted Associated Images: ${deletedImages}`);
    console.log(`======================================================\n`);
}

main();
