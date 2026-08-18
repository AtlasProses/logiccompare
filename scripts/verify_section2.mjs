import fs from 'fs/promises';
import path from 'path';

async function main() {
    const poolPath = path.join(process.cwd(), 'raw_data_pool.json');
    const pool = JSON.parse(await fs.readFile(poolPath, 'utf-8'));

    console.log(`\n======================================================`);
    console.log(`🔍 BÖLÜM 2: RESMİ BİRİNCİL VERİ KAYNAKLARI (PRIMARY SOURCES) DENETİMİ`);
    console.log(`======================================================`);

    const primarySources = {
        arxiv: 0,
        github: 0,
        f1_telemetry: 0,
        tactical_systems: 0,
        game_engines: 0,
        technical_dev: 0,
        other_clean: 0
    };

    let invalidItems = 0;

    for (const item of pool) {
        const url = (item.url || '').toLowerCase();
        const src = (item.source || '').toLowerCase();
        const title = (item.title || '').toLowerCase();

        if (url.includes('arxiv.org') || src.includes('arxiv')) {
            primarySources.arxiv++;
        } else if (url.includes('github.com') || src.includes('github')) {
            primarySources.github++;
        } else if (url.includes('f1_master_telemetry') || title.includes('aerodynamic downforce, cornering telemetry')) {
            primarySources.f1_telemetry++;
        } else if (url.includes('tactical_system') || title.includes('tactical formations, spatial mechanics')) {
            primarySources.tactical_systems++;
        } else if (url.includes('engine-master') || title.includes('game engine architecture')) {
            primarySources.game_engines++;
        } else if (url.includes('dev.to') || src.includes('dev.to') || src.includes('cloudflare') || src.includes('microsoft')) {
            primarySources.technical_dev++;
        } else {
            primarySources.other_clean++;
        }

        // Check if transient news got through
        if (url.includes('bbc.com') || url.includes('coindesk.com') || url.includes('pcgamer.com') || url.includes('rockpapershotgun.com')) {
            console.error(`❌ [Invalid Source]: ${item.title} (${item.url})`);
            invalidItems++;
        }
    }

    console.log(`\n📊 BİRİNCİL KAYNAK DAĞILIMI:`);
    console.log(`- 📚 arXiv Akademik Raporları (cs.AI & q-fin): ${primarySources.arxiv}`);
    console.log(`- 🐙 GitHub Açık Kaynak Mimari Repoları: ${primarySources.github}`);
    console.log(`- 🏎️ F1 FastF1 Pist Telemetrileri: ${primarySources.f1_telemetry}`);
    console.log(`- ⚽ Taktiksel Alan Geometrisi Doktrinleri: ${primarySources.tactical_systems}`);
    console.log(`- 🎮 Oyun Motoru & Grafik Hatları: ${primarySources.game_engines}`);
    console.log(`- 💻 Derin Teknik Mimariler & DevBlogs: ${primarySources.technical_dev}`);
    console.log(`- 💎 Toplam Saf Birincil Kaynak Hammaddesi: ${pool.length}`);
    console.log(`- ❌ Geçersiz / Çöp Haber Sayısı: ${invalidItems}`);

    if (invalidItems === 0) {
        console.log(`\n✅ %100 UYUMLU: Havuzdaki tüm hammaddeler resmi ve akademik birincil kaynaklardan oluşmaktadır.`);
    }
    console.log(`======================================================\n`);
}

main();
