const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'node_modules', '@ionic', 'core', 'dist', 'esm');
const outDir = path.join(__dirname, '..', 'www');

if (!fs.existsSync(srcDir)) {
  console.error('Source directory not found:', srcDir);
  process.exit(1);
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.entry.js'));

if (!files.length) {
  console.log('No .entry.js files found in', srcDir);
  process.exit(0);
}

files.forEach(file => {
  const src = path.join(srcDir, file);
  const dest = path.join(outDir, file);
  fs.copyFileSync(src, dest);
  console.log('Copied', file);
});

console.log('Done copying Ionic entry files.');
