package ru.nghu.timetable.ui.screens.schedule

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
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import kotlin.reflect.KClass

/**
 * ViewModel managing timetable schedule state, group picker, date selection,
 * and offline-first cache updates.
 */
class ScheduleViewModel(
    private val repository: ScheduleRepository,
    initialGroup: String = "Д-11"
) : ViewModel() {

    private val _uiState = MutableStateFlow(
        ScheduleUiState(
            isLoading = true,
            selectedGroup = initialGroup
        )
    )
    val uiState: StateFlow<ScheduleUiState> = _uiState.asStateFlow()

    private var scheduleJob: Job? = null

    init {
        observeAvailableGroups()
        loadSchedule(initialGroup)
    }

    /**
     * Continuously observes the available academic groups for the bottom sheet picker.
     */
    private fun observeAvailableGroups() {
        viewModelScope.launch {
            repository.getAllGroups()
                .catch { /* Keep existing groups on error */ }
                .collect { groups ->
                    _uiState.update { current ->
                        current.copy(availableGroups = groups)
                    }
                }
        }
    }

    /**
     * Loads schedule for the specified group with offline-first caching.
     */
    fun loadSchedule(group: String) {
        val normalizedGroup = group.trim()
        if (normalizedGroup.isBlank()) return

        scheduleJob?.cancel()
        _uiState.update { it.copy(isLoading = it.days.isEmpty(), selectedGroup = normalizedGroup) }

        scheduleJob = viewModelScope.launch {
            repository.getScheduleForGroup(normalizedGroup)
                .catch { exception ->
                    _uiState.update { current ->
                        current.copy(
                            isLoading = false,
                            isRefreshing = false,
                            isOffline = true,
                            errorMessage = if (current.days.isEmpty()) {
                                exception.localizedMessage ?: "Не удалось загрузить расписание"
                            } else null
                        )
                    }
                }
                .collect { result ->
                    result.fold(
                        onSuccess = { daysList ->
                            _uiState.update { current ->
                                val today = runCatching {
                                    LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
                                }.getOrDefault("")

                                // Keep selected date if present in new list, else pick today or first available
                                val updatedDate = when {
                                    daysList.any { it.date == current.selectedDate } -> current.selectedDate
                                    daysList.any { it.date == today } -> today
                                    else -> daysList.firstOrNull()?.date ?: ""
                                }

                                current.copy(
                                    isLoading = false,
                                    isRefreshing = false,
                                    days = daysList,
                                    selectedDate = updatedDate,
                                    errorMessage = null
                                )
                            }
                        },
                        onFailure = { exception ->
                            _uiState.update { current ->
                                current.copy(
                                    isLoading = false,
                                    isRefreshing = false,
                                    isOffline = true,
                                    errorMessage = if (current.days.isEmpty()) {
                                        exception.localizedMessage ?: "Ошибка сети"
                                    } else null
                                )
                            }
                        }
                    )
                }
        }
    }

    /**
     * Selects an academic group and reloads its schedule.
     */
    fun selectGroup(group: String) {
        if (_uiState.value.selectedGroup == group && _uiState.value.days.isNotEmpty()) {
            _uiState.update { it.copy(isGroupPickerVisible = false) }
            return
        }
        _uiState.update {
            it.copy(
                selectedGroup = group,
                isGroupPickerVisible = false,
                isLoading = true,
                errorMessage = null
            )
        }
        loadSchedule(group)
    }

    /**
     * Selects a date tab to display its lessons.
     */
    fun selectDate(date: String) {
        _uiState.update { it.copy(selectedDate = date) }
    }

    /**
     * Triggers a pull-to-refresh or explicit sync with backend.
     */
    fun refresh() {
        viewModelScope.launch {
            _uiState.update { it.copy(isRefreshing = true, errorMessage = null) }
            val refreshResult = repository.refreshBackend()
            refreshResult.fold(
                onSuccess = { meta ->
                    _uiState.update {
                        it.copy(
                            isRefreshing = false,
                            isOffline = false,
                            meta = meta
                        )
                    }
                    loadSchedule(_uiState.value.selectedGroup)
                },
                onFailure = {
                    // Refresh failed over network; keep cached data and notify
                    _uiState.update { current ->
                        current.copy(
                            isRefreshing = false,
                            isOffline = true,
                            errorMessage = if (current.days.isEmpty()) "Не удалось подключиться к серверу" else null
                        )
                    }
                    // Re-collect local database data
                    loadSchedule(_uiState.value.selectedGroup)
                }
            )
        }
    }

    fun showGroupPicker() {
        _uiState.update { it.copy(isGroupPickerVisible = true) }
    }

    fun hideGroupPicker() {
        _uiState.update { it.copy(isGroupPickerVisible = false) }
    }

    fun dismissError() {
        _uiState.update { it.copy(errorMessage = null) }
    }

    /**
     * Factory for creating [ScheduleViewModel] instances.
     */
    companion object {
        fun provideFactory(
            repository: ScheduleRepository,
            initialGroup: String = "Д-11"
        ): ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return ScheduleViewModel(repository, initialGroup) as T
            }

            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: KClass<T>, extras: CreationExtras): T {
                return ScheduleViewModel(repository, initialGroup) as T
            }
        }
    }
}
