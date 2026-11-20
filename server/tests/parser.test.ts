import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  parsePdfBuffer,
  getDayOfWeekFromDate,
  validateScheduleIntegrity,
} from '../src/parser/pdfParser.js';
import { parseTimetablePageHtml, parseWpfdJsonResponse, fetchLatestSchedule } from '../src/parser/scraper.js';

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

    it('should extract exact 3h and 5h sub-row time frames across PDFs', async () => {
      const sample = await parsePdfBuffer(samplePdfBuffer);
      const j11Fri = sample.lessons.filter(
        (l) => l.group === 'Ж-11' && l.date === '2026-09-04'
      );
      assert.strictEqual(j11Fri.find((l) => l.pairNumber === 1)?.timeStart, '09:50');
      assert.strictEqual(j11Fri.find((l) => l.pairNumber === 1)?.timeEnd, '10:35');
      assert.strictEqual(j11Fri.find((l) => l.pairNumber === 2)?.timeStart, '10:40');
      assert.strictEqual(j11Fri.find((l) => l.pairNumber === 2)?.timeEnd, '12:15');

      const nov16Path = path.resolve(__dirname, '../../schedule_16nov.pdf');
      const nov16 = await parsePdfBuffer(fs.readFileSync(nov16Path));

      const d11Fri = nov16.lessons.filter(
        (l) => l.group === 'Д-11' && l.date === '2026-11-20'
      );
      assert.strictEqual(d11Fri.find((l) => l.pairNumber === 4)?.timeStart, '14:40');
      assert.strictEqual(d11Fri.find((l) => l.pairNumber === 4)?.timeEnd, '16:15');
      assert.strictEqual(d11Fri.find((l) => l.pairNumber === 5)?.timeStart, '16:20');
      assert.strictEqual(d11Fri.find((l) => l.pairNumber === 5)?.timeEnd, '17:05');

      const d23Mon = nov16.lessons.filter(
        (l) => l.group === 'Д-23' && l.date === '2026-11-16'
      );
      assert.strictEqual(d23Mon.find((l) => l.pairNumber === 3)?.timeStart, '13:00');
      assert.strictEqual(d23Mon.find((l) => l.pairNumber === 3)?.timeEnd, '14:35');
      assert.strictEqual(d23Mon.find((l) => l.pairNumber === 4)?.timeStart, '14:40');
      assert.strictEqual(d23Mon.find((l) => l.pairNumber === 4)?.timeEnd, '15:25');

      const d42Sat = nov16.lessons.filter(
        (l) => l.group === 'Д-42' && l.date === '2026-11-21'
      );
      assert.strictEqual(d42Sat.find((l) => l.pairNumber === 3)?.timeStart, '13:00');
      assert.strictEqual(d42Sat.find((l) => l.pairNumber === 3)?.timeEnd, '14:35');
      assert.strictEqual(d42Sat.find((l) => l.pairNumber === 4)?.timeStart, '14:40');
      assert.strictEqual(d42Sat.find((l) => l.pairNumber === 4)?.timeEnd, '16:15');
      assert.strictEqual(d42Sat.find((l) => l.pairNumber === 5)?.timeStart, '16:20');
      assert.strictEqual(d42Sat.find((l) => l.pairNumber === 5)?.timeEnd, '17:05');
    });

    it('should distinguish room 212 between Main and Spartaka by yellow shading / text', async () => {
      const nov16Path = path.resolve(__dirname, '../../schedule_16nov.pdf');
      const nov16 = await parsePdfBuffer(fs.readFileSync(nov16Path));

      const d23MonP2 = nov16.lessons.find(
        (l) => l.group === 'Д-23' && l.date === '2026-11-16' && l.pairNumber === 2
      );
      assert.ok(d23MonP2);
      assert.strictEqual(d23MonP2.subject, 'Пластическая анатомия');
      assert.strictEqual(d23MonP2.room, '212');
      assert.strictEqual(d23MonP2.building, 'main');

      const d34ThuP3 = nov16.lessons.find(
        (l) => l.group === 'Д-34' && l.date === '2026-11-19' && l.pairNumber === 3
      );
      assert.ok(d34ThuP3);
      assert.strictEqual(d34ThuP3.subject, 'Рисунок');
      assert.strictEqual(d34ThuP3.room, '212');
      assert.strictEqual(d34ThuP3.building, 'main');

      const d34ThuP5 = nov16.lessons.find(
        (l) => l.group === 'Д-34' && l.date === '2026-11-19' && l.pairNumber === 5
      );
      assert.ok(d34ThuP5);
      assert.strictEqual(d34ThuP5.subject, 'БЖД');
      assert.strictEqual(d34ThuP5.room, '212');
      assert.strictEqual(d34ThuP5.building, 'spartaka');
    });

    it('should parse multi-column stream lectures cleanly without bleeding across columns', async () => {
      const nov16Path = path.resolve(__dirname, '../../schedule_16nov.pdf');
      const nov16 = await parsePdfBuffer(fs.readFileSync(nov16Path));

      for (const g of ['Д-31', 'Д-32', 'Д-33', 'Д-34']) {
        const bzd = nov16.lessons.find(
          (l) => l.group === g && l.date === '2026-11-19' && l.pairNumber === 5
        );
        assert.ok(bzd, `${g} Thu Pair 5 BZhD exists`);
        assert.strictEqual(bzd.subject, 'БЖД');
        assert.strictEqual(bzd.teacher, 'Коробейников А.С.');
        assert.strictEqual(bzd.room, '212');
        assert.strictEqual(bzd.building, 'spartaka');
      }

      for (const g of ['Ж-41', 'Ж-42']) {
        for (const p of [1, 2]) {
          const psych = nov16.lessons.find(
            (l) => l.group === g && l.date === '2026-11-21' && l.pairNumber === p
          );
          assert.ok(psych, `${g} Sat Pair ${p} Psychology exists`);
          assert.strictEqual(psych.subject, 'Психология общения');
          assert.strictEqual(psych.teacher, 'Литвиненко О.В.');
          assert.strictEqual(psych.room, '212');
          assert.strictEqual(psych.building, 'spartaka');
        }
      }

      // ОБЗР for Д-13/Д-14 on Thursday Pair 3 must NOT bleed into Ж-21/Ж-22
      const j21ThuP3 = nov16.lessons.find(
        (l) => l.group === 'Ж-21' && l.date === '2026-11-19' && l.pairNumber === 3
      );
      assert.strictEqual(j21ThuP3?.subject, 'Композиция');
      assert.strictEqual(j21ThuP3?.room, '107');
      assert.strictEqual(j21ThuP3?.teacher, 'Чирва Д.В.');

      const j22ThuP3 = nov16.lessons.find(
        (l) => l.group === 'Ж-22' && l.date === '2026-11-19' && l.pairNumber === 3
      );
      assert.strictEqual(j22ThuP3?.subject, 'Живопись');
      assert.strictEqual(j22ThuP3?.room, '109');
      assert.strictEqual(j22ThuP3?.teacher, 'Самойлова В.П.');

      // Ж-12 Sat Pair 2 teacher overflowing onto white break row must be captured with end time 12:15
      const j12SatP2 = nov16.lessons.find(
        (l) => l.group === 'Ж-12' && l.date === '2026-11-21' && l.pairNumber === 2
      );
      assert.ok(j12SatP2);
      assert.strictEqual(j12SatP2.subject, 'Живопись');
      assert.strictEqual(j12SatP2.teacher, 'Вальвачева Е.В.');
      assert.strictEqual(j12SatP2.timeEnd, '12:15');
    });

    it('should handle mid-week effective dates, practice banners, and clean typos across all historical PDFs', async () => {
      const oct01 = await parsePdfBuffer(
        fs.readFileSync(path.resolve(__dirname, '../../schedule_01oct.pdf'))
      );
      assert.strictEqual(oct01.meta.isRecurring, true);
      assert.strictEqual(oct01.meta.effectiveFrom, '2026-10-01');
      assert.strictEqual(oct01.days.length, 6);
      for (const day of oct01.days) {
        assert.ok(day.date >= '2026-10-01', `Date ${day.date} >= 2026-10-01`);
        assert.strictEqual(getDayOfWeekFromDate(day.date), day.dayOfWeek);
      }
      for (const g of ['Ж-41', 'Ж-42', 'Д-41', 'Д-42', 'Д-43']) {
        const pr = oct01.lessons.find((l) => l.group === g);
        assert.ok(pr, `Practice banner detected for ${g} in schedule_01oct.pdf`);
        assert.match(pr.subject, /практик/i);
      }

      const oct26 = await parsePdfBuffer(
        fs.readFileSync(path.resolve(__dirname, '../../schedule_26oct.pdf'))
      );
      const t31Pr = oct26.lessons.find((l) => l.group === 'Т-31');
      assert.ok(t31Pr, 'Practice banner detected for Т-31 in schedule_26oct.pdf');
      assert.match(t31Pr.subject, /практик/i);

      const nov02 = await parsePdfBuffer(
        fs.readFileSync(path.resolve(__dirname, '../../schedule_02nov.pdf'))
      );
      const nov16 = await parsePdfBuffer(
        fs.readFileSync(path.resolve(__dirname, '../../schedule_16nov.pdf'))
      );

      for (const sched of [oct01, oct26, nov02, nov16]) {
        for (const l of sched.lessons) {
          assert.ok(l.subject.trim().length > 0, `Non-empty subject for ${l.id}`);
          assert.ok(!/\+[A-Z]+\d+:/.test(l.subject), `No Excel range typo in ${l.subject}`);
          const isPE = /физкультура/i.test(l.subject);
          const isPr = /практик/i.test(l.subject);
          if (!isPr) {
            assert.ok(l.room.trim().length > 0, `Non-empty room for ${l.id}`);
          }
          if (!isPE && !isPr) {
            assert.ok(l.teacher.trim().length > 0, `Non-empty teacher for ${l.id}`);
            assert.ok(!/Худ\.|Вирт\./i.test(l.teacher), `No false teacher match: ${l.teacher}`);
          }
        }
      }
    });

    it('should pass validateScheduleIntegrity across all 5 historical PDFs', async () => {
      const files = [
        'schedule_sample.pdf',
        'schedule_01oct.pdf',
        'schedule_26oct.pdf',
        'schedule_02nov.pdf',
        'schedule_16nov.pdf',
      ];
      for (const file of files) {
        const buf = fs.readFileSync(path.resolve(__dirname, `../../${file}`));
        const sched = await parsePdfBuffer(buf);
        const report = validateScheduleIntegrity(sched);
        assert.strictEqual(report.isValid, true, `${file} failed integrity: ${report.warnings.join('; ')}`);
        assert.strictEqual(report.incompleteLessonCount, 0, `${file} incomplete lessons`);
        assert.strictEqual(report.typoCount, 0, `${file} typos`);
        assert.strictEqual(report.warnings.length, 0, `${file} warnings`);
      }
    });

    it('should auto-learn mutated color palettes (gray gridlines, blue empty cells, orange Spartaka)', async () => {
      const nov16Buf = fs.readFileSync(path.resolve(__dirname, '../../schedule_16nov.pdf'));
      const standard = await parsePdfBuffer(nov16Buf);
      const mutated = await parsePdfBuffer(nov16Buf, undefined, undefined, {
        mutateColors: {
          '#000000': '#595959',
          '#d9d9d9': '#c5d9f1',
          '#ffff00': '#f4b084',
        },
      });

      assert.strictEqual(mutated.lessons.length, 528);
      assert.deepStrictEqual(mutated.lessons, standard.lessons);
    });

    it('should semantically reconstruct lessons when vector borders and colors are completely absent', async () => {
      const nov16Buf = fs.readFileSync(path.resolve(__dirname, '../../schedule_16nov.pdf'));
      const borderless = await parsePdfBuffer(nov16Buf, undefined, undefined, {
        ignoreVectorBorders: true,
      });

      const report = validateScheduleIntegrity(borderless);
      assert.strictEqual(report.isValid, true, `Borderless failed: ${report.warnings.join('; ')}`);
      assert.strictEqual(report.incompleteLessonCount, 0);
      assert.strictEqual(borderless.lessons.length, 528);

      // Stream lecture propagation for Д-31..Д-34 Thursday Pair 5 БЖД
      for (const g of ['Д-31', 'Д-32', 'Д-33', 'Д-34']) {
        const bzd = borderless.lessons.find(
          (l) => l.group === g && l.date === '2026-11-19' && l.pairNumber === 5
        );
        assert.ok(bzd, `${g} Thu Pair 5 BZhD exists in borderless mode`);
        assert.strictEqual(bzd.subject, 'БЖД');
        assert.strictEqual(bzd.room, '212');
        assert.strictEqual(bzd.teacher, 'Коробейников А.С.');
        assert.strictEqual(bzd.building, 'spartaka');
      }

      // Semantic splitting of Ж-11 Thursday morning (Литература + ОБЗР)
      const j11ThuP1 = borderless.lessons.find(
        (l) => l.group === 'Ж-11' && l.date === '2026-11-19' && l.pairNumber === 1
      );
      const j11ThuP2 = borderless.lessons.find(
        (l) => l.group === 'Ж-11' && l.date === '2026-11-19' && l.pairNumber === 2
      );
      assert.strictEqual(j11ThuP1?.subject, 'Литература');
      assert.strictEqual(j11ThuP1?.timeStart, '09:00');
      assert.strictEqual(j11ThuP1?.timeEnd, '10:35');
      assert.strictEqual(j11ThuP2?.subject, 'ОБЗР');
      assert.strictEqual(j11ThuP2?.timeStart, '10:40');
      assert.strictEqual(j11ThuP2?.timeEnd, '12:15');

      // 3-hour studio blocks (Д-13 Tue 09:50-12:15, Д-23 Mon 13:00-15:25)
      const d13Tue = borderless.lessons.filter(
        (l) => l.group === 'Д-13' && l.date === '2026-11-17'
      );
      assert.strictEqual(d13Tue.find((l) => l.pairNumber === 1)?.subject, 'Живопись');
      assert.strictEqual(d13Tue.find((l) => l.pairNumber === 1)?.timeStart, '09:50');
      assert.strictEqual(d13Tue.find((l) => l.pairNumber === 2)?.timeEnd, '12:15');

      const d23Mon = borderless.lessons.filter(
        (l) => l.group === 'Д-23' && l.date === '2026-11-16'
      );
      assert.strictEqual(d23Mon.find((l) => l.pairNumber === 3)?.subject, 'Рисунок');
      assert.strictEqual(d23Mon.find((l) => l.pairNumber === 3)?.timeStart, '13:00');
      assert.strictEqual(d23Mon.find((l) => l.pairNumber === 4)?.timeEnd, '15:25');

      // 5-hour studio block (Д-42 Sat 13:00-17:05)
      const d42Sat = borderless.lessons.filter(
        (l) => l.group === 'Д-42' && l.date === '2026-11-21'
      );
      assert.strictEqual(d42Sat.find((l) => l.pairNumber === 3)?.subject, 'Рисунок');
      assert.strictEqual(d42Sat.find((l) => l.pairNumber === 3)?.timeStart, '13:00');
      assert.strictEqual(d42Sat.find((l) => l.pairNumber === 5)?.timeEnd, '17:05');
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

    it('should parse WP File Download JSON API response and pick latest PDF file', () => {
      const sampleApiResponse = {
        files: [
          {
            ID: 17517,
            post_title: 'Расписание занятий на 10-12 сентября 2026',
            ext: 'pdf',
            openpdflink: 'https://nghu.ru/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=file.download&wpfd_category_id=31&wpfd_file_id=17517&token=&preview=1',
          },
          {
            ID: 19149,
            post_title: 'Расписание занятий на 14 сентября 2026',
            ext: 'pdf',
            openpdflink: 'https://nghu.ru/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=file.download&wpfd_category_id=31&wpfd_file_id=19149&token=&preview=1',
          },
          {
            ID: 19150,
            post_title: 'Некоторый документ Word',
            ext: 'docx',
            openpdflink: 'https://nghu.ru/dl/31/doc.docx',
          },
        ],
      };

      const result = parseWpfdJsonResponse(sampleApiResponse);
      assert.ok(result.downloadUrl, 'Should extract downloadUrl');
      assert.strictEqual(
        result.downloadUrl,
        'https://nghu.ru/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=file.download&wpfd_category_id=31&wpfd_file_id=19149&token=&preview=1'
      );
      assert.strictEqual(result.title, 'Расписание занятий на 14 сентября 2026');
    });

    it('should return nulls if WP File Download JSON API has no PDF files', () => {
      const sampleApiResponse = {
        files: [
          {
            ID: 123,
            post_title: 'Некоторый документ Word',
            ext: 'docx',
          },
        ],
      };
      const result = parseWpfdJsonResponse(sampleApiResponse);
      assert.strictEqual(result.downloadUrl, null);
      assert.strictEqual(result.title, null);
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

    it('should handle May genitive and cross-year sorting in WPFD JSON and HTML scraper', () => {
      const mayCrossYear = parseWpfdJsonResponse({
        files: [
          {
            ID: 1,
            post_title: 'Расписание занятий с 21 декабря 2026',
            ext: 'pdf',
            openpdflink: 'https://nghu.ru/dec.pdf',
          },
          {
            ID: 2,
            post_title: 'Расписание занятий с 11 января 2027',
            ext: 'pdf',
            openpdflink: 'https://nghu.ru/jan.pdf',
          },
          {
            ID: 3,
            post_title: 'Расписание занятий с 11 мая 2027',
            ext: 'pdf',
            openpdflink: 'https://nghu.ru/may.pdf',
          },
        ],
      });
      assert.strictEqual(mayCrossYear.title, 'Расписание занятий с 11 мая 2027');
      assert.strictEqual(mayCrossYear.downloadUrl, 'https://nghu.ru/may.pdf');

      const janBeatsDec = parseWpfdJsonResponse({
        files: [
          {
            ID: 10,
            post_title: 'Расписание занятий с 21 декабря 2026',
            ext: 'pdf',
            openpdflink: 'https://nghu.ru/dec.pdf',
          },
          {
            ID: 11,
            post_title: 'Расписание занятий с 11 января 2027',
            ext: 'pdf',
            openpdflink: 'https://nghu.ru/jan.pdf',
          },
        ],
      });
      assert.strictEqual(janBeatsDec.title, 'Расписание занятий с 11 января 2027');

      const multiLinkHtml = `
        <html><body>
          <a href="https://nghu.ru/dl/31/old.pdf">Расписание занятий с 21 декабря 2026</a>
          <a href="https://nghu.ru/dl/31/new.pdf">Расписание занятий с 11 января 2027</a>
        </body></html>
      `;
      const htmlRes = parseTimetablePageHtml(multiLinkHtml);
      assert.strictEqual(htmlRes.downloadUrl, 'https://nghu.ru/dl/31/new.pdf');
      assert.strictEqual(htmlRes.title, 'Расписание занятий с 11 января 2027');
    });
  });
});
