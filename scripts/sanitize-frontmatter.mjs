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

    let title = getCleanField('title');
    if (!title) {
        // Try extracting first heading or bold title from body
        const bodyHeadingMatch = rawBody.match(/^(?:#+\s*|\*\*)([^\n\*#]+)(?:\*\*|\n|$)/m);
        if (bodyHeadingMatch) {
            title = bodyHeadingMatch[1].replace(/[*_#`"']/g, '').trim();
        }
    }
    if (!title) {
        title = "In-Depth Comparative Analysis";
    }

    let meta_title = getCleanField('meta_title');
    if (!meta_title) meta_title = title.length > 60 ? title.substring(0, 57) + "..." : title;

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

    return `${cleanFrontmatter}\n\n${rawBody.trim()}`;
}


