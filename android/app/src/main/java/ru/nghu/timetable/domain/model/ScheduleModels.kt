package ru.nghu.timetable.domain.model

import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter

/**
 * Building identifier:
 * - MAIN: Главный корпус (Красный пр-т, 9)
 * - SPARTAKA: Корпус на ул. Спартака, 12
 */
enum class BuildingType(
    val serializedName: String,
    val address: String,
    val shortTitle: String
) {
    MAIN("main", "Красный пр-т, 9", "Главный"),
    SPARTAKA("spartaka", "ул. Спартака, 12", "Спартака");

    companion object {
        fun fromString(value: String?): BuildingType {
            return when (value?.trim()?.lowercase()) {
                "spartaka", "спартак", "ул. спартака, 12", "спартака, 12" -> SPARTAKA
                else -> MAIN
            }
        }
    }
}

/**
 * Visual category classification for timetable disciplines.
 */
enum class SubjectCategory(val title: String) {
    PAINTING_DRAWING("Живопись и рисунок"),
    DESIGN_DIGITAL("Дизайн и IT"),
    HUMANITIES("Гуманитарные науки"),
    PHYSICAL("Физкультура"),
    OTHER("Общие дисциплины")
}

/**
 * Classifies a subject name into one of the designated visual categories:
 * - PAINTING_DRAWING: Живопись, Рисунок, Скульптура, Цветоведение, Композиция, Графика
 * - DESIGN_DIGITAL: СИДП, 3DMAX, Corel Draw, Archicad, Unreal, Дизайн, Информатика, Нейросети, Компьютерные технологии
 * - HUMANITIES: История, Литература, Русский, Психология, География, Философия, Культурология, Иностранный язык
 * - PHYSICAL: Физкультура, Спорт, Плавание
 * - OTHER: все остальные
 */
fun classifySubject(subject: String): SubjectCategory {
    val normalized = subject.lowercase().trim()
    return when {
        listOf(
            "живопис",
            "рисунок",
            "скульптур",
            "цветоведен",
            "академическ",
            "станков",
            "композици",
            "график",
            "пленэр"
        ).any { normalized.contains(it) } -> SubjectCategory.PAINTING_DRAWING

        listOf(
            "сидп",
            "3d",
            "3dmax",
            "corel",
            "archicad",
            "архикад",
            "unreal",
            "дизайн",
            "информатик",
            "нейросет",
            "компьютер",
            "веб",
            "blender",
            "photoshop",
            "фотошоп",
            "иллюстрат",
            "мультимед",
            "анимаци"
        ).any { normalized.contains(it) } -> SubjectCategory.DESIGN_DIGITAL

        listOf(
            "истори",
            "литератур",
            "русск",
            "психолог",
            "географ",
            "философ",
            "общество",
            "культуролог",
            "английск",
            "иностран",
            "безопасн",
            "бжд",
            "право",
            "педагогик",
            "эстетик"
        ).any { normalized.contains(it) } -> SubjectCategory.HUMANITIES

        listOf(
            "физкультур",
            "физическ",
            "спорт",
            "плаван",
            "лфк"
        ).any { normalized.contains(it) } -> SubjectCategory.PHYSICAL

        else -> SubjectCategory.OTHER
    }
}

/**
 * Status of a lesson relative to current time.
 */
enum class LessonStatus {
    UPCOMING,
    ACTIVE,
    FINISHED
}

/**
 * Single scheduled lesson / pair in the timetable.
 */
data class Lesson(
    val id: String,
    val group: String,
    val date: String,
    val dayOfWeek: String,
    val pairNumber: Int,
    val timeStart: String,
    val timeEnd: String,
    val subject: String,
    val teacher: String,
    val room: String,
    val building: BuildingType,
    val buildingAddress: String,
    val category: SubjectCategory = classifySubject(subject)
) {
    val formattedTime: String
        get() = "$timeStart - $timeEnd"

    val isSpartaka: Boolean
        get() = building == BuildingType.SPARTAKA

    val isMain: Boolean
        get() = building == BuildingType.MAIN

    /**
     * Determines status of this lesson given an optional current date ("YYYY-MM-DD") and time ("HH:MM").
     */
    fun getStatus(currentDate: String? = null, currentTime: String? = null): LessonStatus {
        val today = currentDate ?: runCatching {
            LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
        }.getOrDefault("")

        val now = currentTime ?: runCatching {
            LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"))
        }.getOrDefault("")

        if (date.isNotBlank() && today.isNotBlank()) {
            if (date < today) return LessonStatus.FINISHED
            if (date > today) return LessonStatus.UPCOMING
        }

        return when {
            now.isNotBlank() && timeStart.isNotBlank() && now < timeStart -> LessonStatus.UPCOMING
            now.isNotBlank() && timeEnd.isNotBlank() && now > timeEnd -> LessonStatus.FINISHED
            else -> LessonStatus.ACTIVE
        }
    }
}

/**
 * Schedule grouped by day.
 */
data class DaySchedule(
    val date: String,
    val dayOfWeek: String,
    val lessons: List<Lesson>
)

/**
 * Academic group representation.
 */
data class GroupItem(
    val id: String,
    val name: String,
    val course: Int,
    val department: String
)

/**
 * Classroom representation with live occupancy info.
 */
data class RoomItem(
    val room: String,
    val building: BuildingType,
    val buildingAddress: String,
    val isOccupied: Boolean = false,
    val currentLesson: Lesson? = null,
    val nextLesson: Lesson? = null,
    val daySchedule: List<Lesson> = emptyList(),
    val allLessons: List<Lesson> = emptyList()
)

/**
 * Teacher representation with associated disciplines and schedule.
 */
data class TeacherItem(
    val teacher: String,
    val subjects: List<String> = emptyList(),
    val lessons: List<Lesson> = emptyList()
)

/**
 * Metadata about timetable currency and source.
 */
data class TimetableMeta(
    val updatedAt: String = "",
    val sourceUrl: String? = null,
    val sourceFileTitle: String? = null,
    val period: String? = null,
    val semester: String? = null,
    val title: String? = null
)
