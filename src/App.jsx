import React, { useState } from 'react';
import { mockProducts } from './data/mockProducts';

function App() {
  const [products, setProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [productAId, setProductAId] = useState('iphone-15-pro-max');
  const [productBId, setProductBId] = useState('galaxy-s24-ultra');
  const [currentView, setCurrentView] = useState('compare'); // 'compare' or 'admin'
  
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

  // Handle product creation in admin panel (local state mockup)
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProductName || !newProductBrand) {
      setAdminStatus('❌ Error: Product Name and Brand are required!');
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
    setAdminStatus('✅ Product successfully saved to Cloudflare D1 Local Simulator!');
    
    // Clear form
    setNewProductName('');
    setNewProductBrand('');
    setNewProductBattery('');
    setNewProductDisplay('');
    setNewProductCPU('');
    setNewProductRAM('');
    setNewProductStorage('');
    setNewProductWeight('');
    setNewProductOS('');

    // Reset status after delay
    setTimeout(() => setAdminStatus(''), 4000);
  };

  // Filter products by search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const productA = products.find(p => p.id === productAId) || products[0];
  const productB = products.find(p => p.id === productBId) || products[1];

  // Helper to compare numeric specs and find "winner"
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
          <span>⚖️</span> LogicCompare
        </div>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button 
            onClick={() => setCurrentView('compare')}
            className="btn-secondary" 
            style={{ 
              background: currentView === 'compare' ? 'rgba(255,255,255,0.1)' : 'transparent',
              padding: '0.5rem 1rem' 
            }}
          >
            Compare Tech
          </button>
          <button 
            onClick={() => setCurrentView('admin')}
            className="btn-secondary"
            style={{ 
              background: currentView === 'admin' ? 'rgba(255,255,255,0.1)' : 'transparent',
              padding: '0.5rem 1rem' 
            }}
          >
            🔧 Admin Panel
          </button>
          
          {/* Header Patreon Support Action */}
          <a href="https://patreon.com/logiccompare" target="_blank" rel="noopener noreferrer" className="btn-patreon" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.386 2.25c-4.484 0-8.118 3.635-8.118 8.12 0 4.483 3.634 8.118 8.118 8.118 4.485 0 8.12-3.635 8.12-8.119 0-4.485-3.635-8.12-8.12-8.12zM2.25 2.25h3.03v19.5H2.25z"/>
            </svg>
            <span>Support on Patreon</span>
          </a>
        </nav>
      </header>

      {currentView === 'compare' ? (
        <>
          {/* Hero Area */}
          <section className="hero">
            <h1>Global Tech Head-to-Head</h1>
            <p>Instantly compare hardware specs, calculate performance ratios, and view global affiliate prices. Zero trackers. 100% free.</p>
            
            <div className="search-container">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search smartphones, laptops, specs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['All', 'Smartphones', 'Laptops'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="btn-secondary"
                  style={{
                    background: selectedCategory === cat ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.03)',
                    borderColor: selectedCategory === cat ? 'transparent' : 'var(--panel-border)'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* Interactive Comparison Console */}
          <section className="glass-panel" style={{ maxWidth: '1200px', margin: '0 auto 3rem', width: '90%', padding: '2rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>Compare Side-by-Side</h2>
            
            <div className="compare-selector">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select First Device</label>
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
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select Second Device</label>
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
                    <h3 style={{ fontSize: '1.3rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>{productA.name}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {Object.entries(productA.scores).map(([scoreName, scoreValue]) => (
                        <div key={scoreName}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                            <span style={{ textTransform: 'capitalize' }}>{scoreName} Score</span>
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
                        View on Amazon US 🛒
                      </button>
                    </a>
                  </div>

                  {/* Product B Quick Summary */}
                  <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
                    <h3 style={{ fontSize: '1.3rem', color: 'var(--accent-secondary)', marginBottom: '1rem' }}>{productB.name}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {Object.entries(productB.scores).map(([scoreName, scoreValue]) => (
                        <div key={scoreName}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                            <span style={{ textTransform: 'capitalize' }}>{scoreName} Score</span>
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
                        View on Amazon US 🛒
                      </button>
                    </a>
                  </div>

                </div>

                {/* Specs Table */}
                <div style={{ overflowX: 'auto', marginTop: '2rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Specification</th>
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
              <p style={{ textAlign: 'center', marginTop: '2rem' }}>Select two products to start comparing.</p>
            )}

          </section>

          {/* Patreon Callout */}
          <section className="glass-panel patreon-callout">
            <h3>❤️ Keep LogicCompare Ad-Free & Premium</h3>
            <p>We don't sell user data or show annoying full-screen popups. LogicCompare is sustained by users like you supporting our hosting costs on Patreon.</p>
            <a href="https://patreon.com/logiccompare" target="_blank" rel="noopener noreferrer" className="btn-patreon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.386 2.25c-4.484 0-8.118 3.635-8.118 8.12 0 4.483 3.634 8.118 8.118 8.118 4.485 0 8.12-3.635 8.12-8.119 0-4.485-3.635-8.12-8.12-8.12zM2.25 2.25h3.03v19.5H2.25z"/>
              </svg>
              <span>Become a Patron ($3/mo)</span>
            </a>
          </section>
        </>
      ) : (
        /* Admin View */
        <section className="glass-panel" style={{ maxWidth: '800px', margin: '3rem auto', width: '90%', padding: '2.5rem' }}>
          <h2>🔧 Cloudflare D1 SQL - Admin Simulator</h2>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>This panel lets you manage the serverless database. In production, this form triggers secure Cloudflare Worker endpoints that perform SQL statements.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Database Name</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>speccompare-db (D1 Edge)</div>
            </div>
            <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Products Loaded</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>{products.length} Products</div>
            </div>
          </div>

          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>Add New Product</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Product Name *</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem' }} 
                  placeholder="e.g. iPhone 16 Pro" 
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Brand *</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem' }} 
                  placeholder="e.g. Apple" 
                  value={newProductBrand}
                  onChange={(e) => setNewProductBrand(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Category</label>
                <select 
                  className="select-box" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem' }} 
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value)}
                >
                  <option value="Smartphones">Smartphones</option>
                  <option value="Laptops">Laptops</option>
                  <option value="Smartwatches">Smartwatches</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Battery Size (mAh / Wh)</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem' }} 
                  placeholder="e.g. 5000 mAh" 
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
                  placeholder="e.g. 12 GB" 
                  value={newProductRAM}
                  onChange={(e) => setNewProductRAM(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Storage</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem' }} 
                  placeholder="e.g. 256 GB" 
                  value={newProductStorage}
                  onChange={(e) => setNewProductStorage(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Weight</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem' }} 
                  placeholder="e.g. 187 g" 
                  value={newProductWeight}
                  onChange={(e) => setNewProductWeight(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Display Size / Tech</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem' }} 
                  placeholder="e.g. 6.7-inch OLED" 
                  value={newProductDisplay}
                  onChange={(e) => setNewProductDisplay(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>OS</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ padding: '0.6rem 1rem', fontSize: '1rem' }} 
                  placeholder="e.g. Android 14" 
                  value={newProductOS}
                  onChange={(e) => setNewProductOS(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', alignSelf: 'flex-start' }}>
              Save Product to D1 SQL DB
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

      {/* Footer */}
      <footer>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div className="logo" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              <span>⚖️</span> LogicCompare
            </div>
            <p style={{ fontSize: '0.85rem' }}>© 2026 LogicCompare Inc. Global specifications and price comparisons.</p>
          </div>
          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Affiliate Disclosure</a>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Contact Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
