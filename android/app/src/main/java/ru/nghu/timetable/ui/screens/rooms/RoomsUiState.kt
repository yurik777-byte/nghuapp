package ru.nghu.timetable.ui.screens.rooms

import ru.nghu.timetable.domain.model.BuildingType
import ru.nghu.timetable.domain.model.RoomItem
import java.util.Locale

/**
 * UI State for the Classrooms / Rooms screen.
 */
data class RoomsUiState(
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val rooms: List<RoomItem> = emptyList(),
    val searchQuery: String = "",
    val selectedBuilding: BuildingType? = null,
    val expandedRoomKey: String? = null,
    val isOffline: Boolean = false,
    val errorMessage: String? = null
) {
    /**
     * Filtered list of rooms based on building filter chip and search query.
     */
    val filteredRooms: List<RoomItem>
        get() = rooms.filter { room ->
            val matchesBuilding = selectedBuilding == null || room.building == selectedBuilding
            val query = searchQuery.trim().lowercase(Locale.ROOT)
            val matchesSearch = query.isEmpty() ||
                    room.room.lowercase(Locale.ROOT).contains(query) ||
                    room.buildingAddress.lowercase(Locale.ROOT).contains(query) ||
                    room.currentLesson?.subject?.lowercase(Locale.ROOT)?.contains(query) == true ||
                    room.currentLesson?.teacher?.lowercase(Locale.ROOT)?.contains(query) == true ||
                    room.currentLesson?.group?.lowercase(Locale.ROOT)?.contains(query) == true

            matchesBuilding && matchesSearch
        }

    val totalRoomsCount: Int get() = filteredRooms.size
    val occupiedCount: Int get() = filteredRooms.count { it.isOccupied }
    val freeCount: Int get() = filteredRooms.count { !it.isOccupied }

    val mainBuildingCount: Int get() = rooms.count { it.building == BuildingType.MAIN }
    val spartakaBuildingCount: Int get() = rooms.count { it.building == BuildingType.SPARTAKA }
}
