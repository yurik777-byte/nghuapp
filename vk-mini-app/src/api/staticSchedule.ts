import {
  GroupItem,
  Lesson,
  MetaResponse,
  RoomItem,
  RoomScheduleItem,
  ScheduleResponse,
  TeacherItem,
  TeacherLessonItem,
} from '../types';

export interface RawLesson extends Lesson {
  id?: string;
  group: string;
  date: string;
  dayOfWeek?: string;
}

export interface RawParsedSchedule {
  meta: {
    updatedAt: string;
    sourceFileTitle?: string;
    period?: string;
    semester?: string;
    sourceUrl?: string;
    effectiveFrom?: string;
    isRecurring?: boolean;
  };
  groups: {
    id: string;
    name: string;
    course: number;
    department: string;
  }[];
  days: {
    date: string;
    dayOfWeek: string;
    lessons: RawLesson[];
  }[];
  lessons: RawLesson[];
}

export interface ProjectScheduleOptions {
  now?: Date;
  weeks: number;
  includeDate?: string;
}

const RUSSIAN_WEEKDAYS = [
  'Воскресенье',
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
];

function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addCalendarDays(isoDate: string, deltaDays: number): string {
  const [y, m, d] = isoDate.split('-').map((n) => parseInt(n, 10));
  const dt = new Date(y, m - 1, d + deltaDays);
  return formatLocalDate(dt);
}

function getIsoDayOfWeek(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map((n) => parseInt(n, 10));
  const jsDay = new Date(y, m - 1, d).getDay();
  return jsDay === 0 ? 7 : jsDay;
}

function getDayOfWeekFromDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
  return RUSSIAN_WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

export function isRecurringSchedule(schedule: RawParsedSchedule): boolean {
  if (schedule.meta?.isRecurring === true) return true;
  if (schedule.meta?.isRecurring === false) return false;
  return (
    schedule.days.length === 6 &&
    /(?:^|[^\p{L}])с\s+\d/iu.test(schedule.meta?.sourceFileTitle || '')
  );
}

export function projectRecurringSchedule(
  schedule: RawParsedSchedule,
  options: ProjectScheduleOptions
): RawParsedSchedule {
  if (!schedule.days || schedule.days.length === 0 || !isRecurringSchedule(schedule)) {
    return schedule;
  }

  const sortedDays = [...schedule.days].sort((a, b) => a.date.localeCompare(b.date));
  const effectiveFrom = schedule.meta?.effectiveFrom || sortedDays[0].date;

  const templateByDow = new Map<
    number,
    { templateDate: string; day: RawParsedSchedule['days'][number] }
  >();
  for (const day of sortedDays) {
    const dow = getIsoDayOfWeek(day.date);
    if (dow >= 1 && dow <= 6 && !templateByDow.has(dow)) {
      templateByDow.set(dow, { templateDate: day.date, day });
    }
  }

  if (templateByDow.size === 0) {
    return schedule;
  }

  const now = options.now || new Date();
  const todayStr = formatLocalDate(now);
  const todayDow = getIsoDayOfWeek(todayStr);
  const todayWeekMonday =
    todayDow === 7
      ? addCalendarDays(todayStr, 1)
      : addCalendarDays(todayStr, -(todayDow - 1));

  const effectiveDow = getIsoDayOfWeek(effectiveFrom);
  const effectiveWeekMonday = addCalendarDays(effectiveFrom, -(effectiveDow - 1));
  const startMonday =
    todayWeekMonday >= effectiveWeekMonday ? todayWeekMonday : effectiveWeekMonday;

  const targetDates: string[] = [];
  const seenDates = new Set<string>();

  for (let w = 0; w < options.weeks; w++) {
    for (let d = 0; d < 6; d++) {
      const dateStr = addCalendarDays(startMonday, w * 7 + d);
      if (dateStr < effectiveFrom) continue;
      if (!templateByDow.has(d + 1)) continue;
      if (!seenDates.has(dateStr)) {
        seenDates.add(dateStr);
        targetDates.push(dateStr);
      }
    }
  }

  const includeDate = options.includeDate?.trim();
  if (
    includeDate &&
    /^\d{4}-\d{2}-\d{2}$/.test(includeDate) &&
    includeDate >= effectiveFrom &&
    !seenDates.has(includeDate)
  ) {
    const incDow = getIsoDayOfWeek(includeDate);
    if (incDow >= 1 && incDow <= 6 && templateByDow.has(incDow)) {
      seenDates.add(includeDate);
      targetDates.push(includeDate);
    }
  }

  targetDates.sort((a, b) => a.localeCompare(b));

  const projectedDays: RawParsedSchedule['days'] = [];
  const projectedLessons: RawLesson[] = [];

  for (const dateStr of targetDates) {
    const dow = getIsoDayOfWeek(dateStr);
    const tpl = templateByDow.get(dow);
    if (!tpl) continue;

    const dayOfWeek = getDayOfWeekFromDate(dateStr);
    const clonedLessons: RawLesson[] = tpl.day.lessons.map((l) => ({
      ...l,
      date: dateStr,
      dayOfWeek,
      ...(l.id ? { id: l.id.replace(tpl.templateDate, dateStr) } : {}),
    }));

    projectedDays.push({
      date: dateStr,
      dayOfWeek,
      lessons: clonedLessons,
    });
    projectedLessons.push(...clonedLessons);
  }

  return {
    ...schedule,
    days: projectedDays,
    lessons: projectedLessons,
  };
}

let cachedSchedule: RawParsedSchedule | null = null;
let scheduleLoadPromise: Promise<RawParsedSchedule> | null = null;

const DATA_URL = import.meta.env.VITE_SCHEDULE_DATA_URL || './schedule.json';

export function resetStaticScheduleCache(): void {
  cachedSchedule = null;
  scheduleLoadPromise = null;
}

export async function loadStaticSchedule(forceRefresh?: boolean): Promise<RawParsedSchedule> {
  if (forceRefresh) {
    cachedSchedule = null;
    scheduleLoadPromise = null;
  }
  if (cachedSchedule) {
    return cachedSchedule;
  }
  if (scheduleLoadPromise) {
    return scheduleLoadPromise;
  }

  scheduleLoadPromise = (async () => {
    const response = forceRefresh
      ? await fetch(DATA_URL, { cache: 'no-cache' })
      : await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to load schedule data: ${response.status}`);
    }
    const data: RawParsedSchedule = await response.json();
    cachedSchedule = data;
    return data;
  })();

  try {
    return await scheduleLoadPromise;
  } finally {
    scheduleLoadPromise = null;
  }
}

export function parseDepartment(raw: string): 'design' | 'painting' | 'theater' {
  const lower = raw.toLowerCase();
  if (lower.includes('живопис')) return 'painting';
  if (lower.includes('театр')) return 'theater';
  return 'design';
}

export async function getStaticMeta(): Promise<MetaResponse> {
  const data = await loadStaticSchedule();
  return {
    semester: data.meta.semester || '1 семестр',
    academicYear: data.meta.period || '2026-2027',
    updatedAt: data.meta.updatedAt || new Date().toISOString(),
  };
}

export async function getStaticGroups(): Promise<GroupItem[]> {
  const data = await loadStaticSchedule();
  return data.groups.map((g) => ({
    id: g.id,
    name: g.name,
    course: g.course,
    department: parseDepartment(g.department),
    departmentName: g.department,
  }));
}

export async function getStaticSchedule(
  group: string,
  date?: string,
  now?: Date
): Promise<ScheduleResponse> {
  const rawData = await loadStaticSchedule();
  const data = projectRecurringSchedule(rawData, {
    now,
    weeks: 2,
    includeDate: date,
  });
  const targetGroup = group.trim().toLowerCase();

  let days = data.days.map((day) => ({
    date: day.date,
    dayOfWeek: day.dayOfWeek,
    lessons: day.lessons
      .filter((l) => l.group && l.group.toLowerCase() === targetGroup)
      .map(({ group: _, ...lesson }) => lesson as Lesson),
  }));

  if (date) {
    const targetDate = date.trim();
    days = days.filter((d) => d.date === targetDate);
  }

  return {
    group,
    updatedAt: data.meta.updatedAt,
    days,
  };
}

export async function getStaticRooms(
  building?: string,
  date?: string,
  time?: string,
  now?: Date
): Promise<RoomItem[]> {
  const referenceNow = now || new Date();
  const rawData = await loadStaticSchedule();
  const data = projectRecurringSchedule(rawData, {
    now: referenceNow,
    weeks: 2,
    includeDate: date,
  });
  const allLessons = data.lessons;

  // Group lessons by room and building
  const roomMap = new Map<
    string,
    {
      room: string;
      building: 'main' | 'spartaka';
      buildingAddress: string;
      lessons: RawLesson[];
    }
  >();

  for (const lesson of allLessons) {
    const rawRoom = (lesson.room || '').trim();
    if (!rawRoom || rawRoom === 'unknown' || /динамо/i.test(rawRoom)) {
      continue;
    }
    const key = `${lesson.building}:${rawRoom}`;
    if (!roomMap.has(key)) {
      roomMap.set(key, {
        room: rawRoom,
        building: lesson.building,
        buildingAddress: lesson.buildingAddress,
        lessons: [],
      });
    }
    roomMap.get(key)!.lessons.push(lesson);
  }

  const todayStr = formatLocalDate(referenceNow);
  const timeStr = `${String(referenceNow.getHours()).padStart(2, '0')}:${String(referenceNow.getMinutes()).padStart(2, '0')}`;

  const availableDates = (data.days || []).map((d) => d.date);
  let targetDate = date?.trim() || todayStr;
  if (!date && availableDates.length > 0 && !availableDates.includes(targetDate)) {
    targetDate = availableDates.find((d) => d >= todayStr) || availableDates[0];
  }
  const isToday = targetDate === todayStr;
  const isCheckApplicable = Boolean(time) || isToday;
  const targetTime = time?.trim() || timeStr;

  const result: RoomItem[] = [];

  for (const entry of roomMap.values()) {
    if (building && entry.building !== building) {
      continue;
    }

    const sortedLessons = [...entry.lessons].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.pairNumber - b.pairNumber;
    });

    // Strictly the lessons for the target study day
    const dateLessons = sortedLessons.filter((l) => l.date === targetDate);

    const currentRaw = isCheckApplicable
      ? dateLessons.find((l) => targetTime >= l.timeStart && targetTime < l.timeEnd) || null
      : null;

    let nextRaw: RawLesson | null = null;
    if (isCheckApplicable) {
      if (currentRaw) {
        nextRaw = dateLessons.find((l) => l.pairNumber > currentRaw.pairNumber) || null;
      } else {
        nextRaw = dateLessons.find((l) => l.timeStart > targetTime) || null;
      }
    } else {
      nextRaw = dateLessons.length > 0 ? dateLessons[0] : null;
    }

    const toRoomScheduleItem = (l: RawLesson): RoomScheduleItem => ({
      timeStart: l.timeStart,
      timeEnd: l.timeEnd,
      subject: l.subject,
      group: l.group,
      teacher: l.teacher,
      date: l.date,
      dayOfWeek: l.dayOfWeek,
      pairNumber: l.pairNumber,
    });

    const currentLesson = currentRaw ? toRoomScheduleItem(currentRaw) : null;
    const nextLesson = nextRaw ? toRoomScheduleItem(nextRaw) : null;

    // Determine the last completed lesson in this room for this study day
    let lastRaw: RawLesson | null = null;
    if (isToday) {
      const pastLessonsToday = dateLessons.filter((l) => targetTime >= l.timeEnd);
      if (pastLessonsToday.length > 0) {
        lastRaw = pastLessonsToday[pastLessonsToday.length - 1];
      }
    }

    const lastLesson = lastRaw ? toRoomScheduleItem(lastRaw) : null;

    // Schedule is strictly for the viewing day (never all days of the semester)
    const schedule = dateLessons.map(toRoomScheduleItem);

    result.push({
      room: entry.room,
      building: entry.building,
      buildingAddress: entry.buildingAddress,
      status: currentLesson !== null ? 'occupied' : 'free',
      currentLesson,
      nextLesson,
      lastLesson,
      schedule,
    });
  }

  result.sort((a, b) => {
    if (a.building !== b.building) {
      return a.building === 'main' ? -1 : 1;
    }
    return a.room.localeCompare(b.room, 'ru', { numeric: true });
  });

  return result;
}

export async function getStaticDays(
  now?: Date
): Promise<{ date: string; dayOfWeek: string }[]> {
  const rawData = await loadStaticSchedule();
  const data = projectRecurringSchedule(rawData, { now, weeks: 2 });
  return (data.days || []).map((d) => ({ date: d.date, dayOfWeek: d.dayOfWeek }));
}


export async function getStaticTeachers(
  nameFilter?: string,
  now?: Date
): Promise<TeacherItem[]> {
  const rawData = await loadStaticSchedule();
  const data = projectRecurringSchedule(rawData, { now, weeks: 1 });
  const allLessons = data.lessons;

  const teacherMap = new Map<
    string,
    {
      subjects: Set<string>;
      lessons: RawLesson[];
    }
  >();

  for (const lesson of allLessons) {
    let teacher = lesson.teacher.trim();
    if (!teacher) continue;
    if (teacher === 'Николаенко О.Н') teacher = 'Николаенко О.Н.';
    if (teacher === 'Башук М.В.') teacher = 'Башук М.Г.';

    if (!teacherMap.has(teacher)) {
      teacherMap.set(teacher, {
        subjects: new Set<string>(),
        lessons: [],
      });
    }

    const entry = teacherMap.get(teacher)!;
    if (lesson.subject.trim()) {
      entry.subjects.add(lesson.subject.trim());
    }
    entry.lessons.push(lesson);
  }

  const dayMap = new Map<string, string>();
  if (data.days) {
    for (const d of data.days) {
      if (d.date && d.dayOfWeek) {
        dayMap.set(d.date, d.dayOfWeek);
      }
    }
  }

  const result: TeacherItem[] = [];
  const normalizedFilter = nameFilter?.trim().toLowerCase();

  for (const [name, entry] of teacherMap.entries()) {
    if (normalizedFilter && !name.toLowerCase().includes(normalizedFilter)) {
      continue;
    }

    const sortedLessons = [...entry.lessons].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.pairNumber - b.pairNumber;
    });

    const schedule: TeacherLessonItem[] = sortedLessons.map((l) => ({
      date: l.date,
      dayOfWeek: l.dayOfWeek || dayMap.get(l.date) || '',
      pairNumber: l.pairNumber,
      timeStart: l.timeStart,
      timeEnd: l.timeEnd,
      subject: l.subject,
      group: l.group,
      room: l.room,
      buildingAddress: l.buildingAddress,
    }));

    result.push({
      name,
      subjects: Array.from(entry.subjects),
      schedule,
    });
  }

  result.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  return result;
}
