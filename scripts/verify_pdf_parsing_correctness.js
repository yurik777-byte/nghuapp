const fs = require('fs');
const path = require('path');
const { parsePdfBuffer } = require(path.join(__dirname, '..', 'server', 'dist', 'src', 'parser', 'pdfParser'));

const pdfPath = path.join(__dirname, '..', 'schedule_01oct.pdf');
const buf = fs.readFileSync(pdfPath);

parsePdfBuffer(buf).then(result => {
  console.log('=== VERIFICATION OF schedule_01oct.pdf ===');
  console.log('Days found:', result.days.length);

  result.days.forEach(day => {
    console.log(`\nDate: ${day.date}, Day: ${day.dayOfWeek}, Total lessons: ${day.lessons.length}`);
    
    // Check distribution across courses
    const courseStats = { 1: 0, 2: 0, 3: 0, 4: 0, other: 0 };
    const groupStats = {};
    const roomsStats = {};
    const campusStats = { main: 0, spartaka: 0 };
    const teachersList = new Set();
    const emptyTeachers = [];
    const emptyRooms = [];

    day.lessons.forEach(l => {
      // Group
      groupStats[l.group] = (groupStats[l.group] || 0) + 1;
      
      // Course
      const courseMatch = l.group.match(/-([1-4])/);
      if (courseMatch) {
        courseStats[courseMatch[1]]++;
      } else {
        courseStats.other++;
      }

      // Campus
      if (l.building === 'spartaka' || /спартака/i.test(l.buildingAddress || '')) {
        campusStats.spartaka++;
      } else {
        campusStats.main++;
      }

      // Room
      if (l.room) {
        roomsStats[l.room] = (roomsStats[l.room] || 0) + 1;
      } else {
        emptyRooms.push(l);
      }

      // Teacher
      if (l.teacher) {
        teachersList.add(l.teacher);
      } else {
        emptyTeachers.push(l);
      }
    });

    console.log('Course distribution (lessons):', courseStats);
    console.log('Campus distribution:', campusStats);
    console.log(`Groups found (${Object.keys(groupStats).length}):`, Object.keys(groupStats).sort());
    console.log(`Teachers found (${teachersList.size}):`, [...teachersList].sort().slice(0, 10), '...');
    console.log(`Empty teacher lessons (${emptyTeachers.length}):`, emptyTeachers.map(l => `${l.group} P${l.pairNumber} [${l.subject}]`).slice(0, 5));
    console.log(`Empty room lessons (${emptyRooms.length}):`, emptyRooms.map(l => `${l.group} P${l.pairNumber} [${l.subject}]`).slice(0, 5));
  });
}).catch(err => {
  console.error('Parsing error:', err);
});
