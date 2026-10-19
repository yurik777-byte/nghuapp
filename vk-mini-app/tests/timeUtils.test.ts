import { describe, it, expect } from 'vitest';
import {
  getCurrentLessonStatus,
  checkBuildingTransfer,
  formatMinutesWord,
  getLocalDateString,
  formatDateRussian,
  formatDateWithDay,
} from '../src/utils/timeUtils';
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

  it('formats local date correctly in YYYY-MM-DD format', () => {
    const d1 = new Date(2026, 8, 13); // month is 0-indexed, 8 = September
    expect(getLocalDateString(d1)).toBe('2026-09-13');

    const d2 = new Date(2026, 0, 5); // month 0 = January, day 5
    expect(getLocalDateString(d2)).toBe('2026-01-05');

    const d3 = new Date(2026, 11, 31); // month 11 = December, day 31
    expect(getLocalDateString(d3)).toBe('2026-12-31');

    // Default parameter test
    const today = new Date();
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(getLocalDateString()).toBe(expected);
  });

  it('formats dates in Russian properly', () => {
    expect(formatDateRussian('2026-10-19')).toBe('19 октября');
    expect(formatDateRussian('2026-01-01')).toBe('1 января');
    expect(formatDateRussian('2026-09-04')).toBe('4 сентября');
    expect(formatDateRussian('')).toBe('');

    expect(formatDateWithDay('2026-10-19', 'Понедельник')).toBe('19 октября (Понедельник)');
    expect(formatDateWithDay('2026-10-20', 'Вторник')).toBe('20 октября (Вторник)');
  });
});

