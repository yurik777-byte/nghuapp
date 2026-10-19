package ru.nghu.timetable.data.local.parser

import android.content.Context
import com.tom_roush.pdfbox.android.PDFBoxResourceLoader
import com.tom_roush.pdfbox.pdmodel.PDDocument
import com.tom_roush.pdfbox.text.PDFTextStripper
import com.tom_roush.pdfbox.text.TextPosition
import ru.nghu.timetable.data.local.LessonEntity
import ru.nghu.timetable.domain.model.BuildingType
import java.io.ByteArrayInputStream
import java.io.StringWriter
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.TemporalAdjusters
import java.util.Locale
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

data class RawItem(
    val str: String,
    val x: Int,
    val y: Int,
    val w: Int,
    val h: Int
)

data class ColumnBoundary(
    val group: String,
    val minX: Int,
    val maxX: Int
)

data class PairSlot(
    val pairNumber: Int,
    val minY: Int,
    val maxY: Int,
    val timeStart: String,
    val timeEnd: String
)

data class DayDefinition(
    val dayOfWeek: String,
    val date: String,
    val pairs: List<PairSlot>
)

data class CellParsedResult(
    val subject: String,
    val teacher: String,
    val room: String,
    val building: BuildingType,
    val buildingAddress: String
)

class NghuPdfCoordinateParser {

    companion object {
        val PAIR_TIMES: Map<Int, Pair<String, String>> = mapOf(
            1 to Pair("09:00", "10:35"),
            2 to Pair("10:40", "12:15"),
            3 to Pair("13:00", "14:35"),
            4 to Pair("14:40", "16:15"),
            5 to Pair("16:20", "17:55")
        )

        val TEACHER_REGEX = Regex("""([А-ЯЁA-Z][а-яёa-z]+(?:-[А-ЯЁA-Z][а-яёa-z]+)?)\s*([А-ЯЁA-Z])\s*\.\s*([А-ЯЁA-Z])\s*\.?""")
        val SPARTAKA_REGEX = Regex("""(?:ул\.?\s*)?спар?така[,\s]+(?:д\.?\s*)?12(?:\s*(?:№|каб\.?|ауд\.?)?\s*([0-9а-яА-Я]+))?""", RegexOption.IGNORE_CASE)
        val ROOM_REGEX = Regex("""(?:^|\s)(?:(?:каб|ауд|№|комн)\.?\s*)?(\d{2,3}(?:[/-]\d{2,3})?[а-яА-Я]?|УМО)(?=\s|$)""", RegexOption.IGNORE_CASE)

        val RUSSIAN_WEEKDAYS = listOf(
            "Воскресенье",
            "Понедельник",
            "Вторник",
            "Среда",
            "Четверг",
            "Пятница",
            "Суббота"
        )

        val MONTH_NAMES = mapOf(
            "января" to "01", "февраля" to "02", "марта" to "03", "апреля" to "04",
            "мая" to "05", "июня" to "06", "июля" to "07", "августа" to "08",
            "сентября" to "09", "октября" to "10", "ноября" to "11", "декабря" to "12"
        )

        fun getDayOfWeekFromDate(dateStr: String): String {
            return try {
                val parts = dateStr.split("-").map { it.toInt() }
                if (parts.size == 3) {
                    val date = LocalDate.of(parts[0], parts[1], parts[2])
                    when (date.dayOfWeek.value) { // 1 = Monday, 7 = Sunday
                        1 -> "Понедельник"
                        2 -> "Вторник"
                        3 -> "Среда"
                        4 -> "Четверг"
                        5 -> "Пятница"
                        6 -> "Суббота"
                        7 -> "Воскресенье"
                        else -> "Понедельник"
                    }
                } else "Пятница"
            } catch (_: Exception) {
                "Пятница"
            }
        }

        val RUSSIAN_DAY_TO_DOW = mapOf(
            "понедельник" to DayOfWeek.MONDAY,
            "вторник" to DayOfWeek.TUESDAY,
            "среда" to DayOfWeek.WEDNESDAY,
            "четверг" to DayOfWeek.THURSDAY,
            "пятница" to DayOfWeek.FRIDAY,
            "суббота" to DayOfWeek.SATURDAY,
            "воскресенье" to DayOfWeek.SUNDAY
        )

        /**
         * Reconciles a candidate date from the PDF title with the ground-truth day-of-week
         * physically printed in the table row.
         * Auto-corrects:
         * 1. Typo in day number (e.g. title says 15th, but table says Monday -> corrected to 14th).
         * 2. Typo in year (e.g. template had 2025 -> corrected to 2026).
         * 3. Missing date in range (e.g. title had 2 dates, table has 3 days -> derives 3rd date).
         * 4. Missing dates entirely -> anchors to current calendar week.
         */
        fun reconcileDateWithDayOfWeek(
            candidateDateStr: String?,
            detectedDow: DayOfWeek?,
            previousReconciledDate: LocalDate? = null,
            referenceDate: LocalDate = LocalDate.now()
        ): Pair<String, String> {
            var candidateDate: LocalDate? = candidateDateStr?.let {
                try { LocalDate.parse(it) } catch (_: Exception) { null }
            }

            // Auto-correct outdated year if template author forgot to update year in Excel
            if (candidateDate != null && candidateDate.year < 2026) {
                candidateDate = candidateDate.withYear(referenceDate.year)
            }

            val finalDate: LocalDate = when {
                // Case 1: Candidate date and detected day of week from table both available
                candidateDate != null && detectedDow != null -> {
                    if (candidateDate.dayOfWeek == detectedDow) {
                        candidateDate
                    } else {
                        // Human typo in title! Adjust candidate date to the nearest matching day of week
                        var diff = detectedDow.value - candidateDate.dayOfWeek.value
                        if (diff > 3) diff -= 7
                        if (diff < -3) diff += 7
                        candidateDate.plusDays(diff.toLong())
                    }
                }
                // Case 2: Candidate date present, but no day label found in table
                candidateDate != null -> candidateDate
                // Case 3: Missing candidate date, but we have the previous day in table
                previousReconciledDate != null && detectedDow != null -> {
                    var next = previousReconciledDate.plusDays(1)
                    while (next.dayOfWeek != detectedDow && next.isBefore(previousReconciledDate.plusDays(7))) {
                        next = next.plusDays(1)
                    }
                    next
                }
                previousReconciledDate != null -> previousReconciledDate.plusDays(1)
                // Case 4: No date in document at all -> anchor to current week
                detectedDow != null -> {
                    val monday = referenceDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                    monday.plusDays((detectedDow.value - 1).toLong())
                }
                else -> referenceDate
            }

            val dateStr = finalDate.format(DateTimeFormatter.ISO_LOCAL_DATE)
            val dayOfWeekStr = getDayOfWeekFromDate(dateStr)
            return Pair(dateStr, dayOfWeekStr)
        }

        fun cleanString(str: String): String {
            return str.replace(Regex("\\s+"), " ").trim()
        }
    }

    private class CoordinateStripper(private val pageHeight: Float) : PDFTextStripper() {
        val items = mutableListOf<RawItem>()

        init {
            sortByPosition = false
        }

        override fun writeString(text: String, textPositions: MutableList<TextPosition>?) {
            if (textPositions.isNullOrEmpty()) return

            val runs = mutableListOf<MutableList<TextPosition>>()
            var currentRun = mutableListOf<TextPosition>()

            for (tp in textPositions) {
                if (currentRun.isEmpty()) {
                    currentRun.add(tp)
                } else {
                    val prev = currentRun.last()
                    val gap = tp.xDirAdj - (prev.xDirAdj + prev.widthDirAdj)
                    val yDiff = Math.abs(tp.yDirAdj - prev.yDirAdj)
                    if (gap > 8.0f || gap < -2.0f || yDiff > 3.0f) {
                        runs.add(currentRun)
                        currentRun = mutableListOf(tp)
                    } else {
                        currentRun.add(tp)
                    }
                }
            }
            if (currentRun.isNotEmpty()) {
                runs.add(currentRun)
            }

            for (run in runs) {
                val str = run.joinToString("") { it.unicode }.trim()
                if (str.isNotEmpty()) {
                    val minX = run.minOf { it.xDirAdj }
                    val maxX = run.maxOf { it.xDirAdj + it.widthDirAdj }
                    val topY = run.minOf { it.yDirAdj }
                    val bottomY = run.maxOf { it.yDirAdj + it.heightDir }

                    val y = (pageHeight - topY).roundToInt()
                    val x = minX.roundToInt()
                    val w = (maxX - minX).roundToInt()
                    val h = (bottomY - topY).roundToInt()

                    items.add(RawItem(str, x, y, w, h))
                }
            }
            super.writeString(text, textPositions)
        }
    }

    /**
     * Parses cell items into structured lesson components (subject, teacher, room, campus).
     */
    fun parseCellData(items: List<RawItem>): CellParsedResult {
        var building = BuildingType.MAIN
        var buildingAddress = BuildingType.MAIN.address
        var teacher = ""
        var room = ""

        val textLines = items.map { it.str }

        for (line in textLines) {
            if (SPARTAKA_REGEX.containsMatchIn(line)) {
                building = BuildingType.SPARTAKA
                buildingAddress = BuildingType.SPARTAKA.address
                val match = SPARTAKA_REGEX.find(line)
                if (match != null && match.groupValues.size > 1 && match.groupValues[1].isNotBlank()) {
                    room = match.groupValues[1].trim()
                }
            }
            val tm = TEACHER_REGEX.find(line)
            if (tm != null) {
                val surname = tm.groupValues[1].trim()
                val i1 = tm.groupValues[2].trim()
                val i2 = tm.groupValues[3].trim()
                teacher = "$surname $i1.$i2."
            }
        }

        if (room.isEmpty()) {
            for (line in textLines) {
                var clean = line
                if (teacher.isNotEmpty()) clean = clean.replace(teacher, "").trim()
                clean = clean.replace(SPARTAKA_REGEX, "").trim()
                val rm = ROOM_REGEX.find(clean)
                if (rm != null && rm.groupValues.size > 1) {
                    room = rm.groupValues[1].trim()
                    break
                }
            }
        }

        val subjectTokens = mutableListOf<String>()
        for (line in textLines) {
            var clean = line
            if (teacher.isNotEmpty()) {
                clean = clean.replace(teacher, " ").trim()
                val surname = teacher.split(" ").firstOrNull() ?: ""
                if (surname.length >= 3) {
                    clean = clean.replace(surname, " ").trim()
                }
            }
            clean = clean.replace(SPARTAKA_REGEX, " ").trim()
            if (room.isNotEmpty()) {
                clean = clean.replace(Regex("(?:^|\\s)${Regex.escape(room)}(?:\\s|$)"), " ").trim()
            }
            clean = clean.replace(Regex("(?i)(?:^|\\s)(?:ул|каб|ауд|комн)\\.?"), " ").trim()
            clean = clean.replace(Regex("[А-ЯЁA-Z]\\.\\s*[А-ЯЁA-Z]\\.?"), " ").trim()
            clean = clean.trim(' ', ',', '.', '-', '№')
            if (clean.length > 1) {
                subjectTokens.add(clean)
            }
        }

        var subject = cleanString(subjectTokens.joinToString(" "))
        subject = subject.trim(' ', ',', '.', '-')

        return CellParsedResult(subject, teacher, room, building, buildingAddress)
    }

    /**
     * Extracts full list of consecutive calendar dates from the timetable title.
     * Supports:
     * - "10-12.09.2026" or "10/12.09.2026" -> ["2026-09-10", "2026-09-11", "2026-09-12"]
     * - "14.09.2026" -> ["2026-09-14"]
     * - "28.09-02.10.2026" (cross-month) -> full list of days
     */
    fun extractTimetableDates(items: List<RawItem>): List<String> {
        for (item in items) {
            if (item.str.contains("Расписание", ignoreCase = true)) {
                // Written month range: "10-12 сентября 2026"
                val writtenRangeMatch = Regex("""(\d{1,2})\s*[-–—/]\s*(\d{1,2})\s+([а-яёА-ЯЁ]+)\s+(\d{4})""", RegexOption.IGNORE_CASE).find(item.str)
                if (writtenRangeMatch != null) {
                    val (d1Str, d2Str, monthWord, yyyy) = writtenRangeMatch.destructured
                    val mm = MONTH_NAMES[monthWord.lowercase()] ?: "09"
                    val d1 = d1Str.toIntOrNull() ?: 1
                    val d2 = d2Str.toIntOrNull() ?: d1
                    val dates = mutableListOf<String>()
                    for (d in d1..d2) {
                        dates.add("$yyyy-$mm-${d.toString().padStart(2, '0')}")
                    }
                    return dates
                }

                // Written single date: "14 сентября 2026"
                val writtenSingleMatch = Regex("""(\d{1,2})\s+([а-яёА-ЯЁ]+)\s+(\d{4})""", RegexOption.IGNORE_CASE).find(item.str)
                if (writtenSingleMatch != null) {
                    val (d1Str, monthWord, yyyy) = writtenSingleMatch.destructured
                    val mm = MONTH_NAMES[monthWord.lowercase()]
                    if (mm != null) {
                        return listOf("$yyyy-$mm-${d1Str.padStart(2, '0')}")
                    }
                }

                // Same month range: 10-12.09.2026 or 10/12.09.2026
                val sameMonthMatch = Regex("""(\d{1,2})\s*[-–—/]\s*(\d{1,2})\.(\d{2})\.(\d{4})""").find(item.str)
                if (sameMonthMatch != null) {
                    val (d1Str, d2Str, mm, yyyy) = sameMonthMatch.destructured
                    val d1 = d1Str.toIntOrNull() ?: 1
                    val d2 = d2Str.toIntOrNull() ?: d1
                    val dates = mutableListOf<String>()
                    for (d in d1..d2) {
                        dates.add("$yyyy-$mm-${d.toString().padStart(2, '0')}")
                    }
                    return dates
                }

                // Cross month range: 28.09-02.10.2026
                val crossMonthMatch = Regex("""(\d{1,2})\.(\d{2})\s*[-–—/]\s*(\d{1,2})\.(\d{2})\.(\d{4})""").find(item.str)
                if (crossMonthMatch != null) {
                    val (d1Str, m1Str, d2Str, m2Str, yyyyStr) = crossMonthMatch.destructured
                    return try {
                        val yyyy = yyyyStr.toInt()
                        var dt = LocalDate.of(yyyy, m1Str.toInt(), d1Str.toInt())
                        val endDt = LocalDate.of(yyyy, m2Str.toInt(), d2Str.toInt())
                        val dates = mutableListOf<String>()
                        while (!dt.isAfter(endDt)) {
                            dates.add(dt.format(DateTimeFormatter.ISO_LOCAL_DATE))
                            dt = dt.plusDays(1)
                        }
                        dates
                    } catch (_: Exception) {
                        listOf("2026-09-04")
                    }
                }

                // Single date: 14.09.2026
                val singleDateMatch = Regex("""(\d{1,2})\.(\d{2})\.(\d{4})""").find(item.str)
                if (singleDateMatch != null) {
                    val (d1Str, mm, yyyy) = singleDateMatch.destructured
                    return listOf("$yyyy-$mm-${d1Str.padStart(2, '0')}")
                }
            }
        }
        return listOf("2026-09-04")
    }

    /**
     * Parses a timetable PDF byte array directly into a list of [LessonEntity] objects.
     * Uses dynamic time label coordinate clustering to support 1-day, 2-day, 3-day, and any arbitrary schedule grids.
     */
    fun parsePdf(
        pdfBytes: ByteArray,
        context: Context? = null,
        referenceDate: LocalDate = LocalDate.now()
    ): List<LessonEntity> {
        if (context != null) {
            try {
                if (!PDFBoxResourceLoader.isReady()) {
                    PDFBoxResourceLoader.init(context)
                }
            } catch (_: Throwable) {}
        }

        val lessons = mutableListOf<LessonEntity>()
        val doc = PDDocument.load(ByteArrayInputStream(pdfBytes))

        try {
            var extractedDates = listOf("2026-09-04")

            for (pageNum in 1..doc.numberOfPages) {
                val page = doc.getPage(pageNum - 1)
                val pageHeight = page.cropBox?.height ?: page.mediaBox?.height ?: 595.28f

                val stripper = CoordinateStripper(pageHeight)
                stripper.startPage = pageNum
                stripper.endPage = pageNum
                val dummyWriter = StringWriter()
                stripper.writeText(doc, dummyWriter)

                val items = stripper.items

                if (pageNum == 1) {
                    extractedDates = extractTimetableDates(items)
                }

                // Identify group header columns dynamically regardless of table vertical shifts
                val GROUP_REGEX = Regex("""(?i)^([ЖДТ])\s*[-–—]?\s*(\d{2})$""")
                val groupItems = items.filter { GROUP_REGEX.matches(it.str.trim()) }

                val topGroupY = groupItems.maxOfOrNull { it.y } ?: 510
                val headerItems = groupItems
                    .filter { it.y >= topGroupY - 20 }
                    .groupBy {
                        val m = GROUP_REGEX.find(it.str.trim())!!
                        "${m.groupValues[1].uppercase()}-${m.groupValues[2]}"
                    }
                    .map { (canonicalName, list) ->
                        val top = list.maxByOrNull { it.y }!!
                        RawItem(canonicalName, top.x, top.y, top.w, top.h)
                    }
                    .sortedBy { it.x }

                if (headerItems.isEmpty()) continue

                val leftTimeMaxX = if (pageNum == 1) 125 else 69
                val rightTimeMinX = if (pageNum == 1) 715 else 695

                val cols = headerItems.mapIndexed { i, h ->
                    val hWidth = if (h.w > 0) h.w else 22
                    val prevRight = if (i > 0) headerItems[i - 1].let { it.x + (if (it.w > 0) it.w else 22) } else leftTimeMaxX
                    val nextLeft = if (i < headerItems.size - 1) headerItems[i + 1].x else rightTimeMinX

                    val minX = if (i == 0) leftTimeMaxX else (prevRight + h.x) / 2
                    val maxX = if (i == headerItems.size - 1) rightTimeMinX else (h.x + hWidth + nextLeft) / 2
                    ColumnBoundary(h.str, minX, maxX)
                }

                // Dynamic time row detection (11 time rows per day)
                val firstGroupX = headerItems.firstOrNull()?.x ?: 130
                val timeLabels = items
                    .filter {
                        it.str.matches(Regex("""^\s*\d{1,2}[:.]\d{2}\s*[-–—]\s*\d{1,2}[:.]\d{2}\s*$""")) &&
                        it.x < (firstGroupX - 5)
                    }
                    .sortedByDescending { it.y }

                // Dynamic day of week label detection (located left of first group column)
                val DAY_NAME_REGEX = Regex("""(?i)^\s*(понедельник|вторник|среда|четверг|пятница|суббота|воскресенье)\s*$""")
                val dayLabels = items
                    .filter {
                        DAY_NAME_REGEX.matches(it.str.trim()) && it.x < (firstGroupX - 5)
                    }
                    .sortedByDescending { it.y }

                val numDays = timeLabels.size / 11
                val isSemesterSchedule = items.any {
                    it.str.contains("Расписание", ignoreCase = true) &&
                    Regex("""(?i)\bс\s+\d{1,2}""").containsMatchIn(it.str)
                } || numDays == 6

                val refMonday = if (referenceDate.dayOfWeek == DayOfWeek.SUNDAY) {
                    referenceDate.plusDays(1)
                } else {
                    referenceDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                }

                val daysConfig = mutableListOf<DayDefinition>()
                var lastReconciledDate: LocalDate? = null

                if (numDays > 0) {
                    for (d in 0 until numDays) {
                        val chunk = timeLabels.subList(d * 11, (d + 1) * 11)

                        val topOfPair1 = if (d == 0) (topGroupY - 4) else (timeLabels[d * 11 - 1].y + chunk[0].y) / 2
                        val p1p2 = (chunk[1].y + chunk[2].y) / 2
                        val p2brk = (chunk[3].y + chunk[4].y) / 2
                        val brkp3 = (chunk[4].y + chunk[5].y) / 2
                        val p3p4 = (chunk[6].y + chunk[7].y) / 2
                        val p4p5 = (chunk[8].y + chunk[9].y) / 2
                        val bottomOfPair5 = if (d == numDays - 1) (chunk[10].y - 6) else (chunk[10].y + timeLabels[(d + 1) * 11].y) / 2

                        // Find day of week label corresponding to this vertical day slot
                        val detectedDayStr = dayLabels.firstOrNull { it.y in (bottomOfPair5 - 15)..(topOfPair1 + 15) }?.str?.trim()?.lowercase()
                        val detectedDow = detectedDayStr?.let { RUSSIAN_DAY_TO_DOW[it] }

                        val (date, dayOfWeek) = if (isSemesterSchedule) {
                            val dow = detectedDow ?: DayOfWeek.of((d % 6) + 1)
                            val dayDate = refMonday.plusDays((dow.value - 1).toLong())
                            val dateStr = dayDate.format(DateTimeFormatter.ISO_LOCAL_DATE)
                            Pair(dateStr, getDayOfWeekFromDate(dateStr))
                        } else {
                            reconcileDateWithDayOfWeek(
                                candidateDateStr = extractedDates.getOrNull(d),
                                detectedDow = detectedDow,
                                previousReconciledDate = lastReconciledDate,
                                referenceDate = referenceDate
                            )
                        }
                        lastReconciledDate = try { LocalDate.parse(date) } catch (_: Exception) { null }

                        daysConfig.add(
                            DayDefinition(
                                dayOfWeek = dayOfWeek,
                                date = date,
                                pairs = listOf(
                                    PairSlot(1, p1p2, topOfPair1, PAIR_TIMES[1]!!.first, PAIR_TIMES[1]!!.second),
                                    PairSlot(2, p2brk, p1p2, PAIR_TIMES[2]!!.first, PAIR_TIMES[2]!!.second),
                                    PairSlot(3, p3p4, brkp3, PAIR_TIMES[3]!!.first, PAIR_TIMES[3]!!.second),
                                    PairSlot(4, p4p5, p3p4, PAIR_TIMES[4]!!.first, PAIR_TIMES[4]!!.second),
                                    PairSlot(5, bottomOfPair5, p4p5, PAIR_TIMES[5]!!.first, PAIR_TIMES[5]!!.second)
                                )
                            )
                        )
                    }
                } else {
                    // Fallback for static 2-day
                    val (d1, dow1) = reconcileDateWithDayOfWeek(extractedDates.getOrNull(0), null)
                    val (d2, dow2) = reconcileDateWithDayOfWeek(extractedDates.getOrNull(1), null, previousReconciledDate = try { LocalDate.parse(d1) } catch (_: Exception) { null })
                    daysConfig.add(
                        DayDefinition(
                            dayOfWeek = dow1,
                            date = d1,
                            pairs = listOf(
                                PairSlot(1, 491, 506, PAIR_TIMES[1]!!.first, PAIR_TIMES[1]!!.second),
                                PairSlot(2, 476, 491, PAIR_TIMES[2]!!.first, PAIR_TIMES[2]!!.second),
                                PairSlot(3, 458, 476, PAIR_TIMES[3]!!.first, PAIR_TIMES[3]!!.second),
                                PairSlot(4, 445, 458, PAIR_TIMES[4]!!.first, PAIR_TIMES[4]!!.second),
                                PairSlot(5, 430, 445, PAIR_TIMES[5]!!.first, PAIR_TIMES[5]!!.second)
                            )
                        )
                    )
                    daysConfig.add(
                        DayDefinition(
                            dayOfWeek = dow2,
                            date = d2,
                            pairs = listOf(
                                PairSlot(1, 418, 430, PAIR_TIMES[1]!!.first, PAIR_TIMES[1]!!.second),
                                PairSlot(2, 400, 418, PAIR_TIMES[2]!!.first, PAIR_TIMES[2]!!.second),
                                PairSlot(3, 385, 400, PAIR_TIMES[3]!!.first, PAIR_TIMES[3]!!.second),
                                PairSlot(4, 370, 385, PAIR_TIMES[4]!!.first, PAIR_TIMES[4]!!.second),
                                PairSlot(5, 355, 370, PAIR_TIMES[5]!!.first, PAIR_TIMES[5]!!.second)
                            )
                        )
                    )
                }

                if (pageNum == 1 && daysConfig.isNotEmpty()) {
                    extractedDates = daysConfig.map { it.date }
                }

                val minTableY = daysConfig.lastOrNull()?.pairs?.lastOrNull()?.minY ?: 275
                val maxTableY = daysConfig.firstOrNull()?.pairs?.firstOrNull()?.maxY ?: 506

                for (day in daysConfig) {
                    for (col in cols) {
                        val colItems = items
                            .filter { it ->
                                if (it.y > maxTableY || it.y < minTableY || it.str.equals("перерыв", ignoreCase = true)) return@filter false
                                if (it.str.matches(Regex("""^\d{1,2}\.\d{2}-\d{1,2}\.\d{2}$"""))) return@filter false
                                if (it.str.length <= 1) return@filter false
                                if (Regex("понедельник|вторник|среда|четверг|пятница|суббота|воскресенье", RegexOption.IGNORE_CASE).containsMatchIn(it.str)) return@filter false
                                if (it.str.matches(Regex("^[ЖДТ]-\\d\\d$"))) return@filter false // Exclude bottom group headers
                                if (it.str.contains("практик", ignoreCase = true)) return@filter false // Exclude practice banner

                                val centerX = it.x + it.w / 2
                                val overlap = max(0, min(it.x + it.w, col.maxX) - max(it.x, col.minX))
                                val isInside = centerX in col.minX until col.maxX
                                val isOverlappingBorder = overlap >= 3 && (overlap.toDouble() / max(1, it.w) >= 0.20 || it.w <= 20)
                                val isWideSpanning = it.w >= 30 && overlap >= 10
                                isInside || isOverlappingBorder || isWideSpanning
                            }
                            .sortedByDescending { it.y }

                        val pairBuckets = mutableMapOf<Int, List<RawItem>>()
                        for (pr in day.pairs) {
                            pairBuckets[pr.pairNumber] = colItems.filter { it.y in pr.minY..pr.maxY }
                        }

                        val pairNums = listOf(1, 2, 3, 4, 5)
                        var idx = 0
                        while (idx < pairNums.size) {
                            val pNum = pairNums[idx]
                            val currItems = pairBuckets[pNum] ?: emptyList()

                            if (currItems.isEmpty()) {
                                idx++
                                continue
                            }

                            val currParsed = parseCellData(currItems)
                            val nextPNum = pNum + 1
                            val nextItems = pairBuckets[nextPNum] ?: emptyList()
                            var isDouble = false

                            if (nextItems.isNotEmpty() && nextPNum <= 5) {
                                val nextParsed = parseCellData(nextItems)
                                if (nextParsed.subject.isEmpty() && (nextParsed.teacher.isNotEmpty() || nextParsed.room.isNotEmpty())) {
                                    isDouble = true
                                } else if (currParsed.teacher.isEmpty() && currParsed.room.isEmpty() && currParsed.subject.isNotEmpty() &&
                                    (nextParsed.teacher.isNotEmpty() || nextParsed.room.isNotEmpty()) && nextParsed.subject.isEmpty()
                                ) {
                                    isDouble = true
                                }
                            }

                            // Special case: 3-bucket span (e.g. Д-42 Saturday: Pair 3 subject, Pair 4 room, Pair 5 teacher)
                            if (isDouble && pNum == 3 && (pairBuckets[5]?.isNotEmpty() == true)) {
                                val p5Parsed = parseCellData(pairBuckets[5]!!)
                                val combined34 = parseCellData(currItems + nextItems)
                                if (combined34.teacher.isEmpty() && p5Parsed.teacher.isNotEmpty() && p5Parsed.subject.isEmpty()) {
                                    val combinedAll = parseCellData(currItems + nextItems + pairBuckets[5]!!)
                                    for (pn in listOf(3, 4)) {
                                        val pairTime = PAIR_TIMES[pn] ?: Pair("09:00", "10:35")
                                        lessons.add(
                                            LessonEntity(
                                                id = "${col.group}_${day.date}_${pn}_${combinedAll.room.ifEmpty { "unknown" }}",
                                                groupName = col.group,
                                                groupLower = col.group.lowercase(Locale.ROOT),
                                                date = day.date,
                                                dayOfWeek = day.dayOfWeek,
                                                pairNumber = pn,
                                                timeStart = pairTime.first,
                                                timeEnd = pairTime.second,
                                                subject = combinedAll.subject,
                                                teacher = combinedAll.teacher,
                                                teacherLower = combinedAll.teacher.lowercase(Locale.ROOT),
                                                room = combinedAll.room,
                                                building = combinedAll.building.serializedName,
                                                buildingAddress = combinedAll.buildingAddress
                                            )
                                        )
                                    }
                                    idx += 3
                                    continue
                                }
                            }

                            if (isDouble) {
                                val combinedItems = currItems + nextItems
                                val parsed = parseCellData(combinedItems)
                                for (pn in listOf(pNum, nextPNum)) {
                                    val pairTime = PAIR_TIMES[pn] ?: Pair("09:00", "10:35")
                                    lessons.add(
                                        LessonEntity(
                                            id = "${col.group}_${day.date}_${pn}_${parsed.room.ifEmpty { "unknown" }}",
                                            groupName = col.group,
                                            groupLower = col.group.lowercase(Locale.ROOT),
                                            date = day.date,
                                            dayOfWeek = day.dayOfWeek,
                                            pairNumber = pn,
                                            timeStart = pairTime.first,
                                            timeEnd = pairTime.second,
                                            subject = parsed.subject,
                                            teacher = parsed.teacher,
                                            teacherLower = parsed.teacher.lowercase(Locale.ROOT),
                                            room = parsed.room,
                                            building = parsed.building.serializedName,
                                            buildingAddress = parsed.buildingAddress
                                        )
                                    )
                                }
                                idx += 2
                            } else {
                                val pairTime = PAIR_TIMES[pNum] ?: Pair("09:00", "10:35")
                                lessons.add(
                                    LessonEntity(
                                        id = "${col.group}_${day.date}_${pNum}_${currParsed.room.ifEmpty { "unknown" }}",
                                        groupName = col.group,
                                        groupLower = col.group.lowercase(Locale.ROOT),
                                        date = day.date,
                                        dayOfWeek = day.dayOfWeek,
                                        pairNumber = pNum,
                                        timeStart = pairTime.first,
                                        timeEnd = pairTime.second,
                                        subject = currParsed.subject,
                                        teacher = currParsed.teacher,
                                        teacherLower = currParsed.teacher.lowercase(Locale.ROOT),
                                        room = currParsed.room,
                                        building = currParsed.building.serializedName,
                                        buildingAddress = currParsed.buildingAddress
                                    )
                                )
                                idx++
                            }
                        }
                    }
                }

                // Detect practice banners on this page (e.g. 4th course pedagogical practice)
                val practiceItem = items.find { it.str.contains("практик", ignoreCase = true) }
                if (practiceItem != null) {
                    val practiceText = cleanString(practiceItem.str)
                    val groupsOnPage = cols.map { it.group }
                    val emptyGroups = groupsOnPage.filter { g ->
                        lessons.none { it.groupName == g }
                    }
                    for (g in emptyGroups) {
                        for (day in daysConfig) {
                            val pairTime = PAIR_TIMES[1] ?: Pair("09:00", "10:35")
                            lessons.add(
                                LessonEntity(
                                    id = "${g}_${day.date}_1_practice",
                                    groupName = g,
                                    groupLower = g.lowercase(Locale.ROOT),
                                    date = day.date,
                                    dayOfWeek = day.dayOfWeek,
                                    pairNumber = 1,
                                    timeStart = pairTime.first,
                                    timeEnd = "14:35",
                                    subject = practiceText,
                                    teacher = "",
                                    teacherLower = "",
                                    room = "",
                                    building = BuildingType.MAIN.serializedName,
                                    buildingAddress = BuildingType.MAIN.address
                                )
                            )
                        }
                    }
                }
            }
        } finally {

            doc.close()
        }

        return lessons
    }
}