import fs from 'fs';
import path from 'path';
import { runTechScraper } from './LGscraper_Tech.js';
import { runFinanceScraper } from './LGscraper_Finance.js';
import { runGamingScraper } from './LGscraper_Gaming.js';
import { runSportsScraper } from './LGscraper_Sports.js';

const POOL_FILE = path.join(process.cwd(), 'raw_data_pool.json');

// 50 Dakikalık Güvenli Çalışma Süresi Sınırı (3000 saniye)
const MAX_RUN_TIME_MS = 50 * 60 * 1000;
const startTime = Date.now();

function isTimeOut() {
    return (Date.now() - startTime) >= MAX_RUN_TIME_MS;
}

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
    console.log(`\n===============================================================`);
    console.log(`🧟 ELİT AVCI BOTLAR (50 DAKİKA GÜVENLİ ZAMAN AŞIMI & DİNAMİK HAVUZ)...`);
    console.log(`⏱️ Maksimum Güvenli Çalışma Süresi: 50 Dakika (${MAX_RUN_TIME_MS / 60000} dk)`);
    console.log(`===============================================================\n`);

    const initialSummary = getPoolSummary();
    console.log(`📊 Başlangıç Havuz Durumu (raw_data_pool.json): ${initialSummary.total} Konu`);
    console.log(`Kategori Dağılımı:`, initialSummary.byCategory);
    console.log(`\n---------------------------------------------------------------\n`);

    const args = process.argv.slice(2);
    const catArg = args.find(a => a.startsWith('--cat='))?.split('=')[1] || 'all';
    const targetArg = parseInt(args.find(a => a.startsWith('--target='))?.split('=')[1], 10) || 1000;

    const techTarget = Math.floor(targetArg * 0.5);   // ~500-600
    const finTarget = Math.floor(targetArg * 0.2);    // ~200
    const gamTarget = Math.floor(targetArg * 0.15);   // ~150
    const spoTarget = Math.floor(targetArg * 0.15);   // ~150

    try {
        if (!isTimeOut() && (catArg === 'all' || catArg === 'tech')) {
            await runTechScraper(techTarget, isTimeOut);
        }
        if (!isTimeOut() && (catArg === 'all' || catArg === 'finance')) {
            await runFinanceScraper(finTarget, isTimeOut);
        }
        if (!isTimeOut() && (catArg === 'all' || catArg === 'gaming')) {
            await runGamingScraper(gamTarget, isTimeOut);
        }
        if (!isTimeOut() && (catArg === 'all' || catArg === 'sports')) {
            await runSportsScraper(spoTarget, isTimeOut);
        }
    } catch (err) {
        console.warn(`[SCRAPER NOTICE]:`, err.message);
    }

    const finalSummary = getPoolSummary();
    const durationMin = ((Date.now() - startTime) / (1000 * 60)).toFixed(2);

    console.log(`\n===============================================================`);
    console.log(`🏆 AVCI BOTLAR GÖREVİ TAMAMLADI VEYA 50 DK SINIRINA ULAŞTI! (${durationMin} dakika)`);
    console.log(`===============================================================`);
    console.log(`📈 Yeni Toplam Havuz: ${finalSummary.total} Konu (Bu turda eklenen: +${finalSummary.total - initialSummary.total})`);
    console.log(`📊 Güncel Kategori Dağılımı:`, finalSummary.byCategory);
    console.log(`💾 Tüm veriler raw_data_pool.json ve scraped_history.json dosyalarına güvenle yazıldı.`);
    console.log(`===============================================================\n`);
    
    process.exit(0);
}

main().catch(err => {
    console.error("Graceful finish notice:", err.message);
    process.exit(0);
});
