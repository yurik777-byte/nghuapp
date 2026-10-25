import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import {
  ParsedSchedule,
  TimetableMeta,
  GroupInfo,
  ScheduleDay,
  Lesson,
  BuildingType,
} from '../types/index.js';

interface RawItem {
  str: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ColumnBoundary {
  group: string;
  minX: number;
  maxX: number;
}

interface PairSlot {
  pairNumber: number;
  minY: number;
  maxY: number;
  timeStart: string;
  timeEnd: string;
}

interface DayDefinition {
  dayOfWeek: string;
  date: string;
  pairs: PairSlot[];
}

const PAIR_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: '09:00', end: '10:35' },
  2: { start: '10:40', end: '12:15' },
  3: { start: '13:00', end: '14:35' },
  4: { start: '14:40', end: '16:15' },
  5: { start: '16:20', end: '17:55' },
};

const TEACHER_REGEX = /([А-ЯЁ][а-яё]+(?:-[А-ЯЁ][а-яё]+)?\s+[А-ЯЁ]\.\s*[А-ЯЁ]\.?)/u;
const SPARTAKA_REGEX = /Спар?така,\s*12(?:\s*№\s*([0-9а-яА-Я]+))?/iu;
const ROOM_REGEX = /(?:^|\s)(?:№\s*)?(\d{2,3}(?:-\d{2,3})?[а-яА-Я]?|УМО)(?=\s|$)/u;

const RUSSIAN_WEEKDAYS = [
  'Воскресенье',
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
];

/**
 * Dynamically derives Russian day of week capitalized from an ISO date string "YYYY-MM-DD"
 */
export function getDayOfWeekFromDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
  const date = new Date(y, m - 1, d);
  return RUSSIAN_WEEKDAYS[date.getDay()];
}

/**
 * Normalizes and cleans multi-line/spaced text tokens
 */
function cleanString(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Extracts Department name from group prefix
 */
function getDepartmentForGroup(groupId: string): string {
  if (groupId.startsWith('Ж-')) return 'Живопись';
  if (groupId.startsWith('Д-')) return 'Дизайн';
  if (groupId.startsWith('Т-')) return 'Театрально-декорационное искусство';
  return 'Общее отделение';
}

/**
 * Extracts Course number from group id, e.g. "Д-11" -> 1, "Ж-32" -> 3
 */
function getCourseForGroup(groupId: string): number {
  const match = groupId.match(/^[ЖДТ]-(\d)\d$/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 1;
}

/**
 * Parses raw text lines inside a schedule cell into structured lesson fields
 */
function parseCellData(items: RawItem[]): {
  subject: string;
  teacher: string;
  room: string;
  building: BuildingType;
  buildingAddress: string;
} {
  let building: BuildingType = 'main';
  let buildingAddress = 'Красный пр-т, 9';
  let teacher = '';
  let room = '';

  const textLines = items.map((i) => i.str);

  // Check for Spartaka campus mention & teacher
  for (const line of textLines) {
    if (SPARTAKA_REGEX.test(line)) {
      building = 'spartaka';
      buildingAddress = 'ул. Спартака, 12';
      const m = line.match(SPARTAKA_REGEX);
      if (m && m[1]) {
        room = m[1];
      }
    }
    const tm = line.match(TEACHER_REGEX);
    if (tm) {
      teacher = tm[1].trim();
    }
  }

  // Room search if not already determined from Spartaka line
  if (!room) {
    for (const line of textLines) {
      let clean = line;
      if (teacher) clean = clean.replace(teacher, '').trim();
      clean = clean.replace(/Спар?така,\s*12(?:\s*№\s*)?/iu, '').trim();
      const rm = clean.match(ROOM_REGEX);
      if (rm) {
        room = rm[1];
        break;
      }
    }
  }

  // Collect subject by removing teacher, room, and campus markers
  const subjectTokens: string[] = [];
  for (const line of textLines) {
    let clean = line;
    if (teacher) clean = clean.replace(teacher, '').trim();
    clean = clean.replace(/Спар?така,\s*12(?:\s*№\s*[0-9а-яА-Я]+)?/iu, '').trim();
    if (room) {
      clean = clean.replace(new RegExp(`(^|\\s)${room}(\\s|$)`, 'u'), ' ').trim();
    }
    clean = clean.replace(/^[№\s,.-]+|[№\s,.-]+$/g, '').trim();
    if (clean.length > 0) {
      subjectTokens.push(clean);
    }
  }

  let subject = cleanString(subjectTokens.join(' '));
  subject = subject.replace(/^[,.\s-]+|[,.\s-]+$/g, '');

  return { subject, teacher, room, building, buildingAddress };
}

/**
 * Extracts metadata (title, period, semester, dates) from raw page items
 */
function extractTimetableMeta(items: RawItem[]): {
  meta: TimetableMeta;
  day1Date: string;
  day2Date: string;
} {
  let sourceFileTitle = 'Расписание занятий';
  let period = '';
  let semester = '1 семестр';
  let day1Date = '2026-09-04';
  let day2Date = '2026-09-05';

  for (const item of items) {
    if (/Расписание занятий/i.test(item.str)) {
      sourceFileTitle = item.str;
      // Check cross-month date range: e.g. "30.09-01.10.2026"
      const crossMonthMatch = item.str.match(/(\d{1,2})\.(\d{2})[-/](\d{1,2})\.(\d{2})\.(\d{4})/);
      // Check same-month date range: e.g. "04/05.09.2026"
      const sameMonthMatch = item.str.match(/(\d{1,2})[/.-](\d{1,2})\.(\d{2})\.(\d{4})/);
      // Check single date: e.g. "04.09.2026"
      const singleDateMatch = item.str.match(/(\d{1,2})\.(\d{2})\.(\d{4})/);

      if (crossMonthMatch) {
        const [, d1, m1, d2, m2, yyyy] = crossMonthMatch;
        period = `${d1}.${m1}-${d2}.${m2}.${yyyy}`;
        day1Date = `${yyyy}-${m1.padStart(2, '0')}-${d1.padStart(2, '0')}`;
        day2Date = `${yyyy}-${m2.padStart(2, '0')}-${d2.padStart(2, '0')}`;
      } else if (sameMonthMatch) {
        const [, d1, d2, mm, yyyy] = sameMonthMatch;
        period = `${d1}/${d2}.${mm}.${yyyy}`;
        day1Date = `${yyyy}-${mm.padStart(2, '0')}-${d1.padStart(2, '0')}`;
        day2Date = `${yyyy}-${mm.padStart(2, '0')}-${d2.padStart(2, '0')}`;
      } else if (singleDateMatch) {
        const [, d1, mm, yyyy] = singleDateMatch;
        period = `${d1}.${mm}.${yyyy}`;
        day1Date = `${yyyy}-${mm.padStart(2, '0')}-${d1.padStart(2, '0')}`;
        day2Date = day1Date;
      }
    } else if (/семестр/i.test(item.str)) {
      semester = item.str;
    }
  }

  return {
    meta: {
      updatedAt: new Date().toISOString(),
      sourceFileTitle,
      period,
      semester,
    },
    day1Date,
    day2Date,
  };
}

/**
 * Parses a PDF buffer containing the NGHU college timetable into a structured ParsedSchedule
 */
export async function parsePdfBuffer(
  buffer: Buffer,
  sourceUrl?: string
): Promise<ParsedSchedule> {
  const data = new Uint8Array(buffer);
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;

  const groupsMap = new Map<string, GroupInfo>();
  const lessons: Lesson[] = [];
  let detectedMeta: TimetableMeta = {
    updatedAt: new Date().toISOString(),
  };
  let day1Date = '2026-09-04';
  let day2Date = '2026-09-05';

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const tc = await page.getTextContent();

    const items: RawItem[] = tc.items
      .filter((it: any) => 'str' in it && it.str.trim().length > 0)
      .map((it: any) => ({
        str: it.str.trim(),
        x: Math.round(it.transform[4]),
        y: Math.round(it.transform[5]),
        w: Math.round(it.width),
        h: Math.round(it.height),
      }));

    if (pageNum === 1) {
      const metaRes = extractTimetableMeta(items);
      detectedMeta = metaRes.meta;
      if (sourceUrl) detectedMeta.sourceUrl = sourceUrl;
      day1Date = metaRes.day1Date;
      day2Date = metaRes.day2Date;
    }

    // Identify group header columns at top row (adaptive to page height / scaling)
    const groupCandidateItems = items.filter((it) => /^[ЖДТ]-\d\d$/i.test(it.str));
    const maxGroupY = groupCandidateItems.length > 0 ? Math.max(...groupCandidateItems.map((g) => g.y)) : 509;
    const headerItems = groupCandidateItems
      .filter((it) => Math.abs(it.y - maxGroupY) <= 12)
      .sort((a, b) => a.x - b.x);

    // Register groups
    for (const h of headerItems) {
      if (!groupsMap.has(h.str)) {
        groupsMap.set(h.str, {
          id: h.str,
          name: h.str,
          course: getCourseForGroup(h.str),
          department: getDepartmentForGroup(h.str),
        });
      }
    }

    // Determine left and right boundaries of group columns dynamically
    const firstGroupX = headerItems[0]?.x || 130;
    const lastGroupX = headerItems[headerItems.length - 1]?.x || 700;
    const avgColWidth = headerItems.length > 1
      ? (lastGroupX - firstGroupX) / (headerItems.length - 1)
      : 70;

    const leftTimeMaxX = firstGroupX - avgColWidth / 2;
    const rightTimeMinX = lastGroupX + avgColWidth / 2;

    const cols: ColumnBoundary[] = headerItems.map((h, i) => {
      const minX = i === 0 ? leftTimeMaxX : (headerItems[i - 1].x + h.x) / 2;
      const maxX =
        i === headerItems.length - 1
          ? rightTimeMinX
          : (h.x + headerItems[i + 1].x) / 2;
      return { group: h.str, minX, maxX };
    });

    // Dynamic time row detection (11 time rows per day)
    const timeLabels = items
      .filter((it) => /^\s*\d{1,2}[:.]\d{2}\s*[-–—]\s*\d{1,2}[:.]\d{2}\s*$/.test(it.str) && it.x < (firstGroupX - 5))
      .sort((a, b) => b.y - a.y);
    const DAY_NAME_REGEX = /^\s*(понедельник|вторник|среда|четверг|пятница|суббота|воскресенье)\s*$/i;
    const dayLabels = items
      .filter((it) => DAY_NAME_REGEX.test(it.str) && it.x < (firstGroupX - 5))
      .sort((a, b) => b.y - a.y);

    const numDays = Math.floor(timeLabels.length / 11);
    const topGroupY = Math.max(...headerItems.map((h) => h.y), 509);
    const daysConfig: DayDefinition[] = [];

    if (numDays > 0 && numDays !== 2) {
      // Dynamic day configuration (e.g. 6-day semester schedule)
      let refMonday: Date;
      if (day1Date) {
        const [y, m, d] = day1Date.split('-').map(Number);
        refMonday = new Date(y, m - 1, d);
      } else {
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sun, 1 = Mon
        const diffToMonday = currentDay === 0 ? 1 : 1 - currentDay;
        refMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
      }

      const RUSSIAN_DAY_TO_DOW: Record<string, number> = {
        'понедельник': 1, 'вторник': 2, 'среда': 3, 'четверг': 4, 'пятница': 5, 'суббота': 6, 'воскресенье': 7,
      };

      for (let d = 0; d < numDays; d++) {
        const chunk = timeLabels.slice(d * 11, (d + 1) * 11);
        const topOfPair1 = d === 0 ? (topGroupY - 4) : Math.round((timeLabels[d * 11 - 1].y + chunk[0].y) / 2);
        const p1p2 = Math.round((chunk[1].y + chunk[2].y) / 2);
        const p2brk = Math.round((chunk[3].y + chunk[4].y) / 2);
        const brkp3 = Math.round((chunk[4].y + chunk[5].y) / 2);
        const p3p4 = Math.round((chunk[6].y + chunk[7].y) / 2);
        const p4p5 = Math.round((chunk[8].y + chunk[9].y) / 2);
        const bottomOfPair5 = d === numDays - 1 ? (chunk[10].y - 6) : Math.round((chunk[10].y + timeLabels[(d + 1) * 11].y) / 2);

        const detectedDayStr = dayLabels.find((l) => l.y >= (bottomOfPair5 - 15) && l.y <= (topOfPair1 + 15))?.str?.toLowerCase() || '';
        const dow = RUSSIAN_DAY_TO_DOW[detectedDayStr] || (d + 1);

        const dayDate = new Date(refMonday.getTime() + (dow - 1) * 86400000);
        const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;

        daysConfig.push({
          dayOfWeek: getDayOfWeekFromDate(dateStr),
          date: dateStr,
          pairs: [
            { pairNumber: 1, minY: p1p2, maxY: topOfPair1, timeStart: PAIR_TIMES[1].start, timeEnd: PAIR_TIMES[1].end },
            { pairNumber: 2, minY: p2brk, maxY: p1p2, timeStart: PAIR_TIMES[2].start, timeEnd: PAIR_TIMES[2].end },
            { pairNumber: 3, minY: p3p4, maxY: brkp3, timeStart: PAIR_TIMES[3].start, timeEnd: PAIR_TIMES[3].end },
            { pairNumber: 4, minY: p4p5, maxY: p3p4, timeStart: PAIR_TIMES[4].start, timeEnd: PAIR_TIMES[4].end },
            { pairNumber: 5, minY: bottomOfPair5, maxY: p4p5, timeStart: PAIR_TIMES[5].start, timeEnd: PAIR_TIMES[5].end },
          ],
        });
      }
    } else {
      // Day definitions for standard 2-day layout
      daysConfig.push(
        {
          dayOfWeek: getDayOfWeekFromDate(day1Date),
          date: day1Date,
          pairs: [
            { pairNumber: 1, minY: 491, maxY: 506, timeStart: PAIR_TIMES[1].start, timeEnd: PAIR_TIMES[1].end },
            { pairNumber: 2, minY: 476, maxY: 491, timeStart: PAIR_TIMES[2].start, timeEnd: PAIR_TIMES[2].end },
            { pairNumber: 3, minY: 458, maxY: 476, timeStart: PAIR_TIMES[3].start, timeEnd: PAIR_TIMES[3].end },
            { pairNumber: 4, minY: 445, maxY: 458, timeStart: PAIR_TIMES[4].start, timeEnd: PAIR_TIMES[4].end },
            { pairNumber: 5, minY: 430, maxY: 445, timeStart: PAIR_TIMES[5].start, timeEnd: PAIR_TIMES[5].end },
          ],
        },
        {
          dayOfWeek: getDayOfWeekFromDate(day2Date),
          date: day2Date,
          pairs: [
            { pairNumber: 1, minY: 418, maxY: 430, timeStart: PAIR_TIMES[1].start, timeEnd: PAIR_TIMES[1].end },
            { pairNumber: 2, minY: 400, maxY: 418, timeStart: PAIR_TIMES[2].start, timeEnd: PAIR_TIMES[2].end },
            { pairNumber: 3, minY: 385, maxY: 400, timeStart: PAIR_TIMES[3].start, timeEnd: PAIR_TIMES[3].end },
            { pairNumber: 4, minY: 370, maxY: 385, timeStart: PAIR_TIMES[4].start, timeEnd: PAIR_TIMES[4].end },
            { pairNumber: 5, minY: 355, maxY: 370, timeStart: PAIR_TIMES[5].start, timeEnd: PAIR_TIMES[5].end },
          ],
        }
      );
    }

    const minTableY = daysConfig[daysConfig.length - 1].pairs[4].minY;
    const maxTableY = daysConfig[0].pairs[0].maxY;

    for (const day of daysConfig) {
      for (const col of cols) {
        // Filter items belonging to this column (including multi-column wide lecture labels)
        const colItems = items
          .filter((it) => {
            if (it.y > maxTableY || it.y < minTableY || it.str === 'перерыв') return false;
            if (/^\d{1,2}\.\d{2}-\d{1,2}\.\d{2}$/.test(it.str)) return false;
            if (/понедельник|вторник|среда|четверг|пятница|суббота|воскресенье/i.test(it.str)) return false;
            if (/практик/i.test(it.str)) return false;

            const overlap = Math.max(
              0,
              Math.min(it.x + it.w, col.maxX) - Math.max(it.x, col.minX)
            );
            return overlap >= 10 || (it.x >= col.minX && it.x < col.maxX);
          })
          .sort((a, b) => b.y - a.y);

        // Group into pair buckets
        const pairBuckets: Record<number, RawItem[]> = {};
        for (const pr of day.pairs) {
          pairBuckets[pr.pairNumber] = colItems.filter(
            (it) => it.y >= pr.minY && it.y <= pr.maxY
          );
        }

        const pairNums = [1, 2, 3, 4, 5];
        let i = 0;
        while (i < pairNums.length) {
          const pNum = pairNums[i];
          const currItems = pairBuckets[pNum] || [];

          if (currItems.length === 0) {
            i++;
            continue;
          }

          const currParsed = parseCellData(currItems);

          // Check if it joins with next pair(s) as a double lesson
          const nextPNum = pNum + 1;
          const nextItems = pairBuckets[nextPNum] || [];
          let isDouble = false;

          if (nextItems.length > 0 && nextPNum <= 5) {
            const nextParsed = parseCellData(nextItems);
            if (!nextParsed.subject && (nextParsed.teacher || nextParsed.room)) {
              isDouble = true;
            } else if (
              !currParsed.teacher &&
              !currParsed.room &&
              currParsed.subject &&
              (nextParsed.teacher || nextParsed.room) &&
              !nextParsed.subject
            ) {
              isDouble = true;
            }
          }

          // Special case: 3-bucket span (e.g. Д-42 Saturday: Pair 3 subject, Pair 4 room, Pair 5 teacher)
          if (isDouble && pNum === 3 && (pairBuckets[5] || []).length > 0) {
            const p5Parsed = parseCellData(pairBuckets[5]);
            const combined34 = parseCellData([...currItems, ...nextItems]);
            if (!combined34.teacher && p5Parsed.teacher && !p5Parsed.subject) {
              const combinedAll = parseCellData([
                ...currItems,
                ...nextItems,
                ...pairBuckets[5],
              ]);
              for (const pn of [3, 4]) {
                lessons.push({
                  id: `${col.group}_${day.date}_${pn}_${combinedAll.room || 'unknown'}`,
                  group: col.group,
                  date: day.date,
                  dayOfWeek: day.dayOfWeek,
                  pairNumber: pn,
                  timeStart: PAIR_TIMES[pn].start,
                  timeEnd: PAIR_TIMES[pn].end,
                  subject: combinedAll.subject,
                  teacher: combinedAll.teacher,
                  room: combinedAll.room,
                  building: combinedAll.building,
                  buildingAddress: combinedAll.buildingAddress,
                });
              }
              i += 3;
              continue;
            }
          }

          if (isDouble) {
            const combinedItems = [...currItems, ...nextItems];
            const parsed = parseCellData(combinedItems);

            for (const pn of [pNum, nextPNum]) {
              lessons.push({
                id: `${col.group}_${day.date}_${pn}_${parsed.room || 'unknown'}`,
                group: col.group,
                date: day.date,
                dayOfWeek: day.dayOfWeek,
                pairNumber: pn,
                timeStart: PAIR_TIMES[pn].start,
                timeEnd: PAIR_TIMES[pn].end,
                subject: parsed.subject,
                teacher: parsed.teacher,
                room: parsed.room,
                building: parsed.building,
                buildingAddress: parsed.buildingAddress,
              });
            }

            i += 2;
          } else {
            lessons.push({
              id: `${col.group}_${day.date}_${pNum}_${currParsed.room || 'unknown'}`,
              group: col.group,
              date: day.date,
              dayOfWeek: day.dayOfWeek,
              pairNumber: pNum,
              timeStart: PAIR_TIMES[pNum].start,
              timeEnd: PAIR_TIMES[pNum].end,
              subject: currParsed.subject,
              teacher: currParsed.teacher,
              room: currParsed.room,
              building: currParsed.building,
              buildingAddress: currParsed.buildingAddress,
            });
            i++;
          }
        }
      }
    }

    // Detect practice banners on this page (e.g. 4th course pedagogical practice)
    const practiceItem = items.find((it) => /практик/i.test(it.str));
    if (practiceItem) {
      const practiceText = cleanString(practiceItem.str);
      const groupsOnPage = cols.map((c) => c.group);
      const emptyGroups = groupsOnPage.filter((g) => !lessons.some((l) => l.group === g));
      for (const g of emptyGroups) {
        for (const day of daysConfig) {
          lessons.push({
            id: `${g}_${day.date}_1_practice`,
            group: g,
            date: day.date,
            dayOfWeek: day.dayOfWeek,
            pairNumber: 1,
            timeStart: PAIR_TIMES[1].start,
            timeEnd: '14:35',
            subject: practiceText,
            teacher: '',
            room: '',
            building: 'main',
            buildingAddress: 'Красный пр-т, 9',
          });
        }
      }
    }
  }


  // Aggregate schedule by day
  const daysMap = new Map<string, ScheduleDay>();
  for (const lesson of lessons) {
    if (!daysMap.has(lesson.date)) {
      daysMap.set(lesson.date, {
        date: lesson.date,
        dayOfWeek: lesson.dayOfWeek,
        lessons: [],
      });
    }
    daysMap.get(lesson.date)!.lessons.push(lesson);
  }

  // Sort groups by course and name
  const groupsList = Array.from(groupsMap.values()).sort((a, b) => {
    if (a.course !== b.course) return a.course - b.course;
    return a.name.localeCompare(b.name, 'ru');
  });

  return {
    meta: detectedMeta,
    groups: groupsList,
    days: Array.from(daysMap.values()),
    lessons,
  };
}
