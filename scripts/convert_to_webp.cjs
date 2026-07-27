const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, '..', 'public', 'images', 'authors');

async function convertAll() {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')) {
            const ext = path.extname(file);
            const base = path.basename(file, ext);
            const inputPath = path.join(dir, file);
            const outputPath = path.join(dir, `${base}.webp`);
            
            try {
                await sharp(inputPath).webp({ quality: 80 }).toFile(outputPath);
                console.log(`Converted ${file} to ${base}.webp`);
                fs.unlinkSync(inputPath); // Delete the original
            } catch (err) {
                console.error(`Failed to convert ${file}:`, err);
            }
        }
    }
}

convertAll();
