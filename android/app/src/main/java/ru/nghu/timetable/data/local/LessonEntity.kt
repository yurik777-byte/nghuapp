package ru.nghu.timetable.data.local

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import ru.nghu.timetable.data.remote.dto.LessonDto
import ru.nghu.timetable.domain.model.BuildingType
import ru.nghu.timetable.domain.model.Lesson

/**
 * Room database entity storing cached lessons for offline-first operation.
 */
@Entity(
    tableName = "lessons",
    indices = [
        Index(value = ["groupName"]),
        Index(value = ["date"]),
        Index(value = ["room"]),
        Index(value = ["teacher"]),
        Index(value = ["groupName", "date"])
    ]
)
data class LessonEntity(
    @PrimaryKey
    val id: String,
    @ColumnInfo(name = "groupName")
    val groupName: String,
    val date: String,
    val dayOfWeek: String,
    val pairNumber: Int,
    val timeStart: String,
    val timeEnd: String,
    val subject: String,
    val teacher: String,
    val room: String,
    val building: String,
    val buildingAddress: String,
    val updatedAt: Long = System.currentTimeMillis()
) {
    /**
     * Converts Room entity to Domain [Lesson] model.
     */
    fun toDomain(): Lesson {
        return Lesson(
            id = id,
            group = groupName,
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
 * Extension mapper from domain [Lesson] to [LessonEntity].
 */
fun Lesson.toEntity(updatedAt: Long = System.currentTimeMillis()): LessonEntity {
    return LessonEntity(
        id = id,
        groupName = group,
        date = date,
        dayOfWeek = dayOfWeek,
        pairNumber = pairNumber,
        timeStart = timeStart,
        timeEnd = timeEnd,
        subject = subject,
        teacher = teacher,
        room = room,
        building = building.serializedName,
        buildingAddress = buildingAddress,
        updatedAt = updatedAt
    )
}

/**
 * Extension mapper from remote [LessonDto] to [LessonEntity].
 */
fun LessonDto.toEntity(updatedAt: Long = System.currentTimeMillis()): LessonEntity {
    return LessonEntity(
        id = id,
        groupName = group,
        date = date,
        dayOfWeek = dayOfWeek,
        pairNumber = pairNumber,
        timeStart = timeStart,
        timeEnd = timeEnd,
        subject = subject,
        teacher = teacher,
        room = room,
        building = building,
        buildingAddress = buildingAddress,
        updatedAt = updatedAt
    )
}
