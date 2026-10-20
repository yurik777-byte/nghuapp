import { describe, it, expect } from 'vitest';
import { Lesson } from '../src/types';

describe('Schedule Component Logic', () => {
  it('calculates break minutes correctly between consecutive lessons', () => {
    const l1: Lesson = {
      pairNumber: 1,
      timeStart: '09:00',
      timeEnd: '10:35',
      subject: 'Рисунок',
      room: '101',
      building: 'main',
      buildingAddress: 'Красный пр-т, 9',
      teacher: 'Иванов',
    };
    const l2: Lesson = {
      pairNumber: 2,
      timeStart: '10:45',
      timeEnd: '12:20',
      subject: 'Живопись',
      room: '102',
      building: 'main',
      buildingAddress: 'Красный пр-т, 9',
      teacher: 'Петров',
    };

    const [endH, endM] = l1.timeEnd.split(':').map(Number);
    const [startH, startM] = l2.timeStart.split(':').map(Number);
    const breakMins = (startH * 60 + startM) - (endH * 60 + endM);
    expect(breakMins).toBe(10);
  });

  it('scopes isCurrent strictly to today', () => {
    const liveStatus = {
      type: 'lesson' as const,
      currentLesson: { pairNumber: 1, subject: 'Рисунок' } as Lesson,
    };

    const isTodaySelected = true;
    const isOtherDaySelected = false;

    const isCurrentToday =
      isTodaySelected &&
      liveStatus.type === 'lesson' &&
      liveStatus.currentLesson?.pairNumber === 1;

    const isCurrentOtherDay =
      isOtherDaySelected &&
      liveStatus.type === 'lesson' &&
      liveStatus.currentLesson?.pairNumber === 1;

    expect(isCurrentToday).toBe(true);
    expect(isCurrentOtherDay).toBe(false);
  });

  it('expands abbreviated and irregular subject titles properly', async () => {
    const { formatSubjectTitle } = await import('../src/utils/formatters');
    expect(formatSubjectTitle('Пластическая анат')).toBe('Пластическая анатомия');
    expect(formatSubjectTitle('пластическая анат.')).toBe('Пластическая анатомия');
    expect(formatSubjectTitle('Ин.язык')).toBe('Иностранный язык');
    expect(formatSubjectTitle('Физкультура Динамо')).toBe('Физкультура');
    expect(formatSubjectTitle('Худ.оформление спект')).toBe('Художественное оформление спектакля');
    expect(formatSubjectTitle('Естествознаяние')).toBe('Естествознание');
    expect(formatSubjectTitle('Живопись')).toBe('Живопись');
  });

  it('correctly calculates swipe gesture transitions between schedule days', () => {
    const days = [
      { date: '2026-10-19', dayOfWeek: 'Понедельник' },
      { date: '2026-10-20', dayOfWeek: 'Вторник' },
      { date: '2026-10-21', dayOfWeek: 'Среда' },
    ];

    const getNextDate = (currentDate: string, deltaX: number, deltaY: number, elapsed: number) => {
      // Must be < 550ms, >= 45px distance, and >= 1.3x dominant over vertical
      if (elapsed < 550 && Math.abs(deltaX) >= 45 && Math.abs(deltaX) >= Math.abs(deltaY) * 1.3) {
        const idx = days.findIndex((d) => d.date === currentDate);
        if (deltaX < 0 && idx < days.length - 1) {
          return days[idx + 1].date;
        } else if (deltaX > 0 && idx > 0) {
          return days[idx - 1].date;
        }
      }
      return currentDate;
    };

    // Swipe left (next day)
    expect(getNextDate('2026-10-19', -60, 10, 200)).toBe('2026-10-20');
    expect(getNextDate('2026-10-20', -80, 5, 250)).toBe('2026-10-21');
    // Cannot swipe past last day
    expect(getNextDate('2026-10-21', -60, 0, 150)).toBe('2026-10-21');

    // Swipe right (prev day)
    expect(getNextDate('2026-10-21', 70, 15, 220)).toBe('2026-10-20');
    expect(getNextDate('2026-10-20', 65, 0, 180)).toBe('2026-10-19');
    // Cannot swipe before first day
    expect(getNextDate('2026-10-19', 80, 0, 100)).toBe('2026-10-19');

    // Vertical dominant drag (user scrolling up/down) should NOT change day
    expect(getNextDate('2026-10-20', -50, 120, 300)).toBe('2026-10-20');

    // Too slow drag (> 550ms) should NOT trigger day switch
    expect(getNextDate('2026-10-20', -80, 5, 700)).toBe('2026-10-20');

    // Insufficient distance (< 45px) should NOT trigger day switch
    expect(getNextDate('2026-10-20', -30, 2, 200)).toBe('2026-10-20');
  });
});
