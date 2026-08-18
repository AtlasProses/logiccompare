import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

const POSTS_DIR = path.join(process.cwd(), 'src', 'content', 'posts');
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'images', 'posts');

async function downloadAndConvertImage(searchQuery, savePath) {
    if (existsSync(savePath)) return true;
    const pexelsKey = process.env.PEXELS_API_KEY;
    let imageUrl = null;

    if (pexelsKey) {
        try {
            const cleanQuery = searchQuery.replace(/[\[\]"']/g, '').trim();
            const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(cleanQuery)}&per_page=1`, {
                headers: { Authorization: pexelsKey }
            });
            const data = await res.json();
            if (data.photos && data.photos.length > 0) imageUrl = data.photos[0].src.large2x || data.photos[0].src.large;
        } catch (e) {}
    }

    if (!imageUrl) {
        imageUrl = `https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80`;
    }

    try {
        const imgRes = await fetch(imageUrl);
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        await sharp(buffer).resize(1200, 630, { fit: 'cover' }).webp({ quality: 80 }).toFile(savePath);
        return true;
    } catch (e) {
        console.warn(`Fallback image creation for ${savePath}: ${e.message}`);
        // Create an SVG-based sharp webp fallback
        const svgBuffer = Buffer.from(`
            <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#1a1a2e"/>
                <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">LogicCompare Analysis</text>
            </svg>
        `);
        await sharp(svgBuffer).webp({ quality: 80 }).toFile(savePath);
        return true;
    }
}

async function fixAllPostImages() {
    await fs.mkdir(PUBLIC_DIR, { recursive: true });
    const files = await fs.readdir(POSTS_DIR);

    for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const filePath = path.join(POSTS_DIR, file);
        let content = await fs.readFile(filePath, 'utf-8');
        const postSlug = file.replace(/\.md$/, '').substring(0, 70);

        let changed = false;

        // 1. Fix frontmatter image: "PEXELS_IMAGE: ..."
        const fmMatch = content.match(/^image:\s*["']?PEXELS_IMAGE:\s*\[?(.*?)\]?["']?$/m);
        if (fmMatch) {
            const query = fmMatch[1] || postSlug;
            const coverFilename = `${postSlug}-cover.webp`;
            const coverLocalPath = path.join(PUBLIC_DIR, coverFilename);
            const coverWebPath = `/images/posts/${coverFilename}`;
            await downloadAndConvertImage(query, coverLocalPath);
            content = content.replace(fmMatch[0], `image: "${coverWebPath}"`);
            changed = true;
        }

        // 2. Fix inline images ![Alt](PEXELS_IMAGE: ...)
        const inlineMatches = [...content.matchAll(/!\[(.*?)\]\((?:PEXELS_IMAGE:\s*\[?(.*?)\]?)\)/g)];
        let count = 1;
        for (const m of inlineMatches) {
            const fullMatch = m[0];
            const altText = m[1];
            const query = m[2] || `${postSlug}-inline-${count}`;
            const inlineFilename = `${postSlug}-inline-${count}.webp`;
            const inlineLocalPath = path.join(PUBLIC_DIR, inlineFilename);
            const inlineWebPath = `/images/posts/${inlineFilename}`;
            await downloadAndConvertImage(query, inlineLocalPath);
            content = content.replace(fullMatch, `![${altText}](${inlineWebPath})`);
            changed = true;
            count++;
        }

        // 3. Safety Fallback: Any remaining PEXELS_IMAGE in frontmatter
        if (content.includes('PEXELS_IMAGE:')) {
            content = content.replace(/image:\s*["']?[^"'\n]*PEXELS_IMAGE[^"'\n]*["']?/g, `image: "/images/LogicCompare-Logo.webp"`);
            content = content.replace(/!\[(.*?)\]\([^)]*PEXELS_IMAGE[^)]*\)/g, '');
            changed = true;
        }

        if (changed) {
            await fs.writeFile(filePath, content, 'utf-8');
            console.log(`[FIXED IMAGES] ${file}`);
        }
    }
    console.log("All post images processed successfully.");
}

fixAllPostImages();
