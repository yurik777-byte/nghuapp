package ru.nghu.timetable.ui.screens.rooms

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
import ru.nghu.timetable.domain.model.BuildingType
import kotlin.reflect.KClass

/**
 * ViewModel managing classroom availability, real-time occupancy status,
 * building filters, and offline fallback.
 */
class RoomsViewModel(
    private val repository: ScheduleRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(RoomsUiState(isLoading = true))
    val uiState: StateFlow<RoomsUiState> = _uiState.asStateFlow()

    private var roomsJob: Job? = null

    init {
        loadRooms()
    }

    /**
     * Observes classrooms from repository with offline cache support.
     * Cancels any prior observer job before launching a new collection.
     */
    fun loadRooms() {
        roomsJob?.cancel()
        _uiState.update { it.copy(isLoading = it.rooms.isEmpty()) }

        roomsJob = viewModelScope.launch {
            repository.getAllRooms()
                .catch { exception ->
                    _uiState.update { current ->
                        current.copy(
                            isLoading = false,
                            isRefreshing = false,
                            isOffline = true,
                            errorMessage = if (current.rooms.isEmpty()) {
                                exception.localizedMessage ?: "Не удалось загрузить аудитории"
                            } else null
                        )
                    }
                }
                .collect { roomList ->
                    _uiState.update { current ->
                        current.copy(
                            isLoading = false,
                            isRefreshing = false,
                            rooms = roomList,
                            isOffline = if (roomList.isNotEmpty()) false else current.isOffline,
                            errorMessage = null
                        )
                    }
                }

        }
    }

    /**
     * Updates real-time search query for room number, subject, or teacher.
     */
    fun updateSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }

    /**
     * Filters classrooms by building (null = "Все", MAIN, SPARTAKA).
     */
    fun selectBuilding(building: BuildingType?) {
        _uiState.update { it.copy(selectedBuilding = building) }
    }

    /**
     * Expands or collapses a classroom card to view today's schedule.
     */
    fun toggleRoomExpand(roomKey: String) {
        _uiState.update { current ->
            val next = if (current.expandedRoomKey == roomKey) null else roomKey
            current.copy(expandedRoomKey = next)
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
                            isOffline = current.rooms.isEmpty(),
                            errorMessage = if (current.rooms.isEmpty()) "Не удалось подключиться к сайту НГХУ" else null
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
                    return RoomsViewModel(repository) as T
                }

                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: KClass<T>, extras: CreationExtras): T {
                    return RoomsViewModel(repository) as T
                }
            }
    }
}
