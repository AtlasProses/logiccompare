import { buildPass1Prompt, buildPass2Prompt } from './category_prompt_builder.mjs';

async function main() {
    console.log(`\n======================================================`);
    console.log(`🔍 BÖLÜM 3: 4 ADIMLI VERİ-MAKALE İSKELETİ & ZORUNLU BİLEŞENLER DENETİMİ`);
    console.log(`======================================================`);

    const categories = ["Technology", "Finance", "Gaming", "Sports"];
    let allPassed = true;

    for (const cat of categories) {
        const mockAuthor = {
            name: "Test Author",
            age: 42,
            location: "Seattle, USA",
            role: "Senior Analyst",
            specialty: "Systems Architecture",
            toneModifier: "pragmatic",
            deviceContext: "ThinkPad X1",
            noiseLevel: "Quiet"
        };

        const mockItems = [
            { title: `${cat} Architecture Entity A`, content: "Deep technical specifications and memory layout benchmarks." },
            { title: `${cat} Architecture Entity B`, content: "Alternative implementation with asynchronous pipeline execution." }
        ];

        const pass1 = buildPass1Prompt({
            author: mockAuthor,
            primaryCategory: cat,
            articleMode: "Comparative Analysis",
            selectedItems: mockItems,
            rawContext: "Mock primary source telemetry data and specifications.",
            date: new Date().toISOString(),
            isSingleTopic: false
        });

        const pass2 = buildPass2Prompt({
            author: mockAuthor,
            primaryCategory: cat,
            pass1Text: "Pass 1 generated sample text with architecture analysis.",
            selectedItems: mockItems,
            isSingleTopic: false
        });

        // Verification checks
        const has4Step = pass1.includes('4-STEP BLUEPRINT') && pass1.includes('Step 1') && pass1.includes('Step 2') && pass2.includes('Step 3') && pass2.includes('Step 4');
        const hasTableRequirement = pass2.includes('MANDATORY MARKDOWN COMPARISON TABLE');
        const hasCliSnippet = pass1.includes('CLI VERIFICATION') && (pass1.includes('pgbench') || pass1.includes('renderdoccmd') || pass1.includes('fastf1') || pass1.includes('curl'));
        const hasDomainQuarantine = pass1.includes('STRICT DOMAIN QUARANTINE');

        console.log(`\n[+] Testing Category: ${cat}`);
        console.log(`    - 4 Adımlı Veri İskeleti: ${has4Step ? '✅ VAR' : '❌ EKSİK'}`);
        console.log(`    - Zorunlu Markdown Tablosu: ${hasTableRequirement ? '✅ VAR' : '❌ EKSİK'}`);
        console.log(`    - Kopyalanabilir CLI Test Komutu: ${hasCliSnippet ? '✅ VAR' : '❌ EKSİK'}`);
        console.log(`    - Kategori İzolasyonu: ${hasDomainQuarantine ? '✅ VAR' : '❌ EKSİK'}`);

        if (!has4Step || !hasTableRequirement || !hasCliSnippet || !hasDomainQuarantine) {
            allPassed = false;
        }
    }

    console.log(`\n======================================================`);
    console.log(`📊 DENETİM SONUCU:`);
    if (allPassed) {
        console.log(`✅ %100 UYUMLU: 4 kategorinin tamamında 4 adımlı iskelet, zorunlu tablo, CLI komutları ve alan izolasyonu kusursuz çalışıyor.`);
    } else {
        console.log(`❌ BAZI KONTROLLER BAŞARISIZ OLDU.`);
    }
    console.log(`======================================================\n`);
}

main();
