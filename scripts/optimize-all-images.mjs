import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'posts');

async function optimizeAllImages() {
    const files = await fs.readdir(IMAGES_DIR);
    console.log(`\n===============================================================`);
    console.log(`Auditing and Optimizing ${files.length} images for strict <= 150KB limit...`);
    console.log(`===============================================================\n`);

    let optimizedCount = 0;
    let totalSavedBytes = 0;

    for (const file of files) {
        if (!file.endsWith('.webp') && !file.endsWith('.jpg') && !file.endsWith('.png')) continue;
        const filePath = path.join(IMAGES_DIR, file);
        const stat = await fs.stat(filePath);
        const sizeKB = stat.size / 1024;

        // If image is over 150KB or needs progressive compression
        if (sizeKB > 150) {
            const rawBuffer = await fs.readFile(filePath);
            let quality = 75;
            let outBuffer = await sharp(rawBuffer)
                .resize(1200, 630, { fit: 'cover' })
                .webp({ quality, effort: 6 })
                .toBuffer();

            while (outBuffer.length > 150 * 1024 && quality > 20) {
                quality -= 6;
                outBuffer = await sharp(rawBuffer)
                    .resize(1200, 630, { fit: 'cover' })
                    .webp({ quality, effort: 6 })
                    .toBuffer();
            }

            await fs.writeFile(filePath, outBuffer);
            const newSizeKB = outBuffer.length / 1024;
            totalSavedBytes += (stat.size - outBuffer.length);
            optimizedCount++;
            console.log(`[OPTIMIZED] ${file}: ${sizeKB.toFixed(1)} KB -> ${newSizeKB.toFixed(1)} KB (Quality: ${quality})`);
        }
    }

    console.log(`\n===============================================================`);
    console.log(`✅ Optimization complete! ${optimizedCount} images compressed.`);
    console.log(`Saved: ${(totalSavedBytes / 1024).toFixed(1)} KB total.`);
    console.log(`===============================================================\n`);
}

optimizeAllImages();
