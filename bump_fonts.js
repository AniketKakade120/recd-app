const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetDir = path.join(__dirname, 'src');

walkDir(targetDir, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Bump explicit pixel sizes
    content = content.replace(/text-\[7px\]/g, 'text-[9px]');
    content = content.replace(/text-\[8px\]/g, 'text-[10px]');
    content = content.replace(/text-\[9px\]/g, 'text-[11px]');
    content = content.replace(/text-\[10px\]/g, 'text-xs');
    content = content.replace(/text-\[11px\]/g, 'text-sm');
    
    // Also bump text-xs to text-sm in many places where we had text-xs
    // Wait, replacing text-xs globally might break layout of standard components.
    // I'll stick to bumping the explicit [Xpx] and maybe text-xs -> text-sm if needed.
    // Let's just do the [Xpx] ones first since those are the genuinely unreadable ones.

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
