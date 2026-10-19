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

let cachedSchedule: RawParsedSchedule | null = null;
let scheduleLoadPromise: Promise<RawParsedSchedule> | null = null;

const DATA_URL = import.meta.env.VITE_SCHEDULE_DATA_URL || './schedule.json';

export async function loadStaticSchedule(): Promise<RawParsedSchedule> {
  if (cachedSchedule) {
    return cachedSchedule;
  }
  if (scheduleLoadPromise) {
    return scheduleLoadPromise;
  }

  scheduleLoadPromise = (async () => {
    const response = await fetch(DATA_URL);
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

export async function getStaticSchedule(group: string, date?: string): Promise<ScheduleResponse> {
  const data = await loadStaticSchedule();
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
  time?: string
): Promise<RoomItem[]> {
  const data = await loadStaticSchedule();
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
    const key = `${lesson.building}:${lesson.room}`;
    if (!roomMap.has(key)) {
      roomMap.set(key, {
        room: lesson.room,
        building: lesson.building,
        buildingAddress: lesson.buildingAddress,
        lessons: [],
      });
    }
    roomMap.get(key)!.lessons.push(lesson);
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const targetDate = date?.trim() || todayStr;
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

    const dateLessons = sortedLessons.filter((l) => l.date === targetDate);

    const currentRaw =
      dateLessons.find((l) => targetTime >= l.timeStart && targetTime < l.timeEnd) || null;

    let nextRaw: RawLesson | null = null;
    if (currentRaw) {
      nextRaw = dateLessons.find((l) => l.pairNumber > currentRaw.pairNumber) || null;
    } else {
      nextRaw = dateLessons.find((l) => l.timeStart > targetTime) || null;
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

    // Determine the last completed lesson in this room
    const pastLessons = sortedLessons.filter((lesson) => {
      if (targetDate && lesson.date) {
        return lesson.date < targetDate || (lesson.date === targetDate && targetTime >= lesson.timeEnd);
      }
      return targetTime >= lesson.timeEnd;
    });
    const lastRaw = pastLessons.length > 0 ? pastLessons[pastLessons.length - 1] : null;
    const lastLesson = lastRaw ? toRoomScheduleItem(lastRaw) : null;

    const schedule = (date ? dateLessons : sortedLessons).map(toRoomScheduleItem);

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

export async function getStaticTeachers(nameFilter?: string): Promise<TeacherItem[]> {
  const data = await loadStaticSchedule();
  const allLessons = data.lessons;

  const teacherMap = new Map<
    string,
    {
      subjects: Set<string>;
      lessons: RawLesson[];
    }
  >();

  for (const lesson of allLessons) {
    const teacher = lesson.teacher.trim();
    if (!teacher) continue;

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
      dayOfWeek: '',
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
