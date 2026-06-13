import React, { useState, useEffect, useRef } from 'react';
import { mockProducts } from './data/mockProducts';
import { translations } from './data/translations';

// Map of languages with country flags (using ISO country codes for CDN image rendering)
const languages = [
  { code: 'en', country: 'us', label: 'English' },
  { code: 'tr', country: 'tr', label: 'Türkçe' },
  { code: 'de', country: 'de', label: 'Deutsch' },
  { code: 'fr', country: 'fr', label: 'Français' },
  { code: 'es', country: 'es', label: 'Español' },
  { code: 'it', country: 'it', label: 'Italiano' },
  { code: 'pt', country: 'pt', label: 'Português' },
  { code: 'ru', country: 'ru', label: 'Русский' },
  { code: 'zh', country: 'cn', label: '简体中文' },
  { code: 'ja', country: 'jp', label: '日本語' },
  { code: 'ar', country: 'sa', label: 'العربية' }
];

const authorBios = {
  "Franz Kafka": {
    tr: "Modern edebiyatın en etkili figürlerinden biri olan Prag doğumlu yazar. Dönüşüm, Dava ve Şato gibi eserlerinde modern bireyin yalnızlığını, bürokratik labirentleri ve yabancılaşmayı işlemiştir.",
    en: "A Prague-born writer who is one of the most influential figures of modern literature. In works like The Metamorphosis, The Trial, and The Castle, he explored the isolation of modern individuals, bureaucratic labyrinths, and alienation."
  },
  "Fyodor Dostoyevski": {
    tr: "Rus edebiyatının dahi kalemi. Suç ve Ceza, Karamazov Kardeşler, Budala gibi şaheserlerinde insan ruhunun derinliklerine inmiş, ahlak, inanç ve suç kavramlarını felsefi bir derinlikle ele almıştır.",
    en: "The genius writer of Russian literature. In masterpieces like Crime and Punishment, The Brothers Karamazov, and The Idiot, he delved into the depths of the human soul, discussing morality, faith, and crime with philosophical depth."
  },
  "Albert Camus": {
    tr: "Cezayir asıllı Fransız yazar, filozof ve gazeteci. Varoluşçuluk ve absürdizm (saçma) akımlarının en önemli temsilcilerindendir. Yabancı ve Veba eserleriyle edebiyat dünyasında derin izler bırakmıştır. 1957 Nobel Edebiyat Ödülü sahibidir.",
    en: "Algerian-born French writer, philosopher, and journalist. He is one of the most important representatives of existentialism and absurdism. He left deep marks in the literary world with his works The Stranger and The Plague. He won the 1957 Nobel Prize in Literature."
  },
  "Yuval Noah Harari": {
    tr: "İsrailli tarihçi ve yazar. Sapiens: Hayvanlardan Tanrılara, Homo Deus: Yarının Kısa Bir Tarihi ve 21. Yüzyıl İçin 21 Ders kitaplarıyla dünya çapında ün kazanmış, insanlık tarihi ve geleceği üzerine ufuk açıcı tezler sunmuştur.",
    en: "Israeli historian and author. He gained worldwide fame with his books Sapiens: A Brief History of Humankind, Homo Deus: A Brief History of Tomorrow, and 21 Lessons for the 21st Century, presenting eye-opening theses on human history and the future."
  },
  "Paulo Coelho": {
    tr: "Brezilyalı yazar ve romancı. Özellikle felsefi bir arayışı konu alan Simyacı romanıyla dünya genelinde milyonlarca okura ulaşmış, eserleri en çok dile çevrilen yaşayan yazarlardan biri olmuştur.",
    en: "Brazilian author and novelist. He reached millions of readers worldwide especially with his novel The Alchemist, which is about a philosophical quest, and became one of the most translated living authors."
  },
  "George Orwell": {
    tr: "İngiliz yazar ve gazeteci. Totaliter sistemlere karşı yazdığı 1984 ve Hayvan Çiftliği adlı distopik eserleriyle tanınır. Eserleri bugün hala siyasi ve toplumsal eleştirilerde referans kabul edilmektedir.",
    en: "English novelist and journalist. He is best known for his dystopian works 1984 and Animal Farm, written against totalitarian systems. His works are still accepted as key references in political and social critique."
  },
  "Aldous Huxley": {
    tr: "İngiliz yazar ve filozof. Geleceğin teknolojik ve distopik dünyasını ele alan Cesur Yeni Dünya eseriyle tanınır. İnsan bilinci, mistisizm ve toplumsal yapılar üzerine çok sayıda deneme ve roman kaleme almıştır.",
    en: "English writer and philosopher. He is famous for Brave New World, a dystopian novel that describes a technological future. He wrote numerous essays and novels on human consciousness, mysticism, and social structures."
  },
  "James Clear": {
    tr: "Amerikalı yazar ve üretkenlik uzmanı. Küçük alışkanlıkların birikerek nasıl büyük değişimler yarattığını anlatan Atomik Alışkanlıklar (Atomic Habits) kitabıyla küresel bir başarı elde etmiştir.",
    en: "American author and productivity expert. He achieved global success with his book Atomic Habits, which explains how small habits accumulate to create massive life changes."
  },
  "Çağlayan Yılmaz": {
    tr: "Tengri, Börü, Göktürk Üçlemesi gibi epik fantastik ve tarihi kurgu eserleriyle tanınan Türk yazar. Türk mitolojisi ve kadim tarihinden esinlenerek yarattığı sürükleyici evrenlerle geniş bir okuyucu kitlesine ulaşmıştır.",
    en: "Turkish author known for epic fantasy and historical fiction works such as Tengri, Börü, and the Göktürk Trilogy. He reached a wide readership with immersive universes inspired by Turkish mythology and ancient history."
  },
  "George S. Clason": {
    tr: "Amerikalı yazar. Finansal okuryazarlık alanında bir klasik haline gelen Babil'in En Zengin Adamı kitabıyla tanınır. Antik Babil öyküleri üzerinden para yönetimi ve birikim yapmanın kurallarını öğretir.",
    en: "American author. He is best known for his book The Richest Man in Babylon, which became a classic in financial literacy. He teaches money management and saving principles through stories of ancient Babylon."
  },
  "Napoleon Hill": {
    tr: "Kişisel gelişim alanının öncülerinden olan Amerikalı yazar. Zengin Düşün Zengin Ol (Think and Grow Rich) eseriyle tüm zamanların en çok satan kişisel gelişim kitaplarından birine imza atmış, başarının sırlarını formüle etmiştir.",
    en: "American author who was a pioneer of the personal development genre. He signed one of the best-selling self-help books of all time, Think and Grow Rich, formulating the secrets of success."
  }
};

const brandDescriptions = {
  "Panama Yayıncılık": {
    tr: "Çağdaş edebiyat, tarihi kurgu, kişisel gelişim ve fantastik roman türlerinde geniş bir yayın yelpazesine sahip, Türkiye'nin önde gelen yayınevlerinden biri.",
    en: "One of Turkey's leading publishing houses with a wide publishing range in contemporary literature, historical fiction, personal development, and fantasy novels."
  },
  "Can Yayınları": {
    tr: "Erdal Öz tarafından kurulan, Türk ve dünya edebiyatının en seçkin eserlerini modern tasarımlar ve kaliteli çevirilerle okurlarla buluşturan köklü yayınevi.",
    en: "An established publishing house founded by Erdal Öz, bringing the most distinguished works of Turkish and world literature to readers with modern designs and quality translations."
  },
  "Kronik Kitap": {
    tr: "Tarih, askeri tarih, araştırma-inceleme ve popüler tarih kitaplarıyla Türkiye'de tarih yayıncılığına yeni bir soluk getiren prestijli yayınevi.",
    en: "A prestigious publishing house that brought a fresh breath to history publishing in Turkey with books on history, military history, research, and popular history."
  },
  "Altın Kitaplar": {
    tr: "Türkiye'nin en eski ve köklü yayınevlerinden biri olan Altın Kitaplar; dünya klasikleri, polisiye, gerilim, çocuk kitapları ve popüler kurgu alanında yüzlerce kült eseri Türkçe'ye kazandırmıştır.",
    en: "One of Turkey's oldest and most established publishing houses; Altın Kitaplar has translated hundreds of cult works into Turkish in world classics, mystery, thriller, children's books, and popular fiction."
  },
  "Pegasus Yayınları": {
    tr: "Dünya çapında çok satan romanları, fantastik kurguları, popüler bilim ve araştırma eserlerini Türk okuyucusuyla buluşturan, dinamik ve yenilikçi yayınevi.",
    en: "A dynamic and innovative publishing house bringing global best-selling novels, fantasy fiction, popular science, and research works to Turkish readers."
  },
  "İthaki Yayınları": {
    tr: "Özellikle bilimkurgu, fantastik edebiyat, korku ve dünya klasikleri alanındaki öncü yayınlarıyla tanınan, Türkiye'nin en sevilen edebiyat duraklarından biri.",
    en: "Mainly known for its pioneering publications in science fiction, fantasy literature, horror, and world classics, one of Turkey's most popular literary hubs."
  },
  "Apple": {
    tr: "Yenilikçi tasarımları, iOS/macOS ekosistemi ve premium donanım kalitesiyle tüketici elektroniğinde dünya lideri teknoloji markası.",
    en: "A global leader technology brand in consumer electronics with innovative designs, iOS/macOS ecosystem, and premium hardware quality."
  },
  "Samsung": {
    tr: "Ekran teknolojileri, yarı iletkenler ve geniş ürün yelpazesiyle akıllı telefonlardan ev aletlerine kadar teknolojinin her alanında öncü Güney Koreli dev.",
    en: "A pioneering South Korean giant in every field of technology from smartphones to home appliances, known for display technologies and semiconductors."
  },
  "Xiaomi": {
    tr: "Yüksek performansı erişilebilir fiyatlarla sunan akıllı telefonlar, akıllı ev ekosistemleri ve giyilebilir teknolojiler üreten global teknoloji markası.",
    en: "A global technology brand producing smartphones, smart home ecosystems, and wearable tech, offering high performance at accessible prices."
  },
  "Dyson": {
    tr: "Hava katlama teknolojisi, kablosuz süpürgeler ve saç şekillendiriciler alanında devrimsel tasarımlar üreten İngiliz teknoloji ve mühendislik şirketi.",
    en: "A British technology and engineering company producing revolutionary designs in air multiplier tech, cordless vacuums, and hair stylers."
  },
  "Roborock": {
    tr: "Gelişmiş LiDAR haritalama, yapay zeka navigasyonu ve üstün paspaslama özellikleriyle akıllı robot süpürge pazarında lider marka.",
    en: "A leading brand in the smart robot vacuum market with advanced LiDAR mapping, AI navigation, and superior mopping capabilities."
  },
  "Delonghi": {
    tr: "İtalyan zarafetini kahve tutkusuyla birleştiren, özellikle tam otomatik espresso makineleriyle tanınan premium ev aletleri üreticisi.",
    en: "A premium home appliance manufacturer combining Italian elegance with passion for coffee, especially known for fully automatic espresso machines."
  },
  "Sage": {
    tr: "Evde profesyonel kalitede kahve deneyimi sunan yarı otomatik espresso makineleri ve akıllı mutfak aletleriyle tanınan lider marka.",
    en: "A leading brand known for semi-automatic espresso machines and smart kitchen appliances offering a professional quality coffee experience at home."
  },
  "Philips": {
    tr: "Sağlık teknolojilerinden kişisel bakıma, tam otomatik kahve makinelerinden ev aletlerine uzanan geniş ürün gamıyla güvenilir küresel üretici.",
    en: "A reliable global manufacturer with a wide product range spanning from health tech to personal care, fully automatic coffee machines, and home appliances."
  },
  "Chicco": {
    tr: "Bebek arabaları, oto koltukları ve bebek bakım ürünleriyle nesillerdir anne-babaların en büyük yardımcısı olan dünyaca ünlü İtalyan markası.",
    en: "A world-famous Italian brand which has been parents' biggest helper for generations with strollers, car seats, and baby care products."
  },
  "Kraft": {
    tr: "Dayanıklı malzeme kalitesi ve pratik kullanım sunan bebek arabaları, park yataklar ve çocuk güvenlik ekipmanlarıyla bilinen popüler marka.",
    en: "A popular brand known for baby strollers, playards, and children's safety equipment offering durable material quality and practical usage."
  },
  "Drolldoggie": {
    tr: "Evcil hayvanların konforu ve eğlencesi için yenilikçi oyuncaklar, ergonomik tasmalar ve akıllı besleme üniteleri geliştiren marka.",
    en: "A brand developing innovative toys, ergonomic collars, and smart feeding units for the comfort and entertainment of pets."
  }
};

// Drifting stars fly-through space effect
const DriftingStars = () => {
  const stars = React.useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2.2 + 1.2, // 1.2px to 3.4px
      left: Math.random() * 100,
      duration: Math.random() * 25 + 15, // 15s to 40s
      delay: Math.random() * -30,
    }));
  }, []);

  return (
    <div className="starfield-container">
      {stars.map(star => (
        <div
          key={star.id}
          className="drifting-star"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: `${star.left}%`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

// Glowing floating planets/nodes in the background
const FloatingPlanets = () => {
  return (
    <div className="planets-container">
      <div className="floating-planet planet-purple" />
      <div className="floating-planet planet-teal" />
      <div className="floating-planet planet-blue" />
    </div>
  );
};

// Render background logic constellations (constellation SVG structures circled in red)
const BackgroundConstellations = () => {
  return (
    <div className="constellations-container">
      {/* Constellation 1: Far Left (Complex network of nodes) */}
      <svg className="constellation-svg const-left" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Animated glowing flow lines */}
        <path className="constellation-flow-line" d="M50,60 L120,160 M120,160 L70,260 M70,260 L230,280 M230,280 L250,120 M250,120 L170,70 M170,70 L50,60" stroke="rgba(34, 211, 238, 0.35)" strokeWidth="1.5" />
        {/* Static background lines */}
        <path d="M50,60 L120,160 M120,160 L70,260 M70,260 L230,280 M230,280 L250,120 M250,120 L170,70 M170,70 L50,60" stroke="rgba(34, 211, 238, 0.08)" strokeWidth="1" />
        <path d="M50,60 L250,120 M170,70 L120,160 M120,160 L250,120 M120,160 L230,280 M70,260 L250,120" stroke="rgba(34, 211, 238, 0.06)" strokeWidth="0.8" strokeDasharray="2 2" />
        
        {/* Node circles */}
        <circle cx="50" cy="60" r="3.5" fill="#22d3ee" style={{ filter: 'url(#glow-effect)' }} />
        <circle cx="120" cy="160" r="3" fill="#22d3ee" style={{ filter: 'url(#glow-effect)' }} />
        <circle cx="70" cy="260" r="4" fill="#a855f7" style={{ filter: 'url(#glow-effect)' }} />
        <circle cx="230" cy="280" r="3" fill="#22d3ee" style={{ filter: 'url(#glow-effect)' }} />
        <circle cx="250" cy="120" r="4" fill="#a855f7" style={{ filter: 'url(#glow-effect)' }} />
        <circle cx="170" cy="70" r="3.5" fill="#22d3ee" style={{ filter: 'url(#glow-effect)' }} />
      </svg>

      {/* Constellation 2: Far Right Top (Elongated triangle pattern) */}
      <svg className="constellation-svg const-right-top" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path className="constellation-flow-line" d="M30,140 L150,80 M150,80 L260,40 M260,40 L220,220 M220,220 L110,150 M110,150 L30,140" stroke="rgba(34, 211, 238, 0.35)" strokeWidth="1.5" />
        <path d="M30,140 L150,80 M150,80 L260,40 M260,40 L220,220 M220,220 L110,150 M110,150 L30,140" stroke="rgba(34, 211, 238, 0.08)" strokeWidth="1" />
        <path d="M150,80 L220,220 M30,140 L220,220 M110,150 L150,80" stroke="rgba(34, 211, 238, 0.06)" strokeWidth="0.8" strokeDasharray="3 3" />
        
        <circle cx="30" cy="140" r="3.5" fill="#22d3ee" />
        <circle cx="150" cy="80" r="4" fill="#a855f7" />
        <circle cx="260" cy="40" r="3.5" fill="#22d3ee" />
        <circle cx="220" cy="220" r="4" fill="#a855f7" />
        <circle cx="110" cy="150" r="3" fill="#22d3ee" />
      </svg>

      {/* Constellation 3: Far Right Bottom (Smaller triangular structure) */}
      <svg className="constellation-svg const-right-bottom" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path className="constellation-flow-line" d="M30,120 L140,60 M140,60 L160,150 M160,150 L30,120" stroke="rgba(34, 211, 238, 0.35)" strokeWidth="1.5" />
        <path d="M30,120 L140,60 M140,60 L160,150 M160,150 L30,120" stroke="rgba(34, 211, 238, 0.08)" strokeWidth="1" />
        <path d="M90,110 L30,120 M90,110 L140,60 M90,110 L160,150" stroke="rgba(34, 211, 238, 0.06)" strokeWidth="0.8" />
        
        <circle cx="30" cy="120" r="4" fill="#a855f7" />
        <circle cx="140" cy="60" r="3.5" fill="#22d3ee" />
        <circle cx="160" cy="150" r="3.5" fill="#22d3ee" />
        <circle cx="90" cy="110" r="3" fill="#22d3ee" />
      </svg>
    </div>
  );
};

const ReviewCard = ({ review }) => {
  const [likes, setLikes] = React.useState(review.likes || 0);
  const [hearts, setHearts] = React.useState(review.hearts || 0);
  const [hasLiked, setHasLiked] = React.useState(false);
  const [hasHearted, setHasHearted] = React.useState(false);

  const handleLike = () => {
    if (hasLiked) {
      setLikes(likes - 1);
      setHasLiked(false);
    } else {
      setLikes(likes + 1);
      setHasLiked(true);
    }
  };

  const handleHeart = () => {
    if (hasHearted) {
      setHearts(hearts - 1);
      setHasHearted(false);
    } else {
      setHearts(hearts + 1);
      setHasHearted(true);
    }
  };

  return (
    <div className={`glass-panel review-card ${review.type === 'editor' ? 'editor-review-card' : ''}`}>
      <div className="review-card-header">
        <img src={review.avatar} alt={review.author} className="reviewer-avatar" />
        <div className="reviewer-info">
          <div className="reviewer-name-row">
            <span className="reviewer-name">{review.author}</span>
            <span className={`reviewer-badge ${review.type}`}>{review.role}</span>
          </div>
          <div className="review-date">{review.date}</div>
        </div>
      </div>
      
      <div className="review-rating-row">
        {Array.from({ length: 5 }).map((_, i) => (
          <span 
            key={i} 
            className={`star-icon ${i < review.rating ? 'active' : ''}`}
          >
            ★
          </span>
        ))}
      </div>

      <div className="review-content">
        {review.content}
      </div>

      <div className="review-actions">
        <button 
          className={`btn-reaction like-btn ${hasLiked ? 'active' : ''}`} 
          onClick={handleLike}
        >
          👍 {likes}
        </button>
        <button 
          className={`btn-reaction heart-btn ${hasHearted ? 'active' : ''}`} 
          onClick={handleHeart}
        >
          ❤️ {hearts}
        </button>
      </div>
    </div>
  );
};

const getGoogleBooksSearchLink = (term, type = 'any') => {
  if (!term) return '#';
  let prefix = '';
  const cleanType = String(type).toLowerCase();
  if (cleanType === 'author' || cleanType === 'translator') prefix = 'inauthor:';
  else if (cleanType === 'publisher') prefix = 'inpublisher:';
  else if (cleanType === 'title') prefix = 'intitle:';
  else if (cleanType === 'isbn') prefix = 'isbn:';
  return `https://books.google.com/books?q=${encodeURIComponent(prefix + term)}`;
};

const getGlobalAmazonSearchLink = (term) => {
  if (!term) return '#';
  return `https://www.amazon.com/s?k=${encodeURIComponent(term)}&i=stripbooks`;
};

const getAmazonSearchLink = (term, lang = 'en') => {
  if (!term) return '#';
  const domain = lang === 'tr' ? 'amazon.com.tr' : 'amazon.com';
  return `https://www.${domain}/s?k=${encodeURIComponent(term)}`;
};

const KitapyurduBookPanel = ({ product, lang, t, slot, navigateTo }) => {
  if (!product || product.category !== "Books & Lifestyle") {
    return (
      <div className="glass-panel book-details-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        {lang === 'tr' ? 'Seçilen ürün bir kitap değil.' : 'Selected product is not a book.'}
      </div>
    );
  }

  // Generates dummy but realistic statistics based on product ID
  const seed = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const salesCount = (seed * 47) % 50000 + 1200;
  const listPrice = (seed % 15) + 14.99;
  const globalPrice = listPrice * 0.8;
  const kindlePrice = globalPrice * 0.75;
  
  const okuyacagim = (seed * 3) % 20000 + 1200;
  const okuyorum = (seed * 7) % 5000 + 200;
  const okudum = (seed * 11) % 40000 + 3500;

  return (
    <div className={`glass-panel book-details-panel kitapyurdu-design slot-${slot}-border`}>
      {/* Title & Author Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.8rem' }}>
        <h4 className="book-title" style={{ margin: '0 0 0.5rem 0', cursor: 'pointer' }} onClick={() => navigateTo('product-detail', { productId: product.id })}>
          <span className="product-title-link">
            {product.name}
          </span>
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
          <span className="book-author" style={{ color: 'var(--accent-cyan)', display: 'inline-flex', gap: '0.25rem' }}>
            <strong>{t.Author || 'Author'}:</strong>{' '}
            <span 
              style={{ cursor: 'pointer' }}
              className="link-style"
              onClick={() => navigateTo('author-detail', { authorName: product.specs.Author })}
            >
              {product.specs.Author}
            </span>
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', gap: '0.25rem' }}>
            <strong>{t.Publisher || 'Publisher'}:</strong>{' '}
            <span 
              style={{ cursor: 'pointer' }}
              className="link-style"
              onClick={() => navigateTo('publisher-detail', { publisherBrand: product.specs.Publisher })}
            >
              {product.specs.Publisher}
            </span>
          </span>
        </div>
        
        {/* Rating Stars */}
        <div className="kitapyurdu-rating-stars" style={{ display: 'flex', gap: '0.15rem', marginTop: '0.5rem' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="star-icon active" style={{ fontSize: '1.1rem', color: '#eab308' }}>★</span>
          ))}
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: '0.5rem', alignSelf: 'center' }}>(5.0)</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="kitapyurdu-main-grid">
        {/* Left Col: Cover & Action Links */}
        <div className="kitapyurdu-left-col">
          <div className="book-covers-row" style={{ justifyContent: 'center' }}>
            {product.frontCover && (
              <div className="book-cover-wrapper front">
                <img src={product.frontCover} alt={`${product.name} Cover`} className="book-cover-image" />
                <span className="cover-badge">{lang === 'tr' ? 'Kapak Resmi' : 'Book Cover'}</span>
              </div>
            )}
          </div>
          
          {/* Action links */}
          <div className="kitapyurdu-sidebar-links">
            <a href={getGoogleBooksSearchLink(product.name, 'title')} target="_blank" rel="noopener noreferrer" className="kitapyurdu-sidebar-link">
              📖 {lang === 'tr' ? 'Google Books\'ta Gör' : 'See on Google Books'}
            </a>
            <a href={`https://www.goodreads.com/search?q=${encodeURIComponent(product.specs.Author + ' ' + product.name)}`} target="_blank" rel="noopener noreferrer" className="kitapyurdu-sidebar-link">
              💬 {lang === 'tr' ? `Goodreads İncelemeleri` : `Goodreads Reviews`}
            </a>
            <a href="#share" className="kitapyurdu-sidebar-link" onClick={e => e.preventDefault()}>
              🔗 {lang === 'tr' ? 'Paylaş' : 'Share'}
            </a>
          </div>

          <div className="kitapyurdu-social-icons">
            <button className="kitapyurdu-icon-btn">f</button>
            <button className="kitapyurdu-icon-btn">t</button>
            <button className="kitapyurdu-icon-btn">p</button>
            <button className="kitapyurdu-icon-btn">ig</button>
          </div>
        </div>

        {/* Middle Col: Summary & Metadata */}
        <div className="kitapyurdu-middle-col">
          {product.description && (
            <div className="book-summary-box" style={{ margin: 0, maxHeight: '140px' }}>
              <div className="summary-title">{t.backCoverText || 'Back Cover Summary'}</div>
              <div className="summary-content" style={{ fontSize: '0.82rem' }}>{product.description}</div>
            </div>
          )}

          {/* Specs List */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ margin: 0, width: '100%', fontSize: '0.82rem', background: 'transparent', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '0.3rem 0.5rem', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.03)', width: '35%' }}>
                    {lang === 'tr' ? 'Liste Fiyatı' : 'List Price'}:
                  </td>
                  <td style={{ padding: '0.3rem 0.5rem', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.03)', textDecoration: 'line-through' }}>
                    ${listPrice.toFixed(2)}
                  </td>
                </tr>
                {Object.entries(product.specs).map(([specKey, specVal]) => {
                  if (specKey === 'Author' || specKey === 'Publisher') return null; // already shown in header
                  
                  const isTranslator = specKey === 'Translator';
                  const isISBN = specKey === 'ISBN';
                  
                  return (
                    <tr key={specKey}>
                      <td style={{ padding: '0.3rem 0.5rem', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        {t[specKey] || specKey}:
                      </td>
                      <td style={{ padding: '0.3rem 0.5rem', color: '#ffffff', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        {isTranslator || isISBN ? (
                          <a href={getGoogleBooksSearchLink(specVal, specKey.toLowerCase())} target="_blank" rel="noopener noreferrer" className="spec-link">
                            {specVal}
                          </a>
                        ) : (
                          specVal
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="kitapyurdu-sales-notice">
            🔥 {lang === 'tr' ? `Bu eser küresel çapta ${salesCount.toLocaleString('tr-TR')} adet oylanmıştır.` : `This book has received over ${salesCount.toLocaleString('en-US')} global ratings.`}
          </div>

          {/* Related Categories */}
          <div className="kitapyurdu-categories">
            <div className="kitapyurdu-categories-title">{lang === 'tr' ? 'İlgili Kategoriler' : 'Related Categories'}:</div>
            <div className="kitapyurdu-category-row">
              <a href={getGoogleBooksSearchLink('Books')} target="_blank" rel="noopener noreferrer" className="spec-link">Books</a>
              <span className="kitapyurdu-crumb-arrow">&gt;</span>
              <a href={getGoogleBooksSearchLink('Literature')} target="_blank" rel="noopener noreferrer" className="spec-link">Literature</a>
              <span className="kitapyurdu-crumb-arrow">&gt;</span>
              <a href={getGoogleBooksSearchLink('Fiction')} target="_blank" rel="noopener noreferrer" className="spec-link">Fiction & Novels</a>
            </div>
            <div className="kitapyurdu-category-row" style={{ marginTop: '0.2rem' }}>
              <a href={getGoogleBooksSearchLink('Books')} target="_blank" rel="noopener noreferrer" className="spec-link">Books</a>
              <span className="kitapyurdu-crumb-arrow">&gt;</span>
              <a href={getGoogleBooksSearchLink('Original Language')} target="_blank" rel="noopener noreferrer" className="spec-link">Original Language</a>
              <span className="kitapyurdu-crumb-arrow">&gt;</span>
              <a href={getGoogleBooksSearchLink(product.specs.Language || 'English')} target="_blank" rel="noopener noreferrer" className="spec-link">
                {product.specs.Language || (lang === 'tr' ? 'İngilizce' : 'English')}
              </a>
            </div>
          </div>
        </div>

        {/* Right Col: Price Card & Actions */}
        <div className="kitapyurdu-right-col">
          <div className="kitapyurdu-price-card">
            <span className="kitapyurdu-price-title">{lang === 'tr' ? 'Küresel Satış Fiyatı' : 'Global Market Price'}</span>
            <span className="kitapyurdu-price-value">${globalPrice.toFixed(2)}</span>
            
            <div style={{ marginTop: '0.2rem' }}>
              <span className="kitapyurdu-delivery-badge">
                ⚡ {lang === 'tr' ? 'Hızlı Kargo' : 'Express Delivery'}
              </span>
            </div>

            <a href={getGlobalAmazonSearchLink(`${product.specs.Author} ${product.name}`)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button className="btn-add-to-cart">
                🛒 {lang === 'tr' ? 'Amazon Mağazası' : 'Buy on Amazon'}
              </button>
            </a>
          </div>

          {/* Kindle special price */}
          <div className="kitapyurdu-platin-box">
            <span className="kitapyurdu-platin-label">
              <span className="kitapyurdu-platin-badge" style={{ background: 'linear-gradient(90deg, #0284c7, #0369a1)' }}>Kindle</span>
              <span>{lang === 'tr' ? 'Dijital Fiyatı' : 'E-Book Price'}:</span>
            </span>
            <span className="kitapyurdu-platin-price">${kindlePrice.toFixed(2)}</span>
          </div>

          {/* Action Links */}
          <div className="kitapyurdu-sidebar-links" style={{ background: 'transparent', padding: '0.2rem 0' }}>
            <a href={`https://www.goodreads.com/search?q=${encodeURIComponent(product.specs.Author + ' ' + product.name)}`} target="_blank" rel="noopener noreferrer" className="kitapyurdu-sidebar-link">
              ❤️ Goodreads {lang === 'tr' ? 'Listesine Ekle' : 'Add to Shelf'}
            </a>
            <a href={getGoogleBooksSearchLink(product.name, 'title')} target="_blank" rel="noopener noreferrer" className="kitapyurdu-sidebar-link">
              🔔 {lang === 'tr' ? 'Fiyat Alarmı (Google)' : 'Google Price Alert'}
            </a>
          </div>

          {/* Price History Sparkline */}
          <div className="kitapyurdu-sparkline-container">
            <span className="kitapyurdu-sparkline-title">{lang === 'tr' ? 'Fiyat Geçmişi' : 'Price Trend'}</span>
            <svg viewBox="0 0 100 25" style={{ width: '100%', height: '25px', overflow: 'visible' }}>
              <path 
                d="M0,20 L15,18 L30,19 L45,15 L60,16 L75,10 L90,12 L100,5" 
                fill="none" 
                stroke="#fbbf24" 
                strokeWidth="1.8" 
                strokeLinecap="round"
                strokeLinejoin="round" 
              />
              <circle cx="100" cy="5" r="2.5" fill="#fbbf24" />
            </svg>
          </div>

          {/* Reading lists */}
          <div className="kitapyurdu-reading-lists">
            <div className="kitapyurdu-reading-title">{lang === 'tr' ? 'Goodreads İstatistikleri' : 'Goodreads Lists'}:</div>
            <div className="kitapyurdu-reading-item">
              <span>📚 {lang === 'tr' ? 'Okumak İsteyenler' : 'Want to Read'}</span>
              <span className="kitapyurdu-reading-val">{okuyacagim.toLocaleString()}</span>
            </div>
            <div className="kitapyurdu-reading-item">
              <span>📖 {lang === 'tr' ? 'Şu An Okuyanlar' : 'Currently Reading'}</span>
              <span className="kitapyurdu-reading-val">{okuyorum.toLocaleString()}</span>
            </div>
            <div className="kitapyurdu-reading-item">
              <span>✅ {lang === 'tr' ? 'Okumuş Olanlar' : 'Read'}</span>
              <span className="kitapyurdu-reading-val">{okudum.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const renderSpecValue = (val, specKey, product, lang, navigateTo) => {
  if (!val || val === 'N/A') return 'N/A';
  if (product?.category === 'Books & Lifestyle') {
    if (specKey === 'Author') {
      return (
        <span 
          style={{ cursor: 'pointer' }}
          className="spec-link"
          onClick={() => navigateTo('author-detail', { authorName: val })}
        >
          {val}
        </span>
      );
    }
    if (specKey === 'Publisher') {
      return (
        <span 
          style={{ cursor: 'pointer' }}
          className="spec-link"
          onClick={() => navigateTo('publisher-detail', { publisherBrand: val })}
        >
          {val}
        </span>
      );
    }
    if (['Translator', 'ISBN'].includes(specKey)) {
      return val;
    }
  } else {
    if (['Brand', 'brand'].includes(specKey)) {
      return (
        <span 
          style={{ cursor: 'pointer' }}
          className="spec-link"
          onClick={() => navigateTo('publisher-detail', { publisherBrand: val })}
        >
          {val}
        </span>
      );
    }
  }
  return val;
};

function App() {
  const [products, setProducts] = useState(mockProducts);

  const getAmazonLink = (product) => {
    if (!product) return '#';
    const query = `${product.brand} ${product.name}`;
    const domain = lang === 'tr' ? 'amazon.com.tr' : 'amazon.com';
    return `https://www.${domain}/s?k=${encodeURIComponent(query)}`;
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteList, setAutocompleteList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Translation state
  const [lang, setLang] = useState('en'); // Defaults to 'en' (English mockup)
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  
  // Mobile nav drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active compared products (supports up to 5 items)
  const [comparedIds, setComparedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('comparedIds');
      return saved ? JSON.parse(saved) : ['iphone-15-pro-max', 'galaxy-s24-ultra'];
    } catch (e) {
      return ['iphone-15-pro-max', 'galaxy-s24-ultra'];
    }
  });
  
  const [currentView, setCurrentView] = useState('compare'); // 'compare', 'admin', 'product-detail', 'author-detail', 'publisher-detail'
  const [activeProductId, setActiveProductId] = useState(null);
  const [activeAuthorName, setActiveAuthorName] = useState(null);
  const [activePublisherBrand, setActivePublisherBrand] = useState(null);
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const navigateTo = (view, params = {}) => {
    setNavigationHistory(prev => [
      ...prev,
      {
        view: currentView,
        productId: activeProductId,
        authorName: activeAuthorName,
        publisherBrand: activePublisherBrand
      }
    ]);
    
    if (params.productId !== undefined) setActiveProductId(params.productId);
    if (params.authorName !== undefined) setActiveAuthorName(params.authorName);
    if (params.publisherBrand !== undefined) setActivePublisherBrand(params.publisherBrand);
    
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateBack = () => {
    if (navigationHistory.length === 0) {
      setCurrentView('compare');
      return;
    }
    
    const prev = navigationHistory[navigationHistory.length - 1];
    setNavigationHistory(prevHistory => prevHistory.slice(0, -1));
    
    setCurrentView(prev.view);
    setActiveProductId(prev.productId);
    setActiveAuthorName(prev.authorName);
    setActivePublisherBrand(prev.publisherBrand);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setActiveProductId(null);
    setActiveAuthorName(null);
    setActivePublisherBrand(null);
    setNavigationHistory([]);
    setCurrentView('compare');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Comparison drawer enhancements states
  const [isDrawerMinimized, setIsDrawerMinimized] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [hoveredProductRect, setHoveredProductRect] = useState(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);

  // Sidebar filters states
  const [activeFilters, setActiveFilters] = useState({
    brands: [],
    authors: [],
    genres: [],
    bindings: [],
    series: [],
    storage: [],
    ram: [],
    processors: [],
    types: [],
    pressures: [],
    materials: [],
    runtimes: [],
    // New customized category filters
    screenSizes: [],
    os: [],
    grinders: [],
    suctionPowers: [],
    dustCapacities: [],
    weightCapacities: [],
    safetyFeatures: [],
    pageCounts: [],
    ingredients: []
  });
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [authorSearchQuery, setAuthorSearchQuery] = useState('');
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);

  // Book genre helper
  const getBookGenre = React.useCallback((title) => {
    const lower = title.toLowerCase();
    
    // Sociology & Philosophy (Sosyoloji & Felsefe)
    if (
      lower.includes("karakter aşınması") ||
      lower.includes("hayvan çiftliği") ||
      lower.includes("1984") ||
      lower.includes("cesur yeni dünya") ||
      lower.includes("yabancı") ||
      lower.includes("dönüşüm")
    ) {
      return lang === 'tr' ? "Sosyoloji & Felsefe" : "Sociology & Philosophy";
    }
    
    // History & Research (Tarih & Araştırma)
    if (
      lower.includes("sapiens") ||
      lower.includes("saatleri ayarlama") ||
      lower.includes("kritik kararlar")
    ) {
      return lang === 'tr' ? "Tarih & Araştırma" : "History & Research";
    }
    
    // Personal Development & Psychology (Kişisel Gelişim & Psikoloji)
    if (
      lower.includes("zengin") ||
      lower.includes("baba") ||
      lower.includes("alışkanlık") ||
      lower.includes("etkili") ||
      lower.includes("sır") ||
      lower.includes("düşün ve") ||
      lower.includes("hızlı ve yavaş") ||
      lower.includes("zar adam")
    ) {
      return lang === 'tr' ? "Kişisel Gelişim & Psikoloji" : "Personal Development & Psychology";
    }
    
    // Default: Roman & Edebiyat / Novel & Literature
    return lang === 'tr' ? "Roman & Edebiyat" : "Novel & Literature";
  }, [lang]);

  // Book page count parser helper
  const getBookPageCountGroup = React.useCallback((pagesStr) => {
    if (!pagesStr) return null;
    const num = parseInt(pagesStr);
    if (isNaN(num)) return null;
    if (num < 150) return lang === 'tr' ? "Kısa (< 150 Sayfa)" : "Short (< 150 pages)";
    if (num <= 300) return lang === 'tr' ? "Orta (150 - 300 Sayfa)" : "Medium (150 - 300 pages)";
    return lang === 'tr' ? "Uzun (> 300 Sayfa)" : "Long (> 300 pages)";
  }, [lang]);

  // Screen size parser helper
  const getScreenSizeGroup = React.useCallback((displayStr, isLaptop) => {
    if (!displayStr) return null;
    const match = displayStr.match(/([0-9.]+)\s*-?\s*(inch|inç|")/i);
    if (!match) return null;
    const size = parseFloat(match[1]);
    if (isNaN(size)) return null;
    
    if (isLaptop) {
      if (size < 14) return lang === 'tr' ? "Küçük (< 14 inç)" : "Small (< 14\")";
      if (size <= 15.6) return lang === 'tr' ? "Standart (14 - 15.6 inç)" : "Standard (14\" - 15.6\")";
      return lang === 'tr' ? "Büyük (> 15.6 inç)" : "Large (> 15.6\")";
    } else {
      if (size < 6.2) return lang === 'tr' ? "Küçük (< 6.2 inç)" : "Small (< 6.2\")";
      if (size <= 6.7) return lang === 'tr' ? "Orta (6.2 inç - 6.7 inç)" : "Medium (6.2\" - 6.7\")";
      return lang === 'tr' ? "Büyük (> 6.7 inç)" : "Large (> 6.7\")";
    }
  }, [lang]);

  // Suction power parser helper
  const getSuctionPowerGroup = React.useCallback((suctionStr) => {
    if (!suctionStr) return null;
    const match = suctionStr.match(/([0-9.]+)\s*(aw|pa)/i);
    if (!match) return null;
    const num = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    if (isNaN(num)) return null;
    
    if (unit === 'aw') {
      if (num >= 240) return lang === 'tr' ? "Yüksek Güç (> 240 AW / > 5000 Pa)" : "High Power (> 240 AW / > 5000 Pa)";
      return lang === 'tr' ? "Standart Güç (< 240 AW / < 5000 Pa)" : "Standard Power (< 240 AW / < 5000 Pa)";
    } else {
      if (num >= 5000) return lang === 'tr' ? "Yüksek Güç (> 240 AW / > 5000 Pa)" : "High Power (> 240 AW / > 5000 Pa)";
      return lang === 'tr' ? "Standart Güç (< 240 AW / < 5000 Pa)" : "Standard Power (< 240 AW / < 5000 Pa)";
    }
  }, [lang]);

  // Dust capacity parser helper
  const getDustCapacityGroup = React.useCallback((binStr) => {
    if (!binStr) return null;
    const match = binStr.match(/([0-9.]+)\s*l/i);
    if (!match) return null;
    const val = parseFloat(match[1]);
    if (isNaN(val)) return null;
    
    if (val < 0.5) return lang === 'tr' ? "Küçük (< 0.5 L)" : "Small (< 0.5 L)";
    if (val <= 0.75) return lang === 'tr' ? "Orta (0.5 L - 0.75 L)" : "Medium (0.5 L - 0.75 L)";
    return lang === 'tr' ? "Geniş (> 0.75 L)" : "Large (> 0.75 L)";
  }, [lang]);

  // Grinder helper
  const getGrinderGroup = React.useCallback((grinderStr) => {
    if (!grinderStr || grinderStr === 'N/A' || grinderStr.toLowerCase() === 'n/a') {
      return lang === 'tr' ? "Yok" : "No";
    }
    return lang === 'tr' ? "Var" : "Yes";
  }, [lang]);

  // Baby product features helper
  const getBabySafetyFeatures = React.useCallback((product) => {
    const features = [];
    const textToSearch = [
      product.name,
      product.specs.Material,
      product.specs.Connectivity,
      product.specs.Display,
      product.specs.OS
    ].join(' ').toLowerCase();
    
    if (textToSearch.includes('isofix')) {
      features.push(lang === 'tr' ? "ISOFIX Güvenlik Desteği" : "ISOFIX Safety Support");
    }
    if (textToSearch.includes('360') || textToSearch.includes('rotating') || textToSearch.includes('dönebilen')) {
      features.push(lang === 'tr' ? "360° Dönebilen" : "360° Rotating");
    }
    if (textToSearch.includes('folded') || textToSearch.includes('cabin') || textToSearch.includes('kabin') || textToSearch.includes('katlanabilir')) {
      features.push(lang === 'tr' ? "Kabin Boy / Katlanabilir" : "Cabin Size / Foldable");
    }
    if (textToSearch.includes('wi-fi') || textToSearch.includes('wifi')) {
      features.push(lang === 'tr' ? "Wi-Fi Bağlantılı" : "Wi-Fi Connected");
    }
    return features;
  }, [lang]);

  // Baby product weight capacity helper
  const getBabyWeightCapacityGroup = React.useCallback((capStr) => {
    if (!capStr) return lang === 'tr' ? "Diğer / Yok" : "Other / None";
    const lower = capStr.toLowerCase();
    if (lower.includes('22 kg')) {
      return lang === 'tr' ? "22 kg'a kadar" : "Up to 22 kg";
    }
    if (lower.includes('18 kg') || lower.includes('9 - 18') || lower.includes('9-18')) {
      return lang === 'tr' ? "9 - 18 kg" : "9 - 18 kg";
    }
    return lang === 'tr' ? "Diğer / Yok" : "Other / None";
  }, [lang]);

  // Pet care ingredients helper
  const getPetIngredientsMaterialGroups = React.useCallback((product) => {
    const groups = [];
    const text = [
      product.name,
      product.specs.Material,
      product.specs.Type
    ].join(' ').toLowerCase();
    
    if (text.includes('chicken') || text.includes('tavuk') || text.includes('poultry') || text.includes('et') || text.includes('beef')) {
      groups.push(lang === 'tr' ? "Tavuklu / Etli" : "Chicken & Meat");
    }
    if (text.includes('fish') || text.includes('balık') || text.includes('salmon') || text.includes('somon')) {
      groups.push(lang === 'tr' ? "Balıklı" : "Fish & Seafood");
    }
    if (text.includes('steel') || text.includes('çelik') || text.includes('metal')) {
      groups.push(lang === 'tr' ? "Çelik / Metal" : "Stainless Steel");
    }
    if (text.includes('plastic') || text.includes('plastik') || text.includes('bpa-free') || text.includes('abs')) {
      groups.push(lang === 'tr' ? "Plastik / BPA-free" : "BPA-free / Plastic");
    }
    return groups;
  }, [lang]);

  // Pet product type group helper
  const getPetProductTypeGroup = React.useCallback((typeStr) => {
    if (!typeStr) return null;
    const lower = typeStr.toLowerCase();
    if (lower.includes('food') || lower.includes('mama')) {
      return lang === 'tr' ? "Kuru & Yaş Mama" : "Dry & Wet Food";
    }
    if (lower.includes('feeder') || lower.includes('fountain') || lower.includes('yemlik') || lower.includes('kapları') || lower.includes('ekipman')) {
      return lang === 'tr' ? "Akıllı Ekipmanlar" : "Smart Devices";
    }
    if (lower.includes('paste') || lower.includes('macun') || lower.includes('sağlık')) {
      return lang === 'tr' ? "Malt & Sağlık" : "Paste & Health";
    }
    return lang === 'tr' ? "Diğer Aksesuar" : "Other Accessories";
  }, [lang]);

  // Clear all filters
  const clearAllFilters = React.useCallback(() => {
    setActiveFilters({
      brands: [],
      authors: [],
      genres: [],
      bindings: [],
      series: [],
      storage: [],
      ram: [],
      processors: [],
      types: [],
      pressures: [],
      materials: [],
      runtimes: [],
      screenSizes: [],
      os: [],
      grinders: [],
      suctionPowers: [],
      dustCapacities: [],
      weightCapacities: [],
      safetyFeatures: [],
      pageCounts: [],
      ingredients: []
    });
    setBrandSearchQuery('');
    setAuthorSearchQuery('');
  }, []);

  // Reset filters when selected category changes
  useEffect(() => {
    clearAllFilters();
  }, [selectedCategory, clearAllFilters]);

  // Extract available filter values based on active category
  const availableFilterOptions = React.useMemo(() => {
    const categoryProds = selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory);
    
    const options = {
      brands: Array.from(new Set(categoryProds.map(p => p.brand).filter(Boolean))).sort(),
      authors: [],
      genres: [],
      bindings: [],
      series: [],
      storage: [],
      ram: [],
      processors: [],
      types: [],
      pressures: [],
      materials: [],
      runtimes: [],
      screenSizes: [],
      os: [],
      grinders: [],
      suctionPowers: [],
      dustCapacities: [],
      weightCapacities: [],
      safetyFeatures: [],
      pageCounts: [],
      ingredients: []
    };

    if (selectedCategory === 'Books & Lifestyle') {
      options.authors = Array.from(new Set(categoryProds.map(p => p.specs.Author).filter(Boolean))).sort();
      options.genres = lang === 'tr' 
        ? ["Roman & Edebiyat", "Kişisel Gelişim & Psikoloji", "Tarih & Araştırma", "Sosyoloji & Felsefe"] 
        : ["Novel & Literature", "Personal Development & Psychology", "History & Research", "Sociology & Philosophy"];
      options.bindings = Array.from(new Set(categoryProds.map(p => p.specs.Binding).filter(Boolean))).sort();
      options.pageCounts = lang === 'tr'
        ? ["Kısa (< 150 Sayfa)", "Orta (150 - 300 Sayfa)", "Uzun (> 300 Sayfa)"]
        : ["Short (< 150 pages)", "Medium (150 - 300 pages)", "Long (> 300 pages)"];
    } else if (selectedCategory === 'Smartphones') {
      options.series = Array.from(new Set(categoryProds.map(p => p.specs.Series).filter(Boolean))).sort();
      options.storage = ["128 GB", "256 GB", "512 GB", "1 TB"];
      options.ram = ["6 GB", "8 GB", "10 GB", "12 GB", "16 GB"];
      options.screenSizes = lang === 'tr'
        ? ["Küçük (< 6.2 inç)", "Orta (6.2 inç - 6.7 inç)", "Büyük (> 6.7 inç)"]
        : ["Small (< 6.2\")", "Medium (6.2\" - 6.7\")", "Large (> 6.7\")"];
      options.os = ["iOS", "Android"];
    } else if (selectedCategory === 'Laptops') {
      options.series = Array.from(new Set(categoryProds.map(p => p.specs.Series).filter(Boolean))).sort();
      options.processors = ["M3", "M2", "Intel Core i7", "Intel Core i9", "Intel Core Ultra 7", "Ryzen 7", "Ryzen 9"];
      options.ram = ["8 GB", "16 GB", "32 GB", "64 GB"];
      options.screenSizes = lang === 'tr'
        ? ["Küçük (< 14 inç)", "Standart (14 - 15.6 inç)", "Büyük (> 15.6 inç)"]
        : ["Small (< 14\")", "Standard (14\" - 15.6\")", "Large (> 15.6\")"];
      options.os = ["macOS", "Windows"];
    } else if (selectedCategory === 'Home Appliances') {
      options.types = Array.from(new Set(categoryProds.map(p => p.specs.Type).filter(Boolean))).sort();
      options.runtimes = Array.from(new Set(categoryProds.map(p => p.specs['Run Time']).filter(Boolean))).sort();
      options.suctionPowers = lang === 'tr'
        ? ["Yüksek Güç (> 240 AW / > 5000 Pa)", "Standart Güç (< 240 AW / < 5000 Pa)"]
        : ["High Power (> 240 AW / > 5000 Pa)", "Standard Power (< 240 AW / < 5000 Pa)"];
      options.dustCapacities = lang === 'tr'
        ? ["Küçük (< 0.5 L)", "Orta (0.5 L - 0.75 L)", "Geniş (> 0.75 L)"]
        : ["Small (< 0.5 L)", "Medium (0.5 L - 0.75 L)", "Large (> 0.75 L)"];
    } else if (selectedCategory === 'Coffee Gear') {
      options.types = Array.from(new Set(categoryProds.map(p => p.specs.Type).filter(Boolean))).sort();
      options.pressures = Array.from(new Set(categoryProds.map(p => p.specs.Pressure).filter(Boolean))).sort();
      options.grinders = lang === 'tr' ? ["Var", "Yok"] : ["Yes", "No"];
    } else if (selectedCategory === 'Pet Care') {
      options.types = lang === 'tr'
        ? ["Kuru & Yaş Mama", "Akıllı Ekipmanlar", "Malt & Sağlık", "Diğer Aksesuar"]
        : ["Dry & Wet Food", "Smart Devices", "Paste & Health", "Other Accessories"];
      options.ingredients = lang === 'tr'
        ? ["Tavuklu / Etli", "Balıklı", "Çelik / Metal", "Plastik / BPA-free"]
        : ["Chicken & Meat", "Fish & Seafood", "Stainless Steel", "BPA-free / Plastic"];
    } else if (selectedCategory === 'Baby & Children') {
      options.types = Array.from(new Set(categoryProds.map(p => p.specs.Type).filter(Boolean))).sort();
      options.weightCapacities = lang === 'tr'
        ? ["22 kg'a kadar", "9 - 18 kg", "Diğer / Yok"]
        : ["Up to 22 kg", "9 - 18 kg", "Other / None"];
      options.safetyFeatures = lang === 'tr'
        ? ["ISOFIX Güvenlik Desteği", "360° Dönebilen", "Kabin Boy / Katlanabilir", "Wi-Fi Bağlantılı"]
        : ["ISOFIX Safety Support", "360° Rotating", "Cabin Size / Foldable", "Wi-Fi Connected"];
    }

    return options;
  }, [selectedCategory, products, lang]);

  const filteredBrandsForSidebar = React.useMemo(() => {
    return availableFilterOptions.brands.filter(b => b.toLowerCase().includes(brandSearchQuery.toLowerCase()));
  }, [availableFilterOptions.brands, brandSearchQuery]);

  const filteredAuthorsForSidebar = React.useMemo(() => {
    return availableFilterOptions.authors.filter(a => a.toLowerCase().includes(authorSearchQuery.toLowerCase()));
  }, [availableFilterOptions.authors, authorSearchQuery]);

  const toggleFilter = (filterKey, value) => {
    setActiveFilters(prev => {
      const currentList = prev[filterKey] || [];
      const updatedList = currentList.includes(value)
        ? currentList.filter(item => item !== value)
        : [...currentList, value];
      return { ...prev, [filterKey]: updatedList };
    });
  };

  // Inactivity and hover timer refs
  const drawerInactivityTimerRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const resetDrawerInactivityTimer = React.useCallback(() => {
    if (drawerInactivityTimerRef.current) {
      clearTimeout(drawerInactivityTimerRef.current);
    }
    if (comparedIds.length > 0 && !isDrawerMinimized) {
      drawerInactivityTimerRef.current = setTimeout(() => {
        setIsDrawerMinimized(true);
      }, 60000); // 1 minute (60,000 ms) of inactivity
    }
  }, [comparedIds.length, isDrawerMinimized]);

  useEffect(() => {
    resetDrawerInactivityTimer();
    return () => {
      if (drawerInactivityTimerRef.current) {
        clearTimeout(drawerInactivityTimerRef.current);
      }
    };
  }, [comparedIds, isDrawerMinimized, resetDrawerInactivityTimer]);

  const handleThumbMouseEnter = (prod, e) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredProduct(prod);
    setHoveredProductRect(rect);
  };

  const handleThumbMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredProduct(null);
      setHoveredProductRect(null);
    }, 200); // 200ms delay to move mouse into tooltip
  };

  const handleTooltipMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleTooltipMouseLeave = () => {
    setHoveredProduct(null);
    setHoveredProductRect(null);
  };

  useEffect(() => {
    try {
      localStorage.setItem('comparedIds', JSON.stringify(comparedIds));
    } catch (e) {
      console.error(e);
    }
  }, [comparedIds]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleCompare = (id) => {
    if (comparedIds.includes(id)) {
      setComparedIds(comparedIds.filter(item => item !== id));
    } else {
      if (comparedIds.length >= 5) {
        alert(lang === 'tr' ? 'En fazla 5 ürünü aynı anda karşılaştırabilirsiniz.' : 'You can compare a maximum of 5 products at once.');
        return;
      }
      setComparedIds([...comparedIds, id]);
    }
  };

  const hasDifference = (specKey, productsList) => {
    if (productsList.length <= 1) return false;
    const values = productsList.map(p => p.specs[specKey] !== undefined ? p.specs[specKey].toString().trim().toLowerCase() : 'n/a');
    const firstVal = values[0];
    return values.some(val => val !== firstVal);
  };
  
  // Search state and loaders
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [rateLimitCount, setRateLimitCount] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  
  const searchInputRef = useRef(null);
  const langDropdownRef = useRef(null);

  // Admin form state
  const [newProductName, setNewProductName] = useState('');
  const [newProductBrand, setNewProductBrand] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Smartphones');
  const [newProductBattery, setNewProductBattery] = useState('');
  const [newProductDisplay, setNewProductDisplay] = useState('');
  const [newProductCPU, setNewProductCPU] = useState('');
  const [newProductRAM, setNewProductRAM] = useState('');
  const [newProductStorage, setNewProductStorage] = useState('');
  const [newProductWeight, setNewProductWeight] = useState('');
  const [newProductOS, setNewProductOS] = useState('');
  const [adminStatus, setAdminStatus] = useState('');

  const t = translations[lang] || translations.en;

  const getCompareBtnText = (productId) => {
    const isCompared = comparedIds.includes(productId);
    if (lang === 'tr') {
      return isCompared ? '✓ Karşılaştır' : '+ Karşılaştır';
    }
    if (lang === 'de') {
      return isCompared ? '✓ Vergleichen' : '+ Vergleichen';
    }
    if (lang === 'fr') {
      return isCompared ? '✓ Comparer' : '+ Comparer';
    }
    if (lang === 'es') {
      return isCompared ? '✓ Comparar' : '+ Comparar';
    }
    if (lang === 'it') {
      return isCompared ? '✓ Confronta' : '+ Confronta';
    }
    if (lang === 'pt') {
      return isCompared ? '✓ Comparar' : '+ Comparar';
    }
    if (lang === 'ru') {
      return isCompared ? '✓ Сравнить' : '+ Сравнить';
    }
    if (lang === 'zh') {
      return isCompared ? '✓ 对比' : '+ 对比';
    }
    if (lang === 'ja') {
      return isCompared ? '✓ 比較' : '+ 比較';
    }
    if (lang === 'ar') {
      return isCompared ? '✓ مقارنة' : '+ مقارنة';
    }
    return isCompared ? '✓ Compare' : '+ Compare';
  };

  const findSpecWinner = (specName, prods) => {
    if (prods.length < 2) return -1;
    
    // Lower numerical value is better for Weight
    if (specName === 'Weight' || specName === 'Ağırlık') {
      let minVal = 999999;
      let winnerIdx = -1;
      let hasDifferentValues = false;
      let firstVal = -1;
      prods.forEach((p, idx) => {
        const valStr = p.specs[specName] || '';
        if (!valStr || valStr === 'N/A') return;
        const match = valStr.match(/[0-9.]+/);
        if (match) {
          const valNum = parseFloat(match[0]);
          if (firstVal === -1) {
            firstVal = valNum;
          } else if (valNum !== firstVal) {
            hasDifferentValues = true;
          }
          if (valNum < minVal) {
            minVal = valNum;
            winnerIdx = idx;
          }
        }
      });
      return hasDifferentValues ? winnerIdx : -1;
    }
    
    // Higher numerical value is better for Battery, RAM, Storage, Suction Power, Power, Pages, etc.
    const higherIsBetterSpecs = [
      'Battery', 'Batarya', 'Suction Power', 'Emiş Gücü', 'Power', 'Güç', 'Pages', 'Sayfa Sayısı', 'RAM', 'Storage', 'Depolama', 'Resolution', 'Çözünürlük', 'Run Time', 'Çalışma Süresi'
    ];
    if (higherIsBetterSpecs.includes(specName) || specName.toLowerCase().includes('kapasite') || specName.toLowerCase().includes('capacity')) {
      let maxVal = -1;
      let winnerIdx = -1;
      let hasDifferentValues = false;
      let firstVal = -1;
      prods.forEach((p, idx) => {
        const valStr = p.specs[specName] || '';
        if (!valStr || valStr === 'N/A') return;
        const match = valStr.match(/[0-9]+/);
        if (match) {
          const valNum = parseInt(match[0]) || 0;
          if (firstVal === -1) {
            firstVal = valNum;
          } else if (valNum !== firstVal) {
            hasDifferentValues = true;
          }
          if (valNum > maxVal) {
            maxVal = valNum;
            winnerIdx = idx;
          }
        }
      });
      return hasDifferentValues ? winnerIdx : -1;
    }
    return -1;
  };

  // Auto-cooldown ticker
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => setCooldownTime(cooldownTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  // Click outside listener for the custom language dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete typing logic
  const handleTyping = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (val.trim().length >= 3) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(val.toLowerCase()) || 
        p.brand.toLowerCase().includes(val.toLowerCase())
      );
      setAutocompleteList(filtered.slice(0, 5));
    } else {
      setAutocompleteList([]);
    }
  };

  // Explicit Search Execution
  const triggerSearch = (queryVal = searchQuery) => {
    if (cooldownTime > 0) return;

    // Rate Limit Security: Max 5 searches per 10 seconds
    setRateLimitCount(prev => {
      const nextCount = prev + 1;
      if (nextCount >= 5) {
        setCooldownTime(60); // Block for 60 seconds
        return 0;
      }
      setTimeout(() => setRateLimitCount(c => Math.max(0, c - 1)), 10000);
      return nextCount;
    });

    setIsLoading(true);
    setLoaderProgress(0);
    setAutocompleteList([]);

    // Scroll to results area below cards
    const timer = setTimeout(() => {
      const dynamicArea = document.getElementById('dynamic-console');
      if (dynamicArea) {
        dynamicArea.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);

    // Disable inputs and simulate a 1-second edge database circular loading transition
    const interval = setInterval(() => {
      setLoaderProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          setActiveSearchQuery(queryVal);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const selectSuggestedProduct = (prod) => {
    setAutocompleteList([]);
    setSearchQuery('');
    navigateTo('product-detail', { productId: prod.id });
  };

  // Add Product (Local state mockup)
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProductName || !newProductBrand) {
      setAdminStatus(t.adminErrorMsg);
      return;
    }

    const id = newProductName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newProduct = {
      id,
      name: newProductName,
      brand: newProductBrand,
      category: newProductCategory,
      specs: {
        "Display": newProductDisplay || "N/A",
        "Processor": newProductCPU || "N/A",
        "RAM": newProductRAM || "N/A",
        "Storage": newProductStorage || "N/A",
        "Battery": newProductBattery || "N/A",
        "Main Camera": "N/A",
        "Weight": newProductWeight || "N/A",
        "Charging Speed": "N/A",
        "OS": newProductOS || "N/A"
      },
      scores: {
        performance: Math.floor(Math.random() * 20) + 80,
        camera: Math.floor(Math.random() * 20) + 80,
        battery: Math.floor(Math.random() * 20) + 80,
        value: Math.floor(Math.random() * 20) + 80
      },
      amazonLink: `https://amzn.to/example-${id}`
    };

    setProducts([newProduct, ...products]);
    setAdminStatus(t.adminSuccessMsg);
    
    // Clear Form
    setNewProductName('');
    setNewProductBrand('');
    setNewProductBattery('');
    setNewProductDisplay('');
    setNewProductCPU('');
    setNewProductRAM('');
    setNewProductStorage('');
    setNewProductWeight('');
    setNewProductOS('');

    setTimeout(() => setAdminStatus(''), 4000);
  };

  // Filter products for the showcase grid
  const showcaseFilteredProducts = products.filter(product => {
    // 1. Search Query
    const matchesSearch = searchQuery.trim() === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Selected Category
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    if (!matchesSearch || !matchesCategory) return false;

    // 3. Brand / Publisher filter (for books, brand is the Publisher)
    const matchesBrand = activeFilters.brands.length === 0 || activeFilters.brands.includes(product.brand);
    if (!matchesBrand) return false;

    // 4. Book specific filters
    if (product.category === 'Books & Lifestyle') {
      const matchesAuthor = activeFilters.authors.length === 0 || activeFilters.authors.includes(product.specs.Author);
      const genre = getBookGenre(product.name);
      const matchesGenre = activeFilters.genres.length === 0 || activeFilters.genres.includes(genre);
      const matchesBinding = activeFilters.bindings.length === 0 || activeFilters.bindings.includes(product.specs.Binding);
      
      const pgGrp = getBookPageCountGroup(product.specs.Pages);
      const matchesPage = activeFilters.pageCounts.length === 0 || activeFilters.pageCounts.includes(pgGrp);
      
      if (!matchesAuthor || !matchesGenre || !matchesBinding || !matchesPage) return false;
    }

    // 5. Category-specific specs filters
    if (product.category === 'Smartphones') {
      const matchesSeries = activeFilters.series.length === 0 || activeFilters.series.includes(product.specs.Series);
      const ramVal = product.specs.RAM;
      const matchesRAM = activeFilters.ram.length === 0 || activeFilters.ram.some(r => ramVal && ramVal.includes(r));
      const storageVal = product.specs.Storage;
      const matchesStorage = activeFilters.storage.length === 0 || activeFilters.storage.some(s => storageVal && storageVal.includes(s));
      
      const sizeGrp = getScreenSizeGroup(product.specs.Display, false);
      const matchesScreen = activeFilters.screenSizes.length === 0 || activeFilters.screenSizes.includes(sizeGrp);
      
      const osVal = product.specs.OS || '';
      const matchesOS = activeFilters.os.length === 0 || activeFilters.os.some(o => osVal.toLowerCase().includes(o.toLowerCase()));
      
      if (!matchesSeries || !matchesRAM || !matchesStorage || !matchesScreen || !matchesOS) return false;
    }

    if (product.category === 'Laptops') {
      const matchesSeries = activeFilters.series.length === 0 || activeFilters.series.includes(product.specs.Series);
      const ramVal = product.specs.RAM;
      const matchesRAM = activeFilters.ram.length === 0 || activeFilters.ram.some(r => ramVal && ramVal.includes(r));
      const procVal = product.specs.Processor;
      const matchesProc = activeFilters.processors.length === 0 || activeFilters.processors.some(p => procVal && procVal.toLowerCase().includes(p.toLowerCase()));
      
      const sizeGrp = getScreenSizeGroup(product.specs.Display, true);
      const matchesScreen = activeFilters.screenSizes.length === 0 || activeFilters.screenSizes.includes(sizeGrp);
      
      const osVal = product.specs.OS || '';
      const matchesOS = activeFilters.os.length === 0 || activeFilters.os.some(o => osVal.toLowerCase().includes(o.toLowerCase()));
      
      if (!matchesSeries || !matchesRAM || !matchesProc || !matchesScreen || !matchesOS) return false;
    }

    if (product.category === 'Home Appliances') {
      const matchesType = activeFilters.types.length === 0 || activeFilters.types.includes(product.specs.Type);
      const runtimeVal = product.specs['Run Time'];
      const matchesRuntime = activeFilters.runtimes.length === 0 || activeFilters.runtimes.includes(runtimeVal);
      
      const suctionGrp = getSuctionPowerGroup(product.specs['Suction Power'] || product.specs.Power);
      const matchesSuction = activeFilters.suctionPowers.length === 0 || activeFilters.suctionPowers.includes(suctionGrp);
      
      const dustGrp = getDustCapacityGroup(product.specs['Bin Volume'] || product.specs.Capacity);
      const matchesDust = activeFilters.dustCapacities.length === 0 || activeFilters.dustCapacities.includes(dustGrp);
      
      if (!matchesType || !matchesRuntime || !matchesSuction || !matchesDust) return false;
    }

    if (product.category === 'Coffee Gear') {
      const matchesType = activeFilters.types.length === 0 || activeFilters.types.includes(product.specs.Type);
      const pressureVal = product.specs.Pressure;
      const matchesPressure = activeFilters.pressures.length === 0 || activeFilters.pressures.includes(pressureVal);
      
      const grinderGrp = getGrinderGroup(product.specs.Grinder);
      const matchesGrinder = activeFilters.grinders.length === 0 || activeFilters.grinders.includes(grinderGrp);
      
      if (!matchesType || !matchesPressure || !matchesGrinder) return false;
    }

    if (product.category === 'Pet Care') {
      const pTypeGrp = getPetProductTypeGroup(product.specs.Type);
      const matchesType = activeFilters.types.length === 0 || activeFilters.types.includes(pTypeGrp);
      
      const pIngs = getPetIngredientsMaterialGroups(product);
      const matchesIngredients = activeFilters.ingredients.length === 0 || activeFilters.ingredients.some(i => pIngs.includes(i));
      
      if (!matchesType || !matchesIngredients) return false;
    }

    if (product.category === 'Baby & Children') {
      const matchesType = activeFilters.types.length === 0 || activeFilters.types.includes(product.specs.Type);
      
      const weightGrp = getBabyWeightCapacityGroup(product.specs.Capacity);
      const matchesWeight = activeFilters.weightCapacities.length === 0 || activeFilters.weightCapacities.includes(weightGrp);
      
      const safetyFeatures = getBabySafetyFeatures(product);
      const matchesSafety = activeFilters.safetyFeatures.length === 0 || activeFilters.safetyFeatures.some(f => safetyFeatures.includes(f));
      
      if (!matchesType || !matchesWeight || !matchesSafety) return false;
    }

    return true;
  });

  const showcaseProducts = showcaseFilteredProducts.slice(0, 12);

  const comparedProducts = comparedIds.map(id => products.find(p => p.id === id)).filter(Boolean);



  const PriceTrendChart = ({ product, lang }) => {
    // Generate simulated price trend data based on product ID seed
    const seed = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const basePrice = (seed % 100) + 150; // $150 to $250
    
    const prices = [];
    for (let i = 0; i < 12; i++) {
      const trend = Math.sin((i + seed) / 2) * (basePrice * 0.12);
      const noise = ((seed * i) % 17) - 8;
      prices.push(Math.round(basePrice + trend + noise));
    }
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    const width = 600;
    const height = 150;
    const padding = 25;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const points = prices.map((price, idx) => {
      const x = padding + (idx / 11) * chartWidth;
      const y = padding + chartHeight - ((price - minPrice) / (maxPrice - minPrice || 1)) * chartHeight;
      return { x, y, price, month: idx + 1 };
    });
    
    const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[11].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    
    const monthsTR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    const monthsEN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const months = lang === 'tr' ? monthsTR : monthsEN;
    
    return (
      <div className="glass-panel price-trend-section" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>📈 {lang === 'tr' ? '12 Aylık Fiyat Değişimi' : '12-Month Price Trend'}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {lang === 'tr' ? 'En Düşük: ' : 'Min: '} <strong style={{ color: 'var(--success)' }}>{minPrice}₺</strong> | {lang === 'tr' ? 'En Yüksek: ' : 'Max: '} <strong style={{ color: 'var(--accent-purple)' }}>{maxPrice}₺</strong>
          </span>
        </h3>
        
        <div className="chart-container" style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(34, 211, 238, 0.25)" />
                <stop offset="100%" stopColor="rgba(34, 211, 238, 0.0)" />
              </linearGradient>
              <linearGradient id="chart-line-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <filter id="chart-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <line x1={padding} y1={padding + chartHeight / 2} x2={width - padding} y2={padding + chartHeight / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <line x1={padding} y1={padding + chartHeight} x2={width - padding} y2={padding + chartHeight} stroke="rgba(255,255,255,0.1)" />
            
            <path d={areaD} fill="url(#chart-area-grad)" />
            <path d={pathD} fill="none" stroke="url(#chart-line-grad)" strokeWidth="3" filter="url(#chart-glow)" strokeLinecap="round" />
            
            {points.map((p, idx) => (
              <g key={idx} className="chart-point-group">
                <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#a855f7" strokeWidth="2" />
                <text x={p.x} y={p.y - 8} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="8" fontWeight="600">{p.price}₺</text>
                <text x={p.x} y={height - 5} textAnchor="middle" fill="var(--text-secondary)" fontSize="9">{months[idx]}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  const handleAddReview = (e, productId) => {
    e.preventDefault();
    const nameVal = e.target.reviewerName.value.trim();
    const ratingVal = parseInt(e.target.reviewerRating.value, 10);
    const commentVal = e.target.reviewerComment.value.trim();
    
    if (!nameVal || !commentVal) return;
    
    const newReview = {
      id: `rev-user-${Date.now()}`,
      author: nameVal,
      type: "user",
      role: lang === 'tr' ? 'Doğrulanmış Müşteri' : 'Verified Buyer',
      avatar: `https://avatar.vercel.sh/${encodeURIComponent(nameVal)}`,
      rating: ratingVal,
      date: new Date().toISOString().split('T')[0],
      content: commentVal,
      likes: 0,
      hearts: 0
    };
    
    setProducts(prevProducts => prevProducts.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          reviews: [newReview, ...(p.reviews || [])]
        };
      }
      return p;
    }));
    
    e.target.reset();
  };

  const renderProductDetail = () => {
    const product = products.find(p => p.id === activeProductId);
    if (!product) {
      return (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {lang === 'tr' ? 'Ürün bulunamadı.' : 'Product not found.'}
          <button className="btn-getstarted" onClick={navigateBack} style={{ marginTop: '1rem' }}>{t.back}</button>
        </div>
      );
    }

    const isSelected = comparedIds.includes(product.id);
    const overallScore = product.scores 
      ? Math.round((product.scores.performance + product.scores.camera + (product.scores.battery || 80)) / 3) 
      : 85;

    return (
      <div className="detail-page-wrapper">
        <div className="breadcrumbs">
          <span className="breadcrumb-item" onClick={navigateToHome}>{t.home}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item" onClick={() => { navigateToHome(); setSelectedCategory(product.category); }}>
            {lang === 'tr' 
              ? (product.category === 'Books & Lifestyle' ? 'Kitap & Yaşam' : product.category === 'Smartphones' ? 'Akıllı Telefonlar' : product.category === 'Laptops' ? 'Dizüstü Bilgisayarlar' : product.category === 'Pet Care' ? 'Evcil Hayvan' : product.category === 'Baby & Children' ? 'Bebek & Çocuk' : product.category === 'Coffee Gear' ? 'Kahve Ekipmanları' : product.category)
              : product.category}
          </span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </div>

        <button className="btn-back-nav" onClick={navigateBack}>
          ← {lang === 'tr' ? 'Geri Dön' : 'Go Back'}
        </button>

        <div className="product-detail-grid">
          <div className="detail-left-col">
            <div className="glass-panel detail-image-panel">
              <div className="img-glow-wrapper">
                <img src={product.frontCover} alt={product.name} className="detail-main-img" />
              </div>
              <div className="detail-badges-row">
                <span className="category-badge">{product.category}</span>
                <span className="score-ring-badge">
                  {overallScore}/100 Puan
                </span>
              </div>
            </div>

            {product.scores && (
              <div className="glass-panel detail-scores-panel">
                <h3>{lang === 'tr' ? 'Teknik Puan Analizi' : 'Technical Score Analysis'}</h3>
                <div className="scores-bars-list">
                  {Object.entries(product.scores).map(([key, val]) => (
                    <div key={key} className="score-bar-row">
                      <span className="score-label">
                        {key === 'performance' ? t.perf : key === 'camera' ? t.cam : key === 'battery' ? t.bat : t.val}
                      </span>
                      <div className="score-bar-bg">
                        <div 
                          className="score-bar-fill" 
                          style={{ 
                            width: `${val}%`,
                            background: key === 'performance' ? 'linear-gradient(90deg, #22d3ee, #0891b2)' : key === 'camera' ? 'linear-gradient(90deg, #a855f7, #7c3aed)' : 'linear-gradient(90deg, #10b981, #059669)'
                          }}
                        ></div>
                      </div>
                      <span className="score-value-text">{val}/100</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-actions-row">
              <button 
                className={`btn-compare-detail ${isSelected ? 'active' : ''}`}
                onClick={() => toggleCompare(product.id)}
              >
                {isSelected 
                  ? (lang === 'tr' ? '✓ Karşılaştırmadan Çıkar' : '✓ Remove from Compare') 
                  : (lang === 'tr' ? '＋ Karşılaştır Listesine Ekle' : '＋ Add to Compare')}
              </button>
              <a href={getAmazonLink(product)} target="_blank" rel="noopener noreferrer" className="btn-shop-detail">
                {t.offersBtn}
              </a>
            </div>
          </div>

          <div className="detail-right-col">
            <div className="glass-panel product-meta-panel">
              <div>
                <span 
                  className="brand-link" 
                  onClick={() => navigateTo('publisher-detail', { publisherBrand: product.brand })}
                >
                  {product.brand}
                </span>
                <h1 className="detail-title">{product.name}</h1>
              </div>

              {product.category === 'Books & Lifestyle' && (
                <div className="book-authors-publishers-row" style={{ display: 'flex', gap: '1.5rem', margin: '1rem 0', fontSize: '1rem' }}>
                  <span>
                    <strong>{t.Author || 'Yazar'}:</strong>{' '}
                    <span className="nav-accent-link" onClick={() => navigateTo('author-detail', { authorName: product.specs.Author })}>
                      {product.specs.Author}
                    </span>
                  </span>
                  <span>
                    <strong>{t.Publisher || 'Yayınevi'}:</strong>{' '}
                    <span className="nav-accent-link" onClick={() => navigateTo('publisher-detail', { publisherBrand: product.specs.Publisher })}>
                      {product.specs.Publisher}
                    </span>
                  </span>
                </div>
              )}

              <p className="detail-description">
                {product.description}
              </p>
            </div>

            <div className="glass-panel specs-table-panel">
              <h3>{lang === 'tr' ? 'Teknik Özellik Tablosu' : 'Specifications Table'}</h3>
              <div className="specs-scroll-box">
                <table className="detail-specs-table">
                  <tbody>
                    {Object.entries(product.specs).map(([key, val]) => (
                      <tr key={key}>
                        <td className="spec-key-cell">{t[key] || key}</td>
                        <td className="spec-val-cell">
                          {renderSpecValue(val, key, product, lang, navigateTo)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <PriceTrendChart product={product} lang={lang} />

        <div className="detail-reviews-section">
          <div className="glass-panel reviews-list-panel">
            <h2>💬 {lang === 'tr' ? 'Kullanıcı Değerlendirmeleri' : 'User Reviews'}</h2>
            <div className="detail-reviews-list">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map(rev => (
                  <ReviewCard key={rev.id} review={rev} />
                ))
              ) : (
                <p style={{ color: 'var(--text-secondary)', padding: '1rem' }}>{t.noReviews}</p>
              )}
            </div>
          </div>

          <div className="glass-panel review-form-panel">
            <h2>✍️ {t.writeReview}</h2>
            <form onSubmit={(e) => handleAddReview(e, product.id)} className="review-submit-form">
              <div className="form-group">
                <label htmlFor="reviewerName">{t.yourName}</label>
                <input type="text" id="reviewerName" name="reviewerName" required placeholder="Örn: John Doe" className="select-box" style={{ width: '100%' }} />
              </div>
              <div className="form-group">
                <label htmlFor="reviewerRating">{t.yourRating}</label>
                <select id="reviewerRating" name="reviewerRating" className="select-box" style={{ width: '100%' }}>
                  <option value="5">★★★★★ (5)</option>
                  <option value="4">★★★★☆ (4)</option>
                  <option value="3">★★★☆☆ (3)</option>
                  <option value="2">★★☆☆☆ (2)</option>
                  <option value="1">★☆☆☆☆ (1)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="reviewerComment">{t.yourComment}</label>
                <textarea id="reviewerComment" name="reviewerComment" required rows="4" className="select-box" style={{ width: '100%', resize: 'vertical' }} placeholder="Yorumunuzu buraya yazın..."></textarea>
              </div>
              <button type="submit" className="btn-getstarted" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                {t.submitReview}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderAuthorDetail = () => {
    const authorName = activeAuthorName;
    const authorProducts = products.filter(p => p.specs && p.specs.Author === authorName);
    
    const bioData = authorBios[authorName];
    const bioText = bioData
      ? (lang === 'tr' ? bioData.tr : bioData.en)
      : (lang === 'tr' 
          ? `${authorName}, dünya edebiyatına damga vurmuş, eserleri ve felsefi yaklaşımlarıyla milyonlarca okura yön vermiş prestijli bir yazardır.`
          : `${authorName} is a prestigious author who left a deep mark on world literature, guiding millions of readers with their works and philosophical approaches.`);

    return (
      <div className="detail-page-wrapper">
        <div className="breadcrumbs">
          <span className="breadcrumb-item" onClick={navigateToHome}>{t.home}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item" onClick={navigateToHome}>{t.authors}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{authorName}</span>
        </div>

        <button className="btn-back-nav" onClick={navigateBack}>
          ← {lang === 'tr' ? 'Geri Dön' : 'Go Back'}
        </button>

        <div className="glass-panel profile-container-panel">
          <div className="profile-header-layout">
            <div className="profile-avatar-wrapper">
              <img 
                src={`https://avatar.vercel.sh/${encodeURIComponent(authorName)}?size=150`} 
                alt={authorName} 
                className="profile-avatar" 
              />
            </div>
            <div className="profile-info-content">
              <h1 className="profile-title">{authorName}</h1>
              <span className="profile-subtitle-badge">📝 {t.yazar || 'Yazar'}</span>
              <p className="profile-bio-text">
                {bioText}
              </p>
            </div>
          </div>
        </div>

        <div className="profile-products-section" style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#ffffff' }}>
            📚 {authorName} {lang === 'tr' ? 'Kitapları' : 'Books'} ({authorProducts.length})
          </h2>

          <div className="showcase-grid">
            {authorProducts.map(product => {
              const isSelected = comparedIds.includes(product.id);
              return (
                <div 
                  key={product.id} 
                  className={`glass-panel showcase-card ${isSelected ? 'selected-a' : ''}`}
                >
                  <div className="showcase-card-header">
                    <span 
                      style={{ cursor: 'pointer' }}
                      className="brand-label link-style"
                      onClick={() => navigateTo('publisher-detail', { publisherBrand: product.brand })}
                    >
                      {product.brand}
                    </span>
                    <span className="category-badge">{product.category}</span>
                  </div>
                  <h3 style={{ cursor: 'pointer' }} onClick={() => navigateTo('product-detail', { productId: product.id })}>
                    <span className="product-title-link">
                      {product.name}
                    </span>
                  </h3>
                  <div className="specs-preview">
                    <div className="spec-item">
                      <span className="label">{t.Publisher || 'Publisher'}: </span>
                      <span className="val">
                        <span 
                          style={{ cursor: 'pointer' }}
                          className="spec-link"
                          onClick={() => navigateTo('publisher-detail', { publisherBrand: product.specs.Publisher })}
                        >
                          {product.specs.Publisher}
                        </span>
                      </span>
                    </div>
                    <div className="spec-item">
                      <span className="label">{t.Pages || 'Pages'}: </span>
                      <span className="val">{product.specs.Pages}</span>
                    </div>
                  </div>
                  <div className="showcase-card-actions" style={{ justifyContent: 'center' }}>
                    <button 
                      className={`btn-compare-slot ${isSelected ? 'active' : ''}`}
                      style={{
                        width: '100%',
                        background: isSelected ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
                        color: '#ffffff',
                        fontWeight: '700',
                        fontSize: '0.76rem',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.45rem 0.6rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => toggleCompare(product.id)}
                    >
                      {getCompareBtnText(product.id)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderPublisherBrandDetail = () => {
    const entityName = activePublisherBrand;
    const entityProducts = products.filter(p => p.brand === entityName || (p.specs && p.specs.Publisher === entityName));
    
    const bioData = brandDescriptions[entityName];
    const bioText = bioData
      ? (lang === 'tr' ? bioData.tr : bioData.en)
      : (lang === 'tr'
          ? `${entityName}, alanındaki yenilikçi yaklaşımları, kaliteli ürün yelpazesi ve müşteri memnuniyeti odaklı vizyonuyla tanınan saygın bir kuruluştur.`
          : `${entityName} is a reputable organization recognized for its innovative approaches, high-quality product portfolio, and customer satisfaction-oriented vision.`);

    const ratings = entityProducts.map(p => {
      if (p.reviews && p.reviews.length > 0) {
        return p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length;
      }
      return 5.0;
    });
    const averageRating = ratings.length > 0 ? (ratings.reduce((acc, r) => acc + r, 0) / ratings.length).toFixed(1) : "5.0";
    
    return (
      <div className="detail-page-wrapper">
        <div className="breadcrumbs">
          <span className="breadcrumb-item" onClick={navigateToHome}>{t.home}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item" onClick={navigateToHome}>{t.publishers}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{entityName}</span>
        </div>

        <button className="btn-back-nav" onClick={navigateBack}>
          ← {lang === 'tr' ? 'Geri Dön' : 'Go Back'}
        </button>

        <div className="glass-panel profile-container-panel">
          <div className="profile-header-layout">
            <div className="profile-avatar-wrapper brand-logo-wrapper">
              <div className="brand-initial-logo">
                {entityName.charAt(0)}
              </div>
            </div>
            <div className="profile-info-content">
              <h1 className="profile-title">{entityName}</h1>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', margin: '0.4rem 0' }}>
                <span className="profile-subtitle-badge">🏢 {t.publishers}</span>
                <span className="profile-stat-badge">📊 {t.totalProducts}: {entityProducts.length}</span>
                <span className="profile-stat-badge">⭐ {t.avgRating}: {averageRating}</span>
              </div>
              <p className="profile-bio-text">
                {bioText}
              </p>
            </div>
          </div>
        </div>

        <div className="profile-products-section" style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#ffffff' }}>
            📦 {entityName} {lang === 'tr' ? 'Ürünleri & Kitapları' : 'Products & Books'} ({entityProducts.length})
          </h2>

          <div className="showcase-grid">
            {entityProducts.map(product => {
              const isSelected = comparedIds.includes(product.id);
              return (
                <div 
                  key={product.id} 
                  className={`glass-panel showcase-card ${isSelected ? 'selected-a' : ''}`}
                >
                  <div className="showcase-card-header">
                    <span className="brand-label">{product.brand}</span>
                    <span className="category-badge">{product.category}</span>
                  </div>
                  <h3 style={{ cursor: 'pointer' }} onClick={() => navigateTo('product-detail', { productId: product.id })}>
                    <span className="product-title-link">
                      {product.name}
                    </span>
                  </h3>
                  <div className="specs-preview">
                    {product.category === 'Books & Lifestyle' ? (
                      <>
                        <div className="spec-item">
                          <span className="label">{t.Author || 'Author'}: </span>
                          <span className="val">
                            <span 
                              style={{ cursor: 'pointer' }}
                              className="spec-link"
                              onClick={() => navigateTo('author-detail', { authorName: product.specs.Author })}
                            >
                              {product.specs.Author}
                            </span>
                          </span>
                        </div>
                        <div className="spec-item">
                          <span className="label">{t.Pages || 'Pages'}: </span>
                          <span className="val">{product.specs.Pages}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="spec-item">
                          <span className="label">RAM / Storage: </span>
                          <span className="val">{product.specs.RAM || 'N/A'} / {product.specs.Storage || 'N/A'}</span>
                        </div>
                        <div className="spec-item">
                          <span className="label">OS / CPU: </span>
                          <span className="val">{product.specs.OS || 'N/A'} / {product.specs.Processor || 'N/A'}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="showcase-card-actions" style={{ justifyContent: 'center' }}>
                    <button 
                      className={`btn-compare-slot ${isSelected ? 'active' : ''}`}
                      style={{
                        width: '100%',
                        background: isSelected ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
                        color: '#ffffff',
                        fontWeight: '700',
                        fontSize: '0.76rem',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.45rem 0.6rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => toggleCompare(product.id)}
                    >
                      {getCompareBtnText(product.id)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Moving stars, glowing cosmic nebulas, and logic constellations */}
      <DriftingStars />
      <FloatingPlanets />
      <BackgroundConstellations />

      {/* Header */}
      <header>
        <div className="header-logo" onClick={() => { navigateToHome(); setIsMobileMenuOpen(false); }} onDoubleClick={() => setCurrentView('admin')}>
          {/* Logo SVG Node structure */}
          <svg width="30" height="30" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 0px 8px rgba(34, 211, 238, 0.75))' }}>
            <circle cx="28" cy="28" r="8" stroke="#22d3ee" strokeWidth="6" fill="#060814" />
            <circle cx="28" cy="72" r="8" stroke="#22d3ee" strokeWidth="6" fill="#060814" />
            <circle cx="72" cy="72" r="8" stroke="#22d3ee" strokeWidth="6" fill="#060814" />
            <circle cx="72" cy="28" r="8" stroke="#a855f7" strokeWidth="6" fill="#060814" />
            <path d="M28 36V64" stroke="#22d3ee" strokeWidth="6" />
            <path d="M36 72H64" stroke="#22d3ee" strokeWidth="6" />
            <path d="M34 66L66 34" stroke="#a855f7" strokeWidth="6" />
          </svg>
          <span className="bold">Logic</span>
          <span className="light">Compare</span>
        </div>

        <nav className="header-nav">
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); navigateToHome(); }}>{t.howItWorks}</a>
          <a href="#features" onClick={(e) => { e.preventDefault(); navigateToHome(); }}>{t.features}</a>
          <a href="#use-cases" onClick={(e) => { e.preventDefault(); navigateToHome(); }}>{t.useCases}</a>
          <a href="#pricing" onClick={(e) => { e.preventDefault(); navigateToHome(); }}>{t.pricing}</a>
          <a href="#blog" onClick={(e) => { e.preventDefault(); navigateToHome(); }}>{t.blog}</a>
        </nav>

        <div className="header-actions">
          {/* Custom flag language dropdown (Desktop Header) */}
          <div className="custom-lang-selector header-lang-select" ref={langDropdownRef}>
            <button 
              className="btn-lang-trigger" 
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            >
              <span className="current-flag">
                {(() => {
                  const curr = languages.find(l => l.code === lang);
                  return curr ? (
                    <img 
                      src={`https://flagcdn.com/w20/${curr.country}.png`} 
                      srcSet={`https://flagcdn.com/w40/${curr.country}.png 2x`}
                      width="20"
                      alt={curr.label}
                      className="lang-flag-image"
                    />
                  ) : null;
                })()}
              </span>
              <span className="current-label">{lang.toUpperCase()}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {isLangDropdownOpen && (
              <div className="custom-lang-menu glass-panel">
                {languages.map(l => (
                  <button 
                    key={l.code}
                    className={`lang-menu-item ${lang === l.code ? 'active' : ''}`}
                    onClick={() => {
                      setLang(l.code);
                      setIsLangDropdownOpen(false);
                    }}
                  >
                    <span className="flag">
                      <img 
                        src={`https://flagcdn.com/w20/${l.country}.png`} 
                        srcSet={`https://flagcdn.com/w40/${l.country}.png 2x`}
                        width="20"
                        alt={l.label}
                        className="lang-flag-image"
                      />
                    </span>
                    <span className="label">{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="btn-account header-btn-action" onClick={() => { setCurrentView(currentView === 'admin' ? 'compare' : 'admin'); setIsMobileMenuOpen(false); }}>
            {currentView === 'admin' ? (lang === 'tr' ? 'Geri' : 'Back') : t.account}
          </button>
          <button className="btn-getstarted header-btn-action" onClick={() => { setCurrentView('compare'); setIsMobileMenuOpen(false); }}>{t.getStarted}</button>
          
          {/* Responsive Hamburger Icon Button */}
          <button className="btn-hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-nav-panel" onClick={(e) => e.stopPropagation()}>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); setCurrentView('compare'); setIsMobileMenuOpen(false); }}>{t.howItWorks}</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); setCurrentView('compare'); setIsMobileMenuOpen(false); }}>{t.features}</a>
            <a href="#use-cases" onClick={(e) => { e.preventDefault(); setCurrentView('compare'); setIsMobileMenuOpen(false); }}>{t.useCases}</a>
            <a href="#pricing" onClick={(e) => { e.preventDefault(); setCurrentView('compare'); setIsMobileMenuOpen(false); }}>{t.pricing}</a>
            <a href="#blog" onClick={(e) => { e.preventDefault(); setCurrentView('compare'); setIsMobileMenuOpen(false); }}>{t.blog}</a>
            
            {/* Mobile Drawer Language Flags Grid */}
            <div className="mobile-lang-grid-title">{lang === 'tr' ? 'Dil Seçin' : 'Select Language'}</div>
            <div className="mobile-lang-grid">
              {languages.map(l => (
                <button 
                  key={l.code}
                  className={`mobile-lang-grid-item ${lang === l.code ? 'active' : ''}`}
                  onClick={() => {
                    setLang(l.code);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span className="flag">
                    <img 
                      src={`https://flagcdn.com/w20/${l.country}.png`} 
                      srcSet={`https://flagcdn.com/w40/${l.country}.png 2x`}
                      width="20"
                      alt={l.label}
                      className="lang-flag-image"
                    />
                  </span>
                  <span className="code">{l.code.toUpperCase()}</span>
                </button>
              ))}
            </div>

            {/* Mobile Drawer Actions Buttons */}
            <div className="mobile-action-buttons">
              <button className="btn-account mobile-btn" onClick={() => { setCurrentView(currentView === 'admin' ? 'compare' : 'admin'); setIsMobileMenuOpen(false); }}>
                {currentView === 'admin' ? (lang === 'tr' ? 'Geri' : 'Back') : t.account}
              </button>
              <button className="btn-getstarted mobile-btn" onClick={() => { setCurrentView('compare'); setIsMobileMenuOpen(false); }}>{t.getStarted}</button>
            </div>
          </div>
        </div>
      )}

      {currentView === 'compare' ? (
        <>
          {/* Hero Header */}
          <section className="hero">
            <h1>
              <span className="gradient">LogicCompare:</span> Find the logical choice
            </h1>
            <p className="subtitle">
              {t.heroSubtitle}
            </p>
          </section>

          {/* Onboarding steps (Steps 1, 2, 3) - PLACED ABOVE SEARCH FOR PC */}
          <section className="onboarding-steps">
            
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-icon-wrapper float-animation">
                {/* Search Magnifying Glass with connected nodes SVG - Zoom-perfect matches mockup */}
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 0px 8px rgba(34, 211, 238, 0.65))' }}>
                  <defs>
                    <linearGradient id="search-lens-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  
                  {/* Lens & Handle */}
                  <circle cx="48" cy="48" r="18" stroke="url(#search-lens-grad)" strokeWidth="4.5" fill="none" />
                  <path d="M61 61L78 78" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" />
                  
                  {/* Inner Zig-zag line graph */}
                  <path d="M36 52 L44 58 L52 44 L60 50" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="36" cy="52" r="3" fill="#22d3ee" />
                  <circle cx="44" cy="58" r="3" fill="#22d3ee" />
                  <circle cx="52" cy="44" r="3" fill="#22d3ee" />
                  <circle cx="60" cy="50" r="3" fill="#22d3ee" />
                  
                  {/* Outer nodes extending out */}
                  <line x1="61" y1="35" x2="76" y2="20" stroke="#22d3ee" strokeWidth="3" />
                  <circle cx="76" cy="20" r="4.5" fill="#22d3ee" stroke="#060814" strokeWidth="1.5" />
                  
                  <line x1="35" y1="61" x2="20" y2="76" stroke="#22d3ee" strokeWidth="3" />
                  <circle cx="20" cy="76" r="4.5" fill="#22d3ee" stroke="#060814" strokeWidth="1.5" />
                </svg>
              </div>
              <h3>{t.step1Title}</h3>
              <p>{t.step1Desc}</p>
            </div>

            {/* Step Arrow */}
            <div className="step-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-icon-wrapper">
                {/* Scale SVG with squares and checkmarks - Zoom-perfect outline seesaw balance with active seesaw tilt animation */}
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 0px 8px rgba(34, 211, 238, 0.6))' }}>
                  {/* Outline triangle pivot base at the bottom - STATIC */}
                  <polygon points="50,60 36,80 64,80" stroke="#22d3ee" strokeWidth="4.5" fill="none" strokeLinejoin="round" />
                  
                  {/* Animated Seesaw Group */}
                  <g className="seesaw-group">
                    {/* Seesaw beam (balanced horizontally at y=60 as the base state) */}
                    <line x1="20" y1="60" x2="80" y2="60" stroke="#22d3ee" strokeWidth="4.5" strokeLinecap="round" />
                    
                    {/* Left weight box (purple outline) sitting on top of the beam */}
                    <rect x="25" y="45" width="15" height="15" rx="2" stroke="#a855f7" strokeWidth="3.5" fill="none" />
                    
                    {/* Right weight box (cyan outline) sitting on top of the beam */}
                    <rect x="60" y="45" width="15" height="15" rx="2" stroke="#22d3ee" strokeWidth="3.5" fill="none" />
                    
                    {/* Green circle with checkmark above left weight */}
                    <circle cx="32.5" cy="27" r="8" fill="#10b981" />
                    <path d="M29 27 L31.5 29.5 L36 24.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Green circle with checkmark above right weight */}
                    <circle cx="67.5" cy="27" r="8" fill="#10b981" />
                    <path d="M64 27 L66.5 29.5 L71 24.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </svg>
              </div>
              <h3>{t.step2Title}</h3>
              <p>{t.step2Desc}</p>
            </div>

            {/* Step Arrow */}
            <div className="step-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-icon-wrapper star-pulse-icon">
                {/* Bookmark SVG with up arrow and star - Zoom-perfect matches mockup */}
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 0px 8px rgba(34, 211, 238, 0.55))' }}>
                  <defs>
                    <linearGradient id="bookmark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <linearGradient id="star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                  
                  {/* Bookmark ribbon outline */}
                  <path d="M38 18 H62 V70 L50 58 L38 70 Z" stroke="url(#bookmark-grad)" strokeWidth="4.5" fill="none" strokeLinejoin="round" />
                  
                  {/* Green/Teal arrow pointing up inside */}
                  <path d="M50 48 V28 M43 35 L50 28 L57 35" stroke="#22d3ee" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  
                  {/* Gradient star on the bottom-right */}
                  <path d="M68 52 L70 57 L75 58 L71 62 L72 67 L68 64 L64 67 L65 62 L61 58 L66 57 Z" fill="url(#star-grad)" stroke="#10b981" strokeWidth="1" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>{t.step3Title}</h3>
              <p>{t.step3Desc}</p>
            </div>

          </section>

          {/* Search container - PRIORITIZED ABOVE THE FOLD */}
          <section className="search-container">
            <div className="search-glow-backdrop"></div>
            <div className="search-pill-wrapper">
              <svg className="search-lens" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                ref={searchInputRef}
                className="search-pill-input" 
                placeholder={t.searchPlaceholder} 
                value={searchQuery}
                onChange={handleTyping}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') triggerSearch();
                }}
                disabled={isLoading || cooldownTime > 0}
              />
              <button 
                className="btn-start-comparison" 
                onClick={() => triggerSearch()}
                disabled={isLoading || cooldownTime > 0}
              >
                <span className="btn-text">{t.searchBtn}</span>
                <span className="btn-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
              </button>
            </div>

            {/* Autocomplete suggestions dropdown */}
            {autocompleteList.length > 0 && (
              <div className="autocomplete-dropdown">
                {autocompleteList.map(prod => (
                  <div 
                    key={prod.id} 
                    className="autocomplete-item"
                    onClick={() => selectSuggestedProduct(prod)}
                  >
                    <span className="prod-name">{prod.brand} - {prod.name}</span>
                    <span className="cat-badge">{prod.category}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Cooldown Alert */}
            {cooldownTime > 0 && (
              <div style={{ color: 'var(--danger)', marginTop: '0.8rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }}>
                {t.cooldownMsg.replace('{time}', cooldownTime)}
              </div>
            )}
          </section>

          {/* Product Showcase Grid (Prioritized Visual Category Showcase) */}
          <section className="popular-products-showcase">
            <h2 className="showcase-title">{t.popularProductsTitle}</h2>
            
            {/* Universal Categories Bar inside the showcase */}
            <div className="category-bar">
              {[
                { id: 'All', name: t.categoryAll },
                { id: 'Smartphones', name: t.categoryPhones },
                { id: 'Laptops', name: t.categoryLaptops },
                { id: 'Home Appliances', name: lang === 'tr' ? '🔌 Ev Aletleri' : '🔌 Appliances' },
                { id: 'Coffee Gear', name: t.categoryCoffee },
                { id: 'Pet Care', name: t.categoryPets },
                { id: 'Baby & Children', name: t.categoryBaby },
                { id: 'Books & Lifestyle', name: lang === 'tr' ? '📚 Kitap & Yaşam' : '📚 Books & Lifestyle' }
              ].map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                  }}
                  className={`category-tag ${selectedCategory === cat.id ? 'active' : ''}`}
                  disabled={isLoading}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Showcase Two-Column Content Layout (Sidebar + Main Grid) */}
            <div className="showcase-content-layout">
              {/* Left Sidebar Filters */}
              <aside className="epey-sidebar">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.6rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                    {lang === 'tr' ? 'Filtreler' : 'Filters'}
                  </h3>
                  {Object.values(activeFilters).some(arr => arr.length > 0) && (
                    <button 
                      onClick={clearAllFilters}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                    >
                      {t.clearFilters}
                    </button>
                  )}
                </div>

                {/* Brands/Publishers section */}
                <div className="sidebar-section">
                  <h4 className="sidebar-section-title">
                    {selectedCategory === 'Books & Lifestyle' ? (lang === 'tr' ? 'Yayınevleri' : 'Publishers') : (lang === 'tr' ? 'Markalar' : 'Brands')}
                  </h4>
                  <div style={{ position: 'relative', margin: '0.5rem 0 0.8rem 0' }}>
                    <input 
                      type="text" 
                      className="sidebar-search-input" 
                      placeholder={selectedCategory === 'Books & Lifestyle' ? (lang === 'tr' ? 'Yayınevi ara...' : 'Search publisher...') : t.brandSearchPlaceholder}
                      value={brandSearchQuery}
                      onChange={(e) => setBrandSearchQuery(e.target.value)}
                    />
                    {brandSearchQuery && (
                      <button 
                        onClick={() => setBrandSearchQuery('')}
                        style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="sidebar-scroll-list">
                    {filteredBrandsForSidebar.length > 0 ? (
                      filteredBrandsForSidebar.map(brand => {
                        const isChecked = activeFilters.brands.includes(brand);
                        return (
                          <label key={brand} className="cosmic-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleFilter('brands', brand)}
                              style={{ display: 'none' }}
                            />
                            <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                              {isChecked && '✓'}
                            </span>
                            <span className="checkbox-text">{brand}</span>
                          </label>
                        );
                      })
                    ) : (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                        {selectedCategory === 'Books & Lifestyle' ? (lang === 'tr' ? 'Yayınevi bulunamadı.' : 'No publishers found.') : (lang === 'tr' ? 'Marka bulunamadı.' : 'No brands found.')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Books specific filters: Authors, Genres, Bindings, Page Count */}
                {selectedCategory === 'Books & Lifestyle' && (
                  <>
                    {/* Authors section */}
                    <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                      <h4 className="sidebar-section-title">{lang === 'tr' ? 'Yazarlar' : 'Authors'}</h4>
                      <div style={{ position: 'relative', margin: '0.5rem 0 0.8rem 0' }}>
                        <input 
                          type="text" 
                          className="sidebar-search-input" 
                          placeholder={lang === 'tr' ? 'Yazar ara...' : 'Search author...'}
                          value={authorSearchQuery}
                          onChange={(e) => setAuthorSearchQuery(e.target.value)}
                        />
                        {authorSearchQuery && (
                          <button 
                            onClick={() => setAuthorSearchQuery('')}
                            style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <div className="sidebar-scroll-list">
                        {filteredAuthorsForSidebar.length > 0 ? (
                          filteredAuthorsForSidebar.map(author => {
                            const isChecked = activeFilters.authors.includes(author);
                            return (
                              <label key={author} className="cosmic-checkbox-label">
                                <input 
                                  type="checkbox" 
                                  checked={isChecked} 
                                  onChange={() => toggleFilter('authors', author)}
                                  style={{ display: 'none' }}
                                />
                                <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                                  {isChecked && '✓'}
                                </span>
                                <span className="checkbox-text">{author}</span>
                              </label>
                            );
                          })
                        ) : (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                            {lang === 'tr' ? 'Yazar bulunamadı.' : 'No authors found.'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Book Genres section */}
                    <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                      <h4 className="sidebar-section-title">{lang === 'tr' ? 'Kitap Türü' : 'Book Genre'}</h4>
                      <div className="sidebar-scroll-list">
                        {availableFilterOptions.genres.map(genre => {
                          const isChecked = activeFilters.genres.includes(genre);
                          return (
                            <label key={genre} className="cosmic-checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={() => toggleFilter('genres', genre)}
                                style={{ display: 'none' }}
                              />
                              <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                                  {isChecked && '✓'}
                              </span>
                              <span className="checkbox-text">{genre}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Binding Type section */}
                    <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                      <h4 className="sidebar-section-title">{lang === 'tr' ? 'Cilt Tipi' : 'Binding Type'}</h4>
                      <div className="sidebar-scroll-list">
                        {availableFilterOptions.bindings.map(binding => {
                          const isChecked = activeFilters.bindings.includes(binding);
                          return (
                            <label key={binding} className="cosmic-checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={() => toggleFilter('bindings', binding)}
                                style={{ display: 'none' }}
                              />
                              <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                                {isChecked && '✓'}
                              </span>
                              <span className="checkbox-text">{binding}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Page Count section */}
                    <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                      <h4 className="sidebar-section-title">{lang === 'tr' ? 'Sayfa Sayısı' : 'Page Count'}</h4>
                      <div className="sidebar-scroll-list">
                        {availableFilterOptions.pageCounts.map(pc => {
                          const isChecked = activeFilters.pageCounts.includes(pc);
                          return (
                            <label key={pc} className="cosmic-checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={() => toggleFilter('pageCounts', pc)}
                                style={{ display: 'none' }}
                              />
                              <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                                {isChecked && '✓'}
                              </span>
                              <span className="checkbox-text">{pc}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* Smartphones & Laptops Series filter */}
                {(selectedCategory === 'Smartphones' || selectedCategory === 'Laptops') && (
                  <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                    <h4 className="sidebar-section-title">{t.series}</h4>
                    <div className="sidebar-scroll-list">
                      {availableFilterOptions.series.map(series => {
                        const isChecked = activeFilters.series.includes(series);
                        return (
                          <label key={series} className="cosmic-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleFilter('series', series)}
                              style={{ display: 'none' }}
                            />
                            <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                              {isChecked && '✓'}
                            </span>
                            <span className="checkbox-text">{series}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* RAM filter */}
                {availableFilterOptions.ram.length > 0 && (
                  <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                    <h4 className="sidebar-section-title">{lang === 'tr' ? 'RAM Bellek' : 'RAM'}</h4>
                    <div className="sidebar-scroll-list">
                      {availableFilterOptions.ram.map(ramVal => {
                        const isChecked = activeFilters.ram.includes(ramVal);
                        return (
                          <label key={ramVal} className="cosmic-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleFilter('ram', ramVal)}
                              style={{ display: 'none' }}
                            />
                            <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                              {isChecked && '✓'}
                            </span>
                            <span className="checkbox-text">{ramVal}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Storage filter (Smartphones only) */}
                {selectedCategory === 'Smartphones' && (
                  <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                    <h4 className="sidebar-section-title">{lang === 'tr' ? 'Dahili Depolama' : 'Storage'}</h4>
                    <div className="sidebar-scroll-list">
                      {availableFilterOptions.storage.map(st => {
                        const isChecked = activeFilters.storage.includes(st);
                        return (
                          <label key={st} className="cosmic-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleFilter('storage', st)}
                              style={{ display: 'none' }}
                            />
                            <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                              {isChecked && '✓'}
                            </span>
                            <span className="checkbox-text">{st}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Processor filter (Laptops only) */}
                {selectedCategory === 'Laptops' && (
                  <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                    <h4 className="sidebar-section-title">{lang === 'tr' ? 'İşlemci Serisi' : 'Processor'}</h4>
                    <div className="sidebar-scroll-list">
                      {availableFilterOptions.processors.map(pr => {
                        const isChecked = activeFilters.processors.includes(pr);
                        return (
                          <label key={pr} className="cosmic-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleFilter('processors', pr)}
                              style={{ display: 'none' }}
                            />
                            <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                              {isChecked && '✓'}
                            </span>
                            <span className="checkbox-text">{pr}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Screen Size filter (Smartphones & Laptops) */}
                {availableFilterOptions.screenSizes.length > 0 && (
                  <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                    <h4 className="sidebar-section-title">{lang === 'tr' ? 'Ekran Boyutu' : 'Screen Size'}</h4>
                    <div className="sidebar-scroll-list">
                      {availableFilterOptions.screenSizes.map(sz => {
                        const isChecked = activeFilters.screenSizes.includes(sz);
                        return (
                          <label key={sz} className="cosmic-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleFilter('screenSizes', sz)}
                              style={{ display: 'none' }}
                            />
                            <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                              {isChecked && '✓'}
                            </span>
                            <span className="checkbox-text">{sz}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Operating System filter (Smartphones & Laptops) */}
                {availableFilterOptions.os.length > 0 && (
                  <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                    <h4 className="sidebar-section-title">{lang === 'tr' ? 'İşletim Sistemi' : 'Operating System'}</h4>
                    <div className="sidebar-scroll-list">
                      {availableFilterOptions.os.map(o => {
                        const isChecked = activeFilters.os.includes(o);
                        return (
                          <label key={o} className="cosmic-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleFilter('os', o)}
                              style={{ display: 'none' }}
                            />
                            <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                              {isChecked && '✓'}
                            </span>
                            <span className="checkbox-text">{o}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Type/Product Type filter (Home Appliances, Coffee, Pets, Baby) */}
                {selectedCategory !== 'Pet Care' && availableFilterOptions.types.length > 0 && (
                  <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                    <h4 className="sidebar-section-title">{lang === 'tr' ? 'Ürün Türü' : 'Product Type'}</h4>
                    <div className="sidebar-scroll-list">
                      {availableFilterOptions.types.map(tp => {
                        const isChecked = activeFilters.types.includes(tp);
                        return (
                          <label key={tp} className="cosmic-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleFilter('types', tp)}
                              style={{ display: 'none' }}
                            />
                            <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                              {isChecked && '✓'}
                            </span>
                            <span className="checkbox-text">{tp}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Run Time filter (Appliances only) */}
                {selectedCategory === 'Home Appliances' && (
                  <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                    <h4 className="sidebar-section-title">{lang === 'tr' ? 'Çalışma Süresi' : 'Run Time'}</h4>
                    <div className="sidebar-scroll-list">
                      {availableFilterOptions.runtimes.map(rt => {
                        const isChecked = activeFilters.runtimes.includes(rt);
                        return (
                          <label key={rt} className="cosmic-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleFilter('runtimes', rt)}
                              style={{ display: 'none' }}
                            />
                            <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                              {isChecked && '✓'}
                            </span>
                            <span className="checkbox-text">{rt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Suction Power filter (Appliances only) */}
                {selectedCategory === 'Home Appliances' && (
                  <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                    <h4 className="sidebar-section-title">{lang === 'tr' ? 'Emiş Gücü' : 'Suction Power'}</h4>
                    <div className="sidebar-scroll-list">
                      {availableFilterOptions.suctionPowers.map(sp => {
                        const isChecked = activeFilters.suctionPowers.includes(sp);
                        return (
                          <label key={sp} className="cosmic-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleFilter('suctionPowers', sp)}
                              style={{ display: 'none' }}
                            />
                            <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                              {isChecked && '✓'}
                            </span>
                            <span className="checkbox-text">{sp}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dust Capacity filter (Appliances only) */}
                {selectedCategory === 'Home Appliances' && (
                  <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                    <h4 className="sidebar-section-title">{lang === 'tr' ? 'Toz Kapasitesi' : 'Dust Capacity'}</h4>
                    <div className="sidebar-scroll-list">
                      {availableFilterOptions.dustCapacities.map(dc => {
                        const isChecked = activeFilters.dustCapacities.includes(dc);
                        return (
                          <label key={dc} className="cosmic-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleFilter('dustCapacities', dc)}
                              style={{ display: 'none' }}
                            />
                            <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                              {isChecked && '✓'}
                            </span>
                            <span className="checkbox-text">{dc}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pressure filter (Coffee only) */}
                {selectedCategory === 'Coffee Gear' && (
                  <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                    <h4 className="sidebar-section-title">{lang === 'tr' ? 'Basınç Gücü' : 'Pressure'}</h4>
                    <div className="sidebar-scroll-list">
                      {availableFilterOptions.pressures.map(pr => {
                        const isChecked = activeFilters.pressures.includes(pr);
                        return (
                          <label key={pr} className="cosmic-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleFilter('pressures', pr)}
                              style={{ display: 'none' }}
                            />
                            <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                              {isChecked && '✓'}
                            </span>
                            <span className="checkbox-text">{pr}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Grinder filter (Coffee only) */}
                {selectedCategory === 'Coffee Gear' && (
                  <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                    <h4 className="sidebar-section-title">{lang === 'tr' ? 'Entegre Öğütücü' : 'Integrated Grinder'}</h4>
                    <div className="sidebar-scroll-list">
                      {availableFilterOptions.grinders.map(gr => {
                        const isChecked = activeFilters.grinders.includes(gr);
                        return (
                          <label key={gr} className="cosmic-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleFilter('grinders', gr)}
                              style={{ display: 'none' }}
                            />
                            <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                              {isChecked && '✓'}
                            </span>
                            <span className="checkbox-text">{gr}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pet Care product type filter (customized options) */}
                {selectedCategory === 'Pet Care' && (
                  <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                    <h4 className="sidebar-section-title">{lang === 'tr' ? 'Ürün Türü' : 'Product Type'}</h4>
                    <div className="sidebar-scroll-list">
                      {availableFilterOptions.types.map(tp => {
                        const isChecked = activeFilters.types.includes(tp);
                        return (
                          <label key={tp} className="cosmic-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleFilter('types', tp)}
                              style={{ display: 'none' }}
                            />
                            <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                              {isChecked && '✓'}
                            </span>
                            <span className="checkbox-text">{tp}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Ingredients & Material filter (Pet Care only) */}
                {selectedCategory === 'Pet Care' && (
                  <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                    <h4 className="sidebar-section-title">{lang === 'tr' ? 'İçerik & Malzeme' : 'Ingredients & Material'}</h4>
                    <div className="sidebar-scroll-list">
                      {availableFilterOptions.ingredients.map(ig => {
                        const isChecked = activeFilters.ingredients.includes(ig);
                        return (
                          <label key={ig} className="cosmic-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleFilter('ingredients', ig)}
                              style={{ display: 'none' }}
                            />
                            <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                              {isChecked && '✓'}
                            </span>
                            <span className="checkbox-text">{ig}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Weight Capacity filter (Baby & Children only) */}
                {selectedCategory === 'Baby & Children' && (
                  <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                    <h4 className="sidebar-section-title">{lang === 'tr' ? 'Taşıma Kapasitesi' : 'Weight Capacity'}</h4>
                    <div className="sidebar-scroll-list">
                      {availableFilterOptions.weightCapacities.map(wc => {
                        const isChecked = activeFilters.weightCapacities.includes(wc);
                        return (
                          <label key={wc} className="cosmic-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleFilter('weightCapacities', wc)}
                              style={{ display: 'none' }}
                            />
                            <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                              {isChecked && '✓'}
                            </span>
                            <span className="checkbox-text">{wc}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Safety Features & Extras filter (Baby & Children only) */}
                {selectedCategory === 'Baby & Children' && (
                  <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                    <h4 className="sidebar-section-title">{lang === 'tr' ? 'Özellik & Güvenlik' : 'Features & Safety'}</h4>
                    <div className="sidebar-scroll-list">
                      {availableFilterOptions.safetyFeatures.map(sf => {
                        const isChecked = activeFilters.safetyFeatures.includes(sf);
                        return (
                          <label key={sf} className="cosmic-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleFilter('safetyFeatures', sf)}
                              style={{ display: 'none' }}
                            />
                            <span className={`cosmic-checkbox-custom ${isChecked ? 'checked' : ''}`}>
                              {isChecked && '✓'}
                            </span>
                            <span className="checkbox-text">{sf}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </aside>

              {/* Showcase Grid of Cards on the right */}
              <div className="showcase-main-grid-wrapper">
                {showcaseProducts.length > 0 ? (
                  <div className="showcase-grid">
                    {showcaseProducts.map(product => {
                      const isSelected = comparedIds.includes(product.id);
                      return (
                        <div 
                          key={product.id} 
                          className={`glass-panel showcase-card ${isSelected ? 'selected-a' : ''}`}
                        >
                          <div className="showcase-card-header">
                            <span 
                              style={{ cursor: 'pointer' }}
                              className="brand-label link-style"
                              onClick={(e) => {
                                e.preventDefault();
                                navigateTo('publisher-detail', { publisherBrand: product.brand });
                              }}
                            >
                              {product.brand}
                            </span>
                            <span className="category-badge">{product.category}</span>
                          </div>
                          <h3 style={{ cursor: 'pointer' }} onClick={() => navigateTo('product-detail', { productId: product.id })}>
                            <span className="product-title-link">
                              {product.name}
                            </span>
                          </h3>
                          <div className="specs-preview">
                            {product.category === 'Books & Lifestyle' ? (
                              <>
                                <div className="spec-item">
                                  <span className="label">{t.Author || 'Author'}: </span>
                                  <span className="val">
                                    <span 
                                      style={{ cursor: 'pointer' }}
                                      className="spec-link"
                                      onClick={(e) => { e.stopPropagation(); navigateTo('author-detail', { authorName: product.specs.Author }); }}
                                    >
                                      {product.specs.Author}
                                    </span>
                                  </span>
                                </div>
                                <div className="spec-item">
                                  <span className="label">{t.Publisher || 'Publisher'}: </span>
                                  <span className="val">
                                    <span 
                                      style={{ cursor: 'pointer' }}
                                      className="spec-link"
                                      onClick={(e) => { e.stopPropagation(); navigateTo('publisher-detail', { publisherBrand: product.specs.Publisher }); }}
                                    >
                                      {product.specs.Publisher}
                                    </span>
                                  </span>
                                </div>
                                <div className="spec-item">
                                  <span className="label">{t.Pages || 'Pages'}: </span>
                                  <span className="val">{product.specs.Pages}</span>
                                </div>
                              </>
                            ) : product.category === 'Pet Care' ? (
                              <>
                                <div className="spec-item">
                                  <span className="label">{t.Type || 'Type'}: </span>
                                  <span className="val">{product.specs.Type || 'N/A'}</span>
                                </div>
                                <div className="spec-item">
                                  <span className="label">{t.Capacity || 'Capacity'}: </span>
                                  <span className="val">{product.specs.Capacity || 'N/A'}</span>
                                </div>
                                <div className="spec-item">
                                  <span className="label">{t.Weight || 'Weight'}: </span>
                                  <span className="val">{product.specs.Weight || 'N/A'}</span>
                                </div>
                              </>
                            ) : product.category === 'Baby & Children' ? (
                              <>
                                <div className="spec-item">
                                  <span className="label">{t.Type || 'Type'}: </span>
                                  <span className="val">{product.specs.Type || product.specs.Display || 'N/A'}</span>
                                </div>
                                <div className="spec-item">
                                  <span className="label">{t.Weight || 'Weight'}: </span>
                                  <span className="val">{product.specs.Weight || 'N/A'}</span>
                                </div>
                                <div className="spec-item">
                                  <span className="label">{t.Material || 'Material'}: </span>
                                  <span className="val">{product.specs.Material || 'N/A'}</span>
                                </div>
                              </>
                            ) : (product.category === 'Home Appliances' || product.category === 'Coffee Gear') ? (
                              <>
                                <div className="spec-item">
                                  <span className="label">{t.Type || 'Type'}: </span>
                                  <span className="val">{product.specs.Type || 'N/A'}</span>
                                </div>
                                <div className="spec-item">
                                  <span className="label">{t.Power || 'Power'}: </span>
                                  <span className="val">{product.specs.Power || product.specs['Suction Power'] || 'N/A'}</span>
                                </div>
                                <div className="spec-item">
                                  <span className="label">{t.Capacity || 'Capacity'}: </span>
                                  <span className="val">{product.specs.Capacity || product.specs['Water Tank'] || 'N/A'}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="spec-item">
                                  <span className="label">{t.Display || 'Display'}: </span>
                                  <span className="val">{product.specs.Display || 'N/A'}</span>
                                </div>
                                <div className="spec-item">
                                  <span className="label">{t.Processor || 'Processor'}: </span>
                                  <span className="val">{product.specs.Processor || 'N/A'}</span>
                                </div>
                                <div className="spec-item">
                                  <span className="label">{t.Battery || 'Battery'}: </span>
                                  <span className="val">{product.specs.Battery || 'N/A'}</span>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="showcase-card-actions" style={{ justifyContent: 'center' }}>
                            <button 
                              className={`btn-compare-slot ${isSelected ? 'active' : ''}`}
                              style={{
                                width: '100%',
                                background: isSelected ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
                                color: '#ffffff',
                                fontWeight: '700',
                                fontSize: '0.76rem',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.45rem 0.6rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: isSelected ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none'
                              }}
                              onClick={() => toggleCompare(product.id)}
                            >
                              {getCompareBtnText(product.id)}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', margin: '4rem 0', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    {t.noProductsFound}
                  </p>
                )}
              </div>
            </div>
          </section>


          {/* 4 Info Cards (2x2 Grid) */}
          <section className="info-grid">
            
            {/* Card 1 */}
            <div className="glass-panel info-card">
              <div className="info-card-header">
                <span className="icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                </span>
                <h3>{t.card1Title}</h3>
              </div>
              <p>{t.card1Desc}</p>
            </div>

            {/* Card 2 */}
            <div className="glass-panel info-card">
              <div className="info-card-header">
                <span className="icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
                  </svg>
                </span>
                <h3>{t.card2Title}</h3>
              </div>
              <p>{t.card2Desc}</p>
            </div>

            {/* Card 3 */}
            <div className="glass-panel info-card">
              <div className="info-card-header">
                <span className="icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </span>
                <h3>{t.card3Title}</h3>
              </div>
              <p>{t.card3Desc}</p>
            </div>

            {/* Card 4 */}
            <div className="glass-panel info-card">
              <div className="info-card-header">
                <span className="icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <h3>{t.card4Title}</h3>
              </div>
              <p>{t.card4Desc}</p>
            </div>

          </section>

          {/* Dynamic Content Area (Always renders below the 4 cards) */}
          <div id="dynamic-console" className="dynamic-console-area">
            
            {/* Loader Overlay */}
            {isLoading && (
              <div className="loader-overlay">
                <div className="circular-progress">
                  <svg viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="loader-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                    <circle className="bg" cx="50" cy="50" r="42" />
                    <circle 
                      className="progress" 
                      cx="50" 
                      cy="50" 
                      r="42" 
                      strokeDasharray="263.89"
                      strokeDashoffset={263.89 - (263.89 * loaderProgress) / 100}
                    />
                  </svg>
                </div>
                <div className="loader-text">{t.loadingMsg.replace('{progress}', loaderProgress)}</div>
              </div>
            )}

            {/* Main Comparison Section */}
            {!isLoading && (
              <section className="glass-panel compare-result-panel">
                <h2 style={{ textAlign: 'center', marginBottom: '2.5rem', fontSize: '1.8rem', fontWeight: '700' }}>{t.compareSectionTitle}</h2>
                
                {/* Product Titles VS Header */}
                <div className="compare-header-vs" style={{ justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {comparedProducts.map((prod, index) => (
                    <React.Fragment key={prod.id}>
                      {index > 0 && <div className="vs-badge">VS</div>}
                      <div className={`vs-prod-title`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.02)', padding: '0.4rem 0.9rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                          <span className="brand" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{prod.brand}</span>
                          <span className="name" style={{ fontSize: '1.1rem', fontWeight: '700', color: index % 2 === 0 ? 'var(--accent-cyan)' : 'var(--accent-purple)' }}>{prod.name}</span>
                        </div>
                        <button 
                          onClick={() => toggleCompare(prod.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            padding: '0.1rem 0.3rem',
                            lineHeight: '1',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title={lang === 'tr' ? 'Kaldır' : 'Remove'}
                        >
                          ×
                        </button>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                {comparedProducts.length > 0 ? (
                  <div className="compare-scroll-container" style={{ overflowX: 'auto', width: '100%', paddingBottom: '1rem' }}>
                    <div style={{ minWidth: comparedProducts.length > 2 ? `${comparedProducts.length * 300}px` : '100%', marginTop: '2.5rem' }}>
                      
                      {/* Score Cards Grid */}
                      <div className="compare-score-grid" style={{ gridTemplateColumns: `repeat(${comparedProducts.length}, 1fr)`, gap: '1.5rem' }}>
                        {comparedProducts.map((product, idx) => (
                          <div key={product.id} className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', position: 'relative' }}>
                            <button 
                              onClick={() => toggleCompare(product.id)}
                              className="card-remove-btn"
                              title={lang === 'tr' ? 'Karşılaştırmadan Çıkar' : 'Remove from Compare'}
                              style={{
                                position: 'absolute',
                                top: '0.8rem',
                                right: '0.8rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                transition: 'all 0.2s',
                                zIndex: 10
                              }}
                              onMouseEnter={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.2)'; e.target.style.color = '#ef4444'; }}
                              onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = 'var(--text-secondary)'; }}
                            >
                              ×
                            </button>
                            <div style={{ fontSize: '0.8rem', color: idx % 2 === 0 ? 'var(--accent-cyan)' : 'var(--accent-purple)', textTransform: 'uppercase', fontWeight: '600' }}>{product.category}</div>
                            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '1.2rem', paddingRight: '1.5rem' }}>{product.name}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                              {Object.entries(product.scores).map(([scoreName, scoreValue]) => (
                                <div key={scoreName}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.25rem' }}>
                                    <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{scoreName === 'performance' ? t.perf : scoreName === 'camera' ? t.cam : scoreName === 'battery' ? t.bat : t.val}</span>
                                    <span style={{ fontWeight: '600' }}>{scoreValue}/100</span>
                                  </div>
                                  <div style={{ background: 'rgba(255,255,255,0.06)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${scoreValue}%`, background: idx % 2 === 0 ? 'linear-gradient(90deg, #22d3ee, #6366f1)' : 'linear-gradient(90deg, #a855f7, #ec4899)', height: '100%' }}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <a href={getAmazonLink(product)} target="_blank" rel="noopener noreferrer" style={{ marginTop: '1.5rem', display: 'block', textDecoration: 'none' }}>
                              <button className="btn-getstarted" style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', background: idx % 2 === 0 ? 'linear-gradient(135deg, #22d3ee 0%, #6366f1 100%)' : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', color: '#ffffff' }}>
                                {t.offersBtn}
                              </button>
                            </a>
                          </div>
                        ))}
                      </div>

                      {/* Book Cover & Summary Card */}
                      {comparedProducts.some(p => p.category === "Books & Lifestyle") && (
                        <div className="book-comparison-details-grid" style={{ marginTop: '2rem', gridTemplateColumns: `repeat(${comparedProducts.length}, 1fr)`, gap: '1.5rem' }}>
                          {comparedProducts.map((product, idx) => {
                            if (product.category === "Books & Lifestyle") {
                              return <KitapyurduBookPanel key={product.id} product={product} lang={lang} t={t} slot={idx % 2 === 0 ? 'a' : 'b'} navigateTo={navigateTo} />;
                            } else {
                              return (
                                <div key={product.id} className="glass-panel book-details-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <div>
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.3, marginBottom: '1rem' }}>
                                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                    </svg>
                                    <p>{lang === 'tr' ? 'Seçilen ürün bir kitap değil.' : 'Selected product is not a book.'}</p>
                                  </div>
                                </div>
                              );
                            }
                          })}
                        </div>
                      )}

                      {/* Differences Filter Toggle */}
                      {comparedProducts.length > 1 && (
                        <div className="differences-filter-wrapper" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                          <label className="cosmic-checkbox-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem', color: '#ffffff', userSelect: 'none' }}>
                            <input 
                              type="checkbox" 
                              checked={showDifferencesOnly} 
                              onChange={(e) => setShowDifferencesOnly(e.target.checked)}
                              style={{ display: 'none' }}
                            />
                            <span className={`cosmic-checkbox-custom ${showDifferencesOnly ? 'checked' : ''}`}>
                              {showDifferencesOnly && '✓'}
                            </span>
                            <span>{t.showDifferences}</span>
                          </label>
                        </div>
                      )}

                      {/* Specs Table */}
                      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                        <table>
                          <thead>
                            <tr>
                              <th>{t.specName}</th>
                              {comparedProducts.map(product => (
                                <th key={product.id}>{product.name}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const allSpecKeys = Array.from(new Set(comparedProducts.flatMap(p => Object.keys(p.specs))));
                              const filteredSpecKeys = showDifferencesOnly 
                                ? allSpecKeys.filter(key => hasDifference(key, comparedProducts)) 
                                : allSpecKeys;
                              
                              return filteredSpecKeys.map(specKey => {
                                const winnerIndex = findSpecWinner(specKey, comparedProducts);
                                return (
                                  <tr key={specKey}>
                                    <td style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>{t[specKey] || specKey}</td>
                                    {comparedProducts.map((product, idx) => {
                                      const val = product.specs[specKey] || 'N/A';
                                      const isWinner = winnerIndex === idx;
                                      return (
                                        <td key={product.id} style={{ 
                                          color: isWinner ? 'var(--success)' : 'inherit',
                                          fontWeight: isWinner ? '600' : 'normal'
                                        }}>
                                          {renderSpecValue(val, specKey, product, lang, navigateTo)} {isWinner && '🏆'}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>

                      {/* Side-by-Side Reviews Section */}
                      <div className="reviews-comparison-section" style={{ marginTop: '3rem' }}>
                        <h3 className="reviews-section-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#ffffff', textAlign: 'center', fontWeight: '700' }}>
                          {t.reviewsTitle || 'User Reviews & Comments'}
                        </h3>
                        
                        <div className="reviews-comparison-grid" style={{ gridTemplateColumns: `repeat(${comparedProducts.length}, 1fr)`, gap: '1.5rem' }}>
                          {comparedProducts.map((product, idx) => (
                            <div key={product.id} className="reviews-column">
                              <h4 className="column-product-title" style={{ 
                                fontSize: '1.1rem', 
                                marginBottom: '1rem', 
                                color: idx % 2 === 0 ? 'var(--accent-cyan)' : 'var(--accent-purple)', 
                                fontWeight: '600', 
                                borderBottom: `1px solid ${idx % 2 === 0 ? 'rgba(34, 211, 238, 0.2)' : 'rgba(168, 85, 247, 0.2)'}`, 
                                paddingBottom: '0.5rem' 
                              }}>
                                {product.brand} {product.name} {t.reviewsFor || 'Reviews'}
                              </h4>
                              <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                {product.reviews && product.reviews.length > 0 ? (
                                  product.reviews.map((rev) => (
                                    <ReviewCard key={rev.id} review={rev} />
                                  ))
                                ) : (
                                  <p className="no-reviews-msg" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontStyle: 'italic' }}>
                                    {t.noReviews || 'No comments yet.'}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)' }}>
                    {lang === 'tr' ? 'Karşılaştırmak için lütfen aşağıdan ürün ekleyin.' : 'Please add products from below to compare.'}
                  </p>
                )}

              </section>
            )}

            {/* Patreon Callout */}
            <section className="glass-panel patreon-callout">
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>{t.patreonTitle}</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                {t.patreonDesc}
              </p>
              <a href="https://patreon.com/logiccompare" target="_blank" rel="noopener noreferrer" className="btn-patreon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.386 2.25c-4.484 0-8.118 3.635-8.118 8.12 0 4.483 3.634 8.118 8.118 8.118 4.485 0 8.12-3.635 8.12-8.119 0-4.485-3.635-8.12-8.12-8.12zM2.25 2.25h3.03v19.5H2.25z"/>
                </svg>
                <span>{t.patreonBtn}</span>
              </a>
            </section>
            
          </div>
        </>
      ) : currentView === 'product-detail' ? (
        renderProductDetail()
      ) : currentView === 'author-detail' ? (
        renderAuthorDetail()
      ) : currentView === 'publisher-detail' ? (
        renderPublisherBrandDetail()
      ) : (
        /* Admin View */
        <section className="glass-panel admin-panel-container">
          <h2>{t.adminTitle}</h2>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{t.adminDesc}</p>
          
          <div className="admin-stats-grid">
            <div className="glass-panel" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.adminDbStatus}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--success)' }}>{t.adminDbName}</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.adminTotalProducts}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{products.length} {t.adminProductsCount}</div>
            </div>
          </div>

          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>{t.adminAddProduct}</h3>
            
            <div className="admin-form-row-2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.adminProductName}</label>
                <input 
                  type="text" 
                  className="select-box" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem', width: '100%', minWidth: 'auto' }} 
                  placeholder="Örn: iPhone 16 Pro" 
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {newProductCategory === 'Books & Lifestyle' ? (lang === 'tr' ? 'Yayınevi *' : 'Publisher *') : t.adminProductBrand}
                </label>
                <input 
                  type="text" 
                  className="select-box" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem', width: '100%', minWidth: 'auto' }} 
                  placeholder={newProductCategory === 'Books & Lifestyle' ? (lang === 'tr' ? 'Örn: Can Yayınları' : 'e.g. Penguin') : (lang === 'tr' ? 'Örn: Apple' : 'e.g. Apple')}
                  value={newProductBrand}
                  onChange={(e) => setNewProductBrand(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="admin-form-row-2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.adminProductCategory}</label>
                <select 
                  className="select-box" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem', width: '100%', minWidth: 'auto' }} 
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value)}
                >
                  <option value="Smartphones">Smartphones</option>
                  <option value="Laptops">Laptops</option>
                  <option value="Home Appliances">Home Appliances</option>
                  <option value="Coffee Gear">Coffee Gear</option>
                  <option value="Pet Care">Pet Care</option>
                  <option value="Baby & Children">Baby & Children</option>
                  <option value="Books & Lifestyle">Books & Lifestyle</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.adminProductBattery}</label>
                <input 
                  type="text" 
                  className="select-box" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem', width: '100%', minWidth: 'auto' }} 
                  placeholder="Örn: 5000 mAh" 
                  value={newProductBattery}
                  onChange={(e) => setNewProductBattery(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-row-3">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.adminProductRAM}</label>
                <input 
                  type="text" 
                  className="select-box" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem', width: '100%', minWidth: 'auto' }} 
                  placeholder="Örn: 12 GB" 
                  value={newProductRAM}
                  onChange={(e) => setNewProductRAM(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.adminProductStorage}</label>
                <input 
                  type="text" 
                  className="select-box" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem', width: '100%', minWidth: 'auto' }} 
                  placeholder="Örn: 256 GB" 
                  value={newProductStorage}
                  onChange={(e) => setNewProductStorage(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.adminProductWeight}</label>
                <input 
                  type="text" 
                  className="select-box" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem', width: '100%', minWidth: 'auto' }} 
                  placeholder="Örn: 187 g" 
                  value={newProductWeight}
                  onChange={(e) => setNewProductWeight(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-getstarted" style={{ marginTop: '1rem', alignSelf: 'flex-start' }}>
              {t.adminSaveBtn}
            </button>

            {adminStatus && (
              <div style={{ 
                padding: '1rem', 
                borderRadius: '8px', 
                background: adminStatus.includes('✅') || adminStatus.includes('simulated') ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                border: `1px solid ${adminStatus.includes('✅') || adminStatus.includes('simulated') ? 'var(--success)' : 'var(--danger)'}`,
                color: adminStatus.includes('✅') || adminStatus.includes('simulated') ? 'var(--success)' : 'var(--danger)',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}>
                {adminStatus}
              </div>
            )}
          </form>
        </section>
      )}

      {/* High-Density Footer */}
      <footer>
        
        {/* 4-Column Directory Layout */}
        <div className="footer-directory">
          
          {/* Column 1 */}
          <div className="footer-col">
            <h4>{t.footerCol1Title}</h4>
            <ul>
              <li><a href="#about">{t.footerAbout}</a></li>
              <li><a href="#privacy">{t.footerPrivacy}</a></li>
              <li><a href="#terms">{t.footerTerms}</a></li>
              <li><a href="#apple">Apple</a></li>
              <li><a href="#samsung">Samsung</a></li>
              <li><a href="#xiaomi">Xiaomi</a></li>
              <li><a href="#dyson">Dyson</a></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="footer-col">
            <h4>{t.footerCol2Title}</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setComparedIds(['iphone-15-pro-max', 'galaxy-s24-ultra']); setCurrentView('compare'); }}>iPhone 15 Pro Max vs Galaxy S24 Ultra</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setComparedIds(['galaxy-s24-ultra', 'xiaomi-14-ultra']); setCurrentView('compare'); }}>Galaxy S24 Ultra vs Xiaomi 14 Ultra</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setComparedIds(['macbook-air-m3', 'macbook-pro-m3-max']); setCurrentView('compare'); }}>MacBook Air M3 vs MacBook Pro M3 Max</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setComparedIds(['xiaomi-14-ultra', 'iphone-15-pro-max']); setCurrentView('compare'); }}>Xiaomi 14 Ultra vs iPhone 15 Pro Max</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="footer-col">
            <h4>{t.footerCol3Title}</h4>
            <ul>
              <li><a href="#robot-vacuums">{t.footerRobotVacuums}</a></li>
              <li><a href="#coffee-machines">{t.footerCoffeeMachines}</a></li>
              <li><a href="#pet-feeders">{t.footerPetFeeders}</a></li>
              <li><a href="#baby-monitors">{t.footerBabyMonitors}</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="footer-col">
            <h4>{t.footerCol4Title}</h4>
            <ul>
              <li><a href="https://amazon.com" target="_blank" rel="nofollow noopener noreferrer">Amazon</a></li>
              <li><a href="https://ebay.com" target="_blank" rel="nofollow noopener noreferrer">eBay</a></li>
              <li><a href="https://walmart.com" target="_blank" rel="nofollow noopener noreferrer">Walmart</a></li>
              <li><a href="https://target.com" target="_blank" rel="nofollow noopener noreferrer">Target</a></li>
              <li><a href="https://aliexpress.com" target="_blank" rel="nofollow noopener noreferrer">AliExpress</a></li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Meta */}
        <div className="footer-bottom">
          <div>
            <div className="header-logo" style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>
              <svg width="22" height="22" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="28" cy="28" r="8" stroke="#22d3ee" strokeWidth="6" fill="#060814" />
                <circle cx="28" cy="72" r="8" stroke="#22d3ee" strokeWidth="6" fill="#060814" />
                <circle cx="72" cy="72" r="8" stroke="#22d3ee" strokeWidth="6" fill="#060814" />
                <circle cx="72" cy="28" r="8" stroke="#a855f7" strokeWidth="6" fill="#060814" />
                <path d="M28 36V64" stroke="#22d3ee" strokeWidth="6" />
                <path d="M36 72H64" stroke="#22d3ee" strokeWidth="6" />
                <path d="M34 66L66 34" stroke="#a855f7" strokeWidth="6" />
              </svg>
              <span className="bold">Logic</span>
              <span className="light">Compare</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t.footerCopyright} {t.footerTitle} | 
              <span onClick={() => setCurrentView('admin')} style={{ cursor: 'pointer', color: 'var(--text-secondary)', marginLeft: '0.5rem', textDecoration: 'underline' }}>
                {t.adminLink}
              </span>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#ffffff' }}>{t.footerSupport}</p>
            <a href="mailto:info@logiccompare.com" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700' }}>
              info@logiccompare.com
            </a>
          </div>
        </div>

      </footer>

      {/* Sticky Bottom Comparison Drawer */}
      {comparedIds.length > 0 && !isDrawerMinimized && (
        <div 
          className="cosmic-compare-drawer"
          onMouseEnter={resetDrawerInactivityTimer}
          onMouseMove={resetDrawerInactivityTimer}
          onClick={resetDrawerInactivityTimer}
          onTouchStart={resetDrawerInactivityTimer}
        >
          <div className="drawer-inner">
            <div className="drawer-left">
              <span className="drawer-count">
                {lang === 'tr' ? `Karşılaştır (${comparedIds.length})` : `Compare (${comparedIds.length})`}
              </span>
              <div className="drawer-thumbnails">
                {comparedProducts.map(prod => (
                  <div 
                    key={prod.id} 
                    className="drawer-thumb" 
                    title={`${prod.brand} ${prod.name}`}
                    onMouseEnter={(e) => handleThumbMouseEnter(prod, e)}
                    onMouseLeave={handleThumbMouseLeave}
                    onClick={() => setSelectedDetailProduct(prod)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={prod.frontCover} alt={prod.name} />
                    </div>
                    <button 
                      className="remove-thumb-btn" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        toggleCompare(prod.id); 
                        if (hoveredProduct && hoveredProduct.id === prod.id) {
                          setHoveredProduct(null);
                        }
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="drawer-right">
              <button 
                className="btn-compare-action" 
                onClick={() => {
                  const el = document.getElementById('dynamic-console');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {lang === 'tr' ? 'Seçilenleri Karşılaştır' : 'Compare Selected'}
              </button>
              <button className="btn-clear-action" onClick={() => setComparedIds([])}>
                {lang === 'tr' ? 'Temizle' : 'Clear'}
              </button>
              <button className="btn-minimize-action" onClick={() => setIsDrawerMinimized(true)}>
                {lang === 'tr' ? 'Gizle ▼' : 'Hide ▼'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimized Drawer Tab */}
      {comparedIds.length > 0 && isDrawerMinimized && (
        <button 
          className="cosmic-compare-drawer-minimized"
          onClick={() => setIsDrawerMinimized(false)}
          title={lang === 'tr' ? 'Karşılaştırma Çubuğunu Göster' : 'Show Comparison Bar'}
        >
          <span className="minimized-icon">📊</span>
          <span className="minimized-text">
            {lang === 'tr' ? `Karşılaştır (${comparedIds.length})` : `Compare (${comparedIds.length})`}
          </span>
          <span className="minimized-arrow">▲</span>
        </button>
      )}

      {/* Floating Tooltip for Compared Product Thumbnails */}
      {hoveredProduct && hoveredProductRect && (
        <div 
          className="drawer-thumb-tooltip"
          style={{
            position: 'fixed',
            left: `${hoveredProductRect.left + hoveredProductRect.width / 2}px`,
            bottom: `${window.innerHeight - hoveredProductRect.top + 10}px`,
            transform: 'translateX(-50%)',
            zIndex: 1000,
            pointerEvents: 'auto'
          }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div className="tooltip-inner-content" onClick={() => { setSelectedDetailProduct(hoveredProduct); setHoveredProduct(null); }}>
            <img src={hoveredProduct.frontCover} alt={hoveredProduct.name} className="tooltip-img" />
            <div className="tooltip-details">
              <span className="tooltip-brand">{hoveredProduct.brand}</span>
              <h4 className="tooltip-name">{hoveredProduct.name}</h4>
              <span className="tooltip-category">{hoveredProduct.category}</span>
              {hoveredProduct.scores && (
                <div className="tooltip-score">
                  <span className="score-label">{lang === 'tr' ? 'Teknik Puan:' : 'Tech Score:'}</span>
                  <span className="score-value">
                    {Math.round((hoveredProduct.scores.performance + hoveredProduct.scores.camera + hoveredProduct.scores.battery) / 3)}/100
                  </span>
                </div>
              )}
              <span className="tooltip-hint">{lang === 'tr' ? 'Detayları gör' : 'Click to open details'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Specifications Modal Overlay */}
      {selectedDetailProduct && (
        <div className="cosmic-modal-overlay" onClick={() => setSelectedDetailProduct(null)}>
          <div className="cosmic-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedDetailProduct(null)}>✕</button>
            <div className="modal-grid">
              <div className="modal-left">
                <div className="modal-img-container">
                  <img src={selectedDetailProduct.frontCover} alt={selectedDetailProduct.name} className="modal-img" />
                </div>
                <a href={getAmazonLink(selectedDetailProduct)} target="_blank" rel="noopener noreferrer" className="modal-shop-btn">
                  {lang === 'tr' ? 'Teklifleri Gör (Amazon) 🛒' : 'View Offers (Amazon) 🛒'}
                </a>
              </div>
              <div className="modal-right">
                <span className="modal-brand">{selectedDetailProduct.brand}</span>
                <h2 className="modal-name">{selectedDetailProduct.name}</h2>
                <span className="modal-category">{selectedDetailProduct.category}</span>

                <div className="modal-scores-section">
                  <h3>{lang === 'tr' ? 'Teknik Puanlar' : 'Technical Scores'}</h3>
                  <div className="modal-scores-grid">
                    {Object.entries(selectedDetailProduct.scores).map(([scoreName, scoreValue]) => (
                      <div key={scoreName} className="modal-score-bar-row">
                        <span className="modal-score-label">
                          {scoreName === 'performance' ? t.perf : scoreName === 'camera' ? t.cam : scoreName === 'battery' ? t.bat : t.val}
                        </span>
                        <div className="modal-score-progress-bg">
                          <div 
                            className="modal-score-progress-fill" 
                            style={{ 
                              width: `${scoreValue}%`,
                              background: scoreName === 'performance' ? 'linear-gradient(90deg, #22d3ee, #06b6d4)' : scoreName === 'camera' ? 'linear-gradient(90deg, #a855f7, #8b5cf6)' : 'linear-gradient(90deg, #10b981, #059669)'
                            }}
                          ></div>
                        </div>
                        <span className="modal-score-val">{scoreValue}/100</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-specs-section">
                  <h3>{lang === 'tr' ? 'Teknik Özellikler' : 'Specifications'}</h3>
                  <div className="modal-specs-list">
                    {Object.entries(selectedDetailProduct.specs).map(([specKey, specVal]) => (
                      <div key={specKey} className="modal-spec-item">
                        <span className="spec-name">{specKey}</span>
                        <span className="spec-value">{specVal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button 
          className="scroll-to-top-btn" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          title={lang === 'tr' ? 'Yukarı Git' : 'Scroll to Top'}
        >
          ▲
        </button>
      )}

    </div>
  );
}

export default App;
