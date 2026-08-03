import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

async function runGarsonBot() {
  console.log("🤵 Garson Bot Başlatılıyor (Kalıcı Content/Posts Aktarımı)...");
  
  const DAILY_DIR = path.join(process.cwd(), 'daily_output');
  const POSTS_DIR = path.join(process.cwd(), 'src', 'content', 'posts');
  const LOG_FILE = path.join(process.cwd(), 'sync_log.json');
  
  await fs.mkdir(POSTS_DIR, { recursive: true });

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
      const destPath = path.join(POSTS_DIR, file);
      try {
        await fs.copyFile(filePath, destPath);
        console.log(`[SYNC] Kalıcı olarak src/content/posts/ klasörüne aktarıldı: ${file}`);
        totalSynced++;
        
        // Gecici daily_output dosyasını temizle (Kalıcı kopyası src/content/posts/ altında korundu)
        await fs.unlink(filePath);
      } catch (err) {
        log.errors.push({ file, error: err.message, date: new Date().toISOString() });
      }
    }
    const remaining = await fs.readdir(folderPath);
    if (remaining.length === 0) await fs.rmdir(folderPath);
  }

  log.last_sync_date = new Date().toISOString();
  log.last_synced_files_count = totalSynced;
  
  await fs.writeFile(LOG_FILE, JSON.stringify(log, null, 2));
  console.log(`✅ Garson Bot tamamlandı. Toplam ${totalSynced} makale src/content/posts/ klasörüne güvenle kaydedildi.`);
}

runGarsonBot();

