import React, { useState, useEffect, useRef } from 'react';
import { mockProducts } from './data/mockProducts';
import { translations } from './data/translations';

// Map of languages with country flags (using ISO country codes for CDN image rendering)
const languages = [
  { code: 'tr', country: 'tr', label: 'Türkçe' },
  { code: 'en', country: 'us', label: 'English' }
];

// Epey Category mappings
const categoriesMap = {
  'Smartphones': { code: 'telefon', label: 'TELEFON', icon: '📱' },
  'Books & Lifestyle': { code: 'kitap', label: 'KİTAP', icon: '📚' },
  'Pens': { code: 'kalem', label: 'KALEM', icon: '✏️' },
  'Erasers': { code: 'silgi', label: 'SİLGİ', icon: '🧼' },
  'Laptops': { code: 'bilgisayar', label: 'BİLGİSAYAR', icon: '💻' },
  'Home Appliances': { code: 'ev-aletleri', label: 'EV ALETLERİ', icon: '🔌' },
  'Coffee Gear': { code: 'kahve', label: 'KAHVE MAKİNELERİ', icon: '☕' },
  'Pet Care': { code: 'evcil-hayvan', label: 'EVCİL HAYVAN', icon: '🐕' },
  'Baby & Children': { code: 'bebek', label: 'BEBEK', icon: '👶' }
};

// Drifting stars fly-through space effect
const DriftingStars = () => {
  const stars = React.useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      left: Math.random() * 100,
      duration: Math.random() * 20 + 20,
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
    </div>
  );
};

function App() {
  const [products, setProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteList, setAutocompleteList] = useState([]);
  
  // Navigation views: 'home', 'category', 'compare', 'product-detail', 'admin'
  const [currentView, setCurrentView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('Smartphones');
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  // Translation state (default to Turkish for Epey look)
  const [lang, setLang] = useState('tr');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const t = translations[lang] || translations.tr;

  // Compare states
  const [comparedIds, setComparedIds] = useState(['samsung-galaxy-a27-5g', 'xiaomi-17-ultra-1tb']);
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);

  // Category sidebar filters
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState([]);

  // Search rate limiters
  const [isLoading, setIsLoading] = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(0);
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

  // Auto-cooldown ticker
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => setCooldownTime(cooldownTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  // Click outside listener for language dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format currency
  const formatPrice = (price, category) => {
    if (price === null || price === undefined) {
      return lang === 'tr' ? 'Henüz Ülkemizde Satışı Yok' : 'Not Available in Country';
    }
    if (category === 'Books & Lifestyle' || category === 'Pens' || category === 'Erasers') {
      // Stationery & Books in USD
      return `$${price.toFixed(2)}`;
    }
    // Laptops & Phones in Turkish Lira
    return `${price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
  };

  // Helper to generate dynamic merchant price list
  const getMerchantOffers = (product) => {
    if (product.price === null || product.price === undefined) return [];
    const seed = product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    
    const merchants = [
      { name: 'Hepsiburada', multiplier: 1.01, logo: '🍊', seller: 'Hepsiburada' },
      { name: 'idefix', multiplier: 0.99, logo: '🔵', seller: 'TeknoPazar' },
      { name: 'pazarama', multiplier: 1.005, logo: '🟣', seller: 'MediaMarkt' },
      { name: 'Amazon', multiplier: 1.0, logo: '🟡', seller: 'Amazon.com.tr' }
    ];

    return merchants.map(m => {
      const merchantPrice = product.price * m.multiplier;
      return {
        ...m,
        priceFormatted: formatPrice(merchantPrice, product.category),
        link: `https://www.google.com/search?q=${encodeURIComponent(product.brand + ' ' + product.name + ' ' + m.name)}`
      };
    }).sort((a, b) => {
      const priceA = product.price * a.multiplier;
      const priceB = product.price * b.multiplier;
      return priceA - priceB;
    });
  };

  // Generate deterministic sparkline price history
  const renderPriceSparkline = (product) => {
    if (product.price === null || product.price === undefined) {
      return <div style={{ height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>—</div>;
    }
    const seed = product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    // Draw 8 points representing price trend over last 3 months
    const points = [];
    let curPrice = product.price * 1.08;
    for (let i = 0; i < 8; i++) {
      const variation = Math.sin(seed + i) * 0.04 - 0.01; // deterministic waves
      curPrice = curPrice * (1 + variation);
      points.push(curPrice);
    }
    
    const minVal = Math.min(...points);
    const maxVal = Math.max(...points);
    const range = maxVal - minVal || 1;
    
    // Convert to SVG coordinates (width: 120, height: 35)
    const svgPoints = points.map((p, idx) => {
      const x = (idx / 7) * 120;
      const y = 30 - ((p - minVal) / range) * 25; // 5px padding
      return `${x},${y}`;
    }).join(' ');

    const lastX = 120;
    const lastY = 30 - ((points[7] - minVal) / range) * 25;
    
    const isDownTrend = points[7] < points[0];

    return (
      <div className="kitapyurdu-sparkline-container" style={{ margin: '0.5rem 0' }}>
        <span className="kitapyurdu-sparkline-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{lang === 'tr' ? 'Fiyat Değişimi' : 'Price Trend'}</span>
          <span style={{ color: isDownTrend ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
            {isDownTrend ? '▼ Düşüş' : '▲ Artış'}
          </span>
        </span>
        <svg viewBox="0 0 120 35" style={{ width: '100%', height: '35px', overflow: 'visible' }}>
          <path 
            d={`M ${svgPoints}`} 
            fill="none" 
            stroke={isDownTrend ? 'var(--success)' : '#f97316'} 
            strokeWidth="2" 
            strokeLinecap="round"
            strokeLinejoin="round" 
          />
          <circle cx={lastX} cy={lastY} r="3.5" fill={isDownTrend ? 'var(--success)' : '#f97316'} />
        </svg>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', textAlign: 'center', marginTop: '0.2rem' }}>
          {lang === 'tr' ? 'Son 3 Ayın Grafiği' : '3-Month Price Trend'}
        </span>
      </div>
    );
  };

  // Get epey specs list based on category
  const getCategoryKeySpecs = (product) => {
    if (product.category === 'Smartphones') {
      return [
        { label: lang === 'tr' ? 'Ekran' : 'Display', val: product.specs.Display ? product.specs.Display.split(',')[0] : '6.7 İnç', barWidth: 70 },
        { label: lang === 'tr' ? 'Depolama' : 'Storage', val: product.specs.Storage || '128 GB', barWidth: 50 },
        { label: lang === 'tr' ? 'RAM' : 'RAM', val: product.specs.RAM || '6 GB', barWidth: 60 },
        { label: lang === 'tr' ? 'Batarya' : 'Battery', val: product.specs.Battery || '5000 mAh', barWidth: 80 }
      ];
    } else if (product.category === 'Books & Lifestyle') {
      return [
        { label: lang === 'tr' ? 'Yazar' : 'Author', val: product.specs.Author || 'Bilinmiyor', barWidth: 100 },
        { label: lang === 'tr' ? 'Yayınevi' : 'Publisher', val: product.specs.Publisher || 'Bilinmiyor', barWidth: 100 },
        { label: lang === 'tr' ? 'Sayfa' : 'Pages', val: product.specs.Pages || '160 Sayfa', barWidth: 40 },
        { label: lang === 'tr' ? 'ISBN' : 'ISBN', val: product.specs.ISBN || 'N/A', barWidth: 100 }
      ];
    } else if (product.category === 'Pens') {
      return [
        { label: lang === 'tr' ? 'Tür' : 'Type', val: product.specs.Type || 'Kalem', barWidth: 100 },
        { label: lang === 'tr' ? 'Uç Kalınlığı' : 'Nib Size', val: product.specs['Nib Size'] || '0.5 mm', barWidth: 50 },
        { label: lang === 'tr' ? 'Gövde' : 'Body', val: product.specs['Body Material'] || 'N/A', barWidth: 60 },
        { label: lang === 'tr' ? 'Mekanizma' : 'Mechanism', val: product.specs['Refill Mechanism'] || 'N/A', barWidth: 80 }
      ];
    } else if (product.category === 'Erasers') {
      return [
        { label: lang === 'tr' ? 'Tür' : 'Type', val: product.specs.Type || 'Silgi', barWidth: 100 },
        { label: lang === 'tr' ? 'Malzeme' : 'Material', val: product.specs.Material || 'N/A', barWidth: 70 },
        { label: lang === 'tr' ? 'Tozsuz' : 'Dust-free', val: product.specs['Dust-free'] || 'N/A', barWidth: 90 },
        { label: lang === 'tr' ? 'Boyut' : 'Dimensions', val: product.specs.Dimensions || 'N/A', barWidth: 50 }
      ];
    } else {
      // Default fallback key specs
      const entries = Object.entries(product.specs).slice(0, 4);
      return entries.map(([k, v]) => ({ label: k, val: v, barWidth: 70 }));
    }
  };

  // Toggle comparison item
  const toggleCompare = (id) => {
    if (comparedIds.includes(id)) {
      setComparedIds(comparedIds.filter(item => item !== id));
    } else {
      if (comparedIds.length >= 5) {
        alert(lang === 'tr' ? 'En fazla 5 ürünü aynı anda kıyaslayabilirsiniz.' : 'You can compare a maximum of 5 products at once.');
        return;
      }
      setComparedIds([...comparedIds, id]);
    }
  };

  // Search handler
  const handleTyping = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (val.trim().length >= 2) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(val.toLowerCase()) || 
        p.brand.toLowerCase().includes(val.toLowerCase())
      );
      setAutocompleteList(filtered.slice(0, 8));
    } else {
      setAutocompleteList([]);
    }
  };

  const triggerSearch = (queryVal = searchQuery) => {
    if (cooldownTime > 0) return;
    if (!queryVal.trim()) return;

    setIsLoading(true);
    setLoaderProgress(0);
    setAutocompleteList([]);

    const interval = setInterval(() => {
      setLoaderProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          // Auto route to category list matching search query
          setSelectedCategory('All');
          setCurrentView('category');
          return 100;
        }
        return prev + 20;
      });
    }, 80);
  };

  const selectSuggestedProduct = (prod) => {
    setSearchQuery(prod.name);
    setAutocompleteList([]);
    setSelectedProductId(prod.id);
    setCurrentView('product-detail');
  };

  // Handle Add Product Simulator
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
      price: newProductCategory === 'Smartphones' ? 25000 : 15.00,
      specs: {
        "Display": newProductDisplay || "N/A",
        "Processor": newProductCPU || "N/A",
        "RAM": newProductRAM || "N/A",
        "Storage": newProductStorage || "N/A",
        "Battery": newProductBattery || "N/A",
        "Weight": newProductWeight || "N/A",
        "OS": newProductOS || "N/A"
      },
      scores: {
        performance: 85,
        camera: 80,
        battery: 85,
        value: 90
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

  // Calculate specifications and differences
  const getUniqueSpecKeysForCompare = () => {
    const comparedProducts = comparedIds.map(id => products.find(p => p.id === id)).filter(Boolean);
    if (comparedProducts.length === 0) return [];
    
    // Union of all keys in specs
    const keys = Array.from(new Set(comparedProducts.flatMap(p => Object.keys(p.specs))));
    
    if (showDifferencesOnly) {
      return keys.filter(key => {
        const values = comparedProducts.map(p => p.specs[key] || 'N/A');
        const uniqueValues = new Set(values);
        return uniqueValues.size > 1; // has difference
      });
    }
    
    return keys;
  };

  // Find spec winner (for visual styling)
  const findSpecWinnerIndex = (specName, prods) => {
    if (prods.length < 2) return -1;
    
    if (specName === 'Weight' || specName === 'Ağırlık') {
      let minVal = 999999;
      let winnerIdx = -1;
      let hasDiff = false;
      let firstVal = null;
      
      prods.forEach((p, idx) => {
        const valStr = p.specs[specName] || '';
        const match = valStr.match(/[0-9.]+/);
        if (match) {
          const num = parseFloat(match[0]);
          if (firstVal === null) firstVal = num;
          else if (num !== firstVal) hasDiff = true;
          
          if (num < minVal) {
            minVal = num;
            winnerIdx = idx;
          }
        }
      });
      return hasDiff ? winnerIdx : -1;
    }

    const higherIsBetter = ['Battery', 'Batarya', 'RAM', 'Storage', 'Depolama', 'Pages', 'Sayfa Sayısı', 'Suction Power', 'Emiş Gücü', 'Power', 'Güç'];
    if (higherIsBetter.includes(specName) || specName.toLowerCase().includes('kapasite')) {
      let maxVal = -1;
      let winnerIdx = -1;
      let hasDiff = false;
      let firstVal = null;

      prods.forEach((p, idx) => {
        const valStr = p.specs[specName] || '';
        const match = valStr.match(/[0-9.]+/);
        if (match) {
          const num = parseFloat(match[0]);
          if (firstVal === null) firstVal = num;
          else if (num !== firstVal) hasDiff = true;

          if (num > maxVal) {
            maxVal = num;
            winnerIdx = idx;
          }
        }
      });
      return hasDiff ? winnerIdx : -1;
    }
    return -1;
  };

  // Filtered products list for category view
  const categoryProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    
    // Sidebar search
    const matchesSidebarSearch = brandSearchQuery.trim() === '' || 
      product.name.toLowerCase().includes(brandSearchQuery.toLowerCase()) || 
      product.brand.toLowerCase().includes(brandSearchQuery.toLowerCase());
      
    // Sidebar Brand checklist
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
    
    // Sidebar Series checklist
    const productSeries = product.specs.Series || product.specs.Type || 'N/A';
    const matchesSeries = selectedSeries.length === 0 || selectedSeries.includes(productSeries);

    return matchesCategory && matchesSidebarSearch && matchesBrand && matchesSeries;
  });

  // Extract side filters for category view
  const getSidebarBrands = () => {
    const catProds = products.filter(p => selectedCategory === 'All' || p.category === selectedCategory);
    return Array.from(new Set(catProds.map(p => p.brand))).filter(Boolean).sort();
  };

  const getSidebarSeries = () => {
    const catProds = products.filter(p => selectedCategory === 'All' || p.category === selectedCategory);
    return Array.from(new Set(catProds.map(p => p.specs.Series || p.specs.Type))).filter(Boolean).sort();
  };

  const handleBrandCheckboxChange = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const handleSeriesCheckboxChange = (series) => {
    if (selectedSeries.includes(series)) {
      setSelectedSeries(selectedSeries.filter(s => s !== series));
    } else {
      setSelectedSeries([...selectedSeries, series]);
    }
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedSeries([]);
    setBrandSearchQuery('');
  };

  // Technical Score color generator
  const getScoreColorClass = (score) => {
    if (score >= 95) return 'score-green';
    if (score >= 85) return 'score-orange';
    return 'score-yellow';
  };

  const getProductAverageScore = (product) => {
    if (!product.scores) return 85;
    const vals = Object.values(product.scores);
    return Math.round(vals.reduce((acc, v) => acc + v, 0) / vals.length) || 85;
  };

  // breadcrumb helper
  const getCategoryLabel = (cat) => {
    const labelMap = {
      'Smartphones': lang === 'tr' ? 'Akıllı Telefon' : 'Smartphones',
      'Books & Lifestyle': lang === 'tr' ? 'Kitap' : 'Books & Lifestyle',
      'Pens': lang === 'tr' ? 'Kalem' : 'Pens',
      'Erasers': lang === 'tr' ? 'Silgi' : 'Erasers',
      'Laptops': lang === 'tr' ? 'Bilgisayar' : 'Laptops',
      'Home Appliances': lang === 'tr' ? 'Ev Aletleri' : 'Appliances',
      'Coffee Gear': lang === 'tr' ? 'Kahve Makinesi' : 'Coffee Gear',
      'Pet Care': lang === 'tr' ? 'Evcil Hayvan' : 'Pet Care',
      'Baby & Children': lang === 'tr' ? 'Bebek & Çocuk' : 'Baby & Kids'
    };
    return labelMap[cat] || cat;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Space Background */}
      <DriftingStars />
      <FloatingPlanets />

      {/* Header (Epey Style Redesign) */}
      <header className="epey-header">
        <div className="epey-header-top">
          <div className="epey-logo-container" onClick={() => { setCurrentView('home'); clearAllFilters(); }}>
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 0px 8px var(--orange-glow))' }}>
              <circle cx="28" cy="28" r="8" stroke="#f97316" strokeWidth="6" fill="#0c0e1a" />
              <circle cx="28" cy="72" r="8" stroke="#f97316" strokeWidth="6" fill="#0c0e1a" />
              <circle cx="72" cy="72" r="8" stroke="#f97316" strokeWidth="6" fill="#0c0e1a" />
              <circle cx="72" cy="28" r="8" stroke="#eab308" strokeWidth="6" fill="#0c0e1a" />
              <path d="M28 36V64" stroke="#f97316" strokeWidth="6" />
              <path d="M36 72H64" stroke="#f97316" strokeWidth="6" />
              <path d="M34 66L66 34" stroke="#eab308" strokeWidth="6" />
            </svg>
            <span className="logo-text">epey<span className="logo-sub">.compare</span></span>
          </div>

          {/* Center search console */}
          <div className="epey-search-console">
            <input 
              type="text" 
              className="epey-search-input" 
              placeholder={lang === 'tr' ? 'sitede ara...' : 'search products...'} 
              value={searchQuery}
              onChange={handleTyping}
              onKeyDown={(e) => e.key === 'Enter' && triggerSearch()}
            />
            <button className="epey-search-btn" onClick={() => triggerSearch()}>
              🔍
            </button>
            
            {/* Suggestions dropdown */}
            {autocompleteList.length > 0 && (
              <div className="epey-autocomplete-dropdown">
                {autocompleteList.map(prod => (
                  <div 
                    key={prod.id} 
                    className="epey-autocomplete-item"
                    onClick={() => selectSuggestedProduct(prod)}
                  >
                    <span>{prod.brand} {prod.name}</span>
                    <span className="epey-autocomplete-cat">{getCategoryLabel(prod.category)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="epey-header-actions">
            <button className="epey-btn-auth">
              👤 {lang === 'tr' ? 'Giriş Yap / Üye Ol' : 'Sign In'}
            </button>

            {/* Language dropdown */}
            <div className="custom-lang-selector" ref={langDropdownRef}>
              <button className="btn-lang-trigger" onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}>
                <span className="current-flag">
                  <img 
                    src={`https://flagcdn.com/w20/${lang === 'tr' ? 'tr' : 'us'}.png`} 
                    width="18" 
                    alt={lang === 'tr' ? 'Türkçe' : 'English'}
                  />
                </span>
                <span className="current-label">{lang.toUpperCase()}</span>
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
                      <img src={`https://flagcdn.com/w20/${l.country}.png`} width="18" alt={l.label} />
                      <span style={{ marginLeft: '8px' }}>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="epey-admin-link" onClick={() => setCurrentView('admin')} title={t.adminLink}>
              🔧
            </button>
          </div>
        </div>

        {/* Epey style ribbon category links */}
        <div className="epey-header-ribbon">
          {Object.entries(categoriesMap).map(([key, value]) => (
            <button
              key={key}
              className={`ribbon-item ${selectedCategory === key && currentView === 'category' ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(key);
                clearAllFilters();
                setCurrentView('category');
              }}
            >
              {value.icon} {value.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Body content loader state */}
      {isLoading && (
        <div className="epey-loading-bar-container">
          <div className="epey-loading-bar" style={{ width: `${loaderProgress}%` }}></div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {lang === 'tr' ? `Veriler Sorgulanıyor... %${loaderProgress}` : `Loading from Database... ${loaderProgress}%`}
          </span>
        </div>
      )}

      {/* Main View Router */}
      {!isLoading && (
        <main className="epey-content-container">

          {/* 1. HOMEPAGE VIEW */}
          {currentView === 'home' && (
            <div className="epey-home-layout">
              {/* Top Banner Row */}
              <div className="epey-banner-row">
                <div className="epey-hero-slider glass-panel">
                  <div className="slider-badge">Öne Çıkan</div>
                  <h2 className="slider-title">{lang === 'tr' ? 'Size en uygun ürünü bulun!' : 'Find the best choice for you!'}</h2>
                  <p className="slider-subtitle">
                    {lang === 'tr' 
                      ? 'Binlerce ürünü, orijinal özellikleri ve tarafsız teknik puanı ile karşılaştırın.'
                      : 'Compare thousands of products with original specs and unbiased logic scores.'}
                  </p>
                  <div className="slider-category-cards">
                    {Object.entries(categoriesMap).slice(0, 4).map(([key, val]) => (
                      <div 
                        key={key} 
                        className="slider-cat-card" 
                        onClick={() => { setSelectedCategory(key); clearAllFilters(); setCurrentView('category'); }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>{val.icon}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', marginTop: '0.4rem' }}>{val.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="epey-hero-quick-list glass-panel">
                  <h3>🔥 {lang === 'tr' ? 'Popüler Başlıklar' : 'Popular Highlights'}</h3>
                  <ul>
                    <li onClick={() => { setSelectedCategory('Smartphones'); setCurrentView('category'); }}><span>➕</span> {lang === 'tr' ? 'En Yeni Akıllı Telefonlar' : 'Latest Smartphones'}</li>
                    <li onClick={() => { setSelectedCategory('Books & Lifestyle'); setCurrentView('category'); }}><span>➕</span> {lang === 'tr' ? 'En Çok Okunan Kitaplar' : 'Top Read Books'}</li>
                    <li onClick={() => { setSelectedCategory('Pens'); setCurrentView('category'); }}><span>➕</span> {lang === 'tr' ? 'Kaliteli Çizim Kalemleri' : 'Drafting Pens'}</li>
                    <li onClick={() => { setSelectedCategory('Erasers'); setCurrentView('category'); }}><span>➕</span> {lang === 'tr' ? 'Toz Bırakmayan Sınav Silgileri' : 'Dust-Free Erasers'}</li>
                    <li onClick={() => { setSelectedCategory('Laptops'); setCurrentView('category'); }}><span>➕</span> {lang === 'tr' ? 'Güçlü İş Bilgisayarları' : 'Powerful Laptops'}</li>
                  </ul>
                </div>
              </div>

              {/* Son Eklenenler Grid layout (Smartphone prioritised) */}
              <div className="epey-section-header">
                <h2>⭐ {lang === 'tr' ? 'Son Eklenen Telefonlar' : 'Recently Added Phones'}</h2>
                <span className="see-all-link" onClick={() => { setSelectedCategory('Smartphones'); setCurrentView('category'); }}>
                  {lang === 'tr' ? 'Tümünü Gör >' : 'See All >'}
                </span>
              </div>
              <div className="epey-homepage-cards-grid">
                {products.filter(p => p.category === 'Smartphones').slice(0, 6).map(prod => {
                  const isCompared = comparedIds.includes(prod.id);
                  const specs = getCategoryKeySpecs(prod);
                  return (
                    <div key={prod.id} className="epey-home-card glass-panel">
                      <div className="card-top-info" onClick={() => { setSelectedProductId(prod.id); setCurrentView('product-detail'); }}>
                        <div className="card-image-box">
                          <img src={prod.frontCover} alt={prod.name} />
                        </div>
                        <div className="card-details-box">
                          <h4 className="card-title">{prod.brand} {prod.name}</h4>
                          <div className="card-quick-specs">
                            {specs.map((s, idx) => (
                              <div key={idx} className="spec-row">
                                <span className="lbl">{s.label}:</span>
                                <span className="val">{s.val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-bottom-bar">
                        <div className="card-price">{formatPrice(prod.price, prod.category)}</div>
                        <button 
                          className={`epey-compare-checkbox-btn ${isCompared ? 'active' : ''}`}
                          onClick={() => toggleCompare(prod.id)}
                        >
                          {isCompared ? '✓ Seçildi' : '+ Karşılaştır'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Son Eklenen Kitap ve Kalemler */}
              <div className="epey-section-header" style={{ marginTop: '3rem' }}>
                <h2>⭐ {lang === 'tr' ? 'Son Eklenen Diğer Ürünler' : 'Other Recently Added Items'}</h2>
              </div>
              <div className="epey-homepage-cards-grid">
                {products.filter(p => p.category !== 'Smartphones' && (p.category === 'Books & Lifestyle' || p.category === 'Pens' || p.category === 'Erasers')).slice(0, 6).map(prod => {
                  const isCompared = comparedIds.includes(prod.id);
                  const specs = getCategoryKeySpecs(prod);
                  return (
                    <div key={prod.id} className="epey-home-card glass-panel">
                      <div className="card-top-info" onClick={() => { setSelectedProductId(prod.id); setCurrentView('product-detail'); }}>
                        <div className="card-image-box">
                          <img src={prod.frontCover} alt={prod.name} />
                        </div>
                        <div className="card-details-box">
                          <span className="card-tag">{getCategoryLabel(prod.category)}</span>
                          <h4 className="card-title" style={{ marginTop: '0.2rem' }}>{prod.name}</h4>
                          <div className="card-quick-specs">
                            {specs.map((s, idx) => (
                              <div key={idx} className="spec-row">
                                <span className="lbl">{s.label}:</span>
                                <span className="val">{s.val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-bottom-bar">
                        <div className="card-price">{formatPrice(prod.price, prod.category)}</div>
                        <button 
                          className={`epey-compare-checkbox-btn ${isCompared ? 'active' : ''}`}
                          onClick={() => toggleCompare(prod.id)}
                        >
                          {isCompared ? '✓ Seçildi' : '+ Karşılaştır'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* 2. CATEGORY LIST VIEW */}
          {currentView === 'category' && (
            <div className="epey-category-layout">
              {/* Left Sidebar filters */}
              <aside className="epey-sidebar glass-panel">
                <div className="sidebar-filter-header">
                  <h3>🔍 {lang === 'tr' ? 'Filtreler' : 'Filters'}</h3>
                  <button className="clear-all-btn" onClick={clearAllFilters}>
                    {lang === 'tr' ? 'Temizle' : 'Clear'}
                  </button>
                </div>
                
                {/* Search query inside category */}
                <div className="sidebar-search-box">
                  <input 
                    type="text" 
                    placeholder={lang === 'tr' ? 'kategoride ara...' : 'search in category...'} 
                    value={brandSearchQuery}
                    onChange={(e) => setBrandSearchQuery(e.target.value)}
                  />
                </div>

                {/* Brands Checklist */}
                <div className="filter-group">
                  <h4>{lang === 'tr' ? 'Markalar' : 'Brands'}</h4>
                  <div className="checkbox-scroll-list">
                    {getSidebarBrands().map(b => (
                      <label key={b} className="checkbox-label">
                        <input 
                          type="checkbox" 
                          checked={selectedBrands.includes(b)}
                          onChange={() => handleBrandCheckboxChange(b)}
                        />
                        <span>{b}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Series/Type Checklist */}
                <div className="filter-group">
                  <h4>{lang === 'tr' ? 'Seri / Model Tipi' : 'Series / Type'}</h4>
                  <div className="checkbox-scroll-list">
                    {getSidebarSeries().map(s => (
                      <label key={s} className="checkbox-label">
                        <input 
                          type="checkbox" 
                          checked={selectedSeries.includes(s)}
                          onChange={() => handleSeriesCheckboxChange(s)}
                        />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Right list section */}
              <div className="epey-category-main">
                {/* Breadcrumbs */}
                <div className="epey-breadcrumbs">
                  <span onClick={() => setCurrentView('home')}>{lang === 'tr' ? 'Ana Sayfa' : 'Home'}</span>
                  <span>&gt;</span>
                  <span>{getCategoryLabel(selectedCategory)}</span>
                </div>

                {/* Header */}
                <div className="category-header-row">
                  <h1 className="category-title">
                    {lang === 'tr' 
                      ? `${selectedBrands.length > 0 ? selectedBrands.join(', ') : ''} ${getCategoryLabel(selectedCategory)} Fiyatları`
                      : `${selectedBrands.length > 0 ? selectedBrands.join(', ') : ''} ${getCategoryLabel(selectedCategory)} Prices`}
                  </h1>
                  
                  <span className="category-count">
                    {categoryProducts.length} {lang === 'tr' ? 'ürün bulundu' : 'products found'}
                  </span>
                </div>

                {/* Active Filters list */}
                {(selectedBrands.length > 0 || selectedSeries.length > 0 || brandSearchQuery.trim() !== '') && (
                  <div className="active-filters-row">
                    {selectedBrands.map(b => (
                      <span key={b} className="filter-tag" onClick={() => handleBrandCheckboxChange(b)}>{b} ✕</span>
                    ))}
                    {selectedSeries.map(s => (
                      <span key={s} className="filter-tag" onClick={() => handleSeriesCheckboxChange(s)}>{s} ✕</span>
                    ))}
                    {brandSearchQuery.trim() !== '' && (
                      <span className="filter-tag" onClick={() => setBrandSearchQuery('')}>{brandSearchQuery} ✕</span>
                    )}
                    <button className="clear-tags-btn" onClick={clearAllFilters}>{lang === 'tr' ? 'Tümünü Temizle' : 'Clear All'}</button>
                  </div>
                )}

                {/* List of products */}
                <div className="epey-product-list">
                  {categoryProducts.length > 0 ? (
                    categoryProducts.map(prod => {
                      const isCompared = comparedIds.includes(prod.id);
                      const specs = getCategoryKeySpecs(prod);
                      const avgScore = getProductAverageScore(prod);
                      return (
                        <div key={prod.id} className="epey-list-row glass-panel">
                          {/* Left cover */}
                          <div className="list-img-col" onClick={() => { setSelectedProductId(prod.id); setCurrentView('product-detail'); }}>
                            <img src={prod.frontCover} alt={prod.name} />
                          </div>

                          {/* Center info & specs */}
                          <div className="list-info-col">
                            <h3 className="list-prod-title" onClick={() => { setSelectedProductId(prod.id); setCurrentView('product-detail'); }}>
                              <span className="brand-prefix">{prod.brand}</span> {prod.name}
                            </h3>
                            <div className="list-compare-checkbox-wrap">
                              <label className="compare-checkbox-label">
                                <input 
                                  type="checkbox" 
                                  checked={isCompared}
                                  onChange={() => toggleCompare(prod.id)}
                                />
                                <span>+ Karşılaştır</span>
                              </label>
                            </div>
                            
                            {/* Specs rows inside card */}
                            <div className="list-specs-grid">
                              {specs.map((s, idx) => (
                                <div key={idx} className="list-spec-item">
                                  <div className="spec-meta">
                                    <span className="spec-lbl">{s.label}:</span>
                                    <span className="spec-val">{s.val}</span>
                                  </div>
                                  <div className="spec-bar-bg">
                                    <div className="spec-bar-fill" style={{ width: `${s.barWidth}%` }}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Price column */}
                          <div className="list-price-col">
                            <div className="list-price-value">{formatPrice(prod.price, prod.category)}</div>
                            <span className="shipping-badge">⚡ {lang === 'tr' ? 'Ücretsiz Kargo' : 'Free Shipping'}</span>
                            <button className="list-view-btn" onClick={() => { setSelectedProductId(prod.id); setCurrentView('product-detail'); }}>
                              {lang === 'tr' ? 'İncele' : 'View'}
                            </button>
                          </div>

                          {/* Technical score badge (Epey look) */}
                          <div className="list-score-col">
                            <div className={`technical-score-badge ${getScoreColorClass(avgScore)}`}>
                              <span className="score-num">{avgScore}</span>
                              <span className="score-lbl">Puan</span>
                            </div>
                          </div>

                        </div>
                      );
                    })
                  ) : (
                    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {lang === 'tr' ? 'Filtrelere uygun ürün bulunamadı. Lütfen filtrelerinizi sıfırlayın.' : 'No products found matching filters. Please reset your search.'}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* 3. COMPARISON VIEW */}
          {currentView === 'compare' && (
            <div className="epey-compare-page">
              <div className="epey-breadcrumbs">
                <span onClick={() => { setCurrentView('home'); clearAllFilters(); }}>{lang === 'tr' ? 'Ana Sayfa' : 'Home'}</span>
                <span>&gt;</span>
                <span>{lang === 'tr' ? 'Kıyaslama' : 'Compare'}</span>
              </div>

              {comparedIds.length > 0 ? (
                <div className="glass-panel epey-compare-box">
                  
                  {/* Dynamic compare header rows */}
                  <div className="epey-compare-header-grid" style={{ gridTemplateColumns: `150px repeat(${comparedIds.length}, 1fr)` }}>
                    <div className="grid-label-header">
                      <h3>{lang === 'tr' ? 'Ürün Detayları' : 'Product Details'}</h3>
                      
                      {/* Sadece Farkları Göster check toggle */}
                      <label className="show-diff-label">
                        <input 
                          type="checkbox" 
                          checked={showDifferencesOnly}
                          onChange={(e) => setShowDifferencesOnly(e.target.checked)}
                        />
                        <span>{lang === 'tr' ? 'Sadece Farkları Göster' : 'Show Differences Only'}</span>
                      </label>
                    </div>

                    {comparedIds.map(id => {
                      const prod = products.find(p => p.id === id);
                      if (!prod) return null;
                      const avgScore = getProductAverageScore(prod);
                      const offers = getMerchantOffers(prod);

                      return (
                        <div key={prod.id} className="grid-product-column-header">
                          <button className="remove-column-btn" onClick={() => toggleCompare(prod.id)} title="Kaldır">✕</button>
                          
                          {/* Image */}
                          <div className="compare-header-img" onClick={() => { setSelectedProductId(prod.id); setCurrentView('product-detail'); }}>
                            <img src={prod.frontCover} alt={prod.name} />
                          </div>

                          {/* Title */}
                          <h4 onClick={() => { setSelectedProductId(prod.id); setCurrentView('product-detail'); }}>
                            <span className="brand">{prod.brand}</span> {prod.name}
                          </h4>

                          {/* Technical Score badge circle */}
                          <div className="compare-score-wrapper">
                            <div className={`technical-score-badge-circle ${getScoreColorClass(avgScore)}`}>
                              <div className="score-circle-inner">
                                <span className="score-val">{avgScore}</span>
                                <span className="score-text">puan</span>
                              </div>
                            </div>
                          </div>

                          {/* Merchant Prices */}
                          <div className="compare-merchant-price-box">
                            {offers.length > 0 ? (
                              <>
                                <div className="primary-merchant-price">
                                  <span>{offers[0].logo} {offers[0].name}:</span>
                                  <strong style={{ color: '#fb923c' }}>{offers[0].priceFormatted}</strong>
                                </div>
                                <div className="merchant-price-list">
                                  {offers.slice(0, 3).map((off, idx) => (
                                    <div key={idx} className="merchant-price-row">
                                      <span className="m-name">{off.logo} {off.name}</span>
                                      <span className="m-price">{off.priceFormatted}</span>
                                      <a href={off.link} target="_blank" rel="noopener noreferrer" className="epey-btn-merchant-redirect">Git</a>
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <div className="no-merchants-notice">
                                {lang === 'tr' ? 'Henüz Ülkemizde Satışı Yok' : 'Not Available in Country'}
                              </div>
                            )}
                          </div>

                          {/* SVG Sparkline */}
                          {renderPriceSparkline(prod)}
                        </div>
                      );
                    })}
                  </div>

                  {/* Specifications details */}
                  <div className="epey-compare-table-wrapper">
                    <div className="table-section-title">
                      {lang === 'tr' ? 'TEMEL TEKNİK ÖZELLİKLER' : 'KEY TECHNICAL SPECIFICATIONS'}
                    </div>

                    <table className="epey-compare-table">
                      <tbody>
                        {getUniqueSpecKeysForCompare().map(specKey => {
                          const isWinnerIndex = findSpecWinnerIndex(specKey, comparedIds.map(id => products.find(p => p.id === id)).filter(Boolean));
                          
                          return (
                            <tr key={specKey}>
                              {/* Left row label */}
                              <td className="spec-label-col" style={{ width: '150px' }}>
                                {t[specKey] || specKey}
                              </td>

                              {/* Columns for values */}
                              {comparedIds.map((id, idx) => {
                                const prod = products.find(p => p.id === id);
                                const val = prod ? prod.specs[specKey] || 'N/A' : 'N/A';
                                const isWinner = isWinnerIndex === idx;

                                return (
                                  <td 
                                    key={id} 
                                    className={`spec-val-col ${isWinner ? 'spec-winner' : ''}`}
                                    style={{ color: isWinner ? 'var(--success)' : 'inherit' }}
                                  >
                                    {val} {isWinner && '🏆'}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Side-by-Side User Reviews Comparison */}
                  <div className="epey-compare-table-wrapper" style={{ marginTop: '2rem' }}>
                    <div className="table-section-title">
                      {lang === 'tr' ? 'KULLANICI YORUMLARI' : 'USER REVIEWS'}
                    </div>
                    <div className="epey-compare-header-grid" style={{ gridTemplateColumns: `150px repeat(${comparedIds.length}, 1fr)`, background: 'transparent', border: 'none', padding: '1rem 0' }}>
                      <div className="grid-label-header">
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {lang === 'tr' ? 'Kullanıcıların bu ürünlere dair yorumları ve deneyimleri.' : 'User comments and ratings.'}
                        </p>
                      </div>

                      {comparedIds.map(id => {
                        const prod = products.find(p => p.id === id);
                        if (!prod) return null;
                        return (
                          <div key={prod.id} style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {prod.reviews && prod.reviews.length > 0 ? (
                              prod.reviews.map(rev => (
                                <div key={rev.id} className="epey-compact-review-box glass-panel" style={{ padding: '0.8rem', fontSize: '0.82rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.2rem' }}>
                                    <strong>{rev.author}</strong>
                                    <span style={{ color: '#fb923c' }}>{'★'.repeat(rev.rating)}</span>
                                  </div>
                                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>{rev.content}</p>
                                </div>
                              ))
                            ) : (
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center' }}>
                                {lang === 'tr' ? 'Henüz yorum yapılmamış.' : 'No reviews yet.'}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {lang === 'tr' ? 'Kıyaslama listesi boş. Ürün eklemek için kategorileri veya aramayı kullanın.' : 'Compare list is empty. Add products first.'}
                  </p>
                  <button className="epey-search-btn" style={{ float: 'none', display: 'inline-block' }} onClick={() => setCurrentView('home')}>
                    {lang === 'tr' ? 'Ana Sayfaya Dön' : 'Back to Home'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. PRODUCT DETAIL VIEW */}
          {currentView === 'product-detail' && (() => {
            const product = products.find(p => p.id === selectedProductId);
            if (!product) return <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>{lang === 'tr' ? 'Ürün bulunamadı.' : 'Product not found.'}</div>;
            
            const isCompared = comparedIds.includes(product.id);
            const offers = getMerchantOffers(product);
            const avgScore = getProductAverageScore(product);

            return (
              <div className="epey-detail-page">
                {/* Breadcrumbs */}
                <div className="epey-breadcrumbs">
                  <span onClick={() => setCurrentView('home')}>{lang === 'tr' ? 'Ana Sayfa' : 'Home'}</span>
                  <span>&gt;</span>
                  <span onClick={() => { setSelectedCategory(product.category); clearAllFilters(); setCurrentView('category'); }}>
                    {getCategoryLabel(product.category)}
                  </span>
                  <span>&gt;</span>
                  <span>{product.brand}</span>
                </div>

                {/* Main Product Panel */}
                <div className="epey-detail-header-panel glass-panel">
                  <div className="epey-detail-title-row">
                    <h1>{product.brand} {product.name}</h1>
                    
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <button 
                        className={`epey-detail-compare-btn ${isCompared ? 'active' : ''}`}
                        onClick={() => toggleCompare(product.id)}
                      >
                        {isCompared ? '✓ Kıyaslamada' : '+ Karşılaştır'}
                      </button>
                      <span className="heart-icon-fav" style={{ fontSize: '1.5rem', cursor: 'pointer' }}>❤️</span>
                    </div>
                  </div>

                  {/* Core specifications blocks */}
                  <div className="epey-detail-grid">
                    {/* Left: image display */}
                    <div className="detail-left-col">
                      <div className="detail-image-main">
                        <img src={product.frontCover} alt={product.name} />
                      </div>
                      <div className="detail-image-gallery">
                        <div className="thumb active"><img src={product.frontCover} alt="thumb1" /></div>
                        <div className="thumb"><img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&sig=sub1" alt="thumb2" /></div>
                        <div className="thumb"><img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&sig=sub2" alt="thumb3" /></div>
                      </div>
                    </div>

                    {/* Middle: quick technical spec checklist columns */}
                    <div className="detail-middle-col">
                      <h3 className="section-subtitle">{lang === 'tr' ? 'Öne Çıkan Özellikler' : 'Key Specifications'}</h3>
                      
                      <div className="detail-specs-checklist-grid">
                        {Object.entries(product.specs).slice(0, 9).map(([key, val]) => (
                          <div key={key} className="checklist-item">
                            <span className="checklist-key">{t[key] || key}:</span>
                            <span className="checklist-val">
                              {val === 'Var' || val === 'Evet' || val === 'Yes' ? (
                                <span style={{ color: 'var(--success)' }}>✓ Var</span>
                              ) : val === 'Yok' || val === 'Hayır' || val === 'No' ? (
                                <span style={{ color: 'var(--danger)' }}>✕ Yok</span>
                              ) : (
                                val
                              )}
                            </span>
                          </div>
                        ))}
                      </div>

                      {product.description && (
                        <div className="detail-description-box" style={{ marginTop: '1.5rem' }}>
                          <strong>{lang === 'tr' ? 'Ürün Özeti:' : 'Product Summary:'}</strong>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.4rem', lineHeight: '1.5' }}>
                            {product.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Technical Score circle and direct purchase link */}
                    <div className="detail-right-col">
                      <div className="detail-score-box">
                        <span className="label-score">{lang === 'tr' ? 'TEKNİK PUAN' : 'TECHNICAL SCORE'}</span>
                        <div className={`technical-score-badge-circle ${getScoreColorClass(avgScore)}`} style={{ margin: '1rem auto' }}>
                          <div className="score-circle-inner">
                            <span className="score-val">{avgScore}</span>
                            <span className="score-text">puan</span>
                          </div>
                        </div>
                      </div>

                      {/* Sparkline for details page */}
                      {renderPriceSparkline(product)}
                    </div>

                  </div>

                </div>

                {/* Prices list comparing merchants */}
                <div className="epey-detail-prices-section glass-panel" style={{ marginTop: '2rem' }}>
                  <h2 className="section-title">💵 {product.brand} {product.name} {lang === 'tr' ? 'Fiyatları' : 'Prices'}</h2>
                  
                  {offers.length > 0 ? (
                    <div className="epey-merchant-table-container">
                      <table className="epey-merchant-table">
                        <thead>
                          <tr>
                            <th>{lang === 'tr' ? 'Mağaza' : 'Merchant'}</th>
                            <th>{lang === 'tr' ? 'Satıcı' : 'Seller'}</th>
                            <th>{lang === 'tr' ? 'Kargo' : 'Shipping'}</th>
                            <th>{lang === 'tr' ? 'Fiyat' : 'Price'}</th>
                            <th>{lang === 'tr' ? 'İşlem' : 'Action'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {offers.map((off, idx) => (
                            <tr key={idx}>
                              <td><strong style={{ fontSize: '1.05rem' }}>{off.logo} {off.name}</strong></td>
                              <td style={{ color: 'var(--text-secondary)' }}>{off.seller}</td>
                              <td><span className="shipping-badge">⚡ {lang === 'tr' ? 'Ücretsiz Kargo' : 'Free'}</span></td>
                              <td><strong style={{ fontSize: '1.2rem', color: '#fb923c' }}>{off.priceFormatted}</strong></td>
                              <td>
                                <a href={off.link} target="_blank" rel="noopener noreferrer" className="epey-btn-merchant-redirect-large">
                                  {lang === 'tr' ? 'Siteye Git >' : 'Go to Site >'}
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="detail-no-prices-card">
                      {lang === 'tr' ? '⚠️ Bu ürünün henüz ülkemizde satışı bulunmamaktadır.' : '⚠️ This product is not available in the country yet.'}
                    </div>
                  )}
                </div>

                {/* Full Spec List */}
                <div className="epey-detail-specs-table-section glass-panel" style={{ marginTop: '2rem' }}>
                  <h2 className="section-title">📊 {product.brand} {product.name} {lang === 'tr' ? 'Tüm Özellikleri' : 'Full Specifications'}</h2>
                  
                  <table className="epey-specs-detail-table">
                    <tbody>
                      {Object.entries(product.specs).map(([key, val]) => (
                        <tr key={key}>
                          <td className="lbl">{t[key] || key}</td>
                          <td className="val">
                            {val === 'Var' || val === 'Evet' ? (
                              <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓ Var</span>
                            ) : val === 'Yok' || val === 'Hayır' ? (
                              <span style={{ color: 'var(--danger)' }}>✕ Yok</span>
                            ) : (
                              val
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Reviews List */}
                <div className="epey-detail-reviews-section glass-panel" style={{ marginTop: '2rem' }}>
                  <h2 className="section-title">💬 {lang === 'tr' ? 'Kullanıcı Yorumları' : 'User Reviews'}</h2>
                  
                  <div className="reviews-list-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                    {product.reviews && product.reviews.length > 0 ? (
                      product.reviews.map(rev => (
                        <div key={rev.id} className="epey-detail-review-card glass-panel" style={{ padding: '1.2rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.5rem', marginBottom: '0.8rem' }}>
                            <div>
                              <strong>{rev.author}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '1rem' }}>{rev.date}</span>
                            </div>
                            <span style={{ color: '#fb923c' }}>{'★'.repeat(rev.rating)}</span>
                          </div>
                          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', fontSize: '0.92rem' }}>{rev.content}</p>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>
                        {lang === 'tr' ? 'Bu ürün için henüz bir yorum bulunmamaktadır. İlk yorumu siz yapın!' : 'No reviews for this product yet. Be the first to review!'}
                      </p>
                    )}
                  </div>
                </div>

              </div>
            );
          })()}

          {/* 5. ADMIN VIEW */}
          {currentView === 'admin' && (
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
                      <option value="Books & Lifestyle">Books & Lifestyle</option>
                      <option value="Pens">Pens</option>
                      <option value="Erasers">Erasers</option>
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
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>RAM</label>
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
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Depolama</label>
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
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ağırlık</label>
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

                <button type="submit" className="epey-search-btn" style={{ float: 'none', display: 'block', width: '100%', padding: '0.8rem' }}>
                  {t.adminSaveBtn}
                </button>

                {adminStatus && (
                  <div style={{ 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    background: adminStatus.includes('✅') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${adminStatus.includes('✅') ? 'var(--success)' : 'var(--danger)'}`,
                    color: adminStatus.includes('✅') ? 'var(--success)' : 'var(--danger)',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    textAlign: 'center'
                  }}>
                    {adminStatus}
                  </div>
                )}
              </form>
            </section>
          )}

        </main>
      )}

      {/* Global Bottom Comparison Drawer (Epey Style Redesign) */}
      {comparedIds.length > 0 && currentView !== 'compare' && (
        <div className="epey-compare-drawer">
          <div className="drawer-inner">
            <div className="drawer-left">
              <span className="drawer-count">
                {lang === 'tr' ? `Karşılaştır (${comparedIds.length})` : `Compare (${comparedIds.length})`}
              </span>
              <div className="drawer-thumbnails">
                {comparedIds.map(id => {
                  const prod = products.find(p => p.id === id);
                  if (!prod) return null;
                  return (
                    <div key={prod.id} className="drawer-thumb" title={`${prod.brand} ${prod.name}`}>
                      <img src={prod.frontCover} alt="thumb" />
                      <button className="remove-thumb-btn" onClick={() => toggleCompare(prod.id)}>✕</button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="drawer-right">
              <button className="btn-compare-action" onClick={() => setCurrentView('compare')}>
                {lang === 'tr' ? 'Seçilenleri Karşılaştır' : 'Compare Selected'}
              </button>
              <button className="btn-clear-action" onClick={() => setComparedIds([])}>
                {lang === 'tr' ? 'Temizle' : 'Clear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* High-Density Footer */}
      <footer style={{ marginTop: 'auto' }}>
        <div className="footer-directory">
          <div className="footer-col">
            <h4>{t.footerCol1Title}</h4>
            <ul>
              <li><a href="#about">{t.footerAbout}</a></li>
              <li><a href="#privacy">{t.footerPrivacy}</a></li>
              <li><a href="#terms">{t.footerTerms}</a></li>
              <li><a href="#apple">Apple</a></li>
              <li><a href="#samsung">Samsung</a></li>
              <li><a href="#xiaomi">Xiaomi</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t.footerCol2Title}</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setComparedIds(['samsung-galaxy-a27-5g', 'xiaomi-17-ultra-1tb']); setCurrentView('compare'); }}>A27 5G vs Xiaomi 17 Ultra</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setComparedIds(['xiaomi-17-ultra-1tb', 'xiaomi-17-ultra-512gb']); setCurrentView('compare'); }}>Xiaomi 17 Ultra 1TB vs 512GB</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t.footerCol3Title}</h4>
            <ul>
              <li><a href="#robot-vacuums">{t.footerRobotVacuums}</a></li>
              <li><a href="#coffee-machines">{t.footerCoffeeMachines}</a></li>
              <li><a href="#pet-feeders">{t.footerPetFeeders}</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t.footerCol4Title}</h4>
            <ul>
              <li><a href="https://amazon.com.tr" target="_blank" rel="nofollow noopener noreferrer">Amazon.com.tr</a></li>
              <li><a href="https://hepsiburada.com" target="_blank" rel="nofollow noopener noreferrer">Hepsiburada</a></li>
              <li><a href="https://idefix.com" target="_blank" rel="nofollow noopener noreferrer">Idefix</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            <div className="header-logo" style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>
              <span className="bold" style={{ color: '#f97316' }}>epey</span>
              <span className="light" style={{ color: '#ffffff' }}>.compare</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t.footerCopyright} {t.footerTitle}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#ffffff' }}>{t.footerSupport}</p>
            <a href="mailto:info@logiccompare.com" style={{ color: '#f97316', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700' }}>
              info@epeycompare.com
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
