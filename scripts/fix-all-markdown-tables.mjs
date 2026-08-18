import fs from 'fs/promises';
import path from 'path';

const POSTS_DIR = path.join(process.cwd(), 'src', 'content', 'posts');
const DAILY_DIR = path.join(process.cwd(), 'daily_output');

export function cleanMarkdownTables(content) {
    let modified = content;

    // Pattern 1: ```markdown\n| ... |\n``` or ```\n| ... |\n```
    // Matches code blocks where the first non-whitespace line starts with '|' and contains '|---|'
    modified = modified.replace(/```(?:markdown)?\s*\n([\s\S]*?)\n```/g, (match, codeBlock) => {
        const trimmed = codeBlock.trim();
        // Check if this code block is actually a markdown table
        if (trimmed.startsWith('|') && /\|[\s-:]+\|/.test(trimmed)) {
            // Strip any accidental 4-space leading indentation from table lines
            const cleanLines = trimmed.split('\n').map(line => line.trim()).join('\n');
            return `\n\n${cleanLines}\n\n`;
        }
        return match;
    });

    // Pattern 2: Any table lines with 4+ spaces of leading indentation (which triggers indented code block)
    const lines = modified.split('\n');
    let inIndentedTable = false;
    const cleanedLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/^\s{2,}\|.*\|/.test(line)) {
            cleanedLines.push(line.trim());
        } else {
            cleanedLines.push(line);
        }
    }

    modified = cleanedLines.join('\n');

    // Clean up any double empty lines around tables
    modified = modified.replace(/\n{3,}\|/g, '\n\n|');

    return modified;
}

async function fixAllTables() {
    console.log(`\n===============================================================`);
    console.log(`Scanning and fixing Markdown Tables across all posts...`);
    console.log(`===============================================================\n`);

    const files = await fs.readdir(POSTS_DIR);
    let fixedCount = 0;

    for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const filePath = path.join(POSTS_DIR, file);
        const originalContent = await fs.readFile(filePath, 'utf-8');
        const cleanedContent = cleanMarkdownTables(originalContent);

        if (originalContent !== cleanedContent) {
            await fs.writeFile(filePath, cleanedContent, 'utf-8');
            fixedCount++;
            console.log(`[FIXED TABLE] ${file}`);
        }
    }

    console.log(`\n===============================================================`);
    console.log(`✅ Table fix complete! ${fixedCount} posts had their tables successfully liberated from code fences.`);
    console.log(`===============================================================\n`);
}

fixAllTables();
