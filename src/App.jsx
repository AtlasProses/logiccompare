import React, { useState, useEffect, useRef } from 'react';
import { mockProducts } from './data/mockProducts';

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
        
        {/* Connection lines */}
        <path d="M50,60 L120,160 M120,160 L70,260 M70,260 L230,280 M230,280 L250,120 M250,120 L170,70 M170,70 L50,60" stroke="rgba(34, 211, 238, 0.15)" strokeWidth="1" />
        <path d="M50,60 L250,120 M170,70 L120,160 M120,160 L250,120 M120,160 L230,280 M70,260 L250,120" stroke="rgba(34, 211, 238, 0.1)" strokeWidth="0.8" strokeDasharray="2 2" />
        
        {/* Node circles */}
        <circle cx="50" cy="60" r="3" fill="#22d3ee" style={{ filter: 'url(#glow-effect)' }} />
        <circle cx="120" cy="160" r="3" fill="#22d3ee" style={{ filter: 'url(#glow-effect)' }} />
        <circle cx="70" cy="260" r="3.5" fill="#a855f7" style={{ filter: 'url(#glow-effect)' }} />
        <circle cx="230" cy="280" r="3" fill="#22d3ee" style={{ filter: 'url(#glow-effect)' }} />
        <circle cx="250" cy="120" r="3.5" fill="#a855f7" style={{ filter: 'url(#glow-effect)' }} />
        <circle cx="170" cy="70" r="3" fill="#22d3ee" style={{ filter: 'url(#glow-effect)' }} />
      </svg>

      {/* Constellation 2: Far Right Top (Elongated triangle pattern) */}
      <svg className="constellation-svg const-right-top" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30,140 L150,80 M150,80 L260,40 M260,40 L220,220 M220,220 L110,150 M110,150 L30,140" stroke="rgba(34, 211, 238, 0.15)" strokeWidth="1" />
        <path d="M150,80 L220,220 M30,140 L220,220 M110,150 L150,80" stroke="rgba(34, 211, 238, 0.08)" strokeWidth="0.8" strokeDasharray="3 3" />
        
        <circle cx="30" cy="140" r="3" fill="#22d3ee" />
        <circle cx="150" cy="80" r="3.5" fill="#a855f7" />
        <circle cx="260" cy="40" r="3" fill="#22d3ee" />
        <circle cx="220" cy="220" r="3.5" fill="#a855f7" />
        <circle cx="110" cy="150" r="3" fill="#22d3ee" />
      </svg>

      {/* Constellation 3: Far Right Bottom (Smaller triangular structure) */}
      <svg className="constellation-svg const-right-bottom" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30,120 L140,60 M140,60 L160,150 M160,150 L30,120" stroke="rgba(34, 211, 238, 0.15)" strokeWidth="1" />
        <path d="M90,110 L30,120 M90,110 L140,60 M90,110 L160,150" stroke="rgba(34, 211, 238, 0.1)" strokeWidth="0.8" />
        
        <circle cx="30" cy="120" r="3.5" fill="#a855f7" />
        <circle cx="140" cy="60" r="3" fill="#22d3ee" />
        <circle cx="160" cy="150" r="3" fill="#22d3ee" />
        <circle cx="90" cy="110" r="2.5" fill="#22d3ee" />
      </svg>
    </div>
  );
};

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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      
      {/* Moving stars, glowing cosmic nebulas, and logic constellations */}
      <DriftingStars />
      <FloatingPlanets />
      <BackgroundConstellations />

      {/* Header */}
      <header>
        <div className="header-logo" onClick={() => setCurrentView('compare')} onDoubleClick={() => setCurrentView('admin')}>
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
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); setCurrentView('compare'); }}>How It Works</a>
          <a href="#features" onClick={(e) => { e.preventDefault(); setCurrentView('compare'); }}>Features</a>
          <a href="#use-cases" onClick={(e) => { e.preventDefault(); setCurrentView('compare'); }}>Use Cases</a>
          <a href="#pricing" onClick={(e) => { e.preventDefault(); setCurrentView('compare'); }}>Pricing</a>
          <a href="#blog" onClick={(e) => { e.preventDefault(); setCurrentView('compare'); }}>Blog</a>
        </nav>

        <div className="header-actions">
          <button className="btn-account" onClick={() => setCurrentView(currentView === 'admin' ? 'compare' : 'admin')}>
            {currentView === 'admin' ? 'Back' : 'Account'}
          </button>
          <button className="btn-getstarted" onClick={() => setCurrentView('compare')}>Get Started</button>
        </div>
      </header>

      {currentView === 'compare' ? (
        <>
          {/* Hero Header */}
          <section className="hero">
            <h1>
              <span className="gradient">LogicCompare:</span> Find the logical choice
            </h1>
            <p className="subtitle">
              Your intelligent comparisons for any decision. Simply search, compare options, and save the best path.
            </p>
          </section>

          {/* Onboarding steps (Steps 1, 2, 3) */}
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
              <h3>Step 1: Search</h3>
              <p>Describe what you need to compare.</p>
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
              <h3>Step 2: Compare</h3>
              <p>Visualize features side-by-side with logical scoring.</p>
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
              <h3>Step 3: Save</h3>
              <p>Bookmark findings and share the optimized choice.</p>
            </div>

          </section>

          {/* Search container */}
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
                placeholder="What are you comparing today? (e.g., cloud providers, CRM, logic models...)" 
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
                Start Comparison
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
                ⚠️ Firewall Active: Too many searches. Please wait {cooldownTime} seconds.
              </div>
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
                <h3>Smart Filters</h3>
              </div>
              <p>Smart filters wnw search comparison, insights : anies, proorriers, and matalytics.</p>
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
                <h3>AI Insights</h3>
              </div>
              <p>Visualize the scientfic informnation mettnatios from comparisoners and anr:analytizs.</p>
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
                <h3>Custom Reports</h3>
              </div>
              <p>Menitor custom reyour, appressive options your compare, and custom soom reports.</p>
            </div>

            {/* Card 4 */}
            <div className="glass-panel info-card">
              <div className="info-card-header">
                <span className="icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <h3>Data Validation</h3>
              </div>
              <p>Energassors to the datt validation of a autlimote document and analyzte datautions.</p>
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
                <div className="loader-text">Querying D1 Shards... {loaderProgress}%</div>
              </div>
            )}

            {/* Main Comparison Section */}
            {!isLoading && (
              <section className="glass-panel" style={{ padding: '2.5rem', width: '100%' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem', fontWeight: '700' }}>Akıllı Ürün Kıyaslama Konsolu</h2>
                
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
                        triggerSearch(searchQuery); // Refresh query
                      }}
                      className={`category-tag ${selectedCategory === cat.id ? 'active' : ''}`}
                      disabled={isLoading}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

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

                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>VS</div>

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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                      
                      {/* Product A Summary */}
                      <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', fontWeight: '600' }}>{productA.category}</div>
                        <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '1.2rem' }}>{productA.name}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                          {Object.entries(productA.scores).map(([scoreName, scoreValue]) => (
                            <div key={scoreName}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.25rem' }}>
                                <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{scoreName === 'performance' ? 'Performans' : scoreName === 'camera' ? 'Kamera/Kalite' : scoreName === 'battery' ? 'Verimlilik/Batarya' : 'Fiyat/Değer'}</span>
                                <span style={{ fontWeight: '600' }}>{scoreValue}/100</span>
                              </div>
                              <div style={{ background: 'rgba(255,255,255,0.06)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${scoreValue}%`, background: 'linear-gradient(90deg, #22d3ee, #6366f1)', height: '100%' }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <a href={productA.amazonLink} target="_blank" rel="noopener noreferrer" style={{ marginTop: '1.5rem', display: 'block', textDecoration: 'none' }}>
                          <button className="btn-getstarted" style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}>
                            Teklifleri Gör (Amazon) 🛒
                          </button>
                        </a>
                      </div>

                      {/* Product B Summary */}
                      <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', textTransform: 'uppercase', fontWeight: '600' }}>{productB.category}</div>
                        <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '1.2rem' }}>{productB.name}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                          {Object.entries(productB.scores).map(([scoreName, scoreValue]) => (
                            <div key={scoreName}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.25rem' }}>
                                <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{scoreName === 'performance' ? 'Performans' : scoreName === 'camera' ? 'Kamera/Kalite' : scoreName === 'battery' ? 'Verimlilik/Batarya' : 'Fiyat/Değer'}</span>
                                <span style={{ fontWeight: '600' }}>{scoreValue}/100</span>
                              </div>
                              <div style={{ background: 'rgba(255,255,255,0.06)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${scoreValue}%`, background: 'linear-gradient(90deg, #a855f7, #ec4899)', height: '100%' }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <a href={productB.amazonLink} target="_blank" rel="noopener noreferrer" style={{ marginTop: '1.5rem', display: 'block', textDecoration: 'none' }}>
                          <button className="btn-getstarted" style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', color: '#ffffff' }}>
                            Teklifleri Gör (Amazon) 🛒
                          </button>
                        </a>
                      </div>

                    </div>

                    {/* Specs Table */}
                    <div style={{ overflowX: 'auto', marginTop: '2rem' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>Özellik Adı</th>
                            <th>{productA.name}</th>
                            <th>{productB.name}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(productA.specs).map(specKey => {
                            const valA = productA.specs[specKey] || 'N/A';
                            const valB = productB.specs[specKey] || 'N/A';
                            const winner = compareSpecs(specKey, valA, valB);
                            
                            return (
                              <tr key={specKey}>
                                <td style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>{specKey}</td>
                                <td style={{ 
                                  color: winner === 'A' ? 'var(--success)' : 'inherit',
                                  fontWeight: winner === 'A' ? '600' : 'normal'
                                }}>
                                  {valA} {winner === 'A' && '🏆'}
                                </td>
                                <td style={{ 
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
                  <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)' }}>Arama sonuçlarına uyan ürün bulunamadı. Lütfen filtreleri sıfırlayın.</p>
                )}

              </section>
            )}

            {/* Patreon Callout */}
            <section className="glass-panel patreon-callout">
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>❤️ LogicCompare Reklamsız ve Hızlıdır</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                Kullanıcı verilerini satmıyoruz ya da tam ekran açılan can sıkıcı reklamlar göstermiyoruz. LogicCompare'in sunucu maliyetleri Patreon üzerinden gelen desteklerle karşılanır.
              </p>
              <a href="https://patreon.com/logiccompare" target="_blank" rel="noopener noreferrer" className="btn-patreon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.386 2.25c-4.484 0-8.118 3.635-8.118 8.12 0 4.483 3.634 8.118 8.118 8.118 4.485 0 8.12-3.635 8.12-8.119 0-4.485-3.635-8.12-8.12-8.12zM2.25 2.25h3.03v19.5H2.25z"/>
                </svg>
                <span>Patron Ol ($3/ay)</span>
              </a>
            </section>
            
          </div>
        </>
      ) : (
        /* Admin View */
        <section className="glass-panel" style={{ maxWidth: '800px', margin: '3rem auto', width: '90%', padding: '2.5rem' }}>
          <h2>🔧 Cloudflare D1 SQL - Admin Paneli Simülatörü</h2>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Bu simülatör, yerel düzeyde veritabanını test etmeni sağlar. Gerçek projede bu form, D1 SQL veritabanına veri yazan güvenli Workers API uç noktalarını tetikler.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Veritabanı Durumu</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--success)' }}>logiccompare-core (D1 Shards)</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Toplam Yüklü Ürün</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{products.length} Ürün</div>
            </div>
          </div>

          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>Yeni Ürün Ekle</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ürün Adı *</label>
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
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Marka *</label>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Kategori</label>
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
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Batarya Gücü (mAh / Wh)</label>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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

            <button type="submit" className="btn-getstarted" style={{ marginTop: '1rem', alignSelf: 'flex-start' }}>
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
              <li><a href="#about">Hakkımızda</a></li>
              <li><a href="#privacy">Gizlilik Sözleşmesi</a></li>
              <li><a href="#terms">Kullanım Şartları</a></li>
              <li><a href="#apple">Apple</a></li>
              <li><a href="#samsung">Samsung</a></li>
              <li><a href="#xiaomi">Xiaomi</a></li>
              <li><a href="#dyson">Dyson</a></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="footer-col">
            <h4>Popüler Ürünler</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setProductAId('iphone-15-pro-max'); setProductBId('galaxy-s24-ultra'); setCurrentView('compare'); }}>iPhone 15 Pro Max</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setProductAId('galaxy-s24-ultra'); setProductBId('xiaomi-14-ultra'); setCurrentView('compare'); }}>Galaxy S24 Ultra</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setProductAId('macbook-air-m3'); setProductBId('macbook-pro-m3-max'); setCurrentView('compare'); }}>MacBook Air M3</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setProductAId('xiaomi-14-ultra'); setProductBId('iphone-15-pro-max'); setCurrentView('compare'); }}>Xiaomi 14 Ultra</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="footer-col">
            <h4>Özel Listeler</h4>
            <ul>
              <li><a href="#robot-vacuums">En Ucuz Robot Süpürgeler</a></li>
              <li><a href="#coffee-machines">En İyi Espresso Kahve Makineleri</a></li>
              <li><a href="#pet-feeders">Akıllı Evcil Hayvan Besleyiciler</a></li>
              <li><a href="#baby-monitors">En İyi Bebek Telsizleri</a></li>
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
              © 2014-2026 Tüm Hakları Saklıdır. LogicCompare global ürün teknik veri analiz platformudur. | 
              <span onClick={() => setCurrentView('admin')} style={{ cursor: 'pointer', color: 'var(--text-secondary)', marginLeft: '0.5rem', textDecoration: 'underline' }}>
                Yönetici Paneli 🔧
              </span>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#ffffff' }}>Destek & İletişim:</p>
            <a href="mailto:info@logiccompare.com" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700' }}>
              info@logiccompare.com
            </a>
          </div>
        </div>

      </footer>

    </div>
  );
}

export default App;
