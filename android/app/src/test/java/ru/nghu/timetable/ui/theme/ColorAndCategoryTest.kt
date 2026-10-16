package ru.nghu.timetable.ui.theme

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import ru.nghu.timetable.domain.model.BuildingType
import ru.nghu.timetable.domain.model.GroupItem
import ru.nghu.timetable.domain.model.Lesson
import ru.nghu.timetable.domain.model.LessonStatus
import ru.nghu.timetable.domain.model.SubjectCategory
import ru.nghu.timetable.ui.components.LiveIndicatorState
import ru.nghu.timetable.ui.components.calculateBreakDurationMinutes
import ru.nghu.timetable.ui.components.calculateBreakProgress
import ru.nghu.timetable.ui.components.calculateLessonProgress
import ru.nghu.timetable.ui.components.calculateMinutesRemaining
import ru.nghu.timetable.ui.components.extractInitials
import ru.nghu.timetable.ui.components.filterGroups
import ru.nghu.timetable.ui.components.isBuildingTransition
import ru.nghu.timetable.ui.components.resolveLiveIndicatorState

class ColorAndCategoryTest {

    @Test
    fun testCategoryColorMappingLight() {
        // In unified dark graphite theme, clean dark palette is used
        val paintingLight = getCategoryColorScheme(SubjectCategory.PAINTING_DRAWING, isDark = false)
        assertEquals(CategoryPaintingDarkContainer, paintingLight.containerColor)
        assertEquals(CategoryPaintingDarkText, paintingLight.contentColor)
        assertEquals(CategoryPaintingDarkAccent, paintingLight.accentColor)

        val designLight = getCategoryColorScheme(SubjectCategory.DESIGN_DIGITAL, isDark = false)
        assertEquals(CategoryDesignDarkContainer, designLight.containerColor)
        assertEquals(CategoryDesignDarkText, designLight.contentColor)
        assertEquals(CategoryDesignDarkAccent, designLight.accentColor)

        val humanitiesLight = getCategoryColorScheme(SubjectCategory.HUMANITIES, isDark = false)
        assertEquals(CategoryHumanitiesDarkContainer, humanitiesLight.containerColor)
        assertEquals(CategoryHumanitiesDarkText, humanitiesLight.contentColor)
        assertEquals(CategoryHumanitiesDarkAccent, humanitiesLight.accentColor)

        val physicalLight = getCategoryColorScheme(SubjectCategory.PHYSICAL, isDark = false)
        assertEquals(CategoryPhysicalDarkContainer, physicalLight.containerColor)
        assertEquals(CategoryPhysicalDarkText, physicalLight.contentColor)
        assertEquals(CategoryPhysicalDarkAccent, physicalLight.accentColor)

        val otherLight = getCategoryColorScheme(SubjectCategory.OTHER, isDark = false)
        assertEquals(CategoryOtherDarkContainer, otherLight.containerColor)
        assertEquals(CategoryOtherDarkText, otherLight.contentColor)
        assertEquals(CategoryOtherDarkAccent, otherLight.accentColor)
    }

    @Test
    fun testCategoryColorMappingDark() {
        val paintingDark = getCategoryColorScheme(SubjectCategory.PAINTING_DRAWING, isDark = true)
        assertEquals(CategoryPaintingDarkContainer, paintingDark.containerColor)
        assertEquals(CategoryPaintingDarkText, paintingDark.contentColor)
        assertEquals(CategoryPaintingDarkAccent, paintingDark.accentColor)

        val designDark = getCategoryColorScheme(SubjectCategory.DESIGN_DIGITAL, isDark = true)
        assertEquals(CategoryDesignDarkContainer, designDark.containerColor)
        assertEquals(CategoryDesignDarkText, designDark.contentColor)
        assertEquals(CategoryDesignDarkAccent, designDark.accentColor)

        val humanitiesDark = getCategoryColorScheme(SubjectCategory.HUMANITIES, isDark = true)
        assertEquals(CategoryHumanitiesDarkContainer, humanitiesDark.containerColor)
        assertEquals(CategoryHumanitiesDarkText, humanitiesDark.contentColor)
        assertEquals(CategoryHumanitiesDarkAccent, humanitiesDark.accentColor)

        val physicalDark = getCategoryColorScheme(SubjectCategory.PHYSICAL, isDark = true)
        assertEquals(CategoryPhysicalDarkContainer, physicalDark.containerColor)
        assertEquals(CategoryPhysicalDarkText, physicalDark.contentColor)
        assertEquals(CategoryPhysicalDarkAccent, physicalDark.accentColor)

        val otherDark = getCategoryColorScheme(SubjectCategory.OTHER, isDark = true)
        assertEquals(CategoryOtherDarkContainer, otherDark.containerColor)
        assertEquals(CategoryOtherDarkText, otherDark.contentColor)
        assertEquals(CategoryOtherDarkAccent, otherDark.accentColor)
    }

    @Test
    fun testBuildingBadgeColorsDifferentiation() {
        val mainLight = getBuildingBadgeColors(BuildingType.MAIN, isDark = false)
        assertEquals(BuildingMainDarkContainer, mainLight.containerColor)
        assertEquals(BuildingMainDarkText, mainLight.contentColor)
        assertEquals(BuildingMainDarkBorder, mainLight.borderColor)
        assertEquals(BuildingMainDarkAccent, mainLight.accentColor)

        val mainDark = getBuildingBadgeColors(BuildingType.MAIN, isDark = true)
        assertEquals(BuildingMainDarkContainer, mainDark.containerColor)
        assertEquals(BuildingMainDarkText, mainDark.contentColor)

        val spartakaLight = getBuildingBadgeColors(BuildingType.SPARTAKA, isDark = false)
        assertEquals(BuildingSpartakaDarkContainer, spartakaLight.containerColor)
        assertEquals(BuildingSpartakaDarkText, spartakaLight.contentColor)
        assertEquals(BuildingSpartakaDarkBorder, spartakaLight.borderColor)
        assertEquals(BuildingSpartakaDarkAccent, spartakaLight.accentColor)

        val spartakaDark = getBuildingBadgeColors(BuildingType.SPARTAKA, isDark = true)
        assertEquals(BuildingSpartakaDarkContainer, spartakaDark.containerColor)
        assertEquals(BuildingSpartakaDarkText, spartakaDark.contentColor)

        assertFalse(mainLight.containerColor == spartakaLight.containerColor)
        assertFalse(mainLight.accentColor == spartakaLight.accentColor)
    }

    @Test
    fun testStatusColors() {
        val activeLight = getLessonStatusColors(LessonStatus.ACTIVE, isDark = false)
        assertEquals(StatusActiveDark, activeLight.indicatorColor)

        val activeDark = getLessonStatusColors(LessonStatus.ACTIVE, isDark = true)
        assertEquals(StatusActiveDark, activeDark.indicatorColor)

        val upcomingLight = getLessonStatusColors(LessonStatus.UPCOMING, isDark = false)
        assertEquals(StatusUpcomingDark, upcomingLight.indicatorColor)

        val finishedLight = getLessonStatusColors(LessonStatus.FINISHED, isDark = false)
        assertEquals(StatusFinishedDark, finishedLight.indicatorColor)
    }

    @Test
    fun testProgressCalculations() {
        // 90 minute pair from 09:00 to 10:30
        // Before start
        assertEquals(0.0f, calculateLessonProgress("09:00", "10:30", "08:45"), 0.001f)
        // At start
        assertEquals(0.0f, calculateLessonProgress("09:00", "10:30", "09:00"), 0.001f)
        // Exactly half (45 min into 90 min)
        assertEquals(0.5f, calculateLessonProgress("09:00", "10:30", "09:45"), 0.001f)
        // At end
        assertEquals(1.0f, calculateLessonProgress("09:00", "10:30", "10:30"), 0.001f)
        // After end (clamped)
        assertEquals(1.0f, calculateLessonProgress("09:00", "10:30", "11:00"), 0.001f)

        // Break progress: 10:30 to 10:50 (20 minutes)
        assertEquals(0.0f, calculateBreakProgress("10:30", "10:50", "10:30"), 0.001f)
        assertEquals(0.25f, calculateBreakProgress("10:30", "10:50", "10:35"), 0.001f)
        assertEquals(0.5f, calculateBreakProgress("10:30", "10:50", "10:40"), 0.001f)
        assertEquals(1.0f, calculateBreakProgress("10:30", "10:50", "10:50"), 0.001f)

        // Minutes remaining
        assertEquals(30, calculateMinutesRemaining("10:30", "10:00"))
        assertEquals(0, calculateMinutesRemaining("10:30", "10:35"))
    }

    @Test
    fun testBreakDurationAndTransition() {
        assertEquals(15, calculateBreakDurationMinutes("10:35", "10:50"))
        assertEquals(40, calculateBreakDurationMinutes("12:25", "13:05"))

        val lessonMain = createSampleLesson("1", BuildingType.MAIN)
        val lessonMain2 = createSampleLesson("2", BuildingType.MAIN)
        val lessonSpartaka = createSampleLesson("3", BuildingType.SPARTAKA)

        // Same building -> no transition
        assertFalse(isBuildingTransition(lessonMain, lessonMain2))
        // Different buildings -> transition detected!
        assertTrue(isBuildingTransition(lessonMain, lessonSpartaka))
        assertTrue(isBuildingTransition(lessonSpartaka, lessonMain))
    }

    @Test
    fun testLiveIndicatorStateResolver() {
        val l1 = Lesson(
            id = "1",
            group = "Д-11",
            date = "2026-09-04",
            dayOfWeek = "Пятница",
            pairNumber = 1,
            timeStart = "09:00",
            timeEnd = "10:35",
            subject = "Живопись",
            teacher = "Иванов И. И.",
            room = "101",
            building = BuildingType.MAIN,
            buildingAddress = BuildingType.MAIN.address
        )

        val l2 = Lesson(
            id = "2",
            group = "Д-11",
            date = "2026-09-04",
            dayOfWeek = "Пятница",
            pairNumber = 2,
            timeStart = "10:50",
            timeEnd = "12:25",
            subject = "3D Моделирование",
            teacher = "Петров П. П.",
            room = "205",
            building = BuildingType.SPARTAKA,
            buildingAddress = BuildingType.SPARTAKA.address
        )

        val schedule = listOf(l1, l2)

        // 1. Before day starts (08:30)
        val beforeDay = resolveLiveIndicatorState(schedule, "08:30")
        assertTrue(beforeDay is LiveIndicatorState.DayUpcoming)
        assertEquals(30, (beforeDay as LiveIndicatorState.DayUpcoming).minutesUntilStart)

        // 2. During first lesson (09:45)
        val duringLesson1 = resolveLiveIndicatorState(schedule, "09:45")
        assertTrue(duringLesson1 is LiveIndicatorState.LessonActive)
        val activeLesson = (duringLesson1 as LiveIndicatorState.LessonActive)
        assertEquals("Живопись", activeLesson.lesson.subject)
        assertEquals(50, activeLesson.minutesRemaining)

        // 3. During break with campus switch (10:40)
        val duringBreak = resolveLiveIndicatorState(schedule, "10:40")
        assertTrue(duringBreak is LiveIndicatorState.BreakActive)
        val breakActive = (duringBreak as LiveIndicatorState.BreakActive)
        assertEquals("3D Моделирование", breakActive.nextLesson.subject)
        assertEquals(10, breakActive.minutesRemaining)
        assertTrue(breakActive.isCampusSwitch)

        // 4. After all lessons end (13:00)
        val afterDay = resolveLiveIndicatorState(schedule, "13:00")
        assertTrue(afterDay is LiveIndicatorState.DayFinished)

        // 5. Empty schedule
        val emptyState = resolveLiveIndicatorState(emptyList(), "10:00")
        assertTrue(emptyState is LiveIndicatorState.NoLessons)
    }

    @Test
    fun testExtractTeacherInitials() {
        assertEquals("ИИ", extractInitials("Иванов Иван Иванович"))
        assertEquals("ИИ", extractInitials("Иванов И. И."))
        assertEquals("ПА", extractInitials("Петрова Анна"))
        assertEquals("СИ", extractInitials("Сидоров"))
        assertEquals("", extractInitials(""))
        assertEquals("", extractInitials("   "))
    }

    @Test
    fun testGroupFiltering() {
        val groups = listOf(
            GroupItem("1", "Д-11", 1, "Дизайн"),
            GroupItem("2", "Д-21", 2, "Дизайн"),
            GroupItem("3", "А-11", 1, "Архитектура"),
            GroupItem("4", "Ж-31", 3, "Живопись"),
            GroupItem("5", "ГД-41", 4, "Графический дизайн")
        )

        // Course filter: 1st course only
        val course1 = filterGroups(groups, "", 1)
        assertEquals(2, course1.size)
        assertTrue(course1.all { it.course == 1 })

        // Search query Cyrillic: "дизайн"
        val designGroups = filterGroups(groups, "дизайн", 0)
        assertEquals(3, designGroups.size) // Д-11, Д-21, ГД-41

        // Search query + Course: "д-" on 2nd course
        val d2 = filterGroups(groups, "д-", 2)
        assertEquals(1, d2.size)
        assertEquals("Д-21", d2.first().name)

        // No match
        val noMatch = filterGroups(groups, "несуществующая", 0)
        assertTrue(noMatch.isEmpty())
    }

    private fun createSampleLesson(id: String, building: BuildingType): Lesson {
        return Lesson(
            id = id,
            group = "Д-11",
            date = "2026-09-04",
            dayOfWeek = "Пятница",
            pairNumber = 1,
            timeStart = "09:00",
            timeEnd = "10:35",
            subject = "Предмет",
            teacher = "Преподаватель",
            room = "101",
            building = building,
            buildingAddress = building.address
        )
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            val test = ColorAndCategoryTest()
            test.testCategoryColorMappingLight()
            println("✓ testCategoryColorMappingLight passed")
            test.testCategoryColorMappingDark()
            println("✓ testCategoryColorMappingDark passed")
            test.testBuildingBadgeColorsDifferentiation()
            println("✓ testBuildingBadgeColorsDifferentiation passed")
            test.testStatusColors()
            println("✓ testStatusColors passed")
            test.testProgressCalculations()
            println("✓ testProgressCalculations passed")
            test.testBreakDurationAndTransition()
            println("✓ testBreakDurationAndTransition passed")
            test.testLiveIndicatorStateResolver()
            println("✓ testLiveIndicatorStateResolver passed")
            test.testExtractTeacherInitials()
            println("✓ testExtractTeacherInitials passed")
            test.testGroupFiltering()
            println("✓ testGroupFiltering passed")
            println("ALL COLOR & CATEGORY TESTS PASSED SUCCESSFULLY!")
        }
    }
}
