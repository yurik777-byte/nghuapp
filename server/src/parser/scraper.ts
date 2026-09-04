import * as cheerio from 'cheerio';
import fs from 'node:fs';
import path from 'node:path';
import { ParsedSchedule } from '../types/index.js';
import { parsePdfBuffer } from './pdfParser.js';

export const NGHU_TIMETABLE_PAGE_URL = 'https://nghu.ru/students/timetable/';

export interface ScrapedTimetableLink {
  downloadUrl: string | null;
  title: string | null;
}

export interface FetchScheduleOptions {
  timetablePageUrl?: string;
  fallbackPdfPath?: string;
  timeoutMs?: number;
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
 * Falls back to local PDF buffer if network is unreachable or live scraping fails.
 */
export async function fetchLatestSchedule(
  options: FetchScheduleOptions = {}
): Promise<ParsedSchedule> {
  const pageUrl = options.timetablePageUrl || NGHU_TIMETABLE_PAGE_URL;
  const timeoutMs = options.timeoutMs || 10000;
  const fallbackPath =
    options.fallbackPdfPath ||
    path.resolve(process.cwd(), '../schedule_sample.pdf');

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

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} when fetching ${pageUrl}`);
    }

    const html = await res.text();
    const scraped = parseTimetablePageHtml(html);

    if (scraped.downloadUrl) {
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
    }
  } catch (err: any) {
    console.warn(`[Scraper] Network fetch failed (${err.message}). Using local fallback.`);
  }

  // Local fallback
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
    `Failed to fetch timetable from ${pageUrl} and fallback PDF not found at ${fallbackPath}`
  );
}
