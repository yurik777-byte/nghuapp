const fs = require('fs');
const path = require('path');

const { parsePdfBuffer } = require(path.join(__dirname, '..', 'server', 'dist', 'src', 'parser', 'pdfParser'));

const pdfPath = path.join(__dirname, '..', 'schedule_01oct.pdf');
const buf = fs.readFileSync(pdfPath);

parsePdfBuffer(buf).then(res => {
  console.log('=== PARSED PDF SUMMARY ===');
  console.log('Days count:', res.days.length);
  res.days.forEach((day, dIdx) => {
    console.log(`\nDAY ${dIdx+1}: ${day.dayOfWeek} (${day.date})`);
    console.log(`Total lessons in day: ${day.lessons.length}`);
    
    // Group lessons by group
    const byGroup = {};
    day.lessons.forEach(l => {
      if (!byGroup[l.group]) byGroup[l.group] = [];
      byGroup[l.group].push(l);
    });

    console.log(`Groups present (${Object.keys(byGroup).length}):`, Object.keys(byGroup).sort());
    
    // Print a few sample group timetables
    ['Д-11', 'Ж-21', 'Д-31', 'Т-31'].forEach(grp => {
      if (byGroup[grp]) {
        console.log(`\n  Timetable for ${grp}:`);
        byGroup[grp].sort((a,b) => a.pairNumber - b.pairNumber).forEach(l => {
          console.log(`    Пара ${l.pairNumber} (${l.timeStart}-${l.timeEnd}): [${l.subject}] | преп: [${l.teacher}] | ауд: [${l.room}] (${l.buildingAddress || l.building})`);
        });
      } else {
        console.log(`\n  No lessons found for ${grp}`);
      }
    });
  });
}).catch(e => console.error(e));
