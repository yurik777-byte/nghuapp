package ru.nghu.timetable.data.remote

import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query
import ru.nghu.timetable.data.remote.dto.GroupInfoDto
import ru.nghu.timetable.data.remote.dto.RefreshResponseDto
import ru.nghu.timetable.data.remote.dto.RoomOccupancyDto
import ru.nghu.timetable.data.remote.dto.ScheduleResponseDto
import ru.nghu.timetable.data.remote.dto.TeacherScheduleDto
import ru.nghu.timetable.data.remote.dto.TimetableMetaDto

/**
 * Retrofit interface for NGHU Timetable backend API.
 */
interface ScheduleApi {

    /**
     * Fetches timetable metadata (title, semester, period, updatedAt, sourceUrl)
     */
    @GET("api/meta")
    suspend fun getMeta(): TimetableMetaDto

    /**
     * Fetches schedule, optionally filtered by group name and/or date (YYYY-MM-DD)
     */
    @GET("api/schedule")
    suspend fun getSchedule(
        @Query("group") group: String? = null,
        @Query("date") date: String? = null
    ): ScheduleResponseDto

    /**
     * Fetches list of all academic groups with course and department metadata
     */
    @GET("api/groups")
    suspend fun getGroups(): List<GroupInfoDto>

    /**
     * Fetches real-time classroom occupancy and schedule, optionally filtered by building and time
     */
    @GET("api/rooms")
    suspend fun getRooms(
        @Query("building") building: String? = null,
        @Query("date") date: String? = null,
        @Query("time") time: String? = null
    ): List<RoomOccupancyDto>

    /**
     * Fetches teachers with their disciplines and scheduled lessons
     */
    @GET("api/teachers")
    suspend fun getTeachers(
        @Query("name") name: String? = null,
        @Query("teacher") teacher: String? = null
    ): List<TeacherScheduleDto>

    /**
     * Forces the server to scrape and re-parse the latest PDF timetable
     */
    @POST("api/refresh")
    suspend fun refresh(): RefreshResponseDto
}
