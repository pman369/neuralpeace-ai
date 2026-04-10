// Generate favicon.ico and PNG variants from favicon.svg
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgPath = join(__dirname, 'public', 'favicon.svg');
const publicDir = join(__dirname, 'public');

const sizes = [16, 32, 48, 64, 180, 192, 512];

async function generate() {
  console.log('Generating favicons from SVG...');

  // Generate PNG files
  for (const size of sizes) {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(join(publicDir, `favicon-${size}x${size}.png`));
    console.log(`  ✓ favicon-${size}x${size}.png`);
  }

  // Generate .ico (16, 32, 48 combined)
  // For .ico we'll use the 64px as base since most browsers fallback to PNG anyway
  // and create a proper multi-size ico using the sharp ICO output
  const icoBuffer = await sharp(svgPath)
    .resize(64, 64)
    .toFormat('png')
    .toBuffer();

  // Write as .ico (single-size, widely supported)
  const { writeFileSync } = await import('fs');
  writeFileSync(join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('  ✓ favicon.ico (64x64 PNG-based)');

  // Also create apple-touch-icon
  writeFileSync(
    join(publicDir, 'apple-touch-icon.png'),
    await sharp(svgPath).resize(180, 180).png().toBuffer()
  );
  console.log('  ✓ apple-touch-icon.png');

  console.log('\nDone! All favicons generated.');
}

generate().catch(console.error);
