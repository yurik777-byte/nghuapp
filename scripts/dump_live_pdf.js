const fs = require('fs');
const path = require('path');
const pdfjsLib = require(path.join(__dirname, '..', 'server', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.js'));

const pdfPath = path.join(__dirname, '..', 'live_schedule_latest.pdf');
const data = new Uint8Array(fs.readFileSync(pdfPath));

pdfjsLib.getDocument({ data }).promise.then(async doc => {
  console.log('Total pages in live PDF:', doc.numPages);
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items.map(it => it.str).filter(s => s.trim().length > 0);
    console.log(`\n--- PAGE ${pageNum} (${content.items.length} text items) ---`);
    console.log('First 20 items:', strings.slice(0, 20).join(' | '));
    const dayMatches = strings.filter(s => /понедельник|вторник|среда|четверг|пятница|суббота|\d{1,2}\s+(?:сентября|октября|ноября|декабря)/i.test(s));
    console.log('Day/Date strings on page:', dayMatches);
    const courseMatches = strings.filter(s => /курс|расписание/i.test(s));
    console.log('Course/Title matches:', courseMatches);
  }
}).catch(err => console.error(err));
