package ru.nghu.timetable.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import ru.nghu.timetable.domain.model.BuildingType
import ru.nghu.timetable.domain.model.DaySchedule
import ru.nghu.timetable.domain.model.GroupItem
import ru.nghu.timetable.domain.model.Lesson
import ru.nghu.timetable.domain.model.RoomItem
import ru.nghu.timetable.domain.model.TeacherItem
import ru.nghu.timetable.domain.model.TimetableMeta

/**
 * Metadata DTO returned by /api/meta or included in /api/schedule
 */
@Serializable
data class TimetableMetaDto(
    @SerialName("updatedAt") val updatedAt: String = "",
    @SerialName("sourceUrl") val sourceUrl: String? = null,
    @SerialName("sourceFileTitle") val sourceFileTitle: String? = null,
    @SerialName("period") val period: String? = null,
    @SerialName("semester") val semester: String? = null,
    @SerialName("title") val title: String? = null
) {
    fun toDomain(): TimetableMeta {
        return TimetableMeta(
            updatedAt = updatedAt,
            sourceUrl = sourceUrl,
            sourceFileTitle = sourceFileTitle,
            period = period,
            semester = semester,
            title = title ?: sourceFileTitle ?: period
        )
    }
}

/**
 * Single lesson DTO
 */
@Serializable
data class LessonDto(
    @SerialName("id") val id: String = "",
    @SerialName("group") val group: String = "",
    @SerialName("date") val date: String = "",
    @SerialName("dayOfWeek") val dayOfWeek: String = "",
    @SerialName("pairNumber") val pairNumber: Int = 1,
    @SerialName("timeStart") val timeStart: String = "",
    @SerialName("timeEnd") val timeEnd: String = "",
    @SerialName("subject") val subject: String = "",
    @SerialName("teacher") val teacher: String = "",
    @SerialName("room") val room: String = "",
    @SerialName("building") val building: String = "main",
    @SerialName("buildingAddress") val buildingAddress: String = ""
) {
    fun toDomain(): Lesson {
        return Lesson(
            id = id,
            group = group,
            date = date,
            dayOfWeek = dayOfWeek,
            pairNumber = pairNumber,
            timeStart = timeStart,
            timeEnd = timeEnd,
            subject = subject,
            teacher = teacher,
            room = room,
            building = BuildingType.fromString(building),
            buildingAddress = buildingAddress
        )
    }
}

/**
 * Day container with lessons DTO
 */
@Serializable
data class ScheduleDayDto(
    @SerialName("date") val date: String = "",
    @SerialName("dayOfWeek") val dayOfWeek: String = "",
    @SerialName("lessons") val lessons: List<LessonDto> = emptyList()
) {
    fun toDomain(): DaySchedule {
        return DaySchedule(
            date = date,
            dayOfWeek = dayOfWeek,
            lessons = lessons.map { it.toDomain() }
        )
    }
}

/**
 * Full schedule response DTO from GET /api/schedule
 */
@Serializable
data class ScheduleResponseDto(
    @SerialName("meta") val meta: TimetableMetaDto? = null,
    @SerialName("days") val days: List<ScheduleDayDto> = emptyList()
)

/**
 * Academic group DTO from GET /api/groups
 */
@Serializable
data class GroupInfoDto(
    @SerialName("id") val id: String = "",
    @SerialName("name") val name: String = "",
    @SerialName("course") val course: Int = 1,
    @SerialName("department") val department: String = ""
) {
    fun toDomain(): GroupItem {
        return GroupItem(
            id = id,
            name = name,
            course = course,
            department = department
        )
    }
}

/**
 * Classroom occupancy DTO from GET /api/rooms
 */
@Serializable
data class RoomOccupancyDto(
    @SerialName("room") val room: String = "",
    @SerialName("roomNumber") val roomNumber: String? = null,
    @SerialName("building") val building: String = "main",
    @SerialName("buildingAddress") val buildingAddress: String = "",
    @SerialName("isOccupied") val isOccupied: Boolean = false,
    @SerialName("currentLesson") val currentLesson: LessonDto? = null,
    @SerialName("nextLesson") val nextLesson: LessonDto? = null,
    @SerialName("daySchedule") val daySchedule: List<LessonDto> = emptyList(),
    @SerialName("schedule") val schedule: List<LessonDto> = emptyList()
) {
    fun toDomain(): RoomItem {
        val effectiveRoom = if (room.isNotBlank()) room else (roomNumber ?: "")
        val allLessons = if (schedule.isNotEmpty()) schedule else daySchedule
        return RoomItem(
            room = effectiveRoom,
            building = BuildingType.fromString(building),
            buildingAddress = buildingAddress,
            isOccupied = isOccupied,
            currentLesson = currentLesson?.toDomain(),
            nextLesson = nextLesson?.toDomain(),
            daySchedule = daySchedule.map { it.toDomain() },
            allLessons = allLessons.map { it.toDomain() }
        )
    }
}

/**
 * Teacher schedule DTO from GET /api/teachers
 */
@Serializable
data class TeacherScheduleDto(
    @SerialName("teacher") val teacher: String = "",
    @SerialName("subjects") val subjects: List<String> = emptyList(),
    @SerialName("lessons") val lessons: List<LessonDto> = emptyList()
) {
    fun toDomain(): TeacherItem {
        return TeacherItem(
            teacher = teacher,
            subjects = subjects,
            lessons = lessons.map { it.toDomain() }
        )
    }
}

/**
 * Response DTO from POST /api/refresh
 */
@Serializable
data class RefreshResponseDto(
    @SerialName("success") val success: Boolean = false,
    @SerialName("meta") val meta: TimetableMetaDto? = null
)
