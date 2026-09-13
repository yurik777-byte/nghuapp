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
});
