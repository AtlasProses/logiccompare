import fs from 'fs/promises';
import path from 'path';
import { sanitizeFrontmatter, refineTitleForSearchIntent } from './sanitize-frontmatter.mjs';

async function repairAllExistingPosts() {
    const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
    const files = await fs.readdir(postsDir);
    console.log(`Starting comprehensive audit & repair across ${files.length} posts...\n`);

    let repairedCount = 0;

    for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const filePath = path.join(postsDir, file);
        let content = await fs.readFile(filePath, 'utf-8');
        let modified = false;

        // 1. Clean fake code blocks from Sports articles
        const catMatch = content.match(/^categories:\s*\[(.*?)\]/m);
        const category = catMatch ? catMatch[1].replace(/["']/g, '').trim() : '';

        if (category === 'Sports') {
            // Remove python/typescript code blocks and replace with analytical tactical commentary
            const originalContent = content;
            content = content.replace(/```python[\s\S]*?```/gi, (match) => {
                modified = true;
                return `*(Tactical Telemetry & Athletic Load Management: Load distribution protocols are calculated using player biometric tracking, telemetry downforce delta metrics, and high-frequency GPS position monitoring rather than synthetic software scripts.)*`;
            });
            content = content.replace(/```typescript[\s\S]*?```/gi, (match) => {
                modified = true;
                return `*(Aerodynamic & Speed Telemetry: Real-time telemetry monitoring tracks tyre degradation coefficients, corner-entry downforce levels, and fuel weight decay rates across race stints.)*`;
            });
            content = content.replace(/```yaml[\s\S]*?```/gi, (match) => {
                modified = true;
                return `*(Strategic Risk Matrix: Risk mitigation parameters prioritize driver safety, physical simulator adaptation hours, and aerodynamic wing angle configurations.)*`;
            });

            // Clean fake cloud computing / AWS / Kubernetes metaphors from Sports
            content = content.replace(/Production Parallel:\s*(?:Similar to\s*)?(?:high-frequency trading \(HFT\) systems|real-time embedded systems|Cloud infrastructure \(e\.g\., AWS auto-scaling\)|Social media APIs|Enterprise cybersecurity)[^\n]*/gi, '');
            content = content.replace(/\bAWS auto-scaling\b/gi, 'tactical squad rotation');
            content = content.replace(/\bhigh-availability systems\b/gi, 'championship-caliber squads');
            content = content.replace(/\bmicroservices architecture\b/gi, 'squad positional flexibility');
        }

        // 2. Refine Titles for High Search Intent (Google E-E-A-T)
        const oldTitleMatch = content.match(/^title:\s*["']?(.*?)["']?$/m);
        if (oldTitleMatch) {
            const oldTitle = oldTitleMatch[1];
            const refinedTitle = refineTitleForSearchIntent(oldTitle);
            if (oldTitle !== refinedTitle) {
                content = content.replace(/^title:\s*["']?.*?["']?$/m, `title: "${refinedTitle}"`);
                modified = true;
            }
        }

        // 3. Sanitize Frontmatter & Markdown tables
        const sanitized = sanitizeFrontmatter(content, "PostRepairEngine");
        if (sanitized !== content || modified) {
            await fs.writeFile(filePath, sanitized, 'utf-8');
            repairedCount++;
            console.log(`[REPAIRED] ${file}`);
        }
    }

    console.log(`\nSuccessfully audited and repaired ${repairedCount} posts.`);
}

repairAllExistingPosts();
