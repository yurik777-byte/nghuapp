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
  transform: number[];
}

interface HSeg {
  x1: number;
  x2: number;
  y: number;
}

interface VSeg {
  x: number;
  y1: number;
  y2: number;
}

interface FillRect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

interface ColumnDef {
  group: string;
  x1: number;
  x2: number;
}

interface SubRowDef {
  idx: number;
  yTop: number;
  yBot: number;
  timeStr: string;
}

interface VerticalBlock {
  c: number;
  dayIdx: number;
  rStart: number;
  rEnd: number;
  items: RawItem[];
  hasYellow: boolean;
}

interface DayConfig {
  dayIdx: number;
  dayOfWeek: string;
  date: string;
}

export interface ParsePdfOptions {
  ignoreVectorBorders?: boolean;
  mutateColors?: Record<string, string>;
}

export interface ScheduleValidationReport {
  isValid: boolean;
  totalLessons: number;
  incompleteLessonCount: number;
  multiTeacherCount: number;
  typoCount: number;
  warnings: string[];
}

const PAIR_SLOTS = [
  { pairNumber: 1, rMin: 0, rMax: 1 },
  { pairNumber: 2, rMin: 2, rMax: 3 },
  { pairNumber: 3, rMin: 5, rMax: 6 },
  { pairNumber: 4, rMin: 7, rMax: 8 },
  { pairNumber: 5, rMin: 9, rMax: 10 },
];

const DEFAULT_PAIR_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: '09:00', end: '10:35' },
  2: { start: '10:40', end: '12:15' },
  3: { start: '13:00', end: '14:35' },
  4: { start: '14:40', end: '16:15' },
  5: { start: '16:20', end: '17:55' },
};

const TEACHER_REGEX =
  /([А-ЯЁ][а-яё]+(?:-[А-ЯЁ][а-яё]+)?(?:\s+[А-ЯЁа-яё]\.\s*[А-ЯЁа-яё]|[А-ЯЁ]\.\s*[А-ЯЁ]))(?:\.(?![а-яё])|(?![а-яёА-ЯЁ]))/u;
const SPARTAKA_REGEX =
  /Спар?така(?:,?\s*12(?![0-9]))?(?:\s*,?\s*(?:№\s*)?(\d{2,3}[а-яА-Я]?))?/iu;
const ROOM_REGEX = /(?:^|\s)(?:№\s*)?(\d{2,3}(?:-\d{2,3})?[а-яА-Я]?)(?=\s|$)/u;
const DAY_NAME_REGEX =
  /^(понедельник|вторник|среда|четверг|пятница|суббота|воскресенье)$/i;
const TIME_LABEL_REGEX = /^\d{1,2}[:.]\d{2}\s*[-–—]\s*\d{1,2}[:.]\d{2}$/;

const RUSSIAN_WEEKDAYS = [
  'Воскресенье',
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
];

const RUSSIAN_DAY_TO_DOW: Record<string, number> = {
  понедельник: 1,
  вторник: 2,
  среда: 3,
  четверг: 4,
  пятница: 5,
  суббота: 6,
  воскресенье: 7,
};

const MONTHS_RU: Record<string, number> = {
  янв: 1,
  фев: 2,
  мар: 3,
  апр: 4,
  май: 5,
  мая: 5,
  июн: 6,
  июл: 7,
  авг: 8,
  сен: 9,
  окт: 10,
  ноя: 11,
  дек: 12,
};

const SUBJECT_EXPANSIONS: Record<string, string> = {
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

const SPARTAKA_ONLY_ROOMS = new Set(['215', '216', '217']);

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Adds deltaDays calendar days to an ISO date "YYYY-MM-DD" without DST ms drift
 */
export function addCalendarDays(isoDate: string, deltaDays: number): string {
  const [y, m, d] = isoDate.split('-').map((n) => parseInt(n, 10));
  const dt = new Date(y, m - 1, d + deltaDays);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/**
 * Returns ISO weekday 1 (Monday) .. 7 (Sunday) for "YYYY-MM-DD"
 */
export function getIsoDayOfWeek(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map((n) => parseInt(n, 10));
  const jsDay = new Date(y, m - 1, d).getDay(); // 0=Sun..6=Sat
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * Dynamically derives Russian day of week capitalized from an ISO date string "YYYY-MM-DD"
 */
export function getDayOfWeekFromDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
  const date = new Date(y, m - 1, d);
  return RUSSIAN_WEEKDAYS[date.getDay()];
}

function cleanString(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

function getDepartmentForGroup(groupId: string): string {
  if (groupId.startsWith('Ж-')) return 'Живопись';
  if (groupId.startsWith('Д-')) return 'Дизайн';
  if (groupId.startsWith('Т-')) return 'Театрально-декорационное искусство';
  return 'Общее отделение';
}

function getCourseForGroup(groupId: string): number {
  const match = groupId.match(/^[ЖДТ]-(\d)\d$/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 1;
}

function normalizeTimePart(raw: string): string {
  const clean = raw.trim().replace('.', ':');
  const [h, m] = clean.split(':');
  return `${h.padStart(2, '0')}:${(m || '00').padStart(2, '0')}`;
}

function parseTimeRange(timeStr: string): { start: string; end: string } {
  const [s, e] = timeStr.split(/[-–—]/);
  return {
    start: normalizeTimePart(s || '09:00'),
    end: normalizeTimePart(e || '09:45'),
  };
}

function inferYearFromSemester(semester: string, month: number): number {
  const years = [...semester.matchAll(/\b(20\d{2})\b/g)].map((m) => parseInt(m[1], 10));
  if (years.length >= 2) {
    return month >= 9 ? years[0] : years[1];
  }
  if (years.length === 1) {
    return years[0];
  }
  return new Date().getFullYear();
}

function extractTimetableMeta(
  items: RawItem[],
  fallbackTitle?: string
): {
  meta: TimetableMeta;
  day1Date: string;
  day2Date: string;
  hasExplicitEndDate: boolean;
} {
  let sourceFileTitle = fallbackTitle || 'Расписание занятий';
  let period = '';
  let semester = '1 семестр';

  const now = new Date();
  const todayDow = now.getDay() === 0 ? 7 : now.getDay();
  const defaultMon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (todayDow - 1));
  let day1Date = `${defaultMon.getFullYear()}-${String(defaultMon.getMonth() + 1).padStart(2, '0')}-${String(defaultMon.getDate()).padStart(2, '0')}`;
  let day2Date = addCalendarDays(day1Date, 1);
  let isRecurring = false;
  let hasExplicitEndDate = false;

  for (const item of items) {
    if (/семестр/i.test(item.str)) {
      semester = cleanString(item.str);
    }
  }

  const titleCandidates: string[] = [];
  for (const item of items) {
    if (/Расписание занятий/i.test(item.str)) {
      titleCandidates.push(cleanString(item.str));
    }
  }
  if (titleCandidates.length > 0) {
    sourceFileTitle = titleCandidates[0];
  }
  if (fallbackTitle && !titleCandidates.includes(fallbackTitle)) {
    titleCandidates.push(cleanString(fallbackTitle));
  }

  for (const candidate of titleCandidates) {
    // 1. Cross-month numeric range: e.g. "30.09-01.10.2026" or "28.12-03.01.2027"
    const crossMonthMatch = candidate.match(
      /(\d{1,2})\.(\d{2})\s*[-–—/]\s*(\d{1,2})\.(\d{2})\.(\d{4})/
    );
    if (crossMonthMatch) {
      const [, d1, m1, d2, m2, yyyy] = crossMonthMatch;
      const m1Num = parseInt(m1, 10);
      const m2Num = parseInt(m2, 10);
      const yyyyNum = parseInt(yyyy, 10);
      const y1 = m2Num < m1Num ? yyyyNum - 1 : yyyyNum;
      period = `${d1}.${m1}-${d2}.${m2}.${yyyy}`;
      day1Date = `${y1}-${m1.padStart(2, '0')}-${d1.padStart(2, '0')}`;
      day2Date = `${yyyyNum}-${m2.padStart(2, '0')}-${d2.padStart(2, '0')}`;
      isRecurring = false;
      hasExplicitEndDate = true;
      break;
    }

    // 2. Same-month numeric range: e.g. "04/05.09.2026"
    const sameMonthMatch = candidate.match(
      /(\d{1,2})\s*[/.-–—]\s*(\d{1,2})\.(\d{2})\.(\d{4})/
    );
    if (sameMonthMatch) {
      const [, d1, d2, mm, yyyy] = sameMonthMatch;
      period = `${d1}/${d2}.${mm}.${yyyy}`;
      day1Date = `${yyyy}-${mm.padStart(2, '0')}-${d1.padStart(2, '0')}`;
      day2Date = `${yyyy}-${mm.padStart(2, '0')}-${d2.padStart(2, '0')}`;
      isRecurring = false;
      hasExplicitEndDate = true;
      break;
    }

    // 3. Russian-month range: e.g. "4-5 сентября 2026"
    const ruRangeMatch = candidate.match(
      /(\d{1,2})\s*[-–—/]\s*(\d{1,2})\s+(янв|фев|мар|апр|ма[йя]|июн|июл|авг|сен|окт|ноя|дек)[а-яё]*\s*(\d{4})?/iu
    );
    if (ruRangeMatch) {
      const [, d1, d2, monStr, yyyyOpt] = ruRangeMatch;
      const monNum = MONTHS_RU[monStr.toLowerCase()] || 1;
      const yyyyNum = yyyyOpt ? parseInt(yyyyOpt, 10) : inferYearFromSemester(semester, monNum);
      const mm = String(monNum).padStart(2, '0');
      period = `${d1}-${d2}.${mm}.${yyyyNum}`;
      day1Date = `${yyyyNum}-${mm}-${d1.padStart(2, '0')}`;
      day2Date = `${yyyyNum}-${mm}-${d2.padStart(2, '0')}`;
      isRecurring = false;
      hasExplicitEndDate = true;
      break;
    }

    // 4. Single numeric date: e.g. "с 16.11.2026г." or "04.09.2026"
    const singleNumericMatch = candidate.match(/(\d{1,2})\.(\d{2})\.(\d{4})/);
    if (singleNumericMatch) {
      const [, d1, mm, yyyy] = singleNumericMatch;
      period = `${d1}.${mm}.${yyyy}`;
      day1Date = `${yyyy}-${mm.padStart(2, '0')}-${d1.padStart(2, '0')}`;
      day2Date = day1Date;
      isRecurring = /(?:^|[^\p{L}])с\s+\d/iu.test(candidate);
      hasExplicitEndDate = false;
      break;
    }

    // 5. Single Russian-month date: e.g. "с 16 ноября 2026"
    const singleRuMatch = candidate.match(
      /(\d{1,2})\s+(янв|фев|мар|апр|ма[йя]|июн|июл|авг|сен|окт|ноя|дек)[а-яё]*\s*(\d{4})?/iu
    );
    if (singleRuMatch) {
      const [, d1, monStr, yyyyOpt] = singleRuMatch;
      const monNum = MONTHS_RU[monStr.toLowerCase()] || 1;
      const yyyyNum = yyyyOpt ? parseInt(yyyyOpt, 10) : inferYearFromSemester(semester, monNum);
      const mm = String(monNum).padStart(2, '0');
      period = `${d1.padStart(2, '0')}.${mm}.${yyyyNum}`;
      day1Date = `${yyyyNum}-${mm}-${d1.padStart(2, '0')}`;
      day2Date = day1Date;
      isRecurring = /(?:^|[^\p{L}])с\s+\d/iu.test(candidate);
      hasExplicitEndDate = false;
      break;
    }
  }

  return {
    meta: {
      updatedAt: new Date().toISOString(),
      sourceFileTitle,
      period,
      semester,
      effectiveFrom: day1Date,
      isRecurring,
    },
    day1Date,
    day2Date,
    hasExplicitEndDate,
  };
}

function multiplyMatrix(m1: number[], m2: number[]): number[] {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

function toHexByte(val: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(val)));
  return clamped.toString(16).padStart(2, '0');
}

function parseHexRgb(hex: string): [number, number, number] | null {
  const clean = hex.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(clean)) {
    return [
      parseInt(clean.slice(1, 3), 16),
      parseInt(clean.slice(3, 5), 16),
      parseInt(clean.slice(5, 7), 16),
    ];
  }
  if (/^#[0-9a-f]{3}$/.test(clean)) {
    return [
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
      parseInt(clean[3] + clean[3], 16),
    ];
  }
  return null;
}

function getColorLuminance(hex: string): number {
  const rgb = parseHexRgb(hex);
  if (!rgb) return 0.5;
  return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
}

function applyColorMutation(
  hex: string,
  mutateColors?: Record<string, string>
): string {
  const low = hex.toLowerCase();
  if (!mutateColors) return low;
  for (const [k, v] of Object.entries(mutateColors)) {
    if (k.toLowerCase() === low) {
      return v.toLowerCase();
    }
  }
  return low;
}

function normalizeColor(args: any[], mutateColors?: Record<string, string>): string | null {
  if (!args || args.length === 0) return null;
  let hex: string | null = null;
  if (typeof args[0] === 'string') {
    hex = args[0].toLowerCase();
  } else if (typeof args[0] === 'number' && args.length === 1) {
    const v = args[0] <= 1 ? args[0] * 255 : args[0];
    const h = toHexByte(v);
    hex = `#${h}${h}${h}`;
  } else {
    const arr =
      args.length >= 3 && typeof args[0] === 'number'
        ? [args[0], args[1], args[2]]
        : Array.isArray(args[0]) || ArrayBuffer.isView(args[0])
        ? Array.from(args[0] as Iterable<number>)
        : null;
    if (arr && arr.length >= 3) {
      const scale = Math.max(arr[0], arr[1], arr[2]) <= 1 ? 255 : 1;
      hex = `#${toHexByte(arr[0] * scale)}${toHexByte(arr[1] * scale)}${toHexByte(arr[2] * scale)}`;
    }
  }
  return hex ? applyColorMutation(hex, mutateColors) : null;
}

async function extractPageGeometry(
  page: any,
  options?: ParsePdfOptions
): Promise<{
  hSegs: HSeg[];
  vSegs: VSeg[];
  fillRects: FillRect[];
}> {
  if (options?.ignoreVectorBorders) {
    return { hSegs: [], vSegs: [], fillRects: [] };
  }

  const ops = await page.getOperatorList();
  const hSegs: HSeg[] = [];
  const vSegs: VSeg[] = [];
  const fillRects: FillRect[] = [];

  const defaultBlack = applyColorMutation('#000000', options?.mutateColors);
  const stateStack: { ctm: number[]; fillColor: string; strokeColor: string }[] = [
    { ctm: [1, 0, 0, 1, 0, 0], fillColor: defaultBlack, strokeColor: defaultBlack },
  ];

  const FILL_OPS = new Set([
    pdfjs.OPS.fill,
    pdfjs.OPS.eoFill,
    pdfjs.OPS.fillStroke,
    pdfjs.OPS.eoFillStroke,
    pdfjs.OPS.closeFillStroke,
    pdfjs.OPS.closeEOFillStroke,
  ]);
  const STROKE_OPS = new Set([
    pdfjs.OPS.stroke,
    pdfjs.OPS.closeStroke,
    pdfjs.OPS.fillStroke,
    pdfjs.OPS.eoFillStroke,
    pdfjs.OPS.closeFillStroke,
    pdfjs.OPS.closeEOFillStroke,
  ]);

  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i];
    const args = ops.argsArray[i];
    const state = stateStack[stateStack.length - 1];

    if (fn === pdfjs.OPS.save) {
      stateStack.push({
        ctm: [...state.ctm],
        fillColor: state.fillColor,
        strokeColor: state.strokeColor,
      });
    } else if (fn === pdfjs.OPS.restore) {
      if (stateStack.length > 1) stateStack.pop();
    } else if (fn === pdfjs.OPS.transform && Array.isArray(args) && args.length >= 6) {
      state.ctm = multiplyMatrix(state.ctm, args);
    } else if (fn === pdfjs.OPS.setFillRGBColor || fn === pdfjs.OPS.setFillGray) {
      const col = normalizeColor(args, options?.mutateColors);
      if (col) state.fillColor = col;
    } else if (fn === pdfjs.OPS.setStrokeRGBColor || fn === pdfjs.OPS.setStrokeGray) {
      const col = normalizeColor(args, options?.mutateColors);
      if (col) state.strokeColor = col;
    } else if (fn === pdfjs.OPS.constructPath && Array.isArray(args)) {
      const [paintOp, , minMax] = args;
      if (!minMax || minMax.length < 4) continue;

      const ctm = state.ctm;
      const corners = [
        [minMax[0], minMax[1]],
        [minMax[2], minMax[1]],
        [minMax[0], minMax[3]],
        [minMax[2], minMax[3]],
      ];
      const xs = corners.map(([cx, cy]) => ctm[0] * cx + ctm[2] * cy + ctm[4]);
      const ys = corners.map(([cx, cy]) => ctm[1] * cx + ctm[3] * cy + ctm[5]);
      const x1 = Math.min(...xs);
      const x2 = Math.max(...xs);
      const y1 = Math.min(...ys);
      const y2 = Math.max(...ys);
      const w = x2 - x1;
      const h = y2 - y1;

      const isFill = FILL_OPS.has(paintOp);
      const isStroke = STROKE_OPS.has(paintOp);

      if (isFill) {
        if (getColorLuminance(state.fillColor) < 0.7) {
          if (h <= 2.5 && w >= 5) {
            hSegs.push({ x1, x2, y: (y1 + y2) / 2 });
          } else if (w <= 2.5 && h >= 5) {
            vSegs.push({ x: (x1 + x2) / 2, y1, y2 });
          }
        } else if (w > 2.5 && h > 2.5 && getColorLuminance(state.fillColor) >= 0.15) {
          fillRects.push({ x1, y1, x2, y2, color: state.fillColor });
        }
      }

      if (isStroke && getColorLuminance(state.strokeColor) < 0.7) {
        if (h <= 2.5 && w >= 5) {
          hSegs.push({ x1, x2, y: (y1 + y2) / 2 });
        } else if (w <= 2.5 && h >= 5) {
          vSegs.push({ x: (x1 + x2) / 2, y1, y2 });
        }
      }
    }
  }

  return { hSegs, vSegs, fillRects };
}

function clusterCoords(vals: number[], tol = 2.0): number[] {
  const sorted = [...vals].sort((a, b) => a - b);
  const clusters: { sum: number; count: number; avg: number }[] = [];
  for (const v of sorted) {
    if (!clusters.length || v - clusters[clusters.length - 1].avg > tol) {
      clusters.push({ sum: v, count: 1, avg: v });
    } else {
      const c = clusters[clusters.length - 1];
      c.sum += v;
      c.count++;
      c.avg = c.sum / c.count;
    }
  }
  return clusters.map((c) => c.avg);
}

function parseCellItems(
  rawItems: RawItem[],
  hasYellow: boolean
): {
  subject: string;
  teacher: string;
  room: string;
  building: BuildingType;
  buildingAddress: string;
} {
  const sorted = [...rawItems].sort((a, b) =>
    Math.abs(b.y - a.y) > 2 ? b.y - a.y : a.x - b.x
  );
  const textLines = sorted.map((i) => i.str);

  let building: BuildingType = hasYellow ? 'spartaka' : 'main';
  let buildingAddress = hasYellow ? 'ул. Спартака, 12' : 'Красный пр-т, 9';
  let teacher = '';
  let room = '';

  for (const line of textLines) {
    if (/Спар?така/iu.test(line)) {
      building = 'spartaka';
      buildingAddress = 'ул. Спартака, 12';
      const sm = line.match(SPARTAKA_REGEX);
      if (sm && sm[1]) {
        room = sm[1];
      }
    }

    if (!teacher) {
      const tm = line.match(TEACHER_REGEX);
      if (tm) {
        teacher = tm[1]
          .trim()
          .replace(
            /([А-ЯЁа-яё-]+)\s*([А-ЯЁа-яё])\.\s*([А-ЯЁа-яё])\.?/u,
            (_m, s, i1, i2) => `${s} ${i1.toUpperCase()}.${i2.toUpperCase()}.`
          );
        if (teacher === 'Башук М.В.') teacher = 'Башук М.Г.';
        if (teacher === 'Николаенко О.Н') teacher = 'Николаенко О.Н.';
      }
    }
  }

  const joinedAll = textLines.join(' ');
  if (/динамо/iu.test(joinedAll)) {
    room = 'Динамо';
  }

  if (!room) {
    const teacherGlobal = new RegExp(TEACHER_REGEX.source, 'gu');
    const spartakaGlobal = new RegExp(SPARTAKA_REGEX.source, 'giu');
    for (const line of textLines) {
      const clean = line.replace(teacherGlobal, ' ').replace(spartakaGlobal, ' ').trim();
      const rm = clean.match(ROOM_REGEX);
      if (rm) {
        room = rm[1];
        break;
      }
    }
  }

  if (SPARTAKA_ONLY_ROOMS.has(room)) {
    building = 'spartaka';
    buildingAddress = 'ул. Спартака, 12';
  }

  const teacherGlobal = new RegExp(TEACHER_REGEX.source, 'gu');
  const spartakaGlobal = new RegExp(SPARTAKA_REGEX.source, 'giu');
  const subjectTokens: string[] = [];

  for (const line of textLines) {
    let clean = line
      .replace(teacherGlobal, ' ')
      .replace(spartakaGlobal, ' ')
      .replace(/динамо/giu, ' ');
    if (room && room !== 'Динамо') {
      clean = clean.replace(
        new RegExp(`(^|\\s)(?:№\\s*)?${escapeRegExp(room)}(?=\\s|$)`, 'u'),
        ' '
      );
    }
    clean = clean.replace(/\+[A-Z]{1,3}\d+:[A-Z]{1,3}\d+/g, '');
    clean = clean.replace(/^[\s,.;:-]+|[\s,.;:-]+$/g, '');
    clean = cleanString(clean);
    if (clean.length > 0) {
      subjectTokens.push(clean);
    }
  }

  let subject = cleanString(subjectTokens.join(' '));
  subject = subject.replace(/^[,.\s:-]+|[,.\s:-]+$/g, '');

  if (!subject && room === 'Динамо') {
    subject = 'Физкультура';
  }
  if (/^физкультура$/iu.test(subject) && !room) {
    room = 'Динамо';
  }

  const lower = subject.toLowerCase();
  if (SUBJECT_EXPANSIONS[lower]) {
    subject = SUBJECT_EXPANSIONS[lower];
  }

  return { subject, teacher, room, building, buildingAddress };
}

interface ParsedCellData {
  subject: string;
  teacher: string;
  room: string;
  building: BuildingType;
  buildingAddress: string;
}

function learnPagePalette(
  R: number,
  C: number,
  cols: ColumnDef[],
  cellColor: string[][],
  rowTexts: RawItem[][]
): { emptyColors: Set<string>; spartakaColors: Set<string> } {
  const colorStats = new Map<
    string,
    { total: number; withText: number; withSpartaka: number }
  >();

  for (let r = 0; r < R; r++) {
    if (r % 11 === 4) continue;
    for (let c = 0; c < C; c++) {
      const col = cellColor[r][c].toLowerCase();
      if (getColorLuminance(col) >= 0.97) continue;

      let stats = colorStats.get(col);
      if (!stats) {
        stats = { total: 0, withText: 0, withSpartaka: 0 };
        colorStats.set(col, stats);
      }
      stats.total++;

      const cellItems = rowTexts[r].filter((it) => {
        const cx = it.x + it.w / 2;
        return cx >= cols[c].x1 && cx <= cols[c].x2;
      });
      if (cellItems.length > 0) {
        stats.withText++;
        if (cellItems.some((it) => /Спар?така/iu.test(it.str))) {
          stats.withSpartaka++;
        }
      }
    }
  }

  const emptyColors = new Set<string>();
  const spartakaColors = new Set<string>();

  for (const [col, stats] of colorStats.entries()) {
    if (stats.total > 0 && stats.withText === 0) {
      emptyColors.add(col);
    }
  }

  for (const [col, stats] of colorStats.entries()) {
    if (emptyColors.has(col)) continue;
    const rgb = parseHexRgb(col);
    const isWarmYellow =
      rgb !== null && rgb[0] > 200 && rgb[1] > 180 && rgb[2] < 120;
    if (
      (stats.withText > 0 && stats.withSpartaka / stats.withText > 0.5) ||
      isWarmYellow
    ) {
      spartakaColors.add(col);
    }
  }

  if (emptyColors.size === 0) {
    emptyColors.add('#d9d9d9');
  }

  return { emptyColors, spartakaColors };
}

function isLessonTripletComplete(
  items: RawItem[],
  hasSpartakaColor: boolean
): boolean {
  if (items.length === 0) return false;
  const parsed = parseCellItems(items, hasSpartakaColor);
  if (!parsed.subject) return false;
  return (
    parsed.teacher.length > 0 ||
    /^физкультура$/iu.test(parsed.subject) ||
    /практик/iu.test(parsed.subject)
  );
}

function rowHasExplicitSubject(rowItems: RawItem[]): boolean {
  const teacherGlobal = new RegExp(TEACHER_REGEX.source, 'gu');
  const spartakaGlobal = new RegExp(SPARTAKA_REGEX.source, 'giu');
  for (const it of rowItems) {
    let clean = it.str
      .replace(teacherGlobal, ' ')
      .replace(spartakaGlobal, ' ')
      .replace(/динамо/giu, ' ');
    const rm = clean.match(ROOM_REGEX);
    if (rm) {
      clean = clean.replace(
        new RegExp(`(^|\\s)(?:№\\s*)?${escapeRegExp(rm[1])}(?=\\s|$)`, 'u'),
        ' '
      );
    }
    clean = clean.replace(/\+[A-Z]{1,3}\d+:[A-Z]{1,3}\d+/g, '');
    clean = clean.replace(/^[\s,.;:-]+|[\s,.;:-]+$/g, '');
    if (cleanString(clean).length > 0) return true;
  }
  return false;
}

function rowStartsNewLesson(
  currItems: RawItem[],
  rowItems: RawItem[],
  hasSpartakaColor: boolean
): boolean {
  if (!isLessonTripletComplete(currItems, hasSpartakaColor)) return false;

  const rowHasSubject = rowHasExplicitSubject(rowItems);
  if (rowHasSubject) return true;

  // Handle a rare case where a new PE lesson only prints "Динамо" without "Физкультура"
  const currParsed = parseCellItems(currItems, hasSpartakaColor);
  const currText = currItems.map((i) => i.str).join(' ');
  const rowText = rowItems.map((i) => i.str).join(' ');
  if (
    !/^физкультура$/iu.test(currParsed.subject) &&
    /динамо/iu.test(rowText) &&
    !/динамо/iu.test(currText)
  ) {
    return true;
  }
  return false;
}

function inferSubRowSpanFromTextRows(
  occupiedRows: number[],
  minBound: number,
  maxBound: number
): { rStart: number; rEnd: number } {
  const dayIdx = Math.floor(minBound / 11);
  const dayBase = dayIdx * 11;
  const tr = occupiedRows.map((r) => r % 11).sort((a, b) => a - b);

  let localStart = tr[0];
  let localEnd = tr[tr.length - 1];

  const singleSlot = PAIR_SLOTS.find(
    (s) => localStart >= s.rMin && localEnd <= s.rMax
  );
  if (singleSlot) {
    localStart = singleSlot.rMin;
    localEnd = singleSlot.rMax;
  } else if (
    tr.length === 2 &&
    tr[1] - tr[0] === 2 &&
    (tr[0] === 0 || tr[0] === 5 || tr[0] === 7)
  ) {
    localEnd = tr[1] + 1;
  }

  return {
    rStart: Math.max(minBound, dayBase + localStart),
    rEnd: Math.min(maxBound, dayBase + localEnd),
  };
}

function findItemSubRow(
  it: RawItem,
  subRows: SubRowDef[],
  minR: number,
  maxR: number
): number {
  const cy = it.y + it.h / 2;
  let bestR = minR;
  let bestDist = Infinity;
  for (let r = minR; r <= maxR; r++) {
    if (cy >= subRows[r].yBot - 0.5 && cy <= subRows[r].yTop + 0.5) {
      return r;
    }
    const dist = Math.abs(cy - (subRows[r].yBot + subRows[r].yTop) / 2);
    if (dist < bestDist) {
      bestDist = dist;
      bestR = r;
    }
  }
  return bestR;
}

function splitBlockSemantically(
  blk: VerticalBlock,
  subRows: SubRowDef[],
  useFallbackGrid: boolean
): VerticalBlock[] {
  if (blk.items.length === 0) return [];

  const itemsByRow = new Map<number, RawItem[]>();
  for (const it of blk.items) {
    const r = findItemSubRow(it, subRows, blk.rStart, blk.rEnd);
    let list = itemsByRow.get(r);
    if (!list) {
      list = [];
      itemsByRow.set(r, list);
    }
    list.push(it);
  }

  const occupiedRows = Array.from(itemsByRow.keys()).sort((a, b) => a - b);
  if (occupiedRows.length === 0) return [];
  if (occupiedRows.length === 1 && !useFallbackGrid) return [blk];

  const groups: { rows: number[]; items: RawItem[] }[] = [];
  let currRows: number[] = [occupiedRows[0]];
  let currItems: RawItem[] = [...itemsByRow.get(occupiedRows[0])!];

  for (let i = 1; i < occupiedRows.length; i++) {
    const r = occupiedRows[i];
    const rItems = itemsByRow.get(r)!;
    if (rowStartsNewLesson(currItems, rItems, blk.hasYellow)) {
      groups.push({ rows: currRows, items: currItems });
      currRows = [r];
      currItems = [...rItems];
    } else {
      currRows.push(r);
      currItems.push(...rItems);
    }
  }
  groups.push({ rows: currRows, items: currItems });

  if (groups.length === 1 && !useFallbackGrid) {
    return [blk];
  }

  const result: VerticalBlock[] = [];
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const prevEnd = i > 0 ? result[i - 1].rEnd + 1 : blk.rStart;
    const nextStart =
      i + 1 < groups.length ? groups[i + 1].rows[0] - 1 : blk.rEnd;
    const span = inferSubRowSpanFromTextRows(g.rows, prevEnd, nextStart);
    result.push({
      c: blk.c,
      dayIdx: blk.dayIdx,
      rStart: span.rStart,
      rEnd: span.rEnd,
      items: g.items,
      hasYellow: blk.hasYellow,
    });
  }

  return result;
}

function healFragmentBlocks(
  blocks: VerticalBlock[],
  cellColor: string[][],
  emptyColors: Set<string>
): VerticalBlock[] {
  if (blocks.length <= 1) return blocks;
  const healed: VerticalBlock[] = [];

  for (const blk of blocks) {
    const prev = healed[healed.length - 1];
    if (prev && prev.dayIdx === blk.dayIdx) {
      const prevLocalEnd = prev.rEnd % 11;
      const currLocalStart = blk.rStart % 11;
      const sameHalfDay =
        (prevLocalEnd <= 3 && currLocalStart <= 3) ||
        (prevLocalEnd >= 5 && currLocalStart >= 5);

      if (sameHalfDay) {
        let hasEmptyBetween = false;
        for (let r = prev.rEnd + 1; r < blk.rStart; r++) {
          if (emptyColors.has(cellColor[r][blk.c].toLowerCase())) {
            hasEmptyBetween = true;
            break;
          }
        }
        if (!hasEmptyBetween) {
          const parsedA = parseCellItems(prev.items, prev.hasYellow);
          const parsedB = parseCellItems(blk.items, blk.hasYellow);
          if (
            parsedA.subject.length > 0 &&
            !parsedA.teacher &&
            !/^физкультура$/iu.test(parsedA.subject) &&
            !parsedB.subject &&
            (parsedB.teacher.length > 0 || parsedB.room.length > 0)
          ) {
            prev.rEnd = blk.rEnd;
            prev.items.push(...blk.items);
            prev.hasYellow = prev.hasYellow || blk.hasYellow;
            continue;
          }
        }
      }
    }
    healed.push({ ...blk, items: [...blk.items] });
  }

  return healed;
}

interface BlockWithParsed {
  blk: VerticalBlock;
  parsed: ParsedCellData;
}

function propagateStreamLectures(
  C: number,
  colBlocksWithParsed: BlockWithParsed[][]
): void {
  const bySpanAndSubject = new Map<string, Map<number, BlockWithParsed>>();

  for (let c = 0; c < C; c++) {
    for (const entry of colBlocksWithParsed[c]) {
      const subjKey = entry.parsed.subject.trim().toLowerCase();
      if (!subjKey) continue;
      const key = `${entry.blk.rStart}:${entry.blk.rEnd}:${subjKey}`;
      let colMap = bySpanAndSubject.get(key);
      if (!colMap) {
        colMap = new Map<number, BlockWithParsed>();
        bySpanAndSubject.set(key, colMap);
      }
      if (!colMap.has(c)) {
        colMap.set(c, entry);
      }
    }
  }

  for (const colMap of bySpanAndSubject.values()) {
    if (colMap.size <= 1) continue;
    const colsSorted = Array.from(colMap.keys()).sort((a, b) => a - b);

    // Split into contiguous column runs [c1..c2]
    let runStartIdx = 0;
    while (runStartIdx < colsSorted.length) {
      let runEndIdx = runStartIdx;
      while (
        runEndIdx + 1 < colsSorted.length &&
        colsSorted[runEndIdx + 1] === colsSorted[runEndIdx] + 1
      ) {
        runEndIdx++;
      }

      if (runEndIdx > runStartIdx) {
        const runEntries: BlockWithParsed[] = [];
        for (let k = runStartIdx; k <= runEndIdx; k++) {
          runEntries.push(colMap.get(colsSorted[k])!);
        }
        const donor = runEntries.find(
          (e) => e.parsed.teacher.length > 0 && e.parsed.room.length > 0
        );
        if (donor) {
          for (const sib of runEntries) {
            if (!sib.parsed.teacher && !sib.parsed.room) {
              sib.parsed.teacher = donor.parsed.teacher;
              sib.parsed.room = donor.parsed.room;
              sib.parsed.building = donor.parsed.building;
              sib.parsed.buildingAddress = donor.parsed.buildingAddress;
            }
          }
        }
      }

      runStartIdx = runEndIdx + 1;
    }
  }
}

/**
 * Validates parsed schedule integrity across all lessons
 */
export function validateScheduleIntegrity(
  schedule: ParsedSchedule
): ScheduleValidationReport {
  let incompleteLessonCount = 0;
  let multiTeacherCount = 0;
  let typoCount = 0;
  const warnings: string[] = [];

  const teacherGlobal =
    /[А-ЯЁ][а-яё]+(?:-[А-ЯЁ][а-яё]+)?\s+[А-ЯЁ]\.[А-ЯЁ]\./gu;

  for (const l of schedule.lessons) {
    if (!l.subject || !l.subject.trim()) {
      incompleteLessonCount++;
      warnings.push(`Empty subject in lesson ${l.id}`);
    }
    if (/\+[A-Z]{1,3}\d+:[A-Z]{1,3}\d+/.test(l.subject || '')) {
      typoCount++;
      warnings.push(`Excel formula typo in subject "${l.subject}" (${l.id})`);
    }
    const isPE = /^физкультура$/iu.test(l.subject || '');
    const isPractice = /практик/iu.test(l.subject || '');
    if (!isPractice && (!l.room || !l.room.trim())) {
      incompleteLessonCount++;
      warnings.push(`Missing room in lesson ${l.id} (${l.subject})`);
    }
    if (!isPE && !isPractice && (!l.teacher || !l.teacher.trim())) {
      incompleteLessonCount++;
      warnings.push(`Missing teacher in lesson ${l.id} (${l.subject})`);
    }
    const teacherMatches = l.teacher ? l.teacher.match(teacherGlobal) : null;
    if (teacherMatches && teacherMatches.length > 1) {
      multiTeacherCount++;
      warnings.push(`Multiple teachers in lesson ${l.id}: "${l.teacher}"`);
    }
    if (
      !/^\d{2}:\d{2}$/.test(l.timeStart) ||
      !/^\d{2}:\d{2}$/.test(l.timeEnd) ||
      l.timeStart >= l.timeEnd
    ) {
      warnings.push(
        `Invalid time range ${l.timeStart}-${l.timeEnd} in lesson ${l.id}`
      );
    }
    if (getDayOfWeekFromDate(l.date) !== l.dayOfWeek) {
      warnings.push(
        `Day of week mismatch for ${l.date}: got "${l.dayOfWeek}", expected "${getDayOfWeekFromDate(l.date)}"`
      );
    }
  }

  return {
    isValid:
      incompleteLessonCount === 0 &&
      multiTeacherCount === 0 &&
      typoCount === 0 &&
      warnings.length === 0,
    totalLessons: schedule.lessons.length,
    incompleteLessonCount,
    multiTeacherCount,
    typoCount,
    warnings,
  };
}

/**
 * Parses a PDF buffer containing the NGHU college timetable into a structured ParsedSchedule
 */
export async function parsePdfBuffer(
  buffer: Buffer,
  sourceUrl?: string,
  fallbackTitle?: string,
  options?: ParsePdfOptions
): Promise<ParsedSchedule> {
  const data = new Uint8Array(buffer);
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;

  const groupsMap = new Map<string, GroupInfo>();
  const lessons: Lesson[] = [];
  const usedIds = new Set<string>();
  let detectedMeta: TimetableMeta = {
    updatedAt: new Date().toISOString(),
  };
  let day1Date = '';
  let day2Date = '';
  let hasExplicitEndDate = false;

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const tc = await page.getTextContent();
    const { hSegs, vSegs, fillRects } = await extractPageGeometry(page, options);

    const items: RawItem[] = tc.items
      .filter((it: any) => 'str' in it && it.str.trim().length > 0)
      .map((it: any) => ({
        str: it.str.trim(),
        x: it.transform[4],
        y: it.transform[5],
        w: it.width,
        h: it.height,
        transform: Array.from(it.transform),
      }));

    if (pageNum === 1) {
      const metaRes = extractTimetableMeta(items, fallbackTitle);
      detectedMeta = metaRes.meta;
      if (sourceUrl) detectedMeta.sourceUrl = sourceUrl;
      day1Date = metaRes.day1Date;
      day2Date = metaRes.day2Date;
      hasExplicitEndDate = metaRes.hasExplicitEndDate;
    }

    const groupCandidateItems = items.filter((it) => /^[ЖДТ]-\d\d$/i.test(it.str));
    if (groupCandidateItems.length === 0) continue;

    const maxGroupY = Math.max(...groupCandidateItems.map((g) => g.y));
    const headerItems = groupCandidateItems
      .filter((it) => Math.abs(it.y - maxGroupY) <= 12)
      .sort((a, b) => a.x - b.x);

    if (headerItems.length === 0) continue;

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

    const firstGroupX = headerItems[0].x;

    const timeLabels = items
      .filter((it) => TIME_LABEL_REGEX.test(it.str) && it.x < firstGroupX)
      .sort((a, b) => b.y - a.y);

    if (timeLabels.length === 0) continue;

    // Derive columns and subRows from actual PDF vector grid lines
    const allVX = clusterCoords(
      vSegs.map((s) => s.x),
      2.0
    );
    const vectorCols: (ColumnDef | null)[] = headerItems.map((h) => {
      const cx = h.x + h.w / 2;
      const x1 = [...allVX].reverse().find((x) => x < cx);
      const x2 = allVX.find((x) => x > cx);
      if (x1 === undefined || x2 === undefined) return null;
      return { group: h.str, x1, x2 };
    });

    const timeX = timeLabels[0].x + timeLabels[0].w / 2;
    const timeHSegs = hSegs.filter((s) => s.x1 <= timeX && s.x2 >= timeX);
    const rowYs = clusterCoords(
      timeHSegs.map((s) => s.y),
      1.5
    ).sort((a, b) => b - a);

    const vectorSubRows: SubRowDef[] = [];
    for (let r = 0; r < rowYs.length - 1; r++) {
      const yTop = rowYs[r];
      const yBot = rowYs[r + 1];
      const tl = timeLabels.find(
        (t) => t.y + t.h / 2 >= yBot - 1 && t.y + t.h / 2 <= yTop + 1
      );
      if (tl) {
        vectorSubRows.push({
          idx: vectorSubRows.length,
          yTop,
          yBot,
          timeStr: tl.str,
        });
      }
    }

    const useFallbackGrid =
      hSegs.length < 10 ||
      vSegs.length < 10 ||
      vectorSubRows.length !== timeLabels.length ||
      vectorCols.some((c) => c === null);

    let cols: ColumnDef[];
    let subRows: SubRowDef[];

    if (!useFallbackGrid) {
      cols = vectorCols as ColumnDef[];
      subRows = vectorSubRows;
    } else {
      const hCenters = headerItems.map((h) => h.x + h.w / 2);
      const avgColWidth =
        hCenters.length > 1
          ? (hCenters[hCenters.length - 1] - hCenters[0]) / (hCenters.length - 1)
          : 70;
      cols = headerItems.map((h, i) => ({
        group: h.str,
        x1:
          i === 0
            ? hCenters[0] - avgColWidth / 2
            : (hCenters[i - 1] + hCenters[i]) / 2,
        x2:
          i === headerItems.length - 1
            ? hCenters[i] + avgColWidth / 2
            : (hCenters[i] + hCenters[i + 1]) / 2,
      }));
      const tCenters = timeLabels.map((tl) => tl.y + tl.h / 2);
      subRows = timeLabels.map((tl, i) => {
        const cy = tCenters[i];
        const prevDiff = i > 0 ? tCenters[i - 1] - cy : 10;
        const nextDiff = i < tCenters.length - 1 ? cy - tCenters[i + 1] : 10;
        const yTop = i === 0 ? cy + nextDiff / 2 : (tCenters[i - 1] + cy) / 2;
        const yBot =
          i === tCenters.length - 1 ? cy - prevDiff / 2 : (cy + tCenters[i + 1]) / 2;
        return { idx: i, yTop, yBot, timeStr: tl.str };
      });
    }

    const numDays = Math.floor(subRows.length / 11);
    if (numDays === 0) continue;

    if (numDays >= 5 && !hasExplicitEndDate) {
      detectedMeta.isRecurring = true;
    }

    const dayLabels = items.filter((it) => DAY_NAME_REGEX.test(it.str) && it.x < firstGroupX);
    const daysConfig: DayConfig[] = [];

    for (let d = 0; d < numDays; d++) {
      const chunkRows = subRows.slice(d * 11, (d + 1) * 11);
      const chunkTopY = chunkRows[0].yTop;
      const chunkBotY = chunkRows[10].yBot;
      const midY = (chunkTopY + chunkBotY) / 2;

      let bestLabel: RawItem | null = null;
      let bestDist = Infinity;
      for (const l of dayLabels) {
        const isRotated = Math.abs(l.transform[1]) > Math.abs(l.transform[0]);
        const labelCenterY = isRotated ? l.y + l.w / 2 : l.y + l.h / 2;
        if (labelCenterY >= chunkBotY - 15 && labelCenterY <= chunkTopY + 15) {
          const dist = Math.abs(labelCenterY - midY);
          if (dist < bestDist) {
            bestDist = dist;
            bestLabel = l;
          }
        }
      }

      const detectedDayStr = bestLabel ? bestLabel.str.toLowerCase() : '';
      const dow = RUSSIAN_DAY_TO_DOW[detectedDayStr] || d + 1;

      let dateStr: string;
      if (detectedMeta.isRecurring) {
        const effectiveFrom = detectedMeta.effectiveFrom || day1Date;
        const effectiveDow = getIsoDayOfWeek(effectiveFrom);
        const offset = (dow - effectiveDow + 7) % 7;
        dateStr = addCalendarDays(effectiveFrom, offset);
      } else if (numDays === 2) {
        dateStr = d === 0 ? day1Date : day2Date;
      } else {
        dateStr = addCalendarDays(day1Date, d);
      }

      daysConfig.push({
        dayIdx: d,
        dayOfWeek: getDayOfWeekFromDate(dateStr),
        date: dateStr,
      });
    }

    const R = numDays * 11;
    const C = cols.length;

    const cellColor: string[][] = Array.from({ length: R }, (_, r) =>
      Array.from({ length: C }, (_, c) => {
        const cx = (cols[c].x1 + cols[c].x2) / 2;
        const cy = (subRows[r].yBot + subRows[r].yTop) / 2;
        let col = '#ffffff';
        for (const fr of fillRects) {
          if (cx >= fr.x1 && cx <= fr.x2 && cy >= fr.y1 && cy <= fr.y2) {
            col = fr.color;
          }
        }
        return col;
      })
    );

    const tableX1 = cols[0].x1 - 2;
    const tableX2 = cols[C - 1].x2 + 2;
    const tableYTop = subRows[0].yTop + 2;
    const tableYBot = subRows[R - 1].yBot - 2;

    const rowTexts: RawItem[][] = Array.from({ length: R }, () => []);
    for (const it of items) {
      if (
        /^перерыв$/i.test(it.str) ||
        /практик/i.test(it.str) ||
        DAY_NAME_REGEX.test(it.str)
      ) {
        continue;
      }
      const cx = it.x + it.w / 2;
      const cy = it.y + it.h / 2;
      if (cx < tableX1 || cx > tableX2 || cy < tableYBot || cy > tableYTop) continue;

      let bestR = -1;
      let bestDist = Infinity;
      for (let r = 0; r < R; r++) {
        if (cy >= subRows[r].yBot - 0.5 && cy <= subRows[r].yTop + 0.5) {
          bestR = r;
          break;
        }
        const dist = Math.abs(cy - (subRows[r].yBot + subRows[r].yTop) / 2);
        if (dist < bestDist) {
          bestDist = dist;
          bestR = r;
        }
      }
      if (bestR >= 0) {
        rowTexts[bestR].push(it);
      }
    }

    const { emptyColors, spartakaColors } = learnPagePalette(
      R,
      C,
      cols,
      cellColor,
      rowTexts
    );

    const isEmpty = (r: number, c: number): boolean =>
      r % 11 === 4 || emptyColors.has(cellColor[r][c].toLowerCase());

    const hasHBorder = (y: number, x1: number, x2: number): boolean => {
      if (useFallbackGrid) return false;
      const w = x2 - x1;
      let covered = 0;
      for (const s of hSegs) {
        if (Math.abs(s.y - y) <= 2.2) {
          const ov = Math.min(s.x2, x2) - Math.max(s.x1, x1);
          if (ov > 0) covered += ov;
        }
      }
      return covered >= w * 0.45;
    };

    const hasVBorder = (x: number, yBot: number, yTop: number): boolean => {
      if (useFallbackGrid) return true;
      const h = yTop - yBot;
      let covered = 0;
      for (const s of vSegs) {
        if (Math.abs(s.x - x) <= 2.2) {
          const ov = Math.min(s.y2, yTop) - Math.max(s.y1, yBot);
          if (ov > 0) covered += ov;
        }
      }
      return covered >= h * 0.45;
    };

    // Step A: Build vertical blocks per column
    const vBlockOf: (VerticalBlock | null)[][] = Array.from({ length: R }, () =>
      Array<VerticalBlock | null>(C).fill(null)
    );
    const colBlocks: VerticalBlock[][] = Array.from({ length: C }, () => []);

    for (let c = 0; c < C; c++) {
      let r = 0;
      while (r < R) {
        if (isEmpty(r, c)) {
          r++;
          continue;
        }
        const dayIdx = Math.floor(r / 11);
        let rEnd = r;
        while (
          rEnd + 1 < R &&
          Math.floor((rEnd + 1) / 11) === dayIdx &&
          !isEmpty(rEnd + 1, c) &&
          !hasHBorder(subRows[rEnd].yBot, cols[c].x1, cols[c].x2)
        ) {
          rEnd++;
        }
        const blk: VerticalBlock = {
          c,
          dayIdx,
          rStart: r,
          rEnd,
          items: [],
          hasYellow: false,
        };
        for (let k = r; k <= rEnd; k++) {
          vBlockOf[k][c] = blk;
          if (spartakaColors.has(cellColor[k][c].toLowerCase())) {
            blk.hasYellow = true;
          }
        }
        colBlocks[c].push(blk);
        r = rEnd + 1;
      }
    }

    // Step B: Distribute row texts across unbordered strips and wide multi-column items
    for (let r = 0; r < R; r++) {
      let c = 0;
      while (c < C) {
        if (isEmpty(r, c)) {
          // Handle text overflowing slightly onto a non-empty-shaded break row (e.g. Ж-12 Sat Pair 2)
          if (
            r % 11 === 4 &&
            !emptyColors.has(cellColor[r][c].toLowerCase())
          ) {
            const overflow = rowTexts[r].filter((it) => {
              const cx = it.x + it.w / 2;
              return cx >= cols[c].x1 && cx <= cols[c].x2;
            });
            if (
              overflow.length > 0 &&
              r > 0 &&
              vBlockOf[r - 1][c] &&
              !hasHBorder(subRows[r - 1].yBot, cols[c].x1, cols[c].x2)
            ) {
              vBlockOf[r - 1][c]!.items.push(...overflow);
            }
          }
          c++;
          continue;
        }

        const blk0 = vBlockOf[r][c]!;
        let cEnd = c;
        while (
          cEnd + 1 < C &&
          !isEmpty(r, cEnd + 1) &&
          !hasVBorder(cols[cEnd].x2, subRows[r].yBot, subRows[r].yTop) &&
          cellColor[r][cEnd + 1].toLowerCase() === cellColor[r][c].toLowerCase() &&
          vBlockOf[r][cEnd + 1]!.rStart === blk0.rStart &&
          vBlockOf[r][cEnd + 1]!.rEnd === blk0.rEnd
        ) {
          cEnd++;
        }

        const stripX1 = cols[c].x1;
        const stripX2 = cols[cEnd].x2;
        const leftEdge = c === 0 ? stripX1 - 1 : stripX1;
        const rightEdge = cEnd === C - 1 ? stripX2 + 1 : stripX2;
        const stripItems = rowTexts[r].filter((it) => {
          const cx = it.x + it.w / 2;
          return cEnd === C - 1
            ? cx >= leftEdge && cx <= rightEdge
            : cx >= leftEdge && cx < rightEdge;
        });

        if (c === cEnd) {
          blk0.items.push(...stripItems);

          // Share wide crossing text items with adjacent empty-on-this-row columns of same vertical block span
          for (const it of stripItems) {
            if (it.x < cols[c].x1 - 3 || it.x + it.w > cols[c].x2 + 3) {
              for (let k = 0; k < C; k++) {
                if (k === c || isEmpty(r, k)) continue;
                const adjBlk = vBlockOf[r][k];
                if (
                  !adjBlk ||
                  adjBlk.rStart !== blk0.rStart ||
                  adjBlk.rEnd !== blk0.rEnd
                ) {
                  continue;
                }
                const overlap =
                  Math.min(it.x + it.w, cols[k].x2) - Math.max(it.x, cols[k].x1);
                if (overlap < Math.min(6, it.w * 0.2)) continue;
                const colHasOwnText = rowTexts[r].some((other) => {
                  const ocx = other.x + other.w / 2;
                  return ocx >= cols[k].x1 && ocx <= cols[k].x2;
                });
                if (!colHasOwnText && !adjBlk.items.includes(it)) {
                  adjBlk.items.push(it);
                }
              }
            }
          }
        } else if (stripItems.length === 1) {
          const it = stripItems[0];
          const itCenter = it.x + it.w / 2;
          const stripCenter = (stripX1 + stripX2) / 2;
          let homeCol = c;
          for (let k = c; k <= cEnd; k++) {
            if (itCenter >= cols[k].x1 && itCenter <= cols[k].x2) {
              homeCol = k;
              break;
            }
          }
          const homeColCenter = (cols[homeCol].x1 + cols[homeCol].x2) / 2;
          const crossesBorder =
            it.x < cols[homeCol].x1 - 2 || it.x + it.w > cols[homeCol].x2 + 2;

          if (
            crossesBorder ||
            Math.abs(itCenter - stripCenter) < Math.abs(itCenter - homeColCenter)
          ) {
            for (let k = c; k <= cEnd; k++) {
              vBlockOf[r][k]!.items.push(it);
            }
          } else {
            vBlockOf[r][homeCol]!.items.push(it);
          }
        } else {
          for (const it of stripItems) {
            const itCenter = it.x + it.w / 2;
            let homeCol = c;
            for (let k = c; k <= cEnd; k++) {
              if (itCenter >= cols[k].x1 && itCenter <= cols[k].x2) {
                homeCol = k;
                break;
              }
            }
            vBlockOf[r][homeCol]!.items.push(it);
          }
        }

        c = cEnd + 1;
      }
    }

    // Step B.5: Semantic Triplet Splitting & Fragment Healing
    const refinedColBlocks: VerticalBlock[][] = Array.from({ length: C }, (_, c) => {
      const splitBlocks: VerticalBlock[] = [];
      for (const blk of colBlocks[c]) {
        if (blk.items.length === 0) continue;
        splitBlocks.push(...splitBlockSemantically(blk, subRows, useFallbackGrid));
      }
      return healFragmentBlocks(splitBlocks, cellColor, emptyColors);
    });

    // Step C: Parse each block and propagate stream lecture metadata across matching siblings
    const colBlocksWithParsed: BlockWithParsed[][] = refinedColBlocks.map((blks) =>
      blks
        .filter((blk) => blk.items.length > 0)
        .map((blk) => ({
          blk,
          parsed: parseCellItems(blk.items, blk.hasYellow),
        }))
    );

    propagateStreamLectures(C, colBlocksWithParsed);

    // Step D: Emit pair-intersection lessons with exact sub-row times
    const pageHasLessonsByCol = new Array<boolean>(C).fill(false);

    for (let c = 0; c < C; c++) {
      for (const { blk, parsed } of colBlocksWithParsed[c]) {
        if (!parsed.subject && !parsed.teacher && !parsed.room) continue;

        const dayCfg = daysConfig[blk.dayIdx];
        if (!dayCfg) continue;

        const localStart = blk.rStart % 11;
        const localEnd = blk.rEnd % 11;

        for (const slot of PAIR_SLOTS) {
          if (localStart > slot.rMax || localEnd < slot.rMin) continue;

          const ovStart = Math.max(localStart, slot.rMin);
          const ovEnd = Math.min(localEnd, slot.rMax);
          const timeStart = parseTimeRange(subRows[blk.dayIdx * 11 + ovStart].timeStr).start;
          const timeEnd = parseTimeRange(subRows[blk.dayIdx * 11 + ovEnd].timeStr).end;

          const baseId = `${cols[c].group}_${dayCfg.date}_${slot.pairNumber}_${parsed.room || 'unknown'}`;
          let id = baseId;
          let suffix = 2;
          while (usedIds.has(id)) {
            id = `${baseId}_${suffix++}`;
          }
          usedIds.add(id);

          lessons.push({
            id,
            group: cols[c].group,
            date: dayCfg.date,
            dayOfWeek: dayCfg.dayOfWeek,
            pairNumber: slot.pairNumber,
            timeStart,
            timeEnd,
            subject: parsed.subject,
            teacher: parsed.teacher,
            room: parsed.room,
            building: parsed.building,
            buildingAddress: parsed.buildingAddress,
          });
          pageHasLessonsByCol[c] = true;
        }
      }
    }

    // Step E: Detect practice banners on this page and assign to empty column runs
    const practiceItems = items.filter((it) => /практик/i.test(it.str));
    if (practiceItems.length > 0) {
      const emptyColIndices: number[] = [];
      for (let c = 0; c < C; c++) {
        if (!pageHasLessonsByCol[c]) {
          emptyColIndices.push(c);
        }
      }

      if (emptyColIndices.length > 0) {
        const runs: number[][] = [];
        for (const idx of emptyColIndices) {
          const lastRun = runs[runs.length - 1];
          if (!lastRun || idx !== lastRun[lastRun.length - 1] + 1) {
            runs.push([idx]);
          } else {
            lastRun.push(idx);
          }
        }

        const assignedPracticeCols = new Set<number>();

        for (const pItem of practiceItems) {
          const practiceText = cleanString(pItem.str);
          const isRotated = Math.abs(pItem.transform[1]) > Math.abs(pItem.transform[0]);
          const px = isRotated ? pItem.x - pItem.h / 2 : pItem.x + pItem.w / 2;

          let matchedRun = runs.find((run) => {
            const runX1 = cols[run[0]].x1 - 10;
            const runX2 = cols[run[run.length - 1]].x2 + 10;
            return px >= runX1 && px <= runX2;
          });

          if (!matchedRun && practiceItems.length === 1) {
            matchedRun = emptyColIndices;
          }

          if (matchedRun) {
            for (const c of matchedRun) {
              if (assignedPracticeCols.has(c)) continue;
              assignedPracticeCols.add(c);
              const g = cols[c].group;
              for (const dayCfg of daysConfig) {
                const id = `${g}_${dayCfg.date}_1_practice`;
                if (usedIds.has(id)) continue;
                usedIds.add(id);
                lessons.push({
                  id,
                  group: g,
                  date: dayCfg.date,
                  dayOfWeek: dayCfg.dayOfWeek,
                  pairNumber: 1,
                  timeStart: DEFAULT_PAIR_TIMES[1].start,
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
      }
    }
  }

  // Step F: Sort lessons and aggregate into chronological days
  lessons.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    const gCmp = a.group.localeCompare(b.group, 'ru');
    if (gCmp !== 0) return gCmp;
    if (a.pairNumber !== b.pairNumber) return a.pairNumber - b.pairNumber;
    return a.timeStart.localeCompare(b.timeStart);
  });

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

  const days = Array.from(daysMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  const groupsList = Array.from(groupsMap.values()).sort((a, b) => {
    if (a.course !== b.course) return a.course - b.course;
    return a.name.localeCompare(b.name, 'ru');
  });

  return {
    meta: detectedMeta,
    groups: groupsList,
    days,
    lessons,
  };
}
