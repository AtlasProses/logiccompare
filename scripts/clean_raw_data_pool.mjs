import fs from 'fs/promises';
import path from 'path';

async function main() {
    const poolPath = path.join(process.cwd(), 'raw_data_pool.json');
    const rawData = JSON.parse(await fs.readFile(poolPath, 'utf-8'));

    console.log(`\n======================================================`);
    console.log(`🧹 CLEANING RAW DATA POOL: PURGING TRANSIENT NEWS CHAFF...`);
    console.log(`Initial Pool Items: ${rawData.length}`);
    console.log(`======================================================`);

    const isPrimarySource = (item) => {
        const url = (item.url || '').toLowerCase();
        const source = (item.source || '').toLowerCase();
        const title = (item.title || '').toLowerCase();
        const content = (item.content || '').toLowerCase();

        // 1. Blacklist ephemeral news terms
        const hasBlacklistedTerm = /\b(breaking|arrested|injury update|gossip|rumor|hotfix 1\.|today announced|live stream|spotted)\b/i.test(title);
        if (hasBlacklistedTerm) return false;

        // 2. Reject old transient RSS sources (BBC, CoinDesk news, CoinTelegraph news, general blog feeds)
        if (url.includes('bbc.com') || url.includes('coindesk.com') || url.includes('cointelegraph.com') || url.includes('pcgamer.com') || url.includes('rockpapershotgun.com')) {
            return false;
        }

        // 3. Whitelist verified primary sources
        const isArxiv = url.includes('arxiv.org') || source.includes('arxiv');
        const isGithub = url.includes('github.com') || source.includes('github');
        const isF1Master = url.includes('f1_master_telemetry') || title.includes('circuit: aerodynamic');
        const isTactical = url.includes('tactical_system') || title.includes('tactical formations, spatial');
        const isSteamEngine = url.includes('steampowered.com') || url.includes('steamdb') || title.includes('helldivers 2');
        const isDevto = url.includes('dev.to') && (content.includes('architecture') || content.includes('benchmark') || content.includes('kubernetes') || content.includes('rust') || content.includes('postgres') || content.includes('vllm'));

        return isArxiv || isGithub || isF1Master || isTactical || isSteamEngine || isDevto;
    };

    const cleanPool = rawData.filter(item => {
        // Enforce Category Standard: Tech -> Technology
        if (item.category === 'Tech') item.category = 'Technology';
        return isPrimarySource(item);
    });

    const byCat = {};
    cleanPool.forEach(d => { byCat[d.category] = (byCat[d.category] || 0) + 1; });

    await fs.writeFile(poolPath, JSON.stringify(cleanPool, null, 2), 'utf-8');

    console.log(`\n======================================================`);
    console.log(`✅ RAW DATA POOL PURGED & ALIGNED TO PRIMARY SOURCES!`);
    console.log(`- Remaining 100% Primary Source Items: ${cleanPool.length}`);
    console.log(`- Category Distribution:`, byCat);
    console.log(`======================================================\n`);
}

main();
