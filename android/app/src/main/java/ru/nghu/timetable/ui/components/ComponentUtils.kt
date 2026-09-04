package ru.nghu.timetable.ui.components

import ru.nghu.timetable.domain.model.BuildingType
import ru.nghu.timetable.domain.model.DaySchedule
import ru.nghu.timetable.domain.model.GroupItem
import ru.nghu.timetable.domain.model.Lesson
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.Locale
import kotlin.math.max

/**
 * State representing live status for display in [LiveIndicator].
 */
sealed interface LiveIndicatorState {
    data class LessonActive(
        val lesson: Lesson,
        val progress: Float,
        val minutesRemaining: Int
    ) : LiveIndicatorState

    data class BreakActive(
        val previousLesson: Lesson?,
        val nextLesson: Lesson,
        val progress: Float,
        val minutesRemaining: Int,
        val isCampusSwitch: Boolean = previousLesson != null && previousLesson.building != nextLesson.building
    ) : LiveIndicatorState

    data class DayUpcoming(
        val firstLesson: Lesson,
        val minutesUntilStart: Int
    ) : LiveIndicatorState

    data class DayFinished(
        val message: String = "Все пары на сегодня завершены 🎉"
    ) : LiveIndicatorState

    data class NoLessons(
        val message: String = "На сегодня занятий нет"
    ) : LiveIndicatorState
}

/**
 * Calculates fraction of pair completed between timeStart and timeEnd at currentTime (0.0f..1.0f).
 */
fun calculateLessonProgress(
    timeStart: String,
    timeEnd: String,
    currentTime: String? = null
): Float {
    val now = currentTime ?: getCurrentTimeFormatted()
    val startMin = parseTimeToMinutes(timeStart) ?: return 0f
    val endMin = parseTimeToMinutes(timeEnd) ?: return 0f
    val currentMin = parseTimeToMinutes(now) ?: return 0f

    if (endMin <= startMin) return 0f
    val elapsed = currentMin - startMin
    val total = endMin - startMin
    return (elapsed.toFloat() / total.toFloat()).coerceIn(0f, 1f)
}

/**
 * Calculates break progress between previous lesson end and next lesson start (0.0f..1.0f).
 */
fun calculateBreakProgress(
    prevEnd: String,
    nextStart: String,
    currentTime: String? = null
): Float {
    val now = currentTime ?: getCurrentTimeFormatted()
    val startMin = parseTimeToMinutes(prevEnd) ?: return 0f
    val endMin = parseTimeToMinutes(nextStart) ?: return 0f
    val currentMin = parseTimeToMinutes(now) ?: return 0f

    if (endMin <= startMin) return 0f
    val elapsed = currentMin - startMin
    val total = endMin - startMin
    return (elapsed.toFloat() / total.toFloat()).coerceIn(0f, 1f)
}

/**
 * Calculates minutes remaining until target time from currentTime.
 */
fun calculateMinutesRemaining(
    targetTime: String,
    currentTime: String? = null
): Int {
    val now = currentTime ?: getCurrentTimeFormatted()
    val targetMin = parseTimeToMinutes(targetTime) ?: return 0
    val currentMin = parseTimeToMinutes(now) ?: return 0
    return max(0, targetMin - currentMin)
}

/**
 * Evaluates the current schedule to produce the active [LiveIndicatorState].
 */
fun resolveLiveIndicatorState(
    lessons: List<Lesson>,
    currentTime: String? = null
): LiveIndicatorState {
    if (lessons.isEmpty()) {
        return LiveIndicatorState.NoLessons()
    }

    val now = currentTime ?: getCurrentTimeFormatted()
    val sortedLessons = lessons.sortedBy { it.timeStart }

    // Check if before first lesson
    val firstLesson = sortedLessons.first()
    if (now < firstLesson.timeStart) {
        val diff = calculateMinutesRemaining(firstLesson.timeStart, now)
        return LiveIndicatorState.DayUpcoming(firstLesson, diff)
    }

    // Check if after last lesson
    val lastLesson = sortedLessons.last()
    if (now > lastLesson.timeEnd) {
        return LiveIndicatorState.DayFinished()
    }

    // Check active lesson
    for (lesson in sortedLessons) {
        if (now >= lesson.timeStart && now <= lesson.timeEnd) {
            val progress = calculateLessonProgress(lesson.timeStart, lesson.timeEnd, now)
            val remaining = calculateMinutesRemaining(lesson.timeEnd, now)
            return LiveIndicatorState.LessonActive(lesson, progress, remaining)
        }
    }

    // Check breaks between consecutive lessons
    for (i in 0 until sortedLessons.size - 1) {
        val current = sortedLessons[i]
        val next = sortedLessons[i + 1]
        if (now > current.timeEnd && now < next.timeStart) {
            val progress = calculateBreakProgress(current.timeEnd, next.timeStart, now)
            val remaining = calculateMinutesRemaining(next.timeStart, now)
            return LiveIndicatorState.BreakActive(current, next, progress, remaining)
        }
    }

    return LiveIndicatorState.DayFinished()
}

/**
 * Calculates duration in minutes between previous pair end and next pair start.
 */
fun calculateBreakDurationMinutes(prevEnd: String, nextStart: String): Int {
    val endMin = parseTimeToMinutes(prevEnd) ?: return 0
    val startMin = parseTimeToMinutes(nextStart) ?: return 0
    return max(0, startMin - endMin)
}

/**
 * Checks if transition between two lessons involves a building switch.
 */
fun isBuildingTransition(prevLesson: Lesson, nextLesson: Lesson): Boolean {
    return prevLesson.building != nextLesson.building
}

/**
 * Extracts initials from teacher name (e.g. "Иванов Иван Иванович" -> "ИИ", "Петров Пётр" -> "ПП").
 */
fun extractInitials(name: String): String {
    val clean = name.trim()
    if (clean.isBlank()) return ""

    val parts = clean.split(Regex("[\\s.]+")).filter { it.isNotBlank() }
    return when {
        parts.size >= 3 -> "${parts[0].take(1)}${parts[1].take(1)}".uppercase()
        parts.size == 2 -> "${parts[0].take(1)}${parts[1].take(1)}".uppercase()
        parts.size == 1 -> parts[0].take(2).uppercase()
        else -> ""
    }
}

/**
 * Filters a list of groups by course and search query (case-insensitive Cyrillic-safe).
 */
fun filterGroups(
    groups: List<GroupItem>,
    query: String,
    courseFilter: Int
): List<GroupItem> {
    val cleanQuery = query.trim().lowercase(Locale.forLanguageTag("ru"))
    return groups.filter { group ->
        val matchesCourse = courseFilter == 0 || group.course == courseFilter
        val matchesQuery = cleanQuery.isEmpty() ||
            group.name.lowercase(Locale.forLanguageTag("ru")).contains(cleanQuery) ||
            group.department.lowercase(Locale.forLanguageTag("ru")).contains(cleanQuery)

        matchesCourse && matchesQuery
    }
}

private fun parseTimeToMinutes(timeStr: String): Int? {
    val parts = timeStr.trim().split(":")
    if (parts.size < 2) return null
    val h = parts[0].toIntOrNull() ?: return null
    val m = parts[1].toIntOrNull() ?: return null
    return h * 60 + m
}

private fun getCurrentTimeFormatted(): String {
    return runCatching {
        LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"))
    }.getOrDefault("09:00")
}

/**
 * Data representation for a single day tab in the DaySelector.
 */
data class DayTabItem(
    val date: String,             // "2026-09-04"
    val dayOfWeekShort: String,   // "Пт"
    val dayOfMonth: String,       // "4"
    val isToday: Boolean,
    val hasLessons: Boolean = true,
    val lessonCount: Int = 0
)

/**
 * Builds [DayTabItem] list from domain [DaySchedule] items or dates.
 */
fun buildDayTabs(
    daySchedules: List<DaySchedule>,
    todayDate: String? = null
): List<DayTabItem> {
    val today = todayDate ?: runCatching {
        LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
    }.getOrDefault("")

    return daySchedules.map { day ->
        val parsedDate = runCatching {
            LocalDate.parse(day.date)
        }.getOrNull()

        val shortDayOfWeek = parsedDate?.dayOfWeek?.getDisplayName(
            TextStyle.SHORT,
            Locale.forLanguageTag("ru")
        )?.replace(".", "")?.capitalizeFirst()
            ?: day.dayOfWeek.take(2)

        val dayOfMonth = parsedDate?.dayOfMonth?.toString()
            ?: day.date.takeLast(2).trimStart('0')

        DayTabItem(
            date = day.date,
            dayOfWeekShort = shortDayOfWeek,
            dayOfMonth = dayOfMonth,
            isToday = day.date == today,
            hasLessons = day.lessons.isNotEmpty(),
            lessonCount = day.lessons.size
        )
    }
}

private fun String.capitalizeFirst(): String {
    return replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.forLanguageTag("ru")) else it.toString() }
}

