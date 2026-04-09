#!/usr/bin/env node

/**
 * Image Optimization Script - Geek Gaming Center
 * Compresses and converts images to modern formats
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, '../public/images');

// Image optimization config
const CONFIG = {
  // Maximum widths for different image types
  maxWidth: {
    hero: 1920,
    product: 800,
    thumbnail: 400,
  },
  // JPEG quality (0-100)
  jpegQuality: 80,
  // WebP quality (0-100)
  webpQuality: 85,
  // Maximum file size in KB (approximate)
  maxFileSizeKB: 200,
};

async function optimizeImage(filePath) {
  const stats = fs.statSync(filePath);
  const originalSize = stats.size;
  const originalSizeKB = (originalSize / 1024).toFixed(2);

  // Skip small files
  if (originalSize < 50 * 1024) {
    console.log(`✓ Skipped (small): ${path.basename(filePath)} (${originalSizeKB} KB)`);
    return { skipped: true, originalSize };
  }

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Determine max width based on image dimensions
    let maxWidth = CONFIG.maxWidth.hero;
    if (metadata.width < 500) {
      maxWidth = CONFIG.maxWidth.thumbnail;
    } else if (metadata.width < 1200) {
      maxWidth = CONFIG.maxWidth.product;
    }

    // Resize if needed
    let processedImage = image;
    if (metadata.width > maxWidth) {
      processedImage = processedImage.resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside',
      });
    }

    const ext = path.extname(filePath).toLowerCase();
    const baseName = path.basename(filePath, ext);
    const dirName = path.dirname(filePath);

    // Convert to WebP (better compression)
    const webpPath = path.join(dirName, `${baseName}.webp`);
    await processedImage
      .webp({ quality: CONFIG.webpQuality })
      .toFile(webpPath);

    const webpStats = fs.statSync(webpPath);
    const webpSizeKB = (webpStats.size / 1024).toFixed(2);
    const savings = ((originalSize - webpStats.size) / originalSize * 100).toFixed(1);

    console.log(`✓ Optimized: ${baseName}${ext} → ${baseName}.webp`);
    console.log(`  ${originalSizeKB} KB → ${webpSizeKB} KB (${savings}% reduction)`);

    // Delete original if WebP is smaller and it's not already WebP
    if (ext !== '.webp' && webpStats.size < originalSize) {
      fs.unlinkSync(filePath);
      console.log(`  Deleted original: ${baseName}${ext}`);
    }

    return {
      optimized: true,
      originalSize,
      newSize: webpStats.size,
      savings: ((originalSize - webpStats.size) / originalSize * 100),
    };
  } catch (error) {
    console.error(`✗ Error optimizing ${path.basename(filePath)}:`, error.message);
    return { error: true, originalSize };
  }
}

function findImages(dir) {
  const files = [];

  const walk = (currentDir) => {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  };

  walk(dir);
  return files;
}

async function main() {
  console.log('🖼️  Image Optimization - Geek Gaming Center\n');

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Error: Images directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  const images = findImages(IMAGES_DIR);
  console.log(`Found ${images.length} images to optimize\n`);

  let totalOriginal = 0;
  let totalOptimized = 0;
  let optimizedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const image of images) {
    const result = await optimizeImage(image);

    if (result.error) {
      errorCount++;
    } else if (result.skipped) {
      skippedCount++;
      totalOriginal += result.originalSize;
    } else if (result.optimized) {
      optimizedCount++;
      totalOriginal += result.originalSize;
      totalOptimized += result.newSize;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary');
  console.log('='.repeat(60));
  console.log(`Total images:        ${images.length}`);
  console.log(`Optimized:           ${optimizedCount}`);
  console.log(`Skipped:             ${skippedCount}`);
  console.log(`Errors:              ${errorCount}`);
  console.log(`Original size:       ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Optimized size:      ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Space saved:         ${((totalOriginal - totalOptimized) / 1024 / 1024).toFixed(2)} MB (${((totalOriginal - totalOptimized) / totalOriginal * 100).toFixed(1)}%)`);
  console.log('='.repeat(60));
}

main().catch(console.error);
