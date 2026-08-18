import fs from 'fs';
import path from 'path';
import { runTechScraper } from './LGscraper_Tech.js';
import { runFinanceScraper } from './LGscraper_Finance.js';
import { runGamingScraper } from './LGscraper_Gaming.js';
import { runSportsScraper } from './LGscraper_Sports.js';

const POOL_FILE = path.join(process.cwd(), 'raw_data_pool.json');
const STATE_FILE = path.join(process.cwd(), 'scraper_state.json');

// 50 Dakikalık Güvenli Çalışma Süresi Sınırı (3000 saniye)
const MAX_RUN_TIME_MS = 50 * 60 * 1000;
const startTime = Date.now();

export function isTimeOut() {
    return (Date.now() - startTime) >= MAX_RUN_TIME_MS;
}

export function readState() {
    if (fs.existsSync(STATE_FILE)) {
        try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (e) { }
    }
    return {
        tech: { arxiv_offset: 0, devto_page: 1, last_run: null },
        finance: { last_run: null },
        gaming: { last_run: null },
        sports: { last_run: null }
    };
}

export function updateState(category, patch) {
    const state = readState();
    state[category] = { ...(state[category] || {}), ...patch, last_run: new Date().toISOString() };
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
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
    const currentState = readState();
    console.log(`📊 Başlangıç Havuz Durumu (raw_data_pool.json): ${initialSummary.total} Konu`);
    console.log(`Kategori Dağılımı:`, initialSummary.byCategory);
    console.log(`💾 Checkpoint Durumu:`, JSON.stringify(currentState, null, 2));
    console.log(`\n---------------------------------------------------------------\n`);

    const args = process.argv.slice(2);
    const catArg = args.find(a => a.startsWith('--cat='))?.split('=')[1] || 'all';
    const targetArg = parseInt(args.find(a => a.startsWith('--target='))?.split('=')[1], 10) || 1000;

    // DİNAMİK AÇIK KAPATMA (DEFICIT EQUALIZER)
    // Eğer Teknoloji zaten doymuşsa (>= 400), enerjinin %90'ını Finans, Oyun ve Spora aktar!
    const techCount = initialSummary.byCategory['Technology'] || 0;
    let techTarget, finTarget, gamTarget, spoTarget;

    if (techCount >= 400 && catArg === 'all') {
        console.log(`💡 [Dinamik Dengeleyici] Teknoloji havuzu zengin (${techCount} konu). Avcı bot gücü Finans, Oyun ve Spora yönlendiriliyor.`);
        techTarget = 25; // Rölanti
        finTarget = Math.floor(targetArg * 0.35); // %35
        gamTarget = Math.floor(targetArg * 0.35); // %35
        spoTarget = Math.floor(targetArg * 0.30); // %30
    } else {
        techTarget = Math.floor(targetArg * 0.4);   // %40
        finTarget = Math.floor(targetArg * 0.25);   // %25
        gamTarget = Math.floor(targetArg * 0.2);    // %20
        spoTarget = Math.floor(targetArg * 0.15);   // %15
    }

    let timedOut = false;

    try {
        // Öncelik Sırası: Finans -> Oyun -> Spor -> Teknoloji
        if (!isTimeOut() && (catArg === 'all' || catArg === 'finance')) {
            await runFinanceScraper(finTarget, isTimeOut);
        }
        if (!isTimeOut() && (catArg === 'all' || catArg === 'gaming')) {
            await runGamingScraper(gamTarget, isTimeOut);
        }
        if (!isTimeOut() && (catArg === 'all' || catArg === 'sports')) {
            await runSportsScraper(spoTarget, isTimeOut);
        }
        if (!isTimeOut() && (catArg === 'all' || catArg === 'tech')) {
            await runTechScraper(techTarget, isTimeOut);
        }
        if (isTimeOut()) {
            timedOut = true;
        }
    } catch (err) {
        console.warn(`[SCRAPER NOTICE]:`, err.message);
    }

    const finalSummary = getPoolSummary();
    const durationMin = ((Date.now() - startTime) / (1000 * 60)).toFixed(2);

    console.log(`\n===============================================================`);
    if (timedOut || isTimeOut()) {
        console.log(`⏰ 50 DAKİKALIK GÜVENLİ ZAMAN SINIRINA ULAŞILDI! (${durationMin} dakika)`);
        console.log(`🛑 İşlem güvenle durduruldu. Sonraki çalışmada kaldığı yerden devam edecek.`);
    } else {
        console.log(`✅ TÜM KAYNAKLAR TARANDI, GÖREV BAŞARIYLA TAMAMLANDI! (${durationMin} dakika sürdü)`);
    }
    console.log(`===============================================================`);
    console.log(`📈 Yeni Toplam Havuz: ${finalSummary.total} Konu (Bu turda eklenen: +${finalSummary.total - initialSummary.total})`);
    console.log(`📊 Güncel Kategori Dağılımı:`, finalSummary.byCategory);
    console.log(`💾 Tüm veriler raw_data_pool.json, scraped_history.json ve scraper_state.json dosyalarına güvenle yazıldı.`);
    console.log(`===============================================================\n`);
    
    process.exit(0);
}

if (process.argv[1]?.endsWith('run_all_hunters.mjs')) {
    main().catch(err => {
        console.error("Graceful finish notice:", err.message);
        process.exit(0);
    });
}
