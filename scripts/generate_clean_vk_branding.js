const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.resolve(process.cwd(), 'vk-branding-clean');
fs.mkdirSync(outDir, { recursive: true });

// Read the authentic vector logo
const svgMark = fs.readFileSync(path.resolve(process.cwd(), 'design/logos/nghu_authentic_lockup.svg'), 'utf8');

function render(html, outputPath, width, height) {
  const tempHtml = path.resolve(outDir, `_temp_${Date.now()}_${width}x${height}.html`);
  fs.writeFileSync(tempHtml, html, 'utf8');
  try {
    execSync(`"${edgePath}" --headless --screenshot="${outputPath}" --window-size=${width},${height} --hide-scrollbars "file:///${tempHtml.replace(/\\/g, '/')}"`);
    console.log(`[Generated] ${path.basename(outputPath)} (${width}x${height})`);
  } finally {
    if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
  }
}

// ==========================================
// 1. ICONS (576x576, 278x278, 150x150, 32x32)
// Clean white background with authentic vector emblem
// ==========================================

function makeIconHtml(size, innerPercent = 75) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${size}px;
      height: ${size}px;
      background: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .emblem {
      width: ${innerPercent}%;
      height: ${innerPercent}%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div class="emblem">
    ${svgMark}
  </div>
</body>
</html>`;
}

render(makeIconHtml(576, 78), path.resolve(outDir, '1_universal_icon_576x576.png'), 576, 576);
render(makeIconHtml(278, 78), path.resolve(outDir, '2_catalog_icon_278x278.png'), 278, 278);
render(makeIconHtml(150, 80), path.resolve(outDir, '3_small_icon_150x150.png'), 150, 150);
render(makeIconHtml(32, 88), path.resolve(outDir, '4_favicon_32x32.png'), 32, 32);

// Also generate a Cream/Heritage variant (for user preference)
function makeCreamIconHtml(size, innerPercent = 75) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${size}px;
      height: ${size}px;
      background: #F4EDE4;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .emblem {
      width: ${innerPercent}%;
      height: ${innerPercent}%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div class="emblem">
    ${svgMark}
  </div>
</body>
</html>`;
}

render(makeCreamIconHtml(576, 78), path.resolve(outDir, '1_universal_icon_cream_576x576.png'), 576, 576);
render(makeCreamIconHtml(278, 78), path.resolve(outDir, '2_catalog_icon_cream_278x278.png'), 278, 278);
render(makeCreamIconHtml(150, 80), path.resolve(outDir, '3_small_icon_cream_150x150.png'), 150, 150);

// ==========================================
// 2. BIG SNIPPET BANNER (1120x630)
// Human-designed academic layout, strictly zero AI elements
// ==========================================

const bannerHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1120px;
      height: 630px;
      background: #1B2421;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 100px;
      overflow: hidden;
      color: #FFFFFF;
    }
    .left {
      max-width: 580px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .kicker {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #7B9D82;
    }
    .title {
      font-size: 56px;
      font-weight: 800;
      letter-spacing: -1px;
      line-height: 1.08;
      color: #FFFFFF;
    }
    .subtitle {
      font-size: 24px;
      font-weight: 600;
      color: #D3DDD5;
      line-height: 1.3;
    }
    .desc {
      font-size: 16px;
      color: #8E9F94;
      line-height: 1.5;
      margin-top: 4px;
    }
    .tags {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }
    .tag {
      font-size: 14px;
      font-weight: 500;
      color: #C0CDC3;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
    }
    .right {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .emblem-card {
      width: 320px;
      height: 320px;
      background: #FFFFFF;
      border-radius: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 36px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
    }
    .emblem-card svg {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div class="left">
    <div class="kicker">Официальное расписание</div>
    <div class="title">Расписание пар</div>
    <div class="subtitle">НГХУ им. А.Д. Крячкова</div>
    <div class="desc">Актуальные пары, кабинеты и статус аудиторий для студентов и преподавателей.</div>
    <div class="tags">
      <div class="tag">Красный проспект, 9</div>
      <div class="tag">ул. Спартака, 12</div>
    </div>
  </div>
  <div class="right">
    <div class="emblem-card">
      ${svgMark}
    </div>
  </div>
</body>
</html>`;

render(bannerHtml, path.resolve(outDir, '5_big_snippet_1120x630.png'), 1120, 630);

// Also generate Light/Minimalist Banner (Option B)
const bannerLightHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1120px;
      height: 630px;
      background: #F7F5F0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 100px;
      overflow: hidden;
      color: #1A211D;
    }
    .left {
      max-width: 580px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .kicker {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #55795C;
    }
    .title {
      font-size: 56px;
      font-weight: 800;
      letter-spacing: -1px;
      line-height: 1.08;
      color: #1A211D;
    }
    .subtitle {
      font-size: 24px;
      font-weight: 600;
      color: #38493E;
      line-height: 1.3;
    }
    .desc {
      font-size: 16px;
      color: #637669;
      line-height: 1.5;
      margin-top: 4px;
    }
    .tags {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }
    .tag {
      font-size: 14px;
      font-weight: 600;
      color: #3D5043;
      padding: 6px 14px;
      background: #EAE5DC;
      border-radius: 8px;
    }
    .right {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .emblem-card {
      width: 320px;
      height: 320px;
      background: #FFFFFF;
      border: 1px solid #E2DCD1;
      border-radius: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 36px;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.06);
    }
    .emblem-card svg {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div class="left">
    <div class="kicker">Официальное расписание</div>
    <div class="title">Расписание пар</div>
    <div class="subtitle">НГХУ им. А.Д. Крячкова</div>
    <div class="desc">Актуальные пары, кабинеты и статус аудиторий для студентов и преподавателей.</div>
    <div class="tags">
      <div class="tag">Красный проспект, 9</div>
      <div class="tag">ул. Спартака, 12</div>
    </div>
  </div>
  <div class="right">
    <div class="emblem-card">
      ${svgMark}
    </div>
  </div>
</body>
</html>`;

render(bannerLightHtml, path.resolve(outDir, '5_big_snippet_light_1120x630.png'), 1120, 630);

// ==========================================
// 3. APP SCREENSHOTS (600x1200)
// Actual native UI screenshots of Schedule and Classrooms
// ==========================================

const scheduleScreenHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 600px;
      height: 1200px;
      background: #19191A;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #FFFFFF;
      padding: 24px;
      overflow: hidden;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .group-pill {
      font-size: 15px;
      font-weight: 700;
      background: rgba(38, 136, 235, 0.15);
      color: #529EF4;
      padding: 6px 14px;
      border-radius: 20px;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
    }
    .tabs {
      display: flex;
      gap: 8px;
      margin: 20px 0;
      overflow: hidden;
    }
    .tab {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.06);
      color: #8C8C8E;
    }
    .tab.active {
      background: #FFFFFF;
      color: #000000;
    }
    .card {
      background: #232324;
      border-radius: 14px;
      padding: 16px;
      margin-bottom: 14px;
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .pair-num {
      font-size: 13px;
      color: #8C8C8E;
    }
    .badge {
      font-size: 12px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .badge-spartak {
      background: rgba(230, 93, 0, 0.15);
      color: #FF8D3B;
    }
    .badge-main {
      background: rgba(38, 136, 235, 0.15);
      color: #529EF4;
    }
    .subject {
      font-size: 18px;
      font-weight: 700;
      line-height: 1.25;
      margin-bottom: 8px;
    }
    .card-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      color: #8C8C8E;
    }
    .room {
      font-weight: 600;
      color: #B2B2B4;
    }
    .break {
      text-align: center;
      font-size: 13px;
      color: #8C8C8E;
      padding: 8px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">Расписание</div>
    <div class="group-pill">Группа Ж-11 ▼</div>
  </div>

  <div class="tabs">
    <div class="tab active">ВТ 20 окт</div>
    <div class="tab">СР 21 окт</div>
    <div class="tab">ЧТ 22 окт</div>
    <div class="tab">ПТ 23 окт</div>
    <div class="tab">СБ 24 окт</div>
  </div>

  <div class="card">
    <div class="card-top">
      <div class="pair-num">1 пара • 09:00 – 10:35</div>
      <div class="badge badge-spartak">Спартака 12</div>
    </div>
    <div class="subject">География</div>
    <div class="card-bottom">
      <div>Ковалик И.В.</div>
      <div class="room">каб. 212</div>
    </div>
  </div>

  <div class="break">— Перемена 5 мин —</div>

  <div class="card">
    <div class="card-top">
      <div class="pair-num">2 пара • 10:40 – 12:15</div>
      <div class="badge badge-main">Красный 9</div>
    </div>
    <div class="subject">Пластическая анатомия</div>
    <div class="card-bottom">
      <div>Чирва В.П.</div>
      <div class="room">каб. 209</div>
    </div>
  </div>

  <div class="break">— Перемена 45 мин —</div>

  <div class="card">
    <div class="card-top">
      <div class="pair-num">3 пара • 13:00 – 14:35</div>
      <div class="badge badge-main">Красный 9</div>
    </div>
    <div class="subject">Иностранный язык</div>
    <div class="card-bottom">
      <div>Синещек Д.Ю.</div>
      <div class="room">каб. 207</div>
    </div>
  </div>

  <div class="break">— Перемена 5 мин —</div>

  <div class="card">
    <div class="card-top">
      <div class="pair-num">4 пара • 14:40 – 16:15</div>
    </div>
    <div class="subject">Физкультура</div>
    <div class="card-bottom">
      <div>Преподаватель не указан</div>
      <div class="room">Динамо</div>
    </div>
  </div>
</body>
</html>`;

render(scheduleScreenHtml, path.resolve(outDir, 'screenshot_1_schedule_600x1200.png'), 600, 1200);

// Screenshot 2: Classroom Occupancy (Rooms)
const roomsScreenHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 600px;
      height: 1200px;
      background: #19191A;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #FFFFFF;
      padding: 24px;
      overflow: hidden;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .title {
      font-size: 22px;
      font-weight: 700;
    }
    .search-mock {
      background: #232324;
      border-radius: 10px;
      padding: 12px 16px;
      margin: 18px 0;
      font-size: 14px;
      color: #717173;
    }
    .stats {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    .stat-chip {
      font-size: 13px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 8px;
    }
    .stat-free {
      background: rgba(75, 179, 75, 0.15);
      color: #56C45E;
    }
    .stat-occ {
      background: rgba(230, 70, 70, 0.15);
      color: #F05B5B;
    }
    .room-card {
      background: #232324;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .room-name {
      font-size: 17px;
      font-weight: 700;
    }
    .room-campus {
      font-size: 13px;
      color: #8C8C8E;
      margin-top: 2px;
    }
    .room-status {
      font-size: 13px;
      font-weight: 600;
      text-align: right;
    }
    .status-free {
      color: #56C45E;
    }
    .status-occ {
      color: #F05B5B;
    }
    .status-desc {
      font-size: 12px;
      color: #8C8C8E;
      margin-top: 2px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">Аудитории</div>
  </div>

  <div class="search-mock">🔍 Поиск по номеру аудитории (напр. 212)...</div>

  <div class="stats">
    <div class="stat-chip stat-free">Свободно: 18</div>
    <div class="stat-chip stat-occ">Занято: 12</div>
  </div>

  <div class="room-card">
    <div>
      <div class="room-name">Кабинет 207</div>
      <div class="room-campus">Красный пр-т, 9</div>
    </div>
    <div>
      <div class="room-status status-free">Свободна</div>
      <div class="status-desc">до 13:00 (далее Иностр. язык)</div>
    </div>
  </div>

  <div class="room-card">
    <div>
      <div class="room-name">Кабинет 209</div>
      <div class="room-campus">Красный пр-т, 9</div>
    </div>
    <div>
      <div class="room-status status-occ">Занята</div>
      <div class="status-desc">Пластич. анатомия • до 12:15</div>
    </div>
  </div>

  <div class="room-card">
    <div>
      <div class="room-name">Кабинет 212</div>
      <div class="room-campus">ул. Спартака, 12</div>
    </div>
    <div>
      <div class="room-status status-occ">Занята</div>
      <div class="status-desc">География (Ж-11) • до 10:35</div>
    </div>
  </div>

  <div class="room-card">
    <div>
      <div class="room-name">Кабинет 216</div>
      <div class="room-campus">ул. Спартака, 12</div>
    </div>
    <div>
      <div class="room-status status-free">Свободна</div>
      <div class="status-desc">до 14:40</div>
    </div>
  </div>
</body>
</html>`;

render(roomsScreenHtml, path.resolve(outDir, 'screenshot_2_rooms_600x1200.png'), 600, 1200);

console.log('All clean branding files rendered successfully!');
