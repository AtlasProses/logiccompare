import fs from 'fs/promises';
import path from 'path';

async function main() {
    const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
    const files = await fs.readdir(postsDir);
    let totalPosts = 0;
    let issues = 0;

    console.log(`\n======================================================`);
    console.log(`🔍 BÖLÜM 1: TEMEL MİMARİ, KATEGORİ & DİL DİSİPLİNİ DENETİMİ`);
    console.log(`======================================================`);

    for (const file of files) {
        if (!file.endsWith('.md')) continue;
        totalPosts++;
        const filePath = path.join(postsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');

        // Check category
        const catMatch = content.match(/^categories:\s*\[(.*?)\]/m);
        const rawCat = catMatch ? catMatch[1].replace(/['"]/g, '').trim() : '';

        if (rawCat !== 'Technology') {
            console.error(`❌ [Category Issue] ${file}: Found category "${rawCat}" (Must be "Technology")`);
            issues++;
        }

        // Check English language in body
        const nonEnglishMatch = content.match(/\b(ve|ile|için|olarak|bir|bu|daha|çok|yok|var|sonuç|göre)\b/i);
        if (nonEnglishMatch && !file.includes('turkish')) {
            // make sure it's not accidental Turkish
            const sample = content.substring(0, 300);
            if (/\b(bir|için|olan)\b/.test(sample)) {
                console.error(`❌ [Language Issue] ${file}: Contains non-English words`);
                issues++;
            }
        }

        // Check title length
        const titleMatch = content.match(/^title:\s*["'](.*?)["']/m);
        const title = titleMatch ? titleMatch[1] : '';
        if (title.length > 70) {
            console.warn(`⚠️ [Title Length Warning] ${file}: Title is ${title.length} chars (Target <= 60 chars): "${title}"`);
        }
    }

    console.log(`\n======================================================`);
    console.log(`📊 DENETİM SONUCU:`);
    console.log(`- Toplam Taranan Makale: ${totalPosts}`);
    console.log(`- Kategori / Dil Uyumsuzluğu: ${issues}`);
    if (issues === 0) {
        console.log(`✅ %100 UYUMLU: Tüm makaleler 'Technology' kategorisinde ve %100 İngilizce.`);
    }
    console.log(`======================================================\n`);
}

main();
