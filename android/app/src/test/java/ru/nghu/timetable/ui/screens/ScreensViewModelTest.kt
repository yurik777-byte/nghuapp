package ru.nghu.timetable.ui.screens

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import ru.nghu.timetable.domain.model.BuildingType
import ru.nghu.timetable.domain.model.DaySchedule
import ru.nghu.timetable.domain.model.GroupItem
import ru.nghu.timetable.domain.model.Lesson
import ru.nghu.timetable.domain.model.RoomItem
import ru.nghu.timetable.domain.model.TeacherItem
import ru.nghu.timetable.ui.components.LiveIndicatorState
import ru.nghu.timetable.ui.screens.rooms.RoomsUiState
import ru.nghu.timetable.ui.screens.schedule.ScheduleUiState
import ru.nghu.timetable.ui.screens.teachers.TeachersUiState

class ScreensViewModelTest {

    // --- Schedule State & Logic Tests ---

    @Test
    fun testScheduleUiStateCurrentDayAndTabs() {
        val lesson1 = createSampleLesson(
            id = "1",
            date = "2026-09-04",
            day = "Пятница",
            pair = 1,
            timeStart = "09:00",
            timeEnd = "10:35",
            subject = "Живопись",
            room = "101"
        )
        val lesson2 = createSampleLesson(
            id = "2",
            date = "2026-09-04",
            day = "Пятница",
            pair = 2,
            timeStart = "10:50",
            timeEnd = "12:25",
            subject = "Рисунок",
            room = "102"
        )
        val lesson3 = createSampleLesson(
            id = "3",
            date = "2026-09-05",
            day = "Суббота",
            pair = 1,
            timeStart = "09:00",
            timeEnd = "10:35",
            subject = "История искусств",
            room = "201"
        )

        val day1 = DaySchedule(date = "2026-09-04", dayOfWeek = "Пятница", lessons = listOf(lesson1, lesson2))
        val day2 = DaySchedule(date = "2026-09-05", dayOfWeek = "Суббота", lessons = listOf(lesson3))

        val state = ScheduleUiState(
            selectedGroup = "Д-11",
            days = listOf(day1, day2),
            selectedDate = "2026-09-04"
        )

        // Verify current day selection
        assertNotNull(state.currentDaySchedule)
        assertEquals("2026-09-04", state.currentDaySchedule?.date)
        assertEquals(2, state.currentDayLessons.size)
        assertEquals("Живопись", state.currentDayLessons[0].subject)
        assertEquals("Рисунок", state.currentDayLessons[1].subject)

        // Verify day tabs generation
        val tabs = state.dayTabs
        assertEquals(2, tabs.size)
        assertEquals("2026-09-04", tabs[0].date)
        assertEquals("2026-09-05", tabs[1].date)
        assertEquals(2, tabs[0].lessonCount)
        assertEquals(1, tabs[1].lessonCount)
        assertTrue(tabs[0].hasLessons)

        // Switch date to 2026-09-05
        val updatedState = state.copy(selectedDate = "2026-09-05")
        assertEquals(1, updatedState.currentDayLessons.size)
        assertEquals("История искусств", updatedState.currentDayLessons[0].subject)
    }

    @Test
    fun testScheduleUiStateLiveStateResolution() {
        val lesson1 = createSampleLesson(
            id = "1",
            date = "2026-09-04",
            day = "Пятница",
            pair = 1,
            timeStart = "09:00",
            timeEnd = "10:35",
            subject = "Композиция",
            room = "301"
        )
        val lessonTomorrow = createSampleLesson(
            id = "2",
            date = "2026-09-05",
            day = "Суббота",
            pair = 1,
            timeStart = "09:00",
            timeEnd = "10:35",
            subject = "Скульптура",
            room = "302"
        )
        val dayToday = DaySchedule(date = "2026-09-04", dayOfWeek = "Пятница", lessons = listOf(lesson1))
        val dayTomorrow = DaySchedule(date = "2026-09-05", dayOfWeek = "Суббота", lessons = listOf(lessonTomorrow))
        val dayEmpty = DaySchedule(date = "2026-09-06", dayOfWeek = "Воскресенье", lessons = emptyList())

        val stateToday = ScheduleUiState(
            days = listOf(dayToday, dayTomorrow, dayEmpty),
            selectedDate = "2026-09-04"
        )

        // Today: Before lesson starts (08:40)
        val beforeStart = stateToday.resolveCurrentLiveState("08:40", "2026-09-04")
        assertTrue(beforeStart is LiveIndicatorState.DayUpcoming)
        assertEquals(20, (beforeStart as LiveIndicatorState.DayUpcoming).minutesUntilStart)

        // Today: During lesson (09:30)
        val duringLesson = stateToday.resolveCurrentLiveState("09:30", "2026-09-04")
        assertTrue(duringLesson is LiveIndicatorState.LessonActive)
        assertEquals("Композиция", (duringLesson as LiveIndicatorState.LessonActive).lesson.subject)

        // Today: After lesson ends (11:00)
        val afterEnd = stateToday.resolveCurrentLiveState("11:00", "2026-09-04")
        assertTrue(afterEnd is LiveIndicatorState.DayFinished)

        // Tomorrow (selectedDate > today): at 09:30 should NOT be LessonActive, but DayUpcoming
        val stateTomorrow = stateToday.copy(selectedDate = "2026-09-05")
        val tomorrowLive = stateTomorrow.resolveCurrentLiveState("09:30", "2026-09-04")
        assertTrue(tomorrowLive is LiveIndicatorState.DayUpcoming)
        assertEquals("Скульптура", (tomorrowLive as LiveIndicatorState.DayUpcoming).firstLesson.subject)
        assertEquals(0, tomorrowLive.minutesUntilStart)

        // Future day with no lessons (selectedDate > today): should be NoLessons
        val stateEmpty = stateToday.copy(selectedDate = "2026-09-06")
        val emptyLive = stateEmpty.resolveCurrentLiveState("09:30", "2026-09-04")
        assertTrue(emptyLive is LiveIndicatorState.NoLessons)

        // Yesterday (selectedDate < today): should be DayFinished
        val stateYesterday = stateToday.copy(selectedDate = "2026-09-03")
        val yesterdayLive = stateYesterday.resolveCurrentLiveState("09:30", "2026-09-04")
        assertTrue(yesterdayLive is LiveIndicatorState.DayFinished)
        assertEquals("Учебный день завершён", (yesterdayLive as LiveIndicatorState.DayFinished).message)
    }

    // --- Rooms State & Filtering Tests ---

    @Test
    fun testRoomsBuildingFilterAndOccupancyCounters() {
        val roomMain1 = RoomItem(
            room = "101",
            building = BuildingType.MAIN,
            buildingAddress = BuildingType.MAIN.address,
            isOccupied = true,
            currentLesson = createSampleLesson("1", "2026-09-04", "Пт", 1, "09:00", "10:35", "Живопись", "101")
        )
        val roomMain2 = RoomItem(
            room = "102",
            building = BuildingType.MAIN,
            buildingAddress = BuildingType.MAIN.address,
            isOccupied = false
        )
        val roomSpartaka1 = RoomItem(
            room = "205",
            building = BuildingType.SPARTAKA,
            buildingAddress = BuildingType.SPARTAKA.address,
            isOccupied = false
        )
        val roomSpartaka2 = RoomItem(
            room = "206",
            building = BuildingType.SPARTAKA,
            buildingAddress = BuildingType.SPARTAKA.address,
            isOccupied = true,
            currentLesson = createSampleLesson("2", "2026-09-04", "Пт", 1, "09:00", "10:35", "Скульптура", "206", building = BuildingType.SPARTAKA)
        )

        val allRooms = listOf(roomMain1, roomMain2, roomSpartaka1, roomSpartaka2)
        val stateAll = RoomsUiState(rooms = allRooms)

        // All buildings
        assertEquals(4, stateAll.totalRoomsCount)
        assertEquals(2, stateAll.occupiedCount)
        assertEquals(2, stateAll.freeCount)
        assertEquals(2, stateAll.mainBuildingCount)
        assertEquals(2, stateAll.spartakaBuildingCount)

        // Filter by Main Campus
        val stateMain = stateAll.copy(selectedBuilding = BuildingType.MAIN)
        assertEquals(2, stateMain.filteredRooms.size)
        assertTrue(stateMain.filteredRooms.all { it.building == BuildingType.MAIN })
        assertEquals(1, stateMain.occupiedCount)
        assertEquals(1, stateMain.freeCount)

        // Filter by Spartaka Campus
        val stateSpartaka = stateAll.copy(selectedBuilding = BuildingType.SPARTAKA)
        assertEquals(2, stateSpartaka.filteredRooms.size)
        assertTrue(stateSpartaka.filteredRooms.all { it.building == BuildingType.SPARTAKA })
    }

    @Test
    fun testRoomsSearchQueryFiltering() {
        val r1 = RoomItem(
            room = "101",
            building = BuildingType.MAIN,
            buildingAddress = BuildingType.MAIN.address,
            isOccupied = true,
            currentLesson = createSampleLesson("1", "2026-09-04", "Пт", 1, "09:00", "10:35", "Цветоведение", "101", teacher = "Сидоров С. С.", group = "Д-11")
        )
        val r2 = RoomItem(
            room = "205",
            building = BuildingType.SPARTAKA,
            buildingAddress = BuildingType.SPARTAKA.address,
            isOccupied = true,
            currentLesson = createSampleLesson("2", "2026-09-04", "Пт", 1, "09:00", "10:35", "Архитектурная графика", "205", teacher = "Петров П. П.", group = "А-21", building = BuildingType.SPARTAKA)
        )
        val r3 = RoomItem(
            room = "301",
            building = BuildingType.MAIN,
            buildingAddress = BuildingType.MAIN.address,
            isOccupied = false
        )

        val state = RoomsUiState(rooms = listOf(r1, r2, r3))

        // Search by room number "205"
        val searchRoom = state.copy(searchQuery = "205")
        assertEquals(1, searchRoom.filteredRooms.size)
        assertEquals("205", searchRoom.filteredRooms[0].room)

        // Search by Cyrillic subject "цветоведение"
        val searchSubject = state.copy(searchQuery = "цветоведен")
        assertEquals(1, searchSubject.filteredRooms.size)
        assertEquals("101", searchSubject.filteredRooms[0].room)

        // Search by teacher "петров"
        val searchTeacher = state.copy(searchQuery = "петров")
        assertEquals(1, searchTeacher.filteredRooms.size)
        assertEquals("205", searchTeacher.filteredRooms[0].room)

        // Search by group "а-21"
        val searchGroup = state.copy(searchQuery = "а-21")
        assertEquals(1, searchGroup.filteredRooms.size)
        assertEquals("205", searchGroup.filteredRooms[0].room)

        // Search non-existent
        val searchNotFound = state.copy(searchQuery = "999")
        assertTrue(searchNotFound.filteredRooms.isEmpty())
    }

    // --- Teachers State & Filtering Tests ---

    @Test
    fun testTeachersSearchAndAlphabetGrouping() {
        val t1 = TeacherItem(
            teacher = "Иванов Иван Иванович",
            subjects = listOf("Живопись", "Рисунок"),
            lessons = listOf(createSampleLesson("1", "2026-09-04", "Пт", 1, "09:00", "10:35", "Живопись", "101", teacher = "Иванов Иван Иванович"))
        )
        val t2 = TeacherItem(
            teacher = "Алексеев Алексей Алексеевич",
            subjects = listOf("История искусств"),
            lessons = emptyList()
        )
        val t3 = TeacherItem(
            teacher = "Петров Петр Петрович",
            subjects = listOf("3D Моделирование", "Дизайн"),
            lessons = listOf(createSampleLesson("2", "2026-09-04", "Пт", 2, "10:50", "12:25", "3D Моделирование", "205", teacher = "Петров Петр Петрович"))
        )

        val teachers = listOf(t1, t2, t3)
        val state = TeachersUiState(teachers = teachers)

        // Alphabet grouping
        val grouped = state.groupedByAlphabet
        assertEquals(3, grouped.size)
        assertTrue(grouped.containsKey('А'))
        assertTrue(grouped.containsKey('И'))
        assertTrue(grouped.containsKey('П'))
        assertEquals("Алексеев Алексей Алексеевич", grouped['А']?.first()?.teacher)
        assertEquals("Иванов Иван Иванович", grouped['И']?.first()?.teacher)
        assertEquals("Петров Петр Петрович", grouped['П']?.first()?.teacher)

        // Search by teacher name: "алекс"
        val searchName = state.copy(searchQuery = "алекс")
        assertEquals(1, searchName.filteredTeachers.size)
        assertEquals("Алексеев Алексей Алексеевич", searchName.filteredTeachers[0].teacher)

        // Search by taught discipline: "дизайн"
        val searchDiscipline = state.copy(searchQuery = "дизайн")
        assertEquals(1, searchDiscipline.filteredTeachers.size)
        assertEquals("Петров Петр Петрович", searchDiscipline.filteredTeachers[0].teacher)

        // Search by shared discipline substring
        val searchDraw = state.copy(searchQuery = "рисунок")
        assertEquals(1, searchDraw.filteredTeachers.size)
        assertEquals("Иванов Иван Иванович", searchDraw.filteredTeachers[0].teacher)
    }

    @Test
    fun testExpansionToggles() {
        // Rooms expansion toggle
        val roomState = RoomsUiState(expandedRoomKey = null)
        assertNull(roomState.expandedRoomKey)
        val expandedRoom = roomState.copy(expandedRoomKey = "main:101")
        assertEquals("main:101", expandedRoom.expandedRoomKey)
        val collapsedRoom = expandedRoom.copy(expandedRoomKey = null)
        assertNull(collapsedRoom.expandedRoomKey)

        // Teachers expansion toggle
        val teacherState = TeachersUiState(expandedTeacherName = null)
        assertNull(teacherState.expandedTeacherName)
        val expandedTeacher = teacherState.copy(expandedTeacherName = "Иванов И. И.")
        assertEquals("Иванов И. И.", expandedTeacher.expandedTeacherName)
        val collapsedTeacher = expandedTeacher.copy(expandedTeacherName = null)
        assertNull(collapsedTeacher.expandedTeacherName)
    }

    private fun createSampleLesson(
        id: String,
        date: String,
        day: String,
        pair: Int,
        timeStart: String,
        timeEnd: String,
        subject: String,
        room: String,
        teacher: String = "Иванов И. И.",
        group: String = "Д-11",
        building: BuildingType = BuildingType.MAIN
    ): Lesson {
        return Lesson(
            id = id,
            group = group,
            date = date,
            dayOfWeek = day,
            pairNumber = pair,
            timeStart = timeStart,
            timeEnd = timeEnd,
            subject = subject,
            teacher = teacher,
            room = room,
            building = building,
            buildingAddress = building.address
        )
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            val test = ScreensViewModelTest()
            test.testScheduleUiStateCurrentDayAndTabs()
            println("✓ testScheduleUiStateCurrentDayAndTabs passed")
            test.testScheduleUiStateLiveStateResolution()
            println("✓ testScheduleUiStateLiveStateResolution passed")
            test.testRoomsBuildingFilterAndOccupancyCounters()
            println("✓ testRoomsBuildingFilterAndOccupancyCounters passed")
            test.testRoomsSearchQueryFiltering()
            println("✓ testRoomsSearchQueryFiltering passed")
            test.testTeachersSearchAndAlphabetGrouping()
            println("✓ testTeachersSearchAndAlphabetGrouping passed")
            test.testExpansionToggles()
            println("✓ testExpansionToggles passed")
            println("ALL SCREENS & VIEWMODEL TESTS PASSED SUCCESSFULLY!")
        }
    }
}
