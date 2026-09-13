import { describe, it, expect } from 'vitest';
import { getCurrentLessonStatus, checkBuildingTransfer, formatMinutesWord } from '../src/utils/timeUtils';
import { Lesson } from '../src/types';

describe('TimeUtils & LiveStatus', () => {
  const sampleLessons: Lesson[] = [
    {
      pairNumber: 1,
      timeStart: '09:00',
      timeEnd: '10:35',
      subject: 'Живопись',
      room: '109',
      building: 'main',
      buildingAddress: 'Красный пр-т, 9',
      teacher: 'Иванов И. И.',
    },
    {
      pairNumber: 2,
      timeStart: '10:45',
      timeEnd: '12:20',
      subject: 'Рисунок',
      room: '204',
      building: 'spartaka',
      buildingAddress: 'ул. Спартака, 12',
      teacher: 'Петров П. П.',
    },
  ];

  it('detects lesson in progress', () => {
    const mockNow = new Date('2026-09-13T09:30:00');
    const status = getCurrentLessonStatus(sampleLessons, mockNow);
    expect(status.type).toBe('lesson');
    expect(status.currentLesson?.subject).toBe('Живопись');
    expect(status.remainingMinutes).toBe(65);
    expect(status.progress).toBeGreaterThan(0);
  });

  it('detects break and flags building transfer', () => {
    const mockNow = new Date('2026-09-13T10:40:00');
    const status = getCurrentLessonStatus(sampleLessons, mockNow);
    expect(status.type).toBe('break');
    expect(status.remainingMinutes).toBe(5);
    expect(status.hasBuildingTransfer).toBe(true);
    expect(status.transferFrom).toBe('Красный пр-т, 9');
    expect(status.transferTo).toBe('ул. Спартака, 12');
  });

  it('detects completed day', () => {
    const mockNow = new Date('2026-09-13T19:00:00');
    const status = getCurrentLessonStatus(sampleLessons, mockNow);
    expect(status.type).toBe('finished');
  });

  it('detects before classes', () => {
    const mockNow = new Date('2026-09-13T08:30:00');
    const status = getCurrentLessonStatus(sampleLessons, mockNow);
    expect(status.type).toBe('before_classes');
    expect(status.remainingMinutes).toBe(30);
  });

  it('handles empty lessons gracefully', () => {
    const status = getCurrentLessonStatus([], new Date());
    expect(status.type).toBe('no_lessons');
  });

  it('formats minute word endings in Russian correctly', () => {
    expect(formatMinutesWord(1)).toBe('1 минута');
    expect(formatMinutesWord(2)).toBe('2 минуты');
    expect(formatMinutesWord(5)).toBe('5 минут');
    expect(formatMinutesWord(12)).toBe('12 минут');
    expect(formatMinutesWord(21)).toBe('21 минута');
  });

  it('detects building transfer helper', () => {
    expect(checkBuildingTransfer(sampleLessons[0], sampleLessons[1])).toBe(true);
    expect(checkBuildingTransfer(sampleLessons[0], sampleLessons[0])).toBe(false);
  });
});
