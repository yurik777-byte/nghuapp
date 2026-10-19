import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getStaticGroups,
  getStaticSchedule,
  getStaticRooms,
  getStaticTeachers,
  getStaticMeta,
  getStaticDays,
  RawParsedSchedule,
} from '../src/api/staticSchedule';

const mockData: RawParsedSchedule = {
  meta: {
    updatedAt: '2026-10-19T10:00:00Z',
    period: '01.10.2026',
    semester: '1 семестр 2026-2027',
  },
  groups: [
    { id: 'Д-11', name: 'Д-11', course: 1, department: 'Дизайн' },
    { id: 'Ж-11', name: 'Ж-11', course: 1, department: 'Живопись' },
  ],
  days: [
    {
      date: '2026-10-19',
      dayOfWeek: 'Понедельник',
      lessons: [
        {
          date: '2026-10-19',
          pairNumber: 1,
          timeStart: '09:00',
          timeEnd: '10:35',
          subject: 'Живопись',
          room: '201',
          building: 'main',
          buildingAddress: 'Красный пр-т, 9',
          teacher: 'Иванов И.И.',
          group: 'Д-11',
        },
      ],
    },
  ],
  lessons: [
    {
      date: '2026-10-19',
      dayOfWeek: 'Понедельник',
      pairNumber: 1,
      timeStart: '09:00',
      timeEnd: '10:35',
      subject: 'Живопись',
      room: '201',
      building: 'main',
      buildingAddress: 'Красный пр-т, 9',
      teacher: 'Иванов И.И.',
      group: 'Д-11',
    },
  ],
};

describe('Static Schedule Queries', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });
  });

  it('getStaticMeta returns metadata correctly', async () => {
    const meta = await getStaticMeta();
    expect(meta.semester).toBe('1 семестр 2026-2027');
    expect(meta.academicYear).toBe('01.10.2026');
  });

  it('getStaticGroups maps departments properly', async () => {
    const groups = await getStaticGroups();
    expect(groups).toHaveLength(2);
    expect(groups[0].department).toBe('design');
    expect(groups[1].department).toBe('painting');
  });

  it('getStaticSchedule filters lessons by group and date', async () => {
    const res = await getStaticSchedule('Д-11', '2026-10-19');
    expect(res.group).toBe('Д-11');
    expect(res.days).toHaveLength(1);
    expect(res.days[0].lessons).toHaveLength(1);
    expect(res.days[0].lessons[0].subject).toBe('Живопись');
  });

  it('getStaticRooms computes room occupancy and scopes schedule to target date', async () => {
    const rooms = await getStaticRooms('main', '2026-10-19', '09:30');
    expect(rooms).toHaveLength(1);
    expect(rooms[0].room).toBe('201');
    expect(rooms[0].status).toBe('occupied');
    expect(rooms[0].currentLesson?.subject).toBe('Живопись');
    expect(rooms[0].schedule).toHaveLength(1);
    expect(rooms[0].schedule[0].date).toBe('2026-10-19');
  });

  it('getStaticDays returns available dates', async () => {
    const days = await getStaticDays();
    expect(days).toHaveLength(1);
    expect(days[0].date).toBe('2026-10-19');
    expect(days[0].dayOfWeek).toBe('Понедельник');
  });

  it('getStaticTeachers aggregates teacher schedule', async () => {
    const teachers = await getStaticTeachers('Иванов');
    expect(teachers).toHaveLength(1);
    expect(teachers[0].name).toBe('Иванов И.И.');
    expect(teachers[0].subjects).toContain('Живопись');
    expect(teachers[0].schedule).toHaveLength(1);
  });
});
