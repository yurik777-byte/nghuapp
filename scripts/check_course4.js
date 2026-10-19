const fs = require('fs');
const path = require('path');
const pdfjsLib = require(path.join(__dirname, '..', 'server', 'dist', 'src', 'parser', 'pdfParser'));

const { parsePdfBuffer } = pdfjsLib;

// Let's inspect raw text of both pages
const pdfPath = path.join(__dirname, '..', 'schedule_01oct.pdf');

// Using pdfjs directly from node_modules
const pdfjs = require(path.join(__dirname, '..', 'server', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.mjs'));

const data = new Uint8Array(fs.readFileSync(pdfPath));
pdfjs.getDocument({ data }).promise.then(async doc => {
  console.log('Total PDF Pages:', doc.numPages);
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strList = content.items.map(it => it.str).filter(s => s.trim().length > 0);
    console.log(`\n=== PAGE ${i} (items: ${strList.length}) ===`);
    
    // Check group headers on this page
    const groups = strList.filter(s => /^[ДЖТ]-\d{2}$/.test(s.trim()));
    console.log(`Groups on Page ${i}:`, groups);

    // Check course headers
    const courses = strList.filter(s => /курс/i.test(s));
    console.log(`Course text on Page ${i}:`, courses);

    // Check special annotations (practice, etc)
    const annotations = strList.filter(s => /практик|диплом|консультац|выходн|деканат/i.test(s));
    console.log(`Annotations on Page ${i}:`, annotations);

    // Print first 40 strings
    console.log(`First 30 strings on Page ${i}:`, strList.slice(0, 30));
  }
}).catch(e => console.error(e));
