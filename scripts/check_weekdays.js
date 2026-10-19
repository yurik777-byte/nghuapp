const fs = require('fs');
const path = require('path');
const pdfjs = require(path.join(__dirname, '..', 'server', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.mjs'));

const pdfPath = path.join(__dirname, '..', 'schedule_01oct.pdf');
const data = new Uint8Array(fs.readFileSync(pdfPath));

pdfjs.getDocument({ data }).promise.then(async doc => {
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const weekdays = content.items.filter(it => /понедельник|вторник|среда|четверг|пятница|суббота/i.test(it.str));
    console.log(`Page ${i} weekdays:`, weekdays.map(it => ({ str: it.str, x: Math.round(it.transform[4]), y: Math.round(it.transform[5]) })));
  }
});
