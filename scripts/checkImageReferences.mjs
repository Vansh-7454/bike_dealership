import fs from 'fs';
import path from 'path';

function getAllFiles(dir, allFiles = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next') getAllFiles(p, allFiles);
    } else {
      allFiles.push(p);
    }
  }
  return allFiles;
}

const srcFiles = getAllFiles('src');
const imageRegex = /['"](\/images\/[^'"]+)['"]/g;
const foundPaths = new Set();
const broken = [];

for (const sf of srcFiles) {
  const content = fs.readFileSync(sf, 'utf-8');
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    const imgPath = match[1];
    foundPaths.add(imgPath);
    const diskPath = path.join('public', imgPath.replace(/^\//, ''));
    if (!fs.existsSync(diskPath)) {
      broken.push({ file: path.relative('.', sf), path: imgPath });
    }
  }
}

console.log('All image paths referenced in src:');
for (const p of foundPaths) console.log('  ' + p);

if (broken.length === 0) {
  console.log(`\n✓ All ${foundPaths.size} referenced images exist on disk in public/. ZERO broken references!`);
} else {
  console.log('\n❌ Broken image references found:');
  console.log(broken);
  process.exit(1);
}
