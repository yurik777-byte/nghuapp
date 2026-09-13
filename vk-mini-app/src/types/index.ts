export interface Lesson {
  pairNumber: number;
  timeStart: string;
  timeEnd: string;
  subject: string;
  room: string;
  building: 'main' | 'spartaka';
  buildingAddress: string;
  teacher: string;
  category?: 'core' | 'academic' | 'general';
  subgroup?: number;
}

export interface DaySchedule {
  date: string;       // YYYY-MM-DD
  dayOfWeek: string;  // Понедельник, Вторник...
  lessons: Lesson[];
}

export interface ScheduleResponse {
  group: string;
  updatedAt: string;
  days: DaySchedule[];
}

export interface GroupItem {
  id: string;
  name: string;
  course: number;
  department: 'design' | 'painting' | 'theater';
  departmentName: string;
}

export interface RoomScheduleItem {
  timeStart: string;
  timeEnd: string;
  subject: string;
  group: string;
  teacher: string;
}

export interface RoomItem {
  room: string;
  building: 'main' | 'spartaka';
  buildingAddress: string;
  status: 'free' | 'occupied';
  currentLesson: RoomScheduleItem | null;
  nextLesson: RoomScheduleItem | null;
  schedule: RoomScheduleItem[];
}

export interface TeacherLessonItem {
  date: string;
  dayOfWeek: string;
  pairNumber: number;
  timeStart: string;
  timeEnd: string;
  subject: string;
  group: string;
  room: string;
  buildingAddress: string;
}

export interface TeacherItem {
  name: string;
  subjects: string[];
  schedule: TeacherLessonItem[];
}

export interface MetaResponse {
  semester: string;
  academicYear: string;
  updatedAt: string;
}
