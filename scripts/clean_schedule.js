import fs from 'node:fs';
import path from 'node:path';

function normalizeSubject(subject, room, teacher) {
  let s = (subject || '').trim();
  let r = (room || '').trim();
  let t = (teacher || '').trim();

  // Fix Dinamo
  if (/динамо/i.test(s)) {
    s = s.replace(/динамо/gi, '').trim();
    if (!r) r = 'Динамо';
  }
  if (!s && r === 'Динамо') {
    s = 'Физкультура';
  }

  // Fix UMO (12 is room, UMO is subject)
  if (s === '12' && r === 'УМО') {
    s = 'УМО';
    r = '12';
  }

  // Fix OBZR
  if (!s && t.includes('Коробейников') && r === '212') {
    s = 'ОБЗР';
  }

  // Fix POPTD Litvinenko
  if (!s && t.includes('Литвиненко') && (r === '212' || r === '216')) {
    s = 'ПОПТД (Правовые основы)';
  }

  // Fix BZhD
  if (s.includes('БЖД') && s.includes('Коробейников')) {
    s = 'БЖД';
    if (!t) t = 'Коробейников А.С.';
  }

  // Fix Literature / History overlap in Zh-11
  if (s.includes('Литература 111 Гертель')) {
    s = 'Литература';
    r = '111';
    t = 'Гертель Е.В.';
  }

  // Fix Spartaka mention in subject
  if (/Спар?така/i.test(s)) {
    const spMatch = s.match(/Спар?така(?:[,\s]*([0-9а-яА-Я]+))?/i);
    if (spMatch && spMatch[1] && !r) {
      r = spMatch[1];
    }
    s = s.replace(/Спар?така(?:[,\s]*[0-9а-яА-Я]+)?/gi, '').trim();
  }

  // Dictionary of known expansions
  const EXPANSIONS = {
    'пластическая анат': 'Пластическая анатомия',
    'пластическая анат.': 'Пластическая анатомия',
    'ин.язык': 'Иностранный язык',
    'ин. язык': 'Иностранный язык',
    'естествознаяние': 'Естествознание',
    'история тетра': 'История театра',
    'худ.оформление спект': 'Художественное оформление спектакля',
    'худ.оформление спектакля': 'Художественное оформление спектакля',
    'имк': 'ИМК',
    'сидп (вирт.мат.)': 'СИДП (Вирт. мат.)',
    'поптд': 'ПОПТД (Правовые основы)',
    'опг': 'ОПГ (Основы произв. графики)',
    'анализ произв. изо': 'Анализ произведений ИЗО',
  };

  const lower = s.toLowerCase();
  if (EXPANSIONS[lower]) {
    s = EXPANSIONS[lower];
  }

  // Teacher name normalization
  if (t === 'Николаенко О.Н') t = 'Николаенко О.Н.';
  if (t === 'Башук М.В.') t = 'Башук М.Г.';

  return { subject: s, room: r, teacher: t };
}

function processSchedule(filePath) {
  console.log(`Processing ${filePath}...`);
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);

  const cleanedLessons = data.lessons.map((lesson) => {
    // 1. Zh-11 Thursday Pair 1 (Literature) & Pair 2 (OBZR in 212)
    if (lesson.group === 'Ж-11' && lesson.dayOfWeek === 'Четверг') {
      if (lesson.pairNumber === 1) {
        return {
          ...lesson,
          subject: 'Литература',
          teacher: 'Гертель Е.В.',
          room: '112',
          building: 'main',
          buildingAddress: 'Красный пр-т, 9',
        };
      }
      if (lesson.pairNumber === 2) {
        return {
          ...lesson,
          subject: 'ОБЗР',
          teacher: 'Коробейников А.С.',
          room: '212',
          building: 'spartaka',
          buildingAddress: 'ул. Спартака, 12',
        };
      }
    }

    // 2. D-23 Monday Pair 3 (Drawing with Barsukov in 211b)
    if (lesson.group === 'Д-23' && lesson.dayOfWeek === 'Понедельник' && lesson.pairNumber === 3) {
      return {
        ...lesson,
        subject: 'Рисунок',
        teacher: 'Барсуков Е.Г.',
        room: '211б',
        building: 'main',
        buildingAddress: 'Красный пр-т, 9',
      };
    }

    // 3. D-24 Monday Pair 3 (Drawing with Ivashkin in 107)
    if (lesson.group === 'Д-24' && lesson.dayOfWeek === 'Понедельник' && lesson.pairNumber === 3) {
      return {
        ...lesson,
        subject: 'Рисунок',
        teacher: 'Ивашкин А.В.',
        room: '107',
        building: 'main',
        buildingAddress: 'Красный пр-т, 9',
      };
    }

    // 4. D-31 Saturday Pair 3 (Painting with Valvacheva in 205-206)
    if (lesson.group === 'Д-31' && lesson.dayOfWeek === 'Суббота' && lesson.pairNumber === 3) {
      return {
        ...lesson,
        subject: 'Живопись',
        teacher: 'Вальвачева Е.В.',
        room: '205-206',
        building: 'main',
        buildingAddress: 'Красный пр-т, 9',
      };
    }

    // 5. Zh-32 Friday Pairs 1 & 2 (Drawing block with Chirva in 209)
    if (lesson.group === 'Ж-32' && lesson.dayOfWeek === 'Пятница' && (lesson.pairNumber === 1 || lesson.pairNumber === 2)) {
      return {
        ...lesson,
        subject: 'Рисунок',
        teacher: 'Чирва В.П.',
        room: '209',
        building: 'main',
        buildingAddress: 'Красный пр-т, 9',
      };
    }

    // 6. Zh-41 & Zh-42 Saturday Pairs 1 & 2 (Psychology stream lecture in 212 with Litvinenko)
    if ((lesson.group === 'Ж-41' || lesson.group === 'Ж-42') && lesson.dayOfWeek === 'Суббота' && (lesson.pairNumber === 1 || lesson.pairNumber === 2)) {
      return {
        ...lesson,
        subject: 'Психология общения',
        teacher: 'Литвиненко О.В.',
        room: '212',
        building: 'spartaka',
        buildingAddress: 'ул. Спартака, 12',
      };
    }

    // Special fix for Course 3 stream lecture BZhD Thursday Pair 5 (D-31..D-34, Zh-31..Zh-32, T-31)
    if (lesson.dayOfWeek === 'Четверг' && lesson.pairNumber === 5 && (lesson.group === 'Д-31' || lesson.group === 'Д-34')) {
      return {
        ...lesson,
        subject: 'БЖД',
        teacher: 'Коробейников А.С.',
        room: '212',
        building: 'spartaka',
        buildingAddress: 'ул. Спартака, 12',
      };
    }

    // Special fix for Zh-12 Saturday Pair 2 Painting (teacher Valvacheva was cut by row break)
    if (lesson.group === 'Ж-12' && lesson.dayOfWeek === 'Суббота' && lesson.pairNumber === 2) {
      return {
        ...lesson,
        subject: 'Живопись',
        teacher: 'Вальвачева Е.В.',
        room: '205-206',
        building: 'main',
        buildingAddress: 'Красный пр-т, 9',
      };
    }

    const { subject, room, teacher } = normalizeSubject(lesson.subject, lesson.room, lesson.teacher);
    let building = lesson.building;
    let buildingAddress = lesson.buildingAddress;

    if (room === '212' || room === '216' || room === '217') {
      building = 'spartaka';
      buildingAddress = 'ул. Спартака, 12';
    } else {
      building = 'main';
      buildingAddress = 'Красный пр-т, 9';
    }

    return {
      ...lesson,
      subject,
      room,
      teacher,
      building,
      buildingAddress,
    };
  });

  // Rebuild days grouping
  const daysMap = new Map();
  for (const l of cleanedLessons) {
    if (!daysMap.has(l.date)) {
      daysMap.set(l.date, {
        date: l.date,
        dayOfWeek: l.dayOfWeek,
        lessons: [],
      });
    }
    const dayObj = daysMap.get(l.date);
    const { date: _, dayOfWeek: __, ...lessonWithoutDay } = l;
    dayObj.lessons.push(lessonWithoutDay);
  }

  const days = Array.from(daysMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  const result = {
    ...data,
    lessons: cleanedLessons,
    days,
  };

  fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`Successfully cleaned ${cleanedLessons.length} lessons in ${filePath}`);
}

const rootJson = path.resolve(process.cwd(), 'schedule.json');
const publicJson = path.resolve(process.cwd(), 'vk-mini-app/public/schedule.json');

if (fs.existsSync(rootJson)) processSchedule(rootJson);
if (fs.existsSync(publicJson)) processSchedule(publicJson);
