/**
 * Frontmatter Sanitizer & Auto-Healer Engine (Master Edition)
 * -----------------------------------------------------------
 * Enforces punchy human editorial titles (45-60 chars max), clean descriptions,
 * and seamlessly scrubs AI cliches ("In conclusion", "Delve into", "Tapestry")
 * in post-processing without deleting articles or wasting tokens.
 */

export function refineTitleForSearchIntent(rawTitle) {
    if (!rawTitle) return "Systems Architecture & Latency Compared";
    let title = rawTitle.replace(/[*_#`"']/g, '').trim();

    // Check Part marker
    let partSuffix = "";
    const partMatch = title.match(/\((Part\s*\d+)\)$/i);
    if (partMatch) {
        partSuffix = ` (${partMatch[1]})`;
        title = title.replace(/\s*\((Part\s*\d+)\)$/i, '').trim();
    }

    // Strip robotic prefixes
    title = title.replace(/^(?:The\s+)?2026\s+(?:Agentic\s+AI\s+Ecosystem\s+Showdown|Showdown|Landscape|Review):\s*/i, '');
    title = title.replace(/^(?:A\s+)?(?:Tri-Matrix|Quad-Matrix|Multi-Way|4-Way|3-Way|2-Way)\s*(?:Comparative\s+Analysis|Comparison|Benchmark|Showdown)\s+of\s+/i, '');
    title = title.replace(/^Unveiling\s+the\s+(?:Architectural\s+Depths|Depths|Mechanics)\s+of\s+/i, '');
    title = title.replace(/^Navigating\s+the\s+Complexities\s+of\s+/i, '');
    title = title.replace(/^Unpacking\s+the\s+(?:Architectural\s+Dynamics|Dynamics|Ecosystem)\s+of\s+/i, '');

    // Convert comma-separated lists of entities to 'vs.'
    const colonMatch = title.match(/^(.*?):\s*(?:A\s+)?(?:4-Way|3-Way|Tri-Matrix|Quad-Matrix)?\s*(?:Comparative\s+Analysis|Analysis|Showdown|Benchmark)\s+of\s+(.*?)$/i);
    if (colonMatch) {
        const topic = colonMatch[1].trim();
        let entities = colonMatch[2].replace(/,\s*(?:and\s+)?/gi, ' vs. ').replace(/\s+and\s+/gi, ' vs. ');
        entities = entities.replace(/(?:\s*vs\.\s*)+/gi, ' vs. ').trim();
        title = `${entities}: ${topic} Compared`;
    }

    // Clean redundant phrases like "– A Quad-Matrix Comparative Masterwork"
    title = title.replace(/\s*–\s*A\s+(?:Quad-Matrix|Tri-Matrix|Comparative)\s+.*$/i, '');
    title = title.replace(/\s*:\s*A\s+(?:Quad-Matrix|Tri-Matrix|Comparative)\s+Masterwork.*$/i, '');
    title = title.replace(/[:\-–]\s*$/, '').trim();

    // If title has "A vs B" without colon, add Compared
    if (/^([a-zA-Z0-9\s\-]+)\s+vs\.\s+([a-zA-Z0-9\s\-]+)$/i.test(title)) {
        title = `${title}: Architecture Compared`;
    }

    // If still too long (> 62 chars), intelligently compress
    if (title.length > 62) {
        const parts = title.split(':');
        if (parts.length > 1) {
            const ent = parts[0].trim();
            const desc = parts[1].replace(/Compared/i, '').trim();
            title = `${ent.substring(0, 35)}: ${desc.substring(0, 20)} Compared`;
        } else {
            title = title.substring(0, 58).trim();
        }
    }

    return `${title}${partSuffix}`.trim();
}

/**
 * Auto-Heal Cliches & Polish Natural Sentences
 * Rescues 2,000+ word articles by cleaning buzzwords without discarding.
 */
export function autoHealClichesAndPhrases(bodyText) {
    if (!bodyText || typeof bodyText !== 'string') return bodyText;

    let text = bodyText;

    // 1. Clean Didactic Headings and Closing Cliches
    text = text.replace(/#+\s*(?:In\s+)?Conclusion\b/gi, '## Synthesized Strategic Verdict');
    text = text.replace(/\bIn\s+conclusion,?\s*/gi, '');
    text = text.replace(/\bTo\s+summarize,?\s*/gi, 'Examining the trade-offs, ');
    text = text.replace(/\bIn\s+summary,?\s*/gi, 'Critically, ');
    text = text.replace(/\bAll\s+in\s+all,?\s*/gi, 'Ultimately, ');

    // 2. Scrub "Delve into" & exploration buzzwords
    text = text.replace(/\b(?:Let\s+us|Let's)\s+delve\s+into\b/gi, 'examine');
    text = text.replace(/\bdelve\s+into\b/gi, 'examine');
    text = text.replace(/\bdelving\s+into\b/gi, 'analyzing');
    text = text.replace(/\bdelves\s+into\b/gi, 'analyzes');

    // 3. Scrub "fast-paced world", "testament", "tapestry" cliches (non-greedy, bounded by punctuation)
    text = text.replace(/\bIn\s+(?:the|this)\s+fast-paced\s+world\s+of\s+[^,.\n]+,?\s*/gi, 'In modern distributed architectures, ');
    text = text.replace(/\bstands\s+as\s+a\s+testament\s+to\b/gi, 'demonstrates');
    text = text.replace(/\bserves\s+as\s+a\s+testament\s+to\b/gi, 'demonstrates');
    text = text.replace(/\ba\s+rich\s+tapestry\s+of\b/gi, 'a complex network of');
    text = text.replace(/\ba\s+tapestry\s+of\b/gi, 'a system of');

    // 4. Scrub didactic "It is important to remember/note"
    text = text.replace(/\bIt\s+is\s+important\s+to\s+(?:remember|note|keep\s+in\s+mind)\s+that\b/gi, 'Critically,');
    text = text.replace(/\bIt\s+is\s+worth\s+noting\s+that\b/gi, 'Notably,');
    text = text.replace(/\bAs\s+an\s+AI\s+language\s+model,?\s*/gi, '');

    // 5. Capitalize first letter after stripped sentence-start phrases
    text = text.replace(/(\.\s+)([a-z])/g, (match, prefix, char) => `${prefix}${char.toUpperCase()}`);
    text = text.replace(/(^|\n\n)([a-z])/g, (match, prefix, char) => `${prefix}${char.toUpperCase()}`);

    return text;
}

export function sanitizeFrontmatter(text, modelName = "unknown") {
    if (!text || typeof text !== 'string') return text;

    // 1. Strip outermost codeblock fences if LLM wrapped whole output
    text = text.trim();
    if (text.startsWith('```')) {
        text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```\s*$/, '').trim();
    }

    // 2. Locate frontmatter
    let rawFrontmatter = "";
    let rawBody = "";

    const fmMatch = text.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
    if (fmMatch) {
        rawFrontmatter = fmMatch[1];
        rawBody = fmMatch[2];
    } else {
        const parts = text.split(/^---\s*$/m).filter(Boolean);
        if (parts.length >= 2) {
            rawFrontmatter = parts[0];
            rawBody = parts.slice(1).join('\n---\n');
        } else {
            rawBody = text;
        }
    }

    // 3. Clean and parse individual fields
    const getCleanField = (key, defaultVal = "") => {
        const regex = new RegExp(`^${key}:\\s*(.*)$`, 'im');
        const match = rawFrontmatter.match(regex);
        if (!match) return defaultVal;
        let val = match[1].trim();
        val = val.replace(/^[*_#`"']+|[*_#`"']+$/g, '').trim();
        val = val.replace(/"/g, "'");
        return val;
    };

    let rawTitleVal = getCleanField('title');
    if (!rawTitleVal) {
        const bodyHeadingMatch = rawBody.match(/^(?:#+\s*|\*\*)([^\n\*#]+)(?:\*\*|\n|$)/m);
        if (bodyHeadingMatch) {
            rawTitleVal = bodyHeadingMatch[1].replace(/[*_#`"']/g, '').trim();
        }
    }
    if (!rawTitleVal) {
        rawTitleVal = "Systems Architecture & Latency Compared";
    }

    let title = refineTitleForSearchIntent(rawTitleVal);

    let meta_title = getCleanField('meta_title');
    if (!meta_title || meta_title.length > 60) {
        meta_title = title.length > 50 ? title.substring(0, 48) + "... | LogicCompare" : `${title} | LogicCompare`;
    }

    // Auto-Heal Cliches on rawBody first
    rawBody = autoHealClichesAndPhrases(rawBody.trim());

    let description = getCleanField('description');
    if (!description || description.length < 50) {
        const cleanParagraphs = rawBody.split('\n\n').map(p => p.trim()).filter(p => p && !p.startsWith('#') && !p.startsWith('**') && !p.startsWith('|') && !p.startsWith('---') && !p.startsWith('📌'));
        if (cleanParagraphs.length > 0) {
            description = cleanParagraphs[0].replace(/[*_#`"']/g, '').substring(0, 150).trim() + "...";
        } else {
            description = `A deep, benchmark-grounded engineering analysis and comparative breakdown of ${title}.`;
        }
    }

    let image = getCleanField('image');
    let date = getCleanField('date', new Date().toISOString());

    // Enforce local webp cover image path
    const derivedSlug = (title || 'article').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').substring(0, 70);
    if (!image) {
        image = `/images/posts/${derivedSlug}-cover.webp`;
    }

    // Extract categories, authors, tags
    const catMatch = rawFrontmatter.match(/^categories:\s*\[(.*?)\]/im);
    let catVal = catMatch ? catMatch[1].replace(/["']/g, '').trim() : "Technology";
    if (catVal.toLowerCase() === 'tech') catVal = "Technology";

    const authorMatch = rawFrontmatter.match(/^authors:\s*\[(.*?)\]/im);
    const authorVal = authorMatch ? authorMatch[1].replace(/["']/g, '').trim() : "Marcus Sterling";

    const tagMatch = rawFrontmatter.match(/^tags:\s*\[(.*?)\]/im);
    const tagsArr = tagMatch ? tagMatch[1].split(',').map(t => `"${t.replace(/["']/g, '').trim()}"`).filter(Boolean) : [`"${catVal.toLowerCase()}"`, '"systems-architecture"', '"latency"'];

    const cleanFrontmatter = `---
title: "${title}"
meta_title: "${meta_title}"
description: "${description}"
date: ${date}
image: "${image}"
categories: ["${catVal}"]
authors: ["${authorVal}"]
tags: [${tagsArr.join(', ')}]
draft: false
---`;

    // 4. Automatically Strip Non-URL Broken Inline Image Tags (e.g. ![Analysis](raw search terms))
    let cleanBody = rawBody.replace(/!\[(.*?)\]\((?!(?:\/images\/|https?:\/\/))[^)]+\)/gi, '');

    // 5. Automatically Clean Markdown Table Code Fences in Body
    cleanBody = cleanBody.replace(/```(?:markdown)?\s*\n([\s\S]*?)\n```/g, (match, codeBlock) => {
        const trimmed = codeBlock.trim();
        if (trimmed.startsWith('|') && /\|[\s-:]+\|/.test(trimmed)) {
            const cleanLines = trimmed.split('\n').map(line => line.trim()).join('\n');
            return `\n\n${cleanLines}\n\n`;
        }
        return match;
    });

    const lines = cleanBody.split('\n');
    const cleanedLines = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/^\s{2,}\|.*\|/.test(line)) {
            cleanedLines.push(line.trim());
        } else {
            cleanedLines.push(line);
        }
    }
    cleanBody = cleanedLines.join('\n').replace(/\n{3,}\|/g, '\n\n|');

    return `${cleanFrontmatter}\n\n${cleanBody.trim()}`;
}
