import Jimp from 'jimp';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Script to convert SVG to PNG using sharp (recommended)
// Run with: node scripts/generate-png-icons.js

const iconsDir = path.join(process.cwd(), 'public', 'icons');
const svgPath = path.join(iconsDir, 'icon.svg');

const sizes = [16, 32, 192, 512];

async function generatePNGs() {
  try {
    console.log('📸 Generating PNG icons from SVG...');

    for (const size of sizes) {
      const outputPath = path.join(iconsDir, `favicon-${size}x${size}.png`);
      
      await sharp(svgPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 18, g: 18, b: 18, alpha: 1 },
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated favicon-${size}x${size}.png`);
    }

    // Generate maskable variants (with padding)
    for (const size of [192, 512]) {
      const outputPath = path.join(iconsDir, `favicon-${size}x${size}-maskable.png`);
      const paddedSize = Math.floor(size * 0.8); // 80% of the size for content

      await sharp(svgPath)
        .resize(paddedSize, paddedSize, {
          fit: 'contain',
          background: { r: 18, g: 18, b: 18, alpha: 0 },
        })
        .extend({
          top: Math.floor((size - paddedSize) / 2),
          bottom: Math.floor((size - paddedSize) / 2),
          left: Math.floor((size - paddedSize) / 2),
          right: Math.floor((size - paddedSize) / 2),
          background: { r: 18, g: 18, b: 18, alpha: 1 },
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated favicon-${size}x${size}-maskable.png`);
    }

    // Generate Apple touch icon (180x180)
    const applePath = path.join(iconsDir, 'apple-touch-icon.png');
    await sharp(svgPath)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 18, g: 18, b: 18, alpha: 1 },
      })
      .png()
      .toFile(applePath);

    console.log('✓ Generated apple-touch-icon.png');

    // Generate app shortcut icons
    const shortcuts = ['dashboard', 'settings'];
    for (const shortcut of shortcuts) {
      const outputPath = path.join(iconsDir, `${shortcut}-192x192.png`);
      await sharp(svgPath)
        .resize(192, 192, {
          fit: 'contain',
          background: { r: 18, g: 18, b: 18, alpha: 1 },
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated ${shortcut}-192x192.png`);
    }

    // Generate favicon.ico (from 32x32)
    const faviconPath = path.join(process.cwd(), 'public', 'favicon.ico');
    await sharp(svgPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 18, g: 18, b: 18, alpha: 1 },
      })
      .toFile(faviconPath.replace('.ico', '.png'));

    console.log('✓ Generated favicon base');
    console.log('\n✅ All PNG icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generatePNGs();
