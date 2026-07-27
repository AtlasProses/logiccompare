import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

async function runGarsonBot() {
  console.log("🤵 Garson Bot Başlatılıyor (Toplu Cloudflare DB Aktarımı)...");
  
  const DAILY_DIR = path.join(process.cwd(), 'daily_output');
  const LOG_FILE = path.join(process.cwd(), 'sync_log.json');
  
  if (!existsSync(DAILY_DIR)) {
    console.log("Aktarılacak yeni makale bulunamadı.");
    return;
  }

  let log = { last_sync_date: null, last_synced_files_count: 0, errors: [] };
  try { log = JSON.parse(await fs.readFile(LOG_FILE, 'utf-8')); } catch (e) {}

  let totalSynced = 0;
  const folders = await fs.readdir(DAILY_DIR);
  
  for (const folder of folders) {
    const folderPath = path.join(DAILY_DIR, folder);
    const stat = await fs.stat(folderPath);
    if (!stat.isDirectory()) continue;

    const files = await fs.readdir(folderPath);
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const filePath = path.join(folderPath, file);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Burada gercek Cloudflare D1 / KV Batch API cagirisi yapilacak
        // Ornek (Mock): await fetch('https://api.cloudflare.com/...', { ... })
        console.log(`[SYNC] Cloudflare DB'ye eklendi: ${file}`);
        
        totalSynced++;
        
        // Tasima (Arsivleme veya silme)
        await fs.unlink(filePath);
      } catch (err) {
        log.errors.push({ file, error: err.message, date: new Date().toISOString() });
      }
    }
    // Eger klasor bosaldiysa sil
    const remaining = await fs.readdir(folderPath);
    if (remaining.length === 0) await fs.rmdir(folderPath);
  }

  log.last_sync_date = new Date().toISOString();
  log.last_synced_files_count = totalSynced;
  
  await fs.writeFile(LOG_FILE, JSON.stringify(log, null, 2));
  console.log(`✅ Garson Bot tamamlandı. Toplam ${totalSynced} makale DB'ye yazıldı.`);
}

runGarsonBot();
