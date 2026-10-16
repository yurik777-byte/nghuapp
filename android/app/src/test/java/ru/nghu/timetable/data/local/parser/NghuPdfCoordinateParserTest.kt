package ru.nghu.timetable.data.local.parser

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import ru.nghu.timetable.domain.model.BuildingType
import java.time.DayOfWeek
import java.time.LocalDate

class NghuPdfCoordinateParserTest {

    private val parser = NghuPdfCoordinateParser()

    @Test
    fun testExtractTimetableDatesSingleDate() {
        val items = listOf(
            RawItem(str = "Расписание занятий на 14.09.2026г.", x = 314, y = 549, w = 214, h = 10)
        )
        val dates = parser.extractTimetableDates(items)
        assertEquals(listOf("2026-09-14"), dates)
    }

    @Test
    fun testExtractTimetableDatesMultiDayRange() {
        val items = listOf(
            RawItem(str = "Расписание занятий на 10-12.09.2026 г.", x = 302, y = 549, w = 238, h = 10)
        )
        val dates = parser.extractTimetableDates(items)
        assertEquals(listOf("2026-09-10", "2026-09-11", "2026-09-12"), dates)
    }

    @Test
    fun testExtractTimetableDatesSlashRange() {
        val items = listOf(
            RawItem(str = "Расписание занятий на 04/05.09.2026 г.", x = 302, y = 549, w = 238, h = 10)
        )
        val dates = parser.extractTimetableDates(items)
        assertEquals(listOf("2026-09-04", "2026-09-05"), dates)
    }

    @Test
    fun testParseCellDataSpartakaCampus() {
        val items = listOf(
            RawItem(str = "ПОПТД", x = 450, y = 309, w = 16, h = 6),
            RawItem(str = "Спартака, 12 №212 Литвиненко О.В.", x = 419, y = 302, w = 78, h = 6)
        )
        val cell = parser.parseCellData(items)
        assertEquals("ПОПТД", cell.subject)
        assertEquals("Литвиненко О.В.", cell.teacher)
        assertEquals("212", cell.room)
        assertEquals(BuildingType.SPARTAKA, cell.building)
    }

    @Test
    fun testParseCellDataMainCampus() {
        val items = listOf(
            RawItem(str = "109", x = 429, y = 341, w = 8, h = 6),
            RawItem(str = "Чирва Д.В.", x = 421, y = 335, w = 23, h = 6)
        )
        val cell = parser.parseCellData(items)
        assertEquals("", cell.subject)
        assertEquals("Чирва Д.В.", cell.teacher)
        assertEquals("109", cell.room)
        assertEquals(BuildingType.MAIN, cell.building)
    }

    @Test
    fun testParse3DayScheduleForGroupJ21() {
        val pdfStream = javaClass.classLoader?.getResourceAsStream("schedule_10_12sep.pdf")
        assertNotNull("Resource schedule_10_12sep.pdf should exist", pdfStream)
        val bytes = pdfStream!!.readBytes()

        val lessons = parser.parsePdf(bytes)
        assertTrue("Lessons count should be > 200, got ${lessons.size}", lessons.size > 200)

        val j21Saturday = lessons.filter { it.groupName == "Ж-21" && it.date == "2026-09-12" }
            .sortedBy { it.pairNumber }

        assertEquals(4, j21Saturday.size)

        // Pair 1: Композиция, Чирва Д.В., 109
        assertEquals(1, j21Saturday[0].pairNumber)
        assertEquals("Композиция", j21Saturday[0].subject)
        assertEquals("Чирва Д.В.", j21Saturday[0].teacher)
        assertEquals("109", j21Saturday[0].room)
        assertEquals("main", j21Saturday[0].building)

        // Pair 2: Композиция (double pair continuation)
        assertEquals(2, j21Saturday[1].pairNumber)
        assertEquals("Композиция", j21Saturday[1].subject)
        assertEquals("Чирва Д.В.", j21Saturday[1].teacher)
        assertEquals("109", j21Saturday[1].room)

        // Pair 3: ИМК, Петренко С.Д., 15
        assertEquals(3, j21Saturday[2].pairNumber)
        assertEquals("ИМК", j21Saturday[2].subject)
        assertEquals("Петренко С.Д.", j21Saturday[2].teacher)
        assertEquals("15", j21Saturday[2].room)

        // Pair 4: ПОПТД, Литвиненко О.В., 212 Спартака
        assertEquals(4, j21Saturday[3].pairNumber)
        assertEquals("ПОПТД", j21Saturday[3].subject)
        assertEquals("Литвиненко О.В.", j21Saturday[3].teacher)
        assertEquals("212", j21Saturday[3].room)
        assertEquals("spartaka", j21Saturday[3].building)
    }

    @Test
    fun testParse1DayScheduleForGroupJ21() {
        val pdfStream = javaClass.classLoader?.getResourceAsStream("schedule_14sep.pdf")
        assertNotNull("Resource schedule_14sep.pdf should exist", pdfStream)
        val bytes = pdfStream!!.readBytes()

        val lessons = parser.parsePdf(bytes)
        println("=== 1 DAY LESSONS COUNT: ${lessons.size} ===")
        val j21Monday = lessons.filter { it.groupName == "Ж-21" && it.date == "2026-09-14" }
            .sortedBy { it.pairNumber }

        for (l in j21Monday) {
            println("Ж-21 P${l.pairNumber}: [${l.subject}] teacher=[${l.teacher}] room=[${l.room}] building=[${l.building}]")
        }

        assertTrue("Lessons count should be > 50, got ${lessons.size}", lessons.size > 50)
        assertTrue(j21Monday.isNotEmpty())
        assertEquals(1, j21Monday[0].pairNumber)
        assertEquals("Живопись", j21Monday[0].subject)
        assertEquals("Чирва Д.В.", j21Monday[0].teacher)
        assertEquals("109", j21Monday[0].room)

        assertEquals(2, j21Monday[1].pairNumber)
        assertEquals("Живопись", j21Monday[1].subject)
        assertEquals("Чирва Д.В.", j21Monday[1].teacher)
        assertEquals("109", j21Monday[1].room)
    }

    @Test
    fun testExtractTimetableDatesWrittenMonthRange() {
        val items = listOf(
            RawItem(str = "Расписание занятий на 10-12 сентября 2026 г.", x = 300, y = 549, w = 240, h = 10)
        )
        val dates = parser.extractTimetableDates(items)
        assertEquals(listOf("2026-09-10", "2026-09-11", "2026-09-12"), dates)
    }

    @Test
    fun testExtractTimetableDatesWrittenSingleDate() {
        val items = listOf(
            RawItem(str = "Расписание на 14 сентября 2026", x = 300, y = 549, w = 240, h = 10)
        )
        val dates = parser.extractTimetableDates(items)
        assertEquals(listOf("2026-09-14"), dates)
    }

    @Test
    fun testParseCellDataTeacherWithoutSpace() {
        val items = listOf(
            RawItem(str = "Живопись", x = 420, y = 340, w = 25, h = 6),
            RawItem(str = "108", x = 428, y = 330, w = 10, h = 6),
            RawItem(str = "ДеревягинаМ.С.", x = 415, y = 320, w = 35, h = 6)
        )
        val cell = parser.parseCellData(items)
        assertEquals("Живопись", cell.subject)
        assertEquals("Деревягина М.С.", cell.teacher)
        assertEquals("108", cell.room)
        assertEquals(BuildingType.MAIN, cell.building)
    }

    @Test
    fun testParseCellDataSpartakaAddressVariants() {
        val items = listOf(
            RawItem(str = "Скульптура", x = 420, y = 340, w = 25, h = 6),
            RawItem(str = "ул. Спартака, 12 каб. 217", x = 410, y = 330, w = 50, h = 6),
            RawItem(str = "Николаенко О.Н.", x = 415, y = 320, w = 35, h = 6)
        )
        val cell = parser.parseCellData(items)
        assertEquals("Скульптура", cell.subject)
        assertEquals("Николаенко О.Н.", cell.teacher)
        assertEquals("217", cell.room)
        assertEquals(BuildingType.SPARTAKA, cell.building)
    }

    @Test
    fun testComprehensiveAllPdfsIntegrity() {
        val pdfFiles = listOf("schedule_sample.pdf", "schedule_10_12sep.pdf", "schedule_14sep.pdf")

        for (filename in pdfFiles) {
            val stream = javaClass.classLoader?.getResourceAsStream(filename)
            assertNotNull("Resource $filename must exist", stream)
            val bytes = stream!!.readBytes()
            val lessons = parser.parsePdf(bytes)

            println("=== Integrity check for $filename: ${lessons.size} lessons ===")
            assertTrue("PDF $filename should produce > 50 lessons, got ${lessons.size}", lessons.size > 50)

            val groups = lessons.map { it.groupName }.distinct().sorted()
            println("Groups found in $filename (${groups.size}): $groups")

            // Verify Course 1-2 (Page 1) and Course 3-4 (Page 2) are present
            assertTrue("Should contain Course 1 or 2 groups", groups.any { it.matches(Regex("^[ЖДТ]-[12]\\d$")) })
            assertTrue("Should contain Course 3 or 4 groups", groups.any { it.matches(Regex("^[ЖДТ]-[34]\\d$")) })

            for (l in lessons) {
                if (l.groupName == "Д-11" && l.date == "2026-09-10") {
                    println("Д-11 2026-09-10 P${l.pairNumber}: subject='${l.subject}' teacher='${l.teacher}' room='${l.room}'")
                }
                // Assert valid dates
                assertTrue("Invalid date in lesson: ${l.date}", l.date.matches(Regex("""^\d{4}-\d{2}-\d{2}$""")))

                // Assert valid pair numbers
                assertTrue("Invalid pairNumber: ${l.pairNumber}", l.pairNumber in 1..5)

                if (l.subject.isBlank()) {
                    println("BLANK SUBJECT: group=${l.groupName} date=${l.date} pair=${l.pairNumber} teacher='${l.teacher}' room='${l.room}' id='${l.id}'")
                }
                assertTrue("Subject should not be blank for ${l.groupName} on ${l.date}", l.subject.isNotBlank())
                assertTrue(
                    "Subject '${l.subject}' contains stray day names",
                    !l.subject.contains("понедельник", ignoreCase = true) &&
                    !l.subject.contains("суббота", ignoreCase = true) &&
                    !l.subject.contains("пятница", ignoreCase = true)
                )
                assertTrue(
                    "Subject '${l.subject}' starts with stray single letter",
                    !l.subject.matches(Regex("""^[а-яёА-ЯЁa-zA-Z]\s+.*"""))
                )

                // Assert teacher format if present
                if (l.teacher.isNotBlank()) {
                    assertTrue(
                        "Teacher '${l.teacher}' should match Name I.O. format",
                        l.teacher.matches(Regex("""^[А-ЯЁA-Z][а-яёa-z]+(?:-[А-ЯЁA-Z][а-яёa-z]+)?\s+[А-ЯЁA-Z]\.[А-ЯЁA-Z]\.$"""))
                    )
                }

                // Assert building type
                assertTrue("Building should be main or spartaka", l.building in listOf("main", "spartaka"))
            }
        }
    }

    @Test
    fun testReconcileDateWithDayOfWeek_normalMatch() {
        // Normal match: Candidate 2026-09-14 is Monday, table says Monday
        val (date, dow) = NghuPdfCoordinateParser.reconcileDateWithDayOfWeek(
            candidateDateStr = "2026-09-14",
            detectedDow = DayOfWeek.MONDAY
        )
        assertEquals("2026-09-14", date)
        assertEquals("Понедельник", dow)
    }

    @Test
    fun testReconcileDateWithDayOfWeek_dayNumberTypo() {
        // Author typo in title: wrote 15.09 (Tuesday), but table explicitly says Monday
        val (date, dow) = NghuPdfCoordinateParser.reconcileDateWithDayOfWeek(
            candidateDateStr = "2026-09-15",
            detectedDow = DayOfWeek.MONDAY
        )
        // Auto-corrects to 14.09 Monday!
        assertEquals("2026-09-14", date)
        assertEquals("Понедельник", dow)
    }

    @Test
    fun testReconcileDateWithDayOfWeek_outdatedYear() {
        // Author forgot to change 2025 to 2026 in Excel header
        val (date, dow) = NghuPdfCoordinateParser.reconcileDateWithDayOfWeek(
            candidateDateStr = "2025-09-14",
            detectedDow = DayOfWeek.MONDAY,
            referenceDate = LocalDate.of(2026, 9, 14)
        )
        assertEquals("2026-09-14", date)
        assertEquals("Понедельник", dow)
    }

    @Test
    fun testReconcileDateWithDayOfWeek_missingFromRange() {
        // Range in title was 10-11, but table has Day 3 (Saturday)
        val (date, dow) = NghuPdfCoordinateParser.reconcileDateWithDayOfWeek(
            candidateDateStr = null,
            detectedDow = DayOfWeek.SATURDAY,
            previousReconciledDate = LocalDate.of(2026, 9, 11) // Friday
        )
        assertEquals("2026-09-12", date)
        assertEquals("Суббота", dow)
    }

    @Test
    fun testReconcileDateWithDayOfWeek_missingDatesCompletely() {
        // Header had no dates, anchor to reference week
        val (date, dow) = NghuPdfCoordinateParser.reconcileDateWithDayOfWeek(
            candidateDateStr = null,
            detectedDow = DayOfWeek.MONDAY,
            referenceDate = LocalDate.of(2026, 9, 16) // Wednesday
        )
        assertEquals("2026-09-14", date)
        assertEquals("Понедельник", dow)
    }

    @Test
    fun testExtractTimetableDatesSemesterPrefix() {
        val items = listOf(
            RawItem(str = "Расписание занятий с 01.10.2026г.", x = 300, y = 549, w = 240, h = 10)
        )
        val dates = parser.extractTimetableDates(items)
        assertTrue("Dates should not be empty", dates.isNotEmpty())
        assertEquals("2026-10-01", dates[0])
    }

    @Test
    fun testParseSemesterSchedule01Oct() {
        val pdfStream = javaClass.classLoader?.getResourceAsStream("schedule_01oct.pdf")
        assertNotNull("Resource schedule_01oct.pdf must exist", pdfStream)
        val bytes = pdfStream!!.readBytes()

        val lessons = parser.parsePdf(bytes)
        println("=== 01 OCT SEMESTER SCHEDULE LESSONS COUNT: ${lessons.size} ===")
        assertTrue("Lessons count for 6-day semester schedule should be > 300, got ${lessons.size}", lessons.size > 300)

        val groups = lessons.map { it.groupName }.distinct().sorted()
        println("Groups found in schedule_01oct.pdf (${groups.size}): $groups")
        // Check that groups from all 4 courses exist
        assertTrue("Course 1 groups exist", groups.any { it.matches(Regex("^[ЖДТ]-1\\d$")) })
        assertTrue("Course 2 groups exist", groups.any { it.matches(Regex("^[ЖДТ]-2\\d$")) })
        assertTrue("Course 3 groups exist", groups.any { it.matches(Regex("^[ЖДТ]-3\\d$")) })
        assertTrue("Course 3 or 4 groups exist on page 2", groups.any { it.matches(Regex("^[ЖДТ]-[34]\\d$")) })
        assertTrue("At least 19 groups present", groups.size >= 19)

        // Check days of week present
        val days = lessons.map { it.dayOfWeek }.distinct()
        println("Days of week found: $days")
        assertTrue("Should contain Monday", days.contains("Понедельник"))
        assertTrue("Should contain Tuesday", days.contains("Вторник"))
        assertTrue("Should contain Wednesday", days.contains("Среда"))
        assertTrue("Should contain Thursday", days.contains("Четверг"))
        assertTrue("Should contain Friday", days.contains("Пятница"))
        assertTrue("Should contain Saturday", days.contains("Суббота"))
    }
}

