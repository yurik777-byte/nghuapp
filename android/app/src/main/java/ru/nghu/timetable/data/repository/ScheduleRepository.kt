package ru.nghu.timetable.data.repository

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.channelFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import ru.nghu.timetable.data.local.LessonEntity
import ru.nghu.timetable.data.local.ScheduleDao
import ru.nghu.timetable.data.local.TimetableDatabase
import ru.nghu.timetable.data.local.parser.NghuPdfCoordinateParser
import ru.nghu.timetable.data.local.parser.NghuWebScraper
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
import java.util.Locale

/**
 * Repository orchestrating timetable data between local Room database,
 * direct on-device HTML/PDF scraping from nghu.ru, and remote Retrofit API.
 *
 * Primary mode: Standalone / Serverless on-device parser.
 * Fallback mode: Remote API if direct scraping fails or is unreachable.
 * Offline-first: Instant emission from Room SQLite database.
 */
class ScheduleRepository(
    private val api: ScheduleApi,
    private val scheduleDao: ScheduleDao,
    private val context: Context? = null,
    private val scraper: NghuWebScraper = NghuWebScraper(),
    private val pdfParser: NghuPdfCoordinateParser = NghuPdfCoordinateParser()
) {
    private val syncMutex = Mutex()
    private var lastDirectSyncTimeMs = 0L
    private val SYNC_COOLDOWN_MS = 24 * 60 * 60 * 1000L // 24 hours cooldown (once a day)

    /**
     * Performs a direct download and coordinate PDF parse from https://nghu.ru/students/timetable/.
     * Populates all 24 groups across both pages directly into Room SQLite.
     */
    suspend fun syncDirectlyFromNghu(force: Boolean = false): Result<Int> = withContext(Dispatchers.IO) {
        syncMutex.withLock {
            val now = System.currentTimeMillis()
            if (!force && (now - lastDirectSyncTimeMs) < SYNC_COOLDOWN_MS) {
                val cachedCount = scheduleDao.getAllLessons().firstOrNull()?.size ?: 0
                if (cachedCount > 0) {
                    return@withContext Result.success(cachedCount)
                }
            }

            runCatching {
                val pdfList = scraper.fetchAllActiveTimetablePdfs()
                val allParsedLessons = mutableListOf<LessonEntity>()
                val seenLessonIds = mutableSetOf<String>()

                for ((pdfBytes, _) in pdfList) {
                    val lessons = pdfParser.parsePdf(pdfBytes, context)
                    for (l in lessons) {
                        if (seenLessonIds.add(l.id)) {
                            allParsedLessons.add(l)
                        }
                    }
                }

                if (allParsedLessons.isNotEmpty()) {
                    scheduleDao.replaceAllLessons(allParsedLessons)
                    lastDirectSyncTimeMs = System.currentTimeMillis()
                }
                allParsedLessons.size
            }
        }
    }

    /**
     * Observes schedule for a specific academic group with offline-first caching.
     * Emits locally cached [DaySchedule] immediately (or empty list if empty), then triggers
     * direct on-device parsing from nghu.ru (or backend API fallback) and updates Room cache.
     */
    fun getScheduleForGroup(group: String): Flow<Result<List<DaySchedule>>> = channelFlow {
        val groupLower = group.trim().lowercase(Locale.ROOT)

        // 1. Immediately emit cached data from Room DB (even if empty to prevent UI hang)
        val dbJob = launch {
            scheduleDao.getLessonsForGroup(groupLower).collect { entities ->
                val days = groupEntitiesIntoDays(entities)
                send(Result.success(days))
            }
        }

        // 2. Concurrently sync directly from NGHU in background
        launch {
            try {
                syncDirectlyFromNghu(force = false)
            } catch (e: Exception) {
                // Direct scraping failed: try remote API as fallback
                try {
                    val response = api.getSchedule(group = group)
                    val remoteEntities = response.days.flatMap { day ->
                        day.lessons.map { it.toEntity() }
                    }
                    scheduleDao.replaceLessonsForGroup(groupLower, remoteEntities)
                } catch (fallbackEx: Exception) {
                    val cached = scheduleDao.getLessonsForGroup(groupLower).firstOrNull()
                    if (cached.isNullOrEmpty()) {
                        send(Result.failure(e))
                    }
                }
            }
        }
    }

    /**
     * Observes classroom occupancy and schedules across campuses with offline fallback.
     * Emits immediately from cache (or empty list if empty), then updates from direct sync or live network.
     */
    fun getAllRooms(): Flow<List<RoomItem>> = channelFlow {
        // 1. Emit computed rooms from Room DB immediately
        launch {
            scheduleDao.getAllLessons().collect { entities ->
                val localRooms = computeRoomItemsFromEntities(entities)
                send(localRooms)
            }
        }

        // 2. Direct sync in background if needed
        launch {
            try {
                syncDirectlyFromNghu(force = false)
            } catch (_: Exception) {
                try {
                    val remoteRooms = api.getRooms()
                    send(remoteRooms.map { it.toDomain() })
                } catch (_: Exception) {
                    val cached = scheduleDao.getAllLessons().firstOrNull()
                    if (cached.isNullOrEmpty()) {
                        send(emptyList())
                    }
                }
            }
        }
    }

    /**
     * Observes teachers, their disciplines, and timetable with offline fallback.
     * Emits immediately from cache (or empty list if empty), then updates from direct sync or live network.
     */
    fun getAllTeachers(): Flow<List<TeacherItem>> = channelFlow {
        // 1. Emit computed teachers from Room DB immediately
        launch {
            scheduleDao.getAllLessons().collect { entities ->
                val localTeachers = computeTeacherItemsFromEntities(entities)
                send(localTeachers)
            }
        }

        // 2. Direct sync in background if needed
        launch {
            try {
                syncDirectlyFromNghu(force = false)
            } catch (_: Exception) {
                try {
                    val remoteTeachers = api.getTeachers()
                    send(remoteTeachers.map { it.toDomain() })
                } catch (_: Exception) {
                    val cached = scheduleDao.getAllLessons().firstOrNull()
                    if (cached.isNullOrEmpty()) {
                        send(emptyList())
                    }
                }
            }
        }
    }

    /**
     * Observes all academic groups. Emits groups from Room or remote API.
     */
    fun getAllGroups(): Flow<List<GroupItem>> = channelFlow {
        // 1. Emit groups discovered in Room DB
        launch {
            scheduleDao.getAllGroupNames().collect { groupNames ->
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

        // 2. Direct sync in background if needed
        launch {
            try {
                syncDirectlyFromNghu(force = false)
            } catch (_: Exception) {
                try {
                    val remoteGroups = api.getGroups()
                    send(remoteGroups.map { it.toDomain() })
                } catch (_: Exception) {
                    val cached = scheduleDao.getAllGroupNames().firstOrNull()
                    if (cached.isNullOrEmpty()) {
                        send(emptyList())
                    }
                }
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
     * Observes timetable for a specific teacher with Cyrillic case-insensitive match.
     */
    fun getScheduleForTeacher(teacher: String): Flow<List<DaySchedule>> {
        val teacherLower = teacher.trim().lowercase(Locale.ROOT)
        return scheduleDao.getLessonsForTeacher(teacherLower).map { entities ->
            groupEntitiesIntoDays(entities)
        }
    }

    /**
     * Syncs full timetable for all groups from official site or remote backend and populates Room DB.
     */
    suspend fun syncAllSchedule(): Result<Unit> = withContext(Dispatchers.IO) {
        runCatching {
            val directResult = syncDirectlyFromNghu(force = true)
            if (directResult.isSuccess && (directResult.getOrNull() ?: 0) > 0) {
                lastDirectSyncTimeMs = System.currentTimeMillis()
                Unit
            } else {
                val response = api.getSchedule()
                val allEntities = response.days.flatMap { day ->
                    day.lessons.map { it.toEntity() }
                }
                scheduleDao.replaceAllLessons(allEntities)
                Unit
            }
        }
    }


    /**
     * Requests refresh of timetable data (directly parsing official site first, falling back to backend).
     */
    suspend fun refreshBackend(): Result<TimetableMeta> = withContext(Dispatchers.IO) {
        runCatching {
            val directResult = syncDirectlyFromNghu(force = true)
            if (directResult.isSuccess && (directResult.getOrNull() ?: 0) > 0) {
                lastDirectSyncTimeMs = System.currentTimeMillis()
                TimetableMeta(
                    title = "Расписание занятий НГХУ",
                    period = "",
                    semester = "",
                    updatedAt = LocalDate.now().toString(),
                    sourceUrl = NghuWebScraper.NGHU_TIMETABLE_PAGE_URL
                )
            } else {
                try {
                    syncAllSchedule().getOrThrow()
                    api.getMeta().toDomain()
                } catch (_: Exception) {
                    throw directResult.exceptionOrNull() ?: IllegalStateException("Не удалось обновить расписание")
                }
            }
        }
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
                    scheduleDao = TimetableDatabase.getInstance(context).scheduleDao(),
                    context = context.applicationContext
                ).also { INSTANCE = it }
            }
        }

        internal fun computeRoomItemsFromEntities(
            entities: List<LessonEntity>,
            testToday: String? = null,
            testNow: String? = null
        ): List<RoomItem> {
            val today = testToday ?: runCatching {
                LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
            }.getOrDefault("")

            val now = testNow ?: runCatching {
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

                    // Determine the last completed lesson in this room
                    val pastLessons = allDomain.filter { lesson ->
                        when {
                            today.isNotBlank() && lesson.date.isNotBlank() -> {
                                lesson.date < today || (lesson.date == today && (now.isBlank() || now > lesson.timeEnd))
                            }
                            now.isNotBlank() && lesson.timeEnd.isNotBlank() -> {
                                now > lesson.timeEnd
                            }
                            else -> false
                        }
                    }
                    val lastLesson = pastLessons.maxWithOrNull(compareBy({ it.date }, { it.pairNumber }))

                    RoomItem(
                        room = roomNumber,
                        building = building,
                        buildingAddress = address,
                        isOccupied = currentLesson != null,
                        currentLesson = currentLesson,
                        nextLesson = nextLesson,
                        lastLesson = lastLesson,
                        daySchedule = todayLessons,
                        allLessons = allDomain
                    )
                }
                .sortedWith(compareBy({ it.building }, { it.room }))
        }
    }
}
