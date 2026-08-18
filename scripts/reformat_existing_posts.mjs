import fs from 'fs/promises';
import path from 'path';
import { sanitizeFrontmatter } from './sanitize-frontmatter.mjs';

async function main() {
    const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
    const files = await fs.readdir(postsDir);

    console.log(`\n======================================================`);
    console.log(`🔄 REFORMATTING EXISTING 30 TECHNOLOGY POSTS WITH HUMAN TITLES...`);
    console.log(`======================================================`);

    for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const filePath = path.join(postsDir, file);
        const originalContent = await fs.readFile(filePath, 'utf-8');
        const sanitized = sanitizeFrontmatter(originalContent);
        await fs.writeFile(filePath, sanitized, 'utf-8');

        // Extract new title
        const titleMatch = sanitized.match(/^title:\s*["'](.*?)["']/m);
        const newTitle = titleMatch ? titleMatch[1] : 'Unknown';
        console.log(`[+] Re-formatted: ${file}`);
        console.log(`    ↳ New Title (${newTitle.length} chars): "${newTitle}"`);
    }

    console.log(`\n======================================================`);
    console.log(`✅ ALL POSTS REFORMATTED!`);
    console.log(`======================================================\n`);
}

main();
