import fs from 'node:fs';
import path from 'node:path';
import { fetchLatestSchedule } from '../server/src/parser/scraper.js';

async function main() {
  console.log('[Updater] Checking NGHU site for the latest timetable...');
  const fallbackPdf = path.resolve(process.cwd(), 'schedule_sample.pdf');
  
  try {
    const schedule = await fetchLatestSchedule({
      fallbackPdfPath: fs.existsSync(fallbackPdf) ? fallbackPdf : undefined,
    });

    console.log(`[Updater] Parsed: ${schedule.meta.sourceFileTitle || 'Timetable'}`);
    console.log(`[Updater] Total groups: ${schedule.groups.length}, total lessons: ${schedule.lessons.length}`);

    const jsonStr = JSON.stringify(schedule, null, 2);

    // Save to vk-mini-app/public/schedule.json
    const appPublicJson = path.resolve(process.cwd(), 'vk-mini-app/public/schedule.json');
    fs.mkdirSync(path.dirname(appPublicJson), { recursive: true });
    fs.writeFileSync(appPublicJson, jsonStr, 'utf8');
    console.log(`[Updater] Saved to ${appPublicJson}`);

    // Save to root schedule.json for GitHub Pages / CDN access
    const rootJson = path.resolve(process.cwd(), 'schedule.json');
    fs.writeFileSync(rootJson, jsonStr, 'utf8');
    console.log(`[Updater] Saved to ${rootJson}`);

    console.log('[Updater] Done!');
  } catch (err) {
    console.error('[Updater] Failed:', err);
    process.exit(1);
  }
}

main();
