export function splitArticle(text, baseSlug) {
  const parts = text.split(/^---\s*$/m);
  if (parts.length < 3) return [{ slug: baseSlug, content: text }];
  
  const frontmatterRaw = parts[1];
  let body = parts.slice(2).join('---').trim();

  // Extract hashtags from the bottom of the body to append to every part
  let hashtagBlock = "";
  const hrRegex = /\n\s*(?:\*\s*\*\s*\*|-\s*-\s*-|_+\s*)\s*\n/g;
  let lastHrMatch = null;
  let hrMatch;
  while ((hrMatch = hrRegex.exec(body)) !== null) {
    lastHrMatch = hrMatch;
  }
  
  if (lastHrMatch) {
    const afterHr = body.substring(lastHrMatch.index + lastHrMatch[0].length);
    if (afterHr.includes('#')) {
      hashtagBlock = "\n\n* * *\n\n" + afterHr.trim();
      body = body.substring(0, lastHrMatch.index).trim();
    }
  }

  const words = body.split(/\s+/).filter(w => w.trim().length > 0);
  const totalWords = words.length;

  let numParts = 1;
  if (totalWords >= 3000 && totalWords < 4500) numParts = 2;
  else if (totalWords >= 4500 && totalWords < 6500) numParts = 3;
  else if (totalWords >= 6500 && totalWords < 8500) numParts = 4;
  else if (totalWords >= 8500) numParts = Math.max(5, Math.floor(totalWords / 2000));

  if (numParts === 1) {
    return [{ slug: baseSlug, content: text }];
  }

  // Split by headings (## or ###)
  const headingRegex = /^(#{2,3})\s+(.*)$/gm;
  const sections = [];
  let lastIndex = 0;
  let match;

  while ((match = headingRegex.exec(body)) !== null) {
    if (match.index > 0) {
      sections.push(body.substring(lastIndex, match.index));
    }
    lastIndex = match.index;
  }
  sections.push(body.substring(lastIndex));

  // Group sections to balance word counts
  const targetWordsPerPart = totalWords / numParts;
  const articleParts = [];
  let currentPartSections = [];
  let currentPartWords = 0;

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    const secWords = sec.split(/\s+/).filter(w => w.trim().length > 0).length;
    
    // If adding this section exceeds target by a lot, and we are not on the last part
    if (articleParts.length < numParts - 1 && currentPartWords + secWords / 2 > targetWordsPerPart && currentPartSections.length > 0) {
      articleParts.push(currentPartSections.join('\n\n'));
      currentPartSections = [sec];
      currentPartWords = secWords;
    } else {
      currentPartSections.push(sec);
      currentPartWords += secWords;
    }
  }
  if (currentPartSections.length > 0) {
    articleParts.push(currentPartSections.join('\n\n'));
  }

  // Ensure we don't have more parts than calculated
  while(articleParts.length > numParts) {
    const last = articleParts.pop();
    articleParts[articleParts.length - 1] += '\n\n' + last;
  }

  // Build the final output files
  const outputFiles = [];
  let originalTitle = "";
  const titleMatch = frontmatterRaw.match(/^title:\s*["']?(.*?)["']?$/m);
  if (titleMatch) originalTitle = titleMatch[1];

  for (let i = 0; i < articleParts.length; i++) {
    const isFirst = i === 0;
    const isLast = i === articleParts.length - 1;
    
    const partNum = i + 1;
    const partSlug = isFirst ? baseSlug : `${baseSlug}-part-${partNum}`;
    const nextSlug = !isLast ? `${baseSlug}-part-${partNum + 1}` : null;
    const prevSlug = !isFirst ? (i === 1 ? baseSlug : `${baseSlug}-part-${partNum - 1}`) : null;

    let newFrontmatter = frontmatterRaw;
    if (!isFirst && originalTitle) {
      newFrontmatter = newFrontmatter.replace(/^title:\s*["']?(.*?)["']?$/m, `title: "${originalTitle} (Part ${partNum})"`);
    }

    let finalBody = articleParts[i].trim();

    if (!isFirst) {
      const imageMatch = finalBody.match(/!\[.*?\]\((.*?)\)/);
      if (imageMatch && imageMatch[1]) {
        const inlineImage = imageMatch[1];
        newFrontmatter = newFrontmatter.replace(/^image:\s*["']?(.*?)["']?$/m, `image: "${inlineImage}"`);
        finalBody = finalBody.replace(imageMatch[0], '');
      }
    }

    if (!isFirst) {
      finalBody = `*This is Part ${partNum} of the series. [Read Part ${partNum - 1} here](/blog/${prevSlug}).*\n\n---\n\n` + finalBody;
    }

    if (!isLast) {
      finalBody += `\n\n---\n\n👉 **[Continue Reading: ${originalTitle} (Part ${partNum + 1})](/blog/${nextSlug})**`;
    }

    if (hashtagBlock) {
      finalBody += hashtagBlock;
    }

    outputFiles.push({
      slug: partSlug,
      content: `---\n${newFrontmatter.trim()}\n---\n\n${finalBody}`
    });
  }

  return outputFiles;
}
