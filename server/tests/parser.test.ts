import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parsePdfBuffer, getDayOfWeekFromDate } from '../src/parser/pdfParser.js';
import { parseTimetablePageHtml, fetchLatestSchedule } from '../src/parser/scraper.js';

describe('PDF Parser & Scraper', () => {
  const samplePdfPath = path.resolve(__dirname, '../../schedule_sample.pdf');
  assert.ok(fs.existsSync(samplePdfPath), `Sample PDF exists at ${samplePdfPath}`);
  const samplePdfBuffer = fs.readFileSync(samplePdfPath);

  describe('parsePdfBuffer', () => {
    it('should parse schedule_sample.pdf into a valid ParsedSchedule', async () => {
      const schedule = await parsePdfBuffer(samplePdfBuffer);

      // Verify meta
      assert.ok(schedule.meta, 'Schedule should have meta');
      assert.ok(schedule.meta.updatedAt, 'Meta should have updatedAt');
      assert.match(schedule.meta.period || '', /04\/05\.09\.2026/);
      assert.match(schedule.meta.sourceFileTitle || '', /04\/05\.09\.2026/);

      // Verify all 24 groups
      const expectedPage1Groups = [
        'Ж-11', 'Ж-12', 'Д-11', 'Д-12', 'Д-13', 'Д-14',
        'Ж-21', 'Ж-22', 'Д-21', 'Д-22', 'Д-23', 'Д-24',
      ];
      const expectedPage2Groups = [
        'Ж-31', 'Ж-32', 'Д-31', 'Д-32', 'Д-33', 'Д-34', 'Т-31',
        'Ж-41', 'Ж-42', 'Д-41', 'Д-42', 'Д-43',
      ];
      const allExpectedGroups = [...expectedPage1Groups, ...expectedPage2Groups];

      assert.strictEqual(schedule.groups.length, 24, 'Must have exactly 24 groups');
      const groupIds = schedule.groups.map((g) => g.id).sort();
      assert.deepStrictEqual(groupIds, [...allExpectedGroups].sort());

      // Verify group courses and departments
      for (const group of schedule.groups) {
        const courseDigit = parseInt(group.id.split('-')[1][0], 10);
        assert.strictEqual(group.course, courseDigit, `Group ${group.id} course`);

        if (group.id.startsWith('Ж-')) {
          assert.strictEqual(group.department, 'Живопись');
        } else if (group.id.startsWith('Д-')) {
          assert.strictEqual(group.department, 'Дизайн');
        } else if (group.id.startsWith('Т-')) {
          assert.strictEqual(group.department, 'Театрально-декорационное искусство');
        }
      }

      // Verify days
      assert.strictEqual(schedule.days.length, 2, 'Should extract 2 days (Пятница, Суббота)');
      const dayNames = schedule.days.map((d) => d.dayOfWeek);
      assert.ok(dayNames.includes('Пятница'), 'Contains Пятница');
      assert.ok(dayNames.includes('Суббота'), 'Contains Суббота');

      const dates = schedule.days.map((d) => d.date);
      assert.ok(dates.includes('2026-09-04'), 'Contains 2026-09-04');
      assert.ok(dates.includes('2026-09-05'), 'Contains 2026-09-05');

      // Verify lessons
      assert.ok(schedule.lessons.length > 100, `Should extract >100 lessons, got ${schedule.lessons.length}`);

      for (const lesson of schedule.lessons) {
        assert.ok(lesson.id, 'Lesson has id');
        assert.ok(allExpectedGroups.includes(lesson.group), `Valid group: ${lesson.group}`);
        assert.ok(lesson.date, 'Lesson has date');
        assert.ok(['Пятница', 'Суббота'].includes(lesson.dayOfWeek), `Valid day: ${lesson.dayOfWeek}`);
        assert.ok(lesson.pairNumber >= 1 && lesson.pairNumber <= 6, `Pair number 1-6: ${lesson.pairNumber}`);
        assert.match(lesson.timeStart, /^\d{2}:\d{2}$/, 'Valid timeStart');
        assert.match(lesson.timeEnd, /^\d{2}:\d{2}$/, 'Valid timeEnd');
        assert.ok(lesson.subject.trim().length > 0, `Non-empty subject in ${lesson.id}`);
        assert.ok(lesson.teacher.trim().length > 0, `Non-empty teacher in ${lesson.id}`);
        assert.ok(lesson.room.trim().length > 0, `Non-empty room in ${lesson.id}`);
        assert.ok(['main', 'spartaka'].includes(lesson.building), `Valid building: ${lesson.building}`);
        assert.ok(
          lesson.buildingAddress === 'Красный пр-т, 9' || lesson.buildingAddress === 'ул. Спартака, 12',
          `Valid building address: ${lesson.buildingAddress}`
        );
      }
    });

    it('should correctly classify Main Campus vs Spartaka Campus', async () => {
      const schedule = await parsePdfBuffer(samplePdfBuffer);

      // Spartaka campus lessons
      const spartakaLessons = schedule.lessons.filter((l) => l.building === 'spartaka');
      assert.ok(spartakaLessons.length > 0, 'Should have Spartaka campus lessons');
      for (const sl of spartakaLessons) {
        assert.strictEqual(sl.buildingAddress, 'ул. Спартака, 12');
        assert.ok(
          ['212', '216', '217'].includes(sl.room),
          `Spartaka room should be 212, 216, or 217, got ${sl.room}`
        );
      }

      // Main campus lessons
      const mainLessons = schedule.lessons.filter((l) => l.building === 'main');
      assert.ok(mainLessons.length > 0, 'Should have Main campus lessons');
      for (const ml of mainLessons) {
        assert.strictEqual(ml.buildingAddress, 'Красный пр-т, 9');
        assert.ok(
          ['109', '111', '108', '203', '204', '205-206', '208', '209', '211а', '211б', '12', '15', '101', '103', '105', '106', '107', '112', '116', '212', 'УМО'].includes(ml.room),
          `Main room should be a valid main room number, got ${ml.room}`
        );
      }
    });

    it('should correctly parse multi-pair double lessons', async () => {
      const schedule = await parsePdfBuffer(samplePdfBuffer);

      // Group Ж-11 on Friday has pairs 1 and 2 for Живопись
      const j11Friday = schedule.lessons.filter(
        (l) => l.group === 'Ж-11' && l.date === '2026-09-04'
      );
      const pair1 = j11Friday.find((l) => l.pairNumber === 1);
      const pair2 = j11Friday.find((l) => l.pairNumber === 2);

      assert.ok(pair1, 'Ж-11 has Pair 1 on Friday');
      assert.ok(pair2, 'Ж-11 has Pair 2 on Friday');
      assert.strictEqual(pair1.subject, 'Живопись');
      assert.strictEqual(pair2.subject, 'Живопись');
      assert.strictEqual(pair1.room, '109');
      assert.strictEqual(pair2.room, '109');
      assert.strictEqual(pair1.teacher, 'Чирва Д.В.');
      assert.strictEqual(pair2.teacher, 'Чирва Д.В.');
    });

    it('should correctly parse Course 3 and Course 4 groups on Page 2', async () => {
      const schedule = await parsePdfBuffer(samplePdfBuffer);

      const t31Lessons = schedule.lessons.filter((l) => l.group === 'Т-31');
      assert.ok(t31Lessons.length > 0, 'Т-31 must have scheduled lessons');

      const d43Lessons = schedule.lessons.filter((l) => l.group === 'Д-43');
      assert.ok(d43Lessons.length > 0, 'Д-43 must have scheduled lessons');
    });
  });

  describe('scraper', () => {
    it('should parse HTML to extract latest timetable link and date string', () => {
      const sampleHtml = `
        <html>
          <body>
            <div class="content">
              <a href="https://nghu.ru/dl/31/расписание-занятий-на-4-5-сентября-2026.pdf">
                Расписание занятий на 4-5 сентября 2026
              </a>
            </div>
          </body>
        </html>
      `;
      const result = parseTimetablePageHtml(sampleHtml);
      assert.ok(result.downloadUrl, 'Should extract downloadUrl');
      assert.strictEqual(
        result.downloadUrl,
        'https://nghu.ru/dl/31/расписание-занятий-на-4-5-сентября-2026.pdf'
      );
      assert.strictEqual(result.title, 'Расписание занятий на 4-5 сентября 2026');
    });

    it('should support WordPress wpfd download URLs', () => {
      const wpfdHtml = `
        <html>
          <body>
            <a href="https://nghu.ru/wp-admin/admin-ajax.php?action=wpfd&task=file.download&wpfd_category_id=31&wpfd_file_id=19096">
              Расписание занятий на 4-5 сентября 2026
            </a>
          </body>
        </html>
      `;
      const result = parseTimetablePageHtml(wpfdHtml);
      assert.ok(result.downloadUrl?.includes('wpfd'), 'Should extract wpfd URL');
      assert.strictEqual(result.title, 'Расписание занятий на 4-5 сентября 2026');
    });

    it('should support fetchLatestSchedule with local fallback (isolated from network)', async () => {
      const schedule = await fetchLatestSchedule({
        timetablePageUrl: 'http://127.0.0.1:59999',
        fallbackPdfPath: samplePdfPath,
        timeoutMs: 500,
      });
      assert.ok(schedule.groups.length === 24, 'Fallback schedule returns 24 groups');
      assert.ok(schedule.lessons.length > 100, 'Fallback schedule returns lessons');
    });

    it('should dynamically calculate day of week from date', () => {
      assert.strictEqual(getDayOfWeekFromDate('2026-09-04'), 'Пятница');
      assert.strictEqual(getDayOfWeekFromDate('2026-09-05'), 'Суббота');
      assert.strictEqual(getDayOfWeekFromDate('2026-09-01'), 'Вторник');
      assert.strictEqual(getDayOfWeekFromDate('2026-10-01'), 'Четверг');
    });
  });
});
