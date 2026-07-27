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
