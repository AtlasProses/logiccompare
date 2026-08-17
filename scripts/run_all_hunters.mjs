import fs from 'fs';
import path from 'path';
import { runTechScraper } from './LGscraper_Tech.js';
import { runFinanceScraper } from './LGscraper_Finance.js';
import { runGamingScraper } from './LGscraper_Gaming.js';
import { runSportsScraper } from './LGscraper_Sports.js';

const POOL_FILE = path.join(process.cwd(), 'raw_data_pool.json');

function getPoolSummary() {
    if (!fs.existsSync(POOL_FILE)) return { total: 0, byCategory: {} };
    try {
        const data = JSON.parse(fs.readFileSync(POOL_FILE, 'utf8'));
        const byCategory = {};
        data.forEach(item => {
            byCategory[item.category] = (byCategory[item.category] || 0) + 1;
        });
        return { total: data.length, byCategory };
    } catch(e) {
        return { total: 0, byCategory: {} };
    }
}

async function main() {
    const startTime = Date.now();
    console.log(`\n===============================================================`);
    console.log(`🧟 ELİT AVCI BOTLAR (ZOMBI HUNTER ECOSYSTEM) ÇALIŞTIRILIYOR...`);
    console.log(`===============================================================\n`);

    const initialSummary = getPoolSummary();
    console.log(`📊 Başlangıç Havuz Durumu (raw_data_pool.json): ${initialSummary.total} Konu`);
    console.log(`Kategori Dağılımı:`, initialSummary.byCategory);
    console.log(`\n---------------------------------------------------------------\n`);

    const args = process.argv.slice(2);
    const catArg = args.find(a => a.startsWith('--cat='))?.split('=')[1] || 'all';
    const targetArg = parseInt(args.find(a => a.startsWith('--target='))?.split('=')[1], 10) || 2000;

    const techTarget = Math.floor(targetArg * 0.5);   // ~1000
    const finTarget = Math.floor(targetArg * 0.2);    // ~400
    const gamTarget = Math.floor(targetArg * 0.15);   // ~300
    const spoTarget = Math.floor(targetArg * 0.15);   // ~300

    try {
        if (catArg === 'all' || catArg === 'tech') {
            await runTechScraper(techTarget);
        }
        if (catArg === 'all' || catArg === 'finance') {
            await runFinanceScraper(finTarget);
        }
        if (catArg === 'all' || catArg === 'gaming') {
            await runGamingScraper(gamTarget);
        }
        if (catArg === 'all' || catArg === 'sports') {
            await runSportsScraper(spoTarget);
        }
    } catch (err) {
        console.error(`[CRITICAL ERROR DURING SCRAPING]:`, err.message);
    }

    const finalSummary = getPoolSummary();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n===============================================================`);
    console.log(`🏆 TÜM AVCI BOTLAR TAMAMLANDI! (${duration} saniye)`);
    console.log(`===============================================================`);
    console.log(`📈 Yeni Toplam Havuz: ${finalSummary.total} Konu (Eklenen: +${finalSummary.total - initialSummary.total})`);
    console.log(`📊 Güncel Kategori Dağılımı:`, finalSummary.byCategory);
    console.log(`===============================================================\n`);
}

main().catch(err => {
    console.error("FATAL:", err);
    process.exit(1);
});
