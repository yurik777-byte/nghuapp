package ru.nghu.timetable.data.local

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import ru.nghu.timetable.data.remote.dto.LessonDto
import ru.nghu.timetable.domain.model.BuildingType
import ru.nghu.timetable.domain.model.Lesson
import ru.nghu.timetable.domain.model.SubjectCategory

class LessonEntityTest {

    @Test
    fun testEntityToDomainConversion() {
        val entity = LessonEntity(
            id = "Д-11_2026-09-04_1_109",
            groupName = "Д-11",
            date = "2026-09-04",
            dayOfWeek = "Пятница",
            pairNumber = 1,
            timeStart = "09:00",
            timeEnd = "10:35",
            subject = "Живопись",
            teacher = "Иванов И. И.",
            room = "109",
            building = "main",
            buildingAddress = "Красный пр-т, 9",
            updatedAt = 123456789L
        )

        val domain = entity.toDomain()
        assertEquals("Д-11_2026-09-04_1_109", domain.id)
        assertEquals("Д-11", domain.group)
        assertEquals("2026-09-04", domain.date)
        assertEquals("Пятница", domain.dayOfWeek)
        assertEquals(1, domain.pairNumber)
        assertEquals("09:00", domain.timeStart)
        assertEquals("10:35", domain.timeEnd)
        assertEquals("Живопись", domain.subject)
        assertEquals(SubjectCategory.PAINTING_DRAWING, domain.category)
        assertEquals(BuildingType.MAIN, domain.building)
        assertEquals("Красный пр-т, 9", domain.buildingAddress)
        assertEquals("д-11", entity.groupLower)
        assertEquals("иванов и. и.", entity.teacherLower)
    }

    @Test
    fun testDomainToEntityConversion() {
        val domain = Lesson(
            id = "Т-31_2026-09-04_3_каб. 216",
            group = "Т-31",
            date = "2026-09-04",
            dayOfWeek = "Пятница",
            pairNumber = 3,
            timeStart = "12:50",
            timeEnd = "14:25",
            subject = "СИДП",
            teacher = "Сидоров С. С.",
            room = "каб. 216",
            building = BuildingType.SPARTAKA,
            buildingAddress = "ул. Спартака, 12"
        )

        val entity = domain.toEntity(updatedAt = 999999L)
        assertEquals(domain.id, entity.id)
        assertEquals("Т-31", entity.groupName)
        assertEquals("т-31", entity.groupLower)
        assertEquals("сидоров с. с.", entity.teacherLower)
        assertEquals("spartaka", entity.building)
        assertEquals("ул. Спартака, 12", entity.buildingAddress)
        assertEquals(999999L, entity.updatedAt)
    }

    @Test
    fun testDtoToEntityConversion() {
        val dto = LessonDto(
            id = "Ж-21_2026-09-04_2_108",
            group = "Ж-21",
            date = "2026-09-04",
            dayOfWeek = "Пятница",
            pairNumber = 2,
            timeStart = "10:45",
            timeEnd = "12:20",
            subject = "История искусств",
            teacher = "Кузнецова К. К.",
            room = "108",
            building = "main",
            buildingAddress = "Красный пр-т, 9"
        )

        val entity = dto.toEntity(updatedAt = 55555L)
        assertEquals(dto.id, entity.id)
        assertEquals("Ж-21", entity.groupName)
        assertEquals("ж-21", entity.groupLower)
        assertEquals("кузнецова к. к.", entity.teacherLower)
        assertEquals("История искусств", entity.subject)
        assertEquals(55555L, entity.updatedAt)

        val domain = entity.toDomain()
        assertEquals(SubjectCategory.HUMANITIES, domain.category)
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            val test = LessonEntityTest()
            test.testEntityToDomainConversion()
            println("✓ testEntityToDomainConversion passed")
            test.testDomainToEntityConversion()
            println("✓ testDomainToEntityConversion passed")
            test.testDtoToEntityConversion()
            println("✓ testDtoToEntityConversion passed")
            println("ALL LESSON ENTITY TESTS PASSED SUCCESSFULLY!")
        }
    }
}
