/**
 * Building identifier:
 * - 'main': Главный корпус (Красный пр-т, 9)
 * - 'spartaka': Корпус на ул. Спартака, 12
 */
export type BuildingType = 'main' | 'spartaka';

/**
 * Metadata about the timetable and scraping status
 */
export interface TimetableMeta {
  updatedAt: string; // ISO 8601 timestamp of last scrape/parse
  sourceUrl?: string; // Direct URL to downloaded PDF or timetable webpage
  sourceFileTitle?: string; // e.g. "Расписание занятий на 04/05.09.2026 г."
  period?: string; // e.g. "04/05.09.2026"
  semester?: string; // e.g. "1 семестр 2026-2027"
}

/**
 * Single scheduled lesson / class pair
 */
export interface Lesson {
  id: string; // Unique identifier for the lesson (e.g. `${group}_${date}_${pairNumber}_${room}`)
  group: string; // Academic group, e.g. "Д-11", "Ж-21", "Т-31"
  date: string; // ISO date string "YYYY-MM-DD" or date representation
  dayOfWeek: string; // Russian name of day of week, e.g. "Пятница"
  pairNumber: number; // Lesson pair number (1 to 6)
  timeStart: string; // Pair start time, e.g. "09:00"
  timeEnd: string; // Pair end time, e.g. "10:35"
  subject: string; // Subject / discipline name, e.g. "Живопись"
  teacher: string; // Teacher's full or abbreviated name, e.g. "Иванов И. И."
  room: string; // Classroom identifier, e.g. "109", "216"
  building: BuildingType; // 'main' or 'spartaka'
  buildingAddress: string; // "Красный пр-т, 9" or "ул. Спартака, 12"
}

/**
 * Schedule grouped by day
 */
export interface ScheduleDay {
  date: string; // "YYYY-MM-DD"
  dayOfWeek: string; // e.g. "Пятница", "Суббота"
  lessons: Lesson[];
}

/**
 * Metadata and classification of an academic group
 */
export interface GroupInfo {
  id: string; // Group ID, e.g. "Д-11"
  name: string; // Display name, e.g. "Д-11"
  course: number; // Course year: 1, 2, 3, 4
  department: string; // "Дизайн", "Живопись", "Театрально-декорационное искусство"
}

/**
 * Current occupancy status and day schedule for a classroom
 */
export interface RoomOccupancy {
  room: string; // Room number/code, e.g. "109", "каб. 216"
  building: BuildingType;
  buildingAddress: string;
  isOccupied: boolean;
  currentLesson: Lesson | null;
  nextLesson: Lesson | null;
  daySchedule: Lesson[];
}

/**
 * Complete schedule aggregated for a teacher
 */
export interface TeacherSchedule {
  teacher: string; // Full or abbreviated name
  subjects: string[]; // List of disciplines taught by this teacher
  lessons: Lesson[]; // All scheduled lessons for this teacher
}

/**
 * Complete parsed timetable payload produced by parser and stored in cache
 */
export interface ParsedSchedule {
  meta: TimetableMeta;
  groups: GroupInfo[];
  days: ScheduleDay[];
  lessons: Lesson[];
}
