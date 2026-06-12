import React, { useState, useEffect, useRef } from 'react';
import { mockProducts } from './data/mockProducts';

function App() {
  const [products, setProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteList, setAutocompleteList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Active compared products
  const [productAId, setProductAId] = useState('iphone-15-pro-max');
  const [productBId, setProductBId] = useState('galaxy-s24-ultra');
  const [currentView, setCurrentView] = useState('compare'); // 'compare' or 'admin'
  
  // Search state and loaders
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [rateLimitCount, setRateLimitCount] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  
  const searchInputRef = useRef(null);

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

  // Autocomplete typing logic (minimum 3 letters, doesn't refresh the page grid)
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
      // Reset rate limit count after 10 seconds
      setTimeout(() => setRateLimitCount(c => Math.max(0, c - 1)), 10000);
      return nextCount;
    });

    setIsLoading(true);
    setLoaderProgress(0);
    setAutocompleteList([]);

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
      setAdminStatus('❌ Hata: Ürün Adı ve Marka alanları zorunludur!');
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
    setAdminStatus('✅ Ürün Cloudflare D1 Local simülatörüne başarıyla eklendi!');
    
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

  // Filter products for the listing cards
  const filteredProducts = products.filter(product => {
    const matchesSearch = activeSearchQuery === '' || 
      product.name.toLowerCase().includes(activeSearchQuery.toLowerCase()) || 
      product.brand.toLowerCase().includes(activeSearchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const productA = products.find(p => p.id === productAId) || products[0];
  const productB = products.find(p => p.id === productBId) || products[1];

  const compareSpecs = (specName, valA, valB) => {
    if (specName === 'Battery') {
      const numA = parseInt(valA) || 0;
      const numB = parseInt(valB) || 0;
      if (numA > numB) return 'A';
      if (numB > numA) return 'B';
    }
    if (specName === 'Weight') {
      const numA = parseFloat(valA) || 999;
      const numB = parseFloat(valB) || 999;
      if (numA < numB) return 'A'; // lighter is better
      if (numB < numA) return 'B';
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Header */}
      <header>
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('compare')}>
          <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 0px 8px rgba(99, 102, 241, 0.6))' }}>
            <polygon points="50,10 90,85 10,85" stroke="url(#logo-grad)" strokeWidth="12" fill="none" strokeLinejoin="round" />
            <circle cx="50" cy="50" r="12" fill="#a855f7" />
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          LogicCompare
        </div>
        <nav style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
          <button 
            onClick={() => setCurrentView('compare')}
            className="btn-secondary" 
            style={{ 
              background: currentView === 'compare' ? 'rgba(255,255,255,0.08)' : 'transparent',
              borderColor: currentView === 'compare' ? 'var(--panel-border-hover)' : 'transparent',
              padding: '0.5rem 1.1rem',
              fontSize: '0.9rem'
            }}
          >
            Kıyaslama Motoru
          </button>
          <button 
            onClick={() => setCurrentView('admin')}
            className="btn-secondary"
            style={{ 
              background: currentView === 'admin' ? 'rgba(255,255,255,0.08)' : 'transparent',
              borderColor: currentView === 'admin' ? 'var(--panel-border-hover)' : 'transparent',
              padding: '0.5rem 1.1rem',
              fontSize: '0.9rem'
            }}
          >
            🔧 Admin Paneli
          </button>
          
          <a href="https://patreon.com/logiccompare" target="_blank" rel="noopener noreferrer" className="btn-patreon" style={{ padding: '0.5rem 1.1rem', fontSize: '0.9rem' }}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.386 2.25c-4.484 0-8.118 3.635-8.118 8.12 0 4.483 3.634 8.118 8.118 8.118 4.485 0 8.12-3.635 8.12-8.119 0-4.485-3.635-8.12-8.12-8.12zM2.25 2.25h3.03v19.5H2.25z"/>
            </svg>
            <span>Destek Ol</span>
          </a>
        </nav>
      </header>

      {currentView === 'compare' ? (
        <>
          {/* 1. Onboarding steps (Karşılama Ekranı) */}
          <section className="onboarding-steps">
            
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-icon-wrapper float-animation">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h3>Step 1: Search</h3>
              <p>Karşılaştırmak istediğin ürünü veya özellikleri arama motoruna yaz.</p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-icon-wrapper tilt-animation">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="2" x2="12" y2="22"></line>
                  <line x1="5" y1="9" x2="19" y2="9"></line>
                  <path d="M5 9c0 4 3 7 7 7s7-3 7-7"></path>
                </svg>
              </div>
              <h3>Step 2: Compare</h3>
              <p>Teknik özellikleri yan yana kıyasla ve en mantıklı olanı bul.</p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-icon-wrapper pulse-stars" style={{ position: 'relative' }}>
                {/* Micro stars background */}
                <span className="star-twinkle-1" style={{ position: 'absolute', top: '5px', left: '10px', fontSize: '10px' }}>⭐</span>
                <span className="star-twinkle-2" style={{ position: 'absolute', bottom: '8px', right: '8px', fontSize: '9px' }}>⭐</span>
                <span className="star-twinkle-3" style={{ position: 'absolute', top: '35px', right: '5px', fontSize: '8px' }}>⭐</span>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3>Step 3: Save</h3>
              <p>Ürün fiyat düşüşlerini ve teknik analiz güncellemelerini takip et.</p>
            </div>

          </section>

          {/* Hero & Search area */}
          <section className="hero" style={{ padding: '2rem 2rem 3rem' }}>
            <h1 style={{ fontSize: '2.5rem' }}>LogicCompare: Find the logical choice</h1>
            <p style={{ fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto' }}>
              Karmaşık veri tablolarını, ürün fiyatlarını ve kullanıcı yorumlarını saniyeler içinde tara. Mantıklı kararı ver.
            </p>
            
            <div className="search-container">
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  ref={searchInputRef}
                  className="search-input" 
                  placeholder="Kategori, marka veya cihaz özellikleri ara..." 
                  value={searchQuery}
                  onChange={handleTyping}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') triggerSearch();
                  }}
                  disabled={isLoading || cooldownTime > 0}
                />
                <button 
                  className="btn-primary" 
                  style={{ borderRadius: '16px' }}
                  onClick={() => triggerSearch()}
                  disabled={isLoading || cooldownTime > 0}
                >
                  Ara
                </button>
              </div>

              {/* Autocomplete floating dropdown list */}
              {autocompleteList.length > 0 && (
                <div className="autocomplete-dropdown">
                  {autocompleteList.map(prod => (
                    <div 
                      key={prod.id} 
                      className="autocomplete-item"
                      onClick={() => selectSuggestedProduct(prod)}
                    >
                      <span style={{ fontWeight: '600' }}>{prod.brand} - {prod.name}</span>
                      <span className="cat">{prod.category}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Cooldown Alert */}
              {cooldownTime > 0 && (
                <div style={{ color: 'var(--danger)', marginTop: '0.8rem', fontSize: '0.9rem', fontWeight: '600' }}>
                  ⚠️ Güvenlik duvarı aktif: Çok hızlı tıklama yaptınız. Lütfen {cooldownTime} saniye bekleyin.
                </div>
              )}
            </div>

            {/* Universal Categories Bar */}
            <div className="category-bar">
              {[
                { id: 'All', name: 'Tümü' },
                { id: 'Smartphones', name: '📱 Akıllı Telefonlar' },
                { id: 'Laptops', name: '💻 Dizüstü Bilgisayarlar' },
                { id: 'Pet Care', name: '🐈 Evcil Hayvan Ekipmanları' },
                { id: 'Baby & Children', name: '👶 Bebek Ürünleri' },
                { id: 'Coffee Gear', name: '☕ Kahve Makineleri' }
              ].map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    triggerSearch(searchQuery); // Refresh with selected category
                  }}
                  className={`category-tag ${selectedCategory === cat.id ? 'active' : ''}`}
                  disabled={isLoading}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </section>

          {/* Loader Overlay (0-100% Circular Progress) */}
          {isLoading && (
            <div className="loader-overlay">
              <div className="circular-progress">
                <svg viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="loader-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
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
              <div className="loader-text">D1 SQL Veritabanı Sorgulanıyor... %{loaderProgress}</div>
            </div>
          )}

          {/* Main Comparison Section */}
          {!isLoading && (
            <section className="glass-panel" style={{ maxWidth: '1200px', margin: '0 auto 3rem', width: '90%', padding: '2rem' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>Akıllı Ürün Kıyaslama Konsolu</h2>
              
              <div className="compare-selector">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Birinci Ürün</label>
                  <select 
                    className="select-box" 
                    value={productAId} 
                    onChange={(e) => setProductAId(e.target.value)}
                  >
                    {filteredProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.brand} - {p.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>VS</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>İkinci Ürün</label>
                  <select 
                    className="select-box" 
                    value={productBId} 
                    onChange={(e) => setProductBId(e.target.value)}
                  >
                    {filteredProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.brand} - {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {productA && productB ? (
                <div style={{ marginTop: '2.5rem' }}>
                  
                  {/* Score Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    
                    {/* Product A Quick Summary */}
                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>{productA.category}</div>
                      <h3 style={{ fontSize: '1.3rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>{productA.name}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {Object.entries(productA.scores).map(([scoreName, scoreValue]) => (
                          <div key={scoreName}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                              <span style={{ textTransform: 'capitalize' }}>{scoreName === 'performance' ? 'Performans' : scoreName === 'camera' ? 'Kamera/Kalite' : scoreName === 'battery' ? 'Verimlilik/Batarya' : 'Fiyat/Değer'}</span>
                              <span>{scoreValue}/100</span>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${scoreValue}%`, background: 'var(--accent-gradient)', height: '100%' }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <a href={productA.amazonLink} target="_blank" rel="noopener noreferrer" style={{ marginTop: '1.5rem', display: 'block' }}>
                        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                          Teklifleri Gör (Amazon) 🛒
                        </button>
                      </a>
                    </div>

                    {/* Product B Quick Summary */}
                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>{productB.category}</div>
                      <h3 style={{ fontSize: '1.3rem', color: 'var(--accent-secondary)', marginBottom: '1rem' }}>{productB.name}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {Object.entries(productB.scores).map(([scoreName, scoreValue]) => (
                          <div key={scoreName}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                              <span style={{ textTransform: 'capitalize' }}>{scoreName === 'performance' ? 'Performans' : scoreName === 'camera' ? 'Kamera/Kalite' : scoreName === 'battery' ? 'Verimlilik/Batarya' : 'Fiyat/Değer'}</span>
                              <span>{scoreValue}/100</span>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${scoreValue}%`, background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', height: '100%' }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <a href={productB.amazonLink} target="_blank" rel="noopener noreferrer" style={{ marginTop: '1.5rem', display: 'block' }}>
                        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', boxShadow: 'none' }}>
                          Teklifleri Gör (Amazon) 🛒
                        </button>
                      </a>
                    </div>

                  </div>

                  {/* Specs Table */}
                  <div style={{ overflowX: 'auto', marginTop: '2rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                          <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Özellik Adı</th>
                          <th style={{ padding: '1rem', fontWeight: '600' }}>{productA.name}</th>
                          <th style={{ padding: '1rem', fontWeight: '600' }}>{productB.name}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(productA.specs).map(specKey => {
                          const valA = productA.specs[specKey] || 'N/A';
                          const valB = productB.specs[specKey] || 'N/A';
                          const winner = compareSpecs(specKey, valA, valB);
                          
                          return (
                            <tr key={specKey} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                              <td style={{ padding: '1rem', fontWeight: '500', color: 'var(--text-secondary)' }}>{specKey}</td>
                              <td style={{ 
                                padding: '1rem', 
                                color: winner === 'A' ? 'var(--success)' : 'inherit',
                                fontWeight: winner === 'A' ? '600' : 'normal'
                              }}>
                                {valA} {winner === 'A' && '🏆'}
                              </td>
                              <td style={{ 
                                padding: '1rem', 
                                color: winner === 'B' ? 'var(--success)' : 'inherit',
                                fontWeight: winner === 'B' ? '600' : 'normal'
                              }}>
                                {valB} {winner === 'B' && '🏆'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                </div>
              ) : (
                <p style={{ textAlign: 'center', marginTop: '2rem' }}>Arama sonuçlarına uyan ürün bulunamadı. Lütfen filtreleri sıfırlayın.</p>
              )}

            </section>
          )}

          {/* 4 Core Info Panels */}
          <section className="info-grid">
            
            <div className="glass-panel info-card">
              <span className="icon">🎛️</span>
              <h3>Smart Filters</h3>
              <p>Çok kriterli algoritmalarımız sayesinde bütçe ve donanım gücüne göre nokta atışı arama yap.</p>
            </div>

            <div className="glass-panel info-card">
              <span className="icon">🧠</span>
              <h3>AI Insights</h3>
              <p>Botların topladığı ham veriler temiz bir yapay zeka süzgecinden geçerek mantıklı kıyaslamalara dönüştürülür.</p>
            </div>

            <div className="glass-panel info-card">
              <span className="icon">📊</span>
              <h3>Custom Reports</h3>
              <p>Kullanıcıların en çok aradığı ve merak ettiği baş başa donanım savaşlarının canlı analiz raporlarını gör.</p>
            </div>

            <div className="glass-panel info-card">
              <span className="icon">🛡️</span>
              <h3>Data Validation</h3>
              <p>Çift aşamalı doğrulama sistemimiz sayesinde teknik verilerin doğruluğu sürekli kontrol edilir ve güncellenir.</p>
            </div>

          </section>

          {/* Patreon Callout */}
          <section className="glass-panel patreon-callout" style={{ marginBottom: '4rem' }}>
            <h3>❤️ LogicCompare Reklamsız ve Hızlıdır</h3>
            <p>Kullanıcı verilerini satmıyoruz ya da tam ekran açılan can sıkıcı reklamlar göstermiyoruz. LogicCompare'in sunucu maliyetleri Patreon üzerinden gelen desteklerle karşılanır.</p>
            <a href="https://patreon.com/logiccompare" target="_blank" rel="noopener noreferrer" className="btn-patreon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.386 2.25c-4.484 0-8.118 3.635-8.118 8.12 0 4.483 3.634 8.118 8.118 8.118 4.485 0 8.12-3.635 8.12-8.119 0-4.485-3.635-8.12-8.12-8.12zM2.25 2.25h3.03v19.5H2.25z"/>
              </svg>
              <span>Patron Ol ($3/ay)</span>
            </a>
          </section>
        </>
      ) : (
        /* Admin View */
        <section className="glass-panel" style={{ maxWidth: '800px', margin: '3rem auto', width: '90%', padding: '2.5rem' }}>
          <h2>🔧 Cloudflare D1 SQL - Admin Paneli Simülatörü</h2>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>Bu simülatör, yerel düzeyde veritabanını test etmeni sağlar. Gerçek projede bu form, D1 SQL veritabanına veri yazan güvenli Workers API uç noktalarını tetikler.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Veritabanı Durumu</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--success)' }}>logiccompare-core (D1 Shards)</div>
            </div>
            <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Toplam Yüklü Ürün</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>{products.length} Ürün</div>
            </div>
          </div>

          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>Yeni Ürün Ekle</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ürün Adı *</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem' }} 
                  placeholder="Örn: iPhone 16 Pro" 
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Marka *</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem' }} 
                  placeholder="Örn: Apple" 
                  value={newProductBrand}
                  onChange={(e) => setNewProductBrand(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Kategori</label>
                <select 
                  className="select-box" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem' }} 
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
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Batarya Gücü (mAh / Wh)</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem' }} 
                  placeholder="Örn: 5000 mAh" 
                  value={newProductBattery}
                  onChange={(e) => setNewProductBattery(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>RAM</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem' }} 
                  placeholder="Örn: 12 GB" 
                  value={newProductRAM}
                  onChange={(e) => setNewProductRAM(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Depolama</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem' }} 
                  placeholder="Örn: 256 GB" 
                  value={newProductStorage}
                  onChange={(e) => setNewProductStorage(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ağırlık</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem' }} 
                  placeholder="Örn: 187 g" 
                  value={newProductWeight}
                  onChange={(e) => setNewProductWeight(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', alignSelf: 'flex-start' }}>
              Ürünü Simüle Ederek D1 DB'ye Kaydet
            </button>

            {adminStatus && (
              <div style={{ 
                padding: '1rem', 
                borderRadius: '8px', 
                background: adminStatus.startsWith('✅') ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                border: `1px solid ${adminStatus.startsWith('✅') ? 'var(--success)' : 'var(--danger)'}`,
                color: adminStatus.startsWith('✅') ? 'var(--success)' : 'var(--danger)',
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
            <h4>Kurumsal & Markalar</h4>
            <ul>
              <li><a href="#">Hakkımızda</a></li>
              <li><a href="#">Gizlilik Sözleşmesi</a></li>
              <li><a href="#">Kullanım Şartları</a></li>
              <li><a href="#">Apple</a></li>
              <li><a href="#">Samsung</a></li>
              <li><a href="#">Xiaomi</a></li>
              <li><a href="#">Dyson</a></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="footer-col">
            <h4>Popüler Ürünler</h4>
            <ul>
              <li><a href="#" onClick={() => { setProductAId('iphone-15-pro-max'); setProductBId('galaxy-s24-ultra'); setCurrentView('compare'); }}>iPhone 15 Pro Max</a></li>
              <li><a href="#" onClick={() => { setProductAId('galaxy-s24-ultra'); setProductBId('xiaomi-14-ultra'); setCurrentView('compare'); }}>Galaxy S24 Ultra</a></li>
              <li><a href="#" onClick={() => { setProductAId('macbook-air-m3'); setProductBId('macbook-pro-m3-max'); setCurrentView('compare'); }}>MacBook Air M3</a></li>
              <li><a href="#" onClick={() => { setProductAId('xiaomi-14-ultra'); setProductBId('iphone-15-pro-max'); setCurrentView('compare'); }}>Xiaomi 14 Ultra</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="footer-col">
            <h4>Özel Listeler</h4>
            <ul>
              <li><a href="#">En Ucuz Robot Süpürgeler</a></li>
              <li><a href="#">En İyi Espresso Kahve Makineleri</a></li>
              <li><a href="#">Akıllı Evcil Hayvan Besleyiciler</a></li>
              <li><a href="#">En İyi Bebek Telsizleri</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="footer-col">
            <h4>İş Ortakları & Rehber</h4>
            <ul>
              <li><a href="https://amazon.com" target="_blank" rel="nofollow noopener noreferrer">Amazon</a></li>
              <li><a href="https://temu.com" target="_blank" rel="nofollow noopener noreferrer">Temu</a></li>
              <li><a href="https://aliexpress.com" target="_blank" rel="nofollow noopener noreferrer">AliExpress</a></li>
              <li><a href="https://trendyol.com" target="_blank" rel="nofollow noopener noreferrer">Trendyol</a></li>
              <li><a href="https://hepsiburada.com" target="_blank" rel="nofollow noopener noreferrer">Hepsiburada</a></li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Meta */}
        <div className="footer-bottom">
          <div>
            <div className="logo" style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>
              <svg width="22" height="22" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="50,10 90,85 10,85" stroke="url(#logo-grad-footer)" strokeWidth="12" fill="none" strokeLinejoin="round" />
                <circle cx="50" cy="50" r="12" fill="#a855f7" />
                <defs>
                  <linearGradient id="logo-grad-footer" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              LogicCompare
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              © 2014-2026 Tüm Hakları Saklıdır. LogicCompare global ürün teknik veri analiz platformudur.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Destek & İletişim:</p>
            <a href="mailto:info@logiccompare.com" style={{ color: 'var(--accent-secondary)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700' }}>
              info@logiccompare.com
            </a>
          </div>
        </div>

      </footer>

    </div>
  );
}

export default App;
