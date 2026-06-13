import { mockProducts } from '../src/data/mockProducts.js';

const categoryAnalysis = {};

mockProducts.forEach(product => {
  const cat = product.category;
  if (!categoryAnalysis[cat]) {
    categoryAnalysis[cat] = {
      count: 0,
      brands: new Set(),
      specKeys: new Set(),
      sampleSpecs: {}
    };
  }
  
  categoryAnalysis[cat].count++;
  categoryAnalysis[cat].brands.add(product.brand);
  
  if (product.specs) {
    Object.keys(product.specs).forEach(key => {
      categoryAnalysis[cat].specKeys.add(key);
      if (!categoryAnalysis[cat].sampleSpecs[key]) {
        categoryAnalysis[cat].sampleSpecs[key] = new Set();
      }
      categoryAnalysis[cat].sampleSpecs[key].add(product.specs[key]);
    });
  }
});

console.log('=== PRODUCT DATABASE ANALYSIS ===');
Object.entries(categoryAnalysis).forEach(([cat, data]) => {
  console.log(`\nCategory: "${cat}" (${data.count} products)`);
  console.log(`  Brands (${data.brands.size}): ${Array.from(data.brands).join(', ')}`);
  console.log(`  Spec Keys: ${Array.from(data.specKeys).join(', ')}`);
  console.log('  Spec Value Samples:');
  Object.entries(data.sampleSpecs).forEach(([key, values]) => {
    console.log(`    - ${key}: ${Array.from(values).slice(0, 5).join(' | ')}`);
  });
});
