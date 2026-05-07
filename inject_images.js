const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, 'src', 'lib', 'mock-data.ts');
let content = fs.readFileSync(mockDataPath, 'utf8');

// Replace { id: 'title-X', ... }
content = content.replace(/\{ id: '(title-\d+)',(.*?)(posterGradient: \d+)(.*?)\}/g, (match, id, before, poster, after) => {
  // Add posterUrl and backdropUrl after posterGradient
  const pUrl = `https://picsum.photos/seed/${id}/400/600`;
  const bUrl = `https://picsum.photos/seed/${id}-bg/800/500`;
  return `{ id: '${id}',${before}${poster}, posterUrl: '${pUrl}', backdropUrl: '${bUrl}'${after}}`;
});

fs.writeFileSync(mockDataPath, content, 'utf8');
console.log('Images injected into mock-data.ts');
