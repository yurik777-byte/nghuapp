package ru.nghu.timetable.data.local.parser

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class NghuWebScraperTest {

    private val scraper = NghuWebScraper()

    @Test
    fun testParseWpfdJsonResponse() {
        val json = """
            {
                "files": [
                    {
                        "ID": 17517,
                        "post_title": "Расписание занятий на 10-12 сентября 2026",
                        "ext": "pdf",
                        "openpdflink": "https://nghu.ru/wp-admin/admin-ajax.php?action=wpfd&task=file.download&id=17517"
                    },
                    {
                        "ID": 19149,
                        "post_title": "Расписание занятий на 14 сентября 2026",
                        "ext": "pdf",
                        "openpdflink": "https://nghu.ru/wp-admin/admin-ajax.php?action=wpfd&task=file.download&id=19149"
                    },
                    {
                        "ID": 19150,
                        "post_title": "План работы",
                        "ext": "docx",
                        "openpdflink": "https://nghu.ru/dl/plan.docx"
                    }
                ]
            }
        """.trimIndent()

        val links = scraper.parseWpfdJsonResponse(json)

        assertEquals(2, links.size)
        // Should be sorted by ID descending: 19149 before 17517
        assertEquals("Расписание занятий на 14 сентября 2026", links[0].title)
        assertTrue(links[0].downloadUrl!!.contains("id=19149"))

        assertEquals("Расписание занятий на 10-12 сентября 2026", links[1].title)
        assertTrue(links[1].downloadUrl!!.contains("id=17517"))
    }

    @Test
    fun testParseWpfdJsonResponse_emptyOrMalformed() {
        val empty = scraper.parseWpfdJsonResponse("{}")
        assertTrue(empty.isEmpty())

        val malformed = scraper.parseWpfdJsonResponse("invalid json")
        assertTrue(malformed.isEmpty())
    }

    @Test
    fun testIsAllowedDownloadUrl() {
        // Valid official domains
        assertTrue(NghuWebScraper.isAllowedDownloadUrl("https://nghu.ru/wp-admin/admin-ajax.php?action=wpfd"))
        assertTrue(NghuWebScraper.isAllowedDownloadUrl("https://static.nghu.ru/files/schedule.pdf"))
        assertTrue(NghuWebScraper.isAllowedDownloadUrl("http://nghu.ru/dl/123"))

        // Malicious or untrusted URLs
        org.junit.Assert.assertFalse(NghuWebScraper.isAllowedDownloadUrl("https://evil.com/schedule.pdf"))
        org.junit.Assert.assertFalse(NghuWebScraper.isAllowedDownloadUrl("https://evilnghu.ru/schedule.pdf"))
        org.junit.Assert.assertFalse(NghuWebScraper.isAllowedDownloadUrl("javascript:alert(1)"))
        org.junit.Assert.assertFalse(NghuWebScraper.isAllowedDownloadUrl("file:///data/local/tmp/test.pdf"))
        org.junit.Assert.assertFalse(NghuWebScraper.isAllowedDownloadUrl(""))
        org.junit.Assert.assertFalse(NghuWebScraper.isAllowedDownloadUrl(null))
    }
}
