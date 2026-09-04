import fs from 'node:fs';
import path from 'node:path';
import {
  BuildingType,
  GroupInfo,
  Lesson,
  ParsedSchedule,
  RoomOccupancy,
  ScheduleDay,
  TeacherSchedule,
  TimetableMeta,
} from '../types/index.js';
import { fetchLatestSchedule } from '../parser/scraper.js';

export interface ScheduleFilter {
  group?: string;
  date?: string;
}

export interface RoomFilter {
  building?: BuildingType;
  date?: string;
  time?: string;
}

export class ScheduleService {
  private cachedSchedule: ParsedSchedule | null = null;
  private fallbackPdfPath?: string;
  private refreshPromise: Promise<ParsedSchedule> | null = null;

  constructor(fallbackPdfPath?: string) {
    if (fallbackPdfPath) {
      this.fallbackPdfPath = fallbackPdfPath;
    } else {
      const parentFallback = path.resolve(process.cwd(), '../schedule_sample.pdf');
      const cwdFallback = path.resolve(process.cwd(), 'schedule_sample.pdf');
      this.fallbackPdfPath = fs.existsSync(parentFallback) ? parentFallback : cwdFallback;
    }
  }

  public setFallbackPdfPath(customPath: string): void {
    this.fallbackPdfPath = customPath;
  }

  public setSchedule(schedule: ParsedSchedule): void {
    this.cachedSchedule = schedule;
  }

  /**
   * Initializes the cache if not already loaded
   */
  public async init(): Promise<ParsedSchedule> {
    if (this.cachedSchedule) {
      return this.cachedSchedule;
    }
    return this.refresh();
  }

  /**
   * Forces a refresh from source or fallback PDF
   */
  public async refresh(): Promise<ParsedSchedule> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const schedule = await fetchLatestSchedule({
          fallbackPdfPath: this.fallbackPdfPath,
        });
        this.cachedSchedule = schedule;
        return schedule;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  public async getMeta(): Promise<TimetableMeta & { title?: string }> {
    const schedule = await this.init();
    return {
      title: schedule.meta.sourceFileTitle || schedule.meta.period,
      ...schedule.meta,
    };
  }

  public async getSchedule(
    filter?: ScheduleFilter
  ): Promise<{ meta: TimetableMeta; days: ScheduleDay[] }> {
    const schedule = await this.init();
    let days = schedule.days.map((day) => ({
      date: day.date,
      dayOfWeek: day.dayOfWeek,
      lessons: [...day.lessons],
    }));

    if (filter?.date) {
      const targetDate = filter.date.trim();
      days = days.filter((d) => d.date === targetDate);
    }

    if (filter?.group) {
      const targetGroup = filter.group.trim().toLowerCase();
      days = days.map((d) => ({
        ...d,
        lessons: d.lessons.filter(
          (l) => l.group.toLowerCase() === targetGroup
        ),
      }));
    }

    return {
      meta: schedule.meta,
      days,
    };
  }

  public async getGroups(): Promise<GroupInfo[]> {
    const schedule = await this.init();
    return [...schedule.groups];
  }

  public async getRooms(filter?: RoomFilter): Promise<(RoomOccupancy & { roomNumber: string; schedule: Lesson[] })[]> {
    const schedule = await this.init();
    const allLessons = schedule.lessons;

    // Group distinct rooms by building and room code
    const roomMap = new Map<string, { room: string; building: BuildingType; buildingAddress: string; lessons: Lesson[] }>();

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

    // Determine target date & time for occupancy calculation (in local timezone)
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const targetDate = filter?.date?.trim() || todayStr;
    const targetTime = filter?.time?.trim() || timeStr;

    const result: (RoomOccupancy & { roomNumber: string; schedule: Lesson[] })[] = [];

    for (const entry of roomMap.values()) {
      if (filter?.building && entry.building !== filter.building) {
        continue;
      }

      // Sort all lessons for this room chronologically
      const sortedLessons = [...entry.lessons].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.pairNumber - b.pairNumber;
      });

      // Day-specific lessons for occupancy check
      const dateLessons = sortedLessons.filter((l) => l.date === targetDate);

      // Determine current lesson
      const currentLesson =
        dateLessons.find(
          (l) => targetTime >= l.timeStart && targetTime < l.timeEnd
        ) || null;

      const isOccupied = currentLesson !== null;

      // Determine next lesson
      let nextLesson: Lesson | null = null;
      if (currentLesson) {
        nextLesson =
          dateLessons.find((l) => l.pairNumber > currentLesson.pairNumber) ||
          null;
      } else {
        nextLesson =
          dateLessons.find((l) => l.timeStart > targetTime) || null;
      }

      // If filtering by date, daySchedule reflects that date, otherwise all room lessons
      const daySchedule = filter?.date ? dateLessons : sortedLessons;

      result.push({
        room: entry.room,
        roomNumber: entry.room,
        building: entry.building,
        buildingAddress: entry.buildingAddress,
        isOccupied,
        currentLesson,
        nextLesson,
        daySchedule,
        schedule: daySchedule,
      });
    }

    // Sort rooms by building, then natural room number
    result.sort((a, b) => {
      if (a.building !== b.building) {
        return a.building === 'main' ? -1 : 1;
      }
      return a.room.localeCompare(b.room, 'ru', { numeric: true });
    });

    return result;
  }

  public async getTeachers(nameFilter?: string): Promise<(TeacherSchedule & { name: string })[]> {
    const schedule = await this.init();
    const allLessons = schedule.lessons;

    // Group lessons by teacher
    const teacherMap = new Map<string, { subjects: Set<string>; lessons: Lesson[] }>();

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

    const result: (TeacherSchedule & { name: string })[] = [];

    for (const [teacher, data] of teacherMap.entries()) {
      if (
        nameFilter &&
        !teacher.toLowerCase().includes(nameFilter.trim().toLowerCase())
      ) {
        continue;
      }

      const sortedLessons = [...data.lessons].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.pairNumber - b.pairNumber;
      });

      result.push({
        teacher,
        name: teacher,
        subjects: Array.from(data.subjects).sort(),
        lessons: sortedLessons,
      });
    }

    // Sort teachers alphabetically
    result.sort((a, b) => a.teacher.localeCompare(b.teacher, 'ru'));

    return result;
  }
}

export const scheduleService = new ScheduleService();
