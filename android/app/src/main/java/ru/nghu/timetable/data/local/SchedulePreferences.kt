package ru.nghu.timetable.data.local

import android.content.Context
import android.content.SharedPreferences

/**
 * Persists user preferences such as default academic group.
 */
class SchedulePreferences(context: Context) {

    private val prefs: SharedPreferences =
        context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    var savedGroup: String?
        get() = prefs.getString(KEY_SAVED_GROUP, null)
        set(value) {
            prefs.edit().putString(KEY_SAVED_GROUP, value).apply()
        }

    val isFirstLaunch: Boolean
        get() = savedGroup.isNullOrBlank()

    companion object {
        private const val PREFS_NAME = "nghu_schedule_preferences"
        private const val KEY_SAVED_GROUP = "key_saved_group"
    }
}
