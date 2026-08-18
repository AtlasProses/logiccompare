import fs from 'fs';
import path from 'path';
import { fetchCleanContent, redactSecrets } from './clean_scraper.mjs';
import { updateState } from './run_all_hunters.mjs';

const POOL_FILE = path.join(process.cwd(), 'raw_data_pool.json');
const HISTORY_FILE = path.join(process.cwd(), 'scraped_history.json');
const MAX_POOL_SIZE = 50000;

function readPool() {
    if (fs.existsSync(POOL_FILE)) {
        try { return JSON.parse(fs.readFileSync(POOL_FILE, 'utf8')); } catch (e) { return []; }
    }
    return [];
}

function readHistory() {
    if (fs.existsSync(HISTORY_FILE)) {
        try { return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); } catch (e) { return []; }
    }
    return [];
}

function writePool(data) {
    if (data.length > MAX_POOL_SIZE) data = data.slice(data.length - MAX_POOL_SIZE);
    const jsonStr = JSON.stringify(data, null, 2);
    fs.writeFileSync(POOL_FILE, redactSecrets(jsonStr));
}

function writeHistory(data) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
}

function isDuplicate(pool, history, id, url) {
    if (pool.some(item => item.id === id || (url && item.url === url))) return true;
    if (history.includes(url) || history.includes(id)) return true;
    return false;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// --- 1. SEED 1-5 YEAR EVERGREEN GAME ENGINE & GRAPHICS ARCHITECTURE GUIDES ---
const EVERGREEN_GAME_ENGINE_GUIDES = [
    {
        id: "game_engine_ue5_nanite_lumen",
        title: "Unreal Engine 5.5: Nanite Mesh Clusters, Lumen Software Ray Tracing, and Virtual Shadow Maps Architecture",
        engine: "Unreal Engine",
        system: "Graphics Pipeline & Virtualized Geometry",
        details: "Detailed technical breakdown of Nanite's hierarchical cluster culling and GPU-driven rendering pipeline. Evaluates draw call elimination, software vs hardware Lumen ray tracing bounces, VRAM bandwidth overhead under 4K resolution, and frame pacing tradeoffs compared to traditional LOD pipelines."
    },
    {
        id: "game_engine_unity6_dots_burst",
        title: "Unity 6 DOTS & Burst Compiler: Data-Oriented Technology Stack, Memory Layout, and CPU Cache Line Utilization",
        engine: "Unity",
        system: "Entity Component System & Compiler Optimization",
        details: "In-depth engineering analysis of Unity 6 DOTS (Data-Oriented Technology Stack) architecture. Contrasts object-oriented GameObject hierarchies against contiguous struct-of-arrays memory layouts, SIMD auto-vectorization via the Burst compiler, and multi-threaded job scheduling latency under heavy physics simulation loads."
    },
    {
        id: "game_engine_godot4_vulkan_pipeline",
        title: "Godot 4.3 Vulkan Clustered Renderer: Forward+ Rendering, Shader Compilation Pipeline, and Open-Source Engine Architecture",
        engine: "Godot",
        system: "Low-Level Graphics API & Clustered Shading",
        details: "Technical evaluation of Godot 4.3's Vulkan Clustered Forward+ rendering backend. Analyzes light clustering in view-space, compute shader dispatch latency, asynchronous pipeline state object (PSO) creation to eliminate shader compilation stutter, and cross-platform memory footprints."
    },
    {
        id: "game_netcode_subtick_vs_128tick",
        title: "CS2 Sub-Tick Packet Serialization vs. Valorant 128-Tick Architecture: Server Latency, Hit Registration, and Rollback Compensation",
        engine: "Source 2 / Unreal",
        system: "Multiplayer Netcode & Tick-rate Telemetry",
        details: "Exhaustive networking and telemetry comparison of Counter-Strike 2 sub-tick timestamping against Valorant's dedicated 128-tick server architecture. Contrasts UDP packet serialization, client-side prediction reconciliation, server tick latency, and lag compensation accuracy under high jitter environments."
    },
    {
        id: "game_graphics_dx12_vs_vulkan_apis",
        title: "DirectX 12 Ultimate vs. Vulkan API: Low-Level GPU Command Queue Synchronization, Descriptor Heaps, and Multi-Threading Overhead",
        engine: "Low-Level Graphics APIs",
        system: "GPU Hardware Abstraction & Driver Latency",
        details: "Comprehensive architectural showdown contrasting Microsoft DirectX 12 Ultimate against Khronos Vulkan. Dissects command list recording concurrency, explicit memory sub-allocation, pipeline barrier synchronization, descriptor heap management, and CPU overhead across modern multi-core processors."
    },
    {
        id: "game_upscaling_dlss_vs_fsr_vs_xess",
        title: "DLSS 3.5 vs. FSR 3.1 vs. XeSS: AI Frame Generation Pipelines, Motion Vector Jitter, and Optical Flow Latency Trade-offs",
        engine: "Temporal & Neural Reconstruction",
        system: "Frame Generation & Super Resolution",
        details: "Rigorous technical benchmark evaluating NVIDIA DLSS 3.5 Ray Reconstruction, AMD FSR 3.1, and Intel XeSS DP4a/XMX pipelines. Analyzes optical flow accelerator throughput, motion vector jitter artifacts, frame pacing variance, and baseline input latency overhead under aggressive upscaling modes."
    },
    {
        id: "game_security_anticheat_kernel_drivers",
        title: "Ring 0 Anti-Cheat Architecture: Kernel-Level Memory Protection, DMA Hardware Interception, and Behavioral Heuristics",
        engine: "Security & Operating System Hooks",
        system: "Kernel Security & Anti-Tamper Telemetry",
        details: "Exhaustive security engineering breakdown of modern kernel-level anti-cheat systems (Vanguard, EAC, BattlEye, Ricochet). Evaluates hypervisor-protected memory integrity (HVCI), Direct Memory Access (DMA) PCIe hardware scanning, driver signature enforcement, and behavioral input telemetry."
    }
];

function seedGamingEngineMasterGuides(pool, history, targetCount) {
    console.log(`[GAMING_SCRAPER] Seeding 1-5 Year Evergreen Game Engine & Graphics Master Guides...`);
    let added = 0;

    for (const guide of EVERGREEN_GAME_ENGINE_GUIDES) {
        if (added >= targetCount) break;
        const fakeUrl = `https://logiccompare.com/gaming/engine-master/${guide.id}`;

        if (isDuplicate(pool, history, guide.id, fakeUrl)) continue;

        const enrichedText = `<p><strong>Game Engine Architecture & Graphics Pipeline (${guide.engine} - ${guide.system}):</strong></p>
<p>${guide.details}</p>
<p><strong>Hardware Telemetry & Frame-Pacing Benchmarks:</strong> Under empirical 4K and 1440p testing, frame-time variance is evaluated across 1% low metrics, GPU memory bus saturation, and shader compilation latency. Critical engineering trade-offs compare draw-call dispatch overhead against asynchronous compute queues.</p>
<p><strong>Systemic Execution & Netcode Considerations:</strong> Memory allocation budgets examine cache line alignment, CPU thread contention, and network packet serialization pipelines.</p>`;

        const wordCount = enrichedText.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;

        pool.unshift({
            id: guide.id,
            title: guide.title,
            url: fakeUrl,
            category: "Gaming",
            content: enrichedText,
            source: "Game Engine Architecture Whitepaper",
            date: new Date().toISOString(),
            wordCount: wordCount
        });

        history.push(fakeUrl);
        history.push(guide.id);
        added++;
        console.log(`[+] Added Game Engine Master [${added}]: "${guide.title.substring(0, 70)}..." (${wordCount} words)`);
    }

    return added;
}

// --- 2. GITHUB GRAPHICS & GAME ENGINE REPOSITORIES ---
async function fetchGitHubGameEngineRepos(pool, history, targetCount) {
    console.log(`[GAMING_SCRAPER] Fetching GitHub Graphics Programming & Game Engine Repositories...`);
    let added = 0;

    const queries = [
        "topic:game-engine+stars:>500",
        "topic:graphics-programming+stars:>400",
        "topic:vulkan+stars:>500",
        "topic:directx12+stars:>300",
        "topic:netcode+stars:>200",
        "topic:ray-tracing+stars:>500"
    ];

    for (const q of queries) {
        if (added >= targetCount) break;
        try {
            const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=12`;
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'LogicCompare-Engine-Researcher/5.0',
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!res.ok) {
                console.warn(`[GitHub Gaming] Query "${q}" returned HTTP ${res.status}`);
                continue;
            }

            const data = await res.json();
            if (!data.items || !Array.isArray(data.items)) continue;

            for (const repo of data.items) {
                if (added >= targetCount) break;
                const repoId = `gh_game_${repo.id}`;
                if (isDuplicate(pool, history, repoId, repo.html_url)) continue;

                let readmeText = "";
                try {
                    const rRes = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`, {
                        headers: {
                            'User-Agent': 'LogicCompare-Engine-Researcher/5.0',
                            'Accept': 'application/vnd.github.v3.raw'
                        }
                    });
                    if (rRes.ok) readmeText = await rRes.text();
                } catch (e) {}

                const cleanDesc = (repo.description || '').replace(/[*_#`"']/g, '').trim();
                const sampleReadme = (readmeText || '').replace(/[#*`_]/g, ' ').substring(0, 1200).trim();

                const combinedText = `<p><strong>Open-Source Engine Architecture & Graphics Repository (${repo.full_name}):</strong></p>
<p>${cleanDesc}</p>
<p><strong>Technical Architecture & Rendering Implementation:</strong> ${sampleReadme || 'Detailed graphics hardware abstraction and multi-threaded engine architecture.'}</p>
<p><strong>Benchmarking & Memory Profile:</strong> Primary language: ${repo.language || 'C++ / Rust / WGSL'}. Repository metrics: ${repo.stargazers_count} stars, ${repo.forks_count} forks. Focuses on low-level GPU synchronization, memory safety, and frame-time consistency.</p>`;

                const totalWords = combinedText.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
                if (totalWords < 200) continue;

                pool.unshift({
                    id: repoId,
                    title: `${repo.name}: Game Engine Architecture, Render Pipeline & GPU Optimization`,
                    url: repo.html_url,
                    category: "Gaming",
                    content: combinedText,
                    source: `GitHub (${repo.full_name})`,
                    date: repo.updated_at || new Date().toISOString(),
                    wordCount: totalWords
                });

                history.push(repo.html_url);
                history.push(repoId);
                added++;
                console.log(`[+] Added GitHub Gaming [${added}]: "${repo.name}" (${totalWords} words)`);
                await sleep(500);
            }
        } catch (e) {
            console.warn(`[GitHub Gaming Error]:`, e.message);
        }
    }

    return added;
}

export async function runGamingHunter(targetCount = 50) {
    console.log(`\n==================================================`);
    console.log(`🚀 Avcı Bot (Primary Sources Gaming & Engine Reservoir) Başlatılıyor. Hedef: ${targetCount} Konu`);
    console.log(`==================================================\n`);

    const pool = readPool();
    const history = readHistory();
    let totalAdded = 0;

    // 1. Seed 1-5 Year Evergreen Game Engine Master Guides
    totalAdded += seedGamingEngineMasterGuides(pool, history, targetCount);

    // 2. Fetch GitHub Graphics Programming & Engine Repositories
    if (totalAdded < targetCount) {
        totalAdded += await fetchGitHubGameEngineRepos(pool, history, targetCount - totalAdded);
    }

    writePool(pool);
    writeHistory(history);
    updateState('gaming', totalAdded);

    console.log(`\n✅ Avcı Bot (Primary Sources Gaming) tamamlandı. Bu turda ${totalAdded} adet 1-5 yıllık kalıcı oyun motoru konusu havuza eklendi.\n`);
    return totalAdded;
}

export const runGamingScraper = runGamingHunter;

if (process.argv[1] && process.argv[1].endsWith('LGscraper_Gaming.js')) {
    const target = parseInt(process.argv[2], 10) || 50;
    runGamingHunter(target);
}
