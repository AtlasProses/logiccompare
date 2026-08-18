import fs from 'fs/promises';
import path from 'path';

async function main() {
    const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
    const files = await fs.readdir(postsDir);

    console.log(`\n======================================================`);
    console.log(`🔍 AUDITING POSTS FOR RAW PROMPT / BROKEN IMAGES`);
    console.log(`======================================================`);

    const badPosts = [];

    for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const filePath = path.join(postsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');

        // Check frontmatter image
        const imgMatch = content.match(/^image:\s*["']?(.*?)["']?$/m);
        const imgVal = imgMatch ? imgMatch[1].trim() : '';

        // Check inline images
        const inlineImgMatches = [...content.matchAll(/!\[(.*?)\]\((.*?)\)/g)];

        const isBadCover = !imgVal.startsWith('/images/posts/') && !imgVal.startsWith('http');
        const hasBadInline = inlineImgMatches.some(m => !m[2].startsWith('/images/posts/') && !m[2].startsWith('http'));

        if (isBadCover || hasBadInline) {
            badPosts.push({
                file,
                imgVal,
                badInlines: inlineImgMatches.filter(m => !m[2].startsWith('/images/posts/') && !m[2].startsWith('http')).map(m => m[0])
            });
        }
    }

    console.log(`Total Posts with Raw / Broken Image Tags: ${badPosts.length}`);
    badPosts.forEach((p, idx) => {
        console.log(`\n[${idx + 1}] File: ${p.file}`);
        console.log(`    Cover: "${p.imgVal}"`);
        console.log(`    Bad Inlines:`, p.badInlines);
    });
}

main();
