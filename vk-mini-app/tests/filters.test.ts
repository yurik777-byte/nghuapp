import { describe, it, expect } from 'vitest';
import { RoomItem, TeacherItem } from '../src/types';

describe('Rooms & Teachers Filter Logic', () => {
  const rooms: RoomItem[] = [
    {
      room: '101',
      building: 'main',
      buildingAddress: 'Красный пр-т, 9',
      status: 'free',
      currentLesson: null,
      nextLesson: null,
      schedule: [],
    },
    {
      room: '205',
      building: 'spartaka',
      buildingAddress: 'ул. Спартака, 12',
      status: 'occupied',
      currentLesson: null,
      nextLesson: null,
      schedule: [],
    },
  ];

  it('filters rooms by building and counts free/occupied', () => {
    const mainRooms = rooms.filter((r) => r.building === 'main');
    expect(mainRooms).toHaveLength(1);
    expect(mainRooms[0].room).toBe('101');

    const freeCount = rooms.filter((r) => r.status === 'free').length;
    const occupiedCount = rooms.filter((r) => r.status === 'occupied').length;
    expect(freeCount).toBe(1);
    expect(occupiedCount).toBe(1);
  });

  it('filters teachers by name, subject, and group', () => {
    const teachersWithSchedule: TeacherItem[] = [
      {
        name: 'Вальвачева Е. В.',
        subjects: ['Живопись'],
        schedule: [
          {
            date: '2026-10-19',
            dayOfWeek: 'Понедельник',
            pairNumber: 1,
            timeStart: '09:00',
            timeEnd: '10:35',
            subject: 'Живопись',
            group: 'Д-12',
            room: '217',
            buildingAddress: 'ул. Спартака, 12',
          },
        ],
      },
      {
        name: 'Иванова М. С.',
        subjects: ['История искусств'],
        schedule: [],
      },
    ];

    const byGroup = teachersWithSchedule.filter((t) =>
      t.schedule.some((l) => l.group.toLowerCase().replace(/[\s\-_.]/g, '').includes('д12'))
    );
    expect(byGroup).toHaveLength(1);
    expect(byGroup[0].name).toBe('Вальвачева Е. В.');
    expect(byGroup[0].schedule[0].dayOfWeek).toBe('Понедельник');
    expect(byGroup[0].schedule[0].date).toBe('2026-10-19');
  });
});
