const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\MCKR-Asus\\.gemini\\antigravity\\brain';
const destDir = 'C:\\Users\\MCKR-Asus\\.gemini\\antigravity\\scratch\\logiccompare\\public\\images\\authors';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function findImages(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findImages(filePath, fileList);
    } else if (file.endsWith('.jpg') && !file.startsWith('sample') && !file.startsWith('media_')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const images = findImages(brainDir);
let count = 0;

for (const imgPath of images) {
  const filename = path.basename(imgPath, '.jpg');
  // Format is name_surname_timestamp (e.g. michael_brown_1784993773963)
  // We want to remove the timestamp at the end and replace _ with -
  const match = filename.match(/^(.*?)_\d+$/);
  if (match) {
    const rawName = match[1];
    const slug = rawName.replace(/_/g, '-');
    const destPath = path.join(destDir, `${slug}.jpg`);
    
    // Only copy if it doesn't already exist or if we want to overwrite
    fs.copyFileSync(imgPath, destPath);
    console.log(`Copied ${path.basename(imgPath)} -> ${slug}.jpg`);
    count++;
  }
}

console.log(`Successfully collected ${count} images.`);
