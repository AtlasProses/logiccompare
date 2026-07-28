import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import fs from 'fs/promises';

// Örnek URL listesi (Bunu dışarıdan bir JSON veya txt dosyasından da okuyabilirsiniz)
const urls = [
  'https://developer.mozilla.org/en-US/docs/Web/API/Document/title',
  // Buraya istediğiniz URL'leri ekleyebilirsiniz
];

async function scrapePage(url) {
  try {
    console.log(`\nKazınıyor: ${url}`);
    
    // 1. Sayfa içeriğini çek
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Hata: ${response.status}`);
    }
    const htmlText = await response.text();

    // 2. HTML'i JSDOM ile ayrıştır (DOM ağacı oluşturur)
    const doc = new JSDOM(htmlText, { url });

    // 3. Mozilla Readability ile ana içeriği ve başlığı çıkar
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (article) {
      return {
        url: url,
        title: article.title,
        content: article.textContent.trim(), // Sadece metin istiyorsanız textContent, HTML istiyorsanız article.content
        excerpt: article.excerpt,
        length: article.length
      };
    } else {
      console.log(`[-] ${url} için içerik bulunamadı.`);
      return null;
    }
  } catch (error) {
    console.error(`[-] Hata oluştu (${url}):`, error.message);
    return null;
  }
}

async function runBot() {
  const results = [];
  
  console.log("Bot başlatıldı...");
  
  for (const url of urls) {
    const data = await scrapePage(url);
    if (data) {
      console.log(`[+] Başlık: ${data.title}`);
      // İçeriğin ilk 150 karakterini ekrana yazdır (Önizleme)
      console.log(`[+] İçerik Önizleme: ${data.content.substring(0, 150)}...\n`);
      results.push(data);
    }
  }

  // Sonuçları bir JSON dosyasına kaydet
  if (results.length > 0) {
    const fileName = 'scraped_data.json';
    await fs.writeFile(fileName, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`\n[✓] Tüm veriler başarıyla '${fileName}' dosyasına kaydedildi. (${results.length} sayfa)`);
  }
}

// Botu çalıştır
runBot();
