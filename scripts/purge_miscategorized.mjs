import fs from 'fs/promises';
import path from 'path';

async function main() {
    const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
    const files = await fs.readdir(postsDir);

    for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const filePath = path.join(postsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');

        // Check if content talks about sports or athletes
        const isSporty = /\b(800m|FedEx|Athletics Championships|European Athletics|Scottie Scheffler|Keely Hodgkinson|Formula 1|Premier League|football|soccer|golf)\b/i.test(content) && !/\b(Kubernetes|Docker|compiler|Postgres|LLM|AI|software)\b/i.test(content);

        if (isSporty || file.includes('keely-hodgk')) {
            console.log(`[-] Purging miscategorized sports post: ${file}`);
            await fs.unlink(filePath);
        }
    }
}

main();
