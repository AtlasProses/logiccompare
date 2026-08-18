export function refineTitleForSearchIntent(rawTitle) {
    if (!rawTitle) return "In-Depth Systems & Performance Analysis";
    let title = rawTitle.replace(/[*_#`"']/g, '').trim();

    // Check Part marker
    let partSuffix = "";
    const partMatch = title.match(/\((Part\s*\d+)\)$/i);
    if (partMatch) {
        partSuffix = ` (${partMatch[1]})`;
        title = title.replace(/\s*\((Part\s*\d+)\)$/i, '').trim();
    }

    // Pattern 1: "[Topic]: A [Mode] Comparative Analysis of [Entities...]"
    const matchEntitiesAfter = title.match(/^(.*?):\s*(?:A\s+)?(?:Tri-Matrix|Quad-Matrix|Multi-Way|4-Way|3-Way)?\s*(?:Comparative Analysis|Comprehensive Comparison|Deep Breakdown|Analysis)\s+of\s+(.*?)$/i);
    if (matchEntitiesAfter) {
        const topic = matchEntitiesAfter[1].trim();
        let entities = matchEntitiesAfter[2].replace(/,\s*(?:and\s+)?/gi, ' vs. ').replace(/\s+and\s+/gi, ' vs. ');
        entities = entities.replace(/(?:\s*vs\.\s*)+/gi, ' vs. ').trim();
        title = `${entities}: ${topic} Compared`;
    }

    // Pattern 2: "A [Mode] Comparative Analysis of [Entities...]"
    const matchPrefixOnly = title.match(/^(?:A\s+)?(?:Tri-Matrix|Quad-Matrix|Multi-Way|4-Way|3-Way)?\s*(?:Comparative Analysis|Comprehensive Comparison|Deep Breakdown|Analysis)\s+of\s+(.*?)$/i);
    if (matchPrefixOnly) {
        let entities = matchPrefixOnly[1].replace(/,\s*(?:and\s+)?/gi, ' vs. ').replace(/\s+and\s+/gi, ' vs. ');
        entities = entities.replace(/(?:\s*vs\.\s*)+/gi, ' vs. ').trim();
        title = `${entities} Compared`;
    }

    // Clean redundant phrases like "– A Quad-Matrix Comparative Masterwork"
    title = title.replace(/\s*–\s*A\s+(?:Quad-Matrix|Tri-Matrix|Comparative)\s+.*$/i, '');
    title = title.replace(/\s*:\s*A\s+(?:Quad-Matrix|Tri-Matrix|Comparative)\s+Masterwork.*$/i, '');

    // Trim trailing colons or dashes
    title = title.replace(/[:\-–]\s*$/, '').trim();

    if (title.length < 5) return rawTitle;
    return `${title}${partSuffix}`;
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
        // If frontmatter is missing opening or closing ---
        const firstLine = text.split('\n')[0];
        if (/^title:/i.test(firstLine) || /^---\s*$/.test(firstLine)) {
            const parts = text.split(/^---\s*$/m).filter(Boolean);
            if (parts.length >= 2) {
                rawFrontmatter = parts[0];
                rawBody = parts.slice(1).join('\n---\n');
            } else {
                rawFrontmatter = parts[0] || "";
                rawBody = "";
            }
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
        // Strip outer quotes, bold asterisks, backticks
        val = val.replace(/^[*_#`"']+|[*_#`"']+$/g, '').trim();
        val = val.replace(/"/g, "'"); // Convert inner double quotes to single quotes
        return val;
    };

    let rawTitleVal = getCleanField('title');
    if (!rawTitleVal) {
        // Try extracting first heading or bold title from body
        const bodyHeadingMatch = rawBody.match(/^(?:#+\s*|\*\*)([^\n\*#]+)(?:\*\*|\n|$)/m);
        if (bodyHeadingMatch) {
            rawTitleVal = bodyHeadingMatch[1].replace(/[*_#`"']/g, '').trim();
        }
    }
    if (!rawTitleVal) {
        rawTitleVal = "In-Depth Systems & Performance Analysis";
    }

    let title = refineTitleForSearchIntent(rawTitleVal);

    let meta_title = getCleanField('meta_title');
    if (!meta_title) meta_title = title.length > 55 ? title.substring(0, 52) + "..." : title;

    let description = getCleanField('description');
    if (!description) {
        const cleanParagraphs = rawBody.split('\n\n').map(p => p.trim()).filter(p => p && !p.startsWith('#') && !p.startsWith('**') && !p.startsWith('|') && !p.startsWith('---'));
        if (cleanParagraphs.length > 0) {
            description = cleanParagraphs[0].replace(/[*_#`"']/g, '').substring(0, 155).trim() + "...";
        } else {
            description = `A comprehensive comparative analysis and deep dive into ${title}.`;
        }
    }

    let image = getCleanField('image');
    let date = getCleanField('date', new Date().toISOString());

    // If image doesn't start with PEXELS_IMAGE or /images/
    if (!image) {
        image = `PEXELS_IMAGE: ${title.substring(0, 30)}`;
    }

    // Extract categories, authors, tags
    const catMatch = rawFrontmatter.match(/^categories:\s*\[(.*?)\]/im);
    const catVal = catMatch ? catMatch[1].replace(/["']/g, '').trim() : "Technology";

    const authorMatch = rawFrontmatter.match(/^authors:\s*\[(.*?)\]/im);
    const authorVal = authorMatch ? authorMatch[1].replace(/["']/g, '').trim() : "Admin";

    const tagMatch = rawFrontmatter.match(/^tags:\s*\[(.*?)\]/im);
    const tagsArr = tagMatch ? tagMatch[1].split(',').map(t => `"${t.replace(/["']/g, '').trim()}"`).filter(Boolean) : [`"${catVal.toLowerCase()}"`, '"comparison"', '"analysis"'];

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

    // 4. Automatically Clean Markdown Table Code Fences in Body
    let cleanBody = rawBody.trim();
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


