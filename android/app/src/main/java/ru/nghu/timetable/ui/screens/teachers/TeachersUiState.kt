package ru.nghu.timetable.ui.screens.teachers

import ru.nghu.timetable.domain.model.TeacherItem
import java.util.Locale

/**
 * UI State for the Teachers screen.
 */
data class TeachersUiState(
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val teachers: List<TeacherItem> = emptyList(),
    val searchQuery: String = "",
    val expandedTeacherName: String? = null,
    val isOffline: Boolean = false,
    val errorMessage: String? = null
) {
    /**
     * Filtered list of teachers matching name or subjects taught.
     */
    val filteredTeachers: List<TeacherItem>
        get() {
            val query = searchQuery.trim().lowercase(Locale.ROOT)
            return if (query.isEmpty()) {
                teachers
            } else {
                teachers.filter { teacher ->
                    teacher.teacher.lowercase(Locale.ROOT).contains(query) ||
                            teacher.subjects.any { it.lowercase(Locale.ROOT).contains(query) }
                }
            }
        }

    /**
     * Teachers grouped alphabetically by the first letter of their last name.
     */
    val groupedByAlphabet: Map<Char, List<TeacherItem>>
        get() = filteredTeachers
            .groupBy { it.teacher.trim().firstOrNull()?.uppercaseChar() ?: '#' }
            .toSortedMap()

    val totalTeachersCount: Int get() = filteredTeachers.size
}
