package ru.nghu.timetable.ui.screens.teachers

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.CreationExtras
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ru.nghu.timetable.data.repository.ScheduleRepository
import kotlin.reflect.KClass

/**
 * ViewModel managing the teacher directory, real-time search,
 * alphabetical grouping, and expandable timetable view.
 */
class TeachersViewModel(
    private val repository: ScheduleRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(TeachersUiState(isLoading = true))
    val uiState: StateFlow<TeachersUiState> = _uiState.asStateFlow()

    private var teachersJob: Job? = null

    init {
        loadTeachers()
    }

    /**
     * Observes teachers from repository with offline cache support.
     * Cancels any prior observer job before launching a new collection.
     */
    fun loadTeachers() {
        teachersJob?.cancel()
        _uiState.update { it.copy(isLoading = it.teachers.isEmpty()) }

        teachersJob = viewModelScope.launch {
            repository.getAllTeachers()
                .catch { exception ->
                    _uiState.update { current ->
                        current.copy(
                            isLoading = false,
                            isRefreshing = false,
                            isOffline = true,
                            errorMessage = if (current.teachers.isEmpty()) {
                                exception.localizedMessage ?: "Не удалось загрузить преподавателей"
                            } else null
                        )
                    }
                }
                .collect { teacherList ->
                    _uiState.update { current ->
                        current.copy(
                            isLoading = false,
                            isRefreshing = false,
                            teachers = teacherList,
                            errorMessage = null
                        )
                    }
                }
        }
    }

    /**
     * Updates real-time search query matching teacher name or disciplines.
     */
    fun updateSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }

    /**
     * Expands or collapses a teacher card to view their scheduled lessons.
     */
    fun toggleTeacherExpanded(teacherName: String) {
        _uiState.update { current ->
            val next = if (current.expandedTeacherName == teacherName) null else teacherName
            current.copy(expandedTeacherName = next)
        }
    }

    /**
     * Pull-to-refresh or explicit refresh.
     * Triggers remote sync; Room DB reactive flow automatically emits updated data.
     */
    fun refresh() {
        viewModelScope.launch {
            _uiState.update { it.copy(isRefreshing = true, errorMessage = null) }
            val syncResult = repository.syncAllSchedule()
            syncResult.fold(
                onSuccess = {
                    _uiState.update { it.copy(isRefreshing = false, isOffline = false) }
                },
                onFailure = {
                    _uiState.update { current ->
                        current.copy(
                            isRefreshing = false,
                            isOffline = true,
                            errorMessage = if (current.teachers.isEmpty()) "Не удалось подключиться к серверу" else null
                        )
                    }
                }
            )
        }
    }

    fun dismissError() {
        _uiState.update { it.copy(errorMessage = null) }
    }

    companion object {
        fun provideFactory(repository: ScheduleRepository): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return TeachersViewModel(repository) as T
                }

                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: KClass<T>, extras: CreationExtras): T {
                    return TeachersViewModel(repository) as T
                }
            }
    }
}
