package ru.nghu.timetable.data.remote

import retrofit2.converter.kotlinx.serialization.asConverterFactory
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit

/**
 * Networking singleton and factory providing configured Retrofit instances
 * and the [ScheduleApi] service.
 */
object NetworkClient {

    /**
     * Default base URL pointing to the production Aeza VPS backend.
     */
    const val DEFAULT_BASE_URL = "https://nghuapp.duckdns.org/"

    /**
     * Mutable base URL in case the user configures a physical device host IP or production domain.
     */
    @Volatile
    var currentBaseUrl: String = DEFAULT_BASE_URL
        private set

    /**
     * Kotlinx JSON instance configured to be lenient and ignore unknown fields.
     */
    val json: Json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        coerceInputValues = true
        encodeDefaults = true
    }

    /**
     * Creates an [OkHttpClient] with logging and timeouts.
     * Logs request/response bodies only in debug mode to prevent leaking sensitive logs in production.
     */
    fun createOkHttpClient(
        loggingLevel: HttpLoggingInterceptor.Level = if (ru.nghu.timetable.BuildConfig.DEBUG) {
            HttpLoggingInterceptor.Level.BODY
        } else {
            HttpLoggingInterceptor.Level.NONE
        }
    ): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = loggingLevel
        }

        return OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(15, TimeUnit.SECONDS)
            .build()
    }

    /**
     * Factory method to create [ScheduleApi] for a given base URL and optional custom [OkHttpClient].
     */
    fun createScheduleApi(
        baseUrl: String = currentBaseUrl,
        client: OkHttpClient = createOkHttpClient()
    ): ScheduleApi {
        val normalizedUrl = if (baseUrl.endsWith("/")) baseUrl else "$baseUrl/"
        val contentType = "application/json".toMediaType()

        return Retrofit.Builder()
            .baseUrl(normalizedUrl)
            .client(client)
            .addConverterFactory(json.asConverterFactory(contentType))
            .build()
            .create(ScheduleApi::class.java)
    }

    /**
     * Updates the base URL used by the singleton [api] instance.
     */
    fun updateBaseUrl(newBaseUrl: String) {
        currentBaseUrl = newBaseUrl
        _api = createScheduleApi(newBaseUrl)
    }

    @Volatile
    private var _api: ScheduleApi? = null

    /**
     * Lazily initialized singleton [ScheduleApi] instance.
     */
    val api: ScheduleApi
        get() {
            return _api ?: synchronized(this) {
                _api ?: createScheduleApi(currentBaseUrl).also { _api = it }
            }
        }
}
