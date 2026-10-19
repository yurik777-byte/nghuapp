const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://nghu.ru/students/timetable/';

console.log('Fetching:', url);

https.get(url, { rejectUnauthorized: false }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    
    // Save raw HTML for analysis
    const htmlPath = path.join(__dirname, 'nghu_timetable_page.html');
    fs.writeFileSync(htmlPath, data, 'utf8');
    console.log('HTML saved to:', htmlPath, 'bytes:', data.length);

    // Look for pdf or download links
    const linkRegex = /href=["']([^"']+)["']/gi;
    let match;
    const links = [];
    while ((match = linkRegex.exec(data)) !== null) {
      const link = match[1];
      if (/pdf|wpfd|download|admin-ajax/i.test(link)) {
        links.push(link);
      }
    }

    console.log('Relevant timetable links found (' + links.length + '):');
    links.forEach(l => console.log(' -> ' + l));
  });
}).on('error', err => {
  console.error('Network error:', err.message);
});
