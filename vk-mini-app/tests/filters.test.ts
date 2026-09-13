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

  const teachers: TeacherItem[] = [
    {
      name: 'Кузнецов А. В.',
      subjects: ['Живопись', 'Рисунок'],
      schedule: [],
    },
    {
      name: 'Иванова М. С.',
      subjects: ['История искусств'],
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

  it('filters teachers by name and by subject', () => {
    const byName = teachers.filter((t) => t.name.toLowerCase().includes('кузнецов'));
    expect(byName).toHaveLength(1);

    const bySubject = teachers.filter((t) => t.subjects.some((s) => s.toLowerCase().includes('история')));
    expect(bySubject).toHaveLength(1);
    expect(bySubject[0].name).toBe('Иванова М. С.');
  });
});
