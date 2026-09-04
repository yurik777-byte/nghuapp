package ru.nghu.timetable.ui.screens.schedule

import ru.nghu.timetable.domain.model.DaySchedule
import ru.nghu.timetable.domain.model.GroupItem
import ru.nghu.timetable.domain.model.Lesson
import ru.nghu.timetable.domain.model.TimetableMeta
import ru.nghu.timetable.ui.components.DayTabItem
import ru.nghu.timetable.ui.components.LiveIndicatorState
import ru.nghu.timetable.ui.components.buildDayTabs
import ru.nghu.timetable.ui.components.resolveLiveIndicatorState
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter

/**
 * UI State for the main Schedule screen.
 */
data class ScheduleUiState(
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val selectedGroup: String = "Д-11",
    val availableGroups: List<GroupItem> = emptyList(),
    val days: List<DaySchedule> = emptyList(),
    val selectedDate: String = "",
    val isGroupPickerVisible: Boolean = false,
    val isOffline: Boolean = false,
    val errorMessage: String? = null,
    val meta: TimetableMeta? = null
) {
    /**
     * Currently active day schedule matching [selectedDate], or first day if not matched.
     */
    val currentDaySchedule: DaySchedule?
        get() = days.firstOrNull { it.date == selectedDate } ?: days.firstOrNull()

    /**
     * List of scheduled lessons for the selected day.
     */
    val currentDayLessons: List<Lesson>
        get() = currentDaySchedule?.lessons ?: emptyList()

    /**
     * Day tabs for the horizontal DaySelector.
     */
    val dayTabs: List<DayTabItem>
        get() = buildDayTabs(days)

    /**
     * Real-time status for the live progress indicator widget.
     */
    fun resolveCurrentLiveState(currentTime: String? = null): LiveIndicatorState {
        val today = runCatching {
            LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
        }.getOrDefault("")

        val effectiveTime = currentTime ?: runCatching {
            LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"))
        }.getOrDefault("10:00")

        return if (selectedDate.isNotBlank() && selectedDate != today) {
            resolveLiveIndicatorState(currentDayLessons, effectiveTime)
        } else {
            resolveLiveIndicatorState(currentDayLessons, effectiveTime)
        }
    }
}
