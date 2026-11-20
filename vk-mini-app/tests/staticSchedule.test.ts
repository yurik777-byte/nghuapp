import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getStaticGroups,
  getStaticSchedule,
  getStaticRooms,
  getStaticTeachers,
  getStaticMeta,
  getStaticDays,
  projectRecurringSchedule,
  resetStaticScheduleCache,
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
    resetStaticScheduleCache();
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

  it('projects recurring weekly schedules onto current and next weeks', async () => {
    const templateWeekDays = [
      { date: '2026-11-16', dayOfWeek: 'Понедельник' },
      { date: '2026-11-17', dayOfWeek: 'Вторник' },
      { date: '2026-11-18', dayOfWeek: 'Среда' },
      { date: '2026-11-19', dayOfWeek: 'Четверг' },
      { date: '2026-11-20', dayOfWeek: 'Пятница' },
      { date: '2026-11-21', dayOfWeek: 'Суббота' },
    ];

    const recurringSchedule: RawParsedSchedule = {
      meta: {
        updatedAt: '2026-11-15T10:00:00Z',
        sourceFileTitle: 'Расписание занятий с 16.11.2026г.',
        period: '16.11.2026',
        semester: '1 семестр 2026-2027',
        effectiveFrom: '2026-11-16',
        isRecurring: true,
      },
      groups: [{ id: 'Д-11', name: 'Д-11', course: 1, department: 'Дизайн' }],
      days: templateWeekDays.map((d) => ({
        date: d.date,
        dayOfWeek: d.dayOfWeek,
        lessons: [
          {
            id: `Д-11_${d.date}_1_108`,
            date: d.date,
            dayOfWeek: d.dayOfWeek,
            pairNumber: 1,
            timeStart: '09:00',
            timeEnd: '10:35',
            subject: 'Рисунок',
            room: '108',
            building: 'main',
            buildingAddress: 'Красный пр-т, 9',
            teacher: 'Сухоруков К.М.',
            group: 'Д-11',
          },
        ],
      })),
      lessons: templateWeekDays.map((d) => ({
        id: `Д-11_${d.date}_1_108`,
        date: d.date,
        dayOfWeek: d.dayOfWeek,
        pairNumber: 1,
        timeStart: '09:00',
        timeEnd: '10:35',
        subject: 'Рисунок',
        room: '108',
        building: 'main',
        buildingAddress: 'Красный пр-т, 9',
        teacher: 'Сухоруков К.М.',
        group: 'Д-11',
      })),
    };

    // 1. Friday 2026-11-20 -> 12 days (16..21 Nov + 23..28 Nov)
    const friProj = projectRecurringSchedule(recurringSchedule, {
      now: new Date(2026, 10, 20, 12, 0),
      weeks: 2,
    });
    expect(friProj.days).toHaveLength(12);
    expect(friProj.days[0].date).toBe('2026-11-16');
    expect(friProj.days[6].date).toBe('2026-11-23');
    expect(friProj.days[11].date).toBe('2026-11-28');
    expect(friProj.days[6].dayOfWeek).toBe('Понедельник');
    expect(friProj.days[6].lessons[0].id).toBe('Д-11_2026-11-23_1_108');

    // 2. Sunday 2026-11-22 -> rolls forward to 23..28 Nov + 30 Nov..5 Dec
    const sunProj = projectRecurringSchedule(recurringSchedule, {
      now: new Date(2026, 10, 22, 12, 0),
      weeks: 2,
    });
    expect(sunProj.days).toHaveLength(12);
    expect(sunProj.days[0].date).toBe('2026-11-23');
    expect(sunProj.days[5].date).toBe('2026-11-28');
    expect(sunProj.days[6].date).toBe('2026-11-30');
    expect(sunProj.days[11].date).toBe('2026-12-05');

    // 3. Next-week Wednesday 2026-11-25 -> 23..28 Nov + 30 Nov..5 Dec
    const wedProj = projectRecurringSchedule(recurringSchedule, {
      now: new Date(2026, 10, 25, 12, 0),
      weeks: 2,
    });
    expect(wedProj.days).toHaveLength(12);
    expect(wedProj.days[0].date).toBe('2026-11-23');
    expect(wedProj.days[11].date).toBe('2026-12-05');

    // 4. Future effectiveFrom (Fri 2026-11-13 with с 16.11.2026) starts at 2026-11-16
    const futureProj = projectRecurringSchedule(recurringSchedule, {
      now: new Date(2026, 10, 13, 12, 0),
      weeks: 2,
    });
    expect(futureProj.days).toHaveLength(12);
    expect(futureProj.days[0].date).toBe('2026-11-16');
    expect(futureProj.days[11].date).toBe('2026-11-28');

    // 5. Mid-week effectiveFrom (Thu 2026-10-01) excludes 2026-09-28..30
    const octTemplateDays = [
      { date: '2026-10-01', dayOfWeek: 'Четверг' },
      { date: '2026-10-02', dayOfWeek: 'Пятница' },
      { date: '2026-10-03', dayOfWeek: 'Суббота' },
      { date: '2026-10-05', dayOfWeek: 'Понедельник' },
      { date: '2026-10-06', dayOfWeek: 'Вторник' },
      { date: '2026-10-07', dayOfWeek: 'Среда' },
    ];
    const octRecurring: RawParsedSchedule = {
      ...recurringSchedule,
      meta: {
        updatedAt: '2026-10-01T10:00:00Z',
        sourceFileTitle: 'Расписание занятий с 01.10.2026г.',
        effectiveFrom: '2026-10-01',
        isRecurring: true,
      },
      days: octTemplateDays.map((d) => ({
        date: d.date,
        dayOfWeek: d.dayOfWeek,
        lessons: [
          {
            id: `Д-11_${d.date}_1_108`,
            date: d.date,
            dayOfWeek: d.dayOfWeek,
            pairNumber: 1,
            timeStart: '09:00',
            timeEnd: '10:35',
            subject: 'Рисунок',
            room: '108',
            building: 'main',
            buildingAddress: 'Красный пр-т, 9',
            teacher: 'Сухоруков К.М.',
            group: 'Д-11',
          },
        ],
      })),
    };
    const octProj = projectRecurringSchedule(octRecurring, {
      now: new Date(2026, 9, 1, 12, 0),
      weeks: 2,
    });
    expect(octProj.days.map((d) => d.date)).toEqual([
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
    ]);

    // 6. getStaticDays, getStaticSchedule, and getStaticTeachers (1 active week -> no duplicates)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => recurringSchedule,
    });
    const daysOut = await getStaticDays(new Date(2026, 10, 20, 12, 0));
    expect(daysOut).toHaveLength(12);
    expect(daysOut[6].date).toBe('2026-11-23');

    const schedOut = await getStaticSchedule('Д-11', undefined, new Date(2026, 10, 20, 12, 0));
    expect(schedOut.days).toHaveLength(12);
    expect(schedOut.days[11].date).toBe('2026-11-28');

    const teachersOut = await getStaticTeachers('Сухоруков', new Date(2026, 10, 20, 12, 0));
    expect(teachersOut).toHaveLength(1);
    expect(teachersOut[0].schedule).toHaveLength(6);

    // 7. Fixed-date schedule (isRecurring: false) is NOT projected
    const fixedSchedule: RawParsedSchedule = {
      ...recurringSchedule,
      meta: {
        updatedAt: '2026-09-04T10:00:00Z',
        sourceFileTitle: 'Расписание занятий на 04/05.09.2026 г.',
        effectiveFrom: '2026-09-04',
        isRecurring: false,
      },
      days: recurringSchedule.days.slice(0, 2),
      lessons: recurringSchedule.lessons.slice(0, 2),
    };
    const fixedProj = projectRecurringSchedule(fixedSchedule, {
      now: new Date(2026, 10, 20, 12, 0),
      weeks: 2,
    });
    expect(fixedProj).toBe(fixedSchedule);
    expect(fixedProj.days).toHaveLength(2);
  });
});
