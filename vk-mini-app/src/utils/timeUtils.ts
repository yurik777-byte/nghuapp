import { Lesson } from '../types';

export interface LiveState {
  type: 'before_classes' | 'lesson' | 'break' | 'finished' | 'no_lessons';
  currentLesson?: Lesson;
  nextLesson?: Lesson;
  remainingMinutes?: number;
  progress?: number; // 0..100
  hasBuildingTransfer?: boolean;
  transferFrom?: string;
  transferTo?: string;
}

export function checkBuildingTransfer(curr?: Lesson | null, next?: Lesson | null): boolean {
  if (!curr || !next) return false;
  return curr.building !== next.building && curr.buildingAddress !== next.buildingAddress;
}

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function getCurrentLessonStatus(lessons: Lesson[], now: Date = new Date()): LiveState {
  if (!lessons || lessons.length === 0) {
    return { type: 'no_lessons' };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const sorted = [...lessons].sort((a, b) => timeToMinutes(a.timeStart) - timeToMinutes(b.timeStart));
  const firstLesson = sorted[0];
  const lastLesson = sorted[sorted.length - 1];

  const firstStart = timeToMinutes(firstLesson.timeStart);
  const lastEnd = timeToMinutes(lastLesson.timeEnd);

  if (currentMinutes < firstStart) {
    return {
      type: 'before_classes',
      nextLesson: firstLesson,
      remainingMinutes: firstStart - currentMinutes,
    };
  }

  if (currentMinutes >= lastEnd) {
    return { type: 'finished' };
  }

  for (let i = 0; i < sorted.length; i++) {
    const lesson = sorted[i];
    const start = timeToMinutes(lesson.timeStart);
    const end = timeToMinutes(lesson.timeEnd);

    if (currentMinutes >= start && currentMinutes < end) {
      const nextLesson = sorted[i + 1];
      const hasTransfer = checkBuildingTransfer(lesson, nextLesson);
      const total = end - start;
      const elapsed = currentMinutes - start;
      const progress = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));

      return {
        type: 'lesson',
        currentLesson: lesson,
        nextLesson,
        remainingMinutes: end - currentMinutes,
        progress,
        hasBuildingTransfer: hasTransfer,
        transferFrom: lesson.buildingAddress,
        transferTo: nextLesson?.buildingAddress,
      };
    }

    if (i < sorted.length - 1) {
      const nextLesson = sorted[i + 1];
      const nextStart = timeToMinutes(nextLesson.timeStart);
      if (currentMinutes >= end && currentMinutes < nextStart) {
        const hasTransfer = checkBuildingTransfer(lesson, nextLesson);
        return {
          type: 'break',
          currentLesson: lesson,
          nextLesson,
          remainingMinutes: nextStart - currentMinutes,
          hasBuildingTransfer: hasTransfer,
          transferFrom: lesson.buildingAddress,
          transferTo: nextLesson.buildingAddress,
        };
      }
    }
  }

  return { type: 'finished' };
}

export function formatMinutesWord(mins: number): string {
  const m = Math.abs(mins) % 100;
  const rem = m % 10;
  if (m > 10 && m < 20) return `${mins} минут`;
  if (rem > 1 && rem < 5) return `${mins} минуты`;
  if (rem === 1) return `${mins} минута`;
  return `${mins} минут`;
}

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

