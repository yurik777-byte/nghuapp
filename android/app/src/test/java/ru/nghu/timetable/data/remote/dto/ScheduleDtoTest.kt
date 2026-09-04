package ru.nghu.timetable.data.remote.dto

import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import ru.nghu.timetable.domain.model.BuildingType
import ru.nghu.timetable.domain.model.SubjectCategory

class ScheduleDtoTest {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        coerceInputValues = true
    }

    @Test
    fun testScheduleResponseDeserializationAndMapping() {
        val jsonString = """
        {
            "meta": {
                "updatedAt": "2026-09-04T08:00:00.000Z",
                "sourceUrl": "https://nghu.ru/timetable.pdf",
                "sourceFileTitle": "Расписание занятий на 04.09.2026",
                "period": "04.09.2026",
                "semester": "1 семестр"
            },
            "days": [
                {
                    "date": "2026-09-04",
                    "dayOfWeek": "Пятница",
                    "lessons": [
                        {
                            "id": "Д-11_2026-09-04_1_109",
                            "group": "Д-11",
                            "date": "2026-09-04",
                            "dayOfWeek": "Пятница",
                            "pairNumber": 1,
                            "timeStart": "09:00",
                            "timeEnd": "10:35",
                            "subject": "Живопись",
                            "teacher": "Иванов И. И.",
                            "room": "109",
                            "building": "main",
                            "buildingAddress": "Красный пр-т, 9"
                        },
                        {
                            "id": "Д-11_2026-09-04_2_216",
                            "group": "Д-11",
                            "date": "2026-09-04",
                            "dayOfWeek": "Пятница",
                            "pairNumber": 2,
                            "timeStart": "10:45",
                            "timeEnd": "12:20",
                            "subject": "3DMAX моделирование",
                            "teacher": "Петров П. П.",
                            "room": "216",
                            "building": "spartaka",
                            "buildingAddress": "ул. Спартака, 12"
                        }
                    ]
                }
            ]
        }
        """.trimIndent()

        val dto = json.decodeFromString<ScheduleResponseDto>(jsonString)
        assertNotNull(dto.meta)
        assertEquals("04.09.2026", dto.meta?.period)
        assertEquals(1, dto.days.size)

        val dayDomain = dto.days[0].toDomain()
        assertEquals("2026-09-04", dayDomain.date)
        assertEquals("Пятница", dayDomain.dayOfWeek)
        assertEquals(2, dayDomain.lessons.size)

        val lesson1 = dayDomain.lessons[0]
        assertEquals("Живопись", lesson1.subject)
        assertEquals(BuildingType.MAIN, lesson1.building)
        assertEquals(SubjectCategory.PAINTING_DRAWING, lesson1.category)

        val lesson2 = dayDomain.lessons[1]
        assertEquals("3DMAX моделирование", lesson2.subject)
        assertEquals(BuildingType.SPARTAKA, lesson2.building)
        assertEquals(SubjectCategory.DESIGN_DIGITAL, lesson2.category)
        assertTrue(lesson2.isSpartaka)
    }

    @Test
    fun testRoomOccupancyDtoMapping() {
        val jsonString = """
        {
            "room": "109",
            "building": "main",
            "buildingAddress": "Красный пр-т, 9",
            "isOccupied": true,
            "currentLesson": {
                "id": "Д-11_2026-09-04_1_109",
                "group": "Д-11",
                "date": "2026-09-04",
                "dayOfWeek": "Пятница",
                "pairNumber": 1,
                "timeStart": "09:00",
                "timeEnd": "10:35",
                "subject": "Живопись",
                "teacher": "Иванов И. И.",
                "room": "109",
                "building": "main",
                "buildingAddress": "Красный пр-т, 9"
            },
            "nextLesson": null,
            "daySchedule": []
        }
        """.trimIndent()

        val dto = json.decodeFromString<RoomOccupancyDto>(jsonString)
        val roomItem = dto.toDomain()

        assertEquals("109", roomItem.room)
        assertEquals(BuildingType.MAIN, roomItem.building)
        assertTrue(roomItem.isOccupied)
        assertNotNull(roomItem.currentLesson)
        assertEquals("Иванов И. И.", roomItem.currentLesson?.teacher)
    }

    @Test
    fun testTeacherScheduleDtoMapping() {
        val jsonString = """
        {
            "teacher": "Иванов И. И.",
            "subjects": ["Живопись", "Рисунок"],
            "lessons": []
        }
        """.trimIndent()

        val dto = json.decodeFromString<TeacherScheduleDto>(jsonString)
        val teacherItem = dto.toDomain()

        assertEquals("Иванов И. И.", teacherItem.teacher)
        assertEquals(listOf("Живопись", "Рисунок"), teacherItem.subjects)
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            val test = ScheduleDtoTest()
            test.testScheduleResponseDeserializationAndMapping()
            println("✓ testScheduleResponseDeserializationAndMapping passed")
            test.testRoomOccupancyDtoMapping()
            println("✓ testRoomOccupancyDtoMapping passed")
            test.testTeacherScheduleDtoMapping()
            println("✓ testTeacherScheduleDtoMapping passed")
            println("ALL DTO TESTS PASSED SUCCESSFULLY!")
        }
    }
}
