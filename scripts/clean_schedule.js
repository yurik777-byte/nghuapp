import fs from 'node:fs';
import path from 'node:path';

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

function normalizeSubject(subject, room, teacher, building, buildingAddress) {
  let s = (subject || '').replace(/\+[A-Z]{1,3}\d+:[A-Z]{1,3}\d+/g, '').replace(/\s+/g, ' ').trim();
  let r = (room || '').trim();
  let t = (teacher || '').trim();
  let b = building || 'main';
  let addr = buildingAddress || (b === 'spartaka' ? 'ул. Спартака, 12' : 'Красный пр-т, 9');

  // Fix Dinamo / PE
  if (/динамо/i.test(s)) {
    s = s.replace(/динамо/gi, '').replace(/\s+/g, ' ').trim();
    if (!r) r = 'Динамо';
  }
  if (!s && r === 'Динамо') {
    s = 'Физкультура';
  }
  if (/физкультура/i.test(s) && !r) {
    r = 'Динамо';
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

  // Fix Spartaka mention in subject
  if (/Спар?така/i.test(s)) {
    const spMatch = s.match(/Спар?така(?:,?\s*12(?![0-9]))?(?:\s*,?\s*(?:№\s*)?([0-9а-яА-Я]+))?/i);
    if (spMatch && spMatch[1] && !r) {
      r = spMatch[1];
    }
    s = s
      .replace(/Спар?така(?:,?\s*12(?![0-9]))?(?:\s*,?\s*(?:№\s*)?[0-9а-яА-Я]+)?/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    b = 'spartaka';
    addr = 'ул. Спартака, 12';
  }

  if (['215', '216', '217'].includes(r)) {
    b = 'spartaka';
    addr = 'ул. Спартака, 12';
  }

  const lower = s.toLowerCase();
  if (EXPANSIONS[lower]) {
    s = EXPANSIONS[lower];
  }

  // Teacher name normalization
  if (t === 'Николаенко О.Н') t = 'Николаенко О.Н.';
  if (t === 'Башук М.В.') t = 'Башук М.Г.';
  if (t === 'Литвиненко о.в' || t === 'Литвиненко о.в.') t = 'Литвиненко О.В.';
  if (t === 'КоробейниковА.С' || t === 'КоробейниковА.С.') t = 'Коробейников А.С.';

  return { subject: s, room: r, teacher: t, building: b, buildingAddress: addr };
}

function processSchedule(filePath) {
  console.log(`Processing ${filePath}...`);
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);

  const cleanedLessons = data.lessons.map((lesson) => {
    const normalized = normalizeSubject(
      lesson.subject,
      lesson.room,
      lesson.teacher,
      lesson.building,
      lesson.buildingAddress
    );

    return {
      ...lesson,
      subject: normalized.subject,
      room: normalized.room,
      teacher: normalized.teacher,
      building: normalized.building,
      buildingAddress: normalized.buildingAddress,
    };
  });

  // Rebuild days grouping preserving date, dayOfWeek, building, buildingAddress
  const daysMap = new Map();
  for (const l of cleanedLessons) {
    if (!daysMap.has(l.date)) {
      daysMap.set(l.date, {
        date: l.date,
        dayOfWeek: l.dayOfWeek,
        lessons: [],
      });
    }
    daysMap.get(l.date).lessons.push({ ...l });
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
