package ru.nghu.timetable.data.repository

import android.content.Context
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.channelFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import ru.nghu.timetable.data.local.LessonEntity
import ru.nghu.timetable.data.local.ScheduleDao
import ru.nghu.timetable.data.local.TimetableDatabase
import ru.nghu.timetable.data.local.toEntity
import ru.nghu.timetable.data.remote.NetworkClient
import ru.nghu.timetable.data.remote.ScheduleApi
import ru.nghu.timetable.domain.model.BuildingType
import ru.nghu.timetable.domain.model.DaySchedule
import ru.nghu.timetable.domain.model.GroupItem
import ru.nghu.timetable.domain.model.RoomItem
import ru.nghu.timetable.domain.model.TeacherItem
import ru.nghu.timetable.domain.model.TimetableMeta
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter

/**
 * Repository orchestrating timetable data between local Room database and remote Retrofit API.
 * Implements an Offline-First strategy:
 * 1. Reads local Room DB for instant display.
 * 2. Syncs with backend API over network and updates Room cache.
 * 3. Provides continuous reactive flows for groups, rooms, and teachers.
 */
class ScheduleRepository(
    private val api: ScheduleApi,
    private val scheduleDao: ScheduleDao
) {

    /**
     * Observes schedule for a specific academic group with offline-first caching.
     * Emits locally cached [DaySchedule] immediately, then triggers remote network sync
     * and emits updated data as soon as the cache refreshes.
     */
    fun getScheduleForGroup(group: String): Flow<Result<List<DaySchedule>>> = channelFlow {
        // 1. Immediately emit cached data from Room DB
        val dbJob = launch {
            scheduleDao.getLessonsForGroup(group).collect { entities ->
                if (entities.isNotEmpty()) {
                    val days = groupEntitiesIntoDays(entities)
                    send(Result.success(days))
                }
            }
        }

        // 2. Concurrently sync with backend API in background
        launch {
            try {
                val response = api.getSchedule(group = group)
                val remoteEntities = response.days.flatMap { day ->
                    day.lessons.map { it.toEntity() }
                }

                if (remoteEntities.isNotEmpty()) {
                    scheduleDao.replaceLessonsForGroup(group, remoteEntities)
                } else {
                    // Check if local cache was also empty
                    val cached = scheduleDao.getLessonsForGroup(group).firstOrNull()
                    if (cached.isNullOrEmpty()) {
                        send(Result.success(emptyList()))
                    }
                }
            } catch (e: Exception) {
                // Network failed: if local cache was empty, notify subscriber of failure
                val cached = scheduleDao.getLessonsForGroup(group).firstOrNull()
                if (cached.isNullOrEmpty()) {
                    send(Result.failure(e))
                }
            }
        }
    }

    /**
     * Observes classroom occupancy and schedules across campuses with offline fallback.
     */
    fun getAllRooms(): Flow<List<RoomItem>> = channelFlow {
        // 1. Emit computed rooms from Room DB immediately
        launch {
            scheduleDao.getAllLessons().collect { entities ->
                if (entities.isNotEmpty()) {
                    val localRooms = computeRoomItemsFromEntities(entities)
                    send(localRooms)
                }
            }
        }

        // 2. Fetch live occupancy from backend API
        launch {
            try {
                val remoteRooms = api.getRooms()
                if (remoteRooms.isNotEmpty()) {
                    send(remoteRooms.map { it.toDomain() })
                }
            } catch (_: Exception) {
                // Offline fallback handled by local Room flow
            }
        }
    }

    /**
     * Observes teachers, their disciplines, and timetable with offline fallback.
     */
    fun getAllTeachers(): Flow<List<TeacherItem>> = channelFlow {
        // 1. Emit computed teachers from Room DB immediately
        launch {
            scheduleDao.getAllLessons().collect { entities ->
                if (entities.isNotEmpty()) {
                    val localTeachers = computeTeacherItemsFromEntities(entities)
                    send(localTeachers)
                }
            }
        }

        // 2. Fetch enriched teachers from backend API
        launch {
            try {
                val remoteTeachers = api.getTeachers()
                if (remoteTeachers.isNotEmpty()) {
                    send(remoteTeachers.map { it.toDomain() })
                }
            } catch (_: Exception) {
                // Offline fallback handled by local Room flow
            }
        }
    }

    /**
     * Observes all academic groups. Emits groups from API or falls back to distinct groups in Room.
     */
    fun getAllGroups(): Flow<List<GroupItem>> = channelFlow {
        // 1. Emit groups discovered in Room DB
        launch {
            scheduleDao.getAllGroupNames().collect { groupNames ->
                if (groupNames.isNotEmpty()) {
                    val localGroupItems = groupNames.map { name ->
                        GroupItem(
                            id = name,
                            name = name,
                            course = parseCourseFromName(name),
                            department = parseDepartmentFromName(name)
                        )
                    }
                    send(localGroupItems)
                }
            }
        }

        // 2. Fetch full group metadata from API
        launch {
            try {
                val remoteGroups = api.getGroups()
                if (remoteGroups.isNotEmpty()) {
                    send(remoteGroups.map { it.toDomain() })
                }
            } catch (_: Exception) {
                // Offline fallback handled by local Room flow
            }
        }
    }

    /**
     * Observes timetable for a specific classroom.
     */
    fun getScheduleForRoom(room: String): Flow<List<DaySchedule>> {
        return scheduleDao.getLessonsForRoom(room).map { entities ->
            groupEntitiesIntoDays(entities)
        }
    }

    /**
     * Observes timetable for a specific teacher.
     */
    fun getScheduleForTeacher(teacher: String): Flow<List<DaySchedule>> {
        return scheduleDao.getLessonsForTeacher(teacher).map { entities ->
            groupEntitiesIntoDays(entities)
        }
    }

    /**
     * Syncs full timetable for all groups from remote backend and populates Room DB.
     */
    suspend fun syncAllSchedule(): Result<Unit> = runCatching {
        val response = api.getSchedule()
        val allEntities = response.days.flatMap { day ->
            day.lessons.map { it.toEntity() }
        }
        if (allEntities.isNotEmpty()) {
            scheduleDao.replaceAllLessons(allEntities)
        }
    }

    /**
     * Requests server-side refresh and re-parsing of timetable, then updates local cache.
     */
    suspend fun refreshBackend(): Result<TimetableMeta> = runCatching {
        val refreshRes = api.refresh()
        syncAllSchedule().getOrThrow()
        refreshRes.meta?.toDomain() ?: api.getMeta().toDomain()
    }

    // --- Private Helper Methods ---

    private fun groupEntitiesIntoDays(entities: List<LessonEntity>): List<DaySchedule> {
        return entities
            .groupBy { it.date }
            .toSortedMap()
            .map { (date, dayEntities) ->
                val sortedLessons = dayEntities
                    .map { it.toDomain() }
                    .sortedBy { it.pairNumber }

                val dayOfWeek = sortedLessons.firstOrNull()?.dayOfWeek ?: ""
                DaySchedule(
                    date = date,
                    dayOfWeek = dayOfWeek,
                    lessons = sortedLessons
                )
            }
    }

    private fun computeRoomItemsFromEntities(entities: List<LessonEntity>): List<RoomItem> {
        val today = runCatching {
            LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
        }.getOrDefault("")

        val now = runCatching {
            LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"))
        }.getOrDefault("")

        return entities
            .filter { it.room.isNotBlank() }
            .groupBy { "${it.building}:${it.room}" }
            .map { (_, roomEntities) ->
                val first = roomEntities.first()
                val building = BuildingType.fromString(first.building)
                val roomNumber = first.room
                val address = first.buildingAddress.ifBlank { building.address }

                val allDomain = roomEntities
                    .map { it.toDomain() }
                    .sortedWith(compareBy({ it.date }, { it.pairNumber }))

                val todayLessons = allDomain.filter { it.date == today }
                val currentLesson = todayLessons.firstOrNull { now >= it.timeStart && now <= it.timeEnd }
                val nextLesson = todayLessons.firstOrNull { it.timeStart > now }

                RoomItem(
                    room = roomNumber,
                    building = building,
                    buildingAddress = address,
                    isOccupied = currentLesson != null,
                    currentLesson = currentLesson,
                    nextLesson = nextLesson,
                    daySchedule = todayLessons,
                    allLessons = allDomain
                )
            }
            .sortedWith(compareBy({ it.building }, { it.room }))
    }

    private fun computeTeacherItemsFromEntities(entities: List<LessonEntity>): List<TeacherItem> {
        return entities
            .filter { it.teacher.isNotBlank() }
            .groupBy { it.teacher }
            .map { (teacher, teacherEntities) ->
                val subjects = teacherEntities
                    .map { it.subject }
                    .filter { it.isNotBlank() }
                    .distinct()
                    .sorted()

                val lessons = teacherEntities
                    .map { it.toDomain() }
                    .sortedWith(compareBy({ it.date }, { it.pairNumber }))

                TeacherItem(
                    teacher = teacher,
                    subjects = subjects,
                    lessons = lessons
                )
            }
            .sortedBy { it.teacher }
    }

    private fun parseCourseFromName(groupName: String): Int {
        val match = Regex("""-(\d)""").find(groupName)
        return match?.groupValues?.get(1)?.toIntOrNull() ?: 1
    }

    private fun parseDepartmentFromName(groupName: String): String {
        return when {
            groupName.startsWith("Д", ignoreCase = true) -> "Дизайн"
            groupName.startsWith("Ж", ignoreCase = true) -> "Живопись"
            groupName.startsWith("Т", ignoreCase = true) -> "Театрально-декорационное искусство"
            else -> "Отделение"
        }
    }

    companion object {
        @Volatile
        private var INSTANCE: ScheduleRepository? = null

        fun getInstance(
            context: Context,
            api: ScheduleApi = NetworkClient.api
        ): ScheduleRepository {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: ScheduleRepository(
                    api = api,
                    scheduleDao = TimetableDatabase.getInstance(context).scheduleDao()
                ).also { INSTANCE = it }
            }
        }
    }
}
