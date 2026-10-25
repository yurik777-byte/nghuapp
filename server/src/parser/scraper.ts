import * as cheerio from 'cheerio';
import fs from 'node:fs';
import path from 'node:path';
import { ParsedSchedule } from '../types/index.js';
import { parsePdfBuffer } from './pdfParser.js';

export const NGHU_TIMETABLE_PAGE_URL = 'https://nghu.ru/students/timetable/';
export const WPFD_TIMETABLE_CATEGORY_ID = 31;
export const WPFD_API_URL = `https://nghu.ru/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=files.display&view=files&id=${WPFD_TIMETABLE_CATEGORY_ID}`;

export interface WpfdFileItem {
  ID: number | string;
  post_title: string;
  post_name?: string;
  ext?: string;
  size?: number;
  created_time?: string;
  modified_time?: string;
  openpdflink?: string;
  linkdownload?: string;
}

export interface WpfdFilesResponse {
  files?: WpfdFileItem[];
  category?: {
    term_id?: number;
    name?: string;
    slug?: string;
  };
}

export interface ScrapedTimetableLink {
  downloadUrl: string | null;
  title: string | null;
}

export interface FetchScheduleOptions {
  timetablePageUrl?: string;
  wpfdApiUrl?: string | null;
  fallbackPdfPath?: string;
  timeoutMs?: number;
  preferWpfdApi?: boolean;
}

/**
 * Parses WP File Download AJAX JSON response and finds the latest PDF timetable link
 */
export function parseWpfdJsonResponse(data: unknown): ScrapedTimetableLink {
  if (!data || typeof data !== 'object') {
    return { downloadUrl: null, title: null };
  }

  const response = data as WpfdFilesResponse;
  if (!Array.isArray(response.files) || response.files.length === 0) {
    return { downloadUrl: null, title: null };
  }

  // Filter only PDF files
  const pdfFiles = response.files.filter(
    (file) => file.ext && file.ext.toLowerCase() === 'pdf'
  );

  if (pdfFiles.length === 0) {
    return { downloadUrl: null, title: null };
  }

  // Sort files by modified_time or date in title descending (newest schedule first)
  const MONTHS_MAP: Record<string, number> = {
    'янв': 1, 'фев': 2, 'мар': 3, 'апр': 4, 'май': 5, 'июн': 6,
    'июл': 7, 'авг': 8, 'сен': 9, 'окт': 10, 'ноя': 11, 'дек': 12,
  };

  const getTitleDateVal = (title?: string) => {
    if (!title) return 0;
    const m = title.match(/(\d{1,2})\s+(янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек)[а-я]*/i);
    if (m) {
      const day = parseInt(m[1], 10);
      const mon = MONTHS_MAP[m[2].toLowerCase()] || 1;
      return mon * 100 + day;
    }
    const dMatch = title.match(/(\d{1,2})\.(\d{2})/);
    if (dMatch) {
      return parseInt(dMatch[2], 10) * 100 + parseInt(dMatch[1], 10);
    }
    return 0;
  };

  pdfFiles.sort((a, b) => {
    // 1. Check title date (e.g. "с 26 октября" > "с 1 октября")
    const dateA = getTitleDateVal(a.post_title);
    const dateB = getTitleDateVal(b.post_title);
    if (dateA !== dateB) return dateB - dateA;

    // 2. Check modified_time
    if (a.modified_time && b.modified_time) {
      const tA = new Date(a.modified_time).getTime();
      const tB = new Date(b.modified_time).getTime();
      if (!isNaN(tA) && !isNaN(tB) && tA !== tB) {
        return tB - tA;
      }
    }

    // 3. Fallback to ID
    const idA = typeof a.ID === 'number' ? a.ID : parseInt(String(a.ID), 10) || 0;
    const idB = typeof b.ID === 'number' ? b.ID : parseInt(String(b.ID), 10) || 0;
    return idB - idA;
  });

  const latest = pdfFiles[0];
  const downloadUrl = latest.openpdflink || latest.linkdownload || null;
  const title = latest.post_title || null;

  return { downloadUrl, title };
}

/**
 * Fetches the latest schedule directly from the WP File Download AJAX API
 */
export async function fetchLatestViaWpfdApi(
  apiUrl: string = WPFD_API_URL,
  timeoutMs: number = 10000
): Promise<ScrapedTimetableLink | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return parseWpfdJsonResponse(data);
  } catch {
    return null;
  }
}

/**
 * Parses timetable webpage HTML and locates the latest schedule download link and title
 */
export function parseTimetablePageHtml(html: string): ScrapedTimetableLink {
  const $ = cheerio.load(html);
  let downloadUrl: string | null = null;
  let title: string | null = null;

  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim();

    // Check for link pointing to timetable PDF, dl download endpoint, or WordPress wpfd action
    const isPdfLink =
      href.toLowerCase().endsWith('.pdf') ||
      href.includes('/dl/') ||
      href.includes('wpfd');
    const isScheduleText = /расписание\s+занятий/i.test(text);

    if ((isPdfLink && isScheduleText) || (/расписание.*(\d{1,2}[.-]\d{1,2}|\d{1,2}\s+[а-я]+)/i.test(text) && isPdfLink)) {
      if (!downloadUrl) {
        downloadUrl = href.startsWith('http') ? href : new URL(href, NGHU_TIMETABLE_PAGE_URL).href;
        title = text;
      }
    }
  });

  // Fallback: search for any link mentioning 'расписание' if not matched yet
  if (!downloadUrl) {
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      if (
        /расписание.*(студент|занятий)/i.test(text) &&
        (href.includes('.pdf') || href.includes('/dl/') || href.includes('wpfd'))
      ) {
        downloadUrl = href.startsWith('http') ? href : new URL(href, NGHU_TIMETABLE_PAGE_URL).href;
        title = text;
      }
    });
  }

  return { downloadUrl, title };
}

/**
 * Fetches the latest schedule from the official NGHU website,
 * downloading and parsing the latest PDF timetable.
 * Order of resolution:
 * 1. Direct WP File Download JSON API (fast, robust against page URL/layout changes)
 * 2. Webpage HTML scraping via Cheerio
 * 3. Local fallback PDF buffer
 */
export async function fetchLatestSchedule(
  options: FetchScheduleOptions = {}
): Promise<ParsedSchedule> {
  const pageUrl = options.timetablePageUrl || NGHU_TIMETABLE_PAGE_URL;
  // If caller specified a custom timetablePageUrl but did not specify wpfdApiUrl, do not hit production wpfdApiUrl
  const defaultWpfdUrl = options.timetablePageUrl ? null : WPFD_API_URL;
  const wpfdApiUrl = options.wpfdApiUrl !== undefined ? options.wpfdApiUrl : defaultWpfdUrl;
  const timeoutMs = options.timeoutMs || 10000;
  const fallbackPath =
    options.fallbackPdfPath ||
    path.resolve(process.cwd(), '../schedule_sample.pdf');
  const preferWpfdApi = options.preferWpfdApi !== false && Boolean(wpfdApiUrl);

  let scraped: ScrapedTimetableLink | null = null;

  // Level 1: Direct WP File Download JSON API
  if (preferWpfdApi && wpfdApiUrl) {
    try {
      scraped = await fetchLatestViaWpfdApi(wpfdApiUrl, timeoutMs);
    } catch {
      scraped = null;
    }
  }

  // Level 2: Fallback to HTML scraping
  if (!scraped?.downloadUrl) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(pageUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (res.ok) {
        const html = await res.text();
        scraped = parseTimetablePageHtml(html);
      }
    } catch (err: any) {
      console.warn(`[Scraper] HTML page scrape failed (${err.message}).`);
    }
  }

  // If a download URL is found (via API or HTML), download and parse the PDF
  if (scraped?.downloadUrl) {
    try {
      const pdfController = new AbortController();
      const pdfTimer = setTimeout(() => pdfController.abort(), timeoutMs);

      const pdfRes = await fetch(scraped.downloadUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        },
        signal: pdfController.signal,
      });

      clearTimeout(pdfTimer);

      if (pdfRes.ok) {
        const arrayBuf = await pdfRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const parsed = await parsePdfBuffer(buffer, scraped.downloadUrl);
        if (scraped.title && !parsed.meta.sourceFileTitle) {
          parsed.meta.sourceFileTitle = scraped.title;
        }
        return parsed;
      }
    } catch (err: any) {
      console.warn(`[Scraper] Network fetch failed (${err.message}). Using local fallback.`);
    }
  }

  // Level 3: Local fallbacks
  if (fs.existsSync(fallbackPath)) {
    const buffer = fs.readFileSync(fallbackPath);
    return parsePdfBuffer(buffer);
  }

  // Second fallback: check if schedule_sample.pdf exists in current working directory
  const cwdFallback = path.resolve(process.cwd(), 'schedule_sample.pdf');
  if (fs.existsSync(cwdFallback)) {
    const buffer = fs.readFileSync(cwdFallback);
    return parsePdfBuffer(buffer);
  }

  throw new Error(
    `Failed to fetch timetable from API / ${pageUrl} and fallback PDF not found at ${fallbackPath}`
  );
}
