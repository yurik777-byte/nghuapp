import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { app } from '../src/index.js';
import { scheduleService } from '../src/services/scheduleService.js';

describe('REST API Server & Data Aggregators', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    // Ensure scheduleService uses local sample fallback during tests
    const samplePdfPath = path.resolve(__dirname, '../../schedule_sample.pdf');
    scheduleService.setFallbackPdfPath(samplePdfPath);
    await scheduleService.init();

    // Start ephemeral HTTP server
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });
    const address = server.address() as { port: number; address: string };
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  describe('GET /api/meta', () => {
    it('should return timetable metadata', async () => {
      const res = await fetch(`${baseUrl}/api/meta`);
      assert.strictEqual(res.status, 200);

      const data = (await res.json()) as any;
      assert.ok(data.updatedAt, 'Metadata has updatedAt');
      assert.ok(data.semester !== undefined, 'Metadata has semester');
      assert.match(data.title || data.sourceFileTitle || '', /04\/05\.09\.2026/);
    });
  });

  describe('GET /api/schedule', () => {
    it('should return full schedule with meta and days', async () => {
      const res = await fetch(`${baseUrl}/api/schedule`);
      assert.strictEqual(res.status, 200);

      const data = (await res.json()) as any;
      assert.ok(data.meta, 'Payload has meta');
      assert.ok(Array.isArray(data.days), 'Payload has days array');
      assert.strictEqual(data.days.length, 2, 'Has 2 days');
    });

    it('should filter schedule by group query parameter', async () => {
      const res = await fetch(`${baseUrl}/api/schedule?group=Д-11`);
      assert.strictEqual(res.status, 200);

      const data = (await res.json()) as any;
      assert.ok(Array.isArray(data.days));
      for (const day of data.days) {
        for (const lesson of day.lessons) {
          assert.strictEqual(lesson.group, 'Д-11');
        }
      }
    });

    it('should filter schedule by date query parameter', async () => {
      const res = await fetch(`${baseUrl}/api/schedule?date=2026-09-04`);
      assert.strictEqual(res.status, 200);

      const data = (await res.json()) as any;
      assert.strictEqual(data.days.length, 1);
      assert.strictEqual(data.days[0].date, '2026-09-04');
    });

    it('should filter schedule by both group and date', async () => {
      const res = await fetch(`${baseUrl}/api/schedule?group=Ж-11&date=2026-09-04`);
      assert.strictEqual(res.status, 200);

      const data = (await res.json()) as any;
      assert.strictEqual(data.days.length, 1);
      assert.strictEqual(data.days[0].date, '2026-09-04');
      for (const lesson of data.days[0].lessons) {
        assert.strictEqual(lesson.group, 'Ж-11');
      }
    });

    it('should return 400 for invalid date format', async () => {
      const res = await fetch(`${baseUrl}/api/schedule?date=invalid-date`);
      assert.strictEqual(res.status, 400);

      const data = (await res.json()) as any;
      assert.ok(data.error);
    });
  });

  describe('GET /api/groups', () => {
    it('should return list of all 24 groups with course and department', async () => {
      const res = await fetch(`${baseUrl}/api/groups`);
      assert.strictEqual(res.status, 200);

      const groups = (await res.json()) as any[];
      assert.strictEqual(groups.length, 24);

      const j11 = groups.find((g) => g.id === 'Ж-11');
      assert.ok(j11);
      assert.strictEqual(j11.course, 1);
      assert.strictEqual(j11.department, 'Живопись');

      const d31 = groups.find((g) => g.id === 'Д-31');
      assert.ok(d31);
      assert.strictEqual(d31.course, 3);
      assert.strictEqual(d31.department, 'Дизайн');

      const t31 = groups.find((g) => g.id === 'Т-31');
      assert.ok(t31);
      assert.strictEqual(t31.course, 3);
      assert.strictEqual(t31.department, 'Театрально-декорационное искусство');
    });
  });

  describe('GET /api/rooms', () => {
    it('should return list of all aggregated rooms', async () => {
      const res = await fetch(`${baseUrl}/api/rooms`);
      assert.strictEqual(res.status, 200);

      const rooms = (await res.json()) as any[];
      assert.ok(rooms.length > 10, 'Should aggregate multiple classrooms');

      const room109 = rooms.find((r) => r.room === '109');
      assert.ok(room109, 'Contains room 109');
      assert.strictEqual(room109.building, 'main');
      assert.strictEqual(room109.buildingAddress, 'Красный пр-т, 9');
      assert.ok(Array.isArray(room109.daySchedule));
      assert.ok(room109.daySchedule.length > 0);
    });

    it('should filter rooms by building=main', async () => {
      const res = await fetch(`${baseUrl}/api/rooms?building=main`);
      assert.strictEqual(res.status, 200);

      const rooms = (await res.json()) as any[];
      assert.ok(rooms.length > 0);
      for (const r of rooms) {
        assert.strictEqual(r.building, 'main');
        assert.strictEqual(r.buildingAddress, 'Красный пр-т, 9');
      }
    });

    it('should filter rooms by building=spartaka', async () => {
      const res = await fetch(`${baseUrl}/api/rooms?building=spartaka`);
      assert.strictEqual(res.status, 200);

      const rooms = (await res.json()) as any[];
      assert.ok(rooms.length > 0);
      for (const r of rooms) {
        assert.strictEqual(r.building, 'spartaka');
        assert.strictEqual(r.buildingAddress, 'ул. Спартака, 12');
      }
    });

    it('should return 400 for invalid building query', async () => {
      const res = await fetch(`${baseUrl}/api/rooms?building=unknown`);
      assert.strictEqual(res.status, 400);

      const data = (await res.json()) as any;
      assert.ok(data.error);
    });

    it('should compute occupancy status for given date and time', async () => {
      // On 2026-09-04 at 09:30 (Pair 1: 09:00 - 10:35), Room 109 has Ж-11 Живопись
      const res = await fetch(`${baseUrl}/api/rooms?date=2026-09-04&time=09:30`);
      assert.strictEqual(res.status, 200);

      const rooms = (await res.json()) as any[];
      const room109 = rooms.find((r) => r.room === '109');
      assert.ok(room109);
      assert.strictEqual(room109.isOccupied, true);
      assert.ok(room109.currentLesson);
      assert.strictEqual(room109.currentLesson.subject, 'Живопись');
      assert.strictEqual(room109.currentLesson.group, 'Ж-11');
      assert.strictEqual(room109.currentLesson.pairNumber, 1);
      assert.ok(room109.nextLesson);
      assert.strictEqual(room109.nextLesson.pairNumber, 2);
    });
  });

  describe('GET /api/teachers', () => {
    it('should return aggregated teachers with subjects and lessons', async () => {
      const res = await fetch(`${baseUrl}/api/teachers`);
      assert.strictEqual(res.status, 200);

      const teachers = (await res.json()) as any[];
      assert.ok(teachers.length > 5, 'Should aggregate multiple teachers');

      const chirvaDv = teachers.find((t) => t.teacher === 'Чирва Д.В.');
      assert.ok(chirvaDv, 'Found Чирва Д.В.');
      assert.ok(Array.isArray(chirvaDv.subjects));
      assert.ok(chirvaDv.subjects.includes('Живопись'));
      assert.ok(Array.isArray(chirvaDv.lessons));
      assert.ok(chirvaDv.lessons.length > 0);

      const chirvaVp = teachers.find((t) => t.teacher === 'Чирва В.П.');
      assert.ok(chirvaVp, 'Found Чирва В.П.');
      assert.ok(chirvaVp.subjects.includes('Рисунок'));
    });

    it('should filter teachers by query parameter', async () => {
      const res = await fetch(`${baseUrl}/api/teachers?name=Чирва Д.В.`);
      assert.strictEqual(res.status, 200);

      const teachers = (await res.json()) as any[];
      assert.strictEqual(teachers.length, 1);
      assert.strictEqual(teachers[0].teacher, 'Чирва Д.В.');
    });

    it('should return multiple teachers if partial query matches', async () => {
      const res = await fetch(`${baseUrl}/api/teachers?name=Чирва`);
      assert.strictEqual(res.status, 200);

      const teachers = (await res.json()) as any[];
      assert.strictEqual(teachers.length, 2);
      assert.ok(teachers.every((t) => t.teacher.includes('Чирва')));
    });
  });

  describe('POST /api/refresh', () => {
    it('should refresh timetable and return success with updated meta', async () => {
      const res = await fetch(`${baseUrl}/api/refresh`, { method: 'POST' });
      assert.strictEqual(res.status, 200);

      const data = (await res.json()) as any;
      assert.strictEqual(data.success, true);
      assert.ok(data.meta);
      assert.ok(data.meta.updatedAt);
    });
  });

  describe('Error handling', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await fetch(`${baseUrl}/api/unknown-endpoint`);
      assert.strictEqual(res.status, 404);

      const data = (await res.json()) as any;
      assert.ok(data.error);
    });
  });
});
