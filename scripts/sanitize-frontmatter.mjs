export function sanitizeFrontmatter(text, modelName = "unknown") {
    const model = modelName.toLowerCase();
    
    // 1. Temel temizlik: Eğer AI tüm metni ``` içine aldıysa sadece dıştaki kutuyu temizle, içteki kod bloklarına dokunma!
    if (text.trim().startsWith('```')) {
        text = text.trim().replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```\s*$/, '').trim();
    }

    // 2. Modellerin huylarına göre başlık (title) başlangıcını yakala ve öncesini sil
    // case-insensitive 'i' flag for robustness
    let titleRegex = /^title:\s*["']/im; 
    let titleMatch = text.match(titleRegex);

    if (titleMatch) {
        text = text.substring(titleMatch.index);
    } else {
        // Fallback for all models if it forgot the quotes or used capital T
        const fallbackRegex = /\btitle\s*:\s*["']?([^"'\n]*)/i;
        const fbMatch = text.match(fallbackRegex);
        if (fbMatch) {
            text = `title: "${fbMatch[1]}"\n` + text.substring(fbMatch.index + fbMatch[0].length);
        }
    }

    // 3. Dosyanın kesinlikle --- ile başlamasını sağla (Frontmatter başlangıcı)
    if (!text.startsWith('---')) {
        text = '---\n' + text;
    }

    // 4. Kapanış --- garantile (draft: false satırından sonra)
    const draftParts = text.split(/^---\s*$/m);
    if (draftParts.length < 3) {
        text = text.replace(/(draft:\s*(true|false)\s*)/i, '$1\n---\n');
    }

    // 5. YAML bloğunu ayrıştır ve içindeki hatalı tırnakları düzelt
    const parts = text.split(/^---\s*$/m);
    if (parts.length >= 3) {
        let frontmatter = parts[1];
        
        // image tag fixes if unclosed
        frontmatter = frontmatter.replace(/^(image:\s*".*?[^"])$/m, '$1"');
        
        // internal double quote fix for title, meta_title, description
        const fixInternalQuotes = (match, key, content) => {
            const safeContent = content.replace(/"/g, "'");
            return `${key}: "${safeContent}"`;
        };
        frontmatter = frontmatter.replace(/^(title|meta_title|description):\s*"(.*?)"$/gm, fixInternalQuotes);
        
        if (!/^date:/m.test(frontmatter)) {
            frontmatter += `\ndate: ${new Date().toISOString()}`;
        }
        
        if (!/^draft:/m.test(frontmatter)) {
             frontmatter += `\ndraft: false`;
        }

        parts[1] = frontmatter;
        return parts.join('---');
    }
    
    // Frontmatter bloklara ayrılamadıysa text'i olduğu gibi döndür 
    return text;
}
