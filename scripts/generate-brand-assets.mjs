import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicImagesDir = path.resolve('public/images');
if (!fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(publicImagesDir, { recursive: true });
}

// 1. Create the Master Horizontal Brand Logo SVG (Header Logo)
const logoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 110" width="520" height="110" fill="none">
  <defs>
    <linearGradient id="cGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F0FF" />
      <stop offset="50%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#8B5CF6" />
    </linearGradient>
    <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#00F0FF" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- LC Emblem on the Left -->
  <g transform="translate(10, 8)">
    <!-- Solid Navy L -->
    <path d="M12 12 H30 V68 H74 V84 H12 Z" fill="#0B192C" />
    
    <!-- Gradient Circuit-Arc C -->
    <!-- Main outer/inner arc with slits -->
    <path d="M 76 22 
             A 38 38 0 0 1 96 60
             A 38 38 0 0 1 76 74
             L 76 60
             A 24 24 0 0 0 88 48
             A 24 24 0 0 0 76 36
             Z" 
          fill="url(#cGradient)" 
          filter="url(#subtleGlow)" />

    <!-- Top circuit branch & terminal node -->
    <path d="M 68 18 L 84 18" stroke="url(#cGradient)" stroke-width="7" stroke-linecap="round" />
    <circle cx="94" cy="18" r="6" fill="url(#cGradient)" />
    <circle cx="94" cy="18" r="2.5" fill="#FFFFFF" />

    <!-- Bottom circuit branch & terminal node -->
    <path d="M 68 78 L 84 78" stroke="url(#cGradient)" stroke-width="7" stroke-linecap="round" />
    <circle cx="94" cy="78" r="6" fill="url(#cGradient)" />
    <circle cx="94" cy="78" r="2.5" fill="#FFFFFF" />

    <!-- Center Arc segment -->
    <path d="M 52 14 A 42 42 0 0 1 64 16 L 60 26 A 30 30 0 0 0 52 25 Z" fill="url(#cGradient)" />
    <path d="M 52 82 A 42 42 0 0 0 64 80 L 60 70 A 30 30 0 0 1 52 71 Z" fill="url(#cGradient)" />
  </g>

  <!-- Typography on the Right -->
  <g transform="translate(125, 0)">
    <!-- LOGICCOMPARE -->
    <text x="0" y="52" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" letter-spacing="1.5" fill="#0B192C">
      LOGIC<tspan fill="#00C4D4">COMPARE</tspan>
    </text>
    
    <!-- Subtitle / Motto -->
    <text x="2" y="74" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" letter-spacing="3.2" fill="#64748B">
      INSIGHTS. COMPARE. DECIDE.
    </text>
  </g>
</svg>
`;

// 2. Create the Square Favicon / App Icon SVG
const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
  <defs>
    <linearGradient id="favGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F0FF" />
      <stop offset="50%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#8B5CF6" />
    </linearGradient>
  </defs>

  <g transform="translate(16, 16)">
    <!-- Solid Navy L -->
    <path d="M10 10 H26 V62 H66 V76 H10 Z" fill="#0B192C" />
    
    <!-- Gradient Circuit-Arc C -->
    <path d="M 68 20 
             A 34 34 0 0 1 86 52
             A 34 34 0 0 1 68 66
             L 68 54
             A 22 22 0 0 0 76 43
             A 22 22 0 0 0 68 32
             Z" 
          fill="url(#favGradient)" />

    <!-- Top circuit branch & terminal node -->
    <path d="M 62 16 L 76 16" stroke="url(#favGradient)" stroke-width="6" stroke-linecap="round" />
    <circle cx="85" cy="16" r="5.5" fill="url(#favGradient)" />
    <circle cx="85" cy="16" r="2.2" fill="#FFFFFF" />

    <!-- Bottom circuit branch & terminal node -->
    <path d="M 62 70 L 76 70" stroke="url(#favGradient)" stroke-width="6" stroke-linecap="round" />
    <circle cx="85" cy="70" r="5.5" fill="url(#favGradient)" />
    <circle cx="85" cy="70" r="2.2" fill="#FFFFFF" />
  </g>
</svg>
`;

async function generateAssets() {
  console.log("Generating brand assets...");

  // Write SVG source files
  fs.writeFileSync(path.resolve('public/images/logo.svg'), logoSvg.trim());
  fs.writeFileSync(path.resolve('public/images/favicon.svg'), faviconSvg.trim());
  fs.writeFileSync(path.resolve('public/favicon.svg'), faviconSvg.trim());

  // Render High-Resolution Transparent PNG Logo
  await sharp(Buffer.from(logoSvg))
    .png()
    .toFile(path.resolve('public/images/logo.png'));
  console.log("✓ Created public/images/logo.png");

  // Render Favicon PNGs (Multiple resolutions)
  await sharp(Buffer.from(faviconSvg))
    .resize(128, 128)
    .png()
    .toFile(path.resolve('public/images/favicon.png'));
  console.log("✓ Created public/images/favicon.png (128x128)");

  await sharp(Buffer.from(faviconSvg))
    .resize(32, 32)
    .png()
    .toFile(path.resolve('public/favicon.ico'));
  console.log("✓ Created public/favicon.ico");

  // Render OpenGraph Social Share Card (1200x630)
  const ogSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" fill="#0B192C">
    <rect width="1200" height="630" fill="#070F1E" />
    <circle cx="1000" cy="150" r="350" fill="#00F0FF" opacity="0.06" filter="blur(80px)" />
    <circle cx="200" cy="500" r="300" fill="#8B5CF6" opacity="0.08" filter="blur(90px)" />
    
    <g transform="translate(340, 180) scale(1.6)">
      ${logoSvg.replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 110" width="520" height="110" fill="none">', '').replace('</svg>', '')}
    </g>
    
    <text x="600" y="440" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600" fill="#94A3B8" letter-spacing="1">
      The Intelligent Synthesis &amp; Global Comparison Nexus
    </text>
  </svg>
  `;
  await sharp(Buffer.from(ogSvg))
    .png()
    .toFile(path.resolve('public/images/og-image.png'));
  console.log("✓ Created public/images/og-image.png");

  console.log("All brand assets generated successfully!");
}

generateAssets().catch(err => {
  console.error("Asset generation error:", err);
  process.exit(1);
});
