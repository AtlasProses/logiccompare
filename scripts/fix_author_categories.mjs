import fs from 'fs/promises';
import path from 'path';

async function main() {
    const authorsDir = path.join(process.cwd(), 'src', 'content', 'authors');
    const files = await fs.readdir(authorsDir);
    let updated = 0;

    for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const filePath = path.join(authorsDir, file);
        let content = await fs.readFile(filePath, 'utf-8');

        // If categories has Tech, replace with Technology
        if (/categories:\s*\[\s*["']Tech["']\s*\]/i.test(content)) {
            content = content.replace(/categories:\s*\[\s*["']Tech["']\s*\]/i, 'categories: ["Technology"]');
            await fs.writeFile(filePath, content, 'utf-8');
            updated++;
            console.log(`[+] Fixed Author [Tech -> Technology]: ${file}`);
        }
    }

    console.log(`\n======================================================`);
    console.log(`✅ AUTHORS CATEGORY UNIFICATION COMPLETE!`);
    console.log(`Total Authors Converted to 'Technology': ${updated}`);
    console.log(`======================================================\n`);
}

main();
