const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const key = env.split('\n').find(l => l.startsWith('TMDB_API_KEY')).split('=')[1].trim();

fetch(`https://api.themoviedb.org/3/search/multi?api_key=${key}&query=Ti+Saddhya+Kay+Karte`)
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)));
