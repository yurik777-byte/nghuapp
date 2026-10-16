package ru.nghu.timetable.domain.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ScheduleModelsTest {

    @Test
    fun testSubjectCategoryClassification() {
        // Painting & Drawing
        assertEquals(SubjectCategory.PAINTING_DRAWING, classifySubject("Живопись"))
        assertEquals(SubjectCategory.PAINTING_DRAWING, classifySubject("Академический рисунок"))
        assertEquals(SubjectCategory.PAINTING_DRAWING, classifySubject("Скульптура и пластическое моделирование"))
        assertEquals(SubjectCategory.PAINTING_DRAWING, classifySubject("Цветоведение и колористика"))
        assertEquals(SubjectCategory.PAINTING_DRAWING, classifySubject("Станковая композиция"))

        // Design & Digital
        assertEquals(SubjectCategory.DESIGN_DIGITAL, classifySubject("СИДП"))
        assertEquals(SubjectCategory.DESIGN_DIGITAL, classifySubject("3DMAX анимация"))
        assertEquals(SubjectCategory.DESIGN_DIGITAL, classifySubject("Corel Draw"))
        assertEquals(SubjectCategory.DESIGN_DIGITAL, classifySubject("Archicad проектирование"))
        assertEquals(SubjectCategory.DESIGN_DIGITAL, classifySubject("Unreal Engine разработка"))
        assertEquals(SubjectCategory.DESIGN_DIGITAL, classifySubject("Графический дизайн"))
        assertEquals(SubjectCategory.DESIGN_DIGITAL, classifySubject("Информатика"))
        assertEquals(SubjectCategory.DESIGN_DIGITAL, classifySubject("Нейросети в искусстве"))

        // Humanities
        assertEquals(SubjectCategory.HUMANITIES, classifySubject("История искусств"))
        assertEquals(SubjectCategory.HUMANITIES, classifySubject("Литература"))
        assertEquals(SubjectCategory.HUMANITIES, classifySubject("Русский язык и культура речи"))
        assertEquals(SubjectCategory.HUMANITIES, classifySubject("Психология общения"))
        assertEquals(SubjectCategory.HUMANITIES, classifySubject("Экономическая география"))
        assertEquals(SubjectCategory.HUMANITIES, classifySubject("Основы философии"))

        // Physical
        assertEquals(SubjectCategory.PHYSICAL, classifySubject("Физическая культура"))
        assertEquals(SubjectCategory.PHYSICAL, classifySubject("Физкультура (ЛФК)"))
        assertEquals(SubjectCategory.PHYSICAL, classifySubject("Спорт"))

        // Other
        assertEquals(SubjectCategory.OTHER, classifySubject("Математика"))
        assertEquals(SubjectCategory.OTHER, classifySubject("Охрана труда"))
    }

    @Test
    fun testBuildingTypeMapping() {
        assertEquals(BuildingType.MAIN, BuildingType.fromString("main"))
        assertEquals(BuildingType.MAIN, BuildingType.fromString("главный"))
        assertEquals(BuildingType.MAIN, BuildingType.fromString(null))
        assertEquals("Красный пр-т, 9", BuildingType.MAIN.address)

        assertEquals(BuildingType.SPARTAKA, BuildingType.fromString("spartaka"))
        assertEquals(BuildingType.SPARTAKA, BuildingType.fromString("спартак"))
        assertEquals(BuildingType.SPARTAKA, BuildingType.fromString("ул. Спартака, 12"))
        assertEquals("ул. Спартака, 12", BuildingType.SPARTAKA.address)
    }

    @Test
    fun testLessonModelHelpers() {
        val lessonMain = Lesson(
            id = "test_1",
            group = "Д-11",
            date = "2026-09-04",
            dayOfWeek = "Пятница",
            pairNumber = 1,
            timeStart = "09:00",
            timeEnd = "10:35",
            subject = "Живопись",
            teacher = "Иванов И. И.",
            room = "109",
            building = BuildingType.MAIN,
            buildingAddress = BuildingType.MAIN.address
        )

        assertEquals(SubjectCategory.PAINTING_DRAWING, lessonMain.category)
        assertEquals("09:00 - 10:35", lessonMain.formattedTime)
        assertTrue(lessonMain.isMain)
        assertFalse(lessonMain.isSpartaka)

        // Time status check
        assertEquals(LessonStatus.UPCOMING, lessonMain.getStatus(currentDate = "2026-09-04", currentTime = "08:30"))
        assertEquals(LessonStatus.ACTIVE, lessonMain.getStatus(currentDate = "2026-09-04", currentTime = "09:30"))
        assertEquals(LessonStatus.FINISHED, lessonMain.getStatus(currentDate = "2026-09-04", currentTime = "11:00"))
        assertEquals(LessonStatus.FINISHED, lessonMain.getStatus(currentDate = "2026-09-05", currentTime = "08:00"))
        assertEquals(LessonStatus.UPCOMING, lessonMain.getStatus(currentDate = "2026-09-03", currentTime = "12:00"))
    }

    @Test
    fun testRoomItemLastLessonProperty() {
        val lastLesson = Lesson(
            id = "last_1",
            group = "Д-11",
            date = "2026-10-12",
            dayOfWeek = "Понедельник",
            pairNumber = 1,
            timeStart = "09:00",
            timeEnd = "10:35",
            subject = "Живопись",
            teacher = "Чирва Д.В.",
            room = "101",
            building = BuildingType.MAIN,
            buildingAddress = BuildingType.MAIN.address
        )

        val room = RoomItem(
            room = "101",
            building = BuildingType.MAIN,
            buildingAddress = BuildingType.MAIN.address,
            isOccupied = false,
            currentLesson = null,
            nextLesson = null,
            lastLesson = lastLesson
        )

        assertFalse(room.isOccupied)
        assertNotNull(room.lastLesson)
        assertEquals("Д-11", room.lastLesson?.group)
        assertEquals("Живопись", room.lastLesson?.subject)
        assertEquals(1, room.lastLesson?.pairNumber)
        assertEquals("Чирва Д.В.", room.lastLesson?.teacher)
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            val test = ScheduleModelsTest()
            test.testSubjectCategoryClassification()
            println("✓ testSubjectCategoryClassification passed")
            test.testBuildingTypeMapping()
            println("✓ testBuildingTypeMapping passed")
            test.testLessonModelHelpers()
            println("✓ testLessonModelHelpers passed")
            println("ALL TESTS PASSED SUCCESSFULLY!")
        }
    }
}
