package ru.nghu.timetable.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import kotlinx.coroutines.flow.Flow

/**
 * Room Data Access Object for timetable lessons.
 * Provides Flow-based reactive queries and atomic cache replacement transactions.
 */
@Dao
interface ScheduleDao {

    /**
     * Observes all scheduled lessons for a given academic group, ordered chronologically.
     */
    @Query("SELECT * FROM lessons WHERE LOWER(groupName) = LOWER(:group) ORDER BY date ASC, pairNumber ASC")
    fun getLessonsForGroup(group: String): Flow<List<LessonEntity>>

    /**
     * Observes scheduled lessons for a group on a specific date (YYYY-MM-DD).
     */
    @Query("SELECT * FROM lessons WHERE LOWER(groupName) = LOWER(:group) AND date = :date ORDER BY pairNumber ASC")
    fun getLessonsForGroupAndDate(group: String, date: String): Flow<List<LessonEntity>>

    /**
     * Observes all lessons scheduled in a given room/classroom.
     */
    @Query("SELECT * FROM lessons WHERE LOWER(room) = LOWER(:room) ORDER BY date ASC, pairNumber ASC")
    fun getLessonsForRoom(room: String): Flow<List<LessonEntity>>

    /**
     * Observes all lessons taught by a teacher matching query substring.
     */
    @Query("SELECT * FROM lessons WHERE LOWER(teacher) LIKE '%' || LOWER(:teacherQuery) || '%' ORDER BY date ASC, pairNumber ASC")
    fun getLessonsForTeacher(teacherQuery: String): Flow<List<LessonEntity>>

    /**
     * Observes all cached lessons in the database.
     */
    @Query("SELECT * FROM lessons ORDER BY date ASC, pairNumber ASC")
    fun getAllLessons(): Flow<List<LessonEntity>>

    /**
     * Non-flow synchronous read of all lessons for one-off operations.
     */
    @Query("SELECT * FROM lessons ORDER BY date ASC, pairNumber ASC")
    suspend fun getAllLessonsList(): List<LessonEntity>

    /**
     * Observes all distinct academic group names present in local storage.
     */
    @Query("SELECT DISTINCT groupName FROM lessons WHERE groupName != '' ORDER BY groupName ASC")
    fun getAllGroupNames(): Flow<List<String>>

    /**
     * Observes all distinct classroom codes present in local storage.
     */
    @Query("SELECT DISTINCT room FROM lessons WHERE room != '' ORDER BY room ASC")
    fun getAllRooms(): Flow<List<String>>

    /**
     * Observes all distinct teacher names present in local storage.
     */
    @Query("SELECT DISTINCT teacher FROM lessons WHERE teacher != '' ORDER BY teacher ASC")
    fun getAllTeachers(): Flow<List<String>>

    /**
     * Inserts or replaces a list of lessons into the cache.
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLessons(lessons: List<LessonEntity>)

    /**
     * Deletes cached lessons for a specific group.
     */
    @Query("DELETE FROM lessons WHERE LOWER(groupName) = LOWER(:group)")
    suspend fun deleteLessonsForGroup(group: String)

    /**
     * Clears all cached lessons from the database.
     */
    @Query("DELETE FROM lessons")
    suspend fun clearAllLessons()

    /**
     * Atomically replaces cached lessons for a specific group.
     */
    @Transaction
    suspend fun replaceLessonsForGroup(group: String, lessons: List<LessonEntity>) {
        deleteLessonsForGroup(group)
        insertLessons(lessons)
    }

    /**
     * Atomically replaces all cached lessons in the database.
     */
    @Transaction
    suspend fun replaceAllLessons(lessons: List<LessonEntity>) {
        clearAllLessons()
        insertLessons(lessons)
    }
}
