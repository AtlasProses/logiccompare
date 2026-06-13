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

const KitapyurduBookPanel = ({ product, lang, t, slot }) => {
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
        <h4 className="book-title" style={{ margin: '0 0 0.5rem 0' }}>
          <a href={getGoogleBooksSearchLink(product.name, 'title')} target="_blank" rel="noopener noreferrer" className="product-title-link">
            {product.name}
          </a>
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
          <span className="book-author" style={{ color: 'var(--accent-cyan)', display: 'inline-flex', gap: '0.25rem' }}>
            <strong>{t.Author || 'Author'}:</strong>{' '}
            <a href={getGoogleBooksSearchLink(product.specs.Author, 'author')} target="_blank" rel="noopener noreferrer" className="link-style">
              {product.specs.Author}
            </a>
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', gap: '0.25rem' }}>
            <strong>{t.Publisher || 'Publisher'}:</strong>{' '}
            <a href={getGoogleBooksSearchLink(product.specs.Publisher, 'publisher')} target="_blank" rel="noopener noreferrer" className="link-style">
              {product.specs.Publisher}
            </a>
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

const renderSpecValue = (val, specKey, product, lang) => {
  if (!val || val === 'N/A') return 'N/A';
  if (product?.category === 'Books & Lifestyle') {
    if (['Author', 'Publisher', 'Translator', 'ISBN'].includes(specKey)) {
      return (
        <a href={getGoogleBooksSearchLink(val, specKey.toLowerCase())} target="_blank" rel="noopener noreferrer" className="spec-link">
          {val}
        </a>
      );
    }
  } else {
    // Non-book products: Brand, Processor, OS can link to Amazon search
    if (['Brand', 'Processor', 'OS', 'Series'].includes(specKey)) {
      return (
        <a href={getAmazonSearchLink(val, lang)} target="_blank" rel="noopener noreferrer" className="spec-link">
          {val}
        </a>
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
  
  const [currentView, setCurrentView] = useState('compare'); // 'compare' or 'admin'
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Comparison drawer enhancements states
  const [isDrawerMinimized, setIsDrawerMinimized] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [hoveredProductRect, setHoveredProductRect] = useState(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);

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
    setSearchQuery(prod.name);
    setAutocompleteList([]);
    triggerSearch(prod.name);
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
    const matchesSearch = searchQuery.trim() === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const showcaseProducts = showcaseFilteredProducts.slice(0, 6);

  const comparedProducts = comparedIds.map(id => products.find(p => p.id === id)).filter(Boolean);



  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Moving stars, glowing cosmic nebulas, and logic constellations */}
      <DriftingStars />
      <FloatingPlanets />
      <BackgroundConstellations />

      {/* Header */}
      <header>
        <div className="header-logo" onClick={() => { setCurrentView('compare'); setIsMobileMenuOpen(false); }} onDoubleClick={() => setCurrentView('admin')}>
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
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); setCurrentView('compare'); }}>{t.howItWorks}</a>
          <a href="#features" onClick={(e) => { e.preventDefault(); setCurrentView('compare'); }}>{t.features}</a>
          <a href="#use-cases" onClick={(e) => { e.preventDefault(); setCurrentView('compare'); }}>{t.useCases}</a>
          <a href="#pricing" onClick={(e) => { e.preventDefault(); setCurrentView('compare'); }}>{t.pricing}</a>
          <a href="#blog" onClick={(e) => { e.preventDefault(); setCurrentView('compare'); }}>{t.blog}</a>
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

            {/* Showcase Grid of Cards */}
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
                        {product.category === 'Books & Lifestyle' ? (
                          <a href={getGoogleBooksSearchLink(product.brand, 'publisher')} target="_blank" rel="noopener noreferrer" className="brand-label link-style">
                            {product.brand}
                          </a>
                        ) : (
                          <a href={getAmazonSearchLink(product.brand, lang)} target="_blank" rel="noopener noreferrer" className="brand-label link-style">
                            {product.brand}
                          </a>
                        )}
                        <span className="category-badge">{product.category}</span>
                      </div>
                      <h3>
                        {product.category === 'Books & Lifestyle' ? (
                          <a href={getGoogleBooksSearchLink(product.name, 'title')} target="_blank" rel="noopener noreferrer" className="product-title-link">
                            {product.name}
                          </a>
                        ) : (
                          <a href={getAmazonSearchLink(`${product.brand} ${product.name}`, lang)} target="_blank" rel="noopener noreferrer" className="product-title-link">
                            {product.name}
                          </a>
                        )}
                      </h3>
                      <div className="specs-preview">
                        {product.category === 'Books & Lifestyle' ? (
                          <>
                            <div className="spec-item">
                              <span className="label">{t.Author || 'Author'}: </span>
                              <span className="val">
                                <a href={getGoogleBooksSearchLink(product.specs.Author, 'author')} target="_blank" rel="noopener noreferrer" className="spec-link">
                                  {product.specs.Author}
                                </a>
                              </span>
                            </div>
                            <div className="spec-item">
                              <span className="label">{t.Publisher || 'Publisher'}: </span>
                              <span className="val">
                                <a href={getGoogleBooksSearchLink(product.specs.Publisher, 'publisher')} target="_blank" rel="noopener noreferrer" className="spec-link">
                                  {product.specs.Publisher}
                                </a>
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
              <p style={{ textAlign: 'center', margin: '2rem 0', color: 'var(--text-secondary)' }}>
                {t.noProductsFound}
              </p>
            )}
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
                              return <KitapyurduBookPanel key={product.id} product={product} lang={lang} t={t} slot={idx % 2 === 0 ? 'a' : 'b'} />;
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

                      {/* Specs Table */}
                      <div style={{ overflowX: 'auto', marginTop: '2rem' }}>
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
                            {Array.from(new Set(comparedProducts.flatMap(p => Object.keys(p.specs)))).map(specKey => {
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
                                        {renderSpecValue(val, specKey, product, lang)} {isWinner && '🏆'}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
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
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.adminProductBrand}</label>
                <input 
                  type="text" 
                  className="select-box" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem', width: '100%', minWidth: 'auto' }} 
                  placeholder="Örn: Apple" 
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
                  <option value="Pet Care">Pet Care</option>
                  <option value="Baby & Children">Baby & Children</option>
                  <option value="Coffee Gear">Coffee Gear</option>
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
