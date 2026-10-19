const fs = require('fs');
const path = require('path');
const pdfjs = require(path.join(__dirname, '..', 'server', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.mjs'));

const pdfPath = path.join(__dirname, '..', 'schedule_01oct.pdf');
const data = new Uint8Array(fs.readFileSync(pdfPath));

pdfjs.getDocument({ data }).promise.then(async doc => {
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const items = content.items.map(it => ({
      str: it.str.trim(),
      x: Math.round(it.transform[4]),
      y: Math.round(it.transform[5])
    })).filter(it => it.str.length > 0);

    const timeRegex = /^\d{1,2}[:.]\d{2}\s*[-–—]\s*\d{1,2}[:.]\d{2}$/;
    const timeLabels = items.filter(it => timeRegex.test(it.str));
    console.log(`\nPage ${i}: total items = ${items.length}, timeLabels count = ${timeLabels.length}`);
    console.log(`Time labels on page ${i}:`, timeLabels.map(it => `${it.str} (x:${it.x}, y:${it.y})`));
  }
}).catch(err => console.error(err));