import fs from 'fs/promises';
import path from 'path';

async function main() {
    const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
    const files = await fs.readdir(postsDir);
    let unifiedCount = 0;

    for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const filePath = path.join(postsDir, file);
        let content = await fs.readFile(filePath, 'utf-8');

        // Check if categories contains 'Tech' or multiple categories
        if (/categories:\s*\[\s*["']Tech["']\s*\]/i.test(content)) {
            content = content.replace(/categories:\s*\[\s*["']Tech["']\s*\]/i, 'categories: ["Technology"]');
            await fs.writeFile(filePath, content, 'utf-8');
            unifiedCount++;
            console.log(`[+] Unified [Tech -> Technology]: ${file}`);
        }
    }

    console.log(`\n======================================================`);
    console.log(`✅ SEO CATEGORY UNIFICATION COMPLETE!`);
    console.log(`Total Posts Converted to 'Technology': ${unifiedCount}`);
    console.log(`======================================================\n`);
}

main();
