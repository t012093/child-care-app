const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../assets/images');
const outputDir = path.join(__dirname, '../assets/images/optimized');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const images = [
  { input: 'hero.png', quality: 85, maxWidth: 1200 },
  { input: 'sample1.png', quality: 85, maxWidth: 800 },
  { input: 'sample2.png', quality: 85, maxWidth: 800 },
  { input: 'sample3.png', quality: 85, maxWidth: 800 },
  { input: 'sample4.png', quality: 85, maxWidth: 800 },
  { input: 'sample5.png', quality: 85, maxWidth: 800 },
  { input: 'sample6.png', quality: 85, maxWidth: 800 },
];

async function optimizeImages() {
  console.log('🚀 Starting image optimization...\n');

  for (const img of images) {
    const inputPath = path.join(inputDir, img.input);
    const baseName = path.parse(img.input).name;

    // Skip if input doesn't exist
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Skipping ${img.input} (not found)`);
      continue;
    }

    try {
      const originalSize = fs.statSync(inputPath).size;

      // Generate WebP version
      const webpOutput = path.join(outputDir, `${baseName}.webp`);
      await sharp(inputPath)
        .resize({ width: img.maxWidth, withoutEnlargement: true })
        .webp({ quality: img.quality })
        .toFile(webpOutput);

      // Generate JPEG version as fallback
      const jpegOutput = path.join(outputDir, `${baseName}.jpg`);
      await sharp(inputPath)
        .resize({ width: img.maxWidth, withoutEnlargement: true })
        .jpeg({ quality: img.quality, mozjpeg: true })
        .toFile(jpegOutput);

      const webpSize = fs.statSync(webpOutput).size;
      const jpegSize = fs.statSync(jpegOutput).size;

      console.log(`✅ ${img.input}`);
      console.log(`   Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   WebP: ${(webpSize / 1024).toFixed(2)} KB (${((1 - webpSize / originalSize) * 100).toFixed(1)}% reduction)`);
      console.log(`   JPEG: ${(jpegSize / 1024).toFixed(2)} KB (${((1 - jpegSize / originalSize) * 100).toFixed(1)}% reduction)\n`);
    } catch (error) {
      console.error(`❌ Error processing ${img.input}:`, error.message);
    }
  }

  console.log('✨ Image optimization complete!');
  console.log(`📁 Optimized images saved to: ${outputDir}`);
}

optimizeImages().catch(console.error);