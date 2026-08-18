import fs from 'fs/promises';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

// Load .env manually if exists
let PEXELS_API_KEY = 'K1tKSDUYtWkeEpKMsYqZ8mr9fvPZ9LpCczx5sHxHevnt5W44NYLEj091';
const envPath = path.join(process.cwd(), '.env');
if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    const match = envContent.match(/^PEXELS_API_KEY=(.*)$/m);
    if (match) PEXELS_API_KEY = match[1].trim();
}

const POSTS_DIR = path.join(process.cwd(), 'src', 'content', 'posts');
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'posts');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Category Fallbacks
const CATEGORY_FALLBACKS = {
    'Technology': 'datacenter server cloud artificial intelligence code',
    'Finance': 'stock market trading exchange cryptocurrency graph',
    'Gaming': 'video game esports hardware gaming setup',
    'Sports': 'formula 1 race track athlete football soccer'
};

async function searchPexels(query) {
    if (!query) return null;
    const cleanQuery = query.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(cleanQuery)}&per_page=15`;
    try {
        const res = await fetch(url, { headers: { 'Authorization': PEXELS_API_KEY } });
        if (!res.ok) {
            console.warn(`[Pexels] HTTP ${res.status} for query "${cleanQuery}"`);
            return null;
        }
        const data = await res.json();
        if (data.photos && data.photos.length > 0) {
            const photo = data.photos[Math.floor(Math.random() * data.photos.length)];
            return photo.src.large2x || photo.src.large || photo.src.original;
        }
    } catch (e) {
        console.warn(`[Pexels Error] ${e.message}`);
    }
    return null;
}

async function downloadAndOptimize(imageUrl, destPath) {
    try {
        const res = await fetch(imageUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const rawBuffer = Buffer.from(await res.arrayBuffer());

        let quality = 80;
        let outBuffer = await sharp(rawBuffer)
            .resize(1200, 630, { fit: 'cover' })
            .webp({ quality, effort: 6 })
            .toBuffer();

        while (outBuffer.length > 150 * 1024 && quality > 40) {
            quality -= 6;
            outBuffer = await sharp(rawBuffer)
                .resize(1200, 630, { fit: 'cover' })
                .webp({ quality, effort: 6 })
                .toBuffer();
        }

        await fs.writeFile(destPath, outBuffer);
        return true;
    } catch (e) {
        console.warn(`[Sharp/Download Error] ${e.message}`);
        return false;
    }
}

async function main() {
    console.log(`\n======================================================`);
    console.log(`🖼️ FIXING ALL POST IMAGES & GENERATING WEBP ASSETS`);
    console.log(`======================================================`);

    if (!existsSync(IMAGES_DIR)) await fs.mkdir(IMAGES_DIR, { recursive: true });

    const files = await fs.readdir(POSTS_DIR);
    let fixedPostsCount = 0;

    for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const filePath = path.join(POSTS_DIR, file);
        const slug = file.replace(/\.md$/, '');
        let content = await fs.readFile(filePath, 'utf-8');

        const catMatch = content.match(/^categories:\s*\[(.*?)\]/m);
        const cat = catMatch ? catMatch[1].replace(/['"]/g, '').trim() : 'Technology';

        const titleMatch = content.match(/^title:\s*["']?(.*?)["']?$/m);
        const title = titleMatch ? titleMatch[1] : slug;

        // 1. Check Frontmatter Image
        const imgMatch = content.match(/^image:\s*["']?(.*?)["']?$/m);
        const currentImg = imgMatch ? imgMatch[1].trim() : '';

        const coverFilename = `${slug}-cover.webp`;
        const coverLocalPath = path.join(IMAGES_DIR, coverFilename);
        const coverWebPath = `/images/posts/${coverFilename}`;

        let modified = false;

        const isRawStringCover = !currentImg.startsWith('/images/posts/') && !currentImg.startsWith('http');
        const isMissingPhysicalCover = currentImg.startsWith('/images/posts/') && !existsSync(path.join(process.cwd(), 'public', currentImg.substring(1)));

        if (isRawStringCover || isMissingPhysicalCover) {
            console.log(`\n[+] Fixing Cover for: ${file}`);
            const query = isRawStringCover && currentImg.length > 5 ? currentImg : `${title} ${CATEGORY_FALLBACKS[cat] || 'technology'}`;
            console.log(`    Searching Pexels for: "${query}"`);

            let photoUrl = await searchPexels(query);
            if (!photoUrl) {
                photoUrl = await searchPexels(CATEGORY_FALLBACKS[cat] || 'technology datacenter');
            }

            if (photoUrl) {
                const ok = await downloadAndOptimize(photoUrl, coverLocalPath);
                if (ok) {
                    content = content.replace(/^image:\s*["']?.*?["']?$/m, `image: "${coverWebPath}"`);
                    modified = true;
                    console.log(`    ✅ Saved & Converted WebP: ${coverFilename}`);
                }
            }
            await sleep(1000);
        }

        // 2. Check and Fix Inline Markdown Images
        const inlineMatches = [...content.matchAll(/!\[(.*?)\]\((.*?)\)/g)];
        let inlineIdx = 1;

        for (const m of inlineMatches) {
            const fullTag = m[0];
            const alt = m[1];
            const urlOrQuery = m[2].trim();

            const isBadInline = !urlOrQuery.startsWith('/images/posts/') && !urlOrQuery.startsWith('http');
            const isMissingInline = urlOrQuery.startsWith('/images/posts/') && !existsSync(path.join(process.cwd(), 'public', urlOrQuery.substring(1)));

            if (isBadInline || isMissingInline) {
                console.log(`    [+] Found Bad Inline Image: "${fullTag}"`);
                const inlineFilename = `${slug}-inline-${inlineIdx}.webp`;
                const inlineLocalPath = path.join(IMAGES_DIR, inlineFilename);
                const inlineWebPath = `/images/posts/${inlineFilename}`;

                const inlineQuery = urlOrQuery.length > 5 && !urlOrQuery.includes('/') ? urlOrQuery : `${title} ${alt} ${CATEGORY_FALLBACKS[cat] || ''}`;
                const photoUrl = await searchPexels(inlineQuery);

                if (photoUrl) {
                    const ok = await downloadAndOptimize(photoUrl, inlineLocalPath);
                    if (ok) {
                        content = content.replace(fullTag, `![${alt || 'Analysis'}](${inlineWebPath})`);
                        modified = true;
                        inlineIdx++;
                        console.log(`    ✅ Converted Inline WebP: ${inlineFilename}`);
                    } else {
                        // Strip broken tag
                        content = content.replace(fullTag, '');
                        modified = true;
                    }
                } else {
                    // If no photo found, remove the broken tag so no broken image appears
                    content = content.replace(fullTag, '');
                    modified = true;
                    console.log(`    🧹 Removed broken inline tag`);
                }
                await sleep(1000);
            }
        }

        // 3. Final cleanup for any leftover PEXELS_IMAGE or raw syntax
        if (content.includes('PEXELS_IMAGE:') || content.includes('![(Context)]') || content.includes('![Context](')) {
            content = content.replace(/!\[(.*?)\]\(formula one.*?\)/gi, '');
            content = content.replace(/!\[(.*?)\]\(PEXELS_IMAGE:.*?\)/gi, '');
            modified = true;
        }

        if (modified) {
            await fs.writeFile(filePath, content, 'utf-8');
            fixedPostsCount++;
        }
    }

    console.log(`\n======================================================`);
    console.log(`🎉 IMAGE AUDIT & FIX COMPLETE!`);
    console.log(`Total Posts Fixed with Real WebP Images: ${fixedPostsCount}`);
    console.log(`======================================================\n`);
}

main();
