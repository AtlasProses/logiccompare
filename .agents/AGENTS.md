# Quora Paylaşım Kuralları
- Quora için içerik oluştururken daima İngilizce kullanılmalıdır (Çünkü blog İngilizce).
- Paylaşımlar şu formatta olmalıdır:
  1. Arama Sorgusu (Kullanıcının Quora'da aratacağı popüler İngilizce soru)
  2. Kanca (Hook) formatında kısa, merak uyandıran İngilizce cevap
  3. Blog makalesinin doğrudan linki
- Bu kural tüm Quora taleplerinde otomatik olarak uygulanacaktır.

# Reddit Paylaşım Kuralları
- Reddit'te ana gönderinin (post) içine LİNK KOYMAK KESİNLİKLE YASAKTIR (Otomatik filtreler anında siler).
- Bu yüzden Reddit için içerik hazırlanırken, ana metnin (Body) içine asla link konulmayacaktır.
- Sadece tartışma başlatıcı, ilgi çekici bir başlık ve metin verilecektir. Kullanıcı linki, postu paylaştıktan sonra ilk YORUM (Comment) olarak kendisi ekleyecektir.

# Commit Hash Formatı Kuralı
- Kullanıcıya herhangi bir Git işleminden sonra bir Commit Hash veya referans kodu verilirken KESİNLİKLE 7 karakterden oluşan **kısa hash formatı** (örneğin: `9cc3efa`) verilmelidir.
- Bu format, GitHub ve Cloudflare deploy süreçlerinde kullanılan standart koddur. Uzun (40 karakterlik) hash kodu asla verilmemelidir.

# Kitap Botu (generate-books.mjs) Yazar Kuralı
- Kitap Botu (generate-books.mjs) yazar listesini kendi içinde değil, dizindeki `book_authors.json` dosyasından çeker. 
- Yazar analizi, yazar profili oluşturma veya yazar silme işlemleri yapılırken KESİNLİKLE bu JSON dosyası da okunmalı ve dikkate alınmalıdır, böylece Grup 04 (Kitap) yazarları gözden kaçırılmaz.

# Veri Toplama (Scraper) ve Havuz Kuralları (JINA KULLANILMAZ)
- **Jina Reader (`r.jina.ai`) Kesinlikle Yasaktır:** Jina servisindeki 403 engellemeleri, kota/rate limit sorunları ve bozuk veri ayıklama nedeniyle Jina tabanlı scraping (`Fetch_Viral_History.mjs` vb.) tamamen terk edilmiştir. Asla Jina üzerinden veri çekilmeyecek veya önerilmeyecektir.
- **Yerel Temizleme Motoru (`scripts/clean_scraper.mjs`):** Tüm veri kazıma işlemleri bu yerel motoru kullanır (Mozilla Readability + JSDOM + Anti-Ban User-Agent rotasyonu + dinamik gecikmeler). Reklam, çerez ve çöp etiketler temizlenir; **en az 200 kelimelik** teknik içerik barajı zorunludur.
- **Aktif 4'lü Kategori Avcı Botları:**
  1. `scripts/LGscraper_Tech.js`: Microsoft DevBlogs RSS, Cloudflare Engineering RSS, arXiv CS/AI API, HackerNews Algolia (+120 puan)
  2. `scripts/LGscraper_Finance.js`: CoinTelegraph RSS, CoinDesk RSS
  3. `scripts/LGscraper_Gaming.js`: PC Gamer RSS, Rock Paper Shotgun RSS
  4. `scripts/LGscraper_Sports.js`: BBC Sport RSS (Football & F1)
- Tüm avcı botlar çekilen verileri doğrudan `raw_data_pool.json` dosyasında biriktirir.

# Aşçı Bot (`scripts/AsciBot.mjs`) & Makale Üretim Standartları
- **Anti-Frankenstein & Akıllı Kümeleme Kuralı (`scripts/semantic_topic_clusterer.mjs`):** Alakasız konuların (örneğin basketbol düğünü ile F1 araç dengesi veya futbol tutuklanması) tek makalede zorla birleştirilmesi KESİNLİKLE YASAKTIR. Aşçı Bot havuzdan veri çekerken yalnızca aynı alt uzmanlık alanındaki doğal eşleşmeleri (A vs B / A vs B vs C) kümeleyecek; doğal bir muadili olmayan tekil konuları ise 2500+ kelimelik tekil derin analiz (Single-Topic Deep Dive) olarak işleyecektir.
- Aşçı Bot, `raw_data_pool.json` havuzundaki verileri alarak 2500 - 5000 kelimelik derin, İngilizce karşılaştırmalı analizler (Comparative Analysis) üretir.
- **AI Şelale (Waterfall) Sırası & 429 Merdiveni:** Nvidia (Llama 3.1 70B) -> Gemini (Flash) -> Groq (Llama 3.3 70B) -> Mistral -> SambaNova -> OpenRouter. 429 ve Hata Merdiveni: 1. hata -> 10 sn bekleme, 2. hata -> 25 sn bekleme, 3. hata -> 25 sn bekleme, 4. hata -> tam 8 dakika soğuma/cooldown.
- **Zorunlu Makale Bileşenleri:**
  - En az bir Markdown Karşılaştırma Matrisi / Tablosu (Trade-offs, Benchmarks, Pros/Cons),
  - Kategoriye özel kod blokları (Python, TypeScript, YAML) veya finans/oyun metrikleri,
  - Google Featured Snippets uyumlu "Strategic FAQ" bölümü,
  - Pexels/Pixabay/Unsplash entegrasyonu (`PEXELS_IMAGE: [terms]`),
  - Kategoriye uygun yazarın 100 kişilik yazar havuzundan (`src/content/authors/` / `scripts/authors_list.json`) atanması.
- 3000 kelimeyi aşan makaleler `article_splitter.mjs` ile parçalara (Part 1, Part 2) bölünerek iç linklerle bağlanır.

# Garson Bot (`scripts/garson.mjs`) ve Senkronizasyon
- `daily_output/` klasöründeki makaleleri doğrular, frontmatter temizliği yapar (`sanitize-frontmatter.mjs`) ve kalıcı olarak `src/content/posts/` klasörüne aktarır.
- Aktarılan makalelerin kaydını `sync_log.json` dosyasına işler.
