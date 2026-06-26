// ============================================================================
// Generate the source PNGs that @capacitor/assets needs from a single SVG each
// (BUILD-SPEC §7). Run:  npm run assets
//
// Produces (in assets/):
//   icon.png          1024x1024  — app icon
//   splash.png        2732x2732  — light/dark splash (dark-first design)
//   splash-dark.png   2732x2732  — same dark splash for dark mode
//   favicon.png       512x512    — web/PWA fallback
//
// Then create the actual iOS icon set + storyboard assets with:
//   npx @capacitor/assets generate --ios
// (after `npx cap add ios`).
// ============================================================================
import sharp from 'sharp';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'assets', 'source');
const outDir = join(root, 'assets');

async function render(svgName, outName, size) {
  const svg = await readFile(join(srcDir, svgName));
  await sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'cover' })
    .png()
    .toFile(join(outDir, outName));
  console.log(`✓ ${outName} (${size}x${size})`);
}

async function main() {
  await mkdir(outDir, { recursive: true });
  await render('icon.svg', 'icon.png', 1024);
  await render('icon.svg', 'favicon.png', 512);
  await render('splash.svg', 'splash.png', 2732);
  await render('splash.svg', 'splash-dark.png', 2732);
  console.log('\nNext: npx @capacitor/assets generate --ios');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
