package ru.nghu.timetable.data.local.parser

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.OkHttpClient
import okhttp3.Request
import org.jsoup.Jsoup
import java.util.concurrent.TimeUnit

data class ScrapedTimetableLink(
    val downloadUrl: String?,
    val title: String?
)

@Serializable
data class WpfdApiResponse(
    val files: List<WpfdFileDto>? = null
)

@Serializable
data class WpfdFileDto(
    val ID: Int? = null,
    val post_title: String? = null,
    val ext: String? = null,
    val openpdflink: String? = null,
    val linkdownload: String? = null
)

/**
 * Scrapes the official NGHU timetable via WP File Download JSON API or webpage fallback
 * to extract all active timetable PDF download URLs and download their raw bytes.
 */
class NghuWebScraper(
    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .followRedirects(true)
        .followSslRedirects(true)
        .build()
) {
    companion object {
        const val NGHU_TIMETABLE_PAGE_URL = "https://nghu.ru/students/timetable/"
        const val WPFD_API_URL = "https://nghu.ru/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=files.display&view=files&id=31"
        private const val USER_AGENT = "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36 NGHUTimetable/1.0"
        const val MAX_PDF_SIZE_BYTES = 15 * 1024 * 1024L // 15 MB limit to protect against OOM
        private val json = Json { ignoreUnknownKeys = true; coerceInputValues = true }

        /**
         * Validates that the URL points strictly to an authorized official NGHU domain.
         */
        fun isAllowedDownloadUrl(url: String?): Boolean {
            if (url.isNullOrBlank()) return false
            return try {
                val uri = java.net.URI(url)
                val host = uri.host?.lowercase() ?: return false
                val scheme = uri.scheme?.lowercase() ?: return false
                (scheme == "https" || scheme == "http") && (host == "nghu.ru" || host.endsWith(".nghu.ru"))
            } catch (_: Exception) {
                false
            }
        }
    }

    /**
     * Parses the JSON response from WP File Download API.
     * Extracts PDF files and sorts by ID descending (newest first).
     */
    fun parseWpfdJsonResponse(jsonStr: String): List<ScrapedTimetableLink> {
        return try {
            val response = json.decodeFromString<WpfdApiResponse>(jsonStr)
            val pdfFiles = response.files?.filter { it.ext?.equals("pdf", ignoreCase = true) == true } ?: emptyList()
            pdfFiles
                .sortedByDescending { it.ID ?: 0 }
                .mapNotNull { item ->
                    val url = (item.openpdflink?.ifBlank { null } ?: item.linkdownload)?.ifBlank { null }
                    if (url != null && isAllowedDownloadUrl(url)) {
                        ScrapedTimetableLink(
                            downloadUrl = url,
                            title = item.post_title?.ifBlank { "Расписание занятий" } ?: "Расписание занятий"
                        )
                    } else null
                }
        } catch (_: Exception) {
            emptyList()
        }
    }

    /**
     * Parses HTML and extracts all active timetable download links (e.g. current week + upcoming week).
     */
    fun parseAllTimetableLinks(html: String): List<ScrapedTimetableLink> {
        val doc = Jsoup.parse(html, NGHU_TIMETABLE_PAGE_URL)
        val links = doc.select("a[href]")
        val results = mutableListOf<ScrapedTimetableLink>()
        val seenFileIds = mutableSetOf<String>()
        val seenUrls = mutableSetOf<String>()

        for (link in links) {
            val href = link.attr("abs:href").ifBlank { link.attr("href") }
                .replace("&#038;", "&")
                .replace("&amp;", "&")
            val text = link.text().trim()

            val isWpfd = href.contains("action=wpfd", ignoreCase = true) && href.contains("task=file.download", ignoreCase = true)
            val isDl = href.contains("/dl/", ignoreCase = true)
            val isPdf = href.endsWith(".pdf", ignoreCase = true)
            val isSchedule = text.contains("расписание", ignoreCase = true) || href.contains("расписание", ignoreCase = true)

            val fileIdMatch = Regex("""wpfd_file_id=(\d+)""").find(href)
            val fileId = fileIdMatch?.groupValues?.get(1)

            if (isWpfd || (isDl && isSchedule) || (isPdf && isSchedule)) {
                if (fileId != null) {
                    if (seenFileIds.add(fileId)) {
                        val directUrl = "https://nghu.ru/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=file.download&wpfd_category_id=31&wpfd_file_id=$fileId"
                        results.add(ScrapedTimetableLink(directUrl, text.ifBlank { "Расписание занятий" }))
                    }
                } else if (seenUrls.add(href)) {
                    results.add(ScrapedTimetableLink(href, text.ifBlank { "Расписание занятий" }))
                }
            }
        }

        return results
    }

    /**
     * Finds the single latest timetable link for backwards compatibility.
     */
    fun parseTimetablePageHtml(html: String): ScrapedTimetableLink {
        val all = parseAllTimetableLinks(html)
        return all.firstOrNull() ?: ScrapedTimetableLink(null, null)
    }

    /**
     * Downloads all active timetable PDFs currently published on the college website.
     * Prioritizes WP File Download JSON API, falling back to HTML scraping.
     */
    suspend fun fetchAllActiveTimetablePdfs(): List<Pair<ByteArray, ScrapedTimetableLink>> = withContext(Dispatchers.IO) {
        var allLinks: List<ScrapedTimetableLink> = emptyList()

        // Level 1: WP File Download AJAX JSON endpoint
        try {
            val apiRequest = Request.Builder()
                .url(WPFD_API_URL)
                .header("User-Agent", USER_AGENT)
                .header("Accept", "application/json, text/plain, */*")
                .build()

            val jsonStr = client.newCall(apiRequest).execute().use { response ->
                if (response.isSuccessful) response.body?.string() else null
            }
            if (!jsonStr.isNullOrBlank()) {
                allLinks = parseWpfdJsonResponse(jsonStr)
            }
        } catch (_: Exception) {
            allLinks = emptyList()
        }

        // Level 2: Fallback to HTML scraping
        if (allLinks.isEmpty()) {
            try {
                val pageRequest = Request.Builder()
                    .url(NGHU_TIMETABLE_PAGE_URL)
                    .header("User-Agent", USER_AGENT)
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                    .build()

                val html = client.newCall(pageRequest).execute().use { response ->
                    if (!response.isSuccessful) throw IllegalStateException("Не удалось загрузить страницу расписания: HTTP ${response.code}")
                    response.body?.string() ?: throw IllegalStateException("Пустой ответ от страницы расписания")
                }
                allLinks = parseAllTimetableLinks(html)
            } catch (e: Exception) {
                if (allLinks.isEmpty()) {
                    throw IllegalStateException("Не удалось получить ссылки на расписание: ${e.message}", e)
                }
            }
        }

        if (allLinks.isEmpty()) throw IllegalStateException("Не найдены ссылки на расписание на сайте колледжа")

        val results = mutableListOf<Pair<ByteArray, ScrapedTimetableLink>>()
        // Download up to 3 active timetable PDFs (e.g. current week + next week)
        for (linkInfo in allLinks.take(3)) {
            val downloadUrl = linkInfo.downloadUrl ?: continue
            if (!isAllowedDownloadUrl(downloadUrl)) continue
            try {
                val pdfRequest = Request.Builder()
                    .url(downloadUrl)
                    .header("User-Agent", USER_AGENT)
                    .header("Referer", NGHU_TIMETABLE_PAGE_URL)
                    .build()

                val pdfBytes = client.newCall(pdfRequest).execute().use { response ->
                    if (!response.isSuccessful) return@use null
                    val body = response.body ?: return@use null
                    val contentLength = body.contentLength()
                    if (contentLength > MAX_PDF_SIZE_BYTES) return@use null
                    val bytes = body.bytes()
                    if (bytes.size <= MAX_PDF_SIZE_BYTES) bytes else null
                }

                if (pdfBytes != null && pdfBytes.isNotEmpty()) {
                    results.add(Pair(pdfBytes, linkInfo))
                }
            } catch (_: Exception) {
                // Ignore single failure if other PDFs download successfully
            }
        }

        if (results.isEmpty()) {
            throw IllegalStateException("Не удалось скачать ни один PDF-файл расписания")
        }

        results
    }

    /**
     * Downloads the single latest timetable PDF byte array.
     */
    suspend fun fetchLatestTimetablePdf(): Pair<ByteArray, ScrapedTimetableLink> = withContext(Dispatchers.IO) {
        val all = fetchAllActiveTimetablePdfs()
        all.first()
    }
}