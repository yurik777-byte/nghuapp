const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outputDir = path.resolve(process.cwd(), 'vk-branding');
fs.mkdirSync(outputDir, { recursive: true });

const markSvg = fs.readFileSync(path.resolve(process.cwd(), 'design/logos/nghu_authentic_lockup.svg'), 'utf8');

function renderHtml(html, outputPath, width, height) {
  const tempHtml = path.resolve(outputDir, `_temp_${width}x${height}.html`);
  fs.writeFileSync(tempHtml, html, 'utf8');
  try {
    execSync(`"${edgePath}" --headless --screenshot="${outputPath}" --window-size=${width},${height} --hide-scrollbars "file:///${tempHtml.replace(/\\/g, '/')}"`);
    console.log(`Rendered: ${outputPath} (${width}x${height})`);
  } finally {
    if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
  }
}

// 1. Universal Icon 576x576
const html576 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 576px;
      height: 576px;
      background: #F4EDE4;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .container {
      width: 480px;
      height: 480px;
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
  <div class="container">
    ${markSvg}
  </div>
</body>
</html>`;
renderHtml(html576, path.resolve(outputDir, '1_universal_icon_576x576.png'), 576, 576);

// 2. Catalog & Snippet Icon 278x278
const html278 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 278px;
      height: 278px;
      background: #F4EDE4;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .container {
      width: 230px;
      height: 230px;
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
  <div class="container">
    ${markSvg}
  </div>
</body>
</html>`;
renderHtml(html278, path.resolve(outputDir, '2_catalog_icon_278x278.png'), 278, 278);

// 3. Small Icon 150x150
const html150 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 150px;
      height: 150px;
      background: #F4EDE4;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .container {
      width: 124px;
      height: 124px;
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
  <div class="container">
    ${markSvg}
  </div>
</body>
</html>`;
renderHtml(html150, path.resolve(outputDir, '3_small_icon_150x150.png'), 150, 150);

// 4. Favicon 32x32
const html32 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 32px;
      height: 32px;
      background: #F4EDE4;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .container {
      width: 28px;
      height: 28px;
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
  <div class="container">
    ${markSvg}
  </div>
</body>
</html>`;
renderHtml(html32, path.resolve(outputDir, '4_favicon_32x32.png'), 32, 32);

// 5. Big Snippet 1120x630 Banner
const htmlBanner = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1120px;
      height: 630px;
      background: linear-gradient(135deg, #1C2321 0%, #2B3A36 50%, #17201E 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 0 100px;
      overflow: hidden;
      color: #FFFFFF;
      position: relative;
    }
    /* Subtle decorative background circles */
    .bg-circle-1 {
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(123, 157, 130, 0.15) 0%, transparent 70%);
      top: -100px;
      right: 100px;
      pointer-events: none;
    }
    .left-col {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 560px;
      z-index: 2;
    }
    .badges {
      display: flex;
      gap: 12px;
    }
    .badge {
      font-size: 14px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 20px;
      letter-spacing: 0.5px;
    }
    .badge-main {
      background: rgba(38, 136, 235, 0.2);
      color: #64B5F6;
      border: 1px solid rgba(100, 181, 246, 0.4);
    }
    .badge-spartak {
      background: rgba(230, 93, 0, 0.2);
      color: #FFB74D;
      border: 1px solid rgba(255, 183, 77, 0.4);
    }
    .title {
      font-size: 52px;
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.5px;
    }
    .title span {
      color: #7B9D82;
    }
    .subtitle {
      font-size: 22px;
      color: #CFD8DC;
      line-height: 1.4;
      font-weight: 400;
    }
    .features {
      display: flex;
      gap: 24px;
      margin-top: 10px;
      font-size: 15px;
      color: #B0BEC5;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .feature-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #7B9D82;
    }
    .right-col {
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }
    .logo-card {
      width: 320px;
      height: 320px;
      background: #F4EDE4;
      border-radius: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30px;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
    }
    .logo-card svg {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div class="bg-circle-1"></div>
  <div class="left-col">
    <div class="badges">
      <div class="badge badge-main">🏛️ Главный корпус (Красный, 9)</div>
      <div class="badge badge-spartak">🎨 Второй корпус (Спартака, 12)</div>
    </div>
    <h1 class="title">Расписание <span>НГУХУ</span></h1>
    <p class="subtitle">Пары, звонки, свободные аудитории и перемещения между корпусами в реальном времени.</p>
    <div class="features">
      <div class="feature-item"><div class="feature-dot"></div>Все группы и преподаватели</div>
      <div class="feature-item"><div class="feature-dot"></div>Работает офлайн</div>
    </div>
  </div>
  <div class="right-col">
    <div class="logo-card">
      ${markSvg}
    </div>
  </div>
</body>
</html>`;
renderHtml(htmlBanner, path.resolve(outputDir, '5_big_snippet_1120x630.png'), 1120, 630);

console.log('All VK branding images successfully rendered to:', outputDir);
