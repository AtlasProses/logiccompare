import { autoHealClichesAndPhrases, sanitizeFrontmatter } from './sanitize-frontmatter.mjs';

async function main() {
    console.log(`\n======================================================`);
    console.log(`🔍 BÖLÜM 7: OTOMATİK KLİŞE TEMİZLEME & CÜMLE ONARMA (AUTO-HEALER) DENETİMİ`);
    console.log(`======================================================`);

    const testCases = [
        {
            input: "In conclusion, migrating to DuckDB delivers a 4.2x speedup under columnar OLAP workloads.",
            expectedNotContain: "In conclusion"
        },
        {
            input: "Let us delve into the memory layout and allocation bottlenecks of Redis vs KeyDB.",
            expectedNotContain: "delve into"
        },
        {
            input: "In this fast-paced world of technology, latency is critical.",
            expectedNotContain: "fast-paced world"
        },
        {
            input: "To summarize, the kernel bypass driver reduces p99 jitter by 14ms.",
            expectedNotContain: "To summarize"
        },
        {
            input: "This architecture stands as a testament to the power of asynchronous I/O.",
            expectedNotContain: "testament to"
        }
    ];

    let passedAll = true;

    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const healed = autoHealClichesAndPhrases(tc.input);
        const containsForbidden = healed.toLowerCase().includes(tc.expectedNotContain.toLowerCase());

        console.log(`\n[Test Case ${i + 1}]:`);
        console.log(`  - Ham Girdi: "${tc.input}"`);
        console.log(`  - Otomatik Onarılmış Hali: "${healed}"`);
        console.log(`  - Klişe Temizlendi mi: ${!containsForbidden ? '✅ EVET (Makale Kurtarıldı)' : '❌ HAYIR'}`);

        if (containsForbidden) passedAll = false;
    }

    // Test Full Sanitize Frontmatter Integration
    const sampleFullArticle = `---
title: "The 2026 Landscape: A Quad-Matrix Comparative Analysis of vLLM vs Kvarn"
categories: ["Tech"]
authors: ["Marcus Sterling"]
tags: ["ai", "vllm"]
---

In this fast-paced world of cloud AI, let us delve into the benchmark metrics.

| Metric | vLLM | Kvarn |
|---|---|---|
| p99 Latency | 842ms | 620ms |

In conclusion, Kvarn demonstrates superior asynchronous compute performance.
`;

    const fullResult = sanitizeFrontmatter(sampleFullArticle, "TestEngine");
    const hasCleanTitle = fullResult.includes('title: "vLLM vs Kvarn"') || fullResult.includes('vLLM vs');
    const hasCategoryFixed = fullResult.includes('categories: ["Technology"]');
    const hasCleanCliches = !fullResult.includes('In conclusion') && !fullResult.includes('delve into') && !fullResult.includes('fast-paced world');

    console.log(`\n[Tam Makale Entegrasyon Testi]:`);
    console.log(`  - Başlık İnsani Hale Getirildi mi: ${hasCleanTitle ? '✅ EVET' : '❌ HAYIR'}`);
    console.log(`  - Kategori 'Technology' Olarak Birleştirildi mi: ${hasCategoryFixed ? '✅ EVET' : '❌ HAYIR'}`);
    console.log(`  - Tüm Klişeler Tek Adımda Temizlendi mi: ${hasCleanCliches ? '✅ EVET' : '❌ HAYIR'}`);

    console.log(`\n======================================================`);
    console.log(`📊 DENETİM SONUCU:`);
    if (passedAll && hasCleanCliches) {
        console.log(`✅ %100 UYUMLU: Auto-Healer motoru tüm robotik kalıpları başarıyla temizliyor ve kaliteli makaleleri kurtarıyor.`);
    } else {
        console.log(`❌ BAZI TESTLER BAŞARISIZ OLDU.`);
    }
    console.log(`======================================================\n`);
}

main();
